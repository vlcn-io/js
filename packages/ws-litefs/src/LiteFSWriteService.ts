import { Config, IDB, internal } from "@vlcn.io/ws-server";
import net from "net";
import {
  Err,
  CreateDbOnPrimary,
  CreateDbOnPrimaryResponse,
  ApplyChangesOnPrimary,
  Msg,
  Pong,
  decode,
  encode,
  tags,
} from "@vlcn.io/ws-common";
import DBCache from "@vlcn.io/ws-server/src/DBCache.js";
import { util } from "./internal/util.js";
import logger from "./logger.js";

/**
 * Represents a connection from the leader to a follower.
 */
class EstablishedConnection {
  #closed = false;
  readonly #conn;
  readonly #config;
  readonly #dbcache;
  // We must store the _promise_ such that entering DBs into the cache is synchronous.
  // Async management of the cache could cause a race of two people trying to insert the same entry.
  readonly #dbs = new Map<string, [number, Promise<IDB>]>();
  readonly #schemaNamesAndVersions = new Map<string, [string, bigint]>();
  readonly #intervalHandle;

  constructor(
    conn: net.Socket,
    config: Config,
    dbcache: InstanceType<typeof internal.DBCache>
  ) {
    logger.info(`Created EstablishedConnection for LiteFSWriteService`);
    this.#conn = conn;
    this.#config = config;
    this.#dbcache = dbcache;
    this.#intervalHandle = setInterval(this.#cleanupIdleDBs, 60_000);
    conn.on("data", this.#handleMessage);
    conn.on("close", this.close);
    conn.on("error", this.close);
  }

  #handleMessage = async (data: Buffer) => {
    if (this.#closed) {
      return;
    }

    const msg = decode(data);
    let ret: Msg | null = null;
    switch (msg._tag) {
      case tags.CreateDbOnPrimary:
        ret = await this.#createDb(msg.room, msg);
        break;
      case tags.ApplyChangesOnPrimary:
        ret = await this.#changesReceived(msg.room, msg, msg.newLastSeen);
        break;
      case tags.Ping:
        ret = this.#pingReceived();
        break;
      default:
        throw new Error(
          `Unexpected message type on forwarded write service: ${msg._tag}`
        );
    }

    if (ret == null) {
      throw new Error(
        `failed to generate a return value for msg type ${msg._tag}`
      );
    }
    this.#conn.write(encode(ret), (err?: Error) => {
      if (err) {
        console.error(err);
      }
    });
  };

  async #createDb(
    room: string,
    msg: CreateDbOnPrimary
  ): Promise<CreateDbOnPrimaryResponse | Err> {
    logger.info(`Create db for room "${room}" on primary`);
    this.#schemaNamesAndVersions.set(room, [msg.schemaName, msg.schemaVersion]);
    const dbEntry = this.#getDB(room);
    dbEntry[0] = Date.now();

    // ensure DB is fully created as it also applies a schema migration if required
    try {
      await dbEntry[1];
    } catch (e: any) {
      return {
        _tag: tags.Err,
        _reqid: msg._reqid,
        err: e.message,
      };
    }

    return {
      _tag: tags.CreateDbOnPrimaryResponse,
      _reqid: msg._reqid,
      txid: await util.getTxId(this.#config, room),
    };
  }

  async #changesReceived(
    room: string,
    msg: ApplyChangesOnPrimary,
    newLastSeen: readonly [bigint, number]
  ) {
    const dbEntry = this.#getDB(room);
    dbEntry[0] = Date.now();
    const db = await dbEntry[1];
    await db.applyChangesetAndSetLastSeen(msg.changes, msg.sender, newLastSeen);
    return {
      _tag: tags.ApplyChangesOnPrimaryResponse,
      _reqid: msg._reqid,
    };
  }

  #pingReceived(): Pong {
    return { _tag: tags.Pong };
  }

  #getDB(room: string) {
    let entry = this.#dbs.get(room);
    if (entry != null) {
      return entry;
    }

    const [schemaName, schemaVersion] = this.#schemaNamesAndVersions.get(room)!;
    let dbPromise = this.#dbcache.getAndRef(room, schemaName, schemaVersion);
    entry = [Date.now(), dbPromise];
    this.#dbs.set(room, entry);
    return entry;
  }

  #cleanupIdleDBs = () => {
    const now = Date.now();
    for (const [room, [lastUsed, _]] of this.#dbs.entries()) {
      if (now - lastUsed > 5 * 60_000) {
        this.#dbs.delete(room);
        try {
          this.#dbcache.unref(room);
        } catch (e) {
          console.error(e);
        }
      }
    }
  };

  close = () => {
    if (this.#closed) {
      return;
    }
    this.#closed = true;
    clearInterval(this.#intervalHandle);
    for (const [room, entry] of this.#dbs.entries()) {
      this.#dbs.delete(room);
      try {
        this.#dbcache.unref(room);
      } catch (e) {
        console.error(e);
      }
    }
    this.#conn.destroy();
    // do not destroy the db cache. It is shared with the overall process which is still valid
    // when we're downgraded from primary to follower.
  };

  __dbs_TESTS_ONLY() {
    return this.#dbs;
  }
}

/**
 * Creates a server that listens for forwarded writes.
 * This server is running on all leaders and followers. On followers it doesn't do anything
 * since nobody will connect to it. Once a follower is promoted, however, other followers
 * will begin moving their connections here.
 * @param config
 * @param dbcache
 */
export function createLiteFSWriteService(
  port: number,
  wsConfig: Config,
  dbcache: DBCache
): net.Server {
  const server = net.createServer();
  server.on("connection", (conn) => handleConnection(conn, wsConfig, dbcache));
  logger.info(`Starting LiteFSWriteService on ${port}`);
  server.listen(port, () => {
    logger.info(`LiteFSWriteService running on port ${port}`);
  });

  return server;
}

function handleConnection(conn: net.Socket, config: Config, dbcache: DBCache) {
  new EstablishedConnection(conn, config, dbcache);
}

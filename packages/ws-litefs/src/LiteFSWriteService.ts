import { Config, IDB, PresenceResponse, internal } from "@vlcn.io/ws-server";
import net from "net";
import {
  ForwardedAnnouncePresence,
  ForwardedChanges,
  decode,
  encode,
  tags,
} from "@vlcn.io/ws-common";
import DBCache from "@vlcn.io/ws-server/src/DBCache.js";
import { util } from "./internal/util.js";

export const port = 9000;

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
    switch (msg._tag) {
      case tags.ForwardedAnnouncePresence:
        await this.#presenceAnnounced(msg.room, msg);
        return;
      case tags.ForwardedChanges:
        await this.#changesReceived(msg.room, msg, msg.newLastSeen);
        return;
      case tags.Ping:
        this.#pingReceived();
        return;
      default:
        throw new Error(
          `Unexpected message type on forwarded write service: ${msg._tag}`
        );
    }
  };

  async #presenceAnnounced(
    room: string,
    msg: ForwardedAnnouncePresence
  ): Promise<PresenceResponse> {
    this.#schemaNamesAndVersions.set(room, [msg.schemaName, msg.schemaVersion]);
    const dbEntry = this.#getDB(room);
    dbEntry[0] = Date.now();

    // ensure DB is fully created as it also applies a schema migration if required
    try {
      await dbEntry[1];
    } catch (e: any) {
      return {
        err: e.message,
      };
    }

    return { txid: await util.getTxId(this.#config, room) };
  }

  async #changesReceived(
    room: string,
    msg: ForwardedChanges,
    newLastSeen: readonly [bigint, number]
  ) {
    const dbEntry = this.#getDB(room);
    dbEntry[0] = Date.now();
    const db = await dbEntry[1];
    await db.applyChangesetAndSetLastSeen(msg.changes, msg.sender, newLastSeen);
  }

  #pingReceived() {
    const cb = (err?: Error) => {
      if (err) {
        console.error(err);
      }
    };
    this.#conn.write(
      encode({
        _tag: tags.Pong,
      }),
      cb
    );
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
export function createLiteFSWriteService(config: Config, dbcache: DBCache) {
  const server = net.createServer();
  server.on("connection", (conn) => handleConnection(conn, config, dbcache));
  console.log(`Starting LiteFSWriteService on ${port}`);
  server.listen(port, () => {
    console.log(`LiteFSWriteService running on port ${port}`);
  });
}

function handleConnection(conn: net.Socket, config: Config, dbcache: DBCache) {
  new EstablishedConnection(conn, config, dbcache);
}

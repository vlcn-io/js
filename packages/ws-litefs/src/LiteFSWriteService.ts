import { Config, IDB, PresenceResponse, internal } from "@vlcn.io/ws-server";
import net from "net";
import { AnnouncePresence, Change, Changes } from "@vlcn.io/ws-common";
import fs from "fs";
import DBCache from "@vlcn.io/ws-server/src/DBCache.js";

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

  // Opens a port and listens for connections
  // This service will be alive even on followers to handle the case
  // where a follower is promoted.
  // If we are de-promoted we should tear down open connections.
  // ---
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

  #handleMessage = (data: Buffer) => {
    if (this.#closed) {
      return;
    }

    // - presence
    // - apply changes
    // - close a given room

    // decodes the binary-encoded message
    // processes it by passing it to #writer
  };

  async #presenceAnnounced(
    room: string,
    msg: AnnouncePresence
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

    const content = await fs.promises.readFile(
      internal.getDbPath(room, this.#config) + "-pos",
      { encoding: "utf-8" }
    );
    const [txidHex, _checksum] = content.split("/");

    if (txidHex.length != 16) {
      throw new Error("Unexpected txid length");
    }

    return { txid: BigInt("0x" + txidHex) };
  }

  async #changesReceived(
    room: string,
    msg: Changes,
    newLastSeen: readonly [bigint, number]
  ) {
    const dbEntry = this.#getDB(room);
    dbEntry[0] = Date.now();
    const db = await dbEntry[1];
    await db.applyChangesetAndSetLastSeen(msg.changes, msg.sender, newLastSeen);
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
  };
}

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

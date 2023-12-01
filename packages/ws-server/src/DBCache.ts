import { IDB, getResidentSchemaVersion } from "./DB.js";
import { IDBFactory } from "./DBFactory.js";
import { Config } from "./config.js";
import FSNotify from "./fs/FSNotify.js";
import { logger } from "@vlcn.io/logger-provider";

/**
 * Caches connections to active databases so we do not need to re-create the connection
 * on each request.
 *
 * Connection re-creation can be expensive due to the work required to setup sqlite + load extensions.
 */
export default class DBCache {
  readonly #dbs = new Map<string, [number, Promise<IDB>]>();
  readonly #config;
  readonly #fsnotify;
  readonly #dbFactory;

  constructor(
    config: Config,
    fsnotify: FSNotify | null,
    dbFactory: IDBFactory
  ) {
    this.#config = config;
    this.#fsnotify = fsnotify;
    this.#dbFactory = dbFactory;
  }

  __tests_only_checkRef(roomId: string): number {
    let ret = this.#dbs.get(roomId);
    if (ret == null) {
      return 0;
    }
    return ret[0];
  }

  async use(roomId: string, schemaName: string, cb: (db: IDB) => unknown) {
    const version = getResidentSchemaVersion(schemaName, this.#config);
    const db = await this.getAndRef(roomId, schemaName, version);
    try {
      await cb(db);
    } finally {
      this.unref(roomId);
    }
  }

  async getAndRef(roomId: string, schemaName: string, schemaVersion: bigint) {
    logger.info(`Get db from cache for room "${roomId}"`);
    let entry = this.#dbs.get(roomId);
    if (entry == null) {
      logger.info("calling db factory");
      const dbPromise = this.#dbFactory.createDB(
        this.#config,
        this.#fsnotify,
        roomId,
        schemaName,
        schemaVersion
      );
      entry = [1, dbPromise];
      this.#dbs.set(roomId, entry);
    } else {
      try {
        // set ref count before we await so a return of a db in an event loop
        // tick doesn't kill the db being created
        entry[0] += 1;
        const db = await entry[1];
        if (!db.schemasMatch(schemaName, schemaVersion)) {
          throw new Error(
            `Requested a schema name and version that the server does not have.`
          );
        } else {
          // TODO: note that this is not 100% accurate. We could be running an old schema version
          // in a cached db and use this as a trigger to tear down existing connections and upgrade the schema.
        }
      } catch (e) {
        this.unref(roomId);
        throw e;
      }
    }

    return entry[1];
  }

  async unref(roomId: string) {
    logger.info(`Remove db from cache for room "${roomId}"`);
    const entry = this.#dbs.get(roomId);
    if (entry == null) {
      throw new Error(
        `illegal state -- cannot find db cache entry for ${roomId}`
      );
    }

    entry[0] -= 1;
    if (entry[0] === 0) {
      this.#dbs.delete(roomId);
      const db = await entry[1];
      db.close();
    } else if (entry[0] < 0) {
      throw new Error(
        `illegal state -- ref count less than 0 for ${roomId}. Maybe closing threw?`
      );
    }
  }

  async destroy() {
    const promises: Promise<IDB>[] = [];
    for (const [ref, db] of this.#dbs.values()) {
      promises.push(db);
    }
    await Promise.all(
      promises.map(async (p) => {
        (await p).close();
      })
    );
    this.#dbs.clear();
  }
}

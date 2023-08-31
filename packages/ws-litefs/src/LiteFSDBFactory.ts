import { Config, IDBFactory } from "@vlcn.io/ws-server";
import { IDB, internal } from "@vlcn.io/ws-server";
import {
  PrimaryConnection,
  createPrimaryConnection,
} from "./internal/PrimaryConnection.js";
import { waitUntil } from "./internal/util.js";
import { Config as LiteFSConfig } from "./config.js";
import logger from "./logger.js";
import { LiteFSDB } from "./internal/LiteFSDB.js";

/**
 * A DBFactory on the follower or leader.
 * On the follower it will wait for the leader to create the DB before opening the DB locally.
 * On the leader, it'll just create the DB.
 */
export class LiteFSDBFactory implements IDBFactory {
  readonly #primaryConnection;
  constructor(primaryConnection: PrimaryConnection) {
    logger.info("creating LiteFSDBFactory");
    this.#primaryConnection = primaryConnection;
  }

  async createDB(
    config: Config,
    fsnotify: InstanceType<typeof internal.FSNotify> | null,
    room: string,
    schemaName: string,
    schemaVersion: bigint
  ): Promise<IDB> {
    if (fsnotify == null) {
      throw new Error(
        "LiteFS requires an FSNotify implementation. Set the db directory in your server config!"
      );
    }
    if (!this.#primaryConnection.isPrimary()) {
      logger.info(`ask priamry to create db for room "${room}"`);
      const response = await this.#primaryConnection.createDbOnPrimary(
        room,
        schemaName,
        schemaVersion
      );
      logger.info(`awaiting txid catchup creation for room "${room}"`);
      await waitUntil(config, room, response.txid, fsnotify!);
    }
    const proxied = new internal.DB(
      config,
      fsnotify,
      room,
      schemaName,
      schemaVersion
    );
    return new LiteFSDB(room, proxied, this.#primaryConnection);
  }
}

export async function createLiteFSDBFactory(litefsConfig: LiteFSConfig) {
  const primaryConnection = await createPrimaryConnection(litefsConfig);
  return new LiteFSDBFactory(primaryConnection);
}

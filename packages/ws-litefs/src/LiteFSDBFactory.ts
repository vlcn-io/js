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
  readonly #fsnotify;
  constructor(
    primaryConnection: PrimaryConnection,
    fsnotify: InstanceType<typeof internal.FSNotify>
  ) {
    this.#primaryConnection = primaryConnection;
    this.#fsnotify = fsnotify;
  }

  async createDB(
    config: Config,
    fsnotify: InstanceType<typeof internal.FSNotify> | null,
    room: string,
    schemaName: string,
    schemaVersion: bigint
  ): Promise<IDB> {
    if (!this.#primaryConnection.isPrimary()) {
      logger.info(`ask priamry to create db for room "${room}"`);
      const response = await this.#primaryConnection.createDbOnPrimary(
        room,
        schemaName,
        schemaVersion
      );
      logger.info("got promise from primary");
      await waitUntil(config, room, response.txid, this.#fsnotify);
      logger.info("waited for txid");
    }
    logger.info("creating internal db");
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

export async function createLiteFSDBFactory(
  litefsConfig: LiteFSConfig,
  fsnotify: InstanceType<typeof internal.FSNotify>
) {
  const primaryConnection = await createPrimaryConnection(litefsConfig);
  return new LiteFSDBFactory(primaryConnection, fsnotify);
}

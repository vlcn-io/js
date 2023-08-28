import { Config, IDBFactory } from "@vlcn.io/ws-server";
import { IDB, internal } from "@vlcn.io/ws-server";
import {
  PrimaryConnection,
  createPrimaryConnection,
} from "./internal/PrimaryConnection.js";
import { waitUntil } from "./internal/util.js";

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
      // If we are not primary then:
      // 1. Create the DB on the primary
      // 2. Get the TXID back
      // 3. Wait for our DB to match that txid
      const response = await this.#primaryConnection.createDbOnPrimary(
        room,
        schemaName,
        schemaVersion
      );
      await waitUntil(config, room, response.txid, this.#fsnotify);
    }
    return new internal.DB(config, fsnotify, room, schemaName, schemaVersion);
  }
}

export async function createLiteFSDBFactory(
  fsnotify: InstanceType<typeof internal.FSNotify>
) {
  const primaryConnection = await createPrimaryConnection();
  return new LiteFSDBFactory(primaryConnection, fsnotify);
}

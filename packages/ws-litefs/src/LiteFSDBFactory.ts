import { Config, IDBFactory } from "@vlcn.io/ws-server";
import { IDB, internal } from "@vlcn.io/ws-server";
import {
  PrimaryConnection,
  createPrimaryConnection,
} from "./internal/PrimaryConnection.js";

/**
 * A DBFactory on the follower or leader.
 * On the follower it will wait for the leader to create the DB before opening the DB locally.
 * On the leader, it'll just create the DB.
 */
export class LiteFSDBFactory implements IDBFactory {
  readonly #primaryConnection;
  constructor(primaryConnection: PrimaryConnection) {
    this.#primaryConnection = primaryConnection;
  }

  async createDB(
    config: Config,
    fsnotify: InstanceType<typeof internal.FSNotify> | null,
    room: string,
    schemaName: string,
    schemaVersion: bigint
  ): Promise<IDB> {
    if (!this.#primaryConnection.isPrimary()) {
      // create on primary
      // get txid back
      // await our file to catch up to that txid
      // return the db.
      this.#primaryConnection.createDbOnPrimary();
    } else {
      return new internal.DB(config, fsnotify, room, schemaName, schemaVersion);
    }
  }
}

export async function createLiteFSDBFactory() {
  const primaryConnection = await createPrimaryConnection();
  return new LiteFSDBFactory(primaryConnection);
}

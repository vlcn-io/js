import { Config, IDBFactory } from "@vlcn.io/ws-server";
import { IDB, internal } from "@vlcn.io/ws-server";
import {
  PrimaryConnection,
  createPrimaryConnection,
} from "./internal/PrimaryConnection.js";

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
    // Create a new internal db which we wrap with LiteFSDB.
    // LiteFSDB just forwards all calls to the proxy if we are on the primary node.
    // LiteFSDB redirects write requests to the primary if we're on a follower.
    // internal.DB
    throw new Error("unimplemented");
  }
}

export async function createLiteFSDBFactory() {
  const primaryConnection = await createPrimaryConnection();
  return new LiteFSDBFactory(primaryConnection);
}

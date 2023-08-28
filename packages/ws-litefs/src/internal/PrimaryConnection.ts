import { primaryFilePath, util } from "./util.js";
import chokidar from "chokidar";
import net from "net";
import { port } from "../LiteFSWriteService.js";
import { Change } from "@vlcn.io/ws-common";

// A connection from a follower to the primary.
// Follows the primary as it moves.
export class PrimaryConnection {
  readonly #watcher;
  #closed = false;
  #currentPrimary: string | null = null;
  #primarySocket: PrimarySocket | null = null;

  constructor(currentPrimary: string | null) {
    this.#currentPrimary = currentPrimary;
    this.#watcher = chokidar.watch(primaryFilePath, {
      followSymlinks: false,
      usePolling: false,
      interval: 100,
      binaryInterval: 300,
      ignoreInitial: false,
    });

    this.#watcher.on("add", this.#primaryFileCreatedOrRemoved);
    this.#watcher.on("unlink", this.#primaryFileCreatedOrRemoved);

    if (this.#currentPrimary != null) {
      this.#primarySocket = new PrimarySocket(this.#currentPrimary);
    }
  }

  isPrimary() {
    return this.#currentPrimary == null;
  }

  async applyChangesetAndSetLastSeen(
    changes: readonly Change[],
    siteId: Uint8Array,
    newLastSeen: readonly [bigint, number]
  ): Promise<void> {}

  // TODO: test when we only watch a single file and not a dir.
  #primaryFileCreatedOrRemoved = async (path: string) => {
    this.#currentPrimary = await util.readPrimaryFileIfExists();
  };

  close() {
    this.#closed = true;
    this.#watcher.close();
  }
}

class PrimarySocket {
  readonly #currentPrimaryHostname;
  readonly #socket;

  constructor(currentPrimaryHostname: string) {
    this.#currentPrimaryHostname = currentPrimaryHostname;
    this.#socket = new net.Socket();

    this.#socket.connect(port, this.#currentPrimaryHostname, this.#onConnected);
    this.#socket.on("data", this.#handleMessage);
    this.#socket.on("error", this.#onError);
    this.#socket.on("close", this.#onClose);
  }

  #onConnected = () => {};

  #handleMessage = (data: Buffer) => {
    // ping pong processing to re-establish connection that was broken for unknown reasons
  };
  #onError = () => {};
  #onClose = () => {};

  get currentPrimaryHostname() {
    return this.#currentPrimaryHostname;
  }

  close() {
    this.#socket.destroy();
  }
}

export async function createPrimaryConnection() {
  const currentPrimary = await util.readPrimaryFileIfExists();
  return new PrimaryConnection(currentPrimary);
}

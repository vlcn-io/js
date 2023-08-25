import { primaryFilePath } from "./util.js";
import chokidar from "chokidar";

// A connection from a follower to the primary.
// Follows the primary as it moves.
export class PrimaryConnection {
  readonly #watcher;
  #currentPrimary: string | null = null;

  constructor() {
    this.#watcher = chokidar.watch(primaryFilePath, {
      followSymlinks: false,
      usePolling: false,
      interval: 100,
      binaryInterval: 300,
      ignoreInitial: false,
    });

    this.#watcher.on("change", this.#fileChanged);
  }

  isPrimary() {
    return this.#currentPrimary == null;
  }

  // TODO: test when we only watch a single file and not a dir.
  #fileChanged = (paths: string[]) => {};
}

export async function createPrimaryConnection() {}

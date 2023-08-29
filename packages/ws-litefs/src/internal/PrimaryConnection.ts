import { util } from "./util.js";
import chokidar from "chokidar";
import {
  Change,
  CreateDbOnPrimaryResponse,
  ApplyChangesOnPrimaryResponse,
  tags,
} from "@vlcn.io/ws-common";
import { PrimarySocket } from "./PrimarySocket.js";
import path from "path";
import { Config } from "../config.js";

let nextRequestId = 0;

// A connection from a follower to the primary.
// Follows the primary as it moves.
export class PrimaryConnection {
  readonly #watcher;
  readonly #config;
  #closed = false;
  #currentPrimary: string | null = null;
  #primarySocket: PrimarySocket | null = null;
  #primaryListeners = new Set<(e: "primary" | "secondary") => void>();

  constructor(litefsConfig: Config, currentPrimary: string | null) {
    this.#currentPrimary = currentPrimary;
    this.#config = litefsConfig;
    this.#watcher = chokidar.watch(litefsConfig.primaryFileDir + ".primary", {
      followSymlinks: false,
      usePolling: false,
      interval: 10,
      binaryInterval: 50,
      ignoreInitial: false,
    });

    this.#watcher.on("add", this.#primaryFileCreatedOrRemoved);
    this.#watcher.on("unlink", this.#primaryFileCreatedOrRemoved);
    this.#watcher.on("addDir", this.#primaryFileCreatedOrRemoved);
    this.#watcher.on("change", this.#primaryFileCreatedOrRemoved);

    if (this.#currentPrimary != null) {
      this.#primarySocket = new PrimarySocket(
        litefsConfig,
        this.#currentPrimary,
        this.#onSocketPrematurelyClosed
      );
    }
  }

  isPrimary() {
    return this.#currentPrimary == null;
  }

  awaitPrimary() {
    return new Promise<void>((resolve) => {
      if (this.isPrimary()) {
        resolve();
        return;
      }

      const cb = (e: "primary" | "secondary") => {
        if (e == "primary") {
          resolve();
          dispose();
        }
      };
      const dispose = this.addPrimaryListener(cb);
    });
  }

  awaitSecondary() {
    return new Promise<void>((resolve) => {
      if (!this.isPrimary()) {
        resolve();
        return;
      }

      const cb = (e: "primary" | "secondary") => {
        if (e == "secondary") {
          resolve();
          dispose();
        }
      };
      const dispose = this.addPrimaryListener(cb);
    });
  }

  addPrimaryListener(cb: (e: "primary" | "secondary") => void) {
    this.#primaryListeners.add(cb);
    return () => {
      this.#primaryListeners.delete(cb);
    };
  }

  createDbOnPrimary(
    room: string,
    schemaName: string,
    schemaVersion: bigint
  ): Promise<CreateDbOnPrimaryResponse> {
    return this.#primarySocket!.sendCreateDb({
      _tag: tags.CreateDbOnPrimary,
      _reqid: nextRequestId++,
      room,
      schemaName,
      schemaVersion,
    });
  }

  applyChangesOnPrimary(
    room: string,
    changes: readonly Change[],
    siteId: Uint8Array,
    newLastSeen: readonly [bigint, number]
  ): Promise<ApplyChangesOnPrimaryResponse> {
    return this.#primarySocket!.sendApplyChanges({
      _tag: tags.ApplyChangesOnPrimary,
      _reqid: nextRequestId++,
      room,
      changes,
      sender: siteId,
      newLastSeen,
    });
  }

  // TODO: test when we only watch a single file and not a dir.
  #primaryFileCreatedOrRemoved = async (file: string) => {
    if (
      path.normalize(file) !=
      path.normalize(this.#config.primaryFileDir + this.#config.primaryFile)
    ) {
      return;
    }

    this.#currentPrimary = await util.readPrimaryFileIfExists(this.#config);

    if (this.#currentPrimary == this.#primarySocket?.currentPrimaryHostname) {
      return;
    }

    if (this.#currentPrimary == null) {
      this.#notifyPrimaryListeners("primary");
      if (this.#primarySocket != null) {
        this.#primarySocket.close();
      }

      return;
    }

    if (this.#primarySocket != null) {
      this.#primarySocket.close();
    }

    this.#notifyPrimaryListeners("secondary");
    this.#primarySocket = new PrimarySocket(
      this.#config,
      this.#currentPrimary,
      this.#onSocketPrematurelyClosed
    );
  };

  #notifyPrimaryListeners = (e: "primary" | "secondary") => {
    for (const cb of this.#primaryListeners) {
      cb(e);
    }
  };

  #onSocketPrematurelyClosed = () => {
    // recreate the socket
    if (this.#closed) {
      return;
    }
    this.#primarySocket?.close();
    if (this.#currentPrimary != null) {
      this.#primarySocket = new PrimarySocket(
        this.#config,
        this.#currentPrimary,
        this.#onSocketPrematurelyClosed
      );
    }
  };

  close() {
    this.#closed = true;
    this.#primarySocket?.close();
    this.#watcher.close();
  }
}

export async function createPrimaryConnection(litefsConfig: Config) {
  const currentPrimary = await util.readPrimaryFileIfExists(litefsConfig);
  return new PrimaryConnection(litefsConfig, currentPrimary);
}

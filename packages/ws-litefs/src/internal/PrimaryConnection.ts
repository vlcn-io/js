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
import { litefsPrimaryPath } from "../config.js";
import { Config } from "@vlcn.io/ws-server";

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
  #port;

  constructor(
    port: number,
    serverConfig: Config,
    currentPrimary: string | null
  ) {
    this.#port = port;
    this.#currentPrimary = currentPrimary;
    this.#config = serverConfig;
    this.#watcher = chokidar.watch(litefsPrimaryPath(serverConfig), {
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

    setTimeout(() => {
      this.#primaryFileCreatedOrRemoved(litefsPrimaryPath(serverConfig));
    }, 0);

    if (this.#currentPrimary != null) {
      this.#primarySocket = new PrimarySocket(
        port,
        this.#config.appName || null,
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

  writeOnPrimary(room: string, sql: string, params: unknown[]): Promise<void> {
    throw new Error("not implemented");
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
      path.normalize(this.#config.dbFolder + "/.primary")
    ) {
      return;
    }

    this.#currentPrimary = await util.readPrimaryFileIfExists(this.#config);

    if (this.#currentPrimary == this.#primarySocket?.currentPrimaryInstanceId) {
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
    this.#connect();
  };

  #notifyPrimaryListeners = (e: "primary" | "secondary") => {
    for (const cb of this.#primaryListeners) {
      cb(e);
    }
  };

  #reconnecting = false;
  #onSocketPrematurelyClosed = () => {
    // recreate the socket
    if (this.#closed) {
      return;
    }
    this.#primarySocket?.close();
    if (this.#currentPrimary != null) {
      this.#connect(1000);
    }
  };

  #connect(delay: number = 0) {
    if (this.#reconnecting) {
      return;
    }
    this.#reconnecting = true;
    const fn = () => {
      this.#reconnecting = false;
      if (this.#currentPrimary == null) {
        return;
      }
      this.#primarySocket = new PrimarySocket(
        this.#port,
        this.#config.appName || null,
        this.#currentPrimary,
        this.#onSocketPrematurelyClosed
      );
    };
    if (delay == 0) {
      fn();
    } else {
      setTimeout(fn, delay);
    }
  }

  close() {
    this.#closed = true;
    this.#primarySocket?.close();
    this.#watcher.close();
  }
}

export async function createPrimaryConnection(
  port: number,
  serverConfig: Config
) {
  const currentPrimary = await util.readPrimaryFileIfExists(serverConfig);
  return new PrimaryConnection(port, serverConfig, currentPrimary);
}

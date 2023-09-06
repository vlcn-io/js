import { Config } from "@vlcn.io/ws-server";
import logger from "./logger.js";
import fs from "fs";
import path from "path";
import { internal } from "@vlcn.io/ws-server";

/**
 * Custom FSNotification library to deal with LiteFS secondaries.
 */
export default class FSNotify {
  readonly #listeners = new Map<string, Set<() => void>>();
  #intervalHandle;
  #lastCheck = 0;
  #pollRunning = false;

  constructor(private readonly config: Config) {
    this.#intervalHandle = setInterval(() => {
      this.#findChanged();
    }, 100);
  }

  #findChanged = async () => {
    if (this.#pollRunning) {
      return;
    }
    this.#pollRunning = true;
    try {
      // 1. list files in the directory
      // 2. filter out files that do not end in `-pos`
      // 3. filter out files that are older than the last check
      // 4. notify listeners with the files that remain

      const dbfolder = this.config.dbFolder;
      if (dbfolder == null) {
        throw new Error(
          `FSNotify cannot be used with in-memory databases. dbFolder was null in your config which indicates you want an in-memory db.`
        );
      }

      const files = await fs.promises.readdir(dbfolder);
      const changed = files.filter((f) => f.endsWith("-pos"));
      const changedSinceLastCheck = changed.filter((f) => {
        const stat = fs.statSync(path.join(dbfolder, f));
        return stat.mtimeMs > this.#lastCheck;
      });
      this.#lastCheck = Date.now();
      if (changedSinceLastCheck.length > 0) {
        this.#notifyListeners(changedSinceLastCheck);
      }
    } finally {
      this.#pollRunning = false;
    }
  };

  #notifyListeners = (changed: string[]) => {
    for (const fname of changed) {
      const dbname = internal.fsUtil.fileEventNameToDbId(fname);
      logger.info(`Notifying of changes to ${dbname}`);
      const listeners = this.#listeners.get(dbname);
      if (listeners != null) {
        for (const listener of listeners) {
          try {
            listener();
          } catch (e) {
            console.error(e);
          }
        }
      }
    }
  };

  addListener(dbid: string, cb: () => void) {
    const listeners = this.#listeners.get(dbid);
    if (listeners == null) {
      this.#listeners.set(dbid, new Set([cb]));
    } else {
      listeners.add(cb);
    }

    // Fire an event on registration so state is sent out immediately.
    setTimeout(() => {
      cb();
    }, 0);

    return () => {
      this.removeListener(dbid, cb);
    };
  }

  removeListener(dbid: string, cb: () => void) {
    const listeners = this.#listeners.get(dbid);
    if (listeners != null) {
      listeners.delete(cb);
    }
  }

  shutdown() {
    // this.watcher.close();
    clearInterval(this.#intervalHandle);
  }
}

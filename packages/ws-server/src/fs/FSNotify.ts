import util from "./util.js";
import chokidar from "chokidar";
import path from "path";
import { Config } from "../config.js";
import { collect } from "./collapser.js";
import { logger } from "@vlcn.io/logger-provider";

/**
 * Notifies outbound streams of changes to the database file.
 *
 * These changes could be made by other connections, processes or even other regions when running on litefs.
 *
 * For litefs we can simply just watch `dbname-pos`
 */
export default class FSNotify {
  private readonly watcher: chokidar.FSWatcher;
  private readonly listeners = new Map<string, Set<() => void>>();
  private readonly fileChanged;

  constructor(private readonly config: Config) {
    const dbfolder = this.config.dbFolder;
    if (dbfolder == null) {
      throw new Error(
        `FSNotify cannot be used with in-memory databases. dbFolder was null in your config which indicates you want an in-memory db.`
      );
    }
    // If we're OSX, only watch poke files.
    let pat = this.config.dbFolder + path.sep;
    if (config.notifyPat) {
      pat += config.notifyPat;
    } else {
      pat += "*";
    }
    logger.info(`Watching ${pat} for changes`);
    this.watcher = chokidar.watch(pat, {
      followSymlinks: false,
      usePolling: false,
      interval: 25,
      binaryInterval: 300,
      ignoreInitial: true,
    });
    this.fileChanged = collect(
      config.notifyLatencyMs || 10,
      (paths: string[]) => {
        const dedupedDbids = new Set(
          paths.map((p) => util.fileEventNameToDbId(p))
        );
        for (const dbid of dedupedDbids) {
          logger.info(`Notifying of changes to ${dbid}`);
          const listeners = this.listeners.get(dbid);
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
      }
    );
    this.watcher.on("change", this.fileChanged);
  }

  addListener(dbid: string, cb: () => void) {
    const listeners = this.listeners.get(dbid);
    if (listeners == null) {
      this.listeners.set(dbid, new Set([cb]));
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
    const listeners = this.listeners.get(dbid);
    if (listeners != null) {
      listeners.delete(cb);
      if (listeners.size === 0) {
        this.listeners.delete(dbid);
      }
    }
  }

  __listeners_TESTS_ONLY() {
    return this.listeners;
  }

  shutdown() {
    this.watcher.close();
  }
}

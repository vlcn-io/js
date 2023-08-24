import util from "./util.js";
import chokidar from "chokidar";
import path from "path";
import { Config } from "../config.js";
import { collect } from "./collapser.js";

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
        `FSNotify cannot be used with in-memory databases. dbFolder was null in your config.`
      );
    }
    // If we're OSX, only watch poke files.
    // TODO: if we're LiteFS watch `-pos` files only.
    console.log("Pat:", this.config.dbFolder + "/*");
    this.watcher = chokidar.watch(this.config.dbFolder + path.sep + "*", {
      followSymlinks: false,
      usePolling: false,
      interval: 100,
      binaryInterval: 300,
      ignoreInitial: true,
    });
    this.fileChanged = collect(
      config.notifyLatencyMs || 50,
      (paths: string[]) => {
        const dedupedDbids = new Set(
          paths.map((p) => util.fileEventNameToDbId(p))
        );
        for (const dbid of dedupedDbids) {
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

  shutdown() {
    this.watcher.close();
  }
}

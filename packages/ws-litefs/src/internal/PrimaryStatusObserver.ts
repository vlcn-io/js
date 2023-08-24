import { Config } from "@vlcn.io/ws-server";
import chokidar from "chokidar";
import path from "path";

/**
 * This will observe the db directory for `-pos` files.
 *
 * ForwardedWriteReceivers will listen to this to tear things
 * down once they are no longer primaries.
 *
 * LiteFSWriteForwarder will watch this to decide if writes
 * should be forwarded. I.e., if the forwarder is running
 * on a follower.
 */
export default class PrimaryStatusObserver {
  #observers;

  constructor(config: Config) {
    this.#observers = new Map<string, Set<() => void>>();
    chokidar.watch(config.dbFolder + path.sep + "*-pos", {
      followSymlinks: false,
      usePolling: false,
      interval: 100,
      binaryInterval: 300,
      ignoreInitial: false,
    });
  }

  observe(room: string, cb: () => void) {}
}

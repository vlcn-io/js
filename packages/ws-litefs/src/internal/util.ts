import { Config, internal } from "@vlcn.io/ws-server";
import fs from "fs";
import { config } from "../config.js";

export const util = {
  async readPrimaryFileIfExists(): Promise<string | null> {
    console.log("READING: " + config.primaryFileDir + config.primaryFile);
    return fs.promises
      .readFile(config.primaryFileDir + config.primaryFile, {
        encoding: "utf-8",
      })
      .then((content) => {
        return content.split("\n")[0];
      })
      .catch((e) => {
        return null;
      });
  },

  async getTxId(config: Config, room: string) {
    const content = await fs.promises.readFile(
      internal.getDbPath(room, config) + "-pos",
      { encoding: "utf-8" }
    );
    const [txidHex, _checksum] = content.split("/");

    if (txidHex.length != 16) {
      throw new Error("Unexpected txid length");
    }

    return BigInt("0x" + txidHex);
  },
};

export function waitUntil(
  config: Config,
  room: string,
  txid: bigint,
  notifier: InstanceType<typeof internal.FSNotify>
) {
  return new Promise<void>((resolve, reject) => {
    const removeListener = notifier.addListener(room, async () => {
      try {
        const currentTxid = await util.getTxId(config, room);
        if (currentTxid >= txid) {
          removeListener();
          resolve();
        }
      } catch (e) {
        removeListener();
        reject(e);
      }
    });
  });
}

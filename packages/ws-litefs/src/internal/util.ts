import { Config, internal } from "@vlcn.io/ws-server";
import fs from "fs";

export let primaryFilePath = "/var/lib/litefs/.primary";

export const util = {
  async readPrimaryFileIfExists(): Promise<string | null> {
    return fs.promises
      .readFile(primaryFilePath, { encoding: "utf-8" })
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

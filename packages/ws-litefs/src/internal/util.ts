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
};

import path from "path";
import os from "os";
import fs from "fs";

const needsTouchHack = os.platform() === "darwin" || os.platform() === "win32";
const ex = {
  getTouchFilename(dbpath: string): string {
    return dbpath + ".touch";
  },

  fileEventNameToDbId(filename: string): string {
    return path.parse(filename).name;
  },

  needsTouchHack() {
    return needsTouchHack;
  },

  touchFile(dbpath: string): Promise<void> {
    if (!needsTouchHack) {
      throw new Error("Touch hack is only required for darwin and windows");
    }
    return fs.promises.open(ex.getTouchFilename(dbpath), "w").then((fd) => {
      return fd.close();
    });
  },
};

export default ex;

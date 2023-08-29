const port = 9000;
const primaryFileDir = "/var/lib/litefs/";
const primaryFile = ".primary";

export type Config = {
  port: number;
  primaryFileDir: string;
  primaryFile: string;
};

let assigned = false;
export function assign(cfg: Config) {
  if (assigned) {
    throw new Error("Try to assign config twice");
  }
  assigned = true;
  config = cfg;
}

export let config: Config = {
  port,
  primaryFileDir,
  primaryFile,
};

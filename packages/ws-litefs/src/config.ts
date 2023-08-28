const port = 9000;
const primaryFilePath = "/var/lib/litefs/.primary";

export type Config = {
  port: number;
  primaryFilePath: string;
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
  primaryFilePath,
};

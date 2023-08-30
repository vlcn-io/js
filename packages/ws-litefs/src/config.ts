import path from "path";
const port = 9000;
const primaryFileDir = "/var/lib/litefs/";
const primaryFile = ".primary";

export type Config = {
  port: number;
  primaryFileDir: string;
  primaryFile: string;
};

export const defaultConfig: Config = {
  port,
  primaryFileDir,
  primaryFile,
};

export function litefsPrimaryPath(config: Config) {
  return path.normalize(path.join(config.primaryFileDir, config.primaryFile));
}

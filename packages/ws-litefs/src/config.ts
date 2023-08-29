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

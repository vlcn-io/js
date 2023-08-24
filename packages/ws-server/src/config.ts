import { IWriteForwarder } from "./IWriteForwarder";

export const defaultConfig: Config = Object.freeze({
  dbFolder: "./dbs",
  schemaFolder: "./schemas",
  pathPattern: /\/vlcn-ws/,
  notifyLatencyMs: 50,
});

export type Config = Readonly<{
  dbFolder: string | null;
  schemaFolder: string;
  pathPattern: RegExp;
  notifyLatencyMs?: number;
  writeForwarder?: IWriteForwarder;
  writeForwarderPort?: number;
}>;

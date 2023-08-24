import DBFactory, { IDBFactory } from "./DBFactory.js";

export const defaultConfig: Config = Object.freeze({
  dbFolder: "./dbs",
  schemaFolder: "./schemas",
  pathPattern: /\/vlcn-ws/,
  notifyLatencyMs: 50,
  dbFactory: new DBFactory(),
});

export type Config = Readonly<{
  dbFolder: string | null;
  schemaFolder: string;
  pathPattern: RegExp;
  notifyLatencyMs?: number;
  dbFactory: IDBFactory;
}>;

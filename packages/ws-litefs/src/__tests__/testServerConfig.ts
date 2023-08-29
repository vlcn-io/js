import { Config } from "@vlcn.io/ws-server";

export const config = Object.freeze({
  dbFolder: "./test_fs/dbs",
  schemaFolder: "./test_fs/schemas",
  pathPattern: /\/vlcn-ws/,
  notifyLatencyMs: 50,
}) as Config;

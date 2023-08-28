import { Config } from "@vlcn.io/ws-server";
import { createLiteFSDBFactory } from "../LiteFSDBFactory.js";
import FSNotify from "@vlcn.io/ws-server/src/fs/FSNotify.js";

export async function createTestConfig(fsnotify: FSNotify): Promise<Config> {
  return Object.freeze({
    dbFolder: "./test_fs/dbs",
    schemaFolder: "./test_fs/schemas",
    pathPattern: /\/vlcn-ws/,
    notifyLatencyMs: 50,
  }) as Config;
}

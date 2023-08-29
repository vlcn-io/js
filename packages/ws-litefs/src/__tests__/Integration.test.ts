import { test, expect, vi } from "vitest";
import { createLiteFSWriteService } from "../LiteFSWriteService";

import { Config as LiteFSConfig } from "../config";
import { Config as ServerConfig } from "@vlcn.io/ws-server";
import { internal } from "@vlcn.io/ws-server";
import FSNotify from "@vlcn.io/ws-server/src/fs/FSNotify";
import { LiteFSDBFactory, createLiteFSDBFactory } from "../LiteFSDBFactory";
import fs from "fs";

const primaryLiteFSConfig: LiteFSConfig = {
  port: 9000,
  primaryFileDir: "./test_fs/dbs",
  primaryFile: ".primary",
};

const secondaryLiteFSConfig: LiteFSConfig = {
  port: 9001,
  primaryFileDir: "./test_fs2/dbs",
  primaryFile: ".primary",
};

const primaryServerConfig: ServerConfig = {
  dbFolder: "./test_fs/dbs",
  schemaFolder: "./test_fs/schemas",
  pathPattern: /\/sync/,
  notifyLatencyMs: 50,
};

const secondaryServerConfig: ServerConfig = {
  dbFolder: "./test_fs2/dbs",
  schemaFolder: "./test_fs2/schemas",
  pathPattern: /\/sync/,
  notifyLatencyMs: 50,
};

test("create primary and follower, create dbs and apply changes", async () => {
  const primary = await createServer(
    primaryLiteFSConfig,
    primaryServerConfig,
    true
  );
  const secondary = await createServer(
    secondaryLiteFSConfig,
    secondaryServerConfig,
    false
  );

  // Ask the secondary to create a DB
  // (stub out txid for primary db)
  // it should forward this request to the priamry
  // primary should make it
  // primary should send txid frin ois file
  // secondary should wait for its pos file to get there
  // secondary should then make its db
  // ---
  // then apply some writes
});

async function createServer(
  litefsConfig: LiteFSConfig,
  serverConfig: ServerConfig,
  isPrimary: boolean
) {
  await prepareFilesystem(litefsConfig, serverConfig, isPrimary);
  const fsnotify = new FSNotify(serverConfig);
  const dbfactory = await createLiteFSDBFactory(litefsConfig, fsnotify);
  const dbcache = new internal.DBCache(serverConfig, fsnotify, dbfactory);
  let litefsWriteService: ReturnType<typeof createLiteFSWriteService> | null =
    null;
  if (isPrimary) {
    litefsWriteService = createLiteFSWriteService(
      litefsConfig,
      serverConfig,
      dbcache
    );
  }

  return { dbcache, litefsWriteService: litefsWriteService };
}

async function prepareFilesystem(
  litefsConfig: LiteFSConfig,
  serverConfig: ServerConfig,
  isPrimary: boolean
) {
  fs.mkdirSync(serverConfig.dbFolder!, { recursive: true });
  fs.mkdirSync(serverConfig.schemaFolder!, { recursive: true });
  if (!isPrimary) {
    fs.writeFileSync(
      litefsConfig.primaryFileDir + litefsConfig.primaryFile,
      "localhost"
    );
  }
}

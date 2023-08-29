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

  // stub out pos file for primary
  fs.writeFileSync(
    primaryServerConfig.dbFolder + `/test-pos`,
    "0000000000000002/0"
  );

  // stub out schemas for both
  fs.writeFileSync(
    primaryServerConfig.schemaFolder + "/test",
    "CREATE TABLE foo (a);"
  );
  fs.writeFileSync(
    secondaryServerConfig.schemaFolder + "/test",
    "CREATE TABLE foo (a);"
  );

  const promise = secondary.dbcache.getAndRef(
    "test",
    "test",
    -6684781798511370605n
  );

  // promise won't be resolved till we catch up the txid
  fs.writeFileSync(
    secondaryServerConfig.dbFolder + `/test-pos`,
    "0000000000000002/0"
  );

  const db = await promise;

  // db should now exist!
  // check that the db file is there for the primary too
  fs.existsSync(primaryServerConfig.dbFolder + "/test");

  // now apply some changes
  await db.applyChangesetAndSetLastSeen(
    [["foo", new Uint8Array([1, 9, 1]), "b", 1, 1n, 1n, null, 1n, 0]],
    new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 1, 2, 3, 4, 5, 6]),
    [2n, 0]
  );
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

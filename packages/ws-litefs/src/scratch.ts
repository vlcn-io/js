import { createLiteFSWriteService } from "./LiteFSWriteService.js";

import { Config as ServerConfig } from "@vlcn.io/ws-server";
import { internal } from "@vlcn.io/ws-server";
import { createLiteFSDBFactory } from "./LiteFSDBFactory.js";
import fs from "fs";

const port = 9000;

async function createServer(serverConfig: ServerConfig, isPrimary: boolean) {
  await prepareFilesystem(serverConfig, isPrimary);
  const fsnotify = new internal.FSNotify(serverConfig);
  const dbfactory = await createLiteFSDBFactory(port, serverConfig);
  const dbcache = new internal.DBCache(serverConfig, fsnotify, dbfactory);
  let litefsWriteService: ReturnType<typeof createLiteFSWriteService> | null =
    null;
  if (isPrimary) {
    litefsWriteService = createLiteFSWriteService(port, serverConfig, dbcache);
  }

  return { dbcache, litefsWriteService: litefsWriteService };
}

async function prepareFilesystem(
  serverConfig: ServerConfig,
  isPrimary: boolean
) {
  fs.mkdirSync(serverConfig.dbFolder!, { recursive: true });
  fs.mkdirSync(serverConfig.schemaFolder!, { recursive: true });
  if (!isPrimary) {
    fs.writeFileSync(serverConfig.dbFolder + "/.primary", "localhost");
  }
}

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

async function run() {
  const primary = await createServer(primaryServerConfig, true);
  const secondary = await createServer(secondaryServerConfig, false);

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
  const schema =
    "CREATE TABLE foo (a primary key, b); SELECT crsql_as_crr('foo');";
  fs.writeFileSync(primaryServerConfig.schemaFolder + "/test", schema);
  fs.writeFileSync(secondaryServerConfig.schemaFolder + "/test", schema);

  console.log("getting db from secondary");
  const dbCreatePromise = secondary.dbcache.getAndRef(
    "test",
    "test",
    3921689337806705427n
  );

  // promise won't be resolved till we catch up the txid
  fs.writeFileSync(
    secondaryServerConfig.dbFolder + `/test-pos`,
    "0000000000000002/0"
  );
  console.log("wrote test-pos");

  const db = await dbCreatePromise;
  console.log("awaited db create promise");

  // db should now exist!
  // check that the db file is there for the primary too
  console.log("checking existence");
  console.log(db);
  // expect(fs.existsSync(primaryServerConfig.dbFolder + "/test")).toBe(true);
  // expect(fs.existsSync(secondaryServerConfig.dbFolder + "/test")).toBe(true);

  // now apply some changes
  const applyChangesPromise = db.applyChangesetAndSetLastSeen(
    [["foo", new Uint8Array([1, 9, 1]), "b", 1, 1n, 1n, null, 1n, 0]],
    new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 1, 2, 3, 4, 5, 6]),
    [2n, 0]
  );
  await applyChangesPromise;
}

await run();

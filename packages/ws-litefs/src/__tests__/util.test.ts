import { test, expect, afterAll } from "vitest";
import "./testLiteFSConfig.js";
import { config } from "./testServerConfig.js";
import { internal } from "@vlcn.io/ws-server";
import { util, waitUntil } from "../internal/util.js";
import fs from "fs";

test("reading txid", async () => {
  fs.mkdirSync("./test_fs/dbs", { recursive: true });
  fs.writeFileSync("./test_fs/dbs/test-pos", "0000000000000000/0");
  const txid = await util.getTxId(config, "test");
  expect(txid).toBe(0n);
  fs.writeFileSync(
    "./test_fs/dbs/test-pos",
    "00000000002df417/ce552e44f23fbbdd"
  );
  const txid2 = await util.getTxId(config, "test");
  expect(txid2).toBe(0x2df417n);

  // remove the dbs dir and contents
  fs.rmdirSync("./test_fs/dbs", { recursive: true });
});

test("wait until a given txid", async () => {
  fs.mkdirSync("./test_fs/dbs", { recursive: true });
  fs.writeFileSync("./test_fs/dbs/test-pos", "0000000000000000/0");
  const notifier = new internal.FSNotify(config);
  const promise = waitUntil(config, "test", 0x2df417n, notifier);
  fs.writeFileSync(
    "./test_fs/dbs/test-pos",
    "00000000002df417/ce552e44f23fbbdd"
  );
  await promise;
  // Just checking that we don't hang indefinitely on the promise above
  // as it should be notified when txid meets the desired value
  expect(true).toBe(true);
  fs.rmdirSync("./test_fs/dbs", { recursive: true });
});

test("wait until a given txid when the txid is already met", async () => {
  fs.mkdirSync("./test_fs/dbs", { recursive: true });
  fs.writeFileSync(
    "./test_fs/dbs/test-pos",
    "00000000002df417/ce552e44f23fbbdd"
  );
  const notifier = new internal.FSNotify(config);
  const promise = waitUntil(config, "test", 0x2df417n, notifier);
  await promise;
  // Just checking that we don't hang indefinitely on the promise above
  // as it should be notified when txid meets the desired value
  expect(true).toBe(true);
  fs.rmdirSync("./test_fs/dbs", { recursive: true });
});

test("when file does not exist until after we start awaiting it", async () => {
  fs.mkdirSync("./test_fs/dbs", { recursive: true });
  const notifier = new internal.FSNotify(config);
  const promise = waitUntil(config, "test", 0x2df417n, notifier);
  fs.writeFileSync(
    "./test_fs/dbs/test-pos",
    "00000000002df417/ce552e44f23fbbdd"
  );
  await promise;
  // Just checking that we don't hang indefinitely on the promise above
  // as it should be notified when txid meets the desired value
  expect(true).toBe(true);
  fs.rmdirSync("./test_fs/dbs", { recursive: true });
});

test("throwing inside waitUntil correctly cleans up listeners", () => {
  // we'll test this by writing an invalid txid
  fs.mkdirSync("./test_fs/dbs", { recursive: true });
  fs.writeFileSync("./test_fs/dbs/test-pos", "sdf/0");
  const notifier = new internal.FSNotify(config);
  const promise = waitUntil(config, "test", 0x2df417n, notifier);
  expect(promise).rejects.toThrow();
  fs.rmdirSync("./test_fs/dbs", { recursive: true });
});

test("read the primary file when it does not exist", async () => {
  try {
    fs.unlinkSync("./test_fs/.primary");
  } catch (e) {}

  const primary = await util.readPrimaryFileIfExists();
  expect(primary).toBe(null);
});

test("read the primary file when it does exist", async () => {
  fs.writeFileSync("./test_fs/.primary", "test");
  const primary = await util.readPrimaryFileIfExists();
  expect(primary).toBe("test");
  // remove the .primary file
  fs.unlinkSync("./test_fs/.primary");
});

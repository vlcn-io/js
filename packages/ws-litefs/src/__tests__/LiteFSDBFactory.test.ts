import { test, expect, vi, beforeAll } from "vitest";
import { LiteFSDBFactory } from "../LiteFSDBFactory";
import FSNotify from "@vlcn.io/ws-server/src/fs/FSNotify";
import { config } from "./testServerConfig.js";
import fs from "fs";
import { tags } from "@vlcn.io/ws-common";

beforeAll(() => {
  try {
    fs.rmSync("./test_fs/dbs", { recursive: true, force: true });
    fs.rmSync("./test_fs/schemas", { recursive: true, force: true });
  } catch (e) {}
});

test("forwards db create event to primary when follower", async () => {
  fs.mkdirSync("./test_fs/dbs", { recursive: true });
  fs.mkdirSync("./test_fs/schemas", { recursive: true });
  fs.writeFileSync("./test_fs/schemas/test", "CREATE TABLE foo (a);");

  const primaryConnection = {
    isPrimary: () => false,
    createDbOnPrimary: vi.fn().mockResolvedValue({
      _tag: tags.CreateDbOnPrimaryResponse,
      _reqid: 0,
      txid: 2n,
    }),
    applyChangesOnPrimary: vi.fn(),
    close: vi.fn(),
  };

  const factory = new LiteFSDBFactory(
    primaryConnection as any,
    new FSNotify(config)
  );

  const promise = factory.createDB(
    config,
    null,
    "test",
    "test",
    -6684781798511370605n
  );

  fs.writeFileSync("./test_fs/dbs/test-pos", "0000000000000002/0");
  await promise;
  expect(true).toBe(true);

  fs.rmdirSync("./test_fs/dbs", { recursive: true });
  fs.rmdirSync("./test_fs/schemas", { recursive: true });
});

test("awaits txid to catch up, after db creation, when follower", async () => {
  fs.mkdirSync("./test_fs/dbs", { recursive: true });
  fs.mkdirSync("./test_fs/schemas", { recursive: true });
  fs.writeFileSync("./test_fs/schemas/test", "CREATE TABLE foo (a);");

  const primaryConnection = {
    isPrimary: () => false,
    createDbOnPrimary: vi.fn().mockResolvedValue({
      _tag: tags.CreateDbOnPrimaryResponse,
      _reqid: 0,
      txid: 2n,
    }),
    applyChangesOnPrimary: vi.fn(),
    close: vi.fn(),
  };

  const factory = new LiteFSDBFactory(
    primaryConnection as any,
    new FSNotify(config)
  );

  const promise = factory.createDB(
    config,
    null,
    "test",
    "test",
    -6684781798511370605n
  );

  let resolved = false;
  promise.then(() => {
    resolved = true;
  });

  fs.writeFileSync("./test_fs/dbs/test-pos", "0000000000000001/0");
  await new Promise((resolve) => setTimeout(resolve, 100));
  expect(resolved).toBe(false);

  fs.writeFileSync("./test_fs/dbs/test-pos", "0000000000000005/0");
  await promise;
  expect(resolved).toBe(true);

  fs.rmdirSync("./test_fs/dbs", { recursive: true });
  fs.rmdirSync("./test_fs/schemas", { recursive: true });
});

test("No waiting for txid when primary", async () => {
  fs.mkdirSync("./test_fs/dbs", { recursive: true });
  fs.mkdirSync("./test_fs/schemas", { recursive: true });
  fs.writeFileSync("./test_fs/schemas/test", "CREATE TABLE foo (a);");

  const primaryConnection = {
    isPrimary: () => true,
    createDbOnPrimary: vi.fn().mockRejectedValue("Should not be called"),
    applyChangesOnPrimary: vi.fn(),
    close: vi.fn(),
  };

  const factory = new LiteFSDBFactory(
    primaryConnection as any,
    new FSNotify(config)
  );

  const promise = factory.createDB(
    config,
    null,
    "test",
    "test",
    -6684781798511370605n
  );
  let resolved = false;
  promise.then(() => {
    resolved = true;
  });

  // promise should be resolved immediately and without any txid writes
  // since we were primary
  await new Promise((resolve) => setTimeout(resolve, 1));
  expect(resolved).toBe(true);

  fs.rmdirSync("./test_fs/dbs", { recursive: true });
  fs.rmdirSync("./test_fs/schemas", { recursive: true });
});

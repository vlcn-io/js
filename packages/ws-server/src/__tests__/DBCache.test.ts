import { test, expect } from "vitest";
import DBCache from "../DBCache.js";
import { config, schemaVersion } from "./testConfig.js";

test("same instance returned", async () => {
  const cache = new DBCache(config, null);
  const db1 = await cache.getAndRef("some-db", "test.sql", schemaVersion);
  const dbShouldBe1 = await cache.getAndRef(
    "some-db",
    "test.sql",
    schemaVersion
  );

  expect(db1).toBe(dbShouldBe1);
});

test("Multiple concurrent requests for the same db return a single db", async () => {
  const cache = new DBCache(config, null);
  const db1 = cache.getAndRef("some-db", "test.sql", schemaVersion);
  const dbShouldBe1 = cache.getAndRef("some-db", "test.sql", schemaVersion);
  const dbAlsoBe1 = cache.getAndRef("some-db", "test.sql", schemaVersion);

  await db1;
  expect(await db1).toBe(await dbShouldBe1);
  expect(await dbShouldBe1).toBe(await dbAlsoBe1);
});

test("maps different rooms to different instances", async () => {
  const cache = new DBCache(config, null);
  const db1 = await cache.getAndRef("some-db", "test.sql", schemaVersion);
  const db2 = await cache.getAndRef("some-db2", "test.sql", schemaVersion);

  expect(db1).not.equals(db2);
});

test("returning a db while someone is grabbing the db results in a correct ref count", async () => {
  const cache = new DBCache(config, null);
  const db1 = await cache.getAndRef("some-db", "test.sql", schemaVersion);

  // no await such that the grab is in-progress and not complete till next micro task
  const alsoDb1 = cache.getAndRef("some-db", "test.sql", schemaVersion);

  // return db1 while the prior get is still unresolved
  cache.unref("some-db");
  // even though first take did not complete yet the ref count is correct
  expect(cache.__tests_only_checkRef("some-db")).toEqual(1);

  await alsoDb1;
  expect(cache.__tests_only_checkRef("some-db")).toEqual(1);

  cache.unref("some-db");
  expect(cache.__tests_only_checkRef("some-db")).toEqual(0);
});

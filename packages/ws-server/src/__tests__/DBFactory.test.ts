import { test, expect } from "vitest";
import DB from "../DB.js";
import fs from "node:fs";
import { Config } from "../config.js";
import { cryb64 } from "@vlcn.io/ws-common";
import DBFactory from "../DBFactory.js";

test("db instantiation", async () => {
  const config: Config = {
    schemaFolder: "./testSchemas",
    dbFolder: null,
    pathPattern: /\/vlcn-ws/,
  };

  const schemaContent = fs.readFileSync("./testSchemas/test.sql", "utf-8");
  const schemaVersion = cryb64(schemaContent);
  const factory = new DBFactory();
  const db = await factory.createDB(
    config,
    null,
    "some-db",
    "test.sql",
    schemaVersion
  );
  expect(db).toBeDefined();
  db.close();
});

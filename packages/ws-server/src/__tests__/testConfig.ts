import { cryb64 } from "@vlcn.io/ws-common";
import DBFactory from "../DBFactory.js";
import { Config } from "../config.js";

export const config: Config = {
  schemaFolder: "./testSchemas",
  dbFolder: null,
  pathPattern: /\/vlcn-ws/,
  dbFactory: new DBFactory(),
};

import fs from "node:fs";

export const schemaContent = fs.readFileSync("./testSchemas/test.sql", "utf-8");
export const schemaVersion = cryb64(schemaContent);

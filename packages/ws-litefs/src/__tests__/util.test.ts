import { test, expect } from "vitest";
import "./testLiteFSConfig.js";
import { createTestConfig } from "./testServerConfig.js";
import { internal } from "@vlcn.io/ws-server";

// const fsnotify = new internal.FSNotify();
// const config = createTestConfig();
test("reading txid", () => {});

test("wait until a given txid", () => {});

test("throwing inside waitUntil correctly cleans up listeners", () => {});

test("read the primary file when it does not exist", () => {});

test("read the primary file when it does exist", () => {});

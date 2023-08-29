import { litefsConfig } from "../../__tests__/testLiteFSConfig.js";
import { test, expect } from "vitest";
import { createPrimaryConnection } from "../PrimaryConnection.js";
import fs from "fs";
import net from "net";

test("Returns that it is the primary if the primary file is missing on construction", async () => {
  try {
    fs.rmSync("./test_fs/.primary");
  } catch (e) {}

  const c = await createPrimaryConnection(litefsConfig);
  expect(c.isPrimary()).toBe(true);
  c.close();
});

test("Upgrades self to primary if the primary file exists at construction and is later removed", async () => {
  fs.writeFileSync("./test_fs/.primary", "test");
  const c = await createPrimaryConnection(litefsConfig);
  expect(c.isPrimary()).toBe(false);
  fs.rmSync("./test_fs/.primary");
  await c.awaitPrimary();
  expect(c.isPrimary()).toBe(true);
  c.close();
});

test("Downgrades self to follower if the primary file is removed post-construction", async () => {
  try {
    fs.rmSync("./test_fs/.primary");
  } catch (e) {}

  const c = await createPrimaryConnection(litefsConfig);
  expect(c.isPrimary()).toBe(true);

  fs.writeFileSync("./test_fs/.primary", "test");
  await c.awaitSecondary();
  expect(c.isPrimary()).toBe(false);
  fs.rmSync("./test_fs/.primary");
  c.close();
});

test("Swaps connection when primary changes", async () => {
  try {
    fs.rmSync("./test_fs/.primary");
  } catch (e) {}
  const server = net.createServer();
  let receivedConn = 0;
  let receivedClose = 0;

  let resolveReceive: () => void;
  const receivePromise = new Promise<void>((resolve) => {
    resolveReceive = resolve;
  });
  let resolveClose: () => void;
  const closePromise = new Promise<void>((resolve) => {
    resolveClose = resolve;
  });
  server.on("connection", (socket) => {
    receivedConn += 1;
    resolveReceive();
    socket.on("close", () => {
      receivedClose += 1;
      resolveClose();
    });
  });
  server.listen(9000, "localhost");

  fs.writeFileSync("./test_fs/.primary", "localhost");
  const c = await createPrimaryConnection(litefsConfig);
  await receivePromise;
  expect(receivedConn).toBe(1);
  expect(receivedClose).toBe(0);
  fs.writeFileSync("./test_fs/.primary", "127.0.0.1");
  await closePromise;
  // await new Promise((resolve) => setTimeout(resolve, 100));
  // expect(receivedConn).toBe(2);
  expect(receivedClose).toBe(1);
  c.close();
  await new Promise<void>((resolve) => {
    server.close(() => resolve());
  });
  await new Promise((resolve) => setTimeout(resolve, 100));
});

test("destroys connection when made primary", async () => {
  try {
    fs.rmSync("./test_fs/.primary");
  } catch (e) {}
  const server = net.createServer();
  let receivedConn = 0;
  let receivedClose = 0;
  server.on("connection", (socket) => {
    receivedConn += 1;
    socket.on("close", () => {
      receivedClose += 1;
    });
  });
  server.listen(9000, "localhost");

  fs.writeFileSync("./test_fs/.primary", "localhost");
  const c = await createPrimaryConnection(litefsConfig);
  await new Promise((resolve) => setTimeout(resolve, 100));
  expect(receivedConn).toBe(1);
  expect(receivedClose).toBe(0);
  console.log("swapping");
  fs.rmSync("./test_fs/.primary");
  await new Promise((resolve) => setTimeout(resolve, 100));
  expect(receivedConn).toBe(1);
  expect(receivedClose).toBe(1);
  c.close();
  await new Promise<void>((resolve) => {
    server.close(() => resolve());
  });
});

import "../../__tests__/testLiteFSConfig.js";
import { test, expect, afterAll } from "vitest";
import { createPrimaryConnection } from "../PrimaryConnection";
import fs from "fs";
import net from "net";

// test("Returns that it is the primary if the primary file is missing on construction", async () => {
//   try {
//     fs.rmSync("./test_fs/.primary");
//   } catch (e) {}

//   const c = await createPrimaryConnection();
//   expect(c.isPrimary()).toBe(true);
//   c.close();
// });

// test("Upgrades self to primary if the primary file exists at construction and is later removed", async () => {
//   fs.writeFileSync("./test_fs/.primary", "test");
//   const c = await createPrimaryConnection();
//   expect(c.isPrimary()).toBe(false);
//   fs.rmSync("./test_fs/.primary");
//   await new Promise((resolve) => setTimeout(resolve, 300));
//   expect(c.isPrimary()).toBe(true);
//   c.close();
// });

test("Downgrades self to follower if the primary file is removed post-construction", async () => {
  try {
    fs.rmSync("./test_fs/.primary");
  } catch (e) {}

  const c = await createPrimaryConnection();
  expect(c.isPrimary()).toBe(true);

  fs.writeFileSync("./test_fs/.primary", "test");
  await new Promise((resolve) => setTimeout(resolve, 300));
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
  server.on("connection", (socket) => {
    receivedConn += 1;
    socket.on("close", () => {
      receivedClose += 1;
    });
  });
  server.listen(9000, "localhost");

  fs.writeFileSync("./test_fs/.primary", "localhost");
  const c = await createPrimaryConnection();
  await new Promise((resolve) => setTimeout(resolve, 100));
  expect(receivedConn).toBe(1);
  expect(receivedClose).toBe(0);
  fs.writeFileSync("./test_fs/.primary", "127.0.0.1");
  await new Promise((resolve) => setTimeout(resolve, 100));
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
  const c = await createPrimaryConnection();
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

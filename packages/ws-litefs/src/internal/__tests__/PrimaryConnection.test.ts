import "../../__tests__/testLiteFSConfig.js";
import { test, expect } from "vitest";
import { createPrimaryConnection } from "../PrimaryConnection";
import fs from "fs";

test("Returns that it is the primary if the primary file is missing", async () => {
  const c = await createPrimaryConnection();
  expect(c.isPrimary()).toBe(true);

  fs.writeFileSync("./test_fs/.primary", "test");
  await new Promise((resolve) => setTimeout(resolve, 500));
  expect(c.isPrimary()).toBe(false);
});

test("Upgrades self to primary if the primary file exists at construction", () => {});

test("Upgrades self to primary if the primary file is created post-construction", () => {});

test("Downgrades self to follower if the primary file is removed post-construction", () => {});

test("Swaps connection when primary changes", () => {});

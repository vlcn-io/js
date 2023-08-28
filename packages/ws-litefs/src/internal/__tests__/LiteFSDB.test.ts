import { test, expect } from "vitest";

test("Always delegates to proxy when primary", () => {});

test("Always delegates writes to primary connection when follower", () => {});

test("Reads go to proxy when not primary", () => {});

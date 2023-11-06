import { test, expect } from "vitest";
import { parseSecHeader } from "..";

test("pullSecHeaders", () => {
  function encode(options: { authToken?: string; room: string }) {
    return btoa(
      `${options.authToken != null ? `auth=${options.authToken},` : ""}room=${
        options.room
      }`
    ).replaceAll("=", "");
  }

  let parsed = parseSecHeader(encode({ room: "test" }));
  expect(parsed.room).toBe("test");
  expect(parsed.auth).toBeUndefined();

  parsed = parseSecHeader(encode({ room: "test", authToken: "123" }));
  expect(parsed.room).toBe("test");
  expect(parsed.auth).toBe("123");
});

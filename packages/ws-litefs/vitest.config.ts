import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // litefs tests are run sequentially given they all make use of a shared directory
    maxThreads: 1,
    minThreads: 1,
  },
});

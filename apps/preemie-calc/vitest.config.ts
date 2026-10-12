import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

// tests/unit/** 만 잡는다. tests/e2e 는 Playwright 전용이라 제외한다.
// tsconfig 의 "@/*" -> "src/*" alias 를 vite 의 resolve.alias 로 맞춘다.
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    include: ["tests/unit/**/*.test.ts"],
    exclude: ["tests/e2e/**", "node_modules/**"],
  },
});

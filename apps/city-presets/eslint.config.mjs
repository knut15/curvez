import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/**
 * 층 경계를 아직 걸지 않는다. 화면이 하나뿐이라 가를 층이 없다.
 * 코드가 층을 나눌 만큼 늘면 `apps/handwork/eslint.config.mjs` 의 규칙을 가져온다.
 */
export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

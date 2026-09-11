import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/**
 * 이 앱에는 FSD 층 경계를 걸지 않는다. 문서 사이트라 도메인이 없고, 층을 가를 만큼
 * 코드가 많아지면 그때 `apps/handwork/eslint.config.mjs` 의 규칙을 가져온다.
 */
export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

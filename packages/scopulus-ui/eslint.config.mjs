import { defineConfig, globalIgnores } from "eslint/config";
import base from "@curvez/eslint-config/base";

/**
 * 라이브러리에는 FSD 층 경계가 없다. 층이 하나(`src/ui`)뿐이라 가를 것이 없다.
 * 앱 쪽 경계 규칙은 각 앱의 `eslint.config.mjs` 가 갖는다.
 */
export default defineConfig([
  ...base,
  globalIgnores(["storybook-static/**", "node_modules/**"]),
]);

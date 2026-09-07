import js from "@eslint/js";
import globals from "globals";

/**
 * 노드에서 도는 `.mjs` 스크립트용 기본 설정.
 *
 * 프레임워크 규칙은 넣지 않는다 — 앱은 자기 프레임워크의 설정(예: eslint-config-next)을
 * 얹고, 그 플러그인은 앱의 eslint 버전에 묶인다. 여기에 섞으면 워크스페이스마다 다른
 * eslint 메이저를 쓸 수 없게 된다.
 */
export const base = [
  {
    files: ["**/*.mjs"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.node,
    },
    rules: js.configs.recommended.rules,
  },
];

export default base;

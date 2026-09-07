import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// FSD 층 경계. 규칙 ID 와 근거는 `.curvez/architecture.md` 의 `## 금지 import` 가 정본이고,
// 여기서는 그 표를 실행 가능한 형태로 옮기기만 한다. 표를 고치면 여기도 함께 고친다.
//
// 의존 방향: app → views → widgets → features → entities → shared (한 방향)

// ARCH-005 — 두 단계 이상 올라가는 상대 경로는 층 경계를 우회한다.
const DEEP_RELATIVE = {
  group: ["../../*"],
  message:
    "ARCH-005: 두 단계 이상 올라가는 상대 경로를 쓰지 않는다. `@/<층>` 이나 패키지 이름으로 부른다.",
};

const LAYER_RULES = [
  ["ARCH-001", "shared", ["app", "views", "widgets", "features", "entities"]],
  ["ARCH-002", "entities", ["app", "views", "widgets", "features"]],
  ["ARCH-003", "features", ["app", "views", "widgets"]],
  ["ARCH-004", "widgets", ["app", "views"]],
];

// flat config 는 뒤에 오는 블록이 같은 규칙을 통째로 덮는다. 그래서 층 블록마다
// DEEP_RELATIVE 를 함께 넣는다 — 빼면 층 파일에서 ARCH-005 가 조용히 꺼진다.
const layerBoundaries = LAYER_RULES.map(([id, layer, forbidden]) => ({
  files: [`src/${layer}/**/*.{ts,tsx,js,jsx}`],
  rules: {
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          DEEP_RELATIVE,
          ...forbidden.map((target) => ({
            group: [`@/${target}`, `@/${target}/*`],
            message: `${id}: ${layer} 는 ${target} 를 import 하지 않는다. 의존은 안쪽으로만 흐른다.`,
          })),
        ],
      },
    ],
  },
}));

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/**/*.{ts,tsx,js,jsx}"],
    rules: {
      "no-restricted-imports": ["error", { patterns: [DEEP_RELATIVE] }],
    },
  },
  ...layerBoundaries,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;

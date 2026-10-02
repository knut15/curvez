import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// FSD 층 경계. 규칙 ID 와 근거는 `.curvez/architecture.md` 의
// `### preemie-calc 금지 import` 가 정본이고, 여기서는 그 표를 실행 가능한 형태로 옮기기만 한다.
// 표를 고치면 여기도 함께 고친다.
//
// 의존 방향: app → views → widgets → features → entities → shared (한 방향)

// ARCH-105 — 두 단계 이상 올라가는 상대 경로는 층 경계를 우회한다.
const DEEP_RELATIVE = {
  group: ["../../*"],
  message:
    "ARCH-105: 두 단계 이상 올라가는 상대 경로를 쓰지 않는다. `@/<층>` 이나 패키지 이름으로 부른다.",
};

// ARCH-106 — 앱끼리 코드를 직접 나누면 한 앱을 고칠 때 다른 앱이 깨진다.
const NO_HANDWORK = {
  group: ["**/handwork", "**/handwork/*", "handwork", "handwork/*"],
  message:
    "ARCH-106: apps/handwork 코드를 직접 부르지 않는다. 함께 쓸 것은 packages/* 로 올린다.",
};

// ARCH-107 — 기준 데이터는 그 슬라이스의 model 만 읽는다.
const NO_ENTITY_DATA = {
  group: ["@/entities/*/data/*"],
  message:
    "ARCH-107: 기준 데이터(data/)는 그 슬라이스 밖에서 직접 읽지 않는다. model 의 공개 API 를 쓴다.",
};

const LAYER_RULES = [
  ["ARCH-101", "shared", ["app", "views", "widgets", "features", "entities"]],
  ["ARCH-102", "entities", ["app", "views", "widgets", "features"]],
  ["ARCH-103", "features", ["app", "views", "widgets"]],
  ["ARCH-104", "widgets", ["app", "views"]],
];

// flat config 는 뒤에 오는 블록이 같은 규칙을 통째로 덮는다. 그래서 층 블록마다
// 공통 패턴을 함께 넣는다 — 빼면 층 파일에서 그 규칙이 조용히 꺼진다.
const layerBoundaries = LAYER_RULES.map(([id, layer, forbidden]) => ({
  files: [`src/${layer}/**/*.{ts,tsx,js,jsx}`],
  rules: {
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          DEEP_RELATIVE,
          NO_HANDWORK,
          NO_ENTITY_DATA,
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
      "no-restricted-imports": [
        "error",
        { patterns: [DEEP_RELATIVE, NO_HANDWORK, NO_ENTITY_DATA] },
      ],
    },
  },
  ...layerBoundaries,
  // Override default ignores of eslint-config-next.
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;

# 계층 규칙을 lint 로 강제하기

`ddd` 프리셋의 `## 금지 import` 표를 ESLint 설정으로 옮기는 방법이다.
아키텍처를 확정한 직후, 코드를 쓰기 전에 이 파일을 열어 `eslint.config.mjs` 를 만든다.

---

## 왜 grep 이 아니라 lint 인가

`.curvez/architecture.md` 의 `ARCH-NNN` 표는 **감사용**이다. 정규식 문자열 매칭이라
주석 안의 import 를 세고, 줄바꿈된 import 를 놓치고, 동적 `import()` 를 못 본다.

lint 는 **강제용**이다. ESLint 가 실제 import 구문을 파싱하므로 우회가 어렵고,
위반이 편집 시점에 에디터에 뜨며, CI 에서 빌드를 막는다.

|        | ARCH 표 (grep)           | ESLint              |
| ------ | ------------------------ | ------------------- |
| 언제   | 감사·리뷰 시점           | 편집 시점, 커밋, CI |
| 정확도 | 문자열 매칭              | 구문 파싱           |
| 역할   | 규칙이 무엇인지 **선언** | 규칙을 **집행**     |

**둘 다 둔다.** ARCH 표는 사람과 에이전트가 읽는 규칙의 정본이고, lint 는 그 집행기다.
lint 설정이 없는 초기 단계나 ESLint 를 안 쓰는 프로젝트에서는 grep 검사가 유일한 방어선이다.

---

## 단일 컨텍스트 설정

`src/{domain,application,infrastructure,presentation}` 구조일 때다.

```js
// eslint.config.mjs
import { defineConfig } from "eslint/config";

/** 위반 메시지. 무엇을 어디로 옮기라는 지시까지 담는다. */
const MSG = {
  domainNoFramework:
    "domain 은 프레임워크를 모른다. React·Next·RN·상태 라이브러리가 필요하면 presentation 이나 infrastructure 로 옮겨라.",
  domainNoOuter:
    "domain 이 바깥 레이어를 참조한다. 의존은 안쪽으로만 흐른다. 필요한 것은 인터페이스로 선언하고 주입받아라.",
  domainNoIO:
    "domain 이 I/O 를 직접 부른다. fetch·DB·파일시스템은 infrastructure 의 몫이다. 포트로 선언하고 구현을 주입받아라.",
  applicationNoInfra:
    "application 은 구현체를 모른다. 필요한 것을 ports 에 인터페이스로 선언하고 주입받아라.",
  presentationNoInfra:
    "presentation 은 infrastructure 를 직접 쓰지 않는다. 유스케이스를 통해라.",
  infraNoPresentation:
    "infrastructure 가 화면을 참조한다. 의존이 바깥에서 바깥으로 흐르고 있다.",
  noParentRelative:
    "상위로 올라가는 상대 경로를 쓰지 않는다. 경로 별칭 @/ 로 적어라 — 파일을 옮겨도 경로가 유지되고, 어느 레이어를 참조하는지 한눈에 보인다. 같은 폴더의 './x' 는 허용한다.",
};

/**
 * 상위로 올라가는 상대 경로. 모든 레이어에 공통으로 적용한다.
 *
 * 한 단계(`../x`)도 막는 이유: 경로만 보고는 어느 레이어를 참조하는지 알 수 없고,
 * 파일을 옮기면 전부 깨진다.
 */
const PARENT_RELATIVE = {
  group: ["../*", "../../*", "../../../*", "../../../../*"],
  message: MSG.noParentRelative,
};

/** 프레임워크·상태 라이브러리. domain 과 application 이 모르는 것들. */
const FRAMEWORK = [
  "react",
  "react/*",
  "react-dom",
  "react-dom/*",
  "next",
  "next/*",
  "react-native",
  "react-native/*",
  "expo",
  "expo-*",
  "@react-navigation/*",
  "zustand",
  "zustand/*",
  "jotai",
  "recoil",
  "redux",
  "@reduxjs/*",
  "@tanstack/react-query",
];

/** I/O — domain 이 직접 부르면 단위 테스트가 통합 테스트가 된다. */
const IO_MODULES = [
  "node:fs",
  "node:fs/promises",
  "node:path",
  "node:http",
  "node:https",
  "node:child_process",
  "fs",
  "path",
  "http",
  "https",
  "@prisma/client",
  "prisma",
  "drizzle-orm",
  "drizzle-orm/*",
  "typeorm",
  "mongoose",
  "mongodb",
  "pg",
  "mysql2",
  "redis",
  "ioredis",
  "axios",
  "ky",
  "got",
];

/**
 * no-restricted-imports 규칙을 만든다.
 *
 * 빈 group 을 버리는 이유: 가장 안쪽 레이어는 금지 목록이 비는 경우가 있는데,
 * 빈 배열을 넘기면 ESLint 가 설정 스키마 오류로 죽는다.
 */
function restrict(...groups) {
  const patterns = [...groups, PARENT_RELATIVE].filter(
    (g) => g.group.length > 0,
  );
  return ["error", { patterns }];
}

const layerRules = [
  {
    files: ["src/domain/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": restrict(
        { group: FRAMEWORK, message: MSG.domainNoFramework },
        { group: IO_MODULES, message: MSG.domainNoIO },
        {
          group: [
            "@/application/**",
            "@/infrastructure/**",
            "@/presentation/**",
            "@/app/**",
          ],
          message: MSG.domainNoOuter,
        },
      ),
    },
  },
  {
    files: ["src/application/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": restrict(
        { group: FRAMEWORK, message: MSG.domainNoFramework },
        {
          group: ["@/infrastructure/**", "@/presentation/**", "@/app/**"],
          message: MSG.applicationNoInfra,
        },
      ),
    },
  },
  {
    files: ["src/infrastructure/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": restrict({
        group: ["@/presentation/**", "@/app/**"],
        message: MSG.infraNoPresentation,
      }),
    },
  },
  {
    files: ["src/presentation/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": restrict({
        group: ["@/infrastructure/**"],
        message: MSG.presentationNoInfra,
      }),
    },
  },
];

export default defineConfig([
  // ...기존 설정(next/recommended 등)을 먼저 둔다
  ...layerRules,
]);
```

`domain` 에서 `new Date()` 나 `fetch(` 같은 **호출**은 `no-restricted-imports` 로 못 막는다.
`no-restricted-globals` 나 `no-restricted-syntax` 를 함께 쓴다.

```js
{
  files: ["src/domain/**/*.{ts,tsx}"],
  rules: {
    "no-restricted-globals": [
      "error",
      { name: "fetch", message: "domain 은 네트워크를 모른다. 포트로 선언하고 주입받아라." },
      { name: "localStorage", message: "domain 은 저장소를 모른다." },
      { name: "sessionStorage", message: "domain 은 저장소를 모른다." },
    ],
    "no-restricted-syntax": [
      "error",
      {
        selector: "NewExpression[callee.name='Date'][arguments.length=0]",
        message: "domain 에서 현재 시각을 직접 읽지 않는다. 인자로 주입받아라 — 그래야 시간에 의존하는 규칙을 테스트할 수 있다.",
      },
      {
        selector: "CallExpression[callee.object.name='Date'][callee.property.name='now']",
        message: "domain 에서 현재 시각을 직접 읽지 않는다. 인자로 주입받아라.",
      },
    ],
  },
}
```

---

## 여러 컨텍스트 설정

`src/domains/<컨텍스트>/{domain,application,infrastructure,presentation}` 구조일 때다.
`## 인터뷰에서 조정할 것` 에서 컨텍스트를 나누기로 했을 때만 쓴다.

두 가지가 추가된다.

### 1. 다른 컨텍스트는 배럴로만

```js
const CONTEXTS = ["identity", "workplace", "attendance"]; // 실제 컨텍스트로 바꾼다

/** 자기 자신을 뺀 다른 컨텍스트들의 내부 경로 */
function otherContextInternals(self) {
  return CONTEXTS.filter((c) => c !== self).map((c) => `@/domains/${c}/**`);
}
```

`@/domains/payroll` (배럴)은 허용하고 `@/domains/payroll/domain/...` (내부)는 막는다.
**이유:** 내부 경로를 파고들면 그 컨텍스트의 구조를 바꿀 수 없게 된다.

### 2. 컨텍스트 의존 순서 — 상류는 하류를 모른다

```js
/** 상류에서 하류로. 하류는 상류를 알아도 되지만 반대는 안 된다. */
const CONTEXT_ORDER = ["identity", "workplace", "attendance"];

/** 이 컨텍스트보다 하류인 것들의 배럴 */
function downstreamBarrels(self) {
  const i = CONTEXT_ORDER.indexOf(self);
  return i === -1
    ? []
    : CONTEXT_ORDER.slice(i + 1).map((c) => `@/domains/${c}`);
}
```

**이 규칙이 없으면 배럴이 우회로가 된다.** `otherContextInternals` 는 "내부 경로를 파고들지 마라" 이고
배럴은 허용하므로, 상류가 하류의 배럴을 부르는 것은 막히지 않는다.
실제 프로젝트에서 이 구멍으로 상류→하류 참조가 들어온 사례가 있다.

컨텍스트별 규칙은 `CONTEXTS.flatMap(...)` 으로 생성한다. 각 레이어 규칙에
`otherContextInternals(context)` 와 `downstreamBarrels(context)` 를 함께 넣는다.

### 컴포지션 루트 예외

구현체를 유스케이스에 주입하는 파일 하나만은 `infrastructure` 를 직접 import 한다.
그것이 그 파일의 존재 이유다. 대신 화면과 프레임워크는 모른다.

```js
{
  files: [`src/domains/${context}/composition.ts`],
  rules: {
    "no-restricted-imports": restrict(
      { group: FRAMEWORK, message: MSG.domainNoFramework },
      { group: [`@/domains/${context}/presentation/**`], message: MSG.presentationNoInfra },
    ),
  },
}
```

이 예외는 `.curvez/architecture.md` 의 `## 예외` 에 **만료 조건과 함께** 적는다.
문서에 없는 예외는 다음 사람에게 그냥 규칙 위반으로 보인다.

---

## 함정 — 전부 실제로 밟은 것들

### flat config 는 같은 규칙 이름을 병합하지 않고 덮어쓴다

공통 규칙(`PARENT_RELATIVE`)을 별도 config 객체로 분리하면, 나중에 오는 쪽이
앞의 레이어별 규칙을 **통째로 지운다.**

```js
// ✗ 뒤의 config 가 앞의 no-restricted-imports 를 덮어쓴다
[
  { files: ["src/domain/**"], rules: { "no-restricted-imports": [...레이어 규칙] } },
  { files: ["src/**"], rules: { "no-restricted-imports": [...상대경로 규칙] } },  // 앞을 지운다
]
```

그래서 `restrict()` 가 `PARENT_RELATIVE` 를 **각 레이어의 patterns 안에** 넣는다.

### 빈 group 은 스키마 오류를 낸다

가장 하류 컨텍스트는 `downstreamBarrels()` 가 빈 배열을 돌려준다.
빈 배열을 그대로 넘기면 ESLint 가 설정을 읽다가 죽는다 — 규칙 위반이 아니라 **설정 오류**라
"lint 가 아예 안 돈다". `restrict()` 의 `.filter((g) => g.group.length > 0)` 이 이것을 막는다.

### `group` 과 `patterns` 를 섞지 않는다

`no-restricted-imports` 는 `paths` 와 `patterns` 두 형태를 받는다.
`patterns` 안에서는 `group` 키를 쓴다. `name` 을 쓰면 조용히 무시된다.

### 규칙을 껐다면 그것은 파일이 잘못된 자리에 있다는 신호다

`eslint-disable` 로 계층 규칙을 끄지 마라. 위반은 대개 "이 코드가 잘못된 레이어에 있다" 는 뜻이다.
import 를 허용하지 말고 **파일을 옮겨라.**

정당한 예외라면 `.curvez/architecture.md` 의 `## 예외` 에 대상·허용 범위·만료 조건을 적고,
lint 설정에도 그 파일만 좁혀 예외를 만든다. 주석 한 줄로 끄면 다음 사람이 근거를 찾을 수 없다.

---

## 검증 — 설정이 실제로 막는지 확인한다

설정을 쓴 뒤 **반드시 위반을 일부러 만들어 lint 가 에러를 내는지 본다.**
설정 오류로 규칙이 로드되지 않아도 lint 는 조용히 통과하기 때문이다 — 이 프로젝트에서
가장 자주 나온 실패 유형이 "검사가 안 돌았는데 통과로 보이는 것" 이다.

```bash
# 1) 위반을 심는다
mkdir -p src/domain
cat > src/domain/__lint-probe.ts <<'EOF'
import { useState } from "react";
export const probe = useState;
EOF

# 2) 에러가 나야 정상이다. exit 0 이면 규칙이 안 걸린 것이다
pnpm lint 2>&1 | tail -5
echo "exit=$?  (0 이면 규칙이 로드되지 않았다는 뜻이다)"

# 3) 반드시 지운다
rm src/domain/__lint-probe.ts
```

`no-restricted-imports` 가 걸리면 메시지에 `MSG.domainNoFramework` 문구가 그대로 나온다.
그 문구가 안 보이면 규칙이 아니라 다른 이유로 실패한 것이다.

프로브 파일명에 `__` 접두사를 쓰는 이유: 검증 후 지우는 것을 잊어도 이름만으로
임시 파일임이 드러나고, 커밋 diff 에서 눈에 띈다.

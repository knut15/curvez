# nextjs

`curvez:bootstrap` 이 Next.js 프로젝트의 `.curvez/profile.json` 을 만들 때 참조하는 관례 모음이다.
감지 신호, `paths` 후보, `commands` 후보, 이 스택에서만 걸리는 함정을 담는다.

**이 문서는 값을 채워 주지 않는다.** 여기 적힌 것은 "무엇을 어디서 확인하라" 뿐이고,
확인되지 않은 값은 인터뷰로 묻거나 키째로 생략한다. 정본 절차는 `skills/bootstrap/SKILL.md` 다.

---

## 감지 신호

### 1차 판정 — 루트 `package.json`

`skills/bootstrap/SKILL.md` 절차 2 의 출력으로 판정한다.

| 출력                                                       | 판정                                                                |
| ---------------------------------------------------------- | ------------------------------------------------------------------- |
| `workspace: false`, `next` 있음, `expo`·`reactNative` 없음 | `nextjs`                                                            |
| `workspace: true`                                          | 확정 금지. `skills/bootstrap/references/stack-detection.md` 로 간다 |
| `next` 없음                                                | `nextjs` 가 아니다                                                  |

`next` 는 `dependencies` / `devDependencies` **어느 쪽에 있어도** 신호로 친다.
`peerDependencies` 는 신호가 아니다 — 그 저장소는 Next.js 앱이 아니라 Next.js 용 라이브러리다.

### 2차 확인 — 앱인지 라이브러리인지

`next` 의존성만으로는 "Next.js 앱" 과 "Next.js 를 대상으로 하는 플러그인·컴포넌트 라이브러리" 가
갈리지 않는다. 아래 중 **하나 이상**이 있어야 앱으로 친다.

| 신호                                                     | 확인                                                   |
| -------------------------------------------------------- | ------------------------------------------------------ |
| `next.config.{js,mjs,cjs,ts}` 가 있다                    | 가장 강한 신호. 없어도 앱일 수 있지만 있으면 거의 확정 |
| `scripts.dev` 또는 `scripts.build` 가 `next` 로 시작한다 | `next dev` / `next build`                              |
| `app/` 또는 `pages/` 라우트 디렉터리가 있다              | 아래 라우터 판정과 같이 본다                           |

`.next/` 디렉터리는 **판정 근거로 쓰지 마라.** 빌드 산출물이라 클론 직후에는 없고,
`.gitignore` 되어 있어 존재 여부가 저장소 상태와 무관하다.

### 라우터 판정 — App Router 인가 Pages Router 인가

`curvez-nextjs` 는 **App Router 를 전제로 한다.** 자체 검증도 `paths.web` 아래 `src/app` 을 본다.
Pages Router 프로젝트는 `stack: "nextjs"` 가 맞더라도 담당 에이전트의 전제가 깨지므로 별도 판단이 필요하다.

| 신호                                           | 판정                                                                       |
| ---------------------------------------------- | -------------------------------------------------------------------------- |
| `app/layout.*` 또는 `src/app/layout.*` 가 있다 | App Router                                                                 |
| `pages/_app.*` 또는 `src/pages/_app.*` 가 있다 | Pages Router                                                               |
| 둘 다 있다                                     | **마이그레이션 중.** 판정하지 말고 인터뷰로 어느 쪽이 주 라우터인지 묻는다 |
| 둘 다 없다                                     | 라우트가 아직 없는 초기 상태이거나 루트가 아니다. 인터뷰로 묻는다          |

`layout.*` / `_app.*` 로 판정하는 이유: 디렉터리 이름만으로는 갈리지 않는다.
일부 아키텍처는 `src/app` 과 `src/pages` 를 **레이어 이름**으로 쓴다. 파일 규약(`layout`, `_app`)이
있어야 그것이 Next.js 라우터라는 근거가 된다. → 아래 `## 아키텍처 프리셋과의 조합` 참조.

**Pages Router 로 판정되면 `curvez-nextjs` 를 그대로 붙이지 마라.** bootstrap 은 `stack: "nextjs"` 로
프로파일을 쓰되, Pages Router 라는 사실을 완료 보고에 남긴다. `profile.json` 스키마에는 라우터를
담을 키가 없다 — 계약 밖의 키를 만들지 말고 보고로 남긴다.

### 오탐 케이스 — 전부 추측 금지

| 상황                                                                          | 왜 추측하면 안 되는가                                                                      | 행동                                                     |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | -------------------------------------------------------- |
| 같은 `package.json` 에 `next` 와 `expo` 가 둘 다 있다                         | 웹 빌드를 곁들인 RN 앱일 수도, 마이그레이션 중인 웹 앱일 수도 있다. 의존성으로는 안 갈린다 | 인터뷰 1번 문항. 틀리면 담당 구현 에이전트 자체가 틀린다 |
| `workspace: true` 인데 루트에 `next` 가 있다                                  | 루트의 `next` 는 도구용 hoisting 일 수 있고 실제 앱은 하위 패키지다                        | `references/stack-detection.md` 의 순회를 돌린다         |
| 순회 결과 `web` 이 2개 이상 (`apps/web` + `apps/admin`)                       | 순회 순서가 파일시스템 순서라 실행마다 다른 값이 나온다                                    | 인터뷰로 주 앱을 고르게 한다. 첫 번째를 고르지 마라      |
| `next` 가 `devDependencies` 에만 있고 `next.config` 도 라우트 디렉터리도 없다 | Next.js 용 라이브러리·플러그인 저장소다                                                    | `nextjs` 로 판정하지 않는다                              |
| `next` 는 있는데 `react` 가 없다                                              | `package.json` 이 불완전하거나 루트가 아니다                                               | 루트 위치부터 확인한다                                   |

### 확인 명령

```bash
node -e '
const fs = require("fs");
const read = (p) => { try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return null; } };
const has = (...c) => c.find((p) => fs.existsSync(p)) || null;
const pkg = read("package.json");
if (!pkg) { console.log("NO_PACKAGE_JSON"); process.exit(0); }
const d = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
const s = pkg.scripts || {};
console.log(JSON.stringify({
  next: d.next || null,
  expo: d.expo || null,
  reactNative: d["react-native"] || null,
  workspace: !!pkg.workspaces || fs.existsSync("pnpm-workspace.yaml"),
  nextConfig: has("next.config.js", "next.config.mjs", "next.config.cjs", "next.config.ts"),
  nextScript: Object.entries(s).filter(([, v]) => /^next\b/.test(v)).map(([k]) => k),
  appRouter: has("app/layout.tsx", "app/layout.js", "src/app/layout.tsx", "src/app/layout.js"),
  pagesRouter: has("pages/_app.tsx", "pages/_app.js", "src/pages/_app.tsx", "src/pages/_app.js"),
  scripts: Object.keys(s)
}, null, 2));
'
```

`next` 가 있고 `expo`·`reactNative` 가 `null` 이고 `workspace` 가 `false` 이면 `nextjs` 다.
`appRouter` 와 `pagesRouter` 중 정확히 하나만 값이 있어야 라우터가 확정된다.

---

## paths 후보

### `paths.web` — 필수 키

**`paths.web` 은 앱 패키지의 루트다. 소스 디렉터리가 아니다.**
`package.json` 과 `next.config.*` 가 있는 디렉터리를 가리킨다.

**이유:** `curvez-nextjs` 의 자체 검증이 `$WEB/src/domain`, `$WEB/src`, `$WEB/src/app` 을 검사 경로로
쓴다. `paths.web` 에 `apps/web/src` 를 넣으면 그 검사들이 `apps/web/src/src/...` 를 보게 되어
전부 0건으로 나오고, 그 0 은 "위반 없음" 과 구분되지 않는다.

| 배치                      | `paths.web`                            | 확인 방법                                             |
| ------------------------- | -------------------------------------- | ----------------------------------------------------- |
| 단일 저장소, 루트가 곧 앱 | `.`                                    | 루트에 `next.config.*` 와 라우트 디렉터리가 같이 있다 |
| monorepo, 관례 위치       | `apps/web`                             | 그 디렉터리에 `package.json` + `next` 의존성          |
| monorepo, 다른 관례       | `packages/web`, `apps/<앱이름>`, `web` | 순회 결과의 `web` 배열 값을 그대로 쓴다               |

- 값은 **저장소 루트 기준 상대 경로**이고 끝에 `/` 를 붙이지 않는다
- 단일 저장소에서 `"."` 을 쓴다. 빈 문자열을 쓰지 마라 — 후속 에이전트의 `[ -n "$WEB" ]` 검사가
  `blocked` 로 떨어진다. `"."` 은 `fs.existsSync` 검증도 통과한다
- **못 찾으면 추측하지 마라.** 인터뷰 2번 문항으로 묻고, 답이 없으면 `status: blocked` 다.
  `apps/web` 이나 루트로 폴백하지 않는다

### `paths.mobile` / `paths.domain`

`stack: "nextjs"` 에서는 **둘 다 쓰지 않는다.** 필수도 선택도 아니다 — 키째로 없어야 한다.
웹 전용 저장소에 `paths.domain` 을 넣으면 `curvez-orchestrator` 가 monorepo 용 순차 강등 규칙을
적용해 병렬로 돌 수 있는 라운드를 직렬로 만든다.

앱과 웹이 같은 저장소에 있으면 그것은 `nextjs` 가 아니라 `monorepo` 다.

### `paths.tests` — 선택 키, 폴백 허용

```bash
ls -d tests test __tests__ e2e 2>/dev/null | head -3
```

디렉터리가 **하나로** 잡히면 그것을 쓴다. monorepo 면 `paths.web` 아래에서도 같이 본다
(`apps/web/e2e` 등). 러너 설정에서 읽는 방법도 있다.

| 러너       | 읽을 곳                                    | 키                    |
| ---------- | ------------------------------------------ | --------------------- |
| Playwright | `playwright.config.*`                      | `testDir`             |
| Vitest     | `vitest.config.*` / `vite.config.*`        | `test.include`        |
| Jest       | `jest.config.*` / `package.json` 의 `jest` | `testMatch` / `roots` |

Next.js 에서 흔한 배치는 **코로케이션 + `e2e/` 분리**다 (`src/**/*.test.ts` 가 소스 옆에 흩어져 있고
Playwright 스펙만 `e2e/` 에 모임). 이때 단일 디렉터리로 잡히지 않으므로 **`paths.tests` 를 생략한다.**
`curvez-nextjs` 와 `curvez-qa` 는 키가 없으면 `*.test.*` / `*.spec.*` / `__tests__/` 규칙으로 찾는다.

여러 후보가 잡히는데 하나를 못 고르겠으면 인터뷰 5번 문항으로 올린다. 배열로 넣지 마라 —
`paths.tests` 는 단일 문자열이다.

---

## commands 후보

`package.json` 의 `scripts` 에 **실제로 있는 이름만** 쓴다. 값 형식은 `pnpm <스크립트명>` 이다.
스크립트 본문(`next build`)이 아니라 스크립트 **이름**을 쓴다.

| 키          | `scripts` 후보 (이 순서로 먼저 맞는 하나) | Next.js 관례 본문           | 없을 때     |
| ----------- | ----------------------------------------- | --------------------------- | ----------- |
| `typecheck` | `typecheck` → `type-check` → `tsc`        | `tsc --noEmit`              | **키 생략** |
| `lint`      | `lint`                                    | `next lint` 또는 `eslint .` | **키 생략** |
| `test`      | `test`                                    | 러너마다 다름 (아래)        | **키 생략** |
| `build`     | `build`                                   | `next build`                | **키 생략** |

### 없는 스크립트는 키째로 생략한다

빈 문자열도 `null` 도 아니다. **키가 없어야 한다.**

**이유:** `commands` 는 `curvez-qa` 와 `curvez-nextjs` 가 `eval` 로 그대로 실행하는 값이다.
없는 스크립트를 적어 두면 매 라운드 `Command "typecheck" not found` 로 끝나는데, 이 실패는
코드가 깨진 실패와 출력만으로 구분되지 않아 구현 에이전트가 멀쩡한 코드를 고치기 시작한다.
`""` 는 더 나쁘다 — `[ -n "$TYPECHECK" ]` 를 통과하지 못해 조용히 건너뛰어지고, 게이트가
안 돌았다는 사실 자체가 로그에 안 남는다.

### `typecheck` 가 가장 자주 없다

Next.js 스타터에는 `typecheck` 스크립트가 **기본으로 들어 있지 않다.** `next build` 가 타입 검사를
같이 하기 때문이다. 이름도 프로젝트마다 갈린다 — `typecheck` / `type-check` / `tsc` / `types`.

- 위 후보 세 개에 없으면 **키를 생략한다.** `pnpm tsc --noEmit` 를 만들어 넣지 마라
- `typecheck`·`lint`·`test` 가 **셋 다** 비면 인터뷰 4번 문항으로 올린다. 품질 게이트가 통째로 비면
  `status: done` 을 판정할 근거가 없다

### `test` 는 러너마다 본문이 다르다

| 러너       | 흔한 `test` 본문        | 비고                                            |
| ---------- | ----------------------- | ----------------------------------------------- |
| Vitest     | `vitest run` / `vitest` | `vitest` 단독은 watch 모드다. CI 에서 안 끝난다 |
| Jest       | `jest` / `jest --ci`    |                                                 |
| Playwright | `playwright test`       | 보통 `test:e2e` 로 분리돼 있다                  |
| node:test  | `node --test`           |                                                 |

- **`commands.test` 의 후보는 `test` 하나뿐이다.** `test:unit` / `test:e2e` / `test:ci` 를 끌어오지 마라.
  bootstrap 계약에 없는 이름이고, 어느 것이 대표인지 판정할 근거가 없다
- `test` 본문이 watch 모드(`vitest` 단독, `jest --watch`)면 게이트가 끝나지 않는다.
  값은 그대로 쓰되 이 사실을 **완료 보고에 남긴다** — 스크립트를 고치는 것은 bootstrap 의 범위가 아니다

### `build` 는 웹에서 값이 크다

`build` 는 선택 키지만 Next.js 에서는 **있으면 반드시 채운다.** 타입체크·린트가 구조적으로 못 잡는
RSC 경계 위반을 빌드만 잡는다 (아래 `## 스택 고유 주의사항` 참조).

### monorepo 루트에서 돌릴 때

`stack` 이 `monorepo` 여도 웹 게이트는 이 표를 쓴다. 다만 후보를 찾는 `package.json` 이
루트인지 `paths.web` 아래인지 갈린다.

- 루트 `scripts` 에 있으면 그것을 쓴다 (turbo·nx 가 위임하는 형태)
- 루트에 없고 `paths.web/package.json` 에만 있으면 **키를 생략하고 완료 보고에 남긴다.**
  `pnpm --filter <pkg> <script>` 를 만들어 넣지 마라 — 계약이 정한 값 형식은 `pnpm <스크립트명>` 이고,
  패키지 이름을 추측해 넣으면 필터가 안 걸려 0개 실행으로 통과한다

`packageManager` 는 감지값과 무관하게 `pnpm` 으로 고정한다. `package.json` 의 `packageManager` 가
npm/yarn 이면 인터뷰가 아니라 **완료 보고**에 남긴다.

---

## 스택 고유 주의사항

### 1. `next.config` 가 게이트를 삼킬 수 있다

```
typescript: { ignoreBuildErrors: true }
eslint: { ignoreDuringBuilds: true }
```

이 둘 중 하나라도 켜져 있으면 **`next build` 성공을 타입·린트 통과의 근거로 쓸 수 없다.**
빌드는 오류를 보고도 exit 0 을 낸다.

```bash
grep -nE "ignoreBuildErrors|ignoreDuringBuilds" next.config.* 2>/dev/null
```

monorepo 면 `$(paths.web)/next.config.*` 를 본다.

| 검출            | bootstrap 이 할 일                                                                                                                         |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 하나라도 `true` | **완료 보고에 그대로 남긴다.** `commands.build` 만 있고 `typecheck`·`lint` 가 비어 있으면 그 프로젝트는 검증 근거가 사실상 0 이라는 뜻이다 |
| 없음            | `next build` 가 tsc·eslint 를 다시 돈다. `typecheck`·`lint` 와 중복이지만 **끄지 마라**                                                    |

**이 항목을 반드시 확인하는 이유:** 이것은 검증을 무력화하는 종류의 설정이다. 켜져 있으면
게이트가 전부 초록인데 실제로는 아무것도 검사되지 않은 상태가 되고, 그 상태는 런타임까지
드러나지 않는다. `profile.json` 에 이 사실을 담을 키는 없다 — 계약 밖 키를 만들지 말고 보고로 남긴다.

상세는 `skills/quality-gate/references/nextjs.md` 가 정본이다.

### 2. RSC 경계는 타입 체크로 안 잡힌다

아래는 전부 **타입상 유효**하고 빌드에서만 드러난다.

| 증상                                                                  | 왜 typecheck 가 못 잡는가                  |
| --------------------------------------------------------------------- | ------------------------------------------ |
| 서버 컴포넌트에서 `useState`·`onClick` 사용 (`"use client"` 누락)     | 타입은 맞다. 경계 위반은 번들러가 판정한다 |
| 서버 → 클라이언트로 직렬화 불가능한 prop 전달 (함수, 클래스 인스턴스) | 타입상 유효한 값이다                       |
| 클라이언트 컴포넌트가 `server-only` 모듈을 import                     | 런타임 경계라 타입에 안 나타난다           |
| `generateStaticParams` 누락                                           | 파일 규약이라 타입 검사 대상이 아니다      |

그래서 `commands.build` 를 비워 두면 이 스택에서 검증 구멍이 가장 크게 벌어진다.
`scripts.build` 가 있으면 반드시 `commands.build` 에 넣는다.

**빌드 통과가 런타임 안전을 뜻하지는 않는다.** RSC 직렬화 오류 일부는 요청 시점에만 난다.

### 3. `NEXT_PUBLIC_` 과 서버 전용 코드의 클라이언트 누수

`NEXT_PUBLIC_` 접두사가 붙은 환경변수는 **빌드 시점에 클라이언트 번들로 인라인**된다.
접두사가 없으면 서버에서만 읽히고, 클라이언트 컴포넌트에서 읽으면 `undefined` 다.

| 누수 경로                                                                 | 어떻게 드러나는가                                         |
| ------------------------------------------------------------------------- | --------------------------------------------------------- |
| 비밀값에 `NEXT_PUBLIC_` 을 붙임                                           | 아무 오류도 안 난다. 번들에 문자열로 박혀 배포된다        |
| 서버 전용 모듈(DB 클라이언트, API 키 래퍼)을 `"use client"` 파일이 import | 번들 크기가 튀거나 빌드가 깨진다. 안 깨지면 그대로 나간다 |
| `"use client"` 를 `page.tsx`·`layout.tsx` 최상단에 붙임                   | 그 아래 전 트리가 클라이언트 번들로 넘어간다              |

bootstrap 단계에서 할 수 있는 것은 확인과 보고뿐이다. 판정과 수정은 `curvez-nextjs` 와
`curvez-reviewer` 의 몫이다.

```bash
grep -rn "NEXT_PUBLIC_" --include="*.ts" --include="*.tsx" --exclude-dir=node_modules --exclude-dir=.next . | head
```

`.env*` 파일을 읽어 값을 `profile.json` 에 옮기지 마라. 프로파일은 커밋 대상이다.

### 4. `src/` 유무가 후속 검사 경로를 바꾼다

`curvez-nextjs` 의 자체 검증은 `$WEB/src/domain`, `$WEB/src`, `$WEB/src/app` 을 고정으로 본다.
루트에 `src/` 없이 `app/` 이 바로 있는 프로젝트에서는 그 검사들이 전부 **0건**으로 나오고,
0 은 "위반 없음" 과 구분되지 않는다.

```bash
test -d "$WEB/src" && echo "src 있음" || echo "src 없음 — 후속 검사 경로가 어긋난다"
```

`src/` 가 없으면 **완료 보고에 남긴다.** `paths.web` 을 조작해 맞추려 들지 마라 —
`paths.web` 은 앱 패키지 루트라는 정의가 있고, 그 정의를 어기면 다른 검사가 어긋난다.

### 5. `next lint` 는 Next.js 15 에서 deprecated 다

`scripts.lint` 본문이 `next lint` 인 프로젝트에서 Next.js 를 올리면 경고가 나거나 동작이 바뀐다.
`commands.lint` 값은 그대로 두고(스크립트 이름을 쓰므로 본문 변화와 무관하다), 사실만 보고에 남긴다.

---

## 아키텍처 프리셋과의 조합

`architecture` 초기값은 `"ddd"` 이고, 확정은 `architecture-setup` 이 한다.
bootstrap 은 이 값을 바꾸지 않는다. 아래는 "이 스택에서 각 프리셋이 대략 어떻게 앉는가" 의 요약이다.

**상세와 정본은 `presets/architecture/<이름>.md` 의 `## 스택 매핑` 이다.** 여기 요약과 어긋나면
그쪽이 맞다.

| 프리셋 | Next.js 에서의 요약                                                                                                                                                              | 정본                                            |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| `ddd`  | 가장 안쪽 `domain` 은 순수 TS. App Router 의 라우트·서버/클라이언트 컴포넌트가 `presentation`, 서버 액션이 부르는 유스케이스가 `application`, DB·`fetch` 래퍼가 `infrastructure` | `presets/architecture/ddd.md` 의 `## 스택 매핑` |

프리셋 선택 조건(라우트 수·엔티티 수 기준)의 정본은 `skills/architecture-setup/SKILL.md` 다.
bootstrap 은 이 판정을 하지 않는다.

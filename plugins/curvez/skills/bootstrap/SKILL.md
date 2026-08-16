---
name: bootstrap
description: 새 프로젝트에 curvez 를 붙인다. 스택을 감지하고 인터뷰로 `.curvez/profile.json` 을 확정한 뒤 `.curvez/` 를 스캐폴드한다. "curvez 붙여줘", "curvez 시작", "초기 설정 해줘", "부트스트랩", "bootstrap", "set up curvez", "init curvez" 라고 하거나 `.curvez/profile.json` 없이 curvez 작업을 시작하려 할 때 실행한다.
---

`.curvez/profile.json` 은 curvez 전체의 진입 전제다. `stack` 이 팀 편성을 정하고, `paths` 가 각
에이전트의 소유 경로를 정하고, `commands` 가 품질 게이트의 실행 명령을 정한다. 이 파일이 틀리면
그 위에서 도는 모든 워커가 같은 방향으로 틀린다. **그래서 이 스킬의 규칙은 하나다 — 모르는 값을
채우지 않는다.**

주 사용 에이전트는 `curvez-orchestrator` 다. 이 스킬은 워커를 띄우지 않는다.

## 언제 이 스킬을 쓰는가

- 프로젝트에 curvez 를 처음 붙일 때
- `.curvez/profile.json` 이 없는 상태에서 curvez 작업 지시를 받았을 때
- `curvez-orchestrator` 가 `.curvez/profile.json` 없음으로 `status: blocked` 를 냈을 때
- 스택이 바뀌어(웹 전용 → 모노레포) 프로파일의 `stack` 과 `paths` 를 다시 잡아야 할 때

## 언제 쓰지 않는가

- 레이어·의존 방향·금지 import 를 정하거나 다시 정할 때 → `architecture-setup` 을 쓴다.
  bootstrap 은 `.curvez/architecture.md` 의 **자리만** 만들고 내용은 건드리지 않는다
- 이미 세팅된 프로젝트에서 이번 작업의 팀을 짤 때 → `team-orchestration` 을 쓴다
- 핸드오프 JSON 을 쓰거나 읽을 때 → `agent-contract` 를 쓴다
- 스킬·에이전트 정의 문서를 만들 때 → `authoring-skills` / `authoring-agents` 를 쓴다
- 화면·컴포넌트 스펙을 만들 때 → `wireframe-spec` 을 쓴다

**이유:** bootstrap 은 프로젝트당 사실상 한 번 도는 스킬이다. 이미 `profile.json` 이 있는데
이 스킬이 뜨면 확정된 전제를 다시 흔들고, 그 사이 다른 에이전트가 옛 전제로 작업 중일 수 있다.

## 절차 개요

1. 이미 있는지 본다 (멱등성)
2. 스택을 감지한다
3. `commands` 를 `scripts` 에서 읽는다
4. 못 채운 것만 인터뷰한다 (최대 5문)
5. `profile.json` 을 쓴다
6. `.curvez/` 를 스캐폴드하고 `.gitignore` 를 손본다
7. 검증하고 `architecture-setup` 으로 넘긴다

## 1. 이미 있는지 본다

```bash
test -e .curvez/profile.json && echo "EXISTS" || echo "NEW"
```

| 결과 | 행동 |
|---|---|
| `NEW` | 절차 2 로 간다 |
| `EXISTS` | **덮어쓰지 않는다.** 아래 보충 규칙만 적용한다 |

### 이미 있을 때의 보충 규칙

1. `profile.json` 을 읽고 절차 7 의 검증 명령을 그대로 돌린다
2. `missing=` 에 나온 **필수 키만** 채운다. 채우는 값은 감지 결과나 사용자 답이어야 한다
3. 이미 값이 있는 키는 사용자가 명시적으로 바꾸라고 한 것만 바꾼다
4. `.curvez/` 아래 없는 디렉터리·파일만 만든다. 있는 파일은 열지도 않는다

**기존 값을 덮어쓰지 마라.**
**이유:** `paths` 는 이미 `.curvez/architecture.md` 의 `## 스택 매핑`, `.curvez/design/` 의
`route(nextjs)`·`route(rn)`, 각 에이전트의 소유 경로 판정에 참조돼 있다. 경로 하나를 조용히 바꾸면
그 참조들이 전부 어긋나는데, 어긋난 자리는 실행이 실패할 때까지 드러나지 않는다.
덮어쓰기가 정말 필요하면 그것은 bootstrap 이 아니라 사용자가 결정할 마이그레이션이다.

## 2. 스택을 감지한다

```bash
node -e '
const fs = require("fs");
const read = (p) => { try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return null; } };
const root = read("package.json");
if (!root) { console.log("NO_PACKAGE_JSON"); process.exit(0); }
const d = { ...(root.dependencies || {}), ...(root.devDependencies || {}) };
console.log(JSON.stringify({
  workspace: !!root.workspaces || fs.existsSync("pnpm-workspace.yaml"),
  next: d.next || null,
  expo: d.expo || null,
  reactNative: d["react-native"] || null,
  packageManager: root.packageManager || null,
  scripts: Object.keys(root.scripts || {})
}, null, 2));
'
```

출력으로 판정한다. 세 줄에 안 걸리면 판정하지 마라.

| 출력 | 판정 |
|---|---|
| `workspace: false`, `next` 있음, `expo`·`reactNative` 없음 | `nextjs` |
| `workspace: false`, `expo` 또는 `reactNative` 있음, `next` 없음 | `react-native` |
| `workspace: true` | **아직 확정하지 않는다.** 워크스페이스를 순회해야 한다 |

`workspace: true` 이거나 위 세 줄 중 어느 것에도 안 맞으면
[references/stack-detection.md](references/stack-detection.md) 를 읽고 그 절차를 따른다.

### 애매하면 묻는다

아래는 전부 **추측 금지**다. 절차 4 의 인터뷰 문항으로 올린다.

| 상황 | 왜 추측하면 안 되는가 |
|---|---|
| `next` 와 `expo` 가 **같은** `package.json` 에 있다 | 웹을 곁들인 RN 앱인지, RN 을 곁들인 웹인지 의존성만으로 갈리지 않는다. 판정이 틀리면 담당 구현 에이전트 자체가 틀린다 |
| 셋 다 없다 | curvez 대상이 아닌 저장소일 수 있다. 스택을 지어내면 존재하지 않는 경로에 코드를 쓴다 |
| `NO_PACKAGE_JSON` | Node 프로젝트가 아니거나 루트가 아니다. 루트 위치부터 확인한다 |
| `workspace: true` 인데 웹·모바일 앱이 한쪽만 있다 | 모노레포 구조여도 `stack` 은 실제 앱 구성으로 갈린다 |

### 스택이 정해지면 해당 스택 프리셋을 읽는다

판정이 끝나면 **절차 3 으로 넘어가기 전에** 아래를 읽는다. 감지 신호의 오탐 케이스, 경로 후보,
`commands` 이름 후보, 그 스택에서만 걸리는 함정이 거기 있다.

```
$CLAUDE_PLUGIN_ROOT/presets/stack/<stack>.md
```

| `stack` | 프리셋 | 거기서만 알 수 있는 것 |
|---|---|---|
| `nextjs` | `presets/stack/nextjs.md` | App Router / Pages Router 판정을 디렉터리 이름이 아니라 파일 규약(`layout.*` / `_app.*`)으로 해야 하는 이유 |
| `react-native` | `presets/stack/react-native.md` | `package.json` 최상위 `expo` 키가 레거시 설정 블록일 수 있어 의존성만 봐야 한다는 것, `expo.sdkVersion` 추출 |
| `monorepo` | `presets/stack/monorepo.md` | `paths.domain` 을 이름이 아니라 **의존 관계**로 판정하는 방법 |

**이 파일이 없어도 멈추지 마라.** 정상 설치에는 있지만, 없으면 이 스킬의 절차만으로
진행할 수 있다. 다만 위 표의 함정들은 프리셋에만 적혀 있으므로, 없이 진행했다면 그 사실을
`decisions` 에 남긴다.

**이유:** 스택별 오탐 케이스를 이 스킬 본문에 전부 담으면 세 스택의 상세가 한 문서에 쌓여
지금 필요 없는 두 스택 몫이 매번 읽힌다. 감지 결과가 나온 **뒤에** 해당 분기만 읽는 것이 맞다.

## 3. commands 를 scripts 에서 읽는다

절차 2 출력의 `scripts` 배열에서만 고른다. 위에서부터 먼저 맞는 이름 하나를 쓴다.

| `commands` 키 | `scripts` 후보 (이 순서) | 값 형식 |
|---|---|---|
| `typecheck` | `typecheck` → `type-check` → `tsc` | `pnpm <스크립트명>` |
| `lint` | `lint` | `pnpm <스크립트명>` |
| `test` | `test` | `pnpm <스크립트명>` |
| `build` | `build` | `pnpm <스크립트명>` |

**후보가 하나도 없으면 그 키를 통째로 생략한다. 명령을 지어내지 마라.**
**이유:** `commands` 는 `curvez-qa` 가 그대로 실행하는 값이다. 없는 스크립트를 적어 두면 매 라운드
`Command "typecheck" not found` 로 끝나는데, 이 실패는 코드가 깨진 실패와 출력만으로 구분되지 않아
QA 가 "검증 실패" 로 보고하고 구현 에이전트가 멀쩡한 코드를 고치기 시작한다.

`typecheck` / `lint` / `test` 가 **셋 다** 비면 인터뷰 문항으로 올린다 — 품질 게이트가 통째로 비면
`status: done` 을 판정할 근거가 없어진다.

`packageManager` 는 감지값과 무관하게 `pnpm` 으로 고정한다. 감지값이 pnpm 이 아니면 그 사실을
인터뷰 문항이 아니라 **완료 보고에 남긴다** — 패키지 매니저 교체는 bootstrap 의 범위가 아니다.

## 4. 못 채운 것만 인터뷰한다

**문항 상한은 5문이다. 넘기지 마라.**

**이유:** 사용자는 한 번에 답한다. 6문을 넘기면 뒤쪽 문항의 답이 짧아지거나 통째로 빠지고,
빠진 답은 결국 추측으로 메워진다. `curvez-architect` 의 아키텍처 인터뷰도 같은 상한(3~5문)이라
사용자가 bootstrap → architecture 로 이어서 받는 총 문항 수도 예측 가능해진다.
5문으로 안 끝나면 문항이 많은 것이 아니라 **감지를 덜 돌린 것**이다. 절차 2·3 으로 돌아간다.

문항 후보는 아래가 전부다. 감지로 이미 채운 것은 묻지 마라.

| 순위 | 문항 | 나오는 조건 |
|---|---|---|
| 1 | 이 프로젝트의 스택은 `nextjs` / `react-native` / `monorepo` 중 무엇인가 | 절차 2 가 애매로 끝났을 때 |
| 2 | 웹/모바일/도메인 소스 경로가 각각 어디인가 | 필수 `paths` 키를 감지로 못 채웠을 때 |
| 3 | Expo SDK 메이저 버전이 몇인가 | `stack` 이 `react-native`·`monorepo` 인데 `expo` 범위를 못 읽었을 때 |
| 4 | 타입 체크·린트·테스트를 어떤 명령으로 도는가 | 절차 3 에서 셋 다 비었을 때 |
| 5 | 테스트 파일이 어디 있는가 | 아래 폴백으로도 못 찾았을 때 |

**한 번에 다 던지고 한 번에 받는다.** 한 문항씩 왕복하지 않는다.

### paths.tests 만 폴백이 허용된다

```bash
ls -d tests test __tests__ e2e 2>/dev/null | head -3
```

디렉터리가 하나로 잡히면 그것을 쓴다. 없으면 `*.test.*` / `*.spec.*` / `__tests__/` 가 소스 트리에
흩어져 있다는 뜻이므로 `paths.tests` 키를 생략한다.

**필수 키에는 폴백을 쓰지 마라. 필수 키를 못 채우면 `status: blocked` 다.**
**이유:** `paths.tests` 는 선택 키라 없어도 후속 에이전트가 관례로 찾아간다. 필수 키는 소유 경로
판정에 쓰여서, 틀린 값 하나가 두 구현 에이전트를 같은 파일에 동시에 붙인다.

## 5. profile.json 을 쓴다

`Write` 로 `.curvez/profile.json` 을 쓴다. 형식은 아래가 정본이다.

```json
{
  "stack": "monorepo",
  "packageManager": "pnpm",
  "architecture": "ddd",
  "paths": { "web": "apps/web", "mobile": "apps/mobile", "domain": "packages/domain", "tests": "tests" },
  "expo": { "sdkVersion": "57" },
  "commands": { "typecheck": "pnpm typecheck", "lint": "pnpm lint", "test": "pnpm test", "build": "pnpm build" }
}
```

| `stack` | 필수 키 | 선택 키 |
|---|---|---|
| `nextjs` | `paths.web` | `paths.tests` |
| `react-native` | `paths.mobile`, `expo.sdkVersion` | `paths.tests` |
| `monorepo` | `paths.web`, `paths.mobile`, `paths.domain` | `paths.tests`, `expo.sdkVersion` |

- `paths` 값은 **저장소 루트 기준 상대 경로**다. 끝에 `/` 를 붙이지 않는다
- `expo.sdkVersion` 은 메이저 숫자만 문자열로 쓴다 (`"~57.0.9"` → `"57"`)
- `architecture` 초기값은 `"ddd"` 다. 확정은 `architecture-setup` 이 한다
- 값을 모르는 선택 키는 **키째로 생략한다.** 빈 문자열·`null` 을 넣지 마라
  - **이유:** 후속 에이전트는 키 존재 여부로 분기한다. `""` 는 "없음" 이 아니라 "빈 경로" 로 읽혀
    루트 전체를 대상으로 삼는 명령이 만들어진다

## 6. .curvez/ 를 스캐폴드한다

```bash
mkdir -p .curvez/research .curvez/handoff .curvez/tmp
touch .curvez/research/.gitkeep .curvez/handoff/.gitkeep
```

`.gitkeep` 이 없으면 빈 디렉터리가 커밋되지 않아 다음 사람이 클론했을 때 경로가 사라진다.

이어서 자리만 만든다. **내용을 채우지 마라.**

`.curvez/architecture.md` — 헤딩 7개와 한 줄씩만 둔다.

```
## 레이어 정의
## 의존 방향
## 금지 import
## 폴더 구조
## 스택 매핑
## 예외
## 결정 로그
```

각 헤딩 아래에는 `architecture-setup 이 채운다.` 한 줄만 쓴다.
**헤딩 문자열과 각 절의 작성 규칙은 `architecture-setup` 이 정본이다.** 골격이 어긋나 있으면
`architecture-setup` 이 전체를 다시 쓴다 — bootstrap 이 맞추려 들지 마라.

`.curvez/team.md` — `curvez-orchestrator` 가 라운드마다 전체를 다시 쓰는 파일이다.
`아직 팀이 편성되지 않았다.` 한 줄만 둔다. 형식의 정본은 `curvez-orchestrator` 정의다.

### .gitignore 는 tmp 만 막는다

```bash
grep -qxF '.curvez/tmp/' .gitignore 2>/dev/null \
  || printf '\n# curvez 실행 부산물 — 재현 가치가 없다\n.curvez/tmp/\n' >> .gitignore
```

`grep -qxF` 가 있어 두 번 돌려도 줄이 늘지 않는다.

**`.curvez/` 자체는 커밋 대상이다. `.gitignore` 에 `.curvez/` 를 넣지 마라.**
**이유:** `profile.json`·`architecture.md`·`design/` 은 사람과 에이전트가 **공유하는 전제**다.
커밋하지 않으면 다른 사람의 에이전트가 같은 저장소에서 다른 전제로 시작하고, 두 결과물이 왜
다른지 판정할 근거가 코드 어디에도 남지 않는다. `handoff/` 도 커밋한다 — `curvez-retrospector` 가
실행 이력을 시간순으로 재구성하는 유일한 원본이다.
`tmp/` 만 예외다. 파싱 실패한 워커 응답 원문 같은 실행 부산물이라 재현 가치가 없고 크기만 는다.

## 7. 검증하고 넘긴다

```bash
node -e '
const fs = require("fs");
const p = JSON.parse(fs.readFileSync(".curvez/profile.json", "utf8"));
const NEED = { nextjs: ["paths.web"], "react-native": ["paths.mobile", "expo.sdkVersion"], monorepo: ["paths.web", "paths.mobile", "paths.domain"] };
const need = NEED[p.stack];
if (!need) { console.error("stack 값이 계약 밖이다: " + p.stack); process.exit(1); }
const get = (o, k) => k.split(".").reduce((a, c) => (a == null ? a : a[c]), o);
const missing = need.filter((k) => !get(p, k));
const ghost = Object.entries(p.paths || {}).filter(([, v]) => !fs.existsSync(v)).map(([k, v]) => k + "=" + v);
console.log("stack=" + p.stack, "missing=" + (missing.join(",") || "none"), "notOnDisk=" + (ghost.join(",") || "none"), "commands=" + Object.keys(p.commands || {}).join(","));
process.exit(missing.length || ghost.length ? 1 : 0);
'
```

`missing=none`, `notOnDisk=none`, exit 0 이어야 한다. `missing` 이 남으면 `status: blocked` 로
핸드오프를 내고 무엇을 못 채웠는지 `blocked_on` 에 `who: user` 로 남긴다. 절대 메우지 마라.

이 절차는 `scripts/bootstrap.mjs` 가 실행기로 구현돼 있다. 위 명령을 하나씩 돌려도 되고
스크립트를 부르면 감지·판정·스캐폴드가 한 번에 끝난다.

```bash
node "$CLAUDE_PLUGIN_ROOT/scripts/bootstrap.mjs" [--dry-run] [--json] [--force]
```

**스크립트는 사용자에게 묻지 않는다.** 자동 판정만 하고 나머지는 `questions[]` 로 돌려준다.
그 질문을 사용자에게 전달하는 것은 이 스킬의 몫이다.
**이유:** 추측으로 채운 값은 다음 라운드에서 사실처럼 쓰이고, 틀렸을 때 출처를 되짚을 수 없다.

### 다음 단계

bootstrap 이 끝나면 **`architecture-setup` 을 부른다.** `.curvez/architecture.md` 의 `## 금지 import`
표가 없으면 `curvez-structure-reviewer` 가 검사할 대상이 없고, 구현 에이전트는 경계 없이 코드를 쓴다.

`profile.json` 과 `architecture.md` 가 둘 다 채워진 뒤에야 `team-orchestration` 으로 실제 작업 팀을 짠다.

핸드오프는 `agent-contract` 형식으로 `.curvez/handoff/curvez-orchestrator.<timestamp>.json` 에 남긴다.
`to` 에 `curvez-architect` 를 넣는다.

## 완료 기준

- [ ] 절차 7 의 검증 명령이 exit 0 이고 `missing=none`, `notOnDisk=none`
- [ ] `stack` 이 `nextjs` / `react-native` / `monorepo` 중 하나
- [ ] `commands` 의 모든 값이 `package.json` 의 `scripts` 에 실제로 있는 이름
- [ ] `.curvez/` 아래 `profile.json` `architecture.md` `team.md` `research/` `handoff/` `tmp/` 6개가 전부 존재
- [ ] `.gitignore` 에 `.curvez/tmp/` 가 **정확히 1줄**, `.curvez/` 통째 무시 줄은 **0줄**
- [ ] 인터뷰 문항 수 **5문 이하**
- [ ] 감지·인터뷰로 확인하지 못한 값을 채운 곳 **0곳**

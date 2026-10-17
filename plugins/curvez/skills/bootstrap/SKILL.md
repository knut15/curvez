---
name: bootstrap
description: 프로젝트에 curvez 를 붙인다. 스택을 감지해 `.curvez/profile.json` 을 확정하고 `.curvez/`·CI 워크플로·lint 설정을 스캐폴드한다. "curvez 붙여줘", "curvez 시작", "초기 설정 해줘", "bootstrap", "set up curvez" 라고 하거나 `.curvez/profile.json` 없이 curvez 작업을 시작하려 할 때 실행한다.
---

`.curvez/profile.json` 은 curvez 의 모든 절차가 기대는 전제다. `stack` 과 `paths` 는 아키텍처 경계의 검사 경로를,
`commands` 는 품질 게이트가 실제로 돌릴 명령을 정한다. 이 파일이 틀리면 그 위의 검사가 전부 같은 방향으로 틀린다.
그래서 규칙은 하나다. **모르는 값을 채우지 않는다.**

## 언제 쓰지 않는가

- 레이어·금지 import 를 정한다 → `architecture-setup` 을 쓴다. bootstrap 은 `architecture.md` 의 자리만 만든다
- `profile.json` 이 이미 있다 → 덮어쓰지 않는다. 아래 "이미 있을 때" 만 적용한다

## 1. 실행기를 돌린다

```bash
node "$CLAUDE_PLUGIN_ROOT/scripts/bootstrap.mjs" --dry-run --json   # 무엇을 만들지 먼저 본다
node "$CLAUDE_PLUGIN_ROOT/scripts/bootstrap.mjs" --json             # 실제로 만든다
```

실행기는 사용자에게 묻지 않는다. 자동으로 판정한 것만 쓰고, 판정하지 못한 것은 `questions[]` 로 돌려준다.
그 질문을 사용자에게 전하는 것이 이 스킬의 일이다.

실행기가 하는 일:

- `package.json` 으로 스택을 감지한다. `next` 가 있고 워크스페이스가 아니면 `nextjs`, 워크스페이스면 앱 구성을 보고 `monorepo` 인지 판정한다
- `package.json` 의 `scripts` 에서 `commands` 를 고른다. 해당 스크립트가 없으면 그 키를 비운다. 명령을 지어내지 않는다
- 원격 브랜치를 읽어 `git` 블록을 채운다
- `.curvez/` 아래 `profile.json`, `architecture.md`(헤딩 7개 골격), `handoff/`, `tmp/` 를 만들고 `.gitignore` 에 `.curvez/tmp/` 한 줄을 넣는다
- 워크플로가 하나도 없고 원격이 GitHub 이면 `.github/workflows/ci.yml` 을 만든다. 게이트 명령은 `commands` 를 그대로 쓴다
- ESLint·Prettier 설정이 하나도 없으면 기본 설정 파일을 만든다
- 루트에 `CLAUDE.md` 가 없으면 템플릿을 복제한다

이미 있는 워크플로, lint 설정, `CLAUDE.md` 는 `--force` 로도 덮지 않는다. `--force` 는 `profile.json` 에만 적용된다.

스택 감지가 애매하면 [references/stack-detection.md](references/stack-detection.md) 를 읽는다.
스택이 정해지면 `$CLAUDE_PLUGIN_ROOT/presets/stack/<stack>.md` 를 읽는다. 그 스택에서만 생기는 오탐과 경로 후보가 있다.

## 2. 질문을 한 번에 묻는다

`questions[]` 가 비어 있지 않으면 **한 번에 모아** 사용자에게 묻는다. 상한은 5문이다.
5문으로 안 끝나면 문항이 많은 것이 아니라 감지가 덜 된 것이다. `package.json` 위치와 워크스페이스 구성을 다시 본다.

답을 받으면 `profile.json` 에 반영한다. 답이 없는 필수 키는 비워 둔 채 멈추고, 무엇이 비었는지 보고한다.

## 3. 사람 손이 필요한 일

실행기가 하지 않는 일이다. 전부 **사용자 승인을 받고** 한다.

| 상황 | 할 일 |
|---|---|
| 통합 브랜치가 원격에 없어 실행기가 로컬에 `release` 를 만들었다 | `git push -u origin release`. push 전까지 `baseBranch` 는 원격에 없는 브랜치다 |
| lint·prettier 설정 파일을 새로 만들었다 | `pnpm add -D eslint @eslint/js globals prettier`, `scripts` 에 `"lint": "eslint ."` 등록, `pnpm lint` 를 실제로 돌린 뒤 `commands.lint` 를 채운다 |
| `packageManager` 감지값이 pnpm 이 아니다 | 바꾸지 않는다. 그 사실만 보고한다 |

설치 없이 `scripts` 만 등록하면 게이트가 매번 `command not found` 로 실패하고, 그 실패는 코드가 깨진 실패와 구분되지 않는다.

## profile.json 형식

```json
{
  "stack": "monorepo",
  "packageManager": "pnpm",
  "architecture": "ddd",
  "paths": { "web": "apps/web", "domain": "packages/domain", "tests": "tests" },
  "git": {
    "baseBranch": "release",
    "releaseBranch": "main",
    "mergeStrategy": "rebase",
    "protectedBranches": ["main", "release"],
    "humanMergeTargets": ["main"]
  },
  "commands": {
    "typecheck": "pnpm typecheck",
    "lint": "pnpm lint",
    "test": "pnpm test",
    "build": "pnpm build"
  }
}
```

| `stack` | 필수 키 | 선택 키 |
|---|---|---|
| `nextjs` | `paths.web` | `paths.tests` |
| `monorepo` | `paths.web`, `paths.domain` | `paths.tests` |

- `paths` 는 저장소 루트 기준 상대 경로이고 끝에 `/` 를 붙이지 않는다
- 모르는 선택 키는 키째로 뺀다. `""` 는 "없음" 이 아니라 "빈 경로" 로 읽혀 루트 전체를 검사하게 된다
- `paths.tests` 만 폴백이 허용된다. 필수 키를 못 채우면 멈춘다
- `humanMergeTargets` 초기값은 `[releaseBranch]` 다. 그 머지가 배포인지는 curvez 가 알 수 없으니 안전한 쪽을 기본으로 둔다. 비우는 것은 사용자만 한다
- `release`·`develop` 이라는 이름만 보고 `baseBranch` 를 정했으면 실행기가 확인 질문을 돌려준다. 오래된 브랜치일 수 있다

## 이미 있을 때

1. 아래 검증 명령을 돌린다
2. `missing=` 에 나온 필수 키만 채운다. 값은 감지 결과나 사용자 답이어야 한다
3. 값이 있는 키는 사용자가 바꾸라고 한 것만 바꾼다. `paths` 하나를 조용히 바꾸면 `architecture.md` 의 검사 경로가 전부 어긋난다
4. 없는 산출물(예: 나중에 추가된 CI 워크플로)은 지금 만든다. 실행기를 다시 돌리면 없는 것만 만든다

## 검증

```bash
node -e '
const fs = require("fs");
const p = JSON.parse(fs.readFileSync(".curvez/profile.json", "utf8"));
const NEED = { nextjs: ["paths.web"], monorepo: ["paths.web", "paths.domain"] };
const need = NEED[p.stack];
if (!need) { console.error("stack 값이 계약 밖이다: " + p.stack); process.exit(1); }
const get = (o, k) => k.split(".").reduce((a, c) => (a == null ? a : a[c]), o);
const missing = need.filter((k) => !get(p, k));
const ghost = Object.entries(p.paths || {}).filter(([, v]) => !fs.existsSync(v)).map(([k, v]) => k + "=" + v);
console.log("stack=" + p.stack, "missing=" + (missing.join(",") || "none"), "notOnDisk=" + (ghost.join(",") || "none"), "commands=" + Object.keys(p.commands || {}).join(","));
process.exit(missing.length || ghost.length ? 1 : 0);
'
```

`missing=none`, `notOnDisk=none`, exit 0 이어야 한다.

## 다음 단계

끝나면 `architecture-setup` 을 부른다. `## 금지 import` 표가 없으면 `quality-gate` 의 경계 검사가 "검사 못 함" 으로 실패한다.

## 완료 기준

- [ ] 검증 명령이 exit 0 이고 `missing=none`, `notOnDisk=none`
- [ ] `commands` 의 모든 값이 `package.json` 의 `scripts` 에 실제로 있는 이름이다
- [ ] `git` 다섯 키가 있고 `baseBranch`·`releaseBranch` 가 원격에 있다. 못 읽었으면 지어내지 않고 멈췄다
- [ ] `.gitignore` 에 `.curvez/tmp/` 가 정확히 1줄, `.curvez/` 통째 무시 줄은 0줄
- [ ] CI 워크플로를 만들었거나 만들지 않은 이유를 보고했다. 기존 워크플로를 덮은 곳은 0곳이다
- [ ] 설치·push 는 사용자 승인을 받고 했다

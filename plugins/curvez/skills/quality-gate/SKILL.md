---
name: quality-gate
description: profile.json 의 commands 로 아키텍처 경계·typecheck·lint·test·build 를 실제로 돌려 결과를 수치로 남긴다. "검증해줘", "테스트 돌려줘", "타입 체크", "린트 돌려", "빌드 되나", "run the tests", "typecheck", "verify it works" 라고 하거나 작업을 끝났다고 보고하기 전에 실행한다.
---

이 스킬이 만드는 것은 **판정할 수 있는 수치**다. "돌려봤다" 가 아니라
`47 tests, 45 passed, 2 failed (auth.login.expired-token, cart.total.discount)` 가 산출물이다.

## 언제 쓰지 않는가

- `.curvez/profile.json` 이 없다 → `bootstrap` 을 먼저 쓴다. 명령을 추측해 돌리지 않는다
- 실패를 고치려고 코드를 쓴다 → 이 스킬은 실패를 수치와 원문으로 남기고 멈춘다
- 테스트를 새로 설계·작성한다 → 이 스킬은 이미 있는 스위트를 돌린다

## 1. 실행기를 돌린다

```bash
node "$CLAUDE_PLUGIN_ROOT/scripts/quality-gate.mjs" [--json] [--only arch,typecheck] [--no-stop]
```

실행기가 하는 일:

- 명령은 `.curvez/profile.json` 의 `commands` 에서만 읽는다. 비어 있는 명령은 그 게이트를 건너뛰고 미실행으로 표시한다
- 순서는 **arch → typecheck → lint → test → build** 다. 싸고 파급이 큰 것부터 돈다. 앞 게이트가 실패하면 뒤는 중단한다(`--no-stop` 으로 끌 수 있다)
- arch 는 `.curvez/architecture.md` 의 `## 금지 import` 표를 읽어 규칙마다 위반 파일을 센다. 규칙을 하나도 못 읽으면 "위반 없음" 이 아니라 "검사 못 함" 으로 실패한다
- test 가 0개 실행이면 exit 0 이어도 통과로 치지 않는다
- 안 돌린 게이트는 결과 항목을 만들지 않는다
- exit code: 0 = 전부 통과, 1 = 하나 이상 실패, 2 = 진행 불가(프로파일 없음 등)

`--json` 출력은 `verification[]` 형태라 핸드오프에 그대로 넣을 수 있다.

## 2. 무엇을 돌릴지 고른다

매번 전부 돌리면 느리다. 바뀐 범위로 정한다.

| 상황 | 돌리는 게이트 |
|---|---|
| `.curvez/**` 나 `*.md` 만 바뀜 | 없음. 실행 코드가 그대로면 결과도 그대로다 |
| 소스 1~2 파일, 중간 확인 | `--only arch,typecheck,lint` |
| 테스트 파일만 추가·수정 | `--only typecheck,test` |
| 작업 완료 보고 직전 | arch + typecheck + lint + test |
| 의존성·설정 변경(`package.json`, lockfile, `tsconfig`, `next.config`) | 5종 전부 |
| 브랜치를 마무리할 때 | 5종 전부 |

build 는 가장 느리고 앞 4종이 못 잡는 것만 더 잡는다. 그래서 매번 돌리지 않지만, 설정과 의존성이 바뀌면 반드시 돌린다.
Next.js 에서 build 만 잡는 것과 `ignoreBuildErrors` 같은 함정은 [references/nextjs.md](references/nextjs.md) 에 있다.

## 3. 수치로 보고한다

"통과했다", "모두 정상", "이상 없음" 을 쓰지 않는다. 몇 개 중 몇 개인지, 무엇이 실패했는지가 지워진다.

| 게이트 | 좋은 결과 | 나쁜 결과 |
|---|---|---|
| typecheck | `0 errors` / `3 errors (src/a.ts:12 외 2건)` | `통과` |
| lint | `0 errors, 5 warnings` | `깨끗함` |
| arch | `규칙 4건 검사, 위반 0건` / `ARCH-002 위반 3파일` | `경계 지킴` |
| test | `47 tests, 45 passed, 2 failed (auth.login.expired-token, cart.total.discount)` | `대부분 통과` |
| build | `exit 0, warnings 2` | `빌드 성공` |

실패한 것은 이름을 전부 적는다. 고칠 사람에게 넘길 때는 실패한 이름, 원문 출력, 그 하나만 다시 돌리는 명령을 함께 넘긴다.

테스트 개수는 직전 실행과 비교한다. 1 이상이어도 크게 줄었으면 스위트 일부가 조용히 빠졌다는 신호다.

## 4. 실패를 숨기지 않는다

다음은 전부 금지다.

- 실패한 테스트를 지우거나 `skip` / `only` / `todo` 로 바꾸기
- 기대값을 실제 출력에 맞춰 고치기
- `// @ts-ignore`, `eslint-disable`, `--force` 로 초록불 만들기
- 재시도 설정으로 플래키 덮기. 플래키 의심이면 같은 명령을 3회 돌려 exit code 가 전부 같은지 본다

억제 주석은 오류가 아니라 오류 신호만 지운다. 결함은 남고 다음부터 안 보인다.
포매터가 안전하게 고치는 서식(`--fix`)만 예외이고, 그때도 무엇을 고쳤는지 보고한다.

억제 흔적이 늘지 않았는지 센다. 직전 실행 대비 증가가 0 이어야 한다.

```bash
grep -rnE '\b(it|test|describe)\.(skip|only|todo)\b|\bx(it|describe)\(|@ts-ignore|@ts-nocheck|eslint-disable' \
  --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.curvez . 2>/dev/null | wc -l
```

## 5. verification 으로 옮긴다

핸드오프를 쓰는 중이면 결과를 `verification[]` 에 그대로 넣는다. 그릇의 형식은 `agent-contract` 가 정한다.

- `command` 는 실제로 실행한 문자열 그대로. `"타입 확인"` 같은 설명으로 바꾸지 않는다
- `passed` 는 test 의 경우 실행 개수 1 이상이고 실패 0 일 때만 `true`
- 항목 수는 실제로 돌린 게이트 수와 같다

`done` 은 typecheck + lint + test 결과가 있어야 쓸 수 있다. 게이트를 하나도 못 돌렸으면 `done` 이 아니다.

## 완료 기준

- [ ] 명령을 `profile.json` 에서 읽었다. 하드코딩한 명령 실행 0건
- [ ] test 를 돌렸다면 실행 개수 1 이상을 출력으로 확인했다
- [ ] arch 를 돌렸다면 규칙 수와 위반 수가 둘 다 수치로 나왔다
- [ ] 억제 흔적이 직전 대비 늘지 않았다
- [ ] 보고에 "통과했다" 대신 `N개 중 M개 통과, 실패: <이름>` 형식을 썼다
- [ ] 돌리지 않은 게이트는 미실행으로 적었다

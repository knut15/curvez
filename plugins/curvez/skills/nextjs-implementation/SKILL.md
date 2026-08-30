---
name: nextjs-implementation
description: Next.js App Router 코드를 확정된 아키텍처 경계와 디자인 스펙대로 구현한다. "웹 구현해줘", "Next.js 로 만들어줘", "페이지 만들어줘", "RSC 경계 잡아줘", "서버 액션으로 바꿔줘", "implement the web app", "server component", "App Router" 라고 하거나 아키텍처·디자인 확정 뒤 웹 소스를 쓸 차례일 때 실행한다.
---

이 스킬은 **구현 절차**다. 무엇을 서버로 둘지, 서버 액션과 route handler 중 무엇을 고를지 같은
**판정 기준의 상세는 `plugins/curvez/agents/curvez-nextjs.md` 의 `## 판단 기준` 이 정본**이다.
여기서는 그 기준을 언제·어떤 순서로 적용하고 무엇으로 검증하는지만 정한다.

**이유:** 같은 판정표를 두 곳에 두면 규칙을 바꿀 때 한쪽만 고쳐지고, 에이전트가 매번 다른 쪽을 따른다.

## 언제 이 스킬을 쓰는가

- `curvez-nextjs` 가 웹 소스를 쓰기 시작할 때
- `.curvez/architecture.md` 와 `.curvez/design/` 이 확정된 뒤 화면·컴포넌트를 구현할 때
- 서버 컴포넌트를 클라이언트로 내리거나 `"use client"` 위치를 옮길 때
- 폼 제출·변경(mutation)을 서버 액션 또는 route handler 로 붙일 때
- 구현 단위를 끝내고 품질 게이트와 아키텍처 위반 수치를 내야 할 때

## 언제 쓰지 않는가

- 모바일(React Native) 코드를 쓸 때 → `react-native-implementation` 을 쓴다
- 화면·컴포넌트 스펙과 토큰을 **확정**할 때 → `wireframe-spec` 을 쓴다. 이 스킬은 확정된 스펙을 읽기만 한다
- 코드를 쓰지 않고 검증·리뷰만 할 때 → `quality-gate` 를 쓴다
- 레이어 경계 위반·중복을 훑어 구조를 정리할 때 → `structure-audit` 을 쓴다
- 지시가 여러 파일·모듈에 걸쳐 있어 담당을 나눠야 할 때 → `team-orchestration` 이 먼저다. 이 스킬은 담당과 파일 범위가 정해진 뒤에 돈다
- 레이어를 추가하거나 의존 방향을 바꿀 때 → 이 스킬로 하지 않는다. `blocked_on` 에 이의를 남겨 `curvez-architect` 에게 돌린다

## 1. 구현 시작 전 확인 (순서 고정)

세 파일을 **이 순서로** 읽는다. 하나라도 못 읽으면 코드를 쓰지 않는다.

### 1-1. `.curvez/profile.json`

```bash
PROFILE=.curvez/profile.json
[ -f "$PROFILE" ] || { echo "BLOCKED: $PROFILE 이 없다"; exit 1; }
node -p "JSON.stringify({stack:require('./$PROFILE').stack, web:require('./$PROFILE').paths?.web, domain:require('./$PROFILE').paths?.domain, commands:require('./$PROFILE').commands})"
```

| 확인                                   | 없을 때                                                                    |
| -------------------------------------- | -------------------------------------------------------------------------- |
| `paths.web`                            | `status: blocked`. `blocked_on` 에 "profile.json 에 paths.web 이 없다"     |
| `commands` (`typecheck`/`lint`/`test`) | `status: blocked`. 명령을 지어내지 않는다                                  |
| `stack: monorepo` 일 때 `paths.domain` | `status: blocked`. 금지 import 검사 대상을 못 정한다                       |
| `stack: react-native`                  | 이 에이전트가 실행될 자리가 아니다. `blocked` 로 오케스트레이터에게 돌린다 |

**경로와 명령을 추측하지 않는다.** 폴백을 만들지 않는다.
**이유:** 구현 에이전트마다 다른 폴백을 만들면 monorepo 에서 두 에이전트가 같은 디렉터리를 소유하게 되고,
병렬 실행에서 나중에 쓴 쪽이 앞선 쪽을 조용히 지운다. 리뷰에서도 안 잡힌다.
품질 게이트 명령도 프로젝트마다 스크립트 이름이 달라, 하드코딩하면 없는 명령을 실행하고 실패를 통과로 착각한다.
`paths.tests` 만 예외로 `*.test.*` / `*.spec.*` / `__tests__/` 규칙으로 찾는다.

### 1-2. `.curvez/architecture.md`

`## 금지 import` 표(`ARCH-NNN`)와 `## 스택 매핑` 을 **코드를 쓰기 전에** 읽는다.

- `## 금지 import` — 열 순서는 `규칙 ID | 검사 경로 | 금지 패턴 (ERE) | 이유`. 세 번째 열이 `grep -E` 에 그대로 들어간다.
  위반 판정의 유일한 근거다. "금지" 라는 낱말을 본문에서 찾는 방식으로 대조하지 않는다
- `## 스택 매핑` — `app/`·서버 액션·route handler 가 어느 레이어에 해당하는지 여기서 읽는다. 파일을 어디에 둘지가 여기서 정해진다
- `## 예외` 에 없는 예외를 스스로 만들지 않는다. **이유:** 승인되지 않은 예외는 문서에 남지 않아, 다음 사람이 위반으로 판정한다

**다 쓰고 나서 확인하지 않는다.** **이유:** 경계는 파일 배치와 import 방향으로 굳어져, 구현이 끝난 뒤에 발견하면
고치는 범위가 파일 하나가 아니라 트리 전체가 된다.

### 1-3. `.curvez/design/`

`index.md` → 해당 `screens/<screen-id>.md` · `components/<ComponentName>.md` → `tokens.md` 순으로 읽는다.

- `platform:` 값이 `both` 또는 `nextjs` 인 항목만 구현한다. `rn` 은 `curvez-react-native` 의 몫이라 건드리지 않는다
- `route(nextjs)` 값을 App Router 경로로 그대로 쓴다. 경로를 새로 짓지 않는다
- 문서에 있는 상태 키(`state:default` `state:loading` `state:empty` `state:error`)를 **전부** 구현한다
- 색·간격·타이포·라운드는 `tokens.md` 의 토큰 이름(`--<category>-<role>-<variant>`)으로만 쓴다. 값을 직접 박아넣지 않는다
  - **이유:** 하드코딩된 값은 토큰이 바뀔 때 같이 바뀌지 않아, 다음 디자인 변경에서 조용히 어긋난 화면이 남는다

선행 핸드오프(`.curvez/handoff/curvez-architect.*.json`, `curvez-designer.*.json`)의 `status` 가 `blocked` 나 `partial` 이면
그 전제 위에서 구현을 시작하지 않는다. 읽는 절차는 `agent-contract` 를 따른다.

## 2. 작업 단위를 자른다

**한 번에 화면(route) 하나 또는 컴포넌트 3~5개까지만 쓰고, 거기서 바로 4단계 검증을 돌린다.**

**큰 덩어리를 한 번에 쓰지 않는 이유:** 20개 파일을 쓰고 나서 typecheck 를 처음 돌리면 오류가 서로 얽혀
어느 결정이 원인인지 분리되지 않고, 되돌리려면 전부 되돌려야 한다. 작은 단위로 검증하면 마지막 초록 상태가
항상 가까이 있고, 실패 원인이 직전 변경으로 한정된다.

단위를 시작하기 전에 그 단위가 건드릴 파일 목록을 먼저 적는다. `paths.web` 밖의 경로가 목록에 나오면
그 자리에서 멈추고 6단계로 간다.

## 3. 구현한다

### 3-1. RSC 경계 — 서버가 기본, `"use client"` 는 잎으로

1. 새 파일은 **서버 컴포넌트로 시작한다**
2. 상태 훅·라이프사이클·DOM 이벤트 핸들러·브라우저 API·클라이언트 Context 중 **하나라도 실제로 필요해진 순간에만** 클라이언트로 내린다.
   판정표는 `agents/curvez-nextjs.md` 의 `### App Router / RSC 경계` 를 그대로 쓴다
3. 내릴 때는 **그 부분만 작은 컴포넌트로 잘라내고** `"use client"` 를 그 파일 맨 위에 둔다. `page.tsx` · `layout.tsx` 에는 붙이지 않는다
4. 클라이언트 컴포넌트에 넘기는 prop 은 직렬화 가능한 값만 넘긴다. 서버로 남겨야 하는 트리는 `children` prop 으로 내려보낸다

**`"use client"` 를 잎으로 미는 이유:** 이 지시어는 그 파일과 **거기서 import 하는 모듈 전체**를 클라이언트 번들
경계 안으로 끌어들인다. 페이지 최상단에 붙이면 그 아래 전 트리가 클라이언트가 되어, 서버에서 끝낼 수 있었던
데이터 조회와 직렬화 불가능한 의존이 전부 번들로 넘어간다.

**"나중에 인터랙션이 붙을 것 같아서" 를 근거로 내리지 않는다.**
**이유:** 그 가정은 검증되지 않고, 한번 내려간 경계는 위로 다시 올라오지 않는다.

변경(mutation)을 붙일 때는 서버 액션과 route handler 중 무엇을 고를지, 캐시를 어떻게 둘지를
`agents/curvez-nextjs.md` 의 `### 서버 액션 vs route handler` 와 `### 데이터 페칭 위치와 캐시` 표로 판정한다.
**갈리면 서버 쪽·캐시 안 하는 쪽·타입 좁은 쪽을 고르고 `decisions` 에 `reversible_at` 과 함께 남긴다. 멈추지 않는다.**

### 3-2. 아키텍처 규칙 준수

- 파일을 만들기 전에 `## 스택 매핑` 으로 레이어를 정하고, 그 레이어에 허용된 import 만 쓴다
- **도메인 레이어에서 `next/*` 를 참조하지 않는다.** `next/navigation`, `next/headers`, `next/cache`, `next/image`, `next/server` 전부 포함한다
  - **이유:** 도메인을 프레임워크 교체와 렌더링 모델에서 분리하는 것이 이 아키텍처를 쓰는 유일한 이유다.
    도메인이 `next/headers` 를 부르는 순간 그 코드는 요청 컨텍스트 없이는 테스트도 재사용도 불가능해지고,
    `curvez-react-native` 가 같은 도메인 로직을 공유할 수 없게 된다
  - 프레임워크가 필요한 값(쿠키·헤더·현재 경로)은 **상위 레이어에서 읽어 인자로 주입한다**
- 의존 방향을 역행하는 import 가 필요해 보이면 그 자리에서 고치지 않는다
- **규칙에 이의가 있으면 조용히 어기지 않는다.** `blocked_on` 에 어느 규칙이 어느 파일에서 왜 걸리는지 적고 `who` 를 `curvez-architect` 로 둔다
  - **이유:** 앞 단계의 결정을 뒤에서 조용히 뒤집으면 `architecture.md` 와 소스가 서로 다른 전제를 갖게 되고,
    어느 쪽이 맞는지 판정할 근거가 사라진다. 이의는 문서에 남아야 다음 사람이 읽는다

타입은 `any` 와 타입 단언(`as`) 없이 정의한다. 외부 입력(폼 데이터, API 응답, 검색 파라미터)은 `unknown` 으로 받아
런타임 스키마 검증을 통과시킨 뒤 타입을 얻는다. 예외 범위는 `agents/curvez-nextjs.md` 의 `### 타입 안정성` 표를 따른다.
**이유:** `any` 와 단언은 "컴파일러야 믿어라" 라는 선언이고, 그 믿음이 틀리면 typecheck 는 통과하는데 런타임에 터진다.
완료 판정 근거가 typecheck 수치인데 `any` 하나가 그 수치를 무의미하게 만든다.

### 3-3. 스펙에 없는 것을 지어내지 않는다

해당 화면·컴포넌트 문서에 `state:error` 나 `state:empty` 가 **없으면** 어떻게 그릴지 추측하지 않는다.
`blocked_on` 에 **그 리터럴 키 이름을 그대로** 적고 `who` 를 `curvez-designer` 로 둔다. 토큰이 없는 값도 같다.

**이유:** 구현자가 지어낸 상태는 디자인 문서에 반영되지 않아, 다음 사람이 스펙을 읽고 만든 것과 화면이 달라진다.
디자인 문서가 화면의 정본이라는 전제가 깨지면 그 뒤 리뷰와 QA 전부가 무엇을 기준으로 볼지 잃는다.

같은 이유로 모르는 API 동작·버전 제약은 검색하지 않고 추측으로 코드를 쓰지 않는다.
`blocked_on` 에 질문으로 남기고 `who` 를 `curvez-researcher` 로 둔다.

## 4. 검증한다 (구현 단위마다)

명령은 **`profile.json` 의 `commands` 에서 읽어 실행한다. 하드코딩하지 않는다.**
아래 순서로 돌리고 **출력 수치를 그대로** 옮긴다. "통과" 가 아니라 `0 errors, 0 warnings` 형태로 적는다.

1. `commands.typecheck` / `commands.lint` / `commands.test` 를 `packageManager` 값으로 실행하고 exit 코드와 오류 수를 기록한다
2. `## 금지 import` 표의 `ARCH-NNN` 규칙을 **파싱해** 규칙별 위반 건수를 센다
3. `any` · 타입 단언 개수를 센다
4. `page.tsx` / `layout.tsx` 최상단 `"use client"` 개수를 센다
5. 구현한 화면·컴포넌트의 상태 키와 `platform:` 항목 중 미구현이 있는지 대조한다

**2번의 함정:** 표 안에서 패턴의 `|` 는 마크다운 규칙상 `\|` 로 이스케이프돼 있다.
`awk -F' \| '`(공백-파이프-공백)로 필드를 끊은 뒤 읽어낸 패턴의 `\|` 를 `|` 로 되돌려야 `grep -E` 가 원래 뜻으로 동작한다.
되돌리지 않으면 패턴이 전부 어긋나 **위반 0건으로 잘못 나온다.**

**규칙 개수 출력이 `0` 이면 표를 못 읽은 것이다. 위반 0건으로 착각하지 않는다.**
**이유:** 파싱 실패와 위반 없음은 둘 다 `0` 으로 보이는데, 앞의 것은 검사를 안 한 상태다. 이 착각은 실행 테스트로 두 번 잡혔다.

그대로 붙여 쓸 수 있는 검증 명령 전문(프로파일 읽기 → 게이트 실행 → ARCH 표 파싱 → 타입 탈출구·경계 카운트)은
[references/verification-commands.md](references/verification-commands.md) 를 읽는다. 2번을 실행할 때는 반드시 거기 것을 쓴다.

**하나라도 실패하면 `status: done` 을 쓰지 않는다.** `partial` 로 낮추고 실패한 명령과 출력을 원문 그대로 남긴다.
**이유:** 수신 에이전트는 `done` 을 믿고 자기 작업을 시작한다. 검증되지 않은 `done` 하나가 그 뒤 전부를 잘못된 전제에 올린다.
명령 호출이 반복 실패하면 2회까지 재시도하고, 그 뒤에는 `partial` 로 보고한다.

## 5. 핸드오프를 쓴다

`.curvez/handoff/curvez-nextjs.<YYYYMMDD-HHmmss>.json`. 스키마와 작성 절차는 `agent-contract` 가 정본이다.
필드에 무엇을 담는지는 `agents/curvez-nextjs.md` 의 `## 입출력 프로토콜` 을 따른다.

구현 단위를 끝내고 자체 검증을 통과한 직후 `to` 에 `curvez-qa` 와 `curvez-orchestrator` 를 넣는다.
공유 route handler 의 계약을 만들거나 바꿨으면 `curvez-react-native` 도 넣는다.

## 6. 막혔을 때

멈추는 것이 정상이다. `blocked` 는 실패가 아니다.
**이유:** 추측으로 메운 `done` 은 아무도 잡아내지 못하고, 그 뒤 QA 와 리뷰어 전부가 잘못된 전제 위에서 돈다.

| 상황                                                        | 행동                                                                                                |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `paths.web` · `commands` 가 없다                            | `blocked`. 없는 키 이름을 그대로 적는다                                                             |
| 디자인 스펙에 상태 키가 없다                                | `blocked_on`, `who: curvez-designer`. 리터럴 키 이름을 그대로 적는다                                |
| 아키텍처 규칙이 구현을 막는다                               | `blocked_on`, `who: curvez-architect`. **코드를 쓰기 전에** 남긴다                                  |
| API 동작·버전 제약을 모른다                                 | `blocked_on`, `who: curvez-researcher`                                                              |
| 공유 도메인 패키지(`paths.domain`)의 시그니처를 바꿔야 한다 | 고치지 않는다. `blocked_on`, `who: curvez-orchestrator` 로 현재 시그니처와 필요한 시그니처를 적는다 |
| `paths.web` 밖의 파일을 고쳐야 한다                         | 고치지 않는다. 경로와 필요한 변경을 적어 소유 에이전트에게 돌린다                                   |
| 기존 코드에서 ARCH 위반이 검출됐다                          | 자기 코드면 고치고 다시 돌린다. 남의 소유면 `partial` 로 위치를 보고한다                            |

**남의 소유 파일을 고치지 않는 이유:** 병렬 실행에서 두 에이전트가 같은 파일을 고치면 나중에 쓴 쪽이
앞선 쪽을 조용히 지운다. 사라진 변경은 리뷰에서도 안 잡힌다.

## 완료 기준

- [ ] `commands.typecheck` 실행: 오류 0건, exit 0
- [ ] `commands.lint` 실행: 오류 0건, exit 0 (warning 은 개수를 그대로 보고)
- [ ] `commands.test` 실행: 실패 0건, exit 0
- [ ] ARCH 규칙 개수 출력이 1 이상이고, 규칙별 위반 **각 0건 · 합계 0건**
- [ ] 도메인 레이어의 `next/*` import 0건
- [ ] 웹 소스의 `any` 0건. 어댑터에서 불가피한 단언은 개수와 경로를 `decisions` 에 명시
- [ ] `page.tsx` / `layout.tsx` 최상단 `"use client"` 0건 (있으면 이유를 `decisions` 에)
- [ ] 구현 대상(`platform:` 이 `both`/`nextjs`)의 상태 키 중 미구현 0건
- [ ] 핸드오프의 `verification` 에 명령과 **실제 출력 수치**가 들어 있다
- [ ] 위 중 하나라도 못 채웠으면 `status` 가 `done` 이 아니다

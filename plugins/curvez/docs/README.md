# curvez

Next.js·React Native 프로젝트를 위한 **오케스트레이션 하네스**다.

새 프로젝트에 붙이면 — 요구사항과 아키텍처와 화면 스펙을 값으로 확정하고, 담당 에이전트를 세팅하고,
공통 스킬·검증 스크립트를 갖춘 상태에서 곧바로 팀 병렬 개발에 들어갈 수 있다.

curvez 는 **보일러플레이트**다. 여기 들어 있는 13종 에이전트와 15종 스킬은 어느 프로젝트에나
공통으로 필요한 뼈대이고, 프로젝트 고유의 세부 에이전트·스킬은 프로젝트 담당자가 직접 만든다.
그래서 curvez 의 산출물 중 가장 중요한 것은 기능이 아니라 **"새 에이전트·스킬을 어떻게 쓰는가" 의
규약과 그것을 기계로 강제하는 검증 스크립트**다. 확장 방법은 [확장 가이드](extending.md)에 있다.

---

## 설치

curvez 는 Claude Code **플러그인 마켓플레이스** 형태로 배포된다.
저장소 자체가 마켓플레이스이고, 그 안의 `plugins/curvez` 가 플러그인이다.

```
/plugin marketplace add knut15/curvez
/plugin install curvez@curvez
```

curvez 자체를 고치면서 쓸 때는 GitHub 대신 로컬 체크아웃을 등록한다.
원격을 등록하면 캐시된 사본이 붙으므로 방금 고친 파일이 반영되지 않는다.

```
/plugin marketplace add ~/Workspace/curvez
```

### 업데이트

**계정당 한 번이면 그 계정의 모든 프로젝트에 동시에 적용된다.** user scope 설치라 프로젝트마다
반복하지 않는다. 다만 **순서가 둘이고, 1단계를 건너뛰면 아무 일도 일어나지 않는다.**

#### 1. 마켓플레이스를 먼저 갱신한다

```
/plugin marketplace update curvez
```

curvez 를 원격(`knut15/curvez`)으로 등록해 쓰면, 로컬에 **마켓플레이스 클론**이 하나 생긴다
(`~/.claude/plugins/marketplaces/curvez`). 플러그인 업데이트는 원격을 직접 보지 않고
**이 클론을 보고 버전을 판단한다.** 클론이 옛 커밋에 멈춰 있으면 새 버전이 있다는 사실 자체를
모르므로, 2단계를 아무리 눌러도 "이미 최신" 으로 끝난다.

슬래시 커맨드가 안 먹으면 클론은 그냥 git 저장소이므로 직접 당겨도 된다.

```bash
git -C ~/.claude/plugins/marketplaces/curvez pull --ff-only
grep '"version"' ~/.claude/plugins/marketplaces/curvez/plugins/curvez/.claude-plugin/plugin.json
```

두 번째 줄이 올리려는 버전을 보여주면 1단계가 끝난 것이다.

#### 2. 플러그인을 업데이트한다

```
/plugin
```

**`curvez@curvez` 는 discover 목록에 없다.** discover 는 **아직 설치하지 않은** 플러그인만
보여준다. 이미 설치돼 있으므로 **설치된 플러그인(manage/installed) 쪽**에서 골라 업데이트한다.
discover 에서 찾다가 "curvez 가 사라졌다" 고 판단하지 마라 — 설치돼 있다는 뜻이다.

#### 3. 확인하고 재시작한다

| 확인할 것 | 되어야 하는 상태 |
|---|---|
| `~/.claude/plugins/cache/curvez/curvez/` | 새 버전 디렉터리가 생겼다 |
| `~/.claude/plugins/installed_plugins.json` 의 `curvez@curvez` | `version` 과 `gitCommitSha` 가 올라갔다 |

```bash
node "$CLAUDE_PLUGIN_ROOT/scripts/doctor.mjs"
```

에이전트 13/13 · 스킬 15/15 통과, exit 0 이면 된다.

**업데이트 뒤 Claude Code 를 재시작한다.** 돌고 있는 세션은 옛 버전을 물고 있어, 그 세션에서
에이전트를 띄우면 옛 규약으로 돈다.

#### 반영이 안 될 때

| 증상 | 원인 | 조치 |
|---|---|---|
| discover 에 curvez 가 없다 | 정상이다. discover 는 미설치 플러그인만 보여준다 | 설치된 플러그인 쪽에서 찾는다 |
| 업데이트를 눌러도 버전이 그대로다 | 마켓플레이스 클론이 옛 커밋이다 | 1단계를 실행한다 |
| 클론을 갱신해도 그대로다 | 고친 것이 GitHub 기본 브랜치에 머지되지 않았다 | 로컬 커밋만으로는 부족하다. push·머지까지 한다 |
| 버전은 올랐는데 동작이 그대로다 | 세션이 옛 버전을 물고 있다 | Claude Code 를 재시작한다 |

**업데이트 뒤 프로젝트에서 할 일**은 [마이그레이션 노트](migration.md)가 버전별로 정리한다.
대부분의 버전에서 할 일은 없지만, `.curvez/` 를 손대야 하는 변경이 있으면 거기에 적힌다.

---

설치하면 에이전트 13종이 서브에이전트 이름으로 등록되고, 스킬 15종이 `curvez:` 네임스페이스로 붙는다.
스킬은 `/curvez:<스킬명>` 으로 직접 부를 수도 있고, 스킬 `description` 의 트리거 문구에 걸려
자동으로 호출되기도 한다.

---

## 전체 그림

### 구성 요소

| 층 | 위치 | 무엇인가 |
|---|---|---|
| 에이전트 13종 | `plugins/curvez/agents/*.md` | 누가 무엇을 책임지는가. 역할·도구 권한·소유 경로·통신 상대 |
| 스킬 15종 | `plugins/curvez/skills/*/SKILL.md` | 무엇을 순서대로 하는가. 실행 중인 에이전트가 읽는 절차서 |
| 스크립트 | `plugins/curvez/scripts/*.mjs` | 규약을 기계로 검사한다. node ESM, 외부 의존성 0 |
| 프로젝트 상태 | 대상 프로젝트의 `.curvez/` | 이 프로젝트의 결정과 실행 이력. git 커밋 대상 |

에이전트와 스킬은 서로를 대체하지 않는다. **에이전트 정의는 판정 기준의 정본**이고,
**스킬은 순서와 검증의 정본**이다. 같은 표를 양쪽에 두지 않고 한쪽이 다른 쪽을 경로로 가리킨다 —
값이 두 곳에 있으면 하나만 고쳐졌을 때 어느 쪽이 맞는지 판정할 근거가 사라지기 때문이다.
이 분리 원칙 자체의 근거는 [설계 근거](design-rationale.md)에 있다.

### 두 축: 오케스트레이터와 파일

curvez 의 팀 실행은 두 가지 제약 위에 서 있다.

1. **`Agent` 도구를 가진 에이전트는 `curvez-orchestrator` 하나뿐이다.** 워커는 다른 워커를 띄우지 못한다
2. **워커끼리 실시간으로 대화하지 못한다.** 모든 통신은 `.curvez/handoff/<from>.<타임스탬프>.json`
   파일을 거친다. 이 계약이 곧 에이전트 간 API 다

여기서 나머지 규칙 대부분이 파생된다. 워커는 사용자에게 직접 묻지 못하므로 질문은 오케스트레이터가
중계하고, 읽기 전용 리뷰어 2종(`curvez-reviewer`, `curvez-structure-reviewer`)은 파일을 못 쓰므로
응답 텍스트를 JSON 으로 반환하고 오케스트레이터가 대필한다.
계약의 필드와 상태 전이는 [핸드오프 계약](handoff-contract.md), 병렬·소유권·승인 판정은
[팀 실행 모델](team-execution.md)이 다룬다.

### 한 라운드가 흘러가는 모양

오케스트레이터는 워커를 띄우고 → 기다리고 → 핸드오프를 수합하고 → 다음 라운드를 정한다.
워커와 동시에 돌지 않는다. 전형적인 흐름은 이렇다.

```
사용자 지시
     │
     ▼
curvez-orchestrator ── 팀 구성안 → 사용자 승인 ──┐   (승인 전에는 워커를 띄우지 않는다)
                                                 │
  ┌──────────────────────────────────────────────┘
  │
  ├─ R1  curvez-requirements   ∥  curvez-researcher      → .curvez/requirements.md, .curvez/research/
  ├─ R2  curvez-architect      ∥  curvez-designer        → .curvez/architecture.md, .curvez/design/
  ├─ R3  curvez-nextjs         ∥  curvez-react-native    → 소스 트리
  ├─ R4  curvez-qa                                       → 테스트 + 실행 수치
  ├─ R5  curvez-reviewer       ∥  curvez-structure-reviewer  → findings[] (오케스트레이터가 대필)
  └─ R6  curvez-retrospector                             → docs/retro/, 규약 수정안
  │
  ▼
각 라운드 종료 시: .curvez/handoff/*.json 수합 → 검증 → 다음 라운드 판정
```

`∥` 는 병렬이다. 병렬로 둘 수 있는 이유는 **소유 경로가 겹치지 않기 때문**이고, 겹치면 오케스트레이터가
순차로 강등한다. 예를 들어 모노레포의 공유 도메인 패키지를 건드리는 라운드에서는 구현 에이전트 2종을
동시에 띄우지 않는다.

이 그림은 표준형이지 고정된 파이프라인이 아니다. 지시가 이미 한 문장으로 굳어 있으면 R1 을 건너뛰고,
웹 전용 스택이면 R3 에 워커가 하나만 선다. 라운드 구성과 병렬 여부는 매번 오케스트레이터가 판정해
`.curvez/team.md` 에 근거와 함께 기록하고 사용자 승인을 받는다.

### 프로젝트 상태 디렉터리

```
.curvez/
├─ profile.json       # 스택·소스 경로·품질 게이트 명령. curvez 전체의 진입 전제
├─ architecture.md    # 확정 아키텍처. 레이어 경계와 기계 검사 가능한 금지 import 목록
├─ requirements.md    # 판정 가능한 수용 기준
├─ team.md            # 이번 작업의 팀 명단·소유 경로·라운드 구성·승인 시각
├─ design/            # 화면·토큰·컴포넌트 스펙
├─ research/          # 1차 출처 조사 브리프
├─ handoff/           # 에이전트 간 계약 로그
└─ tmp/               # gitignore 대상
```

`.curvez/` 는 **git 커밋 대상**이다(`tmp/` 만 제외). 에이전트 간 계약이 사람이 리뷰할 수 있는
형태로 남아야 무엇이 언제 결정됐는지 나중에 복원할 수 있다.

`profile.json` 이 틀리면 그 위에서 도는 모든 워커가 같은 방향으로 틀린다. 그래서 스택별 필수 키가
없을 때 에이전트는 경로를 **추측하지 않고** `status: blocked` 로 돌아온다. 필수 키 목록과 폴백
허용 범위는 `plugins/curvez/skills/bootstrap/SKILL.md` 가 정본이다.

---

## 첫 사용

설치 직후 프로젝트에는 아직 `.curvez/` 가 없다. 순서는 하나다.

1. **`curvez:bootstrap`** — 스택을 감지하고, 못 채운 값만 인터뷰로 확정해 `.curvez/profile.json` 을
   만들고 `.curvez/` 를 스캐폴드한다. 이 단계가 없으면 오케스트레이터는 어떤 워커도 띄우지 않고
   blocked 로 돌아온다
2. **`curvez:architecture-setup`** — DDD 프리셋을 확인하고 짧은 인터뷰로 레이어명·경계 규칙을
   조정해 `.curvez/architecture.md` 를 확정한다. 구현 에이전트 전원의 필수 참조다

그 뒤부터는 평소대로 작업을 지시하면 된다. 여러 파일·모듈에 걸친 지시면 `team-orchestration` 이
걸려 오케스트레이터가 팀 구성안을 들고 승인을 요청한다.

---

## 지금의 빌드 상태

**실제로 실행해서 확인한 현재 상태다.** 없는 것을 있는 것처럼 쓰면 실행하다 막히므로 그대로 적는다.

| 항목 | 상태 |
|---|---|
| 에이전트 13종 | 있음 (`plugins/curvez/agents/`) |
| 스킬 15종 | 있음 (`plugins/curvez/skills/`) |
| 검증·스캐폴딩 | 있음 — `validate-agents` `validate-skills` `validate-handoff` `new-agent` `new-skill` `doctor` |
| 실행기 | 있음 — `bootstrap.mjs` (스택 감지·프로파일·스캐폴드), `quality-gate.mjs` (게이트 실행·수치 출력) |
| 프리셋 | 있음 — 아키텍처 `ddd` 1종, 스택 3종 (`nextjs` `react-native` `monorepo`) |
| 훅 | 있음 — `guard-bash` `validate-on-write` `check-handoff`. `hooks/hooks.json` 으로 등록 |

**아직 확인되지 않은 것 하나:** `/plugin marketplace add` + `/plugin install` 로 실제 설치했을 때
로더가 에이전트·스킬·훅을 인식하는지는 검증되지 않았다. 스크립트를 직접 호출한 검증만 마쳤고,
실제 Claude Code 환경에서의 멀티에이전트 end-to-end 왕복도 아직 없다.

`doctor` 가 이 표의 항목을 기계로 검사한다 — 개수와 "없음" 서술이 실제와 어긋나면 exit 1 이다.
표를 손으로 고치는 것을 잊어도 검증에서 걸린다.

## 문서는 서로 어떻게 연결되는가

curvez 의 문서는 네 층이고 **층마다 참조 형태가 다르다.** 이 구조를 모르면
"링크가 없으니 고립됐다" 고 오판하거나, 반대로 진짜 고립을 놓친다.

```
docs/README.md  ← 유일한 진입점
   │ 마크다운 링크
   ▼
docs/*.md  (설계 근거)
   │ 백틱 경로로 정본을 가리킴
   ▼
skills/*/SKILL.md  (절차)  ──링크──▶  skills/*/references/*.md  (조건부 상세)
   │ 이름으로 참조 (`curvez:<name>`)
   ▼
agents/*.md  (역할·권한)
   │ 이름으로 참조 (`curvez-<name>`)
   ▼
scripts/lib/spec.mjs  (규약 수치의 단일 출처)
```

| 층 | 무엇이 가리키는가 | 형태 | 검사 |
|---|---|---|---|
| `docs/*.md` | `docs/README.md` 인덱스 | 마크다운 링크 | `doctor` 문서 연결 |
| `skills/*/SKILL.md` | 다른 스킬·에이전트·docs | 이름 (`curvez:<name>`) | `doctor` 문서 연결 |
| `skills/*/references/*.md` | 소속 `SKILL.md` | 조건이 붙은 포인터 | `validate-skills` 고아 참조 |
| `agents/*.md` | 오케스트레이터·팀 스킬·team-execution | 이름 (`curvez-<name>`) | `doctor` 제어면 등록 |

**마크다운 링크가 없다고 고립이 아니다.** 실제로 링크만 세어 9건을 고립으로 오판한 적이 있다 —
에이전트와 스킬은 경로가 아니라 이름으로 불린다. 층에 맞는 형태로 참조되면 연결된 것이다.

### 무엇을 만들면 무엇을 함께 고치는가

산출물을 추가·삭제하면 **아래를 같이 고친다.** 하나라도 빠지면 그 산출물은 존재하지만
아무도 찾지 못하는 상태가 된다.

| 만든 것 | 함께 고칠 곳 |
|---|---|
| 에이전트 | `curvez-orchestrator.md` 통신 표 · `team-orchestration/SKILL.md` 라인업 · `team-execution.md` · 이 README 의 개수 |
| 스킬 | 인접 스킬의 `## 언제 쓰지 않는가`(양방향) · 주 사용 에이전트 정의 · 이 README 의 개수 |
| docs | **이 README 의 인덱스 표** · 관련 docs 의 "관련 문서" 절 |
| references | 소속 `SKILL.md` 의 조건부 포인터 |
| 스크립트·훅 | 위 "지금의 빌드 상태" 표 · `doctor` 의 필수 목록 |

**절차는 `authoring-agents` 와 `authoring-skills` 가 정본이다.** 이 표는 무엇을 고치는지만 말하고,
어떻게 고치는지는 그 스킬들이 다룬다.

### 왜 기계가 검사하는가

문서 갱신은 잊기 쉽다. 산출물이 늘어도 문서는 자동으로 따라오지 않는다.
실제로 에이전트 수가 늘어난 뒤에도 README 는 이전 개수를 말했고, 실행기 넷이 생긴 뒤에도
"없음" 이라고 적혀 있었다. **사용자가 가장 먼저 읽는 문서가 틀리면 나머지가 맞아도 신뢰를 잃는다.**

그래서 `doctor` 가 세 가지를 기계로 본다 — 개수 일치, 구현 상태 서술, 고립 여부.
어긋나면 exit 1 이다. 손으로 고치는 것을 잊어도 검증에서 걸린다.


### 낡지 않는 문장으로 쓴다

문서가 어긋나는 가장 흔한 원인은 **빌드 시점을 문장에 박아 넣는 것**이다.

```
✗ 프리셋은 빌드 6단계 산출물이라 지금은 존재하지 않는다
✓ 프리셋 파일을 읽지 못하면 내장 폴백으로 진행한다
```

앞 문장은 6단계가 끝나는 순간 거짓이 되고, 아무도 고치러 오지 않는다.
뒤 문장은 **조건 서술**이라 파일이 있든 없든 항상 참이다.

같은 규칙이 개수에도 적용된다. `에이전트 11종` 은 12번째가 생기면 틀리므로,
개수를 쓸 자리는 최소로 두고 — README 인덱스와 GOAL 정도 — 나머지는 "라인업" 처럼 수를 빼고 쓴다.

**금지 표현:** `빌드 N단계`, `N단계 산출물`, `아직 생성 전`, `아직 존재하지 않는`, `늦게 생긴다`.
`doctor` 가 이 표현들을 잡는다.

### doctor 가 검사하는 것과 못 하는 것

| 검사 | 무엇을 |
|---|---|
| 문서 동기화 | "N종" 개수, "없음" 서술, 빌드 시점 표현 |
| 문서 연결 | 스킬이 이름으로 참조되는가, docs 가 README 인덱스에 있는가 |
| 제어면 등록 | 에이전트가 오케스트레이터·팀 스킬·team-execution 에 있는가 |
| 훅 매니페스트 | `hooks.json` 이 로더가 읽을 구조인가 |

**못 하는 것:** 내용이 맞는지는 검사하지 않는다. 개수가 맞고 링크가 살아 있어도
그 문서가 설명하는 절차가 실제와 다를 수 있다. 그건 사람이 읽어야 한다.

### 검사를 만들 때의 함정

이 검사들은 세 번 넓혀야 했다. 매번 **범위가 좁아 통과처럼 보였다.**

| 차수 | 놓친 것 | 원인 |
|---|---|---|
| 1차 | README 의 `**없음**` | 파일명 리터럴이 든 줄만 봤다 |
| 2차 | `\| 에이전트 라인업 \| **11종** \|` | 강조·표 구분자를 건너뛰지 못했다 |
| 3차 | `agents/`·`skills/` 의 시점 서술 5곳 | 검사 대상이 `docs/` 와 루트뿐이었다 |

**새 검사를 만들면 반드시 "지금 상태에서 무엇을 잡는지" 를 먼저 본다.**
0건이 나오면 통과가 아니라 **검사가 안 걸린 것을 의심한다** — 이 프로젝트에서 가장 자주 나온 실패다.
넓힐 때는 오탐도 함께 확인한다. 실제로 "구현 에이전트 2종", "에이전트**와** 15종 스킬" 을
드리프트로 잡은 적이 있고, 그대로 뒀으면 검사를 꺼야 했을 것이다.

## 문서 인덱스

이 `docs/` 는 **사람이 읽는 문서**다. 설계 근거와 배경, 실패 사례, 여러 스킬에 걸친 전체 그림을 담는다.
규칙의 **수치**는 `scripts/lib/spec.mjs`, **절차**는 `skills/*/SKILL.md`, **역할과 권한**은
`agents/*.md` 가 각각 정본이다. docs 는 그 값을 옮겨 적지 않고 경로로 가리킨다 — 사본이 생기면
규칙을 바꿀 때 한쪽만 고쳐져 서로 다른 말을 하게 되기 때문이다.

무엇을 알고 싶은지에 따라 읽을 문서가 다르다.

| 알고 싶은 것 | 문서 |
|---|---|
| 왜 하필 이런 구조인가. 파일 기반 핸드오프·내장 서브에이전트·소유권 분할을 고른 이유와 버린 대안 | [design-rationale.md](design-rationale.md) |
| 에이전트끼리 무엇을 어떻게 주고받는가. 상태 전이, 필드 의미, 계약이 깨졌던 실제 사례 | [handoff-contract.md](handoff-contract.md) |
| 에이전트 정의를 쓸 때 7섹션이 왜 그 순서인가. 각 섹션이 무엇을 막으려고 있는가 | [agent-authoring.md](agent-authoring.md) |
| 스킬이 호출되게 하는 법. 분량을 왜 제한하는가. references 로 언제 쪼개는가 | [skill-authoring.md](skill-authoring.md) |
| 팀을 어떻게 짜는가. 병렬·순차 판정, 소유권 충돌, 사용자 승인, 질문 중계 | [team-execution.md](team-execution.md) |
| 브랜치·커밋·PR 을 어떻게 다루는가, 훅이 왜 이력을 지우는 조작만 막는가 | [git-strategy.md](git-strategy.md) |
| 왜 DDD 인가, 규모가 안 맞으면 어떻게 조정하는가 | [architecture-presets.md](architecture-presets.md) |
| `done` 을 선언해도 되는 조건은 무엇인가. 검증을 왜 수치로 요구하는가 | [quality-model.md](quality-model.md) |
| 셸·grep·awk 로 검증 스크립트를 짤 때 조용히 틀리는 지점들 | [shell-pitfalls.md](shell-pitfalls.md) |
| 내 프로젝트 전용 에이전트·스킬을 어떻게 추가하는가 | [extending.md](extending.md) |
| 버전을 올렸을 때 내 프로젝트에서 확인하거나 고쳐야 할 것 | [migration.md](migration.md) |

처음이라면 [design-rationale.md](design-rationale.md) → [team-execution.md](team-execution.md) →
[handoff-contract.md](handoff-contract.md) 순으로 읽으면 나머지가 왜 그렇게 생겼는지 이어진다.
자기 프로젝트에 에이전트를 붙이는 것이 목적이면 [extending.md](extending.md) 부터 읽어도 된다.

# GOAL — curvez : 프로젝트 오케스트레이션 하네스

> 이 문서는 curvez 제작의 단일 기준이다. 결정된 사항은 확정으로 취급하고 되묻지 않는다.

---

## 0. 한 줄 목표

`~/Workspace/curvez` 에 **Claude Code 플러그인 마켓플레이스** 형태의 범용 오케스트레이션 하네스 **curvez** 를 만든다.
새 프로젝트에서 curvez 를 설치하면 — 기술 스펙·아키텍처·와이어프레임을 확정하고, 담당 에이전트를 세팅하고,
공통 스킬·훅·스크립트를 갖춘 상태로 곧바로 팀 병렬 개발에 들어갈 수 있어야 한다.

curvez 는 **보일러플레이트**다. 프로젝트 고유의 세부 에이전트·스킬은 각 프로젝트 담당자가 만든다.
따라서 curvez 의 산출물 중 **가장 중요한 것은 "새 에이전트·스킬을 어떻게 쓰는가"의 규약과 그것을 강제하는 검증 스크립트**다.

---

## 1. 네이밍 규약 (확정)

| 대상 | 이름 | 예시 |
|---|---|---|
| 마켓플레이스 | `curvez` | `/plugin marketplace add ~/Workspace/curvez` |
| 플러그인 | `curvez` | `/plugin install curvez@curvez` |
| 에이전트 | `curvez-<역할>` | `curvez-architect`, `curvez-nextjs` |
| 스킬 | 역할명 (prefix 없음) | 호출 시 `curvez:bootstrap` 로 자동 네임스페이스 |
| 프로젝트 상태 디렉터리 | `.curvez/` | `.curvez/architecture.md` |
| 슬래시 커맨드 | `/curvez:<스킬명>` | `/curvez:bootstrap` |

에이전트 이름에만 `curvez-` prefix 를 붙인다. **이유:** 에이전트 이름은 전역 네임스페이스라 다른 플러그인과 충돌한다.
스킬은 플러그인 네임스페이스가 자동으로 붙으므로 prefix 를 또 붙이면 `curvez:curvez-init` 처럼 중복된다.

---

## 2. 확정 사항 (변경 금지)

| 항목 | 결정 |
|---|---|
| 배포 형태 | **플러그인 마켓플레이스**. `~/Workspace/curvez` 가 marketplace 저장소, 그 안에 `plugins/curvez` |
| 병렬 런타임 | **Claude Code 내장 서브에이전트(Agent 툴)**. tmux 워커는 쓰지 않는다. 에이전트 간 통신은 `.curvez/handoff/*.json` 파일 기반 |
| 아키텍처 설정 | **DDD 프리셋 + 인터뷰**. 3~5문 인터뷰로 레이어명·경계 규칙만 조정해 `.curvez/architecture.md` 확정. 규모가 안 맞으면 다른 구조로 가지 않고 레이어를 줄이거나 컨텍스트를 나눈다 |
| 에이전트 라인업 | **12종** (4절) |

---

## 3. 기본값 (바꾸려면 이 표만 고친다)

| 항목 | 값 | 근거 |
|---|---|---|
| 산출물 언어 | 본문·주석·문서 전부 **한글** | `~/Workspace/CLAUDE.md` 규칙 1 |
| 스킬 `description` | **한글 트리거 + 영어 트리거 병기** | 스킬 매칭은 사용자 발화와의 유사도로 결정된다. 한쪽 언어만 쓰면 반대 언어 발화에서 안 잡힌다 |
| 패키지 매니저 | **pnpm 고정** | CLAUDE.md 규칙 6 |
| 스크립트 런타임 | **node ESM(`.mjs`), 외부 의존성 0** | 설치 시점에 `pnpm install` 을 강요하지 않기 위함 |
| 상태 저장 | 프로젝트 루트 `.curvez/` (git 커밋 대상, `.curvez/tmp/` 만 gitignore) | 에이전트 간 계약이 리뷰 가능해야 한다 |
| 회고 산출물 | `docs/retro/YYYY-MM-DD-<주제>.md`. Obsidian 반출은 `note` 스킬 호출로 옵션 | 프로젝트 지식은 프로젝트에 남는다 |
| 모델 배정 | 판단·설계·리뷰 = `opus` / 구현·조사·QA = `sonnet` | 4.2 표 |

---

## 4. 에이전트 (12종)

### 4.1 공통 규칙 — 예외 없이 전부 적용

**프론트매터 필수 5필드** (하나라도 빠지면 `validate-agents.mjs` 실패):

```yaml
---
name: curvez-architect
description: <언제 이 에이전트를 부르는지. 한글+영어 트리거 병기>
tools: Read, Grep, Glob, WebFetch, WebSearch
disallowedTools: Write, Edit, NotebookEdit
model: opus
---
```

**본문 필수 7섹션** — 헤딩 문자열과 순서 고정:

| 순서 | 헤딩 | 담을 것 |
|---|---|---|
| 1 | `## 핵심 역할` | 책임지는 단 하나의 것. **무엇을 하지 않는가**도 명시 |
| 2 | `## 판단 기준` | 무엇을 보고 무엇을 우선하는가. 우선순위 충돌 시 tie-break 규칙까지 |
| 3 | `## 입출력 프로토콜` | 받는 입력과 내보내는 출력의 **정확한 스키마**. 에이전트 간 API 계약 |
| 4 | `## 팀 통신 프로토콜` | 누구에게 / 무엇을 / 언제. 대상 에이전트 `name` 명시 |
| 5 | `## 에러 핸들링` | 입력이 계약 위반일 때, 정보가 없을 때, 작업이 실패할 때. **추측으로 채우지 않고 blocked 보고**가 기본 |
| 6 | `## 협업과 팀 내 위치` | 선행/후행/병렬 에이전트, 파일 소유권 경계 |
| 7 | `## 품질 자체 검증` | 완료 선언 전 스스로 돌리는 체크. **명령과 기대 결과를 구체적으로** |

### 4.2 라인업

| # | name | 역할 | model | 쓰기 |
|---|---|---|---|---|
| 1 | `curvez-orchestrator` | 팀 구성 제안 → 승인 → 분배 → 핸드오프 수합 | opus | O |
| 2 | `curvez-requirements` | 기획·요구사항 확정, acceptance criteria 도출 | opus | O |
| 3 | `curvez-researcher` | 1차 출처 기술 조사, 근거 링크 필수 | sonnet | O (`.curvez/research/`) |
| 4 | `curvez-architect` | 프리셋 선택·인터뷰·경계 규칙 확정 | opus | O (`.curvez/architecture.md`) |
| 5 | `curvez-designer` | 와이어프레임·디자인 토큰·컴포넌트 스펙 | sonnet | O |
| 6 | `curvez-nextjs` | Next.js 구현 (App Router, RSC 경계) | sonnet | O |
| 7 | `curvez-react-native` | React Native / Expo 구현 | sonnet | O |
| 8 | `curvez-qa` | 테스트 전략 + **실제 실행·검증** | sonnet | O |
| 9 | `curvez-reviewer` | 코드 리뷰 (정확성·계약 준수·심각도 등급) | opus | X |
| 10 | `curvez-structure-reviewer` | 중복 코드·순환 의존·경계 위반 검출 | opus | X |
| 11 | `curvez-retrospector` | 회고: 어긋난 지점과 규약 수정안 | sonnet | O (`docs/retro/`) |
| 12 | `curvez-git` | 브랜치·커밋·PR·머지 실행 | sonnet | X (`owns: none`) |

읽기 전용 에이전트(9, 10)는 `disallowedTools: Write, Edit, NotebookEdit` 필수.
**이유:** 리뷰어가 직접 고치기 시작하면 리뷰 대상과 주체가 섞여 검증이 무의미해진다.

---

## 5. 스킬

### 5.1 공통 작성 규칙

- **description**: 자연어 호출 상황을 전부 나열. 동사 위주. 한글+영어 트리거 병기
- **트리거 경계**: `## 언제 이 스킬을 쓰는가` / `## 언제 쓰지 않는가` 두 섹션 필수. 인접 스킬과 헷갈릴 지점을 직접 지목
- **분량**: SKILL.md **500줄 이하**. 넘거나 한 섹션이 비대해지면 `references/*.md` 로 분리
- **references 분리 대상**: ① 도메인 분기(Next.js vs RN) ② 조건부 상세 ③ 긴 예시 모음
- **why-first**: 금지 규칙에는 **왜 안 되는지**를 붙인다. 이유를 알아야 문서에 없는 엣지 케이스에서 판단을 이어간다
- **문체**: `~하라`, `~한다` 명령형

### 5.2 만들 스킬 (15종)

| 스킬 | 주 사용 에이전트 | 하는 일 |
|---|---|---|
| `bootstrap` | orchestrator | 프로젝트 부트스트랩. 스택 감지 → 프로파일 인터뷰 → `.curvez/` 생성 |
| `architecture-setup` | architect | DDD 프리셋 확인 → 인터뷰 → `.curvez/architecture.md` 확정 |
| `team-orchestration` | orchestrator | 팀 필요 판정 → 구성안 **승인** → 병렬 Agent 실행 → 핸드오프 수합 |
| `agent-contract` | 전체 | 입출력 계약 작성·검증. 핸드오프 스키마의 단일 출처 |
| `authoring-agents` | 프로젝트 담당자 | 새 에이전트 작성 규약 + 스캐폴딩 + 검증 |
| `authoring-skills` | 프로젝트 담당자 | 새 스킬 작성 규약 + 스캐폴딩 + 검증 |
| `research-brief` | researcher | 1차 출처 조사 → 근거 링크 붙은 브리프 |
| `wireframe-spec` | designer | 와이어프레임·디자인 토큰·컴포넌트 스펙 |
| `nextjs-implementation` | nextjs | 아키텍처 규칙 준수 구현. RSC/클라이언트 경계 |
| `react-native-implementation` | react-native | Expo/RN 구현. 플랫폼 분기 |
| `quality-gate` | qa, reviewer | typecheck·lint·test 를 **실제로 돌리고** 수치 보고 |
| `structure-audit` | structure-reviewer | 중복 코드·순환 의존·경계 위반 검출 |
| `retrospective` | retrospector | 회고 + **규약 자체를 고치는 액션 아이템** |
| `branching` | git | 브랜치 생성·PR·머지 절차. 전략은 프로파일에서 읽는다 |
| `commit` | git | 커밋·푸시·PR 생성. 요청 범위를 넘지 않는다 |

---

## 6. 에이전트 간 계약 (핸드오프)

`.curvez/handoff/<agent-name>.<타임스탬프>.json`. 스키마는 `scripts/schema/handoff.schema.json` 이 단일 출처.

```json
{
  "from": "curvez-architect",
  "to": ["curvez-nextjs", "curvez-react-native"],
  "status": "done | blocked | partial",
  "summary": "한 줄 요약",
  "artifacts": [{ "path": ".curvez/architecture.md", "kind": "decision" }],
  "decisions": [{ "what": "...", "why": "...", "reversible_at": "파일:라인" }],
  "blocked_on": [{ "question": "...", "who": "user | 에이전트명" }],
  "verification": [{ "command": "pnpm typecheck", "result": "0 errors" }]
}
```

**규칙:**
- `status: done` 은 `verification` 이 비면 쓸 수 없다. **이유:** 검증 없는 완료 선언이 하네스 전체의 신뢰를 무너뜨린다
- `blocked` 는 실패가 아니다. 추측으로 채우고 done 하는 것이 실패다
- 파일 소유권은 겹치지 않게 분배한다. 겹치면 orchestrator 가 순차 실행으로 강등한다

---

## 7. 프로젝트 프로파일 `.curvez/`

```
.curvez/
├─ profile.json          # 스택, 패키지매니저, 품질 게이트 명령
├─ architecture.md       # 확정 아키텍처. 구현 에이전트의 필수 참조
├─ team.md               # 세팅된 에이전트 목록과 담당 경계
├─ research/             # 조사 브리프
├─ handoff/              # 에이전트 간 계약 로그
└─ tmp/                  # gitignore
```

`profile.json` — **품질 게이트 명령과 소스 경로는 프로젝트마다 다르므로 반드시 프로파일에서 읽는다**:

```json
{
  "stack": "nextjs | react-native | monorepo",
  "packageManager": "pnpm",
  "architecture": "ddd",
  "paths": {
    "web": "apps/web",
    "mobile": "apps/mobile",
    "domain": "packages/domain",
    "tests": "tests"
  },
  "expo": { "sdkVersion": "57" },
  "commands": { "typecheck": "pnpm typecheck", "lint": "pnpm lint", "test": "pnpm test", "build": "pnpm build" }
}
```

### paths 필수 규칙

| `stack` | 필수 키 | 선택 키 |
|---|---|---|
| `nextjs` | `paths.web` | `paths.tests` |
| `react-native` | `paths.mobile`, `expo.sdkVersion` | `paths.tests` |
| `monorepo` | `paths.web`, `paths.mobile`, `paths.domain` | `paths.tests`, `expo.sdkVersion` |

- 필수 키가 없으면 에이전트는 **경로를 추측하지 않고 `status: blocked`** 로 보고한다.
  **이유:** 구현 에이전트마다 다른 폴백 규칙을 만들면 monorepo 에서 두 에이전트가 같은 디렉터리를 소유하게 되고,
  병렬 실행에서 나중에 쓴 쪽이 앞선 쪽을 조용히 지운다.
- `paths.tests` 만 예외로 폴백을 허용한다. 없으면 `*.test.*` / `*.spec.*` / `__tests__/` 관례를 쓴다.
  **이유:** 테스트 위치는 관례가 강해 추측이 어긋날 여지가 작고, 어긋나도 파일을 덮어쓰지 않는다.
- `paths.domain` 은 **소유자를 두지 않는다.** 이 경로를 건드리는 작업은 `curvez-nextjs` 와
  `curvez-react-native` 를 동시에 띄우지 않고 순차로 강등한다.

`bootstrap.mjs`(1단계)가 이 필드들을 생성한다.

---

## 8. 스크립트

| 파일 | 역할 |
|---|---|
| `scripts/lib/frontmatter.mjs` | 프론트매터·섹션 파서 (공용) |
| `scripts/validate-agents.mjs` | 프론트매터 5필드 + 본문 7섹션 검증 |
| `scripts/validate-skills.mjs` | 500줄 제한, 트리거 경계 섹션, references 링크 유효성 |
| `scripts/validate-handoff.mjs` | 핸드오프 스키마 검증 (done 인데 verification 비면 실패) |
| `scripts/new-agent.mjs` | 7섹션 뼈대 에이전트 생성 |
| `scripts/new-skill.mjs` | SKILL.md + references 뼈대 생성 |
| `scripts/bootstrap.mjs` | 스택 감지 → 프로파일 생성 → `.curvez/` 스캐폴드 |
| `scripts/quality-gate.mjs` | `profile.json` 의 commands 실행, 결과를 수치로 출력 |
| `scripts/doctor.mjs` | 위 검증 전부 + 설치 상태 점검 |

전부 `node <path>` 로 바로 실행 가능, 외부 의존성 0.

---

## 9. 훅

- **PreToolUse(Bash)** — 파괴적 git 차단
- **PreToolUse(Bash)** — `npm|yarn` 차단 후 pnpm 안내. **이유:** lockfile 이 갈리면 병렬 작업에서 설치 상태가 어긋난다
- **PostToolUse(Write|Edit)** — `agents/`·`skills/` 수정 시 해당 validate 자동 실행
- **Stop** — 핸드오프가 `done` 인데 `verification` 이 비면 경고

---

## 10. 빌드 순서

1. **골격** — marketplace.json, plugin.json, README, `.curvez/` 템플릿, `bootstrap.mjs`
2. **규약 확정** ← **현재 단계** — `agent-contract`·`authoring-agents`·`authoring-skills` 스킬 + 검증 스크립트 3종. **여기가 먼저다.** 검증기가 있어야 이후 24개 산출물이 자동으로 품질을 유지한다
3. **에이전트 12종** — 병렬 작성 (파일 소유권 무충돌)
4. **스킬 나머지 10종** — 병렬 작성
5. **docs** — 스킬별 상세 문서 + references
6. **프리셋** — 아키텍처 1종(DDD), 스택 3종
7. **훅 + doctor 완성**
8. **검증** — `node scripts/doctor.mjs` 통과, `~/Workspace/weather` 에 실제 설치해 왕복 1회

---

## 11. 완료 기준

- `node scripts/doctor.mjs` **exit 0**, 에이전트 12/12 · 스킬 15/15 통과
- 500줄 초과 SKILL.md **0건**
- 프론트매터 5필드 누락 **0건**, 본문 7섹션 누락 **0건**
- `~/Workspace/weather` 설치 → `bootstrap` 실행 → `.curvez/` 생성 확인
- 완료 보고에 **실제로 돌린 명령과 나온 수치**를 적는다

---

## 12. 참고 자산

- `mattpocock-skills` (v1.2.3) — `writing-for-agents` 의 progressive disclosure·leading word·negation 회피 원칙을 스킬 작성에 적용
- `oh-my-claudecode` (v4.15.7) — 에이전트 카탈로그 구조 참고. **런타임은 쓰지 않는다**
- `~/Workspace/.claude/skills/` — `git-guardrails-claude-code`, `setup-pre-commit`, `tdd`, `diagnose` 는 curvez 흡수 검토
- `~/Workspace/CLAUDE.md` — 작업 규칙 7조. curvez 의 모든 산출물이 이를 따른다

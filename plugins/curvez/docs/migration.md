# 마이그레이션 — 버전을 올릴 때 프로젝트에서 할 일

curvez 는 **user scope 플러그인**이다. 한 번 업데이트하면 그 계정의 모든 프로젝트에 동시에 적용된다.
프로젝트마다 설치를 반복하지 않는다.

이 문서는 **버전이 올라갔을 때 각 프로젝트에서 확인하거나 고쳐야 할 것**만 담는다.
바뀐 규약의 내용과 근거는 각 규약 문서가 정본이고, 여기서는 옮겨 적지 않고 경로로 가리킨다.

최신 버전이 위에 온다.

---

## 0.1.4 — 소유권 포함 관계 · 범용 타입 금지 · 호출 접두사

### 무엇이 바뀌었나

| # | 변경 | 정본 |
|---|---|---|
| ① | **`owns` 가 다른 `owns` 를 포함하면 배제 목록을 차감하고 병렬을 판정한다** | `agents/curvez-orchestrator.md` `### 병렬 판정` |
| ② | **`Tools: *` 범용 타입(`general-purpose`, `claude` 등)을 워커로 띄우지 않는다.** 대신 "지어낸 이름은 런타임이 거부하므로 위험하지 않다" 로 근거를 사실에 맞췄다 | `agents/curvez-orchestrator.md` `### 팀 규모 상한` |
| ③ | **`Agent` 의 `subagent_type` 값은 `curvez:curvez-nextjs` 형태다.** 문서에 적힌 `curvez-nextjs` 는 지칭이지 호출 값이 아니다 | `agents/curvez-orchestrator.md` `#### 호출 값에는 플러그인 접두사가 붙는다` |

스크립트 동작과 핸드오프 스키마는 바뀌지 않았다. 문서·규약만 바뀐 patch 릴리스다.

### 왜 ① 이 필요했나

`curvez-nextjs` 의 소유 경로는 `${paths.web}` 이고, **단일 저장소에서 이 값은 `.` 이다.**
`bootstrap.mjs` 가 워크스페이스가 아닌 저장소에 `.` 을 넣고, `presets/stack/nextjs.md` 가
"`paths.web` 은 앱 패키지의 루트다" 로 그것을 정본으로 못박는다 — 즉 정상 값이다.

그런데 종전 판정 규칙은 소유 경로가 한 글자라도 겹치면 순차로 강등했다. `.` 은 `paths.tests` ·
`.curvez/` · `docs/retro/` 를 전부 포함하므로, **단일 저장소 프로젝트에서는 구현 에이전트가
쓰기 권한을 가진 어떤 워커와도 병렬이 되지 않았다.** 규약 두 조항이 각각은 옳은데 합치면
팀 실행의 이점을 없앴다.

0.1.4 는 정의 파일의 "…는 읽기만 한다" 배제 목록을 차감 근거로 편입해 이 교착을 푼다.

### 업데이트 절차 (필수)

절차의 정본은 [README 의 업데이트](README.md#업데이트)다 — 마켓플레이스 갱신이 먼저이고,
그것을 건너뛰면 업데이트가 "이미 최신" 으로 끝난다. 여기에 옮겨 적지 않는다.

끝나면 `installed_plugins.json` 의 `curvez@curvez` 가 `version: "0.1.4"` 인지 확인하고,
`node "$CLAUDE_PLUGIN_ROOT/scripts/doctor.mjs"` 로 에이전트 12/12 · 스킬 15/15 · exit 0 을 본다.

### 프로젝트에서 할 일 (조건부)

**A. `.claude/agents/` 에 프로젝트 전용 에이전트가 있는가**

①의 차감은 **정의 파일에 배제 목록이 있는 에이전트에만** 적용된다. 없으면 종전대로 순차 강등이다.
해당하면 그 정의의 `## 협업과 팀 내 위치` 파일 소유권 항에 "…는 **읽기만 한다**" 목록을 추가한다.
작성 형식은 `agents/curvez-nextjs.md` 의 같은 항목을 본뜬다.

curvez 코어 12종 중 11종은 이미 갖고 있으므로 확인할 필요가 없다.
남은 하나(`curvez-structure-reviewer`)는 `owns: none` 이라 애초에 판정 대상이 아니다.

**B. `general-purpose` · `claude` 같은 범용 타입을 워커로 쓰는 지시가 남아 있는가**

`.curvez/team.md`, 프로젝트 CLAUDE.md, 자체 스킬 문서를 확인한다. ②로 금지되므로 curvez 라인업
11종 또는 읽기 전용 `Explore` 로 바꾼다.

**C. `subagent_type` 을 직접 적어 둔 문서가 있는가**

프로젝트가 자체 오케스트레이션 문서를 갖고 있다면 호출 값에 `curvez:` 접두사가 붙었는지 확인한다.
접두사 없이 부르면 `Agent type '<name>' not found` 로 거부된다.

### 하지 않아도 되는 것

- **`.curvez/profile.json` 수정** — 없다. 특히 `paths.web` 은 건드리지 마라.
  `.` 은 정상 값이고, `src` 같은 소스 디렉터리로 바꾸면 `presets/stack/nextjs.md` 가 경고한 대로
  다른 검사들이 `.../src/src/...` 를 보게 된다
- **기존 핸드오프 파일 마이그레이션** — 스키마 변경이 없다. `validate-handoff.mjs` 를 그대로 통과한다
- **`.curvez/architecture.md` · `design/` · `research/`** — 무관하다
- **에이전트 정의 frontmatter 의 `name`** — `curvez-nextjs` 그대로 둔다.
  `validate-agents.mjs` 가 `name` 과 파일명의 일치를 강제하므로 접두사를 넣으면 검증이 실패한다

### 근거 (2026-08-23 실측)

이 릴리스의 세 항목은 전부 실제 호출로 확인한 것이다.

| 확인한 것 | 결과 |
|---|---|
| 서브에이전트가 `Agent` 도구를 갖는가 (2층 위임) | 가능. `curvez-orchestrator` 가 워커를 띄워 완료 |
| 한 메시지 동시 호출이 실제 병렬로 도는가 | 3개 동시 실행 확인 |
| 접두사 없는 `curvez-nextjs` 호출 | **거부.** `Agent type 'curvez-nextjs' not found` + 사용 가능 목록 반환 |
| 없는 이름이 조용히 범용으로 떨어지는가 | **아니다.** 에러로 거부된다 → ②의 근거를 이 사실로 교체 |
| `Tools: *` 범용 타입의 존재 | `claude`, `general-purpose` 등이 실재하며 `Agent` 를 가짐 → ②로 금지 |

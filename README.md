# curvez

![pnpm](https://img.shields.io/badge/pnpm-11.20.0-F69220?style=flat-square&logo=pnpm&logoColor=white)

Next.js 프로젝트에 **아키텍처 경계와 검증 규칙을 거는 Claude Code 플러그인**.

에이전트 팀을 짜고 일을 나눠 맡기는 오케스트레이션은 oh-my-claudecode 나 superpowers 같은 플러그인에 맡긴다.
curvez 는 그 위에 얹혀, 누가 코드를 쓰든 같은 규칙으로 검사되게 한다. 레이어 경계를 기계가 검사할 수 있는
표로 굳히고, 게이트를 실제로 돌려 수치로 남기고, 검증 없는 "완료" 보고를 막는다.

```
스킬 4종 · 실행기 4종 · 훅 4종 · 프리셋 3종
```

---

## 설치

```bash
/plugin marketplace add knut15/curvez
/plugin install curvez@curvez
```

설치하면 스킬이 `curvez:` 네임스페이스로 붙는다.

## 업데이트

```bash
/plugin marketplace update curvez   # 1. 마켓플레이스를 먼저 갱신한다
/plugin                             # 2. 설치된 플러그인에서 curvez@curvez 를 업데이트한다
```

**계정당 한 번이면 모든 프로젝트에 적용된다** — user scope 설치라 프로젝트마다 반복하지 않는다.

1단계를 건너뛰면 2단계가 "이미 최신" 으로 끝난다. 업데이트는 원격이 아니라 로컬 마켓플레이스
클론을 보고 버전을 판단하기 때문이다. 그리고 `curvez@curvez` 는 **discover 목록에 없다** —
discover 는 미설치 플러그인만 보여주므로 이미 설치된 것은 설치된 플러그인 쪽에서 고른다.

절차와 확인 지점, 반영이 안 될 때의 조치는
[업데이트](plugins/curvez/docs/README.md#업데이트)에 있다. 버전을 올렸을 때 각 프로젝트에서
확인하거나 고쳐야 할 것은 [마이그레이션 노트](plugins/curvez/docs/migration.md)에 버전별로 정리돼 있다.

## 시작

```
curvez 붙여줘     →  스택 감지 → .curvez/profile.json → 디렉터리 스캐폴드
아키텍처 잡아줘    →  DDD 프리셋 + 3~5문 인터뷰 → 금지 import 표 확정
검증해줘          →  아키텍처 경계 · typecheck · lint · test 를 실제로 실행
핸드오프          →  서브에이전트 결과를 검증 결과가 붙은 계약으로 돌려받기
```

순서가 있다. 경계 검사는 `.curvez/architecture.md` 의 `## 금지 import` 표를 유일한 근거로 쓰므로,
그 표가 없으면 "위반 없음" 이 아니라 "검사 못 함" 으로 실패한다.

## 무엇을 제공하는가

| | |
|---|---|
| **스킬 4종** | `bootstrap` `architecture-setup` `quality-gate` `agent-contract` |
| **실행기** | `bootstrap` (스택 감지·스캐폴드) · `quality-gate` (게이트 실행·수치 출력) · `validate-handoff` · `doctor` |
| **훅** | 파괴적 git·npm 차단, 설정 파일 기반 금지어 차단, 턴 종료 시 핸드오프 점검, 버전 업데이트 알림 |
| **프리셋** | 아키텍처 DDD, 스택 `nextjs`·`monorepo` |

## 설계의 뼈대

**검증 없는 완료를 금지한다.** 핸드오프의 `status: done` 은 `verification` 이 비면
검증기가 거부한다. 받는 쪽이 `done` 을 믿고 다음 작업을 시작하므로,
검증되지 않은 완료 하나가 그 뒤 전부를 잘못된 전제 위에 올린다.

**"검사 못 함" 과 "위반 없음" 을 구분한다.** 게이트는 결과와 함께 무엇을 얼마나 검사했는지를 낸다.
테스트가 0개 돌았거나 경계 규칙을 하나도 못 읽었으면 exit 0 이어도 통과로 치지 않는다.

**규약을 문서가 아니라 스크립트가 강제한다.** 문서에 적힌 규칙은 지켜지지 않는다.
`doctor` 가 플러그인 구조와 문서를 검사하고 어긋나면 exit 1 이다.

```bash
node plugins/curvez/scripts/doctor.mjs --plugin
```

## 저장소 구조

pnpm 워크스페이스다. 플러그인은 워크스페이스 밖에 있다 — npm 패키지가 아니라 마켓플레이스가 로드한다.
이 레포는 마켓플레이스 하나에 플러그인 둘을 담는다.

| 경로 | |
|---|---|
| `plugins/curvez` | Claude Code 플러그인. 루트 `.claude-plugin/marketplace.json` 이 진입점이다 |
| `plugins/frontend-constraints` | 두 번째 플러그인. AI 가 쓴 UI 를 디자인 토큰·아키텍처 규칙 안에 묶는다 |
| `packages/*` | 여러 앱이 가져다 쓰는 것. 경계 규칙은 [packages/README.md](packages/README.md) |
| `apps/*` | 배포되는 것. 경계 규칙은 [apps/README.md](apps/README.md) |

## 문서

| 알고 싶은 것 | 문서 |
|---|---|
| 전체 그림, 설치·업데이트, 금지어 설정 | [docs/README.md](plugins/curvez/docs/README.md) |
| 왜 DDD 인가 | [architecture-presets.md](plugins/curvez/docs/architecture-presets.md) |
| 핸드오프 계약 | [handoff-contract.md](plugins/curvez/docs/handoff-contract.md) |
| 무엇이 "됐다" 인가 | [quality-model.md](plugins/curvez/docs/quality-model.md) |
| 실측으로 밟은 셸 함정 | [shell-pitfalls.md](plugins/curvez/docs/shell-pitfalls.md) |

## 아직 확인되지 않은 것

`/plugin install` 로 실제 설치했을 때 로더가 스킬·훅을 인식하는지는 이 구성으로 다시 확인하지 않았다.
스크립트를 직접 호출한 검증과, 기존 프로젝트(tour)에서 예전 버전과 결과를 맞춰 본 비교는 마쳤다.

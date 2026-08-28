# curvez

Next.js · React Native 프로젝트를 위한 **Claude Code 오케스트레이션 하네스**.

아키텍처를 확정하고, 담당 에이전트를 세팅하고, 팀을 병렬로 돌린다.
프로젝트 고유의 세부 담당은 각 프로젝트에서 직접 만든다 — curvez 는 그 **규약과 검증기**를 제공한다.

```
에이전트 13종 · 스킬 15종 · 문서 11편 · 실행기 8종 · 훅 4종
```

---

## 설치

```bash
/plugin marketplace add knut15/curvez
/plugin install curvez@curvez
```

설치하면 에이전트가 서브에이전트 이름으로 등록되고, 스킬이 `curvez:` 네임스페이스로 붙는다.

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
curvez 붙여줘        →  스택 감지 → .curvez/profile.json → 디렉터리 스캐폴드
아키텍처 잡아줘       →  DDD 프리셋 + 3~5문 인터뷰 → 경계 규칙 확정
와이어프레임         →  화면·토큰·컴포넌트 스펙
웹 구현해줘 / 모바일 화면 만들어줘
검증해줘             →  typecheck · lint · test · 아키텍처 경계를 실제 실행
```

순서가 있다. 구현 에이전트는 `.curvez/architecture.md` 의 `## 금지 import` 표를
위반 판정의 유일한 근거로 쓰므로, 그 파일이 없으면 `blocked` 로 멈춘다.

## 무엇을 제공하는가

|                   |                                                                                                |
| ----------------- | ---------------------------------------------------------------------------------------------- |
| **에이전트 13종** | 요구사항·조사·브랜드/마케팅·아키텍처·디자인·웹·모바일·QA·리뷰·구조리뷰·회고·git·오케스트레이터 |
| **스킬 15종**     | 각 단계의 실행 절차. 사용자 발화로 자동 호출된다                                               |
| **실행기**        | `bootstrap` `quality-gate` `doctor` + 검증 3종 + 스캐폴더 2종                                  |
| **훅 4종**        | 파괴적 git·npm 차단, 편집 후 자동 검증, 턴 종료 시 계약 점검, 버전 업데이트 알림               |
| **프리셋**        | 아키텍처 DDD, 스택 `nextjs`·`react-native`·`monorepo`                                          |

## 설계의 뼈대

**검증 없는 완료를 금지한다.** 핸드오프의 `status: done` 은 `verification` 이 비면
검증기가 거부한다. 수신 에이전트가 송신자의 `done` 을 믿고 자기 작업을 시작하므로,
검증되지 않은 완료 하나가 그 뒤 전부를 잘못된 전제 위에 올린다.

**파일 소유권으로 병렬을 판정한다.** 도구 권한이 아니라 경로 분할이 충돌을 막는다.
소유가 겹치면 병렬을 포기하고 순차로 강등한다 — 같은 파일을 동시에 고치면
나중에 쓴 쪽이 앞선 쪽을 조용히 지우고, 그 손실은 어디에도 기록되지 않는다.

**규약을 문서가 아니라 스크립트가 강제한다.** 문서에 적힌 규칙은 지켜지지 않는다.
`doctor` 가 7종을 검사하고 어긋나면 exit 1 이다.

```bash
node plugins/curvez/scripts/doctor.mjs --plugin
```

```
[A] 정적 규약 — exit code 를 좌우한다
    OK   플러그인 구조 · 훅 매니페스트 · 제어면 등록
    OK   문서 동기화 · 문서 연결 · 에이전트 · 스킬
[B] 런타임 완비 — 참고 정보
    완비 6/6
```

## 문서

| 알고 싶은 것               | 문서                                                           |
| -------------------------- | -------------------------------------------------------------- |
| 전체 그림과 문서 관계      | [docs/README.md](plugins/curvez/docs/README.md)                |
| 왜 이 구조인가, 버린 대안  | [design-rationale.md](plugins/curvez/docs/design-rationale.md) |
| 팀을 어떻게 돌리는가       | [team-execution.md](plugins/curvez/docs/team-execution.md)     |
| 에이전트 간 계약           | [handoff-contract.md](plugins/curvez/docs/handoff-contract.md) |
| 무엇이 "됐다" 인가         | [quality-model.md](plugins/curvez/docs/quality-model.md)       |
| 브랜치·커밋·PR             | [git-strategy.md](plugins/curvez/docs/git-strategy.md)         |
| 내 프로젝트에 확장하기     | [extending.md](plugins/curvez/docs/extending.md)               |
| 실측으로 밟은 셸 함정 13건 | [shell-pitfalls.md](plugins/curvez/docs/shell-pitfalls.md)     |

제작 기준은 [GOAL.md](GOAL.md) 에 있다.

## 아직 확인되지 않은 것

`/plugin install` 로 실제 설치했을 때 로더가 에이전트·스킬·훅을 인식하는지는 검증되지 않았다.
스크립트를 직접 호출한 검증과 실제 Expo 프로젝트 왕복(`bootstrap → architecture → quality-gate → handoff`)은 마쳤다.

실제 Claude Code 환경에서의 멀티에이전트 end-to-end 왕복도 아직 없다.

# 팀

## 디자인은 handwork 가 독립으로 갖는다

**`curvez-designer` 를 handwork 에서 쓰지 않는다.** handwork 는 이 사이트만의 값이 필요해
자기 디자인 시스템을 갖고, 그 자산은 전부 `apps/handwork/design/` 아래에 있다.
preemie-calc 는 예외다. 아래 `## preemie-calc` 편성에서 `curvez-designer` 가
`.curvez/design/preemie-calc/` 만 쓴다.

**이유:** curvez 는 특별한 지시가 없을 때 보편적인 화면을 내는 보일러플레이트다. handwork 는
그 보편값으로 설명되지 않는 값을 확정했으므로, 두 층이 서로를 참조하면 어느 쪽이 맞는지
판정할 근거가 사라진다. 디자인 **값**의 의존만 끊는 것이고, curvez 의 오케스트레이션
— 핸드오프 계약 · 팀 실행 · 게이트 절차 — 은 그대로 쓴다.

## 파일 소유권 예외 (handwork)

**`apps/handwork` 는 `curvez-nextjs` 가 `${paths.web}` 로 통째 소유한다.** 디자인 담당 둘이
그 안의 일부를 쓰므로, 겹치는 경로를 여기서 갈라 둔다.

| 경로                                 | 소유                     |
| ------------------------------------ | ------------------------ |
| `apps/handwork/design/`              | `handwork-design-system` |
| `apps/handwork/src/shared/ui/`       | `handwork-ui`            |
| `apps/handwork/.storybook/`          | `handwork-ui`            |
| `apps/handwork/src/**/*.stories.tsx` | `handwork-ui`            |
| `apps/handwork/scripts/`             | `handwork-ui`            |
| 위를 제외한 `apps/handwork/` 전부    | `curvez-nextjs`          |

**`curvez-nextjs` 의 코어 정의를 고치지 않았다.** **검증기는 이 표를 읽지 않는다.** 표의 경계는 사람이 지킨다.

## preemie-calc

- 작업: 이른둥이 육아 계산기 1단계 (SPEC F1~F7, F13)
- 브랜치·루트: `feature/preemie-calc` · `/Users/kim/Workspace/curvez/.claude/worktrees/preemie-calc`
- 승인: 2026-09-29 사용자 "이 구성으로 진행" (메인 세션 지시서 CONTEXT 원문). 의존성 "전부 설치", 아키텍처 "handwork와 같은 FSD" 도 같은 날 승인
- 자율 권한: 없다 (`check-grant --stage team` → `DENY 자율 권한이 없다 (.curvez/grant.md 없음)`, exit 1). 커밋·머지는 이번 범위 밖

### 팀 명단과 소유 경로

| 워커                        | 왜                                          | 쓰는 경로                                                                                                                                                              |
| --------------------------- | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `curvez-requirements`       | SPEC AC 를 requirements.md 로 옮긴다        | `.curvez/requirements.md` 의 preemie-calc 절                                                                                                                           |
| `curvez-architect`          | FSD 경계를 preemie-calc 경로로 추가한다     | `.curvez/architecture.md` 의 preemie-calc 절                                                                                                                           |
| `curvez-designer`           | 360px 화면 구조·토큰·컴포넌트 스펙          | `.curvez/design/preemie-calc/**`                                                                                                                                       |
| `curvez-nextjs`             | 앱 구현                                     | `apps/preemie-calc/**` 에서 아래 QA 경로와 `docs/` 를 뺀 것, 루트 `package.json` 의 `dev:preemie-calc` 한 줄, `pnpm-lock.yaml`                                         |
| `curvez-qa`                 | 단위·E2E 테스트 작성과 실행                 | `apps/preemie-calc/tests/**`, `apps/preemie-calc/vitest.config.ts`, `apps/preemie-calc/playwright.config.ts`, `.curvez/qa/preemie-calc/**`                             |
| `curvez-reviewer`           | 동작 정확성·계약 준수 리뷰                  | 없음 (읽기 전용, 핸드오프는 오케스트레이터가 대필)                                                                                                                     |
| `curvez-structure-reviewer` | 구조·중복·경계 리뷰                         | 없음 (읽기 전용, 핸드오프는 오케스트레이터가 대필)                                                                                                                     |

`profile.json` 의 `paths.web` 은 handwork 그대로 두고 `paths.preemieCalc`, `paths.preemieCalcTests` 를 더했다.
`curvez-nextjs`·`curvez-qa` 에게는 지시서 `SCOPE` 로 이 경로를 명시해 넘긴다.
**이유:** `paths.web` 을 바꾸면 handwork 쪽 팀 편성이 조용히 달라진다. 지시서는 경로 "추가만" 허용했다.

### 작업 단위 (전부 feature)

메인 세션 초안 6개를 4개 구현 라운드로 묶었다.

| 단위 | 내용                                                                 | 초안 대응 |
| ---- | -------------------------------------------------------------------- | --------- |
| U1   | 스캐폴드 + 날짜·교정연령 계산 도메인 + 기준 데이터 파일              | ①②        |
| U2   | 프로필 입력·대시보드·어느 나이·검진·경감·교정 종료 화면 (F1~F6)       | ③④        |
| U3   | 공유 카드 (F7) + 조합형 SEO 페이지 (F13)                             | ⑤⑥        |
| U4   | QA(단위+E2E) → 리뷰 → 수정 루프(최대 2회) → AC 판정                  | 공통      |

**묶은 이유:** ③과 ④는 같은 프로필·같은 도메인 함수를 읽는 화면이라 나누면 같은 컴포넌트를 두 라운드가 번갈아 고친다.
⑤와 ⑥은 둘 다 도메인 함수를 재사용하는 읽기 전용 표면이고 소유 경로가 같다. 되돌릴 위치: 이 표.

### 라운드와 병렬 판정

| 라운드 | 워커                                                    | 방식                                                                                   |
| ------ | ------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| R1     | `curvez-requirements`                                   | 단독                                                                                   |
| R2     | `curvez-architect` → `curvez-designer`                  | 한 명씩                                                                                |
| R2b    | `curvez-designer`(요구 대조 3건 수정) ∥ `curvez-nextjs`(U1) | 병렬. `.curvez/design/preemie-calc/` 와 `apps/preemie-calc/` 는 겹치지 않는다. U1 은 화면 디자인을 읽지 않는다 |
| R3     | `curvez-qa`(단위 테스트·E2E 설정) ∥ `curvez-nextjs`(U2) | 병렬. QA 는 `tests/`·설정 2개만, nextjs 는 그 밖. nextjs 에게 도메인 시그니처를 바꾸지 말고 더하라고 지시 |
| R4     | `curvez-nextjs`(U3)                                     | 단독                                                                                   |
| R5     | `curvez-qa`(단위+E2E)                                   | 순차. 구현을 읽는다                                                                    |
| R6     | `curvez-reviewer` → `curvez-structure-reviewer`         | 읽기 전용                                                                              |
| R7~    | 지적 수정 `curvez-nextjs` → 재리뷰                      | 최대 2회                                                                               |

**계획을 바꾼 것:** 처음에는 모두 한 명씩 띄우기로 했다. R1·R2 에서 비동기 완료 통지와 핸드오프 파일 확인이
둘 다 정상으로 돌아와 멈춤 위험이 확인되지 않았으므로, 소유 경로가 분리된 R2b·R3 는 병렬로 돌렸다. 되돌릴 위치: 이 표.

**nextjs ↔ qa 소유 경로:** `apps/preemie-calc/**` 가 `apps/preemie-calc/tests/**` 를 포함한다. 지시서 SCOPE 에서 nextjs 쪽 배제 목록으로
`tests/`, `vitest.config.ts`, `playwright.config.ts` 를 차감했다. 차감한 뒤에는 겹치지 않는다.

### 루프 상한

리뷰 지적 → 수정 → 재리뷰는 최대 2회. 같은 단위가 두 라운드 연속 나아지지 않으면 멈추고 보고한다.

### 라운드 결과

| 라운드 | 워커 | status | 핸드오프 | 요점 |
| --- | --- | --- | --- | --- |
| R1 | curvez-requirements | done | curvez-requirements.20260929-114807.json | AC 38 + 예외 8 + 비기능 11 을 ID 로 옮김. 원문 일치 46/46 |
| R2 | curvez-architect | done | curvez-architect.20260929-115823.json | FSD 절 추가, ARCH-101~108, 데이터 모양 ①~⑦, 미결 위치 표. handwork 절 삭제 0줄 |
| R2 | curvez-designer | done | curvez-designer.20260929-121238.json | 화면 9·컴포넌트 18·대비 13쌍 전부 4.5 이상 |
| R2b | curvez-designer | done | curvez-designer.20260929-122449.json | 오케스트레이터 대조 3건 수정: 첫 화면 이름 칸 제거(PC-F1-AC1), 이름·체중은 EditProfileDialog, 아이 추가는 `/?new=1` |
| R2b | curvez-nextjs (U1) | partial | curvez-nextjs.20260929-123617.json | 스캐폴드·도메인·데이터 JSON 4개. SPEC 예시 33건 일치. lint 크래시(앱에 eslint ^9 없음) → 사용자 질문 |
| R3 | curvez-qa (단위) | partial | curvez-qa.20260929-124825.json | 단위 54/54, 루트 test 195/195. 화면 AC 는 범위 밖이라 partial |
| R3 | curvez-nextjs (U2) | partial | curvez-nextjs.20260929-125818.json | F1~F6 화면 6 라우트. a11y 세부 3건 미구현, 경계 상태 디자인 질문 → designer |
| R4 | curvez-designer | done | curvez-designer.20260929-130404.json | 경감 경계(203·231일) 상태 문구 정의 |
| R4 | curvez-nextjs (U3) | partial | curvez-nextjs.20260929-131148.json | F7 공유(fragment·canvas), F13 481쪽, sitemap /guide 481 |
| R4b | curvez-nextjs (마무리) | partial | curvez-nextjs.20260929-132608.json | a11y 3건, 경계 상태, guide 링크를 <a> 로(481쪽) |
| R5 | curvez-qa (E2E) | partial | curvez-qa.20260929-134549.json | 57개 ID 판정: 자동 통과 55, 실패 1(PC-NF-MOBILE-3), 수동 1(PC-F7-AC4). E2E 62/63 |
| R5 | curvez-reviewer | blocked | curvez-reviewer.20260929-133840.json (대필) | findings 10: blocker 2(ERR-01, ACC-01), major 3, minor 5 |
| R5 | curvez-structure-reviewer | partial | curvez-structure-reviewer.20260929-133840.json (대필) | findings 10: P1 3, P2 3, P3 4. 순환 0, ARCH 위반 0 |
| R6 | curvez-architect | done | curvez-architect.20260929-134511.json | 이의 3건 판정: 기준일 확인 전은 null 쌍, 규칙 슬라이스는 자체 입력 타입, widgets 판정 순서 규칙 |
| R6 | curvez-designer | done | curvez-designer.20260929-135135.json | SPEC 우선으로 6건 반영(전환 위치, 복사 버튼 상시, 교정 문구, ValueCard, 카드 줄 나눔, 필수 표시) |
| R7 | curvez-nextjs (수정 1회차) | partial(lint 만) | curvez-nextjs.20260929-141505.json | 16건 반영. E2E 63/63, `/` 정적, 같은 층 슬라이스 import 0 |
| R8 | curvez-qa (갱신·회귀) | done | curvez-qa.20260929-143027.json | 단위 62/62(루트 203/203), E2E 75/75 ×3. 57개 ID 미커버 0 |
| R8 | curvez-reviewer (재리뷰 1/2) | done(major 1 남음) | curvez-reviewer.20260929-142822.json (대필) | 지난 10건 중 닫힘 9, 부분 1. 새 지적 3(DSG-02 major, DSG-03, ERR-03) |
| R8 | curvez-structure-reviewer (재리뷰 1/2) | done | curvez-structure-reviewer.20260929-142822.json (대필) | 6건 전부 닫힘. 같은 층 슬라이스 간선 5→0, 순환 0. P3 기록 DUP-04 |
| R9 | curvez-nextjs (수정 2회차) | partial(lint 만) | curvez-nextjs.20260929-143509.json | 4건 반영. 단위 62/62, E2E 75/75 |
| R9 | curvez-designer | done | curvez-designer.20260929-143645.json | RequiredMark 스크린리더 문구 ", 필수" |
| R9 | curvez-reviewer (재리뷰 2/2) | done | curvez-reviewer.20260929-143901.json (대필) | 4건 닫힘. 새 P3 2건(ERR-04, DSG-04, 둘 다 브라우저 미확인). **루프 상한 도달 — 더 돌리지 않는다** |

### lint 수정 라운드 (2026-09-29, 사용자 요청)

사용자 원문: "1번 eslint 추가하고 lint 다시 돌려줘" → "응 수정 라운드 돌려줘". eslint ^9.39.5 는 메인 세션이 설치했다. 구성원(nextjs·qa·reviewer)은 승인된 팀 안에서 바뀌지 않았다.

| 라운드 | 워커 | status | 핸드오프 | 요점 |
| --- | --- | --- | --- | --- |
| L1 | curvez-nextjs | done | curvez-nextjs.20260929-150810.json | lint 8건(오류 6·경고 2) → 0. useSyncExternalStore 전환 4곳, 조건부 마운트 1곳, prop 이름 변경, 안 쓰는 prop·import 제거 |
| L2 | curvez-qa | done | curvez-qa.20260929-151644.json | 게이트 5/5, E2E 75/75 ×2, 하이드레이션 감시를 E2E 75건 전체에 붙였고 위반 0건 |
| L2 | curvez-reviewer | done | curvez-reviewer.20260929-151327.json (대필) | 의심 지점 4개 모두 결함 아님. 새 P3 2건(ERR-05, ACC-09), 둘 다 확인 필요 |

### 디자인 재구성 라운드 (2026-09-30, 사용자 요청)

사용자 원문: "디자인이 좀더 예쁘면 좋겠는데?" → 분위기 "밝고 생기 있는", 범위 "화면 구성도 다시", "헤더 타일틀은 중앙에 정렬하고", "lucide-react 추가"(^1.41.0) 승인. 구성원(designer·nextjs·qa·reviewer)은 승인된 팀 안에서 바뀌지 않았다. ERR-05 는 메인 세션이 직접 고쳤다.

| 라운드 | 워커 | status | 핸드오프 | 요점 |
| --- | --- | --- | --- | --- |
| D1 | curvez-designer ∥ curvez-qa(변경 전 캡처) | done / done | curvez-designer.20260930-000944.json, curvez-qa.20260929-235449.json | 5계열 색·아이보리 배경·lucide 32종·헤더 3분할·HeaderMenu·폭별 레이아웃. 변경 전 캡처 20장 |
| D2 | curvez-nextjs | done | curvez-nextjs.20260930-003549.json | 구현. E2E 69/75(의도된 상호작용 변경 6건) |
| D3 | curvez-qa ∥ curvez-reviewer | done / partial | curvez-qa.20260930-004841.json, curvez-reviewer.20260930-004251.json (대필) | 테스트 6건 선택자 수정 + 헤더 검사 29건. E2E 104/104. 리뷰 major DSG-05(360px 제목-버튼 겹침) |
| D4 | curvez-nextjs | partial | curvez-nextjs.20260930-010104.json | DSG-05 수정, guide h1 1개로 |
| D5 | curvez-qa ∥ curvez-reviewer(재리뷰 1/2) | done / done | curvez-qa.20260930-011000.json, curvez-reviewer.20260930-010609.json (대필) | 겹침 검사 36건 추가, E2E 140/140. DSG-05 닫힘 |
| D6 | curvez-nextjs | done | curvez-nextjs.20260930-012225.json → 012435(스키마 오류 대체) | 오케스트레이터가 캡처에서 찾은 시각 결함 수정: 음절 중간 줄바꿈, 값 조각 끊김, "+ 아이 추가" 위치·줄바꿈·더하기 중복 |
| D7 | curvez-designer ∥ curvez-qa ∥ curvez-reviewer(재리뷰 2/2) | done / done / done | curvez-designer.20260930-013031.json, curvez-qa.20260930-013434.json, curvez-reviewer.20260930-012842.json (대필) | 스펙 동기화, 회귀 검사 45건, E2E 185/185 ×2, 지적 0. **재리뷰 상한 도달** |

**오케스트레이터 결정(되돌릴 곳):** 헤더 제목은 가운데 칸에 가두고 말줄임 대신 줄바꿈(최대 3줄) — `src/shared/ui/PageHeader.tsx`. 전역 `word-break: keep-all` — `src/app/globals.css`. "+ 아이 추가" 앞 아이콘 제거 — `src/features/switch-child/ui/ChildSwitcherTabs.tsx`. guide 는 조합 제목 h1, 헤더 h2 — `src/views/guide/ui/GuideView.tsx`.

### 가로 폭 통일 라운드 (2026-09-30, 사용자 요청) ∥ 기준 출처 조사

사용자 원문: "가로사이즈는 메인과 서브가 동일하게 만들어 왔다갔다하지말고" → "720px 한 열 (권장)".
조사 담당 추가 승인 원문(선택지): "추가 (기존 대조 포함)". **팀에 `curvez-researcher` 를 더했다.** 쓰는 경로는 `.curvez/research/preemie-calc/**` 뿐이라 폭 통일 라운드와 겹치지 않아 병렬로 돌렸다.

| 라운드 | 워커 | status | 핸드오프 | 요점 |
| --- | --- | --- | --- | --- |
| W1 | curvez-qa(포트 3200 전환) ∥ curvez-designer(720px 스펙) | done / done | curvez-qa.20260930-103401.json, curvez-designer.20260930-104636.json | E2E 서버 3200, 다른 서버 재사용 끔. 3100 dev 서버(PID 43850) 유지 확인. 폭 토큰 6개 → `--layout-content-max` 1개 |
| W1 | curvez-researcher | partial(질문 9건) | curvez-researcher.20260930-105528.json | 확인 12건(URL 모두 실제로 연 것), 확인 불가 9건, 모순 1건 |
| W2 | curvez-nextjs | done | curvez-nextjs.20260930-105749.json | 공용 클래스 2개로 9개 화면·헤더·아이 전환 줄 통일, 대시보드 1열 |
| W3 | curvez-qa ∥ curvez-reviewer | done / done | curvez-qa.20260930-111300.json, curvez-reviewer.20260930-110259.json (대필) | E2E 189/189 ×2, 폭 실측 9화면 × 3폭 차이 0px. 리뷰 minor 1(DSG-10) |

standing.md 에 12번(3100 포트 보호), 13번(docs 쓰기 금지, 초안은 조사 담당만 읽음)을 더했다.

### SPEC v2 기능 라운드 (2026-09-30 11:37~13:44) + 통합 수정 라운드 (13:37~14:46)

사용자 원문: "권고대로 하고 확정" (v2), "응 권고대로 하고 팀 종료해줘" (통합). 공개 가이드 단독 라운드는 취소됐고, 메인 세션이 띄운 tmux 팀 3명이 F16~F18·F1 AC7 을 만든 뒤 통합 라운드에서 리뷰·수정했다. 구성원은 승인된 팀(requirements·researcher·architect·designer·nextjs·qa·reviewer) 안이다.

| 라운드 | 워커 | status | 핸드오프 | 요점 |
| --- | --- | --- | --- | --- |
| V1 | requirements ∥ researcher | done / partial | curvez-requirements.20260930-114040, curvez-researcher.20260930-114500 | AC 55·EX 13. LMS·백분위 CSV 원본 확보, 3세 미만 WHO 확정, 질병관리청 원본 표와 재게재본 3곳 불일치 |
| V2 | designer ∥ architect | partial / done | curvez-designer.20260930-120603, curvez-architect.20260930-120746 | 새 화면 4개, 데이터 모양 ⑧~⑬, ARCH-109~113 |
| V3 | nextjs | partial | curvez-nextjs.20260930-123524 | F7·F8(그래프 제외)·F10·F14·F15, JSON 7개, 글 영역 content-box 720 |
| V4 | qa ∥ reviewer | partial / blocked | curvez-qa.20260930-134140, curvez-reviewer.20260930-124514 (대필) | E2E 248/261. blocker ACC-01 목표키 ±3.25. 게이트는 통합 라운드 끝으로 미룸 |
| C1 | requirements(v3·v5) | done | curvez-requirements.20260930-121036, 133901 | AC 69·EX 14·NF 11 |
| C2 | nextjs ∥ reviewer(팀 파일) | done / partial | curvez-nextjs.20260930-135922, curvez-reviewer.20260930-135018 (대필) | v2 지적 6 + 팀 문제 3 + 구간표 정리. 팀 파일 지적 TEAM-01~09 |
| C3 | nextjs ∥ qa | done / done | curvez-nextjs.20260930-141142, curvez-qa.20260930-142300 | TEAM-03~09 수정, 팀 테스트 정리, 게이트 263/263 |
| C4 | reviewer(재리뷰 1/2) | partial | curvez-reviewer.20260930-143021 (대필) | 13건 닫힘. ERR-05 열린 리다이렉트 우회(major) |
| C5 | nextjs ∥ designer | done / done | curvez-nextjs.20260930-143844, curvez-designer.20260930-143207 | normalizeReturnPath, 저장소 손상 시 쓰기 거부, formula.md 모순 해소 |
| C6 | reviewer(재리뷰 2/2) + 오케스트레이터 최종 게이트 | done | curvez-reviewer.20260930-144416 (대필) | 지적 3건 닫힘, 새 minor 2(ERR-07·08). build 503쪽, E2E 263/263, test 103+141. **재리뷰 상한 도달** |

**오케스트레이터 결정(되돌릴 곳):** 예방접종 정본을 질병관리청 원본으로(`entities/vaccination/data/vaccination-schedule.json`). LMS 는 0~36개월만(`entities/growth/data/growth-lms.json`). Φ 는 순수 함수(`shared/lib/normal-distribution`, 사용자 확인 대기). F8 AC3 그래프 보류. designer↔architect 차이 3곳은 architect 를 따름. formula.md 는 안전 문구를 항상 보이는 쪽으로(DSG-02).

### 경감 경계 정정 + 성장 추이 그래프 라운드 (2026-10-02 10:47~13:55)

사용자 원문: "권고대로 하고 recharts 설치, .omc 지워줘". recharts 3.10.1 과 .omc 삭제는 메인 세션이 했다.

| 라운드 | 워커 | status | 핸드오프 | 요점 |
| --- | --- | --- | --- | --- |
| G1 | requirements ∥ researcher ∥ designer | done / partial / done | curvez-requirements.20261002-104939, curvez-researcher.20261002-104955, curvez-designer.20261002-105756 | AC 71(PC-F5-AC6·AC7). 브리프 정정 메모. GrowthTrendChart 스펙 |
| G2 | nextjs(경계) → architect | partial / done | curvez-nextjs.20261002-105551, curvez-architect.20261002-110444 | innerBoundary upper-inclusive. ⑬·결정 로그 정정, 그래프 데이터 모양, ARCH-114~118 |
| G3 | reviewer(경계) | partial | curvez-reviewer.20261002-111022 (대필) | 분류 원문 일치, TEAM-01 닫힘. major 3(내부 문구 노출, 브리프 용어 반대, E2E 옛 기대) |
| G4 | nextjs(그래프) ∥ nextjs(문구 제거) ∥ researcher(용어) | partial / done / partial | curvez-nextjs.20261002-112741, 111416, curvez-researcher.20261002-111500 | recharts 그래프, sourceNotes 정리, 브리프 용어 정정 |
| G5 | reviewer(그래프, 재리뷰 1/2) | done | curvez-reviewer.20261002-131232 (대필) | blocker·major 0, minor 2(DSG-11·12). DSG-01 닫힘 |
| G6 | qa ×2 | **실패(멈춤)** | 없음 | 두 번 모두 600초 무출력으로 중단. 두 번째가 tests/unit/growth-trend.test.ts(14건)만 남김. 재시도 상한 도달 |
| G7 | 오케스트레이터 게이트 1회 | — | curvez-orchestrator.20261002-135500 | tc 0, lint 0, test 115/117, build 503, E2E 262/263. 실패 3건 모두 옛 경계 기대 테스트 |

### 루프 상한 도달 후 남은 지적

| id | 등급 | 내용 | 담당 |
| --- | --- | --- | --- |
| curvez-reviewer/ERR-04 | P3 minor | 저장 실패 때 방향키 포커스가 선택 안 된 탭으로 이동 | curvez-nextjs |
| curvez-reviewer/DSG-04 | P3 minor | 접근성 이름에 쉼표 앞 공백("출생일 , 필수") | curvez-nextjs |
| curvez-reviewer/ACC-09 | P3 minor | useToday 가 렌더마다 날짜를 다시 읽음. 화면을 연 채 자정이 지나면 기준일이 바뀜(이전 동작과 다를 수 있음) | curvez-nextjs |
| curvez-reviewer/DSG-06 | P3 minor | HeaderMenu 가 열린 채 Tab 으로 빠져나가도 닫히지 않음(확인 필요) | curvez-nextjs |
| curvez-reviewer/DSG-07 | P3 minor | Button·메뉴 항목 hover/pressed 시각 피드백 없음 | curvez-nextjs |
| curvez-reviewer/DSG-08 | P3 minor | IconBadge 크기 폭별 전환 미구현 | curvez-nextjs |
| curvez-reviewer/DSG-09 | P3 minor | 자폭 넓은 폰트에서 헤더 제목 줄 수(확인 필요, 지금은 3줄까지 허용) | curvez-designer |
| curvez-reviewer/DSG-10 | P3 minor | 720px 가 패딩 포함 박스 폭이라, 글 영역이 768~1279px 에서 688px, 1280px 이상에서 656px 로 오히려 좁아짐 | curvez-designer |
| curvez-reviewer/ERR-07 | P3 minor | 접종 저장소 손상 시 체크가 안내 없이 되돌아감 | curvez-nextjs |
| curvez-reviewer/ERR-08 | P3 minor | 성장 저장소 손상 시 저장이 계속 실패하고 원인과 다른 문구가 보임 | curvez-nextjs |
| curvez-reviewer/DSG-11 | P3 minor | 그래프 범례 캡션을 스크린리더가 세 번 읽음(스펙 안 모순) | curvez-designer |
| curvez-reviewer/DSG-12 | P3 minor | 기록 1개 안내 카드 구성이 스펙과 다름(제목 추가) | curvez-designer |
| 기록만(넘기지 않음) | P3 | DUP-02, DUP-03, DUP-04, PLC-06, PLC-07, 리뷰어 decisions 의 ERR-05(복사 실패 무반응)·DSG-06·DSG-07 | — |

### 오케스트레이터가 고른 잠정값 (사용자 확정 전)

| 무엇 | 고른 것 | 되돌릴 위치 |
| --- | --- | --- |
| 경감 구간 경계(미결 2) | 잠정값 없음. 재태 203일·231일이면 구간을 정하지 않고 "미확정" | `apps/preemie-calc/src/entities/copay-relief/data/copay-relief.json` innerBoundary |
| 경감 종료일 계산(미결 2) | 출생일 + 구간 기간, "미확정" 표시. PC-F5-AC5 가 날짜 표시를 요구해서 | 같은 파일 endDateMethod |
| 공유 방법 | 카카오 SDK 대신 브라우저 공유(navigator.share) + 링크 복사. 카카오 앱 키가 없다 | U3 `features/share-result` |
| SPEC ↔ 디자인 충돌 (ACC-03, ACC-06) | SPEC 을 따른다(requirements.md 가 SPEC 우선). 전환은 예정일 칸 아래, 링크 복사는 항상 | `.curvez/design/preemie-calc/screens/input.md`, `components/ShareActionButton.md` |
| 예정일 전 교정 기준 검진 차수 (ERR-01) | 규칙을 만들지 않고 "출산 예정일 전이라 교정 나이가 아직 없습니다" + 미확정 표시 | `apps/preemie-calc/src/entities/checkup/model` |
| 리뷰 지적 합치기 | `<from>/<id>` 로 구분. P3 중 DUP-02·DUP-03·PLC-06·PLC-07 은 기록만 | 이 표 |

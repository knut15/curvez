forbidden-words: allow

# preemie-calc QA 전략 — U1 계산 도메인 라운드

이 라운드의 SCOPE 는 `apps/preemie-calc` 의 계산 도메인(U1 산출물)만이다. 화면(U2)은
`curvez-nextjs` 가 아직 만들지 않았다. 그래서 이번 라운드는 **단위 테스트만** 쓰고,
Playwright 는 다음 라운드가 화면 E2E 를 바로 쓸 수 있도록 설정만 둔다(스펙 0개).

## 층 배분과 근거

| 층 | 개수 | 대상 |
| --- | --- | --- |
| 단위 (vitest) | 54개 테스트 / 9개 파일 | `entities/*/model`, `shared/lib/calendar-date` 의 순수 함수 전부 |
| 통합 | 0 | 이번 라운드에 통합 지점(레포지토리↔도메인, API 라우트 등)이 없다. 화면이 없어 localStorage·라우팅과 도메인이 아직 맞물리지 않는다 |
| E2E (playwright) | 0 스펙, 설정만 | 화면이 없어 "사용자가 ~하면 ~가 보인다" 를 검증할 대상이 없다. CONTEXT 가 이번 라운드는 설정만 두라고 명시했다 |

판단 기준표의 "분기·계산·변환 로직 → 단위 테스트" 에 그대로 해당한다. `entities/*/model` 은
`model` 세그먼트 자체가 "React·Next 없이 단위 테스트할 수 있어야 한다"(architecture.md ⑦)고
계약돼 있어 다른 층을 고를 이유가 없었다.

## 수용 기준 ↔ 테스트 대응표

`grep -hoE 'PC-F[0-9]+-(AC|EX)[0-9]+' apps/preemie-calc/tests/unit/*.test.ts` 로 셀 수 있다.
CONTEXT 가 지정한 26개 AC/EX ID 가 전부 `describe` 이름에 있다.

| AC/EX ID | 테스트 파일 | 값 출처 |
| --- | --- | --- |
| PC-F1-AC2 | `child-profile.test.ts` | SPEC 머리말 예시 (2026-03-01 / 2026-04-26 / 32주 0일) |
| PC-F1-AC3 | `child-profile.test.ts` | 위와 같음, 역산 |
| PC-F1-EX1 | `child-profile.test.ts` | architecture.md 데이터 모양 (154·308일 경계 양쪽 + SPEC 예시 문장) |
| PC-F1-EX2 | `child-profile.test.ts` | architecture.md 데이터 모양 (`birthDate > today`) |
| PC-F2-AC1~AC4 | `child-ages.test.ts` | SPEC F2 AC1~AC4 원문의 날짜·값을 그대로 옮김 |
| PC-F3-AC1~AC5 | `age-basis.test.ts` | SPEC F3 AC1~AC5 원문 + architecture.md `age-basis.json` |
| PC-F4-AC1 | `checkup.test.ts` | **하드코딩 없음.** `checkupRounds`(= JSON 을 그대로 읽은 공개 API)에서 각 차수의 `visitWindow` 를 읽어 `addAgeOffset`/`addDays` 로 기대값을 독립 계산한 뒤 `planCheckups` 출력과 대조 |
| PC-F4-AC2 | `checkup.test.ts` | SPEC F4 AC2 원문 (2026-09-15, 교정 4개월) |
| PC-F4-AC3 | `checkup.test.ts` | architecture.md `questionnaireCorrection.value.lastCorrectedRoundId`(round-4) 뒤 차수(round-5)로 검증 |
| PC-F4-EX1 | `checkup.test.ts` | round-8 방문 기간 경계 양쪽(마지막 날 / 다음 날) |
| PC-F5-AC1~AC5 | `copay-relief.test.ts` | SPEC F5 AC1~AC5 원문 (32주0일→224일, 28주6일→202일, 35주0일→245일, 37주0일→259일) |
| PC-F6-AC1~AC3 | `correction-period.test.ts` | SPEC F6 AC1~AC3 원문 (32주0일/체중없음, 27주6일, 32주0일+1.4kg) |
| PC-F13-AC2 | `combo.test.ts` | SPEC F13 AC2 원문 ("32주 출생 생후 3개월" → 8주) |
| — (COMBO 범위 481) | `combo.test.ts` | architecture.md ⑥ `COMBO_WEEKS`(13)·`COMBO_MONTHS`(37). **PC-F13-AC1·AC4 자체는 아니다** — 아래 "커버하지 않은 것" 참고 |
| addMonths 말일 보정 | `calendar-date.test.ts` | architecture.md ③ 결정 로그 ("01-31 + 1개월 = 02-28") |
| KST 경계 | `calendar-date.test.ts` | architecture.md ③ ("now 에 9시간을 더한 UTC 날짜") — UTC 15:00 전후 주입 |
| `[미확정]` 재태 203일·231일 경계 | `copay-relief.test.ts` | architecture.md "PRD 미결 값의 위치" — `innerBoundary` 가 미확정이라 `classifyCopayRelief` 가 현재 잠정으로 내는 `boundary-unconfirmed` 동작을 고정 |
| 기준 데이터 4개 메타 필드 | `reference-data.test.ts` | architecture.md ④ `ReferenceMeta` (sources·effectiveDate·lastVerified) |

## 디자인 스펙(상태·접근성) — 이번 라운드는 커버하지 않는다

`.curvez/design/preemie-calc/` 에 화면·컴포넌트 스펙이 이미 있다(`curvez-designer` 가
먼저 작업한 결과). 하지만 이번 라운드 SCOPE 와 CONTEXT 는 계산 도메인(U1)만 지정했고,
그 스펙이 그리는 화면(U2)은 `curvez-nextjs` 가 아직 구현하지 않았다(핸드오프
`curvez-nextjs.20260929-123617.json` summary: "화면(U2)은 이번 라운드에 만들지 않았다").
렌더링 대상이 아예 없는 상태에서 `state:*`·`a11y:*` 테스트를 쓰면 통과시킬 컴포넌트가
없어 잡음만 생긴다. 화면이 구현되는 다음 라운드에 상태·접근성 테스트를 쓴다.

## 테스트하지 않는 것과 이유

| 대상 | 이유 |
| --- | --- |
| `describeCombo` 의 `correctedMonths` 정확한 값 | architecture.md 가 "교정 나이를 개월로 바꾸는 규칙은 curvez-nextjs 가 정하고 decisions 에 남긴다" 고 위임했고, ACCEPTANCE 가 요구하는 값은 `weeksEarly` 뿐이다(PC-F13-AC2). `curvez-nextjs` 의 decisions 도 "1개월=4주 단순화" 를 근사라고 명시했다 |
| PC-F13-AC1·AC3·AC4 (481쪽 빌드·계산기 링크·사이트맵) | "빌드 결과 검사" 가 확인 방법이다. `app/guide/[weeks]/[months]`, `sitemap.ts` 라우트가 이번 라운드에 없어 빌드할 대상이 없다. `combo.test.ts` 는 그 두 기준이 의존하는 상수(481)만 선행 검증한다 |
| PC-F1-AC1·AC4·AC5·AC6, PC-F1-EX3 | E2E 대상(화면·localStorage·UI 문구)이다. SPEC 확인 방법 줄이 이 AC 들을 "E2E" 로 지정했고, CONTEXT 가 이번 라운드는 E2E 스펙을 쓰지 않는다고 명시했다 |
| PC-F2-AC5, PC-F3-AC3 의 "(24개월 검진까지)" 같은 화면 문구 | 정적 문구다. 코드를 그대로 옮겨 적는 테스트는 버그를 못 잡는다(판단 기준 "테스트하지 않을 것" 표) |
| PC-F4-AC4·AC5, PC-F5-AC5 의 "맨 위에 강조", "화면 아래에 보인다" 같은 배치 문구 | 레이아웃·배치는 화면(UI) 몫이라 계산 도메인 단위 테스트로 검증할 대상이 아니다. `PC-F5-AC5` 는 값(정책 라벨·endDate)만 계산 단위로 검증했다 |
| PC-F6-AC4, "의료진과 상담해 정하세요" | 정적 문구 |
| PC-F6-EX1 (재태 37주 이상이면 기능이 안 보임) | UI 표시 여부다. `correctionPeriod` 의 `not-applicable` kind 자체는 이미 함수 시그니처에 있지만 이번 CONTEXT 지정 목록(AC1~AC3)에 없어 범위 밖으로 뒀다 |
| F7(공유 카드), F8~F12 | SPEC §1 단계 칸과 requirements.md "범위 밖" 이 F8~F12 를 2·3단계로 명시했고, F7 은 화면(공유 링크 UI)이 필요해 이번 라운드 범위가 아니다 |
| 기준 데이터 4개의 `lastVerified` 가 "언젠가 null 이 아니어야 한다" 는 값 자체 | CONTEXT 지시: "값이 null 이면 null 임을 기록 — 실패로 만들지 않는다." `reference-data.test.ts` 는 필드 존재(날짜 형식 또는 null)만 검사하고, null 이라는 사실은 테스트 이름에 현재 값을 그대로 적어 기록했다 |

## 실행 결과 (수치)

- `pnpm --filter preemie-calc test` (= `vitest run`): **9개 파일, 54개 테스트, 54개 통과, 0개 실패.** 3회 연속 실행 결과 동일(플래키 아님) — `.curvez/qa/preemie-calc/last-run-unit.log`
- 워크트리 루트 `pnpm test` (= `pnpm -r --if-present test`): **exit 0.** preemie-calc 54/54, packages/scopulus-ui 141/141, 총 195개 중 195개 통과, 0개 실패 — `.curvez/qa/preemie-calc/last-run-root.log`
- `skip`/`only`/`todo` 개수: 0
- `pnpm --filter preemie-calc typecheck`: 오류 0건, exit 0
- `pnpm exec playwright test --list`: **exit 1**("No tests found"), 그러나 "Listing tests: Total: 0 tests in 0 files" 까지 정상 출력돼 **설정 자체는 오류 없이 로드됐다.** CONTEXT 가 "0 tests 여도 된다" 고 명시했다 — `.curvez/qa/preemie-calc/last-run-e2e-list.log`
- `pnpm exec playwright install chromium`: exit 0. `~/Library/Caches/ms-playwright/chromium-1243` 확인(이미 설치돼 있었거나 이번에 설치됨)

## 알려진 잡음(수정 대상 아님)

- `vitest run` 실행마다 `(!) Your Vite config uses features that are unsupported by configLoader: 'native'` 경고가 뜬다. `vitest.config.ts` 가 CommonJS 로 로드되는데 ESM 문법을 쓰기 때문이다. 테스트 결과에는 영향 없다(exit 0, 54/54 통과). 고치려면 `apps/preemie-calc/package.json` 에 `"type": "module"` 을 추가해야 하는데, 그 파일은 `curvez-nextjs` 소유라 손대지 않았다.

---

# preemie-calc QA 전략 — 2라운드: 화면 E2E + 빌드 산출물 검사

U1~U3 가 F1~F7·F13 화면을 전부 구현했다. 이 라운드는 지난 라운드가 계산 도메인(단위
테스트)만 커버하고 남겨 둔 화면·비기능 19개 + 화면 문구 확인을 채운다.

## 층 배분과 근거

| 층 | 개수 | 대상 |
| --- | --- | --- |
| 단위 (vitest) | 56개 테스트 / 10개 파일(54개 기존 + 신규 2개) | 계산 도메인(그대로 유지) + `PC-F13-AC1·AC4` 빌드 산출물 검사(`f13-build-artifacts.test.ts`, node `fs` 로 `.next` 산출물을 직접 센다 — "빌드 결과 검사"가 확인 방법이라 단위 계층에 둔다. 브라우저가 필요 없어 vitest 가 더 낮은 층이다) |
| 통합 | 0 | 여전히 레포지토리↔도메인 경계, API 라우트가 없다(localStorage 직접 접근만 있고, 그 경계는 화면 E2E 가 실제로 지나간다) |
| E2E (playwright) | 62개 테스트 / 9개 파일 | 수용 기준 문장의 주어가 "사용자"인 화면 동작(F1 저장·전환·삭제, F7 공유·수신, F13 링크 이동)과, 여러 컴포넌트가 실제로 맞물려야만 보이는 화면 문구(F2~F6 화면 텍스트) |

tie-break 규칙(같은 기준을 여러 층에서 검증 가능하면 가장 낮은 층 하나 + 사용자 가시 경로면
e2e 하나 더)에 따라, F2~F6 의 계산값은 지난 라운드 단위 테스트를 그대로 두고, 그 값이
실제 화면 문구로 나오는지만 이번 라운드 e2e 로 추가했다(중복 검증이 아니라 계층이 다른
검증 — 단위는 계산 함수의 출력, e2e 는 그 출력이 화면에 배선됐는지).

## 수용 기준 ↔ 테스트 대응표

전체 57개(AC 38 + EX 8 + NF 11) 판정은 `.curvez/qa/preemie-calc/ac-matrix.md` 에 AC ID 별로
정리했다. `grep -ohE 'PC-F[0-9]+-(AC|EX)[0-9]+|PC-NF-[A-Z0-9]+-[0-9]+' apps/preemie-calc/tests/e2e/*.ts apps/preemie-calc/tests/unit/*.ts | sort -u | wc -l` 로 57 이 나온다(전부 대응됨).

## 디자인 스펙(상태·접근성) 키 ↔ 테스트 대응표

`.curvez/design/preemie-calc/` 의 화면 9개·컴포넌트 19개 스펙 중, 이번 라운드가 다루는
키만 옮긴다(전체 키 목록은 각 문서 참고).

| 스펙 키 | 대상 화면/컴포넌트 | 테스트 |
| --- | --- | --- |
| `a11y:contrast`(tokens.md 대비 검증 표 13쌍) | 전체 | `tests/e2e/nf-a11y.spec.ts`:"PC-NF-A11Y-2 — {8개 화면} ..." — tokens.md 가 이미 문서 작성 시점에 node 계산으로 13쌍을 검증했고(정적값), 이 라운드는 실제 렌더된 DOM 의 computed color/bg 로 같은 공식을 다시 계산해 값이 배선대로 나왔는지 확인한다 |
| `a11y:label`(StatusBadge, DateField, GestationInput, SegmentedControl, TextField) | checkups, input | `tests/e2e/nf-a11y.spec.ts`:"PC-NF-A11Y-3 ..." (입력칸), "PC-NF-A11Y-1 — 검진 차수 상태 ..." (배지 텍스트가 곧 접근 이름) |
| `a11y:role`(SegmentedControl radiogroup/radio, ChildSwitcherTabs tablist/tab, InfoRow nav-card=link) | input, dashboard | `tests/e2e/f1-profile.spec.ts`("radiogroup"·"tab" role 로 질의해야 통과), `tests/e2e/nf-a11y.spec.ts` |
| `a11y:target`(Button 48/52px, `--touch-target-min`) | 전체 | `tests/e2e/nf-mobile.spec.ts`:"PC-NF-MOBILE-1·2·3 — {9개 화면}" — **위반 1건 발견**(아래 ac-matrix.md "발견한 결함" 참고) |
| `state:default/empty/error`(dashboard, age-basis, checkups, copay-relief, correction-period, share) | 위 화면들 | `state:default` 는 각 F2~F7 e2e 테스트가 기본 경로로 지나간다. `state:empty`(PC-F2-EX1, dashboard/각 하위 4화면의 "프로필 없음 → / 리다이렉트")는 `f2-dashboard.spec.ts`"PC-F2-EX1"이 dashboard 만 확인했다 — 하위 4화면(age-basis 등)의 같은 리다이렉트는 이번 라운드에 별도 테스트를 쓰지 않았다(아래 "테스트하지 않는 것" 참고). `state:error`(localStorage 손상) 는 이번 라운드에 테스트하지 않았다(아래 참고) |
| `state:boundary-unconfirmed`(copay-relief) | copay-relief | `tests/e2e/nf-mobile.spec.ts`:"... copay-relief state:boundary-unconfirmed", `tests/e2e/nf-a11y.spec.ts`:"... 미확정 표시는 색이 아니라 '△' 기호 ..." |
| `focus-order` | — | 이번 라운드에 테스트하지 않았다(아래 참고) |

## 테스트하지 않는 것과 이유 (이번 라운드 추가분)

| 대상 | 이유 |
| --- | --- |
| `state:error`(localStorage 손상 시 각 화면의 에러 패널) | curvez-nextjs 의 결정 로그(handoff `curvez-nextjs.20260929-125818.json`)가 이 상태를 "런타임에서 실제로 처리하는 코드를 만들지 않았다"고 밝힌 부분(기준 데이터 JSON 로드 실패)과, localStorage 손상 쪽(`corrupted`)은 만들어져 있지만 이번 CONTEXT 지정 목록에 없어 새 E2E 를 쓰지 않았다. `loadProfileStore` 의 `corrupted` 분기 자체는 `entities/child/api` 계약에 있으니 다음 라운드가 `localStorage.setItem('preemie-calc/profiles', '{깨진 JSON}')` 을 주입해 검증할 수 있다 |
| age-basis·checkups·copay-relief·correction-period 4개 하위 화면의 `PC-F2-EX1`류 리다이렉트(프로필 없을 때 `/`로) | `DashboardSubpageShell` 하나가 4개 화면 공통으로 이 로직을 담당한다(코드 재사용). dashboard 자체에서 이미 같은 분기(`shouldRedirectHome`)를 e2e 로 확인했고, 나머지 4개는 같은 컴포넌트의 반복이라 새 검증이 주는 정보가 낮다(판단 기준 "가장 낮은 층 하나" 원칙을 컴포넌트 재사용에도 적용) |
| `focus-order`(각 screens/*.md 명시 순서) | CONTEXT 가 이번 라운드에 요구한 목록에 없다. 열거된 컴포넌트가 이미 시맨틱 HTML(라벨-입력 연결, 버튼 DOM 순서)이라 탭 순서는 DOM 순서와 자연히 같지만, "다음 항목으로 Tab 이 실제로 이동하는지"를 항목별로 확인하는 전용 테스트는 쓰지 않았다 |
| ConfirmDialog·EditProfileDialog 의 focus trap(네이티브 `<dialog>` 표준 동작) | 판단 기준 "테스트하지 않을 것 — 프레임워크 자체 동작"에 해당한다. `<dialog>.showModal()` 의 포커스 가두기는 브라우저(Chromium) 구현이고, 우리가 만든 로직이 아니다. 다만 다이얼로그가 열렸을 때 첫 포커스가 의도한 요소(취소 버튼/이름 입력칸)로 가는지는 이번 라운드 e2e 가 간접적으로 지나가지만(EditProfileDialog 를 열고 이름을 바로 채우는 상호작용), 전용 포커스 단언은 쓰지 않았다 |
| `PC-F7-AC1` 카드 이미지의 실제 픽셀 렌더 결과 | canvas 는 픽셀이라 문자열 검사가 안 된다. `fillText` 호출 가로채기로 "그리기에 넘긴 문자열 목록"까지만 검증했고, 실제로 그 문자열이 지정된 폰트·크기·색으로 올바르게 래스터화됐는지는 검증 범위 밖이다 |
| PC-F7-AC4 (360px 폭에서 확대 없이 읽힘) | 사람의 시지각 판단이 필요하다 — `.curvez/qa/preemie-calc/manual-checks.md` 참고 |

## 실행 결과 (수치)

- `pnpm --filter preemie-calc test:e2e`(= `playwright test`, chromium-mobile 360×800): **63개 테스트, 62개 통과, 1개 실패.** 3회 연속 실행 결과 모두 동일(62 passed / 1 failed, 같은 테스트 — 플래키 아님). 실패 1건은 결함 발견(PC-NF-MOBILE-3, ac-matrix.md "발견한 결함" 참고) — `.curvez/qa/preemie-calc/last-run-e2e-2.log`
- 워크트리 루트 `pnpm test`(= `pnpm -r --if-present test`): **exit 0.** apps/preemie-calc 10개 파일 56개 테스트 56개 통과(기존 54개 + 신규 F13 빌드 검사 2개), packages/scopulus-ui 38개 파일 141개 테스트 141개 통과. 총 197개 중 197개 통과, 0개 실패
- `skip`/`only`/`todo` 개수: 0(e2e·unit 전부)
- `pnpm --filter preemie-calc typecheck`: 오류 0건, exit 0
- 수용 기준 커버: 57개 중 57개 대응(미커버 0개) — `.curvez/qa/preemie-calc/ac-matrix.md`

## 이번 라운드에서 직접 고친 것 (2라운드)

없다. `src/**` 는 전부 읽기만 했다(발견한 결함은 고치지 않고 `ac-matrix.md`·핸드오프
`blocked_on` 으로 `curvez-nextjs` 에 돌린다).

---

# preemie-calc QA 전략 — 3라운드: 수정 1회차 대응(architect 결정 1 반영 + 회귀 테스트)

curvez-nextjs 가 리뷰 1회차 지적 16건을 고쳤다. 이 라운드는 (1) architect 결정 1(ACC-04,
effectiveDate·lastVerified 유니온)에 맞춰 known-failure 였던 5건을 새 계약으로 갱신하고,
(2) curvez-reviewer 가 코드를 읽고 지적했지만 테스트가 없던 결함 7건(ERR-01, ACC-01, ACC-02,
ACC-03, ACC-05, ACC-06, DSG-01)과 curvez-nextjs 의 수정(ERR-02)에 회귀 테스트를 더한다.

## 층 배분과 근거 (이번 라운드 신규분)

| finding | 층 | 근거 |
| --- | --- | --- |
| ACC-04(계약 갱신) | 단위(vitest) | `resolveReferenceMeta`·`ReferenceMeta` 는 순수 함수·타입이다. "한쪽만 null 이면 오류"라는 분기 로직은 단위 테스트가 가장 낮은 층에서 가장 싸게 잡는다 |
| ERR-01 | 단위 + e2e 둘 다 | `planCheckups`(순수 함수)의 예외 여부는 단위가 가장 싸게 120번 반복할 수 있다. 동시에 수용 기준 문장의 관찰 주체가 "화면"(대시보드가 예외 없이 뜨고 문구가 보인다)이라 e2e 를 하나 더 둔다(판단 기준 "사용자 가시 경로면 e2e 하나 더") |
| ACC-01, ACC-02, ACC-03, ACC-06 | e2e만 | 넷 다 "화면에 어떤 문구/순서/버튼이 보이는가"라는, 컴포넌트 조합 결과에 대한 관찰이다. 계산 로직 자체(basis 분류, 값 포맷)는 이미 단위 테스트가 있어 중복하지 않는다 |
| ACC-05 | 단위 + e2e 둘 다 | `validateProfileDraft`(순수 함수)의 분기는 단위가 싸다. 동시에 CONTEXT 가 명시적으로 화면 문구("날짜를 확인하세요")와 저장 버튼 비활성 상태를 요구했고, 이는 여러 컴포넌트(GestationInput 입력 → ProfileForm 상태 → 버튼 disabled)가 맞물려야 보이는 결과라 e2e 로도 확인한다 |
| ERR-02 | e2e만 | localStorage 예외 처리는 `entities/child/api`(순수 함수)와 여러 view(InputView·DashboardView)가 맞물려 "첫 화면이 깨지지 않는다"는 사실 자체가 관찰 대상이다. 브라우저의 `pageerror` 이벤트로만 확인할 수 있어 단위로 대체할 수 없다 |
| DSG-01 | e2e만 | 실제 canvas `measureText` 값(폰트 렌더링 결과)은 브라우저 환경에서만 얻을 수 있다. jsdom/node 단위 테스트는 폰트 메트릭이 없어 이 값을 대체할 수 없다 |

## 수용 기준 ↔ 회귀 테스트 대응표

`.curvez/qa/preemie-calc/ac-matrix.md` 의 "회귀 테스트 ID 목록" 절에 finding ID 별로 정리했다.
이 테스트들은 `PC-F*`/`PC-NF-*` ID 가 아니라 리뷰 finding ID(`ERR-01` 등)에 대응하므로 별도
표로 뒀다 — 57개 AC 커버는 이미 100%였고, 이번 라운드가 더한 것은 "리뷰가 코드로는 봤지만
실행으로 확인된 적 없던" 결함의 회귀 방지다.

## PC-F3-AC4 · PC-F4-AC5 판정 재검토 (architect 결정 1 반영)

CONTEXT 질문("AC 문장 기준으로 통과인지")에 대한 답: **자동 통과(조건부: 원문 대조 전)** 로
판정했다. 근거는 `.curvez/qa/preemie-calc/ac-matrix.md` 의 해당 행에 그대로 적었다 — AC
원문은 "기준일"이라는 이름표가 있는지를 요구하고 화면은 그 이름표를 항상 보이지만, 지금 그
값은 실제 날짜가 아니라 "확인 전"이다. 세 값(자동 통과/자동 실패/수동) 표기를 유지하되
"(조건부: 원문 대조 전)"을 덧붙여, 원문 대조가 끝나기 전까지는 이 판정이 잠정임을 숨기지
않았다.

## 테스트하지 않는 것과 이유 (이번 라운드 추가분)

| 대상 | 이유 |
| --- | --- |
| DUP-01(RequiredMark)·PLC-02(ValueCard)·PLC-05(entities/child/model 분리)의 전용 회귀 테스트 | curvez-structure-reviewer 의 blocked_on 질문에 대한 답이다. 셋 다 리팩터링이지 공개 계약 변경이 아니다(props·반환값·export 목록이 그대로다). 기존 단위·e2e 테스트가 이미 그 공개 표면을 지나가고, 이번 라운드 typecheck·62개 단위·75개 e2e 전부가 그대로 통과해 회귀가 없음을 실행으로 확인했다. `ac-matrix.md` "회귀 테스트 ID 목록" 아래에 근거를 남겼다 |
| PLC-01·PLC-03·PLC-04(구조 배치 변경) | 파일 위치만 바뀌었고(barrel re-export, import 경로), 런타임 동작이나 공개 계약이 바뀌지 않았다. typecheck·quality-gate arch 가 이미 이 이동이 규칙을 어기지 않았음을 확인했다(curvez-architect 핸드오프 참고) |
| BND-01(app/page.tsx 정적화) | 빌드 결과(라우트 표 `○ /`)로 이미 검증된 사실이고, curvez-nextjs verification 에 남아 있다. 화면 동작 자체는 바뀌지 않아(BND-01 은 렌더링 방식만 바뀜) 별도 e2e 를 더하지 않았다 |

## 실행 결과 (수치)

`.curvez/qa/preemie-calc/ac-matrix.md` "실행 결과" 절 참고. 요약: 워크트리 루트 `pnpm test`
203/203, `pnpm --filter preemie-calc test:e2e` 75/75, 둘 다 3회 연속 동일(플래키 아님),
`skip`/`only`/`todo` 0건, AC 커버 57/57.

## 이번 라운드에서 직접 고친 것 (3라운드)

없다. `src/**` 는 전부 읽기만 했다. `tests/e2e/f1-profile.spec.ts` 등에서 처음 작성한 로케이터가
`getByLabel('일')`이 "출생일"과 충돌하거나 `getByRole('alert')`이 Next.js 라우트 안내자와
충돌하는 등 **테스트 자체의 버그**는 즉시 고쳤다(exact 옵션 추가, `.first()` 사용) — 이는
구현 코드 수정이 아니라 이 에이전트 소유 파일(`apps/preemie-calc/tests/**`) 안에서의 정상적인
작업이다.

---

# preemie-calc QA 전략 — 4라운드: lint 수정 대응 재검증 + 하이드레이션 감시

curvez-nextjs 가 eslint 오류·경고 8건을 5곳의 `react-hooks/set-state-in-effect`
(useSyncExternalStore 전환), `react/no-children-prop`(prop 이름 변경), `no-unused-vars`
2건(prop·import 제거)으로 고쳤다. 동작을 바꾸지 않았다고 주장하는 수정이라 이 라운드의
목표는 **테스트 기대값을 하나도 낮추지 않고** 57개 ID 판정이 이전과 같은지 수치로 재확인하는
것과, CONTEXT 가 새로 요구한 하이드레이션 감시를 더하는 것 두 가지다.

## 층 배분과 근거 (이번 라운드 신규분)

| 대상 | 층 | 근거 |
| --- | --- | --- |
| 하이드레이션 경고/오류 + pageerror | e2e (auto-fixture) | 서버 렌더 HTML 과 클라이언트 하이드레이션 결과의 불일치는 실제 브라우저의 `console`/`pageerror` 이벤트로만 관찰된다. 단위(jsdom)는 서버·클라이언트 두 렌더 경로가 실제로 이어붙는 과정 자체를 재현하지 못해 대체할 수 없다 |
| 나머지 게이트(typecheck·lint·test·build) | 그대로 | curvez-nextjs 가 `src/**` 만 고쳤고 이 라운드는 `tests/**` 의 import 한 줄만 바꿨다. 모든 계층에서 기존 판정을 다시 확인하는 것 자체가 목적이라 새 층 배분 논의가 필요 없다 |

`hydrationGuard` 를 개별 스펙마다 각각 추가하지 않고 **공용 fixture 하나**로 13개 파일 전부에
적용한 이유: "모든 E2E 에서" 라는 CONTEXT 요구를 스펙마다 반복해 쓰면 다음에 새 스펙이 추가될
때 그 반복을 빼먹기 쉽다. auto-fixture 로 `test` 자체에 묶으면 새 스펙이 이 모듈에서
import 하는 한 자동으로 적용돼, 판단 기준의 "가장 낮은 층 하나" 원칙과 같은 이유로 반복
비용을 없앴다.

## 수용 기준 ↔ 테스트 대응표

새 AC 는 없다(이번 라운드는 lint 수정 검증이라 요구사항 변경이 없었다). 57개 ID 는
`.curvez/qa/preemie-calc/ac-matrix.md` 표와 그대로 대응한다 — 4라운드 실행으로 재확인한
수치는 그 문서의 "실행 결과(4라운드, 수치)" 절에 있다.

## 디자인 스펙 키 대응표

3라운드까지와 동일. `.curvez/design/` 대비·터치 타깃 검증은 PC-NF-A11Y-2·PC-NF-MOBILE-3 로
이미 커버돼 있고, 이번 라운드는 그 테스트를 건드리지 않았다.

## 테스트하지 않는 것과 이유 (이번 라운드 추가분)

| 대상 | 이유 |
| --- | --- |
| `use-profile-store.ts` 의 `useSyncExternalStore` 캐시 구현 세부(훅 인스턴스별 `useRef`) | 판단 기준의 "private 함수·내부 구현 세부"에 해당한다. 이 구현이 옳은지는 이미 e2e 가 공개 계약(화면 간 프로필 값 일관성, PC-F1-AC6·PC-NF-PRIV-1)으로 검증한다 — 75/75 통과가 그 증거다. 구현을 직접 읽어 캐시 무효화 타이밍을 단위로 재현하면 리팩터링마다 깨지는 테스트가 된다 |
| `ChildSwitcherTabs` prop 이름이 `children`→`options` 로 바뀐 것 자체 | 정적 리네이밍이라 어떤 버그도 잡지 못한다(판단 기준 "정적 문구·상수 값 자체"와 같은 이유). 이 컴포넌트를 쓰는 화면(F1 탭 전환)은 이미 e2e 로 커버돼 있다 |
| `RequiredMark` 의 `label` prop 제거 자체 | 위와 같다. 접근성 문구(`sr-only`, ", 필수")는 이전 라운드부터 PC-NF-A11Y-3 등으로 이미 검증 중이고, prop 삭제는 그 문구를 바꾸지 않았다(핸드오프 note 확인) |

## 실행 결과 (수치)

`.curvez/qa/preemie-calc/ac-matrix.md` "실행 결과(4라운드, 수치)" 절 참고. 요약: 워크트리
루트 typecheck·lint·test(203/203)·build 전부 exit 0, `pnpm --filter preemie-calc test:e2e`
2회 연속 75/75(플래키 아님), 하이드레이션/pageerror 위반 0건(fixture 가 실제로 위반을
잡아내는 것은 임시 스펙으로 별도 확인), quality-gate 5/5, 57개 ID 판정 3라운드와 동일(자동
통과 55·자동 실패 0·수동 1, 조건부 2건 유지).

## 이번 라운드에서 직접 고친 것 (4라운드)

`src/**` 는 전부 읽기만 했다. `apps/preemie-calc/tests/e2e/support/fixtures.ts` 를 새로
만들고, 13개 e2e 스펙 파일의 import 한 줄씩만 이 모듈을 쓰도록 바꿨다(테스트 본문·assertion·
기대값은 손대지 않았다) — 위 "4라운드에서 직접 고친 것"(ac-matrix.md)에 파일 목록을 그대로
남겼다.

---

# preemie-calc QA 전략 — 5라운드: 디자인 재구성(HeaderMenu·아이콘) 대응

curvez-nextjs 가 5차 디자인 라운드("밝고 생기 있는" 리디자인, `curvez-nextjs.20260930-003549.
json`)를 구현했다. HeaderMenu(더보기 메뉴) 도입과 텍스트 기호(●✓·△) → lucide 아이콘 전환으로
기존 e2e 75개 중 6개가 깨졌고, GOAL 이 헤더 가운데 정렬·대시보드 2열 레이아웃을 새로 검증하라고
요구했다. 이 라운드는 요구사항(57개 ID) 자체를 새로 채우는 라운드가 아니라 **① 디자인이 바꾼
상호작용/표시에 맞춰 깨진 테스트를 고치고(기대값 완화 없이), ② 이번 리디자인 자체가 지키기로
한 계약(헤더 정렬·2열)을 새 테스트로 검증**하는 라운드다.

## 층 배분과 근거 (이번 라운드 신규분)

| 대상 | 층 | 근거 |
| --- | --- | --- |
| HeaderMenu 상호작용 변경 3건 | e2e(기존 유지) | 메뉴를 열고 항목을 누르는 것은 "사용자가 ~하면 ~된다"는 화면 상호작용이다. 이미 e2e 였고 계층을 바꿀 이유가 없다 — 선택자·조작 순서만 갱신했다 |
| 기호→아이콘 표시 변경 3건 | e2e(기존 유지) | 마찬가지로 화면에 실제로 무엇이 보이는가에 대한 관찰이라 e2e 가 맞는 층이다 |
| 헤더 제목 가운데 정렬(27개) | e2e | `boundingBox()`(실제 렌더 좌표)는 브라우저에서만 얻을 수 있다. CSS 계산 결과(minmax·grid 트랙 분배)를 jsdom/단위 테스트로 재현하려면 브라우저의 실제 레이아웃 엔진을 흉내 내야 해 신뢰도가 낮다 — "프레임워크/브라우저 자체 동작"이 아니라 **우리가 짠 CSS(pc-header-grid)의 결과**이므로 테스트 대상은 맞되, 층은 실제 렌더가 필요해 e2e 다 |
| 대시보드 2열/1열 대조 | e2e | 위와 같은 이유. 1열 대조군을 함께 둔 이유는 판단 기준 "실패를 숨기지 않는다"와 같은 취지 — 2열 assertion 이 우연히 항상 참이 되는 구조(예: 두 요소가 항상 다른 x 를 갖는 레이아웃)가 아님을 768px 케이스로 반증 가능하게 만들었다 |

무게 배분: 이번 라운드는 단위 0개 신규, e2e 29개 신규(수정 6개 포함) — 이번 변경 자체가
화면 상호작용/레이아웃에 관한 것이라 단위 계층에 내릴 로직이 없다(tie-break 규칙 "커버는 됐는데
층 선택이 갈리면 더 낮은 층" 은 로직 분기가 있을 때 적용되는데, 이번 변경엔 새 분기 로직이
없다 — CSS 값 배선 확인이 전부다).

## 수용 기준 ↔ 테스트 대응표

57개 ID 판정은 4라운드와 동일하고 `.curvez/qa/preemie-calc/ac-matrix.md` "5라운드" 절에
정리했다. 이번 라운드가 테스트 코드를 갱신한 6개 ID(PC-F1-AC6, PC-NF-PRIV-1, PC-NF-PRIV-3,
PC-NF-A11Y-1×3, PC-NF-A11Y-3)의 이전→이후 선택자 대응은 별도 문서
`.curvez/qa/preemie-calc/test-changes-redesign.md` 에 "판정하는 사실이 같은 이유"까지 담았다
(판단 기준 "실패를 숨기지 않는다" — 기대값을 낮추지 않고 조작 경로만 바꿨음을 근거로 남긴다).

## 디자인 스펙(상태·접근성) 키 ↔ 테스트 대응표

`.curvez/design/preemie-calc/` 의 화면 9개·컴포넌트 23개 스펙 중 이번 라운드가 새로 다루거나
재확인한 키만 옮긴다(전체는 각 문서 참고).

| 스펙 키 | 대상 | 테스트 | 비고 |
| --- | --- | --- | --- |
| PageHeader.md "## 레이아웃"(헤더 가운데 정렬, 명시적 스펙 규칙이지 `state:*`/`a11y:*` 리터럴 키는 아니다) | 화면 9개 전부 | `tests/e2e/nf-header-layout.spec.ts`(신규 27개) | 27개 조합 전부 중심 차이 0~0.01px(기준 ≤2px) |
| screens/dashboard.md "## responsive" >=1280px 2열 | dashboard | `tests/e2e/nf-header-layout.spec.ts`(신규 2개) | 1280px 2열 + 768px 1열 대조 |
| `a11y:contrast`(tokens.md 대비 검증) | 전체 8개 화면 | `tests/e2e/nf-a11y.spec.ts`:"PC-NF-A11Y-2 — ..."(테스트 코드 변경 없음, 새 색으로 재확인) | 하드코딩 색값이 아니라 매 실행 `getComputedStyle` 로 계산하는 구조라 리디자인에도 테스트를 고칠 필요가 없었다 — 그 자체가 이 테스트 설계가 "리디자인에 안전하다"는 증거다 |
| 상태 기호→아이콘 전환 후의 "색만으로 전달 안 함" | StatusBadge, UnconfirmedNotice, SegmentedControl | `tests/e2e/nf-a11y.spec.ts`:"PC-NF-A11Y-1 — ..." 3개(테스트 코드 갱신) | `.curvez/qa/preemie-calc/test-changes-redesign.md` "B" 참고 |
| HeaderMenu.md `role=menu`/`role=menuitem` | dashboard 헤더 | `tests/e2e/f1-profile.spec.ts`, `nf-privacy.spec.ts`, `nf-a11y.spec.ts`(테스트 코드 갱신) | `.curvez/qa/preemie-calc/test-changes-redesign.md` "A" 참고 |

## 테스트하지 않는 것과 이유 (이번 라운드 추가분)

| 대상 | 이유 |
| --- | --- |
| `HeaderMenu`의 방향키 roving·Esc 닫기·바깥 클릭 닫기 세부 동작 | GOAL CONTEXT 가 지정한 범위는 "깨진 6건을 고치고 새로 지정된 2가지를 검증"이다. 메뉴의 키보드 상호작용 세부(HeaderMenu.md 에 명시된 규칙)는 이번 라운드 CONTEXT 목록에 없어 새 전용 테스트를 추가하지 않았다 — 다음 라운드가 CONTEXT 로 지정하면 채운다 |
| `IconBadge` 32개 아이콘 각각의 정확한 아이콘 이름 매핑 | 아이콘 선택은 시각적 디자인 결정이고, 스크린리더는 `aria-hidden`이라 애초에 접근성 정보가 아니다(판단 기준 "스타일·색상·픽셀 단위 레이아웃"과 같은 이유 — 아이콘 종류도 여기 준한다) |
| IconBadge size 가 폭에 따라 전환되지 않는 것(curvez-nextjs decisions "React prop 이라 CSS 미디어쿼리만으로 전환 불가") | curvez-nextjs 가 이미 알려진 한계로 명시했고, E2E 는 정확한 아이콘 px 값을 검증 대상으로 삼지 않는다(NF-MOBILE 은 폰트·터치타깃·가로스크롤만 검사) |
| guide 페이지의 `<h1>` 2개 문제 자체를 실패하는 테스트로 만드는 것 | 판단 기준 "구현이 틀렸으면 직접 고치지 않고 돌린다" — 테스트를 일부러 실패시켜 결함을 알리는 대신, `getByRole("banner")`로 범위를 좁혀 우회하고 발견 사실을 `test-changes-redesign.md`·`ac-matrix.md`에 문서로 남겨 curvez-nextjs 에게 전달했다(이 문제는 이번 GOAL 이 요구한 검증도, 깨진 6건도 아니다 — 범위 밖에서 우연히 발견한 것) |

## 실행 결과 (수치)

`.curvez/qa/preemie-calc/ac-matrix.md` "5라운드" 절 "실행 결과 (수치, 5라운드)" 참고. 요약:
워크트리 루트 typecheck·lint·test(203/203)·build 전부 exit 0, quality-gate 5/5 PASS,
`pnpm test:e2e` 2회 연속 **104/104**(4라운드 75개 + 신규 29개, 플래키 아님), skip/only/todo
0건, AC 커버 57/57(미커버 0), after 캡처 20장, 포트 3100 시작 전 확인 비어 있음.

## 5라운드에서 직접 고친 것

`.curvez/qa/preemie-calc/ac-matrix.md` "5라운드에서 직접 고친 것" 절에 파일 목록을 그대로
남겼다. `src/**` 는 전부 읽기만 했다.

---

# preemie-calc QA 전략 — 6라운드: DSG-05·guide h1 중복 수정 대응

curvez-nextjs 가 `curvez-nextjs.20260930-010104.json`으로 DSG-05(360px 헤더 제목-뒤로가기
20.5px 겹침, major)와 5라운드가 발견해 넘긴 guide h1 중복을 함께 고쳤다. 이 라운드는 (1) 그
수정으로 깨진 guide@360/768/1280 3건을 갱신하고, (2) 5라운드 가운데 정렬 테스트가 중심 좌표만
재서 놓친 DSG-05 같은 겹침을 실측으로 재현·회귀 방지하는 새 테스트를 더하고, (3) 변경 후
캡처를 다시 찍는 라운드다. 요구사항(57개 ID) 자체는 바뀌지 않았다.

## 층 배분과 근거 (이번 라운드 신규분)

| 대상 | 층 | 근거 |
| --- | --- | --- |
| guide 헤더 로케이터 레벨 무관화 + h1 개수=1 단언 | e2e(기존 유지) | 실제 렌더된 DOM 의 heading 구조·개수는 브라우저에서만 관찰된다. 기존 "가운데 정렬" 테스트와 같은 계층에 두는 것이 tie-break("커버는 됐는데 층 선택이 갈리면 더 낮은 층")보다 우선한다 — 같은 화면·같은 로드 시점에 이미 뜬 페이지를 재사용하는 것이 새 계층을 만드는 것보다 싸다 |
| 헤더 제목-좌우 버튼 겹침 실측(신규 36개) | e2e | `boundingBox()`(실제 렌더 좌표)는 브라우저에서만 얻는다. CSS 그리드 트랙 분배·line-clamp 줄바꿈 결과를 jsdom 으로 재현하려면 브라우저 레이아웃 엔진을 흉내 내야 해 신뢰도가 낮다 — 5라운드와 같은 이유로 e2e 가 맞는 층이다 |

무게 배분: 이번 라운드는 단위 0개 신규, e2e 36개 신규 + 기존 27개 수정 — 모두 화면 레이아웃
검증이라 단위로 내릴 로직이 없다(5라운드와 같은 이유).

## 수용 기준 ↔ 테스트 대응표

새 AC 는 없다(요구사항 변경 없음). 57개 ID 는 `.curvez/qa/preemie-calc/ac-matrix.md` "6라운드"
절 "57개 ID 판정 — 6라운드 재확인"에 재확인 수치가 있다(5라운드와 완전히 동일).

## 디자인 스펙 키 대응표 (이번 라운드 재확인·추가분)

| 스펙 키 | 대상 | 테스트 | 비고 |
| --- | --- | --- | --- |
| PageHeader.md "## 레이아웃"(헤더 가운데 정렬 + 좌우 zone 최소 폭 예약으로 겹침 방지) | 화면 9개 전부 | `tests/e2e/nf-header-layout.spec.ts`(기존 27개 갱신 + 신규 36개) | 신규 36개가 DSG-05 가 정확히 지적한 "겹침 자체"를 실측한다. 겹침 실측표는 `.curvez/qa/preemie-calc/ac-matrix.md` "6라운드" 참고 |

## 테스트하지 않는 것과 이유 (이번 라운드 추가분)

| 대상 | 이유 |
| --- | --- |
| `--layout-header-side-reserve` 값(112px) 자체가 옳은지, 더 긴 임의 문자열에서도 안 겹치는지 | GOAL 범위는 "이번 수정 검증"이다. 스펙에 없는 임의 길이 문자열까지 전수 검사하는 것은 범위 확대다. 실제 9개 화면의 실제 제목 문자열(스펙·데이터에 고정된 값)로만 검증했다 |
| line-clamp:2 를 넘는(3줄 이상 필요한) 극단적으로 긴 제목의 동작 | 현재 9개 화면의 실제 제목은 전부 2줄 이내(360/390px 에서 최대 60px, 즉 2줄)로 확인됐다. 3줄이 필요한 제목은 존재하지 않아(정적 문구), 가상의 입력에 대한 테스트는 코드를 그대로 옮겨 적는 것과 같아 버그를 못 잡는다 |

## 실행 결과 (수치)

`.curvez/qa/preemie-calc/ac-matrix.md` "6라운드" 절 "실행 결과 (수치, 6라운드)" 참고. 요약:
워크트리 루트 typecheck·lint·test(203/203)·build 전부 exit 0, quality-gate 5/5 PASS,
`pnpm test:e2e` 2회 연속 **140/140**(5라운드 104개 + 신규 36개, 플래키 아님), skip/only/todo
0건, AC 커버 57/57(미커버 0), after 캡처 20장 재촬영, 포트 3100 시작 전 확인 비어 있음.

## 6라운드에서 직접 고친 것

`.curvez/qa/preemie-calc/ac-matrix.md` "6라운드에서 직접 고친 것" 절에 파일 목록을 그대로
남겼다. `src/**` 는 전부 읽기만 했다 — `apps/preemie-calc/tests/e2e/nf-header-layout.spec.ts`
하나만 바꿨다.

---

# preemie-calc QA 전략 — 7라운드: 시각 결함 5건 수정 대응(curvez-nextjs.20260930-012225.json)

오케스트레이터가 6라운드 after 캡처를 육안으로 검토해 자동 검사가 놓친 시각 결함 5건(헤더
제목 음절 중간 줄바꿈, 나이 카드 숫자·단위·날짜 조각 끊김, "+ 아이 추가" 버튼 라벨 줄바꿈,
1280px 에서 그 버튼이 콘텐츠 영역 밖으로 벗어남)을 찾았고, curvez-nextjs 가 고쳤다. 이 라운드는
(1) 게이트 5개·E2E 를 최종 재판정하고, (2) 그 결함들이 다시 생겨도 자동으로 잡히도록 회귀
검사를 추가하고, (3) 변경 후 캡처를 다시 찍는 라운드다. 요구사항(57개 ID) 자체는 바뀌지 않았다.

## 층 배분과 근거 (이번 라운드 신규분)

| 대상 | 층 | 근거 |
| --- | --- | --- |
| 버튼·링크 라벨 한 줄, body word-break, 나이 카드 값 조각 한 줄, 버튼-카드 정렬(신규 45개) | e2e | 전부 실제 렌더된 텍스트 줄바꿈·computed style·boundingBox 좌표를 대상으로 한다. `Range.getClientRects()` 로 텍스트가 실제로 몇 줄에 걸쳐 그려지는지는 브라우저 레이아웃 엔진의 결과물이라 jsdom 으로 신뢰성 있게 재현할 수 없다(5·6라운드와 같은 이유) |

무게 배분: 이번 라운드는 단위 0개 신규, e2e 45개 신규 — 결함 5건 전부가 "실제 화면에 무엇이
어떻게 그려지는가"에 관한 것이라 단위로 내릴 로직이 없다(5·6라운드와 같은 이유, tie-break
"커버는 됐는데 층 선택이 갈리면 더 낮은 층"은 분기 로직이 있을 때 적용되는데 이번 결함 5건은
CSS·문자열 조합 결과 확인이 전부다).

## 수용 기준 ↔ 테스트 대응표

새 AC 는 없다(요구사항 변경 없음). 57개 ID 는 `.curvez/qa/preemie-calc/ac-matrix.md` "7라운드"
절 "57개 ID 판정 — 7라운드 재확인"에 재확인 수치가 있다(6라운드와 완전히 동일).

## 디자인 스펙 키 대응표

새로 다루는 디자인 스펙 키는 없다. 이번 라운드가 잡는 결함 5건은 디자인 스펙의 명시적 규칙
위반이 아니라(PageHeader.md·AgeSummaryCard.md·Button.md 는 "줄바꿈되지 않는다"를 `state:*`나
`a11y:*` 리터럴 키로 못박지 않는다) 오케스트레이터가 실제 렌더 캡처에서 발견한 구현 결함이다.
이번 라운드 테스트는 GOAL CONTEXT 가 지정한 회귀 항목 5개에 직접 대응한다 — 상세 대응표는
`.curvez/qa/preemie-calc/ac-matrix.md` "7라운드" 절 "신규 회귀 검사 4종 실측" 참고.

## 테스트하지 않는 것과 이유 (이번 라운드 추가분)

| 대상 | 이유 |
| --- | --- |
| `a[role]` 셀렉터가 현재 코드에서 아무것도 걸리지 않는 것(role 속성이 붙은 `<a>`가 없다) | GOAL 문구를 그대로 따라 셀렉터에 남겨 뒀다 — 지금은 죽은 조건이지만 향후 `<a role="...">`가 생기면 자동으로 걸린다. 현재 앵커(`next/link` 의 `<a href>`, 예: "이 주수로 계산기 열기", InfoRow nav-card)는 이 셀렉터로 못 잡지만, 그 라벨들은 전부 짧은 한글 단일 문구이고 `Button.tsx`의 `whiteSpace:nowrap` 같은 안전장치가 없어도 이번 GOAL 이 지적한 결함 목록(캡처로 확인된 것)에 없어 범위 밖이라 임의로 넓히지 않았다 |
| 임의의 긴 텍스트·다국어 문자열에서의 줄바꿈 동작 | 현재 9개 화면의 실제 문구(정적 문자열, 고정 시계·고정 프로필의 계산 결과)로만 검증했다. 가상의 입력에 대한 테스트는 코드를 그대로 옮겨 적는 것과 같아 버그를 못 잡는다(5·6라운드와 같은 이유) |
| `nowrapChunks` 헬퍼의 내부 구현(공백 split 로직) 자체를 단위 테스트로 검증하는 것 | 판단 기준의 "private 함수·내부 구현 세부"에 해당한다. 이 구현이 옳은지는 e2e 가 실제 렌더 결과(줄바꿈 여부)로 이미 검증한다 — 구현을 리팩터링해도(예: 공백 대신 `Intl.Segmenter` 로 바꿔도) e2e 는 여전히 유효하다 |

## 실행 결과 (수치)

`.curvez/qa/preemie-calc/ac-matrix.md` "7라운드" 절 "실행 결과 (수치, 7라운드)" 참고. 요약:
워크트리 루트 typecheck·lint(0 problems)·test(203/203)·build(491/491) 전부 exit 0,
quality-gate 5/5 PASS, `pnpm test:e2e` 2회 연속 **185/185**(6라운드 140개 + 신규 45개, 플래키
아님), skip/only/todo 0건, `any` 0건, AC 커버 57/57(미커버 0), after 캡처 20장 재촬영·육안
재확인(결함 5건 전부 사라짐), 포트 3100 시작 전 확인 비어 있음.

## 7라운드에서 직접 고친 것

`.curvez/qa/preemie-calc/ac-matrix.md` "7라운드에서 직접 고친 것" 절에 파일 목록을 그대로
남겼다. `src/**` 는 전부 읽기만 했다 — 신규 파일
`apps/preemie-calc/tests/e2e/nf-visual-defects-regression.spec.ts` 하나만 추가했다.

# preemie-calc QA 전략 — 8라운드: 본문 폭 720px 통일 대응(curvez-nextjs.20260930-105749.json)

curvez-nextjs 가 9개 화면 본문 최대 폭을 `--layout-content-max`(720px) 하나로 통일하고
대시보드를 1열로 바꿨다(요구사항 자체는 바뀌지 않았다, PLC-03·PLC-02 와 무관한 순수 레이아웃
변경). 이 라운드는 (1) 그 결과 깨진 2건(전제가 사라진 대시보드 2열 테스트)을 새 사실로
바꾸고, (2) 9개 화면 × 3폭의 본문·헤더 콘텐츠 폭이 실제로 같다는 것을 e2e 로 새로 실측하고,
(3) 360·1280px 캡처 20장을 `width-720/` 에 남기는 라운드다.

## 층 배분과 근거 (이번 라운드 신규분)

| 대상 | 층 | 근거 |
| --- | --- | --- |
| 본문·헤더 콘텐츠 폭 일치(신규 3개), 대시보드 1열 정렬(신규 3개, 대체 2개) | e2e | 둘 다 실제 렌더된 요소의 `boundingBox()` 좌표가 대상이다 — CSS `max-width`·`margin:auto`·미디어쿼리가 실제로 어떤 픽셀 값을 만드는지는 브라우저 레이아웃 엔진의 결과물이라 jsdom 단위 테스트로 재현할 수 없다(5·6·7라운드와 같은 이유) |

무게 배분: 이번 라운드는 단위 0개 신규, e2e 6개 신규(교체 2개 포함 순증 4개) — 순수 레이아웃
좌표 확인이라 단위로 내릴 로직이 없다.

## 수용 기준 ↔ 테스트 대응표

새 AC 는 없다(요구사항 변경 없음). 57개 ID 는 `.curvez/qa/preemie-calc/ac-matrix.md` "8라운드"
절 "57개 ID 판정 — 8라운드 재확인"에 재확인 수치가 있다(7라운드와 완전히 동일).

## 디자인 스펙 키 대응표

새로 다루는 디자인 스펙 키는 없다. 이번 라운드가 실측하는 "본문·헤더 콘텐츠 폭 일치"는
`tokens.md` `## 레이아웃` `--layout-content-max`(720px, 7차 라운드 결정)를 검증하는 것으로,
`state:*`·`a11y:*` 리터럴 키가 아니라 GOAL 이 직접 지정한 수치 검사다. 상세는
`.curvez/qa/preemie-calc/ac-matrix.md` "8라운드" 절 "9개 화면 × 3폭 본문·헤더 콘텐츠 폭
실측표" 참고.

## 테스트하지 않는 것과 이유 (이번 라운드 추가분)

| 대상 | 이유 |
| --- | --- |
| 390px 에서의 콘텐츠 폭 실측 | GOAL 이 명시한 실측 폭은 360/768/1280 세 개다(캡처도 360/1280 두 개). `nf-header-layout.spec.ts` 의 겹침 실측(OVERLAP_WIDTHS)은 이미 390px 을 포함하므로 헤더 자체의 390px 렌더는 다른 테스트가 계속 커버한다 |
| `.pc-content-max`/`.pc-content-pad-x` 클래스가 실제로 어느 요소에 적용됐는지(클래스 목록 비교) | GOAL 지시 "클래스 이름에 기대지 말고 실제 boundingBox 로 재는 편이 좋다"를 그대로 따른다 — 클래스는 리팩터링마다 바뀔 수 있는 구현 세부이고, 실제로 렌더된 좌표가 같은지가 사용자에게 보이는 사실이다 |

## 실행 결과 (수치)

`.curvez/qa/preemie-calc/ac-matrix.md` "8라운드" 절 "실행 결과 (수치, 8라운드)" 참고. 요약:
워크트리 루트 typecheck·lint(0 problems)·test(203/203)·build(491/491) 전부 exit 0,
`pnpm test:e2e` 2회 연속 **189/189**(7라운드 185개 − 2개(전제 소멸) + 3개(대시보드 1열
신규) + 3개(콘텐츠 폭 신규)), 플래키 아님, skip/only/todo 0건, `any` 0건, AC 커버 57/57
(미커버 0), width-720 캡처 20장, 포트 3100 유지(PID 43850, kill 없음)·3200 매 실행 전후
빈 상태.

## 8라운드에서 직접 고친 것

`.curvez/qa/preemie-calc/ac-matrix.md` "8라운드에서 직접 고친 것" 절에 파일 목록을 그대로
남겼다. `src/**` 는 전부 읽기만 했다 — 신규 파일 하나(`nf-content-width.spec.ts`)와 기존
파일 하나(`nf-header-layout.spec.ts`) 수정.

## 9라운드: SPEC v2 신규 기능(F7 AC5~7·F8·F10·F14·F15) + 본문 폭 4개 화면 확장 대응

`curvez-nextjs.20260930-123524.json` 이 F7 결과 문구 복사(AC5~7), F8 성장 백분위+기록,
F10 예방접종 일정, F14 목표키, F15 분유량을 구현했다. 이 라운드는 (1) 새 AC 17개 + 새 EX
5개(총 22개 ID)에 테스트를 더하고, (2) PRD §9 결정(경감 구간 경계 확정)으로 낡아진 기존
테스트 2건(단위)·1건(E2E)을 고치고, (3) 글 영역 720px(박스 784px) 통일에 새 화면 4개를
더하고, (4) 라운드 마지막 게이트를 한 번씩 돌리는 라운드다.

### 층 배분과 근거 (이번 라운드 신규분)

| 대상 | 층 | 근거 |
| --- | --- | --- |
| growthPercentiles(LMS→Z→백분위), planVaccinations/vaccinationStatus, computeTargetHeight/isValidParentHeights, formulaAmount/isValidWeightGrams, buildShareText | 단위(vitest) | 전부 `entities/*/model`·`features/*/lib` 의 순수 함수다. 입력 조합(교정/생후, before-due/after-due, 경계값)이 많아 층이 낮을수록 조합당 비용이 싸다(판단 기준표) |
| PC-F10-AC3(완료 체크 영속), PC-F8-AC5(기록 저장) | e2e | `entities/*/api` 가 `window.localStorage` 를 직접 읽고 쓴다 — vitest(node 환경)에는 `window` 가 없어(`typeof window === "undefined"`) `loadGrowthRecords`·`loadCompletedDoseIds` 가 항상 "empty"/빈 배열만 돌려준다. 저장이 실제로 되는지는 브라우저에서만 확인할 수 있다 |
| 화면에 실제로 보이는 문구(교정 ○개월 기준, 소아청소년과 상담을 권합니다, 목표키 참고 …, 기준 확인 중 등), state:*, focus-order, a11y:label | e2e | 수용 기준의 주어가 "화면에 보인다"이고, 폼 입력→계산→렌더 흐름 전체(entities+features+widgets+view)가 맞물려야 나오는 결과라 단위로 쪼개면 widget 조립 자체를 검증하지 못한다 |
| PC-F8-AC4(정부 파일과 백분위 대조) | 단위 | Z→백분위 계산이 순수 함수 결과라 fixture(CSV) 대조도 단위 층에서 가능하다. 화면까지 갈 필요가 없다 |

무게 배분: 이번 라운드 신규 단위 33개(5개 파일: growth·vaccination·target-height·formula·
share-text) vs e2e 27개(신규 4개 파일 growth·vaccinations·target-height·formula + 기존
5개 파일 수정: f7-share·nf-mobile·nf-content-width·nf-a11y·nf-med) — 단위가 통합(0)·e2e
보다 많다. tie-break 표의 "무게 배분: 단위 > 통합 > e2e" 를 지킨다.

### 수용 기준 ↔ 테스트 대응표

`.curvez/qa/preemie-calc/ac-matrix.md` "F7"·"F8"·"F10"·"F14"·"F15" 절(9라운드 신규 표)에
22개 ID 전부의 판정과 테스트 위치가 있다. 요약:

- 자동 통과 19개(조건부 1개 — PC-F8-AC4)
- 자동 실패 2개 — PC-F14-AC1·AC2(`entities/target-height` 계산식 버그, src 결함)
- 보류 1개 — PC-F8-AC3(차트 라이브러리 미정)

### 디자인 스펙(상태·접근성) 키 ↔ 테스트 대응표

| 화면/컴포넌트 | 키 | 테스트 |
| --- | --- | --- |
| growth | state:default | `tests/e2e/growth.spec.ts`:"PC-F8-AC1"·"PC-F8-AC2" (기록 행이 채워진 상태) |
| growth | state:empty | `tests/e2e/growth.spec.ts`:"state:empty — 기록이 없으면 '아직 기록이 없습니다'가 보이고 entry-form 은 그대로 보인다" |
| growth | state:error | **커버 안 함** — nextjs 결정으로 구현 자체가 안 됐다(`.curvez/qa/design-uncovered.txt`) |
| growth | focus-order | `tests/e2e/growth.spec.ts`:"focus-order — header.back → 측정일 → 키 → 몸무게 → 머리둘레 → 측정자세 → 저장 버튼" |
| GrowthEntryForm | a11y:label | `tests/e2e/growth.spec.ts`:"PC-NF-A11Y-3 — GrowthEntryForm 다섯 필드..." + `tests/e2e/nf-a11y.spec.ts` 동일 항목 |
| GrowthEntryForm | a11y:target | **커버 안 함**(`.curvez/qa/design-uncovered.txt`) |
| GrowthRecordTable | a11y:label | `tests/e2e/growth.spec.ts`:"PC-F8-AC1"·"AC2"·"AC5" (행 aria-label 문구로 간접 확인) |
| vaccinations | state:default | `tests/e2e/vaccinations.spec.ts`:"PC-F10-AC1"·"AC2" |
| vaccinations | state:empty·state:error | **테스트하지 않는다** — 스펙 자체가 "이 화면에는 빈 상태가 없다"(데이터 고정)이고, error 는 growth 와 같은 이유로 구현 안 됨 |
| vaccinations | focus-order | **커버 안 함**(`.curvez/qa/design-uncovered.txt`) |
| VaccinationRoundItem | a11y:label | `tests/e2e/vaccinations.spec.ts`:"a11y:label — 체크박스 접근 이름이 '{백신명} {차수} 완료로 표시' 형식이다" |
| VaccinationRoundItem | a11y:target | **커버 안 함**(`.curvez/qa/design-uncovered.txt`) |
| target-height | state:default·empty·error | `tests/e2e/target-height.spec.ts`:"state:empty"·"PC-F14-AC1/AC2/AC3"·"PC-F14-EX1" |
| target-height | focus-order | `tests/e2e/target-height.spec.ts`:"focus-order — header.back → 아빠키 → 엄마키 → 계산하기" |
| formula | state:default·coefficient-unconfirmed·empty·error | `tests/e2e/formula.spec.ts`:"PC-F15-AC1·AC2"·"state:coefficient-unconfirmed(EX3)"·"state:empty(EX2)"·"PC-F15-EX1" |
| formula | focus-order | `tests/e2e/formula.spec.ts`:"focus-order — header.back → 체중 → 계산하기" |
| 13개 화면(9개 기존 + 4개 신규) | tokens.md 대비 검증(글 영역 720px·박스 784/752px) | `tests/e2e/nf-content-width.spec.ts` — 360/768/1280px × 13개 화면 실측표(아래 참고) |

### 낡은 기대값을 결정에 맞게 고친 테스트

`.curvez/qa/preemie-calc/test-changes-v2.md` 참고. 요약: `tests/unit/copay-relief.test.ts`
의 "[미확정] 경계" describe 블록 1개(2 테스트) → "확정" 블록으로, `tests/e2e/nf-mobile.spec.ts`
의 "copay-relief state:boundary-unconfirmed" 1개 → "copay-relief 경계값(5년 4개월 확정)"
으로. 둘 다 PRD §9 2026-09-30 결정(경감 구간 경계 확정)이 원인이고, 값을 더 엄격하게(미확정
→ 특정 구간 확정) 바꿨을 뿐 판정 기준을 낮추지 않았다.

### 테스트하지 않는 것과 이유 (9라운드 추가분)

| 대상 | 이유 |
| --- | --- |
| PC-F8-AC3(추이 그래프) | designer·nextjs 모두 "이번에 만들지 않는다"로 결정(차트 라이브러리 의존성 없음, standing 3 "라이브러리가 없으면 물어본다"). 오케스트레이터가 사용자에게 확인해야 할 대상이라 이 라운드는 "보류"로만 판정하고 테스트를 지어내지 않는다 |
| growth·vaccinations 의 state:error | curvez-nextjs 가 "정적 import 라 런타임 로드 실패 상태에 도달 불가능"이라고 결정하고 구현하지 않았다. 디자인 스펙과 다른 지점이라 `.curvez/qa/design-uncovered.txt` 에 남기고 curvez-designer·curvez-nextjs 확인이 필요하다고 적었다(가짜로 만들어 통과시키지 않는다) |
| vaccinations 의 state:empty | 스펙 원문이 "이 화면에는 빈 상태가 없다"(vaccination-schedule.json 이 고정 정의) — 테스트할 대상 자체가 없다 |
| vaccinations 의 focus-order 전체 순서(40개 안팎 체크박스) | 시간 예산 안에서 만들지 못했다(`.curvez/qa/design-uncovered.txt`). 다음 라운드에 `focusableTextsInOrder` 헬퍼를 그대로 적용하면 된다 |
| GrowthEntryForm·VaccinationRoundItem 의 a11y:target(정확한 48px 실측) | 공통 터치 대상 검사(`nf-mobile.spec.ts`)가 `button/a[href]/[role=tab]/[role=radio]` 만 잡고 `<input>`·체크박스 `<label>` 은 셀렉터 밖이다. 코드는 `--touch-target-min` 토큰을 쓰고 있어 시각적으로는 48px 로 보이지만 실측 테스트는 없다 |
| GrowthRecordTable 의 a11y:role(표/listitem 반응형 전환) | nextjs 결정으로 실제 구현이 폭과 무관하게 항상 `<table>` 하나다(디자인 스펙의 반응형 카드/표 전환을 만들지 않았다) — 스펙과 다른 지점이라 다시 테스트로 "확인"하면 오히려 스펙에 맞는 것처럼 보일 위험이 있어, 있는 그대로(테스트 없음)로 남긴다 |
| F16~F18·F1-AC7 | 오케스트레이터 GOAL 이 "팀 라운드라 판정하지 않는다"고 명시했다. 해당 테스트 파일(`tests/e2e/f16-*·f17-*·f18-*·f1-ac7-*`)은 팀 소유라 이번 라운드는 읽기만 했고, 그 파일들의 실패는 이 라운드의 판정에 넣지 않는다(아래 "9라운드 실행 결과" 참고) |

### PC-F14-AC1·AC2 자동 실패 — src 결함(직접 고치지 않음)

`src/entities/target-height/model/index.ts:47~48` 의 `minCm`·`maxCm` 계산이
`Math.round((sum - rangeTenths) / 2) / 10`(`rangeTenths = rangeCm * 10 = 65`)를 쓴다.
architecture.md ⑩ 의 예시(아빠175·엄마162·남아 → 175.0cm **(168.5~181.5cm)**)와 SPEC 원문
AC 자체가 요구하는 값을 얻으려면 `Math.round((sum - 2 * rangeTenths) / 2) / 10`(=
`midCm - rangeCm`)이어야 한다 — 지금 코드는 범위를 절반(±3.25cm)만 적용해 실제로는
171.8~178.3cm 이 나온다(직접 계산·재현 확인: 아래 실행 결과 참고). 로직 버그라 QA 의
"사소한 수정 예외"(한 파일·3줄 이하·명백한 오타·오기·테스트 실행 자체가 불가능해야 함)
4조건 중 (2)"동작 변경이 아니라 명백한 오타"에 들지 않는다 — 계산식 자체가 틀린 로직
버그이지 오타가 아니다. 그래서 고치지 않고 `curvez-nextjs` 에 `blocked_on` 으로 돌린다.

### 9라운드 실행 결과 (수치)

- (워크트리 루트) `pnpm typecheck`: exit 0, 오류 0건(7개 워크스페이스 프로젝트) —
  `.curvez/qa/preemie-calc/last-run-typecheck-round9.log`
- (워크트리 루트) `pnpm lint`: exit 0, 전 워크스페이스 `Done`, 0 problems —
  `.curvez/qa/preemie-calc/last-run-lint-round9.log`
- (워크트리 루트) `pnpm test`: apps/preemie-calc **98/102 통과, 4개 실패** —
  `.curvez/qa/preemie-calc/last-run-root-round9.log`. 실패 내역:
  - 2건: `tests/unit/target-height.test.ts` PC-F14-AC1·AC2(위 src 결함, 진짜 결함)
  - 2건: `tests/unit/f13-build-artifacts.test.ts`(가이드 HTML 481개 기대 → 실제 487개,
    사이트맵 URL 481개 기대 → 실제 488개). **원인은 이 라운드가 만든 결함이 아니다** —
    팀(tmux) F16~F18 라운드가 `src/app/guide/questions/**`(6쪽)와 `src/app/guide/page.tsx`
    (`/guide` 인덱스, standing 15 팀 소유 파일)를 새로 만들면서 `guide/` 디렉터리와
    사이트맵의 URL 개수가 481개보다 늘었다(487-481=6=F16 질문 6쪽, 488-481=7=6쪽+`/guide`
    인덱스 1개). standing 15("팀 파일 때문에 test 가 깨지면 고치지 말고 파일과 오류 원문을
    핸드오프에 적는다")에 따라 `EXPECTED_COMBO_COUNT` 를 고치지 않고 그대로 남겼다 —
    F16~F18 라운드가 끝나 개수가 확정되면 그 라운드(또는 다음 QA 라운드)가 갱신해야 한다.
    `pnpm -r` 이 preemie-calc 실패에서 나머지 워크스페이스(scopulus-ui 등) 실행을 중단해
    그쪽 결과는 확인하지 못했다(재실행하지 않았다 — standing 14 "각 한 번만")
- (워크트리 루트) `pnpm build`: exit 0. 4개 앱(preemie-calc·city-presets·handwork·
  scopulus-ui) 전부 `Done`. preemie-calc 는 503개 정적 페이지 생성(481개 조합 + F16 6쪽 +
  `/guide`·`/guide/age-basis` + 기존 라우트) — `.curvez/qa/preemie-calc/last-run-build-round9.log`
- (apps/preemie-calc) `pnpm test:e2e`(전체, 1회): **248개 통과, 13개 실패** —
  `.curvez/qa/preemie-calc/last-run-e2e-round9.log`. 실패 13건의 원인 분해:
  - 2건 — `tests/e2e/target-height.spec.ts` PC-F14-AC1·AC2(위 src 결함과 같은 원인, 화면
    레벨에서도 재현된다)
  - 2건 — `tests/e2e/f1-profile.spec.ts`·`tests/e2e/nf-a11y.spec.ts`(팀 소유 파일
    `src/features/profile-form/ui/ProfileForm.tsx` 에 "주수로 입력"을 언급하는 도움말
    문단이 추가돼 `getByText("주수로 입력")` 이 버튼과 문단 두 곳에 매치되는 strict mode
    충돌. standing 15 에 따라 고치지 않았다 — 상세는 아래 "9라운드에서 발견했지만 고치지
    않은 것" 참고)
  - 9건 — `tests/e2e/f16-question-guides.spec.ts`(7)·`f17-guide-index.spec.ts`(1)·
    `f18-age-basis-public.spec.ts`(1). **이 9건은 팀 소유 테스트 파일이라 이번 라운드가
    판정하지 않는다**(오케스트레이터 GOAL "F16~F18·F1-AC7 은 팀 라운드라 판정하지 않는다") —
    읽기만 했고 원인 분석도 하지 않았다(팀 자신의 작업 중인 기능이다)
  - 남은 248개는 이 라운드가 추가·수정한 스펙(growth·vaccinations·target-height·formula·
    f7-share·nf-mobile·nf-content-width·nf-a11y·nf-med) 포함 전부 통과
  - 이번 라운드는 표준 14(속도)에 따라 전체 E2E 를 **1회만** 돌렸다. 작성 중간에 개별
    스펙(growth·vaccinations·target-height·formula·f7-share)을 여러 번 돌려 통과를
    확인한 이력은 있지만(위 "실행 결과" 로그들), 실패했다가 재시도로 통과한 스펙은 없다
    (모든 실패는 마지막까지 같은 원인으로 재현됐다)
- `skip`/`only`/`todo` 개수: 0 (`grep -rnE '\.(skip|only|todo)\(|\bx(it|describe)\('
  apps/preemie-calc/tests/` 결과 0건, 신규·수정 파일 포함)
- 수용 기준 커버: 신규 22개 ID(F7 AC5~7, F8, F10, F14, F15) 전부 대응 테스트 있음(미커버
  0개). PC-F8-AC3 는 "보류"로 명시했고 테스트를 지어내지 않았다
- 포트: 실행 전후 `lsof -i :3100` 에 PID 43850 이 LISTEN 상태로 그대로 있었다(kill 없음).
  `lsof -i :3200` 은 실행 전 빈 상태 확인, `test:e2e` webServer 가 3200 을 쓰고 종료 시
  스스로 반환했다
- `node scripts/validate-handoff.mjs .curvez/handoff/`: 이번 핸드오프 파일의 검증 결과는
  QA 핸드오프 `verification` 참고

### 글 영역 실측 표 (13화면 × 3폭)

`tests/e2e/nf-content-width.spec.ts` stdout(`last-run-e2e-round9.log`)에서 옮겼다. 13개
화면(9개 기존 + growth·vaccinations·target-height·formula 4개 신규) 전부가 아래 값과
정확히 같다(화면 간 차이 0.00px, tokens.md 8차 라운드 결정과 정확히 일치).

| 폭 | 글 영역(content) | 박스(box) |
| --- | --- | --- |
| 360px | 328.00 | 360.00(뷰포트 그대로) |
| 768px | 720.00 | 752.00(720 + 좌우 --space-4×2) |
| 1280px | 720.00 | 784.00(720 + 좌우 --space-6×2, 사용자 지시 "박스 784px"과 일치) |

### 9라운드에서 발견했지만 고치지 않은 것 (src·팀 파일 결함, 참고용)

| 무엇 | 파일:위치 | 무엇이 문제인가 |
| --- | --- | --- |
| 목표키 범위 계산 버그 | `apps/preemie-calc/src/entities/target-height/model/index.ts:47~48` | `(sum - rangeTenths) / 2` 가 범위를 절반만 적용한다 — architecture.md ⑩ 예시·PC-F14-AC1·AC2 원문 값(168.5~181.5, 155.5~168.5)과 다른 171.8~178.3, 158.8~165.3 이 나온다 |
| 도움말 문단이 "주수로 입력" 버튼 텍스트와 겹침(strict mode 충돌) | `apps/preemie-calc/src/features/profile-form/ui/ProfileForm.tsx`(팀 소유, standing 15) | "임신 중 병원에서 안내받은 날짜예요. 모르면 '주수로 입력'을 눌러 주세요." 문단이 새로 추가되면서 `getByText("주수로 입력")` 이 버튼과 문단 두 곳에 매치된다. 팀 작업 중인 파일이라 고치지 않았다 — F16~F18 라운드가 끝나면 `f1-profile.spec.ts`·`nf-a11y.spec.ts` 를 다시 돌려 확인해야 한다 |
| F13 조합 페이지·사이트맵 개수 481 고정 기대값이 팀의 F16~F18 라우트로 흔들림 | `apps/preemie-calc/tests/unit/f13-build-artifacts.test.ts` | 위 "9라운드 실행 결과" 참고. `EXPECTED_COMBO_COUNT`(481) 는 `/guide/[weeks]/[months]` 조합 페이지만 세도록 정한 값인데, 지금은 `guide/` 디렉터리 전체(HTML 파일 glob)와 사이트맵의 "/guide/" 문자열 카운트가 F16~F18 라우트까지 함께 센다 — 카운트 로직을 `/guide/[0-9]+/[0-9]+/` 패턴으로 좁히면 해결되지만, 이는 테스트 코드 수정이자 팀 라운드가 끝나기 전에 손대면 팀의 파일 개수가 또 바뀔 때마다 다시 깨진다. 그래서 이번 라운드는 고치지 않고 그대로 남겼다 |

이 세 가지는 모두 `curvez-nextjs`(첫째)·팀(tmux) F16~F18 라운드(둘째·셋째)에 넘긴다.
QA 가 직접 고치지 않는다(구현 수정 권한 경계).


## 10라운드: 통합 라운드 — 팀 테스트 정리 + 최종 게이트(curvez-nextjs.20260930-135922·141142 대응)

이전 9라운드까지는 F16~F18(팀/tmux 라운드)의 테스트 파일(`f16-question-guides.spec.ts`·
`f17-guide-index.spec.ts`·`f18-age-basis-public.spec.ts`·`f1-ac7-due-date-label.spec.ts`)이
"팀 소유"라 이 문서가 판정하지 않았다. standing.md 15번이 이 제한을 풀었고, 오케스트레이터
지시서가 이 4개 파일 + `f1-profile.spec.ts`·`nf-a11y.spec.ts`·
`tests/unit/f13-build-artifacts.test.ts` 를 이번 라운드가 정리하라고 명시했다.

### 층 배분과 근거 (이번 라운드 신규분)

| 대상 | 층 | 근거 |
| --- | --- | --- |
| PC-F16-AC1~AC7·EX1, PC-F17-AC1~AC3, PC-F18-AC1~AC3 | e2e | 전부 "화면에 ~가 보인다"·"링크를 누르면 ~로 간다" 형태로 수용 기준의 주어가 사용자다(판단 기준표 3번째 행). 정적 페이지(F16~F18)라 훅이 없어 단위로 쪼갤 순수 함수 자체가 거의 없다(문구 조립은 있지만 데이터 파일 읽기 자체가 얇은 매핑이라 단위 이득이 작다) |
| PC-F1-AC7 | e2e | 라벨·도움말·`aria-describedby` 연결·칸 아래 위치까지 DOM 관계를 확인해야 해 단위로 쪼갤 수 없다(이미 만들어진 `f1-ac7-due-date-label.spec.ts` 그대로 유지, 추가 판단 불필요할 만큼 충분했다) |

무게 배분: 이번 라운드는 신규 e2e 테스트만 2개(F16 EX1 왕복 2건) 추가했고 단위는 건드리지
않았다(`f13-build-artifacts.test.ts` 수정은 새 단위가 아니라 기존 단위 3개 파일의 판정
로직 교정 + 신규 단언 1개). tie-break 표의 "무게 배분: 단위 > 통합 > e2e" 는 누적 기준으로
여전히 지켜진다(9라운드까지 단위 33개 vs e2e 신규 27개, 이번 라운드는 e2e +2 뿐).

### 수용 기준 ↔ 테스트 대응표

`.curvez/qa/preemie-calc/ac-matrix.md` "F1"(AC7 행)·"F16"·"F17"·"F18" 절에 15개 ID 전부의
판정과 테스트 위치가 있다. 요약: 자동 통과 14개, "사용자 확인 대기"(계산 로직에는 영향 없는
문구 해석 문제) 1개 — PC-F16-AC4.

### 디자인 스펙(상태·접근성) 키 ↔ 테스트 대응표

`.curvez/design/preemie-calc/screens/` 에는 F16(질문형 가이드)·F17(가이드 목록)·F18 공개판
(`/guide/age-basis`)을 위한 화면 스펙이 없다(`guide.md` 는 F13 조합 페이지, `age-basis.md`
는 F3 대시보드용이라 서로 다른 화면이다 — 파일명이 겹치지 않는지 직접 확인했다). 따라서
이 세 기능의 `state:*`·`focus-order`·`a11y:*` 키 판정은 **미검증**으로 남긴다(지어내지
않는다). 대신 requirements.md 의 AC 문구(예: PC-F16-AC2 "입력 화면으로 넘어가지 않고 본문이
보인다")로 사실상 state:default 에 해당하는 동작은 AC 판정 안에서 함께 확인했다.

### 테스트하지 않는 것과 이유 (10라운드 추가분)

| 대상 | 이유 |
| --- | --- |
| F16~F18 의 `state:*`·`a11y:*`·`focus-order` 디자인 스펙 키 | `.curvez/design/preemie-calc/` 에 이 세 화면을 위한 스펙 파일이 없다(위 항목 참고). 판단 기준 "디자인 스펙이 없으면 지어내지 않는다"를 따랐다 |
| PC-F16-AC4 문구·계산기 경계 정각 불일치의 근본 원인(어느 쪽을 고칠지) | curvez-reviewer TEAM-01, 오케스트레이터 판정 대기. GOAL 이 "사용자 답을 기다린다"고 명시했다 |

### 10라운드 실행 결과 (수치)

`.curvez/qa/preemie-calc/ac-matrix.md` "10라운드" 절에 최종 게이트 5개(typecheck·lint·
test·build·전체 e2e) 각 1회 결과를 전부 옮겼다(중복 작성하지 않는다). 요약만 남긴다:
typecheck 0 errors, lint 0 problems, root test 15+38 files 전부 통과(preemie-calc
103/103, scopulus-ui 141/141), build exit 0(503개 정적 페이지), 전체 e2e **263/263 통과,
0 실패**.

### 9라운드에서 발견했지만 고치지 않았던 것 — 10라운드 해소 현황

9라운드 절 마지막 표에 남긴 세 가지 중:

- 목표키 범위 계산 버그(`entities/target-height`) — `curvez-nextjs.20260930-135922`(ACC-01)가
  해소했다. `tests/unit/target-height.test.ts` 6/6, e2e AC1·AC2 모두 통과로 확인
- "주수로 입력" strict mode 충돌(`ProfileForm.tsx` 도움말 문단) — src 는 그대로 두고
  `f1-profile.spec.ts`·`nf-a11y.spec.ts` 의 선택자를 `getByRole("button", ...)` 로 고쳐
  이 라운드가 해소했다(test-changes-combined.md §4)
- F13 481 고정 기대값이 F16~F18 라우트로 흔들림 — 이 라운드가
  `tests/unit/f13-build-artifacts.test.ts` 를 고쳐 해소했다(test-changes-combined.md §6)

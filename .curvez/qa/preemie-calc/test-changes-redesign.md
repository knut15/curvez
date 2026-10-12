forbidden-words: allow

# preemie-calc E2E 변경 목록 — 5차 디자인 재구성 대응

curvez-nextjs 핸드오프 `curvez-nextjs.20260930-003549.json` decisions 가 지목한 깨진 6건을
고치고, 이번 라운드 GOAL이 새로 요구한 헤더 가운데 정렬·대시보드 2열 검증을 추가했다.
아래 각 항목은 "선택자와 조작 순서만 바꾼다. 판정하는 사실은 약해지면 안 된다" 원칙을
지켰는지 확인할 수 있도록 이전 → 이후와 근거를 남긴다.

## A. HeaderMenu 도입으로 깨진 3건 (선택자·조작 순서만 변경)

공통 원인: dashboard 헤더의 "프로필 편집"·"정보 전체 삭제"가 더 이상 헤더에 바로 보이지
않고 "더보기"(`role=button`, accessible name "더보기") 뒤 `role=menu` 안의
`role=menuitem`으로 들어갔다. 새 헬퍼 `openHeaderMenu(page)`
(`apps/preemie-calc/tests/e2e/support/helpers.ts`)를 추가해 세 파일이 공유한다.

| # | 파일:테스트 이름 | 이전 선택자·조작 | 이후 | 판정하는 사실이 같은 이유 |
| --- | --- | --- | --- | --- |
| 1 | `tests/e2e/f1-profile.spec.ts`:"PC-F1-AC6 · PC-NF-PRIV-3 — 정보 전체 삭제 › 확인하면 저장된 프로필이 모두 사라지고 첫 화면으로 돌아간다" | `page.getByRole("button",{name:"정보 전체 삭제"}).click()` | `openHeaderMenu(page)` → `page.getByRole("menuitem",{name:"정보 전체 삭제"}).click()` | AC 원문("정보를 전체 삭제할 수 있다")은 그 동작이 가능한지를 묻지, 몇 번 눌러야 열리는지를 묻지 않는다. menuitem 라벨은 SPEC 원문 "정보 전체 삭제" 그대로이고, 클릭 뒤 확인 다이얼로그·localStorage 삭제 assertion 은 한 글자도 바꾸지 않았다 |
| 2 | `tests/e2e/nf-a11y.spec.ts`:"PC-NF-A11Y-3 — 입력칸마다 접근 가능한 이름(레이블)이 있다" | `page.getByRole("button",{name:"프로필 편집"}).click()` | `openHeaderMenu(page)` → `page.getByRole("menuitem",{name:"프로필 편집"}).click()` | 이 테스트가 검증하는 사실은 "다이얼로그 안 입력칸에 접근 가능한 이름이 있는가"다. 다이얼로그를 여는 경로가 한 단계 늘었을 뿐 다이얼로그가 열린 뒤의 `getByLabel(/이름/)`·`getByLabel(/출생 체중/)` assertion 은 그대로다 |
| 3 | `tests/e2e/nf-privacy.spec.ts`:"PC-NF-PRIV-1 — 프로필 입력·저장·대시보드 조회·프로필 편집 동안 나가는 요청에 이름·출생일·예정일 값이 없다" | `page.getByRole("button",{name:"프로필 편집"}).click()` | `openHeaderMenu(page)` → `page.getByRole("menuitem",{name:"프로필 편집"}).click()` | 이 테스트가 검증하는 사실은 "그 상호작용 동안 나가는 네트워크 요청에 민감정보가 없는가"다. `page.on('request')` 감시는 메뉴를 여는 클릭 한 번이 추가돼도 똑같이 전 구간을 커버한다. 오히려 감시 구간이 한 상호작용(메뉴 열기) 만큼 늘어나 더 엄격해졌다 |

## B. 기호 문자 → lucide 아이콘으로 깨진 3건 (같은 사실을 새 표시로 확인)

공통 원인: `StatusBadge`(●✓·)·`UnconfirmedNotice`(△)·`SegmentedControl`(✓)가 텍스트 기호
대신 `aria-hidden="true"` lucide SVG 아이콘을 그린다. 기호 문자 자체를 찾던
`getByText(exact)`는 매치 대상이 사라져 깨졌다. PC-NF-A11Y-1 이 판정하는 사실은
"색만으로 의미를 전달하지 않는다"이고, 그 사실은 지금도 성립한다(텍스트 라벨 + 아이콘,
두 개의 비-색 수단) — 그래서 검증도 "라벨 텍스트가 보인다" + "svg 아이콘이 보인다"로 옮겼다.

| # | 파일:테스트 이름 | 이전 선택자 | 이후 | 판정하는 사실이 같은 이유 |
| --- | --- | --- | --- | --- |
| 4 | `tests/e2e/nf-a11y.spec.ts`:"PC-NF-A11Y-1 — 검진 차수 상태(지남/오늘/예정)는 텍스트 라벨과 아이콘을 함께 쓴다"(이전 제목: "...텍스트 라벨과 기호를 함께 쓴다") | `current.getByText("●",{exact:true})` / `past.getByText("✓",...)` / `upcoming.getByText("·",...)` | `current.getByText("오늘",{exact:true}).locator("svg")` / `past.getByText("지남",...).locator("svg")` / `upcoming.getByText("예정",...).locator("svg")` — `StatusBadge`가 라벨과 아이콘을 같은 `<span>`에 그리므로(아이콘엔 텍스트 노드가 없다) 라벨 텍스트로 그 span 을 정확히 좁힌 뒤 svg 존재를 확인한다. `CheckupRoundItem`에 `IconBadge`(Stethoscope)가 별도로 있어 listitem 전체가 아니라 라벨 span 으로 좁혀야 StatusBadge 의 아이콘만 정확히 집는다 | "텍스트 라벨(오늘/지남/예정)이 보인다"는 그대로 유지했고(`toContainText`), 추가로 "그 라벨과 같은 요소 안에 색이 아닌 아이콘이 있다"를 새로 확인한다 — 이전에 기호 문자로 확인하던 것과 같은 "텍스트+비색 수단 2개" 구조를 그대로 지킨다 |
| 5 | `tests/e2e/nf-a11y.spec.ts`:"PC-NF-A11Y-1 — 미확정 표시는 색이 아니라 아이콘 + '미확정' 라벨 + 텍스트로 구분된다"(이전 제목: "...'△' 기호 + '미확정' 라벨...") | `notice.getByText("△",{exact:true})` | `notice.locator("svg")` | `UnconfirmedNotice` 는 `AlertTriangle` svg 를 라벨 텍스트("미확정")와 별도 요소로 그린다. "미확정" 텍스트(`toContainText`)는 그대로 유지하고 아이콘 존재만 새로 확인해 같은 "텍스트+비색 아이콘" 구조를 지킨다 |
| 6 | `tests/e2e/nf-a11y.spec.ts`:"PC-NF-A11Y-1 — 성별 선택 항목은 선택되면 색뿐 아니라 아이콘으로도 구분된다"(이전 제목: "...'✓' 기호로도 구분된다") | `maleRadio.toContainText("✓")` | 클릭 전 `maleRadio.locator("svg")`가 0개임을 먼저 확인 → 클릭 후 `aria-checked="true"`(기존 그대로 유지) → 클릭 후 `maleRadio.locator("svg")`가 보임을 확인 | `SegmentedControl`은 선택된 옵션에만 `Check` svg 를 그린다. "선택 전에는 아이콘이 없고 선택 후에만 생긴다"는 전/후 비교를 추가해, 이전 테스트가 확인하던 "선택 여부가 색이 아닌 수단으로도 구분된다"는 사실을 더 엄격하게(전/후 대조까지) 확인한다 |

## C. 새로 추가한 검증 — `tests/e2e/nf-header-layout.spec.ts`(신규 파일)

AC 번호가 아니라 이번 라운드 GOAL "새로 확인할 것" (1)(2)에 대응한다. AC-ID 는 없으므로
`[디자인 재구성]` 접두어로 표시했다(기존 `[curvez-reviewer/...]` 회귀 테스트와 같은 방식).

- **헤더 제목 가운데 정렬(27개 테스트)**: 디자인 스펙 9개 화면(`input`·`input-weeks`·`dashboard`·
  `age-basis`·`checkups`·`copay-relief`·`correction-period`·`share`·`guide`, `PageHeader.md`
  "쓰이는 화면" 목록과 정확히 대응) × 360/768/1280px. `page.getByRole("banner").getByRole
  ("heading",{level:1})`의 boundingBox 중심 x 와 뷰포트 중심 x 의 차이를 재 2px 이하를
  기준으로 삼았다(스펙 `--layout-header-side-reserve` 규칙 자체가 정중앙을 요구한다).
  `guide` 화면은 본문에도 별도 `<h1>`(SEO 콘텐츠 제목)이 있어 `getByRole("heading",
  {level:1})`을 페이지 전체가 아니라 `banner` 안으로 좁혀야 strict mode violation 이 안 난다
  (아래 "발견했지만 고치지 않은 것" 참고).
- **대시보드 2열(2개 테스트)**: 1280px 에서 `.pc-dashboard-main`과 `.pc-dashboard-sidebar`의
  boundingBox x 가 서로 다르고(2열), 768px 에서는 x 가 같다(1열)는 것을 확인한다.

## D. 손대지 않고 재확인만 한 것 — PC-NF-A11Y-2(대비)

`tests/e2e/nf-a11y.spec.ts`의 `collectContrastViolations`는 하드코딩된 색값이 아니라 각
요소의 실제 `getComputedStyle(el).color`/`backgroundColor`를 조상 트리를 올라가며 읽어 WCAG
공식을 그 자리에서 계산한다. 5차 라운드가 색 토큰을 전부 바꿨어도 이 테스트는 코드 수정 없이
새 색을 그대로 측정한다 — 8개 화면 모두 위반 0건(아래 "실행 결과" 참고). 새 색 대비 실측값은
`.curvez/design/preemie-calc/tokens.md` "## 대비 검증"에 20쌍 전부 4.5:1 이상으로 이미 기록돼
있고, 이번 라운드는 그 값이 실제 렌더 DOM 에도 배선됐음을 실행으로 재확인했을 뿐이다.

## 발견했지만 고치지 않은 것(구현 코드 결함, src 는 읽기만 함)

- **guide 페이지에 `<h1>`이 2개**: `PageHeader`(제목="이른둥이 육아 계산기")와
  `GuideView`의 콘텐츠 제목(`content.heading`, 예: "32주 출생, 생후 3개월")이 각각 `<h1>`이다
  (`apps/preemie-calc/src/views/guide/ui/GuideView.tsx:18`, `apps/preemie-calc/src/shared/ui/
  PageHeader.tsx:65`). 한 페이지에 `<h1>`이 둘이면 스크린리더 사용자가 페이지 제목을 모호하게
  듣는다(WCAG 헤딩 구조 모범사례 위반 가능성). 이번 GOAL 범위(FORBIDDEN: src 수정)라 고치지
  않았고, 테스트는 `getByRole("banner").getByRole("heading",{level:1})`로 좁혀 우회했다.
  `curvez-nextjs`가 볼 만한 결함이라 여기 기록해 둔다(재현: `/guide/32/3` 방문 →
  `document.querySelectorAll('h1')`가 2개). **[6라운드에서 고쳐짐]** — 아래 참고.

---

## E. 6라운드 — DSG-05 수정·guide h1 중복 수정에 대응한 갱신

`curvez-nextjs.20260930-010104.json` 이 위 D 항목(guide h1 중복)과 curvez-reviewer 의 DSG-05
(360px 헤더 제목-뒤로가기 20.5px 겹침, major)를 같은 커밋에서 고쳤다. `PageHeader`의 h1 을
`justifySelf:stretch + minWidth:0 + line-clamp:2` 로 바꿔 가운데 트랙 폭 안에 가두고(넘치면
말줄임 대신 최대 2줄 줄바꿈), guide 는 `headingLevel={2}` 로 헤더 제목을 h2 로 내려 본문의
SEO 조합 제목만 h1 으로 남겼다. 이 수정으로 `nf-header-layout.spec.ts`의
`getByRole('banner').getByRole('heading',{level:1})`를 쓰던 guide@360/768/1280 3건이
"banner 안에 level:1 heading 없음"으로 깨졌다(30초 타임아웃).

| # | 파일:테스트 이름(패턴) | 이전 선택자 | 이후 | 판정하는 사실이 같은/더 엄격해진 이유 |
| --- | --- | --- | --- | --- |
| 7 | `tests/e2e/nf-header-layout.spec.ts`:"[디자인 재구성] 헤더 제목 가운데 정렬 — {9개 화면} @ {360/768/1280}px"(27개, guide 3개 포함) | `page.getByRole("banner").getByRole("heading",{level:1})` | `page.getByRole("banner").getByRole("heading")`(레벨 무관) + 신규 단언 `expect(await page.locator("h1").count()).toBe(1)`(27곳 전부 추가) | 헤더 제목이 h1 인지 h2 인지는 이 테스트가 재는 "정중앙 정렬"과 무관한 구현 세부다. PageHeader.md 스펙도 헤더 "제목"이라고만 하지 h1 을 못박지 않는다. 대신 "페이지 전체 h1 이 정확히 1개"라는 시맨틱 헤딩 구조 단언을 27곳 전부에 새로 더해, guide h1 중복이 다시 생기면 이 테스트가 즉시 잡는다 — 완화가 아니라 검증 범위 확대 |

신규 추가(수정이 아니라 새 테스트, AC-ID 없음):

| # | 파일:테스트 이름(패턴) | 무엇을 검증하는가 |
| --- | --- | --- |
| 8 | `tests/e2e/nf-header-layout.spec.ts`:"[디자인 재구성, DSG-05 회귀] 헤더 제목-좌우 버튼 겹침 없음 — {9개 화면} @ {360/390/768/1280}px"(36개) | 5라운드의 가운데 정렬 테스트는 제목 박스의 **중심 좌표**만 쟀다 — 중심이 정중앙이어도 박스 폭이 넓으면 좌우 zone(뒤로가기 버튼 등)을 침범할 수 있고, 실제로 DSG-05 가 그 경우였다(중심은 정중앙, 박스가 20.5px 침범). 이 신규 테스트는 제목 boundingBox 와 banner 안 `button, a[href]`(장식 아이콘은 제외) boundingBox 의 **가로 겹침 자체**를 재 0px(허용 0.5px)인지 직접 확인한다. 같은 테스트 안에서 `scrollHeight ≤ clientHeight+1`(line-clamp:2 가 텍스트를 자르지 않는지)도 함께 확인한다. DSG-05 재현 조건(correction-period·copay-relief @360px)을 포함한 20개 버튼-존재 조합 전부 겹침 0px 로 확인했다(상세 수치는 `.curvez/qa/preemie-calc/ac-matrix.md` "6라운드" 참고) |

이번 라운드는 `src/**`를 읽기만 했고, 6라운드에서 직접 고친 파일은
`apps/preemie-calc/tests/e2e/nf-header-layout.spec.ts` 하나뿐이다(기존 27개 테스트 수정 +
신규 36개 테스트 추가, 삭제 없음).

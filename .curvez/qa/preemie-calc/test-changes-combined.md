forbidden-words: allow

# 10라운드 — 팀 테스트 정리(바꾼 테스트 이전→이후·근거)

이 라운드가 고친 테스트 파일 7개의 이전→이후를 파일별로 남긴다. 전부 **선택자·판정
방식을 실제 DOM/요구에 맞춰 고친 것**이고, 요구 판정을 약하게 낮춘 곳은 없다(오히려
F16 AC6·F18 AC3 는 더 엄격해졌다). 팀(tmux) 라운드가 만든 파일에는 이전까지 "팀 소유"
제한이 있었으나, 이번 지시서가 "팀 소유 제한은 풀렸다"고 명시해 이 라운드가 직접 고쳤다.

## 1. `tests/e2e/f16-question-guides.spec.ts`

### 1-1. AC6 — footer 셀렉터

**이전**

```ts
test(`PC-F16-AC6 — ${slug} 쪽 아래에 근거 자료 이름·기준일, 면책 문구, 계산기 링크가 보인다`, async ({ page }) => {
  await page.goto(`/guide/questions/${slug}`);
  const footer = page.getByRole("contentinfo").last();
  await expect(page.getByText(/기준일/).first()).toBeVisible();
  await expect(page.getByText("참고용이며 진단을 대신하지 않음")).toBeVisible();
  const calcLink = page.getByRole("link", { name: /계산/ }).last();
  await expect(calcLink).toBeVisible();
  await expect(calcLink).toHaveAttribute("href", /^\/(dashboard.*)?(\?.*)?$/);
  await expect(footer).toBeAttached();
});
```

**이후**

```ts
test(`PC-F16-AC6 — ${slug} 쪽 아래에 근거 자료 이름·기준일, 면책 문구, 계산기 링크가 보인다`, async ({ page }) => {
  await page.goto(`/guide/questions/${slug}`);
  const footer = page.locator("footer").last();
  await expect(footer).toBeAttached();
  for (const name of sourceNames) {
    await expect(footer, `${slug} 쪽 출처: ${name}`).toContainText(name);
  }
  await expect(footer.getByText(/기준일 (\d{4}-\d{2}-\d{2}|확인 전)/).first()).toBeVisible();
  await expect(footer.getByText("참고용이며 진단을 대신하지 않음")).toBeVisible();
  const calcLink = page.getByRole("link", { name: /계산/ }).last();
  await expect(calcLink).toBeVisible();
  await expect(calcLink).toHaveAttribute("href", /^\/(dashboard.*)?(\?.*)?$/);
});
```

**근거**: `getByRole("contentinfo")` 는 0건을 찾아 항상 실패했다. 원인은 HTML/ARIA 규칙 —
`<footer>` 가 `<main>` 의 자손이면 암묵적 contentinfo 랜드마크가 없다
(https://www.w3.org/TR/html-aria/). `QuestionShell.tsx` 가 `<main>` 안에 `<footer>` 를
두므로 요소 자체(`page.locator("footer")`)로 찾아야 한다. 동시에 "기준일 텍스트가 있다"만
보던 판정을, 각 쪽의 실제 출처 이름(entities 데이터 `meta.sources`, 예: 예방접종 쪽 →
"질병관리청 표준예방접종일정표(2026)")을 확인하는 판정으로 **더 엄격하게** 바꿨다
(curvez-reviewer TEAM-04 — "근거 자료 이름"을 요구하는 AC6 를 "기준일이 있다"만으로
판정하면 출처 이름이 사라져도 통과한다). corrected-age-until 쪽은 `correction-period.json`
의 `effectiveDate` 가 `null`(원문 대조 전, architecture.md ACC-04 규약)이라 "기준일 확인 전"
문구도 함께 허용했다 — 이는 완화가 아니라 정당한 두 표시 형태를 모두 인정한 것이다.

### 1-2. PAGES 배열에 sourceNames 추가

**이전**

```ts
const PAGES = [
  { slug: "vaccination", h1: "예방접종은 언제 맞나" },
  { slug: "checkup-questionnaire", h1: "영유아검진 문진표는 몇 개월로 쓰나" },
  { slug: "weaning", h1: "이유식은 언제 시작하나" },
  { slug: "corrected-age-until", h1: "교정연령은 언제까지 쓰나" },
  { slug: "catch-up-growth", h1: "따라잡기 성장은 되고 있나" },
  { slug: "copay-relief", h1: "본인부담 경감은 언제 끝나나" },
] as const;
```

**이후**: 각 항목에 `sourceNames: string[]`(그 쪽 `GuideQuestionView.tsx`의 `sourcesFor()`가
실제로 반환하는 출처 이름 그대로)을 추가했다. 예: `catch-up-growth`는 growth-lms.json 의
두 출처("공공데이터포털 국민건강보험공단_영유아성장도표LMS기준", "질병관리청 소아청소년
성장도표 (3세 미만 WHO Growth Standards)") 둘 다.

**근거**: 위 1-1 판정에서 쓸 출처 이름 목록. 데이터 파일(`vaccination-schedule.json` 등)을
직접 읽어 대조했다(`sourcesFor()` 매핑과 각 JSON 의 `meta.sources[].name` 그대로 옮겼다 —
지어내지 않았다).

### 1-3. AC5 — copay-relief 제외

**이전**

```ts
test("PC-F16-AC5 — 미확정 표시는 교정연령 쪽에만 붙는다(다른 5쪽에는 없다)", async ({ page }) => {
  for (const slug of ["vaccination", "checkup-questionnaire", "weaning", "catch-up-growth", "copay-relief"]) {
    await page.goto(`/guide/questions/${slug}`);
    await expect(page.getByText(/미확정/), `${slug} 쪽`).toHaveCount(0);
  }
});
```

**이후**: `copay-relief` 를 목록에서 뺐다(나머지 4쪽만 확인). 테스트 이름도
"(경감 종료일이 정당하게 보이는 copay-relief 는 제외한 나머지 4쪽에는 없다)"로 바꿔
왜 뺐는지 이름 자체에 남겼다.

**근거**: PC-F16-AC5 원문(requirements.md:253)은 "'교정연령은 언제까지' 쪽에는 ... '미확정'
표시가 보인다"만 요구한다. "다른 쪽에는 없다"는 요구에 없는 조건이고, copay-relief 쪽의
'미확정'은 `copayReliefEndDateMethod.status`(PRD 미결 2, 경감 종료일)가 정당하게 그리는
`UnconfirmedNotice` 다(`GuideQuestionView.tsx:200~202`). 이 조건이 있으면 항상 실패하므로
오케스트레이터 CONTEXT 지시(curvez-reviewer TEAM-02)대로 걷어냈다 — 요구를 약화한 것이
아니라 요구에 없던 조건을 뺀 것이다. `vaccination`·`checkup-questionnaire`·`weaning`·
`catch-up-growth` 4쪽은 `UnconfirmedNotice` 를 그리지 않는다는 사실은 코드로 직접
확인했다(grep, `GuideQuestionView.tsx` 에 `UnconfirmedNotice` 사용처는 corrected-age-until·
copay-relief 둘뿐).

### 1-4. EX1 — 왕복 테스트 신규 2건

**이전**: 없음(EX1 을 판정하는 테스트가 이 파일에 없었다).

**이후**: 두 테스트를 신규로 더했다.

```ts
test("PC-F16-EX1 — 프로필이 없으면 계산기 링크가 입력 화면을 거쳐 저장 뒤 원래 대상 화면(예방접종)으로 돌아간다", async ({ page }) => {
  await fixClockKst(page, "2026-06-01T09:00:00");
  await page.goto("/guide/questions/vaccination");
  const calcLink = page.getByRole("link", { name: /계산/ }).last();
  await expect(calcLink).toHaveAttribute("href", "/?next=%2Fdashboard%2Fvaccinations");
  await calcLink.click();
  await expect(page).toHaveURL(/\/\?next=%2Fdashboard%2Fvaccinations$/);
  await expect(page.getByLabel("출생일")).toBeVisible();
  await page.getByLabel("출생일").fill(BIRTH);
  await page.getByLabel("원래 출산 예정일").fill(DUE);
  await page.getByRole("radio", { name: "남아" }).click();
  await page.getByRole("button", { name: "저장하고 결과 보기" }).click();
  await page.waitForURL("**/dashboard/vaccinations");
});

test("PC-F16-EX1 — next 쿼리가 외부 경로면 거부하고 기본 화면(/dashboard)으로 돌아간다(열린 리다이렉트 방지)", async ({ page }) => {
  await fixClockKst(page, "2026-06-01T09:00:00");
  await page.goto("/?next=https%3A%2F%2Fevil.example.com");
  await expect(page.getByLabel("출생일")).toBeVisible();
  await page.getByLabel("출생일").fill(BIRTH);
  await page.getByLabel("원래 출산 예정일").fill(DUE);
  await page.getByRole("radio", { name: "남아" }).click();
  await page.getByRole("button", { name: "저장하고 결과 보기" }).click();
  await page.waitForURL("**/dashboard");
  await expect(page).not.toHaveURL(/evil\.example\.com/);
});
```

**근거**: 오케스트레이터 지시("F16 EX1·F18 AC2 계산기 링크 왕복 ... 외부 경로 거부를 E2E 로
판정"). PC-F16-EX1 원문(requirements.md:259) "계산기 링크는 해당 기능 화면으로 간다. 프로필이
없으면 입력 화면을 거쳐 그 화면으로 간다"를 첫 테스트가 왕복 전체(클릭 → 입력 화면 → 저장 →
원래 목적지 도착)로 판정한다. 두 번째 테스트는 `isAllowedReturnPath`(shared/lib/return-path,
curvez-nextjs 가 이미 구현한 열린 리다이렉트 방지)가 `InputView` 에서 실제로 동작하는지
사용자 쿼리 조작 시나리오로 확인한다 — src 를 새로 만들지 않고 기존 방어 로직을 검증만 했다.

## 2. `tests/e2e/f18-age-basis-public.spec.ts`

### 2-1. AC1 — SPEC v5 5항목

**이전**

```ts
const expected = [
  { label: "예방접종", basis: "출생 기준" },
  { label: "영유아검진 방문", basis: "출생 기준" },
  { label: "문진표·발달선별검사지", basis: "교정 기준(24개월 검진까지)" },
  { label: "성장 백분위", basis: "교정 기준" },
  { label: "이유식", basis: "교정 기준" },
];
```

**이후**

```ts
// SPEC 버전 5 원문의 5개 항목(requirements.md:277). 버전 3 의 "성장 백분위"는 이제 없다.
const expected = [
  { label: "예방접종", basis: "출생 기준" },
  { label: "영유아검진 방문", basis: "출생 기준" },
  { label: "문진표·발달선별검사지", basis: "교정 기준(24개월 검진까지)" },
  { label: "이유식", basis: "교정 기준" },
  { label: "발달 평가", basis: "교정 기준" },
];
```

**근거**: requirements.md:277 "SPEC 버전 5 가 버전 3~4 의 '성장 백분위' 를 F3·데이터
파일과 같은 '발달 평가' 로 바로잡았다"를 그대로 반영했다. `age-basis.json` 의 `items` 도
이미 `development`(label "발달 평가")를 담고 있어 src 와 요구 둘 다 "발달 평가"가 맞고,
테스트만 낡아 있었다.

### 2-2. AC3 — 출처 이름 엄격화

**이전**

```ts
test("PC-F18-AC3 — 근거 자료 이름과 기준일이 보인다", async ({ page }) => {
  await page.goto("/guide/age-basis");
  await expect(page.getByText("어느 나이를 쓰나 기준표").first()).toBeVisible();
  await expect(page.getByText(/기준일 \d{4}-\d{2}-\d{2}/).first()).toBeVisible();
});
```

**이후**

```ts
test("PC-F18-AC3 — 항목마다 실제 근거 자료 이름과 기준일이 보인다", async ({ page }) => {
  await page.goto("/guide/age-basis");
  const expectedSources = [
    { label: "예방접종", source: "질병관리청 표준 예방접종 일정표" },
    { label: "영유아검진 방문", source: "일산병원 영유아검진 안내(국민건강보험공단 기준)" },
    { label: "문진표·발달선별검사지", source: "일산병원 영유아검진 안내(국민건강보험공단 기준)" },
    { label: "이유식", source: "아이사랑 이른둥이 안내" },
    { label: "발달 평가", source: "아이사랑 이른둥이 안내" },
  ];
  for (const { label, source } of expectedSources) {
    const row = page.getByRole("listitem").filter({ hasText: label });
    await expect(row, label).toContainText(source);
    await expect(row, label).toContainText(/기준일 \d{4}-\d{2}-\d{2}/);
  }
});
```

**근거**: curvez-reviewer TEAM-04·TEAM-05 — 이전 테스트는 "어느 나이를 쓰나 기준표"라는
**데이터 파일 제목**(`ageBasisMeta.title`)을 "근거 자료 이름"으로 오판정했다. 실제 출처
이름(질병관리청·일산병원·아이사랑)이 사라져도 이전 테스트는 통과했을 것이다. 각 행
(`InfoRow`)이 이미 `sourceLabel`(실제 출처 이름 + 기준일)을 보여 주고 있어, 항목별로 그
값을 직접 확인하도록 바꿨다 — 더 엄격해졌다(약화 아님).

### 2-3. AC2 — 왕복 완성

**이전**

```ts
test("PC-F18-AC2 — 프로필이 없을 때 '내 아이로 계산하기'는 입력 화면(/)으로 간다", async ({ page }) => {
  await page.goto("/guide/age-basis");
  await page.getByRole("link", { name: "내 아이로 계산하기" }).click();
  await page.waitForURL((url) => url.pathname === "/");
  await expect(page.getByLabel("출생일")).toBeVisible();
});
```

**이후**: 같은 시작에 이어 실제로 폼을 채워 저장까지 하고, `/dashboard/age-basis`(F3 화면)
도착까지 확인하도록 확장했다(테스트 이름도 "... 저장 뒤 F3 화면(/dashboard/age-basis)으로
돌아간다"로 바꿨다).

**근거**: PC-F18-AC2 원문 "표 아래 '내 아이로 계산하기'를 누르면 프로필이 없을 때는 입력
화면, 있을 때는 F3 화면이 열린다"의 "프로필이 없을 때" 갈래는 입력 화면 도착까지만이 아니라
그 뒤 F3 화면 도착("왕복")까지 요구한다고 보는 것이 자연스럽다(오케스트레이터 지시와 동일
맥락). `MyChildCta.tsx` 가 이미 `/?next=%2Fdashboard%2Fage-basis` 로 왕복 경로를 만들어
두고 있어 이 확장은 src 변경 없이 가능했다.

## 3. `tests/e2e/f17-guide-index.spec.ts` (지시서에 없던 발견, 직접 고침)

**이전**

```ts
await page.goto("/guide");
await page.getByLabel(/출생 주수/).selectOption("32");
await page.getByLabel(/생후/).selectOption("3");
```

**이후**

```ts
await page.goto("/guide");
// exact 매치를 쓴다 — 팀(tmux) 라운드가 더한 section aria-labelledby="guide-combo"(접근
// 가능한 이름 "출생 주수와 생후 개월로 찾기")가 부분 일치 정규식과 겹쳐 strict mode 충돌을 낸다.
await page.getByLabel("출생 주수", { exact: true }).selectOption("32");
await page.getByLabel("생후 개월", { exact: true }).selectOption("3");
```

**근거**: 실행해 보니 `getByLabel(/출생 주수/)` 가 `<select>` 요소와 `<section
aria-labelledby="guide-combo">`(접근 가능한 이름이 "출생 주수와 생후 개월로 찾기"라 정규식에
걸린다) 둘에 매치돼 strict mode 위반으로 항상 실패했다. `exact: true` 로 `<select>` 만
집도록 좁혔다 — 지시서 목록에는 없었으나 최종 게이트 전 스팟 체크에서 발견해 같은 원칙
(선택자 정확도 개선, 요구 약화 없음)으로 고쳤다.

## 4. `tests/e2e/f1-profile.spec.ts`, `tests/e2e/nf-a11y.spec.ts`

**이전** (두 파일 동일 패턴)

```ts
await page.getByText("주수로 입력").click();
```
(f1-profile.spec.ts 는 `.toBeVisible()` 단언, nf-a11y.spec.ts 는 `.click()`)

**이후**

```ts
await page.getByRole("button", { name: "주수로 입력" }).click();
```

**근거**: 팀(tmux) 라운드가 `ProfileForm.tsx` 의 예정일 칸 아래에 도움말 문단("... 모르면
'주수로 입력'을 눌러 주세요.")을 추가하면서, `getByText("주수로 입력")` 이 토글 버튼과
도움말 문단 둘 다에 매치돼 strict mode 위반이 됐다. 실제로 클릭·확인하려는 대상은 버튼이라
`getByRole("button", { name: ... })` 으로 좁혔다 — 접근성 이름 기준이라 더 정확하다
(curvez-qa.20260930-134140.json 이 이미 원인을 파악해 두었던 것을 이번 라운드가 고쳤다).

## 5. `tests/e2e/target-height.spec.ts`

**이전**

```ts
test("state:empty — 계산 전(초기)에는 result 영역이 그려지지 않는다", async ({ page }) => {
  // ...
  await expect(page.getByText(/목표키 참고 \d/)).toHaveCount(0);
});

test("PC-F14-AC1 — ...", async ({ page }) => {
  // ...
  await expect(page.getByText("목표키 참고 175.0cm (168.5~181.5cm)")).toBeVisible();
});

test("PC-F14-AC2 — ...", async ({ page }) => {
  // ...
  await expect(page.getByText("목표키 참고 162.0cm (155.5~168.5cm)")).toBeVisible();
});
```

**이후**

```ts
test("state:empty — 계산 전(초기)에는 result 영역이 그려지지 않는다", async ({ page }) => {
  // ...
  await expect(page.getByRole("group", { name: "목표키 참고" })).toHaveCount(0);
});

test("PC-F14-AC1 — ...", async ({ page }) => {
  // ...
  const card = page.getByRole("group", { name: "목표키 참고" });
  await expect(card).toBeVisible();
  expect((await card.innerText()).replace(/\s+/g, " ").trim()).toBe(
    "목표키 참고 175.0cm (168.5~181.5cm)",
  );
});
// PC-F14-AC2 도 같은 패턴으로 162.0cm/155.5~168.5cm 판정
```

**근거**: `shared/ui/ValueCard.tsx` 가 라벨("목표키 참고")·값("175.0cm")·범위
("(168.5~181.5cm)")을 서로 다른 `<p>` 3개로 그린다(디자인 스펙 ValueCard.md 대로). 하나의
텍스트 노드를 찾는 `getByText(전체 문구)` 는 DOM 구조상 절대 매치되지 않아 src 가 옳아도
항상 실패했다(curvez-nextjs.20260930-135922 decisions 가 이미 이 원인을 지목했다).
`role=group`(ValueCard 의 `aria-labelledby`)으로 카드를 특정하고, 내부 텍스트를 공백
정규화해 **전체 문자열을 그대로** 비교하도록 바꿨다 — `toContainText` 로 일부만 보는 것보다
엄격하다(약화 아님). state:empty 쪽도 같은 `role=group` 부재로 판정하도록 통일했다.

## 6. `tests/unit/f13-build-artifacts.test.ts`

**이전**

```ts
const EXPECTED_COMBO_COUNT = 13 * 37; // = 481

function countGuideHtmlFiles(dir: string): number {
  let count = 0;
  for (const weeksEntry of readdirSync(dir)) {
    const weeksPath = join(dir, weeksEntry);
    if (!statSync(weeksPath).isDirectory()) continue;
    for (const file of readdirSync(weeksPath)) {
      if (file.endsWith(".html")) count += 1;
    }
  }
  return count;
}
// PC-F13-AC1: countGuideHtmlFiles(GUIDE_DIR) === 481 기대
// PC-F13-AC4: (body.match(/\/guide\//g) ?? []).length === 481 기대
```

**이후**

```ts
const EXPECTED_COMBO_COUNT = 13 * 37; // = 481
const WEEKS_DIR_NAME = /^\d+$/;
const EXPECTED_SITEMAP_TOTAL = 496; // 정적 9 + 질문형 가이드 6 + 조합 481

function countGuideHtmlFiles(dir: string): number {
  let count = 0;
  for (const weeksEntry of readdirSync(dir)) {
    if (!WEEKS_DIR_NAME.test(weeksEntry)) continue; // "questions"·"age-basis"·"[weeks]" 제외
    const weeksPath = join(dir, weeksEntry);
    if (!statSync(weeksPath).isDirectory()) continue;
    for (const file of readdirSync(weeksPath)) {
      if (file.endsWith(".html")) count += 1;
    }
  }
  return count;
}
// PC-F13-AC1: countGuideHtmlFiles(GUIDE_DIR) === 481 기대(그대로)
// PC-F13-AC4: (body.match(/\/guide\/\d+\/\d+/g) ?? []).length === 481 기대(패턴 좁힘)
// + 신규 단언: 전체 <loc> 개수 === 496
```

**근거**: F16(질문형 가이드 6쪽, `/guide/questions/<slug>`)·F18(`/guide/age-basis`)이 같은
`/guide` 아래 생기면서, 옛 카운트 로직이 `guide/` 디렉터리 전부(숫자 이름 13개 + "questions"
+ "age-basis" + "[weeks]" 동적 라우트 자리표시자)를 훑어 조합 481개 + 질문형 6쪽 = 487개를
셌다(재현: `ls .next/server/app/guide` 로 디렉터리 구조 직접 확인). 사이트맵 정규식
`/\/guide\//g` 도 `/guide/age-basis`·`/guide/questions/<slug>` 를 함께 세어 488개가
나왔다. 오케스트레이터 지시대로 "조합 경로(`/guide/<weeks>/<months>`)만" 세도록
좁혔다 — 481 이라는 **기준값 자체는 바꾸지 않고**, 무엇을 481개 안에 넣을지만 정확하게
좁혔다(약화 아님, 오히려 섞여서 우연히 481이 나올 뻔한 여지를 없앴다). 전체 sitemap
개수(496) 단언은 curvez-reviewer 가 이미 실측한 값(sitemap 496건: 정적 9, 질문 6, 조합
481, 중복 0)을 별도로 고정해 회귀를 잡도록 새로 더했다.

// F16 질문형 가이드 6쪽. PC-F16-AC1~AC7. 라우트는 /guide/questions/<slug> (팀 지시서 라우트 표).
// localStorage 가 빈 새 브라우저 컨텍스트에서 연다(프로필 시드를 하지 않는다).
import { expect, test } from "./support/fixtures";

import { fixClockKst } from "./support/helpers";

const BIRTH = "2026-03-01";
const DUE = "2026-04-26";

const PAGES = [
  // sourceNames: 그 쪽 아래 근거 자료가 실제로 보여야 하는 출처 이름(entities 데이터 meta.sources,
  // GuideQuestionView.tsx의 sourcesFor() 매핑 그대로). PC-F16-AC6 판정을 "기준일 문구가 있다"가
  // 아니라 "그 출처 이름이 있다"로 엄격하게 한다(TEAM-04).
  { slug: "vaccination", h1: "예방접종은 언제 맞나", sourceNames: ["질병관리청 표준예방접종일정표(2026)"] },
  {
    slug: "checkup-questionnaire",
    h1: "영유아검진 문진표는 몇 개월로 쓰나",
    sourceNames: ["일산병원 영유아검진 안내(국민건강보험공단 기준)"],
  },
  { slug: "weaning", h1: "이유식은 언제 시작하나", sourceNames: ["아이사랑 이른둥이 안내"] },
  { slug: "corrected-age-until", h1: "교정연령은 언제까지 쓰나", sourceNames: ["아이사랑 이른둥이 안내"] },
  {
    slug: "catch-up-growth",
    h1: "따라잡기 성장은 되고 있나",
    sourceNames: [
      "공공데이터포털 국민건강보험공단_영유아성장도표LMS기준",
      "질병관리청 소아청소년 성장도표 (3세 미만 WHO Growth Standards)",
    ],
  },
  {
    slug: "copay-relief",
    h1: "본인부담 경감은 언제 끝나나",
    sourceNames: ["보건복지부 보도자료 (2026년 1월 시행)", "국민건강보험공단 이른둥이 본인부담 경감 안내"],
  },
] as const;

for (const { slug, h1, sourceNames } of PAGES) {
  test(`PC-F16-AC1 — /guide/questions/${slug} 는 200 으로 열리고 h1 이 질문 문장이다`, async ({ page }) => {
    const response = await page.goto(`/guide/questions/${slug}`);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(h1);
  });

  test(`PC-F16-AC2 — localStorage 가 빈 브라우저에서 ${slug} 쪽을 열면 입력 화면으로 넘어가지 않고 본문이 보인다`, async ({
    page,
  }) => {
    await page.goto(`/guide/questions/${slug}`);
    await expect(page).toHaveURL(new RegExp(`/guide/questions/${slug}$`));
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(h1);
    // 프로필 입력 폼의 칸이 없다.
    await expect(page.getByLabel("출생일")).toHaveCount(0);
  });

  test(`PC-F16-AC6 — ${slug} 쪽 아래에 근거 자료 이름·기준일, 면책 문구, 계산기 링크가 보인다`, async ({ page }) => {
    await page.goto(`/guide/questions/${slug}`);
    // <footer> 가 <main> 의 자손이면 HTML/ARIA 상 암묵적 contentinfo 랜드마크가 없다
    // (https://www.w3.org/TR/html-aria/ footer 규칙). QuestionShell 이 <main> 안에 <footer> 를
    // 두므로 role=contentinfo 로는 찾지 못한다 — <footer> 요소 자체로 찾는다.
    const footer = page.locator("footer").last();
    await expect(footer).toBeAttached();
    for (const name of sourceNames) {
      await expect(footer, `${slug} 쪽 출처: ${name}`).toContainText(name);
    }
    // correction-period 는 원문 대조 전이라 effectiveDate 가 null 이고, 그때 ReferenceFooter
    // 는 architecture.md ACC-04 규약대로 "기준일 확인 전"을 쓴다(표시 규약, 결함이 아니다).
    await expect(footer.getByText(/기준일 (\d{4}-\d{2}-\d{2}|확인 전)/).first()).toBeVisible();
    await expect(footer.getByText("참고용이며 진단을 대신하지 않음")).toBeVisible();
    // 계산기로 가는 링크: 앱 내부 경로(/ 또는 /dashboard...)로 향한다.
    const calcLink = page.getByRole("link", { name: /계산/ }).last();
    await expect(calcLink).toBeVisible();
    await expect(calcLink).toHaveAttribute("href", /^\/(dashboard.*)?(\?.*)?$/);
  });
}

test("PC-F16-AC3 — 문진표 쪽에 '방문 날짜는 출생 기준, 문진표와 발달선별검사지는 교정 기준(24개월 검진까지)'이 보인다", async ({
  page,
}) => {
  await page.goto("/guide/questions/checkup-questionnaire");
  await expect(
    page.getByText("방문 날짜는 출생 기준, 문진표와 발달선별검사지는 교정 기준(24개월 검진까지)"),
  ).toBeVisible();
});

test("PC-F16-AC4 — 본인부담 경감 쪽에 재태기간 구간 3개와 기간이 보인다", async ({ page }) => {
  await page.goto("/guide/questions/copay-relief");
  await expect(page.getByText(/33주 이상 37주 미만/)).toBeVisible();
  await expect(page.getByText(/29주 이상 33주 미만/)).toBeVisible();
  await expect(page.getByText(/29주 미만/).first()).toBeVisible();
  await expect(page.getByText("5년 2개월")).toBeVisible();
  await expect(page.getByText("5년 3개월")).toBeVisible();
  await expect(page.getByText("5년 4개월")).toBeVisible();
});

test("PC-F16-AC5 — '교정연령은 언제까지' 쪽에는 '미확정' 표시가 보인다 (PRD 미결 3)", async ({ page }) => {
  await page.goto("/guide/questions/corrected-age-until");
  await expect(page.getByText(/미확정/).first()).toBeVisible();
});

// PC-F16-AC5 는 "교정연령 쪽에 미확정이 보인다"만 요구한다. copay-relief 쪽의 "미확정"은
// PRD 미결 2(경감 종료일)의 정당한 표시라 이 판정에서 뺀다(오케스트레이터 지시,
// curvez-reviewer TEAM-02 — 요구에 없는 조건을 만들지 않는다).
test("PC-F16-AC5 — 미확정 표시는 교정연령 쪽에만 붙는다(경감 종료일이 정당하게 보이는 copay-relief 는 제외한 나머지 4쪽에는 없다)", async ({
  page,
}) => {
  for (const slug of ["vaccination", "checkup-questionnaire", "weaning", "catch-up-growth"]) {
    await page.goto(`/guide/questions/${slug}`);
    await expect(page.getByText(/미확정/), `${slug} 쪽`).toHaveCount(0);
  }
});

test("PC-F16-AC7 — /sitemap.xml 에 질문형 가이드 6쪽이 모두 들어 있다", async ({ request }) => {
  const response = await request.get("/sitemap.xml");
  expect(response.status()).toBe(200);
  const body = await response.text();
  for (const { slug } of PAGES) {
    expect(body, `${slug} 쪽`).toContain(`/guide/questions/${slug}</loc>`);
  }
});

test("PC-F16-EX1 — 프로필이 없으면 계산기 링크가 입력 화면을 거쳐 저장 뒤 원래 대상 화면(예방접종)으로 돌아간다", async ({
  page,
}) => {
  await fixClockKst(page, "2026-06-01T09:00:00");
  await page.goto("/guide/questions/vaccination");
  const calcLink = page.getByRole("link", { name: /계산/ }).last();
  await expect(calcLink).toHaveAttribute("href", "/?next=%2Fdashboard%2Fvaccinations");
  await calcLink.click();

  // 입력 화면(/)을 거친다 — 바로 대상 화면으로 가지 않는다.
  await expect(page).toHaveURL(/\/\?next=%2Fdashboard%2Fvaccinations$/);
  await expect(page.getByLabel("출생일")).toBeVisible();

  await page.getByLabel("출생일").fill(BIRTH);
  await page.getByLabel("원래 출산 예정일").fill(DUE);
  await page.getByRole("radio", { name: "남아" }).click();
  await page.getByRole("button", { name: "저장하고 결과 보기" }).click();

  // 기본값(/dashboard)이 아니라 원래 눌렀던 계산기(F16 EX1 대상 화면)로 돌아간다.
  await page.waitForURL("**/dashboard/vaccinations");
});

test("PC-F16-EX1 — next 쿼리가 외부 경로면 거부하고 기본 화면(/dashboard)으로 돌아간다(열린 리다이렉트 방지)", async ({
  page,
}) => {
  await fixClockKst(page, "2026-06-01T09:00:00");
  // CalculatorLink·MyChildCta 는 항상 /dashboard 하위로만 next 를 만들지만, 사용자가 이 쿼리를
  // 직접 조작해 외부 주소를 넣을 수 있다 — isAllowedReturnPath 가 서버가 아니라 이 값을 실제로
  // 읽는 InputView 에서 막는지 확인한다.
  await page.goto("/?next=https%3A%2F%2Fevil.example.com");
  await expect(page.getByLabel("출생일")).toBeVisible();

  await page.getByLabel("출생일").fill(BIRTH);
  await page.getByLabel("원래 출산 예정일").fill(DUE);
  await page.getByRole("radio", { name: "남아" }).click();
  await page.getByRole("button", { name: "저장하고 결과 보기" }).click();

  await page.waitForURL("**/dashboard");
  await expect(page).not.toHaveURL(/evil\.example\.com/);
});

// F13 조합형 SEO 페이지(화면). PC-F13-AC2(문구), PC-F13-AC3(계산기 링크 프리필), PC-F13-EX1(1단계는
// 검진 안내만, 접종 안내 없음). 481쪽 빌드·사이트맵 개수(PC-F13-AC1·AC4)는 빌드 산출물 검사다 —
// tests/unit/f13-build-artifacts.test.ts.
import { expect, test } from "./support/fixtures";

test("PC-F13-AC2 — '32주 출생 생후 3개월' 페이지에 '예정일보다 8주 일찍 태어남'과 교정 나이 설명이 보인다", async ({
  page,
}) => {
  await page.goto("/guide/32/3");

  await expect(page.getByRole("heading", { name: "32주 출생, 생후 3개월" })).toBeVisible();
  await expect(page.getByText("예정일보다 8주 일찍 태어남")).toBeVisible();
  await expect(page.getByText(/교정 나이는 생후 3개월에서 8주\(약 2개월\)를 뺀/)).toBeVisible();
});

test("PC-F13-AC3 — 계산기로 가는 링크를 누르면 해당 주수(32주)가 채워진 입력 화면이 열린다", async ({ page }) => {
  await page.goto("/guide/32/3");

  const link = page.getByRole("link", { name: "이 주수로 계산기 열기" });
  await expect(link).toHaveAttribute("href", "/?weeks=32");
  await link.click();
  await page.waitForURL("**/?weeks=32");

  // 주수 모드로 시작하고 weeks=32, days=0 이 채워진다(input-weeks.md).
  await expect(page.getByLabel("주", { exact: true })).toHaveValue("32");
  await expect(page.getByRole("spinbutton", { name: "일" })).toHaveValue("0");
  await expect(page.getByText("예정일로 입력")).toBeVisible();
  await expect(page.getByLabel("출생일")).toBeVisible();
});

test("PC-F13-EX1 — 1단계는 검진 안내만 넣고, 접종 안내는 없다", async ({ page }) => {
  await page.goto("/guide/32/3");
  await expect(page.getByText(/영유아검진/)).toBeVisible();
  await expect(page.getByText(/접종/)).toHaveCount(0);
});

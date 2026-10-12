// F17 가이드 목록 페이지. PC-F17-AC1~AC3. 경로는 /guide.
import { expect, test } from "./support/fixtures";

const QUESTION_SLUGS = [
  "vaccination",
  "checkup-questionnaire",
  "weaning",
  "corrected-age-until",
  "catch-up-growth",
  "copay-relief",
] as const;

test("PC-F17-AC1 — /guide 가 200 으로 열리고 질문형 가이드 6쪽 링크가 보인다", async ({ page }) => {
  const response = await page.goto("/guide");
  expect(response?.status()).toBe(200);
  for (const slug of QUESTION_SLUGS) {
    const link = page.locator(`a[href="/guide/questions/${slug}"]`);
    await expect(link, `${slug} 링크`).toBeVisible();
  }
});

test("PC-F17-AC2 — 출생 주수 32주, 생후 3개월을 고르고 이동을 누르면 '32주 출생, 생후 3개월' 조합 페이지가 열린다", async ({
  page,
}) => {
  await page.goto("/guide");
  // exact 매치를 쓴다 — 팀(tmux) 라운드가 더한 section aria-labelledby="guide-combo"(접근
  // 가능한 이름 "출생 주수와 생후 개월로 찾기")가 부분 일치 정규식과 겹쳐 strict mode 충돌을 낸다.
  await page.getByLabel("출생 주수", { exact: true }).selectOption("32");
  await page.getByLabel("생후 개월", { exact: true }).selectOption("3");
  await page.getByRole("button", { name: "이동" }).click();

  await page.waitForURL("**/guide/32/3");
  await expect(page.getByRole("heading", { name: "32주 출생, 생후 3개월" })).toBeVisible();
});

test("PC-F17-AC3 — /sitemap.xml 에 /guide 가 들어 있다", async ({ request }) => {
  const response = await request.get("/sitemap.xml");
  expect(response.status()).toBe(200);
  const body = await response.text();
  expect(body).toMatch(/\/guide<\/loc>/);
});

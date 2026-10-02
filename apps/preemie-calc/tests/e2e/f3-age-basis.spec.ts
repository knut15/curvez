// F3 "어느 나이를 쓰나" 안내. PC-F3-AC1~AC5.
import { expect, test } from "./support/fixtures";

import { fixClockKst, seedProfiles } from "./support/helpers";

const BIRTH = "2026-03-01";
const DUE = "2026-04-26"; // 32주 0일

test.beforeEach(async ({ page }) => {
  await fixClockKst(page, "2026-06-01T09:00:00");
});

test("PC-F3-AC1 — '예방접종 — 출생 기준 — 생후 3개월'이 보인다", async ({ page }) => {
  await seedProfiles(page, [{ birthDate: BIRTH, dueDate: DUE }]);
  await page.goto("/dashboard/age-basis");

  const row = page.getByRole("listitem").filter({ hasText: "예방접종" });
  await expect(row).toContainText("출생 기준");
  await expect(row).toContainText("생후 3개월");
});

test("PC-F3-AC2 — '이유식 — 교정 기준 — 교정 1개월'이 보인다", async ({ page }) => {
  await seedProfiles(page, [{ birthDate: BIRTH, dueDate: DUE }]);
  await page.goto("/dashboard/age-basis");

  const row = page.getByRole("listitem").filter({ hasText: "이유식" });
  await expect(row).toContainText("교정 기준");
  await expect(row).toContainText("교정 1개월");
});

test("PC-F3-AC3 — '영유아검진 방문 — 출생 기준', '문진표·발달선별검사지 — 교정 기준(24개월 검진까지)'이 보인다", async ({
  page,
}) => {
  await seedProfiles(page, [{ birthDate: BIRTH, dueDate: DUE }]);
  await page.goto("/dashboard/age-basis");

  const visitRow = page.getByRole("listitem").filter({ hasText: "영유아검진 방문" });
  await expect(visitRow).toContainText("출생 기준");

  const questionnaireRow = page.getByRole("listitem").filter({ hasText: "문진표·발달선별검사지" });
  await expect(questionnaireRow).toContainText("교정 기준(24개월 검진까지)");
});

test("PC-F3-AC4 — 항목마다 근거 자료 이름과 기준일이 보인다", async ({ page }) => {
  await seedProfiles(page, [{ birthDate: BIRTH, dueDate: DUE }]);
  await page.goto("/dashboard/age-basis");

  const row = page.getByRole("listitem").filter({ hasText: "예방접종" });
  await expect(row).toContainText("기준일");
});

test("PC-F3-AC5 — 재태 37주 이상 아이는 모든 항목이 '생후 나이 그대로'로 보인다", async ({ page }) => {
  // birth 2026-03-01, due 2026-03-10 → 재태 38주5일(271일) ≥ 259.
  await seedProfiles(page, [{ birthDate: "2026-03-01", dueDate: "2026-03-10" }]);
  await page.goto("/dashboard/age-basis");

  await expect(
    page.getByText("재태 37주 이상이면 모든 항목이 생후 나이 그대로 적용됩니다."),
  ).toBeVisible();

  const solidFoodRow = page.getByRole("listitem").filter({ hasText: "이유식" });
  await expect(solidFoodRow).toContainText("출생 기준");
  await expect(solidFoodRow).toContainText("생후");
  await expect(solidFoodRow).not.toContainText("교정 3개월");
});

test("[curvez-reviewer/ACC-01] 예정일 2026-03-10(재태 37주 이상) 아이의 F3 에 '교정 기준' 문구가 0개다", async ({
  page,
}) => {
  // birth 2026-03-01, due 2026-03-10 → 재태 38주5일(271일) ≥ 259(37주). PC-F3-AC5 를 어기던
  // 결함(문진표·발달선별검사지 행이 고정 문구로 '교정 기준(24개월 검진까지)'을 보였다)의 회귀 방지.
  await seedProfiles(page, [{ birthDate: "2026-03-01", dueDate: "2026-03-10" }]);
  await page.goto("/dashboard/age-basis");

  const questionnaireRow = page.getByRole("listitem").filter({ hasText: "문진표·발달선별검사지" });
  await expect(questionnaireRow).toContainText("출생 기준");
  await expect(page.getByText("교정 기준")).toHaveCount(0);
});

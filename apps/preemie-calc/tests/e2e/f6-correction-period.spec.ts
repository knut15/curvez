// F6 교정연령 적용 종료 안내. PC-F6-AC1~AC4, PC-F6-EX1.
import { expect, test } from "./support/fixtures";

import { dueDateForGestationDays, fixClockKst, seedProfiles } from "./support/helpers";

const BIRTH = "2026-03-01";

test.beforeEach(async ({ page }) => {
  await fixClockKst(page, "2026-06-01T09:00:00");
});

test("PC-F6-AC1 · PC-F6-AC4 — 재태 32주0일·체중 미입력이면 '24개월까지'와 연장 조건, '의료진과 상담해 정하세요'가 보인다", async ({
  page,
}) => {
  await seedProfiles(page, [
    { birthDate: BIRTH, dueDate: dueDateForGestationDays(BIRTH, 224), birthWeightGrams: null },
  ]);
  await page.goto("/dashboard/correction-period");

  await expect(page.getByText("24개월까지", { exact: true })).toBeVisible();
  await expect(page.getByText("출생 체중이 1.5kg 미만이면 36개월까지")).toBeVisible();
  await expect(page.getByText("의료진과 상담해 정하세요")).toBeVisible();
});

test("PC-F6-AC2 — 재태 27주6일이면 '36개월까지 쓸 수 있음'이 보인다", async ({ page }) => {
  await seedProfiles(page, [{ birthDate: BIRTH, dueDate: dueDateForGestationDays(BIRTH, 195) }]);
  await page.goto("/dashboard/correction-period");
  await expect(page.getByText("36개월까지 쓸 수 있음")).toBeVisible();
});

test("PC-F6-AC3 — 재태 32주0일·출생 체중 1.4kg이면 '36개월까지 쓸 수 있음'이 보인다", async ({ page }) => {
  await seedProfiles(page, [
    { birthDate: BIRTH, dueDate: dueDateForGestationDays(BIRTH, 224), birthWeightGrams: 1400 },
  ]);
  await page.goto("/dashboard/correction-period");
  await expect(page.getByText("36개월까지 쓸 수 있음")).toBeVisible();
});

test("PC-F6-EX1 — 재태 37주 이상이면 대시보드 quick-links에 이 카드 자체가 없다", async ({ page }) => {
  await seedProfiles(page, [{ birthDate: BIRTH, dueDate: dueDateForGestationDays(BIRTH, 259) }]);
  await page.goto("/dashboard");
  await expect(page.getByText("교정연령 적용 종료 안내")).toHaveCount(0);
});

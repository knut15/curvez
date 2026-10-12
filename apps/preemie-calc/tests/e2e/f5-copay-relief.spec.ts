// F5 본인부담 경감 종료일. PC-F5-AC1~AC5.
import { expect, test } from "./support/fixtures";

import { dueDateForGestationDays, fixClockKst, seedProfiles } from "./support/helpers";

const BIRTH = "2026-03-01";

test.beforeEach(async ({ page }) => {
  await fixClockKst(page, "2026-06-01T09:00:00");
});

test("PC-F5-AC1 — 재태 32주0일이면 '5년 3개월' 구간으로 분류된다", async ({ page }) => {
  await seedProfiles(page, [{ birthDate: BIRTH, dueDate: dueDateForGestationDays(BIRTH, 224) }]);
  await page.goto("/dashboard/copay-relief");
  await expect(page.getByText("5년 3개월")).toBeVisible();
});

test("PC-F5-AC2 — 재태 28주6일이면 '5년 4개월' 구간으로 분류된다", async ({ page }) => {
  await seedProfiles(page, [{ birthDate: BIRTH, dueDate: dueDateForGestationDays(BIRTH, 202) }]);
  await page.goto("/dashboard/copay-relief");
  await expect(page.getByText("5년 4개월")).toBeVisible();
});

test("PC-F5-AC3 — 재태 35주0일이면 '5년 2개월' 구간으로 분류된다", async ({ page }) => {
  await seedProfiles(page, [{ birthDate: BIRTH, dueDate: dueDateForGestationDays(BIRTH, 245) }]);
  await page.goto("/dashboard/copay-relief");
  await expect(page.getByText("5년 2개월")).toBeVisible();
});

test("PC-F5-AC4 — 재태 37주0일 이상이면 '경감 대상이 아닙니다'가 보인다", async ({ page }) => {
  await seedProfiles(page, [{ birthDate: BIRTH, dueDate: dueDateForGestationDays(BIRTH, 259) }]);
  await page.goto("/dashboard/copay-relief");
  await expect(page.getByText("경감 대상이 아닙니다")).toBeVisible();
});

test("PC-F5-AC5 — 종료 예정일과 '2026년 1월 시행 제도 기준' 문구가 함께 보인다", async ({ page }) => {
  await seedProfiles(page, [{ birthDate: BIRTH, dueDate: dueDateForGestationDays(BIRTH, 224) }]);
  await page.goto("/dashboard/copay-relief");
  await expect(page.getByText("종료 예정일: 2031-06-01")).toBeVisible();
  await expect(page.getByText("2026년 1월 시행 제도 기준")).toBeVisible();
});

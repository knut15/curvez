// F2 교정연령 대시보드. 화면 문구가 원문 그대로 보이는지(단위 테스트로 이미 검증한 계산과
// 별개로) 확인한다. PC-F2-AC1~AC5, PC-F2-EX1.
import { expect, test } from "./support/fixtures";

import { fixClockKst, seedProfiles } from "./support/helpers";

const BIRTH = "2026-03-01";
const DUE = "2026-04-26"; // 32주 0일

test("PC-F2-AC1 — 오늘 2026-06-01: '생후 92일 · 3개월'과 '교정 36일 · 1개월'이 나란히 보인다", async ({
  page,
}) => {
  await seedProfiles(page, [{ birthDate: BIRTH, dueDate: DUE }]);
  await fixClockKst(page, "2026-06-01T09:00:00");
  await page.goto("/dashboard");

  const card = page.getByRole("group", { name: "오늘 기준 나이" });
  await expect(card).toContainText("생후 92일 · 3개월");
  await expect(card).toContainText("교정");
  await expect(card).toContainText("36일 · 1개월");
});

test("PC-F2-AC2 — 오늘 2026-04-01: '교정 D-25'와 '재태 36주 3일'이 보인다", async ({ page }) => {
  await seedProfiles(page, [{ birthDate: BIRTH, dueDate: DUE }]);
  await fixClockKst(page, "2026-04-01T09:00:00");
  await page.goto("/dashboard");

  const card = page.getByRole("group", { name: "오늘 기준 나이" });
  await expect(card).toContainText("교정 D-25");
  await expect(card).toContainText("재태 36주 3일");
});

test("PC-F2-AC3 — 오늘 2026-06-01: 다음 월령일 '생후 4개월: 2026-07-01'과 '교정 2개월: 2026-06-26'이 보인다", async ({
  page,
}) => {
  await seedProfiles(page, [{ birthDate: BIRTH, dueDate: DUE }]);
  await fixClockKst(page, "2026-06-01T09:00:00");
  await page.goto("/dashboard");

  const card = page.getByRole("group", { name: "오늘 기준 나이" });
  await expect(card).toContainText("생후 4개월: 2026-07-01");
  await expect(card).toContainText("교정 2개월: 2026-06-26");
});

test("PC-F2-AC4 — 재태 38주5일(37주 이상)이면 교정 칸이 보이지 않고 생후 나이만 보인다", async ({ page }) => {
  // birth 2026-03-01, due 2026-03-10 → daysBetween=9, gestation=280-9=271일=38주 5일 ≥259.
  await seedProfiles(page, [{ birthDate: "2026-03-01", dueDate: "2026-03-10" }]);
  await fixClockKst(page, "2026-06-01T09:00:00");
  await page.goto("/dashboard");

  const card = page.getByRole("group", { name: "오늘 기준 나이" });
  await expect(card).toContainText("생후");
  await expect(card).toContainText("교정 나이는 재태 37주 이상이라 표시하지 않습니다");
  await expect(card.getByText("교정", { exact: true })).toHaveCount(0);
});

test("PC-F2-AC5 — 나이 옆에 '생후: 출생일 기준 · 교정: 출산 예정일 기준'이 한 줄로 적혀 있다", async ({
  page,
}) => {
  await seedProfiles(page, [{ birthDate: BIRTH, dueDate: DUE }]);
  await fixClockKst(page, "2026-06-01T09:00:00");
  await page.goto("/dashboard");

  await expect(page.getByText("생후: 출생일 기준 · 교정: 출산 예정일 기준")).toBeVisible();
});

test("[curvez-reviewer/ACC-02] 화면에 '교정 36일 · 1개월' 한 문구가 정확히 보인다(getByText exact)", async ({
  page,
}) => {
  await seedProfiles(page, [{ birthDate: BIRTH, dueDate: DUE }]);
  await fixClockKst(page, "2026-06-01T09:00:00");
  await page.goto("/dashboard");

  await expect(page.getByText("교정 36일 · 1개월", { exact: true })).toBeVisible();
});

test("PC-F2-EX1 — 프로필이 없으면 F1 첫 화면으로 보낸다", async ({ page }) => {
  await fixClockKst(page, "2026-06-01T09:00:00");
  await page.goto("/dashboard");
  await page.waitForURL((url) => url.pathname === "/");
  await expect(page.getByLabel("출생일")).toBeVisible();
});

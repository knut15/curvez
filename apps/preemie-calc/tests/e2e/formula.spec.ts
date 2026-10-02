// F15 분유량 참고. route /dashboard/formula.
// PC-F15-AC1, AC2, AC3, EX1, EX2, EX3. 스펙: .curvez/design/preemie-calc/screens/formula.md.
import { expect, test } from "./support/fixtures";

import { fixClockKst, focusableTextsInOrder, seedProfiles } from "./support/helpers";

const BIRTH = "2026-03-01";
const DUE = "2026-04-26"; // 32주 0일 → correctionApplies

test.beforeEach(async ({ page }) => {
  await seedProfiles(page, [{ birthDate: BIRTH, dueDate: DUE }]);
});

test("PC-F15-AC1 · AC2 — 체중 4.0kg → 하루 600~720ml, 재태 37주 미만은 결과보다 먼저 의료진 안내가 보인다", async ({
  page,
}) => {
  await fixClockKst(page, "2026-06-01T09:00:00"); // 교정 1개월 6일 → 0~3개월 밴드
  await page.goto("/dashboard/formula");
  await page.getByLabel("체중").fill("4");
  await page.getByRole("button", { name: "계산하기" }).click();
  await expect(page.getByText("의료진이 정해 준 양이 있으면 그 양을 따르세요")).toBeVisible();
  await expect(page.getByRole("group", { name: "하루 권장량" })).toContainText("600~720ml");
});

test("PC-F15-AC3 — 결과 아래에 계수 출처·기준일과 진단 대신 문구가 보인다", async ({ page }) => {
  await fixClockKst(page, "2026-06-01T09:00:00");
  await page.goto("/dashboard/formula");
  await page.getByLabel("체중").fill("4");
  await page.getByRole("button", { name: "계산하기" }).click();
  await expect(page.getByText("참고용이며 진단을 대신하지 않음")).toBeVisible();
});

test("PC-F15-EX1 — 체중이 비었거나 범위 밖(0.5~15kg)이면 계산 버튼이 비활성화된다", async ({ page }) => {
  await fixClockKst(page, "2026-06-01T09:00:00");
  await page.goto("/dashboard/formula");
  await page.getByLabel("체중").fill("0.4");
  await expect(page.getByRole("button", { name: "계산하기" })).toBeDisabled();
  await expect(page.getByText("체중을 확인하세요(0.5~15kg)")).toBeVisible();
});

test("state:empty(EX2) — 교정 나이가 예정일 이전(범위 밖)이면 '이 시기에는 일반 권장량을 보여주지 않습니다'다", async ({
  page,
}) => {
  await fixClockKst(page, "2026-04-01T09:00:00"); // DUE(2026-04-26) 이전 → before-due
  await page.goto("/dashboard/formula");
  await page.getByLabel("체중").fill("4");
  await page.getByRole("button", { name: "계산하기" }).click();
  await expect(page.getByRole("status")).toContainText("이 시기에는 일반 권장량을 보여주지 않습니다");
});

test("state:coefficient-unconfirmed(EX3) — 교정 나이가 3개월 이상이면 '기준 확인 중'이 보인다", async ({ page }) => {
  await fixClockKst(page, "2026-07-26T09:00:00"); // DUE + 3개월 정각
  await page.goto("/dashboard/formula");
  await page.getByLabel("체중").fill("4");
  await page.getByRole("button", { name: "계산하기" }).click();
  await expect(page.getByRole("note")).toContainText("기준 확인 중");
});

test("focus-order — header.back → 체중 → 계산하기(값을 채워 활성화된 뒤)", async ({ page }) => {
  await fixClockKst(page, "2026-06-01T09:00:00");
  await page.goto("/dashboard/formula");
  await page.getByLabel("체중").fill("4");
  const names = await focusableTextsInOrder(page);
  expect(names).toEqual(["대시보드", "체중 *, 필수", "계산하기"]);
});

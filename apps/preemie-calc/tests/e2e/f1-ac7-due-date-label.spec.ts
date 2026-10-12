// F1 AC7 (SPEC 버전 4). 예정일 칸 라벨은 "원래 출산 예정일", 칸 아래에 도움말이 보이고 aria-describedby 로 연결된다.
import { expect, test } from "./support/fixtures";

import { fixClockKst } from "./support/helpers";

const HELP = "임신 중 병원에서 안내받은 날짜예요. 모르면 '주수로 입력'을 눌러 주세요.";

test.beforeEach(async ({ page }) => {
  await fixClockKst(page, "2026-06-01T09:00:00");
  await page.goto("/");
});

test("PC-F1-AC7 — 예정일 칸의 라벨이 '원래 출산 예정일'이다", async ({ page }) => {
  await expect(page.getByLabel("원래 출산 예정일")).toBeVisible();
});

test("PC-F1-AC7 — 칸 아래에 도움말이 보이고, 칸의 aria-describedby 가 그 도움말을 가리킨다", async ({ page }) => {
  const field = page.getByLabel("원래 출산 예정일");
  const help = page.getByText(HELP, { exact: true });
  await expect(help).toBeVisible();

  const describedBy = await field.getAttribute("aria-describedby");
  expect(describedBy, "aria-describedby 가 있어야 한다").toBeTruthy();
  const helpId = await help.getAttribute("id");
  expect(describedBy?.split(/\s+/)).toContain(helpId);

  // 도움말은 칸 아래에 있다.
  const fieldBox = await field.boundingBox();
  const helpBox = await help.boundingBox();
  expect(helpBox!.y).toBeGreaterThan(fieldBox!.y);
});

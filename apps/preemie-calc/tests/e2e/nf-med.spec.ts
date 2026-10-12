// 비기능: 의료 면책. PC-NF-MED-1 — 결과가 있는 모든 화면에
// "참고용이며 진단을 대신하지 않음"이 보인다.
import { expect, test } from "./support/fixtures";

import { fixClockKst, seedProfiles } from "./support/helpers";

const BIRTH = "2026-03-01";
const DUE = "2026-04-26";
const DISCLAIMER = "참고용이며 진단을 대신하지 않음";

const screens: Array<{ name: string; path: string; seed: boolean }> = [
  { name: "dashboard", path: "/dashboard", seed: true },
  { name: "age-basis", path: "/dashboard/age-basis", seed: true },
  { name: "checkups", path: "/dashboard/checkups", seed: true },
  { name: "copay-relief", path: "/dashboard/copay-relief", seed: true },
  { name: "correction-period", path: "/dashboard/correction-period", seed: true },
  { name: "share", path: "/share#b=2026-03-01&d=2026-04-26", seed: false },
  { name: "guide", path: "/guide/32/3", seed: false },
  { name: "growth", path: "/dashboard/growth", seed: true },
  { name: "vaccinations", path: "/dashboard/vaccinations", seed: true },
  { name: "target-height", path: "/dashboard/target-height", seed: true },
  { name: "formula", path: "/dashboard/formula", seed: true },
];

for (const screen of screens) {
  test(`PC-NF-MED-1 — ${screen.name} 화면에 의료 면책 문구가 보인다`, async ({ page }) => {
    if (screen.seed) {
      await seedProfiles(page, [{ birthDate: BIRTH, dueDate: DUE }]);
    }
    await fixClockKst(page, "2026-06-01T09:00:00");
    await page.goto(screen.path);
    await expect(page.getByText(DISCLAIMER)).toBeVisible();
  });
}

// F10 예방접종 일정. route /dashboard/vaccinations.
// PC-F10-AC1, AC2, AC3. 스펙: .curvez/design/preemie-calc/screens/vaccinations.md,
// components/VaccinationRoundItem.md.
//
// state:empty·state:error 는 이 화면에 없다(디자인 스펙 원문: 접종 차수가 데이터 파일에
// 고정 정의돼 있고, 기준 데이터가 정적 import 라 런타임 로드 실패 상태에 도달할 수 없다 —
// curvez-nextjs decisions 참고). 그래서 테스트도 만들지 않는다(strategy.md 참고).
import { expect, test } from "./support/fixtures";

import { fixClockKst, seedProfiles } from "./support/helpers";

const BIRTH = "2026-03-01";
const DUE = "2026-04-26"; // 32주 0일

test.beforeEach(async ({ page }) => {
  await seedProfiles(page, [{ birthDate: BIRTH, dueDate: DUE }]);
});

test("PC-F10-AC1 — 생후 2개월 접종(DTaP 1차)은 2026-05-01 로 표시되고 '교정 5일'이 보인다", async ({ page }) => {
  await fixClockKst(page, "2026-05-01T09:00:00");
  await page.goto("/dashboard/vaccinations");
  const item = page.getByRole("listitem").filter({ hasText: "DTaP 1차" });
  await expect(item).toContainText("2026-05-01");
  await expect(item).toContainText("교정 5일");
});

test("PC-F10-AC2 — 완료 체크한 접종은 완료, 7일 이내 남은 접종은 임박, 지나고 미체크면 놓침이다", async ({ page }) => {
  // 오늘 2026-04-24: DTaP 1차(권장일 2026-05-01)까지 7일 남아 soon(임박)이다.
  await fixClockKst(page, "2026-04-24T09:00:00");
  await page.goto("/dashboard/vaccinations");
  const dtap1 = page.getByRole("listitem").filter({ hasText: "DTaP 1차" });
  await expect(dtap1).toContainText("임박");

  // B형간염 1차(출생시, 권장일 2026-03-01)는 이미 지났고 체크하지 않았으니 놓침이다.
  const hepb1 = page.getByRole("listitem").filter({ hasText: "B형간염 1차" });
  await expect(hepb1).toContainText("놓침");

  // 놓침 상태인 접종을 완료로 체크하면 즉시 완료로 바뀐다.
  await hepb1.getByRole("checkbox").check();
  await expect(hepb1).toContainText("완료");
});

test("PC-F10-AC3 — 완료 체크는 새로 열어도 유지된다", async ({ page }) => {
  await fixClockKst(page, "2026-04-24T09:00:00");
  await page.goto("/dashboard/vaccinations");
  const hepb1 = page.getByRole("listitem").filter({ hasText: "B형간염 1차" });
  await hepb1.getByRole("checkbox").check();
  await expect(hepb1.getByRole("checkbox")).toBeChecked();

  await page.reload();
  const hepb1Again = page.getByRole("listitem").filter({ hasText: "B형간염 1차" });
  await expect(hepb1Again.getByRole("checkbox")).toBeChecked();
  await expect(hepb1Again).toContainText("완료");
});

test("a11y:label — 체크박스 접근 이름이 '{백신명} {차수} 완료로 표시' 형식이다", async ({ page }) => {
  await fixClockKst(page, "2026-04-24T09:00:00");
  await page.goto("/dashboard/vaccinations");
  await expect(page.getByLabel("B형간염 1차 완료로 표시")).toBeVisible();
  await expect(page.getByLabel("DTaP 1차 완료로 표시")).toBeVisible();
});

test("PC-NF-MED-1 — 화면에 의료 면책 문구가 보인다", async ({ page }) => {
  await fixClockKst(page, "2026-04-24T09:00:00");
  await page.goto("/dashboard/vaccinations");
  await expect(page.getByText("참고용이며 진단을 대신하지 않음")).toBeVisible();
});

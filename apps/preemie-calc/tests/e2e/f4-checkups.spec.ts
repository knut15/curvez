// F4 영유아검진 도우미 화면. 계산 자체(PC-F4-AC1·AC3·EX1)는 tests/unit/checkup.test.ts 가
// 이미 검증했다. 여기서는 그 값이 실제 화면에 문구·순서·배지로 보이는지만 확인한다.
// PC-F4-AC2(문구), PC-F4-AC4(강조·구분), PC-F4-AC5(출처).
import { expect, test } from "./support/fixtures";

import { fixClockKst, seedProfiles } from "./support/helpers";

const BIRTH = "2026-03-01";
const DUE = "2026-04-26"; // 32주 0일, correctionApplies=true

test("PC-F4-AC2 — 오늘 2026-09-15(생후 6개월14일·교정 4개월20일)이면 '오늘은 교정 4개월 기준으로 문진표를 쓰세요'가 보인다", async ({
  page,
}) => {
  await seedProfiles(page, [{ birthDate: BIRTH, dueDate: DUE }]);
  await fixClockKst(page, "2026-09-15T09:00:00");
  await page.goto("/dashboard/checkups");

  await expect(page.getByText("오늘은 교정 4개월 기준으로 문진표를 쓰세요")).toBeVisible();
});

test("PC-F4-AC4 — 오늘 날짜가 든 차수가 맨 위에 강조돼 보이고, 지난·예정 차수와 구분된다", async ({ page }) => {
  await seedProfiles(page, [{ birthDate: BIRTH, dueDate: DUE }]);
  await fixClockKst(page, "2026-09-15T09:00:00");
  await page.goto("/dashboard/checkups");

  const items = page.getByRole("listitem");
  const first = items.first();
  await expect(first).toContainText("2차"); // 4~6개월 차수가 생후 6개월14일 시점의 current
  await expect(first).toContainText("오늘");

  const pastItem = items.filter({ hasText: "1차" });
  await expect(pastItem).toContainText("지남");

  const upcomingItem = items.filter({ hasText: "3차" });
  await expect(upcomingItem).toContainText("예정");
});

test("PC-F4-AC5 — 화면 아래에 데이터 출처와 기준일이 보인다", async ({ page }) => {
  await seedProfiles(page, [{ birthDate: BIRTH, dueDate: DUE }]);
  await fixClockKst(page, "2026-09-15T09:00:00");
  await page.goto("/dashboard/checkups");

  await expect(page.getByText("영유아건강검진 차수")).toBeVisible();
  await expect(page.getByText(/기준일/)).toBeVisible();
  await expect(page.getByText("참고용이며 진단을 대신하지 않음")).toBeVisible();
});

test("[curvez-reviewer/ERR-01] 오늘이 출산 예정일 전(1차 검진 창 안)이어도 /dashboard/checkups 가 예외 없이 뜨고 '출산 예정일 전이라 교정 나이가 아직 없습니다'가 보인다", async ({
  page,
}) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (e) => pageErrors.push(e.message));

  await seedProfiles(page, [{ birthDate: BIRTH, dueDate: DUE }]);
  // 출산 예정일(2026-04-26) 전, 1차 검진 창(생후 14~35일) 안 — 수정 전에는 이 구간에서
  // calendarSpan 예외로 화면 전체가 깨졌다.
  await fixClockKst(page, "2026-03-20T09:00:00");
  await page.goto("/dashboard/checkups");

  // 요약 줄(UnconfirmedNotice, "미확정 · ...")과 해당 차수 칸(정확히 이 문구만) 양쪽에 뜨므로
  // 정확히 이 문구만 있는 요소를 기준으로 잡는다.
  await expect(page.getByText("출산 예정일 전이라 교정 나이가 아직 없습니다", { exact: true })).toBeVisible();
  expect(pageErrors).toEqual([]);
});

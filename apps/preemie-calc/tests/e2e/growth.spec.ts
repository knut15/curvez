// F8 성장 백분위 + 기록. route /dashboard/growth.
// PC-F8-AC1, AC2, AC5, EX1. 스펙: .curvez/design/preemie-calc/screens/growth.md,
// components/GrowthEntryForm.md, components/GrowthRecordTable.md.
import { expect, test } from "./support/fixtures";

import { fixClockKst, focusableTextsInOrder, seedProfiles } from "./support/helpers";

const BIRTH = "2026-03-01";
const DUE = "2026-04-26"; // 32주 0일 → correctionApplies

async function fillGrowthForm(
  page: import("@playwright/test").Page,
  values: { measuredOn: string; heightCm: string; weightKg: string; headCircumferenceCm: string; posture: "누워서" | "서서" },
) {
  // 기록 표의 행(tr)도 aria-label 에 "측정일·키·몸무게·머리둘레"를 담는다. 기록이 1개 이상일 때
  // getByLabel 이 행까지 잡지 않도록 input 으로 좁힌다.
  const field = (label: string) => page.locator("input").and(page.getByLabel(label));
  await field("측정일").fill(values.measuredOn);
  await field("키").fill(values.heightCm);
  await field("몸무게").fill(values.weightKg);
  await field("머리둘레").fill(values.headCircumferenceCm);
  await page.getByRole("radio", { name: values.posture }).click();
  await page.getByRole("button", { name: "기록 추가" }).click();
}

test.beforeEach(async ({ page }) => {
  await seedProfiles(page, [{ birthDate: BIRTH, dueDate: DUE }]);
  await fixClockKst(page, "2026-06-01T09:00:00");
});

test("state:empty — 기록이 없으면 '아직 기록이 없습니다'가 보이고 entry-form 은 그대로 보인다", async ({ page }) => {
  await page.goto("/dashboard/growth");
  await expect(page.getByRole("status")).toContainText("아직 기록이 없습니다");
  await expect(page.getByLabel("측정일")).toBeVisible();
});

test("PC-F8-AC1 — 재태 32주 아이는 측정일의 교정 나이(교정 1개월 기준)로 계산된다", async ({ page }) => {
  await page.goto("/dashboard/growth");
  await fillGrowthForm(page, {
    measuredOn: "2026-06-01",
    heightCm: "54.7",
    weightKg: "4.47",
    headCircumferenceCm: "37.3",
    posture: "누워서",
  });
  const row = page.getByRole("row").filter({ hasText: "2026-06-01" });
  await expect(row).toContainText("교정 1개월 기준");
});

test("PC-F8-AC2 — 백분위이 3 미만이거나 97 초과면 '소아청소년과 상담을 권합니다'가 보인다", async ({ page }) => {
  await page.goto("/dashboard/growth");
  // 남아 교정 1개월 키 LMS: M=54.7244, S=0.0356 → Z=-2 지점의 키는 약 50.83cm(백분위 2.3, 3 미만).
  await fillGrowthForm(page, {
    measuredOn: "2026-06-01",
    heightCm: "50.8",
    weightKg: "4.47",
    headCircumferenceCm: "37.3",
    posture: "서서",
  });
  await expect(page.getByText("소아청소년과 상담을 권합니다")).toBeVisible();
});

test("PC-F8-AC5 · EX1 — 측정일이 예정일보다 앞서면 백분위 대신 안내 문구가 보이고, 기록은 저장된다", async ({ page }) => {
  await page.goto("/dashboard/growth");
  await fillGrowthForm(page, {
    measuredOn: "2026-04-25", // DUE(2026-04-26) 하루 전
    heightCm: "45",
    weightKg: "2.0",
    headCircumferenceCm: "30",
    posture: "누워서",
  });
  await expect(page.getByText("이 시기는 백분위를 표시하지 않습니다")).toBeVisible();

  // 새로 열어도 기록이 유지된다(측정값 자체를 저장 없이 버리지 않는다).
  await page.reload();
  await expect(page.getByText("이 시기는 백분위를 표시하지 않습니다")).toBeVisible();
  await expect(page.getByRole("row").filter({ hasText: "2026-04-25" })).toBeVisible();
});

test("PC-NF-A11Y-3 — GrowthEntryForm 다섯 필드 모두 접근 가능한 이름(레이블)이 있다", async ({ page }) => {
  await page.goto("/dashboard/growth");
  await expect(page.getByLabel("측정일")).toBeVisible();
  await expect(page.getByLabel("키")).toBeVisible();
  await expect(page.getByLabel("몸무게")).toBeVisible();
  await expect(page.getByLabel("머리둘레")).toBeVisible();
  await expect(page.getByRole("radiogroup", { name: "측정 자세" })).toBeVisible();
});

test("focus-order — header.back → 측정일 → 키 → 몸무게 → 머리둘레 → 측정자세 → 저장 버튼", async ({ page }) => {
  // `<input type="date">` 는 브라우저마다 내부 세그먼트(월/일/연) Tab 이동 횟수가 달라
  // 실제 키 입력 대신 DOM·tabindex 로 도출한 논리적 순서(focusableTextsInOrder)로 확인한다
  // (design 스펙 growth.md `## a11y` focus-order 그대로).
  await page.goto("/dashboard/growth");
  const names = await focusableTextsInOrder(page);
  expect(names).toEqual(["대시보드", "측정일 *, 필수", "키 *, 필수", "몸무게 *, 필수", "머리둘레 *, 필수", "누워서", "기록 추가"]);
});

test("PC-NF-MED-1 — 화면에 의료 면책 문구가 보인다", async ({ page }) => {
  await page.goto("/dashboard/growth");
  await expect(page.getByText("참고용이며 진단을 대신하지 않음")).toBeVisible();
});

test("PC-F8-AC3 — 기록이 2개 이상이면 지표별 추이 그래프가 측정일 순서로 그려진다", async ({ page }) => {
  await page.goto("/dashboard/growth");
  // 일부러 늦은 날짜를 먼저 넣는다. 그래프는 입력 순서가 아니라 측정일 순서여야 한다.
  await fillGrowthForm(page, {
    measuredOn: "2026-06-01",
    heightCm: "54.7",
    weightKg: "4.47",
    headCircumferenceCm: "37.3",
    posture: "누워서",
  });
  await expect(page.getByText("측정 기록이 1개뿐이라 추이를 보여줄 수 없습니다.", { exact: false }).first()).toBeVisible();
  await expect(page.locator(".pc-growth-trend-chart-canvas")).toHaveCount(0);

  await fillGrowthForm(page, {
    measuredOn: "2026-05-15",
    heightCm: "52.0",
    weightKg: "3.90",
    headCircumferenceCm: "36.0",
    posture: "누워서",
  });

  for (const title of ["키 추이", "몸무게 추이", "머리둘레 추이"]) {
    await expect(page.getByText(title, { exact: false }).first()).toBeVisible();
  }
  const canvases = page.locator(".pc-growth-trend-chart-canvas");
  await expect(canvases).toHaveCount(3);
  await expect(canvases.first().locator(".recharts-line-curve").first()).toBeAttached();
  // 눈금 글자는 X축(측정일)이 먼저, Y축(값)이 뒤에 그려진다. 앞의 두 개가 측정일 순서여야 한다.
  const ticks = canvases.first().locator(".recharts-cartesian-axis-tick-value");
  await expect(ticks.nth(0)).toHaveText("05.15");
  await expect(ticks.nth(1)).toHaveText("06.01");
});

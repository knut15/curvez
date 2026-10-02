// F1 아이 프로필. PC-F1-AC1, AC4, AC5, AC6, EX3 / PC-NF-MOBILE-4(=AC1) / PC-NF-PRIV-3(=AC6)
import { expect, test } from "./support/fixtures";

import { fixClockKst, openHeaderMenu, seedProfiles } from "./support/helpers";

const TODAY = "2026-06-01T09:00:00";
const BIRTH = "2026-03-01";
const DUE = "2026-04-26"; // 32주 0일

test.describe("PC-F1-AC1 · PC-NF-MOBILE-4 — 첫 화면에는 입력칸과 버튼만 보인다", () => {
  test("입력칸 3종(출생일·출산예정일·성별) + 주수전환 + 저장 버튼만 보이고, 그 외 버튼이 없다", async ({
    page,
  }) => {
    await fixClockKst(page, TODAY);
    await page.goto("/");

    await expect(page.getByLabel("출생일")).toBeVisible();
    await expect(page.getByRole("button", { name: "주수로 입력" })).toBeVisible();
    await expect(page.getByLabel("출산 예정일")).toBeVisible();
    await expect(page.getByRole("radiogroup", { name: "성별" })).toBeVisible();
    await expect(page.getByRole("radio", { name: "남아" })).toBeVisible();
    await expect(page.getByRole("radio", { name: "여아" })).toBeVisible();
    await expect(page.getByRole("button", { name: "저장하고 결과 보기" })).toBeVisible();

    // 이름·출생 체중 입력칸은 이 화면에 없다(SPEC: 저장 뒤 프로필 편집에서 입력).
    await expect(page.getByLabel(/이름/)).toHaveCount(0);
    await expect(page.getByLabel(/출생 체중/)).toHaveCount(0);

    // 마케팅 배너·광고가 없다는 것을, 화면의 버튼이 딱 2개(주수 전환 토글 + 저장)뿐인 것으로 확인한다.
    await expect(page.getByRole("button")).toHaveCount(2);
  });
});

test.describe("PC-F1-AC4 — 저장된 프로필이 있으면 입력 없이 대시보드로 간다", () => {
  test("`/` 진입 시 자동으로 /dashboard 로 리다이렉트된다", async ({ page }) => {
    await seedProfiles(page, [{ birthDate: BIRTH, dueDate: DUE }]);
    await fixClockKst(page, TODAY);
    await page.goto("/");
    await page.waitForURL("**/dashboard");
    await expect(page.getByRole("group", { name: "오늘 기준 나이" })).toBeVisible();
  });
});

test.describe("PC-F1-AC5 · PC-F1-EX3 — 아이가 2명 이상이면 전환 탭이 보이고, 이름이 없으면 번호로 보인다", () => {
  test("탭에 '아이 1'·'아이 2'가 보이고, '+ 아이 추가'를 누르면 /?new=1 로 이동해 폼이 보인다(리다이렉트 없음)", async ({
    page,
  }) => {
    await seedProfiles(
      page,
      [
        { id: "child-a", birthDate: BIRTH, dueDate: DUE, name: null },
        { id: "child-b", birthDate: BIRTH, dueDate: DUE, name: null },
      ],
      "child-a",
    );
    await fixClockKst(page, TODAY);
    await page.goto("/dashboard");

    const tablist = page.getByRole("tablist", { name: "아이 선택" });
    await expect(tablist).toBeVisible();
    await expect(page.getByRole("tab", { name: /아이 1/ })).toBeVisible();
    await expect(page.getByRole("tab", { name: /아이 2/ })).toBeVisible();

    await page.getByRole("button", { name: "아이 추가" }).click();
    await page.waitForURL("**/?new=1");
    await expect(page.getByLabel("출생일")).toBeVisible();
  });
});

test.describe("PC-F1-AC6 · PC-NF-PRIV-3 — 정보 전체 삭제", () => {
  test("확인하면 저장된 프로필이 모두 사라지고 첫 화면으로 돌아간다", async ({ page }) => {
    await seedProfiles(page, [{ birthDate: BIRTH, dueDate: DUE }]);
    await fixClockKst(page, TODAY);
    await page.goto("/dashboard");

    // HeaderMenu 도입(5차 디자인 라운드) — "더보기" 를 먼저 열어야 menuitem 이 보인다.
    await openHeaderMenu(page);
    await page.getByRole("menuitem", { name: "정보 전체 삭제" }).click();
    const dialog = page.getByRole("alertdialog");
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "삭제" }).click();

    await page.waitForURL((url) => url.pathname === "/");
    await expect(page.getByLabel("출생일")).toBeVisible();

    const raw = await page.evaluate(() => window.localStorage.getItem("preemie-calc/profiles"));
    expect(raw).toBeNull();
  });
});

test("[curvez-reviewer/ACC-03] '주수로 입력' 전환이 출산 예정일 칸 아래에 있다(boundingBox y 비교)", async ({
  page,
}) => {
  await fixClockKst(page, TODAY);
  await page.goto("/");

  const dueDateBox = await page.getByLabel("출산 예정일").boundingBox();
  const toggleBox = await page.getByRole("button", { name: "주수로 입력" }).boundingBox();
  expect(dueDateBox).not.toBeNull();
  expect(toggleBox).not.toBeNull();
  expect(toggleBox!.y).toBeGreaterThan(dueDateBox!.y);
});

test.describe("[curvez-reviewer/ACC-05] 주수 입력 '일' 칸 범위 밖 값 → '날짜를 확인하세요' + 저장 비활성", () => {
  for (const days of ["9", "-3", "1.5"]) {
    test(`일 칸에 ${days} 를 입력하면 오류 문구가 보이고 저장 버튼이 비활성화된다`, async ({ page }) => {
      await fixClockKst(page, TODAY);
      await page.goto("/");

      await page.getByRole("button", { name: "주수로 입력" }).click();
      await page.getByLabel("출생일").fill(BIRTH);
      await page.getByRole("radio", { name: "남아" }).click();
      await page.getByLabel("주", { exact: true }).fill("32");
      await page.getByLabel("일", { exact: true }).fill(days);

      await expect(page.getByText("날짜를 확인하세요").first()).toBeVisible();
      await expect(page.getByRole("button", { name: "저장하고 결과 보기" })).toBeDisabled();
    });
  }
});

// 비기능: 모바일. PC-NF-MOBILE-1(가로 스크롤 없음), PC-NF-MOBILE-2(본문 17px 이상),
// PC-NF-MOBILE-3(터치 대상 48px 이상), PC-NF-MOBILE-4(=PC-F1-AC1, f1-profile.spec.ts 에 있다).
//
// requirements.md 의 "확인 방법" 칸은 MOBILE-1·2·3 을 "제안: 수동 확인"으로 적었지만, 그 칸
// 자체가 "curvez-qa 가 바꿔도 된다"고 명시했고 이번 라운드 CONTEXT 가 자동 검사 방법을
// 구체적으로 지정했다(360px scrollWidth, computed font-size, boundingBox 높이) — 그 지시를
// 그대로 자동 테스트로 옮긴다.
import { expect, test } from "./support/fixtures";

import { dueDateForGestationDays, fixClockKst, seedProfiles } from "./support/helpers";

const BIRTH = "2026-03-01";
const DUE = "2026-04-26"; // 32주 0일

// --font-size-meta(14px, 출처·기준일·타임스탬프 캡션)만 본문이 아닌 부가 정보로 보고
// 17px 미만을 허용한다 — tokens.md decisions 원문 그대로. 이 값 외의 17px 미만은 위반이다.
const ALLOWED_SMALL_FONT_PX = 14;

async function assertNoHorizontalScroll(page: import("@playwright/test").Page, screen: string) {
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(scrollWidth, `${screen}: document.scrollWidth 가 360 을 넘는다(${scrollWidth})`).toBeLessThanOrEqual(360);
}

async function assertBodyFontSizes(page: import("@playwright/test").Page, screen: string) {
  const violations = await page.evaluate((allowedSmall) => {
    const found: { text: string; fontSize: number }[] = [];
    document.querySelectorAll<HTMLElement>("body *").forEach((el) => {
      const hasDirectText = Array.from(el.childNodes).some(
        (n) => n.nodeType === Node.TEXT_NODE && (n.textContent ?? "").trim().length > 0,
      );
      if (!hasDirectText) return;
      if (el.getAttribute("aria-hidden") === "true") return;
      const fontSize = parseFloat(getComputedStyle(el).fontSize);
      if (fontSize < 17 && fontSize !== allowedSmall) {
        found.push({ text: (el.textContent ?? "").trim().slice(0, 40), fontSize });
      }
    });
    return found;
  }, ALLOWED_SMALL_FONT_PX);

  expect(violations, `${screen}: 17px 미만(14px 캡션 제외) 텍스트 발견 — ${JSON.stringify(violations)}`).toEqual([]);
}

async function assertTouchTargets(page: import("@playwright/test").Page, screen: string) {
  const locator = page.locator('button:visible, a[href]:visible, [role="tab"]:visible, [role="radio"]:visible');
  const count = await locator.count();
  const violations: { text: string; height: number }[] = [];
  for (let i = 0; i < count; i += 1) {
    const el = locator.nth(i);
    const box = await el.boundingBox();
    if (!box) continue;
    if (box.height < 48) {
      violations.push({ text: (await el.textContent())?.trim().slice(0, 30) ?? "", height: box.height });
    }
  }
  expect(violations, `${screen}: 48px 미만 터치 대상 — ${JSON.stringify(violations)}`).toEqual([]);
}

const screens: Array<{ name: string; path: string; seed: boolean }> = [
  { name: "input", path: "/", seed: false },
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
  test(`PC-NF-MOBILE-1·2·3 — ${screen.name} 화면`, async ({ page }) => {
    if (screen.seed) {
      await seedProfiles(page, [{ birthDate: BIRTH, dueDate: DUE }]);
    }
    await fixClockKst(page, "2026-06-01T09:00:00");
    await page.goto(screen.path);
    await assertNoHorizontalScroll(page, screen.name);
    await assertBodyFontSizes(page, screen.name);
    await assertTouchTargets(page, screen.name);
  });
}

// 경계 정각은 보건복지부 원문대로 재태기간이 긴 쪽 구간에 든다(PRD 버전 4 정정, PC-F5-AC7:
// 재태일수 203일 → 5년 3개월, tests/unit/copay-relief.test.ts 참고). 확정된 경계값 화면에서 같은
// 공통 검사를 확인한다.
test("PC-NF-MOBILE-1·2·3 — copay-relief 경계값(재태일수 203일, 5년 3개월 확정)", async ({ page }) => {
  await seedProfiles(page, [{ birthDate: BIRTH, dueDate: dueDateForGestationDays(BIRTH, 203) }]);
  await fixClockKst(page, "2026-06-01T09:00:00");
  await page.goto("/dashboard/copay-relief");
  await expect(page.getByText("5년 3개월")).toBeVisible();
  await assertNoHorizontalScroll(page, "copay-relief(203일 경계)");
  await assertBodyFontSizes(page, "copay-relief(203일 경계)");
  await assertTouchTargets(page, "copay-relief(203일 경계)");
});

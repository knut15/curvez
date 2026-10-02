// 비기능: 접근성. PC-NF-A11Y-1(색만으로 의미 전달 금지), PC-NF-A11Y-2(대비 4.5:1 이상),
// PC-NF-A11Y-3(입력칸마다 접근 가능한 이름).
import type { Page } from "@playwright/test";

import { expect, test } from "./support/fixtures";

import { dueDateForGestationDays, fixClockKst, openHeaderMenu, seedProfiles } from "./support/helpers";

const BIRTH = "2026-03-01";
const DUE = "2026-04-26";

test.beforeEach(async ({ page }) => {
  await fixClockKst(page, "2026-09-15T09:00:00");
});

// 5차 디자인 라운드(curvez-nextjs.20260930-003549.json decisions)부터 상태 기호 문자
// (●✓·△)가 lucide 아이콘(SVG, aria-hidden)으로 바뀌었다. 문자 자체를 찾던 assertion 은
// 더 이상 성립하지 않지만, "색만으로 의미를 전달하지 않는다"는 판정 대상 사실은 그대로다 —
// 라벨 텍스트(이미 존재)에 더해 "아이콘(svg)이 실제로 보인다"를 새 증거로 확인한다.
test("PC-NF-A11Y-1 — 검진 차수 상태(지남/오늘/예정)는 텍스트 라벨과 아이콘을 함께 쓴다", async ({ page }) => {
  await seedProfiles(page, [{ birthDate: BIRTH, dueDate: DUE }]);
  await page.goto("/dashboard/checkups");

  const current = page.getByRole("listitem").filter({ hasText: "2차" });
  await expect(current).toContainText("오늘");
  // StatusBadge 는 라벨 텍스트와 아이콘을 같은 <span> 안에 그린다(icon 은 텍스트 노드가
  // 없다) — getByText(exact) 로 그 span 을 정확히 찾아 svg 존재를 확인한다. CheckupRoundItem
  // 에는 그 외에도 Stethoscope IconBadge 가 있어, listitem 전체가 아니라 라벨이 달린 span
  // 으로 좁혀야 정확히 StatusBadge 의 아이콘을 확인할 수 있다.
  await expect(current.getByText("오늘", { exact: true }).locator("svg")).toBeVisible();

  const past = page.getByRole("listitem").filter({ hasText: "1차" });
  await expect(past).toContainText("지남");
  await expect(past.getByText("지남", { exact: true }).locator("svg")).toBeVisible();

  const upcoming = page.getByRole("listitem").filter({ hasText: "3차" });
  await expect(upcoming).toContainText("예정");
  await expect(upcoming.getByText("예정", { exact: true }).locator("svg")).toBeVisible();
});

test("PC-NF-A11Y-1 — 미확정 표시는 색이 아니라 아이콘 + '미확정' 라벨 + 텍스트로 구분된다", async ({ page }) => {
  await seedProfiles(page, [{ birthDate: BIRTH, dueDate: dueDateForGestationDays(BIRTH, 203) }]);
  await page.goto("/dashboard/copay-relief");

  const notice = page.getByRole("note");
  await expect(notice).toBeVisible();
  await expect(notice).toContainText("미확정");
  // UnconfirmedNotice 는 AlertTriangle 아이콘(svg, aria-hidden)을 텍스트와 별도로 그린다.
  await expect(notice.locator("svg")).toBeVisible();
});

test("PC-NF-A11Y-1 — 성별 선택 항목은 선택되면 색뿐 아니라 아이콘으로도 구분된다", async ({ page }) => {
  await page.goto("/");
  const maleRadio = page.getByRole("radio").filter({ hasText: "남아" });
  await expect(maleRadio.locator("svg")).toHaveCount(0);
  await maleRadio.click();
  await expect(maleRadio).toHaveAttribute("aria-checked", "true");
  // SegmentedControl 은 선택된 옵션에만 Check 아이콘(svg)을 그린다 — aria-checked(속성)와
  // 별도로, 시각적으로도 색이 아닌 아이콘 유무로 선택 여부가 구분된다는 사실을 확인한다.
  await expect(maleRadio.locator("svg")).toBeVisible();
});

test("PC-NF-A11Y-3 — 입력칸마다 접근 가능한 이름(레이블)이 있다", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByLabel("출생일")).toBeVisible();
  await expect(page.getByLabel("출산 예정일")).toBeVisible();
  await expect(page.getByRole("radiogroup", { name: "성별" })).toBeVisible();

  await page.getByRole("button", { name: "주수로 입력" }).click();
  await expect(page.getByLabel("주", { exact: true })).toBeVisible();
  await expect(page.getByRole("spinbutton", { name: "일" })).toBeVisible();

  await seedProfiles(page, [{ birthDate: BIRTH, dueDate: DUE }]);
  await page.goto("/dashboard");
  // HeaderMenu 도입(5차 디자인 라운드) — "더보기" 를 먼저 열어야 menuitem 이 보인다.
  await openHeaderMenu(page);
  await page.getByRole("menuitem", { name: "프로필 편집" }).click();
  await expect(page.getByLabel(/이름/)).toBeVisible();
  await expect(page.getByLabel(/출생 체중/)).toBeVisible();
});

test("PC-NF-A11Y-3 — growth·target-height·formula 입력칸마다 접근 가능한 이름이 있다(8차 라운드)", async ({
  page,
}) => {
  await seedProfiles(page, [{ birthDate: BIRTH, dueDate: DUE }]);

  await page.goto("/dashboard/growth");
  await expect(page.getByLabel("측정일")).toBeVisible();
  await expect(page.getByLabel("키")).toBeVisible();
  await expect(page.getByLabel("몸무게")).toBeVisible();
  await expect(page.getByLabel("머리둘레")).toBeVisible();
  await expect(page.getByRole("radiogroup", { name: "측정 자세" })).toBeVisible();

  await page.goto("/dashboard/target-height");
  await expect(page.getByLabel("아빠 키")).toBeVisible();
  await expect(page.getByLabel("엄마 키")).toBeVisible();

  await page.goto("/dashboard/formula");
  await expect(page.getByLabel("체중")).toBeVisible();
});

async function collectContrastViolations(page: Page) {
  return page.evaluate(() => {
    type Rgba = { r: number; g: number; b: number; a: number };
    function parseRgba(str: string): Rgba | null {
      const m = str.match(/rgba?\(([^)]+)\)/);
      if (!m) return null;
      const p = m[1].split(",").map((s) => parseFloat(s.trim()));
      return { r: p[0] ?? 0, g: p[1] ?? 0, b: p[2] ?? 0, a: p[3] === undefined ? 1 : p[3] };
    }
    function luminance({ r, g, b }: Rgba): number {
      const ch = [r, g, b].map((v) => {
        const c = v / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return ch[0] * 0.2126 + ch[1] * 0.7152 + ch[2] * 0.0722;
    }
    function ratio(fg: Rgba, bg: Rgba): number {
      const l1 = luminance(fg) + 0.05;
      const l2 = luminance(bg) + 0.05;
      return l1 > l2 ? l1 / l2 : l2 / l1;
    }
    function effectiveBg(el: Element): Rgba {
      let node: Element | null = el;
      while (node) {
        const bg = parseRgba(getComputedStyle(node).backgroundColor);
        if (bg && bg.a > 0.01) return bg;
        node = node.parentElement;
      }
      return { r: 255, g: 255, b: 255, a: 1 };
    }
    const violations: { text: string; ratio: number }[] = [];
    document.querySelectorAll<HTMLElement>("body *").forEach((el) => {
      const hasDirectText = Array.from(el.childNodes).some(
        (n) => n.nodeType === Node.TEXT_NODE && (n.textContent ?? "").trim().length > 0,
      );
      if (!hasDirectText) return;
      if (el.getAttribute("aria-hidden") === "true") return;
      // 비활성 요소는 WCAG 1.4.11 예외(tokens.md decisions, --color-text-disabled 대상).
      if (el.hasAttribute("disabled") || el.getAttribute("aria-disabled") === "true") return;
      const fg = parseRgba(getComputedStyle(el).color);
      if (!fg) return;
      const bg = effectiveBg(el);
      const r = ratio(fg, bg);
      if (r < 4.5) {
        violations.push({ text: (el.textContent ?? "").trim().slice(0, 40), ratio: Math.round(r * 100) / 100 });
      }
    });
    return violations;
  });
}

const contrastScreens: Array<{ name: string; path: string; seed: boolean }> = [
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

for (const screen of contrastScreens) {
  test(`PC-NF-A11Y-2 — ${screen.name} 화면의 주요 텍스트 대비가 4.5:1 이상이다`, async ({ page }) => {
    if (screen.seed) {
      await seedProfiles(page, [{ birthDate: BIRTH, dueDate: DUE }]);
    }
    await page.goto(screen.path);
    const violations = await collectContrastViolations(page);
    expect(violations, `${screen.name}: 대비 4.5 미만 요소 — ${JSON.stringify(violations)}`).toEqual([]);
  });
}

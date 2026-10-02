// 디자인 재구성 전후(before/after) 비교용 화면 캡처. AC 검증 스펙이 아니라 스크린샷 도구다.
// 기본 `pnpm test:e2e` 에는 잡히지 않는다 — playwright.config.ts 의 "capture" project(테스트가
// CURVEZ_CAPTURE 환경변수가 있을 때만 등록된다)의 testDir 이 이 폴더만 가리킨다.
//
// 실행 방법: .curvez/qa/preemie-calc/screens/README.md
import * as fs from "node:fs";
import * as path from "node:path";

import type { Page } from "@playwright/test";

import { expect, test } from "../e2e/support/fixtures";
import { fixClockKst, seedProfiles } from "../e2e/support/helpers";

// 스위트 전역에서 쓰는 기준 예시 프로필과 동일(출생 2026-03-01, 예정일 2026-04-26 = 32주 0일,
// 이름 "하늘"). 시계는 2026-06-01 KST 로 고정한다(GOAL 지정).
const CLOCK = "2026-06-01T09:00:00";
const BIRTH = "2026-03-01";
const DUE = "2026-04-26";

type ScreenCapture = {
  /** 파일명 접두어: <slug>-<width>.png */
  slug: string;
  path: string;
  /** page.goto 전에 localStorage·프로필을 채운다(필요할 때만). */
  setup?: (page: Page) => Promise<void>;
  /** 화면이 완전히 그려졌다고 볼 수 있는 관찰 지점. 스크린샷 직전에 기다린다. */
  ready: (page: Page) => Promise<void>;
};

const SCREENS: ScreenCapture[] = [
  {
    slug: "root",
    path: "/",
    async ready(page) {
      await expect(page.getByLabel("출생일")).toBeVisible();
    },
  },
  {
    slug: "root-weeks-32",
    path: "/?weeks=32",
    async ready(page) {
      await expect(page.getByLabel("주", { exact: true })).toBeVisible();
    },
  },
  {
    slug: "dashboard",
    path: "/dashboard",
    async setup(page) {
      await seedProfiles(page, [{ birthDate: BIRTH, dueDate: DUE, name: "하늘" }]);
    },
    async ready(page) {
      await expect(page.getByRole("group", { name: "오늘 기준 나이" })).toBeVisible();
    },
  },
  {
    slug: "dashboard-age-basis",
    path: "/dashboard/age-basis",
    async setup(page) {
      await seedProfiles(page, [{ birthDate: BIRTH, dueDate: DUE, name: "하늘" }]);
    },
    async ready(page) {
      await expect(page.getByRole("listitem").filter({ hasText: "예방접종" })).toBeVisible();
    },
  },
  {
    slug: "dashboard-checkups",
    path: "/dashboard/checkups",
    async setup(page) {
      await seedProfiles(page, [{ birthDate: BIRTH, dueDate: DUE, name: "하늘" }]);
    },
    async ready(page) {
      await expect(page.getByRole("listitem").first()).toBeVisible();
    },
  },
  {
    slug: "dashboard-copay-relief",
    path: "/dashboard/copay-relief",
    async setup(page) {
      await seedProfiles(page, [{ birthDate: BIRTH, dueDate: DUE, name: "하늘" }]);
    },
    async ready(page) {
      // 32주 0일 → "5년 3개월" 구간(PC-F5-AC1 과 동일 기준 프로필).
      await expect(page.getByText("5년 3개월")).toBeVisible();
    },
  },
  {
    slug: "dashboard-correction-period",
    path: "/dashboard/correction-period",
    async setup(page) {
      await seedProfiles(page, [{ birthDate: BIRTH, dueDate: DUE, name: "하늘" }]);
    },
    async ready(page) {
      // 32주 0일·체중 미입력 → "24개월까지"(PC-F6-AC1 과 동일 기준 프로필).
      await expect(page.getByText("24개월까지", { exact: true })).toBeVisible();
    },
  },
  {
    slug: "share",
    path: "/share#b=2026-03-01&d=2026-04-26",
    // 다른 기기에서 링크를 받는 시나리오(PC-F7-AC2)와 동일하게 localStorage 를 채우지 않는다.
    async ready(page) {
      await expect(page.getByRole("group", { name: "오늘 기준 나이" })).toBeVisible();
    },
  },
  {
    slug: "guide-32-3",
    path: "/guide/32/3",
    async ready(page) {
      await expect(page.getByRole("heading", { name: "32주 출생, 생후 3개월" })).toBeVisible();
    },
  },
  {
    slug: "dashboard-2children",
    path: "/dashboard",
    async setup(page) {
      await seedProfiles(
        page,
        [
          { id: "capture-child-a", birthDate: BIRTH, dueDate: DUE, name: null },
          { id: "capture-child-b", birthDate: BIRTH, dueDate: DUE, name: null },
        ],
        "capture-child-a",
      );
    },
    async ready(page) {
      await expect(page.getByRole("tablist", { name: "아이 선택" })).toBeVisible();
      await expect(page.getByRole("group", { name: "오늘 기준 나이" })).toBeVisible();
    },
  },
];

const WIDTHS = [360, 1280] as const;

// tests/capture -> tests -> preemie-calc -> apps -> (워크트리 루트)
const OUT_DIR = path.resolve(
  __dirname,
  "..",
  "..",
  "..",
  "..",
  ".curvez",
  "qa",
  "preemie-calc",
  "screens",
  process.env.CURVEZ_CAPTURE_DIR ?? "before",
);

test.beforeAll(() => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
});

for (const screen of SCREENS) {
  for (const width of WIDTHS) {
    test(`capture ${screen.slug} @ ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await fixClockKst(page, CLOCK);
      if (screen.setup) await screen.setup(page);
      await page.goto(screen.path);
      await screen.ready(page);
      await page.screenshot({
        path: path.join(OUT_DIR, `${screen.slug}-${width}.png`),
        fullPage: true,
      });
    });
  }
}

// [8차 라운드] 본문 폭 통일 실측(curvez-nextjs.20260930-105749.json 대응).
// 스펙: .curvez/design/preemie-calc/tokens.md `## 레이아웃` `--layout-content-max`(720px,
// 7차 라운드 결정) — "9개 화면 전부가 쓰는 유일한 본문 콘텐츠 최대 폭". 헤더 내부 3분할
// 그리드도 같은 값을 쓴다.
//
// 측정 대상 판단(GOAL 지시 "클래스 이름에 기대지 말고 실제 main 콘텐츠 영역의 boundingBox 로
// 재는 편이 좋다"): globals.css 맨 위 `@import "tailwindcss"` 가 Tailwind preflight(전역
// `*, ::before, ::after { box-sizing: border-box }`)를 들여온다(실측:
// node_modules/tailwindcss@4.3.3 의 preflight.css:12). border-box 에서는 `max-width`가
// padding 을 포함한 렌더 박스 자체의 상한이라 `getBoundingClientRect()`(Playwright
// `boundingBox()`)가 곧 그 값이다 — 720px 은 "패딩을 뺀 순수 콘텐츠 폭"이 아니라 "렌더 박스
// 폭의 상한" 이다. 그래서 padding 을 따로 빼지 않고 boundingBox 를 그대로 쓴다(1280px 에서
// 직접 실측해 720.00 을 확인했다 — 아래 실행 로그 참고). 클래스 이름에는 기대지 않고 구조로
// 대상을 잡는다:
//   - 헤더 안쪽 그리드: `role=banner` 의 첫(유일한) 자식 div — PageHeader.tsx 의 모든
//     variant(title-only/back/dashboard)가 같은 구조(header > div 하나)를 쓴다.
//   - 본문 컨테이너: `role=main` 의 마지막 자식 div — 다이얼로그(ConfirmDialog 계열)는
//     `<dialog>` 태그라 이 선택에 걸리지 않는다. 화면마다 그 div 의 클래스 이름은 다르지만
//     (pc-dashboard-content, pc-content-narrow, pc-content-guide 등) "main 의 마지막 div
//     자식"이라는 구조는 9개 화면 전부 동일하다.
import type { Page } from "@playwright/test";

import { expect, test } from "./support/fixtures";

import { fixClockKst, seedProfiles } from "./support/helpers";

const CLOCK = "2026-06-01T09:00:00";
const BIRTH = "2026-03-01";
const DUE = "2026-04-26"; // 32주 0일

type ContentWidthScreen = {
  /** .curvez/design/preemie-calc/screens/<name>.md 대응. */
  name: string;
  path: string;
  setup?: (page: Page) => Promise<void>;
  ready: (page: Page) => Promise<void>;
};

// 디자인 스펙 screens/ 9개 화면 전부(nf-header-layout.spec.ts HEADER_SCREENS 와 동일 — 화면
// 정의를 공유 모듈로 뽑는 대신 그대로 옮겼다. 이유: 이 파일이 검증하는 사실(콘텐츠 폭 실측)과
// 그 파일이 검증하는 사실(헤더 가운데 정렬)은 서로 다르고, 공유 모듈을 만들면 한쪽 수정이
// 의도치 않게 다른 쪽 setup/ready 조건을 바꿀 위험이 생긴다).
const CONTENT_SCREENS: ContentWidthScreen[] = [
  {
    name: "input",
    path: "/",
    async ready(page) {
      await expect(page.getByLabel("출생일")).toBeVisible();
    },
  },
  {
    name: "input-weeks",
    path: "/?weeks=32",
    async ready(page) {
      await expect(page.getByLabel("주", { exact: true })).toBeVisible();
    },
  },
  {
    name: "dashboard",
    path: "/dashboard",
    async setup(page) {
      await seedProfiles(page, [{ birthDate: BIRTH, dueDate: DUE }]);
    },
    async ready(page) {
      await expect(page.getByRole("group", { name: "오늘 기준 나이" })).toBeVisible();
    },
  },
  {
    name: "age-basis",
    path: "/dashboard/age-basis",
    async setup(page) {
      await seedProfiles(page, [{ birthDate: BIRTH, dueDate: DUE }]);
    },
    async ready(page) {
      await expect(page.getByRole("listitem").filter({ hasText: "예방접종" })).toBeVisible();
    },
  },
  {
    name: "checkups",
    path: "/dashboard/checkups",
    async setup(page) {
      await seedProfiles(page, [{ birthDate: BIRTH, dueDate: DUE }]);
    },
    async ready(page) {
      await expect(page.getByRole("listitem").first()).toBeVisible();
    },
  },
  {
    name: "copay-relief",
    path: "/dashboard/copay-relief",
    async setup(page) {
      await seedProfiles(page, [{ birthDate: BIRTH, dueDate: DUE }]);
    },
    async ready(page) {
      await expect(page.getByText("5년 3개월")).toBeVisible();
    },
  },
  {
    name: "correction-period",
    path: "/dashboard/correction-period",
    async setup(page) {
      await seedProfiles(page, [{ birthDate: BIRTH, dueDate: DUE }]);
    },
    async ready(page) {
      await expect(page.getByText("24개월까지", { exact: true })).toBeVisible();
    },
  },
  {
    name: "share",
    path: "/share#b=2026-03-01&d=2026-04-26",
    async ready(page) {
      await expect(page.getByRole("group", { name: "오늘 기준 나이" })).toBeVisible();
    },
  },
  {
    name: "guide",
    path: "/guide/32/3",
    async ready(page) {
      await expect(page.getByRole("heading", { name: "32주 출생, 생후 3개월" })).toBeVisible();
    },
  },
  {
    name: "growth",
    path: "/dashboard/growth",
    async setup(page) {
      await seedProfiles(page, [{ birthDate: BIRTH, dueDate: DUE }]);
    },
    async ready(page) {
      await expect(page.getByLabel("측정일")).toBeVisible();
    },
  },
  {
    name: "vaccinations",
    path: "/dashboard/vaccinations",
    async setup(page) {
      await seedProfiles(page, [{ birthDate: BIRTH, dueDate: DUE }]);
    },
    async ready(page) {
      await expect(page.getByRole("listitem").first()).toBeVisible();
    },
  },
  {
    name: "target-height",
    path: "/dashboard/target-height",
    async setup(page) {
      await seedProfiles(page, [{ birthDate: BIRTH, dueDate: DUE }]);
    },
    async ready(page) {
      await expect(page.getByLabel("아빠 키")).toBeVisible();
    },
  },
  {
    name: "formula",
    path: "/dashboard/formula",
    async setup(page) {
      await seedProfiles(page, [{ birthDate: BIRTH, dueDate: DUE }]);
    },
    async ready(page) {
      await expect(page.getByLabel("체중")).toBeVisible();
    },
  },
];

const WIDTHS = [360, 768, 1280] as const;
const TOLERANCE_PX = 0.5;

// 8차 라운드(글 영역 720px · 박스 784px 명문화, tokens.md `## 레이아웃`): .pc-content-max 가
// box-sizing:content-box 로 바뀌면서 boundingBox(렌더 박스, "박스 폭")는 더 이상 720px 이
// 아니다 — 글 영역(content-box 의 content, "박스 - 좌우 패딩")이 720px 이고 그 바깥에 패딩이
// 더해진 값이 박스 폭이다. 그래서 이 스펙은 박스 폭과 별개로 글 영역 폭(contentWidth)을
// getComputedStyle 의 padding 값으로 역산해 따로 잰다.
const EXPECTED_CONTENT_WIDTH = 720; // 768px·1280px 모두 이 값에서 더 넓어지지 않는다(캡 폭).
const EXPECTED_BOX_WIDTH_TABLET = 752; // 720 + --space-4(16px) × 2
const EXPECTED_BOX_WIDTH_DESKTOP = 784; // 720 + --space-6(32px) × 2

type ContentBox = { x: number; width: number; contentWidth: number };

async function measureBox(locator: ReturnType<Page["locator"]>): Promise<ContentBox> {
  const box = await locator.boundingBox();
  if (!box) throw new Error("boundingBox 를 못 얻었다");
  const paddingX = await locator.evaluate((el) => {
    const style = getComputedStyle(el);
    return parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
  });
  return { x: box.x, width: box.width, contentWidth: box.width - paddingX };
}

async function measureScreen(
  page: Page,
  width: number,
  screen: ContentWidthScreen,
): Promise<{ header: ContentBox; body: ContentBox }> {
  await page.setViewportSize({ width, height: 1400 });
  await fixClockKst(page, CLOCK);
  if (screen.setup) await screen.setup(page);
  await page.goto(screen.path);
  await screen.ready(page);

  const headerGrid = page.getByRole("banner").locator(":scope > div").first();
  const bodyContainer = page.getByRole("main").locator(":scope > div").last();

  const header = await measureBox(headerGrid);
  const body = await measureBox(bodyContainer);

  return { header, body };
}

for (const width of WIDTHS) {
  test(`[디자인 재구성 8차] ${width}px 에서 13개 화면의 본문·헤더 글 영역 폭이 모두 같다`, async ({ page }) => {
    const rows: Array<{ name: string; header: ContentBox; body: ContentBox }> = [];
    for (const screen of CONTENT_SCREENS) {
      const { header, body } = await measureScreen(page, width, screen);
      rows.push({ name: screen.name, header, body });
    }

    // 실측 표를 테스트 출력(stdout)에 남긴다 — 핸드오프 verification·ac-matrix 의 "글 영역
    // 실측 표"가 이 로그를 그대로 옮겨 적는다.
    console.log(
      `[nf-content-width] width=${width}px\n` +
        rows
          .map(
            (r) =>
              `  ${r.name.padEnd(18)} header.x=${r.header.x.toFixed(2)} header.box=${r.header.width.toFixed(2)} header.content=${r.header.contentWidth.toFixed(2)}` +
              ` body.x=${r.body.x.toFixed(2)} body.box=${r.body.width.toFixed(2)} body.content=${r.body.contentWidth.toFixed(2)}`,
          )
          .join("\n"),
    );

    const reference = rows[0];

    for (const row of rows) {
      // 같은 화면 안에서도 헤더 안쪽 그리드와 본문 컨테이너의 글 영역 에지·폭이 같아야 한다
      // (둘 다 같은 --layout-content-max·좌우 패딩 구간을 쓴다).
      expect(
        Math.abs(row.header.x - row.body.x),
        `${row.name}@${width}px: header.x=${row.header.x}, body.x=${row.body.x} — 헤더·본문 좌측이 달라졌다`,
      ).toBeLessThanOrEqual(TOLERANCE_PX);
      expect(
        Math.abs(row.header.contentWidth - row.body.contentWidth),
        `${row.name}@${width}px: header.content=${row.header.contentWidth}, body.content=${row.body.contentWidth} — 헤더·본문 글 영역 폭이 달라졌다`,
      ).toBeLessThanOrEqual(TOLERANCE_PX);

      // 화면 간 비교: 첫 화면(input)을 기준으로 나머지 12개 화면의 글 영역 에지·폭이 같아야
      // 한다("화면을 옮겨도 좌우 기준선이 바뀌지 않는다").
      expect(
        Math.abs(row.body.x - reference.body.x),
        `${row.name}@${width}px: body.x=${row.body.x}, 기준(${reference.name}).x=${reference.body.x} — 화면마다 좌측 기준선이 다르다`,
      ).toBeLessThanOrEqual(TOLERANCE_PX);
      expect(
        Math.abs(row.body.contentWidth - reference.body.contentWidth),
        `${row.name}@${width}px: body.content=${row.body.contentWidth}, 기준(${reference.name}).content=${reference.body.contentWidth} — 화면마다 글 영역 폭이 다르다`,
      ).toBeLessThanOrEqual(TOLERANCE_PX);
    }

    if (width === 768 || width === 1280) {
      const expectedBox = width === 768 ? EXPECTED_BOX_WIDTH_TABLET : EXPECTED_BOX_WIDTH_DESKTOP;
      for (const row of rows) {
        expect(
          row.body.contentWidth,
          `${row.name}@${width}px: body.content=${row.body.contentWidth} — 글 영역은 720px 이어야 한다(--layout-content-max)`,
        ).toBeCloseTo(EXPECTED_CONTENT_WIDTH, 0);
        expect(
          row.header.contentWidth,
          `${row.name}@${width}px: header.content=${row.header.contentWidth} — 글 영역은 720px 이어야 한다(--layout-content-max)`,
        ).toBeCloseTo(EXPECTED_CONTENT_WIDTH, 0);
        expect(
          row.body.width,
          `${row.name}@${width}px: body.box=${row.body.width} — 박스 폭은 ${expectedBox}px 이어야 한다(720 + 좌우 패딩)`,
        ).toBeCloseTo(expectedBox, 0);
      }
    }

    if (width === 360) {
      // 360px 은 720에 닿지 않는다 — 글 영역이 뷰포트 폭 그대로 찬다(뷰포트-좌우 --space-4).
      for (const row of rows) {
        expect(
          row.body.width,
          `${row.name}@360px: body.box=${row.body.width} — 뷰포트 폭(360) 그대로여야 한다`,
        ).toBeCloseTo(360, 0);
        expect(
          row.body.contentWidth,
          `${row.name}@360px: body.content=${row.body.contentWidth} — 360 - 좌우 --space-4(16×2)=328 이어야 한다`,
        ).toBeCloseTo(328, 0);
      }
    }
  });
}

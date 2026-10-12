// [디자인 재구성 5차 라운드] 헤더 제목 가운데 정렬 + 대시보드 2열 레이아웃.
// AC-ID 가 아니라 이번 라운드 GOAL "새로 확인할 것" (1)(2)에 대응한다.
// 스펙: .curvez/design/preemie-calc/components/PageHeader.md ## 레이아웃
//   "제목은 모든 variant, 모든 화면 폭에서 항상 헤더 정중앙에 온다" —
//   `minmax(--layout-header-side-reserve, 1fr) auto minmax(...)` 3분할 그리드로 좌/우 zone 을
//   같은 최소 폭(112px)으로 예약해, 콘텐츠 유무와 무관하게 제목이 기하학적 정중앙에 오게 한다.
// 스펙: .curvez/design/preemie-calc/screens/dashboard.md ## responsive
//   ">=1280px(데스크톱): ... content 를 grid-template-columns: minmax(0,1fr) 360px 로 2열 나눈다"
//
// [6차 라운드, DSG-05 수정 대응] curvez-nextjs.20260930-010104.json 이 /guide 의 h1 중복을
// PageHeader.headingLevel(기본 1, guide 에서만 2)로 고치면서 헤더 제목이 guide 페이지에서
// 더 이상 h1 이 아니라 h2 가 됐다. "헤더 제목 가운데 정렬" 테스트의 로케이터
// `getByRole('banner').getByRole('heading',{level:1})`가 guide@360/768/1280 3건에서 못 찾아
// 깨졌다(nextjs decisions "QA 갱신 필요" 참고). 헤더 제목은 이제 "banner 안의
// heading(레벨 무관)"으로 잡는다 — PageHeader.md 스펙은 헤더 제목이 h1 이라고 못박지 않고
// "제목"이라고만 하므로 레벨 무관 선택이 스펙과 어긋나지 않는다. 대신 판정을 약하게 하지
// 않기 위해 "페이지 전체의 h1 개수 = 1"을 모든 화면·모든 폭에서 새 단언으로 더했다 —
// 레벨 무관 선택으로 느슨해진 만큼을 이 단언이 메운다(guide 의 h1 중복 자체를 이제
// 실패로 잡을 수 있다).
//
// [6차 라운드, 겹침 실측 추가] 5차 라운드의 가운데 정렬 테스트는 중심 좌표만 재서
// DSG-05(360px 에서 제목이 뒤로가기 버튼과 20.5px 겹침)를 놓쳤다 — 중심이 같아도 박스 폭이
// 넓으면 좌우 zone 을 침범할 수 있기 때문이다. 아래 두 번째 test.describe 는 9개 화면 ×
// 360/390/768/1280px 에서 제목 box 와 banner 안 좌우 버튼·링크(back 버튼, HeaderMenu 트리거
// "더보기") box 의 가로 겹침이 0px(허용 오차 0.5px)인지 직접 잰다. 제목이 2줄로 줄바꿈되는
// 화면(예: correction-period @360px)에서 글자가 잘리지 않았는지(scrollHeight ≤
// clientHeight+1)도 모든 조합에서 함께 확인한다.
import type { Page } from "@playwright/test";

import { expect, test } from "./support/fixtures";

import { fixClockKst, seedProfiles } from "./support/helpers";

const CLOCK = "2026-06-01T09:00:00";
const BIRTH = "2026-03-01";
const DUE = "2026-04-26"; // 32주 0일

type HeaderScreen = {
  /** .curvez/design/preemie-calc/screens/<name>.md 대응. */
  name: string;
  path: string;
  setup?: (page: Page) => Promise<void>;
  ready: (page: Page) => Promise<void>;
};

// 디자인 스펙 screens/ 9개 화면 전부(PageHeader.md "쓰이는 화면" 목록과 정확히 대응).
const HEADER_SCREENS: HeaderScreen[] = [
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
      // [6차 라운드] GuideView 는 본문에 <h1>(SEO 콘텐츠 제목, content.heading)을 따로 그리고,
      // PageHeader 는 headingLevel=2 로 h2(사이트 이름)를 그린다 — 페이지당 h1 하나를 지키기
      // 위한 구조다(curvez-nextjs.20260930-010104.json). 정중앙 정렬을 재는 대상은 항상
      // header 안의 heading(role=banner 하위, 레벨 무관) 이다.
      await expect(page.getByRole("heading", { name: "32주 출생, 생후 3개월" })).toBeVisible();
    },
  },
];

const WIDTHS = [360, 768, 1280] as const;
const CENTER_TOLERANCE_PX = 2;

for (const screen of HEADER_SCREENS) {
  for (const width of WIDTHS) {
    test(`[디자인 재구성] 헤더 제목 가운데 정렬 — ${screen.name} @ ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await fixClockKst(page, CLOCK);
      if (screen.setup) await screen.setup(page);
      await page.goto(screen.path);
      await screen.ready(page);

      // [6차 라운드] guide 는 headingLevel=2 로 헤더 제목이 h2 다 — 레벨을 못박지 않고
      // "banner 안의 heading" 으로만 잡는다(banner 안 heading 은 항상 정확히 1개).
      const title = page.getByRole("banner").getByRole("heading");
      const box = await title.boundingBox();
      expect(box, `${screen.name}@${width}: 헤더 제목 boundingBox 를 못 얻었다`).not.toBeNull();

      const titleCenterX = box!.x + box!.width / 2;
      const viewportCenterX = width / 2;
      const diff = Math.round(Math.abs(titleCenterX - viewportCenterX) * 100) / 100;

      expect(
        diff,
        `${screen.name}@${width}px: 제목 중심 x=${titleCenterX}, 뷰포트 중심 x=${viewportCenterX}, 차이=${diff}px`,
      ).toBeLessThanOrEqual(CENTER_TOLERANCE_PX);

      // [6차 라운드, 새 단언] 헤더 제목을 레벨 무관으로 잡은 만큼, 페이지 전체의 h1 이
      // 정확히 1개인지(시맨틱 헤딩 구조, guide 의 h1 중복 재발 방지)를 새로 확인한다.
      const h1Count = await page.locator("h1").count();
      expect(h1Count, `${screen.name}@${width}px: 페이지의 h1 개수=${h1Count} (기대: 1)`).toBe(1);
    });
  }
}

const OVERLAP_WIDTHS = [360, 390, 768, 1280] as const;
const OVERLAP_TOLERANCE_PX = 0.5;

for (const screen of HEADER_SCREENS) {
  for (const width of OVERLAP_WIDTHS) {
    test(`[디자인 재구성, DSG-05 회귀] 헤더 제목-좌우 버튼 겹침 없음 — ${screen.name} @ ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await fixClockKst(page, CLOCK);
      if (screen.setup) await screen.setup(page);
      await page.goto(screen.path);
      await screen.ready(page);

      const banner = page.getByRole("banner");
      const title = banner.getByRole("heading");
      const titleBox = await title.boundingBox();
      expect(titleBox, `${screen.name}@${width}: 헤더 제목 boundingBox 를 못 얻었다`).not.toBeNull();

      // banner 안의 버튼·링크만 대상으로 한다 — 장식 아이콘(IconBadge, aria-hidden)은
      // 시각적으로 겹쳐도 상호작용 요소를 가리지 않아 DSG-05 재발과 무관하다.
      const interactive = banner.locator("button, a[href]");
      const interactiveCount = await interactive.count();

      for (let i = 0; i < interactiveCount; i += 1) {
        const elBox = await interactive.nth(i).boundingBox();
        if (!elBox) continue;

        const overlapLeft = Math.max(titleBox!.x, elBox.x);
        const overlapRight = Math.min(titleBox!.x + titleBox!.width, elBox.x + elBox.width);
        const overlapPx = Math.round(Math.max(0, overlapRight - overlapLeft) * 100) / 100;

        expect(
          overlapPx,
          `${screen.name}@${width}px: 제목 box=[${titleBox!.x},${titleBox!.x + titleBox!.width}], ` +
            `버튼/링크 #${i} box=[${elBox.x},${elBox.x + elBox.width}], 겹침=${overlapPx}px`,
        ).toBeLessThanOrEqual(OVERLAP_TOLERANCE_PX);
      }

      // title-only variant(input, input-weeks, share, guide)는 banner 에 버튼·링크가 없어
      // interactiveCount 가 0 일 수 있다 — 겹칠 대상 자체가 없으므로 정상이다(반복문이 그냥
      // 돌지 않는다).

      // [6차 라운드] 제목이 2줄로 줄바꿈되는 화면(예: correction-period @360px)에서도 글자가
      // 잘리지 않았는지 모든 조합에서 함께 확인한다(line-clamp:2 가 더 넘치는 텍스트를
      // clientHeight 밖으로 자르지 않는지). 1줄일 때도 scrollHeight ≈ clientHeight 라
      // 이 단언은 모든 화면·폭에서 안전하게 성립한다.
      const { scrollHeight, clientHeight } = await title.evaluate((el) => ({
        scrollHeight: el.scrollHeight,
        clientHeight: el.clientHeight,
      }));
      expect(
        scrollHeight,
        `${screen.name}@${width}px: 제목 scrollHeight=${scrollHeight}, clientHeight=${clientHeight} — 잘림 의심`,
      ).toBeLessThanOrEqual(clientHeight + 1);
    });
  }
}

// [8차 라운드, curvez-nextjs.20260930-105749.json 대응] 대시보드의 main+sidebar 2열 구조
// 자체가 없어졌다(tokens.md 7차 라운드 결정 — 사용자 원문 "가로사이즈는 메인과 서브가
// 동일하게"). 위 두 테스트(main.x/sidebar.x 를 견주던 테스트)는 이제 없는 클래스
// (.pc-dashboard-main·.pc-dashboard-sidebar)를 찾다 타임아웃으로 깨졌다 — 대체 대상이
// 아니라 전제 자체가 사라졌으므로 "같은 사실을 다르게 확인"이 아니라 "새 사실을 확인"으로
// 바꾼다: 나이 카드·바로가기·공유 영역·면책 4개 영역이 모든 폭에서 같은 왼쪽 x(1열)에 있고,
// 세로 순서가 age-summary → quick-links → share-entry → disclaimer 인지 확인한다
// (`.curvez/qa/preemie-calc/test-changes-width-720.md` 참고).
const DASHBOARD_WIDTHS = [360, 768, 1280] as const;
const DASHBOARD_X_TOLERANCE_PX = 0.5;

for (const width of DASHBOARD_WIDTHS) {
  test(`[디자인 재구성 8차] ${width}px 에서 대시보드는 1열이다(나이 카드·바로가기·공유·면책의 왼쪽 x 가 같고 세로 순서가 지켜진다)`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1400 });
    await fixClockKst(page, CLOCK);
    await seedProfiles(page, [{ birthDate: BIRTH, dueDate: DUE }]);
    await page.goto("/dashboard");
    await expect(page.getByRole("group", { name: "오늘 기준 나이" })).toBeVisible();

    const ageSummary = page.getByRole("group", { name: "오늘 기준 나이" });
    // quick-links: 재태 32주 0일(표준 아이)은 4개 항목(교정연령 적용 종료 안내 포함)이 전부
    // 보이므로 그중 항상 첫 번째인 "어느 나이를 쓰나"로 영역을 대표한다.
    const quickLinks = page.getByRole("link", { name: "어느 나이를 쓰나" });
    // share-entry: navigator.share 지원 여부와 무관하게 "링크 복사" 버튼은 항상 보인다
    // (PC-F7-EX1).
    const shareEntry = page.getByRole("button", { name: "링크 복사" });
    const disclaimer = page.getByText("참고용이며 진단을 대신하지 않음");

    const boxes = {
      ageSummary: await ageSummary.boundingBox(),
      quickLinks: await quickLinks.boundingBox(),
      shareEntry: await shareEntry.boundingBox(),
      disclaimer: await disclaimer.boundingBox(),
    };
    for (const [name, box] of Object.entries(boxes)) {
      expect(box, `${width}px: ${name} boundingBox 를 못 얻었다`).not.toBeNull();
    }

    const xs = Object.entries(boxes).map(([name, box]) => [name, box!.x] as const);
    const [, referenceX] = xs[0];
    for (const [name, x] of xs) {
      expect(
        Math.abs(x - referenceX),
        `${width}px: ${name}.x=${x}, 기준(ageSummary).x=${referenceX} — 1열이면 왼쪽 x 가 같아야 한다`,
      ).toBeLessThanOrEqual(DASHBOARD_X_TOLERANCE_PX);
    }

    // 세로 순서: age-summary → quick-links → share-entry → disclaimer.
    expect(
      boxes.quickLinks!.y,
      `${width}px: quick-links.y=${boxes.quickLinks!.y} 가 age-summary.y=${boxes.ageSummary!.y} 보다 아래여야 한다`,
    ).toBeGreaterThan(boxes.ageSummary!.y);
    expect(
      boxes.shareEntry!.y,
      `${width}px: share-entry.y=${boxes.shareEntry!.y} 가 quick-links.y=${boxes.quickLinks!.y} 보다 아래여야 한다`,
    ).toBeGreaterThan(boxes.quickLinks!.y);
    expect(
      boxes.disclaimer!.y,
      `${width}px: disclaimer.y=${boxes.disclaimer!.y} 가 share-entry.y=${boxes.shareEntry!.y} 보다 아래여야 한다`,
    ).toBeGreaterThan(boxes.shareEntry!.y);
  });
}

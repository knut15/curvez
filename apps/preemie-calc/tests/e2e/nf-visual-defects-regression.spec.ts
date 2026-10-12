// [시각 결함 회귀, 7라운드] curvez-nextjs.20260930-012225.json 이 캡처에서 찾은 시각 결함
// 5건을 고쳤다(헤더 제목 음절 중간 줄바꿈, 나이 카드 숫자·단위 조각 끊김, 날짜 끊김,
// "+ 아이 추가" 버튼 라벨 줄바꿈, 1280px 에서 그 버튼이 콘텐츠 영역 밖으로 벗어남). 이 결함들은
// 자동 검사(기존 헤더 정렬·겹침 테스트)가 놓쳤던 것이라 여기서 재발 방지 회귀를 추가한다.
// AC-ID 가 아니라 오케스트레이터 GOAL 의 "회귀 검사로 더할 것 (1)~(5)"에 대응한다.
//
// (5)(제목 잘림 없음)는 이미 `nf-header-layout.spec.ts`의 "[디자인 재구성, DSG-05 회귀]"
// 테스트 그룹이 9개 화면 × 360/390/768/1280px 전부에서 `scrollHeight<=clientHeight+1` 로
// 확인하고 있다 — line-clamp 이 2→3 으로 바뀐 뒤에도 그 단언은 줄 수와 무관하게 그대로
// 유효해(잘림 여부만 본다) 별도로 추가하지 않았다. 상세는 `.curvez/qa/preemie-calc/strategy.md`
// "7라운드" 절 참고.
import type { Page } from "@playwright/test";

import { expect, test } from "./support/fixtures";

import { fixClockKst, seedProfiles } from "./support/helpers";

const CLOCK = "2026-06-01T09:00:00";
const BIRTH = "2026-03-01";
const DUE = "2026-04-26"; // 32주 0일

type Screen = {
  /** .curvez/design/preemie-calc/screens/<name>.md 대응. nf-header-layout.spec.ts 의
   * HEADER_SCREENS 와 같은 9개 화면·같은 setup/ready 정의를 그대로 옮겼다(중복이지만, 두
   * 파일이 서로 다른 관심사를 검증해 한 파일이 다른 파일의 테스트 데이터에 의존하지 않는
   * 편이 더 낫다고 판단했다 — 상세는 strategy.md "7라운드" 절 decisions). */
  name: string;
  path: string;
  setup?: (page: Page) => Promise<void>;
  ready: (page: Page) => Promise<void>;
};

const SCREENS: Screen[] = [
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
];

const WIDTHS = [360, 390, 768, 1280] as const;

type LineWrapViolation = { tag: string; label: string; rects: number };

for (const screen of SCREENS) {
  for (const width of WIDTHS) {
    test(`[시각 결함 회귀] body keep-all + 버튼·링크 라벨 한 줄 — ${screen.name} @ ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await fixClockKst(page, CLOCK);
      if (screen.setup) await screen.setup(page);
      await page.goto(screen.path);
      await screen.ready(page);

      // (2) body 의 computed word-break 가 keep-all — 결함1(한글 음절 중간 줄바꿈: "이른둥이
      // 육/아 계산기") 재발 방지.
      const wordBreak = await page.evaluate(() => getComputedStyle(document.body).wordBreak);
      expect(
        wordBreak,
        `${screen.name}@${width}px: body word-break=${wordBreak} (기대: keep-all)`,
      ).toBe("keep-all");

      // (1) 모든 button·a[role] 라벨이 한 줄 — 결함4("+ 아이 추가" 버튼 라벨 줄바꿈) 재발 방지.
      // 라벨 텍스트 노드마다 Range 를 만들어 getClientRects() 줄 수를 잰다 — 2줄 이상이면
      // 그 텍스트 노드가 중간에서 줄바꿈됐다는 뜻이다(아이콘은 svg 라 텍스트 노드에 안 잡힌다).
      // 현재 코드에는 role 속성이 붙은 <a> 가 없어 이 셀렉터는 사실상 button 만 걸리지만,
      // GOAL 문구를 그대로 따라 셀렉터에 남겨 뒀다(향후 a[role] 이 생기면 자동으로 걸린다).
      const wraps = await page.evaluate<LineWrapViolation[]>(() => {
        const violations: LineWrapViolation[] = [];
        const elements = document.querySelectorAll("button, a[role]");
        elements.forEach((el) => {
          const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
          let node = walker.nextNode();
          while (node) {
            const text = node.textContent?.trim();
            if (text) {
              const range = document.createRange();
              range.selectNodeContents(node);
              const rects = range.getClientRects().length;
              if (rects > 1) {
                violations.push({ tag: el.tagName, label: text, rects });
              }
            }
            node = walker.nextNode();
          }
        });
        return violations;
      });
      expect(
        wraps,
        `${screen.name}@${width}px: 줄바꿈된 버튼/링크 라벨: ${JSON.stringify(wraps)}`,
      ).toEqual([]);
    });
  }
}

// (3) 나이 카드 값 조각(예: "92일"·"3개월"·"36일"·"1개월"·"2026-06-26")이 한 줄 안에 있는지 —
// 결함2·3(숫자+단위·날짜 중간 끊김) 재발 방지. AgeSummaryCard 를 쓰는 화면은 dashboard·share
// 둘뿐이다(widgets/age-summary/ui/AgeSummaryCard.tsx 사용처 grep 으로 확인).
const AGE_CARD_SCREENS = SCREENS.filter((s) => s.name === "dashboard" || s.name === "share");
type FragmentRects = { text: string; rects: number };

for (const screen of AGE_CARD_SCREENS) {
  for (const width of WIDTHS) {
    test(`[시각 결함 회귀] 나이 카드 값 조각 줄바꿈 없음 — ${screen.name} @ ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await fixClockKst(page, CLOCK);
      if (screen.setup) await screen.setup(page);
      await page.goto(screen.path);
      await screen.ready(page);

      const card = page.getByRole("group", { name: "오늘 기준 나이" });
      await expect(card).toBeVisible();

      // AgeSummaryCard 는 nowrapChunks() 로 값 조각마다 white-space:nowrap span 을 씌운다
      // (widgets/age-summary/lib/nowrap-chunks.tsx). computed white-space 로 그 span 들을
      // 찾아 각 span 의 Range.getClientRects() 줄 수를 잰다 — nowrapChunks 구현이 앞으로
      // 바뀌어도(예: 클래스 이름 도입) computed style 기준이라 이 테스트는 그대로 유효하다.
      const fragments = await card.evaluate((el) => {
        const results: FragmentRects[] = [];
        const spans = el.querySelectorAll("span");
        spans.forEach((span) => {
          if (getComputedStyle(span).whiteSpace !== "nowrap") return;
          const range = document.createRange();
          range.selectNodeContents(span);
          results.push({ text: span.textContent ?? "", rects: range.getClientRects().length });
        });
        return results;
      });

      expect(
        fragments.length,
        `${screen.name}@${width}px: nowrap 값 조각을 하나도 못 찾았다 — nowrapChunks 적용이 빠졌을 수 있다`,
      ).toBeGreaterThan(0);

      const wrapped = fragments.filter((f) => f.rects > 1);
      expect(
        wrapped,
        `${screen.name}@${width}px: 줄바꿈된 값 조각: ${JSON.stringify(wrapped)}`,
      ).toEqual([]);

      // 고정 시계(2026-06-01)·고정 프로필(출생 2026-03-01·예정일 2026-04-26)에서 실제로
      // 나오는 값 조각 5개(오케스트레이터 GOAL 이 캡처에서 지적한 문구 그대로)가 화면에 끊기지
      // 않은 채로 보이는지 직접 확인한다 — 위 일반 검사가 이 구체적 사례를 놓치지 않았음을
      // 이중으로 보증한다.
      for (const text of ["92일", "3개월", "36일", "1개월", "2026-06-26"]) {
        await expect(card.getByText(text, { exact: true })).toBeVisible();
      }
    });
  }
}

// (4) 1280px 대시보드에서 "+ 아이 추가" 버튼의 왼쪽 x 와 첫 카드(AgeSummaryCard)의 왼쪽 x
// 차이가 2px 이내 — 결함5(버튼이 콘텐츠 영역 밖 x=16 에 떠 있던 문제) 재발 방지.
test('[시각 결함 회귀] 1280px 대시보드에서 "+ 아이 추가" 버튼이 카드와 같은 왼쪽 선에 있다', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await fixClockKst(page, CLOCK);
  await seedProfiles(page, [{ birthDate: BIRTH, dueDate: DUE }]);
  await page.goto("/dashboard");
  await expect(page.getByRole("group", { name: "오늘 기준 나이" })).toBeVisible();

  const addButton = page.getByRole("button", { name: "+ 아이 추가" });
  const card = page.getByRole("group", { name: "오늘 기준 나이" });
  const addBox = await addButton.boundingBox();
  const cardBox = await card.boundingBox();
  expect(addBox, "'+ 아이 추가' 버튼 boundingBox 를 못 얻었다").not.toBeNull();
  expect(cardBox, "나이 카드 boundingBox 를 못 얻었다").not.toBeNull();

  const diff = Math.round(Math.abs(addBox!.x - cardBox!.x) * 100) / 100;
  expect(
    diff,
    `버튼 x=${addBox!.x}, 카드 x=${cardBox!.x}, 차이=${diff}px`,
  ).toBeLessThanOrEqual(2);
});

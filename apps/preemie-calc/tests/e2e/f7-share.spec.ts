// F7 결과 공유. PC-F7-AC1~AC3, PC-F7-AC5~AC7, PC-F7-EX1. PC-F7-AC4 는 수동 확인이다
// (.curvez/qa/preemie-calc/manual-checks.md 참고).
import { expect, test } from "./support/fixtures";

import {
  fixClockKst,
  getClipboardText,
  getFillTextCalls,
  getFillTextWidths,
  getShareCalls,
  installFillTextSpy,
  installFillTextWidthSpy,
  removeNavigatorShare,
  seedProfiles,
  stubClipboardWrite,
  stubNavigatorShare,
} from "./support/helpers";

const BIRTH = "2026-03-01";
const DUE = "2026-04-26"; // 32주 0일

function fragmentOf(url: string): string {
  const idx = url.indexOf("#");
  return idx === -1 ? "" : url.slice(idx + 1);
}

test("PC-F7-AC1 · PC-NF-PRIV-2 — 이름 '하늘'로 저장한 프로필의 공유 링크와 카드 그리기 입력에 '하늘'이 없다", async ({
  page,
}) => {
  await seedProfiles(page, [{ birthDate: BIRTH, dueDate: DUE, name: "하늘" }]);
  await fixClockKst(page, "2026-06-01T09:00:00");
  await installFillTextSpy(page);
  await stubNavigatorShare(page);
  await page.goto("/dashboard");

  await page.getByRole("button", { name: "결과 카드 공유하기" }).click();
  await expect.poll(async () => (await getShareCalls(page)).length).toBeGreaterThan(0);

  const [call] = await getShareCalls(page);
  expect(call.url ?? "").not.toContain("하늘");
  expect(call.text ?? "").not.toContain("하늘");

  // 카드 이미지는 픽셀이라 문자열 검사를 할 수 없다. 대신 canvas 에 실제로 그려진(fillText
  // 로 넘어간) 문자열 목록을 가로채 "하늘"이 그 목록에 없는지 확인한다 — 이 방식의 한계는
  // strategy.md "테스트하지 않는 것"에 남긴다.
  const drawn = await getFillTextCalls(page);
  expect(drawn.length).toBeGreaterThan(0);
  expect(drawn.some((t) => t.includes("하늘"))).toBe(false);
});

test("PC-F7-AC3 — 공유 링크 fragment 키는 b·d 두 개뿐이다", async ({ page }) => {
  await seedProfiles(page, [{ birthDate: BIRTH, dueDate: DUE, name: "하늘" }]);
  await fixClockKst(page, "2026-06-01T09:00:00");
  await stubNavigatorShare(page);
  await page.goto("/dashboard");

  await page.getByRole("button", { name: "결과 카드 공유하기" }).click();
  await expect.poll(async () => (await getShareCalls(page)).length).toBeGreaterThan(0);

  const [call] = await getShareCalls(page);
  const fragment = fragmentOf(call.url ?? "");
  const keys = [...new URLSearchParams(fragment).keys()].sort();
  expect(keys).toEqual(["b", "d"]);
});

test("PC-F7-AC2 — 공유 링크를 다른 브라우저 컨텍스트(저장값 없음)에서 열면 같은 날짜 기준 같은 결과가 보인다", async ({
  page,
  browser,
}) => {
  await seedProfiles(page, [{ birthDate: BIRTH, dueDate: DUE, name: "하늘" }]);
  await fixClockKst(page, "2026-06-01T09:00:00");
  await stubNavigatorShare(page);
  await page.goto("/dashboard");

  await page.getByRole("button", { name: "결과 카드 공유하기" }).click();
  await expect.poll(async () => (await getShareCalls(page)).length).toBeGreaterThan(0);
  const [call] = await getShareCalls(page);
  const fragment = fragmentOf(call.url ?? "");

  const other = await browser.newContext({ viewport: { width: 360, height: 800 } });
  const otherPage = await other.newPage();
  await fixClockKst(otherPage, "2026-06-01T09:00:00");
  // 다른 기기: localStorage 를 전혀 채우지 않는다(F7 은 로컬 저장 없이도 결과를 보여줘야 한다).
  await otherPage.goto(`/share#${fragment}`);

  const card = otherPage.getByRole("group", { name: "오늘 기준 나이" });
  await expect(card).toContainText("생후 92일 · 3개월");
  await expect(card).toContainText("36일 · 1개월");
  await expect(otherPage.getByText("하늘")).toHaveCount(0);

  await other.close();
});

test("PC-F7-EX1 — navigator.share 를 쓸 수 없는 환경에서는 '링크 복사' 버튼이 보인다", async ({ page }) => {
  await seedProfiles(page, [{ birthDate: BIRTH, dueDate: DUE }]);
  await fixClockKst(page, "2026-06-01T09:00:00");
  await removeNavigatorShare(page);
  await stubClipboardWrite(page);
  await page.goto("/dashboard");

  const button = page.getByRole("button", { name: "링크 복사" });
  await expect(button).toBeVisible();
  await button.click();

  await expect(page.getByRole("button", { name: "복사했습니다" })).toBeVisible();
  const clipboard = await getClipboardText(page);
  const keys = [...new URLSearchParams(fragmentOf(clipboard)).keys()].sort();
  expect(keys).toEqual(["b", "d"]);
});

test("PC-F7-AC5 · AC6 — '결과 문구 복사'를 누르면 클립보드에 생후·교정·공유 링크 문구가 들어가고 이름은 없다", async ({
  page,
}) => {
  await seedProfiles(page, [{ birthDate: BIRTH, dueDate: DUE, name: "하늘" }]);
  await fixClockKst(page, "2026-06-01T09:00:00");
  await stubClipboardWrite(page);
  await stubNavigatorShare(page);
  await page.goto("/dashboard");

  await page.getByRole("button", { name: "결과 문구 복사" }).click();
  const clipboard = await getClipboardText(page);
  expect(clipboard).toContain("2026년 6월 1일 기준");
  expect(clipboard).toContain("생후 92일 · 3개월");
  expect(clipboard).toContain("교정 36일 · 1개월");
  expect(clipboard).toMatch(/https?:\/\/\S+#b=2026-03-01&d=2026-04-26/);
  expect(clipboard).not.toContain("하늘");
});

test("PC-F7-AC7 — 복사가 끝나면 '문구를 복사했어요'가 보인다", async ({ page }) => {
  await seedProfiles(page, [{ birthDate: BIRTH, dueDate: DUE }]);
  await fixClockKst(page, "2026-06-01T09:00:00");
  await stubClipboardWrite(page);
  await stubNavigatorShare(page);
  await page.goto("/dashboard");

  await page.getByRole("button", { name: "결과 문구 복사" }).click();
  await expect(page.getByRole("button", { name: "문구를 복사했어요" })).toBeVisible();
});

test("[curvez-reviewer/ACC-06] navigator.share 가 있어도 '링크 복사' 버튼이 보인다", async ({ page }) => {
  await seedProfiles(page, [{ birthDate: BIRTH, dueDate: DUE }]);
  await fixClockKst(page, "2026-06-01T09:00:00");
  await stubNavigatorShare(page);
  await page.goto("/dashboard");

  await expect(page.getByRole("button", { name: "결과 카드 공유하기" })).toBeVisible();
  await expect(page.getByRole("button", { name: "링크 복사" })).toBeVisible();
});

test("[curvez-reviewer/DSG-01] before-due 카드의 fillText 줄 폭이 캔버스 사용 가능 폭(952px) 이하다", async ({
  page,
}) => {
  // 출생 2026-03-01, 예정일 2026-04-26, 오늘 2026-04-01 → before-due: 'D-25'·'재태 36주 3일'.
  await seedProfiles(page, [{ birthDate: BIRTH, dueDate: DUE }]);
  await fixClockKst(page, "2026-04-01T09:00:00");
  await installFillTextWidthSpy(page);
  await stubNavigatorShare(page);
  await page.goto("/dashboard");

  await page.getByRole("button", { name: "결과 카드 공유하기" }).click();
  await expect.poll(async () => (await getFillTextWidths(page)).length).toBeGreaterThan(0);

  // share-card-canvas.ts: CANVAS_WIDTH=1080, PADDING=64 → 사용 가능 폭 = 1080 - 64*2 = 952.
  const USABLE_WIDTH = 1080 - 64 * 2;
  const widths = await getFillTextWidths(page);
  const overflow = widths.filter((w) => w.width > USABLE_WIDTH);
  expect(overflow, `사용 가능 폭 ${USABLE_WIDTH}px 초과 — ${JSON.stringify(overflow)}`).toEqual([]);
});

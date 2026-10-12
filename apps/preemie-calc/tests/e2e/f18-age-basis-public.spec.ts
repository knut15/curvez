// F18 "어느 나이를 쓰나" 공개판. PC-F18-AC1~AC3. 경로는 /guide/age-basis.
import { expect, test } from "./support/fixtures";

import { fixClockKst, seedProfiles } from "./support/helpers";

test("PC-F18-AC1 — localStorage 가 빈 브라우저에서 5개 항목과 각 기준(출생 또는 교정)이 보인다", async ({ page }) => {
  const response = await page.goto("/guide/age-basis");
  expect(response?.status()).toBe(200);
  await expect(page).toHaveURL(/\/guide\/age-basis$/);

  // SPEC 버전 5 원문의 5개 항목(requirements.md:277). 버전 3 의 "성장 백분위"는 이제 없다.
  const expected = [
    { label: "예방접종", basis: "출생 기준" },
    { label: "영유아검진 방문", basis: "출생 기준" },
    { label: "문진표·발달선별검사지", basis: "교정 기준(24개월 검진까지)" },
    { label: "이유식", basis: "교정 기준" },
    { label: "발달 평가", basis: "교정 기준" },
  ];
  for (const { label, basis } of expected) {
    const row = page.getByRole("listitem").filter({ hasText: label });
    await expect(row, label).toBeVisible();
    await expect(row, label).toContainText(basis);
  }
});

test("PC-F18-AC2 — 프로필이 없을 때 '내 아이로 계산하기'는 입력 화면을 거쳐 저장 뒤 F3 화면(/dashboard/age-basis)으로 돌아간다", async ({
  page,
}) => {
  await fixClockKst(page, "2026-06-01T09:00:00");
  await page.goto("/guide/age-basis");
  await page.getByRole("link", { name: "내 아이로 계산하기" }).click();
  await page.waitForURL((url) => url.pathname === "/");
  await expect(page.getByLabel("출생일")).toBeVisible();

  await page.getByLabel("출생일").fill("2026-03-01");
  await page.getByLabel("원래 출산 예정일").fill("2026-04-26");
  await page.getByRole("radio", { name: "남아" }).click();
  await page.getByRole("button", { name: "저장하고 결과 보기" }).click();

  // 기본값(/dashboard)이 아니라 원래 눌렀던 F3 화면으로 돌아간다(왕복 완성, PC-F18-AC2).
  await page.waitForURL("**/dashboard/age-basis");
});

test("PC-F18-AC2 — 프로필이 있을 때 '내 아이로 계산하기'는 F3 화면(/dashboard/age-basis)으로 간다", async ({ page }) => {
  await seedProfiles(page, [{ birthDate: "2026-03-01", dueDate: "2026-04-26" }]);
  await fixClockKst(page, "2026-06-01T09:00:00");
  await page.goto("/guide/age-basis");
  await page.getByRole("link", { name: "내 아이로 계산하기" }).click();
  await page.waitForURL("**/dashboard/age-basis");
  await expect(page.getByRole("listitem").filter({ hasText: "예방접종" })).toContainText("생후 3개월");
});

test("PC-F18-AC3 — 항목마다 실제 근거 자료 이름과 기준일이 보인다", async ({ page }) => {
  await page.goto("/guide/age-basis");
  // "근거 자료 이름"을 데이터 파일 제목(footer의 "어느 나이를 쓰나 기준표")이 아니라
  // age-basis.json 의 실제 출처 이름(meta.sources)으로 엄격하게 판정한다(TEAM-04·TEAM-05).
  // 각 행(InfoRow)의 sourceLabel 이 그 출처 이름을 그대로 보여 준다.
  const expectedSources = [
    { label: "예방접종", source: "질병관리청 표준 예방접종 일정표" },
    { label: "영유아검진 방문", source: "일산병원 영유아검진 안내(국민건강보험공단 기준)" },
    { label: "문진표·발달선별검사지", source: "일산병원 영유아검진 안내(국민건강보험공단 기준)" },
    { label: "이유식", source: "아이사랑 이른둥이 안내" },
    { label: "발달 평가", source: "아이사랑 이른둥이 안내" },
  ];
  for (const { label, source } of expectedSources) {
    const row = page.getByRole("listitem").filter({ hasText: label });
    await expect(row, label).toContainText(source);
    await expect(row, label).toContainText(/기준일 \d{4}-\d{2}-\d{2}/);
  }
});

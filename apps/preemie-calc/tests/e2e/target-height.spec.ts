// F14 목표키 참고. route /dashboard/target-height.
// PC-F14-AC1, AC2, AC3, EX1. 스펙: .curvez/design/preemie-calc/screens/target-height.md.
import { expect, test } from "./support/fixtures";

import { fixClockKst, focusableTextsInOrder, seedProfiles } from "./support/helpers";

const BIRTH = "2026-03-01";
const DUE = "2026-04-26";

test.beforeEach(async ({ page }) => {
  await fixClockKst(page, "2026-06-01T09:00:00");
});

test("state:empty — 계산 전(초기)에는 result 영역이 그려지지 않는다", async ({ page }) => {
  await seedProfiles(page, [{ birthDate: BIRTH, dueDate: DUE, sex: "male" }]);
  await page.goto("/dashboard/target-height");
  await expect(page.getByLabel("아빠 키")).toBeVisible();
  await expect(page.getByRole("group", { name: "목표키 참고" })).toHaveCount(0);
});

test("PC-F14-AC1 — 아빠 175cm, 엄마 162cm, 남아 → '목표키 참고 175.0cm (168.5~181.5cm)'", async ({ page }) => {
  await seedProfiles(page, [{ birthDate: BIRTH, dueDate: DUE, sex: "male" }]);
  await page.goto("/dashboard/target-height");
  await page.getByLabel("아빠 키").fill("175");
  await page.getByLabel("엄마 키").fill("162");
  await page.getByRole("button", { name: "계산하기" }).click();
  // ValueCard(라벨/값/범위)는 서로 다른 <p> 세 개로 나뉘어 그려진다(shared/ui/ValueCard.tsx) —
  // 하나의 텍스트 노드로 찾을 수 없어 결과 카드 영역(role=group)의 텍스트를 정규화해 판정한다.
  const card = page.getByRole("group", { name: "목표키 참고" });
  await expect(card).toBeVisible();
  expect((await card.innerText()).replace(/\s+/g, " ").trim()).toBe(
    "목표키 참고 175.0cm (168.5~181.5cm)",
  );
});

test("PC-F14-AC2 — 같은 부모 키, 여아 → '목표키 참고 162.0cm (155.5~168.5cm)'", async ({ page }) => {
  await seedProfiles(page, [{ birthDate: BIRTH, dueDate: DUE, sex: "female" }]);
  await page.goto("/dashboard/target-height");
  await page.getByLabel("아빠 키").fill("175");
  await page.getByLabel("엄마 키").fill("162");
  await page.getByRole("button", { name: "계산하기" }).click();
  const card = page.getByRole("group", { name: "목표키 참고" });
  await expect(card).toBeVisible();
  expect((await card.innerText()).replace(/\s+/g, " ").trim()).toBe(
    "목표키 참고 162.0cm (155.5~168.5cm)",
  );
});

test("PC-F14-AC3 — 결과 아래에 고정 문구와 계산식 출처가 보인다", async ({ page }) => {
  await seedProfiles(page, [{ birthDate: BIRTH, dueDate: DUE, sex: "male" }]);
  await page.goto("/dashboard/target-height");
  await page.getByLabel("아빠 키").fill("175");
  await page.getByLabel("엄마 키").fill("162");
  await page.getByRole("button", { name: "계산하기" }).click();
  await expect(page.getByText("부모 키로 계산한 참고값이며 성인 키 예측이 아닙니다")).toBeVisible();
  await expect(page.getByText("계산식 출처: Tanner 공식")).toBeVisible();
});

test("PC-F14-EX1 — 부모 키가 비었거나 범위 밖이면 계산 버튼이 비활성화되고 에러 문구가 보인다", async ({ page }) => {
  await seedProfiles(page, [{ birthDate: BIRTH, dueDate: DUE, sex: "male" }]);
  await page.goto("/dashboard/target-height");
  await page.getByLabel("아빠 키").fill("99");
  await page.getByLabel("엄마 키").fill("162");
  await expect(page.getByRole("button", { name: "계산하기" })).toBeDisabled();
  await expect(page.getByText("부모님 키를 모두 확인하세요")).toBeVisible();
});

test("focus-order — header.back → 아빠키 → 엄마키 → 계산하기(값을 채워 활성화된 뒤)", async ({ page }) => {
  await seedProfiles(page, [{ birthDate: BIRTH, dueDate: DUE, sex: "male" }]);
  await page.goto("/dashboard/target-height");
  await page.getByLabel("아빠 키").fill("175");
  await page.getByLabel("엄마 키").fill("162");
  const names = await focusableTextsInOrder(page);
  expect(names).toEqual(["대시보드", "아빠 키 *, 필수", "엄마 키 *, 필수", "계산하기"]);
});

test("PC-NF-MED-1 — 화면에 의료 면책 문구가 보인다", async ({ page }) => {
  await seedProfiles(page, [{ birthDate: BIRTH, dueDate: DUE, sex: "male" }]);
  await page.goto("/dashboard/target-height");
  await expect(page.getByText("참고용이며 진단을 대신하지 않음")).toBeVisible();
});

// 실패 경로 회귀. 특정 F 번호에 묶이지 않는 교차 관심사(ERR-02)라 별도 파일에 둔다.
import { expect, test } from "./support/fixtures";

import { fixClockKst, seedProfiles, simulateLocalStorageUnavailable } from "./support/helpers";

const BIRTH = "2026-03-01";
const DUE = "2026-04-26"; // 32주 0일

test("[curvez-reviewer/ERR-02] localStorage 가 예외를 던지는 환경에서도 첫 화면('/')이 깨지지 않는다", async ({
  page,
}) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (e) => pageErrors.push(e.message));

  await simulateLocalStorageUnavailable(page);
  await fixClockKst(page, "2026-06-01T09:00:00");
  await page.goto("/");

  await expect(page.getByLabel("출생일")).toBeVisible();
  expect(pageErrors).toEqual([]);
});

test("[curvez-reviewer/ERR-02] localStorage 가 예외를 던지는 환경에서 /dashboard 는 예외 없이 '저장 공간을 사용할 수 없습니다'를 보인다", async ({
  page,
}) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (e) => pageErrors.push(e.message));

  // seedProfiles 는 addInitScript(localStorage.setItem) 로 먼저 값을 채우는데,
  // simulateLocalStorageUnavailable 이 나중에 등록돼 setItem 자체를 덮어써 예외를 던지므로
  // 실제로는 "쓰기도 못 하는 환경" 이 된다. 여기서는 저장을 시도조차 못 하는 상태를 그대로
  // 재현하려고 seedProfiles 를 호출하지 않는다.
  await simulateLocalStorageUnavailable(page);
  await fixClockKst(page, "2026-06-01T09:00:00");
  await page.goto("/dashboard");

  await expect(page.getByText("저장 공간을 사용할 수 없습니다")).toBeVisible();
  expect(pageErrors).toEqual([]);
});

// seedProfiles 를 쓴 뒤에 저장소가 막힌 경우(이미 있던 값은 있는데 갑자기 못 읽게 된 경우)도
// 같은 문구로 처리되는지 별도로 확인한다.
test("[curvez-reviewer/ERR-02] 프로필이 이미 있어도 localStorage 읽기가 막히면 '저장 공간을 사용할 수 없습니다'를 보인다", async ({
  page,
}) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (e) => pageErrors.push(e.message));

  await seedProfiles(page, [{ birthDate: BIRTH, dueDate: DUE }]);
  await simulateLocalStorageUnavailable(page);
  await fixClockKst(page, "2026-06-01T09:00:00");
  await page.goto("/dashboard");

  await expect(page.getByText("저장 공간을 사용할 수 없습니다")).toBeVisible();
  expect(pageErrors).toEqual([]);
});

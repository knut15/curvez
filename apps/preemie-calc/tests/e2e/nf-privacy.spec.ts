// 비기능: 프라이버시. PC-NF-PRIV-1(아이 정보는 기기에만 저장, 네트워크로 나가지 않음).
// PC-NF-PRIV-2 는 f7-share.spec.ts(PC-F7-AC1)와 같은 검사, PC-NF-PRIV-3 는
// f1-profile.spec.ts(PC-F1-AC6)와 같은 검사라 여기서 중복하지 않는다(requirements.md "같은 요구" 칸).
import { expect, test } from "./support/fixtures";

import { fixClockKst, openHeaderMenu } from "./support/helpers";

const SENSITIVE_NAME = "은밀한이름";
const SENSITIVE_BIRTH = "2026-01-15";
const SENSITIVE_DUE = "2026-04-10";

test("PC-NF-PRIV-1 — 프로필 입력·저장·대시보드 조회·프로필 편집 동안 나가는 요청에 이름·출생일·예정일 값이 없다", async ({
  page,
}) => {
  const requests: { url: string; postData: string | null }[] = [];
  page.on("request", (req) => {
    requests.push({ url: req.url(), postData: req.postData() });
  });

  await fixClockKst(page, "2026-06-01T09:00:00");
  await page.goto("/");

  await page.getByLabel("출생일").fill(SENSITIVE_BIRTH);
  await page.getByLabel("출산 예정일").fill(SENSITIVE_DUE);
  await page.getByRole("radio", { name: "남아" }).click();
  await page.getByRole("button", { name: "저장하고 결과 보기" }).click();
  await page.waitForURL("**/dashboard");

  // HeaderMenu 도입(5차 디자인 라운드) — "더보기" 를 먼저 열어야 menuitem 이 보인다.
  await openHeaderMenu(page);
  await page.getByRole("menuitem", { name: "프로필 편집" }).click();
  await page.getByLabel(/이름/).fill(SENSITIVE_NAME);
  await page.getByRole("button", { name: "저장", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeHidden();

  await page.goto("/dashboard/age-basis");
  await page.goto("/dashboard/checkups");
  await page.goto("/dashboard/copay-relief");
  await page.goto("/dashboard/correction-period");

  const needles = [SENSITIVE_NAME, SENSITIVE_BIRTH, SENSITIVE_DUE, encodeURIComponent(SENSITIVE_NAME)];
  const offenders = requests.filter((r) => needles.some((n) => r.url.includes(n) || (r.postData ?? "").includes(n)));

  expect(offenders, `민감값이 포함된 요청 발견: ${JSON.stringify(offenders)}`).toEqual([]);
  expect(requests.length, "네트워크 요청을 하나도 가로채지 못했다 — 감시 자체가 안 된 것일 수 있다").toBeGreaterThan(0);
});

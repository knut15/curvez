import { defineConfig, devices } from "@playwright/test";

// 이번 라운드는 화면(U2)이 아직 없어 tests/e2e 에 스펙을 두지 않는다.
// 다음 라운드가 화면 E2E 를 쓸 수 있도록 설정만 미리 둔다.
// 포트 3100 은 사용자가 화면을 확인하는 dev 서버가 쓴다(kill 금지). E2E·캡처는 겹치지
// 않게 3200 을 쓴다. PORT 환경변수로 덮어쓸 수 있다.
const PORT = Number(process.env.PORT) || 3200;

// 디자인 재구성 전후 비교용 캡처 project. CURVEZ_CAPTURE 환경변수가 있을 때만 projects 배열에
// 들어간다 — 기본 `pnpm test:e2e`(= `playwright test`, 인자 없음)는 CURVEZ_CAPTURE 를 세팅하지
// 않으므로 projects 는 지금까지와 똑같이 chromium-mobile 하나뿐이라 75건 결과가 그대로다.
// 스펙 자체는 tests/capture/(이 project 의 testDir)에 있어 chromium-mobile(testDir tests/e2e)
// 에도 잡히지 않는다. 실행 방법은 .curvez/qa/preemie-calc/screens/README.md 참고.
const captureProjects = process.env.CURVEZ_CAPTURE
  ? [
      {
        name: "capture",
        testDir: "./tests/capture",
        use: {},
      },
    ]
  : [];

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  webServer: {
    command: `pnpm exec next build && pnpm exec next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 180_000,
  },
  use: {
    baseURL: `http://localhost:${PORT}`,
  },
  projects: [
    {
      name: "chromium-mobile",
      use: {
        ...devices["Pixel 5"],
        viewport: { width: 360, height: 800 },
      },
    },
    ...captureProjects,
  ],
});

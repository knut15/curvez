import { playwright } from "@vitest/browser-playwright";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { defineConfig } from "vitest/config";

/**
 * 스토리를 그대로 테스트로 돌린다. 별도의 테스트 파일을 쓰지 않는다.
 *
 * **이유:** 스토리와 테스트가 따로 있으면 같은 컴포넌트의 기대 동작이 두 벌이 되고, 한쪽만
 * 고쳐진다. 스토리가 이미 "이 상태에서 이렇게 보인다" 를 값으로 적고 있으므로 그것이 곧
 * 테스트다. 검증할 상호작용이 있으면 그 스토리에 `play` 를 붙인다.
 *
 * 브라우저에서 돈다 — jsdom 이 아니다. 대비·포커스 링·`line-clamp` 처럼 이 디자인 시스템이
 * 값으로 정한 것들이 실제 레이아웃 계산을 거쳐야 판정되기 때문이다.
 *
 * `setupFiles` 를 두지 않는다. Storybook 10.3 부터 애드온이 `preview.ts` 의 데코레이터와
 * 전역 CSS 를 자동으로 싣는다. 손으로 `setProjectAnnotations` 를 부르면 애드온이 자동
 * 주입을 건너뛰어 오히려 조건이 달라진다.
 */
export default defineConfig({
  plugins: [storybookTest({ configDir: ".storybook" })],
  test: {
    name: "storybook",
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: "chromium" }],
    },
  },
});

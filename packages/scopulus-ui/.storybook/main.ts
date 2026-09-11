import type { StorybookConfig } from "@storybook/nextjs-vite";

/**
 * 라이브러리 컴포넌트 전부가 범위다. `src/ui/` 아래가 전부이고 서버 컴포넌트가 없다.
 *
 * 앱의 화면(`views/` · `app/`)은 여기 들어오지 않는다. 서버 컴포넌트이고 Storybook 의 RSC
 * 지원은 공식 문서가 experimental 이라고 적어 둔 상태다.
 */
const config: StorybookConfig = {
  stories: ["../src/ui/**/*.mdx", "../src/ui/**/*.stories.@(ts|tsx)"],
  addons: [
    "@storybook/addon-themes",
    // 컴포넌트 스펙이 a11y 다섯 키를 값으로 적어 뒀다. 그 값 중 기계가 셀 수 있는 것을
    // 여기서 센다 — 대비·role·이름. 포커스 순서처럼 못 세는 것은 여전히 사람이 본다.
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-vitest",
  ],
  framework: {
    name: "@storybook/nextjs-vite",
    options: {},
  },
  core: {
    // 기본값이 켜짐이다. 빌드를 돌릴 때마다 익명 통계가 밖으로 나간다.
    // 게이트가 CI 에서 돌 것을 전제하므로 명시적으로 끈다.
    disableTelemetry: true,
  },
};

export default config;

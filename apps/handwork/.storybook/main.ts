import type { StorybookConfig } from "@storybook/nextjs-vite";

/**
 * 스토리 범위는 `shared/ui` 와 `entities/<슬라이스>/ui` 두 층뿐이다.
 *
 * `views/` 와 `app/` 을 넣지 않는다. 둘은 서버 컴포넌트이고, Storybook 의 RSC 지원은
 * 공식 문서가 experimental 이라고 적어 둔 상태다. 넣으면 스토리가 아니라 번들러를
 * 디버깅하게 된다. 범위의 근거는 `apps/handwork/design/GOAL.md` 1절에 있다.
 */
const config: StorybookConfig = {
  stories: [
    "../src/shared/ui/**/*.mdx",
    "../src/shared/ui/**/*.stories.@(ts|tsx)",
    "../src/entities/*/ui/**/*.stories.@(ts|tsx)",
  ],
  addons: [
    "@storybook/addon-themes",
    // 컴포넌트 스펙 12종이 a11y 다섯 키를 값으로 적어 뒀다. 그 값 중 기계가 셀 수 있는 것을
    // 여기서 센다 — 대비·role·이름. 포커스 순서처럼 못 세는 것은 여전히 사람이 본다.
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-vitest",
  ],
  framework: {
    name: "@storybook/nextjs-vite",
    options: {},
  },
  // 랜딩 배경과 브랜드 자산이 `/brand/*` 경로로 참조된다. 스토리에서 같은 경로가 열리도록 붙인다.
  staticDirs: ["../public"],
  core: {
    // 기본값이 켜짐이다. 빌드를 돌릴 때마다 익명 통계가 밖으로 나간다.
    // 게이트가 CI 에서 돌 것을 전제하므로 명시적으로 끈다.
    disableTelemetry: true,
  },
};

export default config;

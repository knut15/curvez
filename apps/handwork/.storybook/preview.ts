import { withThemeByClassName } from "@storybook/addon-themes";
import type { Preview } from "@storybook/nextjs-vite";

import "../src/app/globals.css";
import "./preview.css";

/**
 * 다크 모드는 `.dark` 클래스 토글이다. 앱의 `next-themes` 를 스토리북에 띄우지 않는다.
 *
 * **이유:** 프로바이더가 하나 더 생기면 테마가 앱과 다른 경로로 걸린다. 그러면 스토리에서
 * 통과한 것이 실제 화면에서 깨져도 스토리는 계속 초록색이다. 토글하는 것은 `.dark` 하나뿐이니
 * 데코레이터가 그 클래스만 직접 붙이는 편이 앱과 같은 경로다.
 */
const preview: Preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    // 배경은 토큰이 정한다. 애드온이 자기 회색을 덧칠하면 대비를 눈으로 판정할 수 없다.
    backgrounds: { disable: true },
  },
  decorators: [
    withThemeByClassName({
      themes: { light: "", dark: "dark" },
      defaultTheme: "light",
    }),
  ],
};

export default preview;

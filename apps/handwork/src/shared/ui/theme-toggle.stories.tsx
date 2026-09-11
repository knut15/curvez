import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ThemeToggle } from "./theme-toggle";

/**
 * **구현을 바꾸지 않았다.** 스펙(`apps/handwork/design/components/ThemeToggle.md`)이 델타 문서이고,
 * 결론이 "`Button` 으로 바꾸지 않는다" 다. 이 파일이 `next-themes` 의 `setTheme` 과
 * `document.documentElement.classList` 를 직접 읽는 구조를 갖고 있어, `Button` 을 한 겹 끼우면
 * 그 구조가 두 파일로 갈라진다.
 *
 * 스토리북에는 `next-themes` 프로바이더가 없다. `setTheme` 은 아무 일도 하지 않고, 대신
 * 애드온의 테마 데코레이터가 `.dark` 를 붙인다 — 앱과 같은 경로다. 그래서 아이콘 전환은
 * 툴바에서 테마를 바꿔 확인한다. 버튼을 눌러서가 아니다.
 */
const meta = {
  title: "shared/ThemeToggle",
  component: ThemeToggle,
  decorators: [
    (Story) => (
      <div className="bg-background p-8 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ThemeToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/**
 * 헤더 바 색 위에 놓았을 때. 실제로 이 버튼이 사는 자리다 — `widgets/site-header.tsx`.
 * 바의 배경(`--brand-canvas`)이 본문 배경과 다르므로 hover 면(`--accent`)도 그 위에서 봐야 한다.
 */
export const OnHeaderBar: Story = {
  decorators: [
    (Story) => (
      <div className="bg-brand-canvas p-4 text-brand-ink">
        <div className="flex items-center justify-end gap-4">
          <span className="text-sm">Cases</span>
          <span className="text-sm">Labs</span>
          <Story />
        </div>
      </div>
    ),
  ],
};

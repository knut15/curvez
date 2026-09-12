import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Avatar } from "./avatar";

/**
 * 예제용 그림. 바깥 주소를 쓰지 않는다 — 남의 CDN 이 죽으면 스토리도 같이 죽고,
 * 그 실패가 컴포넌트의 실패처럼 보인다. 색은 `--muted-foreground` 와 `--muted` 의 라이트 값이다.
 */
const DEMO_SRC =
  "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2040%2040'%3E%3Crect%20width='40'%20height='40'%20fill='%235C6B68'/%3E%3Ccircle%20cx='20'%20cy='14'%20r='6'%20fill='%23EDF1F0'/%3E%3Ccircle%20cx='20'%20cy='36'%20r='11'%20fill='%23EDF1F0'/%3E%3C/svg%3E";

const meta = {
  title: "shared/Avatar",
  component: Avatar,
  decorators: [
    (Story) => (
      <div className="bg-background p-8 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 그림이 없을 때가 기본이다. 이름에서 만든 이니셜이 서고, 읽히는 이름은 `aria-label` 이 갖는다.
 * 이니셜 글자에는 `aria-hidden` 이 붙어 있어 소리로는 `김현` 이 아니라 `김현우` 가 들린다.
 */
export const Default: Story = {
  args: { name: "김현우" },
};

/**
 * `src` 를 주면 그림이 이니셜을 대신한다. 이름은 그대로 `alt` 가 되므로
 * 그림이 있든 없든 읽히는 것이 같다.
 */
export const WithImage: Story = {
  args: { name: "김현우", src: DEMO_SRC },
};

/** 지름 셋. 24 · 40 · 64px 이고 이니셜 글자도 함께 커진다. */
export const Sizes: Story = {
  args: { name: "김현우" },
  render: () => (
    <span className="flex items-center gap-4">
      <Avatar size="sm" name="김현우" />
      <Avatar name="김현우" />
      <Avatar size="lg" name="김현우" />
    </span>
  ),
};

/**
 * 이니셜은 최대 두 글자다. 낱말이 둘이면 앞 두 낱말의 첫 글자, 하나면 앞 두 글자다.
 * 한글 이름은 띄어쓰기가 없어 뒤쪽 규칙으로 간다.
 */
export const InitialsFromName: Story = {
  args: { name: "Ada Lovelace" },
  render: () => (
    <span className="flex items-center gap-4">
      <Avatar name="Ada Lovelace" />
      <Avatar name="김현우" />
      <Avatar name="scopulus" />
    </span>
  ),
};

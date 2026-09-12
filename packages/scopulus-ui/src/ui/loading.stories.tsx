import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Button } from "./button";
import { Loading } from "./loading";

const meta = {
  title: "shared/Loading",
  component: Loading,
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "default"] },
  },
  decorators: [
    (Story) => (
      <div className="bg-background p-8 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Loading>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 24px 고리가 1초에 한 바퀴 돈다. 글자는 `sr-only` 라 보이지 않지만 화면 낭독기는 읽는다 —
 * 감싸개가 `role="status"` 다.
 *
 * **한 화면에 이것을 여럿 두지 마라.** live region 이 여럿이면 같은 말이 여러 번 읽힌다.
 * 그래서 크기 둘을 한 스토리에 나란히 놓지 않고 스토리를 나눴다.
 */
export const Default: Story = {};

/** 16px. 버튼 안처럼 `h-10`(40px) 안에 들어갈 때의 크기다. */
export const Small: Story = {
  args: { size: "sm" },
};

/**
 * 버튼 안. `label` 을 그 버튼이 하려는 일로 바꾼다 — 기본값 "불러오는 중" 을 그대로 두면
 * 낭독기가 "저장, 불러오는 중" 처럼 두 말을 잇는다.
 *
 * 누르는 동안 버튼을 `disabled` 로 둔다. 흐려지는 것은 `Button` 의 `disabled:opacity-50` 이다.
 */
export const InButton: Story = {
  args: { size: "sm", label: "저장 중" },
  render: (args) => (
    <Button disabled className="gap-2">
      <Loading {...args} />
      저장
    </Button>
  ),
};

/**
 * 화면 한가운데. 자리를 가운데 세우는 것은 이 컴포넌트가 아니라 감싼 쪽이 한다 —
 * `className` 을 열지 않은 이유가 그것이다.
 *
 * **여기에 `Skeleton` 을 같이 두지 마라.** 자리를 아는 기다림은 `Skeleton`,
 * 모르는 기다림은 이것이다. 둘이 한 화면에 있으면 서로 다른 일을 기다리는 것으로 읽힌다.
 */
export const CenteredInPanel: Story = {
  render: (args) => (
    <div className="flex h-40 items-center justify-center rounded-lg border border-border">
      <Loading {...args} />
    </div>
  ),
};

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { Progress } from "./progress";

const meta = {
  title: "shared/Progress",
  component: Progress,
  args: { value: 60, label: "내보내기 진행률" },
  argTypes: {
    value: { control: { type: "range", min: 0, max: 100, step: 1 } },
  },
  decorators: [
    (Story) => (
      <div className="max-w-md bg-background p-8 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 홈은 `--muted`, 채움은 `--primary` 다. 높이 8px 이 모든 폭에서 같다. */
export const Default: Story = {};

/**
 * 0%. **값을 모르는 동안 이 상태로 두지 마라** — 0% 막대는 "시작했는데 아무것도 안 됐다" 로
 * 읽힌다. 값이 없는 기다림은 `Loading` 이 맡는다.
 */
export const Zero: Story = {
  args: { value: 0 },
};

/** 100%. 채움이 홈을 덮어 양끝 반원이 채움 색으로 보인다. */
export const Complete: Story = {
  args: { value: 100 },
};

/**
 * 범위를 벗어난 값. **눈으로는 100% 와 구별되지 않으므로 눌러서가 아니라 속성으로 확인한다.**
 * 자르지 않으면 `aria-valuenow` 가 140 을 그대로 읽어 화면 낭독기가 140% 라고 말한다.
 */
export const ClampedAboveMax: Story = {
  args: { value: 140 },
  play: async ({ canvasElement }) => {
    const bar = within(canvasElement).getByRole("progressbar", {
      name: "내보내기 진행률",
    });
    await expect(bar).toHaveAttribute("aria-valuenow", "100");
  },
};

/**
 * 음수도 같은 자리에서 잘린다. 0 미만이 들어오면 막대가 홈 왼쪽 밖으로 밀려
 * 홈만 남은 것처럼 보이는데, 그 사이 `aria-valuenow` 는 음수를 읽는다.
 */
export const ClampedBelowMin: Story = {
  args: { value: -20 },
  play: async ({ canvasElement }) => {
    const bar = within(canvasElement).getByRole("progressbar", {
      name: "내보내기 진행률",
    });
    await expect(bar).toHaveAttribute("aria-valuenow", "0");
  },
};

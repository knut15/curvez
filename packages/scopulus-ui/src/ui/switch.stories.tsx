import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";

import { Switch } from "./switch";

const LABEL = "댓글 받기";

const meta = {
  title: "shared/Switch",
  component: Switch,
  argTypes: {
    size: { control: "inline-radio", options: ["default", "sm"] },
  },
  /**
   * `Checkbox` 와 같은 이유로 `<label for>` 를 붙인다 — Base UI 가 `id` 를 숨은 `<input>` 에
   * 얹으므로, 그 `id` 를 가리키는 라벨이 `role="switch"` 의 이름이 된다.
   */
  render: (args) => (
    <div className="flex items-center gap-2 text-sm">
      <Switch {...args} id="switch-story" />
      <label htmlFor="switch-story">{LABEL}</label>
    </div>
  ),
  decorators: [
    (Story) => (
      <div className="bg-background p-8 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 꺼진 상태가 기본이다. 트랙이 `--input`, 손잡이가 왼쪽에 있다. */
export const Default: Story = {
  /**
   * **눌렀을 때 손잡이만 움직이는 것이 아니라 상태가 뒤집히는지 본다.** 손잡이 위치는
   * `translate-x` 로 그려지므로, 애니메이션만 돌고 값은 그대로인 구현도 화면에서는 같다.
   */
  play: async ({ canvasElement }) => {
    const toggle = within(canvasElement).getByRole("switch", { name: LABEL });
    await expect(toggle).toHaveAttribute("aria-checked", "false");
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute("aria-checked", "true");
    await userEvent.click(toggle);
    await expect(toggle).toHaveAttribute("aria-checked", "false");
  },
};

/** 켜진 상태. 트랙이 `--primary` 로 바뀌고 손잡이가 오른쪽 끝으로 간다. */
export const Checked: Story = {
  args: { defaultChecked: true },
};

/** 좁은 자리에 쓰는 작은 크기. 32×18.4px 이 24×14px 로 줄어든다. */
export const Small: Story = {
  args: { size: "sm", defaultChecked: true },
};

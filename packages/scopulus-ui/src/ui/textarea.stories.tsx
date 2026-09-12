import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Textarea } from "./textarea";

const meta = {
  title: "shared/Textarea",
  component: Textarea,
  args: { placeholder: "무엇이 어떻게 막혔는지 적어 주세요" },
  /** 이름 없는 입력칸은 a11y 검사의 `label` 위반이다. `<label for>` 로 묶는다. */
  render: (args) => (
    <div className="flex w-80 flex-col gap-1.5">
      <label htmlFor="textarea-story" className="text-sm font-medium">
        증상
      </label>
      <Textarea {...args} id="textarea-story" />
    </div>
  ),
  decorators: [
    (Story) => (
      <div className="bg-background p-8 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 빈 칸. 최소 높이가 `min-h-16` 이다. */
export const Default: Story = {};

/**
 * 값이 길어지면 스크롤이 생기는 대신 칸이 늘어난다 — `field-sizing-content` 때문이다.
 * `rows` 로 높이를 고정하지 않은 이유가 이것이다.
 */
export const Grown: Story = {
  args: {
    defaultValue:
      "토큰 갱신 요청이 겹칠 때 이전 토큰이 뒤늦게 덮어씁니다. 재현은 두 탭을 동시에 열고 만료 직전에 새로고침하면 됩니다. 세 번에 한 번꼴로 재현됩니다.",
  },
};

/** 고칠 수 없다. 바탕이 `--input/50` 으로 내려앉는다. */
export const Disabled: Story = {
  args: { disabled: true, defaultValue: "재현 절차를 아직 적지 않았습니다." },
};

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Input } from "./input";

const meta = {
  title: "shared/Input",
  component: Input,
  args: { placeholder: "토큰 저장소의 경쟁 상태" },
  /**
   * 이름 없는 입력칸은 a11y 검사의 `label` 위반이다. `<label for>` 로 묶는 편이
   * `aria-label` 보다 낫다 — 라벨을 눌러도 칸에 포커스가 간다.
   */
  render: (args) => (
    <div className="flex w-72 flex-col gap-1.5">
      <label htmlFor="input-story" className="text-sm font-medium">
        사례 제목
      </label>
      <Input {...args} id="input-story" />
    </div>
  ),
  decorators: [
    (Story) => (
      <div className="bg-background p-8 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 빈 칸. placeholder 는 `--muted-foreground` 라 값과 구별된다. */
export const Default: Story = {};

/** 잘못된 값. `aria-invalid` 하나로 테두리·포커스 링이 `--destructive` 로 바뀐다. */
export const Invalid: Story = {
  args: { "aria-invalid": true, defaultValue: "제" },
};

/** 고칠 수 없다. 바탕이 `--input/50` 으로 내려앉고 포인터 이벤트가 꺼진다. */
export const Disabled: Story = {
  args: { disabled: true, defaultValue: "토큰 저장소의 경쟁 상태" },
};

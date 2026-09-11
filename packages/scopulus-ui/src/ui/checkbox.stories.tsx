import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";

import { Checkbox } from "./checkbox";

const LABEL = "공개 사례로 올린다";

const meta = {
  title: "shared/Checkbox",
  component: Checkbox,
  /**
   * 이름 없는 체크박스는 a11y 검사의 `aria-toggle-field-name` 위반이다. `id` 는 Base UI 가
   * 숨은 `<input>` 에 얹으므로, 그 `id` 를 가리키는 `<label>` 을 형제로 두면 접근 가능한
   * 이름이 생긴다. 루트 `<span role="checkbox">` 는 따로 생성된 id 를 쓰므로 충돌하지 않는다.
   */
  render: (args) => (
    <div className="flex items-center gap-2 text-sm">
      <Checkbox {...args} id="checkbox-story" />
      <label htmlFor="checkbox-story">{LABEL}</label>
    </div>
  ),
  decorators: [
    (Story) => (
      <div className="bg-background p-8 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 꺼진 상태가 기본이다. */
export const Default: Story = {
  /**
   * **누르면 실제로 뒤집히는지 본다.** 체크 표시는 `data-checked` 에 걸린 CSS 로만 나타나므로
   * 화면만 봐서는 상태가 바뀌었는지와 그림만 바뀌었는지를 가를 수 없다. `aria-checked` 로 본다.
   */
  play: async ({ canvasElement }) => {
    const box = within(canvasElement).getByRole("checkbox", { name: LABEL });
    await expect(box).toHaveAttribute("aria-checked", "false");
    await userEvent.click(box);
    await expect(box).toHaveAttribute("aria-checked", "true");
    await userEvent.click(box);
    await expect(box).toHaveAttribute("aria-checked", "false");
  },
};

/** 켜진 상태. 바탕이 `--primary`, 체크 표시가 `--primary-foreground` 다. */
export const Checked: Story = {
  args: { defaultChecked: true },
};

/** 누를 수 없다. 불투명도만 낮추는 것이 아니라 `disabled` 속성을 실제로 준다. */
export const Disabled: Story = {
  args: { disabled: true, defaultChecked: true },
};

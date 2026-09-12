import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";

import { Radio, RadioGroup } from "./radio";

const LEGEND = "공개 범위";

const meta = {
  title: "shared/Radio",
  component: RadioGroup,
  args: { legend: LEGEND, children: null },
  decorators: [
    (Story) => (
      <div className="bg-background p-8 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 셋 중 하나. `<fieldset>` + `<legend>` 라 화면 낭독기가 항목마다 묶음 이름과
 * "3개 중 몇 번" 을 함께 읽는다.
 */
export const Default: Story = {
  render: (args) => (
    <RadioGroup {...args}>
      <Radio name="visibility" value="public" defaultChecked>
        공개
      </Radio>
      <Radio name="visibility" value="link">
        링크를 아는 사람만
      </Radio>
      <Radio name="visibility" value="private">
        비공개
      </Radio>
    </RadioGroup>
  ),
  /**
   * **하나를 고르면 앞의 것이 실제로 풀리는지 본다.** 점은 `accent-color` 가 그리므로
   * 화면만 보면 그림이 바뀐 것과 값이 바뀐 것을 나눌 수 없다. `checked` 로 본다.
   */
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const first = canvas.getByRole("radio", { name: "공개" });
    const second = canvas.getByRole("radio", {
      name: "링크를 아는 사람만",
    });
    await expect(first).toBeChecked();
    await userEvent.click(second);
    await expect(second).toBeChecked();
    await expect(first).not.toBeChecked();
  },
};

/** 라벨 글자를 눌러도 고를 수 있다. 라벨이 원을 감싸고 있어서다. */
export const ClickLabel: Story = {
  render: (args) => (
    <RadioGroup {...args} legend="배포 방식">
      <Radio name="deploy" value="manual" defaultChecked>
        손으로 올린다
      </Radio>
      <Radio name="deploy" value="auto">
        머지하면 자동으로 올린다
      </Radio>
    </RadioGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText("머지하면 자동으로 올린다"));
    await expect(
      canvas.getByRole("radio", { name: "머지하면 자동으로 올린다" }),
    ).toBeChecked();
  },
};

/**
 * 키보드 초점. 폼 묶음과 같은 `ring-3` 이 걸린다 — 네이티브 라디오에도 그림자 링이
 * 실제로 그려지는지를 계산된 값으로 본다.
 */
export const Focused: Story = {
  render: (args) => (
    <RadioGroup {...args}>
      <Radio name="focus-visibility" value="public">
        공개
      </Radio>
      <Radio name="focus-visibility" value="private">
        비공개
      </Radio>
    </RadioGroup>
  ),
  play: async ({ canvasElement }) => {
    const first = within(canvasElement).getByRole("radio", { name: "공개" });
    await userEvent.tab();
    await expect(first).toHaveFocus();
    await expect(getComputedStyle(first).boxShadow).not.toBe("none");
  },
};

/** 고를 수 없는 항목. 라벨까지 함께 흐려진다. */
export const Disabled: Story = {
  render: (args) => (
    <RadioGroup {...args}>
      <Radio name="disabled-visibility" value="public" defaultChecked>
        공개
      </Radio>
      <Radio name="disabled-visibility" value="private" disabled>
        비공개 (유료 요금제에서만)
      </Radio>
    </RadioGroup>
  ),
};

/**
 * 고르지 않은 채로 보낸 경우. 오류는 **그룹 전체의 것**이라 항목마다 `aria-invalid` 를 준다 —
 * 하나에만 주면 어느 것이 잘못인지 말하게 된다.
 */
export const Invalid: Story = {
  render: (args) => (
    <RadioGroup {...args} legend="공개 범위 (필수)">
      <Radio name="invalid-visibility" value="public" aria-invalid>
        공개
      </Radio>
      <Radio name="invalid-visibility" value="private" aria-invalid>
        비공개
      </Radio>
    </RadioGroup>
  ),
};

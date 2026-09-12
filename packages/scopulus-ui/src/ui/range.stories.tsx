import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";

import { Label } from "./label";
import { Range } from "./range";

const LABEL = "본문 폭";

const meta = {
  title: "shared/Range",
  component: Range,
  args: { min: 0, max: 100, defaultValue: 40 },
  /**
   * 이름 없는 슬라이더는 a11y 검사의 `label` 위반이다. `<label for>` 로 묶으면 라벨을 눌러도
   * 초점이 슬라이더로 간다.
   */
  render: (args) => (
    <div className="flex w-72 flex-col gap-2">
      <Label htmlFor="range-story">{LABEL}</Label>
      <Range {...args} id="range-story" />
    </div>
  ),
  decorators: [
    (Story) => (
      <div className="bg-background p-8 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Range>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 0~100 사이에서 하나를 집는다. 채운 쪽이 `--primary` 다. */
export const Default: Story = {
  /** 화면 낭독기가 읽는 값은 `aria-valuenow` 다. 브라우저가 자동으로 붙인다. */
  play: async ({ canvasElement }) => {
    const slider = within(canvasElement).getByRole("slider", { name: LABEL });
    await expect(slider).toHaveValue("40");
  },
};

/** 단계가 있는 값. `step` 을 주면 그 배수에만 멈춘다. */
export const Stepped: Story = {
  args: { min: 0, max: 100, step: 25, defaultValue: 50 },
};

/** 범위가 0부터 시작하지 않아도 된다. 화면 낭독기가 읽는 상·하한이 `min`·`max` 다. */
export const CustomRange: Story = {
  args: { min: 320, max: 1024, step: 8, defaultValue: 768 },
  /**
   * `aria-valuemin` 을 속성으로 찾지 마라 — 네이티브 슬라이더는 그 값을 접근성 트리에만
   * 두고 DOM 속성으로 내보내지 않는다. 값의 출처는 `min`·`max` 속성이다.
   */
  play: async ({ canvasElement }) => {
    const slider = within(canvasElement).getByRole("slider", { name: LABEL });
    await expect(slider).toHaveAttribute("min", "320");
    await expect(slider).toHaveAttribute("max", "1024");
    await expect(slider).toHaveValue("768");
  },
};

/**
 * 키보드 초점. 초점 링은 폼 묶음과 같은 `ring-3` 이고, 네이티브 슬라이더에도 그림자 링이
 * 실제로 그려지는지를 계산된 값으로 본다.
 */
export const Focused: Story = {
  args: { min: 0, max: 100, step: 10, defaultValue: 40 },
  play: async ({ canvasElement }) => {
    const slider = within(canvasElement).getByRole("slider", { name: LABEL });
    await userEvent.tab();
    await expect(slider).toHaveFocus();
    await expect(getComputedStyle(slider).boxShadow).not.toBe("none");
  },
};

/** 움직일 수 없다. 불투명도만 낮추지 않고 `disabled` 속성을 실제로 준다. */
export const Disabled: Story = {
  args: { min: 0, max: 100, defaultValue: 40, disabled: true },
};

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { Button } from "./button";

const meta = {
  title: "shared/Button",
  component: Button,
  args: { onClick: fn(), children: "케이스 보기" },
  argTypes: {
    variant: { control: "inline-radio", options: ["default", "ghost"] },
    size: { control: "inline-radio", options: ["default", "icon"] },
  },
  decorators: [
    (Story) => (
      <div className="bg-background p-8 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  /** 눌리는지 본다. 버튼의 유일한 계약이다. */
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole("button", {
      name: "케이스 보기",
    });
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

/** 두 번째 강조. `theme-toggle.tsx:21` 이 이미 이 모양이다. */
export const Ghost: Story = {
  args: { variant: "ghost" },
};

/** `size="icon"` 은 `aria-label` 이 필수다. 보이는 라벨이 없어 이름이 거기서만 온다. */
export const Icon: Story = {
  args: {
    size: "icon",
    variant: "ghost",
    "aria-label": "테마 전환",
    children: (
      <svg
        viewBox="0 0 24 24"
        className="size-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        aria-hidden
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    ),
  },
};

/** 대비 하한이 3:1 이다(WCAG 1.4.11). `disabled` 속성을 실제로 준다 — 색만으로 표현하지 않는다. */
export const Disabled: Story = {
  args: { disabled: true },
  /**
   * **누르면 아무 일도 없어야 한다.** 스펙이 "`disabled` 속성을 실제로 주고 색만으로
   * 표현하지 마라" 고 정했는데, 그 값이 실제로 클릭을 막는지는 눌러 봐야만 안다.
   * 불투명도만 낮추고 핸들러가 그대로 도는 구현이 화면에서는 똑같이 보인다.
   */
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole("button", {
      name: "케이스 보기",
    });
    await expect(button).toBeDisabled();
    await userEvent.click(button, { pointerEventsCheck: 0 });
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

/** 두 variant 와 두 size 를 한 화면에서 견준다. 네 조합이 전부다. */
export const AllVariants: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-4">
      <Button {...args} variant="default">
        기본
      </Button>
      <Button {...args} variant="ghost">
        ghost
      </Button>
      <Button {...args} variant="default" size="icon" aria-label="기본 아이콘">
        ●
      </Button>
      <Button {...args} variant="ghost" size="icon" aria-label="ghost 아이콘">
        ●
      </Button>
    </div>
  ),
};

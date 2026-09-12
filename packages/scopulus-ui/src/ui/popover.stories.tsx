import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Button } from "./button";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "./popover";

const meta = {
  title: "shared/Popover",
  component: Popover,
  decorators: [
    (Story) => (
      <div className="flex min-h-48 items-start justify-center bg-background p-8 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 닫힌 상태. 눌러야 열린다. 팝업은 트리거 아래(`side="bottom"`)에 4px 띄워 앉는다. */
export const Default: Story = {
  render: (args) => (
    <Popover {...args}>
      <PopoverTrigger render={<Button variant="outline" />}>
        공개 설정
      </PopoverTrigger>
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>공개 범위</PopoverTitle>
          <PopoverDescription>
            공개로 두면 주소를 아는 누구나 읽을 수 있습니다.
          </PopoverDescription>
        </PopoverHeader>
      </PopoverContent>
    </Popover>
  ),
};

/**
 * 열린 모습. `Dialog` 와 달리 화면을 덮지 않고 트리거에 붙어 뜨므로 그대로 둬도 된다.
 *
 * `side="right"` 로 옆에 붙였다 — 위치 값은 `PopoverContent` 가 `Positioner` 에 넘긴다.
 */
export const Opened: Story = {
  args: { defaultOpen: true },
  render: (args) => (
    <Popover {...args}>
      <PopoverTrigger render={<Button variant="outline" />}>
        공개 설정
      </PopoverTrigger>
      <PopoverContent side="right" align="start">
        <PopoverHeader>
          <PopoverTitle>공개 범위</PopoverTitle>
          <PopoverDescription>
            공개로 두면 주소를 아는 누구나 읽을 수 있습니다.
          </PopoverDescription>
        </PopoverHeader>
      </PopoverContent>
    </Popover>
  ),
};

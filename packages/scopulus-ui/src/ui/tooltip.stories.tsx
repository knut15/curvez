import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Trash2Icon } from "lucide-react";

import { Button } from "./button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

const meta = {
  title: "shared/Tooltip",
  component: Tooltip,
  /**
   * **`TooltipProvider` 가 없으면 동작하지 않는다.** 여러 툴팁이 지연 시간을 공유하는 곳이
   * 프로바이더라, 앱에서는 최상위에 한 번 둔다. 스토리북에는 그 최상위가 없으니 여기서 감싼다.
   */
  decorators: [
    (Story) => (
      <TooltipProvider>
        <div className="flex min-h-40 items-center justify-center bg-background p-8 text-foreground">
          <Story />
        </div>
      </TooltipProvider>
    ),
  ],
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 닫힌 상태. 트리거에 포인터를 올리거나 포커스를 주면 뜬다. */
export const Default: Story = {
  render: (args) => (
    <Tooltip {...args}>
      <TooltipTrigger render={<Button variant="outline" />}>
        발행 취소
      </TooltipTrigger>
      <TooltipContent>공개 주소가 즉시 사라집니다</TooltipContent>
    </Tooltip>
  ),
};

/**
 * 아이콘만 있는 버튼이 툴팁의 본래 자리다.
 *
 * **툴팁이 이름을 대신하지 않는다.** 툴팁은 포인터를 올려야 뜨므로 버튼에는 `aria-label` 이
 * 따로 필요하다 — 없으면 a11y 검사가 `button-name` 으로 잡는다.
 */
export const IconButton: Story = {
  render: (args) => (
    <Tooltip {...args}>
      <TooltipTrigger
        render={<Button variant="ghost" size="icon" aria-label="사례 지우기" />}
      >
        <Trash2Icon className="size-5" aria-hidden />
      </TooltipTrigger>
      <TooltipContent>사례 지우기</TooltipContent>
    </Tooltip>
  ),
};

/** 뜬 모습. 바탕이 `--foreground`, 글자가 `--background` 로 본문과 뒤집혀 있다. */
export const Opened: Story = {
  args: { defaultOpen: true },
  render: (args) => (
    <Tooltip {...args}>
      <TooltipTrigger render={<Button variant="outline" />}>
        발행 취소
      </TooltipTrigger>
      <TooltipContent>공개 주소가 즉시 사라집니다</TooltipContent>
    </Tooltip>
  ),
};

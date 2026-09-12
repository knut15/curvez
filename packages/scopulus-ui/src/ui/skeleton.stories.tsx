import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Skeleton } from "./skeleton";

const meta = {
  title: "shared/Skeleton",
  component: Skeleton,
  decorators: [
    (Story) => (
      <div className="max-w-md bg-background p-8 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 크기는 컴포넌트가 정하지 않는다. 자리마다 다르므로 `className` 으로 바깥에서 준다 —
 * 여기서는 한 줄짜리 제목 자리다.
 */
export const Default: Story = {
  args: { className: "h-5 w-48" },
};

/**
 * 카드 한 장이 들어올 자리. **실제 카드와 같은 높이·간격으로 맞추는 것이 요점이다.**
 * 자리가 어긋나면 내용이 도착하는 순간 화면이 튀고, 그 튐은 로딩 자체보다 눈에 띈다.
 */
export const CardPlaceholder: Story = {
  args: { className: "h-5 w-3/4" },
  render: () => (
    <div className="flex flex-col gap-4 rounded-lg border border-border p-4">
      <Skeleton className="h-5 w-3/4" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/5" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
    </div>
  ),
};

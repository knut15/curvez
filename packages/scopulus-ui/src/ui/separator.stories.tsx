import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Separator } from "./separator";

const meta = {
  title: "shared/Separator",
  component: Separator,
  decorators: [
    (Story) => (
      <div className="max-w-5xl bg-background p-8 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 위아래 여백이 같아야 선이 두 덩어리의 가운데에 놓인다. 48/24 로 두면 선이 아래 블록에
 * 붙어 머리 장식으로 읽힌다 — 그래서 32/32 하나로 통일했다.
 */
export const Default: Story = {
  render: () => (
    <>
      <p>앞 덩어리가 여기서 끝난다.</p>
      <Separator />
      <p>뒤 덩어리가 여기서 시작한다.</p>
    </>
  ),
};

/** 폭은 부모가 정한다. 상세 화면의 본문 폭(`max-w-[68ch]`) 안에서 어떻게 보이는지 본다. */
export const InProseWidth: Story = {
  render: () => (
    <div className="mx-auto max-w-[68ch]">
      <p className="leading-relaxed break-keep">
        본문은 68ch 에서 멈춘다. 선이 스스로 폭을 정하면 본문과 어긋나므로
        `max-w-*` 를 붙이지 않는다.
      </p>
      <Separator />
      <p className="text-sm text-muted-foreground">
        이웃 글로 가는 내비게이션 자리.
      </p>
    </div>
  ),
};

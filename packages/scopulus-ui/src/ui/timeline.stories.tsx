import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Timeline, TimelineItem } from "./timeline";

const meta = {
  title: "shared/Timeline",
  component: Timeline,
  decorators: [
    (Story) => (
      <div className="max-w-md bg-background p-8 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Timeline>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 항목 셋. 선이 첫 점에서 시작해 마지막 점에서 끝난다 — 위아래로 삐져나온 토막이 없다.
 * 그 양 끝 처리가 `group-first:` 와 `group-last:` 한 줄씩이다.
 */
export const Default: Story = {
  args: { children: null },
  render: () => (
    <Timeline>
      <TimelineItem time="2026-09-10" dateTime="2026-09-10">
        토큰 문서를 화면에서 센 값으로 다시 썼다.
      </TimelineItem>
      <TimelineItem time="2026-09-11" dateTime="2026-09-11">
        shadcn base-nova 에서 11종을 받았다.
      </TimelineItem>
      <TimelineItem time="2026-09-12" dateTime="2026-09-12">
        Data display 묶음 넷을 더했다.
      </TimelineItem>
    </Timeline>
  ),
};

/**
 * 항목이 하나뿐일 때. 처음이자 마지막이라 선이 점에 완전히 가려 보이지 않는다 —
 * 이을 다음이 없는데 선이 남으면 목록이 잘린 것처럼 읽힌다.
 */
export const OneItem: Story = {
  args: { children: null },
  render: () => (
    <Timeline>
      <TimelineItem time="2026-09-12" dateTime="2026-09-12">
        여기서부터 기록을 남기기 시작했다.
      </TimelineItem>
    </Timeline>
  ),
};

/**
 * 내용이 글 한 줄이 아닐 때. `children` 은 무엇이든 받으므로 제목과 설명을 함께 넣을 수 있다.
 * 항목의 높이가 달라져도 선은 다음 점까지 이어진다.
 */
export const RichContent: Story = {
  args: { children: null },
  render: () => (
    <Timeline>
      <TimelineItem time="2026년 9월" dateTime="2026-09">
        <span className="font-medium">스펙을 먼저 썼다</span>
        <span className="mt-1 block text-muted-foreground">
          값과 근거를 정하고 나서 구현으로 갔다. 순서를 뒤집으면 코드가 스펙이
          된다.
        </span>
      </TimelineItem>
      <TimelineItem time="2026년 8월" dateTime="2026-08">
        <span className="font-medium">화면에서 값을 셌다</span>
        <span className="mt-1 block text-muted-foreground">
          간격 89건, 타이포 23건. 세지 않은 값은 문서에 적지 않았다.
        </span>
      </TimelineItem>
    </Timeline>
  ),
};

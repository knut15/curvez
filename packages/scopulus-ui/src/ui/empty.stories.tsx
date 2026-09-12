import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { Button } from "./button";
import { Empty } from "./empty";

const meta = {
  title: "shared/Empty",
  component: Empty,
  args: {
    title: "아직 기록이 없습니다",
    description: "첫 기록을 남기면 여기에 목록으로 쌓입니다.",
  },
  decorators: [
    (Story) => (
      <div className="max-w-xl bg-background p-8 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Empty>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 제목과 설명. 테두리 1px 만 있고 면은 부모의 것을 그대로 비춘다 —
 * 이 시스템에서 면을 가르는 것은 그림자가 아니라 테두리다.
 */
export const Default: Story = {};

/**
 * 설명 없이 제목만. 왜 비었는지 한 줄로 설명할 말이 없으면 억지로 채우지 않는다.
 * `gap-2` 가 사라져 상자 높이가 줄어든다.
 */
export const TitleOnly: Story = {
  args: { title: "검색 결과가 없습니다", description: undefined },
};

/**
 * 행동 하나. **이 컴포넌트가 버튼을 만들지 않는다** — `children` 으로 받는다.
 * 여기 들어올 수 있는 것은 `Button` 과 `AppLink` 둘이고, 어느 쪽인지는 부르는 쪽이 정한다.
 *
 * 설명에서 `mt-3`(12px) 떨어진다. 붙여 두면 설명의 마지막 줄로 읽힌다.
 */
export const WithAction: Story = {
  args: {
    title: "아직 기록이 없습니다",
    description: "첫 기록을 남기면 여기에 목록으로 쌓입니다.",
  },
  render: (args) => (
    <Empty {...args}>
      <Button onClick={fn()}>기록 쓰기</Button>
    </Empty>
  ),
};

/**
 * 긴 설명. `max-w-[65ch]` 에서 줄이 멈추고 `break-keep` 이 한글을 낱말 가운데에서 끊지 않는다.
 * 상자는 `w-full` 이라 부모를 채우지만 글자는 65자에서 멈춘다.
 */
export const LongDescription: Story = {
  args: {
    title: "조건에 맞는 케이스가 없습니다",
    description:
      "고른 태그 셋을 모두 가진 케이스가 없습니다. 태그를 하나 빼면 여섯 건이 나옵니다. 목록은 태그를 바꾸는 즉시 다시 계산됩니다.",
  },
};

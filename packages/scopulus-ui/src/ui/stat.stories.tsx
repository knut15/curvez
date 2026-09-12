import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Stat } from "./stat";

const meta = {
  title: "shared/Stat",
  component: Stat,
  decorators: [
    (Story) => (
      <div className="bg-background p-8 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Stat>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 한 쌍. 이름이 위, 값이 아래다. DOM 순서도 같아 읽는 순서가 뒤집히지 않는다. */
export const Default: Story = {
  args: { label: "누적 기록", value: "1,284" },
};

/**
 * 여러 개를 나란히 놓을 때. 감싸개는 컴포넌트가 아니라 쓰는 쪽이 만든다 —
 * 열 수와 간격은 화면마다 다르고, 그것까지 여기서 정하면 `Stat` 이 작은 카드가 된다.
 */
export const Row: Story = {
  args: { label: "누적 기록", value: "1,284" },
  render: () => (
    <div className="flex gap-8">
      <Stat label="누적 기록" value="1,284" />
      <Stat label="이번 주" value="37" />
      <Stat label="평균 길이" value="6.2분" />
    </div>
  ),
};

/**
 * `tabular-nums` 가 하는 일. 자릿수가 다른 값을 세로로 쌓아도 숫자 폭이 같아
 * 자리가 맞는다. 이 클래스가 없으면 `1` 이 `8` 보다 좁아 아랫줄이 어긋난다.
 */
export const TabularNumbers: Story = {
  args: { label: "1월", value: "1,111" },
  render: () => (
    <div className="flex flex-col gap-4">
      <Stat label="1월" value="1,111" />
      <Stat label="2월" value="8,888" />
      <Stat label="3월" value="1,818" />
    </div>
  ),
};

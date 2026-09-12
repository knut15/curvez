import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Steps } from "./steps";

const meta = {
  title: "shared/Steps",
  component: Steps,
  args: {
    steps: ["요구 정리", "화면 설계", "구현", "배포"],
    current: 1,
  },
  decorators: [
    (Story) => (
      <div className="bg-background p-8 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Steps>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 네 단계 가운데 두 번째. 앞은 완료(채운 원), 그 자리는 지금(`--ring` 테두리),
 * 뒤는 남은 단계(`--border` 테두리)다.
 *
 * 세 상태는 색으로만 말하지 않는다. 라벨 앞에 `완료,` · `지금 단계,` · `남은 단계,` 가
 * `sr-only` 로 붙고 지금 자리의 `<li>` 에는 `aria-current="step"` 이 붙는다.
 */
export const Default: Story = {};

/** 아직 시작한 자리가 첫 단계다. 완료가 0개다. */
export const FirstStep: Story = {
  args: { current: 0 },
};

/** 마지막 단계에 와 있다. 남은 단계가 0개이고 연결선도 여기서 끝난다. */
export const LastStep: Story = {
  args: { current: 3 },
};

/**
 * 다 끝난 뒤. `current` 가 마지막 자리보다 크면 전부 완료다.
 * 범위를 막지 않는 것이 "다 끝났다" 를 표현하는 방법이다.
 */
export const AllDone: Story = {
  args: { current: 4 },
};

/** 가장 짧은 절차. 단계 둘이면 연결선이 하나다. */
export const TwoSteps: Story = {
  args: { steps: ["작성", "발행"], current: 0 },
};

/**
 * 라벨이 길면 줄을 바꾸고 연결선이 그만큼 늘어난다. 선이 `absolute top-8 bottom-0` 이라
 * `<li>` 높이를 따라간다. 320px 상자에 넣어 그것을 본다.
 */
export const LongLabels: Story = {
  args: {
    steps: [
      "요구를 판정 가능한 수용 기준으로 바꾼다",
      "화면 구조와 토큰을 값으로 확정한다",
      "확정된 경계대로 구현한다",
    ],
    current: 1,
  },
  render: (args) => (
    <div className="w-[320px] border border-dashed border-border p-3">
      <Steps {...args} />
    </div>
  ),
};

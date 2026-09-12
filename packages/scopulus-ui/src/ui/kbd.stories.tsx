import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Kbd } from "./kbd";

const meta = {
  title: "shared/Kbd",
  component: Kbd,
  decorators: [
    (Story) => (
      <div className="bg-background p-8 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Kbd>;

export default meta;

// 유니온 props 라 `StoryObj<typeof meta>` 는 args 를 교집합(never)으로 접는다.
// 컴포넌트 타입을 직접 주면 각 스토리가 유니온의 한 갈래를 고른다.
type Story = StoryObj<typeof Kbd>;

/** 키 하나. `<kbd>` 한 개가 나온다. */
export const Default: Story = {
  args: { children: "K" },
};

/**
 * 조합 하나. 바깥 `<kbd>` 안에 키마다 `<kbd>` 가 들어가고 사이의 `+` 는 `aria-hidden` 이다.
 * 소리로는 "커맨드 케이" 로 들린다 — `+` 가 키처럼 읽히지 않는다.
 */
export const Combination: Story = {
  args: { keys: ["⌘", "K"] },
};

/** 키가 셋이어도 구분자 규칙은 같다. 첫 키 앞에는 `+` 가 붙지 않는다. */
export const ThreeKeys: Story = {
  args: { keys: ["Ctrl", "Shift", "Del"] },
};

/**
 * 본문 글 안에 섞일 때. `align-middle` 이 걸려 있어 앞뒤 글자의 가운데에 선다.
 * 한글 본문 옆에 놓아도 키 칸 안쪽만 `font-mono` 라 서체가 섞이지 않는다.
 */
export const InText: Story = {
  args: { children: "K" },
  render: () => (
    <p className="max-w-[68ch] leading-relaxed break-keep">
      검색은 <Kbd keys={["⌘", "K"]} /> 로 열고, 닫는 것은 <Kbd>Esc</Kbd> 다.
    </p>
  ),
};

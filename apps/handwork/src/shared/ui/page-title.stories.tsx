import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { PageTitle } from "./page-title";

const meta = {
  title: "shared/PageTitle",
  component: PageTitle,
  args: { children: "케이스" },
  argTypes: {
    variant: { control: "inline-radio", options: ["index", "detail"] },
  },
  decorators: [
    (Story) => (
      <div className="max-w-5xl bg-background p-8 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PageTitle>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 목록 화면. 실측 3곳(`case-index` · `lab-index` · `not-found`)이 이 형태다. */
export const Index: Story = {
  args: {
    description: "어떤 제약에서 무엇을 고르고 무엇을 버렸는지를 씁니다.",
  },
};

/** 설명 없이 제목만. `not-found` 처럼 설명 자리에 링크만 오는 화면이 있다. */
export const TitleOnly: Story = {};

/**
 * 상세 화면. 제목이 MDX 문장이라 두 줄 이상이 되고, 그때만 `leading-[1.15] break-keep` 이 붙는다.
 * 두 줄이 되도록 긴 제목을 넣었다 — 짧은 제목으로는 variant 차이가 화면에 드러나지 않는다.
 */
export const Detail: Story = {
  args: {
    variant: "detail",
    children: "토큰 저장소의 경쟁 상태를 고치면서 무엇을 버렸나",
    description: "제약 · 선택 · 버린 것 순서로 읽습니다.",
  },
};

/** 설명 폭 상한(`max-w-[65ch]`)이 실제로 걸리는지 본다. */
export const LongDescription: Story = {
  args: {
    description:
      "설명 문단은 65ch 에서 멈춘다. 이보다 긴 문장을 넣어도 줄이 더 길어지지 않고 다음 줄로 넘어간다. 한글은 break-keep 이라 어절 가운데에서 끊기지 않는다. 이 문장은 그 두 가지를 한 번에 보이기 위해 일부러 길게 썼다.",
  },
};

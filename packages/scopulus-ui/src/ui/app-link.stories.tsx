import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { AppLink } from "./app-link";

const meta = {
  title: "shared/AppLink",
  component: AppLink,
  args: { href: "/cases", children: "케이스 목록으로" },
  argTypes: {
    variant: { control: "inline-radio", options: ["inline", "bare"] },
  },
  decorators: [
    (Story) => (
      <div className="bg-background p-8 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AppLink>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 글 안에 섞이는 자리. 밑줄이 없으면 링크인지 알 수 없다. 실측 4곳이 이 형태다. */
export const Inline: Story = {};

/** 위치로 이미 구분되는 자리 — 헤더 워드마크, 이웃 글 내비게이션. 실측 2곳. */
export const Bare: Story = {
  args: { variant: "bare", children: "handwork®" },
};

/** 현재 화면을 가리키는 링크. 눌리게 두고 `aria-current="page"` 만 붙는다. */
export const Current: Story = {
  args: { current: true, children: "Cases" },
};

/**
 * **자기 색을 갖지 않는 것**이 이 컴포넌트의 핵심이다. 세 부모 색 위에 같은 링크를 놓아
 * 상속이 실제로 일어나는지 본다. hover 하면 셋 다 `--brand-accent` 한 색으로 모인다.
 */
export const InheritsParentColor: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      <p className="text-foreground">
        본문 색 위에서 — <AppLink {...args}>케이스 목록으로</AppLink>
      </p>
      <p className="text-muted-foreground">
        메타 줄 색 위에서 — <AppLink {...args}>케이스 목록으로</AppLink>
      </p>
      <p className="bg-brand-canvas px-3 py-2 text-brand-ink">
        헤더 바 색 위에서 — <AppLink {...args}>케이스 목록으로</AppLink>
      </p>
    </div>
  ),
};

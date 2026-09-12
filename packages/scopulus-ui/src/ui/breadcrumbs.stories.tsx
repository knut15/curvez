import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Breadcrumbs } from "./breadcrumbs";

const meta = {
  title: "shared/Breadcrumbs",
  component: Breadcrumbs,
  args: {
    items: [
      { label: "Home", href: "/" },
      { label: "Components", href: "/components" },
      { label: "Breadcrumbs" },
    ],
  },
  decorators: [
    (Story) => (
      <div className="bg-background p-8 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Breadcrumbs>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 세 계층. 마지막 항목만 링크가 아니고 `aria-current="page"` 를 갖는다. */
export const Default: Story = {};

/** 가장 짧은 경로. 링크 하나와 지금 자리 하나다. */
export const TwoLevels: Story = {
  args: {
    items: [{ label: "Home", href: "/" }, { label: "Components" }],
  },
};

/**
 * 항목이 하나면 링크가 0개다. 그 하나가 지금 자리다.
 * 이때도 `<nav>` 는 이름을 갖는다 — 빈 이름의 랜드마크를 만들지 않는다.
 */
export const SingleItem: Story = {
  args: { items: [{ label: "Components" }] },
};

/**
 * 색인 페이지가 없는 중간 계층. `href` 를 주지 않으면 링크 없이 글자만 나온다.
 * `aria-current="page"` 는 여전히 마지막 항목에만 붙는다.
 */
export const WithoutIndexPage: Story = {
  args: {
    items: [
      { label: "Home", href: "/" },
      { label: "Docs" },
      { label: "Navigation", href: "/docs/navigation" },
      { label: "Breadcrumbs" },
    ],
  },
};

/**
 * 좁은 폭에서는 옆으로 밀리지 않고 줄을 바꾼다. 가로 스크롤이면 경로 뒤쪽(지금 자리)이
 * 보이지 않는 채로 시작한다. 320px 상자에 넣어 그것을 본다.
 */
export const Wraps: Story = {
  args: {
    items: [
      { label: "Home", href: "/" },
      { label: "Components", href: "/components" },
      { label: "Navigation", href: "/components?group=navigation" },
      { label: "Breadcrumbs 안에서 줄을 바꾸는 긴 이름" },
    ],
  },
  render: (args) => (
    <div className="w-[320px] border border-dashed border-border p-3">
      <Breadcrumbs {...args} />
    </div>
  ),
};

/** `<nav>` 의 이름을 바꾼다. 한 화면에 이동 영역이 둘 이상일 때 서로 구별하는 값이다. */
export const CustomLabel: Story = {
  args: { label: "문서 경로" },
};

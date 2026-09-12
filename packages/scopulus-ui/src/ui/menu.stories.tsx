import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Menu, MenuScroll } from "./menu";

const groups = [
  {
    id: "layout",
    label: "Layout",
    items: [
      { href: "/components/card", label: "Card" },
      { href: "/components/page-shell", label: "PageShell" },
      { href: "/components/separator", label: "Separator" },
    ],
  },
  {
    id: "navigation",
    label: "Navigation",
    items: [
      { href: "/components/breadcrumbs", label: "Breadcrumbs" },
      { href: "/components/menu", label: "Menu" },
      { href: "/components/steps", label: "Steps" },
    ],
  },
];

const meta = {
  title: "shared/Menu",
  component: Menu,
  args: { groups, label: "컴포넌트", current: "/components/menu" },
  decorators: [
    (Story) => (
      <div className="w-52 bg-background p-8 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Menu>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 묶음 둘. `current` 와 주소가 정확히 같은 항목 하나에만 면이 깔린다. */
export const Default: Story = {};

/**
 * `current` 를 주지 않으면 켜지는 항목이 없다. 목록만 보이는 화면이 그렇다.
 * `aria-current="page"` 도 0개다.
 */
export const NoCurrent: Story = {
  args: { current: undefined },
};

/**
 * 완전 일치다. `/components` 를 넘겨도 `/components/menu` 는 켜지지 않는다.
 * 부분 일치면 두 항목이 동시에 켜져 `aria-current="page"` 가 둘이 된다.
 */
export const CurrentDoesNotMatch: Story = {
  args: { current: "/components" },
};

/** 묶음 이름이 없으면 소제목 없이 항목만 나오고 위 여백 `mt-1.5` 도 붙지 않는다. */
export const WithoutGroupLabel: Story = {
  args: {
    groups: [{ id: "all", items: groups[0].items.concat(groups[1].items) }],
    current: "/components/steps",
  },
};

/**
 * `MenuScroll` 에 담은 모습. 소제목은 목록 밖이라 `MenuScroll` 의 `children` 으로 넣는다.
 *
 * `-mt-16` 이 상자를 64px 끌어올리고 `pt-16` 이 안쪽에서 같은 값을 되돌리므로, 여기서는
 * 위 여백이 상쇄되어 감싼 상자의 맨 위에서 시작하는 것처럼 보인다. 높이는
 * `100vh - 4rem` 이라 캔버스보다 길면 이 상자 안에서만 스크롤된다.
 */
export const InScroll: Story = {
  decorators: [
    (Story) => (
      <div className="flex bg-background text-foreground">
        <Story />
      </div>
    ),
  ],
  render: (args) => (
    <MenuScroll>
      <p className="px-2 text-sm font-medium">Components</p>
      <div className="mt-4">
        <Menu {...args} />
      </div>
    </MenuScroll>
  ),
};

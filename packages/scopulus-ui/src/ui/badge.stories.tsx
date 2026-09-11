import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Badge } from "./badge";

const meta = {
  title: "shared/Badge",
  component: Badge,
  decorators: [
    (Story) => (
      <div className="bg-background p-8 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Badge>;

export default meta;

// 유니온 props 라 `StoryObj<typeof meta>` 는 args 를 교집합(never)으로 접는다.
// 컴포넌트 타입을 직접 주면 각 스토리가 유니온의 한 갈래를 고른다.
type Story = StoryObj<typeof Badge>;

/** 태그 칩. 실측 4자리가 전부 이 형태다. */
export const Tag: Story = {
  args: { children: "Next.js" },
};

/**
 * 칩이 여러 개일 때 `flex flex-wrap gap-2` 로 감싼다. 실측 네 자리 모두 같은 감싸개를 쓴다.
 * 목록 카드에서는 3개까지만 보이고 나머지는 `+N` 인데, 그 `+N` 은 Badge 가 아니라 그냥 글자다.
 */
export const TagGroup: Story = {
  args: { children: "Next.js" },
  render: () => (
    <span className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
      {["Next.js", "App Router", "MDX"].map((t) => (
        <Badge key={t}>{t}</Badge>
      ))}
      <span>+2</span>
    </span>
  ),
};

/** 진행 중. 점이 `--brand-accent` 다 — 사이트에서 강조색을 쓰는 유일한 상태다. */
export const StatusActive: Story = {
  args: { variant: "status", tone: "active", children: "진행 중" },
};

/**
 * 멈춤·마무리. 둘 다 `--muted-foreground` 다.
 *
 * 색으로 가르지 않는 이유는 상위 `tokens.md` 의 "강조색을 하나만 쓴다" 다. 셋을 색으로
 * 가르려면 색이 셋 필요하다. 차이는 옆에 붙은 글자가 말한다.
 */
export const StatusIdle: Story = {
  args: { variant: "status", tone: "idle", children: "멈춤" },
  render: (args) => (
    <span className="flex flex-col gap-3">
      <Badge {...args}>멈춤</Badge>
      <Badge variant="status" tone="idle">
        마무리
      </Badge>
    </span>
  ),
};

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Card } from "./card";

const meta = {
  title: "shared/Card",
  component: Card,
  args: { href: "/cases/token-store-race-condition" },
  decorators: [
    (Story) => (
      <div className="max-w-5xl bg-background p-8 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <>
        <span className="line-clamp-2 text-lg font-medium text-card-foreground">
          토큰 저장소의 경쟁 상태
        </span>
        <span className="line-clamp-3 text-sm text-muted-foreground">
          갱신 요청이 겹칠 때 이전 토큰이 뒤늦게 덮어쓰는 문제를 고쳤습니다.
        </span>
      </>
    ),
  },
};

/**
 * 2열 그리드에서 높이가 맞는지 본다. 카드를 감싸는 `<li className="flex">` 를 빼면 카드가
 * 내용 높이만큼만 차서 같은 행의 높이가 갈린다 — 그 차이를 여기서 드러낸다.
 */
export const InGrid: Story = {
  // `render` 가 children 을 직접 만들지만, args 는 컴포넌트 타입을 그대로 따르므로 채워 둔다.
  args: { children: null },
  render: (args) => (
    <ul role="list" className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {[
        ["짧은 제목", "한 줄 요약."],
        [
          "제목이 두 줄까지 늘어나는 경우를 보기 위한 조금 더 긴 제목",
          "요약도 세 줄까지 늘어납니다. line-clamp 가 그 위에서 자르고, 같은 행의 카드 높이는 그리드가 맞춥니다. 이 문장은 세 줄을 넘기려고 일부러 길게 썼습니다.",
        ],
      ].map(([title, summary]) => (
        <li key={title} className="flex">
          <Card href={args.href}>
            <span className="line-clamp-2 text-lg font-medium text-card-foreground">
              {title}
            </span>
            <span className="line-clamp-3 text-sm text-muted-foreground">
              {summary}
            </span>
          </Card>
        </li>
      ))}
    </ul>
  ),
};

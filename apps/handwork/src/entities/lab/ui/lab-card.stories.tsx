import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { LabCard } from "./lab-card";

/**
 * `CaseCard` 와 같은 면에 상태 줄 하나가 더 붙는다. 배지를 제목 위에 두는 이유는
 * 이 목록에서 먼저 읽어야 하는 것이 "얼마나 왔나" 이기 때문이다.
 *
 * **아직 `shared/ui/badge.tsx` 를 쓰지 않는다.** 상태 줄이 인라인으로 들어 있다.
 * 옮기는 절차와 그때 달라지는 값은 `apps/handwork/design/adoption.md` 7-2 에 있다.
 */
const meta = {
  title: "entities/LabCard",
  component: LabCard,
  args: {
    item: {
      slug: "curvez-design-system",
      title: "curvez 디자인 시스템",
      summary:
        "화면 코드에서 반복되는 클래스 문자열을 세어 컴포넌트를 뽑았다. 취향으로 정한 값이 하나도 없다.",
      date: "2026-09",
      status: "진행 중",
      tags: ["design-system", "storybook", "tokens"],
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-md bg-background p-8 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof LabCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** `진행 중` 만 점이 `--brand-accent` 다. 사이트에서 강조색을 쓰는 유일한 상태다. */
export const Active: Story = {};

/**
 * `멈춤` 과 `마무리` 는 둘 다 `--muted-foreground` 다. 색으로 가르지 않는 이유는
 * "강조색을 하나만 쓴다" 이고, 차이는 옆에 붙은 글자가 말한다.
 */
export const Idle: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      <LabCard item={{ ...args.item, slug: "a", status: "멈춤" }} />
      <LabCard item={{ ...args.item, slug: "b", status: "마무리" }} />
    </div>
  ),
};

/** 상태 3종을 한 화면에서 견준다. 점 색이 둘로만 갈리는 것을 여기서 확인한다. */
export const AllStatuses: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      {(["진행 중", "멈춤", "마무리"] as const).map((status) => (
        <LabCard key={status} item={{ ...args.item, slug: status, status }} />
      ))}
    </div>
  ),
};

/** 실제 목록 화면과 같은 2열 그리드. */
export const InGrid: Story = {
  decorators: [
    (Story) => (
      <div className="max-w-5xl bg-background p-8 text-foreground">
        <Story />
      </div>
    ),
  ],
  render: (args) => (
    <ul role="list" className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {[
        args.item,
        {
          ...args.item,
          slug: "mdx-collection",
          title: "MDX 컬렉션 로더",
          summary:
            "cases 와 labs 가 같은 로더를 쓴다. 빈 컬렉션이 빌드를 깨뜨린 기록.",
          status: "마무리" as const,
          date: "2026-09",
        },
      ].map((item) => (
        <li key={item.slug} className="flex">
          <LabCard item={item} />
        </li>
      ))}
    </ul>
  ),
};

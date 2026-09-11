import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { CaseCard } from "./case-card";

/**
 * `Card` 면 위에 케이스 데이터를 얹은 것이다. 면의 값은 `shared/Card` 스토리가 맡고,
 * 여기서는 **데이터가 카드를 어떻게 흔드는지**만 본다 — 긴 제목, 많은 태그, 2열 정렬.
 */
const meta = {
  title: "entities/CaseCard",
  component: CaseCard,
  args: {
    item: {
      slug: "token-store-race-condition",
      title: "토큰 스토어의 레이스 컨디션",
      summary:
        "여러 오디언스를 동시에 다루는 토큰 스토어에서 갱신이 겹쳐 터졌다. 무엇이 겹쳤고 어떤 순서로 막았는가.",
      date: "2026-08",
      role: "프론트엔드",
      tags: ["auth", "concurrency", "sdk"],
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-md bg-background p-8 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CaseCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 실제 `content/cases/token-store-race-condition.mdx` 의 frontmatter 그대로다. */
export const Default: Story = {};

/**
 * 태그는 3개까지만 보이고 나머지는 `+N` 이다. 그 `+N` 은 Badge 가 아니라 그냥 글자다 —
 * 면이 없어야 "태그가 더 있다" 와 "태그 하나" 가 구분된다.
 */
export const ManyTags: Story = {
  args: {
    item: {
      slug: "middleware-proxy-split",
      title: "미들웨어와 프록시를 가르다",
      summary: "한 곳에서 다 하던 것을 둘로 나눴다.",
      date: "2026-06",
      role: "프론트엔드",
      tags: ["next", "proxy", "middleware", "edge", "auth", "observability"],
    },
  },
};

/**
 * 제목 2줄·요약 3줄이 `line-clamp` 로 잘리는지 본다. 이 잘림이 없으면 2열 그리드에서
 * 같은 행의 카드 높이가 내용 길이대로 갈린다.
 */
export const Overflow: Story = {
  args: {
    item: {
      slug: "shared-sdk-design",
      title:
        "여러 서비스가 가져다 쓰는 SDK 를 설계하면서 버전과 호환을 어디까지 책임질 것인가를 정한 기록",
      summary:
        "SDK 의 표면이 넓어질수록 되돌리는 비용이 오른다. 무엇을 공개 API 로 두고 무엇을 감출지, 그 경계를 어떤 기준으로 그었는지를 적었다. 이 요약은 세 줄을 넘기려고 일부러 길게 썼다.",
      date: "2026-04",
      role: "프론트엔드",
      tags: ["sdk", "versioning", "dx"],
    },
  },
};

/** 실제 목록 화면과 같은 2열 그리드. `<li className="flex">` 가 카드 높이를 맞춘다. */
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
          slug: "middleware-proxy-split",
          title: "미들웨어와 프록시를 가르다",
          summary: "한 곳에서 다 하던 것을 둘로 나눴다.",
          date: "2026-06",
        },
      ].map((item) => (
        <li key={item.slug} className="flex">
          <CaseCard item={item} />
        </li>
      ))}
    </ul>
  ),
};

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Prose } from "./prose";

const meta = {
  title: "shared/Prose",
  component: Prose,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="bg-background px-5 py-10 text-foreground md:px-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Prose>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * MDX 가 내보내는 요소를 전부 한 번씩 담았다. 서식은 자손 선택자(`[&_h2]:` 꼴)로만 걸리므로,
 * 여기 없는 요소는 스타일이 없는 채로 화면에 나온다 — 그것을 드러내는 것이 이 스토리의 일이다.
 */
export const AllElements: Story = {
  args: {
    children: (
      <>
        <h2>제약이 먼저였다</h2>
        {/* MDX 가 내는 링크는 next/link 가 아니라 순수 <a> 다. PROSE 의 `[&_a]` 가 그것을 꾸민다.
            내부 경로 대신 외부 주소를 쓴 이유는 @next/next/no-html-link-for-pages 다 —
            MDX 본문에 내부 링크를 쓰면 전체 새로고침이 일어난다는 것이 그 규칙의 경고이고,
            그 문제는 mdx-components.tsx 에서 a 를 매핑해 풀 일이지 스토리에서 덮을 일이 아니다. */}
        <p>
          본문 문단은 68ch 에서 멈춘다. 링크는{" "}
          <a href="https://nextjs.org/docs">밑줄과 hover 색</a>으로 구분하고,
          hover 색은 사이트 전역에서 하나다.
        </p>
        <h3>무엇을 버렸나</h3>
        <p>
          인라인 코드는 <code>--ring</code> 처럼 면을 갖는다.
        </p>
        <ul>
          <li>순서 없는 목록 항목</li>
          <li>두 번째 항목</li>
        </ul>
        <ol>
          <li>순서 있는 목록 항목</li>
          <li>두 번째 항목</li>
        </ol>
        <blockquote>
          인용은 왼쪽에 2px 선을 두고 안쪽으로 밀어 넣는다.
        </blockquote>
        <pre>
          <code>{`export const PROSE = "leading-relaxed ...";`}</code>
        </pre>
        <p>
          코드 블록은 가로로 넘칠 때 자기 안에서 스크롤한다. 페이지 본문이
          옆으로 밀리지 않는다.
        </p>
      </>
    ),
  },
};

/** 짧은 글 하나. 위 여백(`mt-10`)이 실제로 붙는지 본다. */
export const Short: Story = {
  args: {
    children: <p>한 문단짜리 글도 같은 폭과 같은 위 여백을 갖는다.</p>,
  },
};

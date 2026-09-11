import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { PageShell } from "./page-shell";

/**
 * `flex-1` 이 `<body class="flex min-h-full flex-col">` 의 남은 높이를 먹는 것이 이 컴포넌트의
 * 절반이다. 스토리북 캔버스에는 그 body 가 없으므로, 데코레이터로 같은 조건을 만들어 준다.
 * 만들지 않으면 스토리에서 멀쩡해 보이고 실제 화면에서만 푸터가 떠오른다.
 */
const meta = {
  title: "shared/PageShell",
  component: PageShell,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="flex min-h-[60vh] flex-col bg-background text-foreground">
        <Story />
        <footer className="mx-auto w-full max-w-5xl px-5 py-8 text-xs text-muted-foreground md:px-8">
          여기가 푸터 자리다. 본문이 짧아도 아래에 붙어야 한다.
        </footer>
      </div>
    ),
  ],
} satisfies Meta<typeof PageShell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <>
        <h1 className="text-4xl font-bold tracking-[-0.02em]">본문</h1>
        <p className="mt-3 max-w-[65ch] leading-relaxed break-keep text-muted-foreground">
          좌우 여백은 좁은 화면 20px, 768px 이상에서 32px 다. 폭은 1024px 에서
          멈춘다.
        </p>
      </>
    ),
  },
};

/** 내용이 한 줄뿐이어도 푸터가 아래에 붙는지 본다. `flex-1` 이 빠지면 여기서 드러난다. */
export const ShortContent: Story = {
  args: {
    children: <p>한 줄.</p>,
  },
};

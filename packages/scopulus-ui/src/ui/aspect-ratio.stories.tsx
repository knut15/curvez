import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { AspectRatio } from "./aspect-ratio";
import { Skeleton } from "./skeleton";

const meta = {
  title: "shared/AspectRatio",
  component: AspectRatio,
  argTypes: {
    ratio: {
      control: "inline-radio",
      options: ["square", "video", "4/3", "3/2"],
    },
  },
  decorators: [
    (Story) => (
      <div className="max-w-md bg-background p-8 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AspectRatio>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 기본값은 16:9 다. 폭은 부모를 채우고 높이는 비에서 나온다.
 *
 * 상자 자신은 색도 테두리도 반경도 갖지 않는다 — 여기서 보이는 면은 안에 들어온 것의 것이다.
 */
export const Default: Story = {
  args: {
    children: (
      <div className="flex size-full items-center justify-center rounded-lg bg-muted text-xs text-muted-foreground">
        16:9
      </div>
    ),
  },
};

/**
 * 네 가지 비. 숫자를 받지 않고 이름 넷 중 하나를 받는다 —
 * `aspect-${w}/${h}` 로 조립한 클래스는 Tailwind 가 소스에서 찾지 못해 스타일이 사라진다.
 */
export const Ratios: Story = {
  args: { children: null },
  render: () => (
    <div className="flex flex-col gap-4">
      {(["square", "video", "4/3", "3/2"] as const).map((ratio) => (
        <AspectRatio key={ratio} ratio={ratio}>
          <div className="flex size-full items-center justify-center rounded-lg bg-muted text-xs text-muted-foreground">
            {ratio}
          </div>
        </AspectRatio>
      ))}
    </div>
  ),
};

/**
 * 정사각. 안의 요소를 채우는 일은 이 컴포넌트가 하지 않는다 —
 * `size-full` 은 자식이 스스로 갖는다. 채우면 안 되는 자식까지 늘리지 않기 위해서다.
 */
export const Square: Story = {
  args: {
    ratio: "square",
    children: (
      <div className="flex size-full items-center justify-center rounded-lg border border-border text-xs text-muted-foreground">
        1:1
      </div>
    ),
  },
};

/**
 * 이미지를 기다리는 동안. 상자가 이미 최종 높이를 잡고 있어 이미지가 도착해도 화면이 밀리지 않는다.
 * `Skeleton` 은 크기를 스스로 정하지 않으므로 `size-full` 을 준다.
 */
export const WaitingForImage: Story = {
  args: {
    children: <Skeleton className="size-full rounded-lg" />,
  },
};

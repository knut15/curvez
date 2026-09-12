import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";

import { Badge } from "./badge";
import { Button } from "./button";
import { Indicator } from "./indicator";

const meta = {
  title: "shared/Indicator",
  component: Indicator,
  argTypes: {
    position: {
      control: "inline-radio",
      options: ["top-right", "top-left", "bottom-right", "bottom-left"],
    },
  },
  decorators: [
    (Story) => (
      <div className="bg-background p-8 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Indicator>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 아이콘 버튼의 모서리에 얹는다. 표시가 상자 **밖으로 나가지 않아** 부모의 `overflow-hidden`
 * 에 잘리지 않는다. 대신 버튼의 모서리를 덮으므로 모서리에 내용이 없는 대상에만 쓴다.
 *
 * 표시에 `pointer-events-none` 이 붙어 있어 그 자리를 눌러도 버튼이 눌린다.
 */
export const Default: Story = {
  args: {
    badge: <Badge>3</Badge>,
    children: (
      <Button variant="outline" size="icon" aria-label="알림" onClick={fn()}>
        ●
      </Button>
    ),
  },
};

/**
 * 네 모서리. 변의 가운데 자리는 만들지 않았다 — 모서리 넷 밖의 다섯은 감싼 것의
 * 내용 한가운데를 덮는다.
 */
export const Positions: Story = {
  args: { badge: <Badge>N</Badge>, children: null },
  render: (args) => (
    <div className="flex flex-wrap gap-6">
      {(["top-right", "top-left", "bottom-right", "bottom-left"] as const).map(
        (position) => (
          <Indicator key={position} {...args} position={position}>
            <span className="flex size-20 items-center justify-center rounded-lg border border-border text-xs text-muted-foreground">
              {position}
            </span>
          </Indicator>
        ),
      )}
    </div>
  ),
};

/**
 * 점 하나. 숫자가 없어도 "무언가 있다" 만 말하면 되는 자리다.
 *
 * **점은 색으로만 말하므로 그 뜻을 글자로 함께 남긴다** — `sr-only` 한 줄이 그 일을 한다.
 * 그 글자를 감싸개의 `aria-label` 로 올리면 같은 말이 두 번 읽힌다.
 */
export const DotOnly: Story = {
  args: {
    badge: (
      <span className="block size-2 rounded-full bg-ring">
        <span className="sr-only">읽지 않음</span>
      </span>
    ),
    children: (
      <Button
        variant="outline"
        size="icon-sm"
        aria-label="받은 글"
        onClick={fn()}
      >
        ✉
      </Button>
    ),
  },
};

/**
 * 사각형 면 위. 아바타·썸네일처럼 모서리에 내용이 없는 대상이 이 컴포넌트의 본래 자리다.
 *
 * 읽는 순서는 `children` 먼저, 표시가 나중이다 — "이미지, 새 글" 로 읽힌다.
 * 뒤집으면 "새 글, 이미지" 가 되어 무엇의 새 글인지 알 수 없다.
 */
export const OnSurface: Story = {
  args: {
    badge: <Badge>새 글</Badge>,
    children: (
      <span className="flex size-24 items-center justify-center rounded-lg bg-muted text-xs text-muted-foreground">
        이미지
      </span>
    ),
  },
};

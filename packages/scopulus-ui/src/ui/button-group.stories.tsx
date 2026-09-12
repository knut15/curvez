import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { Button } from "./button";
import { ButtonGroup } from "./button-group";

const meta = {
  title: "shared/ButtonGroup",
  component: ButtonGroup,
  args: { label: "정렬" },
  decorators: [
    (Story) => (
      <div className="bg-background p-8 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 셋을 묶는다. 안쪽 모서리만 지워지고 양끝의 `rounded-md`(8px)는 `Button` 의 것이 그대로 남는다.
 * `-ml-px` 로 1px 씩 겹쳐 테두리가 두 겹으로 보이지 않는다.
 *
 * `variant="outline"` 이 본래 자리다 — 테두리가 있어야 겹칠 선이 있다.
 */
export const Default: Story = {
  args: {
    children: (
      <>
        <Button variant="outline" onClick={fn()}>
          최신순
        </Button>
        <Button variant="outline" onClick={fn()}>
          오래된순
        </Button>
        <Button variant="outline" onClick={fn()}>
          이름순
        </Button>
      </>
    ),
  },
};

/** 둘. 자식이 하나면 묶을 것이 없어 `Button` 을 그대로 쓴 것과 결과가 같다. */
export const Two: Story = {
  args: {
    label: "보기",
    children: (
      <>
        <Button variant="outline" onClick={fn()}>
          목록
        </Button>
        <Button variant="outline" onClick={fn()}>
          격자
        </Button>
      </>
    ),
  },
};

/**
 * 자식 하나가 비활성. 묶음에는 비활성 개념이 없고 그 버튼만 `disabled:opacity-50` 으로 흐려진다.
 * 묶음의 모양은 바뀌지 않는다.
 */
export const WithDisabledChild: Story = {
  args: {
    label: "쪽 이동",
    children: (
      <>
        <Button variant="outline" disabled>
          이전
        </Button>
        <Button variant="outline" onClick={fn()}>
          1
        </Button>
        <Button variant="outline" onClick={fn()}>
          다음
        </Button>
      </>
    ),
  },
};

/**
 * **가운데 버튼의 포커스 링이 이웃에 가리지 않아야 한다.** `Button` 의 링은 `outline-offset-2`
 * 라 버튼 밖 2px 에 그려지는데, `-ml-px` 로 겹쳐 선 오른쪽 이웃이 그 위를 덮는다.
 * 묶음이 `[&>*:focus-visible]:z-10` 으로 포커스를 받은 자식의 층을 올려 링 전체가 보인다.
 *
 * 링이 실제로 보이는지는 눈으로 봐야 하지만, **가운데 버튼에 포커스가 닿는지는 눌러서 확인한다.**
 * 묶음이 키보드 이동을 가로채면(roving tabindex 같은 것) 여기서 드러난다 —
 * 이 컴포넌트는 탭으로 하나씩 지나가는 것이 전부다.
 */
export const FocusRing: Story = {
  args: {
    label: "정렬",
    children: (
      <>
        <Button variant="outline" onClick={fn()}>
          최신순
        </Button>
        <Button variant="outline" onClick={fn()}>
          오래된순
        </Button>
        <Button variant="outline" onClick={fn()}>
          이름순
        </Button>
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(canvas.getByRole("button", { name: "최신순" })).toHaveFocus();
    await userEvent.tab();
    await expect(
      canvas.getByRole("button", { name: "오래된순" }),
    ).toHaveFocus();
  },
};

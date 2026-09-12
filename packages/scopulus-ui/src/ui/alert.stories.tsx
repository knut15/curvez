import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CircleAlertIcon, TriangleAlertIcon } from "lucide-react";

import { Alert, AlertAction, AlertDescription, AlertTitle } from "./alert";
import { Button } from "./button";

const meta = {
  title: "shared/Alert",
  component: Alert,
  argTypes: {
    variant: { control: "inline-radio", options: ["default", "destructive"] },
  },
  decorators: [
    (Story) => (
      <div className="max-w-md bg-background p-8 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 제목 한 줄과 설명 한 줄. `role="alert"` 이 붙어 있어 화면 낭독기가 내용이 바뀔 때 읽는다. */
export const Default: Story = {
  args: {
    children: (
      <>
        <AlertTitle>초안이 저장되었습니다</AlertTitle>
        <AlertDescription>
          마지막 저장은 방금 전입니다. 발행하기 전까지는 나에게만 보입니다.
        </AlertDescription>
      </>
    ),
  },
};

/**
 * 실패를 알린다. 글자색만 `--destructive` 로 바뀌고 바탕은 `--card` 그대로다.
 *
 * 아이콘은 `Alert` 의 **직접 자식**이어야 한다 — 레이아웃이
 * `has-[>svg]:grid-cols-[auto_1fr]` 로 아이콘 열을 그때만 만든다.
 */
export const Destructive: Story = {
  args: {
    variant: "destructive",
    children: (
      <>
        <TriangleAlertIcon aria-hidden />
        <AlertTitle>발행에 실패했습니다</AlertTitle>
        <AlertDescription>
          본문에 닫히지 않은 코드 블록이 있습니다. 137번째 줄을 확인해 주세요.
        </AlertDescription>
      </>
    ),
  },
};

/**
 * 오른쪽 위에 행동 하나를 붙인다. `AlertAction` 이 있으면 본문의 오른쪽 여백이
 * `pr-18` 로 벌어져 글자가 버튼 밑으로 들어가지 않는다.
 */
export const WithAction: Story = {
  args: {
    children: (
      <>
        <CircleAlertIcon aria-hidden />
        <AlertTitle>연결이 끊겼습니다</AlertTitle>
        <AlertDescription>
          네트워크가 돌아오면 자동으로 다시 붙습니다.
        </AlertDescription>
        <AlertAction>
          <Button variant="outline" size="default" className="h-8 px-3">
            다시 시도
          </Button>
        </AlertAction>
      </>
    ),
  },
};

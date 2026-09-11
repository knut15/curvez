import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Button } from "./button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";

const meta = {
  title: "shared/Dialog",
  component: Dialog,
  decorators: [
    (Story) => (
      <div className="bg-background p-8 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 닫힌 상태가 기본이다. 보이는 것은 여는 버튼 하나뿐이고, 눌러야 내용이 나온다.
 *
 * **`DialogTitle` 은 선택이 아니다.** 없으면 a11y 검사가 `aria-dialog-name` 으로 잡는다 —
 * 화면 낭독기가 다이얼로그에 들어왔을 때 읽을 이름이 거기서만 오기 때문이다.
 */
export const Default: Story = {
  render: (args) => (
    <Dialog {...args}>
      <DialogTrigger render={<Button variant="outline" />}>
        사례 지우기
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>이 사례를 지울까요?</DialogTitle>
          <DialogDescription>
            지운 사례는 되돌릴 수 없습니다. 공개된 주소도 함께 사라집니다.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  ),
};

/**
 * 바닥에 행동 두 개를 놓는다. `DialogFooter` 가 본문 여백을 음수 마진으로 뚫고 나가
 * 팝업 가장자리에 붙고, 좁은 화면에서는 세로로 뒤집혀 쌓인다(`flex-col-reverse`).
 */
export const WithFooter: Story = {
  render: (args) => (
    <Dialog {...args}>
      <DialogTrigger render={<Button />}>이름 바꾸기</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>사례 이름 바꾸기</DialogTitle>
          <DialogDescription>
            목록과 공개 주소에 함께 반영됩니다.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>취소</DialogClose>
          <Button>저장</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

/**
 * 열린 모습. 팝업은 화면 한가운데 `fixed` 로 앉으므로, 여러 스토리가 한 페이지에 늘어서는
 * 문서 페이지에서는 다른 스토리를 덮는다. 그래서 이 스토리만 `!autodocs` 로 빼 둔다 —
 * 사이드바에서는 그대로 열리고, 덮는 문제는 문서 페이지에서만 생긴다.
 *
 * `modal={false}` 인 이유도 같다. 모달이면 바깥 영역이 `inert` 가 되어 문서 페이지 전체가
 * 조작 불가능해진다. 모달 여부는 이 스토리가 보여주려는 것이 아니다.
 */
export const Opened: Story = {
  tags: ["!autodocs"],
  args: { defaultOpen: true, modal: false },
  render: (args) => (
    <Dialog {...args}>
      <DialogTrigger render={<Button variant="outline" />}>
        사례 지우기
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>이 사례를 지울까요?</DialogTitle>
          <DialogDescription>
            지운 사례는 되돌릴 수 없습니다. 공개된 주소도 함께 사라집니다.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>취소</DialogClose>
          <Button>지우기</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

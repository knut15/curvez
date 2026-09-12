import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SearchIcon } from "lucide-react";

import { InputGroup, InputGroupAddon, InputGroupInput } from "./input-group";
import { Label } from "./label";

const meta = {
  title: "shared/InputGroup",
  component: InputGroup,
  args: { children: null },
  decorators: [
    (Story) => (
      <div className="w-80 bg-background p-8 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof InputGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 앞 칸. 접두가 고정된 값에 쓴다 — 사용자가 그 글자를 다시 입력하지 않는다. */
export const Prefix: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Label htmlFor="group-url">사례 주소</Label>
      <InputGroup>
        <InputGroupAddon>https://</InputGroupAddon>
        <InputGroupInput id="group-url" placeholder="handwork.kr/cases/1" />
      </InputGroup>
    </div>
  ),
};

/** 뒤 칸. 단위처럼 값 뒤에 붙는 것이 여기 온다. */
export const Suffix: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Label htmlFor="group-hours">걸린 시간</Label>
      <InputGroup>
        <InputGroupInput
          id="group-hours"
          inputMode="numeric"
          placeholder="12"
        />
        <InputGroupAddon side="end">시간</InputGroupAddon>
      </InputGroup>
    </div>
  ),
};

/** 앞뒤 둘 다. 세 칸이 한 면으로 읽힌다. */
export const Both: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Label htmlFor="group-budget">예산</Label>
      <InputGroup>
        <InputGroupAddon>₩</InputGroupAddon>
        <InputGroupInput
          id="group-budget"
          inputMode="numeric"
          placeholder="1,200,000"
        />
        <InputGroupAddon side="end">/ 월</InputGroupAddon>
      </InputGroup>
    </div>
  ),
};

/**
 * 아이콘도 칸에 들어간다. 아이콘만 있는 칸은 뜻을 말하지 못하므로 `aria-hidden` 으로
 * 감추고 이름은 라벨이 맡는다.
 */
export const WithIcon: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Label htmlFor="group-search">사례 검색</Label>
      <InputGroup>
        <InputGroupAddon>
          <SearchIcon aria-hidden />
        </InputGroupAddon>
        <InputGroupInput
          id="group-search"
          type="search"
          placeholder="토큰 저장소"
        />
      </InputGroup>
    </div>
  ),
};

/** 잘못된 값. `aria-invalid` 는 안쪽 입력에 주고 테두리·링은 **그룹 전체**가 바꾼다. */
export const Invalid: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Label htmlFor="group-invalid">사례 주소</Label>
      <InputGroup>
        <InputGroupAddon>https://</InputGroupAddon>
        <InputGroupInput id="group-invalid" aria-invalid defaultValue="handw" />
      </InputGroup>
    </div>
  ),
};

/** 고칠 수 없다. 앞 칸까지 함께 흐려져야 한 덩어리로 읽힌다. */
export const Disabled: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Label htmlFor="group-disabled">사례 주소</Label>
      <InputGroup>
        <InputGroupAddon>https://</InputGroupAddon>
        <InputGroupInput
          id="group-disabled"
          disabled
          defaultValue="handwork.kr/cases/1"
        />
      </InputGroup>
    </div>
  ),
};

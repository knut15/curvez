import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Checkbox } from "./checkbox";
import { Input } from "./input";
import { Label } from "./label";

const meta = {
  title: "shared/Label",
  component: Label,
  args: { htmlFor: "label-story", children: "사례 제목" },
  decorators: [
    (Story) => (
      <div className="bg-background p-8 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * `htmlFor` 가 가리키는 컨트롤이 라벨의 이름을 받는다. 라벨 글자를 눌러도 칸에 초점이 간다.
 */
export const Default: Story = {
  render: (args) => (
    <div className="flex w-72 flex-col gap-2">
      <Label {...args} />
      <Input id={args.htmlFor} placeholder="토큰 저장소의 경쟁 상태" />
    </div>
  ),
};

/**
 * 필수 필드. **별표를 내지 않는다** — 화면 낭독기가 별표를 "별" 로 읽거나 건너뛰어 필수라는
 * 뜻이 전달되지 않는다. 필수임을 라벨 글자로 적는다.
 */
export const Required: Story = {
  args: { htmlFor: "label-required", children: "사례 제목 (필수)" },
  render: (args) => (
    <div className="flex w-72 flex-col gap-2">
      <Label {...args} />
      <Input id={args.htmlFor} required placeholder="토큰 저장소의 경쟁 상태" />
    </div>
  ),
};

/**
 * 체크박스에도 같은 방식으로 붙는다. Base UI 가 `id` 를 숨은 `<input>` 에 얹으므로
 * 그 `id` 를 가리키면 `role="checkbox"` 의 이름이 된다.
 */
export const WithCheckbox: Story = {
  args: { htmlFor: "label-checkbox", children: "공개 사례로 올린다" },
  render: (args) => (
    <div className="flex items-center gap-2">
      <Checkbox id={args.htmlFor} />
      <Label {...args} />
    </div>
  ),
};

/**
 * 컨트롤이 `disabled` 이면 라벨도 함께 흐려진다. `group/field` 를 가진 부모 안에서만
 * 그렇게 된다 — 그 부모를 실제로 세우는 것은 `Field` 다.
 */
export const DisabledControl: Story = {
  args: { htmlFor: "label-disabled", children: "사례 제목" },
  render: (args) => (
    <div className="group/field flex w-72 flex-col gap-2">
      <Label {...args} />
      <Input
        id={args.htmlFor}
        disabled
        defaultValue="토큰 저장소의 경쟁 상태"
      />
    </div>
  ),
};

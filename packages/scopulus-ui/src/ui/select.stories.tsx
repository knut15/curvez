import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

/**
 * `items` 를 주면 `SelectValue` 가 원본 값(`public`) 대신 라벨(`공개`)을 보여준다.
 * 주지 않으면 트리거에 `public` 이 그대로 뜬다.
 */
const SCOPES = {
  public: "공개",
  unlisted: "링크 아는 사람만",
  private: "비공개",
};

const meta = {
  title: "shared/Select",
  component: Select,
  decorators: [
    (Story) => (
      <div className="flex min-h-56 items-start bg-background p-8 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 닫힌 상태. 아직 고른 것이 없어 placeholder 가 `--muted-foreground` 로 뜬다.
 *
 * **트리거의 이름은 `aria-labelledby` 로만 온다.** 트리거는 `role="combobox"` 라서 안쪽
 * 글자가 이름이 되지 못한다 — 이름이 없으면 a11y 검사가 `aria-input-field-name` 으로 잡는다.
 */
export const Default: Story = {
  render: (args) => (
    <div className="flex flex-col gap-1.5">
      <span id="select-story-label" className="text-sm font-medium">
        공개 범위
      </span>
      <Select {...args} items={SCOPES}>
        <SelectTrigger
          aria-labelledby="select-story-label"
          className="w-56 justify-between"
        >
          <SelectValue placeholder="고르세요" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {Object.entries(SCOPES).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  ),
};

/**
 * 열린 목록. 고른 항목 오른쪽에 체크 표시가 붙는다 — 강조색을 쓰지 않고 표시로만 가른다.
 *
 * `Dialog` 와 달리 목록이 트리거에 붙어 뜨므로 문서 페이지를 덮지 않는다.
 */
export const Opened: Story = {
  args: { defaultOpen: true, defaultValue: "unlisted" },
  render: (args) => (
    <div className="flex flex-col gap-1.5">
      <span id="select-open-label" className="text-sm font-medium">
        공개 범위
      </span>
      <Select {...args} items={SCOPES}>
        <SelectTrigger
          aria-labelledby="select-open-label"
          className="w-56 justify-between"
        >
          <SelectValue placeholder="고르세요" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {Object.entries(SCOPES).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  ),
};

/** 고를 수 없다. 열리지도 않고 포인터 이벤트가 꺼진다. */
export const Disabled: Story = {
  args: { disabled: true, defaultValue: "private" },
  render: (args) => (
    <div className="flex flex-col gap-1.5">
      <span id="select-disabled-label" className="text-sm font-medium">
        공개 범위
      </span>
      <Select {...args} items={SCOPES}>
        <SelectTrigger
          aria-labelledby="select-disabled-label"
          className="w-56 justify-between"
        >
          <SelectValue placeholder="고르세요" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {Object.entries(SCOPES).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  ),
};

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { Field } from "./field";
import { Input } from "./input";
import { Textarea } from "./textarea";

const meta = {
  title: "shared/Field",
  component: Field,
  args: {
    id: "field-title",
    label: "사례 제목",
    children: (control) => (
      <Input {...control} placeholder="토큰 저장소의 경쟁 상태" />
    ),
  },
  decorators: [
    (Story) => (
      <div className="w-80 bg-background p-8 text-foreground">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 라벨과 컨트롤만. 설명도 오류도 없으면 그 요소를 아예 만들지 않는다. */
export const Default: Story = {
  /** 설명·오류가 없으면 `aria-describedby` 도 붙지 않는다. 빈 문자열을 남기지 않는다. */
  play: async ({ canvasElement }) => {
    const field = within(canvasElement).getByRole("textbox", {
      name: "사례 제목",
    });
    await expect(field).not.toHaveAttribute("aria-describedby");
    await expect(field).not.toHaveAttribute("aria-invalid");
  },
};

/** 보조 설명이 붙는다. 안내 글자(`placeholder`)와 달리 값을 넣어도 남아 있다. */
export const WithDescription: Story = {
  args: {
    id: "field-description",
    description: "목록 카드에 그대로 실린다. 40자를 넘기지 않는다.",
  },
  /** 설명의 `id` 가 `<id>-description` 이고 컨트롤이 그것을 가리킨다. */
  play: async ({ canvasElement }) => {
    const field = within(canvasElement).getByRole("textbox", {
      name: "사례 제목",
    });
    await expect(field).toHaveAttribute(
      "aria-describedby",
      "field-description-description",
    );
  },
};

/**
 * 오류가 있으면 두 가지가 함께 일어난다 — 컨트롤이 `aria-invalid` 가 되어 테두리와 링이
 * `--destructive` 로 바뀌고, 오류 문구가 `aria-describedby` 로 이어진다.
 */
export const WithError: Story = {
  args: {
    id: "field-error",
    error: "제목을 입력하십시오.",
  },
  /**
   * **문구가 화면에 보이는 것만으로는 부족하다.** 초점이 칸에 닿을 때 읽히려면 `id` 가
   * 실제로 이어져 있어야 한다. 그 연결을 속성으로 본다.
   */
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole("textbox", { name: "사례 제목" });
    await expect(field).toHaveAttribute("aria-invalid", "true");
    await expect(field).toHaveAttribute(
      "aria-describedby",
      "field-error-error",
    );
    await expect(canvas.getByText("제목을 입력하십시오.")).toHaveAttribute(
      "id",
      "field-error-error",
    );
  },
};

/** 둘 다 있으면 `aria-describedby` 에 두 `id` 가 DOM 순서대로 들어간다. */
export const WithDescriptionAndError: Story = {
  args: {
    id: "field-both",
    description: "목록 카드에 그대로 실린다.",
    error: "제목을 입력하십시오.",
  },
  play: async ({ canvasElement }) => {
    const field = within(canvasElement).getByRole("textbox", {
      name: "사례 제목",
    });
    await expect(field).toHaveAttribute(
      "aria-describedby",
      "field-both-description field-both-error",
    );
  },
};

/** 컨트롤이 무엇이든 같은 값을 받는다. 여러 줄이면 `Textarea` 가 들어온다. */
export const WithTextarea: Story = {
  args: {
    id: "field-summary",
    label: "사례 요약",
    description: "목록 카드에 두 줄까지 보인다.",
    children: (control) => <Textarea {...control} rows={3} />,
  },
};

/** 컨트롤이 `disabled` 이면 라벨이 함께 흐려진다. `group/field` 가 그 일을 한다. */
export const DisabledControl: Story = {
  args: {
    id: "field-disabled",
    children: (control) => (
      <Input {...control} disabled defaultValue="토큰 저장소의 경쟁 상태" />
    ),
  },
};

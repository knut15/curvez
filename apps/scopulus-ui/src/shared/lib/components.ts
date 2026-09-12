import { listSlugs } from "./mdx-collection";

/**
 * 컴포넌트 목록의 메타. **MDX frontmatter 가 아니라 여기서 정한다.**
 *
 * 이유: 목록의 순서와 묶음은 원고가 정할 값이 아니다. 원고마다 제각각 적으면 목록이
 * 원고 스무 편의 합의가 된다. 한 곳에서 정하고 원고는 설명만 쓴다.
 */

/** 목록 왼쪽에 세우는 묶음. 순서가 곧 화면 순서다. */
export const CATEGORIES = [
  { id: "actions", label: "Actions" },
  { id: "display", label: "Data display" },
  { id: "input", label: "Data input" },
  { id: "navigation", label: "Navigation" },
  { id: "layout", label: "Layout" },
  { id: "feedback", label: "Feedback" },
  { id: "overlay", label: "Overlay" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

type Entry = {
  name: string;
  summary: string;
  category: CategoryId;
};

const META: Record<string, Entry> = {
  "app-link": {
    name: "AppLink",
    summary: "주소를 바꾸는 이동 하나. hover 와 focus 를 한 색으로 모은다.",
    category: "actions",
  },
  badge: {
    name: "Badge",
    summary: "한 낱말짜리 메타 정보. 태그 칩과 상태 둘을 맡는다.",
    category: "display",
  },
  button: {
    name: "Button",
    summary: "주소를 바꾸지 않는 행동 하나.",
    category: "actions",
  },
  card: {
    name: "Card",
    summary: "목록 항목의 면. 면 전체가 링크 하나다.",
    category: "display",
  },
  "page-shell": {
    name: "PageShell",
    summary: "페이지 바깥 컨테이너. 폭과 여백을 한 자리에.",
    category: "layout",
  },
  "page-title": {
    name: "PageTitle",
    summary: "제목과 설명 문단을 한 벌로.",
    category: "layout",
  },
  prose: {
    name: "Prose",
    summary: "MDX 본문의 폭과 서식.",
    category: "display",
  },
  separator: {
    name: "Separator",
    summary: "덩어리 사이 가로줄과 여백.",
    category: "layout",
  },
  "theme-toggle": {
    name: "ThemeToggle",
    summary: "라이트와 다크를 전환한다.",
    category: "actions",
  },

  alert: {
    name: "Alert",
    summary: "짧은 알림 한 덩어리.",
    category: "feedback",
  },
  checkbox: {
    name: "Checkbox",
    summary: "켜고 끄는 선택 하나.",
    category: "input",
  },
  dialog: {
    name: "Dialog",
    summary: "화면을 덮는 모달. 초점을 가둔다.",
    category: "overlay",
  },
  input: {
    name: "Input",
    summary: "한 줄 텍스트 입력.",
    category: "input",
  },
  popover: {
    name: "Popover",
    summary: "기준 요소에 붙는 떠 있는 면.",
    category: "overlay",
  },
  select: {
    name: "Select",
    summary: "목록에서 하나를 고른다.",
    category: "input",
  },
  skeleton: {
    name: "Skeleton",
    summary: "내용이 오기 전 자리를 지킨다.",
    category: "feedback",
  },
  switch: {
    name: "Switch",
    summary: "즉시 적용되는 켜기와 끄기.",
    category: "input",
  },
  table: {
    name: "Table",
    summary: "행과 열로 읽는 데이터.",
    category: "display",
  },
  textarea: {
    name: "Textarea",
    summary: "여러 줄 텍스트 입력.",
    category: "input",
  },
  tooltip: {
    name: "Tooltip",
    summary: "가리킨 것의 이름을 짧게.",
    category: "display",
  },
  avatar: {
    name: "Avatar",
    summary: "사람이나 사물을 가리키는 작은 원형 그림.",
    category: "display",
  },
  breadcrumbs: {
    name: "Breadcrumbs",
    summary: "지금 있는 자리까지의 경로.",
    category: "navigation",
  },
  indicator: {
    name: "Indicator",
    summary: "다른 요소의 모서리에 붙는 표시.",
    category: "layout",
  },
  kbd: {
    name: "Kbd",
    summary: "눌러야 하는 키 하나.",
    category: "display",
  },
  loading: {
    name: "Loading",
    summary: "끝을 모르는 기다림.",
    category: "feedback",
  },
  menu: {
    name: "Menu",
    summary: "세로로 선 이동 목록.",
    category: "navigation",
  },
  progress: {
    name: "Progress",
    summary: "끝을 아는 진행.",
    category: "feedback",
  },
  radio: {
    name: "Radio",
    summary: "여럿 중 하나만 고른다.",
    category: "input",
  },
  range: {
    name: "Range",
    summary: "연속된 값에서 하나를 집는다.",
    category: "input",
  },
  stat: {
    name: "Stat",
    summary: "수치 하나와 그 이름.",
    category: "display",
  },
  steps: {
    name: "Steps",
    summary: "순서가 있는 단계와 지금 자리.",
    category: "navigation",
  },
  timeline: {
    name: "Timeline",
    summary: "시간 순으로 일어난 일.",
    category: "display",
  },
  "aspect-ratio": {
    name: "AspectRatio",
    summary: "가로세로 비를 고정한 상자.",
    category: "layout",
  },
  "button-group": {
    name: "ButtonGroup",
    summary: "붙어 선 버튼 여럿을 한 덩어리로.",
    category: "actions",
  },
  empty: {
    name: "Empty",
    summary: "보여 줄 것이 없을 때 그 자리를 말한다.",
    category: "feedback",
  },
  field: {
    name: "Field",
    summary: "라벨·입력·설명·오류를 한 벌로.",
    category: "input",
  },
  "input-group": {
    name: "InputGroup",
    summary: "입력 앞뒤에 붙는 칸.",
    category: "input",
  },
  label: {
    name: "Label",
    summary: "입력의 이름.",
    category: "input",
  },
};

export async function listComponents() {
  const slugs = await listSlugs("components");
  const missing = slugs.filter((s) => !META[s]);
  if (missing.length > 0) {
    // 조용히 빼지 않는다. 원고가 있는데 메타가 없으면 목록에서 사라져 아무도 모른다.
    throw new Error(
      `components.ts 에 메타가 없는 원고: ${missing.join(", ")}. META 에 추가하라.`,
    );
  }
  const order = new Map(CATEGORIES.map((c, i) => [c.id, i]));
  return slugs
    .map((slug) => ({ slug, ...META[slug] }))
    .sort(
      (a, b) =>
        order.get(a.category)! - order.get(b.category)! ||
        a.name.localeCompare(b.name),
    );
}

export function componentMeta(slug: string) {
  return META[slug];
}

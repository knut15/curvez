import { listSlugs } from "./mdx-collection";

/**
 * 컴포넌트 목록의 메타. **MDX frontmatter 가 아니라 여기서 정한다.**
 *
 * 이유: 근거(실측 / 받은 것)는 원고가 정할 값이 아니다. 원고를 쓰는 사람이 "실측" 이라고
 * 적으면 그 순간 검증되지 않은 값이 검증된 것처럼 실린다. 목록을 한 곳에 두고, 원고는
 * 설명만 쓴다.
 *
 * `evidence` 는 실측 횟수다. 받은 것에는 없다 — 없는 것을 지어내지 않는다.
 */
type Origin = "measured" | "vendored";

type Entry = {
  name: string;
  origin: Origin;
  evidence?: string;
  summary: string;
};

const META: Record<string, Entry> = {
  "app-link": {
    name: "AppLink",
    origin: "measured",
    evidence: "6곳",
    summary: "주소를 바꾸는 이동 하나. hover 와 focus 를 한 색으로 모은다.",
  },
  badge: {
    name: "Badge",
    origin: "measured",
    evidence: "4+2회",
    summary: "한 낱말짜리 메타 정보. 태그 칩과 상태 둘을 맡는다.",
  },
  button: {
    name: "Button",
    origin: "measured",
    evidence: "1건",
    summary: "주소를 바꾸지 않는 행동 하나.",
  },
  card: {
    name: "Card",
    origin: "measured",
    evidence: "2회",
    summary: "목록 항목의 면. 면 전체가 링크 하나다.",
  },
  "page-shell": {
    name: "PageShell",
    origin: "measured",
    evidence: "5회",
    summary: "페이지 바깥 컨테이너. 폭과 여백을 한 자리에.",
  },
  "page-title": {
    name: "PageTitle",
    origin: "measured",
    evidence: "3+2회",
    summary: "제목과 설명 문단을 한 벌로.",
  },
  prose: {
    name: "Prose",
    origin: "measured",
    evidence: "2곳",
    summary: "MDX 본문의 폭과 서식.",
  },
  separator: {
    name: "Separator",
    origin: "measured",
    evidence: "4회",
    summary: "덩어리 사이 가로줄과 여백.",
  },
  "theme-toggle": {
    name: "ThemeToggle",
    origin: "measured",
    evidence: "1건",
    summary: "라이트와 다크를 전환한다.",
  },

  alert: { name: "Alert", origin: "vendored", summary: "짧은 알림 한 덩어리." },
  checkbox: {
    name: "Checkbox",
    origin: "vendored",
    summary: "켜고 끄는 선택 하나.",
  },
  dialog: {
    name: "Dialog",
    origin: "vendored",
    summary: "화면을 덮는 모달. 초점을 가둔다.",
  },
  input: { name: "Input", origin: "vendored", summary: "한 줄 텍스트 입력." },
  popover: {
    name: "Popover",
    origin: "vendored",
    summary: "기준 요소에 붙는 떠 있는 면.",
  },
  select: {
    name: "Select",
    origin: "vendored",
    summary: "목록에서 하나를 고른다.",
  },
  skeleton: {
    name: "Skeleton",
    origin: "vendored",
    summary: "내용이 오기 전 자리를 지킨다.",
  },
  switch: {
    name: "Switch",
    origin: "vendored",
    summary: "즉시 적용되는 켜기와 끄기.",
  },
  table: {
    name: "Table",
    origin: "vendored",
    summary: "행과 열로 읽는 데이터.",
  },
  textarea: {
    name: "Textarea",
    origin: "vendored",
    summary: "여러 줄 텍스트 입력.",
  },
  tooltip: {
    name: "Tooltip",
    origin: "vendored",
    summary: "가리킨 것의 이름을 짧게.",
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
  return slugs
    .map((slug) => ({ slug, ...META[slug] }))
    .sort((a, b) =>
      a.origin === b.origin
        ? a.name.localeCompare(b.name)
        : a.origin === "measured"
          ? -1
          : 1,
    );
}

export function componentMeta(slug: string) {
  return META[slug];
}

/**
 * 컬렉션 전용 화면이 없는 메뉴의 글.
 *
 * `LabMeta`·`CaseMeta` 처럼 그 메뉴만의 필드(status·order)는 없다 — 새 메뉴는
 * 무엇을 담을지 아직 정해지지 않았고, 정해지면 그때 전용 entity 를 만든다.
 * 그때까지 **모든 메뉴가 공유하는 필드만** 읽는다.
 */
export type PageMeta = {
  title: string;
  summary: string;
  /** YYYY-MM. 목록 정렬 기준이다 */
  date?: string;
  /** 분류. 카드 메타 줄에 날짜와 함께 나온다 */
  role?: string;
  /** 섹션. Products·Tools·Ideas 로 묶을 때 쓴다 */
  group?: string;
  link?: string;
  tags?: string[];
};

export type PageSummary = PageMeta & { slug: string };

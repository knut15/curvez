/** 케이스 한 건의 메타. MDX 파일이 `meta` 로 내보내는 값과 같은 모양이다. */
export type CaseMeta = {
  title: string;
  summary: string;
  /** YYYY-MM. 목록 정렬 기준이다. */
  date: string;
  role: string;
  /**
   * 직접 등록한 썸네일. `public/thumbnails/<메뉴>/<slug>-<지문>.<확장자>` 를 가리킨다.
   *
   * **없는 것이 기본이다.** 키가 없으면 카드가 slug 로 만든 그림을 그린다(`CardGlyph`).
   * CMS 에서 이미지를 올리면 그때 이 키가 생긴다.
   */
  thumbnail?: string;
  tags: string[];
};

export type CaseSummary = CaseMeta & { slug: string };

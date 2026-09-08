/** 케이스 한 건의 메타. MDX 파일이 `meta` 로 내보내는 값과 같은 모양이다. */
export type CaseMeta = {
  title: string;
  summary: string;
  /** YYYY-MM. 목록 정렬 기준이다. */
  date: string;
  role: string;
  tags: string[];
};

export type CaseSummary = CaseMeta & { slug: string };

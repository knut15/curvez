/** 작업 한 건의 메타. MDX 파일이 `meta` 로 내보내는 값과 같은 모양이다. */
export type WorkMeta = {
  title: string;
  summary: string;
  /** YYYY-MM. 목록 정렬 기준이다. */
  date: string;
  role: string;
  /**
   * 실물 주소. 케이스·랩스에는 없는 값이다 — 저 둘은 읽는 글이고
   * 작업은 만든 것이라, 목록에서 바로 열어 볼 데가 있어야 한다.
   * 아직 공개 전이면 키째로 뺀다.
   */
  link?: string;
  tags: string[];
};

export type WorkSummary = WorkMeta & { slug: string };

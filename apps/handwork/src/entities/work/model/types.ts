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
  /**
   * 목록에서 어느 묶음에 들어가는가.
   *
   * `product` 는 사람이 열어서 쓰는 것이고, `tool` 은 그것을 만들려고 만든 것이다.
   * `idea` 는 만들기 전에 한 번 그려 본 것 — 구조 분석, 시안, 콘티 같은 것이다.
   *
   * 마흔 건 가까이 한 줄로 늘어놓으면 무엇이 결과물이고 무엇이 도구이고
   * 무엇이 스케치인지 구분이 안 된다.
   */
  group: "product" | "tool" | "idea";
};

export type WorkSummary = WorkMeta & { slug: string };

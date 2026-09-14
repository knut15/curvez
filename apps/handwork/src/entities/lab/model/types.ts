/** 실험 한 건의 메타. MDX 파일이 `meta` 로 내보내는 값과 같은 모양이다. */
export type LabMeta = {
  title: string;
  summary: string;
  /** YYYY-MM. 목록 정렬 기준이다. */
  date: string;
  /**
   * 지금 어디까지 왔는가. 목록에서 이 값이 배지로 나온다.
   * Cases 에는 없는 값이다 — 케이스는 결론이 난 판단 하나라 상태가 없다.
   */
  status: LabStatus;
  /**
   * 연재 안에서의 자리. 연재가 아닌 글에는 없다.
   *
   * 날짜만으로는 순서가 서지 않는다 — 한 연재는 대개 같은 달에 몰려 나오고
   * `date` 는 `YYYY-MM` 이라 그 안에서 전부 같은 값이 된다.
   */
  order?: number;
  tags: string[];
};

export const LAB_STATUSES = ["진행 중", "멈춤", "마무리"] as const;

export type LabStatus = (typeof LAB_STATUSES)[number];

export type LabSummary = LabMeta & { slug: string };

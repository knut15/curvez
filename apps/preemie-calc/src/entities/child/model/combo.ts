// F13 조합형 SEO 페이지 계산. 날짜를 쓰지 않는다(architecture ⑥). entities/child/model
// 안에서만 쓰는 조각이다(PLC-05).

// F13 조합형 SEO 페이지. 24~36주(13개) × 0~36개월(37개) = 481.
export const COMBO_WEEKS: readonly number[] = Array.from(
  { length: 36 - 24 + 1 },
  (_, i) => 24 + i,
);
export const COMBO_MONTHS: readonly number[] = Array.from({ length: 37 }, (_, i) => i);

export type ComboDescription = {
  weeksEarly: number;
  // 1개월=4주로 단순화해 weeksEarly 를 개월로 환산한 값이다(PLC-04). 이 값을 다시
  // 계산하는 곳을 늘리지 않기 위해 결과 필드로 낸다 — widget·view 는 이 필드를 그대로 쓴다.
  weeksEarlyMonths: number;
  correctedMonths: number;
  summary: string;
};

/** 날짜를 쓰지 않는다. weeks·months 조합만으로 계산한다. */
export function describeCombo(weeks: number, months: number): ComboDescription {
  const weeksEarly = 40 - weeks;
  // 1개월을 4주로 단순화해 조기분 주수를 개월로 환산한다 (decisions 참고).
  const weeksEarlyMonths = Math.round(weeksEarly / 4);
  const correctedMonths = months - weeksEarlyMonths;
  return {
    weeksEarly,
    weeksEarlyMonths,
    correctedMonths,
    summary: `예정일보다 ${weeksEarly}주 일찍 태어남`,
  };
}

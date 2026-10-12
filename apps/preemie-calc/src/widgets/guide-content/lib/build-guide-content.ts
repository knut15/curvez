// F13 조합형 SEO 페이지의 표시 문구 조립. 날짜를 쓰지 않는다(architecture ⑥) —
// weeks·months 조합만으로 계산해서 빌드한 날에 따라 내용이 바뀌지 않는다.
// entities/child(describeCombo)와 entities/checkup(roundAtAge)을 묶으므로 widget 이다
// (architecture "레이어 정의" 판정 (a), 2026-09-29 이의 3).
import { describeCombo } from "@/entities/child";
import { roundAtAge } from "@/entities/checkup";
import { siteName } from "@/shared/config/site";

export type GuideContent = {
  title: string;
  description: string;
  heading: string;
  correctionExplanation: string;
  checkupSummary: string;
};

export function buildGuideContent(weeks: number, months: number): GuideContent {
  const combo = describeCombo(weeks, months);
  const heading = `${weeks}주 출생, 생후 ${months}개월`;

  // 1개월=4주로 단순화한 환산은 entities/child/model:describeCombo 의 weeksEarlyMonths
  // 필드 하나로 낸다(PLC-04). 여기서 다시 계산하지 않는다.
  // 출산 예정일 전이면(음수) 교정 나이를 적용하지 않는다고 안내한다.
  const correctionExplanation =
    combo.correctedMonths >= 0
      ? `이 시기 교정 나이는 생후 ${months}개월에서 ${combo.weeksEarly}주(약 ${combo.weeksEarlyMonths}개월)를 뺀 교정 ${combo.correctedMonths}개월입니다.`
      : "이 시기는 아직 출산 예정일 전이라 교정 나이를 적용하지 않습니다.";

  // 1단계는 검진 안내만 넣는다. 접종 안내는 3단계(F10)에 더한다 (PC-F13-EX1).
  const round = roundAtAge({ months, days: 0 });
  const checkupSummary = round
    ? `이 시기는 영유아검진 ${round.label}(${round.sourceRangeText}) 대상 기간입니다.`
    : "이 시기에는 해당하는 영유아검진 차수가 없습니다.";

  const description = `${combo.summary}. ${correctionExplanation}`;

  return {
    title: `${heading} 교정연령 계산기 — ${siteName.value}`,
    description,
    heading,
    correctionExplanation,
    checkupSummary,
  };
}

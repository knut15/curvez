// F16. 질문형 가이드 6쪽의 목록. 라우트 slug 와 h1 문장(SPEC F16 목록 그대로)만 둔다.
// app(generateStaticParams·sitemap)과 목록 페이지가 함께 쓴다.
// TEAM-09: "corrected-age-until" 의 24·36개월은 미결 3(PRD-9-3)에 걸린 값이라 문장에 직접
// 적지 않고 entities/correction-period 의 공개 API 에서 읽는다(ARCH-107: data/*.json 은
// 슬라이스 밖에서 직접 읽지 않는다).
import {
  correctionPeriodDefaultUntilMonths,
  correctionPeriodExtended,
} from "@/entities/correction-period";

export type GuideQuestionSlug =
  | "vaccination"
  | "checkup-questionnaire"
  | "weaning"
  | "corrected-age-until"
  | "catch-up-growth"
  | "copay-relief";

export type GuideQuestion = {
  slug: GuideQuestionSlug;
  title: string;
  description: string;
};

export const GUIDE_QUESTIONS: readonly GuideQuestion[] = [
  {
    slug: "vaccination",
    title: "예방접종은 언제 맞나",
    description:
      "이른둥이 예방접종은 교정연령이 아니라 출생일부터 센 나이로 맞춥니다.",
  },
  {
    slug: "checkup-questionnaire",
    title: "영유아검진 문진표는 몇 개월로 쓰나",
    description:
      "검진 방문 날짜는 출생 기준, 문진표와 발달선별검사지는 교정 기준(24개월 검진까지)입니다.",
  },
  {
    slug: "weaning",
    title: "이유식은 언제 시작하나",
    description:
      "교정 6개월 전후를 기준으로 보고, 시작 시기는 의료진과 상담하세요.",
  },
  {
    slug: "corrected-age-until",
    title: "교정연령은 언제까지 쓰나",
    description: `교정연령을 쓰는 기간은 보통 ${correctionPeriodDefaultUntilMonths}개월, 더 작게 태어난 아이는 ${correctionPeriodExtended.untilMonths}개월까지로 알려져 있습니다. 원문 확인 전입니다.`,
  },
  {
    slug: "catch-up-growth",
    title: "따라잡기 성장은 되고 있나",
    description: "이른둥이의 성장 백분위는 교정연령을 기준으로 봅니다.",
  },
  {
    slug: "copay-relief",
    title: "본인부담 경감은 언제 끝나나",
    description:
      "이른둥이 외래 본인부담 경감 기간은 재태기간에 따라 5년 2개월에서 5년 4개월입니다.",
  },
];

export function findGuideQuestion(slug: string): GuideQuestion | undefined {
  return GUIDE_QUESTIONS.find((question) => question.slug === slug);
}

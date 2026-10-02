import type { Metadata } from "next";

import { COMBO_MONTHS, COMBO_WEEKS } from "@/entities/child";
import { buildGuideContent } from "@/widgets/guide-content";
import { GuideView } from "@/views/guide";

// F13. 481쪽(13주수 × 37개월)을 여기서 전부 만든다. sitemap.ts 도 같은 상수를 쓴다.
export function generateStaticParams() {
  return COMBO_WEEKS.flatMap((weeks) =>
    COMBO_MONTHS.map((months) => ({ weeks: String(weeks), months: String(months) })),
  );
}

// 위 481개 조합 밖의 요청은 정적으로 만들지 않는다 — 404 로 끝난다(빈 상태가 아니다).
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: PageProps<"/guide/[weeks]/[months]">): Promise<Metadata> {
  const { weeks, months } = await params;
  const content = buildGuideContent(Number(weeks), Number(months));
  return { title: content.title, description: content.description };
}

export default async function GuidePage({ params }: PageProps<"/guide/[weeks]/[months]">) {
  const { weeks, months } = await params;
  return <GuideView weeks={Number(weeks)} months={Number(months)} />;
}

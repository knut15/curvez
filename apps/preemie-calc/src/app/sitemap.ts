import type { MetadataRoute } from "next";

import { COMBO_MONTHS, COMBO_WEEKS } from "@/entities/child";
import { siteOrigin } from "@/shared/config/site";
import { GUIDE_QUESTIONS } from "@/views/guide-questions";

// architecture ⑥ 라우트 목록의 정적 경로 전부(guide 481개는 제외하고 아래에서 따로 더한다).
const STATIC_ROUTES = [
  "/",
  "/dashboard",
  "/dashboard/age-basis",
  "/dashboard/checkups",
  "/dashboard/copay-relief",
  "/dashboard/correction-period",
  "/share",
  // F17 가이드 목록, F18 "어느 나이를 쓰나" 공개판
  "/guide",
  "/guide/age-basis",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = siteOrigin.value;

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${origin}${path}`,
  }));

  // generateStaticParams(app/guide/[weeks]/[months]/page.tsx)와 같은 COMBO_WEEKS·COMBO_MONTHS 를
  // 써서 481 이 두 곳에서 어긋나지 않는다.
  const guideEntries: MetadataRoute.Sitemap = COMBO_WEEKS.flatMap((weeks) =>
    COMBO_MONTHS.map((months) => ({
      url: `${origin}/guide/${weeks}/${months}`,
    })),
  );

  // F16 질문형 가이드 6쪽. generateStaticParams(app/guide/questions/[slug]/page.tsx)와 같은 목록이다.
  const questionEntries: MetadataRoute.Sitemap = GUIDE_QUESTIONS.map(
    ({ slug }) => ({
      url: `${origin}/guide/questions/${slug}`,
    }),
  );

  return [...staticEntries, ...questionEntries, ...guideEntries];
}

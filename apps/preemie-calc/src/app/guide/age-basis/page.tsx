import type { Metadata } from "next";

import { AgeBasisPublicView } from "@/views/age-basis-public";

// F18. 프로필 없이 읽는 공개 정적 페이지.
export const metadata: Metadata = {
  title: "어느 나이를 쓰나 — 생후·교정 기준표",
  description:
    "예방접종, 영유아검진 방문, 문진표·발달선별검사지, 이유식, 발달 평가는 출생과 교정 중 어느 나이를 쓰는지 한 표로 보여줍니다.",
};

export default function AgeBasisPublicPage() {
  return <AgeBasisPublicView />;
}

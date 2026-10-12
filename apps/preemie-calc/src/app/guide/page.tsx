import type { Metadata } from "next";

import { GuideIndexView } from "@/views/guide-index";
import { GUIDE_QUESTIONS } from "@/views/guide-questions";

export const metadata: Metadata = {
  title: "이른둥이 가이드",
  description:
    "이른둥이 부모가 자주 묻는 질문과 출생 주수·생후 개월별 안내를 아이 정보 없이 읽어 보세요.",
};

// 두 view 는 서로 import 하지 않으므로 질문 목록은 app 이 이어 준다.
export default function GuideIndexPage() {
  return <GuideIndexView questions={GUIDE_QUESTIONS} />;
}

import type { Metadata } from "next";

import {
  GUIDE_QUESTIONS,
  GuideQuestionView,
  findGuideQuestion,
} from "@/views/guide-questions";

// PageProps<"/guide/questions/[slug]"> 는 next 가 만든 라우트 타입이 있어야 해서 빌드 전에는 쓸 수 없다.
type GuideQuestionPageProps = { params: Promise<{ slug: string }> };

// F16. 질문 6쪽을 빌드 때 만든다. sitemap.ts 도 같은 GUIDE_QUESTIONS 를 쓴다.
export function generateStaticParams() {
  return GUIDE_QUESTIONS.map(({ slug }) => ({ slug }));
}

// 위 6개 밖의 slug 는 정적으로 만들지 않는다 — 404 로 끝난다.
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: GuideQuestionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const question = findGuideQuestion(slug);
  return question
    ? { title: question.title, description: question.description }
    : {};
}

export default async function GuideQuestionPage({
  params,
}: GuideQuestionPageProps) {
  const { slug } = await params;
  const question = findGuideQuestion(slug);
  if (!question) return null;
  return <GuideQuestionView slug={question.slug} />;
}

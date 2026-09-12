import { notFound } from "next/navigation";
import { AppLink, PageTitle, Prose } from "@scopulus/ui";

import { listSlugs } from "@/shared/lib/mdx-collection";

const TITLES: Record<string, { title: string; summary: string }> = {
  "getting-started": {
    title: "시작하기",
    summary: "설치부터 첫 컴포넌트까지.",
  },
  tokens: {
    title: "토큰",
    summary:
      "색 · 간격 · 타이포 · 상태 · 고도. 값의 정본은 라이브러리의 tokens.css 다.",
  },
};

async function importDoc(slug: string) {
  return import(`@content/docs/${slug}.mdx`);
}

export async function generateStaticParams() {
  return (await listSlugs("docs")).map((slug) => ({ slug }));
}

export default async function DocPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const meta = TITLES[slug];
  if (!meta) notFound();

  const { default: Body } = await importDoc(slug);
  const others = (await listSlugs("docs")).filter((s) => s !== slug);

  return (
    <>
      <PageTitle description={meta.summary}>{meta.title}</PageTitle>
      <Prose>
        <Body />
      </Prose>
      {others.length > 0 ? (
        <p className="mt-10 text-sm text-muted-foreground">
          다음:{" "}
          {others.map((s) => (
            <AppLink key={s} href={`/docs/${s}`}>
              {TITLES[s]?.title ?? s}
            </AppLink>
          ))}
        </p>
      ) : null}
    </>
  );
}

import { notFound } from "next/navigation";
import { AppLink, PageTitle, Separator } from "@scopulus/ui";

import { componentMeta, listComponents } from "@/shared/lib/components";
import { listSlugs } from "@/shared/lib/mdx-collection";

/**
 * MDX 를 import 하는 함수는 공유하지 않는다. 번들러가 `import()` 의 경로를 정적으로 훑어
 * 대상 파일을 모으는데, 디렉터리까지 변수로 만들면 무엇을 모아야 할지 알 수 없게 된다.
 */
async function importDoc(slug: string) {
  return import(`@content/components/${slug}.mdx`);
}

export async function generateStaticParams() {
  return (await listSlugs("components")).map((slug) => ({ slug }));
}

export default async function ComponentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const meta = componentMeta(slug);
  if (!meta) notFound();

  const { default: Body } = await importDoc(slug);
  const all = await listComponents();
  const i = all.findIndex((c) => c.slug === slug);
  const prev = all[i - 1];
  const next = all[i + 1];

  return (
    <>
      <p className="flex items-center gap-2">
        <AppLink href="/components" variant="bare">
          <span className="text-sm text-muted-foreground">← Components</span>
        </AppLink>
      </p>

      <div className="mt-6">
        <PageTitle
          variant="detail"
          description={`ScopulusUI 의 ${meta.name} Components 입니다.`}
        >
          {meta.name}
        </PageTitle>
      </div>

      {/* `Prose` 를 쓰지 않는다. 그것은 `mx-auto max-w-[68ch]` 로 읽기 폭을 잡는데,
          컴포넌트 원고는 `Props` 와 `Example` 뿐이고 둘 다 `not-prose` 다. 68ch 로 좁히면
          제목만 왼쪽에 남아 96px 어긋나고, 프리뷰 상자도 좁아진다. 읽는 글은 `/docs` 가 맡는다. */}
      <div className="mt-10">
        <Body />
      </div>

      <Separator />

      <nav className="flex justify-between gap-4 text-sm">
        {prev ? (
          <AppLink href={`/components/${prev.slug}`} variant="bare">
            ← {prev.name}
          </AppLink>
        ) : (
          <span />
        )}
        {next ? (
          <AppLink href={`/components/${next.slug}`} variant="bare">
            {next.name} →
          </AppLink>
        ) : (
          <span />
        )}
      </nav>
    </>
  );
}

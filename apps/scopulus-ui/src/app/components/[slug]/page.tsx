import { notFound } from "next/navigation";
import {
  AppLink,
  Badge,
  PageShell,
  PageTitle,
  Prose,
  Separator,
} from "@scopulus/ui";

import { SiteFooter } from "@/widgets/site-footer";
import { SiteHeader } from "@/widgets/site-header";
import { componentMeta, listComponents } from "@/shared/lib/components";
import { listSlugs } from "@/shared/lib/mdx-collection";

/**
 * MDX 를 import 하는 함수는 공유하지 않는다. 번들러가 `import()` 의 경로를 정적으로 훑어
 * 대상 파일을 모으는데, 디렉터리까지 변수로 만들면 무엇을 모아야 할지 알 수 없게 된다.
 */
async function importDoc(slug: string) {
  return import(`../../../../content/components/${slug}.mdx`);
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
      <SiteHeader current="/components" />
      <PageShell>
        <p className="flex items-center gap-2">
          <AppLink href="/components" variant="bare">
            <span className="text-sm text-muted-foreground">← Components</span>
          </AppLink>
        </p>

        <div className="mt-6 flex items-center gap-2">
          <Badge
            variant="status"
            tone={meta.origin === "measured" ? "active" : "idle"}
          >
            {meta.origin === "measured" ? "실측" : "받은 것"}
          </Badge>
          {meta.evidence ? (
            <Badge>{meta.evidence}</Badge>
          ) : (
            <Badge>사용처 0곳</Badge>
          )}
        </div>

        <div className="mt-3">
          <PageTitle variant="detail" description={meta.summary}>
            {meta.name}
          </PageTitle>
        </div>

        <Prose>
          <Body />
        </Prose>

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
      </PageShell>
      <SiteFooter />
    </>
  );
}

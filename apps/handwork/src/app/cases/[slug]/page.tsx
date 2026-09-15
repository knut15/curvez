import { notFound } from "next/navigation";

import { listCases, loadCase } from "@/entities/case/api/cases";
import { CaseDetailView } from "@/views/case-detail";
import { SiteFooter } from "@/widgets/site-footer";
import { listMenus } from "@/shared/lib/menu";
import { SiteHeader } from "@/widgets/site-header";

export async function generateStaticParams() {
  const cases = await listCases();
  return cases.map(({ slug }) => ({ slug }));
}

export default async function CasePage({ params }: PageProps<"/cases/[slug]">) {
  const menus = await listMenus();
  const { slug } = await params;
  const loaded = await loadCase(slug);
  if (!loaded) notFound();

  const cases = await listCases();
  const index = cases.findIndex((item) => item.slug === slug);
  const prev = cases[index - 1] ?? null;
  const next = cases[index + 1] ?? null;

  const { Body, meta } = loaded;

  return (
    <>
      <SiteHeader menus={menus} current="case" label="Cases" title={meta.title} />
      <CaseDetailView
        meta={meta}
        prev={prev && { slug: prev.slug, title: prev.title }}
        next={next && { slug: next.slug, title: next.title }}
      >
        <Body />
      </CaseDetailView>
      <SiteFooter />
    </>
  );
}

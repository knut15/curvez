import { notFound } from "next/navigation";

import { listWorks, loadWork } from "@/entities/work/api/works";
import { WorkDetailView } from "@/views/work-detail";
import { SiteFooter } from "@/widgets/site-footer";
import { listMenus } from "@/shared/lib/menu";
import { SiteHeader } from "@/widgets/site-header";

export async function generateStaticParams() {
  const works = await listWorks();
  return works.map(({ slug }) => ({ slug }));
}

export default async function WorkPage({ params }: PageProps<"/works/[slug]">) {
  const menus = await listMenus();
  const { slug } = await params;
  const loaded = await loadWork(slug);
  if (!loaded) notFound();

  const works = await listWorks();
  const index = works.findIndex((item) => item.slug === slug);
  const prev = works[index - 1] ?? null;
  const next = works[index + 1] ?? null;

  const { Body, meta } = loaded;

  return (
    <>
      <SiteHeader menus={menus} current="work" label="Works" title={meta.title} />
      <WorkDetailView
        meta={meta}
        prev={prev && { slug: prev.slug, title: prev.title }}
        next={next && { slug: next.slug, title: next.title }}
      >
        <Body />
      </WorkDetailView>
      <SiteFooter />
    </>
  );
}

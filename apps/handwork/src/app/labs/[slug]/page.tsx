import { notFound } from "next/navigation";

import { listLabSlugs, loadLab } from "@/entities/lab/api/labs";
import { LabDetailView } from "@/views/lab-detail";
import { SiteFooter } from "@/widgets/site-footer";
import { listMenus } from "@/shared/lib/menu";
import { SiteHeader } from "@/widgets/site-header";

export async function generateStaticParams() {
  const slugs = await listLabSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function LabPage({ params }: PageProps<"/labs/[slug]">) {
  const menus = await listMenus();
  const { slug } = await params;
  const loaded = await loadLab(slug);
  if (!loaded) notFound();

  const { Body, meta } = loaded;

  return (
    <>
      <SiteHeader menus={menus} current="labs" label="Labs" title={meta.title} />
      <LabDetailView meta={meta}>
        <Body />
      </LabDetailView>
      <SiteFooter />
    </>
  );
}

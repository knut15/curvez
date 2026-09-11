import { notFound } from "next/navigation";

import { listLabSlugs, loadLab } from "@/entities/lab/api/labs";
import { LabDetailView } from "@/views/lab-detail";
import { SiteFooter } from "@/widgets/site-footer";
import { SiteHeader } from "@/widgets/site-header";

export async function generateStaticParams() {
  const slugs = await listLabSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function LabPage({ params }: PageProps<"/labs/[slug]">) {
  const { slug } = await params;
  const loaded = await loadLab(slug);
  if (!loaded) notFound();

  const { Body, meta } = loaded;

  return (
    <>
      <SiteHeader current="labs" />
      <LabDetailView meta={meta}>
        <Body />
      </LabDetailView>
      <SiteFooter />
    </>
  );
}

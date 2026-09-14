import { listWorks } from "@/entities/work/api/works";
import { WorkIndexView } from "@/views/work-index";
import { SiteFooter } from "@/widgets/site-footer";
import { SiteHeader } from "@/widgets/site-header";

export const metadata = {
  title: "Works — aster",
  description: "만들어서 내보낸 것.",
};

export default async function WorksPage() {
  const works = await listWorks();

  return (
    <>
      <SiteHeader current="works" />
      <WorkIndexView works={works} />
      <SiteFooter />
    </>
  );
}

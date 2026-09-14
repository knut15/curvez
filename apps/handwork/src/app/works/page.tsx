import { listWorks } from "@/entities/work/api/works";
import { WorkIndexView } from "@/views/work-index";
import { SiteFooter } from "@/widgets/site-footer";
import { SiteHeader } from "@/widgets/site-header";

export const metadata = {
  title: "Works — aster",
  description: "직접 만들어 내보낸 것들. 무엇을 어떤 제약 안에서 만들었는지.",
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

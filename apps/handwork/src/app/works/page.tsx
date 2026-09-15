import { listWorks } from "@/entities/work/api/works";
import { WorkIndexView } from "@/views/work-index";
import { SiteFooter } from "@/widgets/site-footer";
import { listMenus } from "@/shared/lib/menu";
import { SiteHeader } from "@/widgets/site-header";

export const metadata = {
  title: "Works — aster",
  description: "만든 제품과 도구. 무엇을 만들었고 지금 어디까지 왔는지.",
};

export default async function WorksPage() {
  const menus = await listMenus();
  const works = await listWorks();

  return (
    <>
      <SiteHeader menus={menus} current="works" />
      <WorkIndexView works={works} />
      <SiteFooter />
    </>
  );
}

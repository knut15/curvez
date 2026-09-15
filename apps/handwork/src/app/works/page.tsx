import { listWorks } from "@/entities/work/api/works";
import { WorkIndexView } from "@/views/work-index";
import { SiteFooter } from "@/widgets/site-footer";
import { listMenus } from "@/shared/lib/menu";
import { SiteHeader } from "@/widgets/site-header";

export const metadata = {
  title: "Works — aster",
  description: "직접 만든 앱과 도구, 기획과 시안을 소개하고 구현 과정과 개선할 점을 기록합니다.",
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

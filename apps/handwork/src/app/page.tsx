import { listCases } from "@/entities/case/api/cases";
import { listLabs } from "@/entities/lab/api/labs";
import { listWorks } from "@/entities/work/api/works";
import { HomeView } from "@/views/home";
import { SiteFooter } from "@/widgets/site-footer";
import { listMenus } from "@/shared/lib/menu";
import { SiteHeader } from "@/widgets/site-header";

export default async function HomePage() {
  const menus = await listMenus();
  const [works, cases, labs] = await Promise.all([
    listWorks(),
    listCases(),
    listLabs(),
  ]);

  return (
    <>
      <SiteHeader menus={menus} current="home" />
      <HomeView works={works} cases={cases} labs={labs} />
      <SiteFooter />
    </>
  );
}

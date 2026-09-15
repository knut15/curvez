import { listCases } from "@/entities/case/api/cases";
import { listLabs } from "@/entities/lab/api/labs";
import { listWorks } from "@/entities/work/api/works";
import { HomeView } from "@/views/home";
import { SiteFooter } from "@/widgets/site-footer";
import { SiteHeader } from "@/widgets/site-header";

export default async function HomePage() {
  const [works, cases, labs] = await Promise.all([
    listWorks(),
    listCases(),
    listLabs(),
  ]);

  return (
    <>
      <SiteHeader current="home" />
      <HomeView works={works} cases={cases} labs={labs} />
      <SiteFooter />
    </>
  );
}

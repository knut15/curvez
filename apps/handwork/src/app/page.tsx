import { listCases } from "@/entities/case/api/cases";
import { HomeView } from "@/views/home";
import { SiteFooter } from "@/widgets/site-footer";
import { SiteHeader } from "@/widgets/site-header";

export default async function HomePage() {
  const cases = (await listCases()).slice(0, 3);

  return (
    <>
      <SiteHeader current="home" />
      <HomeView cases={cases} />
      <SiteFooter />
    </>
  );
}

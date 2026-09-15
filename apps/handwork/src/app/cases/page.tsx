import { listCases } from "@/entities/case/api/cases";
import { CaseIndexView } from "@/views/case-index";
import { SiteFooter } from "@/widgets/site-footer";
import { listMenus } from "@/shared/lib/menu";
import { SiteHeader } from "@/widgets/site-header";

export const metadata = {
  title: "케이스 — aster",
  description: "자주 쓰면서도 대충 넘어가던 기술을 원리까지 파고든 글.",
};

export default async function CasesPage() {
  const menus = await listMenus();
  const cases = await listCases();

  return (
    <>
      <SiteHeader menus={menus} current="cases" />
      <CaseIndexView cases={cases} />
      <SiteFooter />
    </>
  );
}

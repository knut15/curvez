import { listCases } from "@/entities/case/api/cases";
import { CaseIndexView } from "@/views/case-index";
import { SiteFooter } from "@/widgets/site-footer";
import { listMenus } from "@/shared/lib/menu";
import { SiteHeader } from "@/widgets/site-header";

export const metadata = {
  title: "케이스 — aster",
  description: "앱을 만들며 해결한 문제와 배운 내용, 기술의 동작 원리와 적용 방법을 정리합니다.",
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

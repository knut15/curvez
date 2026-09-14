import { listCases } from "@/entities/case/api/cases";
import { CaseIndexView } from "@/views/case-index";
import { SiteFooter } from "@/widgets/site-footer";
import { SiteHeader } from "@/widgets/site-header";

export const metadata = {
  title: "케이스 — aster",
  description: "일하다 마주친 것을 원리까지 내려가 본 기록.",
};

export default async function CasesPage() {
  const cases = await listCases();

  return (
    <>
      <SiteHeader current="cases" />
      <CaseIndexView cases={cases} />
      <SiteFooter />
    </>
  );
}

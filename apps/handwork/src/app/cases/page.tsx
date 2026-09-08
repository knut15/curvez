import { listCases } from "@/entities/case/api/cases";
import { CaseIndexView } from "@/views/case-index";
import { SiteFooter } from "@/widgets/site-footer";
import { SiteHeader } from "@/widgets/site-header";

export const metadata = {
  title: "케이스 — handwork",
  description: "어떤 제약에서 무엇을 고르고 무엇을 버렸는지.",
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

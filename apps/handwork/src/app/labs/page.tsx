import { listLabs } from "@/entities/lab/api/labs";
import { LabIndexView } from "@/views/lab-index";
import { SiteFooter } from "@/widgets/site-footer";
import { listMenus } from "@/shared/lib/menu";
import { SiteHeader } from "@/widgets/site-header";

export const metadata = {
  title: "Labs — aster",
  description: "에이전트에게 일을 맡기려고 만든 규약과 도구.",
};

export default async function LabsPage() {
  const menus = await listMenus();
  const labs = await listLabs();

  return (
    <>
      <SiteHeader menus={menus} current="labs" />
      <LabIndexView labs={labs} />
      <SiteFooter />
    </>
  );
}

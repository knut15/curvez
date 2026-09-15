import { listLabs } from "@/entities/lab/api/labs";
import { LabIndexView } from "@/views/lab-index";
import { SiteFooter } from "@/widgets/site-footer";
import { listMenus } from "@/shared/lib/menu";
import { SiteHeader } from "@/widgets/site-header";

export const metadata = {
  title: "Labs — aster",
  description: "앱을 만드는 동안의 실험과 시행착오, 확인한 결과와 남은 질문을 기록합니다.",
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

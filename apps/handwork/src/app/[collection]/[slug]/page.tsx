import { notFound } from "next/navigation";

import { listPageSlugs, loadPage } from "@/entities/page/api/pages";
import { listMenus } from "@/shared/lib/menu";
import { PageDetailView } from "@/views/page-detail";
import { SiteFooter } from "@/widgets/site-footer";
import { SiteHeader } from "@/widgets/site-header";

/**
 * 전용 화면이 있어 이 동적 라우트를 타지 않는 메뉴.
 *
 * Next 는 정적 세그먼트를 먼저 맞추므로 이 값들을 빼지 않아도 **동작은 같다.**
 * 빼는 이유는 빌드다 — 넣어 두면 works 39편이 `/works/x` 와 `/[collection]/x`
 * 두 벌로 생성된다. 이 목록은 `src/app/` 에 실제로 있는 폴더와 짝이다.
 */
const DEDICATED = new Set(["works", "cases", "labs", "design"]);

export async function generateStaticParams() {
  const menus = await listMenus();
  const open = menus.filter((menu) => !DEDICATED.has(menu.slug));
  const nested = await Promise.all(
    open.map(async (menu) => {
      const slugs = await listPageSlugs(menu.slug);
      return slugs.map((slug) => ({ collection: menu.slug, slug }));
    }),
  );
  return nested.flat();
}

export default async function CollectionEntryPage({
  params,
}: PageProps<"/[collection]/[slug]">) {
  const { collection, slug } = await params;

  const menus = await listMenus();
  const menu = menus.find((entry) => entry.slug === collection);
  if (menu === undefined) notFound();

  const loaded = await loadPage(collection, slug);
  if (loaded === null) notFound();

  const { Body, meta } = loaded;

  return (
    <>
      <SiteHeader
        menus={menus}
        current={collection}
        label={menu.label}
        title={meta.title}
      />
      <PageDetailView meta={meta}>
        <Body />
      </PageDetailView>
      <SiteFooter />
    </>
  );
}

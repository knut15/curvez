import { byDateDesc, listSlugs } from "@/shared/lib/mdx-collection";

import type { PageMeta, PageSummary } from "../model/types";

type PageModule = {
  default: React.ComponentType;
  meta: PageMeta;
};

/**
 * 컬렉션과 slug 를 **둘 다 변수로** 받아 MDX 를 읽는다.
 *
 * 다른 entity(`labs`·`cases`)는 디렉터리를 리터럴로 적는다 — 번들러가 무엇을 모을지
 * 알게 하기 위해서다. 여기서는 그럴 수 없고, 대신 `content/*​/*.mdx` 전체가
 * 컨텍스트로 잡힌다. 전용 화면이 있는 메뉴는 여전히 자기 entity 를 쓰므로
 * 이 경로를 타는 것은 **전용 화면이 없는 새 메뉴뿐**이다.
 */
async function importPage(
  collection: string,
  slug: string,
): Promise<PageModule> {
  return (await import(
    `../../../../content/${collection}/${slug}.mdx`
  )) as PageModule;
}

export function listPageSlugs(collection: string): Promise<string[]> {
  return listSlugs(collection);
}

/** 목록용 요약. date 내림차순이고, date 가 없는 글은 뒤로 간다 */
export async function listPages(collection: string): Promise<PageSummary[]> {
  const slugs = await listPageSlugs(collection);
  const pages = await Promise.all(
    slugs.map(async (slug) => ({
      slug,
      ...(await importPage(collection, slug)).meta,
    })),
  );

  return pages.sort((a, b) =>
    byDateDesc({ date: a.date ?? "" }, { date: b.date ?? "" }),
  );
}

/** 상세용 본문 + 메타. 없으면 `null` 이고 404 판정은 호출부가 한다 */
export async function loadPage(
  collection: string,
  slug: string,
): Promise<{ Body: React.ComponentType; meta: PageMeta } | null> {
  const slugs = await listPageSlugs(collection);
  if (!slugs.includes(slug)) return null;

  const mod = await importPage(collection, slug);
  return { Body: mod.default, meta: mod.meta };
}

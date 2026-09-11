import { byDateDesc, listSlugs } from "@/shared/lib/mdx-collection";

import type { CaseMeta, CaseSummary } from "../model/types";

const COLLECTION = "cases";

type CaseModule = {
  default: React.ComponentType;
  meta: CaseMeta;
};

async function importCase(slug: string): Promise<CaseModule> {
  return (await import(`../../../../content/cases/${slug}.mdx`)) as CaseModule;
}

/** 콘텐츠 디렉터리의 slug 목록. 빌드 시점에만 돈다. */
export function listCaseSlugs(): Promise<string[]> {
  return listSlugs(COLLECTION);
}

/** 목록용 요약. date 내림차순으로 정렬한다. */
export async function listCases(): Promise<CaseSummary[]> {
  const slugs = await listCaseSlugs();
  const cases = await Promise.all(
    slugs.map(async (slug) => ({ slug, ...(await importCase(slug)).meta })),
  );
  return cases.sort(byDateDesc);
}

/** 상세용 본문 + 메타. 없는 slug 면 null 을 돌려주고, 404 판정은 호출부가 한다. */
export async function loadCase(
  slug: string,
): Promise<{ Body: React.ComponentType; meta: CaseMeta } | null> {
  const slugs = await listCaseSlugs();
  if (!slugs.includes(slug)) return null;

  const mod = await importCase(slug);
  return { Body: mod.default, meta: mod.meta };
}

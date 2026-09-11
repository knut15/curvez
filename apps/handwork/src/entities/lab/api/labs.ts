import { byDateDesc, listSlugs } from "@/shared/lib/mdx-collection";

import type { LabMeta, LabSummary } from "../model/types";

const COLLECTION = "labs";

type LabModule = {
  default: React.ComponentType;
  meta: LabMeta;
};

async function importLab(slug: string): Promise<LabModule> {
  return (await import(`../../../../content/labs/${slug}.mdx`)) as LabModule;
}

/** 콘텐츠 디렉터리의 slug 목록. 빌드 시점에만 돈다. */
export function listLabSlugs(): Promise<string[]> {
  return listSlugs(COLLECTION);
}

/** 목록용 요약. date 내림차순으로 정렬한다. */
export async function listLabs(): Promise<LabSummary[]> {
  const slugs = await listLabSlugs();
  const labs = await Promise.all(
    slugs.map(async (slug) => ({ slug, ...(await importLab(slug)).meta })),
  );
  return labs.sort(byDateDesc);
}

/** 상세용 본문 + 메타. 없는 slug 면 null 을 돌려주고, 404 판정은 호출부가 한다. */
export async function loadLab(
  slug: string,
): Promise<{ Body: React.ComponentType; meta: LabMeta } | null> {
  const slugs = await listLabSlugs();
  if (!slugs.includes(slug)) return null;

  const mod = await importLab(slug);
  return { Body: mod.default, meta: mod.meta };
}

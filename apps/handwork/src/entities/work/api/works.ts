import { byDateDesc, listSlugs } from "@/shared/lib/mdx-collection";

import type { WorkMeta, WorkSummary } from "../model/types";

const COLLECTION = "works";

type WorkModule = {
  default: React.ComponentType;
  meta: WorkMeta;
};

async function importWork(slug: string): Promise<WorkModule> {
  return (await import(`../../../../content/works/${slug}.mdx`)) as WorkModule;
}

/** 콘텐츠 디렉터리의 slug 목록. 빌드 시점에만 돈다. */
export function listWorkSlugs(): Promise<string[]> {
  return listSlugs(COLLECTION);
}

/** 목록용 요약. date 내림차순으로 정렬한다. */
export async function listWorks(): Promise<WorkSummary[]> {
  const slugs = await listWorkSlugs();
  const works = await Promise.all(
    slugs.map(async (slug) => ({ slug, ...(await importWork(slug)).meta })),
  );
  return works.sort(byDateDesc);
}

/** 상세용 본문 + 메타. 없는 slug 면 null 을 돌려주고, 404 판정은 호출부가 한다. */
export async function loadWork(
  slug: string,
): Promise<{ Body: React.ComponentType; meta: WorkMeta } | null> {
  const slugs = await listWorkSlugs();
  if (!slugs.includes(slug)) return null;

  const mod = await importWork(slug);
  return { Body: mod.default, meta: mod.meta };
}

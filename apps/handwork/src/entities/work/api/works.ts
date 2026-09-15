import {
  byDateDesc,
  listSlugs,
  readFirstImage,
} from "@/shared/lib/mdx-collection";

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

/**
 * 카드가 쓸 그림을 정한다. **등록한 썸네일 → 본문 첫 이미지 → (없으면) 자동 생성 그림** 순.
 *
 * 상세 화면은 이 값을 쓰지 않는다 — 본문 첫 이미지를 본문 위에 한 번 더 올리면
 * 같은 그림이 두 번 나온다. 상세는 등록한 썸네일(`meta.thumbnail`)만 본다.
 */
/** 목록용 요약. date 내림차순으로 정렬한다. */
export async function listWorks(): Promise<WorkSummary[]> {
  const slugs = await listWorkSlugs();
  const works = await Promise.all(
    slugs.map(async (slug) => {
      const meta = (await importWork(slug)).meta;
      return {
        slug,
        ...meta,
        thumbnail: meta.thumbnail ?? (await readFirstImage(COLLECTION, slug)),
      };
    }),
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

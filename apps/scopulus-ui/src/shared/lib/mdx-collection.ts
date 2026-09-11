import { readdir } from "node:fs/promises";
import path from "node:path";

/**
 * `content/<컬렉션>` 의 slug 목록. 빌드 시점에만 돈다.
 *
 * `_` 로 시작하는 파일은 뺀다 — 템플릿이나 초안이 라우트로 새어 나가지 않게 한다.
 */
export async function listSlugs(collection: string): Promise<string[]> {
  const dir = path.join(process.cwd(), "content", collection);
  const entries = await readdir(dir).catch(() => []);
  return entries
    .filter((name) => name.endsWith(".mdx") && !name.startsWith("_"))
    .map((name) => name.replace(/\.mdx$/, ""))
    .sort();
}

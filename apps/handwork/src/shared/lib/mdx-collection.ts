import { readdir } from "node:fs/promises";
import path from "node:path";

/**
 * 두 컬렉션(cases · labs)이 함께 쓰는 부분만 여기 둔다.
 *
 * **MDX 를 실제로 import 하는 함수는 공유하지 않는다.** 번들러가 `import()` 의 경로를
 * 정적으로 훑어 대상 파일을 모아 두는데, 디렉터리까지 변수로 만들면 무엇을 모아야 할지
 * 알 수 없게 된다. 그래서 각 컬렉션이 자기 경로를 리터럴로 들고 있고, 여기서는
 * 목록과 정렬만 나눈다.
 */

/**
 * 컬렉션 디렉터리의 slug 목록. 빌드 시점에만 돈다.
 *
 * `_` 로 시작하는 파일은 뺀다. 컬렉션이 비면 빌드가 깨지기 때문이다 — 번들러가
 * `content/<컬렉션>/*.mdx` 컨텍스트를 만들 대상이 하나도 없으면 module not found 로 끝난다.
 * 그래서 각 컬렉션은 `_template.mdx` 를 한 장 두고, 그 파일은 목록에도 라우트에도 나오지 않는다.
 */
export async function listSlugs(collection: string): Promise<string[]> {
  const dir = path.join(process.cwd(), "content", collection);
  const entries = await readdir(dir).catch(() => []);
  return entries
    .filter((name) => name.endsWith(".mdx") && !name.startsWith("_"))
    .map((name) => name.replace(/\.mdx$/, ""));
}

/** 최신이 위로. date 는 YYYY-MM 이라 문자열 비교로 충분하다. */
export function byDateDesc<T extends { date: string }>(a: T, b: T): number {
  return b.date.localeCompare(a.date);
}

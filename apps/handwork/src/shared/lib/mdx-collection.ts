import { readFile, readdir } from "node:fs/promises";
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

/**
 * 본문에 실린 **첫 이미지**. 없으면 `undefined`.
 *
 * 목록 카드가 쓴다. CMS 에서 썸네일을 따로 등록하지 않아도, 글 안에 이미 그림이 있으면
 * 그것이 그 글의 얼굴이다 — Cases·Labs 는 대부분 도판을 한 장씩 달고 있어 자동 생성
 * 그림보다 본문의 그림이 훨씬 많은 것을 말해 준다.
 *
 * **마크다운 이미지(`![](…)`)만 본다. `<img>` 태그는 무시한다.** 본문에는 설명하려고
 * 적어 둔 예시 마크업도 있고(`<img src="https://…" width="0">` 같은 것), 그것을 카드에
 * 걸면 남의 주소로 요청이 나가거나 0×0 짜리 빈 칸이 뜬다.
 *
 * **사이트 안 경로(`/` 로 시작)만 받는다.** 바깥 주소는 우리가 수명을 보장할 수 없고,
 * 카드 스무 장이 남의 서버를 함께 때린다.
 *
 * 빌드 시점에만 돈다. `listSlugs` 와 같은 자리의 코드다.
 */
const MARKDOWN_IMAGE = /!\[[^\]]*\]\((\/[^)\s]+)\)/;

export async function readFirstImage(
  collection: string,
  slug: string,
): Promise<string | undefined> {
  const file = path.join(process.cwd(), "content", collection, `${slug}.mdx`);
  const source = await readFile(file, "utf8").catch(() => null);
  if (source === null) return undefined;

  return MARKDOWN_IMAGE.exec(source)?.[1];
}

/** 최신이 위로. date 는 YYYY-MM 이라 문자열 비교로 충분하다. */
export function byDateDesc<T extends { date: string }>(a: T, b: T): number {
  return b.date.localeCompare(a.date);
}

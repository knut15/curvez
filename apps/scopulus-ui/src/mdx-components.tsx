import type { MDXComponents } from "mdx/types";
import Link from "next/link";

/**
 * App Router 의 `@next/mdx` 가 요구하는 규약 파일. 없으면 `@mdx-js/react` 의 provider
 * 경로로 빠지고, 서버 컴포넌트에는 `createContext` 가 없어 빌드가 깨진다.
 *
 * **내부 링크를 `next/link` 로 바꾼다.** `basePath` 가 `/curvez` 라, MDX 가 내는 순수
 * `<a href="/components/button">` 은 그 접두를 못 받아 404 가 된다. 여기서 한 번 매핑하면
 * 원고는 `[버튼](/components/button)` 이라고만 쓰면 된다.
 */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    a: ({ href = "", children, ...props }) =>
      href.startsWith("/") ? (
        <Link href={href} {...props}>
          {children}
        </Link>
      ) : (
        <a href={href} target="_blank" rel="noreferrer" {...props}>
          {children}
        </a>
      ),
    ...components,
  };
}

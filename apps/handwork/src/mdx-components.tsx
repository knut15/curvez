import type { MDXComponents } from "mdx/types";

/**
 * @next/mdx 가 App Router 에서 요구하는 규약 파일이다. 위치와 이름을 프레임워크가 정한다.
 * 매핑을 비워 두면 기본 HTML 태그로 렌더되고, 스타일은 CaseDetailView 의 article 이 준다.
 */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return { ...components };
}

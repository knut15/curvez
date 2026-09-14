import type { MDXComponents } from "mdx/types";

/**
 * @next/mdx 가 App Router 에서 요구하는 규약 파일이다. 위치와 이름을 프레임워크가 정한다.
 * 서식은 PROSE 가 주고, 여기서는 태그 하나로 감쌀 수 없는 것만 맡는다.
 */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    // 본문 폭이 68ch 라 세 열짜리 비교표는 넘친다. 표만 자기 안에서 가로로 밀리게 하고
    // 페이지 본문은 옆으로 안 밀리게 한다. CSS 로는 못 한다 — table 에 overflow 를 주려면
    // display 를 block 으로 바꿔야 하고, 그러면 열 너비 계산이 통째로 깨진다.
    table: (props) => (
      <div className="my-6 overflow-x-auto">
        <table {...props} />
      </div>
    ),
  };
}

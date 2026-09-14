import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 케이스 본문이 MDX 라 라우트 파일 확장자에 mdx 를 더한다.
  pageExtensions: ["ts", "tsx", "mdx"],
};

// 표는 GFM 확장이라 이 플러그인 없이는 `| a | b |` 가 글자 그대로 나온다.
// 원고의 트레이드오프 절이 전부 표라서 빠지면 본문 절반이 깨져 보인다.
//
// 플러그인을 import 해서 넘기지 않고 이름 문자열로 적는다. Turbopack 은 로더 옵션을
// 직렬화해서 워커로 보내기 때문에 함수나 객체를 넘기면 빌드가 통째로 실패한다.
const withMDX = createMDX({
  options: { remarkPlugins: [["remark-gfm", {}]] },
});

export default withMDX(nextConfig);

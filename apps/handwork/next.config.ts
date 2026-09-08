import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 케이스 본문이 MDX 라 라우트 파일 확장자에 mdx 를 더한다.
  pageExtensions: ["ts", "tsx", "mdx"],
};

const withMDX = createMDX();

export default withMDX(nextConfig);

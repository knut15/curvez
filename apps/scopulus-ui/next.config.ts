import createMDX from "@next/mdx";
import type { NextConfig } from "next";

/**
 * GitHub Pages 로 정적 배포한다.
 *
 * **`basePath` 가 필요하다.** 프로젝트 페이지라 URL 이 `knut15.github.io/curvez/` 다.
 * `next/link` 와 `next/image` 는 이 값을 자동으로 붙이지만, 손으로 쓴 `<a href="/...">` 에는
 * 붙지 않는다 — MDX 안에서도 내부 이동은 반드시 `Link` 를 쓴다.
 *
 * **이미지 최적화를 끈다.** `output: "export"` 는 요청 시점 변환을 할 서버가 없다.
 */
const basePath = process.env.NODE_ENV === "production" ? "/curvez" : "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  images: { unoptimized: true },
  // Pages 가 `/components/button` 을 디렉터리로 찾게 한다. 없으면 404 가 난다.
  trailingSlash: true,
  pageExtensions: ["ts", "tsx", "mdx"],
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default createMDX()(nextConfig);

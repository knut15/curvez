import createMDX from "@next/mdx";
import type { NextConfig } from "next";

/**
 * 정적 내보내기를 쓰지 않는다.
 *
 * GitHub Pages 로 가려다 방향을 바꿨다. Pages 는 한 저장소에 사이트가 하나뿐인데,
 * 포트폴리오인 handwork 는 랜딩이 `force-dynamic` 이라 정적으로 내보낼 수 없다
 * (`apps/handwork/src/app/page.tsx:6`). 둘 중 하나만 올릴 수 있는 구조였다.
 *
 * 그래서 `output: "export"` 와 `basePath: "/curvez"` 를 걷어냈다. `basePath` 는
 * 프로젝트 페이지의 URL 모양(`knut15.github.io/curvez/`) 때문에 있던 값이고,
 * 제품 이름과도 맞지 않았다.
 */
const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "mdx"],
};

export default createMDX()(nextConfig);

// PRD §9 미결 6 — 사이트 이름과 도메인이 정해지지 않았다. 확정되면 이 파일의 값과
// status 만 바꾼다.
import type { Settled } from "@/shared/lib/reference";

export const siteName: Settled<string> = {
  status: "미확정",
  value: "이른둥이 육아 계산기",
  openQuestion: "PRD-9-6",
  provisionalBasis:
    "PRD 제목을 그대로 쓴다. 사용자가 이름을 정하면 이 값과 status 만 바꾼다.",
};

export const siteOrigin: Settled<string> = {
  status: "미확정",
  value: process.env.NEXT_PUBLIC_SITE_ORIGIN ?? "http://localhost:3000",
  openQuestion: "PRD-9-6",
  provisionalBasis:
    "도메인이 정해지지 않았다. NEXT_PUBLIC_SITE_ORIGIN 이 없으면 로컬 기본값을 쓴다.",
};

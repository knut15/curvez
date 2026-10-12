import { ShareView } from "@/views/share";

// F7 받는 쪽. 정적 페이지 — 값은 브라우저에서 location.hash 로 읽는다(서버로 가지 않는다).
export default function SharePage() {
  return <ShareView />;
}

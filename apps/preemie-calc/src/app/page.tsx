import { Suspense } from "react";

import { InputView } from "@/views/input";

// BND-01: 쿼리(?weeks=·?new=1)는 클라이언트에서 읽는다. 서버에서 searchParams 를 읽으면
// 이 라우트가 요청마다 동적 렌더링된다(architecture ⑥ "/ 는 정적"). useSearchParams 는
// 정적 렌더링 중 Suspense 경계를 요구한다.
export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <InputView />
    </Suspense>
  );
}

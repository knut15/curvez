"use client";

// RootLayout 에 상시 마운트되는 전역 aria-live 안내. 라우트가 바뀌어도({children} 만
// 교체되고 이 컴포넌트는 유지) 직전 화면에서 부른 announce() 문구가 그대로 들린다.
import { useEffect, useState } from "react";

import { subscribeToAnnouncements } from "@/shared/lib/announce";

export function Announcer() {
  const [message, setMessage] = useState("");

  useEffect(() => subscribeToAnnouncements(setMessage), []);

  return (
    <div aria-live="polite" className="sr-only">
      {message}
    </div>
  );
}

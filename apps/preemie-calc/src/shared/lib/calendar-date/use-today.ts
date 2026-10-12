"use client";

// "오늘"을 읽는 클라이언트 훅. 이 파일만 React 훅을 쓴다 — 나머지 계산 함수는 순수 함수라
// 서버·테스트 어디서나 그대로 부를 수 있어야 한다.
// useSyncExternalStore 로 시계(외부 값)를 읽는다: 서버 렌더·하이드레이션 첫 페인트는
// getServerSnapshot(요청 시점 서버 시계)을 쓰고, 커밋 직후 클라이언트 시계로 다시 읽는다.
// CalendarDate 는 원시 문자열이라 매번 새로 계산해도 값이 같으면 Object.is 로 동일하게
// 판정돼 무한 렌더 위험이 없다. subscribe 는 시간 경과에 따른 갱신을 하지 않는다(원래 동작 그대로).
import { useSyncExternalStore } from "react";

import { todayInKst, type CalendarDate } from "./calendar";

function subscribe(): () => void {
  return () => {};
}

function getSnapshot(): CalendarDate {
  return todayInKst();
}

export function useToday(): CalendarDate {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

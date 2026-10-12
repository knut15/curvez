"use client";

// localStorage 읽기를 React 상태로 감싸는 클라이언트 훅. entities/*/ui 는 next·react import 가
// 허용된다(architecture.md 예외 표). api 세그먼트 자체는 react 를 모른다.
// localStorage(외부 값)는 useSyncExternalStore 로 읽는다: 서버·최초 하이드레이션 페인트는
// getServerSnapshot({status:"empty"})을 쓰고, 커밋 직후 실제 값으로 다시 읽는다 — 이것이
// 기존 `hydrated` 플래그와 같은 시점이라, 하이드레이션 완료 여부도 같은 방식(useSyncExternalStore)
// 으로 따로 읽는다. loadProfileStore() 는 호출마다 새 객체를 만들어 그대로 getSnapshot 에 쓰면
// 참조가 매번 달라져 무한 렌더 위험이 있으므로, refresh() 로 무효화하기 전까지는 캐시된 참조를
// 그대로 돌려준다. 이 훅은 "/"·"/dashboard" 등 여러 화면에서 각자 마운트되므로(클라이언트 라우팅은
// 모듈을 다시 불러오지 않는다), 캐시는 훅 인스턴스별 ref 에 둔다 — 모듈 전역에 두면 한 화면에서
// 읽은 값이 다른 화면(다른 인스턴스)에 새로 마운트된 뒤에도 낡은 채로 남는다.
import { useCallback, useRef, useSyncExternalStore } from "react";

import { loadProfileStore, type ProfileStoreLoadResult } from "../api";

export type UseProfileStoreResult = {
  result: ProfileStoreLoadResult;
  /** 최초 마운트(브라우저에서 localStorage 를 한 번 읽음) 전이면 false. */
  hydrated: boolean;
  /** 저장·전환·삭제 뒤 이 화면의 값을 다시 읽는다. */
  refresh: () => void;
};

// useSyncExternalStore 는 서버 스냅샷도 같은 참조를 요구한다. 호출마다 새 객체를 돌려주면
// "The result of getServerSnapshot should be cached" 경고가 난다.
const EMPTY_SNAPSHOT: ProfileStoreLoadResult = { status: "empty" };

function getServerSnapshot(): ProfileStoreLoadResult {
  return EMPTY_SNAPSHOT;
}

function subscribeNoop(): () => void {
  return () => {};
}

function getHydratedSnapshot(): boolean {
  return true;
}

function getHydratedServerSnapshot(): boolean {
  return false;
}

export function useProfileStore(): UseProfileStoreResult {
  const cacheRef = useRef<ProfileStoreLoadResult | null>(null);
  const listenersRef = useRef(new Set<() => void>());

  const subscribe = useCallback((listener: () => void): (() => void) => {
    listenersRef.current.add(listener);
    return () => listenersRef.current.delete(listener);
  }, []);

  const getSnapshot = useCallback((): ProfileStoreLoadResult => {
    if (cacheRef.current === null) {
      cacheRef.current = loadProfileStore();
    }
    return cacheRef.current;
  }, []);

  const result = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const hydrated = useSyncExternalStore(subscribeNoop, getHydratedSnapshot, getHydratedServerSnapshot);

  const refresh = useCallback(() => {
    cacheRef.current = null;
    listenersRef.current.forEach((listener) => listener());
  }, []);

  return { result, hydrated, refresh };
}

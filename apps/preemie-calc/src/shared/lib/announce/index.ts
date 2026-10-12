// 전역 aria-live 안내. react·next 를 모르는 순수 pub/sub(shared/lib 예외 표는 이 파일에 해당 없음
// — 이 모듈 자체는 react/next 를 import 하지 않는다). `Announcer`(shared/ui, 클라이언트 leaf)가
// RootLayout 에 상시 마운트돼 있어, 이 함수를 호출한 직후 라우트가 바뀌어도 안내 문구가 살아남는다.
type Listener = (message: string) => void;

const listeners = new Set<Listener>();

/** 화면 상태를 바꾸는 사용자 행위 직후 부른다(아이 전환·삭제·저장 완료 등). */
export function announce(message: string): void {
  listeners.forEach((listener) => listener(message));
}

/** `Announcer` 전용 구독. 구독 해지 함수를 돌려준다. */
export function subscribeToAnnouncements(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

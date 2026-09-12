/**
 * 서브 페이지의 바깥 컨테이너. 폭·좌우 여백·세로 여백을 한 자리에 모은다.
 *
 * 스펙은 `packages/scopulus-ui/design/components/PageShell.md` 가 정본이다.
 *
 * `className` 과 `as` 를 받지 않는다. 덧붙일 구멍을 열면 여섯 번째 값이 생기고,
 * 어느 페이지가 표준인지 판정할 근거가 사라진다. 다른 여백이 필요한 화면은
 * 이 컴포넌트를 쓰지 않는 화면이다 — 랜딩(`app/page.tsx`)이 그렇다.
 */
export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10 md:px-8 md:py-16">
      {children}
    </main>
  );
}

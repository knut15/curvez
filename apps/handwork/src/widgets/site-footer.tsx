/**
 * 좌우 여백은 헤더와 같은 `px-5 md:px-8` 이고, 폭은 본문과 같은 `max-w-5xl` 이다.
 * 서체도 헤더와 같은 13px 산세리프라 위아래가 한 벌로 읽힌다.
 */
export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-5xl px-5 py-8 text-[0.8125rem] text-muted-foreground md:px-8">
        © {new Date().getFullYear()} aster
      </div>
    </footer>
  );
}

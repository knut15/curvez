/**
 * 좌우 여백은 헤더와 같은 `px-5 md:px-8` 이고, 폭은 본문과 같은 `max-w-5xl` 이다.
 * 서체도 헤더와 같은 모노 소문자-대문자 조합으로 둬 위아래가 한 벌로 읽힌다.
 */
export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-5xl px-5 py-8 font-mono text-[0.7rem] tracking-widest text-muted-foreground uppercase md:px-8">
        © {new Date().getFullYear()}{" "}
        {/* 워드마크는 항상 소문자다. 둘레의 uppercase 를 여기서만 되돌린다. */}
        <span className="normal-case">aster</span>
      </div>
    </footer>
  );
}

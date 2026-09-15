/**
 * 페이지 제목 아래 설명문. **마침표를 만나면 줄을 바꾼다.**
 *
 * 한 문단으로 흘리면 두 문장이 한 덩어리로 보여서, 읽는 사람이 어디까지가 한 이야기인지
 * 문장 끝을 찾아가며 읽는다. 문장마다 줄을 주면 훑는 것만으로 몇 가지를 말하는지 보인다.
 *
 * **`<br />` 가 아니라 `block` 인 이유가 있다.** 줄바꿈 태그는 좁은 폭에서 이미 접힌 줄
 * 사이에 또 하나를 끼워 문장이 서로 붙어 버린다. 블록으로 두면 각 문장이 자기 줄을 갖고
 * 그 안에서만 접힌다.
 *
 * 쪼개는 자리는 **마침표 뒤에 공백이 있는 곳**뿐이다. `3.45` 나 `.curvez/design` 처럼
 * 마침표 뒤가 바로 이어지는 것은 문장 끝이 아니므로 건드리지 않는다.
 */
export function PageLede({
  children,
  className = "",
}: {
  children: string;
  className?: string;
}) {
  const sentences = children.trim().split(/(?<=\.)\s+/);

  return (
    <p
      className={`mt-3 leading-relaxed break-keep text-muted-foreground ${className}`}
    >
      {sentences.map((sentence) => (
        <span key={sentence} className="block">
          {sentence}
        </span>
      ))}
    </p>
  );
}

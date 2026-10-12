// "92일 · 3개월", "2026-06-26" 같은 숫자+단위·날짜 조각이 좁은 폭에서 중간에 끊기는 문제 수정.
// word-break: keep-all(globals.css body) 은 한글 음절 사이 줄바꿈만 막고, 숫자·기호와 한글 사이의
// 줄바꿈 기회는 막지 못한다("92" 와 "일" 사이에서 여전히 끊길 수 있다). 공백으로 나눈 조각마다
// white-space: nowrap 을 걸어 조각 내부는 끊기지 않게 하고, 조각 사이 공백(별도 텍스트 노드)은
// 그대로 남겨 문장 전체는 여러 줄로 접힐 수 있게 한다.
export function nowrapChunks(text: string): React.ReactNode[] {
  const parts = text.split(" ");
  const nodes: React.ReactNode[] = [];
  parts.forEach((part, index) => {
    nodes.push(
      <span key={`chunk-${index}`} style={{ whiteSpace: "nowrap" }}>
        {part}
      </span>,
    );
    if (index < parts.length - 1) nodes.push(" ");
  });
  return nodes;
}

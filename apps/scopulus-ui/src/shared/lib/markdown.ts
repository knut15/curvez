/**
 * CHANGELOG 한 파일만 그리는 최소 마크다운 변환기.
 *
 * **라이브러리를 들이지 않는다.** 다루는 문서가 하나이고 그 문서의 문법이
 * Keep a Changelog 로 고정돼 있다 — 제목 · 목록 · 링크 · 인라인 코드 · 굵게가 전부다.
 * 일반 마크다운 파서를 넣으면 번들이 커지고, 이 문서가 쓰지 않는 문법까지 책임지게 된다.
 *
 * **입력은 저장소 안의 파일 하나다.** 사용자 입력이 아니므로 HTML 주입 경로가 아니다.
 * 그래도 원문의 `<` 는 먼저 이스케이프한다 — 이력에 태그 모양 글자가 들어와도 깨지지 않게.
 */
const escape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const inline = (s: string) =>
  escape(s)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noreferrer">$1</a>',
    );

export function renderMarkdown(md: string): string {
  const out: string[] = [];
  let inList = false;

  const closeList = () => {
    if (inList) {
      out.push("</ul>");
      inList = false;
    }
  };

  for (const raw of md.split("\n")) {
    const line = raw.trimEnd();

    // 링크 정의 줄(`[0.1.0]: https://...`)은 그리지 않는다.
    if (/^\[[^\]]+\]:\s*\S+$/.test(line)) continue;

    if (line === "") {
      closeList();
      continue;
    }

    const heading = line.match(/^(#{2,4})\s+(.*)$/);
    if (heading) {
      closeList();
      const level = heading[1].length;
      out.push(`<h${level}>${inline(heading[2])}</h${level}>`);
      continue;
    }

    const item = line.match(/^\s*-\s+(.*)$/);
    if (item) {
      if (!inList) {
        out.push("<ul>");
        inList = true;
      }
      out.push(`<li>${inline(item[1])}</li>`);
      continue;
    }

    closeList();
    out.push(`<p>${inline(line)}</p>`);
  }

  closeList();
  return out.join("\n");
}

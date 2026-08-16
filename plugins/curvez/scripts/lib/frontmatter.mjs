/**
 * curvez 공용 마크다운 파서.
 *
 * 외부 의존성을 쓰지 않는다.
 * 이유: curvez 는 프로젝트에 설치되는 순간 바로 동작해야 한다. `pnpm install` 을 선행 조건으로
 * 두면 부트스트랩 이전 상태(=의존성이 아직 없는 프로젝트)에서 검증기를 돌릴 수 없다.
 *
 * YAML 은 프론트매터에서 실제로 쓰는 서브셋만 지원한다.
 *   - `key: value`
 *   - `key: [a, b, c]`  (인라인 배열)
 *   - `key: |` / `key: >` 블록 스칼라는 지원하지 않는다 (프론트매터에 쓰지 않기로 한다)
 */

import { readFileSync } from "node:fs";

const FRONTMATTER_DELIM = "---";

/**
 * 프론트매터 텍스트를 객체로 만든다.
 * 값은 전부 문자열로 두되, `[a, b]` 형태만 배열로 바꾼다.
 */
export function parseFrontmatter(raw) {
  const result = {};
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const colon = trimmed.indexOf(":");
    if (colon === -1) continue;

    const key = trimmed.slice(0, colon).trim();
    let value = trimmed.slice(colon + 1).trim();

    // 따옴표 제거
    if (
      (value.startsWith('"') && value.endsWith('"') && value.length > 1) ||
      (value.startsWith("'") && value.endsWith("'") && value.length > 1)
    ) {
      value = value.slice(1, -1);
    }

    if (value.startsWith("[") && value.endsWith("]")) {
      result[key] = value
        .slice(1, -1)
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);
    } else {
      result[key] = value;
    }
  }
  return result;
}

/**
 * 마크다운 파일을 읽어 프론트매터와 본문으로 나눈다.
 *
 * @returns {{ frontmatter: object|null, body: string, bodyOffset: number, lines: string[], raw: string }}
 *   bodyOffset 은 본문 첫 줄의 0-based 인덱스. 오류 메시지에 원본 줄번호를 찍기 위해 필요하다.
 */
export function readMarkdown(filePath) {
  const raw = readFileSync(filePath, "utf8");
  const lines = raw.split("\n");

  if (lines[0]?.trim() !== FRONTMATTER_DELIM) {
    return { frontmatter: null, body: raw, bodyOffset: 0, lines, raw };
  }

  let end = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === FRONTMATTER_DELIM) {
      end = i;
      break;
    }
  }
  if (end === -1) {
    return { frontmatter: null, body: raw, bodyOffset: 0, lines, raw };
  }

  const frontmatter = parseFrontmatter(lines.slice(1, end).join("\n"));
  const bodyOffset = end + 1;
  return {
    frontmatter,
    body: lines.slice(bodyOffset).join("\n"),
    bodyOffset,
    lines,
    raw,
  };
}

/**
 * 본문에서 `##` 이상 헤딩을 뽑는다.
 * 코드 펜스(``` 또는 ~~~) 안의 `#` 은 헤딩이 아니므로 건너뛴다.
 *
 * @returns {Array<{ heading: string, level: number, line: number, contentLines: string[] }>}
 *   line 은 파일 기준 1-based 줄번호.
 */
export function extractSections(body, bodyOffset = 0) {
  const lines = body.split("\n");
  const sections = [];
  let fence = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const fenceMatch = line.match(/^\s*(```+|~~~+)/);
    if (fenceMatch) {
      const marker = fenceMatch[1][0];
      if (fence === null) fence = marker;
      else if (fence === marker) fence = null;
      continue;
    }
    if (fence !== null) continue;

    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (!headingMatch) continue;

    sections.push({
      heading: headingMatch[2].trim(),
      level: headingMatch[1].length,
      line: bodyOffset + i + 1,
      startIndex: i,
      contentLines: [],
    });
  }

  // 각 섹션의 본문 범위를 채운다.
  //
  // 범위의 끝은 "다음 헤딩" 이 아니라 "같은 레벨 이하의 다음 헤딩" 이다.
  // 이유: `## A` 바로 아래 `### A-1` 이 오는 것은 정상적인 구조인데, 단순히 다음 헤딩까지로
  // 자르면 A 의 본문이 0줄이 되어 빈 섹션으로 오판한다. 하위 헤딩과 그 내용은 상위 섹션의 본문이다.
  for (let s = 0; s < sections.length; s++) {
    const from = sections[s].startIndex + 1;
    let to = lines.length;
    for (let t = s + 1; t < sections.length; t++) {
      if (sections[t].level <= sections[s].level) {
        to = sections[t].startIndex;
        break;
      }
    }
    sections[s].contentLines = lines.slice(from, to);
  }

  return sections;
}

/** 섹션 본문이 비었는지 판정한다. 공백·주석만 있으면 빈 것으로 본다. */
export function isSectionEmpty(section) {
  return section.contentLines.every(
    (l) => l.trim() === "" || l.trim().startsWith("<!--")
  );
}

/** 한글이 한 글자라도 있는가. */
export function hasKorean(text) {
  return /[가-힣]/.test(text);
}

/** ASCII 라틴 단어(2글자 이상)가 있는가. 영어 트리거 존재 판정에 쓴다. */
export function hasLatinWord(text) {
  return /[A-Za-z]{2,}/.test(text);
}

/**
 * 스캐폴드가 남긴 미완성 마커(`<!-- TODO`)의 위치를 모두 찾는다.
 *
 * 뼈대를 채우지 않은 채 팀에 투입된 에이전트·스킬은 빈 계약으로 실행된다.
 * 그 자리를 실행 시점의 추측이 메우므로, 검증 단계에서 잡아야 한다.
 *
 * @returns {Array<{ line: number, text: string }>} line 은 1-based.
 */
export function findTodoMarkers(raw) {
  const out = [];
  let fence = null;

  raw.split("\n").forEach((line, i) => {
    // 코드펜스 안은 건너뛴다. 스킬 문서가 뼈대 예시를 보여줄 때 마커가 정상적으로 등장한다.
    const fenceMatch = line.match(/^\s*(```+|~~~+)/);
    if (fenceMatch) {
      const marker = fenceMatch[1][0];
      if (fence === null) fence = marker;
      else if (fence === marker) fence = null;
      return;
    }
    if (fence !== null) return;

    // 인라인 코드도 제거한다. `<!-- TODO -->` 처럼 마커를 언급하는 것은 미완성이 아니다.
    const stripped = line.replace(/`[^`]*`/g, "");
    if (/<!--\s*TODO/i.test(stripped)) {
      out.push({ line: i + 1, text: line.trim().slice(0, 80) });
    }
  });
  return out;
}

/** 따옴표로 감싼 트리거 구절을 모두 뽑는다. "..." 와 '...' 둘 다 인식한다. */
export function extractQuotedTriggers(text) {
  const out = [];
  const re = /["'“”'']([^"'“”'']{2,60})["'“”'']/g;
  let m;
  while ((m = re.exec(text)) !== null) out.push(m[1].trim());
  return out;
}

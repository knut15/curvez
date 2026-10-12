// F7 결과 문구 복사. PC-F7-AC5, PC-F7-AC6(타입 수준).
import { describe, expect, it } from "vitest";

import { buildShareText } from "@/features/share-result";
import { parseCalendarDate } from "@/shared/lib/calendar-date";

const TODAY = parseCalendarDate("2026-06-01")!;
const SHARE_URL = "https://example.com/share#b=2026-03-01&d=2026-04-26";

describe("PC-F7-AC5 오늘이 2026-06-01 일 때 문구에 생후·교정·공유 링크가 들어간다", () => {
  it("architecture.md ⑫ 예시와 줄 단위로 정확히 같다", () => {
    const text = buildShareText({
      today: TODAY,
      chronological: { value: "92일 · 3개월" },
      corrected: { kind: "after-due", value: "36일 · 1개월" },
      shareUrl: SHARE_URL,
    });
    expect(text).toBe(
      ["2026년 6월 1일 기준", "생후 92일 · 3개월", "교정 36일 · 1개월", SHARE_URL].join("\n"),
    );
  });

  it("corrected 가 before-due 면 'D-○ (재태 ○주 ○일)' 형식으로 한 줄에 합쳐진다", () => {
    const text = buildShareText({
      today: TODAY,
      chronological: { value: "31일" },
      corrected: { kind: "before-due", value: "D-25", subValue: "재태 36주 3일" },
      shareUrl: SHARE_URL,
    });
    expect(text).toContain("교정 D-25 (재태 36주 3일)");
  });

  it("corrected 가 hidden(재태 37주 이상) 이면 교정 줄이 없다", () => {
    const text = buildShareText({
      today: TODAY,
      chronological: { value: "92일 · 3개월" },
      corrected: { kind: "hidden", value: "" },
      shareUrl: SHARE_URL,
    });
    expect(text).toBe(["2026년 6월 1일 기준", "생후 92일 · 3개월", SHARE_URL].join("\n"));
  });

  it("corrected 가 null 이어도 교정 줄이 없다", () => {
    const text = buildShareText({
      today: TODAY,
      chronological: { value: "92일 · 3개월" },
      corrected: null,
      shareUrl: SHARE_URL,
    });
    expect(text).not.toContain("교정");
  });
});

// PC-F7-AC6(저장된 이름이 문구에 들어가지 않는다)은 ShareTextInput 타입에 이름 필드가 아예
// 없어 컴파일 타임에 막힌다(architecture.md ⑫) — "타입이 이미 막는 것"이라 이 파일에서
// 런타임으로 다시 확인하지 않는다. 실제 화면에서 이름 "하늘"이 클립보드 문구에 없는지는
// tests/e2e/f7-share.spec.ts 의 AC5·AC6 테스트가 확인한다.

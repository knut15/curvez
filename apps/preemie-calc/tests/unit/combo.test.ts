// F13 주수·개월 조합 SEO 페이지. 날짜 없이 weeks·months 조합만으로 계산한다.
import { describe, expect, it } from "vitest";

import { COMBO_MONTHS, COMBO_WEEKS, describeCombo } from "@/entities/child";

describe("PC-F13-AC2 32주 출생 생후 3개월 조합 설명", () => {
  it("32주 출생, 생후 3개월이면 예정일보다 8주 일찍 태어남이 보인다", () => {
    const combo = describeCombo(32, 3);
    expect(combo.weeksEarly).toBe(8);
    expect(combo.summary).toBe("예정일보다 8주 일찍 태어남");
  });
});

// F13 번 기능의 AC 1(481쪽 빌드)과 AC 4(사이트맵 481쪽)는 app/guide 라우트와 sitemap.ts 가
// 실제로 481개를 만들어내는지 빌드 결과로 확인해야 한다(architecture.md ⑥). 그 라우트는
// 이번 라운드에 구현되지 않았다(U2 화면 라운드로 미룸). 아래 테스트는 그 두 수용 기준이
// 의존하는 유일한 진실 원천인 COMBO_WEEKS·COMBO_MONTHS 상수가 481을 내는지만 검증하는
// 선행 조건 테스트다. 두 수용 기준 자체(빌드 결과 검사)는 이 테스트로 대체되지 않는다 —
// 이 코멘트는 의도적으로 "PC-F13-AC" 패턴을 쓰지 않는다(커버리지 grep 오탐 방지).
describe("COMBO_WEEKS·COMBO_MONTHS 조합 범위 13×37=481 (F13 AC 1·AC 4 의 선행 조건, 완전 커버 아님)", () => {
  it("주수 24~36(13개) × 개월 0~36(37개) = 481 조합이다", () => {
    expect(COMBO_WEEKS.length).toBe(13);
    expect(COMBO_MONTHS.length).toBe(37);
    expect(COMBO_WEEKS.length * COMBO_MONTHS.length).toBe(481);
    expect(COMBO_WEEKS[0]).toBe(24);
    expect(COMBO_WEEKS[COMBO_WEEKS.length - 1]).toBe(36);
    expect(COMBO_MONTHS[0]).toBe(0);
    expect(COMBO_MONTHS[COMBO_MONTHS.length - 1]).toBe(36);
  });
});

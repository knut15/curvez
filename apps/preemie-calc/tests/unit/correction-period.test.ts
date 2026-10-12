// F6 교정연령 적용 종료 안내.
import { describe, expect, it } from "vitest";

import type { GestationalAge } from "@/entities/child";
import { correctionPeriod } from "@/entities/correction-period";

function ga(totalDays: number): GestationalAge {
  return { totalDays, weeks: Math.floor(totalDays / 7), days: totalDays % 7 };
}

describe("PC-F6-AC1 재태 32주 0일, 체중 미입력 — 24개월까지 + 체중 힌트", () => {
  it("재태 32주 0일(224일), 체중 미입력이면 default 24개월이고 체중 힌트가 켜진다", () => {
    const result = correctionPeriod({ gestation: ga(224), birthWeightGrams: null });
    expect(result).toEqual({ kind: "default", untilMonths: 24, showWeightHint: true });
  });
});

describe("PC-F6-AC2 재태 27주 6일 — 36개월까지 (재태 사유)", () => {
  it("재태 27주 6일(195일)이면 extended 36개월, 사유가 gestation 이다", () => {
    const result = correctionPeriod({ gestation: ga(195), birthWeightGrams: null });
    expect(result).toEqual({ kind: "extended", untilMonths: 36, reason: "gestation" });
  });
});

describe("PC-F6-AC3 재태 32주 0일, 출생 체중 1.4kg — 36개월까지 (체중 사유)", () => {
  it("재태 32주 0일(224일), 출생 체중 1400g 이면 extended 36개월, 사유가 birth-weight 다", () => {
    const result = correctionPeriod({ gestation: ga(224), birthWeightGrams: 1400 });
    expect(result).toEqual({ kind: "extended", untilMonths: 36, reason: "birth-weight" });
  });
});

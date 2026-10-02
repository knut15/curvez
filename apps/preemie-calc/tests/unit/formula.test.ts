// F15 분유량 참고. PC-F15-AC1, AC2, EX1, EX2, EX3.
import { describe, expect, it } from "vitest";

import { formulaAmount, isValidWeightGrams, type FormulaAgeInput } from "@/entities/formula";

const NOT_CORRECTED: FormulaAgeInput = {
  correctionApplies: false,
  chronological: { totalDays: 30, months: 1, days: 0 },
  corrected: { kind: "hidden" },
};

function correctedAfterDue(months: number, days: number, totalDays: number): FormulaAgeInput {
  return {
    correctionApplies: true,
    chronological: { totalDays, months, days },
    corrected: { kind: "after-due", span: { totalDays, months, days } },
  };
}

function correctedBeforeDue(): FormulaAgeInput {
  return {
    correctionApplies: true,
    chronological: { totalDays: 60, months: 2, days: 0 },
    corrected: { kind: "before-due" },
  };
}

describe("PC-F15-AC1 데이터 파일 계수(1kg당 150~180ml)로 체중 4.0kg → 하루 600~720ml", () => {
  it("교정이 적용되지 않는 아이(37주 이상, 생후 1개월)도 같은 계수를 쓴다", () => {
    const { result } = formulaAmount({ weightGrams: 4000, ages: NOT_CORRECTED });
    expect(result).toEqual({
      kind: "ok",
      band: expect.objectContaining({ id: "0-3m" }),
      dailyMl: { min: 600, max: 720 },
    });
  });
});

describe("PC-F15-AC2 재태 37주 미만 아이는 결과보다 먼저 '의료진이 정해 준 양이 있으면 그 양을 따르세요'가 보인다", () => {
  it("showMedicalTeamNotice 는 correctionApplies 를 그대로 따른다(결과 종류와 무관)", () => {
    const notCorrected = formulaAmount({ weightGrams: 4000, ages: NOT_CORRECTED });
    expect(notCorrected.showMedicalTeamNotice).toBe(false);

    const corrected = formulaAmount({ weightGrams: 4000, ages: correctedAfterDue(1, 6, 36) });
    expect(corrected.showMedicalTeamNotice).toBe(true);
    expect(corrected.result.kind).toBe("ok");
  });
});

describe("PC-F15-EX1 체중이 비었거나 0.5kg 미만·15kg 초과면 무효하다", () => {
  it("0.5kg(500g)·15kg(15000g) 은 양끝 포함이라 유효하다", () => {
    expect(isValidWeightGrams(500)).toBe(true);
    expect(isValidWeightGrams(15000)).toBe(true);
  });

  it("499g·15001g·null 은 무효하다", () => {
    expect(isValidWeightGrams(499)).toBe(false);
    expect(isValidWeightGrams(15001)).toBe(false);
    expect(isValidWeightGrams(null)).toBe(false);
  });

  it("formulaAmount 도 무효 체중이면 invalid-weight 를 돌려준다", () => {
    const { result } = formulaAmount({ weightGrams: null, ages: NOT_CORRECTED });
    expect(result).toEqual({ kind: "invalid-weight" });
  });
});

describe("PC-F15-EX2 오늘 교정 나이가 적용 월령 범위 밖(예정일 이전)이면 '이 시기에는 일반 권장량을 보여주지 않습니다' 상태다", () => {
  it("교정 나이가 아직 예정일 전(before-due)이면 out-of-range 다", () => {
    const { result, showMedicalTeamNotice } = formulaAmount({ weightGrams: 4000, ages: correctedBeforeDue() });
    expect(result).toEqual({ kind: "out-of-range" });
    expect(showMedicalTeamNotice).toBe(true);
  });
});

describe("PC-F15-EX3 교정 나이가 3개월 0일 이상이면 계수가 없어 '기준 확인 중'(pending)이다", () => {
  it("교정 3개월 0일 정각부터 pending 이다(PRD §9 2026-09-30 결정, '3개월이 될 때까지'는 배타)", () => {
    const { result } = formulaAmount({ weightGrams: 4000, ages: correctedAfterDue(3, 0, 90) });
    expect(result.kind).toBe("pending");
    if (result.kind === "pending") expect(result.band.id).toBe("from-3m");
  });

  it("교정 2개월 29일(3개월 0일 직전)까지는 아직 0-3m 밴드(ok)다", () => {
    const { result } = formulaAmount({ weightGrams: 4000, ages: correctedAfterDue(2, 29, 89) });
    expect(result.kind).toBe("ok");
    if (result.kind === "ok") expect(result.band.id).toBe("0-3m");
  });
});

// F14 목표키 참고. PC-F14-AC1, AC2, AC3, EX1.
import { describe, expect, it } from "vitest";

import { TARGET_HEIGHT_FORMULA, computeTargetHeight, isValidParentHeights } from "@/entities/target-height";

describe("PC-F14-AC1 아빠 175cm·엄마 162cm, 남아 → 175.0cm (168.5~181.5cm)", () => {
  it("computeTargetHeight 가 architecture.md 예시와 정확히 같다", () => {
    const result = computeTargetHeight({ sex: "male", fatherCm: 175, motherCm: 162 });
    expect(result).toEqual({ midCm: 175.0, minCm: 168.5, maxCm: 181.5 });
  });
});

describe("PC-F14-AC2 같은 부모 키, 여아 → 162.0cm (155.5~168.5cm)", () => {
  it("computeTargetHeight 가 architecture.md 예시와 정확히 같다", () => {
    const result = computeTargetHeight({ sex: "female", fatherCm: 175, motherCm: 162 });
    expect(result).toEqual({ midCm: 162.0, minCm: 155.5, maxCm: 168.5 });
  });
});

describe("PC-F14-AC3 계산식 출처는 'Tanner 공식'이다(PRD §9 2026-09-30 결정)", () => {
  it("TARGET_HEIGHT_FORMULA.name 이 'Tanner 공식'이다", () => {
    expect(TARGET_HEIGHT_FORMULA.name).toBe("Tanner 공식");
  });
});

describe("PC-F14-EX1 부모 키 중 하나라도 비었거나 100cm 미만·230cm 초과면 무효다", () => {
  it("100·230cm 은 양끝 포함이라 유효하다", () => {
    expect(isValidParentHeights({ fatherCm: 100, motherCm: 230 })).toBe(true);
    expect(isValidParentHeights({ fatherCm: 230, motherCm: 100 })).toBe(true);
  });

  it("99.9cm·230.1cm 은 범위 밖이라 무효하다", () => {
    expect(isValidParentHeights({ fatherCm: 99.9, motherCm: 150 })).toBe(false);
    expect(isValidParentHeights({ fatherCm: 150, motherCm: 230.1 })).toBe(false);
  });

  it("부모 키 중 하나라도 null(비었음)이면 무효하다", () => {
    expect(isValidParentHeights({ fatherCm: null, motherCm: 150 })).toBe(false);
    expect(isValidParentHeights({ fatherCm: 150, motherCm: null })).toBe(false);
    expect(isValidParentHeights({ fatherCm: null, motherCm: null })).toBe(false);
  });
});

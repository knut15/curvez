// 기준 데이터 JSON 7개(architecture.md ④·⑬)의 출처 URL·기준일·마지막 확인일 필드 검사.
// (2026-09-29 교정 라운드) architect 결정 1(ACC-04): effectiveDate·lastVerified 는
// "둘 다 날짜(원문 대조를 마쳤다)" 또는 "둘 다 null(원문 대조 전)" 두 경우의 유니온이다.
// null 은 실패가 아니라 "아무도 원문 페이지를 열어 대조하지 않았다"는 사실을 그대로 적은
// 값이다 — 다만 한쪽만 null 인 상태는 데이터 오류이지 정상값이 아니다. 그래서 이 파일은
// "null 을 허용한다"로 느슨하게 두지 않고, 두 필드가 항상 쌍으로 움직이는지(둘 다 null 또는
// 둘 다 날짜)까지 검사한다.
import { describe, expect, it } from "vitest";

import { ageBasisMeta } from "@/entities/age-basis";
import { checkupMeta } from "@/entities/checkup";
import { copayReliefMeta } from "@/entities/copay-relief";
import { correctionPeriodMeta } from "@/entities/correction-period";
import { formulaMeta } from "@/entities/formula";
import { growthMeta } from "@/entities/growth";
import { vaccinationMeta } from "@/entities/vaccination";
import { resolveReferenceMeta, type ReferenceMeta, type ReferenceMetaInput } from "@/shared/lib/reference";

// growth-lms·vaccination-schedule·formula-coefficients 는 8차 라운드(SPEC v2) 신규 기준
// 데이터 3건이다(architecture.md ⑬ "새 파일의 meta" 표) — PC-F8-AC4·PC-F10·PC-F15-AC3 가
// 요구하는 "출처·기준일이 보인다"의 데이터 쪽 전제(원문 URL·날짜가 실제로 채워졌는지)를
// 여기서 기존 4건과 같은 규칙으로 검사한다. 화면에 그 값이 실제로 렌더되는지는 각 화면의
// E2E(growth.spec.ts 등)가 확인한다.
const metas: Array<[string, ReferenceMeta]> = [
  ["age-basis", ageBasisMeta],
  ["checkup-rounds", checkupMeta],
  ["copay-relief", copayReliefMeta],
  ["correction-period", correctionPeriodMeta],
  ["growth-lms", growthMeta],
  ["vaccination-schedule", vaccinationMeta],
  ["formula-coefficients", formulaMeta],
];

describe("기준 데이터 7개의 출처·기준일·마지막 확인일 필드 (architect 결정 1, ACC-04)", () => {
  for (const [name, meta] of metas) {
    it(`${name}: sources 에 출처 URL 이 1개 이상 있다`, () => {
      expect(meta.sources.length).toBeGreaterThan(0);
      for (const source of meta.sources) {
        expect(source.url).toMatch(/^https?:\/\//);
      }
    });

    it(
      `${name}: effectiveDate·lastVerified 는 둘 다 날짜이거나 둘 다 null 이다 — 현재 값은 ` +
        (meta.effectiveDate === null
          ? "둘 다 null(원문 대조 전, architect 결정 1)"
          : `둘 다 날짜(effectiveDate=${meta.effectiveDate}, lastVerified=${meta.lastVerified})`),
      () => {
        // 한쪽만 null 인 상태(예: 기준일은 있는데 확인일이 없음)는 존재할 수 없다.
        expect(meta.effectiveDate === null).toBe(meta.lastVerified === null);
        if (meta.effectiveDate !== null) {
          expect(meta.effectiveDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
          expect(meta.lastVerified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        }
      },
    );
  }
});

describe("resolveReferenceMeta 는 한쪽만 null 이면 오류를 던진다 (architect 결정 1, ACC-04 — curvez-nextjs blocked_on 응답)", () => {
  const baseInput: ReferenceMetaInput = {
    id: "sample",
    title: "샘플",
    sources: [{ id: "s1", name: "출처", url: "https://example.com" }],
    effectiveDate: null,
    lastVerified: null,
    schemaVersion: 1,
  };

  it("둘 다 null 이면 통과하고 effectiveDate·lastVerified 가 null 로 남는다", () => {
    const result = resolveReferenceMeta(baseInput, "sample");
    expect(result.effectiveDate).toBeNull();
    expect(result.lastVerified).toBeNull();
  });

  it("둘 다 날짜면 통과하고 값이 그대로 들어간다", () => {
    const result = resolveReferenceMeta(
      { ...baseInput, effectiveDate: "2026-01-01", lastVerified: "2026-02-01" },
      "sample",
    );
    expect(result.effectiveDate).toBe("2026-01-01");
    expect(result.lastVerified).toBe("2026-02-01");
  });

  it("effectiveDate 만 null 이면 오류다(lastVerified 만 날짜)", () => {
    expect(() =>
      resolveReferenceMeta({ ...baseInput, effectiveDate: null, lastVerified: "2026-02-01" }, "sample"),
    ).toThrow(/둘 다 있거나 둘 다 null/);
  });

  it("lastVerified 만 null 이면 오류다(effectiveDate 만 날짜)", () => {
    expect(() =>
      resolveReferenceMeta({ ...baseInput, effectiveDate: "2026-01-01", lastVerified: null }, "sample"),
    ).toThrow(/둘 다 있거나 둘 다 null/);
  });
});

forbidden-words: allow

# 9라운드 — 낡은 기대값을 결정에 맞게 고친 테스트 (이전→이후·근거)

이 라운드는 PRD §9 2026-09-30 결정(경감 구간 경계 확정)의 직접 결과로 낡은 기대값을 가진
기존 테스트 2건(단위)과 1건(E2E)을 고쳤다. 완화가 아니라 **결정을 반영한 갱신**이다 — 값
자체가 더 엄격해졌을 뿐(미확정 → 확정된 특정 구간), 판정 기준을 낮추지 않았다.

## 1. `tests/unit/copay-relief.test.ts`

**이전**

```ts
describe("[미확정] PC-F5 구간 경계(203일·231일)는 boundary-unconfirmed 로 처리한다 (PRD 미결 2, architecture.md innerBoundary)", () => {
  it("재태일수 203일(29주 0일)은 boundary-unconfirmed 다", () => {
    const result = classifyCopayRelief({ birthDate: BIRTH, gestation: ga(203) });
    expect(result).toEqual({ kind: "boundary-unconfirmed", boundaryDays: 203 });
  });

  it("재태일수 231일(33주 0일)은 boundary-unconfirmed 다", () => {
    const result = classifyCopayRelief({ birthDate: BIRTH, gestation: ga(231) });
    expect(result).toEqual({ kind: "boundary-unconfirmed", boundaryDays: 231 });
  });
});
```

**이후**

```ts
describe("PC-F5 구간 경계(203일·231일)는 lower-inclusive 로 확정됐다 (PRD §9 2026-09-30 결정, architecture.md ⑬ innerBoundary)", () => {
  it("재태일수 203일(29주 0일)은 이제 boundary-unconfirmed 가 아니라 5년 4개월 구간이다", () => {
    const result = classifyCopayRelief({ birthDate: BIRTH, gestation: ga(203) });
    expect(result.kind).toBe("eligible");
    if (result.kind === "eligible") expect(result.tier.label).toBe("5년 4개월");
  });

  it("재태일수 231일(33주 0일)은 이제 boundary-unconfirmed 가 아니라 5년 3개월 구간이다", () => {
    const result = classifyCopayRelief({ birthDate: BIRTH, gestation: ga(231) });
    expect(result.kind).toBe("eligible");
    if (result.kind === "eligible") expect(result.tier.label).toBe("5년 3개월");
  });
});
```

**근거**: `curvez-nextjs.20260930-123524.json` decisions — `copay-relief.json` 의
`innerBoundary` 가 `미확정`→`확정(lower-inclusive)` 으로 바뀌면서 `classifyCopayRelief` 가
203일·231일 정각에서 더는 `boundary-unconfirmed` 를 돌려주지 않는다(architecture.md ⑬ 표가
요구한 동작 변경, 방어적 분기만 타입에 남아 있다). `lower-inclusive` 규칙(from 배타·to
포함)을 실제 데이터(`copay-relief.json`)의 tier 경계로 손으로 계산해 203일→`tier-under-29w`
(5년 4개월), 231일→`tier-29-33w`(5년 3개월)임을 확인했다(GOAL 지시값과 일치).
**되돌릴 위치**: `apps/preemie-calc/src/entities/copay-relief/model/index.ts:classifyCopayRelief`,
`apps/preemie-calc/src/entities/copay-relief/data/copay-relief.json:innerBoundary`.

## 2. `tests/e2e/nf-mobile.spec.ts`

**이전**

```ts
test("PC-NF-MOBILE-1·2·3 — copay-relief state:boundary-unconfirmed", async ({ page }) => {
  await seedProfiles(page, [{ birthDate: BIRTH, dueDate: dueDateForGestationDays(BIRTH, 203) }]);
  await fixClockKst(page, "2026-06-01T09:00:00");
  await page.goto("/dashboard/copay-relief");
  await expect(page.getByText("미확정")).toBeVisible();
  await assertNoHorizontalScroll(page, "copay-relief(boundary-unconfirmed)");
  await assertBodyFontSizes(page, "copay-relief(boundary-unconfirmed)");
  await assertTouchTargets(page, "copay-relief(boundary-unconfirmed)");
});
```

**이후**

```ts
test("PC-NF-MOBILE-1·2·3 — copay-relief 경계값(재태일수 203일, 5년 4개월 확정)", async ({ page }) => {
  await seedProfiles(page, [{ birthDate: BIRTH, dueDate: dueDateForGestationDays(BIRTH, 203) }]);
  await fixClockKst(page, "2026-06-01T09:00:00");
  await page.goto("/dashboard/copay-relief");
  await expect(page.getByText("5년 4개월")).toBeVisible();
  await assertNoHorizontalScroll(page, "copay-relief(203일 경계)");
  await assertBodyFontSizes(page, "copay-relief(203일 경계)");
  await assertTouchTargets(page, "copay-relief(203일 경계)");
});
```

**근거**: 위와 같은 innerBoundary 확정 반영. 이 화면(203일 경계값)은 이제 "미확정" 문구가
아니라 "5년 4개월" 확정 결과를 그린다 — `getByText("미확정")` 기대값은 이 라우트에서 더는
도달하지 않는다(라우트 자체는 여전히 유효하므로 삭제하지 않고, 같은 경계값에서 공통 모바일
검사(가로 넘침·17px·48px)를 계속 확인하도록 기대 텍스트만 바꿨다).
**되돌릴 위치**: `apps/preemie-calc/tests/e2e/nf-mobile.spec.ts:83`.

## 그 외 "새 값에 맞춘다"고 지시서가 언급한 항목 확인

지시서 CONTEXT 는 "기존 기준일 null 기대(reference-data 등)가 데이터 갱신으로 바뀌었으면
새 값(architect ⑬)에 맞춘다"고 했다. `tests/unit/reference-data.test.ts` 를 확인한 결과, 이
파일은 `effectiveDate === null` 이면 "둘 다 null" 분기로, 아니면 "둘 다 날짜" 분기로 자동
전환되는 **조건부 검증**이라 값 자체(2026-09-30 등)를 하드코딩하지 않는다 — architecture.md
⑬ 표의 갱신(모든 대상 파일의 `effectiveDate`·`lastVerified`가 null→날짜로 바뀜)은 이 파일의
어떤 기대값도 깨지 않았다(실행 결과 100% 통과로 확인). 그래서 이 파일은 "고친 테스트" 목록에
넣지 않았고, 대신 새 기준 데이터 3건(growth-lms·vaccination-schedule·formula-coefficients)의
메타 필드를 검사 대상에 **추가**만 했다(값 변경이 아니라 커버리지 확장이라 이 문서의 "고친
테스트"가 아니라 신규 테스트 취급 — `ac-matrix.md` F8/F10/F15 절 참고).

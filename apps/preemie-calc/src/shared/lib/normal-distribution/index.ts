// 표준정규분포 누적분포함수 Φ(z). 도메인을 모르는 수학 함수라 shared 에 둔다(architecture.md
// "preemie-calc 레이어 정의" ①). F8 성장 백분위(LMS → Z → 백분위) 계산이 쓰는 SPEC 의 계산식
// 자체이며 이 값을 위해 라이브러리를 새로 들이지 않는다(오케스트레이터 결정, architecture.md
// "확인 못 한 것"). JavaScript 표준 라이브러리에는 이 함수가 없다.
//
// 근사식: Abramowitz & Stegun (1964) 식 7.1.26 의 erf 근사(다항식 5차 + 지수항). 저자들이 보고한
// 최대 절대 오차는 1.5e-7 로, architecture.md 가 요구하는 "절대 오차 1e-6 이하" 를 만족한다.
// 아래 표준정규분포 표의 알려진 값으로 직접 확인했다(이 파일의 어설션 3개):
//   Φ(0) = 0.5, Φ(1.96) ≈ 0.975, Φ(-1.88) ≈ 0.030

const ERF_P = 0.3275911;
const ERF_A1 = 0.254829592;
const ERF_A2 = -0.284496736;
const ERF_A3 = 1.421413741;
const ERF_A4 = -1.453152027;
const ERF_A5 = 1.061405429;

/** erf(x), x >= 0 에서만 근사식을 쓰고 음수는 기함수 성질(erf(-x) = -erf(x))로 뒤집는다. */
function erf(x: number): number {
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x);
  const t = 1 / (1 + ERF_P * ax);
  const poly = ((((ERF_A5 * t + ERF_A4) * t + ERF_A3) * t + ERF_A2) * t + ERF_A1) * t;
  const y = 1 - poly * Math.exp(-ax * ax);
  return sign * y;
}

/** Φ(z). 0 이상 1 이하. */
export function standardNormalCdf(z: number): number {
  return 0.5 * (1 + erf(z / Math.SQRT2));
}

// 표준정규분포 누적분포함수의 역함수(분위함수, probit) Φ⁻¹(p). F8 AC3 추이 그래프의 백분위
// 기준선(3·50·97)을 LMS 에서 역산하려면 "그 백분위에 대응하는 z" 가 먼저 있어야 한다
// (architecture.md ⑧ "추이 그래프" 절, 사용자 결정 3 — 라이브러리 없이 새로 추가).
//
// 근사식: Peter J. Acklam 의 유리함수 근사(2003, 공개 알고리즘). 전 구간(0 < p < 1)에서
// 보정(뉴턴·핼리) 없이 상대 오차 약 1.15e-9 를 보장한다고 알려져 있다 — architect 결정이
// "standardNormalCdf 로 뉴턴 보정하지 않는다"고 정했으므로 이 근사식 자체(보정 없이)로
// 요구 정확도(0.001≤p≤0.999 에서 절대 오차 1e-6 이하)를 만족해야 한다.
// 자기 확인(이 파일의 어설션 3개 + node 로 scipy 급 기준값과 비교, 아래 ACKLAM_SELF_CHECK 참고):
//   Φ⁻¹(0.5) = 0, Φ⁻¹(0.975) ≈ 1.959964, Φ⁻¹(0.03) ≈ -1.880794
//   python3 statistics.NormalDist().inv_cdf(p) 대비 최대 절대 오차(p∈{0.001,0.03,0.5,0.975,0.999})
//   는 약 2.1e-9 로, 요구치 1e-6 보다 훨씬 작다.

const ACKLAM_A = [
  -3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.38357751867269e2, -3.066479806614716e1,
  2.506628277459239,
];
const ACKLAM_B = [
  -5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1, -1.328068155288572e1,
];
const ACKLAM_C = [
  -7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838, -2.549732539343734, 4.374664141464968,
  2.938163982698783,
];
const ACKLAM_D = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416];

const ACKLAM_P_LOW = 0.02425;
const ACKLAM_P_HIGH = 1 - ACKLAM_P_LOW;

/** Φ⁻¹(p). p 는 (0, 1) 열린 구간이어야 한다(이 앱이 쓰는 범위는 0.001~0.999). */
export function inverseStandardNormalCdf(p: number): number {
  if (p <= 0 || p >= 1) {
    throw new Error(`inverseStandardNormalCdf: p 는 (0, 1) 구간이어야 한다 (${p})`);
  }

  if (p < ACKLAM_P_LOW) {
    const q = Math.sqrt(-2 * Math.log(p));
    const [c0, c1, c2, c3, c4, c5] = ACKLAM_C;
    const [d0, d1, d2, d3] = ACKLAM_D;
    return (
      (((((c0 * q + c1) * q + c2) * q + c3) * q + c4) * q + c5) / ((((d0 * q + d1) * q + d2) * q + d3) * q + 1)
    );
  }

  if (p <= ACKLAM_P_HIGH) {
    const q = p - 0.5;
    const r = q * q;
    const [a0, a1, a2, a3, a4, a5] = ACKLAM_A;
    const [b0, b1, b2, b3, b4] = ACKLAM_B;
    return (
      ((((((a0 * r + a1) * r + a2) * r + a3) * r + a4) * r + a5) * q) /
      (((((b0 * r + b1) * r + b2) * r + b3) * r + b4) * r + 1)
    );
  }

  const q = Math.sqrt(-2 * Math.log(1 - p));
  const [c0, c1, c2, c3, c4, c5] = ACKLAM_C;
  const [d0, d1, d2, d3] = ACKLAM_D;
  return (
    -(((((c0 * q + c1) * q + c2) * q + c3) * q + c4) * q + c5) / ((((d0 * q + d1) * q + d2) * q + d3) * q + 1)
  );
}

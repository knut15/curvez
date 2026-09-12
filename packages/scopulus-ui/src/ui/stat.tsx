/**
 * 수치 하나와 그 이름. 한 덩어리가 `<dl>` 한 벌이다.
 *
 * 스펙은 `packages/scopulus-ui/design/components/Stat.md` 가 정본이다.
 *
 * **`<dl>` · `<dt>` · `<dd>` 다.** 이름이 `<dt>`, 값이 `<dd>` 이고 화면 순서와 DOM 순서가 같다.
 * 값을 위로 올리려고 순서를 뒤집지 마라 — `<dd>` 가 먼저 오면 무엇의 값인지 모른 채
 * 숫자가 먼저 읽힌다. `<div>` 둘로 만들지도 마라 — 이름과 값이 한 쌍이라는 사실이 시각에만 남는다.
 *
 * **숫자에 `tabular-nums` 를 건다.** 자릿수가 달라져도 글자 폭이 같아, 값이 갱신될 때
 * 옆 글자가 좌우로 흔들리지 않는다.
 *
 * **숫자를 포맷하지 않는다.** `value` 는 이미 다 만들어진 글자다. 로캘·단위·소수점 자리는
 * 화면마다 다르고, 여기서 정하면 부르는 쪽이 되돌릴 방법이 없다.
 *
 * **여러 개를 나란히 놓으려면 바깥에서 감싼다.** 여러 쌍을 한 `<dl>` 에 몰아넣지 않는다 —
 * 한 벌이 한 덩어리여야 배치를 바꿀 때 쌍이 흩어지지 않는다.
 *
 * `className` 을 열지 않는다. 자리와 간격은 감싸는 쪽이 정한다.
 */
export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <dl className="flex flex-col gap-1">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-2xl font-semibold tracking-[-0.015em] tabular-nums">
        {value}
      </dd>
    </dl>
  );
}

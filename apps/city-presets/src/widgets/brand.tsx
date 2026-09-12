/**
 * 로고. 마크와 이름이 늘 같이 선다.
 *
 * 마크는 **빛이 반쯤 든 원**이다. 사진의 절반에만 다른 빛이 드는 이 제품의
 * 동작이면서, 모서리가 없어 도구보다 마음 쪽으로 읽힌다. 두 색뿐이라
 * 16px 에서도 파비콘에서도 무너지지 않는다.
 *
 * 이름은 빛이 도는 결을 가리킨다 — shade(색조)와 tide(밀물처럼 드나드는 흐름).
 * 열두 개가 새벽에서 밤으로, 겨울에서 겨울로 도는 것이 그대로 이름이 된다.
 * 프레임에 찍히는 활자와 같은 명조 계열로 짠다.
 */
export function Brand({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <svg viewBox="0 0 16 16" aria-hidden className="size-[15px] shrink-0">
        <circle
          cx="8"
          cy="8"
          r="7.25"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
        />
        <path d="M8 0.75a7.25 7.25 0 0 1 0 14.5z" fill="currentColor" />
      </svg>
      <span className="font-serif text-[17px] leading-none tracking-tight">
        Shadetide
      </span>
    </span>
  );
}

/**
 * 랜딩의 기하 무늬. 전부 벡터라 해상도에 무관하고 색은 currentColor 로 토큰을 따라간다.
 * 장식이므로 읽을 내용이 없다 — 호출부에서 aria-hidden 을 준다.
 */

export function DiagonalStripes({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
    >
      {Array.from({ length: 14 }, (_, i) => (
        <line
          key={i}
          x1={-100 + i * 15}
          y1="100"
          x2={i * 15}
          y2="0"
          stroke="currentColor"
          strokeWidth="5"
        />
      ))}
    </svg>
  );
}

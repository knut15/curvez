/**
 * 로고. 마크와 이름이 늘 같이 선다.
 *
 * 마크는 **인화지 두 장이 어긋나게 겹친 것**이다. 도형과 값의 정본은 아티팩트
 * 「satinhaze 아이콘」이고 여기는 옮겨 담기만 한다 — 인화지 비율 108:132,
 * 뒤 장 -13°, 앞 장 9°, 타일 모서리 48.
 *
 * 두 장이 서로 반대로 기울어야 겹침이 의도된 것으로 읽힌다. 같은 방향이면
 * 그림자처럼 보인다.
 *
 * `strokeWidth` 는 그려지는 크기에 반비례한다(200/px). 작게 줄일수록 테두리가
 * 굵어지는 것을 막는다 — 여기서는 28px 로 그리므로 200/28 = 7.15 다.
 *
 * **헤더에서는 타일을 뺀다.** 연보라 타일을 깔면 28px 에서 두 장이 겹친 것이
 * 안 읽히고 분홍 사각 하나로 뭉갠다. 타일 없이 두면 뒤 장이 왼쪽 위로 비어져
 * 나와 두 장인 것이 보인다. 타일은 파비콘(`src/app/icon.svg`)에만 남긴다 —
 * 브라우저 탭은 꽉 찬 도형이 필요하다.
 */
export function Brand({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        viewBox="0 0 200 200"
        aria-hidden
        className="size-7 shrink-0"
        shapeRendering="geometricPrecision"
      >
        <g transform="rotate(-13 90 98)">
          <rect
            x="36"
            y="32"
            width="108"
            height="132"
            rx="9"
            fill="#FFFFFF"
            stroke="#E4DCEF"
            strokeWidth="7.15"
          />
          <rect x="45" y="41" width="90" height="88" rx="4" fill="#C9DEF2" />
        </g>
        <g transform="rotate(9 110 106)">
          <rect
            x="56"
            y="40"
            width="108"
            height="132"
            rx="9"
            fill="#FFFFFF"
            stroke="#E4DCEF"
            strokeWidth="7.15"
          />
          <rect x="65" y="49" width="90" height="88" rx="4" fill="#F5C3D0" />
          <circle cx="110" cy="88" r="18" fill="#E38FA6" />
        </g>
      </svg>
      <span className="font-serif text-[17px] leading-none tracking-tight">
        {/* S 만 코랄이다. 이름에서 한 글자만 색을 갖는다 */}
        <span style={{ color: "#EF8E63" }}>S</span>atinhaze
      </span>
    </span>
  );
}

/**
 * `cases/fsd-to-ddd` 의 FSD 여섯 층 그림.
 *
 * **원본이 `fsd-layers.png` 였다.** 흰 배경이 구워져 있어 다크 모드에서 밝은 판으로 떠올랐고,
 * 글자도 래스터라 확대하면 뭉갰다. 벡터 원본이 남아 있지 않아 좌표를 직접 적어 다시 그렸다.
 *
 * 왼쪽은 층이고 오른쪽은 그 층 하나를 열어 본 모습이다. 둘을 한 화폭에 두는 이유는 본문이
 * **"세로로 도메인을 가르고 가로로 성격을 가른다"** 를 한 번에 말하기 때문이다 — 나누면
 * 읽는 사람이 두 그림을 머릿속에서 겹쳐야 한다.
 *
 * 색은 `app/globals.css` 의 `.diagram` 스코프가 준다. 토큰을 쓰므로 라이트·다크가 따라온다.
 */

/** 여섯 층. 위가 가장 조립된 것이고 아래로 갈수록 날것이다. */
const LAYERS = [
  { name: "app", desc: "앱 진입점 · 프로바이더" },
  { name: "pages", desc: "라우트 단위 화면" },
  { name: "widgets", desc: "화면 한 덩어리" },
  { name: "features", desc: "사용자 동작 하나" },
  { name: "entities", desc: "업무 개념 하나", open: true },
  { name: "shared", desc: "도메인을 모르는 공용 코드" },
];

/** 슬라이스를 열면 나오는 칸. 성격별로 나뉜다. */
const SEGMENTS = [
  { name: "ui", desc: "컴포넌트" },
  { name: "model", desc: "타입 · 상태" },
  { name: "api", desc: "호출" },
  { name: "lib", desc: "유틸" },
];

const TOP = 44;
const BOX_H = 54;
const GAP = 16;
const LEFT_X = 48;
const LEFT_W = 268;

/** 열린 층(entities)의 세로 중심. 오른쪽 슬라이스를 이 높이에 맞춘다. */
const OPEN_INDEX = LAYERS.findIndex((l) => l.open);
const OPEN_Y = TOP + OPEN_INDEX * (BOX_H + GAP);

export function FsdLayersDiagram() {
  return (
    <figure
      role="img"
      aria-label="왼쪽에 app · pages · widgets · features · entities · shared 여섯 층이 위에서 아래로 쌓여 있고 층 사이마다 아래를 향한 화살표가 있다. 다섯째 층인 entities 에서 오른쪽으로 점선이 이어져 entities/product 슬라이스를 열어 보이고, 그 안은 ui · model · api · lib 네 칸으로 나뉜다."
    >
      <svg
        className="diagram"
        viewBox="0 0 880 480"
        style={{ width: "100%", height: "auto", display: "block" }}
      >
        <title>FSD 여섯 층과 슬라이스 안의 세그먼트</title>

        {/* 왼쪽 — 여섯 층. 위에서 아래로만 가져다 쓸 수 있다. */}
        {LAYERS.map((layer, i) => {
          const y = TOP + i * (BOX_H + GAP);
          return (
            <g key={layer.name}>
              <rect
                x={LEFT_X}
                y={y}
                width={LEFT_W}
                height={BOX_H}
                rx="6"
                className={layer.open ? "d-box d-box-open" : "d-box"}
              />
              <text x={LEFT_X + 18} y={y + 23} className="d-name" fontSize="13">
                {layer.name}
              </text>
              <text x={LEFT_X + 18} y={y + 40} className="d-desc" fontSize="10">
                {layer.desc}
              </text>

              {/* 층 사이 화살표. 마지막 층 아래에는 갈 곳이 없다. */}
              {i < LAYERS.length - 1 ? (
                <line
                  x1={LEFT_X + LEFT_W / 2}
                  y1={y + BOX_H + 2}
                  x2={LEFT_X + LEFT_W / 2}
                  y2={y + BOX_H + GAP - 3}
                  className="d-arrow"
                  markerEnd="url(#fsd-arrow)"
                />
              ) : null}
            </g>
          );
        })}

        {/* 열린 층에서 오른쪽 슬라이스로. 구조가 아니라 "이걸 열어 본 것" 이라는 표시다. */}
        <path
          d={`M ${LEFT_X + LEFT_W} ${OPEN_Y + BOX_H / 2} L ${LEFT_X + LEFT_W + 40} ${OPEN_Y + BOX_H / 2} L ${LEFT_X + LEFT_W + 40} 196 L ${LEFT_X + LEFT_W + 84} 196`}
          className="d-link"
          markerEnd="url(#fsd-arrow-open)"
        />

        {/* 오른쪽 — 슬라이스 하나를 열어 본 모습 */}
        <rect
          x="440"
          y="92"
          width="392"
          height="208"
          rx="8"
          className="d-panel"
        />
        <text x="462" y="120" className="d-name" fontSize="12">
          entities/product
        </text>
        <text x="462" y="136" className="d-desc" fontSize="10">
          한 슬라이스를 열어 본 모습
        </text>

        {SEGMENTS.map((seg, i) => {
          const col = i % 2;
          const row = Math.floor(i / 2);
          const x = 462 + col * 182;
          const y = 154 + row * 64;
          return (
            <g key={seg.name}>
              <rect
                x={x}
                y={y}
                width={166}
                height={52}
                rx="5"
                className="d-seg"
              />
              <text x={x + 14} y={y + 22} className="d-name" fontSize="12">
                {seg.name}
              </text>
              <text x={x + 14} y={y + 38} className="d-desc" fontSize="10">
                {seg.desc}
              </text>
            </g>
          );
        })}

        <defs>
          <marker
            id="fsd-arrow"
            markerWidth="8"
            markerHeight="6"
            refX="7"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 8 3, 0 6" className="d-arrow-head" />
          </marker>
          <marker
            id="fsd-arrow-open"
            markerWidth="8"
            markerHeight="6"
            refX="7"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 8 3, 0 6" className="d-link-head" />
          </marker>
        </defs>
      </svg>
      <figcaption>
        위에서 아래로만 가져다 쓸 수 있다. 오른쪽은{" "}
        <code>entities/product</code> 한 슬라이스를 열어 본 모습이다.
      </figcaption>
    </figure>
  );
}

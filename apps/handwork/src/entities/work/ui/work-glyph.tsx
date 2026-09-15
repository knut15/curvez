/**
 * 작업 카드 위에 얹는 그림. **slug 로 만든다.**
 *
 * 프로젝트가 스무 건이라 썸네일을 하나씩 만들 수가 없다. 스크린샷을 찍어 두면 화면이
 * 바뀔 때마다 낡고, 생성 이미지는 건마다 비용이 든다. 그래서 **이름에서 그림을 만든다** —
 * 같은 slug 는 언제나 같은 그림이 되고, 서로 다른 slug 는 다른 그림이 된다.
 *
 * 격자 위에 블록을 세우는 형태다. Flow 절의 도면과 같은 아이소메트릭이라 한 벌로 읽힌다.
 * 블록의 자리와 높이만 해시가 정하고, 색·선 굵기·각도는 전부 고정이다 — 무작위로 두면
 * 스무 장이 제각각 튄다.
 */

/** FNV-1a. 짧은 문자열에 쓰기 좋고 구현이 한눈에 들어온다. */
function hash(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** 해시에서 비트를 하나씩 꺼내 쓰는 자리. 같은 seed 면 같은 순서로 나온다. */
function stream(seed: string) {
  let h = hash(seed);
  return () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    h >>>= 0;
    return h / 4294967296;
  };
}

const COLS = 4;
const ROWS = 4;
/** 마름모 반폭·반높이. 비가 0.577 에 가까우면 도면처럼 읽힌다. */
const HW = 26;
const HH = 15;

export function WorkGlyph({ seed }: { seed: string }) {
  const next = stream(seed);

  // 격자 칸마다 블록을 세울지, 세운다면 얼마나 높일지 정한다.
  const cells: { col: number; row: number; height: number }[] = [];
  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      const r = next();
      if (r < 0.42) continue;
      cells.push({ col, row, height: 10 + Math.floor(next() * 4) * 11 });
    }
  }

  // 뒤에 있는 것부터 그려야 앞 블록이 뒤를 가린다.
  cells.sort((a, b) => a.col + a.row - (b.col + b.row));

  // 한 칸만 강조한다. 그림마다 코랄 점이 하나씩 있어 시선이 붙을 데가 생긴다.
  const accentAt = cells.length ? Math.floor(next() * cells.length) : -1;

  const cx = 140;
  const cy = 58;
  const pos = (col: number, row: number) => ({
    x: cx + (col - row) * HW,
    y: cy + (col + row) * HH,
  });

  return (
    <svg
      viewBox="0 0 280 210"
      role="presentation"
      className="h-full w-full"
      stroke="currentColor"
      strokeWidth="1"
      fill="none"
      strokeDasharray="3 2.5"
    >
      {/* 바닥 격자. 블록이 없는 칸도 자리가 있다는 것을 보인다. */}
      <g strokeDasharray="2 4" opacity="0.35">
        {Array.from({ length: ROWS + 1 }, (_, i) => {
          const a = pos(0, i);
          const b = pos(COLS, i);
          return <line key={`r${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />;
        })}
        {Array.from({ length: COLS + 1 }, (_, i) => {
          const a = pos(i, 0);
          const b = pos(i, ROWS);
          return <line key={`c${i}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />;
        })}
      </g>

      {cells.map((cell, i) => {
        const { x, y } = pos(cell.col + 0.5, cell.row + 0.5);
        const top = y - cell.height;
        const accent = i === accentAt;
        return (
          <g key={`${cell.col}-${cell.row}`}>
            {/* 좌면 · 우면 · 윗면 순. 겹치는 순서가 입체를 만든다. */}
            <polygon
              points={`${x - HW},${top} ${x},${top + HH} ${x},${top + HH + cell.height} ${x - HW},${top + cell.height}`}
              fill="var(--card)"
              opacity="0.9"
            />
            <polygon
              points={`${x + HW},${top} ${x},${top + HH} ${x},${top + HH + cell.height} ${x + HW},${top + cell.height}`}
              fill="var(--card)"
              opacity="0.9"
            />
            <polygon
              points={`${x},${top - HH} ${x + HW},${top} ${x},${top + HH} ${x - HW},${top}`}
              fill="var(--card)"
              stroke={accent ? "var(--diagram-accent)" : "currentColor"}
            />
          </g>
        );
      })}
    </svg>
  );
}

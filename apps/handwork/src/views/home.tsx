import Link from "next/link";

import type { CaseSummary } from "@/entities/case/model/types";
import type { LabSummary } from "@/entities/lab/model/types";
import type { WorkSummary } from "@/entities/work/model/types";

/**
 * 랜딩의 형태는 linear.app 에서 값으로 가져왔다 — 중립 배경 위에 카드 면을 얹고,
 * 선은 1px hairline, 반경 16px, 굵기 510, 자간 음수, 버튼은 pill 이다.
 * 색과 반경의 실제 값은 `app/globals.css` 의 오버라이드 블록이 갖는다.
 *
 * 구성은 히어로 → 세 영역 → 흐름 → 글쓰기 기준 네 단이다.
 * 슬로건은 히어로의 배지, 비전은 히어로의 헤드라인으로 올라갔다 — 절을 따로 두면
 * 방문자가 같은 말을 두 번 읽는다.
 *
 * **모션을 두지 않는다.** 스크롤 진입 애니메이션은 기다림을 만들고 `prefers-reduced-motion`
 * 분기를 하나 더 늘리는데, 이 화면이 전할 것은 글이지 움직임이 아니다.
 */

/** 히어로 배지의 세 마디. 슬로건 `질문하고, 실험하고, 반복한다.` 를 한 단어씩 옮긴 것이다. */
const SLOGAN_EN = ["Question", "Experiment", "Repeat"];

/** 글쓰기 기준 네 줄. 제목은 규칙, 본문은 그 규칙이 실제로 요구하는 것이다. */
const PRINCIPLES = [
  {
    title: "내가 실제로 겪은 일을 쓴다",
    body: "일반적인 기술 설명보다 당시의 문제와 선택을 중심에 둡니다.",
  },
  {
    title: "결론의 크기를 경험에 맞춘다",
    body: "“이 구조가 더 좋다”보다 “우리 앱의 이 문제에는 도움이 됐다”고 씁니다.",
  },
  {
    title: "미완성도 남긴다",
    body: "실패한 시도나 아직 모르는 부분도 Labs 에서는 충분한 기록입니다.",
  },
  {
    title: "시간이 지난 뒤 다시 평가한다",
    body: "만들 당시의 기대와 실제 사용 결과를 Works 에서 돌아봅니다.",
  },
];

/**
 * 아이소메트릭 큐브 하나. 윗면·좌면·우면을 따로 그려서 면마다 다르게 칠할 수 있게 둔다.
 *
 * 좌표를 직접 적는다. 변환 행렬로 눕히지 않는 이유는 선 굵기 때문이다 —
 * `matrix()` 를 쓰면 방향에 따라 1px 선이 다른 굵기로 그려진다.
 *
 * `fill` 은 우면 기준 불투명도다. 윗면은 밝게, 좌면은 어둡게 자동으로 가른다.
 * 0 이면 선만 남아 골조가 된다.
 */
function Cube({
  cx,
  cy,
  w,
  h,
  d,
  fill = 0,
  dashed = false,
}: {
  cx: number;
  cy: number;
  w: number;
  h: number;
  d: number;
  fill?: number;
  dashed?: boolean;
}) {
  const dash = dashed ? "2 3" : undefined;
  return (
    <g strokeDasharray={dash} strokeLinejoin="round">
      <polygon
        points={`${cx - w},${cy} ${cx},${cy + h} ${cx},${cy + h + d} ${cx - w},${cy + d}`}
        fill="currentColor"
        fillOpacity={fill * 0.5}
      />
      <polygon
        points={`${cx + w},${cy} ${cx},${cy + h} ${cx},${cy + h + d} ${cx + w},${cy + d}`}
        fill="currentColor"
        fillOpacity={fill}
      />
      <polygon
        points={`${cx},${cy - h} ${cx + w},${cy} ${cx},${cy + h} ${cx - w},${cy}`}
        fill="currentColor"
        fillOpacity={fill * 1.7}
      />
    </g>
  );
}

/** 세 그림이 같은 화폭·같은 선 굵기를 쓴다. 나란히 놓이므로 어긋나면 바로 보인다. */
function Fig({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 240 226"
      role="presentation"
      className="h-auto w-full max-w-[15rem]"
      stroke="currentColor"
      strokeWidth="1"
      fill="none"
      // 도형 선을 점선으로 깐다. 작도 중인 도면으로 읽히게 하는 자리다.
      // 개별 요소가 자기 `strokeDasharray` 를 주면 그쪽이 이긴다 —
      // 숨은선(`2 3`)·중심선(`9 3 2 3`)·치수선(`none`)이 그렇게 구분된다.
      strokeDasharray="3 2.5"
    >
      {children}
    </svg>
  );
}

/**
 * FIG 0.1 — Labs. **작은 조각이 흩어져 있다.**
 *
 * 아직 아무것도 이루지 않은 상태다. 조각끼리 닿아 있지 않고 높이도 제각각이며,
 * 몇 개는 점선이라 남을지 어떨지 정해지지 않았다.
 * 좌표는 손으로 흩뿌린 값이다 — 규칙적으로 놓으면 파편이 아니라 배열이 된다.
 */
const SHARDS: [number, number, boolean][] = [
  [74, 96, false],
  [106, 76, false],
  [142, 68, true],
  [172, 92, false],
  [56, 128, false],
  [94, 114, false],
  [128, 104, false],
  [162, 124, true],
  [82, 152, false],
  [116, 140, false],
  [150, 156, false],
  [180, 144, false],
  [98, 176, true],
  [136, 174, false],
];

function FigLabs() {
  return (
    <Fig>
      {SHARDS.map(([cx, cy, dashed], i) => (
        <g key={i} opacity={dashed ? 0.5 : 1}>
          <Cube cx={cx} cy={cy} w={13} h={7.5} d={9} dashed={dashed} />
        </g>
      ))}
    </Fig>
  );
}

/** 치수선. 양 끝에 보조 tick 을 긋고 가운데에 기호를 적는다. 설계도의 그 선이다. */
function Dim({
  x1,
  y1,
  x2,
  y2,
  label,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label: string;
}) {
  const vertical = x1 === x2;
  const tick = 4;
  return (
    <g opacity="0.7" strokeDasharray="none">
      <line x1={x1} y1={y1} x2={x2} y2={y2} />
      {[
        [x1, y1],
        [x2, y2],
      ].map(([x, y]) => (
        <line
          key={`${x}-${y}`}
          x1={vertical ? x - tick : x}
          y1={vertical ? y : y - tick}
          x2={vertical ? x + tick : x}
          y2={vertical ? y : y + tick}
        />
      ))}
      <text
        x={vertical ? x1 - 7 : (x1 + x2) / 2}
        y={vertical ? (y1 + y2) / 2 : y1 - 6}
        fill="currentColor"
        stroke="none"
        fontSize="9"
        textAnchor={vertical ? "end" : "middle"}
        dominantBaseline={vertical ? "middle" : "auto"}
        className="font-mono"
      >
        {label}
      </text>
    </g>
  );
}

/** 중심선. 일점쇄선이라 치수선·부재선과 구분된다. */
function CenterLine({ x, y1, y2 }: { x: number; y1: number; y2: number }) {
  return (
    <line
      x1={x}
      y1={y1}
      x2={x}
      y2={y2}
      strokeDasharray="9 3 2 3"
      opacity="0.45"
    />
  );
}

const CUBE = { cx: 120, base: 152, w: 62, h: 36, d: 54 };

/**
 * FIG 0.2 — Cases. **구조물의 골조.**
 *
 * 흩어져 있던 조각이 뼈대를 이룬 상태다. 면은 아직 없고 기둥과 보와 바닥 격자만 있다.
 * 뒤로 가려지는 모서리는 점선이다 — 도면에서 숨은선을 그리는 방식이다.
 * 중심선과 치수선을 같이 둬서 이것이 완성물이 아니라 **도면**임을 드러낸다.
 */
function FigFrame() {
  const { cx, base, w, h, d } = CUBE;
  const top = base - d;

  return (
    <Fig>
      <CenterLine x={cx} y1={top - h - 14} y2={base + h + 14} />

      {/* 바닥 격자. 마름모의 마주 보는 두 변 위의 같은 비율 지점을 잇는다.
          꼭짓점이 아니라 변 위에서 잡아야 선이 마름모 밖으로 나가지 않는다. */}
      <g opacity="0.4">
        {[1 / 3, 2 / 3].map((t) => (
          <g key={t}>
            <line
              x1={cx + w * t}
              y1={base - h + h * t}
              x2={cx - w + w * t}
              y2={base + h * t}
            />
            <line
              x1={cx - w * t}
              y1={base - h + h * t}
              x2={cx + w - w * t}
              y2={base + h * t}
            />
          </g>
        ))}
      </g>

      <polygon
        points={`${cx},${base - h} ${cx + w},${base} ${cx},${base + h} ${cx - w},${base}`}
      />
      <polygon
        points={`${cx},${top - h} ${cx + w},${top} ${cx},${top + h} ${cx - w},${top}`}
      />

      {/* 기둥 넷. 뒤쪽 하나는 다른 모서리에 가려지므로 숨은선으로 긋는다. */}
      <line x1={cx - w} y1={base} x2={cx - w} y2={top} />
      <line x1={cx + w} y1={base} x2={cx + w} y2={top} />
      <line x1={cx} y1={base + h} x2={cx} y2={top + h} />
      <line
        x1={cx}
        y1={base - h}
        x2={cx}
        y2={top - h}
        strokeDasharray="2 3"
        opacity="0.55"
      />

      {/* 기둥머리 절점. 도면에서 접합부를 찍는 자리다. */}
      <g fill="currentColor" stroke="none" opacity="0.6">
        {[
          [cx - w, top],
          [cx + w, top],
          [cx, top + h],
        ].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="1.8" />
        ))}
      </g>

      <Dim x1={26} y1={top} x2={26} y2={base} label="h" />
      <Dim
        x1={cx - w}
        y1={base + h + 26}
        x2={cx + w}
        y2={base + h + 26}
        label="w"
      />
    </Fig>
  );
}

/**
 * FIG 0.3 — Works. **면이 채워진 하나의 덩어리.**
 *
 * 골조에 면이 붙어 완결된 상태다. 우면에 부재선을 일정 간격으로 그어 속이 찬 것을 보이고,
 * 윗면의 작은 홈에는 지시선을 건다 — 완성이지만 다음에 손댈 자리가 아직 있다는 뜻이다.
 */
function FigComplete() {
  const { cx, base, w, h, d } = CUBE;
  const top = base - d;

  return (
    <Fig>
      <CenterLine x={cx} y1={top - h - 14} y2={base + h + 14} />

      <Cube cx={cx} cy={top} w={w} h={h} d={d} fill={0.08} />

      {/* 우면의 부재선. 윗변과 아랫변의 같은 비율 지점을 수직으로 잇는다. */}
      <g opacity="0.3">
        {[0.2, 0.4, 0.6, 0.8].map((t) => (
          <line
            key={t}
            x1={cx + w - w * t}
            y1={top + h * t}
            x2={cx + w - w * t}
            y2={top + h * t + d}
          />
        ))}
      </g>

      {/* 윗면의 홈과 지시선. */}
      <polygon
        points={`${cx},${top - 16} ${cx + 22},${top - 3} ${cx},${top + 10} ${cx - 22},${top - 3}`}
      />
      <g opacity="0.7" strokeDasharray="none">
        <line x1={cx + 14} y1={top - 9} x2={cx + 64} y2={top - 34} />
        <line x1={cx + 64} y1={top - 34} x2={cx + 80} y2={top - 34} />
        <circle
          cx={cx + 14}
          cy={top - 9}
          r="1.8"
          fill="currentColor"
          stroke="none"
        />
      </g>

      <Dim
        x1={cx - w}
        y1={base + h + 26}
        x2={cx + w}
        y2={base + h + 26}
        label="w"
      />
    </Fig>
  );
}

/** 세 영역이 이어지는 순서. 도면 번호가 순서를 대신하므로 화살표를 두지 않는다. */
const FLOW = [
  {
    fig: "FIG 0.1",
    name: "Labs",
    body: "궁금한 것을 실험한다. 답이 안 나온 시도도 그 자리에 그대로 남긴다.",
    art: <FigLabs />,
  },
  {
    fig: "FIG 0.2",
    name: "Cases",
    body: "흩어진 시도에서 무엇을 배웠고 왜 그렇게 정했는지를 하나로 정리한다.",
    art: <FigFrame />,
  },
  {
    fig: "FIG 0.3",
    name: "Works",
    body: "정리한 배움을 제품에 반영하고, 다음에 개선할 점을 다시 찾는다.",
    art: <FigComplete />,
  },
];

/** pill 버튼 두 종. Linear 의 실측값(높이 32px · 13px · 완전 둥근 모서리)을 따른다. */
const BUTTON =
  "inline-flex h-9 items-center rounded-full px-4 text-[0.8125rem] font-[510] transition-colors duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none";
const BUTTON_PRIMARY = `${BUTTON} bg-primary text-primary-foreground hover:opacity-90`;
const BUTTON_GHOST = `${BUTTON} border border-border text-foreground hover:bg-accent`;

/** 섹션 머리. 작은 라벨 · 큰 제목 · 설명 한 줄이 가운데로 선다. */
function SectionHead({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-[38rem] text-center">
      <p className="text-[0.8125rem] font-[510] text-muted-foreground">
        {label}
      </p>
      <h2 className="mt-3 text-[clamp(1.75rem,3.4vw,2.5rem)] leading-[1.15] font-[510] tracking-[-0.022em] break-keep">
        {title}
      </h2>
      {children ? (
        <p className="mt-4 leading-relaxed break-keep text-muted-foreground">
          {children}
        </p>
      ) : null}
    </div>
  );
}

/** 절 하나의 폭과 위아래 여백. 값이 절마다 어긋나면 리듬이 깨진다. */
function Section({ children }: { children: React.ReactNode }) {
  return (
    <section className="border-t border-border">
      <div className="mx-auto w-full max-w-5xl px-5 py-20 md:px-8 md:py-28">
        {children}
      </div>
    </section>
  );
}

/**
 * 히어로 아래 프레임.
 *
 * **사진이 아니라 이 사이트 자신의 화면이다.** linear.app 이 그 자리에 제품 스크린샷을
 * 놓는 것과 같은 자리이고, aster 의 제품은 기록물이라 케이스 목록이 곧 제품 화면이다.
 * 사진을 쓰던 것을 그만둔 이유: `public/brand/` 의 다섯 장은 전부 밝은 teal 이라
 * 중립으로 내린 배경 위에서 혼자 떠올랐다.
 *
 * **전체가 장식이라 `aria-hidden` 이다.** 여기 보이는 글 제목은 아래 세 영역 카드와
 * `/cases` 목록에 링크로 전부 다시 나오므로, 스크린리더가 같은 목록을 두 번 읽을 이유가 없다.
 * 그래서 안쪽에 링크를 두지 않는다 — 초점이 들어갔다가 아무 데도 못 가는 자리를 만들지 않는다.
 *
 * 카드 내용은 목업용 더미(`VISUAL_ROWS`)이고, 건수만 실제 값을 받는다.
 */
/**
 * 프레임 안에 깔리는 여덟 장. **실제 글 목록이 아니라 목업용 더미다.**
 *
 * 프레임 전체가 장식(`aria-hidden`)이고 안에서 어디로도 갈 수 없으므로, 여기 적힌 제목이
 * 실제 글과 일대일로 맞을 필요가 없다. 영어로 적은 것은 그림이 글자 모양으로만 읽히게
 * 하기 위해서다 — 한글 제목을 넣으면 장식이 아니라 읽을거리가 되어 헤드라인과 시선을 다툰다.
 *
 * 건수(`{n} items`)만 실제 값을 쓴다. 그 숫자는 사이트가 자란 만큼 늘어야 맞다.
 */
const VISUAL_ROWS = [
  {
    title: "Where should this code live?",
    body: "Moving API calls into entities made every review longer than the change itself.",
    date: "2026-09",
    tags: ["architecture", "fsd"],
  },
  {
    title: "Installing WordPress twice before writing a script",
    body: "Halfway through the second install I realised I had done all of this six months ago.",
    date: "2026-09",
    tags: ["wordpress", "automation"],
  },
  {
    title: "Five lines of CSS for Korean text",
    body: "The page was hard to read and nothing pointed at why. Too small, too tight, or both.",
    date: "2026-08",
    tags: ["css", "typography"],
  },
  {
    title: "What changes when you split the bundle",
    body: "A build is not one file but many pieces. Who decides the cuts, and what is lost in them?",
    date: "2026-07",
    tags: ["frontend", "next-js"],
  },
  {
    title: "The image I replaced still shows the old one",
    body: "The file went up. The browser kept serving what it already had.",
    date: "2026-07",
    tags: ["cdn", "caching"],
  },
  {
    title: "Same blue, different on every screen",
    body: "One hex from the mockup, one line of CSS. That line was where the trouble started.",
    date: "2026-07",
    tags: ["design-tokens", "css"],
  },
  {
    title: "Nothing happened when I clicked sign in",
    body: "No request, or a request that was refused? The Network panel answers in that order.",
    date: "2026-07",
    tags: ["devtools", "http"],
  },
  {
    title: "The boundary we wrote down and ignored",
    body: "A rule in a document holds for as long as it takes to write it, and no longer.",
    date: "2026-07",
    tags: ["eslint", "prettier"],
  },
];

function HeroVisual({ count }: { count: number }) {
  return (
    <div
      aria-hidden
      // 좁은 폭에서는 16:9 가 너무 납작해 카드 한 줄도 온전히 안 들어간다. 세로로 세운다.
      className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-background sm:aspect-[16/9]"
    >
      {/* 축소한 상단 바. 진짜 헤더와 같은 구성이라 이것이 이 사이트의 화면임을 알린다. */}
      <div className="flex items-baseline gap-3 border-b border-border px-4 py-2.5 text-[0.6875rem] font-[510] sm:px-5 sm:py-3">
        <span>
          <span className="text-brand-mark">a</span>ster
        </span>
        <span className="ml-auto flex gap-3 text-muted-foreground">
          <span>Works</span>
          <span className="text-foreground">Cases</span>
          <span>Labs</span>
        </span>
      </div>

      <div className="px-4 py-3.5 sm:px-5 sm:py-4">
        <p className="flex items-center gap-1.5 text-[0.6875rem] font-[510]">
          <span
            className="size-1 rounded-full"
            style={{ backgroundColor: "var(--brand-accent)" }}
          />
          Cases
          <span className="ml-auto text-muted-foreground">{count} items</span>
        </p>

        {/* 좁은 폭에서 2열이면 카드 폭이 134px 까지 줄어 제목도 날짜도 잘린다. */}
        <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {VISUAL_ROWS.map((row) => (
            <div
              key={row.title}
              className="rounded-lg border border-border bg-card p-3"
            >
              <p className="line-clamp-1 text-[0.75rem] font-[510] text-card-foreground">
                {row.title}
              </p>
              <p className="mt-1 line-clamp-2 text-[0.6875rem] leading-snug text-muted-foreground">
                {row.body}
              </p>
              <p className="mt-2 flex items-center gap-1.5 text-[0.625rem] text-muted-foreground">
                <span>{row.date}</span>
                {row.tags.map((tag) => (
                  <span key={tag} className="rounded bg-muted px-1.5 py-0.5">
                    {tag}
                  </span>
                ))}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 아래 1/3 을 배경으로 녹인다. 목록이 선으로 뚝 끊기지 않고 화면 밖으로 이어져 보인다. */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3"
        style={{
          background: "linear-gradient(to top, var(--background), transparent)",
        }}
      />
    </div>
  );
}

/** 세 영역 카드 한 장이 필요로 하는 값. 어느 컬렉션에서 왔는지는 알지 않는다. */
type Field = {
  name: string;
  href: string;
  question: string;
  body: string;
  count: number;
  /** 라벨 앞 점의 색. 세 영역을 색으로 구분한다 — 새 색을 만들지 않고 브랜드 둘과 중립 하나를 쓴다. */
  dot: string;
  /** 목록 맨 위 한 건. 컬렉션이 비어 있으면 null 이다. */
  top: { title: string; href: string } | null;
};

function FieldCard({ field }: { field: Field }) {
  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card p-6 transition-colors duration-150 ease-out hover:bg-accent motion-reduce:transition-none">
      <p className="flex items-center gap-2 text-[0.8125rem] font-[510]">
        <span
          aria-hidden
          className="size-1.5 rounded-full"
          style={{ backgroundColor: field.dot }}
        />
        <Link
          href={field.href}
          className="text-card-foreground transition-colors duration-150 ease-out hover:text-brand-accent focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none"
        >
          {field.name}
        </Link>
        <span className="ml-auto text-muted-foreground">{field.count}건</span>
      </p>

      <p className="mt-5 text-[1.0625rem] leading-snug font-[510] tracking-[-0.015em] break-keep text-card-foreground">
        {field.question}
      </p>

      <p className="mt-2 text-sm leading-relaxed break-keep text-muted-foreground">
        {field.body}
      </p>

      {/* 맨 위 한 건을 걸어 둔다. 영역 이름만으로는 안에 무엇이 있는지 알 수 없고,
          목록으로 한 번 더 들어가야 확인된다. */}
      <div className="mt-8 border-t border-border pt-4">
        {field.top ? (
          <Link
            href={field.top.href}
            className="flex items-start gap-2 text-sm break-keep text-muted-foreground transition-colors duration-150 ease-out hover:text-foreground focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none"
          >
            <span className="line-clamp-2">{field.top.title}</span>
            <span aria-hidden className="ml-auto">
              →
            </span>
          </Link>
        ) : (
          <p className="text-sm text-muted-foreground">
            아직 공개한 기록이 없습니다.
          </p>
        )}
      </div>
    </div>
  );
}

export function HomeView({
  works,
  cases,
  labs,
}: {
  works: WorkSummary[];
  cases: CaseSummary[];
  labs: LabSummary[];
}) {
  const fields: Field[] = [
    {
      name: "Works",
      href: "/works",
      question: "무엇을 만들었고, 얼마나 잘 작동했나?",
      body: "만든 앱을 돌아보고, 다음에 개선할 점을 찾습니다.",
      count: works.length,
      dot: "var(--brand-mark)",
      top: works[0]
        ? { title: works[0].title, href: `/works/${works[0].slug}` }
        : null,
    },
    {
      name: "Cases",
      href: "/cases",
      question: "무엇이 문제였고, 왜 이렇게 해결했나?",
      body: "문제를 해결하며 배운 내용과 선택의 이유를 정리합니다.",
      count: cases.length,
      dot: "var(--brand-accent)",
      top: cases[0]
        ? { title: cases[0].title, href: `/cases/${cases[0].slug}` }
        : null,
    },
    {
      name: "Labs",
      href: "/labs",
      question: "지금 무엇을 시도하고 있나?",
      body: "궁금한 것을 실험하고, 시도와 실패를 기록합니다.",
      count: labs.length,
      dot: "var(--muted-foreground)",
      // labs 는 연재 `order` 가 날짜보다 앞서 정렬한다. 그래서 여기 걸리는 것은
      // "최신" 이 아니라 목록에서 맨 위에 놓이는 글이고, 두 화면의 순서가 같아진다.
      top: labs[0]
        ? { title: labs[0].title, href: `/labs/${labs[0].slug}` }
        : null,
    },
  ];

  return (
    <main className="flex-1">
      <section className="relative overflow-hidden">
        {/* 상단 글로우. Linear 히어로가 배경을 그냥 검정으로 두지 않고 위쪽에서
            한 번 밝히는 자리다. 브랜드 teal 을 쓰고 아주 옅게 깐다. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[36rem]"
          style={{
            background:
              "radial-gradient(60% 55% at 50% 0%, color-mix(in oklab, var(--brand-accent) 16%, transparent), transparent 70%)",
          }}
        />

        <div className="relative mx-auto w-full max-w-5xl px-5 pt-20 pb-16 text-center md:px-8 md:pt-28">
          <p className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[0.8125rem] font-[510] text-muted-foreground">
            <span aria-hidden className="size-1.5 rounded-full bg-brand-mark" />
            {SLOGAN_EN.join(" · ")}
          </p>

          <h1 className="mt-7 text-[clamp(3.25rem,10vw,6rem)] leading-[0.9] font-black tracking-[-0.04em] lowercase">
            <span className="text-brand-mark">a</span>ster
          </h1>

          <p className="mx-auto mt-6 max-w-[22ch] text-[clamp(1.5rem,3.4vw,2.25rem)] leading-[1.2] font-[510] tracking-[-0.022em] break-keep">
            질문하고, 실험하고, 반복한다.
          </p>

          <p className="mx-auto mt-5 max-w-[44ch] leading-relaxed break-keep text-muted-foreground">
            직접 앱을 만들며 질문의 답을 찾고, 그 과정에서 얻은 배움을 다음
            시도에 반영합니다. 완성한 제품과, 만드는 동안 배운 것들을
            기록합니다.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link href="/works" className={BUTTON_PRIMARY}>
              Works 보기
            </Link>
            <Link href="/labs" className={BUTTON_GHOST}>
              Labs 보기
            </Link>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-5xl px-5 md:px-8">
          <HeroVisual count={cases.length} />
        </div>
        {/* 프레임 아래 여백. 다음 절의 `border-t` 가 곧바로 붙지 않게 띄운다. */}
        <div className="h-20 md:h-28" />
      </section>

      <Section>
        <SectionHead label="Fields" title="세 영역으로 나눠 씁니다">
          완성한 앱만 소개하는 데서 그치지 않고, 어떤 고민으로 만들었고 무엇을
          배웠는지까지 남깁니다.
        </SectionHead>

        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
          {fields.map((field) => (
            <FieldCard key={field.name} field={field} />
          ))}
        </div>
      </Section>

      <Section>
        <SectionHead label="Flow" title="실험이 배움이 되고, 제품이 됩니다">
          모든 기록이 이 순서를 따를 필요는 없지만, 세 영역이 서로 연결되는
          이유가 됩니다.
        </SectionHead>

        <ol className="mt-14 grid grid-cols-1 gap-y-6 md:grid-cols-3 md:gap-y-0">
          {FLOW.map((step, i) => (
            <li
              key={step.name}
              className="relative px-0 py-4 text-center md:px-7 md:py-2 md:text-left"
            >
              {/* 칸을 나누는 선. 위아래 끝에서 배경으로 녹는다 — 1px 선이 위아래로
                  뚝 끊기면 도면이 아니라 표의 칸으로 읽힌다. 첫 칸 왼쪽에는 두지 않는다. */}
              {i > 0 ? (
                <span
                  aria-hidden
                  className="absolute inset-y-0 left-0 hidden w-px md:block"
                  style={{
                    background:
                      "linear-gradient(to bottom, transparent, var(--border) 18%, var(--border) 82%, transparent)",
                  }}
                />
              ) : null}
              <p className="font-mono text-[0.6875rem] tracking-[0.14em] text-muted-foreground/60 uppercase">
                {step.fig}
              </p>

              <div className="mt-5 flex justify-center text-muted-foreground/55 md:justify-start">
                {step.art}
              </div>

              <p className="mt-7 text-[0.9375rem] font-[510] tracking-[-0.015em] text-foreground">
                {step.name}
              </p>
              <p className="mt-2 text-sm leading-relaxed break-keep text-muted-foreground">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </Section>

      <Section>
        <SectionHead label="Notes" title="글마다 완벽한 결론을 내지 않습니다">
          무엇이 궁금했고, 무엇을 해봤으며, 다음에는 무엇을 바꿀지가 드러나면
          됩니다.
        </SectionHead>

        <ol className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {PRINCIPLES.map((rule, i) => (
            <li
              key={rule.title}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <p className="text-[0.8125rem] font-[510] text-muted-foreground">
                {String(i + 1).padStart(2, "0")}
              </p>
              <p className="mt-3 font-[510] tracking-[-0.015em] break-keep text-card-foreground">
                {rule.title}
              </p>
              <p className="mt-2 text-sm leading-relaxed break-keep text-muted-foreground">
                {rule.body}
              </p>
            </li>
          ))}
        </ol>
      </Section>
    </main>
  );
}

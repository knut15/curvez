import {
  colorTokens,
  contrastPairs,
  radiusTokens,
  SPACING,
  TYPE_SCALE,
} from "@/shared/lib/tokens";

/**
 * `/docs/tokens` 의 눈으로 보는 부분.
 *
 * **값을 적어 두지 않는다.** `tokens.css` 와 `design/tokens.md` 를 빌드 시점에 읽는다.
 * 이 화면이 "정본은 CSS 다" 라고 말하므로, 사본을 들고 있으면 자기 말을 어긴다.
 *
 * 서버 컴포넌트다. `node:fs` 를 쓰는 모듈을 읽으므로 `"use client"` 를 붙이지 마라.
 */

/** 라이트·다크 값을 같은 행에서 보인다. 한쪽만 보면 짝이 맞는지 알 수 없다. */
export function ColorTokens() {
  const tokens = colorTokens();

  return (
    <div className="not-prose my-8 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            {["Token", "Light", "Dark", "On"].map((h) => (
              <th
                key={h}
                className="py-2 pr-4 text-xs font-medium tracking-wider text-muted-foreground uppercase"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tokens.map((t) => (
            <tr key={t.name} className="border-b border-border">
              <td className="py-2 pr-4 font-mono text-xs whitespace-nowrap">
                {t.name}
              </td>
              {/* 견본은 CSS 변수를 그대로 읽는다. 값을 문자열로 넣으면 테마 전환에
                  따라오지 못하고, 그 순간 이 표가 사본이 된다. */}
              <td className="py-2 pr-4">
                <span className="flex items-center gap-2">
                  <span
                    className="size-5 shrink-0 rounded-sm border border-border"
                    style={{ background: `var(${t.name})` }}
                    aria-hidden
                  />
                  <code className="font-mono text-[0.7rem] text-muted-foreground">
                    {t.light}
                  </code>
                </span>
              </td>
              <td className="py-2 pr-4">
                <span className="flex items-center gap-2">
                  {/* 다크 값은 `.dark` 안에서만 유효하므로 견본을 그 안에 넣는다. */}
                  <span className="dark size-5 shrink-0 rounded-sm border border-border">
                    <span
                      className="block size-full rounded-sm"
                      style={{ background: `var(${t.name})` }}
                      aria-hidden
                    />
                  </span>
                  <code className="font-mono text-[0.7rem] text-muted-foreground">
                    {t.dark}
                  </code>
                </span>
              </td>
              <td className="py-2 font-mono text-[0.7rem] text-muted-foreground">
                {t.on ?? "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** `check-contrast.mjs` 가 검사하는 쌍을 그대로 보인다. 수치는 그 문서에 적힌 값이다. */
export function ContrastPairs() {
  const pairs = contrastPairs();
  const modes = [
    { id: "light" as const, label: "Light" },
    { id: "dark" as const, label: "Dark" },
  ];

  return (
    <div className="not-prose my-8 flex flex-col gap-6">
      {modes.map((mode) => {
        const rows = pairs.filter((p) => p.mode === mode.id);
        if (rows.length === 0) return null;
        return (
          <div key={mode.id}>
            <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
              {mode.label}
            </p>
            <ul
              role="list"
              className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
            >
              {rows.map((p) => (
                <li
                  key={`${p.fg}-${p.bg}-${p.note}`}
                  className="flex flex-col gap-1"
                >
                  <span
                    className="flex items-baseline justify-between gap-3 rounded-md border border-border px-3 py-2.5"
                    style={{ background: p.bg, color: p.fg }}
                  >
                    <span className="text-sm">가나다 Ag</span>
                    <span className="font-mono text-xs tabular-nums">
                      {Number.isNaN(p.ratio) ? "—" : p.ratio.toFixed(2)}
                    </span>
                  </span>
                  <span className="text-xs break-keep text-muted-foreground">
                    {p.note} · 하한 {p.min}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

/** 막대 길이가 곧 값이다. 숫자만 적으면 단계 사이 간격이 얼마나 벌어지는지 안 보인다. */
export function SpacingScale() {
  return (
    <div className="not-prose my-8 flex flex-col gap-2">
      {SPACING.map((s) => (
        <div key={s.step} className="flex items-center gap-3">
          <code className="w-12 shrink-0 text-right font-mono text-xs tabular-nums text-muted-foreground">
            {s.step}
          </code>
          <span className={`h-3 shrink-0 rounded-sm bg-primary ${s.cls}`} />
          <code className="font-mono text-xs tabular-nums text-muted-foreground">
            {s.px}px
          </code>
        </div>
      ))}
    </div>
  );
}

/** 실제 크기로 한 줄씩. 화면에 보이는 클래스와 같은 것을 쓴다. */
export function TypeScale() {
  return (
    <div className="not-prose my-8 flex flex-col gap-4">
      {TYPE_SCALE.map((t) => (
        <div key={t.name} className="flex items-baseline gap-4">
          <code className="w-24 shrink-0 font-mono text-xs text-muted-foreground">
            {t.name}
          </code>
          <span className={`${t.cls} truncate font-medium tracking-tight`}>
            디자인 시스템
          </span>
          <code className="ml-auto shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
            {t.px}px
          </code>
        </div>
      ))}
    </div>
  );
}

/** 모서리는 값으로 적어도 안 보인다. 네 상자를 나란히 두면 차이가 바로 읽힌다. */
export function RadiusScale() {
  const tokens = radiusTokens();

  return (
    <div className="not-prose my-8 flex flex-wrap gap-5">
      {tokens.map((t) => (
        <div key={t.name} className="flex flex-col items-center gap-2">
          <span
            className="size-16 border border-border bg-muted"
            style={{ borderRadius: `var(${t.name})` }}
            aria-hidden
          />
          <code className="font-mono text-xs text-muted-foreground">
            {t.name.replace("--radius", "radius")}
          </code>
        </div>
      ))}
    </div>
  );
}

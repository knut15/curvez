"use client";

import { useState } from "react";

import { Grader } from "@/shared/grade-gl";
import { PRESETS } from "@/shared/presets";

/**
 * 셰이더가 `presets/grade.py` 와 같은 그림을 내는지 기계가 판정한다.
 *
 * 판정 기준은 `docs/GOAL.md` 3절 — 평균 절대차 0.5 레벨 미만, 1레벨 초과 픽셀 1% 미만.
 * 대상은 `presets/base/` 여섯 장 × 12 프리셋 = 72장 전수다.
 *
 * 기준 이미지는 `public/.verify/` 에 둔다. 커밋하지 않는다(479MB) — 만드는 법은
 * `presets/compare.py` 옆 주석과 README 에 있다.
 */
const BASES = [
  "00-base",
  "01-base-outdoor",
  "02-base-cafe",
  "03-base-cat",
  "04-base-flowers",
  "05-base-platform",
];

type Row = { name: string; mean: number; over1: number; max: number };

async function load(src: string) {
  const img = new window.Image();
  img.src = src;
  await img.decode();
  return img;
}

function pixels(source: CanvasImageSource, w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(source, 0, 0);
  return ctx.getImageData(0, 0, w, h).data;
}

export default function Verify() {
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);

  async function run() {
    setBusy(true);
    setRows([]);
    const canvas = document.createElement("canvas");
    const grader = new Grader(canvas);
    const out: Row[] = [];
    for (const base of BASES) {
      const src = await load(`/.verify/${base}.png`);
      const w = src.naturalWidth;
      const h = src.naturalHeight;
      for (const p of PRESETS) {
        grader.render(src, w, h, p.stem);
        const mine = pixels(canvas, w, h);
        const theirs = pixels(
          await load(`/.verify/${base}__${p.stem}.png`),
          w,
          h,
        );
        let sum = 0;
        let over = 0;
        let max = 0;
        let n = 0;
        for (let i = 0; i < mine.length; i += 4) {
          for (let k = 0; k < 3; k++) {
            const d = Math.abs(mine[i + k] - theirs[i + k]);
            sum += d;
            if (d > 1) over++;
            if (d > max) max = d;
            n++;
          }
        }
        out.push({
          name: `${base}__${p.stem}`,
          mean: sum / n,
          over1: (over / n) * 100,
          max,
        });
        setRows([...out]);
        await new Promise((r) => setTimeout(r, 0));
      }
    }
    setBusy(false);
  }

  const bad = rows.filter((r) => r.mean >= 0.5 || r.over1 >= 1);

  return (
    <main className="mx-auto max-w-3xl p-6 font-mono text-[13px]">
      <button
        type="button"
        onClick={run}
        disabled={busy}
        className="mb-4 rounded border border-border px-3 py-1.5 disabled:opacity-50"
      >
        {busy ? `도는 중 ${rows.length}/72` : "72장 판정"}
      </button>
      {rows.length > 0 && (
        <p className="mb-3">
          {rows.length}장 · 평균{" "}
          {(rows.reduce((s, r) => s + r.mean, 0) / rows.length).toFixed(3)} ·
          최악 {Math.max(...rows.map((r) => r.mean)).toFixed(3)} · 미달{" "}
          {bad.length}장
        </p>
      )}
      <table className="w-full">
        <tbody>
          {[...rows]
            .sort((a, b) => b.mean - a.mean)
            .map((r) => (
              <tr
                key={r.name}
                className={r.mean >= 0.5 || r.over1 >= 1 ? "text-red-600" : ""}
              >
                <td className="pr-4">{r.name}</td>
                <td className="pr-4 text-right">{r.mean.toFixed(3)}</td>
                <td className="pr-4 text-right">{r.over1.toFixed(2)}%</td>
                <td className="text-right">{r.max}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </main>
  );
}

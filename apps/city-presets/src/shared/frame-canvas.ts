/**
 * `presets/frame.py` 를 캔버스로 옮긴 것. 배치와 비율은 그쪽이 정본이고 여기는
 * 옮겨 담기만 한다. 찍히는 글자도 손으로 적지 않는다 — `preset-values.ts` 의
 * `FRAME_LABELS` 를 `presets/export_values.py` 가 만든다.
 *
 * **서체는 원본과 같은 것을 쓴다.** macOS 에 깔린 Didot 과 Menlo 다. 다른 기기에서는
 * 뒤의 것으로 물러서므로 글자 모양이 달라진다 — 값은 같고 생김새만 다르다.
 */
import { FRAME_LABELS } from "./preset-values";

const PAPER = "rgb(252, 251, 249)"; // 순백보다 살짝 따뜻한 종이색
const INK = "rgb(38, 40, 43)";
const GREY = "rgb(122, 124, 128)";

const NAME_FONT = 'Didot, "Bodoni 72", Georgia, serif';
const DATA_FONT = 'Menlo, "SF Mono", ui-monospace, monospace';

/** 프레임 전체 크기. 사진 크기에서 나온다.
 *  파이썬의 `int()` 는 버림이라 여기도 `Math.floor` 를 쓴다. */
export function frameSize(w: number, h: number) {
  const side = Math.floor(w * 0.075);
  const bottom = Math.floor(w * 0.3);
  return { side, bottom, width: w + side * 2, height: h + side + bottom };
}

export function drawFrame(
  target: HTMLCanvasElement,
  photo: CanvasImageSource,
  w: number,
  h: number,
  stem: string,
  /** 도시 이름 대신 찍을 글자. 비우면 프리셋의 이름을 쓴다 */
  name?: string,
) {
  const label = FRAME_LABELS[stem];
  if (!label) throw new Error(`프레임 글자가 없다: ${stem}`);
  const title = name?.trim() || label.city;
  const { side, width, height } = frameSize(w, h);

  target.width = width;
  target.height = height;
  const d = target.getContext("2d")!;
  d.fillStyle = PAPER;
  d.fillRect(0, 0, width, height);
  d.drawImage(photo, side, side, w, h);
  d.textBaseline = "top";

  // 도시 이름과 무드
  const nameSize = Math.floor(w * 0.04);
  const y = side + h + Math.floor(w * 0.055);
  d.font = `${nameSize}px ${NAME_FONT}`;
  d.fillStyle = INK;
  d.fillText(title, side, y);
  const tw = d.measureText(title).width;
  d.font = `${Math.floor(w * 0.02)}px ${NAME_FONT}`;
  d.fillStyle = GREY;
  d.fillText(
    label.mood,
    side + tw + Math.floor(w * 0.018),
    y + Math.floor(w * 0.018),
  );

  // 값 — 폭을 넘으면 줄인다. **잘린 값은 틀린 값이다**
  const [l1, l2] = label.lines;
  const floor = Math.floor(w * 0.009);
  let size = Math.floor(w * 0.0165);
  const fits = (s: number) => {
    d.font = `${s}px ${DATA_FONT}`;
    return Math.max(d.measureText(l1).width, d.measureText(l2).width) <= w;
  };
  while (size > floor && !fits(size)) size -= 1;
  if (!fits(size)) throw new Error(`${stem}: 값 줄이 프레임 폭을 넘는다`);

  d.font = `${size}px ${DATA_FONT}`;
  d.fillStyle = GREY;
  const ly = side + h + Math.floor(w * 0.15);
  d.fillText(l1, side, ly);
  d.fillText(l2, side, ly + Math.floor(size * 1.75));
}

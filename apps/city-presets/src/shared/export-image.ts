/**
 * 받아 가는 파일을 만든다. **원본 해상도 그대로다** — 화면에 띄우는 미리보기는
 * 긴 변 2048 로 줄이지만 받는 것은 줄이지 않는다(`docs/GOAL.md` 완료 기준).
 *
 * 내보낼 때마다 WebGL 컨텍스트를 새로 열고 끝나면 놓는다. 미리보기용 컨텍스트를
 * 같이 쓰면 화면에 띄운 것이 내보내는 크기로 덮여 버린다.
 */
import { drawFrame, frameSize } from "./frame-canvas";
import { Grader } from "./grade-gl";

const QUALITY = 0.95;

async function toBlob(canvas: HTMLCanvasElement) {
  const blob = await new Promise<Blob | null>((res) =>
    canvas.toBlob(res, "image/jpeg", QUALITY),
  );
  if (!blob) throw new Error("이미지를 만들지 못했다");
  return blob;
}

/**
 * 색을 건 그림을 2D 캔버스로 옮겨 온다.
 *
 * **컨텍스트를 놓기 전에 옮겨야 한다.** `loseContext()` 는 드로잉 버퍼를 버리므로
 * 먼저 놓고 나서 `toBlob` 을 부르면 새까만 그림이 나온다. 실제로 그랬다.
 */
async function graded(photo: string, stem: string) {
  const img = new window.Image();
  img.src = photo;
  await img.decode();
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  const gpu = document.createElement("canvas");
  const grader = new Grader(gpu);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  try {
    grader.render(img, w, h, stem);
    canvas.getContext("2d")!.drawImage(gpu, 0, 0);
  } finally {
    grader.dispose();
  }
  return { canvas, w, h };
}

/** 색이 걸린 사진 한 장. 받기의 기본 */
export async function exportPhoto(photo: string, stem: string) {
  const { canvas } = await graded(photo, stem);
  return toBlob(canvas);
}

/** 흰 테두리와 값 스트립이 붙은 것. 선택 */
export async function exportFramed(
  photo: string,
  stem: string,
  name?: string,
  mood?: string,
) {
  const { canvas, w, h } = await graded(photo, stem);
  const out = document.createElement("canvas");
  const { width, height } = frameSize(w, h);
  out.width = width;
  out.height = height;
  drawFrame(out, canvas, w, h, stem, name, mood);
  return toBlob(out);
}

/** 만든 파일을 기기에 내려준다. 어디로도 올리지 않는다 */
export function save(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  // 바로 거두면 브라우저가 다 읽기 전에 주소가 사라진다. 크롬은 넘어가지만
  // 사파리·파이어폭스에서는 받기가 빈 파일로 끝난다.
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

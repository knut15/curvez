// 스펙: .curvez/design/preemie-calc/components/ShareCardCanvas.md
// 공유용 카드 이미지를 브라우저 <canvas> 로 그린다(서버에서 그리지 않는다 — architecture ⑤,
// 아이 정보를 서버로 보내지 않기 위해). 이름·성별·체중·프로필 id 는 그리지 않는다(PC-F7-AC1).
export type ShareCardParams = {
  chronological: { value: string };
  // subValue 는 before-due 일 때만 있다. 96px 로 그리는 value(짧은 핵심 숫자)와 별도 줄로
  // 나눠 952px 사용 가능 폭을 넘지 않게 한다(2026-09-29 교정 라운드, DSG-01 수정).
  corrected: { kind: "hidden" | "before-due" | "after-due"; value: string; subValue?: string } | null;
  todayLabel: string;
  siteName: string;
};

const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1350;
const PADDING = 64;

// 색은 tokens.md 가 정본인 CSS 변수를 그 자리에서 읽는다. hex 값을 이 파일에 옮겨 적지 않는다.
function readColorToken(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function drawShareCard(ctx: CanvasRenderingContext2D, params: ShareCardParams): void {
  const colorBgCanvas = readColorToken("--color-bg-canvas");
  const colorTextMuted = readColorToken("--color-text-muted");
  const colorTextPrimary = readColorToken("--color-text-primary");
  const colorAccentPrimary = readColorToken("--color-accent-primary");
  const colorAccentCorrected = readColorToken("--color-accent-corrected");
  const colorAccentPrimarySoftBg = readColorToken("--color-accent-primary-soft-bg");
  const colorAccentCorrectedSoftBg = readColorToken("--color-accent-corrected-soft-bg");

  ctx.fillStyle = colorBgCanvas;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // 장식(그리기 순서상 맨 먼저, 다른 요소보다 아래 레이어). 반투명 원 2개 — 정보를 담지 않는다.
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = colorAccentPrimarySoftBg;
  ctx.beginPath();
  ctx.arc(1000, 60, 260, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = colorAccentCorrectedSoftBg;
  ctx.beginPath();
  ctx.arc(40, 1300, 220, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.textBaseline = "top";
  ctx.textAlign = "left";

  const x = PADDING;
  let y = PADDING;

  ctx.font = "32px sans-serif";
  ctx.fillStyle = colorTextMuted;
  ctx.fillText(params.siteName, x, y);
  y += 32 + 16;

  ctx.font = "28px sans-serif";
  ctx.fillStyle = colorTextMuted;
  ctx.fillText(params.todayLabel, x, y);
  y += 28 + 48;

  ctx.font = "bold 40px sans-serif";
  ctx.fillStyle = colorAccentPrimary;
  ctx.fillText("생후", x, y);
  y += 40 + 8;

  ctx.font = "bold 96px sans-serif";
  ctx.fillStyle = colorTextPrimary;
  ctx.fillText(params.chronological.value, x, y);
  y += 96 + 32;

  if (params.corrected && params.corrected.kind !== "hidden") {
    ctx.font = "bold 40px sans-serif";
    ctx.fillStyle = colorAccentCorrected;
    ctx.fillText("교정", x, y);
    y += 40 + 8;

    ctx.font = "bold 96px sans-serif";
    ctx.fillStyle = colorTextPrimary;
    ctx.fillText(params.corrected.value, x, y);
    y += 96;

    if (params.corrected.subValue) {
      y += 12;
      ctx.font = "40px sans-serif";
      ctx.fillStyle = colorTextMuted;
      ctx.fillText(params.corrected.subValue, x, y);
      y += 40;
    }
  } else {
    ctx.font = "32px sans-serif";
    ctx.fillStyle = colorTextMuted;
    ctx.fillText("교정연령 해당 없음(재태 37주 이상)", x, y);
    y += 32;
  }
  y += 40;

  ctx.font = "32px sans-serif";
  ctx.fillStyle = colorTextMuted;
  ctx.fillText("생후: 출생일 기준 · 교정: 출산 예정일 기준", x, y);
  y += 32 + 56;

  ctx.font = "26px sans-serif";
  ctx.fillStyle = colorTextMuted;
  ctx.fillText("참고용이며 진단을 대신하지 않음", x, y);
}

/** navigator.share 의 text 필드용 대체 텍스트. canvas 이미지는 스크린리더가 읽지 못한다. */
export function shareCardAltText(params: ShareCardParams): string {
  const correctedText =
    params.corrected && params.corrected.kind !== "hidden"
      ? `교정 ${params.corrected.value}${params.corrected.subValue ? ` · ${params.corrected.subValue}` : ""}`
      : "교정연령 해당 없음(재태 37주 이상)";
  return `${params.siteName} · ${params.todayLabel} · 생후 ${params.chronological.value} · ${correctedText} · 참고용이며 진단을 대신하지 않음`;
}

/** 1080×1350 PNG 을 브라우저 canvas 로 만든다. canvas 를 못 그리면 null. */
export async function createShareCardBlob(params: ShareCardParams): Promise<Blob | null> {
  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  drawShareCard(ctx, params);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/png");
  });
}

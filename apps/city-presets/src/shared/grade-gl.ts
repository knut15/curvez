/**
 * `presets/grade.py` 를 WebGL2 로 옮긴 것. 연산 순서와 계수는 그쪽이 정본이고
 * 여기는 옮겨 담기만 한다. 값도 손으로 적지 않는다 — `preset-values.ts` 는
 * `presets/export_values.py` 가 만든다.
 *
 * 통과 기준은 `docs/GOAL.md` 3절이다. 파이썬과 평균 절대차 0.5 레벨 미만,
 * 1레벨 초과 픽셀 1% 미만.
 */
import { PRESET_VALUES, type PresetParams } from "./preset-values";

/** 블러는 1/4 로 줄여서 건다. 파이썬의 `BLUR_SCALE` 과 같아야 한다 */
const BLUR_SCALE = 4;

const VERT = `#version 300 es
void main() {
  // 화면을 덮는 삼각형 하나
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

const HEAD = `#version 300 es
precision highp float;
precision highp int;
out vec4 fragColor;
uniform sampler2D uSrc;

vec3 srgb2lin(vec3 c) {
  return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(vec3(0.04045), c));
}
vec3 lin2srgb(vec3 c) {
  c = clamp(c, 0.0, 1.0);
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(vec3(0.0031308), c));
}
float luma(vec3 c) { return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
`;

/** 노출 → 블랙포인트. `grade.py` 의 첫 묶음 */
const FS_TONE =
  HEAD +
  `
uniform float uExposure, uWarmth, uTint, uBrilliance, uHighlights, uShadows;
uniform float uContrast, uBrightness, uBlackPoint;

void main() {
  vec3 a = texelFetch(uSrc, ivec2(gl_FragCoord.xy), 0).rgb;

  if (uExposure != 0.0) a = lin2srgb(srgb2lin(a) * pow(2.0, uExposure * 1.2));
  if (uWarmth != 0.0 || uTint != 0.0) {
    vec3 lin = srgb2lin(a);
    lin.r *= 1.0 + uWarmth * 0.18;
    lin.b *= 1.0 - uWarmth * 0.18;
    lin.g *= 1.0 - uTint * 0.12;
    a = lin2srgb(lin);
  }
  float L = luma(a);
  if (uBrilliance != 0.0) {
    a = clamp(a + uBrilliance * 0.35 * pow(1.0 - L, 2.2) * (1.0 - a)
                - uBrilliance * 0.25 * pow(L, 2.2) * a, 0.0, 1.0);
    L = luma(a);
  }
  if (uHighlights != 0.0) {
    a = clamp(a + uHighlights * 0.45 * pow(L, 2.0) * (1.0 - a), 0.0, 1.0);
    L = luma(a);
  }
  if (uShadows != 0.0) {
    a = clamp(a + uShadows * 0.45 * pow(1.0 - L, 2.0) * (1.0 - a * 0.2), 0.0, 1.0);
  }
  if (uContrast != 0.0) a = clamp(0.5 + (a - 0.5) * (1.0 + uContrast * 0.55), 0.0, 1.0);
  if (uBrightness != 0.0) a = pow(clamp(a, 1e-6, 1.0), vec3(1.0 - uBrightness * 0.45));
  if (uBlackPoint != 0.0) {
    float bp = uBlackPoint * 0.14;
    a = bp > 0.0 ? clamp((a - bp) / (1.0 - bp), 0.0, 1.0)
                 : clamp(a * (1.0 + bp) - bp, 0.0, 1.0);
  }
  fragColor = vec4(a, 1.0);
}`;

/** s×s 블록 평균. 파이썬 `_downsample` 과 같다 — 가장자리는 복제 */
const FS_DOWN =
  HEAD +
  `
uniform ivec2 uSrcSize;
uniform int uScale;
void main() {
  ivec2 o = ivec2(gl_FragCoord.xy) * uScale;
  vec3 sum = vec3(0.0);
  for (int y = 0; y < uScale; y++)
    for (int x = 0; x < uScale; x++)
      sum += texelFetch(uSrc, clamp(o + ivec2(x, y), ivec2(0), uSrcSize - 1), 0).rgb;
  fragColor = vec4(sum / float(uScale * uScale), 1.0);
}`;

/** 분리형 가우시안 한 방향. 커널은 밖에서 넣는다 */
const FS_BLUR =
  HEAD +
  `
uniform ivec2 uSrcSize;
uniform ivec2 uDir;
uniform int uRadius;
uniform float uKernel[96];
void main() {
  ivec2 p = ivec2(gl_FragCoord.xy);
  vec3 sum = vec3(0.0);
  for (int i = -uRadius; i <= uRadius; i++)
    sum += uKernel[i + uRadius]
         * texelFetch(uSrc, clamp(p + uDir * i, ivec2(0), uSrcSize - 1), 0).rgb;
  fragColor = vec4(sum, 1.0);
}`;

/** 저해상도 블러를 파이썬 `_upsample` 과 같은 식으로 되돌린다 */
const UPSAMPLE = `
uniform sampler2D uBlur;
uniform ivec2 uBlurSize;
vec3 upsample(vec2 xy, float s) {
  vec2 f = (xy + 0.5) / s - 0.5;
  vec2 i0 = floor(f);
  vec2 t = f - i0;
  ivec2 p = ivec2(i0);
  ivec2 lo = ivec2(0), hi = uBlurSize - 1;
  vec3 a = texelFetch(uBlur, clamp(p, lo, hi), 0).rgb;
  vec3 b = texelFetch(uBlur, clamp(p + ivec2(1, 0), lo, hi), 0).rgb;
  vec3 c = texelFetch(uBlur, clamp(p + ivec2(0, 1), lo, hi), 0).rgb;
  vec3 d = texelFetch(uBlur, clamp(p + ivec2(1, 1), lo, hi), 0).rgb;
  vec3 top = a + (b - a) * t.x;
  vec3 bot = c + (d - c) * t.x;
  return top + (bot - top) * t.y;
}`;

/** 명료도 → 색상별 채도. `grade.py` 의 가운데 묶음 */
const FS_COLOR =
  HEAD +
  UPSAMPLE +
  `
uniform float uDefinition, uSaturation, uVibrance;
uniform vec3 uSplitShadowRGB, uSplitHighRGB;
uniform float uSplitShadowAmt, uSplitHighAmt;
uniform int uHueCount;
uniform vec3 uHueSat[4];   // (중심각, 폭, 증감/100)
uniform float uBlurScale;

float hueDeg(vec3 c) {
  float mx = max(c.r, max(c.g, c.b));
  float mn = min(c.r, min(c.g, c.b));
  float d = mx - mn;
  if (d == 0.0) return 0.0;
  float h;
  if (mx == c.r)      h = mod((c.g - c.b) / d, 6.0);
  else if (mx == c.g) h = (c.b - c.r) / d + 2.0;
  else                h = (c.r - c.g) / d + 4.0;
  return h * 60.0;
}

void main() {
  vec3 a = texelFetch(uSrc, ivec2(gl_FragCoord.xy), 0).rgb;

  if (uDefinition != 0.0) {
    vec3 lo = upsample(gl_FragCoord.xy, uBlurScale);
    float m = clamp(1.0 - abs(luma(a) - 0.5) * 1.6, 0.0, 1.0);
    a = clamp(a + (a - lo) * uDefinition * 1.4 * m, 0.0, 1.0);
  }

  float L = luma(a);
  if (uSplitShadowAmt != 0.0)
    a = clamp(a + (uSplitShadowRGB - 0.5) * uSplitShadowAmt * pow(1.0 - L, 1.6), 0.0, 1.0);
  if (uSplitHighAmt != 0.0)
    a = clamp(a + (uSplitHighRGB - 0.5) * uSplitHighAmt * pow(L, 1.6), 0.0, 1.0);

  float g = luma(a);
  if (uSaturation != 0.0) { a = clamp(g + (a - g) * (1.0 + uSaturation), 0.0, 1.0); g = luma(a); }
  if (uVibrance != 0.0) {
    float s = max(a.r, max(a.g, a.b)) - min(a.r, min(a.g, a.b));
    a = clamp(g + (a - g) * (1.0 + uVibrance * (1.0 - clamp(s * 1.8, 0.0, 1.0))), 0.0, 1.0);
  }

  for (int i = 0; i < uHueCount; i++) {
    float dd = abs(mod(hueDeg(a) - uHueSat[i].x + 180.0, 360.0) - 180.0);
    float w = clamp(1.0 - dd / uHueSat[i].y, 0.0, 1.0);
    float gg = luma(a);
    a = clamp(a + w * ((a - gg) * uHueSat[i].z), 0.0, 1.0);
  }
  fragColor = vec4(a, 1.0);
}`;

/** 블룸 → 그레인. `grade.py` 의 마지막 묶음 */
const FS_FINISH =
  HEAD +
  UPSAMPLE +
  `
uniform float uBloom, uVignette, uGrain, uBlurScale;
uniform ivec2 uSize;

uint hash(uint x, uint y, uint seed) {
  uint h = x * 374761393u + y * 668265263u + seed * 2246822519u;
  h = (h ^ (h >> 13u)) * 1274126177u;
  h = h ^ (h >> 16u);
  return h & 0xFFFFFFu;   // 파이썬도 24비트로 자른다. float 가수가 24비트다
}
float h01(uint x, uint y, uint s) { return float(hash(x, y, s)) / 16777216.0; }

void main() {
  // 프레임버퍼는 아래가 0행이고 캔버스는 위가 0행이다. 여기서 한 번 뒤집어
  // 바로 선 그림을 내보낸다. UNPACK_FLIP_Y_WEBGL 은 ImageBitmap 업로드에
  // 먹지 않아서(0·1 이 같은 결과였다) 업로드 플래그에 기대지 않는다.
  // 아래 p 는 전부 사진 좌표다 — 파이썬의 (x, y) 와 같다.
  ivec2 p = ivec2(int(gl_FragCoord.x), uSize.y - 1 - int(gl_FragCoord.y));
  vec3 a = texelFetch(uSrc, p, 0).rgb;

  if (uBloom != 0.0) {
    vec3 br = upsample(vec2(p), uBlurScale);
    float m = clamp((luma(a) - 0.6) / 0.4, 0.0, 1.0);
    a = clamp(a + br * m * uBloom, 0.0, 1.0);
  }
  if (uVignette != 0.0) {
    vec2 c = (vec2(p) - vec2(uSize) * 0.5) / (vec2(uSize) * 0.5);
    float r = length(c);
    a = clamp(a * (1.0 - uVignette * 0.55 * max(r - 0.45, 0.0)), 0.0, 1.0);
  }
  if (uGrain != 0.0) {
    // 파이썬과 같은 좌표계다. 위에서부터 센 y 를 그대로 쓴다
    uint x = uint(p.x), y = uint(p.y);
    // 균등난수 셋을 더해 정규분포에 가깝게. Box-Muller 는 sin·log 정밀도가 갈린다
    float n = (h01(x, y, 1u) + h01(x, y, 2u) + h01(x, y, 3u) - 1.5) / 0.5;
    a = clamp(a + n * uGrain * (1.0 - abs(luma(a) - 0.5) * 1.2), 0.0, 1.0);
  }
  fragColor = vec4(a, 1.0);
}`;

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    throw new Error(`셰이더 컴파일 실패: ${gl.getShaderInfoLog(sh)}`);
  }
  return sh;
}

function program(gl: WebGL2RenderingContext, fs: string) {
  const p = gl.createProgram()!;
  gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, VERT));
  gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    throw new Error(`셰이더 링크 실패: ${gl.getProgramInfoLog(p)}`);
  }
  return p;
}

/** 3시그마에서 자른 정규화 가우시안. 파이썬 `_gauss_kernel` 과 같다 */
function gaussKernel(sigma: number) {
  const r = Math.ceil(3 * sigma);
  const w: number[] = [];
  let sum = 0;
  for (let i = -r; i <= r; i++) {
    const v = Math.exp(-(i * i) / (2 * sigma * sigma));
    w.push(v);
    sum += v;
  }
  return { radius: r, kernel: w.map((v) => v / sum) };
}

/** 색상 각도를 순색 RGB 로. 파이썬 `hue_rgb` 와 같다 */
function hueRGB(deg: number): [number, number, number] {
  const h = (((deg / 60) % 6) + 6) % 6;
  const i = Math.floor(h);
  const f = h - i;
  const q = 1 - f;
  const t = f;
  const table: [number, number, number][] = [
    [1, t, 0],
    [q, 1, 0],
    [0, 1, t],
    [0, q, 1],
    [t, 0, 1],
    [1, 0, q],
  ];
  return table[i];
}

type Target = { fb: WebGLFramebuffer; tex: WebGLTexture; w: number; h: number };

export class Grader {
  private gl: WebGL2RenderingContext;
  private progs: Record<string, WebGLProgram>;
  private targets: Target[] = [];
  private format: number;

  /** 이 기기가 그 형식으로 그릴 수 있는지 실제로 프레임버퍼를 만들어 본다 */
  private renderable(gl: WebGL2RenderingContext, format: number) {
    const tex = gl.createTexture();
    const fb = gl.createFramebuffer();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texStorage2D(gl.TEXTURE_2D, 1, format, 1, 1);
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      tex,
      0,
    );
    const ok =
      gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.deleteFramebuffer(fb);
    gl.deleteTexture(tex);
    return ok;
  }

  constructor(private canvas: HTMLCanvasElement | OffscreenCanvas) {
    const gl = canvas.getContext("webgl2", {
      premultipliedAlpha: false,
      preserveDrawingBuffer: true,
    }) as WebGL2RenderingContext | null;
    if (!gl) throw new Error("WebGL2 를 쓸 수 없다");
    // 중간 결과를 8비트로 깎으면 단계마다 반올림이 쌓여 파이썬과 벌어진다
    if (!gl.getExtension("EXT_color_buffer_float")) {
      throw new Error("EXT_color_buffer_float 이 없다");
    }
    this.gl = gl;
    // 중간 결과의 정밀도. 32비트면 파이썬과 평균 0.000 까지 맞는다(마라케시 실측).
    // 16비트로 내려가면 0.08 쯤으로 벌어지는데 그래도 기준(0.5)의 6분의 1이다.
    this.format = this.renderable(gl, gl.RGBA32F) ? gl.RGBA32F : gl.RGBA16F;
    this.progs = {
      tone: program(gl, FS_TONE),
      down: program(gl, FS_DOWN),
      blur: program(gl, FS_BLUR),
      color: program(gl, FS_COLOR),
      finish: program(gl, FS_FINISH),
    };
    gl.bindVertexArray(gl.createVertexArray());
  }

  private target(w: number, h: number): Target {
    const gl = this.gl;
    const tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texStorage2D(gl.TEXTURE_2D, 1, this.format, w, h);
    for (const k of [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER]) {
      gl.texParameteri(gl.TEXTURE_2D, k, gl.NEAREST);
    }
    for (const k of [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T]) {
      gl.texParameteri(gl.TEXTURE_2D, k, gl.CLAMP_TO_EDGE);
    }
    const fb = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      tex,
      0,
    );
    const t = { fb, tex, w, h };
    this.targets.push(t);
    return t;
  }

  private draw(prog: WebGLProgram, into: Target | null, w: number, h: number) {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, into ? into.fb : null);
    gl.viewport(0, 0, w, h);
    gl.useProgram(prog);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  private blurChain(src: Target, radius: number): Target {
    const gl = this.gl;
    const s = BLUR_SCALE;
    // 파이썬은 s 의 배수로 가장자리를 복제해 채운다. 저해상도 크기를 같게 맞춘다
    const lw = Math.ceil(src.w / s);
    const lh = Math.ceil(src.h / s);
    const down = this.target(lw, lh);
    const tmp = this.target(lw, lh);
    const out = this.target(lw, lh);

    gl.useProgram(this.progs.down);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, src.tex);
    gl.uniform1i(gl.getUniformLocation(this.progs.down, "uSrc"), 0);
    gl.uniform2i(
      gl.getUniformLocation(this.progs.down, "uSrcSize"),
      src.w,
      src.h,
    );
    gl.uniform1i(gl.getUniformLocation(this.progs.down, "uScale"), s);
    this.draw(this.progs.down, down, lw, lh);

    const { radius: r, kernel } = gaussKernel(radius / s);
    const p = this.progs.blur;
    for (const [dir, from, to] of [
      [[1, 0], down, tmp],
      [[0, 1], tmp, out],
    ] as [number[], Target, Target][]) {
      gl.useProgram(p);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, from.tex);
      gl.uniform1i(gl.getUniformLocation(p, "uSrc"), 0);
      gl.uniform2i(gl.getUniformLocation(p, "uSrcSize"), lw, lh);
      gl.uniform2i(gl.getUniformLocation(p, "uDir"), dir[0], dir[1]);
      gl.uniform1i(gl.getUniformLocation(p, "uRadius"), r);
      gl.uniform1fv(
        gl.getUniformLocation(p, "uKernel"),
        new Float32Array(kernel),
      );
      this.draw(p, to, lw, lh);
    }
    return out;
  }

  /**
   * 사진 한 장에 프리셋 하나를 걸어 캔버스에 그린다.
   *
   * `src` 는 **이미 w×h 로 줄여 온 것**이어야 한다. 원본 크기 그대로 올리면
   * 뷰포트가 w×h 라 왼쪽 위 귀퉁이만 잘려 나온다.
   */
  render(src: TexImageSource, w: number, h: number, presetName: string) {
    const gl = this.gl;
    const v: PresetParams = PRESET_VALUES[presetName] ?? {};
    const n = (k: keyof PresetParams) =>
      ((v[k] as number | undefined) ?? 0) / 100;

    this.canvas.width = w;
    this.canvas.height = h;
    this.targets = [];

    const input = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, input);
    // 뒤집지 않는다. 텍스처 0행이 사진의 맨 윗줄이고, 캔버스도 그대로 받는다.
    // 1 로 두면 결과가 상하로 뒤집혀 나온다 — 실제로 그랬다.
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
    for (const k of [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER]) {
      gl.texParameteri(gl.TEXTURE_2D, k, gl.NEAREST);
    }
    const inTarget: Target = { fb: null as never, tex: input, w, h };

    // 1. 노출 → 블랙포인트
    const toneOut = this.target(w, h);
    const pt = this.progs.tone;
    gl.useProgram(pt);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, inTarget.tex);
    gl.uniform1i(gl.getUniformLocation(pt, "uSrc"), 0);
    for (const [name, key] of [
      ["uExposure", "exposure"],
      ["uWarmth", "warmth"],
      ["uTint", "tint"],
      ["uBrilliance", "brilliance"],
      ["uHighlights", "highlights"],
      ["uShadows", "shadows"],
      ["uContrast", "contrast"],
      ["uBrightness", "brightness"],
      ["uBlackPoint", "black_point"],
    ] as [string, keyof PresetParams][]) {
      gl.uniform1f(gl.getUniformLocation(pt, name), n(key));
    }
    this.draw(pt, toneOut, w, h);

    // 2. 명료도용 블러 → 명료도 → 스플릿 토닝 → 채도 → 색상별 채도
    const defBlur = v.definition
      ? this.blurChain(toneOut, 22)
      : this.target(1, 1);
    const colorOut = this.target(w, h);
    const pc = this.progs.color;
    gl.useProgram(pc);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, toneOut.tex);
    gl.uniform1i(gl.getUniformLocation(pc, "uSrc"), 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, defBlur.tex);
    gl.uniform1i(gl.getUniformLocation(pc, "uBlur"), 1);
    gl.uniform2i(gl.getUniformLocation(pc, "uBlurSize"), defBlur.w, defBlur.h);
    gl.uniform1f(gl.getUniformLocation(pc, "uBlurScale"), BLUR_SCALE);
    gl.uniform1f(gl.getUniformLocation(pc, "uDefinition"), n("definition"));
    gl.uniform1f(gl.getUniformLocation(pc, "uSaturation"), n("saturation"));
    gl.uniform1f(gl.getUniformLocation(pc, "uVibrance"), n("vibrance"));
    const ss = v.splitShadow,
      sh = v.splitHigh;
    gl.uniform3fv(
      gl.getUniformLocation(pc, "uSplitShadowRGB"),
      hueRGB(ss ? ss[0] : 0),
    );
    gl.uniform1f(
      gl.getUniformLocation(pc, "uSplitShadowAmt"),
      ss ? ss[1] / 100 : 0,
    );
    gl.uniform3fv(
      gl.getUniformLocation(pc, "uSplitHighRGB"),
      hueRGB(sh ? sh[0] : 0),
    );
    gl.uniform1f(
      gl.getUniformLocation(pc, "uSplitHighAmt"),
      sh ? sh[1] / 100 : 0,
    );
    const hs = v.hueSat ?? [];
    gl.uniform1i(gl.getUniformLocation(pc, "uHueCount"), hs.length);
    if (hs.length) {
      gl.uniform3fv(
        gl.getUniformLocation(pc, "uHueSat"),
        new Float32Array(hs.flatMap(([c, wd, amt]) => [c, wd, amt / 100])),
      );
    }
    this.draw(pc, colorOut, w, h);

    // 3. 블룸용 블러 → 블룸 → 비네트 → 그레인
    const bloomBlur = v.bloom
      ? this.blurChain(colorOut, 28)
      : this.target(1, 1);
    const pf = this.progs.finish;
    gl.useProgram(pf);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, colorOut.tex);
    gl.uniform1i(gl.getUniformLocation(pf, "uSrc"), 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, bloomBlur.tex);
    gl.uniform1i(gl.getUniformLocation(pf, "uBlur"), 1);
    gl.uniform2i(
      gl.getUniformLocation(pf, "uBlurSize"),
      bloomBlur.w,
      bloomBlur.h,
    );
    gl.uniform1f(gl.getUniformLocation(pf, "uBlurScale"), BLUR_SCALE);
    gl.uniform1f(gl.getUniformLocation(pf, "uBloom"), n("bloom"));
    gl.uniform1f(gl.getUniformLocation(pf, "uVignette"), n("vignette"));
    gl.uniform1f(gl.getUniformLocation(pf, "uGrain"), n("grain") * 0.06);
    gl.uniform2i(gl.getUniformLocation(pf, "uSize"), w, h);
    this.draw(pf, null, w, h);

    gl.deleteTexture(input);
    for (const t of this.targets) {
      gl.deleteFramebuffer(t.fb);
      gl.deleteTexture(t.tex);
    }
    this.targets = [];
  }
}

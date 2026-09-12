"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { FreeMode } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  Input,
} from "@scopulus/ui";

import { exportFramed, exportPhoto, save } from "@/shared/export-image";
import { drawFrame } from "@/shared/frame-canvas";
import { Grader } from "@/shared/grade-gl";
import { FRAME_LABELS } from "@/shared/preset-values";
import { PRESETS } from "@/shared/presets";

import "swiper/css";
import "swiper/css/free-mode";

/**
 * 사진을 고르기 전 화면의 본체. 도시를 누르면 뷰어가 그 색으로 바뀐다.
 *
 * 사진을 넣은 뒤에도 조작은 이것과 같다 — 뷰어 하나와 도시 줄 하나. 시작 전에는
 * 데모 사진이 그 자리에 들어가 있을 뿐이다. 같은 구조를 두 번 쓰는 이유는
 * 사진을 넣기 전에 조작법이 이미 눈에 익게 하기 위해서다.
 */
export function PresetPicker() {
  const [active, setActive] = useState(0);
  // 처음에는 원본만 보인다. 아래 인트로가 선을 한 번 끝까지 훑고 가운데로 데려온다.
  const [split, setSplit] = useState(100);
  const [intro, setIntro] = useState(true);
  const [photo, setPhoto] = useState<string | null>(null);
  const frame = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  // Base UI 의 Dialog 는 포털로 나중에 붙는다. ref 로는 그릴 시점에 아직 비어 있어서
  // 노드를 상태로 받는다 — 붙는 순간이 곧 그릴 순간이다.
  const [framed, setFramed] = useState<HTMLCanvasElement | null>(null);
  const [frameOpen, setFrameOpen] = useState(false);
  const [frameError, setFrameError] = useState<string | null>(null);
  const [saving, setSaving] = useState<"photo" | "frame" | null>(null);
  // 프레임에 찍을 이름. 비워 두면 프리셋의 도시 이름을 쓴다
  const [frameName, setFrameName] = useState("");
  const [frameMood, setFrameMood] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const grader = useRef<Grader | null>(null);
  const file = useRef<HTMLInputElement>(null);
  const sliding = useRef(false);
  const raf = useRef(0);
  const preset = PRESETS[active];

  /**
   * 선이 오른쪽 끝에서 왼쪽 끝까지 갔다가 가운데로 돌아온다 — 원본이 무엇이고
   * 그 색이 걸리면 어떻게 되는지를 먼저 보여 주고, 그다음 그 선이 손으로 옮기는
   * 것임을 자리로 알린다. 처음 한 번과 도시를 바꿀 때마다 돈다. 도는 동안에는 잡히지 않는다.
   *
   * 상태를 전부 `requestAnimationFrame` 안에서만 바꾼다. 함수 본문에서 바로 바꾸면
   * effect 안에서 부르는 순간 렌더가 겹친다.
   */
  const sweep = useCallback((hold: number) => {
    cancelAnimationFrame(raf.current);
    const legs = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? [{ from: 50, to: 50, ms: 1 }]
      : [
          { from: 100, to: 100, ms: hold },
          { from: 100, to: 0, ms: 900 },
          { from: 0, to: 50, ms: 520 },
        ];
    const ease = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    let leg = 0;
    let start = 0;
    function tick(now: number) {
      if (!start) {
        start = now;
        setIntro(true);
      }
      const { from, to, ms } = legs[leg];
      const t = Math.min(1, (now - start) / ms);
      setSplit(from + (to - from) * ease(t));
      if (t < 1) {
        raf.current = requestAnimationFrame(tick);
        return;
      }
      leg += 1;
      start = 0;
      if (leg < legs.length) {
        raf.current = requestAnimationFrame(tick);
        return;
      }
      setIntro(false);
    }
    raf.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    sweep(320);
    const id = raf;
    return () => cancelAnimationFrame(id.current);
  }, [sweep]);

  // 고른 사진은 `blob:` 주소로만 들고 있다. 기기 밖으로 내보내지 않으므로
  // 화면에서 내릴 때 이 주소를 직접 거둬야 메모리가 돌아온다.
  useEffect(() => {
    return () => {
      if (photo) URL.revokeObjectURL(photo);
    };
  }, [photo]);

  /**
   * 고른 사진에 지금 도시의 색을 건다. 계산은 전부 이 기기의 GPU 안에서 돈다.
   *
   * 미리보기는 긴 변 2048 로 줄여서 건다. 블러 반경이 픽셀 단위라 원본 크기에서
   * 걸면 데모 사진과 다른 세기로 보이고, 1,200만 화소를 도시마다 다시 거는 것은
   * 누를 때마다 기다리게 만든다. 원본 해상도로 내보내는 것은 받기를 붙일 때다.
   */
  useEffect(() => {
    const el = canvas.current;
    if (!photo || !el) return;
    let dead = false;
    const img = new window.Image();
    img.onload = async () => {
      if (dead) return;
      const cap = 2048;
      const k = Math.min(
        1,
        cap / Math.max(img.naturalWidth, img.naturalHeight),
      );
      const w = Math.max(1, Math.round(img.naturalWidth * k));
      const h = Math.max(1, Math.round(img.naturalHeight * k));
      try {
        // 셰이더에 올리기 전에 줄인다. 원본 크기로 올리면 뷰포트가 w×h 라
        // 왼쪽 위 귀퉁이만 잘려 나온다.
        const bmp = await createImageBitmap(img, {
          resizeWidth: w,
          resizeHeight: h,
          resizeQuality: "high",
        });
        if (dead) return bmp.close();
        grader.current ??= new Grader(el);
        grader.current.render(bmp, w, h, preset.stem);
        bmp.close();
      } catch (err) {
        console.error("[city-presets] 색을 걸지 못했다", err);
      }
    };
    img.src = photo;
    return () => {
      dead = true;
    };
  }, [photo, preset.stem]);

  /**
   * 프레임 완성본. 사진에 흰 테두리를 두르고 아래에 적용값을 찍는다 —
   * `presets/frame.py` 가 내놓는 것과 같은 배치다.
   *
   * 사진을 골랐으면 방금 색을 건 캔버스를 쓰고, 아직이면 그 도시의 데모 적용본을 쓴다.
   */
  useEffect(() => {
    if (!frameOpen || !framed) return;
    let dead = false;
    (async () => {
      try {
        let source: CanvasImageSource;
        let w: number;
        let h: number;
        if (photo && canvas.current) {
          source = canvas.current;
          w = canvas.current.width;
          h = canvas.current.height;
        } else {
          const img = new window.Image();
          img.src = `/demo/${preset.stem}-after.webp`;
          await img.decode();
          source = img;
          w = img.naturalWidth;
          h = img.naturalHeight;
        }
        if (dead) return;
        drawFrame(framed, source, w, h, preset.stem, frameName, frameMood);
        setFrameError(null);
      } catch (err) {
        setFrameError(err instanceof Error ? err.message : String(err));
      }
    })();
    return () => {
      dead = true;
    };
  }, [frameOpen, framed, frameName, frameMood, photo, preset.stem]);

  /**
   * 받기. **원본 해상도 그대로 다시 건다** — 화면의 것은 긴 변 2048 로 줄인
   * 미리보기라 그대로 내보내면 작아진 사진을 받게 된다.
   */
  async function download(kind: "photo" | "frame") {
    if (!photo || saving) return;
    setSaving(kind);
    try {
      const blob =
        kind === "photo"
          ? await exportPhoto(photo, preset.stem)
          : await exportFramed(photo, preset.stem, frameName, frameMood);
      const suffix = kind === "frame" ? "-frame" : "";
      save(blob, `city-presets-${preset.stem}${suffix}.jpg`);
    } catch (err) {
      console.error("[city-presets] 받지 못했다", err);
      setFrameError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(null);
    }
  }

  function onPick(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    // 같은 사진을 다시 골라도 change 가 나게 값을 비운다
    e.target.value = "";
    if (!f || !f.type.startsWith("image/")) return;
    setPhoto((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(f);
    });
    setSplit(50);
  }

  /** 손끝의 가로 위치를 사진 안에서의 비율로 바꾼다 */
  function moveTo(clientX: number) {
    const el = frame.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setSplit(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)));
  }

  function onHandleDown(e: PointerEvent<HTMLDivElement>) {
    if (intro) return;
    sliding.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    moveTo(e.clientX);
  }

  function onHandleMove(e: PointerEvent<HTMLDivElement>) {
    if (sliding.current) moveTo(e.clientX);
  }

  function onHandleUp(e: PointerEvent<HTMLDivElement>) {
    sliding.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  }

  // 끌지 못하는 사람도 경계를 옮길 수 있어야 한다
  function onHandleKey(e: KeyboardEvent<HTMLDivElement>) {
    if (intro) return;
    const step = e.shiftKey ? 10 : 2;
    if (e.key === "ArrowLeft") setSplit((v) => Math.max(0, v - step));
    else if (e.key === "ArrowRight") setSplit((v) => Math.min(100, v + step));
    else if (e.key === "Home") setSplit(0);
    else if (e.key === "End") setSplit(100);
    else return;
    e.preventDefault();
  }

  /**
   * 이음매이자 손잡이다. 좌우로 끌면 원본과 적용본의 경계가 따라 움직인다.
   * 보이는 것은 1px 선이지만 잡는 자리는 32px 다 — 1px 을 손가락으로 집을 수 없다.
   *
   * 선은 한 겹이고 뒤에 깔린 것의 밝기를 뒤집어 칠한다 — 어두운 사진에서는 밝게,
   * 밝은 사진과 사진 밖 흰 지면에서는 어둡게 선다. `grayscale` 을 같이 거는 이유는
   * 뒤집기만 하면 선이 보색으로 물들어서다.
   *
   * 데모와 고른 사진 두 갈래가 같은 것을 쓴다.
   */
  const handle = (
    <div
      role="slider"
      tabIndex={0}
      aria-label="원본과 적용본의 경계"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(split)}
      aria-valuetext={`왼쪽 ${Math.round(split)}퍼센트가 원본`}
      onPointerDown={onHandleDown}
      onPointerMove={onHandleMove}
      onPointerUp={onHandleUp}
      onPointerCancel={onHandleUp}
      onKeyDown={onHandleKey}
      style={{ left: `${split}%` }}
      className={`absolute -top-4 -bottom-4 z-10 w-8 -translate-x-1/2 cursor-ew-resize touch-none focus-visible:outline-none ${
        intro ? "pointer-events-none" : ""
      }`}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 opacity-60 backdrop-grayscale backdrop-invert"
      />
    </div>
  );

  return (
    <>
      <div ref={frame} className="relative min-h-0 flex-1 bg-muted">
        {photo ? (
          <>
            <Image
              src={photo}
              alt="고른 사진의 원본"
              fill
              sizes="430px"
              unoptimized
              className="object-cover"
            />
            <div
              className="absolute inset-0"
              style={{ clipPath: `inset(0 0 0 ${split}%)` }}
            >
              <canvas
                ref={canvas}
                aria-label={`${preset.name} 색을 입힌 같은 사진`}
                className="size-full object-cover"
              />
            </div>
            {handle}
          </>
        ) : (
          <>
            <Image
              key={`${preset.stem}-before`}
              src={`/demo/${preset.stem}-before.webp`}
              alt={`${preset.mood} 원본 사진`}
              fill
              sizes="430px"
              priority
              className="object-cover"
            />
            <div
              className="absolute inset-0"
              style={{ clipPath: `inset(0 0 0 ${split}%)` }}
            >
              <Image
                key={`${preset.stem}-after`}
                src={`/demo/${preset.stem}-after.webp`}
                alt={`${preset.name} 색을 입힌 같은 사진`}
                fill
                sizes="430px"
                priority
                className="object-cover"
              />
            </div>

            {handle}
          </>
        )}
      </div>

      <div className="shrink-0 px-5 pt-4 pb-4">
        <h1 className="font-serif text-[26px] leading-none tracking-tight">
          {preset.name}
        </h1>
        <p className="mt-2 text-[13px] text-muted-foreground">{preset.mood}</p>
      </div>

      {/* 미는 것과 고르는 것은 별개다. 밀어도 사진은 바뀌지 않고, 눌러야 바뀐다.
          `freeMode` 라서 칸에 달라붙지 않고 민 만큼 굴러간다. 민 뒤에 따라오는 click 은
          Swiper 의 `preventClicks` 가 막아 주므로 여기서 따로 삼키지 않는다.

          좌우 여백을 `slidesOffsetBefore/After` 로 주는 이유는 `.swiper` 가
          `overflow: hidden` 이라 padding 으로 준 여백에는 칸이 그대로 보여서다.
          위아래 padding 은 반대로 필요하다 — 없으면 고른 칸의 링이 잘린다. */}
      <Swiper
        modules={[FreeMode]}
        freeMode
        grabCursor
        slidesPerView="auto"
        spaceBetween={16}
        slidesOffsetBefore={20}
        slidesOffsetAfter={20}
        className="w-full shrink-0 !py-1.5"
      >
        {PRESETS.map((p, i) => (
          <SwiperSlide key={p.stem} style={{ width: 56 }}>
            <button
              type="button"
              aria-label={p.name}
              aria-pressed={i === active}
              onClick={() => {
                setActive(i);
                setFrameName("");
                setFrameMood("");
                sweep(120);
              }}
              className="block focus-visible:outline-none"
            >
              <span
                className={`block overflow-hidden rounded-full ring-offset-2 ring-offset-background transition-[box-shadow] duration-200 ${
                  i === active ? "ring-2 ring-foreground" : "ring-0"
                }`}
              >
                <Image
                  src={`/demo/${p.stem}-thumb.webp`}
                  alt=""
                  width={176}
                  height={176}
                  sizes="56px"
                  draggable={false}
                  className="size-14 object-cover"
                />
              </span>
            </button>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="shrink-0 px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        {/* 읽기만 한다. `blob:` 주소를 만들어 화면에 띄울 뿐 어디로도 보내지 않는다 */}
        <input
          ref={file}
          type="file"
          accept="image/*"
          onChange={onPick}
          className="hidden"
        />
        {/* 사진이 있으면 받기가 앞에 선다. 고르는 것은 이미 한 일이다 */}
        {photo && (
          <Button
            type="button"
            onClick={() => download("photo")}
            disabled={saving !== null}
            className="mb-2 h-12 w-full text-[15px]"
          >
            {saving === "photo" ? "만드는 중" : "받기"}
          </Button>
        )}
        <div className="flex gap-2">
          {/* 높이만 덮는다. 기본 h-10(40px)은 모바일 최소 터치 영역 44px 에 못 미친다 */}
          <Button
            type="button"
            variant={photo ? "outline" : "default"}
            onClick={() => file.current?.click()}
            className="h-12 flex-1 text-[15px]"
          >
            {photo ? "다른 사진" : "사진 고르기"}
          </Button>
          <Dialog open={frameOpen} onOpenChange={setFrameOpen}>
            <DialogTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 text-[15px]"
                >
                  프레임 보기
                </Button>
              }
            />
            <DialogContent className="flex h-dvh w-screen max-w-screen flex-col rounded-none p-0 sm:max-w-screen">
              <DialogTitle className="sr-only">
                {preset.name} 프레임 완성본
              </DialogTitle>
              {frameError ? (
                <p className="p-4 text-[13px] text-muted-foreground">
                  {frameError}
                </p>
              ) : (
                <>
                  {/* 값 스트립을 가리지 않게 세로로 나눈다. 겹쳐 놓으면
                      이 제품이 파는 것(실제 적용값)이 손에 가린다 */}
                  <div className="flex min-h-0 flex-1 items-center justify-center px-3 pt-10">
                    <canvas
                      ref={setFramed}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div className="flex shrink-0 justify-center gap-2 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                    <Dialog open={editOpen} onOpenChange={setEditOpen}>
                      <DialogTrigger
                        render={
                          <Button
                            type="button"
                            variant="outline"
                            className="px-4"
                          >
                            편집
                          </Button>
                        }
                      />
                      <DialogContent className="grid gap-3 p-5">
                        <DialogTitle className="text-[15px] font-medium">
                          프레임에 찍을 글자
                        </DialogTitle>
                        <label className="grid gap-1.5">
                          <span className="text-[13px] text-muted-foreground">
                            이름
                          </span>
                          <Input
                            value={frameName}
                            onChange={(e) => setFrameName(e.target.value)}
                            placeholder={FRAME_LABELS[preset.stem].city}
                            maxLength={24}
                            autoFocus
                          />
                        </label>
                        <label className="grid gap-1.5">
                          <span className="text-[13px] text-muted-foreground">
                            설명
                          </span>
                          <Input
                            value={frameMood}
                            onChange={(e) => setFrameMood(e.target.value)}
                            placeholder={FRAME_LABELS[preset.stem].mood}
                            maxLength={32}
                          />
                        </label>
                        <div className="mt-1 flex gap-2">
                          {/* 비우면 프리셋의 글자로 돌아간다 */}
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setFrameName("");
                              setFrameMood("");
                            }}
                            className="flex-1"
                          >
                            되돌리기
                          </Button>
                          <Button
                            type="button"
                            onClick={() => setEditOpen(false)}
                            className="flex-1"
                          >
                            완료
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    {photo && (
                      <Button
                        type="button"
                        onClick={() => download("frame")}
                        disabled={saving !== null}
                        className="h-10 px-6 text-[15px]"
                      >
                        {saving === "frame" ? "만드는 중" : "받기"}
                      </Button>
                    )}
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </>
  );
}

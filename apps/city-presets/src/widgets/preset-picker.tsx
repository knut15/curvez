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

import { Button } from "@scopulus/ui";

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

  return (
    <>
      <div ref={frame} className="relative min-h-0 flex-1 bg-muted">
        {photo ? (
          // 고른 사진은 아직 색이 걸리지 않는다. 값을 셰이더로 옮기는 일이
          // 끝나야 오른쪽 절반에 보여 줄 것이 생긴다 — `docs/GOAL.md` 빌드 순서 1~5번.
          <Image
            src={photo}
            alt="고른 사진"
            fill
            sizes="430px"
            unoptimized
            className="object-cover"
          />
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

            {/* 이음매이자 손잡이다. 좌우로 끌면 원본과 적용본의 경계가 따라 움직인다.
              보이는 것은 1px 선이지만 잡는 자리는 32px 다 — 1px 을 손가락으로 집을 수 없다.

              선은 한 겹이고 뒤에 깔린 것의 밝기를 뒤집어 칠한다 — 어두운 사진에서는 밝게,
              밝은 사진과 사진 밖 흰 지면에서는 어둡게 선다. `grayscale` 을 같이 거는 이유는
              뒤집기만 하면 선이 보색으로 물들어서다. */}
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
        {/* 높이만 덮는다. 기본 h-10(40px)은 모바일 최소 터치 영역 44px 에 못 미친다 */}
        <Button
          type="button"
          onClick={() => file.current?.click()}
          className="h-12 w-full text-[15px]"
        >
          {photo ? "다른 사진 고르기" : "사진 고르기"}
        </Button>
      </div>
    </>
  );
}

"use client";

import Image from "next/image";
import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { FreeMode } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

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
  const [split, setSplit] = useState(50);
  const frame = useRef<HTMLDivElement>(null);
  const sliding = useRef(false);
  const preset = PRESETS[active];

  /** 손끝의 가로 위치를 사진 안에서의 비율로 바꾼다 */
  function moveTo(clientX: number) {
    const el = frame.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setSplit(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)));
  }

  function onHandleDown(e: PointerEvent<HTMLDivElement>) {
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
          className="absolute -top-4 -bottom-4 z-10 w-8 -translate-x-1/2 cursor-ew-resize touch-none focus-visible:outline-none"
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 opacity-60 backdrop-grayscale backdrop-invert"
          />
        </div>
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
              onClick={() => setActive(i)}
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
    </>
  );
}

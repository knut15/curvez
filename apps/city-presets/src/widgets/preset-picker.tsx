"use client";

import Image from "next/image";
import { useRef, useState, type PointerEvent } from "react";

import { PRESETS } from "@/shared/presets";

/**
 * 사진을 고르기 전 화면의 본체. 도시를 누르면 뷰어가 그 색으로 바뀐다.
 *
 * 사진을 넣은 뒤에도 조작은 이것과 같다 — 뷰어 하나와 도시 줄 하나. 시작 전에는
 * 데모 사진이 그 자리에 들어가 있을 뿐이다. 같은 구조를 두 번 쓰는 이유는
 * 사진을 넣기 전에 조작법이 이미 눈에 익게 하기 위해서다.
 */
export function PresetPicker() {
  const [active, setActive] = useState(0);
  const strip = useRef<HTMLDivElement>(null);
  const preset = PRESETS[active];

  const drag = useRef<{
    x: number;
    left: number;
    moved: boolean;
    captured: boolean;
  } | null>(null);
  const swallowClick = useRef(false);
  const [dragging, setDragging] = useState(false);

  /**
   * 마우스로도 끌 수 있게 한다. 손가락은 브라우저가 알아서 굴리므로 건드리지 않는다 —
   * 둘 다 받으면 한 번 민 것이 두 번 굴러간다.
   *
   * 미는 것과 고르는 것은 별개다. 밀어도 사진은 바뀌지 않고, 눌러야 바뀐다.
   */
  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    const el = strip.current;
    if (!el || e.pointerType !== "mouse") return;
    drag.current = {
      x: e.clientX,
      left: el.scrollLeft,
      moved: false,
      captured: false,
    };
    setDragging(true);
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    const el = strip.current;
    const d = drag.current;
    if (!el || !d) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) > 3) {
      // 여기서야 잡는다. 누르자마자 잡으면 click 이 이 컨테이너로 배달되어
      // 썸네일 버튼의 onClick 이 영영 불리지 않는다.
      d.moved = true;
      d.captured = true;
      el.setPointerCapture(e.pointerId);
    }
    if (d.moved) el.scrollLeft = d.left - dx;
  }

  function onPointerEnd(e: PointerEvent<HTMLDivElement>) {
    const el = strip.current;
    const d = drag.current;
    if (!el || !d) return;
    drag.current = null;
    setDragging(false);
    // 끌고 놓은 손끝이 버튼 위에 있으면 click 이 뒤따라 온다. 그것까지 고름으로 치면
    // 방금 민 것이 취소되므로 한 번 삼킨다.
    swallowClick.current = d.moved;
    if (d.captured) el.releasePointerCapture(e.pointerId);
  }

  return (
    <>
      <div className="relative min-h-0 flex-1 bg-muted">
        <Image
          key={`${preset.stem}-before`}
          src={`/demo/${preset.stem}-before.webp`}
          alt={`${preset.mood} 원본 사진`}
          fill
          sizes="430px"
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 [clip-path:inset(0_0_0_50%)]">
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

        {/* 이음매. 한 겹이다.
            뒤에 깔린 것의 밝기를 뒤집어 칠한다 — 어두운 사진에서는 밝게,
            밝은 사진과 사진 밖 흰 지면에서는 어둡게 선다. `grayscale` 을 같이 거는 이유는
            뒤집기만 하면 선이 보색으로 물들어서다. 선을 덧대지 않고 한 겹으로
            어디서나 보이게 하는 방법이 이것이었다. */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-4 -bottom-4 left-1/2 z-10 w-px -translate-x-1/2 opacity-60 backdrop-grayscale backdrop-invert"
        />
      </div>

      <div className="shrink-0 px-5 pt-4 pb-4">
        <h1 className="font-serif text-[26px] leading-none tracking-tight">
          {preset.name}
        </h1>
        <p className="mt-2 text-[13px] text-muted-foreground">{preset.mood}</p>
      </div>

      {/* 가운데 칸이 고른 도시다. 눌러서도, 밀어서도 고를 수 있다.
          양옆 여백을 칸 폭의 절반만큼 주어야 첫 칸과 마지막 칸도 가운데에 설 수 있다. */}
      <div
        ref={strip}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        className={`flex shrink-0 touch-pan-x gap-4 overflow-x-auto overscroll-x-contain px-5 py-1.5 select-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
          dragging ? "cursor-grabbing" : "cursor-grab"
        }`}
      >
        {PRESETS.map((p, i) => (
          <button
            key={p.stem}
            type="button"
            aria-label={p.name}
            aria-pressed={i === active}
            onClick={() => {
              if (swallowClick.current) {
                swallowClick.current = false;
                return;
              }
              setActive(i);
            }}
            className="shrink-0 focus-visible:outline-none"
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
        ))}
      </div>
    </>
  );
}

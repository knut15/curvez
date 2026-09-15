"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { ThemeToggle } from "@scopulus/ui";

type Current = "home" | "works" | "work" | "cases" | "case" | "labs" | "design";

/**
 * 모든 화면이 쓰는 단일 헤더. 홈과 서브가 같은 컴포넌트를 써야 좌우 간격이 달라지지 않는다.
 *
 * 글자는 13px · 굵기 510 이고 밑줄이 없다. 모노 대문자에 밑줄을 두던 것을 버렸다 —
 * 랜딩이 linear.app 의 형태를 따르면서 헤더만 다른 서체 체계로 남아 위아래가 갈렸다.
 * 링크는 평소 muted 이고 hover 에서 전경색으로 올라온다.
 *
 * **`title` 을 받으면 제목 바가 딸려 온다.** 상세 화면에서 큰 `<h1>` 이 화면 위로 지나가면,
 * 바가 **헤더 뒤에서 아래로 밀려 나온다.** 투명도로 나타났다 사라지게 두지 않는다 —
 * 그러면 헤더와 상관없는 별개의 띠가 허공에서 켜지는 것으로 보인다.
 *
 * 미는 방식은 이렇다. 제목 바를 `top-full` 로 헤더 바로 아래에 붙여 두고 평소에는
 * `-translate-y-full` 로 **헤더와 정확히 겹쳐 둔다.** 헤더가 불투명해서 그동안은 안 보인다.
 * 걸릴 때 `translate-y-0` 으로 내려오면 헤더 밑에서 빠져나온 것처럼 읽힌다.
 * 그래서 제목 바의 `z` 가 헤더보다 **낮아야** 한다.
 *
 * 같은 순간에 헤더 자신은 높이를 한 단 줄인다. 둘이 같은 상태를 보고 움직이므로
 * 헤더가 내주는 만큼 제목 바가 자리를 받는 것으로 보인다.
 *
 * **들어가는 쪽이 나오는 쪽보다 느리다.** 나올 때 200ms, 들어갈 때 380ms 다. 헤더의 높이
 * 전환은 양쪽 다 200ms 라, 되돌아갈 때는 헤더가 먼저 제 높이를 찾고 그 뒤로 제목 바가
 * 마저 올라간다. 같은 속도로 두면 둘이 한꺼번에 사라져 무엇이 무엇을 밀어낸 건지 안 보인다.
 *
 * 숨길 때 `100%` 가 아니라 `calc(100% + 1px)` 만큼 올린다. 제목 바도 아래에 1px 선을
 * 갖는데, 딱 100% 만 올리면 그 선이 헤더의 선과 반 픽셀 어긋나 맨 위에서 경계가 2px 로
 * 보인다. 1px 을 더 올려 헤더 선 뒤로 완전히 밀어 넣는다.
 */
const LINK =
  "inline-flex items-center py-2 text-[0.8125rem] font-[510] transition-colors duration-150 ease-out focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none";

/**
 * 메뉴 넷과 각 메뉴가 자기 자리로 치는 화면.
 *
 * **상세 화면도 목록과 같은 메뉴를 켠다.** `/cases/어떤-글` 을 보는 사람은 Cases 안에 있는
 * 것이지 아무 데도 아닌 자리에 있는 것이 아니다. 그래서 `case` 와 `cases` 가 같은 메뉴를
 * 가리킨다. 이 표가 없을 때는 목록에서만 켜지고 상세로 들어가면 꺼졌다.
 */
const NAV: readonly {
  href: string;
  label: string;
  owns: readonly Current[];
}[] = [
  { href: "/works", label: "Works", owns: ["works", "work"] },
  { href: "/cases", label: "Cases", owns: ["cases", "case"] },
  { href: "/labs", label: "Labs", owns: ["labs"] },
  { href: "/design", label: "Design", owns: ["design"] },
];

export function SiteHeader({
  current = "home",
  label,
  title,
}: {
  current?: Current;
  /** 제목 바 왼쪽의 영역 이름. `title` 과 함께 준다. */
  label?: string;
  /** 상세 화면의 글 제목. 없으면 제목 바 자체를 렌더하지 않는다. */
  title?: string;
}) {
  const barRef = useRef<HTMLElement>(null);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    if (!title) return;

    // 눈금은 상세 뷰가 제목 블록 끝에 심는다. 헤더가 그 요소를 직접 찾아 관찰하므로
    // 두 컴포넌트가 서로를 import 하지 않는다 — 붙는 자리만 `data-` 속성으로 약속한다.
    const sentinel = document.querySelector("[data-title-sentinel]");
    if (!sentinel) return;

    // 눈금이 헤더에 가려지는 순간을 "지나갔다" 로 친다. 값은 헤더 요소에서 직접 잰다 —
    // `--header-height` 를 읽으면 `rem` 문자열이 나오는데 `rootMargin` 은 px 과 % 만 받아
    // 그대로 넘기면 생성자가 던진다.
    const offset = barRef.current
      ? Math.round(barRef.current.getBoundingClientRect().height)
      : 0;

    const io = new IntersectionObserver(
      ([entry]) => setStuck(!entry.isIntersecting),
      { rootMargin: `-${offset}px 0px 0px 0px` },
    );
    io.observe(sentinel);
    return () => io.disconnect();
  }, [title]);

  return (
    <div className="sticky top-0 z-30">
      <header
        ref={barRef}
        className={`relative z-10 flex items-center justify-between gap-4 border-b border-border bg-brand-canvas px-5 text-brand-ink transition-[height] duration-200 ease-out md:px-8 motion-reduce:transition-none ${
          stuck
            ? "h-[var(--header-height-compact)]"
            : "h-[var(--header-height)]"
        }`}
      >
        <span className="flex items-baseline text-[0.9375rem] font-[510] tracking-[-0.015em]">
          <Link
            href="/"
            aria-current={current === "home" ? "page" : undefined}
            className="inline-flex items-center py-2 transition-colors duration-150 ease-out hover:text-brand-accent focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none"
          >
            aster<sup className="ml-0.5 text-[0.55em]">®</sup>
          </Link>
          {/* 375px 에서 로고+태그라인+링크 2개+토글이 한 줄에 들어가지 않는다.
              헤더는 어느 폭에서도 한 줄이어야 하므로 가장 덜 중요한 이것을 먼저 접는다. */}
          <span className="ml-3 hidden text-[0.8125rem] text-muted-foreground sm:inline">
            apps and notes
          </span>
        </span>
        <nav className="flex items-center gap-4">
          {NAV.map((item) => {
            const active = item.owns.includes(current);
            return (
              <Link
                key={item.href}
                href={item.href}
                // 켜진 메뉴를 색으로만 가르지 않는다. `aria-current` 가 같은 것을
                // 글자로 말하므로 색을 못 보는 사람에게도 전해진다.
                aria-current={active ? "page" : undefined}
                className={`${LINK} ${
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <ThemeToggle />
        </nav>
      </header>

      {title ? (
        <div
          aria-hidden
          className={`absolute inset-x-0 top-full z-0 border-b border-border bg-brand-canvas transition-transform ease-out motion-reduce:transition-none ${
            stuck
              ? "translate-y-0 duration-200"
              : "-translate-y-[calc(100%+1px)] duration-[380ms]"
          }`}
        >
          {/* 사라질 때만 글자가 흐려진다. 나올 때는 75ms 로 거의 즉시 또렷해지고,
              들어갈 때는 200ms 로 바가 위로 물러나는 동안 같이 흐려진다.
              방향마다 다른 전환을 주려고 클래스에 `duration` 을 같이 실었다. */}
          <div
            className={`mx-auto flex max-w-5xl items-baseline justify-center gap-2 px-5 py-2.5 text-[0.8125rem] transition-opacity ease-out md:px-8 motion-reduce:transition-none ${
              stuck ? "opacity-100 duration-75" : "opacity-0 duration-300"
            }`}
          >
            {label ? (
              <>
                <span className="shrink-0 font-[510] text-muted-foreground">
                  {label}
                </span>
                <span className="shrink-0 text-muted-foreground">·</span>
              </>
            ) : null}
            <span className="truncate font-[510] text-brand-ink">{title}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

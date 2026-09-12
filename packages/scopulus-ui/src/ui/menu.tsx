"use client";

import Link from "next/link";
import { cn } from "cn";

/** 한 묶음. `label` 이 없으면 소제목 없이 항목만 나온다. */
export type MenuGroup = {
  id: string;
  label?: string;
  items: { href: string; label: string }[];
};

/**
 * 세로로 선 이동 목록. 문서 화면 왼쪽에 서는 그것이다.
 *
 * 스펙은 `packages/scopulus-ui/design/components/Menu.md` 가 정본이다.
 *
 * **`<nav>` 를 내고 이름을 받는다.** 이동 목록은 랜드마크다. 한 화면에 `<nav>` 가 여럿일 때
 * 이름이 없으면 화면 낭독기가 "탐색" 만 여러 번 읽어 어느 것이 무엇인지 구별되지 않는다.
 * 그래서 `label` 이 필수다.
 *
 * **`AppLink` 를 쓰지 않는다.** 여기 항목은 스무 개가 세로로 붙어 있어 밑줄이 있으면 줄이
 * 겹쳐 보이고, `bare` 는 hover 면이 없어 어느 줄을 가리키는지 안 보인다. 목록에서는 밑줄이
 * 아니라 **면**이 그 일을 한다.
 *
 * **현재 항목을 스스로 판정하지 않는다.** `current` 를 받는다 — 라우터를 읽으면 이 라이브러리가
 * Next 의 `usePathname` 에 묶이고, 다른 라우터를 쓰는 앱에서 쓸 수 없게 된다.
 *
 * **스크롤은 `MenuScroll` 이 맡는다.** 목록 자체는 높이를 갖지 않는다 — 어디에 얼마나 붙여
 * 둘지는 화면이 정할 값이지 목록이 정할 값이 아니다.
 */
export function Menu({
  groups,
  current,
  label,
}: {
  groups: MenuGroup[];
  /** 지금 열려 있는 주소. 정확히 같은 항목에 `aria-current="page"` 가 붙는다. */
  current?: string;
  /** `<nav>` 의 이름. 한 화면에 랜드마크가 여럿일 때 서로 구별하는 값이다. */
  label: string;
}) {
  return (
    <nav aria-label={label} className="space-y-5">
      {groups.map((g) => (
        <div key={g.id}>
          {g.label ? (
            <p className="px-2 text-xs font-bold tracking-wider text-muted-foreground uppercase">
              {g.label}
            </p>
          ) : null}
          <ul role="list" className={cn(g.label && "mt-1.5")}>
            {g.items.map((item) => {
              const active = item.href === current;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "block rounded-md px-2 py-1 text-sm",
                      "transition-colors duration-150 ease-out motion-reduce:transition-none",
                      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                      active
                        ? "bg-accent font-medium text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

/**
 * `Menu` 를 담아 화면 옆에 고정하고 자기 안에서만 스크롤하게 한다.
 *
 * **시작 위치와 붙는 위치가 같다.** `-mt-16` 이 바깥 컨테이너의 위 여백을 지워 목록을 헤더
 * 바로 아래(64px)에서 시작하게 하고, `top-16` 이 같은 자리에 붙인다. 둘이 같으므로 스크롤 0
 * 부터 한 번도 움직이지 않는다. 값이 어긋나면 목록이 그 차이만큼 페이지를 따라 올라간다.
 *
 * **`pt-16` 은 지운 위 여백을 안쪽에서 되돌린 것이다.** `-mt-16` 이 상자를 64px 끌어올렸으므로
 * 같은 값을 안쪽 여백으로 넣어야 목록 첫 줄과 본문 첫 줄이 같은 높이에서 시작한다.
 * 세 값이 한 벌이다 — `top-16` · `-mt-16` · `pt-16`. 하나만 고치지 마라.
 *
 * **헤더 높이 64px 에 묶여 있다.** 헤더를 고치면 이 셋도 같이 고친다.
 *
 * **`w-52` 는 고정이다.** 폭을 두지 않으면 열이 가장 긴 항목만큼 벌어져, 항목을 하나 더할
 * 때마다 본문 시작 위치가 움직인다. 긴 이름은 이 폭 안에서 줄을 바꾼다.
 *
 * 스크롤바는 `scrollbar-color` 한 줄로 그린다. `::-webkit-scrollbar` 를 쓰지 않는다 —
 * 그것은 표준이 아니고 Firefox 에서 아무 일도 하지 않는다. thumb 은 `--muted-foreground` 의
 * 35%, track 은 투명이다.
 */
export function MenuScroll({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "sticky top-16 -mt-16 h-[calc(100vh-4rem)] w-52 shrink-0 self-start overflow-y-auto pt-16 pb-8",
        "[scrollbar-color:color-mix(in_oklch,var(--muted-foreground)_35%,transparent)_transparent]",
      )}
    >
      {children}
    </div>
  );
}

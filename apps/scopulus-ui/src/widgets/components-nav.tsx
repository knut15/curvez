"use client";

import { usePathname } from "next/navigation";
import { Menu, MenuScroll, type MenuGroup } from "@scopulus/ui";

/**
 * 컴포넌트 화면 왼쪽 목록.
 *
 * **목록을 손으로 그리지 않는다.** 라이브러리의 `Menu` 와 `MenuScroll` 을 그대로 쓴다 —
 * 문서 화면(`docs-nav.tsx`)과 같은 모양이어야 하고, 두 곳에서 각자 그리면 한쪽만 고쳐진다.
 *
 * 레이아웃 안에 있어야 라우트를 옮겨도 다시 마운트되지 않는다. 현재 항목은 그래서
 * `props` 가 아니라 `usePathname` 으로 읽는다 — 레이아웃은 `[slug]` 를 받지 못한다.
 *
 * `groups` 는 레이아웃(서버)이 읽어 넘긴다. 클라이언트에서 원고 파일을 읽을 수 없다.
 */
export function ComponentsNav({ groups }: { groups: MenuGroup[] }) {
  const pathname = usePathname();

  return (
    <MenuScroll>
      <p className="px-2 text-sm font-medium">Components</p>
      <div className="mt-4">
        <Menu label="컴포넌트" groups={groups} current={pathname} />
      </div>
    </MenuScroll>
  );
}

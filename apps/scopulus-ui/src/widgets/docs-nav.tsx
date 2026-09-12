"use client";

import { usePathname } from "next/navigation";
import { Menu, MenuScroll, type MenuGroup } from "@scopulus/ui";

/**
 * 문서 화면 왼쪽 목록. `/docs/*` 와 `/changelog` 가 같이 쓴다.
 *
 * **목록을 손으로 그리지 않는다.** 라이브러리의 `Menu` 와 `MenuScroll` 을 그대로 쓴다 —
 * 컴포넌트 화면과 같은 모양이어야 하고, 두 곳에서 각자 그리면 한쪽만 고쳐진다.
 *
 * 레이아웃 안에 있어야 라우트를 옮겨도 다시 마운트되지 않는다. 현재 항목은 그래서
 * `props` 가 아니라 `usePathname` 으로 읽는다 — 레이아웃은 `[slug]` 를 받지 못한다.
 *
 * 항목은 여기서 정한다. 원고 파일을 훑어 만들지 않는다 — 순서가 파일 이름에 묶이고,
 * 문서는 읽는 순서가 있다.
 */
const GROUPS: MenuGroup[] = [
  {
    id: "start",
    label: "Get started",
    items: [
      { href: "/docs/getting-started", label: "Installation" },
      { href: "/docs/tokens", label: "Tokens" },
    ],
  },
  {
    id: "release",
    label: "Release",
    items: [{ href: "/changelog", label: "Changelog" }],
  },
];

export function DocsNav() {
  const pathname = usePathname();

  return (
    <MenuScroll>
      <p className="px-2 text-sm font-medium">Docs</p>
      <div className="mt-4">
        <Menu label="문서" groups={GROUPS} current={pathname} />
      </div>
    </MenuScroll>
  );
}

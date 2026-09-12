import Link from "next/link";
import { cn } from "cn";

/**
 * 지금 있는 자리까지의 경로 한 줄. 위 계층으로 돌아가는 길을 연다.
 *
 * 스펙은 `packages/scopulus-ui/design/components/Breadcrumbs.md` 가 정본이다.
 *
 * **`"use client"` 가 없다.** 훅도 이벤트도 쓰지 않는다. `next/link` 는 서버 컴포넌트 안에서
 * 그대로 렌더된다 — 클라이언트 경계를 만드는 것은 훅과 핸들러이지 `Link` 가 아니다.
 *
 * **마지막 항목은 링크가 아니다.** `<span aria-current="page">` 로 낸다. 지금 있는 자리를
 * 가리키는 링크는 눌러도 같은 화면이라 이동이 일어나지 않고, 키보드 사용자에게는 아무 일도
 * 하지 않는 탭 정거장만 하나 는다.
 *
 * **구분자는 장식이라 `aria-hidden` 이다.** 그리고 `<li>` 안에 넣는다 — `<ol>` 의 자식으로
 * 따로 세우면 목록 개수가 두 배로 읽힌다("목록, 항목 5개" 인데 경로는 셋이다).
 *
 * **`AppLink` 를 쓰지 않는다.** `inline` 은 밑줄이 붙어 한 줄에 서넛이 늘어서면 구분자와
 * 밑줄이 겹쳐 보이고, `bare` 는 `current` 를 받아도 언제나 `<a>` 를 낸다 — 마지막 항목이
 * 링크가 아니어야 하는 이 컴포넌트가 쓸 수 없다.
 *
 * **접기(`…`)를 넣지 않는다.** 항목이 많으면 접어야 한다는 판단은 화면이 하는 것이고,
 * 여기서 접으면 접힌 항목을 여는 상태가 생겨 이 컴포넌트가 상태를 갖게 된다.
 * 긴 경로는 `flex-wrap` 으로 줄을 바꾼다.
 */
export function Breadcrumbs({
  items,
  label = "현재 위치",
}: {
  /**
   * 앞에서 뒤로 늘어놓은 경로. **마지막 항목이 지금 있는 자리다.**
   * `href` 가 없으면 링크 없이 글자만 나온다 — 색인 페이지가 없는 중간 계층이 그렇다.
   * 마지막 항목의 `href` 는 쓰이지 않는다.
   */
  items: { label: string; href?: string }[];
  /** `<nav>` 의 이름. 한 화면에 랜드마크가 여럿일 때 서로 구별하는 값이다. */
  label?: string;
}) {
  return (
    <nav aria-label={label}>
      {/* `role="list"` 는 Safari 대비다. Tailwind preflight 가 `list-style:none` 을 걸어
          목록 의미가 떨어지는 조건에 들어간다. `components-nav.tsx` 도 같은 이유로 붙였다. */}
      <ol
        role="list"
        className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-muted-foreground"
      >
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li
              key={`${i}-${item.label}`}
              className="flex items-center gap-x-1.5"
            >
              {i > 0 ? (
                // 구분자는 앞 항목과 이 항목 사이의 장식이다. 순서는 `<ol>` 이 이미 말한다.
                <span aria-hidden className="select-none">
                  /
                </span>
              ) : null}

              {last || !item.href ? (
                <span
                  aria-current={last ? "page" : undefined}
                  className={cn(last && "font-medium text-foreground")}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    "transition-colors duration-150 ease-out hover:text-ring motion-reduce:transition-none",
                    // 자기 반경이 없어 `rounded-sm` 이 없으면 포커스 링이 직각으로 그려진다.
                    "focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  )}
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

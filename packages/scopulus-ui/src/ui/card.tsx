import Link from "next/link";

/**
 * 목록 항목 하나를 담는 면. 면 전체가 상세로 가는 링크 하나다.
 *
 * 스펙은 `packages/scopulus-ui/design/components/Card.md` 가 정본이다.
 *
 * **면만 갖는다. 안에 무엇이 들어가는지는 모른다.** `CaseCard` 와 `LabCard` 가 이것 위에
 * 올라간다. 두 카드가 다루는 데이터가 달라(케이스는 role, 기록은 status) 면과 내용을 한
 * 컴포넌트에 묶으면 세 번째 목록이 생길 때 면을 다시 복사하게 된다.
 *
 * `onClick` 을 받지 않는다 — `<button>` 이나 `<div onClick>` 으로 만들면 새 탭 열기와
 * 주소 복사가 막힌다. hover 에 `shadow-*` 를 붙이지 않는다 — 이 사이트는 고도를 쓰지 않는다.
 */
export function Card({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col gap-2 rounded-lg border border-border bg-card p-5 transition-colors duration-150 ease-out hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none"
    >
      {children}
    </Link>
  );
}

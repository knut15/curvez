import Link from "next/link";
import { cn } from "cn";

/**
 * 주소를 바꾸는 이동 하나. hover 와 focus 를 `--ring` 한 색으로 모은다.
 *
 * 스펙은 `packages/scopulus-ui/design/components/AppLink.md` 가 정본이다.
 *
 * **자기 색을 갖지 않는다.** fg 는 부모에게서 상속한다 — 본문에서는 `--foreground`, 메타 줄에서는
 * `--muted-foreground`, 앱이 브랜드 색을 깐 자리에서는 그 색이다. 링크 색을 하나로 고정하면
 * 메타 줄에서 링크만 튀어 그 줄이 두 무게로 읽힌다. 링크임을 알리는 것은 색이 아니라 밑줄과 hover 다.
 *
 * **hover 는 `--ring` 이다. `--brand-accent` 가 아니다.** 그 토큰은 앱이 소유하므로 라이브러리가
 * 쓰면 앱 밖에서 아무 색도 안 나오고, Tailwind 가 없는 토큰의 클래스를 만들지 않아 조용히 깨진다.
 * `--ring` 은 라이브러리 토큰이고 handwork 에서 `--brand-accent` 와 값이 같다.
 *
 * 주소가 바뀌지 않는 동작에는 이것을 쓰지 마라. 그것은 `Button` 이다.
 */
export function AppLink({
  href,
  children,
  variant = "inline",
  current = false,
}: {
  href: string;
  children: React.ReactNode;
  /** `inline`=글 안에 섞여 밑줄이 필요한 자리 / `bare`=위치로 이미 구분되는 자리 */
  variant?: "inline" | "bare";
  current?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={current ? "page" : undefined}
      className={cn(
        "transition-colors duration-150 ease-out hover:text-ring motion-reduce:transition-none",
        // 인라인 링크는 자기 반경이 없어 rounded-sm 이 없으면 포커스 링이 직각으로 그려진다.
        "focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        variant === "inline" && "underline underline-offset-4",
      )}
    >
      {children}
    </Link>
  );
}

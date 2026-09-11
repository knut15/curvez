import { cn } from "cn";

/**
 * 화면 제목 h1 과 그 아래 설명 문단을 한 벌로 낸다. 한 화면에 하나만 둔다.
 *
 * 스펙은 `packages/scopulus-ui/design/components/PageTitle.md` 가 정본이다.
 *
 * `level` 을 받지 않는다 — 항상 `<h1>` 이다. 레벨을 고를 수 있게 하면 h1 이 둘이거나
 * 없는 화면이 생기고, 그것은 스크린리더의 문서 개요를 망가뜨린다. h2·h3 는 본문 안에
 * 있고 `Prose` 가 맡는다.
 */
export function PageTitle({
  children,
  description,
  variant = "index",
}: {
  children: string;
  description?: React.ReactNode;
  /** `index`=목록·오류 화면 / `detail`=상세 화면. 제목이 두 줄 이상이 되는 쪽만 갈린다. */
  variant?: "index" | "detail";
}) {
  return (
    <>
      <h1
        className={cn(
          "text-4xl font-bold tracking-[-0.02em]",
          // 상세 제목은 MDX 에서 오는 문장이라 두 줄 이상이 된다. 한글 어절을 끊지 않는다.
          variant === "detail" && "leading-[1.15] break-keep",
        )}
      >
        {children}
      </h1>
      {description ? (
        <p className="mt-3 max-w-[65ch] leading-relaxed break-keep text-muted-foreground">
          {description}
        </p>
      ) : null}
    </>
  );
}

import { PageCard } from "@/entities/page/ui/page-card";
import type { PageSummary } from "@/entities/page/model/types";
import { PageLede } from "@/shared/ui/page-lede";

/**
 * 전용 화면이 없는 메뉴의 목록.
 *
 * Works 의 섹션 그룹핑이나 Cases 의 카드/행 토글 같은 장치는 없다 — 그것들은
 * 그 메뉴에 무엇이 쌓였는지 알고 나서 붙인 것이다. 새 메뉴는 글이 모이면
 * 그때 자기 화면을 갖는다.
 */
export function PageIndexView({
  label,
  items,
  collection,
}: {
  label: string;
  items: PageSummary[];
  collection: string;
}) {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10 md:px-8 md:py-16">
      <h1 className="text-4xl font-bold tracking-[-0.02em]">{label}</h1>
      <PageLede>{`${label} 에 쌓인 글입니다.`}</PageLede>

      {items.length === 0 ? (
        <p className="mt-10 rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          아직 글이 없습니다.
        </p>
      ) : (
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <li key={item.slug} className="flex">
              <PageCard collection={collection} item={item} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

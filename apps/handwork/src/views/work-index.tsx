import Link from "next/link";

import { WorkCard } from "@/entities/work/ui/work-card";
import type { WorkSummary } from "@/entities/work/model/types";
import { PageLede } from "@/shared/ui/page-lede";

/**
 * 세 묶음으로 나눈다 — 사람이 열어서 쓰는 것, 그것을 만들려고 만든 것, 만들기 전에
 * 한 번 그려 본 것.
 *
 * 마흔 건 가까이를 한 줄로 늘어놓으면 앱과 도구와 스케치가 섞여 무엇이 결과물인지
 * 보이지 않는다. 묶음 이름 아래에 한 줄로 기준을 밝혀 둔다.
 */
function Group({
  label,
  lead,
  items,
}: {
  label: string;
  lead: string;
  items: WorkSummary[];
}) {
  if (items.length === 0) return null;

  return (
    <section className="mt-14 first:mt-10">
      <div className="flex items-baseline gap-3">
        <h2 className="text-[0.9375rem] font-bold tracking-[0.08em] text-foreground uppercase">
          {label}
        </h2>
        <span className="text-[0.8125rem] text-muted-foreground">{lead}</span>
        <span className="ml-auto text-[0.8125rem] text-muted-foreground tabular-nums">
          {items.length}
        </span>
      </div>

      {/* 네 열까지 간다. 카드가 좁아지지만 작업 목록은 한눈에 몇 건인지 보이는 쪽이 낫다. */}
      <ul
        role="list"
        className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4"
      >
        {items.map((item) => (
          <li key={item.slug}>
            <WorkCard item={item} />
          </li>
        ))}
      </ul>
    </section>
  );
}

export function WorkIndexView({ works }: { works: WorkSummary[] }) {
  const products = works.filter((w) => w.group === "product");
  const tools = works.filter((w) => w.group === "tool");
  const ideas = works.filter((w) => w.group === "idea");

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10 md:px-8 md:py-16">
      <h1 className="text-4xl font-bold tracking-[-0.02em]">Works</h1>
      <PageLede className="max-w-[62ch]">
        직접 만든 앱과 도구를 모았습니다. 무엇을 만들었고 어떤 제약이 있었는지
        적습니다. 지금 어디까지 왔는지도 함께 남깁니다.
      </PageLede>

      {works.length === 0 ? (
        <div className="mt-8 border-t border-border pt-8 text-muted-foreground">
          아직 공개한 작업이 없습니다.{" "}
          <Link
            href="/"
            className="underline underline-offset-4 transition-colors duration-150 ease-out hover:text-brand-accent focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none"
          >
            홈으로
          </Link>
        </div>
      ) : (
        <>
          <Group
            label="Products"
            lead="사람이 열어서 쓰는 것"
            items={products}
          />
          <Group label="Tools" lead="그것을 만들려고 만든 것" items={tools} />
          <Group
            label="Ideas"
            lead="만들기 전에 한 번 그려 본 것"
            items={ideas}
          />
        </>
      )}
    </main>
  );
}

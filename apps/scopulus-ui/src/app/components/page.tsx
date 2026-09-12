import Link from "next/link";

import { ComponentPreview } from "@/widgets/component-preview";
import { CATEGORIES, listComponents } from "@/shared/lib/components";

export const metadata = {
  title: "Components — ScopulusUI",
  description: "컴포넌트 목록. 묶음별로 싣는다.",
};

export default async function ComponentsPage() {
  const items = await listComponents();

  return (
    <>
      <h1 className="text-4xl font-bold tracking-[-0.02em]">
        All ScopulusUI components
      </h1>
      {CATEGORIES.map((cat) => {
        const inCat = items.filter((i) => i.category === cat.id);
        if (inCat.length === 0) return null;
        return (
          <section key={cat.id} className="mt-12 scroll-mt-24" id={cat.id}>
            <h2 className="text-base font-bold tracking-wider text-muted-foreground uppercase">
              {cat.label}
            </h2>
            <ul
              role="list"
              className="mt-4 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3"
            >
              {inCat.map((item) => (
                <li key={item.slug}>
                  {/* 면 전체가 링크 하나다. 카드 안에 두 번째 초점을 두지 않는다. */}
                  <Link
                    href={`/components/${item.slug}`}
                    className="group block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    <ComponentPreview slug={item.slug} />
                    <span className="mt-3 block font-medium group-hover:text-ring">
                      {item.name}
                    </span>
                    <span className="mt-1 block text-sm leading-relaxed break-keep text-muted-foreground">
                      {item.summary}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </>
  );
}

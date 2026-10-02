"use client";

// 스펙: .curvez/design/preemie-calc/components/Skeleton.md
export type SkeletonProps = {
  shape: "text" | "card";
  lines?: number;
};

export function Skeleton({ shape, lines = 1 }: SkeletonProps) {
  const block = (key: number) => (
    <div
      key={key}
      aria-hidden="true"
      style={{
        height: shape === "card" ? "100%" : 20,
        minHeight: shape === "card" ? 96 : 20,
        borderRadius: "var(--radius-md)",
        background: "var(--color-border-subtle)",
        animation: "preemie-pulse var(--motion-duration-base) ease-in-out infinite alternate",
      }}
    />
  );

  return (
    <div
      aria-busy="true"
      style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}
    >
      <span role="status" aria-live="polite" className="sr-only">
        불러오는 중
      </span>
      {Array.from({ length: shape === "text" ? lines : 1 }, (_, i) => block(i))}
    </div>
  );
}

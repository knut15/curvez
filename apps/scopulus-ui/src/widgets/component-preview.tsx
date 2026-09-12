/**
 * 목록 카드 안에 들어가는 컴포넌트 미리보기.
 *
 * **실제 컴포넌트를 렌더하지 않는다. 단순화한 도형을 그린다.** 세 가지 이유다.
 *
 * 1. `PageTitle` 은 `<h1>` 을 낸다. 목록에 스무 개를 놓으면 한 화면에 `h1` 이 스물한 개가 되고
 *    문서 개요가 망가진다
 * 2. `Dialog` · `Popover` · `Tooltip` · `Select` 는 트리거와 포털이 있어야 보인다.
 *    목록에서 열어 둘 수 없다
 * 3. `PageShell` 은 `<main>` 이다. 목록 화면의 `<main>` 안에 또 들어갈 수 없다
 *
 * 그래서 도형은 **무엇처럼 생겼는지**만 말한다. 진짜 값은 상세 화면과 스토리북이 보여 준다.
 * 색은 전부 토큰이라 라이트와 다크가 같이 따라온다.
 */

/** 글줄 자리. `w` 는 Tailwind 폭 클래스를 그대로 받는다. */
function Line({ w = "w-full", dim = true }: { w?: string; dim?: boolean }) {
  return (
    <span
      className={`block h-1.5 rounded-full ${w} ${dim ? "bg-muted-foreground/25" : "bg-muted-foreground/55"}`}
    />
  );
}

/** 미리보기 안에서 면 하나. 카드·모달·입력처럼 테두리를 갖는 것들이 쓴다. */
function Panel({
  children,
  className = "",
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`flex flex-col justify-center gap-1.5 rounded-md border border-border bg-background p-2 ${className}`}
    >
      {children}
    </span>
  );
}

const PREVIEW: Record<string, React.ReactNode> = {
  button: (
    <span className="flex items-center gap-2">
      <span className="h-7 w-20 rounded-md bg-primary" />
      <span className="h-7 w-16 rounded-md border border-border" />
    </span>
  ),
  "theme-toggle": (
    <span className="flex size-9 items-center justify-center rounded-md border border-border">
      <span className="size-3.5 rounded-full border-2 border-muted-foreground/60" />
    </span>
  ),
  "app-link": (
    <span className="flex flex-col items-center gap-1">
      <span className="h-1.5 w-24 rounded-full bg-muted-foreground/55" />
      <span className="h-px w-24 bg-ring" />
    </span>
  ),

  badge: (
    <span className="flex items-center gap-1.5">
      <span className="h-5 w-12 rounded-full bg-muted" />
      <span className="flex h-5 w-16 items-center gap-1 rounded-full bg-muted px-1.5">
        <span className="size-1.5 rounded-full bg-ring" />
        <span className="h-1 w-8 rounded-full bg-muted-foreground/40" />
      </span>
    </span>
  ),
  card: (
    <Panel className="h-20 w-40 !justify-start">
      <Line w="w-20" dim={false} />
      <Line w="w-28" />
      <Line w="w-24" />
    </Panel>
  ),
  table: (
    <span className="flex w-40 flex-col gap-1.5">
      <span className="flex gap-1.5">
        <Line w="w-10" dim={false} />
        <Line w="w-14" dim={false} />
        <Line w="w-8" dim={false} />
      </span>
      <span className="h-px w-full bg-border" />
      {[0, 1, 2].map((i) => (
        <span key={i} className="flex gap-1.5">
          <Line w="w-10" />
          <Line w="w-14" />
          <Line w="w-8" />
        </span>
      ))}
    </span>
  ),
  tooltip: (
    <span className="flex flex-col items-center gap-1">
      <span className="h-6 w-20 rounded-md bg-foreground/85" />
      <span className="size-1.5 rotate-45 bg-foreground/85" />
      <span className="mt-0.5 size-7 rounded-md border border-border" />
    </span>
  ),
  prose: (
    <span className="flex w-36 flex-col gap-1.5">
      <Line w="w-20" dim={false} />
      <Line />
      <Line />
      <Line w="w-28" />
    </span>
  ),

  checkbox: (
    <span className="flex flex-col gap-2">
      {[true, false].map((on, i) => (
        <span key={i} className="flex items-center gap-2">
          <span
            className={`flex size-4 items-center justify-center rounded-sm border ${on ? "border-primary bg-primary" : "border-border"}`}
          >
            {on ? (
              <span className="size-1.5 rounded-[1px] bg-primary-foreground" />
            ) : null}
          </span>
          <Line w="w-16" />
        </span>
      ))}
    </span>
  ),
  input: (
    <Panel className="h-9 w-40 !p-2.5">
      <Line w="w-16" />
    </Panel>
  ),
  select: (
    <Panel className="h-9 w-40 !flex-row !items-center !justify-between !p-2.5">
      <Line w="w-14" />
      <span className="size-1.5 rotate-45 border-r border-b border-muted-foreground/60" />
    </Panel>
  ),
  switch: (
    <span className="flex flex-col gap-2">
      <span className="flex h-5 w-9 items-center rounded-full bg-primary p-0.5">
        <span className="ml-auto size-4 rounded-full bg-primary-foreground" />
      </span>
      <span className="flex h-5 w-9 items-center rounded-full bg-muted p-0.5">
        <span className="size-4 rounded-full bg-background" />
      </span>
    </span>
  ),
  textarea: (
    <Panel className="h-20 w-40 !justify-start !p-2.5">
      <Line w="w-28" />
      <Line w="w-20" />
      <Line w="w-24" />
    </Panel>
  ),

  "page-shell": (
    <span className="flex h-20 w-40 items-stretch gap-1 rounded-md border border-dashed border-border p-1">
      <span className="w-3 rounded-sm bg-muted" />
      <span className="flex flex-1 flex-col justify-center gap-1.5 rounded-sm bg-muted/40 px-1.5">
        <Line w="w-16" dim={false} />
        <Line />
        <Line w="w-20" />
      </span>
      <span className="w-3 rounded-sm bg-muted" />
    </span>
  ),
  "page-title": (
    <span className="flex w-36 flex-col gap-2">
      <span className="h-3 w-24 rounded-sm bg-foreground/80" />
      <Line />
      <Line w="w-24" />
    </span>
  ),
  separator: (
    <span className="flex w-36 flex-col gap-3">
      <Line w="w-24" />
      <span className="h-px w-full bg-border" />
      <Line w="w-20" />
    </span>
  ),

  alert: (
    <Panel className="w-40 !flex-row !items-start !gap-2">
      <span className="mt-0.5 size-3 shrink-0 rounded-full border-2 border-muted-foreground/60" />
      <span className="flex flex-1 flex-col gap-1.5">
        <Line w="w-14" dim={false} />
        <Line />
      </span>
    </Panel>
  ),
  skeleton: (
    <span className="flex w-36 items-center gap-2">
      <span className="size-9 shrink-0 animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
      <span className="flex flex-1 flex-col gap-1.5">
        <span className="h-2 w-full animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
        <span className="h-2 w-16 animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
      </span>
    </span>
  ),

  // ── daisyUI · shadcn 에서 옮겨 온 18종 ──────────────────────────────────
  avatar: (
    <span className="flex items-center gap-2">
      <span className="flex size-10 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
        SC
      </span>
      <span className="size-8 rounded-full bg-muted-foreground/25" />
      <span className="size-6 rounded-full bg-muted-foreground/15" />
    </span>
  ),
  kbd: (
    <span className="flex items-center gap-1.5">
      <span className="rounded-sm border border-border border-b-2 px-1.5 py-0.5 font-mono text-xs">
        ⌘
      </span>
      <span className="text-xs text-muted-foreground">+</span>
      <span className="rounded-sm border border-border border-b-2 px-1.5 py-0.5 font-mono text-xs">
        K
      </span>
    </span>
  ),
  stat: (
    <span className="flex flex-col gap-1">
      <Line w="w-10" />
      <span className="text-2xl font-bold tabular-nums">8,420</span>
      <Line w="w-16" />
    </span>
  ),
  timeline: (
    <span className="flex w-36 flex-col">
      {[0, 1, 2].map((i) => (
        <span key={i} className="flex gap-2.5">
          <span className="flex flex-col items-center">
            <span className="mt-1 size-2 shrink-0 rounded-full bg-muted-foreground/50" />
            {i < 2 ? <span className="w-px flex-1 bg-border" /> : null}
          </span>
          <span className="flex flex-col gap-1 pb-3">
            <Line w="w-10" />
            <Line w="w-20" dim={false} />
          </span>
        </span>
      ))}
    </span>
  ),

  breadcrumbs: (
    <span className="flex items-center gap-1.5">
      <Line w="w-8" />
      <span className="text-xs text-muted-foreground/50">/</span>
      <Line w="w-10" />
      <span className="text-xs text-muted-foreground/50">/</span>
      <Line w="w-12" dim={false} />
    </span>
  ),
  menu: (
    <span className="flex w-32 flex-col gap-1">
      <Line w="w-10" />
      <span className="rounded-md bg-accent px-2 py-1">
        <Line w="w-16" dim={false} />
      </span>
      <span className="px-2 py-1">
        <Line w="w-20" />
      </span>
      <span className="px-2 py-1">
        <Line w="w-14" />
      </span>
    </span>
  ),
  steps: (
    <span className="flex items-center">
      {[true, true, false].map((done, i) => (
        <span key={i} className="flex items-center">
          <span
            className={`size-5 rounded-full ${done ? "bg-primary" : "border border-border"}`}
          />
          {i < 2 ? <span className="h-px w-8 bg-border" /> : null}
        </span>
      ))}
    </span>
  ),

  radio: (
    <span className="flex flex-col gap-2">
      {[true, false].map((on, i) => (
        <span key={i} className="flex items-center gap-2">
          <span
            className={`flex size-4 items-center justify-center rounded-full border ${on ? "border-primary" : "border-border"}`}
          >
            {on ? <span className="size-2 rounded-full bg-primary" /> : null}
          </span>
          <Line w="w-16" />
        </span>
      ))}
    </span>
  ),
  range: (
    <span className="flex w-36 items-center">
      <span className="h-1 flex-1 rounded-full bg-primary" />
      <span className="size-4 rounded-full border-2 border-primary bg-background" />
      <span className="h-1 flex-[1.4] rounded-full bg-muted" />
    </span>
  ),
  label: (
    <span className="flex w-36 flex-col gap-1.5">
      <span className="flex items-center gap-1">
        <Line w="w-12" dim={false} />
        <span className="text-xs text-destructive">*</span>
      </span>
      <Panel className="h-8 !p-2" />
    </span>
  ),
  field: (
    <span className="flex w-36 flex-col gap-1.5">
      <Line w="w-12" dim={false} />
      <Panel className="h-8 !p-2" />
      <Line w="w-24" />
    </span>
  ),
  "input-group": (
    <span className="flex h-9 w-40 overflow-hidden rounded-md border border-border">
      <span className="flex items-center bg-muted px-2">
        <Line w="w-4" />
      </span>
      <span className="flex flex-1 items-center px-2">
        <Line w="w-14" />
      </span>
      <span className="flex items-center bg-muted px-2">
        <Line w="w-4" />
      </span>
    </span>
  ),

  loading: (
    <span className="size-8 rounded-full border-2 border-muted border-t-primary" />
  ),
  progress: (
    <span className="flex w-36 flex-col gap-2">
      <span className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <span className="block h-full w-[62%] rounded-full bg-primary" />
      </span>
      <span className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <span className="block h-full w-[28%] rounded-full bg-primary" />
      </span>
    </span>
  ),
  empty: (
    <span className="flex w-36 flex-col items-center gap-2">
      <span className="size-8 rounded-md border border-dashed border-border" />
      <Line w="w-16" dim={false} />
      <Line w="w-24" />
      <span className="mt-1 h-6 w-16 rounded-md border border-border" />
    </span>
  ),

  indicator: (
    <span className="relative">
      <span className="block size-14 rounded-md bg-muted" />
      <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[0.6rem] font-medium text-primary-foreground">
        9
      </span>
    </span>
  ),
  "aspect-ratio": (
    <span className="flex w-40 items-center justify-center rounded-md border border-dashed border-border bg-muted/50 py-6">
      <span className="font-mono text-xs text-muted-foreground">16 / 9</span>
    </span>
  ),
  "button-group": (
    <span className="flex">
      <span className="h-8 w-12 rounded-l-md border border-border bg-background" />
      <span className="-ml-px h-8 w-12 border border-border bg-background" />
      <span className="-ml-px h-8 w-12 rounded-r-md border border-border bg-background" />
    </span>
  ),

  dialog: (
    <span className="relative flex h-20 w-40 items-center justify-center rounded-md bg-foreground/10">
      <Panel className="w-28 shadow-sm">
        <Line w="w-14" dim={false} />
        <Line />
        <span className="mt-1 flex gap-1">
          <span className="h-4 w-8 rounded-sm bg-primary" />
          <span className="h-4 w-8 rounded-sm border border-border" />
        </span>
      </Panel>
    </span>
  ),
  popover: (
    <span className="flex flex-col items-start gap-1">
      <span className="h-6 w-14 rounded-md border border-border" />
      <Panel className="w-32 shadow-sm">
        <Line w="w-12" dim={false} />
        <Line />
        <Line w="w-20" />
      </Panel>
    </span>
  ),
};

export function ComponentPreview({ slug }: { slug: string }) {
  return (
    <span
      aria-hidden
      className="flex h-36 w-full items-center justify-center overflow-hidden rounded-lg bg-muted/50 px-4"
    >
      {PREVIEW[slug] ?? <Line w="w-20" />}
    </span>
  );
}

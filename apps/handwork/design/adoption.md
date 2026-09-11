# 적용 가이드 — 화면을 프리미티브로 바꾸는 순서

**받는 사람: `curvez-nextjs`.** 화면 코드(`apps/handwork/src/views/` · `widgets/` · `app/`)는 그 담당이
소유한다. `handwork-ui` 는 `shared/ui/` 까지만 만들고 거기를 건드리지 않았다. 이 문서가 인수인계다.

**프리미티브 9종은 이미 있다.** 이 문서는 "만들어라" 가 아니라 **"있는 것으로 화면을 어떻게 바꾸는가"** 다.

| 파일                                           | export            | props                                          |
| ---------------------------------------------- | ----------------- | ---------------------------------------------- |
| `packages/scopulus-ui/src/ui/page-shell.tsx`   | `PageShell`       | `children`                                     |
| `packages/scopulus-ui/src/ui/page-title.tsx`   | `PageTitle`       | `children` · `description?` · `variant?`       |
| `packages/scopulus-ui/src/ui/card.tsx`         | `Card`            | `href` · `children`                            |
| `packages/scopulus-ui/src/ui/badge.tsx`        | `Badge`           | `variant?` · `tone` · `children`               |
| `packages/scopulus-ui/src/ui/button.tsx`       | `Button`          | `variant?` · `size?` · `onClick` · `disabled?` |
| `packages/scopulus-ui/src/ui/app-link.tsx`     | `AppLink`         | `href` · `children` · `variant?` · `current?`  |
| `packages/scopulus-ui/src/ui/separator.tsx`    | `Separator`       | 없음                                           |
| `packages/scopulus-ui/src/ui/prose.ts`         | `Prose` + `PROSE` | `children`                                     |
| `packages/scopulus-ui/src/ui/theme-toggle.tsx` | `ThemeToggle`     | 없음                                           |

각 컴포넌트의 스펙은 [`components/`](components/) 아래에 있다. 값이 갈리면 그쪽이 정본이다.

---

## 스펙과 구현이 갈린 곳 둘 — 먼저 읽어라

### 1. `Badge` 의 `status` 가 `tone` 이 됐다

스펙은 `status: 진행 중 | 멈춤 | 마무리` 였는데 구현은 `tone: "active" | "idle"` 이다
(`packages/scopulus-ui/src/ui/badge.tsx:19`).

**이유:** `shared` 는 ARCH-001 로 `@/entities` 를 import 할 수 없다. 그 세 이름은
`apps/handwork/src/entities/lab/model/types.ts:15` 의 도메인 값이다.

**화면에 나오는 것은 스펙 그대로다** — `active` 가 `--brand-accent`, `idle` 이 `--muted-foreground`
(`packages/scopulus-ui/src/ui/badge.tsx:32` · `packages/scopulus-ui/src/ui/badge.tsx:33`).

**어느 status 가 어느 tone 인지는 부르는 쪽이 정한다.** 그 매핑을 `entities/lab` 안에 둔다.

```tsx
// apps/handwork/src/entities/lab/ui/lab-card.tsx 안. 지금 :22-24 의 삼항과 같은 판정이다.
tone={item.status === "진행 중" ? "active" : "idle"}
```

`멈춤` 과 `마무리` 가 둘 다 `idle` 인 것은 실수가 아니다. 근거는
[`components/Badge.md`](components/Badge.md) 의 점 색 표다 — 강조색이 하나라 셋을 색으로 가를 수 없고,
`멈춤`/`마무리` 의 차이는 옆 글자가 말한다.

### 2. `Prose` 가 `prose.ts` 안에 `createElement` 로 들어갔다

`packages/scopulus-ui/src/ui/prose.ts:25` 가 컴포넌트이고, `packages/scopulus-ui/src/ui/prose.ts:9` 가 문자열 `PROSE` 다.

**이유:** 같은 디렉터리에 `prose.ts` 와 `prose.tsx` 가 함께 있으면 `./prose` 가 어느
파일인지 해석되지 않는다. 그리고 문자열 `PROSE` 는 두 화면이 아직 쓰고 있어 지울 수 없다
(`apps/handwork/src/views/case-detail.tsx:4` · `apps/handwork/src/views/lab-detail.tsx:2`).

**순서가 정해져 있다. 뒤집지 마라.**

1. 두 화면을 `<Prose>` 로 옮긴다 (아래 3단계)
2. `import { PROSE }` 두 줄이 사라진 것을 `pnpm typecheck` 로 확인한다
3. **그 뒤에** `handwork-ui` 가 `packages/scopulus-ui/src/ui/prose.ts:9-10` 의 문자열을 지우고 파일을 `prose.tsx` 로 바꾼다

3번은 `shared/ui/` 라 `curvez-nextjs` 의 소유가 아니다. 2번까지 끝내고 넘긴다.

---

## 순서와 그 이유

**값이 바뀌지 않는 넷을 먼저 하고, 바뀌는 셋을 나중에 한다.**

**이유:** 순수 치환 단계를 먼저 끝내면 그 뒤에 화면에서 눈에 띄는 차이는 전부 의도된 것이다.
섞어서 하면 "이게 바뀐 게 맞나" 를 단계마다 판정해야 하고, 게이트는 그 차이를 못 본다.

| 단계 | 무엇을      | 대상 | 값 변화               |
| ---- | ----------- | ---: | --------------------- |
| 1    | `PageShell` |    5 | 없음                  |
| 2    | `Card`      |    2 | 없음                  |
| 3    | `Prose`     |    2 | 없음                  |
| 4    | `AppLink`   |    3 | 없음                  |
| 5    | `PageTitle` |    5 | **2곳**               |
| 6    | `Separator` |    3 | **1곳**               |
| 7    | `Badge`     |    6 | **2곳** + 마크업 조정 |

`Button` 은 대상이 0곳이다. 화면에 버튼이 들어갈 자리가 아직 없다 — 근거는
[`components/Button.md`](components/Button.md) 의 `## 근거` 절이고 실측 `<button>` 1건이 `ThemeToggle` 이다.

---

## 1단계 — `PageShell` (5곳, 값 변화 없음)

| 파일:줄                                      |
| -------------------------------------------- |
| `apps/handwork/src/app/not-found.tsx:10`     |
| `apps/handwork/src/views/case-index.tsx:8`   |
| `apps/handwork/src/views/case-detail.tsx:24` |
| `apps/handwork/src/views/lab-index.tsx:6`    |
| `apps/handwork/src/views/lab-detail.tsx:12`  |

다섯 곳의 클래스 문자열이 한 글자도 다르지 않고, `packages/scopulus-ui/src/ui/page-shell.tsx:12` 가 같은 문자열을 갖는다.

**before** (`apps/handwork/src/views/case-index.tsx:8`)

```tsx
<main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10 md:px-8 md:py-16">
```

**after**

```tsx
import { PageShell } from "@scopulus/ui";
// ...
<PageShell>
```

닫는 태그도 `</main>` → `</PageShell>` 로 바꾼다.

**랜딩은 대상이 아니다.** `apps/handwork/src/app/page.tsx:10` 의 `<main className="flex h-dvh flex-col overflow-hidden">`
은 폭도 여백도 다르다 — 아래 `## 바꾸지 않는 것` 참조.

---

## 2단계 — `Card` (2곳, 값 변화 없음)

| 파일:줄                                               |
| ----------------------------------------------------- |
| `apps/handwork/src/entities/case/ui/case-card.tsx:16` |
| `apps/handwork/src/entities/lab/ui/lab-card.tsx:16`   |

두 곳의 클래스가 `packages/scopulus-ui/src/ui/card.tsx:25` 와 같다.

**before** (`apps/handwork/src/entities/case/ui/case-card.tsx:14`)

```tsx
<Link
  href={`/cases/${item.slug}`}
  className="flex flex-col gap-2 rounded-lg border border-border bg-card p-5 transition-colors duration-150 ease-out hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none"
>
```

**after**

```tsx
import { Card } from "@scopulus/ui";
// ...
<Card href={`/cases/${item.slug}`}>
```

**`import Link from "next/link"` 가 두 파일에서 쓰이지 않게 된다. 지운다**
(`apps/handwork/src/entities/case/ui/case-card.tsx:1` · `apps/handwork/src/entities/lab/ui/lab-card.tsx:1`).

**`entities` 는 `views` 와 파일이 겹치지 않는다.** 1단계와 병렬로 해도 된다.

---

## 3단계 — `Prose` (2곳, 값 변화 없음)

| 파일:줄                                      |
| -------------------------------------------- |
| `apps/handwork/src/views/case-detail.tsx:45` |
| `apps/handwork/src/views/lab-detail.tsx:41`  |

`packages/scopulus-ui/src/ui/prose.ts:28` 이 `mx-auto mt-10 max-w-[68ch] ${PROSE}` 를 그대로 갖는다.

**before** (`apps/handwork/src/views/case-detail.tsx:45`)

```tsx
import { PROSE } from "@scopulus/ui";
// ...
<article className={`mx-auto mt-10 max-w-[68ch] ${PROSE}`}>{children}</article>;
```

**after**

```tsx
import { Prose } from "@scopulus/ui";
// ...
<Prose>{children}</Prose>;
```

두 파일의 `import { PROSE }` 를 `import { Prose }` 로 바꾼다
(`apps/handwork/src/views/case-detail.tsx:4` · `apps/handwork/src/views/lab-detail.tsx:2`).

**끝나면 `handwork-ui` 에게 알린다.** 위 "갈린 곳 2" 의 3번을 그쪽이 한다.

---

## 4단계 — `AppLink` (3곳, 값 변화 없음)

| 파일:줄                                      | variant  | 비고                           |
| -------------------------------------------- | -------- | ------------------------------ |
| `apps/handwork/src/app/not-found.tsx:17`     | `inline` | 부모 `<p>` 에서 fg 를 상속한다 |
| `apps/handwork/src/views/case-index.tsx:19`  | `inline` | 부모 `<div>` 에서 상속한다     |
| `apps/handwork/src/views/case-detail.tsx:10` | `bare`   | `const LINK` 를 통째로 지운다  |

세 곳의 클래스 집합이 `packages/scopulus-ui/src/ui/app-link.tsx:32`·`packages/scopulus-ui/src/ui/app-link.tsx:34`·`packages/scopulus-ui/src/ui/app-link.tsx:35` 의 조합과 정확히 같다.

**before** (`apps/handwork/src/app/not-found.tsx:15`)

```tsx
<Link
  href="/cases"
  className="underline underline-offset-4 transition-colors duration-150 ease-out hover:text-brand-accent focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none"
>
  케이스 목록으로
</Link>
```

**after**

```tsx
import { AppLink } from "@scopulus/ui";
// ...
<AppLink href="/cases">케이스 목록으로</AppLink>;
```

### `case-detail.tsx` 의 이웃 링크 — fg 를 `<nav>` 로 올린다

`AppLink` 는 `className` 을 받지 않고 fg 를 부모에게서 상속한다
(`packages/scopulus-ui/src/ui/app-link.tsx:15`). 그래서 지금 링크마다 붙어 있는
`text-muted-foreground` 를 `<nav>` 로 옮긴다.

**before** (`apps/handwork/src/views/case-detail.tsx:50`)

```tsx
<nav
  aria-label="다른 케이스"
  className="mx-auto mt-12 flex max-w-[68ch] justify-between gap-4 border-t border-border pt-6 text-sm"
>
  {prev ? (
    <Link
      href={`/cases/${prev.slug}`}
      className={`text-muted-foreground ${LINK}`}
    >
      ← {prev.title}
    </Link>
  ) : (
    <span />
  )}
  {next ? (
    <Link
      href={`/cases/${next.slug}`}
      className={`ml-auto text-right text-muted-foreground ${LINK}`}
    >
      {next.title} →
    </Link>
  ) : null}
</nav>
```

**after** (6단계에서 `border-t ... pt-6` 이 한 번 더 바뀐다)

```tsx
<nav
  aria-label="다른 케이스"
  className="mx-auto flex max-w-[68ch] justify-between gap-4 text-sm text-muted-foreground"
>
  {prev ? (
    <AppLink href={`/cases/${prev.slug}`} variant="bare">
      ← {prev.title}
    </AppLink>
  ) : (
    <span />
  )}
  {next ? (
    <span className="ml-auto text-right">
      <AppLink href={`/cases/${next.slug}`} variant="bare">
        {next.title} →
      </AppLink>
    </span>
  ) : null}
</nav>
```

`ml-auto text-right` 는 flex 항목의 배치라 링크가 아니라 감싸는 `<span>` 이 가져야 한다.
`apps/handwork/src/views/case-detail.tsx:62` 의 빈 `<span />` 자리 지킴이는 그대로 둔다.

**`const LINK`(`apps/handwork/src/views/case-detail.tsx:10`)와 `import Link`(`apps/handwork/src/views/case-detail.tsx:1`)를 지운다.**

### 헤더 2곳은 이번 대상이 아니다

| 파일:줄                                        | 왜                                                                                                               |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `apps/handwork/src/widgets/site-header.tsx:15` | `const LINK` 가 `inline-flex items-center py-2 font-mono text-[0.7rem] tracking-widest uppercase` 를 함께 갖는다 |
| `apps/handwork/src/widgets/site-header.tsx:24` | 워드마크 링크가 `inline-flex items-center py-2` 를 갖는다                                                        |

**`AppLink` 는 `className` 을 받지 않아 그 클래스들을 실을 수 없다.** 그런데 `py-2` 는 링크
자신이 가져야 한다 — [`components/SiteHeader.md`](components/SiteHeader.md) 의 `a11y:target` 이 실측을 기록했다:
링크 상자 39x33 · 31x33, "바에 여백을 몰아 주면 링크의 클릭 영역이 글자 높이(11px)에 머문다".
감싸는 `<span>` 으로 옮기면 최소 타깃 24x24 를 잃는다.

**권고: 지금은 그대로 둔다.** 옮기고 싶으면 `AppLink` 에 `variant="nav"` 를 한 단계 더한다.
**고칠 위치:** `packages/scopulus-ui/src/ui/app-link.tsx:24` 의 variant 유니온과
[`components/AppLink.md`](components/AppLink.md) 의 variant 표, 두 곳. **둘 다 `handwork-ui` 소유다.**

---

## 5단계 — `PageTitle` (5곳, **값 변화 2곳**)

| 파일:줄                                      | variant  | 값 변화                         |
| -------------------------------------------- | -------- | ------------------------------- |
| `apps/handwork/src/views/case-index.tsx:9`   | `index`  | 없음 (이미 65ch)                |
| `apps/handwork/src/views/lab-index.tsx:7`    | `index`  | **있다 — 설명 폭 60ch → 65ch**  |
| `apps/handwork/src/app/not-found.tsx:11`     | `index`  | **있다 — 설명 문단 3가지 추가** |
| `apps/handwork/src/views/case-detail.tsx:26` | `detail` | 없음                            |
| `apps/handwork/src/views/lab-detail.tsx:14`  | `detail` | 없음                            |

**before** (`apps/handwork/src/views/case-index.tsx:9`)

```tsx
<h1 className="text-4xl font-bold tracking-[-0.02em]">케이스</h1>
<p className="mt-3 max-w-[65ch] leading-relaxed break-keep text-muted-foreground">
  어떤 제약에서 무엇을 고르고 무엇을 버렸는지를 씁니다.
</p>
```

**after**

```tsx
import { PageTitle } from "@scopulus/ui";
// ...
<PageTitle description="어떤 제약에서 무엇을 고르고 무엇을 버렸는지를 씁니다.">
  케이스
</PageTitle>;
```

상세 화면은 `variant="detail"` 을 준다 (`leading-[1.15] break-keep` 이 그때만 붙는다 —
`packages/scopulus-ui/src/ui/page-title.tsx:26`).

```tsx
<PageTitle variant="detail">{meta.title}</PageTitle>
```

### ⚠ 값이 바뀐다 1 — `lab-index.tsx` 설명 폭 60ch → 65ch

`apps/handwork/src/views/lab-index.tsx:8` 이 `max-w-[60ch]` 인데 `PageTitle` 은 `max-w-[65ch]` 다
(`packages/scopulus-ui/src/ui/page-title.tsx:34`).

**화면이 실제로 달라진다.** Labs 화면의 설명 문단이 5ch 만큼 넓어지고, 줄바꿈 지점이 옮겨간다.
문단이 세 줄이라 한 줄이 줄어들 수 있다.

**이유:** 65ch·60ch·폭 없음 셋이 전부 "제목 밑의 한 문단" 으로 같은 의미다. 값이 다른데 의미가
같으면 통일한다. 65ch 를 고른 근거는 [`components/PageTitle.md`](components/PageTitle.md) 에 있다 —
본문 폭 `max-w-[68ch]` 에 가장 가까워, 같은 사이트에서 설명과 본문의 줄바꿈이 크게 갈리지 않는다.

**되돌릴 위치:** `packages/scopulus-ui/src/ui/page-title.tsx:34` 한 곳.

### ⚠ 값이 바뀐다 2 — `not-found.tsx` 설명 문단

`apps/handwork/src/app/not-found.tsx:14` 는 `mt-3 text-muted-foreground` 뿐이다. `PageTitle` 을
쓰면 `max-w-[65ch] leading-relaxed break-keep` **셋이 더 붙는다.**

**화면이 실제로 달라진다.** 그 문단은 링크 한 줄뿐이라 폭 제한은 드러나지 않지만
`leading-relaxed`(1.625)로 줄 높이가 늘어난다.

`description` 이 `React.ReactNode` 라 링크를 그대로 넣을 수 있다.

```tsx
<PageTitle description={<AppLink href="/cases">케이스 목록으로</AppLink>}>
  찾을 수 없는 케이스입니다.
</PageTitle>
```

**이 화면만 예외로 두지 않는 이유:** 오류 화면도 방문자가 보는 화면이다. 설명 문단이 다른 화면과
다른 행간으로 나오면, 같은 사이트에서 두 서식이 된다.

---

## 6단계 — `Separator` (3곳, **값 변화 1곳**)

| 파일:줄                                      | 지금 여백 | 뒤      | 값 변화  |
| -------------------------------------------- | --------- | ------- | -------- |
| `apps/handwork/src/views/case-index.tsx:15`  | 32 / 32   | 32 / 32 | 없음     |
| `apps/handwork/src/views/lab-index.tsx:16`   | 32 / 32   | 32 / 32 | 없음     |
| `apps/handwork/src/views/case-detail.tsx:52` | 48 / 24   | 32 / 32 | **있다** |

`Separator` 는 `my-8 border-t border-border` 다 (`packages/scopulus-ui/src/ui/separator.tsx:14`).

**before** (`apps/handwork/src/views/lab-index.tsx:16`)

```tsx
<p className="mt-8 border-t border-border pt-8 text-muted-foreground">
  아직 공개한 기록이 없습니다.
</p>
```

**after**

```tsx
import { Separator } from "@scopulus/ui";
// ...
<Separator />
<p className="text-muted-foreground">아직 공개한 기록이 없습니다.</p>
```

`apps/handwork/src/views/case-index.tsx:15` 도 같다 — `<div>` 에서 `mt-8 border-t border-border pt-8`
을 떼고 앞에 `<Separator />` 를 놓는다.

**`<div>`/`<p>` 를 `<>...</>` 로 감싸야 한다.** 둘 다 삼항의 한 가지라 단일 요소를 반환하고 있다.

### ⚠ 값이 바뀐다 3 — `case-detail.tsx` 의 이웃 내비게이션 48/24 → 32/32

`apps/handwork/src/views/case-detail.tsx:52` 는 선이 `<nav>` 자신의 `className` 에 붙어 있다.
떼어내려면 `<nav>` **앞**으로 `<Separator />` 를 빼야 한다.

**before** (4단계를 이미 적용한 상태)

```tsx
<nav
  aria-label="다른 케이스"
  className="mx-auto mt-12 flex max-w-[68ch] justify-between gap-4 border-t border-border pt-6 text-sm text-muted-foreground"
>
```

**after**

```tsx
<div className="mx-auto max-w-[68ch]">
  <Separator />
  <nav
    aria-label="다른 케이스"
    className="flex justify-between gap-4 text-sm text-muted-foreground"
  >
```

**화면이 실제로 달라진다.** 본문과 선 사이가 48px → 32px 으로 좁아지고, 선과 이웃 링크 사이가
24px → 32px 으로 넓어진다.

**이유:** 위아래가 같아야 선이 두 덩어리의 가운데에 놓인다. 48/24 는 선이 아래 블록에 붙어 있어
내비게이션의 머리 장식으로 읽힌다. 근거는 [`components/Separator.md`](components/Separator.md) 다.

**폭 `mx-auto max-w-[68ch]` 를 감싸는 `<div>` 로 올려야 한다.** `Separator` 는 폭을 정하지 않고
부모를 꽉 채운다 — 선이 스스로 폭을 정하면 본문과 어긋난다.

**되돌릴 위치:** `packages/scopulus-ui/src/ui/separator.tsx:14` 의 `my-8` 한 곳.

---

## 7단계 — `Badge` (6곳, **값 변화 2곳** + 마크업 조정)

### 7-1. 태그 칩 4곳 — 값 변화 없음

| 파일:줄                                               | 감싸는 요소 |
| ----------------------------------------------------- | ----------- |
| `apps/handwork/src/entities/case/ui/case-card.tsx:27` | `<span>`    |
| `apps/handwork/src/entities/lab/ui/lab-card.tsx:41`   | `<span>`    |
| `apps/handwork/src/views/case-detail.tsx:37`          | `<li>`      |
| `apps/handwork/src/views/lab-detail.tsx:33`           | `<li>`      |

`Badge` 의 tag 면은 `rounded-sm bg-muted px-2 py-0.5 text-xs text-muted-foreground` 다
(`packages/scopulus-ui/src/ui/badge.tsx:42`). 네 곳의 계산값과 같다 — 카드 쪽 둘은 부모
(`apps/handwork/src/entities/case/ui/case-card.tsx:24`)가 `text-xs text-muted-foreground` 를 주고 있다.

**before** (`apps/handwork/src/entities/case/ui/case-card.tsx:26`)

```tsx
{
  shown.map((tag) => (
    <span key={tag} className="rounded-sm bg-muted px-2 py-0.5">
      {tag}
    </span>
  ));
}
```

**after**

```tsx
import { Badge } from "@scopulus/ui";
// ...
{
  shown.map((tag) => <Badge key={tag}>{tag}</Badge>);
}
```

**상세 화면 둘은 `<li>` 에 `flex` 를 붙인다.**

```tsx
// apps/handwork/src/views/case-detail.tsx:34 부근
{
  meta.tags.map((tag) => (
    <li key={tag} className="flex">
      <Badge>{tag}</Badge>
    </li>
  ));
}
```

**이유:** 지금은 `<li>` 자신이 칩이라 `py-0.5` 가 flex 항목의 높이를 만든다. `<li>` 안에
`<span>` 을 넣으면 그 span 이 인라인 상자가 되어 세로 여백이 줄 높이에 더해지지 않는다.
`flex` 를 주면 span 이 다시 flex 항목이 되어 지금과 같은 높이가 된다.
**이 한 줄은 렌더 화면에서 확인해라** — 아래 `## 렌더 화면에서 재야 하는 것` 3번.

### 7-2. 상태 배지 2곳 — **값이 바뀐다**

| 파일:줄                                             | 지금 글자 크기         | 뒤             |
| --------------------------------------------------- | ---------------------- | -------------- |
| `apps/handwork/src/entities/lab/ui/lab-card.tsx:18` | `text-[0.7rem]` 11.2px | `text-xs` 12px |
| `apps/handwork/src/views/lab-detail.tsx:18`         | `text-sm` 14px         | `text-xs` 12px |

`Badge` 의 status 면은 `flex items-center gap-2 text-xs text-muted-foreground` 다
(`packages/scopulus-ui/src/ui/badge.tsx:26`).

**before** (`apps/handwork/src/entities/lab/ui/lab-card.tsx:18`)

```tsx
<span className="flex items-center gap-2 font-mono text-[0.7rem] tracking-widest text-muted-foreground uppercase">
  <span
    aria-hidden
    className={
      item.status === "진행 중"
        ? "size-1.5 rounded-full bg-brand-accent"
        : "size-1.5 rounded-full bg-muted-foreground"
    }
  />
  <span className="font-sans tracking-normal normal-case">{item.status}</span>
  <span>·</span>
  <span>{item.date}</span>
</span>
```

**after**

```tsx
<span className="flex items-center gap-2 text-muted-foreground">
  <Badge variant="status" tone={item.status === "진행 중" ? "active" : "idle"}>
    {item.status}
  </Badge>
  <span className="font-mono text-[0.7rem] tracking-widest uppercase">·</span>
  <span className="font-mono text-[0.7rem] tracking-widest uppercase">
    {item.date}
  </span>
</span>
```

**모노·대문자·자간을 바깥에서 떼어 `·` 와 날짜에만 붙여야 한다.**
**이유:** `Badge` 는 서체를 재설정하지 않는다. 바깥에 `font-mono` 를 두면 배지 안의 한글이
Geist Mono 로 떨어지고, 그 폰트에 한글 글립이 없어 대체 서체로 갈린다. 지금 코드가
`apps/handwork/src/entities/lab/ui/lab-card.tsx:27` 에서 `font-sans tracking-normal normal-case` 로
되돌리고 있는 것이 바로 그 문제를 막는 장치다. 근거는
[`tokens.md`](tokens.md) 의 `### 서체 — 2종` 절이다.

`lab-detail.tsx` 도 같은 모양이다.

**before** (`apps/handwork/src/views/lab-detail.tsx:18`)

```tsx
<p className="mt-4 flex items-center gap-2 text-sm tracking-wide text-muted-foreground">
  <span aria-hidden className={...} />
  {meta.status} · {meta.date}
</p>
```

**after**

```tsx
<p className="mt-4 flex items-center gap-2 text-muted-foreground">
  <Badge variant="status" tone={meta.status === "진행 중" ? "active" : "idle"}>
    {meta.status}
  </Badge>
  <span className="text-sm tracking-wide">· {meta.date}</span>
</p>
```

**화면이 실제로 달라진다.**

- LabCard 의 상태 글자가 11.2px → 12px 으로 커지고 자간 0.1em 이 사라진다
- 기록 상세의 상태 글자가 14px → 12px 으로 작아진다
- 상세에서 `{meta.status} · {meta.date}` 가 한 텍스트 노드였는데 둘로 갈라져, 그 사이가 공백에서 `gap-2`(8px)가 된다

**이유:** 같은 배지가 화면마다 다른 크기로 나오면 그것은 컴포넌트가 아니라 우연히 비슷한 두 개다.
`Badge` 를 쓰는 목적이 그 둘을 하나로 만드는 것이다. 5단계의 65ch 통일, 6단계의 32/32 통일과 같은 판단이다.

**되돌릴 위치:** `packages/scopulus-ui/src/ui/badge.tsx:26` 의 `text-xs` 한 곳.
**`handwork-ui` 소유다.**

---

## 바꾸지 않는 것

| 무엇                    | 파일:줄                                                                                                                                                                                       | 이유                                                                                                                                                                                                                                                           |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 푸터의 `border-t`       | `apps/handwork/src/widgets/site-footer.tsx:7`                                                                                                                                                 | `<footer>` 자신의 테두리다. 두 블록 사이가 아니라 페이지와 푸터의 경계이고, 본문이 짧을 때도 화면 아래에 붙어 있어야 한다. `Separator` 로 바꾸면 본문 흐름 안으로 들어온다                                                                                     |
| 랜딩의 `<main>`         | `apps/handwork/src/app/page.tsx:10`                                                                                                                                                           | `flex h-dvh flex-col overflow-hidden` 이라 `PageShell` 과 폭도 여백도 다르다. 배경 사진이 화면을 가득 채우는 한 장이고 스크롤이 없다 — 여백을 주면 사진에 테두리가 생긴다                                                                                      |
| `ThemeToggle`           | `apps/handwork/src/widgets/site-header.tsx:49`                                                                                                                                                | 구현이 바뀌지 않았다. `Button` 으로 감싸지 않는 이유는 [`components/ThemeToggle.md`](components/ThemeToggle.md) 의 "더할 것 1" 에 있다                                                                                                                         |
| 랜딩의 `ground` 5색     | `apps/handwork/src/views/home.tsx:33` `apps/handwork/src/views/home.tsx:38` `apps/handwork/src/views/home.tsx:43` `apps/handwork/src/views/home.tsx:48` `apps/handwork/src/views/home.tsx:54` | 배경 이미지 5장 각각의 지배색이다. 그림이 뜨기 전 그 자리에 깔리는 바탕이라 이미지에 묶여 있고, 토큰으로 올릴 성격이 아니다. G2 게이트가 `src` 전체에서 검출하는 5건이 전부 이것이다                                                                           |
| 헤더 링크 2곳           | `apps/handwork/src/widgets/site-header.tsx:15` `apps/handwork/src/widgets/site-header.tsx:24`                                                                                                 | 4단계 마지막 절 참조. `AppLink` 가 `className` 을 받지 않아 `py-2` 를 실을 수 없고, 그것을 잃으면 최소 타깃 24x24 가 깨진다                                                                                                                                    |
| 랜딩 워드마크의 두 토큰 | `apps/handwork/src/views/home.tsx:102` `apps/handwork/src/views/home.tsx:104`                                                                                                                 | `--brand-overlay-ink` 와 `--brand-mark` 는 `.dark` 에서 재정의하지 않는 고정 토큰이다(`apps/handwork/src/app/globals.css` 66-70행 부근). 사진 위에 얹히는 색이라 테마로 뒤집히면 사진 위에서 읽히지 않는다. **이미 토큰으로 바뀌어 있다** — 다시 건드리지 마라 |

---

## 각 단계의 검증

**단계마다 전부 돌린다.** 한 번에 몰아서 돌리면 어느 단계가 깼는지 판정할 수 없다.

```bash
cd /Users/kim/Workspace/curvez

# G1 빌드 게이트 — 네 개 모두 exit 0
pnpm typecheck && pnpm lint && pnpm build
pnpm --filter handwork exec storybook build --output-dir /tmp/sb-out

# G2 하드코딩 색값 — shared/ui + entities 범위에서 0건이어야 한다
grep -rnE '#[0-9a-fA-F]{3,8}\b|rgba?\(|oklch\(' \
  apps/handwork/src/shared/ui apps/handwork/src/entities \
  --include='*.tsx' --include='*.ts'

# G3 대비 — 실패 0건
node apps/handwork/scripts/check-contrast.mjs

# 토큰 내보내기가 globals.css 와 어긋나지 않았는지
node apps/handwork/scripts/export-tokens.mjs --check
```

이 문서를 쓰는 시점에 마지막 둘의 실제 출력이다.

```
대비 쌍 20건 검사
토큰 hex 동기 25건 검사
실패 0건

tokens.figma.json 이 globals.css 와 일치한다
```

### 단계별로 더 볼 것

| 단계 | 추가로 확인할 것                                                                                                                   |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------- |
| 1    | 다섯 화면이 전부 `<main>` 하나만 갖는다: `grep -rn '<main' apps/handwork/src --include='*.tsx'` 가 랜딩 1건 + `page-shell.tsx` 1건 |
| 2    | `import Link` 잔여 0건: `grep -n 'next/link' apps/handwork/src/entities/*/ui/*.tsx`                                                |
| 3    | `import { PROSE }` 잔여 0건: `grep -rn 'PROSE' apps/handwork/src/views`                                                            |
| 4    | `const LINK` 잔여가 헤더 1건뿐: `grep -rn 'const LINK' apps/handwork/src`                                                          |
| 5    | `text-4xl` 잔여가 `page-title.tsx` 1건 + 랜딩 `clamp()` 1건                                                                        |
| 6    | `border-t` 잔여가 푸터 1건 + `separator.tsx` 1건                                                                                   |
| 7    | `size-1.5 rounded-full` 잔여가 `badge.tsx` 2건(삼항 양쪽)뿐. `rounded-sm bg-muted` 잔여가 `badge.tsx` 1건뿐                        |

**G2 는 `views/` 를 범위에 넣지 않는다.** `src` 전체로 넓히면 5건이고 전부
`apps/handwork/src/views/home.tsx` 의 `ground` 다. 위 `## 바꾸지 않는 것` 표의 이유가 그 범위를 정한 근거다.

---

## 렌더 화면에서 재야 하는 것

**코드만 보고 정할 수 없다. 추측으로 값을 박지 마라.** 재고 나서 해당 문서에 한 줄씩 적는다.

| #   | 무엇                                                               | 어디에 적나                                                     |
| --- | ------------------------------------------------------------------ | --------------------------------------------------------------- |
| 1   | 랜딩 오버레이 색의 실제 대비 (아래 설명)                           | [`tokens.md`](tokens.md) 의 대비 검증 목록                      |
| 2   | `Button` 의 `--primary/90` hover 와 `--primary-foreground` 의 대비 | 같은 곳. 근거는 [`components/Button.md`](components/Button.md)  |
| 3   | `<li className="flex">` 안의 `Badge` 세로 여백이 지금과 같은가     | [`components/Badge.md`](components/Badge.md) 의 `## responsive` |
| 4   | MDX 본문 링크의 포커스 링이 실제로 어떻게 그려지는가               | [`components/Prose.md`](components/Prose.md) 의 `## states`     |
| 5   | `--foreground` / `--muted`(인라인 코드·`pre`)의 대비               | [`tokens.md`](tokens.md) 의 대비 검증 목록                      |
| 6   | 본문에 가로로 넘치는 코드 블록이 실제로 있는가                     | [`components/Prose.md`](components/Prose.md) 의 `a11y:focus`    |

### 1번에 대한 실측과 그 한계

`handwork-ui` 가 랜딩 오버레이 색을 `ground` 5색에 대해 재봤다.

- `--brand-overlay-ink` 는 `maker-portrait` 의 바탕에서 **1.82** 로 미달이다
- `--brand-mark` 는 5개 중 **4개에서 미달**이다 (1.02~1.83)

**그런데 이 수치를 게이트에 넣지 않았고, 넣으면 안 된다.**
**이유:** `ground` 는 사진이 뜨기 전에 깔리는 **단색 fallback** 이다
(`apps/handwork/src/views/home.tsx:60`). 실제로 워드마크가 얹히는 것은 사진 픽셀이지 그 단색이
아니다. 단색 기준으로 판정하면 통과할 수 없는 검사를 만든다 —
[`tokens.md`](tokens.md) 가 면과 면의 구분을 대비 목록에서 뺀 것과 같은 판단이다.

**해야 할 일:** 다섯 배경 각각에서 워드마크가 실제로 놓이는 영역의 픽셀을 재고, 미달이면
스크림(반투명 면)을 넣을지 워드마크 위치를 옮길지 판정한다. **지금 값을 지어내지 마라.**

---

## 끝나고 넘길 것

| 누구에게                 | 무엇을                                                                                              |
| ------------------------ | --------------------------------------------------------------------------------------------------- |
| `handwork-ui`            | 3단계가 끝났다는 사실. `packages/scopulus-ui/src/ui/prose.ts:9-10` 문자열을 지우고 `.tsx` 로 바꾼다 |
| `handwork-ui`            | 헤더를 옮기려면 `AppLink` 에 `variant="nav"` 가 필요하다는 것 (4단계 마지막)                        |
| `handwork-design-system` | 위 표의 1·2·5번 실측값. [`tokens.md`](tokens.md) 는 그쪽 소유다                                     |
| `curvez-orchestrator`    | 값이 바뀐 다섯 곳(5단계 2곳 · 6단계 1곳 · 7단계 2곳). 화면이 실제로 달라진다                        |

# component: AppLink

purpose: 주소를 바꾸는 이동 하나. hover 와 focus 를 `--ring` 한 색으로 모은다

## 근거 — 화면에 6번 나온다

같은 상호작용 규칙이 여섯 자리에서 반복된다. hover 색이 전부 `--ring` 다.

```bash
grep -rn 'hover:text-ring' apps/handwork/src --include='*.tsx' --include='*.ts'
```

| 파일                                        | 줄  | 밑줄 | 자리                                             |
| ------------------------------------------- | --- | ---- | ------------------------------------------------ |
| `apps/handwork/src/app/not-found.tsx`       | 17  | O    | "케이스 목록으로"                                |
| `apps/handwork/src/views/case-index.tsx`    | 19  | O    | 빈 목록의 "홈으로"                               |
| `apps/handwork/src/widgets/site-header.tsx` | 15  | O    | 헤더 링크 상수 `LINK` (Cases · Labs)             |
| `apps/handwork/src/views/case-detail.tsx`   | 10  | X    | 본문·이웃 링크 상수 `LINK`                       |
| `apps/handwork/src/widgets/site-header.tsx` | 24  | X    | 헤더 워드마크 `handwork®`                        |
| `packages/scopulus-ui/src/ui/prose.ts`      | 8   | O    | MDX 본문 안 링크 `[&_a:hover]:text-brand-accent` |

리터럴 `hover:text-ring` 는 5줄이고, 여섯 번째는 `prose.ts:8` 의 `[&_a:hover]:` 형태라
같은 grep 에 걸리지 않는다. 강조색으로 hover 하는 자리는 **모두 6곳**이다.

## 이 컴포넌트가 존재하는 이유

[`../tokens.md`](../tokens.md) 의 `랜딩 팔레트` 절이 이렇게 적었다.

> **상호작용 색은 사이트 전역에서 이 강조색 하나다.** 링크 hover 와 포커스 링이 전부 여기로 모인다.
> **이유:** 화면마다 hover 색이 다르면 "여기를 누를 수 있다" 를 색으로 배울 수 없다. 강조색을
> 하나로 잠가야 나머지 색이 전부 중립으로 읽힌다.

지금 그 규칙은 **여섯 자리에 손으로 복사돼 있다.** 두 곳(`site-header.tsx:15`, `case-detail.tsx:10`)은
이미 파일 안에서 `const LINK` 로 묶었지만, 그 두 상수가 서로 다른 파일에 있어 한쪽만 고쳐질 수 있다.
AppLink 는 그 여섯 자리를 한 자리로 모으는 컴포넌트다.

**강조색을 prop 으로 열지 마라.**
**이유:** 열면 위 규칙이 권고가 된다. 색이 필요하면 [`../tokens.md`](../tokens.md) 에 먼저 적고
그 이름으로 부른다 — 컴포넌트가 만든 값은 문서에 남지 않아, 다음 사람이 스펙을 읽고 만든 화면과
실제 화면이 달라진다.

### `cta` 는 버튼 모양이지만 `<a>` 다

요소를 바꾸지 않는다. 모양만 `Button` 의 `buttonClass` 를 입는다.

- **`Button` 에 `<a>` 를 넣지 마라.** Base UI 의 `Button` 은 언제나 `role="button"` 을 붙이고,
  그러면 링크 역할이 덮여 새 탭 열기와 주소 복사가 막힌다. shadcn 문서도 링크에는 `Button` 말고
  `buttonVariants()` 를 쓰라고 적어 뒀다
- **클래스를 복사하지 마라.** `buttonClass` 를 부른다. 복사하면 두 벌이 되어 한쪽만 고쳐질 때
  모양이 달라진다
- `Button.md` 가 `variant="link"` 를 뺀 것은 **반대 방향**이다 — `<button>` 을 링크처럼 보이게
  하면 새 탭과 주소 복사가 막힌다. 여기는 그 문제가 없다

**근거:** shadcn/ui 랜딩의 `Get Started` · `View Components` 가 `<a>` 이고 `role` 이 없다.
높이 35px, `padding 0 12px`, 채운 면과 테두리 면 두 단계다(2026-09-11 확인).

## props

| 이름     | 타입                                       | 필수 | 기본값   | 의미                                                                                  |
| -------- | ------------------------------------------ | ---- | -------- | ------------------------------------------------------------------------------------- |
| href     | `string`                                   | O    | —        | 이동 대상. `next/link` 로 간다                                                        |
| children | `React.ReactNode`                          | O    | —        | 링크 글자                                                                             |
| variant  | `inline` \| `bare` \| `cta` \| `cta-quiet` | X    | `inline` | `inline`=밑줄 있음(4회), `bare`=밑줄 없음(2회), `cta`·`cta-quiet`=버튼 모양(랜딩 2곳) |
| current  | `boolean`                                  | X    | `false`  | `true` 면 `aria-current="page"` 를 붙인다                                             |

| variant     | 클래스                                | 화면에 나온 횟수 | 언제                                                          |
| ----------- | ------------------------------------- | ---------------: | ------------------------------------------------------------- |
| `inline`    | `underline underline-offset-4`        |                4 | 글 안에 섞여 있어 밑줄 없이는 링크인지 알 수 없는 자리        |
| `bare`      | 없음                                  |                2 | 이미 위치로 구분되는 자리 — 헤더 워드마크, 이웃 글 내비게이션 |
| `cta`       | `buttonClass()`                       |                1 | 랜딩의 주 행동                                                |
| `cta-quiet` | `buttonClass({ variant: 'outline' })` |                1 | 그 옆의 두 번째 행동                                          |

`inline` 근거: `not-found.tsx:17`, `case-index.tsx:19`, `site-header.tsx:15`, `prose.ts:8`.
`bare` 근거: `case-detail.tsx:10`, `site-header.tsx:24`.

**`variant` 를 셋으로 늘리지 마라.**
**이유:** 화면에 두 형태뿐이었다. 밑줄이 있거나 없거나이고, 그 사이에 중간값이 없다.

**`external` prop 을 두지 않는다.**
**이유:** 화면에 외부 링크가 0번 나온다. 생기면 그때 `target`·`rel`·아이콘을 한꺼번에 정한다 —
지금 정하면 검증할 수 없는 값이 남는다.

## states

| state         | 트리거        | 시각 변화                                                                                                                                                                                                                                            |
| ------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| default       | —             | fg 는 부모에게서 상속한다(자기 색을 갖지 않는다). `inline` 이면 `underline underline-offset-4`. 전이 `transition-colors duration-150 ease-out motion-reduce:transition-none`                                                                         |
| hover         | 포인터 진입   | fg → `--ring`. **색만 바뀐다.** 밑줄 굵기·위치·글자 크기·위치 전부 그대로다                                                                                                                                                                          |
| focus-visible | 키보드 포커스 | `focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring`. **`rounded-sm` 이 필요하다** — 인라인 링크는 자기 반경이 없어 붙이지 않으면 링이 직각으로 그려진다. 화면에 나온 5곳이 전부 이 조합이다 |
| pressed       | `:active`     | 시각 변화 없음. 누르면 주소가 바뀌어 화면이 교체된다 — 그 사이를 표시해도 읽히지 않는다                                                                                                                                                              |
| disabled      | 없음          | 비활성 링크가 없다. 현재 화면을 가리키는 링크도 눌리게 둔다 ([`SiteHeader.md`](SiteHeader.md) 의 `disabled` 행과 같은 판단)                                                                                                                          |
| loading       | 없음          | 라우트가 빌드 시점에 확정된다. 이동 중 표시를 만들지 마라 — 랜딩을 뺀 네 화면이 정적 생성이라 전환이 즉시다                                                                                                                                          |
| empty         | 없음          | `children` 이 필수라 빈 링크가 나올 수 없다. 목록이 비었을 때 나오는 "홈으로"(`case-index.tsx:19`)는 빈 상태의 **내용**이지 링크의 빈 상태가 아니다                                                                                                  |
| error         | 없음          | 상태를 갖지 않아 실패할 동작이 없다                                                                                                                                                                                                                  |

**fg 를 default 에서 고정하지 마라.** 부모가 준 색을 그대로 쓴다 —
헤더에서는 `--brand-ink`(`site-header.tsx:19`), 본문에서는 `--foreground`, 메타 줄에서는
`--muted-foreground`(`case-detail.tsx:57`).
**이유:** 링크 색을 하나로 고정하면 메타 줄에서 링크만 튀어 그 줄이 두 무게로 읽힌다. 링크임을
알리는 것은 색이 아니라 밑줄과 hover 다.

**hover 에서 위치를 옮기지 마라.** `translate`·`scale` 이 화면에 0번 나온다.
**이유:** 인라인 링크가 hover 에 움직이면 그 줄의 글자가 함께 밀려 문장이 흔들린다.

## a11y

- a11y:label — 해당 없음. 글자가 그대로 접근 이름이다. `aria-label` 을 중복 지정하지 마라 — 이유: 보이는 글자와 읽히는 글자가 달라지면 음성 조작이 실패한다. 예외는 화살표뿐인 이웃 링크인데, 그 자리(`case-detail.tsx:59,69`)는 화살표 옆에 제목이 함께 있어 이름이 이미 온전하다
- a11y:focus — 포커스 순서는 DOM 순서와 같다. 링크는 항상 포커스를 받는다. `tabindex` 를 조작하지 마라. `current=true` 여도 포커스에서 빼지 않는다
- a11y:contrast — hover fg=`--ring` 기준. `/ bg=--background` 라이트 6.02 · 다크 12.96. `/ bg=--card` 라이트 6.37 · 다크 11.92. `/ bg=--brand-canvas`(헤더 바) 라이트 5.15 · 다크 12.46. 전부 `../tokens.md` 의 대비값이고 4.5:1 을 넘는다. default 상태의 대비는 부모 색을 따라간다 — `--foreground`/`--background` 라이트 15.82 · 다크 16.13, `--muted-foreground`/`--background` 라이트 5.28 · 다크 7.97
- a11y:target — 인라인 링크는 글자 높이만큼만 차지한다. **줄 안에 있는 링크는 24x24 규칙의 예외다**(WCAG 2.5.8 의 inline 예외) — 이유: 문장 안의 링크를 키우면 줄 간격이 그 줄에서만 벌어진다. **줄 밖에 단독으로 놓이는 링크는 세로 여백을 링크 자신이 갖는다** — 헤더 링크가 `py-2` 로 상자를 39x33·31x33 까지 키운 것이 그 증거다(`site-header.tsx:15`, [`SiteHeader.md`](SiteHeader.md) 의 `a11y:target`). 바에 여백을 몰아 주면 클릭 영역이 글자 높이 11px 에 머문다
- a11y:role — `link` (`<a>` 의 암묵 역할). `<button>` 으로 만들지 마라 — 이유: 새 탭 열기와 주소 복사가 막힌다. 반대로 주소가 바뀌지 않는 동작에 이 컴포넌트를 쓰지 마라 — 그것은 `Button` 이다

## responsive

- 모든 폭에서 동일하다. 브레이크포인트 분기가 0건이다
- 긴 링크 글자는 줄바꿈된다. `whitespace-nowrap` 을 붙이지 마라 — 이유: 375px 에서 본문 밖으로 넘쳐 가로 스크롤이 생긴다
- `bare` 로 쓰이는 이웃 링크는 좌우로 나눠 배치한다 — 왼쪽 `←` 이전 글, 오른쪽 `다음 글 →`. `flex justify-between gap-4`(`case-detail.tsx:52`). 한쪽이 없으면 빈 `<span />` 이 자리를 지킨다(`case-detail.tsx:62`)
- 헤더 안의 `bare` 워드마크는 640px 미만에서 옆 태그라인이 접히고 링크 자체는 그대로 남는다(`site-header.tsx:30` `hidden sm:inline`)

## 상호작용

- hover / focus-visible 정의

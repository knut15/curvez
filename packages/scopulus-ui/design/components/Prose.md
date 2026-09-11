# component: Prose

purpose: MDX 본문의 서식을 한 자리에 모은다. 케이스와 기록이 같은 것을 쓴다

## 근거 — 이미 존재한다

`packages/scopulus-ui/src/ui/prose.ts` 가 정본이다. 7-8행에 클래스 문자열 하나가 export 돼 있고,
같은 파일 1-6행 주석이 존재 이유를 적었다.

> 두 화면이 각자 이 문자열을 들고 있으면 한쪽만 고쳐질 때 본문 서식이 조용히 갈린다.

사용처는 둘이고, 둘이 한 글자도 다르지 않다.

| 파일                                      | 줄  | 전체 클래스                           |
| ----------------------------------------- | --- | ------------------------------------- |
| `apps/handwork/src/views/case-detail.tsx` | 45  | `mx-auto mt-10 max-w-[68ch] ${PROSE}` |
| `apps/handwork/src/views/lab-detail.tsx`  | 41  | `mx-auto mt-10 max-w-[68ch] ${PROSE}` |

**`mx-auto mt-10 max-w-[68ch]` 까지 Prose 가 갖는다.** 지금은 부르는 쪽이 붙이고 있다.
**이유:** 두 사용처가 그 세 클래스도 같다. 밖에 두면 세 번째 본문 화면이 생길 때 폭이 갈린다.
`68ch` 는 [`../tokens.md`](../tokens.md) 의 "본문 폭 — 읽기 폭. 케이스 본문에만 적용한다" 행이 정본이다.

## 서식 — `shared/ui/prose.ts:8` 을 그대로 옮긴 것

| 대상            | 값                                                                                            |
| --------------- | --------------------------------------------------------------------------------------------- |
| 본문 행간       | `leading-relaxed` (1.625)                                                                     |
| `p`             | 위아래 16px (`[&_p]:my-4`)                                                                    |
| `h2`            | 위 48px, 24px, 600, 자간 -0.015em (`[&_h2]:mt-12 text-2xl font-semibold tracking-[-0.015em]`) |
| `h3`            | 위 32px, 18px, 500 (`[&_h3]:mt-8 text-lg font-medium`)                                        |
| `a`             | 밑줄 + 4px 띄움, 전이 `transition-colors duration-150 ease-out`, hover fg=`--brand-accent`    |
| `ul`            | 위아래 16px, 점 목록, 왼쪽 20px (`[&_ul]:my-4 list-disc pl-5`)                                |
| `ol`            | 위아래 16px, 숫자 목록, 왼쪽 20px (`[&_ol]:my-4 list-decimal pl-5`)                           |
| `li`            | 위아래 4px (`[&_li]:my-1`)                                                                    |
| `blockquote`    | 왼쪽 2px 선 `--border`, 왼쪽 여백 16px (`[&_blockquote]:border-l-2 border-border pl-4`)       |
| `code` (인라인) | `rounded-sm`(6px), bg=`--muted`, 좌우 4px (`[&_code]:rounded-sm bg-muted px-1`)               |
| `pre` (블록)    | 위아래 16px, 가로 스크롤, `rounded-lg`(10px), bg=`--muted`, 안쪽 16px                         |

**`h1` 을 여기서 정하지 않는다.** 화면 제목은 `PageTitle` 이 맡고 MDX 본문에는 h1 이 없다
(`views/case-detail.tsx:26`, `views/lab-detail.tsx:14` 의 h1 이 article 밖에 있다).
**이유:** 한 화면에 h1 은 하나다. 본문이 h1 을 그릴 수 있게 두면 둘이 되는 화면이 생긴다.

**`h4` 이하를 정하지 않는다.** 실측 0건이다.
**이유:** 지금 쓰이지 않는 깊이의 값을 정하면 검증되지 않은 값이 남는다. 본문에 h4 가 필요해지면
그때 이 표에 한 줄을 더한다.

**`table`·`img`·`hr` 서식을 정하지 않는다.** 실측 0건이다. 같은 이유다.

**모션 값은 `globals.css:10` 의 `--ease-out`(`cubic-bezier(0.23, 1, 0.32, 1)`)이 정본이다.**
문자열에 적힌 `ease-out` 은 그 토큰을 가리킨다.

## props

| 이름     | 타입              | 필수 | 기본값 | 의미                    |
| -------- | ----------------- | ---- | ------ | ----------------------- |
| children | `React.ReactNode` | O    | —      | MDX 가 렌더한 본문 전체 |

**`className` 을 받지 않는다.**
**이유:** 두 사용처가 붙이는 클래스가 같다. 그 셋(`mx-auto mt-10 max-w-[68ch]`)은 Prose 가 갖는다.

**`size`·`variant` 를 받지 않는다.**
**이유:** 본문 서식이 화면마다 달라야 할 이유가 없다. 케이스와 기록이 같은 글이다.

**`PROSE` 문자열 export 를 지우지 마라.**
**이유:** 현재 두 화면이 template literal 로 쓰고 있다(`case-detail.tsx:45`, `lab-detail.tsx:41`).
컴포넌트를 만들어도 문자열은 남겨 두고, 두 화면을 컴포넌트로 옮긴 뒤에 지울지 판단한다.
**고칠 위치:** `packages/scopulus-ui/src/ui/prose.ts:7`.

## states

| state         | 트리거                       | 시각 변화                                                                                                                                        |
| ------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| default       | —                            | 위 표의 서식. 폭 `max-w-[68ch]`, 위 여백 40px(`mt-10`), 가운데 정렬                                                                              |
| hover         | 본문 안 링크에 포인터 진입   | 그 링크의 fg → `--brand-accent`. Prose 자신은 반응하지 않는다                                                                                    |
| focus-visible | 본문 안 링크에 키보드 포커스 | 링크의 포커스 링. **Prose 문자열에는 focus 규칙이 없다** — `prose.ts:8` 실측. MDX 링크가 `AppLink` 를 거치지 않고 raw `<a>` 로 렌더되기 때문이다 |
| pressed       | 없음                         | Prose 자신은 눌리지 않는다                                                                                                                       |
| disabled      | 없음                         | 비활성 개념이 없다. 읽는 글이다                                                                                                                  |
| loading       | 없음                         | MDX 가 빌드 시점에 정적으로 박힌다. 스켈레톤을 만들지 마라                                                                                       |
| empty         | 없음                         | 본문이 빈 MDX 파일이 목록에 실리지 않는다. 빈 본문이 렌더되는 경로가 없다                                                                        |
| error         | 없음                         | 본문이 깨지면 빌드가 실패한다. 런타임 에러가 없다                                                                                                |

### 확인 못 한 것 — 본문 링크의 포커스 링

`prose.ts:8` 은 링크의 **hover** 만 정의하고 **focus-visible** 은 정의하지 않는다. 실측이다 —
`[&_a]:` 선택자 여섯 개가 전부 `underline`·`underline-offset`·`transition`·`duration`·`ease`·`hover` 다.

키보드로 본문 링크를 지나갈 때 무엇이 보이는지는 **확인 불가**다. `globals.css:144` 의
`* { @apply border-border outline-ring/50 }` 가 기본 outline 색을 주고 있어 브라우저 기본 링이
`--ring` 의 50% 로 그려질 가능성이 높지만, 렌더 화면에서 재지 않았다.

**해야 할 일:** 구현 시점에 `[&_a:focus-visible]:` 네 조각(`rounded-sm`·`outline-2`·`outline-offset-2`·
`outline-ring`)을 다른 링크 5곳과 같게 넣을지 판정하고, 판정 근거를 이 절에 적는다.
**권고: 넣는다.** 이유: 나머지 여섯 자리가 전부 같은 네 조각을 쓰는데 본문 링크만 브라우저 기본에
맡기면, 같은 사이트 안에서 포커스 링이 두 모양이 된다.

## a11y

- a11y:label — 해당 없음. 컨테이너이고 자기 글자가 없다. `aria-label` 을 붙이지 마라 — 이유: 이름이 붙으면 스크린리더가 본문 진입 때마다 그것을 읽는다
- a11y:focus — Prose 자신은 포커스를 받지 않는다. 안쪽 링크들의 포커스 순서는 DOM 순서 = 읽는 순서와 같다. **`pre` 블록에 `tabindex="0"` 을 주지 않는다** — 실측 0건. 이유: 가로 스크롤이 생기는 코드 블록은 키보드로 스크롤할 수 있어야 한다는 주장이 있으나, 현재 본문에 가로로 넘치는 코드가 있는지 확인하지 않았다. 확인한 뒤에 정한다
- a11y:contrast — 본문 fg=`--foreground` / bg=`--background` 라이트 15.82 · 다크 16.13. 링크 hover fg=`--brand-accent` / bg=`--background` 라이트 6.02 · 다크 12.96. 인라인 코드와 `pre` 는 fg=`--foreground` / bg=`--muted` 조합인데 **이 쌍은 `../tokens.md` 의 대비 검증 목록에 없다** — 목록에 있는 것은 `--muted-foreground`/`--muted`(라이트 4.91 · 다크 6.51)다. `--foreground` 는 `--muted-foreground` 보다 어두우므로(라이트) 대비가 더 높지만 **실측하지 않았다.** 구현 뒤 렌더 화면에서 재서 `../tokens.md` 의 `## 대비 검증` 에 한 줄을 추가한다
- a11y:target — 본문 안 인라인 링크는 24x24 규칙의 예외다(WCAG 2.5.8 inline 예외). 이유: 문장 안의 링크를 키우면 그 줄에서만 줄 간격이 벌어진다. 목록 항목 사이는 `[&_li]:my-1`(4px)이라 인접 8px 을 만족하지 않지만, **목록 항목은 클릭 대상이 아니다** — 항목 안의 링크만 대상이고 그것은 인라인 예외에 해당한다
- a11y:role — 역할을 지정하지 않는다. 렌더 요소는 `<article>` 이고(`case-detail.tsx:45`, `lab-detail.tsx:41`) 그 암묵 역할이 `article` 이다. `role="document"`·`role="main"` 을 붙이지 마라 — 이유: `main` 은 `PageShell` 이 이미 갖는다. 안쪽 `h2`·`h3` 는 MDX 가 그대로 내는 요소이고 레벨을 손으로 바꾸지 않는다

## responsive

- 폭은 모든 화면에서 `max-w-[68ch]` 고정이고 `mx-auto` 로 가운데 정렬된다. 브레이크포인트 분기가 0건이다
- `<768` — 68ch 가 화면 폭보다 넓어 `PageShell` 의 좌우 여백(20px)까지 채운다. 그 여백이 읽기 여백이 된다
- `>=768` — 폭이 68ch 에서 멈춘다. `PageShell` 의 `max-w-5xl`(1024px)보다 좁아 좌우에 빈 곳이 생기고, 그것이 의도다 — 이유: 한 줄이 길면 다음 줄의 시작을 놓친다
- 코드 블록만 이 폭을 넘을 수 있고 자기 안에서 가로로 스크롤한다(`[&_pre]:overflow-x-auto`). **페이지 자체는 어느 폭에서도 가로 스크롤하지 않는다**
- 상세 화면의 머리(h1 · 메타 · 태그)도 같은 `max-w-[68ch]` 를 쓴다(`case-detail.tsx:25`, `lab-detail.tsx:13`). 두 폭이 갈리면 제목과 본문의 왼쪽 끝이 어긋난다

## 상호작용

- hover / focus-visible 정의 — 안쪽 `a` 에만 걸린다. Prose 자신은 상호작용 요소가 아니다

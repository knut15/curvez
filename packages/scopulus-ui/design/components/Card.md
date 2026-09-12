# component: Card

purpose: 목록의 항목 하나를 담는 면. 면 전체가 상세로 가는 링크 하나다

## 근거 — 화면에 2번 나온다

`CaseCard` 와 `LabCard` 가 한 글자도 다르지 않은 같은 문자열을 쓴다.

```
flex flex-col gap-2 rounded-lg border border-border bg-card p-5
transition-colors duration-150 ease-out hover:bg-accent
focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring
motion-reduce:transition-none
```

| 파일                                               | 줄  |
| -------------------------------------------------- | --- |
| `apps/handwork/src/entities/case/ui/case-card.tsx` | 16  |
| `apps/handwork/src/entities/lab/ui/lab-card.tsx`   | 16  |

재현: `grep -rn 'rounded-lg border border-border bg-card p-5' apps/handwork/src --include='*.tsx'` → 2줄.

**이 컴포넌트는 면만 갖는다. 안에 무엇이 들어가는지는 모른다.**
`CaseCard` 와 `LabCard` 는 이것 위에 올라가고, 그 둘의 스펙은
[`CaseCard.md`](CaseCard.md) ·
[`LabCard.md`](LabCard.md) 가 정본이다.
**이유:** 두 카드가 다루는 데이터가 다르다(케이스는 `role`, 기록은 `status`). 면과 내용을 한 컴포넌트에
묶으면 세 번째 목록이 생길 때 면을 다시 복사하게 된다.

## props

| 이름     | 타입              | 필수 | 기본값 | 의미                                       |
| -------- | ----------------- | ---- | ------ | ------------------------------------------ |
| href     | `string`          | O    | —      | 면 전체가 이동할 대상. `next/link` 로 간다 |
| children | `React.ReactNode` | O    | —      | 카드 내용. 세로로 쌓이고 사이가 8px 이다   |

**`href` 를 선택으로 만들지 마라.**
**이유:** 화면에 나온 2곳 모두 링크다. 링크가 아닌 카드를 허용하면 같은 면이 어떤 곳에서는 눌리고 어떤 곳에서는
안 눌린다. 그 차이는 화면에서 보이지 않는다.

**`onClick` 을 받지 않는다.**
**이유:** 카드를 `<button>` 이나 `<div onClick>` 으로 만들면 새 탭 열기와 주소 복사가 막힌다.
[`CaseCard.md`](CaseCard.md) 의 `a11y:role` 이 같은 것을 정했다.

**`padding`·`variant` 를 받지 않는다.**
**이유:** 화면에 `p-5` 하나뿐이었다. 두 번째 값이 생기면 목록 화면마다 카드 안쪽 여백이 달라진다.

## states

| state         | 트리거        | 시각 변화                                                                                                                                      |
| ------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| default       | —             | bg=`--card`, border 1px=`--border`, radius `rounded-lg`(10px), 안쪽 여백 20px(`p-5`), 자식 사이 8px(`gap-2`)                                   |
| hover         | 포인터 진입   | bg=`--accent`. 테두리 유지. **이동·그림자·확대 없음**. `transition-colors duration-150 ease-out`                                               |
| focus-visible | 키보드 포커스 | outline 2px + offset 2px, color=`--ring`. `focus-visible:rounded-sm` 을 붙이지 않는다 — 이미 `rounded-lg` 를 가졌다                            |
| pressed       | `:active`     | 시각 변화 없음. 누르면 주소가 바뀌어 화면이 교체된다 — 그 사이를 표시해도 읽히지 않는다                                                        |
| disabled      | 없음          | 비활성 상태가 없다. 목록에 실린 항목은 항상 열린다                                                                                             |
| loading       | 없음          | 콘텐츠가 레포 안 MDX 이고 빌드 시점에 박힌다. 카드가 로딩 중인 구간이 없다                                                                     |
| empty         | 없음          | 항목이 0건이면 Card 가 렌더되지 않는다. 빈 상태는 상위 목록 화면이 문구로 표시한다 — `views/case-index.tsx:15-23`, `views/lab-index.tsx:16-18` |
| error         | 없음          | 데이터가 빌드 시점에 확정된다. 런타임 에러가 없다                                                                                              |

`motion-reduce:transition-none` 을 같은 줄에 둔다. 화면에 나온 2곳 모두 갖고 있다.

**hover 에서 `shadow-*` 를 붙이지 마라.**
**이유:** 이 사이트는 고도를 쓰지 않는다. 근거와 이유는 [`../tokens.md`](../tokens.md) 의 `## 고도` 절이고,
화면에 그림자가 0번 나온다.

## a11y

- a11y:label — 해당 없음. 접근 이름은 `children` 안의 제목 하나로 정해진다. `aria-label` 을 중복 지정하지 마라 — 이유: 보이는 제목과 읽히는 이름이 달라진다
- a11y:focus — **카드당 포커스 대상은 하나다.** `children` 안에 별도 링크·버튼을 두지 마라 — 이유: 카드 하나를 지나가는 데 탭이 여러 번 필요해지고, 중첩 링크는 HTML 이 허용하지 않는다. 포커스 순서는 DOM 순서와 같다
- a11y:contrast — 카드 안 제목 fg=`--card-foreground` / bg=`--card` 라이트 16.73 · 다크 14.84. 보조 텍스트 fg=`--muted-foreground` / bg=`--card` 라이트 5.59 · 다크 7.34. hover 배경 `--accent` 위에서도 같은 조합을 쓴다 — `--accent` 와 `--muted` 는 `globals.css` 에서 같은 값이고 그 쌍의 대비값이 라이트 4.91 · 다크 6.51 이다
- a11y:target — 카드 면 전체가 클릭 영역이라 24x24 를 크게 넘는다. 카드 사이 간격은 `gap-4`(16px)로 인접 8px 규칙을 만족한다 (`views/case-index.tsx:25`, `views/lab-index.tsx:20`)
- a11y:role — `link` (`<a>` 의 암묵 역할). `button` 으로 만들지 마라 — 이유: 새 탭 열기와 주소 복사가 막힌다. 카드를 감싸는 `<li>` 에는 역할을 주지 않는다. 목록 쪽 `<ul role="list">` 가 이미 역할을 갖는다

## responsive

- `<768` — 1열 전체 폭. 카드 높이는 내용에 따라 다르다
- `>=768` — `md:grid-cols-2` 로 2열. 같은 행의 카드 높이가 같아진다. 높이를 맞추는 것은 `h-*` 고정이 아니라 제목 `line-clamp-2` 와 요약 `line-clamp-3` 이다
- 카드가 그리드 칸을 꽉 채우도록 `<li className="flex">` 가 감싼다 (`views/case-index.tsx:27`, `views/lab-index.tsx:22`). 이 `flex` 를 빼면 카드가 내용 높이만큼만 차서 2열의 높이가 달라진다
- 안쪽 여백은 모든 폭에서 20px 고정이다. 화면 좌우 여백(`px-5 md:px-8`)과 달리 분기하지 않는다 — 이유: 화면에 `p-5` 하나뿐이었고, 카드 폭이 이미 그리드로 줄어 있어 안쪽까지 줄이면 내용이 좁아진다
- 3열 이상으로 늘리지 마라 — 이유: 페이지 폭이 `max-w-5xl`(1024px)에서 멈춘다. 3열이면 카드 하나가 320px 아래로 내려가 제목 2줄 제한이 의미를 잃는다

## 상호작용

- hover / focus-visible 정의

# component: PageShell

purpose: 서브 페이지의 바깥 컨테이너 하나. 폭·좌우 여백·세로 여백을 한 자리에 모은다

## 근거 — 화면에 5번 나온다

같은 클래스 문자열이 다섯 파일에서 한 글자도 다르지 않게 반복된다.

```
mx-auto w-full max-w-5xl flex-1 px-5 py-10 md:px-8 md:py-16
```

| 파일                                      | 줄  | 요소     |
| ----------------------------------------- | --- | -------- |
| `apps/handwork/src/app/not-found.tsx`     | 10  | `<main>` |
| `apps/handwork/src/views/case-index.tsx`  | 8   | `<main>` |
| `apps/handwork/src/views/case-detail.tsx` | 24  | `<main>` |
| `apps/handwork/src/views/lab-index.tsx`   | 6   | `<main>` |
| `apps/handwork/src/views/lab-detail.tsx`  | 12  | `<main>` |

재현: `grep -rn 'max-w-5xl flex-1 px-5 py-10 md:px-8 md:py-16' apps/handwork/src --include='*.tsx'` → 5줄.

**랜딩(`/`)은 이것을 쓰지 않는다.** `apps/handwork/src/app/page.tsx:10` 의 `<main>` 은
`flex h-dvh flex-col overflow-hidden` 이라 폭도 여백도 다르다.
**이유:** 랜딩은 배경 사진이 화면을 가득 채우는 한 장이고 스크롤이 없다. 여백을 주면 사진에 테두리가 생긴다.

**푸터도 이것을 쓰지 않는다.** `apps/handwork/src/widgets/site-footer.tsx:8` 은 `max-w-5xl` 과
`px-5 md:px-8` 은 같지만 `flex-1` 이 없고 세로가 `py-8` 이다.
**이유:** 푸터는 남은 높이를 먹지 않는다. `flex-1` 을 주면 본문이 짧을 때 푸터가 늘어난다.

## props

| 이름     | 타입              | 필수 | 기본값 | 의미             |
| -------- | ----------------- | ---- | ------ | ---------------- |
| children | `React.ReactNode` | O    | —      | 페이지 본문 전체 |

**`className` 을 받지 않는다.**
**이유:** 다섯 사용처의 클래스가 전부 같다. 덧붙일 구멍을 열면 그 순간 여섯 번째 값이 생기고,
어느 페이지가 표준인지 판정할 근거가 사라진다. 다른 여백이 필요한 화면이 나오면 그 화면은
PageShell 을 쓰지 않는 화면이다.

**`as` 를 받지 않는다.** 항상 `<main>` 을 렌더한다.
**이유:** 다섯 사용처가 전부 `<main>` 이고, 한 문서에 `<main>` 은 하나여야 한다. 태그를 고를 수 있게
만들면 두 개가 생길 수 있다.

## states

| state         | 트리거 | 시각 변화                                                                           |
| ------------- | ------ | ----------------------------------------------------------------------------------- |
| default       | —      | `mx-auto w-full max-w-5xl flex-1`, 여백 `px-5 py-10` / ≥768 `px-8 py-16`. 배경 없음 |
| hover         | 없음   | 상호작용 요소가 아니다. 포인터에 반응하지 않는다                                    |
| focus-visible | 없음   | 포커스를 받지 않는다. `tabindex` 를 주지 않는다                                     |
| pressed       | 없음   | 누를 수 없다                                                                        |
| disabled      | 없음   | 비활성 개념이 없다. 레이아웃 컨테이너다                                             |
| loading       | 없음   | 자기 데이터가 없다. 안쪽 내용이 로딩 상태를 갖고 껍데기는 그대로 남는다             |
| empty         | 없음   | children 이 비는 경우가 없다. 다섯 사용처 모두 최소 h1 하나를 넣는다                |
| error         | 없음   | 상태를 갖지 않아 실패할 동작이 없다                                                 |

**배경색을 주지 마라.** `<body>` 의 `bg-background` 를 그대로 비춘다
(`apps/handwork/src/app/layout.tsx:34`).
**이유:** 여기에 배경을 주면 본문 영역과 푸터 사이에 보이지 않는 경계가 생기고, 다크에서 그 경계가
1px 줄로 드러난다.

## a11y

- a11y:label — 해당 없음. `<main>` 은 문서에 하나뿐이라 이름이 필요 없다. `aria-label` 을 붙이지 마라 — 이유: 랜드마크가 하나일 때 이름을 주면 스크린리더가 "main, 무엇" 을 두 번 읽는다
- a11y:focus — 포커스 대상이 0개다. 포커스 순서는 children 의 DOM 순서와 같고 PageShell 이 끼어들지 않는다. 스킵 링크를 두지 않는다 — 이유: `SiteHeader` 의 포커스 대상이 4개(로고·Cases·Labs·토글)라 건너뛸 비용이 크지 않다. 근거는 [`SiteHeader.md`](SiteHeader.md) 의 `a11y:focus`
- a11y:contrast — 해당 없음. 자기 색을 갖지 않는다. 안쪽 텍스트의 대비는 `--foreground` / `--background` 라이트 15.82 · 다크 16.13 (`../tokens.md` 의 대비값)
- a11y:target — 해당 없음. 클릭 대상이 아니다
- a11y:role — `main` (landmark). `<div role="main">` 으로 쓰지 마라 — 이유: 요소가 이미 그 역할을 가진다

## responsive

- `<768` — 좌우 20px(`px-5`), 세로 40px(`py-10`), 폭은 화면 전체
- `>=768` — 좌우 32px(`md:px-8`), 세로 64px(`md:py-16`)
- `>=1024` — 폭이 1024px(`max-w-5xl`)에서 멈추고 `mx-auto` 로 가운데 정렬된다. 그 위로는 더 바뀌지 않는다
- 브레이크포인트를 늘리지 마라 — 이유: 폭이 1024px 에서 멈추므로 `lg` 이상에서 바뀔 것이 없다
- `flex-1` 은 `<body class="flex min-h-full flex-col">`(`app/layout.tsx:34`)의 남은 높이를 먹는다. 본문이 짧아도 푸터가 화면 아래에 붙는다

## 상호작용

- 없음. hover / focus-visible 대상이 아니다

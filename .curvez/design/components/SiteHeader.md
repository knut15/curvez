# component: SiteHeader

platform: nextjs
purpose: 모든 화면의 최상단에서 현재 위치와 이동 경로를 주고, 테마 전환을 놓는다

## props

| 이름    | 타입                  | 필수 | 기본값 | 의미                                            |
| ------- | --------------------- | ---- | ------ | ----------------------------------------------- |
| current | home \| cases \| case | X    | home   | 현재 화면. 해당 링크를 aria-current 로 표시한다 |

## states

| state         | 트리거             | 시각 변화                                               |
| ------------- | ------------------ | ------------------------------------------------------- |
| default       | —                  | bg=--brand-canvas, 하단 border=--border 1px             |
| hover         | 링크에 포인터 진입 | 링크 fg=--brand-accent (기본은 --brand-ink)             |
| focus-visible | 키보드 포커스      | outline 2 + offset 2, color=--ring                      |
| pressed       | :active            | 시각 변화 없음                                          |
| disabled      | 없음               | 비활성 상태가 없다. 현재 화면 링크도 클릭 가능하게 둔다 |
| loading       | 없음               | 정적 렌더라 로딩 구간이 없다                            |
| error         | 없음               | 상태를 갖지 않는다                                      |

## a11y

- a11y:label — 로고는 텍스트다. 아이콘 전용이 아니므로 aria-label 을 지정하지 않는다
- a11y:focus — 포커스 순서는 로고 → Cases → Labs → 테마 토글. 스킵 링크를 두지 않는다. 헤더의 포커스 대상이 3개라 본문까지 건너뛸 비용이 크지 않다
- a11y:contrast — 링크 기본 fg=--brand-ink / bg=--brand-canvas (라이트 13.54 · 다크 15.50), hover fg=--brand-accent (라이트 5.15 · 다크 12.46). 실측값이다
- a11y:target — 세로 여백을 바가 아니라 링크가 갖는다(`py-2`). 실측 링크 상자 39x33 · 31x33, 토글 40x40 으로 최소 24x24 를 넘고 간격은 gap-4(16px) 다. 바에 여백을 몰아 주면 링크의 클릭 영역이 글자 높이(11px)에 머문다
- a11y:role — banner (header 요소). 내부는 navigation 하나

## responsive

- nextjs: 모든 폭에서 한 줄. 좌측 로고, 우측 링크 2개와 토글. 항목이 4개라 모바일 메뉴를 만들지 않는다. 좌우 여백 `px-5 md:px-8` — 홈과 서브가 같은 값이어야 한다
- nextjs: **`frontend systems` 태그라인은 640px 미만에서 접는다(`hidden sm:inline`).** 펼친 상태의 최소 한 줄 폭이 440px 라 375px 에서 두 줄이 된다. 접으면 281px 로 내려가 한 줄이 보장된다(실측)
- 바 높이 61px. 세로 여백은 링크의 `py-2` 가 만들고 바는 `py-2.5` 만 갖는다

## platform-diff

- nextjs: hover / focus-visible 정의
- rn: 해당 없음 — 이 프로젝트에 모바일 앱이 없다

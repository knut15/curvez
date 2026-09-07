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
| default       | —                  | bg=--background, 하단 border=--border 1px               |
| hover         | 링크에 포인터 진입 | 링크 fg=--foreground (기본은 --muted-foreground)        |
| focus-visible | 키보드 포커스      | outline 2 + offset 2, color=--ring                      |
| pressed       | :active            | 시각 변화 없음                                          |
| disabled      | 없음               | 비활성 상태가 없다. 현재 화면 링크도 클릭 가능하게 둔다 |
| loading       | 없음               | 정적 렌더라 로딩 구간이 없다                            |
| error         | 없음               | 상태를 갖지 않는다                                      |

## a11y

- a11y:label — 로고는 텍스트다. 아이콘 전용이 아니므로 aria-label 을 지정하지 않는다
- a11y:focus — 포커스 순서는 로고 → 링크 → 테마 토글. 스킵 링크를 두지 않는다. 헤더의 포커스 대상이 3개라 본문까지 건너뛸 비용이 크지 않다
- a11y:contrast — 링크 기본 fg=--muted-foreground / bg=--background 4.5:1 이상 (라이트 4.74, 다크 7.66)
- a11y:target — 링크 높이 44px 확보(py-3 + text-base). 인접 링크 간격 gap-4
- a11y:role — banner (header 요소). 내부는 navigation 하나

## responsive

- nextjs: 모든 폭에서 한 줄. 좌측 로고 + 링크, 우측 끝 토글. 항목이 3개뿐이라 모바일 메뉴를 만들지 않는다. 컨테이너 max-w-5xl · px-4

## platform-diff

- nextjs: hover / focus-visible 정의
- rn: 해당 없음 — 이 프로젝트에 모바일 앱이 없다

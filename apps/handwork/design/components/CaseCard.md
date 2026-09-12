# component: CaseCard

purpose: 케이스 하나를 목록에서 대표한다. 카드 전체가 상세로 가는 하나의 링크다

## props

| 이름    | 타입             | 필수 | 기본값 | 의미                                                |
| ------- | ---------------- | ---- | ------ | --------------------------------------------------- |
| slug    | string           | O    | —      | `/cases/[slug]` 로 이동할 대상                      |
| title   | string           | O    | —      | 케이스 제목. 2줄까지 보이고 넘치면 말줄임           |
| summary | string           | O    | —      | 한 줄 요약. 3줄까지 보이고 넘치면 말줄임            |
| tags    | string[]         | X    | []     | 기술 태그. 3개까지 보이고 나머지는 "+N" 으로 접는다 |
| date    | string (YYYY-MM) | O    | —      | 정렬 기준이자 카드에 표시되는 시점                  |

## states

| state         | 트리거        | 시각 변화                                                          |
| ------------- | ------------- | ------------------------------------------------------------------ |
| default       | —             | bg=--card, border=--border, radius=`rounded-lg`. 칩은 `rounded-sm` |
| hover         | 포인터 진입   | bg=--accent, 테두리 유지. 그림자·이동 없음                         |
| focus-visible | 키보드 포커스 | outline 2 + offset 2, color=--ring                                 |
| pressed       | :active       | 시각 변화 없음. 링크라 누른 상태를 따로 표시하지 않는다            |
| disabled      | 없음          | 이 컴포넌트에 비활성 상태가 없다. 링크는 항상 유효하다             |
| loading       | 없음          | 정적 생성이라 카드가 로딩 중인 구간이 없다                         |
| error         | 없음          | 데이터는 빌드 시점에 확정된다. 런타임 에러가 없다                  |

## a11y

- a11y:label — 카드 전체가 링크다. 접근 이름은 title 하나로 충분하므로 aria-label 을 중복 지정하지 않는다. 태그·날짜는 링크 이름에서 제외한다
- a11y:focus — 카드당 포커스 대상은 **하나**다. 내부에 별도 링크를 두지 않는다. 포커스 순서는 DOM 순서와 같다
- a11y:contrast — 제목 fg=--card-foreground / bg=--card 라이트 16.73 · 다크 14.84. 요약·날짜 fg=--muted-foreground / bg=--card 라이트 5.59 · 다크 7.34. 칩 글자/칩 배경 라이트 4.91 · 다크 6.51. 전부 렌더 화면에서 잰 값이다
- a11y:target — 카드 전체가 클릭 영역이라 24x24 를 크게 넘는다. 카드 사이 간격 gap-4(16px)로 인접 8px 규칙을 만족한다
- a11y:role — link. 카드를 button 으로 만들지 않는다. 새 탭·주소 복사가 막힌다

## responsive

- <768 1열 전체 폭 / >=768 grid 안에서 동일 높이. 제목·요약 줄 수 제한으로 높이를 맞춘다

## 상호작용

- hover / focus-visible 정의

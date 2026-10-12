# component: PageHeader
purpose: 화면 맨 위에 고정된 제목 표시줄. 화면에 따라 뒤로가기·브랜드 마크·액션 메뉴를 더한다. **제목은 모든 variant,
모든 화면 폭에서 항상 헤더 정중앙에 온다**(이번 라운드 지시 "헤더 타이틀은 중앙에 정렬"). 좌/우 zone 에 무엇이
있든(비어 있든) 이 규칙은 깨지지 않는다 — 구현 방법은 아래 `## 레이아웃` 참고
쓰이는 화면: input, input-weeks(variant=title-only), dashboard(variant=dashboard), age-basis·checkups·copay-relief·correction-period(variant=back), share·guide(variant=title-only)
요구 ID: PC-F1-AC6, PC-F1-EX3, PC-F6-AC3, PC-F7-AC1, PC-NF-MOBILE-3, 이번 라운드 CONTEXT(헤더 중앙 정렬)

## 레이아웃 (헤더 가운데 정렬 — 구현 규칙)

- `display: grid; grid-template-columns: minmax(var(--layout-header-side-reserve), 1fr) auto minmax(var(--layout-header-side-reserve), 1fr);`
- 왼쪽 셀(zone-left) = `justify-self: start`. 가운데 셀(zone-title) = `justify-self: stretch; text-align: center;`(트랙 폭 그대로 채운다 — 콘텐츠 폭만큼만 차지하는 `center` 는 제목이 길어지면 좌우 zone 을 침범한다, 2026-09-30 6차 라운드 결함 수정). 오른쪽 셀(zone-right) = `justify-self: end`
- 양쪽 바깥 셀은 `minmax(112px, 1fr)` 로 **항상 같은 최소 폭**을 갖는다(`--layout-header-side-reserve`, tokens.md). 한쪽 zone 이 비어 있어도(예: variant=title-only 는 양쪽 다 비어 있을 수 있다) 이 최소 폭만큼 그대로 비워 둔다 — 그래야 제목이 콘텐츠 유무와 무관하게 기하학적 정중앙에 온다
- 제목 텍스트는 말줄임(단일 줄 ellipsis)을 쓰지 않는다(2026-09-30 6차 라운드 결함 수정 — 이전 규칙은 `correction-period`(360px) 처럼 2줄에도 못 들어가는 제목을 통째로 잘랐다). 대신 `min-width: 0; text-align: center; white-space: normal; overflow-wrap: break-word; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; max-width: min(60vw, 320px);` 로 최대 3줄까지 가운데 정렬 줄바꿈한다. `min-width: 0` 은 그리드 아이템의 자동 최소폭이 트랙을 넓히는 것을 막는다. `overflow-wrap: break-word` 는 keep-all(tokens.md)로도 못 쪼개는, 한 단어가 칸보다 넓은 극단적인 경우에만 개입하는 안전망이다. 현재 9개 화면의 실제 제목 문구는(keep-all 적용 뒤) 전부 3줄 이내에 들어가는 것을 실측했다(`correction-period` 의 "교정연령 적용 종료 안내"(360px)가 가장 길어 정확히 3줄을 채운다) — 3줄을 넘는 문구가 생기면 `-webkit-line-clamp` 기본 동작으로 3번째 줄 끝이 잘린다(이번 실측 범위 밖)
- 헤더 자체는 폭 100%, 내부 콘텐츠(3분할 그리드)는 variant 와 무관하게 `--layout-content-max`(720px)를 넘지 않고 화면 안에서 중앙 정렬된다(≥768px부터 이 상한이 적용된다. 7차 라운드부터 variant=dashboard 도 나머지 variant 와 같은 값을 쓴다 — 이전 라운드는 dashboard 만 1120px 로 더 넓었다). 헤더 배경(`--color-bg-surface`)은 그리드 폭과 무관하게 화면 전체 폭을 채운다

## props
| 이름 | 타입 | 필수 | 기본값 | 의미 |
|---|---|---|---|---|
| variant | title-only \| back \| dashboard | O | — | title-only=제목만(양쪽 zone 비어 있거나 브랜드 마크만). back=뒤로가기(좌)+제목. dashboard=브랜드 마크(좌, 장식)+제목+`HeaderMenu`(우) |
| title | string | O | — | 화면 제목 또는 서비스 이름 |
| onBack | () => void | X(variant=back 일 때 필수) | — | 뒤로가기 클릭 시 이전 화면(항상 /dashboard)으로 이동 |
| onEditProfile | () => void | X(variant=dashboard 일 때 필수) | — | `HeaderMenu` 에 그대로 전달한다("프로필 편집") |
| onDeleteAll | () => void | X(variant=dashboard 일 때 필수) | — | `HeaderMenu` 에 그대로 전달한다("정보 전체 삭제") |
| headingLevel | 1 \| 2 | X | 1 | 제목 요소의 헤딩 레벨. 기본은 이 컴포넌트가 h1 이다. `guide` 화면처럼 본문(content)에 SEO 조합 제목을 h1 으로 따로 두는 화면만 2(h2)로 내려 페이지 안에 h1 이 하나만 있게 한다(2026-09-30 6차 라운드, 구현과 문서를 맞췄다) |

## states
| state | 트리거 | 시각 변화 |
|---|---|---|
| default | — | bg=--color-bg-surface, 하단 border=--color-border-subtle, 높이 --layout-header-height(64px) |
| default(zone-left, variant=back) | — | `Button`(variant=text) 아이콘 `ChevronLeft`(--icon-size-md) + 텍스트 "대시보드"(기존 "← 대시보드"에서 화살표 기호를 아이콘으로 바꿨다. 텍스트는 남는다) |
| default(zone-left, variant=title-only\|dashboard) | — | `IconBadge`(icon="Baby", tone=primary, size=md, 장식) — 서비스 브랜드 마크. `aria-hidden`. title-only 화면 중 공유받는 쪽(share)·SEO 랜딩(guide)은 첫인상이라 브랜드 마크를 꼭 둔다. `--layout-header-side-reserve` 최소 폭 안에서 왼쪽 정렬 |
| default(zone-right, variant=dashboard) | — | `HeaderMenu` 컴포넌트 그대로 |
| default(zone-right, 그 외 variant) | — | 비어 있음(레이아웃 규칙에 따라 최소 폭만 예약되고 내용은 없다) |
| scrolled | content 가 스크롤됨 | 그림자 --elevation-card 추가(경계를 더 뚜렷하게). 색 변화 없음 |
| disabled | 쓰이지 않음 | 해당 없음 |
| error | 쓰이지 않음 | 해당 없음 |

## a11y
- a11y:label — 뒤로가기 버튼은 아이콘 `ChevronLeft` + 텍스트 "대시보드"(아이콘만 쓰지 않는다). "더보기" 액션은 `HeaderMenu` 문서 참고. 브랜드 마크(`IconBadge`)는 `aria-hidden`
- a11y:focus — variant=back 이면 이 화면의 첫 포커스 대상이 뒤로가기 버튼이다. variant=dashboard 는 브랜드 마크(포커스 대상 아님) 다음, 제목(포커스 대상 아님) 다음으로 `HeaderMenu` 트리거가 온다
- a11y:contrast — 제목 텍스트 `--color-text-primary/--color-bg-surface` = 15.17. 뒤로가기 텍스트 "대시보드"도 같은 조합 = 15.17
- a11y:target — 뒤로가기·액션 버튼 높이 48px, 좌우 여백 --space-4
- a11y:role — banner(header 요소). 내부 버튼은 button. 제목 요소는 `headingLevel` 에 따라 h1(기본) 또는 h2(`guide`)이며, 페이지 전체에 h1 은 항상 하나만 존재해야 한다

## responsive
- <768: 제목 max-width 규칙(위 레이아웃) 그대로. 좌우 안쪽 여백 --space-4(16px)
- 768~1279: 헤더 내부 콘텐츠 폭 최대 --layout-content-max(720px) 중앙 정렬, 좌우 안쪽 여백 --space-4(16px) 그대로(variant 와 무관하게 모든 화면이 같은 값을 쓴다 — dashboard 도 이제 1열이라 헤더가 항상 1열이라는 전제가 더 단순해졌다)
- >=1280: 헤더 내부 콘텐츠 폭 최대 --layout-content-max(720px)로 variant 와 무관하게 중앙 정렬(이전 라운드는 variant=dashboard 만 1120px 로 더 넓었으나 7차 라운드부터 예외를 없앴다). 좌우 안쪽 여백 --space-6(32px)

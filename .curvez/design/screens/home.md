# screen: home

platform: nextjs
route(nextjs): /
route(rn): 해당 없음 — profile 의 stack 이 nextjs 라 모바일 앱이 없다
goal: 방문자가 스크롤 없이 한 화면에서 이름·한 문장·연락처를 받는다. 이 화면은 브랜드 화면이고 목록이 아니다
entry: 직접 방문 · 이력서/프로필의 링크
exit: "케이스" → case-index · GitHub → 외부

## layout

**스크롤이 없다.** `h-dvh` 안에서 끝나고 넘치는 것은 자른다. 케이스 카드는 이 화면에 두지 않는다 —
목록을 얹는 순간 브랜드 화면이 아니라 인덱스가 된다.

- region: bar
  - role: 화면 전체를 가로지르는 상단 바. 좌측 `handwork® frontend systems`, 우측 케이스 링크와 테마 토글
  - priority: 3
  - **홈·서브가 같은 `SiteHeader` 를 쓴다.** 좌우 여백 `px-5 md:px-8` 이 모든 화면에서 같아야 하고, 컴포넌트를 나누면 그 값이 조용히 갈린다
  - **홈에서 테마가 바꾸는 것은 이 바뿐이다.** 배경은 사진이라 테마를 따를 대상이 없다
- region: backdrop
  - role: 배경 세 장이 24초 주기로 번갈아 뜬다
  - priority: 1
  - 1층 `polygon-field-plain.webp` — 조각 필드 사진. 항상 아래에 깔린다
  - 2층 `mark-field.svg` — 플랫 그래픽. 단색 `#85C7BF` 필드에 검은 형상, 중앙 넥타이만 코랄 `#FF6B4A`. 형상은 하단 52% 에만 두어 워드마크와 겹치지 않게 한다
  - 3층 `campaign-wall.webp` — 단색 벽 캠페인 사진
  - 각 8초 노출 · 페이드 1.2초 · `opacity` 만 움직인다 · `prefers-reduced-motion` 에서는 2·3층을 끄고 1층만 남긴다
- region: wordmark
  - role: 화면 한가운데. 사진 위에 면 없이 직접 얹는다
  - priority: 2
  - content: `handwork`, **W 한 글자만 코랄** `#FF6B4A`, 나머지는 `#101514`
  - type: Pretendard 900, `clamp(2.1rem, 9vw, 6.6rem)`, `tracking-[-0.03em]`
  - **밑줄 띠와 캡션을 두지 않는다.** 워드마크 하나로 끝낸다

**스크림을 두지 않는다.** 배경을 덮지 않기로 한 결정이라, 대비는 배경이 그대로 정한다.

## states

- state:default — 항상 이 상태다. 데이터에 의존하지 않는다
- state:loading — 1층 이미지에만 `priority` 를 준다. 2·3층은 8초 뒤에야 보이므로 첫 화면을 늦출 이유가 없다. 스켈레톤은 두지 않는다
- state:empty — 이 화면에는 빈 상태가 없다. 표시할 목록이 없다
- state:error — 이 화면에는 에러 상태가 없다. 배경이 실패해도 워드마크와 상단 바는 그대로 읽힌다

## responsive

- nextjs: 어느 폭에서도 이미지가 전면이고 워드마크는 가운데다
- nextjs: 워드마크 clamp 3.5rem ~ 11rem (15vw), 띠는 `min(18rem, 60vw)`
- 어느 폭에서도 세로 스크롤이 생기지 않는다

## a11y

- focus-order: bar.cases → bar.theme. 이 화면의 포커스 대상은 둘뿐이다 — 워드마크 영역에는 링크가 없다
- 이미지에 alt 를 준다. 장식이 아니라 브랜드가 말하려는 내용이다
- landmark: main 하나. 이 화면에는 header·footer 를 두지 않는다 — 사이트 헤더는 케이스 화면부터 나온다
- 이미지는 배경이 아니라 `<Image>` 요소다. alt 를 주고 장식으로 숨기지 않는다
- a11y:contrast — 상단 바 15.0(고정). 워드마크는 사진 위이므로 미달 픽셀 비율로 판정한다
  - 1층 조각 필드: 검은 글씨 3:1 미달 **7.12%** · 하위 5% 2.12
  - 2층 플랫 그래픽: 단색 `#85C7BF` 위 검은 글씨 **9.58**, 균일
  - 3층 캠페인 사진: 가운데 3:1 미달 **23.5%** — 인물이 가운데라 그렇다. **가려져도 된다는 결정**이라 그대로 둔다
  - 코랄 W 는 teal 계열 배경과 명도가 가까워 검은 글자보다 흐리게 읽힌다. 강조가 목적이라 감수한다

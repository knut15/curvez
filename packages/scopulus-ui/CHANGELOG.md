# 변경 이력

[Keep a Changelog](https://keepachangelog.com/ko/1.1.0/) 형식을 따른다.
버전은 [유의적 버전](https://semver.org/lang/ko/)이다.

`## [0.2.0] - 2026-09-12

### Added

- 컴포넌트 18종 — `AspectRatio` · `Avatar` · `Breadcrumbs` · `ButtonGroup` · `Empty` ·
  `Field` · `Indicator` · `InputGroup` · `Kbd` · `Label` · `Loading` · `Menu` · `Progress` ·
  `Radio` · `Range` · `Stat` · `Steps` · `Timeline`
- `AppLink` 에 `cta` · `cta-quiet` variant
- `buttonClass` export

### Changed

- 문서 사이트 컴포넌트 원고를 props 표와 예제만 남기는 형식으로 교체
- 컴포넌트 목록을 묶음별 사이드바와 미리보기 격자로 교체
- 헤더 높이를 64px 로 고정

### Fixed

- 앱 CSS 에 `@source` 를 더해 라이브러리 클래스가 생성되지 않던 문제
- 왼쪽 목록을 레이아웃으로 올려 라우트를 옮길 때마다 스크롤이 초기화되던 문제
- 컴포넌트 상세에서 `Prose` 를 빼 제목과 본문 왼쪽이 96px 어긋나던 문제

## [0.1.0] - 2026-09-11

### Added

- 컴포넌트 20종 — `Alert` · `AppLink` · `Badge` · `Button` · `Card` · `Checkbox` · `Dialog` ·
  `Input` · `PageShell` · `PageTitle` · `Popover` · `Prose` · `Select` · `Separator` ·
  `Skeleton` · `Switch` · `Table` · `Textarea` · `ThemeToggle` · `Tooltip`
- `tokens.css` — 색과 반경 토큰
- 스토리북과 스토리마다 도는 axe 접근성 검사
- `scripts/check-contrast.mjs` — 대비 쌍과 토큰 hex 동기 검사
- `scripts/export-tokens.mjs` — W3C Design Tokens JSON 출력

### Changed

- `Button` 에 `outline` variant 와 `icon-sm` size 를 되살렸다
- `Button` 의 `onClick` · `children` 을 선택으로 내리고 `className` 을 열었다

### Removed

- handwork 의 `CaseCard` · `LabCard` 스토리

[0.2.0]: https://github.com/knut15/curvez/releases/tag/scopulus-ui%400.2.0
[0.1.0]: https://github.com/knut15/curvez/releases/tag/scopulus-ui%400.1.0

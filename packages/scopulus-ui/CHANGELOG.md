# 변경 이력

[Keep a Changelog](https://keepachangelog.com/ko/1.1.0/) 형식을 따른다.
버전은 [유의적 버전](https://semver.org/lang/ko/)이다.

**손으로 쓴다.** 도구가 생성하지 않는다 — npm 으로 발행하지 않으므로 자동화가 치를 값이
비용보다 작다. 대신 `scripts/check-version.mjs` 가 최상단 버전과 `package.json` 을 대조한다.

## [0.1.0] - 2026-09-11

첫 판. handwork 안에 있던 컴포넌트를 독립 라이브러리로 뽑고 11종을 더했다.

### Added

- **handwork 화면에서 실측해 뽑은 컴포넌트 9종** — `AppLink` · `Badge` · `Button` · `Card` ·
  `PageShell` · `PageTitle` · `Prose` · `Separator` · `ThemeToggle`.
  각 스펙의 `## 근거` 절에 같은 클래스 문자열이 몇 번 반복됐는지 `파일:줄` 로 적혀 있다
- **shadcn `base-nova` 에서 받은 컴포넌트 11종** — 폼(`Input` · `Textarea` · `Checkbox` ·
  `Switch` · `Select`) · 오버레이(`Dialog` · `Tooltip` · `Popover`) ·
  피드백(`Alert` · `Skeleton`) · 데이터(`Table`).
  **이 11종은 실측 근거가 없다.** 각 스펙에 `handwork 사용처: 0곳` 으로 명시돼 있다
- `src/tokens.css` — 색·반경 토큰의 정본. 쓰는 앱이 `@import "@scopulus/ui/tokens.css"` 한다
- 스토리북 + 스토리마다 도는 axe 접근성 검사 + 브라우저에서 실행되는 스토리 테스트
- `scripts/check-contrast.mjs` — 대비 쌍과 토큰 hex 동기를 검사한다
- `scripts/export-tokens.mjs` — Figma Variables 로 가져갈 W3C Design Tokens JSON 을 낸다

### Changed

- `Button` 의 `outline` variant 와 `icon-sm` size 를 되살렸다. 처음 뺀 근거는 "버튼이 들어갈
  자리가 둘뿐" 이었는데 `Dialog` 가 세 번째 사용처가 됐다
- `Button` 의 `onClick` · `children` 을 선택으로 내리고 `className` 을 열었다.
  Base UI 의 `render` 패턴이 바깥에서 주입하는데 필수로 두면 조합이 불가능하다

### Removed

- handwork 의 `CaseCard` · `LabCard` 스토리. 두 카드는 handwork 의 도메인 타입을 쓰므로
  라이브러리로 올리지 않았고, 스토리북은 라이브러리로 갔다. **스펙은 handwork 에 남아 있다**

### 아직 없는 것

- 시각 회귀(Chromatic) — 픽셀 단위 변화는 잡히지 않는다
- 커버리지 리포트 — `@vitest/coverage-v8` 이 더 필요하다
- npm 발행 — 워크스페이스 안에서만 쓴다

[0.1.0]: https://github.com/knut15/curvez/releases/tag/scopulus-ui%400.1.0

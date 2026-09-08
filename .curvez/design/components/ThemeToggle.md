# component: ThemeToggle

platform: nextjs
purpose: 라이트·다크를 전환한다. 선택은 브라우저에 남고 다음 방문에 이어진다

## props

| 이름 | 타입 | 필수 | 기본값 | 의미                                           |
| ---- | ---- | ---- | ------ | ---------------------------------------------- |
| 없음 | —    | —    | —      | 상태를 스스로 읽고 쓴다. 부모가 넘길 값이 없다 |

라이브러리는 `next-themes` 를 쓴다. 직접 만들지 않는다.
**이유:** 서버에서 렌더한 마크업과 브라우저의 저장값이 다르면 첫 프레임에 라이트가 번쩍 스치는데,
그것을 막는 인라인 스크립트 삽입이 이 라이브러리의 존재 이유다. 벤더 사본
`plugins/curvez/vendor/emilkowalski-skills/pick-ui-library/SKILL.md` 가 같은 것을 지목한다.

## states

| state         | 트리거        | 시각 변화                                                                                                                                                                             |
| ------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| default       | —             | 현재 테마의 반대 아이콘 하나. bg 투명, fg=--muted-foreground                                                                                                                          |
| hover         | 포인터 진입   | bg=--accent, fg=--accent-foreground                                                                                                                                                   |
| focus-visible | 키보드 포커스 | outline 2 + offset 2, color=--ring                                                                                                                                                    |
| pressed       | :active       | 시각 변화 없음                                                                                                                                                                        |
| disabled      | 없음          | 비활성 상태가 없다                                                                                                                                                                    |
| loading       | 없다          | 두 아이콘을 다 렌더하고 `.dark` 클래스로 CSS 가 고른다. next-themes 가 첫 페인트 전에 그 클래스를 붙이므로 자바스크립트 상태 없이 맞는 아이콘이 나온다. 마운트 전 빈 상자가 필요 없다 |
| error         | 없음          | 실패할 동작이 아니다                                                                                                                                                                  |

## a11y

- a11y:label — 아이콘 전용이라 `aria-label` 필수. 원문 "테마 전환". 현재 테마를 라벨에 넣지 않는다 — 아이콘과 라벨이 서로 다른 시점에 갱신되면 스크린리더가 반대로 읽는다
- a11y:focus — 헤더 링크 다음, 본문 앞. 누른 뒤에도 포커스를 잃지 않는다
- 토글 방향은 `document.documentElement.classList` 를 읽어 정한다. `resolvedTheme` 은 하이드레이션 전에 `undefined` 라 그 값으로 뒤집으면 첫 클릭이 반대로 간다
- a11y:contrast — fg=--muted-foreground / bg=--background 라이트 5.28 · 다크 7.97. hover 는 fg=--accent-foreground / bg=--accent
- a11y:target — 40x40 px (`size-10`). 24x24 최소를 넘고 헤더 링크와 gap-4 로 8px 이상 떨어진다
- a11y:role — button. 링크가 아니다. 주소가 바뀌지 않는다

## responsive

- nextjs: 모든 폭에서 동일. 모바일에서도 헤더에 남는다

## platform-diff

- nextjs: hover / focus-visible 정의
- rn: 해당 없음 — 이 프로젝트에 모바일 앱이 없다

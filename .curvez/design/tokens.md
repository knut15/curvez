# 디자인 토큰

정본은 `apps/handwork/src/app/globals.css` 다. 이 표는 그 파일의 값을 **읽기 쉬운 hex 로 옮긴 사본**이고,
값이 갈리면 CSS 가 이긴다. 원본은 `oklch()` 로 적혀 있다.

## 이름 규칙 — curvez 기본형을 쓰지 않는다

curvez 규약의 토큰 이름은 `--<category>-<role>-<variant>` 이지만, 여기서는 **shadcn 이 정한 이름을
그대로 쓴다**(`--background`, `--muted-foreground` …).

**이유:** 이 이름들은 Tailwind 테마와 shadcn 컴포넌트가 직접 참조한다(`bg-background`,
`text-muted-foreground`). 이름을 바꾸면 `shadcn add` 로 받은 컴포넌트가 전부 동작하지 않아,
컴포넌트를 받을 때마다 손으로 고쳐야 한다. 규약의 의도(값-이름 금지, 의미로 짓기)는 shadcn 이름도
이미 지키고 있다 — `--muted-foreground` 는 역할 이름이지 색 이름이 아니다.

## 색

| 토큰                 | 라이트          | 다크                   | 용도                                                      |
| -------------------- | --------------- | ---------------------- | --------------------------------------------------------- |
| --background         | #FFFFFF         | #0A0A0A                | 화면 최하단 배경                                          |
| --foreground         | #0A0A0A         | #FAFAFA                | 본문 텍스트                                               |
| --card               | #FFFFFF         | #171717                | 카드 배경. 라이트에서는 캔버스와 같고 테두리로만 구분된다 |
| --card-foreground    | #0A0A0A         | #FAFAFA                | 카드 안 본문                                              |
| --primary            | #171717         | #E5E5E5                | 주요 CTA 배경                                             |
| --primary-foreground | #FAFAFA         | #171717                | 주요 CTA 라벨                                             |
| --muted              | #F5F5F5         | #262626                | 보조 배경(태그 칩, 코드 블록)                             |
| --muted-foreground   | #737373         | #A1A1A1                | 보조 설명, 메타 정보                                      |
| --accent             | #F5F5F5         | #262626                | hover 배경                                                |
| --accent-foreground  | #171717         | #FAFAFA                | hover 상태의 텍스트                                       |
| --destructive        | #E7000B         | #FF6467                | 파괴적 행동. v1 화면에는 쓰이지 않는다                    |
| --border             | #E5E5E5         | rgba(255,255,255,0.10) | 구분선·카드 테두리. 다크는 흰색 10% 알파다                |
| --ring               | #A1A1A1         | #737373                | 포커스 링                                                 |
| --radius             | 0.625rem (10px) | 0.625rem (10px)        | 카드·버튼 기준 반경                                       |

**다크의 `--border` 는 알파값이다.** hex 로 옮길 수 없어 rgba 로 적었다. 대비 검증에서 제외한다 —
알파 위 실제 색은 배경에 따라 달라져 고정 쌍으로 계산되지 않는다.

## 간격·타이포는 새 토큰을 만들지 않는다

Tailwind 4 의 기본 스케일을 그대로 쓴다. 값을 고정할 자리만 아래로 못박는다.

| 대상           | 값                                          | 근거                               |
| -------------- | ------------------------------------------- | ---------------------------------- |
| 본문 폭        | `max-w-[68ch]`                              | 읽기 폭. 케이스 본문에만 적용한다  |
| 페이지 폭      | `max-w-5xl` (1024px)                        | 목록·홈의 바깥 컨테이너            |
| 섹션 세로 간격 | `py-16` (64px) / 모바일 `py-10` (40px)      | 4pt 그리드                         |
| 요소 간 간격   | `gap-2` / `gap-4` / `gap-8` 세 단계만       | 단계를 늘리면 판정 기준이 사라진다 |
| 제목           | `text-4xl` / `text-2xl` / `text-lg` 세 단계 | 홈 h1 / 섹션 h2 / 카드 제목        |

**이유:** 한 곳에서만 쓰는 값을 토큰으로 올리면 이름만 늘고 의미는 안 는다. 세 곳 이상에서
같은 값이 필요해지는 순간 그때 승격한다.

## 대비 검증

- fg=#0A0A0A bg=#FFFFFF mode=light min=4.5 # 본문/캔버스
- fg=#737373 bg=#FFFFFF mode=light min=4.5 # 보조/캔버스
- fg=#FAFAFA bg=#171717 mode=light min=4.5 # CTA 라벨/CTA 배경
- fg=#FAFAFA bg=#0A0A0A mode=dark min=4.5 # 본문/캔버스
- fg=#A1A1A1 bg=#0A0A0A mode=dark min=4.5 # 보조/캔버스
- fg=#171717 bg=#E5E5E5 mode=dark min=4.5 # CTA 라벨/CTA 배경
- fg=#FAFAFA bg=#171717 mode=dark min=4.5 # 카드 본문/카드 배경

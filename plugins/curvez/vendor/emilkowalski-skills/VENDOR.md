# emilkowalski-skills — 벤더링 기록

curvez 가 직접 만들지 않고 **복사해 들여온** 스킬이다. 원본이 개정되면 이 사본은 낡는다.
낡았는지 대조할 수 있도록 아래 값을 반드시 유지한다.

| 항목      | 값                                                                |
| --------- | ----------------------------------------------------------------- |
| 원본      | [`emilkowalski/skills`](https://github.com/emilkowalski/skills)    |
| 원본 커밋 | **`d23d7f88a2e21c9e4b1418c7abe420f5c1052ba7`** (`main`, 2026-08-21) |
| 복사 시점 | **2026-09-07**                                                    |
| 라이선스  | MIT — `LICENSE` 원문을 그대로 함께 둔다                           |
| 저자      | Emil Kowalski (https://emilkowal.ski)                             |

원본에 릴리스 태그가 없다. 그래서 버전 대신 **커밋 해시**로 고정한다.

## 왜 들여왔나

curvez 에는 **모션과 시각 디테일의 기준**이 없었다. `wireframe-spec` 은 화면 구조·토큰·컴포넌트
스펙을 값으로 확정하지만, 그 값이 **움직일 때** 무엇이 맞는지는 다루지 않는다. 이징을 무엇으로 할지,
얼마나 빠를지, 애초에 움직여야 하는지가 비어 있었다. 구현 에이전트(`curvez-nextjs`)는
그 판단을 각자 추측해 왔다.

이 사본은 그 판단을 **조회 가능한 값**으로 준다 — 빈도별 애니메이션 여부 표, 요소별 지속 시간 예산,
정확한 `cubic-bezier` 값, 자동 차단 목록.

## 들여온 것

curvez 에 없던 축만 골랐다. 이미 있는 것(요구사항·아키텍처·구현·QA·구조 리뷰·회고)은 들여오지 않는다.

| 스킬                           | 원본 경로                             | curvez 에 없던 축                              |
| ------------------------------ | ------------------------------------- | ---------------------------------------------- |
| `emil-design-eng`              | `skills/emil-design-eng`              | UI 디테일·컴포넌트 설계 철학과 리뷰 표 형식    |
| `animate`                      | `skills/animate`                      | 웹 애니메이션을 값으로 정해 구현하는 절차      |
| `review-animations`            | `skills/review-animations`            | 모션 코드 단건 리뷰 기준                       |
| `improve-animations`           | `skills/improve-animations`           | 코드베이스 모션 감사 → 실행 계획서 생산        |
| `find-animation-opportunities` | `skills/find-animation-opportunities` | 모션이 없는데 있어야 할 곳 탐색과 기각 목록    |
| `animation-vocabulary`         | `skills/animation-vocabulary`         | 모션 효과의 이름을 찾는 역방향 사전            |
| `apple-design`                 | `skills/apple-design`                 | 제스처·스프링·중단 가능성의 Apple 원칙         |
| `prototype`                    | `skills/prototype`                    | 같은 UI 를 서로 다른 방향으로 발산시켜 고르기  |
| `pick-ui-library`              | `skills/pick-ui-library`              | 작업 → 라이브러리 큐레이션 조회                |

`pick-ui-library` 는 애니메이션도 디자인도 아니지만 함께 들여왔다. `animate/SKILL.md` 3단계가
"컴포넌트가 필요하면 멈추고 `pick-ui-library` 를 부르라"고 참조하기 때문이다. 빼면 사본 안의 참조가
끊긴다. 다만 그 목록은 저자 개인의 선택(`Sonner` 는 저자 본인 라이브러리)이므로, 프로젝트에 이미
다른 라이브러리가 깔려 있으면 그쪽을 따른다.

## 들여오지 않은 것

원본에 있지만 뺀 것은 둘이다.

| 스킬          | 뺀 이유                                                                     |
| ------------- | --------------------------------------------------------------------------- |
| `write-swift` | Swift 언어 가이드. curvez 가 다루는 스택(Next.js)과 무관하다                |
| `ask-sonner`  | 단일 라이브러리 사용 설명서. 애니메이션·디자인 기준이 아니라 API 레퍼런스다 |

## 원본이 바뀌었는지 확인하는 법

```bash
git ls-remote https://github.com/emilkowalski/skills.git HEAD
```

출력된 해시가 위 표의 커밋과 다르면 이 사본이 낡은 것이다. 그때 아래를 실행해 차이를 본다.

```bash
git clone --depth 1 https://github.com/emilkowalski/skills.git /tmp/emilkowalski-skills
diff -r /tmp/emilkowalski-skills/skills/animate \
        plugins/curvez/vendor/emilkowalski-skills/animate
```

## 어떻게 쓰나

curvez 스킬처럼 발화로 자동 호출되지 않는다. `skills/` 가 아니라 `vendor/` 아래에 두는 것이
사본을 그대로 유지하는 방법이기 때문이다. 쓰려면 파일을 직접 읽는다.

| 하려는 일                       | 읽을 파일                                                             |
| ------------------------------- | --------------------------------------------------------------------- |
| 애니메이션을 새로 만든다        | `animate/SKILL.md` → 해당하면 `animate/RECIPES.md`                    |
| 만든 모션을 리뷰한다            | `review-animations/SKILL.md` + `review-animations/STANDARDS.md`       |
| 코드베이스 모션을 감사한다      | `improve-animations/SKILL.md` + `AUDIT.md` + `PLAN-TEMPLATE.md`       |
| 어디에 모션을 넣을지 찾는다     | `find-animation-opportunities/SKILL.md`                               |
| UI 디테일 판단이 필요하다       | `emil-design-eng/SKILL.md`                                            |

`SKILL.md` 는 결정 순서만 담고 값 카탈로그는 옆 파일에 있다. 필요할 때만 옆 파일을 연다 —
원본이 그렇게 설계돼 있고, 그대로 따르는 것이 컨텍스트를 아끼는 방법이다.

## 손대지 않는다

**사본을 고치지 않는다.** 고치면 원본과 대조할 수 없게 되고, 그 순간 벤더링이 아니라 포크가 된다.
curvez 규약에 맞게 바꿔야 할 것이 생기면 사본을 고치지 말고 `skills/` 아래에 curvez 스킬을 새로 만들어
이 사본을 참조하게 한다.

원본이 curvez 와 어긋나는 지점이 둘 있다. 사본을 고치지 말고 여기 적어 둔다.

- **보고 언어.** 원본은 영어로 쓰라고 하지 않지만 예시가 전부 영어다. curvez 규약(한글 보고)이
  우선한다. 코드·식별자·`cubic-bezier` 값은 원문 그대로 둔다.
- **토큰 출처.** 원본은 "코드베이스에 이징 토큰이 이미 있으면 그것을 쓰고 병렬 체계를 만들지 마라"고
  한다. curvez 프로젝트에서는 `.curvez/design/` 이 그 정본이다. 값이 부딪히면 `.curvez/design/` 이
  이긴다.

# 아키텍처

`handwork` 는 **FSD(Feature-Sliced Design)** 로 간다. curvez 는 DDD 프리셋만 갖고 있어 이 구조는
인터뷰로 직접 정의했다. 판정 기준은 아래 `## 금지 import` 표 하나이고, 그 표가 lint 로 강제된다.

## 레이어 정의

안쪽(오래 사는 것)에서 바깥쪽(자주 바뀌는 것) 순서다.

| #   | 레이어     | 디렉터리                     | 담는 것                                                  |
| --- | ---------- | ---------------------------- | -------------------------------------------------------- |
| 1   | `shared`   | `apps/handwork/src/shared`   | 도메인을 모르는 것. UI 프리미티브, 유틸, 상수, 타입      |
| 2   | `entities` | `apps/handwork/src/entities` | 업무 대상 하나의 모델과 그 표현. 예: 케이스 스터디, 태그 |
| 3   | `features` | `apps/handwork/src/features` | 사용자가 하는 행위 하나. 예: 케이스 필터링, 테마 전환    |
| 4   | `widgets`  | `apps/handwork/src/widgets`  | 여러 feature·entity 를 묶은 화면 조각. 예: 헤더, 목록    |
| 5   | `views`    | `apps/handwork/src/views`    | 한 페이지의 조립. 라우트당 하나                          |
| 6   | `app`      | `apps/handwork/src/app`      | Next.js 라우팅, 레이아웃, 전역 프로바이더                |

**FSD 표준의 `pages` 층을 `views` 로 바꿨다.** Next.js App Router 에서 `pages` 는 Pages Router 의
예약된 이름이라 같은 트리에 두면 어느 쪽 규약인지 읽는 사람마다 다르게 읽는다.

공유 코드가 두 번째 사용처를 만나면 `shared` 가 아니라 `packages/*` 로 올린다. 경계 규칙은
[packages/README.md](../packages/README.md) 가 정본이다.

## 의존 방향

**한 방향이다. 위 표의 번호가 큰 쪽이 작은 쪽을 import 한다.**

```
app → views → widgets → features → entities → shared
```

- 같은 층의 다른 슬라이스끼리는 import 하지 않는다. 필요하면 한 층 아래로 내린다
- 역방향은 전부 금지다. 아래 표가 그것을 검사한다
- `packages/*` 는 모든 층에서 **패키지 이름으로만** 부른다. 상대 경로로 넘어가지 않는다

## 금지 import

세 번째 열은 `grep -E` 와 ESLint `no-restricted-imports` 에 그대로 들어간다.

| 규칙 ID  | 검사 경로                   | 금지 패턴 (ERE)                                       | 이유                                                     |
| -------- | --------------------------- | ----------------------------------------------------- | -------------------------------------------------------- |
| ARCH-001 | apps/handwork/src/shared/   | from ['\"]@/(app\|views\|widgets\|features\|entities) | shared 가 상위 층을 알면 어디서도 재사용할 수 없다       |
| ARCH-002 | apps/handwork/src/entities/ | from ['\"]@/(app\|views\|widgets\|features)           | entities 는 행위를 모른다. 알면 행위마다 모델이 갈라진다 |
| ARCH-003 | apps/handwork/src/features/ | from ['\"]@/(app\|views\|widgets)                     | feature 가 화면 조립을 알면 다른 화면에 못 붙는다        |
| ARCH-004 | apps/handwork/src/widgets/  | from ['\"]@/(app\|views)                              | widget 이 페이지를 알면 그 페이지 전용이 된다            |
| ARCH-005 | apps/handwork/src/          | from ['\"]\.\./\.\./                                  | 두 단계 이상 올라가는 상대 경로는 층 경계를 우회한다     |
| ARCH-006 | packages/                   | from ['\"]@/                                          | 패키지가 앱의 alias 를 쓰면 그 앱 없이는 빌드되지 않는다 |

## 폴더 구조

```
apps/handwork/src/
├── app/          # Next 라우팅 · layout.tsx · globals.css
├── views/        # 라우트당 한 조립
├── widgets/      # 화면 조각
├── features/     # 행위
├── entities/     # 업무 대상
└── shared/       # 도메인을 모르는 것
```

각 층 아래는 슬라이스(도메인 이름) → 세그먼트(`ui` / `model` / `api` / `lib`) 순으로 나눈다.
슬라이스가 하나뿐인 동안은 세그먼트를 만들지 않는다 — 쓰이지 않는 빈 디렉터리는 규약이 아니라 잡음이다.

## 스택 매핑

| `profile.json` | 값              | 이 문서에서                                                                               |
| -------------- | --------------- | ----------------------------------------------------------------------------------------- |
| `stack`        | `nextjs`        | 웹 단일                                                                                   |
| `paths.web`    | `apps/handwork` | 위 모든 경로의 접두                                                                       |
| `architecture` | `ddd`           | **실제 구조는 FSD 다.** profile 의 값은 curvez 가 아는 프리셋 이름이고 이 문서가 정본이다 |

## 예외

- **`app` 층은 Next.js 규약을 그대로 따른다.** `layout.tsx`·`page.tsx`·`route.ts` 의 이름과 위치는
  프레임워크가 정하므로 FSD 세그먼트 규칙을 적용하지 않는다
- **`shared` 는 `next/*` 와 `react` 를 import 해도 된다.** 프레임워크 비종속을 목표로 하지 않는다 —
  이 앱은 Next 를 갈아탈 계획이 없고, 그 제약을 걸면 UI 프리미티브를 shared 에 둘 수 없다

- **`entities/*/ui` 는 `next/*` 를 참조해도 된다.** 모델과 API(`entities/*/model`, `entities/*/api`)는
  참조하지 않는다. FSD 의 entity UI 는 표현 계층이라 `next/link` 없이 링크를 그릴 수 없고, 프레임워크와
  무관해야 하는 진짜 이유(테스트·재사용)는 모델과 API 에만 걸린다
  - 검사: `grep -rn 'from "next/' apps/handwork/src/entities/*/api apps/handwork/src/entities/*/model` 가 0건

## 권고

정규식으로 검사할 수 없어 lint 에 걸지 않는다. 리뷰에서 본다.

- 같은 층 안에서 슬라이스끼리 부르지 않는다 (import 경로만으로는 같은 층인지 판정되지 않는다)
- `views` 는 조립만 한다. 데이터 가공은 한 층 아래에서 끝낸다

## 결정 로그

| 무엇을                                                    | 왜                                                                                                       | 되돌릴 위치                         |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| FSD 를 쓴다. DDD 프리셋을 쓰지 않는다                     | 사용자 선택. 포트폴리오 사이트에 domain/application 분리는 과하고, "왜 FSD 인가" 를 ADR 로 남길 계획이다 | .curvez/architecture.md:레이어 정의 |
| FSD 의 `pages` 층을 `views` 로 개명                       | Next App Router 에서 `pages` 는 Pages Router 의 예약 이름이라 같은 트리에서 뜻이 갈린다                  | .curvez/architecture.md:레이어 정의 |
| 공유 코드는 `packages/*` 로 자른다                        | 사용자 선택. npm 퍼블리시까지 갈 계획이라 경계를 package.json 으로 기계적으로 강제한다                   | .curvez/architecture.md:의존 방향   |
| 금지 import 를 ESLint `no-restricted-imports` 로 강제한다 | 사용자 선택. 문서에만 있는 규칙은 위반해도 아무 일이 없다                                                | apps/handwork/eslint.config.mjs     |
| `shared` 에서 프레임워크 import 를 허용한다               | 프레임워크 교체를 목표로 하지 않는다. 금지하면 UI 프리미티브를 shared 에 둘 수 없다                      | .curvez/architecture.md:예외        |
| `profile.json` 의 `architecture` 는 `ddd` 로 둔다         | curvez 가 아는 값의 집합에 `fsd` 가 없다. 실제 구조의 정본은 이 문서다                                   | .curvez/profile.json:architecture   |

## preemie-calc

`apps/preemie-calc`(이른둥이 육아 계산기)도 handwork 와 같은 FSD 로 간다. 2026-09-29 사용자가 "handwork와 같은 FSD" 를 골랐다.
레이어 이름, `views` 개명, 의존 방향은 위 handwork 절과 같다. 이 절은 경로를 `apps/preemie-calc/src` 로 바꾸고,
1단계 구현이 쓸 데이터 모양을 이름 붙여 정한다. 1단계는 SPEC 버전 2 기준 F1~F8, F10, F13~F15 다.
2026-09-30 버전 2 에서 F8(성장 백분위·기록), F10(예방접종), F14(목표키), F15(분유량), F7 결과 문구 복사가 더해졌다.
2026-10-02 PRD 버전 4·SPEC 버전 6 에서 F5 경감 구간 경계가 원문대로 정정됐다(⑬, `### preemie-calc PRD 미결 값의 위치`).
같은 날 F8 AC3 추이 그래프가 범위에 들어왔다(⑧ 끝의 "추이 그래프"). 차트는 `recharts` 하나로 그린다.

위 handwork 절은 handwork 에만 적용된다. preemie-calc 의 판정 기준은 이 절의 `### preemie-calc 금지 import` 표다.

### preemie-calc 레이어 정의

안쪽(오래 사는 것)에서 바깥쪽(자주 바뀌는 것) 순서다.

| #   | 레이어     | 디렉터리                         | 담는 것                                                                                                                                             | 넣지 않는 것                                                                                     |
| --- | ---------- | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| 1   | `shared`   | `apps/preemie-calc/src/shared`   | 도메인을 모르는 것. 달력 날짜 계산, 기준 데이터 메타 타입, 표준정규분포 같은 수학 함수, UI 프리미티브, 사이트 설정                                  | 교정연령·검진·경감 같은 이른둥이 도메인 규칙                                                     |
| 2   | `entities` | `apps/preemie-calc/src/entities` | 업무 대상 하나의 모델·계산·저장·기준 데이터. 예: 아이 프로필, 영유아검진 차수, 본인부담 경감, 성장 기록, 예방접종 일정                              | 사용자 행위(입력 폼 제출, 공유 버튼)                                                             |
| 3   | `features` | `apps/preemie-calc/src/features` | 사용자가 하는 행위 하나. 예: 프로필 입력, 아이 바꾸기, 정보 전체 삭제, 결과 공유, 측정 기록 추가, 접종 완료 체크                                    | 여러 기능을 묶은 화면 조각                                                                       |
| 4   | `widgets`  | `apps/preemie-calc/src/widgets`  | entities·features 를 불러 한 덩어리로 묶은 화면 조각. 쓰는 view 가 하나여도 된다. 예: 나이 요약, 검진 도우미 카드(아이 나이 + 검진 차수)            | `shared` 만 쓰고 view 하나에서만 쓰는 조각 (그 view 의 `views/<route>/ui` 에 둔다)               |
| 5   | `views`    | `apps/preemie-calc/src/views`    | 한 페이지의 조립. 라우트당 하나. 어떤 조각을 어떤 순서로 놓을지 정하고, 그 페이지에서만 쓰는 `shared` 조합 조각을 `views/<route>/ui` 에 둔다        | 계산·데이터 가공. 두 entity 슬라이스의 결과를 합치는 일 (widget 이 한다)                        |
| 6   | `app`      | `apps/preemie-calc/src/app`      | Next.js 라우팅, 레이아웃, `sitemap.ts`, `generateStaticParams`                                                                                      | 화면 조립 (views 에 둔다)                                                                        |

`pages` 대신 `views` 를 쓰는 이유는 handwork 절과 같다.

**조각을 widgets 에 둘지 views 에 둘지는 이렇게 정한다.** view 의 루트 컴포넌트(`<Name>View.tsx`)를 뺀 조각(컴포넌트·lib 함수)이 대상이다.

1. `@/entities/*` 나 `@/features/*` 를 import 하면 `widgets` 다. 쓰는 view 수는 보지 않는다
2. 1이 아니어도 두 view 이상이 쓰면 `widgets` 다
3. 둘 다 아니면 그 조각을 쓰는 view 의 `views/<route>/ui` (함수면 `views/<route>/lib`) 에 둔다

예: 검진 도우미 카드는 `/dashboard/checkups` 한 곳에서만 쓰지만 `entities/checkup` 을 부르므로 widget 이다.
대시보드 바로가기 목록은 `shared/ui` 만 쓰고 `/dashboard` 한 곳에서만 쓰므로 `views/dashboard/ui` 에 둔다.

### preemie-calc 의존 방향

**한 방향이다. 위 표의 번호가 큰 쪽이 작은 쪽을 import 한다.**

```
app → views → widgets → features → entities → shared
```

- 같은 층의 다른 슬라이스끼리는 import 하지 않는다. `import type` 도 여기에 들어간다. 특히 `entities/checkup` 같은 규칙 슬라이스는 `entities/child` 를 부르지 않는다.
  아이 나이가 필요하면 두 가지로 값을 받는다. `shared/lib/calendar-date` 의 타입(`CalendarDate`, `CalendarSpan`), 그리고 그 슬라이스가 자기 `model` 에 선언한 입력 타입이다.
  입력 타입에는 그 슬라이스가 실제로 읽는 필드만 둔다. TypeScript 는 타입을 이름이 아니라 모양으로 맞추므로, widget 이 `entities/child` 의 값을 그대로 넘겨도 맞는다. 둘을 묶는 일은 widget 이 한다.
  2026-09-30 에 더한 `entities/growth`·`entities/vaccination`·`entities/target-height`·`entities/formula` 도 같다. 성별·출생일·예정일은 자기 입력 타입으로 받는다
- 역방향은 전부 금지다. 아래 표가 그것을 검사한다
- `packages/*` 는 패키지 이름으로만 부른다. `apps/handwork` 의 코드는 어떤 경로로도 부르지 않는다
- 슬라이스 밖에서는 슬라이스의 `index.ts`(공개 API)로만 부른다. 기준 데이터 파일(`data/`)은 그 슬라이스 안에서만 읽는다

### preemie-calc 금지 import

세 번째 열은 `grep -E` 에 그대로 들어간다. `quality-gate.mjs` 의 arch 게이트는 `ARCH-` 로 시작하고 숫자 세 자리가 붙은 ID 만 읽으므로,
이 앱의 규칙은 `ARCH-101` 부터 번호를 붙인다. 101~~106 은 handwork 의 ARCH-001~~006 에 하나씩 대응하고, 107·108 은 이 앱에만 있는 규칙이다.
109~~113 은 브라우저 저장소를 `entities` 밖에서 쓰지 못하게 막는다. arch 게이트는 규칙 한 줄에 검사 경로 하나만 읽으므로 층마다 한 줄씩 둔다.
114~~118 은 차트 라이브러리 `recharts` 를 `widgets` 밖에서 import 하지 못하게 막는다. 같은 이유로 층마다 한 줄이다.

| 규칙 ID  | 검사 경로                       | 금지 패턴 (ERE)                                       | 이유                                                                                                                     |
| -------- | ------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| ARCH-101 | apps/preemie-calc/src/shared/   | from ['\"]@/(app\|views\|widgets\|features\|entities) | ARCH-001 대응. shared 가 상위 층을 알면 어디서도 재사용할 수 없다                                                        |
| ARCH-102 | apps/preemie-calc/src/entities/ | from ['\"]@/(app\|views\|widgets\|features)           | ARCH-002 대응. entities 는 행위를 모른다. 알면 행위마다 계산이 따로 생긴다                                               |
| ARCH-103 | apps/preemie-calc/src/features/ | from ['\"]@/(app\|views\|widgets)                     | ARCH-003 대응. feature 가 화면 조립을 알면 다른 화면에 못 붙는다                                                         |
| ARCH-104 | apps/preemie-calc/src/widgets/  | from ['\"]@/(app\|views)                              | ARCH-004 대응. widget 이 페이지를 알면 그 페이지 전용이 된다                                                             |
| ARCH-105 | apps/preemie-calc/src/          | from ['\"]\.\./\.\./                                  | ARCH-005 대응. 두 단계 이상 올라가는 상대 경로는 층 경계를 우회한다                                                      |
| ARCH-106 | apps/preemie-calc/src/          | from ['\"]([^'"]*/)?handwork(/\|['\"])                | ARCH-006 대응(앱 밖 경계). 앱끼리 코드를 직접 나누면 한 앱을 고칠 때 다른 앱이 깨진다. 함께 쓸 것은 packages/* 로 올린다 |
| ARCH-107 | apps/preemie-calc/src/          | from ['\"]@/entities/[^/'\"]+/data/                   | 기준 데이터는 그 슬라이스의 model 만 읽는다. 화면이 JSON 을 직접 읽으면 데이터 모양이 바뀔 때 고칠 곳이 흩어진다         |
| ARCH-108 | apps/preemie-calc/src/entities/ | new Date\(\|Date\.now\(                               | 도메인 계산은 "오늘" 을 인자로 받는다. 안에서 시계를 읽으면 단위 테스트가 날짜를 고정할 수 없다                          |
| ARCH-109 | apps/preemie-calc/src/shared/   | (local\|session)Storage\.                             | 저장소는 `entities/*/api` 만 쓴다. 다른 곳이 키를 만들면 "정보 전체 삭제" 가 그 키를 모른다                              |
| ARCH-110 | apps/preemie-calc/src/features/ | (local\|session)Storage\.                             | 부모 키(F14)·분유량 체중(F15)은 저장하지 않는다 (PRD §8). 입력 폼이 사는 층에서 저장소를 부르지 못하게 해 이 약속을 검사한다 |
| ARCH-111 | apps/preemie-calc/src/widgets/  | (local\|session)Storage\.                             | ARCH-109 와 같은 이유. widget 은 `entities/*/api` 의 함수로만 저장한다                                                   |
| ARCH-112 | apps/preemie-calc/src/views/    | (local\|session)Storage\.                             | ARCH-109 와 같은 이유                                                                                                    |
| ARCH-113 | apps/preemie-calc/src/app/      | (local\|session)Storage\.                             | ARCH-109 와 같은 이유                                                                                                    |
| ARCH-114 | apps/preemie-calc/src/shared/   | (from\|import\()[[:space:]]*['\"]recharts(/[^'\"]*)?['\"] | 그래프는 F8 한 곳이다. recharts 는 브라우저에서 크기를 재서 그리는 큰 라이브러리라 shared 에 두면 서버에서 그리는 페이지(F13 481쪽)까지 끌고 갈 수 있다 |
| ARCH-115 | apps/preemie-calc/src/entities/ | (from\|import\()[[:space:]]*['\"]recharts(/[^'\"]*)?['\"] | entities 는 그래프에 넣을 값까지만 계산한다. 차트를 알면 `model` 을 React 없이 테스트할 수 없다 (⑦) |
| ARCH-116 | apps/preemie-calc/src/features/ | (from\|import\()[[:space:]]*['\"]recharts(/[^'\"]*)?['\"] | feature 는 사용자 행위 하나다. 그래프는 행위가 아니라 결과를 보이는 화면 조각이다 |
| ARCH-117 | apps/preemie-calc/src/views/    | (from\|import\()[[:space:]]*['\"]recharts(/[^'\"]*)?['\"] | 차트는 entity 값을 받아 그리므로 레이어 정의의 판정 순서 1 에 따라 widget 이다. view 는 조립만 한다 |
| ARCH-118 | apps/preemie-calc/src/app/      | (from\|import\()[[:space:]]*['\"]recharts(/[^'\"]*)?['\"] | app 은 라우팅만 한다. ARCH-117 과 같은 이유 |

`apps/preemie-calc/tests/` 는 검사 경로에 넣지 않았다. 테스트는 모든 층을 부를 수 있어야 한다.
`entities/*/model`·`entities/*/ui` 가 저장소를 직접 부르지 않는 것은 검사 경로 하나로 표현할 수 없어 `### preemie-calc 권고` 에 둔다.

### preemie-calc 폴더 구조

```
apps/preemie-calc/
├── docs/                         # PRD.md, SPEC.md (읽기 전용)
├── tests/                        # curvez-qa 소유. 금지 import 검사 대상 아님
└── src/
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx                          # /  (입력, F1)
    │   ├── dashboard/
    │   │   ├── page.tsx                      # /dashboard (F2)
    │   │   ├── age-basis/page.tsx            # F3
    │   │   ├── checkups/page.tsx             # F4
    │   │   ├── copay-relief/page.tsx         # F5
    │   │   ├── correction-period/page.tsx    # F6
    │   │   ├── growth/page.tsx               # F8
    │   │   ├── vaccinations/page.tsx         # F10
    │   │   ├── target-height/page.tsx        # F14
    │   │   └── formula/page.tsx              # F15
    │   ├── share/page.tsx                    # /share (F7 받는 쪽)
    │   ├── guide/[weeks]/[months]/page.tsx   # F13 481쪽
    │   └── sitemap.ts                        # /sitemap.xml
    ├── views/
    ├── widgets/
    │   └── growth-panel/        # F8. lib/ (기록 → 그래프 점, 순수) ui/ (GrowthTrendChart — recharts 를 쓰는 곳)
    ├── features/
    │   ├── profile-form/        # F1 입력, 예정일 ↔ 주수 전환, 검증 문구
    │   ├── switch-child/        # F1-AC5
    │   ├── clear-all-data/      # F1-AC6
    │   ├── share-result/        # F7 링크·카드 만들기, lib/share-text.ts (결과 문구 복사)
    │   ├── record-growth/       # F8 측정 기록 추가 (이름은 예시)
    │   ├── toggle-vaccination/  # F10 완료 체크 (이름은 예시)
    │   ├── target-height-form/  # F14 부모 키 입력. 저장하지 않는다 (이름은 예시)
    │   └── formula-form/        # F15 체중 입력. 저장하지 않는다 (이름은 예시)
    ├── entities/
    │   ├── child/               # model/ (프로필·재태·나이·공유 링크·SEO 조합) api/ (localStorage) ui/
    │   ├── age-basis/           # model/ data/age-basis.json                (F3)
    │   ├── checkup/             # model/ data/checkup-rounds.json           (F4)
    │   ├── copay-relief/        # model/ data/copay-relief.json             (F5)
    │   ├── correction-period/   # model/ data/correction-period.json        (F6)
    │   ├── growth/              # model/ api/ (localStorage) data/growth-lms.json            (F8)
    │   ├── vaccination/         # model/ api/ (localStorage) data/vaccination-schedule.json  (F10)
    │   ├── target-height/       # model/ (Tanner 공식 상수와 계산. data/ 없음)              (F14)
    │   └── formula/             # model/ data/formula-coefficients.json                      (F15)
    └── shared/
        ├── lib/calendar-date/        # CalendarDate, 날짜 계산, todayInKst, useToday
        ├── lib/reference/            # ReferenceMeta, Settled 타입
        ├── lib/normal-distribution/  # standardNormalCdf, inverseStandardNormalCdf (F8 백분위·기준선)
        ├── config/site.ts            # 사이트 이름·origin (PRD 미결 6)
        └── ui/
```

widget·view 슬라이스 이름과 새 feature 슬라이스 이름은 `curvez-nextjs` 가 위 규칙 안에서 정한다. 어느 층에 둘지는 `### preemie-calc 레이어 정의` 아래의 판정 순서를 따른다.
entity 슬라이스 이름(`growth`·`vaccination`·`target-height`·`formula`)과 데이터 파일 이름은 이 문서가 정한다. 세그먼트(`model`/`api`/`ui`/`data`)는 쓰일 때만 만든다.

### preemie-calc 데이터 모양

코드는 TypeScript 표기로 적었다. 필드 이름과 값의 집합이 계약이고, 파일 안의 배치는 구현이 정한다.

#### ① 아이 프로필 — `ChildProfile` (`entities/child/model`)

```ts
type Sex = "male" | "female";

type ChildProfile = {
  id: string; // crypto.randomUUID(). 기기 안에서만 쓰는 식별자
  name: string | null; // 선택. 앞뒤 공백을 지우고 빈 문자열이면 null
  sex: Sex; // 필수 (SPEC §3)
  birthDate: CalendarDate; // 필수
  dueDate: CalendarDate; // 필수. 주수로 입력해도 예정일로 바꿔 저장한다
  birthWeightGrams: number | null; // 선택. 정수 g. 1.4kg 입력 → 1400
};
```

- 재태기간은 저장하지 않는다. 늘 `birthDate`·`dueDate` 에서 계산한다. 두 곳에 두면 서로 어긋날 수 있다
- 이름이 없으면 목록에 `아이 {목록 순서 + 1}` 로 보인다 (PC-F1-EX3). 번호는 저장하지 않는다
- 입력 폼은 저장 전 값 `ProfileDraft` 를 쓴다. 예정일 모드면 `dueDate`, 주수 모드면 `{ weeks, days }` 를 갖고, 저장할 때 `dueDateFromGestation` 으로 `dueDate` 를 만든다

검증 `validateProfileDraft(draft: ProfileDraft, today: CalendarDate): ProfileError[]`

| 오류 코드                | 조건                                                      | 근거      |
| ------------------------ | --------------------------------------------------------- | --------- |
| `gestation-out-of-range` | 재태일수 < 154 (22주 0일 미만) 또는 > 308 (44주 0일 초과) | PC-F1-EX1 |
| `birth-after-today`      | `birthDate > today`                                       | PC-F1-EX2 |
| `invalid-date`           | 날짜 문자열이 실제 달력 날짜가 아님                       | 입력 방어 |

#### ② localStorage — 키 `preemie-calc/profiles`, 값 `ProfileStoreV1` (`entities/child/api`)

```ts
const PROFILE_STORE_KEY = "preemie-calc/profiles";
const CHILD_DATA_KEY_PREFIX = "preemie-calc/";

type ProfileStoreV1 = {
  version: 1;
  profiles: ChildProfile[]; // 저장한 순서. "아이 N" 번호도 이 순서
  selectedId: string | null; // 대시보드에 보일 아이. 없는 id 면 profiles[0]
};
```

| 함수                                 | 하는 일                                                                                      |
| ------------------------------------ | -------------------------------------------------------------------------------------------- |
| `readProfileStore(): ProfileStoreV1` | 키가 없거나 JSON·버전이 맞지 않으면 빈 상태 `{ version: 1, profiles: [], selectedId: null }` |
| `saveProfile(profile: ChildProfile)` | 같은 id 면 바꾸고, 없으면 뒤에 더한 뒤 그 아이를 선택한다                                    |
| `selectProfile(id: string)`          | `selectedId` 만 바꾼다 (PC-F1-AC5)                                                           |
| `deleteAllChildData()`               | `CHILD_DATA_KEY_PREFIX` 로 시작하는 localStorage 키를 전부 지운다 (PC-F1-AC6)                |

- 키 하나에 전체 상태를 둔다. 저장이 한 번에 끝나고, 삭제할 곳이 하나로 줄어든다
- 측정 기록(⑧)과 접종 완료 체크(⑨)는 이 키에 넣지 않고 `preemie-calc/growth-records`·`preemie-calc/vaccinations` 두 키에 따로 둔다.
  둘 다 `preemie-calc/` 로 시작하므로 `deleteAllChildData` 가 고치지 않고도 함께 지운다. `ProfileStoreV1` 은 바뀌지 않아 `version: 1` 그대로다
- 키 이름은 사이트 이름(미결 6)과 무관하게 고정한다. 이름이 바뀔 때 키를 바꾸면 저장된 프로필이 사라진다
- localStorage 는 `entities/*/api` 세그먼트만 읽고 쓴다. 서버 렌더 중에는 부르지 않는다

#### ③ 날짜 표현과 "오늘" 주입 (`shared/lib/calendar-date`)

날짜는 전부 **KST 기준 달력 날짜 문자열 `YYYY-MM-DD`** 다. 시각·시간대를 갖지 않는다. `Date` 객체는 이 모듈 안에서만 계산 도구로 쓰고 밖으로 내보내지 않는다.

```ts
type CalendarDate = string & { readonly __brand: "CalendarDate" }; // "2026-03-01"
type CalendarSpan = { totalDays: number; months: number; days: number };
type AgeOffset = { months: number; days: number };

parseCalendarDate(input: string): CalendarDate | null;
todayInKst(now?: Date): CalendarDate;   // 시계를 읽는 유일한 함수. now 기본값 new Date()
daysBetween(from: CalendarDate, to: CalendarDate): number; // to − from. 같은 날이면 0
addDays(date: CalendarDate, n: number): CalendarDate;
addMonths(date: CalendarDate, n: number): CalendarDate;    // 없는 날짜는 그달 말일 (01-31 + 1개월 = 02-28)
addAgeOffset(date: CalendarDate, offset: AgeOffset): CalendarDate; // addDays(addMonths(date, months), days)
calendarSpan(from: CalendarDate, to: CalendarDate): CalendarSpan;
// months = addMonths(from, m) <= to 인 가장 큰 m, days = daysBetween(addMonths(from, months), to)
useToday(): CalendarDate;               // 클라이언트 컴포넌트용. todayInKst() 를 쓴다
```

- `todayInKst` 는 `now` 에 9시간을 더한 UTC 날짜를 쓴다. 한국은 서머타임이 없다
- E2E 는 Playwright 의 시계 고정으로 `new Date()` 를 바꾸면 된다. 테스트용 쿼리 파라미터를 두지 않는다
- 예시 아이로 맞춰 보면: `calendarSpan("2026-03-01", "2026-09-15")` = 6개월 14일, `calendarSpan("2026-04-26", "2026-09-15")` = 4개월 20일 (PC-F4-AC2), `calendarSpan("2026-03-01", "2026-06-01")` = 92일·3개월 (PC-F2-AC1)
- 기준 데이터의 "생후 N개월" 은 모두 `addMonths(birthDate, N)` 으로 날짜가 된다. 예: 생후 2개월 → `addMonths("2026-03-01", 2)` = 2026-05-01 (PC-F10-AC1)

도메인 계산 시그니처 (`entities/child/model`). **모두 `today` 를 인자로 받는다.** entities 안에서 시계를 읽는 것은 ARCH-108 이 막는다.

```ts
type GestationalAge = { totalDays: number; weeks: number; days: number };

gestationFromDates(birthDate: CalendarDate, dueDate: CalendarDate): GestationalAge; // 280 − daysBetween(birth, due)
dueDateFromGestation(birthDate: CalendarDate, ga: { weeks: number; days: number }): CalendarDate; // birth + (280 − 재태일수)

type CorrectedAge =
  | { kind: "hidden" }                                                    // 재태 259일(37주) 이상 (PC-F2-AC4)
  | { kind: "before-due"; daysUntilDue: number; gestationToday: GestationalAge } // "교정 D-25", "재태 36주 3일" (PC-F2-AC2)
  | { kind: "after-due"; span: CalendarSpan };                            // 예정일 당일이 교정 0일

type ChildAges = {
  today: CalendarDate;
  gestationAtBirth: GestationalAge;
  correctionApplies: boolean;              // gestationAtBirth.totalDays < 259
  chronological: CalendarSpan;             // 출생일 당일 0일
  corrected: CorrectedAge;
  nextMonthDates: {
    chronological: { months: number; date: CalendarDate };        // "생후 4개월: 2026-07-01"
    corrected: { months: number; date: CalendarDate } | null;     // "교정 2개월: 2026-06-26"
  };
};

computeChildAges(input: { birthDate: CalendarDate; dueDate: CalendarDate }, today: CalendarDate): ChildAges;
```

`GestationalAge`·`CorrectedAge` 는 `entities/child` 의 타입이다. 다른 entities 슬라이스는 이 이름을 import 하지 않는다. 아래 ④·⑧~⑪ 의 규칙 함수는 필요한 필드만 가진 자기 입력 타입을 쓴다.

#### ④ 기준 데이터 파일 (`entities/<슬라이스>/data/*.json`)

기준 데이터는 코드와 따로 JSON 파일로 둔다. 기준이 바뀌면 이 파일만 고친다. 파일마다 맨 위에 `meta` 가 있다.
공통 타입은 `shared/lib/reference` 에 둔다.

```ts
type ReferenceSource = { id: string; name: string; url: string };

type ReferenceMeta = {
  id: string; // 파일 이름과 같다. 예: "checkup-rounds"
  title: string; // 화면에 보일 자료명 (PC-F3-AC4, PC-F4-AC5)
  sources: ReferenceSource[]; // 1개 이상. 출처 URL
  schemaVersion: 1;
} & (
  | { effectiveDate: CalendarDate; lastVerified: CalendarDate } // 원문 대조를 마쳤다
  | { effectiveDate: null; lastVerified: null }                 // 원문 대조 전
);

type OpenQuestionId = "PRD-9-1" | "PRD-9-2" | "PRD-9-3" | "PRD-9-5" | "PRD-9-6"; // PRD §9 표의 행 번호

// PRD 미결에 걸린 값은 전부 이 모양으로 감싼다. "미확정" 이면 value 는 잠정값이고, 그 근거를 적는다.
type Settled<T> =
  | { status: "확정"; value: T }
  | {
      status: "미확정";
      value: T;
      openQuestion: OpenQuestionId;
      provisionalBasis: string;
    };
```

기준일과 마지막 확인일은 이렇게 채운다.

- `lastVerified` 는 사람이 `sources` 의 원문을 열어 이 파일의 값과 대조한 날이다
- `effectiveDate`(기준일)는 원문이 밝힌 기준일·시행일이다. 원문에 날짜가 없으면 `lastVerified` 와 같은 날을 적는다. 그날 원문이 그렇게 적혀 있었다는 뜻이다
- 원문과 대조하기 전에는 **둘 다 `null`** 이다. SPEC 갱신일, 기사 날짜, 짐작한 날짜로 채우지 않는다. 기준일은 대조해서 얻는 값이라 대조 없이는 알 수 없다
- 한쪽만 `null` 인 파일은 불러올 때 오류로 멈춘다. JSON 은 넓은 타입으로 읽고, `resolveReferenceMeta` 가 위 두 경우 중 하나로 좁힌다
- 화면은 `effectiveDate` 가 `null` 이면 날짜 대신 "기준일 확인 전" 을 보인다. 문구는 `curvez-designer` 의 `ReferenceFooter` 스펙이 정하면 그것을 따른다
- 이 상태는 `Settled<T>` 로 표현하지 않는다. `Settled` 는 PRD §9 미결(사람이 정할 제품 결정)을 감싸는 타입이라 `openQuestion` 이 필수다. 원문 대조는 결정이 아니라 할 일이라서 붙일 번호가 없다

미확정 값을 쓴 계산 결과에는 `unconfirmed: true` 를 붙여 돌려준다. 화면에서 어떻게 보일지는 `curvez-designer` 가 정한다.

| 파일                                                     | 슬라이스            | 최상위 필드                                                                                                                      | 기능 |
| -------------------------------------------------------- | ------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ---- |
| `entities/age-basis/data/age-basis.json`                 | `age-basis`         | `meta`, `items: AgeBasisItem[]`                                                                                                  | F3   |
| `entities/checkup/data/checkup-rounds.json`              | `checkup`           | `meta`, `rounds: CheckupRound[]`, `questionnaireCorrection`                                                                      | F4   |
| `entities/copay-relief/data/copay-relief.json`           | `copay-relief`      | `meta`, `policyLabel`, `eligibleBelowGestationDays`, `tiers: CopayReliefTier[]`, `innerBoundary`, `endDateMethod`, `sourceNotes` | F5   |
| `entities/correction-period/data/correction-period.json` | `correction-period` | `meta`, `appliesBelowGestationDays`, `defaultUntilMonths`, `extended`, `ageBasis`                                                | F6   |
| `entities/growth/data/growth-lms.json`                   | `growth`            | `meta`, `series: GrowthLmsSeries[]` (⑧)                                                                                          | F8   |
| `entities/vaccination/data/vaccination-schedule.json`    | `vaccination`       | `meta`, `series: VaccineSeries[]`, `notes: VaccinationNote[]` (⑨)                                                                | F10  |
| `entities/formula/data/formula-coefficients.json`        | `formula`           | `meta`, `bands: FormulaBand[]` (⑪)                                                                                               | F15  |

경로는 모두 `apps/preemie-calc/src/` 아래다. F14 목표키는 데이터 파일이 없다 (⑩). 각 필드의 모양은 이렇다.

```ts
// F3. 나이 기준 표
type AgeBasis = "chronological" | "corrected" | "corrected-until-checkup";
type AgeBasisItem = {
  id:
    | "vaccination"
    | "checkup-visit"
    | "checkup-questionnaire"
    | "solid-food"
    | "development";
  label: string; // "예방접종", "영유아검진 방문", "문진표·발달선별검사지", "이유식", "발달 평가"
  basis: AgeBasis; // "corrected-until-checkup" 의 끝 차수는 checkup-rounds.json 의 questionnaireCorrection 을 따른다
  sourceId: string; // meta.sources[].id
};

// F4. 영유아검진 차수
type CheckupRound = {
  id: string; // "round-1" …
  order: number; // 1부터
  label: string; // "1차"
  sourceRangeText: string; // 출처에 적힌 그대로. 예: "4~6개월"
  visitWindow: { start: AgeOffset; endExclusive: AgeOffset }; // 출생 기준. "4~6개월" → start {4,0}, endExclusive {7,0}
  unverifiedReason?: string; // 이 차수만 원문과 대조하지 못했을 때 그 이유. 대조한 차수에는 두지 않는다
};
// questionnaireCorrection: Settled<{ lastCorrectedRoundId: string }>
//   이 차수까지 문진표·발달선별검사지를 교정 개월로 쓴다. 뒤 차수는 출생 개월 (PC-F4-AC3)

// F5. 본인부담 경감
type CopayReliefTier = {
  id: string;
  label: string; // "5년 3개월"
  gestationDays: { from: number | null; to: number }; // 주 경계를 일수로. 29~33주 → { from: 203, to: 231 }. 29주 미만 → from null
  period: { years: number; months: number };
};
// eligibleBelowGestationDays: 259 — 37주 0일 이상은 대상 아님 (PC-F5-AC4)
// innerBoundary: Settled<"lower-inclusive" | "upper-inclusive">  — 29주 0일·33주 0일이 어느 구간인가
//   upper-inclusive: 정각은 그 주수 "이상" 인 구간에 든다(tier 의 from 포함, to 미포함). 231일 → 33~37주 tier. 2026-10-02 부터 이 값이다
//   lower-inclusive: 정각은 더 긴 경감 구간에 든다(아래 tier 의 to 포함). 231일 → 29~33주 tier. 2026-09-30 의 값이었다
// endDateMethod: Settled<"birth-plus-period" | "birth-plus-period-minus-1-day">
// sourceNotes: { sourceId: string; text: string }[]  — 출처 하나에 붙이는 각주. 없으면 빈 배열

// F6. 교정연령 적용 종료
// appliesBelowGestationDays: 259
// defaultUntilMonths: 24
// extended: { untilMonths: 36; gestationDaysBelow: 196; birthWeightGramsBelow: 1500 }  — 28주 미만 또는 1.5kg 미만
// ageBasis: Settled<"chronological" | "corrected" | null>  — 24·36개월을 출생 기준으로 세는가 교정 기준으로 세는가
```

규칙을 계산하는 함수 (각 슬라이스의 `model`). 아이 나이는 `shared` 타입과, 각 슬라이스가 자기 `model` 에 선언한 입력 타입으로 받는다.
입력 타입에는 그 함수가 읽는 필드만 둔다. `entities/child` 의 `CorrectedAge`·`GestationalAge` 값은 모양이 맞으므로 widget 이 그대로 넘긴다.

```ts
// entities/age-basis
type AgeBasisCorrectedInput =            // entities/child 의 CorrectedAge 에서 읽는 부분만
  | { kind: "hidden" }
  | { kind: "before-due" }
  | { kind: "after-due"; span: CalendarSpan };
ageBasisRows(input: { chronological: CalendarSpan; corrected: AgeBasisCorrectedInput }): AgeBasisRow[];

// entities/checkup
planCheckups(input: { birthDate: CalendarDate; correctedFrom: CalendarDate | null; today: CalendarDate }): CheckupPlan;
//   correctedFrom = correctionApplies ? dueDate : null
roundAtAge(offset: AgeOffset): CheckupRound | null;   // 날짜 없는 F13 페이지용

type CheckupPlan = {
  rounds: {
    round: CheckupRound;
    visitStart: CalendarDate;              // addAgeOffset(birthDate, start)
    visitEnd: CalendarDate;                // addAgeOffset(birthDate, endExclusive) − 1일
    status: "past" | "current" | "upcoming";
    questionnaireBasis: "corrected" | "chronological";
  }[];
  currentQuestionnaireMonths: number | null; // current 차수가 있을 때만. PC-F4-AC2 → 4
  allPassed: boolean;                        // PC-F4-EX1
  unconfirmed: boolean;
};

// entities/copay-relief
type CopayReliefGestationInput = { totalDays: number }; // entities/child 의 GestationalAge 에서 읽는 부분만
classifyCopayRelief(input: { birthDate: CalendarDate; gestation: CopayReliefGestationInput }):
  | { kind: "not-eligible" }
  | { kind: "eligible"; tier: CopayReliefTier; endDate: CalendarDate; unconfirmed: boolean };

// entities/correction-period
type CorrectionPeriodGestationInput = { totalDays: number }; // entities/child 의 GestationalAge 에서 읽는 부분만
correctionPeriod(input: { gestation: CorrectionPeriodGestationInput; birthWeightGrams: number | null }):
  | { kind: "not-applicable" }                                         // 37주 이상 (PC-F6-EX1)
  | { kind: "default"; untilMonths: number; showWeightHint: boolean }  // 체중 미입력이면 hint (PC-F6-AC1)
  | { kind: "extended"; untilMonths: number; reason: "gestation" | "birth-weight" };
```

입력 타입 이름은 예시다. 필드 모양이 계약이고 이름은 `curvez-nextjs` 가 정한다. 규칙 함수가 읽는 필드가 늘면 그 슬라이스의 입력 타입에 더한다.

각 슬라이스는 자기 파일의 `meta` 를 공개 API 로 내보낸다. 화면은 그것으로 출처와 기준일을 보여준다.
JSON 을 불러올 때 모양이 맞는지 검사한다. 검사 방법은 `curvez-nextjs` 가 정하되 지시서의 의존성 목록 밖의 라이브러리를 더하지 않는다.

#### ⑤ 공유 링크 — `/share#b=YYYY-MM-DD&d=YYYY-MM-DD` (`entities/child/model`)

```ts
type SharePayload = { birthDate: CalendarDate; dueDate: CalendarDate };

encodeShareFragment(p: SharePayload): string;          // "b=2026-03-01&d=2026-04-26"
decodeShareFragment(hash: string): SharePayload | null; // 앞의 "#" 는 있어도 없어도 된다. 모르는 키는 버린다
```

- 담는 값은 출생일(`b`)과 출산 예정일(`d`) 둘뿐이다 (PC-F7-AC3). 이름·성별·체중·프로필 id 는 넣지 않는다 (PC-F7-AC1)
- **값을 쿼리가 아니라 URL fragment(`#` 뒤)에 둔다.** 브라우저는 fragment 를 HTTP 요청에 싣지 않는다. 그래서 서버 접속 기록과
  다른 사이트로 넘어갈 때의 Referer 에도 남지 않는다. 쿼리(`?b=…`)에 두면 링크를 여는 순간 출생일이 서버로 간다
- `/share` 는 정적 페이지이고, 브라우저에서 `location.hash` 를 읽어 여는 사람의 오늘 날짜로 계산한다 (PC-F7-AC2)
- 해독에 실패하거나 `validateProfileDraft` 오류가 있으면 결과를 보이지 않고 입력 화면(`/`)으로 가는 안내를 보인다
- 카드 이미지는 브라우저에서 그린다. 서버에서 이미지를 만들면 날짜가 서버로 간다
- 공유 링크와 결과 문구(⑫)에는 성장 기록·접종 체크·부모 키·분유량 체중을 넣지 않는다. 받는 쪽은 출생일과 예정일로 나이만 다시 계산한다

#### ⑥ 라우트 목록

1단계 라우트는 이 표가 전부다. 더할 때는 이 표를 먼저 고친다.

| 경로                           | 기능         | 렌더링                                                                     | 아이 정보          |
| ------------------------------ | ------------ | -------------------------------------------------------------------------- | ------------------ |
| `/`                            | F1 입력      | 정적. 저장된 프로필이 있으면 브라우저에서 `/dashboard` 로 이동 (PC-F1-AC4) | localStorage       |
| `/?weeks=<24~36>`              | F13-AC3 진입 | 같은 페이지. 주수 모드로 열고 `<weeks>주 0일` 을 채운다                    | 없음 (공개 주수만) |
| `/dashboard`                   | F2           | 정적 + 브라우저 계산. 프로필이 없으면 `/` 로 (PC-F2-EX1)                   | localStorage       |
| `/dashboard/age-basis`         | F3           | 위와 같음                                                                  | localStorage       |
| `/dashboard/checkups`          | F4           | 위와 같음                                                                  | localStorage       |
| `/dashboard/copay-relief`      | F5           | 위와 같음                                                                  | localStorage       |
| `/dashboard/correction-period` | F6           | 위와 같음                                                                  | localStorage       |
| `/dashboard/growth`            | F8           | 위와 같음. 측정 기록도 localStorage 에서 읽는다                            | localStorage       |
| `/dashboard/vaccinations`      | F10          | 위와 같음. 완료 체크도 localStorage 에서 읽는다                            | localStorage       |
| `/dashboard/target-height`     | F14          | 위와 같음. 성별만 프로필에서 읽고, 부모 키는 화면 상태에만 둔다            | localStorage (성별) |
| `/dashboard/formula`           | F15          | 위와 같음. 체중은 최근 측정 기록으로 미리 채우고 저장하지 않는다           | localStorage       |
| `/share`                       | F7 받는 쪽   | 정적 + 브라우저 계산                                                       | URL fragment       |
| `/guide/[weeks]/[months]`      | F13          | `generateStaticParams` 로 481쪽 빌드. `dynamicParams = false`              | 없음               |
| `/sitemap.xml`                 | F13-AC4      | `app/sitemap.ts`. 481쪽 + 위 정적 경로                                     | 없음               |

- 새 네 경로(`growth`·`vaccinations`·`target-height`·`formula`)는 `curvez-designer` 의 `screens/*.md` 가 적은 경로와 같다
- F13 의 조합 범위는 `entities/child/model` 의 `COMBO_WEEKS`(24~~36, 13개)·`COMBO_MONTHS`(0~~36, 37개) 상수 하나에서 읽는다.
  `generateStaticParams` 와 `sitemap.ts` 가 같은 상수를 쓰므로 481 이 두 곳에서 어긋나지 않는다
- F13 페이지 계산은 `describeCombo(weeks: number, months: number)` 가 한다. **날짜를 쓰지 않는다.** 빌드한 날에 따라 내용이 바뀌면 안 된다.
  "예정일보다 8주 일찍 태어남" 의 8 은 `40 − weeks` 다. 교정 나이를 개월 수치로 바꾸는 규칙은 `curvez-nextjs` 가 정하고 핸드오프 decisions 에 남긴다
- `describeCombo`(`entities/child`)와 `roundAtAge`(`entities/checkup`)의 결과를 묶어 F13 문구를 만드는 함수는 두 entity 슬라이스를 합치므로 widget 이다 (`widgets/guide-content`). view 는 그 결과를 배치만 한다
- F13 조합 페이지에는 접종 안내를 넣지 않는다 (PC-F13-EX1). `widgets/guide-content` 는 `entities/vaccination` 을 부르지 않는다
- 대시보드 URL 에는 아이 정보를 넣지 않는다. 어느 아이를 보는지는 `selectedId` 가 정한다

#### ⑦ 도메인 계산이 사는 곳

| 계산                                                | 층·슬라이스·세그먼트               | 순수 함수 여부                           |
| --------------------------------------------------- | ---------------------------------- | ---------------------------------------- |
| 달력 날짜 계산, KST 오늘                            | `shared/lib/calendar-date`         | `todayInKst`·`useToday` 만 시계를 읽는다 |
| 표준정규분포 누적확률                               | `shared/lib/normal-distribution`   | 순수                                     |
| 표준정규분포 역함수 (F8 기준선)                     | `shared/lib/normal-distribution`   | 순수                                     |
| 재태기간, 생후·교정 나이, 다음 월령일               | `entities/child/model`             | 순수                                     |
| 프로필 검증, 공유 링크 부호화, F13 조합             | `entities/child/model`             | 순수                                     |
| 프로필 저장                                         | `entities/child/api`               | localStorage                             |
| 나이 기준 표 (F3)                                   | `entities/age-basis/model`         | 순수                                     |
| 검진 차수 (F4)                                      | `entities/checkup/model`           | 순수                                     |
| 경감 종료일 (F5)                                    | `entities/copay-relief/model`      | 순수                                     |
| 교정 적용 종료 (F6)                                 | `entities/correction-period/model` | 순수                                     |
| 결과 문구 (F7 AC5~7)                                | `features/share-result/lib`        | 순수                                     |
| 측정 기록 검증, 백분위, 최근 체중 (F8)              | `entities/growth/model`            | 순수                                     |
| 측정 기록 저장 (F8)                                 | `entities/growth/api`              | localStorage                             |
| 백분위 기준값 3·50·97 (F8 AC3, LMS 역변환)         | `entities/growth/model`            | 순수                                     |
| 접종 권장일·상태 (F10)                              | `entities/vaccination/model`       | 순수                                     |
| 접종 완료 저장 (F10)                                | `entities/vaccination/api`         | localStorage                             |
| 목표키 (F14)                                        | `entities/target-height/model`     | 순수                                     |
| 분유량 (F15)                                        | `entities/formula/model`           | 순수                                     |
| 아이 나이와 규칙을 묶어 보여주기                    | `widgets/*`                        | React                                    |
| F13 문구 (child 조합 + 검진 차수)                   | `widgets/guide-content`            | 순수                                     |
| 최근 측정 체중을 분유량 폼 초기값으로 넘기기 (F15)  | `widgets/*` (formula 화면 widget)  | React                                    |
| 기록 → 그래프 점 (F8 AC3)                          | `widgets/growth-panel/lib`         | 순수. React·recharts 를 부르지 않는다    |
| 추이 그래프 그리기 (F8 AC3)                        | `widgets/growth-panel/ui`          | React + recharts. `"use client"`         |

`model` 세그먼트는 React·Next 없이 단위 테스트할 수 있어야 한다. `curvez-qa` 는 이 세그먼트를 런타임 없이 테스트한다.

#### ⑧ 성장 기록과 백분위 (F8) — `entities/growth`

측정 기록 하나의 모양이다. 아이마다 여러 개를 저장한다.

```ts
type GrowthSex = "male" | "female";         // entities/child 의 Sex 와 모양이 같다. import 하지 않는다
type HeightPosture = "lying" | "standing";  // 누워서 / 서서

type GrowthRecord = {
  id: string;                  // crypto.randomUUID()
  childId: string;             // ChildProfile.id
  measuredOn: CalendarDate;    // 측정일
  heightCm: number;            // cm. 입력한 소수 첫째 자리까지 그대로. "65.3" → 65.3
  weightGrams: number;         // 정수 g. 입력 "6.25"kg → 6250. birthWeightGrams 와 같은 단위
  headCircumferenceCm: number; // cm. 소수 첫째 자리까지
  heightPosture: HeightPosture;
};
```

- 다섯 값(측정일·키·몸무게·머리둘레·측정 자세)이 모두 필수다. `curvez-designer` 의 `GrowthEntryForm` 이 다섯 칸을 모두 필수로 정했다.
  한 값만 잰 기록을 받으려면 세 측정값을 `number | null` 로 넓히고 `GrowthStoreV1` 을 `version: 2` 로 올린 뒤 읽을 때 옮긴다
- 측정 자세는 기록만 하고 백분위 계산에 쓰지 않는다. LMS 파일에 자세 구분 열이 없다 (sources-v2 사실 #13)
- 백분위는 저장하지 않는다. 읽을 때마다 계산한다. 기준 파일을 바꾸면 저장된 기록의 백분위도 함께 바뀌어야 하기 때문이다
- 개별 기록 삭제·수정은 SPEC 에 없어 만들지 않는다. 기록은 "정보 전체 삭제" 로만 지워진다

검증 `validateGrowthDraft(draft: GrowthDraft, child: { birthDate: CalendarDate }, today: CalendarDate): GrowthError[]`
`GrowthDraft` 는 입력칸 원문(문자열) 모양이고 `curvez-nextjs` 가 정한다.

| 오류 코드               | 조건                                                    |
| ----------------------- | ------------------------------------------------------- |
| `invalid-date`          | 측정일이 실제 달력 날짜가 아님                          |
| `measured-before-birth` | `measuredOn < birthDate`                                |
| `measured-after-today`  | `measuredOn > today`                                    |
| `invalid-value`         | 키·몸무게·머리둘레 중 비었거나, 숫자가 아니거나, 0 이하 |
| `posture-required`      | 측정 자세를 고르지 않음                                 |

측정값의 위아래 한도는 SPEC·PRD 에 없어 두지 않는다. 한도가 정해지면 이 표에 코드를 더한다.

저장 (`entities/growth/api`)

```ts
const GROWTH_STORE_KEY = "preemie-calc/growth-records";

type GrowthStoreV1 = {
  version: 1;
  records: GrowthRecord[]; // 모든 아이의 기록. childId 로 나눈다
};
```

| 함수                                                          | 하는 일                                                                                                                                             |
| ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `loadGrowthRecords(childId: string): GrowthRecordsLoadResult` | `ProfileStoreLoadResult` 와 같은 네 경우(`ok`·`empty`·`corrupted`·`unavailable`). `ok` 의 `records` 는 그 아이 것만, 측정일 오름차순, 같은 날이면 저장한 순서 |
| `saveGrowthRecord(record: GrowthRecord): boolean`             | 같은 id 면 바꾸고, 없으면 뒤에 더한다. 쓰기 실패면 `false`                                                                                          |

`latestWeightGrams(records: GrowthRecord[]): number | null` (`model`) — 측정일이 가장 늦은 기록의 `weightGrams`. 같은 날이면 뒤에 저장한 것. 기록이 없으면 `null`. F15 체중 미리 채우기에 쓴다.

LMS 데이터 파일 `entities/growth/data/growth-lms.json`

```ts
type GrowthMeasure = "height" | "weight" | "headCircumference";
type LmsRow = { month: number; L: number; M: number; S: number }; // month 는 만 개월 정수 0~36

type GrowthLmsSeries = {
  measure: GrowthMeasure;
  sex: GrowthSex;
  unit: "cm" | "kg";  // height·headCircumference 는 cm, weight 는 kg. 원본 M 값의 단위
  rows: LmsRow[];     // month 0~36 오름차순 37행. 빠진 달이 없다
};
// 최상위: { meta; series: GrowthLmsSeries[] }  — 지표 3개 × 성별 2개 = 6개 series, 행 합계 222
```

원본 `.curvez/research/preemie-calc/raw/nhis-growth-lms-20240731-utf8.csv` 에서 이렇게 옮긴다.

| CSV 열                           | JSON                                                                                             |
| -------------------------------- | ------------------------------------------------------------------------------------------------ |
| `영유아성장종류코드` 1 / 2 / 3   | `measure` `"weight"` / `"height"` / `"headCircumference"`. 4(체질량지수)는 옮기지 않는다          |
| `성별코드` 1 / 2                 | `sex` `"male"` / `"female"`                                                                      |
| `개월수구분코드`                 | `month`. 0~36 인 행만 옮긴다. 37~84 행은 옮기지 않는다                                           |
| `영유아성장도표L값`·`M값`·`S값`  | `L`·`M`·`S`. 원본 자릿수 그대로. 반올림하지 않는다                                               |

- 체질량지수는 F8 기록 항목에 없다. 그리고 이 지표 행만 `개월수구분코드` 와 `영유아성장도표시작월` 이 서로 다르다(예: 코드 11, 시작월 35). 옮기지 않으므로 이 차이를 해석하지 않는다
- 36개월 행은 옮긴다 (결정 (a)). 이 행은 0~35개월 행과 산출 근거가 다르다. L·S 값이 35→36개월에서 끊기고(사실 #14), 질병관리청은 "3세 미만 WHO Growth Standards" 라고 적었다(사실 #16).
  그래서 `meta.title` 에 "WHO 기준" 이라고만 쓰지 않는다
- 백분위수 환산표(`nhis-growth-percentile-*.csv`, 99행)는 앱 데이터로 옮기지 않는다. 화면 계산에 쓰지 않는다. `curvez-qa` 가 `apps/preemie-calc/tests/` 아래 fixture 로 두고 AC4 검사에 쓴다

백분위 계산 (`entities/growth/model`)

```ts
type GrowthAgeInput = {
  sex: GrowthSex;
  birthDate: CalendarDate;
  correctedFrom: CalendarDate | null; // correctionApplies ? dueDate : null  (planCheckups 와 같은 방식)
};

type GrowthAgeAtMeasurement = {
  basis: "corrected" | "chronological"; // 재태 37주 미만이면 corrected (PC-F8-AC1)
  span: CalendarSpan;                   // "교정 ○개월 기준" 의 ○ 은 span.months
};

type MeasureResult = {
  z: number;          // 반올림하지 않은 값
  percentile: number; // Φ(z) × 100 을 소수 첫째 자리로 반올림. 예 15.3
  consult: boolean;   // percentile < 3 || percentile > 97. 반올림한 값으로 판정한다 (PC-F8-AC2)
};

type GrowthPercentileResult =
  | { kind: "before-due"; daysUntilDue: number }          // 측정일 < 예정일. 백분위 없음 (PC-F8-AC5, PC-F8-EX1)
  | { kind: "out-of-range"; age: GrowthAgeAtMeasurement } // 측정일 나이가 36개월을 넘음 (span.months > 36)
  | {
      kind: "ok";
      age: GrowthAgeAtMeasurement;
      height: MeasureResult;
      weight: MeasureResult;
      headCircumference: MeasureResult;
    };

growthPercentiles(
  input: GrowthAgeInput,
  record: { measuredOn: CalendarDate; heightCm: number; weightGrams: number; headCircumferenceCm: number },
): GrowthPercentileResult;
```

계산 순서는 이렇다.

1. 측정일의 나이를 구한다. `correctedFrom` 이 있고 `measuredOn < correctedFrom` 이면 `before-due` 이고 `daysUntilDue = daysBetween(measuredOn, correctedFrom)` 이다.
   `correctedFrom` 이 있고 예정일 당일이거나 뒤면 `span = calendarSpan(correctedFrom, measuredOn)`, `basis = "corrected"` 다.
   `correctedFrom` 이 `null`(37주 이상)이면 `span = calendarSpan(birthDate, measuredOn)`, `basis = "chronological"` 다
2. LMS 행은 `month === span.months` 인 행이다. 만 개월(내림)이고 일 단위로 보간하지 않는다. 원본이 개월 단위 행만 준다 (사실 #13). `span.months > 36` 이면 `out-of-range`
3. 측정값 X 를 원본 단위로 맞춘다. 키·머리둘레는 cm 그대로, 몸무게는 `weightGrams / 1000` kg
4. `Z = ((X / M) ** L − 1) / (L × S)`. `L === 0` 이면 `Z = ln(X / M) / S`. 지금 옮길 222행에 L 이 0 인 행은 없다
5. `percentile = Math.round(standardNormalCdf(Z) × 100 × 10) / 10`

- 예시: 재태 27주 0일(예정일보다 13주 일찍) 아이가 예정일 전날 잰 기록은 `before-due` 이고, 기록은 저장된다 (PC-F8-AC5)
- 재태 37주 이상이면 출생 기준 나이로 계산한다. SPEC 이 교정 적용을 37주 미만에만 걸었다
- 36개월 행을 쓰는 측정(나이 정확히 36개월)도 `ok` 로 계산한다. 그 행은 WHO 가 아니라는 점은 `### preemie-calc 확인 못 한 것` 에 적었다

**F8 AC3(추이 그래프)는 2026-10-02 에 범위에 들어왔다.** 2026-09-30 결정 (d) 는 "차트 라이브러리가 없어 만들지 않는다" 였다. 사용자가 recharts 설치를 승인해 뒤집혔다(결정 로그).
기록 표는 그대로 두고 그래프를 더한다. 그래프의 값은 아래 "추이 그래프" 가 정한다.

표준정규분포 (`shared/lib/normal-distribution`)

```ts
standardNormalCdf(z: number): number;        // Φ(z). 0 이상 1 이하
inverseStandardNormalCdf(p: number): number; // Φ⁻¹(p). 0 < p < 1. 범위 밖이면 RangeError
```

- 도메인을 모르는 수학 함수라 `shared` 에 둔다. JavaScript 에는 두 함수가 없다
- 라이브러리 없이 순수 함수로 둔다. 사용자 결정 3(2026-10-02)이고 역함수도 같은 방침이다. 통계 라이브러리를 더하지 않는다
- `standardNormalCdf` 의 정확도는 절대 오차 1e-6 이하다. 그보다 크면 백분위 소수 첫째 자리 반올림이 경계에서 바뀔 수 있다
- `inverseStandardNormalCdf` 의 정확도는 p 가 0.001 이상 0.999 이하일 때 참값과의 절대 오차 1e-6 이하다.
  확인 값: Φ⁻¹(0.5) = 0, Φ⁻¹(0.97) = 1.880794, Φ⁻¹(0.03) = −1.880794 (소수 여섯째 자리. Python `statistics.NormalDist().inv_cdf` 로 계산했다)
- 근사식은 `curvez-nextjs` 가 고르고 출처를 주석에 적는다. 역함수 결과를 `standardNormalCdf` 로 다시 다듬지(뉴턴 보정) 않는다.
  정방향 근사의 오차가 z 로 옮아 와 z = 1.88 근처에서 1e-6 을 넘을 수 있다

추이 그래프 (F8 AC3)

그래프 모양은 `curvez-designer` 의 `components/GrowthTrendChart.md` 를 따른다. 지표마다 그래프 하나(키·몸무게·머리둘레 3개), x축은 측정일, 선은 실측값과 백분위 기준선 3·50·97 이다.
이 절은 그 값을 어느 층에서 어떻게 만드는지만 정한다.

1) 백분위 기준값 — `entities/growth/model`

```ts
const REFERENCE_PERCENTILES = [3, 50, 97] as const;

type PercentileReference = { p3: number; p50: number; p97: number }; // 그 지표의 원본 단위. 키·머리둘레 cm, 몸무게 kg. 반올림하지 않는다

type GrowthReferenceResult =
  | { kind: "before-due" }   // growthPercentiles 의 before-due 와 같은 조건
  | { kind: "out-of-range" } // growthPercentiles 의 out-of-range 와 같은 조건 (span.months > 36)
  | {
      kind: "ok";
      month: number;         // 쓴 LMS 행의 month. growthPercentiles 의 age.span.months 와 같다
      height: PercentileReference;
      weight: PercentileReference;
      headCircumference: PercentileReference;
    };

lmsValueAtZ(row: { L: number; M: number; S: number }, z: number): number;
growthReferenceValues(input: GrowthAgeInput, measuredOn: CalendarDate): GrowthReferenceResult;
```

- `lmsValueAtZ` 는 LMS 역변환이다. `L === 0` 이면 `X = M × exp(S × z)`, 아니면 `X = M × (1 + L × S × z) ** (1 / L)`. ⑧ 계산 순서 4 의 식을 X 에 대해 푼 것이다
- `growthReferenceValues` 는 기준 백분위 p 마다 `lmsValueAtZ(row, inverseStandardNormalCdf(p / 100))` 를 계산한다
- LMS 행은 `growthPercentiles` 와 **같은 행**이다. 측정일의 나이를 같은 방식(⑧ 계산 순서 1·2)으로 구하고 `month === span.months` 행을 쓴다.
  나이 계산은 두 함수가 함께 쓰는 비공개 함수 하나로 둔다. 따로 두면 예정일 당일·36개월 같은 경계가 두 함수에서 어긋날 수 있다
- `growthPercentiles` 의 시그니처와 결과는 바꾸지 않는다. 기존 표와 테스트가 그대로 돈다
- 2026-10-02 `growth-lms.json` 222행 전부에서 z = ±1.880794 일 때 `1 + L × S × z` 의 최솟값은 0.839 다. 음수 밑이 생기지 않아 따로 처리하지 않는다.
  L 이 0 인 행은 없지만 식은 둔다(⑧ 계산 순서 4 와 같다)

2) 기준값은 기록마다 계산한다. 개월 격자로 계산하지 않는다

기준선의 점은 **기록의 측정일마다 하나**다. 그 측정일 나이의 만 개월 행으로 계산한다. 0~~36개월 37점을 따로 만들지 않는다.

- x축이 측정일이다(designer 결정). 개월 격자는 x 좌표가 없다. 격자를 날짜로 바꾸면 기준(교정·생후)마다 날짜가 달라 축이 두 벌이 된다
- 기록 점의 백분위와 같은 행이라, 점이 기준선 위인지 아래인지가 표의 백분위와 맞는다
- 그래서 기준선은 기록과 기록을 곧게 이은 꺾은선이다. 기록 간격이 멀면 그 사이는 실제 기준 곡선과 다르다. 그래프가 보이는 것은 "그 측정일의 또래 기준" 이다
- 상담 판정(`consult`)은 반올림한 백분위로 하고(⑧) 기준선은 반올림하지 않은 경계다. 기준선 바로 아래 점이 백분위 3.0 으로 반올림돼 주의 모양이 아닐 수 있다. 차이는 백분위 0.05 미만이고 판정의 정본은 표다

3) 기록 → 그래프 점 — `widgets/growth-panel/lib`

```ts
type GrowthTrendPoint = {         // designer 의 GrowthTrendPoint 와 필드가 같다
  measurementDate: CalendarDate;
  value: number;                  // 키·머리둘레 cm, 몸무게 kg(weightGrams / 1000). 반올림하지 않는다
  ageBasisLabel: string | null;   // 표의 GrowthRecordRow.ageBasis.label 과 같은 문구. before-due 면 null
  percentileValue: number | null; // 이 지표의 MeasureResult.percentile. ok 가 아니면 null
  p3: number | null;              // 이 지표의 PercentileReference. ok 가 아니면 null
  p50: number | null;
  p97: number | null;
  cautionNeeded: boolean;         // 이 지표의 MeasureResult.consult. ok 가 아니면 false
  percentileHidden: boolean;      // growthPercentiles 결과가 ok 가 아니면 true
};

buildGrowthTrendPoints(input: {
  records: readonly GrowthRecord[]; // loadGrowthRecords 의 ok.records. 이미 측정일 오름차순이다
  age: GrowthAgeInput;
}): Record<GrowthMeasure, GrowthTrendPoint[]>;
```

- `@/entities/growth` 를 import 하므로 레이어 정의의 판정 순서 1 에 따라 widget 이다. React·recharts 를 부르지 않는 순수 함수라 `lib` 세그먼트에 둔다. `curvez-qa` 는 런타임 없이 테스트한다
- 순서를 바꾸지 않는다. 받은 순서(측정일 오름차순, 같은 날이면 저장 순서)가 x축 왼쪽부터다. 표는 같은 기록을 뒤집어 쓴다
- **`cautionNeeded` 는 그 지표 하나의 상담 판정이다.** 표의 `GrowthRecordRow.cautionNeeded` 는 세 지표 중 하나라도 해당하면 `true` 다.
  그대로 쓰면 몸무게 때문에 키 그래프에 주의 모양이 찍힌다. designer 스펙은 "GrowthRecordRow.cautionNeeded 그대로" 라고 적었고, 이 문서가 지표별로 바꿨다(결정 로그)
- 반올림하지 않는다. 툴팁·축의 자릿수(designer 스펙: 소수 첫째 자리)는 `ui` 가 정한다
- `ageBasisLabel` 은 표와 같은 함수로 만든다. 지금 `GrowthPanelSection` 안에 있는 문구 조립을 이 `lib` 으로 옮겨 표와 그래프가 함께 쓴다

4) 예정일 전과 36개월 뒤

| 기록의 `growthPercentiles` 결과 | `value` | `p3`·`p50`·`p97` | 그래프에서                                                      |
| ------------------------------- | ------- | ---------------- | --------------------------------------------------------------- |
| `before-due`                    | 있음    | `null`           | 기준선 3개가 이 점에서 끊긴다(`connectNulls={false}`). 실측값 선은 잇는다 |
| `out-of-range` (36개월 초과)    | 있음    | `null`           | 위와 같다                                                       |
| `ok`                            | 있음    | 숫자             | 기준선이 이어진다                                               |

- 기준선을 끊는 방법은 `null` 하나다. 0 이나 앞 점의 값을 넣지 않는다. 그 시기에는 견줄 기준이 없다
- 예정일 전 기록은 언제나 예정일 뒤 기록보다 앞에 온다. 그래서 끊김은 그래프 왼쪽 앞부분 한 토막이다. 36개월 뒤 기록은 오른쪽 끝 한 토막이다

5) recharts 를 쓰는 곳

- `recharts` 는 `widgets/*/ui` 에서만 import 한다. ARCH-114~~118 이 다른 층을 막는다
- recharts 를 import 하는 파일은 맨 위에 `"use client"` 를 둔다. 부모가 이미 클라이언트 컴포넌트여도 둔다. 그 파일을 누가 부르든 서버·클라이언트 경계가 그 파일에서 생긴다
- recharts 컴포넌트에는 `GrowthTrendPoint[]` 만 넘긴다. `ui` 에서 `GrowthRecord`·LMS 행으로 값을 다시 계산하지 않는다
- 같은 widget 의 `lib` 은 recharts 를 부르지 않는다. arch 게이트는 경로 하나만 읽어 이것을 검사하지 못하므로 `### preemie-calc 권고` 에 검사 명령을 둔다
- 쓰는 부품은 designer 스펙의 `LineChart`·`Line`·`XAxis`·`YAxis`·`CartesianGrid`·`Legend`·`Tooltip`·`ResponsiveContainer` 다. 다른 차트·통계 라이브러리를 전제하지 않는다

#### ⑨ 예방접종 일정 (F10) — `entities/vaccination`

데이터 파일 `entities/vaccination/data/vaccination-schedule.json` 의 정본은 질병관리청 원본 표다 (결정 (b)).
원본은 `.curvez/research/preemie-calc/raw/kdca-vaccine-schedule-children-2026.jpg` 이고, 차수별 시기는 sources-v2 사실 #18 에 읽어 둔 값을 쓴다.
국립재활원 재게재본(사실 #12)의 값은 옮기지 않는다.

```ts
type VaccineDose = {
  id: string;               // 저장 키. 예 "dtap-4". 한 번 정하면 바꾸지 않는다. 완료 체크가 이 id 로 저장된다
  order: number;            // 1부터
  label: string;            // "4차"
  sourceTimingText: string; // 원본 표에 적힌 그대로. 예 "15~18개월", "4세", "출생시", "4주이내"
  window: { start: AgeOffset; endExclusive: AgeOffset }; // 출생 기준. 아래 읽기 표로 만든다
};

type VaccineSeries = {
  id: string;                      // 예 "hepb", "dtap", "rv1", "rv5"
  label: string;                   // 원본 표의 백신 이름. 예 "DTaP"
  alternativeGroup: string | null; // 같은 값을 가진 series 는 그중 하나만 맞는다. "rotavirus"(RV1·RV5), "japanese-encephalitis"(불활성화·약독화)
  doses: VaccineDose[];
};

type VaccinationNote = { id: string; text: string }; // 차수 일정으로 옮기지 않는 줄. 인플루엔자 "6개월부터 매년", PCV "24~35개월 고위험군 한정"

// 최상위: { meta; series: VaccineSeries[]; notes: VaccinationNote[] }
```

원본 표기를 `window` 로 읽는 법이다. **권장일은 `window.start` 의 날짜다.** 기간으로 적힌 접종도 권장일은 기간의 첫날이고, 기간의 마지막 날(`lastDate`)은 따로 계산한다.

| 원본 표기          | `start`         | `endExclusive`      | 예                                                                                  |
| ------------------ | --------------- | ------------------- | ----------------------------------------------------------------------------------- |
| 출생시             | `{0,0}`         | `{0,1}`             | B형간염 1차. 권장일 = 마지막 날 = 출생일                                            |
| N주이내            | `{0,0}`         | `{0, 7N+1}`         | BCG 4주이내 → `{0,29}`. 생후 28일까지                                               |
| N개월 (한 시점)    | `{N,0}`         | `{N,1}`             | DTaP 1차 2개월. 권장일 = 마지막 날 = `addMonths(birthDate, 2)`                      |
| N~M개월            | `{N,0}`         | `{M+1,0}`           | DTaP 4차 15~18개월 → `{15,0}`~`{19,0}`. 검진 "4~6개월" → `{7,0}` 과 같은 읽기       |
| N세                | `{12N,0}`       | `{12N+12,0}`        | DTaP 5차 4세 → `{48,0}`~`{60,0}`. 만 N세인 1년 동안                                 |
| N~M세              | `{12N,0}`       | `{12M+12,0}`        | MMR 2차 4~6세 → `{48,0}`~`{84,0}`                                                   |
| 한 막대에 여러 차수 | 막대의 시작    | 막대의 끝 (위 규칙) | 원본이 차수별 시점을 따로 적지 않았으면 그 막대 범위를 각 차수에 똑같이 적는다 (A형간염 1~2차) |

- 원본에 있는 어린이 국가예방접종 행을 모두 옮긴다. 36개월 뒤의 차수(DTaP 5·6차, IPV 4차, MMR 2차, 일본뇌염 뒤 차수, HPV)도 옮긴다. 권장 시기는 원본이 정한 것이고 앱 범위(0~3세)로 자르지 않는다
- sources-v2 대조표에서 재게재본과 달랐던 칸은 원본 값이다. DTaP 6차 11~12세, MMR 2차 4~6세, IPV 3차 6~12개월, IPV 4차 4세
- 로타바이러스는 RV1(2회, 2·4개월)과 RV5(3회, 2·4·6개월)를 서로 다른 series 로 두고 `alternativeGroup: "rotavirus"` 로 묶는다. 일본뇌염 불활성화·약독화도 같은 방식이다
- 차수 일정이 아닌 줄(인플루엔자 매년, PCV 고위험군 추가 접종)은 `notes` 에 둔다. 상태를 계산하지 않는다

계산 (`entities/vaccination/model`)

```ts
type VaccinationStatus = "done" | "soon" | "missed" | "upcoming"; // 완료 / 임박 / 놓침 / 예정. designer 의 VaccinationRoundItem 과 같은 값

type CorrectedAtDate =
  | { kind: "before-due"; daysUntilDue: number } // "교정 D-3"
  | { kind: "after-due"; span: CalendarSpan };   // 예 0개월 5일 → "교정 5일" (PC-F10-AC1). 표시 형식은 curvez-nextjs

type PlannedDose = {
  seriesId: string;
  seriesLabel: string;
  dose: VaccineDose;
  recommendedDate: CalendarDate;                 // addAgeOffset(birthDate, dose.window.start)
  lastDate: CalendarDate;                        // addDays(addAgeOffset(birthDate, dose.window.endExclusive), -1)
  correctedAtRecommended: CorrectedAtDate | null; // correctedFrom 이 null(37주 이상)이면 null
  status: VaccinationStatus;
};

planVaccinations(input: {
  birthDate: CalendarDate;
  correctedFrom: CalendarDate | null; // correctionApplies ? dueDate : null
  today: CalendarDate;
  completedDoseIds: readonly string[];
}): { doses: PlannedDose[]; notes: VaccinationNote[] };
// doses 는 recommendedDate 오름차순. 같은 날이면 데이터 파일 순서

vaccinationStatus(input: {
  recommendedDate: CalendarDate;
  lastDate: CalendarDate;
  completed: boolean;
  today: CalendarDate;
}): VaccinationStatus;
```

상태는 위에서부터 처음 맞는 줄로 정한다.

| 순서 | 조건                                           | 상태       | 근거                                                                                       |
| ---- | ---------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------ |
| 1    | 완료 체크됨                                    | `done`     | PC-F10-AC2. 권장일이 미래여도 체크하면 완료다 (designer 스펙)                              |
| 2    | `today > lastDate`                             | `missed`   | PC-F10-AC2 "권장일이 지나고 체크하지 않은". 한 시점 접종은 `lastDate` 가 권장일과 같다     |
| 3    | `daysBetween(today, recommendedDate) <= 7`     | `soon`     | PC-F10-AC2 "7일 이내로 남은". 7일 남은 날도 임박이다. 기간 접종은 기간 안에 있는 동안도 임박이다 |
| 4    | 그 밖                                          | `upcoming` | 8일 이상 남음                                                                              |

예시 아이(출생 2026-03-01, 예정일 2026-04-26)의 "2개월" 접종: 권장일 2026-05-01, 교정 `calendarSpan("2026-04-26", "2026-05-01")` = 0개월 5일 → "교정 5일" (PC-F10-AC1).
오늘이 2026-04-23 이면 `upcoming`, 2026-04-24~2026-05-01 이면 `soon`, 2026-05-02 부터 체크하지 않았으면 `missed` 다.

대체 백신: 같은 `alternativeGroup` 의 다른 series 에 완료 체크가 하나라도 있으면, 체크가 없는 series 의 차수는 `doses` 에서 뺀다.
아무 series 도 체크하지 않았으면 둘 다 보인다. 이렇게 하면 상태 값을 네 개로 유지하면서, RV1 을 맞은 아이에게 RV5 3차가 "놓침" 으로 남지 않는다.

저장 (`entities/vaccination/api`)

```ts
const VACCINATION_STORE_KEY = "preemie-calc/vaccinations";

type VaccinationStoreV1 = {
  version: 1;
  completed: { childId: string; doseId: string }[]; // 같은 쌍은 한 번만
};
```

| 함수                                                                        | 하는 일                                                                            |
| --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `loadCompletedDoseIds(childId: string): CompletedDosesLoadResult`           | `ProfileStoreLoadResult` 와 같은 네 경우. `ok` 는 그 아이의 `doseId` 목록         |
| `setDoseCompleted(childId: string, doseId: string, completed: boolean): boolean` | 켜면 더하고(이미 있으면 그대로), 끄면 뺀다. 쓰기 실패면 `false`. 새로 열어도 유지된다 (PC-F10-AC3) |

- 접종한 날짜는 저장하지 않는다. SPEC §3 은 "차수별 완료 여부" 만 요구한다
- 데이터 파일에서 사라진 `doseId` 의 체크는 지우지 않고 무시한다. 같은 id 가 돌아오면 다시 보인다

#### ⑩ 목표키 (F14) — `entities/target-height`

```ts
type TargetHeightSex = "male" | "female"; // entities/child 의 Sex 와 모양이 같다

const TARGET_HEIGHT_FORMULA = {
  name: "Tanner 공식",               // 화면의 "계산식 출처: Tanner 공식" (PC-F14-AC3)
  sexOffsetCm: 13,
  rangeCm: 6.5,
  parentHeightCm: { min: 100, max: 230 }, // 양끝 포함. PRD §8 가정, PC-F14-EX1
} as const;

isValidParentHeights(input: { fatherCm: number | null; motherCm: number | null }): boolean;
// 둘 다 값이 있고 100 이상 230 이하일 때만 true. false 면 계산 버튼 비활성 + "부모님 키를 모두 확인하세요"

computeTargetHeight(input: { sex: TargetHeightSex; fatherCm: number; motherCm: number }):
  { midCm: number; minCm: number; maxCm: number }; // 소수 첫째 자리까지
```

계산은 0.1cm 정수로 한다. 소수를 그대로 더하고 나누면 부동소수 오차로 반올림 결과가 바뀔 수 있다.

1. `f = Math.round(fatherCm × 10)`, `m = Math.round(motherCm × 10)`
2. `sum = f + m + (sex === "male" ? 130 : −130)`
3. `midCm = Math.round(sum / 2) / 10`, `minCm = Math.round((sum − 130) / 2) / 10`, `maxCm = Math.round((sum + 130) / 2) / 10`. 0.05cm 는 올린다
4. 화면은 `toFixed(1)`: "목표키 참고 175.0cm (168.5~181.5cm)"

확인: 아빠 175, 엄마 162, 남아 → sum 3500 → 175.0 (168.5~181.5) (PC-F14-AC1). 여아 → sum 3240 → 162.0 (155.5~168.5) (PC-F14-AC2).

- 데이터 파일을 두지 않는다. 확인된 출처 URL 이 없어(sources-v2 확인 불가 #6) `ReferenceMeta` 의 `sources`(URL 1개 이상)를 채울 수 없다. 공식은 PRD §9 결정대로 "Tanner 공식" 으로 표기한다
- 부모 키는 저장하지 않는다 (PRD §8, 결정 (c)). 폼 컴포넌트 상태에만 두고 localStorage·URL·공유 문구에 넣지 않는다. 새로고침하면 비어 있다. ARCH-110 이 features 층의 저장소 사용을 막는다
- 성별은 선택된 `ChildProfile.sex` 를 widget 이 넘긴다. 이 화면에서 성별을 다시 묻지 않는다

#### ⑪ 분유량 (F15) — `entities/formula`

데이터 파일 `entities/formula/data/formula-coefficients.json`

```ts
type FormulaBand = {
  id: string;
  sourceRangeText: string; // 원문 그대로
  ageWindow: { start: AgeOffset; endExclusive: AgeOffset | null }; // 교정 나이 기준. null 은 끝이 없다
  mlPerKgPerDay: { min: number; max: number } | null;             // null 은 "기준 확인 중" (PC-F15-EX3)
};
// 최상위: { meta; bands: FormulaBand[] }
```

| `id`      | `sourceRangeText`   | `ageWindow`                 | `mlPerKgPerDay`            | 근거                                                                 |
| --------- | ------------------- | --------------------------- | -------------------------- | -------------------------------------------------------------------- |
| `0-3m`    | 3개월이 될 때까지   | `{0,0}` ~ `{3,0}`           | `{ min: 150, max: 180 }`   | 아이사랑 포털 "3개월이 될 때까지 체중(kg) 당 150~180cc" (사실 #9)    |
| `from-3m` | 확인 중             | `{3,0}` ~ `null`            | `null`                     | PRD §9 결정 "4개월 이후는 확인 중". 원문이 3개월 이후를 다루지 않는다 |

계산 (`entities/formula/model`)

```ts
const FORMULA_WEIGHT_GRAMS = { min: 500, max: 15000 } as const; // 양끝 포함. PRD §8 가정, PC-F15-EX1

type FormulaAgeInput = { // entities/child 의 ChildAges 에서 읽는 부분만
  correctionApplies: boolean;
  chronological: CalendarSpan;
  corrected: { kind: "hidden" } | { kind: "before-due" } | { kind: "after-due"; span: CalendarSpan };
};

type FormulaResult =
  | { kind: "invalid-weight" }                                                 // PC-F15-EX1. 화면은 버튼을 비활성화한다
  | { kind: "out-of-range" }                                                   // PC-F15-EX2 "이 시기에는 일반 권장량을 보여주지 않습니다"
  | { kind: "pending"; band: FormulaBand }                                     // PC-F15-EX3 "기준 확인 중"
  | { kind: "ok"; band: FormulaBand; dailyMl: { min: number; max: number } }; // PC-F15-AC1

formulaAmount(input: { weightGrams: number | null; ages: FormulaAgeInput }):
  { showMedicalTeamNotice: boolean; result: FormulaResult };
```

- 나이: `correctionApplies` 면 교정 나이를 쓴다(SPEC §4 "분유량은 교정 나이로 적용 월령 범위를 판정한다"). `before-due` 면 `out-of-range` 다. 37주 이상이면 출생 기준 나이를 쓴다
- 구간: `start <= 나이 < endExclusive` 인 band. 나이(`CalendarSpan` 의 months·days)와 `AgeOffset` 은 개월을 먼저, 같으면 일을 비교한다. 맞는 band 가 없으면 `out-of-range`
- `dailyMl.min = Math.round(weightGrams × min / 1000)`, `max` 도 같다. 체중 4.0kg → 600~720 (PC-F15-AC1)
- `showMedicalTeamNotice = correctionApplies`. 결과 종류와 상관없이 결과보다 먼저 보인다 (PC-F15-AC2)
- 체중 미리 채우기: formula 화면 widget 이 `entities/growth` 의 `latestWeightGrams` 결과를 폼 초기값으로 넘긴다. 폼(feature)은 growth 를 부르지 않는다. 분유량 체중은 저장하지 않는다 (SPEC §3)
- 원문의 "조산아는 체중(kg)당 최대 200cc" 는 SPEC 에 대응하는 AC 가 없어 옮기지 않는다

#### ⑫ 결과 문구 복사 (F7 AC5~7) — `features/share-result/lib`

```ts
type ShareTextInput = {
  today: CalendarDate;
  chronological: { value: string }; // "92일 · 3개월". ShareResultAction 이 이미 받는 값과 같다
  corrected: { kind: "hidden" | "before-due" | "after-due"; value: string; subValue?: string } | null;
  shareUrl: string;                 // buildShareUrl({ birthDate, dueDate })
};

buildShareText(input: ShareTextInput): string;
```

오늘이 2026-06-01 인 예시 아이의 결과 (PC-F7-AC5):

```
2026년 6월 1일 기준
생후 92일 · 3개월
교정 36일 · 1개월
https://<siteOrigin>/share#b=2026-03-01&d=2026-04-26
```

- 입력 타입에 이름 필드가 없다. 이름이 문구에 들어갈 길이 타입에서 막힌다 (PC-F7-AC6)
- `corrected` 가 `before-due` 면 "교정 D-25 (재태 36주 3일)", `hidden` 이나 `null` 이면 교정 줄을 넣지 않는다
- 첫 줄은 기존 `formatTodayLabel(today)` 를 쓴다. 사이트 이름 줄을 넣을지는 `curvez-designer`·`curvez-nextjs` 가 정한다. 넣으면 `siteName`(미결 6)의 값을 쓴다
- 나이 표시값은 widget 이 `formatAgeSummary` 로 만든 것을 그대로 받는다. feature 는 widget 을 import 하지 않는다
- 클립보드 쓰기와 "문구를 복사했어요" 알림(PC-F7-AC7)은 `features/share-result/ui` 가 한다. 실패했을 때의 문구는 `curvez-designer` 가 정한다

#### ⑬ curvez-nextjs 가 옮길 값 (2026-09-30 원문 대조 반영, 2026-10-02 경계 정정)

기존 4개 파일과 새 3개 파일에 넣을 값이다. 원문을 실제로 연 값만 적었다. 근거 번호는 `.curvez/research/preemie-calc/sources-v2.md` 의 표 행 번호다.

기존 파일

| 파일                     | 필드                                  | 지금                                         | 바꿀 값                                                                                                                                                                                  | 근거                                          |
| ------------------------ | ------------------------------------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| `checkup-rounds.json`    | `meta.lastVerified`                   | `null`                                       | `"2026-09-30"`                                                                                                                                                                           | 사실 #1                                       |
| `checkup-rounds.json`    | `meta.effectiveDate`                  | `null`                                       | `"2026-09-30"`. 원문에 날짜가 없어 ④ 규칙대로 대조한 날을 쓴다                                                                                                                           | 확인 불가 #1, ④ 규칙                          |
| `checkup-rounds.json`    | `rounds[round-1].unverifiedReason`    | 없음                                         | `"출처 표에 1차 행이 없어 원문과 대조하지 못했다 (2026-09-30)"`. 1차의 값(생후 14~35일)은 바꾸지 않는다                                                                                  | 확인 불가 #1                                  |
| `checkup-rounds.json`    | `questionnaireCorrection`             | `미확정`, `round-4`                          | `{ "status": "확정", "value": { "lastCorrectedRoundId": "round-4" } }`                                                                                                                   | PRD §9 2026-09-30 결정(미결 1), 사실 #2       |
| `age-basis.json`         | `meta.lastVerified`                   | `null`                                       | `"2026-09-30"`                                                                                                                                                                           | 사실 #4                                       |
| `age-basis.json`         | `meta.effectiveDate`                  | `null`                                       | `"2026-09-30"`. 원문에 날짜가 없다                                                                                                                                                       | ④ 규칙                                        |
| `copay-relief.json`      | `meta.sources`                        | `source-kukinews` 하나                       | `source-mohw` { name "보건복지부 보도자료 (2026년 1월 시행)", url `https://mohw.go.kr/board.es?act=view&bid=0027&list_no=1488237&mid=a10503010100&nPage=1&tag=` }, `source-nhis` { name "국민건강보험공단 이른둥이 본인부담 경감 안내", url `https://www.nhis.or.kr/static/html/wbma/c/wbmac0226.html` }. `source-kukinews` 는 뺀다 | 사실 #5~8, PRD §9 "보건복지부 보도자료를 정본" |
| `copay-relief.json`      | `sourceNotes` (새 필드)               | 없음                                         | `[{ "sourceId": "source-nhis", "text": "공단 안내 페이지는 2026-09-30 현재 개정 전 내용(신청일부터 만 5세)이다" }]`                                                                     | 사실 #8, PRD §9 "각주로 남긴다"               |
| `copay-relief.json`      | `meta.effectiveDate`                  | `null`                                       | `"2026-01-01"`                                                                                                                                                                           | 사실 #7                                       |
| `copay-relief.json`      | `meta.lastVerified`                   | `null`                                       | `"2026-09-30"`                                                                                                                                                                           | 사실 #5~8                                     |
| `copay-relief.json`      | `innerBoundary`                       | `미확정`, `lower-inclusive`                  | `{ "status": "확정", "value": "upper-inclusive" }`. 231일(33주 0일)은 5년 2개월, 203일(29주 0일)은 5년 3개월 구간이다. 원문은 "33주 이상 37주 미만 5년 2개월", "29주 이상 33주 미만 5년 3개월" 이다. **2026-10-02 정정.** 2026-09-30 판의 이 칸은 `lower-inclusive`(정각은 더 긴 구간)였다. 2026-10-02 `curvez-nextjs` 가 정정한 값으로 옮겼다 | 사실 #5, PRD 버전 4 §9 정정(미결 2 경계), PC-F5-AC6·AC7 |
| `copay-relief.json`      | `endDateMethod`                       | `미확정`, `birth-plus-period`                | `status`·`value` 그대로. `provisionalBasis` 만 `"시작일이 출생일인 것은 보건복지부 보도자료로 확인했다(2026-09-30). 만료일 당일 포함 여부는 원문을 찾지 못했다"`                       | 사실 #6, 확인 불가 #4                         |
| `correction-period.json` | 전부                                  | —                                            | 바꾸지 않는다. `meta` 두 날짜도 `null` 그대로. 값의 원문을 찾지 못했다. `ageBasis` 는 미결 3 이라 그대로 둔다                                                                            | 확인 불가 #2·#3                               |

새 파일의 `meta`

| 파일                         | `sources`                                                                                                                                                                                                                                                   | `effectiveDate`                                         | `lastVerified` |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | -------------- |
| `growth-lms.json`            | `source-data-go-kr-lms` { "공공데이터포털 국민건강보험공단_영유아성장도표LMS기준", `https://www.data.go.kr/data/15133061/fileData.do` }, `source-kdca-growth-chart` { "질병관리청 소아청소년 성장도표 (3세 미만 WHO Growth Standards)", `https://www.kdca.go.kr/kdca/5458/subview.do` } | `"2025-06-25"` (공공데이터포털 수정일, 사실 #10)        | `"2026-09-30"` |
| `vaccination-schedule.json`  | `source-kdca-nip-2026` { "질병관리청 표준예방접종일정표(2026)", `https://nip.kdca.go.kr/irhp/images/egovframework/rte/infm/Immunization_Schedule_for_Children_2026.jpg` }                                                                                    | `"2026-09-30"`. 원본에 연도(2026)만 있고 날짜가 없다    | `"2026-09-30"` |
| `formula-coefficients.json`  | `source-childcare-feeding` { "아이사랑 0~3개월 수유 안내", `https://www.childcare.go.kr/?menuno=429` }                                                                                                                                                       | `"2026-09-30"`. 원문에 날짜가 없다                      | `"2026-09-30"` |

- researcher 는 `checkup-rounds.json`·`age-basis.json` 의 `effectiveDate` 를 `null` 로 두자고 했다. 그러면 `lastVerified` 만 날짜가 되어 `resolveReferenceMeta` 가 멈춘다. ④ 규칙(원문에 날짜가 없으면 대조한 날)을 따른다
- researcher 는 `growth-lms.json` 의 `effectiveDate` 로 `"2024-07-31"` 을 제안했다. 이 날짜는 저장한 파일 이름에만 있고, 다운로드 응답의 파일 이름(`국민건강보험공단_영유아성장도표LMS기준.csv`)과 sources-v2 의 어느 사실에도 없다. 원문에서 확인한 날짜인 수정일을 쓴다
- `vaccination-schedule.json` 의 `lastVerified` 는 researcher 가 원본 이미지를 읽은 날이다. `curvez-nextjs` 가 사실 #18 과 다르게 옮긴 칸이 생기면 그 칸은 대조한 것이 아니다. 옮긴 뒤 원본 이미지와 한 번 더 맞춰 본다

### preemie-calc PRD 미결 값의 위치

아래 한 곳에만 값을 두고, 정해지지 않은 동안 `status: "미확정"` 으로 표시한다. 잠정값을 넣는 경우 그 근거를 `provisionalBasis` 에 적는다.
사용자가 확정하면 그 필드의 값과 `status` 만 바꾼다. 코드는 고치지 않는다.

| PRD §9 | 무엇이 미결인가                             | 값이 모이는 한 곳                                                                                                                 | 잠정값과 근거                                                                                                                            |
| ------ | ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 미결 1 | 문진표·발달선별검사지의 교정 규칙           | `checkup-rounds.json` 의 `questionnaireCorrection`                                                                                | **2026-09-30 PRD §9 결정으로 확정.** `round-4`. ⑬ 표대로 `status: "확정"` 으로 바꾼다                                                    |
| 미결 2 | 경감 구간 경계                              | `copay-relief.json` 의 `innerBoundary`                                                                                            | **2026-10-02 PRD 버전 4 §9 정정으로 확정.** `upper-inclusive`(33주 0일은 5년 2개월, 29주 0일은 5년 3개월 구간. PC-F5-AC6·AC7). 2026-09-30 의 `lower-inclusive`(33주·29주 정각은 더 긴 경감 구간)는 뒤집혔다(결정 로그). ⑬ 표대로 바꾼다 |
| 미결 2 | 경감 종료일 계산 방식                       | `copay-relief.json` 의 `endDateMethod`                                                                                            | 미확정 유지. `birth-plus-period`. 시작일(출생일)은 확인했고 만료일 당일 포함 여부는 원문을 찾지 못했다. PC-F5-AC5 는 날짜가 보이는지만 본다 |
| 미결 3 | 교정 적용 종료를 출생·교정 어느 쪽으로 세나 | `correction-period.json` 의 `ageBasis`                                                                                            | `null`. 정해질 때까지 F6 은 "24개월까지" 같은 개월 문구만 보이고 종료 날짜는 계산하지 않는다 (PC-F6-AC1~4 는 날짜를 요구하지 않는다)     |
| 미결 5 | 쌍둥이·다태아 묶음 표시                     | `entities/child/model` 의 `ChildProfile` 에 필드를 더하는 자리. 더할 때 `ProfileStoreV1` 을 `version: 2` 로 올리고 읽을 때 옮긴다 | 필드 없음. 1단계는 쌍둥이를 따로 저장한 프로필 두 개로 보이고 PC-F1-AC5 로 바꿔 본다                                                     |
| 미결 6 | 사이트 이름과 도메인                        | `shared/config/site.ts` 의 `siteName: Settled<string>`, `siteOrigin: Settled<string>`                                             | `siteName` 은 PRD 제목 "이른둥이 육아 계산기", `siteOrigin` 은 `NEXT_PUBLIC_SITE_ORIGIN` 이 없으면 `http://localhost:3000`. 둘 다 미확정 |

- 기준 데이터의 원문 대조(`meta.effectiveDate`·`meta.lastVerified`)는 PRD 미결이 아니라서 이 표에 넣지 않는다. `### preemie-calc 데이터 모양` ④ 의 규칙을 따른다
- PRD §9 의 목표키 출처(v2 행 7)와 분유량 계수(v2 행 8)는 2026-09-30 에 결정됐다. 그래서 `Settled` 로 감싸지 않는다. 목표키는 ⑩ 의 상수, 분유량은 ⑪ 의 데이터 파일이 한 곳이다
- `OpenQuestionId` 의 `"PRD-9-1"` 은 지우지 않는다. 쓰는 값이 없어져도 타입에 남아 있으면 데이터 파일을 되돌릴 때 코드를 고치지 않아도 된다

### preemie-calc 스택 매핑

| `profile.json`           | 값                        | 이 절에서                                                                                                                     |
| ------------------------ | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `stack`                  | `nextjs`                  | Next.js App Router 웹 앱. 모노레포 안의 두 번째 앱이지만 `stack` 값은 그대로 둔다                                             |
| `paths.web`              | `apps/handwork`           | 이 절과 무관하다. handwork 절의 접두다                                                                                        |
| `paths.preemieCalc`      | `apps/preemie-calc`       | 이 절 모든 경로의 접두. 레이어는 `apps/preemie-calc/src/<층>`                                                                 |
| `paths.preemieCalcTests` | `apps/preemie-calc/tests` | `curvez-qa` 소유. 금지 import 검사 경로에 넣지 않는다                                                                         |
| `architecture`           | `ddd`                     | **실제 구조는 FSD 다.** handwork 절과 같은 이유로 이 문서가 정본이다                                                          |
| `commands.*`             | `pnpm typecheck` 등       | 루트 명령이 `pnpm -r --if-present` 로 돈다. 앱 `package.json` 에 `typecheck`·`lint`·`test`·`build` 스크립트가 있어야 포함된다 |

`apps/preemie-calc/eslint.config.mjs` 는 handwork 의 설정을 따라 ARCH-101~107 을 `no-restricted-imports` 로 옮긴다.
ARCH-108~113 은 import 규칙이 아니라서 `quality-gate.mjs` 의 arch 게이트(grep)로만 검사한다.
ARCH-114~118(recharts)은 import 규칙이지만 arch 게이트로만 검사한다. eslint 설정은 바꾸지 않는다.
차트 라이브러리는 `apps/preemie-calc` 의 dependencies 에 있는 `recharts`(^3.10.1) 하나다. 2026-10-02 사용자 승인으로 설치됐다.

### preemie-calc 예외

| 대상                       | 허용 범위                                                                                       | 만료 조건                 |
| -------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------- |
| `app` 층                   | Next.js 규약(`layout.tsx`·`page.tsx`·`sitemap.ts`)의 이름·위치를 따른다. FSD 세그먼트 규칙 없음 | 없음. 프레임워크 규약이다 |
| `shared`                   | `next/*`·`react` import 허용 (handwork 절과 같은 이유)                                          | 없음                      |
| `entities/*/ui`            | `next/*`·`react` import 허용. `model`·`api`·`data` 는 허용하지 않는다                           | 없음                      |
| `shared/lib/calendar-date` | `new Date()` 를 쓴다. 시계를 읽는 유일한 곳이다. ARCH-108 은 entities 만 검사한다               | 없음                      |

- 검사: `grep -rnE 'from "(next|react)' apps/preemie-calc/src/entities/*/model apps/preemie-calc/src/entities/*/api` 가 0건
- 같은 층 슬라이스 사이의 `import type` 은 예외로 두지 않는다 (결정 로그 참고)

### preemie-calc 권고

정규식으로 검사할 수 없어 lint 에 걸지 않는다. 리뷰에서 본다.

- 같은 층 안에서 슬라이스끼리 부르지 않는다. `import type` 도 포함한다
- 슬라이스 밖에서는 `index.ts` 로만 부른다 (`data/` 는 ARCH-107 이 검사한다)
- `views` 는 조립만 한다. 계산은 entities 에서 끝낸다. 두 entity 슬라이스의 결과를 합치는 일은 widget 에서 한다
- 조각을 widgets·views 중 어디에 둘지는 `### preemie-calc 레이어 정의` 아래의 판정 순서를 따른다
- `/share` 에는 광고·분석 스크립트를 싣지 않는다. 페이지의 스크립트는 `location.hash` 를 읽을 수 있어서, 실으면 fragment 를 고른 이유가 사라진다
- 날짜를 `Date` 객체나 ISO 시각 문자열로 저장·전달하지 않는다. 저장소와 공유 링크에는 `CalendarDate` 만 둔다
- `entities/*/model`·`entities/*/ui` 는 localStorage 를 직접 부르지 않는다. 같은 슬라이스의 `api` 를 거친다 (ARCH-109~113 이 닿지 않는 곳)
- 부모 키와 분유량 체중은 URL 쿼리·fragment 에도 넣지 않는다. 저장소 검사(ARCH-110)는 URL 을 보지 못한다
- `recharts` 는 `widgets/*/ui` 에서만 import 하고, 그 파일 맨 위에 `"use client"` 를 둔다. 같은 widget 의 `lib` 은 recharts 를 부르지 않는다 (ARCH-114~118 이 닿지 않는 곳)
  - 검사 1: `grep -rlE "(from|import\()[[:space:]]*['\"]recharts" apps/preemie-calc/src | grep -vE '/widgets/[^/]+/ui/'` 가 0줄
  - 검사 2: `grep -rlE "(from|import\()[[:space:]]*['\"]recharts" apps/preemie-calc/src | xargs grep -L '^"use client"'` 가 0줄

### preemie-calc 확인 못 한 것

- 카카오톡 공유가 링크의 `#` 뒤를 그대로 전달하는지 확인하지 못했다 (확인 불가). `curvez-nextjs` 가 카카오 공식 문서로 확인한다.
  전달하지 않더라도 쿼리로 바꾸지 않는다. 쿼리로 바꾸면 출생일이 서버로 가므로, 그때는 `curvez-orchestrator` 에게 돌려 사용자가 정한다
- 영유아검진 2~8차의 개월 범위는 원문과 대조했다 (sources-v2 사실 #1). 1차(생후 14~35일)는 출처 표에 행이 없어 대조하지 못했다. `unverifiedReason` 으로 남긴다
- `correction-period.json` 은 아직 원문과 대조하지 못했다. `meta.effectiveDate`·`meta.lastVerified` 가 둘 다 `null` 이다 (sources-v2 확인 불가 #2·#3)
- (2026-10-02 해결) 표준정규분포 함수를 코드로 둘지 라이브러리를 쓸지는 사용자 결정 3 으로 정해졌다. 정방향·역함수 모두 라이브러리 없이 `shared` 의 순수 함수다
- LMS 파일 36개월 행은 0~35개월 행과 산출 근거가 다르다(사실 #14, #16 의 정황). 36개월 측정의 백분위가 WHO 기준이 아니라는 점을 화면에 적을지는 정하지 않았다
- WHO 성장 표준이 Z 가 ±3 을 넘는 구간에 별도 보정을 쓰는지, 공단 LMS 가 그 보정을 전제하는지 원문으로 확인하지 않았다. 이 문서의 계산은 보정 없이 LMS 식 하나만 쓴다
- 측정 자세(누워서/서서)에 따라 키 값을 보정해야 하는지 원문으로 확인하지 않았다. LMS 파일에 자세 구분 열이 없어 자세는 기록만 한다
- 백분위수 환산표(사실 #15)는 행마다 Z 구간을 백분위 정수 하나에 대응시킨다. 백분위 50 행이 Z 0~0.02506 이라, 행 번호는 Φ(Z)×100 을 내림한 값과 같다.
  PC-F8-AC4 "소수점 첫째 자리까지 같다" 를 어떻게 대조할지(내림 정수와 비교, 반올림 경계 처리)는 `curvez-qa` 가 정한다. 환산표에는 Z −2.32635 아래 행이 없다
- A형간염 1·2차의 개별 시점은 원본 이미지에 따로 적혀 있지 않다 (사실 #18). ⑨ 읽기 표의 "한 막대에 여러 차수" 규칙으로 옮긴다
- 분유량 원문은 "3개월이 될 때까지" 이고 PRD §9 결정은 "0~3개월" 이다. 교정 3개월 0일부터는 "기준 확인 중" 으로 읽었다 (결정 로그). `curvez-designer` 의 `screens/formula.md` 는 "4개월 이상" 을 확인 중 상태로 적었다
- recharts ^3.10.1 이 `null` 값에서 선을 끊는지(`connectNulls={false}`), 앞뒤가 `null` 인 점 하나뿐인 토막을 `dot={false}` 에서 어떻게 그리는지 recharts 문서·코드로 확인하지 않았다. `curvez-nextjs` 가 구현할 때 확인한다

### preemie-calc 결정 로그

| 무엇을                                                                                                         | 왜                                                                                                                                                                                                                 | 되돌릴 위치                                             |
| -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------- |
| preemie-calc 도 handwork 와 같은 FSD 로 간다. 레이어 이름·views 개명·의존 방향이 같다                          | 사용자 선택 (2026-09-29, "handwork와 같은 FSD")                                                                                                                                                                    | .curvez/architecture.md:preemie-calc 레이어 정의        |
| 금지 import ID 를 `PC-ARCH-` 가 아니라 `ARCH-101` 부터 붙인다                                                  | `quality-gate.mjs` 는 `ARCH-` 뒤에 숫자 세 자리가 오는 ID 로 시작하는 표 행만 규칙으로 읽는다. `PC-ARCH-001` 은 읽히지 않아 검사가 조용히 빠진다                                                                   | .curvez/architecture.md:preemie-calc 금지 import        |
| ARCH-006(packages 가 앱 alias 금지)의 대응을 "preemie-calc 가 handwork 코드를 부르지 않는다" 로 둔다           | 검사 경로가 apps/preemie-calc/ 로 시작해야 한다. packages 쪽 규칙은 ARCH-006 이 이미 검사하므로, 이 앱에서 지킬 같은 성격의 경계는 앱 사이 경계다                                                                  | .curvez/architecture.md:preemie-calc 금지 import        |
| entities 안에서 시계 읽기를 금지한다 (ARCH-108)                                                                | "오늘" 을 주입받아야 단위 테스트가 날짜를 고정한다 (지시서 ③, SPEC F2 확인 방법)                                                                                                                                   | .curvez/architecture.md:preemie-calc 금지 import        |
| 기준 데이터는 슬라이스마다 `data/` 세그먼트의 JSON 으로 두고, 슬라이스 밖에서 직접 읽지 못하게 한다 (ARCH-107) | 데이터와 그 데이터를 읽는 규칙이 한 슬라이스에 있어야 모양이 바뀔 때 고칠 곳이 하나다. 한 폴더에 모으면 그 폴더를 누가 읽는지 검사할 수 없다                                                                       | .curvez/architecture.md:preemie-calc 폴더 구조          |
| 규칙 슬라이스(checkup 등)는 child 를 부르지 않고 `shared` 의 날짜 타입과 자기 `model` 의 입력 타입으로 값을 받는다 | 같은 층 슬라이스끼리 부르지 않는 규칙을 지키면서 계산을 entities 에 둔다                                                                                                                                           | .curvez/architecture.md:preemie-calc 의존 방향          |
| 날짜는 KST 달력 날짜 문자열 `YYYY-MM-DD` (`CalendarDate`) 로 표현한다                                          | 시각이 없는 값이라 시간대 변환 오류가 생길 곳이 `todayInKst` 하나로 줄어든다. localStorage·URL 에 그대로 넣을 수 있다                                                                                              | .curvez/architecture.md:preemie-calc 데이터 모양        |
| `addMonths` 는 없는 날짜를 그달 말일로 맞춘다 (01-31 + 1개월 = 02-28)                                          | SPEC 은 "같은 날짜가 돌아오면 1개월" 만 정했고 31일생의 2월을 정하지 않았다. 레이어 수와 무관해 하나를 골랐다                                                                                                      | .curvez/architecture.md:preemie-calc 데이터 모양        |
| 재태 범위를 154일 이상 308일 이하로 받는다 (22주 0일 미만·44주 0일 초과가 오류)                                | SPEC F1 예외 "22주 0일 미만", "44주 초과" 를 일수로 옮겼다. 44주 0일은 초과가 아니라서 받는다                                                                                                                      | .curvez/architecture.md:preemie-calc 데이터 모양        |
| 검진 방문 기간을 `start`/`endExclusive` 개월·일로 적고, "4~6개월" 은 7개월 되기 전날까지로 읽는다              | 끝 개월의 말일까지로 읽어야 2026-09-15(생후 6개월 14일)가 4~6개월 차수에 들어가 PC-F4-AC2 가 성립한다. 해석을 코드가 아니라 데이터에 적어 두면 원문 확인 뒤 파일만 고친다. 출처 문구는 `sourceRangeText` 로 남긴다 | .curvez/architecture.md:preemie-calc 데이터 모양        |
| localStorage 는 키 하나 `preemie-calc/profiles` 에 버전이 붙은 전체 상태를 둔다                                | 한 번에 쓰고 한 번에 지운다. 버전이 있어야 미결 5 로 필드가 늘 때 옮길 수 있다                                                                                                                                     | .curvez/architecture.md:preemie-calc 데이터 모양        |
| 전체 삭제는 `preemie-calc/` 로 시작하는 키를 다 지운다                                                         | 2·3단계 저장이 늘어도 삭제 코드를 고치지 않는다                                                                                                                                                                    | .curvez/architecture.md:preemie-calc 데이터 모양        |
| 공유 링크 값은 URL fragment 에 둔다                                                                            | fragment 는 HTTP 요청·서버 기록·Referer 에 실리지 않는다. "아이 정보는 서버로 보내지 않는다" (사용자 고정 결정)를 링크에서도 지킨다                                                                                | .curvez/architecture.md:preemie-calc 데이터 모양        |
| F3~F6 를 `/dashboard` 아래 하위 경로로 둔다                                                                    | PRD §4 가 "대시보드에서 … 로 이동한다" 고 적었다. 화면 배치는 designer 가 정하고, 한 화면으로 합치면 이 표만 고친다                                                                                                | .curvez/architecture.md:preemie-calc 데이터 모양        |
| F13 경로를 `/guide/[weeks]/[months]` 숫자 경로로 둔다                                                          | 481쪽을 `generateStaticParams` 하나로 만든다. 한글 경로·slug 모양은 SEO 판단이라 바꿀 수 있다                                                                                                                      | .curvez/architecture.md:preemie-calc 데이터 모양        |
| F13 진입은 `/?weeks=<n>` 쿼리로 한다                                                                           | 공개 SEO 페이지의 주수일 뿐 아이 정보가 아니다. fragment 로 할 이유가 없다                                                                                                                                         | .curvez/architecture.md:preemie-calc 데이터 모양        |
| PRD 미결 1·2·3·5·6 은 값을 정하지 않고 `Settled<T>` 로 감싼 한 곳에 둔다                                       | standing.md 5번. 확정되면 파일 값만 바꾼다                                                                                                                                                                         | .curvez/architecture.md:preemie-calc PRD 미결 값의 위치 |
| 미결 3 의 잠정값은 `null` 이고, 그동안 F6 은 종료 날짜를 계산하지 않는다                                       | PC-F6-AC1~4 가 날짜를 요구하지 않는다. 잠정 기준으로 날짜를 보이면 확정처럼 읽힌다                                                                                                                                 | .curvez/architecture.md:preemie-calc PRD 미결 값의 위치 |
| 레이어·슬라이스를 더 두지 않는다                                                                               | 라우트 9개(<12), 엔티티 5개(<8). 판단 기준표의 하한 아래다                                                                                                                                                         | .curvez/architecture.md:preemie-calc 레이어 정의        |
| (2026-09-29 이의 1, ACC-04) `ReferenceMeta` 의 `effectiveDate`·`lastVerified` 를 "둘 다 날짜" 또는 "둘 다 `null`(원문 대조 전)" 두 경우의 유니온으로 바꾼다. 대조 전에는 날짜로 채우지 않고 화면은 "기준일 확인 전" 을 보인다. `Settled<CalendarDate>` 는 쓰지 않는다 | 기준일은 원문과 대조해야 얻는 값이다. 대조 전 날짜를 넣으면 SPEC §6 "결과마다 기준 자료명과 기준일" 이 사실이 아닌 날짜로 채워진다. `Settled` 는 PRD §9 미결 번호(`openQuestion`)가 필수라 원문 대조 같은 할 일에 붙일 수 없고, 섞으면 "미확정" 표시가 제품 결정과 대조 작업을 구분하지 못한다. 두 필드를 따로 `null` 허용하면 한쪽만 채운 상태가 생기므로 두 경우로 묶었다. 필드 이름은 그대로라 JSON 4개는 값만 바꾼다 | .curvez/architecture.md:preemie-calc 데이터 모양 |
| (2026-09-29 이의 2, PLC-01) 같은 층 `import type` 을 예외로 두지 않는다. 규칙 슬라이스는 `CorrectedAge`·`GestationalAge` 대신 읽는 필드만 담은 입력 타입을 자기 `model` 에 선언한다. 두 타입을 `shared` 로 옮기지 않는다 | 모순은 데이터 모양 절의 시그니처 쪽 실수였다. 의존 방향 규칙은 그대로 두고 시그니처를 규칙에 맞췄다. `shared` 로 옮기면 교정 나이라는 도메인 개념이 "도메인을 모르는" 층에 들어간다. 타입 전용 예외는 child 의 타입을 바꿀 때 규칙 슬라이스 셋이 함께 깨지는 결합을 남긴다. 구조 타입은 3개 파일 안에서 끝나고 widget 쪽은 고칠 곳이 없다 | .curvez/architecture.md:preemie-calc 의존 방향 |
| (2026-09-29 이의 3, PLC-03) widgets 기준을 "쓰는 view 수" 에서 "entities·features 를 부르는가, 두 view 이상이 쓰는가" 로 바꾼다. 둘 다 아니면 `views/<route>/ui` 에 둔다. 그 결과 `widgets/nav-links` 는 `views/dashboard/ui` 로, `views/guide/lib/build-guide-content.ts` 는 `widgets/guide-content` 로 옮긴다 | 옛 규칙은 자기 예시(검진 도우미 카드)부터 어겼고, 지키려면 widget 5개를 옮겨야 했다. 이 앱에서 widget 이 하는 일은 의존 방향 절이 적은 대로 아이 나이와 규칙 슬라이스를 묶는 것이다. 그 일을 기준으로 삼으면 import 문만 보고 누구나 같은 답을 낸다. 옮길 것은 2개 조각이고, 나머지 widget 4개는 그대로다 | .curvez/architecture.md:preemie-calc 레이어 정의 |
| (2026-09-30 결정 (a)) 성장 LMS 는 공공데이터포털 국민건강보험공단 LMS CSV 를 1차로 쓴다. 키·몸무게·머리둘레 × 남녀, 0~36개월 222행만 `growth-lms.json` 에 옮기고 체질량지수와 37개월 이후 행은 옮기지 않는다. 36개월 행은 옮긴다 | 오케스트레이터 결정(사용자 결정 8). PRD 범위가 0~3세다. 체질량지수는 F8 기록 항목에 없다. 36개월 행을 빼면 PRD 의 "0~36개월" 끝값에서 계산할 행이 없다 | .curvez/architecture.md:preemie-calc 데이터 모양 |
| (2026-09-30 결정 (b)) 예방접종은 질병관리청 원본 표(2026)를 정본으로 쓴다. 국립재활원 재게재본과 달랐던 DTaP 6차·MMR 2차·IPV 3~4차는 원본 값이다 | 오케스트레이터 결정. 사용자 결정 9 가 "재게재본 잠정, 원본과 재대조" 였고, 재대조 결과가 원본 값이다. 질병관리청이 원발행처다 | .curvez/architecture.md:preemie-calc 데이터 모양 |
| (2026-09-30 결정 (c)) 부모 키·분유량 체중은 저장하지 않는다. 측정 기록과 접종 완료는 `preemie-calc/growth-records`·`preemie-calc/vaccinations` 두 키에 아이 id 를 붙여 저장한다. `ProfileStoreV1` 은 올리지 않는다 | 오케스트레이터 결정, PRD §8. 두 키 모두 `preemie-calc/` 로 시작해 "정보 전체 삭제" 가 그대로 지운다. 프로필 키에 넣으면 프로필 저장 코드와 기록 저장 코드가 한 값을 함께 고치게 되고 `version` 을 올려 옮겨야 한다. 따로 두면 기존 저장값을 옮길 일이 없다 | .curvez/architecture.md:preemie-calc 데이터 모양 |
| (2026-09-30 결정 (d). **2026-10-02 사용자 승인(recharts 설치)으로 뒤집힘**, 아래 2026-10-02 행. 이 행의 "데이터 모양은 그대로다" 도 틀렸다. 기준선에 역함수와 새 함수가 필요했다) F8 AC3 추이 그래프는 이번에 만들지 않는다. 기록 목록(측정일 오름차순)과 기록별 백분위 결과만 정하고, 그래프 없이 표로 보일 수 있게 한다 | 오케스트레이터 결정. 차트 라이브러리가 의존성 목록에 없다. 그래프에 필요한 값이 두 함수 결과에 이미 있어 나중에 그래프를 더해도 데이터 모양은 그대로다 | .curvez/architecture.md:preemie-calc 데이터 모양 |
| 엔티티가 9개, 라우트 표가 14행으로 판단 기준표의 하한(엔티티 8·라우트 12)을 넘었지만 레이어를 더하지 않는다. 새 entity 슬라이스 4개(growth·vaccination·target-height·formula)만 더한다 | 오케스트레이터 지시 "기존 레이어·금지 import 규칙은 유지한다". FSD 는 이미 6개 층이고, 새 기능 넷은 모두 "아이 나이 + 규칙 데이터" 라는 기존 모양을 따른다. 기존 결정 로그 "레이어·슬라이스를 더 두지 않는다" 의 근거 수치는 이제 맞지 않는다 | .curvez/architecture.md:preemie-calc 레이어 정의 |
| ARCH-109~113 을 더해 `shared`·`features`·`widgets`·`views`·`app` 층의 `localStorage.`·`sessionStorage.` 사용을 막는다 | 부모 키를 저장하지 않는다는 약속과 "정보 전체 삭제" 가 모든 키를 안다는 약속을 검사할 수 있게 한다. arch 게이트는 규칙 한 줄에 경로 하나만 읽어 층마다 한 줄이다. 더하기 전 5개 경로 모두 0건이었다 | .curvez/architecture.md:preemie-calc 금지 import |
| 백분위는 측정일 나이의 만 개월 행 하나로 계산하고 보간하지 않는다. 백분위는 소수 첫째 자리로 반올림하고, 상담 권고(3 미만·97 초과)는 반올림한 값으로 판정한다 | 원본 LMS 가 개월 단위 행만 준다(사실 #13). 화면에 "3.0" 이 보이는데 상담 문구가 뜨는 일이 없어야 한다 | .curvez/architecture.md:preemie-calc 데이터 모양 |
| `standardNormalCdf` 를 `shared/lib/normal-distribution` 의 순수 함수로 둔다 | 도메인을 모르는 수학이다. 의존성 목록에 통계 라이브러리가 없다. 코드로 둘지는 오케스트레이터가 사용자에게 확인한다(`### preemie-calc 확인 못 한 것`). **2026-10-02 사용자 결정 3 으로 확인됨: 라이브러리 없이 순수 함수, 역함수도 같다** | .curvez/architecture.md:preemie-calc 폴더 구조 |
| 예방접종 권장일은 원본 시기의 시작일이다. "N개월" 은 한 시점(권장일 = 마지막 날), "N~M개월" 은 M+1개월 전날까지, "N세" 는 만 N세 1년 동안으로 읽는다 | PC-F10-AC1 이 "생후 2개월 → 2026-05-01" 을 요구하고 AC2 가 "권장일이 지나면 놓침" 이라 한 시점 접종은 다음 날 놓침이어야 한다. 기간 끝 읽기는 검진 "4~6개월" 과 같다. "4세" 를 한 시점으로 읽으면 생일 다음 날 놓침이 되는데, 원본이 날짜가 아니라 나이로 적었으므로 1년으로 읽었다. 읽기 결과는 데이터의 `window` 에 적혀 파일만 고치면 바뀐다 | .curvez/architecture.md:preemie-calc 데이터 모양 |
| 기간 접종은 기간 안에 있는 동안 "임박" 으로 둔다. 상태 값은 designer 와 같은 네 개(done·soon·missed·upcoming)다 | 권장일을 시작일로 두면 기간 둘째 날부터 "놓침" 이 되는데, 아직 권장 기간 안이다. 새 상태 값을 만들지 않고 "곧 맞아야 함" 인 soon 에 넣었다 | .curvez/architecture.md:preemie-calc 데이터 모양 |
| 대체 백신(RV1·RV5, 일본뇌염 두 종류)은 `alternativeGroup` 으로 묶고, 한쪽에 완료 체크가 생기면 다른 쪽 차수를 목록에서 뺀다 | 원본이 백신 종류마다 횟수를 다르게 적었다(사실 #18). 선택을 따로 저장하지 않아도 완료 체크에서 알 수 있다. "해당 없음" 같은 다섯째 상태를 만들지 않는다 | .curvez/architecture.md:preemie-calc 데이터 모양 |
| 분유량 계수 구간의 끝을 교정 3개월 0일(`endExclusive {3,0}`)로 둔다. 그 뒤는 "기준 확인 중" 이다 | 원문이 "3개월이 될 때까지" 다. PRD §9 의 "0~3개월" 을 검진처럼 "3개월의 마지막 날까지" 로 읽으면 원문이 다루지 않는 기간에 계수를 보이게 된다. 경계는 데이터 파일의 `ageWindow` 에 있어 파일만 고치면 바뀐다 | .curvez/architecture.md:preemie-calc 데이터 모양 |
| 목표키는 데이터 파일 없이 `entities/target-height/model` 의 상수로 두고, 0.1cm 정수로 계산한다 | 확인된 출처 URL 이 없어 `ReferenceMeta` 를 채울 수 없다. 소수를 그대로 계산하면 반올림 결과가 부동소수 오차로 바뀔 수 있다 | .curvez/architecture.md:preemie-calc 데이터 모양 |
| 측정 기록의 다섯 값을 모두 필수로 두고, 몸무게는 정수 g(`weightGrams`)로 저장한다 | designer 의 `GrowthEntryForm` 이 다섯 칸 모두 필수다. 출생 체중(`birthWeightGrams`)과 단위를 맞추면 F15 미리 채우기에서 변환이 한 번뿐이다 | .curvez/architecture.md:preemie-calc 데이터 모양 |
| 원문에 날짜가 없는 기존 파일(`checkup-rounds`·`age-basis`)의 `effectiveDate` 는 researcher 제안(`null`) 대신 대조한 날로 채운다. `growth-lms.json` 의 `effectiveDate` 는 제안값 2024-07-31 대신 공공데이터포털 수정일 2025-06-25 로 둔다 | `null` 을 두면 한쪽만 `null` 이 되어 `resolveReferenceMeta` 가 멈추고, ④ 규칙이 이미 "원문에 날짜가 없으면 대조한 날" 로 정했다. 2024-07-31 은 원문 어디에서 왔는지 sources-v2 에 적혀 있지 않다 | .curvez/architecture.md:preemie-calc 데이터 모양 |
| `copay-relief.json` 의 출처를 기사(`source-kukinews`)에서 보건복지부 보도자료와 공단 안내로 바꾸고, 공단 안내가 개정 전이라는 각주를 새 필드 `sourceNotes` 에 둔다. `CheckupRound` 에 선택 필드 `unverifiedReason` 을 더한다 | PRD §9 결정이 보도자료를 정본으로, 공단 페이지 미갱신을 각주로 정했다. 각주는 출처에 붙는 문장이라 `ReferenceSource` 를 바꾸지 않고 파일에 둔다. 1차 검진만 대조하지 못한 사실을 파일 전체의 `lastVerified` 로는 표현할 수 없다 | .curvez/architecture.md:preemie-calc 데이터 모양 |
| 결과 문구 함수 `buildShareText` 를 `features/share-result/lib` 에 두고, 입력에 이름 필드를 두지 않는다 | 공유 링크를 만드는 곳과 같은 feature 다. 나이 표시값은 widget 이 이미 만들어 넘긴다. 입력 타입에 이름이 없으면 PC-F7-AC6 이 타입에서 지켜진다 | .curvez/architecture.md:preemie-calc 데이터 모양 |
| LMS 데이터 파일 이름을 `growth-lms.json` 으로 한다. designer 의 `screens/growth.md` 가 적은 `growth-percentile.json` 과 다르다 | 파일에 든 것이 LMS 값이다. 백분위수 환산표는 따로 있고 앱 데이터로 옮기지 않는다. 같은 "percentile" 이름을 쓰면 두 파일을 헷갈린다 | .curvez/architecture.md:preemie-calc 폴더 구조 |
| (2026-09-30, **2026-10-02 PRD 버전 4·SPEC 버전 6 로 뒤집힘**) 경감 구간 경계 `innerBoundary` 를 `lower-inclusive`(33주·29주 정각은 더 긴 경감 구간)로 확정한다. 이 결정은 그때 ⑬ 표와 미결 위치 표에만 적혔고 이 로그에 행이 없어 2026-10-02 에 옮겨 적었다 | 그때 PRD §9 결정(버전 2·3)을 따랐다. 경위: 오케스트레이터가 사용자에게 올린 질문의 괄호 설명이 원문과 반대였고, 그 설명대로 정해졌다. PRD 버전 4 가 "조사 브리프의 설명이 원문과 반대였고 대조하지 않고 옮겼다" 고 정정했다 | .curvez/architecture.md:preemie-calc PRD 미결 값의 위치 |
| (2026-10-02) 경감 구간 경계 `innerBoundary` 를 `upper-inclusive` 로 확정한다. 231일(33주 0일)은 5년 2개월, 203일(29주 0일)은 5년 3개월 구간이다. ⑬ 표와 미결 위치 표를 이 값으로 고쳤다 | PRD 버전 4 §9 정정과 SPEC 버전 6 PC-F5-AC6·AC7. 보건복지부 보도자료 원문이 "33주 이상 37주 미만", "29주 이상 33주 미만" 이다. 코드(`copay-relief.json`)는 2026-10-02 `curvez-nextjs` 가 이미 바꿨고, 이 문서가 그 값과 반대를 말하고 있었다 | .curvez/architecture.md:preemie-calc PRD 미결 값의 위치 |
| (2026-10-02) F8 AC3 추이 그래프를 만든다. 차트는 `recharts` 로 그리고 `widgets/*/ui` 의 `"use client"` 파일에서만 import 한다. ARCH-114~118 로 shared·entities·features·views·app 을 막는다 | 사용자 원문 "권고대로 하고 recharts 설치". 그래프는 entity 값을 받아 그리므로 판정 순서 1 에 따라 widget 이다. 브라우저 전용 큰 라이브러리를 한 층의 잎 파일에 가둬야 서버에서 그리는 481쪽과 `model` 테스트가 recharts 를 끌고 가지 않는다 | .curvez/architecture.md:preemie-calc 금지 import |
| (2026-10-02) `inverseStandardNormalCdf` 를 `shared/lib/normal-distribution` 의 순수 함수로 더한다. 라이브러리를 쓰지 않는다 | 사용자 결정 3(표준정규분포 함수는 라이브러리 없이, 역함수도 같은 방침). 정방향과 짝이라 같은 모듈에 둔다 | .curvez/architecture.md:preemie-calc 폴더 구조 |
| (2026-10-02) 백분위 기준선 3·50·97 은 기록의 측정일마다 그 나이의 만 개월 LMS 행으로 계산한다. 개월 격자로 계산하지 않는다 | x축이 측정일이라(designer 결정) 개월 격자 점은 x 좌표가 없다. 기록 점의 백분위와 같은 행을 써야 점과 기준선의 위아래가 표와 맞는다. 대가로 기록 사이 기준선은 직선이다 | .curvez/architecture.md:preemie-calc 데이터 모양 |
| (2026-10-02) 기준값 계산은 새 함수 `growthReferenceValues`·`lmsValueAtZ` 로 `entities/growth/model` 에 두고 `growthPercentiles` 는 바꾸지 않는다. 측정일 나이 계산은 두 함수가 함께 쓰는 비공개 함수 하나로 둔다 | 기존 함수의 결과에 필드를 더하면 그것을 통째로 비교하는 테스트가 깨질 수 있다. 나이 계산을 한 곳에 둬야 두 함수가 같은 LMS 행을 쓴다 | .curvez/architecture.md:preemie-calc 데이터 모양 |
| (2026-10-02) 기록 → 그래프 점 변환 `buildGrowthTrendPoints` 를 `widgets/growth-panel/lib` 의 순수 함수로 두고, 점의 `cautionNeeded` 는 그 지표 하나의 `consult` 로 정한다. designer 스펙의 "GrowthRecordRow.cautionNeeded 그대로" 와 다르다 | `@/entities/growth` 를 부르므로 widget 이고, React 없이 테스트하려면 `ui` 가 아니라 `lib` 이다. 표의 행 판정은 세 지표 중 하나라도 해당하면 `true` 라 지표별 그래프에 그대로 쓰면 다른 지표 때문에 주의 모양이 찍힌다. designer 와 다르게 정한 것이라 오케스트레이터에게 알린다 | .curvez/architecture.md:preemie-calc 데이터 모양 |

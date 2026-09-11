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

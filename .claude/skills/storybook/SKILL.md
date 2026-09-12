---
name: storybook
description: handwork 의 컴포넌트에 스토리를 붙이고 다크모드까지 확인한 뒤 build-storybook 게이트를 통과시킨다. "스토리 써줘", "스토리북 띄워줘", "스토리북 붙여줘", "다크모드 확인해줘", "컴포넌트 눈으로 보자", "write stories", "storybook", "build-storybook", "/storybook" 이라고 하거나 `shared/ui/` 에 컴포넌트를 만든 직후에 실행한다.
---

스토리는 장식이 아니라 **컴포넌트를 서버 없이 렌더해 보는 유일한 자리**다.
handwork 에는 테스트가 없다 — `.curvez/profile.json` 의 `commands` 에 `test` 가 없다.
그래서 컴포넌트가 라이트와 다크 양쪽에서 실제로 그려지는지 판정하는 수단이 이것뿐이다.

이 스킬은 **스토리를 쓰고 게이트를 돌리는 절차**만 다룬다. 설정은 이미 만들어져 동작한다.

## 언제 이 스킬을 쓰는가

- `shared/ui/` 나 `entities/*/ui/` 에 컴포넌트를 만들고 스토리를 붙일 때
- 컴포넌트의 variants·states 를 눈으로 대조해야 할 때
- 다크 모드에서 토큰이 실제로 뒤집히는지 확인할 때
- `build-storybook` 이 실패해 원인을 가려야 할 때
- 새 프리미티브를 `shadcn add` 로 받은 뒤 스토리로 확인할 때

## 언제 쓰지 않는가

- 토큰 축·컴포넌트 스펙·적용 가이드를 **값으로 확정**할 때 → 같은 프로젝트의 `design-system` 스킬을 쓴다. 이 스킬은 확정된 것을 화면에 올리기만 한다
- `typecheck` · `lint` · `build` 를 묶어 품질 수치를 내야 할 때 → `curvez:quality-gate` 를 쓴다. 이 스킬은 스토리북 게이트 하나만 본다
- 화면 코드(`views/` · `widgets/` · `app/`)를 쓰거나 고칠 때 → `curvez:nextjs-implementation` 을 쓴다. 그 층은 스토리에 올리지 않는다

**이유:** 셋은 수명이 다르다. 값은 오래 살고 게이트는 라운드마다 돌고 화면 코드는 매번 바뀐다.
한 흐름에서 섞으면 스토리가 안 뜰 때 그것이 값 문제인지 코드 문제인지 게이트 문제인지
판정할 근거가 사라지고 셋을 동시에 고치게 된다.

### 경계가 한쪽에만 그어진 것을 알고 넘어간다

위 목록은 코어 스킬을 이름으로 배제하지만, **코어 스킬에는 이 스킬의 이름이 적히지 않는다.**

**이유:** 코어 스킬이 특정 프로젝트의 스킬 이름을 알면, 그 이름이 없는 다른 프로젝트에서
존재하지 않는 것을 가리키게 된다. 경계가 반쪽인 것을 인정하고 트리거가 실제로 겹치는지는
아래 명령으로 사람이 대조한다.

```bash
grep -rn "스토리북\|storybook\|스토리" plugins/curvez/skills .claude/skills --include='SKILL.md'
```

출력을 눈으로 읽고 겹치는 코어 스킬이 나오면 **이 문서의 `## 언제 쓰지 않는가` 쪽에만** 추가한다.

## 이미 확정된 설정 — 다시 정하지 않는다

아래는 `apps/handwork/.storybook/` 에 이미 있고 스토리 0개 상태에서 `storybook build` 가
exit 0 으로 끝나는 것까지 실제로 돌려 확인한 값이다. **이 값을 다시 고르지 마라.**

| 파일          | 확정된 것                                                                                                                                   |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `main.ts`     | `framework: "@storybook/nextjs-vite"` · `addons: ["@storybook/addon-themes"]` · `staticDirs: ["../public"]` · `core.disableTelemetry: true` |
| `preview.ts`  | `../src/app/globals.css` 와 `./preview.css` import · `withThemeByClassName` 데코레이터 · `backgrounds.disable: true`                        |
| `preview.css` | Pretendard 가변 폰트를 npm 패키지에서 직접 싣고 `--font-sans` · `--font-geist-mono` 를 채운다                                               |

**스토리 glob 은 둘뿐이다.**

```
../src/shared/ui/**/*.stories.@(ts|tsx)
../src/entities/*/ui/**/*.stories.@(ts|tsx)
```

**명령은 이미 `package.json` 에 있다.** 새로 만들지 않는다.

| 목적      | 명령                                                              |
| --------- | ----------------------------------------------------------------- |
| 개발 서버 | `pnpm --filter handwork storybook` (포트 6006)                    |
| 정적 빌드 | `pnpm --filter handwork build-storybook`                          |
| 게이트    | `pnpm --filter handwork exec storybook build --output-dir <경로>` |

**`preview.css` 를 지우지 마라.**
**이유:** 앱에서는 `src/app/layout.tsx` 의 `next/font` 가 `--font-sans` 를 채우는데, 스토리북은
`layout.tsx` 를 렌더하지 않아 그 변수가 비어 있다. 비면 `font-sans` 유틸이 아무 서체도 고르지 못해
스토리와 실제 화면의 글자가 서로 다른 모양으로 보이고 그 차이가 컴포넌트 결함처럼 읽힌다.

## 절차

### 1. 스토리를 쓴다

**스토리 파일은 컴포넌트 파일 바로 옆에 둔다.** `shared/ui/card.tsx` ↔ `shared/ui/card.stories.tsx`.
**이유:** 컴포넌트를 고칠 때 스토리가 눈에 들어와야 같이 고쳐진다. 다른 디렉터리로 떼어 두면
스토리만 낡은 props 를 들고 남고 그 스토리는 빌드가 깨지기 전까지 아무도 열지 않는다.

컴포넌트 하나에 스토리 하나로는 모자란다. **스펙의 `## variants` 와 `## states` 를 스토리로 옮긴다.**

| 스펙에 있는 것                        | 스토리로 만들 것                                                        |
| ------------------------------------- | ----------------------------------------------------------------------- |
| `## variants` 의 허용값               | 변형마다 스토리 하나. 또는 한 스토리 안에 나란히 놓는다                 |
| `state:default`                       | 기본 스토리. 이름은 `Default`                                           |
| `state:hover` · `state:focus-visible` | args 로 강제할 수 없으면 스토리 설명에 "포인터·키보드로 확인" 을 적는다 |
| `state:disabled`                      | `args: { disabled: true }` 스토리                                       |
| `state:loading` (있으면)              | `args: { loading: true }` 스토리                                        |

**값을 스토리에서 새로 만들지 마라.** props 기본값·문구·색은 전부 `apps/handwork/design/components/<Name>.md` 에서 가져온다.
**이유:** 스토리에만 있는 값은 스펙에 남지 않는다. 다음 사람이 스펙을 읽고 만든 화면과 스토리가
서로 달라지고 어느 쪽이 맞는지 판정할 근거가 사라진다.

**끝났다고 판정하는 기준:** 아래 검증의 `components` 와 `stories` 가 같거나 `stories` 가 더 크다.

### 2. 다크 모드를 데코레이터로 확인한다

테마 전환은 `@storybook/addon-themes` 의 `withThemeByClassName` 이 `<html>` 에 `.dark` 를 붙였다 떼는 것이다.
스토리북 툴바의 테마 스위치로 두 테마를 모두 열어 본다.

```
withThemeByClassName({ themes: { light: "", dark: "dark" }, defaultTheme: "light" })
```

`light` 가 빈 문자열인 것이 정상이다. `globals.css` 의 `:root` 가 라이트 값이고 `.dark` 가 그것을 덮는다.

**`next-themes` 를 스토리북에 띄우지 마라.**
**이유:** 프로바이더가 하나 더 생기면 테마가 앱과 다른 경로로 걸린다. 그러면 스토리에서 통과한 것이
실제 화면에서 깨져도 스토리는 계속 초록색이다. 토글하는 것은 `.dark` 클래스 하나뿐이니
데코레이터가 그 클래스만 직접 붙이는 편이 앱과 같은 경로다.

**배경 애드온을 켜지 마라.**
**이유:** 애드온이 자기 회색을 덧칠하면 토큰이 정한 배경 위에서 대비를 눈으로 판정할 수 없다.
`preview.ts` 가 `backgrounds.disable: true` 로 이미 꺼 뒀다.

확인할 것은 셋이다.

- 다크에서 배경·글자·테두리가 **토큰을 따라 뒤집히는가.** 한쪽만 뒤집히면 그 자리에 색 리터럴이 박힌 것이다
- 포커스 링이 두 테마 모두에서 보이는가 (`--ring`)
- 글자가 Pretendard 로 그려지는가. 시스템 기본 서체로 보이면 `preview.css` 가 실리지 않은 것이다

**끝났다고 판정하는 기준:** 스토리마다 라이트·다크를 모두 열었고 뒤집히지 않는 자리를 0건으로 확인했다.
뒤집히지 않는 자리를 찾으면 스토리를 고치지 말고 컴포넌트의 색 리터럴을 토큰으로 바꾼다.

### 3. `build-storybook` 게이트를 통과시킨다

```bash
pnpm --filter handwork exec storybook build --output-dir /tmp/sb-out
```

exit 0 이어야 한다. 실패하면 아래 순서로 원인을 가른다.

| 증상                                  | 먼저 볼 것                                                                              |
| ------------------------------------- | --------------------------------------------------------------------------------------- |
| 스타일이 전혀 안 먹는다               | `preview.ts` 의 `../src/app/globals.css` import 경로                                    |
| 글자만 다르다                         | `preview.css` 의 Pretendard import                                                      |
| `react-remove-scroll is not in cache` | `node --version` 을 확인해 보고에 남긴다. Node 20 에서 보고된 사례다                    |
| 서버 전용 API 오류                    | `views/` 나 `app/` 의 무언가가 스토리에 끌려 들어왔다. glob 두 개 밖의 import 를 찾는다 |
| 정적 자산이 404                       | `staticDirs: ["../public"]` 가 살아 있는지                                              |

**원인을 못 가르면 대체 방식을 지어내지 마라.** "확인 불가" 로 보고한다.
**이유:** 설정을 바꿔 통과시키면 무엇이 원인이었는지 기록이 남지 않는다. 다음 라운드에 같은 실패가
다시 나고, 그때는 바뀐 설정 때문에 원래 증상조차 재현되지 않는다.

**끝났다고 판정하는 기준:** 게이트 명령이 exit 0, 그리고 아래 검증의 `out-of-scope-stories=0`.

## 규칙

- **`views/` 와 `app/` 을 스토리에 올리지 마라.** glob 두 개 밖으로 나가지 않는다
  - **이유:** 둘은 서버 컴포넌트이고 Storybook 의 RSC 지원은 공식 문서가 experimental 이라고 적어 둔 상태다. 올리면 빌드가 통과할 때도 있고 안 할 때도 있어 실패가 내 코드 문제인지 프레임워크 지원 문제인지 판정할 근거가 사라진다
- **텔레메트리를 켜지 마라.** `main.ts` 의 `core.disableTelemetry: true` 를 지우지 않는다
  - **이유:** 기본값이 켜짐이라, 지우면 빌드를 돌릴 때마다 익명 통계가 밖으로 나간다. 게이트는 CI 에서도 돌 것을 전제한다
- **`shared/ui/` 에 데이터 페칭을 넣지 마라**
  - **이유:** 스토리북은 그 컴포넌트를 서버 없이 렌더한다. 페칭이 섞이면 스토리가 뜨지 않고 그 실패가 컴포넌트 결함인지 스토리북 설정 문제인지 구분되지 않는다
- **새 프리미티브는 `shadcn add` 로 받는다.** 이 저장소의 shadcn 은 `base-nova` 스타일이고 기반은 `@base-ui/react` 다 — Radix 가 아니다.
  `pnpm exec shadcn add button --dry-run` 이 `src/shared/ui/button.tsx` 로 해석되고 받는 소스가 `@base-ui/react/button` + `cva` + `cn` 을 쓰는 것까지 실제로 돌려 확인했다
  - **이유:** Radix 를 전제한 코드는 합성 패턴과 `data-state` 속성 이름이 Base UI 와 다르다. 그대로 쓰면 타입은 통과하는데 런타임에 아무 동작도 붙지 않고 그 실패는 스토리를 눈으로 보기 전까지 드러나지 않는다
- **확인하지 않은 수치를 적지 마라.** 스토리 개수·빌드 시간·Node 판본은 전부 명령을 돌려 얻은 출력을 옮긴다
  - **이유:** 그럴듯한 수치는 실제로 돌려 얻은 수치와 보고서에서 똑같이 생겼다. 읽는 사람은 둘을 구분하지 못하고 믿는다

## 검증

아래를 **실제로 돌리고** 출력을 핸드오프의 `verification` 에 원문 그대로 옮긴다.

```bash
# 1. 설정 3종이 있는가
for f in apps/handwork/.storybook/main.ts apps/handwork/.storybook/preview.ts apps/handwork/.storybook/preview.css; do
  test -f "$f" || echo "MISSING-CONFIG $f"
done

# 2. 스토리 범위 — glob 두 개 안에만 있는가
echo "components=$(find apps/handwork/src/shared/ui -name '*.tsx' -not -name '*.stories.tsx' 2>/dev/null | wc -l | tr -d ' ')"
echo "stories=$(find apps/handwork/src/shared/ui apps/handwork/src/entities -name '*.stories.tsx' 2>/dev/null | wc -l | tr -d ' ')"
echo "out-of-scope-stories=$(find apps/handwork/src/views apps/handwork/src/app apps/handwork/src/widgets -name '*.stories.tsx' 2>/dev/null | wc -l | tr -d ' ')"

# 3. next-themes 가 스토리북 쪽으로 새어 들어오지 않았는가
echo "next-themes-in-storybook=$(grep -rl 'next-themes' apps/handwork/.storybook apps/handwork/src/shared/ui/*.stories.tsx 2>/dev/null | wc -l | tr -d ' ')"

# 4. 텔레메트리가 꺼져 있는가
grep -q 'disableTelemetry: true' apps/handwork/.storybook/main.ts && echo "telemetry=off" || echo "telemetry=ON-위반"

# 5. 게이트 — exit 0 이어야 한다
pnpm --filter handwork exec storybook build --output-dir /tmp/sb-out
echo "storybook-build-exit=$?"

# 6. 번들에 토큰과 폰트가 실제로 들어갔는가. 0 이면 스타일 파이프라인이 끊긴 것이다
echo "css-token-vars=$(cat /tmp/sb-out/assets/*.css 2>/dev/null | grep -oE '\-\-[a-z-]+:' | sort -u | wc -l | tr -d ' ')"
echo "css-dark-block=$(cat /tmp/sb-out/assets/*.css 2>/dev/null | grep -c '\.dark' | tr -d ' ')"
echo "css-font-face=$(cat /tmp/sb-out/assets/*.css 2>/dev/null | grep -c '@font-face' | tr -d ' ')"

# 7. 실패를 판정할 때 필요한 환경 정보
node --version
```

게이트가 실패하면 **실패한 명령과 실제 출력을 그대로** 남기고 `status: partial` 로 낮춘다.
**통과했다고 쓰지 마라.**
**이유:** 수신 에이전트는 `done` 을 믿고 그 컴포넌트를 화면에 붙인다. 검증 안 된 `done` 하나가
뒤의 모든 작업을 잘못된 전제 위에 올린다.

## 완료 기준

- [ ] `MISSING-CONFIG` 출력 **0줄** — `main.ts` · `preview.ts` · `preview.css` 가 전부 있다
- [ ] `storybook-build-exit=0` — 게이트 명령이 exit 0
- [ ] `stories >= components` — `shared/ui/` 의 컴포넌트마다 스토리가 하나 이상
- [ ] `out-of-scope-stories=0` — `views/` · `app/` · `widgets/` 에 스토리 0개
- [ ] `next-themes-in-storybook=0` — 스토리북 쪽에 `next-themes` 참조 0건
- [ ] `telemetry=off`
- [ ] `css-token-vars` 와 `css-dark-block` 과 `css-font-face` 가 전부 **1 이상** — 0 이면 Tailwind 나 폰트가 실리지 않은 것이다
- [ ] 스토리마다 라이트·다크를 모두 열었고 토큰을 따라 뒤집히지 않는 자리 **0건**
- [ ] 위 항목 중 하나라도 못 채우면 `status: done` 을 쓰지 않는다. `partial` 로 낮추고 실패 출력을 원문 그대로 남긴다

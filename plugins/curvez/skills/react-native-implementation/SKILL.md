---
name: react-native-implementation
description: React Native / Expo 화면·컴포넌트·네비게이션을 아키텍처 경계와 디자인 스펙대로 구현한다. "모바일 화면 만들어줘", "RN 구현해줘", "Expo 화면 붙여줘", "네이티브 화면 붙여줘", "implement mobile screen", "react native implementation" 이라고 하거나 `paths.mobile` 아래 소스를 쓸 때 실행한다.
---

모바일 구현이 깨지는 자리는 코드가 아니라 전제다. 소스 경로·SDK 버전·경계 규칙·스펙 값을 **어디서 읽는지**가
고정돼 있지 않으면 실행마다 다른 값을 추측하고, 그 차이는 타입 에러가 아니라 런타임 크래시로 나타난다.

이 스킬은 **읽는 순서와 검증 수치**를 고정한다.
무엇을 고를지의 **판정 표**(플랫폼 분기 / 관리형 vs 네이티브 / 네비게이션 구조 / 리스트 가상화 / tie-break)는
`plugins/curvez/agents/curvez-react-native.md` 의 `## 판단 기준` 이 정본이다. 여기에 옮겨 적지 않는다.
**이유:** 같은 판정 기준이 두 곳에 있으면 한쪽만 고쳐졌을 때 어느 쪽이 맞는지 판정할 근거가 사라진다.

## 언제 이 스킬을 쓰는가

- `.curvez/design/` 의 화면·컴포넌트를 React Native / Expo 코드로 옮길 때
- `profile.json` 의 `paths.mobile` 아래에 화면·컴포넌트·훅·네비게이션 파일을 쓰거나 고칠 때
- 모바일 라우트를 등록하거나 네비게이션 구조를 코드에 반영할 때
- 구현한 모바일 코드가 `## 금지 import` 규칙을 어기지 않는지 스스로 검사할 때
- `curvez-react-native` 로 실행될 때

## 언제 쓰지 않는가

- 웹(Next.js) 화면·라우트를 구현할 때 → `nextjs-implementation` 을 쓴다
- 화면·컴포넌트 스펙 자체를 만들거나 고칠 때 → `wireframe-spec` 을 쓴다. `platform:` 값·상태 키·토큰을 정하는 건 `curvez-designer` 소유다
- 레이어 정의·의존 방향·금지 import 표를 만들거나 고칠 때 → `architecture-setup` 을 쓴다
- 코드를 쓰지 않고 검증만 돌릴 때 → `quality-gate` 를 쓴다
- 핸드오프 JSON 을 쓰거나 읽을 때 → `agent-contract` 를 쓴다
- 지시가 여러 파일·모듈에 걸쳐 있어 담당을 나눠야 할 때 → `team-orchestration` 이 먼저다. 이 스킬은 담당과 파일 범위가 정해진 뒤에 돈다

**이유:** 구현 스킬이 스펙이나 경계 규칙까지 손대면 그 변경은 리뷰 없이 코드와 함께 들어간다.
스펙과 코드가 어긋난 게 아니라 스펙이 코드에 맞춰 조용히 바뀌어, 어긋남 자체가 검출되지 않는다.

## 절차

### 1. `profile.json` 에서 경로·버전·명령을 읽는다

첫 코드를 쓰기 전에 실행한다.

```bash
P=.curvez/profile.json
[ -f "$P" ] || { echo "profile 없음 -> blocked (bootstrap 먼저)"; exit 1; }
node -p "JSON.stringify({
  stack: require('$PWD/$P').stack,
  mobile: require('$PWD/$P').paths && require('$PWD/$P').paths.mobile,
  sdk: require('$PWD/$P').expo && require('$PWD/$P').expo.sdkVersion,
  domain: require('$PWD/$P').paths && require('$PWD/$P').paths.domain,
  commands: require('$PWD/$P').commands
}, null, 2)"
```

| 키 | 없으면 |
|---|---|
| `paths.mobile` | `blocked`. `blocked_on` 에 `who: curvez-orchestrator` + 키 이름 |
| `expo.sdkVersion` | `blocked`. 같은 방식 |
| `paths.domain` (`stack` 이 `monorepo` 일 때) | `blocked`. 같은 방식 |
| `commands.*` | 있는 것만 돌린다. 없는 명령을 지어내지 않는다 |
| `paths.tests` | 유일하게 폴백 허용 (`*.test.*` / `*.spec.*` / `__tests__/`). 이 스킬은 여기에 쓰지 않는다 |

**`app.json` / `app.config.*` / `package.json` 의 `expo` 필드로 소스 경로를 탐색하지 마라.**
**이유:** 구현 스킬마다 자기 폴백을 만들면 monorepo 에서 두 구현 에이전트가 같은 디렉터리를 소유하게 된다.
병렬 실행에서 나중에 쓴 쪽이 앞선 쪽을 조용히 지우고, 이 손실은 diff 에 "삭제"로 보이지 않아 리뷰에서도 안 잡힌다.

**Expo SDK 버전은 `expo.sdkVersion` 한 곳에서만 읽는다. 모바일 `package.json` 실측으로 대체하지 마라.**
**이유:** Expo 는 SDK 버전마다 `react-native`·`react`·`expo-*` 버전이 고정 짝이다. 버전이 어긋나면
타입 에러가 아니라 네이티브 링크 실패·런타임 크래시로 나타나 증상과 원인이 멀다.
게다가 실측 폴백을 허용하면 "프로파일이 실제와 맞는가"를 검사할 기준 자체가 사라진다 —
`expo.sdkVersion` 과 실측이 다르다는 사실이 문제로 보고되지 않고 조용히 실측 쪽으로 흡수된다.
설치는 버전을 직접 쓰지 말고 SDK 정렬 설치 명령(`expo install`)을 쓴다.

### 2. `architecture.md` 에서 배치 기준과 금지 패턴을 읽는다

```bash
ARCH=.curvez/architecture.md
[ -f "$ARCH" ] || { echo "architecture.md 없음 -> blocked"; exit 1; }
grep -n '^## \(스택 매핑\|금지 import\|예외\)' "$ARCH"
```

- `## 스택 매핑` — 자기 스택(`react-native`, `monorepo` 면 모바일 쪽)의 레이어 대응을 읽는다. **여기 적힌 경로가 파일 배치의 유일한 기준이다.** 관례로 디렉터리를 만들지 않는다
- `## 금지 import` — `규칙 ID | 검사 경로 | 금지 패턴 (ERE) | 이유` 표다. 패턴을 코드나 다른 파일에 복사하지 말고 6단계에서 표를 직접 파싱해 쓴다
- `## 예외` — 만료 조건과 함께 표에 적힌 항목만 예외다. 표에 없는 우회는 위반이다

### 3. `.curvez/design/` 에서 구현 대상만 골라낸다

읽는 순서는 `index.md` 의 화면 목록 → `screens/<screen-id>.md` → 거기서 참조하는 `components/<ComponentName>.md` 다.

```bash
grep -rn 'platform:' .curvez/design/screens .curvez/design/components
```

- **`platform:` 값이 `both` 또는 `rn` 인 항목만 구현한다.** 확정값은 `rn` 이다 — `react-native` 로 쓰지 않는다. `route(rn)` 과 어휘를 맞춘 값이다
- `platform: nextjs` 항목은 `curvez-nextjs` 소유다. 손대지 않는다
- 라우트 이름은 `route(rn)` 값을 그대로 쓴다. 파일명에서 유추하지 않는다
- 상태는 `state:default` `state:loading` `state:empty` `state:error` 넷이 전부다
- 토큰은 `--<category>-<role>-<variant>` 이름 그대로 RN 테마 상수에 매핑한다. hex·px 값을 컴포넌트에 직접 쓰지 않는다
- `index.md` 의 **미결 질문**에 걸린 화면은 구현하지 않는다. `blocked_on` 에 `who: curvez-designer`

**스펙에 없는 상태(빈 상태·에러·로딩·권한 거부·오프라인)를 지어내지 마라.**
**이유:** 임시로 만든 UI 에는 "임시"라는 표시가 코드에 남지 않는다. 다음 리뷰에서 확정 스펙과 구별되지 않아 그대로 출시된다.

### 4. 구현 단위를 정한다

**화면 1개 + 그 화면 전용 컴포넌트 + 그 화면의 라우트 등록**까지가 한 단위다.
새로 만들 공용 컴포넌트가 있으면 같은 단위에 넣는다.

- 상한: 새 파일 **8개** / 변경 **300줄**. 넘으면 화면 경계에서 쪼개고 앞 단위를 먼저 6단계까지 통과시킨다
- 단위마다 6단계를 돌린다. 여러 화면을 몰아 쓰고 마지막에 한 번 돌리지 않는다
- 화면 여러 개를 요청받았고 중간에 `blocked` 가 나오면 거기까지를 `partial` 로 보고한다

**이유:** RN 은 타입이 통과해도 스타일·네비게이션 오류가 런타임에만 드러난다.
단위가 크면 어느 변경이 원인인지 좁히지 못해 되돌리기 비용이 단위 크기에 비례해 커진다.

### 5. 코드를 쓴다

쓰는 동안 아래 순서로 판정한다.

1. **플랫폼 분기** — `Platform.select` 로 둘지 `.ios.tsx` / `.android.tsx` 로 나눌지는
   `curvez-react-native.md` 의 `## 판단 기준` → `### 플랫폼 분기 (iOS / Android)` 표로 판정한다.
   한쪽 플랫폼 동작이 스펙에 없으면 고르지 말고 `blocked`
2. **모바일 고유 요구** — 아래 `## 모바일 고유 요구` 를 적용한다
3. **리스트·네비게이션·관리형 여부** — 전부 같은 에이전트 정의의 `## 판단 기준` 표로 판정한다.
   표로 갈리지 않으면 같은 문서의 `### tie-break` 순서를 따르고 멈추지 않는다
4. **경계** — 아래 `## 아키텍처 규칙 준수` 를 지킨다.
   `stack` 이 `monorepo` 면 코드를 쓰기 전에 [references/monorepo-shared-domain.md](references/monorepo-shared-domain.md) 를 읽는다

모르는 API·버전·호환성을 만나면 검색하지 말고 `blocked_on` 에 `who: curvez-researcher` 로 넘긴다.
**이유:** 검색으로 얻은 지식은 이 실행의 컨텍스트와 함께 사라져 팀에 누적되지 않는다.
`curvez-researcher` 의 결과는 `.curvez/research/` 에 파일로 남아 다음 실행에서 재사용된다.

### 6. 검증한다

아래 `## 검증` 의 절차를 그대로 돌리고, 나온 **수치**를 `verification` 에 옮긴다.

### 7. 핸드오프를 쓴다

형식과 `status` 판정은 `agent-contract` 스킬이 정본이다. 이 스킬은 형식을 다시 정의하지 않는다.
`artifacts` 에는 만들거나 고친 파일을 `kind: "code"` 로 전부 나열한다.

## 모바일 고유 요구

**스펙에 값이 있으면 스펙 값이 우선이다. 아래 기본값은 스펙에 그 항목이 없을 때만 쓴다.**

**이유:** 같은 항목의 값이 `.curvez/design/` 과 이 문서 두 곳에 따로 있으면, 두 값이 갈렸을 때
어느 쪽이 맞는지 판정할 근거가 없다. 단일 출처는 `.curvez/design/` 이고 이 문서는 그 자리가 비었을 때만 채운다.
스펙 값이 아래 기본값보다 **약하면** 임의로 올리지 말고 `blocked_on` 에 `who: curvez-designer` 로 남긴다 —
값을 올리는 것도 스펙 변경이고, 그 판단은 디자이너 소유다.

아래 항목은 스펙에 명시가 없어도 **누락시키지 않는다.** 모바일에서는 선택 사항이 아니다.

| 항목 | 스펙 키 | 스펙에 없을 때 기본값 | 구현 |
|---|---|---|---|
| 터치 타깃 | `a11y:target` | **44×44 pt** | 시각 크기가 그보다 작으면 `hitSlop` 으로 확보한다. 작은 아이콘 버튼에서 가장 자주 깨진다 |
| 대비 | `a11y:contrast` | 본문 **4.5:1** | 스펙 토큰으로 못 맞추면 토큰 조합을 바꾸지 말고 `blocked_on` 에 `who: curvez-designer` |
| 안전 영역 | 화면 스펙의 layout | `useSafeAreaInsets` / `SafeAreaView` | 화면 루트와 하단 고정 요소(탭바·CTA)에 적용한다. 상수 여백으로 대체하지 않는다 |
| 키보드 회피 | 화면 스펙의 layout | `KeyboardAvoidingView` | 입력 필드가 있는 화면에 넣는다. 동작이 플랫폼별로 다르므로 `behavior` 는 `Platform.select`. 폼이 길면 스크롤 컨테이너 안에 둔다 |
| 스크롤 | responsive | 스크롤 컨테이너 | 작은 기기·큰 글꼴 설정에서 내용이 잘리면 안 된다 |
| 접근성 | `a11y:role` `a11y:label` `a11y:focus` `focus-order` | 없음 (스펙 필수) | 터치 요소에 `accessibilityRole` / `accessibilityLabel` 을 넣고 값은 스펙 그대로 쓴다 |
| 하드웨어 뒤로가기(Android) | 화면 스펙의 states | 없음 | 모달·다단계 폼에서 동작이 스펙에 없으면 `blocked_on` 에 `who: curvez-designer` |

**상수 여백으로 안전 영역을 대체하지 마라.**
**이유:** 노치·홈 인디케이터 높이는 기기마다 다르고 새 기기가 계속 나온다. 실측값을 쓰면 새 기기에서 자동으로 맞지만,
상수는 출시 시점의 기기 목록에만 맞고 그 후로는 조용히 어긋난다.

## 아키텍처 규칙 준수

**도메인 레이어에서 `react-native` / `expo-*` / `@react-navigation/*` 을 import 하지 않는다.**

**이유 셋:**

1. 도메인을 프레임워크 교체에서 분리하는 것이 이 아키텍처를 쓰는 유일한 이유다. 도메인이 `react-native` 를 참조하는 순간 규칙 전체가 장식이 된다
2. `react-native` / `expo-*` 는 Metro 번들러와 네이티브 런타임을 전제한다. import 가 하나만 들어가도 도메인 로직을 Node 에서 단독 실행할 수 없고, 단위 테스트가 네이티브 목(mock) 없이는 돌지 않아 검증 주기가 통째로 느려진다
3. 모노레포에서 같은 도메인 패키지를 Next.js 가 가져다 쓰면 서버 번들에 네이티브 모듈이 들어가 빌드가 깨진다

플랫폼 API 가 필요하면 도메인은 **인터페이스(포트)만 선언**하고, 구현체(어댑터)를 `paths.mobile` 아래에 두어 주입한다.
예: 도메인은 `TokenStore` 인터페이스만 알고 `expo-secure-store` 구현체는 모바일 인프라 레이어에 둔다.

**규칙에 이의가 있어도 코드로 우회하지 마라.** `blocked_on` 에 규칙 ID·왜 막히는지·대안을 적어
`who: curvez-architect` 로 돌린다.
**이유:** 구현에서 규칙을 한 번 우회하면 그것이 다음 구현의 선례가 되고, 문서의 규칙과 코드의 실제가 갈라진다.
그 시점부터 `curvez-structure-reviewer` 의 위반 보고는 전부 노이즈로 취급되기 시작한다.

## 공유 도메인 패키지 (`paths.domain`)

**`paths.domain` 에는 소유자가 없다.** 이 스킬로 실행하는 에이전트도 `curvez-nextjs` 도 소유자가 아니다. 읽기만 한다.

**공유 도메인의 시그니처를 바꿔야 하면 코드를 쓰지 말고 `blocked_on` 에 `who: curvez-orchestrator` 로 남긴다.**
바꿀 시그니처와 이유를 함께 적는다. 병렬을 순차로 강등할지는 오케스트레이터가 정한다.

**이유:** 한쪽 스택 사정으로 공유 시그니처를 바꾸면 다른 스택은 컴파일이 아니라 런타임에서 깨지거나,
동시 실행 중이었다면 나중에 쓴 쪽이 앞선 쪽을 조용히 지운다. 어느 쪽이든 바꾼 쪽의 검증은 통과한다 —
깨진 사실이 바꾼 사람에게 보이지 않는다. 실행 순서를 쥔 오케스트레이터만 이 충돌을 볼 수 있다.

`stack` 이 `monorepo` 면 포트·어댑터 배치와 공유 코드 금지 항목을
[references/monorepo-shared-domain.md](references/monorepo-shared-domain.md) 에서 읽는다.

## 검증

명령을 하드코딩하지 말고 `profile.json` 의 `commands` 에서 읽는다.
**이유:** 프로젝트마다 스크립트 이름이 다르다. 하드코딩하면 없는 명령을 실행하고, 그 실패가 코드 문제로 오인돼
멀쩡한 코드를 고치는 데 시간이 든다.

`## 금지 import` 표는 **패턴을 복사하지 말고 매번 파싱한다.** 표 안에서 ERE 의 `|` 는 마크다운 규칙상
`\|` 로 이스케이프돼 있으므로, 필드 구분자를 `' | '`(공백-파이프-공백)로 두고 읽어낸 뒤 `\|` 를 `|` 로 되돌린다.
**이유:** 이스케이프를 되돌리지 않으면 `grep -E` 가 대안 분기를 리터럴 백슬래시로 읽어 위반이 있어도 0건이 나온다.
검사가 실패하는 게 아니라 **통과한 것처럼 보이는** 실패라 그대로 `done` 이 된다. 이 함정은 실행 테스트로 두 번 잡혔다.

```bash
set -o pipefail
P=.curvez/profile.json
ARCH=.curvez/architecture.md
[ -f "$P" ] || { echo "profile 없음 -> blocked"; exit 1; }
[ -f "$ARCH" ] || { echo "architecture.md 없음 -> blocked"; exit 1; }

# 1) 프로파일에서 읽는다 (하드코딩 금지, 경로 폴백 금지)
STACK=$(node -p "require('$PWD/$P').stack || ''")
MOBILE=$(node -p "(require('$PWD/$P').paths||{}).mobile || ''")
DOMAIN=$(node -p "(require('$PWD/$P').paths||{}).domain || ''")
SDK=$(node -p "(require('$PWD/$P').expo||{}).sdkVersion || ''")
echo "stack=$STACK mobile=$MOBILE domain=$DOMAIN expoSdk=$SDK"

MISSING=""
[ -n "$MOBILE" ] || MISSING="$MISSING paths.mobile"
[ -n "$SDK" ] || MISSING="$MISSING expo.sdkVersion"
if [ "$STACK" = "monorepo" ] && [ -z "$DOMAIN" ]; then MISSING="$MISSING paths.domain"; fi
[ -z "$MISSING" ] || { echo "profile 필수 키 없음 ->$MISSING -> blocked"; exit 1; }

# 2) 품질 게이트 — 프로파일에 있는 것만 돌린다
for KEY in typecheck lint test; do
  CMD=$(node -p "(require('$PWD/$P').commands||{}).$KEY || ''")
  [ -n "$CMD" ] || continue
  echo "--- $KEY: $CMD"
  sh -c "$CMD"
  echo "--- $KEY exit=$?"
done

# 3) 금지 import — 표를 파싱해 3열을 grep -E 에 그대로 넣는다
grep -q '^## 금지 import' "$ARCH" || { echo "## 금지 import 섹션 없음 -> blocked"; exit 1; }
ARCH_RULES=0
ARCH_TOTAL=0
while IFS="$(printf '\t')" read -r ID PATHS RE; do
  [ -n "$ID" ] || continue
  ARCH_RULES=$((ARCH_RULES + 1))
  N=$(grep -rInE "$RE" $PATHS --include='*.ts' --include='*.tsx' 2>/dev/null | wc -l | tr -d ' ')
  echo "$ID 위반 $N 건 (경로: $PATHS / 패턴: $RE)"
  ARCH_TOTAL=$((ARCH_TOTAL + N))
done <<EOF
$(awk -F' \\| ' '/^\| ARCH-[0-9][0-9][0-9] \|/ {
    id=$1; sub(/^\| /,"",id);
    re=$3; gsub(/\\\|/,"|",re);
    print id"\t"$2"\t"re }' "$ARCH")
EOF
echo "ARCH 규칙 $ARCH_RULES 개 / 위반 합계 $ARCH_TOTAL 건"

# 4) 모바일 소스가 웹 전역을 참조하면 RN 런타임에서 즉시 크래시한다
echo "웹 전역 참조 $(grep -rnE '\b(window|document|localStorage)\b' "$MOBILE" \
  --include='*.ts' --include='*.tsx' 2>/dev/null | wc -l | tr -d ' ') 건"

# 5) 터치 타깃 — 터치 컴포넌트를 쓰면서 hitSlop/최소 44 이상이 없는 파일 수
echo "터치 타깃 미확보 $(grep -rlE 'Pressable|TouchableOpacity|TouchableHighlight|TouchableWithoutFeedback' \
  "$MOBILE" --include='*.tsx' 2>/dev/null \
  | xargs -r grep -LE 'hitSlop|min(Height|Width): *(4[4-9]|[5-9][0-9]|[1-9][0-9][0-9]+)' \
  | wc -l | tr -d ' ') 개"

# 6) Expo SDK 정렬 — 버전을 추측하지 않고 SDK 기준으로 확인한다
(cd "$MOBILE" && npx --no-install expo install --check 2>&1 | tail -5)
```

`ARCH_RULES` 가 **0 이면 통과가 아니라 `blocked`** 다.
**이유:** 표 형식이 바뀌어 파싱이 실패해도 위반 합계는 0 으로 나온다. 규칙 수를 함께 세지 않으면
"검사할 규칙이 없었다"와 "위반이 없었다"가 같은 출력이 된다.

## 완료 기준

전부 수치로 판정한다. 하나라도 못 맞추면 `status: done` 을 쓰지 않고 `partial` 로 낮춘다.

- [ ] `commands.typecheck` 오류 **0건**
- [ ] `commands.lint` 오류 **0건** (경고는 신규 발생 0건)
- [ ] `commands.test` 실패 **0건**
- [ ] 검증 3번 `ARCH 규칙` **1개 이상**이고 `위반 합계` **0건**
- [ ] 검증 4번 웹 전역 참조 **0건**
- [ ] 검증 5번 터치 타깃 미확보 파일 **0개**
- [ ] 검증 6번 `expo install --check` 의 버전 변경 권고 **0건** (네트워크 불가로 못 돌리면 "실행 불가"를 그대로 적고 `partial`)
- [ ] 이번 단위의 모든 화면에 안전 영역 처리가 들어갔고, 입력이 있는 화면에는 키보드 회피가 들어갔다
- [ ] 구현한 항목이 전부 `platform:` 이 `both` 또는 `rn` 인 스펙에서 나왔다
- [ ] `paths.mobile` 밖에 쓴 파일이 없다

**검증을 못 돌렸으면 빼고 `done` 하지 말고 `partial` 로 낮춘다.**
**이유:** 수신 에이전트는 `done` 을 믿고 자기 작업을 시작한다. 검증되지 않은 `done` 하나가 그 뒤 전부를 무효로 만든다.

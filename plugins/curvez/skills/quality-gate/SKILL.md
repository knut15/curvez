---
name: quality-gate
description: typecheck·lint·test·아키텍처 경계·빌드를 프로파일의 commands 로 실제 실행해 결과를 수치로 남긴다. "검증해줘", "테스트 돌려줘", "돌아가는지 확인해줘", "타입 체크", "린트 돌려", "빌드 되나", "run the tests", "typecheck", "verify it works" 라고 하거나 status 를 done 으로 올리기 전 verification 을 채울 때 실행한다.
---

품질 게이트는 curvez 에서 가장 자주 도는 절차다. 모든 에이전트가 `status: done` 을 선언하려면
`verification` 이 있어야 하고, 그 값은 여기서 나온다.

이 스킬이 만드는 것은 **판정 가능한 수치 한 줄**이다. "돌려봤다" 가 아니라
`47 tests, 45 passed, 2 failed (auth.login.expired-token, cart.total.discount)` 가 산출물이다.

## 언제 이 스킬을 쓰는가

- `status` 를 `done` 또는 `partial` 로 올리기 전 `verification[]` 을 채울 때
- 구현 핸드오프가 도착해 그 코드가 실제로 도는지 확인할 때
- 리뷰를 시작하기 전, lint 가 이미 잡은 항목을 `findings` 에서 빼려 할 때
- `.curvez/architecture.md` 의 `ARCH-NNN` 금지 import 위반을 기계적으로 셀 때
- 라운드를 닫기 전 빌드까지 포함한 전체 게이트를 돌릴 때
- 의존성·설정 파일(`package.json`, `tsconfig`, `next.config`, `app.json`, lockfile)이 바뀌었을 때

## 언제 쓰지 않는가

- 중복·순환 의존·레이어 배치처럼 **파일 사이 관계**를 읽어서 판정할 때 → `structure-audit` 를 쓴다.
  이 스킬은 명령을 돌려 나온 수치만 다룬다
- 실패를 고치려고 코드를 쓸 때 → `nextjs-implementation` / `react-native-implementation` 를 쓴다.
  이 스킬은 실패를 수치와 원문으로 남기고 멈춘다
- 핸드오프 JSON 을 작성하고 스키마를 검증할 때 → `agent-contract` 를 쓴다.
  이 스킬은 `verification[]` 에 들어갈 **값**만 만들고, 그 값을 담을 **그릇**은 저쪽이 정한다
- `.curvez/profile.json` 이 아직 없을 때 → `bootstrap` 을 먼저 쓴다. 명령을 추측해 돌리지 않는다
- 테스트를 새로 설계·작성할 때 → `curvez-qa` 에이전트 정의의 `## 판단 기준`. 이 스킬은 **이미 있는
  스위트를 돌린다**
- 공식 문서·버전 호환처럼 **코드 밖의 사실**을 확인할 때 → `research-brief` 를 쓴다. 이 스킬이 확인하는 것은
  이 저장소에서 명령을 돌려 나오는 값뿐이다

**이 스킬이 세지 않는 것:** 수용 기준(`AC-<번호>`) 커버율과 디자인 스펙 키 커버율은 여기서 세지 않는다.
정본은 `curvez-qa` 에이전트 정의의 `## 품질 자체 검증` 6번·6-2번이다.
**이유:** 같은 계수 로직을 두 곳에 두면 한쪽만 고쳐졌을 때 두 수치가 어긋나고, 어느 쪽이 맞는지
판정할 근거가 없어진다.

## 0단계 — 명령을 프로파일에서 읽는다

**게이트 명령을 하드코딩하지 마라. `.curvez/profile.json` 의 `commands` 에서 읽는다.**
**이유:** 프로젝트마다 스크립트 이름이 다르다(`typecheck` / `type-check` / `tsc --noEmit`).
하드코딩하면 존재하지 않는 명령을 실행하고, 그 `command not found` 가 코드 결함으로 오인된다.
구현 에이전트는 없는 버그를 찾으러 간다.

```bash
set -o pipefail
mkdir -p .curvez/qa

P=.curvez/profile.json
[ -f "$P" ] || { echo "BLOCKED: $P 없음. bootstrap 먼저"; exit 1; }
node -e "JSON.parse(require('fs').readFileSync('$P','utf8'))" \
  || { echo "BLOCKED: profile.json 파싱 실패"; exit 1; }

pf() { node -p "(JSON.parse(require('fs').readFileSync('$P','utf8'))$1)||''"; }
STACK=$(pf "?.stack")
TYPECHECK=$(pf "?.commands?.typecheck")
LINT=$(pf "?.commands?.lint")
TEST=$(pf "?.commands?.test")
BUILD=$(pf "?.commands?.build")
WEB=$(pf "?.paths?.web")
MOBILE=$(pf "?.paths?.mobile")

echo "stack=$STACK web=$WEB mobile=$MOBILE"
echo "typecheck=[$TYPECHECK] lint=[$LINT] test=[$TEST] build=[$BUILD]"

# 비어 있는 명령은 "미검증"이다. 대체 명령을 지어내지 않는다.
for pair in "typecheck:$TYPECHECK" "lint:$LINT" "test:$TEST" "build:$BUILD"; do
  [ -n "${pair#*:}" ] || echo "commands.${pair%%:*} 비었음 → 그 축은 미검증으로 summary 에 남긴다"
done
```

- `profile.json` 이 없으면 **`status: blocked`** 다. `blocked_on` 에 "profile 이 없다. bootstrap 먼저" 를 남긴다
- `commands.test` 가 비었는데 테스트를 요구받았으면 **`status: blocked`** 다. `pnpm test` 를 가정하지 않는다
- 비어 있는 다른 명령은 그 축만 미검증으로 남기고 나머지 게이트는 계속 돈다

**게이트 실행 함수** — 아래 게이트 전부가 이 함수를 쓴다. 로그를 통째로 남기고 exit code 를 돌려준다.

```bash
run_gate() {                      # run_gate <이름> <명령>
  local name=$1 cmd=$2
  if [ -z "$cmd" ]; then
    echo "GATE $name: SKIP (commands.$name 비었음)"
    return 0
  fi
  local log=.curvez/qa/$name.log
  echo "GATE $name: \$ $cmd"
  ( eval "$cmd" ) >"$log" 2>&1      # 서브셸로 감싼다 — 아래 이유 참조
  local code=$?
  echo "GATE $name: exit=$code log=$log lines=$(wc -l < "$log" | tr -d ' ')"
  tail -30 "$log"
  return $code
}
```

**`eval` 을 서브셸 `( )` 로 감싼다.**
**이유:** `commands.*` 는 프로파일에서 온 임의 문자열이라 `exit`·`cd`·`set -e` 가 섞여 있을 수 있다.
감싸지 않으면 그것이 게이트 러너 자체를 종료시키거나 작업 디렉터리를 옮겨, 남은 게이트가
다른 곳에서 돌거나 아예 돌지 않는다. 실행 테스트에서 실제로 잡힌 함정이다.

이 절차는 `scripts/quality-gate.mjs` 가 실행기로 구현돼 있다.

```bash
node "$CLAUDE_PLUGIN_ROOT/scripts/quality-gate.mjs" [--json] [--only arch,test] [--no-stop]
```

`--json` 출력은 핸드오프의 `verification[]` 에 그대로 넣을 수 있다.
**미실행 게이트는 항목을 만들지 않는다** — 안 돌린 것을 통과로 적으면 안 되기 때문이다.

## 무엇을 언제 돌리는가

전부 매번 돌리면 느리다. **변경 범위로 판정한다.**

| 상황 | 돌리는 게이트 | 근거 |
|---|---|---|
| `.curvez/**` 나 `*.md` 만 바뀜 | 없음 | 실행 코드가 안 바뀌었으면 결과가 직전과 같다. 돌려도 정보가 0이다 |
| 소스 1~2 파일 수정, 중간 확인 | arch + typecheck + lint | 셋 다 초~십초대다. 여기서 걸리면 테스트를 돌릴 이유가 없다 |
| 테스트 파일만 추가·수정 | typecheck + test | lint·build 는 테스트 파일 변경에 반응할 여지가 거의 없다 |
| 구현 에이전트가 `done` 선언 직전 | arch + typecheck + lint + test | `verification` 최소 구성이다. 이 넷이 없으면 `done` 을 쓸 수 없다 |
| 리뷰 시작 직전 | lint + typecheck | lint 가 잡은 항목을 `findings` 에서 빼기 위한 입력이다. 테스트 결과는 `curvez-qa` 핸드오프를 읽는다 |
| 라운드 종료 · 최종 인계 | 5종 전부 | 라운드당 한 번은 빌드가 통과함을 확인한다 |
| 의존성·설정 변경 (`package.json`, lockfile, `tsconfig`, `next.config`, `app.json`) | 5종 전부 | 앞 4종이 전부 통과하고 빌드만 깨지는 조합이 여기서 나온다 |
| 앞 게이트가 실패 | 남은 게이트를 중단해도 된다 | 아래 "중단 판정" 참조 |

**build 를 매번 돌리지 않는 이유:** 빌드는 게이트 중 가장 느리고(수십 초~수 분), 앞 4종이
못 잡는 것만 추가로 잡는다. 변경마다 돌리면 라운드 시간의 대부분을 빌드가 먹고, 그러면
게이트 자체를 건너뛰기 시작한다. 대신 **설정·의존성이 움직인 순간에는 필수**다.

**중단 판정:** typecheck 가 실패하면 test·build 를 돌리지 않아도 된다.
**이유:** 타입이 깨진 상태의 테스트 실패는 컴파일 오류이지 결함 신호가 아니다. 그 출력을
구현 에이전트에게 넘기면 존재하지 않는 로직 버그를 찾는다. 중단했으면 돌리지 않은 게이트를
`verification` 에 넣지 말고 `summary` 에 "typecheck 실패로 test·build 미실행" 으로 남긴다.

**돌리지 않은 게이트는 `verification` 에 항목을 만들지 마라.**
**이유:** 실행하지 않은 명령의 결과를 적는 것은 수치를 지어내는 것이다. 지어낸 수치 한 줄이
팀 전체를 검증되지 않은 코드 위에 올린다.

## 실행 순서

**arch → typecheck → lint → test → build.** 싸고 파급이 큰 것부터다.

| # | 게이트 | 비용 | 왜 이 자리인가 |
|---|---|---|---|
| 1 | arch | grep 몇 초 | 경계 위반의 수정은 **파일을 옮기는 일**이라 그 뒤 게이트 결과가 전부 무효가 된다. 테스트를 다 돌린 뒤 발견하면 그 실행이 통째로 버려진다 |
| 2 | typecheck | 수 초~수십 초 | 실행 없이 트리 전체를 한 번에 본다. 여기가 깨진 채로 test 를 돌리면 실패 출력이 결함 신호가 아니라 컴파일 오류가 된다 |
| 3 | lint | 수 초 | 리뷰가 이 출력을 입력으로 쓴다. 리뷰보다 먼저 돌아야 중복 지적이 걸러진다 |
| 4 | test | 수십 초~수 분 | 앞 셋이 통과해야 실패가 로직 결함으로 해석된다 |
| 5 | build | 가장 느림 | 앞 넷이 못 잡는 번들러·플랫폼 레벨만 남는다. 마지막이어야 걸리는 건수당 대기 시간이 최소가 된다 |

## 게이트 1 — 아키텍처 경계 (ARCH-NNN)

`.curvez/architecture.md` 의 `## 금지 import` 표를 파싱해 `grep -E` 로 돌린다.
표의 열 순서는 `규칙 ID | 검사 경로 | 금지 패턴 (ERE) | 이유` 로 고정이다.

```bash
ARCH=.curvez/architecture.md
if [ ! -f "$ARCH" ]; then
  echo "GATE arch: SKIP (architecture.md 없음 → 경계 미검증)"
else
  awk -F' \\| ' '/^\| *ARCH-[0-9]+ /{
    id=$1; sub(/^\| */,"",id); sub(/ *$/,"",id);
    path=$2; pat=$3;
    gsub(/\\\|/,"|",pat);
    print id "\t" path "\t" pat
  }' "$ARCH" > .curvez/qa/arch-rules.tsv
  echo "GATE arch: 규칙 $(wc -l < .curvez/qa/arch-rules.tsv | tr -d ' ')건"

  VIOL=0
  while IFS=$(printf '\t') read -r id path pat; do
    if [ ! -e "$path" ]; then echo "$id SKIP 경로 없음: $path"; continue; fi
    n=$(grep -rElE --exclude-dir=node_modules --exclude-dir=.git -- "$pat" "$path" 2>/dev/null | wc -l | tr -d ' ')
    echo "$id path=$path 위반파일=$n"
    if [ "$n" != 0 ]; then
      VIOL=$((VIOL + n))
      grep -rnE --exclude-dir=node_modules --exclude-dir=.git -- "$pat" "$path"
    fi
  done < .curvez/qa/arch-rules.tsv
  echo "GATE arch: 총 위반 $VIOL 건"
fi
```

**파싱 함정 — 필드 구분자는 ` | `(공백-파이프-공백)다.** 표 안에서 패턴의 `|` 는 `\|` 로
이스케이프돼 있으므로 읽어낸 뒤 `\|` 를 `|` 로 되돌린다. 위 `gsub` 가 그 일을 한다.
**이유:** 구분자를 `|` 하나로 잡으면 패턴 안의 `\|` 에서 필드가 쪼개져 규칙이 잘린 채 돌고,
잘린 패턴은 아무것도 매칭하지 못한 채 "위반 0건" 을 보고한다. 실행 테스트로 두 번 잡힌 함정이다.

- 규칙이 **3건 미만**이면 표가 덜 채워진 것이다. `summary` 에 "ARCH 규칙 N건(최소 3건)" 으로 남긴다
- 위반 1건 이상이면 `status` 는 최소 `partial` 이고, 위반 규칙 ID 와 파일:라인을 전부 나열한다
- **`architecture.md` 가 없으면 규칙을 지어내지 마라.** 스킵하고 "경계 미검증" 으로 남긴다.
  **이유:** 지어낸 규칙으로 낸 위반은 구현 에이전트를 아무도 합의하지 않은 구조로 끌고 간다

## 게이트 2·3 — typecheck · lint

```bash
run_gate typecheck "$TYPECHECK"; TC=$?
run_gate lint "$LINT"; LT=$?

# 수치를 뽑는다. exit 0 을 "0 errors" 로 번역하지 말고 출력에서 읽는다.
grep -Eio '[0-9]+ +(error|warning|problem)s?' .curvez/qa/typecheck.log 2>/dev/null | tail -5
grep -Eio '[0-9]+ +(error|warning|problem)s?' .curvez/qa/lint.log 2>/dev/null | tail -5
echo "typecheck exit=$TC lint exit=$LT"
```

- `result` 는 출력에서 읽은 값으로 쓴다: `0 errors` / `3 errors, 0 warnings`
- 오류가 있으면 실패한 파일:라인을 `result` 에 최소 1건 인용한다.
  `3 errors (src/features/cart/total.ts:17 외 2건)`
- **`--fix` / `--force` / `// @ts-ignore` / `eslint-disable` 로 초록불을 만들지 마라.**
  **이유:** 억제 주석은 오류를 지우는 것이 아니라 오류 신호만 지운다. 결함은 남고 다음 게이트부터
  영원히 안 보인다. 포매터가 잡는 것(`--fix` 로 안전하게 고쳐지는 서식)만 예외이며, 그 경우에도
  무엇을 고쳤는지 `decisions` 에 남긴다

## 게이트 4 — test

```bash
run_gate test "$TEST"; TS=$?
cp -f .curvez/qa/test.log .curvez/qa/last-run.log 2>/dev/null

# 실행 개수·통과·실패를 뽑는다
grep -Eio '[0-9]+ +(tests?|test files?|test suites?|total|passed|failed|skipped|todo|pending)' \
  .curvez/qa/test.log | sort -u

# 0개 실행 함정. 여기서 1 이상이면 exit 0 이어도 blocked 다.
# 숫자 경계(^|[^0-9])가 필수다 — 없으면 "10 passed" 안의 "0 passed" 를 오탐한다.
ZERO=$(grep -Eic 'no tests? (found|to run)|(^|[^0-9])0 +(tests?|test files?|passed|total)' \
  .curvez/qa/test.log)
echo "zero-run-signal=$ZERO test exit=$TS"

# 실패한 테스트 이름을 뽑는다 (러너 표기 편차가 있으므로 원문도 함께 본다)
grep -nE '(✕|✗|FAIL|●|✖|not ok)' .curvez/qa/test.log | head -40
```

**실행 개수 0개의 함정 — 반드시 확인한다.**
테스트 러너는 매칭되는 파일을 하나도 못 찾았을 때 **실패 0건과 exit 0 을 함께** 반환한다.
이것은 "실패가 없다" 가 아니라 **"아무것도 검증하지 않았다"** 다.
**이유:** 0개 실행은 초록불과 출력이 거의 같아 구분되지 않는 가장 위험한 상태다. 경로 오타,
glob 불일치, 설정 파일 누락, preset 미설치로 스위트 전체가 조용히 비어도 파이프라인은 성공한다.
그 상태로 `done` 을 넘기면 팀 전체가 검증되지 않은 코드 위에서 다음 단계를 시작하고,
되돌리는 비용은 그 시점부터 매 단계 커진다.

따라서 **실행 개수가 1 이상임을 명시적으로 확인하기 전에는 어떤 결과도 통과로 해석하지 않는다.**
실행 개수가 0이면 exit code 와 무관하게 `status: blocked` 이고, `blocked_on` 에
"테스트 0개 실행. 스위트가 비었거나 경로 설정이 어긋났다" 와 실행한 명령을 남긴다.

**플래키 의심이면 같은 명령을 3회 돌린다.** 3회 exit code 가 전부 같아야 플래키가 아니다.

```bash
for i in 1 2 3; do ( eval "$TEST" ) >/dev/null 2>&1; echo "run$i exit=$?"; done
```

**재시도(retry) 설정으로 플래키를 덮지 마라.**
**이유:** 플래키는 대개 테스트가 아니라 제품의 실제 결함(경쟁 조건, 정리되지 않는 타이머,
전역 상태 누수)이 드러난 것이다. 프로덕션에는 재시도가 없으므로 재시도로 가린 결함은
사용자에게만 재현된다.

## 게이트 5 — build

```bash
run_gate build "$BUILD"; BD=$?
if [ -z "$BUILD" ]; then
  echo "build: 미실행 → verification 항목을 만들지 않는다"
else
  echo "build exit=$BD warnings=$(grep -Eic 'warn' .curvez/qa/build.log)"
  tail -40 .curvez/qa/build.log
fi
```

- `result` 예: `exit 0` / `exit 1, Module not found: ./lib/api`
- 빌드는 **경고를 오류로 승격하는 설정**이 꺼져 있을 수 있다. exit 0 이어도 로그의 경고 건수를
  같이 적는다
- 스택마다 빌드가 잡는 것이 다르다. 아래 "스택별 차이" 를 본다

## 수치로 보고한다

**"통과했다", "모두 정상", "이상 없음" 을 쓰지 마라. 항상 수치로 쓴다.**
**이유:** 수신 에이전트는 문장의 뉘앙스가 아니라 수치로 다음 행동을 정한다. "통과" 는
몇 개 중 몇 개인지, 0개 실행인지, 어떤 이름이 실패했는지를 전부 지운다. 그 정보가 지워지면
수신 쪽은 확인하러 같은 명령을 다시 돌려야 하고, 게이트를 돌린 의미가 사라진다.

| 게이트 | 좋은 `result` | 나쁜 `result` |
|---|---|---|
| typecheck | `0 errors` / `3 errors (src/a.ts:12 외 2건)` | `통과`, `문제 없음` |
| lint | `0 errors, 5 warnings` | `깨끗함` |
| arch | `규칙 4건 검사, 위반 0건` / `ARCH-002 위반 3파일` | `경계 지킴` |
| test | `47 tests, 45 passed, 2 failed (auth.login.expired-token, cart.total.discount)` | `대부분 통과` |
| build | `exit 0, warnings 2` | `빌드 성공` |

실패한 것은 **이름을 전부 적는다.** 개수만 적으면 수신 쪽이 로그를 다시 파싱해야 한다.

## 실패를 숨기지 않는다

**실패한 테스트를 지우거나 `skip` / `only` / `todo` 로 바꿔 초록불을 만들지 마라.
기대값을 실제 출력에 맞춰 고쳐 통과시키는 것도 같은 금지다.**
**이유:** 실패한 테스트는 팀이 가진 유일한 결함 신호다. 신호를 끄면 결함은 남고 경보만 사라져,
다음 단계 에이전트들이 결함이 없다는 전제 위에 작업을 쌓는다. 기대값을 실제 출력에 맞추는 것은
테스트를 명세에서 구현의 복사본으로 강등시켜 이후 어떤 회귀도 못 잡게 만든다.

억제 흔적이 늘지 않았는지 센다. **직전 실행 대비 증가 0** 이어야 한다.

```bash
SUP=$(grep -rnE '\b(it|test|describe)\.(skip|only|todo)\b|\bx(it|describe)\(|@ts-ignore|@ts-nocheck|eslint-disable' \
  --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.curvez . 2>/dev/null | wc -l | tr -d ' ')
echo "suppression-count=$SUP"
```

실패가 남으면 그대로 보고한다.

- `status` 를 낮춘다: 일부 실패면 `partial`, 진행 불가면 `blocked`
- `verification` 에 **실제 출력을 요약 없이** 남긴다. 원문은 `.curvez/qa/<게이트>.log` 에 있다
- 구현 에이전트에게 돌릴 때는 실패한 이름 · 원문 출력 · **그 하나만 다시 돌리는 재현 명령** ·
  무엇에 대한 실패인지(`AC-<번호>` 또는 `ARCH-NNN`) 를 함께 넘긴다.
  **이유:** 재현하지 못하는 수신자는 추측으로 고치고, 추측 수정이 맞는지는 게이트를 한 바퀴 더
  돌려야만 알 수 있다

## verification 으로 옮긴다

이 스킬의 출력이 **그대로** 핸드오프의 `verification[]` 이 된다. 스키마는 `agent-contract` 가 정본이다.

```json
"verification": [
  { "command": "pnpm typecheck", "result": "0 errors", "passed": true },
  { "command": "pnpm lint", "result": "0 errors, 5 warnings", "passed": true },
  { "command": "pnpm vitest run", "result": "47 tests, 45 passed, 2 failed (auth.login.expired-token, cart.total.discount)", "passed": false }
]
```

| 규칙 | 내용 |
|---|---|
| `command` | **실제로 실행한 문자열 그대로.** `commands.*` 의 값을 그대로 옮긴다. `"타입 확인"` 같은 서술로 바꾸지 마라 |
| `result` | 위 "수치로 보고한다" 표의 형식. 판정 가능한 값 |
| `passed` | test 는 **실행 개수 ≥ 1 이고 실패 0** 일 때만 `true`. 실행 개수 0은 `false` |
| 항목 개수 | 실제로 돌린 게이트 수와 같다. 돌리지 않은 게이트의 항목을 만들지 않는다 |

- 좋음: `{ "command": "pnpm typecheck", "result": "0 errors" }`
- 나쁨: `{ "command": "타입 확인", "result": "통과" }`

**`status: done` 은 `verification` 이 비면 쓸 수 없다.** 게이트를 하나도 못 돌렸으면 `done` 이 아니다.
**이유:** 수신 에이전트는 `done` 을 믿고 자기 작업을 시작한다. 검증되지 않은 `done` 하나가
그 뒤 모든 작업을 잘못된 전제 위에 올린다.

`done` 최소 구성은 **typecheck + lint + test 3건**이다. build 는 "무엇을 언제 돌리는가" 표의
조건(라운드 종료·설정 변경)에 걸릴 때 필수로 추가된다.

## 스택별 차이

빌드와 0개 실행 함정의 모양이 스택마다 다르다. `profile.json` 의 `stack` 으로 갈라 읽는다.

- `stack` 이 `nextjs` 또는 `monorepo` 면 [references/nextjs.md](references/nextjs.md) 를 읽는다
- `stack` 이 `react-native` 또는 `monorepo` 면 [references/react-native.md](references/react-native.md) 를 읽는다

`monorepo` 는 **둘 다** 읽고 `paths.web` · `paths.mobile` 에 각각 적용한다.
`paths.domain` 은 소유자가 없는 공용 경로이므로 arch 게이트에서 양쪽 규칙의 검사 대상이 된다.

## 완료 기준

- [ ] `.curvez/profile.json` 을 읽어 명령을 얻었다. **하드코딩한 명령 실행 0건**
- [ ] 돌린 게이트마다 `.curvez/qa/<이름>.log` 에 원문 출력이 남아 있다
- [ ] test 를 돌렸다면 **실행 개수 ≥ 1** 을 출력으로 확인했다. 0이면 `blocked`
- [ ] 0개 실행 신호(`zero-run-signal`)가 **0** 이다
- [ ] arch 게이트를 돌렸다면 규칙 건수와 위반 건수가 둘 다 수치로 나왔다
- [ ] 억제 흔적(`suppression-count`)이 **직전 실행 대비 증가 0** 이다
- [ ] `verification[]` 의 `command` 가 전부 실제 실행 문자열이고, `result` 가 전부 수치다
- [ ] 돌리지 않은 게이트의 `verification` 항목 **0건**, 그리고 그 게이트가 `summary` 에 미검증으로 적혀 있다
- [ ] 보고 문장에 "통과했다" 없이 `N개 중 M개 통과, 실패: <이름>` 형식이 쓰였다
- [ ] `status` 가 수치에서 도출한 값과 일치한다 (실패 0 → `done`, 일부 실패 → `partial`,
      0개 실행·profile 부재 → `blocked`)

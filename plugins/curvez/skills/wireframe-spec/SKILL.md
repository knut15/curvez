---
name: wireframe-spec
description: 화면 구조·디자인 토큰·컴포넌트 스펙을 해석 여지 없는 값으로 확정해 .curvez/design/ 에 남긴다. "와이어프레임", "화면 설계해줘", "디자인 토큰 정해줘", "컴포넌트 스펙", "다크모드 색 정해줘", "wireframe", "design tokens", "component spec" 이라고 하거나 구현 전에 화면 구조가 확정되지 않았을 때 실행한다.
---

디자인 스펙의 목표는 그림이 아니라 **판정 가능한 값**이다. 구현 에이전트가 이 문서만 읽고
같은 화면을 만들면 성공이고, "적당히" 가 한 군데라도 남으면 웹과 모바일이 서로 다른 앱이 된다.

## 언제 이 스킬을 쓰는가

- 요구사항은 정해졌는데 화면 구조·영역 분할이 아직 값으로 확정되지 않았을 때
- 색·간격·타이포를 토큰으로 확정하고 라이트/다크를 동시에 정할 때
- 재사용 컴포넌트의 props·상태·접근성을 스펙으로 굳힐 때
- Figma·이미지 시안을 값으로 옮길 때, 또는 시안 없이 근거를 세워 결정할 때
- 구현 에이전트가 "이 값 뭐로 할까" 를 되묻기 시작할 때

## 언제 쓰지 않는가

- 실제 컴포넌트 코드(`.tsx`/`.css`)를 쓸 때 → `nextjs-implementation` / `react-native-implementation` 을 쓴다
- 레이어 경계·폴더 구조·금지 import 를 정할 때 → `architecture-setup` 을 쓴다
- 수용 기준(`AC-<번호>`)을 확정할 때 → `research-brief` 가 아니라 요구사항 단계다. 화면 목표가 없으면 지어내지 말고 `blocked_on` 에 남긴다
- 이미 구현된 화면의 결함을 지적할 때 → `quality-gate` / `structure-audit` 을 쓴다
- 결과를 다음 에이전트에게 넘기는 JSON 형식이 궁금할 때 → `agent-contract` 를 쓴다

**이유:** 스펙과 구현을 한 흐름에서 같이 하면 스펙에 없는 결정이 코드에만 남는다.
그 코드는 다른 플랫폼 담당이 읽지 않으므로 두 플랫폼이 조용히 갈라진다.

## 산출물과 형식의 정본

`.curvez/design/` **밖에는 쓰지 않는다** (핸드오프 파일 하나 제외).

| 경로 | 담는 것 |
|---|---|
| `.curvez/design/index.md` | 화면 목록 · 컴포넌트 목록 · 커버리지 표 · 미결 질문 |
| `.curvez/design/tokens.md` | 토큰 표(라이트/다크 동시) · 이름 규칙 · `## 대비 검증` 블록 |
| `.curvez/design/screens/<screen-id>.md` | layout / states / responsive / a11y |
| `.curvez/design/components/<ComponentName>.md` | props / states / a11y / responsive / platform-diff |

**각 파일의 정확한 서식(예시 전문)은 `plugins/curvez/agents/curvez-designer.md` 의
`### 와이어프레임 형식` · `### 디자인 토큰 형식` · `### 컴포넌트 스펙 형식` 이 정본이다.**
스펙을 처음 쓰기 직전에 그 세 절을 열어 형식을 그대로 따른다.
**이유:** 형식을 여기에 한 벌 더 두면 규칙을 바꿀 때 한쪽만 고쳐지고, 두 문서가 다른 서식을 말하는 순간 어느 쪽이 맞는지 판정할 근거가 사라진다.

### 문자열이 고정된 키

아래는 자체 검증이 `grep` 으로 찾는다. 한 글자도 바꾸지 마라.

- 상태: `state:default` `state:loading` `state:empty` `state:error`
- 접근성: `a11y:label` `a11y:focus` `a11y:contrast` `a11y:target` `a11y:role`, `focus-order`
- 플랫폼: `platform:` 값은 `both` / `nextjs` / `rn`
- 라우팅: `route(nextjs)` `route(rn)`
- 토큰 이름: `--<category>-<role>-<variant>` (예: `--color-bg-canvas`)

**`react-native` 로 쓰지 마라.** `platform:` 값은 `rn` 이다.
**이유:** `route(rn)` 과 어휘를 맞춘 확정값이다. 두 어휘가 섞이면 구현 에이전트가 자기 몫을 `grep` 으로 못 고른다.

**`--color-blue-500` 같은 값-이름을 토큰 이름에 쓰지 마라.**
**이유:** 다크에서 그 토큰이 밝은 색이 되면 이름이 거짓말을 한다. 구현자는 이름을 믿고 잘못 쓴다.

## 절차

### 1. 입력을 읽고 시안 유무를 판정한다

`.curvez/profile.json` 과 `.curvez/requirements.md`(또는 requirements 핸드오프)를 먼저 읽는다.
둘 중 하나라도 없으면 **추측하지 말고 `status: blocked`** 로 끝낸다. `stack` 을 모르면 어느 플랫폼 규칙을 적용할지 정할 근거가 없다.

시안은 세 갈래다.

| 상황 | 이 단계에서 할 일 |
|---|---|
| **시안이 다 있다** | 이미지는 `Read`, 공개 링크는 `WebFetch` 로 연다. 색·간격·타이포를 **값으로 추출**해 2단계로 옮긴다. 눈대중으로 반올림하지 마라 |
| **일부만 있다** | 시안 있는 화면에서 토큰을 **먼저 전부 확정**하고, 없는 화면은 그 토큰만으로 조립한다. 새 값을 만들지 않는다 |
| **하나도 없다** | 아래 근거 순서로 값을 만든다 |

**시안이 없을 때 근거 우선순위 (위에서부터 적용하고, 갈리는 순간 멈춘다):**

1. **요구사항의 사용자 흐름** — 수용 기준에서 화면 수, 각 화면의 목표, 필수 입력·출력을 뽑는다. "이 화면에서 사용자가 끝내야 하는 일" 이 정해지면 영역 분할과 우선순위가 따라온다
2. **레포에 이미 있는 값** — `Grep`/`Glob` 으로 `tailwind.config.*`, `theme.*`, `tokens.*`, `*.css` 의 `--` 변수를 찾아 재사용한다
3. **플랫폼 관례** — `profile.json` 의 `stack` 으로 갈린다. 웹은 호버·포커스 링·브레이크포인트, 모바일은 하단 탭·뒤로 제스처·안전 영역
4. **기본 스케일** — 간격 4pt 그리드(4/8/12/16/24/32/48), 타이포 4단계(12/14/16/20/24/32), radius 3단계(4/8/999)

**4번까지 왔으면 그 선택을 `decisions` 에 `reversible_at` 과 함께 남긴다.**
**이유:** 근거 없이 고른 값과 근거를 따져 고른 값이 문서에서 똑같이 생겼으면, 나중에 무엇을 먼저 뒤집어야 하는지 아무도 모른다.

시안이 접근성 기준을 어기면(대비 미달, 터치 타깃 과소) 기준을 지키는 쪽으로 고치고 원본 값·수정 값·이유를 `decisions` 에 남긴다. 조용히 바꾸면 디자이너가 되돌린다.
접근 권한이 없는 Figma 링크는 2회까지 재시도한 뒤, 추측으로 메우지 말고 시안 없는 경로로 진행해 `status: partial` 로 보고한다.

### 2. 토큰을 확정한다 — 라이트와 다크를 같은 행에서 동시에

`tokens.md` 의 표는 한 행에 `| 토큰 | 라이트 | 다크 | 용도 |` 를 모두 채운다. **한 칸도 비우지 마라.**

**이유:** 색은 배경과의 **쌍**으로만 의미가 있다. 라이트만 정한 토큰은 "절반의 값" 이 아니라
**검증되지 않은 값**이다. 나중에 다크에서 대비를 맞추려고 텍스트 색을 밝히는 순간 라이트에서
이미 통과했던 조합이 깨지고, 그때는 컴포넌트가 라이트 값을 하드코딩한 뒤라 되돌리는 비용이 훨씬 크다.

토큰을 늘릴지 말지는 값이 아니라 **의미가 몇 개인가**로 판정한다.

| 상황 | 판단 |
|---|---|
| 기존 토큰과 지각 임계 이하 차이 (색 명도차 5% 미만, 간격 그리드 1스텝 미만, radius·폰트 2px 미만) | 기존 것을 쓴다 |
| 같은 새 값이 서로 다른 컴포넌트 3곳 이상에 필요 | 토큰으로 승격한다 |
| 한 곳에서만 쓰인다 | 토큰을 만들지 않는다. 컴포넌트 스펙에 리터럴로 적고 출처를 남긴다 |
| 값은 같은데 의미가 다르다 | 토큰을 나눈다 |
| 값은 다른데 의미가 같다 | 나누지 않는다. 하나로 통일하고 통일한 이유를 남긴다 |

마지막으로 `tokens.md` 끝에 `## 대비 검증` 섹션을 두고 검사 쌍을 한 줄씩 나열한다.
줄 형식은 `- fg=#RRGGBB bg=#RRGGBB mode=light|dark min=4.5` 이고, **라이트·다크 각각 최소 3쌍**(본문/보조/CTA)을 넣는다.
5단계의 실측 명령이 이 줄을 파싱한다.

### 3. 화면 스펙을 쓴다 — 상태 4종은 지우지 않는다

화면마다 `screens/<screen-id>.md` 하나. `platform:`, `route(nextjs)`/`route(rn)`, `goal`, `entry`, `exit` 를 머리에 두고
`## layout` → `## states` → `## responsive` → `## a11y` 순으로 쓴다.

- `region` 은 중첩한다. 들여쓰기 2칸이 한 단계다. **모든 `region` 에 `role` 을 적는다** — 역할 없는 영역은 지운다
- 한 화면이 상태에 따라 크게 달라지면(로그인 전/후) 화면을 둘로 나눈다

`state:default` `state:loading` `state:empty` `state:error` **네 줄은 모든 화면에 반드시 있다.**
논리적으로 불가능한 상태라도 **줄을 지우지 말고 그 자리에 사유를 적는다.**

```
- state:empty — 단건 조회라 빈 상태가 없다. 없는 주문 ID 는 state:error 로 간다
```

**이유:** 줄이 없으면 "생각 안 함" 과 "필요 없음" 이 구분되지 않는다. 검증도 그 차이를 못 본다.
그리고 로딩·빈·에러는 실행 중에 반드시 등장하므로, 스펙에 없으면 구현자가 그 자리에서 즉흥으로 만든다.
즉흥은 화면마다 다르게 나와 어떤 화면은 스피너가 돌고 어떤 화면은 흰 화면이 되고 어떤 화면은 에러를 삼킨다.

각 상태에서 다음을 값으로 정한다.

| 상태 | 반드시 정할 것 |
|---|---|
| `state:loading` | 스켈레톤인가 스피너인가 · 어느 영역만 바뀌고 어느 영역이 유지되는가 · 200ms 미만이면 표시할 것인가 |
| `state:empty` | 문구 원문 · 다음 행동(CTA) · "아직 없음" 인지 "검색 결과 없음" 인지 (요구사항에 필터가 있으면 둘로 나눈다) |
| `state:error` | 사용자가 읽을 문구 원문 · 재시도 수단 · 부분 실패일 때 남는 데이터 |

`## a11y` 에는 `focus-order` 를 반드시 넣고 영역 이름을 화살표로 이어 순서를 확정한다.

### 4. 컴포넌트 스펙을 쓴다

컴포넌트마다 `components/<ComponentName>.md` 하나. `## props` `## states` `## a11y` `## responsive` 네 섹션은 **어느 컴포넌트에서도 생략하지 않는다.**

`## a11y` 에는 다섯 키가 모두 등장한다. 해당 없으면 지우지 말고 "해당 없음 + 사유" 를 적는다.

| 키 | 확정할 값 |
|---|---|
| `a11y:label` | 아이콘 전용일 때 라벨 원문. 텍스트 라벨이 있으면 중복 지정 금지 |
| `a11y:focus` | 포커스 순서가 트리 순서와 같은가. 로딩 중 포커스 유지 여부 |
| `a11y:contrast` | fg/bg 쌍이 **4.5:1** 이상. disabled 는 3:1 이상 |
| `a11y:target` | `nextjs` **24x24 px** + 인접 8px / `rn` **44x44 pt** 이상 |
| `a11y:role` | 역할 하나. 버튼을 링크로 쓰지 않는다 |

**접근성을 나중으로 미루지 마라.**
**이유:** 대비와 타깃 크기는 값만 바꾸면 되지만, 포커스 순서와 role 은 마크업 구조에 박힌다.
스펙 시점에 정하면 한 줄이고, 구현 뒤에 정하면 컴포넌트 트리를 다시 짠다.

`## platform-diff` 섹션은 `nextjs` 와 `rn` 의 값이 실제로 갈리는 줄만 적는다. 같은 줄을 두 번 쓰지 않는다.
**플랫폼별로 무엇을 값으로 확정해야 하는지, 화면을 파일로 나눌지 줄로 나눌지는
[references/platform-diff.md](references/platform-diff.md) 를 읽는다.** `stack` 이 `monorepo` 이거나 한 화면이 웹과 모바일에서 갈리면 반드시 읽는다.

### 5. 검증하고 넘긴다

아래 검증을 **실제로 돌리고** 출력을 핸드오프의 `verification` 에 원문 그대로 옮긴다.
핸드오프 스키마와 `status` 판정은 `agent-contract` 를 따른다.

## 검증

```bash
export DESIGN=.curvez/design   # 5번 node 명령이 env 로 읽는다. export 를 빼면 빈 경로가 된다

# 1. 필수 산출물
for f in "$DESIGN/index.md" "$DESIGN/tokens.md"; do test -f "$f" || echo "MISSING-DOC $f"; done
echo "screens=$(find "$DESIGN/screens" -name '*.md' 2>/dev/null | wc -l | tr -d ' ')"
echo "components=$(find "$DESIGN/components" -name '*.md' 2>/dev/null | wc -l | tr -d ' ')"

# 2. 화면: 상태 4종 + focus-order (출력 줄 수가 곧 누락 건수)
SCREEN_MISS=$(for f in $(find "$DESIGN/screens" -name '*.md' 2>/dev/null); do
  for k in "state:default" "state:loading" "state:empty" "state:error" "focus-order"; do
    grep -q -- "$k" "$f" || echo "MISSING $k -> $f"
  done
done | tee /dev/stderr | wc -l | tr -d ' ')
echo "screen-missing=$SCREEN_MISS"

# 3. 컴포넌트: 접근성 5키 + 필수 섹션 4종
COMP_MISS=$(for f in $(find "$DESIGN/components" -name '*.md' 2>/dev/null); do
  for k in "a11y:label" "a11y:focus" "a11y:contrast" "a11y:target" "a11y:role" \
           "## props" "## states" "## a11y" "## responsive"; do
    grep -q -- "$k" "$f" || echo "MISSING $k -> $f"
  done
done | tee /dev/stderr | wc -l | tr -d ' ')
echo "component-missing=$COMP_MISS"

# 4. 토큰 표: 라이트 또는 다크 칸이 빈 행
awk -F'|' '/^\| *--/ { g=$3; d=$4; gsub(/ /,"",g); gsub(/ /,"",d);
  if (g=="" || d=="") { print "EMPTY-TOKEN" $2; n++ } }
  END { print "token-half-defined=" n+0 }' "$DESIGN/tokens.md"

# 5. 대비 실측: `## 대비 검증` 줄을 파싱해 WCAG 상대 명도로 대비를 계산
node -e '
const fs=require("fs");
const t=fs.readFileSync(process.env.DESIGN+"/tokens.md","utf8");
const rows=[...t.matchAll(/fg=(#[0-9a-fA-F]{6})\s+bg=(#[0-9a-fA-F]{6})\s+mode=(\w+)\s+min=([\d.]+)/g)];
const L=h=>{const c=[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255)
  .map(v=>v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4));
  return 0.2126*c[0]+0.7152*c[1]+0.0722*c[2];};
let bad=0,light=0,dark=0;
for(const[,fg,bg,mode,min] of rows){
  mode==="dark"?dark++:light++;
  const a=L(fg),b=L(bg);
  const r=(Math.max(a,b)+0.05)/(Math.min(a,b)+0.05);
  if(r<parseFloat(min)){bad++;console.log(`FAIL ${mode} ${fg}/${bg} ratio=${r.toFixed(2)} < ${min}`);}
}
console.log(`pairs=${rows.length} light=${light} dark=${dark} contrast-fail=${bad}`);
'

# 6. 소유권 침범: 디자인 경로에 구현 파일이 생기지 않았는지
echo "impl-files=$(find "$DESIGN" \( -name '*.tsx' -o -name '*.ts' -o -name '*.css' \) 2>/dev/null | wc -l | tr -d ' ')"

# 7. 핸드오프 스키마
node "$CLAUDE_PLUGIN_ROOT/scripts/validate-handoff.mjs" .curvez/handoff/
```

대비가 `FAIL` 이면 값을 고쳐 다시 돌린다. 3회 안에 못 맞추면 실패한 쌍을 `verification` 에 그대로 적고 `status: partial` 로 낮춘다.
**통과했다고 쓰지 마라.**
**이유:** 수신 에이전트는 `done` 을 믿고 그 값으로 컴포넌트를 만든다. 검증 안 된 `done` 하나가 뒤의 모든 작업을 잘못된 전제 위에 올린다.

## 완료 기준

- [ ] `MISSING-DOC` 출력 0줄 — `index.md`, `tokens.md` 존재
- [ ] `screens>=1`, `components>=1`
- [ ] `screen-missing=0` — 모든 화면에 상태 4종과 `focus-order` 가 있다
- [ ] `component-missing=0` — 모든 컴포넌트에 접근성 5키와 필수 섹션 4종이 있다
- [ ] `token-half-defined=0` — 라이트만 또는 다크만 정의된 토큰 0개
- [ ] `light>=3`, `dark>=3`, `contrast-fail=0`
- [ ] `impl-files=0` — 디자인 경로에 `.tsx`/`.ts`/`.css` 0개
- [ ] 핸드오프 검증 오류 0개, `status: done` 이면 `verification` 1건 이상

하나라도 어긋나면 `status: done` 이 아니다. 실패한 명령과 실제 출력 원문을 `verification` 에 적고 `partial` 로 보고한다.

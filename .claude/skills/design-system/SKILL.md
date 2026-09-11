---
name: design-system
description: handwork 의 토큰 축을 넓히고 컴포넌트 스펙과 적용 가이드를 값으로 확정한다. "디자인 시스템 정리해줘", "토큰 축 넓혀줘", "간격 스케일 정해줘", "컴포넌트 스펙 확정해줘", "적용 가이드 써줘", "design system", "token scale", "component spec", "/design-system" 이라고 하거나 `apps/handwork/design/` 아래 문서를 쓸 차례일 때 실행한다.
---

디자인 시스템의 산출물은 그림도 코드도 아니라 **판정 가능한 값**이다.
`handwork-ui` 가 이 문서만 읽고 컴포넌트를 만들 수 있으면 성공이고, "적당히" 가 한 군데 남으면
구현자가 그 자리에서 값을 지어낸다. 그 값은 문서에 남지 않아 다음 라운드에서 다시 달라진다.

이 스킬은 이미 확정된 색 위에 **네 축(간격 · 타이포 · 상태 · 고도)만 얹는다.** 색은 만들지 않는다.

## 언제 이 스킬을 쓰는가

- 색은 정해졌는데 간격·타이포·상태·고도의 값이 아직 문서에 없을 때
- 같은 클래스 문자열이 화면 여러 곳에서 반복돼 컴포넌트로 뽑아야 할 때
- 컴포넌트의 props · variants · states · a11y 를 구현 전에 굳힐 때
- 이미 만든 시스템을 기존 화면에 어디까지 적용할지 `파일:줄` 로 지목할 때
- `handwork-ui` 가 "이 값 뭐로 할까" 를 되묻기 시작할 때

## 언제 쓰지 않는가

- 확정된 스펙을 `.tsx` 로 옮길 때 → `curvez:nextjs-implementation` 을 쓴다. 이 스킬은 코드를 만들지 않는다
- 스토리를 쓰거나 `build-storybook` 게이트를 돌릴 때 → 같은 프로젝트의 `storybook` 스킬을 쓴다
- 이미 구현된 화면의 결함을 지적할 때 → `curvez:quality-gate` 나 `curvez:structure-audit` 을 쓴다
- 결과를 다음 에이전트에게 넘기는 JSON 형식이 궁금할 때 → `curvez:agent-contract` 를 쓴다

**이유:** 값 확정과 코드 작성을 한 흐름에서 같이 하면 스펙에 없는 결정이 코드에만 남는다.
그 코드는 리뷰어도 QA 도 읽지 않으므로 결정의 근거가 조용히 사라지고, 같은 컴포넌트를 다시 만들 때
값이 어긋난다.

### 디자인 값은 curvez 에서 받지 않는다

**handwork 의 디자인 시스템은 독립 자산이다.** 값은 전부 `apps/handwork/design/` 안에 있고,
curvez 의 디자인 스킬·에이전트를 이 절차에서 부르지 않는다.
**이유:** curvez 는 특별한 지시가 없을 때 보편적인 화면을 내는 보일러플레이트다. handwork 는 그
보편값으로 설명되지 않는 값을 확정했으므로, 두 층이 서로를 참조하면 어느 쪽이 맞는지 판정할
근거가 사라진다. 끊는 것은 **값**의 의존뿐이다 — 핸드오프 계약(`curvez:agent-contract`)·팀 실행
(`curvez:team-orchestration`)·게이트 절차(`curvez:quality-gate`)는 그대로 쓴다.

### 경계가 한쪽에만 그어진 것을 알고 넘어간다

위 목록은 코어 스킬을 이름으로 배제하지만, **코어 스킬에는 이 스킬의 이름이 적히지 않는다.**

**이유:** 코어 스킬이 특정 프로젝트의 스킬 이름을 알면, 그 이름이 없는 다른 프로젝트에서
존재하지 않는 것을 가리키게 된다. 그래서 경계가 반쪽인 것을 인정하고, 트리거가 실제로 겹치는지는
아래 명령으로 사람이 대조한다.

```bash
grep -rn "디자인\|토큰\|스토리북" plugins/curvez/skills .claude/skills --include='SKILL.md'
```

출력을 눈으로 읽고, 겹치는 코어 스킬이 나오면 **이 문서의 `## 언제 쓰지 않는가` 쪽에만** 추가한다.

## 값의 정본

충돌이 나면 위에서부터 이긴다. 예외 없다.

1. `apps/handwork/src/app/globals.css` — 색·반경의 정본. 브라우저가 실제로 읽는 값이다
2. `apps/handwork/design/tokens.md` — 그 밖의 확정된 값(간격·타이포·상태·고도)과 색의 hex 사본
3. `apps/handwork/components.json` — shadcn 스타일·alias
4. `.curvez/architecture.md` 의 경계 규칙

**색만은 1번이 2번을 이긴다.** `apps/handwork/design/tokens.md` 의 머리말이
"정본은 `apps/handwork/src/app/globals.css` 다. 이 표는 사본이고, 값이 갈리면 CSS 가 이긴다" 고
직접 적어 뒀다. 그래서 **색 값을 읽을 때는 항상 `globals.css` 를 연다.**
**그리고 두 값이 어긋나 있으면 `tokens.md` 쪽 사본을 같은 라운드에 고친다.** 그 문서는 이 절차의 소유다.

**새 색을 만들지 마라.**
**이유:** 색은 배경과의 쌍으로만 의미가 있고, 그 쌍 20개가 이미 대비 실측을 통과한 상태다. 새 색을
하나 들이면 그 색과 기존 배경 전부의 조합을 다시 재야 하는데, 그 재검사가 어디에도 기록되지 않은 채
"통과" 로 남는다. 기존 토큰의 조합으로 먼저 풀고, 그래도 안 되면 새 토큰의 이름·값·대비 쌍을
`decisions` 에 적은 뒤 `blocked_on` 에 `who: curvez-nextjs` 로 `globals.css` 반영을 요청한다 —
값을 정하는 것은 이 절차지만 `globals.css` 는 `curvez-nextjs` 의 소유다.

**간격·타이포에 새 CSS 변수를 만들지 마라.**
**이유:** `apps/handwork/design/tokens.md` 의 `## 간격·타이포는 새 토큰을 만들지 않는다` 가 이미
Tailwind 4 기본 스케일을 쓰기로 정했다. 변수를 새로 만들면 같은 앱 안에 스케일이 둘이 되고,
구현자는 매번 어느 쪽을 쓸지 고르게 된다.

## 절차

### 1. 토큰 축을 확장한다

`apps/handwork/design/tokens.md` 에 **네 축만** 값으로 적는다. 색은 손대지 않는다.

| 축     | 확정할 것                                                                                             |
| ------ | ----------------------------------------------------------------------------------------------------- |
| 간격   | 컴포넌트 안쪽 여백 · 요소 사이 간격 · 섹션 세로 간격. Tailwind 유틸리티 이름으로 적는다               |
| 타이포 | 단계마다 크기 · 굵기 · 자간 · 줄높이. 어느 단계를 어디에 쓰는지 용도를 함께 적는다                    |
| 상태   | `default` · `hover` · `focus-visible` · `pressed` · `disabled` · `loading` 이 각각 어느 토큰을 쓰는가 |
| 고도   | 면이 몇 단계인가 · 각 단계가 배경·테두리·그림자 중 무엇으로 구분되는가                                |

**값은 Tailwind 유틸리티 이름과 토큰 이름으로 적는다.** `16px` 이 아니라 `p-4`, `#14201E` 가 아니라 `text-foreground`.
**이유:** 이름으로 참조해야 다크 모드에서 값이 자동으로 뒤집힌다. 픽셀과 hex 를 적으면
구현자가 그것을 그대로 코드에 박고, 그 순간 다크 모드가 조용히 깨진다.

축을 넓히면서 **새 대비 쌍이 생기면** `tokens.md` 끝의 `## 대비 검증` 블록에 줄을 추가한다.
줄 형식은 `- fg=#RRGGBB bg=#RRGGBB mode=light|dark min=4.5` 이고, 그 파일 끝에 20줄이 실제로
들어 있다. **새로 쓰기 전에 그 블록을 열어 같은 모양으로 잇는다.**

**끝났다고 판정하는 기준:** 네 축 표가 전부 있고, `## 대비 검증` 의 실측에서 `contrast-fail=0`.

### 2. 컴포넌트 스펙을 확정한다

컴포넌트마다 `apps/handwork/design/components/<ComponentName>.md` 하나.
`## props` · `## states` · `## a11y` · `## responsive` 네 섹션은 **어느 컴포넌트에서도 생략하지 않는다.**

**서식의 정본은 이미 쓰인 12개 문서다.** 새 스펙을 쓰기 직전에
`apps/handwork/design/components/Badge.md` 를 열어 같은 모양으로 쓴다 — 근거를 `파일:줄` 로 인용하는
방식, `## states` 표의 행 라벨, `a11y:` 다섯 키의 서술 깊이가 전부 거기 있다.

| 섹션            | 확정할 값                                                                                                   |
| --------------- | ----------------------------------------------------------------------------------------------------------- |
| `## props`      | 이름 · 타입 · 필수 여부 · 기본값 · 의미. 기본값이 없으면 "없음, 호출부가 반드시 준다" 로 적는다             |
| `## states`     | 표의 행 라벨로 `default` · `hover` · `focus-visible` · `pressed` · `disabled` · `loading` · `error` 를 둔다 |
| `## a11y`       | `a11y:label` `a11y:focus` `a11y:contrast` `a11y:target` `a11y:role` 다섯 키가 전부 등장한다                 |
| `## responsive` | 브레이크포인트마다 무엇이 달라지는가. 분기가 없으면 "0건" 이라고 적는다                                     |

**변형(`variant`)은 별도 섹션을 만들지 않고 `## props` 안의 표로 적는다.** 기존 12개 문서가 전부
그 방식이다.
**이유:** 서식을 지금 바꾸면 이미 쓰인 12개와 새로 쓰는 것의 모양이 갈린다. 한 디렉터리 안에
두 서식이 섞이면 다음 사람이 어느 쪽을 따를지 매번 고르게 된다.

**줄을 지우지 마라.** 해당 없으면 지우는 대신 사유를 적는다.
**이유:** 줄이 없으면 "생각하지 않았다" 와 "필요 없다" 가 구분되지 않는다. 검증의 `grep` 도
그 차이를 못 본다. 사유가 적혀 있어야 다음 사람이 다시 따지지 않는다.

**접근성을 나중으로 미루지 마라.**
**이유:** 대비와 타깃 크기는 값만 바꾸면 되지만, 포커스 순서와 `role` 은 마크업 구조에 박힌다.
스펙 시점에 정하면 한 줄이고, 구현 뒤에 정하면 컴포넌트 트리를 다시 짠다.

컴포넌트 수를 임의로 늘리지 않는다. 필요하면 `decisions` 에 근거와 함께 남기고 다음 라운드로 넘긴다.
**이유:** 쓰이지 않는 컴포넌트는 스토리까지 따라와서, 유지할 것만 늘리고 검증되지는 않는다.

**끝났다고 판정하는 기준:** 아래 검증의 `component-missing=0`.

### 3. 적용 가이드를 쓴다

`apps/handwork/design/adoption.md` 에 **어느 화면의 어느 줄을 무엇으로 바꾸는가**를 적는다.

항목 형식은 하나다.

```
- apps/handwork/src/views/home.tsx:42 — `max-w-5xl flex-1 px-5 py-10 md:px-8 md:py-16` → `<PageShell>`
```

**`파일:줄` 없이 항목을 쓰지 마라.**
**이유:** 적용은 `curvez-nextjs` 가 격리된 컨텍스트에서 한다. 되물을 수 없으므로, 가리키는 줄이
없으면 어느 줄을 바꿀지 스스로 찾아야 하고 그 탐색 결과가 매 실행 달라진다.

줄 번호는 **직접 실측해서** 적는다. `grep -n` 의 출력을 그대로 옮긴다.

```bash
grep -rn 'max-w-5xl' apps/handwork/src --include='*.tsx'
```

대상 줄을 못 찾은 항목은 가이드에 넣지 않는다. 그 사실을 `status: partial` 로 보고한다.
**이유:** 존재하지 않는 줄을 가리키는 항목은 수신 에이전트를 엉뚱한 파일로 보낸다.
빠진 항목은 다음 라운드에 채울 수 있지만, 틀린 항목은 이미 고쳐진 코드를 되돌린다.

**끝났다고 판정하는 기준:** 아래 검증의 `without-line=0` 이고 `adoption-refs>=1`.

## 규칙

- **코드를 만들지 않는다.** `.tsx` · `.ts` · `.css` · `.stories.tsx` 를 이 절차에서 쓰지 않는다
  - **이유:** 스펙에 없는 결정이 코드에만 남으면, 같은 컴포넌트를 다시 만들 때 무엇이 확정된 값이고 무엇이 즉흥이었는지 구분할 근거가 사라진다
- **`apps/handwork/design/` 밖에 쓰지 않는다** (핸드오프 파일 하나 제외)
  - **이유:** `curvez-nextjs` 가 `${paths.web}` = `apps/handwork` 를 통째로 소유한다. `design/` 을 갈라 쓰는 예외가 `.curvez/team.md` 에 선언돼 있고, 그 표 밖으로 나가면 예외가 무효가 된다
- **서식의 예시를 이 문서에 옮겨 적지 않는다.** 정본은 `apps/handwork/design/` 의 실제 파일이다 —
  토큰 표와 `## 대비 검증` 은 `tokens.md`, 컴포넌트 스펙은 `components/Badge.md`
  - **이유:** 서식을 두 곳에 두면 규칙을 바꿀 때 한쪽만 고쳐지고, 두 문서가 다른 서식을 말하는 순간 어느 쪽이 맞는지 판정할 근거가 사라진다. 살아 있는 파일은 사본과 달리 낡지 않는다
- **확인하지 않은 수치를 적지 않는다.** 중복 횟수·줄 번호·대비 값은 전부 명령을 돌려 얻은 출력을 옮긴다
  - **이유:** 그럴듯한 수치는 검증을 통과한 수치와 문서에서 똑같이 생겼다. 구현자는 둘을 구분하지 못하고 믿는다

## 검증

아래를 **실제로 돌리고** 출력을 핸드오프의 `verification` 에 원문 그대로 옮긴다.

```bash
SYS=apps/handwork/design
CSS=apps/handwork/src/app/globals.css

# 1. 필수 산출물
for f in "$SYS/tokens.md" "$SYS/adoption.md" "$CSS"; do test -f "$f" || echo "MISSING-DOC $f"; done
echo "components=$(find "$SYS/components" -name '*.md' 2>/dev/null | wc -l | tr -d ' ')"

MISS9=0
for c in PageShell PageTitle Card Badge Button AppLink Separator Prose ThemeToggle; do
  test -f "$SYS/components/$c.md" || { echo "MISSING-COMPONENT $c"; MISS9=$((MISS9 + 1)); }
done
echo "missing-of-9=$MISS9"
echo "draft-specs=$(find "$SYS" -name '*.system.md' 2>/dev/null | wc -l | tr -d ' ')"

# 2. 컴포넌트 스펙: 필수 4섹션 + 접근성 5키 + states 표의 행 라벨 7종.
#    키는 기존 12개 문서에서 실측한 것이다 — 12/12 가 전부 갖고 있다
COMP_MISS=$(for f in $(find "$SYS/components" -name '*.md' 2>/dev/null); do
  for k in "## props" "## states" "## a11y" "## responsive" \
           "a11y:label" "a11y:focus" "a11y:contrast" "a11y:target" "a11y:role" \
           "| default" "| hover" "| focus-visible" "| pressed" "| disabled" "| loading" "| error"; do
    grep -q -F -- "$k" "$f" || echo "MISSING $k -> $f"
  done
done | tee /dev/stderr | wc -l | tr -d ' ')
echo "component-missing=$COMP_MISS"

# 3. 새 색 토큰 0건 — tokens.md 표가 선언한 토큰이 globals.css 에 실제로 있는가.
#    **hex 리터럴을 대조하지 마라.** globals.css 는 oklch() 로 적고 tokens.md 는 hex 사본이라
#    문자열이 원래 다르다. 그렇게 재봤더니 22건이 전부 오탐이었다.
#    `--[a-z]` 로 좁히는 이유: 표 구분선(`| ---- |`)이 토큰 이름으로 잡힌다. 실측 16건 오탐.
DECLARED=$(awk -F'|' '/^\| *--[a-z]/ { gsub(/ /,"",$2); print $2 }' "$SYS/tokens.md" | sort -u)
echo "declared-tokens=$(printf '%s\n' "$DECLARED" | grep -c '^--')"
printf '%s\n' "$DECLARED" | while IFS= read -r v; do
  [ -n "$v" ] && { grep -qF -- "$v:" "$CSS" || echo "UNKNOWN-TOKEN $v"; }
done | tee /dev/stderr | wc -l | tr -d ' ' | sed 's/^/unknown-tokens=/'

# 4. adoption.md 가 **기존 코드**를 가리킬 때 줄 번호를 달았는가.
#    신규 파일(`shared/ui/*.tsx`)은 가리킬 줄이 없으므로 대상에서 뺀다.
#    awk 의 /.../ 리터럴 안에서는 문자 클래스의 `/` 가 정규식을 먼저 끊는다.
#    문자열 regex 로 넘겨야 한다 — 그렇게 안 했더니 `nonterminated character class` 로 죽었다.
awk '
  { line=$0
    while (match(line, "apps/handwork/src/(views|entities|widgets)/[A-Za-z0-9_./-]+")) {
      ref=substr(line, RSTART, RLENGTH); rest=substr(line, RSTART+RLENGTH)
      total++
      if (rest ~ /^:[0-9]+/) ok++; else print "NO-LINE " ref
      line=rest
    }
  }
  END { print "target-refs=" total+0 " with-line=" ok+0 " without-line=" (total+0)-(ok+0) }
' "$SYS/adoption.md"

# 5. 대비 실측 — tokens.md 의 `## 대비 검증` 줄을 파싱한다
SYS="$SYS" node -e '
const fs=require("fs");
const p=process.env.SYS+"/tokens.md";
if(!fs.existsSync(p)){console.log("contrast=NO-TOKENS-FILE");process.exit(0);}
const t=fs.readFileSync(p,"utf8");
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

# 6. 소유권 침범 — 값 문서 자리에 구현 파일이 생기지 않았는지
echo "impl-files=$(find "$SYS" \( -name '*.tsx' -o -name '*.ts' -o -name '*.css' \) 2>/dev/null | wc -l | tr -d ' ')"
```

`FAIL` 이 나오면 값을 고쳐 다시 돌린다. 3회 안에 못 맞추면 실패한 쌍을 `verification` 에 원문으로 적고
`status: partial` 로 낮춘다. **통과했다고 쓰지 마라.**
**이유:** 수신 에이전트는 `done` 을 믿고 그 값으로 컴포넌트를 만든다. 검증 안 된 `done` 하나가
뒤의 모든 작업을 잘못된 전제 위에 올린다.

## 완료 기준

- [ ] `MISSING-DOC` 출력 **0줄** — `tokens.md` · `adoption.md` · `globals.css` 가 있다
- [ ] `tokens.md` 에 간격 · 타이포 · 상태 · 고도 **네 축 표가 전부** 있다
- [ ] `missing-of-9=0` · `draft-specs=0` — 9종이 전부 있고 `*.system.md` 초안이 병합돼 사라졌다
- [ ] `component-missing=0` — 모든 스펙에 필수 4섹션 · 접근성 5키 · states 행 7종이 있다
- [ ] `declared-tokens>=1` 이고 `unknown-tokens=0`. `declared-tokens=0` 이면 표를 못 읽은 것이므로 통과가 아니라 `blocked`
- [ ] `target-refs>=1` 이고 `with-line>=1`. `NO-LINE` 로 나온 줄을 **눈으로 확인해** 전부 신규 파일·grep 명령·산문인지 본다 — 기계가 산문과 치환 항목을 가르지 못하므로 이 대조는 사람이 한다
- [ ] `contrast-fail=0`. `contrast=NO-TOKENS-FILE` 이면 통과가 아니라 `blocked`
- [ ] `impl-files=0` — 값 문서 자리에 `.tsx`/`.ts`/`.css` 0개
- [ ] 트리거 겹침 대조 명령을 돌렸고, 겹치는 코어 스킬을 `## 언제 쓰지 않는가` 에 적었다

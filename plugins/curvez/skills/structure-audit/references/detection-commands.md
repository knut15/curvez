# 검출 명령 전문

`SKILL.md` 절차 2단계에서 연다. 아래 명령을 **그대로 복사해 실행**한다. 손으로 다시 쓰지 마라.

**이유:** 이 명령들은 픽스처로 실행 검증을 마친 것이다. 손으로 옮겨 적으면 정규화 규칙(공백 축약,
import·주석 제외)이나 겹치는 창 병합이 조용히 빠지고, 그러면 같은 코드베이스에서 매번 다른 목록이
나온다. 목록이 갈리면 감사 자체가 무의미해진다.

전용 스크립트는 아직 없다. 반복 실행이 굳어지면 `scripts/structure-audit.mjs` 로 옮길 수 있다.

## 공통 전제

```bash
SRC=src                              # .curvez/profile.json 의 paths.* 에서 읽어 채운다
ARCH=.curvez/architecture.md
W=5                                  # 중복 창 크기. 기본 5줄
```

`SRC` 를 하드코딩하지 마라. **이유:** 스택마다 소스 루트가 다르다. 엉뚱한 트리를 스캔한 결과는
전부 폐기해야 하고, 폐기했다는 사실조차 나중에 알아채기 어렵다.

`monorepo` 는 `paths.web` `paths.mobile` `paths.domain` 각각에 대해 1~3번을 따로 돌린다.
한 번에 합쳐 돌리면 앱 간 "중복"이 잡히는데, 그것은 애초에 분리하기로 한 것이라 지적이 아니다.

## 1. 파일 크기 — 중복의 선행 지표

```bash
find "$SRC" -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) -print0 \
  | xargs -0 wc -l | awk '$2 != "total" && $1 > 400 {print $1, $2}' | sort -rn | head -20
```

`utils.ts` `helpers.ts` `index.ts` 는 200줄로 따로 본다.

```bash
find "$SRC" -type f \( -name "utils.ts" -o -name "helpers.ts" -o -name "index.ts" \) -print0 \
  | xargs -0 wc -l | awk '$2 != "total" && $1 > 200 {print $1, $2}' | sort -rn
```

## 2. 중복 블록

정규화 후 연속 `W` 줄이 서로 다른 파일 2곳 이상에서 반복되는 구간을 찾는다.
겹치는 창은 하나로 합쳐 실제 반복 길이(`N줄`)와 파일 수를 함께 낸다.
테스트 파일(`*.test.*` `*.spec.*` `__tests__/` `__mocks__/`)과 `*.d.ts` 는 제외한다.

```bash
node -e '
const fs=require("fs"),path=require("path"),crypto=require("crypto");
const root=process.argv[1],W=Number(process.argv[2]||5),exts=[".ts",".tsx",".js",".jsx"],files=[];
(function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);
if(e.isDirectory()){if(!/node_modules|\.next|dist|build|coverage|__tests__|__mocks__/.test(p))walk(p);}
else if(exts.includes(path.extname(p))&&!/\.(test|spec|d)\./.test(e.name))files.push(path.relative(".",p));}})(root);
const H=new Map();
for(const f of files){const ls=fs.readFileSync(f,"utf8").split("\n")
.map((l,i)=>({n:i+1,t:l.trim().replace(/\s+/g," ")}))
.filter(o=>o.t&&!/^(import |export .* from |\/\/|\*|\/\*|#)/.test(o.t)&&!/^[{}()\[\];,]+$/.test(o.t));
for(let i=0;i+W<=ls.length;i++){const w=ls.slice(i,i+W);
const k=crypto.createHash("sha1").update(w.map(o=>o.t).join("\n")).digest("hex");
if(!H.has(k))H.set(k,[]);H.get(k).push({f,i,n:w[0].n});}}
const key=v=>v.map(o=>o.f+"#"+o.i).sort().join("|");
const groups=[...H.values()].filter(v=>new Set(v.map(o=>o.f)).size>=2);
const byKey=new Map(groups.map(v=>[key(v),v]));
const sh=(v,d)=>key(v.map(o=>({f:o.f,i:o.i+d})));
const out=[];
for(const v of groups){if(byKey.has(sh(v,-1)))continue;
let run=W,cur=v;while(byKey.has(sh(cur,1))){cur=byKey.get(sh(cur,1));run++;}
out.push({run,files:new Set(v.map(o=>o.f)).size,at:v.map(o=>o.f+":"+o.n)});}
out.sort((a,b)=>b.files-a.files||b.run-a.run);
console.log("중복 후보 "+out.length+"건 (창 "+W+"줄, 서로 다른 파일 2곳 이상)");
out.slice(0,20).forEach(o=>console.log("  "+o.run+"줄 x 파일"+o.files+"곳: "+o.at.join(", ")));
' "$SRC" "$W"
```

출력의 `N줄 x 파일M곳` 이 `SKILL.md` 중복 판정 표의 입력이다. 눈으로 다시 세지 마라.

## 3. 순환 의존

상대 경로 `import` 로 의존 그래프를 만들고 DFS 로 사이클을 찾는다. 전수 검사다.
같은 사이클이 여러 진입점에서 발견돼도 회전 정규화로 한 건으로 합친다.
사이클의 **모든** 간선이 `import type` 뿐이면 `[타입 전용]` 로 표시한다.

```bash
node -e '
const fs=require("fs"),path=require("path");
const root=process.argv[1],exts=[".ts",".tsx",".js",".jsx"],files=[];
(function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);
if(e.isDirectory()){if(!/node_modules|\.next|dist|build|coverage/.test(p))walk(p);}
else if(exts.includes(path.extname(p)))files.push(path.relative(".",p));}})(root);
const rs=(from,spec)=>{const b=path.resolve(path.dirname(from),spec);
for(const e of exts)if(fs.existsSync(b+e))return path.relative(".",b+e);
for(const e of exts){const i=path.join(b,"index"+e);if(fs.existsSync(i))return path.relative(".",i);}
return null;};
const g=new Map(),TY=new Map();
for(const f of files){const deps=new Map();
for(const m of fs.readFileSync(f,"utf8").matchAll(/\bimport\s+(type\s+)?([^;]*?)\bfrom\s*["\x27](\.[^"\x27]+)["\x27]/g)){
const r=rs(f,m[3]);if(!r)continue;const t=!!m[1];
deps.set(r,deps.has(r)?(deps.get(r)&&t):t);}
g.set(f,[...deps.keys()]);for(const [k,v] of deps)TY.set(f+">"+k,v);}
const st=new Map(),stk=[],seen=new Set(),cy=[];
const dfs=n=>{st.set(n,1);stk.push(n);
for(const d of g.get(n)||[]){
if(st.get(d)===1){const c=stk.slice(stk.indexOf(d));
const m=c.indexOf([...c].sort()[0]),rot=c.slice(m).concat(c.slice(0,m));
const k=rot.join(">");if(!seen.has(k)){seen.add(k);
const edges=rot.map((x,i)=>x+">"+rot[(i+1)%rot.length]);
cy.push({p:rot.concat(rot[0]).join(" -> "),type:edges.every(e=>TY.get(e)===true)});}}
else if(!st.get(d))dfs(d);}
stk.pop();st.set(n,2);};
for(const n of g.keys())if(!st.get(n))dfs(n);
console.log("순환 의존 "+cy.length+"건");
cy.forEach(c=>console.log("  "+c.p+(c.type?"   [타입 전용]":"")));
' "$SRC"
```

이 명령은 상대 경로 import 만 본다. `@/` 별칭이 쓰이는 코드베이스라면 사이클을 놓친다.
그 경우 놓쳤을 수 있다는 사실을 `summary` 에 적는다. **"순환 없음"으로 단정하지 마라.**
**이유:** 검사 범위 밖을 "문제 없음"으로 적으면 다음 라운드가 그 거짓 위에서 시작된다.

## 4. 경계 위반

`.curvez/architecture.md` 의 `## 금지 import` 표를 파싱해 규칙마다 grep 한다.
표의 세 번째 열이 `grep -E` 에 그대로 들어간다.

**파싱 함정 둘.** 필드 구분자는 `' | '`(공백-파이프-공백)다. 표 안의 패턴에 있는 `\|` 는
이스케이프된 것이므로 읽어낸 뒤 `|` 로 되돌려야 한다. 이 둘을 빼먹으면 패턴이 잘려
위반 0건이 나오고, 0건은 "깨끗하다"로 오독된다.

```bash
awk -F' \\| ' '/^\| *ARCH-[0-9]/{id=$1; sub(/^\| */,"",id); sub(/ *$/,"",id);
  pat=$3; gsub(/\\\|/,"|",pat); print id "\t" $2 "\t" pat}' "$ARCH" \
| while IFS=$'\t' read -r id p pat; do
    hits=$(grep -rEn --include='*.ts' --include='*.tsx' --include='*.js' --include='*.jsx' \
             -- "$pat" "$p" 2>/dev/null || true)
    n=$(printf '%s' "$hits" | grep -c . || true)
    echo "$id  $p  위반 ${n}건"
    if [ "$n" -gt 0 ]; then printf '%s\n' "$hits" | head -10 | sed 's/^/    /'; fi
  done
```

규칙 ID 를 하나도 못 읽었으면(출력이 비었으면) 표 형식이 규약과 다른 것이다.
그때는 위반 0건이 아니라 **판정 불가**다. `blocked_on` 에 `who: "curvez-architect"` 로 남긴다.

의존 방향은 `## 의존 방향` 절을 읽어 레이어 순서를 확인한 뒤, 위 표에 해당 규칙이 있는지 본다.
표에 없는 방향 위반은 규칙이 아니라 관찰이다 — `kind: "placement"` 로만 남긴다.

## 5. 성급한 추상화 판정 — git 공변경률

중복 후보 두 파일이 **함께 변해 왔는지** 를 센다. 50% 이상이면 "함께 변해 왔다".

```bash
A="$SRC/domain/money.ts"; B="$SRC/ui/PriceTag.tsx"   # 중복 후보 두 파일로 바꾼다
git log --format='%H' --name-only -- "$A" "$B" | node -e '
let t="";process.stdin.on("data",d=>t+=d).on("end",()=>{
const [A,B]=process.argv.slice(1),cs=[];let cur=null;
for(const l of t.split("\n")){if(/^[0-9a-f]{40}$/.test(l)){cur=new Set();cs.push(cur);}
else if(l.trim()&&cur)cur.add(l.trim());}
const seen=cs.filter(s=>s.size>0),both=seen.filter(s=>s.has(A)&&s.has(B)).length;
const pct=Math.round(both/Math.max(seen.length,1)*100);
console.log("공변경 "+both+" / 등장 커밋 "+seen.length+" = "+pct+"%  ("+(pct>=50?"함께 변해 왔다":"따로 변해 왔다")+")");});' "$A" "$B"
```

등장 커밋이 3건 미만이면 이 지표를 쓰지 마라. 표본이 없다.
그때는 3문 판정의 1번을 "판정 불가"로 두고 2·3번만으로 정한다. **이유:** 커밋 2건짜리
0% 를 "따로 변해 왔다"의 증거로 쓰면, 갓 만든 파일은 전부 추출 금지가 된다.

## 6. 파일 위치 보조 — 사용처 세기

```bash
SYMBOL=formatPrice     # 잘못된 위치가 의심되는 심볼
DEF=$(grep -rEln --include='*.ts' --include='*.tsx' \
        "export ((async )?function|const|class) $SYMBOL\b" "$SRC" | head -1)
USERS=$(grep -rEln --include='*.ts' --include='*.tsx' "\b$SYMBOL\b" "$SRC" \
        | grep -v "^${DEF:-__none__}$" || true)
echo "정의: ${DEF:-불명}"
echo "사용처 파일 $(printf '%s' "$USERS" | grep -c . || true) 곳"
printf '%s\n' "$USERS"
```

`shared/` `common/` `utils/` 에 있는데 사용처 파일이 1곳이면 잘못된 위치다.
특정 feature 폴더 안에 있는데 사용처가 3곳 이상이면 공용 레이어로 올릴 대상이다.

## 검증 실패를 감추지 마라

명령이 실패하면 **2회까지 재시도**하고, 그래도 실패하면 그 항목의 검사를 "안 함"으로 남긴다.
실패한 명령과 실제 오류 출력을 `verification` 에 그대로 적는다.

**이유:** 실패한 검사를 "문제 없음"으로 적으면 그 영역은 영원히 검사되지 않는다.
아무도 다시 확인하지 않고, 다음 라운드는 그 거짓 위에서 시작한다.

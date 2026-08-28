# Next.js 구현 검증 명령 전문

`SKILL.md` 4단계에서 구현 단위를 끝내고 수치를 낼 때 읽는다.
특히 `## 금지 import` 표(`ARCH-NNN`)를 파싱하는 4번 블록은 이스케이프 함정이 있어 여기 것을 그대로 쓴다.

전제: 저장소 루트에서 실행한다. 명령은 전부 `.curvez/profile.json` 에서 읽는다. 하드코딩하지 않는다.
**이유:** 프로젝트마다 스크립트 이름이 달라, 하드코딩하면 존재하지 않는 명령을 실행하고 실패를 통과로 착각한다.

---

## 1. 프로파일에서 경로와 명령을 읽는다

```bash
set -u
PROFILE=".curvez/profile.json"
[ -f "$PROFILE" ] || { echo "BLOCKED: $PROFILE 이 없다"; exit 1; }

TYPECHECK=$(node -p "require('./$PROFILE').commands?.typecheck ?? ''")
LINT=$(node -p "require('./$PROFILE').commands?.lint ?? ''")
TEST=$(node -p "require('./$PROFILE').commands?.test ?? ''")
WEB=$(node -p "require('./$PROFILE').paths?.web ?? ''")
DOMAIN=$(node -p "require('./$PROFILE').paths?.domain ?? ''")
STACK=$(node -p "require('./$PROFILE').stack ?? ''")
echo "stack=$STACK / web=$WEB / domain=$DOMAIN / typecheck=$TYPECHECK / lint=$LINT / test=$TEST"

# paths.web 은 폴백하지 않는다. 없으면 여기서 멈춘다.
[ -n "$WEB" ] || { echo "BLOCKED: profile.json 에 paths.web 이 없다"; exit 1; }
if [ "$STACK" = "monorepo" ] && [ -z "$DOMAIN" ]; then
  echo "BLOCKED: stack=monorepo 인데 profile.json 에 paths.domain 이 없다"; exit 1
fi
```

---

## 2. 품질 게이트를 실행한다

```bash
[ -n "$TYPECHECK" ] && eval "$TYPECHECK"; echo "typecheck exit=$?"
[ -n "$LINT" ] && eval "$LINT"; echo "lint exit=$?"
[ -n "$TEST" ] && eval "$TEST"; echo "test exit=$?"
```

명령 문자열이 비어 있으면 실행되지 않는다. 그때는 통과가 아니라 `blocked` 다.

---

## 3. 도메인 레이어의 `next/*` 참조를 센다

```bash
grep -rnE "from ['\"]next(/[a-z0-9-]+)?['\"]|require\(['\"]next(/[a-z0-9-]+)?['\"]\)" \
  "$WEB/src/domain" 2>/dev/null | wc -l
```

`stack: monorepo` 면 `$DOMAIN` 도 같은 방식으로 센다. 기대값은 **0**.

---

## 4. `## 금지 import` 표를 파싱해 규칙별 위반을 센다

표의 열 순서는 `규칙 ID | 검사 경로 | 금지 패턴 (ERE) | 이유` 이고, 세 번째 열이 `grep -E` 에 그대로 들어간다.

```bash
ARCH=.curvez/architecture.md
[ -f "$ARCH" ] || { echo "BLOCKED: $ARCH 가 없다"; exit 1; }

# 규칙 개수. 0 이면 표 형식이 어긋난 것이다. 위반 0건과 구별하라.
grep -cE '^\| ARCH-[0-9]{3} \|' "$ARCH"

ARCH_VIOLATIONS=0
while IFS="$(printf '\t')" read -r id paths re; do
  n=$(grep -rInE "$re" $paths 2>/dev/null | wc -l | tr -d ' ')
  echo "$id 위반 $n 건 (경로: $paths / 패턴: $re)"
  [ "$n" -gt 0 ] && grep -rInE "$re" $paths 2>/dev/null | sed "s/^/  $id  /"
  ARCH_VIOLATIONS=$((ARCH_VIOLATIONS + n))
done <<EOF
$(awk -F' \\| ' '/^\| ARCH-[0-9]{3} \|/ { id=$1; sub(/^\| /,"",id); p=$3; gsub(/\\\|/,"|",p);
  print id"\t"$2"\t"p }' "$ARCH")
EOF
echo "ARCH 위반 합계=$ARCH_VIOLATIONS"
```

### 이스케이프 함정 (이 블록을 손대지 않는 이유)

마크다운 표 안에서 패턴의 `|` 는 `\|` 로 이스케이프돼 있다. 두 가지를 반드시 지킨다.

| 지킬 것                                         | 안 지키면                                        |
| ----------------------------------------------- | ------------------------------------------------ |
| 필드 구분자를 `' \| '`(공백-파이프-공백)로 쓴다 | 패턴 중간의 `\|` 에서 필드가 잘려 3열이 조각난다 |
| 읽어낸 패턴의 `\|` 를 `                         | ` 로 되돌린다(`gsub(/\\\|/,"                     | ",p)`) | `grep -E` 가 리터럴 `\|` 를 찾아 아무것도 매칭하지 않는다 |

두 경우 모두 **위반 0건으로 잘못 보고된다.** 이 함정은 실행 테스트로 두 번 잡혔다.
그래서 `grep -cE '^\| ARCH-[0-9]{3} \|'` 의 규칙 개수를 먼저 찍고, 그 값이 `0` 이면 검사를 못 한 것으로 판정한다.

---

## 5. 타입 탈출구를 센다

```bash
grep -rnE ":\s*any\b|<any>|\bas\s+any\b" "$WEB/src" --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l
grep -rnE "\bas\s+[A-Z][A-Za-z0-9_]*" "$WEB/src" --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l
```

`any` 는 **0** 이어야 한다. 두 번째(단언) 출력이 0 이 아니면 어댑터 파일인지 확인하고,
불가피한 것은 개수와 파일 경로를 `decisions` 에 명시한다.

---

## 6. `"use client"` 위치를 센다

```bash
grep -rlE "^[\"']use client[\"']" "$WEB/src/app" --include="page.tsx" --include="layout.tsx" 2>/dev/null | wc -l
```

기대값은 **0**. 값이 있으면 왜 잎으로 내리지 못했는지를 `decisions` 에 남긴다.

---

## 7. 디자인 스펙 대조

구현 대상 문서에서 리터럴 키를 뽑아 구현과 대조한다. 비슷한 말로 바꿔 찾지 않는다.

```bash
grep -rn "state:" .curvez/design/screens .curvez/design/components 2>/dev/null
grep -rn "platform:" .curvez/design/screens .curvez/design/components 2>/dev/null
```

`platform:` 값이 `both` 또는 `nextjs` 인 항목만 구현 대상이다. `rn` 은 세지 않는다.
문서에 있는데 구현에 없는 상태 키가 1건이라도 있으면 `status: done` 을 쓰지 않는다.

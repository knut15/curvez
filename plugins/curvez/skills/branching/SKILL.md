---
name: branching
description: 브랜치를 어디서 따고 어디로 PR 을 올리고 누가 머지하는지의 절차. 이름 규칙(feature/·fix/·hotfix/ 등), 머지 방식, 릴리스와 hotfix 흐름을 `.curvez/profile.json` 의 `git` 에서 읽어 실행한다. "브랜치 따줘", "새 작업 시작할게", "브랜치 어디서 따야 해", "PR 올려줘", "머지해줘", "릴리스 올리자", "핫픽스", "create a branch", "open a PR", "merge it" 라고 하거나 코드를 고치기 전에 지금 어느 브랜치인지 확인할 때 읽는다.
---

# 브랜치 절차

**브랜치 이름을 이 문서에 문자열로 쓰지 않는다.** 전부 `.curvez/profile.json` 의 `git` 에서 읽어
`$BASE` · `$RELEASE` 로 쓴다. 설계 근거와 버린 대안은 `plugins/curvez/docs/git-strategy.md` 가 정본이다.
이 스킬은 **실행 절차**다.

**이유:** 프로젝트마다 구조가 다르다. GitHub Flow 는 `main` 하나이고, 2단 구조는 `main ← release` 다.
`release` 를 문서에 박으면 그 브랜치가 없는 저장소에서 `git switch release` 가 실패하고, 실패한 채
작업 브랜치를 따면 **배포된 브랜치 위에서 작업하게 된다.** 그 커밋은 옮기기 전까지 PR 이 열리지 않는다.

## 언제 이 스킬을 쓰는가

- 새 작업을 시작하기 직전 — 코드를 고치기 전에 브랜치가 먼저다
- 브랜치를 만들거나 이름을 정할 때
- 지금 어느 브랜치에 있고 여기서 작업해도 되는지 판정할 때
- PR 을 올릴 때, PR 타겟(`--base`)을 정할 때
- 머지해도 되는지, 사람이 눌러야 하는지 가를 때
- 릴리스 PR 을 열거나 back-merge 로 브랜치를 맞출 때 (2단 구조)
- 배포된 것의 긴급 수정(`hotfix/`)을 시작할 때
- 앞 작업의 코드가 필요해 거기서 분기하고 싶어질 때 — **그때가 이 문서를 읽을 때다**

## 언제 쓰지 않는가

- **변경을 스테이징하고 커밋 메시지를 쓰고 커밋할 때 → `commit` 을 쓴다.**
  트리거가 겹치므로 경계를 이렇게 긋는다. **"커밋해줘" · "메시지 뭐라고 쓰지" · "푸시해줘" 는 `commit`,
  "브랜치 따줘" · "PR 어디로 올려" · "머지해도 돼" 는 이쪽이다.** 이 스킬은 브랜치가 **어디서 나서
  어디로 가는지**를 정하고, `commit` 은 그 브랜치 **위에 무엇을 쌓는지**를 정한다.
  PR 본문 형식과 커밋 메시지 규칙은 `commit` 이 정본이다 — 여기에 옮겨 적은 사본을 믿지 마라
- 테스트·타입·린트를 돌려 수치를 낼 때 → `quality-gate` 를 쓴다. 이 스킬은 **CI 통과 여부만
  확인하고**(`gh pr checks`) 검증 명령을 직접 설계하지 않는다
- 누가 무엇을 맡을지 정하고 워커를 띄울 때 → `team-orchestration` 을 쓴다.
  **다른 에이전트가 도는 중에는 브랜치를 옮기지 않는다** — 브랜치 전환은 작업 트리 전체를 바꾸므로
  같은 트리에서 도는 워커가 사라진 파일을 편집하게 된다
- `.curvez/profile.json` 이 아직 없을 때 → `bootstrap` 을 먼저 쓴다. 브랜치 이름을 추측하지 마라
- 핸드오프 JSON 에 커밋 해시·PR URL 을 적을 때 → `agent-contract` 가 그릇을 정한다

## 0단계 — 브랜치 이름을 프로파일에서 읽는다

**아래 절차의 모든 브랜치 이름은 여기서 나온 변수다.** 절차를 실행하기 전에 반드시 먼저 돌린다.

```bash
set -o pipefail

P=.curvez/profile.json
[ -f "$P" ] || { echo "BLOCKED: $P 없음. bootstrap 을 먼저 돌린다"; exit 1; }
node -e "JSON.parse(require('fs').readFileSync('$P','utf8'))" \
  || { echo "BLOCKED: profile.json 파싱 실패"; exit 1; }

pf() { node -p "(JSON.parse(require('fs').readFileSync('$P','utf8'))$1)||''"; }
BASE=$(pf "?.git?.baseBranch")
RELEASE=$(pf "?.git?.releaseBranch")
STRATEGY=$(pf "?.git?.mergeStrategy")
PROTECTED=$(pf "?.git?.protectedBranches?.join(' ')")
# 머지 권한. 키가 없으면 [releaseBranch] 로 간주한다 (아래 "머지 권한은 humanMergeTargets 가 정한다")
HUMAN=$(node -p "(()=>{const g=JSON.parse(require('fs').readFileSync('$P','utf8')).git??{};return (g.humanMergeTargets ?? [g.releaseBranch]).filter(Boolean).join(' ')})()")

if [ -z "$BASE" ] || [ -z "$RELEASE" ]; then
  echo "BLOCKED: profile.json 에 git.baseBranch / git.releaseBranch 가 없다. 추측하지 않는다"
  exit 1
fi

if [ "$BASE" = "$RELEASE" ]; then TIER=1; else TIER=2; fi
echo "tier=$TIER base=$BASE release=$RELEASE strategy=$STRATEGY protected=[$PROTECTED] human=[$HUMAN]"
```

**`git` 키가 없으면 `status: blocked` 다. 브랜치 이름을 추측하지 마라.**
**이유:** 잘못 짚은 브랜치에서 딴 작업 브랜치는 남의 미배포 변경을 끌고 들어가거나, 배포된 것 위에
쌓인다. 둘 다 발견 시점이 PR 을 여는 순간이라 이미 커밋이 여러 개다.

### 1단인가 2단인가 — 판정과 차이

**`baseBranch === releaseBranch` 면 1단이다.** 위 스크립트의 `TIER` 가 그 판정이다.

|                       | 1단 (`TIER=1`)                             | 2단 (`TIER=2`)                            |
| --------------------- | ------------------------------------------ | ----------------------------------------- |
| 예                    | `main ← 작업` (GitHub Flow)                | `main ← release ← 작업`                   |
| 작업 브랜치를 따는 곳 | `$BASE` (= `$RELEASE`)                     | `$BASE`                                   |
| PR 타겟               | `$BASE` 하나뿐                             | `$BASE` (릴리스·hotfix 는 `$RELEASE`)     |
| 릴리스 PR             | **없다.** 작업 PR 머지가 곧 릴리스다       | `$BASE → $RELEASE` PR 이 따로 있다        |
| back-merge            | **없다.** 갈라질 브랜치가 없다             | 릴리스 후 `$BASE` 를 `$RELEASE` 로 맞춘다 |
| `hotfix/` 를 따는 곳  | `$RELEASE` (= `$BASE`, 일반 브랜치와 같다) | `$RELEASE`. 일반 작업과 출발점이 다르다   |
| 작업 PR 머지 권한     | `humanMergeTargets` 가 정한다 (아래)       | `humanMergeTargets` 가 정한다 (아래)      |

### 머지 권한은 `humanMergeTargets` 가 정한다

1단/2단 판정으로 머지 권한을 추론하지 마라. **PR 타겟이 프로파일의
`git.humanMergeTargets` 에 있으면 사람이 누르고, 없으면 요청받았을 때 실행해도 된다.**

`$HUMAN` 은 0단계에서 읽어 둔 값이다. **키가 없으면 `[$RELEASE]` 로 간주한다** — 없는 것을
"비었다" 로 읽으면 배포 브랜치 머지가 열린다.

```bash
# PR 타겟이 $HUMAN 에 포함되면 머지하지 않고 URL 을 보고한다
TARGET=$(gh pr view "$PR" --json baseRefName -q .baseRefName)
case " $HUMAN " in *" $TARGET "*) echo "사람이 누른다: $TARGET" ;; *) echo "요청받으면 실행: $TARGET" ;; esac
```

**이유:** `main` 으로 가는 머지가 곧 배포인지는 그 프로젝트의 CD 설정에 달렸고 curvez 는 알 수 없다.
1단 구조라고 무조건 사람이 눌러야 하는 것도, 2단이라고 `$BASE` 머지가 항상 안전한 것도 아니다.
추측하지 않고 프로파일에서 읽는다 — `paths` 와 `commands` 를 다루는 방식과 같다.

`bootstrap` 이 넣는 기본값은 `[releaseBranch]` 다. 1단 구조에서는 그것이 곧 모든 PR 이므로
**기본 상태에서는 에이전트가 머지하지 않는다.** 그 프로젝트에서 `$RELEASE` 머지가 배포가
아니라면 사용자가 `humanMergeTargets` 를 비워 열어 준다. 안전한 쪽을 기본으로 두고 명시적으로
여는 구조다. **배열을 고치는 것은 사용자의 결정이다 — 에이전트는 읽기만 한다.**

## 절대 규칙

1. **작업 브랜치는 `$BASE` 에서만 딴다.** `hotfix/` 만 `$RELEASE` 에서 딴다
2. **작업 브랜치에서 다시 분기하지 않는다**
3. **`protectedBranches` 에 직접 커밋하지 않는다.** 전부 PR 을 거친다
4. **PR 타겟은 `$BASE` 다.** 릴리스·hotfix 만 `$RELEASE` 다
5. **머지 방식은 `mergeStrategy` 를 따른다.** 그 자리에서 고르지 않는다
6. **PR 타겟이 `humanMergeTargets` 에 있으면 사람이 누른다.** 없으면 요청받았을 때 실행해도 된다

### 규칙 2의 이유 — 작업 브랜치에서 분기하면 무엇이 깨지는가

앞 브랜치가 **머지되면서 커밋이 재작성되기 때문이다.** `mergeStrategy` 가 `rebase` 든 `squash` 든
머지된 커밋은 `$BASE` 위에서 **다른 해시**가 된다. 그런데 파생 브랜치는 **옛 해시**를 조상으로
들고 있다. 그래서 파생 브랜치의 PR 은 이미 머지된 변경을 "새 변경" 으로 다시 보여주고,
리뷰어는 같은 diff 를 두 번 읽는다. rebase 로 정리하려 하면 재작성된 쪽과 원본 쪽이 같은 파일의
같은 줄에서 충돌하며, 그 충돌은 앞 브랜치의 커밋 수만큼 반복된다.

`merge` 전략이라 해시가 보존되는 경우에도 남는 문제가 있다. 파생 브랜치의 PR 은 앞 브랜치가
머지되기 전까지 **앞 작업의 커밋을 전부 포함한 채** 열린다. 리뷰 범위가 부풀고, 앞 작업이
반려되면 파생 브랜치도 함께 막힌다. 대안은 "2. 앞 작업의 코드가 필요할 때" 에 있다.

## 머지 권한 — 되돌리기 비용의 비대칭

**타겟이 `$HUMAN`(= `humanMergeTargets`)에 있는지로 갈린다. 누가 요청했는지로 갈리지 않는다.**

| PR                                                 | 누가 머지하는가                                 | 기본 프로파일에서                        |
| -------------------------------------------------- | ----------------------------------------------- | ---------------------------------------- |
| 작업 브랜치 → `$BASE`, `$BASE` 가 `$HUMAN` 에 없다 | **요청받으면 실행한다**                         | 2단 구조가 여기 온다                     |
| 작업 브랜치 → `$BASE`, `$BASE` 가 `$HUMAN` 에 있다 | 사람이 한다. PR URL 을 보고하고 멈춘다          | 1단 구조(`$BASE = $RELEASE`)가 여기 온다 |
| `$BASE` → `$RELEASE` (릴리스 PR)                   | 사람이 한다                                     | `$RELEASE` 는 기본값에 들어 있다         |
| `hotfix/` → `$RELEASE`                             | 사람이 한다                                     | 위와 같다                                |
| back-merge (`$BASE` 를 `$RELEASE` 로 맞추기)       | 사람이 한다. PR 이 아니라 포인터 이동이다 (5절) | 가드가 `reset --hard` 를 막는다          |

**기본값이 `[$RELEASE]` 인 근거는 되돌리기 비용의 비대칭이다.** `$RELEASE` 가 아닌 곳으로 가는
머지는 잘못돼도 revert PR 한 번으로 걷어낸다 — 아무것도 배포되지 않았고 이력은 그대로 앞으로만
간다. 반대로 `$RELEASE` 로 가는 머지는 **배포된 것을 건드리고**, 되돌리려면 배포 롤백과 브랜치
포인터 강제 이동이 따라온다. 포인터 강제 이동은 그 사이에 누가 무엇을 땄는지에 따라 남의 커밋을
지울 수 있다.

**그 비대칭이 실제로 어디에 걸리는지는 프로젝트가 정한다.** 그래서 판정은 이 표가 아니라
`humanMergeTargets` 를 읽어서 한다 — 표는 기본 프로파일에서 그 배열이 어떤 결과를 내는지를
보여주는 것이다.

### `$HUMAN` 에 없는 타겟의 작업 PR 을 머지할 때

넷을 **모두** 만족해야 한다.

1. 타겟이 `$HUMAN` 에 없다 (`gh pr view <번호> --json baseRefName` 로 읽어 대조한다)
2. **CI 가 통과했다** — `gh pr checks <번호>` 로 확인한 뒤에 누른다
3. `mergeStrategy` 에 맞는 플래그를 쓴다 (아래 표)
4. **사용자가 그 작업에서 머지까지 요청했다**

| `mergeStrategy` | `gh pr merge` 플래그 |
| --------------- | -------------------- |
| `rebase`        | `--rebase`           |
| `squash`        | `--squash`           |
| `merge`         | `--merge`            |

```bash
case "$STRATEGY" in
  rebase) MERGE_FLAG=--rebase ;;
  squash) MERGE_FLAG=--squash ;;
  merge)  MERGE_FLAG=--merge ;;
  *) echo "BLOCKED: mergeStrategy 값을 모르겠다: [$STRATEGY]"; exit 1 ;;
esac

TARGET=$(gh pr view "$PR" --json baseRefName -q .baseRefName)
case " $HUMAN " in
  *" $TARGET "*) echo "STOP: $TARGET 는 humanMergeTargets 다. PR URL 을 보고하고 멈춘다"; exit 0 ;;
esac
gh pr checks "$PR"                                    # 통과를 확인하고
gh pr merge "$PR" "$MERGE_FLAG" --delete-branch
```

**4번이 없으면 실행하지 않는다.** "PR 만들어줘" 라고 한 사람에게 머지까지 해 주면 요청하지 않은
범위로 넘어간다. **요청받았을 때 해도 된다**는 것이지 알아서 하라는 것이 아니다.

| 사용자가 이렇게 말하면 | 어디까지                             |
| ---------------------- | ------------------------------------ |
| "브랜치 따줘"          | 브랜치 생성까지                      |
| "PR 만들어줘"          | PR 생성까지                          |
| "머지까지 해줘"        | 머지 (타겟이 `$HUMAN` 에 없는 PR 만) |

머지한 뒤에도 PR URL 과 CI 결과를 보고한다. 무엇이 통합됐는지는 사용자가 알아야 한다.

## 훅이 막는 것 — 이력을 지우는 조작은 사용자가 실행한다

`plugins/curvez/hooks/guard-bash.mjs` 가 **PreToolUse 에서 exit 2 로 차단한다.** 아래 명령은
**에이전트가 실행할 수 없다.**

| 차단되는 것                                                       | 이 스킬에서 걸리는 자리              |
| ----------------------------------------------------------------- | ------------------------------------ |
| `git push --force` · `git push -f`                                | 5절 back-merge                       |
| `git push --delete origin <브랜치>` · `git push origin :<브랜치>` | 브랜치 정리                          |
| `--force` 가 붙은 git 명령 (`--force-with-lease` 는 통과)         | 5절                                  |
| `git reset --hard`                                                | 5절 back-merge                       |
| 보호 브랜치(`main` 등)를 대상으로 하는 `git branch -D` · `-d`     | 로컬 브랜치 정리                     |
| `git clean -f` · `git checkout .` · `git restore .`               | 작업 트리 되돌리기                   |
| `git rebase` 로서 명령에 `main` 이 섞인 것                        | 작업 브랜치를 최신 기반 위로 올릴 때 |

**평범한 `git push` 는 막히지 않는다 — 에이전트가 직접 실행한다.** 원격에 커밋을 얹는 것은
append 라 revert 커밋 하나로 되돌린다. 가드가 막는 것은 원격에 **있던** 이력을 지우는
조작뿐이다.

**로컬 브랜치 삭제도 막히지 않는다.** `git branch -D feature/x` 는 원격에 닿지 않고,
잘못 지워도 reflog 로 되살릴 수 있다 (아래 "4-1. 머지된 로컬 브랜치 정리"). 걸리는 것은
`main`·`master`·`release`·`develop`·`production` 을 대상으로 했을 때뿐이다.

**막히면 명령을 제시하고 사용자에게 실행을 요청한다.** 아래 형식으로 낸다.

```
아래 명령은 가드가 막는다. 직접 실행해 달라.
git diff 가 비어 있음을 위에서 확인했다.

  git switch <BASE> && git reset --hard origin/<RELEASE>

끝나면 알려 달라. 이어서 다음 단계로 넘어간다.
```

**가드를 우회하지 마라.** 변수 치환·따옴표 쪼개기·`sh -c` 감싸기·별칭·스크립트 파일로 우회하는
어떤 방법도 쓰지 않는다. **이유:** 가드가 막는 것은 전부 **원격에 반영되거나 복구 불가능한**
조작이다. 우회에 성공하면 가드는 다음에도 못 막고, 그 시점부터 아무도 이 저장소에 안전장치가
없다는 사실을 모른다. 가드의 실패는 경보가 아니라 침묵으로 나타난다.

**`gh pr create` · `gh pr checks` · `gh pr merge` 도 막히지 않는다.** 즉 push 부터 PR 생성까지
한 실행 안에서 이어진다. 다만 순서는 지킨다 — **push 가 끝난 뒤에** PR 을 연다. push 되지 않은
브랜치로 `gh pr create` 를 하면 원격에 브랜치가 없어 실패한다.

## 1. 새 작업을 시작할 때

**먼저 지금 어디에 있는지 확인한다.**

```bash
git status -sb
git branch --show-current
```

작업 브랜치 위에 있다면 **거기서 새 브랜치를 따지 않는다** (규칙 2). `$BASE` 로 옮겨서 딴다.
커밋되지 않은 변경이 있으면 브랜치를 옮기기 전에 처리한다 — `git status` 가 비어야 옮긴다.

```bash
git switch "$BASE"
git pull --ff-only              # 최신으로 맞춘다
git switch -c feature/attendance-calendar
```

**`git pull --ff-only` 를 빠뜨리지 않는다.** 뒤처진 기반에서 작업하면 머지할 때 충돌이 쌓이고,
그 충돌은 내가 건드리지 않은 파일에서 난다. **인자 없는 `git pull` 을 쓰지 마라.**
**이유:** 기반이 갈라져 있으면 merge commit 이 조용히 생겨, rebase 전략에서 PR 이 열리지 않는다.

### 이름 짓기

```
<타입>/<무엇을-하는지>
```

| 타입        | 언제                                         |
| ----------- | -------------------------------------------- |
| `feature/`  | 새 기능                                      |
| `fix/`      | 버그 수정                                    |
| `refactor/` | 동작을 바꾸지 않는 구조 변경                 |
| `docs/`     | 문서만                                       |
| `test/`     | 테스트                                       |
| `chore/`    | 빌드·설정·의존성                             |
| `hotfix/`   | 배포된 것의 긴급 수정 (`$RELEASE` 에서 딴다) |

**영문 소문자·숫자·하이픈만 쓴다. 한글·공백·대문자를 쓰지 않는다.**
**이유:** 브랜치 이름은 CI 잡 이름·아티팩트 경로·URL 로 흘러간다. 한글과 공백은 그 경로에서
인코딩되어 로그에서 어느 브랜치인지 읽을 수 없게 되고, 대문자는 대소문자를 구분하지 않는
파일시스템에서 다른 브랜치와 충돌한다.

```
✓ feature/attendance-calendar
✓ fix/login-token-race
✗ feature/출퇴근-달력
✗ Feature/AttendanceCalendar
✗ calendar                     타입이 없다
```

## 2. 앞 작업의 코드가 필요할 때

**분기하지 않는다** (규칙 2). 셋 중 하나를 고른다.

1. **앞 작업을 먼저 머지시키고, `$BASE` 를 당겨 새로 딴다.** 가장 좋다. 앞 작업이 리뷰 대기 중이면
   그것부터 끝낸다
2. **두 작업을 하나의 브랜치로 합쳐서 진행한다.** 앞 작업이 아직 PR 도 안 열렸을 때 쓴다.
   PR 하나가 커지지만 히스토리는 갈라지지 않는다
3. **앞 작업 없이 되는 부분만 먼저 만든다.** 정말 급할 때. 나머지는 다음 브랜치로 넘긴다

**어느 것도 못 고르겠으면 사용자에게 묻는다.** 셋 다 트레이드오프가 있고, 무엇을 포기할지는
일정 판단이다. 임의로 파생 브랜치를 만들어 진행하지 마라 — 규칙 2가 깨지면 되돌리는 비용이
그 시점부터 커밋 수에 비례해 커진다.

## 3. 작업 중

커밋은 `commit` 스킬을 따른다. 이 스킬은 커밋 메시지 규칙을 정하지 않는다.

작업 중 `$BASE` 가 앞서 나가 최신으로 맞춰야 하면, **`git rebase` 는 가드에 걸릴 수 있다**
(명령에 `main` 이 섞이면 차단된다). 명령을 제시하고 사용자에게 실행을 요청하거나,
GitHub PR 화면의 `Update branch` 를 쓰도록 안내한다.

## 4. PR 을 올릴 때

```bash
# 1) 올라가는 커밋을 먼저 읽어 사용자에게 한 줄로 알린 뒤 push 한다.
git log --oneline @{u}.. 2>/dev/null || git log --oneline -5
git push -u origin "$(git branch --show-current)"

# 2) push 가 끝난 것을 확인한 뒤 PR 을 연다.
gh pr create --base "$BASE" --title "<제목>" --body "<본문>"

# 3) 생성된 PR 번호를 $PR 에 넣고 CI 를 확인한다.
gh pr checks "$PR"
```

**`--base "$BASE"` 를 빠뜨리지 않는다.**
**이유:** `gh pr create` 의 `--base` 기본값은 **저장소의 기본 브랜치**다. 2단 구조에서 기본
브랜치는 대개 `$RELEASE` 이므로, 생략하면 작업 브랜치가 배포 브랜치로 바로 열린다. 그 PR 은
리뷰 범위도 머지 권한도 규칙과 어긋나며, 실수를 알아채는 시점은 대개 리뷰어가 지적할 때다.

**`--base` 값은 `$BASE` 변수를 그대로 쓴다. 브랜치 이름을 손으로 타이핑하지 마라.**

PR 본문 형식(무엇을·왜·검증, 서명 줄)은 `commit` 스킬이 정본이다. 검증 수치는 `quality-gate` 가
낸 값을 그대로 옮긴다 — 돌리지 않은 것을 적지 않는다.

머지까지 요청받았으면 CI 를 확인하고 이어서 머지한다 (위 "머지 권한").
요청받지 않았으면 **PR URL 을 보고하고 여기서 멈춘다.**

## 4-1. 머지된 로컬 브랜치 정리

**사용자가 정리를 요청했을 때만 한다.** 요청 없이 브랜치를 지우지 않는다.

지우기 전에 **무엇을 지울지 먼저 읽어 사용자에게 목록으로 보여 준다.** 원격에서 이미 사라진
브랜치의 로컬 사본이 정리 대상이다.

```bash
# 1) 원격에서 사라진 추적 정보를 먼저 떨어낸다 (로컬 브랜치는 건드리지 않는다).
git fetch --prune

# 2) $BASE 에 머지가 끝난 로컬 브랜치를 뽑는다. 보호 브랜치와 현재 브랜치는 제외한다.
git branch --merged "$BASE" --format='%(refname:short)' \
  | grep -Ev '^(main|master|release|develop|production)$' \
  | grep -v "^$(git branch --show-current)$"
```

목록을 보고한 뒤 지운다. **`-d` 를 먼저 쓴다** — 머지되지 않은 브랜치는 여기서 실패하고,
그 실패가 "이건 아직 안 머지됐다"는 신호다.

```bash
git branch -d <브랜치> [<브랜치> ...]
```

`-d` 가 거부한 브랜치를 그래도 지워야 하면(스쿼시 머지된 브랜치가 대표적이다) **왜 안전한지를
먼저 확인해 보고한 뒤** `-D` 를 쓴다.

```bash
# 스쿼시 머지 확인 — 점 두 개다. 비어 있으면 브랜치의 내용은 이미 $BASE 에 들어가 있다.
#
# 점 세 개(`...`)를 쓰면 안 된다. 그쪽은 merge-base 와 브랜치를 비교하므로 스쿼시 머지된
# 브랜치에서도 원래 변경이 그대로 나온다 — 실측에서 두 개는 0줄, 세 개는 9줄이었다.
# 대신 `$BASE` 에 다른 작업이 들어와 있으면 두 개도 비어 있지 않다. 그때는 출력에 이 브랜치의
# 변경이 섞여 있는지 눈으로 확인한다.
git diff --stat "$BASE"..<브랜치>
git branch -D <브랜치>
```

**지운 뒤 되살리는 법을 안내한다.** `git branch -D` 는 지운 SHA 를 출력한다.
`git branch <이름> <SHA>` 로 복구하고, SHA 를 놓쳤으면 `git reflog` 에 남아 있다.

**보호 브랜치는 가드가 막는다.** `git branch -D main` 은 exit 2 로 차단된다. 로컬 `main` 이
꼬였으면 지우지 말고 `git switch main && git reset --hard origin/main` 을 **사용자에게 요청한다**
(이 명령도 가드가 막는다).

원격 브랜치 삭제(`git push --delete`)는 이 절에 없다. 가드가 막으며, PR 머지 시 GitHub 이
자동으로 지우거나 사용자가 직접 지운다.

## 5. 릴리스 — 2단 구조일 때만

**`TIER=1` 이면 이 절 전체를 건너뛴다.** 1단에는 릴리스 PR 도 back-merge 도 없다.

```bash
[ "$TIER" = 2 ] || { echo "1단 구조다. 릴리스 절차 없음. 작업 PR 머지가 곧 릴리스다"; exit 0; }

gh pr create --base "$RELEASE" --head "$BASE" --title "<릴리스 제목>"
```

**릴리스 PR 은 머지하지 않는다.** 타겟이 `$RELEASE` 이고 그것은 `$HUMAN` 의 기본값이다 —
배포 시점 판단이라 사람이 누른다. **PR URL 을 보고하고 멈춘다.**

### back-merge — 사람이 실행한다

`mergeStrategy` 가 `rebase` 또는 `squash` 면 릴리스 머지가 커밋을 재작성하므로, 머지 뒤
`$BASE` 와 `$RELEASE` 는 **내용이 같은데 해시가 다른** 상태가 된다. 그대로 두면 다음 릴리스 PR 이
이미 배포된 변경을 다시 보여준다. **포인터를 옮겨서** 맞춘다.

```bash
# 반드시 먼저 확인한다 — 비어 있어야 안전하다
git fetch origin
git diff --name-only "origin/$RELEASE" "origin/$BASE"
```

**`git diff` 출력이 비어 있지 않으면 실행하지 않는다.** 비어 있지 않다는 것은 `$BASE` 에
릴리스에 담기지 않은 변경이 남아 있다는 뜻이고, 포인터를 옮기면 그것이 사라진다.

diff 가 비었으면 아래를 **사용자에게 제시하고 직접 실행을 요청한다.** `git reset --hard` 는
가드가 막고, 강제 갱신은 남의 커밋을 덮어쓸 수 있어 사람의 판단이 필요하다 — 두 줄 다 에이전트가
실행하지 않는다.

```
아래 두 줄은 에이전트가 실행하지 않는다. 확인하고 직접 실행해 달라.
git diff 가 비어 있음을 위에서 확인했다.

  git switch <BASE> && git reset --hard origin/<RELEASE>
  git push --force-with-lease
```

**back-merge 를 PR 로 하지 마라.**
**이유:** rebase·squash 머지가 커밋을 재작성했으므로, PR 로 되돌려 보내면 같은 내용이 서로 다른
해시로 양쪽에 남는다. 두 브랜치는 영원히 "N commits ahead, M commits behind" 로 갈라지고,
그 뒤 모든 릴리스 PR 이 이미 배포된 변경을 함께 보여주게 된다.

`mergeStrategy` 가 `merge` 면 해시가 보존되므로 back-merge 자체가 필요 없을 수 있다.
`git diff --name-only` 가 비어 있으면 아무것도 하지 않는다.

## 6. 긴급 수정 (hotfix)

**`hotfix/` 만 `$RELEASE` 에서 딴다.**
**이유:** `$BASE` 에서 따면 아직 배포되지 않은 남의 변경을 함께 끌고 들어간다. 긴급 수정은
검증 범위를 최소로 유지해야 빨리 나갈 수 있는데, 미배포 변경이 섞이면 그 전체가 검증 대상이 된다.

```bash
git switch "$RELEASE"
git pull --ff-only
git switch -c hotfix/payslip-crash
# 작업 후 — push 하고 PR 을 연다
git push -u origin hotfix/payslip-crash
gh pr create --base "$RELEASE" --title "<제목>"
```

**`hotfix/` PR 은 사람이 머지한다.** 타겟이 `$RELEASE` 다.

**2단 구조에서는 머지 후 `$BASE` 에도 그 수정이 들어가야 한다.** 안 그러면 다음 릴리스가
고쳐진 것을 되돌린다. 위 "back-merge" 절차를 따르거나, `$BASE` 로 가는 별도 PR 을 연다.
**어느 쪽인지는 `$BASE` 에 미배포 변경이 있는지로 갈린다** — 있으면 별도 PR, 없으면 포인터 이동이다.

1단 구조에서는 `hotfix/` 가 일반 작업 브랜치와 출발점이 같다. 타입 접두어만 다르다.

## 하지 않는 것

- **작업 브랜치에서 분기하기** — 규칙 1·2를 어기는 가장 흔한 실수다. 이유는 "규칙 2의 이유"
- **브랜치 이름을 문자열로 타이핑하기** — `$BASE` · `$RELEASE` 를 쓴다.
  **이유:** 다른 구조의 프로젝트에서 그 브랜치가 없어 절차가 통째로 실패한다
- **`--base` 없이 `gh pr create`** — 저장소 기본 브랜치로 열린다 (4절)
- **`protectedBranches` 에 직접 push** — 전부 PR 을 거친다
- **가드 우회** — 강제 push·원격 브랜치 삭제·`reset --hard` 를 감싸거나 쪼개서 실행하지 마라.
  **이유:** 우회가 성공하면 안전장치가 없다는 사실을 아무도 모르게 된다
- **`$HUMAN` 에 있는 타겟으로 가는 PR 머지** — 기본 프로파일에서는 릴리스·hotfix·1단의 작업 PR 이
  전부 여기 해당한다. **1단/2단으로 추론하지 말고 배열을 읽어라**
- **요청받지 않은 머지** — 타겟이 `$HUMAN` 에 없어도 머지까지 요청받지 않았으면 PR 에서 멈춘다
- **CI 를 확인하지 않은 머지** — `gh pr checks` 가 통과를 보여준 뒤에 누른다
- **`git pull` 없이 브랜치 따기** — 뒤처진 기반의 충돌은 내가 안 건드린 파일에서 난다
- **인자 없는 `git pull`** — `--ff-only` 를 붙인다
- **`git` 키가 없는데 브랜치 이름 추측하기** — `blocked` 로 보고한다
- **`profile.json` 에 없는 브랜치를 새로 만들기** — `release` 를 임의로 만들지 마라
- **다른 에이전트가 도는 중에 브랜치 전환** — 작업 트리가 통째로 바뀌어 워커가 편집 중인 파일이 사라진다
- **요청하지 않은 브랜치 생성·머지·삭제** — 브랜치 구조 변경은 사용자에게 확인받는다

## 완료 기준

- [ ] 0단계를 돌려 `$BASE` · `$RELEASE` · `$STRATEGY` 를 프로파일에서 읽었다.
      **하드코딩한 브랜치 이름 0건**
- [ ] `TIER` 판정을 출력으로 확인했고, 1단이면 릴리스·back-merge 절차를 실행하지 않았다
- [ ] 브랜치를 만들었다면 출발점이 `$BASE`(hotfix 는 `$RELEASE`)이고, 그 전에 `pull --ff-only` 를 했다
- [ ] 브랜치 이름이 `<타입>/<설명>` 이고 영문 소문자·숫자·하이픈만이다
- [ ] PR 을 열었다면 `gh pr view <번호> --json baseRefName` 이 의도한 타겟과 같다
- [ ] 가드에 막힌 명령은 **사용자에게 제시했고**, 우회를 시도한 흔적이 없다
- [ ] 머지했다면 네 조건(타겟·CI·전략 플래그·사용자 요청)이 전부 충족됐다
- [ ] `$RELEASE` 로 가는 PR 은 머지하지 않고 URL 을 보고하고 멈췄다
- [ ] 핸드오프의 `artifacts` 에 **실제로 만들어진** 브랜치 이름·PR URL·커밋 해시를 적었다

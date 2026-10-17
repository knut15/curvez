# curvez

Next.js 프로젝트에 **아키텍처 경계와 검증 규칙을 거는 Claude Code 플러그인**이다.

에이전트 팀을 짜고 일을 나눠 맡기는 오케스트레이션은 하지 않는다. 그 일은 oh-my-claudecode(OMC)나
superpowers 같은 플러그인에 맡긴다. curvez 는 그 위에 얹혀, 누가 코드를 쓰든 같은 규칙으로 검사되게 한다.

- 레이어 경계를 **기계가 검사할 수 있는 금지 import 표**로 확정한다
- typecheck·lint·test·build 를 프로젝트에 적힌 명령으로 **실제로 돌려 수치로** 남긴다
- 서브에이전트가 결과를 넘길 때 **검증 결과 없이는 "완료"를 쓸 수 없게** 하는 계약을 둔다
- 강제 push 같은 파괴적 명령과, 사용자가 정한 금지어를 **쓰는 시점에 막는다**

---

## 설치

curvez 는 Claude Code **플러그인 마켓플레이스** 형태로 배포된다.
저장소 자체가 마켓플레이스이고, 그 안의 `plugins/curvez` 가 플러그인이다.

```
/plugin marketplace add knut15/curvez
/plugin install curvez@curvez
```

curvez 자체를 고치면서 쓸 때는 GitHub 대신 로컬 체크아웃을 등록한다.
원격을 등록하면 캐시된 사본이 붙으므로 방금 고친 파일이 반영되지 않는다.

```
/plugin marketplace add ~/Workspace/curvez
```

설치하면 스킬이 `curvez:` 네임스페이스로 붙는다. `/curvez:<스킬명>` 으로 직접 부를 수도 있고,
스킬 `description` 의 트리거 문구에 걸려 자동으로 호출되기도 한다.

### 업데이트

**계정당 한 번이면 그 계정의 모든 프로젝트에 동시에 적용된다.** user scope 설치라 프로젝트마다
반복하지 않는다. 다만 **순서가 둘이고, 1단계를 건너뛰면 아무 일도 일어나지 않는다.**

#### 1. 마켓플레이스를 먼저 갱신한다

```
/plugin marketplace update curvez
```

curvez 를 원격(`knut15/curvez`)으로 등록해 쓰면, 로컬에 **마켓플레이스 클론**이 하나 생긴다
(`~/.claude/plugins/marketplaces/curvez`). 플러그인 업데이트는 원격을 직접 보지 않고
**이 클론을 보고 버전을 판단한다.** 클론이 옛 커밋에 멈춰 있으면 새 버전이 있다는 사실 자체를
모르므로, 2단계를 아무리 눌러도 "이미 최신" 으로 끝난다.

슬래시 커맨드가 안 먹으면 클론은 그냥 git 저장소이므로 직접 당겨도 된다.

```bash
git -C ~/.claude/plugins/marketplaces/curvez pull --ff-only
grep '"version"' ~/.claude/plugins/marketplaces/curvez/plugins/curvez/.claude-plugin/plugin.json
```

두 번째 줄이 올리려는 버전을 보여주면 1단계가 끝난 것이다.

#### 2. 플러그인을 업데이트한다

```
/plugin
```

**`curvez@curvez` 는 discover 목록에 없다.** discover 는 **아직 설치하지 않은** 플러그인만
보여준다. 이미 설치돼 있으므로 **설치된 플러그인(manage/installed) 쪽**에서 골라 업데이트한다.

#### 3. 확인하고 재시작한다

| 확인할 것 | 되어야 하는 상태 |
|---|---|
| `~/.claude/plugins/cache/curvez/curvez/` | 새 버전 디렉터리가 생겼다 |
| `~/.claude/plugins/installed_plugins.json` 의 `curvez@curvez` | `version` 과 `gitCommitSha` 가 올라갔다 |

```bash
node "$CURVEZ_ROOT/scripts/doctor.mjs"
```

exit 0 이면 된다. **업데이트 뒤 Claude Code 를 재시작한다.** 돌고 있는 세션은 옛 버전을 물고 있다.

#### 반영이 안 될 때

| 증상 | 원인 | 조치 |
|---|---|---|
| discover 에 curvez 가 없다 | 정상이다. discover 는 미설치 플러그인만 보여준다 | 설치된 플러그인 쪽에서 찾는다 |
| 업데이트를 눌러도 버전이 그대로다 | 마켓플레이스 클론이 옛 커밋이다 | 1단계를 실행한다 |
| 클론을 갱신해도 그대로다 | 고친 것이 GitHub 기본 브랜치에 머지되지 않았다 | 로컬 커밋만으로는 부족하다. push·머지까지 한다 |
| 버전은 올랐는데 동작이 그대로다 | 세션이 옛 버전을 물고 있다 | Claude Code 를 재시작한다 |

**업데이트 뒤 프로젝트에서 할 일**은 [마이그레이션 노트](migration.md)가 버전별로 정리한다.

---

## 무엇이 들어 있는가

| 종류 | 위치 | 무엇인가 |
|---|---|---|
| 스킬 4종 | `skills/*/SKILL.md` | `bootstrap` `architecture-setup` `quality-gate` `agent-contract`. 순서대로 따라 하는 절차서 |
| 실행기 | `scripts/*.mjs` | `bootstrap.mjs` (스택 감지·프로파일·스캐폴드), `quality-gate.mjs` (게이트 실행·수치 출력), `validate-handoff.mjs` (핸드오프 검증), `doctor.mjs` (플러그인 자체 점검). node ESM, 외부 의존성 0 |
| 훅 | `hooks/hooks.json` | `guard-bash` `guard-forbidden-words` `check-handoff` `notify-update` |
| 프리셋 | `presets/` | 아키텍처 `ddd` 1종, 스택 2종 (`nextjs` `monorepo`) |

### 훅이 하는 일

| 훅 | 언제 | 무엇을 |
|---|---|---|
| `guard-bash` | Bash 실행 전 | 강제 push, 원격 브랜치 삭제처럼 원격 이력을 지우는 명령과 npm·yarn 을 막는다 |
| `guard-forbidden-words` | Write·Edit 전 | 설정 파일에 적은 금지어를 단독으로 쓴 곳을 막는다. 아래 "금지어 설정" 참고 |
| `check-handoff` | 턴이 끝날 때 | `.curvez/handoff/` 가 있으면 모든 핸드오프를 검증하고, 어긋나면 경고한다. 막지는 않는다 |
| `notify-update` | 세션 시작 | 플러그인 버전이 바뀐 뒤 그 프로젝트를 처음 열 때 한 번 알린다. `.curvez/profile.json` 이 없는 저장소에서는 아무것도 하지 않는다 |

---

## 첫 사용

설치 직후 프로젝트에는 아직 `.curvez/` 가 없다. 순서는 하나다.

1. **`curvez:bootstrap`** — 스택을 감지하고, 못 채운 값만 물어 `.curvez/profile.json` 을 만들고
   `.curvez/` 를 스캐폴드한다
2. **`curvez:architecture-setup`** — DDD 프리셋을 기준으로 짧은 인터뷰를 거쳐 `.curvez/architecture.md` 를
   확정한다. 이 파일의 `## 금지 import` 표가 경계 검사의 유일한 근거다

그 뒤에는 평소대로 작업한다. 코드를 고쳤으면 `curvez:quality-gate` 로 확인하고,
서브에이전트에게 일을 맡길 때는 `curvez:agent-contract` 의 지시 문구를 붙여 결과를 핸드오프로 돌려받는다.

### 프로젝트 상태 디렉터리

```
.curvez/
├─ profile.json       # 스택·소스 경로·품질 게이트 명령. 모든 절차의 전제
├─ architecture.md    # 레이어 경계와 기계 검사 가능한 금지 import 표
├─ handoff/           # 서브에이전트가 남긴 결과 계약
└─ tmp/               # gitignore 대상
```

`.curvez/` 는 **git 커밋 대상**이다(`tmp/` 만 제외). 무엇이 언제 결정됐는지 나중에 되짚을 수 있어야 한다.

### 금지어 설정

`guard-forbidden-words` 는 설정 파일이 없으면 아무것도 막지 않는다. 막고 싶은 낱말을 아래 두 곳 중
하나에 적는다. 둘 다 있으면 합쳐서 쓰고, 같은 낱말이면 프로젝트 쪽 안내문이 우선한다.

| 위치 | 적용 범위 |
|---|---|
| `~/.claude/curvez/forbidden-words.json` | 이 계정의 모든 프로젝트 |
| `<프로젝트>/.curvez/forbidden-words.json` | 그 프로젝트만 |

```json
{
  "words": [
    { "word": "낱말", "hint": "대신 쓸 말 안내" }
  ]
}
```

- `word` 는 한글 낱말만 받는다. 조사를 뗀 형태가 정확히 그 낱말일 때만 막고, 합성어와 고유명사는 통과시킨다
- 그 낱말을 꼭 인용해야 하는 파일(규칙 문서 등)은 본문 어딘가에 `forbidden-words: allow` 를 넣는다
- 설정 파일이 깨져 있으면 조용히 꺼지지 않고 쓰기를 막으면서 어느 파일이 문제인지 알린다

---

## 지금의 빌드 상태

**실제로 실행해서 확인한 현재 상태다.**

| 항목 | 상태 |
|---|---|
| 스킬 4종 | 있음 (`plugins/curvez/skills/`) |
| 실행기 | 있음 — `bootstrap.mjs`, `quality-gate.mjs`, `validate-handoff.mjs`, `doctor.mjs` |
| 프리셋 | 있음 — 아키텍처 `ddd` 1종, 스택 2종 (`nextjs` `monorepo`) |
| 훅 | 있음 — `guard-bash` `guard-forbidden-words` `check-handoff` `notify-update`. `hooks/hooks.json` 으로 등록 |
| 회귀 테스트 | 있음 — `hooks/tests/` 2개, `scripts/tests/` 1개 |

`doctor` 가 이 표의 개수와 "없음" 서술이 실제와 맞는지 기계로 검사한다. 어긋나면 exit 1 이다.

### doctor 가 검사하는 것과 못 하는 것

| 검사 | 무엇을 |
|---|---|
| 플러그인 구조 | 실행기·훅·스키마 파일이 다 있는가 |
| 훅 매니페스트 | `hooks.json` 이 로더가 읽을 구조인가 |
| 문서 동기화 | 문서의 "N종" 개수와 "없음" 서술이 실제와 맞는가 |
| 문서 연결 | 스킬이 이름으로 참조되는가, docs 가 이 README 인덱스에 있는가 |
| 핸드오프 | 프로젝트에서 돌리면 `.curvez/handoff/` 의 모든 파일을 검증한다 |

**못 하는 것:** 내용이 맞는지는 검사하지 않는다. 개수가 맞고 링크가 살아 있어도 문서가 설명하는
절차가 실제와 다를 수 있다. 그건 사람이 읽어야 한다.

새 검사를 만들면 반드시 "지금 상태에서 무엇을 잡는지" 를 먼저 본다. 0건이 나오면 통과가 아니라
**검사가 안 걸린 것을 의심한다.** 이 프로젝트에서 가장 자주 나온 실패다.

---

## 문서 인덱스

이 `docs/` 는 사람이 읽는 문서다. 설계 근거와 배경, 실패 사례를 담는다.
규칙의 **수치**는 `scripts/lib/spec.mjs`, **절차**는 `skills/*/SKILL.md` 가 정본이다.
docs 는 그 값을 옮겨 적지 않고 경로로 가리킨다.

| 알고 싶은 것 | 문서 |
|---|---|
| 왜 DDD 인가, 규모가 안 맞으면 어떻게 조정하는가 | [architecture-presets.md](architecture-presets.md) |
| 핸드오프에 무엇을 담는가. 상태 전이, 필드 의미, 계약이 깨졌던 실제 사례 | [handoff-contract.md](handoff-contract.md) |
| "완료" 를 선언해도 되는 조건은 무엇인가. 검증을 왜 수치로 요구하는가 | [quality-model.md](quality-model.md) |
| 셸·grep·awk 로 검증 스크립트를 짤 때 조용히 틀리는 지점들 | [shell-pitfalls.md](shell-pitfalls.md) |
| 버전을 올렸을 때 내 프로젝트에서 확인하거나 고쳐야 할 것 | [migration.md](migration.md) |

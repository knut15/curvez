# 핸드오프 필드 상세

`SKILL.md` 본문에서 스키마 요약을 읽은 뒤, 특정 필드를 어떻게 채울지 막혔을 때 이 파일을 읽는다.
정본 스키마는 `scripts/schema/handoff.schema.json` 이다. 이 문서와 스키마가 어긋나면 스키마가 이긴다.

---

## from

작성한 에이전트의 `name` 을 그대로 적는다. 파일명 앞부분과 같아야 한다.

```json
"from": "curvez-architect"
```

사람이 직접 쓰는 핸드오프라면 `user` 를 쓴다. 오케스트레이터가 사용자 요구를 계약으로 옮길 때 쓰인다.

---

## to

이 결과를 읽어야 하는 에이전트 `name` 배열. 최소 1개.

```json
"to": ["curvez-nextjs", "curvez-react-native"]
```

- 다음 담당이 정해지지 않았으면 `["curvez-orchestrator"]` 로 돌려준다
- 여러 에이전트가 병렬로 이 결과를 받으면 전부 나열한다
- 빈 배열은 허용하지 않는다. **이유:** 수신자가 없는 산출물은 아무도 읽지 않고, 다음 단계에서
  같은 작업이 다시 실행된다

---

## status

| 값 | 의미 | 강제 규칙 |
|---|---|---|
| `done` | 범위를 끝냈고 검증했다 | `verification` ≥ 1, `blocked_on` = 0 |
| `partial` | 일부만 끝냈다 | `summary` 에 남은 범위를 적는다 |
| `blocked` | 답 없이는 못 간다 | `blocked_on` ≥ 1 |

### 판정 예시

| 상황 | status | 왜 |
|---|---|---|
| 구현 끝, `pnpm typecheck` 0 errors | `done` | 검증 근거가 있다 |
| 구현 끝, 테스트는 못 돌림 | `partial` | 검증 없는 완료는 `done` 이 아니다 |
| 화면 3개 중 2개 구현 | `partial` | 남은 1개를 `summary` 에 적는다 |
| API 응답 형식을 모름 | `blocked` | 추측하면 나중 비용이 훨씬 크다 |
| 앞 단계 결정에 이의 있음 | `blocked` | 조용히 뒤집지 않는다 |

---

## summary

한 줄. 수신 에이전트가 이것만 읽고도 다음 행동을 정할 수 있어야 한다.

- 좋음: `"DDD 4레이어 확정. domain 은 react·next import 금지. 위반 시 lint 에러."`
- 나쁨: `"아키텍처 작업을 진행했다."` — 무엇이 정해졌는지 없어 다음 행동을 못 정한다

`partial` 이면 남은 범위를 반드시 넣는다.

- `"화면 3개 중 목록·상세 완료. 설정 화면은 디자인 스펙 대기로 미착수."`

---

## artifacts

만들거나 바꾼 파일. 경로는 프로젝트 루트 기준 상대 경로.

```json
"artifacts": [
  { "path": "src/domain/order/order.ts", "kind": "code" },
  { "path": ".curvez/architecture.md", "kind": "decision", "note": "레이어 경계 규칙" }
]
```

### kind 허용값

| kind | 쓰는 곳 |
|---|---|
| `decision` | 아키텍처·규약 확정 문서 |
| `code` | 실행되는 소스 |
| `doc` | 사람이 읽는 문서 |
| `test` | 테스트 코드 |
| `spec` | 요구사항·수용 기준·디자인 스펙 |
| `research` | 조사 브리프 |
| `review` | 리뷰 결과 |
| `retro` | 회고 문서. `doc` 과 구분한다 — 다음 회고가 이전 회고를 찾을 때 프로젝트의 모든 문서를 훑지 않으려면 kind 가 달라야 한다 |
| `commit` | 커밋. `path` 에 `git:<40자 해시>` |
| `pr` | PR·MR. `path` 에 URL 전문 |

`note` 는 선택. 수신 에이전트가 이 파일에서 무엇을 봐야 하는지 한 조각 적을 때 쓴다.

---

## decisions

되돌릴 수 있게 남기는 판단 기록. 세 필드로 구성한다.

```json
{
  "what": "application 레이어를 두지 않고 domain 에 유스케이스를 합쳤다",
  "why": "화면이 12개 이하라 레이어를 더 두면 파일만 늘고 경계는 안 생긴다",
  "reversible_at": ".curvez/architecture.md:레이어 정의"
}
```

- `what` — 무엇을 정했는가. 대안 중 무엇을 버렸는지까지 적으면 더 좋다
- `why` — 근거. **여기가 핵심이다.** 근거가 없으면 나중에 이 결정을 건드려도 되는지 아무도 모른다
- `reversible_at` — 뒤집으려면 어디를 고치는가. `파일:섹션` 또는 `파일:라인`

### 무엇을 decisions 에 남기는가

남긴다:
- 대안이 둘 이상이었고 하나를 고른 것
- 나중에 누군가 "왜 이렇게 했지" 라고 물을 것
- 규약이나 경계를 정한 것

남기지 않는다:
- 관례적 기본값을 그대로 쓴 것 (예: 파일명을 kebab-case 로)
- 코드에 그대로 드러나는 것

**이유:** 전부 남기면 아무도 안 읽는다. 판단이 갈렸던 지점만 남겨야 목록이 신호로 남는다.

---

## blocked_on

추측으로 채우지 않고 남긴 미해결 질문.

```json
"blocked_on": [
  { "question": "주문 취소 가능 기간이 며칠인가", "who": "user" },
  { "question": "목록 화면 페이지네이션이 무한스크롤인가 페이지 방식인가", "who": "curvez-designer" }
]
```

- `who` — 답을 줄 주체. `user` 또는 에이전트 `name`
- 질문은 **답하면 바로 진행 가능한 형태**로 쓴다. "요구사항이 불명확하다" 는 질문이 아니다

### 언제 blocked_on 에 넣는가

- 정보가 없어 진행 불가
- 앞 단계 결정에 이의가 있음
- 두 해석이 가능하고 어느 쪽이냐에 따라 산출물이 완전히 달라짐

두 해석의 결과가 비슷하면 넣지 않는다. 하나를 고르고 `decisions` 에 근거와 `reversible_at` 을 남긴다.
**이유:** 사소한 갈림길마다 멈추면 팀 실행이 사용자 응답 대기로 직렬화된다.

---

## verification

실제로 돌린 명령과 그 결과.

```json
"verification": [
  { "command": "pnpm typecheck", "result": "0 errors", "passed": true },
  { "command": "pnpm test -- order", "result": "12 passed, 0 failed", "passed": true },
  { "command": "pnpm lint", "result": "3 warnings, 0 errors", "passed": true }
]
```

- `command` — 실제로 실행한 명령 그대로. 재현 가능해야 한다
- `result` — 실제 출력에서 판정 가능한 부분. 개수·수치·명시적 상태
- `passed` — 선택. 통과 여부가 출력만으로 애매할 때 붙인다

### 금지 패턴

| 나쁜 예 | 왜 안 되는가 |
|---|---|
| `{ "command": "타입 확인", "result": "통과" }` | 명령이 재현 불가. "통과" 는 판정 근거가 아니다 |
| `{ "command": "pnpm test", "result": "정상 동작" }` | 몇 개가 돌았는지 없어 0개 실행도 "정상" 이 된다 |
| `verification: []` 인데 `status: done` | 검증기가 오류로 잡는다 |

실패한 검증도 적는다. 실패를 숨기고 `done` 하는 것이 계약 위반이다.

```json
{ "command": "pnpm test", "result": "10 passed, 2 failed (order.spec.ts)", "passed": false }
```

이 경우 `status` 는 `partial` 이나 `blocked` 다.

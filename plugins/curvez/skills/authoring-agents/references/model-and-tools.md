# 모델과 도구 권한 선택 기준

`SKILL.md` 절차 2단계에서 `model`·`tools`·`disallowedTools` 를 정할 때 읽는다.

---

## model

| 값 | 쓰는 곳 | 판정 기준 |
|---|---|---|
| `opus` | 설계·리뷰·요구사항 확정·팀 편성 | 되돌리기 비싼 판단을 내린다. 틀리면 뒤의 작업이 전부 무효가 된다 |
| `sonnet` | 구현·조사·QA·문서 작성 | 정답 형태가 정해져 있고 검증 수단이 있다 |
| `haiku` | 기계적 변환·형식 정리 | 판단이 거의 없고 규칙이 전부 명시돼 있다 |
| `inherit` | 세션 모델을 따라야 하는 범용 에이전트 | 특별한 이유가 없고 사용자의 세션 설정을 존중한다 |

### 판정 질문

**이 에이전트가 틀리면 뒤의 작업이 전부 다시인가?**
그렇다면 `opus`. 아니면 `sonnet`.

### curvez 코어 배정

| 에이전트 | model |
|---|---|
| `curvez-orchestrator` | opus |
| `curvez-requirements` | opus |
| `curvez-architect` | opus |
| `curvez-reviewer` | opus |
| `curvez-structure-reviewer` | opus |
| `curvez-marketer` | opus |
| `curvez-researcher` | sonnet |
| `curvez-designer` | sonnet |
| `curvez-nextjs` | sonnet |
| `curvez-react-native` | sonnet |
| `curvez-qa` | sonnet |
| `curvez-retrospector` | sonnet |

---

## tools

실제로 필요한 것만 나열한다. 전부 열어두지 마라.

**이유:** 도구 목록은 에이전트에게 "이것이 네 작업 방식" 이라고 알려주는 신호이기도 하다.
구현 에이전트에게 `WebSearch` 를 열어두면 코드를 쓰는 대신 검색부터 시작한다.

### 역할별 기본 세트

| 역할 | tools |
|---|---|
| 조사 | `Read, Grep, Glob, WebFetch, WebSearch` |
| 설계 | `Read, Grep, Glob, Write, Bash` |
| 구현 | `Read, Write, Edit, Grep, Glob, Bash` |
| 리뷰 | `Read, Grep, Glob, Bash` |
| QA | `Read, Write, Edit, Grep, Glob, Bash` |

`Bash` 는 자체 검증을 돌려야 하는 에이전트에 반드시 넣는다.
**이유:** `## 품질 자체 검증` 의 명령을 실행하지 못하면 `verification` 을 채울 수 없고,
그러면 `status: done` 을 쓸 자격이 생기지 않는다.

### Agent 도구는 넣지 않는다

서브에이전트에게 `Agent` 를 주지 마라.

**이유:** 서브에이전트가 또 서브에이전트를 띄우면 실행 트리의 깊이를 오케스트레이터가 통제하지 못한다.
토큰 소비가 예측 불가능해지고, 어느 층에서 무엇이 실패했는지 추적이 끊긴다.
팀 편성은 `curvez-orchestrator` 한 곳에서만 한다.

---

## disallowedTools

비워두지 마라. 금지할 것이 없으면 `none` 이라고 적는다.

**이유:** 빈 값은 "생각하지 않았다" 와 "금지할 것이 없다" 를 구분하지 못한다.
`none` 은 판단했다는 기록이다. 검증기가 빈 값을 오류로 잡는다.

### 반드시 막아야 하는 조합

| 에이전트 유형 | disallowedTools |
|---|---|
| 리뷰·감사·비평 계열 | `Write, Edit, NotebookEdit` |
| 조사 전용 | `Write, Edit` (조사 브리프 경로만 예외로 열려면 `Write` 는 허용하고 소유권으로 제한) |

리뷰 계열은 검증기가 강제한다. `name` 에 `review`·`audit`·`critic` 이 있으면 쓰기 도구 3종이
`disallowedTools` 에 전부 있어야 통과한다.

---

## 소유권으로 권한을 좁힌다

도구 권한만으로는 "이 디렉터리만 써라" 를 표현하지 못한다. `## 협업과 팀 내 위치` 의
**파일 소유권** 항목이 그 역할을 한다.

```markdown
- **파일 소유권:** `.curvez/research/` 아래만 쓴다. 소스 트리와 `.curvez/architecture.md` 는 읽기만 한다.
```

**이유:** 병렬 실행에서 충돌을 막는 실질적 장치는 도구 권한이 아니라 경로 분할이다.
두 에이전트 모두 `Write` 를 갖고 있어도 쓰는 경로가 다르면 안전하다.

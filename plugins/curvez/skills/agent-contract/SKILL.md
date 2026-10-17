---
name: agent-contract
description: 서브에이전트가 작업 결과를 넘기는 핸드오프 계약을 쓰고 읽고 검증한다. 검증 결과 없이는 done 을 쓸 수 없다. "핸드오프", "handoff", "인계", "결과 넘겨", "작업 완료 보고", "hand off to" 라고 하거나 서브에이전트에게 일을 맡기고 결과를 돌려받을 때 실행한다.
---

서브에이전트는 격리된 컨텍스트에서 돌고, 끝나면 결과만 돌려준다. 그 결과가 "다 했습니다" 한 줄이면
메인 세션은 믿고 다음 일을 시작할 수밖에 없다. 핸드오프는 이 결과를 **파일로 남기는 계약**이다.
무엇을 끝냈는지, 무엇을 정했는지, 무엇으로 확인했는지를 정해진 형식으로 적는다.

어느 플러그인의 에이전트든 쓸 수 있다. OMC 의 `executor` 나 superpowers 의 서브에이전트에게 일을 맡길 때도
"끝나면 이 형식으로 핸드오프를 남겨라" 를 지시에 붙인다.

## 저장 위치

```
.curvez/handoff/<from>.<timestamp>.json
```

- `<from>` 은 만든 에이전트 이름. 예) `executor`
- `<timestamp>` 는 `YYYYMMDD-HHmmss`. 예) `executor.20260816-141203.json`
- 덮어쓰지 않는다. 나중에 무엇이 언제 어긋났는지 시간순으로 되짚을 수 있어야 한다

`.curvez/handoff/` 가 있으면 턴이 끝날 때 `check-handoff` 훅이 모든 파일을 검증한다. 차단하지 않고 경고만 남긴다.

## 스키마

```json
{
  "from": "executor",
  "to": ["main"],
  "status": "done",
  "summary": "장바구니 합계 계산을 도메인으로 옮겼다. 할인 규칙 2개 포함.",
  "artifacts": [
    { "path": "src/domain/cart/total.ts", "kind": "code", "note": "할인 규칙 포함" }
  ],
  "decisions": [
    {
      "what": "쿠폰 중복 적용을 막았다",
      "why": "요구사항에 중복 허용 언급이 없고, 허용하면 음수 합계가 나온다",
      "reversible_at": "src/domain/cart/total.ts:applyCoupons"
    }
  ],
  "blocked_on": [],
  "verification": [
    { "command": "pnpm vitest run src/domain/cart", "result": "12 tests, 12 passed", "passed": true }
  ]
}
```

- `to` 는 이 결과를 읽을 쪽이다. 서브에이전트를 띄운 메인 세션에게 돌려줄 때는 `main` 을 쓴다. 빈 배열은 허용하지 않는다
- 필드별 상세와 `kind` 허용값은 [references/field-reference.md](references/field-reference.md) 에 있다

## status 판정

| status | 조건 | 강제 규칙 |
|---|---|---|
| `done` | 맡은 범위를 끝냈고 검증까지 했다 | `verification` 1건 이상. `blocked_on` 은 비어야 한다 |
| `partial` | 일부만 끝냈다. 남은 것을 안다 | 무엇까지 됐고 무엇이 남았는지 `summary` 에 적는다 |
| `blocked` | 답 없이는 더 못 간다 | `blocked_on` 1건 이상 |

**`done` 은 `verification` 없이 쓸 수 없다.** 받는 쪽은 `done` 을 믿고 다음 일을 시작한다.
검증을 못 돌렸으면 `partial` 로 낮춘다.

**막혔으면 `blocked` 를 쓴다.** 추측으로 채운 `done` 은 아무도 잡아내지 못하고, 나중에 되돌리기가 훨씬 비싸다.

## 쓰는 순서

1. 검증을 먼저 돌린다. 코드 작업이면 `quality-gate` 를 쓴다
2. `verification` 에 명령과 실제 출력을 적는다. 요약하지 않는다
   - 좋음: `{ "command": "pnpm typecheck", "result": "0 errors" }`
   - 나쁨: `{ "command": "타입 확인", "result": "통과" }`
3. `decisions` 에 되돌릴 위치(`reversible_at`)를 남긴다
4. `status` 를 위 표대로 고른다
5. 파일로 쓰고 검증한다

```bash
node "$CLAUDE_PLUGIN_ROOT/scripts/validate-handoff.mjs" .curvez/handoff/
```

## 읽는 순서

1. `status` 를 먼저 본다. `blocked` 나 `partial` 이면 그 결과 위에서 다음 일을 시작하지 않는다
2. `blocked_on` 의 질문에 답할 수 있으면 답한다. 사용자만 답할 수 있으면 사용자에게 묻는다
3. `decisions` 가 다른 결정과 부딪히면 조용히 뒤집지 않는다. 사용자에게 알린다
4. `summary` 만 읽고 넘어가지 않는다. `artifacts` 의 파일을 직접 본다

## 서브에이전트에게 붙일 지시

서브에이전트를 띄울 때 프롬프트 끝에 아래를 붙인다.

```
끝나면 .curvez/handoff/<너의 이름>.<YYYYMMDD-HHmmss>.json 에 핸드오프를 남겨라.
형식은 curvez:agent-contract 스킬을 따른다. verification 없이 status: done 을 쓰지 마라.
```

## 완료 기준

- [ ] `validate-handoff.mjs` 가 오류 0개로 끝난다
- [ ] `status: done` 인 파일 전부에 `verification` 이 1건 이상 있다
- [ ] `verification.result` 가 판정할 수 있는 값(수치·개수·명시적 상태)이다

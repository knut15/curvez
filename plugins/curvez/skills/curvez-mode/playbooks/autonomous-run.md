# 자율 실행 (autonomous-run)

**goal 하나를 완료 조건까지 끌고 간다. 사람 없이 갈 수 있는 데까지 가고, 멈춰야 할 곳에서는 멈춘다.**

1. goal 과 완료 조건을 적는다. 완료 조건은 참인지 거짓인지 판정할 수 있는 문장이다. 예) "AC-1~5 가 E2E 로 통과하고 `shipping` 조건을 모두 채운다"
2. goal 을 작업 단위로 나누고, 단위마다 `feature`, `bug-fix`, `refactoring` 가운데 하나를 붙인다. 나눈 결과를 `curvez-orchestrator` 에게 넘겨 `.curvez/team.md` 에 남긴다
3. 단위를 순서대로 돌린다. 단위가 끝날 때마다 완료 조건을 다시 판정한다
4. 기준표로 정해지지 않는 결정은 정해진 순서로 고르고 기록한다. 실행해서 확인할 수 있는 질문은 사용자에게 묻지 않고 확인한다 (원칙: `principles/tie-break-order.md`, `principles/batch-questions.md`)
5. 승인이 필요한 행동에 닿으면 그 단위를 멈추고, 나머지 단위를 계속한 뒤 질문을 모아서 한 번에 묻는다 (원칙: `principles/approval-boundary.md`)
6. 같은 단위가 두 라운드 연속 나아지지 않으면 멈추고 보고한다 (원칙: `principles/retry-twice-then-partial.md`)

보고: 완료 조건 판정 결과, 단위별 상태, 고른 결정과 되돌릴 지점, 멈춘 곳과 이유

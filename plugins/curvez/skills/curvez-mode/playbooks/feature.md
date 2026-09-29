# 기능 (feature)

**새 동작을 추가하거나 바꾼다. 데이터 모양부터 정하고, 팀에 맡기고, 실제 결과물로 확인한다.**

1. `.curvez/profile.json` 이 있는지 본다. 없으면 멈추고 `bootstrap` 이 먼저라고 보고한다 (원칙: `principles/blocked-over-guessing.md`)
2. 수용 기준을 확정한다. `.curvez/requirements.md` 에 이 기능의 AC 가 없으면 `curvez-requirements` 라운드를 먼저 연다
3. 데이터 모양을 이름 붙여 적는다. 이 기능이 새로 만들거나 바꾸는 타입, 저장 구조, API 계약이다. 화면이 있으면 `curvez-designer`, 레이어 경계가 바뀌면 `curvez-architect` 라운드를 연다
4. 구현을 `curvez-orchestrator` 에 지시서로 넘긴다. `GOAL` 은 이 기능 한 문장, `ACCEPTANCE` 는 2번의 AC ID, `VERIFY` 는 `profile.json` 의 `commands` 에서 옮긴다 (원칙: `principles/commands-from-profile.md`)
5. `quality-gate` 를 돌려 게이트마다 수치로 받는다 (원칙: `principles/numbers-not-adjectives.md`)
6. 리뷰 라운드를 연다. `curvez-reviewer` 와 `curvez-structure-reviewer`, `profile.json` 에 `crossReview` 가 있으면 `curvez-cross-reviewer` 까지 한 라운드에 띄운다. blocker 가 남으면 4번으로 돌아간다. 재리뷰는 2회까지다
7. 수용 기준마다 실제 결과물(화면, 응답, 테스트 출력)로 확인한다. 빌드가 된다는 것은 확인이 아니다
8. `shipping` 플레이북으로 넘어간다

보고: AC 마다 확인 방법과 결과, 게이트별 수치, 남은 지적(합의 지적과 단독 지적 구분), 건너뛴 단계와 이유

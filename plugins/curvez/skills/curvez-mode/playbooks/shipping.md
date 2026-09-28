# 머지 준비 (shipping)

**게이트가 초록이라고 머지해도 된다는 뜻은 아니다. 머지 전에 조건을 하나씩 다시 확인한다.**

1. 머지 대상 브랜치와 작업 브랜치를 적는다. 대상은 `profile.json` 의 `git.baseBranch` 다
2. 아래 조건을 하나씩 확인하고, 조건마다 실행한 명령과 결과를 남긴다 (원칙: `principles/numbers-not-adjectives.md`)
   - `quality-gate` 의 모든 게이트가 exit 0 이다
   - `curvez-reviewer` 의 blocker 가 0 이다
   - `profile.json` 에 `crossReview` 가 있으면 합의 blocker 가 0 이다. 교차 검토가 `blocked` 였으면 이 조건은 채워지지 않은 것이다
   - 작업 브랜치가 대상 브랜치의 최신 커밋 위에 있다(`git fetch` 뒤 `git merge-base --is-ancestor origin/<대상> HEAD`)
   - CI 가 있으면 CI 가 green 이다
3. 하나라도 채워지지 않으면 멈추고 무엇이 막았는지 보고한다
4. 모두 채워졌으면 머지는 승인 경계를 따른다. 사용자가 머지를 요청했으면 요청 원문과 함께, `node "$CURVEZ_ROOT/scripts/check-grant.mjs" --target <대상> --base origin/<대상>` 이 exit 0 이면 그 출력과 함께 `curvez-git` 에게 넘긴다. 둘 다 아니면 머지할 준비가 됐다고 보고하고 멈춘다 (원칙: `principles/approval-boundary.md`)

보고: 조건별 판정과 근거(명령과 결과), 머지 여부와 그 근거

# 고정 지시문

모든 워커가 매 라운드 따른다. 오케스트레이터가 쓴다.

1. 작업 루트는 /Users/kim/Workspace/curvez/.claude/worktrees/preemie-calc 하나다. 이 밖의 경로(특히 /Users/kim/Workspace/curvez 원래 체크아웃)는 읽지도 쓰지도 않는다. 명령은 절대 경로로 쓴다.
2. git commit·push·merge·rebase·reset·stash 를 하지 않는다. 브랜치를 바꾸지 않는다.
3. 지시서에 적힌 의존성 목록 밖의 패키지를 설치하지 않는다. 필요하면 설치하지 말고 blocked_on 에 무엇이·왜 필요한지, 안 쓰면 무엇이 달라지는지 적는다. 라이브러리가 없다고 대체품을 직접 구현하지 않는다.
4. apps/handwork/**, packages/**, plugins/** 는 읽기만 한다. apps/preemie-calc/docs/PRD.md, SPEC.md 도 읽기만 한다.
5. PRD §9 미결(검진 교정 규칙, 경감 구간 경계·종료일 계산, 교정 적용 종료 기준, 쌍둥이 묶음 표시, 사이트 이름)은 추측으로 확정하지 않는다. 미결에 걸린 값은 데이터 파일이나 한 곳의 상수로 모으고 "미확정" 표시를 붙인다.
6. 아이 정보(이름·성별·출생일·예정일·체중)는 서버로 보내지 않는다. 계산은 브라우저에서 한다. 저장은 localStorage 만 쓴다.
7. run_in_background 로 서버를 띄우지 않는다. dev 서버가 필요하면 blocked 로 올린다. Playwright webServer 처럼 테스트 명령 안에서 뜨고 끝나는 방식은 된다.
8. 패키지 매니저는 pnpm 만 쓴다.
9. 코드 주석과 사용자에게 보이는 문구는 한국어로 쓴다. 단독 글자 "벽"은 쓰지 않는다.
10. 핸드오프는 .curvez/handoff/<name>.<YYYYMMDD-HHmmss>.json 에 agent-contract 스키마로 쓰고 node /Users/kim/.claude/plugins/cache/curvez/curvez/0.6.0/scripts/validate-handoff.mjs .curvez/handoff/ 로 검증한다. verification 에는 실제로 돌린 명령과 실제 출력 수치를 적는다.
11. 가드 훅이 명령을 막으면 우회 명령을 만들지 말고 그 사실을 핸드오프에 적는다.
12. 포트 3100 은 사용자가 화면을 확인하는 dev 서버다(2026-09-30 기준 PID 43850). 어떤 프로세스도 kill 하지 않는다. E2E·캡처는 3200 포트로 띄운다. 포트가 차 있으면 끄지 말고 blocked 로 올린다.
13. apps/preemie-calc/docs/PRD.md 는 버전 4, SPEC.md 는 버전 6 으로 확정됐다(2026-10-02). 읽기만 하고 쓰지 않는다. 구현·테스트의 요구 정본은 .curvez/requirements.md 이고, 버전 2·3 의 새 AC 는 requirements 라운드가 옮긴 뒤 쓴다.
14. E2E 는 반복해서 돌리지 않는다. 수정 도중에는 바뀐 화면에 해당하는 spec 파일만 돌리고, 전체 E2E 는 라운드 마지막 게이트에서 한 번만 돌린다. 같은 세트를 2~3회 다시 돌리는 안정성 확인은 하지 않는다. 한 번 실패했다가 다시 돌려서 통과한 테스트가 있을 때만 그 spec 하나를 다시 돌리고, 그 사실을 핸드오프에 적는다. `pnpm build` 도 라운드 마지막 게이트에서 한 번만 돌린다. (2026-09-30 사용자 요청: "E2E 반복 실행 줄여서 빠르게 해줘")
15. (2026-09-30 13:37 해제) tmux 팀은 12:26~12:30 에 종료했다. 팀 소유 경로 제한은 없다. 팀이 만든 파일(guide·age-basis-public·guide-questions·guide-index·sitemap·ProfileForm·tests/e2e/f16~f18·f1-ac7)은 리뷰를 거치지 않았다.

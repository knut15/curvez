#!/usr/bin/env python3
"""check-grant.mjs 회귀 테스트.

    python3 scripts/tests/check-grant.test.py

자율 권한 판정은 머지를 여는 문이다. 여기서 지켜야 할 것은 세 가지다.
권한이 없거나 흐리면 닫는다. 권한이 있어도 의존성·curvez 자체·배포 워크플로 변경은 닫는다.
리뷰·QA·교차 검토의 증거가 없으면 닫는다 — 2026-09-28 종단 실행에서 이것 없이 머지가 열렸다.

임시 git 저장소를 만들어 돌린다. exit 0 = 전부 통과.
"""
import datetime, json, os, shutil, subprocess, sys, tempfile

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
SCRIPT = os.path.join(ROOT, "scripts", "check-grant.mjs")

FUTURE = (datetime.date.today() + datetime.timedelta(days=7)).isoformat()
PAST = (datetime.date.today() - datetime.timedelta(days=1)).isoformat()
NOW_TS = (datetime.datetime.now() + datetime.timedelta(minutes=1)).strftime("%Y%m%d-%H%M%S")
OLD_TS = (datetime.datetime.now() - datetime.timedelta(days=2)).strftime("%Y%m%d-%H%M%S")


def git(cwd, *args):
    subprocess.run(["git", "-c", "user.email=t@t", "-c", "user.name=t", *args], cwd=cwd, check=True, capture_output=True)


def repo(changed_files):
    """main 에 커밋 하나, work 브랜치에서 changed_files 를 바꾼 커밋 하나."""
    d = tempfile.mkdtemp(prefix="curvez-grant-")
    git(d, "init", "-q", "-b", "main")
    with open(os.path.join(d, "README.md"), "w") as f:
        f.write("x\n")
    git(d, "add", ".")
    git(d, "commit", "-qm", "init")
    git(d, "switch", "-qc", "work")
    for path in changed_files:
        full = os.path.join(d, path)
        os.makedirs(os.path.dirname(full), exist_ok=True)
        with open(full, "w") as f:
            f.write("changed\n")
    git(d, "add", ".")
    git(d, "commit", "-qm", "work")
    return d


def write(d, rel, text):
    full = os.path.join(d, rel)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w") as f:
        f.write(text)


def handoff(frm, status="done", findings=None, verification=None, ts=NOW_TS):
    h = {"from": frm, "to": ["curvez-orchestrator"], "status": status, "summary": "s", "artifacts": [],
         "decisions": [], "blocked_on": [], "verification": verification if verification is not None else [{"command": "c", "result": "r"}]}
    if findings is not None:
        h["findings"] = findings
    return f".curvez/handoff/{frm}.{ts}.json", json.dumps(h)


VALID = f"---\ntarget: main\nexpires: {FUTURE}\n---\n\n> 이 goal 은 머지까지 자동으로 해\n"
PROFILE_CROSS = ('.curvez/profile.json', '{"crossReview": {"cli": "codex"}}')
REVIEWER_OK = handoff("curvez-reviewer", findings=[])
QA_OK = handoff("curvez-qa", verification=[{"command": "node --test", "result": "pass 2, fail 0", "passed": True}])
CROSS_OK = handoff("curvez-cross-reviewer", findings=[])
FULL = [REVIEWER_OK, QA_OK]

TEAM = ["--stage", "team", "--target", "main"]
MERGE = ["--stage", "merge", "--target", "main", "--base", "main"]

# (바뀐 파일, grant.md, 추가 파일 목록, 인자, 기대 exit, 설명)
cases = [
    # ── team: 권한만 본다 ──
    (["src/app.js"], VALID, [], TEAM, 0, "team: 유효한 권한"),
    (["src/app.js"], None, [], TEAM, 1, "team: grant.md 없음"),
    (["src/app.js"], VALID.replace(FUTURE, PAST), [], TEAM, 1, "team: 만료됨"),
    (["src/app.js"], VALID, [], ["--stage", "team", "--target", "release"], 1, "team: 대상이 다름"),
    (["src/app.js"], VALID.replace("> 이 goal 은 머지까지 자동으로 해\n", "머지해도 됨\n"), [], TEAM, 1, "team: 원문 인용 없음"),
    (["src/app.js"], VALID.replace(f"expires: {FUTURE}\n", ""), [], TEAM, 1, "team: expires 없음"),
    (["src/app.js"], VALID.replace(FUTURE, "다음 주"), [], TEAM, 1, "team: 날짜 형식 오류"),
    (["src/app.js"], "> 머지해\n", [], TEAM, 1, "team: 프론트매터 없음"),
    # ── merge: 증거가 다 있으면 연다 ──
    (["src/app.js"], VALID, FULL, MERGE, 0, "merge: 리뷰·QA 증거 있음"),
    (["src/app.js"], VALID, FULL + [PROFILE_CROSS, CROSS_OK], MERGE, 0, "merge: 교차 검토까지 있음"),
    (["docs/package.json.md"], VALID, FULL, MERGE, 0, "merge: 이름만 비슷한 파일은 통과"),
    # ── merge: 멈춤 경로 ──
    (["package.json"], VALID, FULL, MERGE, 1, "merge: 의존성 변경"),
    (["apps/web/pnpm-lock.yaml"], VALID, FULL, MERGE, 1, "merge: 하위 패키지 lockfile"),
    (["plugins/curvez/agents/x.md"], VALID, FULL, MERGE, 1, "merge: curvez 자체 수정"),
    ([".github/workflows/deploy.yml"], VALID, FULL, MERGE, 1, "merge: 배포 워크플로 변경"),
    # ── merge: 증거 부족 — 종단 실행에서 실제로 난 경우 ──
    (["src/app.js"], VALID, [], MERGE, 1, "merge: 핸드오프가 하나도 없음(종단 실행 재현)"),
    (["src/app.js"], VALID, [QA_OK], MERGE, 1, "merge: 리뷰어 없음"),
    (["src/app.js"], VALID, [REVIEWER_OK], MERGE, 1, "merge: QA 없음"),
    (["src/app.js"], VALID, [handoff("curvez-reviewer", findings=[{"id": "1", "kind": "k", "where": "a:1", "what": "w", "why": "y", "severity": "blocker"}]), QA_OK], MERGE, 1, "merge: 리뷰어 blocker 남음"),
    (["src/app.js"], VALID, [handoff("curvez-reviewer", status="blocked"), QA_OK], MERGE, 1, "merge: 리뷰어 blocked"),
    (["src/app.js"], VALID, [REVIEWER_OK, handoff("curvez-qa", verification=[{"command": "t", "result": "fail 1", "passed": False}])], MERGE, 1, "merge: QA 실패 기록"),
    (["src/app.js"], VALID, [REVIEWER_OK, handoff("curvez-qa", verification=[])], MERGE, 1, "merge: QA verification 비었음"),
    (["src/app.js"], VALID, [REVIEWER_OK, handoff("curvez-qa", status="partial")], MERGE, 1, "merge: QA partial"),
    (["src/app.js"], VALID, FULL + [PROFILE_CROSS], MERGE, 1, "merge: crossReview 설정인데 교차 리뷰 없음"),
    (["src/app.js"], VALID, FULL + [PROFILE_CROSS, handoff("curvez-cross-reviewer", status="blocked")], MERGE, 1, "merge: 교차 리뷰 blocked"),
    (["src/app.js"], VALID, [handoff("curvez-reviewer", findings=[], ts=OLD_TS), QA_OK], MERGE, 1, "merge: 분기점 전의 옛 리뷰는 세지 않음"),
    # ── 사용법 ──
    (["src/app.js"], VALID, FULL, ["--stage", "merge", "--target", "main"], 2, "merge 에 --base 없음"),
    (["src/app.js"], VALID, FULL, ["--target", "main"], 2, "--stage 없음"),
]

fails = []
for changed, grant, extra, args, want, label in cases:
    d = repo(changed)
    if grant is not None:
        write(d, ".curvez/grant.md", grant)
    for rel, text in extra:
        write(d, rel, text)
    r = subprocess.run(["node", SCRIPT, *args], cwd=d, capture_output=True, text=True)
    if r.returncode != want:
        fails.append(f"{label}: exit {r.returncode} (기대 {want}) {r.stdout.strip()} {r.stderr.strip()}")
    shutil.rmtree(d, ignore_errors=True)

if fails:
    print(f"FAILED {len(fails)}/{len(cases)}")
    for f in fails:
        print("  " + f)
    sys.exit(1)

print(f"OK {len(cases)}/{len(cases)} — check-grant 회귀 테스트 통과")

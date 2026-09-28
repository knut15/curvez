#!/usr/bin/env python3
"""check-grant.mjs 회귀 테스트.

    python3 scripts/tests/check-grant.test.py

자율 권한 판정은 머지를 여는 문이다. 여기서 지켜야 할 것은 두 가지다.
권한이 없거나 흐리면 닫는다. 권한이 있어도 의존성·curvez 자체·배포 워크플로 변경은 닫는다.

임시 git 저장소를 만들어 돌린다. exit 0 = 전부 통과.
"""
import os, shutil, subprocess, sys, tempfile, datetime

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
SCRIPT = os.path.join(ROOT, "scripts", "check-grant.mjs")

FUTURE = (datetime.date.today() + datetime.timedelta(days=7)).isoformat()
PAST = (datetime.date.today() - datetime.timedelta(days=1)).isoformat()


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


def grant(d, text):
    os.makedirs(os.path.join(d, ".curvez"), exist_ok=True)
    with open(os.path.join(d, ".curvez", "grant.md"), "w") as f:
        f.write(text)


VALID = f"---\ntarget: main\nexpires: {FUTURE}\n---\n\n> 이 goal 은 머지까지 자동으로 해\n"

# (바뀐 파일, grant.md 내용 또는 None, 인자, 기대 exit, 설명)
cases = [
    (["src/app.js"], VALID, ["--target", "main", "--base", "main"], 0, "유효한 권한, 코드만 바뀜"),
    (["src/app.js"], VALID, ["--target", "main"], 0, "diff 검사 없이 권한만 확인"),
    (["src/app.js"], None, ["--target", "main"], 1, "grant.md 없음"),
    (["src/app.js"], VALID.replace(FUTURE, PAST), ["--target", "main"], 1, "만료됨"),
    (["src/app.js"], VALID, ["--target", "release"], 1, "머지 대상이 다름"),
    (["src/app.js"], VALID.replace("> 이 goal 은 머지까지 자동으로 해\n", "머지해도 됨\n"), ["--target", "main"], 1, "사용자 원문 인용 없음"),
    (["src/app.js"], VALID.replace(f"expires: {FUTURE}\n", ""), ["--target", "main"], 1, "expires 없음"),
    (["src/app.js"], VALID.replace(FUTURE, "다음 주"), ["--target", "main"], 1, "날짜로 읽을 수 없음"),
    (["src/app.js"], "> 머지해\n", ["--target", "main"], 1, "프론트매터 없음"),
    (["package.json"], VALID, ["--target", "main", "--base", "main"], 1, "의존성 변경"),
    (["apps/web/pnpm-lock.yaml"], VALID, ["--target", "main", "--base", "main"], 1, "하위 패키지 lockfile"),
    (["plugins/curvez/agents/x.md"], VALID, ["--target", "main", "--base", "main"], 1, "curvez 자체 수정"),
    ([".github/workflows/deploy.yml"], VALID, ["--target", "main", "--base", "main"], 1, "배포 워크플로 변경"),
    (["docs/package.json.md"], VALID, ["--target", "main", "--base", "main"], 0, "이름만 비슷한 파일은 통과"),
    (["src/app.js"], VALID, [], 2, "--target 없음"),
]

fails = []
for changed, text, args, want, label in cases:
    d = repo(changed)
    if text is not None:
        grant(d, text)
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

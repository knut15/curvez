#!/usr/bin/env python3
"""quality-gate.mjs 의 arch 게이트 회귀 테스트.

    python3 scripts/tests/quality-gate-arch.test.py

금지 import 표의 검사 경로 칸에 `src/domain/ src/infrastructure/` 처럼 경로를 공백으로 여럿 적은
행이 실제 프로젝트에 있었다. 실행기는 그 칸 전체를 경로 하나로 읽어 "경로 없음" 으로 건너뛰었고,
그 규칙은 한 번도 검사되지 않았다. 지운 아키텍처 에이전트의 예시가 바로 이 형식이었다.

두 번째 경로에만 있는 위반을 잡는지, 일부 경로가 없을 때 그 사실을 숨기지 않는지,
경로가 전부 없을 때 "위반 없음" 이 아니라 "검사 못 함" 으로 실패하는지를 고정해 둔다.

exit 0 = 전부 통과.
"""
import json, os, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
GATE = os.path.join(HERE, "..", "quality-gate.mjs")

HEAD = "## 금지 import\n| 규칙 ID | 검사 경로 | 금지 패턴 (ERE) | 이유 |\n|---|---|---|---|\n"


def run(rows, files):
    with tempfile.TemporaryDirectory() as d:
        os.makedirs(os.path.join(d, ".curvez"))
        with open(os.path.join(d, ".curvez", "profile.json"), "w") as f:
            json.dump({"stack": "nextjs", "paths": {"web": "."}, "commands": {}}, f)
        with open(os.path.join(d, ".curvez", "architecture.md"), "w") as f:
            f.write(HEAD + "".join(r + "\n" for r in rows))
        for path, body in files.items():
            full = os.path.join(d, path)
            os.makedirs(os.path.dirname(full), exist_ok=True)
            with open(full, "w") as f:
                f.write(body)
        r = subprocess.run(
            ["node", GATE, "--dir", d, "--only", "arch", "--json"],
            capture_output=True, text=True,
        )
        out = json.loads(r.stdout)
        result = next(v for v in out["verification"] if v["command"].startswith("arch"))
        return r.returncode, result["result"]


BAD = "import d from '../domain/a'\n"
ROW = r"| ARCH-002 | src/app/ src/presentation/ | from ['\"](\.\./)*domain/ | 화면은 도메인을 직접 부르지 않는다 |"

cases = [
    # (설명, 행, 파일, 기대 exit, 결과에 들어 있어야 할 문자열들)
    ("두 번째 경로의 위반을 잡는다", [ROW],
     {"src/app/p.ts": "ok\n", "src/presentation/v.ts": BAD},
     1, ["검사 1개", "위반 1건", "ARCH-002 1건"]),
    ("두 경로 모두의 위반을 합산한다", [ROW],
     {"src/app/p.ts": BAD, "src/presentation/v.ts": BAD},
     1, ["위반 2건"]),
    ("일부 경로가 없으면 나머지는 검사하고 없는 경로를 보고한다", [ROW],
     {"src/app/p.ts": BAD},
     1, ["검사 1개", "위반 1건", "일부 경로 없음: ARCH-002(src/presentation/)"]),
    ("경로가 전부 없으면 검사 못 함으로 실패한다", [ROW],
     {"src/other.ts": BAD},
     1, ["검사 0개", "경로 없음: ARCH-002"]),
    ("경로 하나짜리 행은 예전처럼 동작한다",
     [r"| ARCH-001 | src/domain/ | from ['\"]next | 도메인은 프레임워크를 모른다 |"],
     {"src/domain/a.ts": "import x from 'next'\n"},
     1, ["검사 1개", "위반 1건"]),
    ("위반이 없으면 통과한다", [ROW],
     {"src/app/p.ts": "ok\n", "src/presentation/v.ts": "ok\n"},
     0, ["검사 1개", "위반 0건"]),
]

failed = 0
for name, rows, files, want_code, want in cases:
    code, result = run(rows, files)
    missing = [w for w in want if w not in result]
    if code != want_code or missing:
        failed += 1
        print(f"FAIL {name}\n     exit={code} (기대 {want_code}) 결과: {result}\n     빠진 문자열: {missing}")
    else:
        print(f"OK   {name}")

print(f"\n{len(cases) - failed}/{len(cases)} 통과")
sys.exit(1 if failed else 0)

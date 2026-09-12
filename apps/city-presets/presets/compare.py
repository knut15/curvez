"""두 이미지가 같은지 기계가 판정한다.

판정 기준은 `docs/GOAL.md` 3절이다.
  평균 절대차 0.5 레벨 미만 · 1레벨 초과 픽셀 1% 미만.
최대 차이는 기록만 하고 단독으로 판정하지 않는다.
"""
import pathlib, sys
import numpy as np
from PIL import Image

MEAN_MAX = 0.5
OVER1_MAX = 1.0  # %

def diff(p, q):
    a = np.asarray(Image.open(p).convert('RGB'), dtype=np.float64)
    b = np.asarray(Image.open(q).convert('RGB'), dtype=np.float64)
    if a.shape != b.shape:
        raise SystemExit(f'크기가 다르다 {a.shape} vs {b.shape}')
    d = np.abs(a - b)
    return d.mean(), (d > 1).mean() * 100, d.max()

def verdict(mean, over1):
    return mean < MEAN_MAX and over1 < OVER1_MAX

def main(argv):
    if len(argv) == 2 and all(pathlib.Path(x).is_dir() for x in argv):
        left, right = map(pathlib.Path, argv)
        rows = []
        for f in sorted(left.glob('*.png')):
            g = right / f.name
            if not g.exists():
                continue
            rows.append((f.stem, *diff(f, g)))
        if not rows:
            raise SystemExit('짝이 맞는 파일이 없다')
        bad = [r for r in rows if not verdict(r[1], r[2])]
        rows.sort(key=lambda r: -r[1])
        print(f'{"":34s}{"평균":>8s}{"1레벨초과%":>12s}{"최대":>7s}')
        for name, m, o, mx in rows[:10]:
            print(f'{name:34s}{m:8.3f}{o:12.2f}{mx:7.0f}  {"" if verdict(m,o) else "미달"}')
        if len(rows) > 10:
            print(f'... 모두 {len(rows)}장')
        allm = np.array([r[1] for r in rows])
        print(f'\n전체 {len(rows)}장 · 평균 {allm.mean():.3f} · 최악 {allm.max():.3f}')
        print(f'기준 미달 {len(bad)}장' if bad else '전부 통과')
        return 1 if bad else 0

    m, o, mx = diff(*argv[:2])
    print(f'평균 {m:.3f} · 1레벨 초과 {o:.2f}% · 최대 {mx:.0f}')
    print('통과' if verdict(m, o) else '미달')
    return 0 if verdict(m, o) else 1

if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))

"""열두 개가 정말 열두 개인지 잰다.

같은 원본에 건 결과 두 장이 비슷하면 그것은 열두 개가 아니라 열한 개다.
각 결과의 네 값(R−B 차 · G−B 차 · 평균 채도 · 평균 밝기)으로 66쌍의 거리를 재고
가장 가까운 짝을 위로 올린다. 판정 기준은 `docs/GOAL.md` 4절이다 —
어느 원본에서도 최소거리가 20 아래로 떨어지지 않아야 한다.
"""
import itertools, pathlib, sys
import numpy as np
from PIL import Image

def features(path):
    a = np.asarray(Image.open(path).convert('RGB'), dtype=np.float64)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    sat = a.max(axis=2) - a.min(axis=2)
    return np.array([(r - b).mean(), (g - b).mean(), sat.mean(), a.mean()])

def main(root):
    root = pathlib.Path(root)
    bases = sorted({p.stem.split('__')[0] for p in root.glob('*__*.png')})
    worst = None
    for base in bases:
        files = sorted(root.glob(f'{base}__*.png'))
        feats = {p.stem.split('__')[1]: features(p) for p in files}
        pairs = [(np.linalg.norm(feats[x] - feats[y]), x, y)
                 for x, y in itertools.combinations(sorted(feats), 2)]
        pairs.sort()
        dists = [d for d, _, _ in pairs]
        print(f'\n{base}  짝 {len(pairs)}개 · 최소 {dists[0]:.1f} · 중앙값 {np.median(dists):.1f}')
        for d, x, y in pairs[:3]:
            print(f'   {d:6.1f}  {x} · {y}')
        if worst is None or dists[0] < worst[0]:
            worst = (dists[0], base, pairs[0][1], pairs[0][2])

    print(f'\n전체 최소거리 {worst[0]:.1f}  ({worst[1]}: {worst[2]} · {worst[3]})')
    ok = worst[0] >= 20
    print('통과' if ok else '미달 — 기준은 20 이상')
    return 0 if ok else 1

if __name__ == '__main__':
    sys.exit(main(sys.argv[1] if len(sys.argv) > 1 else '../.baseline'))

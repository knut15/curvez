"""도시 프리셋 12종 — 값의 정본.

아이폰 '사진' 앱의 슬라이더 어휘를 쓰되 거기 없는 것까지 더 쓴다.
- 아이폰에 있는 것: 노출·브릴리언스·하이라이트·그림자·대비·밝기·블랙포인트·
  채도·생동감·온도·색조·명료도·비네트  (전부 -100..+100)
- 아이폰에 없는 것: 스플릿 토닝(그림자/하이라이트 색상과 강도), 그레인, 블룸, 색상별 채도

사진 아래에 찍는 값이 곧 이 값이다. 지어낸 숫자가 아니다.
"""
import numpy as np, colorsys
from PIL import Image

def srgb2lin(x): return np.where(x <= 0.04045, x/12.92, ((x+0.055)/1.055)**2.4)
def lin2srgb(x):
    x = np.clip(x, 0, 1)
    return np.where(x <= 0.0031308, x*12.92, 1.055*x**(1/2.4) - 0.055)
def luma(a): return (0.2126*a[...,0] + 0.7152*a[...,1] + 0.0722*a[...,2])[...,None]
def hue_rgb(deg): return np.array(colorsys.hsv_to_rgb(deg/360.0, 1.0, 1.0))


# ── 언어를 건너면 달라지는 세 가지. 셰이더와 같은 것을 쓰도록 여기에 명시한다 ──
# 무엇이 왜 갈리는지는 `docs/GOAL.md` 2절에 있다.

BLUR_SCALE = 4  # 블러는 1/4 로 줄여서 건다. 전 해상도 133탭은 폰에서 돌지 않는다

def _gauss_kernel(sigma):
    """정규화된 1차원 가우시안. 3시그마에서 자른다. 셰이더가 같은 값을 받는다."""
    r = int(np.ceil(3 * sigma))
    x = np.arange(-r, r + 1, dtype=np.float64)
    w = np.exp(-(x * x) / (2 * sigma * sigma))
    return w / w.sum()

def _downsample(a, s):
    """s×s 블록 평균. 가장자리는 복제해서 s 의 배수로 채운다."""
    h, w = a.shape[:2]
    ph, pw = (-h) % s, (-w) % s
    if ph or pw:
        a = np.pad(a, ((0, ph), (0, pw), (0, 0)), mode='edge')
    return a.reshape(a.shape[0]//s, s, a.shape[1]//s, s, 3).mean(axis=(1, 3))

def _blur1d(a, k, axis):
    r = (len(k) - 1) // 2
    pad = [(0, 0)] * a.ndim
    pad[axis] = (r, r)
    ap = np.pad(a, pad, mode='edge')
    out = np.zeros_like(a)
    for i, wgt in enumerate(k):
        sl = [slice(None)] * a.ndim
        sl[axis] = slice(i, i + a.shape[axis])
        out += wgt * ap[tuple(sl)]
    return out

def _upsample(lo, h, w, s):
    """GPU 의 텍셀 중심 규약으로 되돌린다. 셰이더는 texelFetch 로 같은 식을 쓴다."""
    lh, lw = lo.shape[:2]
    fy = (np.arange(h) + 0.5) / s - 0.5
    fx = (np.arange(w) + 0.5) / s - 0.5
    y0 = np.floor(fy).astype(np.int64); ty = (fy - y0)[:, None, None]
    x0 = np.floor(fx).astype(np.int64); tx = (fx - x0)[None, :, None]
    y0c, y1c = np.clip(y0, 0, lh-1), np.clip(y0+1, 0, lh-1)
    x0c, x1c = np.clip(x0, 0, lw-1), np.clip(x0+1, 0, lw-1)
    a00 = lo[np.ix_(y0c, x0c)]; a01 = lo[np.ix_(y0c, x1c)]
    a10 = lo[np.ix_(y1c, x0c)]; a11 = lo[np.ix_(y1c, x1c)]
    top = a00 + (a01 - a00) * tx
    bot = a10 + (a11 - a10) * tx
    return top + (bot - top) * ty

def blur(a, radius):
    """`ImageFilter.GaussianBlur` 를 쓰지 않는다. PIL 은 박스 3번으로 근사하는데
    그 근사를 셰이더에서 똑같이 재현할 방법이 없다."""
    lo = _downsample(a, BLUR_SCALE)
    k = _gauss_kernel(radius / BLUR_SCALE)
    lo = _blur1d(_blur1d(lo, k, 1), k, 0)
    return _upsample(lo, a.shape[0], a.shape[1], BLUR_SCALE)

def _hash01(xx, yy, seed):
    """픽셀 좌표만으로 정해지는 난수. 시드 기반 RNG 는 언어를 건너면 다른 수열을 준다.
    uint32 랩어라운드라 파이썬과 GLSL 이 비트까지 같은 값을 낸다."""
    M = np.uint64(0xFFFFFFFF)
    h = (xx.astype(np.uint64) * np.uint64(374761393)
         + yy.astype(np.uint64) * np.uint64(668265263)
         + np.uint64(seed) * np.uint64(2246822519)) & M
    h = ((h ^ (h >> np.uint64(13))) * np.uint64(1274126177)) & M
    h = (h ^ (h >> np.uint64(16))) & np.uint64(0xFFFFFF)
    return h.astype(np.float64) / 16777216.0

def grain_noise(h_, w_):
    """균등난수 셋을 더해 정규분포에 가깝게 만든다(Irwin-Hall). 표준편차 1.
    Box-Muller 를 쓰지 않는 이유는 sin·log 의 정밀도가 GPU 와 CPU 에서 다르기 때문이다."""
    yy, xx = np.mgrid[0:h_, 0:w_]
    u = sum(_hash01(xx, yy, s) for s in (1, 2, 3))
    return (u - 1.5) / 0.5

def hue_deg(a):
    """실수 HSV 의 색상만. PIL 의 `convert('HSV')` 는 정수 0–255 색상환이라
    한 칸이 1.41도다. 셰이더는 실수로 계산하므로 여기도 실수로 맞춘다."""
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    mx, mn = a.max(axis=2), a.min(axis=2)
    d = mx - mn
    safe = np.where(d == 0, 1.0, d)
    h = np.where(mx == r, ((g - b) / safe) % 6.0,
        np.where(mx == g, ((b - r) / safe) + 2.0,
                          ((r - g) / safe) + 4.0))
    return np.where(d == 0, 0.0, h) * 60.0

SLIDERS = ['exposure','brilliance','highlights','shadows','contrast','brightness',
           'black_point','saturation','vibrance','warmth','tint','definition','vignette',
           'grain','bloom']

def grade(img, *, split_shadow=None, split_high=None, hue_sat=None, **v):
    p = {k: v.get(k, 0)/100.0 for k in SLIDERS}
    a = np.asarray(img, dtype=np.float64)/255.0

    if p['exposure']:
        a = lin2srgb(srgb2lin(a) * 2.0**(p['exposure']*1.2))
    if p['warmth'] or p['tint']:
        lin = srgb2lin(a)
        lin[...,0] *= 1 + p['warmth']*0.18
        lin[...,2] *= 1 - p['warmth']*0.18
        lin[...,1] *= 1 - p['tint']*0.12
        a = lin2srgb(lin)

    L = luma(a)
    if p['brilliance']:
        b = p['brilliance']
        a = np.clip(a + b*0.35*(1-L)**2.2*(1-a) - b*0.25*L**2.2*a, 0, 1); L = luma(a)
    if p['highlights']:
        a = np.clip(a + p['highlights']*0.45*L**2.0*(1-a), 0, 1); L = luma(a)
    if p['shadows']:
        a = np.clip(a + p['shadows']*0.45*(1-L)**2.0*(1-a*0.2), 0, 1); L = luma(a)
    if p['contrast']:
        a = np.clip(0.5 + (a-0.5)*(1 + p['contrast']*0.55), 0, 1)
    if p['brightness']:
        a = np.clip(a, 1e-6, 1) ** (1 - p['brightness']*0.45)
    if p['black_point']:
        bp = p['black_point']*0.14
        a = np.clip((a-bp)/(1-bp), 0, 1) if bp > 0 else np.clip(a*(1+bp) - bp, 0, 1)
    if p['definition']:
        lo = blur(a, 22)
        m = np.clip(1 - np.abs(luma(a)-0.5)*1.6, 0, 1)
        a = np.clip(a + (a-lo)*p['definition']*1.4*m, 0, 1)

    # 스플릿 토닝 — 아이폰에 없다. (색상 각도, 강도 0..100)
    L = luma(a)
    if split_shadow:
        h, amt = split_shadow
        a = np.clip(a + (hue_rgb(h)-0.5)*(amt/100.0)*(1-L)**1.6, 0, 1)
    if split_high:
        h, amt = split_high
        a = np.clip(a + (hue_rgb(h)-0.5)*(amt/100.0)*L**1.6, 0, 1)

    g = luma(a)
    if p['saturation']:
        a = np.clip(g + (a-g)*(1 + p['saturation']), 0, 1); g = luma(a)
    if p['vibrance']:
        s = (a.max(axis=2)-a.min(axis=2))[...,None]
        a = np.clip(g + (a-g)*(1 + p['vibrance']*(1-np.clip(s*1.8,0,1))), 0, 1)

    # 색상별 채도 — 아이폰에 없다. [(중심각, 폭, 증감)]
    if hue_sat:
        hdeg = hue_deg(a)
        for center, width, amt in hue_sat:
            dd = np.abs((hdeg - center + 180) % 360 - 180)
            w = np.clip(1 - dd/width, 0, 1)[...,None]
            g = luma(a)
            a = np.clip(a + w*((a-g)*(amt/100.0)), 0, 1)

    if p['bloom']:
        br = blur(a, 28)
        m = np.clip((luma(a)-0.6)/0.4, 0, 1)
        a = np.clip(a + br*m*p['bloom'], 0, 1)
    if p['vignette']:
        h_, w_ = a.shape[:2]
        yy, xx = np.mgrid[0:h_, 0:w_]
        r = np.sqrt(((xx-w_/2)/(w_/2))**2 + ((yy-h_/2)/(h_/2))**2)
        a = np.clip(a*(1 - p['vignette']*0.55*np.clip(r-0.45,0,None)[...,None]), 0, 1)
    if p['grain']:
        n = (grain_noise(*a.shape[:2]) * (p['grain']*0.06))[...,None]
        a = np.clip(a + n*(1 - np.abs(luma(a)-0.5)*1.2), 0, 1)

    return Image.fromarray((np.clip(a,0,1)*255+0.5).astype(np.uint8))


PRESETS = {
 '01-oslo':      dict(warmth=-42, tint=8,  exposure=-14, contrast=-6, shadows=-4,
                      black_point=6, saturation=-24, definition=4, grain=14,
                      split_shadow=(225, 26), split_high=(215, 12)),
 '02-sapporo':   dict(warmth=-12, tint=-4, exposure=26, brilliance=22, highlights=-20,
                      contrast=10, black_point=2, saturation=-40, definition=6,
                      split_shadow=(205, 9)),
 '03-seoul':     dict(warmth=6,   tint=-8, contrast=26, black_point=12, shadows=-8,
                      saturation=-34, vibrance=22, definition=22,
                      split_high=(225, 12), hue_sat=[(52,45,30),(215,45,34)]),
 '04-tokyo':     dict(warmth=8,   tint=9,  exposure=16, brilliance=14, highlights=-20,
                      contrast=-12, shadows=14, saturation=-2, vibrance=14, definition=-10,
                      grain=8, split_high=(345, 6)),
 '05-santorini': dict(warmth=-14, tint=-4, exposure=10, contrast=26, black_point=12,
                      highlights=-10, saturation=16, vibrance=20, definition=18,
                      split_high=(195, 8), hue_sat=[(195,55,40),(52,40,-45)]),
 '06-lisbon':    dict(warmth=30,  tint=4,  contrast=12, highlights=10, shadows=-8,
                      black_point=6, vibrance=16, definition=8, vignette=10,
                      split_shadow=(220, 14), split_high=(45, 20)),
 '07-havana':    dict(warmth=14,  tint=-6, contrast=-18, shadows=20, black_point=-24,
                      saturation=-20, definition=-6, grain=18,
                      split_shadow=(188, 16), split_high=(30, 12)),
 '08-seattle':   dict(warmth=-26, tint=10, exposure=10, brilliance=12, contrast=-24,
                      shadows=16, black_point=-10, saturation=-28, definition=-8,
                      split_shadow=(205, 22), split_high=(210, 10)),
 '09-paris':     dict(warmth=10,  tint=20, contrast=-10, shadows=12, black_point=-6,
                      saturation=-18, vibrance=10, vignette=22, grain=20,
                      split_shadow=(285, 18), split_high=(350, 12)),
 '10-marrakesh': dict(warmth=44,  tint=-6, contrast=14, black_point=16, highlights=6,
                      saturation=8,  vibrance=12, vignette=18,
                      split_shadow=(15, 10), split_high=(35, 22)),
 '11-hongkong':  dict(warmth=-18, tint=26, contrast=20, black_point=8, highlights=14,
                      saturation=22, definition=12, vignette=14, bloom=26,
                      split_shadow=(190, 22), split_high=(320, 20)),
 '12-reykjavik': dict(warmth=-2, exposure=-8, contrast=-4, shadows=-6, black_point=8,
                      saturation=-66, definition=-4, grain=12,
                      split_shadow=(190, 10)),
}

if __name__ == '__main__':
    import sys, pathlib
    src = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else 'base/01-base-outdoor.png')
    out = pathlib.Path('graded')/src.stem; out.mkdir(parents=True, exist_ok=True)
    img = Image.open(src).convert('RGB')
    img.save(out/'00-original.jpg', quality=92)
    for name, p in PRESETS.items():
        grade(img, **p).save(out/f'{name}.jpg', quality=92)
    print('완료', len(PRESETS))

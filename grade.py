"""도시 프리셋 12종 — 값의 정본.

아이폰 '사진' 앱의 슬라이더 어휘를 쓰되 거기 없는 것까지 더 쓴다.
- 아이폰에 있는 것: 노출·브릴리언스·하이라이트·그림자·대비·밝기·블랙포인트·
  채도·생동감·온도·색조·명료도·비네트  (전부 -100..+100)
- 아이폰에 없는 것: 스플릿 토닝(그림자/하이라이트 색상과 강도), 그레인, 블룸, 색상별 채도

사진 아래에 찍는 값이 곧 이 값이다. 지어낸 숫자가 아니다.
"""
import numpy as np, colorsys
from PIL import Image, ImageFilter

def srgb2lin(x): return np.where(x <= 0.04045, x/12.92, ((x+0.055)/1.055)**2.4)
def lin2srgb(x):
    x = np.clip(x, 0, 1)
    return np.where(x <= 0.0031308, x*12.92, 1.055*x**(1/2.4) - 0.055)
def luma(a): return (0.2126*a[...,0] + 0.7152*a[...,1] + 0.0722*a[...,2])[...,None]
def hue_rgb(deg): return np.array(colorsys.hsv_to_rgb(deg/360.0, 1.0, 1.0))

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
        blur = np.asarray(Image.fromarray((a*255).astype(np.uint8))
                          .filter(ImageFilter.GaussianBlur(22)), dtype=np.float64)/255.0
        m = np.clip(1 - np.abs(luma(a)-0.5)*1.6, 0, 1)
        a = np.clip(a + (a-blur)*p['definition']*1.4*m, 0, 1)

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
        hsv = np.asarray(Image.fromarray((a*255).astype(np.uint8)).convert('HSV'), dtype=np.float64)
        for center, width, amt in hue_sat:
            dd = np.abs(((hsv[...,0]*360/255) - center + 180) % 360 - 180)
            w = np.clip(1 - dd/width, 0, 1)[...,None]
            g = luma(a)
            a = np.clip(a + w*((a-g)*(amt/100.0)), 0, 1)

    if p['bloom']:
        br = np.asarray(Image.fromarray((a*255).astype(np.uint8))
                        .filter(ImageFilter.GaussianBlur(28)), dtype=np.float64)/255.0
        m = np.clip((luma(a)-0.6)/0.4, 0, 1)
        a = np.clip(a + br*m*p['bloom'], 0, 1)
    if p['vignette']:
        h_, w_ = a.shape[:2]
        yy, xx = np.mgrid[0:h_, 0:w_]
        r = np.sqrt(((xx-w_/2)/(w_/2))**2 + ((yy-h_/2)/(h_/2))**2)
        a = np.clip(a*(1 - p['vignette']*0.55*np.clip(r-0.45,0,None)[...,None]), 0, 1)
    if p['grain']:
        rng = np.random.default_rng(7)
        n = rng.normal(0, p['grain']*0.06, a.shape[:2])[...,None]
        a = np.clip(a + n*(1 - np.abs(luma(a)-0.5)*1.2), 0, 1)

    return Image.fromarray((np.clip(a,0,1)*255+0.5).astype(np.uint8))


PRESETS = {
 '01-oslo':      dict(warmth=-30, tint=6,  exposure=6,  contrast=-22, shadows=20,
                      black_point=-12, saturation=-30, definition=-8, grain=14,
                      split_shadow=(212, 20), split_high=(205, 8)),
 '02-sapporo':   dict(warmth=-10, tint=-4, exposure=22, brilliance=18, highlights=-16,
                      contrast=10, black_point=4, saturation=-28, definition=6,
                      split_shadow=(205, 7)),
 '03-seoul':     dict(warmth=6,   tint=-8, contrast=22, black_point=10, shadows=-6,
                      saturation=-8, vibrance=34, definition=16,
                      split_high=(220, 10), hue_sat=[(52,45,60),(215,45,35)]),
 '04-tokyo':     dict(warmth=8,   tint=14, exposure=16, brilliance=14, highlights=-20,
                      contrast=-12, shadows=14, saturation=-12, definition=-10, grain=8,
                      split_high=(345, 10)),
 '05-santorini': dict(warmth=-14, tint=-4, exposure=10, contrast=26, black_point=12,
                      highlights=-10, saturation=16, vibrance=20, definition=18,
                      split_high=(195, 8), hue_sat=[(195,55,40),(52,40,-45)]),
 '06-lisbon':    dict(warmth=30,  tint=4,  contrast=12, highlights=10, shadows=-8,
                      black_point=6, vibrance=16, definition=8, vignette=10,
                      split_shadow=(220, 14), split_high=(45, 20)),
 '07-havana':    dict(warmth=16,  tint=-10, contrast=-20, shadows=24, black_point=-20,
                      saturation=-22, definition=-6, grain=18,
                      split_shadow=(185, 20), split_high=(30, 13)),
 '08-seattle':   dict(warmth=-26, tint=8,  exposure=-6, contrast=-30, shadows=16,
                      black_point=-10, saturation=-38, definition=-12,
                      split_shadow=(215, 18), split_high=(210, 8)),
 '09-paris':     dict(warmth=10,  tint=20, contrast=-10, shadows=12, black_point=-6,
                      saturation=-18, vibrance=10, vignette=22, grain=20,
                      split_shadow=(285, 18), split_high=(350, 12)),
 '10-marrakesh': dict(warmth=44,  tint=-6, contrast=14, black_point=16, highlights=6,
                      saturation=8,  vibrance=12, vignette=18,
                      split_shadow=(15, 10), split_high=(35, 22)),
 '11-hongkong':  dict(warmth=-18, tint=26, contrast=20, black_point=8, highlights=14,
                      saturation=22, definition=12, vignette=14, bloom=26,
                      split_shadow=(190, 22), split_high=(320, 20)),
 '12-reykjavik': dict(warmth=-12, contrast=-8, shadows=10, black_point=-4,
                      saturation=-62, definition=-6, grain=12,
                      split_shadow=(190, 15)),
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

"""사진 아래에 적용값 스트립을 붙인다. 찍히는 값은 grade.py 의 실제 값이다."""
from PIL import Image, ImageDraw, ImageFont
import pathlib
from grade import PRESETS

CITY = {'01-oslo':'OSLO','02-sapporo':'SAPPORO','03-seoul':'SEOUL','04-tokyo':'TOKYO',
        '05-santorini':'SANTORINI','06-lisbon':'LISBON','07-havana':'HAVANA',
        '08-seattle':'SEATTLE','09-paris':'PARIS','10-marrakesh':'MARRAKESH',
        '11-hongkong':'HONG KONG','12-reykjavik':'REYKJAVIK'}
MOOD = {'01-oslo':'Winter dawn','02-sapporo':'Winter clear','03-seoul':'Autumn clear',
        '04-tokyo':'Spring bloom','05-santorini':'Summer noon','06-lisbon':'Late afternoon',
        '07-havana':'Faded sun','08-seattle':'Overcast rain','09-paris':'Dusk',
        '10-marrakesh':'Desert sunset','11-hongkong':'Neon night','12-reykjavik':'Winter grey'}
ORDER = ['exposure','brilliance','highlights','shadows','contrast','brightness',
         'black_point','saturation','vibrance','warmth','tint','definition','vignette']
ABBR = {'exposure':'EXP','brilliance':'BRIL','highlights':'HIGH','shadows':'SHAD',
        'contrast':'CONT','brightness':'BRGT','black_point':'BLACK','saturation':'SAT',
        'vibrance':'VIB','warmth':'WARM','tint':'TINT','definition':'DEF','vignette':'VIGN'}
INK, PAPER, DIM, FAINT = (20,23,26), (237,232,223), (170,166,158), (112,109,103)

def lines(name):
    p = PRESETS[name]
    a = '  '.join(f'{ABBR[k]} {p[k]:+d}' for k in ORDER if p.get(k))
    ex = []
    if p.get('split_shadow'): ex.append('SPLIT·S {}°/{}'.format(*p['split_shadow']))
    if p.get('split_high'):   ex.append('SPLIT·H {}°/{}'.format(*p['split_high']))
    if p.get('grain'):        ex.append(f"GRAIN {p['grain']}")
    if p.get('bloom'):        ex.append(f"BLOOM {p['bloom']}")
    if p.get('hue_sat'):      ex.append('HSL ' + ' '.join(f'{c}°{amt:+d}' for c,_,amt in p['hue_sat']))
    return a, '   '.join(ex)

def frame(img_path, name, out_path):
    im = Image.open(img_path).convert('RGB'); W, H = im.size
    band = int(H*0.175)
    cv = Image.new('RGB', (W, H+band), INK); cv.paste(im, (0,0)); d = ImageDraw.Draw(cv)
    serif = ImageFont.truetype('/System/Library/Fonts/Supplemental/Didot.ttc', int(band*0.34))
    sub   = ImageFont.truetype('/System/Library/Fonts/Supplemental/Didot.ttc', int(band*0.145))
    mono  = ImageFont.truetype('/System/Library/Fonts/Menlo.ttc', int(band*0.108))
    tiny  = ImageFont.truetype('/System/Library/Fonts/Menlo.ttc', int(band*0.088))
    pad = int(W*0.045)
    title = ' '.join(CITY[name])
    d.text((pad, H+int(band*0.14)), title, font=serif, fill=PAPER)
    tw = d.textlength(title, font=serif)
    d.text((pad+tw+int(W*0.028), H+int(band*0.30)), MOOD[name], font=sub, fill=DIM)
    l1, l2 = lines(name)
    # 값 줄이 폭을 넘으면 글자를 줄인다. 잘려 나가면 값이 거짓이 된다.
    avail = W - pad*2
    size = int(band*0.108)
    while size > int(band*0.070):
        f = ImageFont.truetype('/System/Library/Fonts/Menlo.ttc', size)
        if max(d.textlength(l1, font=f), d.textlength(l2, font=f)) <= avail:
            break
        size -= 1
    mono = ImageFont.truetype('/System/Library/Fonts/Menlo.ttc', size)
    assert max(d.textlength(l1, font=mono), d.textlength(l2, font=mono)) <= avail, \
        f'{name}: 값 줄이 폭을 넘는다'
    d.text((pad, H+int(band*0.575)), l1, font=mono, fill=DIM)
    d.text((pad, H+int(band*0.725)), l2, font=mono, fill=DIM)
    d.text((pad, H+int(band*0.875)), 'CITY FILTER 12  ·  actual applied values', font=tiny, fill=FAINT)
    cv.save(out_path, quality=93)

if __name__ == '__main__':
    src = pathlib.Path('graded/01-base-outdoor')
    out = pathlib.Path('framed'); out.mkdir(exist_ok=True)
    for n in PRESETS:
        frame(src/f'{n}.jpg', n, out/f'{n}.jpg')
        a,b = lines(n); print(f'{n}\n  {a}\n  {b}')

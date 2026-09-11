"""사진에 흰 테두리를 두르고 아래에 적용값을 작게 찍는다.

찍히는 값은 지어낸 것이 아니라 grade.py 의 실제 값이다. frame.py 가 거기서 읽어 온다.
흰 테두리에 활자. 손글씨안도 만들어 봤지만 값을 읽기 어려워 쓰지 않기로 했다.
"""
from PIL import Image, ImageDraw, ImageFont
import pathlib
from grade import PRESETS

CITY = {'01-oslo':'Oslo','02-sapporo':'Sapporo','03-seoul':'Seoul','04-tokyo':'Tokyo',
        '05-santorini':'Santorini','06-lisbon':'Lisbon','07-havana':'Havana',
        '08-seattle':'Seattle','09-paris':'Paris','10-marrakesh':'Marrakesh',
        '11-hongkong':'Hong Kong','12-reykjavik':'Reykjavik'}
MOOD = {'01-oslo':'winter dawn','02-sapporo':'winter clear','03-seoul':'autumn clear',
        '04-tokyo':'spring bloom','05-santorini':'summer noon','06-lisbon':'late afternoon',
        '07-havana':'faded sun','08-seattle':'overcast rain','09-paris':'dusk',
        '10-marrakesh':'desert sunset','11-hongkong':'neon night','12-reykjavik':'winter grey'}
ORDER = ['exposure','brilliance','highlights','shadows','contrast','brightness',
         'black_point','saturation','vibrance','warmth','tint','definition','vignette']
ABBR = {'exposure':'Exp','brilliance':'Bril','highlights':'High','shadows':'Shad',
        'contrast':'Cont','brightness':'Brgt','black_point':'Black','saturation':'Sat',
        'vibrance':'Vib','warmth':'Warm','tint':'Tint','definition':'Def','vignette':'Vign'}

PAPER = (252, 251, 249)      # 순백보다 살짝 따뜻한 종이색
INK   = (38, 40, 43)
GREY  = (122, 124, 128)

NAME_FONT = '/System/Library/Fonts/Supplemental/Didot.ttc'
DATA_FONT = '/System/Library/Fonts/Menlo.ttc'
SEP = ' · '

def value_lines(name):
    p = PRESETS[name]
    items = [f'{ABBR[k]} {p[k]:+d}' for k in ORDER if p.get(k)]
    if p.get('split_shadow'): items.append('Split S {}°/{}'.format(*p['split_shadow']))
    if p.get('split_high'):   items.append('Split H {}°/{}'.format(*p['split_high']))
    if p.get('grain'):        items.append(f"Grain {p['grain']}")
    if p.get('bloom'):        items.append(f"Bloom {p['bloom']}")
    if p.get('hue_sat'):      items += [f'HSL {c}°{amt:+d}' for c,_,amt in p['hue_sat']]
    # 두 줄로 반씩 나눈다. 한 줄이 길어지면 글자만 작아져 읽히지 않는다.
    half = (len(items)+1)//2
    return SEP.join(items[:half]), SEP.join(items[half:])

def frame(img_path, name, out_path):
    im = Image.open(img_path).convert('RGB')
    W, H = im.size
    side = int(W*0.075)                 # 좌우·위 여백
    bottom = int(W*0.30)                # 아래 여백은 더 넓게 — 글자가 들어간다
    cv = Image.new('RGB', (W+side*2, H+side+bottom), PAPER)
    cv.paste(im, (side, side))
    d = ImageDraw.Draw(cv)

    nf = ImageFont.truetype(NAME_FONT, int(W*0.040))
    mf = ImageFont.truetype(NAME_FONT, int(W*0.020))
    y = side + H + int(W*0.055)
    title = CITY[name]
    d.text((side, y), title, font=nf, fill=INK)
    tw = d.textlength(title, font=nf)
    d.text((side+tw+int(W*0.018), y+int(W*0.018)), MOOD[name], font=mf, fill=GREY)

    # 값 — 작게. 폭을 넘으면 줄인다. 잘린 값은 틀린 값이다.
    l1, l2 = value_lines(name)
    avail = W
    size = int(W*0.0165)
    while size > int(W*0.0090):
        f = ImageFont.truetype(DATA_FONT, size)
        if max(d.textlength(l1, font=f), d.textlength(l2, font=f)) <= avail:
            break
        size -= 1
    df = ImageFont.truetype(DATA_FONT, size)
    assert max(d.textlength(l1, font=df), d.textlength(l2, font=df)) <= avail, f'{name}: 값 줄이 넘친다'
    ly = side + H + int(W*0.150)
    d.text((side, ly), l1, font=df, fill=GREY)
    d.text((side, ly + int(size*1.75)), l2, font=df, fill=GREY)
    cv.save(out_path, quality=94)

if __name__ == '__main__':
    import sys
    bases = sys.argv[1:] or ['01-base-outdoor']
    for base in bases:
        src = pathlib.Path('graded')/base
        out = pathlib.Path('framed')/base; out.mkdir(parents=True, exist_ok=True)
        for n in PRESETS:
            frame(src/f'{n}.jpg', n, out/f'{n}.jpg')
        print(base, '완료')

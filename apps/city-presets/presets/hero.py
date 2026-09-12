"""팔레트마다 짝지은 사진 한 장에 그 프리셋만 걸어 대표 이미지를 만든다.

`hero/<프리셋이름>.png` 이 입력이다. 파일 이름이 곧 어느 프리셋을 걸지를 정한다.
검수용 기준 사진(`base/`)과는 쓰임이 다르다 — 이쪽은 파는 물건의 얼굴이다.
"""
import pathlib
from PIL import Image
from grade import grade, PRESETS
import frame as F

HERO = pathlib.Path('hero')
GRADED = pathlib.Path('hero-graded')
FRAMED = pathlib.Path('hero-framed')

def build():
    GRADED.mkdir(exist_ok=True); FRAMED.mkdir(exist_ok=True)
    made = []
    for name, params in PRESETS.items():
        src = HERO/f'{name}.png'
        if not src.exists():
            print('없음', name); continue
        g = GRADED/f'{name}.jpg'
        grade(Image.open(src).convert('RGB'), **params).save(g, quality=93)
        F.frame(g, name, FRAMED/f'{name}.jpg')
        made.append(name)
    return made

def contact_sheet(made):
    from PIL import ImageDraw
    ims = [Image.open(FRAMED/f'{n}.jpg').convert('RGB') for n in made]
    W = 430
    ims = [im.resize((W, int(im.height*W/im.width)), Image.LANCZOS) for im in ims]
    CH = ims[0].height; g = 10; cols = 4
    rows = (len(ims)+cols-1)//cols
    sheet = Image.new('RGB', (cols*W+(cols+1)*g, rows*CH+(rows+1)*g), (24,26,28))
    for i, im in enumerate(ims):
        r, c = divmod(i, cols)
        sheet.paste(im, (g+c*(W+g), g+r*(CH+g)))
    sheet.save(FRAMED/'contact-sheet.jpg', quality=88)
    return sheet.size

if __name__ == '__main__':
    made = build()
    print('완료', len(made), '장 ·', contact_sheet(made))

"""데모 이미지를 웹이 쓸 크기로 줄여 `../public/demo/` 에 넣는다.

입력은 `hero/`(원본)와 `hero-graded/`(프리셋 적용본)다. 뒤쪽은 `hero.py` 가 만든다.
출력은 저장소에 커밋한다 — 다른 생성물과 다르게 사이트가 빌드될 때 있어야 하고,
빌드 기계에 파이썬과 원본 PNG 80MB 를 두지 않기 위해서다.
"""
import pathlib, sys
from PIL import Image

W = 860  # 모바일 폭 430 의 2배
THUMB = 176  # 도시 고르는 줄의 88px 썸네일, 2배
OUT = pathlib.Path('../public/demo')
PAIRS = (('hero', 'before'), ('hero-graded', 'after'))

def main():
    OUT.mkdir(parents=True, exist_ok=True)
    made = []
    for src_dir, suffix in PAIRS:
        for src in sorted(pathlib.Path(src_dir).iterdir()):
            if src.suffix not in ('.png', '.jpg'):
                continue
            im = Image.open(src).convert('RGB')
            im = im.resize((W, round(im.height * W / im.width)), Image.LANCZOS)
            dst = OUT / f'{src.stem}-{suffix}.webp'
            im.save(dst, 'WEBP', quality=80, method=6)
            made.append(dst)
    # 도시 고르는 줄에 쓰는 정사각 썸네일. 가운데를 잘라 낸다
    for src in sorted(pathlib.Path('hero-graded').iterdir()):
        if src.suffix not in ('.png', '.jpg'):
            continue
        im = Image.open(src).convert('RGB')
        side = min(im.size)
        box = ((im.width - side) // 2, (im.height - side) // 2)
        im = im.crop((box[0], box[1], box[0] + side, box[1] + side))
        im = im.resize((THUMB, THUMB), Image.LANCZOS)
        dst = OUT / f'{src.stem}-thumb.webp'
        im.save(dst, 'WEBP', quality=82, method=6)
        made.append(dst)

    total = sum(p.stat().st_size for p in made)
    print(f'{len(made)}장 · {total/1024/1024:.1f}MB · 장당 평균 {total/len(made)/1024:.0f}KB')
    if not made:
        sys.exit('만든 것이 없다. hero.py 를 먼저 돌렸는지 확인한다')

if __name__ == '__main__':
    main()

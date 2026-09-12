# city-presets

사진 한 장에 열두 가지 색을 거는 프리셋 묶음. 도시 이름은 찍을 장소가 아니라 **색의 이름**이다.
브라우저에서 도는 도구로 만드는 중이고, 계산은 사용자 기기 안에서만 돈다.

기획과 실행 계획은 [`docs/`](docs/) 에 있다 — [PRD](docs/PRD.md) 와 [GOAL](docs/GOAL.md).

## 파일

| 경로                            | 무엇                                                                    |
| ------------------------------- | ----------------------------------------------------------------------- |
| `presets/grade.py`              | **값의 정본.** 열두 개의 슬라이더 값과 적용 순서                        |
| `presets/frame.py`              | 사진 아래에 흰 테두리와 적용값 스트립을 붙인다                          |
| `presets/hero.py`               | 팔레트마다 짝지은 사진 한 장에 그 프리셋만 걸어 대표 이미지를 만든다    |
| `presets/web_assets.py`         | 데모 이미지를 웹 크기로 줄여 `public/demo/` 에 넣는다                   |
| `presets/export_values.py`      | 값을 `src/shared/preset-values.ts` 로 내보낸다. 손으로 옮겨 적지 않는다 |
| `presets/compare.py`            | 두 이미지가 같은지 판정한다 (평균 절대차·1레벨 초과 비율)               |
| `presets/distance.py`           | 열두 개가 서로 갈리는지 66쌍 거리로 판정한다                            |
| `presets/base/`                 | 기준 사진 여섯 장. 아래 표 참조                                         |
| `presets/hero/`                 | 팔레트별 대표 사진 12장. 파일 이름이 어느 프리셋을 걸지를 정한다        |
| `presets/reference/prompts.tsv` | 초기 레퍼런스 이미지를 만든 프롬프트. 기록용                            |
| `public/demo/`                  | 화면이 쓰는 데모 36장. **생성물이지만 커밋한다**                        |
| `src/shared/grade-gl.ts`        | `grade.py` 를 옮긴 WebGL2 셰이더. 브라우저의 계산 전부                  |
| `src/app/verify/`               | 셰이더가 파이썬과 같은 그림을 내는지 판정하는 화면                      |

## 돌리는 법

브라우저 쪽은 저장소 어디서든 돈다.

```bash
pnpm --filter city-presets dev     # http://localhost:3002
```

파이썬 쪽은 `presets/` 안에서 돌린다. 경로가 전부 현재 디렉터리 기준이다.

```bash
cd presets
python3 grade.py base/01-base-outdoor.png        # graded/<원본이름>/ 에 12장 (검수용)
python3 frame.py 01-base-outdoor 04-base-flowers # framed/<원본이름>/ 에 흰 테두리 + 값
python3 hero.py                                  # hero-graded/ · hero-framed/ 에 12장씩
python3 web_assets.py                            # public/demo/ 에 웹용 36장
```

`web_assets.py` 는 `hero.py` 가 만든 `hero-graded/` 를 읽으므로 그 뒤에 돌린다.
`public/demo/` 만 다른 생성물과 달리 커밋한다 — 사이트가 빌드될 때 있어야 하고,
빌드 기계에 파이썬과 원본 PNG 80MB 를 두지 않기 위해서다.

`graded/` · `framed/` · `hero-graded/` · `hero-framed/` 는 커밋하지 않는다. 위 세 줄로 다시 나온다.
커밋하는 것은 입력(`presets/base/`·`presets/hero/`)과 코드뿐이다. 생성 모델은 같은 프롬프트로 같은 그림을 다시
주지 않으므로 입력은 보관하고, 계산으로 나오는 것은 보관하지 않는다.

## 셰이더가 파이썬과 같은지 판정하기

브라우저 구현은 `presets/grade.py` 를 옮겨 담은 것이다. 같은 그림이 나오는지는
`/verify` 가 기계로 판정한다. 기준은 [GOAL](docs/GOAL.md) 3절 — 평균 절대차 0.5 레벨 미만,
1레벨 초과 픽셀 1% 미만, 여섯 원본 × 12 프리셋 = **72장 전수**.

기준 이미지는 커밋하지 않는다(479MB). 돌리기 전에 만든다.

```bash
cd presets
python3 - <<'EOF'
import pathlib, sys; sys.path.insert(0, '.')
from PIL import Image
from grade import grade, PRESETS
out = pathlib.Path('../public/.verify'); out.mkdir(parents=True, exist_ok=True)
for b in sorted(pathlib.Path('base').glob('*.png')):
    im = Image.open(b).convert('RGB')
    im.save(out / b.name)
    for name, params in PRESETS.items():
        grade(im, **params).save(out / f'{b.stem}__{name}.png')
EOF
cd .. && pnpm dev    # http://localhost:3002/verify 에서 「72장 판정」
```

**값을 고치면 생성물도 전부 다시 뽑는다.** `hero.py` → `web_assets.py` → `export_values.py` 순이다.
그러지 않으면 화면의 데모와 실제로 걸리는 색이 갈린다.

## 값을 고칠 때

**`presets/grade.py` 의 `PRESETS` 만 고친다.** 사진 아래 찍히는 숫자는 `presets/frame.py` 가 거기서 읽어 오므로
따로 고칠 곳이 없다. 값과 화면이 어긋날 자리를 만들지 않는다.

고친 뒤에는 열두 개가 여전히 서로 갈리는지 확인한다. 판정 방법은 PRD 의
`열두 개가 정말 열두 개인지 검사한다` 에 있다.

## 기준 사진

한 장으로는 열두 개를 다 판정할 수 없다. 사진마다 없는 것이 있고, 없는 것은 검사되지 않는다.

| 파일                   | 무엇을 검사하나                                                          |
| ---------------------- | ------------------------------------------------------------------------ |
| `01-base-outdoor.png`  | 지상 승강장, 맑은 날. 하늘·자연광·초록. **주 기준**                      |
| `00-base.png`          | 지하 승강장, 형광등. 인공광 화이트밸런스와 깊은 그림자                   |
| `02-base-cafe.png`     | 카페 테이블. 실내 따뜻한 빛, 흰 도자기, 피부                             |
| `03-base-cat.png`      | 고양이 근접. 털 질감과 역광. 원본 채도가 27.9 로 가장 낮다               |
| `04-base-flowers.png`  | 꽃 시장. 원본 채도 88.4. **색상별 조작(HSL)은 여기서만 제대로 드러난다** |
| `05-base-platform.png` | 클래식 승강장. 붉은 벽돌과 초록 주철, 흐린 날                            |

꽃 시장을 넣기 전에는 HSL 이 검사된 적이 없었다. 서울의 노랑 강조가 은행잎 한 그루에는 맞지만
노랑이 화면 절반인 사진에서는 타 버린다는 것을 여기서 처음 봤다.

## 대표 이미지(`presets/hero/`)를 고르는 기준

검수용 기준 사진과 기준이 다르다. 기준 사진은 **열두 개를 전부 드러내는** 한 장이고,
대표 이미지는 **그 프리셋 하나가 가장 잘 사는** 사진이다.

**프리셋이 할 일이 남아 있는 사진을 고른다.** 처음 삿포로에 서리 결정 접사를 썼다가 바꿨다 —
원본이 이미 희고 채도가 낮아 채도를 빼는 프리셋이 할 일이 없었고, 적용 전후가 거의 같았다.
자작나무 숲으로 바꾸니 갈색 나무껍질과 마른 잎이 빠지고 눈이 중성 흰색으로 서면서
밝기 +9.8 · 채도 -13.7 의 변화가 생겼다.

**유적지와 글자를 넣지 않는다.** 생성 모델이 특정 건축물과 한글 간판을 정확히 그리지 못해
엉뚱한 나라의 글자가 섞인다. 얼굴도 알아볼 수 있게 넣지 않는다.

---
name: handwork-hero-image
description: handwork 의 글에 히어로 이미지를 만들어 붙인다. Cases 와 Labs 는 화풍이 다르므로 컬렉션을 먼저 가른다. "이미지 만들어줘", "썸네일 만들어줘", "히어로 넣어줘", "카드 그림이 비었다", "글에 이미지 추가", "hero image", "/handwork-hero-image" 라고 하거나 `apps/handwork/content/` 에 글을 새로 발행한 직후에 실행한다.
---

# handwork 히어로 이미지

카드에 그림이 없으면 `CardGlyph` 가 slug 로 만든 도형을 그린다. 목록에서 그 자리만 비어 보인다.

**시작 전에 컬렉션부터 가른다.** Cases 와 Labs 는 화풍이 아예 다르다. 섞으면 목록에서 바로 티가 난다.

## 0. 유료다 — 프롬프트를 먼저 보여준다

`higgsfield` 로 만든다. `gpt_image_2` 1장에 **6.5 크레딧**이다.

```bash
higgsfield account status      # 잔액 확인
```

**프롬프트를 먼저 보여주고 승인을 받는다.** 크레딧을 쓰기 전에 멈춘다. 여러 장이면 장수와 합계를 같이 적는다.

## 1. 어디에 무엇이 들어가는가

| 컬렉션 | 카드가 그림을 어디서 찾나 | 파일 위치 | 화풍 |
| --- | --- | --- | --- |
| `cases` | **본문 첫 이미지** (`readFirstImage`) | `public/blog/*.jpg` | 무광 3D 렌더 |
| `labs` | **본문 첫 이미지** | `public/labs/*.jpg` | 플랫 벡터 |
| `works` | `meta.thumbnail` 키 | `public/thumbnails/works/*.jpg` | 무광 3D 렌더 |

표 1. 컬렉션별 그림의 자리와 화풍

**`cases` 와 `labs` 에는 `thumbnail` 키를 쓰지 않는다.** 두 컬렉션 전체가 본문 첫 이미지를 쓰고 있다. 키를 새로 만들면 그 글만 규칙이 달라진다.

규격은 셋 다 같다. **1600×904 (16:9), JPEG 품질 85, 120~140KB.**

## 2. Cases — 무광 3D 렌더

크림 배경 위에 슬레이트 블루 오브젝트를 놓고 금색 강조를 하나만 둔다.

```
Soft matte 3D render, isometric three-quarter view,
warm off-white background #F7F2E7,
objects in muted slate blue from #6E86A4 to #2E4160,
a single warm gold accent #E2A63F,
soft diffuse light from the upper left casting one long soft shadow to the lower right,
minimal editorial illustration, generous whitespace, centered composition,
no background texture, no people.
Absolutely no letterforms, no readable text, no words, no numbers, no labels, no logos.
```

앞에 **장면 한 줄**을 붙인다. 오브젝트는 2~3개까지다. 변화를 보일 때만 가느다란 남색 곡선 화살표를 하나 넣는다.

## 3. Labs — 플랫 벡터

같은 크림 배경이지만 **3D 가 아니다.** 남색 윤곽선으로 그린 도형에 색을 한두 개만 채운다.

```
Flat vector illustration, strictly two-dimensional, no perspective and no 3D shading,
warm off-white background #FAF6EF,
outlines and strokes #2E4160,
filled shapes in muted sage green #8FAE85,
empty or failed states drawn as outlines only (red #D13B3B when a failure is the subject),
one very soft shadow under the main group,
minimal editorial illustration, flat solid fills only, generous whitespace,
no gradients, no texture, no people, no icons.
Absolutely no letterforms, no readable text, no words, no numbers, no labels, no logos.
```

Labs 그림은 **다이어그램에 가깝다.** 채워진 것과 빈 것의 대비로 상태를 말한다 — 통과와 미통과, 있는 것과 없는 것.

## 4. 장면을 고르는 법

**글의 핵심 장면 하나를 추상 도형으로 옮긴다.** 주제와 무관한 장식은 안 넣느니만 못하다.

| 글이 말하는 것 | 그림으로 |
| --- | --- |
| 짧은 것이 계속 소모되고 긴 것이 새것을 만든다 | 얇은 원판 셋과 틈이 있는 상자, 상자에서 나온 화살표 |
| 순서대로 올라가 마지막에 하나가 선다 | 계단 아홉 칸과 맨 위의 금색 정육면체 |
| 화면에서 값을 떼어 견본으로 만든다 | 세워진 판의 버튼에서 뻗은 선과 바닥의 원반 셋 |
| 단계마다 통과 조건이 있고 앞쪽만 통과했다 | 한 줄로 늘어선 사각형과 그 아래 채워진 막대·빈 막대 |

표 2. 실제로 만든 장면 넷

## 5. 만드는 절차

```bash
higgsfield generate create gpt_image_2 \
  --prompt "<장면 한 줄 + 위의 화풍 블록>" \
  --aspect-ratio 16:9 --quality high --resolution 2k \
  --wait --wait-timeout 8m
# → result URL 이 찍힌다

curl -s -o hero.png "<URL>"                                  # 2688×1520 / 2~4MB
sips -Z 1600 hero.png --out hero-w.png
sips -s format jpeg -s formatOptions 85 hero-w.png --out <파일명>.jpg   # 약 130KB
```

파일명은 컬렉션 관례를 따른다. `labs` 는 `czNN` 이 curvez 연재 묶음이므로 **그 연재가 아니면 slug 를 줄인 이름**을 쓴다.

본문 맨 위, `meta` 블록 바로 아래에 넣는다.

```markdown
export const meta = { … };

![무엇이 보이는지 한국어로](/labs/design-order.jpg)

첫 문단이 여기서 시작한다.
```

## 6. alt 에는 보이는 것을 적는다

**제목을 반복하지 않는다.** 그림에 실제로 무엇이 그려져 있는지를 적는다.

| 쓴다 | 쓰지 않는다 |
| --- | --- |
| 남색 윤곽선으로 그린 둥근 사각형 일곱 개가 한 줄로 늘어서 있다 | 아홉 단계를 나타낸 이미지 |
| 앞의 넷은 초록으로 채워져 있고 뒤의 셋은 빈 윤곽이다 | 설계 순서를 표현한 다이어그램 |

표 3. alt 에 적을 것과 적지 않을 것

## 7. 개수를 정확히 그려 주지 않는다

**요청한 개수와 그려진 개수가 다르다.** 사각형 아홉 개를 요청했더니 일곱 개가 나왔다. 생성 모델이 세는 일을 잘 못한다.

그래서 둘 중 하나로 처리한다.

1. **개수가 뜻을 바꾸지 않으면 그대로 쓴다.** 대신 alt 에는 **실제로 보이는 수**를 적는다
2. 개수가 뜻이면 개수를 말하지 않는 장면으로 바꾼다

개수를 맞추려고 다시 돌리는 것은 권하지 않는다. 한 번에 6.5 크레딧이고 다음 판도 맞는다는 보장이 없다.

## 8. 확인

- [ ] **눈으로 본다.** 파일을 실제로 열어 확인한다. 글자가 들어갔는지, 화풍이 맞는지
- [ ] 글자가 하나라도 보이면 버린다 — 생성 모델이 한글을 깨뜨린다
- [ ] `1600x904` 이고 200KB 미만이다
- [ ] 본문 첫 이미지로 잡히는지 확인한다 — `grep -oE '\(/(blog|labs)/[^)]+\)' <원고> | head -1`
- [ ] 목록과 상세가 둘 다 `200` 이고 카드에 그림이 뜬다
- [ ] 쓴 크레딧을 보고에 적는다

## 9. 하지 않는 것

- **원본 PNG 를 레포에 넣지 않는다.** 2~4MB 다. 변환한 JPEG 만 커밋한다
- **`thumbnail` 키를 cases·labs 에 추가하지 않는다** — 그 두 컬렉션은 본문 첫 이미지를 쓴다
- **기존 글의 본문을 고치지 않는다.** 이미지 한 줄만 더한다
- **승인 없이 다시 돌리지 않는다.** 마음에 안 들면 프롬프트를 고쳐 보여주고 다시 묻는다

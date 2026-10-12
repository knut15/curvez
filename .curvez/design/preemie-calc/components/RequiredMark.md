# component: RequiredMark
purpose: 입력 컴포넌트의 "필수" 표시(시각 별표 + 스크린리더 전용 문구)를 하나의 규칙으로 통일한다. `DateField`, `GestationInput`, `SegmentedControl`, `TextField` 네 곳이 각자 이 표시를 만들었고, 그중 `TextField` 만 스크린리더 문구를 갖고 있어 이미 서로 달라져 있었다(구조 리뷰 DUP-01, 2026-09-29 교정 라운드). 화면에 단독으로 배치되지 않고 위 네 컴포넌트의 레이블 안에서만 쓰인다. 2026-09-29 재리뷰에서 sr-only 문구가 레이블 텍스트를 다시 담아 접근성 이름에 레이블이 두 번 들어가는 결함이 드러나(구조 리뷰 DSG-04) 이 문서에서 sr-only 문구를 접미사 형태로 고쳤다
쓰이는 화면: input, input-weeks(DateField·GestationInput·SegmentedControl 안에서), dashboard 의 `EditProfileDialog`(TextField 안에서)
요구 ID: PC-NF-A11Y-3

## props
| 이름 | 타입 | 필수 | 기본값 | 의미 |
|---|---|---|---|---|
| label | string | O | — | 마크가 붙는 레이블 텍스트(예: "출생일", "성별", "출생 시 재태주수") |
| required | boolean | O | — | false 면 아무것도 그리지 않는다(레이블 텍스트만 남는다) |

## states
| state | 트리거 | 시각 변화 |
|---|---|---|
| required | required=true | 레이블 텍스트 바로 뒤에 `<span aria-hidden="true"> *</span>`(색 `--color-accent-danger`)를 붙이고, 그 옆에 스크린리더 전용(`sr-only`, 화면에는 보이지 않고 스크린리더만 읽는다) 텍스트로 **접미사 ", 필수"** 만 둔다(레이블 전체를 다시 담지 않는다 — 레이블 텍스트는 이 마크보다 앞에 이미 있으므로 레이블 텍스트를 통째로 다시 sr-only 문구에 쓰면 레이블이 두 번 읽힌다, DSG-04 교정). 시각 별표와 스크린리더 문구 둘 다 필요하다 — 별표만 있으면 스크린리더 사용자가 필수 여부를 놓치고, 문구만 있으면 저시력으로 별표를 기대하는 사용자가 놓친다 |
| optional | required=false | 레이블 텍스트만 보인다. 별표·sr-only 문구 모두 그리지 않는다 |

## 접근성 이름 기대값
- 레이블 텍스트 + 별표(`aria-hidden`, 접근성 이름 계산에서 제외) + sr-only 접미사(", 필수")가 합쳐진 레이블 요소의 접근성 이름은 **레이블 텍스트 뒤에 ", 필수" 가 한 번만 이어진 값** 하나로만 나온다. 레이블이 두 번 들어가지 않는다
- 예: label="출생일" → 접근성 이름 "출생일, 필수". label="성별" → "성별, 필수". label="출생 시 재태주수" → "출생 시 재태주수, 필수"
- 위 두 항목은 레이블 텍스트와 sr-only 접미사가 같은 라벨링 요소(`<label>`, `<legend>`) 안의 텍스트 노드로 나란히 있어 접근성 이름 계산이 이어붙이는 경우에 해당한다(`DateField`, `TextField`, `GestationInput`). `SegmentedControl` 처럼 `aria-label` 속성으로 그룹 레이블 전체를 한 번에 override 하는 경우는 이 접미사 방식을 쓰지 않는다 — `aria-label` 값 자체를 레이블 텍스트 뒤에 ", 필수" 를 붙인 값으로 직접 설정한다(속성값은 하나의 문자열이라 별도 sr-only span 을 이어붙일 수 없다). 자세한 내용은 `components/SegmentedControl.md` 참고

## a11y
- a11y:label — 스크린리더 전용 문구는 텍스트 노드 기반 레이블(`DateField`, `TextField`, `GestationInput`)에서 접미사 ", 필수" 로 고정한다(레이블 텍스트 뒤에 이어 붙는 sr-only 텍스트 노드일 뿐, 레이블 전체를 다시 담지 않는다). 레이블 요소의 접근성 이름(레이블 텍스트 + 이 접미사)은 레이블 텍스트 뒤에 ", 필수" 가 이어진 값이 된다(위 "## 접근성 이름 기대값" 참고). `TextField` 처럼 레이블 자체에 이미 "(선택)" 이 적힌 필드(이름, 출생 체중)는 required=false 라 이 마크가 그려지지 않는다 — "(선택)" 표기와 "*" 표기가 겹치지 않는다
- a11y:focus — 이 마크 자체는 포커스 대상이 아니다(레이블 텍스트의 일부로만 존재한다)
- a11y:contrast — `*` 색 `--color-accent-danger`(#B91C1C) 배경 `--color-bg-surface`(#FFFFFF) = 6.47(tokens.md 대비 검증 표에 이미 있는 조합과 같다)
- a11y:target — 해당 없음(텍스트 마크, 터치 대상이 아니다)
- a11y:role — 해당 없음(순수 텍스트 — `aria-hidden` 별표는 role 이 없고, sr-only 문구는 레이블 요소 안 텍스트 노드일 뿐이다)

## responsive
- 해당 없음 — 텍스트 마크라 화면 폭에 따라 달라지지 않는다

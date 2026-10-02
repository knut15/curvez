# component: ReferenceFooter
purpose: 결과 화면마다 아래에 두는 공통 영역. 근거 자료 출처·기준일과 의료 면책 문구를 함께 보여준다. 화면마다 따로 만들지 않고 하나로 묶는다(PC-NF-MED-1 요구가 모든 결과 화면에 반복되기 때문)
쓰이는 화면: dashboard, age-basis, checkups, copay-relief, correction-period, share, guide, growth, vaccinations, target-height, formula(8차 라운드부터 4개 추가)
요구 ID: PC-NF-MED-1, PC-F3-AC4, PC-F4-AC5, PC-F5-AC5, PC-F15-AC3

## props
| 이름 | 타입 | 필수 | 기본값 | 의미 |
|---|---|---|---|---|
| variant | full \| disclaimer-only | X | full | full=출처 목록+면책 문구. disclaimer-only=면책 문구만(dashboard·share·guide·target-height 처럼 이 화면 자체가 특정 데이터 파일 하나에 묶이지 않는 경우) |
| sources | {title:string; effectiveDate:string}[] | X(variant=full 일 때 필수) | — | ReferenceMeta 에서 옮긴 값(title, effectiveDate). growth 는 성장 백분위 데이터, vaccinations 는 예방접종 일정 데이터, formula 는 분유량 계수 데이터를 각각 넘긴다 |
| extraNote | string | X | — | 화면별 추가 문구(예: copay-relief 의 "2026년 1월 시행 제도 기준") |

## states
| state | 트리거 | 시각 변화 |
|---|---|---|
| default | — | bg=--color-bg-canvas, 상단 구분선 --color-border-subtle. 순서: extraNote(있으면) → sources 목록(있으면) → 면책 문구(아이콘 `Info`(--icon-size-sm, --color-text-muted, 장식) + "참고용이며 진단을 대신하지 않음", SPEC 원문 그대로) |
| disabled | 쓰이지 않음 | 해당 없음 |
| error | 쓰이지 않음 | 해당 없음 — 이 컴포넌트는 항상 정적 문구만 그린다 |

## a11y
- a11y:label — 별도 aria-label 없음. `<footer>` 랜드마크가 아니라 content 안의 일반 영역(각 화면에 footer 랜드마크는 하나만 둘 필요가 없어 `role` 을 별도로 주지 않는다). `Info` 아이콘은 `aria-hidden`
- a11y:focus — 정적 텍스트라 포커스 대상이 아니다
- a11y:contrast — 면책 문구는 본문이 아니라 메타 정보로 보고 `--font-size-meta`(14px)를 쓰지만, 색 대비는 본문과 같게 `--color-text-muted/--color-bg-canvas` = 7.30 을 유지한다(크기만 작고 대비는 낮추지 않는다)
- a11y:target — 터치 대상 없음(링크가 있다면 출처 URL 링크 각각 48px 높이 확보)
- a11y:role — 일반 텍스트 영역(article 아님, region 아님 — 화면 안의 부속 정보라 랜드마크를 추가하지 않는다)

## responsive
- <768: 1열
- 768~1279: 콘텐츠 폭과 맞춰 최대 --layout-content-max(720px)
- >=1280: 콘텐츠 폭과 맞춰 최대 --layout-content-max(720px, dashboard 도 7차 라운드부터 1열이라 같은 값을 쓴다 — 이전 라운드의 사이드바 컬럼 360px 예외는 폐기)

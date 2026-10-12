# component: ShareCardCanvas
purpose: 공유용 카드 이미지를 브라우저 `<canvas>` 로 그린다(서버에서 그리지 않는다 — architecture ⑤, 아이 정보를 서버로 보내지 않기 위해). 이 문서가 카드의 크기·글자 크기·줄 구성을 값으로 확정한다(PC-F7-AC4 수동 확인의 기준). 이번 라운드("밝고 생기 있는" 리디자인)에서 배경을 아이보리로, 장식 원 두 개를 더했다 — 모두 canvas 도형 API(`arc`+`fill`, `createLinearGradient`)만으로 그린다. lucide 아이콘은 canvas 에 그리지 않는다(tokens.md decisions — SVG 래스터화 복잡도 회피)
쓰이는 화면: dashboard(공유 클릭 시 이 스펙대로 이미지를 만든다), share(카드 미리보기는 같은 값을 DOM 텍스트로 재현한다)
요구 ID: PC-F7-AC1, PC-F7-AC2, PC-F7-AC3, PC-F7-AC4, PC-NF-MOBILE-1, PC-NF-A11Y-1

## props (canvas 그리기 파라미터. React props 가 아니라 그리기 함수의 인자다)
| 이름 | 타입 | 필수 | 기본값 | 의미 |
|---|---|---|---|---|
| chronological | {value:string} | O | — | "생후 92일 · 3개월" |
| corrected | {kind:"hidden"\|"before-due"\|"after-due"; value:string; subValue?:string} \| null | O | — | AgeSummaryCard 와 같은 모양에 `subValue` 를 더했다(DSG-01 수정). before-due 면 value="D-25", subValue="재태 36주 3일"(PC-F2-AC2). after-due 면 value="36일 · 1개월", subValue 는 없다(undefined) |
| todayLabel | string | O | — | "2026년 6월 1일 기준" |
| siteName | string | O | — | `shared/config/site.ts` 의 `siteName`(미확정이면 잠정값 그대로 표시) |

## 카드 사양 (px, canvas 좌표계)

- 캔버스 크기: **1080 × 1350**(4:5 세로, 메신저 미리보기에 흔한 비율). export 는 PNG
- 배경: `--color-bg-canvas`(#FFF9F2, 이전 라운드의 `#FFFFFF` 에서 바꿨다 — 카드 자체가 "밝고 생기 있는" 톤을 갖도록). 좌우 상하 여백(패딩) 64px. 사용 가능 폭은 **952px**(=1080-64×2)다
- **장식(그리기 순서상 맨 먼저, 다른 요소보다 아래 레이어)**: 반투명 원 2개를 `globalAlpha=0.5` 로 그린다 — ① 중심 (1000, 60), 반지름 260px, 색 `--color-accent-primary-soft-bg`(#E0F7FA). ② 중심 (40, 1300), 반지름 220px, 색 `--color-accent-corrected-soft-bg`(#F3ECFF). 둘 다 캔버스 모서리 밖으로 일부 잘려 나가도 된다(장식일 뿐 정보가 없다). 이 두 원을 그린 뒤 `globalAlpha=1` 로 되돌리고 아래 텍스트를 그린다
- 세로 배치(위→아래), 왼쪽 정렬:
  1. `siteName` — 폰트 32px, 색 `--color-text-muted`
  2. `todayLabel` — 폰트 28px, 색 `--color-text-muted`, 위 항목과 간격 16px
  3. 구분 여백 48px
  4. "생후" 라벨 — 폰트 40px 굵게, 색 `--color-accent-primary`(#0E7490) + 라벨 텍스트 자체가 "생후" 이므로 색이 없어도 의미가 전달된다(PC-NF-A11Y-1)
  5. `chronological.value` — 폰트 **96px** 굵게, 색 `--color-text-primary`, 위 라벨과 간격 8px
  6. 구분 여백 32px
  7. corrected가 있으면(hidden 이 아니면): "교정" 라벨 — 폰트 40px 굵게, 색 `--color-accent-corrected`(#7C3AED). `corrected.value` — 폰트 96px 굵게, 색 `--color-text-primary`, 라벨과 간격 8px. **`corrected.subValue` 가 있으면 그 아래 한 줄을 더 그린다 — 폰트 40px 보통 굵기(96px 가 아니다), 색 `--color-text-muted`, `value` 줄과 간격 12px(DSG-01 수정: `value`(짧은 핵심 숫자, 예: "D-25")만 96px 로 두고, 나머지("재태 36주 3일" 등, `subValue`)는 40px 로 따로 그린다). `subValue` 가 없으면(after-due) 이 줄을 그리지 않는다**
     corrected가 hidden 이면: 이 블록 대신 "교정연령 해당 없음(재태 37주 이상)" 한 줄, 폰트 32px, 색 `--color-text-muted`
  8. 구분 여백 40px(corrected 에 subValue 가 있으면 그만큼 세로 위치가 아래로 밀린다 — 캔버스는 세로로 충분히 여유가 있어 40px 여백을 그대로 유지한다. 총 높이가 1350px 를 넘지 않는지는 실측이 필요하면 curvez-nextjs 가 구현 시 확인한다)
  9. 기준 안내 한 줄 — "생후: 출생일 기준 · 교정: 출산 예정일 기준", 폰트 32px, 색 `--color-text-muted`
  10. 구분 여백 56px
  11. 면책 문구 — "참고용이며 진단을 대신하지 않음", 폰트 26px, 색 `--color-text-muted`
- **들어가는 값**: 생후/교정 나이 문구(값+보조값), 기준 안내, 오늘 날짜, 사이트 이름, 장식 원 2개(정보 없음)
- **빠지는 값**: 아이 이름, 성별, 출생 체중, 프로필 id, 어떤 저장 기기인지 알 수 있는 값 전부(PC-F7-AC1)
- 1080px 폭 이미지를 360 CSS px 폭 화면에서(배율 3배 축소 표시 기준) 보면 큰 숫자(96px)는 화면에서 약 32px 상당으로 보여 확대 없이 읽힌다(PC-F7-AC4). 면책 문구(26px→약 8.7px 상당)는 작지만, AC4 가 요구하는 것은 "숫자"의 가독성이라 문제가 되지 않는다
- **폭 근거(DSG-01)**: `value`(예: "D-25", "36일 · 1개월", 최대 약 8자)는 96px 굵게로 그려도 952px 를 넘지 않는다(8자×96px 이하 = 768px 이하). `subValue`(예: "재태 22주 0일"~"재태 44주 6일", 최대 9자)는 40px 로 그려 9자×40px 이하 = 360px 이하로, 952px 안에 넉넉히 들어간다. 두 값을 한 줄에 합쳐 96px 로 그리는 경우(수정 전 방식)만 952px 를 넘을 수 있었다 — 그래서 줄을 나누는 쪽으로 고쳤다(글자 폭은 실제 폰트 metrics 실측이 아니라 문자당 최대 너비 추정값이다. curvez-nextjs 가 실제 `measureText` 로 재확인하면 이 근거를 업데이트한다)

## states
| state | 트리거 | 시각 변화 |
|---|---|---|
| ready | chronological 값이 있음 | 위 사양대로 그린다(장식 원 포함) |
| corrected-hidden | corrected=null 또는 kind="hidden" | 위 7번 항목의 대체 문구를 그린다(장식 원은 그대로 유지) |
| disabled | 쓰이지 않음 | 해당 없음 |
| error | 캔버스 지원 안 함(2026년 기준 사실상 없음) | `ShareActionButton` 이 이 경우 `onCopyLink` 경로로 대체한다(이미지 없이 링크만 복사) |

## a11y
- a11y:label — canvas 로 만든 이미지 자체는 스크린리더가 읽지 못한다(장식 원도 정보가 없어 문제 없다). `navigator.share` 로 전달할 때 `text` 필드에 같은 내용을 텍스트로 함께 담아, 공유받는 앱이 대체 텍스트로 쓸 수 있게 한다
- a11y:focus — 포커스 대상 아님(이미지 생성 로직, UI 아님)
- a11y:contrast — 텍스트 색 조합은 tokens.md 대비 검증 표의 값을 그대로 쓴다(`#292524/#FFF9F2`=14.51, `#57534E/#FFF9F2`=7.30 — 배경이 `#FFFFFF`에서 `#FFF9F2`로 바뀌어 값도 갱신됐다). 장식 원은 텍스트 위가 아니라 모서리 쪽에만 배치해(위 좌표 참고) 본문 텍스트와 겹치지 않는다
- a11y:target — 해당 없음(이미지, 터치 요소 아님)
- a11y:role — 해당 없음(canvas 출력물)

## responsive
- 해당 없음 — 카드는 고정 캔버스 크기 하나만 만든다(기기별로 다른 크기를 만들지 않는다. 받는 쪽 화면 크기는 다양해 하나로 고정하는 편이 "기준"이 분명하다)

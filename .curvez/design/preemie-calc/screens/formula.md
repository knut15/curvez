# screen: formula
route: /dashboard/formula
goal: 아이 체중으로 하루 분유량 참고 범위를 확인한다 (F15, PC-F15-AC1~AC3, EX1~EX3)
entry: dashboard 의 quick-links "분유량 참고" 카드
exit: 뒤로가기 → /dashboard

## layout
- region: header
  - fixed: true
  - role: 뒤로가기와 화면 제목 "분유량 참고". **제목은 화면 폭과 무관하게 항상 헤더 정중앙에 온다**(PageHeader.md `## 레이아웃`)
  - component: PageHeader(variant=back, title="분유량 참고", onBack)

- region: content
  - scroll: true
  - region: entry-form
    - role: 체중을 입력해 계산한다. 최근 성장 기록(growth 화면)에 몸무게 측정값이 있으면 그 값으로 미리 채운다(PRD §8 가정 "같은 값을 두 번 묻지 않는다") — 기록이 없으면 빈 입력칸으로 시작한다
    - component: TextField(label="체중", icon="Weight", suffix="kg", inputMode=decimal, required=true) + Button(variant=primary, label="계산하기") — 0.5~15kg 범위를 만족해야 활성화된다(PRD §8 가정, PC-F15-EX1)
    - priority: 1
  - region: preemie-note
    - role: 재태 37주 미만 아이는 결과보다 먼저 이 줄이 보인다(PC-F15-AC2, SPEC 원문 그대로) — "의료진이 정해 준 양이 있으면 그 양을 따르세요". 계산 성공 여부와 무관하게, 재태 37주 미만이면 entry-form 바로 아래에 항상 이 문구를 둔다(아이콘 `Info`)
  - region: result
    - role: 하루 권장량 범위(SPEC 패턴 "하루 4a\~4b ml"의 실제 값 — 계수 하한 a·상한 b 는 formula-coefficients.json 값). 예: 체중 4.0kg, 현재 확정 계수(아이사랑 포털, 1kg당 150~180ml)라면 "하루 600~720ml"
    - component: ValueCard(icon="Milk", tone=primary, label="하루 권장량", value="{하한}~{상한}ml")
    - priority: 2
  - region: disclaimer
    - role: 계수 출처·기준일과 "참고용이며 진단을 대신하지 않음"(PC-F15-AC3, SPEC 원문 그대로)
    - component: ReferenceFooter(sources=formulaCoefficientMeta)

## states
- state:default — 체중이 유효(0.5~15kg)하고, 오늘 교정 나이가 데이터 파일의 적용 월령 범위(현재 0~3개월, PRD §9 결정) 안이다. result 가 채워진다
- state:loading — 계산은 브라우저에서 동기로 처리돼 200ms 미만이다. 표시하지 않는다
- state:coefficient-unconfirmed — 오늘 교정 나이가 4개월 이상이면(PC-F15-EX3) result 자리 대신 "기준 확인 중"(SPEC 원문 그대로)을 보여준다. `UnconfirmedNotice`(text="기준 확인 중")를 재사용한다 — PRD §9 2026-09-30 결정이 "확인된 0~3개월만 넣고 4개월 이후는 확인 중으로 둔다"고 정했기 때문에, 이 상태가 오늘 기준으로 실제 도달하는 경우다
- state:empty — PC-F15-EX2 "이 시기에는 일반 권장량을 보여주지 않습니다"(SPEC 원문 그대로)를 StatePanel(variant=domain-empty)로 보여주는 상태다. **조건: 데이터 파일이 적용 월령 범위를 정의하고 있고 그 범위 밖인 경우.** 현재 데이터(0~3개월 계수만 확정)에서는 4개월 이상이 되면 계수 자체가 없어 위 state:coefficient-unconfirmed 가 먼저 걸리므로, 이 상태는 지금 실제로는 도달하지 않는다 — 나중에 4개월 이후 계수가 채워지되 적용 범위 자체가 더 좁게(예: 0~24개월) 한정되는 경우에 대비해 정의만 남겨 둔다(state:empty 를 지우지 않고 사유를 적는 규칙)
- state:error — 체중이 비었거나 0.5kg 미만·15kg 초과이면(PC-F15-EX1) "계산하기" 버튼이 비활성화되고, 입력칸 아래 에러 "체중을 확인하세요(0.5~15kg)"(아이콘 `AlertCircle`, `EditProfileDialog` 의 체중 에러 문구와 같은 관례)가 보인다. result 는 그리지 않는다. preemie-note 는 20행 규칙대로 계산 성공 여부와 무관하게 그대로 남는다(재태 37주 미만이면 이 상태에서도 보인다) — 안전 문구라 값 계산 실패와 무관하게 항상 노출한다

## responsive
- 360~767px(모바일): 1열, entry-form 필드 세로 스택, 좌우 여백 --space-4(16px). result 카드 폭 100%
- 768~1279px(태블릿): content 폭 최대 --layout-content-max(720px) 중앙 정렬, 좌우 여백 --space-4(16px) 그대로. result(ValueCard) 폭 최대 480px 중앙 정렬
- >=1280px(데스크톱): content 폭 최대 --layout-content-max(720px) 중앙 정렬, 좌우 여백 --space-6(32px). result(ValueCard) 폭 최대 560px 중앙 정렬

## a11y
- focus-order: header.back → entry-form.체중 → entry-form.계산하기 → preemie-note(있으면, 정적) → result(있으면)
- landmark: content = main, header = banner
- announce: 계산 성공 시 live region "분유량을 계산했습니다". 유효성 오류 발생 시 live region "체중을 확인하세요"

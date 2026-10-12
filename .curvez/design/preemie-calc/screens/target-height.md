# screen: target-height
route: /dashboard/target-height
goal: 아빠 키·엄마 키로 목표키 참고 범위를 확인한다 (F14, PC-F14-AC1~AC3, EX1)
entry: dashboard 의 quick-links "목표키 참고" 카드
exit: 뒤로가기 → /dashboard

## layout
- region: header
  - fixed: true
  - role: 뒤로가기와 화면 제목 "목표키 참고". **제목은 화면 폭과 무관하게 항상 헤더 정중앙에 온다**(PageHeader.md `## 레이아웃`)
  - component: PageHeader(variant=back, title="목표키 참고", onBack)

- region: content
  - scroll: true
  - region: gender-note
    - role: 성별은 이 화면에서 다시 입력받지 않는다(CONTEXT "성별은 프로필에서") — 현재 프로필에 저장된 성별을 정적 텍스트로 보여준다. 예: "아이 성별: 남아(프로필 기준)". 프로필에 성별이 없을 수 없다(F1 에서 필수 입력이므로 이 줄은 항상 값이 있다)
    - priority: 1
  - region: entry-form
    - role: 아빠 키·엄마 키를 입력해 계산한다. 부모 키는 저장하지 않는다(PRD §8 가정 — 새로고침하면 비어 있다)
    - fields:
      - TextField(label="아빠 키", icon="Ruler", suffix="cm", inputMode=decimal, required=true)
      - TextField(label="엄마 키", icon="Ruler", suffix="cm", inputMode=decimal, required=true)
    - component: Button(variant=primary, label="계산하기") — 두 값이 모두 100~230cm 범위를 만족해야 활성화된다(PRD §8 가정, PC-F14-EX1)
    - priority: 2
  - region: result
    - role: 목표키 참고값과 범위를 보여준다. SPEC 원문 그대로의 형식 — 예: "목표키 참고 175.0cm (168.5~181.5cm)"(남아, 아빠 175cm·엄마 162cm), "목표키 참고 162.0cm (155.5~168.5cm)"(여아, 같은 부모 키)
    - component: ValueCard(icon="Target", tone=primary, label="목표키 참고", value="{계산값}.0cm", subValue="({하한}~{상한}cm)")
    - priority: 3
  - region: result-note
    - role: 결과 바로 아래 고정 문구 두 줄(PC-F14-AC3, SPEC 원문 그대로) — "부모 키로 계산한 참고값이며 성인 키 예측이 아닙니다" + "계산식 출처: Tanner 공식"
  - region: disclaimer
    - role: 의료 면책 문구
    - component: ReferenceFooter(variant=disclaimer-only)

## states
- state:default — 계산 성공. result·result-note 가 채워진다
- state:loading — 계산은 브라우저에서 동기로 처리돼 200ms 미만이다. 표시하지 않는다
- state:empty — 아직 "계산하기"를 누르지 않은 초기 상태(입력 전 또는 값을 고치는 중)다. result·result-note 영역 자체를 그리지 않는다 — "검색 결과 없음"이 아니라 "아직 계산 안 함"이다(이 화면에 필터는 없다). entry-form 은 그대로 보인다
- state:error — 부모 키 중 하나라도 비었거나 100cm 미만·230cm 초과이면(PC-F14-EX1) "계산하기" 버튼이 비활성화되고, entry-form 아래에 에러 문구 "부모님 키를 모두 확인하세요"(SPEC 원문 그대로, 아이콘 `AlertCircle`)가 보인다. result·result-note 는 그리지 않는다. input 화면의 날짜 검증 오류와 같은 방식(입력 유효성 오류를 이 화면의 state:error 로 다룬다 — 외부 데이터 요청이 없어 StatePanel 로 화면 전체를 대체할 대상이 없다)

## responsive
- 360~767px(모바일): 1열, entry-form 필드 세로 스택, 좌우 여백 --space-4(16px). result 카드 폭 100%
- 768~1279px(태블릿): content 폭 최대 --layout-content-max(720px) 중앙 정렬, 좌우 여백 --space-4(16px) 그대로. result(ValueCard) 폭 최대 480px 중앙 정렬(ValueCard 자체 규칙, 본문 컨테이너 통일 대상이 아니다)
- >=1280px(데스크톱): content 폭 최대 --layout-content-max(720px) 중앙 정렬, 좌우 여백 --space-6(32px). result(ValueCard) 폭 최대 560px 중앙 정렬(ValueCard.md 데스크톱 규칙)

## a11y
- focus-order: header.back → gender-note(정적, 포커스 없음) → entry-form.아빠키 → entry-form.엄마키 → entry-form.계산하기 → result(있으면)
- landmark: content = main, header = banner
- announce: 계산 성공 시 live region "목표키를 계산했습니다". 유효성 오류 발생 시 live region "부모님 키를 모두 확인하세요"

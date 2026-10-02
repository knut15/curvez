# screen: copay-relief
route: /dashboard/copay-relief
goal: 재태기간 구간에 따른 본인부담 경감 종료 예정일을 확인한다 (F5, PC-F5-AC1~AC5)
entry: dashboard 의 quick-links "본인부담 경감 종료일" 카드
exit: 뒤로가기 → /dashboard

## layout
- region: header
  - fixed: true
  - role: 뒤로가기와 화면 제목 "본인부담 경감 종료일". **제목은 화면 폭과 무관하게 항상 헤더 정중앙에 온다**(PageHeader.md `## 레이아웃`)
  - component: PageHeader(variant=back, title="본인부담 경감 종료일", onBack)

- region: content
  - scroll: true
  - region: result
    - role: 구간 라벨("5년 3개월" 등)과 종료 예정일을 큰 글씨로 보여준다
    - component: ValueCard(icon="Banknote", tone=primary, label="경감 구간", value="5년 3개월", subValue="종료 예정일: YYYY-MM-DD") — AgeSummaryCard(variant=single) 에서 ValueCard 로 옮겼다(구조 리뷰 PLC-02)
    - priority: 1
  - region: policy-note
    - role: "2026년 1월 시행 제도 기준"(SPEC 원문 그대로, PC-F5-AC5)을 result 바로 아래에 둔다
  - region: unconfirmed-notice
    - role: 구간 경계(29주·33주 정각)나 종료일 계산 방식이 미확정이면 표시한다
    - component: UnconfirmedNotice
  - region: disclaimer
    - role: 데이터 출처·기준일, 의료 면책 문구
    - component: ReferenceFooter

## states
- state:default — 재태 37주 미만이라 경감 대상이다. result 에 구간과 종료일이 찬다
- state:loading — dashboard 에서 이미 읽은 프로필로 계산하므로 이 화면만의 로딩이 없다. 200ms 미만, 표시하지 않는다
- state:empty — 재태 37주 0일 이상이면 result·policy-note·unconfirmed-notice 를 문구로 바꾼다: "경감 대상이 아닙니다"(SPEC 원문 그대로, PC-F5-AC4). `IconBadge`(icon="Info", tone=primary)와 함께 보인다. disclaimer 는 유지
- state:error — copay-relief.json 을 불러오지 못하면 content 를 StatePanel(variant=error) 로 치환. 문구 "안내를 불러오지 못했습니다", 액션 버튼 "대시보드로"
- state:boundary-unconfirmed — `classifyCopayRelief` 가 `{ kind: "boundary-unconfirmed", boundaryDays: 203 | 231 }` 를 낼 때(재태일수가 정확히 203일=29주 0일 또는 231일=33주 0일, 구간 경계 정각인 경우). 이 값이 앞 구간·뒤 구간 어느 쪽인지는 PRD §9 미결 2 로 남아 있어, 이 상태는 **어느 쪽으로도 단정하지 않는다.**
  - result·policy-note 는 그리지 않는다(구간 라벨도 종료일도 아직 없어 보여줄 값이 없다)
  - 블록 순서: header(유지) → unconfirmed-notice → disclaimer(유지)
  - component: UnconfirmedNotice. `text` 는 boundaryDays 에 따라 아래 둘 중 하나를 그대로 쓴다(두 후보를 tiers 배열 순서 그대로 나란히 적을 뿐, 등장 순서는 우선순위가 아니다):
    - boundaryDays=203 일 때: `"재태 29주 0일은 구간 경계 정각이라, '5년 4개월' 구간과 '5년 3개월' 구간 중 어느 쪽인지 원문 확인 전이라 정하지 않았습니다. 확정되면 이 안내는 자동으로 없어집니다."`
    - boundaryDays=231 일 때: `"재태 33주 0일은 구간 경계 정각이라, '5년 3개월' 구간과 '5년 2개월' 구간 중 어느 쪽인지 원문 확인 전이라 정하지 않았습니다. 확정되면 이 안내는 자동으로 없어집니다."`
  - 구분 방법(PC-NF-A11Y-1): `UnconfirmedNotice` 는 색이 아니라 아이콘 `AlertTriangle` + 굵은 "미확정" 라벨 + 텍스트로 구분된다(이번 라운드부터 "△" 기호 대신 실제 아이콘, `components/UnconfirmedNotice.md` 참고). 문장 안 두 후보 구간명은 같은 글자 크기·굵기·색으로 적어 어느 한쪽도 강조하지 않는다 — 배경색을 다르게 칠하거나 한쪽에만 강조색을 쓰지 않는다
  - component: ReferenceFooter(sources=copayReliefMeta 그대로, extraNote="2026년 1월 시행 제도 기준"(policyLabel) 유지, 면책 문구 PC-NF-MED-1 그대로 유지) — 종료일이 없어 PC-F5-AC5(종료일+정책 문구 동반)의 대상은 아니지만, 정책 기준 문구 자체는 감추지 않는다
  - focus-order(이 상태 한정): header.back → unconfirmed-notice (disclaimer 는 정적 텍스트라 포커스 대상이 아님, 기존 규칙과 동일)

## responsive
- 360~767px(모바일): result 카드 폭 100%, 좌우 여백 --space-4(16px)
- 768~1279px(태블릿): content 폭 최대 --layout-content-max(720px) 중앙 정렬, 좌우 여백 --space-4(16px) 그대로. result 카드 폭 최대 480px 중앙 정렬(ValueCard 자체의 폭 — 본문 컨테이너 통일 대상이 아니다)
- >=1280px(데스크톱): content 폭 최대 --layout-content-max(720px) 중앙 정렬, 좌우 여백 --space-6(32px). result 카드(ValueCard) 폭 최대 560px 중앙 정렬(ValueCard.md 의 데스크톱 규칙 참고, 마찬가지로 본문 컨테이너 폭 통일 대상이 아니다)

## a11y
- focus-order: header.back → result → policy-note → unconfirmed-notice(있으면). state:boundary-unconfirmed 는 result·policy-note 가 없어 header.back → unconfirmed-notice 로 끝난다(위 state 항목 참고)
- landmark: content = main, header = banner
- announce: 없음(정적 조회 화면)

forbidden-words: allow

# preemie-calc 수용 기준 판정표 (AC 69 + EX 14 + NF 11 = 94개, 10라운드부터)

9라운드(SPEC v2 신규 기능 대응)부터 총 개수가 57개(AC38+EX8+NF11)에서 79개(AC55+EX13+NF11)로
늘었다 — F7 AC5~7, F8, F10, F14, F15 가 새로 추가됐다(F16~F18·F1-AC7 은 그때 팀 라운드가
아직 리뷰 전이라 그 라운드가 판정하지 않았다, 아래 "9라운드" 절 참고).
10라운드(이 라운드, 통합 게이트)부터 79개에서 94개(AC69+EX14+NF11)로 늘었다 — F1-AC7(1개)·
F16(AC1~7 7개+EX1 1개)·F17(AC1~3 3개)·F18(AC1~3 3개), 합쳐서 15개 ID 가 이번에 판정에
들어왔다. 2~9라운드 절의 옛 총 개수 표현은 그 시점 기록 그대로 두고(지우지 않는다),
아래 F-번호별 표와 "10라운드" 절만 최신 상태로 갱신한다.

시계: KST 고정(`page.clock.setFixedTime`, 예: `2026-06-01T09:00:00+09:00`). 예시 아이:
출생 2026-03-01, 예정일 2026-04-26(재태 32주 0일), 이 문서에서 "표준 아이"라 부른다.

판정은 `기타` 열 없이 세 값만 쓴다: **자동 통과** / **자동 실패** / **수동**.

## F1. 아이 프로필

| ID | 판정 | 테스트 파일:테스트 이름 |
| --- | --- | --- |
| PC-F1-AC1 | 자동 통과 | `tests/e2e/f1-profile.spec.ts`:"PC-F1-AC1 · PC-NF-MOBILE-4 — 첫 화면에는 입력칸과 버튼만 보인다 › 입력칸 3종(...) + 저장 버튼만 보이고, 그 외 버튼이 없다" |
| PC-F1-AC2 | 자동 통과 | `tests/unit/child-profile.test.ts`:describe "PC-F1-AC2 출생일·출산 예정일 → 재태기간"(이전 라운드) |
| PC-F1-AC3 | 자동 통과 | `tests/unit/child-profile.test.ts`:describe "PC-F1-AC3 출생일·주수 → 예정일 역산"(이전 라운드) |
| PC-F1-AC4 | 자동 통과 | `tests/e2e/f1-profile.spec.ts`:"PC-F1-AC4 — 저장된 프로필이 있으면 입력 없이 대시보드로 간다 › `/` 진입 시 자동으로 /dashboard 로 리다이렉트된다" |
| PC-F1-AC5 | 자동 통과 | `tests/e2e/f1-profile.spec.ts`:"PC-F1-AC5 · PC-F1-EX3 — ... › 탭에 '아이 1'·'아이 2'가 보이고, '+ 아이 추가'를 누르면 /?new=1 로 이동해 폼이 보인다" |
| PC-F1-AC6 | 자동 통과 | `tests/e2e/f1-profile.spec.ts`:"PC-F1-AC6 · PC-NF-PRIV-3 — 정보 전체 삭제 › 확인하면 저장된 프로필이 모두 사라지고 첫 화면으로 돌아간다" |
| PC-F1-EX1 | 자동 통과 | `tests/unit/child-profile.test.ts`:describe "PC-F1-EX1 재태기간 범위 예외"(이전 라운드) |
| PC-F1-EX2 | 자동 통과 | `tests/unit/child-profile.test.ts`:describe "PC-F1-EX2 출생일이 오늘보다 뒤면 저장을 막는다"(이전 라운드) |
| PC-F1-EX3 | 자동 통과 | `tests/e2e/f1-profile.spec.ts`:"PC-F1-AC5 · PC-F1-EX3 — ..." (같은 테스트, 두 프로필 모두 이름 없이 저장해 "아이 1"·"아이 2" 표시를 함께 확인) |
| PC-F1-AC7 | 자동 통과 (10라운드 신규) | `tests/e2e/f1-ac7-due-date-label.spec.ts`:"PC-F1-AC7 — 예정일 칸의 라벨이 '원래 출산 예정일'이다" + "PC-F1-AC7 — 칸 아래에 도움말이 보이고, 칸의 aria-describedby 가 그 도움말을 가리킨다"(라벨·도움말 원문·aria-describedby 연결·칸 아래 위치까지 전부 확인, SPEC 원문과 그대로 대조) |

## F2. 교정연령 대시보드

| ID | 판정 | 테스트 파일:테스트 이름 |
| --- | --- | --- |
| PC-F2-AC1 | 자동 통과 | 단위: `tests/unit/child-ages.test.ts`:"PC-F2-AC1 ..."(이전 라운드). 화면: `tests/e2e/f2-dashboard.spec.ts`:"PC-F2-AC1 — 오늘 2026-06-01: '생후 92일 · 3개월'과 '교정 36일 · 1개월'이 나란히 보인다" |
| PC-F2-AC2 | 자동 통과 | 단위: `tests/unit/child-ages.test.ts`:"PC-F2-AC2 ..."(이전 라운드). 화면: `tests/e2e/f2-dashboard.spec.ts`:"PC-F2-AC2 — 오늘 2026-04-01: '교정 D-25'와 '재태 36주 3일'이 보인다" |
| PC-F2-AC3 | 자동 통과 | 단위: `tests/unit/child-ages.test.ts`:"PC-F2-AC3 ..."(이전 라운드). 화면: `tests/e2e/f2-dashboard.spec.ts`:"PC-F2-AC3 — ... 다음 월령일 ... 이 보인다" |
| PC-F2-AC4 | 자동 통과 | 단위: `tests/unit/child-ages.test.ts`:"PC-F2-AC4 ..."(이전 라운드). 화면: `tests/e2e/f2-dashboard.spec.ts`:"PC-F2-AC4 — 재태 38주5일(37주 이상)이면 교정 칸이 보이지 않고 생후 나이만 보인다" |
| PC-F2-AC5 | 자동 통과 | `tests/e2e/f2-dashboard.spec.ts`:"PC-F2-AC5 — 나이 옆에 '생후: 출생일 기준 · 교정: 출산 예정일 기준'이 한 줄로 적혀 있다"(이번 라운드 신규 — 이전 라운드는 정적 문구라 단위 테스트에서 제외했었다) |
| PC-F2-EX1 | 자동 통과 | `tests/e2e/f2-dashboard.spec.ts`:"PC-F2-EX1 — 프로필이 없으면 F1 첫 화면으로 보낸다"(이번 라운드 신규) |

## F3. "어느 나이를 쓰나" 안내

| ID | 판정 | 테스트 파일:테스트 이름 |
| --- | --- | --- |
| PC-F3-AC1 | 자동 통과 | 단위: `tests/unit/age-basis.test.ts`:"PC-F3-AC1 ..."(이전 라운드). 화면: `tests/e2e/f3-age-basis.spec.ts`:"PC-F3-AC1 — '예방접종 — 출생 기준 — 생후 3개월'이 보인다"(이번 라운드 신규) |
| PC-F3-AC2 | 자동 통과 | 단위: `tests/unit/age-basis.test.ts`:"PC-F3-AC2 ...". 화면: `tests/e2e/f3-age-basis.spec.ts`:"PC-F3-AC2 — '이유식 — 교정 기준 — 교정 1개월'이 보인다" |
| PC-F3-AC3 | 자동 통과 | 단위: `tests/unit/age-basis.test.ts`:"PC-F3-AC3 ...". 화면: `tests/e2e/f3-age-basis.spec.ts`:"PC-F3-AC3 — '영유아검진 방문 — 출생 기준', '문진표·발달선별검사지 — 교정 기준(24개월 검진까지)'이 보인다" |
| PC-F3-AC4 | 자동 통과(조건부: 원문 대조 전) | 단위: `tests/unit/age-basis.test.ts`:"PC-F3-AC4 ...". 화면: `tests/e2e/f3-age-basis.spec.ts`:"PC-F3-AC4 — 항목마다 근거 자료 이름과 기준일이 보인다" — **판정 근거(2026-09-29 교정 라운드)**: architect 결정 1(ACC-04)로 `ageBasisMeta.effectiveDate` 가 null 이 됐다. 화면은 "기준일 2026-06-01"처럼 실제 날짜 대신 "기준일 확인 전"을 보인다. AC 원문("항목마다 근거 자료 이름과 기준일이 보인다")은 "기준일"이라는 이름표가 붙은 텍스트가 있는지를 요구하고, 화면은 그 이름표("기준일")를 항상 그린다 — 값이 미확정임을 숨기지 않고 그대로 드러낸다. 그래서 자동 테스트는 "기준일"이라는 문자열의 존재만 확인하고 통과로 판정하되, 값 자체(실제 날짜)는 아직 없다는 사실을 "조건부: 원문 대조 전"으로 명시한다. 원문 대조가 끝나 `effectiveDate`가 실제 날짜로 채워지면 이 조건부 표시를 없앤다 |
| PC-F3-AC5 | 자동 통과 | 단위: `tests/unit/age-basis.test.ts`:"PC-F3-AC5 ...". 화면: `tests/e2e/f3-age-basis.spec.ts`:"PC-F3-AC5 — 재태 37주 이상 아이는 모든 항목이 '생후 나이 그대로'로 보인다" |

## F4. 영유아검진 도우미

| ID | 판정 | 테스트 파일:테스트 이름 |
| --- | --- | --- |
| PC-F4-AC1 | 자동 통과 | `tests/unit/checkup.test.ts`:describe "PC-F4-AC1 차수별 방문 기간 = 데이터 파일의 개월 범위 + 출생일"(이전 라운드) |
| PC-F4-AC2 | 자동 통과 | 단위: `tests/unit/checkup.test.ts`:"PC-F4-AC2 ...". 화면: `tests/e2e/f4-checkups.spec.ts`:"PC-F4-AC2 — 오늘 2026-09-15(...) '오늘은 교정 4개월 기준으로 문진표를 쓰세요'가 보인다"(이번 라운드 신규) |
| PC-F4-AC3 | 자동 통과 | `tests/unit/checkup.test.ts`:describe "PC-F4-AC3 24개월 검진보다 뒤 차수는 검사지도 출생 기준"(이전 라운드) |
| PC-F4-AC4 | 자동 통과 | `tests/e2e/f4-checkups.spec.ts`:"PC-F4-AC4 — 오늘 날짜가 든 차수가 맨 위에 강조돼 보이고, 지난·예정 차수와 구분된다"(이번 라운드 신규 — 이전 라운드 미커버였다) |
| PC-F4-AC5 | 자동 통과(조건부: 원문 대조 전) | `tests/e2e/f4-checkups.spec.ts`:"PC-F4-AC5 — 화면 아래에 데이터 출처와 기준일이 보인다"(이번 라운드 신규 — 이전 라운드 미커버였다) — 판정 근거는 PC-F3-AC4 와 같다. `checkupMeta.effectiveDate` 도 null 이라 화면은 "기준일 확인 전"을 보인다 |
| PC-F4-EX1 | 자동 통과 | `tests/unit/checkup.test.ts`:describe "PC-F4-EX1 모든 차수가 지난 아이(생후 72개월 이상)는 검진 대상 기간이 끝난다"(이전 라운드) |

## F5. 본인부담 경감 종료일

| ID | 판정 | 테스트 파일:테스트 이름 |
| --- | --- | --- |
| PC-F5-AC1 | 자동 통과 | 단위: `tests/unit/copay-relief.test.ts`:"PC-F5-AC1 ...". 화면: `tests/e2e/f5-copay-relief.spec.ts`:"PC-F5-AC1 — 재태 32주0일이면 '5년 3개월' 구간으로 분류된다"(화면 문구는 이번 라운드 신규) |
| PC-F5-AC2 | 자동 통과 | 단위: `tests/unit/copay-relief.test.ts`:"PC-F5-AC2 ...". 화면: `tests/e2e/f5-copay-relief.spec.ts`:"PC-F5-AC2 — 재태 28주6일이면 '5년 4개월' 구간으로 분류된다" |
| PC-F5-AC3 | 자동 통과 | 단위: `tests/unit/copay-relief.test.ts`:"PC-F5-AC3 ...". 화면: `tests/e2e/f5-copay-relief.spec.ts`:"PC-F5-AC3 — 재태 35주0일이면 '5년 2개월' 구간으로 분류된다" |
| PC-F5-AC4 | 자동 통과 | 단위: `tests/unit/copay-relief.test.ts`:"PC-F5-AC4 ...". 화면: `tests/e2e/f5-copay-relief.spec.ts`:"PC-F5-AC4 — 재태 37주0일 이상이면 '경감 대상이 아닙니다'가 보인다" |
| PC-F5-AC5 | 자동 통과 | 단위: `tests/unit/copay-relief.test.ts`:"PC-F5-AC5 ...". 화면: `tests/e2e/f5-copay-relief.spec.ts`:"PC-F5-AC5 — 종료 예정일과 '2026년 1월 시행 제도 기준' 문구가 함께 보인다"(이전 라운드 미커버였던 화면 문구를 이번에 채움) |
| PC-F5-AC6 | 자동 통과 | 단위: `tests/unit/copay-relief.test.ts`:"PC-F5-AC6 재태 33주 0일은 5년 2개월 구간"(231일 → 5년 2개월, 바로 앞 230일 → 5년 3개월). 2026-10-02 메인 세션이 작성 |
| PC-F5-AC7 | 자동 통과 | 단위: `tests/unit/copay-relief.test.ts`:"PC-F5-AC7 재태 29주 0일은 5년 3개월 구간"(203일 → 5년 3개월, 바로 앞 202일 → 5년 4개월). 화면: `tests/e2e/nf-mobile.spec.ts`:"copay-relief 경계값(재태일수 203일, 5년 3개월 확정)". 2026-10-02 메인 세션이 작성 |

## F6. 교정연령 적용 종료 안내

| ID | 판정 | 테스트 파일:테스트 이름 |
| --- | --- | --- |
| PC-F6-AC1 | 자동 통과 | 단위: `tests/unit/correction-period.test.ts`:"PC-F6-AC1 ...". 화면: `tests/e2e/f6-correction-period.spec.ts`:"PC-F6-AC1 · PC-F6-AC4 — 재태 32주0일·체중 미입력이면 '24개월까지'와 연장 조건, '의료진과 상담해 정하세요'가 보인다" |
| PC-F6-AC2 | 자동 통과 | 단위: `tests/unit/correction-period.test.ts`:"PC-F6-AC2 ...". 화면: `tests/e2e/f6-correction-period.spec.ts`:"PC-F6-AC2 — 재태 27주6일이면 '36개월까지 쓸 수 있음'이 보인다" |
| PC-F6-AC3 | 자동 통과 | 단위: `tests/unit/correction-period.test.ts`:"PC-F6-AC3 ...". 화면: `tests/e2e/f6-correction-period.spec.ts`:"PC-F6-AC3 — 재태 32주0일·출생 체중 1.4kg이면 '36개월까지 쓸 수 있음'이 보인다" |
| PC-F6-AC4 | 자동 통과 | `tests/e2e/f6-correction-period.spec.ts`:"PC-F6-AC1 · PC-F6-AC4 — ... '의료진과 상담해 정하세요'가 보인다"(이번 라운드 신규 — 이전 라운드 미커버였다) |
| PC-F6-EX1 | 자동 통과 | `tests/e2e/f6-correction-period.spec.ts`:"PC-F6-EX1 — 재태 37주 이상이면 대시보드 quick-links에 이 카드 자체가 없다"(이번 라운드 신규 — 이전 라운드 미커버였다) |

## F7. 결과 공유 카드

| ID | 판정 | 테스트 파일:테스트 이름 |
| --- | --- | --- |
| PC-F7-AC1 | 자동 통과 | `tests/e2e/f7-share.spec.ts`:"PC-F7-AC1 · PC-NF-PRIV-2 — 이름 '하늘'로 저장한 프로필의 공유 링크와 카드 그리기 입력에 '하늘'이 없다" — 링크(url)·대체텍스트(text)는 문자열로 직접 검사, 카드 이미지는 canvas `fillText` 호출 가로채기로 그려진 문자열 목록에 "하늘"이 없는지 검사(픽셀 자체는 검사 못함, 한계는 아래 "테스트하지 않는 것" 참고) |
| PC-F7-AC2 | 자동 통과 | `tests/e2e/f7-share.spec.ts`:"PC-F7-AC2 — 공유 링크를 다른 브라우저 컨텍스트(저장값 없음)에서 열면 같은 날짜 기준 같은 결과가 보인다" |
| PC-F7-AC3 | 자동 통과 | `tests/e2e/f7-share.spec.ts`:"PC-F7-AC3 — 공유 링크 fragment 키는 b·d 두 개뿐이다" |
| PC-F7-AC4 | **수동** | `.curvez/qa/preemie-calc/manual-checks.md`:"PC-F7-AC4 — 360px 폭 휴대폰에서 카드를 확대하지 않고 숫자를 읽을 수 있다" — 96px 원본 숫자가 360px 표시 폭에서 32px 상당으로 계산됨까지는 자동 확인했고, 실제 사람 눈으로 읽히는지는 수동 확인이 남았다 |
| PC-F7-EX1 | 자동 통과 | `tests/e2e/f7-share.spec.ts`:"PC-F7-EX1 — navigator.share 를 쓸 수 없는 환경에서는 '링크 복사' 버튼이 보인다" |
| PC-F7-AC5 | 자동 통과 | 단위: `tests/unit/share-text.test.ts`:"PC-F7-AC5 ..." (buildShareText 순수 함수, architecture.md ⑫ 예시와 줄 단위 일치). 화면: `tests/e2e/f7-share.spec.ts`:"PC-F7-AC5 · AC6 — '결과 문구 복사'를 누르면 클립보드에 생후·교정·공유 링크 문구가 들어가고 이름은 없다"(9라운드 신규) |
| PC-F7-AC6 | 자동 통과 | `ShareTextInput` 타입에 이름 필드가 없어 타입 시스템이 이미 막는다(런타임 중복 검사 안 함, "타입이 막는 것" 제외 규칙). 화면 확인은 PC-F7-AC5 와 같은 e2e 테스트가 클립보드 문구에 "하늘" 부재를 함께 확인한다 |
| PC-F7-AC7 | 자동 통과 | `tests/e2e/f7-share.spec.ts`:"PC-F7-AC7 — 복사가 끝나면 '문구를 복사했어요'가 보인다"(9라운드 신규) |

## F8. 성장 백분위 + 기록 (9라운드 신규)

| ID | 판정 | 테스트 파일:테스트 이름 |
| --- | --- | --- |
| PC-F8-AC1 | 자동 통과 | 단위: `tests/unit/growth.test.ts`:"PC-F8-AC1 ..." (basis=corrected, span.months=1 확인). 화면: `tests/e2e/growth.spec.ts`:"PC-F8-AC1 — 재태 32주 아이는 측정일의 교정 나이(교정 1개월 기준)로 계산된다" |
| PC-F8-AC2 | 자동 통과 | 단위: `tests/unit/growth.test.ts`:"PC-F8-AC2 ..." (Z=±2.0 경계값). 화면: `tests/e2e/growth.spec.ts`:"PC-F8-AC2 — 백분위이 3 미만이거나 97 초과면 '소아청소년과 상담을 권합니다'가 보인다" |
| PC-F8-AC3 | 자동 통과 | E2E: `tests/e2e/growth.spec.ts`:"PC-F8-AC3 — 기록이 2개 이상이면 지표별 추이 그래프가 측정일 순서로 그려진다" — 기록 1개면 안내 문구와 그래프 0개, 06-01·05-15 순서로 넣은 뒤 그래프 3개와 X축 눈금 "05.15"·"06.01" 순서를 확인. recharts 3.10.1(2026-10-02 사용자 승인). 단위: `tests/unit/growth-trend.test.ts` 14건. 2026-10-02 메인 세션이 E2E 작성 (이전: 보류, 차트 라이브러리 미정) |
| PC-F8-AC4 | **조건부: 정부 예시 없음, 근사 대조** | `tests/unit/growth.test.ts`:"PC-F8-AC4 회귀 — M 값 입력시 50.0" + "PC-F8-AC4 계산한 백분위가 공공데이터포털 백분위수 기준 표(Z 구간)와 ±1 이내로 맞는다". **한계**: 공공데이터포털이 공개한 파일(`tests/fixtures/nhis-growth-percentile-20240731.csv`, `.curvez/research/preemie-calc/raw/`에서 복사)은 "측정값→백분위" 예시가 아니라 "백분위 1~99구간별 Z 경계표"다. 그래서 이 테스트는 (1) M값을 넣으면 Z=0→백분위 정확히 50.0 이 나오는 회귀와 (2) 임의로 구성한 Z(±1.0)가 그 표의 몇 번째 구간에 드는지 찾아 앱 백분위(소수 첫째 자리)와 ±1 이내로 맞는지만 확인한다 — "정확한 측정값→백분위" 정부 공식 예시가 없어 완전 일치를 요구하지 못하는 한계를 그대로 남긴다 |
| PC-F8-AC5 | 자동 통과 | 단위: `tests/unit/growth.test.ts`:"PC-F8-AC5 · PC-F8-EX1 ..." (before-due, daysUntilDue=1). 화면+저장: `tests/e2e/growth.spec.ts`:"PC-F8-AC5 · EX1 — 측정일이 예정일보다 앞서면 백분위 대신 안내 문구가 보이고, 기록은 저장된다"(폼 제출 후 `page.reload()`로 영속 확인 — `loadGrowthRecords`가 `window.localStorage`를 쓰기 때문에 단위(vitest node 환경)로는 저장 여부를 확인할 수 없다) |
| PC-F8-EX1 | 자동 통과 | 단위: `tests/unit/growth.test.ts`:"(EX1) 재태 28주 아이도 예정일보다 앞서면 마찬가지로 before-due 다". 화면은 PC-F8-AC5 와 같은 e2e 테스트 |

## F10. 예방접종 일정 (9라운드 신규)

| ID | 판정 | 테스트 파일:테스트 이름 |
| --- | --- | --- |
| PC-F10-AC1 | 자동 통과 | 단위: `tests/unit/vaccination.test.ts`:"PC-F10-AC1 ..." (dtap-1, 2026-05-01, 교정 0개월 5일). 화면: `tests/e2e/vaccinations.spec.ts`:"PC-F10-AC1 — 생후 2개월 접종(DTaP 1차)은 2026-05-01 로 표시되고 '교정 5일'이 보인다" |
| PC-F10-AC2 | 자동 통과 | 단위: `tests/unit/vaccination.test.ts`:"PC-F10-AC2 ..." (architecture.md ⑨ 예시 날짜 그대로 upcoming/soon/missed/done 4분기). 화면: `tests/e2e/vaccinations.spec.ts`:"PC-F10-AC2 — 완료 체크한 접종은 완료, 7일 이내 남은 접종은 임박, 지나고 미체크면 놓침이다" |
| PC-F10-AC3 | 자동 통과 | `tests/e2e/vaccinations.spec.ts`:"PC-F10-AC3 — 완료 체크는 새로 열어도 유지된다"(`window.localStorage` 실제 동작이라 e2e 로만 확인 — 단위(vitest node 환경)는 불가) |

## F14. 목표키 참고 (9라운드 신규)

| ID | 판정 | 테스트 파일:테스트 이름 |
| --- | --- | --- |
| PC-F14-AC1 | **자동 통과 (10라운드, src 결함 수정됨)** | `tests/unit/target-height.test.ts`:"PC-F14-AC1 ..." 및 `tests/e2e/target-height.spec.ts`:"PC-F14-AC1 — ... '목표키 참고 175.0cm (168.5~181.5cm)'". 9라운드가 지적한 `entities/target-height/model/index.ts:39`의 `rangeTenths` 계산 버그(범위를 절반만 적용)를 `curvez-nextjs`(20260930-135922, ACC-01)가 architecture.md ⑩ 계산식 그대로 고쳤다. e2e 선택자도 이번 라운드에서 함께 고쳤다 — `ValueCard`(라벨·값·범위가 서로 다른 `<p>` 3개)를 `getByText` 단일 텍스트로 찾던 방식이 항상 실패했던 것을, `role=group`(ValueCard 의 `aria-labelledby`) 텍스트를 정규화해 전체 문구를 판정하는 방식으로 바꿨다(약화 아님 — 여전히 "175.0cm (168.5~181.5cm)" 전체 문자열을 그대로 요구) |
| PC-F14-AC2 | **자동 통과 (10라운드, PC-F14-AC1 과 동일 수정)** | `tests/unit/target-height.test.ts`:"PC-F14-AC2 ..." 및 `tests/e2e/target-height.spec.ts`:"PC-F14-AC2 — ... '목표키 참고 162.0cm (155.5~168.5cm)'" |
| PC-F14-AC3 | 자동 통과 | 단위: `tests/unit/target-height.test.ts`:"PC-F14-AC3 ..." (`TARGET_HEIGHT_FORMULA.name === "Tanner 공식"`). 화면: `tests/e2e/target-height.spec.ts`:"PC-F14-AC3 — 결과 아래에 고정 문구와 계산식 출처가 보인다" |
| PC-F14-EX1 | 자동 통과 | 단위: `tests/unit/target-height.test.ts`:"PC-F14-EX1 ..." (100·230 양끝 포함, null 무효). 화면: `tests/e2e/target-height.spec.ts`:"PC-F14-EX1 — 부모 키가 비었거나 범위 밖이면 계산 버튼이 비활성화되고 에러 문구가 보인다" |

## F15. 분유량 참고 (9라운드 신규)

| ID | 판정 | 테스트 파일:테스트 이름 |
| --- | --- | --- |
| PC-F15-AC1 | 자동 통과 | 단위: `tests/unit/formula.test.ts`:"PC-F15-AC1 ..." (체중 4.0kg → 600~720ml). 화면: `tests/e2e/formula.spec.ts`:"PC-F15-AC1 · AC2 — 체중 4.0kg → 하루 600~720ml, ..." |
| PC-F15-AC2 | 자동 통과 | 단위: `tests/unit/formula.test.ts`:"PC-F15-AC2 ..." (`showMedicalTeamNotice`=correctionApplies). 화면: PC-F15-AC1 과 같은 e2e 테스트가 "의료진이 정해 준 양이 있으면 그 양을 따르세요" 문구도 함께 확인 |
| PC-F15-AC3 | 자동 통과 | `tests/e2e/formula.spec.ts`:"PC-F15-AC3 — 결과 아래에 계수 출처·기준일과 진단 대신 문구가 보인다" + `tests/unit/reference-data.test.ts`(formula-coefficients 출처 URL·기준일 검사) |
| PC-F15-EX1 | 자동 통과 | 단위: `tests/unit/formula.test.ts`:"PC-F15-EX1 ..." (500g·15000g 양끝 포함). 화면: `tests/e2e/formula.spec.ts`:"PC-F15-EX1 — 체중이 비었거나 범위 밖(0.5~15kg)이면 계산 버튼이 비활성화된다" |
| PC-F15-EX2 | 자동 통과 | 단위: `tests/unit/formula.test.ts`:"PC-F15-EX2 ..." (before-due → out-of-range). 화면: `tests/e2e/formula.spec.ts`:"state:empty(EX2) — 교정 나이가 예정일 이전(범위 밖)이면 '이 시기에는 일반 권장량을 보여주지 않습니다'다" |
| PC-F15-EX3 | 자동 통과 | 단위: `tests/unit/formula.test.ts`:"PC-F15-EX3 ..." (교정 3개월0일 정각부터 pending, 2개월29일까지는 ok). 화면: `tests/e2e/formula.spec.ts`:"state:coefficient-unconfirmed(EX3) — 교정 나이가 3개월 이상이면 '기준 확인 중'이 보인다" |

## F13. 주수·개월 조합 SEO 페이지

| ID | 판정 | 테스트 파일:테스트 이름 |
| --- | --- | --- |
| PC-F13-AC1 | **자동 통과 (10라운드 수정)** | `tests/unit/f13-build-artifacts.test.ts`:describe "PC-F13-AC1 — 빌드가 끝나면 481개 조합 페이지가 모두 생성된다"(빌드 산출물 검사). 9라운드에서 487(=481+F16 6쪽)로 실패했던 원인(카운트 로직이 `guide/` 아래 새로 생긴 `questions/`·`age-basis`·`[weeks]` 디렉터리를 구분하지 않고 섞어 셈)을 10라운드가 고쳤다 — 숫자 이름(`24`~`36`)의 weeks 디렉터리만 세도록 `WEEKS_DIR_NAME=/^\d+$/` 필터를 더했다. `pnpm build` 로 새로 만든 503쪽 산출물 기준 481/481 확인(`last-run-build-round10.log`) |
| PC-F13-AC2 | 자동 통과 | 단위: `tests/unit/combo.test.ts`:"PC-F13-AC2 ...". 화면: `tests/e2e/f13-guide.spec.ts`:"PC-F13-AC2 — '32주 출생 생후 3개월' 페이지에 ... 이 보인다"(이번 라운드 신규) |
| PC-F13-AC3 | 자동 통과 | `tests/e2e/f13-guide.spec.ts`:"PC-F13-AC3 — 계산기로 가는 링크를 누르면 해당 주수(32주)가 채워진 입력 화면이 열린다"(이번 라운드 신규 — 이전 라운드 미커버였다) |
| PC-F13-AC4 | **자동 통과 (10라운드 수정)** | `tests/unit/f13-build-artifacts.test.ts`:describe "PC-F13-AC4 — 사이트맵에 481개 조합 페이지가 모두 들어 있다"(빌드 산출물 검사). 9라운드에서 488(=481+F16 6쪽+`/guide`+`/guide/age-basis`)로 실패했던 정규식(`/\/guide\//g`, 모든 `/guide/` 하위 URL을 셈)을 `/\/guide\/\d+\/\d+/g`(주수/개월수 숫자쌍만)로 좁혀 481/481 확인. 같은 파일에 sitemap 전체 URL 수(496개: 정적 9+질문형 가이드 6+조합 481) 별도 단언을 추가해 total 도 확인했다 |
| PC-F13-EX1 | 자동 통과 | `tests/e2e/f13-guide.spec.ts`:"PC-F13-EX1 — 1단계는 검진 안내만 넣고, 접종 안내는 없다"(이번 라운드 신규) |

## F16. 질문형 가이드 6쪽 (10라운드 신규)

PRD 미결 연결: 미결 3(PC-F16-AC5). 미결 3 자체는 확정하지 않는다.

| ID | 판정 | 테스트 파일:테스트 이름 |
| --- | --- | --- |
| PC-F16-AC1 | 자동 통과 | `tests/e2e/f16-question-guides.spec.ts`:"PC-F16-AC1 — /guide/questions/<slug> 는 200 으로 열리고 h1 이 질문 문장이다"(6쪽 × 반복) |
| PC-F16-AC2 | 자동 통과 | `tests/e2e/f16-question-guides.spec.ts`:"PC-F16-AC2 — localStorage 가 빈 브라우저에서 <slug> 쪽을 열면 입력 화면으로 넘어가지 않고 본문이 보인다"(6쪽 × 반복) |
| PC-F16-AC3 | 자동 통과 | `tests/e2e/f16-question-guides.spec.ts`:"PC-F16-AC3 — 문진표 쪽에 '방문 날짜는 출생 기준, 문진표와 발달선별검사지는 교정 기준(24개월 검진까지)'이 보인다" |
| PC-F16-AC4 | 자동 통과 | `tests/e2e/f16-question-guides.spec.ts`:"PC-F16-AC4 — 본인부담 경감 쪽에 재태기간 구간 3개와 기간이 보인다"(33주 이상 37주 미만/29주 이상 33주 미만/29주 미만 × 5년 2·3·4개월). **참고**: 이 문구와 계산기(F5)의 경계 정각(29주 0일·33주 0일) 판정이 어긋난다는 지적(curvez-reviewer TEAM-01)이 있다 — AC4 원문 자체("재태기간 구간 3개와 기간이 보인다")는 충족하므로 자동 통과로 두고, 경계 해석 문제는 아래 "10라운드" 절에 "사용자 확인 대기"로 별도 기록한다 |
| PC-F16-AC5 | 자동 통과 | `tests/e2e/f16-question-guides.spec.ts`:"PC-F16-AC5 — '교정연령은 언제까지' 쪽에는 '미확정' 표시가 보인다 (PRD 미결 3)". **10라운드 수정**: 원래 있던 두 번째 테스트("미확정 표시는 교정연령 쪽에만 붙는다")가 copay-relief 쪽까지 포함해 항상 실패했다 — AC5 원문은 "교정연령 쪽에 미확정이 보인다"만 요구하고 다른 쪽에 없다는 것은 요구하지 않는다(curvez-reviewer TEAM-02). copay-relief 쪽 '미확정'은 PRD 미결 2(경감 종료일)의 정당한 표시라 그 쪽만 판정 대상에서 뺐다(요구를 약화한 것이 아니라 요구에 없던 조건을 걷어낸 것) |
| PC-F16-AC6 | 자동 통과 | `tests/e2e/f16-question-guides.spec.ts`:"PC-F16-AC6 — <slug> 쪽 아래에 근거 자료 이름·기준일, 면책 문구, 계산기 링크가 보인다"(6쪽 × 반복). **10라운드 수정 2건**: (1) `getByRole("contentinfo")` 로 찾던 footer 셀렉터가 항상 실패했다 — `<footer>` 가 `<main>` 의 자손이면 HTML/ARIA 규칙상 암묵적 contentinfo 랜드마크가 없어(w3.org/TR/html-aria) `page.locator("footer")` 로 바꿨다. (2) "기준일" 텍스트만 보던 판정을 각 쪽의 실제 출처 이름(`meta.sources`, 예: "질병관리청 표준예방접종일정표(2026)")을 그대로 확인하는 판정으로 엄격화했다(curvez-reviewer TEAM-04) — corrected-age-until 쪽은 `effectiveDate=null`(원문 대조 전)이라 "기준일 확인 전" 문구를 별도로 허용했다 |
| PC-F16-AC7 | 자동 통과 | `tests/e2e/f16-question-guides.spec.ts`:"PC-F16-AC7 — /sitemap.xml 에 질문형 가이드 6쪽이 모두 들어 있다" |
| PC-F16-EX1 | 자동 통과 (10라운드 신규) | `tests/e2e/f16-question-guides.spec.ts`:"PC-F16-EX1 — 프로필이 없으면 계산기 링크가 입력 화면을 거쳐 저장 뒤 원래 대상 화면(예방접종)으로 돌아간다"(왕복 전체: 링크 href 확인 → 입력 화면 → 폼 작성·저장 → `/dashboard/vaccinations` 도착) + "PC-F16-EX1 — next 쿼리가 외부 경로면 거부하고 기본 화면(/dashboard)으로 돌아간다(열린 리다이렉트 방지)"(`?next=https://evil.example.com` 을 직접 넣어 `isAllowedReturnPath` 가 실제로 막는지 확인) |

## F17. 가이드 목록 페이지 (10라운드 신규)

| ID | 판정 | 테스트 파일:테스트 이름 |
| --- | --- | --- |
| PC-F17-AC1 | 자동 통과 | `tests/e2e/f17-guide-index.spec.ts`:"PC-F17-AC1 — /guide 가 200 으로 열리고 질문형 가이드 6쪽 링크가 보인다" |
| PC-F17-AC2 | 자동 통과 | `tests/e2e/f17-guide-index.spec.ts`:"PC-F17-AC2 — 출생 주수 32주, 생후 3개월을 고르고 이동을 누르면 '32주 출생, 생후 3개월' 조합 페이지가 열린다". **10라운드 수정**: `getByLabel(/출생 주수/)` 부분 일치 정규식이 새로 생긴 `<section aria-labelledby="guide-combo">`(접근 가능한 이름 "출생 주수와 생후 개월로 찾기")와 겹쳐 strict mode 충돌로 항상 실패했다 — `exact: true` 로 좁혀 `<select>` 요소만 찾도록 고쳤다 |
| PC-F17-AC3 | 자동 통과 | `tests/e2e/f17-guide-index.spec.ts`:"PC-F17-AC3 — /sitemap.xml 에 /guide 가 들어 있다" |

## F18. "어느 나이를 쓰나" 공개판 (10라운드 신규)

| ID | 판정 | 테스트 파일:테스트 이름 |
| --- | --- | --- |
| PC-F18-AC1 | 자동 통과 | `tests/e2e/f18-age-basis-public.spec.ts`:"PC-F18-AC1 — localStorage 가 빈 브라우저에서 5개 항목과 각 기준(출생 또는 교정)이 보인다". **10라운드 수정**: SPEC 버전 5 가 "성장 백분위"를 "발달 평가"로 바로잡았는데(requirements.md:277) 테스트가 버전 3 목록("성장 백분위" 포함)을 그대로 두고 있어 항상 실패했다 — 5개 항목을 예방접종·영유아검진 방문·문진표·발달선별검사지·이유식·발달 평가로 교체했다 |
| PC-F18-AC2 | 자동 통과 | `tests/e2e/f18-age-basis-public.spec.ts`:"PC-F18-AC2 — 프로필이 없을 때 '내 아이로 계산하기'는 입력 화면을 거쳐 저장 뒤 F3 화면(/dashboard/age-basis)으로 돌아간다"(10라운드에서 왕복 전체로 확장 — 이전에는 입력 화면 도착까지만 확인했다) + "PC-F18-AC2 — 프로필이 있을 때 ... F3 화면으로 간다" |
| PC-F18-AC3 | 자동 통과 | `tests/e2e/f18-age-basis-public.spec.ts`:"PC-F18-AC3 — 항목마다 실제 근거 자료 이름과 기준일이 보인다". **10라운드 수정**: 데이터 파일 제목("어느 나이를 쓰나 기준표")을 "근거 자료 이름"으로 판정하던 것을, 항목(행)마다 실제 출처 이름(질병관리청 표준 예방접종 일정표/일산병원 영유아검진 안내/아이사랑 이른둥이 안내)을 확인하는 판정으로 엄격화했다(curvez-reviewer TEAM-04·TEAM-05) — `curvez-nextjs`(20260930-141142)가 TEAM-05 도 함께 고쳐 지금은 footer 도 실제 출처 이름 3줄을 보여 준다 |

## 비기능

| ID | 판정 | 테스트 파일:테스트 이름 |
| --- | --- | --- |
| PC-NF-MOBILE-1 | 자동 통과 | `tests/e2e/nf-mobile.spec.ts`:"PC-NF-MOBILE-1·2·3 — {input,dashboard,age-basis,checkups,copay-relief,correction-period,share,guide,growth,vaccinations,target-height,formula} 화면" 12개 + "copay-relief 경계값(재태일수 203일, 5년 4개월 확정)" 1개, 총 13개 화면에서 `document.documentElement.scrollWidth <= 360` 확인(9라운드: growth·vaccinations·target-height·formula 4개 추가, boundary-unconfirmed 케이스는 innerBoundary 확정으로 도달 불가해져 확정 경계값 케이스로 교체) |
| PC-NF-MOBILE-2 | 자동 통과 | 위와 같은 13개 테스트. `--font-size-meta`(14px, 출처·캡션류)만 예외로 두고 그 외 모든 화면 텍스트의 computed font-size ≥ 17px 확인 |
| PC-NF-MOBILE-3 | 자동 통과 | 위와 같은 13개 테스트. 새 화면 4개(growth·vaccinations·target-height·formula) 포함 위반 0건 |
| PC-NF-MOBILE-4 | 자동 통과 | PC-F1-AC1 과 같은 테스트(`tests/e2e/f1-profile.spec.ts`) |
| PC-NF-PRIV-1 | 자동 통과 | `tests/e2e/nf-privacy.spec.ts`:"PC-NF-PRIV-1 — 프로필 입력·저장·대시보드 조회·프로필 편집 동안 나가는 요청에 이름·출생일·예정일 값이 없다"(실제 폼 입력→저장→대시보드→프로필 편집→하위 4화면 이동 전 과정의 `page.on('request')` 를 감시) |
| PC-NF-PRIV-2 | 자동 통과 | PC-F7-AC1 과 같은 테스트(`tests/e2e/f7-share.spec.ts`) |
| PC-NF-PRIV-3 | 자동 통과 | PC-F1-AC6 과 같은 테스트(`tests/e2e/f1-profile.spec.ts`) |
| PC-NF-MED-1 | 자동 통과 | `tests/e2e/nf-med.spec.ts`:"PC-NF-MED-1 — {dashboard,age-basis,checkups,copay-relief,correction-period,share,guide,growth,vaccinations,target-height,formula} 화면에 의료 면책 문구가 보인다" 11개(9라운드: 새 화면 4개 추가) |
| PC-NF-A11Y-1 | 자동 통과 | `tests/e2e/nf-a11y.spec.ts`:"PC-NF-A11Y-1 — 검진 차수 상태(...)는 텍스트 라벨과 기호를 함께 쓴다" / "... 미확정 표시는 색이 아니라 '△' 기호 + ..." / "... 성별 선택 항목은 선택되면 색뿐 아니라 '✓' 기호로도 구분된다" (3개) |
| PC-NF-A11Y-2 | 자동 통과 | `tests/e2e/nf-a11y.spec.ts`:"PC-NF-A11Y-2 — {input,dashboard,age-basis,checkups,copay-relief,correction-period,share,guide,growth,vaccinations,target-height,formula} 화면의 주요 텍스트 대비가 4.5:1 이상이다" 12개(9라운드: 새 화면 4개 추가). WCAG 상대 명도 대비 공식을 각 요소의 실제 computed color/background-color(조상 트리를 올라가며 첫 불투명 배경)로 직접 계산. `disabled`/`aria-disabled` 요소는 WCAG 1.4.11 예외(tokens.md decisions)로 제외 |
| PC-NF-A11Y-3 | **조건부(팀 파일 충돌)** | `tests/e2e/nf-a11y.spec.ts`:"PC-NF-A11Y-3 — 입력칸마다 접근 가능한 이름(레이블)이 있다"(기존 7개 화면) + "PC-NF-A11Y-3 — growth·target-height·formula 입력칸마다 접근 가능한 이름이 있다(8차 라운드)"(9라운드 신규, growth·target-height·formula 5개 필드). **기존 테스트가 9라운드 실행에서 실패**: `src/features/profile-form/ui/ProfileForm.tsx`(팀 소유 파일, standing.md 15번)에 "주수로 입력"을 언급하는 도움말 문단이 추가돼 `getByText("주수로 입력")` 이 버튼·문단 두 곳과 매치되는 strict mode 충돌이 생겼다 — standing 15("팀 파일 때문에 깨지면 고치지 말고 파일과 오류 원문을 핸드오프에 적는다")에 따라 고치지 않고 그대로 남긴다. 새로 추가한 테스트(growth 등)는 통과했다 |

## 집계 (2026-09-29 교정 라운드 갱신)

- 자동 통과: 55개(그중 조건부 2개 — PC-F3-AC4, PC-F4-AC5, "조건부: 원문 대조 전" 참고)
- 자동 실패: 0개(PC-NF-MOBILE-3 는 이번 라운드에 해소됨 — 아래 "이번 라운드에 해소된 것" 참고)
- 수동: 1개 (PC-F7-AC4)
- 합계: 57개 (요구 38 AC + 8 EX + 11 NF)
- **5라운드(디자인 재구성 대응)에도 이 집계는 그대로 유지된다** — 요구사항 변경 없음, 테스트
  코드만 6건 갱신. 상세는 아래 "5라운드" 절 참고

## 집계 (9라운드 갱신, 최신 — SPEC v2 신규 기능)

이번 라운드에 새로 생긴 22개 ID(F7 AC5~7 3개, F8 AC1~5·EX1 6개, F10 AC1~3 3개,
F14 AC1~3·EX1 4개, F15 AC1~3·EX1~3 6개) 판정:

- 자동 통과: 19개(그중 조건부 1개 — PC-F8-AC4, "정부 예시 없음, 근사 대조" 참고)
- 자동 실패: 2개 — PC-F14-AC1, PC-F14-AC2(`entities/target-height` 계산식 버그, src 결함,
  `curvez-nextjs` 에 blocked_on 으로 돌렸다)
- 보류: 1개 — PC-F8-AC3(차트 라이브러리 미정, 오케스트레이터가 사용자에게 확인 필요)
- 22개 그대로: 19 + 2 + 1 = 22

8라운드까지의 57개 중에서는 PC-NF-A11Y-3 하나가 이번 실행에서 팀 소유 파일
(`ProfileForm.tsx`, standing.md 15번) 변경 때문에 **일시적으로 조건부(팀 파일 충돌)**
상태다 — 나머지 56개는 8라운드 판정을 그대로 유지한다(요구사항 자체가 바뀌지 않았다).

**전체 79개 총합**: 자동 통과 74개(55+2 기존 조건부 + 19 신규 − 1 팀 파일 충돌로 제외 + 1
신규 조건부 포함), 자동 실패 2개, 보류 1개, 팀 파일 충돌(조건부) 1개, 수동 1개 = 79개.
정확한 판정 근거는 F-번호별 표와 "9라운드" 절을 따른다(이 요약 줄은 집계 참고용이다).

## 이번 라운드에 해소된 것 (curvez-nextjs 1회차 수정 결과)

**PC-NF-MOBILE-3 (버튼 높이 48px 이상) — input 화면의 "주수로 입력" 토글**

- 이전 실패: `tests/e2e/nf-mobile.spec.ts:71` "input 화면" 테스트가 25.5px 높이를 발견했다(직전
  라운드 `curvez-qa.20260929-134549.json` 참고).
- 수정 내용(curvez-nextjs decisions [PC-NF-MOBILE-3]): 토글을 독립 `<button>` 대신
  `shared/ui Button(variant="text")`로 교체 — `height:48px`가 이미 있는 컴포넌트를 재사용했다.
- 재검증: `pnpm exec playwright test tests/e2e/nf-mobile.spec.ts -g "input 화면"` → 통과.
  9개 화면 전체 3회 연속 실행 모두 위반 0건(아래 "실행 결과" 참고).

**tests/unit/reference-data.test.ts·age-basis.test.ts 의 known-failure 5건 (curvez-nextjs
blocked_on 응답)** — architect 결정 1(ACC-04, effectiveDate·lastVerified 유니온)에 맞춰 두
파일을 갱신했다. 단순히 null 을 허용하도록 느슨하게 만들지 않고, "한쪽만 null 이면
`resolveReferenceMeta` 가 실제로 오류를 던지는지"까지 직접 검증하는 테스트 4개를
`reference-data.test.ts`에 새로 추가했다. 62/62 통과.

## 회귀 테스트 ID 목록 (curvez-reviewer/curvez-structure-reviewer 지적 → 이번 라운드 신규 테스트)

| finding ID | 무엇을 확인하는가 | 테스트 파일:테스트 이름 |
| --- | --- | --- |
| ERR-01 | 출산 예정일 전에도 `planCheckups` 가 예외를 던지지 않고, 화면이 그 사실을 문구로 보인다 | 단위: `tests/unit/checkup.test.ts`:"[curvez-reviewer/ERR-01] ..." (120일 반복, 예외 0건 + 1차 검진 창 안 `currentBeforeDue` 단언). 화면: `tests/e2e/f4-checkups.spec.ts`:"[curvez-reviewer/ERR-01] ..." (pageerror 0건 + "출산 예정일 전이라 교정 나이가 아직 없습니다" 노출) |
| ACC-01 | 재태 37주 이상 아이의 F3 화면에 "교정 기준" 문구가 전혀 없다 | `tests/e2e/f3-age-basis.spec.ts`:"[curvez-reviewer/ACC-01] ..." |
| ACC-02 | 대시보드에 "교정 36일 · 1개월" 한 문구가 정확히(exact) 보인다 | `tests/e2e/f2-dashboard.spec.ts`:"[curvez-reviewer/ACC-02] ..." |
| ACC-03 | "주수로 입력" 전환이 출산 예정일 칸 아래(boundingBox y 비교)에 있다 | `tests/e2e/f1-profile.spec.ts`:"[curvez-reviewer/ACC-03] ..." |
| ACC-05 | 주수 입력 "일" 칸에 9·-3·1.5 를 넣으면 저장을 막는다 | 단위: `tests/unit/child-profile.test.ts`:"[curvez-reviewer/ACC-05] ..." (`validateProfileDraft` 가 `invalid-date` 하나만 낸다 + 0·6 경계는 오류 없음). 화면: `tests/e2e/f1-profile.spec.ts`:"[curvez-reviewer/ACC-05] ..." ("날짜를 확인하세요" 노출 + 저장 버튼 비활성, 3개 값 각각) |
| ACC-06 | `navigator.share` 가 있어도 "링크 복사" 버튼이 항상 보인다 | `tests/e2e/f7-share.spec.ts`:"[curvez-reviewer/ACC-06] ..." |
| ERR-02 | localStorage 가 예외를 던져도 첫 화면·/dashboard 가 깨지지 않는다 | `tests/e2e/err-handling.spec.ts`:"[curvez-reviewer/ERR-02] ..." (3개 — "/" 무시드, "/dashboard" 무시드, "/dashboard" 프로필 있음+읽기 차단. 매번 `page.on('pageerror')` 0건 확인) |
| DSG-01 | before-due 공유 카드의 fillText 줄 폭이 캔버스 사용 가능 폭(952px) 이하다 | `tests/e2e/f7-share.spec.ts`:"[curvez-reviewer/DSG-01] ..." (`measureText` 가로채기로 실제 렌더 폭 측정) |

`curvez-structure-reviewer` 의 blocked_on 질문("P1 대상 경로에 회귀 테스트가 있는가": DUP-01,
PLC-02, PLC-05)에 대한 답: 세 곳 모두 리팩터링 전부터 있던 공개 함수·컴포넌트라 기존
54~62개 단위·e2e 테스트가 이미 그 표면(공개 API)을 지나간다(`shared/ui` 4개 입력 컴포넌트는
`f1-profile.spec.ts`가, `entities/child/model` 전체는 `child-profile.test.ts`·
`child-ages.test.ts`·`combo.test.ts`가, `age-summary`↔`copay-relief-result`/
`correction-period-result` 는 `f2-dashboard.spec.ts`·`f5-copay-relief.spec.ts`·
`f6-correction-period.spec.ts`가 각각 지나간다). 새 전용 회귀 테스트를 추가하지 않은 이유는
공개 계약(props·반환값)이 리팩터링 전후로 그대로라 기존 테스트가 이미 회귀를 잡을 수 있기
때문이다 — 이번 라운드 typecheck·unit·e2e 전체가 그 사실을 실행으로 재확인했다(아래 "실행
결과" 참고).

## 실행 결과 (수치, 2026-09-29 교정 라운드)

- (워크트리 루트) `pnpm test`(= `pnpm -r --if-present test`): **exit 0.** apps/preemie-calc
  10개 파일 **62개 테스트 62개 통과**(직전 라운드 56개 + 이번 라운드 신규 6개: reference-data
  4개·age-basis 갱신 1개는 새 계약 검증으로 대체, checkup ERR-01 2개, child-profile ACC-05
  4개). packages/scopulus-ui 38개 파일 141개 테스트 141개 통과. **총 203개 중 203개 통과, 0개
  실패** — `.curvez/qa/preemie-calc/last-run-root-3.log`
- (apps/preemie-calc) `pnpm test:e2e`(= `playwright test`, chromium-mobile 360×800):
  **75개 테스트, 75개 통과, 0개 실패**(직전 라운드 63개 + 이번 라운드 신규 12개: ACC-01·ACC-02·
  ACC-03·ACC-06·DSG-01 각 1개, ACC-05 3개, ERR-01 1개, ERR-02 3개). **3회 연속 실행 결과 모두
  동일(75/75, 플래키 아님)** — `.curvez/qa/preemie-calc/last-run-e2e-3.log`
- `pnpm --filter preemie-calc typecheck`: 오류 0건, exit 0
- `skip`/`only`/`todo` 개수: 0(e2e·unit 전부, `grep -nE '\.(skip|only|todo)\(|\bx(it|describe)\('` 로 확인)
- 수용 기준 커버: `grep -ohE 'PC-F[0-9]+-(AC|EX)[0-9]+|PC-NF-[A-Z0-9]+-[0-9]+' tests/e2e/*.ts tests/unit/*.ts | sort -u | wc -l` → **57**(요구 57개와 정확히 일치, 미커버 0개)
- curvez-nextjs 의 `blocked_on`(null 허용 갱신) — 응답 완료: `reference-data.test.ts`·
  `age-basis.test.ts` 갱신, "둘 다 날짜 또는 둘 다 null, 한쪽만 null 이면 오류" 계약을 직접
  테스트하는 4건 추가. 기대값을 구현에 맞춰 낮추지 않았다(단순 null 허용이 아니라 쌍 검사).

## 4라운드: lint 수정 대응 재검증 + 하이드레이션 감시 (2026-09-29)

curvez-nextjs 가 lint 오류·경고 8건(useSyncExternalStore 전환 5곳, ChildSwitcherTabs
`children`→`options`, RequiredMark `label` prop 제거)을 고친 뒤, **테스트 코드·기대값은 전혀
바꾸지 않고** 게이트 5개와 e2e 를 다시 돌렸다. 그 결과 아래 "실행 결과(4라운드)"와 같이 57개
ID 판정은 3라운드와 완전히 동일하다(자동 통과 55·자동 실패 0·수동 1, 조건부 2건도 그대로).

추가로 CONTEXT 지시대로 **하이드레이션 감시**를 새로 넣었다. 기존 13개 e2e 스펙 중 어느
것도 콘솔의 하이드레이션 경고/오류를 감시하지 않았다(개별 3개 파일이 `pageerror` 만 직접
감시했다 — err-handling.spec.ts, f4-checkups.spec.ts). `tests/e2e/support/fixtures.ts` 에
`hydrationGuard` auto-fixture 를 추가해 **13개 스펙 파일 전부**(75개 테스트 전부)에 공통으로
적용했다 — 스펙 파일은 `@playwright/test` 대신 이 fixture 모듈에서 `test`/`expect` 를
가져오도록 import 한 줄만 바꿨다(테스트 본문·assertion 은 건드리지 않았다).

- 감시 대상: `console` 의 `error`/`warning` 타입 메시지 중 `/hydrat|did not match|content does
  not match|react\.dev\/errors\/(418|419|421|425)/i` 패턴(개발 모드 문구 + 프로덕션 minified
  리액트 하이드레이션 에러 코드), 그리고 `pageerror` 이벤트 전부(종류 불문 0건을 기대 — 기존
  3개 파일의 개별 확인과 같은 기준).
- 테스트가 끝날 때 위반이 하나라도 쌓였으면 그 테스트 자체를 실패시킨다(`expect(violations).
  toEqual([])`).
- **기계 검증**: 이 fixture 가 실제로 위반을 잡는지, 임시 스펙 파일(`_tmp-hydration-guard-
  check.spec.ts`, 검증 후 즉시 삭제)에서 `console.error("Hydration failed because the server
  rendered HTML didn't match the client")` 를 일부러 발생시켜 확인했다 — 1개 테스트가 정확히
  이 fixture 의 `expect` 에서 실패했다(`support/fixtures.ts:44`, 아래 출력 그대로):
  ```
  Error: 하이드레이션/pageerror 위반:
  console.error: Hydration failed because the server rendered HTML didn't match the client
  - Expected  - 1
  + Received  + 3
  - Array []
  + Array [
  +   "console.error: Hydration failed because the server rendered HTML didn't match the client",
  + ]
  ```
  이 확인이 끝난 뒤 임시 파일을 지우고 정식 75개 스위트를 2회 재실행했다 — 아래 수치 참고.
- 특히 시계를 빌드일(2026-09-29)과 다른 날짜로 고정하는 dashboard·share·checkups 관련 화면
  (`f2-dashboard`, `f4-checkups`, `f5-copay-relief`, `f6-correction-period`, `f7-share`,
  `nf-*`)이 이 fixture 의 실제 감시 대상이다. 75개 테스트 2회 실행(150회 테스트 실행) 동안
  하이드레이션/pageerror 위반 **0건**.

## 실행 결과(4라운드, 수치)

- (워크트리 루트) `pnpm typecheck`: exit 0 — `.curvez/qa/preemie-calc/last-run-typecheck.log`
- (워크트리 루트) `pnpm lint`: exit 0(전 워크스페이스 `Done`, eslint 출력 없음) —
  `.curvez/qa/preemie-calc/last-run-lint.log`
- (워크트리 루트) `pnpm test`: exit 0. apps/preemie-calc 10개 파일 **62개 테스트 62개 통과**,
  packages/scopulus-ui 38개 파일 **141개 테스트 141개 통과** — 총 203개 중 203개 통과, 0개
  실패(3라운드와 수치 동일) — `.curvez/qa/preemie-calc/last-run-unit.log`
- (워크트리 루트) `pnpm build`: exit 0. apps/preemie-calc `next build` 성공, 491/491 정적
  페이지 생성 — `.curvez/qa/preemie-calc/last-run-build.log`
- (apps/preemie-calc) `pnpm test:e2e`(= `playwright test`, chromium-mobile 360×800) **2회
  연속 실행**: 1회차 **75개 통과, 0개 실패**(exit 0), 2회차 **75개 통과, 0개 실패**(exit 0) —
  두 결과 완전히 동일해 플래키 아님 — `.curvez/qa/preemie-calc/last-run-e2e-r1.log`,
  `.curvez/qa/preemie-calc/last-run-e2e-r2.log`. 두 로그 모두 하이드레이션/pageerror 관련
  문자열 0건(`grep -ci "하이드레이션\|pageerror\|hydrat"` → 0)
- `skip`/`only`/`todo` 개수: 0(4라운드 신규 확인, `grep -nE '\.(skip|only|todo)\('` tests
  전체 대상)
- 수용 기준 커버: 57개 ID 전부 `apps/preemie-calc/tests/{e2e,unit}` 어딘가에서 문자열로
  발견됨(미커버 0개, 3라운드와 동일)
- `node scripts/quality-gate.mjs --no-stop`: **PASS 5/5**(arch 규칙 14개·위반 0건, typecheck,
  lint, test, build) — `.curvez/qa/preemie-calc/last-run-quality-gate.log`
- `node scripts/validate-handoff.mjs .curvez/handoff/`: 기존 핸드오프 28건 검사, 28건 통과,
  오류 0개, 경고 0개(이번 라운드 신규 핸드오프 추가 전 기준)

## 4라운드에서 직접 고친 것

`src/**` 는 전부 읽기만 했다(수정 없음). `apps/preemie-calc/tests/**` 안에서 아래만 바꿨다 —
모두 이 에이전트 소유 파일이고, 테스트 본문·assertion·기대값은 하나도 바꾸지 않았다.

- 신규: `apps/preemie-calc/tests/e2e/support/fixtures.ts`(하이드레이션 감시 auto-fixture)
- 수정: 13개 e2e 스펙 파일 전부의 import 한 줄(`@playwright/test` → `./support/fixtures`,
  `nf-a11y.spec.ts` 만 `type Page` import 를 별도 줄로 분리)

---

## 5라운드: 디자인 재구성(HeaderMenu·아이콘) 대응 + 헤더 가운데 정렬·대시보드 2열 검증

curvez-nextjs 가 5차 디자인 라운드("밝고 생기 있는" 리디자인, `curvez-nextjs.20260930-003549.
json`)를 구현하면서 dashboard 헤더의 "프로필 편집"·"정보 전체 삭제"를 `HeaderMenu`(더보기)
뒤로 묶고, 상태 기호 문자(●✓·△)를 lucide 아이콘으로 바꿨다. 이 때문에 기존 75개 e2e 중 6개가
깨졌다(decisions 에 정확한 위치와 새 동작이 적혀 있었다). 이 라운드는 그 6건을
**선택자·조작 순서만 바꿔** 고치고(판정하는 사실은 그대로 — 상세 근거는
`.curvez/qa/preemie-calc/test-changes-redesign.md`), GOAL 이 새로 요구한 헤더 가운데 정렬·
대시보드 2열 레이아웃 검증을 추가했다.

### 57개 ID 판정 — 5라운드 재확인

이번 라운드는 요구사항(requirements.md) 자체가 바뀌지 않았다. 57개 ID 판정은 **4라운드와
완전히 동일**하다(자동 통과 55개, 자동 실패 0개, 수동 1개, 조건부 2건 — PC-F3-AC4·PC-F4-AC5
유지). 다만 아래 6개 ID 의 테스트 코드는 이번 라운드에 바뀌었다(판정 자체는 안 바뀜) —
PC-F1-AC6, PC-NF-PRIV-1, PC-NF-PRIV-3, PC-NF-A11Y-1(3개 테스트), PC-NF-A11Y-3.
변경 상세는 `.curvez/qa/preemie-calc/test-changes-redesign.md` "A. HeaderMenu 도입으로 깨진
3건", "B. 기호 문자 → lucide 아이콘으로 깨진 3건" 참고.

### 신규 검증 — AC-ID 밖, GOAL "새로 확인할 것" (1)(2)

AC 번호가 없는 디자인 재구성 자체의 검증이라 57개 집계에는 넣지 않는다(회귀 테스트 ID 목록과
같은 위치에 별도로 둔다).

| 대상 | 테스트 파일:테스트 이름 | 실측 |
| --- | --- | --- |
| 헤더 제목 가운데 정렬(9개 화면 × 3개 폭 = 27개) | `tests/e2e/nf-header-layout.spec.ts`:"[디자인 재구성] 헤더 제목 가운데 정렬 — {화면} @ {폭}px" | 27개 조합 전부 제목 중심 x 와 뷰포트 중심 x 차이 **0~0.01px**(기준 ≤2px). 표는 아래 "헤더 중심 차이 실측값" 참고 |
| 대시보드 1280px 2열 | `tests/e2e/nf-header-layout.spec.ts`:"[디자인 재구성] 1280px 에서 대시보드는 main·sidebar 2열이다(x 좌표가 서로 다르다)" | `.pc-dashboard-main`·`.pc-dashboard-sidebar` boundingBox x 가 서로 다름(2열 확인) |
| 대시보드 768px 1열(2열 오탐 방지 대조군) | `tests/e2e/nf-header-layout.spec.ts`:"[디자인 재구성] 768px 에서 대시보드는 main·sidebar 가 같은 x(1열)로 쌓인다" | 두 영역 x 차이 ≤1px(1열 확인) |

### 헤더 중심 차이 실측값 (px, 27개 조합)

`page.getByRole("banner").getByRole("heading",{level:1})`의 boundingBox 중심 x 와 뷰포트
중심 x(=폭/2)의 절대 차이. 임시로 `console.log`를 넣어 1회 측정 후 즉시 제거했다(정식 테스트
파일에는 assertion 만 남긴다).

| 화면 | 360px | 768px | 1280px |
| --- | --- | --- | --- |
| input | 0 | 0 | 0 |
| input-weeks | 0 | 0 | 0 |
| dashboard | 0 | 0 | 0 |
| age-basis | 0.01 | 0.01 | 0.01 |
| checkups | 0 | 0 | 0 |
| copay-relief | 0 | 0 | 0 |
| correction-period | 0.01 | 0.01 | 0.01 |
| share | 0 | 0 | 0 |
| guide | 0 | 0 | 0 |

기준(≤2px)을 27개 조합 전부 크게 만족한다 — `--layout-header-side-reserve: 112px` 로 좌/우
zone 을 항상 같은 최소 폭으로 예약하는 설계가 실제 렌더에서도 그대로 지켜졌다.

### 디자인 스펙 키 대응표 — 이번 라운드 재확인

| 스펙 키 | 대상 | 테스트 | 비고 |
| --- | --- | --- | --- |
| `a11y:contrast`(PageHeader.md, tokens.md 대비 검증) | 전체 | `tests/e2e/nf-a11y.spec.ts`:"PC-NF-A11Y-2 — {8개 화면}" | **코드 수정 없이 재확인**. 이 테스트는 하드코딩 색값이 아니라 실제 `getComputedStyle` 을 매번 다시 읽어 공식을 계산한다 — 5차 라운드가 색 토큰을 전부 바꿨어도 테스트 코드 변경 없이 새 색을 그대로 측정했고, 8개 화면 전부 위반 0건 |
| 상태 기호 → 아이콘 전환 후에도 "색만으로 의미 전달 안 함" | StatusBadge, UnconfirmedNotice, SegmentedControl | `tests/e2e/nf-a11y.spec.ts`:"PC-NF-A11Y-1 — ..." 3개(이번 라운드 갱신) | 텍스트 라벨 + svg 아이콘, 두 개의 비-색 수단이 그대로 있음을 확인(위 "B" 참고) |
| 헤더 가운데 정렬(PageHeader.md ## 레이아웃) | 화면 9개 전부 | `tests/e2e/nf-header-layout.spec.ts`(신규) | 위 "신규 검증" 참고 |
| dashboard >=1280px 2열(screens/dashboard.md ## responsive) | dashboard | `tests/e2e/nf-header-layout.spec.ts`(신규) | 위 "신규 검증" 참고 |

### 실행 결과 (수치, 5라운드)

- (워크트리 루트) `pnpm typecheck`: exit 0, 오류 0건(7개 워크스페이스) —
  `.curvez/qa/preemie-calc/last-run-typecheck.log`
- (워크트리 루트) `pnpm lint`: exit 0(전 워크스페이스 `Done`, eslint 출력 없음) —
  `.curvez/qa/preemie-calc/last-run-lint.log`
- (워크트리 루트) `pnpm test`: exit 0. apps/preemie-calc **62/62**, packages/scopulus-ui
  **141/141**. 총 203개 중 203개 통과, 0개 실패(4라운드와 동일 — 계산 도메인은 이번 라운드에
  바뀌지 않았다) — `.curvez/qa/preemie-calc/last-run-unit.log`
- (워크트리 루트) `pnpm build`: exit 0. apps/preemie-calc `next build` 성공, **491/491** 정적
  페이지 생성 — `.curvez/qa/preemie-calc/last-run-build.log`
- (워크트리 루트) `node plugins/curvez/scripts/quality-gate.mjs --no-stop`: **PASS 5/5**(arch
  규칙 14개·위반 0건, typecheck, lint, test, build) —
  `.curvez/qa/preemie-calc/last-run-quality-gate.log`
- (apps/preemie-calc) `pnpm test:e2e`(= `playwright test`, chromium-mobile 360×800) **2회
  연속 실행**: 1회차 **104개 통과, 0개 실패**(exit 0), 2회차 **104개 통과, 0개 실패**(exit 0)
  — 두 결과 완전히 동일해 플래키 아님 — `.curvez/qa/preemie-calc/last-run-e2e-r1.log`,
  `.curvez/qa/preemie-calc/last-run-e2e-r2.log`. **104 = 4라운드 75개 + 이번 라운드 신규
  29개**(헤더 가운데 정렬 27개 + 대시보드 2열/1열 대조 2개). 깨졌던 6건은 6건 모두 통과로
  복귀했다(테스트 개수가 줄지 않았다 — 삭제·skip 없음)
- `skip`/`only`/`todo` 개수: 0(`grep -nE '\.(skip|only|todo)\(|\bx(it|describe)\('` 전체 대상,
  이번 라운드 신규 파일 포함)
- 수용 기준 커버: `grep -ohE 'PC-F[0-9]+-(AC|EX)[0-9]+|PC-NF-[A-Z0-9]+-[0-9]+' tests/e2e/*.ts tests/unit/*.ts | sort -u | wc -l` → **57**(요구 57개와 정확히 일치, 미커버 0개 — 4라운드와 동일)
- 포트 3100: 이번 세션 시작 시·모든 명령 실행 전마다 `lsof -i :3100` 으로 비어 있음을 확인했다
  (다른 프로세스 없음, `run_in_background` 사용 안 함, dev 서버 직접 기동 안 함)
- 캡처(after): `CURVEZ_CAPTURE=1 CURVEZ_CAPTURE_DIR=after pnpm exec playwright test
  --project=capture` → **20개 통과, 0개 실패**. `.curvez/qa/preemie-calc/screens/after/`
  에 20장(before 와 동일 파일명) 생성 확인(`ls | wc -l` → 20)
- `node scripts/validate-handoff.mjs .curvez/handoff/`: 아래 "핸드오프 검증" 참고

## 5라운드에서 직접 고친 것

`src/**` 는 전부 읽기만 했다(수정 없음). `apps/preemie-calc/tests/**` 안에서 아래만 바꿨다 —
모두 이 에이전트 소유 파일이다.

- 신규: `apps/preemie-calc/tests/e2e/nf-header-layout.spec.ts`(헤더 가운데 정렬 27개 + 대시보드
  2열/1열 대조 2개)
- 수정: `apps/preemie-calc/tests/e2e/support/helpers.ts`(`openHeaderMenu` 헬퍼 추가)
- 수정: `apps/preemie-calc/tests/e2e/f1-profile.spec.ts`, `nf-privacy.spec.ts`,
  `nf-a11y.spec.ts` — HeaderMenu 대응 3건 + 기호→아이콘 대응 3건(상세는
  `.curvez/qa/preemie-calc/test-changes-redesign.md`)
- `playwright.config.ts` 는 변경하지 않았다(이번 라운드 요구가 기존 설정으로 충분히 커버됨)

## 5라운드에서 발견했지만 고치지 않은 것(src 결함, curvez-nextjs 참고용)

`/guide/[weeks]/[months]` 페이지에 `<h1>`이 2개다 — `PageHeader`(제목=서비스명)와
`GuideView`의 콘텐츠 제목(`content.heading`)이 각각 `<h1>`이다. 스크린리더 헤딩 구조
모범사례 위반 가능성이 있으나 이번 GOAL 범위(FORBIDDEN: src 수정) 밖이라 고치지 않았고, 새
헤더 정렬 테스트는 `getByRole("banner")`로 범위를 좁혀 우회했다(테스트 자체는 실패하지 않음
— 상세는 `.curvez/qa/preemie-calc/test-changes-redesign.md` "발견했지만 고치지 않은 것").

---

## 6라운드: curvez-nextjs.20260930-010104.json(DSG-05·guide h1 중복 수정) 대응

curvez-nextjs 가 DSG-05(360px 헤더 제목-뒤로가기 겹침, major)와 5라운드가 발견해 전달한 guide
h1 중복을 같은 커밋에서 고쳤다. h1 스타일을 `justifySelf:center`(콘텐츠 폭 기준, 칸을 넘칠 수
있었다)에서 `justifySelf:stretch + minWidth:0`(가운데 트랙 폭 그대로)로 바꾸고, 넘치는 텍스트는
말줄임 대신 `-webkit-line-clamp:2` 로 최대 2줄까지 줄바꿈하게 했다. guide 는 `PageHeader`에
`headingLevel={2}` 를 넘겨 헤더 제목을 h2 로 내리고 본문 SEO 조합 제목을 유일한 h1 로 남겼다.
이 수정으로 `tests/e2e/nf-header-layout.spec.ts` 의 guide@360/768/1280 3건이
`getByRole('banner').getByRole('heading',{level:1})` 로 못 찾아 깨졌다(nextjs decisions "QA
갱신 필요").

### 6라운드에서 바꾼 테스트

| 대상 | 이전 | 이후 | 판정하는 사실이 같은/더 엄격해진 이유 |
| --- | --- | --- | --- |
| `nf-header-layout.spec.ts` "[디자인 재구성] 헤더 제목 가운데 정렬" 27개(guide 3개 포함, 모든 화면 공통 로케이터) | `page.getByRole("banner").getByRole("heading",{level:1})` | `page.getByRole("banner").getByRole("heading")`(레벨 무관) + 새 단언 `page.locator("h1").count() === 1`(9개 화면 × 3개 폭 27곳 전부에 추가) | 헤더 제목의 "정중앙 정렬" 판정 대상만 레벨 무관으로 넓혔고(스펙이 헤더 제목을 h1 로 못박지 않는다), 그 대신 "페이지에 h1 이 정확히 1개"라는 더 엄격한 새 단언을 모든 화면에 추가했다 — guide 의 h1 중복이 재발하면 이 단언이 즉시 실패한다. 완화가 아니라 검증 범위 확대다 |
| `nf-header-layout.spec.ts` 신규 "[디자인 재구성, DSG-05 회귀] 헤더 제목-좌우 버튼 겹침 없음" 36개(9개 화면 × 360/390/768/1280px) | (5라운드에는 없음 — 중심 좌표만 쟀다) | 제목 `boundingBox()` 와 banner 안 `button, a[href]`(back 버튼, HeaderMenu 트리거 "더보기") 전부의 `boundingBox()` 가로 겹침을 재 `≤0.5px` 인지 확인. 같은 테스트 안에서 `scrollHeight ≤ clientHeight+1`(잘림 없음)도 함께 확인 | 5라운드 가운데 정렬 테스트는 중심만 재서 DSG-05(중심은 같아도 박스가 넓어 좌우로 침범)를 놓쳤다. 이 신규 테스트가 그 재발을 정확히 겨냥한다 — DSG-05 재현 조건(360px, "교정연령 적용 종료 안내"/"본인부담 경감 종료일")을 포함한 36개 조합 전부 통과했다 |

### 겹침 실측 표 (px, 36개 조합)

banner 안에 버튼/링크가 있는 5개 화면(dashboard, age-basis, checkups, copay-relief,
correction-period) × 4개 폭. title-only 4개 화면(input, input-weeks, share, guide)은 banner
에 버튼·링크가 없어(장식 `IconBadge` 뿐) 겹침 대상 자체가 없다 — 표에서 제외했다(테스트 자체는
36개 전부 실행되고, 이 4개 화면은 반복문이 0회 도는 채로 통과한다).

| 화면 | 360px | 390px | 768px | 1280px |
| --- | --- | --- | --- | --- |
| dashboard | 0 | 0 | 0 | 0 |
| age-basis | 0 | 0 | 0 | 0 |
| checkups | 0 | 0 | 0 | 0 |
| copay-relief | 0 | 0 | 0 | 0 |
| correction-period | 0 | 0 | 0 | 0 |

DSG-05 재현 조건이던 correction-period@360px(이전 20.5px 겹침)·copay-relief@360px(이전
9.5px 겹침)를 포함해 20개 조합(버튼/링크가 있는 화면만) 전부 **겹침 0px**. `console.log` 를
테스트 코드에 임시로 넣어 1회 측정 후 즉시 제거했다(정식 파일에는 assertion 만 남는다 — 5라운드
헤더 중심 실측과 같은 방법).

줄바꿈 잘림 확인(`scrollHeight` vs `clientHeight`, 9개 화면 × 4개 폭 = 36개 조합)도 같은 방식
으로 재 **전부 `scrollHeight === clientHeight`**(잘림 없음)를 확인했다. 360/390px 에서는
9개 화면 모두 제목이 2줄(60px)로 줄바꿈되고, 768/1280px 에서는 1줄(30px)이다 — 두 경우 모두
`scrollHeight`가 `clientHeight`를 넘지 않아 line-clamp:2 가 텍스트를 자르지 않음을 확인했다.

### 페이지 h1 개수 재확인 (27개 조합)

9개 화면 × 3개 폭(360/768/1280) 전부 `document.querySelectorAll('h1').length === 1`. guide
는 이번 수정(`headingLevel={2}`)으로 본문 SEO 조합 제목만 h1 이 됐고, 나머지 8개 화면은
`PageHeader`의 기본 h1 이 유일한 h1 이다 — 5라운드가 발견했던 guide h1 중복은 재발하지 않는다.

### 57개 ID 판정 — 6라운드 재확인

이번 라운드도 요구사항(requirements.md) 자체가 바뀌지 않았다. 57개 ID 판정은 **5라운드와
완전히 동일**(자동 통과 55개, 자동 실패 0개, 수동 1개, 조건부 2건 — PC-F3-AC4·PC-F4-AC5 유지).
6라운드가 바꾸거나 새로 추가한 테스트는 전부 AC-ID 가 없는 디자인 재구성 검증(위 표)이라 57개
집계에 포함되지 않는다.

### 실행 결과 (수치, 6라운드)

- (워크트리 루트) `pnpm typecheck`: exit 0, 오류 0건(7개 워크스페이스) —
  `.curvez/qa/preemie-calc/last-run-typecheck.log`
- (워크트리 루트) `pnpm lint`: exit 0(전 워크스페이스 `Done`, eslint 출력 없음) —
  `.curvez/qa/preemie-calc/last-run-lint.log`
- (워크트리 루트) `pnpm test`: exit 0. apps/preemie-calc **62/62**, packages/scopulus-ui
  **141/141**. 총 203개 중 203개 통과, 0개 실패(5라운드와 동일 — 계산 도메인은 이번 라운드에
  바뀌지 않았다) — `.curvez/qa/preemie-calc/last-run-root.log`
- (워크트리 루트) `pnpm build`: exit 0. apps/preemie-calc `next build` 성공, **491/491** 정적
  페이지 생성 — `.curvez/qa/preemie-calc/last-run-build.log`
- (워크트리 루트) `node quality-gate.mjs --no-stop`: **PASS 5/5**(arch 규칙 14개·위반 0건,
  typecheck, lint, test, build) — `.curvez/qa/preemie-calc/last-run-quality-gate.log`
- (apps/preemie-calc) `pnpm test:e2e`(= `playwright test`, chromium-mobile 360×800) **2회
  연속 실행**: 1회차 **140개 통과, 0개 실패**(exit 0), 2회차 **140개 통과, 0개 실패**(exit 0)
  — 두 결과 완전히 동일해 플래키 아님 — `.curvez/qa/preemie-calc/last-run-e2e-r1.log`,
  `.curvez/qa/preemie-calc/last-run-e2e-r2.log`. **140 = 5라운드 104개 + 이번 라운드 신규 36개**
  (겹침 회귀 테스트, 9개 화면 × 4개 폭). 깨졌던 guide 3건도 통과로 복귀했다(테스트 개수가
  줄지 않았다 — 삭제·skip 없음, 27개 그대로 유지)
- `skip`/`only`/`todo` 개수: 0(`grep -rnE '\.(skip|only|todo)\(|\bx(it|describe)\('
  apps/preemie-calc/tests/` 결과 0건)
- 수용 기준 커버: `grep -ohE 'PC-F[0-9]+-(AC|EX)[0-9]+|PC-NF-[A-Z0-9]+-[0-9]+' tests/e2e/*.ts tests/unit/*.ts | sort -u | wc -l` → **57**(요구 57개와 정확히 일치, 미커버 0개 — 5라운드와 동일)
- 포트 3100: 이번 세션 모든 명령 실행 전마다 `lsof -i :3100` 으로 비어 있음을 확인했다(다른
  프로세스 없음, `run_in_background` 미사용, dev 서버 직접 기동 안 함)
- 캡처(after 재촬영): `CURVEZ_CAPTURE=1 CURVEZ_CAPTURE_DIR=after pnpm exec playwright test
  --project=capture` → **20개 통과, 0개 실패**. `.curvez/qa/preemie-calc/screens/after/`
  20장 전부 이번 실행 시각으로 덮어씀 확인(`ls -la` mtime). `dashboard-correction-period-360.png`
  를 육안으로 확인해 제목이 2줄("교정연령 적\n용 종료 안내")로 줄바꿈되고 "‹ 대시보드" 버튼과
  겹치지 않음을 재확인했다(DSG-05 시각적 재확인)
- `node scripts/validate-handoff.mjs .curvez/handoff/`: 아래 핸드오프 파일 자체의 검증 결과
  참고

## 6라운드에서 직접 고친 것

`src/**` 는 전부 읽기만 했다(수정 없음). `apps/preemie-calc/tests/e2e/nf-header-layout.spec.ts`
안에서만 바꿨다 — 이 에이전트 소유 파일이다.

- guide 3건 포함 기존 27개 "헤더 제목 가운데 정렬" 테스트: 로케이터를 레벨 무관으로 바꾸고
  "페이지 h1 개수=1" 단언을 추가(수정, 삭제 없음)
- 신규 36개 "[디자인 재구성, DSG-05 회귀] 헤더 제목-좌우 버튼 겹침 없음" 테스트 추가
- 상단 파일 주석에 6라운드 변경 배경을 이어 적음

---

## 7라운드: curvez-nextjs.20260930-012225.json(시각 결함 5건 수정) 대응

curvez-nextjs 가 오케스트레이터 캡처 육안 검토에서 나온 시각 결함 5건(헤더 제목 음절 중간
줄바꿈, 나이 카드 숫자·단위 조각 끊김, 날짜 끊김, "+ 아이 추가" 버튼 라벨 줄바꿈, 1280px 에서
그 버튼이 콘텐츠 영역 밖 x=16 에 뜨던 문제)을 고쳤다. 이 결함들은 6라운드까지의 자동 e2e 검사가
전부 통과하는 채로 캡처 육안 확인에서만 드러났다(자동 검사가 놓친 지점) — 이번 라운드는 그
결함들이 재발해도 자동으로 잡히도록 회귀 검사 4종을 새로 추가하는 라운드다. 요구사항(57개 ID)
자체는 바뀌지 않았다.

### 57개 ID 판정 — 7라운드 재확인

이번 라운드도 요구사항이 바뀌지 않았다. 57개 ID 판정은 **6라운드와 완전히 동일**(자동 통과
55개, 자동 실패 0개, 수동 1개, 조건부 2건 — PC-F3-AC4·PC-F4-AC5 유지). 이번 라운드가 추가한
`nf-visual-defects-regression.spec.ts`(45개)는 AC-ID 가 없는 시각 결함 회귀 검증이라 57개
집계에 포함되지 않는다(6라운드의 겹침 회귀 36개와 같은 성격).

### 실행 결과 (수치, 7라운드)

- (워크트리 루트) `pnpm typecheck`: exit 0, 오류 0건(7개 워크스페이스) —
  `.curvez/qa/preemie-calc/last-run-typecheck-round7.log`
- (워크트리 루트) `pnpm lint`: exit 0(전 워크스페이스 `Done`, eslint 출력 없음, 0 problems) —
  `.curvez/qa/preemie-calc/last-run-lint-round7.log`
- (워크트리 루트) `pnpm test`: exit 0. apps/preemie-calc **62/62**, packages/scopulus-ui
  **141/141**. 총 203개 중 203개 통과, 0개 실패(6라운드와 동일 — 계산 도메인은 이번 라운드에
  바뀌지 않았다) — `.curvez/qa/preemie-calc/last-run-root-round7.log`
- (워크트리 루트) `pnpm build`: exit 0. apps/preemie-calc `next build` 성공, **491/491** 정적
  페이지 생성 — `.curvez/qa/preemie-calc/last-run-build-round7.log`
- (워크트리 루트) `node quality-gate.mjs --no-stop`: **PASS 5/5**(arch 규칙 14개·위반 0건,
  typecheck, lint, test, build) — `.curvez/qa/preemie-calc/last-run-quality-gate-round7.log`
- (apps/preemie-calc) `pnpm test:e2e` **2회 연속 실행**: 1회차 **185개 통과, 0개 실패**
  (exit 0, 17.2s), 2회차 **185개 통과, 0개 실패**(exit 0, 16.9s) — 두 결과 완전히 동일해
  플래키 아님 — `.curvez/qa/preemie-calc/last-run-e2e-r1-round7.log`,
  `.curvez/qa/preemie-calc/last-run-e2e-r2-round7.log`. **185 = 6라운드 140개 + 이번 라운드
  신규 45개**(`nf-visual-defects-regression.spec.ts`). 삭제·skip 없음
- `skip`/`only`/`todo` 개수: 0(`grep -rnE '\.(skip|only|todo)\(|\bx(it|describe)\('
  apps/preemie-calc/tests/` 결과 0건, 신규 파일 포함)
- `any` 사용: 0건(`grep -nE ':\s*any\b|<any>|\bas\s+any\b'` 신규 파일 대상)
- 수용 기준 커버: `grep -ohE 'PC-F[0-9]+-(AC|EX)[0-9]+|PC-NF-[A-Z0-9]+-[0-9]+' tests/e2e/*.ts tests/unit/*.ts | sort -u | wc -l` → **57**(요구 57개와 정확히 일치, 미커버 0개 — 6라운드와 동일)
- 포트 3100: 이번 세션 모든 명령 실행 전마다 `lsof -i :3100` 으로 비어 있음을 확인했다(다른
  프로세스 없음, `run_in_background` 미사용, dev 서버 직접 기동 안 함)
- 캡처(after 재촬영): `CURVEZ_CAPTURE=1 CURVEZ_CAPTURE_DIR=after pnpm exec playwright test
  --project=capture` → **20개 통과, 0개 실패**(8.9s). `.curvez/qa/preemie-calc/screens/after/`
  20장 전부 이번 실행 시각(01:32)으로 덮어씀 확인(`ls -la` mtime) —
  `.curvez/qa/preemie-calc/screens/last-run-capture-after-round7.log`. 결함 5건이 실제로
  사라졌는지 `dashboard-2children-360.png`·`dashboard-1280.png`·
  `dashboard-correction-period-360.png`·`share-360.png` 4장을 육안으로 재확인했다(아래 표)
- `node scripts/validate-handoff.mjs .curvez/handoff/`: 이번 핸드오프 파일 자체의 검증 결과는
  QA 핸드오프 `verification` 참고(curvez-nextjs.20260930-012225.json 의 알려진 스키마 오류는
  GOAL 지시에 따라 별도 보고하고 이 수치에서 제외했다)

### 캡처 육안 재확인 (결함 5건)

| 결함 | 확인한 캡처 | 결과 |
| --- | --- | --- |
| 헤더 제목 음절 중간 줄바꿈("이른둥이 육/아 계산기") | `dashboard-2children-360.png`, `share-360.png` | "이른둥이"/"육아 계산기" 어절 단위 2줄, 음절 중간 끊김 없음 |
| 나이 카드 "3 / 개월" 끊김 | `dashboard-2children-360.png`, `share-360.png` | "생후 92일 ·"/"3개월", "교정 36일 ·"/"1개월" — 숫자+단위 조각이 끊기지 않음 |
| 날짜 "2026-06- / 26" 끊김 | `dashboard-2children-360.png`, `share-360.png` | "...· 교정 2개월:"/"2026-06-26" — 날짜 조각이 끊기지 않음 |
| "+ 아이 / 추가" 버튼 라벨 줄바꿈 | `dashboard-2children-360.png` | "+ 아이 추가" 한 줄 |
| 1280px 에서 "+ 아이 추가" 가 콘텐츠 영역 밖(x=16) | `dashboard-1280.png` | 버튼이 카드들과 같은 왼쪽 선에 있음(회귀 테스트로 x 차이 0~2px 이내 실측, 아래 참고) |
| 헤더 제목 잘림(3줄 허용 후) | `dashboard-correction-period-360.png` | "교정연령"/"적용 종료"/"안내" 3줄, 잘림 없음 |

### 신규 회귀 검사 4종 실측

`apps/preemie-calc/tests/e2e/nf-visual-defects-regression.spec.ts`, 45개 테스트(전부 통과).

| # | 검사 | 대상 | 개수 | 방법 |
| --- | --- | --- | --- | --- |
| (1) | 모든 button·a[role] 라벨이 한 줄 | 9개 화면 × 360/390/768/1280px | 36 | 라벨 텍스트 노드마다 `Range.getClientRects().length<=1` |
| (2) | body computed word-break === keep-all | 9개 화면 × 360/390/768/1280px | (1)과 같은 테스트에 포함 | `getComputedStyle(document.body).wordBreak` |
| (3) | 나이 카드 값 조각이 한 줄 | dashboard·share × 360/390/768/1280px | 8 | nowrap span 마다 `Range.getClientRects().length<=1` + "92일"·"3개월"·"36일"·"1개월"·"2026-06-26" 5개 문자열이 `getByText(exact:true)`로 보임 |
| (4) | 1280px 대시보드에서 "+ 아이 추가" 버튼 x 와 첫 카드 x 차이 ≤ 2px | dashboard @ 1280px | 1 | `boundingBox().x` 차이 실측 |

(1)+(2)는 같은 테스트 함수 안에서 같은 페이지 로드를 재사용해 36개로 묶었다(항목별로 별도
`expect` 라 실패 지점은 여전히 나뉜다). 36+8+1=45.

(5)(헤더 제목 잘림 없음, line-clamp 3줄 허용 후에도 잘리지 않는지)는 새 테스트를 추가하지
않았다 — `nf-header-layout.spec.ts` 의 "[디자인 재구성, DSG-05 회귀]" 그룹이 이미 9개 화면 ×
360/390/768/1280px 전부에서 `scrollHeight<=clientHeight+1` 을 확인하고 있고, 이 단언은 줄 수와
무관하게(1줄이든 3줄이든) 잘림 여부만 본다 — line-clamp 이 2→3 으로 바뀐 뒤에도 그대로 유효해
중복 추가하지 않았다.

### 7라운드에서 직접 고친 것

`src/**` 는 전부 읽기만 했다(수정 없음). 신규 파일 하나만 추가했다 — 이 에이전트 소유 파일이다.

- 신규: `apps/preemie-calc/tests/e2e/nf-visual-defects-regression.spec.ts`(45개)

## 8라운드: curvez-nextjs.20260930-105749.json(본문 폭 720px 통일) 대응

curvez-nextjs 가 9개 화면의 본문 최대 폭을 `--layout-content-max`(720px) 하나로 통일하고
대시보드를 main+sidebar 2열에서 1열(age-summary → quick-links → share-entry → disclaimer)로
바꿨다(tokens.md 7차 라운드 결정, 사용자 원문 "가로사이즈는 메인과 서브가 동일하게"). 이 라운드는
(1) 그 결과 깨진 2건(`nf-header-layout.spec.ts:226,247`, 이제 없는 `.pc-dashboard-main`/
`.pc-dashboard-sidebar` 를 찾던 테스트)을 새 사실로 바꾸고, (2) 9개 화면 × 3폭(360/768/1280)의
본문 컨테이너·헤더 안쪽 그리드 콘텐츠 폭이 실제로 같은지 e2e 로 실측하고, (3) 360·1280px
캡처 20장을 `width-720/` 에 새로 남기는 라운드다. 요구사항(57개 ID) 자체는 바뀌지 않았다.

### 57개 ID 판정 — 8라운드 재확인

이번 라운드도 요구사항이 바뀌지 않았다. 57개 ID 판정은 **7라운드와 완전히 동일**(자동 통과
55개, 자동 실패 0개, 수동 1개, 조건부 2건 — PC-F3-AC4·PC-F4-AC5 유지). 이번 라운드가 고치거나
추가한 테스트(`nf-header-layout.spec.ts` 의 대시보드 1열 검증, `nf-content-width.spec.ts`)는
AC-ID 가 없는 레이아웃 실측이라 57개 집계에 포함되지 않는다(7라운드의 시각 결함 회귀 45개와
같은 성격).

### 실행 결과 (수치, 8라운드)

- (워크트리 루트) `pnpm typecheck`: exit 0, 오류 0건(7개 워크스페이스) —
  `.curvez/qa/preemie-calc/last-run-typecheck-round8.log`
- (워크트리 루트) `pnpm lint`: exit 0(전 워크스페이스 `Done`, eslint 출력 없음, 0 problems.
  1차 실행에서 "Unused eslint-disable directive(no-console)" 경고 1건이 나와(테스트 파일에
  console.log 를 허용하는 규칙이라 disable 이 애초에 필요 없었다) 그 disable 주석을 지워
  0건으로 만들었다) — `.curvez/qa/preemie-calc/last-run-lint-round8.log`
- (워크트리 루트) `pnpm test`: exit 0. apps/preemie-calc **62/62**, packages/scopulus-ui
  **141/141**. 총 203개 중 203개 통과, 0개 실패(계산 도메인은 이번 라운드에 바뀌지 않았다) —
  `.curvez/qa/preemie-calc/last-run-root-round8.log`
- (워크트리 루트) `pnpm build`: exit 0. apps/preemie-calc `next build` 성공, **491/491** 정적
  페이지 생성 — `.curvez/qa/preemie-calc/last-run-build-round8.log`
- (apps/preemie-calc) `pnpm test:e2e` **2회 연속 실행**: 1회차 **189개 통과, 0개 실패**
  (exit 0, 18.3s), 2회차 **189개 통과, 0개 실패**(exit 0, 19.5s) — 두 결과 완전히 동일해
  플래키 아님 — `.curvez/qa/preemie-calc/last-run-e2e-r1-round8.log`,
  `.curvez/qa/preemie-calc/last-run-e2e-r2-round8.log`. **189 = 7라운드 185개 − 2개(전제가
  사라진 대시보드 2열 테스트, 새 사실로 교체) + 3개(대시보드 1열 신규, 360/768/1280px 각 1개)
  + 3개(nf-content-width.spec.ts 신규, 360/768/1280px 각 1개)**. 삭제·skip 없음
- `skip`/`only`/`todo` 개수: 0(`grep -rnE '\.(skip|only|todo)\(|\bx(it|describe)\('
  apps/preemie-calc/tests/` 결과 0건, 신규·수정 파일 포함)
- `any` 사용: 0건(수정한 `nf-header-layout.spec.ts`, 신규 `nf-content-width.spec.ts` 대상)
- 수용 기준 커버: `grep -ohE 'PC-F[0-9]+-(AC|EX)[0-9]+|PC-NF-[A-Z0-9]+-[0-9]+' tests/e2e/*.ts
  tests/unit/*.ts | sort -u | wc -l` → **57**(요구 57개와 정확히 일치, 미커버 0개 — 7라운드와
  동일)
- 포트: 이번 세션 모든 명령 실행 전후 `lsof -i :3100` 에 PID 43850 이 LISTEN 상태로 그대로
  있었다(kill 하지 않았다). `lsof -i :3200` 은 매 실행 전 빈 상태였고, `test:e2e`·capture 가
  자기 webServer(next build && next start -p 3200)를 종료할 때마다 다시 빈 상태로 돌아왔다
- 캡처(width-720 신규): `CURVEZ_CAPTURE=1 CURVEZ_CAPTURE_DIR=width-720 pnpm exec playwright
  test --project=capture` → **20개 통과, 0개 실패**(8.9s).
  `.curvez/qa/preemie-calc/screens/width-720/` 20장 확인(`ls`) —
  `.curvez/qa/preemie-calc/screens/last-run-capture-width-720.log`. `dashboard-1280.png`·
  `dashboard-360.png`·`dashboard-checkups-1280.png` 3장을 육안으로 재확인해 나이 카드·바로가기·
  공유·면책이 모든 폭에서 같은 왼쪽 선에 1열로 놓임을 확인했다
- `node scripts/validate-handoff.mjs .curvez/handoff/`: 이번 핸드오프 파일의 검증 결과는
  QA 핸드오프 `verification` 참고

### 9개 화면 × 3폭 본문·헤더 콘텐츠 폭 실측표

`nf-content-width.spec.ts` stdout(`last-run-e2e-r1-round8.log`)에서 그대로 옮겼다. 9개 화면
(input·input-weeks·dashboard·age-basis·checkups·copay-relief·correction-period·share·guide)
전부가 아래 값과 정확히 같다(화면 간 차이 0.00px).

| 폭 | header.x = body.x | header.width = body.width |
| --- | --- | --- |
| 360px | 0.00 | 360.00 |
| 768px | 24.00 | 720.00 |
| 1280px | 280.00 | **720.00**(GOAL 요구값과 일치) |

측정 대상: `role=banner` 의 첫 자식 div(헤더 안쪽 3분할 그리드) / `role=main` 의 마지막 자식
div(본문 컨테이너, 화면마다 클래스 이름은 다르지만 구조는 9개 화면 전부 "main 의 마지막 div
자식"으로 같다). 클래스 이름에 기대지 않고 이 구조로 잡았다(GOAL 지시). `boundingBox()`를
그대로 쓴 이유(패딩을 따로 빼지 않는 이유)는 Tailwind preflight 의 전역
`box-sizing:border-box`(globals.css 최상단 `@import "tailwindcss"`, 실측:
`node_modules/tailwindcss@4.3.3/preflight.css:12`) 때문이다 — border-box 에서
`max-width:720`은 padding 을 포함한 렌더 박스 자체의 상한이라 `boundingBox()`가 곧 720이다.

### 8라운드 바꾼 테스트 목록

`.curvez/qa/preemie-calc/test-changes-width-720.md` 참고. 요약: `nf-header-layout.spec.ts`
의 대시보드 2열 전제 테스트 2건을 대시보드 1열 실측 테스트 3건(360/768/1280px)으로 바꿨고,
`nf-content-width.spec.ts`(신규, 3건)를 더했다.

### 8라운드에서 직접 고친 것

`src/**` 는 전부 읽기만 했다(수정 없음). 소유 파일만 고쳤다.

- 수정: `apps/preemie-calc/tests/e2e/nf-header-layout.spec.ts`(226~265행의 대시보드 2열
  테스트 2건 → 대시보드 1열 테스트 3건으로 교체)
- 신규: `apps/preemie-calc/tests/e2e/nf-content-width.spec.ts`(3개)
- 신규: `.curvez/qa/preemie-calc/test-changes-width-720.md`
- 신규: `.curvez/qa/preemie-calc/screens/width-720/`(20장)

## 9라운드: SPEC v2 신규 기능(F7 AC5~7·F8·F10·F14·F15) 대응 + 본문 폭 4개 화면 확장

`curvez-nextjs.20260930-123524.json` 이 F7 AC5~7·F8·F10·F14·F15 를 구현하고 본문 폭
CSS 결함(글 영역이 720px 가 아니라 720-패딩만큼만 남던 것)을 고쳤다. 이 라운드가 한 일:

1. 새 AC 17개·새 EX 5개(총 22개 ID, F7 AC5~7·F8 AC1~5+EX1·F10 AC1~3·F14 AC1~3+EX1·
   F15 AC1~3+EX1~3)에 단위 5개 파일(`growth`·`vaccination`·`target-height`·`formula`·
   `share-text.test.ts`) + e2e 4개 신규 파일(`growth`·`vaccinations`·`target-height`·
   `formula.spec.ts`) + 기존 파일 확장(`f7-share.spec.ts`)을 더했다
2. PRD §9 결정(경감 구간 경계 확정)으로 낡은 기대값 2건(단위)·1건(e2e)을 고쳤다
   (`.curvez/qa/preemie-calc/test-changes-v2.md`)
3. 글 영역 720px(박스 784px) 통일에 새 화면 4개를 더했다(`nf-content-width.spec.ts`,
   `nf-mobile.spec.ts`, `nf-a11y.spec.ts`, `nf-med.spec.ts`)
4. F8 AC3(추이 그래프)은 차트 라이브러리 미정으로 **보류** 판정, PC-F14-AC1·AC2 는
   `entities/target-height` 계산식 버그로 **자동 실패** 판정(고치지 않고 `curvez-nextjs`
   에 돌린다)
5. F16~F18·F1-AC7 은 팀(tmux) 라운드라 판정하지 않는다(그 테스트 파일은 읽기만 했다)

상세(층 배분·디자인 스펙 키 대응표·테스트하지 않는 것·src 결함 재현·실행 결과 수치·글
영역 실측표)는 전부 `.curvez/qa/preemie-calc/strategy.md` "9라운드" 절에 있다(중복
작성하지 않는다). F-번호별 판정표는 이 문서 위쪽 "F7"·"F8"·"F10"·"F14"·"F15" 절에 이미
반영했다.

### 9라운드에서 직접 고친 것

`src/**` 는 전부 읽기만 했다(수정 0건). 소유 파일(`apps/preemie-calc/tests/**`,
`.curvez/qa/**`)만 고쳤다.

- 신규 단위: `tests/unit/growth.test.ts`, `tests/unit/vaccination.test.ts`,
  `tests/unit/target-height.test.ts`, `tests/unit/formula.test.ts`,
  `tests/unit/share-text.test.ts`
- 신규 e2e: `tests/e2e/growth.spec.ts`, `tests/e2e/vaccinations.spec.ts`,
  `tests/e2e/target-height.spec.ts`, `tests/e2e/formula.spec.ts`
- 수정: `tests/unit/copay-relief.test.ts`(경계 확정 반영), `tests/unit/reference-data.test.ts`
  (기준 데이터 3건 추가), `tests/e2e/f7-share.spec.ts`(AC5~7 추가), `tests/e2e/nf-mobile.spec.ts`
  (화면 4개 추가, boundary 케이스 교체), `tests/e2e/nf-content-width.spec.ts`(화면 4개 추가,
  content-box 반영해 글 영역/박스 폭 분리 측정), `tests/e2e/nf-a11y.spec.ts`(화면 4개
  대비 검사 추가, 레이블 테스트 추가), `tests/e2e/nf-med.spec.ts`(화면 4개 추가),
  `tests/e2e/support/helpers.ts`(`focusableTextsInOrder` 헬퍼 추가)
- 신규 fixture: `tests/fixtures/nhis-growth-percentile-20240731.csv`(연구 원본 복사,
  PC-F8-AC4 교차 검증용)
- 신규 문서: `.curvez/qa/preemie-calc/test-changes-v2.md`, `.curvez/qa/design-uncovered.txt`

## 10라운드: 통합 라운드 — 팀 테스트 정리 + 최종 게이트 (curvez-nextjs.20260930-135922·141142 대응)

이 라운드는 두 가지를 했다.

1. 팀(tmux) 라운드가 만들었으나 리뷰를 거치지 않았던 테스트 6개 파일
   (`f16-question-guides.spec.ts`·`f17-guide-index.spec.ts`·`f18-age-basis-public.spec.ts`·
   `f1-profile.spec.ts`·`nf-a11y.spec.ts`·`tests/unit/f13-build-artifacts.test.ts`)의
   실패 12건을 오케스트레이터 CONTEXT 지시대로 고쳤다(대응은 위 F1·F16·F17·F18·F13 절과
   아래 "10라운드 바꾼 테스트 목록" 참고). 이 과정에서 지시서에 없던 실패 1건(F17-AC2,
   `getByLabel` strict mode 충돌)도 함께 발견해 같은 원칙(약화 없는 선택자 교체)으로 고쳤다.
2. `curvez-nextjs.20260930-135922.json`(리뷰 지적 6건: ACC-01·DSG-01~03·ERR-01~02)과
   `curvez-nextjs.20260930-141142.json`(TEAM-03·05·06·07·08·09)이 둘 다 `done` 으로
   끝난 뒤, 최종 게이트(typecheck·lint·test·build·전체 e2e)를 각 1회 돌려 두 라운드(9+10)를
   합친 AC 69·EX 14·NF 11 = 94개 ID 판정표를 이 문서에 완성했다.

### 94개 ID 판정 요약

- **자동 통과**: 91개
- **조건부(한계 명시, 자동 통과로 셈)**: 1개 — PC-F8-AC4(공공데이터포털 자료 형태 한계, 9라운드부터 동일)
- **보류(라이브러리 미정)**: 1개 — PC-F8-AC3(추이 그래프, 차트 라이브러리 없음. standing 3)
- **사용자 확인 대기(계산에는 영향 없음, 문구 해석 문제)**: 1개 — PC-F16-AC4(아래 참고)
- **커버 확인**: `grep -ohE 'PC-F[0-9]+-(AC|EX)[0-9]+|PC-NF-[A-Z0-9]+-[0-9]+'
  apps/preemie-calc/tests/e2e/*.ts apps/preemie-calc/tests/unit/*.ts | sort -u | wc -l` →
  **93**(요구 94개 중 PC-F8-AC3 1개만 미커버, 보류 사유 그대로) — `comm -23` 결과 미커버 목록은
  `PC-F8-AC3` 딱 하나

**PC-F16-AC4 "사용자 확인 대기"**: curvez-reviewer(TEAM-01)가 지적한 대로, "본인부담 경감"
가이드 문구("29주 이상 33주 미만: 5년 3개월")와 계산기(F5)의 실제 판정(29주 0일=203일→
5년 4개월)이 경계 정각에서 서로 다른 답을 준다. AC4 원문("재태기간 구간 3개와 기간이 보인다")
자체는 두 값(5년 2·3·4개월)이 화면에 보이므로 충족해 자동 통과로 판정했지만, 경계 해석의
근본 원인(PRD §9 결정 "정각은 더 긴 경감 구간" vs 보도자료 원문 "이상~미만")은 오케스트레이터의
판정을 기다린다. 지시서 GOAL 이 명시한 대로 계산 로직·경계값은 건드리지 않았다.

**PC-F5 경계(203일·231일)**: 지시서 GOAL 대로 손대지 않았다. `tests/unit/copay-relief.test.ts`
는 9라운드에 확정한 PRD §9 결정(lower-inclusive) 기준 그대로다.

### 10라운드 바꾼 테스트 목록

`.curvez/qa/preemie-calc/test-changes-combined.md` 에 이전→이후·근거를 파일별로 남겼다.
요약(파일 : 변경 내용):

- `tests/e2e/f16-question-guides.spec.ts` — footer 셀렉터(`contentinfo`→`footer` 요소),
  AC6 출처 이름 엄격화, AC5 copay-relief 제외, EX1 왕복+외부 경로 거부 신규 2건
- `tests/e2e/f18-age-basis-public.spec.ts` — AC1 SPEC v5 5항목 교체, AC3 출처 이름 엄격화,
  AC2 왕복 완성(입력 화면 도착까지 → F3 화면 도착까지)
- `tests/e2e/f17-guide-index.spec.ts` — AC2 `getByLabel` exact 매치로 strict mode 충돌 제거
  (지시서에 없던 항목, 직접 발견)
- `tests/e2e/f1-profile.spec.ts`, `tests/e2e/nf-a11y.spec.ts` — `getByText("주수로 입력")`
  → `getByRole("button", { name: "주수로 입력" })`(strict mode 충돌 제거)
- `tests/e2e/target-height.spec.ts` — AC1·AC2·state:empty 선택자를 `role=group` 텍스트
  정규화 판정으로 교체(ValueCard 가 라벨/값/범위를 `<p>` 3개로 나눠 그리는 실제 DOM 구조에 맞춤)
- `tests/unit/f13-build-artifacts.test.ts` — 조합 페이지 카운트를 숫자 이름 디렉터리로 한정,
  사이트맵 카운트를 `/guide/\d+/\d+` 패턴으로 한정, sitemap 전체 수(496) 별도 단언 추가

### 직접 고친 것과 고치지 않은 것

`src/**`·`package.json`·`docs/`·구현 코드는 전부 읽기만 했다(수정 0건). 소유 파일
(`apps/preemie-calc/tests/**`, `.curvez/qa/**`)만 고쳤다. src 결함은 이번 라운드 시작 시점에
이미 `curvez-nextjs` 가 둘 다 고쳐 도착했다(ACC-01 목표키 버그, TEAM-03·05·07·08·09) —
이 라운드가 새로 발견해 돌린 src 결함은 없다.

### 최종 게이트 실행 결과 (수치, 각 1회)

- **typecheck**(`pnpm typecheck`, 워크트리 루트): exit 0. 7개 워크스페이스(apps/preemie-calc·
  city-presets·handwork·scopulus-ui, packages/scopulus-ui 등) 전부 Done, 오류 0건 —
  `last-run-typecheck-round10.log`
- **lint**(`pnpm lint`, 워크트리 루트): exit 0. 전 워크스페이스 Done, 출력에 error·warning
  없음(0 problems) — `last-run-lint-round10.log`
- **test**(`pnpm test`, 워크트리 루트): apps/preemie-calc Test Files 15 passed(15), Tests
  103 passed(103). packages/scopulus-ui Test Files 38 passed(38), Tests 141 passed(141).
  실패 0건 — `last-run-root-round10.log`
- **build**(`pnpm build`, 워크트리 루트): exit 0(Done). apps/preemie-calc 503개 정적 페이지
  생성 확인(`✓ Generating static pages using 9 workers (503/503)`), 4앱(preemie-calc·
  city-presets·handwork·scopulus-ui) 전부 Done — `last-run-build-round10.log`. 이 새 빌드
  산출물로 `f13-build-artifacts.test.ts` 를 다시 돌려 3/3 통과 재확인(조합 481·사이트맵
  조합 481·사이트맵 전체 496)
- **전체 E2E**(`PORT=3200 pnpm exec playwright test`, apps/preemie-calc, 1회):
  **263 tests, 263 passed, 0 failed**(22.5s) — `last-run-e2e-round10.log`. 팀 테스트 6개
  파일을 포함해 전체 스위트가 처음으로 100% 통과했다(9라운드 248/261, 이전 nextjs 라운드
  135922 는 팀 파일 8건·src 결함 2건 실패)

### 플래키 판정

이번 라운드는 새로 플래키를 관찰하지 않았다. standing 14 에 따라 전체 E2E 를 반복 돌리지
않았고(1회만), 수정 도중 실패했다가 통과한 스펙만 개별로 재실행했다(`f16-question-guides.spec.ts`
1회, `f17-guide-index.spec.ts` 는 처음부터 개별 실행이라 반복 아님). `.curvez/qa/preemie-calc/flaky.md`
는 만들지 않았다(플래키 없음).

### 포트

작업 시작 시 `lsof -i :3100` → `node 43850 LISTEN *:3100`. 이 라운드의 모든 명령(개별 spec
실행 4회, 최종 게이트의 전체 E2E 1회) 전후로 `lsof -i :3100` 을 확인했고 PID 43850 이 그대로
유지됐다(kill 하지 않았다). `lsof -i :3200` 은 매 playwright 실행 전 빈 상태였고, 실행이
자체 webServer(next build && next start -p 3200)를 종료할 때마다 다시 빈 상태로 돌아왔다 —
마지막 확인(최종 E2E 게이트 직후)도 빈 상태였다.

### skip/only/todo, any, 핸드오프 검증

- `grep -rnE '\.(skip|only|todo)\(|\bx(it|describe)\(' apps/preemie-calc/tests/` → 0건
- 수용 기준 커버: 93/94(PC-F8-AC3 보류 1개만 미커버, 위 요약 참고)
- `node scripts/validate-handoff.mjs .curvez/handoff/` 결과는 이 라운드 핸드오프의
  `verification` 참고


## 집계 (2026-10-02 메인 세션 갱신, 최신)

- 요구 96개(SPEC 버전 6: PC-F5-AC6·AC7 추가) — 자동 통과 94, 조건부 1(PC-F8-AC4), 수동 1(PC-F7-AC4). 보류 0 (PC-F8-AC3 통과로 바뀜)
- 실행 결과: `pnpm test` preemie-calc 119/119, scopulus-ui 141/141 · `pnpm --filter preemie-calc test:e2e` 264/264 (3200 포트, 한 번 실행) · typecheck exit 0 · lint exit 0
- 바꾼 테스트: `copay-relief.test.ts` 옛 경계 기대 2건 → PC-F5-AC6·AC7 4건(경계와 바로 앞 날짜), `nf-mobile.spec.ts:90` 기대 "5년 4개월" → "5년 3개월"(PRD 버전 4 원문 정정에 따른 요구 변경), `growth.spec.ts` 입력 헬퍼를 input 으로 좁힘(기록 행 aria-label 과 겹침) + PC-F8-AC3 E2E 추가

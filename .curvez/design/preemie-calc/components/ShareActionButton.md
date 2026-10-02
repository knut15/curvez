# component: ShareActionButton
purpose: 지금 결과를 공유한다. "링크 복사" 버튼은 항상 보인다(SPEC 원문 PC-F7-EX1 "카카오톡 공유를 쓸 수 없는 환경(데스크톱 브라우저 등)에서는 링크 복사 버튼이 보인다"). 이번 1단계는 카카오 SDK 를 쓰지 않아 "카카오톡 공유를 쓸 수 있는 환경" 자체가 없으므로, 그 문장의 실질은 "링크 복사 버튼은 늘 보인다"로 옮긴다. `navigator.share` 를 쓸 수 있는 환경이면 링크 복사 버튼과 함께 시스템 공유 버튼을 추가로 보인다. 카카오 SDK 가 붙으면(2단계 이후) 이 스펙을 다시 정한다 — 그때는 카카오톡 공유를 우선 노출로 바꿀 수 있다. 8차 라운드(F7 문구 복사, PC-F7-AC5~AC7)부터 "결과 문구 복사" 버튼을 셋째 행동으로 더했다 — 링크만 복사하는 것과 달리, 나이 결과 문구까지 함께 클립보드에 담아 카카오톡 대화창 등에 바로 붙여 넣을 수 있게 한다
쓰이는 화면: dashboard
요구 ID: PC-F7-EX1, PC-F7-AC3, PC-F7-AC5, PC-F7-AC6, PC-F7-AC7, PC-NF-PRIV-2

## props
| 이름 | 타입 | 필수 | 기본값 | 의미 |
|---|---|---|---|---|
| shareSupported | boolean | O | — | 렌더 시점에 `typeof navigator.share === "function"` 으로 판정한 값을 그대로 받는다(이 컴포넌트는 판정하지 않는다). true 면 공유 버튼을 다른 두 버튼과 함께 보인다. false 면 공유 버튼만 숨긴다(문구 복사·링크 복사는 항상 보인다) |
| onShare | () => Promise<void> | X(shareSupported=true 일 때만 쓰인다) | — | shareSupported=true 일 때: `ShareCardCanvas` 로 이미지를 만들고 `navigator.share({files, url})` 호출. `url` 은 `/share#b=…&d=…`(PC-F7-AC3, 이름 없음) |
| onCopyPhrase | () => Promise<string> | O | — | "결과 문구 복사" 버튼은 항상 렌더된다. 오늘 날짜 기준 생후/교정 나이 문구 + 공유 링크를 한 문자열로 만들어 클립보드에 복사하고, 그 문자열을 반환한다. 예(PC-F7-AC5, 오늘 2026-06-01): `"생후 92일 · 3개월\n교정 36일 · 1개월\nhttps://…/share#b=2026-03-01&d=2026-04-26"`(줄바꿈 형식은 이 스펙이 정하고, 저장된 이름은 어떤 형태로도 들어가지 않는다, PC-F7-AC6) |
| onCopyLink | () => Promise<void> | O | — | 링크 복사 버튼은 항상 렌더되므로 이 prop 도 항상 쓰인다. 위 url 만 클립보드에 복사(문구 없이 링크만) |

## states
| state | 트리거 | 시각 변화 |
|---|---|---|
| copy-phrase (기본, 항상 렌더) | shareSupported 값과 무관 | `Button`(variant=secondary, label="결과 문구 복사", icon={name:"Copy",position:"leading"}) |
| copy-link (기본, 항상 렌더) | shareSupported 값과 무관 | `Button`(variant=secondary, label="링크 복사", icon={name:"Copy",position:"leading"}) — copy-phrase 바로 아래(순서: 공유(있으면) → 결과 문구 복사 → 링크 복사, 사용 빈도가 높은 순서) |
| share (추가 렌더) | shareSupported=true | 두 복사 버튼 위에 `Button`(variant=primary, label="결과 카드 공유하기", icon={name:"Share2",position:"leading"}) 을 추가로 보인다. 버튼 사이 간격 `--space-2`(8px) |
| phrase-copied | onCopyPhrase 성공 | "결과 문구 복사" 버튼 아이콘이 `Copy` → `CopyCheck` 로, 라벨이 2초간 "문구를 복사했어요"(SPEC 원문 그대로, PC-F7-AC7)로 바뀐 뒤 원래 아이콘·라벨로 돌아간다. 아이콘 전환에 `--motion-easing-playful` 를 쓴다(tokens.md 가 허용한 3곳 중 하나 — 링크 복사의 아이콘 전환과 별개로 이 버튼도 같은 애니메이션 규칙을 쓴다). 별도 토스트를 띄우지 않는다 |
| link-copied | onCopyLink 성공 | "링크 복사" 버튼 아이콘이 `Copy` → `CopyCheck` 로, 라벨이 2초간 "복사했습니다"로 바뀐 뒤 원래 아이콘·라벨로 돌아간다(문구 복사와 다른 문구 — 두 버튼이 서로 다른 동작이라 완료 문구도 각자 SPEC 이 정한 그대로 다르게 유지한다) |
| pending | 공유 버튼 클릭 후 카드 이미지를 canvas 로 그리는 동안 | 공유 버튼만 `Button` 의 loading 상태를 쓴다(라벨 유지 + 스피너가 `Share2` 아이콘 자리를 대신한다). 두 복사 버튼은 영향받지 않고 그대로 눌린다 |
| error | `navigator.share` 가 사용자 취소가 아닌 이유로 실패 | 공유 버튼 아래 인라인 문구 "공유하지 못했습니다. 다시 시도해 주세요"(아이콘 `AlertTriangle`, --color-accent-danger). 두 복사 버튼은 그대로 남아 바로 쓸 수 있는 대체 수단이 된다 |

## a11y
- a11y:label — 버튼 라벨 텍스트가 곧 접근 이름(결과 카드 공유하기/결과 문구 복사/문구를 복사했어요/링크 복사/복사했습니다). 아이콘은 `aria-hidden`
- a11y:focus — 탭 순서는 공유 버튼(있으면) → 결과 문구 복사 → 링크 복사. 상태가 바뀌어도(phrase-copied·link-copied 등) 포커스를 잃지 않는다
- a11y:contrast — `Button` variant 별 대비를 그대로 따른다(primary 5.36, secondary 15.17)
- a11y:target — 48px 이상(`Button` size=md 상속)
- a11y:role — button

## responsive
- <768: 세 버튼 모두 fullWidth=true, 세로로 쌓는다(공유 → 결과 문구 복사 → 링크 복사)
- 768~1279: 세 버튼 모두 최대 320px, 세로로 쌓는다(가로 배치는 버튼 폭 합이 320px 를 넘어가므로 쓰지 않는다)
- >=1280: dashboard 본문 컨테이너(`--layout-content-max`=720px, 7차 라운드부터 1열) 안에서 세 버튼 모두 최대 320px, 세로로 쌓는다(768~1279 와 같은 규칙)

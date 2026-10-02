# component: GrowthTrendChart
purpose: 같은 지표(키/몸무게/머리둘레)의 측정 기록을 측정일 순서로 이은 꺾은선 그래프 하나를 그린다. PC-F8-AC3("기록이
2개 이상이면 측정일 순서로 추이 그래프가 그려진다")를 만족한다. 지표 하나당 인스턴스 하나다 — 세 지표를 한 그래프에
섞지 않는다(요구사항 원문의 "백분위" 자체가 지표별로 다른 LMS 기준을 쓰기 때문에, 섞으면 y축 단위가 cm 와 kg 로
갈려 그래프가 성립하지 않는다). `recharts`(^3.10.1, 이미 설치됨, 사용자 승인 "권고대로 하고 recharts 설치") 의
`LineChart`·`Line`·`XAxis`·`YAxis`·`CartesianGrid`·`Legend`·`Tooltip`·`ResponsiveContainer` 만 쓴다. 다른 차트
라이브러리를 전제하지 않는다.
이 컴포넌트는 `GrowthRecordTable` 을 대체하지 않는다 — 표는 정확한 값(소수점까지)과 PC-F8-AC2 주의 문구를 행 단위로
보여주고, 이 그래프는 그 값들의 추이(오르내림·또래 백분위 구간 대비 위치)를 한눈에 보여준다. 둘은 같은 데이터를
다른 방식으로 보여주는 짝이다(스크린리더에는 표만 노출하고 그래프는 보조로 숨긴다 — 아래 `## a11y`).
쓰이는 화면: growth (`screens/growth.md` region: trend, 지표 3개 → 인스턴스 3개: height·weight·headCircumference)
요구 ID: PC-F8-AC3

## 데이터 전제 (구현자에게)

이 컴포넌트는 원시 `GrowthRecord`/`GrowthPercentileResult` 를 직접 받지 않는다. 상위(`growth` 화면의 위젯 레이어)가
`GrowthRecordRow`(`components/GrowthRecordTable.md` 참고, 같은 타입을 그대로 재사용한다 — 새 저장 모양을 만들지
않는다)를 **측정일 오름차순**(가장 오래된 기록이 왼쪽)으로 재정렬하고, 지표 하나마다 아래 `GrowthTrendPoint[]` 로
변환해 넘긴다. `GrowthRecordTable` 은 반대로 최신순(내림차순)을 쓰므로 같은 레코드 배열을 두 번 다른 순서로 정렬해
각자에게 넘긴다(새 저장 로직 없이 배열 정렬만 다르게 한다).

```ts
type GrowthTrendPoint = {
  measurementDate: CalendarDate;      // x축 값. "2026-06-01"
  value: number;                      // 이 지표의 실측값(키/몸무게/머리둘레). 백분위 표시 여부와 무관하게 항상 있다
  ageBasisLabel: string | null;       // "교정 ○개월 기준" / "생후 ○개월 기준" (GrowthRecordRow.ageBasis.label 그대로). null 이면 아직 나이 계산 자체가 안 됨(교정 나이 시작 전)
  percentileValue: number | null;     // 이 아이 실측값의 백분위(소수 첫째 자리). percentileHidden 이면 null
  p3: number | null;                  // 그 측정일의 나이(개월)에 대응하는 3백분위 기준값(같은 단위: height/headCircumference=cm, weight=kg). 나이 계산 불가(percentileHidden)면 null
  p50: number | null;                 // 50백분위(중앙값) 기준값
  p97: number | null;                 // 97백분위 기준값
  cautionNeeded: boolean;             // GrowthRecordRow.cautionNeeded 그대로(PC-F8-AC2 — 3 미만 또는 97 초과)
  percentileHidden: boolean;          // GrowthRecordRow.percentileHidden 그대로(PC-F8-AC5/EX1 — 예정일 이전 측정, 또는 36개월 초과로 나이 계산 자체가 범위 밖)
};
```

`p3`/`p50`/`p97` 은 architecture.md ⑧ `growthPercentiles` 가 지금 돌려주는 값(아이 실측값 하나의 Z·percentile)
만으로는 못 만든다 — LMS(L,M,S)에서 **주어진 백분위의 역산 값**을 구하는 새 계산이 필요하다:

```
z_p = Φ⁻¹(p / 100)                                  // 표준정규분포 역함수(probit). architecture.md 의 standardNormalCdf(정방향)만으로는 안 됨 — 새 함수가 필요하다
X_p = L === 0 ? M × exp(S × z_p) : M × (1 + L × S × z_p) ** (1 / L)
```

`L`·`M`·`S` 는 `measurementDate` 의 나이(개월, 내림)로 찾은 같은 `LmsRow`(`entities/growth/data/growth-lms.json`)에서
읽는다 — `growthPercentiles` 가 이미 그 행을 찾으므로 같은 조회를 재사용할 수 있다. 이 역함수(`shared/lib/normal-distribution`
의 `standardNormalCdf` 와 짝이 되는 `inverseStandardNormalCdf` 또는 동등한 이름)는 architecture.md ⑧에 아직 없다 —
새로 추가해야 하는 순수 함수다(이 문서가 architecture.md 를 고치지 않는다 — 읽기 전용 경로다. `curvez-nextjs` 가
`entities/growth/model`/`shared/lib/normal-distribution` 에 추가할 때 이 스펙을 근거로 쓰면 된다). 정확도 기준은
기존 `standardNormalCdf` 와 같게(절대 오차 1e-6 이하) 둔다 — 그래야 p3/p97 선이 표의 "3 미만/97 초과" 경계와
시각적으로 어긋나지 않는다.
표시 자릿수: p3/p50/p97 모두 소수 첫째 자리까지 반올림한다(백분위 수치 자체의 반올림 규칙 PC-F8-AC4 와 같은 자릿수).
실측값(`value`)의 표시 자릿수는 바꾸지 않는다 — `GrowthRecordRow` 가 이미 쓰는 값(height/headCircumference 소수
첫째 자리, weight 는 `weightKg` 그대로)을 그대로 쓴다.

## props
| 이름 | 타입 | 필수 | 기본값 | 의미 |
|---|---|---|---|---|
| measure | `"height" \| "weight" \| "headCircumference"` | O | — | height→제목 "키 추이", 아이콘 `Ruler`, 단위 "cm". weight→"몸무게 추이", 아이콘 `Weight`, 단위 "kg". headCircumference→"머리둘레 추이", 아이콘 `CircleDashed`, 단위 "cm". 세 아이콘 모두 `GrowthEntryForm` 의 같은 지표 아이콘을 그대로 재사용한다(새 아이콘 없음) |
| points | `GrowthTrendPoint[]` | O | — | 측정일 **오름차순**(가장 오래된 기록이 배열 맨 앞, x축 왼쪽). 길이 0·1·2+ 세 경우 모두 이 컴포넌트가 처리한다(아래 `## states`) |

## states
| state | 트리거 | 시각 변화 |
|---|---|---|
| ready | `points.length >= 2` | 아래 `## 레이아웃` 그대로 그래프를 그린다 |
| insufficient-data | `points.length === 1` | 그래프 대신 한 줄 안내 카드: `IconBadge`(icon="Info", tone=primary, size=sm) + "측정 기록이 1개뿐이라 추이를 보여줄 수 없습니다. 기록을 1개 더 추가하면 추이 그래프가 보입니다."(PC-F8-AC3 의 "2개 이상" 조건을 그대로 문구로 옮김). 카드 높이는 `ready` 상태보다 낮다(그래프 캔버스를 그리지 않는다 — 빈 좌표축만 있는 그래프는 오해를 부른다) |
| empty | `points.length === 0` | 아무것도 그리지 않는다(`return null`). 이 경우는 상위 화면(`screens/growth.md` state:empty)의 `StatePanel`("아직 기록이 없습니다")이 이미 콘텐츠 영역 전체를 대체하므로, 같은 안내를 이 컴포넌트가 다시 그리면 같은 말이 두 번 보인다 |
| loading | 데이터 준비 전(200ms 이상 걸릴 때만) | 이 컴포넌트 자체는 로딩 상태를 갖지 않는다 — `screens/growth.md` state:loading 이 trend 영역 자리를 `Skeleton`(shape=card)으로 통째로 대체한다(`GrowthRecordTable` 과 같은 처리) |
| error | 쓰이지 않음 | 해당 없음 — 상위 화면의 `StatePanel`(variant=error)이 trend 영역을 포함한 content 전체를 대체한다 |
| disabled | 쓰이지 않음 | 해당 없음(정적 시각화라 비활성 상태가 없다) |

### ready 상태의 레이아웃 (recharts 매핑)

```
<header>{IconBadge(icon, tone=primary, size=sm)} {title}({unit})</header>
<ResponsiveContainer width="100%" height={chartHeight}>
  <LineChart data={points} margin={{ top: 8, right: 12, left: 4, bottom: 8 }}>
    <CartesianGrid stroke="var(--color-border-subtle)" strokeDasharray="3 3" vertical={false} />
    <XAxis dataKey="measurementDate" type="category"
           tickFormatter={d => d.slice(5).replace("-", ".")}  // "2026-06-01" → "06.01"
           tick={{ fontSize: 14, fill: "var(--color-text-muted)" }}
           tickLine={false} axisLine={{ stroke: "var(--color-border-subtle)" }}
           interval="preserveStartEnd" minTickGap={24} />
    <YAxis type="number" width={36}
           tick={{ fontSize: 14, fill: "var(--color-text-muted)" }}
           tickLine={false} axisLine={false} />
    <Tooltip content={<상세 포맷 — 아래 "## 툴팁" 참고>} />
    <Legend verticalAlign="bottom" height={28}
            wrapperStyle={{ fontSize: 14, color: "var(--color-text-muted)", paddingTop: 8 }} />
    <Line dataKey="p97" name="97백분위" stroke="var(--color-accent-danger)" strokeWidth={1.5}
          strokeDasharray="6 3" dot={false} activeDot={false} connectNulls={false} isAnimationActive={false} />
    <Line dataKey="p50" name="50백분위(중앙값)" stroke="var(--color-text-muted)" strokeWidth={1.5}
          strokeDasharray="2 3" dot={false} activeDot={false} connectNulls={false} isAnimationActive={false} />
    <Line dataKey="p3" name="3백분위" stroke="var(--color-accent-danger)" strokeWidth={1.5}
          strokeDasharray="1 4" dot={false} activeDot={false} connectNulls={false} isAnimationActive={false} />
    <Line dataKey="value" name="실측값" stroke="var(--color-accent-primary)" strokeWidth={2}
          dot={<커스텀 dot — 아래 "## 점 모양" 참고>} activeDot={{ r: 6 }}
          connectNulls={true} isAnimationActive={false} />
  </LineChart>
</ResponsiveContainer>
<footer>{범례 설명 캡션 — 아래 "## 점 모양" 참고}</footer>
<span class="sr-only">자세한 값은 아래 성장 기록 표에서 확인할 수 있습니다.</span>
```

`p3`/`p50`/`p97` 세 선은 `connectNulls={false}` 다 — `percentileHidden=true` 인 점(예정일 이전 측정)에서는 값이
`null` 이라 그 지점에서 선이 끊긴다(의도된 표현 — 그 시점엔 백분위 기준 자체가 없다는 뜻). `value` 선은
`connectNulls={true}` 다 — 실측값은 백분위 표시 여부와 무관하게 항상 있으므로 끊지 않는다.
전부 `isAnimationActive={false}` — 하이드레이션 직후·테스트(E2E 스크린샷) 에서 애니메이션이 끝나기를 기다리지
않게 한다(지시서 CONTEXT "애니메이션 끔").

### 점 모양 (실측값 선의 `dot`, 색만으로 의미를 가르지 않는다)

| 점 상태 | 조건 | 모양 | 색 |
|---|---|---|---|
| 기본 | `!cautionNeeded && !percentileHidden` | 채운 원(r=4) | `--color-accent-primary` |
| 주의 | `cautionNeeded` | 채운 삼각형(한 변 8px, 꼭짓점 위) | `--color-accent-danger` |
| 백분위 없음 | `percentileHidden` | 빈 사각형(한 변 8px, 테두리만) | 테두리 `--color-text-muted`, 채움 `--color-bg-surface` |

위 표의 모양 차이(원/삼각형/사각형)가 1차 구분 수단이고 색은 보조다(PC-NF-A11Y-1 확장 — "색+아이콘/모양+텍스트"
세 겹 규칙과 같은 원리). 색만으로는 주의/일반을 가를 수 없는 사용자(저시력·색각 이상)도 모양으로 구분한다.
`## 레이아웃` 그래프 바로 아래 캡션(footer)에 세 모양을 한 번씩 텍스트로 설명한다 — recharts `Legend` 는 한
시리즈(`value`)안에서 점마다 달라지는 모양을 표현하지 못해 별도 캡션이 필요하다:

```
● 실측값   ▲ 소아청소년과 상담을 권합니다(PC-F8-AC2)   ☐ 이 시기는 백분위를 표시하지 않습니다(PC-F8-AC5)
```

캡션 문구는 `GrowthRecordTable` 이 같은 조건에서 쓰는 SPEC 원문과 똑같다 — 같은 데이터를 두 곳에서 다른 말로
설명하지 않는다.

## 툴팁

마우스 호버·터치(모바일은 탭)로 한 점을 가리키면 아래 내용을 이 순서로 보여준다(recharts 기본 Tooltip 대신
커스텀 `content`):

```
{measurementDate}
실측값: {value}{unit}
{ageBasisLabel ?? "교정 나이 시작 전"}
{percentileHidden
  ? "이 시기는 백분위를 표시하지 않습니다"
  : `백분위: ${percentileValue}%ile`}
{p97 != null && `97백분위 기준: ${p97}${unit}`}
{p50 != null && `50백분위 기준: ${p50}${unit}`}
{p3  != null && `3백분위 기준: ${p3}${unit}`}
```

`percentileHidden` 일 때는 p3/p50/p97 세 줄 자체가 `null` 이라 자동으로 빠진다(위 조건부 렌더링). 배경
`--color-bg-surface`, 테두리 `--color-border-subtle`, 그림자 `--elevation-card`, 글자 `--font-size-meta`(14px)
`--color-text-primary`.

## a11y
- a11y:label — 그래프 전체(`ResponsiveContainer` 래퍼)에 `aria-hidden="true"` 를 둔다. 그래프는 같은 데이터를
  `GrowthRecordTable` 이 이미 행 단위 `aria-label` 로 완전히 설명하고 있는 보조 시각화라, 스크린리더에는 중복해서
  읽히지 않는다(값이 두 곳에서 다른 말로 나오면 오히려 혼란을 준다). 그래프 바로 다음에 시각적으로 숨긴(`sr-only`,
  0px 텍스트가 아니라 CSS clip 기법) 안내문 "자세한 값은 아래 성장 기록 표에서 확인할 수 있습니다." 한 줄만 둔다 —
  이 한 줄이 "그래프는 이미지이고 표가 이미 있다"는 연결을 스크린리더 사용자에게 알려준다
- a11y:focus — 차트 자체는 포커스 대상이 아니다(탭 순서에서 건너뛴다, `aria-hidden` 요소는 애초에 포커스 가능
  요소를 두지 않는다 — recharts 기본 포커스 가능 엘리먼트가 생기지 않도록 `tabIndex` 를 부여하지 않는다)
- a11y:contrast — 선 색 3종 모두 카드 배경(`--color-bg-surface`, `#FFFFFF`) 위에서 3:1(WCAG 1.4.11 비텍스트 대비)
  이상이어야 한다. 실측값 선 `#0E7490/#FFFFFF`=5.36(새로 확인, `tokens.md` 대비 검증 표에 추가), 50백분위 선
  `#57534E/#FFFFFF`=7.63(기존 "보조/서피스" 쌍 재사용), 3·97백분위 선 `#B91C1C/#FFFFFF`=6.47(기존 "오류 텍스트/서피스"
  쌍 재사용) — 세 값 모두 3:1 은 물론 4.5:1 도 넘는다. 캡션·툴팁 텍스트는 `--color-text-muted`/`--color-text-primary`
  기존 대비 값을 그대로 쓴다(새 쌍 없음)
- a11y:target — 터치 대상이 아니다(`aria-hidden`). 툴팁은 보강 정보이지 필수 조작이 아니라 터치 타깃 기준(24×24)을
  적용하지 않는다 — 값은 이미 `GrowthRecordTable` 에서 터치 없이도 전부 보인다
- a11y:role — `aria-hidden="true"`(위 a11y:label 근거와 같다). `insufficient-data` 상태의 안내 카드는 `role="status"`
  (조용히 알리는 정보, 포커스를 가로채지 않는다 — `StatePanel`(domain-empty)과 같은 역할 선택 이유)

## responsive
- <768: 카드 폭 100%(360px 뷰포트 기준 328px, `--space-4` 좌우 16px 뺀 값). 그래프 높이(`chartHeight`) 200px.
  `Legend` 4개 항목(실측값·97백분위·50백분위(중앙값)·3백분위)이 폭 부족으로 2줄로 줄바꿈될 수 있다(recharts 기본
  동작, 허용) — 캡션(footer)은 항상 1줄로 유지되도록 세 항목 사이 구분자를 `--space-3`(12px) 간격으로만 두고
  줄바꿈을 막지 않는다(길면 자연히 2줄)
- 768~1279: 카드 폭 `--layout-content-max`(720px, 화면 자체의 content 컨테이너 폭과 같다). 그래프 높이 220px.
  `Legend` 는 보통 1줄에 들어간다
- >=1280: 카드 폭 720px 그대로(1280px 뷰포트에서도 화면 전체가 720px 본문 폭 규칙을 쓰므로 더 넓어지지 않는다 —
  `tokens.md:## 레이아웃` 7·8차 라운드 결정과 같다). 그래프 높이 240px, 카드 내부 패딩 `--space-6`(32px, 다른
  1280px 카드와 같은 규칙)

## decisions (이 문서 작성 시 확정)

| 무엇을 | 왜 | 되돌릴 위치 |
|---|---|---|
| 지표 3개(키·몸무게·머리둘레)를 한 그래프에 섞지 않고 `GrowthTrendChart` 인스턴스 3개(지표별 작은 그래프, small multiples)로 쌓는다. 지표 전환 탭(SegmentedControl 재사용)은 쓰지 않는다 | 섞으면 y축 단위가 cm/kg 로 갈려 한 축에 둘 수 없다(지시서 CONTEXT 가 이미 금지). 탭 전환 방식은 한 번에 지표 하나만 보여줘 세 지표를 동시에 비교(예: 키는 늘지만 몸무게가 또래보다 처지는지)하기 어렵고, 새 상호작용 상태(선택된 탭)를 추가해야 한다. 세로로 쌓으면 추가 상태 없이 한 화면 스크롤로 셋 다 볼 수 있다 — `growth` 화면이 이미 1열 세로 스크롤 구조라 레이아웃 변경도 없다 | `screens/growth.md:## layout` region: trend |
| x축을 측정일(날짜)로 하고 나이(개월)로 하지 않는다 | PC-F8-AC3 SPEC 원문이 "**측정일 순서로** 추이 그래프가 그려진다"다. 나이는 기록마다 기준(교정/생후)이 바뀔 수 있어(`ageBasisLabel`) 하나의 연속된 축으로 쓰면 기준 전환 지점에서 축이 끊기거나 왜곡된다. 측정일은 모든 기록(심지어 `percentileHidden`)에 항상 있어 축이 끊기지 않는다 | 이 문서 `## 레이아웃` XAxis dataKey |
| 백분위 기준선(3·50·97)을 함께 그린다 | 성장 백분위 앱에서 실측값만 보여주면 "또래 대비 어디쯤인지"를 그래프가 답하지 못한다 — AC2(3 미만/97 초과 주의)를 시각적으로 뒷받침하는 것이 이 그래프의 핵심 가치다. 지시서가 "그린다면 LMS 데이터에서 계산할 수 있는 것만" 이라고 허용 범위를 줬고, LMS 의 L·M·S 로 역산한 값은 그 범위 안에 있다 | 이 문서 `## 데이터 전제`, `## props`(points.p3/p50/p97) |
| 백분위 역산에 필요한 `inverseStandardNormalCdf`(또는 동등 함수)가 architecture.md ⑧에 아직 없다는 사실을 이 문서에만 남기고 architecture.md 는 고치지 않는다 | 지시서 SCOPE 가 architecture.md 를 읽기 전용으로 뒀다. 이 함수는 기존 `entities/growth/model`·`shared/lib/normal-distribution` 구조를 바꾸지 않고 함수 하나를 더하는 것이라 레이어 경계와 충돌하지 않는다 — `curvez-architect` 에 알릴 사안(경계 충돌)이 아니라 `curvez-nextjs` 구현 메모로 충분하다고 판단했다 | `.curvez/architecture.md:#### ⑧ 성장 기록과 백분위` (다음 아키텍처 라운드에서 공식화할지는 오케스트레이터 판단) |
| 그래프 SVG 전체를 `aria-hidden` 처리하고, 점마다 `aria-label` 을 넣는 완전 접근형 차트로 만들지 않는다 | `GrowthRecordTable` 이 이미 같은 데이터를 행 단위로 완전히 설명한다(`a11y:label` 참고). 그래프까지 똑같이 설명하면 같은 정보가 다른 말로 두 번 나와 스크린리더 사용자에게 오히려 혼란이다. "최소한의 코드" 원칙과도 맞는다 — 이미 있는 접근 가능한 표현을 가리키는 한 줄이 가장 단순한 해법이다 | 이 문서 `## a11y` |

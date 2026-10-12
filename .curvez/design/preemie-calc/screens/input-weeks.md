# screen: input-weeks
route: /?weeks=<24~36>
goal: F13 조합 페이지에서 넘어온 방문자가 자기 출생 주수가 이미 채워진 상태로 입력을 이어간다(PC-F13-AC3)
entry: /guide/[weeks]/[months] 페이지의 "계산기로 가기" 링크
exit: screen:input 과 같다 — 저장 성공 → /dashboard

## layout
`screen:input` 과 동일한 컴포넌트·순서·배경(`page-background`, `--gradient-hero-canvas`)·form-card 를 그대로 쓴다.
다른 점 한 가지만 아래에 적는다. 헤더도 `screen:input` 과 동일하게 **제목이 항상 화면 정중앙**에 온다.

- region: content > form-card > form
  - role: `screen:input` 과 같되, 시작 상태가 다르다
  - 차이: 주수 모드로 시작한다. GestationInput 의 weeks 값이 쿼리 파라미터 `weeks` 로 채워지고 days=0, 나머지(출생일·성별)는 비어 있다. `weeks` 가 24~36 범위 밖이거나 없으면 `screen:input` 의 기본 상태(예정일 모드, 빈 값)로 그린다

## states
- state:default — weeks 프리필 + 출생일 비어 있음. `screen:input` 의 state:default 와 같은 유효성 규칙을 쓴다
- state:loading — `screen:input` 과 같다(200ms 미만, 표시 안 함)
- state:empty — `screen:input` 과 같다(빈 상태 없음, 입력 폼이 기본 상태다)
- state:error — `screen:input` 과 같다("날짜를 확인하세요")

## responsive
- `screen:input` 과 같다(360~767px / 768~1279px / >=1280px 레이아웃 값 전부 동일)

## a11y
- focus-order: `screen:input` 과 같다. weeks 값이 채워져 있어도 포커스는 출생일에서 시작한다(값이 없는 첫 필드가 아니라 문서 순서를 따른다)
- landmark: content = main, header = banner
- announce: `screen:input` 과 같다

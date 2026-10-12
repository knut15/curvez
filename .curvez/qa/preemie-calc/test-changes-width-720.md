forbidden-words: allow

# preemie-calc E2E 변경 목록 — 8차 라운드(본문 폭 720px 통일 대응)

`curvez-nextjs.20260930-105749.json` decisions 가 지목한 깨진 2건을 고치고, 이번 라운드
GOAL이 새로 요구한 "본문·헤더 안쪽 폭이 같다"를 9개 화면 × 360/768/1280px 로 실측하는 검사를
추가했다.

## A. 대시보드 main·sidebar 2열 전제가 사라져 깨진 2건 (전제 자체 교체)

`tests/e2e/nf-header-layout.spec.ts`. 공통 원인: 7차 라운드가 `--layout-container-max-desktop`
(1120px)·`.pc-dashboard-main`·`.pc-dashboard-sidebar` 를 없애고 대시보드를 모든 폭에서 1열로
바꿨다(tokens.md 7차 라운드 결정, 사용자 원문 "가로사이즈는 메인과 서브가 동일하게"). 아래 두
테스트는 그 2열 구조가 있다는 **전제 자체**를 검사했으므로 "같은 사실을 다른 선택자로" 고칠 수
없다 — 전제가 사라졌으니 검사 대상도 새 사실로 바꿨다.

| # | 이전(226행) | 이전(247행) | 이후 | 판정하는 사실이 달라진 이유 |
| --- | --- | --- | --- | --- |
| 1 | "[디자인 재구성] 1280px 에서 대시보드는 main·sidebar 2열이다(x 좌표가 서로 다르다)" — `.pc-dashboard-main`/`.pc-dashboard-sidebar` 의 x 가 다름을 확인 | "[디자인 재구성] 768px 에서 대시보드는 main·sidebar 가 같은 x(1열)로 쌓인다" — 두 x 가 같음을 확인 | "[디자인 재구성 8차] {360,768,1280}px 에서 대시보드는 1열이다(나이 카드·바로가기·공유·면책의 왼쪽 x 가 같고 세로 순서가 지켜진다)" 3개 — `AgeSummaryCard`(role=group, name="오늘 기준 나이")·`QuickLinks` 첫 항목(role=link, name="어느 나이를 쓰나")·`ShareResultAction`(role=button, name="링크 복사")·`ReferenceFooter`(text="참고용이며 진단을 대신하지 않음") 4개 영역의 boundingBox.x 가 서로 0.5px 이내로 같고, y 가 그 순서로 증가하는지 확인 | 이전 두 테스트는 "main·sidebar 라는 두 구획이 폭에 따라 나뉘거나 합쳐진다"는 사실을 검사했다. 그 구획 자체가 코드에서 없어졌으므로(main+sidebar wrapper div 삭제, `curvez-nextjs.20260930-105749.json` artifacts) 같은 이름의 로케이터로는 어떤 폭에서도 통과할 수 없다. GOAL CONTEXT가 지정한 새 사실("모든 폭에서 1열, 4개 영역이 같은 왼쪽 x, 세로 순서 age-summary→quick-links→share-entry→disclaimer")을 그대로 옮겼다 — 이전 테스트가 확인하던 "정렬 여부"라는 성격은 유지하되(왼쪽 x 비교), 대상을 실제로 남아 있는 구조(4개 콘텐츠 영역)로 바꿨다. 완화가 아니라 **폭을 3종(360/768/1280) 모두로 넓혔다**(이전엔 1280·768 각 1개씩, 총 2개 폭만 봤다) |

## B. 새로 추가한 검증 — `tests/e2e/nf-content-width.spec.ts`(신규 파일, 3개 테스트)

AC 번호가 아니라 이번 라운드 GOAL "새 검사"에 대응한다(`[디자인 재구성 8차]` 접두어).

- **본문·헤더 콘텐츠 폭 일치(3개 테스트, 360/768/1280px 각 1개)**: 9개 화면
  (input·input-weeks·dashboard·age-basis·checkups·copay-relief·correction-period·share·guide,
  `PageHeader.md` "쓰이는 화면" 목록과 정확히 대응) 전부에서 헤더 안쪽 그리드(`role=banner`
  의 첫 자식 div)와 본문 컨테이너(`role=main`의 마지막 자식 div)의 `boundingBox().x`·
  `.width` 를 재, (1) 같은 화면 안에서 헤더·본문이 같은지 (2) 화면 간에 서로 같은지
  (기준: 첫 화면 `input`, 차이 0.5px 이내) (3) 1280px 에서 폭이 정확히 720px 인지
  (`toBeCloseTo(720, 0)`, 720±0.5)를 확인한다.
- **측정 대상 판단(GOAL 지시 "클래스 이름에 기대지 말고 boundingBox 로 재는 편이 좋다")**:
  `main`·`banner`의 구조(첫/마지막 자식 div)로 대상을 잡고 클래스 이름(`.pc-content-max`
  등)에는 의존하지 않는다. `globals.css` 최상단의 `@import "tailwindcss"` 가 Tailwind
  preflight(전역 `box-sizing:border-box`, 실측:
  `node_modules/tailwindcss@4.3.3/preflight.css:12`)를 들여오므로, `max-width:720`은
  padding 을 포함한 렌더 박스 자체의 상한이다 — `boundingBox()`(padding 포함 렌더 박스)를
  그대로 쓰면 1280px 에서 정확히 720.00 이 나온다(패딩을 별도로 빼면 656 이 나와 720과
  어긋난다 — 처음에 content-box 로 잘못 가정해 656 이 나왔던 실패를 720 로 고친 경위는
  실행 로그 참고).

## 실측값 요약 (`nf-content-width.spec.ts` stdout, `last-run-e2e-r1-round8.log`)

| 폭 | header.x = body.x (9개 화면 전부 동일) | header.width = body.width (9개 화면 전부 동일) |
| --- | --- | --- |
| 360px | 0.00 | 360.00 |
| 768px | 24.00 | 720.00 |
| 1280px | 280.00 | **720.00** |

360px 은 콘텐츠 최대 폭(720)에 닿지 않아 뷰포트 전체(360)를 그대로 쓴다(좌우 패딩은 이
"렌더 박스" 안에 포함돼 있어 x·width 자체에는 드러나지 않는다 — 텍스트가 실제로 패딩만큼
안쪽에서 시작하는 것은 `nf-header-layout.spec.ts` 의 겹침 실측 테스트가 별도로 확인한다).
768px·1280px 모두 정확히 720.00 으로 캡이 걸려 9개 화면·헤더/본문 전부 일치한다.

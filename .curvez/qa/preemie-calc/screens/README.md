forbidden-words: allow

# preemie-calc 화면 캡처 (디자인 재구성 전후 비교)

`apps/preemie-calc/tests/capture/screens.spec.ts` 가 9개 화면(입력 2종 + 대시보드 5종 +
공유 수신 + 가이드) + 아이 2명 대시보드 1종, 총 10개 라우트를 360px·1280px 두 폭으로
fullPage PNG 캡처한다. 시계는 2026-06-01 KST, 기준 프로필은 출생 2026-03-01 · 예정일
2026-04-26(32주 0일) · 이름 "하늘" 로 고정한다(스위트 전역 기준 프로필과 동일).

이 스펙은 기본 `pnpm test:e2e`(= `playwright test`)에는 **포함되지 않는다.**
`playwright.config.ts` 의 `capture` project 는 `CURVEZ_CAPTURE` 환경변수가 있을 때만
등록되고, 스펙 파일 자체도 `tests/capture/`(chromium-mobile project 의 testDir 인
`tests/e2e/` 밖)에 있다.

## 실행 방법

워크트리 루트에서:

```bash
cd apps/preemie-calc
CURVEZ_CAPTURE=1 CURVEZ_CAPTURE_DIR=before pnpm exec playwright test --project=capture
```

`after` 를 찍을 때는 `CURVEZ_CAPTURE_DIR` 값만 바꿔 그대로 다시 돌린다:

```bash
cd apps/preemie-calc
CURVEZ_CAPTURE=1 CURVEZ_CAPTURE_DIR=after pnpm exec playwright test --project=capture
```

`CURVEZ_CAPTURE_DIR` 를 생략하면 기본값 `before` 를 쓴다. 결과는
`.curvez/qa/preemie-calc/screens/<CURVEZ_CAPTURE_DIR>/<route-slug>-<360|1280>.png` 에 쌓인다
(디렉터리가 없으면 스펙이 직접 만든다). 기존 웹서버 설정(`next build && next start -p 3200`)을
그대로 재사용하므로 별도로 dev 서버를 띄울 필요가 없다 — 명령 안에서 빌드·기동하고 캡처가
끝나면 playwright 가 서버를 종료한다. 포트 3100 은 사용자 확인용 dev 서버가 쓰므로 건드리지
않는다.

## 파일 목록 (route-slug)

| slug | route |
| --- | --- |
| `root` | `/` |
| `root-weeks-32` | `/?weeks=32` |
| `dashboard` | `/dashboard` (프로필 1명) |
| `dashboard-age-basis` | `/dashboard/age-basis` |
| `dashboard-checkups` | `/dashboard/checkups` |
| `dashboard-copay-relief` | `/dashboard/copay-relief` |
| `dashboard-correction-period` | `/dashboard/correction-period` |
| `share` | `/share#b=2026-03-01&d=2026-04-26` |
| `guide-32-3` | `/guide/32/3` |
| `dashboard-2children` | `/dashboard` (프로필 2명, 전환 탭 보임) |

10개 slug × 2폭(360·1280) = 20장.

# Next.js 스택의 게이트 차이

`profile.json` 의 `stack` 이 `nextjs` 이거나 `monorepo` 일 때 읽는다.
검사 경로는 `paths.web` 이다. 이 값이 없으면 추측하지 말고 `status: blocked` 다.
**이유:** 추측한 경로로 게이트를 돌리면 실제 소스가 아닌 곳을 검사하고도 "0 errors" 가 나온다.

---

## build 게이트의 가치가 높다

웹에서는 `build` 가 앞 4종이 **구조적으로 못 잡는** 것을 잡는다. 그래서 라운드 종료 시
빌드를 빼지 않는다.

| build 만 잡는 것 | 왜 typecheck 가 못 잡는가 |
|---|---|
| 서버 컴포넌트에서 `useState`·`onClick` 사용 (`use client` 누락) | 타입은 맞다. 경계 위반은 번들러가 판정한다 |
| 클라이언트 컴포넌트가 `server-only` 모듈을 import | 같은 이유. 런타임 경계라 타입에 안 나타난다 |
| 서버→클라이언트로 직렬화 불가능한 props 전달 (함수, `Date` 밖의 클래스 인스턴스) | 타입상 유효한 값이다 |
| `generateStaticParams` 누락으로 정적 라우트 생성 실패 | 파일 규약이라 타입 검사 대상이 아니다 |
| 환경변수 미설정으로 인한 프리렌더 실패 | 값의 존재는 빌드 시점에만 드러난다 |

**빌드 통과가 런타임 안전을 뜻하지는 않는다.** RSC 직렬화 오류 중 일부는 요청 시점에만 난다.
`build exit 0` 을 `result` 에 적을 때 "런타임 검증 아님" 을 전제로 둔다.

---

## 빌드가 게이트를 삼키는 설정을 확인한다

`next.config.*` 에 아래가 있으면 빌드가 타입·린트 오류를 **무시하고 통과**한다.

```
typescript: { ignoreBuildErrors: true }
eslint: { ignoreDuringBuilds: true }
```

- 이 설정이 있으면 `build exit 0` 을 typecheck·lint 통과의 근거로 쓰지 마라.
  **이유:** 오류를 끄고 통과한 빌드를 "3종 통과" 로 보고하면 실제로는 한 종만 검증된 것이다
- 반대로 이 설정이 **없으면** `next build` 가 tsc·eslint 를 다시 돌린다. 이때 typecheck·lint 를
  이미 돌렸다면 같은 검사를 두 번 하는 것이므로, 라운드 종료 게이트에서는 시간 중복을
  `decisions` 에 근거로 남기고 그대로 둔다. 빌드 쪽 결과를 끄지 마라

빌드 로그의 `Route (app)` / `Route (pages)` 표에서 각 라우트가 정적(`○`)인지 동적(`ƒ`)인지 읽는다.
직전 라운드에서 정적이던 라우트가 동적으로 바뀌었으면 의도한 변경인지 확인하고 `summary` 에 적는다.

---

## 0개 실행 함정 — 웹판

| 형태 | 어떻게 드러나는가 | 확인 |
|---|---|---|
| e2e 러너가 dev/preview 서버 미기동으로 스위트를 못 띄움 | `No tests found` 또는 스위트 0개 + exit 0 | `zero-run-signal` 이 1 이상 |
| jsdom/happy-dom 환경 미설정으로 컴포넌트 테스트 파일이 전부 제외됨 | 단위 테스트만 돌고 개수가 급감 | 직전 실행의 테스트 개수와 비교한다 |
| `testMatch` 가 `app/` 디렉터리를 안 덮음 | 라우트 테스트가 통째로 빠짐 | 테스트 파일 수와 실행 개수를 함께 본다 |

**실행 개수는 직전 라운드와 비교한다.** 절대값이 1 이상이어도 **급감**은 스위트가 부분적으로
사라졌다는 신호다.
**이유:** 0개 실행만 막으면 "절반이 조용히 빠진" 상태를 놓친다. 남은 절반이 전부 통과하므로
초록불과 구분되지 않는다.

---

## arch 게이트 적용

`.curvez/architecture.md` 의 `ARCH-NNN` 검사 경로가 `paths.web` 아래를 가리키는지 확인한다.
웹에서 가장 자주 걸리는 것은 도메인 레이어의 프레임워크 import 다.

```
| ARCH-001 | src/domain/ | from ['\"](next\|next/.*\|react\|react-dom) | 도메인은 프레임워크 교체에서 분리돼야 한다 |
```

`.next/`, `out/`, `node_modules/` 는 검사에서 뺀다.
**이유:** 빌드 산출물에는 프레임워크 import 가 당연히 들어 있어 전부 위반으로 잡힌다.
그 잡음이 실제 위반을 덮는다.

```bash
grep -rnE --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=out -- "$pat" "$path"
```

# React Native / Expo 스택의 게이트 차이

`profile.json` 의 `stack` 이 `react-native` 이거나 `monorepo` 일 때 읽는다.
검사 경로는 `paths.mobile` 이고, `expo.sdkVersion` 이 필수 키다. 둘 중 하나라도 없으면
추측하지 말고 `status: blocked` 다.
**이유:** SDK 버전에 따라 러너 preset 과 번들 명령이 달라진다. 추측한 버전으로 돌린 게이트는
다른 프로젝트를 검사한 것과 같다.

---

## build 게이트를 EAS 로 잡지 마라

`commands.build` 가 `eas build` 계열이면 **기본 게이트에 넣지 않는다.**
**이유:** EAS 빌드는 클라우드 큐에 들어가 수 분~수십 분 걸리고 결과가 네트워크·크레딧에 의존한다.
게이트가 그만큼 느려지면 팀이 게이트 자체를 건너뛰기 시작하고, 그러면 빠른 4종까지 같이 사라진다.

대신 **로컬에서 몇 초~수십 초에 끝나는 대체 검사**로 build 축을 채운다.

| 대체 검사 | 무엇을 잡는가 |
|---|---|
| `npx expo-doctor` | 설치된 패키지 버전이 `expo.sdkVersion` 과 어긋난 것. 네이티브 설정 불일치 |
| `npx expo export --platform ios --output-dir /tmp/expo-export` | metro 번들 해석 실패, 존재하지 않는 모듈 import, 순환 import |

- 대체 검사를 썼으면 `verification` 의 `command` 에 **실제로 돌린 그 명령**을 적는다.
  `commands.build` 값을 적지 마라 — 돌리지 않은 명령이다
- 대체로 채웠다는 사실과 근거를 `decisions` 에 남긴다 (`reversible_at`: `profile.json` 의 `commands.build`)
- EAS 빌드는 릴리스 직전에만 돌린다

**네이티브 모듈이나 `app.json` 의 네이티브 설정이 바뀐 라운드에서만** `npx expo prebuild --clean` 을
추가로 돌린다. JS 만 바뀐 라운드에서 prebuild 를 돌리지 마라.
**이유:** prebuild 는 `ios/`·`android/` 를 재생성한다. 바뀔 이유가 없는 라운드에 돌리면
게이트가 소스 트리를 변형시키고, 그 변형이 다음 게이트의 입력이 된다. 검사기가 검사 대상을
바꾸면 결과를 신뢰할 수 없다.

---

## typecheck 가 SDK 불일치를 못 잡는다

`node_modules` 에 설치된 Expo 패키지 버전이 `expo.sdkVersion` 과 달라도 타입은 통과한다.
타입 정의는 설치된 쪽을 따르고, 런타임 네이티브 모듈은 앱 바이너리 쪽을 따르기 때문이다.

- 그래서 **`expo-doctor` 를 typecheck 와 함께** 돌린다. 순서상 typecheck 직후다
- `result` 예: `expo-doctor: 15 checks, 1 failed (expo-router 버전 불일치)`

---

## 0개 실행 함정 — 모바일판

| 형태 | 어떻게 드러나는가 |
|---|---|
| `jest-expo` preset 미설정 | RN 컴포넌트 테스트가 transform 실패로 통째로 제외되고 exit 0 |
| `transformIgnorePatterns` 가 `node_modules` 전체를 막음 | RN 패키지 import 하는 테스트가 전부 수집 실패 |
| `testEnvironment` 가 node 로 남아 있음 | 렌더 테스트만 조용히 빠짐 |

RN 은 transform 계층이 두꺼워 **"수집 자체가 실패한 파일"** 이 실패가 아니라 제외로 처리되는
경우가 많다. 실행 개수뿐 아니라 **수집한 스위트 파일 수**도 함께 확인한다.

```bash
grep -Eio '[0-9]+ +(test suites?|tests?|passed|failed|skipped)' .curvez/qa/test.log | sort -u
```

**이유:** 실행 개수가 1 이상이어도 스위트 파일 수가 직전보다 줄었으면 절반이 조용히 빠진 것이고,
남은 절반이 통과하므로 초록불과 구분되지 않는다.

---

## arch 게이트 적용

검사 경로는 `paths.mobile` 이다. `ios/`, `android/`, `.expo/` 는 검사에서 뺀다.
**이유:** 네이티브 프로젝트 디렉터리는 생성물이라 규칙 위반이 당연히 들어 있고,
그 잡음이 실제 위반을 덮는다.

```bash
grep -rnE --exclude-dir=node_modules --exclude-dir=ios --exclude-dir=android --exclude-dir=.expo -- "$pat" "$path"
```

`monorepo` 스택에서 `paths.domain` 은 웹·모바일 양쪽 규칙의 검사 대상이 된다.
도메인이 `react-native` 를 import 하는 것은 웹 쪽 `ARCH` 규칙에도 걸리는 위반이므로
한 번만 세고 규칙 ID 를 둘 다 적는다.

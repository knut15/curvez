# react-native

`curvez:bootstrap` 이 React Native / Expo 프로젝트의 `.curvez/profile.json` 을 만들 때 참조하는 관례 모음이다.
`stack` 값 `react-native` 에 대응한다. 웹과 모바일이 한 저장소에 같이 있으면 이 프리셋이 아니라 `monorepo` 다.

이 프리셋은 **후보를 알려줄 뿐 값을 확정하지 않는다.** 감지로 확인하지 못한 값은 인터뷰로 묻고,
인터뷰로도 못 채운 필수 키가 남으면 `status: blocked` 다. 특히 `paths.mobile` 과 `expo.sdkVersion` 은
추측이 허용되지 않는다.

**필수 키:** `paths.mobile`, `expo.sdkVersion` — **선택 키:** `paths.tests`

---

## 감지 신호

`SKILL.md` 절차 2 의 감지 출력에서 **`expo` 또는 `reactNative` 가 있고 `next` 가 없고 `workspace: false`** 이면
`react-native` 다. 이 세 조건이 동시에 맞을 때만 판정한다.

### 어디를 보는가

`package.json` 의 `dependencies` + `devDependencies` **만** 본다.

| 키             | 의미                                              |
| -------------- | ------------------------------------------------- |
| `expo`         | Expo SDK. 값이 `expo.sdkVersion` 의 유일한 출처다 |
| `react-native` | RN 자체. `expo` 없이 이것만 있으면 bare 다        |

### 오탐 케이스

| 형태                                                                    | 왜 오탐인가                                                                    | 어떻게 거른다                                                                                    |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| `package.json` 최상위에 `"expo": { ... }` **객체**                      | 구버전 Expo 의 앱 설정 블록이다. 의존성이 아니다                               | 문자열 범위인지 확인한다. 객체면 의존성 신호가 아니다                                            |
| `expo-*` 만 있고 `expo` 가 없다                                         | `expo-crypto` 같은 개별 모듈은 웹 프로젝트도 쓴다                              | `expo` 정확 일치만 신호로 센다. 접두사 매칭을 쓰지 마라                                          |
| `@types/react-native` 만 있다                                           | 타입만 참조하는 라이브러리 저장소일 수 있다                                    | `react-native` 정확 일치만 센다                                                                  |
| `react-native-web` 만 있고 `react-native` 가 없다                       | 웹 전용 호환 레이어다                                                          | `react-native` 정확 일치만 센다                                                                  |
| `next` 와 `expo`(또는 `react-native`)가 **같은** `package.json` 에 있다 | Expo Router 웹 빌드를 곁들인 RN 앱일 수도, 마이그레이션 중인 웹 앱일 수도 있다 | 판정하지 말고 인터뷰 1번 문항으로 올린다. `references/stack-detection.md` 가 정본이다            |
| `workspace: true`                                                       | 앱이 하위 패키지에 있어 루트 의존성만으로는 안 보인다                          | `skills/bootstrap/references/stack-detection.md` 의 순회 절차를 따른다. `monorepo` 가 될 수 있다 |
| `react-native` 가 `peerDependencies` 에만 있다                          | RN 용 라이브러리 저장소지 앱이 아니다                                          | `peerDependencies` 를 감지에 넣지 않는다                                                         |

### Expo 관리형과 bare RN 을 가른다

**이 구분은 `stack` 값을 바꾸지 않는다.** 둘 다 `react-native` 다. 하지만 `curvez-react-native` 는
expo-router 기본값·`expo install` 정렬·`expo-doctor`·Expo Go 리로드를 **전제로** 판단하고,
`skills/quality-gate/references/react-native.md` 의 대체 build 검사도 Expo CLI 를 쓴다.
bare 에서는 그 전제가 통째로 성립하지 않으므로 **감지 단계에서 반드시 갈라 두고 완료 보고에 남긴다.**

| 신호                                                           | 판정                                                                                                                                                         |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `expo` 의존성 있음 + `ios/`·`android/` 디렉터리 없음           | **Expo 관리형(CNG).** `curvez-react-native` 의 전제가 그대로 맞는다                                                                                          |
| `expo` 의존성 있음 + `ios/`·`android/` 가 저장소에 커밋돼 있음 | **prebuild 산출물이 들어온 상태.** 관리형 API 는 그대로 쓰지만 Expo Go 가 아니라 dev client 로 돈다. SDK 업그레이드마다 네이티브 디렉터리 수동 병합이 생긴다 |
| `expo-dev-client` 의존성 있음                                  | Expo Go 로 못 돌린다. QA 루프가 빌드 대기로 바뀐다는 사실을 보고에 남긴다                                                                                    |
| `expo` 없음 + `react-native` 있음                              | **bare RN.** 아래 `## expo.sdkVersion` 의 bare 규칙으로 간다                                                                                                 |
| `app.json` 의 최상위 키가 `expo`                               | Expo                                                                                                                                                         |
| `app.json` 의 최상위 키가 `name` / `displayName` 뿐            | bare RN (`AppRegistry` 용 설정이다)                                                                                                                          |
| `react-native.config.js` / `ios/Podfile` 이 있고 `expo` 없음   | bare 확정                                                                                                                                                    |

```bash
node -e '
const fs=require("fs");
const r=(p)=>{try{return JSON.parse(fs.readFileSync(p,"utf8"))}catch{return null}};
const pkg=r("package.json")||{};
const d={...(pkg.dependencies||{}),...(pkg.devDependencies||{})};
const app=r("app.json");
console.log(JSON.stringify({
  expoDep: typeof d.expo==="string" ? d.expo : null,
  reactNativeDep: typeof d["react-native"]==="string" ? d["react-native"] : null,
  devClient: !!d["expo-dev-client"],
  nativeDirs: ["ios","android"].filter((x)=>fs.existsSync(x)),
  appJsonShape: app ? (app.expo ? "expo" : Object.keys(app).join(",")) : null
}, null, 2));
'
```

---

## paths 후보

### paths.mobile — 필수

**`paths.mobile` 은 RN 프로젝트 루트다.** 소스 디렉터리(`src/`, `app/`)가 아니다.

**이유:** `curvez-react-native` 는 이 경로 아래에만 쓴다. 라우트 등록(`app/`)·앱 설정(`app.json`)·
네이티브 설정이 전부 프로젝트 루트 기준이라 소스 디렉터리로 좁히면 등록해야 할 파일이 쓰기 범위 밖으로 나간다.
`monorepo` 의 `apps/mobile` 과도 같은 의미가 된다.

| 저장소 형태                         | `paths.mobile`                                                                            |
| ----------------------------------- | ----------------------------------------------------------------------------------------- |
| 단일 저장소 (루트가 곧 RN 앱)       | `"."`                                                                                     |
| 앱을 하위 디렉터리에 둔 단일 저장소 | `"mobile"` / `"app"` 등 실제 디렉터리                                                     |
| 워크스페이스                        | `"apps/mobile"` · `"apps/native"` · `"apps/app"` · `"packages/mobile"` — 순회 결과 그대로 |

**확인 방법 — `app.json` / `app.config.js` / `app.config.ts` 가 있는 디렉터리가 RN 프로젝트 루트다.**
셋 중 하나라도 있는 디렉터리를 찾고, 그 디렉터리에 `package.json` 이 함께 있는지 확인한다.

```bash
find . -maxdepth 3 \( -name node_modules -o -name .git -o -name ios -o -name android \) -prune -o \
  \( -name 'app.json' -o -name 'app.config.js' -o -name 'app.config.ts' \) -print
```

| 결과       | 행동                                                                             |
| ---------- | -------------------------------------------------------------------------------- |
| 정확히 1개 | 그 파일이 있는 디렉터리를 `paths.mobile` 로 쓴다                                 |
| 0개        | **추측하지 마라.** bare RN 이거나 설정이 다른 위치다. 인터뷰 2번 문항으로 묻는다 |
| 2개 이상   | 어느 것이 주 앱인지 인터뷰로 고르게 한다. 첫 번째를 집지 마라                    |

`app.config.ts` 와 `app.json` 이 **같은 디렉터리에** 함께 있는 것은 정상이다(정적 설정 + 동적 확장).
하나의 앱으로 센다.

**`paths.mobile` 이 `"."` 일 때의 함정:** 이 값은 `curvez-react-native` 와 `quality-gate` 의 grep 검사
대상 경로로 그대로 들어간다. 루트를 검사하면 `node_modules/`·`ios/`·`android/`·`.expo/` 가 전부 딸려 온다.
검사 명령이 이 디렉터리들을 제외하는지 확인한다 —
제외 규약은 `skills/quality-gate/references/react-native.md` 의 `## arch 게이트 적용` 이 정본이다.

### paths.tests — 선택, 유일하게 폴백 허용

```bash
ls -d __tests__ tests test e2e .maestro 2>/dev/null | head -3
```

| 결과         | 행동                                                                                                   |
| ------------ | ------------------------------------------------------------------------------------------------------ |
| 디렉터리 1개 | 그것을 쓴다                                                                                            |
| 여러 개      | 단위 테스트가 있는 쪽을 쓴다. `e2e/`·`.maestro/` 는 Detox·Maestro 시나리오라 단위 테스트 위치가 아니다 |
| 0개          | **키째로 생략한다.** RN 은 `__tests__/` 가 소스 옆에 흩어지는 관례가 흔하다. 빈 문자열을 넣지 마라     |

### paths.web / paths.domain

**`react-native` 스택에서는 둘 다 쓰지 않는다.** 계약의 키 목록에 없다.

- Expo 웹 빌드(`expo export --platform web`)가 있어도 `paths.web` 을 넣지 마라.
  **이유:** `paths.web` 은 `curvez-nextjs` 의 소유 경로 판정에 쓰인다. 같은 디렉터리에 소유자가 둘이 되면
  병렬 라운드에서 나중에 쓴 쪽이 앞선 쪽을 조용히 지운다. Expo 웹은 RN 앱의 출력 타깃이지 별도 앱이 아니다.
- 단일 저장소의 도메인 레이어 위치는 `profile.json` 이 아니라 `.curvez/architecture.md` 의
  `## 폴더 구조` 가 정한다. 웹·모바일이 공유하는 패키지가 실제로 있다면 그것은 `monorepo` 다.

---

## commands 후보

`package.json` 의 `scripts` **키 이름**에서만 고른다. 위에서부터 먼저 맞는 하나를 쓰고, 값은 `pnpm <스크립트명>` 이다.

| `commands` 키 | `scripts` 후보 (이 순서)           |
| ------------- | ---------------------------------- |
| `typecheck`   | `typecheck` → `type-check` → `tsc` |
| `lint`        | `lint`                             |
| `test`        | `test`                             |
| `build`       | `build`                            |

**후보가 하나도 없으면 그 키를 통째로 생략한다.** 빈 문자열도 `null` 도 아니다.
`typecheck` / `lint` / `test` 가 셋 다 비면 인터뷰 4번 문항으로 올린다.

### RN 저장소에 흔한, 게이트가 아닌 스크립트

`start` · `android` · `ios` · `web` · `prebuild` · `eas-build-pre-install` · `expo-doctor` · `doctor` · `export`.

이들은 **위 4개 키 어디에도 매핑하지 않는다.** 표에 없는 이름을 `commands` 에 넣지 마라.
`start` 는 개발 서버라 종료되지 않고, `android`/`ios` 는 시뮬레이터를 띄운다 —
`curvez-qa` 가 게이트로 돌리면 라운드가 그 자리에서 멈춘다.

### build 가 특히 애매하다

RN 에서 "빌드" 는 세 가지 서로 다른 것을 가리킨다.

| `scripts.build` 의 실제 값 | 무엇인가                                             | `commands.build` 에 넣는가                                        |
| -------------------------- | ---------------------------------------------------- | ----------------------------------------------------------------- |
| `eas build ...`            | **클라우드 큐.** 수 분~수십 분, 네트워크·크레딧 의존 | 스크립트가 실제로 있으면 값은 적는다. 다만 게이트로 쓰이지 않는다 |
| `expo export ...`          | 로컬 metro 번들 산출                                 | 넣는다                                                            |
| `tsc -b` / `tsup` 등       | 라이브러리 빌드                                      | 넣는다                                                            |

**`eas build` 를 로컬 게이트로 쓰지 마라.** `skills/quality-gate/references/react-native.md` 가
`commands.build` 가 `eas build` 계열이면 **기본 게이트에서 뺀다**고 정해 두었다.
게이트가 수십 분이 되면 팀이 게이트 자체를 건너뛰기 시작하고, 그러면 빠른 나머지까지 같이 사라진다.

빠진 build 축은 `quality-gate` 가 로컬 대체 검사로 채운다 — `npx expo-doctor`(설치 버전과 SDK 어긋남,
네이티브 설정 불일치), `npx expo export`(metro 해석 실패, 없는 모듈 import, 순환 import).

**대체 검사 명령을 `profile.json` 의 `commands` 에 써 넣지 마라.**
**이유:** `commands` 의 값은 "`package.json` 에 실제로 있는 스크립트" 라는 계약이다.
`npx expo-doctor` 는 스크립트가 아니므로 여기 적으면 `bootstrap` 완료 기준
("`commands` 의 모든 값이 `scripts` 에 실제로 있는 이름")을 깬다. 대체 검사는 게이트 쪽의 판단이고
근거는 `verification` 과 `decisions` 에 남는다.

`bootstrap` 은 스크립트의 **값까지 읽어** `eas build` 계열인지 확인하고, 그렇다면 그 사실을
완료 보고에 남긴다. 값 때문에 키를 생략하지는 않는다 — 실제로 존재하는 스크립트다.

---

## expo.sdkVersion

**`react-native` 스택의 필수 키다.** `paths.mobile` 과 함께 없으면 `status: blocked` 다.

### 뽑는 방법

출처는 **`paths.mobile` 의 `package.json` 에 있는 `expo` 의존성 범위 문자열** 하나뿐이다.
그 범위에서 **첫 숫자 묶음**만 뽑아 문자열로 넣는다.

```bash
node -e '
const fs=require("fs");
const pkg=JSON.parse(fs.readFileSync(process.argv[1]+"/package.json","utf8"));
const d={...(pkg.dependencies||{}),...(pkg.devDependencies||{})};
const range=typeof d.expo==="string" ? d.expo : null;
console.log(range===null ? "NO_EXPO_DEP" : ((range.match(/\d+/)||[])[0] || "UNKNOWN"));
' "$(node -p "require('./.curvez/profile.json').paths.mobile")"
```

| 범위 문자열                                                   | 결과                        |
| ------------------------------------------------------------- | --------------------------- |
| `~57.0.9`                                                     | `"57"`                      |
| `^57.0.0`                                                     | `"57"`                      |
| `57.0.9`                                                      | `"57"`                      |
| `npm:expo@~57.0.9`                                            | `"57"`                      |
| `*` · `latest` · `canary` · `workspace:*` · `git+https://...` | `UNKNOWN` → 인터뷰 3번 문항 |

git URL 이나 tarball URL 은 형태에 따라 URL 안의 숫자가 잡혀 `UNKNOWN` 이 아닌 값이 나올 수 있다.
`expo` 범위가 semver 형태(`~` `^` 또는 숫자로 시작)가 아니면 **뽑힌 숫자를 믿지 말고 인터뷰 3번 문항으로 올린다.**

`UNKNOWN` 이나 `NO_EXPO_DEP` 이 나오면 **거기서 멈춘다.** 값은 메이저 숫자만 담긴 문자열이다 —
`"57"` 이지 `57` 도 `"57.0.9"` 도 `"~57.0.9"` 도 아니다.

### `node_modules` 나 `app.json` 에서 읽지 마라

- `node_modules/expo/package.json` 의 실측값은 클론 직후 설치 전에는 존재하지 않는다.
  같은 저장소에서 실행 시점에 따라 결과가 갈리는 출처를 단일 출처로 쓸 수 없다.
- `app.json` 의 `expo.sdkVersion` 필드는 구버전 관례이고 최신 프로젝트에는 대개 없다. 있어도
  의존성 범위와 어긋난 채 방치돼 있을 수 있다.
  **교차 확인용으로만 쓰고, 두 값이 다르면 고르지 말고 인터뷰 3번 문항으로 올린다.**

### 추측하면 안 되는 이유

Expo 는 SDK 메이저마다 `react-native` · `react` · `expo-*` 모듈 버전이 **고정 짝**을 이룬다.
버전이 어긋나면 타입 체크도 린트도 통과한다 — 타입 정의는 설치된 패키지를 따르고 네이티브 모듈은
앱 바이너리를 따르기 때문이다. 어긋남은 **런타임 크래시나 네이티브 링크 실패**로만 드러나고,
증상이 원인에서 멀어 디버깅 비용이 구현 비용을 넘는다.

이 값은 `curvez-react-native` 의 `expo install` 정렬 기준이자 `quality-gate` 의 러너 preset 선택 기준이다.
틀린 값 하나로 그 라운드의 설치와 게이트가 통째로 다른 프로젝트를 대상으로 돈다.
그래서 두 곳 모두 **실측 폴백을 금지**하고 `profile.json` 만 읽는다 — 폴백을 허용하면
"프로파일이 맞는가" 를 검사할 기준 자체가 사라진다.

### bare RN 이라 `expo` 의존성이 없을 때

**값을 지어내지 마라. 최신 SDK 번호를 넣는 것도 지어내는 것이다.**

1. 먼저 인터뷰 3번 문항으로 확인한다 — "Expo SDK 를 쓰는가, 쓴다면 메이저 버전이 몇인가".
   워크스페이스 루트나 상위 패키지에 `expo` 가 있는데 앱 `package.json` 에만 없는 경우가 있다.
2. 사용자가 "Expo 를 쓰지 않는다(bare RN)" 라고 답하면 → `expo.sdkVersion` 을 채울 수 없다.
   현재 계약상 `react-native` 스택의 **필수 키**이므로 `status: blocked` 로 낸다.
   `blocked_on` 에 `who: user` 로 **"이 저장소는 bare RN 이라 `expo.sdkVersion` 이 존재하지 않는다.
   `react-native` 스택 계약이 Expo 를 전제하므로 계약 확장 또는 Expo 도입 결정이 필요하다"** 를 적는다.
3. 임의로 키를 생략하고 진행하지 마라. `bootstrap` 절차 7 의 검증이 `missing=expo.sdkVersion` 으로
   exit 1 을 낸다. **그 실패는 정상 동작이다** — 메우려 들지 마라.

**이유:** bare RN 에서 `expo.sdkVersion` 에 아무 값이나 넣으면 `curvez-react-native` 가
`expo install` · `expo-router` · Expo Go 를 전제로 코드를 쓰고, `quality-gate` 가 존재하지 않는
`expo-doctor` 를 돌린다. 스택을 잘못 판정한 것과 같은 결과가 되는데, 프로파일에는 그럴듯한 숫자가
들어 있어 원인 추적이 훨씬 어려워진다. 값이 없는 상태로 막히는 편이 낫다.

---

## 스택 고유 주의사항

### 웹 전역 객체가 없다

`window` · `document` · `localStorage` · `navigator` · `sessionStorage` 는 RN 런타임(Hermes)에 없다.
웹 코드를 옮겨 오거나 웹용 라이브러리를 그대로 가져오면 **타입 체크와 린트를 전부 통과한 뒤 런타임에서만** 터진다.
`@types/react-native` 와 DOM 타입이 같은 `tsconfig` 에 얹히면 타입 단계에서도 안 잡힌다.

- 저장 필요 → `expo-secure-store`(민감값) / `@react-native-async-storage/async-storage`(일반값)
- `localStorage` 를 쓰는 웹 라이브러리는 RN 어댑터가 있는지부터 확인한다. 없으면 `curvez-researcher`
- 검사 명령은 `curvez-react-native` 의 `## 품질 자체 검증` 4번에 이미 있다 (`paths.mobile` 대상, 기준 0건)

### 터치 타깃 · 안전 영역 · 키보드

셋 다 "있으면 좋은 것" 이 아니라 **누락되면 결함**이다. `.curvez/design/` 스펙에 값이 있으면 스펙이 우선이다.

| 항목        | 기본값 (스펙에 그 항목이 없을 때만)                                                | 실패 형태                                                                           |
| ----------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| 터치 타깃   | 최소 44×44 pt. 시각 크기가 작으면 `hitSlop` 으로 확보                              | 작은 아이콘 버튼에서 가장 자주 깨진다. 시뮬레이터 마우스 클릭으로는 재현되지 않는다 |
| 안전 영역   | 화면 루트와 하단 고정 요소에 `useSafeAreaInsets` / `SafeAreaView`                  | 상수 여백으로 대체하면 노치·홈 인디케이터 기기에서 잘린다                           |
| 키보드 회피 | 입력이 있는 화면에 `KeyboardAvoidingView`(동작은 `Platform.select`) 또는 동등 처리 | 키보드가 입력 필드를 가려도 개발 기기 화면 크기에서는 안 보인다                     |

### 플랫폼 분기 — 인라인이냐 파일 분리냐

| 갈리는 것                                         | 방법                                     |
| ------------------------------------------------- | ---------------------------------------- |
| 값 하나 (숫자·문자열·스타일 토큰·애니메이션 상수) | `Platform.select` / `Platform.OS` 인라인 |
| JSX 트리 구조 · 훅 호출 순서 · import 대상 모듈   | `.ios.tsx` / `.android.tsx` 파일 분리    |
| 한 컴포넌트 안 분기가 3곳 이상                    | 파일 분리                                |
| 노치·홈 인디케이터 여백                           | 분기하지 않고 `useSafeAreaInsets`        |

**이유:** 값 하나 때문에 파일을 나누면 같은 컴포넌트가 두 벌이 되어 이후 수정이 한쪽에만 들어간다.
반대로 훅 호출 순서가 플랫폼별로 달라지는데 인라인으로 처리하면 조건부 훅이 되어 런타임에 깨진다.
정본은 `agents/curvez-react-native.md` 의 `## 판단 기준` 이다.

### 리스트 가상화가 필요해지는 지점

| 항목 수                                      | 판단                                                                                  |
| -------------------------------------------- | ------------------------------------------------------------------------------------- |
| 고정 20개 이하이고 서버 데이터로 늘지 않는다 | `map` + `ScrollView`. 가상화하지 않는다                                               |
| 21개 이상이거나 개수가 서버 응답에 달렸다    | `FlatList` / `SectionList` + `keyExtractor`                                           |
| 100개 초과, 또는 항목에 이미지·차트가 있다   | 위에 더해 `getItemLayout` / `windowSize` / `removeClippedSubviews`                    |
| 무한 스크롤·페이지네이션이 스펙에 있다       | 항목 수와 무관하게 처음부터 가상화                                                    |
| 중첩 스크롤                                  | 바깥을 `FlatList` 로 두고 헤더/푸터 prop. `ScrollView` 안에 `FlatList` 를 넣지 않는다 |

`ScrollView` 는 자식을 전부 마운트한다. 20개는 저가 안드로이드 기기에서도 프레임 예산 안에 들어오지만
그 위로는 첫 렌더 지연이 눈에 보인다. 반대로 20개 이하를 가상화하면 얻는 것 없이 코드만 복잡해진다.

### 관리형 워크플로를 벗어나는 비용

기본은 관리형 안에서 해결한다. `expo-*` 공식 모듈 → Expo config plugin → JS 레벨 우회 → 그래도 안 되면 네이티브.

네이티브로 나가면 되돌아오기 어렵다:

- `expo prebuild` 이후 `ios/`·`android/` 가 저장소에 들어오고 **SDK 업그레이드마다 수동 병합**이 생긴다
- Expo Go 로 못 돌린다. QA 루프가 초 단위 리로드에서 **빌드 대기(수 분~수십 분)** 로 바뀐다
- EAS Build 또는 로컬 네이티브 툴체인이 CI 필수 조건이 된다
- 기여자가 Xcode / Android Studio 를 갖춰야 한다

`bootstrap` 단계에서 할 일은 **이미 넘어간 상태인지 감지해서 보고**하는 것뿐이다
(`ios/`·`android/` 커밋 여부, `expo-dev-client` 유무). 넘어갈지 말지는 구현 단계의 판단이다.

### pnpm 과 Metro

Metro 는 심볼릭 링크 기반 `node_modules` 를 완전히 다루지 못해, pnpm 기본 배치에서 모듈 해석이 깨지는 경우가 있다.
`.npmrc` 의 `node-linker=hoisted` 가 흔한 우회다.

`bootstrap` 은 `packageManager` 를 감지값과 무관하게 `pnpm` 으로 **고정**하되, 설치 배치를 바꾸지 않는다.
설치가 깨지면 설정을 임의로 고치지 말고 완료 보고에 남기고 `curvez-researcher` 로 넘긴다.

### 테스트가 0개 실행되고도 초록불이 된다

`jest-expo` preset 미설정 · `transformIgnorePatterns` 가 `node_modules` 전체를 막음 · `testEnvironment` 가 `node`.
RN 은 transform 계층이 두꺼워 **수집 자체가 실패한 파일이 실패가 아니라 제외로 처리**된다.
실행 개수뿐 아니라 수집한 스위트 파일 수도 함께 본다. 상세는
`skills/quality-gate/references/react-native.md` 의 `## 0개 실행 함정 — 모바일판` 이 정본이다.

---

## 아키텍처 프리셋과의 조합

각 프리셋의 레이어 정의와 금지 import 는 그 프리셋 파일이 정본이다. 아래는 `react-native` 에서
어느 절을 읽어야 하는지의 색인이다. **상세는 각 파일의 `## 스택 매핑` 을 읽어라.**

| 프리셋       | RN 에서의 요점                                                                                                                                                                        | 정본                                            |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| `ddd` (기본) | 가장 안쪽 `domain` 이 `react-native`·`expo-*`·`@react-navigation/*` 를 참조하지 않으면 웹과 그대로 공유된다. 플랫폼 API 는 도메인이 포트만 선언하고 어댑터를 `paths.mobile` 아래 둔다 | `presets/architecture/ddd.md` 의 `## 스택 매핑` |

### `architecture` 초기값

`profile.json` 의 `architecture` 는 `"ddd"` 로 쓴다. 확정은 `architecture-setup` 이 한다.
`bootstrap` 이 프리셋 선택 조건(라우트 수·엔티티 수)을 판정하려 들지 마라 — 그 수치는 감지로 나오지 않는다.

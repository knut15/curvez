# DDD 실행 절차

`ddd` 프리셋으로 아키텍처를 확정한 뒤, **파일을 새로 만들거나 옮기거나 import 를 추가하기 전에** 읽는다.

`ddd.md` 는 경계가 무엇인지 정의한다. 이 문서는 그 경계 안에서 실제로 코드를 어떻게 놓는지 다룬다.

---

## 0. 파일을 만들기 전 확정할 것

여기서 틀리면 나중에 전부 옮겨야 한다.

1. **어느 컨텍스트인가** — 컨텍스트를 나눈 경우에만. `.curvez/architecture.md` 의 `## 레이어 정의` 참조
2. **어느 레이어인가** — 아래 결정 트리
3. **용어가 이미 있는가** — 없으면 먼저 정한다. 새 이름을 즉흥으로 만들지 않는다

---

## 1. 배치 결정 트리

```
이 코드가 도메인 개념(Order, Payment, Membership...)을 아는가?
├─ 아니오
│   └─ 프레임워크·라이브러리·부수효과에 의존하는가?
│       ├─ 예   → shared/    (공용 UI, API 클라이언트 래퍼)
│       └─ 아니오 → utils/    (순수 함수. 아무것도 의존하지 않는다)
└─ 예 ↓
    ├─ React·RN 컴포넌트를 만든다        → presentation/
    ├─ fetch·DB·외부 SDK 를 쓴다          → infrastructure/
    ├─ 다른 컨텍스트 모델을 번역한다        → infrastructure/acl/
    ├─ 바깥에 필요한 것을 인터페이스로 선언  → application/ports/
    ├─ 여러 도메인 객체를 조립해 시나리오    → application/use-cases/
    └─ 순수한 규칙·계산·불변식              → domain/
```

**`shared/` 에 넣기 전 확인:** 두 곳 이상이 실제로 쓰는가? 하나만 쓰면 그쪽 안에 둔다.
두 번째 사용처가 생겼을 때 옮긴다.

**"어디 둘지 모르겠으면 shared" 는 금지다.**
**이유:** 그 규칙이 한 번 통하면 `shared/` 가 분류 실패한 코드의 하치장이 되고, 결국 모든 것이
`shared/` 를 의존하게 되어 레이어가 이름만 남는다.

---

## 2. 새 기능을 만드는 순서

**안쪽부터 바깥으로 만든다.**

```
1. domain/         규칙과 타입을 먼저 정의하고 테스트를 붙인다
2. application/    포트를 선언하고 유스케이스를 조립한다
3. infrastructure/ 포트를 구현한다 (초기에는 메모리 구현으로 충분하다)
4. presentation/   훅과 컴포넌트를 만든다
5. app/            라우트에 화면을 배치한다
```

**화면부터 만들면 규칙이 컴포넌트에 눌어붙는다.** 그 상태에서 규칙을 도메인으로 빼내려면
화면을 다시 써야 하고, 대개 다시 쓰지 않는다.

각 단계에서 **바로 앞 단계만 import 한다.** 4단계에서 3단계를 직접 import 하고 있으면
포트 설계가 틀린 것이다 — `application/ports` 에 없는 무언가를 화면이 직접 필요로 한다는 뜻이다.

### 유스케이스 작성 순서

```ts
export async function approveRequest(input: Input, deps: Deps) {
  // 1. 권한 검사 — 항상 첫 줄
  const actor = await deps.auth.requireRole(input.scopeId, ["MANAGER"]);

  // 2. 입력 검증 (값 객체 생성으로 대체되는 경우가 많다)
  // 3. 데이터 로드 — 포트를 통해서만
  // 4. 도메인 규칙 실행
  // 5. 저장 + 이벤트 발행
}
```

권한 검사 뒤에는 **검사 결과에서 나온 값**을 쓴다. `input` 의 같은 필드를 다시 쓰지 않는다.
**이유:** 검사한 값과 사용한 값이 다르면 검사가 무의미해진다. 호출자가 보낸 `scopeId` 로
권한을 확인하고 다시 그 `scopeId` 로 조회하면, 그 사이에 아무 보증도 없다.

---

## 3. import 규칙

```ts
// ✓ 다른 컨텍스트는 공개 배럴로만
import { calculatePayroll } from "@/domains/payroll";

// ✗ 내부 경로를 파고들지 않는다
import { x } from "@/domains/payroll/application/use-cases/calculate-payroll";

// ✗ 상위로 올라가는 상대 경로 (한 단계여도 금지)
import { y } from "../value-objects/money";

// ✓ 같은 레이어 안에서도 별칭으로 적는다
import { Money } from "@/domain/value-objects/money";

// ✓ 같은 폴더는 './' 허용
import { payFor } from "./daily-wage";
```

- 경로 별칭 `@/*` 를 쓴다. `../` 는 lint 가 막는다
- 배럴(`index.ts`)은 **컨텍스트 공개 API 에만** 만든다. 레이어마다 만들지 않는다 — 순환 import 의 원인이다

강제 방법은 [eslint-layer-rules.md](eslint-layer-rules.md) 에 있다.

---

## 4. 명명

| 대상 | 규칙 | 예 |
|---|---|---|
| 파일 | kebab-case | `work-record.ts` |
| 유스케이스 파일 | **동사로 시작** | `approve-request.ts` |
| 포트 인터페이스 | 역할 이름 | `OrderRepository`, `AuthPort` |
| 엔티티·값 객체 | PascalCase 명사 | `Order`, `Email` |
| 훅 | `use` + 동작 | `useMonthlyOrders` |

유스케이스 파일이 동사로 시작해야 하는 이유: 명사로 지으면(`order-service.ts`) 무엇이든 들어가는
서랍이 되고, 곧 파일 하나에 시나리오 열 개가 쌓인다. 동사는 파일 하나가 시나리오 하나임을 강제한다.

---

## 5. 레이어별 금지 — 무엇이 새어 나오는가

### domain

```ts
import { useState } from "react";        // ✗ 프레임워크
import { NextRequest } from "next/server"; // ✗
const now = new Date();                   // ✗ 시각은 인자로 주입받는다
localStorage.getItem(...);                // ✗
fetch(...);                               // ✗
```

허용되는 바깥 의존은 `utils/` 와 공용 에러 타입뿐이다.

`new Date()` 를 막는 이유: 시간에 의존하는 규칙을 테스트할 수 없게 된다.
"월말이면 다르게 계산한다" 같은 규칙은 시각을 주입받아야 검증 가능하다.

### application

- 구현체 import 금지 — 포트로 받는다
- 프레임워크 API 금지
- 권한 검사 생략 금지

### infrastructure

- 비즈니스 규칙 계산 금지. 여기는 번역과 입출력만 한다
- 다른 컨텍스트의 엔티티를 그대로 반환하지 않는다 — DTO 를 자기 도메인 객체로 번역한다

### presentation

```tsx
// ✗ 도메인 규칙이 컴포넌트로 새어 나왔다
if (workedMinutes > 480) { overtimePay = base * 1.5; }

// ✓ 도메인이 계산한 결과를 표시만 한다
<span>{breakdown.overtimePay.toLocaleString()}원</span>
```

- `infrastructure/` 직접 import 금지 — 유스케이스를 통한다
- 서버에서 받은 데이터를 클라이언트 전역 상태에 복사하지 않는다

### app (라우트)

페이지 파일은 얇게 유지한다. 데이터를 조립하거나 계산하지 않고,
프레젠테이션 컴포넌트를 배치하고 파라미터만 넘긴다.

---

## 6. 커밋 전 체크리스트

- [ ] `domain/` 에 프레임워크·`new Date()`·`fetch`·다른 컨텍스트 import 가 없다
- [ ] `presentation/` 이 `infrastructure/` 를 직접 import 하지 않는다
- [ ] 모든 유스케이스가 첫 줄에서 권한을 검사한다
- [ ] 다른 컨텍스트를 배럴이 아닌 내부 경로로 import 하지 않았다
- [ ] `../` 로 시작하는 import 가 없다
- [ ] 새 용어를 아키텍처 문서의 용어 목록에 추가했다
- [ ] `pnpm lint` 통과 — **계층 규칙이 실제로 로드됐는지 확인한다.**
      위반을 일부러 만들어 에러가 나는지 본 적이 없다면, 통과는 근거가 아니다
- [ ] `pnpm typecheck` 통과
- [ ] 도메인 규칙을 새로 만들거나 고쳤으면 테스트를 함께 썼다

---

## 7. 위반을 발견했을 때

기존 코드가 규칙을 어기고 있으면 **작업 범위 안이면 고치고 범위 밖이면 보고한다.**
눈에 띄었다는 이유로 무관한 파일을 리팩터링하지 않는다.

규칙 자체가 현실과 안 맞는다고 판단되면 코드로 우회하지 말고
`.curvez/architecture.md` 의 `## 결정 로그` 에 근거와 함께 변경을 제안한다.
문서가 기준이고 코드가 문서를 따른다 — 반대가 되면 규칙이 무엇이었는지 아무도 모르게 된다.

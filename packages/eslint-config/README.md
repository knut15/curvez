# @curvez/eslint-config

워크스페이스가 공유하는 ESLint flat config.

```js
// eslint.config.mjs
import { base } from "@curvez/eslint-config/base";

export default [{ ignores: ["dist/"] }, ...base];
```

`base` 는 노드에서 도는 `.mjs` 만 검사한다. 프레임워크 규칙(Next, React)은 담지 않는다 —
그 플러그인들은 소비자의 eslint 메이저 버전에 묶여서, 여기 넣으면 워크스페이스가 전부 같은
eslint 버전을 써야 한다. 실제로 루트의 eslint 10 이 앱의 eslint-plugin-react(9용)를 로드해
크래시한 적이 있다.

TypeScript 규칙은 아직 없다. 첫 TS 패키지가 생길 때 `typescript-eslint` 를 여기에 붙인다.

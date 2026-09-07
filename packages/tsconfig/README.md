# @curvez/tsconfig

워크스페이스가 공유하는 TypeScript 설정. 컴파일 산출물이 없어 빌드 단계도 없다.

| 파일          | 언제                                                      |
| ------------- | --------------------------------------------------------- |
| `base.json`   | DOM 도, JSX 도 필요 없는 것 — 노드 유틸·설정 패키지       |
| `nextjs.json` | Next.js 앱. `base.json` 에 DOM·JSX·next 플러그인을 얹는다 |

```jsonc
// apps/<앱>/tsconfig.json
{
  "extends": "@curvez/tsconfig/nextjs.json",
  "compilerOptions": { "paths": { "@/*": ["./src/*"] } },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
}
```

`paths` 와 `include` 는 여기에 두지 않는다. 경로가 소비자 기준 상대 경로라 공유하면 뜻이 달라진다.

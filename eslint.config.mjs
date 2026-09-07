import { base } from "@curvez/eslint-config/base";

export default [
  // apps/packages 는 각자의 eslint 설정으로 자기를 린트한다. 루트가 그 안까지 훑으면
  // 루트의 eslint 버전이 앱의 플러그인을 로드해 API 불일치로 죽는다(실제로 eslint 10 이
  // 앱의 eslint-plugin-react 9 를 물어 크래시했다). 전체 검사는 루트 `lint` 스크립트가
  // `pnpm -r` 로 각 워크스페이스에 위임한다.
  {
    ignores: [
      ".build/",
      ".omc/",
      "**/.omc/",
      "**/.next/",
      "apps/**",
      "packages/**",
    ],
  },
  ...base,
];

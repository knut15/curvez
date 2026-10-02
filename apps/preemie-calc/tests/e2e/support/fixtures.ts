// 모든 E2E 테스트에 자동으로 붙는 하이드레이션·pageerror 감시. curvez-qa 소유.
//
// 스펙 파일은 `@playwright/test` 대신 이 모듈에서 `test`·`expect` 를 가져온다. auto fixture
// 가 각 테스트 동안 console(error/warning)과 pageerror 를 모아 두었다가, 테스트가 끝나는
// 시점에 하이드레이션 관련 문구가 하나라도 있으면 그 테스트를 실패시킨다.
//
// 특히 시계를 빌드일(오늘)과 다른 날짜로 고정하는 화면(dashboard·share·checkups 등)은
// 서버 렌더 시점과 클라이언트 하이드레이션 시점의 날짜 계산이 어긋나면 리액트가 하이드레이션
// 경고를 던지는데, 개별 스펙이 이를 따로 확인하지 않아도 이 fixture 가 공통으로 잡는다.
import { expect, test as base, type ConsoleMessage } from "@playwright/test";

// 개발 모드 문구("Hydration failed", "Text content does not match", 대소문자 무관 "hydrat")와
// 프로덕션 빌드의 리액트 minified 에러(418/419/421/425 = 하이드레이션 계열, react.dev/errors/<code>
// 링크로 나온다) 양쪽을 모두 잡는다. webServer 는 `next build && next start`(프로덕션)로 뜬다.
const HYDRATION_PATTERN = /hydrat|did not match|content does not match|react\.dev\/errors\/(418|419|421|425)\b/i;

export const test = base.extend<{ hydrationGuard: void }>({
  hydrationGuard: [
    async ({ page }, use) => {
      const violations: string[] = [];

      const onConsole = (msg: ConsoleMessage) => {
        const type = msg.type();
        if (type !== "error" && type !== "warning") return;
        const text = msg.text();
        if (HYDRATION_PATTERN.test(text)) {
          violations.push(`console.${type}: ${text}`);
        }
      };
      const onPageError = (err: Error) => {
        // pageerror 는 하이드레이션이 아니어도 기존 스펙들이 이미 개별로 [] 를 기대하므로
        // 여기서도 종류를 가리지 않고 전부 위반으로 모은다(더 넓은 신호, 완화 아님).
        violations.push(`pageerror: ${err.message}`);
      };

      page.on("console", onConsole);
      page.on("pageerror", onPageError);

      await use();

      page.off("console", onConsole);
      page.off("pageerror", onPageError);

      expect(violations, `하이드레이션/pageerror 위반:\n${violations.join("\n")}`).toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };

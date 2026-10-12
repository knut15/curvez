// PC-F13-AC1(빌드 결과 481개 guide 페이지)·PC-F13-AC4(사이트맵 481개 /guide/ URL).
// 확인 방법: "빌드 결과 검사"(requirements.md). vitest 로 .next 빌드 산출물을 직접 센다.
//
// 전제: `pnpm --filter preemie-calc build`(= next build)가 이 테스트보다 먼저 실행돼
// apps/preemie-calc/.next 가 만들어져 있어야 한다. tests/e2e 의 playwright webServer 가
// `pnpm exec next build && pnpm exec next start`로 매번 빌드를 먼저 하므로, VERIFY 순서
// (pnpm test:e2e 다음에 워크트리 루트 pnpm test)를 지키면 이 전제가 항상 충족된다.
// .next 가 없으면 "빌드가 안 됐다"는 사실 자체를 실패로 드러낸다(스킵하지 않는다).
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const APP_ROOT = join(__dirname, "..", "..");
const GUIDE_DIR = join(APP_ROOT, ".next", "server", "app", "guide");
const SITEMAP_BODY = join(APP_ROOT, ".next", "server", "app", "sitemap.xml.body");

const EXPECTED_COMBO_COUNT = 13 * 37; // COMBO_WEEKS(24~36) × COMBO_MONTHS(0~36) = 481
// F16(질문 6쪽)·F18(/guide, /guide/age-basis)이 같은 /guide 아래에 생기면서 guide/ 디렉터리에
// "questions"·"age-basis"·"[weeks]"(동적 라우트 자리 표시자) 디렉터리가 섞여 들어왔다. 조합 페이지는
// "24".."36" 처럼 숫자 이름의 weeks 디렉터리 안에만 있으므로 그 디렉터리만 센다(섞지 않는다).
const WEEKS_DIR_NAME = /^\d+$/;
const EXPECTED_SITEMAP_TOTAL = 496; // 정적 9 + 질문형 가이드 6 + 조합 481 (curvez-reviewer TEAM 축 확인치)

function countGuideHtmlFiles(dir: string): number {
  let count = 0;
  for (const weeksEntry of readdirSync(dir)) {
    if (!WEEKS_DIR_NAME.test(weeksEntry)) continue;
    const weeksPath = join(dir, weeksEntry);
    if (!statSync(weeksPath).isDirectory()) continue;
    for (const file of readdirSync(weeksPath)) {
      if (file.endsWith(".html")) count += 1;
    }
  }
  return count;
}

describe("PC-F13-AC1 — 빌드가 끝나면 481개 조합 페이지가 모두 생성된다", () => {
  it(`.next/server/app/guide/<주수>/**/*.html(조합 경로만) 이 ${EXPECTED_COMBO_COUNT}개다`, () => {
    expect(
      statSync(GUIDE_DIR, { throwIfNoEntry: false })?.isDirectory(),
      `${GUIDE_DIR} 가 없다 — 이 테스트보다 먼저 'pnpm --filter preemie-calc build' 를 실행해야 한다`,
    ).toBe(true);
    expect(countGuideHtmlFiles(GUIDE_DIR)).toBe(EXPECTED_COMBO_COUNT);
  });
});

describe("PC-F13-AC4 — 사이트맵에 481개 조합 페이지가 모두 들어 있다", () => {
  it(`sitemap.xml.body 안의 '/guide/<주수>/<개월수>' 조합 URL 이 ${EXPECTED_COMBO_COUNT}개다`, () => {
    expect(
      statSync(SITEMAP_BODY, { throwIfNoEntry: false })?.isFile(),
      `${SITEMAP_BODY} 가 없다 — 이 테스트보다 먼저 'pnpm --filter preemie-calc build' 를 실행해야 한다`,
    ).toBe(true);
    const body = readFileSync(SITEMAP_BODY, "utf-8");
    // 질문형 가이드(/guide/questions/<slug>)·F18(/guide/age-basis)·/guide 자체는 숫자/숫자
    // 형태가 아니므로 이 패턴에 섞이지 않는다.
    const comboUrlCount = (body.match(/\/guide\/\d+\/\d+/g) ?? []).length;
    expect(comboUrlCount).toBe(EXPECTED_COMBO_COUNT);
  });

  it(`sitemap.xml.body 전체 URL 수가 ${EXPECTED_SITEMAP_TOTAL}개다(정적+질문형 가이드 6+조합 481, 중복 0)`, () => {
    const body = readFileSync(SITEMAP_BODY, "utf-8");
    const locCount = (body.match(/<loc>[^<]*<\/loc>/g) ?? []).length;
    expect(locCount).toBe(EXPECTED_SITEMAP_TOTAL);
  });
});

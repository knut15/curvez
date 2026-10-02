// tests/e2e 공용 헬퍼. curvez-qa 소유.
//
// architecture ② (entities/child/api) 의 ProfileStoreV1 모양을 그대로 흉내 내
// localStorage 를 직접 채운다. F1 저장 플로우 자체를 검증하는 테스트(f1-profile.spec.ts)는
// 실제 폼을 채워 저장하지만, 그 외 화면(F2~F6, F7)은 "이미 저장된 프로필이 있을 때" 화면이
// 무엇을 보여주는지가 관심사라 폼 입력을 매번 반복하지 않는다.
import type { Page } from "@playwright/test";

export type SeedProfile = {
  id?: string;
  name?: string | null;
  sex?: "male" | "female";
  birthDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  birthWeightGrams?: number | null;
};

let idCounter = 0;
function nextId(): string {
  idCounter += 1;
  return `test-profile-${idCounter}`;
}

/**
 * 페이지가 처음 문서를 로드하기 전에 localStorage 를 채운다. 반드시 `page.goto` 보다
 * 먼저 호출해야 한다(addInitScript 는 그다음 navigation 부터 적용된다).
 */
export async function seedProfiles(page: Page, profiles: SeedProfile[], selectedId?: string): Promise<void> {
  const full = profiles.map((p) => ({
    id: p.id ?? nextId(),
    name: p.name ?? null,
    sex: p.sex ?? "male",
    birthDate: p.birthDate,
    dueDate: p.dueDate,
    birthWeightGrams: p.birthWeightGrams ?? null,
  }));
  const store = {
    version: 1,
    profiles: full,
    selectedId: selectedId ?? full[full.length - 1]?.id ?? null,
  };
  await page.addInitScript(
    ([key, value]) => {
      window.localStorage.setItem(key, value);
    },
    ["preemie-calc/profiles", JSON.stringify(store)] as const,
  );
}

/**
 * dashboard 헤더의 "더보기"(HeaderMenu 트리거) 버튼을 눌러 "프로필 편집"·"정보 전체 삭제"
 * menuitem 을 노출한다. 5차 디자인 라운드(HeaderMenu 도입, curvez-nextjs.20260930-003549.json
 * decisions)부터 두 액션이 헤더에 바로 보이지 않고 이 메뉴 뒤에 있다.
 */
export async function openHeaderMenu(page: Page): Promise<void> {
  await page.getByRole("button", { name: "더보기" }).click();
}

/** KST(+09:00) 기준 날짜시각으로 시계를 고정한다. `page.goto` 보다 먼저 호출한다. */
export async function fixClockKst(page: Page, isoWithoutOffset: string): Promise<void> {
  await page.clock.setFixedTime(new Date(`${isoWithoutOffset}+09:00`));
}

/** birthDate 로부터 재태일수를 만족하는 dueDate 를 만든다(280 - gestationDays 일 더함). */
export function dueDateForGestationDays(birthDate: string, gestationDays: number): string {
  const d = new Date(`${birthDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + (280 - gestationDays));
  return d.toISOString().slice(0, 10);
}

/** canvas 2D fillText 호출을 가로채 그려진 문자열 목록을 모은다(PC-F7-AC1 카드 이미지 검증). */
export async function installFillTextSpy(page: Page): Promise<void> {
  await page.addInitScript(() => {
    (window as unknown as { __fillTextCalls: string[] }).__fillTextCalls = [];
    const proto = CanvasRenderingContext2D.prototype;
    const original = proto.fillText;
    proto.fillText = function fillTextSpy(this: CanvasRenderingContext2D, text: string, ...rest: number[]) {
      (window as unknown as { __fillTextCalls: string[] }).__fillTextCalls.push(text);
      // @ts-expect-error - 원본 시그니처를 그대로 위임한다.
      return original.apply(this, [text, ...rest]);
    };
  });
}

export async function getFillTextCalls(page: Page): Promise<string[]> {
  return page.evaluate(() => (window as unknown as { __fillTextCalls?: string[] }).__fillTextCalls ?? []);
}

/**
 * canvas 2D fillText 호출을 가로채 그리는 시점의 실제 폭(measureText, 그 순간의 ctx.font 기준)을
 * 모은다(DSG-01: 카드 문구가 캔버스 사용 가능 폭을 넘는지 확인).
 */
export async function installFillTextWidthSpy(page: Page): Promise<void> {
  await page.addInitScript(() => {
    (window as unknown as { __fillTextWidths: Array<{ text: string; width: number }> }).__fillTextWidths = [];
    const proto = CanvasRenderingContext2D.prototype;
    const original = proto.fillText;
    proto.fillText = function fillTextWidthSpy(this: CanvasRenderingContext2D, text: string, ...rest: number[]) {
      const width = this.measureText(text).width;
      (window as unknown as { __fillTextWidths: Array<{ text: string; width: number }> }).__fillTextWidths.push({
        text,
        width,
      });
      // @ts-expect-error - 원본 시그니처를 그대로 위임한다.
      return original.apply(this, [text, ...rest]);
    };
  });
}

export async function getFillTextWidths(page: Page): Promise<Array<{ text: string; width: number }>> {
  return page.evaluate(
    () => (window as unknown as { __fillTextWidths?: Array<{ text: string; width: number }> }).__fillTextWidths ?? [],
  );
}

/** localStorage 의 getItem·setItem 이 예외를 던지는 환경(저장소 차단 등)을 흉내 낸다(ERR-02). */
export async function simulateLocalStorageUnavailable(page: Page): Promise<void> {
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: {
        getItem(): never {
          throw new Error("[테스트] localStorage 를 사용할 수 없다");
        },
        setItem(): never {
          throw new Error("[테스트] localStorage 를 사용할 수 없다");
        },
        removeItem(): void {},
        key(): null {
          return null;
        },
        length: 0,
        clear(): void {},
      },
    });
  });
}

/** navigator.share 를 스텁으로 바꾸고 호출 인자를 window.__shareCalls 에 쌓는다. */
export async function stubNavigatorShare(page: Page): Promise<void> {
  await page.addInitScript(() => {
    (window as unknown as { __shareCalls: unknown[] }).__shareCalls = [];
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: async (data: ShareData) => {
        const filesAsText: { name: string; type: string }[] = [];
        if (data.files) {
          for (const f of data.files) filesAsText.push({ name: f.name, type: f.type });
        }
        (window as unknown as { __shareCalls: unknown[] }).__shareCalls.push({
          url: data.url,
          text: data.text,
          files: filesAsText,
        });
      },
    });
    Object.defineProperty(navigator, "canShare", {
      configurable: true,
      value: () => true,
    });
  });
}

export async function getShareCalls(page: Page): Promise<Array<{ url?: string; text?: string }>> {
  return page.evaluate(
    () => (window as unknown as { __shareCalls: Array<{ url?: string; text?: string }> }).__shareCalls ?? [],
  );
}

/** navigator.share 자체가 없는 환경(PC-F7-EX1)을 흉내 낸다. */
export async function removeNavigatorShare(page: Page): Promise<void> {
  await page.addInitScript(() => {
    // @ts-expect-error - 테스트 전용으로 지운다.
    delete navigator.share;
  });
}

/** 클립보드 쓰기를 가로채 window.__clipboardText 에 마지막 값을 남긴다(권한 프롬프트 없이 확인). */
export async function stubClipboardWrite(page: Page): Promise<void> {
  await page.addInitScript(() => {
    (window as unknown as { __clipboardText: string }).__clipboardText = "";
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (text: string) => {
          (window as unknown as { __clipboardText: string }).__clipboardText = text;
        },
      },
    });
  });
}

export async function getClipboardText(page: Page): Promise<string> {
  return page.evaluate(() => (window as unknown as { __clipboardText: string }).__clipboardText ?? "");
}

/**
 * 실제 Tab 키 입력 시퀀스 대신 DOM 순서 + tabindex 로 "논리적 포커스 순서"를 구한다(8차 라운드,
 * growth·target-height·formula focus-order 검사). `<input type="date">` 는 Chromium 에서
 * 월/일/연 세 내부 세그먼트를 오가느라 외부에서 본 Tab 키 입력 횟수가 매번 달라진다(브라우저
 * 자체 동작이라 우리가 고칠 수 없다) — 그래서 실제 키 입력을 흉내 내지 않고, 스펙이 말하는
 * "포커스가 도달하는 순서"(DOM 순서, disabled·tabindex=-1 제외)를 직접 구한다.
 */
export async function focusableTextsInOrder(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    function isFocusable(el: Element): boolean {
      if (el.hasAttribute("disabled") || el.getAttribute("aria-disabled") === "true") return false;
      const t = el.getAttribute("tabindex");
      if (t !== null && parseInt(t, 10) < 0) return false;
      return true;
    }
    function accessibleName(el: HTMLElement): string {
      const ariaLabel = el.getAttribute("aria-label");
      if (ariaLabel) return ariaLabel.trim();
      if (el.id) {
        const label = document.querySelector(`label[for="${el.id}"]`);
        if (label) return (label.textContent ?? "").trim();
      }
      return (el.textContent ?? "").trim();
    }
    const candidates = Array.from(
      document.querySelectorAll("a[href], button, input, select, textarea, [tabindex]"),
    ) as HTMLElement[];
    return candidates.filter(isFocusable).map(accessibleName);
  });
}

function parseRgb(input: string): [number, number, number, number] {
  const m = input.match(/rgba?\(([^)]+)\)/);
  if (!m) return [255, 255, 255, 1];
  const parts = m[1].split(",").map((s) => parseFloat(s.trim()));
  return [parts[0] ?? 255, parts[1] ?? 255, parts[2] ?? 255, parts[3] ?? 1];
}

/** WCAG 상대 명도 대비 공식. */
export function contrastRatio(fg: string, bg: string): number {
  function luminance([r, g, b]: [number, number, number, number]): number {
    const chan = [r, g, b].map((v) => {
      const c = v / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return chan[0] * 0.2126 + chan[1] * 0.7152 + chan[2] * 0.0722;
  }
  const l1 = luminance(parseRgb(fg)) + 0.05;
  const l2 = luminance(parseRgb(bg)) + 0.05;
  return l1 > l2 ? l1 / l2 : l2 / l1;
}

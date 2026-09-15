import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

/**
 * 상단 메뉴 목록을 `content/` 디렉터리에서 만든다.
 *
 * **디렉터리가 곧 메뉴다.** 메뉴를 코드 배열로 들고 있으면 CMS 에서 메뉴를 하나
 * 추가할 때마다 이 저장소를 고치고 배포해야 한다. 디렉터리를 세면 글을 넣는 것과
 * 같은 동작으로 메뉴가 생긴다.
 *
 * 표시 이름과 순서는 `content/<메뉴>/_meta.json` 이 정한다. 그 파일이 없으면
 * 디렉터리 이름을 그대로 쓴다 — 없다고 메뉴가 사라지면 안 된다.
 *
 * 빌드 시점에만 돈다. `listSlugs` 와 같은 자리의 코드다.
 */

export interface MenuEntry {
  /** URL 조각이자 디렉터리 이름 */
  readonly slug: string;
  /** 화면에 보이는 이름 */
  readonly label: string;
  /** 작은 수가 앞이다. 없으면 맨 뒤 */
  readonly order: number;
  /** 감춘 메뉴. `listMenus` 가 이미 걸러내므로 결과에는 `false` 만 온다 */
  readonly hidden: boolean;
}

/** 경로 조각으로 쓸 수 있는 모양. `.` 이나 숨김 디렉터리를 거른다 */
const SAFE_SEGMENT = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const DEFAULT_ORDER = 999;

/** `_meta.json` 의 값. 바깥 파일이므로 모양을 검사해 좁힌다 */
function readMeta(raw: unknown): {
  label?: string;
  order?: number;
  hidden?: boolean;
} {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    return {};
  }
  const record = raw as Record<string, unknown>;
  return {
    label: typeof record.label === "string" ? record.label : undefined,
    order: typeof record.order === "number" ? record.order : undefined,
    // `true` 일 때만 숨긴다. 값이 이상하면 보이는 쪽으로 떨어뜨린다 —
    // 깨진 파일 하나 때문에 메뉴가 말없이 사라지는 편이 더 나쁘다
    hidden: record.hidden === true,
  };
}

/** `archive` → `Archive`. `_meta.json` 이 없을 때의 기본 표시 이름 */
function toDefaultLabel(slug: string): string {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export async function listMenus(): Promise<MenuEntry[]> {
  const root = path.join(process.cwd(), "content");
  const entries = await readdir(root, { withFileTypes: true }).catch(() => []);

  const menus = await Promise.all(
    entries
      .filter((entry) => entry.isDirectory() && SAFE_SEGMENT.test(entry.name))
      .map(async (entry): Promise<MenuEntry> => {
        const source = await readFile(
          path.join(root, entry.name, "_meta.json"),
          "utf8",
        ).catch(() => null);

        let meta: { label?: string; order?: number; hidden?: boolean } = {};
        if (source !== null) {
          try {
            meta = readMeta(JSON.parse(source));
          } catch {
            // 깨진 파일 하나가 메뉴 전체를 없애지 않는다. 기본값으로 떨어뜨린다
            meta = {};
          }
        }

        return {
          slug: entry.name,
          label: meta.label ?? toDefaultLabel(entry.name),
          order: meta.order ?? DEFAULT_ORDER,
          hidden: meta.hidden === true,
        };
      }),
  );

  return menus
    /*
     * 감춘 메뉴는 헤더에 나오지 않는다. 글은 그대로 있고 주소로는 여전히 닿는다 —
     * 지운 것이 아니라 안내를 거둔 것이다.
     *
     * `_meta.json` 의 `locked` 는 여기서 보지 않는다. 그것은 관리 화면에서
     * 고칠 수 있는가의 문제이고, 사이트가 무엇을 보여줄지와는 무관하다.
     */
    .filter((menu) => !menu.hidden)
    .sort((a, b) =>
      a.order !== b.order ? a.order - b.order : a.slug.localeCompare(b.slug),
    );
}

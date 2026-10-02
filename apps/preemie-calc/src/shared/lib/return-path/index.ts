// 계산기 링크(F16 EX1, F18 AC2)가 입력 화면을 거친 뒤 돌아갈 곳을 쿼리로 받을 때 쓰는
// 순수 판정 함수. 도메인을 모르는 라우팅 안전 검사라 shared 에 둔다(열린 리다이렉트 방지).
const ALLOWED_RETURN_PREFIX = "/dashboard";

// URL 해석 전용 고정 origin. 실제 배포 도메인과 무관하다 — new URL 이 origin 을 요구해서
// 넣을 뿐이고, 아래에서는 "해석 뒤 origin 이 그대로인지"만 본다.
const INTERNAL_ORIGIN = "http://internal.invalid";

/** 제어 문자(탭·개행·캐리지리턴 등)가 섞여 있으면 참이다. 이런 문자는 브라우저·서버마다
 * 다르게 지우거나 무시할 수 있어, 여기서 하는 검사와 실제 내비게이션이 어긋날 수 있다. */
function hasControlCharacter(raw: string): boolean {
  for (let i = 0; i < raw.length; i += 1) {
    const code = raw.charCodeAt(i);
    if (code <= 0x1f || code === 0x7f) return true;
  }
  return false;
}

/**
 * 입력 화면이 돌아갈 내부 경로인지 검사하고, 참이면 검사 후 정규화된 경로(pathname+search)를
 * 돌려준다. 허용 목록(`/dashboard`와 그 하위)을 벗어나거나 안전하지 않으면 null 이다.
 *
 * 문자열 접두 검사("/dashboard/"로 시작하는가)만으로는 "/dashboard/..//evil.com" 같은 점
 * 경로를 막지 못한다 — 문자열은 그 접두사로 시작하지만, 브라우저가 실제로 내비게이션할 때
 * 해석하는 경로는 ".."가 "dashboard"를 지운 뒤 남는 "//evil.com"이다("//"로 시작하는 경로는
 * 프로토콜 생략 URL로 다시 해석될 수 있다). 그래서 원문을 그대로 돌려주지 않고, new URL 로
 * 해석한 뒤의 pathname 을 검사하고 그 값을 돌려준다.
 *
 * - 제어 문자(탭·개행 등)가 섞여 있으면 null 이다.
 * - 해석 뒤 origin 이 바뀌면(절대 URL, "//evil.com" 같은 프로토콜 생략 URL) null 이다.
 * - 해석된 pathname 이 "//"로 시작하면 null 이다(점 경로로 "dashboard"를 지운 뒤 남는 값도
 *   여기서 잡힌다).
 * - 해석된 pathname 이 `/dashboard` 자신이거나 그 하위 경로(`/dashboard/…`)가 아니면 null 이다.
 * - 반환값은 해석된 pathname + search 다(hash 는 버린다. 서버로 가지 않고 라우팅에도 쓰이지
 *   않는 값이라 남길 이유가 없다).
 */
export function normalizeReturnPath(raw: string): string | null {
  if (!raw.startsWith("/")) return null;
  if (hasControlCharacter(raw)) return null;

  let url: URL;
  try {
    url = new URL(raw, INTERNAL_ORIGIN);
  } catch {
    return null;
  }
  if (url.origin !== INTERNAL_ORIGIN) return null;
  if (url.pathname.startsWith("//")) return null;
  if (url.pathname !== ALLOWED_RETURN_PREFIX && !url.pathname.startsWith(`${ALLOWED_RETURN_PREFIX}/`)) {
    return null;
  }
  return `${url.pathname}${url.search}`;
}

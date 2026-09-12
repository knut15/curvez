import { createElement } from "react";

/**
 * MDX 본문의 서식. cases 와 labs 가 같은 것을 쓴다.
 *
 * 두 화면이 각자 이 문자열을 들고 있으면 한쪽만 고쳐질 때 본문 서식이 조용히 달라진다.
 * 값의 근거는 `packages/scopulus-ui/design/tokens.md` 의 타이포·형태 절이다.
 */
export const PROSE =
  "leading-relaxed [&_a]:underline [&_a]:underline-offset-4 [&_a]:transition-colors [&_a]:duration-150 [&_a]:ease-out [&_a:hover]:text-ring [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_code]:rounded-sm [&_code]:bg-muted [&_code]:px-1 [&_h2]:mt-12 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-[-0.015em] [&_h3]:mt-8 [&_h3]:text-lg [&_h3]:font-medium [&_li]:my-1 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-4 [&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-muted [&_pre]:p-4 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-5";

/**
 * MDX 본문을 담는 `<article>`. 폭·위 여백·서식을 한 자리에 모은다.
 *
 * 스펙은 `packages/scopulus-ui/design/components/Prose.md` 가 정본이다.
 *
 * **JSX 가 아니라 `createElement` 로 쓴 이유:** 같은 디렉터리에 `prose.ts` 와 `prose.tsx` 가
 * 함께 있으면 `@/shared/ui/prose` 가 어느 파일인지 해석되지 않는다. 문자열 `PROSE` 는 두 화면이
 * 아직 쓰고 있어 지울 수 없으므로(`views/case-detail.tsx:45`, `views/lab-detail.tsx:41`),
 * 한 파일에 둘 다 둔다. 두 화면을 이 컴포넌트로 옮긴 뒤 문자열을 지우면 그때 `.tsx` 로 바꾼다.
 *
 * `className`·`size`·`variant` 를 받지 않는다. 본문 서식이 화면마다 달라야 할 이유가 없다 —
 * 케이스와 기록이 같은 글이다.
 *
 * **가운데 정렬하지 않는다.** `mx-auto` 를 주면 68ch 상자가 바깥 칸 안에서 가운데로 가고,
 * 왼쪽에 남은 제목과 본문 첫 줄이 어긋난다. 폭이 넓을수록 그 차이가 커진다 —
 * 840px 칸에서 96px 이었다. 읽기 폭은 `max-w-[68ch]` 가 이미 잡는다.
 */
export function Prose({ children }: { children: React.ReactNode }) {
  return createElement(
    "article",
    { className: `mt-10 max-w-[68ch] ${PROSE}` },
    children,
  );
}

/**
 * MDX 본문의 서식. cases 와 labs 가 같은 것을 쓴다.
 *
 * 두 화면이 각자 이 문자열을 들고 있으면 한쪽만 고쳐질 때 본문 서식이 조용히 갈린다.
 * 값의 근거는 `.curvez/design/tokens.md` 의 타이포·형태 절이다.
 */
export const PROSE =
  "leading-relaxed [&_a]:underline [&_a]:underline-offset-4 [&_a]:transition-colors [&_a]:duration-150 [&_a]:ease-out [&_a:hover]:text-brand-accent [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_code]:rounded-sm [&_code]:bg-muted [&_code]:px-1 [&_h2]:mt-12 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-[-0.015em] [&_h3]:mt-8 [&_h3]:text-lg [&_h3]:font-medium [&_li]:my-1 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-4 [&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-muted [&_pre]:p-4 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-5";

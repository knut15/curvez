// 공유 링크 문자열 조립. 값은 URL fragment 에만 둔다(architecture ⑤, PC-F7-AC3).
import { encodeShareFragment, type SharePayload } from "@/entities/child";
import { siteOrigin } from "@/shared/config/site";

export function buildShareUrl(payload: SharePayload): string {
  return `${siteOrigin.value}/share#${encodeShareFragment(payload)}`;
}

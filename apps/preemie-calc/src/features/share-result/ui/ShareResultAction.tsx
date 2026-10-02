"use client";

// F7 결과 공유. dashboard 에서 오늘 계산된 나이 값으로 링크·카드를 만든다.
// 카카오톡 공유 버튼을 붙일 자리 — 카카오 JS SDK 는 앱 키가 없어 쓰지 않는다(오케스트레이터 결정,
// 핸드오프 blocked_on 참고). 앱 키가 정해지면 이 컴포넌트 안에 카카오 공유 버튼을 더한다.
import { useSyncExternalStore } from "react";

import type { CalendarDate } from "@/shared/lib/calendar-date";
import { siteName } from "@/shared/config/site";
import type { SharePayload } from "@/entities/child";

import { createShareCardBlob, shareCardAltText } from "../lib/share-card-canvas";
import { formatTodayLabel } from "../lib/format-today-label";
import { buildShareText } from "../lib/share-text";
import { buildShareUrl } from "../lib/share-url";
import { ShareActionButton } from "./ShareActionButton";

// navigator.share 지원 여부(외부 값)는 useSyncExternalStore 로 읽는다. 서버·최초 하이드레이션
// 페인트는 false(getServerSnapshot), 커밋 직후 실제 지원 여부로 다시 읽는다(boolean 은 원시값이라
// 매번 새로 계산해도 무한 렌더 위험이 없다). 시간에 따른 갱신은 하지 않는다(원래 동작 그대로).
function subscribeShareSupport(): () => void {
  return () => {};
}

function getShareSupportSnapshot(): boolean {
  return typeof navigator.share === "function";
}

function getShareSupportServerSnapshot(): boolean {
  return false;
}

export type ShareResultActionProps = {
  birthDate: CalendarDate;
  dueDate: CalendarDate;
  today: CalendarDate;
  chronological: { value: string };
  corrected: { kind: "hidden" | "before-due" | "after-due"; value: string; subValue?: string } | null;
};

export function ShareResultAction({
  birthDate,
  dueDate,
  today,
  chronological,
  corrected,
}: ShareResultActionProps) {
  const shareSupported = useSyncExternalStore(
    subscribeShareSupport,
    getShareSupportSnapshot,
    getShareSupportServerSnapshot,
  );

  const payload: SharePayload = { birthDate, dueDate };
  const url = buildShareUrl(payload);
  const cardParams = {
    chronological,
    corrected,
    todayLabel: formatTodayLabel(today),
    siteName: siteName.value,
  };

  async function handleShare(): Promise<void> {
    const blob = await createShareCardBlob(cardParams);
    const shareData: ShareData = { url, text: shareCardAltText(cardParams) };

    if (blob) {
      const file = new File([blob], "share-card.png", { type: "image/png" });
      if (typeof navigator.canShare === "function" && navigator.canShare({ files: [file] })) {
        shareData.files = [file];
      }
    }

    await navigator.share(shareData);
  }

  async function handleCopyLink(): Promise<void> {
    await navigator.clipboard.writeText(url);
  }

  async function handleCopyPhrase(): Promise<string> {
    const text = buildShareText({ today, chronological, corrected, shareUrl: url });
    await navigator.clipboard.writeText(text);
    return text;
  }

  return (
    <ShareActionButton
      shareSupported={shareSupported}
      onShare={handleShare}
      onCopyPhrase={handleCopyPhrase}
      onCopyLink={handleCopyLink}
    />
  );
}

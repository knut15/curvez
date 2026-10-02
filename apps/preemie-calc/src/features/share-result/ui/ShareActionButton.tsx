"use client";

// 스펙: .curvez/design/preemie-calc/components/ShareActionButton.md
// 링크 복사·결과 문구 복사 버튼은 항상 보인다(PC-F7-EX1, PC-F7-AC5~AC7).
// navigator.share 를 쓸 수 있으면 그 위에 공유 버튼을 추가로 보인다.
import { useState } from "react";

import { Button, ICONS } from "@/shared/ui";

export type ShareActionButtonProps = {
  shareSupported: boolean;
  onShare: () => Promise<void>;
  onCopyPhrase: () => Promise<string>;
  onCopyLink: () => Promise<void>;
};

type ShareState = "idle" | "pending" | "error";
type CopyState = "idle" | "copied";

const COPIED_LABEL_DURATION_MS = 2000;
const AlertTriangle = ICONS.AlertTriangle;

export function ShareActionButton({ shareSupported, onShare, onCopyPhrase, onCopyLink }: ShareActionButtonProps) {
  const [shareState, setShareState] = useState<ShareState>("idle");
  const [phraseCopyState, setPhraseCopyState] = useState<CopyState>("idle");
  const [linkCopyState, setLinkCopyState] = useState<CopyState>("idle");

  async function handleShareClick() {
    setShareState("pending");
    try {
      await onShare();
      setShareState("idle");
    } catch (error) {
      // 사용자가 시스템 공유시트를 취소한 것은 실패가 아니다.
      const isUserCancelled = error instanceof DOMException && error.name === "AbortError";
      setShareState(isUserCancelled ? "idle" : "error");
    }
  }

  async function handleCopyPhraseClick() {
    await onCopyPhrase();
    setPhraseCopyState("copied");
    setTimeout(() => setPhraseCopyState("idle"), COPIED_LABEL_DURATION_MS);
  }

  async function handleCopyLinkClick() {
    await onCopyLink();
    setLinkCopyState("copied");
    setTimeout(() => setLinkCopyState("idle"), COPIED_LABEL_DURATION_MS);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
      {shareSupported ? (
        <>
          <Button
            variant="primary"
            fullWidth
            icon={{ name: "Share2", position: "leading" }}
            loading={shareState === "pending"}
            onClick={handleShareClick}
          >
            결과 카드 공유하기
          </Button>
          {shareState === "error" ? (
            <p
              role="alert"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-1)",
                margin: 0,
                fontSize: "var(--font-size-meta)",
                color: "var(--color-accent-danger)",
              }}
            >
              <AlertTriangle
                aria-hidden="true"
                style={{ width: "var(--icon-size-sm)", height: "var(--icon-size-sm)" }}
              />
              공유하지 못했습니다. 다시 시도해 주세요
            </p>
          ) : null}
        </>
      ) : null}
      <Button
        variant="secondary"
        fullWidth
        icon={{ name: phraseCopyState === "copied" ? "CopyCheck" : "Copy", position: "leading" }}
        onClick={handleCopyPhraseClick}
      >
        {phraseCopyState === "copied" ? "문구를 복사했어요" : "결과 문구 복사"}
      </Button>
      <Button
        variant="secondary"
        fullWidth
        icon={{ name: linkCopyState === "copied" ? "CopyCheck" : "Copy", position: "leading" }}
        onClick={handleCopyLinkClick}
      >
        {linkCopyState === "copied" ? "복사했습니다" : "링크 복사"}
      </Button>
    </div>
  );
}

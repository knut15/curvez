"use client";

// F1-AC6. 사용자 행위(정보 전체 삭제) 하나를 담당하는 feature.
import { useRouter } from "next/navigation";

import { deleteAllChildData } from "@/entities/child";
import { announce } from "@/shared/lib/announce";
import { ConfirmDialog } from "@/shared/ui";

export type ClearAllDataDialogProps = {
  open: boolean;
  onCancel: () => void;
};

export function ClearAllDataDialog({ open, onCancel }: ClearAllDataDialogProps) {
  const router = useRouter();

  function handleConfirm() {
    deleteAllChildData();
    // dashboard.md announce: 삭제 확인 완료 시 원문 그대로. Announcer 가 layout 에 상시
    // 마운트돼 있어 뒤이은 라우트 이동에도 안내가 살아남는다.
    announce("저장된 정보를 모두 지웠습니다");
    router.push("/");
  }

  return <ConfirmDialog open={open} onConfirm={handleConfirm} onCancel={onCancel} />;
}

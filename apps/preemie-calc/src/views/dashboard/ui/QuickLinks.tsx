// dashboard quick-links. F6(교정연령 적용 종료 안내)은 재태 37주 이상이면 숨긴다(PC-F6-EX1).
// shared/ui 만 쓰고 /dashboard 한 곳에서만 쓰여 views/dashboard/ui 에 둔다
// (architecture "레이어 정의" 판정 (c), 2026-09-29 이의 3 — PLC-03).
import { InfoRow } from "@/shared/ui";

const CORRECTION_HIDDEN_FROM_DAYS = 259;

export type QuickLinksProps = {
  gestationTotalDays: number;
};

export function QuickLinks({ gestationTotalDays }: QuickLinksProps) {
  const showCorrectionPeriod = gestationTotalDays < CORRECTION_HIDDEN_FROM_DAYS;

  return (
    <div className="pc-quick-links">
      <InfoRow variant="nav-card" icon="CircleHelp" label="어느 나이를 쓰나" href="/dashboard/age-basis" />
      <InfoRow variant="nav-card" icon="Stethoscope" label="영유아검진 도우미" href="/dashboard/checkups" />
      <InfoRow variant="nav-card" icon="Banknote" label="본인부담 경감 종료일" href="/dashboard/copay-relief" />
      {showCorrectionPeriod ? (
        <InfoRow
          variant="nav-card"
          icon="Hourglass"
          label="교정연령 적용 종료 안내"
          href="/dashboard/correction-period"
        />
      ) : null}
      <InfoRow variant="nav-card" icon="Ruler" label="성장 기록" href="/dashboard/growth" />
      <InfoRow variant="nav-card" icon="Syringe" label="예방접종 일정" href="/dashboard/vaccinations" />
      <InfoRow variant="nav-card" icon="Target" label="목표키 참고" href="/dashboard/target-height" />
      <InfoRow variant="nav-card" icon="Milk" label="분유량 참고" href="/dashboard/formula" />
    </div>
  );
}

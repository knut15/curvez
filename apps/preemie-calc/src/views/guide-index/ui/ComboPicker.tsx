"use client";

// F17 AC2. 출생 주수와 생후 개월을 골라 F13 조합 페이지(/guide/<주수>/<개월>)로 이동한다.
// 주수·개월 목록은 루트 뷰가 entities/child 의 COMBO_WEEKS·COMBO_MONTHS 를 받아 넘긴다
// (이 조각은 entities 를 읽지 않는다).
import { useId, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/shared/ui";

export type ComboPickerProps = {
  weeks: readonly number[];
  months: readonly number[];
};

const selectStyle: React.CSSProperties = {
  height: "var(--touch-target-min)",
  padding: "0 var(--space-2)",
  borderRadius: "var(--radius-md)",
  border: "1px solid var(--color-border-strong)",
  background: "var(--color-bg-surface)",
  color: "var(--color-text-primary)",
  fontSize: "var(--font-size-body)",
  boxSizing: "border-box",
};

const fieldStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "var(--space-1)",
  fontSize: "var(--font-size-body)",
  color: "var(--color-text-primary)",
};

export function ComboPicker({ weeks, months }: ComboPickerProps) {
  const router = useRouter();
  const weeksId = useId();
  const monthsId = useId();
  const [selectedWeeks, setSelectedWeeks] = useState(String(weeks[0]));
  const [selectedMonths, setSelectedMonths] = useState(String(months[0]));

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        router.push(`/guide/${selectedWeeks}/${selectedMonths}`);
      }}
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "flex-end",
        gap: "var(--space-3)",
      }}
    >
      <div style={fieldStyle}>
        <label htmlFor={weeksId}>출생 주수</label>
        <select
          id={weeksId}
          value={selectedWeeks}
          onChange={(event) => setSelectedWeeks(event.target.value)}
          style={selectStyle}
        >
          {weeks.map((w) => (
            <option key={w} value={w}>
              {w}주
            </option>
          ))}
        </select>
      </div>
      <div style={fieldStyle}>
        <label htmlFor={monthsId}>생후 개월</label>
        <select
          id={monthsId}
          value={selectedMonths}
          onChange={(event) => setSelectedMonths(event.target.value)}
          style={selectStyle}
        >
          {months.map((m) => (
            <option key={m} value={m}>
              {m}개월
            </option>
          ))}
        </select>
      </div>
      <Button type="submit">이동</Button>
    </form>
  );
}

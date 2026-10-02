"use client";

// 스펙: .curvez/design/preemie-calc/components/GrowthEntryForm.md
// F8 측정 기록 추가. 사용자 행위(측정 기록 입력·저장) 하나를 담당하는 feature.
import { useState } from "react";

import type { CalendarDate } from "@/shared/lib/calendar-date";
import {
  createGrowthRecord,
  isValidMeasurementValue,
  saveGrowthRecord,
  validateGrowthDraft,
  type GrowthDraft,
  type HeightPosture,
} from "@/entities/growth";
import { announce } from "@/shared/lib/announce";
import { Button, DateField, ICONS, SegmentedControl, TextField } from "@/shared/ui";

const AlertCircle = ICONS.AlertCircle;

const POSTURE_OPTIONS = [
  { value: "lying", label: "누워서" },
  { value: "standing", label: "서서" },
];

function isHeightPosture(value: string): value is HeightPosture {
  return value === "lying" || value === "standing";
}

export type GrowthEntryFormProps = {
  childId: string;
  birthDate: CalendarDate;
  today: CalendarDate;
  onSaved: () => void;
};

export function GrowthEntryForm({ childId, birthDate, today, onSaved }: GrowthEntryFormProps) {
  const [measurementDate, setMeasurementDate] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [headCircumferenceCm, setHeadCircumferenceCm] = useState("");
  const [posture, setPosture] = useState<HeightPosture | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [saveError, setSaveError] = useState(false);

  const draft: GrowthDraft = {
    measuredOn: measurementDate,
    heightCm,
    weightKg,
    headCircumferenceCm,
    posture,
  };

  const errors = submitted ? validateGrowthDraft(draft, { birthDate }, today) : [];
  const hasDateError = errors.some((e) => e.code === "invalid-date" || e.code === "measured-before-birth" || e.code === "measured-after-today");
  const hasValueError = errors.some((e) => e.code === "invalid-value");

  const heightError = submitted && (!isValidMeasurementValue(heightCm) ? "값을 확인하세요" : null);
  const weightError = submitted && (!isValidMeasurementValue(weightKg) ? "값을 확인하세요" : null);
  const headError = submitted && (!isValidMeasurementValue(headCircumferenceCm) ? "값을 확인하세요" : null);

  function handleSubmit() {
    setSubmitted(true);
    const validationErrors = validateGrowthDraft(draft, { birthDate }, today);
    if (validationErrors.length > 0) return;

    const record = createGrowthRecord(draft, childId);
    const saved = saveGrowthRecord(record);
    if (!saved) {
      setSaveError(true);
      return;
    }
    setSaveError(false);
    setSubmitted(false);
    setMeasurementDate("");
    setHeightCm("");
    setWeightKg("");
    setHeadCircumferenceCm("");
    setPosture(null);
    announce("기록을 저장했습니다");
    onSaved();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
      {hasDateError ? (
        <p
          role="alert"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
            margin: 0,
            padding: "var(--space-3) var(--space-4)",
            background: "var(--color-accent-danger-bg)",
            color: "var(--color-accent-danger)",
            borderRadius: "var(--radius-md)",
            fontSize: "var(--font-size-body)",
          }}
        >
          <AlertCircle aria-hidden="true" style={{ width: "var(--icon-size-sm)", height: "var(--icon-size-sm)" }} />
          측정일을 확인하세요
        </p>
      ) : null}
      {saveError ? (
        <p role="alert" style={{ margin: 0, color: "var(--color-accent-danger)", fontSize: "var(--font-size-body)" }}>
          저장하지 못했습니다. 저장 공간을 확인해 주세요
        </p>
      ) : null}

      <DateField label="측정일" value={measurementDate} min={birthDate} max={today} onChange={setMeasurementDate} />
      <TextField
        label="키"
        icon="Ruler"
        suffix="cm"
        inputMode="decimal"
        required
        value={heightCm}
        error={heightError || null}
        onChange={setHeightCm}
      />
      <TextField
        label="몸무게"
        icon="Weight"
        suffix="kg"
        inputMode="decimal"
        required
        value={weightKg}
        error={weightError || null}
        onChange={setWeightKg}
      />
      <TextField
        label="머리둘레"
        icon="CircleDashed"
        suffix="cm"
        inputMode="decimal"
        required
        value={headCircumferenceCm}
        error={headError || null}
        onChange={setHeadCircumferenceCm}
      />
      <SegmentedControl
        label="측정 자세"
        options={POSTURE_OPTIONS}
        value={posture}
        onChange={(v) => {
          if (isHeightPosture(v)) setPosture(v);
        }}
      />

      <div aria-live="polite" className="sr-only">
        {hasValueError ? "측정값을 확인하세요" : ""}
      </div>

      <Button variant="primary" fullWidth onClick={handleSubmit}>
        기록 추가
      </Button>
    </div>
  );
}

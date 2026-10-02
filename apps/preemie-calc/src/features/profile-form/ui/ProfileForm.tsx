"use client";

// F1 입력 폼. 사용자 행위(프로필 입력) 하나를 담당하는 feature.
import { useId, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useToday } from "@/shared/lib/calendar-date";
import {
  createChildProfile,
  saveProfile,
  validateProfileDraft,
  type ProfileDraft,
  type Sex,
} from "@/entities/child";
import { announce } from "@/shared/lib/announce";
import { Button, DateField, GestationInput, ICONS, SegmentedControl } from "@/shared/ui";

const AlertCircle = ICONS.AlertCircle;

const SEX_OPTIONS = [
  { value: "male", label: "남아" },
  { value: "female", label: "여아" },
];

function isSex(value: string): value is Sex {
  return value === "male" || value === "female";
}

export type ProfileFormProps = {
  initialWeeks: number | null;
  /** 저장 뒤 돌아갈 경로. 계산기 링크(PC-F16-EX1·PC-F18-AC2)가 이 화면을 거칠 때 쓴다. */
  returnTo: string;
};

export function ProfileForm({ initialWeeks, returnTo }: ProfileFormProps) {
  const router = useRouter();
  const today = useToday();

  const [mode, setMode] = useState<"due-date" | "gestation">(initialWeeks !== null ? "gestation" : "due-date");
  const [birthDate, setBirthDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [weeks, setWeeks] = useState<number | null>(initialWeeks);
  const [days, setDays] = useState(0);
  const [sex, setSex] = useState<Sex | null>(null);
  const [saveError, setSaveError] = useState(false);
  // F1-AC7: 예정일 칸의 도움말을 aria-describedby 로 잇는다. DateField(shared/ui)의
  // describedBy prop 으로 바로 연결한다.
  const dueHelpId = useId();

  const draft: ProfileDraft | null = useMemo(() => {
    if (birthDate === "" || sex === null) return null;
    if (mode === "due-date") {
      if (dueDate === "") return null;
      return { mode: "due-date", name: "", sex, birthDate, dueDate, birthWeightGrams: null };
    }
    if (weeks === null) return null;
    return {
      mode: "gestation",
      name: "",
      sex,
      birthDate,
      gestation: { weeks, days },
      birthWeightGrams: null,
    };
  }, [mode, birthDate, dueDate, weeks, days, sex]);

  const errors = draft ? validateProfileDraft(draft, today) : [];
  const hasValidationError = draft !== null && errors.length > 0;
  const hasFormError = hasValidationError || saveError;
  const canSubmit = draft !== null && errors.length === 0;
  // ERR-02: 유효성 오류(사실)와 저장소 쓰기 실패(사실)는 서로 다른 원인이라 다른 문구를 쓴다.
  const formErrorText = hasValidationError
    ? "날짜를 확인하세요"
    : saveError
      ? "저장하지 못했습니다. 저장 공간을 확인해 주세요"
      : "";

  function handleSubmit() {
    if (!draft) return;
    const validationErrors = validateProfileDraft(draft, today);
    if (validationErrors.length > 0) return;
    const profile = createChildProfile(draft);
    const saved = saveProfile(profile);
    if (!saved) {
      setSaveError(true);
      return;
    }
    setSaveError(false);
    // input.md announce: 저장 성공 시 원문 그대로. 전역 Announcer 가 layout 에 상시
    // 마운트돼 있어 곧이은 /dashboard 이동에도 안내가 살아남는다.
    announce("프로필을 저장했습니다");
    router.push(returnTo);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
      {hasFormError ? (
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
          {formErrorText}
        </p>
      ) : null}

      <DateField
        label="출생일"
        value={birthDate}
        max={today}
        onChange={setBirthDate}
      />

      {mode === "due-date" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          <DateField label="원래 출산 예정일" value={dueDate} onChange={setDueDate} describedBy={dueHelpId} />
          <p id={dueHelpId} style={{ margin: 0, fontSize: "var(--font-size-meta)", color: "var(--color-text-muted)" }}>
            임신 중 병원에서 안내받은 날짜예요. 모르면 &apos;주수로 입력&apos;을 눌러 주세요.
          </p>
        </div>
      ) : (
        <GestationInput
          weeks={weeks}
          days={days}
          onChange={(v) => {
            setWeeks(v.weeks);
            setDays(v.days);
          }}
        />
      )}

      {/* 2026-09-29 교정 라운드(ACC-03 수정): SPEC 원문 "출산 예정일 칸 아래에 '주수로
          입력' 전환이 있다"(PC-F1-AC1)에 맞춰 전환을 예정일/주수 필드 뒤로 옮겼다.
          shared/ui Button(variant="text")을 써서 최소 터치 대상(--touch-target-min,
          PC-NF-MOBILE-3)을 만족한다. */}
      <div style={{ alignSelf: "flex-start" }}>
        <Button variant="text" onClick={() => setMode(mode === "due-date" ? "gestation" : "due-date")}>
          {mode === "due-date" ? "주수로 입력" : "예정일로 입력"}
        </Button>
      </div>

      <SegmentedControl
        label="성별"
        options={SEX_OPTIONS}
        value={sex}
        onChange={(v) => {
          if (isSex(v)) setSex(v);
        }}
      />

      <div aria-live="polite" className="sr-only">
        {formErrorText}
      </div>

      <Button variant="primary" size="lg" fullWidth disabled={!canSubmit} onClick={handleSubmit}>
        저장하고 결과 보기
      </Button>
    </div>
  );
}

// 아이 프로필 저장 값과 입력 검증. entities/child/model 안에서만 쓰는 조각이다(PLC-05).
import { parseCalendarDate, type CalendarDate } from "@/shared/lib/calendar-date";

import { dueDateFromGestation, validateGestationDates, type ProfileError } from "./gestation";

export type Sex = "male" | "female";

export type ChildProfile = {
  id: string;
  name: string | null;
  sex: Sex;
  birthDate: CalendarDate;
  dueDate: CalendarDate;
  birthWeightGrams: number | null;
};

export type ProfileDraft =
  | {
      mode: "due-date";
      name: string;
      sex: Sex;
      birthDate: string;
      dueDate: string;
      birthWeightGrams: number | null;
    }
  | {
      mode: "gestation";
      name: string;
      sex: Sex;
      birthDate: string;
      gestation: { weeks: number; days: number };
      birthWeightGrams: number | null;
    };

/** draft(검증 통과 전제) → 저장용 ChildProfile. 이름은 트림 후 빈 문자열이면 null. */
export function createChildProfile(draft: ProfileDraft): ChildProfile {
  const birthDate = parseCalendarDate(draft.birthDate);
  if (!birthDate) {
    throw new Error("createChildProfile: birthDate 가 올바른 달력 날짜가 아니다");
  }

  let dueDate: CalendarDate;
  if (draft.mode === "due-date") {
    const parsedDueDate = parseCalendarDate(draft.dueDate);
    if (!parsedDueDate) {
      throw new Error("createChildProfile: dueDate 가 올바른 달력 날짜가 아니다");
    }
    dueDate = parsedDueDate;
  } else {
    dueDate = dueDateFromGestation(birthDate, draft.gestation);
  }

  const trimmedName = draft.name.trim();

  return {
    id: crypto.randomUUID(),
    name: trimmedName === "" ? null : trimmedName,
    sex: draft.sex,
    birthDate,
    dueDate,
    birthWeightGrams: draft.birthWeightGrams,
  };
}

/** 이름이 없으면 "아이 {목록 순서 + 1}" (PC-F1-EX3). 번호는 저장하지 않는다. */
export function childDisplayName(profile: ChildProfile, index: number): string {
  return profile.name ?? `아이 ${index + 1}`;
}

export function validateProfileDraft(
  draft: ProfileDraft,
  today: CalendarDate,
): ProfileError[] {
  const birthDate = parseCalendarDate(draft.birthDate);
  if (!birthDate) {
    return [{ code: "invalid-date" }];
  }

  let dueDate: CalendarDate;
  if (draft.mode === "due-date") {
    const parsedDueDate = parseCalendarDate(draft.dueDate);
    if (!parsedDueDate) {
      return [{ code: "invalid-date" }];
    }
    dueDate = parsedDueDate;
  } else {
    // ACC-05: "일" 칸은 0~6 사이의 정수만 받는다. 범위 밖·소수는 날짜 자체가 잘못된
    // 입력이라 gestation-out-of-range 가 아니라 invalid-date 로 본다.
    if (
      !Number.isInteger(draft.gestation.days) ||
      draft.gestation.days < 0 ||
      draft.gestation.days > 6
    ) {
      return [{ code: "invalid-date" }];
    }
    dueDate = dueDateFromGestation(birthDate, draft.gestation);
  }

  return validateGestationDates(birthDate, dueDate, today);
}

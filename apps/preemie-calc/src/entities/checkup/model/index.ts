// F4 영유아검진 도우미. 기준 데이터는 이 슬라이스 안에서만 읽는다(ARCH-107).
import {
  addAgeOffset,
  addDays,
  calendarSpan,
  type AgeOffset,
  type CalendarDate,
} from "@/shared/lib/calendar-date";
import {
  resolveReferenceMeta,
  resolveSettledEnvelope,
  type ReferenceMeta,
  type ReferenceMetaInput,
  type Settled,
} from "@/shared/lib/reference";

import rawData from "../data/checkup-rounds.json";

export type CheckupRound = {
  id: string;
  order: number;
  label: string;
  sourceRangeText: string;
  visitWindow: { start: AgeOffset; endExclusive: AgeOffset };
  // 이 차수만 원문과 대조하지 못했을 때 그 이유(round-1). 대조한 차수에는 없다.
  unverifiedReason?: string;
};

type QuestionnaireCorrection = Settled<{ lastCorrectedRoundId: string }>;

// JSON 이 주는 모양. status·openQuestion 이 아직 리터럴로 좁혀지지 않은 `string` 이다.
type RawQuestionnaireCorrection = {
  status: string;
  value: { lastCorrectedRoundId: string };
  openQuestion?: string;
  provisionalBasis?: string;
};

type CheckupData = {
  meta: ReferenceMetaInput;
  rounds: CheckupRound[];
  questionnaireCorrection: RawQuestionnaireCorrection;
};

// JSON 구조가 CheckupData 와 다르면 여기서 컴파일 오류가 난다(단언 없이 구조 검사).
const data: CheckupData = rawData;

export const checkupMeta: ReferenceMeta = resolveReferenceMeta(data.meta, "checkup-rounds");
export const checkupRounds: CheckupRound[] = data.rounds;
export const questionnaireCorrection: QuestionnaireCorrection = resolveSettledEnvelope(
  data.questionnaireCorrection,
  data.questionnaireCorrection.value,
  "checkup-rounds: questionnaireCorrection",
);

export type CheckupRoundStatus = "past" | "current" | "upcoming";

export type CheckupPlan = {
  rounds: {
    round: CheckupRound;
    visitStart: CalendarDate;
    visitEnd: CalendarDate;
    status: CheckupRoundStatus;
    questionnaireBasis: "corrected" | "chronological";
  }[];
  currentQuestionnaireMonths: number | null;
  // 오늘 차수가 교정 기준인데 아직 출산 예정일 전이라 교정 나이 자체가 없는 상태다
  // (ERR-01). currentQuestionnaireMonths 가 null 인 이유가 "차수 없음"인지 "교정 나이
  // 아직 없음"인지 이 필드로 구분한다.
  currentBeforeDue: boolean;
  allPassed: boolean;
  unconfirmed: boolean;
};

function compareAgeOffset(a: AgeOffset, b: AgeOffset): number {
  if (a.months !== b.months) return a.months - b.months;
  return a.days - b.days;
}

function lastCorrectedOrder(): number {
  const found = checkupRounds.find(
    (r) => r.id === questionnaireCorrection.value.lastCorrectedRoundId,
  );
  return found ? found.order : 0;
}

/** correctedFrom = correctionApplies ? dueDate : null. */
export function planCheckups(input: {
  birthDate: CalendarDate;
  correctedFrom: CalendarDate | null;
  today: CalendarDate;
}): CheckupPlan {
  const { birthDate, correctedFrom, today } = input;
  const lastCorrected = lastCorrectedOrder();

  const rounds = checkupRounds.map((round) => {
    const visitStart = addAgeOffset(birthDate, round.visitWindow.start);
    const visitEnd = addDays(addAgeOffset(birthDate, round.visitWindow.endExclusive), -1);

    let status: CheckupRoundStatus;
    if (today < visitStart) status = "upcoming";
    else if (today > visitEnd) status = "past";
    else status = "current";

    const questionnaireBasis: "corrected" | "chronological" =
      correctedFrom !== null && round.order <= lastCorrected ? "corrected" : "chronological";

    return { round, visitStart, visitEnd, status, questionnaireBasis };
  });

  const currentRound = rounds.find((r) => r.status === "current") ?? null;
  let currentQuestionnaireMonths: number | null = null;
  // 교정 기준 차수인데 오늘이 아직 출산 예정일 전이면 교정 나이 자체가 없다. calendarSpan
  // 은 from > to 면 예외를 던지므로(ERR-01), 이 조건에서는 호출하지 않는다.
  const currentBeforeDue =
    currentRound !== null &&
    currentRound.questionnaireBasis === "corrected" &&
    correctedFrom !== null &&
    today < correctedFrom;
  if (currentRound && !currentBeforeDue) {
    currentQuestionnaireMonths =
      currentRound.questionnaireBasis === "corrected" && correctedFrom !== null
        ? calendarSpan(correctedFrom, today).months
        : calendarSpan(birthDate, today).months;
  }

  return {
    rounds,
    currentQuestionnaireMonths,
    currentBeforeDue,
    allPassed: rounds.every((r) => r.status === "past"),
    unconfirmed: questionnaireCorrection.status === "미확정",
  };
}

/** 날짜 없는 F13 페이지용. offset 이 어느 차수의 방문 기간에 드는지만 본다. */
export function roundAtAge(offset: AgeOffset): CheckupRound | null {
  const found = checkupRounds.find(
    (round) =>
      compareAgeOffset(offset, round.visitWindow.start) >= 0 &&
      compareAgeOffset(offset, round.visitWindow.endExclusive) < 0,
  );
  return found ?? null;
}

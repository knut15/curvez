"use client";

// F8 성장 백분위 + 기록. entities/growth 계산·저장과 features/record-growth 입력 폼을 묶는다.
import { useState } from "react";

import type { CalendarDate } from "@/shared/lib/calendar-date";
import {
  growthMeta,
  growthPercentiles,
  loadGrowthRecords,
  type GrowthSex,
} from "@/entities/growth";
import { GrowthEntryForm } from "@/features/record-growth";
import { ReferenceFooter, StatePanel } from "@/shared/ui";

import { buildGrowthTrendPoints } from "../lib/build-growth-trend-points";
import { GrowthRecordTable, type GrowthRecordRow } from "./GrowthRecordTable";
import { GrowthTrendChart } from "./GrowthTrendChart";

export type GrowthPanelSectionProps = {
  childId: string;
  sex: GrowthSex;
  birthDate: CalendarDate;
  correctedFrom: CalendarDate | null;
  today: CalendarDate;
};

export function GrowthPanelSection({ childId, sex, birthDate, correctedFrom, today }: GrowthPanelSectionProps) {
  const [, setRefreshKey] = useState(0);

  const loadResult = loadGrowthRecords(childId);
  // 프로필 저장소와 달리 기록 저장소는 손상돼도 새 기록 저장으로 스스로 회복된다(정보
  // 전체 삭제와 같은 preemie-calc/ 키 규약). 그래서 corrupted·unavailable 도 "아직 없음"과
  // 같은 화면으로 내려 새 기록 입력을 계속 받는다.
  const records = loadResult.status === "ok" ? loadResult.records : [];

  const rows: GrowthRecordRow[] = [...records]
    .reverse()
    .map((record) => {
      const result = growthPercentiles(
        { sex, birthDate, correctedFrom },
        {
          measuredOn: record.measuredOn,
          heightCm: record.heightCm,
          weightGrams: record.weightGrams,
          headCircumferenceCm: record.headCircumferenceCm,
        },
      );

      const weightKg = Math.round(record.weightGrams) / 1000;

      if (result.kind === "before-due" || result.kind === "out-of-range") {
        const ageBasis =
          result.kind === "out-of-range"
            ? {
                kind: result.age.basis,
                label: `${result.age.basis === "corrected" ? "교정" : "생후"} ${result.age.span.months}개월 기준`,
              }
            : { kind: "corrected" as const, label: "교정 나이 시작 전" };
        return {
          id: record.id,
          measurementDate: record.measuredOn,
          heightCm: record.heightCm,
          weightKg,
          headCircumferenceCm: record.headCircumferenceCm,
          posture: record.heightPosture,
          ageBasis,
          percentile: null,
          percentileHidden: true,
          cautionNeeded: false,
        };
      }

      return {
        id: record.id,
        measurementDate: record.measuredOn,
        heightCm: record.heightCm,
        weightKg,
        headCircumferenceCm: record.headCircumferenceCm,
        posture: record.heightPosture,
        ageBasis: {
          kind: result.age.basis,
          label: `${result.age.basis === "corrected" ? "교정" : "생후"} ${result.age.span.months}개월 기준`,
        },
        percentile: {
          height: result.height.percentile,
          weight: result.weight.percentile,
          headCircumference: result.headCircumference.percentile,
        },
        percentileHidden: false,
        cautionNeeded: result.height.consult || result.weight.consult || result.headCircumference.consult,
      };
    });

  const sources = [{ title: growthMeta.title, effectiveDate: growthMeta.effectiveDate }];

  // PC-F8-AC3 추이 그래프: 지표별(키·몸무게·머리둘레) 점을 측정일 오름차순으로 만든다.
  // 기록이 0·1개면 각 GrowthTrendChart 인스턴스가 스스로 아무것도 그리지 않거나(0개)
  // 안내 한 줄만 보여준다(1개) — 이 컴포넌트가 따로 분기하지 않는다.
  const trendPoints = buildGrowthTrendPoints({ records, age: { sex, birthDate, correctedFrom } });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
      <GrowthEntryForm
        childId={childId}
        birthDate={birthDate}
        today={today}
        onSaved={() => setRefreshKey((k) => k + 1)}
      />
      <GrowthTrendChart measure="height" points={trendPoints.height} />
      <GrowthTrendChart measure="weight" points={trendPoints.weight} />
      <GrowthTrendChart measure="headCircumference" points={trendPoints.headCircumference} />
      {rows.length === 0 ? (
        <StatePanel variant="domain-empty" message="아직 기록이 없습니다" />
      ) : (
        <GrowthRecordTable records={rows} />
      )}
      <ReferenceFooter sources={sources} />
    </div>
  );
}

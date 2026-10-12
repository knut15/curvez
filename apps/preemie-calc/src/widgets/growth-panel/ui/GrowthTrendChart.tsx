"use client";

// 스펙: .curvez/design/preemie-calc/components/GrowthTrendChart.md (F8 AC3 추이 그래프).
// recharts 를 부르는 잎(leaf) 컴포넌트다 — 부모(GrowthPanelSection)도 "use client" 지만
// 큰 차트 라이브러리는 여기에만 가둔다(ARCH-114~118, architect 결정: widgets/*/ui 의
// "use client" 파일에서만 recharts 를 부른다).
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type DotItemDotProps,
} from "recharts";

import { ICONS, IconBadge, type IconName } from "@/shared/ui";

import type { GrowthTrendPoint } from "../lib/build-growth-trend-points";

export type GrowthTrendChartMeasure = "height" | "weight" | "headCircumference";

export type GrowthTrendChartProps = {
  measure: GrowthTrendChartMeasure;
  points: GrowthTrendPoint[];
};

const MEASURE_META: Record<GrowthTrendChartMeasure, { title: string; icon: IconName; unit: string }> = {
  height: { title: "키 추이", icon: "Ruler", unit: "cm" },
  weight: { title: "몸무게 추이", icon: "Weight", unit: "kg" },
  headCircumference: { title: "머리둘레 추이", icon: "CircleDashed", unit: "cm" },
};

// recharts 의 dot·tooltip 콜백은 라이브러리 타입 자체가 payload 를 `any` 로 둔다(Payload.payload,
// DotItemDotProps.payload). 이 컴포넌트가 recharts 에 넘긴 데이터는 항상 GrowthTrendPoint[] 이므로
// 콜백이 받는 payload 도 같은 모양이라고 믿을 수 있지만, 그 사실을 타입으로 증명할 수 없는 건
// 라이브러리 경계라서다 — 이 함수 하나에서만 구조를 확인한 뒤 단언한다(경계 어댑터).
function isGrowthTrendPoint(value: unknown): value is GrowthTrendPoint {
  if (typeof value !== "object" || value === null) return false;
  if (
    !("measurementDate" in value) ||
    !("value" in value) ||
    !("cautionNeeded" in value) ||
    !("percentileHidden" in value)
  ) {
    return false;
  }
  const candidate = value as GrowthTrendPoint;
  return (
    typeof candidate.measurementDate === "string" &&
    typeof candidate.value === "number" &&
    typeof candidate.cautionNeeded === "boolean" &&
    typeof candidate.percentileHidden === "boolean"
  );
}

function formatTick(value: string): string {
  // "2026-06-01" → "06.01"
  return value.slice(5).replace("-", ".");
}

// 점 모양: 색만으로 의미를 가르지 않는다(design `## 점 모양`). 원(기본)/삼각형(주의)/
// 빈 사각형(백분위 없음) 세 모양이 1차 구분 수단이고 색은 보조다.
function TrendDot(props: DotItemDotProps) {
  const { cx, cy, payload } = props;
  if (cx === undefined || cy === undefined || !isGrowthTrendPoint(payload)) return null;

  if (payload.cautionNeeded) {
    const half = 4;
    const points = `${cx},${cy - half} ${cx + half},${cy + half} ${cx - half},${cy + half}`;
    return <polygon points={points} fill="var(--color-accent-danger)" />;
  }

  if (payload.percentileHidden) {
    const half = 4;
    return (
      <rect
        x={cx - half}
        y={cy - half}
        width={half * 2}
        height={half * 2}
        fill="var(--color-bg-surface)"
        stroke="var(--color-text-muted)"
        strokeWidth={1.5}
      />
    );
  }

  return <circle cx={cx} cy={cy} r={4} fill="var(--color-accent-primary)" />;
}

// recharts `Tooltip` 의 `content` 콜백 타입(`TooltipContentProps`)은 제네릭(ValueType·NameType)
// 전체를 그대로 받으면 우리가 쓰지 않는 다른 필드(formatter 등)의 제네릭 불일치로 타입 오류가
// 난다. 이 컴포넌트가 실제로 읽는 필드(active·payload)만 모양으로 받는다 — 구조적으로
// 호환되므로 호출부에서 그대로 분해해 넘길 수 있다.
type TrendTooltipProps = {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: unknown }>;
  unit: string;
};

function TrendTooltip({ active, payload: tooltipPayload, unit }: TrendTooltipProps) {
  if (!active || !tooltipPayload || tooltipPayload.length === 0) return null;
  const point = tooltipPayload[0]?.payload;
  if (!isGrowthTrendPoint(point)) return null;

  return (
    <div
      style={{
        background: "var(--color-bg-surface)",
        border: "1px solid var(--color-border-subtle)",
        boxShadow: "var(--elevation-card)",
        borderRadius: "var(--radius-md)",
        padding: "var(--space-3)",
        fontSize: "var(--font-size-meta)",
        color: "var(--color-text-primary)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-1)",
      }}
    >
      <div>{point.measurementDate}</div>
      <div>
        실측값: {point.value}
        {unit}
      </div>
      <div>{point.ageBasisLabel ?? "교정 나이 시작 전"}</div>
      <div>
        {point.percentileHidden ? "이 시기는 백분위를 표시하지 않습니다" : `백분위: ${point.percentileValue}%ile`}
      </div>
      {point.p97 != null && (
        <div>
          97백분위 기준: {point.p97}
          {unit}
        </div>
      )}
      {point.p50 != null && (
        <div>
          50백분위 기준: {point.p50}
          {unit}
        </div>
      )}
      {point.p3 != null && (
        <div>
          3백분위 기준: {point.p3}
          {unit}
        </div>
      )}
    </div>
  );
}

export function GrowthTrendChart({ measure, points }: GrowthTrendChartProps) {
  if (points.length === 0) return null;

  const { title, icon, unit } = MEASURE_META[measure];

  if (points.length === 1) {
    const InfoIcon = ICONS.Info;
    return (
      <div className="pc-growth-trend-chart" role="status">
        <header style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          <IconBadge icon={icon} tone="primary" size="sm" />
          <span style={{ fontSize: "var(--font-size-subtitle)", color: "var(--color-text-primary)" }}>
            {title}({unit})
          </span>
        </header>
        <p
          style={{
            margin: 0,
            display: "flex",
            alignItems: "center",
            gap: "var(--space-1)",
            fontSize: "var(--font-size-body)",
            color: "var(--color-text-muted)",
          }}
        >
          <InfoIcon aria-hidden="true" style={{ width: "var(--icon-size-sm)", height: "var(--icon-size-sm)" }} />
          측정 기록이 1개뿐이라 추이를 보여줄 수 없습니다. 기록을 1개 더 추가하면 추이 그래프가 보입니다.
        </p>
      </div>
    );
  }

  return (
    <div className="pc-growth-trend-chart">
      <header style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
        <IconBadge icon={icon} tone="primary" size="sm" />
        <span style={{ fontSize: "var(--font-size-subtitle)", color: "var(--color-text-primary)" }}>
          {title}({unit})
        </span>
      </header>
      <div aria-hidden="true" className="pc-growth-trend-chart-canvas">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={points} margin={{ top: 8, right: 12, left: 4, bottom: 8 }}>
            <CartesianGrid stroke="var(--color-border-subtle)" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="measurementDate"
              type="category"
              tickFormatter={formatTick}
              tick={{ fontSize: 14, fill: "var(--color-text-muted)" }}
              tickLine={false}
              axisLine={{ stroke: "var(--color-border-subtle)" }}
              interval="preserveStartEnd"
              minTickGap={24}
            />
            <YAxis
              type="number"
              width={36}
              tick={{ fontSize: 14, fill: "var(--color-text-muted)" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={(props) => <TrendTooltip active={props.active} payload={props.payload} unit={unit} />} />
            <Legend
              verticalAlign="bottom"
              height={28}
              wrapperStyle={{ fontSize: 14, color: "var(--color-text-muted)", paddingTop: 8 }}
            />
            <Line
              dataKey="p97"
              name="97백분위"
              stroke="var(--color-accent-danger)"
              strokeWidth={1.5}
              strokeDasharray="6 3"
              dot={false}
              activeDot={false}
              connectNulls={false}
              isAnimationActive={false}
            />
            <Line
              dataKey="p50"
              name="50백분위(중앙값)"
              stroke="var(--color-text-muted)"
              strokeWidth={1.5}
              strokeDasharray="2 3"
              dot={false}
              activeDot={false}
              connectNulls={false}
              isAnimationActive={false}
            />
            <Line
              dataKey="p3"
              name="3백분위"
              stroke="var(--color-accent-danger)"
              strokeWidth={1.5}
              strokeDasharray="1 4"
              dot={false}
              activeDot={false}
              connectNulls={false}
              isAnimationActive={false}
            />
            <Line
              dataKey="value"
              name="실측값"
              stroke="var(--color-accent-primary)"
              strokeWidth={2}
              dot={TrendDot}
              activeDot={{ r: 6 }}
              connectNulls={true}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <footer
        style={{
          margin: 0,
          display: "flex",
          flexWrap: "wrap",
          gap: "var(--space-3)",
          fontSize: "var(--font-size-meta)",
          color: "var(--color-text-muted)",
        }}
      >
        <span>● 실측값</span>
        <span>▲ 소아청소년과 상담을 권합니다</span>
        <span>☐ 이 시기는 백분위를 표시하지 않습니다</span>
      </footer>
      <span className="sr-only">자세한 값은 아래 성장 기록 표에서 확인할 수 있습니다.</span>
    </div>
  );
}

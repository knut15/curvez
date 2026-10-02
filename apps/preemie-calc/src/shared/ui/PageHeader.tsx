"use client";

// 스펙: .curvez/design/preemie-calc/components/PageHeader.md
// 제목은 모든 variant·모든 화면 폭에서 항상 헤더 정중앙에 온다 — 3분할 그리드
// (minmax(--layout-header-side-reserve, 1fr) auto minmax(...)) 로 좌/우 zone 을 같은
// 최소 폭으로 예약해 콘텐츠 유무와 무관하게 제목이 기하학적 정중앙에 오도록 한다.
import { HeaderMenu } from "./HeaderMenu";
import { IconBadge } from "./IconBadge";
import { ICONS } from "./icons";

export type PageHeaderProps = (
  | { variant: "title-only"; title: string }
  | { variant: "back"; title: string; onBack: () => void }
  | {
      variant: "dashboard";
      title: string;
      onEditProfile: () => void;
      onDeleteAll: () => void;
    }
) & {
  // 기본은 h1. /guide 처럼 본문에 SEO 조합 제목을 h1 으로 따로 둔 화면은 h2 로 내린다
  // (페이지에 h1 을 하나만 두기 위함, DSG-05 핸드오프 맥락).
  headingLevel?: 1 | 2;
};

// 헤더는 최소 높이만 보장한다. 제목이 두 줄로 줄바꿈되면(아래 h1 참고) 높이가 그만큼 늘어난다
// — position:sticky + display:flex 로 고정 높이 대신 내용에 맞춰 늘어나되 세로 중앙 정렬은 유지한다.
const headerStyle: React.CSSProperties = {
  position: "sticky",
  top: 0,
  zIndex: 10,
  display: "flex",
  alignItems: "center",
  minHeight: "var(--layout-header-height)",
  background: "var(--color-bg-surface)",
  borderBottom: "1px solid var(--color-border-subtle)",
};

const ChevronLeft = ICONS.ChevronLeft;

export function PageHeader(props: PageHeaderProps) {
  const Heading = props.headingLevel === 2 ? "h2" : "h1";

  return (
    <header role="banner" style={headerStyle}>
      <div className="pc-header-grid pc-content-max pc-content-pad-x">
        <div style={{ justifySelf: "start", display: "flex", alignItems: "center" }}>
          {props.variant === "back" ? (
            <button
              type="button"
              onClick={props.onBack}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-1)",
                height: "var(--touch-target-min)",
                padding: "0 var(--space-2) 0 0",
                background: "transparent",
                border: "none",
                color: "var(--color-text-primary)",
                fontSize: "var(--font-size-body)",
                cursor: "pointer",
              }}
            >
              <ChevronLeft aria-hidden="true" style={{ width: "var(--icon-size-md)", height: "var(--icon-size-md)" }} />
              대시보드
            </button>
          ) : (
            <IconBadge icon="Baby" tone="primary" size="md" />
          )}
        </div>
        <Heading
          style={{
            // stretch: 박스 폭을 가운데 칸(트랙) 폭 그대로 채운다 — 이전의 justifySelf:center 는
            // 제목의 콘텐츠 폭(최대 320px)을 그대로 써서 칸보다 넓어지면 좌우 zone 을 침범했다
            // (DSG-05). minWidth:0 은 그리드 아이템의 자동 최소 폭이 칸을 넓히지 않게 한다.
            justifySelf: "stretch",
            minWidth: 0,
            textAlign: "center",
            fontSize: "var(--font-size-title)",
            color: "var(--color-text-primary)",
            margin: 0,
            overflow: "hidden",
            overflowWrap: "break-word",
            // 칸 폭을 넘치면 말줄임 대신 가운데 정렬로 줄바꿈한다. 2026-09-30 결함 수정: body
            // word-break:keep-all(어절 단위 줄바꿈, globals.css) 적용 뒤 "교정연령 적용 종료 안내"
            // (correction-period, 360px)는 음절 중간 줄바꿈 없이는 2줄에 들어가지 않는다(가운데
            // 칸 폭이 ~104px 라 "교정연령 적용"만도 128px). 자르는 대신(scrollHeight>clientHeight,
            // 잘림) 3줄까지 허용해 전체 문구가 보이게 한다 — 헤더 높이는 sticky+flex 라 그만큼
            // 자연히 늘어난다(파일 상단 주석 참고).
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            maxWidth: "min(60vw, 320px)",
          }}
        >
          {props.title}
        </Heading>
        <div style={{ justifySelf: "end", display: "flex", alignItems: "center" }}>
          {props.variant === "dashboard" ? (
            <HeaderMenu onEditProfile={props.onEditProfile} onDeleteAll={props.onDeleteAll} />
          ) : null}
        </div>
      </div>
    </header>
  );
}

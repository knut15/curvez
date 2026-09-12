/**
 * 열두 가지 색. 순서는 하루와 한 해를 따른다 — 새벽에서 밤으로, 겨울에서 겨울로.
 * 번호를 화면에 찍는 근거가 이 순서다.
 *
 * 이름·무드·설명의 정본은 `docs/PRD.md` 의 「열두 개의 성격」 표다.
 * 값 자체는 여기 없다. 값은 `presets/grade.py` 의 `PRESETS` 가 정본이다.
 */
export type Preset = {
  /** `public/demo/<stem>-before.webp` · `-after.webp` 의 접두 */
  stem: string;
  name: string;
  /** 언제의 빛인가 */
  mood: string;
  /** 이 색이 사진에 하는 일 */
  note: string;
};

export const PRESETS: Preset[] = [
  {
    stem: "01-oslo",
    name: "오슬로",
    mood: "겨울 새벽",
    note: "어둡게 내리고 짙은 청색을 넣는다",
  },
  {
    stem: "02-sapporo",
    name: "삿포로",
    mood: "눈 내린 한낮",
    note: "밝게 올리고 흰색을 중성으로 세운다",
  },
  {
    stem: "03-seoul",
    name: "서울",
    mood: "맑은 가을 낮",
    note: "하늘의 파랑을 깊게, 노랑만 살리고 전체 채도를 내린다",
  },
  {
    stem: "04-tokyo",
    name: "도쿄",
    mood: "봄 한낮",
    note: "분홍을 연하게 얹고 하이라이트를 부드럽게 굴린다",
  },
  {
    stem: "05-santorini",
    name: "산토리니",
    mood: "쨍한 여름",
    note: "시안을 진하게, 흰색을 깨끗하게, 노랑을 죽인다",
  },
  {
    stem: "06-lisbon",
    name: "리스본",
    mood: "늦여름 오후",
    note: "중간톤을 따뜻하게, 하이라이트에 금빛을 넣는다",
  },
  {
    stem: "07-havana",
    name: "하바나",
    mood: "햇빛 강한 오후",
    note: "검정을 들어 올리고 청록과 주황으로 바랜다",
  },
  {
    stem: "08-seattle",
    name: "시애틀",
    mood: "비 오는 흐린 날",
    note: "밝고 습하게, 파랑기를 남기고 대비를 눕힌다",
  },
  {
    stem: "09-paris",
    name: "파리",
    mood: "해질녘",
    note: "하늘을 라벤더로 돌리고 고운 입자를 얹는다",
  },
  {
    stem: "10-marrakesh",
    name: "마라케시",
    mood: "건조한 해질녘",
    note: "모래빛 주황을 깔고 검정을 내린다",
  },
  {
    stem: "11-hongkong",
    name: "홍콩",
    mood: "밤",
    note: "마젠타와 청록을 갈라 넣고 하이라이트를 번지게 한다",
  },
  {
    stem: "12-reykjavik",
    name: "레이캬비크",
    mood: "겨울 흐린 날",
    note: "어둡고 완전히 중립인 회색으로 만든다",
  },
];

/**
 * 열두 가지 색. 순서는 하루와 한 해를 따른다 — 새벽에서 밤으로, 겨울에서 겨울로.
 * 번호를 화면에 찍는 근거가 이 순서다.
 *
 * 이름과 무드의 정본은 `docs/PRD.md` 의 「열두 개의 성격」 표다.
 * **설명은 그 표의 「무엇을 하는가」 열이 아니다.** 그쪽은 조작을 적은 것이고
 * 여기는 사진을 보는 사람이 무엇을 느끼는지를 적는다 — 읽는 자리가 다르다.
 * 값 자체는 여기 없다. 값은 `presets/grade.py` 의 `PRESETS` 가 정본이다.
 */
export type Preset = {
  /** `public/demo/<stem>-before.webp` · `-after.webp` 의 접두 */
  stem: string;
  name: string;
  /** 언제의 빛인가 */
  mood: string;
  /** 그 색이 걸린 사진이 어떤 시간으로 보이는가. 소개 화면이 읽는다 */
  note: string;
};

export const PRESETS: Preset[] = [
  {
    stem: "01-oslo",
    name: "오슬로",
    mood: "겨울 새벽",
    note: "해가 뜨기 직전, 아직 아무도 깨지 않은 시간의 푸른 공기",
  },
  {
    stem: "02-sapporo",
    name: "삿포로",
    mood: "눈 내린 한낮",
    note: "눈에 반사된 빛이 방 안까지 들어오는 맑은 겨울 낮",
  },
  {
    stem: "03-seoul",
    name: "서울",
    mood: "맑은 가을 낮",
    note: "하늘이 유난히 높아 보이는 맑은 가을 낮",
  },
  {
    stem: "04-tokyo",
    name: "도쿄",
    mood: "봄 한낮",
    note: "꽃그늘 아래에서 빛이 한 겹 부드러워지는 봄 한낮",
  },
  {
    stem: "05-santorini",
    name: "산토리니",
    mood: "쨍한 여름",
    note: "눈이 부실 만큼 희고 파란, 한여름 정오",
  },
  {
    stem: "06-lisbon",
    name: "리스본",
    mood: "늦여름 오후",
    note: "해가 낮아지며 모든 것에 금빛이 한 겹 앉는 오후",
  },
  {
    stem: "07-havana",
    name: "하바나",
    mood: "햇빛 강한 오후",
    note: "오래 볕에 둔 사진처럼 색이 바래고 공기가 느슨해진다",
  },
  {
    stem: "08-seattle",
    name: "시애틀",
    mood: "비 오는 흐린 날",
    note: "비 그친 흐린 날의 축축하고 잔잔한 빛",
  },
  {
    stem: "09-paris",
    name: "파리",
    mood: "해질녘",
    note: "노을이 라벤더로 번지고 고운 입자가 내려앉는 저녁",
  },
  {
    stem: "10-marrakesh",
    name: "마라케시",
    mood: "건조한 해질녘",
    note: "모래바람이 지나간 자리에 남은 마른 주황빛 해 질 녘",
  },
  {
    stem: "11-hongkong",
    name: "홍콩",
    mood: "밤",
    note: "간판과 네온이 서로 번지는 도시의 밤",
  },
  {
    stem: "12-reykjavik",
    name: "레이캬비크",
    mood: "겨울 흐린 날",
    note: "색이 거의 지워진, 조용하고 축축한 겨울",
  },
];

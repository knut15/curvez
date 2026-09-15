import data from "../../content/presets.json";

/**
 * 열두 가지 색. 순서는 하루와 한 해를 따른다 — 새벽에서 밤으로, 겨울에서 겨울로.
 * 번호를 화면에 찍는 근거가 이 순서다.
 *
 * **값은 `content/presets.json` 이 정본이다.** 전에는 이 파일에 그대로 적혀 있었는데,
 * 그러면 이름 한 줄을 고치는 데도 저장소를 고치고 배포해야 한다. CMS 가 그 파일을
 * 읽고 쓴다 — 코드는 모양만 정하고 값은 데이터에서 온다.
 *
 * 이름과 무드의 정본은 `docs/PRD.md` 의 「열두 개의 성격」 표다.
 * **설명은 그 표의 「무엇을 하는가」 열이 아니다.** 그쪽은 조작을 적은 것이고
 * 여기는 사진을 보는 사람이 무엇을 느끼는지를 적는다 — 읽는 자리가 다르다.
 * 값 자체는 여기 없다. 값은 `presets/grade.py` 의 `PRESETS` 가 정본이다.
 */
export type Preset = {
  /** `public/demo/<stem>-after.webp` 의 접두이자 이 프리셋의 식별자 */
  stem: string;
  name: string;
  /** 언제의 빛인가 */
  mood: string;
  /** 그 색이 걸린 사진이 어떤 시간으로 보이는가. 소개 화면이 읽는다 */
  note: string;
  /**
   * 보정 전 사진의 주소. **값으로 들고 있다** — 전에는 `stem` 으로 이름을 만들어 썼는데,
   * 그러면 CMS 에서 사진을 바꿀 때 파일 이름을 그대로 덮어써야 하고 그때 브라우저가
   * 옛 그림을 계속 내놓는다.
   */
  before: string;
};

export const PRESETS: Preset[] = data;

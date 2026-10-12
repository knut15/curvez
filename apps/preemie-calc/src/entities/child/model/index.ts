// 아이 프로필, 재태기간, 생후·교정 나이, F13 조합 계산. `today` 는 모두 인자로 받는다.
// entities 안에서 시계를 읽는 것은 ARCH-108 이 막는다.
// 세부 구현은 profile·gestation·ages·combo·share 로 나뉜다(PLC-05). 이 파일은 재수출만
// 하고, 슬라이스 밖에 보이는 공개 이름은 나누기 전과 같다.
export type { Sex, ChildProfile, ProfileDraft } from "./profile";
export { createChildProfile, childDisplayName, validateProfileDraft } from "./profile";

export type { GestationalAge, ProfileErrorCode, ProfileError } from "./gestation";
export { gestationFromDates, dueDateFromGestation } from "./gestation";

export type { CorrectedAge, ChildAges } from "./ages";
export { computeChildAges } from "./ages";

export type { ComboDescription } from "./combo";
export { COMBO_WEEKS, COMBO_MONTHS, describeCombo } from "./combo";

export type { SharePayload } from "./share";
export { encodeShareFragment, decodeShareFragment, validateSharePayload } from "./share";

// 받침 유무에 따라 "로"/"으로" 를 고른다(ㄹ받침은 예외로 "로"). 라이브러리 안내 문구
// ("○○(으)로 바꿨습니다")를 실제 발화 가능한 문장으로 만들 때 쓴다.
// 이름 없는 아이 라벨("아이 1" 등)은 끝 글자가 숫자라, 그 자리의 한국어 숫자 발음 받침도 본다.
const DIGIT_HAS_BATCHIM: Record<string, boolean> = {
  "0": false, // 영
  "1": false, // 일 (ㄹ받침 예외 — "로")
  "2": false, // 이
  "3": true, // 삼
  "4": false, // 사
  "5": false, // 오
  "6": true, // 육
  "7": false, // 칠 (ㄹ받침 예외 — "로")
  "8": false, // 팔 (ㄹ받침 예외 — "로")
  "9": false, // 구
};

const HANGUL_SYLLABLE_START = 0xac00;
const HANGUL_SYLLABLE_END = 0xd7a3;
const RIEUL_FINAL_INDEX = 8; // (code - 0xAC00) % 28 이 8이면 ㄹ받침

export function withLocativeParticle(label: string): string {
  const lastChar = label.trim().at(-1) ?? "";

  if (lastChar in DIGIT_HAS_BATCHIM) {
    return DIGIT_HAS_BATCHIM[lastChar] ? `${label}으로` : `${label}로`;
  }

  const code = lastChar.codePointAt(0) ?? 0;
  if (code < HANGUL_SYLLABLE_START || code > HANGUL_SYLLABLE_END) {
    return `${label}으로`; // 한글 음절도 숫자도 아니면 안전한 기본값
  }

  const finalConsonantIndex = (code - HANGUL_SYLLABLE_START) % 28;
  const hasBatchim = finalConsonantIndex !== 0 && finalConsonantIndex !== RIEUL_FINAL_INDEX;
  return hasBatchim ? `${label}으로` : `${label}로`;
}

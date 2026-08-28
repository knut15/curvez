/**
 * curvez 검증 스크립트 공용 리포터.
 *
 * 모든 검증기가 같은 출력 형식을 쓴다.
 * 이유: 훅(PostToolUse)과 doctor 가 여러 검증기의 출력을 한 화면에 모은다.
 * 형식이 제각각이면 어느 검증기가 무엇을 잡았는지 사람이 읽어낼 수 없다.
 *
 * 출력 규약
 *   FAIL <파일>:<줄> <규칙ID> <메시지>
 *   WARN <파일>:<줄> <규칙ID> <메시지>
 *   요약 한 줄로 통과/실패 개수를 수치로 남긴다.
 *
 * exit code: 오류 1건 이상이면 1, 아니면 0. 경고는 exit code 에 영향을 주지 않는다.
 */

const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const GREEN = "\x1b[32m";
const DIM = "\x1b[2m";
const RESET = "\x1b[0m";

const color = process.env.NO_COLOR ? () => "" : (c) => c;

export class Report {
  constructor(title) {
    this.title = title;
    this.errors = [];
    this.warnings = [];
    this.checked = 0;
    this.passedFiles = new Set();
    this.failedFiles = new Set();
  }

  /** 검사 대상 파일 1개를 등록한다. */
  track(file) {
    this.checked += 1;
    this.passedFiles.add(file);
  }

  error(file, line, rule, message) {
    this.errors.push({ file, line, rule, message });
    this.passedFiles.delete(file);
    this.failedFiles.add(file);
  }

  warn(file, line, rule, message) {
    this.warnings.push({ file, line, rule, message });
  }

  /** 결과를 출력하고 exit code 를 돌려준다. 프로세스를 직접 종료하지 않는다. */
  print(cwd = process.cwd()) {
    const rel = (p) => (p.startsWith(cwd) ? p.slice(cwd.length + 1) : p);

    for (const e of this.errors) {
      const loc = e.line ? `${rel(e.file)}:${e.line}` : rel(e.file);
      console.log(
        `${color(RED)}FAIL${color(RESET)} ${loc} ${color(DIM)}${e.rule}${color(RESET)} ${e.message}`,
      );
    }
    for (const w of this.warnings) {
      const loc = w.line ? `${rel(w.file)}:${w.line}` : rel(w.file);
      console.log(
        `${color(YELLOW)}WARN${color(RESET)} ${loc} ${color(DIM)}${w.rule}${color(RESET)} ${w.message}`,
      );
    }

    const passed = this.passedFiles.size;
    const failed = this.failedFiles.size;
    const mark =
      this.errors.length === 0 ? color(GREEN) + "OK" : color(RED) + "FAILED";
    console.log(
      `${mark}${color(RESET)} ${this.title} — 검사 ${this.checked}건, 통과 ${passed}건, 실패 ${failed}건, 오류 ${this.errors.length}개, 경고 ${this.warnings.length}개`,
    );

    return this.errors.length === 0 ? 0 : 1;
  }
}

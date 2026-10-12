forbidden-words: allow

# preemie-calc 수동 확인 절차

자동 판정이 불가능하다고 판단해 사람이 직접 확인해야 하는 항목이다. `ac-matrix.md` 의 해당
행은 이 문서를 근거 위치로 가리킨다.

## PC-F7-AC4 — 360px 폭 휴대폰에서 카드를 확대하지 않고 숫자를 읽을 수 있다

카드는 브라우저 `<canvas>`(1080×1350px)로 그려진다. 그 안의 숫자는 픽셀이라 문자열로
"읽을 수 있다/없다"를 자동으로 판정할 수 없다(이미지 OCR 은 이번 라운드 지시서가 새 의존성
추가를 금지해 쓸 수 없다). 그래서 이 항목은 판정을 "수동 확인 필요"로 남기고, 근거 자료와
절차만 자동으로 만들어 둔다.

### 근거 자료 만드는 절차 (재현 가능)

1. `pnpm --filter preemie-calc test:e2e -- f7-share.spec.ts` 를 실행해 앱을 띄운 상태에서,
   아래 스크립트로 카드 이미지를 PNG 로 저장한다(Playwright 로 실제 `createShareCardBlob`
   호출 결과를 받는다):

   ```ts
   // 예시: tests/e2e 안에서 page.evaluate 로 카드를 그리고 dataURL 을 받아 저장한다.
   const dataUrl = await page.evaluate(async () => {
     const canvas = document.createElement("canvas");
     canvas.width = 1080;
     canvas.height = 1350;
     // ... ShareCardCanvas.md 사양대로 그린다(features/share-result/lib/share-card-canvas.ts 재사용) ...
     return canvas.toDataURL("image/png");
   });
   const buffer = Buffer.from(dataUrl.split(",")[1], "base64");
   require("node:fs").writeFileSync(".curvez/qa/preemie-calc/evidence/share-card.png", buffer);
   ```

2. `.curvez/qa/preemie-calc/evidence/share-card.png` 를 360 CSS px 폭 화면(배율 3배 축소,
   1080px → 360px)으로 봤을 때 핵심 숫자(96px→32px 상당)의 실제 표시 높이를 계산한다:
   `96px(원본) ÷ 3(축소 배율) = 32px 상당`. `ShareCardCanvas.md` 의 계산과 일치한다.

3. **사람이** 그 PNG 를 실제 휴대폰(또는 360px 로 리사이즈한 뷰어)에서 확대 없이 열어
   숫자가 읽히는지 확인한다. 확대·축소 조작을 전혀 하지 않은 채로 "읽힌다/안 읽힌다"를
   기록한다.

### 판정

이 라운드에서는 위 1~2번(재현 가능한 계산: 96px÷3=32px 상당, tokens.md 최소 본문
크기 17px 보다 크다)까지만 자동으로 확인했다. 3번(실제 사람 눈으로 확인)은 아직 하지
않았다. **판정: 수동 확인 필요.**

---

## (AC ID 아님, 참고) PRD §7 "가입 없이 10초 안에 대시보드를 보여준다"

CONTEXT 가 이 라운드의 수동 확인 목록에 함께 적었지만, 이 문장은 `requirements.md` 의
57개 AC/EX/NF ID 어디에도 없다(PRD §7 원문일 뿐 SPEC 수용 기준으로 옮겨지지 않았다).
그래서 `ac-matrix.md` 에는 행을 만들지 않는다. 참고용으로 확인 절차만 남긴다.

1. `pnpm --filter preemie-calc build && pnpm --filter preemie-calc start` 로 프로덕션
   서버를 띄운다.
2. 사람이 직접 `/` 에서 값을 입력하고 저장 버튼을 누른 시각부터 `/dashboard` 에 첫 결과
   숫자가 보이는 시각까지 스톱워치로 잰다.
3. 10초 이내인지 기록한다(로컬 계산·localStorage 저장뿐이라 통상 1초 미만이 나올 것으로
   예상되지만, 실제 기기·네트워크 조건에서 사람이 확인해야 한다).

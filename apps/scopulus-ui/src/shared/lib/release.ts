import { version } from "@scopulus/ui/package.json";

/**
 * 화면에 보이는 버전. **읽는 곳이 여기 하나다.**
 *
 * 헤더 배지와 랜딩의 eyebrow 가 각자 `package.json` 을 import 하고 있었다. 같은 파일을 읽으니
 * 값은 같지만, 표기(`v0.2.0` / `V0.1.0`)나 접두어를 한쪽만 고치면 두 자리가 어긋난다.
 * 실제로 랜딩이 `v0.1.0` 을 하드코딩한 채 남아 헤더와 달랐다.
 *
 * 붙이는 쪽은 이 값을 그대로 쓴다. `v` 접두어도 여기서 붙인다 — 부르는 쪽마다 붙이면
 * 한쪽이 빠진다.
 *
 * **패키지 이름으로 집는다.** `../../../../../packages/…` 로 올라가면 이 파일이 옮겨질 때
 * 조용히 깨진다. `package.json` 은 그 패키지의 `exports` 에 이미 열려 있다.
 */
export const RELEASE = `v${version}`;

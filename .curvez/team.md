# 팀

## 디자인은 handwork 가 독립으로 갖는다

**`curvez-designer` 를 이 프로젝트에서 쓰지 않는다.** handwork 는 이 사이트만의 값이 필요해
자기 디자인 시스템을 갖고, 그 자산은 전부 `apps/handwork/design/` 아래에 있다.
`.curvez/design/` 은 비어 있고 아무도 쓰지 않는다.

**이유:** curvez 는 특별한 지시가 없을 때 보편적인 화면을 내는 보일러플레이트다. handwork 는
그 보편값으로 설명되지 않는 값을 확정했으므로, 두 층이 서로를 참조하면 어느 쪽이 맞는지
판정할 근거가 사라진다. 디자인 **값**의 의존만 끊는 것이고, curvez 의 오케스트레이션
— 핸드오프 계약 · 팀 실행 · 게이트 절차 — 은 그대로 쓴다.

## 파일 소유권 예외

**`apps/handwork` 는 `curvez-nextjs` 가 `${paths.web}` 로 통째 소유한다.** 디자인 담당 둘이
그 안의 일부를 쓰므로, 겹치는 경로를 여기서 갈라 둔다. 선언이 없으면 병렬 실행에서 나중에 쓴
쪽이 앞선 쪽을 조용히 지운다 — 에러도 로그도 남지 않는다.

| 경로                                 | 소유                     |
| ------------------------------------ | ------------------------ |
| `apps/handwork/design/`              | `handwork-design-system` |
| `apps/handwork/src/shared/ui/`       | `handwork-ui`            |
| `apps/handwork/.storybook/`          | `handwork-ui`            |
| `apps/handwork/src/**/*.stories.tsx` | `handwork-ui`            |
| `apps/handwork/scripts/`             | `handwork-ui`            |
| 위를 제외한 `apps/handwork/` 전부    | `curvez-nextjs`          |

**`curvez-nextjs` 의 코어 정의를 고치지 않았다.**
**이유:** 코어 에이전트의 소유 경로를 바꾸면 이 플러그인을 쓰는 다른 프로젝트의 팀 편성이
아무도 요청하지 않았는데 함께 달라진다. `plugins/curvez/docs/extending.md` 의
"새 에이전트 만들기 4단계" 가 정한 방식대로, 프로젝트 쪽에서만 선언한다.

**검증기는 이 표를 읽지 않는다.** `validate-agents.mjs` 의 겹침 검사는 `owns` 문자열만 본다.
지금 `doctor` 가 통과하는 것은 `${paths.web}` 심볼을 해석하지 않아 겹침이 **보이지 않기**
때문이지, 겹침이 없어서가 아니다. 표의 경계는 사람이 지킨다.

**오케스트레이터는 팀을 짤 때 이 표를 먼저 읽는다.** 여기 없는 경로는 코어 정의를 따른다.

## 편성

아직 라운드가 편성되지 않았다. 디자인 담당 2명은 정의와 산출물이 있고 팀 실행 이력은 없다.

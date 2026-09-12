import { Label } from "./label";

/**
 * 라벨 · 컨트롤 · 설명 · 오류를 한 벌로 묶고 **id 를 이어 준다.**
 *
 * 스펙은 `packages/scopulus-ui/design/components/Field.md` 가 정본이다.
 *
 * 이 컴포넌트가 하는 일은 사실상 하나다 — `id` 에서 `<설명 id>` 와 `<오류 id>` 를 만들고,
 * 그 둘을 `aria-describedby` 로 묶어 컨트롤에 건넨다. 그래서 컨트롤을 **함수 children** 으로
 * 받는다. 부르는 쪽이 받은 것을 그대로 펼친다.
 *
 * ```tsx
 * <Field id="title" label="사례 제목" error="제목을 입력하십시오">
 *   {(control) => <Input {...control} />}
 * </Field>
 * ```
 *
 * **`useId` 를 쓰지 않는다. 그래서 `"use client"` 도 없다.** 이유 둘.
 * 1. `useId` 는 훅이라 `"use client"` 가 붙고, 그러면 폼 필드를 쓰는 화면이 전부 클라이언트
 *    경계 안으로 끌려 들어간다. 값만 배치하는 컴포넌트에 그 비용을 물릴 이유가 없다
 * 2. 만들어진 `id` 는 바깥에서 가리킬 수 없다. 오류 목록에서 필드로 건너뛰는 링크
 *    (`href="#title"`)나 폼 밖의 요약이 그 `id` 를 필요로 한다
 *
 * `React.cloneElement` 로 몰래 prop 을 얹지 않는다. 이유: 부르는 쪽이 준 `aria-describedby` 를
 * 조용히 덮어쓰고, children 이 조각(fragment)이거나 둘 이상일 때 런타임에야 깨진다.
 * 함수 children 은 무엇이 건네지는지가 호출부에 그대로 보인다.
 *
 * **`className` 을 받지 않는다.** 필드끼리의 간격은 필드를 담는 쪽이 정한다.
 */
type FieldControl = {
  id: string;
  "aria-describedby": string | undefined;
  "aria-invalid": true | undefined;
};

export function Field({
  id,
  label,
  description,
  error,
  children,
}: {
  /** 컨트롤의 `id`. 설명·오류의 `id` 가 여기서 파생된다. */
  id: string;
  label: React.ReactNode;
  /** 컨트롤 아래 보조 설명. 없으면 요소를 만들지 않는다. */
  description?: React.ReactNode;
  /** 오류 문구. 있으면 컨트롤이 `aria-invalid` 가 된다. */
  error?: React.ReactNode;
  children: (control: FieldControl) => React.ReactNode;
}) {
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  // 둘 다 있으면 둘 다 읽힌다. 읽는 순서는 이 배열의 순서이고 DOM 순서와 같게 두었다.
  const describedBy =
    [descriptionId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    // `group/field` 는 안쪽 컨트롤이 `disabled` 일 때 라벨을 함께 흐리게 한다.
    // 같은 이름을 `label.tsx` 와 `checkbox.tsx:10` 이 본다.
    <div className="group/field flex w-full flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      {children({
        id,
        "aria-describedby": describedBy,
        "aria-invalid": error ? true : undefined,
      })}
      {description ? (
        <p id={descriptionId} className="text-sm text-muted-foreground">
          {description}
        </p>
      ) : null}
      {/*
        `role="alert"` 을 붙이지 않는다. 이유: 그것은 단호한 라이브 영역이라 화면이 처음
        그려질 때도 읽어 버린다. 오류는 `aria-describedby` 로 이미 이어져 있어 초점이
        컨트롤에 닿는 순간 읽힌다.
      */}
      {error ? (
        <p id={errorId} className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

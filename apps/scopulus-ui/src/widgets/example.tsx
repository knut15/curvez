/**
 * 컴포넌트 원고의 예제 한 덩어리. **소제목 → 프리뷰 → 코드**, 이 셋이 전부다.
 *
 * 설명 문단을 두지 않는다. 왜 그렇게 만들었는지는 `packages/scopulus-ui/design/components/` 의
 * 스펙이 갖는다. 사이트는 무엇이 있고 어떻게 쓰는지만 보여 준다.
 *
 * `code` 와 `children` 이 따로다. 프리뷰는 진짜 컴포넌트를 렌더하고 `code` 는 그것을 적은
 * 문자열이라, 한쪽만 고치면 어긋난다. 고칠 때 둘 다 고친다.
 */
export function Example({
  title,
  code,
  children,
  center = true,
}: {
  title: string;
  code: string;
  children: React.ReactNode;
  /** 프리뷰를 가운데 세운다. 폭을 다 쓰는 예제는 `false`. */
  center?: boolean;
}) {
  return (
    <section className="not-prose my-8">
      <h2 className="text-sm font-medium tracking-tight">{title}</h2>

      <div
        className={`mt-3 flex min-h-28 flex-wrap gap-3 rounded-t-lg border border-border p-6 ${
          center ? "items-center justify-center" : "flex-col"
        }`}
      >
        {children}
      </div>

      <pre className="-mt-px overflow-x-auto rounded-b-lg border border-border bg-muted p-4 text-xs leading-relaxed">
        <code>{code.trim()}</code>
      </pre>
    </section>
  );
}

/**
 * props 참조 표. `remark-gfm` 이 없어 마크다운 표가 글자 그대로 나오므로 컴포넌트로 낸다.
 *
 * 값이 구조로 남는 편이 낫기도 하다 — 원고마다 열이 달라지지 않는다.
 */
export function Props({
  rows,
}: {
  rows: {
    name: string;
    type: string;
    required?: boolean;
    default?: string;
    note?: string;
  }[];
}) {
  return (
    <div className="not-prose my-8 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            {["Prop", "Type", "Default", ""].map((h) => (
              <th
                key={h}
                className="py-2 pr-4 text-xs font-medium tracking-wider text-muted-foreground uppercase"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name} className="border-b border-border align-top">
              <td className="py-2 pr-4 font-mono text-xs whitespace-nowrap">
                {r.name}
                {r.required ? (
                  <span className="ml-1 text-destructive">*</span>
                ) : null}
              </td>
              <td className="py-2 pr-4 font-mono text-xs text-muted-foreground">
                {r.type}
              </td>
              <td className="py-2 pr-4 font-mono text-xs whitespace-nowrap text-muted-foreground">
                {r.default ?? "—"}
              </td>
              <td className="py-2 text-muted-foreground">{r.note ?? ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

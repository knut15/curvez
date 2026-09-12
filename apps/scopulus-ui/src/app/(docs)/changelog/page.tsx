import { readFile } from "node:fs/promises";
import path from "node:path";
import { AppLink, PageTitle, Prose } from "@scopulus/ui";

import { renderMarkdown } from "@/shared/lib/markdown";

export const metadata = {
  title: "Changelog — ScopulusUI",
  description: "버전마다 무엇이 바뀌었는지.",
};

/**
 * 라이브러리의 `CHANGELOG.md` 를 빌드 시점에 읽는다. **사본을 만들지 않는다.**
 *
 * 이유: 사본을 두면 라이브러리 쪽만 고쳐졌을 때 사이트가 낡은 이력을 계속 보여준다.
 * 버전이 `package.json` 과 맞는지는 `scripts/check-version.mjs` 가 따로 본다.
 */
async function readChangelog() {
  const file = path.join(
    process.cwd(),
    "..",
    "..",
    "packages",
    "scopulus-ui",
    "CHANGELOG.md",
  );
  return readFile(file, "utf8");
}

export default async function ChangelogPage() {
  const md = await readChangelog();
  // 첫 h1 은 페이지 제목이 대신한다. 본문에 두 번 나오지 않게 뺀다.
  const body = md.replace(/^#\s.*\n/, "");

  return (
    <>
      <PageTitle description="커밋에서 만들고 게이트가 버전을 대조합니다.">
        Changelog
      </PageTitle>
      <Prose>
        <div dangerouslySetInnerHTML={{ __html: renderMarkdown(body) }} />
      </Prose>
      <p className="mt-10 text-sm text-muted-foreground">
        원본은{" "}
        <AppLink href="https://github.com/knut15/curvez/blob/main/packages/scopulus-ui/CHANGELOG.md">
          packages/scopulus-ui/CHANGELOG.md
        </AppLink>{" "}
        입니다. 이 페이지는 그 파일을 빌드 시점에 읽어 그립니다.
      </p>
    </>
  );
}

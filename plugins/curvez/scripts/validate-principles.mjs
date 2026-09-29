#!/usr/bin/env node
/**
 * 원칙 검증기.
 *
 * 사용법:
 *   node validate-principles.mjs            # 플러그인 principles/ 검사
 *   node validate-principles.mjs <디렉터리>  # 지정한 원칙 디렉터리 검사
 *
 * 원칙 파일 하나하나의 형식과, 인덱스(principles/README.md)와 파일의 1:1 대응을 본다.
 * 인덱스 한 줄과 원칙 파일의 규칙 문장이 같은지도 본다.
 * 이유: 인덱스는 원칙 파일의 요약 사본이다. 사본을 검사하지 않으면 한쪽만 고쳐져
 * 에이전트가 인덱스에서 읽은 규칙과 파일의 규칙이 서로 다른 말을 한다.
 *
 * exit code: 오류 1건 이상이면 1.
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { readMarkdown, findTodoMarkers } from "./lib/frontmatter.mjs";
import { Report } from "./lib/report.mjs";
import {
  PRINCIPLE_REQUIRED_FIELDS,
  PRINCIPLE_REQUIRED_LABELS,
} from "./lib/spec.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PLUGIN_ROOT = resolve(__dirname, "..");

const INDEX_FILE = "README.md";
// - **제목** ([slug](slug.md)) — 언제: <applies_when>. <규칙 문장>
const INDEX_LINE =
  /^- \*\*(.+?)\*\* \(\[([^\]]+)\]\(([^)]+)\)\) — 언제: (.+?)\. (.+)$/;

/** 원칙 파일에서 제목과 규칙 문장(제목 다음의 첫 굵은 문단)을 읽는다. */
function readPrinciple(file, report) {
  const { frontmatter, body, bodyOffset } = readMarkdown(file);
  const slug = basename(file, ".md");

  if (!frontmatter) {
    report.error(
      file,
      1,
      "principle/frontmatter-missing",
      "프론트매터(--- 블록)가 없다.",
    );
    return null;
  }
  for (const field of PRINCIPLE_REQUIRED_FIELDS) {
    if (!frontmatter[field]) {
      report.error(
        file,
        1,
        "principle/field-missing",
        `프론트매터에 \`${field}\` 가 없다.`,
      );
    }
  }
  if (frontmatter.name && frontmatter.name !== slug) {
    report.error(
      file,
      1,
      "principle/name-mismatch",
      `name(${frontmatter.name}) 이 파일 이름(${slug}) 과 다르다.`,
    );
  }

  const bodyLines = body.split("\n");
  const titleIdx = bodyLines.findIndex((l) => l.startsWith("# "));
  if (titleIdx === -1) {
    report.error(
      file,
      bodyOffset + 1,
      "principle/title-missing",
      "`# 제목` 줄이 없다.",
    );
    return null;
  }
  const title = bodyLines[titleIdx].slice(2).trim();

  const ruleLine = bodyLines.slice(titleIdx + 1).find((l) => l.trim() !== "");
  const ruleMatch = ruleLine?.trim().match(/^\*\*(.+)\*\*$/);
  if (!ruleMatch) {
    report.error(
      file,
      bodyOffset + titleIdx + 2,
      "principle/rule-missing",
      "제목 바로 다음 문단이 굵은 규칙 문장(**…**) 이 아니다.",
    );
  }

  for (const label of PRINCIPLE_REQUIRED_LABELS) {
    if (!body.includes(label)) {
      report.error(
        file,
        null,
        "principle/label-missing",
        `\`${label}\` 문단이 없다.`,
      );
    }
  }

  for (const todo of findTodoMarkers(readFileSync(file, "utf8"))) {
    report.error(
      file,
      todo.line,
      "principle/todo-left",
      "`<!-- TODO` 표시가 남아 있다.",
    );
  }

  return {
    slug,
    title,
    appliesWhen: frontmatter.applies_when ?? "",
    rule: ruleMatch ? ruleMatch[1] : null,
  };
}

/** 원칙 파일 밖에서 `principles/<slug>` 로 가리키는 곳이 있는지 본다. */
function findReferences(dir) {
  const corpus = [];
  const walk = (d) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      if (["node_modules", ".git", ".omc", "vendor"].includes(e.name)) continue;
      const full = join(d, e.name);
      if (full === dir) continue;
      if (e.isDirectory()) walk(full);
      else if (/\.(md|mjs|json)$/.test(e.name))
        corpus.push(readFileSync(full, "utf8"));
    }
  };
  walk(PLUGIN_ROOT);
  return (slug) => corpus.some((text) => text.includes(`principles/${slug}`));
}

function main() {
  const dir = resolve(process.argv[2] ?? join(PLUGIN_ROOT, "principles"));
  const report = new Report("원칙 검증");

  if (!existsSync(dir) || !statSync(dir).isDirectory()) {
    console.error(`원칙 디렉터리를 찾을 수 없다: ${dir}`);
    return 2;
  }

  const files = readdirSync(dir)
    .filter((f) => f.endsWith(".md") && f !== INDEX_FILE)
    .map((f) => join(dir, f));

  const principles = new Map();
  for (const file of files) {
    report.track(file);
    const p = readPrinciple(file, report);
    if (p) principles.set(p.slug, { ...p, file });
  }

  const indexPath = join(dir, INDEX_FILE);
  report.track(indexPath);
  if (!existsSync(indexPath)) {
    report.error(
      indexPath,
      null,
      "principle/index-missing",
      "인덱스(README.md) 가 없다.",
    );
    return report.print();
  }

  const seen = new Set();
  readFileSync(indexPath, "utf8")
    .split("\n")
    .forEach((line, i) => {
      if (!line.startsWith("- **")) return;
      const m = line.match(INDEX_LINE);
      if (!m) {
        report.error(
          indexPath,
          i + 1,
          "principle/index-format",
          "인덱스 항목이 정해진 형식이 아니다.",
        );
        return;
      }
      const [, title, slug, link, appliesWhen, rule] = m;
      const p = principles.get(slug);
      if (link !== `${slug}.md`) {
        report.error(
          indexPath,
          i + 1,
          "principle/index-link",
          `링크(${link}) 가 slug(${slug}) 와 맞지 않는다.`,
        );
      }
      if (!p) {
        report.error(
          indexPath,
          i + 1,
          "principle/index-dangling",
          `\`${slug}.md\` 가 없다.`,
        );
        return;
      }
      if (seen.has(slug)) {
        report.error(
          indexPath,
          i + 1,
          "principle/index-duplicate",
          `\`${slug}\` 가 인덱스에 두 번 있다.`,
        );
      }
      seen.add(slug);
      if (title !== p.title) {
        report.error(
          indexPath,
          i + 1,
          "principle/index-title-drift",
          `제목이 원칙 파일(${p.title}) 과 다르다.`,
        );
      }
      if (appliesWhen !== p.appliesWhen) {
        report.error(
          indexPath,
          i + 1,
          "principle/index-when-drift",
          "`언제` 가 원칙 파일의 applies_when 과 다르다.",
        );
      }
      if (p.rule && rule !== p.rule) {
        report.error(
          indexPath,
          i + 1,
          "principle/index-rule-drift",
          "규칙 문장이 원칙 파일과 다르다.",
        );
      }
    });

  const referenced = findReferences(dir);
  for (const [slug, p] of principles) {
    if (!seen.has(slug)) {
      report.error(
        p.file,
        null,
        "principle/not-indexed",
        "인덱스(README.md) 에 없다.",
      );
    }
    if (!referenced(slug)) {
      report.error(
        p.file,
        null,
        "principle/unreferenced",
        `원칙 밖에서 \`principles/${slug}\` 를 가리키는 곳이 없다. 적용되는 경로가 없다.`,
      );
    }
  }

  return report.print();
}

process.exit(main());

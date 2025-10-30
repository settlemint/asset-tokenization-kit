#!/usr/bin/env bun

import { readFile } from "node:fs/promises";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname, extname, relative, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import {
  printErrors,
  scanURLs,
  validateFiles,
  type FileObject,
  type PopulateParams,
  type UrlMeta,
} from "next-validate-link";

const __filename = fileURLToPath(import.meta.url);
const toolsDir = dirname(__filename);
const dappRoot = dirname(toolsDir);
const docsDir = join(dappRoot, "content/docs");
const projectDir = dappRoot;

type DocEntry = {
  path: string;
  splat: string[];
  url: string;
};

interface CheckFileResult {
  description: string;
  firstParagraph: string;
  hasDuplication: boolean;
  similarity: number;
  startsWithHeading: boolean;
  hasTextBeforeHeading: boolean;
}

function extractFrontmatter(content: string): {
  frontmatter: string;
  body: string;
} {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match?.[1] || !match?.[2]) return { frontmatter: "", body: content };
  return { frontmatter: match[1], body: match[2] };
}

function getDescription(frontmatter: string): string {
  const match = frontmatter.match(/^description:\s*["']?([^"'\n]+)["']?$/m);
  return match?.[1]?.trim() ?? "";
}

function getFirstParagraph(body: string): string {
  const trimmed = body.trim();
  let cleaned = trimmed;
  cleaned = cleaned.replace(/^<[A-Z][^>]*\/>\s*/g, "");
  cleaned = cleaned.replace(/^<[A-Z][^>]*>[\s\S]*?<\/[A-Z][^>]*>\s*/g, "");

  const match = cleaned.match(/^([^\n#<]+?)(?:\n\n|$)/);
  return match?.[1]?.trim() ?? "";
}

function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().replace(/[^\w\s]/g, "");
  const s2 = str2.toLowerCase().replace(/[^\w\s]/g, "");

  if (s1 === s2) return 100;
  if (!s1 || !s2) return 0;

  const words1 = s1.split(/\s+/);
  const words2 = s2.split(/\s+/);
  const overlap = words1.filter((w) => words2.includes(w)).length;

  return Math.round((overlap / Math.max(words1.length, words2.length)) * 100);
}

function checkDescriptionDuplication(filePath: string): CheckFileResult | null {
  try {
    const content = readFileSync(filePath, "utf-8");
    const { frontmatter, body } = extractFrontmatter(content);

    if (!frontmatter) return null;

    const description = getDescription(frontmatter);
    const firstParagraph = getFirstParagraph(body);

    const trimmedBody = body.trim();
    const startsWithHeading = /^##\s/.test(trimmedBody);
    const hasTextBeforeHeading =
      !startsWithHeading && firstParagraph.length > 0;

    if (!description) return null;

    const similarity = firstParagraph
      ? calculateSimilarity(description, firstParagraph)
      : 0;
    const hasDuplication = similarity > 60;

    return {
      description,
      firstParagraph,
      hasDuplication,
      similarity,
      startsWithHeading,
      hasTextBeforeHeading,
    };
  } catch {
    return null;
  }
}

function findMdxFiles(dir: string): string[] {
  const files: string[] = [];

  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...findMdxFiles(fullPath));
    } else if (entry.endsWith(".mdx")) {
      files.push(fullPath);
    }
  }

  return files;
}

async function collectFiles(): Promise<{
  files: FileObject[];
  docs: DocEntry[];
}> {
  const glob = new Bun.Glob("**/*.{md,mdx}");
  const files: FileObject[] = [];
  const docs: DocEntry[] = [];

  for await (const relativePath of glob.scan({ cwd: docsDir })) {
    const normalizedPath = toPosix(normalize(relativePath));
    const absolutePath = join(docsDir, normalizedPath);
    const slugs = deriveSlugs(normalizedPath);
    const url = buildUrlFromSlugs(slugs);
    const content = await readFile(absolutePath, "utf8");

    files.push({
      path: absolutePath,
      content,
      url,
    });

    docs.push({
      path: absolutePath,
      splat: slugs,
      url,
    });
  }

  return { files, docs };
}

function deriveSlugs(relativePath: string): string[] {
  const withoutExtension = relativePath.slice(
    0,
    relativePath.length - extname(relativePath).length
  );

  const segments = withoutExtension
    .split("/")
    .filter((segment) => segment.length > 0 && segment !== "index");

  return segments;
}

function buildUrlFromSlugs(slugs: string[]): string {
  return slugs.length === 0 ? "/docs/" : `/docs/${slugs.join("/")}`;
}

function buildPopulate(entries: DocEntry[]): PopulateParams {
  return {
    "docs/[[..._splat]]": entries.map((entry) => ({
      value: entry.splat,
    })),
  };
}

function toPosix(pathname: string): string {
  return pathname.replaceAll("\\", "/");
}

function classifyPathname(pathname: string) {
  if (pathname.startsWith("/")) return "url";
  if (pathname.startsWith(".")) return "relative-file-path";
  if (pathname.endsWith(".md") || pathname.endsWith(".mdx")) {
    return "relative-file-path";
  }
  return "url";
}

async function validateLinks(): Promise<boolean> {
  console.log("\n=== LINK VALIDATION ===\n");

  const { files, docs } = await collectFiles();
  const scanned = await scanURLs({
    preset: "tanstack-start",
    cwd: projectDir,
    populate: buildPopulate(docs),
  });

  const aliases: Array<[string, UrlMeta]> = [];
  for (const [url, meta] of scanned.urls.entries()) {
    if (!url.startsWith("/docs/")) continue;
    const alias = url.slice("/docs".length);
    if (alias.length === 0) continue;
    const normalized = alias.startsWith("/") ? alias : `/${alias}`;
    aliases.push([normalized, meta]);
  }
  for (const [alias, meta] of aliases) {
    if (!scanned.urls.has(alias)) {
      scanned.urls.set(alias, meta);
    }
  }

  const results = await validateFiles(files, {
    scanned,
    checkRelativePaths: "as-url",
    baseUrl: "/docs",
    checkRelativeUrls: false,
    markdown: {
      components: {
        Card: { attributes: ["href"] },
      },
    },
    determinatePathname: classifyPathname,
    pathToUrl: (filePath) => {
      const relativePath = toPosix(relative(docsDir, filePath));
      if (relativePath.startsWith("..")) return undefined;

      return buildUrlFromSlugs(deriveSlugs(relativePath));
    },
  });

  const hasErrors = !results.every((r) => r.errors.length === 0);

  if (hasErrors) {
    printErrors(results, false);
  } else {
    console.log("✅ No broken links found\n");
  }

  return !hasErrors;
}

function checkContentStructure(): boolean {
  console.log("\n=== CONTENT STRUCTURE VALIDATION ===\n");

  const files = findMdxFiles(docsDir);
  console.log(`Checking ${files.length} MDX files...\n`);

  const duplications: Array<{ file: string; result: CheckFileResult }> = [];
  const textBeforeHeading: Array<{ file: string; result: CheckFileResult }> =
    [];

  for (const file of files) {
    const result = checkDescriptionDuplication(file);
    if (!result) continue;

    if (result.hasDuplication) {
      duplications.push({ file, result });
    }
    if (result.hasTextBeforeHeading) {
      textBeforeHeading.push({ file, result });
    }
  }

  let hasErrors = false;

  if (duplications.length === 0) {
    console.log("✅ No description duplication found");
  } else {
    hasErrors = true;
    console.log(
      `❌ Found ${duplications.length} files with description duplication:\n`
    );

    for (const { file, result } of duplications) {
      const relativePath = file.replace(/^.*\/kit\/dapp\/content\/docs\//, "");
      console.log(`  ${relativePath}`);
      console.log(`    Similarity: ${result.similarity}%`);
      console.log(
        `    Description: "${result.description.substring(0, 60)}${result.description.length > 60 ? "..." : ""}"`
      );
      console.log(
        `    First para:  "${result.firstParagraph.substring(0, 60)}${result.firstParagraph.length > 60 ? "..." : ""}"\n`
      );
    }
  }

  if (textBeforeHeading.length === 0) {
    console.log("✅ All files start with H2 heading");
  } else {
    hasErrors = true;
    console.log(
      `❌ Found ${textBeforeHeading.length} files with text before first H2:\n`
    );

    for (const { file, result } of textBeforeHeading) {
      const relativePath = file.replace(/^.*\/kit\/dapp\/content\/docs\//, "");
      console.log(`  ${relativePath}`);
      if (result.hasDuplication) {
        console.log(`    🔴 Also has duplication (${result.similarity}%)`);
      }
      console.log(
        `    Text: "${result.firstParagraph.substring(0, 80)}${result.firstParagraph.length > 80 ? "..." : ""}"\n`
      );
    }
  }

  console.log("\n=== SUMMARY ===");
  console.log(`Total files: ${files.length}`);
  console.log(`Files with duplication: ${duplications.length}`);
  console.log(`Files with text before H2: ${textBeforeHeading.length}`);
  console.log(
    `Files with correct structure: ${files.length - Math.max(duplications.length, textBeforeHeading.length)}\n`
  );

  return !hasErrors;
}

async function main(): Promise<void> {
  console.log("Documentation Linter");
  console.log("===================\n");

  let hasErrors = false;

  try {
    const linksValid = await validateLinks();
    if (!linksValid) hasErrors = true;
  } catch (error) {
    console.error("Link validation error:", error);
    hasErrors = true;
  }

  try {
    const structureValid = checkContentStructure();
    if (!structureValid) hasErrors = true;
  } catch (error) {
    console.error("Structure validation error:", error);
    hasErrors = true;
  }

  if (hasErrors) {
    console.log("\n❌ Documentation linting failed\n");
    process.exit(1);
  }

  console.log("\n✅ All documentation checks passed\n");
}

await main();

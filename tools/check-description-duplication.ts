#!/usr/bin/env bun

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

interface FrontmatterResult {
  description: string;
  firstParagraph: string;
  hasDuplication: boolean;
  similarity: number;
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
  // Remove leading whitespace and get first non-empty paragraph
  const trimmed = body.trim();
  // Skip JSX components like <Banner>, <Tabs>, <Callout>, etc.
  let cleaned = trimmed;
  // Remove self-closing components
  cleaned = cleaned.replace(/^<[A-Z][^>]*\/>\s*/g, "");
  // Remove component blocks
  cleaned = cleaned.replace(/^<[A-Z][^>]*>[\s\S]*?<\/[A-Z][^>]*>\s*/g, "");

  // Get first paragraph (text before first heading or double newline)
  const match = cleaned.match(/^([^\n#<]+?)(?:\n\n|$)/);
  return match?.[1]?.trim() ?? "";
}

function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().replace(/[^\w\s]/g, "");
  const s2 = str2.toLowerCase().replace(/[^\w\s]/g, "");

  if (s1 === s2) return 100;
  if (!s1 || !s2) return 0;

  // Simple word overlap calculation
  const words1 = s1.split(/\s+/);
  const words2 = s2.split(/\s+/);
  const overlap = words1.filter((w) => words2.includes(w)).length;

  return Math.round((overlap / Math.max(words1.length, words2.length)) * 100);
}

interface CheckFileResult {
  description: string;
  firstParagraph: string;
  hasDuplication: boolean;
  similarity: number;
  startsWithHeading: boolean;
  hasTextBeforeHeading: boolean;
}

function checkFile(filePath: string): CheckFileResult | null {
  try {
    const content = readFileSync(filePath, "utf-8");
    const { frontmatter, body } = extractFrontmatter(content);

    if (!frontmatter) return null;

    const description = getDescription(frontmatter);
    const firstParagraph = getFirstParagraph(body);

    // Check if body starts with H2
    const trimmedBody = body.trim();
    const startsWithHeading = /^##\s/.test(trimmedBody);
    const hasTextBeforeHeading =
      !startsWithHeading && firstParagraph.length > 0;

    if (!description) return null;

    const similarity = firstParagraph
      ? calculateSimilarity(description, firstParagraph)
      : 0;
    const hasDuplication = similarity > 60; // Threshold for duplication

    return {
      description,
      firstParagraph,
      hasDuplication,
      similarity,
      startsWithHeading,
      hasTextBeforeHeading,
    };
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
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

const docsDir = "kit/dapp/content/docs";
const files = findMdxFiles(docsDir);

console.log(
  `Checking ${files.length} MDX files for description duplication...\n`
);

const duplications: Array<{ file: string; result: CheckFileResult }> = [];
const textBeforeHeading: Array<{ file: string; result: CheckFileResult }> = [];

for (const file of files) {
  const result = checkFile(file);
  if (!result) continue;

  if (result.hasDuplication) {
    duplications.push({ file, result });
  }
  if (result.hasTextBeforeHeading) {
    textBeforeHeading.push({ file, result });
  }
}

console.log("\n=== DESCRIPTION DUPLICATION ANALYSIS ===\n");

if (duplications.length === 0) {
  console.log("✅ No description duplication found!");
} else {
  console.log(
    `❌ Found ${duplications.length} files with description duplication:\n`
  );

  for (const { file, result } of duplications) {
    const relativePath = file.replace(/^.*\/kit\/dapp\/content\/docs\//, "");
    console.log(`\n📄 ${relativePath}`);
    console.log(`   Similarity: ${result.similarity}%`);
    console.log(
      `   Description: "${result.description.substring(0, 80)}${result.description.length > 80 ? "..." : ""}"`
    );
    console.log(
      `   First para:  "${result.firstParagraph.substring(0, 80)}${result.firstParagraph.length > 80 ? "..." : ""}"`
    );
  }
}

console.log("\n\n=== BODY STRUCTURE ANALYSIS ===\n");

if (textBeforeHeading.length === 0) {
  console.log("✅ All files start with H2 heading (correct structure)!");
} else {
  console.log(
    `⚠️  Found ${textBeforeHeading.length} files with text BEFORE first H2 heading:\n`
  );

  for (const { file, result } of textBeforeHeading) {
    const relativePath = file.replace(/^.*\/kit\/dapp\/content\/docs\//, "");
    console.log(`\n📄 ${relativePath}`);
    if (result.hasDuplication) {
      console.log(`   🔴 DUPLICATION (${result.similarity}%)`);
    }
    console.log(
      `   Text: "${result.firstParagraph.substring(0, 100)}${result.firstParagraph.length > 100 ? "..." : ""}"`
    );
  }
}

console.log(`\n\n=== SUMMARY ===`);
console.log(`Total files checked: ${files.length}`);
console.log(`Files with duplication: ${duplications.length}`);
console.log(`Files with text before H2: ${textBeforeHeading.length}`);
console.log(
  `Files following correct pattern: ${files.length - textBeforeHeading.length}`
);

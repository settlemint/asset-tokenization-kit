#!/usr/bin/env bun

import { readFile } from "node:fs/promises";
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
    const rawContent = await readFile(absolutePath);
    const content =
      typeof rawContent === "string" ? rawContent : rawContent.toString("utf8");

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

async function main(): Promise<void> {
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
    pathToUrl: (filePath: string | URL | Buffer) => {
      const resolvedPath: string = String(filePath);
      const relativePath = toPosix(
        relative(docsDir, resolvedPath as string) as string
      );
      if (relativePath.startsWith("..")) return undefined;

      return buildUrlFromSlugs(deriveSlugs(relativePath));
    },
  });

  printErrors(results, true);
}

await main();

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

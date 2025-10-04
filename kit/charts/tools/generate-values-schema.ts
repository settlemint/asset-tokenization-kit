#!/usr/bin/env bun

import { createLogger, type LogLevel } from "@settlemint/sdk-utils/logging";
import { mkdir, writeFile } from "node:fs/promises";
import { basename, dirname, isAbsolute, join, relative, resolve } from "node:path";
import {
  isMap,
  isScalar,
  isSeq,
  parseDocument,
  type Node,
  type Pair,
  YAMLMap,
  YAMLSeq,
} from "yaml";

import { getKitProjectPath } from "../../../tools/root";

interface JsonSchema {
  $schema?: string;
  title?: string;
  description?: string;
  type?: string | string[];
  properties?: Record<string, JsonSchema>;
  items?: JsonSchema | { anyOf: JsonSchema[] };
  additionalProperties?: boolean | JsonSchema;
  enum?: Array<string | number | boolean | null>;
  anyOf?: JsonSchema[];
  default?: unknown;
}

interface CommentInfo {
  description?: string;
  rawTypeHints: string[];
  rawItemTypeHints: string[];
  rawMapValueTypeHints: string[];
}

const logger = createLogger({
  level: (process.env.SETTLEMINT_LOG_LEVEL as LogLevel) || "info",
});

const typeAlias: Record<string, string> = {
  any: "any",
  bool: "boolean",
  boolean: "boolean",
  float: "number",
  int: "integer",
  integer: "integer",
  number: "number",
  double: "number",
  long: "integer",
  map: "object",
  object: "object",
  dict: "object",
  list: "array",
  array: "array",
  str: "string",
  string: "string",
  text: "string",
  null: "null",
};

const ADDITIONAL_PROPERTY_KEYWORDS = /(annotation|label|selector|affinity|toleration|taint|env|overrides?|extra|custom|headers?|metadata|values|config|options|params|arguments|args|labels)$/i;
const DESCRIPTION_ADDITIONAL_HINT = /(additional|custom|extra|arbitrary|user-defined|override)/i;

interface SchemaContext {
  dependencyKeys: Set<string>;
}

async function findChartsRoot(): Promise<string> {
  const chartsPath = await getKitProjectPath("charts");
  return chartsPath;
}

function stableStringify(value: JsonSchema): string {
  const seen = new WeakSet();
  const replacer = (_key: string, val: unknown) => {
    if (val && typeof val === "object") {
      if (seen.has(val as object)) {
        return "[Circular]";
      }
      seen.add(val as object);
      const ordered: Record<string, unknown> = {};
      for (const key of Object.keys(val as Record<string, unknown>).sort()) {
        (ordered as Record<string, unknown>)[key] = (val as Record<string, unknown>)[key];
      }
      return ordered;
    }
    return val;
  };
  return JSON.stringify(value, replacer);
}

function collectCommentInfo(valueNode?: Node | null, keyNode?: Node | null): CommentInfo {
  const commentChunks: string[] = [];

  const keyHasComment = Boolean(
    keyNode && ((keyNode as any).commentBefore || (keyNode as any).comment)
  );
  const valueIsCollection = Boolean(valueNode && (isMap(valueNode) || isSeq(valueNode)));

  if (
    valueNode &&
    (!valueIsCollection || !keyHasComment)
  ) {
    if ((valueNode as any).commentBefore) {
      commentChunks.push((valueNode as any).commentBefore as string);
    }
    if ((valueNode as any).comment) {
      commentChunks.push((valueNode as any).comment as string);
    }
  }

  if (keyNode) {
    if ((keyNode as any).commentBefore) {
      commentChunks.push((keyNode as any).commentBefore as string);
    }
    if ((keyNode as any).comment) {
      commentChunks.push((keyNode as any).comment as string);
    }
  }

  if (commentChunks.length === 0) {
    return { rawTypeHints: [], rawItemTypeHints: [], rawMapValueTypeHints: [] };
  }

  const merged = commentChunks
    .map(chunk =>
      chunk
        .split("\n")
        .map(line => line.trim())
        .filter(Boolean)
        .join(" ")
    )
    .join(" ")
    .trim();

  if (!merged) {
    return { rawTypeHints: [], rawItemTypeHints: [], rawMapValueTypeHints: [] };
  }

  let description = merged;
  const rawTypeHints: string[] = [];
  const rawItemTypeHints: string[] = [];
  const rawMapValueTypeHints: string[] = [];

  const typeMatch = description.match(/\(([^)]+)\)/);
  if (typeMatch) {
    const raw = typeMatch[1]
      .split(/[|,\/]/)
      .map(token => token.trim())
      .filter(Boolean);

    for (const token of raw) {
      const lower = token.toLowerCase();
      const listMatch = lower.match(/^(?:list|array)(?:[<\(\[]([^)>\]]+)[>\)\]])?$/);
      if (listMatch) {
        rawTypeHints.push("array");
        if (listMatch[1]) {
          rawItemTypeHints.push(listMatch[1].trim());
        }
        continue;
      }

      const mapMatch = lower.match(/^(?:map|dict|object)(?:[<\(\[]([^)>\]]+)[>\)\]])?$/);
      if (mapMatch) {
        rawTypeHints.push("object");
        if (mapMatch[1]) {
          rawMapValueTypeHints.push(mapMatch[1].trim());
        }
        continue;
      }

      rawTypeHints.push(lower);
    }

    description = description.slice(typeMatch.index + typeMatch[0].length).trim();
  }

  if (description.startsWith("--")) {
    description = description.slice(2).trim();
  }

  description = description.replace(/^[\-:\s]+/, "").trim();

  return {
    description: description || undefined,
    rawTypeHints,
    rawItemTypeHints,
    rawMapValueTypeHints,
  };
}

async function getDependencyKeysForChart(chartDir: string): Promise<Set<string>> {
  const chartPath = join(chartDir, "Chart.yaml");
  const chartFile = Bun.file(chartPath);

  if (!(await chartFile.exists())) {
    return new Set();
  }

  try {
    const chartDoc = parseDocument(await chartFile.text());
    const chart = chartDoc.toJS({}) as { dependencies?: Array<Record<string, unknown>> };
    const dependencies = chart?.dependencies;
    if (!Array.isArray(dependencies)) {
      return new Set();
    }

    const keys = new Set<string>();
    for (const dependency of dependencies) {
      if (typeof dependency !== "object" || dependency === null) {
        continue;
      }
      const depAlias = (dependency as Record<string, unknown>).alias;
      const depName = (dependency as Record<string, unknown>).name;

      if (typeof depAlias === "string" && depAlias.length > 0) {
        keys.add(depAlias);
        continue;
      }

      if (typeof depName === "string" && depName.length > 0) {
        keys.add(depName);
      }
    }

    return keys;
  } catch (error) {
    logger.warn(`Failed to parse dependencies from ${chartPath}: ${error}`);
    return new Set();
  }
}

function mapTypeTokens(tokens: string[]): Set<string> {
  const result = new Set<string>();
  for (const token of tokens) {
    const lower = token.toLowerCase();
    const mapped = typeAlias[lower];
    if (!mapped || mapped === "any") {
      continue;
    }
    if (mapped === "integer") {
      result.add("integer");
      continue;
    }
    result.add(mapped);
  }
  return result;
}

function getScalarType(value: unknown): string | undefined {
  if (value === null) {
    return "null";
  }
  if (Array.isArray(value)) {
    return "array";
  }
  switch (typeof value) {
    case "string":
      return "string";
    case "boolean":
      return "boolean";
    case "number":
      return Number.isInteger(value) ? "integer" : "number";
    case "object":
      return "object";
    default:
      return undefined;
  }
}

function mergeTypeSets(existing: Set<string>, incoming: Set<string>): Set<string> {
  const merged = new Set(existing);
  for (const type of incoming) {
    merged.add(type);
  }
  if (merged.has("integer") && merged.has("number")) {
    merged.delete("number");
  }
  return merged;
}

function getKeyName(pair: Pair<Node, Node>): string {
  const keyNode = pair.key;
  if (!keyNode) {
    return "";
  }
  if (isScalar(keyNode) && typeof keyNode.value === "string") {
    return keyNode.value;
  }
  const value = (keyNode as any).toJSON?.();
  if (typeof value === "string") {
    return value;
  }
  return String(value);
}

function shouldAllowAdditionalProperties(
  key: string,
  path: string[],
  info: CommentInfo,
  mapNode: YAMLMap
): boolean {
  if (mapNode.items.length === 0) {
    return true;
  }

  const keyLower = key.toLowerCase();
  if (ADDITIONAL_PROPERTY_KEYWORDS.test(keyLower)) {
    return true;
  }

  if (info.description && DESCRIPTION_ADDITIONAL_HINT.test(info.description)) {
    return true;
  }

  if (info.rawTypeHints.some(token => token === "map")) {
    return true;
  }

  // Allow overrides for deeply nested selectors (e.g., */selector/*)
  if (path.some(segment => /selector|annotations|labels/i.test(segment))) {
    return true;
  }

  return false;
}

function deriveAdditionalPropertiesSchema(
  info: CommentInfo,
  properties: Record<string, JsonSchema>
): boolean | JsonSchema {
  if (info.rawMapValueTypeHints.length > 0) {
    const typeSet = mapTypeTokens(info.rawMapValueTypeHints);
    if (typeSet.size === 1) {
      return { type: [...typeSet][0] };
    }
    if (typeSet.size > 1) {
      return { type: [...typeSet] };
    }
  }

  const propertyTypes = new Set<string>();
  for (const schema of Object.values(properties)) {
    if (!schema.type) {
      return true;
    }
    if (Array.isArray(schema.type)) {
      return true;
    }
    propertyTypes.add(schema.type);
  }

  if (propertyTypes.size === 1) {
    return { type: [...propertyTypes][0] };
  }

  return true;
}

function dedupeSchemas(schemas: JsonSchema[]): JsonSchema[] {
  const unique = new Map<string, JsonSchema>();
  for (const schema of schemas) {
    const key = stableStringify(schema);
    if (!unique.has(key)) {
      unique.set(key, schema);
    }
  }
  return [...unique.values()];
}

function buildSchema(
  node: Node,
  path: string[],
  context: SchemaContext,
  info?: CommentInfo
): JsonSchema {
  if (isMap(node)) {
    return buildObjectSchema(
      node,
      path,
      context,
      info ?? { rawTypeHints: [], rawItemTypeHints: [], rawMapValueTypeHints: [] }
    );
  }
  if (isSeq(node)) {
    return buildArraySchema(
      node,
      path,
      context,
      info ?? { rawTypeHints: [], rawItemTypeHints: [], rawMapValueTypeHints: [] }
    );
  }
  return buildScalarSchema(
    node,
    path,
    context,
    info ?? { rawTypeHints: [], rawItemTypeHints: [], rawMapValueTypeHints: [] }
  );
}

function buildObjectSchema(
  node: YAMLMap,
  path: string[],
  context: SchemaContext,
  info: CommentInfo
): JsonSchema {
  const schema: JsonSchema = {
    type: "object",
    properties: {},
  };

  if (info.description) {
    schema.description = info.description;
  }

  for (const pair of node.items) {
    const key = getKeyName(pair);
    if (!key) {
      continue;
    }
    const childInfo = collectCommentInfo(pair.value, pair.key);
    (schema.properties as Record<string, JsonSchema>)[key] = buildSchema(
      pair.value as Node,
      [...path, key],
      context,
      childInfo
    );
  }

  const currentKey = path[path.length - 1] ?? "_root";
  const isDependencyBranch = path.some(segment => context.dependencyKeys.has(segment));
  const allowAdditional =
    isDependencyBranch ||
    shouldAllowAdditionalProperties(currentKey, path, info, node);

  schema.additionalProperties = allowAdditional
    ? deriveAdditionalPropertiesSchema(info, schema.properties ?? {})
    : false;

  return schema;
}

function buildArraySchema(
  node: YAMLSeq,
  path: string[],
  context: SchemaContext,
  info: CommentInfo
): JsonSchema {
  const schema: JsonSchema = {
    type: "array",
  };

  if (info.description) {
    schema.description = info.description;
  }

  const itemSchemas = node.items.map((item, index) =>
    buildSchema(
      item as Node,
      [...path, String(index)],
      context,
      collectCommentInfo(item as Node)
    )
  );

  if (itemSchemas.length === 0) {
    const hintTypes = mapTypeTokens(info.rawItemTypeHints);
    if (hintTypes.size > 0) {
      const typeArray = [...hintTypes];
      schema.items = typeArray.length === 1 ? { type: typeArray[0] } : { type: typeArray };
    } else {
      schema.items = {};
    }
    return schema;
  }

  const uniqueSchemas = dedupeSchemas(itemSchemas);
  schema.items = uniqueSchemas.length === 1 ? uniqueSchemas[0] : { anyOf: uniqueSchemas };

  return schema;
}

function buildScalarSchema(
  node: Node,
  path: string[],
  _context: SchemaContext,
  info: CommentInfo
): JsonSchema {
  const value = (node as any).toJSON?.();
  const schema: JsonSchema = {};

  if (info.description) {
    schema.description = info.description;
  }

  const hintedTypes = mapTypeTokens(info.rawTypeHints);
  const valueType = getScalarType(value);

  let types = new Set<string>();
  if (hintedTypes.size > 0) {
    types = mergeTypeSets(types, hintedTypes);
  }

  if (valueType) {
    types = mergeTypeSets(types, new Set([valueType]));
  }

  if (value === null) {
    types = mergeTypeSets(types, new Set(["null"]));
  }

  if (types.size === 0) {
    types.add("string");
  }

  const typeArray = [...types];
  schema.type = typeArray.length === 1 ? typeArray[0] : typeArray;

  if (value !== undefined) {
    schema.default = value;
  }

  return schema;
}

async function generateSchema(valuesFile: string, chartsRoot: string, dryRun: boolean): Promise<boolean> {
  const content = await Bun.file(valuesFile).text();
  const document = parseDocument(content, { keepCstNodes: true, keepNodeTypes: true });

  if (!document.contents || !isMap(document.contents)) {
    throw new Error(`Expected root mapping in ${valuesFile}`);
  }

  const chartDir = dirname(valuesFile);
  const dependencyKeys = await getDependencyKeysForChart(chartDir);
  const context: SchemaContext = { dependencyKeys };
  const rootSchema = buildSchema(
    document.contents as YAMLMap,
    [],
    context,
    collectCommentInfo(document.contents as Node)
  );
  const chartName = basename(chartDir);
  const relativePath = relative(chartsRoot, valuesFile);

  const schema: JsonSchema = {
    $schema: "https://json-schema.org/draft-07/schema#",
    title: `${chartName} values`,
    ...rootSchema,
  };

  const outputPath = join(chartDir, "values.schema.json");
  const formatted = `${JSON.stringify(schema, null, 2)}\n`;

  const existingFile = Bun.file(outputPath);
  if (await existingFile.exists()) {
    const existingContent = await existingFile.text();
    if (existingContent === formatted) {
      logger.debug(`No changes for ${relativePath}`);
      return false;
    }
  }

  logger.info(`${dryRun ? "Preview" : "Writing"} schema for ${relativePath}`);

  if (!dryRun) {
    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, formatted, "utf8");
  }

  return true;
}

async function collectValuesFiles(chartsRoot: string, filesFromArgs: string[]): Promise<string[]> {
  if (filesFromArgs.length > 0) {
    return filesFromArgs.map(file => resolve(file));
  }

  const atkRoot = join(chartsRoot, "atk");
  const glob = new Bun.Glob("**/values.yaml");
  const matches: string[] = [];

  for await (const match of glob.scan({ cwd: atkRoot })) {
    if (match.endsWith("values-openshift.yaml")) {
      continue;
    }
    matches.push(resolve(join(atkRoot, match)));
  }

  matches.sort((a, b) => b.split("/").length - a.split("/").length || a.localeCompare(b));
  return matches;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const files: string[] = [];
  let dryRun = false;
  let checkMode = false;

  for (const arg of args) {
    if (arg === "--dry-run") {
      dryRun = true;
      continue;
    }
    if (arg === "--check") {
      checkMode = true;
      dryRun = true;
      continue;
    }
    files.push(arg);
  }

  const chartsRoot = await findChartsRoot();
  const valuesFiles = await collectValuesFiles(chartsRoot, files.map(file => resolve(file)));

  if (valuesFiles.length === 0) {
    logger.warn("No values.yaml files found to process.");
    return;
  }

  logger.info(`Generating schemas for ${valuesFiles.length} values file(s)...`);

  let changes = 0;
  for (const file of valuesFiles) {
    const updated = await generateSchema(file, chartsRoot, dryRun);
    if (updated) {
      changes += 1;
    }
  }

  if (checkMode) {
    if (changes > 0) {
      logger.error(
        `Schema check failed: ${changes} schema(s) would be updated. Run "bun run schema" to regenerate.`
      );
      process.exit(1);
    }

    logger.info("Schema check passed. No schema updates required.");
    return;
  }

  logger.info(
    dryRun
      ? `Dry run completed. ${changes} schema(s) would be updated.`
      : `Schema generation completed with ${changes} file(s) updated.`
  );
}

if (import.meta.main) {
  main().catch(error => {
    logger.error(`Failed to generate values schemas: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  });
}

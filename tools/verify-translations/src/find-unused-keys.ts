import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

function getLeafTranslationKeys(obj: unknown, prefix = ""): string[] {
  const keys: string[] = [];

  if (
    typeof obj === "string" ||
    typeof obj === "number" ||
    typeof obj === "boolean"
  ) {
    if (prefix) {
      keys.push(prefix);
    }
    return keys;
  }

  if (Array.isArray(obj)) {
    obj.forEach((value, index) => {
      const arrayPrefix = prefix ? `${prefix}[${index}]` : `[${index}]`;
      keys.push(...getLeafTranslationKeys(value, arrayPrefix));
    });
    return keys;
  }

  if (typeof obj === "object" && obj !== null) {
    for (const key of Object.keys(obj)) {
      const childPrefix = prefix ? `${prefix}.${key}` : key;
      keys.push(
        ...getLeafTranslationKeys(
          (obj as Record<string, unknown>)[key],
          childPrefix
        )
      );
    }
  }

  return keys;
}

export function findUnusedTranslationKeys(
  baseDir: string,
  usedKeys: Set<string>,
  dynamicNamespaces: Set<string>
): Map<string, string[]> {
  const unusedByFile = new Map<string, string[]>();
  const baseFiles = readdirSync(baseDir).filter((file) =>
    file.endsWith(".json")
  );

  for (const file of baseFiles) {
    const namespace = file.replace(/\.json$/i, "");
    if (dynamicNamespaces.has(namespace)) {
      continue;
    }
    const filePath = join(baseDir, file);
    try {
      const json = JSON.parse(readFileSync(filePath, "utf-8"));
      const keys = getLeafTranslationKeys(json);
      const unusedKeys = keys.filter(
        (key) => !usedKeys.has(`${namespace}:${key}`)
      );
      if (unusedKeys.length > 0) {
        unusedByFile.set(file, unusedKeys.sort());
      }
    } catch (error) {
      // Ignore JSON parsing errors here; they are handled elsewhere in verification.
    }
  }

  return unusedByFile;
}

import { readdirSync, readFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";
import { Node, Project, Symbol as TsSymbol, type CallExpression } from "ts-morph";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ARG_LOCALES_FLAG = "--locales-dir=";
const localesDirArg = process.argv
  .slice(2)
  .find((arg) => arg.startsWith(ARG_LOCALES_FLAG));
const localesDir = localesDirArg
  ? resolve(process.cwd(), localesDirArg.slice(ARG_LOCALES_FLAG.length))
  : join(__dirname, "../kit/dapp/locales");
const baseLang = "en-US";

interface TranslationIssue {
  type:
    | "missing_file"
    | "extra_file"
    | "missing_keys"
    | "extra_keys"
    | "untranslated_strings"
    | "unused_keys";
  file: string;
  language: string;
  details: string[];
}

interface LanguageReport {
  language: string;
  totalFiles: number;
  issues: TranslationIssue[];
  fullyTranslatedFiles: string[];
}

interface VerificationResult {
  baseLanguage: string;
  baseReport: LanguageReport;
  languages: LanguageReport[];
  usedTranslationKeys: string[];
  usedTranslationKeysByNamespace: Record<string, string[]>;
  unusedTranslationKeys: { file: string; keys: string[] }[];
  namespacesWithDynamicUsage: string[];
  summary: {
    totalLanguages: number;
    languagesWithIssues: number;
    totalIssues: number;
    fullyTranslatedLanguages: string[];
    baseLanguageHasIssues: boolean;
  };
}

interface TranslationBinding {
  namespaces: string[];
  keyPrefix?: string;
}

interface UsedTranslationKeys {
  keysByNamespace: Map<string, Set<string>>;
  allKeys: Set<string>;
  array: string[];
  namespacesWithDynamicUsage: Set<string>;
}

function getDefaultNamespace(): string {
  const i18nConfigPath = join(
    __dirname,
    "../kit/dapp/src/lib/i18n/index.ts"
  );

  try {
    const contents = readFileSync(i18nConfigPath, "utf-8");
    const match = contents.match(
      /export\s+const\s+defaultNS\s*=\s*(["'`])([^"'`]+)\1/
    );
    if (match) {
      return match[2];
    }
  } catch (error) {
    // Ignore file read issues and fall back to the known default.
  }

  return "general";
}

function getStringLiteralValue(node: Node): string | undefined {
  if (Node.isStringLiteral(node) || Node.isNoSubstitutionTemplateLiteral(node)) {
    return node.getLiteralText();
  }
  return undefined;
}

function parseNamespaces(
  callExpression: CallExpression,
  defaultNamespace: string
): string[] {
  const args = callExpression.getArguments();
  if (args.length === 0) {
    return [defaultNamespace];
  }

  const firstArg = args[0];
  if (Node.isStringLiteral(firstArg) || Node.isNoSubstitutionTemplateLiteral(firstArg)) {
    return [firstArg.getLiteralText()];
  }

  if (Node.isArrayLiteralExpression(firstArg)) {
    const namespaces: string[] = [];
    for (const element of firstArg.getElements()) {
      const value = getStringLiteralValue(element);
      if (value) {
        namespaces.push(value);
      }
    }
    if (namespaces.length > 0) {
      return namespaces;
    }
  }

  return [defaultNamespace];
}

function parseKeyPrefix(callExpression: CallExpression): string | undefined {
  const args = callExpression.getArguments();
  if (args.length < 2) {
    return undefined;
  }

  const secondArg = args[1];
  if (!Node.isObjectLiteralExpression(secondArg)) {
    return undefined;
  }

  const property = secondArg.getProperty("keyPrefix");
  if (!property) {
    return undefined;
  }

  if (Node.isPropertyAssignment(property)) {
    const initializer = property.getInitializer();
    if (initializer) {
      const value = getStringLiteralValue(initializer);
      if (value) {
        return value;
      }
    }
  }

  return undefined;
}

function collectUsedTranslationKeys(): UsedTranslationKeys {
  const project = new Project({
    tsConfigFilePath: join(__dirname, "../kit/dapp/tsconfig.json"),
    skipAddingFilesFromTsConfig: false,
  });

  const defaultNamespace = getDefaultNamespace();
  const keysByNamespace = new Map<string, Set<string>>();
  const allKeys = new Set<string>();
  const namespacesWithDynamicUsage = new Set<string>();

  const addKey = (namespace: string, key: string) => {
    if (!namespace || !key) {
      return;
    }
    const formattedKey = `${namespace}:${key}`;
    allKeys.add(formattedKey);
    if (!keysByNamespace.has(namespace)) {
      keysByNamespace.set(namespace, new Set());
    }
    keysByNamespace.get(namespace)!.add(key);
  };

  const markDynamicUsage = (binding: TranslationBinding) => {
    for (const namespace of binding.namespaces) {
      if (namespace) {
        namespacesWithDynamicUsage.add(namespace);
      }
    }
  };

  const useTranslationBindings = new Map<CallExpression, TranslationBinding>();
  const functionBindings = new Map<TsSymbol, TranslationBinding>();
  const objectBindings = new Map<TsSymbol, TranslationBinding>();

  for (const sourceFile of project.getSourceFiles()) {
    const importDeclarations = sourceFile
      .getImportDeclarations()
      .filter((declaration) => declaration.getModuleSpecifierValue() === "react-i18next");

    if (importDeclarations.length === 0) {
      continue;
    }

    const useTranslationAliases = new Set<string>();
    for (const declaration of importDeclarations) {
      for (const namedImport of declaration.getNamedImports()) {
        if (namedImport.getName() === "useTranslation") {
          const alias = namedImport.getAliasNode()?.getText() ?? namedImport.getName();
          useTranslationAliases.add(alias);
        }
      }
    }

    if (useTranslationAliases.size === 0) {
      continue;
    }

    const ensureBinding = (callExpression: CallExpression): TranslationBinding => {
      let binding = useTranslationBindings.get(callExpression);
      if (!binding) {
        binding = {
          namespaces: parseNamespaces(callExpression, defaultNamespace),
          keyPrefix: parseKeyPrefix(callExpression),
        };
        useTranslationBindings.set(callExpression, binding);
      }
      return binding;
    };

    // First pass: gather bindings from direct useTranslation calls
    sourceFile.forEachDescendant((node) => {
      if (!Node.isCallExpression(node)) {
        return;
      }

      const expression = node.getExpression();
      if (!Node.isIdentifier(expression)) {
        return;
      }

      if (!useTranslationAliases.has(expression.getText())) {
        return;
      }

      const binding = ensureBinding(node);
      const parent = node.getParent();

      if (Node.isVariableDeclaration(parent)) {
        const nameNode = parent.getNameNode();
        if (Node.isObjectBindingPattern(nameNode)) {
          for (const element of nameNode.getElements()) {
            const propertyNameNode = element.getPropertyNameNode();
            const isTProperty =
              propertyNameNode?.getText() === "t" ||
              (!propertyNameNode && element.getName() === "t");

            if (!isTProperty) {
              continue;
            }

            const nameIdentifier = element.getNameNode();
            if (Node.isIdentifier(nameIdentifier)) {
              const symbol = nameIdentifier.getSymbol();
              if (symbol) {
                functionBindings.set(symbol, binding);
              }
            }
          }
        } else if (Node.isIdentifier(nameNode)) {
          const symbol = nameNode.getSymbol();
          if (symbol) {
            objectBindings.set(symbol, binding);
          }
        }
      }
    });

    // Second pass: destructuring from previously stored translation objects
    sourceFile.forEachDescendant((node) => {
      if (!Node.isVariableDeclaration(node)) {
        return;
      }

      const initializer = node.getInitializer();
      if (!initializer || !Node.isIdentifier(initializer)) {
        return;
      }

      const initializerSymbol = initializer.getSymbol();
      if (!initializerSymbol) {
        return;
      }

      const binding = objectBindings.get(initializerSymbol);
      if (!binding) {
        return;
      }

      const nameNode = node.getNameNode();
      if (!Node.isObjectBindingPattern(nameNode)) {
        return;
      }

      for (const element of nameNode.getElements()) {
        const propertyNameNode = element.getPropertyNameNode();
        const isTProperty =
          propertyNameNode?.getText() === "t" ||
          (!propertyNameNode && element.getName() === "t");

        if (!isTProperty) {
          continue;
        }

        const nameIdentifier = element.getNameNode();
        if (Node.isIdentifier(nameIdentifier)) {
          const symbol = nameIdentifier.getSymbol();
          if (symbol) {
            functionBindings.set(symbol, binding);
          }
        }
      }
    });

    const recordUsedKey = (binding: TranslationBinding, rawKey: string) => {
      let namespace: string | undefined;
      let key = rawKey;
      const colonIndex = rawKey.indexOf(":");

      if (colonIndex >= 0) {
        namespace = rawKey.slice(0, colonIndex);
        key = rawKey.slice(colonIndex + 1);
      }

      if (!namespace) {
        const prefixedKey = binding.keyPrefix
          ? `${binding.keyPrefix}.${key}`
          : key;
        for (const ns of binding.namespaces) {
          addKey(ns, prefixedKey);
        }
        return;
      }

      addKey(namespace, key);
    };

    sourceFile.forEachDescendant((node) => {
      if (!Node.isCallExpression(node)) {
        return;
      }

      const expression = node.getExpression();

      if (Node.isIdentifier(expression)) {
        const symbol = expression.getSymbol();
        if (!symbol) {
          return;
        }
        const binding = functionBindings.get(symbol);
        if (!binding) {
          return;
        }
        const firstArg = node.getArguments()[0];
        if (!firstArg) {
          markDynamicUsage(binding);
          return;
        }
        const key = getStringLiteralValue(firstArg);
        if (key) {
          recordUsedKey(binding, key);
        } else {
          markDynamicUsage(binding);
        }
        return;
      }

      if (Node.isPropertyAccessExpression(expression)) {
        if (expression.getName() !== "t") {
          return;
        }

        const innerExpression = expression.getExpression();
        if (Node.isIdentifier(innerExpression)) {
          const symbol = innerExpression.getSymbol();
          if (!symbol) {
            return;
          }
          const binding = objectBindings.get(symbol);
          if (!binding) {
            return;
          }
          const firstArg = node.getArguments()[0];
          if (!firstArg) {
            markDynamicUsage(binding);
            return;
          }
          const key = getStringLiteralValue(firstArg);
          if (key) {
            recordUsedKey(binding, key);
          } else {
            markDynamicUsage(binding);
          }
          return;
        }

        if (Node.isCallExpression(innerExpression)) {
          const innerCallExpr = innerExpression;
          const innerCallee = innerCallExpr.getExpression();
          if (Node.isIdentifier(innerCallee)) {
            if (!useTranslationAliases.has(innerCallee.getText())) {
              return;
            }
            const binding = ensureBinding(innerCallExpr);
            const firstArg = node.getArguments()[0];
            if (!firstArg) {
              markDynamicUsage(binding);
              return;
            }
            const key = getStringLiteralValue(firstArg);
            if (key) {
              recordUsedKey(binding, key);
            } else {
              markDynamicUsage(binding);
            }
          }
        }
      }
    });
  }

  return {
    keysByNamespace,
    allKeys,
    array: Array.from(allKeys).sort(),
    namespacesWithDynamicUsage,
  };
}

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
      keys.push(...getLeafTranslationKeys((obj as Record<string, unknown>)[key], childPrefix));
    }
  }

  return keys;
}

function findUnusedTranslationKeys(
  baseDir: string,
  usedKeys: Set<string>,
  dynamicNamespaces: Set<string>
): Map<string, string[]> {
  const unusedByFile = new Map<string, string[]>();
  const baseFiles = readdirSync(baseDir).filter((file) => file.endsWith(".json"));

  for (const file of baseFiles) {
    const namespace = file.replace(/\.json$/i, "");
    if (dynamicNamespaces.has(namespace)) {
      continue;
    }
    const filePath = join(baseDir, file);
    try {
      const json = JSON.parse(readFileSync(filePath, "utf-8"));
      const keys = getLeafTranslationKeys(json);
      const unusedKeys = keys.filter((key) => !usedKeys.has(`${namespace}:${key}`));
      if (unusedKeys.length > 0) {
        unusedByFile.set(file, unusedKeys.sort());
      }
    } catch (error) {
      // Ignore JSON parsing errors here; they are handled elsewhere in verification.
    }
  }

  return unusedByFile;
}

function getAllKeys(obj: any, prefix = ""): string[] {
  const keys: string[] = [];
  if (typeof obj === "object" && obj !== null) {
    for (const key in obj) {
      keys.push(prefix + key);
      keys.push(...getAllKeys(obj[key], prefix + key + "."));
    }
  }
  return keys;
}

function isSkippableString(value: string): boolean {
  if (typeof value !== "string") {
    return false;
  }

  const trimmed = value.trim();

  if (trimmed === "") {
    return true;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return true;
  }

  if (trimmed.startsWith("/")) {
    return true;
  }

  if (trimmed.startsWith("@")) {
    return true;
  }

  if (/^[A-Za-z0-9]+(?:_[A-Za-z0-9]+)+$/.test(trimmed)) {
    return true;
  }

  const withoutPlaceholders = value
    .replace(/\{\{[^}]+\}\}/g, "")
    .replace(/\[[^\]]+\]/g, "");

  const cleaned = withoutPlaceholders.replace(/[%@#^&*()_=+~`<>/"'.,:;!?\\-]/g, "").trim();

  return cleaned === "" || !/\p{L}/u.test(cleaned);
}

function keysMatch(
  enObj: any,
  otherObj: any
): { match: boolean; missingInOther: string[]; extraInOther: string[] } {
  const enKeys = getAllKeys(enObj);
  const otherKeys = getAllKeys(otherObj);
  const missingInOther = enKeys.filter((k) => !otherKeys.includes(k));
  const extraInOther = otherKeys.filter((k) => !enKeys.includes(k));
  return {
    match: missingInOther.length === 0 && extraInOther.length === 0,
    missingInOther,
    extraInOther,
  };
}

function countUntranslated(
  enObj: any,
  otherObj: any,
  prefix = ""
): { count: number; paths: string[] } {
  let count = 0;
  const paths: string[] = [];
  if (typeof enObj === "string" && typeof otherObj === "string") {
    // Allow identical strings across locales; some translations are intentionally the same.
    return { count, paths };
  } else if (Array.isArray(enObj) && Array.isArray(otherObj)) {
    // For arrays, check each element
    for (let i = 0; i < enObj.length; i++) {
      if (i < otherObj.length) {
        const res = countUntranslated(enObj[i], otherObj[i], `${prefix}[${i}]`);
        count += res.count;
        paths.push(...res.paths);
      }
    }
  } else if (
    typeof enObj === "object" &&
    enObj !== null &&
    typeof otherObj === "object" &&
    otherObj !== null
  ) {
    for (const key in enObj) {
      if (otherObj.hasOwnProperty(key)) {
        const res = countUntranslated(
          enObj[key],
          otherObj[key],
          prefix ? `${prefix}.${key}` : key
        );
        count += res.count;
        paths.push(...res.paths);
      }
    }
  }
  return { count, paths };
}

function verifyLanguage(
  baseDir: string,
  langDir: string,
  language: string
): LanguageReport {
  const baseFiles = readdirSync(baseDir).filter((f) => f.endsWith(".json"));
  const langFiles = readdirSync(langDir).filter((f) => f.endsWith(".json"));

  const issues: TranslationIssue[] = [];
  const fullyTranslatedFiles: string[] = [];

  // Check for missing files
  const missingFiles = baseFiles.filter((f) => !langFiles.includes(f));
  if (missingFiles.length > 0) {
    issues.push({
      type: "missing_file",
      file: "",
      language,
      details: missingFiles,
    });
  }

  // Check for extra files
  const extraFiles = langFiles.filter((f) => !baseFiles.includes(f));
  if (extraFiles.length > 0) {
    issues.push({
      type: "extra_file",
      file: "",
      language,
      details: extraFiles,
    });
  }

  // Check each file that exists in both
  for (const file of baseFiles) {
    if (!langFiles.includes(file)) continue;

    const basePath = join(baseDir, file);
    const langPath = join(langDir, file);

    try {
      const baseJson = JSON.parse(readFileSync(basePath, "utf-8"));
      const langJson = JSON.parse(readFileSync(langPath, "utf-8"));

      const { match, missingInOther, extraInOther } = keysMatch(
        baseJson,
        langJson
      );

      if (!match) {
        if (missingInOther.length > 0) {
          issues.push({
            type: "missing_keys",
            file,
            language,
            details: missingInOther,
          });
        }
        if (extraInOther.length > 0) {
          issues.push({
            type: "extra_keys",
            file,
            language,
            details: extraInOther,
          });
        }
      } else {
        const { count: untranslated, paths } = countUntranslated(
          baseJson,
          langJson
        );
        if (untranslated > 0) {
          issues.push({
            type: "untranslated_strings",
            file,
            language,
            details: paths,
          });
        } else {
          fullyTranslatedFiles.push(file);
        }
      }
    } catch (e) {
      issues.push({
        type: "missing_keys",
        file,
        language,
        details: [`Error reading ${file}: ${e}`],
      });
    }
  }

  return {
    language,
    totalFiles: baseFiles.length,
    issues,
    fullyTranslatedFiles,
  };
}

function main(): VerificationResult {
  const baseDir = join(localesDir, baseLang);
  const usedTranslations = collectUsedTranslationKeys();
  const usedTranslationsByNamespace = Object.fromEntries(
    Array.from(usedTranslations.keysByNamespace.entries()).map(([namespace, keys]) => [
      namespace,
      Array.from(keys).sort(),
    ])
  );
  const baseReport = verifyLanguage(baseDir, baseDir, baseLang);
  const unusedByFile = findUnusedTranslationKeys(
    baseDir,
    usedTranslations.allKeys,
    usedTranslations.namespacesWithDynamicUsage
  );
  const unusedTranslationKeys = Array.from(unusedByFile.entries()).map(
    ([file, keys]) => ({ file, keys })
  );

  for (const { file, keys } of unusedTranslationKeys) {
    baseReport.issues.push({
      type: "unused_keys",
      file,
      language: baseLang,
      details: keys,
    });
  }

  const languageDirs = readdirSync(localesDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory() && dirent.name !== baseLang)
    .map((dirent) => dirent.name);

  const languages: LanguageReport[] = [];

  for (const lang of languageDirs) {
    const langDir = join(localesDir, lang);
    languages.push(verifyLanguage(baseDir, langDir, lang));
  }

  const languagesWithIssuesCount =
    languages.filter((lang) => lang.issues.length > 0).length +
    (baseReport.issues.length > 0 ? 1 : 0);

  const fullyTranslatedLanguages = languages
    .filter((lang) => lang.issues.length === 0)
    .map((lang) => lang.language);

  const totalIssues =
    languages.reduce((sum, lang) => sum + lang.issues.length, 0) +
    baseReport.issues.length;

  const result: VerificationResult = {
    baseLanguage: baseLang,
    baseReport,
    languages,
    usedTranslationKeys: usedTranslations.array,
    usedTranslationKeysByNamespace: usedTranslationsByNamespace,
    unusedTranslationKeys,
    namespacesWithDynamicUsage: Array.from(
      usedTranslations.namespacesWithDynamicUsage
    ).sort(),
    summary: {
      totalLanguages: languageDirs.length,
      languagesWithIssues: languagesWithIssuesCount,
      totalIssues,
      fullyTranslatedLanguages,
      baseLanguageHasIssues: baseReport.issues.length > 0,
    },
  };

  // Output JSON for LLM processing
  console.log(JSON.stringify(result, null, 2));

  // Also output human-readable summary
  console.log("\n=== SUMMARY ===");
  console.log(`Base language: ${baseLang}`);
  console.log(
    `Total languages checked (excluding base): ${result.summary.totalLanguages}`
  );
  console.log(
    `Languages with issues (including base): ${result.summary.languagesWithIssues}`
  );
  console.log(`Total issues found: ${result.summary.totalIssues}`);
  if (result.summary.fullyTranslatedLanguages.length > 0) {
    console.log(
      `Fully translated languages: ${result.summary.fullyTranslatedLanguages.join(", ")}`
    );
  }
  if (unusedTranslationKeys.length > 0) {
    console.log("Unused translation keys detected:");
    for (const { file, keys } of unusedTranslationKeys) {
      console.log(`  ${file}: ${keys.join(", ")}`);
    }
  }
  if (usedTranslations.namespacesWithDynamicUsage.size > 0) {
    console.log("Namespaces skipped for unused-key detection due to dynamic usage:");
    for (const namespace of result.namespacesWithDynamicUsage) {
      console.log(`  ${namespace}`);
    }
  }

  // Exit with error code if there are issues
  if (result.summary.totalIssues > 0) {
    process.exit(1);
  }

  return result;
}

if (process.argv[1] === __filename) {
  void main();
}

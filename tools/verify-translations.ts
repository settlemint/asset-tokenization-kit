import { readdirSync, readFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

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
    | "untranslated_strings";
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
  languages: LanguageReport[];
  summary: {
    totalLanguages: number;
    languagesWithIssues: number;
    totalIssues: number;
    fullyTranslatedLanguages: string[];
  };
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
    if (enObj === otherObj && enObj.trim() !== "" && !isSkippableString(enObj)) {
      count++;
      paths.push(prefix);
    }
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
  const languageDirs = readdirSync(localesDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory() && dirent.name !== baseLang)
    .map((dirent) => dirent.name);

  const languages: LanguageReport[] = [];

  for (const lang of languageDirs) {
    const langDir = join(localesDir, lang);
    languages.push(verifyLanguage(baseDir, langDir, lang));
  }

  const languagesWithIssues = languages.filter(
    (lang) => lang.issues.length > 0
  );
  const fullyTranslatedLanguages = languages
    .filter((lang) => lang.issues.length === 0)
    .map((lang) => lang.language);

  const result: VerificationResult = {
    baseLanguage: baseLang,
    languages,
    summary: {
      totalLanguages: languages.length,
      languagesWithIssues: languagesWithIssues.length,
      totalIssues: languages.reduce((sum, lang) => sum + lang.issues.length, 0),
      fullyTranslatedLanguages,
    },
  };

  // Output JSON for LLM processing
  console.log(JSON.stringify(result, null, 2));

  // Also output human-readable summary
  console.log("\n=== SUMMARY ===");
  console.log(`Base language: ${baseLang}`);
  console.log(`Total languages checked: ${result.summary.totalLanguages}`);
  console.log(`Languages with issues: ${result.summary.languagesWithIssues}`);
  console.log(`Total issues found: ${result.summary.totalIssues}`);
  if (result.summary.fullyTranslatedLanguages.length > 0) {
    console.log(
      `Fully translated languages: ${result.summary.fullyTranslatedLanguages.join(", ")}`
    );
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

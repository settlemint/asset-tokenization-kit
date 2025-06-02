import { findTurboRoot } from "./root";

interface VersionInfo {
  tag: "latest" | "main" | "pr";
  version: string;
}

interface VersionParams {
  refSlug?: string;
  refName?: string;
  shaShort?: string;
  startPath?: string;
}

interface PackageJson {
  version: string;
  [key: string]: unknown;
}

/**
 * Gets version and tag information based on Git ref information
 * @param params - Configuration object with Git ref information
 * @returns Object containing version and tag
 */
export async function getVersionInfo(
  params: VersionParams = {}
): Promise<VersionInfo> {
  const {
    refSlug = process.env.GITHUB_REF_SLUG || "",
    refName = process.env.GITHUB_REF_NAME || "",
    shaShort = process.env.GITHUB_SHA_SHORT || "",
    startPath,
  } = params;

  // Find the monorepo root and get the package.json from there
  const { monorepoRoot } = await findTurboRoot(startPath);
  const packageJsonFile = Bun.file(`${monorepoRoot}/package.json`);

  if (!(await packageJsonFile.exists())) {
    throw new Error(`Package.json not found at ${monorepoRoot}/package.json`);
  }

  const packageJson = (await packageJsonFile.json()) as PackageJson;
  const oldVersion = packageJson.version;

  if (!oldVersion) {
    throw new Error("No version found in package.json");
  }

  // Check if ref slug matches version pattern (v?[0-9]+\.[0-9]+\.[0-9]+$)
  const versionPattern = /^v?[0-9]+\.[0-9]+\.[0-9]+$/;

  if (versionPattern.test(refSlug)) {
    // Remove 'v' prefix if present
    const version = refSlug.replace(/^v/, "");
    return {
      tag: "latest",
      version,
    };
  }

  if (refName === "main") {
    const version = `${oldVersion}-main${shaShort.replace(/^v/, "")}`;
    return {
      tag: "main",
      version,
    };
  }

  // Default case (PR or other branches)
  const version = `${oldVersion}-pr${shaShort.replace(/^v/, "")}`;
  return {
    tag: "pr",
    version,
  };
}

/**
 * Gets version info and logs the result (useful for CI/CD)
 * @param params - Configuration object with Git ref information
 * @returns Object containing version and tag with console output
 */
export async function getVersionInfoWithLogging(
  params: VersionParams = {}
): Promise<VersionInfo> {
  const result = await getVersionInfo(params);

  console.log(`TAG=${result.tag}`);
  console.log(`VERSION=${result.version}`);

  return result;
}

/**
 * Alternative async version that uses Bun's text() method instead of json()
 * @param params - Configuration object with Git ref information
 * @returns Object containing version and tag
 */
export async function getVersionInfoText(
  params: VersionParams = {}
): Promise<VersionInfo> {
  const {
    refSlug = process.env.GITHUB_REF_SLUG || "",
    refName = process.env.GITHUB_REF_NAME || "",
    shaShort = process.env.GITHUB_SHA_SHORT || "",
    startPath,
  } = params;

  // Find the monorepo root and get the package.json from there
  const { monorepoRoot } = await findTurboRoot(startPath);
  const packageJsonFile = Bun.file(`${monorepoRoot}/package.json`);
  const packageJsonText = await packageJsonFile.text();
  const packageJson = JSON.parse(packageJsonText) as PackageJson;
  const oldVersion = packageJson.version;

  if (!oldVersion) {
    throw new Error("No version found in package.json");
  }

  // Check if ref slug matches version pattern (v?[0-9]+\.[0-9]+\.[0-9]+$)
  const versionPattern = /^v?[0-9]+\.[0-9]+\.[0-9]+$/;

  if (versionPattern.test(refSlug)) {
    // Remove 'v' prefix if present
    const version = refSlug.replace(/^v/, "");
    return {
      tag: "latest",
      version,
    };
  }

  if (refName === "main") {
    const version = `${oldVersion}-main${shaShort.replace(/^v/, "")}`;
    return {
      tag: "main",
      version,
    };
  }

  // Default case (PR or other branches)
  const version = `${oldVersion}-pr${shaShort.replace(/^v/, "")}`;
  return {
    tag: "pr",
    version,
  };
}

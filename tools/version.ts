#!/usr/bin/env bun

import { Glob } from "bun";
import { relative } from "path";
import { parse, stringify } from "yaml";
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

/**
 * Updates all package.json files in the workspace with the new version using glob pattern
 * Also replaces "workspace:*" references with the actual version
 * @param startPath - Starting path for finding package.json files (defaults to current working directory)
 * @returns Promise that resolves when all updates are complete
 */
export async function updatePackageVersion(startPath?: string): Promise<void> {
  const { Glob } = await import("bun");

  try {
    // Get the current version info
    const versionInfo = await getVersionInfo({ startPath });
    const newVersion = versionInfo.version;

    console.log(`Updating all package.json files to version: ${newVersion}`);

    // Find all package.json files in the workspace, excluding node_modules
    const glob = new Glob("**/package.json");
    const packageFiles: string[] = [];

    for await (const file of glob.scan(startPath || ".")) {
      // Skip files in node_modules and kit/contracts/dependencies directories
      if (
        file.includes("node_modules/") ||
        file.includes("kit/contracts/dependencies/")
      ) {
        continue;
      }
      packageFiles.push(file);
    }

    if (packageFiles.length === 0) {
      console.warn("No package.json files found");
      return;
    }

    console.log(`Found ${packageFiles.length} package.json files:`);

    let updatedCount = 0;

    for (const packagePath of packageFiles) {
      try {
        console.log(`  Processing: ${packagePath}`);

        // Read the current package.json file
        const packageJsonFile = Bun.file(packagePath);
        if (!(await packageJsonFile.exists())) {
          console.warn(`    Skipping: File does not exist`);
          continue;
        }

        const packageJson = (await packageJsonFile.json()) as PackageJson;

        if (!packageJson.version) {
          console.warn(`    Skipping: No version field found`);
          continue;
        }

        const oldVersion = packageJson.version;
        let hasChanges = false;

        // Update the main version
        packageJson.version = newVersion;
        hasChanges = true;

        // Helper function to update workspace dependencies
        const updateWorkspaceDependencies = (
          deps: Record<string, string> | undefined,
          depType: string
        ): number => {
          if (!deps) return 0;

          let workspaceCount = 0;
          for (const [depName, depVersion] of Object.entries(deps)) {
            if (depVersion === "workspace:*") {
              deps[depName] = newVersion;
              workspaceCount++;
              hasChanges = true;
            }
          }

          if (workspaceCount > 0) {
            console.log(
              `    Updated ${workspaceCount} workspace:* references in ${depType}`
            );
          }

          return workspaceCount;
        };

        // Update workspace dependencies in all dependency types
        const workspaceUpdates = [
          updateWorkspaceDependencies(
            packageJson.dependencies as Record<string, string>,
            "dependencies"
          ),
          updateWorkspaceDependencies(
            packageJson.devDependencies as Record<string, string>,
            "devDependencies"
          ),
          updateWorkspaceDependencies(
            packageJson.peerDependencies as Record<string, string>,
            "peerDependencies"
          ),
          updateWorkspaceDependencies(
            packageJson.optionalDependencies as Record<string, string>,
            "optionalDependencies"
          ),
        ];

        const totalWorkspaceUpdates = workspaceUpdates.reduce(
          (sum, count) => sum + count,
          0
        );

        if (hasChanges) {
          // Write the updated package.json back to disk
          await Bun.write(
            packagePath,
            JSON.stringify(packageJson, null, 2) + "\n"
          );

          console.log(`    Updated version: ${oldVersion} -> ${newVersion}`);
          if (totalWorkspaceUpdates > 0) {
            console.log(
              `    Updated ${totalWorkspaceUpdates} total workspace:* references`
            );
          }
          updatedCount++;
        } else {
          console.log(`    No changes needed`);
        }
      } catch (error) {
        console.error(`    Error processing ${packagePath}:`, error);
      }
    }

    console.log(`\nSuccessfully updated ${updatedCount} package.json files`);
  } catch (error) {
    console.error("Failed to update package versions:", error);
    process.exit(1);
  }
}

interface ChartYaml {
  version: string;
  appVersion: string;
  [key: string]: unknown;
}

/**
 * Updates all Chart.yaml files in the ATK directory with the current version
 */
async function updateChartVersions(): Promise<void> {
  try {
    // Get the current version info
    const versionInfo = await getVersionInfo();
    const newVersion = versionInfo.version;

    console.log(`Updating charts to version: ${newVersion}`);

    // Find all Chart.yaml files in the ATK directory
    const glob = new Glob("kit/charts/**/Chart.yaml");
    const chartFiles: string[] = [];

    for await (const file of glob.scan(".")) {
      chartFiles.push(file);
    }

    if (chartFiles.length === 0) {
      console.warn("No Chart.yaml files found in kit/charts/");
      return;
    }

    console.log(`Found ${chartFiles.length} Chart.yaml files:`);

    let updatedCount = 0;

    for (const chartPath of chartFiles) {
      try {
        const relativePath = relative(process.cwd(), chartPath);
        console.log(`  Processing: ${relativePath}`);

        // Read the current Chart.yaml file
        const file = Bun.file(chartPath);
        if (!(await file.exists())) {
          console.warn(`    Skipping: File does not exist`);
          continue;
        }

        const content = await file.text();
        const chart = parse(content) as ChartYaml;

        // Check if version fields exist
        if (!chart.version && !chart.appVersion) {
          console.warn(`    Skipping: No version or appVersion fields found`);
          continue;
        }

        const oldVersion = chart.version;
        const oldAppVersion = chart.appVersion;

        // Update the version fields
        chart.version = newVersion;
        chart.appVersion = newVersion;

        // Convert back to YAML and write
        const updatedContent = stringify(chart);

        await Bun.write(chartPath, updatedContent);

        console.log(`    Updated: ${oldVersion} -> ${newVersion}`);
        if (oldAppVersion !== oldVersion) {
          console.log(
            `    Updated appVersion: ${oldAppVersion} -> ${newVersion}`
          );
        }

        updatedCount++;
      } catch (error) {
        console.error(`    Error processing ${chartPath}:`, error);
      }
    }

    console.log(`\nSuccessfully updated ${updatedCount} Chart.yaml files`);
  } catch (error) {
    console.error("Failed to update chart versions:", error);
    process.exit(1);
  }
}

// Run the script if called directly
if (import.meta.main) {
  await updateChartVersions();
  await updatePackageVersion();
}

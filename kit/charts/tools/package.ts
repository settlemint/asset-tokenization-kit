#!/usr/bin/env bun

import { existsSync } from "node:fs";
import { join } from "node:path";
import { logger } from "../../../tools/logging";
import { getKitProjectPath } from "../../../tools/root";

/**
 * Script to update registry values in Helm chart files to use Harbor proxy
 * Usage:
 *   - From kit/charts: bun run tools/harbor.ts
 *   - From root: turbo run harbor --filter=charts
 */

const HARBOR_PROXY = "harbor.settlemint.com";
const log = logger;

/**
 * Find the charts directory using intelligent root detection
 */
function findChartsDirectory(): string {
  log.debug("Finding charts directory...");

  // If we're already in kit/charts, use current directory
  if (existsSync("package.json")) {
    try {
      const packageJson = Bun.file(join(process.cwd(), "package.json"));
      const content = JSON.parse(await packageJson.text());
      if (content.name === "charts") {
        log.debug("Already in charts directory");
        return process.cwd();
      }
    } catch {
      // Continue to next check
    }
  }

  // Use root detection to find charts
  try {
    const chartsPath = getKitProjectPath("charts");
    log.debug(`Found charts directory: ${chartsPath}`);
    return chartsPath;
  } catch (error) {
    log.error(`Could not find charts directory: ${error}`);
    throw new Error(
      "Could not find charts package.json file. Run this script from kit/charts or project root."
    );
  }
}

/**
 * Get all chart files that need to be processed
 */
function getChartFiles(projectDir: string): string[] {
  const files = [
    "atk/values.yaml",
    "atk/values-prod.yaml",
    "atk/values-example.yaml",
    "atk/charts/besu-network/values.yaml",
    "atk/charts/besu-network/charts/besu-node/values.yaml",
    "atk/charts/besu-network/charts/besu-genesis/values.yaml",
    "atk/charts/blockscout/values.yaml",
    "atk/charts/dapp/values.yaml",
    "atk/charts/erpc/values.yaml",
    "atk/charts/hasura/values.yaml",
    "atk/charts/observability/values.yaml",
    "atk/charts/portal/values.yaml",
    "atk/charts/support/values.yaml",
    "atk/charts/thegraph/values.yaml",
    "atk/charts/txsigner/values.yaml",
  ];

  return files
    .map(file => join(projectDir, file))
    .filter(filePath => {
      if (!existsSync(filePath)) {
        log.warn(`File not found: ${filePath}`);
        return false;
      }
      return true;
    });
}

/**
 * Process a single file to update registry values
 */
async function processFile(filePath: string): Promise<{ modified: boolean; changes: number }> {
  try {
    const content = await Bun.file(filePath).text();
    const lines = content.split("\n");
    let changeCount = 0;

    // Check if there's a features.kits section
    let inFeaturesSection = false;
    let inKitsSection = false;
    let inCustomDeployment = false;
    let inCodeStudio = false;
    let featuresSectionIndent = "";

    const modifiedLines = lines.map((line) => {
      // Track if we're entering or leaving the features section
      if (line.trim() === "features:") {
        inFeaturesSection = true;
        featuresSectionIndent = line.match(/^\s*/)?.[0] || "";
      }
      // If we're in features section and find a kits: entry
      else if (inFeaturesSection && line.trim() === "kits:") {
        inKitsSection = true;
      }
      // Track customDeployment and codeStudio sections within kits
      else if (inKitsSection && line.trim() === "customDeployment:") {
        inCustomDeployment = true;
        inCodeStudio = false;
      } else if (inKitsSection && line.trim() === "codeStudio:") {
        inCodeStudio = true;
        inCustomDeployment = false;
      }
      // If we're in features section and find another top-level section
      else if (
        inFeaturesSection &&
        !line.startsWith(`${featuresSectionIndent} `) &&
        line.trim() !== ""
      ) {
        inFeaturesSection = false;
        inKitsSection = false;
        inCustomDeployment = false;
        inCodeStudio = false;
      }

      // Skip modifying lines in the kits.customDeployment section
      if (inKitsSection && inCustomDeployment) {
        return line;
      }

      const originalLine = line;

      // Process registry: values
      if (line.includes("registry:") && !line.includes(`${HARBOR_PROXY}/`)) {
        const registryMatch = line.match(/(\s+registry:\s+)([^\s\n]+)/);
        if (
          registryMatch &&
          registryMatch[2] !== HARBOR_PROXY &&
          !registryMatch[2].startsWith(`${HARBOR_PROXY}/`)
        ) {
          line = line.replace(
            /(\s+registry:\s+)([^\s\n]+)/,
            `$1${HARBOR_PROXY}/$2`
          );
        }
      }

      // Process imageRegistry: values
      if (
        line.includes("imageRegistry:") &&
        !line.includes(`${HARBOR_PROXY}/`)
      ) {
        const registryMatch = line.match(/(\s+imageRegistry:\s+)([^\s\n]+)/);
        if (
          registryMatch &&
          registryMatch[2] !== HARBOR_PROXY &&
          !registryMatch[2].startsWith(`${HARBOR_PROXY}/`)
        ) {
          line = line.replace(
            /(\s+imageRegistry:\s+)([^\s\n]+)/,
            `$1${HARBOR_PROXY}/$2`
          );
        }
      }

      // Replace name: ghcr.io with name: harbor.settlemint.com
      if (line.includes("name:") && line.includes("ghcr.io")) {
        line = line.replace(/(\s+name:\s+)ghcr\.io/, `$1${HARBOR_PROXY}`);
      }

      // Process repository: values
      if (line.includes("repository:")) {
        const repoMatch = line.match(/(\s+repository:\s+)([^\s\n]+)/);
        if (repoMatch) {
          const repoValue = repoMatch[2];

          const registries = [
            "registry.k8s.io",
            "quay.io",
            "ghcr.io",
            "docker.io"
          ];

          for (const registry of registries) {
            if (
              repoValue.includes(registry) &&
              !repoValue.includes(`${HARBOR_PROXY}/${registry}`)
            ) {
              const newValue = repoValue.replace(
                registry,
                `${HARBOR_PROXY}/${registry}`
              );
              line = line.replace(repoValue, newValue);
              break;
            }
          }
        }
      }

      // Process image: values
      if (line.includes("image:") && !line.includes("imageRegistry")) {
        const imageMatch = line.match(/(\s+image:\s+)([^\s\n]+)/);
        if (imageMatch) {
          const imageValue = imageMatch[2];

          const registries = [
            "registry.k8s.io",
            "quay.io",
            "ghcr.io",
            "docker.io"
          ];

          for (const registry of registries) {
            if (
              imageValue.includes(registry) &&
              !imageValue.includes(`${HARBOR_PROXY}/${registry}`)
            ) {
              const newValue = imageValue.replace(
                registry,
                `${HARBOR_PROXY}/${registry}`
              );
              line = line.replace(imageValue, newValue);
              break;
            }
          }
        }
      }

      // Count changes
      if (line !== originalLine) {
        changeCount++;
      }

      return line;
    });

    const modifiedContent = modifiedLines.join("\n");
    const wasModified = modifiedContent !== content;

    // Write changes if any were made
    if (wasModified) {
      await Bun.write(filePath, modifiedContent);
    }

    return { modified: wasModified, changes: changeCount };
  } catch (error) {
    log.error(`Error processing ${filePath}: ${error}`);
    throw error;
  }
}

/**
 * Main execution function
 */
async function main(): Promise<void> {
  log.info("Starting Harbor registry updates...");

  let totalModified = 0;
  let totalChanges = 0;

  try {
    // Find the charts directory
    const projectDir = findChartsDirectory();
    log.info(`Using charts directory: ${projectDir}`);

    // Get all chart files to process
    const chartFiles = getChartFiles(projectDir);

    if (chartFiles.length === 0) {
      log.info("No chart files found to process");
      return;
    }

    log.info(`Processing ${chartFiles.length} chart files...`);

    // Process all files in parallel
    const results = await Promise.allSettled(
      chartFiles.map(async (filePath) => {
        const result = await processFile(filePath);
        const fileName = filePath.split("/").slice(-2).join("/");

        if (result.modified) {
          log.success(`Updated ${fileName} (${result.changes} changes)`);
        } else {
          log.debug(`No changes needed in ${fileName}`);
        }

        return result;
      })
    );

    // Count results and errors
    let errorCount = 0;
    for (const result of results) {
      if (result.status === "fulfilled") {
        if (result.value.modified) {
          totalModified++;
          totalChanges += result.value.changes;
        }
      } else {
        errorCount++;
      }
    }

    // Summary
    if (errorCount > 0) {
      throw new Error(`${errorCount} file processing errors occurred`);
    }

    if (totalModified > 0) {
      log.success(`Successfully updated ${totalModified} files with ${totalChanges} total changes!`);
    } else {
      log.info("All files are already up to date!");
    }

  } catch (error) {
    log.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

// Run the script
if (import.meta.main) {
  await main();
}
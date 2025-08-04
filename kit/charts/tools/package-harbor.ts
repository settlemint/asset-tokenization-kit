#!/usr/bin/env bun

import { createLogger, type LogLevel } from "@settlemint/sdk-utils/logging";
import { join } from "node:path";
import { getKitProjectPath } from "../../../tools/root";

/**
 * Script to update registry values in Helm chart files to use Harbor proxy
 * Usage:
 *   - From kit/charts: bun run tools/harbor.ts
 *   - From root: turbo run harbor --filter=charts
 */

const HARBOR_PROXY = "harbor.settlemint.com";
const logger = createLogger({
  level: process.env.CLAUDECODE
    ? "error"
    : (process.env.SETTLEMINT_LOG_LEVEL as LogLevel) || "info",
});

/**
 * Check if a repository/image value is an implicit Docker Hub image
 * This function properly handles local registries and other registry URLs
 */
function isImplicitDockerHubImage(value: string): boolean {
  // Skip empty or already processed values
  if (!value || value.includes(HARBOR_PROXY)) {
    return false;
  }

  // If it starts with localhost, it's a local registry
  if (value.startsWith('localhost')) {
    return false;
  }

  // If it contains a colon followed by digits, it's likely a registry with port (e.g., localhost:5000, registry.example.com:443)
  if (/:\d+/.test(value)) {
    return false;
  }

  // If it contains a domain-like pattern (dot followed by known TLD patterns), it's likely a registry
  if (/\.[a-z]{2,}(\/|$)/i.test(value)) {
    return false;
  }

  // Now check for implicit Docker Hub patterns:
  // 1. Simple image names without / (e.g., "postgres", "nginx")
  if (!value.includes('/')) {
    return true;
  }

  // 2. Org/repo patterns without explicit registry (e.g., "graphprotocol/graph-node", "bitnami/postgresql")
  // This should only match if it doesn't contain dots that would indicate a registry
  if (value.includes('/') && !value.includes('.')) {
    return true;
  }

  return false;
}

/**
 * Find the charts directory using intelligent root detection
 */
async function findChartsDirectory(): Promise<string> {
  logger.debug("Finding charts directory...");

  // If we're already in kit/charts, use current directory
  const packageJsonFile = Bun.file(join(process.cwd(), "package.json"));
  if (await packageJsonFile.exists()) {
    try {
      const content = JSON.parse(await packageJsonFile.text());
      if (content.name === "charts") {
        logger.debug("Already in charts directory");
        return process.cwd();
      }
    } catch {
      // Continue to next check
    }
  }

  // Use root detection to find charts
  try {
    const chartsPath = getKitProjectPath("charts");
    logger.debug(`Found charts directory: ${chartsPath}`);
    return chartsPath;
  } catch (error) {
    logger.error(`Could not find charts directory: ${error}`);
    throw new Error(
      "Could not find charts package.json file. Run this script from kit/charts or project root."
    );
  }
}

/**
 * Find all values.yaml files using Bun glob
 */
async function findValuesFiles(dir: string): Promise<string[]> {
  const files: string[] = [];

  try {
    // Use Bun.glob to find all values.yaml and values-*.yaml files
    const valuesGlob = new Bun.Glob("**/values*.yaml");

    for await (const file of valuesGlob.scan({ cwd: dir, dot: false })) {
      // Only include files that match our exact pattern
      const basename = file.split("/").pop() || "";
      if (basename === "values.yaml" || (basename.startsWith("values-") && basename.endsWith(".yaml"))) {
        files.push(file);
      }
    }
  } catch (error) {
    logger.warn(`Error scanning directory ${dir}: ${error}`);
  }

  return files;
}

/**
 * Get all chart files that need to be processed
 */
async function getChartFiles(projectDir: string): Promise<string[]> {
  const atkDir = join(projectDir, "atk");

  // Check if directory exists by trying to scan it
  try {
    const testGlob = new Bun.Glob("*");
    const scanner = testGlob.scan({ cwd: atkDir, onlyFiles: false });
    // Try to get first item to verify directory exists
    await scanner.next();
  } catch {
    logger.error(`ATK directory not found: ${atkDir}`);
    return [];
  }

  // Find all values.yaml files in the atk directory
  const relativeFiles = await findValuesFiles(atkDir);

  // Convert to absolute paths and add the atk prefix
  const files = relativeFiles.map(file => join(atkDir, file));

  // Filter out files that don't exist (shouldn't happen, but defensive programming)
  const existingFiles: string[] = [];
  for (const filePath of files) {
    const file = Bun.file(filePath);
    if (await file.exists()) {
      existingFiles.push(filePath);
    } else {
      logger.warn(`File not found: ${filePath}`);
    }
  }

  return existingFiles;
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

    const modifiedLines = lines.map((line, index) => {
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
      if (line.includes("registry:")) {
        // Clean up corrupted values like harbor.settlemint.com/""
        if (line.includes(`${HARBOR_PROXY}/""`)) {
          line = line.replace(`${HARBOR_PROXY}/""`, '""');
        } else if (line.includes(`${HARBOR_PROXY}/''`)) {
          line = line.replace(`${HARBOR_PROXY}/''`, "''");
        }
        // Process normal values (but not if already has harbor proxy)
        else if (!line.includes(`${HARBOR_PROXY}/`)) {
          const registryMatch = line.match(/(\s+registry:\s+)([^\s\n]+)/);
          if (
            registryMatch &&
            registryMatch[2] &&
            registryMatch[2] !== HARBOR_PROXY &&
            !registryMatch[2].startsWith(`${HARBOR_PROXY}/`) &&
            registryMatch[2] !== '""' &&  // Skip empty string values
            registryMatch[2] !== "''" &&  // Skip empty string values with single quotes
            registryMatch[2].trim() !== ""  // Skip actual empty values
          ) {
            line = line.replace(
              /(\s+registry:\s+)([^\s\n]+)/,
              `$1${HARBOR_PROXY}/$2`
            );
          }
        }
      }

      // Process imageRegistry: values
      if (line.includes("imageRegistry:")) {
        // Clean up corrupted values like harbor.settlemint.com/""
        if (line.includes(`${HARBOR_PROXY}/""`)) {
          line = line.replace(`${HARBOR_PROXY}/""`, '""');
        } else if (line.includes(`${HARBOR_PROXY}/''`)) {
          line = line.replace(`${HARBOR_PROXY}/''`, "''");
        } else if (line.includes(`${HARBOR_PROXY}/"''"`)) {
          line = line.replace(`${HARBOR_PROXY}/"''"`, '""');
        }
        // Process normal values (but not if already has harbor proxy)
        else if (!line.includes(`${HARBOR_PROXY}/`)) {
          const registryMatch = line.match(/(\s+imageRegistry:\s+)([^\s\n]+)/);
          if (
            registryMatch &&
            registryMatch[2] &&
            registryMatch[2] !== HARBOR_PROXY &&
            !registryMatch[2].startsWith(`${HARBOR_PROXY}/`) &&
            registryMatch[2] !== '""' &&  // Skip empty string values
            registryMatch[2] !== "''" &&  // Skip empty string values with single quotes
            registryMatch[2].trim() !== ""  // Skip actual empty values
          ) {
            line = line.replace(
              /(\s+imageRegistry:\s+)([^\s\n]+)/,
              `$1${HARBOR_PROXY}/$2`
            );
          }
        }
      }

      // Replace name: ghcr.io with name: harbor.settlemint.com
      if (line.includes("name:") && line.includes("ghcr.io")) {
        line = line.replace(/(\s+name:\s+)ghcr\.io/, `$1${HARBOR_PROXY}`);
      }

      // Process repository: values
      if (line.includes("repository:")) {
        const repoMatch = line.match(/(\s+repository:\s+)([^\s\n]+)/);
        if (repoMatch && repoMatch[2]) {
          const repoValue = repoMatch[2];

          // FIRST: Clean up double-harbor entries when there's a nearby registry field
          if (repoValue.startsWith(HARBOR_PROXY)) {
            // Check if there's a registry field nearby (within 5 lines before this one)
            const currentLineIndex = index;
            let hasNearbyRegistry = false;

            for (let i = Math.max(0, currentLineIndex - 5); i < currentLineIndex; i++) {
              if (lines[i]?.includes('registry:') && lines[i]?.includes(HARBOR_PROXY) && !lines[i]?.trim().startsWith('#')) {
                // Check if it's at similar indentation (same image block)
                const currentIndent = line.match(/^\s*/)?.[0]?.length ?? 0;
                const registryIndent = lines[i]?.match(/^\s*/)?.[0]?.length ?? 0;
                if (Math.abs(currentIndent - registryIndent) <= 2) {
                  hasNearbyRegistry = true;
                  break;
                }
              }
            }

            // If there's a nearby registry field, remove harbor prefix from repository
            if (hasNearbyRegistry) {
              const registries = ["registry.k8s.io", "quay.io", "ghcr.io", "docker.io"];
              for (const registry of registries) {
                const pattern = `${HARBOR_PROXY}/${registry}/`;
                if (repoValue.startsWith(pattern)) {
                  const cleanedValue = repoValue.replace(pattern, '');
                  line = line.replace(repoValue, cleanedValue);
                  break; // Break after cleanup instead of returning early
                }
              }
            }
          }

          const registries = [
            "registry.k8s.io",
            "quay.io",
            "ghcr.io",
            "docker.io"
          ];

          let processed = false;

          // First, try to match explicit registries
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
              processed = true;
              break;
            }
          }

          // If not processed and not already harbored, handle implicit Docker Hub images
          // BUT ONLY if there's no nearby registry field
          if (!processed && !repoValue.includes(HARBOR_PROXY)) {
            // Check if there's a registry field nearby (within 5 lines before this one)
            const currentLineIndex = index;
            let hasNearbyRegistry = false;

            for (let i = Math.max(0, currentLineIndex - 5); i < currentLineIndex; i++) {
              if (lines[i]?.includes('registry:') && !lines[i]?.trim().startsWith('#')) {
                // Check if it's at similar indentation (same image block)
                const currentIndent = line.match(/^\s*/)?.[0]?.length ?? 0;
                const registryIndent = lines[i]?.match(/^\s*/)?.[0]?.length ?? 0;
                if (Math.abs(currentIndent - registryIndent) <= 2) {
                  hasNearbyRegistry = true;
                  break;
                }
              }
            }

            // Only apply harbor prefix if there's no nearby registry field
            if (!hasNearbyRegistry) {
              // Check if it's an implicit Docker Hub image
              if (isImplicitDockerHubImage(repoValue)) {
                const newValue = `${HARBOR_PROXY}/docker.io/${repoValue}`;
                line = line.replace(repoValue, newValue);
              }
            }
          }
        }
      }

      // Process image: values
      if (line.includes("image:") && !line.includes("imageRegistry")) {
        const imageMatch = line.match(/(\s+image:\s+)([^\s\n]+)/);
        if (imageMatch && imageMatch[2]) {
          const imageValue = imageMatch[2];

          const registries = [
            "registry.k8s.io",
            "quay.io",
            "ghcr.io",
            "docker.io"
          ];

          let processed = false;

          // First, try to match explicit registries
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
              processed = true;
              break;
            }
          }

          // If not processed and not already harbored, handle implicit Docker Hub images
          if (!processed && !imageValue.includes(HARBOR_PROXY)) {
            // Check if it's an implicit Docker Hub image
            if (isImplicitDockerHubImage(imageValue)) {
              const newValue = `${HARBOR_PROXY}/docker.io/${imageValue}`;
              line = line.replace(imageValue, newValue);
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
    logger.error(`Error processing ${filePath}: ${error}`);
    throw error;
  }
}

/**
 * Main execution function
 */
async function main(): Promise<void> {
  logger.info("Starting Harbor registry updates...");

  let totalModified = 0;
  let totalChanges = 0;

  try {
    // Find the charts directory
    const projectDir = await findChartsDirectory();
    logger.info(`Using charts directory: ${projectDir}`);

    // Get all chart files to process
    const chartFiles = await getChartFiles(projectDir);

    if (chartFiles.length === 0) {
      logger.info("No chart files found to process");
      return;
    }

    logger.info(`Processing ${chartFiles.length} chart files...`);

    // Process all files in parallel
    const results = await Promise.allSettled(
      chartFiles.map(async (filePath) => {
        const result = await processFile(filePath);
        const fileName = filePath.split("/").slice(-2).join("/");

        if (result.modified) {
          logger.info(`Updated ${fileName} (${result.changes} changes)`);
        } else {
          logger.debug(`No changes needed in ${fileName}`);
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
      logger.info(`Successfully updated ${totalModified} files with ${totalChanges} total changes!`);
    } else {
      logger.info("All files are already up to date!");
    }

  } catch (error) {
    logger.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

// Run the script
if (import.meta.main) {
  await main();
}
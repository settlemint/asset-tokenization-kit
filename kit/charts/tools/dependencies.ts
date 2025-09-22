#!/usr/bin/env bun

import { createLogger, type LogLevel } from "@settlemint/sdk-utils/logging";
import { $ } from "bun";
import { join } from "node:path";
import { getKitProjectPath } from "../../../tools/root";

/**
 * Script to update Helm chart dependencies
 * Usage:
 *   - From kit/charts: bun run tools/dependencies.ts
 *   - From root: turbo run dependencies --filter=charts
 */

const logger = createLogger({
  level: process.env.CLAUDECODE
    ? "error"
    : (process.env.SETTLEMINT_LOG_LEVEL as LogLevel) || "info",
});

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
 * Check if helm command is available
 */
async function checkHelmInstalled(): Promise<void> {
  logger.debug("Checking for Helm installation...");

  const helmPath = Bun.which("helm");
  if (!helmPath) {
    throw new Error(
      "helm command not found. Please install Helm first: https://helm.sh/docs/intro/install/"
    );
  }

  logger.debug(`Helm found at: ${helmPath}`);
}

/**
 * Check if a Chart.yaml has dependencies
 */
async function hasDependencies(chartYamlPath: string): Promise<boolean> {
  const file = Bun.file(chartYamlPath);
  if (!(await file.exists())) {
    return false;
  }

  const content = await file.text();

  // Check for dependencies section in YAML
  return /^\s*dependencies:\s*$/im.test(content) || content.includes("dependencies:");
}

/**
 * Get chart directories that have dependencies
 */
async function getChartsWithDependencies(projectDir: string): Promise<string[]> {
  const chartDirs: string[] = [];

  logger.debug("Scanning for charts with dependencies...");

  // Check main atk chart
  const atkChartPath = join(projectDir, "atk", "Chart.yaml");
  const atkChartFile = Bun.file(atkChartPath);
  if (await atkChartFile.exists() && await hasDependencies(atkChartPath)) {
    chartDirs.push(join(projectDir, "atk"));
    logger.debug("Found dependencies in main atk chart");
  }

  // Use glob to find all Chart.yaml files in atk/charts/
  const chartGlob = new Bun.Glob("atk/charts/*/Chart.yaml");

  for await (const chartYamlRelative of chartGlob.scan({ cwd: projectDir })) {
    const chartYamlPath = join(projectDir, chartYamlRelative);
    if (await hasDependencies(chartYamlPath)) {
      // Get the chart directory (parent of Chart.yaml)
      const chartDir = chartYamlPath.replace(/\/Chart\.yaml$/, "");
      const chartName = chartDir.split("/").pop() || "unknown";
      chartDirs.push(chartDir);
      logger.debug(`Found dependencies in ${chartName} chart`);
    }
  }

  logger.info(`Found ${chartDirs.length} charts with dependencies`);
  return chartDirs;
}

/**
 * Update Helm dependencies for a specific chart with retry logic
 */
async function updateHelmDependencies(chartDir: string, maxRetries = 3): Promise<void> {
  const chartName = chartDir.split("/").pop() || "unknown";

  logger.info(`Updating dependencies for ${chartName}...`);

  let lastError: Error | unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await $`helm dependency update`.cwd(chartDir).quiet();
      logger.info(`Updated dependencies for ${chartName}`);
      return; // Success, exit function
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        logger.warn(`Failed to update dependencies for ${chartName} (attempt ${attempt}/${maxRetries}): ${error}`);
        logger.info(`Retrying in ${attempt * 2} seconds...`);
        await Bun.sleep(attempt * 2000); // Exponential backoff: 2s, 4s, 6s
      } else {
        logger.error(`Failed to update dependencies for ${chartName} after ${maxRetries} attempts: ${error}`);
      }
    }
  }

  throw lastError;
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  logger.info("Starting Helm dependency updater...");

  try {
    // Find the charts directory
    const projectDir = await findChartsDirectory();
    logger.info(`Using charts directory: ${projectDir}`);

    // Check if helm is installed
    await checkHelmInstalled();

    // Get charts with dependencies
    const chartsWithDeps = await getChartsWithDependencies(projectDir);

    if (chartsWithDeps.length === 0) {
      logger.info("No charts with dependencies found");
      return;
    }

    // Update dependencies for all charts in parallel
    const results = await Promise.allSettled(
      chartsWithDeps.map(chartDir => updateHelmDependencies(chartDir))
    );

    // Count errors
    const errorCount = results.filter(result => result.status === 'rejected').length;

    if (errorCount > 0) {
      throw new Error(`${errorCount} dependency update errors occurred`);
    }

    logger.info("All Helm dependencies updated successfully!");
  } catch (error) {
    logger.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

// Run the script
if (import.meta.main) {
  await main();
}
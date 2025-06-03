#!/usr/bin/env bun

import { $ } from "bun";
import { join } from "node:path";
import { logger } from "../../../tools/logging";
import { getKitProjectPath } from "../../../tools/root";

/**
 * Script to update Helm chart dependencies
 * Usage:
 *   - From kit/charts: bun run tools/dependencies.ts
 *   - From root: turbo run dependencies --filter=charts
 */

const log = logger; // Use logger instance

/**
 * Check if we're running in a CI environment
 */
function isCI(): boolean {
  return !!(
    process.env.CI ||
    process.env.GITHUB_ACTIONS ||
    process.env.GITLAB_CI ||
    process.env.JENKINS_URL ||
    process.env.BUILDKITE ||
    process.env.CIRCLECI
  );
}

/**
 * Find the charts directory using intelligent root detection
 */
async function findChartsDirectory(): Promise<string> {
  log.debug("Finding charts directory...");

  // If we're already in kit/charts, use current directory
  const packageJsonFile = Bun.file(join(process.cwd(), "package.json"));
  if (await packageJsonFile.exists()) {
    try {
      const content = JSON.parse(await packageJsonFile.text());
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
 * Check if helm command is available
 */
async function checkHelmInstalled(): Promise<void> {
  log.debug("Checking for Helm installation...");
  
  const helmPath = Bun.which("helm");
  if (!helmPath) {
    throw new Error(
      "helm command not found. Please install Helm first: https://helm.sh/docs/intro/install/"
    );
  }
  
  log.debug(`Helm found at: ${helmPath}`);
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

  log.debug("Scanning for charts with dependencies...");

  // Check main atk chart
  const atkChartPath = join(projectDir, "atk", "Chart.yaml");
  const atkChartFile = Bun.file(atkChartPath);
  if (await atkChartFile.exists() && await hasDependencies(atkChartPath)) {
    chartDirs.push(join(projectDir, "atk"));
    log.debug("Found dependencies in main atk chart");
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
      log.debug(`Found dependencies in ${chartName} chart`);
    }
  }

  log.info(`Found ${chartDirs.length} charts with dependencies`);
  return chartDirs;
}

/**
 * Update Helm dependencies for a specific chart
 */
async function updateHelmDependencies(chartDir: string): Promise<void> {
  const chartName = chartDir.split("/").pop() || "unknown";

  log.info(`Updating dependencies for ${chartName}...`);

  try {
    await $`helm dependency update`.cwd(chartDir).quiet();
    log.success(`Updated dependencies for ${chartName}`);
  } catch (error) {
    log.error(`Failed to update dependencies for ${chartName}: ${error}`);
    throw error;
  }
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  const ci = isCI();
  
  log.info(`Starting Helm dependency updater${ci ? ' (CI mode)' : ''}...`);

  try {
    // Find the charts directory
    const projectDir = await findChartsDirectory();
    log.info(`Using charts directory: ${projectDir}`);

    // Check if helm is installed
    await checkHelmInstalled();

    // Get charts with dependencies
    const chartsWithDeps = await getChartsWithDependencies(projectDir);

    if (chartsWithDeps.length === 0) {
      log.info("No charts with dependencies found");
      return;
    }

    // Update dependencies for all charts in parallel
    const results = await Promise.allSettled(
      chartsWithDeps.map(chartDir => updateHelmDependencies(chartDir))
    );

    // Count errors
    const errorCount = results.filter(result => result.status === 'rejected').length;
    const successCount = results.filter(result => result.status === 'fulfilled').length;

    if (errorCount > 0) {
      if (ci) {
        // In CI, treat chart dependency failures as warnings, not fatal errors
        log.warn(`${errorCount} chart dependency update(s) failed, ${successCount} succeeded`);
        log.info("Chart dependency failures are treated as non-critical in CI environments");
        log.success("Charts dependency update completed with warnings");
      } else {
        // In local development, still treat as errors
        throw new Error(`${errorCount} dependency update errors occurred`);
      }
    } else {
      log.success("All Helm dependencies updated successfully!");
    }
  } catch (error) {
    if (ci) {
      // In CI, even fatal errors should be warnings for chart dependencies
      log.warn(`Chart dependencies update failed: ${error instanceof Error ? error.message : String(error)}`);
      log.info("Chart dependency errors are treated as non-critical in CI environments");
    } else {
      log.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    }
  }
}

// Run the script
if (import.meta.main) {
  await main();
}
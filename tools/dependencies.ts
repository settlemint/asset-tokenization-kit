#!/usr/bin/env bun

import { $ } from "bun";
import { join } from "node:path";
import { logger } from "./logging";

/**
 * Root-level dependencies script that orchestrates workspace dependency installation
 * This script is called by CI and postinstall hooks to ensure all workspace dependencies are installed
 *
 * Usage:
 *   - From root: bun run tools/dependencies.ts
 *   - Via turbo: turbo run dependencies
 *   - Via npm script: bun run dependencies (uses turbo)
 */

const log = logger;

/**
 * Check if we're in the correct root directory
 */
async function validateRootDirectory(): Promise<void> {
  log.debug("Validating root directory...");

  const packageJsonFile = Bun.file("package.json");
  if (!(await packageJsonFile.exists())) {
    throw new Error(
      "package.json not found. Please run this script from the project root."
    );
  }

  const packageJson = await packageJsonFile.json();
  if (packageJson.name !== "@settlemint/asset-tokenization-kit") {
    throw new Error(
      "Not in the correct project root. Expected @settlemint/asset-tokenization-kit."
    );
  }

  log.debug("Root directory validated");
}

/**
 * Check if turbo command is available
 */
async function checkTurboInstalled(): Promise<boolean> {
  log.debug("Checking for Turbo installation...");

  const turboPath = Bun.which("turbo");
  if (!turboPath) {
    log.warn("turbo command not found, will try to use bunx turbo");
    return false;
  }

  log.debug(`Turbo found at: ${turboPath}`);
  return true;
}

/**
 * Run dependencies via turbo (preferred method)
 */
async function runDependenciesViaTurbo(): Promise<void> {
  log.info("Running dependencies via Turbo...");

  const hasTurbo = await checkTurboInstalled();

  try {
    if (hasTurbo) {
      await $`turbo run dependencies --output-logs=new-only`.env({
        FORCE_COLOR: "1",
      });
    } else {
      await $`bunx turbo run dependencies --output-logs=new-only`.env({
        FORCE_COLOR: "1",
      });
    }
    log.success("Dependencies installed successfully via Turbo");
  } catch (error) {
    log.error(`Failed to run dependencies via Turbo: ${error}`);
    throw error;
  }
}

/**
 * Fallback: Run dependencies manually for each workspace
 */
async function runDependenciesManually(): Promise<void> {
  log.info("Running dependencies manually for each workspace...");

  const workspaces = [
    { name: "contracts", path: "kit/contracts" },
    { name: "charts", path: "kit/charts" },
  ];

  const errors: string[] = [];

  for (const workspace of workspaces) {
    log.info(`Installing dependencies for ${workspace.name}...`);

    const dependenciesScript = join(workspace.path, "tools", "dependencies.ts");
    const scriptFile = Bun.file(dependenciesScript);

    if (!(await scriptFile.exists())) {
      log.debug(`No dependencies script found for ${workspace.name}`);
      continue;
    }

    try {
      await $`bun run --cwd ${workspace.path} tools/dependencies.ts`.env({
        FORCE_COLOR: "1",
      });
      log.success(`Dependencies installed for ${workspace.name}`);
    } catch (error) {
      const errorMsg = `Failed to install dependencies for ${workspace.name}: ${error}`;
      log.error(errorMsg);
      errors.push(errorMsg);
    }
  }

  if (errors.length > 0) {
    throw new Error(
      `${errors.length} workspace(s) failed to install dependencies:\n${errors.join("\n")}`
    );
  }
}

/**
 * Main execution function
 */
async function main(): Promise<void> {
  const startTime = Date.now();

  try {
    log.info("Starting dependency installation for Asset Tokenization Kit...");

    await validateRootDirectory();

    // Try turbo first, fall back to manual execution if needed
    try {
      await runDependenciesViaTurbo();
    } catch (turboError) {
      log.warn("Turbo execution failed, falling back to manual execution");
      log.debug(`Turbo error: ${turboError}`);
      await runDependenciesManually();
    }

    const duration = Date.now() - startTime;
    log.success(`All dependencies installed successfully in ${duration}ms`);
  } catch (error) {
    log.error(`Dependencies installation failed: ${error}`);
    process.exit(1);
  }
}

// Execute if run directly
if (import.meta.main) {
  main().catch((error) => {
    log.error(`Unhandled error: ${error}`);
    process.exit(1);
  });
}

export { main as runDependencies };

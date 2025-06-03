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
 * Check if we're running during postinstall (before tools are installed)
 */
function isPostInstall(): boolean {
  return process.env.npm_lifecycle_event === "postinstall";
}

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
 * Check if required tools are available
 */
async function checkToolsAvailable(): Promise<{
  forge: boolean;
  helm: boolean;
  turbo: boolean;
}> {
  const forge = !!Bun.which("forge");
  const helm = !!Bun.which("helm");
  const turbo = !!Bun.which("turbo");

  return { forge, helm, turbo };
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
 * Run dependencies via turbo with CI-friendly error handling
 */
async function runDependenciesViaTurbo(): Promise<void> {
  log.info("Running dependencies via Turbo...");

  const hasTurbo = await checkTurboInstalled();
  const ci = isCI();

  try {
    if (ci) {
      // In CI, continue on error and show all output
      if (hasTurbo) {
        await $`turbo run dependencies --continue --output-logs=new-only`.env({
          FORCE_COLOR: "1",
        });
      } else {
        await $`bunx turbo run dependencies --continue --output-logs=new-only`.env(
          { FORCE_COLOR: "1" }
        );
      }
    } else {
      if (hasTurbo) {
        await $`turbo run dependencies --output-logs=new-only`.env({
          FORCE_COLOR: "1",
        });
      } else {
        await $`bunx turbo run dependencies --output-logs=new-only`.env({
          FORCE_COLOR: "1",
        });
      }
    }

    log.success("Dependencies installed successfully via Turbo");
  } catch (error) {
    if (ci) {
      log.warn(`Turbo execution completed with some failures: ${error}`);
      // In CI, check if critical dependencies (contracts) succeeded
      await validateCriticalDependencies();
    } else {
      log.error(`Failed to run dependencies via Turbo: ${error}`);
      throw error;
    }
  }
}

/**
 * Validate that critical dependencies (contracts) are available
 */
async function validateCriticalDependencies(): Promise<void> {
  log.info("Validating critical dependencies...");

  // Check if contracts dependencies were installed successfully
  const contractsDepsPath = "kit/contracts/dependencies";
  const dependenciesDir = Bun.file(contractsDepsPath);

  try {
    // Check if dependencies directory exists and has content
    const glob = new Bun.Glob("*");
    const scanner = glob.scan({ cwd: contractsDepsPath, onlyFiles: false });
    const firstEntry = await scanner.next();

    if (firstEntry.done) {
      throw new Error("Contracts dependencies directory is empty");
    }

    log.success("Critical dependencies (contracts) are available");
  } catch (error) {
    log.error(`Critical dependencies validation failed: ${error}`);
    throw new Error("Critical dependencies are missing. Cannot proceed.");
  }
}

/**
 * Fallback: Run dependencies manually for each workspace
 */
async function runDependenciesManually(): Promise<void> {
  log.info("Running dependencies manually for each workspace...");

  const tools = await checkToolsAvailable();
  const workspaces = [
    {
      name: "contracts",
      path: "kit/contracts",
      critical: true,
      requiresTool: "forge",
    },
    {
      name: "charts",
      path: "kit/charts",
      critical: false,
      requiresTool: "helm",
    },
  ];

  const errors: string[] = [];
  const ci = isCI();
  const postInstall = isPostInstall();

  for (const workspace of workspaces) {
    log.info(`Installing dependencies for ${workspace.name}...`);

    // Skip if required tool is not available during postinstall
    if (postInstall && !tools[workspace.requiresTool as keyof typeof tools]) {
      log.warn(
        `Skipping ${workspace.name} dependencies during postinstall (${workspace.requiresTool} not available yet)`
      );
      continue;
    }

    const dependenciesScript = join(workspace.path, "tools", "dependencies.ts");
    const scriptFile = Bun.file(dependenciesScript);

    if (!(await scriptFile.exists())) {
      log.debug(`No dependencies script found for ${workspace.name}`);
      continue;
    }

    try {
      // Run the script using --cwd to set the correct working directory
      await $`bun run --cwd ${workspace.path} tools/dependencies.ts`.env({
        FORCE_COLOR: "1",
      });
      log.success(`Dependencies installed for ${workspace.name}`);
    } catch (error) {
      const errorMsg = `Failed to install dependencies for ${workspace.name}: ${error}`;

      if (workspace.critical && !postInstall) {
        // Only treat as critical error if not during postinstall
        log.error(errorMsg);
        errors.push(errorMsg);
      } else {
        // Non-critical workspace failures or postinstall failures are warnings
        if (ci || postInstall) {
          log.warn(
            `${errorMsg} (non-critical${postInstall ? " during postinstall" : " in CI"})`
          );
        } else {
          log.error(errorMsg);
          errors.push(errorMsg);
        }
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(
      `${errors.length} critical workspace(s) failed to install dependencies:\n${errors.join("\n")}`
    );
  }

  if (ci || postInstall) {
    log.info(
      `Dependencies installation completed (some failures may have occurred${postInstall ? " during postinstall" : " in CI"})`
    );
  }
}

/**
 * Main execution function
 */
async function main(): Promise<void> {
  const startTime = Date.now();
  const ci = isCI();
  const postInstall = isPostInstall();

  try {
    log.info(
      `Starting dependency installation for Asset Tokenization Kit${ci ? " (CI mode)" : ""}${postInstall ? " (postinstall)" : ""}...`
    );

    await validateRootDirectory();

    // During postinstall, be more forgiving
    if (postInstall) {
      log.info(
        "Running during postinstall - will skip dependencies that require tools not yet installed"
      );
      try {
        await runDependenciesViaTurbo();
      } catch (turboError) {
        log.warn(
          "Turbo execution failed during postinstall, will try manual execution with tool checking"
        );
        await runDependenciesManually();
      }
    } else {
      // Normal execution - try turbo first, fall back to manual execution if needed
      try {
        await runDependenciesViaTurbo();
      } catch (turboError) {
        if (ci) {
          // In CI, turbo may "fail" but still install critical dependencies
          log.info(
            "Turbo completed with some failures, validating critical dependencies..."
          );
          try {
            await validateCriticalDependencies();
            log.success("Critical dependencies are available, proceeding...");
          } catch (validationError) {
            log.warn(
              "Critical dependencies validation failed, falling back to manual execution"
            );
            await runDependenciesManually();
          }
        } else {
          log.warn("Turbo execution failed, falling back to manual execution");
          log.debug(`Turbo error: ${turboError}`);
          await runDependenciesManually();
        }
      }
    }

    const duration = Date.now() - startTime;
    log.success(
      `Dependencies installation completed successfully in ${duration}ms`
    );
  } catch (error) {
    if (postInstall && ci) {
      // During postinstall in CI, log the error but don't fail
      log.warn(
        `Dependencies installation had issues during postinstall: ${error}`
      );
      log.info("Dependencies can be installed later when tools are available");
    } else {
      log.error(`Dependencies installation failed: ${error}`);
      process.exit(1);
    }
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

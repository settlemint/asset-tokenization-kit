#!/usr/bin/env bun

import { $ } from "bun";
import { existsSync } from "node:fs";
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
 * Check if dependencies directory exists synchronously
 */
function dependenciesExist(path: string): boolean {
  const exists = existsSync(path);
  return exists;
}

/**
 * Check if we're running during postinstall (before tools are installed)
 */
function isPostInstall(): boolean {
  const checks = {
    npm_lifecycle_event: process.env.npm_lifecycle_event === "postinstall",
    npm_lifecycle_script: process.env.npm_lifecycle_script?.includes(
      "tools/dependencies.ts"
    ),
    argv_postinstall: process.argv.some((arg) => arg.includes("postinstall")),
    npm_command_install: process.env.npm_command === "install",
    bun_postinstall: process.argv.some(
      (arg) =>
        arg.includes("bun") &&
        process.argv.some((a) => a.includes("postinstall"))
    ),
    bun_tools_deps:
      process.env._ &&
      process.env._.includes("bun") &&
      process.argv.includes("tools/dependencies.ts"),
    // Additional detection for bun postinstall in CI
    bun_ci_postinstall:
      isCI() &&
      (process.env.npm_lifecycle_event === "postinstall" ||
        process.argv.some((arg) => arg.includes("tools/dependencies.ts")) ||
        !dependenciesExist("kit/contracts/dependencies")),
  };

  const result = !!(
    checks.npm_lifecycle_event ||
    checks.npm_lifecycle_script ||
    checks.argv_postinstall ||
    checks.npm_command_install ||
    checks.bun_postinstall ||
    checks.bun_tools_deps ||
    checks.bun_ci_postinstall
  );

  return result;
}

/**
 * Check if we're in an early installation phase (tools not available)
 */
async function isEarlyInstallPhase(): Promise<boolean> {
  const tools = await checkToolsAvailable();
  const ci = isCI();
  const postInstall = isPostInstall();

  // We're in early install phase if:
  // 1. We're in CI AND postinstall AND tools aren't available
  // 2. OR dependencies don't exist yet AND tools aren't available
  const dependenciesExistNow = dependenciesExist("kit/contracts/dependencies");
  const isEarly =
    (ci && postInstall && (!tools.forge || !tools.helm)) ||
    (!dependenciesExistNow && (!tools.forge || !tools.helm));

  return isEarly;
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
  const postInstall = isPostInstall();
  const earlyInstall = await isEarlyInstallPhase();

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
    if (ci && !(postInstall || earlyInstall)) {
      log.warn(`Turbo execution completed with some failures: ${error}`);
      // In CI, check if critical dependencies (contracts) succeeded, but not during early phases
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

  const ci = isCI();
  const postInstall = isPostInstall();

  // Check if contracts dependencies were installed successfully
  const contractsDepsPath = "kit/contracts/dependencies";

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
    const tools = await checkToolsAvailable();

    // If we're during postinstall or in CI and tools aren't available, this might be expected
    if (postInstall || (ci && (!tools.forge || !tools.helm))) {
      log.warn(`Critical dependencies not found: ${error}`);
      log.info(
        `This is expected during ${postInstall ? "postinstall" : "early CI stages"} - dependencies will be installed when tools are available`
      );
      return; // Don't throw error in this case
    }

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
  const earlyInstall = await isEarlyInstallPhase();

  for (const workspace of workspaces) {
    log.info(`Installing dependencies for ${workspace.name}...`);

    // Check if required tool is available
    const toolAvailable = tools[workspace.requiresTool as keyof typeof tools];

    // Skip if required tool is not available AND we're in early phases
    if (!toolAvailable && (postInstall || earlyInstall)) {
      log.warn(
        `Skipping ${workspace.name} dependencies during ${postInstall ? "postinstall" : "early install phase"} (${workspace.requiresTool} not available yet)`
      );
      continue;
    }

    // If tool is not available and we're not in early phases, this is an error
    if (!toolAvailable && !(postInstall || earlyInstall)) {
      const errorMsg = `${workspace.requiresTool} not available for ${workspace.name} dependencies`;
      log.error(errorMsg);
      if (workspace.critical) {
        errors.push(errorMsg);
      }
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

      if (workspace.critical && !(postInstall || earlyInstall)) {
        // Only treat as critical error if not during postinstall or early install phase
        log.error(errorMsg);
        errors.push(errorMsg);
      } else {
        // Non-critical workspace failures or postinstall/early install failures are warnings
        if (ci || postInstall || earlyInstall) {
          const phase = postInstall
            ? "postinstall"
            : earlyInstall
              ? "early install phase"
              : "CI";
          log.warn(`${errorMsg} (non-critical during ${phase})`);
        } else {
          log.error(errorMsg);
          errors.push(errorMsg);
        }
      }
    }
  }

  if (errors.length > 0) {
    // During postinstall or early install phase in CI, don't treat tool unavailability as critical
    if ((postInstall || earlyInstall) && ci) {
      log.warn(
        `Some dependencies could not be installed during ${postInstall ? "postinstall" : "early install phase"}: ${errors.join(", ")}`
      );
      log.info(
        "This is expected when tools aren't available yet - dependencies will be installed later"
      );
      return; // Don't throw error during postinstall/early install in CI
    }

    throw new Error(
      `${errors.length} critical workspace(s) failed to install dependencies:\n${errors.join("\n")}`
    );
  }

  if (ci || postInstall || earlyInstall) {
    const phase = postInstall
      ? "postinstall"
      : earlyInstall
        ? "early install phase"
        : "CI";
    log.info(
      `Dependencies installation completed (some failures may have occurred during ${phase})`
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
  const earlyInstall = await isEarlyInstallPhase();

  try {
    log.info(
      `Starting dependency installation for Asset Tokenization Kit${ci ? " (CI mode)" : ""}${postInstall ? " (postinstall)" : ""}${earlyInstall ? " (early install phase)" : ""}...`
    );

    await validateRootDirectory();

    // Check tool availability first
    const tools = await checkToolsAvailable();

    // During postinstall or early install phase, be more forgiving but still try if tools are available
    if (postInstall || earlyInstall) {
      log.info(
        `Running during ${postInstall ? "postinstall" : "early install phase"} - will skip dependencies that require tools not yet installed`
      );

      // If we have tools available, try turbo, otherwise go directly to manual with tool checking
      if (tools.forge || tools.helm || tools.turbo) {
        log.info(
          "Some tools are available, attempting dependency installation..."
        );
        try {
          await runDependenciesViaTurbo();
        } catch (turboError) {
          log.warn(
            `Turbo execution failed during ${postInstall ? "postinstall" : "early install phase"}, will try manual execution with tool checking`
          );
          await runDependenciesManually();
        }
      } else {
        log.warn(
          "No required tools available, skipping dependency installation (will be retried later when tools are available)"
        );
        await runDependenciesManually(); // This will skip everything but log the attempts
      }
    } else {
      // Normal execution - tools should be available, so install dependencies
      log.info("Normal execution mode - installing dependencies...");
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
    if ((postInstall || earlyInstall) && ci) {
      // During postinstall or early install phase in CI, log the error but don't fail
      log.warn(
        `Dependencies installation had issues during ${postInstall ? "postinstall" : "early install phase"}: ${error}`
      );
      log.info("Dependencies can be installed later when tools are available");
      // Don't exit with error in early install phases
      return;
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

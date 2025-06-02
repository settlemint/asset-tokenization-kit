import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

/**
 * Finds the root of a turbo monorepo project
 * Can be called from the monorepo root or from within kit subprojects
 * Handles cases where kit projects have their own turbo.json files
 *
 * @param startPath - Optional starting path, defaults to current working directory
 * @returns Object containing paths to monorepo root and kit directory
 * @throws Error if monorepo root cannot be found
 */
export function findTurboRoot(startPath?: string) {
  const cwd = startPath || process.cwd();
  let currentDir = resolve(cwd);
  let foundMonorepoRoot: string | null = null;

  // Walk up the directory tree looking for the monorepo root
  while (currentDir !== dirname(currentDir)) {
    const turboConfigPath = join(currentDir, "turbo.json");
    const packageJsonPath = join(currentDir, "package.json");
    const kitPath = join(currentDir, "kit");

    // Check if this directory has turbo.json and kit directory
    if (
      existsSync(turboConfigPath) &&
      existsSync(kitPath) &&
      existsSync(packageJsonPath)
    ) {
      try {
        const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));

        // Check if it's a turbo monorepo root (has turbo dependency and kit directory)
        const hasTurboDep =
          packageJson.devDependencies?.turbo ||
          packageJson.dependencies?.turbo ||
          Object.keys(packageJson.scripts || {}).some((script) =>
            packageJson.scripts[script].includes("turbo")
          );

        if (hasTurboDep) {
          // This looks like the monorepo root - it has turbo.json, kit directory, and turbo dependency
          foundMonorepoRoot = currentDir;
          break;
        }
      } catch (error) {
        // Continue searching if package.json is malformed
        console.warn(
          `Malformed package.json at ${packageJsonPath}, continuing search...`
        );
      }
    }

    // Move up one directory
    currentDir = dirname(currentDir);
  }

  // If we didn't find a monorepo root with kit directory, try to find any turbo.json
  // This handles edge cases where the structure might be different
  if (!foundMonorepoRoot) {
    currentDir = resolve(cwd);

    while (currentDir !== dirname(currentDir)) {
      const turboConfigPath = join(currentDir, "turbo.json");
      const packageJsonPath = join(currentDir, "package.json");

      if (existsSync(turboConfigPath) && existsSync(packageJsonPath)) {
        try {
          const packageJson = JSON.parse(
            readFileSync(packageJsonPath, "utf-8")
          );

          const hasTurboDep =
            packageJson.devDependencies?.turbo ||
            packageJson.dependencies?.turbo ||
            Object.keys(packageJson.scripts || {}).some((script) =>
              packageJson.scripts[script].includes("turbo")
            );

          if (hasTurboDep) {
            foundMonorepoRoot = currentDir;
            break;
          }
        } catch (error) {
          console.warn(
            `Malformed package.json at ${packageJsonPath}, continuing search...`
          );
        }
      }

      currentDir = dirname(currentDir);
    }
  }

  if (!foundMonorepoRoot) {
    throw new Error(
      "Could not find turbo monorepo root. Make sure you're in a turbo monorepo."
    );
  }

  const kitPath = join(foundMonorepoRoot, "kit");

  // Verify kit directory exists, if not warn but continue
  if (!existsSync(kitPath)) {
    console.warn(
      `Kit directory not found at ${kitPath}, but continuing with monorepo root`
    );
  }

  return {
    monorepoRoot: foundMonorepoRoot,
    kitRoot: kitPath,
    isInKit: existsSync(kitPath) && cwd.includes(kitPath),
    relativePath: cwd.replace(foundMonorepoRoot, "").replace(/^[/\\]/, ""),
  };
}

/**
 * Gets the path to a specific kit project
 *
 * @param projectName - Name of the kit project (e.g., 'dapp', 'contracts', 'e2e')
 * @param startPath - Optional starting path
 * @returns Full path to the kit project
 * @throws Error if project doesn't exist
 */
export function getKitProjectPath(projectName: string, startPath?: string) {
  const { kitRoot } = findTurboRoot(startPath);
  const projectPath = join(kitRoot, projectName);

  if (!existsSync(projectPath)) {
    throw new Error(`Kit project '${projectName}' not found at ${projectPath}`);
  }

  return projectPath;
}

/**
 * Gets all available kit projects
 *
 * @param startPath - Optional starting path
 * @returns Array of kit project names
 */
export function getKitProjects(startPath?: string) {
  const { kitRoot } = findTurboRoot(startPath);

  try {
    return readdirSync(kitRoot).filter((item) => {
      const itemPath = join(kitRoot, item);
      return (
        statSync(itemPath).isDirectory() &&
        existsSync(join(itemPath, "package.json"))
      );
    });
  } catch (error) {
    throw new Error(`Failed to read kit directory: ${error}`);
  }
}

/**
 * Checks if the current working directory is within a kit project
 *
 * @param startPath - Optional starting path
 * @returns Object with information about current location
 */
export function getCurrentKitContext(startPath?: string) {
  const rootInfo = findTurboRoot(startPath);
  const cwd = startPath || process.cwd();

  if (!rootInfo.isInKit) {
    return {
      ...rootInfo,
      currentProject: null,
      isInKitProject: false,
    };
  }

  // Determine which kit project we're in
  const relativePath = cwd.replace(rootInfo.kitRoot, "").replace(/^[/\\]/, "");
  const projectName = relativePath.split(/[/\\]/)[0];

  return {
    ...rootInfo,
    currentProject: projectName,
    isInKitProject: true,
    projectPath: join(rootInfo.kitRoot, projectName),
  };
}

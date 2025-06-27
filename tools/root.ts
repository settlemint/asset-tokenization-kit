import { dirname, join, resolve } from 'node:path';
import { createLogger, type LogLevel } from '@settlemint/sdk-utils/logging';

const logger = createLogger({
  level: (process.env.SETTLEMINT_LOG_LEVEL as LogLevel) || 'info',
});

/**
 * Finds the root of a turbo monorepo project
 * Can be called from the monorepo root or from within kit subprojects
 * Handles cases where kit projects have their own turbo.json files
 *
 * @param startPath - Optional starting path, defaults to current working directory
 * @returns Object containing paths to monorepo root and kit directory
 * @throws Error if monorepo root cannot be found
 */
export async function findTurboRoot(startPath?: string) {
  const cwd = startPath || process.cwd();
  let currentDir = resolve(cwd);
  let foundMonorepoRoot: string | null = null;

  // Walk up the directory tree looking for the monorepo root
  while (currentDir !== dirname(currentDir)) {
    const turboConfigPath = join(currentDir, 'turbo.json');
    const packageJsonPath = join(currentDir, 'package.json');
    const currentKitPath = join(currentDir, 'kit');

    // Check if this directory has turbo.json and kit directory
    const turboFile = Bun.file(turboConfigPath);
    const packageFile = Bun.file(packageJsonPath);

    if ((await turboFile.exists()) && (await packageFile.exists())) {
      // Check if kit directory exists by trying to glob it
      let kitExists = false;
      try {
        const glob = new Bun.Glob('*');
        const scanner = glob.scan({ cwd: currentKitPath, onlyFiles: false });
        await scanner.next();
        kitExists = true;
      } catch {
        kitExists = false;
      }

      if (kitExists) {
        try {
          const packageJson = JSON.parse(await packageFile.text());

          // Check if it's a turbo monorepo root (has turbo dependency and kit directory)
          const hasTurboDep =
            packageJson.devDependencies?.turbo ||
            packageJson.dependencies?.turbo ||
            Object.keys(packageJson.scripts || {}).some((script) =>
              packageJson.scripts[script].includes('turbo')
            );

          if (hasTurboDep) {
            // This looks like the monorepo root - it has turbo.json, kit directory, and turbo dependency
            foundMonorepoRoot = currentDir;
            break;
          }
        } catch (error) {
          // Continue searching if package.json is malformed
          logger.warn(
            `Malformed package.json at ${packageJsonPath}, continuing search...`
          );
        }
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
      const turboConfigPath = join(currentDir, 'turbo.json');
      const packageJsonPath = join(currentDir, 'package.json');

      const turboFile = Bun.file(turboConfigPath);
      const packageFile = Bun.file(packageJsonPath);

      if ((await turboFile.exists()) && (await packageFile.exists())) {
        try {
          const packageJson = JSON.parse(await packageFile.text());

          const hasTurboDep =
            packageJson.devDependencies?.turbo ||
            packageJson.dependencies?.turbo ||
            Object.keys(packageJson.scripts || {}).some((script) =>
              packageJson.scripts[script].includes('turbo')
            );

          if (hasTurboDep) {
            foundMonorepoRoot = currentDir;
            break;
          }
        } catch (error) {
          logger.warn(
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

  const kitRootPath = join(foundMonorepoRoot, 'kit');

  // Verify kit directory exists, if not warn but continue
  let kitExists = false;
  try {
    const glob = new Bun.Glob('*');
    const scanner = glob.scan({ cwd: kitRootPath, onlyFiles: false });
    await scanner.next();
    kitExists = true;
  } catch {
    kitExists = false;
  }

  if (!kitExists) {
    logger.warn(
      `Kit directory not found at ${kitRootPath}, but continuing with monorepo root`
    );
  }

  return {
    monorepoRoot: foundMonorepoRoot,
    kitRoot: kitRootPath,
    isInKit: kitExists && cwd.includes(kitRootPath),
    relativePath: cwd.replace(foundMonorepoRoot, '').replace(/^[/\\]/, ''),
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
export async function getKitProjectPath(
  projectName: string,
  startPath?: string
) {
  const { kitRoot } = await findTurboRoot(startPath);
  const projectPath = join(kitRoot, projectName);

  // Check if directory exists
  let exists = false;
  try {
    const glob = new Bun.Glob('*');
    const scanner = glob.scan({ cwd: projectPath, onlyFiles: false });
    await scanner.next();
    exists = true;
  } catch {
    exists = false;
  }

  if (!exists) {
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
export async function getKitProjects(startPath?: string) {
  const { kitRoot } = await findTurboRoot(startPath);

  try {
    // Use glob to find all directories with package.json
    const glob = new Bun.Glob('*/package.json');
    const projects: string[] = [];

    for await (const file of glob.scan({ cwd: kitRoot })) {
      // Extract directory name from path (remove /package.json)
      const projectName = file.replace(/\/package\.json$/, '');
      projects.push(projectName);
    }

    return projects;
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
export async function getCurrentKitContext(startPath?: string) {
  const rootInfo = await findTurboRoot(startPath);
  const cwd = startPath || process.cwd();

  if (!rootInfo.isInKit) {
    return {
      ...rootInfo,
      currentProject: null,
      isInKitProject: false,
    };
  }

  // Determine which kit project we're in
  const relativePath = cwd.replace(rootInfo.kitRoot, '').replace(/^[/\\]/, '');
  const projectName = relativePath.split(/[/\\]/)[0];

  if (!projectName) {
    return {
      ...rootInfo,
      currentProject: null,
      isInKitProject: false,
    };
  }

  return {
    ...rootInfo,
    currentProject: projectName,
    isInKitProject: true,
    projectPath: join(rootInfo.kitRoot, projectName),
  };
}

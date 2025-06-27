#!/usr/bin/env bun

import { join, resolve } from 'node:path';
import { createLogger, type LogLevel } from '@settlemint/sdk-utils/logging';
import { $ } from 'bun';

const logger = createLogger({
  level: (process.env.SETTLEMINT_LOG_LEVEL as LogLevel) || 'info',
});

interface ExtractOptions {
  releaseName?: string;
  namespace?: string;
  outputDir?: string;
}

async function extractEnvFromHelmNotes(options: ExtractOptions = {}) {
  const {
    releaseName = 'atk',
    namespace = 'atk',
    outputDir = resolve(process.cwd(), '../../'),
  } = options;

  try {
    // Get the helm notes output
    logger.info(
      `Extracting environment configuration from Helm release '${releaseName}' in namespace '${namespace}'...`
    );

    const notesResult =
      await $`helm get notes ${releaseName} -n ${namespace}`.text();

    if (!notesResult) {
      throw new Error('No notes found for the specified release');
    }

    // Find the .env section
    const envStartMarker = '=== .env ===';
    const envLocalStartMarker = '=== .env.local ===';
    const sectionEndMarker =
      '========================================================================';

    const envStart = notesResult.indexOf(envStartMarker);
    const envLocalStart = notesResult.indexOf(envLocalStartMarker);

    if (envStart === -1 || envLocalStart === -1) {
      throw new Error(
        'Could not find environment variable sections in helm notes'
      );
    }

    // Extract .env content
    const envEndSearch = notesResult.indexOf('\n\n', envStart);
    const envContent = notesResult
      .substring(envStart + envStartMarker.length, envEndSearch)
      .trim();

    // Extract .env.local content
    const envLocalEndSearch = notesResult.indexOf(
      sectionEndMarker,
      envLocalStart
    );
    const envLocalContent = notesResult
      .substring(envLocalStart + envLocalStartMarker.length, envLocalEndSearch)
      .trim();

    // Ensure output directory exists using Bun's file I/O
    const outputDirFile = Bun.file(join(outputDir, '.gitkeep'));
    if (!(await outputDirFile.exists())) {
      // Create directory by writing a temp file
      await Bun.write(join(outputDir, '.gitkeep'), '');
      await Bun.file(join(outputDir, '.gitkeep')).unlink();
    }

    // Write .env file
    const envPath = join(outputDir, '.env');
    await Bun.write(envPath, envContent + '\n');
    logger.info(`Created ${envPath}`);

    // Write .env.local file
    const envLocalPath = join(outputDir, '.env.local');
    await Bun.write(envLocalPath, envLocalContent + '\n');
    logger.info(`Created ${envLocalPath}`);

    // Display a summary
    logger.info('\nEnvironment files created successfully!');
    logger.warn('\nImportant notes:');
    logger.warn(
      '   - Review and update the MinIO credentials (marked with <MINIO_ACCESS_KEY> and <MINIO_SECRET_KEY>)'
    );
    logger.warn(
      '   - These files contain sensitive information - do not commit them to version control'
    );
    logger.warn(
      '   - Add .env and .env.local to your .gitignore if not already present'
    );
  } catch (err) {
    logger.error('Error extracting environment configuration:', err);
    if (err instanceof Error && err.message.includes('not found')) {
      logger.error('\nMake sure:');
      logger.error('   - Helm is installed and available in your PATH');
      logger.error('   - The release name and namespace are correct');
      logger.error(
        '   - You have the necessary permissions to access the release'
      );
    }
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const options: ExtractOptions = {};

for (let i = 0; i < args.length; i++) {
  switch (args[i]) {
    case '--release':
    case '-r':
      options.releaseName = args[++i];
      break;
    case '--namespace':
    case '-n':
      options.namespace = args[++i];
      break;
    case '--output':
    case '-o':
      options.outputDir = args[++i];
      break;
    case '--help':
    case '-h':
      logger.info(`
Usage: bun run extract-env.ts [options]

Options:
  -r, --release <name>      Helm release name (default: atk)
  -n, --namespace <name>    Kubernetes namespace (default: atk)
  -o, --output <dir>        Output directory for env files (default: ../../)
  -h, --help                Show this help message

Example:
  bun run extract-env.ts --release my-atk --namespace production --output ./config
`);
      process.exit(0);
  }
}

// Run the extraction
await extractEnvFromHelmNotes(options);

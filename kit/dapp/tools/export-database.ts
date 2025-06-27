#!/usr/bin/env bun

import { $ } from 'bun';
import { join } from 'path';

// Export database schema within the workspace
const outputDir = join(import.meta.dir, '../.generated');
const outputPath = join(outputDir, 'database-export.sql');

// Create output directory
await $`mkdir -p ${outputDir}`.quiet();

// Export database schema
const header = '\\c hasura;\n';
const schemaResult = await $`drizzle-kit export`.text();
const content = header + schemaResult;

// Write to workspace directory
await Bun.write(outputPath, content);

console.log(`Database schema exported to: ${outputPath}`);

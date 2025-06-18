#!/usr/bin/env bun

import { $ } from 'bun';
import { join } from 'path';

// Export database schema within the workspace
const workspaceOutputPath = join(import.meta.dir, '../database-export.sql');
const dockerOutputPath = join(import.meta.dir, '../../../tools/docker/postgres/atk.sql');

// Export database schema
const header = '\\c hasura;\n';
const schemaResult = await $`drizzle-kit export`.text();
const content = header + schemaResult;

// Write to workspace directory for caching
await Bun.write(workspaceOutputPath, content);

// Also write to docker location for runtime
await Bun.write(dockerOutputPath, content);

console.log(`Database schema exported to:`);
console.log(`  - ${workspaceOutputPath} (for caching)`);
console.log(`  - ${dockerOutputPath} (for docker-compose)`);
#!/usr/bin/env bun

import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import { join } from 'path';

// Export database schema within the workspace
const outputPath = join(import.meta.dir, '../database-export.sql');

// Export database schema
const header = '\\c hasura;\n';
const schema = execSync('drizzle-kit export', { encoding: 'utf-8' });

// Write to workspace directory
writeFileSync(outputPath, header + schema);

console.log(`Database schema exported to: ${outputPath}`);
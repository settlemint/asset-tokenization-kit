#!/usr/bin/env bun

import { execSync } from 'child_process';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';

// Ensure output directory exists
const outputPath = join(import.meta.dir, '../postgres/atk.sql');
mkdirSync(dirname(outputPath), { recursive: true });

// Export database schema
const header = '\\c hasura;\n';
const schema = execSync('cd ../dapp && drizzle-kit export', { encoding: 'utf-8' });

// Write to artifacts directory
writeFileSync(outputPath, header + schema);

console.log(`Database schema exported to: ${outputPath}`);
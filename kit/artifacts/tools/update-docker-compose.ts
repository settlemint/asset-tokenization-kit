#!/usr/bin/env bun

import { readFileSync, writeFileSync } from 'fs';
import { load, dump } from 'js-yaml';
import { join } from 'path';

// Read the subgraph hash from the subgraph output
const subgraphPath = join(import.meta.dir, '../../subgraph/subgraph-output.txt');
const subgraphHash = readFileSync(subgraphPath, 'utf-8').trim();

// Read the docker-compose.yml file
const dockerComposePath = join(import.meta.dir, '../../../docker-compose.yml');
const dockerComposeContent = readFileSync(dockerComposePath, 'utf-8');

// Parse YAML
const dockerCompose = load(dockerComposeContent) as any;

// Update the subgraph hash
if (dockerCompose.services && dockerCompose.services['graph-node'] && dockerCompose.services['graph-node'].environment) {
  dockerCompose.services['graph-node'].environment.SUBGRAPH = `kit:${subgraphHash}`;
}

// Write back to docker-compose.yml
const updatedContent = dump(dockerCompose, {
  lineWidth: -1,
  noRefs: true,
  sortKeys: false
});

writeFileSync(dockerComposePath, updatedContent);

console.log(`Updated docker-compose.yml with subgraph hash: ${subgraphHash}`);
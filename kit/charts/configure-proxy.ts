import { join } from 'node:path';

const HARBOR_PROXY = 'harbor.settlemint.com';

async function processFile(filePath: string): Promise<void> {
  try {
    const content = await Bun.file(filePath).text();
    const lines = content.split('\n');

    // Check if there's a features.kits section
    let inFeaturesSection = false;
    let inKitsSection = false;
    let inCustomDeployment = false;
    let inCodeStudio = false;
    let featuresSectionIndent = '';

    const modifiedLines = lines.map((line) => {
      // Track if we're entering or leaving the features section
      if (line.trim() === 'features:') {
        inFeaturesSection = true;
        featuresSectionIndent = line.match(/^\s*/)?.[0] || '';
      }
      // If we're in features section and find a kits: entry
      else if (inFeaturesSection && line.trim() === 'kits:') {
        inKitsSection = true;
      }
      // Track customDeployment and codeStudio sections within kits
      else if (inKitsSection && line.trim() === 'customDeployment:') {
        inCustomDeployment = true;
        inCodeStudio = false;
      } else if (inKitsSection && line.trim() === 'codeStudio:') {
        inCodeStudio = true;
        inCustomDeployment = false;
      }
      // If we're in features section and find another top-level section
      else if (
        inFeaturesSection &&
        !line.startsWith(`${featuresSectionIndent} `) &&
        line.trim() !== ''
      ) {
        inFeaturesSection = false;
        inKitsSection = false;
        inCustomDeployment = false;
        inCodeStudio = false;
      }

      // Skip modifying lines in the kits.customDeployment section
      if (inKitsSection && inCustomDeployment) {
        return line;
      }

      // Process registry: values
      if (line.includes('registry:') && !line.includes(`${HARBOR_PROXY}/`)) {
        const registryMatch = line.match(/(\s+registry:\s+)([^\s\n]+)/);
        if (
          registryMatch &&
          registryMatch[2] !== HARBOR_PROXY &&
          !registryMatch[2].startsWith(`${HARBOR_PROXY}/`)
        ) {
          console.log(
            `Prefixing registry: ${registryMatch[2]} with ${HARBOR_PROXY}/`
          );
          return line.replace(
            /(\s+registry:\s+)([^\s\n]+)/,
            `$1${HARBOR_PROXY}/$2`
          );
        }
      }

      // Process imageRegistry: values
      if (
        line.includes('imageRegistry:') &&
        !line.includes(`${HARBOR_PROXY}/`)
      ) {
        const registryMatch = line.match(/(\s+imageRegistry:\s+)([^\s\n]+)/);
        if (
          registryMatch &&
          registryMatch[2] !== HARBOR_PROXY &&
          !registryMatch[2].startsWith(`${HARBOR_PROXY}/`)
        ) {
          console.log(
            `Prefixing imageRegistry: ${registryMatch[2]} with ${HARBOR_PROXY}/`
          );
          return line.replace(
            /(\s+imageRegistry:\s+)([^\s\n]+)/,
            `$1${HARBOR_PROXY}/$2`
          );
        }
      }

      // Replace name: ghcr.io with name: harbor.settlemint.com
      if (line.includes('name:') && line.includes('ghcr.io')) {
        console.log(`Replacing name: ghcr.io with ${HARBOR_PROXY}`);
        return line.replace(/(\s+name:\s+)ghcr\.io/, `$1${HARBOR_PROXY}`);
      }

      // Process repository: values
      if (line.includes('repository:')) {
        const repoMatch = line.match(/(\s+repository:\s+)([^\s\n]+)/);
        if (repoMatch) {
          const repoValue = repoMatch[2];
          let modifiedLine = line; // Store potential modification
          let needsReplacing = false;

          if (
            repoValue.includes('registry.k8s.io') &&
            !repoValue.includes(`${HARBOR_PROXY}/registry.k8s.io`)
          ) {
            const newValue = repoValue.replace(
              'registry.k8s.io',
              `${HARBOR_PROXY}/registry.k8s.io`
            );
            console.log(`Replacing repository: ${repoValue} with ${newValue}`);
            modifiedLine = line.replace(repoValue, newValue);
            needsReplacing = true;
          } else if (
            repoValue.includes('quay.io') &&
            !repoValue.includes(`${HARBOR_PROXY}/quay.io`)
          ) {
            const newValue = repoValue.replace(
              'quay.io',
              `${HARBOR_PROXY}/quay.io`
            );
            console.log(`Replacing repository: ${repoValue} with ${newValue}`);
            modifiedLine = line.replace(repoValue, newValue);
            needsReplacing = true;
          } else if (
            repoValue.includes('ghcr.io') &&
            !repoValue.includes(`${HARBOR_PROXY}/ghcr.io`)
          ) {
            const newValue = repoValue.replace(
              'ghcr.io',
              `${HARBOR_PROXY}/ghcr.io`
            );
            console.log(`Replacing repository: ${repoValue} with ${newValue}`);
            modifiedLine = line.replace(repoValue, newValue);
            needsReplacing = true;
          } else if (
            repoValue.includes('docker.io') &&
            !repoValue.includes(`${HARBOR_PROXY}/docker.io`)
          ) {
            const newValue = repoValue.replace(
              'docker.io',
              `${HARBOR_PROXY}/docker.io`
            );
            console.log(`Replacing repository: ${repoValue} with ${newValue}`);
            modifiedLine = line.replace(repoValue, newValue);
            needsReplacing = true;
          }

          if (needsReplacing) {
            return modifiedLine;
          }
        }
      }

      // Process image: values
      if (line.includes('image:') && !line.includes('imageRegistry')) { // Avoid matching imageRegistry again
        const imageMatch = line.match(/(\s+image:\s+)([^\s\n]+)/);
        if (imageMatch) {
          const imageValue = imageMatch[2];
          let modifiedLine = line;
          let needsReplacing = false;

          if (
            imageValue.includes('registry.k8s.io') &&
            !imageValue.includes(`${HARBOR_PROXY}/registry.k8s.io`)
          ) {
            const newValue = imageValue.replace(
              'registry.k8s.io',
              `${HARBOR_PROXY}/registry.k8s.io`
            );
            console.log(`Replacing image: ${imageValue} with ${newValue}`);
            modifiedLine = line.replace(imageValue, newValue);
            needsReplacing = true;
          } else if (
            imageValue.includes('quay.io') &&
            !imageValue.includes(`${HARBOR_PROXY}/quay.io`)
          ) {
            const newValue = imageValue.replace(
              'quay.io',
              `${HARBOR_PROXY}/quay.io`
            );
            console.log(`Replacing image: ${imageValue} with ${newValue}`);
            modifiedLine = line.replace(imageValue, newValue);
            needsReplacing = true;
          } else if (
            imageValue.includes('ghcr.io') &&
            !imageValue.includes(`${HARBOR_PROXY}/ghcr.io`)
          ) {
            const newValue = imageValue.replace(
              'ghcr.io',
              `${HARBOR_PROXY}/ghcr.io`
            );
            console.log(`Replacing image: ${imageValue} with ${newValue}`);
            modifiedLine = line.replace(imageValue, newValue);
            needsReplacing = true;
          } else if (
            imageValue.includes('docker.io') &&
            !imageValue.includes(`${HARBOR_PROXY}/docker.io`)
          ) {
            const newValue = imageValue.replace(
              'docker.io',
              `${HARBOR_PROXY}/docker.io`
            );
            console.log(`Replacing image: ${imageValue} with ${newValue}`);
            modifiedLine = line.replace(imageValue, newValue);
            needsReplacing = true;
          }

          if (needsReplacing) {
            return modifiedLine;
          }
        }
      }

      return line;
    });

    const modifiedContent = modifiedLines.join('\n');

    // Check if any changes were made
    if (modifiedContent !== content) {
      console.log(`Updated registry values in ${filePath}`);
      await Bun.write(filePath, modifiedContent);
    } else {
      console.log(`No changes needed in ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}

const files = [
  join(__dirname, 'atk', 'values.yaml'),
  join(__dirname, 'atk', 'values-prod.yaml'),
  join(__dirname, 'atk', 'values-example.yaml'),
  join(__dirname, 'atk', 'charts', 'besu-network', 'values.yaml'),
  join(__dirname, 'atk', 'charts', 'besu-network', 'charts', 'besu-node', 'values.yaml'),
  join(__dirname, 'atk', 'charts', 'besu-network', 'charts', 'besu-genesis', 'values.yaml'),
  join(__dirname, 'atk', 'charts', 'blockscout', 'values.yaml'),
  join(__dirname, 'atk', 'charts', 'dapp', 'values.yaml'),
  join(__dirname, 'atk', 'charts', 'erpc', 'values.yaml'),
  join(__dirname, 'atk', 'charts', 'hasura', 'values.yaml'),
  join(__dirname, 'atk', 'charts', 'observability', 'values.yaml'),
  join(__dirname, 'atk', 'charts', 'portal', 'values.yaml'),
  join(__dirname, 'atk', 'charts', 'support', 'values.yaml'),
  join(__dirname, 'atk', 'charts', 'thegraph', 'values.yaml'),
  join(__dirname, 'atk', 'charts', 'txsigner', 'values.yaml'),
];

async function main() {
  try {
    // Process files sequentially for clearer debugging
    for (const file of files) {
      await processFile(file);
    }
  } catch (error) {
    console.error('Error processing files:', error);
  }
}

await main();

# Asset Tokenization Kit Helm Chart

This Helm chart deploys the complete Asset Tokenization Kit infrastructure, including all necessary components for running a full-featured tokenization platform.

## Prerequisites

- Kubernetes 1.19+
- Helm 3.2.0+
- PV provisioner support in the underlying infrastructure
- LoadBalancer support (for production deployments)

## Components

The ATK Helm chart includes the following components:

- Portal
- Besu Network
- ERPC
- Blockscout
- TheGraph
- Observability Stack
- Support Services

## Installation

### 1. Add the Helm repository

```bash
helm repo add atk https://charts.settlemint.com
helm repo update
```

### 2. Generate Contract ABIs

Before installing the chart, you need to generate the contract ABIs and place them in the correct location. Follow these steps:

1. Navigate to the contracts directory:
```bash
cd kit/contracts
```

2. Run the following commands in sequence:
```bash
# Install dependencies
bun dependencies

# Compile contracts
bun compile:forge

# Generate ABI files
bun abi-output
```

3. Create the ABIs directory in the portal chart:
```bash
mkdir -p ../charts/atk/charts/portal/abis
```

4. Copy the generated ABI files:
```bash
cp portal/*.json ../charts/atk/charts/portal/abis/
```

> **Note**: The ABI files are essential for the portal to interact with the smart contracts. Make sure to regenerate and copy them whenever you make changes to the contracts.

### 3. Install the chart

```bash
helm install atk settlemint/atk -f values.yaml -f values-example.yaml
```

## Configuration

### Global Labels

All resources created by this chart and its subcharts will automatically include the following labels through Helm's global values:

```yaml
global:
  labels:
    kots.io/app-slug: settlemint-atk
    app.kubernetes.io/part-of: settlemint-atk
    app.kubernetes.io/managed-by: helm
```

These labels are automatically included in all resources through the `atk.labels` helper template. To use these labels in your templates, include them like this:

```yaml
metadata:
  labels:
    {{- include "atk.labels" . | nindent 4 }}
```

You can add additional global labels by modifying the `global.labels` section in your values file:

```yaml
global:
  labels:
    environment: production
    team: blockchain
```

The labels will be applied to all resources across the following components:
- Besu Network
- ERPC
- Blockscout
- TheGraph
- Hasura
- Portal
- Support Services
- Observability Stack

> **Note**: This approach uses Helm's built-in global value passing mechanism, ensuring consistent label application across all components.

### Global Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `imagePullSecrets` | Global Docker registry secret names as an array | `[]` |
| `nameOverride` | String to partially override atk.fullname | `""` |
| `fullnameOverride` | String to fully override atk.fullname | `""` |

### Portal Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `portal.enabled` | Enable Portal deployment | `true` |
| `portal.image.repository` | Portal image repository | `settlemint/atk-portal` |
| `portal.image.tag` | Portal image tag | `latest` |

[Additional configuration parameters...]

## Troubleshooting

### Common Issues

1. **Missing ABI Files**
   - Symptom: Portal fails to interact with contracts
   - Solution: Ensure you've generated and copied the ABI files to `charts/portal/abis/`

2. **Contract Compilation Errors**
   - Symptom: `bun compile:forge` fails
   - Solution: Check contract syntax and dependencies

[Additional troubleshooting information...]

## Development

### Updating ABIs

When you make changes to the smart contracts, you need to:

1. Recompile the contracts
2. Regenerate the ABIs
3. Update the portal chart

```bash
cd kit/contracts
bun dependencies
bun compile:forge
bun abi-output
cp portal/*.json ../charts/atk/charts/portal/abis/
```

## License

Copyright (c) 2025 SettleMint. All rights reserved.

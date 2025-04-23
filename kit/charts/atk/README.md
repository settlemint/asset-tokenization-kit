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

### 1. Log in to Harbor Registry

```bash
helm registry login harbor.settlemint.com \
  --username <your-harbor-username> \
  --password <your-harbor-password-or-token>
```

### 2. Add the Helm repository

```bash
helm repo add atk https://harbor.settlemint.com
helm repo update
```

### 3. Install the chart

Install the chart using the appropriate values file for your environment.

**For Development:**

```bash
helm install atk-dev atk/atk -f values.yaml --namespace <your-dev-namespace>
```

**For Production:**

```bash
helm install atk-prod atk/atk -f values-prod.yaml --namespace <your-prod-namespace>
```

Replace `<your-dev-namespace>` and `<your-prod-namespace>` with the target Kubernetes namespaces.

## Configuration

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

### Besu Parameters

| Parameter          | Description                  | Default |
|--------------------|------------------------------|---------|
| `besu.enabled`     | Enable Besu deployment       | `true`  |
| `besu.image.repo`  | Besu image repository        | `...`   |
| `besu.image.tag`   | Besu image tag               | `...`   |
| [...more Besu parameters...] | ...                          | ...     |

### ERPC Parameters

| Parameter          | Description                  | Default |
|--------------------|------------------------------|---------|
| `erpc.enabled`     | Enable ERPC deployment       | `true`  |
| `erpc.image.repo`  | ERPC image repository        | `...`   |
| `erpc.image.tag`   | ERPC image tag               | `...`   |
| [...more ERPC parameters...] | ...                          | ...     |

### Blockscout Parameters

| Parameter              | Description                      | Default |
|------------------------|----------------------------------|---------|
| `blockscout.enabled`   | Enable Blockscout deployment     | `true`  |
| `blockscout.image.repo`| Blockscout image repository    | `...`   |
| `blockscout.image.tag` | Blockscout image tag           | `...`   |
| [...more Blockscout parameters...] | ...                              | ...     |

### Hasura Parameters

| Parameter          | Description                  | Default |
|--------------------|------------------------------|---------|
| `hasura.enabled`   | Enable Hasura deployment     | `true`  |
| `hasura.image.repo`| Hasura image repository      | `...`   |
| `hasura.image.tag` | Hasura image tag             | `...`   |
| [...more Hasura parameters...] | ...                          | ...     |

### TheGraph Parameters

| Parameter            | Description                    | Default |
|----------------------|--------------------------------|---------|
| `thegraph.enabled`   | Enable TheGraph deployment     | `true`  |
| `thegraph.image.repo`| TheGraph image repository      | `...`   |
| `thegraph.image.tag` | TheGraph image tag             | `...`   |
| [...more TheGraph parameters...] | ...                            | ...     |

## License

Copyright (c) 2025 SettleMint. All rights reserved.

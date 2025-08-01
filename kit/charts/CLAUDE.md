# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

```bash
# Development workflow
bun run helm:check-context     # Verify you're in orbstack context
bun run helm:secrets          # Inject secrets from 1Password (required before deploy)
bun run helm:subgraph         # Update subgraph hash after contract changes
bun run helm                  # Deploy/upgrade ATK to OrbStack

# After deployment
bun run helm:extract-env      # Extract .env files from deployed services
bun run helm:connect          # Connect to deployed services

# Package management
bun run package:ecr           # Update image registries to ECR (requires ECR_REGISTRY env)
bun run package:harbor        # Package for Harbor registry
bun run package:version       # Update chart versions

# Testing & validation
helm lint atk                 # Lint the umbrella chart
helm template atk ./atk --debug --dry-run  # Test template rendering
bun run xlint                 # Run chart-testing lint

# Utilities
bun run reset                 # Reset OrbStack Kubernetes cluster
bun run dependencies          # Update Helm dependencies
```

## Architecture Overview

### Umbrella Chart Pattern
The ATK uses a main umbrella chart (`atk/`) that orchestrates multiple sub-charts. This design:
- Centralizes configuration through `atk/values.yaml`
- Provides common helper templates in `atk/templates/_common-helpers.tpl`
- Enables/disables sub-charts conditionally via `<subchart>.enabled` flags

### Critical Architecture Decisions

1. **Common Helpers Requirement**: Sub-charts MUST use the umbrella chart's common helpers and cannot be deployed independently. This enforces consistency but means you must always deploy through the umbrella chart.

2. **Image Pull Secrets**: Three registry types are supported (harbor, ghcr, docker). Secrets are created by the umbrella chart and referenced by sub-charts.

3. **Init Container Pattern**: Services use two types of init containers:
   - TCP checks for basic connectivity
   - GraphQL checks for API readiness

4. **Configuration Hierarchy**:
   ```
   atk/values.yaml (defaults)
   ↓
   tools/values-orbstack.1p.yaml (1Password template)
   ↓
   tools/values-orbstack.yaml (injected secrets)
   ```

### Service Dependencies Graph
```
PostgreSQL ← Hasura ← DApp
    ↑          ↑        ↑
    |          |        |
Blockscout  Graph-Node  |
    |          |        |
    └──────────┴────────┘
           Portal
              ↑
         Transaction
           Signer
```

## Working with Values Files

### Empty Value Handling
When cleaning values for production (e.g., AWS Marketplace), empty YAML values must be handled carefully:
- Empty objects: Use `{}` (e.g., `image: {}`)
- Empty strings: Use `""` with comment (e.g., `password: ""  # Must be provided`)
- Empty lists: Use `[]`

### Image Pull Secrets Configuration

**IMPORTANT**: Image pull secrets have been centralized in the environment-specific values files for better security and maintainability.

#### Current Architecture (as of 2025-08-01)
- **Main values.yaml**: No longer contains any imagePullSecrets - only empty registries configuration
- **tools/values-orbstack.1p.yaml**: Contains all imagePullSecrets for local development with 1Password references
- **Production deployments**: Should use their own values file with appropriate imagePullSecrets

#### Format
Always use the object format with `name` field:
```yaml
imagePullSecrets:
  - name: image-pull-secret-docker  # Correct
# NOT: - image-pull-secret-docker   # Wrong
```

#### Adding imagePullSecrets to a Service
Add to the environment-specific values file (e.g., `tools/values-orbstack.1p.yaml`):
```yaml
service-name:
  imagePullSecrets:
    - name: image-pull-secret-docker
    - name: image-pull-secret-ghcr
    - name: image-pull-secret-harbor
```

## Common Pitfalls

1. **Loki Configuration**: The `loki:` key under observability must have proper indentation for `singleBinary`
2. **Global Values**: Many sub-charts expect `global: {}` even if empty
3. **ECR Registry**: When using `package:ecr`, ensure ECR_REGISTRY env var is set
4. **Bitnami Charts**: Support sub-charts use Bitnami patterns which may conflict with custom helpers

## Deployment States

### Pre-install Hooks
Besu network nodes use Jobs for initialization. These must complete before the main pods start.

### Service Readiness Order
1. PostgreSQL and Redis (data layer)
2. Besu network (blockchain)
3. Graph Node, Hasura, Portal (middleware)
4. Blockscout, eRPC (user-facing)
5. DApp (frontend)

## Testing Requirements

**Every Helm chart modification MUST be tested on OrbStack before committing:**

1. Run `helm template` to verify syntax
2. Deploy to OrbStack with `bun run helm`
3. Verify all pods start: `kubectl get pods -n atk`
4. Check no resources are stuck in Init/Pending state
5. Verify ingresses are created: `kubectl get ingress -n atk`

## Chart Development Patterns

### Adding Configuration to Sub-chart
1. Add to sub-chart's `values.yaml`
2. Add defaults to umbrella chart's `values.yaml` under the sub-chart key
3. Use in templates with `.Values.<key>` (sub-chart) or `.Values.<subchart>.<key>` (umbrella)

### Using Common Helpers
```yaml
# In any sub-chart template:
{{- include "atk.common.labels" . }}
{{- include "atk.common.imagePullSecrets" . }}
```

### Contract Artifacts Integration
- Artifacts are packaged in `ghcr.io/settlemint/asset-tokenization-kit-artifacts` image
- Genesis and ABI files are mounted via init containers
- Version controlled through `global.artifacts.image.tag`

## Debugging Deployments

```bash
# Check failing pods
kubectl get pods -n atk | grep -v Running

# View pod events
kubectl describe pod <pod-name> -n atk

# Check init container logs
kubectl logs <pod-name> -c <init-container-name> -n atk

# View helm release status
helm status atk -n atk

# Get deployed manifest
helm get manifest atk -n atk > deployed.yaml
```

## Security Notes

- Production values should never contain hardcoded passwords
- Use external secret management (Kubernetes Secrets, Vault, etc.)
- Image pull secrets are required for private registries
- Network policies should be enabled in production (`global.networkPolicy.enabled: true`)
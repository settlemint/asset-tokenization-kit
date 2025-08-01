# Charts

## Stack
Helm v3 | K8s | Umbrella pattern | Bitnami dependencies

## Commands
```bash
bun run helm:secrets    # 1Password injection (REQUIRED)
bun run helm           # Deploy to OrbStack
helm lint atk          # Validate syntax
bun run helm:extract-env # Get .env files
```

## Architecture

### Umbrella Pattern
```
atk/ (main chart)
├── Chart.yaml         # Dependencies
├── values.yaml        # Centralized config
└── templates/
    ├── _common-helpers.tpl  # Shared templates
    └── image-pull.secrets.yaml
```

### Sub-charts
- Conditional: `<chart>.enabled: true`
- Local: `file://./charts/dapp`
- Remote: Bitnami, etc.

### Dependencies Graph
```
PostgreSQL ← Hasura ← DApp
    ↑          ↑        ↑
Blockscout  Graph-Node  Portal
              ↑
         TxSigner
```

## Patterns

### Init Containers
```yaml
# TCP check
while ! nc -z service port; do sleep 2; done

# GraphQL readiness
query { __schema { queryType { name } } }
```

### Values Hierarchy
```yaml
global:           # Cross-chart config
  networkPolicy:
    enabled: true
  
dapp:            # Sub-chart overrides
  enabled: true
  image:
    tag: latest
```

### Image Pull Secrets
```yaml
# Environment-specific (values-orbstack.1p.yaml)
dapp:
  imagePullSecrets:
    - name: image-pull-secret-docker
```

### Common Helpers
```yaml
# In sub-chart templates
{{- include "atk.common.labels" . }}
{{- include "atk.common.imagePullSecrets" . }}
```

## Testing

1. `helm template atk ./atk --debug`
2. `bun run helm`
3. `kubectl get pods -n atk`
4. No Init/Pending states
5. Check ingresses

## Common Issues

1. **Values format**: `{}` for empty objects
2. **Secrets**: Use `- name: secret` format
3. **Bitnami conflicts**: Check helper names
4. **Init order**: Services wait for deps

## Security

- No hardcoded passwords
- External secrets (Vault, K8s)
- Network policies in prod
- Registry auth required
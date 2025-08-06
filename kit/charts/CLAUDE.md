# Charts

## Stack
Helm v3 | K8s | Umbrella pattern | Bitnami dependencies

## Commands
```bash
bun run helm:secrets    # 1Password injection (REQUIRED)
bun run helm           # Deploy to OrbStack
bun run reset          # Reset cluster (DO NOT use helm uninstall)
helm lint atk          # Validate syntax
bun run helm:extract-env # Get .env files
```

## CRITICAL: Deployment Validation After Changes

**MANDATORY**: After ANY Helm chart changes, you MUST:
1. Run `bun run reset` to clean the cluster
2. Deploy with `bun run helm`
3. Verify ALL pods are running: `kubectl get pods -n atk`
4. Check for any Init/Pending/CrashLoopBackOff states
5. If any pods fail, investigate with `kubectl describe pod <pod-name> -n atk`

**NEVER** consider a Helm chart change complete without successful deployment verification!

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
# Dynamic registry configuration (values-orbstack.1p.yaml)
imagePullCredentials:
  registries:
    docker:
      enabled: true
      registry: docker.io
      username: "op://platform/dockerhub/username"
      password: "op://platform/dockerhub/credential"
      email: "op://platform/dockerhub/email"
```

### Common Helpers
```yaml
# In sub-chart templates
{{- include "atk.common.labels" . }}
{{- include "atk.common.imagePullSecrets" . }}
```

### Third-party Chart Integration
For third-party charts (like blockscout-stack) that don't support our common helpers:
- Pass imagePullSecrets explicitly in their values
- Reference the global secret names:
  ```yaml
  imagePullSecrets:
    - name: image-pull-secret-docker
    - name: image-pull-secret-ghcr
    - name: image-pull-secret-harbor
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

## K8s Best Practices

### Resource Management
```yaml
resources:
  requests:
    memory: "256Mi"
    cpu: "100m"
  limits:
    memory: "512Mi"
    cpu: "500m"
```

### Health Checks
```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /ready
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 5
```

### Autoscaling
```yaml
autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 10
  targetCPUUtilizationPercentage: 80
  targetMemoryUtilizationPercentage: 80
```

### Pod Disruption Budgets
```yaml
podDisruptionBudget:
  minAvailable: 1
  maxUnavailable: 50%
```

### Network Policies
```yaml
networkPolicy:
  enabled: true
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              name: atk
```

### RBAC
```yaml
serviceAccount:
  create: true
  annotations: {}
  name: ""
```
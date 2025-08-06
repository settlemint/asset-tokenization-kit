# Charts Module

## Stack
Helm v3 | K8s | Umbrella pattern | Bitnami dependencies

## Key Commands
```bash
bun run helm:secrets     # 1Password injection (REQUIRED)
bun run helm            # Deploy to OrbStack
bun run reset           # Reset cluster (DON'T use helm uninstall)
helm lint atk           # Validate syntax
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


<example>
atk/ (main chart)
├── Chart.yaml          # Dependencies
├── values.yaml         # Centralized config
└── templates/
    ├── _common-helpers.tpl     # Shared templates
    └── image-pull.secrets.yaml
</example>

## Dependency Graph
```
PostgreSQL ← Hasura ← DApp
    ↑          ↑        ↑
Blockscout  Graph-Node  Portal
              ↑
         TxSigner
```

## Critical Patterns

<example>
# Init Container (wait for service)
while ! nc -z service port; do sleep 2; done

# GraphQL readiness check
query { __schema { queryType { name } } }
</example>

<example>
# Values hierarchy
global:              # Cross-chart config
  networkPolicy:
    enabled: true
    
dapp:               # Sub-chart overrides
  enabled: true
  image:
    tag: latest
</example>

<example>
# Image pull secrets (1Password)
imagePullCredentials:
  registries:
    docker:
      username: "op://platform/dockerhub/username"
      password: "op://platform/dockerhub/credential"
</example>

## Common Issues
- Values format: Use `{}` for empty objects
- Secret format: Use `- name: secret`
- Init order: Services must wait for dependencies
- Bitnami conflicts: Check helper name collisions

## Best Practices
- No hardcoded passwords
- Resource limits always
- Health checks required
- Network policies in prod
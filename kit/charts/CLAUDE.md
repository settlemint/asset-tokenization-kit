# CLAUDE.md - Charts Package

## Purpose

Helm charts for deploying the Asset Tokenization Kit to Kubernetes. Provides production-ready configurations for the dApp, transaction signer, and supporting infrastructure. Handles secrets, scaling, ingress, and environment-specific configurations.

## Layout

```
charts/
├── atk/                # Main umbrella chart
│   ├── charts/        # Subcharts (dapp, txsigner)
│   ├── templates/     # Kubernetes manifests
│   └── values.yaml    # Default configuration
└── tools/             # Deployment utilities
```

## Dependencies (names only)

- **Local packages**: None (deploys other packages)
- **Key libraries**: Helm, Kubernetes

## Best Practices (Local)

<!-- BEGIN AUTO -->
- **Helm Templates**: Use named templates for reusable components; implement proper label selectors; version your charts semantically; test with helm lint and dry-run
- **Security**: Never hardcode secrets in values; use external secret management; implement RBAC policies; configure network policies
- **Scalability**: Configure HPA for auto-scaling; set resource requests/limits appropriately; implement pod disruption budgets; use anti-affinity rules
- **Observability**: Include prometheus annotations; implement health checks; configure structured logging; add tracing headers
<!-- END AUTO -->

## Style & Testing Cues

### TypeScript-only
- TypeScript tools in `tools/` directory for packaging
- Validated with JSON schemas

### Oxlint/Prettier deltas from root
- YAML formatting for Helm templates
- Schema validation for values files

### Test locations
- Helm lint validation
- Dry-run deployment tests
- Values schema validation

## Agent Hints (Local)

### Interface boundaries
- **Values contract**: Changes to values.yaml structure are breaking
- **Template functions**: Shared helpers must maintain signatures
- **Label consistency**: Selectors must match across resources

### Safe extension points
- Add new values in `values.yaml` with defaults
- New templates in `templates/` directory
- Environment-specific values files

### What not to touch
- Label selectors once deployed - breaks updates
- Service names - hardcoded in other configs
- Persistent volume claims - data loss risk

### CI considerations
- Charts must pass helm lint
- Template rendering must succeed
- Schema validation for values
- Version bumps for chart changes
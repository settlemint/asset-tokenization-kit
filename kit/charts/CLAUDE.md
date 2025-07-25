# CLAUDE.md - Helm Charts Documentation

This file provides guidance to Claude Code (claude.ai/code) when working with
Helm charts in the Asset Tokenization Kit.

## Overview

The ATK Helm charts provide a complete deployment solution for the SettleMint
Asset Tokenization Kit on Kubernetes. The charts follow a modular architecture
with a main umbrella chart (`atk`) that orchestrates multiple sub-charts.

## Chart Structure

```
kit/charts/
├── atk/                        # Main umbrella chart
│   ├── Chart.yaml             # Chart metadata and dependencies
│   ├── values.yaml            # Default configuration values
│   ├── charts/                # Sub-charts (dependencies)
│   │   ├── besu-network/      # Blockchain network (Besu)
│   │   ├── blockscout/        # Blockchain explorer
│   │   ├── dapp/              # Frontend application
│   │   ├── erpc/              # RPC proxy/load balancer
│   │   ├── hasura/            # GraphQL engine
│   │   ├── observability/     # Monitoring stack
│   │   ├── portal/            # API backend
│   │   ├── support/           # Infrastructure services
│   │   ├── thegraph/          # Blockchain indexing
│   │   └── txsigner/          # Transaction signing service
│   └── templates/             # Helm templates for umbrella chart
├── tools/                     # Deployment utilities
│   ├── extract-env.ts         # Extract env vars from deployment
│   ├── values-orbstack.yaml   # Local development values
│   └── values-orbstack.1p.yaml # Template for 1Password injection
└── package.json              # Helm deployment scripts
```

## Key Components

### 1. Main Umbrella Chart (`atk`)

- **Purpose**: Orchestrates all sub-charts with unified configuration
- **Version**: v2.0.0 (follows project versioning)
- **Dependencies**: All sub-charts are conditionally enabled

### 2. Core Services

#### Blockchain (`besu-network`)
- **Components**: Genesis configuration, validator nodes, RPC nodes
- **Configuration**: 
  - Validators: 1-4 nodes (configurable)
  - RPC nodes: 1-2 nodes (configurable)
  - Genesis includes pre-deployed contracts

#### Frontend (`dapp`)
- **Type**: React application (Tanstack Start)
- **Features**:
  - Init containers for dependency checks
  - GraphQL readiness probe
  - Configurable ingress
  - Environment variable injection

#### RPC Proxy (`erpc`)
- **Purpose**: Load balancing and caching for blockchain RPC
- **Features**:
  - Redis caching integration
  - Multiple upstream support
  - Prometheus metrics

#### API Backend (`portal`)
- **Purpose**: REST/GraphQL API for blockchain interaction
- **Features**:
  - Contract ABI management
  - Transaction management
  - Metrics endpoint

### 3. Data Layer

#### Database (`support/postgresql-ha`)
- **Type**: PostgreSQL with high availability
- **Databases**: blockscout, thegraph, hasura, portal, txsigner
- **Default credentials**: User/password = `atk`

#### Cache (`support/redis`)
- **Purpose**: Caching for eRPC and application data
- **Configuration**: Master-replica setup

#### GraphQL (`hasura`)
- **Purpose**: GraphQL API over PostgreSQL
- **Features**: Real-time subscriptions, permissions

#### Indexing (`thegraph`)
- **Purpose**: Blockchain event indexing
- **Configuration**: Combined mode by default

### 4. Infrastructure

#### Ingress (`support/ingress-nginx`)
- **Class**: `atk-nginx` (isolated from other deployments)
- **Features**: SSL termination, OpenTelemetry tracing

#### Storage (`support/minio`)
- **Purpose**: S3-compatible object storage
- **Usage**: File uploads, IPFS gateway

#### Monitoring (`observability`)
- **Components**: Grafana, Loki, Tempo, Victoria Metrics
- **Dashboards**: Pre-configured for all services

## Deployment Patterns

### Local Development (OrbStack)

```bash
# Prerequisites
bun run helm:secrets          # Inject secrets from 1Password
bun run helm:subgraph        # Update subgraph hash

# Deploy
bun run helm                  # Install/upgrade ATK

# Extract environment
bun run helm:extract-env      # Generate .env files
```

### Production Deployment

1. **Prepare values file**:
   ```yaml
   # values-production.yaml
   global:
     networkPolicy:
       enabled: true
   
   dapp:
     replicaCount: 3
     resources:
       requests:
         memory: "512Mi"
         cpu: "250m"
       limits:
         memory: "1Gi"
         cpu: "500m"
   ```

2. **Deploy with Helm**:
   ```bash
   helm upgrade --install atk ./atk \
     -f values-production.yaml \
     -n atk --create-namespace
   ```

## Configuration Guidelines

### 1. Image Pull Secrets

All charts support three registry configurations:
- `harbor` - SettleMint's private registry
- `ghcr` - GitHub Container Registry
- `docker` - Docker Hub

### 2. Resource Management

```yaml
# Pattern for all services
resources:
  requests:
    memory: "256Mi"
    cpu: "100m"
  limits:
    memory: "512Mi"
    cpu: "200m"
```

### 3. Network Policies

When enabled, ensure proper egress/ingress rules:
- DNS resolution (kube-dns)
- Inter-service communication
- External API access

### 4. Init Containers

Two types of dependency checks:
1. **TCP Check**: Basic port availability
2. **GraphQL Check**: Full GraphQL readiness

### 5. Persistence

```yaml
# Storage classes
persistence:
  storageClass: ""  # Use cluster default
  size: "10Gi"      # Adjust based on needs
```

## Common Tasks

### Update Contract Artifacts

```bash
# After contract changes
cd ../contracts && bun run compile
cd ../charts && bun run helm:subgraph
```

**Note**: Contract artifacts (ABIs and genesis files) are now packaged in the `ghcr.io/settlemint/asset-tokenization-kit-artifacts` Docker image and automatically deployed via init containers. No manual copying is required.

### Configure Domains

```yaml
# In values file
dapp:
  ingress:
    hosts:
      - host: app.example.com
        
erpc:
  ingress:
    hostname: rpc.example.com
```

### Enable Monitoring

```yaml
observability:
  enabled: true
  grafana:
    adminPassword: "secure-password"
    ingress:
      hosts:
        - monitoring.example.com
```

### Scale Services

```yaml
# Horizontal scaling
dapp:
  autoscaling:
    enabled: true
    minReplicas: 2
    maxReplicas: 10
    targetCPUUtilizationPercentage: 70

# Vertical scaling
portal:
  resources:
    requests:
      memory: "1Gi"
      cpu: "500m"
```

## Troubleshooting

### Common Issues

1. **Init container failures**
   - Check service dependencies are running
   - Verify network policies allow communication
   - Check DNS resolution

2. **Contract artifacts missing**
   - Ensure the artifacts Docker image is available and properly tagged
   - Check that the image tag in `global.artifacts.image.tag` matches the built artifacts

3. **Database connection issues**
   - Verify PostgreSQL is ready
   - Check credentials in secrets
   - Ensure network policies allow DB access

### Debug Commands

```bash
# Check pod status
kubectl get pods -n atk

# View init container logs
kubectl logs -n atk <pod-name> -c <init-container-name>

# Describe failing pod
kubectl describe pod -n atk <pod-name>

# Check services
kubectl get svc -n atk

# View ingress
kubectl get ingress -n atk
```

## Security Considerations

1. **Secrets Management**
   - Use Kubernetes secrets for sensitive data
   - Consider external secret operators
   - Never commit secrets to values files

2. **Network Policies**
   - Enable in production
   - Follow least-privilege principle
   - Test thoroughly before enabling

3. **Resource Limits**
   - Always set resource limits
   - Prevent resource exhaustion
   - Monitor actual usage

4. **Image Security**
   - Use specific image tags (not latest)
   - Enable image pull secrets
   - Scan images for vulnerabilities

## Best Practices

1. **Values Organization**
   - Keep environment-specific values separate
   - Use values hierarchy (base → env → secrets)
   - Document all custom values

2. **Upgrade Strategy**
   - Test upgrades in staging first
   - Use `--dry-run` to preview changes
   - Backup databases before major upgrades

3. **Monitoring**
   - Always deploy observability stack
   - Configure alerts for critical services
   - Monitor resource usage trends

4. **Documentation**
   - Update Chart.yaml with changes
   - Document custom configurations
   - Keep README files current

## Integration Points

### With Contracts
- Genesis file generation → besu-network
- ABI files → portal service
- Contract addresses → environment variables

### With Frontend
- Environment variables → dapp deployment
- API endpoints → ingress configuration
- GraphQL endpoints → hasura/thegraph

### With Backend Services
- Database schemas → postgresql init scripts
- Service discovery → Kubernetes DNS
- Shared secrets → Kubernetes secrets

## Helm Chart Development

### Adding New Sub-charts

1. Create chart structure:
   ```bash
   helm create atk/charts/new-service
   ```

2. Add to umbrella dependencies:
   ```yaml
   # atk/Chart.yaml
   dependencies:
     - name: new-service
       version: "*"
       condition: new-service.enabled
   ```

3. Configure default values:
   ```yaml
   # atk/values.yaml
   new-service:
     enabled: false
     # ... configuration
   ```

### Testing Charts

```bash
# Lint charts
helm lint atk

# Template rendering
helm template atk ./atk --debug

# Dry run installation
helm install atk ./atk --dry-run
```

## Important Notes

1. **Chart Versions**: Follow semantic versioning
2. **Dependencies**: Update Chart.lock after changes
3. **Templates**: Use consistent naming and labels
4. **Values**: Provide sensible defaults
5. **Documentation**: Update README for each chart
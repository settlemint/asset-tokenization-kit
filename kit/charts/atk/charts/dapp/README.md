# DApp Frontend

![Version: 0.1.0](https://img.shields.io/badge/Version-0.1.0-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: 1.0.0](https://img.shields.io/badge/AppVersion-1.0.0-informational?style=flat-square)

A Helm chart for deploying the Asset Tokenization Kit (ATK) decentralized application frontend - a Next.js-based web application for interacting with tokenized assets.

## Overview

The DApp Frontend is the primary user interface for the Asset Tokenization Kit, providing a comprehensive web application for managing and interacting with tokenized assets. Built with Next.js 15 and React 19, it offers a modern, responsive interface for asset tokenization, compliance management, and blockchain interactions.

## Key Features

- **Asset Management**: Create, transfer, and manage tokenized assets
- **Compliance Dashboard**: Monitor and manage ERC-3643 compliance requirements
- **Wallet Integration**: Support for multiple wallet providers (MetaMask, WalletConnect, etc.)
- **Real-time Updates**: Live blockchain data via GraphQL subscriptions
- **Multi-tenant Support**: Tenant-aware routing and branding
- **Advanced Analytics**: Portfolio tracking and transaction history
- **Responsive Design**: Mobile-first design with Tailwind CSS

## Architecture

### Technology Stack
- **Framework**: Next.js 15 with App Router
- **UI Library**: React 19 with Tailwind CSS and shadcn/ui components
- **State Management**: TanStack Query for server state, Zustand for client state
- **Authentication**: Better Auth with multi-provider support
- **API Integration**: ORPC for type-safe API communication
- **Blockchain**: viem/wagmi for Ethereum interactions

### Integration Points
- **Hasura GraphQL**: Real-time data queries and subscriptions
- **Portal API**: Backend business logic and compliance checks
- **Graph Node**: Subgraph data for blockchain events
- **Blockscout**: Blockchain explorer integration
- **PostgreSQL**: Direct database queries for complex analytics

## Configuration

### Essential Environment Variables

```yaml
# Application Identity
NEXT_PUBLIC_APP_ID: "dapp"
NEXTAUTH_URL: "https://dapp.local"
BETTER_AUTH_URL: "https://dapp.local"

# Backend Services
SETTLEMINT_HASURA_ENDPOINT: "https://hasura.local/v1/graphql"
SETTLEMINT_HASURA_ADMIN_SECRET: "admin-secret"
SETTLEMINT_PORTAL_GRAPHQL_ENDPOINT: "https://portal.local/graphql"
SETTLEMINT_THEGRAPH_SUBGRAPHS_ENDPOINTS: '["https://graph.local/subgraphs/name/kit"]'

# Blockchain Configuration
SETTLEMINT_HD_PRIVATE_KEY: "your-private-key"
SETTLEMINT_BLOCKSCOUT_UI_ENDPOINT: "https://explorer.local/"

# Database
SETTLEMINT_HASURA_DATABASE_URL: "postgresql://user:pass@host:port/db"

# Observability
OTEL_EXPORTER_OTLP_ENDPOINT: "http://o11y-alloy:4318/v1/traces"
OTEL_EXPORTER_OTLP_PROTOCOL: "http"
```

### Service Dependencies

The DApp requires several services to be running:

1. **PostgreSQL**: Core database for application data
2. **Hasura**: GraphQL API for data access
3. **Portal**: Backend API for business logic
4. **Graph Node**: Subgraph indexing for blockchain data
5. **Blockscout**: Blockchain explorer integration

### Initialization Flow

The DApp uses init containers to ensure dependencies are ready:

1. **TCP Checks**: Verify connectivity to PostgreSQL, Hasura, Portal, Graph Node, and Blockscout
2. **GraphQL Check**: Validate subgraph deployment and schema availability
3. **Job Execution**: Run database migrations and seed data if needed

## Deployment Patterns

### Single Instance (Development)
```yaml
replicaCount: 1
resources:
  requests:
    memory: "256Mi"
    cpu: "100m"
  limits:
    memory: "512Mi"
    cpu: "500m"
```

### High Availability (Production)
```yaml
replicaCount: 3
autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 10
  targetCPUUtilizationPercentage: 80

podDisruptionBudget:
  enabled: true
  minAvailable: 1

affinity:
  podAntiAffinity:
    preferredDuringSchedulingIgnoredDuringExecution:
    - weight: 100
      podAffinityTerm:
        labelSelector:
          matchExpressions:
          - key: app.kubernetes.io/name
            operator: In
            values: ["dapp"]
        topologyKey: kubernetes.io/hostname
```

## Ingress Configuration

### Basic Ingress
```yaml
ingress:
  enabled: true
  className: "atk-nginx"
  hosts:
  - host: dapp.local
    paths:
    - path: "/((?:sm_|bpaas-)[^/]+)?/?(.*)"
      pathType: "ImplementationSpecific"
```

### Multi-tenant Routing
The DApp supports multi-tenant routing with URL patterns:
- `https://dapp.local/` - Default tenant
- `https://dapp.local/sm_tenant123/` - Specific tenant
- `https://dapp.local/bpaas-company/` - BPaaS tenant

## Security Configuration

### Network Policies
```yaml
networkPolicy:
  enabled: true
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          kubernetes.io/metadata.name: "ingress-nginx"
    ports:
    - protocol: TCP
      port: 3000
  
  egress:
  - to:
    - podSelector:
        matchLabels:
          app.kubernetes.io/name: "postgresql-ha"
    ports:
    - protocol: TCP
      port: 5432
  - to:
    - podSelector:
        matchLabels:
          app.kubernetes.io/name: "graphql-engine"
    ports:
    - protocol: TCP
      port: 8080
```

### Security Context
```yaml
securityContext:
  allowPrivilegeEscalation: false
  capabilities:
    drop:
    - ALL
  
podSecurityContext:
  runAsNonRoot: true
  runAsUser: 2016
  fsGroup: 2016
```

## Monitoring and Observability

### Health Checks
```yaml
probes:
  liveness:
    initialDelaySeconds: 10
    periodSeconds: 15
    timeoutSeconds: 3
    failureThreshold: 10
  
  readiness:
    initialDelaySeconds: 5
    periodSeconds: 10
    timeoutSeconds: 3
    failureThreshold: 10
```

### Metrics Integration
- **Application Metrics**: Next.js built-in metrics
- **Custom Metrics**: Business logic metrics via Portal API
- **Tracing**: OpenTelemetry integration for distributed tracing
- **Logs**: Structured JSON logging with correlation IDs

## Troubleshooting

### Common Issues

#### 1. Subgraph Not Available
```bash
# Check subgraph deployment
kubectl logs -l app.kubernetes.io/name=dapp -c wait-for-graph-subgraph-kit

# Verify Graph Node connectivity
kubectl exec -it deployment/graph-node-combined -- curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"query": "{ __typename }"}' \
  http://localhost:8000/subgraphs/name/kit
```

#### 2. Authentication Issues
```bash
# Check Better Auth configuration
kubectl exec -it deployment/dapp -- env | grep BETTER_AUTH
kubectl exec -it deployment/dapp -- env | grep NEXTAUTH

# Verify database connectivity
kubectl exec -it deployment/dapp -- npm run db:status
```

#### 3. Slow Loading
```bash
# Check resource utilization
kubectl top pod -l app.kubernetes.io/name=dapp

# Monitor response times
kubectl logs -l app.kubernetes.io/name=dapp | grep "response_time"
```

#### 4. Failed Deployments
```bash
# Check init container status
kubectl describe pod -l app.kubernetes.io/name=dapp

# View detailed logs
kubectl logs -l app.kubernetes.io/name=dapp --all-containers=true --previous
```

### Performance Optimization

#### Database Queries
- Enable query caching in Hasura
- Use subscriptions judiciously
- Implement proper pagination
- Add database indexes for frequent queries

#### Frontend Performance
- Enable Next.js caching strategies
- Implement code splitting
- Use React.memo for expensive components
- Optimize bundle size with webpack-bundle-analyzer

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| affinity | object | `{}` |  |
| annotations | object | `{}` |  |
| autoscaling.enabled | bool | `false` |  |
| autoscaling.maxReplicas | int | `10` |  |
| autoscaling.minReplicas | int | `1` |  |
| autoscaling.targetCPUUtilizationPercentage | int | `80` |  |
| env | list | `[]` |  |
| fullnameOverride | string | `"dapp"` |  |
| image.pullPolicy | string | `"IfNotPresent"` |  |
| image.repository | string | `"ghcr.io/settlemint/asset-tokenization-kit"` |  |
| image.tag | string | `"1.1.1"` |  |
| imagePullSecrets[0].name | string | `"image-pull-secret-docker"` |  |
| imagePullSecrets[1].name | string | `"image-pull-secret-ghcr"` |  |
| imagePullSecrets[2].name | string | `"image-pull-secret-harbor"` |  |
| ingress.annotations | object | `{}` |  |
| ingress.className | string | `"atk-nginx"` |  |
| ingress.enabled | bool | `false` |  |
| ingress.hosts[0].host | string | `"dapp.local"` |  |
| ingress.hosts[0].paths[0].path | string | `"/((?:sm_|bpaas-)[^/]+)?/?(.*)"` |  |
| ingress.hosts[0].paths[0].pathType | string | `"ImplementationSpecific"` |  |
| ingress.tls | list | `[]` |  |
| initContainer.graphQLCheck.connectTimeoutSeconds | int | `5` |  |
| initContainer.graphQLCheck.enabled | bool | `true` |  |
| initContainer.graphQLCheck.image.pullPolicy | string | `"IfNotPresent"` |  |
| initContainer.graphQLCheck.image.registry | string | `"docker.io"` |  |
| initContainer.graphQLCheck.image.repository | string | `"curlimages/curl"` |  |
| initContainer.graphQLCheck.image.tag | string | `"8.15.0"` |  |
| initContainer.graphQLCheck.name | string | `"wait-for-graph-subgraph-kit"` |  |
| initContainer.graphQLCheck.query | string | `"{ __typename }"` |  |
| initContainer.graphQLCheck.retries | int | `24` |  |
| initContainer.graphQLCheck.retryDelaySeconds | int | `20` |  |
| initContainer.graphQLCheck.timeoutSeconds | int | `10` |  |
| initContainer.graphQLCheck.url | string | `"http://graph-node-combined.atk.svc.cluster.local:8000/subgraphs/name/kit"` |  |
| initContainer.tcpCheck.dependencies[0].endpoint | string | `"postgresql.atk.svc.cluster.local:5432"` |  |
| initContainer.tcpCheck.dependencies[0].name | string | `"postgres"` |  |
| initContainer.tcpCheck.dependencies[1].endpoint | string | `"hasura.atk.svc.cluster.local:8080"` |  |
| initContainer.tcpCheck.dependencies[1].name | string | `"hasura"` |  |
| initContainer.tcpCheck.dependencies[2].endpoint | string | `"portal.atk.svc.cluster.local:3001"` |  |
| initContainer.tcpCheck.dependencies[2].name | string | `"portal"` |  |
| initContainer.tcpCheck.dependencies[3].endpoint | string | `"graph-node-combined.atk.svc.cluster.local:8020"` |  |
| initContainer.tcpCheck.dependencies[3].name | string | `"graph-node-tcp"` |  |
| initContainer.tcpCheck.dependencies[4].endpoint | string | `"blockscout-frontend-svc.atk.svc.cluster.local:80"` |  |
| initContainer.tcpCheck.dependencies[4].name | string | `"blockscout"` |  |
| initContainer.tcpCheck.enabled | bool | `true` |  |
| initContainer.tcpCheck.image.pullPolicy | string | `"IfNotPresent"` |  |
| initContainer.tcpCheck.image.repository | string | `"ghcr.io/settlemint/btp-waitforit"` |  |
| initContainer.tcpCheck.image.tag | string | `"v7.7.6"` |  |
| initContainer.tcpCheck.timeout | int | `5` |  |
| job.enabled | bool | `true` |  |
| job.image.pullPolicy | string | `"IfNotPresent"` |  |
| job.image.repository | string | `"docker.io/node"` |  |
| job.image.tag | string | `"23.11.1-slim"` |  |
| job.imagePullSecrets[0] | string | `"image-pull-secret-docker"` |  |
| job.imagePullSecrets[1] | string | `"image-pull-secret-ghcr"` |  |
| job.imagePullSecrets[2] | string | `"image-pull-secret-harbor"` |  |
| job.initContainer.cloneRepo.image.pullPolicy | string | `"IfNotPresent"` |  |
| job.initContainer.cloneRepo.image.registry | string | `"docker.io"` |  |
| job.initContainer.cloneRepo.image.repository | string | `"alpine/git"` |  |
| job.initContainer.cloneRepo.image.tag | string | `"v2.49.1"` |  |
| job.initContainer.hasuraCheck.endpoint | string | `"hasura.atk.svc.cluster.local:8080"` |  |
| job.initContainer.hasuraCheck.image.pullPolicy | string | `"IfNotPresent"` |  |
| job.initContainer.hasuraCheck.image.repository | string | `"ghcr.io/settlemint/btp-waitforit"` |  |
| job.initContainer.hasuraCheck.image.tag | string | `"v7.7.6"` |  |
| job.initContainer.hasuraCheck.timeout | int | `5` |  |
| job.podAnnotations | object | `{}` |  |
| job.podSecurityContext | object | `{}` |  |
| job.resources | object | `{}` |  |
| job.securityContext | object | `{}` |  |
| job.workspace.size | string | `"1Gi"` |  |
| job.workspace.storageClass | string | `""` |  |
| nameOverride | string | `"dapp"` |  |
| networkPolicy.egress[0].ports[0].port | int | `53` |  |
| networkPolicy.egress[0].ports[0].protocol | string | `"UDP"` |  |
| networkPolicy.egress[0].to[0].namespaceSelector | object | `{}` |  |
| networkPolicy.egress[0].to[0].podSelector.matchLabels.k8s-app | string | `"kube-dns"` |  |
| networkPolicy.egress[1].ports[0].port | int | `5432` |  |
| networkPolicy.egress[1].ports[0].protocol | string | `"TCP"` |  |
| networkPolicy.egress[1].to[0].podSelector.matchLabels."app.kubernetes.io/name" | string | `"postgresql-ha"` |  |
| networkPolicy.egress[2].ports[0].port | int | `8080` |  |
| networkPolicy.egress[2].ports[0].protocol | string | `"TCP"` |  |
| networkPolicy.egress[2].to[0].podSelector.matchLabels."app.kubernetes.io/name" | string | `"graphql-engine"` |  |
| networkPolicy.egress[3].ports[0].port | int | `3000` |  |
| networkPolicy.egress[3].ports[0].protocol | string | `"TCP"` |  |
| networkPolicy.egress[3].ports[1].port | int | `3001` |  |
| networkPolicy.egress[3].ports[1].protocol | string | `"TCP"` |  |
| networkPolicy.egress[3].to[0].podSelector.matchLabels."app.kubernetes.io/name" | string | `"portal"` |  |
| networkPolicy.egress[4].ports[0].port | int | `4000` |  |
| networkPolicy.egress[4].ports[0].protocol | string | `"TCP"` |  |
| networkPolicy.egress[4].to[0].podSelector.matchLabels."app.kubernetes.io/name" | string | `"erpc"` |  |
| networkPolicy.egress[5].ports[0].port | int | `443` |  |
| networkPolicy.egress[5].ports[0].protocol | string | `"TCP"` |  |
| networkPolicy.egress[5].to[0].namespaceSelector | object | `{}` |  |
| networkPolicy.enabled | bool | `false` |  |
| networkPolicy.ingress[0].from[0].namespaceSelector.matchLabels."kubernetes.io/metadata.name" | string | `"ingress-nginx"` |  |
| networkPolicy.ingress[0].ports[0].port | int | `3000` |  |
| networkPolicy.ingress[0].ports[0].protocol | string | `"TCP"` |  |
| networkPolicy.ingress[1].from[0].podSelector | object | `{}` |  |
| networkPolicy.ingress[1].ports[0].port | int | `3000` |  |
| networkPolicy.ingress[1].ports[0].protocol | string | `"TCP"` |  |
| nodeSelector | object | `{}` |  |
| podAnnotations | object | `{}` |  |
| podDisruptionBudget.enabled | bool | `false` |  |
| podDisruptionBudget.minAvailable | int | `1` |  |
| podLabels | object | `{}` |  |
| podSecurityContext.fsGroup | int | `2016` |  |
| podSecurityContext.runAsNonRoot | bool | `true` |  |
| podSecurityContext.runAsUser | int | `2016` |  |
| probes.liveness.failureThreshold | int | `10` |  |
| probes.liveness.initialDelaySeconds | int | `10` |  |
| probes.liveness.periodSeconds | int | `15` |  |
| probes.liveness.successThreshold | int | `1` |  |
| probes.liveness.timeoutSeconds | int | `3` |  |
| probes.readiness.failureThreshold | int | `10` |  |
| probes.readiness.initialDelaySeconds | int | `5` |  |
| probes.readiness.periodSeconds | int | `10` |  |
| probes.readiness.successThreshold | int | `1` |  |
| probes.readiness.timeoutSeconds | int | `3` |  |
| replicaCount | int | `1` |  |
| resources | object | `{}` |  |
| secretEnv.BETTER_AUTH_URL | string | `"https://dapp.local"` |  |
| secretEnv.NEXTAUTH_URL | string | `"https://dapp.local"` |  |
| secretEnv.NEXT_PUBLIC_APP_ID | string | `"dapp"` |  |
| secretEnv.OTEL_EXPORTER_OTLP_ENDPOINT | string | `"http://o11y-alloy.btp-platform.svc.cluster.local:4318/v1/traces"` |  |
| secretEnv.OTEL_EXPORTER_OTLP_PROTOCOL | string | `"http"` |  |
| secretEnv.SETTLEMINT_BLOCKSCOUT_UI_ENDPOINT | string | `"https://explorer.local/"` |  |
| secretEnv.SETTLEMINT_HASURA_ADMIN_SECRET | string | `"dummy-secret"` |  |
| secretEnv.SETTLEMINT_HASURA_DATABASE_URL | string | `"postgresql://user:pass@host:port/db"` |  |
| secretEnv.SETTLEMINT_HASURA_ENDPOINT | string | `"https://hasura.local/v1/graphql"` |  |
| secretEnv.SETTLEMINT_HD_PRIVATE_KEY | string | `"dummy-key"` |  |
| secretEnv.SETTLEMINT_INSTANCE | string | `"standalone"` |  |
| secretEnv.SETTLEMINT_PORTAL_GRAPHQL_ENDPOINT | string | `"https://portal.local/graphql"` |  |
| secretEnv.SETTLEMINT_THEGRAPH_SUBGRAPHS_ENDPOINTS | string | `"[\"https://graph.local/subgraphs/name/kit\"]"` |  |
| securityContext.allowPrivilegeEscalation | bool | `false` |  |
| securityContext.capabilities.drop[0] | string | `"ALL"` |  |
| service.annotations | object | `{}` |  |
| service.port | int | `3000` |  |
| service.type | string | `"ClusterIP"` |  |
| serviceAccount.annotations | object | `{}` |  |
| serviceAccount.create | bool | `false` |  |
| serviceAccount.name | string | `""` |  |
| tolerations | list | `[]` |  |
| volumeMounts | list | `[]` |  |
| volumes | list | `[]` |  |

# Deployment & Operations Guide

## 🚀 Deployment Overview

The Asset Tokenization Kit supports multiple deployment scenarios from local development to enterprise production environments, with comprehensive automation, monitoring, and operational procedures for maintaining secure, scalable tokenization platforms.

## 🏗️ Deployment Architecture

```mermaid
graph TB
    subgraph "💻 Development Environment"
        A[🐳 Docker Compose]
        B[🔗 Local Blockchain]
        C[📊 Local Indexer]
        D[🗄️ Local Database]
    end
    
    subgraph "🧪 Staging Environment"
        E[☸️ Kubernetes Staging]
        F[🌐 Testnet Blockchain]
        G[📊 Staging Subgraph]
        H[🗄️ Staging Database]
    end
    
    subgraph "🚀 Production Environment"
        I[☸️ Kubernetes Production]
        J[🌐 Mainnet Blockchain]
        K[📊 Production Subgraph]
        L[🗄️ Production Database]
    end
    
    subgraph "🔍 Monitoring & Ops"
        M[📊 Metrics Collection]
        N[🚨 Alerting System]
        O[📋 Log Aggregation]
        P[🔄 Backup Systems]
    end
    
    A --> E
    B --> F
    C --> G
    D --> H
    E --> I
    F --> J
    G --> K
    H --> L
    I --> M
    J --> N
    K --> O
    L --> P
    
    style A fill:#e1f5fe,stroke:#01579b,color:#000000,stroke-width:3px
    style E fill:#f3e5f5,stroke:#7b1fa2,color:#000000,stroke-width:3px
    style I fill:#e8f5e8,stroke:#1b5e20,color:#000000,stroke-width:3px
    style M fill:#fff3e0,stroke:#e65100,color:#000000,stroke-width:3px
```

## 🐳 Local Development Setup

### Docker Compose Configuration

```yaml
# docker-compose.yml - Complete development stack
version: '3.8'

services:
  # Blockchain node
  anvil:
    image: ghcr.io/settlemint/btp-anvil-test-node:v7.7.10
    container_name: atk-anvil
    ports:
      - "8545:8545"
    environment:
      - TIMESTAMP=${TIMESTAMP:-0}
    entrypoint:
      - anvil
      - --host
      - "0.0.0.0"
      - --chain-id
      - "1337"
      - --gas-limit
      - "5000000000000"
      - --gas-price
      - "0"
      - --init
      - "/opt/anvil/genesis.json"
    volumes:
      - ./kit/contracts/.generated/genesis.json:/opt/anvil/genesis.json:ro
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:8545 || exit 1"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Transaction signer service
  txsigner:
    image: ghcr.io/settlemint/btp-signer:7.15.13
    container_name: atk-txsigner
    depends_on:
      anvil:
        condition: service_healthy
      postgres:
        condition: service_healthy
    ports:
      - "8547:3000"
    environment:
      MODE: "standalone"
      RPC_ENDPOINT: "http://anvil:8545"
      DB_CONNECTION_STRING: "postgresql://txsigner:txsigner@postgres:5432/txsigner?sslmode=disable"
      PRIVATE_KEY_MNEMONIC: "test test test test test test test test test test test junk"

  # Database
  postgres:
    image: postgres:17.6-alpine
    container_name: atk-postgres
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./tools/docker/postgres/init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Graph indexer
  graph-node:
    image: graphprotocol/graph-node:v0.40.2
    container_name: atk-graph-node
    depends_on:
      anvil:
        condition: service_healthy
      postgres:
        condition: service_healthy
    ports:
      - "8000:8000"  # GraphQL
      - "8001:8001"  # Admin
    environment:
      postgres_host: postgres
      postgres_user: thegraph
      postgres_pass: thegraph
      postgres_db: thegraph
      ipfs: "https://ipfs.console.settlemint.com"
      ethereum: "settlemint:http://anvil:8545"

  # Redis cache
  redis:
    image: redis:8.2-alpine
    container_name: atk-redis
    ports:
      - "6379:6379"
    command: redis-server --requirepass shared

  # File storage
  minio:
    image: minio/minio:RELEASE.2025-05-24T17-08-30Z
    container_name: atk-minio
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: minio
      MINIO_ROOT_PASSWORD: miniominio
    command: server /data --console-address ":9001"
    volumes:
      - minio_data:/data

  # Hasura GraphQL API
  hasura:
    image: hasura/graphql-engine:v2.48.5
    container_name: atk-hasura
    depends_on:
      postgres:
        condition: service_healthy
    ports:
      - "8080:8080"
    environment:
      HASURA_GRAPHQL_DATABASE_URL: postgres://hasura:hasura@postgres:5432/hasura
      HASURA_GRAPHQL_ENABLE_CONSOLE: "true"
      HASURA_GRAPHQL_ADMIN_SECRET: hasura

volumes:
  postgres_data:
  minio_data:
```

### Development Workflow

```mermaid
sequenceDiagram
    participant D as 👨‍💻 Developer
    participant L as 💻 Local Environment
    participant C as 📋 Smart Contracts
    participant S as 📊 Subgraph
    participant F as 📱 Frontend
    
    D->>L: 🚀 Start Development
    L->>L: 🐳 Start Docker Services
    
    D->>C: 🔧 Develop Contracts
    C->>C: 🧪 Run Tests
    C->>L: 🚀 Deploy to Local Chain
    
    D->>S: 📊 Update Subgraph
    S->>L: 📊 Deploy to Graph Node
    
    D->>F: 🎨 Develop Frontend
    F->>L: 🔄 Hot Reload
    
    L->>D: ✅ Live Development Environment
    
    Note over D: 🔄 Iterative Development
    
    D->>L: 🧪 Run Integration Tests
    L-->>D: ✅ All Tests Pass
    
    D->>L: 📦 Build for Deployment
    L-->>D: 📦 Deployment Artifacts
```

## ☸️ Kubernetes Production Deployment

### Production Architecture

```mermaid
graph TB
    subgraph "🌐 Internet"
        A[🌐 Load Balancer]
        B[🔒 SSL Termination]
        C[🛡️ WAF Protection]
    end
    
    subgraph "☸️ Kubernetes Cluster"
        D[🎯 Ingress Controller]
        E[📱 Frontend Pods]
        F[🔌 API Pods]
        G[📊 Worker Pods]
    end
    
    subgraph "💾 Data Layer"
        H[🐘 PostgreSQL Cluster]
        I[⚡ Redis Cluster]
        J[📦 MinIO Cluster]
    end
    
    subgraph "🔗 Blockchain Services"
        K[🔗 Blockchain Node]
        L[📊 Graph Node]
        M[🔍 Block Explorer]
    end
    
    subgraph "🔍 Monitoring"
        N[📊 Prometheus]
        O[📈 Grafana]
        P[📋 ELK Stack]
        Q[🚨 AlertManager]
    end
    
    A --> B
    B --> C
    C --> D
    D --> E
    D --> F
    D --> G
    E --> H
    F --> I
    G --> J
    H --> K
    I --> L
    J --> M
    K --> N
    L --> O
    M --> P
    N --> Q
    
    style A fill:#e1f5fe,stroke:#01579b,color:#000000
    style D fill:#f3e5f5,stroke:#7b1fa2,color:#000000
    style H fill:#e8f5e8,stroke:#1b5e20,color:#000000
    style N fill:#fff3e0,stroke:#e65100,color:#000000
```

### Helm Chart Values

```yaml
# values-production.yaml
global:
  environment: production
  domain: "tokenization.company.com"
  
  # Security configuration
  security:
    enabled: true
    tls:
      enabled: true
      issuer: letsencrypt-prod
    
    # Network policies
    networkPolicies:
      enabled: true
      denyAll: true
      allowedNamespaces:
        - atk-production
        - monitoring
    
    # Pod security standards
    podSecurityStandards:
      enforce: restricted
      audit: restricted
      warn: restricted

# Frontend configuration
frontend:
  replicaCount: 3
  
  image:
    repository: settlemint/atk-frontend
    tag: "2.0.0"
    pullPolicy: Always
  
  resources:
    requests:
      cpu: 100m
      memory: 256Mi
    limits:
      cpu: 500m
      memory: 512Mi
  
  autoscaling:
    enabled: true
    minReplicas: 3
    maxReplicas: 10
    targetCPUUtilizationPercentage: 70
    targetMemoryUtilizationPercentage: 80
  
  service:
    type: ClusterIP
    port: 3000
  
  ingress:
    enabled: true
    className: nginx
    annotations:
      nginx.ingress.kubernetes.io/ssl-redirect: "true"
      nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
      cert-manager.io/cluster-issuer: letsencrypt-prod
    hosts:
      - host: tokenization.company.com
        paths:
          - path: /
            pathType: Prefix
    tls:
      - secretName: frontend-tls
        hosts:
          - tokenization.company.com

# API configuration
api:
  replicaCount: 2
  
  image:
    repository: settlemint/atk-api
    tag: "2.0.0"
  
  resources:
    requests:
      cpu: 200m
      memory: 512Mi
    limits:
      cpu: 1000m
      memory: 1Gi
  
  env:
    NODE_ENV: production
    DATABASE_URL:
      valueFrom:
        secretKeyRef:
          name: database-credentials
          key: url
    
    REDIS_URL:
      valueFrom:
        secretKeyRef:
          name: redis-credentials
          key: url
    
    SETTLEMINT_API_KEY:
      valueFrom:
        secretKeyRef:
          name: settlemint-credentials
          key: api-key

# Database configuration
postgresql:
  enabled: true
  auth:
    existingSecret: database-credentials
  
  primary:
    persistence:
      enabled: true
      size: 500Gi
      storageClass: fast-ssd
    
    resources:
      requests:
        cpu: 500m
        memory: 1Gi
      limits:
        cpu: 2000m
        memory: 4Gi
  
  readReplicas:
    replicaCount: 2
    persistence:
      enabled: true
      size: 500Gi
    
    resources:
      requests:
        cpu: 250m
        memory: 512Mi
      limits:
        cpu: 1000m
        memory: 2Gi

# Redis configuration
redis:
  enabled: true
  architecture: replication
  
  auth:
    existingSecret: redis-credentials
    existingSecretPasswordKey: password
  
  master:
    persistence:
      enabled: true
      size: 50Gi
    
    resources:
      requests:
        cpu: 100m
        memory: 256Mi
      limits:
        cpu: 500m
        memory: 1Gi
  
  replica:
    replicaCount: 2
    persistence:
      enabled: true
      size: 50Gi

# Monitoring configuration
monitoring:
  prometheus:
    enabled: true
    retention: 30d
    storageClass: fast-ssd
    storageSize: 100Gi
  
  grafana:
    enabled: true
    adminPassword:
      valueFrom:
        secretKeyRef:
          name: grafana-credentials
          key: password
  
  alertmanager:
    enabled: true
    config:
      route:
        group_by: ['alertname', 'cluster', 'service']
        group_wait: 10s
        group_interval: 10s
        repeat_interval: 12h
        receiver: 'default'
      
      receivers:
        - name: 'default'
          slack_configs:
            - api_url: '${SLACK_WEBHOOK_URL}'
              channel: '#alerts'
              title: 'ATK Production Alert'
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy Asset Tokenization Kit

on:
  push:
    branches: [main]
    tags: ['v*']
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: settlemint/asset-tokenization-kit

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest
      
      - name: Install dependencies
        run: bun install
      
      - name: Run linting
        run: bun run lint
      
      - name: Run type checking
        run: bun run typecheck
      
      - name: Run unit tests
        run: bun run test
      
      - name: Run contract tests
        run: bun run --cwd kit/contracts test
      
      - name: Build application
        run: bun run build

  security:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4
      
      - name: Run security audit
        run: bun audit
      
      - name: Scan for vulnerabilities
        uses: securecodewarrior/github-action-add-sarif@v1
        with:
          sarif-file: security-scan-results.sarif

  build-images:
    runs-on: ubuntu-latest
    needs: [test, security]
    if: github.event_name == 'push'
    outputs:
      image-tag: ${{ steps.meta.outputs.tags }}
      image-digest: ${{ steps.build.outputs.digest }}
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=sha,prefix={{branch}}-
      
      - name: Build and push Docker image
        id: build
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ./Dockerfile.dapp
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy-staging:
    runs-on: ubuntu-latest
    needs: build-images
    if: github.ref == 'refs/heads/main'
    environment: staging
    steps:
      - uses: actions/checkout@v4
      
      - name: Configure kubectl
        uses: azure/k8s-set-context@v3
        with:
          method: kubeconfig
          kubeconfig: ${{ secrets.KUBE_CONFIG_STAGING }}
      
      - name: Deploy to staging
        run: |
          helm upgrade --install atk-staging ./kit/charts/atk \
            --namespace atk-staging \
            --create-namespace \
            --values ./kit/charts/atk/values-staging.yaml \
            --set image.tag=${{ needs.build-images.outputs.image-tag }}

  integration-tests:
    runs-on: ubuntu-latest
    needs: deploy-staging
    steps:
      - uses: actions/checkout@v4
      
      - uses: oven-sh/setup-bun@v1
      
      - name: Install dependencies
        run: bun install
      
      - name: Run E2E tests
        run: |
          export TEST_BASE_URL=https://staging.tokenization.company.com
          bun run test:e2e:api
          bun run test:e2e:ui
        env:
          PLAYWRIGHT_BASE_URL: https://staging.tokenization.company.com

  deploy-production:
    runs-on: ubuntu-latest
    needs: [build-images, integration-tests]
    if: startsWith(github.ref, 'refs/tags/v')
    environment: production
    steps:
      - uses: actions/checkout@v4
      
      - name: Configure kubectl
        uses: azure/k8s-set-context@v3
        with:
          method: kubeconfig
          kubeconfig: ${{ secrets.KUBE_CONFIG_PRODUCTION }}
      
      - name: Deploy to production
        run: |
          helm upgrade --install atk-production ./kit/charts/atk \
            --namespace atk-production \
            --create-namespace \
            --values ./kit/charts/atk/values-production.yaml \
            --set image.tag=${{ needs.build-images.outputs.image-tag }}
      
      - name: Verify deployment
        run: |
          kubectl rollout status deployment/atk-frontend -n atk-production
          kubectl rollout status deployment/atk-api -n atk-production
```

## 📊 Monitoring & Observability

### Monitoring Stack Configuration

```mermaid
graph LR
    subgraph "📊 Data Collection"
        A[📈 Application Metrics]
        B[🔗 Blockchain Metrics]
        C[☸️ Kubernetes Metrics]
        D[📋 Application Logs]
    end
    
    subgraph "💾 Storage & Processing"
        E[📊 Prometheus]
        F[📋 Elasticsearch]
        G[🔄 LogStash]
        H[📊 Kibana]
    end
    
    subgraph "📈 Visualization"
        I[📊 Grafana Dashboards]
        J[📋 Kibana Dashboards]
        K[🚨 Alert Rules]
        L[📧 Notification Channels]
    end
    
    A --> E
    B --> E
    C --> E
    D --> F
    E --> I
    F --> G
    G --> H
    H --> J
    I --> K
    J --> L
    
    style A fill:#bbdefb,stroke:#1976d2,color:#000000
    style E fill:#c8e6c9,stroke:#388e3c,color:#000000
    style I fill:#fff9c4,stroke:#f57f17,color:#000000
```

### Monitoring Implementation

```typescript
// Application metrics collection
export class MetricsCollector {
  private prometheus: PrometheusRegistry;
  
  constructor() {
    this.prometheus = new PrometheusRegistry();
    this.setupMetrics();
  }
  
  private setupMetrics() {
    // HTTP request metrics
    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code']
    });
    
    // Business metrics
    this.assetCreationCounter = new Counter({
      name: 'assets_created_total',
      help: 'Total number of assets created',
      labelNames: ['asset_type', 'creator']
    });
    
    this.complianceCheckCounter = new Counter({
      name: 'compliance_checks_total',
      help: 'Total number of compliance checks performed',
      labelNames: ['module', 'result', 'token']
    });
    
    this.transactionVolumeGauge = new Gauge({
      name: 'transaction_volume_usd',
      help: 'Total transaction volume in USD',
      labelNames: ['token_type']
    });
    
    // Register metrics
    this.prometheus.register(this.httpRequestDuration);
    this.prometheus.register(this.assetCreationCounter);
    this.prometheus.register(this.complianceCheckCounter);
    this.prometheus.register(this.transactionVolumeGauge);
  }
  
  // Record business events
  recordAssetCreation(assetType: string, creator: string) {
    this.assetCreationCounter.inc({
      asset_type: assetType,
      creator: creator
    });
  }
  
  recordComplianceCheck(
    module: string,
    result: 'passed' | 'failed',
    token: string
  ) {
    this.complianceCheckCounter.inc({
      module,
      result,
      token
    });
  }
  
  updateTransactionVolume(tokenType: string, volumeUSD: number) {
    this.transactionVolumeGauge.set(
      { token_type: tokenType },
      volumeUSD
    );
  }
  
  // Export metrics for Prometheus
  async getMetrics(): Promise<string> {
    return await this.prometheus.metrics();
  }
}
```

### Grafana Dashboard Configuration

```json
{
  "dashboard": {
    "title": "Asset Tokenization Kit - Production Dashboard",
    "panels": [
      {
        "title": "Asset Creation Rate",
        "type": "stat",
        "targets": [
          {
            "expr": "rate(assets_created_total[5m])",
            "legendFormat": "Assets/min"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "unit": "reqps",
            "color": {
              "mode": "thresholds"
            },
            "thresholds": {
              "steps": [
                {"color": "green", "value": null},
                {"color": "yellow", "value": 10},
                {"color": "red", "value": 50}
              ]
            }
          }
        }
      },
      
      {
        "title": "Compliance Check Success Rate",
        "type": "stat",
        "targets": [
          {
            "expr": "rate(compliance_checks_total{result=\"passed\"}[5m]) / rate(compliance_checks_total[5m]) * 100",
            "legendFormat": "Success Rate"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "unit": "percent",
            "min": 0,
            "max": 100
          }
        }
      },
      
      {
        "title": "Transaction Volume by Asset Type",
        "type": "timeseries",
        "targets": [
          {
            "expr": "transaction_volume_usd",
            "legendFormat": "{{token_type}}"
          }
        ]
      },
      
      {
        "title": "API Response Times",
        "type": "timeseries",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          },
          {
            "expr": "histogram_quantile(0.50, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "50th percentile"
          }
        ]
      }
    ]
  }
}
```

## 🔒 Security Operations

### Security Monitoring

```mermaid
flowchart LR
    subgraph "🔍 Threat Detection"
        A[🚨 Anomaly Detection]
        B[🔍 Pattern Analysis]
        C[🚫 Intrusion Detection]
        D[📊 Behavioral Analysis]
    end
    
    subgraph "🛡️ Security Controls"
        E[🔐 Access Control]
        F[🔒 Encryption]
        G[🛡️ Network Security]
        H[📋 Audit Logging]
    end
    
    subgraph "🚨 Incident Response"
        I[🚨 Alert Generation]
        J[📞 Escalation]
        K[🔧 Automated Response]
        L[📋 Investigation]
    end
    
    A --> E
    B --> F
    C --> G
    D --> H
    E --> I
    F --> J
    G --> K
    H --> L
    
    style A fill:#ffcdd2,stroke:#d32f2f,color:#000000
    style E fill:#c8e6c9,stroke:#388e3c,color:#000000
    style I fill:#fff3e0,stroke:#ef6c00,color:#000000
```

### Security Configuration

```typescript
// Security monitoring service
export class SecurityMonitor {
  private alertThresholds = {
    failedLogins: 5,
    unusualTransactionVolume: 1000000, // $1M
    complianceFailureRate: 0.1, // 10%
    apiErrorRate: 0.05 // 5%
  };
  
  async monitorSecurityEvents() {
    // Monitor failed login attempts
    const failedLogins = await this.getFailedLoginCount(
      Date.now() - 5 * 60 * 1000 // Last 5 minutes
    );
    
    if (failedLogins > this.alertThresholds.failedLogins) {
      await this.triggerAlert({
        type: 'SECURITY_THREAT',
        severity: 'HIGH',
        message: `${failedLogins} failed login attempts in 5 minutes`,
        action: 'ENABLE_RATE_LIMITING'
      });
    }
    
    // Monitor transaction volumes
    const recentVolume = await this.getTransactionVolume(
      Date.now() - 60 * 60 * 1000 // Last hour
    );
    
    if (recentVolume > this.alertThresholds.unusualTransactionVolume) {
      await this.triggerAlert({
        type: 'UNUSUAL_ACTIVITY',
        severity: 'MEDIUM',
        message: `Unusual transaction volume: $${recentVolume.toLocaleString()}`,
        action: 'REVIEW_TRANSACTIONS'
      });
    }
    
    // Monitor compliance failures
    const complianceFailures = await this.getComplianceFailureRate(
      Date.now() - 24 * 60 * 60 * 1000 // Last 24 hours
    );
    
    if (complianceFailures > this.alertThresholds.complianceFailureRate) {
      await this.triggerAlert({
        type: 'COMPLIANCE_ISSUE',
        severity: 'HIGH',
        message: `High compliance failure rate: ${(complianceFailures * 100).toFixed(2)}%`,
        action: 'REVIEW_COMPLIANCE_RULES'
      });
    }
  }
  
  async triggerAlert(alert: SecurityAlert) {
    // Log alert
    logger.error('SECURITY_ALERT', alert);
    
    // Send to monitoring system
    await this.sendToMonitoring(alert);
    
    // Execute automated response if configured
    if (alert.action) {
      await this.executeAutomatedResponse(alert.action);
    }
    
    // Notify security team
    await this.notifySecurityTeam(alert);
  }
  
  private async executeAutomatedResponse(action: string) {
    switch (action) {
      case 'ENABLE_RATE_LIMITING':
        await this.enableRateLimiting();
        break;
        
      case 'REVIEW_TRANSACTIONS':
        await this.flagTransactionsForReview();
        break;
        
      case 'REVIEW_COMPLIANCE_RULES':
        await this.generateComplianceReport();
        break;
    }
  }
}
```

## 🔄 Backup & Recovery

### Backup Strategy

```mermaid
graph TD
    subgraph "💾 Data Sources"
        A[🗄️ PostgreSQL Database]
        B[⚡ Redis Cache]
        C[📦 MinIO Files]
        D[🔑 Secrets & Keys]
    end
    
    subgraph "🔄 Backup Process"
        E[📊 Scheduled Backups]
        F[🔄 Incremental Backups]
        G[📦 Full Backups]
        H[🔒 Encrypted Storage]
    end
    
    subgraph "☁️ Storage Locations"
        I[☁️ Cloud Storage]
        J[🏢 On-premise Storage]
        K[🌍 Geographic Replication]
        L[❄️ Cold Storage]
    end
    
    A --> E
    B --> F
    C --> G
    D --> H
    E --> I
    F --> J
    G --> K
    H --> L
    
    style A fill:#bbdefb,stroke:#1976d2,color:#000000
    style E fill:#c8e6c9,stroke:#388e3c,color:#000000
    style I fill:#fff9c4,stroke:#f57f17,color:#000000
```

### Backup Implementation

```bash
#!/bin/bash
# backup-script.sh - Comprehensive backup automation

set -euo pipefail

# Configuration
BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/atk-${BACKUP_DATE}"
S3_BUCKET="atk-backups"
RETENTION_DAYS=30

# Create backup directory
mkdir -p "${BACKUP_DIR}"

echo "🚀 Starting backup process for ${BACKUP_DATE}"

# 1. Database backup
echo "📊 Backing up PostgreSQL database..."
kubectl exec -n atk-production deployment/postgresql -- \
  pg_dumpall -U postgres | gzip > "${BACKUP_DIR}/database.sql.gz"

# 2. Redis backup
echo "⚡ Backing up Redis data..."
kubectl exec -n atk-production deployment/redis -- \
  redis-cli --rdb /tmp/dump.rdb
kubectl cp atk-production/redis:/tmp/dump.rdb "${BACKUP_DIR}/redis.rdb"

# 3. MinIO backup
echo "📦 Backing up MinIO files..."
kubectl exec -n atk-production deployment/minio -- \
  tar czf /tmp/minio-data.tar.gz /data
kubectl cp atk-production/minio:/tmp/minio-data.tar.gz "${BACKUP_DIR}/minio-data.tar.gz"

# 4. Kubernetes configurations
echo "☸️ Backing up Kubernetes configurations..."
kubectl get all -n atk-production -o yaml > "${BACKUP_DIR}/k8s-resources.yaml"
kubectl get secrets -n atk-production -o yaml > "${BACKUP_DIR}/k8s-secrets.yaml"
kubectl get configmaps -n atk-production -o yaml > "${BACKUP_DIR}/k8s-configmaps.yaml"

# 5. Smart contract artifacts
echo "📋 Backing up smart contract artifacts..."
cp -r ./kit/contracts/.generated "${BACKUP_DIR}/contract-artifacts"

# 6. Encrypt backup
echo "🔒 Encrypting backup..."
tar czf - "${BACKUP_DIR}" | \
  gpg --cipher-algo AES256 --compress-algo 1 --symmetric \
      --output "${BACKUP_DIR}.tar.gz.gpg"

# 7. Upload to cloud storage
echo "☁️ Uploading to cloud storage..."
aws s3 cp "${BACKUP_DIR}.tar.gz.gpg" \
  "s3://${S3_BUCKET}/daily/${BACKUP_DATE}.tar.gz.gpg"

# 8. Cleanup old backups
echo "🧹 Cleaning up old backups..."
find /backups -name "atk-*" -mtime +${RETENTION_DAYS} -exec rm -rf {} \;

aws s3 ls "s3://${S3_BUCKET}/daily/" | \
  awk '$1 < "'$(date -d "${RETENTION_DAYS} days ago" '+%Y-%m-%d')'"' | \
  awk '{print $4}' | \
  xargs -I {} aws s3 rm "s3://${S3_BUCKET}/daily/{}"

echo "✅ Backup process completed successfully"

# 9. Verify backup integrity
echo "🔍 Verifying backup integrity..."
gpg --decrypt "${BACKUP_DIR}.tar.gz.gpg" | tar tz > /dev/null
echo "✅ Backup integrity verified"

# 10. Send notification
curl -X POST "${SLACK_WEBHOOK_URL}" \
  -H 'Content-type: application/json' \
  --data '{
    "text": "✅ ATK Production backup completed successfully",
    "attachments": [
      {
        "color": "good",
        "fields": [
          {
            "title": "Backup Date",
            "value": "'${BACKUP_DATE}'",
            "short": true
          },
          {
            "title": "Size",
            "value": "'$(du -h "${BACKUP_DIR}.tar.gz.gpg" | cut -f1)'",
            "short": true
          }
        ]
      }
    ]
  }'
```

### Disaster Recovery Plan

```mermaid
flowchart TD
    A[🚨 Incident Detection] --> B{🔍 Assess Severity}
    B -->|🟢 Low| C[📋 Standard Response]
    B -->|🟡 Medium| D[⚡ Escalated Response]
    B -->|🔴 High| E[🚨 Emergency Response]
    
    C --> F[📊 Monitor & Log]
    D --> G[🔧 Automated Recovery]
    E --> H[👥 Manual Intervention]
    
    G --> I{✅ Recovery Success?}
    H --> I
    
    I -->|✅ Yes| J[📊 Post-incident Review]
    I -->|❌ No| K[🔄 Escalate Further]
    
    K --> L[🆘 Full System Recovery]
    L --> M[📦 Restore from Backup]
    M --> N[🔍 Verify System State]
    N --> O[📊 Resume Operations]
    
    J --> P[📋 Update Procedures]
    O --> P
    
    style A fill:#ffcdd2,stroke:#d32f2f,color:#000000
    style E fill:#ff8a80,stroke:#d32f2f,color:#000000
    style L fill:#ffab91,stroke:#d84315,color:#000000
    style O fill:#c8e6c9,stroke:#388e3c,color:#000000
```

This comprehensive deployment and operations guide provides the foundation for running the Asset Tokenization Kit in production environments with robust monitoring, security, and disaster recovery capabilities.

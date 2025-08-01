# Hasura GraphQL Engine

![Version: 0.1.0](https://img.shields.io/badge/Version-0.1.0-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: 0.1.0](https://img.shields.io/badge/AppVersion-0.1.0-informational?style=flat-square)

A Helm chart for deploying Hasura GraphQL Engine - an instant GraphQL API server that provides real-time GraphQL APIs over PostgreSQL databases.

## Overview

Hasura GraphQL Engine is the central data access layer for the Asset Tokenization Kit, providing instant GraphQL APIs over PostgreSQL with real-time subscriptions, fine-grained access control, and business logic integration. It serves as the primary data gateway for the DApp frontend and other applications.

## Key Features

- **Instant GraphQL API**: Auto-generated GraphQL schema from PostgreSQL
- **Real-time Subscriptions**: Live data updates via GraphQL subscriptions
- **Advanced Security**: Row-level security and role-based access control
- **Remote Schemas**: Federation with external GraphQL services
- **Event Triggers**: Serverless functions triggered by database events
- **Caching**: Built-in query caching and response optimization
- **Admin Console**: Web-based database and API management interface

## Architecture

### Core Components

#### GraphQL Engine
- **Schema Generation**: Auto-generates GraphQL schema from database structure
- **Query Processing**: Efficient SQL query generation and execution
- **Subscription Management**: WebSocket-based real-time subscriptions
- **Permission System**: Advanced authorization with custom business logic

#### Admin Console
- **Schema Management**: Visual database schema editor
- **API Explorer**: GraphQL playground with query builder
- **Permission Editor**: Visual role and permission management
- **Monitoring Dashboard**: Query analytics and performance metrics

#### Event System
- **Database Events**: Triggers on INSERT, UPDATE, DELETE operations
- **Scheduled Events**: Cron-based scheduled function execution
- **Webhook Integration**: HTTP-based event delivery to external services

## Data Architecture for ATK

### Database Schema Integration
Hasura provides GraphQL APIs for ATK's core entities:

```graphql
# Core token entities
type Token {
  id: uuid!
  address: String!
  name: String!
  symbol: String!
  totalSupply: numeric
  issuedAt: timestamptz
  
  # Relationships
  transfers: [Transfer!]!
  balances: [TokenBalance!]!
  complianceRules: [ComplianceRule!]!
}

type Transfer {
  id: uuid!
  tokenId: uuid!
  fromAddress: String
  toAddress: String!
  amount: numeric!
  timestamp: timestamptz!
  transactionHash: String!
  
  # Relationships
  token: Token!
  compliance: ComplianceCheck
}

type TokenBalance {
  id: uuid!
  tokenId: uuid!
  ownerAddress: String!
  balance: numeric!
  frozen: Boolean!
  lastUpdated: timestamptz!
  
  # Relationships
  token: Token!
  owner: Identity
}
```

### Remote Schema Federation
```yaml
# Integration with external GraphQL services
remote_schemas:
- name: "graph-node"
  definition:
    url: "http://graph-node:8000/subgraphs/name/kit"
    headers:
      Authorization: "Bearer ${GRAPH_NODE_AUTH_TOKEN}"
  
- name: "portal-api"
  definition:
    url: "http://portal:3001/graphql"
    headers:
      X-API-Key: "${PORTAL_API_KEY}"
```

## Configuration

### Database Connection
```yaml
graphql-engine:
  extraEnvs:
  - name: HASURA_GRAPHQL_DATABASE_URL
    valueFrom:
      secretKeyRef:
        name: atk-secrets
        key: DEFAULT_DB_URL
  
  - name: HASURA_GRAPHQL_PG_CONNECTIONS
    value: "10"
```

### Essential Settings
```yaml
graphql-engine:
  config:
    devMode: true                           # Enable development mode
    enableInternalConsoleAssets: true       # Serve admin console
    metadataOnly: false                     # Enable query processing
  
  secret:
    enabled: true
    adminSecret: "your-admin-secret"
    metadataDbUrl: "postgresql://hasura:password@postgresql:5432/hasura"
    redisUrl: "redis://default:password@redis:6379"
    rateLimitRedisUrl: "redis://default:password@redis:6379"
```

### Redis Integration
```yaml
# Caching and session management
extraEnvs:
- name: HASURA_GRAPHQL_REDIS_URL
  value: "redis://default:atk@redis:6379"

- name: HASURA_GRAPHQL_RATE_LIMIT_REDIS_URL  
  value: "redis://default:atk@redis:6379"

- name: HASURA_GRAPHQL_USE_PREPARED_STATEMENTS
  value: "true"
```

## Access Control and Security

### Role-Based Access Control
```sql
-- Example role configuration
CREATE ROLE "user";
CREATE ROLE "admin";
CREATE ROLE "compliance_officer";
CREATE ROLE "transfer_agent";

-- Row-level security example
CREATE POLICY user_token_access ON tokens
  FOR SELECT TO "user"
  USING (
    EXISTS (
      SELECT 1 FROM token_balances tb 
      WHERE tb.token_id = tokens.id 
      AND tb.owner_address = current_setting('hasura.user.address')
    )
  );
```

### Permission Rules Example
```json
{
  "role": "user",
  "permission": {
    "columns": ["id", "name", "symbol", "totalSupply"],
    "filter": {
      "balances": {
        "ownerAddress": {
          "_eq": "X-Hasura-User-Address"
        }
      }
    },
    "limit": 100
  }
}
```

### JWT Authentication
```yaml
graphql-engine:
  extraEnvs:
  - name: HASURA_GRAPHQL_JWT_SECRET
    value: |
      {
        "type": "HS256",
        "key": "your-jwt-secret-key",
        "claims_map": {
          "x-hasura-allowed-roles": ["user", "admin"],
          "x-hasura-default-role": "user",
          "x-hasura-user-id": "sub",
          "x-hasura-user-address": "ethereum_address"
        }
      }
```

## Deployment Patterns

### Single Instance (Development)
```yaml
graphql-engine:
  replicas: 1
  resources:
    requests:
      memory: "512Mi"
      cpu: "250m"
    limits:
      memory: "1Gi"
      cpu: "1000m"
```

### High Availability (Production)
```yaml
graphql-engine:
  replicas: 3
  
  # Load balancing configuration
  service:
    type: ClusterIP
    sessionAffinity: None
  
  # Health checks
  livenessProbe:
    httpGet:
      path: /healthz
      port: 8080
    initialDelaySeconds: 30
    periodSeconds: 10
  
  readinessProbe:
    httpGet:
      path: /healthz
      port: 8080
    initialDelaySeconds: 5
    periodSeconds: 5
```

## Ingress Configuration

```yaml
graphql-engine:
  ingress:
    enabled: true
    ingressClassName: "atk-nginx"
    hostName: "hasura.k8s.orb.local"
    annotations:
      nginx.ingress.kubernetes.io/cors-allow-origin: "https://dapp.local"
      nginx.ingress.kubernetes.io/cors-allow-methods: "GET, POST, OPTIONS"
      nginx.ingress.kubernetes.io/cors-allow-headers: "Authorization, Content-Type"
      nginx.ingress.kubernetes.io/enable-cors: "true"
```

## Initialization and Migration

### PostgreSQL Readiness Check
```yaml
graphql-engine:
  initContainers:
  - name: wait-for-postgresql-ready
    image: docker.io/postgres
    env:
    - name: PGPASSWORD
      value: "atk"
    command:
    - /bin/sh
    - -c
    - |
      set -e
      echo "Waiting for PostgreSQL to be ready..."
      
      # Add random delay to prevent connection storms
      RANDOM_DELAY=$((RANDOM % 30 + 5))
      echo "Adding random delay of ${RANDOM_DELAY} seconds..."
      sleep $RANDOM_DELAY
      
      # Test connection with exponential backoff
      RETRY_COUNT=0
      MAX_RETRIES=30
      WAIT_TIME=2
      
      while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
        if pg_isready -h postgresql -p 5432 -U hasura && \
           psql -h postgresql -p 5432 -U hasura -d hasura -c "SELECT 1;" > /dev/null 2>&1; then
          echo "PostgreSQL is ready!"
          exit 0
        fi
        
        RETRY_COUNT=$((RETRY_COUNT + 1))
        echo "PostgreSQL not ready (attempt $RETRY_COUNT/$MAX_RETRIES). Waiting ${WAIT_TIME}s..."
        sleep $WAIT_TIME
        
        WAIT_TIME=$((WAIT_TIME * 2))
        if [ $WAIT_TIME -gt 30 ]; then
          WAIT_TIME=30
        fi
      done
      
      echo "PostgreSQL failed to become ready after $MAX_RETRIES attempts"
      exit 1
```

### Metadata Management
```bash
# Export current metadata
hasura metadata export --admin-secret=your-secret

# Apply metadata from file
hasura metadata apply --admin-secret=your-secret

# Clear all metadata (dangerous!)
hasura metadata clear --admin-secret=your-secret
```

## Event Triggers and Business Logic

### Database Event Triggers
```json
{
  "name": "token_transfer_trigger",
  "table": {
    "name": "transfers",
    "schema": "public"
  },
  "webhook": "http://portal:3001/webhooks/transfer-notification",
  "events": ["insert"],
  "include_in_metadata": true,
  "headers": [
    {
      "name": "X-API-Key",
      "value": "${PORTAL_API_KEY}"
    }
  ],
  "retry_conf": {
    "num_retries": 3,
    "interval_sec": 10,
    "timeout_sec": 60
  }
}
```

### Scheduled Events
```json
{
  "name": "compliance_check_daily",
  "webhook": "http://portal:3001/webhooks/daily-compliance-check",
  "schedule": "0 2 * * *",
  "include_in_metadata": true,
  "headers": [
    {
      "name": "X-API-Key", 
      "value": "${PORTAL_API_KEY}"
    }
  ]
}
```

## Monitoring and Performance

### Metrics and Monitoring
```yaml
graphql-engine:
  extraEnvs:
  - name: HASURA_GRAPHQL_ENABLE_TELEMETRY
    value: "false"
  
  - name: HASURA_GRAPHQL_ENABLED_LOG_TYPES
    value: "startup, http-log, webhook-log, websocket-log, query-log"
  
  - name: HASURA_GRAPHQL_LOG_LEVEL
    value: "info"
```

### Query Performance Analysis
```sql
-- Monitor slow queries
SELECT 
  query_hash,
  query,
  avg(execution_time) as avg_time,
  count(*) as frequency
FROM hdb_catalog.hdb_query_log 
WHERE execution_time > 1000
GROUP BY query_hash, query
ORDER BY avg_time DESC;

-- Check connection pool status
SELECT 
  state,
  count(*) as connections
FROM pg_stat_activity 
WHERE datname = 'hasura'
GROUP BY state;
```

## Troubleshooting

### Common Issues

#### 1. Console Not Loading
```bash
# Check if admin secret is correct
curl -H "x-hasura-admin-secret: your-secret" \
  http://hasura.local/v1/version

# Verify ingress configuration
kubectl get ingress -n atk
kubectl describe ingress hasura-ingress -n atk
```

#### 2. Database Connection Issues
```bash
# Test database connectivity from Hasura pod
kubectl exec -it deployment/hasura -- \
  pg_isready -h postgresql -p 5432 -U hasura

# Check database credentials
kubectl get secret atk-secrets -o yaml
```

#### 3. Slow Query Performance
```bash
# Enable query logging
kubectl set env deployment/hasura \
  HASURA_GRAPHQL_ENABLED_LOG_TYPES="startup, http-log, webhook-log, websocket-log, query-log"

# Monitor query performance
kubectl logs -l app.kubernetes.io/name=graphql-engine | grep "query-log"
```

#### 4. Subscription Issues
```bash
# Check WebSocket connections
kubectl logs -l app.kubernetes.io/name=graphql-engine | grep "websocket"

# Test subscription manually
curl -N -H "Connection: Upgrade" \
  -H "Upgrade: websocket" \
  -H "x-hasura-admin-secret: your-secret" \
  ws://hasura.local/v1/graphql
```

### Performance Optimization

#### Connection Pool Tuning
```yaml
graphql-engine:
  extraEnvs:
  - name: HASURA_GRAPHQL_PG_CONNECTIONS
    value: "25"  # Adjust based on database capacity
  
  - name: HASURA_GRAPHQL_PG_TIMEOUT
    value: "180"
  
  - name: HASURA_GRAPHQL_USE_PREPARED_STATEMENTS
    value: "true"
```

#### Query Caching
```yaml
# Enable Redis-based caching
- name: HASURA_GRAPHQL_REDIS_URL
  value: "redis://default:atk@redis:6379"

- name: HASURA_GRAPHQL_QUERY_PLAN_CACHE_SIZE
  value: "4000"
```

## Integration with ATK Components

### Data Flow Architecture
1. **DApp Frontend** → GraphQL queries/mutations → **Hasura**
2. **Hasura** → SQL queries → **PostgreSQL**
3. **Database Events** → **Event Triggers** → **Portal API**
4. **Graph Node** → **Remote Schema** → **Hasura** (federation)
5. **Hasura** → **WebSocket subscriptions** → **DApp Frontend**

### Sample Queries for ATK
```graphql
# Get user's token portfolio
query UserPortfolio($userAddress: String!) {
  tokenBalances(where: {ownerAddress: {_eq: $userAddress}}) {
    balance
    frozen
    token {
      name
      symbol
      address
    }
  }
}

# Subscribe to transfer events
subscription TransferEvents($tokenId: uuid!) {
  transfers(
    where: {tokenId: {_eq: $tokenId}}
    order_by: {timestamp: desc}
    limit: 50
  ) {
    id
    fromAddress
    toAddress
    amount
    timestamp
    transactionHash
  }
}

# Complex query with remote schema
query TokenAnalytics($tokenAddress: String!) {
  # Local database data
  tokens(where: {address: {_eq: $tokenAddress}}) {
    name
    symbol
    totalSupply
  }
  
  # Remote schema data from Graph Node
  graph_node {
    token(id: $tokenAddress) {
      transferCount
      holderCount
      volume24h
    }
  }
}
```

## Maintainers

| Name | Email | Url |
| ---- | ------ | --- |
| SettleMint | <support@settlemint.com> | <https://settlemint.com> |

## Requirements

| Repository | Name | Version |
|------------|------|---------|
| https://hasura.github.io/helm-charts | graphql-engine | 0.9.0 |

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| busybox.pullPolicy | string | `"IfNotPresent"` |  |
| busybox.registry | string | `"docker.io"` |  |
| busybox.repository | string | `"busybox"` |  |
| busybox.tag | float | `1.37` |  |
| git.image.pullPolicy | string | `"IfNotPresent"` |  |
| git.image.registry | string | `"docker.io"` |  |
| git.image.repository | string | `"alpine/git"` |  |
| git.image.tag | string | `"v2.49.1"` |  |
| graphql-engine.config.devMode | bool | `true` |  |
| graphql-engine.config.enableInternalConsoleAssets | bool | `true` |  |
| graphql-engine.config.metadataOnly | bool | `false` |  |
| graphql-engine.extraEnvs[0].name | string | `"HASURA_GRAPHQL_PG_CONNECTIONS"` |  |
| graphql-engine.extraEnvs[0].value | string | `"10"` |  |
| graphql-engine.extraEnvs[1].name | string | `"HASURA_GRAPHQL_DATABASE_URL"` |  |
| graphql-engine.extraEnvs[1].valueFrom.secretKeyRef.key | string | `"DEFAULT_DB_URL"` |  |
| graphql-engine.extraEnvs[1].valueFrom.secretKeyRef.name | string | `"atk-secrets"` |  |
| graphql-engine.global.imagePullSecrets[0] | string | `"image-pull-secret-docker"` |  |
| graphql-engine.global.imagePullSecrets[1] | string | `"image-pull-secret-ghcr"` |  |
| graphql-engine.global.imagePullSecrets[2] | string | `"image-pull-secret-harbor"` |  |
| graphql-engine.image.repository | string | `"docker.io/hasura/graphql-engine"` |  |
| graphql-engine.ingress.enabled | bool | `true` |  |
| graphql-engine.ingress.hostName | string | `"hasura.k8s.orb.local"` |  |
| graphql-engine.ingress.ingressClassName | string | `"atk-nginx"` |  |
| graphql-engine.initContainers[0].command[0] | string | `"/bin/sh"` |  |
| graphql-engine.initContainers[0].command[1] | string | `"-c"` |  |
| graphql-engine.initContainers[0].command[2] | string | `"set -e\necho \"Waiting for PostgreSQL to be ready...\"\n\n# Add random delay to prevent all nodes from connecting simultaneously\nRANDOM_DELAY=$((RANDOM % 30 + 5))\necho \"Adding random delay of ${RANDOM_DELAY} seconds to stagger connections...\"\nsleep $RANDOM_DELAY\n\n# Function to test PostgreSQL connection\ntest_postgres() {\n  pg_isready -h postgresql -p 5432 -U hasura && \\\n  psql -h postgresql -p 5432 -U hasura -d hasura -c \"SELECT 1;\" > /dev/null 2>&1\n}\n\n# Wait with exponential backoff\nRETRY_COUNT=0\nMAX_RETRIES=30\nWAIT_TIME=2\n\nwhile [ $RETRY_COUNT -lt $MAX_RETRIES ]; do\n  if test_postgres; then\n    echo \"PostgreSQL is ready!\"\n    exit 0\n  fi\n\n  RETRY_COUNT=$((RETRY_COUNT + 1))\n  echo \"PostgreSQL not ready (attempt $RETRY_COUNT/$MAX_RETRIES). Waiting ${WAIT_TIME}s...\"\n  sleep $WAIT_TIME\n\n  # Exponential backoff with max of 30 seconds\n  WAIT_TIME=$((WAIT_TIME * 2))\n  if [ $WAIT_TIME -gt 30 ]; then\n    WAIT_TIME=30\n  fi\ndone\n\necho \"PostgreSQL failed to become ready after $MAX_RETRIES attempts\"\nexit 1\n"` |  |
| graphql-engine.initContainers[0].env[0].name | string | `"PGPASSWORD"` |  |
| graphql-engine.initContainers[0].env[0].value | string | `"atk"` |  |
| graphql-engine.initContainers[0].image | string | `"docker.io/postgres"` |  |
| graphql-engine.initContainers[0].name | string | `"wait-for-postgresql-ready"` |  |
| graphql-engine.labels."app.kubernetes.io/component" | string | `"hasura"` |  |
| graphql-engine.labels."app.kubernetes.io/instance" | string | `"atk"` |  |
| graphql-engine.labels."app.kubernetes.io/managed-by" | string | `"helm"` |  |
| graphql-engine.labels."app.kubernetes.io/part-of" | string | `"settlemint-atk"` |  |
| graphql-engine.labels."kots.io/app-slug" | string | `"settlemint-atk"` |  |
| graphql-engine.nameOverride | string | `"hasura"` |  |
| graphql-engine.postgres.enabled | bool | `false` |  |
| graphql-engine.replicas | int | `1` |  |
| graphql-engine.secret.adminSecret | string | `"atk"` |  |
| graphql-engine.secret.enabled | bool | `true` |  |
| graphql-engine.secret.extraSecrets.DEFAULT_DB_URL | string | `"postgresql://hasura:atk@postgresql:5432/hasura"` |  |
| graphql-engine.secret.metadataDbUrl | string | `"postgresql://hasura:atk@postgresql:5432/hasura"` |  |
| graphql-engine.secret.rateLimitRedisUrl | string | `"redis://default:atk@redis:6379"` |  |
| graphql-engine.secret.redisUrl | string | `"redis://default:atk@redis:6379"` |  |
| imagePullSecrets[0] | string | `"image-pull-secret-docker"` |  |
| imagePullSecrets[1] | string | `"image-pull-secret-ghcr"` |  |
| imagePullSecrets[2] | string | `"image-pull-secret-harbor"` |  |
| job.workspace.accessMode | string | `"ReadWriteOnce"` |  |
| job.workspace.enabled | bool | `true` | Configure the persistent volume claim for the job workspace |
| job.workspace.size | string | `"1Gi"` |  |
| job.workspace.storageClass | string | `""` |  |

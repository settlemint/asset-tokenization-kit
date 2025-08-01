# Graph Node

![Version: 0.0.1](https://img.shields.io/badge/Version-0.0.1-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: v0.39.1](https://img.shields.io/badge/AppVersion-v0.39.1-informational?style=flat-square)

A Helm chart for deploying The Graph Protocol's Graph Node - a decentralized indexing protocol for querying blockchain data via GraphQL.

## Overview

Graph Node is the core indexing component of The Graph Protocol, providing efficient blockchain data indexing and GraphQL API access. In the Asset Tokenization Kit, it indexes ERC-3643 security token events, compliance data, and transaction history, making complex blockchain queries fast and efficient through subgraphs.

## Key Features

- **Subgraph Indexing**: Automated indexing of smart contract events and state
- **GraphQL API**: Powerful query interface with filtering, sorting, and pagination
- **Real-time Updates**: Live data synchronization with blockchain events
- **Multi-chain Support**: Support for multiple blockchain networks
- **Efficient Storage**: Optimized PostgreSQL schema for time-series data
- **Fault Tolerance**: Robust error handling and automatic recovery
- **IPFS Integration**: Decentralized metadata and schema storage

## Architecture

### Core Components

#### Indexing Engine
- **Block Processing**: Monitors blockchain for new blocks and transactions
- **Event Extraction**: Parses contract events and function calls
- **State Tracking**: Maintains current state of indexed entities
- **Reorg Handling**: Handles blockchain reorganizations gracefully

#### Query Engine
- **GraphQL Server**: Serves indexed data via GraphQL API
- **Query Optimization**: Efficient query planning and execution
- **Caching Layer**: Response caching for improved performance
- **WebSocket Support**: Real-time subscriptions for live data

#### Storage Layer
- **PostgreSQL**: Primary database for indexed data
- **Schema Management**: Dynamic schema updates based on subgraph definitions
- **Partitioning**: Time-based partitioning for efficient queries
- **Indexing**: Optimized database indexes for common query patterns

## Subgraph Integration

### ATK Kit Subgraph
The Graph Node indexes the ATK's smart contracts:

```graphql
# Sample queries for tokenized assets
query GetTokenBalances($owner: String!) {
  tokenBalances(where: { owner: $owner }) {
    id
    token {
      name
      symbol
      totalSupply
    }
    balance
    frozen
    lastUpdated
  }
}

query GetComplianceEvents($token: String!) {
  complianceEvents(
    where: { token: $token }
    orderBy: timestamp
    orderDirection: desc
  ) {
    id
    eventType
    investor
    amount
    compliance {
      rule
      status
    }
    timestamp
  }
}
```

### Supported Entities
- **Tokens**: ERC-3643 security tokens
- **Balances**: Token holder balances and restrictions
- **Transfers**: All transfer events with compliance data
- **Compliance**: Compliance rule events and status
- **Identities**: On-chain identity registry data
- **Agents**: Transfer agents and their permissions

## Configuration

### Chain Configuration
```yaml
chains:
  settlemint:
    enabled: true
    shard: "primary"
    provider:
    - label: "erpc"
      details:
        type: "web3"
        url: "http://erpc:4000"
        features: ["archive", "traces"]
```

### Database Configuration
```yaml
store:
  primary:
    enabled: true
    connection: "postgresql://${PRIMARY_SUBGRAPH_DATA_PGUSER}:${PRIMARY_SUBGRAPH_DATA_PGPASSWORD}@${PRIMARY_SUBGRAPH_DATA_PGHOST}:${PRIMARY_SUBGRAPH_DATA_PGPORT}/${PRIMARY_SUBGRAPH_DATA_PGDATABASE}"
```

### Environment Variables
```yaml
env:
  # Node configuration
  node_role: "combined"  # combined, index-node, or query-node
  
  # PostgreSQL connection
  PRIMARY_SUBGRAPH_DATA_PGHOST: "postgresql"
  PRIMARY_SUBGRAPH_DATA_PGPORT: 5432
  PRIMARY_SUBGRAPH_DATA_PGDATABASE: "thegraph"
  
  # IPFS configuration
  IPFS: "https://ipfs.console.settlemint.com"
  
  # Performance tuning
  GRAPH_ETHEREUM_BLOCK_BATCH_SIZE: "100"
  GRAPH_ETHEREUM_MAX_BLOCK_RANGE_SIZE: "1000"
  GRAPH_ETHEREUM_TARGET_TRIGGERS_PER_BLOCK_RANGE: "100"
  
  # Reliability settings
  GRAPH_ETHEREUM_REQUEST_RETRIES: "10"
  GRAPH_KILL_IF_UNRESPONSIVE: "true"
  GRAPH_ETHEREUM_CLEANUP_BLOCKS: "true"
```

## Deployment Patterns

### Single Node (Development)
```yaml
replicaCount: 1
resources:
  requests:
    memory: "1Gi"
    cpu: "500m"
  limits:
    memory: "4Gi"
    cpu: "2000m"
```

### Distributed Setup (Production)
```yaml
# Index nodes (processing)
indexNodes:
  replicaCount: 2
  env:
    node_role: "index-node"
  
# Query nodes (serving)
queryNodes:
  replicaCount: 3
  env:
    node_role: "query-node"
```

## Service Endpoints

### GraphQL API Endpoints
- **Query Endpoint**: `http://graph-node:8000/subgraphs/name/kit`
- **Admin Endpoint**: `http://graph-node:8020/`
- **Status Endpoint**: `http://graph-node:8030/`
- **Metrics Endpoint**: `http://graph-node:8040/metrics`
- **WebSocket**: `ws://graph-node:8001/subgraphs/name/kit`

### Service Configuration
```yaml
service:
  ports:
    httpQuery: 8000      # GraphQL queries
    httpQueryws: 8001    # WebSocket subscriptions
    httpAdmin: 8020      # Administration
    httpStatus: 8030     # Health and status
    httpMetrics: 8040    # Prometheus metrics
```

## Ingress Configuration

```yaml
ingress:
  enabled: true
  className: "atk-nginx"
  hosts:
  - host: graph.k8s.orb.local
    paths:
    - path: "/(.*)"                    # GraphQL endpoint
      pathType: "ImplementationSpecific"
    - path: "/ws/?(.*)"                # WebSocket endpoint
      pathType: "ImplementationSpecific"
    - path: "/admin/?(.*)"             # Admin interface
      pathType: "ImplementationSpecific"
    - path: "/indexer/?(.*)"           # Indexer status
      pathType: "ImplementationSpecific"
    - path: "/graphman/?(.*)"          # Management API
      pathType: "ImplementationSpecific"
```

## PostgreSQL Integration

### Database Schema
Graph Node creates optimized tables for subgraph data:

```sql
-- Example tables created by Graph Node
CREATE TABLE sgd1.token (
    vid BIGSERIAL PRIMARY KEY,
    block_range int4range NOT NULL,
    id TEXT NOT NULL,
    name TEXT,
    symbol TEXT,
    total_supply NUMERIC,
    created_at TIMESTAMPTZ
);

CREATE TABLE sgd1.transfer (
    vid BIGSERIAL PRIMARY KEY,
    block_range int4range NOT NULL,
    id TEXT NOT NULL,
    token TEXT NOT NULL,
    from_address TEXT,
    to_address TEXT,
    amount NUMERIC,
    block_number BIGINT,
    timestamp TIMESTAMPTZ
);
```

### Database Readiness Check
```yaml
postgresReadinessCheck:
  enabled: true
  maxRetries: 30
  initialWaitTime: 2
  maxWaitTime: 30
  randomDelayRange:
    min: 5
    max: 30
```

## Monitoring and Observability

### Health Checks
Graph Node provides comprehensive health monitoring:

```bash
# Check node status
curl http://graph-node:8030/

# Check subgraph status
curl http://graph-node:8030/subgraphs/id/QmbA53S3UUeoxdNQV9PGUDN7WAgFcHT6qU9FiH8QXXGv3z

# Get indexing progress
curl http://graph-node:8020/subgraphs/name/kit
```

### Metrics Collection
```yaml
# Prometheus metrics configuration
env:
  GRAPH_ENABLE_PROMETHEUS_METRICS: "true"
  GRAPH_PROMETHEUS_HOST: "0.0.0.0"
```

Key metrics include:
- **Indexing Rate**: Blocks processed per second
- **Query Performance**: Response times and error rates
- **Database Performance**: Connection pool and query metrics
- **Memory Usage**: Heap and off-heap memory consumption
- **Sync Status**: Current vs. latest block numbers

## Troubleshooting

### Common Issues

#### 1. Subgraph Deployment Failed
```bash
# Check deployment status
kubectl logs -l app.kubernetes.io/name=graph-node | grep -i "deploy"

# Verify IPFS connectivity
kubectl exec -it deployment/graph-node -- curl -I https://ipfs.console.settlemint.com

# Check subgraph manifest
curl https://ipfs.console.settlemint.com/ipfs/QmbA53S3UUeoxdNQV9PGUDN7WAgFcHT6qU9FiH8QXXGv3z
```

#### 2. Slow Indexing Performance
```bash
# Check resource utilization
kubectl top pod -l app.kubernetes.io/name=graph-node

# Monitor database connections
kubectl exec -it deployment/postgresql -- psql -U thegraph -d thegraph \
  -c "SELECT count(*) FROM pg_stat_activity WHERE datname = 'thegraph';"

# Check block processing rate
curl http://graph-node:8040/metrics | grep "graph_block_processing_duration"
```

#### 3. Query Timeouts
```bash
# Check query performance
kubectl logs -l app.kubernetes.io/name=graph-node | grep "slow query"

# Monitor query metrics
curl http://graph-node:8040/metrics | grep "graph_query_"
```

#### 4. Database Connection Issues
```bash
# Test PostgreSQL connectivity
kubectl exec -it deployment/graph-node -- \
  pg_isready -h postgresql -p 5432 -U thegraph

# Check connection pool status
kubectl logs -l app.kubernetes.io/name=graph-node | grep "connection pool"
```

### Performance Optimization

#### Database Tuning
```sql
-- Optimize PostgreSQL for Graph Node
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET work_mem = '4MB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;
ALTER SYSTEM SET random_page_cost = 1.1;
ALTER SYSTEM SET effective_io_concurrency = 200;
```

#### Indexing Performance
```yaml
env:
  # Increase batch size for faster processing
  GRAPH_ETHEREUM_BLOCK_BATCH_SIZE: "200"
  GRAPH_ETHEREUM_MAX_BLOCK_RANGE_SIZE: "2000"
  
  # Optimize parallel processing
  GRAPH_ETHEREUM_MAX_CONCURRENT_JSON_RPC_CALLS: "200"
  GRAPH_PARALLEL_BLOCK_CONSTRAINTS: "true"
  
  # Reduce memory usage
  GRAPH_QUERY_CACHE_MAX_MEM: "3000"
  GRAPH_LOAD_BIN_SIZE: "10"
```

## Integration with ATK Components

### Data Flow
1. **Smart Contracts** emit events on the blockchain
2. **Graph Node** detects and processes these events
3. **Subgraph** transforms events into queryable entities
4. **DApp Frontend** queries data via GraphQL
5. **Hasura** can federate with Graph Node for complex queries

### Query Examples for ATK
```graphql
# Get all tokens for an investor
query InvestorTokens($investor: String!) {
  tokenBalances(
    where: { owner: $investor, balance_gt: "0" }
  ) {
    token {
      id
      name
      symbol
    }
    balance
    frozen
  }
}

# Monitor compliance events
subscription ComplianceUpdates($token: String!) {
  complianceEvents(
    where: { token: $token }
    orderBy: timestamp
    orderDirection: desc
    first: 50
  ) {
    id
    eventType
    investor
    amount
    timestamp
    transaction {
      hash
      blockNumber
    }
  }
}
```

## Maintainers

| Name | Email | Url |
| ---- | ------ | --- |
| SettleMint | <support@settlemint.com> | <https://settlemint.com> |

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| autoscaling.enabled | bool | `false` |  |
| autoscaling.maxReplicas | int | `100` |  |
| autoscaling.minReplicas | int | `1` |  |
| autoscaling.targetCPUUtilizationPercentage | int | `80` |  |
| chains | object | `{"settlemint":{"enabled":true,"provider":[{"details":{"features":["archive","traces"],"type":"web3","url":"http://erpc:4000"},"label":"erpc"}],"shard":"primary"}}` | Blockchain configuration for Graph Node |
| chains.settlemint | object | `{"enabled":true,"provider":[{"details":{"features":["archive","traces"],"type":"web3","url":"http://erpc:4000"},"label":"erpc"}],"shard":"primary"}` | Ethereum Mainnet |
| chains.settlemint.enabled | bool | `true` | Enable this configuring graph-node with this chain |
| chains.settlemint.provider[0].details.features | list | `["archive","traces"]` | Data capabilities this node has |
| chains.settlemint.provider[0].details.type | string | `"web3"` | Type of Provider: web3 |
| chains.settlemint.provider[0].details.url | string | `"http://erpc:4000"` | URL for JSON-RPC endpoint |
| chains.settlemint.provider[0].label | string | `"erpc"` | Label for a JSON-RPC endpoint |
| chains.settlemint.shard | string | `"primary"` | The database shard to use for this chain |
| configTemplate | string | See default template in [values.yaml](values.yaml) | [Configuration for graph-node](https://github.com/graphprotocol/graph-node/blob/master/docs/config.md) |
| customSecret | object | `{"PGPASSWORD":"atk","PGUSER":"thegraph"}` | Custom secret data for PostgreSQL credentials Used for backward compatibility and default values |
| customSecret.PGPASSWORD | string | `"atk"` | PostgreSQL password |
| customSecret.PGUSER | string | `"thegraph"` | PostgreSQL username |
| env | object | `{"ETHEREUM_POLLING_INTERVAL":"1000","EXPERIMENTAL_SUBGRAPH_VERSION_SWITCHING_MODE":"synced","GRAPH_ALLOW_NON_DETERMINISTIC_FULLTEXT_SEARCH":"true","GRAPH_ALLOW_NON_DETERMINISTIC_IPFS":"true","GRAPH_CHAIN_HEAD_WATCHER_TIMEOUT":"5","GRAPH_DISABLE_GRAFTS":"false","GRAPH_ENABLE_PROMETHEUS_METRICS":"true","GRAPH_ETHEREUM_BLOCK_BATCH_SIZE":"100","GRAPH_ETHEREUM_BLOCK_INGESTOR_MAX_CONCURRENT_JSON_RPC_CALLS":"100","GRAPH_ETHEREUM_CLEANUP_BLOCKS":"true","GRAPH_ETHEREUM_MAX_BLOCK_RANGE_SIZE":"1000","GRAPH_ETHEREUM_REQUEST_RETRIES":"10","GRAPH_ETHEREUM_TARGET_TRIGGERS_PER_BLOCK_RANGE":"100","GRAPH_ETH_CALL_GAS":"50000000","GRAPH_GETH_ETH_CALL_ERRORS":"out of gas","GRAPH_IPFS_TIMEOUT":"30","GRAPH_KILL_IF_UNRESPONSIVE":"true","GRAPH_LOAD_BIN_SIZE":"10","GRAPH_LOAD_WINDOW_SIZE":"3600","GRAPH_LOG":"info","GRAPH_LOG_QUERY_TIMING":"gql","GRAPH_MAX_GAS_PER_HANDLER":"1_000_000_000_000_000","GRAPH_MAX_SPEC_VERSION":"1.2.0","GRAPH_PARALLEL_BLOCK_CONSTRAINTS":"true","GRAPH_POSTPONE_ATTRIBUTE_INDEX_CREATION":"true","GRAPH_PROMETHEUS_HOST":"0.0.0.0","GRAPH_QUERY_CACHE_BLOCKS":"6","GRAPH_QUERY_CACHE_MAX_MEM":"3000","GRAPH_QUERY_CACHE_STALE_PERIOD":"1000","GRAPH_STATIC_FILTERS_THRESHOLD":"10000","GRAPH_STORE_WRITE_BATCH_DURATION":"0","GRAPH_STORE_WRITE_BATCH_SIZE":"0","IPFS":"https://ipfs.console.settlemint.com","PRIMARY_SUBGRAPH_DATA_PGDATABASE":"thegraph","PRIMARY_SUBGRAPH_DATA_PGHOST":"postgresql","PRIMARY_SUBGRAPH_DATA_PGPORT":5432,"SUBGRAPH":"kit:QmbA53S3UUeoxdNQV9PGUDN7WAgFcHT6qU9FiH8QXXGv3z","node_role":"combined"}` | Environment variables |
| env.IPFS | string | `"https://ipfs.console.settlemint.com"` | The URL for your IPFS node |
| env.PRIMARY_SUBGRAPH_DATA_PGDATABASE | string | `"thegraph"` | Name of the primary shard database to use |
| env.PRIMARY_SUBGRAPH_DATA_PGHOST | string | `"postgresql"` | Hostname of the primary shard PostgreSQL server |
| env.PRIMARY_SUBGRAPH_DATA_PGPORT | int | `5432` | Port for the primary shard PostgreSQL server |
| env.node_role | string | `"combined"` | Node role |
| extraContainers | list | `[]` |  |
| extraInitContainers | list | `[]` |  |
| extraVolumeMounts | list | `[]` |  |
| extraVolumes | list | `[]` |  |
| fullnameOverride | string | `"graph-node"` | Override the full resource name. Set to "graph-node" for backward compatibility with existing ATK deployments that reference "graph-node-combined" service name |
| global.labels | object | `{}` |  |
| image.pullPolicy | string | `"IfNotPresent"` |  |
| image.repository | string | `"graphprotocol/graph-node"` | Image for Graph Node |
| image.tag | string | Chart.appVersion | Overrides the image tag |
| imagePullSecrets | list | `[]` | Pull secrets required to fetch the Image |
| ingress.annotations."nginx.ingress.kubernetes.io/rewrite-target" | string | `"/$1"` |  |
| ingress.annotations."nginx.ingress.kubernetes.io/use-regex" | string | `"true"` |  |
| ingress.className | string | `"atk-nginx"` |  |
| ingress.enabled | bool | `true` |  |
| ingress.hosts[0].host | string | `"graph.k8s.orb.local"` |  |
| ingress.hosts[0].paths[0].path | string | `"/(.*)"` |  |
| ingress.hosts[0].paths[0].pathType | string | `"ImplementationSpecific"` |  |
| ingress.hosts[0].paths[1].path | string | `"/ws/?(.*)"` |  |
| ingress.hosts[0].paths[1].pathType | string | `"ImplementationSpecific"` |  |
| ingress.hosts[0].paths[2].path | string | `"/admin/?(.*)"` |  |
| ingress.hosts[0].paths[2].pathType | string | `"ImplementationSpecific"` |  |
| ingress.hosts[0].paths[3].path | string | `"/indexer/?(.*)"` |  |
| ingress.hosts[0].paths[3].pathType | string | `"ImplementationSpecific"` |  |
| ingress.hosts[0].paths[4].path | string | `"/graphman/?(.*)"` |  |
| ingress.hosts[0].paths[4].pathType | string | `"ImplementationSpecific"` |  |
| ingress.tls | list | `[]` |  |
| initContainer.image | object | `{"pullPolicy":"IfNotPresent","repository":"docker.io/kubesphere/kubectl","tag":"v1.33.1"}` | Image for init container kubectl |
| nameOverride | string | `""` |  |
| networkPolicy.egress | list | `[]` |  |
| networkPolicy.enabled | bool | `false` |  |
| networkPolicy.ingress | list | `[]` |  |
| nodeSelector | object | `{}` | Specify a [node selector](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/) |
| podAnnotations | object | `{}` | Annotations for the `Pod` |
| podDisruptionBudget.enabled | bool | `false` |  |
| podSecurityContext | object | `{"fsGroup":101337,"runAsGroup":101337,"runAsNonRoot":true,"runAsUser":101337}` | Pod-wide security context |
| postgresReadinessCheck.enabled | bool | `true` | Enable PostgreSQL readiness check init container |
| postgresReadinessCheck.image | string | `"docker.io/postgres:17.5"` | Docker image for PostgreSQL readiness check |
| postgresReadinessCheck.initialWaitTime | int | `2` | Initial wait time between retries (doubles with exponential backoff) |
| postgresReadinessCheck.maxRetries | int | `30` | Maximum number of connection retries |
| postgresReadinessCheck.maxWaitTime | int | `30` | Maximum wait time between retries |
| postgresReadinessCheck.randomDelayRange | object | `{"max":30,"min":5}` | Add random delay to prevent all nodes from connecting simultaneously |
| rbac.create | bool | `false` | Specifies whether RBAC resources are to be created |
| rbac.rules | list | `[]` |  |
| replicaCount | int | `1` |  |
| resources | object | `{}` | Specify [resource requests and limits](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/#requests-and-limits) |
| secretEnv | object | `{"PRIMARY_SUBGRAPH_DATA_PGPASSWORD":{"key":"PGPASSWORD","secretName":""},"PRIMARY_SUBGRAPH_DATA_PGUSER":{"key":"PGUSER","secretName":""}}` | Environment variables from secrets |
| secretEnv.PRIMARY_SUBGRAPH_DATA_PGPASSWORD.key | string | `"PGPASSWORD"` | Name of the data key in the secret that contains your PG password |
| secretEnv.PRIMARY_SUBGRAPH_DATA_PGPASSWORD.secretName | string | `""` | Name of the secret that contains your PG password (uses graph-node.pgSecretName helper) |
| secretEnv.PRIMARY_SUBGRAPH_DATA_PGUSER.key | string | `"PGUSER"` | Name of the data key in the secret that contains your PG username |
| secretEnv.PRIMARY_SUBGRAPH_DATA_PGUSER.secretName | string | `""` | Name of the secret that contains your PG username (uses graph-node.pgSecretName helper) |
| service.ports.httpAdmin | int | `8020` | Service Port to expose Graph Node Admin endpoint on |
| service.ports.httpMetrics | int | `8040` | Service Port to expose Graph Node Metrics endpoint on |
| service.ports.httpQuery | int | `8000` | Service Port to expose Graph Node Query endpoint on |
| service.ports.httpQueryws | int | `8001` | Service Port to expose Graph Node Websocket Query endpoint on |
| service.ports.httpStatus | int | `8030` | Service Port to expose Graph Node Status endpoint on |
| service.type | string | `"ClusterIP"` |  |
| serviceAccount.annotations | object | `{}` | Annotations to add to the service account |
| serviceAccount.create | bool | `true` | Specifies whether a service account should be created |
| serviceAccount.name | string | `""` | The name of the service account to use. If not set and create is true, a name is generated using the fullname template |
| store | object | `{"primary":{"connection":"postgresql://${PRIMARY_SUBGRAPH_DATA_PGUSER}:${PRIMARY_SUBGRAPH_DATA_PGPASSWORD}@${PRIMARY_SUBGRAPH_DATA_PGHOST}:${PRIMARY_SUBGRAPH_DATA_PGPORT}/${PRIMARY_SUBGRAPH_DATA_PGDATABASE}","enabled":true}}` | Store configuration for Graph Node |
| store.primary.connection | string | `"postgresql://${PRIMARY_SUBGRAPH_DATA_PGUSER}:${PRIMARY_SUBGRAPH_DATA_PGPASSWORD}@${PRIMARY_SUBGRAPH_DATA_PGHOST}:${PRIMARY_SUBGRAPH_DATA_PGPORT}/${PRIMARY_SUBGRAPH_DATA_PGDATABASE}"` | PostgreSQL connection string for primary shard |
| store.primary.enabled | bool | `true` | Enable this store for Graph Node |
| terminationGracePeriodSeconds | int | `60` |  |
| tolerations | list | `[]` | Specify [tolerations](https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/) |

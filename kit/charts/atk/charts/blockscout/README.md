# Blockscout Explorer

![Version: 0.1.0](https://img.shields.io/badge/Version-0.1.0-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: 0.1.0](https://img.shields.io/badge/AppVersion-0.1.0-informational?style=flat-square)

A Helm chart for deploying Blockscout - a comprehensive blockchain explorer and analytics platform for the Asset Tokenization Kit's private Besu network.

## Overview

Blockscout is an open-source blockchain explorer that provides a web interface for exploring and analyzing blockchain data. This chart deploys a complete Blockscout stack optimized for ERC-3643 security tokens and asset tokenization use cases on private networks.

## Key Features

- **Comprehensive Explorer**: Browse blocks, transactions, addresses, and smart contracts
- **Token Support**: Native support for ERC-20, ERC-721, ERC-1155, and ERC-3643 tokens
- **Smart Contract Verification**: Upload and verify contract source code
- **API Access**: RESTful and GraphQL APIs for programmatic access
- **Real-time Updates**: Live updates of blockchain data via WebSockets
- **Analytics Dashboard**: Transaction statistics and network health metrics
- **Multi-Language Support**: Internationalization support for global deployments

## Architecture

Blockscout consists of two main components:

### Backend (Elixir/Phoenix)
- **Purpose**: Indexes blockchain data and provides APIs
- **Technology**: Elixir Phoenix framework
- **Database**: PostgreSQL for indexed data storage
- **Indexing**: Real-time blockchain data indexing from Besu nodes
- **APIs**: REST and GraphQL endpoints

### Frontend (Next.js)
- **Purpose**: User-facing web interface
- **Technology**: Next.js React framework
- **Features**: Responsive design, dark/light themes, search functionality
- **Customization**: Branded for Asset Tokenization Kit

## Integration Points

Blockscout integrates seamlessly with other ATK components:

- **Besu Network**: Connects via eRPC proxy for blockchain data
- **PostgreSQL**: Shares database infrastructure with other services
- **eRPC**: Uses load-balanced RPC endpoints for optimal performance
- **Monitoring**: Provides Prometheus metrics for observability

## Configuration Examples

### Basic Configuration
```yaml
blockscout-stack:
  blockscout:
    replicaCount: 1
    resources:
      requests:
        cpu: 500m
        memory: 1Gi
      limits:
        cpu: 2000m
        memory: 4Gi
```

### High Availability Setup
```yaml
blockscout-stack:
  blockscout:
    replicaCount: 2
    env:
      POOL_SIZE: "10"
      POOL_SIZE_API: "10"
      QUEUE_TARGET: "10000"
  frontend:
    replicaCount: 2
```

### Custom Network Configuration
```yaml
blockscout-stack:
  config:
    network:
      name: "My Private Network"
      shortname: "MPN"
      id: 1337
      currency:
        name: "Custom Token"
        symbol: "CTK"
        decimals: 18
```

### Database Optimization
```yaml
blockscout-stack:
  blockscout:
    env:
      POOL_SIZE: "20"
      POOL_MAX_OVERFLOW: "80"
      DATABASE_TIMEOUT: "120000"
      ECTO_ADAPTER_TIMEOUT: "120000"
```

## Features & Capabilities

### Token Analysis
- **ERC-3643 Compliance**: Full support for security token standards
- **Token Holders**: Track token distribution and holder analytics
- **Transfer History**: Complete token transfer audit trails
- **Compliance Events**: Monitor regulatory compliance events

### Smart Contract Features
- **Source Verification**: Upload and verify contract source code
- **ABI Interface**: Interact with contracts directly through the UI
- **Event Logs**: View and filter contract event emissions
- **Internal Transactions**: Track internal contract calls

### Search & Navigation
- **Universal Search**: Search by address, transaction hash, block number, or token
- **Advanced Filters**: Filter transactions by type, status, method
- **Bookmarking**: Save frequently accessed addresses and contracts
- **Export Data**: Export transaction and token data to CSV

### Analytics & Metrics
- **Network Statistics**: Block time, transaction throughput, gas usage
- **Token Metrics**: Supply, transfers, holder distribution
- **Address Analytics**: Balance history, transaction patterns
- **Market Data**: Token prices and market cap (when enabled)

## Security & Performance

### Security Features
- **Input Validation**: All user inputs sanitized and validated
- **Rate Limiting**: API rate limiting to prevent abuse
- **SSL/TLS**: HTTPS encryption for all web traffic
- **CORS Protection**: Configurable CORS policies

### Performance Optimization
- **Database Indexing**: Optimized database queries with proper indexing
- **Caching**: Redis caching for frequently accessed data
- **Connection Pooling**: Efficient database connection management
- **CDN Support**: Static asset delivery via CDN

## Monitoring & Observability

### Metrics Available
- Indexing performance and lag
- Database query performance
- API response times
- User activity and page views
- Error rates and exceptions

### Health Checks
- Database connectivity
- RPC endpoint availability
- Indexing synchronization status
- Web service responsiveness

## Troubleshooting

### Common Issues

**Indexing Lag**
```bash
# Check indexer status
kubectl logs -n atk blockscout-backend-0 | grep "Indexed"

# Monitor database performance
kubectl exec -n atk postgresql-0 -- psql -U blockscout -c "SELECT * FROM pg_stat_activity;"
```

**Database Connection Issues**
```bash
# Check database connectivity
kubectl exec -n atk blockscout-backend-0 -- nc -zv postgresql 5432

# Review connection pool settings
kubectl logs -n atk blockscout-backend-0 | grep "pool"
```

**Frontend Not Loading**
```bash
# Check frontend service
kubectl get svc -n atk blockscout-frontend-svc

# Check ingress configuration
kubectl get ingress -n atk blockscout-frontend
```

### Performance Tuning

**High Transaction Volume**
- Increase indexer workers and batch sizes
- Optimize database connection pools
- Enable database read replicas

**Large Blockchain State**
- Increase memory allocation for indexing
- Configure database partitioning
- Enable data archiving for old blocks

**Slow UI Response**
- Enable Redis caching
- Optimize database queries
- Configure CDN for static assets

## Customization

### Branding
- Custom logos and color schemes
- White-label deployment options
- Custom footer and header content
- Multi-language support

### Feature Toggles
- Enable/disable specific features
- Configure analytics providers
- Set up custom notification systems
- Integration with external services

## Maintainers

| Name | Email | Url |
| ---- | ------ | --- |
| SettleMint | <support@settlemint.com> | <https://settlemint.com> |

## Requirements

| Repository | Name | Version |
|------------|------|---------|
| https://blockscout.github.io/helm-charts | blockscout-stack | 3.3.0 |

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| blockscout-stack.blockscout.env.ADMIN_PANEL_ENABLED | string | `"true"` |  |
| blockscout-stack.blockscout.env.API_GRAPHQL_MAX_COMPLEXITY | string | `"1000"` |  |
| blockscout-stack.blockscout.env.API_URL | string | `"https://explorer.k8s.orb.local"` |  |
| blockscout-stack.blockscout.env.BLOCKSCOUT_PROTOCOL | string | `"https"` |  |
| blockscout-stack.blockscout.env.DATABASE_TIMEOUT | string | `"60000"` |  |
| blockscout-stack.blockscout.env.DISABLE_EXCHANGE_RATES | string | `"true"` |  |
| blockscout-stack.blockscout.env.ECTO_ADAPTER_TIMEOUT | string | `"60000"` |  |
| blockscout-stack.blockscout.env.ECTO_USE_SSL | string | `"false"` |  |
| blockscout-stack.blockscout.env.EMISSION_FORMAT | string | `"DEFAULT"` |  |
| blockscout-stack.blockscout.env.ETHEREUM_JSONRPC_HTTP_GZIP_ENABLED | string | `"true"` |  |
| blockscout-stack.blockscout.env.ETHEREUM_JSONRPC_HTTP_INSECURE | string | `"true"` |  |
| blockscout-stack.blockscout.env.ETHEREUM_JSONRPC_VARIANT | string | `"besu"` |  |
| blockscout-stack.blockscout.env.FETCH_REWARDS_WAY | string | `"trace_block"` |  |
| blockscout-stack.blockscout.env.INDEXER_DISABLE_INTERNAL_TRANSACTIONS_FETCHER | string | `"false"` |  |
| blockscout-stack.blockscout.env.INDEXER_TOKEN_INSTANCE_RETRY_MAX_REFETCH_INTERVAL | string | `"1h"` |  |
| blockscout-stack.blockscout.env.INDEXER_TOKEN_INSTANCE_USE_BASE_URI_RETRY | string | `"true"` |  |
| blockscout-stack.blockscout.env.IPFS_GATEWAY_URL | string | `"https://ipfs.io/ipfs"` |  |
| blockscout-stack.blockscout.env.IPFS_PUBLIC_GATEWAY_URL | string | `"https://ipfs.io/ipfs"` |  |
| blockscout-stack.blockscout.env.MIX_ENV | string | `"prod"` |  |
| blockscout-stack.blockscout.env.NETWORK | string | `"mainnet"` |  |
| blockscout-stack.blockscout.env.OTHER_EXPLORERS | string | `"{}"` |  |
| blockscout-stack.blockscout.env.POOL_MAX_OVERFLOW | string | `"40"` |  |
| blockscout-stack.blockscout.env.POOL_SIZE | string | `"5"` |  |
| blockscout-stack.blockscout.env.POOL_SIZE_API | string | `"5"` |  |
| blockscout-stack.blockscout.env.POOL_TIMEOUT | string | `"30000"` |  |
| blockscout-stack.blockscout.env.QUEUE_INTERVAL | string | `"1000"` |  |
| blockscout-stack.blockscout.env.QUEUE_TARGET | string | `"5000"` |  |
| blockscout-stack.blockscout.env.SHOW_TXS_CHART | string | `"true"` |  |
| blockscout-stack.blockscout.env.SUBNETWORK | string | `"ATK"` |  |
| blockscout-stack.blockscout.env.SUPPORTED_CHAINS | string | `"{}"` |  |
| blockscout-stack.blockscout.env.TXS_STATS_ENABLED | string | `"true"` |  |
| blockscout-stack.blockscout.env.WEBAPP_URL | string | `"https://explorer.k8s.orb.local"` |  |
| blockscout-stack.blockscout.envFromSecret.DATABASE_URL | string | `"postgresql://blockscout:atk@postgresql:5432/blockscout?sslmode=disable"` |  |
| blockscout-stack.blockscout.envFromSecret.ETHEREUM_JSONRPC_HTTP_URL | string | `"http://erpc:4000"` |  |
| blockscout-stack.blockscout.envFromSecret.ETHEREUM_JSONRPC_TRACE_URL | string | `"http://erpc:4000"` |  |
| blockscout-stack.blockscout.envFromSecret.SECRET_KEY_BASE | string | `"atk"` |  |
| blockscout-stack.blockscout.image.repository | string | `"ghcr.io/blockscout/blockscout"` |  |
| blockscout-stack.blockscout.image.tag | string | `"8.1.2"` |  |
| blockscout-stack.blockscout.ingress.className | string | `"atk-nginx"` |  |
| blockscout-stack.blockscout.ingress.enabled | bool | `true` |  |
| blockscout-stack.blockscout.ingress.hostname | string | `"explorer.k8s.orb.local"` |  |
| blockscout-stack.blockscout.podAnnotations."prometheus.io/path" | string | `"/metrics"` |  |
| blockscout-stack.blockscout.podAnnotations."prometheus.io/port" | string | `"4000"` |  |
| blockscout-stack.blockscout.podAnnotations."prometheus.io/scrape" | string | `"true"` |  |
| blockscout-stack.blockscout.replicaCount | int | `1` |  |
| blockscout-stack.blockscout.resources | object | `{}` |  |
| blockscout-stack.config.network.currency.decimals | int | `18` |  |
| blockscout-stack.config.network.currency.name | string | `"Native Token"` |  |
| blockscout-stack.config.network.currency.symbol | string | `"NT"` |  |
| blockscout-stack.config.network.id | int | `53771311147` |  |
| blockscout-stack.config.network.name | string | `"Asset Tokenization Kit"` |  |
| blockscout-stack.config.network.shortname | string | `"ATK"` |  |
| blockscout-stack.config.prometheus.blackbox.enabled | bool | `false` |  |
| blockscout-stack.config.prometheus.enabled | bool | `false` |  |
| blockscout-stack.frontend.env.NEXT_PUBLIC_AD_BANNER_PROVIDER | string | `"none"` |  |
| blockscout-stack.frontend.env.NEXT_PUBLIC_AD_TEXT_PROVIDER | string | `"none"` |  |
| blockscout-stack.frontend.env.NEXT_PUBLIC_FONT_FAMILY_BODY | string | `"{'name':'Figtree','url':'https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,300..900;1,300..900&display=swap'}"` |  |
| blockscout-stack.frontend.env.NEXT_PUBLIC_FONT_FAMILY_HEADING | string | `"{'name':'Figtree','url':'https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,300..900;1,300..900&display=swap'}"` |  |
| blockscout-stack.frontend.env.NEXT_PUBLIC_HAS_BEACON_CHAIN | string | `"false"` |  |
| blockscout-stack.frontend.env.NEXT_PUBLIC_HAS_CONTRACT_AUDIT_REPORTS | string | `"true"` |  |
| blockscout-stack.frontend.env.NEXT_PUBLIC_HOMEPAGE_CHARTS | string | `"[\"daily_txs\"]"` |  |
| blockscout-stack.frontend.env.NEXT_PUBLIC_HOMEPAGE_STATS | string | `"[\"total_blocks\",\"average_block_time\",\"total_txs\",\"wallet_addresses\",\"gas_tracker\"]"` |  |
| blockscout-stack.frontend.env.NEXT_PUBLIC_IS_ACCOUNT_SUPPORTED | string | `"false"` |  |
| blockscout-stack.frontend.env.NEXT_PUBLIC_IS_TESTNET | string | `"false"` |  |
| blockscout-stack.frontend.env.NEXT_PUBLIC_OG_ENHANCED_DATA_ENABLED | string | `"true"` |  |
| blockscout-stack.frontend.env.NEXT_PUBLIC_PROMOTE_BLOCKSCOUT_IN_TITLE | string | `"false"` |  |
| blockscout-stack.frontend.env.NEXT_PUBLIC_SEO_ENHANCED_DATA_ENABLED | string | `"true"` |  |
| blockscout-stack.frontend.env.NEXT_PUBLIC_TRANSACTION_INTERPRETATION_PROVIDER | string | `"blockscout"` |  |
| blockscout-stack.frontend.image.repository | string | `"ghcr.io/blockscout/frontend"` |  |
| blockscout-stack.frontend.image.tag | string | `"v2.2.1"` |  |
| blockscout-stack.frontend.ingress.className | string | `"atk-nginx"` |  |
| blockscout-stack.frontend.ingress.enabled | bool | `true` |  |
| blockscout-stack.frontend.ingress.hostname | string | `"explorer.k8s.orb.local"` |  |
| blockscout-stack.frontend.replicaCount | int | `1` |  |
| blockscout-stack.fullnameOverride | string | `"blockscout"` |  |
| blockscout-stack.imagePullSecrets | list | `[]` |  |

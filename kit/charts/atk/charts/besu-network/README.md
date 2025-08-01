# Besu Network

![Version: 0.1.0](https://img.shields.io/badge/Version-0.1.0-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: 0.1.0](https://img.shields.io/badge/AppVersion-0.1.0-informational?style=flat-square)

A Helm chart for deploying a private Hyperledger Besu blockchain network optimized for asset tokenization and ERC-3643 compliance.

## Overview

The Besu Network chart deploys a complete private blockchain network using Hyperledger Besu, an enterprise-grade Ethereum client. This network is specifically configured for asset tokenization use cases, providing a secure, scalable, and compliant blockchain infrastructure.

## Key Features

- **Private Network**: Fully controlled blockchain network with permissioned access
- **QBFT Consensus**: Byzantine fault-tolerant consensus mechanism for enterprise use
- **Multiple Node Types**: Separate validator and RPC nodes for optimal performance
- **ERC-3643 Ready**: Pre-configured for security token compliance
- **High Availability**: Support for multiple validators and RPC endpoints
- **Observability**: Built-in metrics and monitoring integration

## Architecture

The network consists of two types of nodes:

### Validator Nodes
- **Purpose**: Participate in consensus and validate transactions
- **Default**: 1 validator (expandable to 4)
- **Configuration**: Mining enabled, peer discovery restricted
- **Storage**: Persistent volumes for blockchain data

### RPC Nodes  
- **Purpose**: Serve JSON-RPC API requests from applications
- **Default**: 1 RPC node (expandable to 2)
- **Configuration**: Mining disabled, public API endpoints
- **Load Balancing**: Can be load-balanced for high availability

## Network Configuration

### Consensus Mechanism
- **Algorithm**: QBFT (Quorum Byzantine Fault Tolerance)
- **Block Time**: Configurable (default: 5 seconds)
- **Finality**: Immediate finality after consensus
- **Validators**: Dynamic validator set management

### Genesis Configuration
- **Chain ID**: 1337 (configurable)
- **Initial Accounts**: Pre-funded accounts for testing
- **Gas Limits**: Optimized for tokenization transactions
- **Precompiles**: EVM precompiled contracts enabled

## Deployment Patterns

### Single Node (Development)
```yaml
besu-validator-1:
  enabled: true
besu-rpc-1:
  enabled: true
besu-validator-2:
  enabled: false
```

### Multi-Validator (Production)
```yaml
besu-validator-1:
  enabled: true
besu-validator-2:
  enabled: true
besu-validator-3:
  enabled: true
besu-validator-4:
  enabled: true
besu-rpc-1:
  enabled: true
besu-rpc-2:
  enabled: true
```

## Security Features

- **Permissioned Network**: Only authorized nodes can join
- **Account Management**: Secure key management with password protection
- **Network Isolation**: Kubernetes network policies supported
- **TLS Support**: Encrypted communication between nodes
- **Resource Limits**: Configurable CPU and memory limits

## Integration Points

The Besu network integrates with other ATK components:

- **eRPC**: Provides load-balanced RPC access
- **Graph Node**: Indexes blockchain events and transactions
- **Blockscout**: Explores blocks and transactions
- **Portal/Hasura**: Query blockchain data via GraphQL
- **TxSigner**: Signs and submits transactions

## Configuration Examples

### Scaling Validators
```yaml
besu-validator-1:
  enabled: true
  resources:
    requests:
      cpu: 500m
      memory: 1Gi
    limits:
      cpu: 2000m
      memory: 4Gi

besu-validator-2:
  enabled: true
  # Inherits same resource configuration
```

### Custom Genesis
```yaml
rawGenesisConfig:
  blockchain:
    nodes:
      count: 4
  config:
    chainId: 1337
    constantinopleFixBlock: 0
    qbft:
      blockperiodseconds: 5
      epochlength: 30000
```

### Storage Configuration
```yaml
besu-validator-1:
  storage:
    pvcSizeLimit: "20Gi"
    sizeLimit: "20Gi"
    storageClass: "fast-ssd"
```

## Monitoring & Observability

### Metrics
- Block production rates
- Transaction throughput
- Peer connectivity
- Resource utilization

### Health Checks
- Node synchronization status
- Consensus participation
- RPC endpoint availability
- Storage capacity

## Troubleshooting

### Common Issues

**Node Sync Problems**
```bash
kubectl logs -n atk besu-node-validator-1-0
# Check for peer discovery issues
```

**Genesis Mismatch**
```bash
kubectl delete job -n atk besu-genesis-init
# Regenerate genesis configuration
```

**Storage Issues**
```bash
kubectl get pvc -n atk
# Check persistent volume claims
```

### Performance Tuning

**High Transaction Volume**
- Increase block gas limit
- Optimize RPC node resources
- Enable transaction pool monitoring

**Large State Size**
- Increase storage allocation
- Consider state pruning options
- Monitor disk I/O performance

## Maintainers

| Name | Email | Url |
| ---- | ------ | --- |
| SettleMint | <support@settlemint.com> | <https://settlemint.com> |

## Requirements

| Repository | Name | Version |
|------------|------|---------|
|  | besu-genesis | * |
|  | besu-validator-1(besu-node) | * |
|  | besu-validator-2(besu-node) | * |
|  | besu-validator-3(besu-node) | * |
|  | besu-validator-4(besu-node) | * |
|  | besu-rpc-1(besu-node) | * |
|  | besu-rpc-2(besu-node) | * |

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| besu-rpc-1.enabled | bool | `true` |  |
| besu-rpc-1.fullnameOverride | string | `"besu-node-rpc-1"` |  |
| besu-rpc-1.node.besu.account.password | string | `"password"` |  |
| besu-rpc-2.enabled | bool | `false` |  |
| besu-rpc-2.fullnameOverride | string | `"besu-node-rpc-2"` |  |
| besu-rpc-2.node.besu.account.password | string | `"password"` |  |
| besu-validator-1.enabled | bool | `true` |  |
| besu-validator-1.fullnameOverride | string | `"besu-node-validator-1"` |  |
| besu-validator-2.enabled | bool | `false` |  |
| besu-validator-2.fullnameOverride | string | `"besu-node-validator-2"` |  |
| besu-validator-3.enabled | bool | `false` |  |
| besu-validator-3.fullnameOverride | string | `"besu-node-validator-3"` |  |
| besu-validator-4.enabled | bool | `false` |  |
| besu-validator-4.fullnameOverride | string | `"besu-node-validator-4"` |  |

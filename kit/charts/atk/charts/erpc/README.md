## Introduction

[eRPC](https://erpc.cloud/) is a fault-tolerant EVM (Ethereum Virtual Machine) RPC proxy and permanent caching solution designed for high-load scenarios like data indexing and frontend usage.

### Key Features

- **Automatic routing** between multiple upstream providers
- **Intelligent caching** to reduce load on blockchain nodes
- **Built-in monitoring** and tracing capabilities
- **Fault tolerance** with automatic failover
- **Rate limit handling** across multiple providers

### Benefits

- Improves performance from 5 RPS to 500 RPS
- Handles rate limits and provider failures automatically
- Provides a resilient infrastructure for blockchain data access
- Reduces costs by caching repeated requests

### Use Cases

- Web3 indexers
- Blockchain services
- High-traffic decentralized applications
- Data analytics platforms

## Maintainers

| Name | Email | Url |
| ---- | ------ | --- |
| SettleMint | <support@settlemint.com> | <https://settlemint.com> |
| eRPC Community |  | <https://github.com/erpc/erpc> |

## Source Code

* <https://github.com/erpc/erpc>
* <https://github.com/settlemint/starterkit-asset-tokenization>

## Requirements

Kubernetes: `>=1.21.0-0`

## Prerequisites

- Kubernetes 1.19+
- Helm 3.2.0+
- PV provisioner support in the underlying infrastructure (if persistence is enabled)
- Redis instance reachable from the cluster (defaults target the bundled `support.redis` release)

## Connection Requirements

Configure Redis connectivity via the `global.datastores.erpc.redis` section (or override per-chart with `redis`).

| Purpose | Values path | Default |
| --- | --- | --- |
| Cache connector | `global.datastores.erpc.redis.cacheDb` | `redis://default:atk@redis:6379/0` |
| Shared state connector | `global.datastores.erpc.redis.sharedStateDb` | `redis://default:atk@redis:6379/1` |

Update the host, port, credentials, and database numbers to match your external Redis deployment.

## Installing the Chart

To install the chart with the release name `my-release`:

```console
helm install my-release .
```

The command deploys eRPC on the Kubernetes cluster in the default configuration. The [Parameters](#parameters) section lists the parameters that can be configured during installation.

> **Tip**: List all releases using `helm list`

## Uninstalling the Chart

To uninstall/delete the `my-release` deployment:

```console
helm delete my-release
```

The command removes all the Kubernetes components associated with the chart and deletes the release.

## Parameters

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| affinity | object | `{}` | Affinity for pod assignment |
| autoscaling | object | `{"builtInMetrics":[{"resource":{"name":"cpu","target":{"averageUtilization":80,"type":"Utilization"}},"type":"Resource"},{"resource":{"name":"memory","target":{"averageUtilization":80,"type":"Utilization"}},"type":"Resource"}],"customMetrics":[],"enabled":false,"maxReplicas":3,"minReplicas":1}` | Autoscaling configuration for eRPC |
| autoscaling.builtInMetrics | list | `[{"resource":{"name":"cpu","target":{"averageUtilization":80,"type":"Utilization"}},"type":"Resource"},{"resource":{"name":"memory","target":{"averageUtilization":80,"type":"Utilization"}},"type":"Resource"}]` | Built-in metrics configuration |
| autoscaling.builtInMetrics[0] | object | `{"resource":{"name":"cpu","target":{"averageUtilization":80,"type":"Utilization"}},"type":"Resource"}` | CPU utilization metric configuration |
| autoscaling.builtInMetrics[0].resource | object | `{"name":"cpu","target":{"averageUtilization":80,"type":"Utilization"}}` | Resource metric configuration |
| autoscaling.builtInMetrics[0].resource.name | string | `"cpu"` | Resource name to monitor |
| autoscaling.builtInMetrics[0].resource.target | object | `{"averageUtilization":80,"type":"Utilization"}` | Target metric configuration |
| autoscaling.builtInMetrics[0].resource.target.averageUtilization | int | `80` | Target average CPU utilization percentage |
| autoscaling.builtInMetrics[0].resource.target.type | string | `"Utilization"` | Target type (Utilization, Value, AverageValue) |
| autoscaling.builtInMetrics[0].type | string | `"Resource"` | Metric type (Resource, Pods, Object, External) |
| autoscaling.builtInMetrics[1] | object | `{"resource":{"name":"memory","target":{"averageUtilization":80,"type":"Utilization"}},"type":"Resource"}` | Memory utilization metric configuration |
| autoscaling.builtInMetrics[1].resource | object | `{"name":"memory","target":{"averageUtilization":80,"type":"Utilization"}}` | Resource metric configuration |
| autoscaling.builtInMetrics[1].resource.name | string | `"memory"` | Resource name to monitor |
| autoscaling.builtInMetrics[1].resource.target | object | `{"averageUtilization":80,"type":"Utilization"}` | Target metric configuration |
| autoscaling.builtInMetrics[1].resource.target.averageUtilization | int | `80` | Target average memory utilization percentage |
| autoscaling.builtInMetrics[1].resource.target.type | string | `"Utilization"` | Target type (Utilization, Value, AverageValue) |
| autoscaling.builtInMetrics[1].type | string | `"Resource"` | Metric type (Resource, Pods, Object, External) |
| autoscaling.customMetrics | list | `[]` | Custom metrics configuration |
| autoscaling.enabled | bool | `false` | Enable autoscaling for eRPC |
| autoscaling.maxReplicas | int | `3` | Maximum number of eRPC replicas |
| autoscaling.minReplicas | int | `1` | Minimum number of eRPC replicas |
| commonAnnotations | object | `{}` | Annotations to add to all deployed objects |
| commonLabels | object | `{}` | Labels to add to all deployed objects |
| config | object | `{"database":{"evmJsonRpcCache":{"compression":{"algorithm":"zstd","enabled":true,"threshold":1024,"zstdLevel":"default"},"connectors":[{"driver":"redis","id":"redis-cache","redis":{"uri":"{{ include \"erpc.redis.uriFor\" (dict \"context\" $ \"dbKey\" \"cacheDb\" \"queryKey\" \"cacheQuery\") }}"}}],"policies":[{"connector":"redis-cache","finality":"finalized","method":"*","network":"*","ttl":0},{"connector":"redis-cache","finality":"unfinalized","method":"*","network":"*","ttl":"5s"},{"connector":"redis-cache","finality":"realtime","method":"*","network":"*","ttl":"5s"}]},"sharedState":{"clusterKey":"atk-erpc-shared","connector":{"driver":"redis","redis":{"uri":"{{ include \"erpc.redis.uriFor\" (dict \"context\" $ \"dbKey\" \"sharedStateDb\" \"queryKey\" \"sharedStateQuery\") }}"}},"fallbackTimeout":"5s","lockTtl":"30s"}},"logLevel":"info","metrics":{"enabled":true,"hostV4":"0.0.0.0","port":4001},"projects":[{"id":"settlemint","networks":[{"architecture":"evm","directiveDefaults":{"retryEmpty":true},"evm":{"integrity":{"enforceGetLogsBlockRange":true,"enforceHighestBlock":true}},"failsafe":[{"hedge":{"maxCount":1,"maxDelay":"4s","minDelay":"200ms","quantile":0.9},"matchMethod":"eth_getLogs","retry":{"backoffFactor":2,"backoffMaxDelay":"10s","delay":"500ms","jitter":"300ms","maxAttempts":3},"timeout":{"duration":"45s"}},{"matchMethod":"trace_*|debug_*|arbtrace_*","retry":{"maxAttempts":1},"timeout":{"duration":"90s"}},{"matchMethod":"eth_getBlock*|eth_getTransaction*","retry":{"backoffFactor":1.5,"backoffMaxDelay":"3s","delay":"200ms","jitter":"150ms","maxAttempts":2},"timeout":{"duration":"6s"}},{"hedge":{"delay":"250ms","maxCount":1},"matchFinality":["unfinalized","realtime"],"matchMethod":"*","retry":{"delay":"150ms","jitter":"150ms","maxAttempts":2},"timeout":{"duration":"4s"}},{"matchFinality":["finalized"],"matchMethod":"*","retry":{"backoffFactor":1.8,"backoffMaxDelay":"8s","delay":"400ms","jitter":"250ms","maxAttempts":4},"timeout":{"duration":"20s"}},{"hedge":{"maxCount":2,"maxDelay":"2s","minDelay":"120ms","quantile":0.95},"matchMethod":"*","retry":{"backoffFactor":1.4,"backoffMaxDelay":"5s","delay":"300ms","jitter":"200ms","maxAttempts":3},"timeout":{"duration":"12s"}}]}],"upstreams":[{"endpoint":"http://besu-node-rpc-0.besu-node-rpc:8545","evm":{},"failsafe":[{"circuitBreaker":{"failureThresholdCapacity":80,"failureThresholdCount":40,"halfOpenAfter":"120s","successThresholdCapacity":10,"successThresholdCount":3},"matchMethod":"*"}],"id":"besu-node-rpc-0"},{"endpoint":"http://besu-node-rpc-1.besu-node-rpc:8545","evm":{},"failsafe":[{"circuitBreaker":{"failureThresholdCapacity":80,"failureThresholdCount":40,"halfOpenAfter":"120s","successThresholdCapacity":10,"successThresholdCount":3},"matchMethod":"*"}],"id":"besu-node-rpc-1"}]}],"server":{"httpHostV4":"0.0.0.0","httpPort":4000,"waitAfterShutdown":"30s","waitBeforeShutdown":"30s"}}` | eRPC configuration |
| config.database | object | `{"evmJsonRpcCache":{"compression":{"algorithm":"zstd","enabled":true,"threshold":1024,"zstdLevel":"default"},"connectors":[{"driver":"redis","id":"redis-cache","redis":{"uri":"{{ include \"erpc.redis.uriFor\" (dict \"context\" $ \"dbKey\" \"cacheDb\" \"queryKey\" \"cacheQuery\") }}"}}],"policies":[{"connector":"redis-cache","finality":"finalized","method":"*","network":"*","ttl":0},{"connector":"redis-cache","finality":"unfinalized","method":"*","network":"*","ttl":"5s"},{"connector":"redis-cache","finality":"realtime","method":"*","network":"*","ttl":"5s"}]},"sharedState":{"clusterKey":"atk-erpc-shared","connector":{"driver":"redis","redis":{"uri":"{{ include \"erpc.redis.uriFor\" (dict \"context\" $ \"dbKey\" \"sharedStateDb\" \"queryKey\" \"sharedStateQuery\") }}"}},"fallbackTimeout":"5s","lockTtl":"30s"}}` | Database configuration for caching and shared state |
| config.database.evmJsonRpcCache | object | `{"compression":{"algorithm":"zstd","enabled":true,"threshold":1024,"zstdLevel":"default"},"connectors":[{"driver":"redis","id":"redis-cache","redis":{"uri":"{{ include \"erpc.redis.uriFor\" (dict \"context\" $ \"dbKey\" \"cacheDb\" \"queryKey\" \"cacheQuery\") }}"}}],"policies":[{"connector":"redis-cache","finality":"finalized","method":"*","network":"*","ttl":0},{"connector":"redis-cache","finality":"unfinalized","method":"*","network":"*","ttl":"5s"},{"connector":"redis-cache","finality":"realtime","method":"*","network":"*","ttl":"5s"}]}` | EVM JSON-RPC response caching configuration |
| config.database.evmJsonRpcCache.compression | object | `{"algorithm":"zstd","enabled":true,"threshold":1024,"zstdLevel":"default"}` | Compression configuration for cached data |
| config.database.evmJsonRpcCache.compression.algorithm | string | `"zstd"` | Compression algorithm to use (zstd, gzip, lz4) |
| config.database.evmJsonRpcCache.compression.enabled | bool | `true` | Enable compression for cached responses |
| config.database.evmJsonRpcCache.compression.threshold | int | `1024` | Minimum response size in bytes before applying compression |
| config.database.evmJsonRpcCache.compression.zstdLevel | string | `"default"` | Compression level for zstd (fastest, default, better, best) |
| config.database.evmJsonRpcCache.connectors | list | `[{"driver":"redis","id":"redis-cache","redis":{"uri":"{{ include \"erpc.redis.uriFor\" (dict \"context\" $ \"dbKey\" \"cacheDb\" \"queryKey\" \"cacheQuery\") }}"}}]` | Cache connector configurations |
| config.database.evmJsonRpcCache.connectors[0] | object | `{"driver":"redis","id":"redis-cache","redis":{"uri":"{{ include \"erpc.redis.uriFor\" (dict \"context\" $ \"dbKey\" \"cacheDb\" \"queryKey\" \"cacheQuery\") }}"}}` | Redis cache connector |
| config.database.evmJsonRpcCache.connectors[0].driver | string | `"redis"` | Database driver type |
| config.database.evmJsonRpcCache.connectors[0].id | string | `"redis-cache"` | Unique identifier for this connector |
| config.database.evmJsonRpcCache.connectors[0].redis | object | `{"uri":"{{ include \"erpc.redis.uriFor\" (dict \"context\" $ \"dbKey\" \"cacheDb\" \"queryKey\" \"cacheQuery\") }}"}` | Redis-specific configuration |
| config.database.evmJsonRpcCache.connectors[0].redis.uri | string | `"{{ include \"erpc.redis.uriFor\" (dict \"context\" $ \"dbKey\" \"cacheDb\" \"queryKey\" \"cacheQuery\") }}"` | Redis connection URI (template rendered) |
| config.database.evmJsonRpcCache.policies | list | `[{"connector":"redis-cache","finality":"finalized","method":"*","network":"*","ttl":0},{"connector":"redis-cache","finality":"unfinalized","method":"*","network":"*","ttl":"5s"},{"connector":"redis-cache","finality":"realtime","method":"*","network":"*","ttl":"5s"}]` | Cache policies defining what to cache and for how long |
| config.database.evmJsonRpcCache.policies[0] | object | `{"connector":"redis-cache","finality":"finalized","method":"*","network":"*","ttl":0}` | Cache policy for finalized blocks |
| config.database.evmJsonRpcCache.policies[0].connector | string | `"redis-cache"` | Connector ID to use for this policy |
| config.database.evmJsonRpcCache.policies[0].finality | string | `"finalized"` | Block finality state to match |
| config.database.evmJsonRpcCache.policies[0].method | string | `"*"` | RPC method pattern to match (supports wildcards) |
| config.database.evmJsonRpcCache.policies[0].network | string | `"*"` | Network pattern to match (supports wildcards) |
| config.database.evmJsonRpcCache.policies[0].ttl | int | `0` | Time-to-live in seconds (0 = infinite) |
| config.database.evmJsonRpcCache.policies[1] | object | `{"connector":"redis-cache","finality":"unfinalized","method":"*","network":"*","ttl":"5s"}` | Cache policy for unfinalized blocks |
| config.database.evmJsonRpcCache.policies[1].connector | string | `"redis-cache"` | Connector ID to use for this policy |
| config.database.evmJsonRpcCache.policies[1].finality | string | `"unfinalized"` | Block finality state to match |
| config.database.evmJsonRpcCache.policies[1].method | string | `"*"` | RPC method pattern to match (supports wildcards) |
| config.database.evmJsonRpcCache.policies[1].network | string | `"*"` | Network pattern to match (supports wildcards) |
| config.database.evmJsonRpcCache.policies[1].ttl | string | `"5s"` | Time-to-live duration |
| config.database.evmJsonRpcCache.policies[2] | object | `{"connector":"redis-cache","finality":"realtime","method":"*","network":"*","ttl":"5s"}` | Cache policy for realtime blocks |
| config.database.evmJsonRpcCache.policies[2].connector | string | `"redis-cache"` | Connector ID to use for this policy |
| config.database.evmJsonRpcCache.policies[2].finality | string | `"realtime"` | Block finality state to match |
| config.database.evmJsonRpcCache.policies[2].method | string | `"*"` | RPC method pattern to match (supports wildcards) |
| config.database.evmJsonRpcCache.policies[2].network | string | `"*"` | Network pattern to match (supports wildcards) |
| config.database.evmJsonRpcCache.policies[2].ttl | string | `"5s"` | Time-to-live duration |
| config.database.sharedState | object | `{"clusterKey":"atk-erpc-shared","connector":{"driver":"redis","redis":{"uri":"{{ include \"erpc.redis.uriFor\" (dict \"context\" $ \"dbKey\" \"sharedStateDb\" \"queryKey\" \"sharedStateQuery\") }}"}},"fallbackTimeout":"5s","lockTtl":"30s"}` | Shared state configuration for distributed coordination |
| config.database.sharedState.clusterKey | string | `"atk-erpc-shared"` | Unique key prefix for this cluster's shared state |
| config.database.sharedState.connector | object | `{"driver":"redis","redis":{"uri":"{{ include \"erpc.redis.uriFor\" (dict \"context\" $ \"dbKey\" \"sharedStateDb\" \"queryKey\" \"sharedStateQuery\") }}"}}` | Connector configuration for shared state storage |
| config.database.sharedState.connector.driver | string | `"redis"` | Database driver type |
| config.database.sharedState.connector.redis | object | `{"uri":"{{ include \"erpc.redis.uriFor\" (dict \"context\" $ \"dbKey\" \"sharedStateDb\" \"queryKey\" \"sharedStateQuery\") }}"}` | Redis-specific configuration |
| config.database.sharedState.connector.redis.uri | string | `"{{ include \"erpc.redis.uriFor\" (dict \"context\" $ \"dbKey\" \"sharedStateDb\" \"queryKey\" \"sharedStateQuery\") }}"` | Redis connection URI (template rendered) |
| config.database.sharedState.fallbackTimeout | string | `"5s"` | Timeout for fallback when shared state is unavailable |
| config.database.sharedState.lockTtl | string | `"30s"` | Time-to-live for distributed locks |
| config.logLevel | string | `"info"` | Log level for eRPC (debug, info, warn, error) |
| config.metrics | object | `{"enabled":true,"hostV4":"0.0.0.0","port":4001}` | Prometheus metrics endpoint configuration |
| config.metrics.enabled | bool | `true` | Enable metrics endpoint |
| config.metrics.hostV4 | string | `"0.0.0.0"` | IPv4 address to bind metrics server to |
| config.metrics.port | int | `4001` | Metrics server port |
| config.projects | list | `[{"id":"settlemint","networks":[{"architecture":"evm","directiveDefaults":{"retryEmpty":true},"evm":{"integrity":{"enforceGetLogsBlockRange":true,"enforceHighestBlock":true}},"failsafe":[{"hedge":{"maxCount":1,"maxDelay":"4s","minDelay":"200ms","quantile":0.9},"matchMethod":"eth_getLogs","retry":{"backoffFactor":2,"backoffMaxDelay":"10s","delay":"500ms","jitter":"300ms","maxAttempts":3},"timeout":{"duration":"45s"}},{"matchMethod":"trace_*|debug_*|arbtrace_*","retry":{"maxAttempts":1},"timeout":{"duration":"90s"}},{"matchMethod":"eth_getBlock*|eth_getTransaction*","retry":{"backoffFactor":1.5,"backoffMaxDelay":"3s","delay":"200ms","jitter":"150ms","maxAttempts":2},"timeout":{"duration":"6s"}},{"hedge":{"delay":"250ms","maxCount":1},"matchFinality":["unfinalized","realtime"],"matchMethod":"*","retry":{"delay":"150ms","jitter":"150ms","maxAttempts":2},"timeout":{"duration":"4s"}},{"matchFinality":["finalized"],"matchMethod":"*","retry":{"backoffFactor":1.8,"backoffMaxDelay":"8s","delay":"400ms","jitter":"250ms","maxAttempts":4},"timeout":{"duration":"20s"}},{"hedge":{"maxCount":2,"maxDelay":"2s","minDelay":"120ms","quantile":0.95},"matchMethod":"*","retry":{"backoffFactor":1.4,"backoffMaxDelay":"5s","delay":"300ms","jitter":"200ms","maxAttempts":3},"timeout":{"duration":"12s"}}]}],"upstreams":[{"endpoint":"http://besu-node-rpc-0.besu-node-rpc:8545","evm":{},"failsafe":[{"circuitBreaker":{"failureThresholdCapacity":80,"failureThresholdCount":40,"halfOpenAfter":"120s","successThresholdCapacity":10,"successThresholdCount":3},"matchMethod":"*"}],"id":"besu-node-rpc-0"},{"endpoint":"http://besu-node-rpc-1.besu-node-rpc:8545","evm":{},"failsafe":[{"circuitBreaker":{"failureThresholdCapacity":80,"failureThresholdCount":40,"halfOpenAfter":"120s","successThresholdCapacity":10,"successThresholdCount":3},"matchMethod":"*"}],"id":"besu-node-rpc-1"}]}]` | Array of project configurations (will be overridden by parent chart). Chain IDs default from .Values.global.chainId when omitted (see configmap template). |
| config.projects[0] | object | `{"id":"settlemint","networks":[{"architecture":"evm","directiveDefaults":{"retryEmpty":true},"evm":{"integrity":{"enforceGetLogsBlockRange":true,"enforceHighestBlock":true}},"failsafe":[{"hedge":{"maxCount":1,"maxDelay":"4s","minDelay":"200ms","quantile":0.9},"matchMethod":"eth_getLogs","retry":{"backoffFactor":2,"backoffMaxDelay":"10s","delay":"500ms","jitter":"300ms","maxAttempts":3},"timeout":{"duration":"45s"}},{"matchMethod":"trace_*|debug_*|arbtrace_*","retry":{"maxAttempts":1},"timeout":{"duration":"90s"}},{"matchMethod":"eth_getBlock*|eth_getTransaction*","retry":{"backoffFactor":1.5,"backoffMaxDelay":"3s","delay":"200ms","jitter":"150ms","maxAttempts":2},"timeout":{"duration":"6s"}},{"hedge":{"delay":"250ms","maxCount":1},"matchFinality":["unfinalized","realtime"],"matchMethod":"*","retry":{"delay":"150ms","jitter":"150ms","maxAttempts":2},"timeout":{"duration":"4s"}},{"matchFinality":["finalized"],"matchMethod":"*","retry":{"backoffFactor":1.8,"backoffMaxDelay":"8s","delay":"400ms","jitter":"250ms","maxAttempts":4},"timeout":{"duration":"20s"}},{"hedge":{"maxCount":2,"maxDelay":"2s","minDelay":"120ms","quantile":0.95},"matchMethod":"*","retry":{"backoffFactor":1.4,"backoffMaxDelay":"5s","delay":"300ms","jitter":"200ms","maxAttempts":3},"timeout":{"duration":"12s"}}]}],"upstreams":[{"endpoint":"http://besu-node-rpc-0.besu-node-rpc:8545","evm":{},"failsafe":[{"circuitBreaker":{"failureThresholdCapacity":80,"failureThresholdCount":40,"halfOpenAfter":"120s","successThresholdCapacity":10,"successThresholdCount":3},"matchMethod":"*"}],"id":"besu-node-rpc-0"},{"endpoint":"http://besu-node-rpc-1.besu-node-rpc:8545","evm":{},"failsafe":[{"circuitBreaker":{"failureThresholdCapacity":80,"failureThresholdCount":40,"halfOpenAfter":"120s","successThresholdCapacity":10,"successThresholdCount":3},"matchMethod":"*"}],"id":"besu-node-rpc-1"}]}` | Project configuration entry |
| config.projects[0].id | string | `"settlemint"` | Unique project identifier |
| config.projects[0].networks | list | `[{"architecture":"evm","directiveDefaults":{"retryEmpty":true},"evm":{"integrity":{"enforceGetLogsBlockRange":true,"enforceHighestBlock":true}},"failsafe":[{"hedge":{"maxCount":1,"maxDelay":"4s","minDelay":"200ms","quantile":0.9},"matchMethod":"eth_getLogs","retry":{"backoffFactor":2,"backoffMaxDelay":"10s","delay":"500ms","jitter":"300ms","maxAttempts":3},"timeout":{"duration":"45s"}},{"matchMethod":"trace_*|debug_*|arbtrace_*","retry":{"maxAttempts":1},"timeout":{"duration":"90s"}},{"matchMethod":"eth_getBlock*|eth_getTransaction*","retry":{"backoffFactor":1.5,"backoffMaxDelay":"3s","delay":"200ms","jitter":"150ms","maxAttempts":2},"timeout":{"duration":"6s"}},{"hedge":{"delay":"250ms","maxCount":1},"matchFinality":["unfinalized","realtime"],"matchMethod":"*","retry":{"delay":"150ms","jitter":"150ms","maxAttempts":2},"timeout":{"duration":"4s"}},{"matchFinality":["finalized"],"matchMethod":"*","retry":{"backoffFactor":1.8,"backoffMaxDelay":"8s","delay":"400ms","jitter":"250ms","maxAttempts":4},"timeout":{"duration":"20s"}},{"hedge":{"maxCount":2,"maxDelay":"2s","minDelay":"120ms","quantile":0.95},"matchMethod":"*","retry":{"backoffFactor":1.4,"backoffMaxDelay":"5s","delay":"300ms","jitter":"200ms","maxAttempts":3},"timeout":{"duration":"12s"}}]}]` | Network configurations for this project |
| config.projects[0].networks[0] | object | `{"architecture":"evm","directiveDefaults":{"retryEmpty":true},"evm":{"integrity":{"enforceGetLogsBlockRange":true,"enforceHighestBlock":true}},"failsafe":[{"hedge":{"maxCount":1,"maxDelay":"4s","minDelay":"200ms","quantile":0.9},"matchMethod":"eth_getLogs","retry":{"backoffFactor":2,"backoffMaxDelay":"10s","delay":"500ms","jitter":"300ms","maxAttempts":3},"timeout":{"duration":"45s"}},{"matchMethod":"trace_*|debug_*|arbtrace_*","retry":{"maxAttempts":1},"timeout":{"duration":"90s"}},{"matchMethod":"eth_getBlock*|eth_getTransaction*","retry":{"backoffFactor":1.5,"backoffMaxDelay":"3s","delay":"200ms","jitter":"150ms","maxAttempts":2},"timeout":{"duration":"6s"}},{"hedge":{"delay":"250ms","maxCount":1},"matchFinality":["unfinalized","realtime"],"matchMethod":"*","retry":{"delay":"150ms","jitter":"150ms","maxAttempts":2},"timeout":{"duration":"4s"}},{"matchFinality":["finalized"],"matchMethod":"*","retry":{"backoffFactor":1.8,"backoffMaxDelay":"8s","delay":"400ms","jitter":"250ms","maxAttempts":4},"timeout":{"duration":"20s"}},{"hedge":{"maxCount":2,"maxDelay":"2s","minDelay":"120ms","quantile":0.95},"matchMethod":"*","retry":{"backoffFactor":1.4,"backoffMaxDelay":"5s","delay":"300ms","jitter":"200ms","maxAttempts":3},"timeout":{"duration":"12s"}}]}` | Network configuration entry |
| config.projects[0].networks[0].architecture | string | `"evm"` | Blockchain architecture type (evm, substrate, etc.) |
| config.projects[0].networks[0].directiveDefaults | object | `{"retryEmpty":true}` | Default directives applied to all requests |
| config.projects[0].networks[0].directiveDefaults.retryEmpty | bool | `true` | Retry requests that return empty results |
| config.projects[0].networks[0].evm | object | `{"integrity":{"enforceGetLogsBlockRange":true,"enforceHighestBlock":true}}` | EVM-specific configuration |
| config.projects[0].networks[0].evm.integrity | object | `{"enforceGetLogsBlockRange":true,"enforceHighestBlock":true}` | Data integrity enforcement rules |
| config.projects[0].networks[0].evm.integrity.enforceGetLogsBlockRange | bool | `true` | Enforce valid block range for eth_getLogs queries |
| config.projects[0].networks[0].evm.integrity.enforceHighestBlock | bool | `true` | Enforce consistent highest block number across upstreams |
| config.projects[0].networks[0].failsafe | list | `[{"hedge":{"maxCount":1,"maxDelay":"4s","minDelay":"200ms","quantile":0.9},"matchMethod":"eth_getLogs","retry":{"backoffFactor":2,"backoffMaxDelay":"10s","delay":"500ms","jitter":"300ms","maxAttempts":3},"timeout":{"duration":"45s"}},{"matchMethod":"trace_*|debug_*|arbtrace_*","retry":{"maxAttempts":1},"timeout":{"duration":"90s"}},{"matchMethod":"eth_getBlock*|eth_getTransaction*","retry":{"backoffFactor":1.5,"backoffMaxDelay":"3s","delay":"200ms","jitter":"150ms","maxAttempts":2},"timeout":{"duration":"6s"}},{"hedge":{"delay":"250ms","maxCount":1},"matchFinality":["unfinalized","realtime"],"matchMethod":"*","retry":{"delay":"150ms","jitter":"150ms","maxAttempts":2},"timeout":{"duration":"4s"}},{"matchFinality":["finalized"],"matchMethod":"*","retry":{"backoffFactor":1.8,"backoffMaxDelay":"8s","delay":"400ms","jitter":"250ms","maxAttempts":4},"timeout":{"duration":"20s"}},{"hedge":{"maxCount":2,"maxDelay":"2s","minDelay":"120ms","quantile":0.95},"matchMethod":"*","retry":{"backoffFactor":1.4,"backoffMaxDelay":"5s","delay":"300ms","jitter":"200ms","maxAttempts":3},"timeout":{"duration":"12s"}}]` | Failsafe policies for request handling |
| config.projects[0].networks[0].failsafe[0] | object | `{"hedge":{"maxCount":1,"maxDelay":"4s","minDelay":"200ms","quantile":0.9},"matchMethod":"eth_getLogs","retry":{"backoffFactor":2,"backoffMaxDelay":"10s","delay":"500ms","jitter":"300ms","maxAttempts":3},"timeout":{"duration":"45s"}}` | Failsafe policy for eth_getLogs method |
| config.projects[0].networks[0].failsafe[0].hedge | object | `{"maxCount":1,"maxDelay":"4s","minDelay":"200ms","quantile":0.9}` | Hedge configuration for parallel requests |
| config.projects[0].networks[0].failsafe[0].hedge.maxCount | int | `1` | Maximum number of concurrent hedge requests |
| config.projects[0].networks[0].failsafe[0].hedge.maxDelay | string | `"4s"` | Maximum delay before sending hedge request |
| config.projects[0].networks[0].failsafe[0].hedge.minDelay | string | `"200ms"` | Minimum delay before sending hedge request |
| config.projects[0].networks[0].failsafe[0].hedge.quantile | float | `0.9` | Latency quantile threshold for hedging (0.0-1.0) |
| config.projects[0].networks[0].failsafe[0].matchMethod | string | `"eth_getLogs"` | RPC method pattern to match (supports wildcards) |
| config.projects[0].networks[0].failsafe[0].retry | object | `{"backoffFactor":2,"backoffMaxDelay":"10s","delay":"500ms","jitter":"300ms","maxAttempts":3}` | Retry configuration for failed requests |
| config.projects[0].networks[0].failsafe[0].retry.backoffFactor | int | `2` | Multiplicative factor for exponential backoff |
| config.projects[0].networks[0].failsafe[0].retry.backoffMaxDelay | string | `"10s"` | Maximum delay between retries |
| config.projects[0].networks[0].failsafe[0].retry.delay | string | `"500ms"` | Initial delay before first retry |
| config.projects[0].networks[0].failsafe[0].retry.jitter | string | `"300ms"` | Random jitter added to retry delay |
| config.projects[0].networks[0].failsafe[0].retry.maxAttempts | int | `3` | Maximum number of retry attempts |
| config.projects[0].networks[0].failsafe[0].timeout | object | `{"duration":"45s"}` | Timeout configuration for this method |
| config.projects[0].networks[0].failsafe[0].timeout.duration | string | `"45s"` | Maximum duration for request completion |
| config.projects[0].networks[0].failsafe[1] | object | `{"matchMethod":"trace_*|debug_*|arbtrace_*","retry":{"maxAttempts":1},"timeout":{"duration":"90s"}}` | Failsafe policy for trace/debug methods |
| config.projects[0].networks[0].failsafe[1].matchMethod | string | `"trace_*|debug_*|arbtrace_*"` | RPC method pattern for trace, debug, and arbtrace methods |
| config.projects[0].networks[0].failsafe[1].retry | object | `{"maxAttempts":1}` | Retry configuration for trace/debug methods |
| config.projects[0].networks[0].failsafe[1].retry.maxAttempts | int | `1` | Maximum retry attempts for trace/debug (limited to 1) |
| config.projects[0].networks[0].failsafe[1].timeout | object | `{"duration":"90s"}` | Timeout configuration for trace/debug methods |
| config.projects[0].networks[0].failsafe[1].timeout.duration | string | `"90s"` | Maximum duration for trace/debug requests |
| config.projects[0].networks[0].failsafe[2] | object | `{"matchMethod":"eth_getBlock*|eth_getTransaction*","retry":{"backoffFactor":1.5,"backoffMaxDelay":"3s","delay":"200ms","jitter":"150ms","maxAttempts":2},"timeout":{"duration":"6s"}}` | Failsafe policy for block and transaction queries |
| config.projects[0].networks[0].failsafe[2].matchMethod | string | `"eth_getBlock*|eth_getTransaction*"` | RPC method pattern for getBlock and getTransaction methods |
| config.projects[0].networks[0].failsafe[2].retry | object | `{"backoffFactor":1.5,"backoffMaxDelay":"3s","delay":"200ms","jitter":"150ms","maxAttempts":2}` | Retry configuration for block/transaction queries |
| config.projects[0].networks[0].failsafe[2].retry.backoffFactor | float | `1.5` | Multiplicative factor for exponential backoff |
| config.projects[0].networks[0].failsafe[2].retry.backoffMaxDelay | string | `"3s"` | Maximum delay between retries |
| config.projects[0].networks[0].failsafe[2].retry.delay | string | `"200ms"` | Initial delay before first retry |
| config.projects[0].networks[0].failsafe[2].retry.jitter | string | `"150ms"` | Random jitter added to retry delay |
| config.projects[0].networks[0].failsafe[2].retry.maxAttempts | int | `2` | Maximum retry attempts for block/transaction queries |
| config.projects[0].networks[0].failsafe[2].timeout | object | `{"duration":"6s"}` | Timeout configuration for block/transaction queries |
| config.projects[0].networks[0].failsafe[2].timeout.duration | string | `"6s"` | Maximum duration for block/transaction queries |
| config.projects[0].networks[0].failsafe[3] | object | `{"hedge":{"delay":"250ms","maxCount":1},"matchFinality":["unfinalized","realtime"],"matchMethod":"*","retry":{"delay":"150ms","jitter":"150ms","maxAttempts":2},"timeout":{"duration":"4s"}}` | Failsafe policy for unfinalized/realtime requests |
| config.projects[0].networks[0].failsafe[3].hedge | object | `{"delay":"250ms","maxCount":1}` | Hedge configuration for unfinalized requests |
| config.projects[0].networks[0].failsafe[3].hedge.delay | string | `"250ms"` | Delay before sending hedge request |
| config.projects[0].networks[0].failsafe[3].hedge.maxCount | int | `1` | Maximum number of concurrent hedge requests |
| config.projects[0].networks[0].failsafe[3].matchFinality | list | `["unfinalized","realtime"]` | Block finality states to match |
| config.projects[0].networks[0].failsafe[3].matchFinality[0] | string | `"unfinalized"` | Match unfinalized blocks |
| config.projects[0].networks[0].failsafe[3].matchFinality[1] | string | `"realtime"` | Match realtime blocks |
| config.projects[0].networks[0].failsafe[3].matchMethod | string | `"*"` | RPC method pattern matching all methods |
| config.projects[0].networks[0].failsafe[3].retry | object | `{"delay":"150ms","jitter":"150ms","maxAttempts":2}` | Retry configuration for unfinalized requests |
| config.projects[0].networks[0].failsafe[3].retry.delay | string | `"150ms"` | Initial delay before first retry |
| config.projects[0].networks[0].failsafe[3].retry.jitter | string | `"150ms"` | Random jitter added to retry delay |
| config.projects[0].networks[0].failsafe[3].retry.maxAttempts | int | `2` | Maximum retry attempts for unfinalized requests |
| config.projects[0].networks[0].failsafe[3].timeout | object | `{"duration":"4s"}` | Timeout configuration for unfinalized requests |
| config.projects[0].networks[0].failsafe[3].timeout.duration | string | `"4s"` | Maximum duration for unfinalized requests |
| config.projects[0].networks[0].failsafe[4] | object | `{"matchFinality":["finalized"],"matchMethod":"*","retry":{"backoffFactor":1.8,"backoffMaxDelay":"8s","delay":"400ms","jitter":"250ms","maxAttempts":4},"timeout":{"duration":"20s"}}` | Failsafe policy for finalized block requests |
| config.projects[0].networks[0].failsafe[4].matchFinality | list | `["finalized"]` | Block finality states to match (finalized only) |
| config.projects[0].networks[0].failsafe[4].matchFinality[0] | string | `"finalized"` | Match finalized blocks |
| config.projects[0].networks[0].failsafe[4].matchMethod | string | `"*"` | RPC method pattern matching all methods |
| config.projects[0].networks[0].failsafe[4].retry | object | `{"backoffFactor":1.8,"backoffMaxDelay":"8s","delay":"400ms","jitter":"250ms","maxAttempts":4}` | Retry configuration for finalized requests |
| config.projects[0].networks[0].failsafe[4].retry.backoffFactor | float | `1.8` | Multiplicative factor for exponential backoff |
| config.projects[0].networks[0].failsafe[4].retry.backoffMaxDelay | string | `"8s"` | Maximum delay between retries |
| config.projects[0].networks[0].failsafe[4].retry.delay | string | `"400ms"` | Initial delay before first retry |
| config.projects[0].networks[0].failsafe[4].retry.jitter | string | `"250ms"` | Random jitter added to retry delay |
| config.projects[0].networks[0].failsafe[4].retry.maxAttempts | int | `4` | Maximum retry attempts for finalized requests |
| config.projects[0].networks[0].failsafe[4].timeout | object | `{"duration":"20s"}` | Timeout configuration for finalized requests |
| config.projects[0].networks[0].failsafe[4].timeout.duration | string | `"20s"` | Maximum duration for finalized requests |
| config.projects[0].networks[0].failsafe[5] | object | `{"hedge":{"maxCount":2,"maxDelay":"2s","minDelay":"120ms","quantile":0.95},"matchMethod":"*","retry":{"backoffFactor":1.4,"backoffMaxDelay":"5s","delay":"300ms","jitter":"200ms","maxAttempts":3},"timeout":{"duration":"12s"}}` | Default fallback failsafe policy for all methods |
| config.projects[0].networks[0].failsafe[5].hedge | object | `{"maxCount":2,"maxDelay":"2s","minDelay":"120ms","quantile":0.95}` | Hedge configuration for default policy |
| config.projects[0].networks[0].failsafe[5].hedge.maxCount | int | `2` | Maximum number of concurrent hedge requests |
| config.projects[0].networks[0].failsafe[5].hedge.maxDelay | string | `"2s"` | Maximum delay before sending hedge request |
| config.projects[0].networks[0].failsafe[5].hedge.minDelay | string | `"120ms"` | Minimum delay before sending hedge request |
| config.projects[0].networks[0].failsafe[5].hedge.quantile | float | `0.95` | Latency quantile threshold for hedging (0.0-1.0) |
| config.projects[0].networks[0].failsafe[5].matchMethod | string | `"*"` | RPC method pattern matching all methods (catch-all) |
| config.projects[0].networks[0].failsafe[5].retry | object | `{"backoffFactor":1.4,"backoffMaxDelay":"5s","delay":"300ms","jitter":"200ms","maxAttempts":3}` | Retry configuration for default policy |
| config.projects[0].networks[0].failsafe[5].retry.backoffFactor | float | `1.4` | Multiplicative factor for exponential backoff |
| config.projects[0].networks[0].failsafe[5].retry.backoffMaxDelay | string | `"5s"` | Maximum delay between retries |
| config.projects[0].networks[0].failsafe[5].retry.delay | string | `"300ms"` | Initial delay before first retry |
| config.projects[0].networks[0].failsafe[5].retry.jitter | string | `"200ms"` | Random jitter added to retry delay |
| config.projects[0].networks[0].failsafe[5].retry.maxAttempts | int | `3` | Maximum retry attempts for default policy |
| config.projects[0].networks[0].failsafe[5].timeout | object | `{"duration":"12s"}` | Timeout configuration for default policy |
| config.projects[0].networks[0].failsafe[5].timeout.duration | string | `"12s"` | Maximum duration for default requests |
| config.projects[0].upstreams | list | `[{"endpoint":"http://besu-node-rpc-0.besu-node-rpc:8545","evm":{},"failsafe":[{"circuitBreaker":{"failureThresholdCapacity":80,"failureThresholdCount":40,"halfOpenAfter":"120s","successThresholdCapacity":10,"successThresholdCount":3},"matchMethod":"*"}],"id":"besu-node-rpc-0"},{"endpoint":"http://besu-node-rpc-1.besu-node-rpc:8545","evm":{},"failsafe":[{"circuitBreaker":{"failureThresholdCapacity":80,"failureThresholdCount":40,"halfOpenAfter":"120s","successThresholdCapacity":10,"successThresholdCount":3},"matchMethod":"*"}],"id":"besu-node-rpc-1"}]` | Upstream RPC node configurations for load balancing |
| config.projects[0].upstreams[0] | object | `{"endpoint":"http://besu-node-rpc-0.besu-node-rpc:8545","evm":{},"failsafe":[{"circuitBreaker":{"failureThresholdCapacity":80,"failureThresholdCount":40,"halfOpenAfter":"120s","successThresholdCapacity":10,"successThresholdCount":3},"matchMethod":"*"}],"id":"besu-node-rpc-0"}` | First Besu RPC node upstream |
| config.projects[0].upstreams[0].endpoint | string | `"http://besu-node-rpc-0.besu-node-rpc:8545"` | RPC endpoint URL for this upstream |
| config.projects[0].upstreams[0].evm | object | `{}` | EVM-specific configuration for this upstream |
| config.projects[0].upstreams[0].failsafe | list | `[{"circuitBreaker":{"failureThresholdCapacity":80,"failureThresholdCount":40,"halfOpenAfter":"120s","successThresholdCapacity":10,"successThresholdCount":3},"matchMethod":"*"}]` | Failsafe policies for this upstream |
| config.projects[0].upstreams[0].failsafe[0] | object | `{"circuitBreaker":{"failureThresholdCapacity":80,"failureThresholdCount":40,"halfOpenAfter":"120s","successThresholdCapacity":10,"successThresholdCount":3},"matchMethod":"*"}` | Circuit breaker policy for this upstream |
| config.projects[0].upstreams[0].failsafe[0].circuitBreaker | object | `{"failureThresholdCapacity":80,"failureThresholdCount":40,"halfOpenAfter":"120s","successThresholdCapacity":10,"successThresholdCount":3}` | Circuit breaker configuration |
| config.projects[0].upstreams[0].failsafe[0].circuitBreaker.failureThresholdCapacity | int | `80` | Capacity of failure counter window |
| config.projects[0].upstreams[0].failsafe[0].circuitBreaker.failureThresholdCount | int | `40` | Number of failures before opening circuit |
| config.projects[0].upstreams[0].failsafe[0].circuitBreaker.halfOpenAfter | string | `"120s"` | Duration before attempting to close circuit |
| config.projects[0].upstreams[0].failsafe[0].circuitBreaker.successThresholdCapacity | int | `10` | Capacity of success counter window |
| config.projects[0].upstreams[0].failsafe[0].circuitBreaker.successThresholdCount | int | `3` | Number of successes needed to close circuit |
| config.projects[0].upstreams[0].failsafe[0].matchMethod | string | `"*"` | RPC method pattern matching all methods |
| config.projects[0].upstreams[0].id | string | `"besu-node-rpc-0"` | Unique identifier for this upstream |
| config.projects[0].upstreams[1] | object | `{"endpoint":"http://besu-node-rpc-1.besu-node-rpc:8545","evm":{},"failsafe":[{"circuitBreaker":{"failureThresholdCapacity":80,"failureThresholdCount":40,"halfOpenAfter":"120s","successThresholdCapacity":10,"successThresholdCount":3},"matchMethod":"*"}],"id":"besu-node-rpc-1"}` | Second Besu RPC node upstream |
| config.projects[0].upstreams[1].endpoint | string | `"http://besu-node-rpc-1.besu-node-rpc:8545"` | RPC endpoint URL for this upstream |
| config.projects[0].upstreams[1].evm | object | `{}` | EVM-specific configuration for this upstream |
| config.projects[0].upstreams[1].failsafe | list | `[{"circuitBreaker":{"failureThresholdCapacity":80,"failureThresholdCount":40,"halfOpenAfter":"120s","successThresholdCapacity":10,"successThresholdCount":3},"matchMethod":"*"}]` | Failsafe policies for this upstream |
| config.projects[0].upstreams[1].failsafe[0] | object | `{"circuitBreaker":{"failureThresholdCapacity":80,"failureThresholdCount":40,"halfOpenAfter":"120s","successThresholdCapacity":10,"successThresholdCount":3},"matchMethod":"*"}` | Circuit breaker policy for this upstream |
| config.projects[0].upstreams[1].failsafe[0].circuitBreaker | object | `{"failureThresholdCapacity":80,"failureThresholdCount":40,"halfOpenAfter":"120s","successThresholdCapacity":10,"successThresholdCount":3}` | Circuit breaker configuration |
| config.projects[0].upstreams[1].failsafe[0].circuitBreaker.failureThresholdCapacity | int | `80` | Capacity of failure counter window |
| config.projects[0].upstreams[1].failsafe[0].circuitBreaker.failureThresholdCount | int | `40` | Number of failures before opening circuit |
| config.projects[0].upstreams[1].failsafe[0].circuitBreaker.halfOpenAfter | string | `"120s"` | Duration before attempting to close circuit |
| config.projects[0].upstreams[1].failsafe[0].circuitBreaker.successThresholdCapacity | int | `10` | Capacity of success counter window |
| config.projects[0].upstreams[1].failsafe[0].circuitBreaker.successThresholdCount | int | `3` | Number of successes needed to close circuit |
| config.projects[0].upstreams[1].failsafe[0].matchMethod | string | `"*"` | RPC method pattern matching all methods |
| config.projects[0].upstreams[1].id | string | `"besu-node-rpc-1"` | Unique identifier for this upstream |
| config.server | object | `{"httpHostV4":"0.0.0.0","httpPort":4000,"waitAfterShutdown":"30s","waitBeforeShutdown":"30s"}` | HTTP server configuration |
| config.server.httpHostV4 | string | `"0.0.0.0"` | IPv4 address to bind HTTP server to |
| config.server.httpPort | int | `4000` | HTTP server port |
| config.server.waitAfterShutdown | string | `"30s"` | Duration to wait after graceful shutdown completes |
| config.server.waitBeforeShutdown | string | `"30s"` | Duration to wait before starting graceful shutdown |
| configMountPath | string | `"/erpc.yaml"` | Path where the rendered configuration file will be mounted |
| containerSecurityContext | object | `{}` | Container Security Context configuration (overrides global.securityContexts.container) |
| envSecret | object | `{"defaultMode":420,"enabled":false,"mountPath":"/.env","name":"","subPath":""}` | .env Secret mount configuration |
| envSecret.defaultMode | int | `420` | File mode applied to the mounted Secret (decimal 420 = 0644) |
| envSecret.enabled | bool | `false` | Enable mounting a Secret containing a .env file |
| envSecret.mountPath | string | `"/.env"` | Path where the .env file will be mounted |
| envSecret.name | string | `""` | Name of the Secret containing the .env data (required when enabled) |
| envSecret.subPath | string | `""` | Optional subPath within the Secret to mount (defaults to the key named `.env`) |
| extraEnvVars | list | `[]` | Array with extra environment variables to add to eRPC nodes |
| extraEnvVarsCM | string | `""` | Name of existing ConfigMap containing extra env vars for eRPC nodes |
| extraEnvVarsSecret | string | `""` | Name of existing Secret containing extra env vars for eRPC nodes |
| extraInitContainers | list | `[]` | Additional init containers appended verbatim to the workload spec |
| extraVolumeMounts | list | `[]` | Optionally specify extra list of additional volumeMounts for the eRPC container(s) |
| extraVolumes | list | `[]` | Optionally specify extra list of additional volumes for the eRPC pod(s) |
| fullnameOverride | string | `"erpc"` | String to fully override common.names.fullname |
| global | object | `{"datastores":{},"imagePullSecrets":[],"imageRegistry":"","labels":{"kots.io/app-slug":"settlemint-atk"},"securityContexts":{},"storageClass":""}` | Global Docker image registry |
| global.datastores | object | `{}` | Datastore configurations for dependencies like Redis |
| global.imagePullSecrets | list | `[]` | Global Docker registry secret names as an array |
| global.imageRegistry | string | `""` | Global Docker image registry |
| global.labels | object | `{"kots.io/app-slug":"settlemint-atk"}` | Global labels applied to all resources |
| global.labels."kots.io/app-slug" | string | `"settlemint-atk"` | Kots.io app slug identifier |
| global.securityContexts | object | `{}` | Security contexts configuration (pod and container level) |
| global.storageClass | string | `""` | Global StorageClass for Persistent Volume(s) |
| image | object | `{"digest":"","pullPolicy":"IfNotPresent","pullSecrets":[],"registry":"ghcr.io","repository":"erpc/erpc","tag":"0.0.57"}` | eRPC image |
| image.digest | string | `""` | eRPC image digest in the way sha256:aa.... Please note this parameter, if set, will override the tag |
| image.pullPolicy | string | `"IfNotPresent"` | eRPC image pull policy |
| image.pullSecrets | list | `[]` | eRPC image pull secrets |
| image.registry | string | `"ghcr.io"` | eRPC image registry |
| image.repository | string | `"erpc/erpc"` | eRPC image repository |
| image.tag | string | `"0.0.57"` | eRPC image tag (immutable tags are recommended) |
| ingress | object | `{"annotations":{},"apiVersion":"","enabled":true,"extraHosts":[],"extraPaths":[],"extraRules":[],"extraTls":[],"hostname":"besu.k8s.orb.local","ingressClassName":"atk-nginx","path":"/","pathType":"ImplementationSpecific","secrets":[],"selfSigned":false,"tls":false}` | Ingress parameters |
| ingress.annotations | object | `{}` | Additional annotations for the Ingress resource. To enable certificate autogeneration, place here your cert-manager annotations. |
| ingress.apiVersion | string | `""` | Force Ingress API version (automatically detected if not set) |
| ingress.enabled | bool | `true` | Enable ingress record generation for eRPC |
| ingress.extraHosts | list | `[]` | An array with additional hostname(s) to be covered with the ingress record |
| ingress.extraPaths | list | `[]` | An array with additional arbitrary paths that may need to be added to the ingress under the main host |
| ingress.extraRules | list | `[]` | Additional rules to be covered with this ingress record |
| ingress.extraTls | list | `[]` | TLS configuration for additional hostname(s) to be covered with this ingress record |
| ingress.hostname | string | `"besu.k8s.orb.local"` | Default host for the ingress record |
| ingress.ingressClassName | string | `"atk-nginx"` | IngressClass that will be be used to implement the Ingress (Kubernetes 1.18+) |
| ingress.path | string | `"/"` | Default path for the ingress record |
| ingress.pathType | string | `"ImplementationSpecific"` | Ingress path type |
| ingress.secrets | list | `[]` | Custom TLS certificates as secrets |
| ingress.selfSigned | bool | `false` | Create a TLS secret for this ingress record using self-signed certificates generated by Helm |
| ingress.tls | bool | `false` | Enable TLS configuration for the host defined at `ingress.hostname` parameter |
| initContainer | object | `{"tcpCheck":{"dependencies":[{"endpoint":"besu-node-rpc-0.besu-node-rpc:8545","name":"besu-rpc"},{"endpoint":"{{ include \"erpc.redis.endpoint\" (dict \"context\" $) }}","name":"redis"}],"enabled":true,"image":{"pullPolicy":"IfNotPresent","repository":"ghcr.io/settlemint/btp-waitforit","tag":"v7.7.10"},"resources":{"limits":{"cpu":"100m","memory":"64Mi"},"requests":{"cpu":"10m","memory":"32Mi"}},"timeout":120}}` | Init container configuration for dependency checking |
| initContainer.tcpCheck | object | `{"dependencies":[{"endpoint":"besu-node-rpc-0.besu-node-rpc:8545","name":"besu-rpc"},{"endpoint":"{{ include \"erpc.redis.endpoint\" (dict \"context\" $) }}","name":"redis"}],"enabled":true,"image":{"pullPolicy":"IfNotPresent","repository":"ghcr.io/settlemint/btp-waitforit","tag":"v7.7.10"},"resources":{"limits":{"cpu":"100m","memory":"64Mi"},"requests":{"cpu":"10m","memory":"32Mi"}},"timeout":120}` | Generic TCP check settings for service dependencies |
| initContainer.tcpCheck.dependencies | list | `[{"endpoint":"besu-node-rpc-0.besu-node-rpc:8545","name":"besu-rpc"},{"endpoint":"{{ include \"erpc.redis.endpoint\" (dict \"context\" $) }}","name":"redis"}]` | List of service dependencies to check before starting |
| initContainer.tcpCheck.dependencies[0] | object | `{"endpoint":"besu-node-rpc-0.besu-node-rpc:8545","name":"besu-rpc"}` | Besu RPC service dependency |
| initContainer.tcpCheck.dependencies[0].endpoint | string | `"besu-node-rpc-0.besu-node-rpc:8545"` | Service endpoint to check (service-name:port) |
| initContainer.tcpCheck.dependencies[0].name | string | `"besu-rpc"` | Name of the dependency |
| initContainer.tcpCheck.dependencies[1] | object | `{"endpoint":"{{ include \"erpc.redis.endpoint\" (dict \"context\" $) }}","name":"redis"}` | Redis service dependency |
| initContainer.tcpCheck.dependencies[1].endpoint | string | `"{{ include \"erpc.redis.endpoint\" (dict \"context\" $) }}"` | Service endpoint to check (template rendered) |
| initContainer.tcpCheck.dependencies[1].name | string | `"redis"` | Name of the dependency |
| initContainer.tcpCheck.enabled | bool | `true` | Enable TCP dependency checking init container |
| initContainer.tcpCheck.image | object | `{"pullPolicy":"IfNotPresent","repository":"ghcr.io/settlemint/btp-waitforit","tag":"v7.7.10"}` | Container image for TCP check init container |
| initContainer.tcpCheck.image.pullPolicy | string | `"IfNotPresent"` | TCP check image pull policy |
| initContainer.tcpCheck.image.repository | string | `"ghcr.io/settlemint/btp-waitforit"` | TCP check image repository |
| initContainer.tcpCheck.image.tag | string | `"v7.7.10"` | TCP check image tag |
| initContainer.tcpCheck.resources | object | `{"limits":{"cpu":"100m","memory":"64Mi"},"requests":{"cpu":"10m","memory":"32Mi"}}` | Resource limits and requests for TCP check container |
| initContainer.tcpCheck.resources.limits | object | `{"cpu":"100m","memory":"64Mi"}` | Resource limits for TCP check container |
| initContainer.tcpCheck.resources.limits.cpu | string | `"100m"` | CPU limit for TCP check container |
| initContainer.tcpCheck.resources.limits.memory | string | `"64Mi"` | Memory limit for TCP check container |
| initContainer.tcpCheck.resources.requests | object | `{"cpu":"10m","memory":"32Mi"}` | Resource requests for TCP check container |
| initContainer.tcpCheck.resources.requests.cpu | string | `"10m"` | CPU request for TCP check container |
| initContainer.tcpCheck.resources.requests.memory | string | `"32Mi"` | Memory request for TCP check container |
| initContainer.tcpCheck.timeout | int | `120` | Timeout in seconds for each dependency check |
| lifecycleHooks | object | `{}` | lifecycleHooks for the eRPC container(s) to automate configuration before or after startup |
| livenessProbe | object | `{"enabled":true,"failureThreshold":3,"httpGet":{"path":"/healthcheck","port":"http"},"initialDelaySeconds":10,"periodSeconds":10,"successThreshold":1,"timeoutSeconds":5}` | Configure eRPC containers' liveness probe |
| livenessProbe.enabled | bool | `true` | Enable livenessProbe on eRPC containers |
| livenessProbe.failureThreshold | int | `3` | Failure threshold for livenessProbe |
| livenessProbe.httpGet | object | `{"path":"/healthcheck","port":"http"}` | HTTP get parameters for livenessProbe |
| livenessProbe.httpGet.path | string | `"/healthcheck"` | Path for httpGet livenessProbe |
| livenessProbe.httpGet.port | string | `"http"` | Port for httpGet livenessProbe |
| livenessProbe.initialDelaySeconds | int | `10` | Initial delay seconds for livenessProbe |
| livenessProbe.periodSeconds | int | `10` | Period seconds for livenessProbe |
| livenessProbe.successThreshold | int | `1` | Success threshold for livenessProbe |
| livenessProbe.timeoutSeconds | int | `5` | Timeout seconds for livenessProbe |
| networkPolicy | object | `{"addExternalClientAccess":true,"allowExternal":true,"allowExternalEgress":true,"enabled":false,"extraEgress":[{"ports":[{"port":53,"protocol":"UDP"}],"to":[{"namespaceSelector":{},"podSelector":{"matchLabels":{"k8s-app":"kube-dns"}}}]},{"ports":[{"port":8545,"protocol":"TCP"}],"to":[{"podSelector":{"matchLabels":{"app.kubernetes.io/name":"besu-statefulset"}}}]}],"extraIngress":[{"from":[{"podSelector":{"matchLabels":{"app.kubernetes.io/name":"dapp"}}},{"podSelector":{"matchLabels":{"app.kubernetes.io/name":"txsigner"}}},{"podSelector":{"matchLabels":{"app.kubernetes.io/name":"ingress-nginx"}}},{"podSelector":{}}],"ports":[{"port":4000,"protocol":"TCP"},{"port":4001,"protocol":"TCP"}]}],"ingressRules":{"accessOnlyFrom":{"enabled":false,"namespaceSelector":{},"podSelector":{}}}}` | Network policies configuration |
| networkPolicy.addExternalClientAccess | bool | `true` | Allow access from pods with client label set to "true". Ignored if `networkPolicy.allowExternal` is true. |
| networkPolicy.allowExternal | bool | `true` | The Policy model to apply |
| networkPolicy.allowExternalEgress | bool | `true` | Allow the pod to access any range of port and all destinations. |
| networkPolicy.enabled | bool | `false` | Enable creation of NetworkPolicy resources |
| networkPolicy.extraEgress | list | `[{"ports":[{"port":53,"protocol":"UDP"}],"to":[{"namespaceSelector":{},"podSelector":{"matchLabels":{"k8s-app":"kube-dns"}}}]},{"ports":[{"port":8545,"protocol":"TCP"}],"to":[{"podSelector":{"matchLabels":{"app.kubernetes.io/name":"besu-statefulset"}}}]}]` | Add extra egress rules to the NetworkPolicy (ignored if allowExternalEgress=true) |
| networkPolicy.extraEgress[0] | object | `{"ports":[{"port":53,"protocol":"UDP"}],"to":[{"namespaceSelector":{},"podSelector":{"matchLabels":{"k8s-app":"kube-dns"}}}]}` | Egress rule for DNS resolution |
| networkPolicy.extraEgress[0].ports | list | `[{"port":53,"protocol":"UDP"}]` | Port configurations for DNS egress |
| networkPolicy.extraEgress[0].ports[0] | object | `{"port":53,"protocol":"UDP"}` | DNS port configuration |
| networkPolicy.extraEgress[0].ports[0].port | int | `53` | DNS port number |
| networkPolicy.extraEgress[0].ports[0].protocol | string | `"UDP"` | Protocol for DNS queries |
| networkPolicy.extraEgress[0].to | list | `[{"namespaceSelector":{},"podSelector":{"matchLabels":{"k8s-app":"kube-dns"}}}]` | Destination selectors for DNS traffic |
| networkPolicy.extraEgress[0].to[0] | object | `{"namespaceSelector":{},"podSelector":{"matchLabels":{"k8s-app":"kube-dns"}}}` | Allow DNS queries to kube-dns pods |
| networkPolicy.extraEgress[0].to[0].namespaceSelector | object | `{}` | Namespace selector (empty matches all namespaces) |
| networkPolicy.extraEgress[0].to[0].podSelector | object | `{"matchLabels":{"k8s-app":"kube-dns"}}` | Pod selector for kube-dns |
| networkPolicy.extraEgress[0].to[0].podSelector.matchLabels | object | `{"k8s-app":"kube-dns"}` | Label selector for kube-dns pods |
| networkPolicy.extraEgress[0].to[0].podSelector.matchLabels.k8s-app | string | `"kube-dns"` | Kubernetes app label for DNS |
| networkPolicy.extraEgress[1] | object | `{"ports":[{"port":8545,"protocol":"TCP"}],"to":[{"podSelector":{"matchLabels":{"app.kubernetes.io/name":"besu-statefulset"}}}]}` | Egress rule for Besu node access |
| networkPolicy.extraEgress[1].ports | list | `[{"port":8545,"protocol":"TCP"}]` | Port configurations for Besu egress |
| networkPolicy.extraEgress[1].ports[0] | object | `{"port":8545,"protocol":"TCP"}` | Besu RPC port configuration |
| networkPolicy.extraEgress[1].ports[0].port | int | `8545` | Besu RPC port number |
| networkPolicy.extraEgress[1].ports[0].protocol | string | `"TCP"` | Protocol for Besu RPC traffic |
| networkPolicy.extraEgress[1].to | list | `[{"podSelector":{"matchLabels":{"app.kubernetes.io/name":"besu-statefulset"}}}]` | Destination selectors for Besu traffic |
| networkPolicy.extraEgress[1].to[0] | object | `{"podSelector":{"matchLabels":{"app.kubernetes.io/name":"besu-statefulset"}}}` | Allow traffic to Besu statefulset pods |
| networkPolicy.extraEgress[1].to[0].podSelector | object | `{"matchLabels":{"app.kubernetes.io/name":"besu-statefulset"}}` | Pod selector for Besu nodes |
| networkPolicy.extraEgress[1].to[0].podSelector.matchLabels | object | `{"app.kubernetes.io/name":"besu-statefulset"}` | Label selector for Besu pods |
| networkPolicy.extraEgress[1].to[0].podSelector.matchLabels."app.kubernetes.io/name" | string | `"besu-statefulset"` | App name label for Besu statefulset |
| networkPolicy.extraIngress | list | `[{"from":[{"podSelector":{"matchLabels":{"app.kubernetes.io/name":"dapp"}}},{"podSelector":{"matchLabels":{"app.kubernetes.io/name":"txsigner"}}},{"podSelector":{"matchLabels":{"app.kubernetes.io/name":"ingress-nginx"}}},{"podSelector":{}}],"ports":[{"port":4000,"protocol":"TCP"},{"port":4001,"protocol":"TCP"}]}]` | Add extra ingress rules to the NetworkPolicy |
| networkPolicy.extraIngress[0] | object | `{"from":[{"podSelector":{"matchLabels":{"app.kubernetes.io/name":"dapp"}}},{"podSelector":{"matchLabels":{"app.kubernetes.io/name":"txsigner"}}},{"podSelector":{"matchLabels":{"app.kubernetes.io/name":"ingress-nginx"}}},{"podSelector":{}}],"ports":[{"port":4000,"protocol":"TCP"},{"port":4001,"protocol":"TCP"}]}` | Ingress rule allowing access from specific pods |
| networkPolicy.extraIngress[0].from | list | `[{"podSelector":{"matchLabels":{"app.kubernetes.io/name":"dapp"}}},{"podSelector":{"matchLabels":{"app.kubernetes.io/name":"txsigner"}}},{"podSelector":{"matchLabels":{"app.kubernetes.io/name":"ingress-nginx"}}},{"podSelector":{}}]` | Source pod selectors for this ingress rule |
| networkPolicy.extraIngress[0].from[0] | object | `{"podSelector":{"matchLabels":{"app.kubernetes.io/name":"dapp"}}}` | Allow traffic from dapp pods |
| networkPolicy.extraIngress[0].from[0].podSelector | object | `{"matchLabels":{"app.kubernetes.io/name":"dapp"}}` | Pod selector for dapp |
| networkPolicy.extraIngress[0].from[0].podSelector.matchLabels | object | `{"app.kubernetes.io/name":"dapp"}` | Label selector for dapp pods |
| networkPolicy.extraIngress[0].from[0].podSelector.matchLabels."app.kubernetes.io/name" | string | `"dapp"` | App name label for dapp |
| networkPolicy.extraIngress[0].from[1] | object | `{"podSelector":{"matchLabels":{"app.kubernetes.io/name":"txsigner"}}}` | Allow traffic from txsigner pods |
| networkPolicy.extraIngress[0].from[1].podSelector | object | `{"matchLabels":{"app.kubernetes.io/name":"txsigner"}}` | Pod selector for txsigner |
| networkPolicy.extraIngress[0].from[1].podSelector.matchLabels | object | `{"app.kubernetes.io/name":"txsigner"}` | Label selector for txsigner pods |
| networkPolicy.extraIngress[0].from[1].podSelector.matchLabels."app.kubernetes.io/name" | string | `"txsigner"` | App name label for txsigner |
| networkPolicy.extraIngress[0].from[2] | object | `{"podSelector":{"matchLabels":{"app.kubernetes.io/name":"ingress-nginx"}}}` | Allow traffic from ingress-nginx pods |
| networkPolicy.extraIngress[0].from[2].podSelector | object | `{"matchLabels":{"app.kubernetes.io/name":"ingress-nginx"}}` | Pod selector for ingress-nginx |
| networkPolicy.extraIngress[0].from[2].podSelector.matchLabels | object | `{"app.kubernetes.io/name":"ingress-nginx"}` | Label selector for ingress-nginx pods |
| networkPolicy.extraIngress[0].from[2].podSelector.matchLabels."app.kubernetes.io/name" | string | `"ingress-nginx"` | App name label for ingress-nginx |
| networkPolicy.extraIngress[0].from[3] | object | `{"podSelector":{}}` | Allow traffic from any pod in same namespace |
| networkPolicy.extraIngress[0].from[3].podSelector | object | `{}` | Empty pod selector matches all pods |
| networkPolicy.extraIngress[0].ports | list | `[{"port":4000,"protocol":"TCP"},{"port":4001,"protocol":"TCP"}]` | Port configurations for this ingress rule |
| networkPolicy.extraIngress[0].ports[0] | object | `{"port":4000,"protocol":"TCP"}` | RPC port configuration |
| networkPolicy.extraIngress[0].ports[0].port | int | `4000` | RPC port number |
| networkPolicy.extraIngress[0].ports[0].protocol | string | `"TCP"` | Protocol for RPC traffic |
| networkPolicy.extraIngress[0].ports[1] | object | `{"port":4001,"protocol":"TCP"}` | Metrics port configuration |
| networkPolicy.extraIngress[0].ports[1].port | int | `4001` | Metrics port number |
| networkPolicy.extraIngress[0].ports[1].protocol | string | `"TCP"` | Protocol for metrics traffic |
| networkPolicy.ingressRules | object | `{"accessOnlyFrom":{"enabled":false,"namespaceSelector":{},"podSelector":{}}}` | Ingress rules configuration |
| networkPolicy.ingressRules.accessOnlyFrom | object | `{"enabled":false,"namespaceSelector":{},"podSelector":{}}` | Access restrictions configuration |
| networkPolicy.ingressRules.accessOnlyFrom.enabled | bool | `false` | Enable ingress rule that makes eRPC only accessible from a particular origin. |
| networkPolicy.ingressRules.accessOnlyFrom.namespaceSelector | object | `{}` | Namespace selector label that is allowed to access eRPC. This label will be used to identified allowed namespace(s). |
| networkPolicy.ingressRules.accessOnlyFrom.podSelector | object | `{}` | Pods selector label that is allowed to access eRPC. This label will be used to identified allowed pod(s). |
| nodeAffinityPreset | object | `{"key":"","type":"","values":[]}` | Node affinity preset configuration |
| nodeAffinityPreset.key | string | `""` | Node label key to match. Ignored if `affinity` is set |
| nodeAffinityPreset.type | string | `""` | Node affinity preset type. Ignored if `affinity` is set. Allowed values: `soft` or `hard` |
| nodeAffinityPreset.values | list | `[]` | Node label values to match. Ignored if `affinity` is set |
| nodeSelector | object | `{}` | Node labels for pod assignment |
| openShiftRoute | object | `{"alternateBackends":[],"annotations":{},"enabled":false,"host":"besu.k8s.orb.local","path":"/","port":{"targetPort":"http"},"tls":null,"to":{"weight":100},"wildcardPolicy":"None"}` | OpenShift Route parameters |
| openShiftRoute.alternateBackends | list | `[]` | Additional backends for weighted routing |
| openShiftRoute.annotations | object | `{}` | Additional annotations for the OpenShift route resource |
| openShiftRoute.enabled | bool | `false` | Enable OpenShift route creation for eRPC |
| openShiftRoute.host | string | `"besu.k8s.orb.local"` | Hostname exposed via the OpenShift route |
| openShiftRoute.path | string | `"/"` | HTTP path exposed via the OpenShift route |
| openShiftRoute.port | object | `{"targetPort":"http"}` | Service port configuration for the route target |
| openShiftRoute.port.targetPort | string | `"http"` | Service target port name (must exist on the eRPC service) |
| openShiftRoute.tls | object | `nil` | TLS configuration for the OpenShift route |
| openShiftRoute.to | object | `{"weight":100}` | Primary service weight configuration |
| openShiftRoute.to.weight | int | `100` | Weight assigned to the eRPC service backend |
| openShiftRoute.wildcardPolicy | string | `"None"` | Wildcard policy applied to the route |
| pdb | object | `{"enabled":false,"maxUnavailable":"","minAvailable":""}` | Pod disruption budget configuration |
| pdb.enabled | bool | `false` | If true, create a pod disruption budget for pods. |
| pdb.maxUnavailable | string | `""` | Maximum number/percentage of pods that may be made unavailable. Defaults to 1 if both pdb.minAvailable and pdb.maxUnavailable are empty. |
| pdb.minAvailable | string | `""` | Minimum number/percentage of pods that should remain scheduled |
| podAffinityPreset | string | `""` | Pod affinity preset. Ignored if `affinity` is set. Allowed values: `soft` or `hard` |
| podAnnotations | object | `{"prometheus.io/path":"/metrics","prometheus.io/port":"4001","prometheus.io/scrape":"true"}` | Annotations for eRPC pods |
| podAnnotations."prometheus.io/path" | string | `"/metrics"` | Prometheus metrics path |
| podAnnotations."prometheus.io/port" | string | `"4001"` | Prometheus metrics port |
| podAnnotations."prometheus.io/scrape" | string | `"true"` | Enable prometheus scraping |
| podAntiAffinityPreset | string | `"soft"` | Pod anti-affinity preset. Ignored if `affinity` is set. Allowed values: `soft` or `hard` |
| podLabels | object | `{"app.kubernetes.io/component":"erpc"}` | Extra labels for eRPC pods |
| podSecurityContext | object | `{}` | Pod Security Context configuration (overrides global.securityContexts.pod) |
| priorityClassName | string | `""` | eRPC pods' priority class name |
| readinessProbe | object | `{"enabled":true,"failureThreshold":3,"httpGet":{"path":"/healthcheck","port":"http"},"initialDelaySeconds":5,"periodSeconds":10,"successThreshold":1,"timeoutSeconds":5}` | Configure eRPC containers' readiness probe |
| readinessProbe.enabled | bool | `true` | Enable readinessProbe on eRPC containers |
| readinessProbe.failureThreshold | int | `3` | Failure threshold for readinessProbe |
| readinessProbe.httpGet | object | `{"path":"/healthcheck","port":"http"}` | HTTP get parameters for readinessProbe |
| readinessProbe.httpGet.path | string | `"/healthcheck"` | Path for httpGet readinessProbe |
| readinessProbe.httpGet.port | string | `"http"` | Port for httpGet readinessProbe |
| readinessProbe.initialDelaySeconds | int | `5` | Initial delay seconds for readinessProbe |
| readinessProbe.periodSeconds | int | `10` | Period seconds for readinessProbe |
| readinessProbe.successThreshold | int | `1` | Success threshold for readinessProbe |
| readinessProbe.timeoutSeconds | int | `5` | Timeout seconds for readinessProbe |
| redis | object | `{}` | Redis parameters for cache/shared state connectivity (overrides global.datastores.erpc.redis) |
| replicaCount | int | `1` | Number of eRPC replicas to deploy |
| resources | object | `{}` | eRPC containers resource requests and limits |
| runtime | object | `{"gc":{"enabled":true,"gogc":30,"gomemlimitOverride":"","gomemlimitRatio":0.85}}` | Runtime tuning for Go garbage collection and memory management |
| runtime.gc | object | `{"enabled":true,"gogc":30,"gomemlimitOverride":"","gomemlimitRatio":0.85}` | Go garbage collection tuning configuration |
| runtime.gc.enabled | bool | `true` | Enable automatic Go GC tuning based on container limits |
| runtime.gc.gogc | int | `30` | Triggers garbage collection when heap grows by this percentage |
| runtime.gc.gomemlimitOverride | string | `""` | Absolute fallback for GOMEMLIMIT (takes precedence when set, e.g. "2GiB") |
| runtime.gc.gomemlimitRatio | float | `0.85` | Fraction of the pod memory limit used to derive GOMEMLIMIT (set to 1.0 for 100%) |
| schedulerName | string | `""` | Alternate scheduler |
| service | object | `{"annotations":{},"clusterIP":"","externalTrafficPolicy":"Cluster","extraPorts":[],"loadBalancerIP":"","loadBalancerSourceRanges":[],"metricsNodePort":"","metricsPort":4001,"nodePort":"","port":4000,"sessionAffinity":"None","sessionAffinityConfig":{},"type":"ClusterIP"}` | Service parameters |
| service.annotations | object | `{}` | Additional custom annotations for eRPC service |
| service.clusterIP | string | `""` | eRPC service Cluster IP |
| service.externalTrafficPolicy | string | `"Cluster"` | eRPC service external traffic policy |
| service.extraPorts | list | `[]` | Extra ports to expose in the eRPC service (normally used with the `sidecar` value) |
| service.loadBalancerIP | string | `""` | eRPC service Load Balancer IP |
| service.loadBalancerSourceRanges | list | `[]` | eRPC service Load Balancer sources |
| service.metricsNodePort | string | `""` | Node port for metrics |
| service.metricsPort | int | `4001` | eRPC service metrics port |
| service.nodePort | string | `""` | Node port for HTTP |
| service.port | int | `4000` | eRPC service HTTP port |
| service.sessionAffinity | string | `"None"` | Session Affinity for Kubernetes service, can be "None" or "ClientIP" |
| service.sessionAffinityConfig | object | `{}` | Additional settings for the sessionAffinity |
| service.type | string | `"ClusterIP"` | eRPC service type |
| serviceAccount | object | `{"annotations":{},"automountServiceAccountToken":false,"create":true,"labels":{},"name":""}` | Service account for eRPC pods |
| serviceAccount.annotations | object | `{}` | Annotations for service account. Evaluated as a template. Only used if `create` is `true`. |
| serviceAccount.automountServiceAccountToken | bool | `false` | Automount service account token for the deployment controller service account |
| serviceAccount.create | bool | `true` | Specifies whether a ServiceAccount should be created |
| serviceAccount.labels | object | `{}` | Extra labels to be added to the service account |
| serviceAccount.name | string | `""` | The name of the ServiceAccount to use. |
| startupProbe | object | `{"enabled":false,"failureThreshold":10,"initialDelaySeconds":30,"periodSeconds":10,"successThreshold":1,"timeoutSeconds":5}` | Configure eRPC containers' startup probe |
| startupProbe.enabled | bool | `false` | Enable startupProbe on eRPC containers |
| startupProbe.failureThreshold | int | `10` | Failure threshold for startupProbe |
| startupProbe.initialDelaySeconds | int | `30` | Initial delay seconds for startupProbe |
| startupProbe.periodSeconds | int | `10` | Period seconds for startupProbe |
| startupProbe.successThreshold | int | `1` | Success threshold for startupProbe |
| startupProbe.timeoutSeconds | int | `5` | Timeout seconds for startupProbe |
| tests | object | `{"image":{"pullPolicy":"IfNotPresent","registry":"docker.io","repository":"busybox","tag":"1.37.0"}}` | Test parameters |
| tests.image | object | `{"pullPolicy":"IfNotPresent","registry":"docker.io","repository":"busybox","tag":"1.37.0"}` | Image for test pods |
| tests.image.pullPolicy | string | `"IfNotPresent"` | Test image pull policy |
| tests.image.registry | string | `"docker.io"` | Test image registry |
| tests.image.repository | string | `"busybox"` | Test image repository |
| tests.image.tag | string | `"1.37.0"` | Test image tag |
| tolerations | list | `[]` | Tolerations for pod assignment |
| topologySpreadConstraints | list | `[]` | Topology Spread Constraints for pod assignment |
| updateStrategy | object | `{"rollingUpdate":{},"type":"RollingUpdate"}` | Update strategy configuration for eRPC deployment |
| updateStrategy.rollingUpdate | object | `{}` | eRPC deployment rolling update configuration parameters |
| updateStrategy.type | string | `"RollingUpdate"` | eRPC deployment strategy type |
| workingDir | string | `"/"` | Working directory for the eRPC container |

## Configuration and installation details

### Setting up upstream providers

You can configure multiple upstream RPC providers in the `config.projects` section:

```yaml
config:
  projects:
    - id: my-project
      upstreams:
        - endpoint: http://node1:8545
        - endpoint: http://node2:8545
```

### Advanced configuration

#### Using external ConfigMap

Instead of inline configuration, you can reference an external ConfigMap:

```yaml
extraEnvVarsCM: my-erpc-config
```

#### Custom volumes and mounts

Mount additional configuration files or secrets:

```yaml
extraVolumes:
  - name: custom-config
    configMap:
      name: my-custom-config
extraVolumeMounts:
  - name: custom-config
    mountPath: /config/custom
    readOnly: true
```

### Exposing eRPC

#### LoadBalancer service

```yaml
service:
  type: LoadBalancer
  port: 4000
```

#### Ingress

```yaml
ingress:
  enabled: true
  hostname: erpc.example.com
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt
  tls: true
```

### Metrics and monitoring

eRPC exposes Prometheus metrics on port 4001 at the `/metrics` endpoint. The metrics port is configured via:

```yaml
service:
  metricsPort: 4001
```

To scrape metrics with Prometheus, the chart includes pod annotations:

```yaml
podAnnotations:
  prometheus.io/scrape: "true"
  prometheus.io/port: "4001"
  prometheus.io/path: "/metrics"
```

### Resource limits and autoscaling

Configure resource limits and requests:

```yaml
resources:
  limits:
    cpu: 100m
    memory: 128Mi
  requests:
    cpu: 100m
    memory: 128Mi
```

Enable horizontal pod autoscaling:

```yaml
autoscaling:
  enabled: true
  minReplicas: 1
  maxReplicas: 10
  builtInMetrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 80
```

### Network policies

To restrict network traffic to/from eRPC pods:

```yaml
networkPolicy:
  enabled: true
  allowExternal: false
  allowExternalEgress: false
  extraIngress:
    - from:
        - podSelector:
            matchLabels:
              app.kubernetes.io/name: my-app
      ports:
        - protocol: TCP
          port: 4000
```

## Troubleshooting

### eRPC pods are not starting

Check the pod logs:
```console
kubectl logs -l app.kubernetes.io/name=erpc
```

### Connection refused errors

Ensure your upstream endpoints are reachable from within the cluster:
```console
kubectl exec -it deploy/erpc -- curl -v http://your-upstream:8545
```

### Performance issues

Check if caching is working properly by monitoring metrics:
```console
kubectl port-forward svc/erpc 4001:4001
curl http://localhost:4001/metrics | grep erpc_cache
```

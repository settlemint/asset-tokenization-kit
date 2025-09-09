# graph-node

![Version: 0.0.1](https://img.shields.io/badge/Version-0.0.1-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: v0.39.1](https://img.shields.io/badge/AppVersion-v0.39.1-informational?style=flat-square)

A Helm chart for Graph Node

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
| chains | object | `{"settlemint":{"enabled":true,"provider":[{"details":{"features":["archive","traces"],"type":"web3","url":"http://erpc:4000/settlemint/evm/53771311147"},"label":"erpc"}],"shard":"primary"}}` | Blockchain configuration for Graph Node |
| chains.settlemint | object | `{"enabled":true,"provider":[{"details":{"features":["archive","traces"],"type":"web3","url":"http://erpc:4000/settlemint/evm/53771311147"},"label":"erpc"}],"shard":"primary"}` | Ethereum Mainnet |
| chains.settlemint.enabled | bool | `true` | Enable this configuring graph-node with this chain |
| chains.settlemint.provider[0].details.features | list | `["archive","traces"]` | Data capabilities this node has |
| chains.settlemint.provider[0].details.type | string | `"web3"` | Type of Provider: web3 |
| chains.settlemint.provider[0].details.url | string | `"http://erpc:4000/settlemint/evm/53771311147"` | URL for JSON-RPC endpoint |
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
| initContainer.image | object | `{"pullPolicy":"IfNotPresent","repository":"docker.io/kubesphere/kubectl","tag":"v1.33.4"}` | Image for init container kubectl |
| nameOverride | string | `""` |  |
| networkPolicy.egress | list | `[]` |  |
| networkPolicy.enabled | bool | `false` |  |
| networkPolicy.ingress | list | `[]` |  |
| nodeSelector | object | `{}` | Specify a [node selector](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/) |
| podAnnotations | object | `{}` | Annotations for the `Pod` |
| podDisruptionBudget.enabled | bool | `false` |  |
| podSecurityContext | object | `{"fsGroup":101337,"runAsGroup":101337,"runAsNonRoot":true,"runAsUser":101337}` | Pod-wide security context |
| postgresReadinessCheck.enabled | bool | `true` | Enable PostgreSQL readiness check init container |
| postgresReadinessCheck.image | string | `"docker.io/postgres:17.6-alpine"` | Docker image for PostgreSQL readiness check |
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

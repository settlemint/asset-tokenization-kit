# graph-node

![Version: 0.0.2](https://img.shields.io/badge/Version-0.0.2-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: v0.39.1](https://img.shields.io/badge/AppVersion-v0.39.1-informational?style=flat-square)

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
| chains | object | `{"settlemint":{"enabled":true,"provider":[{"details":{"features":["archive","traces"],"type":"web3","url":"http://erpc:4000/settlemint/evm/53771311147"},"label":"erpc"}],"shard":"primary"}}` | Blockchain configuration for Graph Node (object) |
| chains.settlemint | object | `{"enabled":true,"provider":[{"details":{"features":["archive","traces"],"type":"web3","url":"http://erpc:4000/settlemint/evm/53771311147"},"label":"erpc"}],"shard":"primary"}` | Ethereum Mainnet (string) |
| chains.settlemint.enabled | bool | `true` | Enable this configuring graph-node with this chain (bool) |
| chains.settlemint.provider[0].details.features | list | `["archive","traces"]` | Data capabilities this node has (string) |
| chains.settlemint.provider[0].details.type | string | `"web3"` | Type of Provider: web3 (string) |
| chains.settlemint.provider[0].details.url | string | `"http://erpc:4000/settlemint/evm/53771311147"` | URL for JSON-RPC endpoint (string) |
| chains.settlemint.provider[0].label | string | `"erpc"` | Label for a JSON-RPC endpoint |
| chains.settlemint.shard | string | `"primary"` | The database shard to use for this chain (string) |
| configTemplate | string | See default template in [values.yaml](values.yaml) | [Configuration for graph-node](https://github.com/graphprotocol/graph-node/blob/master/docs/config.md) |
| customSecret | object | `{}` | Custom secret data for PostgreSQL credentials (string) Used for backward compatibility and default values |
| env | object | `{"ETHEREUM_POLLING_INTERVAL":"1000","EXPERIMENTAL_SUBGRAPH_VERSION_SWITCHING_MODE":"synced","GRAPH_ALLOW_NON_DETERMINISTIC_FULLTEXT_SEARCH":"true","GRAPH_ALLOW_NON_DETERMINISTIC_IPFS":"true","GRAPH_CHAIN_HEAD_WATCHER_TIMEOUT":"5","GRAPH_DISABLE_GRAFTS":"false","GRAPH_ENABLE_PROMETHEUS_METRICS":"true","GRAPH_ETHEREUM_BLOCK_BATCH_SIZE":"100","GRAPH_ETHEREUM_BLOCK_INGESTOR_MAX_CONCURRENT_JSON_RPC_CALLS":"100","GRAPH_ETHEREUM_CLEANUP_BLOCKS":"true","GRAPH_ETHEREUM_MAX_BLOCK_RANGE_SIZE":"1000","GRAPH_ETHEREUM_REQUEST_RETRIES":"10","GRAPH_ETHEREUM_TARGET_TRIGGERS_PER_BLOCK_RANGE":"100","GRAPH_ETH_CALL_GAS":"50000000","GRAPH_GETH_ETH_CALL_ERRORS":"out of gas","GRAPH_IPFS_TIMEOUT":"30","GRAPH_KILL_IF_UNRESPONSIVE":"true","GRAPH_LOAD_BIN_SIZE":"10","GRAPH_LOAD_WINDOW_SIZE":"3600","GRAPH_LOG":"info","GRAPH_LOG_QUERY_TIMING":"gql","GRAPH_MAX_GAS_PER_HANDLER":"1_000_000_000_000_000","GRAPH_MAX_SPEC_VERSION":"1.2.0","GRAPH_PARALLEL_BLOCK_CONSTRAINTS":"true","GRAPH_POSTPONE_ATTRIBUTE_INDEX_CREATION":"true","GRAPH_PROMETHEUS_HOST":"0.0.0.0","GRAPH_QUERY_CACHE_BLOCKS":"6","GRAPH_QUERY_CACHE_MAX_MEM":"3000","GRAPH_QUERY_CACHE_STALE_PERIOD":"1000","GRAPH_STATIC_FILTERS_THRESHOLD":"10000","GRAPH_STORE_WRITE_BATCH_DURATION":"0","GRAPH_STORE_WRITE_BATCH_SIZE":"0","IPFS":"https://ipfs.console.settlemint.com","SUBGRAPH":"kit:QmbA53S3UUeoxdNQV9PGUDN7WAgFcHT6qU9FiH8QXXGv3z","node_role":"combined"}` | Environment variables (list) |
| env.IPFS | string | `"https://ipfs.console.settlemint.com"` | The URL for your IPFS node (string) |
| env.node_role | string | `"combined"` | Node role (string) |
| extraContainers | list | `[]` |  |
| extraInitContainers | list | `[]` |  |
| extraVolumeMounts | list | `[]` |  |
| extraVolumes | list | `[]` |  |
| fullnameOverride | string | `"graph-node"` | Override the full resource name. Set to "graph-node" for backward compatibility (string) with existing ATK deployments that reference "graph-node-combined" service name |
| global | object | `{"labels":{}}` | Global configuration (object) |
| global.labels | object | `{}` | Global labels to add to all resources (list) |
| image | object | `{"pullPolicy":"IfNotPresent","repository":"graphprotocol/graph-node","tag":"v0.40.2"}` | Graph Node image configuration (object) |
| image.pullPolicy | string | `"IfNotPresent"` | Graph Node image pull policy (object) |
| image.repository | string | `"graphprotocol/graph-node"` | Image for Graph Node (object) |
| image.tag | string | Chart.appVersion | Overrides the image tag (object) |
| imagePullSecrets | list | `[]` | Pull secrets required to fetch the Image (list) |
| ingress | object | `{"annotations":{"nginx.ingress.kubernetes.io/rewrite-target":"/$1","nginx.ingress.kubernetes.io/use-regex":"true"},"className":"atk-nginx","enabled":true,"hosts":[{"host":"graph.k8s.orb.local","paths":[{"path":"/(.*)","pathType":"ImplementationSpecific"},{"path":"/ws/?(.*)","pathType":"ImplementationSpecific"},{"path":"/admin/?(.*)","pathType":"ImplementationSpecific"},{"path":"/indexer/?(.*)","pathType":"ImplementationSpecific"},{"path":"/graphman/?(.*)","pathType":"ImplementationSpecific"}]}],"tls":[]}` | Ingress configuration (object) |
| ingress.annotations | object | `{"nginx.ingress.kubernetes.io/rewrite-target":"/$1","nginx.ingress.kubernetes.io/use-regex":"true"}` | Additional annotations for the Ingress resource (list) |
| ingress.className | string | `"atk-nginx"` | IngressClass that will be be used to implement the Ingress (Kubernetes 1.18+) |
| ingress.enabled | bool | `true` | Enable ingress record generation for Graph Node (bool) |
| ingress.hosts | list | `[{"host":"graph.k8s.orb.local","paths":[{"path":"/(.*)","pathType":"ImplementationSpecific"},{"path":"/ws/?(.*)","pathType":"ImplementationSpecific"},{"path":"/admin/?(.*)","pathType":"ImplementationSpecific"},{"path":"/indexer/?(.*)","pathType":"ImplementationSpecific"},{"path":"/graphman/?(.*)","pathType":"ImplementationSpecific"}]}]` | An array with hosts and paths (list) |
| ingress.tls | list | `[]` | TLS configuration for the ingress (object) |
| initContainer | object | `{"image":{"pullPolicy":"IfNotPresent","repository":"docker.io/kubesphere/kubectl","tag":"v1.33.4"},"tcpCheck":{"dependencies":[{"endpoint":"{{ .Values.env.PRIMARY_SUBGRAPH_DATA_PGHOST }}:{{ .Values.env.PRIMARY_SUBGRAPH_DATA_PGPORT }}","name":"postgresql"}],"enabled":true,"image":{"pullPolicy":"IfNotPresent","repository":"ghcr.io/settlemint/btp-waitforit","tag":"v7.7.10"},"resources":{"limits":{"cpu":"100m","memory":"64Mi"},"requests":{"cpu":"10m","memory":"32Mi"}},"timeout":120}}` | Init container configuration (object) |
| initContainer.image | object | `{"pullPolicy":"IfNotPresent","repository":"docker.io/kubesphere/kubectl","tag":"v1.33.4"}` | Image for init container kubectl (object) |
| initContainer.image.pullPolicy | string | `"IfNotPresent"` | Kubectl image pull policy (object) |
| initContainer.image.repository | string | `"docker.io/kubesphere/kubectl"` | Kubectl image repository (object) |
| initContainer.image.tag | string | `"v1.33.4"` | Kubectl image tag (object) |
| initContainer.tcpCheck | object | `{"dependencies":[{"endpoint":"{{ .Values.env.PRIMARY_SUBGRAPH_DATA_PGHOST }}:{{ .Values.env.PRIMARY_SUBGRAPH_DATA_PGPORT }}","name":"postgresql"}],"enabled":true,"image":{"pullPolicy":"IfNotPresent","repository":"ghcr.io/settlemint/btp-waitforit","tag":"v7.7.10"},"resources":{"limits":{"cpu":"100m","memory":"64Mi"},"requests":{"cpu":"10m","memory":"32Mi"}},"timeout":120}` | TCP check configuration (object) |
| initContainer.tcpCheck.dependencies | list | `[{"endpoint":"{{ .Values.env.PRIMARY_SUBGRAPH_DATA_PGHOST }}:{{ .Values.env.PRIMARY_SUBGRAPH_DATA_PGPORT }}","name":"postgresql"}]` | List of dependencies to check (list) |
| initContainer.tcpCheck.enabled | bool | `true` | Enable TCP check init container (bool) |
| initContainer.tcpCheck.image | object | `{"pullPolicy":"IfNotPresent","repository":"ghcr.io/settlemint/btp-waitforit","tag":"v7.7.10"}` | TCP check image configuration (object) |
| initContainer.tcpCheck.image.pullPolicy | string | `"IfNotPresent"` | TCP check image pull policy (object) |
| initContainer.tcpCheck.image.repository | string | `"ghcr.io/settlemint/btp-waitforit"` | TCP check image repository (object) |
| initContainer.tcpCheck.image.tag | string | `"v7.7.10"` | TCP check image tag (object) |
| initContainer.tcpCheck.resources | object | `{"limits":{"cpu":"100m","memory":"64Mi"},"requests":{"cpu":"10m","memory":"32Mi"}}` | Resource limits and requests for TCP check container (object) |
| initContainer.tcpCheck.resources.limits | object | `{"cpu":"100m","memory":"64Mi"}` | Resource limits (object) |
| initContainer.tcpCheck.resources.limits.cpu | string | `"100m"` | CPU limit (string) |
| initContainer.tcpCheck.resources.limits.memory | string | `"64Mi"` | Memory limit (string) |
| initContainer.tcpCheck.resources.requests | object | `{"cpu":"10m","memory":"32Mi"}` | Resource requests (object) |
| initContainer.tcpCheck.resources.requests.cpu | string | `"10m"` | CPU request (string) |
| initContainer.tcpCheck.resources.requests.memory | string | `"32Mi"` | Memory request (string) |
| initContainer.tcpCheck.timeout | int | `120` | Timeout in seconds for each dependency check (int) |
| nameOverride | string | `""` | String to partially override common.names.fullname template (will maintain the release name) |
| networkPolicy.egress | list | `[]` |  |
| networkPolicy.enabled | bool | `false` |  |
| networkPolicy.ingress | list | `[]` |  |
| nodeSelector | object | `{}` | Specify a [node selector](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/) |
| podAnnotations | object | `{}` | Annotations for the `Pod` (object) |
| podDisruptionBudget.enabled | bool | `false` |  |
| podSecurityContext | object | `{"fsGroup":101337,"runAsGroup":101337,"runAsNonRoot":true,"runAsUser":101337}` | Pod-wide security context (object) |
| postgresReadinessCheck.enabled | bool | `true` | Enable PostgreSQL readiness check init container (bool) |
| postgresReadinessCheck.image | string | `"docker.io/postgres:17.6-alpine"` | Docker image for PostgreSQL readiness check (object) |
| postgresReadinessCheck.initialWaitTime | int | `2` | Initial wait time between retries (doubles with exponential backoff) |
| postgresReadinessCheck.maxRetries | int | `30` | Maximum number of connection retries (int) |
| postgresReadinessCheck.maxWaitTime | int | `30` | Maximum wait time between retries (int) |
| postgresReadinessCheck.randomDelayRange | object | `{"max":30,"min":5}` | Add random delay to prevent all nodes from connecting simultaneously (int) |
| postgresReadinessCheck.resources.limits.cpu | string | `"100m"` |  |
| postgresReadinessCheck.resources.limits.memory | string | `"96Mi"` |  |
| postgresReadinessCheck.resources.requests.cpu | string | `"25m"` |  |
| postgresReadinessCheck.resources.requests.memory | string | `"48Mi"` |  |
| rbac | object | `{"create":false,"rules":[]}` | RBAC configuration (object) |
| rbac.create | bool | `false` | Specifies whether RBAC resources are to be created (bool) |
| replicaCount | int | `1` | Number of Graph Node replicas to deploy (int) |
| resources | object | `{}` | Specify [resource requests and limits](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/#requests-and-limits) |
| secretEnv | object | `{"PRIMARY_SUBGRAPH_DATA_PGPASSWORD":{"key":"PGPASSWORD","secretName":""},"PRIMARY_SUBGRAPH_DATA_PGUSER":{"key":"PGUSER","secretName":""}}` | Environment variables from secrets (list) |
| secretEnv.PRIMARY_SUBGRAPH_DATA_PGPASSWORD.key | string | `"PGPASSWORD"` | Name of the data key in the secret that contains your PG password (string) |
| secretEnv.PRIMARY_SUBGRAPH_DATA_PGPASSWORD.secretName | string | `""` | Name of the secret that contains your PG password (uses graph-node.pgSecretName helper) |
| secretEnv.PRIMARY_SUBGRAPH_DATA_PGUSER.key | string | `"PGUSER"` | Name of the data key in the secret that contains your PG username (string) |
| secretEnv.PRIMARY_SUBGRAPH_DATA_PGUSER.secretName | string | `""` | Name of the secret that contains your PG username (uses graph-node.pgSecretName helper) |
| service | object | `{"ports":{"httpAdmin":8020,"httpMetrics":8040,"httpQuery":8000,"httpQueryws":8001,"httpStatus":8030},"type":"ClusterIP"}` | Service configuration (object) |
| service.ports | object | `{"httpAdmin":8020,"httpMetrics":8040,"httpQuery":8000,"httpQueryws":8001,"httpStatus":8030}` | Service ports configuration (int) |
| service.ports.httpAdmin | int | `8020` | Service Port to expose Graph Node Admin endpoint on (int) |
| service.ports.httpMetrics | int | `8040` | Service Port to expose Graph Node Metrics endpoint on (int) |
| service.ports.httpQuery | int | `8000` | Service Port to expose Graph Node Query endpoint on (int) |
| service.ports.httpQueryws | int | `8001` | Service Port to expose Graph Node Websocket Query endpoint on (int) |
| service.ports.httpStatus | int | `8030` | Service Port to expose Graph Node Status endpoint on (int) |
| service.type | string | `"ClusterIP"` | Service type (object) |
| serviceAccount | object | `{"annotations":{},"create":true,"name":""}` | Service account configuration (int) |
| serviceAccount.annotations | object | `{}` | Annotations to add to the service account (int) |
| serviceAccount.create | bool | `true` | Specifies whether a service account should be created (bool) |
| serviceAccount.name | string | `""` | The name of the service account to use. (int) If not set and create is true, a name is generated using the fullname template |
| store | object | `{"primary":{"connection":"postgresql://${PRIMARY_SUBGRAPH_DATA_PGUSER}:${PRIMARY_SUBGRAPH_DATA_PGPASSWORD}@${PRIMARY_SUBGRAPH_DATA_PGHOST}:${PRIMARY_SUBGRAPH_DATA_PGPORT}/${PRIMARY_SUBGRAPH_DATA_PGDATABASE}","enabled":true}}` | Store configuration for Graph Node (object) |
| store.primary.connection | string | `"postgresql://${PRIMARY_SUBGRAPH_DATA_PGUSER}:${PRIMARY_SUBGRAPH_DATA_PGPASSWORD}@${PRIMARY_SUBGRAPH_DATA_PGHOST}:${PRIMARY_SUBGRAPH_DATA_PGPORT}/${PRIMARY_SUBGRAPH_DATA_PGDATABASE}"` | PostgreSQL connection string for primary shard (string) |
| store.primary.enabled | bool | `true` | Enable this store for Graph Node (bool) |
| terminationGracePeriodSeconds | int | `60` |  |
| tolerations | list | `[]` | Specify [tolerations](https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/) |

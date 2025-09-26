# graph-node

![Version: 2.0.0-alpha.15](https://img.shields.io/badge/Version-2.0.0--alpha.15-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: 2.0.0-alpha.15](https://img.shields.io/badge/AppVersion-2.0.0--alpha.15-informational?style=flat-square)

A Helm chart for Graph Node

## Maintainers

| Name | Email | Url |
| ---- | ------ | --- |
| SettleMint | <support@settlemint.com> | <https://settlemint.com> |

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| autoscaling | object | `{"enabled":false,"maxReplicas":100,"minReplicas":1,"targetCPUUtilizationPercentage":80}` | Autoscaling |
| autoscaling.enabled | bool | `false` | Enable autoscaling |
| autoscaling.maxReplicas | int | `100` | Maximum number of replicas |
| autoscaling.minReplicas | int | `1` | Minimum number of replicas |
| autoscaling.targetCPUUtilizationPercentage | int | `80` | Target CPU utilization percentage |
| chains | object | `{"settlemint":{"enabled":true,"provider":[{"details":{"features":["archive","traces"],"type":"web3","url":"http://erpc:4000/settlemint/evm/53771311147"},"label":"erpc"}],"shard":"primary"}}` | Blockchain configuration for Graph Node |
| chains.settlemint | object | `{"enabled":true,"provider":[{"details":{"features":["archive","traces"],"type":"web3","url":"http://erpc:4000/settlemint/evm/53771311147"},"label":"erpc"}],"shard":"primary"}` | Ethereum Mainnet |
| chains.settlemint.enabled | bool | `true` | Enable this configuring graph-node with this chain |
| chains.settlemint.provider[0].details.features | list | `["archive","traces"]` | Data capabilities this node has |
| chains.settlemint.provider[0].details.type | string | `"web3"` | Type of Provider: web3 |
| chains.settlemint.provider[0].details.url | string | `"http://erpc:4000/settlemint/evm/53771311147"` | URL for JSON-RPC endpoint |
| chains.settlemint.provider[0].label | string | `"erpc"` | Label for a JSON-RPC endpoint |
| chains.settlemint.shard | string | `"primary"` | The database shard to use for this chain |
| configTemplate | string | See default template in [values.yaml](values.yaml) | [Configuration for graph-node](https://github.com/graphprotocol/graph-node/blob/master/docs/config.md) |
| containerSecurityContext | object | `{}` | Container-level security context overrides |
| customSecret | object | `{}` | Custom secret data for PostgreSQL credentials Used for backward compatibility and default values |
| env | object | `{"ETHEREUM_POLLING_INTERVAL":"1000","EXPERIMENTAL_SUBGRAPH_VERSION_SWITCHING_MODE":"synced","GRAPH_ALLOW_NON_DETERMINISTIC_FULLTEXT_SEARCH":"true","GRAPH_ALLOW_NON_DETERMINISTIC_IPFS":"true","GRAPH_CHAIN_HEAD_WATCHER_TIMEOUT":"5","GRAPH_DISABLE_GRAFTS":"false","GRAPH_ENABLE_PROMETHEUS_METRICS":"true","GRAPH_ETHEREUM_BLOCK_BATCH_SIZE":"100","GRAPH_ETHEREUM_BLOCK_INGESTOR_MAX_CONCURRENT_JSON_RPC_CALLS":"100","GRAPH_ETHEREUM_CLEANUP_BLOCKS":"true","GRAPH_ETHEREUM_MAX_BLOCK_RANGE_SIZE":"1000","GRAPH_ETHEREUM_REQUEST_RETRIES":"10","GRAPH_ETHEREUM_TARGET_TRIGGERS_PER_BLOCK_RANGE":"100","GRAPH_ETH_CALL_GAS":"50000000","GRAPH_GETH_ETH_CALL_ERRORS":"out of gas","GRAPH_IPFS_TIMEOUT":"30","GRAPH_KILL_IF_UNRESPONSIVE":"true","GRAPH_LOAD_BIN_SIZE":"10","GRAPH_LOAD_WINDOW_SIZE":"3600","GRAPH_LOG":"info","GRAPH_LOG_QUERY_TIMING":"gql","GRAPH_MAX_GAS_PER_HANDLER":"1_000_000_000_000_000","GRAPH_MAX_SPEC_VERSION":"1.2.0","GRAPH_PARALLEL_BLOCK_CONSTRAINTS":"true","GRAPH_POSTPONE_ATTRIBUTE_INDEX_CREATION":"true","GRAPH_PROMETHEUS_HOST":"0.0.0.0","GRAPH_QUERY_CACHE_BLOCKS":"6","GRAPH_QUERY_CACHE_MAX_MEM":"3000","GRAPH_QUERY_CACHE_STALE_PERIOD":"1000","GRAPH_STATIC_FILTERS_THRESHOLD":"10000","GRAPH_STORE_WRITE_BATCH_DURATION":"0","GRAPH_STORE_WRITE_BATCH_SIZE":"0","IPFS":"https://ipfs.console.settlemint.com","node_role":"combined"}` | Environment variables |
| env.IPFS | string | `"https://ipfs.console.settlemint.com"` | The URL for your IPFS node |
| env.node_role | string | `"combined"` | Node role |
| extraContainers | list | `[]` | Additional containers |
| extraInitContainers | list | `[]` | Additional init containers |
| extraVolumeMounts | list | `[]` | Additional volume mounts |
| extraVolumes | list | `[]` | Additional volumes |
| fullnameOverride | string | `"graph-node"` | Override the full resource name. Set to "graph-node" for backward compatibility with existing ATK deployments that reference "graph-node-combined" service name |
| global | object | `{"artifacts":{"image":{"pullPolicy":"IfNotPresent","registry":"harbor.settlemint.com/ghcr.io","repository":"settlemint/asset-tokenization-kit-artifacts","tag":""}},"labels":{"kots.io/app-slug":"settlemint-atk"}}` | Global configuration |
| graph-node.graphNodeDefaults.subgraph.configMapName | string | `"besu-subgraph"` |  |
| image | object | `{"pullPolicy":"IfNotPresent","repository":"harbor.settlemint.com/docker.io/graphprotocol/graph-node","tag":"v0.40.2"}` | Graph Node image configuration |
| image.pullPolicy | string | `"IfNotPresent"` | Graph Node image pull policy |
| image.repository | string | `"harbor.settlemint.com/docker.io/graphprotocol/graph-node"` | Image for Graph Node |
| image.tag | string | Chart.appVersion | Overrides the image tag |
| imagePullSecrets | list | `[]` | Pull secrets required to fetch the Image |
| ingress | object | `{"annotations":{"nginx.ingress.kubernetes.io/rewrite-target":"/$1","nginx.ingress.kubernetes.io/use-regex":"true"},"className":"atk-nginx","enabled":true,"hosts":[{"host":"graph.k8s.orb.local","paths":[{"path":"/(.*)","pathType":"ImplementationSpecific"},{"path":"/ws/?(.*)","pathType":"ImplementationSpecific"},{"path":"/admin/?(.*)","pathType":"ImplementationSpecific"},{"path":"/indexer/?(.*)","pathType":"ImplementationSpecific"},{"path":"/graphman/?(.*)","pathType":"ImplementationSpecific"}]}],"tls":[]}` | Ingress configuration |
| ingress.annotations | object | `{"nginx.ingress.kubernetes.io/rewrite-target":"/$1","nginx.ingress.kubernetes.io/use-regex":"true"}` | Additional annotations for the Ingress resource |
| ingress.className | string | `"atk-nginx"` | IngressClass that will be be used to implement the Ingress (Kubernetes 1.18+) |
| ingress.enabled | bool | `true` | Enable ingress record generation for Graph Node |
| ingress.hosts | list | `[{"host":"graph.k8s.orb.local","paths":[{"path":"/(.*)","pathType":"ImplementationSpecific"},{"path":"/ws/?(.*)","pathType":"ImplementationSpecific"},{"path":"/admin/?(.*)","pathType":"ImplementationSpecific"},{"path":"/indexer/?(.*)","pathType":"ImplementationSpecific"},{"path":"/graphman/?(.*)","pathType":"ImplementationSpecific"}]}]` | An array with hosts and paths |
| ingress.tls | list | `[]` | TLS configuration for the ingress |
| initContainer | object | `{"image":{"pullPolicy":"IfNotPresent","repository":"harbor.settlemint.com/docker.io/kubesphere/kubectl","tag":"v1.33.4"},"tcpCheck":{"dependencies":[{"endpoint":"{{ include \"atk.postgresql.endpoint\" (dict \"context\" $ \"chartKey\" \"graphNode\" \"local\" .Values.postgresql) }}","name":"postgresql"}],"enabled":true,"image":{"pullPolicy":"IfNotPresent","repository":"harbor.settlemint.com/ghcr.io/settlemint/btp-waitforit","tag":"v7.7.10"},"resources":{"limits":{"cpu":"100m","memory":"64Mi"},"requests":{"cpu":"10m","memory":"32Mi"}},"timeout":120}}` | Init container configuration |
| initContainer.image | object | `{"pullPolicy":"IfNotPresent","repository":"harbor.settlemint.com/docker.io/kubesphere/kubectl","tag":"v1.33.4"}` | Image for init container kubectl |
| initContainer.image.pullPolicy | string | `"IfNotPresent"` | Kubectl image pull policy |
| initContainer.image.repository | string | `"harbor.settlemint.com/docker.io/kubesphere/kubectl"` | Kubectl image repository |
| initContainer.image.tag | string | `"v1.33.4"` | Kubectl image tag |
| initContainer.tcpCheck | object | `{"dependencies":[{"endpoint":"{{ include \"atk.postgresql.endpoint\" (dict \"context\" $ \"chartKey\" \"graphNode\" \"local\" .Values.postgresql) }}","name":"postgresql"}],"enabled":true,"image":{"pullPolicy":"IfNotPresent","repository":"harbor.settlemint.com/ghcr.io/settlemint/btp-waitforit","tag":"v7.7.10"},"resources":{"limits":{"cpu":"100m","memory":"64Mi"},"requests":{"cpu":"10m","memory":"32Mi"}},"timeout":120}` | TCP check configuration |
| initContainer.tcpCheck.dependencies | list | `[{"endpoint":"{{ include \"atk.postgresql.endpoint\" (dict \"context\" $ \"chartKey\" \"graphNode\" \"local\" .Values.postgresql) }}","name":"postgresql"}]` | List of dependencies to check |
| initContainer.tcpCheck.enabled | bool | `true` | Enable TCP check init container |
| initContainer.tcpCheck.image | object | `{"pullPolicy":"IfNotPresent","repository":"harbor.settlemint.com/ghcr.io/settlemint/btp-waitforit","tag":"v7.7.10"}` | TCP check image configuration |
| initContainer.tcpCheck.image.pullPolicy | string | `"IfNotPresent"` | TCP check image pull policy |
| initContainer.tcpCheck.image.repository | string | `"harbor.settlemint.com/ghcr.io/settlemint/btp-waitforit"` | TCP check image repository |
| initContainer.tcpCheck.image.tag | string | `"v7.7.10"` | TCP check image tag |
| initContainer.tcpCheck.resources | object | `{"limits":{"cpu":"100m","memory":"64Mi"},"requests":{"cpu":"10m","memory":"32Mi"}}` | Resource limits and requests for TCP check container |
| initContainer.tcpCheck.resources.limits | object | `{"cpu":"100m","memory":"64Mi"}` | Resource limits |
| initContainer.tcpCheck.resources.limits.cpu | string | `"100m"` | CPU limit |
| initContainer.tcpCheck.resources.limits.memory | string | `"64Mi"` | Memory limit |
| initContainer.tcpCheck.resources.requests | object | `{"cpu":"10m","memory":"32Mi"}` | Resource requests |
| initContainer.tcpCheck.resources.requests.cpu | string | `"10m"` | CPU request |
| initContainer.tcpCheck.resources.requests.memory | string | `"32Mi"` | Memory request |
| initContainer.tcpCheck.timeout | int | `120` | Timeout in seconds for each dependency check |
| nameOverride | string | `""` | String to partially override common.names.fullname template (will maintain the release name) |
| networkPolicy | object | `{"egress":[],"enabled":false,"ingress":[]}` | Network policies |
| networkPolicy.egress | list | `[]` | Egress rules for network policy |
| networkPolicy.enabled | bool | `false` | Enable network policies |
| networkPolicy.ingress | list | `[]` | Ingress rules for network policy |
| nodeSelector | object | `{}` | Specify a [node selector](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/) |
| openShiftRoute | object | `{"alternateBackends":[],"annotations":{},"enabled":false,"host":"graph.k8s.orb.local","routes":[{"annotations":{},"host":"","nameSuffix":"","path":"/","targetPort":"http-query"},{"annotations":{"haproxy.router.openshift.io/rewrite-target":"/"},"host":"","nameSuffix":"ws","path":"/ws","targetPort":"http-queryws"},{"annotations":{"haproxy.router.openshift.io/rewrite-target":"/"},"host":"","nameSuffix":"admin","path":"/admin","targetPort":"http-admin"},{"annotations":{"haproxy.router.openshift.io/rewrite-target":"/"},"host":"","nameSuffix":"indexer","path":"/indexer","targetPort":"http-status"},{"annotations":{"haproxy.router.openshift.io/rewrite-target":"/"},"host":"","nameSuffix":"graphman","path":"/graphman","targetPort":"http-status"}],"tls":null,"to":{"weight":100},"wildcardPolicy":"None"}` | OpenShift Route parameters |
| openShiftRoute.alternateBackends | list | `[]` | Additional service backends shared by the generated routes |
| openShiftRoute.annotations | object | `{}` | Additional annotations applied to every generated route |
| openShiftRoute.enabled | bool | `false` | Enable OpenShift route creation for Graph Node endpoints |
| openShiftRoute.host | string | `"graph.k8s.orb.local"` | Hostname exposed via the OpenShift routes |
| openShiftRoute.routes | list | `[{"annotations":{},"host":"","nameSuffix":"","path":"/","targetPort":"http-query"},{"annotations":{"haproxy.router.openshift.io/rewrite-target":"/"},"host":"","nameSuffix":"ws","path":"/ws","targetPort":"http-queryws"},{"annotations":{"haproxy.router.openshift.io/rewrite-target":"/"},"host":"","nameSuffix":"admin","path":"/admin","targetPort":"http-admin"},{"annotations":{"haproxy.router.openshift.io/rewrite-target":"/"},"host":"","nameSuffix":"indexer","path":"/indexer","targetPort":"http-status"},{"annotations":{"haproxy.router.openshift.io/rewrite-target":"/"},"host":"","nameSuffix":"graphman","path":"/graphman","targetPort":"http-status"}]` | Route definitions for the exposed Graph Node endpoints |
| openShiftRoute.tls | string | `nil` | TLS configuration shared by the generated routes |
| openShiftRoute.to | object | `{"weight":100}` | Primary service weight configuration used when routes omit a weight |
| openShiftRoute.wildcardPolicy | string | `"None"` | Wildcard policy applied when individual routes do not override it |
| podAnnotations | object | `{"prometheus.io/path":"/metrics","prometheus.io/port":"8040","prometheus.io/scrape":"true"}` | Annotations for the `Pod` |
| podDisruptionBudget | object | `{"enabled":false}` | Pod disruption budget |
| podDisruptionBudget.enabled | bool | `false` | Enable pod disruption budget |
| podSecurityContext | object | `{}` | Pod-wide security context |
| postgresReadinessCheck | object | `{"enabled":true,"image":"harbor.settlemint.com/docker.io/postgres:18.0-alpine","initialWaitTime":2,"maxRetries":30,"maxWaitTime":30,"randomDelayRange":{"max":30,"min":5},"resources":{"limits":{"cpu":"100m","memory":"96Mi"},"requests":{"cpu":"25m","memory":"48Mi"}}}` | PostgreSQL readiness check configuration |
| postgresReadinessCheck.enabled | bool | `true` | Enable PostgreSQL readiness check init container |
| postgresReadinessCheck.image | string | `"harbor.settlemint.com/docker.io/postgres:18.0-alpine"` | Docker image for PostgreSQL readiness check |
| postgresReadinessCheck.initialWaitTime | int | `2` | Initial wait time between retries (doubles with exponential backoff) |
| postgresReadinessCheck.maxRetries | int | `30` | Maximum number of connection retries |
| postgresReadinessCheck.maxWaitTime | int | `30` | Maximum wait time between retries |
| postgresReadinessCheck.randomDelayRange | object | `{"max":30,"min":5}` | Add random delay to prevent all nodes from connecting simultaneously |
| postgresql | object | `{}` | PostgreSQL overrides merged with global.datastores.graphNode.postgresql |
| rbac | object | `{"create":false,"rules":[]}` | RBAC configuration |
| rbac.create | bool | `false` | Specifies whether RBAC resources are to be created |
| replicaCount | int | `1` | Number of Graph Node replicas to deploy |
| resources | object | `{}` | Specify [resource requests and limits](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/#requests-and-limits) |
| secretEnv | object | `{"PRIMARY_SUBGRAPH_DATA_PGPASSWORD":{"key":"PGPASSWORD","secretName":""},"PRIMARY_SUBGRAPH_DATA_PGUSER":{"key":"PGUSER","secretName":""}}` | Environment variables from secrets |
| secretEnv.PRIMARY_SUBGRAPH_DATA_PGPASSWORD.key | string | `"PGPASSWORD"` | Name of the data key in the secret that contains your PG password |
| secretEnv.PRIMARY_SUBGRAPH_DATA_PGPASSWORD.secretName | string | `""` | Name of the secret that contains your PG password (uses graph-node.pgSecretName helper) |
| secretEnv.PRIMARY_SUBGRAPH_DATA_PGUSER.key | string | `"PGUSER"` | Name of the data key in the secret that contains your PG username |
| secretEnv.PRIMARY_SUBGRAPH_DATA_PGUSER.secretName | string | `""` | Name of the secret that contains your PG username (uses graph-node.pgSecretName helper) |
| service | object | `{"ports":{"httpAdmin":8020,"httpMetrics":8040,"httpQuery":8000,"httpQueryws":8001,"httpStatus":8030},"type":"ClusterIP"}` | Service configuration |
| service.ports | object | `{"httpAdmin":8020,"httpMetrics":8040,"httpQuery":8000,"httpQueryws":8001,"httpStatus":8030}` | Service ports configuration |
| service.ports.httpAdmin | int | `8020` | Service Port to expose Graph Node Admin endpoint on |
| service.ports.httpMetrics | int | `8040` | Service Port to expose Graph Node Metrics endpoint on |
| service.ports.httpQuery | int | `8000` | Service Port to expose Graph Node Query endpoint on |
| service.ports.httpQueryws | int | `8001` | Service Port to expose Graph Node Websocket Query endpoint on |
| service.ports.httpStatus | int | `8030` | Service Port to expose Graph Node Status endpoint on |
| service.type | string | `"ClusterIP"` | Service type |
| serviceAccount | object | `{"annotations":{},"create":true,"name":""}` | Service account configuration |
| serviceAccount.annotations | object | `{}` | Annotations to add to the service account |
| serviceAccount.create | bool | `true` | Specifies whether a service account should be created |
| serviceAccount.name | string | `""` | The name of the service account to use. If not set and create is true, a name is generated using the fullname template |
| store | object | `{"primary":{"connection":"postgresql://${PRIMARY_SUBGRAPH_DATA_PGUSER}:${PRIMARY_SUBGRAPH_DATA_PGPASSWORD}@${PRIMARY_SUBGRAPH_DATA_PGHOST}:${PRIMARY_SUBGRAPH_DATA_PGPORT}/${PRIMARY_SUBGRAPH_DATA_PGDATABASE}","enabled":true}}` | Store configuration for Graph Node |
| store.primary.connection | string | `"postgresql://${PRIMARY_SUBGRAPH_DATA_PGUSER}:${PRIMARY_SUBGRAPH_DATA_PGPASSWORD}@${PRIMARY_SUBGRAPH_DATA_PGHOST}:${PRIMARY_SUBGRAPH_DATA_PGPORT}/${PRIMARY_SUBGRAPH_DATA_PGDATABASE}"` | PostgreSQL connection string for primary shard |
| store.primary.enabled | bool | `true` | Enable this store for Graph Node |
| subgraph | object | `{"configMapName":"besu-subgraph"}` | Subgraph configuration shared with the bootstrap process |
| subgraph.configMapName | string | `"besu-subgraph"` | ConfigMap providing the deployed subgraph hash |
| terminationGracePeriodSeconds | int | `60` | Termination grace period seconds |
| tolerations | list | `[]` | Specify [tolerations](https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/) |

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
| chains.settlemint | object | `{"enabled":true,"provider":[{"details":{"features":["archive","traces"],"type":"web3","url":"http://erpc:4000/settlemint/evm/53771311147"},"label":"erpc"}],"shard":"primary"}` | SettleMint blockchain configuration |
| chains.settlemint.enabled | bool | `true` | Enable this configuring graph-node with this chain |
| chains.settlemint.provider | list | `[{"details":{"features":["archive","traces"],"type":"web3","url":"http://erpc:4000/settlemint/evm/53771311147"},"label":"erpc"}]` | A list of JSON-RPC endpoints for this node (you should override this list with your own configuration) |
| chains.settlemint.provider[0] | object | `{"details":{"features":["archive","traces"],"type":"web3","url":"http://erpc:4000/settlemint/evm/53771311147"},"label":"erpc"}` | JSON-RPC provider configuration |
| chains.settlemint.provider[0].details | object | `{"features":["archive","traces"],"type":"web3","url":"http://erpc:4000/settlemint/evm/53771311147"}` | Provider connection details |
| chains.settlemint.provider[0].details.features | list | `["archive","traces"]` | Data capabilities this node has |
| chains.settlemint.provider[0].details.type | string | `"web3"` | Type of Provider: web3 |
| chains.settlemint.provider[0].details.url | string | `"http://erpc:4000/settlemint/evm/53771311147"` | URL for JSON-RPC endpoint |
| chains.settlemint.provider[0].label | string | `"erpc"` | Label for a JSON-RPC endpoint |
| chains.settlemint.shard | string | `"primary"` | The database shard to use for this chain |
| configTemplate | string | `"# Store configuration\n[store]\n{{- range $storeName, $storeValues := $.Values.store }}\n{{- if $storeValues.enabled }}\n  [store.{{ $storeName }}]\n  connection = {{ required \"You must specify a store connection string\" $storeValues.connection | quote }}\n  pool_size = {{ default 10 $storeValues.poolSize }}\n  weight = {{ default 1 $storeValues.weight }}\n{{- end }}\n{{- end }}\n\n# Chain configuration\n{{- $patchedChains := dict \"ingestor\" (print (include \"graph-node.fullname\" $) \"-combined-\" 0) }}\n{{- range $chainName, $chainValues := $.Values.chains }}\n{{- if $chainValues.enabled }}\n  {{- $_ := set $patchedChains $chainName (omit $chainValues \"enabled\") }}\n{{- end }}\n{{- end }}\n{{ toToml (dict \"chains\" $patchedChains) }}\n\n# Deployment rule configuration\n[deployment]\n# Deployment rules match top to bottom\n[[deployment.rule]]\n# DEFAULT RULE\n# There's no 'match' field, so any subgraph that hasn't matched above, matches this rule\nshards = [\"primary\"]\nindexers = [\"{{ include \"graph-node.fullname\" $ }}-combined-0\"]\n"` | Configuration for graph-node. See [graph-node config docs](https://github.com/graphprotocol/graph-node/blob/master/docs/config.md) and default template in values.yaml |
| containerSecurityContext | object | `{}` | Container-level security context overrides |
| customSecret | object | `{}` | Custom secret data for PostgreSQL credentials. Used for backward compatibility and default values |
| env | object | `{"ETHEREUM_POLLING_INTERVAL":"1000","EXPERIMENTAL_SUBGRAPH_VERSION_SWITCHING_MODE":"synced","GRAPH_ALLOW_NON_DETERMINISTIC_FULLTEXT_SEARCH":"true","GRAPH_ALLOW_NON_DETERMINISTIC_IPFS":"true","GRAPH_CHAIN_HEAD_WATCHER_TIMEOUT":"5","GRAPH_DISABLE_GRAFTS":"false","GRAPH_ENABLE_PROMETHEUS_METRICS":"true","GRAPH_ETHEREUM_BLOCK_BATCH_SIZE":"100","GRAPH_ETHEREUM_BLOCK_INGESTOR_MAX_CONCURRENT_JSON_RPC_CALLS":"100","GRAPH_ETHEREUM_CLEANUP_BLOCKS":"true","GRAPH_ETHEREUM_MAX_BLOCK_RANGE_SIZE":"1000","GRAPH_ETHEREUM_REQUEST_RETRIES":"10","GRAPH_ETHEREUM_TARGET_TRIGGERS_PER_BLOCK_RANGE":"100","GRAPH_ETH_CALL_GAS":"50000000","GRAPH_GETH_ETH_CALL_ERRORS":"out of gas","GRAPH_IPFS_TIMEOUT":"30","GRAPH_KILL_IF_UNRESPONSIVE":"true","GRAPH_LOAD_BIN_SIZE":"10","GRAPH_LOAD_WINDOW_SIZE":"3600","GRAPH_LOG":"info","GRAPH_LOG_QUERY_TIMING":"gql","GRAPH_MAX_GAS_PER_HANDLER":"1_000_000_000_000_000","GRAPH_MAX_SPEC_VERSION":"1.2.0","GRAPH_PARALLEL_BLOCK_CONSTRAINTS":"true","GRAPH_POSTPONE_ATTRIBUTE_INDEX_CREATION":"true","GRAPH_PROMETHEUS_HOST":"0.0.0.0","GRAPH_QUERY_CACHE_BLOCKS":"6","GRAPH_QUERY_CACHE_MAX_MEM":"3000","GRAPH_QUERY_CACHE_STALE_PERIOD":"1000","GRAPH_STATIC_FILTERS_THRESHOLD":"10000","GRAPH_STORE_WRITE_BATCH_DURATION":"0","GRAPH_STORE_WRITE_BATCH_SIZE":"0","IPFS":"https://ipfs.console.settlemint.com","node_role":"combined"}` | Environment variables |
| env.ETHEREUM_POLLING_INTERVAL | string | `"1000"` | Ethereum polling interval in milliseconds |
| env.EXPERIMENTAL_SUBGRAPH_VERSION_SWITCHING_MODE | string | `"synced"` | Experimental subgraph version switching mode |
| env.GRAPH_ALLOW_NON_DETERMINISTIC_FULLTEXT_SEARCH | string | `"true"` | Allow non-deterministic fulltext search operations |
| env.GRAPH_ALLOW_NON_DETERMINISTIC_IPFS | string | `"true"` | Allow non-deterministic IPFS operations |
| env.GRAPH_CHAIN_HEAD_WATCHER_TIMEOUT | string | `"5"` | Timeout in seconds for chain head watcher |
| env.GRAPH_DISABLE_GRAFTS | string | `"false"` | Disable subgraph grafting feature |
| env.GRAPH_ENABLE_PROMETHEUS_METRICS | string | `"true"` | Enable Prometheus metrics endpoint |
| env.GRAPH_ETHEREUM_BLOCK_BATCH_SIZE | string | `"100"` | Number of blocks to fetch in a single batch |
| env.GRAPH_ETHEREUM_BLOCK_INGESTOR_MAX_CONCURRENT_JSON_RPC_CALLS | string | `"100"` | Maximum concurrent JSON-RPC calls for block ingestor |
| env.GRAPH_ETHEREUM_CLEANUP_BLOCKS | string | `"true"` | Clean up old Ethereum blocks from the database |
| env.GRAPH_ETHEREUM_MAX_BLOCK_RANGE_SIZE | string | `"1000"` | Maximum block range size for queries |
| env.GRAPH_ETHEREUM_REQUEST_RETRIES | string | `"10"` | Number of retries for failed Ethereum requests |
| env.GRAPH_ETHEREUM_TARGET_TRIGGERS_PER_BLOCK_RANGE | string | `"100"` | Target number of triggers per block range |
| env.GRAPH_ETH_CALL_GAS | string | `"50000000"` | Maximum gas for eth_call operations |
| env.GRAPH_GETH_ETH_CALL_ERRORS | string | `"out of gas"` | Error patterns that indicate out of gas conditions |
| env.GRAPH_IPFS_TIMEOUT | string | `"30"` | Timeout in seconds for IPFS operations |
| env.GRAPH_KILL_IF_UNRESPONSIVE | string | `"true"` | Kill the node if it becomes unresponsive |
| env.GRAPH_LOAD_BIN_SIZE | string | `"10"` | Bin size for load distribution |
| env.GRAPH_LOAD_WINDOW_SIZE | string | `"3600"` | Load window size in seconds for block ingestion |
| env.GRAPH_LOG | string | `"info"` | Log level (trace, debug, info, warn, error) |
| env.GRAPH_LOG_QUERY_TIMING | string | `"gql"` | Log GraphQL query timing information |
| env.GRAPH_MAX_GAS_PER_HANDLER | string | `"1_000_000_000_000_000"` | Maximum gas allowed per handler execution |
| env.GRAPH_MAX_SPEC_VERSION | string | `"1.2.0"` | Maximum subgraph spec version supported |
| env.GRAPH_PARALLEL_BLOCK_CONSTRAINTS | string | `"true"` | Use parallel block constraints for better performance |
| env.GRAPH_POSTPONE_ATTRIBUTE_INDEX_CREATION | string | `"true"` | Postpone attribute index creation until after data loading |
| env.GRAPH_PROMETHEUS_HOST | string | `"0.0.0.0"` | Host address for Prometheus metrics server |
| env.GRAPH_QUERY_CACHE_BLOCKS | string | `"6"` | Number of blocks to cache queries for |
| env.GRAPH_QUERY_CACHE_MAX_MEM | string | `"3000"` | Maximum memory for query cache in megabytes |
| env.GRAPH_QUERY_CACHE_STALE_PERIOD | string | `"1000"` | Time period in milliseconds before cached queries become stale |
| env.GRAPH_STATIC_FILTERS_THRESHOLD | string | `"10000"` | Threshold for using static filters optimization |
| env.GRAPH_STORE_WRITE_BATCH_DURATION | string | `"0"` | Duration in milliseconds to batch store writes (0 = disabled) |
| env.GRAPH_STORE_WRITE_BATCH_SIZE | string | `"0"` | Number of operations to batch in store writes (0 = disabled) |
| env.IPFS | string | `"https://ipfs.console.settlemint.com"` | The URL for your IPFS node |
| env.node_role | string | `"combined"` | Node role |
| extraContainers | list | `[]` | Additional containers |
| extraInitContainers | list | `[]` | Additional init containers |
| extraVolumeMounts | list | `[]` | Additional volume mounts |
| extraVolumes | list | `[]` | Additional volumes |
| fullnameOverride | string | `"graph-node"` | Override the full resource name. Set to "graph-node" for backward compatibility with existing ATK deployments that reference "graph-node-combined" service name |
| global | object | `{"artifacts":{"image":{"pullPolicy":"IfNotPresent","registry":"ghcr.io","repository":"settlemint/asset-tokenization-kit-artifacts","tag":""}},"labels":{"kots.io/app-slug":"settlemint-atk"}}` | Global configuration |
| global.artifacts | object | `{"image":{"pullPolicy":"IfNotPresent","registry":"ghcr.io","repository":"settlemint/asset-tokenization-kit-artifacts","tag":""}}` | Artifacts configuration for contract ABIs and genesis files |
| global.artifacts.image | object | `{"pullPolicy":"IfNotPresent","registry":"ghcr.io","repository":"settlemint/asset-tokenization-kit-artifacts","tag":""}` | Image containing contract ABIs and genesis files |
| global.artifacts.image.pullPolicy | string | `"IfNotPresent"` | Image pull policy |
| global.artifacts.image.registry | string | `"ghcr.io"` | Image registry |
| global.artifacts.image.repository | string | `"settlemint/asset-tokenization-kit-artifacts"` | Image repository |
| global.artifacts.image.tag | string | `""` | Image tag (empty string uses Chart.appVersion) |
| global.labels | object | `{"kots.io/app-slug":"settlemint-atk"}` | Labels applied to all resources |
| global.labels."kots.io/app-slug" | string | `"settlemint-atk"` | KOTS application slug for Replicated |
| graph-node | object | `{"graphNodeDefaults":{"subgraph":{"configMapName":"besu-subgraph"}}}` | Graph Node defaults configuration |
| graph-node.graphNodeDefaults | object | `{"subgraph":{"configMapName":"besu-subgraph"}}` | Default values for Graph Node instances |
| graph-node.graphNodeDefaults.subgraph | object | `{"configMapName":"besu-subgraph"}` | Subgraph defaults configuration |
| graph-node.graphNodeDefaults.subgraph.configMapName | string | `"besu-subgraph"` | Default ConfigMap name for subgraph deployment |
| image | object | `{"pullPolicy":"IfNotPresent","repository":"graphprotocol/graph-node","tag":"v0.40.2"}` | Graph Node image configuration |
| image.pullPolicy | string | `"IfNotPresent"` | Graph Node image pull policy |
| image.repository | string | `"graphprotocol/graph-node"` | Image for Graph Node |
| image.tag | string | `"v0.40.2"` | Overrides the image tag. Defaults to Chart.appVersion if not set |
| imagePullSecrets | list | `[]` | Pull secrets required to fetch the Image |
| ingress | object | `{"annotations":{"nginx.ingress.kubernetes.io/rewrite-target":"/$1","nginx.ingress.kubernetes.io/use-regex":"true"},"className":"atk-nginx","enabled":true,"hosts":[{"host":"graph.k8s.orb.local","paths":[{"path":"/(.*)","pathType":"ImplementationSpecific"},{"path":"/ws/?(.*)","pathType":"ImplementationSpecific"},{"path":"/admin/?(.*)","pathType":"ImplementationSpecific"},{"path":"/indexer/?(.*)","pathType":"ImplementationSpecific"},{"path":"/graphman/?(.*)","pathType":"ImplementationSpecific"}]}],"tls":[]}` | Ingress configuration |
| ingress.annotations | object | `{"nginx.ingress.kubernetes.io/rewrite-target":"/$1","nginx.ingress.kubernetes.io/use-regex":"true"}` | Additional annotations for the Ingress resource |
| ingress.annotations."nginx.ingress.kubernetes.io/rewrite-target" | string | `"/$1"` | Rewrite target path using capture group |
| ingress.annotations."nginx.ingress.kubernetes.io/use-regex" | string | `"true"` | Enable regex path matching in NGINX ingress |
| ingress.className | string | `"atk-nginx"` | IngressClass that will be be used to implement the Ingress (Kubernetes 1.18+) |
| ingress.enabled | bool | `true` | Enable ingress record generation for Graph Node |
| ingress.hosts | list | `[{"host":"graph.k8s.orb.local","paths":[{"path":"/(.*)","pathType":"ImplementationSpecific"},{"path":"/ws/?(.*)","pathType":"ImplementationSpecific"},{"path":"/admin/?(.*)","pathType":"ImplementationSpecific"},{"path":"/indexer/?(.*)","pathType":"ImplementationSpecific"},{"path":"/graphman/?(.*)","pathType":"ImplementationSpecific"}]}]` | An array with hosts and paths |
| ingress.hosts[0] | object | `{"host":"graph.k8s.orb.local","paths":[{"path":"/(.*)","pathType":"ImplementationSpecific"},{"path":"/ws/?(.*)","pathType":"ImplementationSpecific"},{"path":"/admin/?(.*)","pathType":"ImplementationSpecific"},{"path":"/indexer/?(.*)","pathType":"ImplementationSpecific"},{"path":"/graphman/?(.*)","pathType":"ImplementationSpecific"}]}` | Ingress host configuration |
| ingress.hosts[0].host | string | `"graph.k8s.orb.local"` | Hostname for the ingress rule |
| ingress.hosts[0].paths | list | `[{"path":"/(.*)","pathType":"ImplementationSpecific"},{"path":"/ws/?(.*)","pathType":"ImplementationSpecific"},{"path":"/admin/?(.*)","pathType":"ImplementationSpecific"},{"path":"/indexer/?(.*)","pathType":"ImplementationSpecific"},{"path":"/graphman/?(.*)","pathType":"ImplementationSpecific"}]` | List of path configurations for this host |
| ingress.hosts[0].paths[0] | object | `{"path":"/(.*)","pathType":"ImplementationSpecific"}` | Query endpoint path configuration |
| ingress.hosts[0].paths[0].path | string | `"/(.*)"` | URL path pattern with regex capture group |
| ingress.hosts[0].paths[0].pathType | string | `"ImplementationSpecific"` | Path type for Kubernetes ingress |
| ingress.hosts[0].paths[1] | object | `{"path":"/ws/?(.*)","pathType":"ImplementationSpecific"}` | WebSocket query endpoint path configuration |
| ingress.hosts[0].paths[1].path | string | `"/ws/?(.*)"` | URL path pattern for WebSocket queries |
| ingress.hosts[0].paths[1].pathType | string | `"ImplementationSpecific"` | Path type for Kubernetes ingress |
| ingress.hosts[0].paths[2] | object | `{"path":"/admin/?(.*)","pathType":"ImplementationSpecific"}` | Admin endpoint path configuration |
| ingress.hosts[0].paths[2].path | string | `"/admin/?(.*)"` | URL path pattern for admin interface |
| ingress.hosts[0].paths[2].pathType | string | `"ImplementationSpecific"` | Path type for Kubernetes ingress |
| ingress.hosts[0].paths[3] | object | `{"path":"/indexer/?(.*)","pathType":"ImplementationSpecific"}` | Indexer endpoint path configuration |
| ingress.hosts[0].paths[3].path | string | `"/indexer/?(.*)"` | URL path pattern for indexer status |
| ingress.hosts[0].paths[3].pathType | string | `"ImplementationSpecific"` | Path type for Kubernetes ingress |
| ingress.hosts[0].paths[4] | object | `{"path":"/graphman/?(.*)","pathType":"ImplementationSpecific"}` | Graphman endpoint path configuration |
| ingress.hosts[0].paths[4].path | string | `"/graphman/?(.*)"` | URL path pattern for graphman interface |
| ingress.hosts[0].paths[4].pathType | string | `"ImplementationSpecific"` | Path type for Kubernetes ingress |
| ingress.tls | list | `[]` | TLS configuration for the ingress |
| initContainer | object | `{"image":{"pullPolicy":"IfNotPresent","repository":"docker.io/kubesphere/kubectl","tag":"v1.33.4"},"tcpCheck":{"dependencies":[{"endpoint":"{{ include \"atk.postgresql.endpoint\" (dict \"context\" $ \"chartKey\" \"graphNode\" \"local\" .Values.postgresql) }}","name":"postgresql"}],"enabled":true,"image":{"pullPolicy":"IfNotPresent","repository":"ghcr.io/settlemint/btp-waitforit","tag":"v7.7.10"},"resources":{"limits":{"cpu":"100m","memory":"64Mi"},"requests":{"cpu":"10m","memory":"32Mi"}},"timeout":120}}` | Init container configuration |
| initContainer.image | object | `{"pullPolicy":"IfNotPresent","repository":"docker.io/kubesphere/kubectl","tag":"v1.33.4"}` | Image for init container kubectl |
| initContainer.image.pullPolicy | string | `"IfNotPresent"` | Kubectl image pull policy |
| initContainer.image.repository | string | `"docker.io/kubesphere/kubectl"` | Kubectl image repository |
| initContainer.image.tag | string | `"v1.33.4"` | Kubectl image tag |
| initContainer.tcpCheck | object | `{"dependencies":[{"endpoint":"{{ include \"atk.postgresql.endpoint\" (dict \"context\" $ \"chartKey\" \"graphNode\" \"local\" .Values.postgresql) }}","name":"postgresql"}],"enabled":true,"image":{"pullPolicy":"IfNotPresent","repository":"ghcr.io/settlemint/btp-waitforit","tag":"v7.7.10"},"resources":{"limits":{"cpu":"100m","memory":"64Mi"},"requests":{"cpu":"10m","memory":"32Mi"}},"timeout":120}` | TCP check configuration |
| initContainer.tcpCheck.dependencies | list | `[{"endpoint":"{{ include \"atk.postgresql.endpoint\" (dict \"context\" $ \"chartKey\" \"graphNode\" \"local\" .Values.postgresql) }}","name":"postgresql"}]` | List of dependencies to check |
| initContainer.tcpCheck.dependencies[0] | object | `{"endpoint":"{{ include \"atk.postgresql.endpoint\" (dict \"context\" $ \"chartKey\" \"graphNode\" \"local\" .Values.postgresql) }}","name":"postgresql"}` | Dependency configuration |
| initContainer.tcpCheck.dependencies[0].endpoint | string | `"{{ include \"atk.postgresql.endpoint\" (dict \"context\" $ \"chartKey\" \"graphNode\" \"local\" .Values.postgresql) }}"` | Dependency endpoint template |
| initContainer.tcpCheck.dependencies[0].name | string | `"postgresql"` | Dependency name |
| initContainer.tcpCheck.enabled | bool | `true` | Enable TCP check init container |
| initContainer.tcpCheck.image | object | `{"pullPolicy":"IfNotPresent","repository":"ghcr.io/settlemint/btp-waitforit","tag":"v7.7.10"}` | TCP check image configuration |
| initContainer.tcpCheck.image.pullPolicy | string | `"IfNotPresent"` | TCP check image pull policy |
| initContainer.tcpCheck.image.repository | string | `"ghcr.io/settlemint/btp-waitforit"` | TCP check image repository |
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
| openShiftRoute.routes[0] | object | `{"annotations":{},"host":"","nameSuffix":"","path":"/","targetPort":"http-query"}` | Query endpoint route configuration |
| openShiftRoute.routes[0].annotations | object | `{}` | Route-specific annotations |
| openShiftRoute.routes[0].host | string | `""` | Hostname override (empty uses default host) |
| openShiftRoute.routes[0].nameSuffix | string | `""` | Name suffix for the route resource |
| openShiftRoute.routes[0].path | string | `"/"` | URL path for the route |
| openShiftRoute.routes[0].targetPort | string | `"http-query"` | Target service port name |
| openShiftRoute.routes[1] | object | `{"annotations":{"haproxy.router.openshift.io/rewrite-target":"/"},"host":"","nameSuffix":"ws","path":"/ws","targetPort":"http-queryws"}` | WebSocket query endpoint route configuration |
| openShiftRoute.routes[1].annotations | object | `{"haproxy.router.openshift.io/rewrite-target":"/"}` | Route-specific annotations |
| openShiftRoute.routes[1].annotations."haproxy.router.openshift.io/rewrite-target" | string | `"/"` | HAProxy rewrite target path |
| openShiftRoute.routes[1].host | string | `""` | Hostname override (empty uses default host) |
| openShiftRoute.routes[1].nameSuffix | string | `"ws"` | Name suffix for the route resource |
| openShiftRoute.routes[1].path | string | `"/ws"` | URL path for the route |
| openShiftRoute.routes[1].targetPort | string | `"http-queryws"` | Target service port name |
| openShiftRoute.routes[2] | object | `{"annotations":{"haproxy.router.openshift.io/rewrite-target":"/"},"host":"","nameSuffix":"admin","path":"/admin","targetPort":"http-admin"}` | Admin endpoint route configuration |
| openShiftRoute.routes[2].annotations | object | `{"haproxy.router.openshift.io/rewrite-target":"/"}` | Route-specific annotations |
| openShiftRoute.routes[2].annotations."haproxy.router.openshift.io/rewrite-target" | string | `"/"` | HAProxy rewrite target path |
| openShiftRoute.routes[2].host | string | `""` | Hostname override (empty uses default host) |
| openShiftRoute.routes[2].nameSuffix | string | `"admin"` | Name suffix for the route resource |
| openShiftRoute.routes[2].path | string | `"/admin"` | URL path for the route |
| openShiftRoute.routes[2].targetPort | string | `"http-admin"` | Target service port name |
| openShiftRoute.routes[3] | object | `{"annotations":{"haproxy.router.openshift.io/rewrite-target":"/"},"host":"","nameSuffix":"indexer","path":"/indexer","targetPort":"http-status"}` | Indexer endpoint route configuration |
| openShiftRoute.routes[3].annotations | object | `{"haproxy.router.openshift.io/rewrite-target":"/"}` | Route-specific annotations |
| openShiftRoute.routes[3].annotations."haproxy.router.openshift.io/rewrite-target" | string | `"/"` | HAProxy rewrite target path |
| openShiftRoute.routes[3].host | string | `""` | Hostname override (empty uses default host) |
| openShiftRoute.routes[3].nameSuffix | string | `"indexer"` | Name suffix for the route resource |
| openShiftRoute.routes[3].path | string | `"/indexer"` | URL path for the route |
| openShiftRoute.routes[3].targetPort | string | `"http-status"` | Target service port name |
| openShiftRoute.routes[4] | object | `{"annotations":{"haproxy.router.openshift.io/rewrite-target":"/"},"host":"","nameSuffix":"graphman","path":"/graphman","targetPort":"http-status"}` | Graphman endpoint route configuration |
| openShiftRoute.routes[4].annotations | object | `{"haproxy.router.openshift.io/rewrite-target":"/"}` | Route-specific annotations |
| openShiftRoute.routes[4].annotations."haproxy.router.openshift.io/rewrite-target" | string | `"/"` | HAProxy rewrite target path |
| openShiftRoute.routes[4].host | string | `""` | Hostname override (empty uses default host) |
| openShiftRoute.routes[4].nameSuffix | string | `"graphman"` | Name suffix for the route resource |
| openShiftRoute.routes[4].path | string | `"/graphman"` | URL path for the route |
| openShiftRoute.routes[4].targetPort | string | `"http-status"` | Target service port name |
| openShiftRoute.tls | object | `nil` | TLS configuration shared by the generated routes |
| openShiftRoute.to | object | `{"weight":100}` | Primary service weight configuration used when routes omit a weight |
| openShiftRoute.to.weight | int | `100` | Weight for the primary service backend |
| openShiftRoute.wildcardPolicy | string | `"None"` | Wildcard policy applied when individual routes do not override it |
| podAnnotations | object | `{"prometheus.io/path":"/metrics","prometheus.io/port":"8040","prometheus.io/scrape":"true"}` | Annotations for the `Pod` |
| podAnnotations."prometheus.io/path" | string | `"/metrics"` | Prometheus metrics endpoint path |
| podAnnotations."prometheus.io/port" | string | `"8040"` | Prometheus metrics port |
| podAnnotations."prometheus.io/scrape" | string | `"true"` | Enable Prometheus scraping for this pod |
| podDisruptionBudget | object | `{"enabled":false}` | Pod disruption budget |
| podDisruptionBudget.enabled | bool | `false` | Enable pod disruption budget |
| podSecurityContext | object | `{}` | Pod-wide security context |
| postgresReadinessCheck | object | `{"enabled":true,"image":"docker.io/postgres:18.0-alpine","initialWaitTime":2,"maxRetries":30,"maxWaitTime":30,"randomDelayRange":{"max":30,"min":5},"resources":{"limits":{"cpu":"100m","memory":"96Mi"},"requests":{"cpu":"25m","memory":"48Mi"}}}` | PostgreSQL readiness check configuration |
| postgresReadinessCheck.enabled | bool | `true` | Enable PostgreSQL readiness check init container |
| postgresReadinessCheck.image | string | `"docker.io/postgres:18.0-alpine"` | Docker image for PostgreSQL readiness check |
| postgresReadinessCheck.initialWaitTime | int | `2` | Initial wait time between retries (doubles with exponential backoff) |
| postgresReadinessCheck.maxRetries | int | `30` | Maximum number of connection retries |
| postgresReadinessCheck.maxWaitTime | int | `30` | Maximum wait time between retries |
| postgresReadinessCheck.randomDelayRange | object | `{"max":30,"min":5}` | Add random delay to prevent all nodes from connecting simultaneously |
| postgresReadinessCheck.randomDelayRange.max | int | `30` | Maximum random delay in seconds |
| postgresReadinessCheck.randomDelayRange.min | int | `5` | Minimum random delay in seconds |
| postgresReadinessCheck.resources | object | `{"limits":{"cpu":"100m","memory":"96Mi"},"requests":{"cpu":"25m","memory":"48Mi"}}` | Resource limits and requests for PostgreSQL readiness check container |
| postgresReadinessCheck.resources.limits | object | `{"cpu":"100m","memory":"96Mi"}` | Resource limits |
| postgresReadinessCheck.resources.limits.cpu | string | `"100m"` | CPU limit |
| postgresReadinessCheck.resources.limits.memory | string | `"96Mi"` | Memory limit |
| postgresReadinessCheck.resources.requests | object | `{"cpu":"25m","memory":"48Mi"}` | Resource requests |
| postgresReadinessCheck.resources.requests.cpu | string | `"25m"` | CPU request |
| postgresReadinessCheck.resources.requests.memory | string | `"48Mi"` | Memory request |
| postgresql | object | `{}` | PostgreSQL overrides merged with global.datastores.graphNode.postgresql |
| rbac | object | `{"create":false,"rules":[]}` | RBAC configuration |
| rbac.create | bool | `false` | Specifies whether RBAC resources are to be created |
| rbac.rules | list | `[]` | RBAC rules for the service account. Add RBAC rules here if graph-node requires specific Kubernetes API access. Currently no special permissions are needed |
| replicaCount | int | `1` | Number of Graph Node replicas to deploy |
| resources | object | `{}` | Specify [resource requests and limits](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/#requests-and-limits) |
| secretEnv | object | `{"PRIMARY_SUBGRAPH_DATA_PGPASSWORD":{"key":"PGPASSWORD","secretName":""},"PRIMARY_SUBGRAPH_DATA_PGUSER":{"key":"PGUSER","secretName":""}}` | Environment variables from secrets |
| secretEnv.PRIMARY_SUBGRAPH_DATA_PGPASSWORD | object | `{"key":"PGPASSWORD","secretName":""}` | PostgreSQL password secret reference |
| secretEnv.PRIMARY_SUBGRAPH_DATA_PGPASSWORD.key | string | `"PGPASSWORD"` | Name of the data key in the secret that contains your PG password |
| secretEnv.PRIMARY_SUBGRAPH_DATA_PGPASSWORD.secretName | string | `""` | Name of the secret that contains your PG password (uses graph-node.pgSecretName helper) |
| secretEnv.PRIMARY_SUBGRAPH_DATA_PGUSER | object | `{"key":"PGUSER","secretName":""}` | PostgreSQL username secret reference |
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
| store.primary | object | `{"connection":"postgresql://${PRIMARY_SUBGRAPH_DATA_PGUSER}:${PRIMARY_SUBGRAPH_DATA_PGPASSWORD}@${PRIMARY_SUBGRAPH_DATA_PGHOST}:${PRIMARY_SUBGRAPH_DATA_PGPORT}/${PRIMARY_SUBGRAPH_DATA_PGDATABASE}","enabled":true}` | Primary database shard configuration |
| store.primary.connection | string | `"postgresql://${PRIMARY_SUBGRAPH_DATA_PGUSER}:${PRIMARY_SUBGRAPH_DATA_PGPASSWORD}@${PRIMARY_SUBGRAPH_DATA_PGHOST}:${PRIMARY_SUBGRAPH_DATA_PGPORT}/${PRIMARY_SUBGRAPH_DATA_PGDATABASE}"` | PostgreSQL connection string for primary shard |
| store.primary.enabled | bool | `true` | Enable this store for Graph Node |
| subgraph | object | `{"configMapName":"besu-subgraph"}` | Subgraph configuration shared with the bootstrap process |
| subgraph.configMapName | string | `"besu-subgraph"` | ConfigMap providing the deployed subgraph hash |
| terminationGracePeriodSeconds | int | `60` | Termination grace period seconds |
| tolerations | list | `[]` | Specify [tolerations](https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/) |

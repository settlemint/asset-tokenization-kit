# graph-node

![Version: 2.0.0-beta.1](https://img.shields.io/badge/Version-2.0.0--beta.1-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: 2.0.0-beta.1](https://img.shields.io/badge/AppVersion-2.0.0--beta.1-informational?style=flat-square)

A Helm chart for Graph Node

## Configuration

The following table lists the configurable parameters of this chart and their default values.

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
|autoscaling|object|-|Autoscaling|
|autoscaling.enabled|bool|`false`|Enable autoscaling|
|autoscaling.maxReplicas|int|`100`|Maximum number of replicas|
|autoscaling.minReplicas|int|`1`|Minimum number of replicas|
|autoscaling.targetCPUUtilizationPercentage|int|`80`|Target CPU utilization percentage|
|chains|object|-|Blockchain configuration for Graph Node|
|chains.settlemint|object|-|SettleMint blockchain configuration|
|chains.settlemint.enabled|bool|`true`|Enable this configuring graph-node with this chain|
|chains.settlemint.provider|list|-|A list of JSON-RPC endpoints for this node (you should override this list with your own configuration)|
|chains.settlemint.provider[0]|object|-|JSON-RPC provider configuration|
|chains.settlemint.provider[0].details|object|-|Provider connection details|
|chains.settlemint.provider[0].details.features|list|-|Data capabilities this node has|
|chains.settlemint.provider[0].details.type|string|`"web3"`|Type of Provider: web3|
|chains.settlemint.provider[0].details.url|string|`"http://erpc:4000/settlemint/evm/53771311147"`|URL for JSON-RPC endpoint|
|chains.settlemint.provider[0].label|string|`"erpc"`|Label for a JSON-RPC endpoint|
|chains.settlemint.shard|string|`"primary"`|The database shard to use for this chain|
|configTemplate|string|`"# Store configuration\n[store]\n{{- range $storeName, $storeValues := $.Values.store }}\n{{- if $storeValues.enabled }}\n  [store.{{ $storeName }}]\n  connection = {{ required \"You must specify a store connection string\" $storeValues.connection | quote }}\n  pool_size = {{ default 10 $storeValues.poolSize }}\n  weight = {{ default 1 $storeValues.weight }}\n{{- end }}\n{{- end }}\n\n# Chain configuration\n{{- $patchedChains := dict \"ingestor\" (print (include \"graph-node.fullname\" $) \"-combined-\" 0) }}\n{{- range $chainName, $chainValues := $.Values.chains }}\n{{- if $chainValues.enabled }}\n  {{- $_ := set $patchedChains $chainName (omit $chainValues \"enabled\") }}\n{{- end }}\n{{- end }}\n{{ toToml (dict \"chains\" $patchedChains) }}\n\n# Deployment rule configuration\n[deployment]\n# Deployment rules match top to bottom\n[[deployment.rule]]\n# DEFAULT RULE\n# There's no 'match' field, so any subgraph that hasn't matched above, matches this rule\nshards = [\"primary\"]\nindexers = [\"{{ include \"graph-node.fullname\" $ }}-combined-0\"]\n"`|Configuration for graph-node. See [graph-node config docs](https://github.com/graphprotocol/graph-node/blob/master/docs/config.md) and default template in values.yaml|
|containerSecurityContext|object|-|Container-level security context overrides|
|customSecret|object|-|Custom secret data for PostgreSQL credentials. Used for backward compatibility and default values|
|env|object|-|Environment variables|
|env.ETHEREUM_POLLING_INTERVAL|string|`"1000"`|Ethereum polling interval in milliseconds|
|env.EXPERIMENTAL_SUBGRAPH_VERSION_SWITCHING_MODE|string|`"synced"`|Experimental subgraph version switching mode|
|env.GRAPH_ALLOW_NON_DETERMINISTIC_FULLTEXT_SEARCH|string|`"true"`|Allow non-deterministic fulltext search operations|
|env.GRAPH_ALLOW_NON_DETERMINISTIC_IPFS|string|`"true"`|Allow non-deterministic IPFS operations|
|env.GRAPH_CHAIN_HEAD_WATCHER_TIMEOUT|string|`"5"`|Timeout in seconds for chain head watcher|
|env.GRAPH_DISABLE_GRAFTS|string|`"false"`|Disable subgraph grafting feature|
|env.GRAPH_ENABLE_PROMETHEUS_METRICS|string|`"true"`|Enable Prometheus metrics endpoint|
|env.GRAPH_ETHEREUM_BLOCK_BATCH_SIZE|string|`"100"`|Number of blocks to fetch in a single batch|
|env.GRAPH_ETHEREUM_BLOCK_INGESTOR_MAX_CONCURRENT_JSON_RPC_CALLS|string|`"100"`|Maximum concurrent JSON-RPC calls for block ingestor|
|env.GRAPH_ETHEREUM_CLEANUP_BLOCKS|string|`"true"`|Clean up old Ethereum blocks from the database|
|env.GRAPH_ETHEREUM_MAX_BLOCK_RANGE_SIZE|string|`"1000"`|Maximum block range size for queries|
|env.GRAPH_ETHEREUM_REQUEST_RETRIES|string|`"10"`|Number of retries for failed Ethereum requests|
|env.GRAPH_ETHEREUM_TARGET_TRIGGERS_PER_BLOCK_RANGE|string|`"100"`|Target number of triggers per block range|
|env.GRAPH_ETH_CALL_GAS|string|`"50000000"`|Maximum gas for eth_call operations|
|env.GRAPH_GETH_ETH_CALL_ERRORS|string|`"out of gas"`|Error patterns that indicate out of gas conditions|
|env.GRAPH_IPFS_TIMEOUT|string|`"30"`|Timeout in seconds for IPFS operations|
|env.GRAPH_KILL_IF_UNRESPONSIVE|string|`"true"`|Kill the node if it becomes unresponsive|
|env.GRAPH_LOAD_BIN_SIZE|string|`"10"`|Bin size for load distribution|
|env.GRAPH_LOAD_WINDOW_SIZE|string|`"3600"`|Load window size in seconds for block ingestion|
|env.GRAPH_LOG|string|`"info"`|Log level (trace, debug, info, warn, error)|
|env.GRAPH_LOG_QUERY_TIMING|string|`"gql"`|Log GraphQL query timing information|
|env.GRAPH_MAX_GAS_PER_HANDLER|string|`"1_000_000_000_000_000"`|Maximum gas allowed per handler execution|
|env.GRAPH_MAX_SPEC_VERSION|string|`"1.2.0"`|Maximum subgraph spec version supported|
|env.GRAPH_PARALLEL_BLOCK_CONSTRAINTS|string|`"true"`|Use parallel block constraints for better performance|
|env.GRAPH_POSTPONE_ATTRIBUTE_INDEX_CREATION|string|`"true"`|Postpone attribute index creation until after data loading|
|env.GRAPH_PROMETHEUS_HOST|string|`"0.0.0.0"`|Host address for Prometheus metrics server|
|env.GRAPH_QUERY_CACHE_BLOCKS|string|`"6"`|Number of blocks to cache queries for|
|env.GRAPH_QUERY_CACHE_MAX_MEM|string|`"3000"`|Maximum memory for query cache in megabytes|
|env.GRAPH_QUERY_CACHE_STALE_PERIOD|string|`"1000"`|Time period in milliseconds before cached queries become stale|
|env.GRAPH_STATIC_FILTERS_THRESHOLD|string|`"10000"`|Threshold for using static filters optimization|
|env.GRAPH_STORE_WRITE_BATCH_DURATION|string|`"0"`|Duration in milliseconds to batch store writes (0 = disabled)|
|env.GRAPH_STORE_WRITE_BATCH_SIZE|string|`"0"`|Number of operations to batch in store writes (0 = disabled)|
|env.IPFS|string|`"https://ipfs.console.settlemint.com"`|The URL for your IPFS node|
|env.node_role|string|`"combined"`|Node role|
|extraContainers|list|-|Additional containers|
|extraInitContainers|list|-|Additional init containers|
|extraVolumeMounts|list|-|Additional volume mounts|
|extraVolumes|list|-|Additional volumes|
|fullnameOverride|string|`"graph-node"`|Override the full resource name. Set to "graph-node" for backward compatibility with existing ATK deployments that reference "graph-node-combined" service name|
|global|object|-|Global configuration|
|global.artifacts|object|-|Artifacts configuration for contract ABIs and genesis files|
|global.artifacts.image|object|-|Image containing contract ABIs and genesis files|
|global.artifacts.image.pullPolicy|string|`"IfNotPresent"`|Image pull policy|
|global.artifacts.image.registry|string|`"ghcr.io"`|Image registry|
|global.artifacts.image.repository|string|`"settlemint/asset-tokenization-kit-artifacts"`|Image repository|
|global.artifacts.image.tag|string|`""`|Image tag (empty string uses Chart.appVersion)|
|global.labels|object|-|Labels applied to all resources|
|global.labels."kots.io/app-slug"|string|`"settlemint-atk"`|KOTS application slug for Replicated|
|graph-node|object|-|Graph Node defaults configuration|
|graph-node.graphNodeDefaults|object|-|Default values for Graph Node instances|
|graph-node.graphNodeDefaults.subgraph|object|-|Subgraph defaults configuration|
|graph-node.graphNodeDefaults.subgraph.configMapName|string|`"besu-subgraph"`|Default ConfigMap name for subgraph deployment|
|image|object|-|Graph Node image configuration|
|image.pullPolicy|string|`"IfNotPresent"`|Graph Node image pull policy|
|image.repository|string|`"graphprotocol/graph-node"`|Image for Graph Node|
|image.tag|string|`"v0.40.2"`|Overrides the image tag. Defaults to Chart.appVersion if not set|
|imagePullSecrets|list|-|Pull secrets required to fetch the Image|
|ingress|object|-|Ingress configuration|
|ingress.annotations|object|-|Additional annotations for the Ingress resource|
|ingress.annotations."nginx.ingress.kubernetes.io/rewrite-target"|string|`"/$1"`|Rewrite target path using capture group|
|ingress.annotations."nginx.ingress.kubernetes.io/use-regex"|string|`"true"`|Enable regex path matching in NGINX ingress|
|ingress.enabled|bool|`true`|Enable ingress record generation for Graph Node|
|ingress.hostname|string|`"graph.k8s.orb.local"`|Primary hostname served by the ingress|
|ingress.ingressClassName|string|`"atk-nginx"`|IngressClass that will be used to implement the Ingress (Kubernetes 1.19+)|
|ingress.paths|list|-|Path rules mapped to Graph Node service ports|
|ingress.paths[0]|object|-|Query endpoint path configuration|
|ingress.paths[0].pathType|string|`"ImplementationSpecific"`|Kubernetes path matching mode for the query endpoint|
|ingress.paths[0].servicePortName|string|`"http-query"`|Service port name handling HTTP query traffic|
|ingress.paths[1]|object|-|WebSocket query endpoint path configuration|
|ingress.paths[1].pathType|string|`"ImplementationSpecific"`|Kubernetes path matching mode for the WebSocket endpoint|
|ingress.paths[1].servicePortName|string|`"http-queryws"`|Service port name handling WebSocket query traffic|
|ingress.paths[2]|object|-|Admin endpoint path configuration|
|ingress.paths[2].pathType|string|`"ImplementationSpecific"`|Kubernetes path matching mode for the admin endpoint|
|ingress.paths[2].servicePortName|string|`"http-admin"`|Service port name exposing admin operations|
|ingress.paths[3]|object|-|Indexer endpoint path configuration|
|ingress.paths[3].pathType|string|`"ImplementationSpecific"`|Kubernetes path matching mode for the indexer endpoint|
|ingress.paths[3].servicePortName|string|`"http-status"`|Service port name exposing indexer status metrics|
|ingress.paths[4]|object|-|Graphman endpoint path configuration|
|ingress.paths[4].pathType|string|`"ImplementationSpecific"`|Kubernetes path matching mode for the Graphman endpoint|
|ingress.paths[4].servicePortName|string|`"http-status"`|Service port name exposing Graphman operations|
|ingress.tls|list|-|TLS configuration for the ingress|
|initContainer|object|-|Init container configuration|
|initContainer.image|object|-|Image for init container kubectl|
|initContainer.image.pullPolicy|string|`"IfNotPresent"`|Kubectl image pull policy|
|initContainer.image.repository|string|`"docker.io/kubesphere/kubectl"`|Kubectl image repository|
|initContainer.image.tag|string|`"v1.33.4"`|Kubectl image tag|
|initContainer.tcpCheck|object|-|TCP check configuration|
|initContainer.tcpCheck.dependencies|list|-|List of dependencies to check|
|initContainer.tcpCheck.dependencies[0]|object|-|Dependency configuration|
|initContainer.tcpCheck.dependencies[0].endpoint|string|`"{{ include \"atk.postgresql.endpoint\" (dict \"context\" $ \"chartKey\" \"graphNode\" \"local\" .Values.postgresql) }}"`|Dependency endpoint template|
|initContainer.tcpCheck.dependencies[0].name|string|`"postgresql"`|Dependency name|
|initContainer.tcpCheck.dependencies[1].endpoint|string|`"{{ include \"graph-node.ipfsClusterProxyEndpoint\" (dict \"context\" $) }}"`|Rendered endpoint for the IPFS cluster proxy health check|
|initContainer.tcpCheck.dependencies[1].name|string|`"ipfs-cluster-proxy"`|Human-readable name for the IPFS cluster proxy dependency|
|initContainer.tcpCheck.enabled|bool|`true`|Enable TCP check init container|
|initContainer.tcpCheck.image|object|-|TCP check image configuration|
|initContainer.tcpCheck.image.pullPolicy|string|`"IfNotPresent"`|TCP check image pull policy|
|initContainer.tcpCheck.image.repository|string|`"ghcr.io/settlemint/btp-waitforit"`|TCP check image repository|
|initContainer.tcpCheck.image.tag|string|`"v7.7.11"`|TCP check image tag|
|initContainer.tcpCheck.ipfsClusterProxy.enabled|bool|`true`|Enable readiness checks against the IPFS cluster proxy|
|initContainer.tcpCheck.ipfsClusterProxy.host|string|`"ipfs-cluster"`|Hostname for the IPFS cluster proxy service|
|initContainer.tcpCheck.ipfsClusterProxy.port|int|`9095`|TCP port used by the IPFS cluster proxy service|
|initContainer.tcpCheck.resources|object|-|Resource limits and requests for TCP check container|
|initContainer.tcpCheck.resources.limits|object|-|Resource limits|
|initContainer.tcpCheck.resources.limits.cpu|string|`"300m"`|CPU limit|
|initContainer.tcpCheck.resources.limits.memory|string|`"64Mi"`|Memory limit|
|initContainer.tcpCheck.resources.requests|object|-|Resource requests|
|initContainer.tcpCheck.resources.requests.cpu|string|`"10m"`|CPU request|
|initContainer.tcpCheck.resources.requests.memory|string|`"32Mi"`|Memory request|
|initContainer.tcpCheck.timeout|int|`120`|Timeout in seconds for each dependency check|
|nameOverride|string|`""`|String to partially override common.names.fullname template (will maintain the release name)|
|networkPolicy|object|-|Network policies|
|networkPolicy.egress|list|-|Egress rules for network policy|
|networkPolicy.enabled|bool|`false`|Enable network policies|
|networkPolicy.ingress|list|-|Ingress rules for network policy|
|nodeSelector|object|-|Specify a [node selector](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/)|
|openShiftRoute|object|-|OpenShift Route parameters|
|openShiftRoute.alternateBackends|list|-|Additional service backends shared by the generated routes|
|openShiftRoute.annotations|object|-|Additional annotations applied to every generated route|
|openShiftRoute.enabled|bool|`false`|Enable OpenShift route creation for Graph Node endpoints|
|openShiftRoute.host|string|`"graph.k8s.orb.local"`|Hostname exposed via the OpenShift routes|
|openShiftRoute.routes|list|-|Route definitions for the exposed Graph Node endpoints|
|openShiftRoute.routes[0]|object|-|Query endpoint route configuration|
|openShiftRoute.routes[0].annotations|object|-|Route-specific annotations|
|openShiftRoute.routes[0].host|string|`""`|Hostname override (empty uses default host)|
|openShiftRoute.routes[0].nameSuffix|string|`""`|Name suffix for the route resource|
|openShiftRoute.routes[0].path|string|`"/"`|URL path for the route|
|openShiftRoute.routes[0].targetPort|string|`"http-query"`|Target service port name|
|openShiftRoute.routes[1]|object|-|WebSocket query endpoint route configuration|
|openShiftRoute.routes[1].annotations|object|-|Route-specific annotations|
|openShiftRoute.routes[1].annotations."haproxy.router.openshift.io/rewrite-target"|string|`"/"`|HAProxy rewrite target path|
|openShiftRoute.routes[1].host|string|`""`|Hostname override (empty uses default host)|
|openShiftRoute.routes[1].nameSuffix|string|`"ws"`|Name suffix for the route resource|
|openShiftRoute.routes[1].path|string|`"/ws"`|URL path for the route|
|openShiftRoute.routes[1].targetPort|string|`"http-queryws"`|Target service port name|
|openShiftRoute.routes[2]|object|-|Admin endpoint route configuration|
|openShiftRoute.routes[2].annotations|object|-|Route-specific annotations|
|openShiftRoute.routes[2].annotations."haproxy.router.openshift.io/rewrite-target"|string|`"/"`|HAProxy rewrite target path|
|openShiftRoute.routes[2].host|string|`""`|Hostname override (empty uses default host)|
|openShiftRoute.routes[2].nameSuffix|string|`"admin"`|Name suffix for the route resource|
|openShiftRoute.routes[2].path|string|`"/admin"`|URL path for the route|
|openShiftRoute.routes[2].targetPort|string|`"http-admin"`|Target service port name|
|openShiftRoute.routes[3]|object|-|Indexer endpoint route configuration|
|openShiftRoute.routes[3].annotations|object|-|Route-specific annotations|
|openShiftRoute.routes[3].annotations."haproxy.router.openshift.io/rewrite-target"|string|`"/"`|HAProxy rewrite target path|
|openShiftRoute.routes[3].host|string|`""`|Hostname override (empty uses default host)|
|openShiftRoute.routes[3].nameSuffix|string|`"indexer"`|Name suffix for the route resource|
|openShiftRoute.routes[3].path|string|`"/indexer"`|URL path for the route|
|openShiftRoute.routes[3].targetPort|string|`"http-status"`|Target service port name|
|openShiftRoute.routes[4]|object|-|Graphman endpoint route configuration|
|openShiftRoute.routes[4].annotations|object|-|Route-specific annotations|
|openShiftRoute.routes[4].annotations."haproxy.router.openshift.io/rewrite-target"|string|`"/"`|HAProxy rewrite target path|
|openShiftRoute.routes[4].host|string|`""`|Hostname override (empty uses default host)|
|openShiftRoute.routes[4].nameSuffix|string|`"graphman"`|Name suffix for the route resource|
|openShiftRoute.routes[4].path|string|`"/graphman"`|URL path for the route|
|openShiftRoute.routes[4].targetPort|string|`"http-status"`|Target service port name|
|openShiftRoute.tls|object|-|TLS configuration shared by the generated routes|
|openShiftRoute.to|object|-|Primary service weight configuration used when routes omit a weight|
|openShiftRoute.to.weight|int|`100`|Weight for the primary service backend|
|openShiftRoute.wildcardPolicy|string|`"None"`|Wildcard policy applied when individual routes do not override it|
|podAnnotations|object|-|Annotations for the `Pod`|
|podAnnotations."prometheus.io/path"|string|`"/metrics"`|Prometheus metrics endpoint path|
|podAnnotations."prometheus.io/port"|string|`"8040"`|Prometheus metrics port|
|podAnnotations."prometheus.io/scrape"|string|`"true"`|Enable Prometheus scraping for this pod|
|podDisruptionBudget|object|-|Pod disruption budget|
|podDisruptionBudget.enabled|bool|`false`|Enable pod disruption budget|
|podSecurityContext|object|-|Pod-wide security context|
|postgresReadinessCheck|object|-|PostgreSQL readiness check configuration|
|postgresReadinessCheck.enabled|bool|`true`|Enable PostgreSQL readiness check init container|
|postgresReadinessCheck.image|string|`"docker.io/postgres:18.0-alpine"`|Docker image for PostgreSQL readiness check|
|postgresReadinessCheck.initialWaitTime|int|`2`|Initial wait time between retries (doubles with exponential backoff)|
|postgresReadinessCheck.maxRetries|int|`30`|Maximum number of connection retries|
|postgresReadinessCheck.maxWaitTime|int|`30`|Maximum wait time between retries|
|postgresReadinessCheck.randomDelayRange|object|-|Add random delay to prevent all nodes from connecting simultaneously|
|postgresReadinessCheck.randomDelayRange.max|int|`30`|Maximum random delay in seconds|
|postgresReadinessCheck.randomDelayRange.min|int|`5`|Minimum random delay in seconds|
|postgresReadinessCheck.resources|object|-|Resource limits and requests for PostgreSQL readiness check container|
|postgresReadinessCheck.resources.limits|object|-|Resource limits|
|postgresReadinessCheck.resources.limits.cpu|string|`"300m"`|CPU limit|
|postgresReadinessCheck.resources.limits.memory|string|`"96Mi"`|Memory limit|
|postgresReadinessCheck.resources.requests|object|-|Resource requests|
|postgresReadinessCheck.resources.requests.cpu|string|`"25m"`|CPU request|
|postgresReadinessCheck.resources.requests.memory|string|`"48Mi"`|Memory request|
|postgresql|object|-|PostgreSQL overrides merged with global.datastores.graphNode.postgresql|
|rbac|object|-|RBAC configuration|
|rbac.create|bool|`false`|Specifies whether RBAC resources are to be created|
|rbac.rules|list|-|RBAC rules for the service account. Add RBAC rules here if graph-node requires specific Kubernetes API access. Currently no special permissions are needed|
|replicaCount|int|`1`|Number of Graph Node replicas to deploy|
|resources|object|-|Specify [resource requests and limits](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/#requests-and-limits)|
|secretEnv|object|-|Environment variables from secrets|
|secretEnv.PRIMARY_SUBGRAPH_DATA_PGPASSWORD|object|-|PostgreSQL password secret reference|
|secretEnv.PRIMARY_SUBGRAPH_DATA_PGPASSWORD.key|string|`"PGPASSWORD"`|Name of the data key in the secret that contains your PG password|
|secretEnv.PRIMARY_SUBGRAPH_DATA_PGPASSWORD.secretName|string|`""`|Name of the secret that contains your PG password (uses graph-node.pgSecretName helper)|
|secretEnv.PRIMARY_SUBGRAPH_DATA_PGUSER|object|-|PostgreSQL username secret reference|
|secretEnv.PRIMARY_SUBGRAPH_DATA_PGUSER.key|string|`"PGUSER"`|Name of the data key in the secret that contains your PG username|
|secretEnv.PRIMARY_SUBGRAPH_DATA_PGUSER.secretName|string|`""`|Name of the secret that contains your PG username (uses graph-node.pgSecretName helper)|
|service|object|-|Service configuration|
|service.ports|object|-|Service ports configuration|
|service.ports.httpAdmin|int|`8020`|Service Port to expose Graph Node Admin endpoint on|
|service.ports.httpMetrics|int|`8040`|Service Port to expose Graph Node Metrics endpoint on|
|service.ports.httpQuery|int|`8000`|Service Port to expose Graph Node Query endpoint on|
|service.ports.httpQueryws|int|`8001`|Service Port to expose Graph Node Websocket Query endpoint on|
|service.ports.httpStatus|int|`8030`|Service Port to expose Graph Node Status endpoint on|
|service.type|string|`"ClusterIP"`|Service type|
|serviceAccount|object|-|Service account configuration|
|serviceAccount.annotations|object|-|Annotations to add to the service account|
|serviceAccount.create|bool|`true`|Specifies whether a service account should be created|
|serviceAccount.name|string|`""`|The name of the service account to use. If not set and create is true, a name is generated using the fullname template|
|store|object|-|Store configuration for Graph Node|
|store.primary|object|-|Primary database shard configuration|
|store.primary.connection|string|`"postgresql://${PRIMARY_SUBGRAPH_DATA_PGUSER}:${PRIMARY_SUBGRAPH_DATA_PGPASSWORD}@${PRIMARY_SUBGRAPH_DATA_PGHOST}:${PRIMARY_SUBGRAPH_DATA_PGPORT}/${PRIMARY_SUBGRAPH_DATA_PGDATABASE}"`|PostgreSQL connection string for primary shard|
|store.primary.enabled|bool|`true`|Enable this store for Graph Node|
|subgraph|object|-|Subgraph configuration shared with the bootstrap process|
|subgraph.configMapName|string|`"besu-subgraph"`|ConfigMap providing the deployed subgraph hash|
|terminationGracePeriodSeconds|int|`60`|Termination grace period seconds|
|tolerations|list|-|Specify [tolerations](https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/)|

## Resource Summary

| Component | Replicas | Request CPU | Limit CPU | Request Memory | Limit Memory | Storage |
|-----------|----------|-------------|-----------|----------------|--------------|---------|
| initContainer.tcpCheck | 1 | 10m | 300m | 32Mi | 64Mi | - |
| postgresReadinessCheck | 1 | 25m | 300m | 48Mi | 96Mi | - |
| **Totals** | - | 0.04 cores (35m) | 0.60 cores (600m) | 80Mi (0.08Gi) | 160Mi (0.16Gi) | - |

## Maintainers

| Name | Email | Url |
| ---- | ------ | --- |
| SettleMint | <support@settlemint.com> | <https://settlemint.com> |


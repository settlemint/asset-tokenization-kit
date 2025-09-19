# network-nodes

![Version: 1.0.18](https://img.shields.io/badge/Version-1.0.18-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: 1.0.18](https://img.shields.io/badge/AppVersion-1.0.18-informational?style=flat-square)

A Helm chart for Kubernetes

## Maintainers

| Name | Email | Url |
| ---- | ------ | --- |
| SettleMint | <support@settlemint.com> | <https://settlemint.com> |

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| affinity | object | `{}` |  |
| artifacts.image.pullPolicy | string | `"IfNotPresent"` |  |
| artifacts.image.registry | string | `"ghcr.io"` |  |
| artifacts.image.repository | string | `nil` |  |
| artifacts.image.tag | string | `""` |  |
| config.bonsaiLimitTrieLogsEnabled | bool | `false` | Emit Bonsai limit trie logs for debugging state transitions. |
| config.cacheLastBlocks | int | `1024` | Number of recent blocks cached in memory. |
| config.dataStorageFormat | string | `"FOREST"` | Ledger storage backend (FOREST or BONSAI). |
| config.graphql.corsOrigins | list | `["all"]` | Allowed CORS origins for GraphQL requests. |
| config.graphql.enabled | bool | `true` | Enable the GraphQL API server. |
| config.graphql.host | string | `"0.0.0.0"` | Network interface for the GraphQL server. |
| config.hostAllowlist | list | `["*"]` | Hostnames allowed to access the RPC interfaces; `*` permits all. |
| config.http.api | list | `["DEBUG","ETH","ADMIN","WEB3","IBFT","NET","TRACE","QBFT","PERM","TXPOOL","PLUGINS"]` | Enabled JSON-RPC API namespaces exposed over HTTP. |
| config.http.authenticationEnabled | bool | `false` | Enable JWT authentication for HTTP JSON-RPC requests. |
| config.http.corsOrigins | list | `["all"]` | Allowed CORS origins for HTTP JSON-RPC requests. |
| config.http.enabled | bool | `true` | Enable the HTTP JSON-RPC listener. |
| config.http.host | string | `"0.0.0.0"` | Network interface for the HTTP JSON-RPC listener. |
| config.http.maxActiveConnections | int | `2000` | Maximum concurrent HTTP JSON-RPC connections. |
| config.http.maxBatchSize | int | `512` | Maximum number of batched JSON-RPC calls per request. |
| config.http.maxRequestContentLength | int | `524288000` | Maximum HTTP request body size in bytes. |
| config.logFormat | string | `"plain"` | Log output format. Supports "plain" (default) or "json". |
| config.logging | string | `"INFO"` | Log verbosity level for Besu components. |
| config.metrics.categories | list | `["BLOCKCHAIN","ETHEREUM","EXECUTORS","JVM","NETWORK","PEERS","PROCESS","PRUNER","RPC","SYNCHRONIZER","TRANSACTION_POOL"]` | Metrics categories exposed to Prometheus. |
| config.metrics.enabled | bool | `true` | Enable the Prometheus metrics endpoint. |
| config.metrics.host | string | `"0.0.0.0"` | Network interface for the metrics endpoint. |
| config.minGasPrice | int | `0` | Minimum gas price accepted for transactions (wei). |
| config.p2p.discoveryEnabled | bool | `true` | Enable the discovery protocol for automatic peer finding. |
| config.p2p.enabled | bool | `true` | Enable the devp2p networking subsystem. |
| config.p2p.interface | string | `"0.0.0.0"` | Network interface the P2P server binds to. |
| config.p2p.maxPeers | int | `25` | Maximum simultaneous peer connections. |
| config.p2p.staticNodesFile | string | `"/etc/besu/static-nodes.json"` | Path to the static-nodes.json file providing fixed peers. |
| config.privateKeyFilename | string | `"privateKey"` | Filename containing each node's private key within mounted secrets. |
| config.randomPeerPriorityEnabled | bool | `true` | Randomise peer priority to avoid deterministic ordering. |
| config.receiptCompactionEnabled | bool | `true` | Enable receipt compaction to reduce disk usage. |
| config.remoteConnectionsLimitEnabled | bool | `false` | Enable limits on concurrent remote JSON-RPC connections. |
| config.revertReasonEnabled | bool | `true` | Include revert reasons in RPC responses when failures occur. |
| config.rpc.txFeecap | int | `0` | Maximum fee per gas accepted for transactions submitted via RPC (0 disables the cap). |
| config.sync.minPeers | int | `1` | Minimum number of peers required before synchronisation starts. |
| config.sync.mode | string | `"FULL"` | Synchronisation mode (FULL, FAST, SNAP, etc.). |
| config.txPool.enableSaveRestore | bool | `true` | Persist the transaction pool to disk between restarts. |
| config.txPool.limitByAccountPercentage | int | `1` | Maximum percentage of the pool allowed per account. |
| config.txPool.maxSize | int | `100000` | Maximum transactions retained in the pool. |
| config.txPool.noLocalPriority | bool | `true` | Disable preferential treatment of locally submitted transactions. |
| config.txPool.type | string | `"SEQUENCED"` | Transaction ordering strategy (e.g., SEQUENCED). |
| config.ws.api | list | `["DEBUG","ETH","ADMIN","WEB3","IBFT","NET","TRACE","QBFT","PERM","TXPOOL","PLUGINS"]` | Enabled JSON-RPC API namespaces exposed over WebSockets. |
| config.ws.authenticationEnabled | bool | `false` | Enable JWT authentication for WebSocket requests. |
| config.ws.enabled | bool | `true` | Enable the WebSocket JSON-RPC listener. |
| config.ws.host | string | `"0.0.0.0"` | Network interface for the WebSocket listener. |
| config.ws.maxActiveConnections | int | `2000` | Maximum concurrent WebSocket connections. |
| config.ws.maxFrameSize | int | `2097152` | Maximum WebSocket frame size in bytes. |
| extraInitContainers | list | `[]` | Additional init containers appended verbatim to both StatefulSets. |
| fullnameOverride | string | `"besu-node"` | Override for the fully qualified release name used in resource naming. |
| global.artifacts.image.pullPolicy | string | `nil` |  |
| global.artifacts.image.registry | string | `nil` |  |
| global.artifacts.image.repository | string | `nil` |  |
| global.artifacts.image.tag | string | `nil` |  |
| global.labels."kots.io/app-slug" | string | `"settlemint-atk"` |  |
| httpRoute.annotations | object | `{}` |  |
| httpRoute.enabled | bool | `false` | Enable rendering of an HTTPRoute resource. |
| httpRoute.hostnames | list | `["chart-example.local"]` | HTTP hostnames matched by the route. |
| httpRoute.parentRefs | list | `[{"name":"gateway","sectionName":"http"}]` | Gateway references that should accept this route. |
| httpRoute.rules | list | `[{"matches":[{"path":{"type":"PathPrefix","value":"/headers"}}]}]` | Rules containing matches and optional filters evaluated by the Gateway. |
| httpRoute.rules[0].matches | list | `[{"path":{"type":"PathPrefix","value":"/headers"}}]` | Match conditions evaluated for each request. |
| httpRoute.rules[0].matches[0].path.type | string | `"PathPrefix"` | Path match type (Exact, PathPrefix, or RegularExpression). |
| httpRoute.rules[0].matches[0].path.value | string | `"/headers"` | Path value used when evaluating the request URL. |
| image.pullPolicy | string | `"IfNotPresent"` | Kubernetes image pull policy for Besu containers. |
| image.repository | string | `"docker.io/hyperledger/besu"` | OCI image repository hosting Hyperledger Besu. |
| image.tag | string | `"25.8.0"` | Specific Besu image tag to deploy. |
| imagePullSecrets | list | `[]` | Image pull secrets granting registry access for the Besu image. |
| ingress.annotations | object | `{}` |  |
| ingress.className | string | `""` | ingressClassName assigned to the Ingress for controller selection. |
| ingress.enabled | bool | `false` | Enable creation of an Ingress resource. |
| ingress.hosts | list | `[{"host":"chart-example.local","paths":[{"path":"/","pathType":"ImplementationSpecific"}]}]` | Hostname and path routing rules for the Ingress. |
| ingress.tls | list | `[]` | TLS configuration for Ingress hosts. |
| initContainer.tcpCheck.dependencies | list | `[]` | TCP dependencies expressed as name/endpoint pairs (host:port strings). |
| initContainer.tcpCheck.enabled | bool | `false` | Enable a tcp-check init container before Besu pods start. |
| initContainer.tcpCheck.image.pullPolicy | string | `"IfNotPresent"` | Image pull policy for the tcp-check init container. |
| initContainer.tcpCheck.image.repository | string | `"ghcr.io/settlemint/btp-waitforit"` | OCI image hosting the tcp-check utility. |
| initContainer.tcpCheck.image.tag | string | `"v7.7.10"` | Image tag for the tcp-check utility. |
| initContainer.tcpCheck.resources.limits.cpu | string | `"100m"` |  |
| initContainer.tcpCheck.resources.limits.memory | string | `"64Mi"` |  |
| initContainer.tcpCheck.resources.requests.cpu | string | `"10m"` |  |
| initContainer.tcpCheck.resources.requests.memory | string | `"32Mi"` |  |
| initContainer.tcpCheck.timeout | int | `120` | Timeout in seconds applied to each dependency probe. |
| livenessProbe.failureThreshold | int | `3` | Consecutive failures required before the container is restarted. |
| livenessProbe.httpGet.path | string | `"/readiness?minPeers=1&maxBlocksBehind=10000"` | HTTP path used for liveness probing. |
| livenessProbe.httpGet.port | string|int | `"json-rpc"` | Target container port serving the liveness endpoint. |
| livenessProbe.initialDelaySeconds | int | `30` | Seconds to wait before starting liveness checks. |
| livenessProbe.periodSeconds | int | `10` | Frequency of liveness checks in seconds. |
| livenessProbe.timeoutSeconds | int | `2` | Timeout in seconds before marking the probe as failed. |
| nameOverride | string | `""` | Override for the short chart name used in resource naming. |
| networkPolicy.annotations | object | `{}` | Additional annotations to add to the NetworkPolicy metadata. |
| networkPolicy.egress | list | `[{"ports":[{"port":53,"protocol":"UDP"}],"to":[{"namespaceSelector":{},"podSelector":{"matchLabels":{"k8s-app":"kube-dns"}}}]},{"ports":[{"port":30303,"protocol":"TCP"}],"to":[{"podSelector":{"matchLabels":{"app.kubernetes.io/name":"besu-statefulset"}}}]},{"ports":[{"port":30303,"protocol":"TCP"}],"to":[{"ipBlock":{"cidr":"0.0.0.0/0","except":["10.0.0.0/8","172.16.0.0/12","192.168.0.0/16"]}}]}]` | NetworkPolicy egress rules. Leave empty to deny all egress when enabled. |
| networkPolicy.enabled | bool | `false` | Create a NetworkPolicy restricting Besu pod ingress and egress. |
| networkPolicy.ingress | list | `[{"from":[{"podSelector":{"matchLabels":{"app.kubernetes.io/name":"txsigner"}}},{"podSelector":{"matchLabels":{"app.kubernetes.io/name":"erpc"}}},{"podSelector":{"matchLabels":{"app.kubernetes.io/name":"blockscout-stack"}}},{"podSelector":{"matchLabels":{"app.kubernetes.io/name":"graph-node"}}}],"ports":[{"port":8545,"protocol":"TCP"},{"port":8546,"protocol":"TCP"},{"port":8547,"protocol":"TCP"},{"port":9545,"protocol":"TCP"}]},{"from":[{"podSelector":{"matchLabels":{"app.kubernetes.io/name":"besu-statefulset"}}}],"ports":[{"port":30303,"protocol":"TCP"}]}]` | NetworkPolicy ingress rules. Leave empty to deny all ingress when enabled. |
| networkPolicy.labels | object | `{}` | Additional labels to add to the NetworkPolicy metadata. |
| networkPolicy.podSelector | object | `{}` | Optional override for the default pod selector; defaults to Besu workload labels when empty. |
| networkPolicy.policyTypes | list | `[]` | Policy types enforced by the NetworkPolicy. When empty, inferred from ingress/egress rules or defaults to both. |
| nodeSelector | object | `{}` |  |
| openShiftRoute.alternateBackends | list | `[]` | Additional backend references to balance traffic across services. |
| openShiftRoute.annotations | object | `{}` |  |
| openShiftRoute.enabled | bool | `false` | Enable creation of an OpenShift Route resource. |
| openShiftRoute.host | string | `""` | Desired external hostname for the Route; leave empty for automatic assignment. |
| openShiftRoute.path | string | `""` | URL path prefix handled by the Route. |
| openShiftRoute.port.targetPort | string | `"http"` | Named service port exposed through the Route. |
| openShiftRoute.tls | object|null | `nil` | TLS termination settings; set to null to disable TLS. |
| openShiftRoute.to.weight | int | `100` | Backend weight determining traffic distribution. |
| openShiftRoute.wildcardPolicy | string | `""` | Wildcard policy controlling subdomain routing (None or Subdomain). |
| persistence.accessModes | list | `["ReadWriteOnce"]` | Requested access modes for the PersistentVolumeClaim. |
| persistence.annotations | object | `{}` |  |
| persistence.enabled | bool | `true` | Enable persistent volume claims for ledger data. |
| persistence.existingClaim | string | `""` | Name of an existing PersistentVolumeClaim to reuse instead of creating new PVCs. |
| persistence.mountPath | string | `"/data"` | Container path where the persistent volume is mounted. |
| persistence.readOnly | bool | `false` | Mount the volume read-only when true. |
| persistence.retention.whenDeleted | string | `"Retain"` | Behaviour of PVCs when the Helm release is deleted. |
| persistence.retention.whenScaled | string | `"Retain"` | Behaviour of PVCs when the StatefulSet scales down. |
| persistence.selector | object | `{}` |  |
| persistence.size | string | `"20Gi"` | Requested storage capacity for each PersistentVolumeClaim. |
| persistence.storageClass | string | `""` | StorageClass name used for provisioning volumes; empty selects the cluster default. |
| persistence.subPath | string | `""` | Subdirectory of the volume to mount instead of the root. |
| persistence.volumeMode | string | `""` | Volume mode (Filesystem or Block) requested for the PVC. |
| persistence.volumeName | string | `"data"` | Logical name for the volume when using volumeClaimTemplates. |
| podAnnotations."prometheus.io/path" | string | `"/metrics"` | HTTP path exposing Prometheus-formatted metrics. |
| podAnnotations."prometheus.io/port" | string | `"9545"` | Container port value used by Prometheus to scrape metrics. |
| podAnnotations."prometheus.io/scheme" | string | `"http"` | HTTP scheme (http or https) used for metrics scraping. |
| podAnnotations."prometheus.io/scrape" | string | `"true"` | Enables Prometheus scraping of the Besu metrics endpoint. |
| podDisruptionBudgets.rpc | object | `{"annotations":{},"enabled":false,"labels":{},"maxUnavailable":null,"minAvailable":1,"unhealthyPodEvictionPolicy":""}` | PodDisruptionBudget governing RPC pods. |
| podDisruptionBudgets.rpc.annotations | object | `{}` | Additional annotations applied to the RPC PodDisruptionBudget. |
| podDisruptionBudgets.rpc.enabled | bool | `false` | Enable the RPC PodDisruptionBudget. |
| podDisruptionBudgets.rpc.labels | object | `{}` | Additional labels applied to the RPC PodDisruptionBudget. |
| podDisruptionBudgets.rpc.maxUnavailable | string | `nil` | Maximum RPC pods that can be disrupted at once. Mutually exclusive with minAvailable. |
| podDisruptionBudgets.rpc.minAvailable | int | `1` | Minimum RPC pods that must remain available. Mutually exclusive with maxUnavailable. |
| podDisruptionBudgets.rpc.unhealthyPodEvictionPolicy | string | `""` | Optional unhealthy pod eviction policy (Default or AlwaysAllow). |
| podDisruptionBudgets.validator | object | `{"annotations":{},"enabled":false,"labels":{},"maxUnavailable":null,"minAvailable":1,"unhealthyPodEvictionPolicy":""}` | PodDisruptionBudget controlling voluntary disruptions for validator pods. |
| podDisruptionBudgets.validator.annotations | object | `{}` | Additional annotations applied to the validator PodDisruptionBudget. |
| podDisruptionBudgets.validator.enabled | bool | `false` | Enable the validator PodDisruptionBudget. |
| podDisruptionBudgets.validator.labels | object | `{}` | Additional labels applied to the validator PodDisruptionBudget. |
| podDisruptionBudgets.validator.maxUnavailable | string | `nil` | Maximum validator pods that can be disrupted at once. Mutually exclusive with minAvailable. |
| podDisruptionBudgets.validator.minAvailable | int | `1` | Minimum validator pods that must remain available. Mutually exclusive with maxUnavailable. |
| podDisruptionBudgets.validator.unhealthyPodEvictionPolicy | string | `""` | Optional unhealthy pod eviction policy (Default or AlwaysAllow). |
| podLabels | object | `{}` |  |
| podSecurityContext | object | `{}` |  |
| priorityClassNames.rpc | string | `""` | PriorityClass name assigned to RPC pods. Leave empty to inherit namespace defaults. |
| priorityClassNames.validator | string | `""` | PriorityClass name assigned to validator pods. Leave empty to inherit namespace defaults. |
| readinessProbe | string | `nil` |  |
| resources | object | `{}` |  |
| rpcReplicaCount | int | `2` | Number of RPC node replicas provisioned via StatefulSet. |
| securityContext | object | `{}` |  |
| service.ports.discovery | int | `30303` | Discovery UDP port used by devp2p. |
| service.ports.graphql | int | `8547` | GraphQL API port. |
| service.ports.metrics | int | `9545` | Prometheus metrics port. |
| service.ports.rlpx | int | `30303` | RLPx TCP peer-to-peer port. |
| service.ports.rpc | int | `8545` | HTTP JSON-RPC port. |
| service.ports.ws | int | `8546` | WebSocket JSON-RPC port. |
| service.type | string | `"ClusterIP"` | Service type controlling how endpoints are published (ClusterIP, NodePort, etc.). |
| serviceAccount.annotations | object | `{}` | Metadata annotations applied to the ServiceAccount. |
| serviceAccount.automount | bool | `true` | Mount the ServiceAccount token volume into pods. |
| serviceAccount.create | bool | `true` | Create a ServiceAccount resource automatically for the release. |
| serviceAccount.name | string | `""` | Existing ServiceAccount name to reuse when creation is disabled. |
| tolerations | list | `[]` | Tolerations allowing pods to run on nodes with matching taints. |
| validatorReplicaCount | int | `nil` | Number of validator node replicas participating in consensus. Leave unset to derive from global.validatorReplicaCount. |
| volumeMounts | list | `[]` | Additional volume mounts applied to Besu containers. |
| volumes | list | `[]` | Extra volumes attached to Besu pods for custom configuration or secrets. |

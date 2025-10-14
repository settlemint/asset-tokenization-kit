# network-nodes

![Version: 2.0.0-beta.3](https://img.shields.io/badge/Version-2.0.0--beta.3-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: 2.0.0-beta.3](https://img.shields.io/badge/AppVersion-2.0.0--beta.3-informational?style=flat-square)

A Helm chart for Kubernetes

## Configuration

The following table lists the configurable parameters of this chart and their default values.

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
|affinity|object|-|Node and pod affinity or anti-affinity rules affecting scheduling decisions.|
|config|object|-|Core Besu configuration persisted as besu.conf for both validators and RPC nodes.|
|config.bonsaiLimitTrieLogsEnabled|bool|`false`|Emit Bonsai limit trie logs for debugging state transitions.|
|config.cacheLastBlocks|int|`1024`|Number of recent blocks cached in memory.|
|config.dataStorageFormat|string|`"FOREST"`|Ledger storage backend (FOREST or BONSAI).|
|config.genesisFile|string|`"/etc/besu/genesis.json"`|Filesystem path where Besu loads the merged genesis JSON produced at runtime.|
|config.graphql|object|-|GraphQL server configuration.|
|config.graphql.corsOrigins|list|-|Allowed CORS origins for GraphQL requests.|
|config.graphql.enabled|bool|`true`|Enable the GraphQL API server.|
|config.graphql.host|string|`"0.0.0.0"`|Network interface for the GraphQL server.|
|config.hostAllowlist|list|-|Hostnames allowed to access the RPC interfaces; `*` permits all.|
|config.http|object|-|HTTP JSON-RPC server configuration.|
|config.http.api|list|-|Enabled JSON-RPC API namespaces exposed over HTTP.|
|config.http.authenticationEnabled|bool|`false`|Enable JWT authentication for HTTP JSON-RPC requests.|
|config.http.corsOrigins|list|-|Allowed CORS origins for HTTP JSON-RPC requests.|
|config.http.enabled|bool|`true`|Enable the HTTP JSON-RPC listener.|
|config.http.host|string|`"0.0.0.0"`|Network interface for the HTTP JSON-RPC listener.|
|config.http.maxActiveConnections|int|`2000`|Maximum concurrent HTTP JSON-RPC connections.|
|config.http.maxBatchSize|int|`512`|Maximum number of batched JSON-RPC calls per request.|
|config.http.maxRequestContentLength|int|`524288000`|Maximum HTTP request body size in bytes.|
|config.logFormat|string|`"plain"`|Log output format. Supports "plain" (default) or "json".|
|config.logging|string|`"INFO"`|Log verbosity level for Besu components.|
|config.metrics|object|-|Prometheus metrics export configuration.|
|config.metrics.categories|list|-|Metrics categories exposed to Prometheus.|
|config.metrics.enabled|bool|`true`|Enable the Prometheus metrics endpoint.|
|config.metrics.host|string|`"0.0.0.0"`|Network interface for the metrics endpoint.|
|config.minGasPrice|int|`0`|Minimum gas price accepted for transactions (wei).|
|config.p2p|object|-|Peer-to-peer networking settings.|
|config.p2p.discoveryEnabled|bool|`true`|Enable the discovery protocol for automatic peer finding.|
|config.p2p.enabled|bool|`true`|Enable the devp2p networking subsystem.|
|config.p2p.interface|string|`"0.0.0.0"`|Network interface the P2P server binds to.|
|config.p2p.maxPeers|int|`25`|Maximum simultaneous peer connections.|
|config.p2p.staticNodesFile|string|`"/etc/besu/static-nodes.json"`|Path to the static-nodes.json file providing fixed peers.|
|config.privateKeyFilename|string|`"privateKey"`|Filename containing each node's private key within mounted secrets.|
|config.randomPeerPriorityEnabled|bool|`true`|Randomise peer priority to avoid deterministic ordering.|
|config.receiptCompactionEnabled|bool|`true`|Enable receipt compaction to reduce disk usage.|
|config.remoteConnectionsLimitEnabled|bool|`false`|Enable limits on concurrent remote JSON-RPC connections.|
|config.revertReasonEnabled|bool|`true`|Include revert reasons in RPC responses when failures occur.|
|config.rpc|object|-|JSON-RPC subsystem configuration shared by HTTP and WebSocket servers.|
|config.rpc.txFeecap|int|`0`|Maximum fee per gas accepted for transactions submitted via RPC (0 disables the cap).|
|config.sync|object|-|Chain synchronisation controls.|
|config.sync.minPeers|int|`1`|Minimum number of peers required before synchronisation starts.|
|config.sync.mode|string|`"FULL"`|Synchronisation mode (FULL, FAST, SNAP, etc.).|
|config.txPool|object|-|Transaction pool configuration for ingress and prioritisation.|
|config.txPool.enableSaveRestore|bool|`true`|Persist the transaction pool to disk between restarts.|
|config.txPool.limitByAccountPercentage|int|`1`|Maximum percentage of the pool allowed per account.|
|config.txPool.maxSize|int|`100000`|Maximum transactions retained in the pool.|
|config.txPool.noLocalPriority|bool|`true`|Disable preferential treatment of locally submitted transactions.|
|config.txPool.type|string|`"SEQUENCED"`|Transaction ordering strategy (e.g., SEQUENCED).|
|config.ws|object|-|WebSocket JSON-RPC server configuration.|
|config.ws.api|list|-|Enabled JSON-RPC API namespaces exposed over WebSockets.|
|config.ws.authenticationEnabled|bool|`false`|Enable JWT authentication for WebSocket requests.|
|config.ws.enabled|bool|`true`|Enable the WebSocket JSON-RPC listener.|
|config.ws.host|string|`"0.0.0.0"`|Network interface for the WebSocket listener.|
|config.ws.maxActiveConnections|int|`2000`|Maximum concurrent WebSocket connections.|
|config.ws.maxFrameSize|int|`2097152`|Maximum WebSocket frame size in bytes.|
|extraInitContainers|list|-|Additional init containers appended verbatim to both StatefulSets.|
|fullnameOverride|string|`"besu-node"`|Override for the fully qualified release name used in resource naming.|
|global|object|-|Global configuration values inherited from parent charts.|
|global.labels|object|-|Kubernetes labels applied to all resources across the installation.|
|global.labels."kots.io/app-slug"|string|`"settlemint-atk"`|KOTS application slug identifier for Replicated application management.|
|httpRoute|object|-|Gateway API HTTPRoute configuration for clusters with gateway-api controllers.|
|httpRoute.annotations|object|-|Metadata annotations applied to the HTTPRoute.|
|httpRoute.enabled|bool|`false`|Enable rendering of an HTTPRoute resource.|
|httpRoute.hostnames|list|-|HTTP hostnames matched by the route.|
|httpRoute.parentRefs|list|-|Gateway references that should accept this route.|
|httpRoute.parentRefs[0].name|string|`"gateway"`|Gateway name.|
|httpRoute.parentRefs[0].sectionName|string|`"http"`|Listener section name within the Gateway.|
|httpRoute.rules|list|-|Rules containing matches and optional filters evaluated by the Gateway.|
|httpRoute.rules[0].matches|list|-|Match conditions evaluated for each request.|
|httpRoute.rules[0].matches[0].path|object|-|Path matching condition for the request.|
|httpRoute.rules[0].matches[0].path.type|string|`"PathPrefix"`|Path match type (Exact, PathPrefix, or RegularExpression).|
|httpRoute.rules[0].matches[0].path.value|string|`"/headers"`|Path value used when evaluating the request URL.|
|image|object|-|Container image configuration shared by validator and RPC pods.|
|image.pullPolicy|string|`"IfNotPresent"`|Kubernetes image pull policy for Besu containers.|
|image.repository|string|`"docker.io/hyperledger/besu"`|OCI image repository hosting Hyperledger Besu.|
|image.tag|string|`"25.9.0"`|Specific Besu image tag to deploy.|
|imagePullSecrets|list|-|Image pull secrets granting registry access for the Besu image.|
|ingress|object|-|Ingress configuration used to expose RPC services via Kubernetes Ingress resources.|
|ingress.annotations|object|-|Metadata annotations applied to the Ingress resource.|
|ingress.className|string|`""`|ingressClassName assigned to the Ingress for controller selection.|
|ingress.enabled|bool|`false`|Enable creation of an Ingress resource.|
|ingress.hosts|list|-|Hostname and path routing rules for the Ingress.|
|ingress.hosts[0].host|string|`"chart-example.local"`|Hostname for the Ingress rule.|
|ingress.hosts[0].paths|list|-|Path-based routing rules for the host.|
|ingress.hosts[0].paths[0].path|string|`"/"`|URL path prefix.|
|ingress.hosts[0].paths[0].pathType|string|`"ImplementationSpecific"`|Path matching type (Exact, Prefix, or ImplementationSpecific).|
|ingress.tls|list|-|TLS configuration for Ingress hosts.|
|initContainer|object|-|Init container configuration shared across validator and RPC workloads.|
|initContainer.compileGenesis|object|-|Compile-genesis init container configuration for merging allocation ConfigMaps.|
|initContainer.compileGenesis.enabled|bool|`true`|Enable the compile-genesis init container that merges allocation ConfigMaps into the runtime genesis file.|
|initContainer.compileGenesis.image|object|-|Container image configuration for the compile-genesis init container.|
|initContainer.compileGenesis.image.pullPolicy|string|`"IfNotPresent"`|Image pull policy for the compile-genesis init container.|
|initContainer.compileGenesis.image.repository|string|`"ghcr.io/settlemint/network-bootstrapper"`|OCI image hosting the network-bootstrapper CLI used for genesis compilation.|
|initContainer.compileGenesis.image.tag|string|`"1.2.3"`|Image tag for the network-bootstrapper CLI.|
|initContainer.compileGenesis.outputPath|string|`""`|Filesystem path populated with the compiled genesis JSON. Leave empty to mirror config.genesisFile.|
|initContainer.compileGenesis.resources|object|-|Optional Kubernetes resource requests/limits for the compile-genesis init container.|
|initContainer.tcpCheck|object|-|TCP check init container configuration for validating service dependencies.|
|initContainer.tcpCheck.dependencies|list|-|TCP dependencies expressed as name/endpoint pairs (host:port strings).|
|initContainer.tcpCheck.enabled|bool|`false`|Enable a tcp-check init container before Besu pods start.|
|initContainer.tcpCheck.image|object|-|Container image configuration for the tcp-check init container.|
|initContainer.tcpCheck.image.pullPolicy|string|`"IfNotPresent"`|Image pull policy for the tcp-check init container.|
|initContainer.tcpCheck.image.repository|string|`"ghcr.io/settlemint/btp-waitforit"`|OCI image hosting the tcp-check utility.|
|initContainer.tcpCheck.image.tag|string|`"v7.7.13"`|Image tag for the tcp-check utility.|
|initContainer.tcpCheck.resources|object|-|Resource requests and limits for the tcp-check init container.|
|initContainer.tcpCheck.resources.limits|object|-|Maximum resource limits.|
|initContainer.tcpCheck.resources.limits.cpu|string|`"300m"`|CPU limit.|
|initContainer.tcpCheck.resources.limits.memory|string|`"64Mi"`|Memory limit.|
|initContainer.tcpCheck.resources.requests|object|-|Minimum resource requests.|
|initContainer.tcpCheck.resources.requests.cpu|string|`"10m"`|CPU request.|
|initContainer.tcpCheck.resources.requests.memory|string|`"32Mi"`|Memory request.|
|initContainer.tcpCheck.timeout|int|`120`|Timeout in seconds applied to each dependency probe.|
|livenessProbe|object|-|Liveness probe configuration ensuring containers restart when unhealthy.|
|livenessProbe.failureThreshold|int|`3`|Consecutive failures required before the container is restarted.|
|livenessProbe.httpGet|object|-|HTTP GET probe configuration hitting the Besu liveness endpoint.|
|livenessProbe.httpGet.path|string|`"/readiness?minPeers=1&maxBlocksBehind=10000"`|HTTP path used for liveness probing.|
|livenessProbe.httpGet.port|string|int|`"json-rpc"`|Target container port serving the liveness endpoint.|
|livenessProbe.initialDelaySeconds|int|`30`|Seconds to wait before starting liveness checks.|
|livenessProbe.periodSeconds|int|`10`|Frequency of liveness checks in seconds.|
|livenessProbe.timeoutSeconds|int|`2`|Timeout in seconds before marking the probe as failed.|
|nameOverride|string|`""`|Override for the short chart name used in resource naming.|
|networkPolicy|object|-|NetworkPolicy configuration applied to Besu pods.|
|networkPolicy.annotations|object|-|Additional annotations to add to the NetworkPolicy metadata.|
|networkPolicy.egress|list|-|NetworkPolicy egress rules. Leave empty to deny all egress when enabled.|
|networkPolicy.egress[0]|object|-|Allow DNS resolution for outbound hosts.|
|networkPolicy.egress[0].ports|list|-|DNS port configuration.|
|networkPolicy.egress[0].ports[0].port|int|`53`|DNS port number.|
|networkPolicy.egress[0].ports[0].protocol|string|`"UDP"`|Protocol type for DNS (UDP).|
|networkPolicy.egress[0].to|list|-|Destination selectors for DNS egress.|
|networkPolicy.egress[0].to[0].namespaceSelector|object|-|Namespace selector for DNS pods (empty matches all namespaces).|
|networkPolicy.egress[0].to[0].podSelector|object|-|Pod selector for kube-dns pods.|
|networkPolicy.egress[0].to[0].podSelector.matchLabels|object|-|Label matchers selecting kube-dns pods.|
|networkPolicy.egress[0].to[0].podSelector.matchLabels.k8s-app|string|`"kube-dns"`|Kubernetes DNS application label.|
|networkPolicy.egress[1]|object|-|Permit Besu pods to speak to peers inside the namespace.|
|networkPolicy.egress[1].ports|list|-|P2P port for internal communication.|
|networkPolicy.egress[1].ports[0].port|int|`30303`|RLPx P2P port number.|
|networkPolicy.egress[1].ports[0].protocol|string|`"TCP"`|Protocol type for internal P2P.|
|networkPolicy.egress[1].to|list|-|Destination pod selectors for internal P2P egress.|
|networkPolicy.egress[1].to[0].podSelector|object|-|Pod selector for Besu StatefulSet pods.|
|networkPolicy.egress[1].to[0].podSelector.matchLabels|object|-|Label matchers selecting Besu StatefulSet pods.|
|networkPolicy.egress[1].to[0].podSelector.matchLabels."app.kubernetes.io/name"|string|`"besu-statefulset"`|Application name label for Besu StatefulSet.|
|networkPolicy.egress[2]|object|-|Allow outbound P2P connections to external peers (public networks).|
|networkPolicy.egress[2].ports|list|-|P2P port for external communication.|
|networkPolicy.egress[2].ports[0].port|int|`30303`|RLPx P2P port number.|
|networkPolicy.egress[2].ports[0].protocol|string|`"TCP"`|Protocol type for external P2P.|
|networkPolicy.egress[2].to|list|-|IP block selectors for external P2P egress.|
|networkPolicy.egress[2].to[0].ipBlock|object|-|IP block configuration for external network access.|
|networkPolicy.egress[2].to[0].ipBlock.cidr|string|`"0.0.0.0/0"`|CIDR range allowing all external IPs.|
|networkPolicy.egress[2].to[0].ipBlock.except|list|-|Exception list blocking private IP ranges from egress.|
|networkPolicy.egress[2].to[0].ipBlock.except[0]|string|`"10.0.0.0/8"`|Private IP range 10.0.0.0/8.|
|networkPolicy.egress[2].to[0].ipBlock.except[1]|string|`"172.16.0.0/12"`|Private IP range 172.16.0.0/12.|
|networkPolicy.egress[2].to[0].ipBlock.except[2]|string|`"192.168.0.0/16"`|Private IP range 192.168.0.0/16.|
|networkPolicy.enabled|bool|`false`|Create a NetworkPolicy restricting Besu pod ingress and egress.|
|networkPolicy.ingress|list|-|NetworkPolicy ingress rules. Leave empty to deny all ingress when enabled.|
|networkPolicy.ingress[0]|object|-|Allow blockchain clients to reach RPC, WS, GraphQL, and metrics endpoints.|
|networkPolicy.ingress[0].from|list|-|Source pod selectors allowed to connect to Besu services.|
|networkPolicy.ingress[0].from[0].podSelector|object|-|Pod selector allowing txsigner pods ingress access.|
|networkPolicy.ingress[0].from[0].podSelector.matchLabels|object|-|Label matchers selecting txsigner pods.|
|networkPolicy.ingress[0].from[0].podSelector.matchLabels."app.kubernetes.io/name"|string|`"txsigner"`|Application name label for txsigner.|
|networkPolicy.ingress[0].from[1].podSelector|object|-|Pod selector allowing erpc pods ingress access.|
|networkPolicy.ingress[0].from[1].podSelector.matchLabels|object|-|Label matchers selecting erpc pods.|
|networkPolicy.ingress[0].from[1].podSelector.matchLabels."app.kubernetes.io/name"|string|`"erpc"`|Application name label for erpc.|
|networkPolicy.ingress[0].from[2].podSelector|object|-|Pod selector allowing blockscout-stack pods ingress access.|
|networkPolicy.ingress[0].from[2].podSelector.matchLabels|object|-|Label matchers selecting blockscout-stack pods.|
|networkPolicy.ingress[0].from[2].podSelector.matchLabels."app.kubernetes.io/name"|string|`"blockscout-stack"`|Application name label for blockscout-stack.|
|networkPolicy.ingress[0].from[3].podSelector|object|-|Pod selector allowing graph-node pods ingress access.|
|networkPolicy.ingress[0].from[3].podSelector.matchLabels|object|-|Label matchers selecting graph-node pods.|
|networkPolicy.ingress[0].from[3].podSelector.matchLabels."app.kubernetes.io/name"|string|`"graph-node"`|Application name label for graph-node.|
|networkPolicy.ingress[0].ports|list|-|Target ports exposed to the selected sources.|
|networkPolicy.ingress[0].ports[0].port|int|`8545`|HTTP JSON-RPC port number.|
|networkPolicy.ingress[0].ports[0].protocol|string|`"TCP"`|Protocol type for HTTP JSON-RPC port.|
|networkPolicy.ingress[0].ports[1].port|int|`8546`|WebSocket JSON-RPC port number.|
|networkPolicy.ingress[0].ports[1].protocol|string|`"TCP"`|Protocol type for WebSocket JSON-RPC port.|
|networkPolicy.ingress[0].ports[2].port|int|`8547`|GraphQL API port number.|
|networkPolicy.ingress[0].ports[2].protocol|string|`"TCP"`|Protocol type for GraphQL API port.|
|networkPolicy.ingress[0].ports[3].port|int|`9545`|Prometheus metrics port number.|
|networkPolicy.ingress[0].ports[3].protocol|string|`"TCP"`|Protocol type for metrics port.|
|networkPolicy.ingress[1]|object|-|Permit intra-cluster P2P traffic among Besu nodes.|
|networkPolicy.ingress[1].from|list|-|Source pod selectors for P2P communication.|
|networkPolicy.ingress[1].from[0].podSelector|object|-|Pod selector for Besu StatefulSet pods.|
|networkPolicy.ingress[1].from[0].podSelector.matchLabels|object|-|Label matchers selecting Besu StatefulSet pods.|
|networkPolicy.ingress[1].from[0].podSelector.matchLabels."app.kubernetes.io/name"|string|`"besu-statefulset"`|Application name label for Besu StatefulSet.|
|networkPolicy.ingress[1].ports|list|-|P2P port exposed to Besu peers.|
|networkPolicy.ingress[1].ports[0].port|int|`30303`|RLPx P2P port number.|
|networkPolicy.ingress[1].ports[0].protocol|string|`"TCP"`|Protocol type for P2P port.|
|networkPolicy.labels|object|-|Additional labels to add to the NetworkPolicy metadata.|
|networkPolicy.podSelector|object|-|Optional override for the default pod selector; defaults to Besu workload labels when empty.|
|networkPolicy.policyTypes|list|-|Policy types enforced by the NetworkPolicy. When empty, inferred from ingress/egress rules or defaults to both.|
|nodeSelector|object|-|Node selector constraints influencing where Besu pods can schedule.|
|openShiftRoute|object|-|OpenShift Route configuration for exposing services through the OpenShift router.|
|openShiftRoute.alternateBackends|list|-|Additional backend references to balance traffic across services.|
|openShiftRoute.annotations|object|-|Metadata annotations applied to the Route.|
|openShiftRoute.enabled|bool|`false`|Enable creation of an OpenShift Route resource.|
|openShiftRoute.host|string|`""`|Desired external hostname for the Route; leave empty for automatic assignment.|
|openShiftRoute.path|string|`""`|URL path prefix handled by the Route.|
|openShiftRoute.port|object|-|Target service port configuration for the Route.|
|openShiftRoute.port.targetPort|string|`"http"`|Named service port exposed through the Route.|
|openShiftRoute.tls|object|null|`nil`|TLS termination settings; set to null to disable TLS.|
|openShiftRoute.to|object|-|Primary backend configuration for the Route.|
|openShiftRoute.to.weight|int|`100`|Backend weight determining traffic distribution.|
|openShiftRoute.wildcardPolicy|string|`""`|Wildcard policy controlling subdomain routing (None or Subdomain).|
|persistence|object|-|Persistent storage configuration for both validator and RPC StatefulSets.|
|persistence.accessModes|list|-|Requested access modes for the PersistentVolumeClaim.|
|persistence.annotations|object|-|Metadata annotations applied to generated PVCs.|
|persistence.enabled|bool|`true`|Enable persistent volume claims for ledger data.|
|persistence.existingClaim|string|`""`|Name of an existing PersistentVolumeClaim to reuse instead of creating new PVCs.|
|persistence.mountPath|string|`"/data"`|Container path where the persistent volume is mounted.|
|persistence.readOnly|bool|`false`|Mount the volume read-only when true.|
|persistence.retention|object|-|Retention policy controlling PVC lifecycle on delete or scale operations.|
|persistence.retention.whenDeleted|string|`"Retain"`|Behaviour of PVCs when the Helm release is deleted.|
|persistence.retention.whenScaled|string|`"Retain"`|Behaviour of PVCs when the StatefulSet scales down.|
|persistence.selector|object|-|PVC selector allowing binding to specific PersistentVolumes.|
|persistence.size|string|`"20Gi"`|Requested storage capacity for each PersistentVolumeClaim.|
|persistence.storageClass|string|`""`|StorageClass name used for provisioning volumes; empty selects the cluster default.|
|persistence.subPath|string|`""`|Subdirectory of the volume to mount instead of the root.|
|persistence.volumeMode|string|`""`|Volume mode (Filesystem or Block) requested for the PVC.|
|persistence.volumeName|string|`"data"`|Logical name for the volume when using volumeClaimTemplates.|
|podAnnotations|object|-|Pod annotations merged onto all Besu pods.|
|podAnnotations."prometheus.io/path"|string|`"/metrics"`|HTTP path exposing Prometheus-formatted metrics.|
|podAnnotations."prometheus.io/port"|string|`"9545"`|Container port value used by Prometheus to scrape metrics.|
|podAnnotations."prometheus.io/scheme"|string|`"http"`|HTTP scheme (http or https) used for metrics scraping.|
|podAnnotations."prometheus.io/scrape"|string|`"true"`|Enables Prometheus scraping of the Besu metrics endpoint.|
|podDisruptionBudgets|object|-|PodDisruptionBudget configuration for validator and RPC workloads.|
|podDisruptionBudgets.rpc|object|-|PodDisruptionBudget governing RPC pods.|
|podDisruptionBudgets.rpc.annotations|object|-|Additional annotations applied to the RPC PodDisruptionBudget.|
|podDisruptionBudgets.rpc.enabled|bool|`false`|Enable the RPC PodDisruptionBudget.|
|podDisruptionBudgets.rpc.labels|object|-|Additional labels applied to the RPC PodDisruptionBudget.|
|podDisruptionBudgets.rpc.maxUnavailable|int|`nil`|Maximum RPC pods that can be disrupted at once. Mutually exclusive with minAvailable.|
|podDisruptionBudgets.rpc.minAvailable|int|`1`|Minimum RPC pods that must remain available. Mutually exclusive with maxUnavailable.|
|podDisruptionBudgets.rpc.unhealthyPodEvictionPolicy|string|`""`|Optional unhealthy pod eviction policy (Default or AlwaysAllow).|
|podDisruptionBudgets.validator|object|-|PodDisruptionBudget controlling voluntary disruptions for validator pods.|
|podDisruptionBudgets.validator.annotations|object|-|Additional annotations applied to the validator PodDisruptionBudget.|
|podDisruptionBudgets.validator.enabled|bool|`false`|Enable the validator PodDisruptionBudget.|
|podDisruptionBudgets.validator.labels|object|-|Additional labels applied to the validator PodDisruptionBudget.|
|podDisruptionBudgets.validator.maxUnavailable|int|`nil`|Maximum validator pods that can be disrupted at once. Mutually exclusive with minAvailable.|
|podDisruptionBudgets.validator.minAvailable|int|`1`|Minimum validator pods that must remain available. Mutually exclusive with maxUnavailable.|
|podDisruptionBudgets.validator.unhealthyPodEvictionPolicy|string|`""`|Optional unhealthy pod eviction policy (Default or AlwaysAllow).|
|podLabels|object|-|Additional labels applied to all Besu pods.|
|podSecurityContext|object|-|Pod-level security context shared by all containers.|
|priorityClassNames|object|-|PriorityClass configuration applied to Besu workloads.|
|priorityClassNames.rpc|string|`""`|PriorityClass name assigned to RPC pods. Leave empty to inherit namespace defaults.|
|priorityClassNames.validator|string|`""`|PriorityClass name assigned to validator pods. Leave empty to inherit namespace defaults.|
|rbac|object|-|RBAC configuration controlling Role/RoleBinding creation for accessing Besu artifacts.|
|rbac.create|bool|`true`|Create Role and RoleBinding granting pods read access to ConfigMaps/Secrets.|
|readinessProbe|object|-|Readiness probe configuration signalling when pods can accept traffic.|
|replicaCount|int|`6`|Total number of Besu pods (validators + RPC). Used for documentation summaries.|
|resources|object|-|CPU and memory requests or limits for Besu containers.|
|resources.limits.cpu|string|`"180m"`|CPU limit per Besu pod (approx. 3x request to target ~33% utilization).|
|resources.limits.memory|string|`"1024Mi"`|Memory limit per Besu pod|
|resources.requests.cpu|string|`"60m"`|CPU request per Besu pod|
|resources.requests.memory|string|`"512Mi"`|Memory request per Besu pod|
|rpcReplicaCount|int|`2`|Number of RPC node replicas provisioned via StatefulSet.|
|securityContext|object|-|Container-level security context applied to Besu containers.|
|service|object|-|Kubernetes Service definition exposing Besu endpoints.|
|service.ports|object|-|Named Service ports exposing Besu interfaces.|
|service.ports.discovery|int|`30303`|Discovery UDP port used by devp2p.|
|service.ports.graphql|int|`8547`|GraphQL API port.|
|service.ports.metrics|int|`9545`|Prometheus metrics port.|
|service.ports.rlpx|int|`30303`|RLPx TCP peer-to-peer port.|
|service.ports.rpc|int|`8545`|HTTP JSON-RPC port.|
|service.ports.ws|int|`8546`|WebSocket JSON-RPC port.|
|service.type|string|`"ClusterIP"`|Service type controlling how endpoints are published (ClusterIP, NodePort, etc.).|
|serviceAccount|object|-|Kubernetes ServiceAccount configuration applied to Besu pods.|
|serviceAccount.annotations|object|-|Metadata annotations applied to the ServiceAccount.|
|serviceAccount.automount|bool|`true`|Mount the ServiceAccount token volume into pods.|
|serviceAccount.create|bool|`true`|Create a ServiceAccount resource automatically for the release.|
|serviceAccount.name|string|`""`|Existing ServiceAccount name to reuse when creation is disabled.|
|tolerations|list|-|Tolerations allowing pods to run on nodes with matching taints.|
|validatorReplicaCount|int|`4`|Number of validator node replicas participating in consensus. Leave unset to derive from global.validatorReplicaCount.|
|volumeMounts|list|-|Additional volume mounts applied to Besu containers.|
|volumes|list|-|Extra volumes attached to Besu pods for custom configuration or secrets.|

## Resource Summary

| Component | Replicas | Request CPU | Limit CPU | Request Memory | Limit Memory | Storage |
|-----------|----------|-------------|-----------|----------------|--------------|---------|
| initContainer.tcpCheck | 1 | 10m | 300m | 32Mi | 64Mi | - |
| **Totals** | - | 0.01 cores (10m) | 0.30 cores (300m) | 32Mi (0.03Gi) | 64Mi (0.06Gi) | - |

## Maintainers

| Name | Email | Url |
| ---- | ------ | --- |
| SettleMint | <support@settlemint.com> | <https://settlemint.com> |


# blockscout

![Version: 2.0.0-alpha.18](https://img.shields.io/badge/Version-2.0.0--alpha.18-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: 2.0.0-alpha.18](https://img.shields.io/badge/AppVersion-2.0.0--alpha.18-informational?style=flat-square)

A Helm chart for Blockscout blockchain explorer stack

## Configuration

The following table lists the configurable parameters of this chart and their default values.

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
|blockscout|object|-|Blockscout backend configuration|
|blockscout.affinity|object|-|Affinity for pod assignment|
|blockscout.annotations|object|-|Annotations for Blockscout backend deployment|
|blockscout.containerSecurityContext|object|-|Container Security Context configuration for Blockscout backend (overrides global.securityContexts.container)|
|blockscout.enabled|bool|`true`|Enable Blockscout backend deployment|
|blockscout.env|object|-|Environment variables for Blockscout backend|
|blockscout.env.ADMIN_PANEL_ENABLED|string|`"true"`|Enable admin panel|
|blockscout.env.API_GRAPHQL_MAX_COMPLEXITY|string|`"1000"`|GraphQL API maximum complexity|
|blockscout.env.API_URL|string|`"https://explorer.k8s.orb.local"`|API URL|
|blockscout.env.DATABASE_TIMEOUT|string|`"60000"`|Database timeout|
|blockscout.env.DATABASE_URL|string|`""`|Database connection URL (overrides global.datastores.blockscout.postgresql)|
|blockscout.env.DISABLE_EXCHANGE_RATES|string|`"true"`|Disable exchange rates|
|blockscout.env.ECTO_ADAPTER_TIMEOUT|string|`"60000"`|Database adapter timeout|
|blockscout.env.ECTO_USE_SSL|string|`"false"`|Use SSL for database connection|
|blockscout.env.EMISSION_FORMAT|string|`"DEFAULT"`|Emission format|
|blockscout.env.ETHEREUM_JSONRPC_HTTP_URL|string|`"http://erpc:4000/settlemint/evm/{{ include \"blockscout.chainId\" . }}"`|Ethereum JSON-RPC HTTP URL|
|blockscout.env.ETHEREUM_JSONRPC_TRACE_URL|string|`"http://erpc:4000/settlemint/evm/{{ include \"blockscout.chainId\" . }}"`|Ethereum JSON-RPC trace URL|
|blockscout.env.ETHEREUM_JSONRPC_VARIANT|string|`"besu"`|Ethereum JSON-RPC variant|
|blockscout.env.FETCH_REWARDS_WAY|string|`"trace_block"`|Fetch rewards method|
|blockscout.env.IPFS_GATEWAY_URL|string|`"https://ipfs.io/ipfs"`|IPFS gateway URL|
|blockscout.env.IPFS_PUBLIC_GATEWAY_URL|string|`"https://ipfs.io/ipfs"`|IPFS public gateway URL|
|blockscout.env.MIX_ENV|string|`"prod"`|Mix environment|
|blockscout.env.NETWORK|string|`"mainnet"`|Network type (mainnet/testnet)|
|blockscout.env.OTHER_EXPLORERS|string|`"{}"`|Other explorers configuration|
|blockscout.env.POOL_SIZE|string|`"10"`|Database pool size|
|blockscout.env.POOL_SIZE_API|string|`"10"`|API database pool size|
|blockscout.env.SECRET_KEY_BASE|string|`"atk"`|Secret key base for Phoenix application|
|blockscout.env.SHOW_TXS_CHART|string|`"true"`|Show transactions chart|
|blockscout.env.SUBNETWORK|string|`"ATK"`|Subnetwork name|
|blockscout.env.SUPPORTED_CHAINS|string|`"{}"`|Supported chains configuration|
|blockscout.env.TXS_STATS_ENABLED|string|`"true"`|Enable transaction statistics|
|blockscout.env.TZDATA_DIR|string|`"/tmp/tzdata"`|Timezone data directory|
|blockscout.env.WEBAPP_URL|string|`"https://explorer.k8s.orb.local"`|Web application URL|
|blockscout.extraInitContainers|list|-|Additional init containers appended verbatim|
|blockscout.image|object|-|Blockscout backend image configuration|
|blockscout.image.pullPolicy|string|`"IfNotPresent"`|Blockscout backend image pull policy|
|blockscout.image.repository|string|`"harbor.settlemint.com/ghcr.io/blockscout/blockscout"`|Blockscout backend image repository|
|blockscout.image.tag|string|`"9.0.2"`|Blockscout backend image tag (immutable tags are recommended)|
|blockscout.ingress|object|-|Ingress parameters for Blockscout backend|
|blockscout.ingress.annotations|object|-|Additional annotations for the Ingress resource|
|blockscout.ingress.className|string|`"atk-nginx"`|IngressClass that will be be used to implement the Ingress (Kubernetes 1.18+)|
|blockscout.ingress.enabled|bool|`true`|Enable ingress record generation for Blockscout backend|
|blockscout.ingress.hostname|string|`"explorer.k8s.orb.local"`|Default host for the ingress record|
|blockscout.ingress.tls|list|-|TLS configuration for the ingress|
|blockscout.init|object|-|Init container configuration for database migrations|
|blockscout.init.args|list|-|Init container arguments|
|blockscout.init.command|list|-|Init container command|
|blockscout.init.enabled|bool|`true`|Enable init container|
|blockscout.initContainer|object|-|TCP-based dependency checks for Blockscout|
|blockscout.initContainer.tcpCheck|object|-|TCP connection check configuration|
|blockscout.initContainer.tcpCheck.enabled|bool|`true`|Enable TCP check init container|
|blockscout.initContainer.tcpCheck.image|object|-|TCP check container image configuration|
|blockscout.initContainer.tcpCheck.image.pullPolicy|string|`"IfNotPresent"`|TCP check container image pull policy|
|blockscout.initContainer.tcpCheck.image.repository|string|`"harbor.settlemint.com/ghcr.io/settlemint/btp-waitforit"`|TCP check container image repository|
|blockscout.initContainer.tcpCheck.image.tag|string|`"v7.7.10"`|TCP check container image tag|
|blockscout.initContainer.tcpCheck.resources|object|-|TCP check container resource requests and limits|
|blockscout.initContainer.tcpCheck.resources.dependencies|list|-|List of service dependencies to check|
|blockscout.initContainer.tcpCheck.resources.dependencies[0]|string|`{"endpoint":"{{ include \"atk.postgresql.endpoint\" (dict \"context\" $ \"chartKey\" \"blockscout\" \"local\" $.Values.postgresql) }}","name":"postgresql"}`|Dependency name|
|blockscout.initContainer.tcpCheck.resources.dependencies[0].endpoint|string|`"{{ include \"atk.postgresql.endpoint\" (dict \"context\" $ \"chartKey\" \"blockscout\" \"local\" $.Values.postgresql) }}"`|Dependency endpoint to check|
|blockscout.initContainer.tcpCheck.resources.limits|object|-|Resource limits for TCP check container|
|blockscout.initContainer.tcpCheck.resources.limits.cpu|string|`"300m"`|CPU limit for TCP check container|
|blockscout.initContainer.tcpCheck.resources.limits.memory|string|`"64Mi"`|Memory limit for TCP check container|
|blockscout.initContainer.tcpCheck.resources.requests|object|-|Resource requests for TCP check container|
|blockscout.initContainer.tcpCheck.resources.requests.cpu|string|`"10m"`|CPU request for TCP check container|
|blockscout.initContainer.tcpCheck.resources.requests.memory|string|`"32Mi"`|Memory request for TCP check container|
|blockscout.initContainer.tcpCheck.timeout|int|`120`|Timeout in seconds for TCP checks|
|blockscout.initContainerSecurityContext|object|-|Init container Security Context configuration for Blockscout backend (overrides global.securityContexts.container)|
|blockscout.livenessProbe|object|-|Configure Blockscout backend containers' liveness probe|
|blockscout.livenessProbe.enabled|bool|`true`|Enable livenessProbe on Blockscout backend containers|
|blockscout.livenessProbe.failureThreshold|int|`5`|Failure threshold for livenessProbe|
|blockscout.livenessProbe.initialDelaySeconds|int|`100`|Initial delay seconds for livenessProbe|
|blockscout.livenessProbe.periodSeconds|int|`100`|Period seconds for livenessProbe|
|blockscout.livenessProbe.successThreshold|int|`1`|Success threshold for livenessProbe|
|blockscout.livenessProbe.timeoutSeconds|int|`30`|Timeout seconds for livenessProbe|
|blockscout.nodeSelector|object|-|Node labels for pod assignment|
|blockscout.openShiftRoute|object|-|OpenShift Route parameters for Blockscout backend|
|blockscout.openShiftRoute.alternateBackends|list|-|Additional backends for weighted routing|
|blockscout.openShiftRoute.annotations|object|-|Additional annotations for the OpenShift route resource|
|blockscout.openShiftRoute.enabled|bool|`false`|Enable OpenShift route creation for Blockscout backend|
|blockscout.openShiftRoute.host|string|`"explorer.k8s.orb.local"`|Hostname exposed via the OpenShift route|
|blockscout.openShiftRoute.path|string|`"/api"`|HTTP path exposed via the OpenShift route|
|blockscout.openShiftRoute.port|object|-|Service port configuration for the route target|
|blockscout.openShiftRoute.port.targetPort|string|`"http"`|Service target port name|
|blockscout.openShiftRoute.tls|object|-|TLS configuration for the OpenShift route|
|blockscout.openShiftRoute.to|object|-|Primary service weight configuration|
|blockscout.openShiftRoute.to.weight|int|`100`|Weight assigned to the Blockscout backend service backend|
|blockscout.openShiftRoute.wildcardPolicy|string|`"None"`|Wildcard policy to apply to the route|
|blockscout.podAnnotations|object|-|Annotations for Blockscout backend pods|
|blockscout.podSecurityContext|object|-|Pod Security Context configuration for Blockscout backend (overrides global.securityContexts.pod)|
|blockscout.readinessProbe|object|-|Configure Blockscout backend containers' readiness probe|
|blockscout.readinessProbe.enabled|bool|`true`|Enable readinessProbe on Blockscout backend containers|
|blockscout.readinessProbe.failureThreshold|int|`5`|Failure threshold for readinessProbe|
|blockscout.readinessProbe.initialDelaySeconds|int|`30`|Initial delay seconds for readinessProbe|
|blockscout.readinessProbe.periodSeconds|int|`10`|Period seconds for readinessProbe|
|blockscout.readinessProbe.successThreshold|int|`1`|Success threshold for readinessProbe|
|blockscout.readinessProbe.timeoutSeconds|int|`30`|Timeout seconds for readinessProbe|
|blockscout.replicaCount|int|`1`|Number of Blockscout backend replicas to deploy|
|blockscout.resources|object|-|Blockscout backend containers resource requests and limits|
|blockscout.separateApi|object|-|Separate API configuration|
|blockscout.separateApi.enabled|bool|`false`|Enable separate API deployment|
|blockscout.separateApi.replicaCount|int|`1`|Number of separate API replicas|
|blockscout.service|object|-|Service parameters for Blockscout backend|
|blockscout.service.port|int|`80`|Blockscout backend service HTTP port|
|blockscout.service.type|string|`"ClusterIP"`|Blockscout backend service type|
|blockscout.tolerations|list|-|Tolerations for pod assignment|
|config|object|-|Blockscout configuration|
|config.account|object|-|Account configuration|
|config.account.enabled|bool|`false`|Enable account functionality|
|config.network|object|-|Network configuration|
|config.network.currency|object|-|Network currency configuration|
|config.network.currency.decimals|int|`18`|Currency decimals|
|config.network.currency.dualToken|bool|`false`|Enable dual token support|
|config.network.currency.name|string|`"Native Token"`|Currency name|
|config.network.currency.symbol|string|`"NT"`|Currency symbol|
|config.network.icon|string|`""`|Network icon URL|
|config.network.icon_dark|string|`""`|Network dark mode icon URL|
|config.network.id|int|`"{{ .Values.global.chainId }}"`|Network ID|
|config.network.logo|string|`""`|Network logo URL|
|config.network.logo_dark|string|`""`|Network dark mode logo URL|
|config.network.name|string|`"Asset Tokenization Kit"`|Network name|
|config.network.shortname|string|`"ATK"`|Network short name|
|config.prometheus|object|-|Prometheus configuration|
|config.prometheus.blackbox|object|-|Blackbox exporter configuration|
|config.prometheus.blackbox.enabled|bool|`false`|Enable blackbox exporter|
|config.prometheus.enabled|bool|`false`|Enable Prometheus metrics|
|config.testnet|bool|`false`|Enable testnet mode|
|frontend|object|-|Blockscout frontend configuration|
|frontend.affinity|object|-|Affinity for pod assignment|
|frontend.containerSecurityContext|object|-|Container Security Context configuration for Blockscout frontend|
|frontend.containerSecurityContext.allowPrivilegeEscalation|bool|`false`|Controls whether a process can gain more privileges than its parent process|
|frontend.containerSecurityContext.capabilities|object|-|Linux capabilities to drop|
|frontend.containerSecurityContext.capabilities.drop|list|-|List of Linux capabilities to drop from the container|
|frontend.containerSecurityContext.readOnlyRootFilesystem|bool|`false`|Mount the container's root filesystem as read-only|
|frontend.containerSecurityContext.runAsGroup|int|`1001`|Group ID to run the entrypoint of the container process|
|frontend.containerSecurityContext.runAsNonRoot|bool|`true`|Indicates that the container must run as a non-root user|
|frontend.containerSecurityContext.runAsUser|int|`1001`|User ID to run the entrypoint of the container process|
|frontend.enabled|bool|`true`|Enable Blockscout frontend deployment|
|frontend.env|object|-|Environment variables for Blockscout frontend|
|frontend.env.NEXT_PUBLIC_AD_BANNER_PROVIDER|string|`"none"`|Ad banner provider configuration|
|frontend.env.NEXT_PUBLIC_AD_TEXT_PROVIDER|string|`"none"`|Ad text provider configuration|
|frontend.env.NEXT_PUBLIC_FONT_FAMILY_BODY|string|`"{'name':'Figtree','url':'https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,300..900;1,300..900&display=swap'}"`|Font family for body text|
|frontend.env.NEXT_PUBLIC_FONT_FAMILY_HEADING|string|`"{'name':'Figtree','url':'https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,300..900;1,300..900&display=swap'}"`|Font family for headings|
|frontend.env.NEXT_PUBLIC_HAS_BEACON_CHAIN|string|`"false"`|Enable beacon chain support|
|frontend.env.NEXT_PUBLIC_HAS_CONTRACT_AUDIT_REPORTS|string|`"true"`|Enable contract audit reports|
|frontend.env.NEXT_PUBLIC_HOMEPAGE_CHARTS|string|`"[\"daily_txs\"]"`|Homepage charts configuration|
|frontend.env.NEXT_PUBLIC_HOMEPAGE_STATS|string|`"[\"total_blocks\",\"average_block_time\",\"total_txs\",\"wallet_addresses\",\"gas_tracker\"]"`|Homepage stats configuration|
|frontend.env.NEXT_PUBLIC_IS_ACCOUNT_SUPPORTED|string|`"false"`|Enable account support in frontend|
|frontend.env.NEXT_PUBLIC_IS_TESTNET|string|`"false"`|Enable testnet mode in frontend|
|frontend.env.NEXT_PUBLIC_OG_ENHANCED_DATA_ENABLED|string|`"true"`|Enable OpenGraph enhanced data|
|frontend.env.NEXT_PUBLIC_PROMOTE_BLOCKSCOUT_IN_TITLE|string|`"false"`|Promote Blockscout in title|
|frontend.env.NEXT_PUBLIC_SEO_ENHANCED_DATA_ENABLED|string|`"true"`|Enable SEO enhanced data|
|frontend.env.NEXT_PUBLIC_TRANSACTION_INTERPRETATION_PROVIDER|string|`"blockscout"`|Transaction interpretation provider|
|frontend.image|object|-|Blockscout frontend image configuration|
|frontend.image.pullPolicy|string|`"IfNotPresent"`|Blockscout frontend image pull policy|
|frontend.image.repository|string|`"harbor.settlemint.com/ghcr.io/blockscout/frontend"`|Blockscout frontend image repository|
|frontend.image.tag|string|`"v2.3.4"`|Blockscout frontend image tag (immutable tags are recommended)|
|frontend.ingress|object|-|Ingress parameters for Blockscout frontend|
|frontend.ingress.annotations|object|-|Additional annotations for the Ingress resource|
|frontend.ingress.className|string|`"atk-nginx"`|IngressClass that will be be used to implement the Ingress (Kubernetes 1.18+)|
|frontend.ingress.enabled|bool|`true`|Enable ingress record generation for Blockscout frontend|
|frontend.ingress.hostname|string|`"explorer.k8s.orb.local"`|Default host for the ingress record|
|frontend.ingress.tls|list|-|TLS configuration for the ingress|
|frontend.livenessProbe|object|-|Configure Blockscout frontend containers' liveness probe|
|frontend.livenessProbe.enabled|bool|`true`|Enable livenessProbe on Blockscout frontend containers|
|frontend.livenessProbe.failureThreshold|int|`5`|Failure threshold for livenessProbe|
|frontend.livenessProbe.initialDelaySeconds|int|`30`|Initial delay seconds for livenessProbe|
|frontend.livenessProbe.periodSeconds|int|`10`|Period seconds for livenessProbe|
|frontend.livenessProbe.successThreshold|int|`1`|Success threshold for livenessProbe|
|frontend.livenessProbe.timeoutSeconds|int|`5`|Timeout seconds for livenessProbe|
|frontend.nodeSelector|object|-|Node labels for pod assignment|
|frontend.openShiftRoute|object|-|OpenShift Route parameters for Blockscout frontend|
|frontend.openShiftRoute.alternateBackends|list|-|Additional backends for weighted routing|
|frontend.openShiftRoute.annotations|object|-|Additional annotations for the OpenShift route resource|
|frontend.openShiftRoute.enabled|bool|`false`|Enable OpenShift route creation for Blockscout frontend|
|frontend.openShiftRoute.host|string|`"explorer.k8s.orb.local"`|Hostname exposed via the OpenShift route|
|frontend.openShiftRoute.path|string|`"/"`|HTTP path exposed via the OpenShift route|
|frontend.openShiftRoute.port|object|-|Service port configuration for the route target|
|frontend.openShiftRoute.port.targetPort|string|`"http"`|Service target port name|
|frontend.openShiftRoute.tls|object|-|TLS configuration for the OpenShift route|
|frontend.openShiftRoute.to|object|-|Primary service weight configuration|
|frontend.openShiftRoute.to.weight|int|`100`|Weight assigned to the Blockscout frontend service backend|
|frontend.openShiftRoute.wildcardPolicy|string|`"None"`|Wildcard policy to apply to the route|
|frontend.podAnnotations|object|-|Annotations for Blockscout frontend pods|
|frontend.podSecurityContext|object|-|Pod Security Context configuration for Blockscout frontend|
|frontend.podSecurityContext.fsGroup|int|`1001`|Group ID for filesystem ownership|
|frontend.podSecurityContext.runAsGroup|int|`1001`|Group ID to run the entrypoint of the container process|
|frontend.podSecurityContext.runAsNonRoot|bool|`true`|Indicates that the container must run as a non-root user|
|frontend.podSecurityContext.runAsUser|int|`1001`|User ID to run the entrypoint of the container process|
|frontend.readinessProbe|object|-|Configure Blockscout frontend containers' readiness probe|
|frontend.readinessProbe.enabled|bool|`true`|Enable readinessProbe on Blockscout frontend containers|
|frontend.readinessProbe.failureThreshold|int|`5`|Failure threshold for readinessProbe|
|frontend.readinessProbe.initialDelaySeconds|int|`30`|Initial delay seconds for readinessProbe|
|frontend.readinessProbe.periodSeconds|int|`5`|Period seconds for readinessProbe|
|frontend.readinessProbe.successThreshold|int|`1`|Success threshold for readinessProbe|
|frontend.readinessProbe.timeoutSeconds|int|`3`|Timeout seconds for readinessProbe|
|frontend.replicaCount|int|`1`|Number of Blockscout frontend replicas to deploy|
|frontend.resources|object|-|Blockscout frontend containers resource requests and limits|
|frontend.service|object|-|Service parameters for Blockscout frontend|
|frontend.service.port|int|`80`|Blockscout frontend service HTTP port|
|frontend.service.type|string|`"ClusterIP"`|Blockscout frontend service type|
|frontend.tolerations|list|-|Tolerations for pod assignment|
|fullnameOverride|string|`"blockscout"`|String to fully override common.names.fullname|
|global|object|-|Global Docker image registry and security defaults|
|global.datastores|object|-|Shared datastore definitions|
|global.imagePullSecrets|list|-|Global Docker registry secret names as an array|
|global.imageRegistry|string|`""`|Global Docker image registry|
|global.labels|object|-|Global labels applied to all resources|
|global.labels."kots.io/app-slug"|string|`"settlemint-atk"`|KOTS application slug identifier|
|global.securityContexts|object|-|Shared security context defaults|
|global.storageClass|string|`""`|Global StorageClass for Persistent Volume(s)|
|imagePullSecrets|list|-|Global Docker registry secret names as an array|
|postgresql|object|-|PostgreSQL connection overrides (merged with global.datastores.blockscout.postgresql)|
|redirect|object|-|Blockscout redirect configuration|
|redirect.enabled|bool|`false`|Enable Blockscout redirect deployment|
|serviceAccount|object|-|Service account for Blockscout pods|
|serviceAccount.annotations|object|-|Annotations for service account. Evaluated as a template. Only used if `create` is `true`.|
|serviceAccount.create|bool|`true`|Specifies whether a ServiceAccount should be created|
|serviceAccount.name|string|`""`|The name of the ServiceAccount to use|
|stats|object|-|Blockscout stats configuration|
|stats.enabled|bool|`false`|Enable Blockscout stats deployment|
|stats.ingress|object|-|Ingress configuration for stats|
|stats.ingress.hostname|string|`""`|Hostname for stats ingress|

## Resource Summary

| Component | Replicas | Request CPU | Limit CPU | Request Memory | Limit Memory | Storage |
|-----------|----------|-------------|-----------|----------------|--------------|---------|
| blockscout.initContainer.tcpCheck | 1 | 10m | 300m | 32Mi | 64Mi | - |

| **Totals** | - | 0.01 cores (10m) | 0.30 cores (300m) | 32Mi (0.03Gi) | 64Mi (0.06Gi) | - |

## Maintainers

| Name | Email | Url |
| ---- | ------ | --- |
| SettleMint | <support@settlemint.com> | <https://settlemint.com> |


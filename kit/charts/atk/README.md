# atk

![Version: 2.0.0-beta.5](https://img.shields.io/badge/Version-2.0.0--beta.5-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: 2.0.0-beta.5](https://img.shields.io/badge/AppVersion-2.0.0--beta.5-informational?style=flat-square)

A Helm chart for the SettleMint Asset Tokenization Kit

## Configuration

The following table lists the configurable parameters of this chart and their default values.

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
|blockscout|object|-|Blockscout blockchain explorer configuration|
|blockscout.blockscout|object|-|Blockscout backend service configuration|
|blockscout.blockscout.env|object|-|Environment variables for Blockscout configuration|
|blockscout.blockscout.env.API_URL|string|`"https://explorer.k8s.orb.local"`|API URL for Blockscout backend|
|blockscout.blockscout.env.WEBAPP_URL|string|`"https://explorer.k8s.orb.local"`|Web app URL for Blockscout frontend|
|blockscout.blockscout.image|object|-|Blockscout backend container image|
|blockscout.blockscout.image.repository|string|`"ghcr.io/blockscout/blockscout"`|OCI registry and repository for Blockscout backend|
|blockscout.blockscout.ingress|object|-|Ingress configuration for Blockscout backend|
|blockscout.blockscout.ingress.className|string|`"atk-nginx"`|IngressClass for Blockscout|
|blockscout.blockscout.ingress.enabled|bool|`true`|Enable ingress for Blockscout API|
|blockscout.blockscout.ingress.hostname|string|`"explorer.k8s.orb.local"`|Hostname for Blockscout explorer. Update for your environment.|
|blockscout.blockscout.initContainer|object|-|Init container for database readiness|
|blockscout.blockscout.initContainer.tcpCheck|object|-|TCP check for PostgreSQL|
|blockscout.blockscout.initContainer.tcpCheck.image|object|-|Wait-for-it utility image|
|blockscout.blockscout.initContainer.tcpCheck.image.repository|string|`"ghcr.io/settlemint/btp-waitforit"`|Repository for TCP check utility|
|blockscout.blockscout.openShiftRoute|object|-|OpenShift Route configuration|
|blockscout.blockscout.openShiftRoute.enabled|bool|`false`|Enable OpenShift route|
|blockscout.blockscout.openShiftRoute.host|string|`"explorer.k8s.orb.local"`|Hostname for OpenShift route|
|blockscout.blockscout.resources|object|-|Resource requests and limits for Blockscout backend|
|blockscout.blockscout.resources.limits.cpu|string|`"600m"`|CPU limit for Blockscout backend pods|
|blockscout.blockscout.resources.limits.memory|string|`"1280Mi"`|Memory limit for Blockscout backend pods|
|blockscout.blockscout.resources.requests.cpu|string|`"100m"`|CPU request for Blockscout backend pods|
|blockscout.blockscout.resources.requests.memory|string|`"640Mi"`|Memory request for Blockscout backend pods|
|blockscout.enabled|bool|`true`|Enable deployment of Blockscout blockchain explorer|
|blockscout.frontend|object|-|Blockscout frontend service configuration|
|blockscout.frontend.enabled|bool|`true`|Enable Blockscout frontend deployment|
|blockscout.frontend.image|object|-|Blockscout frontend container image|
|blockscout.frontend.image.repository|string|`"ghcr.io/blockscout/frontend"`|OCI registry and repository for Blockscout frontend|
|blockscout.frontend.ingress|object|-|Ingress configuration for Blockscout UI|
|blockscout.frontend.ingress.className|string|`"atk-nginx"`|IngressClass for frontend|
|blockscout.frontend.ingress.enabled|bool|`true`|Enable ingress for frontend|
|blockscout.frontend.ingress.hostname|string|`"explorer.k8s.orb.local"`|Hostname for Blockscout frontend|
|blockscout.frontend.resources|object|-|Resource requests and limits for Blockscout frontend pods|
|blockscout.frontend.resources.limits.cpu|string|`"360m"`|CPU limit for Blockscout frontend pods|
|blockscout.frontend.resources.limits.memory|string|`"640Mi"`|Memory limit for Blockscout frontend pods|
|blockscout.frontend.resources.requests.cpu|string|`"60m"`|CPU request for Blockscout frontend pods|
|blockscout.frontend.resources.requests.memory|string|`"320Mi"`|Memory request for Blockscout frontend pods|
|dapp|object|-|DApp frontend application configuration|
|dapp.enabled|bool|`true`|Enable deployment of the Asset Tokenization Kit web application|
|dapp.image|object|-|DApp container image configuration|
|dapp.image.repository|string|`"ghcr.io/settlemint/asset-tokenization-kit"`|OCI registry and repository for DApp frontend|
|dapp.ingress|object|-|Ingress configuration for DApp web interface|
|dapp.ingress.enabled|bool|`true`|Enable ingress for web application access|
|dapp.ingress.hosts|list|-|Ingress host rules for DApp|
|dapp.ingress.hosts[0].host|string|`"dapp.k8s.orb.local"`|Hostname for DApp. Update for your environment.|
|dapp.ingress.hosts[0].paths|list|-|Path configuration|
|dapp.ingress.hosts[0].paths[0].path|string|`"/"`|Root path for web application|
|dapp.ingress.hosts[0].paths[0].pathType|string|`"ImplementationSpecific"`|Path matching type|
|dapp.initContainer|object|-|Init containers for DApp startup dependencies|
|dapp.initContainer.graphQLCheck|object|-|GraphQL endpoint readiness check|
|dapp.initContainer.graphQLCheck.image|object|-|curl utility for GraphQL health checks|
|dapp.initContainer.graphQLCheck.image.registry|string|`"docker.io"`|OCI registry for curl image|
|dapp.initContainer.tcpCheck|object|-|TCP check for backend services|
|dapp.initContainer.tcpCheck.image|object|-|Wait-for-it utility image|
|dapp.initContainer.tcpCheck.image.repository|string|`"ghcr.io/settlemint/btp-waitforit"`|Repository for TCP check utility|
|dapp.job|object|-|Post-deployment job configuration for database migrations|
|dapp.job.image|object|-|Job container image|
|dapp.job.image.repository|string|`"docker.io/node"`|Node.js runtime image for migration scripts|
|dapp.resources|object|-|Resource requests and limits for DApp pods|
|dapp.resources.limits.cpu|string|`"3000m"`|CPU limit for DApp pods|
|dapp.resources.limits.memory|string|`"2048Mi"`|Memory limit for DApp pods|
|dapp.resources.requests.cpu|string|`"100m"`|CPU request for DApp pods|
|dapp.resources.requests.memory|string|`"1024Mi"`|Memory request for DApp pods|
|dapp.secretEnv|object|-|Environment variables for DApp runtime configuration (stored as secrets)|
|dapp.secretEnv.BETTER_AUTH_URL|string|`"https://dapp.k8s.orb.local"`|Base URL for authentication callbacks. Must match ingress hostname.|
|dapp.secretEnv.SETTLEMINT_BLOCKSCOUT_UI_ENDPOINT|string|`"https://blockscout.k8s.orb.local/"`|Blockscout explorer UI endpoint for blockchain browsing|
|erpc|object|-|ERPC Gateway configuration for RPC load balancing and caching|
|erpc.enabled|bool|`true`|Enable deployment of ERPC gateway|
|erpc.image|object|-|ERPC container image|
|erpc.image.registry|string|`"ghcr.io"`|OCI registry for ERPC image|
|erpc.ingress|object|-|Ingress configuration for exposing RPC endpoint|
|erpc.ingress.enabled|bool|`true`|Enable ingress for external RPC access|
|erpc.ingress.hostname|string|`"rpc.k8s.orb.local"`|Hostname for RPC endpoint. Update for your environment.|
|erpc.ingress.ingressClassName|string|`"atk-nginx"`|IngressClass for RPC ingress|
|erpc.initContainer|object|-|Init container for startup dependency checks|
|erpc.initContainer.tcpCheck|object|-|TCP readiness check|
|erpc.initContainer.tcpCheck.image|object|-|Wait-for-it utility image|
|erpc.initContainer.tcpCheck.image.repository|string|`"ghcr.io/settlemint/btp-waitforit"`|Repository for TCP check utility|
|erpc.openShiftRoute|object|-|OpenShift Route configuration (alternative to Ingress)|
|erpc.openShiftRoute.enabled|bool|`false`|Enable OpenShift route instead of standard ingress|
|erpc.openShiftRoute.host|string|`"rpc.k8s.orb.local"`|Hostname for OpenShift route|
|erpc.resources|object|-|Resource requests and limits for ERPC pods|
|erpc.resources.limits.cpu|string|`"360m"`|CPU limit for ERPC pods|
|erpc.resources.limits.memory|string|`"512Mi"`|Memory limit for ERPC pods|
|erpc.resources.requests.cpu|string|`"60m"`|CPU request for ERPC pods|
|erpc.resources.requests.memory|string|`"256Mi"`|Memory request for ERPC pods|
|erpc.tests|object|-|Test container image for ERPC health checks|
|erpc.tests.image|object|-|Test image configuration|
|erpc.tests.image.registry|string|`"docker.io"`|OCI registry for test utilities|
|global|object|-|Global configuration shared across all subcharts|
|global.chainId|string|`"53771311147"`|Blockchain chain ID used across all network components|
|global.chainName|string|`"ATK"`|Human-readable name for the blockchain network|
|global.datastores|object|-|Centralized datastore connection configuration shared across all services|
|global.datastores.blockscout|object|-|Blockscout specific datastore configuration for blockchain explorer|
|global.datastores.blockscout.postgresql|object|-|PostgreSQL database for Blockscout explorer data|
|global.datastores.blockscout.postgresql.database|string|`"blockscout"`|Dedicated database name for blockchain explorer|
|global.datastores.blockscout.postgresql.password|string|`"atk"`|Blockscout database password. Change for production deployments.|
|global.datastores.blockscout.postgresql.username|string|`"blockscout"`|Database user for Blockscout|
|global.datastores.default|object|-|Default datastore configuration for services that don't require specialized settings|
|global.datastores.default.postgresql|object|-|PostgreSQL configuration for default services|
|global.datastores.default.postgresql.database|string|`"postgres"`|Default PostgreSQL database name|
|global.datastores.default.postgresql.host|string|`"postgresql"`|PostgreSQL service hostname within the cluster|
|global.datastores.default.postgresql.password|string|`"atk"`|PostgreSQL superuser password. Change for production deployments.|
|global.datastores.default.postgresql.port|int|`5432`|PostgreSQL service port|
|global.datastores.default.postgresql.sslMode|string|`"disable"`|SSL mode for PostgreSQL connections (disable, require, verify-ca, verify-full)|
|global.datastores.default.postgresql.username|string|`"postgres"`|PostgreSQL superuser username|
|global.datastores.default.redis|object|-|Redis configuration for default services|
|global.datastores.default.redis.db|int|`0`|Redis database number to use (0-15)|
|global.datastores.default.redis.host|string|`"redis"`|Redis service hostname within the cluster|
|global.datastores.default.redis.password|string|`"atk"`|Redis authentication password. Change for production deployments.|
|global.datastores.default.redis.port|int|`6379`|Redis service port|
|global.datastores.default.redis.query|string|`"dial_timeout=5s&read_timeout=2s&write_timeout=2s&pool_size=50"`|Redis connection query parameters for tuning connection behavior|
|global.datastores.default.redis.username|string|`"default"`|Redis authentication username|
|global.datastores.erpc|object|-|ERPC-specific datastore configuration for RPC gateway caching|
|global.datastores.erpc.redis|object|-|Redis database allocation for ERPC services|
|global.datastores.erpc.redis.cacheDb|int|`0`|Redis database number for ERPC response caching|
|global.datastores.erpc.redis.sharedStateDb|int|`1`|Redis database number for ERPC shared state storage|
|global.datastores.graphNode|object|-|The Graph Node specific datastore configuration for blockchain indexing|
|global.datastores.graphNode.postgresql|object|-|PostgreSQL database for The Graph indexing data|
|global.datastores.graphNode.postgresql.database|string|`"thegraph"`|Dedicated database name for subgraph data|
|global.datastores.graphNode.postgresql.password|string|`"atk"`|The Graph database password. Change for production deployments.|
|global.datastores.graphNode.postgresql.username|string|`"thegraph"`|Database user for The Graph node|
|global.datastores.hasura|object|-|Hasura GraphQL Engine specific datastore configuration|
|global.datastores.hasura.postgresql|object|-|PostgreSQL database for Hasura metadata and data|
|global.datastores.hasura.postgresql.database|string|`"hasura"`|Dedicated database name for Hasura GraphQL engine|
|global.datastores.hasura.postgresql.password|string|`"atk"`|Hasura database password. Change for production deployments.|
|global.datastores.hasura.postgresql.username|string|`"hasura"`|Database user for Hasura|
|global.datastores.hasura.redis|object|-|Redis databases for Hasura caching and rate limiting|
|global.datastores.hasura.redis.cacheDb|int|`2`|Redis database number for Hasura query result caching|
|global.datastores.hasura.redis.rateLimitDb|int|`3`|Redis database number for Hasura API rate limiting|
|global.datastores.portal|object|-|Portal-specific datastore configuration for identity and access management|
|global.datastores.portal.postgresql|object|-|PostgreSQL database for Portal service|
|global.datastores.portal.postgresql.database|string|`"portal"`|Dedicated database name for Portal tables|
|global.datastores.portal.postgresql.password|string|`"atk"`|Portal database password. Change for production deployments.|
|global.datastores.portal.postgresql.username|string|`"portal"`|Database user for Portal with limited privileges|
|global.datastores.portal.redis|object|-|Redis database for Portal session and caching|
|global.datastores.portal.redis.db|int|`4`|Redis database number for Portal data|
|global.datastores.txsigner|object|-|Transaction Signer specific datastore configuration|
|global.datastores.txsigner.postgresql|object|-|PostgreSQL database for transaction signing service|
|global.datastores.txsigner.postgresql.database|string|`"txsigner"`|Dedicated database name for transaction signer state|
|global.datastores.txsigner.postgresql.password|string|`"atk"`|Transaction signer database password. Change for production deployments.|
|global.datastores.txsigner.postgresql.username|string|`"txsigner"`|Database user for transaction signer|
|global.labels|object|-|Global labels applied to all resources across all subcharts|
|graph-node|object|-|The Graph Node configuration for blockchain indexing|
|graph-node.enabled|bool|`true`|Enable deployment of The Graph indexing protocol|
|graph-node.global|object|-|Override shared artifacts image configuration|
|graph-node.global.artifacts.image.registry|string|`"ghcr.io"`|OCI registry for shared Graph Node artifacts|
|graph-node.image|object|-|Graph Node container image|
|graph-node.image.repository|string|`"docker.io/graphprotocol/graph-node"`|OCI registry and repository for Graph Node|
|graph-node.ingress|object|-|Ingress configuration for Graph Node API|
|graph-node.ingress.annotations|object|-|Ingress annotations for URL rewriting|
|graph-node.ingress.annotations."nginx.ingress.kubernetes.io/rewrite-target"|string|`"/$1"`|Rewrite target for path normalization|
|graph-node.ingress.annotations."nginx.ingress.kubernetes.io/use-regex"|string|`"true"`|Enable regex path matching|
|graph-node.ingress.enabled|bool|`true`|Enable ingress for subgraph queries|
|graph-node.ingress.hostname|string|`"graph.k8s.orb.local"`|Hostname for Graph Node. Update for your environment.|
|graph-node.ingress.ingressClassName|string|`"atk-nginx"`|IngressClass for Graph Node (Kubernetes 1.19+)|
|graph-node.ingress.paths|list|-|Path configurations for different Graph Node endpoints|
|graph-node.ingress.paths[0].path|string|`"/(.*)"`|Query endpoint path|
|graph-node.ingress.paths[0].pathType|string|`"ImplementationSpecific"`|Path matching type|
|graph-node.ingress.paths[0].servicePortName|string|`"http-query"`|Service port name handling HTTP queries|
|graph-node.ingress.paths[1].path|string|`"/ws/?(.*)"`|WebSocket endpoint path|
|graph-node.ingress.paths[1].pathType|string|`"ImplementationSpecific"`|Path matching type|
|graph-node.ingress.paths[1].servicePortName|string|`"http-queryws"`|Service port name handling WebSocket traffic|
|graph-node.ingress.paths[2].path|string|`"/admin/?(.*)"`|Admin API path|
|graph-node.ingress.paths[2].pathType|string|`"ImplementationSpecific"`|Path matching type|
|graph-node.ingress.paths[2].servicePortName|string|`"http-admin"`|Service port name exposing the admin API|
|graph-node.ingress.paths[3].path|string|`"/indexer/?(.*)"`|Indexer status path|
|graph-node.ingress.paths[3].pathType|string|`"ImplementationSpecific"`|Path matching type|
|graph-node.ingress.paths[3].servicePortName|string|`"http-status"`|Service port name serving indexer status APIs|
|graph-node.ingress.paths[4].path|string|`"/graphman/?(.*)"`|Graph management path|
|graph-node.ingress.paths[4].pathType|string|`"ImplementationSpecific"`|Path matching type|
|graph-node.ingress.paths[4].servicePortName|string|`"http-status"`|Service port name serving graphman APIs|
|graph-node.initContainer|object|-|Init containers for Graph Node startup|
|graph-node.initContainer.image|object|-|Kubernetes client utility for pre-deployment tasks|
|graph-node.initContainer.image.repository|string|`"docker.io/kubesphere/kubectl"`|kubectl utility image repository|
|graph-node.initContainer.tcpCheck|object|-|TCP check for dependencies|
|graph-node.initContainer.tcpCheck.image|object|-|Wait-for-it utility image|
|graph-node.initContainer.tcpCheck.image.repository|string|`"ghcr.io/settlemint/btp-waitforit"`|Repository for TCP check utility|
|graph-node.openShiftRoute|object|-|OpenShift Route configuration|
|graph-node.openShiftRoute.enabled|bool|`false`|Enable OpenShift route|
|graph-node.openShiftRoute.host|string|`"graph.k8s.orb.local"`|Hostname for OpenShift route|
|graph-node.resources|object|-|Resource requests and limits for Graph Node StatefulSet|
|graph-node.resources.limits.cpu|string|`"360m"`|CPU limit for Graph Node pods|
|graph-node.resources.limits.memory|string|`"1024Mi"`|Memory limit for Graph Node pods|
|graph-node.resources.requests.cpu|string|`"60m"`|CPU request for Graph Node pods|
|graph-node.resources.requests.memory|string|`"512Mi"`|Memory request for Graph Node pods|
|hasura|object|-|Hasura GraphQL Engine configuration|
|hasura.enabled|bool|`true`|Enable deployment of Hasura GraphQL engine|
|hasura.fullnameOverride|string|`"hasura"`|Override fullname to simplify service discovery|
|hasura.image|object|-|Hasura container image configuration|
|hasura.image.pullPolicy|string|`"IfNotPresent"`|Image pull policy|
|hasura.image.registry|string|`"docker.io"`|OCI registry for Hasura image|
|hasura.image.repository|string|`"hasura/graphql-engine"`|Hasura image repository|
|hasura.image.tag|string|`"v2.48.6"`|Hasura version tag|
|hasura.ingress|object|-|Ingress configuration for Hasura console and API|
|hasura.ingress.className|string|`"atk-nginx"`|Deprecated: Use `ingressClassName` instead. Will be removed in future versions.|
|hasura.ingress.enabled|bool|`true`|Enable ingress exposure for Hasura|
|hasura.ingress.hostName|string|`"hasura.k8s.orb.local"`|Hostname for Hasura GraphQL endpoint. Update for your environment.|
|hasura.ingress.ingressClassName|string|`"atk-nginx"`|IngressClass for Hasura ingress resources (Kubernetes 1.19+ standard)|
|hasura.resources|object|-|Resource requests and limits for Hasura deployment|
|hasura.resources.limits.cpu|string|`"480m"`|CPU limit for Hasura pods|
|hasura.resources.limits.memory|string|`"768Mi"`|Memory limit for Hasura pods|
|hasura.resources.requests.cpu|string|`"80m"`|CPU request for Hasura pods|
|hasura.resources.requests.memory|string|`"384Mi"`|Memory request for Hasura pods|
|ipfs|object|-|IPFS Cluster deployment configuration|
|ipfs.cluster|object|-|IPFS Cluster control-plane configuration overrides|
|ipfs.cluster.image.registry|string|`"docker.io"`|OCI registry for the cluster control-plane image|
|ipfs.cluster.resources|object|-|Resource requests and limits for IPFS Cluster control-plane pods|
|ipfs.cluster.resources.limits.cpu|string|`"360m"`|CPU limit for cluster pods|
|ipfs.cluster.resources.limits.memory|string|`"512Mi"`|Memory limit for cluster pods|
|ipfs.cluster.resources.requests.cpu|string|`"60m"`|CPU request for cluster pods|
|ipfs.cluster.resources.requests.memory|string|`"256Mi"`|Memory request for cluster pods|
|ipfs.enabled|bool|`true`|Enable deployment of the IPFS cluster stack|
|ipfs.ingress|object|-|Ingress configuration for the IPFS cluster endpoints|
|ipfs.ingress.className|string|`"atk-nginx"`|Deprecated: Use `ingressClassName` instead. Will be removed in future versions.|
|ipfs.ingress.enabled|bool|`true`|Enable ingress exposure for IPFS cluster endpoints|
|ipfs.ingress.hostnames.api|string|`"ipfs-cluster.k8s.orb.local"`|Primary hostname serving the IPFS cluster API|
|ipfs.ingress.ingressClassName|string|`"atk-nginx"`|IngressClass for IPFS cluster ingress resources (Kubernetes 1.19+ standard)|
|ipfs.ipfs|object|-|IPFS peer configuration overrides|
|ipfs.ipfs.image.registry|string|`"docker.io"`|OCI registry for the Kubo image|
|ipfs.ipfs.resources|object|-|Resource requests and limits for IPFS peer pods|
|ipfs.ipfs.resources.limits.cpu|string|`"900m"`|CPU limit for IPFS pods|
|ipfs.ipfs.resources.limits.memory|string|`"1024Mi"`|Memory limit for IPFS pods|
|ipfs.ipfs.resources.requests.cpu|string|`"150m"`|CPU request for IPFS pods|
|ipfs.ipfs.resources.requests.memory|string|`"512Mi"`|Memory request for IPFS pods|
|ipfs.tests|object|-|Test pod image configuration|
|ipfs.tests.image.registry|string|`"docker.io"`|Container registry hosting the chart test image|
|network|object|-|Blockchain network infrastructure configuration|
|network.enabled|bool|`true`|Enable deployment of the blockchain network (validators and RPC nodes)|
|network.network-bootstrapper|object|-|Network bootstrapper job configuration for genesis and initial setup|
|network.network-bootstrapper.artifacts|object|-|Pre-deployed contract artifacts configuration|
|network.network-bootstrapper.artifacts.predeployed|object|-|Configuration for pre-deployed smart contracts in genesis|
|network.network-bootstrapper.artifacts.predeployed.image|object|-|Image containing pre-deployed contract bytecode|
|network.network-bootstrapper.artifacts.predeployed.image.registry|string|`"ghcr.io"`|OCI registry for pre-deployed artifacts|
|network.network-bootstrapper.image|object|-|Container image for the network bootstrapper job|
|network.network-bootstrapper.image.repository|string|`"ghcr.io/settlemint/network-bootstrapper"`|OCI registry and repository for network bootstrapper|
|network.network-bootstrapper.initContainer|object|-|Init container configuration for dependency checking|
|network.network-bootstrapper.initContainer.tcpCheck|object|-|TCP readiness check init container|
|network.network-bootstrapper.initContainer.tcpCheck.image|object|-|Wait-for-it utility image for TCP checks|
|network.network-bootstrapper.initContainer.tcpCheck.image.repository|string|`"ghcr.io/settlemint/btp-waitforit"`|Repository for TCP check utility|
|network.network-bootstrapper.resources|object|-|Resource requests and limits for the bootstrapper job|
|network.network-bootstrapper.resources.limits.cpu|string|`"600m"`|CPU limit for bootstrapper pods|
|network.network-bootstrapper.resources.limits.memory|string|`"256Mi"`|Memory limit for bootstrapper pods|
|network.network-bootstrapper.resources.requests.cpu|string|`"100m"`|CPU request for bootstrapper pods|
|network.network-bootstrapper.resources.requests.memory|string|`"128Mi"`|Memory request for bootstrapper pods|
|network.network-nodes|object|-|Blockchain node configuration (validators and RPC)|
|network.network-nodes.compileGenesis.resources|object|-|Resource requests and limits for genesis compilation init container|
|network.network-nodes.compileGenesis.resources.limits.cpu|string|`"600m"`|CPU limit for genesis compilation|
|network.network-nodes.compileGenesis.resources.limits.memory|string|`"256Mi"`|Memory limit for genesis compilation|
|network.network-nodes.compileGenesis.resources.requests.cpu|string|`"100m"`|CPU request for genesis compilation|
|network.network-nodes.compileGenesis.resources.requests.memory|string|`"128Mi"`|Memory request for genesis compilation|
|network.network-nodes.image|object|-|Hyperledger Besu container image|
|network.network-nodes.image.repository|string|`"docker.io/hyperledger/besu"`|OCI registry and repository for Besu nodes|
|network.network-nodes.initContainer|object|-|Init container for node startup dependencies|
|network.network-nodes.initContainer.tcpCheck|object|-|TCP check before node starts|
|network.network-nodes.initContainer.tcpCheck.image|object|-|Wait-for-it utility image|
|network.network-nodes.initContainer.tcpCheck.image.repository|string|`"ghcr.io/settlemint/btp-waitforit"`|Repository for TCP check utility|
|network.network-nodes.persistence|object|-|Persistent storage configuration for blockchain data|
|network.network-nodes.persistence.size|string|`"20Gi"`|Storage size for each blockchain node (ledger data)|
|network.network-nodes.replicaCount|int|`2`|Total Besu pod replicas (validators + RPC). Used for resource summaries.|
|network.network-nodes.resources|object|-|Resource requests and limits for Besu validator and RPC pods|
|network.network-nodes.resources.limits.cpu|string|`"360m"`|CPU limit per Besu pod|
|network.network-nodes.resources.limits.memory|string|`"1024Mi"`|Memory limit per Besu pod|
|network.network-nodes.resources.requests.cpu|string|`"60m"`|CPU request per Besu pod|
|network.network-nodes.resources.requests.memory|string|`"512Mi"`|Memory request per Besu pod|
|network.network-nodes.rpcReplicaCount|int|`1`|Number of RPC node replicas provisioned via StatefulSet.|
|network.network-nodes.validatorReplicaCount|int|`1`|Number of validator node replicas participating in consensus.|
|observability|object|-|Observability stack (metrics, logging, tracing)|
|observability.alloy|object|-|Grafana Alloy for telemetry pipeline|
|observability.alloy.alloy|object|-|Alloy agent configuration|
|observability.alloy.alloy.resources|object|-|Resource requests and limits for Alloy|
|observability.alloy.alloy.resources.limits.cpu|string|`"720m"`|CPU limit for Alloy pods|
|observability.alloy.alloy.resources.limits.memory|string|`"1024Mi"`|Memory limit for Alloy pods|
|observability.alloy.alloy.resources.requests.cpu|string|`"120m"`|CPU request for Alloy pods|
|observability.alloy.alloy.resources.requests.memory|string|`"512Mi"`|Memory request for Alloy pods|
|observability.alloy.configReloader|object|-|Config reloader sidecar|
|observability.alloy.configReloader.image|object|-|Config reloader image|
|observability.alloy.configReloader.image.registry|string|`"quay.io"`|OCI registry for config reloader|
|observability.alloy.image|object|-|Alloy container image|
|observability.alloy.image.registry|string|`"docker.io"`|OCI registry for Alloy|
|observability.enabled|bool|`true`|Enable deployment of observability infrastructure|
|observability.grafana|object|-|Grafana visualization and dashboarding|
|observability.grafana.adminPassword|string|`"atk"`|Grafana admin password. Change for production deployments.|
|observability.grafana.adminUser|string|`"settlemint"`|Grafana admin username. Change for production deployments.|
|observability.grafana.image|object|-|Grafana container image|
|observability.grafana.image.registry|string|`"docker.io"`|OCI registry for Grafana|
|observability.grafana.ingress|object|-|Ingress configuration for Grafana UI|
|observability.grafana.ingress.hosts|list|-|Hostnames for Grafana access|
|observability.grafana.resources|object|-|Resource requests and limits for Grafana pods|
|observability.grafana.resources.limits.cpu|string|`"360m"`|CPU limit for Grafana pods|
|observability.grafana.resources.limits.memory|string|`"512Mi"`|Memory limit for Grafana pods|
|observability.grafana.resources.requests.cpu|string|`"60m"`|CPU request for Grafana pods|
|observability.grafana.resources.requests.memory|string|`"256Mi"`|Memory request for Grafana pods|
|observability.grafana.sidecar|object|-|Sidecar for dashboard provisioning|
|observability.grafana.sidecar.image|object|-|Sidecar container image|
|observability.grafana.sidecar.image.registry|string|`"docker.io"`|OCI registry for sidecar|
|observability.kube-state-metrics|object|-|Kube State Metrics for cluster-level metrics|
|observability.kube-state-metrics.image|object|-|Kube state metrics container image|
|observability.kube-state-metrics.image.registry|string|`"registry.k8s.io"`|OCI registry for kube-state-metrics|
|observability.kube-state-metrics.resources|object|-|Resource requests and limits for kube-state-metrics|
|observability.kube-state-metrics.resources.limits.cpu|string|`"240m"`|CPU limit for kube-state-metrics pods|
|observability.kube-state-metrics.resources.limits.memory|string|`"256Mi"`|Memory limit for kube-state-metrics pods|
|observability.kube-state-metrics.resources.requests.cpu|string|`"40m"`|CPU request for kube-state-metrics pods|
|observability.kube-state-metrics.resources.requests.memory|string|`"128Mi"`|Memory request for kube-state-metrics pods|
|observability.loki|object|-|Loki log aggregation system|
|observability.loki.gateway|object|-|Loki gateway for load balancing|
|observability.loki.gateway.image|object|-|Gateway container image|
|observability.loki.gateway.image.registry|string|`"docker.io"`|OCI registry for gateway image|
|observability.loki.gateway.resources|object|-|Resource requests and limits for Loki gateway pods|
|observability.loki.gateway.resources.limits.cpu|string|`"120m"`|CPU limit for gateway pods|
|observability.loki.gateway.resources.limits.memory|string|`"64Mi"`|Memory limit for gateway pods|
|observability.loki.gateway.resources.requests.cpu|string|`"20m"`|CPU request for gateway pods|
|observability.loki.gateway.resources.requests.memory|string|`"32Mi"`|Memory request for gateway pods|
|observability.loki.loki|object|-|Loki server configuration|
|observability.loki.loki.image|object|-|Loki container image|
|observability.loki.loki.image.registry|string|`"docker.io"`|OCI registry for Loki|
|observability.loki.memcached|object|-|Memcached for Loki query result caching|
|observability.loki.memcached.enabled|bool|`true`|Enable memcached deployment|
|observability.loki.memcached.image|object|-|Memcached container image|
|observability.loki.memcached.image.repository|string|`"docker.io/memcached"`|Memcached image repository|
|observability.loki.memcached.resources|object|-|Resource requests and limits for Loki memcached pods|
|observability.loki.memcached.resources.limits.cpu|string|`"240m"`|CPU limit for memcached pods|
|observability.loki.memcached.resources.limits.memory|string|`"96Mi"`|Memory limit for memcached pods|
|observability.loki.memcached.resources.requests.cpu|string|`"40m"`|CPU request for memcached pods|
|observability.loki.memcached.resources.requests.memory|string|`"48Mi"`|Memory request for memcached pods|
|observability.loki.memcachedExporter|object|-|Memcached exporter for Prometheus metrics|
|observability.loki.memcachedExporter.image|object|-|Memcached exporter image|
|observability.loki.memcachedExporter.image.repository|string|`"docker.io/prom/memcached-exporter"`|Prometheus memcached exporter repository|
|observability.loki.memcachedExporter.resources|object|-|Resource requests and limits for memcached exporter pods|
|observability.loki.memcachedExporter.resources.limits.cpu|string|`"60m"`|CPU limit for memcached exporter pods|
|observability.loki.memcachedExporter.resources.limits.memory|string|`"48Mi"`|Memory limit for memcached exporter pods|
|observability.loki.memcachedExporter.resources.requests.cpu|string|`"10m"`|CPU request for memcached exporter pods|
|observability.loki.memcachedExporter.resources.requests.memory|string|`"24Mi"`|Memory request for memcached exporter pods|
|observability.loki.sidecar|object|-|Kubernetes sidecar for dynamic configuration|
|observability.loki.sidecar.image|object|-|Sidecar container image|
|observability.loki.sidecar.image.repository|string|`"docker.io/kiwigrid/k8s-sidecar"`|k8s-sidecar image repository|
|observability.loki.sidecar.resources|object|-|Resource requests and limits for Loki sidecar pods|
|observability.loki.sidecar.resources.limits.cpu|string|`"720m"`|CPU limit for sidecar pods|
|observability.loki.sidecar.resources.limits.memory|string|`"192Mi"`|Memory limit for sidecar pods|
|observability.loki.sidecar.resources.requests.cpu|string|`"120m"`|CPU request for sidecar pods|
|observability.loki.sidecar.resources.requests.memory|string|`"96Mi"`|Memory request for sidecar pods|
|observability.loki.singleBinary|object|-|Loki single binary deployment mode|
|observability.loki.singleBinary.extraEnv|list|-|Additional environment variables for Loki|
|observability.loki.singleBinary.persistence|object|-|Persistent storage for log data|
|observability.loki.singleBinary.persistence.size|string|`"10Gi"`|Storage size for log retention|
|observability.loki.singleBinary.resources|object|-|Resource requests and limits for Loki|
|observability.loki.singleBinary.resources.limits.cpu|string|`"1200m"`|CPU limit for Loki single binary pods|
|observability.loki.singleBinary.resources.limits.memory|string|`"1024Mi"`|Memory limit for Loki single binary pods|
|observability.loki.singleBinary.resources.requests.cpu|string|`"200m"`|CPU request for Loki single binary pods|
|observability.loki.singleBinary.resources.requests.memory|string|`"512Mi"`|Memory request for Loki single binary pods|
|observability.metrics-server|object|-|Kubernetes Metrics Server for resource metrics|
|observability.metrics-server.enabled|bool|`true`|Enable Metrics Server deployment|
|observability.metrics-server.image|object|-|Metrics Server container image|
|observability.metrics-server.image.repository|string|`"registry.k8s.io/metrics-server/metrics-server"`|Official Kubernetes metrics-server image|
|observability.metrics-server.resources|object|-|Resource requests and limits for Metrics Server|
|observability.metrics-server.resources.limits.cpu|string|`"360m"`|CPU limit for Metrics Server pods|
|observability.metrics-server.resources.limits.memory|string|`"256Mi"`|Memory limit for Metrics Server pods|
|observability.metrics-server.resources.requests.cpu|string|`"60m"`|CPU request for Metrics Server pods|
|observability.metrics-server.resources.requests.memory|string|`"128Mi"`|Memory request for Metrics Server pods|
|observability.prometheus-node-exporter|object|-|Prometheus Node Exporter for host metrics|
|observability.prometheus-node-exporter.image|object|-|Node exporter container image|
|observability.prometheus-node-exporter.image.registry|string|`"quay.io"`|OCI registry for node exporter|
|observability.prometheus-node-exporter.kubeRBACProxy.image.registry|string|`"quay.io"`|OCI registry for kube-rbac-proxy sidecar|
|observability.prometheus-node-exporter.resources|object|-|Resource requests and limits for node exporter DaemonSet|
|observability.prometheus-node-exporter.resources.limits.cpu|string|`"180m"`|CPU limit for node exporter pods|
|observability.prometheus-node-exporter.resources.limits.memory|string|`"64Mi"`|Memory limit for node exporter pods|
|observability.prometheus-node-exporter.resources.requests.cpu|string|`"30m"`|CPU request for node exporter pods|
|observability.prometheus-node-exporter.resources.requests.memory|string|`"32Mi"`|Memory request for node exporter pods|
|observability.tempo|object|-|Tempo distributed tracing backend|
|observability.tempo.server|object|-|Tempo server configuration|
|observability.tempo.server.resources|object|-|Resource requests and limits for Tempo|
|observability.tempo.server.resources.limits.cpu|string|`"360m"`|CPU limit for Tempo pods|
|observability.tempo.server.resources.limits.memory|string|`"320Mi"`|Memory limit for Tempo pods|
|observability.tempo.server.resources.requests.cpu|string|`"60m"`|CPU request for Tempo pods|
|observability.tempo.server.resources.requests.memory|string|`"160Mi"`|Memory request for Tempo pods|
|observability.tempo.tempo|object|-|Tempo server image configuration|
|observability.tempo.tempo.repository|string|`"docker.io/grafana/tempo"`|Tempo image repository|
|observability.tempo.tempoQuery|object|-|Tempo query frontend image|
|observability.tempo.tempoQuery.repository|string|`"docker.io/grafana/tempo-query"`|Tempo query image repository|
|observability.victoria-metrics-single|object|-|VictoriaMetrics time-series database for metrics storage|
|observability.victoria-metrics-single.global|object|-|Global VictoriaMetrics image configuration|
|observability.victoria-metrics-single.global.image.registry|string|`"docker.io"`|OCI registry for VictoriaMetrics shared components|
|observability.victoria-metrics-single.server|object|-|VictoriaMetrics server configuration|
|observability.victoria-metrics-single.server.image|object|-|VictoriaMetrics container image|
|observability.victoria-metrics-single.server.image.registry|string|`"docker.io"`|OCI registry for VictoriaMetrics|
|observability.victoria-metrics-single.server.persistentVolume|object|-|Persistent storage for metrics data|
|observability.victoria-metrics-single.server.persistentVolume.size|string|`"10Gi"`|Storage size for metrics retention|
|observability.victoria-metrics-single.server.persistentVolume.storageClass|string|`""`|StorageClass for metrics volume (empty uses cluster default)|
|observability.victoria-metrics-single.server.resources|object|-|Resource requests and limits for VictoriaMetrics|
|observability.victoria-metrics-single.server.resources.limits.cpu|string|`"360m"`|CPU limit for VictoriaMetrics pods|
|observability.victoria-metrics-single.server.resources.limits.memory|string|`"512Mi"`|Memory limit for VictoriaMetrics pods|
|observability.victoria-metrics-single.server.resources.requests.cpu|string|`"60m"`|CPU request for VictoriaMetrics pods|
|observability.victoria-metrics-single.server.resources.requests.memory|string|`"256Mi"`|Memory request for VictoriaMetrics pods|
|portal|object|-|Portal identity and access management configuration|
|portal.enabled|bool|`true`|Enable deployment of Portal IAM service|
|portal.image|object|-|Portal container image|
|portal.image.registry|string|`"ghcr.io"`|OCI registry for Portal image|
|portal.ingress|object|-|Ingress configuration for Portal API|
|portal.ingress.enabled|bool|`true`|Enable ingress exposure for Portal|
|portal.ingress.hostname|string|`"portal.k8s.orb.local"`|Hostname for Portal service. Update for your environment.|
|portal.ingress.ingressClassName|string|`"atk-nginx"`|IngressClass for Portal ingress resources|
|portal.initContainer|object|-|Init container for dependency checks|
|portal.initContainer.tcpCheck|object|-|TCP check for database readiness|
|portal.initContainer.tcpCheck.image|object|-|Wait-for-it utility image|
|portal.initContainer.tcpCheck.image.repository|string|`"ghcr.io/settlemint/btp-waitforit"`|Repository for TCP check utility|
|portal.resources|object|-|Resource requests and limits for Portal pods|
|portal.resources.limits.cpu|string|`"360m"`|CPU limit for Portal pods|
|portal.resources.limits.memory|string|`"512Mi"`|Memory limit for Portal pods|
|portal.resources.requests.cpu|string|`"60m"`|CPU request for Portal pods|
|portal.resources.requests.memory|string|`"256Mi"`|Memory request for Portal pods|
|portal.tests|object|-|Test pod image configuration|
|portal.tests.image.registry|string|`"docker.io"`|OCI registry for Portal test utilities|
|support|object|-|Support infrastructure (ingress, reloader, databases, object storage)|
|support.enabled|bool|`true`|Enable deployment of support infrastructure components|
|support.ingress-nginx|object|-|NGINX Ingress Controller configuration|
|support.ingress-nginx.controller|object|-|Ingress controller configuration|
|support.ingress-nginx.controller.image|object|-|Ingress controller container image|
|support.ingress-nginx.controller.image.repository|string|`"registry.k8s.io/ingress-nginx/controller"`|Official Kubernetes ingress-nginx controller image|
|support.ingress-nginx.controller.opentelemetry|object|-|OpenTelemetry sidecar image configuration|
|support.ingress-nginx.controller.opentelemetry.image.registry|string|`"registry.k8s.io"`|OCI registry for OpenTelemetry collector|
|support.ingress-nginx.controller.patch|object|-|Patch job image configuration|
|support.ingress-nginx.controller.patch.image.registry|string|`"registry.k8s.io"`|OCI registry for ingress-nginx patch job|
|support.ingress-nginx.controller.resources|object|-|Resource requests and limits for ingress controller|
|support.ingress-nginx.controller.resources.limits.cpu|string|`"720m"`|CPU limit for ingress controller pods|
|support.ingress-nginx.controller.resources.limits.memory|string|`"512Mi"`|Memory limit for ingress controller pods|
|support.ingress-nginx.controller.resources.requests.cpu|string|`"120m"`|CPU request for ingress controller pods|
|support.ingress-nginx.controller.resources.requests.memory|string|`"256Mi"`|Memory request for ingress controller pods|
|support.ingress-nginx.enabled|bool|`true`|Enable NGINX Ingress Controller deployment|
|support.ingress-nginx.global|object|-|Global ingress-nginx image configuration|
|support.ingress-nginx.global.image.registry|string|`"registry.k8s.io"`|OCI registry for ingress-nginx assets|
|support.ingress-nginx.replicaCount|int|`1`|Number of ingress controller replicas|
|support.minio|object|-|MinIO object storage configuration|
|support.minio.consoleIngress|object|-|MinIO console ingress configuration|
|support.minio.consoleIngress.enabled|bool|`true`|Enable ingress for MinIO console dashboard|
|support.minio.consoleIngress.hosts|list|-|Hostnames for MinIO console access|
|support.minio.consoleIngress.ingressClassName|string|`"atk-nginx"`|IngressClass for MinIO console ingress resources|
|support.minio.consoleIngress.path|string|`"/"`|Path prefix for MinIO console ingress|
|support.minio.enabled|bool|`true`|Enable MinIO object storage deployment|
|support.minio.image|object|-|MinIO server container image|
|support.minio.image.repository|string|`"docker.io/minio/minio"`|MinIO server image repository|
|support.minio.ingress|object|-|Ingress configuration for MinIO console|
|support.minio.ingress.enabled|bool|`true`|Enable ingress for MinIO web console|
|support.minio.ingress.hosts|list|-|Hostnames for MinIO access|
|support.minio.ingress.ingressClassName|string|`"atk-nginx"`|IngressClass for MinIO|
|support.minio.ingress.path|string|`"/"`|Path prefix for MinIO console|
|support.minio.mcImage|object|-|MinIO client (mc) container image|
|support.minio.mcImage.repository|string|`"docker.io/minio/minio"`|MinIO client image repository|
|support.minio.resources|object|-|Resource requests and limits for MinIO pods|
|support.minio.resources.limits.cpu|string|`"300m"`|CPU limit for MinIO pods|
|support.minio.resources.limits.memory|string|`"512Mi"`|Memory limit for MinIO pods|
|support.minio.resources.requests.cpu|string|`"50m"`|CPU request for MinIO pods|
|support.minio.resources.requests.memory|string|`"256Mi"`|Memory request for MinIO pods|
|support.postgresql|object|-|PostgreSQL database configuration|
|support.postgresql.enabled|bool|`true`|Enable PostgreSQL deployment|
|support.postgresql.image|object|-|PostgreSQL container image|
|support.postgresql.image.registry|string|`"docker.io"`|OCI registry for PostgreSQL image|
|support.redis|object|-|Redis in-memory data store configuration|
|support.redis.auth|object|-|Redis authentication configuration|
|support.redis.auth.enabled|bool|`true`|Enable Redis password authentication|
|support.redis.auth.password|string|`"atk"`|Redis password. Change for production deployments.|
|support.redis.commonLabels|object|-|Common labels applied to all Redis resources|
|support.redis.commonLabels."app.kubernetes.io/managed-by"|string|`"helm"`|Label identifying Helm as the managing tool for Redis resources|
|support.redis.commonLabels."kots.io/app-slug"|string|`"settlemint-atk"`|KOTS application slug tag for Redis resources|
|support.redis.enabled|bool|`true`|Enable Redis deployment|
|support.redis.fullnameOverride|string|`"redis"`|Override fullname for simpler service discovery|
|support.redis.image|object|-|Redis container image|
|support.redis.image.registry|string|`"docker.io"`|OCI registry for Redis image|
|support.redis.persistence|object|-|Persistent storage for Redis data|
|support.redis.persistence.enabled|bool|`true`|Enable persistence for Redis AOF/RDB|
|support.redis.persistence.size|string|`"1Gi"`|Storage size for Redis data|
|support.redis.resources|object|-|Resource requests and limits for Redis|
|support.redis.resources.limits|object|-|Resource limits|
|support.redis.resources.limits.cpu|string|`"240m"`|CPU limit|
|support.redis.resources.limits.memory|string|`"128Mi"`|Memory limit|
|support.redis.resources.requests|object|-|Resource requests|
|support.redis.resources.requests.cpu|string|`"40m"`|CPU request|
|support.redis.resources.requests.memory|string|`"64Mi"`|Memory request|
|support.reloader|object|-|Stakater Reloader for automatic pod restarts on config changes|
|support.reloader.enabled|bool|`true`|Enable Reloader deployment|
|support.reloader.image|object|-|Reloader container image|
|support.reloader.image.repository|string|`"ghcr.io/stakater/reloader"`|Reloader image repository|
|support.reloader.resources|object|-|Resource requests and limits for Reloader deployment|
|support.reloader.resources.limits.cpu|string|`"120m"`|CPU limit for Reloader pods|
|support.reloader.resources.limits.memory|string|`"128Mi"`|Memory limit for Reloader pods|
|support.reloader.resources.requests.cpu|string|`"20m"`|CPU request for Reloader pods|
|support.reloader.resources.requests.memory|string|`"64Mi"`|Memory request for Reloader pods|
|txsigner|object|-|Transaction Signer service configuration|
|txsigner.config|object|-|Transaction signer wallet configuration|
|txsigner.config.derivationPath|string|`"m/44'/60'/0'/0/0"`|BIP44 derivation path for Ethereum accounts|
|txsigner.config.mnemonic|string|`"gate yellow grunt wrestle disease obtain mixed nature mansion tape purchase awful"`|BIP39 mnemonic phrase for deterministic key generation. MUST be changed for production.|
|txsigner.enabled|bool|`true`|Enable deployment of transaction signing service|
|txsigner.image|object|-|Transaction signer container image|
|txsigner.image.registry|string|`"ghcr.io"`|OCI registry for txsigner image|
|txsigner.ingress|object|-|Ingress configuration for transaction signer API|
|txsigner.ingress.enabled|bool|`false`|Enable ingress (typically disabled for internal-only services)|
|txsigner.ingress.hostname|string|`"txsigner.k8s.orb.local"`|Hostname for transaction signer|
|txsigner.initContainer|object|-|Init container for dependency checks|
|txsigner.initContainer.tcpCheck|object|-|TCP check for blockchain node readiness|
|txsigner.initContainer.tcpCheck.image|object|-|Wait-for-it utility image|
|txsigner.initContainer.tcpCheck.image.repository|string|`"ghcr.io/settlemint/btp-waitforit"`|Repository for TCP check utility|
|txsigner.resources|object|-|Resource requests and limits for transaction signer|
|txsigner.resources.limits.cpu|string|`"360m"`|CPU limit for txsigner pods|
|txsigner.resources.limits.memory|string|`"384Mi"`|Memory limit for txsigner pods|
|txsigner.resources.requests.cpu|string|`"60m"`|CPU request for txsigner pods|
|txsigner.resources.requests.memory|string|`"192Mi"`|Memory request for txsigner pods|
|txsigner.tests|object|-|Test container image for health checks|
|txsigner.tests.image|object|-|Test image configuration|
|txsigner.tests.image.registry|string|`"docker.io"`|OCI registry for test utilities|

## Resource Summary

| Component | Replicas | Request CPU | Limit CPU | Request Memory | Limit Memory | Storage |
|-----------|----------|-------------|-----------|----------------|--------------|---------|
| blockscout.blockscout | 1 | 100m | 600m | 640Mi | 1280Mi | - |
| blockscout.frontend | 1 | 60m | 360m | 320Mi | 640Mi | - |
| dapp | 1 | 100m | 3000m | 1024Mi | 2048Mi | - |
| erpc | 1 | 60m | 360m | 256Mi | 512Mi | - |
| graph-node | 1 | 60m | 360m | 512Mi | 1024Mi | - |
| hasura | 1 | 80m | 480m | 384Mi | 768Mi | - |
| ipfs.cluster | 1 | 60m | 360m | 256Mi | 512Mi | - |
| ipfs.ipfs | 1 | 150m | 900m | 512Mi | 1024Mi | - |
| network.network-bootstrapper | 1 | 100m | 600m | 128Mi | 256Mi | - |
| network.network-nodes | 2 | 60m (total 120m) | 360m (total 720m) | 512Mi (total 1024Mi) | 1024Mi (total 2048Mi) | 20Gi (total 40Gi) |
| network.network-nodes.compileGenesis | 1 | 100m | 600m | 128Mi | 256Mi | - |
| observability.alloy.alloy | 1 | 120m | 720m | 512Mi | 1024Mi | - |
| observability.grafana | 1 | 60m | 360m | 256Mi | 512Mi | - |
| observability.kube-state-metrics | 1 | 40m | 240m | 128Mi | 256Mi | - |
| observability.loki.gateway | 1 | 20m | 120m | 32Mi | 64Mi | - |
| observability.loki.memcached | 1 | 40m | 240m | 48Mi | 96Mi | - |
| observability.loki.memcachedExporter | 1 | 10m | 60m | 24Mi | 48Mi | - |
| observability.loki.sidecar | 1 | 120m | 720m | 96Mi | 192Mi | - |
| observability.loki.singleBinary | 1 | 200m | 1200m | 512Mi | 1024Mi | 10Gi |
| observability.metrics-server | 1 | 60m | 360m | 128Mi | 256Mi | - |
| observability.prometheus-node-exporter | 1 | 30m | 180m | 32Mi | 64Mi | - |
| observability.tempo.server | 1 | 60m | 360m | 160Mi | 320Mi | - |
| observability.victoria-metrics-single.server | 1 | 60m | 360m | 256Mi | 512Mi | 10Gi |
| portal | 1 | 60m | 360m | 256Mi | 512Mi | - |
| support.ingress-nginx.controller | 1 | 120m | 720m | 256Mi | 512Mi | - |
| support.minio | 1 | 50m | 300m | 256Mi | 512Mi | - |
| support.redis | 1 | 40m | 240m | 64Mi | 128Mi | 1Gi |
| support.reloader | 1 | 20m | 120m | 64Mi | 128Mi | - |
| txsigner | 1 | 60m | 360m | 192Mi | 384Mi | - |
| **Totals** | - | 2.16 cores (2160m) | 15.36 cores (15360m) | 8456Mi (8.26Gi) | 16912Mi (16.52Gi) | 62464Mi (61.00Gi) |

## Network Node Replica Breakdown

| Workload | Replicas | Notes |
|----------|----------|-------|
| Validators | 1 | Primary consensus nodes |
| RPC | 1 | Public JSON-RPC endpoints |
| **Total Besu Pods** | 2 | Sum used for capacity planning |

## Maintainers

| Name | Email | Url |
| ---- | ------ | --- |
| SettleMint | <support@settlemint.com> | <https://settlemint.com> |

## Requirements

| Repository | Name | Version |
|------------|------|---------|
|  | blockscout | 2.0.0-beta.5 |
|  | dapp | 2.0.0-beta.5 |
|  | erpc | 2.0.0-beta.5 |
|  | graph-node | 2.0.0-beta.5 |
|  | hasura | 2.0.0-beta.5 |
|  | ipfs | 2.0.0-beta.5 |
|  | network | 2.0.0-beta.5 |
|  | observability | 2.0.0-beta.5 |
|  | portal | 2.0.0-beta.5 |
|  | support | 2.0.0-beta.5 |
|  | txsigner | 2.0.0-beta.5 |

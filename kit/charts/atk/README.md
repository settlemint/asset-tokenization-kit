# atk

![Version: 2.0.0-alpha.17](https://img.shields.io/badge/Version-2.0.0--alpha.17-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: 2.0.0-alpha.17](https://img.shields.io/badge/AppVersion-2.0.0--alpha.17-informational?style=flat-square)

A Helm chart for the SettleMint Asset Tokenization Kit

## Configuration

The following table lists the configurable parameters of this chart and their default values.

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
|global|object|-|Global Docker image registry and security defaults|
|global.artifacts|object|-|Artifacts configuration for contract ABIs and genesis files|
|global.artifacts.image|object|-|Image containing contract ABIs and genesis files|
|global.artifacts.image.pullPolicy|string|`"IfNotPresent"`|Image pull policy|
|global.artifacts.image.registry|string|`"ghcr.io"`|Image registry|
|global.artifacts.image.repository|string|`"settlemint/asset-tokenization-kit-artifacts"`|Image repository|
|global.artifacts.image.tag|string|`""`|Image tag (empty string uses Chart.appVersion)|
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
|global.imagePullSecrets|list|-|Global Docker registry secret names as an array|
|global.imageRegistry|string|`""`|Global Docker image registry|
|global.imageTag|string|`""`|Global image tag override|
|global.labels|object|-|Global labels applied to all resources across all subcharts|
|global.labels."kots.io/app-slug"|string|`"settlemint-atk"`|KOTS application slug identifier|
|global.networkNodes|object|-|Defaults consumed by Besu network node workloads|
|global.networkNodes.faucetArtifactPrefix|string|`"besu-faucet"`|Prefix used for faucet-related ConfigMaps and Secrets containing funded accounts|
|global.networkNodes.genesisConfigMapName|string|`"besu-genesis"`|ConfigMap name storing the generated genesis.json artifact|
|global.networkNodes.podPrefix|string|`""`|StatefulSet prefix used for validator pod hostnames|
|global.networkNodes.serviceName|string|`""`|Kubernetes Service name fronting validator pods to align bootstrapper static-nodes output|
|global.networkNodes.staticNodesConfigMapName|string|`"besu-static-nodes"`|ConfigMap name storing static-nodes.json entries for node discovery|
|global.securityContexts|object|-|Shared security context defaults|
|global.securityContexts.container|object|-|Container security context inherited by subcharts when set|
|global.securityContexts.pod|object|-|Pod security context inherited by subcharts when set|
|global.storageClass|string|`""`|Global StorageClass for Persistent Volume(s)|
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
|blockscout.blockscout.resources.limits.cpu|string|`"1500m"`|CPU limit for Blockscout backend pods|
|blockscout.blockscout.resources.limits.memory|string|`"2560Mi"`|Memory limit for Blockscout backend pods|
|blockscout.blockscout.resources.requests.cpu|string|`"150m"`|CPU request for Blockscout backend pods|
|blockscout.blockscout.resources.requests.memory|string|`"1280Mi"`|Memory request for Blockscout backend pods|
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
|blockscout.frontend.resources.limits.cpu|string|`"600m"`|CPU limit for Blockscout frontend pods|
|blockscout.frontend.resources.limits.memory|string|`"1536Mi"`|Memory limit for Blockscout frontend pods|
|blockscout.frontend.resources.requests.cpu|string|`"120m"`|CPU request for Blockscout frontend pods|
|blockscout.frontend.resources.requests.memory|string|`"768Mi"`|Memory request for Blockscout frontend pods|
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
|dapp.resources.limits.cpu|string|`"1000m"`|CPU limit for DApp pods|
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
|erpc.resources.limits.cpu|string|`"1000m"`|CPU limit for ERPC pods|
|erpc.resources.limits.memory|string|`"2048Mi"`|Memory limit for ERPC pods|
|erpc.resources.requests.cpu|string|`"250m"`|CPU request for ERPC pods|
|erpc.resources.requests.memory|string|`"1024Mi"`|Memory request for ERPC pods|
|erpc.tests|object|-|Test container image for ERPC health checks|
|erpc.tests.image|object|-|Test image configuration|
|erpc.tests.image.registry|string|`"docker.io"`|OCI registry for test utilities|
|global|object|-|Global configuration shared across all subcharts|
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
|graph-node.ingress.className|string|`"atk-nginx"`|IngressClass for Graph Node|
|graph-node.ingress.enabled|bool|`true`|Enable ingress for subgraph queries|
|graph-node.ingress.hosts|list|-|Ingress host rules for Graph Node endpoints|
|graph-node.ingress.hosts[0].host|string|`"graph.k8s.orb.local"`|Hostname for Graph Node. Update for your environment.|
|graph-node.ingress.hosts[0].paths|list|-|Path configurations for different Graph Node endpoints|
|graph-node.ingress.hosts[0].paths[0].path|string|`"/(.*)"`|Query endpoint path|
|graph-node.ingress.hosts[0].paths[0].pathType|string|`"ImplementationSpecific"`|Path matching type|
|graph-node.ingress.hosts[0].paths[1].path|string|`"/ws/?(.*)"`|WebSocket endpoint path|
|graph-node.ingress.hosts[0].paths[1].pathType|string|`"ImplementationSpecific"`|Path matching type|
|graph-node.ingress.hosts[0].paths[2].path|string|`"/admin/?(.*)"`|Admin API path|
|graph-node.ingress.hosts[0].paths[2].pathType|string|`"ImplementationSpecific"`|Path matching type|
|graph-node.ingress.hosts[0].paths[3].path|string|`"/indexer/?(.*)"`|Indexer status path|
|graph-node.ingress.hosts[0].paths[3].pathType|string|`"ImplementationSpecific"`|Path matching type|
|graph-node.ingress.hosts[0].paths[4].path|string|`"/graphman/?(.*)"`|Graph management path|
|graph-node.ingress.hosts[0].paths[4].pathType|string|`"ImplementationSpecific"`|Path matching type|
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
|graph-node.resources.limits.cpu|string|`"1000m"`|CPU limit for Graph Node pods|
|graph-node.resources.limits.memory|string|`"3072Mi"`|Memory limit for Graph Node pods|
|graph-node.resources.requests.cpu|string|`"100m"`|CPU request for Graph Node pods|
|graph-node.resources.requests.memory|string|`"1536Mi"`|Memory request for Graph Node pods|
|hasura|object|-|Hasura GraphQL Engine configuration|
|hasura.enabled|bool|`true`|Enable deployment of Hasura GraphQL engine|
|hasura.fullnameOverride|string|`"hasura"`|Override fullname to simplify service discovery|
|hasura.image|object|-|Hasura container image configuration|
|hasura.image.pullPolicy|string|`"IfNotPresent"`|Image pull policy|
|hasura.image.registry|string|`"docker.io"`|OCI registry for Hasura image|
|hasura.image.repository|string|`"hasura/graphql-engine"`|Hasura image repository|
|hasura.image.tag|string|`"v2.48.6"`|Hasura version tag|
|hasura.ingress|object|-|Ingress configuration for Hasura console and API|
|hasura.ingress.className|string|`"atk-nginx"`|IngressClass for Hasura ingress resources|
|hasura.ingress.enabled|bool|`true`|Enable ingress exposure for Hasura|
|hasura.ingress.hostName|string|`"hasura.k8s.orb.local"`|Hostname for Hasura GraphQL endpoint. Update for your environment.|
|hasura.resources|object|-|Resource requests and limits for Hasura deployment|
|hasura.resources.limits.cpu|string|`"1000m"`|CPU limit for Hasura pods|
|hasura.resources.limits.memory|string|`"2048Mi"`|Memory limit for Hasura pods|
|hasura.resources.requests.cpu|string|`"100m"`|CPU request for Hasura pods|
|hasura.resources.requests.memory|string|`"1024Mi"`|Memory request for Hasura pods|
|ipfs|object|-|IPFS Cluster deployment configuration|
|ipfs.cluster|object|-|IPFS Cluster control-plane configuration overrides|
|ipfs.cluster.image.registry|string|`"docker.io"`|OCI registry for the cluster control-plane image|
|ipfs.cluster.resources|object|-|Resource requests and limits for IPFS Cluster control-plane pods|
|ipfs.cluster.resources.limits.cpu|string|`"1000m"`|CPU limit for cluster pods|
|ipfs.cluster.resources.limits.memory|string|`"2048Mi"`|Memory limit for cluster pods|
|ipfs.cluster.resources.requests.cpu|string|`"50m"`|CPU request for cluster pods|
|ipfs.cluster.resources.requests.memory|string|`"1024Mi"`|Memory request for cluster pods|
|ipfs.enabled|bool|`true`|Enable deployment of the IPFS cluster stack|
|ipfs.ingress|object|-|Ingress configuration for the IPFS cluster endpoints|
|ipfs.ingress.className|string|`"atk-nginx"`|IngressClass for IPFS cluster ingress resources|
|ipfs.ingress.enabled|bool|`true`|Enable ingress exposure for IPFS cluster endpoints|
|ipfs.ipfs|object|-|IPFS peer configuration overrides|
|ipfs.ipfs.image.registry|string|`"docker.io"`|OCI registry for the Kubo image|
|ipfs.ipfs.resources|object|-|Resource requests and limits for IPFS peer pods|
|ipfs.ipfs.resources.limits.cpu|string|`"600m"`|CPU limit for IPFS pods|
|ipfs.ipfs.resources.limits.memory|string|`"2048Mi"`|Memory limit for IPFS pods|
|ipfs.ipfs.resources.requests.cpu|string|`"300m"`|CPU request for IPFS pods|
|ipfs.ipfs.resources.requests.memory|string|`"1024Mi"`|Memory request for IPFS pods|
|ipfs.tests|object|-|Test pod image configuration|
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
|network.network-bootstrapper.resources.limits.cpu|string|`"250m"`|CPU limit for bootstrapper pods|
|network.network-bootstrapper.resources.limits.memory|string|`"256Mi"`|Memory limit for bootstrapper pods|
|network.network-bootstrapper.resources.requests.cpu|string|`"100m"`|CPU request for bootstrapper pods|
|network.network-bootstrapper.resources.requests.memory|string|`"128Mi"`|Memory request for bootstrapper pods|
|network.network-nodes|object|-|Blockchain node configuration (validators and RPC)|
|network.network-nodes.compileGenesis.resources|object|-|Resource requests and limits for genesis compilation init container|
|network.network-nodes.compileGenesis.resources.limits.cpu|string|`"250m"`|CPU limit for genesis compilation|
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
|network.network-nodes.resources|object|-|Resource requests and limits for Besu validator and RPC pods|
|network.network-nodes.resources.limits.cpu|string|`"1500m"`|CPU limit per Besu pod|
|network.network-nodes.resources.limits.memory|string|`"2560Mi"`|Memory limit per Besu pod|
|network.network-nodes.resources.requests.cpu|string|`"75m"`|CPU request per Besu pod|
|network.network-nodes.resources.requests.memory|string|`"1280Mi"`|Memory request per Besu pod|
|observability|object|-|Observability stack (metrics, logging, tracing)|
|observability.alloy|object|-|Grafana Alloy for telemetry pipeline|
|observability.alloy.alloy|object|-|Alloy agent configuration|
|observability.alloy.alloy.resources|object|-|Resource requests and limits for Alloy|
|observability.alloy.alloy.resources.limits.cpu|string|`"240m"`|CPU limit for Alloy pods|
|observability.alloy.alloy.resources.limits.memory|string|`"320Mi"`|Memory limit for Alloy pods|
|observability.alloy.alloy.resources.requests.cpu|string|`"100m"`|CPU request for Alloy pods|
|observability.alloy.alloy.resources.requests.memory|string|`"160Mi"`|Memory request for Alloy pods|
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
|observability.grafana.resources.limits.memory|string|`"384Mi"`|Memory limit for Grafana pods|
|observability.grafana.resources.requests.cpu|string|`"180m"`|CPU request for Grafana pods|
|observability.grafana.resources.requests.memory|string|`"192Mi"`|Memory request for Grafana pods|
|observability.grafana.sidecar|object|-|Sidecar for dashboard provisioning|
|observability.grafana.sidecar.image|object|-|Sidecar container image|
|observability.grafana.sidecar.image.registry|string|`"docker.io"`|OCI registry for sidecar|
|observability.kube-state-metrics|object|-|Kube State Metrics for cluster-level metrics|
|observability.kube-state-metrics.image|object|-|Kube state metrics container image|
|observability.kube-state-metrics.image.registry|string|`"registry.k8s.io"`|OCI registry for kube-state-metrics|
|observability.kube-state-metrics.resources|object|-|Resource requests and limits for kube-state-metrics|
|observability.kube-state-metrics.resources.limits.cpu|string|`"240m"`|CPU limit for kube-state-metrics pods|
|observability.kube-state-metrics.resources.limits.memory|string|`"256Mi"`|Memory limit for kube-state-metrics pods|
|observability.kube-state-metrics.resources.requests.cpu|string|`"120m"`|CPU request for kube-state-metrics pods|
|observability.kube-state-metrics.resources.requests.memory|string|`"160Mi"`|Memory request for kube-state-metrics pods|
|observability.loki|object|-|Loki log aggregation system|
|observability.loki.gateway|object|-|Loki gateway for load balancing|
|observability.loki.gateway.image|object|-|Gateway container image|
|observability.loki.gateway.image.registry|string|`"docker.io"`|OCI registry for gateway image|
|observability.loki.gateway.resources|object|-|Resource requests and limits for Loki gateway pods|
|observability.loki.gateway.resources.limits.cpu|string|`"150m"`|CPU limit for gateway pods|
|observability.loki.gateway.resources.limits.memory|string|`"160Mi"`|Memory limit for gateway pods|
|observability.loki.gateway.resources.requests.cpu|string|`"50m"`|CPU request for gateway pods|
|observability.loki.gateway.resources.requests.memory|string|`"64Mi"`|Memory request for gateway pods|
|observability.loki.loki|object|-|Loki server configuration|
|observability.loki.loki.image|object|-|Loki container image|
|observability.loki.loki.image.registry|string|`"docker.io"`|OCI registry for Loki|
|observability.loki.memcached|object|-|Memcached for Loki query result caching|
|observability.loki.memcached.enabled|bool|`true`|Enable memcached deployment|
|observability.loki.memcached.image|object|-|Memcached container image|
|observability.loki.memcached.image.repository|string|`"docker.io/memcached"`|Memcached image repository|
|observability.loki.memcached.resources|object|-|Resource requests and limits for Loki memcached pods|
|observability.loki.memcached.resources.limits.cpu|string|`"120m"`|CPU limit for memcached pods|
|observability.loki.memcached.resources.limits.memory|string|`"96Mi"`|Memory limit for memcached pods|
|observability.loki.memcached.resources.requests.cpu|string|`"40m"`|CPU request for memcached pods|
|observability.loki.memcached.resources.requests.memory|string|`"48Mi"`|Memory request for memcached pods|
|observability.loki.memcachedExporter|object|-|Memcached exporter for Prometheus metrics|
|observability.loki.memcachedExporter.image|object|-|Memcached exporter image|
|observability.loki.memcachedExporter.image.repository|string|`"docker.io/prom/memcached-exporter"`|Prometheus memcached exporter repository|
|observability.loki.memcachedExporter.resources|object|-|Resource requests and limits for memcached exporter pods|
|observability.loki.memcachedExporter.resources.limits.cpu|string|`"25m"`|CPU limit for memcached exporter pods|
|observability.loki.memcachedExporter.resources.limits.memory|string|`"48Mi"`|Memory limit for memcached exporter pods|
|observability.loki.memcachedExporter.resources.requests.cpu|string|`"10m"`|CPU request for memcached exporter pods|
|observability.loki.memcachedExporter.resources.requests.memory|string|`"24Mi"`|Memory request for memcached exporter pods|
|observability.loki.sidecar|object|-|Kubernetes sidecar for dynamic configuration|
|observability.loki.sidecar.image|object|-|Sidecar container image|
|observability.loki.sidecar.image.repository|string|`"docker.io/kiwigrid/k8s-sidecar"`|k8s-sidecar image repository|
|observability.loki.sidecar.resources|object|-|Resource requests and limits for Loki sidecar pods|
|observability.loki.sidecar.resources.limits.cpu|string|`"75m"`|CPU limit for sidecar pods|
|observability.loki.sidecar.resources.limits.memory|string|`"72Mi"`|Memory limit for sidecar pods|
|observability.loki.sidecar.resources.requests.cpu|string|`"25m"`|CPU request for sidecar pods|
|observability.loki.sidecar.resources.requests.memory|string|`"36Mi"`|Memory request for sidecar pods|
|observability.loki.singleBinary|object|-|Loki single binary deployment mode|
|observability.loki.singleBinary.extraEnv|list|-|Additional environment variables for Loki|
|observability.loki.singleBinary.persistence|object|-|Persistent storage for log data|
|observability.loki.singleBinary.persistence.size|string|`"10Gi"`|Storage size for log retention|
|observability.loki.singleBinary.resources|object|-|Resource requests and limits for Loki|
|observability.loki.singleBinary.resources.limits.cpu|string|`"500m"`|CPU limit for Loki single binary pods|
|observability.loki.singleBinary.resources.limits.memory|string|`"600Mi"`|Memory limit for Loki single binary pods|
|observability.loki.singleBinary.resources.requests.cpu|string|`"170m"`|CPU request for Loki single binary pods|
|observability.loki.singleBinary.resources.requests.memory|string|`"360Mi"`|Memory request for Loki single binary pods|
|observability.metrics-server|object|-|Kubernetes Metrics Server for resource metrics|
|observability.metrics-server.enabled|bool|`true`|Enable Metrics Server deployment|
|observability.metrics-server.image|object|-|Metrics Server container image|
|observability.metrics-server.image.repository|string|`"registry.k8s.io/metrics-server/metrics-server"`|Official Kubernetes metrics-server image|
|observability.metrics-server.resources|object|-|Resource requests and limits for Metrics Server|
|observability.metrics-server.resources.limits.cpu|string|`"80m"`|CPU limit for Metrics Server pods|
|observability.metrics-server.resources.limits.memory|string|`"50Mi"`|Memory limit for Metrics Server pods|
|observability.metrics-server.resources.requests.cpu|string|`"40m"`|CPU request for Metrics Server pods|
|observability.metrics-server.resources.requests.memory|string|`"25Mi"`|Memory request for Metrics Server pods|
|observability.prometheus-node-exporter|object|-|Prometheus Node Exporter for host metrics|
|observability.prometheus-node-exporter.image|object|-|Node exporter container image|
|observability.prometheus-node-exporter.image.registry|string|`"quay.io"`|OCI registry for node exporter|
|observability.prometheus-node-exporter.kubeRBACProxy.image.registry|string|`"quay.io"`|OCI registry for kube-rbac-proxy sidecar|
|observability.prometheus-node-exporter.resources|object|-|Resource requests and limits for node exporter DaemonSet|
|observability.prometheus-node-exporter.resources.limits.cpu|string|`"60m"`|CPU limit for node exporter pods|
|observability.prometheus-node-exporter.resources.limits.memory|string|`"64Mi"`|Memory limit for node exporter pods|
|observability.prometheus-node-exporter.resources.requests.cpu|string|`"30m"`|CPU request for node exporter pods|
|observability.prometheus-node-exporter.resources.requests.memory|string|`"32Mi"`|Memory request for node exporter pods|
|observability.tempo|object|-|Tempo distributed tracing backend|
|observability.tempo.server|object|-|Tempo server configuration|
|observability.tempo.server.resources|object|-|Resource requests and limits for Tempo|
|observability.tempo.server.resources.limits.cpu|string|`"240m"`|CPU limit for Tempo pods|
|observability.tempo.server.resources.limits.memory|string|`"384Mi"`|Memory limit for Tempo pods|
|observability.tempo.server.resources.requests.cpu|string|`"100m"`|CPU request for Tempo pods|
|observability.tempo.server.resources.requests.memory|string|`"192Mi"`|Memory request for Tempo pods|
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
|observability.victoria-metrics-single.server.resources.limits.cpu|string|`"420m"`|CPU limit for VictoriaMetrics pods|
|observability.victoria-metrics-single.server.resources.limits.memory|string|`"600Mi"`|Memory limit for VictoriaMetrics pods|
|observability.victoria-metrics-single.server.resources.requests.cpu|string|`"180m"`|CPU request for VictoriaMetrics pods|
|observability.victoria-metrics-single.server.resources.requests.memory|string|`"320Mi"`|Memory request for VictoriaMetrics pods|
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
|portal.resources.limits.cpu|string|`"1000m"`|CPU limit for Portal pods|
|portal.resources.limits.memory|string|`"1024Mi"`|Memory limit for Portal pods|
|portal.resources.requests.cpu|string|`"100m"`|CPU request for Portal pods|
|portal.resources.requests.memory|string|`"512Mi"`|Memory request for Portal pods|
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
|support.ingress-nginx.controller.resources.limits.cpu|string|`"600m"`|CPU limit for ingress controller pods|
|support.ingress-nginx.controller.resources.limits.memory|string|`"1024Mi"`|Memory limit for ingress controller pods|
|support.ingress-nginx.controller.resources.requests.cpu|string|`"200m"`|CPU request for ingress controller pods|
|support.ingress-nginx.controller.resources.requests.memory|string|`"512Mi"`|Memory request for ingress controller pods|
|support.ingress-nginx.enabled|bool|`true`|Enable NGINX Ingress Controller deployment|
|support.ingress-nginx.global|object|-|Global ingress-nginx image configuration|
|support.ingress-nginx.global.image.registry|string|`"registry.k8s.io"`|OCI registry for ingress-nginx assets|
|support.ingress-nginx.replicaCount|int|`1`|Number of ingress controller replicas|
|support.minio|object|-|MinIO object storage configuration|
|support.minio.enabled|bool|`true`|Enable MinIO object storage deployment|
|support.minio.image|object|-|MinIO server container image|
|support.minio.image.repository|string|`"docker.io/minio/minio"`|MinIO server image repository|
|support.minio.mcImage|object|-|MinIO client (mc) container image|
|support.minio.mcImage.repository|string|`"docker.io/minio/minio"`|MinIO client image repository|
|support.postgresql|object|-|PostgreSQL database configuration|
|support.postgresql.enabled|bool|`true`|Enable PostgreSQL deployment|
|support.postgresql.image|object|-|PostgreSQL container image|
|support.postgresql.image.registry|string|`"docker.io"`|OCI registry for PostgreSQL image|
|support.redis|object|-|Redis in-memory data store configuration|
|support.redis.auth|object|-|Redis authentication configuration|
|support.redis.auth.enabled|bool|`true`|Enable Redis password authentication|
|support.redis.auth.password|string|`"atk"`|Redis password. Change for production deployments.|
|support.redis.commonLabels|object|-|Common labels applied to all Redis resources|
|support.redis.enabled|bool|`true`|Enable Redis deployment|
|support.redis.fullnameOverride|string|`"redis"`|Override fullname for simpler service discovery|
|support.redis.image|object|-|Redis container image|
|support.redis.image.registry|string|`"docker.io"`|OCI registry for Redis image|
|support.redis.persistence|object|-|Persistent storage for Redis data|
|support.redis.persistence.enabled|bool|`true`|Enable persistence for Redis AOF/RDB|
|support.redis.persistence.size|string|`"1Gi"`|Storage size for Redis data|
|support.redis.resources|object|-|Resource requests and limits for Redis|
|support.redis.resources.limits|object|-|Resource limits|
|support.redis.resources.limits.cpu|string|`"200m"`|CPU limit|
|support.redis.resources.limits.memory|string|`"256Mi"`|Memory limit|
|support.redis.resources.requests|object|-|Resource requests|
|support.redis.resources.requests.cpu|string|`"100m"`|CPU request|
|support.redis.resources.requests.memory|string|`"128Mi"`|Memory request|
|support.reloader|object|-|Stakater Reloader for automatic pod restarts on config changes|
|support.reloader.enabled|bool|`true`|Enable Reloader deployment|
|support.reloader.image|object|-|Reloader container image|
|support.reloader.image.repository|string|`"ghcr.io/stakater/reloader"`|Reloader image repository|
|support.reloader.resources|object|-|Resource requests and limits for Reloader deployment|
|support.reloader.resources.limits.cpu|string|`"200m"`|CPU limit for Reloader pods|
|support.reloader.resources.limits.memory|string|`"256Mi"`|Memory limit for Reloader pods|
|support.reloader.resources.requests.cpu|string|`"100m"`|CPU request for Reloader pods|
|support.reloader.resources.requests.memory|string|`"128Mi"`|Memory request for Reloader pods|
|support.resources.consoleIngress|object|-|MinIO console ingress configuration|
|support.resources.consoleIngress.enabled|bool|`true`|Enable ingress for MinIO console dashboard|
|support.resources.consoleIngress.hosts|list|-|Hostnames for MinIO console access|
|support.resources.consoleIngress.ingressClassName|string|`"atk-nginx"`|IngressClass for MinIO console ingress resources|
|support.resources.consoleIngress.path|string|`"/"`|Path prefix for MinIO console ingress|
|support.resources.ingress|object|-|Ingress configuration for MinIO console|
|support.resources.ingress.enabled|bool|`true`|Enable ingress for MinIO web console|
|support.resources.ingress.hosts|list|-|Hostnames for MinIO access|
|support.resources.ingress.ingressClassName|string|`"atk-nginx"`|IngressClass for MinIO|
|support.resources.ingress.path|string|`"/"`|Path prefix for MinIO console|
|support.resources.limits.cpu|string|`"500m"`|CPU limit for MinIO pods|
|support.resources.limits.memory|string|`"1024Mi"`|Memory limit for MinIO pods|
|support.resources.requests.cpu|string|`"50m"`|CPU request for MinIO pods|
|support.resources.requests.memory|string|`"512Mi"`|Memory request for MinIO pods|
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
|txsigner.resources.limits.cpu|string|`"500m"`|CPU limit for txsigner pods|
|txsigner.resources.limits.memory|string|`"512Mi"`|Memory limit for txsigner pods|
|txsigner.resources.requests.cpu|string|`"150m"`|CPU request for txsigner pods|
|txsigner.resources.requests.memory|string|`"256Mi"`|Memory request for txsigner pods|
|txsigner.tests|object|-|Test container image for health checks|
|txsigner.tests.image|object|-|Test image configuration|
|txsigner.tests.image.registry|string|`"docker.io"`|OCI registry for test utilities|
|blockscout.blockscout|object|-|Blockscout backend configuration|
|blockscout.blockscout.affinity|object|-|Affinity for pod assignment|
|blockscout.blockscout.annotations|object|-|Annotations for Blockscout backend deployment|
|blockscout.blockscout.containerSecurityContext|object|-|Container Security Context configuration for Blockscout backend (overrides global.securityContexts.container)|
|blockscout.blockscout.enabled|bool|`true`|Enable Blockscout backend deployment|
|blockscout.blockscout.env|object|-|Environment variables for Blockscout backend|
|blockscout.blockscout.env.ADMIN_PANEL_ENABLED|string|`"true"`|Enable admin panel|
|blockscout.blockscout.env.API_GRAPHQL_MAX_COMPLEXITY|string|`"1000"`|GraphQL API maximum complexity|
|blockscout.blockscout.env.API_URL|string|`"https://explorer.k8s.orb.local"`|API URL|
|blockscout.blockscout.env.DATABASE_TIMEOUT|string|`"60000"`|Database timeout|
|blockscout.blockscout.env.DATABASE_URL|string|`""`|Database connection URL (overrides global.datastores.blockscout.postgresql)|
|blockscout.blockscout.env.DISABLE_EXCHANGE_RATES|string|`"true"`|Disable exchange rates|
|blockscout.blockscout.env.ECTO_ADAPTER_TIMEOUT|string|`"60000"`|Database adapter timeout|
|blockscout.blockscout.env.ECTO_USE_SSL|string|`"false"`|Use SSL for database connection|
|blockscout.blockscout.env.EMISSION_FORMAT|string|`"DEFAULT"`|Emission format|
|blockscout.blockscout.env.ETHEREUM_JSONRPC_HTTP_URL|string|`"http://erpc:4000/settlemint/evm/{{ include \"blockscout.chainId\" . }}"`|Ethereum JSON-RPC HTTP URL|
|blockscout.blockscout.env.ETHEREUM_JSONRPC_TRACE_URL|string|`"http://erpc:4000/settlemint/evm/{{ include \"blockscout.chainId\" . }}"`|Ethereum JSON-RPC trace URL|
|blockscout.blockscout.env.ETHEREUM_JSONRPC_VARIANT|string|`"besu"`|Ethereum JSON-RPC variant|
|blockscout.blockscout.env.FETCH_REWARDS_WAY|string|`"trace_block"`|Fetch rewards method|
|blockscout.blockscout.env.IPFS_GATEWAY_URL|string|`"https://ipfs.io/ipfs"`|IPFS gateway URL|
|blockscout.blockscout.env.IPFS_PUBLIC_GATEWAY_URL|string|`"https://ipfs.io/ipfs"`|IPFS public gateway URL|
|blockscout.blockscout.env.MIX_ENV|string|`"prod"`|Mix environment|
|blockscout.blockscout.env.NETWORK|string|`"mainnet"`|Network type (mainnet/testnet)|
|blockscout.blockscout.env.OTHER_EXPLORERS|string|`"{}"`|Other explorers configuration|
|blockscout.blockscout.env.POOL_SIZE|string|`"10"`|Database pool size|
|blockscout.blockscout.env.POOL_SIZE_API|string|`"10"`|API database pool size|
|blockscout.blockscout.env.SECRET_KEY_BASE|string|`"atk"`|Secret key base for Phoenix application|
|blockscout.blockscout.env.SHOW_TXS_CHART|string|`"true"`|Show transactions chart|
|blockscout.blockscout.env.SUBNETWORK|string|`"ATK"`|Subnetwork name|
|blockscout.blockscout.env.SUPPORTED_CHAINS|string|`"{}"`|Supported chains configuration|
|blockscout.blockscout.env.TXS_STATS_ENABLED|string|`"true"`|Enable transaction statistics|
|blockscout.blockscout.env.TZDATA_DIR|string|`"/tmp/tzdata"`|Timezone data directory|
|blockscout.blockscout.env.WEBAPP_URL|string|`"https://explorer.k8s.orb.local"`|Web application URL|
|blockscout.blockscout.extraInitContainers|list|-|Additional init containers appended verbatim|
|blockscout.blockscout.image|object|-|Blockscout backend image configuration|
|blockscout.blockscout.image.pullPolicy|string|`"IfNotPresent"`|Blockscout backend image pull policy|
|blockscout.blockscout.image.repository|string|`"ghcr.io/blockscout/blockscout"`|Blockscout backend image repository|
|blockscout.blockscout.image.tag|string|`"9.0.2"`|Blockscout backend image tag (immutable tags are recommended)|
|blockscout.blockscout.ingress|object|-|Ingress parameters for Blockscout backend|
|blockscout.blockscout.ingress.annotations|object|-|Additional annotations for the Ingress resource|
|blockscout.blockscout.ingress.className|string|`"atk-nginx"`|IngressClass that will be be used to implement the Ingress (Kubernetes 1.18+)|
|blockscout.blockscout.ingress.enabled|bool|`true`|Enable ingress record generation for Blockscout backend|
|blockscout.blockscout.ingress.hostname|string|`"explorer.k8s.orb.local"`|Default host for the ingress record|
|blockscout.blockscout.ingress.tls|list|-|TLS configuration for the ingress|
|blockscout.blockscout.init|object|-|Init container configuration for database migrations|
|blockscout.blockscout.init.args|list|-|Init container arguments|
|blockscout.blockscout.init.command|list|-|Init container command|
|blockscout.blockscout.init.enabled|bool|`true`|Enable init container|
|blockscout.blockscout.initContainer|object|-|TCP-based dependency checks for Blockscout|
|blockscout.blockscout.initContainer.tcpCheck|object|-|TCP connection check configuration|
|blockscout.blockscout.initContainer.tcpCheck.enabled|bool|`true`|Enable TCP check init container|
|blockscout.blockscout.initContainer.tcpCheck.image|object|-|TCP check container image configuration|
|blockscout.blockscout.initContainer.tcpCheck.image.pullPolicy|string|`"IfNotPresent"`|TCP check container image pull policy|
|blockscout.blockscout.initContainer.tcpCheck.image.repository|string|`"ghcr.io/settlemint/btp-waitforit"`|TCP check container image repository|
|blockscout.blockscout.initContainer.tcpCheck.image.tag|string|`"v7.7.10"`|TCP check container image tag|
|blockscout.blockscout.initContainer.tcpCheck.resources|object|-|TCP check container resource requests and limits|
|blockscout.blockscout.initContainer.tcpCheck.resources.dependencies|list|-|List of service dependencies to check|
|blockscout.blockscout.initContainer.tcpCheck.resources.dependencies[0]|string|`{"endpoint":"{{ include \"atk.postgresql.endpoint\" (dict \"context\" $ \"chartKey\" \"blockscout\" \"local\" $.Values.postgresql) }}","name":"postgresql"}`|Dependency name|
|blockscout.blockscout.initContainer.tcpCheck.resources.dependencies[0].endpoint|string|`"{{ include \"atk.postgresql.endpoint\" (dict \"context\" $ \"chartKey\" \"blockscout\" \"local\" $.Values.postgresql) }}"`|Dependency endpoint to check|
|blockscout.blockscout.initContainer.tcpCheck.resources.limits|object|-|Resource limits for TCP check container|
|blockscout.blockscout.initContainer.tcpCheck.resources.limits.cpu|string|`"100m"`|CPU limit for TCP check container|
|blockscout.blockscout.initContainer.tcpCheck.resources.limits.memory|string|`"64Mi"`|Memory limit for TCP check container|
|blockscout.blockscout.initContainer.tcpCheck.resources.requests|object|-|Resource requests for TCP check container|
|blockscout.blockscout.initContainer.tcpCheck.resources.requests.cpu|string|`"10m"`|CPU request for TCP check container|
|blockscout.blockscout.initContainer.tcpCheck.resources.requests.memory|string|`"32Mi"`|Memory request for TCP check container|
|blockscout.blockscout.initContainer.tcpCheck.timeout|int|`120`|Timeout in seconds for TCP checks|
|blockscout.blockscout.initContainerSecurityContext|object|-|Init container Security Context configuration for Blockscout backend (overrides global.securityContexts.container)|
|blockscout.blockscout.livenessProbe|object|-|Configure Blockscout backend containers' liveness probe|
|blockscout.blockscout.livenessProbe.enabled|bool|`true`|Enable livenessProbe on Blockscout backend containers|
|blockscout.blockscout.livenessProbe.failureThreshold|int|`5`|Failure threshold for livenessProbe|
|blockscout.blockscout.livenessProbe.initialDelaySeconds|int|`100`|Initial delay seconds for livenessProbe|
|blockscout.blockscout.livenessProbe.periodSeconds|int|`100`|Period seconds for livenessProbe|
|blockscout.blockscout.livenessProbe.successThreshold|int|`1`|Success threshold for livenessProbe|
|blockscout.blockscout.livenessProbe.timeoutSeconds|int|`30`|Timeout seconds for livenessProbe|
|blockscout.blockscout.nodeSelector|object|-|Node labels for pod assignment|
|blockscout.blockscout.openShiftRoute|object|-|OpenShift Route parameters for Blockscout backend|
|blockscout.blockscout.openShiftRoute.alternateBackends|list|-|Additional backends for weighted routing|
|blockscout.blockscout.openShiftRoute.annotations|object|-|Additional annotations for the OpenShift route resource|
|blockscout.blockscout.openShiftRoute.enabled|bool|`false`|Enable OpenShift route creation for Blockscout backend|
|blockscout.blockscout.openShiftRoute.host|string|`"explorer.k8s.orb.local"`|Hostname exposed via the OpenShift route|
|blockscout.blockscout.openShiftRoute.path|string|`"/api"`|HTTP path exposed via the OpenShift route|
|blockscout.blockscout.openShiftRoute.port|object|-|Service port configuration for the route target|
|blockscout.blockscout.openShiftRoute.port.targetPort|string|`"http"`|Service target port name|
|blockscout.blockscout.openShiftRoute.tls|object|-|TLS configuration for the OpenShift route|
|blockscout.blockscout.openShiftRoute.to|object|-|Primary service weight configuration|
|blockscout.blockscout.openShiftRoute.to.weight|int|`100`|Weight assigned to the Blockscout backend service backend|
|blockscout.blockscout.openShiftRoute.wildcardPolicy|string|`"None"`|Wildcard policy to apply to the route|
|blockscout.blockscout.podAnnotations|object|-|Annotations for Blockscout backend pods|
|blockscout.blockscout.podSecurityContext|object|-|Pod Security Context configuration for Blockscout backend (overrides global.securityContexts.pod)|
|blockscout.blockscout.readinessProbe|object|-|Configure Blockscout backend containers' readiness probe|
|blockscout.blockscout.readinessProbe.enabled|bool|`true`|Enable readinessProbe on Blockscout backend containers|
|blockscout.blockscout.readinessProbe.failureThreshold|int|`5`|Failure threshold for readinessProbe|
|blockscout.blockscout.readinessProbe.initialDelaySeconds|int|`30`|Initial delay seconds for readinessProbe|
|blockscout.blockscout.readinessProbe.periodSeconds|int|`10`|Period seconds for readinessProbe|
|blockscout.blockscout.readinessProbe.successThreshold|int|`1`|Success threshold for readinessProbe|
|blockscout.blockscout.readinessProbe.timeoutSeconds|int|`30`|Timeout seconds for readinessProbe|
|blockscout.blockscout.replicaCount|int|`1`|Number of Blockscout backend replicas to deploy|
|blockscout.blockscout.resources|object|-|Blockscout backend containers resource requests and limits|
|blockscout.blockscout.separateApi|object|-|Separate API configuration|
|blockscout.blockscout.separateApi.enabled|bool|`false`|Enable separate API deployment|
|blockscout.blockscout.separateApi.replicaCount|int|`1`|Number of separate API replicas|
|blockscout.blockscout.service|object|-|Service parameters for Blockscout backend|
|blockscout.blockscout.service.port|int|`80`|Blockscout backend service HTTP port|
|blockscout.blockscout.service.type|string|`"ClusterIP"`|Blockscout backend service type|
|blockscout.blockscout.tolerations|list|-|Tolerations for pod assignment|
|blockscout.config|object|-|Blockscout configuration|
|blockscout.config.account|object|-|Account configuration|
|blockscout.config.account.enabled|bool|`false`|Enable account functionality|
|blockscout.config.network|object|-|Network configuration|
|blockscout.config.network.currency|object|-|Network currency configuration|
|blockscout.config.network.currency.decimals|int|`18`|Currency decimals|
|blockscout.config.network.currency.dualToken|bool|`false`|Enable dual token support|
|blockscout.config.network.currency.name|string|`"Native Token"`|Currency name|
|blockscout.config.network.currency.symbol|string|`"NT"`|Currency symbol|
|blockscout.config.network.icon|string|`""`|Network icon URL|
|blockscout.config.network.icon_dark|string|`""`|Network dark mode icon URL|
|blockscout.config.network.id|int|`"{{ .Values.global.chainId }}"`|Network ID|
|blockscout.config.network.logo|string|`""`|Network logo URL|
|blockscout.config.network.logo_dark|string|`""`|Network dark mode logo URL|
|blockscout.config.network.name|string|`"Asset Tokenization Kit"`|Network name|
|blockscout.config.network.shortname|string|`"ATK"`|Network short name|
|blockscout.config.prometheus|object|-|Prometheus configuration|
|blockscout.config.prometheus.blackbox|object|-|Blackbox exporter configuration|
|blockscout.config.prometheus.blackbox.enabled|bool|`false`|Enable blackbox exporter|
|blockscout.config.prometheus.enabled|bool|`false`|Enable Prometheus metrics|
|blockscout.config.testnet|bool|`false`|Enable testnet mode|
|blockscout.frontend|object|-|Blockscout frontend configuration|
|blockscout.frontend.affinity|object|-|Affinity for pod assignment|
|blockscout.frontend.containerSecurityContext|object|-|Container Security Context configuration for Blockscout frontend|
|blockscout.frontend.containerSecurityContext.allowPrivilegeEscalation|bool|`false`|Controls whether a process can gain more privileges than its parent process|
|blockscout.frontend.containerSecurityContext.capabilities|object|-|Linux capabilities to drop|
|blockscout.frontend.containerSecurityContext.capabilities.drop|list|-|List of Linux capabilities to drop from the container|
|blockscout.frontend.containerSecurityContext.readOnlyRootFilesystem|bool|`false`|Mount the container's root filesystem as read-only|
|blockscout.frontend.containerSecurityContext.runAsGroup|int|`1001`|Group ID to run the entrypoint of the container process|
|blockscout.frontend.containerSecurityContext.runAsNonRoot|bool|`true`|Indicates that the container must run as a non-root user|
|blockscout.frontend.containerSecurityContext.runAsUser|int|`1001`|User ID to run the entrypoint of the container process|
|blockscout.frontend.enabled|bool|`true`|Enable Blockscout frontend deployment|
|blockscout.frontend.env|object|-|Environment variables for Blockscout frontend|
|blockscout.frontend.env.NEXT_PUBLIC_AD_BANNER_PROVIDER|string|`"none"`|Ad banner provider configuration|
|blockscout.frontend.env.NEXT_PUBLIC_AD_TEXT_PROVIDER|string|`"none"`|Ad text provider configuration|
|blockscout.frontend.env.NEXT_PUBLIC_FONT_FAMILY_BODY|string|`"{'name':'Figtree','url':'https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,300..900;1,300..900&display=swap'}"`|Font family for body text|
|blockscout.frontend.env.NEXT_PUBLIC_FONT_FAMILY_HEADING|string|`"{'name':'Figtree','url':'https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,300..900;1,300..900&display=swap'}"`|Font family for headings|
|blockscout.frontend.env.NEXT_PUBLIC_HAS_BEACON_CHAIN|string|`"false"`|Enable beacon chain support|
|blockscout.frontend.env.NEXT_PUBLIC_HAS_CONTRACT_AUDIT_REPORTS|string|`"true"`|Enable contract audit reports|
|blockscout.frontend.env.NEXT_PUBLIC_HOMEPAGE_CHARTS|string|`"[\"daily_txs\"]"`|Homepage charts configuration|
|blockscout.frontend.env.NEXT_PUBLIC_HOMEPAGE_STATS|string|`"[\"total_blocks\",\"average_block_time\",\"total_txs\",\"wallet_addresses\",\"gas_tracker\"]"`|Homepage stats configuration|
|blockscout.frontend.env.NEXT_PUBLIC_IS_ACCOUNT_SUPPORTED|string|`"false"`|Enable account support in frontend|
|blockscout.frontend.env.NEXT_PUBLIC_IS_TESTNET|string|`"false"`|Enable testnet mode in frontend|
|blockscout.frontend.env.NEXT_PUBLIC_OG_ENHANCED_DATA_ENABLED|string|`"true"`|Enable OpenGraph enhanced data|
|blockscout.frontend.env.NEXT_PUBLIC_PROMOTE_BLOCKSCOUT_IN_TITLE|string|`"false"`|Promote Blockscout in title|
|blockscout.frontend.env.NEXT_PUBLIC_SEO_ENHANCED_DATA_ENABLED|string|`"true"`|Enable SEO enhanced data|
|blockscout.frontend.env.NEXT_PUBLIC_TRANSACTION_INTERPRETATION_PROVIDER|string|`"blockscout"`|Transaction interpretation provider|
|blockscout.frontend.image|object|-|Blockscout frontend image configuration|
|blockscout.frontend.image.pullPolicy|string|`"IfNotPresent"`|Blockscout frontend image pull policy|
|blockscout.frontend.image.repository|string|`"ghcr.io/blockscout/frontend"`|Blockscout frontend image repository|
|blockscout.frontend.image.tag|string|`"v2.3.4"`|Blockscout frontend image tag (immutable tags are recommended)|
|blockscout.frontend.ingress|object|-|Ingress parameters for Blockscout frontend|
|blockscout.frontend.ingress.annotations|object|-|Additional annotations for the Ingress resource|
|blockscout.frontend.ingress.className|string|`"atk-nginx"`|IngressClass that will be be used to implement the Ingress (Kubernetes 1.18+)|
|blockscout.frontend.ingress.enabled|bool|`true`|Enable ingress record generation for Blockscout frontend|
|blockscout.frontend.ingress.hostname|string|`"explorer.k8s.orb.local"`|Default host for the ingress record|
|blockscout.frontend.ingress.tls|list|-|TLS configuration for the ingress|
|blockscout.frontend.livenessProbe|object|-|Configure Blockscout frontend containers' liveness probe|
|blockscout.frontend.livenessProbe.enabled|bool|`true`|Enable livenessProbe on Blockscout frontend containers|
|blockscout.frontend.livenessProbe.failureThreshold|int|`5`|Failure threshold for livenessProbe|
|blockscout.frontend.livenessProbe.initialDelaySeconds|int|`30`|Initial delay seconds for livenessProbe|
|blockscout.frontend.livenessProbe.periodSeconds|int|`10`|Period seconds for livenessProbe|
|blockscout.frontend.livenessProbe.successThreshold|int|`1`|Success threshold for livenessProbe|
|blockscout.frontend.livenessProbe.timeoutSeconds|int|`5`|Timeout seconds for livenessProbe|
|blockscout.frontend.nodeSelector|object|-|Node labels for pod assignment|
|blockscout.frontend.openShiftRoute|object|-|OpenShift Route parameters for Blockscout frontend|
|blockscout.frontend.openShiftRoute.alternateBackends|list|-|Additional backends for weighted routing|
|blockscout.frontend.openShiftRoute.annotations|object|-|Additional annotations for the OpenShift route resource|
|blockscout.frontend.openShiftRoute.enabled|bool|`false`|Enable OpenShift route creation for Blockscout frontend|
|blockscout.frontend.openShiftRoute.host|string|`"explorer.k8s.orb.local"`|Hostname exposed via the OpenShift route|
|blockscout.frontend.openShiftRoute.path|string|`"/"`|HTTP path exposed via the OpenShift route|
|blockscout.frontend.openShiftRoute.port|object|-|Service port configuration for the route target|
|blockscout.frontend.openShiftRoute.port.targetPort|string|`"http"`|Service target port name|
|blockscout.frontend.openShiftRoute.tls|object|-|TLS configuration for the OpenShift route|
|blockscout.frontend.openShiftRoute.to|object|-|Primary service weight configuration|
|blockscout.frontend.openShiftRoute.to.weight|int|`100`|Weight assigned to the Blockscout frontend service backend|
|blockscout.frontend.openShiftRoute.wildcardPolicy|string|`"None"`|Wildcard policy to apply to the route|
|blockscout.frontend.podAnnotations|object|-|Annotations for Blockscout frontend pods|
|blockscout.frontend.podSecurityContext|object|-|Pod Security Context configuration for Blockscout frontend|
|blockscout.frontend.podSecurityContext.fsGroup|int|`1001`|Group ID for filesystem ownership|
|blockscout.frontend.podSecurityContext.runAsGroup|int|`1001`|Group ID to run the entrypoint of the container process|
|blockscout.frontend.podSecurityContext.runAsNonRoot|bool|`true`|Indicates that the container must run as a non-root user|
|blockscout.frontend.podSecurityContext.runAsUser|int|`1001`|User ID to run the entrypoint of the container process|
|blockscout.frontend.readinessProbe|object|-|Configure Blockscout frontend containers' readiness probe|
|blockscout.frontend.readinessProbe.enabled|bool|`true`|Enable readinessProbe on Blockscout frontend containers|
|blockscout.frontend.readinessProbe.failureThreshold|int|`5`|Failure threshold for readinessProbe|
|blockscout.frontend.readinessProbe.initialDelaySeconds|int|`30`|Initial delay seconds for readinessProbe|
|blockscout.frontend.readinessProbe.periodSeconds|int|`5`|Period seconds for readinessProbe|
|blockscout.frontend.readinessProbe.successThreshold|int|`1`|Success threshold for readinessProbe|
|blockscout.frontend.readinessProbe.timeoutSeconds|int|`3`|Timeout seconds for readinessProbe|
|blockscout.frontend.replicaCount|int|`1`|Number of Blockscout frontend replicas to deploy|
|blockscout.frontend.resources|object|-|Blockscout frontend containers resource requests and limits|
|blockscout.frontend.service|object|-|Service parameters for Blockscout frontend|
|blockscout.frontend.service.port|int|`80`|Blockscout frontend service HTTP port|
|blockscout.frontend.service.type|string|`"ClusterIP"`|Blockscout frontend service type|
|blockscout.frontend.tolerations|list|-|Tolerations for pod assignment|
|blockscout.fullnameOverride|string|`"blockscout"`|String to fully override common.names.fullname|
|blockscout.imagePullSecrets|list|-|Global Docker registry secret names as an array|
|blockscout.postgresql|object|-|PostgreSQL connection overrides (merged with global.datastores.blockscout.postgresql)|
|blockscout.redirect|object|-|Blockscout redirect configuration|
|blockscout.redirect.enabled|bool|`false`|Enable Blockscout redirect deployment|
|blockscout.serviceAccount|object|-|Service account for Blockscout pods|
|blockscout.serviceAccount.annotations|object|-|Annotations for service account. Evaluated as a template. Only used if `create` is `true`.|
|blockscout.serviceAccount.create|bool|`true`|Specifies whether a ServiceAccount should be created|
|blockscout.serviceAccount.name|string|`""`|The name of the ServiceAccount to use|
|blockscout.stats|object|-|Blockscout stats configuration|
|blockscout.stats.enabled|bool|`false`|Enable Blockscout stats deployment|
|blockscout.stats.ingress|object|-|Ingress configuration for stats|
|blockscout.stats.ingress.hostname|string|`""`|Hostname for stats ingress|
|dapp.affinity|object|-|Affinity for pod assignment|
|dapp.annotations|object|-|Additional annotations for the deployment metadata|
|dapp.autoscaling|object|-|Autoscaling configuration (optional)|
|dapp.autoscaling.enabled|bool|`false`|Enable autoscaling|
|dapp.autoscaling.maxReplicas|int|`10`|Maximum number of replicas|
|dapp.autoscaling.minReplicas|int|`1`|Minimum number of replicas|
|dapp.autoscaling.targetCPUUtilizationPercentage|int|`80`|Target CPU utilization percentage for autoscaling|
|dapp.env|list|-|Environment variables defined directly in the deployment|
|dapp.extraInitContainers|list|-|Additional init containers appended verbatim to the deployment pod spec|
|dapp.fullnameOverride|string|`"dapp"`|String to fully override dapp.fullname template|
|dapp.image|object|-|dApp image configuration|
|dapp.image.pullPolicy|string|`"IfNotPresent"`|dApp image pull policy|
|dapp.image.repository|string|`"ghcr.io/settlemint/asset-tokenization-kit"`|dApp image repository|
|dapp.image.tag|string|`""`|dApp image tag (defaults to chart appVersion)|
|dapp.ingress|object|-|Ingress configuration|
|dapp.ingress.annotations|object|-|Additional annotations for the Ingress resource|
|dapp.ingress.className|string|`"atk-nginx"`|IngressClass that will be used to implement the Ingress|
|dapp.ingress.enabled|bool|`false`|Enable ingress controller resource|
|dapp.ingress.hosts|list|-|Ingress host configuration|
|dapp.ingress.hosts[0]|object|-|Ingress host entry|
|dapp.ingress.hosts[0].host|string|`"dapp.local"`|Hostname for the ingress (placeholder - should be configured in parent chart values)|
|dapp.ingress.hosts[0].paths|list|-|Path definitions for this host|
|dapp.ingress.hosts[0].paths[0]|object|-|Path entry|
|dapp.ingress.hosts[0].paths[0].path|string|`"/((?:sm_|bpaas-)[^/]+)?/?(.*)"`|URL path pattern matching original path structure|
|dapp.ingress.hosts[0].paths[0].pathType|string|`"ImplementationSpecific"`|Path type for Kubernetes ingress|
|dapp.ingress.tls|list|-|TLS configuration for the ingress|
|dapp.initContainer|object|-|Init container configuration|
|dapp.initContainer.graphQLCheck|object|-|Specific check for GraphQL endpoint readiness (e.g., The Graph subgraph)|
|dapp.initContainer.graphQLCheck.enabled|bool|`true`|Enable GraphQL endpoint readiness check|
|dapp.initContainer.graphQLCheck.image|object|-|Container image configuration for GraphQL check|
|dapp.initContainer.graphQLCheck.image.pullPolicy|string|`"IfNotPresent"`|Image pull policy|
|dapp.initContainer.graphQLCheck.image.registry|string|`"docker.io"`|Container registry|
|dapp.initContainer.graphQLCheck.image.repository|string|`"curlimages/curl"`|Image repository for curl utility|
|dapp.initContainer.graphQLCheck.image.tag|string|`"8.16.0"`|Image tag|
|dapp.initContainer.graphQLCheck.name|string|`"wait-for-graphql"`|Name of the init container|
|dapp.initContainer.graphQLCheck.query|string|`"{ _meta { hasIndexingErrors block { number } } }"`|GraphQL query to check sync status|
|dapp.initContainer.graphQLCheck.resources|object|-|Resource limits and requests for GraphQL check init container|
|dapp.initContainer.graphQLCheck.resources.limits|object|-|Resource limits|
|dapp.initContainer.graphQLCheck.resources.limits.memory|string|`"64Mi"`|Memory limit|
|dapp.initContainer.graphQLCheck.resources.requests|object|-|Resource requests|
|dapp.initContainer.graphQLCheck.resources.requests.cpu|string|`"10m"`|CPU request|
|dapp.initContainer.graphQLCheck.resources.requests.memory|string|`"12Mi"`|Memory request|
|dapp.initContainer.graphQLCheck.retries|int|`10`|Number of retry attempts|
|dapp.initContainer.graphQLCheck.retryDelaySeconds|int|`10`|Delay in seconds between retry attempts|
|dapp.initContainer.graphQLCheck.url|string|`"http://graph-node-combined:8000/subgraphs/name/kit"`|GraphQL endpoint URL to check (wait for subgraph to finish syncing with extended timeout)|
|dapp.initContainer.tcpCheck|object|-|Generic TCP check settings for service availability|
|dapp.initContainer.tcpCheck.dependencies|list|-|Service dependencies to check for availability (service-name:port)|
|dapp.initContainer.tcpCheck.dependencies[0]|object|-|PostgreSQL database dependency|
|dapp.initContainer.tcpCheck.dependencies[0].endpoint|string|`"{{ include \"atk.postgresql.endpoint\" (dict \"context\" $) }}"`|Service endpoint (templated)|
|dapp.initContainer.tcpCheck.dependencies[0].name|string|`"postgres"`|Dependency name|
|dapp.initContainer.tcpCheck.dependencies[1]|object|-|Hasura GraphQL Engine dependency|
|dapp.initContainer.tcpCheck.dependencies[1].endpoint|string|`"hasura:8080"`|Service endpoint|
|dapp.initContainer.tcpCheck.dependencies[1].name|string|`"hasura"`|Dependency name|
|dapp.initContainer.tcpCheck.dependencies[2]|object|-|Portal API dependency|
|dapp.initContainer.tcpCheck.dependencies[2].endpoint|string|`"portal:3001"`|Service endpoint|
|dapp.initContainer.tcpCheck.dependencies[2].name|string|`"portal"`|Dependency name|
|dapp.initContainer.tcpCheck.dependencies[3]|object|-|The Graph node dependency|
|dapp.initContainer.tcpCheck.dependencies[3].endpoint|string|`"graph-node-combined:8020"`|Service endpoint|
|dapp.initContainer.tcpCheck.dependencies[3].name|string|`"graph-node"`|Dependency name|
|dapp.initContainer.tcpCheck.dependencies[4]|object|-|Blockscout block explorer dependency|
|dapp.initContainer.tcpCheck.dependencies[4].endpoint|string|`"blockscout-blockscout:80"`|Service endpoint|
|dapp.initContainer.tcpCheck.dependencies[4].name|string|`"blockscout"`|Dependency name|
|dapp.initContainer.tcpCheck.enabled|bool|`true`|Enable TCP availability checks|
|dapp.initContainer.tcpCheck.image|object|-|Container image configuration for TCP check init container|
|dapp.initContainer.tcpCheck.image.pullPolicy|string|`"IfNotPresent"`|Image pull policy|
|dapp.initContainer.tcpCheck.image.repository|string|`"ghcr.io/settlemint/btp-waitforit"`|Image repository for wait-for-it utility|
|dapp.initContainer.tcpCheck.image.tag|string|`"v7.7.10"`|Image tag for wait-for-it utility|
|dapp.initContainer.tcpCheck.resources|object|-|Resource limits and requests for TCP check init container|
|dapp.initContainer.tcpCheck.resources.limits|object|-|Resource limits|
|dapp.initContainer.tcpCheck.resources.limits.cpu|string|`"100m"`|CPU limit|
|dapp.initContainer.tcpCheck.resources.limits.memory|string|`"64Mi"`|Memory limit|
|dapp.initContainer.tcpCheck.resources.requests|object|-|Resource requests|
|dapp.initContainer.tcpCheck.resources.requests.cpu|string|`"50m"`|CPU request|
|dapp.initContainer.tcpCheck.resources.requests.memory|string|`"32Mi"`|Memory request|
|dapp.initContainer.tcpCheck.timeout|int|`120`|Timeout in seconds for all TCP checks to complete|
|dapp.nameOverride|string|`"dapp"`|String to partially override dapp.fullname template|
|dapp.networkPolicy|object|-|NetworkPolicy configuration|
|dapp.networkPolicy.egress|list|-|Egress rules for the network policy|
|dapp.networkPolicy.egress[0]|object|-|Allow DNS resolution|
|dapp.networkPolicy.egress[0].ports|list|-|Port definitions for DNS traffic|
|dapp.networkPolicy.egress[0].ports[0]|object|-|UDP port configuration for DNS|
|dapp.networkPolicy.egress[0].ports[0].port|int|`53`|DNS port number|
|dapp.networkPolicy.egress[0].ports[0].protocol|string|`"UDP"`|Protocol type|
|dapp.networkPolicy.egress[0].to|list|-|Destination selectors for DNS traffic|
|dapp.networkPolicy.egress[0].to[0]|object|-|Namespace and pod selector for kube-dns|
|dapp.networkPolicy.egress[0].to[0].namespaceSelector|object|-|Match all namespaces|
|dapp.networkPolicy.egress[0].to[0].podSelector|object|-|Pod selector for kube-dns|
|dapp.networkPolicy.egress[0].to[0].podSelector.matchLabels|object|-|Label matcher for kube-dns pods|
|dapp.networkPolicy.egress[0].to[0].podSelector.matchLabels.k8s-app|string|`"kube-dns"`|Kubernetes app label for DNS service|
|dapp.networkPolicy.egress[1]|object|-|Allow access to PostgreSQL database|
|dapp.networkPolicy.egress[1].ports|list|-|Port definitions for PostgreSQL traffic|
|dapp.networkPolicy.egress[1].ports[0]|object|-|TCP port configuration for PostgreSQL|
|dapp.networkPolicy.egress[1].ports[0].port|int|`5432`|PostgreSQL port number|
|dapp.networkPolicy.egress[1].ports[0].protocol|string|`"TCP"`|Protocol type|
|dapp.networkPolicy.egress[1].to|list|-|Destination selectors for PostgreSQL traffic|
|dapp.networkPolicy.egress[1].to[0]|object|-|Pod selector for PostgreSQL|
|dapp.networkPolicy.egress[1].to[0].podSelector|object|-|Pod selector configuration|
|dapp.networkPolicy.egress[1].to[0].podSelector.matchLabels|object|-|Label matcher for PostgreSQL pods|
|dapp.networkPolicy.egress[1].to[0].podSelector.matchLabels."app.kubernetes.io/name"|string|`"postgresql-ha"`|Application name for PostgreSQL HA deployment|
|dapp.networkPolicy.egress[2]|object|-|Allow access to Hasura GraphQL Engine|
|dapp.networkPolicy.egress[2].ports|list|-|Port definitions for Hasura traffic|
|dapp.networkPolicy.egress[2].ports[0]|object|-|TCP port configuration for Hasura|
|dapp.networkPolicy.egress[2].ports[0].port|int|`8080`|Hasura GraphQL Engine port number|
|dapp.networkPolicy.egress[2].ports[0].protocol|string|`"TCP"`|Protocol type|
|dapp.networkPolicy.egress[2].to|list|-|Destination selectors for Hasura traffic|
|dapp.networkPolicy.egress[2].to[0]|object|-|Pod selector for Hasura|
|dapp.networkPolicy.egress[2].to[0].podSelector|object|-|Pod selector configuration|
|dapp.networkPolicy.egress[2].to[0].podSelector.matchLabels|object|-|Label matcher for Hasura pods|
|dapp.networkPolicy.egress[2].to[0].podSelector.matchLabels."app.kubernetes.io/name"|string|`"graphql-engine"`|Application name for Hasura GraphQL Engine|
|dapp.networkPolicy.egress[3]|object|-|Allow access to Portal API|
|dapp.networkPolicy.egress[3].ports|list|-|Port definitions for Portal traffic|
|dapp.networkPolicy.egress[3].ports[0]|object|-|TCP port configuration for Portal HTTP API|
|dapp.networkPolicy.egress[3].ports[0].port|int|`3000`|Portal HTTP API port number|
|dapp.networkPolicy.egress[3].ports[0].protocol|string|`"TCP"`|Protocol type|
|dapp.networkPolicy.egress[3].ports[1]|object|-|TCP port configuration for Portal GraphQL API|
|dapp.networkPolicy.egress[3].ports[1].port|int|`3001`|Portal GraphQL API port number|
|dapp.networkPolicy.egress[3].ports[1].protocol|string|`"TCP"`|Protocol type|
|dapp.networkPolicy.egress[3].to|list|-|Destination selectors for Portal traffic|
|dapp.networkPolicy.egress[3].to[0]|object|-|Pod selector for Portal|
|dapp.networkPolicy.egress[3].to[0].podSelector|object|-|Pod selector configuration|
|dapp.networkPolicy.egress[3].to[0].podSelector.matchLabels|object|-|Label matcher for Portal pods|
|dapp.networkPolicy.egress[3].to[0].podSelector.matchLabels."app.kubernetes.io/name"|string|`"portal"`|Application name for Portal service|
|dapp.networkPolicy.egress[4]|object|-|Allow access to ERPC (Ethereum RPC proxy)|
|dapp.networkPolicy.egress[4].ports|list|-|Port definitions for ERPC traffic|
|dapp.networkPolicy.egress[4].ports[0]|object|-|TCP port configuration for ERPC|
|dapp.networkPolicy.egress[4].ports[0].port|int|`4000`|ERPC port number|
|dapp.networkPolicy.egress[4].ports[0].protocol|string|`"TCP"`|Protocol type|
|dapp.networkPolicy.egress[4].to|list|-|Destination selectors for ERPC traffic|
|dapp.networkPolicy.egress[4].to[0]|object|-|Pod selector for ERPC|
|dapp.networkPolicy.egress[4].to[0].podSelector|object|-|Pod selector configuration|
|dapp.networkPolicy.egress[4].to[0].podSelector.matchLabels|object|-|Label matcher for ERPC pods|
|dapp.networkPolicy.egress[4].to[0].podSelector.matchLabels."app.kubernetes.io/name"|string|`"erpc"`|Application name for ERPC service|
|dapp.networkPolicy.egress[5]|object|-|Allow external HTTPS traffic for external APIs|
|dapp.networkPolicy.egress[5].ports|list|-|Port definitions for HTTPS traffic|
|dapp.networkPolicy.egress[5].ports[0]|object|-|TCP port configuration for HTTPS|
|dapp.networkPolicy.egress[5].ports[0].port|int|`443`|HTTPS port number|
|dapp.networkPolicy.egress[5].ports[0].protocol|string|`"TCP"`|Protocol type|
|dapp.networkPolicy.egress[5].to|list|-|Destination selectors for external HTTPS traffic|
|dapp.networkPolicy.egress[5].to[0]|object|-|Match all namespaces for external access|
|dapp.networkPolicy.egress[5].to[0].namespaceSelector|object|-|Namespace selector (empty = all namespaces)|
|dapp.networkPolicy.enabled|bool|`false`|Enable network policy|
|dapp.networkPolicy.ingress|list|-|Ingress rules for the network policy|
|dapp.networkPolicy.ingress[0]|object|-|Allow traffic from ingress controller|
|dapp.networkPolicy.ingress[0].from|list|-|Source selectors for ingress traffic|
|dapp.networkPolicy.ingress[0].from[0]|object|-|Namespace selector for ingress-nginx|
|dapp.networkPolicy.ingress[0].from[0].namespaceSelector|object|-|Match labels for namespace selection|
|dapp.networkPolicy.ingress[0].from[0].namespaceSelector.matchLabels|object|-|Label matcher for namespace|
|dapp.networkPolicy.ingress[0].from[0].namespaceSelector.matchLabels."kubernetes.io/metadata.name"|string|`"ingress-nginx"`|Namespace name label for ingress-nginx|
|dapp.networkPolicy.ingress[0].ports|list|-|Port definitions for ingress traffic|
|dapp.networkPolicy.ingress[0].ports[0]|object|-|TCP port configuration|
|dapp.networkPolicy.ingress[0].ports[0].port|int|`3000`|Port number|
|dapp.networkPolicy.ingress[0].ports[0].protocol|string|`"TCP"`|Protocol type|
|dapp.networkPolicy.ingress[1]|object|-|Allow traffic from same namespace|
|dapp.networkPolicy.ingress[1].from|list|-|Source selectors for same-namespace traffic|
|dapp.networkPolicy.ingress[1].from[0]|object|-|Pod selector (empty = all pods in namespace)|
|dapp.networkPolicy.ingress[1].ports|list|-|Port definitions for same-namespace traffic|
|dapp.networkPolicy.ingress[1].ports[0]|object|-|TCP port configuration|
|dapp.networkPolicy.ingress[1].ports[0].port|int|`3000`|Port number|
|dapp.networkPolicy.ingress[1].ports[0].protocol|string|`"TCP"`|Protocol type|
|dapp.nodeSelector|object|-|Node selector for pod assignment|
|dapp.openShiftRoute|object|-|OpenShift Route configuration|
|dapp.openShiftRoute.alternateBackends|list|-|Additional backends for weighted routing|
|dapp.openShiftRoute.annotations|object|-|Additional annotations for the OpenShift route resource|
|dapp.openShiftRoute.enabled|bool|`false`|Enable OpenShift route creation for DApp|
|dapp.openShiftRoute.host|string|`"dapp.k8s.orb.local"`|Hostname exposed via the OpenShift route|
|dapp.openShiftRoute.path|string|`"/"`|HTTP path exposed via the OpenShift route|
|dapp.openShiftRoute.port|object|-|Service port configuration for the route target|
|dapp.openShiftRoute.port.targetPort|string|`"http"`|Service target port name (must exist on the DApp service)|
|dapp.openShiftRoute.tls|object|-|TLS configuration for the route (optional). Set to null for no TLS (HTTP only), or specify configuration for TLS termination|
|dapp.openShiftRoute.to|object|-|Primary service weight configuration|
|dapp.openShiftRoute.to.weight|int|`100`|Weight assigned to the DApp service backend|
|dapp.openShiftRoute.wildcardPolicy|string|`"None"`|Wildcard policy to apply to the route|
|dapp.podAnnotations|object|-|Annotations for dApp pods|
|dapp.podAnnotations."prometheus.io/scrape"|string|`"false"`|Disable Prometheus scraping by default; override to "true" to expose metrics|
|dapp.podDisruptionBudget|object|-|PodDisruptionBudget configuration|
|dapp.podDisruptionBudget.enabled|bool|`false`|Enable pod disruption budget|
|dapp.podDisruptionBudget.minAvailable|string|`1`|Minimum number of pods that must be available during disruption. Can be an integer or percentage (e.g., "50%")|
|dapp.podLabels|object|-|Additional labels for the deployment pod metadata|
|dapp.podLabels."app.kubernetes.io/component"|string|`"dapp"`|Kubernetes application component label|
|dapp.podLabels."kots.io/app-slug"|string|`"settlemint-atk"`|KOTS application slug identifier|
|dapp.podSecurityContext|object|-|Pod security context configuration|
|dapp.probes|object|-|Liveness and Readiness probes configuration|
|dapp.probes.liveness|object|-|Liveness probe configuration|
|dapp.probes.liveness.failureThreshold|int|`10`|Number of consecutive failures needed to consider the container unhealthy|
|dapp.probes.liveness.httpGet|object|-|HTTP GET probe configuration|
|dapp.probes.liveness.httpGet.path|string|`"/"`|HTTP path to probe|
|dapp.probes.liveness.httpGet.port|string|`"http"`|Port name to probe|
|dapp.probes.liveness.httpGet.scheme|string|`"HTTP"`|HTTP or HTTPS scheme|
|dapp.probes.liveness.initialDelaySeconds|int|`10`|Number of seconds after the container has started before liveness probes are initiated|
|dapp.probes.liveness.periodSeconds|int|`15`|How often (in seconds) to perform the probe|
|dapp.probes.liveness.successThreshold|int|`1`|Minimum consecutive successes for the probe to be considered successful after having failed|
|dapp.probes.liveness.timeoutSeconds|int|`3`|Number of seconds after which the probe times out|
|dapp.probes.readiness|object|-|Readiness probe configuration|
|dapp.probes.readiness.failureThreshold|int|`10`|Number of consecutive failures needed to consider the container not ready|
|dapp.probes.readiness.httpGet|object|-|HTTP GET probe configuration|
|dapp.probes.readiness.httpGet.path|string|`"/"`|HTTP path to probe|
|dapp.probes.readiness.httpGet.port|string|`"http"`|Port name to probe|
|dapp.probes.readiness.httpGet.scheme|string|`"HTTP"`|HTTP or HTTPS scheme|
|dapp.probes.readiness.initialDelaySeconds|int|`5`|Number of seconds after the container has started before readiness probes are initiated|
|dapp.probes.readiness.periodSeconds|int|`10`|How often (in seconds) to perform the probe|
|dapp.probes.readiness.successThreshold|int|`1`|Minimum consecutive successes for the probe to be considered successful after having failed|
|dapp.probes.readiness.timeoutSeconds|int|`3`|Number of seconds after which the probe times out|
|dapp.replicaCount|int|`1`|Number of dApp replicas to deploy|
|dapp.resources|object|-|Resource requests and limits for the dApp container|
|dapp.secretEnv|object|-|Environment variables sourced from a secret. These will be created in the secret.yaml template|
|dapp.secretEnv.BETTER_AUTH_URL|string|`"https://dapp.local"`|Better Auth authentication URL|
|dapp.secretEnv.NEXTAUTH_URL|string|`"https://dapp.local"`|NextAuth.js authentication URL|
|dapp.secretEnv.NEXT_PUBLIC_APP_ID|string|`"dapp"`|Next.js public application identifier|
|dapp.secretEnv.OTEL_EXPORTER_OTLP_ENDPOINT|string|`"http://alloy:4318/v1/traces"`|OpenTelemetry OTLP exporter endpoint for traces|
|dapp.secretEnv.OTEL_EXPORTER_OTLP_PROTOCOL|string|`"http"`|OpenTelemetry OTLP protocol|
|dapp.secretEnv.SETTLEMINT_BLOCKCHAIN_NODE_JSON_RPC_ENDPOINT|string|`"http://txsigner:3000"`|Blockchain node JSON-RPC endpoint via transaction signer|
|dapp.secretEnv.SETTLEMINT_BLOCKSCOUT_UI_ENDPOINT|string|`"http://blockscout-frontend-svc/"`|Blockscout block explorer UI endpoint|
|dapp.secretEnv.SETTLEMINT_HASURA_ADMIN_SECRET|string|`"atk"`|Hasura GraphQL Engine admin secret for authentication|
|dapp.secretEnv.SETTLEMINT_HASURA_DATABASE_URL|string|`"{{ include \"atk.datastores.postgresql.url\" (dict \"context\" $ \"chartKey\" \"hasura\") }}"`|Hasura PostgreSQL database connection URL (templated)|
|dapp.secretEnv.SETTLEMINT_HASURA_ENDPOINT|string|`"http://hasura:8080/v1/graphql"`|Hasura GraphQL Engine endpoint|
|dapp.secretEnv.SETTLEMINT_HD_PRIVATE_KEY|string|`"atk-hd-private-key"`|Hierarchical Deterministic (HD) wallet private key identifier|
|dapp.secretEnv.SETTLEMINT_INSTANCE|string|`"standalone"`|SettleMint instance type (standalone or cloud)|
|dapp.secretEnv.SETTLEMINT_PORTAL_GRAPHQL_ENDPOINT|string|`"http://portal:3001/graphql"`|SettleMint Portal GraphQL API endpoint|
|dapp.secretEnv.SETTLEMINT_THEGRAPH_SUBGRAPHS_ENDPOINTS|string|`"[\"http://graph-node-combined:8000/subgraphs/name/kit\"]"`|The Graph Protocol subgraph endpoints (JSON array)|
|dapp.securityContext|object|-|Container security context configuration|
|dapp.service|object|-|Service configuration|
|dapp.service.annotations|object|-|Service annotations|
|dapp.service.port|int|`3000`|Service port|
|dapp.service.type|string|`"ClusterIP"`|Service type|
|dapp.serviceAccount|object|-|Service account configuration|
|dapp.serviceAccount.annotations|object|-|Annotations to add to the service account|
|dapp.serviceAccount.create|bool|`false`|Specifies whether a service account should be created|
|dapp.serviceAccount.name|string|`""`|The name of the service account to use. If not set and create is true, a name is generated using the fullname template|
|dapp.tolerations|list|-|Tolerations for pod assignment|
|dapp.volumeMounts|list|-|Additional volume mounts for the main container|
|dapp.volumes|list|-|Additional volumes for the deployment|
|erpc.affinity|object|-|Affinity for pod assignment|
|erpc.autoscaling|object|-|Autoscaling configuration for eRPC|
|erpc.autoscaling.builtInMetrics|list|-|Built-in metrics configuration|
|erpc.autoscaling.builtInMetrics[0]|object|-|CPU utilization metric configuration|
|erpc.autoscaling.builtInMetrics[0].resource|object|-|Resource metric configuration|
|erpc.autoscaling.builtInMetrics[0].resource.name|string|`"cpu"`|Resource name to monitor|
|erpc.autoscaling.builtInMetrics[0].resource.target|object|-|Target metric configuration|
|erpc.autoscaling.builtInMetrics[0].resource.target.averageUtilization|int|`80`|Target average CPU utilization percentage|
|erpc.autoscaling.builtInMetrics[0].resource.target.type|string|`"Utilization"`|Target type (Utilization, Value, AverageValue)|
|erpc.autoscaling.builtInMetrics[0].type|string|`"Resource"`|Metric type (Resource, Pods, Object, External)|
|erpc.autoscaling.builtInMetrics[1]|object|-|Memory utilization metric configuration|
|erpc.autoscaling.builtInMetrics[1].resource|object|-|Resource metric configuration|
|erpc.autoscaling.builtInMetrics[1].resource.name|string|`"memory"`|Resource name to monitor|
|erpc.autoscaling.builtInMetrics[1].resource.target|object|-|Target metric configuration|
|erpc.autoscaling.builtInMetrics[1].resource.target.averageUtilization|int|`80`|Target average memory utilization percentage|
|erpc.autoscaling.builtInMetrics[1].resource.target.type|string|`"Utilization"`|Target type (Utilization, Value, AverageValue)|
|erpc.autoscaling.builtInMetrics[1].type|string|`"Resource"`|Metric type (Resource, Pods, Object, External)|
|erpc.autoscaling.customMetrics|list|-|Custom metrics configuration|
|erpc.autoscaling.enabled|bool|`false`|Enable autoscaling for eRPC|
|erpc.autoscaling.maxReplicas|int|`3`|Maximum number of eRPC replicas|
|erpc.autoscaling.minReplicas|int|`1`|Minimum number of eRPC replicas|
|erpc.commonAnnotations|object|-|Annotations to add to all deployed objects|
|erpc.commonLabels|object|-|Labels to add to all deployed objects|
|erpc.config|object|-|eRPC configuration|
|erpc.config.database|object|-|Database configuration for caching and shared state|
|erpc.config.database.evmJsonRpcCache|object|-|EVM JSON-RPC response caching configuration|
|erpc.config.database.evmJsonRpcCache.compression|object|-|Compression configuration for cached data|
|erpc.config.database.evmJsonRpcCache.compression.algorithm|string|`"zstd"`|Compression algorithm to use (zstd, gzip, lz4)|
|erpc.config.database.evmJsonRpcCache.compression.enabled|bool|`true`|Enable compression for cached responses|
|erpc.config.database.evmJsonRpcCache.compression.threshold|int|`1024`|Minimum response size in bytes before applying compression|
|erpc.config.database.evmJsonRpcCache.compression.zstdLevel|string|`"default"`|Compression level for zstd (fastest, default, better, best)|
|erpc.config.database.evmJsonRpcCache.connectors|list|-|Cache connector configurations|
|erpc.config.database.evmJsonRpcCache.connectors[0]|object|-|Redis cache connector|
|erpc.config.database.evmJsonRpcCache.connectors[0].driver|string|`"redis"`|Database driver type|
|erpc.config.database.evmJsonRpcCache.connectors[0].id|string|`"redis-cache"`|Unique identifier for this connector|
|erpc.config.database.evmJsonRpcCache.connectors[0].redis|object|-|Redis-specific configuration|
|erpc.config.database.evmJsonRpcCache.connectors[0].redis.uri|string|`"{{ include \"erpc.redis.uriFor\" (dict \"context\" $ \"dbKey\" \"cacheDb\" \"queryKey\" \"cacheQuery\") }}"`|Redis connection URI (template rendered)|
|erpc.config.database.evmJsonRpcCache.policies|list|-|Cache policies defining what to cache and for how long|
|erpc.config.database.evmJsonRpcCache.policies[0]|object|-|Cache policy for finalized blocks|
|erpc.config.database.evmJsonRpcCache.policies[0].connector|string|`"redis-cache"`|Connector ID to use for this policy|
|erpc.config.database.evmJsonRpcCache.policies[0].finality|string|`"finalized"`|Block finality state to match|
|erpc.config.database.evmJsonRpcCache.policies[0].method|string|`"*"`|RPC method pattern to match (supports wildcards)|
|erpc.config.database.evmJsonRpcCache.policies[0].network|string|`"*"`|Network pattern to match (supports wildcards)|
|erpc.config.database.evmJsonRpcCache.policies[0].ttl|int|`0`|Time-to-live in seconds (0 = infinite)|
|erpc.config.database.evmJsonRpcCache.policies[1]|object|-|Cache policy for unfinalized blocks|
|erpc.config.database.evmJsonRpcCache.policies[1].connector|string|`"redis-cache"`|Connector ID to use for this policy|
|erpc.config.database.evmJsonRpcCache.policies[1].finality|string|`"unfinalized"`|Block finality state to match|
|erpc.config.database.evmJsonRpcCache.policies[1].method|string|`"*"`|RPC method pattern to match (supports wildcards)|
|erpc.config.database.evmJsonRpcCache.policies[1].network|string|`"*"`|Network pattern to match (supports wildcards)|
|erpc.config.database.evmJsonRpcCache.policies[1].ttl|string|`"5s"`|Time-to-live duration|
|erpc.config.database.evmJsonRpcCache.policies[2]|object|-|Cache policy for realtime blocks|
|erpc.config.database.evmJsonRpcCache.policies[2].connector|string|`"redis-cache"`|Connector ID to use for this policy|
|erpc.config.database.evmJsonRpcCache.policies[2].finality|string|`"realtime"`|Block finality state to match|
|erpc.config.database.evmJsonRpcCache.policies[2].method|string|`"*"`|RPC method pattern to match (supports wildcards)|
|erpc.config.database.evmJsonRpcCache.policies[2].network|string|`"*"`|Network pattern to match (supports wildcards)|
|erpc.config.database.evmJsonRpcCache.policies[2].ttl|string|`"5s"`|Time-to-live duration|
|erpc.config.database.sharedState|object|-|Shared state configuration for distributed coordination|
|erpc.config.database.sharedState.clusterKey|string|`"atk-erpc-shared"`|Unique key prefix for this cluster's shared state|
|erpc.config.database.sharedState.connector|object|-|Connector configuration for shared state storage|
|erpc.config.database.sharedState.connector.driver|string|`"redis"`|Database driver type|
|erpc.config.database.sharedState.connector.redis|object|-|Redis-specific configuration|
|erpc.config.database.sharedState.connector.redis.uri|string|`"{{ include \"erpc.redis.uriFor\" (dict \"context\" $ \"dbKey\" \"sharedStateDb\" \"queryKey\" \"sharedStateQuery\") }}"`|Redis connection URI (template rendered)|
|erpc.config.database.sharedState.fallbackTimeout|string|`"5s"`|Timeout for fallback when shared state is unavailable|
|erpc.config.database.sharedState.lockTtl|string|`"30s"`|Time-to-live for distributed locks|
|erpc.config.logLevel|string|`"info"`|Log level for eRPC (debug, info, warn, error)|
|erpc.config.metrics|object|-|Prometheus metrics endpoint configuration|
|erpc.config.metrics.enabled|bool|`true`|Enable metrics endpoint|
|erpc.config.metrics.hostV4|string|`"0.0.0.0"`|IPv4 address to bind metrics server to|
|erpc.config.metrics.port|int|`4001`|Metrics server port|
|erpc.config.projects|list|-|Array of project configurations (will be overridden by parent chart). Chain IDs default from .Values.global.chainId when omitted (see configmap template).|
|erpc.config.projects[0]|object|-|Project configuration entry|
|erpc.config.projects[0].id|string|`"settlemint"`|Unique project identifier|
|erpc.config.projects[0].networks|list|-|Network configurations for this project|
|erpc.config.projects[0].networks[0]|object|-|Network configuration entry|
|erpc.config.projects[0].networks[0].architecture|string|`"evm"`|Blockchain architecture type (evm, substrate, etc.)|
|erpc.config.projects[0].networks[0].directiveDefaults|object|-|Default directives applied to all requests|
|erpc.config.projects[0].networks[0].directiveDefaults.retryEmpty|bool|`true`|Retry requests that return empty results|
|erpc.config.projects[0].networks[0].evm|object|-|EVM-specific configuration|
|erpc.config.projects[0].networks[0].evm.integrity|object|-|Data integrity enforcement rules|
|erpc.config.projects[0].networks[0].evm.integrity.enforceGetLogsBlockRange|bool|`true`|Enforce valid block range for eth_getLogs queries|
|erpc.config.projects[0].networks[0].evm.integrity.enforceHighestBlock|bool|`true`|Enforce consistent highest block number across upstreams|
|erpc.config.projects[0].networks[0].failsafe|list|-|Failsafe policies for request handling|
|erpc.config.projects[0].networks[0].failsafe[0]|object|-|Failsafe policy for eth_getLogs method|
|erpc.config.projects[0].networks[0].failsafe[0].hedge|object|-|Hedge configuration for parallel requests|
|erpc.config.projects[0].networks[0].failsafe[0].hedge.maxCount|int|`1`|Maximum number of concurrent hedge requests|
|erpc.config.projects[0].networks[0].failsafe[0].hedge.maxDelay|string|`"4s"`|Maximum delay before sending hedge request|
|erpc.config.projects[0].networks[0].failsafe[0].hedge.minDelay|string|`"200ms"`|Minimum delay before sending hedge request|
|erpc.config.projects[0].networks[0].failsafe[0].hedge.quantile|float|`0.9`|Latency quantile threshold for hedging (0.0-1.0)|
|erpc.config.projects[0].networks[0].failsafe[0].matchMethod|string|`"eth_getLogs"`|RPC method pattern to match (supports wildcards)|
|erpc.config.projects[0].networks[0].failsafe[0].retry|object|-|Retry configuration for failed requests|
|erpc.config.projects[0].networks[0].failsafe[0].retry.backoffFactor|int|`2`|Multiplicative factor for exponential backoff|
|erpc.config.projects[0].networks[0].failsafe[0].retry.backoffMaxDelay|string|`"10s"`|Maximum delay between retries|
|erpc.config.projects[0].networks[0].failsafe[0].retry.delay|string|`"500ms"`|Initial delay before first retry|
|erpc.config.projects[0].networks[0].failsafe[0].retry.jitter|string|`"300ms"`|Random jitter added to retry delay|
|erpc.config.projects[0].networks[0].failsafe[0].retry.maxAttempts|int|`3`|Maximum number of retry attempts|
|erpc.config.projects[0].networks[0].failsafe[0].timeout|object|-|Timeout configuration for this method|
|erpc.config.projects[0].networks[0].failsafe[0].timeout.duration|string|`"45s"`|Maximum duration for request completion|
|erpc.config.projects[0].networks[0].failsafe[1]|object|-|Failsafe policy for trace/debug methods|
|erpc.config.projects[0].networks[0].failsafe[1].matchMethod|string|`"trace_*|debug_*|arbtrace_*"`|RPC method pattern for trace, debug, and arbtrace methods|
|erpc.config.projects[0].networks[0].failsafe[1].retry|object|-|Retry configuration for trace/debug methods|
|erpc.config.projects[0].networks[0].failsafe[1].retry.maxAttempts|int|`1`|Maximum retry attempts for trace/debug (limited to 1)|
|erpc.config.projects[0].networks[0].failsafe[1].timeout|object|-|Timeout configuration for trace/debug methods|
|erpc.config.projects[0].networks[0].failsafe[1].timeout.duration|string|`"90s"`|Maximum duration for trace/debug requests|
|erpc.config.projects[0].networks[0].failsafe[2]|object|-|Failsafe policy for block and transaction queries|
|erpc.config.projects[0].networks[0].failsafe[2].matchMethod|string|`"eth_getBlock*|eth_getTransaction*"`|RPC method pattern for getBlock and getTransaction methods|
|erpc.config.projects[0].networks[0].failsafe[2].retry|object|-|Retry configuration for block/transaction queries|
|erpc.config.projects[0].networks[0].failsafe[2].retry.backoffFactor|float|`1.5`|Multiplicative factor for exponential backoff|
|erpc.config.projects[0].networks[0].failsafe[2].retry.backoffMaxDelay|string|`"3s"`|Maximum delay between retries|
|erpc.config.projects[0].networks[0].failsafe[2].retry.delay|string|`"200ms"`|Initial delay before first retry|
|erpc.config.projects[0].networks[0].failsafe[2].retry.jitter|string|`"150ms"`|Random jitter added to retry delay|
|erpc.config.projects[0].networks[0].failsafe[2].retry.maxAttempts|int|`2`|Maximum retry attempts for block/transaction queries|
|erpc.config.projects[0].networks[0].failsafe[2].timeout|object|-|Timeout configuration for block/transaction queries|
|erpc.config.projects[0].networks[0].failsafe[2].timeout.duration|string|`"6s"`|Maximum duration for block/transaction queries|
|erpc.config.projects[0].networks[0].failsafe[3]|object|-|Failsafe policy for unfinalized/realtime requests|
|erpc.config.projects[0].networks[0].failsafe[3].hedge|object|-|Hedge configuration for unfinalized requests|
|erpc.config.projects[0].networks[0].failsafe[3].hedge.delay|string|`"250ms"`|Delay before sending hedge request|
|erpc.config.projects[0].networks[0].failsafe[3].hedge.maxCount|int|`1`|Maximum number of concurrent hedge requests|
|erpc.config.projects[0].networks[0].failsafe[3].matchFinality|list|-|Block finality states to match|
|erpc.config.projects[0].networks[0].failsafe[3].matchFinality[0]|string|`"unfinalized"`|Match unfinalized blocks|
|erpc.config.projects[0].networks[0].failsafe[3].matchFinality[1]|string|`"realtime"`|Match realtime blocks|
|erpc.config.projects[0].networks[0].failsafe[3].matchMethod|string|`"*"`|RPC method pattern matching all methods|
|erpc.config.projects[0].networks[0].failsafe[3].retry|object|-|Retry configuration for unfinalized requests|
|erpc.config.projects[0].networks[0].failsafe[3].retry.delay|string|`"150ms"`|Initial delay before first retry|
|erpc.config.projects[0].networks[0].failsafe[3].retry.jitter|string|`"150ms"`|Random jitter added to retry delay|
|erpc.config.projects[0].networks[0].failsafe[3].retry.maxAttempts|int|`2`|Maximum retry attempts for unfinalized requests|
|erpc.config.projects[0].networks[0].failsafe[3].timeout|object|-|Timeout configuration for unfinalized requests|
|erpc.config.projects[0].networks[0].failsafe[3].timeout.duration|string|`"4s"`|Maximum duration for unfinalized requests|
|erpc.config.projects[0].networks[0].failsafe[4]|object|-|Failsafe policy for finalized block requests|
|erpc.config.projects[0].networks[0].failsafe[4].matchFinality|list|-|Block finality states to match (finalized only)|
|erpc.config.projects[0].networks[0].failsafe[4].matchFinality[0]|string|`"finalized"`|Match finalized blocks|
|erpc.config.projects[0].networks[0].failsafe[4].matchMethod|string|`"*"`|RPC method pattern matching all methods|
|erpc.config.projects[0].networks[0].failsafe[4].retry|object|-|Retry configuration for finalized requests|
|erpc.config.projects[0].networks[0].failsafe[4].retry.backoffFactor|float|`1.8`|Multiplicative factor for exponential backoff|
|erpc.config.projects[0].networks[0].failsafe[4].retry.backoffMaxDelay|string|`"8s"`|Maximum delay between retries|
|erpc.config.projects[0].networks[0].failsafe[4].retry.delay|string|`"400ms"`|Initial delay before first retry|
|erpc.config.projects[0].networks[0].failsafe[4].retry.jitter|string|`"250ms"`|Random jitter added to retry delay|
|erpc.config.projects[0].networks[0].failsafe[4].retry.maxAttempts|int|`4`|Maximum retry attempts for finalized requests|
|erpc.config.projects[0].networks[0].failsafe[4].timeout|object|-|Timeout configuration for finalized requests|
|erpc.config.projects[0].networks[0].failsafe[4].timeout.duration|string|`"20s"`|Maximum duration for finalized requests|
|erpc.config.projects[0].networks[0].failsafe[5]|object|-|Default fallback failsafe policy for all methods|
|erpc.config.projects[0].networks[0].failsafe[5].hedge|object|-|Hedge configuration for default policy|
|erpc.config.projects[0].networks[0].failsafe[5].hedge.maxCount|int|`2`|Maximum number of concurrent hedge requests|
|erpc.config.projects[0].networks[0].failsafe[5].hedge.maxDelay|string|`"2s"`|Maximum delay before sending hedge request|
|erpc.config.projects[0].networks[0].failsafe[5].hedge.minDelay|string|`"120ms"`|Minimum delay before sending hedge request|
|erpc.config.projects[0].networks[0].failsafe[5].hedge.quantile|float|`0.95`|Latency quantile threshold for hedging (0.0-1.0)|
|erpc.config.projects[0].networks[0].failsafe[5].matchMethod|string|`"*"`|RPC method pattern matching all methods (catch-all)|
|erpc.config.projects[0].networks[0].failsafe[5].retry|object|-|Retry configuration for default policy|
|erpc.config.projects[0].networks[0].failsafe[5].retry.backoffFactor|float|`1.4`|Multiplicative factor for exponential backoff|
|erpc.config.projects[0].networks[0].failsafe[5].retry.backoffMaxDelay|string|`"5s"`|Maximum delay between retries|
|erpc.config.projects[0].networks[0].failsafe[5].retry.delay|string|`"300ms"`|Initial delay before first retry|
|erpc.config.projects[0].networks[0].failsafe[5].retry.jitter|string|`"200ms"`|Random jitter added to retry delay|
|erpc.config.projects[0].networks[0].failsafe[5].retry.maxAttempts|int|`3`|Maximum retry attempts for default policy|
|erpc.config.projects[0].networks[0].failsafe[5].timeout|object|-|Timeout configuration for default policy|
|erpc.config.projects[0].networks[0].failsafe[5].timeout.duration|string|`"12s"`|Maximum duration for default requests|
|erpc.config.projects[0].upstreams|list|-|Upstream RPC node configurations for load balancing|
|erpc.config.projects[0].upstreams[0]|object|-|First Besu RPC node upstream|
|erpc.config.projects[0].upstreams[0].endpoint|string|`"http://besu-node-rpc-0.besu-node-rpc:8545"`|RPC endpoint URL for this upstream|
|erpc.config.projects[0].upstreams[0].evm|object|-|EVM-specific configuration for this upstream|
|erpc.config.projects[0].upstreams[0].failsafe|list|-|Failsafe policies for this upstream|
|erpc.config.projects[0].upstreams[0].failsafe[0]|object|-|Circuit breaker policy for this upstream|
|erpc.config.projects[0].upstreams[0].failsafe[0].circuitBreaker|object|-|Circuit breaker configuration|
|erpc.config.projects[0].upstreams[0].failsafe[0].circuitBreaker.failureThresholdCapacity|int|`80`|Capacity of failure counter window|
|erpc.config.projects[0].upstreams[0].failsafe[0].circuitBreaker.failureThresholdCount|int|`40`|Number of failures before opening circuit|
|erpc.config.projects[0].upstreams[0].failsafe[0].circuitBreaker.halfOpenAfter|string|`"120s"`|Duration before attempting to close circuit|
|erpc.config.projects[0].upstreams[0].failsafe[0].circuitBreaker.successThresholdCapacity|int|`10`|Capacity of success counter window|
|erpc.config.projects[0].upstreams[0].failsafe[0].circuitBreaker.successThresholdCount|int|`3`|Number of successes needed to close circuit|
|erpc.config.projects[0].upstreams[0].failsafe[0].matchMethod|string|`"*"`|RPC method pattern matching all methods|
|erpc.config.projects[0].upstreams[0].id|string|`"besu-node-rpc-0"`|Unique identifier for this upstream|
|erpc.config.projects[0].upstreams[1]|object|-|Second Besu RPC node upstream|
|erpc.config.projects[0].upstreams[1].endpoint|string|`"http://besu-node-rpc-1.besu-node-rpc:8545"`|RPC endpoint URL for this upstream|
|erpc.config.projects[0].upstreams[1].evm|object|-|EVM-specific configuration for this upstream|
|erpc.config.projects[0].upstreams[1].failsafe|list|-|Failsafe policies for this upstream|
|erpc.config.projects[0].upstreams[1].failsafe[0]|object|-|Circuit breaker policy for this upstream|
|erpc.config.projects[0].upstreams[1].failsafe[0].circuitBreaker|object|-|Circuit breaker configuration|
|erpc.config.projects[0].upstreams[1].failsafe[0].circuitBreaker.failureThresholdCapacity|int|`80`|Capacity of failure counter window|
|erpc.config.projects[0].upstreams[1].failsafe[0].circuitBreaker.failureThresholdCount|int|`40`|Number of failures before opening circuit|
|erpc.config.projects[0].upstreams[1].failsafe[0].circuitBreaker.halfOpenAfter|string|`"120s"`|Duration before attempting to close circuit|
|erpc.config.projects[0].upstreams[1].failsafe[0].circuitBreaker.successThresholdCapacity|int|`10`|Capacity of success counter window|
|erpc.config.projects[0].upstreams[1].failsafe[0].circuitBreaker.successThresholdCount|int|`3`|Number of successes needed to close circuit|
|erpc.config.projects[0].upstreams[1].failsafe[0].matchMethod|string|`"*"`|RPC method pattern matching all methods|
|erpc.config.projects[0].upstreams[1].id|string|`"besu-node-rpc-1"`|Unique identifier for this upstream|
|erpc.config.server|object|-|HTTP server configuration|
|erpc.config.server.httpHostV4|string|`"0.0.0.0"`|IPv4 address to bind HTTP server to|
|erpc.config.server.httpPort|int|`4000`|HTTP server port|
|erpc.config.server.waitAfterShutdown|string|`"30s"`|Duration to wait after graceful shutdown completes|
|erpc.config.server.waitBeforeShutdown|string|`"30s"`|Duration to wait before starting graceful shutdown|
|erpc.configMountPath|string|`"/erpc.yaml"`|Path where the rendered configuration file will be mounted|
|erpc.containerSecurityContext|object|-|Container Security Context configuration (overrides global.securityContexts.container)|
|erpc.envSecret|object|-|.env Secret mount configuration|
|erpc.envSecret.defaultMode|int|`420`|File mode applied to the mounted Secret (decimal 420 = 0644)|
|erpc.envSecret.enabled|bool|`false`|Enable mounting a Secret containing a .env file|
|erpc.envSecret.mountPath|string|`"/.env"`|Path where the .env file will be mounted|
|erpc.envSecret.name|string|`""`|Name of the Secret containing the .env data (required when enabled)|
|erpc.envSecret.subPath|string|`""`|Optional subPath within the Secret to mount (defaults to the key named `.env`)|
|erpc.extraEnvVars|list|-|Array with extra environment variables to add to eRPC nodes|
|erpc.extraEnvVarsCM|string|`""`|Name of existing ConfigMap containing extra env vars for eRPC nodes|
|erpc.extraEnvVarsSecret|string|`""`|Name of existing Secret containing extra env vars for eRPC nodes|
|erpc.extraInitContainers|list|-|Additional init containers appended verbatim to the workload spec|
|erpc.extraVolumeMounts|list|-|Optionally specify extra list of additional volumeMounts for the eRPC container(s)|
|erpc.extraVolumes|list|-|Optionally specify extra list of additional volumes for the eRPC pod(s)|
|erpc.fullnameOverride|string|`"erpc"`|String to fully override common.names.fullname|
|erpc.image|object|-|eRPC image|
|erpc.image.digest|string|`""`|eRPC image digest in the way sha256:aa.... Please note this parameter, if set, will override the tag|
|erpc.image.pullPolicy|string|`"IfNotPresent"`|eRPC image pull policy|
|erpc.image.pullSecrets|list|-|eRPC image pull secrets|
|erpc.image.registry|string|`"ghcr.io"`|eRPC image registry|
|erpc.image.repository|string|`"erpc/erpc"`|eRPC image repository|
|erpc.image.tag|string|`"0.0.57"`|eRPC image tag (immutable tags are recommended)|
|erpc.ingress|object|-|Ingress parameters|
|erpc.ingress.annotations|object|-|Additional annotations for the Ingress resource. To enable certificate autogeneration, place here your cert-manager annotations.|
|erpc.ingress.apiVersion|string|`""`|Force Ingress API version (automatically detected if not set)|
|erpc.ingress.enabled|bool|`true`|Enable ingress record generation for eRPC|
|erpc.ingress.extraHosts|list|-|An array with additional hostname(s) to be covered with the ingress record|
|erpc.ingress.extraPaths|list|-|An array with additional arbitrary paths that may need to be added to the ingress under the main host|
|erpc.ingress.extraRules|list|-|Additional rules to be covered with this ingress record|
|erpc.ingress.extraTls|list|-|TLS configuration for additional hostname(s) to be covered with this ingress record|
|erpc.ingress.hostname|string|`"besu.k8s.orb.local"`|Default host for the ingress record|
|erpc.ingress.ingressClassName|string|`"atk-nginx"`|IngressClass that will be be used to implement the Ingress (Kubernetes 1.18+)|
|erpc.ingress.path|string|`"/"`|Default path for the ingress record|
|erpc.ingress.pathType|string|`"ImplementationSpecific"`|Ingress path type|
|erpc.ingress.secrets|list|-|Custom TLS certificates as secrets|
|erpc.ingress.selfSigned|bool|`false`|Create a TLS secret for this ingress record using self-signed certificates generated by Helm|
|erpc.ingress.tls|bool|`false`|Enable TLS configuration for the host defined at `ingress.hostname` parameter|
|erpc.initContainer|object|-|Init container configuration for dependency checking|
|erpc.initContainer.tcpCheck|object|-|Generic TCP check settings for service dependencies|
|erpc.initContainer.tcpCheck.dependencies|list|-|List of service dependencies to check before starting|
|erpc.initContainer.tcpCheck.dependencies[0]|object|-|Besu RPC service dependency|
|erpc.initContainer.tcpCheck.dependencies[0].endpoint|string|`"besu-node-rpc-0.besu-node-rpc:8545"`|Service endpoint to check (service-name:port)|
|erpc.initContainer.tcpCheck.dependencies[0].name|string|`"besu-rpc"`|Name of the dependency|
|erpc.initContainer.tcpCheck.dependencies[1]|object|-|Redis service dependency|
|erpc.initContainer.tcpCheck.dependencies[1].endpoint|string|`"{{ include \"erpc.redis.endpoint\" (dict \"context\" $) }}"`|Service endpoint to check (template rendered)|
|erpc.initContainer.tcpCheck.dependencies[1].name|string|`"redis"`|Name of the dependency|
|erpc.initContainer.tcpCheck.enabled|bool|`true`|Enable TCP dependency checking init container|
|erpc.initContainer.tcpCheck.image|object|-|Container image for TCP check init container|
|erpc.initContainer.tcpCheck.image.pullPolicy|string|`"IfNotPresent"`|TCP check image pull policy|
|erpc.initContainer.tcpCheck.image.repository|string|`"ghcr.io/settlemint/btp-waitforit"`|TCP check image repository|
|erpc.initContainer.tcpCheck.image.tag|string|`"v7.7.10"`|TCP check image tag|
|erpc.initContainer.tcpCheck.resources|object|-|Resource limits and requests for TCP check container|
|erpc.initContainer.tcpCheck.resources.limits|object|-|Resource limits for TCP check container|
|erpc.initContainer.tcpCheck.resources.limits.cpu|string|`"100m"`|CPU limit for TCP check container|
|erpc.initContainer.tcpCheck.resources.limits.memory|string|`"64Mi"`|Memory limit for TCP check container|
|erpc.initContainer.tcpCheck.resources.requests|object|-|Resource requests for TCP check container|
|erpc.initContainer.tcpCheck.resources.requests.cpu|string|`"10m"`|CPU request for TCP check container|
|erpc.initContainer.tcpCheck.resources.requests.memory|string|`"32Mi"`|Memory request for TCP check container|
|erpc.initContainer.tcpCheck.timeout|int|`120`|Timeout in seconds for each dependency check|
|erpc.lifecycleHooks|object|-|lifecycleHooks for the eRPC container(s) to automate configuration before or after startup|
|erpc.livenessProbe|object|-|Configure eRPC containers' liveness probe|
|erpc.livenessProbe.enabled|bool|`true`|Enable livenessProbe on eRPC containers|
|erpc.livenessProbe.failureThreshold|int|`3`|Failure threshold for livenessProbe|
|erpc.livenessProbe.httpGet|object|-|HTTP get parameters for livenessProbe|
|erpc.livenessProbe.httpGet.path|string|`"/healthcheck"`|Path for httpGet livenessProbe|
|erpc.livenessProbe.httpGet.port|string|`"http"`|Port for httpGet livenessProbe|
|erpc.livenessProbe.initialDelaySeconds|int|`10`|Initial delay seconds for livenessProbe|
|erpc.livenessProbe.periodSeconds|int|`10`|Period seconds for livenessProbe|
|erpc.livenessProbe.successThreshold|int|`1`|Success threshold for livenessProbe|
|erpc.livenessProbe.timeoutSeconds|int|`5`|Timeout seconds for livenessProbe|
|erpc.networkPolicy|object|-|Network policies configuration|
|erpc.networkPolicy.addExternalClientAccess|bool|`true`|Allow access from pods with client label set to "true". Ignored if `networkPolicy.allowExternal` is true.|
|erpc.networkPolicy.allowExternal|bool|`true`|The Policy model to apply|
|erpc.networkPolicy.allowExternalEgress|bool|`true`|Allow the pod to access any range of port and all destinations.|
|erpc.networkPolicy.enabled|bool|`false`|Enable creation of NetworkPolicy resources|
|erpc.networkPolicy.extraEgress|list|-|Add extra egress rules to the NetworkPolicy (ignored if allowExternalEgress=true)|
|erpc.networkPolicy.extraEgress[0]|object|-|Egress rule for DNS resolution|
|erpc.networkPolicy.extraEgress[0].ports|list|-|Port configurations for DNS egress|
|erpc.networkPolicy.extraEgress[0].ports[0]|object|-|DNS port configuration|
|erpc.networkPolicy.extraEgress[0].ports[0].port|int|`53`|DNS port number|
|erpc.networkPolicy.extraEgress[0].ports[0].protocol|string|`"UDP"`|Protocol for DNS queries|
|erpc.networkPolicy.extraEgress[0].to|list|-|Destination selectors for DNS traffic|
|erpc.networkPolicy.extraEgress[0].to[0]|object|-|Allow DNS queries to kube-dns pods|
|erpc.networkPolicy.extraEgress[0].to[0].namespaceSelector|object|-|Namespace selector (empty matches all namespaces)|
|erpc.networkPolicy.extraEgress[0].to[0].podSelector|object|-|Pod selector for kube-dns|
|erpc.networkPolicy.extraEgress[0].to[0].podSelector.matchLabels|object|-|Label selector for kube-dns pods|
|erpc.networkPolicy.extraEgress[0].to[0].podSelector.matchLabels.k8s-app|string|`"kube-dns"`|Kubernetes app label for DNS|
|erpc.networkPolicy.extraEgress[1]|object|-|Egress rule for Besu node access|
|erpc.networkPolicy.extraEgress[1].ports|list|-|Port configurations for Besu egress|
|erpc.networkPolicy.extraEgress[1].ports[0]|object|-|Besu RPC port configuration|
|erpc.networkPolicy.extraEgress[1].ports[0].port|int|`8545`|Besu RPC port number|
|erpc.networkPolicy.extraEgress[1].ports[0].protocol|string|`"TCP"`|Protocol for Besu RPC traffic|
|erpc.networkPolicy.extraEgress[1].to|list|-|Destination selectors for Besu traffic|
|erpc.networkPolicy.extraEgress[1].to[0]|object|-|Allow traffic to Besu statefulset pods|
|erpc.networkPolicy.extraEgress[1].to[0].podSelector|object|-|Pod selector for Besu nodes|
|erpc.networkPolicy.extraEgress[1].to[0].podSelector.matchLabels|object|-|Label selector for Besu pods|
|erpc.networkPolicy.extraEgress[1].to[0].podSelector.matchLabels."app.kubernetes.io/name"|string|`"besu-statefulset"`|App name label for Besu statefulset|
|erpc.networkPolicy.extraIngress|list|-|Add extra ingress rules to the NetworkPolicy|
|erpc.networkPolicy.extraIngress[0]|object|-|Ingress rule allowing access from specific pods|
|erpc.networkPolicy.extraIngress[0].from|list|-|Source pod selectors for this ingress rule|
|erpc.networkPolicy.extraIngress[0].from[0]|object|-|Allow traffic from dapp pods|
|erpc.networkPolicy.extraIngress[0].from[0].podSelector|object|-|Pod selector for dapp|
|erpc.networkPolicy.extraIngress[0].from[0].podSelector.matchLabels|object|-|Label selector for dapp pods|
|erpc.networkPolicy.extraIngress[0].from[0].podSelector.matchLabels."app.kubernetes.io/name"|string|`"dapp"`|App name label for dapp|
|erpc.networkPolicy.extraIngress[0].from[1]|object|-|Allow traffic from txsigner pods|
|erpc.networkPolicy.extraIngress[0].from[1].podSelector|object|-|Pod selector for txsigner|
|erpc.networkPolicy.extraIngress[0].from[1].podSelector.matchLabels|object|-|Label selector for txsigner pods|
|erpc.networkPolicy.extraIngress[0].from[1].podSelector.matchLabels."app.kubernetes.io/name"|string|`"txsigner"`|App name label for txsigner|
|erpc.networkPolicy.extraIngress[0].from[2]|object|-|Allow traffic from ingress-nginx pods|
|erpc.networkPolicy.extraIngress[0].from[2].podSelector|object|-|Pod selector for ingress-nginx|
|erpc.networkPolicy.extraIngress[0].from[2].podSelector.matchLabels|object|-|Label selector for ingress-nginx pods|
|erpc.networkPolicy.extraIngress[0].from[2].podSelector.matchLabels."app.kubernetes.io/name"|string|`"ingress-nginx"`|App name label for ingress-nginx|
|erpc.networkPolicy.extraIngress[0].from[3]|object|-|Allow traffic from any pod in same namespace|
|erpc.networkPolicy.extraIngress[0].from[3].podSelector|object|-|Empty pod selector matches all pods|
|erpc.networkPolicy.extraIngress[0].ports|list|-|Port configurations for this ingress rule|
|erpc.networkPolicy.extraIngress[0].ports[0]|object|-|RPC port configuration|
|erpc.networkPolicy.extraIngress[0].ports[0].port|int|`4000`|RPC port number|
|erpc.networkPolicy.extraIngress[0].ports[0].protocol|string|`"TCP"`|Protocol for RPC traffic|
|erpc.networkPolicy.extraIngress[0].ports[1]|object|-|Metrics port configuration|
|erpc.networkPolicy.extraIngress[0].ports[1].port|int|`4001`|Metrics port number|
|erpc.networkPolicy.extraIngress[0].ports[1].protocol|string|`"TCP"`|Protocol for metrics traffic|
|erpc.networkPolicy.ingressRules|object|-|Ingress rules configuration|
|erpc.networkPolicy.ingressRules.accessOnlyFrom|object|-|Access restrictions configuration|
|erpc.networkPolicy.ingressRules.accessOnlyFrom.enabled|bool|`false`|Enable ingress rule that makes eRPC only accessible from a particular origin.|
|erpc.networkPolicy.ingressRules.accessOnlyFrom.namespaceSelector|object|-|Namespace selector label that is allowed to access eRPC. This label will be used to identified allowed namespace(s).|
|erpc.networkPolicy.ingressRules.accessOnlyFrom.podSelector|object|-|Pods selector label that is allowed to access eRPC. This label will be used to identified allowed pod(s).|
|erpc.nodeAffinityPreset|object|-|Node affinity preset configuration|
|erpc.nodeAffinityPreset.key|string|`""`|Node label key to match. Ignored if `affinity` is set|
|erpc.nodeAffinityPreset.type|string|`""`|Node affinity preset type. Ignored if `affinity` is set. Allowed values: `soft` or `hard`|
|erpc.nodeAffinityPreset.values|list|-|Node label values to match. Ignored if `affinity` is set|
|erpc.nodeSelector|object|-|Node labels for pod assignment|
|erpc.openShiftRoute|object|-|OpenShift Route parameters|
|erpc.openShiftRoute.alternateBackends|list|-|Additional backends for weighted routing|
|erpc.openShiftRoute.annotations|object|-|Additional annotations for the OpenShift route resource|
|erpc.openShiftRoute.enabled|bool|`false`|Enable OpenShift route creation for eRPC|
|erpc.openShiftRoute.host|string|`"besu.k8s.orb.local"`|Hostname exposed via the OpenShift route|
|erpc.openShiftRoute.path|string|`"/"`|HTTP path exposed via the OpenShift route|
|erpc.openShiftRoute.port|object|-|Service port configuration for the route target|
|erpc.openShiftRoute.port.targetPort|string|`"http"`|Service target port name (must exist on the eRPC service)|
|erpc.openShiftRoute.tls|object|-|TLS configuration for the OpenShift route|
|erpc.openShiftRoute.to|object|-|Primary service weight configuration|
|erpc.openShiftRoute.to.weight|int|`100`|Weight assigned to the eRPC service backend|
|erpc.openShiftRoute.wildcardPolicy|string|`"None"`|Wildcard policy applied to the route|
|erpc.pdb|object|-|Pod disruption budget configuration|
|erpc.pdb.enabled|bool|`false`|If true, create a pod disruption budget for pods.|
|erpc.pdb.maxUnavailable|string|`""`|Maximum number/percentage of pods that may be made unavailable. Defaults to 1 if both pdb.minAvailable and pdb.maxUnavailable are empty.|
|erpc.pdb.minAvailable|string|`""`|Minimum number/percentage of pods that should remain scheduled|
|erpc.podAffinityPreset|string|`""`|Pod affinity preset. Ignored if `affinity` is set. Allowed values: `soft` or `hard`|
|erpc.podAnnotations|object|-|Annotations for eRPC pods|
|erpc.podAnnotations."prometheus.io/path"|string|`"/metrics"`|Prometheus metrics path|
|erpc.podAnnotations."prometheus.io/port"|string|`"4001"`|Prometheus metrics port|
|erpc.podAnnotations."prometheus.io/scrape"|string|`"true"`|Enable prometheus scraping|
|erpc.podAntiAffinityPreset|string|`"soft"`|Pod anti-affinity preset. Ignored if `affinity` is set. Allowed values: `soft` or `hard`|
|erpc.podLabels|object|-|Extra labels for eRPC pods|
|erpc.podSecurityContext|object|-|Pod Security Context configuration (overrides global.securityContexts.pod)|
|erpc.priorityClassName|string|`""`|eRPC pods' priority class name|
|erpc.readinessProbe|object|-|Configure eRPC containers' readiness probe|
|erpc.readinessProbe.enabled|bool|`true`|Enable readinessProbe on eRPC containers|
|erpc.readinessProbe.failureThreshold|int|`3`|Failure threshold for readinessProbe|
|erpc.readinessProbe.httpGet|object|-|HTTP get parameters for readinessProbe|
|erpc.readinessProbe.httpGet.path|string|`"/healthcheck"`|Path for httpGet readinessProbe|
|erpc.readinessProbe.httpGet.port|string|`"http"`|Port for httpGet readinessProbe|
|erpc.readinessProbe.initialDelaySeconds|int|`5`|Initial delay seconds for readinessProbe|
|erpc.readinessProbe.periodSeconds|int|`10`|Period seconds for readinessProbe|
|erpc.readinessProbe.successThreshold|int|`1`|Success threshold for readinessProbe|
|erpc.readinessProbe.timeoutSeconds|int|`5`|Timeout seconds for readinessProbe|
|erpc.redis|object|-|Redis parameters for cache/shared state connectivity (overrides global.datastores.erpc.redis)|
|erpc.replicaCount|int|`1`|Number of eRPC replicas to deploy|
|erpc.resources|object|-|eRPC containers resource requests and limits|
|erpc.runtime|object|-|Runtime tuning for Go garbage collection and memory management|
|erpc.runtime.gc|object|-|Go garbage collection tuning configuration|
|erpc.runtime.gc.enabled|bool|`true`|Enable automatic Go GC tuning based on container limits|
|erpc.runtime.gc.gogc|int|`30`|Triggers garbage collection when heap grows by this percentage|
|erpc.runtime.gc.gomemlimitOverride|string|`""`|Absolute fallback for GOMEMLIMIT (takes precedence when set, e.g. "2GiB")|
|erpc.runtime.gc.gomemlimitRatio|float|`0.85`|Fraction of the pod memory limit used to derive GOMEMLIMIT (set to 1.0 for 100%)|
|erpc.schedulerName|string|`""`|Alternate scheduler|
|erpc.service|object|-|Service parameters|
|erpc.service.annotations|object|-|Additional custom annotations for eRPC service|
|erpc.service.clusterIP|string|`""`|eRPC service Cluster IP|
|erpc.service.externalTrafficPolicy|string|`"Cluster"`|eRPC service external traffic policy|
|erpc.service.extraPorts|list|-|Extra ports to expose in the eRPC service (normally used with the `sidecar` value)|
|erpc.service.loadBalancerIP|string|`""`|eRPC service Load Balancer IP|
|erpc.service.loadBalancerSourceRanges|list|-|eRPC service Load Balancer sources|
|erpc.service.metricsNodePort|string|`""`|Node port for metrics|
|erpc.service.metricsPort|int|`4001`|eRPC service metrics port|
|erpc.service.nodePort|string|`""`|Node port for HTTP|
|erpc.service.port|int|`4000`|eRPC service HTTP port|
|erpc.service.sessionAffinity|string|`"None"`|Session Affinity for Kubernetes service, can be "None" or "ClientIP"|
|erpc.service.sessionAffinityConfig|object|-|Additional settings for the sessionAffinity|
|erpc.service.type|string|`"ClusterIP"`|eRPC service type|
|erpc.serviceAccount|object|-|Service account for eRPC pods|
|erpc.serviceAccount.annotations|object|-|Annotations for service account. Evaluated as a template. Only used if `create` is `true`.|
|erpc.serviceAccount.automountServiceAccountToken|bool|`false`|Automount service account token for the deployment controller service account|
|erpc.serviceAccount.create|bool|`true`|Specifies whether a ServiceAccount should be created|
|erpc.serviceAccount.labels|object|-|Extra labels to be added to the service account|
|erpc.serviceAccount.name|string|`""`|The name of the ServiceAccount to use.|
|erpc.startupProbe|object|-|Configure eRPC containers' startup probe|
|erpc.startupProbe.enabled|bool|`false`|Enable startupProbe on eRPC containers|
|erpc.startupProbe.failureThreshold|int|`10`|Failure threshold for startupProbe|
|erpc.startupProbe.initialDelaySeconds|int|`30`|Initial delay seconds for startupProbe|
|erpc.startupProbe.periodSeconds|int|`10`|Period seconds for startupProbe|
|erpc.startupProbe.successThreshold|int|`1`|Success threshold for startupProbe|
|erpc.startupProbe.timeoutSeconds|int|`5`|Timeout seconds for startupProbe|
|erpc.tests|object|-|Test parameters|
|erpc.tests.image|object|-|Image for test pods|
|erpc.tests.image.pullPolicy|string|`"IfNotPresent"`|Test image pull policy|
|erpc.tests.image.registry|string|`"docker.io"`|Test image registry|
|erpc.tests.image.repository|string|`"busybox"`|Test image repository|
|erpc.tests.image.tag|string|`"1.37.0"`|Test image tag|
|erpc.tolerations|list|-|Tolerations for pod assignment|
|erpc.topologySpreadConstraints|list|-|Topology Spread Constraints for pod assignment|
|erpc.updateStrategy|object|-|Update strategy configuration for eRPC deployment|
|erpc.updateStrategy.rollingUpdate|object|-|eRPC deployment rolling update configuration parameters|
|erpc.updateStrategy.type|string|`"RollingUpdate"`|eRPC deployment strategy type|
|erpc.workingDir|string|`"/"`|Working directory for the eRPC container|
|graph-node.autoscaling|object|-|Autoscaling|
|graph-node.autoscaling.enabled|bool|`false`|Enable autoscaling|
|graph-node.autoscaling.maxReplicas|int|`100`|Maximum number of replicas|
|graph-node.autoscaling.minReplicas|int|`1`|Minimum number of replicas|
|graph-node.autoscaling.targetCPUUtilizationPercentage|int|`80`|Target CPU utilization percentage|
|graph-node.chains|object|-|Blockchain configuration for Graph Node|
|graph-node.chains.settlemint|object|-|SettleMint blockchain configuration|
|graph-node.chains.settlemint.enabled|bool|`true`|Enable this configuring graph-node with this chain|
|graph-node.chains.settlemint.provider|list|-|A list of JSON-RPC endpoints for this node (you should override this list with your own configuration)|
|graph-node.chains.settlemint.provider[0]|object|-|JSON-RPC provider configuration|
|graph-node.chains.settlemint.provider[0].details|object|-|Provider connection details|
|graph-node.chains.settlemint.provider[0].details.features|list|-|Data capabilities this node has|
|graph-node.chains.settlemint.provider[0].details.type|string|`"web3"`|Type of Provider: web3|
|graph-node.chains.settlemint.provider[0].details.url|string|`"http://erpc:4000/settlemint/evm/53771311147"`|URL for JSON-RPC endpoint|
|graph-node.chains.settlemint.provider[0].label|string|`"erpc"`|Label for a JSON-RPC endpoint|
|graph-node.chains.settlemint.shard|string|`"primary"`|The database shard to use for this chain|
|graph-node.configTemplate|string|`"# Store configuration\n[store]\n{{- range $storeName, $storeValues := $.Values.store }}\n{{- if $storeValues.enabled }}\n  [store.{{ $storeName }}]\n  connection = {{ required \"You must specify a store connection string\" $storeValues.connection | quote }}\n  pool_size = {{ default 10 $storeValues.poolSize }}\n  weight = {{ default 1 $storeValues.weight }}\n{{- end }}\n{{- end }}\n\n# Chain configuration\n{{- $patchedChains := dict \"ingestor\" (print (include \"graph-node.fullname\" $) \"-combined-\" 0) }}\n{{- range $chainName, $chainValues := $.Values.chains }}\n{{- if $chainValues.enabled }}\n  {{- $_ := set $patchedChains $chainName (omit $chainValues \"enabled\") }}\n{{- end }}\n{{- end }}\n{{ toToml (dict \"chains\" $patchedChains) }}\n\n# Deployment rule configuration\n[deployment]\n# Deployment rules match top to bottom\n[[deployment.rule]]\n# DEFAULT RULE\n# There's no 'match' field, so any subgraph that hasn't matched above, matches this rule\nshards = [\"primary\"]\nindexers = [\"{{ include \"graph-node.fullname\" $ }}-combined-0\"]\n"`|Configuration for graph-node. See [graph-node config docs](https://github.com/graphprotocol/graph-node/blob/master/docs/config.md) and default template in values.yaml|
|graph-node.containerSecurityContext|object|-|Container-level security context overrides|
|graph-node.customSecret|object|-|Custom secret data for PostgreSQL credentials. Used for backward compatibility and default values|
|graph-node.env|object|-|Environment variables|
|graph-node.env.ETHEREUM_POLLING_INTERVAL|string|`"1000"`|Ethereum polling interval in milliseconds|
|graph-node.env.EXPERIMENTAL_SUBGRAPH_VERSION_SWITCHING_MODE|string|`"synced"`|Experimental subgraph version switching mode|
|graph-node.env.GRAPH_ALLOW_NON_DETERMINISTIC_FULLTEXT_SEARCH|string|`"true"`|Allow non-deterministic fulltext search operations|
|graph-node.env.GRAPH_ALLOW_NON_DETERMINISTIC_IPFS|string|`"true"`|Allow non-deterministic IPFS operations|
|graph-node.env.GRAPH_CHAIN_HEAD_WATCHER_TIMEOUT|string|`"5"`|Timeout in seconds for chain head watcher|
|graph-node.env.GRAPH_DISABLE_GRAFTS|string|`"false"`|Disable subgraph grafting feature|
|graph-node.env.GRAPH_ENABLE_PROMETHEUS_METRICS|string|`"true"`|Enable Prometheus metrics endpoint|
|graph-node.env.GRAPH_ETHEREUM_BLOCK_BATCH_SIZE|string|`"100"`|Number of blocks to fetch in a single batch|
|graph-node.env.GRAPH_ETHEREUM_BLOCK_INGESTOR_MAX_CONCURRENT_JSON_RPC_CALLS|string|`"100"`|Maximum concurrent JSON-RPC calls for block ingestor|
|graph-node.env.GRAPH_ETHEREUM_CLEANUP_BLOCKS|string|`"true"`|Clean up old Ethereum blocks from the database|
|graph-node.env.GRAPH_ETHEREUM_MAX_BLOCK_RANGE_SIZE|string|`"1000"`|Maximum block range size for queries|
|graph-node.env.GRAPH_ETHEREUM_REQUEST_RETRIES|string|`"10"`|Number of retries for failed Ethereum requests|
|graph-node.env.GRAPH_ETHEREUM_TARGET_TRIGGERS_PER_BLOCK_RANGE|string|`"100"`|Target number of triggers per block range|
|graph-node.env.GRAPH_ETH_CALL_GAS|string|`"50000000"`|Maximum gas for eth_call operations|
|graph-node.env.GRAPH_GETH_ETH_CALL_ERRORS|string|`"out of gas"`|Error patterns that indicate out of gas conditions|
|graph-node.env.GRAPH_IPFS_TIMEOUT|string|`"30"`|Timeout in seconds for IPFS operations|
|graph-node.env.GRAPH_KILL_IF_UNRESPONSIVE|string|`"true"`|Kill the node if it becomes unresponsive|
|graph-node.env.GRAPH_LOAD_BIN_SIZE|string|`"10"`|Bin size for load distribution|
|graph-node.env.GRAPH_LOAD_WINDOW_SIZE|string|`"3600"`|Load window size in seconds for block ingestion|
|graph-node.env.GRAPH_LOG|string|`"info"`|Log level (trace, debug, info, warn, error)|
|graph-node.env.GRAPH_LOG_QUERY_TIMING|string|`"gql"`|Log GraphQL query timing information|
|graph-node.env.GRAPH_MAX_GAS_PER_HANDLER|string|`"1_000_000_000_000_000"`|Maximum gas allowed per handler execution|
|graph-node.env.GRAPH_MAX_SPEC_VERSION|string|`"1.2.0"`|Maximum subgraph spec version supported|
|graph-node.env.GRAPH_PARALLEL_BLOCK_CONSTRAINTS|string|`"true"`|Use parallel block constraints for better performance|
|graph-node.env.GRAPH_POSTPONE_ATTRIBUTE_INDEX_CREATION|string|`"true"`|Postpone attribute index creation until after data loading|
|graph-node.env.GRAPH_PROMETHEUS_HOST|string|`"0.0.0.0"`|Host address for Prometheus metrics server|
|graph-node.env.GRAPH_QUERY_CACHE_BLOCKS|string|`"6"`|Number of blocks to cache queries for|
|graph-node.env.GRAPH_QUERY_CACHE_MAX_MEM|string|`"3000"`|Maximum memory for query cache in megabytes|
|graph-node.env.GRAPH_QUERY_CACHE_STALE_PERIOD|string|`"1000"`|Time period in milliseconds before cached queries become stale|
|graph-node.env.GRAPH_STATIC_FILTERS_THRESHOLD|string|`"10000"`|Threshold for using static filters optimization|
|graph-node.env.GRAPH_STORE_WRITE_BATCH_DURATION|string|`"0"`|Duration in milliseconds to batch store writes (0 = disabled)|
|graph-node.env.GRAPH_STORE_WRITE_BATCH_SIZE|string|`"0"`|Number of operations to batch in store writes (0 = disabled)|
|graph-node.env.IPFS|string|`"https://ipfs.console.settlemint.com"`|The URL for your IPFS node|
|graph-node.env.node_role|string|`"combined"`|Node role|
|graph-node.extraContainers|list|-|Additional containers|
|graph-node.extraInitContainers|list|-|Additional init containers|
|graph-node.extraVolumeMounts|list|-|Additional volume mounts|
|graph-node.extraVolumes|list|-|Additional volumes|
|graph-node.fullnameOverride|string|`"graph-node"`|Override the full resource name. Set to "graph-node" for backward compatibility with existing ATK deployments that reference "graph-node-combined" service name|
|graph-node.graph-node|object|-|Graph Node defaults configuration|
|graph-node.graph-node.graphNodeDefaults|object|-|Default values for Graph Node instances|
|graph-node.graph-node.graphNodeDefaults.subgraph|object|-|Subgraph defaults configuration|
|graph-node.graph-node.graphNodeDefaults.subgraph.configMapName|string|`"besu-subgraph"`|Default ConfigMap name for subgraph deployment|
|graph-node.image|object|-|Graph Node image configuration|
|graph-node.image.pullPolicy|string|`"IfNotPresent"`|Graph Node image pull policy|
|graph-node.image.repository|string|`"graphprotocol/graph-node"`|Image for Graph Node|
|graph-node.image.tag|string|`"v0.40.2"`|Overrides the image tag. Defaults to Chart.appVersion if not set|
|graph-node.imagePullSecrets|list|-|Pull secrets required to fetch the Image|
|graph-node.ingress|object|-|Ingress configuration|
|graph-node.ingress.annotations|object|-|Additional annotations for the Ingress resource|
|graph-node.ingress.annotations."nginx.ingress.kubernetes.io/rewrite-target"|string|`"/$1"`|Rewrite target path using capture group|
|graph-node.ingress.annotations."nginx.ingress.kubernetes.io/use-regex"|string|`"true"`|Enable regex path matching in NGINX ingress|
|graph-node.ingress.className|string|`"atk-nginx"`|IngressClass that will be be used to implement the Ingress (Kubernetes 1.18+)|
|graph-node.ingress.enabled|bool|`true`|Enable ingress record generation for Graph Node|
|graph-node.ingress.hosts|list|-|An array with hosts and paths|
|graph-node.ingress.hosts[0]|object|-|Ingress host configuration|
|graph-node.ingress.hosts[0].host|string|`"graph.k8s.orb.local"`|Hostname for the ingress rule|
|graph-node.ingress.hosts[0].paths|list|-|List of path configurations for this host|
|graph-node.ingress.hosts[0].paths[0]|object|-|Query endpoint path configuration|
|graph-node.ingress.hosts[0].paths[0].path|string|`"/(.*)"`|URL path pattern with regex capture group|
|graph-node.ingress.hosts[0].paths[0].pathType|string|`"ImplementationSpecific"`|Path type for Kubernetes ingress|
|graph-node.ingress.hosts[0].paths[1]|object|-|WebSocket query endpoint path configuration|
|graph-node.ingress.hosts[0].paths[1].path|string|`"/ws/?(.*)"`|URL path pattern for WebSocket queries|
|graph-node.ingress.hosts[0].paths[1].pathType|string|`"ImplementationSpecific"`|Path type for Kubernetes ingress|
|graph-node.ingress.hosts[0].paths[2]|object|-|Admin endpoint path configuration|
|graph-node.ingress.hosts[0].paths[2].path|string|`"/admin/?(.*)"`|URL path pattern for admin interface|
|graph-node.ingress.hosts[0].paths[2].pathType|string|`"ImplementationSpecific"`|Path type for Kubernetes ingress|
|graph-node.ingress.hosts[0].paths[3]|object|-|Indexer endpoint path configuration|
|graph-node.ingress.hosts[0].paths[3].path|string|`"/indexer/?(.*)"`|URL path pattern for indexer status|
|graph-node.ingress.hosts[0].paths[3].pathType|string|`"ImplementationSpecific"`|Path type for Kubernetes ingress|
|graph-node.ingress.hosts[0].paths[4]|object|-|Graphman endpoint path configuration|
|graph-node.ingress.hosts[0].paths[4].path|string|`"/graphman/?(.*)"`|URL path pattern for graphman interface|
|graph-node.ingress.hosts[0].paths[4].pathType|string|`"ImplementationSpecific"`|Path type for Kubernetes ingress|
|graph-node.ingress.tls|list|-|TLS configuration for the ingress|
|graph-node.initContainer|object|-|Init container configuration|
|graph-node.initContainer.image|object|-|Image for init container kubectl|
|graph-node.initContainer.image.pullPolicy|string|`"IfNotPresent"`|Kubectl image pull policy|
|graph-node.initContainer.image.repository|string|`"docker.io/kubesphere/kubectl"`|Kubectl image repository|
|graph-node.initContainer.image.tag|string|`"v1.33.4"`|Kubectl image tag|
|graph-node.initContainer.tcpCheck|object|-|TCP check configuration|
|graph-node.initContainer.tcpCheck.dependencies|list|-|List of dependencies to check|
|graph-node.initContainer.tcpCheck.dependencies[0]|object|-|Dependency configuration|
|graph-node.initContainer.tcpCheck.dependencies[0].endpoint|string|`"{{ include \"atk.postgresql.endpoint\" (dict \"context\" $ \"chartKey\" \"graphNode\" \"local\" .Values.postgresql) }}"`|Dependency endpoint template|
|graph-node.initContainer.tcpCheck.dependencies[0].name|string|`"postgresql"`|Dependency name|
|graph-node.initContainer.tcpCheck.enabled|bool|`true`|Enable TCP check init container|
|graph-node.initContainer.tcpCheck.image|object|-|TCP check image configuration|
|graph-node.initContainer.tcpCheck.image.pullPolicy|string|`"IfNotPresent"`|TCP check image pull policy|
|graph-node.initContainer.tcpCheck.image.repository|string|`"ghcr.io/settlemint/btp-waitforit"`|TCP check image repository|
|graph-node.initContainer.tcpCheck.image.tag|string|`"v7.7.10"`|TCP check image tag|
|graph-node.initContainer.tcpCheck.resources|object|-|Resource limits and requests for TCP check container|
|graph-node.initContainer.tcpCheck.resources.limits|object|-|Resource limits|
|graph-node.initContainer.tcpCheck.resources.limits.cpu|string|`"100m"`|CPU limit|
|graph-node.initContainer.tcpCheck.resources.limits.memory|string|`"64Mi"`|Memory limit|
|graph-node.initContainer.tcpCheck.resources.requests|object|-|Resource requests|
|graph-node.initContainer.tcpCheck.resources.requests.cpu|string|`"10m"`|CPU request|
|graph-node.initContainer.tcpCheck.resources.requests.memory|string|`"32Mi"`|Memory request|
|graph-node.initContainer.tcpCheck.timeout|int|`120`|Timeout in seconds for each dependency check|
|graph-node.nameOverride|string|`""`|String to partially override common.names.fullname template (will maintain the release name)|
|graph-node.networkPolicy|object|-|Network policies|
|graph-node.networkPolicy.egress|list|-|Egress rules for network policy|
|graph-node.networkPolicy.enabled|bool|`false`|Enable network policies|
|graph-node.networkPolicy.ingress|list|-|Ingress rules for network policy|
|graph-node.nodeSelector|object|-|Specify a [node selector](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/)|
|graph-node.openShiftRoute|object|-|OpenShift Route parameters|
|graph-node.openShiftRoute.alternateBackends|list|-|Additional service backends shared by the generated routes|
|graph-node.openShiftRoute.annotations|object|-|Additional annotations applied to every generated route|
|graph-node.openShiftRoute.enabled|bool|`false`|Enable OpenShift route creation for Graph Node endpoints|
|graph-node.openShiftRoute.host|string|`"graph.k8s.orb.local"`|Hostname exposed via the OpenShift routes|
|graph-node.openShiftRoute.routes|list|-|Route definitions for the exposed Graph Node endpoints|
|graph-node.openShiftRoute.routes[0]|object|-|Query endpoint route configuration|
|graph-node.openShiftRoute.routes[0].annotations|object|-|Route-specific annotations|
|graph-node.openShiftRoute.routes[0].host|string|`""`|Hostname override (empty uses default host)|
|graph-node.openShiftRoute.routes[0].nameSuffix|string|`""`|Name suffix for the route resource|
|graph-node.openShiftRoute.routes[0].path|string|`"/"`|URL path for the route|
|graph-node.openShiftRoute.routes[0].targetPort|string|`"http-query"`|Target service port name|
|graph-node.openShiftRoute.routes[1]|object|-|WebSocket query endpoint route configuration|
|graph-node.openShiftRoute.routes[1].annotations|object|-|Route-specific annotations|
|graph-node.openShiftRoute.routes[1].annotations."haproxy.router.openshift.io/rewrite-target"|string|`"/"`|HAProxy rewrite target path|
|graph-node.openShiftRoute.routes[1].host|string|`""`|Hostname override (empty uses default host)|
|graph-node.openShiftRoute.routes[1].nameSuffix|string|`"ws"`|Name suffix for the route resource|
|graph-node.openShiftRoute.routes[1].path|string|`"/ws"`|URL path for the route|
|graph-node.openShiftRoute.routes[1].targetPort|string|`"http-queryws"`|Target service port name|
|graph-node.openShiftRoute.routes[2]|object|-|Admin endpoint route configuration|
|graph-node.openShiftRoute.routes[2].annotations|object|-|Route-specific annotations|
|graph-node.openShiftRoute.routes[2].annotations."haproxy.router.openshift.io/rewrite-target"|string|`"/"`|HAProxy rewrite target path|
|graph-node.openShiftRoute.routes[2].host|string|`""`|Hostname override (empty uses default host)|
|graph-node.openShiftRoute.routes[2].nameSuffix|string|`"admin"`|Name suffix for the route resource|
|graph-node.openShiftRoute.routes[2].path|string|`"/admin"`|URL path for the route|
|graph-node.openShiftRoute.routes[2].targetPort|string|`"http-admin"`|Target service port name|
|graph-node.openShiftRoute.routes[3]|object|-|Indexer endpoint route configuration|
|graph-node.openShiftRoute.routes[3].annotations|object|-|Route-specific annotations|
|graph-node.openShiftRoute.routes[3].annotations."haproxy.router.openshift.io/rewrite-target"|string|`"/"`|HAProxy rewrite target path|
|graph-node.openShiftRoute.routes[3].host|string|`""`|Hostname override (empty uses default host)|
|graph-node.openShiftRoute.routes[3].nameSuffix|string|`"indexer"`|Name suffix for the route resource|
|graph-node.openShiftRoute.routes[3].path|string|`"/indexer"`|URL path for the route|
|graph-node.openShiftRoute.routes[3].targetPort|string|`"http-status"`|Target service port name|
|graph-node.openShiftRoute.routes[4]|object|-|Graphman endpoint route configuration|
|graph-node.openShiftRoute.routes[4].annotations|object|-|Route-specific annotations|
|graph-node.openShiftRoute.routes[4].annotations."haproxy.router.openshift.io/rewrite-target"|string|`"/"`|HAProxy rewrite target path|
|graph-node.openShiftRoute.routes[4].host|string|`""`|Hostname override (empty uses default host)|
|graph-node.openShiftRoute.routes[4].nameSuffix|string|`"graphman"`|Name suffix for the route resource|
|graph-node.openShiftRoute.routes[4].path|string|`"/graphman"`|URL path for the route|
|graph-node.openShiftRoute.routes[4].targetPort|string|`"http-status"`|Target service port name|
|graph-node.openShiftRoute.tls|object|-|TLS configuration shared by the generated routes|
|graph-node.openShiftRoute.to|object|-|Primary service weight configuration used when routes omit a weight|
|graph-node.openShiftRoute.to.weight|int|`100`|Weight for the primary service backend|
|graph-node.openShiftRoute.wildcardPolicy|string|`"None"`|Wildcard policy applied when individual routes do not override it|
|graph-node.podAnnotations|object|-|Annotations for the `Pod`|
|graph-node.podAnnotations."prometheus.io/path"|string|`"/metrics"`|Prometheus metrics endpoint path|
|graph-node.podAnnotations."prometheus.io/port"|string|`"8040"`|Prometheus metrics port|
|graph-node.podAnnotations."prometheus.io/scrape"|string|`"true"`|Enable Prometheus scraping for this pod|
|graph-node.podDisruptionBudget|object|-|Pod disruption budget|
|graph-node.podDisruptionBudget.enabled|bool|`false`|Enable pod disruption budget|
|graph-node.podSecurityContext|object|-|Pod-wide security context|
|graph-node.postgresReadinessCheck|object|-|PostgreSQL readiness check configuration|
|graph-node.postgresReadinessCheck.enabled|bool|`true`|Enable PostgreSQL readiness check init container|
|graph-node.postgresReadinessCheck.image|string|`"docker.io/postgres:18.0-alpine"`|Docker image for PostgreSQL readiness check|
|graph-node.postgresReadinessCheck.initialWaitTime|int|`2`|Initial wait time between retries (doubles with exponential backoff)|
|graph-node.postgresReadinessCheck.maxRetries|int|`30`|Maximum number of connection retries|
|graph-node.postgresReadinessCheck.maxWaitTime|int|`30`|Maximum wait time between retries|
|graph-node.postgresReadinessCheck.randomDelayRange|object|-|Add random delay to prevent all nodes from connecting simultaneously|
|graph-node.postgresReadinessCheck.randomDelayRange.max|int|`30`|Maximum random delay in seconds|
|graph-node.postgresReadinessCheck.randomDelayRange.min|int|`5`|Minimum random delay in seconds|
|graph-node.postgresReadinessCheck.resources|object|-|Resource limits and requests for PostgreSQL readiness check container|
|graph-node.postgresReadinessCheck.resources.limits|object|-|Resource limits|
|graph-node.postgresReadinessCheck.resources.limits.cpu|string|`"100m"`|CPU limit|
|graph-node.postgresReadinessCheck.resources.limits.memory|string|`"96Mi"`|Memory limit|
|graph-node.postgresReadinessCheck.resources.requests|object|-|Resource requests|
|graph-node.postgresReadinessCheck.resources.requests.cpu|string|`"25m"`|CPU request|
|graph-node.postgresReadinessCheck.resources.requests.memory|string|`"48Mi"`|Memory request|
|graph-node.postgresql|object|-|PostgreSQL overrides merged with global.datastores.graphNode.postgresql|
|graph-node.rbac|object|-|RBAC configuration|
|graph-node.rbac.create|bool|`false`|Specifies whether RBAC resources are to be created|
|graph-node.rbac.rules|list|-|RBAC rules for the service account. Add RBAC rules here if graph-node requires specific Kubernetes API access. Currently no special permissions are needed|
|graph-node.replicaCount|int|`1`|Number of Graph Node replicas to deploy|
|graph-node.resources|object|-|Specify [resource requests and limits](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/#requests-and-limits)|
|graph-node.secretEnv|object|-|Environment variables from secrets|
|graph-node.secretEnv.PRIMARY_SUBGRAPH_DATA_PGPASSWORD|object|-|PostgreSQL password secret reference|
|graph-node.secretEnv.PRIMARY_SUBGRAPH_DATA_PGPASSWORD.key|string|`"PGPASSWORD"`|Name of the data key in the secret that contains your PG password|
|graph-node.secretEnv.PRIMARY_SUBGRAPH_DATA_PGPASSWORD.secretName|string|`""`|Name of the secret that contains your PG password (uses graph-node.pgSecretName helper)|
|graph-node.secretEnv.PRIMARY_SUBGRAPH_DATA_PGUSER|object|-|PostgreSQL username secret reference|
|graph-node.secretEnv.PRIMARY_SUBGRAPH_DATA_PGUSER.key|string|`"PGUSER"`|Name of the data key in the secret that contains your PG username|
|graph-node.secretEnv.PRIMARY_SUBGRAPH_DATA_PGUSER.secretName|string|`""`|Name of the secret that contains your PG username (uses graph-node.pgSecretName helper)|
|graph-node.service|object|-|Service configuration|
|graph-node.service.ports|object|-|Service ports configuration|
|graph-node.service.ports.httpAdmin|int|`8020`|Service Port to expose Graph Node Admin endpoint on|
|graph-node.service.ports.httpMetrics|int|`8040`|Service Port to expose Graph Node Metrics endpoint on|
|graph-node.service.ports.httpQuery|int|`8000`|Service Port to expose Graph Node Query endpoint on|
|graph-node.service.ports.httpQueryws|int|`8001`|Service Port to expose Graph Node Websocket Query endpoint on|
|graph-node.service.ports.httpStatus|int|`8030`|Service Port to expose Graph Node Status endpoint on|
|graph-node.service.type|string|`"ClusterIP"`|Service type|
|graph-node.serviceAccount|object|-|Service account configuration|
|graph-node.serviceAccount.annotations|object|-|Annotations to add to the service account|
|graph-node.serviceAccount.create|bool|`true`|Specifies whether a service account should be created|
|graph-node.serviceAccount.name|string|`""`|The name of the service account to use. If not set and create is true, a name is generated using the fullname template|
|graph-node.store|object|-|Store configuration for Graph Node|
|graph-node.store.primary|object|-|Primary database shard configuration|
|graph-node.store.primary.connection|string|`"postgresql://${PRIMARY_SUBGRAPH_DATA_PGUSER}:${PRIMARY_SUBGRAPH_DATA_PGPASSWORD}@${PRIMARY_SUBGRAPH_DATA_PGHOST}:${PRIMARY_SUBGRAPH_DATA_PGPORT}/${PRIMARY_SUBGRAPH_DATA_PGDATABASE}"`|PostgreSQL connection string for primary shard|
|graph-node.store.primary.enabled|bool|`true`|Enable this store for Graph Node|
|graph-node.subgraph|object|-|Subgraph configuration shared with the bootstrap process|
|graph-node.subgraph.configMapName|string|`"besu-subgraph"`|ConfigMap providing the deployed subgraph hash|
|graph-node.terminationGracePeriodSeconds|int|`60`|Termination grace period seconds|
|graph-node.tolerations|list|-|Specify [tolerations](https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/)|
|hasura.actions|object|-|Action configuration|
|hasura.actions.baseUrl|string|`""`|Action base URL|
|hasura.actions.handlerWebhookBaseUrl|string|`""`|Action handler webhook base URL|
|hasura.adminSecret|object|-|Admin secret configuration|
|hasura.adminSecret.enabled|bool|`true`|Create admin secret|
|hasura.adminSecret.existingSecret|string|`""`|Use existing secret|
|hasura.adminSecret.existingSecretKey|string|`"admin-secret"`|Key in existing secret|
|hasura.adminSecret.key|string|`"atk"`|Admin secret key (auto-generated if empty)|
|hasura.affinity|object|-|Pod affinity|
|hasura.authHook|object|-|Authentication webhook configuration|
|hasura.authHook.enabled|bool|`false`|Enable auth webhook|
|hasura.authHook.mode|string|`"POST"`|Webhook mode (GET or POST)|
|hasura.authHook.url|string|`""`|Webhook URL|
|hasura.autoscaling|object|-|Horizontal pod autoscaler configuration|
|hasura.autoscaling.enabled|bool|`false`|Enable HPA|
|hasura.autoscaling.maxReplicas|int|`10`|Maximum replicas|
|hasura.autoscaling.minReplicas|int|`1`|Minimum replicas|
|hasura.autoscaling.targetCPUUtilizationPercentage|int|`80`|Target CPU utilization percentage|
|hasura.autoscaling.targetMemoryUtilizationPercentage|int|`80`|Target memory utilization percentage|
|hasura.config|object|-|Hasura configuration options|
|hasura.config.corsDomain|string|`"*"`|CORS domain configuration|
|hasura.config.devMode|bool|`true`|Enable development mode|
|hasura.config.disableCors|bool|`false`|Disable CORS|
|hasura.config.enableAllowlist|bool|`false`|Enable allowlist|
|hasura.config.enableConsole|bool|`true`|Enable console|
|hasura.config.enableConsoleAssets|bool|`true`|Enable console assets (for offline usage)|
|hasura.config.enableRemoteSchemaPermissions|bool|`false`|Enable remote schema permissions|
|hasura.config.enableTelemetry|bool|`false`|Enable telemetry|
|hasura.config.inferFunctionPermissions|bool|`true`|Infer function permissions|
|hasura.config.logLevel|string|`"info"`|Log level (debug, info, warn, error)|
|hasura.config.schemaIntrospectionDisabled|bool|`false`|Enable schema introspection for specified roles|
|hasura.config.serverPort|int|`8080`|Server port|
|hasura.config.wsKeepAlive|int|`5`|WebSocket keepalive interval (seconds)|
|hasura.cronTriggers|object|-|Cron triggers configuration|
|hasura.cronTriggers.includeInMetadata|bool|`false`|Include webhook secret in cron triggers|
|hasura.database|object|-|Database configuration|
|hasura.database.connLifetime|int|`600`|Connection lifetime (seconds)|
|hasura.database.connections|int|`50`|Maximum connections|
|hasura.database.database|string|`""`|Database name (uses global datastores if not set)|
|hasura.database.enablePooling|bool|`true`|Enable connection pooling|
|hasura.database.host|string|`""`|Database host (uses global datastores if not set)|
|hasura.database.idleTimeout|int|`180`|Idle timeout (seconds)|
|hasura.database.password|string|`""`|Database password (uses global datastores if not set)|
|hasura.database.port|int|`""`|Database port (uses global datastores if not set)|
|hasura.database.sslMode|string|`""`|SSL mode (uses global datastores if not set)|
|hasura.database.txIsolation|string|`"read-committed"`|Transaction isolation level (read-committed, repeatable-read, serializable)|
|hasura.database.usePreparedStatements|bool|`true`|Use prepared statements|
|hasura.database.username|string|`""`|Database username (uses global datastores if not set)|
|hasura.events|object|-|Events configuration|
|hasura.events.fetchInterval|int|`10`|Fetch interval for events (seconds)|
|hasura.extraEnvFrom|list|-|Additional environment variables from secrets/configmaps|
|hasura.extraEnvs|list|-|Additional environment variables|
|hasura.fullnameOverride|string|`""`|Override fullname for the chart|
|hasura.healthChecks|object|-|Health check configuration|
|hasura.healthChecks.livenessProbe|object|-|Liveness probe configuration|
|hasura.healthChecks.livenessProbe.enabled|bool|`true`|Enable liveness probe|
|hasura.healthChecks.livenessProbe.failureThreshold|int|`3`|Failure threshold|
|hasura.healthChecks.livenessProbe.httpGet|object|-|HTTP GET configuration|
|hasura.healthChecks.livenessProbe.httpGet.path|string|`"/healthz"`|Path for health check|
|hasura.healthChecks.livenessProbe.httpGet.port|string|`"http"`|Port name or number|
|hasura.healthChecks.livenessProbe.initialDelaySeconds|int|`30`|Initial delay seconds|
|hasura.healthChecks.livenessProbe.periodSeconds|int|`10`|Period seconds|
|hasura.healthChecks.livenessProbe.successThreshold|int|`1`|Success threshold|
|hasura.healthChecks.livenessProbe.timeoutSeconds|int|`5`|Timeout seconds|
|hasura.healthChecks.readinessProbe|object|-|Readiness probe configuration|
|hasura.healthChecks.readinessProbe.enabled|bool|`true`|Enable readiness probe|
|hasura.healthChecks.readinessProbe.failureThreshold|int|`3`|Failure threshold|
|hasura.healthChecks.readinessProbe.httpGet|object|-|HTTP GET configuration|
|hasura.healthChecks.readinessProbe.httpGet.path|string|`"/healthz"`|Path for health check|
|hasura.healthChecks.readinessProbe.httpGet.port|string|`"http"`|Port name or number|
|hasura.healthChecks.readinessProbe.initialDelaySeconds|int|`10`|Initial delay seconds|
|hasura.healthChecks.readinessProbe.periodSeconds|int|`10`|Period seconds|
|hasura.healthChecks.readinessProbe.successThreshold|int|`1`|Success threshold|
|hasura.healthChecks.readinessProbe.timeoutSeconds|int|`5`|Timeout seconds|
|hasura.healthChecks.startupProbe|object|-|Startup probe configuration|
|hasura.healthChecks.startupProbe.enabled|bool|`false`|Enable startup probe|
|hasura.healthChecks.startupProbe.failureThreshold|int|`30`|Failure threshold|
|hasura.healthChecks.startupProbe.httpGet|object|-|HTTP GET configuration|
|hasura.healthChecks.startupProbe.httpGet.path|string|`"/healthz"`|Path for health check|
|hasura.healthChecks.startupProbe.httpGet.port|string|`"http"`|Port name or number|
|hasura.healthChecks.startupProbe.initialDelaySeconds|int|`0`|Initial delay seconds|
|hasura.healthChecks.startupProbe.periodSeconds|int|`10`|Period seconds|
|hasura.healthChecks.startupProbe.successThreshold|int|`1`|Success threshold|
|hasura.healthChecks.startupProbe.timeoutSeconds|int|`5`|Timeout seconds|
|hasura.image|object|-|Hasura image configuration|
|hasura.image.pullPolicy|string|`"IfNotPresent"`|Hasura image pull policy|
|hasura.image.registry|string|`"docker.io"`|Hasura image registry|
|hasura.image.repository|string|`"hasura/graphql-engine"`|Hasura image repository|
|hasura.image.tag|string|`"v2.48.6"`|Hasura image tag|
|hasura.imagePullSecrets|list|-|Docker registry secret names as an array|
|hasura.ingress|object|-|Ingress configuration|
|hasura.ingress.annotations|object|-|Ingress annotations|
|hasura.ingress.className|string|`"atk-nginx"`|Ingress class name|
|hasura.ingress.enabled|bool|`true`|Enable ingress|
|hasura.ingress.extraHosts|list|-|Additional hosts|
|hasura.ingress.hostName|string|`"hasura.k8s.orb.local"`|Ingress hostname|
|hasura.ingress.path|string|`"/"`|Ingress path|
|hasura.ingress.pathType|string|`"Prefix"`|Ingress path type|
|hasura.ingress.tls|list|-|TLS configuration|
|hasura.initContainers|list|-|Init containers|
|hasura.initContainers[0]|string|`{"command":["/usr/bin/wait-for-it","postgresql:5432","-t","120"],"image":"ghcr.io/settlemint/btp-waitforit:v7.7.10","imagePullPolicy":"IfNotPresent","name":"wait-for-postgresql","resources":{"limits":{"cpu":"100m","memory":"64Mi"},"requests":{"cpu":"10m","memory":"32Mi"}}}`|Container name|
|hasura.initContainers[0].command|list|-|Container command|
|hasura.initContainers[0].image|string|`"ghcr.io/settlemint/btp-waitforit:v7.7.10"`|Container image|
|hasura.initContainers[0].imagePullPolicy|string|`"IfNotPresent"`|Image pull policy|
|hasura.initContainers[0].resources|object|-|Resource limits and requests|
|hasura.initContainers[0].resources.limits|object|-|Resource limits|
|hasura.initContainers[0].resources.limits.cpu|string|`"100m"`|CPU limit|
|hasura.initContainers[0].resources.limits.memory|string|`"64Mi"`|Memory limit|
|hasura.initContainers[0].resources.requests|object|-|Resource requests|
|hasura.initContainers[0].resources.requests.cpu|string|`"10m"`|CPU request|
|hasura.initContainers[0].resources.requests.memory|string|`"32Mi"`|Memory request|
|hasura.jwtSecrets|object|-|JWT secrets configuration|
|hasura.labels|object|-|Labels to add to all resources|
|hasura.metadata|object|-|Metadata database configuration|
|hasura.metadata.databaseUrl|string|`""`|Metadata database URL (defaults to main database if not set)|
|hasura.monitoring|object|-|Monitoring configuration|
|hasura.monitoring.enabled|bool|`false`|Enable Prometheus monitoring|
|hasura.monitoring.metricsSecret|string|`""`|Secret for metrics endpoint (optional)|
|hasura.monitoring.serviceMonitor|object|-|Service monitor configuration|
|hasura.monitoring.serviceMonitor.enabled|bool|`false`|Create ServiceMonitor resource|
|hasura.monitoring.serviceMonitor.interval|int|`"30s"`|Scrape interval|
|hasura.monitoring.serviceMonitor.labels|object|-|Additional labels for ServiceMonitor|
|hasura.monitoring.serviceMonitor.namespace|string|`""`|Monitoring namespace|
|hasura.monitoring.serviceMonitor.path|string|`"/v1/metrics"`|Metrics path|
|hasura.monitoring.serviceMonitor.scrapeTimeout|int|`"10s"`|Scrape timeout|
|hasura.nameOverride|string|`""`|Override name for the chart|
|hasura.networkPolicy|object|-|Network policy configuration|
|hasura.networkPolicy.egress|list|-|Egress rules|
|hasura.networkPolicy.enabled|bool|`false`|Enable network policy|
|hasura.networkPolicy.ingress|list|-|Ingress rules|
|hasura.networkPolicy.podSelector|list|-|Pod selector match labels|
|hasura.nodeSelector|object|-|Node selector|
|hasura.openShiftRoute|object|-|OpenShift Route configuration|
|hasura.openShiftRoute.alternateBackends|list|-|Alternate backends|
|hasura.openShiftRoute.annotations|object|-|Route annotations|
|hasura.openShiftRoute.enabled|bool|`false`|Enable OpenShift route|
|hasura.openShiftRoute.host|string|`"hasura.k8s.orb.local"`|Route hostname|
|hasura.openShiftRoute.path|string|`"/"`|Route path|
|hasura.openShiftRoute.tls|object|-|TLS configuration|
|hasura.openShiftRoute.to|object|-|Service weight configuration|
|hasura.openShiftRoute.to.weight|int|`100`|Weight for the service|
|hasura.openShiftRoute.wildcardPolicy|string|`"None"`|Wildcard policy|
|hasura.podAnnotations|object|-|Pod annotations|
|hasura.podDisruptionBudget|object|-|Pod disruption budget|
|hasura.podDisruptionBudget.enabled|bool|`false`|Enable PDB|
|hasura.podDisruptionBudget.maxUnavailable|int|`""`|Maximum unavailable pods|
|hasura.podDisruptionBudget.minAvailable|int|`1`|Minimum available pods|
|hasura.podLabels|object|-|Pod labels|
|hasura.podSecurityContext|object|-|Pod security context|
|hasura.priorityClassName|object|-|Priority class configuration|
|hasura.redis|object|-|Redis configuration for caching and rate limiting|
|hasura.redis.cacheDb|int|`""`|Redis database index for caching (uses global datastores if not set)|
|hasura.redis.cacheTtl|int|`60`|Cache TTL in seconds|
|hasura.redis.enabled|bool|`true`|Enable Redis integration|
|hasura.redis.host|string|`""`|Redis host (uses global datastores if not set)|
|hasura.redis.password|string|`""`|Redis password (uses global datastores if not set)|
|hasura.redis.port|int|`""`|Redis port (uses global datastores if not set)|
|hasura.redis.rateLimitDb|int|`""`|Redis database index for rate limiting (uses global datastores if not set)|
|hasura.redis.username|string|`""`|Redis username (uses global datastores if not set)|
|hasura.replicaCount|int|`1`|Number of Hasura replicas to deploy|
|hasura.resources|object|-|Resource limits and requests|
|hasura.securityContext|object|-|Container security context|
|hasura.service|object|-|Service configuration|
|hasura.service.annotations|object|-|Additional service annotations|
|hasura.service.labels|object|-|Additional service labels|
|hasura.service.nodePort|string|`""`|Node port (if type is NodePort)|
|hasura.service.port|int|`8080`|Service port|
|hasura.service.targetPort|int|`8080`|Target port|
|hasura.service.type|string|`"ClusterIP"`|Service type|
|hasura.serviceAccount|object|-|Service account configuration|
|hasura.serviceAccount.annotations|object|-|Annotations to add to the service account|
|hasura.serviceAccount.automount|bool|`false`|Automatically mount ServiceAccount's API credentials|
|hasura.serviceAccount.create|bool|`false`|Specifies whether a service account should be created|
|hasura.serviceAccount.name|string|`""`|The name of the service account to use|
|hasura.tolerations|list|-|Tolerations|
|hasura.topologySpreadConstraints|object|-|Topology spread constraints|
|hasura.unauthorizedRole|object|-|Unauthorized role configuration|
|hasura.volumeMounts|object|-|Volume mounts for the container|
|hasura.volumes|list|-|Volumes for the pod|
|ipfs.cluster|object|-|IPFS Cluster peer configuration|
|ipfs.cluster.affinity|object|-|Affinity|
|ipfs.cluster.containerSecurityContext|object|-|Container-level security context overrides|
|ipfs.cluster.extraContainers|list|-|Additional containers to inject into the pod|
|ipfs.cluster.extraEnv|list|-|Extra environment variables for the cluster container|
|ipfs.cluster.extraInitContainers|list|-|Additional init containers|
|ipfs.cluster.extraVolumeMounts|list|-|Additional volume mounts for the cluster container|
|ipfs.cluster.extraVolumes|object|-|Additional volumes for the pod|
|ipfs.cluster.image.pullPolicy|string|`"IfNotPresent"`|Cluster image pull policy|
|ipfs.cluster.image.registry|string|`"docker.io"`|Cluster image registry|
|ipfs.cluster.image.repository|string|`"ipfs/ipfs-cluster"`|Cluster image repository|
|ipfs.cluster.image.tag|string|`"v1.1.4"`|Cluster image tag|
|ipfs.cluster.nodeSelector|object|-|Node selector|
|ipfs.cluster.podAnnotations|object|-|Additional pod annotations|
|ipfs.cluster.podLabels|object|-|Additional pod labels|
|ipfs.cluster.podSecurityContext|object|-|Pod-level security context overrides|
|ipfs.cluster.resources|object|-|Resource requests and limits|
|ipfs.cluster.service.annotations|object|-|Additional annotations for the cluster service|
|ipfs.cluster.service.ports|object|-|Cluster service port configuration|
|ipfs.cluster.service.ports.api|int|`9094`|REST API port|
|ipfs.cluster.service.ports.metrics|int|`8888`|Prometheus metrics port|
|ipfs.cluster.service.ports.p2p|int|`9096`|Libp2p cluster port|
|ipfs.cluster.service.ports.pinning|int|`9097`|Pinning service HTTP port|
|ipfs.cluster.service.ports.proxy|int|`9095`|IPFS proxy port|
|ipfs.cluster.service.type|string|`"ClusterIP"`|Service type for the cluster REST API|
|ipfs.cluster.storage.storageClassName|string|`""`|StorageClass for the cluster data PVC|
|ipfs.cluster.storage.volumeSize|string|`"1Gi"`|Requested storage size for the cluster data PVC|
|ipfs.cluster.tolerations|list|-|Tolerations|
|ipfs.commonAnnotations|object|-|Annotations to add to all rendered manifests|
|ipfs.commonLabels|object|-|Labels to add to all rendered manifests|
|ipfs.fullnameOverride|string|`"ipfs"`|Override for generated full name|
|ipfs.imagePullSecrets|list|-|Image pull secrets applied to workload pods|
|ipfs.ingress|object|-|Ingress configuration for the cluster REST API|
|ipfs.ingress.className|string|`"atk-nginx"`|Ingress class name|
|ipfs.ingress.enabled|bool|`true`|Enable HTTP ingress for the cluster REST API|
|ipfs.ingress.hostnames|object|-|Hostnames mapped to path groups|
|ipfs.ingress.pathGroups|object|-|Path groups rendered for each hostname key|
|ipfs.ingress.tls|list|-|TLS configuration for the ingress|
|ipfs.ipfs|object|-|IPFS (Kubo) peer configuration|
|ipfs.ipfs.affinity|object|-|Affinity rules|
|ipfs.ipfs.bootstrap.includeProviderPeers|bool|`true`|Include providerPeers in bootstrap and peering configuration|
|ipfs.ipfs.bootstrap.nodePeers|list|-|Custom bootstrap peers added to the node. Objects must define ID and Addrs.|
|ipfs.ipfs.bootstrap.providerPeers|list|-|Default provider peers added when includeProviderPeers is true.|
|ipfs.ipfs.config|object|-|Runtime configuration applied through init script|
|ipfs.ipfs.config.addrFilters|list|-|Swarm.AddrFilters CIDR entries|
|ipfs.ipfs.config.api.httpHeaders.accessControlAllowHeaders|list|-|API.HTTPHeaders.Access-Control-Allow-Headers values|
|ipfs.ipfs.config.api.httpHeaders.accessControlAllowMethods|list|-|API.HTTPHeaders.Access-Control-Allow-Methods values|
|ipfs.ipfs.config.api.httpHeaders.accessControlAllowOrigin|list|-|API.HTTPHeaders.Access-Control-Allow-Origin values|
|ipfs.ipfs.config.appendAnnounce|list|-|Base Addresses.AppendAnnounce values. Entries are templated with Helm's tpl.|
|ipfs.ipfs.config.autoNATServiceMode|string|`"enabled"`|AutoNAT service mode|
|ipfs.ipfs.config.bloomFilterSize|int|`1048576`|Datastore bloom filter size|
|ipfs.ipfs.config.clusterPort|int|`9096`|Cluster libp2p port used for announcements|
|ipfs.ipfs.config.connMgr.gracePeriod|string|`"20s"`|Swarm.ConnMgr.GracePeriod duration|
|ipfs.ipfs.config.connMgr.highWater|int|`300`|Swarm.ConnMgr.HighWater threshold|
|ipfs.ipfs.config.connMgr.lowWater|int|`225`|Swarm.ConnMgr.LowWater threshold|
|ipfs.ipfs.config.datastore.storageMax|string|`""`|Datastore.StorageMax value (e.g. 10Gi). Leave empty to skip.|
|ipfs.ipfs.config.discovery.mdnsEnabled|bool|`true`|Discovery.MDNS.Enabled toggle|
|ipfs.ipfs.config.extraAppendAnnounce|list|-|Additional Addresses.AppendAnnounce entries appended after the defaults|
|ipfs.ipfs.config.gateway.publicGateways|object|-|Gateway.PublicGateways overrides|
|ipfs.ipfs.config.gateway.rootRedirect|string|`""`|Gateway.RootRedirect target|
|ipfs.ipfs.config.gatewayPort|int|`8888`|Gateway TCP port|
|ipfs.ipfs.config.noAnnounce|list|-|Addresses.NoAnnounce CIDR entries|
|ipfs.ipfs.config.profile|string|`"server"`|IPFS profile applied during initialization|
|ipfs.ipfs.config.resourceMgr.maxMemory|string|`""`|Swarm.ResourceMgr.MaxMemory value in bytes. Leave empty to skip.|
|ipfs.ipfs.config.routing.acceleratedDHTClient|bool|`true`|Routing.AcceleratedDHTClient toggle|
|ipfs.ipfs.config.swarm.disableNatPortMap|bool|`false`|Swarm.DisableNatPortMap toggle|
|ipfs.ipfs.config.swarm.enableHolePunching|bool|`false`|Swarm.EnableHolePunching toggle|
|ipfs.ipfs.config.swarm.relay.clientEnabled|bool|`false`|Swarm.RelayClient.Enabled toggle|
|ipfs.ipfs.config.swarm.relay.network|bool|`false`|Swarm.Transports.Network.Relay toggle|
|ipfs.ipfs.config.swarm.relay.serviceEnabled|bool|`false`|Swarm.RelayService.Enabled toggle|
|ipfs.ipfs.config.swarm.transports.quic|bool|`true`|Swarm.Transports.Network.QUIC toggle|
|ipfs.ipfs.config.swarmPort|int|`4001`|Swarm TCP port|
|ipfs.ipfs.containerSecurityContext|object|-|Container-level security context overrides|
|ipfs.ipfs.customCommand|list|-|Extra commands to override the default entrypoint|
|ipfs.ipfs.extraArgs|list|-|Additional arguments passed to the container command|
|ipfs.ipfs.extraContainers|list|-|Additional containers to inject into the pod|
|ipfs.ipfs.extraEnv|list|-|Additional environment variables for the IPFS container|
|ipfs.ipfs.extraVolumeMounts|list|-|Additional volume mounts for the IPFS container|
|ipfs.ipfs.extraVolumes|object|-|Additional volumes for the pod|
|ipfs.ipfs.image.pullPolicy|string|`"IfNotPresent"`|IPFS image pull policy|
|ipfs.ipfs.image.registry|string|`"docker.io"`|IPFS image registry|
|ipfs.ipfs.image.repository|string|`"ipfs/kubo"`|IPFS image repository|
|ipfs.ipfs.image.tag|string|`"v0.38.0"`|IPFS image tag|
|ipfs.ipfs.initContainers|list|-|Additional init containers|
|ipfs.ipfs.initScripts|map|-|Init scripts injected via ConfigMap (filename => script contents). Keys must match ^[A-Za-z0-9_.-]+$|
|ipfs.ipfs.nodeSelector|object|-|Node selector|
|ipfs.ipfs.podAnnotations|object|-|Additional pod annotations|
|ipfs.ipfs.podLabels|object|-|Additional pod labels|
|ipfs.ipfs.podSecurityContext|object|-|Pod-level security context overrides|
|ipfs.ipfs.resources|object|-|Resource requests and limits|
|ipfs.ipfs.runtime.goMemLimit|string|`""`|Optional GOMEMLIMIT value for the IPFS container (e.g. "1024MiB")|
|ipfs.ipfs.service.annotations|object|-|Additional annotations for the IPFS service|
|ipfs.ipfs.service.ports|object|-|Service ports exposed by the IPFS peers|
|ipfs.ipfs.service.ports.api|int|`5001`|API port|
|ipfs.ipfs.service.ports.gateway|int|`8080`|Gateway port|
|ipfs.ipfs.service.ports.mdns|int|`5353`|MDNS port|
|ipfs.ipfs.service.ports.swarmTcp|int|`4001`|Swarm TCP port|
|ipfs.ipfs.service.ports.swarmUdp|int|`4001`|Swarm UDP port|
|ipfs.ipfs.service.ports.ws|int|`8081`|Websocket port|
|ipfs.ipfs.service.type|string|`"ClusterIP"`|Service type for IPFS API/gateway|
|ipfs.ipfs.storage.storageClassName|string|`""`|StorageClass for the IPFS data PVC|
|ipfs.ipfs.storage.volumeSize|string|`"10Gi"`|Requested storage size for the IPFS data PVC|
|ipfs.ipfs.swarmKey.enabled|bool|`false`|Mount a swarm.key secret and copy it into the repo|
|ipfs.ipfs.swarmKey.mountPath|string|`"/etc/ipfs/swarm"`|Mount path for the swarm key secret inside the pod|
|ipfs.ipfs.swarmKey.repoPath|string|`"/data/ipfs"`|Destination directory for the swarm key inside the repo|
|ipfs.ipfs.swarmKey.secretKey|string|`"swarm.key"`|Key within the secret that holds the swarm key|
|ipfs.ipfs.swarmKey.secretName|string|`""`|Kubernetes secret name containing swarm.key|
|ipfs.ipfs.tolerations|list|-|Tolerations|
|ipfs.nameOverride|string|`""`|Override for chart name|
|ipfs.openShiftRoute|object|-|OpenShift route configuration|
|ipfs.openShiftRoute.annotations|object|-|Additional annotations merged into every Route|
|ipfs.openShiftRoute.enabled|bool|`false`|Enable OpenShift Routes instead of ingress|
|ipfs.openShiftRoute.host|string|`"ipfs-cluster.k8s.orb.local"`|Global host applied to every rendered Route (per-route host overrides are optional)|
|ipfs.openShiftRoute.routes|object|-|Route entries keyed by logical name; set enabled: false to skip a route|
|ipfs.openShiftRoute.tls|object|-|TLS configuration applied when TLS is desired|
|ipfs.openShiftRoute.wildcardPolicy|string|`"None"`|Wildcard policy used when a Route does not override it|
|ipfs.p2pNodePort|object|-|Configuration for the optional NodePort service used for public P2P addresses|
|ipfs.p2pNodePort.annotations|object|-|Additional annotations for the NodePort service|
|ipfs.p2pNodePort.enabled|bool|`false`|Enable creation of a NodePort service for the swarm port|
|ipfs.p2pNodePort.externalTrafficPolicy|string|`"Cluster"`|ExternalTrafficPolicy for the NodePort service|
|ipfs.p2pNodePort.hostIP.fieldPath|string|`"status.hostIP"`|Pod fieldRef used to resolve the host IP when value is empty|
|ipfs.p2pNodePort.hostIP.value|string|`""`|Optional static IP address to advertise. When set, overrides fieldRef detection.|
|ipfs.p2pNodePort.nodePort|int|`32000`|Static nodePort to announce when enabled|
|ipfs.replicaCount|int|`1`|Number of IPFS peers and cluster members|
|ipfs.serviceAccount|object|-|Service account configuration|
|ipfs.serviceAccount.annotations|object|-|Service account annotations|
|ipfs.serviceAccount.create|bool|`true`|Create the service account|
|ipfs.serviceAccount.name|string|`""`|Service account name override|
|ipfs.sharedSecret|string|`""`|Shared secret for cluster peers. Leave empty to auto-generate.|
|ipfs.tests|object|-|Test hook image configuration|
|ipfs.tests.image.pullPolicy|string|`"IfNotPresent"`|Test image pull policy|
|ipfs.tests.image.registry|string|`"docker.io"`|Test image registry|
|ipfs.tests.image.repository|string|`"busybox"`|Test image repository|
|ipfs.tests.image.tag|string|`"1.36"`|Test image tag|
|network.network-bootstrapper.affinity|object|-|Affinity and anti-affinity rules influencing pod placement.|
|network.network-bootstrapper.artifacts|object|-|Artifact sourcing controls for bootstrap data used by the nodes chart.|
|network.network-bootstrapper.artifacts.external|object|-|External artifact values used when `source` equals `external`.|
|network.network-bootstrapper.artifacts.external.faucet|object|-|Faucet account credentials stored in ConfigMaps and Secrets when `source` equals `external`.|
|network.network-bootstrapper.artifacts.external.faucet.address|string|`""`|Faucet account address stored in the `besu-faucet-address` ConfigMap when `source` equals `external`.|
|network.network-bootstrapper.artifacts.external.faucet.privateKey|string|`""`|Faucet private key stored in the `besu-faucet-private-key` Secret when `source` equals `external`.|
|network.network-bootstrapper.artifacts.external.faucet.publicKey|string|`""`|Faucet account public key stored in the `besu-faucet-pubkey` ConfigMap when `source` equals `external`.|
|network.network-bootstrapper.artifacts.external.genesis|object|-|Besu genesis document rendered into the `besu-genesis` ConfigMap when `source` equals `external`.|
|network.network-bootstrapper.artifacts.external.staticNodes|list|-|Collection of enode URIs persisted to the `besu-static-nodes` ConfigMap when `source` equals `external`.|
|network.network-bootstrapper.artifacts.external.validators|list|-|Validator node definitions providing the data expected by the nodes chart. Each entry must include `address`, `publicKey`, `privateKey`, and `enode`.|
|network.network-bootstrapper.artifacts.source|string|`"generated"`|Determines how Besu network artifacts are populated. Use `generated` to render the bootstrap Job on fresh installs or `external` to supply values manually.|
|network.network-bootstrapper.extraInitContainers|list|-|Additional init containers appended verbatim to the job pod spec.|
|network.network-bootstrapper.fullnameOverride|string|`"bootstrapper"`|Override for the fully qualified resource name generated by helpers.|
|network.network-bootstrapper.image|object|-|Container image configuration for the network bootstrapper.|
|network.network-bootstrapper.image.pullPolicy|string|`"IfNotPresent"`|Image pull policy controlling when Kubernetes fetches updated image layers.|
|network.network-bootstrapper.image.repository|string|`"ghcr.io/settlemint/network-bootstrapper"`|OCI registry path hosting the network bootstrapper image.|
|network.network-bootstrapper.image.tag|string|`"1.2.3"`|Image tag override; leave empty to inherit the chart appVersion.|
|network.network-bootstrapper.imagePullSecrets|list|-|Image pull secrets enabling access to private registries.|
|network.network-bootstrapper.initContainer|object|-|Init container configuration shared across the bootstrapper job.|
|network.network-bootstrapper.initContainer.tcpCheck|object|-|TCP health check init container that waits for dependencies to be ready.|
|network.network-bootstrapper.initContainer.tcpCheck.dependencies|list|-|TCP dependencies expressed as name/endpoint pairs (host:port strings).|
|network.network-bootstrapper.initContainer.tcpCheck.enabled|bool|`false`|Enable a tcp-check init container before the bootstrapper job starts.|
|network.network-bootstrapper.initContainer.tcpCheck.image|object|-|Container image configuration for the tcp-check init container.|
|network.network-bootstrapper.initContainer.tcpCheck.image.pullPolicy|string|`"IfNotPresent"`|Image pull policy for the tcp-check init container.|
|network.network-bootstrapper.initContainer.tcpCheck.image.repository|string|`"ghcr.io/settlemint/btp-waitforit"`|OCI image hosting the tcp-check utility.|
|network.network-bootstrapper.initContainer.tcpCheck.image.tag|string|`"v7.7.10"`|Image tag for the tcp-check utility.|
|network.network-bootstrapper.initContainer.tcpCheck.resources|object|-|CPU and memory resource constraints for the tcp-check init container.|
|network.network-bootstrapper.initContainer.tcpCheck.resources.limits|object|-|Maximum resource limits for the tcp-check init container.|
|network.network-bootstrapper.initContainer.tcpCheck.resources.limits.cpu|string|`"100m"`|Maximum CPU allocation for the tcp-check init container.|
|network.network-bootstrapper.initContainer.tcpCheck.resources.limits.memory|string|`"64Mi"`|Maximum memory allocation for the tcp-check init container.|
|network.network-bootstrapper.initContainer.tcpCheck.resources.requests|object|-|Minimum resource requests for the tcp-check init container.|
|network.network-bootstrapper.initContainer.tcpCheck.resources.requests.cpu|string|`"10m"`|Minimum CPU request for the tcp-check init container.|
|network.network-bootstrapper.initContainer.tcpCheck.resources.requests.memory|string|`"32Mi"`|Minimum memory request for the tcp-check init container.|
|network.network-bootstrapper.initContainer.tcpCheck.timeout|int|`120`|Timeout in seconds applied to each dependency probe.|
|network.network-bootstrapper.nameOverride|string|`""`|Override for the short release name used by name templates.|
|network.network-bootstrapper.nodeSelector|object|-|Node selector constraints for scheduling the bootstrapper pod.|
|network.network-bootstrapper.podAnnotations|object|-|Additional annotations merged onto the bootstrapper pod template.|
|network.network-bootstrapper.podLabels|object|-|Extra labels merged onto the bootstrapper pod template.|
|network.network-bootstrapper.podSecurityContext|object|-|Pod-level security context applied to all containers in the pod.|
|network.network-bootstrapper.rbac|object|-|RBAC settings that provision Role and RoleBinding for Kubernetes output.|
|network.network-bootstrapper.rbac.create|bool|`true`|Render Role and RoleBinding resources tied to the ServiceAccount.|
|network.network-bootstrapper.resources|object|-|CPU and memory requests or limits for the bootstrapper container.|
|network.network-bootstrapper.securityContext|object|-|Container security context applied to the bootstrapper container.|
|network.network-bootstrapper.serviceAccount|object|-|ServiceAccount configuration associated with the bootstrapper job.|
|network.network-bootstrapper.serviceAccount.annotations|object|-|Metadata annotations applied to the ServiceAccount.|
|network.network-bootstrapper.serviceAccount.automount|bool|`true`|Mount the ServiceAccount token into the bootstrapper pod.|
|network.network-bootstrapper.serviceAccount.create|bool|`true`|Create a ServiceAccount resource for the release automatically.|
|network.network-bootstrapper.serviceAccount.name|string|`""`|Existing ServiceAccount name to reuse instead of creating one.|
|network.network-bootstrapper.settings|object|-|Settings passed to the network-bootstrapper CLI executed by the job.|
|network.network-bootstrapper.settings.allocations|string|`nil`|Path to a JSON allocations file providing pre-funded accounts.|
|network.network-bootstrapper.settings.chainId|int|`nil`|Explicit chain ID to encode into the genesis file. Leave unset to inherit from global.chainId.|
|network.network-bootstrapper.settings.clusterDomain|string|`"svc.cluster.local"`|Kubernetes DNS suffix appended to generated static node hostnames when unset by the CLI.|
|network.network-bootstrapper.settings.consensus|string|`nil`|Consensus engine to configure (QBFT or IBFTv2).|
|network.network-bootstrapper.settings.contractSizeLimit|int|`nil`|Maximum smart-contract bytecode size accepted by the EVM.|
|network.network-bootstrapper.settings.defaultStaticNodeDiscoveryPort|int|`30303`|Default UDP discovery port used in generated enode URIs when no override is provided.|
|network.network-bootstrapper.settings.defaultStaticNodePort|int|`30303`|Default TCP P2P port used in generated enode URIs when no override is provided.|
|network.network-bootstrapper.settings.evmStackSize|int|`nil`|Maximum EVM stack size permitted for contract execution.|
|network.network-bootstrapper.settings.faucetArtifactPrefix|string|`nil`|Prefix used for faucet ConfigMaps and Secrets.|
|network.network-bootstrapper.settings.gasLimit|int|`nil`|Genesis block gas limit expressed as a decimal number.|
|network.network-bootstrapper.settings.gasPrice|int|`nil`|Base gas price in wei applied across the network.|
|network.network-bootstrapper.settings.genesisConfigMapName|string|`nil`|ConfigMap name storing the generated genesis.json payload.|
|network.network-bootstrapper.settings.outputType|string|`"kubernetes"`|Output target for generated artefacts: screen, file, or kubernetes.|
|network.network-bootstrapper.settings.secondsPerBlock|int|`nil`|Block interval in seconds for the genesis configuration.|
|network.network-bootstrapper.settings.staticNodeDiscoveryPort|int|`nil`|UDP discovery port embedded in static node enode URIs.|
|network.network-bootstrapper.settings.staticNodeDomain|string|`nil`|DNS suffix appended to generated static node hostnames.|
|network.network-bootstrapper.settings.staticNodeNamespace|string|`nil`|Namespace component inserted between service name and domain in static node hostnames.|
|network.network-bootstrapper.settings.staticNodePodPrefix|string|`nil`|StatefulSet prefix applied to validator pod hostnames.|
|network.network-bootstrapper.settings.staticNodePort|int|`nil`|TCP P2P port embedded in static node enode URIs.|
|network.network-bootstrapper.settings.staticNodeServiceName|string|`nil`|Headless Service name used when constructing static node hostnames.|
|network.network-bootstrapper.settings.staticNodesConfigMapName|string|`nil`|ConfigMap name storing the generated static-nodes.json payload.|
|network.network-bootstrapper.settings.validators|int|`nil`|Number of validator identities to generate (default 4).|
|network.network-bootstrapper.subgraph|object|-|Subgraph handling controls for fallback scenarios.|
|network.network-bootstrapper.subgraph.fallbackHash|string|`"QmRU9F9d7kuDVVzqVF5ig1SibWSEWLYvurR8yz7dyrEUnx"`|IPFS hash used when the artifacts image does not contain subgraph metadata.|
|network.network-bootstrapper.tolerations|list|-|Tolerations allowing the bootstrapper pod onto tainted nodes.|
|network.network-bootstrapper.volumeMounts|list|-|Extra volume mounts applied to the bootstrapper container.|
|network.network-bootstrapper.volumes|list|-|Additional volumes attached to the bootstrapper pod.|
|network.network-nodes.affinity|object|-|Node and pod affinity or anti-affinity rules affecting scheduling decisions.|
|network.network-nodes.config|object|-|Core Besu configuration persisted as besu.conf for both validators and RPC nodes.|
|network.network-nodes.config.bonsaiLimitTrieLogsEnabled|bool|`false`|Emit Bonsai limit trie logs for debugging state transitions.|
|network.network-nodes.config.cacheLastBlocks|int|`1024`|Number of recent blocks cached in memory.|
|network.network-nodes.config.dataStorageFormat|string|`"FOREST"`|Ledger storage backend (FOREST or BONSAI).|
|network.network-nodes.config.genesisFile|string|`"/etc/besu/genesis.json"`|Filesystem path where Besu loads the merged genesis JSON produced at runtime.|
|network.network-nodes.config.graphql|object|-|GraphQL server configuration.|
|network.network-nodes.config.graphql.corsOrigins|list|-|Allowed CORS origins for GraphQL requests.|
|network.network-nodes.config.graphql.enabled|bool|`true`|Enable the GraphQL API server.|
|network.network-nodes.config.graphql.host|string|`"0.0.0.0"`|Network interface for the GraphQL server.|
|network.network-nodes.config.hostAllowlist|list|-|Hostnames allowed to access the RPC interfaces; `*` permits all.|
|network.network-nodes.config.http|object|-|HTTP JSON-RPC server configuration.|
|network.network-nodes.config.http.api|list|-|Enabled JSON-RPC API namespaces exposed over HTTP.|
|network.network-nodes.config.http.authenticationEnabled|bool|`false`|Enable JWT authentication for HTTP JSON-RPC requests.|
|network.network-nodes.config.http.corsOrigins|list|-|Allowed CORS origins for HTTP JSON-RPC requests.|
|network.network-nodes.config.http.enabled|bool|`true`|Enable the HTTP JSON-RPC listener.|
|network.network-nodes.config.http.host|string|`"0.0.0.0"`|Network interface for the HTTP JSON-RPC listener.|
|network.network-nodes.config.http.maxActiveConnections|int|`2000`|Maximum concurrent HTTP JSON-RPC connections.|
|network.network-nodes.config.http.maxBatchSize|int|`512`|Maximum number of batched JSON-RPC calls per request.|
|network.network-nodes.config.http.maxRequestContentLength|int|`524288000`|Maximum HTTP request body size in bytes.|
|network.network-nodes.config.logFormat|string|`"plain"`|Log output format. Supports "plain" (default) or "json".|
|network.network-nodes.config.logging|string|`"INFO"`|Log verbosity level for Besu components.|
|network.network-nodes.config.metrics|object|-|Prometheus metrics export configuration.|
|network.network-nodes.config.metrics.categories|list|-|Metrics categories exposed to Prometheus.|
|network.network-nodes.config.metrics.enabled|bool|`true`|Enable the Prometheus metrics endpoint.|
|network.network-nodes.config.metrics.host|string|`"0.0.0.0"`|Network interface for the metrics endpoint.|
|network.network-nodes.config.minGasPrice|int|`0`|Minimum gas price accepted for transactions (wei).|
|network.network-nodes.config.p2p|object|-|Peer-to-peer networking settings.|
|network.network-nodes.config.p2p.discoveryEnabled|bool|`true`|Enable the discovery protocol for automatic peer finding.|
|network.network-nodes.config.p2p.enabled|bool|`true`|Enable the devp2p networking subsystem.|
|network.network-nodes.config.p2p.interface|string|`"0.0.0.0"`|Network interface the P2P server binds to.|
|network.network-nodes.config.p2p.maxPeers|int|`25`|Maximum simultaneous peer connections.|
|network.network-nodes.config.p2p.staticNodesFile|string|`"/etc/besu/static-nodes.json"`|Path to the static-nodes.json file providing fixed peers.|
|network.network-nodes.config.privateKeyFilename|string|`"privateKey"`|Filename containing each node's private key within mounted secrets.|
|network.network-nodes.config.randomPeerPriorityEnabled|bool|`true`|Randomise peer priority to avoid deterministic ordering.|
|network.network-nodes.config.receiptCompactionEnabled|bool|`true`|Enable receipt compaction to reduce disk usage.|
|network.network-nodes.config.remoteConnectionsLimitEnabled|bool|`false`|Enable limits on concurrent remote JSON-RPC connections.|
|network.network-nodes.config.revertReasonEnabled|bool|`true`|Include revert reasons in RPC responses when failures occur.|
|network.network-nodes.config.rpc|object|-|JSON-RPC subsystem configuration shared by HTTP and WebSocket servers.|
|network.network-nodes.config.rpc.txFeecap|int|`0`|Maximum fee per gas accepted for transactions submitted via RPC (0 disables the cap).|
|network.network-nodes.config.sync|object|-|Chain synchronisation controls.|
|network.network-nodes.config.sync.minPeers|int|`1`|Minimum number of peers required before synchronisation starts.|
|network.network-nodes.config.sync.mode|string|`"FULL"`|Synchronisation mode (FULL, FAST, SNAP, etc.).|
|network.network-nodes.config.txPool|object|-|Transaction pool configuration for ingress and prioritisation.|
|network.network-nodes.config.txPool.enableSaveRestore|bool|`true`|Persist the transaction pool to disk between restarts.|
|network.network-nodes.config.txPool.limitByAccountPercentage|int|`1`|Maximum percentage of the pool allowed per account.|
|network.network-nodes.config.txPool.maxSize|int|`100000`|Maximum transactions retained in the pool.|
|network.network-nodes.config.txPool.noLocalPriority|bool|`true`|Disable preferential treatment of locally submitted transactions.|
|network.network-nodes.config.txPool.type|string|`"SEQUENCED"`|Transaction ordering strategy (e.g., SEQUENCED).|
|network.network-nodes.config.ws|object|-|WebSocket JSON-RPC server configuration.|
|network.network-nodes.config.ws.api|list|-|Enabled JSON-RPC API namespaces exposed over WebSockets.|
|network.network-nodes.config.ws.authenticationEnabled|bool|`false`|Enable JWT authentication for WebSocket requests.|
|network.network-nodes.config.ws.enabled|bool|`true`|Enable the WebSocket JSON-RPC listener.|
|network.network-nodes.config.ws.host|string|`"0.0.0.0"`|Network interface for the WebSocket listener.|
|network.network-nodes.config.ws.maxActiveConnections|int|`2000`|Maximum concurrent WebSocket connections.|
|network.network-nodes.config.ws.maxFrameSize|int|`2097152`|Maximum WebSocket frame size in bytes.|
|network.network-nodes.extraInitContainers|list|-|Additional init containers appended verbatim to both StatefulSets.|
|network.network-nodes.fullnameOverride|string|`"besu-node"`|Override for the fully qualified release name used in resource naming.|
|network.network-nodes.httpRoute|object|-|Gateway API HTTPRoute configuration for clusters with gateway-api controllers.|
|network.network-nodes.httpRoute.annotations|object|-|Metadata annotations applied to the HTTPRoute.|
|network.network-nodes.httpRoute.enabled|bool|`false`|Enable rendering of an HTTPRoute resource.|
|network.network-nodes.httpRoute.hostnames|list|-|HTTP hostnames matched by the route.|
|network.network-nodes.httpRoute.parentRefs|list|-|Gateway references that should accept this route.|
|network.network-nodes.httpRoute.parentRefs[0].name|string|`"gateway"`|Gateway name.|
|network.network-nodes.httpRoute.parentRefs[0].sectionName|string|`"http"`|Listener section name within the Gateway.|
|network.network-nodes.httpRoute.rules|list|-|Rules containing matches and optional filters evaluated by the Gateway.|
|network.network-nodes.httpRoute.rules[0].matches|list|-|Match conditions evaluated for each request.|
|network.network-nodes.httpRoute.rules[0].matches[0].path|object|-|Path matching condition for the request.|
|network.network-nodes.httpRoute.rules[0].matches[0].path.type|string|`"PathPrefix"`|Path match type (Exact, PathPrefix, or RegularExpression).|
|network.network-nodes.httpRoute.rules[0].matches[0].path.value|string|`"/headers"`|Path value used when evaluating the request URL.|
|network.network-nodes.image|object|-|Container image configuration shared by validator and RPC pods.|
|network.network-nodes.image.pullPolicy|string|`"IfNotPresent"`|Kubernetes image pull policy for Besu containers.|
|network.network-nodes.image.repository|string|`"docker.io/hyperledger/besu"`|OCI image repository hosting Hyperledger Besu.|
|network.network-nodes.image.tag|string|`"25.9.0"`|Specific Besu image tag to deploy.|
|network.network-nodes.imagePullSecrets|list|-|Image pull secrets granting registry access for the Besu image.|
|network.network-nodes.ingress|object|-|Ingress configuration used to expose RPC services via Kubernetes Ingress resources.|
|network.network-nodes.ingress.annotations|object|-|Metadata annotations applied to the Ingress resource.|
|network.network-nodes.ingress.className|string|`""`|ingressClassName assigned to the Ingress for controller selection.|
|network.network-nodes.ingress.enabled|bool|`false`|Enable creation of an Ingress resource.|
|network.network-nodes.ingress.hosts|list|-|Hostname and path routing rules for the Ingress.|
|network.network-nodes.ingress.hosts[0].host|string|`"chart-example.local"`|Hostname for the Ingress rule.|
|network.network-nodes.ingress.hosts[0].paths|list|-|Path-based routing rules for the host.|
|network.network-nodes.ingress.hosts[0].paths[0].path|string|`"/"`|URL path prefix.|
|network.network-nodes.ingress.hosts[0].paths[0].pathType|string|`"ImplementationSpecific"`|Path matching type (Exact, Prefix, or ImplementationSpecific).|
|network.network-nodes.ingress.tls|list|-|TLS configuration for Ingress hosts.|
|network.network-nodes.initContainer|object|-|Init container configuration shared across validator and RPC workloads.|
|network.network-nodes.initContainer.compileGenesis|object|-|Compile-genesis init container configuration for merging allocation ConfigMaps.|
|network.network-nodes.initContainer.compileGenesis.enabled|bool|`true`|Enable the compile-genesis init container that merges allocation ConfigMaps into the runtime genesis file.|
|network.network-nodes.initContainer.compileGenesis.image|object|-|Container image configuration for the compile-genesis init container.|
|network.network-nodes.initContainer.compileGenesis.image.pullPolicy|string|`"IfNotPresent"`|Image pull policy for the compile-genesis init container.|
|network.network-nodes.initContainer.compileGenesis.image.repository|string|`"ghcr.io/settlemint/network-bootstrapper"`|OCI image hosting the network-bootstrapper CLI used for genesis compilation.|
|network.network-nodes.initContainer.compileGenesis.image.tag|string|`"1.2.3"`|Image tag for the network-bootstrapper CLI.|
|network.network-nodes.initContainer.compileGenesis.outputPath|string|`""`|Filesystem path populated with the compiled genesis JSON. Leave empty to mirror config.genesisFile.|
|network.network-nodes.initContainer.compileGenesis.resources|object|-|Optional Kubernetes resource requests/limits for the compile-genesis init container.|
|network.network-nodes.initContainer.tcpCheck|object|-|TCP check init container configuration for validating service dependencies.|
|network.network-nodes.initContainer.tcpCheck.dependencies|list|-|TCP dependencies expressed as name/endpoint pairs (host:port strings).|
|network.network-nodes.initContainer.tcpCheck.enabled|bool|`false`|Enable a tcp-check init container before Besu pods start.|
|network.network-nodes.initContainer.tcpCheck.image|object|-|Container image configuration for the tcp-check init container.|
|network.network-nodes.initContainer.tcpCheck.image.pullPolicy|string|`"IfNotPresent"`|Image pull policy for the tcp-check init container.|
|network.network-nodes.initContainer.tcpCheck.image.repository|string|`"ghcr.io/settlemint/btp-waitforit"`|OCI image hosting the tcp-check utility.|
|network.network-nodes.initContainer.tcpCheck.image.tag|string|`"v7.7.10"`|Image tag for the tcp-check utility.|
|network.network-nodes.initContainer.tcpCheck.resources|object|-|Resource requests and limits for the tcp-check init container.|
|network.network-nodes.initContainer.tcpCheck.resources.limits|object|-|Maximum resource limits.|
|network.network-nodes.initContainer.tcpCheck.resources.limits.cpu|string|`"100m"`|CPU limit.|
|network.network-nodes.initContainer.tcpCheck.resources.limits.memory|string|`"64Mi"`|Memory limit.|
|network.network-nodes.initContainer.tcpCheck.resources.requests|object|-|Minimum resource requests.|
|network.network-nodes.initContainer.tcpCheck.resources.requests.cpu|string|`"10m"`|CPU request.|
|network.network-nodes.initContainer.tcpCheck.resources.requests.memory|string|`"32Mi"`|Memory request.|
|network.network-nodes.initContainer.tcpCheck.timeout|int|`120`|Timeout in seconds applied to each dependency probe.|
|network.network-nodes.livenessProbe|object|-|Liveness probe configuration ensuring containers restart when unhealthy.|
|network.network-nodes.livenessProbe.failureThreshold|int|`3`|Consecutive failures required before the container is restarted.|
|network.network-nodes.livenessProbe.httpGet|object|-|HTTP GET probe configuration hitting the Besu liveness endpoint.|
|network.network-nodes.livenessProbe.httpGet.path|string|`"/readiness?minPeers=1&maxBlocksBehind=10000"`|HTTP path used for liveness probing.|
|network.network-nodes.livenessProbe.httpGet.port|string|int|`"json-rpc"`|Target container port serving the liveness endpoint.|
|network.network-nodes.livenessProbe.initialDelaySeconds|int|`30`|Seconds to wait before starting liveness checks.|
|network.network-nodes.livenessProbe.periodSeconds|int|`10`|Frequency of liveness checks in seconds.|
|network.network-nodes.livenessProbe.timeoutSeconds|int|`2`|Timeout in seconds before marking the probe as failed.|
|network.network-nodes.nameOverride|string|`""`|Override for the short chart name used in resource naming.|
|network.network-nodes.networkPolicy|object|-|NetworkPolicy configuration applied to Besu pods.|
|network.network-nodes.networkPolicy.annotations|object|-|Additional annotations to add to the NetworkPolicy metadata.|
|network.network-nodes.networkPolicy.egress|list|-|NetworkPolicy egress rules. Leave empty to deny all egress when enabled.|
|network.network-nodes.networkPolicy.egress[0]|object|-|Allow DNS resolution for outbound hosts.|
|network.network-nodes.networkPolicy.egress[0].ports|list|-|DNS port configuration.|
|network.network-nodes.networkPolicy.egress[0].ports[0].port|int|`53`|DNS port number.|
|network.network-nodes.networkPolicy.egress[0].ports[0].protocol|string|`"UDP"`|Protocol type for DNS (UDP).|
|network.network-nodes.networkPolicy.egress[0].to|list|-|Destination selectors for DNS egress.|
|network.network-nodes.networkPolicy.egress[0].to[0].namespaceSelector|object|-|Namespace selector for DNS pods (empty matches all namespaces).|
|network.network-nodes.networkPolicy.egress[0].to[0].podSelector|object|-|Pod selector for kube-dns pods.|
|network.network-nodes.networkPolicy.egress[0].to[0].podSelector.matchLabels|object|-|Label matchers selecting kube-dns pods.|
|network.network-nodes.networkPolicy.egress[0].to[0].podSelector.matchLabels.k8s-app|string|`"kube-dns"`|Kubernetes DNS application label.|
|network.network-nodes.networkPolicy.egress[1]|object|-|Permit Besu pods to speak to peers inside the namespace.|
|network.network-nodes.networkPolicy.egress[1].ports|list|-|P2P port for internal communication.|
|network.network-nodes.networkPolicy.egress[1].ports[0].port|int|`30303`|RLPx P2P port number.|
|network.network-nodes.networkPolicy.egress[1].ports[0].protocol|string|`"TCP"`|Protocol type for internal P2P.|
|network.network-nodes.networkPolicy.egress[1].to|list|-|Destination pod selectors for internal P2P egress.|
|network.network-nodes.networkPolicy.egress[1].to[0].podSelector|object|-|Pod selector for Besu StatefulSet pods.|
|network.network-nodes.networkPolicy.egress[1].to[0].podSelector.matchLabels|object|-|Label matchers selecting Besu StatefulSet pods.|
|network.network-nodes.networkPolicy.egress[1].to[0].podSelector.matchLabels."app.kubernetes.io/name"|string|`"besu-statefulset"`|Application name label for Besu StatefulSet.|
|network.network-nodes.networkPolicy.egress[2]|object|-|Allow outbound P2P connections to external peers (public networks).|
|network.network-nodes.networkPolicy.egress[2].ports|list|-|P2P port for external communication.|
|network.network-nodes.networkPolicy.egress[2].ports[0].port|int|`30303`|RLPx P2P port number.|
|network.network-nodes.networkPolicy.egress[2].ports[0].protocol|string|`"TCP"`|Protocol type for external P2P.|
|network.network-nodes.networkPolicy.egress[2].to|list|-|IP block selectors for external P2P egress.|
|network.network-nodes.networkPolicy.egress[2].to[0].ipBlock|object|-|IP block configuration for external network access.|
|network.network-nodes.networkPolicy.egress[2].to[0].ipBlock.cidr|string|`"0.0.0.0/0"`|CIDR range allowing all external IPs.|
|network.network-nodes.networkPolicy.egress[2].to[0].ipBlock.except|list|-|Exception list blocking private IP ranges from egress.|
|network.network-nodes.networkPolicy.egress[2].to[0].ipBlock.except[0]|string|`"10.0.0.0/8"`|Private IP range 10.0.0.0/8.|
|network.network-nodes.networkPolicy.egress[2].to[0].ipBlock.except[1]|string|`"172.16.0.0/12"`|Private IP range 172.16.0.0/12.|
|network.network-nodes.networkPolicy.egress[2].to[0].ipBlock.except[2]|string|`"192.168.0.0/16"`|Private IP range 192.168.0.0/16.|
|network.network-nodes.networkPolicy.enabled|bool|`false`|Create a NetworkPolicy restricting Besu pod ingress and egress.|
|network.network-nodes.networkPolicy.ingress|list|-|NetworkPolicy ingress rules. Leave empty to deny all ingress when enabled.|
|network.network-nodes.networkPolicy.ingress[0]|object|-|Allow blockchain clients to reach RPC, WS, GraphQL, and metrics endpoints.|
|network.network-nodes.networkPolicy.ingress[0].from|list|-|Source pod selectors allowed to connect to Besu services.|
|network.network-nodes.networkPolicy.ingress[0].from[0].podSelector|object|-|Pod selector allowing txsigner pods ingress access.|
|network.network-nodes.networkPolicy.ingress[0].from[0].podSelector.matchLabels|object|-|Label matchers selecting txsigner pods.|
|network.network-nodes.networkPolicy.ingress[0].from[0].podSelector.matchLabels."app.kubernetes.io/name"|string|`"txsigner"`|Application name label for txsigner.|
|network.network-nodes.networkPolicy.ingress[0].from[1].podSelector|object|-|Pod selector allowing erpc pods ingress access.|
|network.network-nodes.networkPolicy.ingress[0].from[1].podSelector.matchLabels|object|-|Label matchers selecting erpc pods.|
|network.network-nodes.networkPolicy.ingress[0].from[1].podSelector.matchLabels."app.kubernetes.io/name"|string|`"erpc"`|Application name label for erpc.|
|network.network-nodes.networkPolicy.ingress[0].from[2].podSelector|object|-|Pod selector allowing blockscout-stack pods ingress access.|
|network.network-nodes.networkPolicy.ingress[0].from[2].podSelector.matchLabels|object|-|Label matchers selecting blockscout-stack pods.|
|network.network-nodes.networkPolicy.ingress[0].from[2].podSelector.matchLabels."app.kubernetes.io/name"|string|`"blockscout-stack"`|Application name label for blockscout-stack.|
|network.network-nodes.networkPolicy.ingress[0].from[3].podSelector|object|-|Pod selector allowing graph-node pods ingress access.|
|network.network-nodes.networkPolicy.ingress[0].from[3].podSelector.matchLabels|object|-|Label matchers selecting graph-node pods.|
|network.network-nodes.networkPolicy.ingress[0].from[3].podSelector.matchLabels."app.kubernetes.io/name"|string|`"graph-node"`|Application name label for graph-node.|
|network.network-nodes.networkPolicy.ingress[0].ports|list|-|Target ports exposed to the selected sources.|
|network.network-nodes.networkPolicy.ingress[0].ports[0].port|int|`8545`|HTTP JSON-RPC port number.|
|network.network-nodes.networkPolicy.ingress[0].ports[0].protocol|string|`"TCP"`|Protocol type for HTTP JSON-RPC port.|
|network.network-nodes.networkPolicy.ingress[0].ports[1].port|int|`8546`|WebSocket JSON-RPC port number.|
|network.network-nodes.networkPolicy.ingress[0].ports[1].protocol|string|`"TCP"`|Protocol type for WebSocket JSON-RPC port.|
|network.network-nodes.networkPolicy.ingress[0].ports[2].port|int|`8547`|GraphQL API port number.|
|network.network-nodes.networkPolicy.ingress[0].ports[2].protocol|string|`"TCP"`|Protocol type for GraphQL API port.|
|network.network-nodes.networkPolicy.ingress[0].ports[3].port|int|`9545`|Prometheus metrics port number.|
|network.network-nodes.networkPolicy.ingress[0].ports[3].protocol|string|`"TCP"`|Protocol type for metrics port.|
|network.network-nodes.networkPolicy.ingress[1]|object|-|Permit intra-cluster P2P traffic among Besu nodes.|
|network.network-nodes.networkPolicy.ingress[1].from|list|-|Source pod selectors for P2P communication.|
|network.network-nodes.networkPolicy.ingress[1].from[0].podSelector|object|-|Pod selector for Besu StatefulSet pods.|
|network.network-nodes.networkPolicy.ingress[1].from[0].podSelector.matchLabels|object|-|Label matchers selecting Besu StatefulSet pods.|
|network.network-nodes.networkPolicy.ingress[1].from[0].podSelector.matchLabels."app.kubernetes.io/name"|string|`"besu-statefulset"`|Application name label for Besu StatefulSet.|
|network.network-nodes.networkPolicy.ingress[1].ports|list|-|P2P port exposed to Besu peers.|
|network.network-nodes.networkPolicy.ingress[1].ports[0].port|int|`30303`|RLPx P2P port number.|
|network.network-nodes.networkPolicy.ingress[1].ports[0].protocol|string|`"TCP"`|Protocol type for P2P port.|
|network.network-nodes.networkPolicy.labels|object|-|Additional labels to add to the NetworkPolicy metadata.|
|network.network-nodes.networkPolicy.podSelector|object|-|Optional override for the default pod selector; defaults to Besu workload labels when empty.|
|network.network-nodes.networkPolicy.policyTypes|list|-|Policy types enforced by the NetworkPolicy. When empty, inferred from ingress/egress rules or defaults to both.|
|network.network-nodes.nodeSelector|object|-|Node selector constraints influencing where Besu pods can schedule.|
|network.network-nodes.openShiftRoute|object|-|OpenShift Route configuration for exposing services through the OpenShift router.|
|network.network-nodes.openShiftRoute.alternateBackends|list|-|Additional backend references to balance traffic across services.|
|network.network-nodes.openShiftRoute.annotations|object|-|Metadata annotations applied to the Route.|
|network.network-nodes.openShiftRoute.enabled|bool|`false`|Enable creation of an OpenShift Route resource.|
|network.network-nodes.openShiftRoute.host|string|`""`|Desired external hostname for the Route; leave empty for automatic assignment.|
|network.network-nodes.openShiftRoute.path|string|`""`|URL path prefix handled by the Route.|
|network.network-nodes.openShiftRoute.port|object|-|Target service port configuration for the Route.|
|network.network-nodes.openShiftRoute.port.targetPort|string|`"http"`|Named service port exposed through the Route.|
|network.network-nodes.openShiftRoute.tls|object|null|`nil`|TLS termination settings; set to null to disable TLS.|
|network.network-nodes.openShiftRoute.to|object|-|Primary backend configuration for the Route.|
|network.network-nodes.openShiftRoute.to.weight|int|`100`|Backend weight determining traffic distribution.|
|network.network-nodes.openShiftRoute.wildcardPolicy|string|`""`|Wildcard policy controlling subdomain routing (None or Subdomain).|
|network.network-nodes.persistence|object|-|Persistent storage configuration for both validator and RPC StatefulSets.|
|network.network-nodes.persistence.accessModes|list|-|Requested access modes for the PersistentVolumeClaim.|
|network.network-nodes.persistence.annotations|object|-|Metadata annotations applied to generated PVCs.|
|network.network-nodes.persistence.enabled|bool|`true`|Enable persistent volume claims for ledger data.|
|network.network-nodes.persistence.existingClaim|string|`""`|Name of an existing PersistentVolumeClaim to reuse instead of creating new PVCs.|
|network.network-nodes.persistence.mountPath|string|`"/data"`|Container path where the persistent volume is mounted.|
|network.network-nodes.persistence.readOnly|bool|`false`|Mount the volume read-only when true.|
|network.network-nodes.persistence.retention|object|-|Retention policy controlling PVC lifecycle on delete or scale operations.|
|network.network-nodes.persistence.retention.whenDeleted|string|`"Retain"`|Behaviour of PVCs when the Helm release is deleted.|
|network.network-nodes.persistence.retention.whenScaled|string|`"Retain"`|Behaviour of PVCs when the StatefulSet scales down.|
|network.network-nodes.persistence.selector|object|-|PVC selector allowing binding to specific PersistentVolumes.|
|network.network-nodes.persistence.size|string|`"20Gi"`|Requested storage capacity for each PersistentVolumeClaim.|
|network.network-nodes.persistence.storageClass|string|`""`|StorageClass name used for provisioning volumes; empty selects the cluster default.|
|network.network-nodes.persistence.subPath|string|`""`|Subdirectory of the volume to mount instead of the root.|
|network.network-nodes.persistence.volumeMode|string|`""`|Volume mode (Filesystem or Block) requested for the PVC.|
|network.network-nodes.persistence.volumeName|string|`"data"`|Logical name for the volume when using volumeClaimTemplates.|
|network.network-nodes.podAnnotations|object|-|Pod annotations merged onto all Besu pods.|
|network.network-nodes.podAnnotations."prometheus.io/path"|string|`"/metrics"`|HTTP path exposing Prometheus-formatted metrics.|
|network.network-nodes.podAnnotations."prometheus.io/port"|string|`"9545"`|Container port value used by Prometheus to scrape metrics.|
|network.network-nodes.podAnnotations."prometheus.io/scheme"|string|`"http"`|HTTP scheme (http or https) used for metrics scraping.|
|network.network-nodes.podAnnotations."prometheus.io/scrape"|string|`"true"`|Enables Prometheus scraping of the Besu metrics endpoint.|
|network.network-nodes.podDisruptionBudgets|object|-|PodDisruptionBudget configuration for validator and RPC workloads.|
|network.network-nodes.podDisruptionBudgets.rpc|object|-|PodDisruptionBudget governing RPC pods.|
|network.network-nodes.podDisruptionBudgets.rpc.annotations|object|-|Additional annotations applied to the RPC PodDisruptionBudget.|
|network.network-nodes.podDisruptionBudgets.rpc.enabled|bool|`false`|Enable the RPC PodDisruptionBudget.|
|network.network-nodes.podDisruptionBudgets.rpc.labels|object|-|Additional labels applied to the RPC PodDisruptionBudget.|
|network.network-nodes.podDisruptionBudgets.rpc.maxUnavailable|int|`nil`|Maximum RPC pods that can be disrupted at once. Mutually exclusive with minAvailable.|
|network.network-nodes.podDisruptionBudgets.rpc.minAvailable|int|`1`|Minimum RPC pods that must remain available. Mutually exclusive with maxUnavailable.|
|network.network-nodes.podDisruptionBudgets.rpc.unhealthyPodEvictionPolicy|string|`""`|Optional unhealthy pod eviction policy (Default or AlwaysAllow).|
|network.network-nodes.podDisruptionBudgets.validator|object|-|PodDisruptionBudget controlling voluntary disruptions for validator pods.|
|network.network-nodes.podDisruptionBudgets.validator.annotations|object|-|Additional annotations applied to the validator PodDisruptionBudget.|
|network.network-nodes.podDisruptionBudgets.validator.enabled|bool|`false`|Enable the validator PodDisruptionBudget.|
|network.network-nodes.podDisruptionBudgets.validator.labels|object|-|Additional labels applied to the validator PodDisruptionBudget.|
|network.network-nodes.podDisruptionBudgets.validator.maxUnavailable|int|`nil`|Maximum validator pods that can be disrupted at once. Mutually exclusive with minAvailable.|
|network.network-nodes.podDisruptionBudgets.validator.minAvailable|int|`1`|Minimum validator pods that must remain available. Mutually exclusive with maxUnavailable.|
|network.network-nodes.podDisruptionBudgets.validator.unhealthyPodEvictionPolicy|string|`""`|Optional unhealthy pod eviction policy (Default or AlwaysAllow).|
|network.network-nodes.podLabels|object|-|Additional labels applied to all Besu pods.|
|network.network-nodes.podSecurityContext|object|-|Pod-level security context shared by all containers.|
|network.network-nodes.priorityClassNames|object|-|PriorityClass configuration applied to Besu workloads.|
|network.network-nodes.priorityClassNames.rpc|string|`""`|PriorityClass name assigned to RPC pods. Leave empty to inherit namespace defaults.|
|network.network-nodes.priorityClassNames.validator|string|`""`|PriorityClass name assigned to validator pods. Leave empty to inherit namespace defaults.|
|network.network-nodes.rbac|object|-|RBAC configuration controlling Role/RoleBinding creation for accessing Besu artifacts.|
|network.network-nodes.rbac.create|bool|`true`|Create Role and RoleBinding granting pods read access to ConfigMaps/Secrets.|
|network.network-nodes.readinessProbe|object|-|Readiness probe configuration signalling when pods can accept traffic.|
|network.network-nodes.resources|object|-|CPU and memory requests or limits for Besu containers.|
|network.network-nodes.rpcReplicaCount|int|`2`|Number of RPC node replicas provisioned via StatefulSet.|
|network.network-nodes.securityContext|object|-|Container-level security context applied to Besu containers.|
|network.network-nodes.service|object|-|Kubernetes Service definition exposing Besu endpoints.|
|network.network-nodes.service.ports|object|-|Named Service ports exposing Besu interfaces.|
|network.network-nodes.service.ports.discovery|int|`30303`|Discovery UDP port used by devp2p.|
|network.network-nodes.service.ports.graphql|int|`8547`|GraphQL API port.|
|network.network-nodes.service.ports.metrics|int|`9545`|Prometheus metrics port.|
|network.network-nodes.service.ports.rlpx|int|`30303`|RLPx TCP peer-to-peer port.|
|network.network-nodes.service.ports.rpc|int|`8545`|HTTP JSON-RPC port.|
|network.network-nodes.service.ports.ws|int|`8546`|WebSocket JSON-RPC port.|
|network.network-nodes.service.type|string|`"ClusterIP"`|Service type controlling how endpoints are published (ClusterIP, NodePort, etc.).|
|network.network-nodes.serviceAccount|object|-|Kubernetes ServiceAccount configuration applied to Besu pods.|
|network.network-nodes.serviceAccount.annotations|object|-|Metadata annotations applied to the ServiceAccount.|
|network.network-nodes.serviceAccount.automount|bool|`true`|Mount the ServiceAccount token volume into pods.|
|network.network-nodes.serviceAccount.create|bool|`true`|Create a ServiceAccount resource automatically for the release.|
|network.network-nodes.serviceAccount.name|string|`""`|Existing ServiceAccount name to reuse when creation is disabled.|
|network.network-nodes.tolerations|list|-|Tolerations allowing pods to run on nodes with matching taints.|
|network.network-nodes.validatorReplicaCount|int|`nil`|Number of validator node replicas participating in consensus. Leave unset to derive from global.validatorReplicaCount.|
|network.network-nodes.volumeMounts|list|-|Additional volume mounts applied to Besu containers.|
|network.network-nodes.volumes|list|-|Extra volumes attached to Besu pods for custom configuration or secrets.|
|observability.alloy|object|-|Alloy configuration|
|observability.alloy.alloy|object|-|Alloy agent configuration|
|observability.alloy.alloy.configMap|object|-|ConfigMap configuration for Alloy|
|observability.alloy.alloy.configMap.content|string|`"logging {\n  level  = \"info\"\n  format = \"logfmt\"\n}\n\ndiscovery.kubernetes \"kubernetes_nodes\" {\n  role = \"node\"\n}\n\ndiscovery.relabel \"kubernetes_nodes_cadvisor\" {\n  targets = discovery.kubernetes.kubernetes_nodes.targets\n\n  rule {\n    target_label = \"__address__\"\n    replacement  = \"kubernetes.default.svc:443\"\n  }\n\n  rule {\n    source_labels = [\"__meta_kubernetes_node_name\"]\n    regex         = \"(.+)\"\n    target_label  = \"__metrics_path__\"\n    replacement   = \"/api/v1/nodes/$1/proxy/metrics/cadvisor\"\n  }\n\n  rule {\n    regex       = \"__meta_kubernetes_pod_label_uid\"\n    action      = \"labeldrop\"\n  }\n\n  rule {\n    regex       = \"__meta_kubernetes_pod_label_id\"\n    action      = \"labeldrop\"\n  }\n\n  rule {\n    regex       = \"__meta_kubernetes_pod_label_name\"\n    action      = \"labeldrop\"\n  }\n}\n\ndiscovery.relabel \"kubernetes_nodes\" {\n  targets = discovery.kubernetes.kubernetes_nodes.targets\n\n  rule {\n    target_label = \"__address__\"\n    replacement  = \"kubernetes.default.svc:443\"\n  }\n\n  rule {\n    source_labels = [\"__meta_kubernetes_node_name\"]\n    regex         = \"(.+)\"\n    target_label  = \"__metrics_path__\"\n    replacement   = \"/api/v1/nodes/$1/proxy/metrics\"\n  }\n\n  rule {\n    regex       = \"__meta_kubernetes_pod_label_uid\"\n    action      = \"labeldrop\"\n  }\n\n  rule {\n    regex       = \"__meta_kubernetes_pod_label_id\"\n    action      = \"labeldrop\"\n  }\n\n  rule {\n    regex       = \"__meta_kubernetes_pod_label_name\"\n    action      = \"labeldrop\"\n  }\n\n  rule {\n    replacement  = \"{{ .Values.clustername | default \"settlemint\" }}\"\n    target_label = \"cluster_name\"\n  }\n}\n\n\nprometheus.scrape \"kubernetes_nodes_cadvisor\" {\n  targets         = discovery.relabel.kubernetes_nodes_cadvisor.output\n  forward_to      = [{{if .Values.endpoints.internal.prometheus.enabled }}prometheus.remote_write.btp_metrics.receiver{{ end }}{{if .Values.endpoints.external.prometheus.enabled }}{{if .Values.endpoints.internal.prometheus.enabled }},{{ end }}prometheus.remote_write.btp_metrics_external.receiver{{ end }}]\n  job_name        = \"kubernetes-nodes-cadvisor\"\n  scrape_interval = \"15s\"\n  scheme          = \"https\"\n\n  authorization {\n    type             = \"Bearer\"\n    credentials_file = \"/var/run/secrets/kubernetes.io/serviceaccount/token\"\n  }\n\n  tls_config {\n    ca_file              = \"/var/run/secrets/kubernetes.io/serviceaccount/ca.crt\"\n    insecure_skip_verify = true\n  }\n}\n\nprometheus.scrape \"kubernetes_nodes\" {\n  targets         = discovery.relabel.kubernetes_nodes.output\n  forward_to      = [{{if .Values.endpoints.internal.prometheus.enabled }}prometheus.remote_write.btp_metrics.receiver{{ end }}{{if .Values.endpoints.external.prometheus.enabled }}{{if .Values.endpoints.internal.prometheus.enabled }},{{ end }}prometheus.remote_write.btp_metrics_external.receiver{{ end }}]\n  job_name        = \"kubernetes-nodes\"\n  scrape_interval = \"15s\"\n  scheme          = \"https\"\n\n  authorization {\n    type             = \"Bearer\"\n    credentials_file = \"/var/run/secrets/kubernetes.io/serviceaccount/token\"\n  }\n\n  tls_config {\n    ca_file              = \"/var/run/secrets/kubernetes.io/serviceaccount/ca.crt\"\n    insecure_skip_verify = true\n  }\n}\n\n{{- if .Values.endpoints.internal.prometheus.enabled }}\nprometheus.remote_write \"btp_metrics\" {\n    endpoint {\n        url = {{ .Values.endpoints.internal.prometheus.url | quote }}\n    }\n}\n{{- end }}\n\n{{- if .Values.endpoints.external.prometheus.enabled }}\nprometheus.remote_write \"btp_metrics_external\" {\n    endpoint {\n        url = {{ .Values.endpoints.external.prometheus.url | quote }}\n\n        {{- if and .Values.endpoints.external.prometheus.basicAuth.username .Values.endpoints.external.prometheus.basicAuth.password }}\n        basic_auth {\n          username = {{ .Values.endpoints.external.prometheus.basicAuth.username | quote }}\n          password = {{ .Values.endpoints.external.prometheus.basicAuth.password | quote }}\n        }\n        {{- end }}\n    }\n}\n{{- end }}\n\ndiscovery.kubernetes \"kubernetes_pods\" {\n  role = \"pod\"\n\n\n  selectors {\n    role  = \"pod\"\n    label = \"app.kubernetes.io/instance={{ .Release.Name }}\"\n  }\n\n}\n\ndiscovery.relabel \"kubernetes_pods\" {\n  targets = discovery.kubernetes.kubernetes_pods.targets\n\n  rule {\n    source_labels = [\"__meta_kubernetes_pod_annotation_prometheus_io_scheme\"]\n    regex         = \"(https?)\"\n    target_label  = \"__scheme__\"\n  }\n\n  rule {\n    source_labels = [\"__meta_kubernetes_pod_annotation_prometheus_io_path\"]\n    regex         = \"(.+)\"\n    target_label  = \"__metrics_path__\"\n  }\n\n  rule {\n    source_labels = [\"__address__\", \"__meta_kubernetes_pod_annotation_prometheus_io_port\"]\n    regex         = \"(.+?)(?::\\\\d+)?;(\\\\d+)\"\n    target_label  = \"__address__\"\n    replacement   = \"$1:$2\"\n  }\n\n  rule {\n    regex       = \"__meta_kubernetes_pod_annotation_prometheus_io_param_(.+)\"\n    replacement = \"__param_$1\"\n    action      = \"labelmap\"\n  }\n\n  rule {\n    source_labels = [\"__meta_kubernetes_pod_label_app_kubernetes_io_component\"]\n    target_label  = \"component\"\n  }\n\n  rule {\n    source_labels = [\"__meta_kubernetes_namespace\"]\n    target_label  = \"namespace\"\n  }\n\n  rule {\n    regex       = \"__meta_kubernetes_pod_label_uid\"\n    action      = \"labeldrop\"\n  }\n\n  rule {\n    regex       = \"__meta_kubernetes_pod_label_id\"\n    action      = \"labeldrop\"\n  }\n\n  rule {\n    regex       = \"__meta_kubernetes_pod_label_name\"\n    action      = \"labeldrop\"\n  }\n\n  rule {\n    replacement  = \"{{ .Values.clustername | default \"settlemint\" }}\"\n    target_label = \"cluster_name\"\n  }\n\n}\n\nprometheus.scrape \"kubernetes_pods\" {\n  targets         = discovery.relabel.kubernetes_pods.output\n  forward_to      = [{{if .Values.endpoints.internal.prometheus.enabled }}prometheus.remote_write.btp_metrics.receiver{{ end }}{{if .Values.endpoints.external.prometheus.enabled }}{{if .Values.endpoints.internal.prometheus.enabled }},{{ end }}prometheus.remote_write.btp_metrics_external.receiver{{ end }}]\n  job_name        = \"kubernetes-pods\"\n  honor_labels    = true\n  scrape_interval = \"15s\"\n}\n\nloki.source.kubernetes \"kubernetes_pods\" {\n  targets    = discovery.relabel.kubernetes_pods.output\n  forward_to = [{{ if .Values.endpoints.internal.loki.enabled }}loki.process.redact_tokens.receiver{{ end }}{{ if .Values.endpoints.external.loki.enabled }}{{ if .Values.endpoints.internal.loki.enabled }},{{ end }}loki.process.redact_tokens_external.receiver{{ end }}]\n}\n\n{{- if .Values.endpoints.internal.loki.enabled }}\nloki.process \"redact_tokens\" {\n  forward_to = [loki.secretfilter.secret_filter.receiver]\n  stage.replace {\n    expression = \"(?i)sm_\\\\S+_[0-9a-zA-Z]{3}([0-9a-zA-Z]+)\"\n    replace = \"****\"\n  }\n}\n\nloki.secretfilter \"secret_filter\" {\n  forward_to  = [loki.write.btp_logs.receiver]\n  redact_with = \"<ALLOY-REDACTED-SECRET:$SECRET_NAME:$SECRET_HASH>\"\n}\n\nloki.write \"btp_logs\" {\n  endpoint {\n    url = {{ .Values.endpoints.internal.loki.url | quote }}\n  }\n}\n{{- end }}\n\n{{- if .Values.endpoints.external.loki.enabled }}\nloki.process \"redact_tokens_external\" {\n  forward_to = [loki.secretfilter.secret_filter_external.receiver]\n  stage.replace {\n    expression = \"(?i)sm_\\\\S+_[0-9a-zA-Z]{3}([0-9a-zA-Z]+)\"\n    replace = \"****\"\n  }\n}\n\nloki.secretfilter \"secret_filter_external\" {\n  forward_to  = [loki.write.btp_logs_external.receiver]\n  redact_with = \"<ALLOY-REDACTED-SECRET:$SECRET_NAME:$SECRET_HASH>\"\n}\n\nloki.write \"btp_logs_external\" {\n  endpoint {\n    url = {{ .Values.endpoints.external.loki.url | quote }}\n\n    {{- if and .Values.endpoints.external.loki.basicAuth.username .Values.endpoints.external.loki.basicAuth.password }}\n    basic_auth {\n      username = {{ .Values.endpoints.external.loki.basicAuth.username | quote }}\n      password = {{ .Values.endpoints.external.loki.basicAuth.password | quote }}\n    }\n    {{- end }}\n  }\n}\n{{- end }}\n\notelcol.receiver.otlp \"atk_traces\" {\n  grpc {\n    endpoint = \"0.0.0.0:4317\"\n  }\n\n  http {\n    endpoint = \"0.0.0.0:4318\"\n  }\n\n  output {\n    traces  = [otelcol.processor.batch.atk_traces.input]\n  }\n}\n\notelcol.processor.batch \"atk_traces\" {\n  send_batch_size = 16384\n  send_batch_max_size = 16384\n  timeout = \"2s\"\n\n  output {\n    traces  = [{{ if .Values.endpoints.internal.otel.enabled }}otelcol.exporter.otlphttp.atk_traces_internal.input{{ end }}{{ if .Values.endpoints.external.otel.enabled }}{{ if .Values.endpoints.internal.otel.enabled }},{{ end }}otelcol.exporter.otlphttp.atk_traces_external.input{{ end }}]\n  }\n}\n\n{{- if .Values.endpoints.internal.otel.enabled }}\notelcol.exporter.otlphttp \"atk_traces_internal\" {\n  client {\n    endpoint = {{ .Values.endpoints.internal.otel.url | quote }}\n    tls {\n      insecure             = true\n      insecure_skip_verify = true\n    }\n  }\n}\n{{- end }}\n\n{{- if .Values.endpoints.external.otel.enabled }}\notelcol.exporter.otlp \"atk_traces_external\" {\n  client {\n    endpoint = {{ .Values.endpoints.external.otel.url | quote }}\n\n\n    {{- if and .Values.endpoints.external.otel.basicAuth.username .Values.endpoints.external.otel.basicAuth.password }}\n    auth     = otelcol.auth.basic.atk_traces_external.handler\n    {{- end }}\n  }\n}\n\n{{- if and .Values.endpoints.external.otel.basicAuth.username .Values.endpoints.external.otel.basicAuth.password }}\notelcol.auth.basic \"atk_traces_external\" {\n  username = {{ .Values.endpoints.external.otel.basicAuth.username | quote }}\n  password = {{ .Values.endpoints.external.otel.basicAuth.password | quote }}\n}\n{{- end }}\n\n{{- end }}\n"`|Alloy configuration content in HCL format|
|observability.alloy.alloy.enableReporting|bool|`false`|Enable usage reporting to Grafana Labs|
|observability.alloy.alloy.extraPorts|list|-|Extra ports to expose on Alloy pods|
|observability.alloy.alloy.extraPorts[0]|string|`{"name":"otel-grpc","port":4317,"protocol":"TCP","targetPort":4317}`|Port name for OpenTelemetry gRPC|
|observability.alloy.alloy.extraPorts[0].port|int|`4317`|Service port for OpenTelemetry gRPC|
|observability.alloy.alloy.extraPorts[0].protocol|string|`"TCP"`|Protocol for OpenTelemetry gRPC|
|observability.alloy.alloy.extraPorts[0].targetPort|int|`4317`|Target port for OpenTelemetry gRPC|
|observability.alloy.alloy.extraPorts[1]|string|`{"name":"otel-http","port":4318,"protocol":"TCP","targetPort":4318}`|Port name for OpenTelemetry HTTP|
|observability.alloy.alloy.extraPorts[1].port|int|`4318`|Service port for OpenTelemetry HTTP|
|observability.alloy.alloy.extraPorts[1].protocol|string|`"TCP"`|Protocol for OpenTelemetry HTTP|
|observability.alloy.alloy.extraPorts[1].targetPort|int|`4318`|Target port for OpenTelemetry HTTP|
|observability.alloy.alloy.resources|object|-|Resource requests and limits for Alloy|
|observability.alloy.alloy.stabilityLevel|string|`"experimental"`|Stability level for experimental features|
|observability.alloy.clustername|string|`""`|Cluster name label for metrics and logs|
|observability.alloy.configReloader|object|-|Config reloader sidecar configuration|
|observability.alloy.configReloader.image|object|-|Config reloader image configuration|
|observability.alloy.configReloader.image.registry|string|`"ghcr.io"`|Image registry for config reloader|
|observability.alloy.controller|object|-|Controller configuration|
|observability.alloy.controller.type|string|`"deployment"`|Controller type (deployment, daemonset, or statefulset)|
|observability.alloy.crds|object|-|Custom Resource Definitions configuration|
|observability.alloy.crds.create|bool|`false`|Create CRDs during installation|
|observability.alloy.enabled|bool|`true`|Enable Alloy deployment|
|observability.alloy.endpoints|object|-|Observability endpoints configuration|
|observability.alloy.endpoints.external|object|-|External endpoints configuration for remote services|
|observability.alloy.endpoints.external.loki|object|-|External Loki endpoint configuration|
|observability.alloy.endpoints.external.loki.basicAuth|object|-|Basic authentication for external Loki|
|observability.alloy.endpoints.external.loki.basicAuth.password|string|`nil`|Password for external Loki basic auth|
|observability.alloy.endpoints.external.loki.basicAuth.username|string|`nil`|Username for external Loki basic auth|
|observability.alloy.endpoints.external.loki.enabled|bool|`false`|Enable external Loki log shipping|
|observability.alloy.endpoints.external.loki.url|string|`""`|External Loki push URL|
|observability.alloy.endpoints.external.otel|object|-|External OpenTelemetry endpoint configuration|
|observability.alloy.endpoints.external.otel.basicAuth|object|-|Basic authentication for external OpenTelemetry|
|observability.alloy.endpoints.external.otel.basicAuth.password|string|`nil`|Password for external OpenTelemetry basic auth|
|observability.alloy.endpoints.external.otel.basicAuth.username|string|`nil`|Username for external OpenTelemetry basic auth|
|observability.alloy.endpoints.external.otel.enabled|bool|`false`|Enable external OpenTelemetry traces|
|observability.alloy.endpoints.external.otel.url|string|`""`|External OpenTelemetry endpoint URL|
|observability.alloy.endpoints.external.prometheus|object|-|External Prometheus endpoint configuration|
|observability.alloy.endpoints.external.prometheus.basicAuth|object|-|Basic authentication for external Prometheus|
|observability.alloy.endpoints.external.prometheus.basicAuth.password|string|`nil`|Password for external Prometheus basic auth|
|observability.alloy.endpoints.external.prometheus.basicAuth.username|string|`nil`|Username for external Prometheus basic auth|
|observability.alloy.endpoints.external.prometheus.enabled|bool|`false`|Enable external Prometheus remote write|
|observability.alloy.endpoints.external.prometheus.url|string|`""`|External Prometheus remote write URL|
|observability.alloy.endpoints.internal|object|-|Internal endpoints configuration for on-cluster services|
|observability.alloy.endpoints.internal.loki|object|-|Internal Loki endpoint configuration|
|observability.alloy.endpoints.internal.loki.enabled|bool|`true`|Enable internal Loki log shipping|
|observability.alloy.endpoints.internal.loki.url|string|`"http://logs:3100/loki/api/v1/push"`|Internal Loki push URL|
|observability.alloy.endpoints.internal.otel|object|-|Internal OpenTelemetry endpoint configuration|
|observability.alloy.endpoints.internal.otel.enabled|bool|`true`|Enable internal OpenTelemetry traces|
|observability.alloy.endpoints.internal.otel.url|string|`"http://tempo:4318"`|Internal OpenTelemetry HTTP endpoint URL|
|observability.alloy.endpoints.internal.prometheus|object|-|Internal Prometheus endpoint configuration|
|observability.alloy.endpoints.internal.prometheus.enabled|bool|`true`|Enable internal Prometheus remote write|
|observability.alloy.endpoints.internal.prometheus.url|string|`"http://metrics:8428/api/v1/write"`|Internal Prometheus remote write URL|
|observability.alloy.fullnameOverride|string|`"alloy"`|String to fully override common.names.fullname|
|observability.alloy.global|object|-|Global configuration|
|observability.alloy.global.image|object|-|Global image configuration|
|observability.alloy.global.image.pullSecrets|list|-|Global Docker registry secret names as an array|
|observability.alloy.image|object|-|Alloy image configuration|
|observability.alloy.image.registry|string|`"docker.io"`|Image registry for Alloy|
|observability.grafana|object|-|Grafana configuration|
|observability.grafana.adminPassword|string|`"atk"`|Grafana admin password|
|observability.grafana.adminUser|string|`"settlemint"`|Grafana admin username|
|observability.grafana.datasources|object|-|Datasource configuration|
|observability.grafana.datasources."datasources.yaml"|object|-|Datasources YAML configuration|
|observability.grafana.datasources."datasources.yaml".apiVersion|int|`1`|Datasource API version|
|observability.grafana.datasources."datasources.yaml".datasources|list|-|List of datasources|
|observability.grafana.datasources."datasources.yaml".datasources[0]|string|`{"access":"proxy","isDefault":true,"name":"Prometheus","type":"prometheus","uid":"prometheus","url":"http://metrics:8428"}`|Prometheus datasource name|
|observability.grafana.datasources."datasources.yaml".datasources[0].access|string|`"proxy"`|Datasource access mode|
|observability.grafana.datasources."datasources.yaml".datasources[0].isDefault|bool|`true`|Set as default datasource|
|observability.grafana.datasources."datasources.yaml".datasources[0].type|string|`"prometheus"`|Datasource type|
|observability.grafana.datasources."datasources.yaml".datasources[0].uid|string|`"prometheus"`|Datasource unique identifier|
|observability.grafana.datasources."datasources.yaml".datasources[0].url|string|`"http://metrics:8428"`|Prometheus URL|
|observability.grafana.datasources."datasources.yaml".datasources[1]|string|`{"access":"proxy","isDefault":false,"jsonData":{"derivedFields":[{"datasourceUid":"tempo","matcherRegex":"^.*?traceI[d|D]=(\\w+).*$","name":"traceId","url":"$${__value.raw}"}],"maxLines":1000,"timeout":60},"name":"Loki","type":"loki","uid":"loki","url":"http://logs:3100"}`|Loki datasource name|
|observability.grafana.datasources."datasources.yaml".datasources[1].access|string|`"proxy"`|Datasource access mode|
|observability.grafana.datasources."datasources.yaml".datasources[1].isDefault|bool|`false`|Set as default datasource|
|observability.grafana.datasources."datasources.yaml".datasources[1].jsonData|object|-|Loki JSON data configuration|
|observability.grafana.datasources."datasources.yaml".datasources[1].jsonData.derivedFields|list|-|Derived fields configuration for trace linking|
|observability.grafana.datasources."datasources.yaml".datasources[1].jsonData.derivedFields[0]|string|`{"datasourceUid":"tempo","matcherRegex":"^.*?traceI[d|D]=(\\w+).*$","name":"traceId","url":"$${__value.raw}"}`|Target datasource UID for trace links|
|observability.grafana.datasources."datasources.yaml".datasources[1].jsonData.derivedFields[0].matcherRegex|string|`"^.*?traceI[d|D]=(\\w+).*$"`|Regex to extract trace ID from logs|
|observability.grafana.datasources."datasources.yaml".datasources[1].jsonData.derivedFields[0].name|string|`"traceId"`|Field name for trace ID|
|observability.grafana.datasources."datasources.yaml".datasources[1].jsonData.derivedFields[0].url|string|`"$${__value.raw}"`|URL template for trace links|
|observability.grafana.datasources."datasources.yaml".datasources[1].jsonData.maxLines|int|`1000`|Maximum lines to return|
|observability.grafana.datasources."datasources.yaml".datasources[1].jsonData.timeout|int|`60`|Query timeout in seconds|
|observability.grafana.datasources."datasources.yaml".datasources[1].type|string|`"loki"`|Datasource type|
|observability.grafana.datasources."datasources.yaml".datasources[1].uid|string|`"loki"`|Datasource unique identifier|
|observability.grafana.datasources."datasources.yaml".datasources[1].url|string|`"http://logs:3100"`|Loki URL|
|observability.grafana.datasources."datasources.yaml".datasources[2]|string|`{"access":"proxy","database":"thegraph","isDefault":false,"jsonData":{"postgresVersion":15,"sslmode":"disable","timescaledb":false},"name":"PostgreSQL","secureJsonData":{"password":"atk"},"type":"postgres","uid":"postgres","url":"postgresql:5432","user":"thegraph"}`|PostgreSQL datasource name|
|observability.grafana.datasources."datasources.yaml".datasources[2].access|string|`"proxy"`|Datasource access mode|
|observability.grafana.datasources."datasources.yaml".datasources[2].database|string|`"thegraph"`|Database name|
|observability.grafana.datasources."datasources.yaml".datasources[2].isDefault|bool|`false`|Set as default datasource|
|observability.grafana.datasources."datasources.yaml".datasources[2].jsonData|object|-|PostgreSQL JSON data configuration|
|observability.grafana.datasources."datasources.yaml".datasources[2].jsonData.postgresVersion|int|`15`|PostgreSQL version|
|observability.grafana.datasources."datasources.yaml".datasources[2].jsonData.sslmode|string|`"disable"`|SSL mode for PostgreSQL connection|
|observability.grafana.datasources."datasources.yaml".datasources[2].jsonData.timescaledb|bool|`false`|Enable TimescaleDB support|
|observability.grafana.datasources."datasources.yaml".datasources[2].secureJsonData|object|-|Secure JSON data for sensitive fields|
|observability.grafana.datasources."datasources.yaml".datasources[2].secureJsonData.password|string|`"atk"`|Database password|
|observability.grafana.datasources."datasources.yaml".datasources[2].type|string|`"postgres"`|Datasource type|
|observability.grafana.datasources."datasources.yaml".datasources[2].uid|string|`"postgres"`|Datasource unique identifier|
|observability.grafana.datasources."datasources.yaml".datasources[2].url|string|`"postgresql:5432"`|PostgreSQL URL|
|observability.grafana.datasources."datasources.yaml".datasources[2].user|string|`"thegraph"`|Database user|
|observability.grafana.enabled|bool|`true`|Enable Grafana deployment|
|observability.grafana.fullnameOverride|string|`"grafana"`|String to fully override common.names.fullname|
|observability.grafana.global|object|-|Global configuration|
|observability.grafana.global.imagePullSecrets|list|-|Global Docker registry secret names as an array|
|observability.grafana.global.imageRegistry|string|`"docker.io"`|Global image registry|
|observability.grafana.ingress|object|-|Ingress configuration for Grafana|
|observability.grafana.ingress.enabled|bool|`true`|Enable ingress for Grafana|
|observability.grafana.ingress.hosts|list|-|List of ingress hosts|
|observability.grafana.ingress.hosts[0]|string|`"grafana.k8s.orb.local"`|Host name for Grafana ingress|
|observability.grafana.ingress.ingressClassName|string|`"atk-nginx"`|Ingress class name|
|observability.grafana.initChownData|object|-|Init container to fix permissions|
|observability.grafana.initChownData.enabled|bool|`false`|Enable init container for chown|
|observability.grafana.persistence|object|-|Persistent volume configuration|
|observability.grafana.persistence.enabled|bool|`false`|Enable persistent volume for Grafana|
|observability.grafana.persistence.size|string|`"1Gi"`|Size of persistent volume|
|observability.grafana.plugins|list|-|List of Grafana plugins to install|
|observability.grafana.plugins[0]|string|`"https://storage.googleapis.com/integration-artifacts/grafana-lokiexplore-app/grafana-lokiexplore-app-latest.zip;grafana-lokiexplore-app"`|Loki Explore app plugin URL|
|observability.grafana.podLabels|object|-|Additional labels for Grafana pods|
|observability.grafana.podLabels."app.kubernetes.io/managed-by"|string|`"helm"`|Helm managed-by label|
|observability.grafana.podLabels."kots.io/app-slug"|string|`"settlemint-atk"`|KOTS application slug identifier|
|observability.grafana.sidecar|object|-|Sidecar configuration for auto-loading resources|
|observability.grafana.sidecar.alerts|object|-|Alert sidecar configuration|
|observability.grafana.sidecar.alerts.enabled|bool|`false`|Enable alert sidecar|
|observability.grafana.sidecar.alerts.label|string|`"grafana_alert"`|Label key for alert discovery|
|observability.grafana.sidecar.alerts.labelValue|string|`"1"`|Label value for alert discovery|
|observability.grafana.sidecar.alerts.searchNamespace|string|`"ALL"`|Namespace to search for alerts (ALL for all namespaces)|
|observability.grafana.sidecar.alerts.slackChannel|string|`""`|Slack channel for alerts|
|observability.grafana.sidecar.alerts.slackUrl|string|`""`|Slack webhook URL for alerts|
|observability.grafana.sidecar.alerts.slackUsername|string|`""`|Slack username for alerts|
|observability.grafana.sidecar.dashboards|object|-|Dashboard sidecar configuration|
|observability.grafana.sidecar.dashboards.enabled|bool|`true`|Enable dashboard sidecar|
|observability.grafana.sidecar.dashboards.folderAnnotation|string|`"grafana_folder"`|Annotation key for folder assignment|
|observability.grafana.sidecar.dashboards.provider|object|-|Dashboard provider configuration|
|observability.grafana.sidecar.dashboards.provider.allowUiUpdates|bool|`true`|Allow UI updates to dashboards|
|observability.grafana.sidecar.dashboards.provider.foldersFromFilesStructure|bool|`true`|Create folders from file structure|
|observability.grafana.sidecar.dashboards.searchNamespace|string|`"ALL"`|Namespace to search for dashboards (ALL for all namespaces)|
|observability.grafana.sidecar.datasources|object|-|Datasource sidecar configuration|
|observability.grafana.sidecar.datasources.enabled|bool|`true`|Enable datasource sidecar|
|observability.grafana.sidecar.datasources.initDatasources|bool|`true`|Initialize datasources on startup|
|observability.grafana.sidecar.plugins|object|-|Plugin sidecar configuration|
|observability.grafana.sidecar.plugins.enabled|bool|`true`|Enable plugin sidecar|
|observability.kube-state-metrics|object|-|Kube State Metrics configuration|
|observability.kube-state-metrics.customLabels|object|-|Custom labels to add to all resources|
|observability.kube-state-metrics.enabled|bool|`true`|Enable kube-state-metrics deployment|
|observability.kube-state-metrics.fullnameOverride|string|`"kube-state-metrics"`|String to fully override common.names.fullname (string)|
|observability.kube-state-metrics.image|object|-|Kube state metrics image configuration|
|observability.kube-state-metrics.image.registry|string|`"registry.k8s.io"`|Kube state metrics image registry|
|observability.kube-state-metrics.imagePullSecrets|list|-|Global Docker registry secret names as an array (list)|
|observability.kube-state-metrics.metricLabelsAllowlist|list|-|Allow list for metric labels|
|observability.kube-state-metrics.podAnnotations|object|-|Annotations for kube-state-metrics pods|
|observability.loki|object|-|Loki configuration|
|observability.loki.backend|object|-|Backend component configuration|
|observability.loki.backend.replicas|int|`0`|Number of backend replicas (0 when using SingleBinary)|
|observability.loki.bloomCompactor|object|-|Bloom compactor component configuration|
|observability.loki.bloomCompactor.replicas|int|`0`|Number of bloom compactor replicas (0 when using SingleBinary)|
|observability.loki.bloomGateway|object|-|Bloom gateway component configuration|
|observability.loki.bloomGateway.replicas|int|`0`|Number of bloom gateway replicas (0 when using SingleBinary)|
|observability.loki.chunksCache|object|-|Chunks cache configuration|
|observability.loki.chunksCache.allocatedMemory|int|`1024`|Allocated memory for chunks cache in MB|
|observability.loki.chunksCache.enabled|bool|`false`|Enable chunks cache|
|observability.loki.chunksCache.writebackSizeLimit|string|`"100MB"`|Writeback size limit for chunks cache|
|observability.loki.compactor|object|-|Compactor component configuration|
|observability.loki.compactor.replicas|int|`0`|Number of compactor replicas (0 when using SingleBinary)|
|observability.loki.deploymentMode|string|`"SingleBinary"`|Deployment mode for Loki (SingleBinary, SimpleScalable, or Distributed)|
|observability.loki.distributor|object|-|Distributor component configuration|
|observability.loki.distributor.replicas|int|`0`|Number of distributor replicas (0 when using SingleBinary)|
|observability.loki.enabled|bool|`true`|Enable Loki deployment|
|observability.loki.fullnameOverride|string|`"logs"`|String to fully override common.names.fullname|
|observability.loki.gateway|object|-|Gateway configuration|
|observability.loki.gateway.affinity|object|-|Affinity rules for gateway pods|
|observability.loki.gateway.affinity.podAntiAffinity|object|-|Pod anti-affinity rules|
|observability.loki.gateway.affinity.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution|object|-|Required anti-affinity rules during scheduling|
|observability.loki.gateway.ingress|object|-|Ingress configuration for gateway|
|observability.loki.gateway.ingress.annotations|object|-|Ingress annotations|
|observability.loki.gateway.ingress.annotations."nginx.ingress.kubernetes.io/auth-realm"|string|`"Authentication Required - Logs"`|Authentication realm message|
|observability.loki.gateway.ingress.annotations."nginx.ingress.kubernetes.io/auth-secret"|string|`"observability-logs"`|Secret name for basic authentication|
|observability.loki.gateway.ingress.annotations."nginx.ingress.kubernetes.io/auth-type"|string|`"basic"`|Authentication type for ingress|
|observability.loki.gateway.ingress.annotations."nginx.ingress.kubernetes.io/client-body-buffer-size"|string|`"500m"`|Buffer size for reading client request body|
|observability.loki.gateway.ingress.annotations."nginx.ingress.kubernetes.io/proxy-body-size"|string|`"500m"`|Maximum allowed size of client request body|
|observability.loki.gateway.ingress.annotations."nginx.ingress.kubernetes.io/proxy-read-timeout"|string|`"3600"`|Timeout for reading a response from proxied server|
|observability.loki.gateway.ingress.annotations."nginx.ingress.kubernetes.io/proxy-send-timeout"|string|`"3600"`|Timeout for transmitting a request to proxied server|
|observability.loki.gateway.ingress.enabled|bool|`false`|Enable ingress for gateway|
|observability.loki.gateway.ingress.hosts|list|-|List of ingress hosts|
|observability.loki.gateway.ingress.hosts[0]|string|`{"host":"logs.settlemint.local","paths":[{"path":"/","pathType":"Prefix"}]}`|Host name for ingress|
|observability.loki.gateway.ingress.hosts[0].paths|list|-|List of paths for this host|
|observability.loki.gateway.ingress.hosts[0].paths[0]|string|`{"path":"/","pathType":"Prefix"}`|Path for ingress rule|
|observability.loki.gateway.ingress.hosts[0].paths[0].pathType|string|`"Prefix"`|Path type for ingress rule|
|observability.loki.gateway.ingress.ingressClassName|string|`"atk-nginx"`|Ingress class name|
|observability.loki.global|object|-|Global configuration|
|observability.loki.global.image|object|-|Global image configuration|
|observability.loki.global.image.registry|string|`"docker.io"`|Global image registry|
|observability.loki.imagePullSecrets|list|-|Global Docker registry secret names as an array|
|observability.loki.indexGateway|object|-|Index gateway component configuration|
|observability.loki.indexGateway.replicas|int|`0`|Number of index gateway replicas (0 when using SingleBinary)|
|observability.loki.ingester|object|-|Ingester component configuration|
|observability.loki.ingester.replicas|int|`0`|Number of ingester replicas (0 when using SingleBinary)|
|observability.loki.loki|object|-|Loki server configuration|
|observability.loki.loki.auth_enabled|bool|`false`|Enable authentication for Loki|
|observability.loki.loki.commonConfig|object|-|Common configuration settings|
|observability.loki.loki.commonConfig.replication_factor|int|`1`|Number of replicas for data replication|
|observability.loki.loki.compactor|object|-|Compactor configuration|
|observability.loki.loki.compactor.compaction_interval|string|`"60m"`|Interval between compaction runs|
|observability.loki.loki.compactor.delete_request_store|string|`"filesystem"`|Store type for delete requests|
|observability.loki.loki.compactor.retention_delete_delay|string|`"2h"`|Delay before deleting retained data|
|observability.loki.loki.compactor.retention_delete_worker_count|int|`150`|Number of workers for deletion|
|observability.loki.loki.compactor.retention_enabled|bool|`true`|Enable retention in compactor|
|observability.loki.loki.compactor.working_directory|string|`"/var/loki/retention"`|Working directory for compactor|
|observability.loki.loki.ingester|object|-|Ingester configuration|
|observability.loki.loki.ingester.chunk_encoding|string|`"snappy"`|Chunk compression encoding|
|observability.loki.loki.limits_config|object|-|Limits configuration|
|observability.loki.loki.limits_config.allow_structured_metadata|bool|`true`|Allow structured metadata in logs|
|observability.loki.loki.limits_config.cardinality_limit|int|`200000`|Cardinality limit for label combinations|
|observability.loki.loki.limits_config.ingestion_burst_size_mb|int|`1000`|Ingestion burst size in MB|
|observability.loki.loki.limits_config.ingestion_rate_mb|int|`1000`|Ingestion rate in MB per second|
|observability.loki.loki.limits_config.max_entries_limit_per_query|int|`1000000`|Maximum entries limit per query|
|observability.loki.loki.limits_config.max_global_streams_per_user|int|`10000`|Maximum global streams per user|
|observability.loki.loki.limits_config.max_label_name_length|int|`10240`|Maximum label name length|
|observability.loki.loki.limits_config.max_label_names_per_series|int|`300`|Maximum label names per series|
|observability.loki.loki.limits_config.max_label_value_length|int|`20480`|Maximum label value length|
|observability.loki.loki.limits_config.max_line_size|int|`100982429`|Maximum line size in bytes|
|observability.loki.loki.limits_config.max_query_parallelism|int|`2`|Maximum parallelism for queries|
|observability.loki.loki.limits_config.max_query_series|int|`10000`|Maximum number of series in a query|
|observability.loki.loki.limits_config.per_stream_rate_limit|string|`"512M"`|Rate limit per stream|
|observability.loki.loki.limits_config.per_stream_rate_limit_burst|string|`"1024M"`|Burst rate limit per stream|
|observability.loki.loki.limits_config.reject_old_samples|bool|`true`|Reject samples older than max age|
|observability.loki.loki.limits_config.reject_old_samples_max_age|string|`"24h"`|Maximum age for samples|
|observability.loki.loki.limits_config.retention_period|string|`"168h"`|Log retention period|
|observability.loki.loki.limits_config.split_queries_by_interval|string|`"15m"`|Interval for splitting queries|
|observability.loki.loki.limits_config.volume_enabled|bool|`true`|Enable volume endpoints|
|observability.loki.loki.pattern_receiver|object|-|Pattern receiver configuration for log pattern detection|
|observability.loki.loki.pattern_receiver.enabled|bool|`true`|Enable pattern receiver|
|observability.loki.loki.querier|object|-|Querier configuration|
|observability.loki.loki.querier.max_concurrent|int|`2`|Maximum concurrent queries|
|observability.loki.loki.schemaConfig|object|-|Schema configuration for index and chunks|
|observability.loki.loki.schemaConfig.configs|list|-|List of schema configurations|
|observability.loki.loki.schemaConfig.configs[0]|string|`{"from":"2024-04-01","index":{"period":"24h","prefix":"loki_index_"},"object_store":"filesystem","schema":"v13","store":"tsdb"}`|Schema start date|
|observability.loki.loki.schemaConfig.configs[0].index|object|-|Index configuration|
|observability.loki.loki.schemaConfig.configs[0].index.period|string|`"24h"`|Index rotation period|
|observability.loki.loki.schemaConfig.configs[0].index.prefix|string|`"loki_index_"`|Index prefix for table names|
|observability.loki.loki.schemaConfig.configs[0].object_store|string|`"filesystem"`|Object store type|
|observability.loki.loki.schemaConfig.configs[0].schema|string|`"v13"`|Schema version|
|observability.loki.loki.schemaConfig.configs[0].store|string|`"tsdb"`|Index store type|
|observability.loki.loki.server|object|-|Server configuration|
|observability.loki.loki.server.grpc_server_max_recv_msg_size|int|`100982429`|Maximum gRPC message receive size in bytes|
|observability.loki.loki.server.grpc_server_max_send_msg_size|int|`100982429`|Maximum gRPC message send size in bytes|
|observability.loki.loki.storage|object|-|Storage configuration|
|observability.loki.loki.storage.type|string|`"filesystem"`|Storage backend type|
|observability.loki.loki.tracing|object|-|Tracing configuration|
|observability.loki.loki.tracing.enabled|bool|`true`|Enable tracing|
|observability.loki.lokiCanary|object|-|Loki canary configuration for monitoring|
|observability.loki.lokiCanary.enabled|bool|`false`|Enable Loki canary|
|observability.loki.memcached|object|-|Memcached configuration|
|observability.loki.memcached.image|object|-|Memcached image configuration|
|observability.loki.memcached.image.repository|string|`"docker.io/library/memcached"`|Memcached image repository|
|observability.loki.memcachedExporter|object|-|Memcached exporter configuration|
|observability.loki.memcachedExporter.image|object|-|Memcached exporter image configuration|
|observability.loki.memcachedExporter.image.repository|string|`"docker.io/prom/memcached-exporter"`|Memcached exporter image repository|
|observability.loki.minio|object|-|MinIO configuration for object storage|
|observability.loki.minio.enabled|bool|`false`|Enable MinIO deployment|
|observability.loki.querier|object|-|Querier component configuration|
|observability.loki.querier.replicas|int|`0`|Number of querier replicas (0 when using SingleBinary)|
|observability.loki.queryFrontend|object|-|Query frontend component configuration|
|observability.loki.queryFrontend.replicas|int|`0`|Number of query frontend replicas (0 when using SingleBinary)|
|observability.loki.queryScheduler|object|-|Query scheduler component configuration|
|observability.loki.queryScheduler.replicas|int|`0`|Number of query scheduler replicas (0 when using SingleBinary)|
|observability.loki.read|object|-|Read component configuration|
|observability.loki.read.replicas|int|`0`|Number of read replicas (0 when using SingleBinary)|
|observability.loki.resultsCache|object|-|Results cache configuration|
|observability.loki.resultsCache.enabled|bool|`false`|Enable results cache|
|observability.loki.sidecar|object|-|Sidecar configuration for config reloading|
|observability.loki.sidecar.image|object|-|Sidecar image configuration|
|observability.loki.sidecar.image.repository|string|`"docker.io/kiwigrid/k8s-sidecar"`|The Docker registry and image for the k8s sidecar|
|observability.loki.singleBinary|object|-|Single binary deployment configuration|
|observability.loki.singleBinary.persistence|object|-|Persistent volume configuration|
|observability.loki.singleBinary.persistence.size|string|`"10Gi"`|Size of persistent volume|
|observability.loki.singleBinary.replicas|int|`1`|Number of replicas for single binary deployment|
|observability.loki.singleBinary.resources|object|-|Resource requests and limits|
|observability.loki.test|object|-|Test configuration|
|observability.loki.test.enabled|bool|`false`|Enable test pods|
|observability.loki.write|object|-|Write component configuration|
|observability.loki.write.replicas|int|`0`|Number of write replicas (0 when using SingleBinary)|
|observability.metrics-server|object|-|Kubernetes Metrics Server configuration|
|observability.metrics-server.enabled|bool|`false`|Enable metrics server deployment|
|observability.metrics-server.fullnameOverride|string|`"metrics-server"`|String to fully override common.names.fullname (string)|
|observability.metrics-server.image|object|-|Metrics server image configuration|
|observability.metrics-server.image.repository|string|`"registry.k8s.io/metrics-server/metrics-server"`|Metrics server image repository|
|observability.metrics-server.imagePullSecrets|list|-|Global Docker registry secret names as an array (list)|
|observability.metrics-server.podLabels|object|-|Additional labels for metrics server pods|
|observability.metrics-server.server|object|-|Server configuration|
|observability.metrics-server.server.persistentVolume|object|-|Persistent volume configuration|
|observability.metrics-server.server.persistentVolume.enabled|bool|`false`|Enable persistent volume for metrics server|
|observability.metrics-server.service|object|-|Service configuration|
|observability.metrics-server.service.labels|object|-|Additional labels for metrics server service|
|observability.prometheus-node-exporter|object|-|Prometheus Node Exporter configuration|
|observability.prometheus-node-exporter.enabled|bool|`true`|Enable Prometheus Node Exporter deployment|
|observability.prometheus-node-exporter.fullnameOverride|string|`"node-exporter"`|String to fully override common.names.fullname|
|observability.prometheus-node-exporter.global|object|-|Global configuration|
|observability.prometheus-node-exporter.global.imageRegistry|string|`"quay.io"`|Global image registry|
|observability.prometheus-node-exporter.image|object|-|Node exporter image configuration|
|observability.prometheus-node-exporter.image.registry|string|`"quay.io"`|Image registry for node exporter|
|observability.prometheus-node-exporter.imagePullSecrets|list|-|Docker registry secret names as an array|
|observability.prometheus-node-exporter.kubeRBACProxy|object|-|Kube RBAC proxy configuration|
|observability.prometheus-node-exporter.kubeRBACProxy.image|object|-|Kube RBAC proxy image configuration|
|observability.prometheus-node-exporter.kubeRBACProxy.image.registry|string|`"quay.io"`|Image registry for kube RBAC proxy|
|observability.prometheus-node-exporter.nameOverride|string|`"node-exporter"`|String to partially override common.names.name|
|observability.prometheus-node-exporter.podAnnotations|object|-|Annotations for node exporter pods|
|observability.prometheus-node-exporter.podAnnotations."cluster-autoscaler.kubernetes.io/safe-to-evict"|string|`"true"`|Mark pod as safe to evict for cluster autoscaler|
|observability.prometheus-node-exporter.podAnnotations."prometheus.io/port"|string|`"9100"`|Port for Prometheus scraping|
|observability.prometheus-node-exporter.podAnnotations."prometheus.io/scrape"|string|`"true"`|Enable Prometheus scraping|
|observability.prometheus-node-exporter.podLabels|object|-|Labels for node exporter pods|
|observability.prometheus-node-exporter.podLabels."kots.io/app-slug"|string|`"settlemint-atk"`|KOTS application slug identifier|
|observability.tempo|object|-|Tempo configuration|
|observability.tempo.enabled|bool|`true`|Enable Tempo deployment|
|observability.tempo.fullnameOverride|string|`"tempo"`|String to fully override common.names.fullname|
|observability.tempo.persistence|object|-|Persistent volume configuration|
|observability.tempo.persistence.enabled|bool|`true`|Enable persistent volume for Tempo|
|observability.tempo.persistence.size|string|`"10Gi"`|Size of persistent volume|
|observability.tempo.podAnnotations|object|-|Annotations for Tempo pods|
|observability.tempo.podAnnotations."prometheus.io/path"|string|`"/metrics"`|Path for Prometheus metrics endpoint|
|observability.tempo.podAnnotations."prometheus.io/port"|string|`"3100"`|Port for Prometheus scraping|
|observability.tempo.podAnnotations."prometheus.io/scrape"|string|`"true"`|Enable Prometheus scraping|
|observability.tempo.podLabels|object|-|Labels for Tempo pods|
|observability.tempo.podLabels."kots.io/app-slug"|string|`"settlemint-atk"`|KOTS application slug identifier|
|observability.tempo.securityContext|object|-|Security context for Tempo pods|
|observability.tempo.securityContext.fsGroup|int|`65532`|Filesystem group ID|
|observability.tempo.securityContext.runAsGroup|int|`65532`|Group ID to run as|
|observability.tempo.securityContext.runAsNonRoot|bool|`true`|Run as non-root user|
|observability.tempo.securityContext.runAsUser|int|`65532`|User ID to run as|
|observability.tempo.tempo|object|-|Tempo server configuration|
|observability.tempo.tempo.metricsGenerator|object|-|Metrics generator configuration|
|observability.tempo.tempo.metricsGenerator.enabled|bool|`true`|Enable metrics generator|
|observability.tempo.tempo.metricsGenerator.remoteWriteUrl|string|`"http://o11y-metrics:8428/api/v1/write"`|Remote write URL for generated metrics|
|observability.tempo.tempo.overrides|object|-|Per-tenant overrides configuration|
|observability.tempo.tempo.overrides.defaults|object|-|Default overrides for all tenants|
|observability.tempo.tempo.overrides.defaults.global|object|-|Global configuration|
|observability.tempo.tempo.overrides.defaults.global.max_bytes_per_trace|int|`20000000`|Maximum bytes per trace|
|observability.tempo.tempo.overrides.defaults.ingestion|object|-|Ingestion configuration|
|observability.tempo.tempo.overrides.defaults.ingestion.max_traces_per_user|int|`100000`|Maximum traces per user|
|observability.tempo.tempo.overrides.defaults.ingestion.rate_limit_bytes|int|`30000000`|Rate limit in bytes per second|
|observability.tempo.tempo.pullSecrets|list|-|Docker registry secret names as an array|
|observability.tempo.tempo.reportingEnabled|bool|`false`|Enable usage reporting to Grafana Labs|
|observability.tempo.tempo.repository|string|`"docker.io/grafana/tempo"`|Tempo image repository|
|observability.tempo.tempo.retention|string|`"168h"`|Trace retention period|
|observability.tempo.tempoQuery|object|-|Tempo query configuration|
|observability.tempo.tempoQuery.ingress|object|-|Ingress configuration for Tempo query|
|observability.tempo.tempoQuery.ingress.annotations|object|-|Ingress annotations|
|observability.tempo.tempoQuery.ingress.annotations."nginx.ingress.kubernetes.io/auth-type"|string|`"basic"`|Authentication type for ingress|
|observability.tempo.tempoQuery.ingress.annotations."nginx.ingress.kubernetes.io/client-body-buffer-size"|string|`"500m"`|Buffer size for reading client request body|
|observability.tempo.tempoQuery.ingress.annotations."nginx.ingress.kubernetes.io/proxy-body-size"|string|`"500m"`|Maximum allowed size of client request body|
|observability.tempo.tempoQuery.ingress.annotations."nginx.ingress.kubernetes.io/proxy-read-timeout"|string|`"3600"`|Timeout for reading a response from proxied server|
|observability.tempo.tempoQuery.ingress.annotations."nginx.ingress.kubernetes.io/proxy-send-timeout"|string|`"3600"`|Timeout for transmitting a request to proxied server|
|observability.tempo.tempoQuery.ingress.enabled|bool|`false`|Enable ingress for Tempo query|
|observability.tempo.tempoQuery.ingress.hosts|list|-|List of ingress hosts|
|observability.tempo.tempoQuery.ingress.hosts[0]|string|`"traces.k8s.orb.local"`|Host name for Tempo query ingress|
|observability.tempo.tempoQuery.ingress.ingressClassName|string|`"atk-nginx"`|Ingress class name|
|observability.tempo.tempoQuery.ingress.pathType|string|`"Prefix"`|Path type for ingress rule|
|observability.tempo.tempoQuery.pullSecrets|list|-|Docker registry secret names as an array|
|observability.tempo.tempoQuery.repository|string|`"docker.io/grafana/tempo-query"`|Tempo query image repository|
|observability.victoria-metrics-single|object|-|Victoria Metrics Single configuration|
|observability.victoria-metrics-single.enabled|bool|`true`|Enable Victoria Metrics Single deployment|
|observability.victoria-metrics-single.global|object|-|Global configuration|
|observability.victoria-metrics-single.global.image|object|-|Global image configuration|
|observability.victoria-metrics-single.global.image.registry|string|`"docker.io"`|Global image registry|
|observability.victoria-metrics-single.global.imagePullSecrets|list|-|Global Docker registry secret names as an array (list)|
|observability.victoria-metrics-single.server|object|-|Victoria Metrics server configuration|
|observability.victoria-metrics-single.server.extraArgs|object|-|Extra arguments for Victoria Metrics server|
|observability.victoria-metrics-single.server.extraArgs."search.maxQueryLen"|int|`163840`|Maximum query length|
|observability.victoria-metrics-single.server.fullnameOverride|string|`"metrics"`|String to fully override common.names.fullname (string)|
|observability.victoria-metrics-single.server.ingress|object|-|Ingress configuration for Victoria Metrics|
|observability.victoria-metrics-single.server.ingress.annotations|object|-|Ingress annotations|
|observability.victoria-metrics-single.server.ingress.annotations."nginx.ingress.kubernetes.io/auth-realm"|string|`"Authentication Required - Metrics"`|Authentication realm message|
|observability.victoria-metrics-single.server.ingress.annotations."nginx.ingress.kubernetes.io/auth-secret"|string|`"observability-metrics"`|Secret name for basic authentication|
|observability.victoria-metrics-single.server.ingress.annotations."nginx.ingress.kubernetes.io/auth-type"|string|`"basic"`|Authentication type for ingress|
|observability.victoria-metrics-single.server.ingress.annotations."nginx.ingress.kubernetes.io/client-body-buffer-size"|string|`"500m"`|Buffer size for reading client request body|
|observability.victoria-metrics-single.server.ingress.annotations."nginx.ingress.kubernetes.io/proxy-body-size"|string|`"500m"`|Maximum allowed size of client request body|
|observability.victoria-metrics-single.server.ingress.annotations."nginx.ingress.kubernetes.io/proxy-read-timeout"|string|`"3600"`|Timeout for reading a response from proxied server|
|observability.victoria-metrics-single.server.ingress.annotations."nginx.ingress.kubernetes.io/proxy-send-timeout"|string|`"3600"`|Timeout for transmitting a request to proxied server|
|observability.victoria-metrics-single.server.ingress.enabled|bool|`false`|Enable ingress for Victoria Metrics|
|observability.victoria-metrics-single.server.ingress.hosts|list|-|List of ingress hosts|
|observability.victoria-metrics-single.server.ingress.hosts[0]|string|`{"name":"metrics.settlemint.local","path":"/","port":"http"}`|Host name for ingress|
|observability.victoria-metrics-single.server.ingress.hosts[0].path|string|`"/"`|Path for ingress rule|
|observability.victoria-metrics-single.server.ingress.hosts[0].port|string|`"http"`|Service port name|
|observability.victoria-metrics-single.server.ingress.ingressClassName|string|`"atk-nginx"`|Ingress class name|
|observability.victoria-metrics-single.server.ingress.pathType|string|`"Prefix"`|Path type for ingress rule|
|observability.victoria-metrics-single.server.persistentVolume|object|-|Persistent volume configuration|
|observability.victoria-metrics-single.server.persistentVolume.size|string|`"10Gi"`|Size of the persistent volume|
|observability.victoria-metrics-single.server.persistentVolume.storageClass|string|`""`|Storage class for persistent volume (uses default if empty)|
|observability.victoria-metrics-single.server.podAnnotations|object|-|Annotations for Victoria Metrics pods|
|observability.victoria-metrics-single.server.podAnnotations."prometheus.io/path"|string|`"/metrics"`|Path for Prometheus metrics endpoint|
|observability.victoria-metrics-single.server.podAnnotations."prometheus.io/port"|string|`"8428"`|Port for Prometheus scraping|
|observability.victoria-metrics-single.server.podAnnotations."prometheus.io/scrape"|string|`"true"`|Enable Prometheus scraping|
|observability.victoria-metrics-single.server.podLabels|object|-|Additional labels for Victoria Metrics pods|
|observability.victoria-metrics-single.server.podLabels."kots.io/app-slug"|string|`"settlemint-atk"`|KOTS application slug identifier|
|observability.victoria-metrics-single.server.resources|object|-|Resource requests and limits for Victoria Metrics server|
|observability.victoria-metrics-single.server.retentionPeriod|int|`1`|Data retention period in months|
|observability.victoria-metrics-single.server.service|object|-|Service configuration|
|observability.victoria-metrics-single.server.service.annotations|object|-|Annotations for Victoria Metrics service|
|observability.victoria-metrics-single.server.service.annotations."prometheus.io/path"|string|`"/metrics"`|Path for Prometheus metrics endpoint|
|observability.victoria-metrics-single.server.service.annotations."prometheus.io/port"|string|`"8428"`|Port for Prometheus scraping|
|observability.victoria-metrics-single.server.service.annotations."prometheus.io/scrape"|string|`"true"`|Enable Prometheus scraping|
|observability.victoria-metrics-single.server.service.labels|object|-|Labels for Victoria Metrics service|
|observability.victoria-metrics-single.server.service.labels."kots.io/app-slug"|string|`"settlemint-atk"`|KOTS application slug identifier|
|portal.affinity|object|-|Affinity for pod assignment|
|portal.autoscaling|object|-|Autoscaling configuration for Portal|
|portal.autoscaling.builtInMetrics|list|-|Built-in metrics configuration for CPU and memory based scaling|
|portal.autoscaling.builtInMetrics[0]|string|`{"resource":{"name":"cpu","target":{"averageUtilization":80,"type":"Utilization"}},"type":"Resource"}`|Metric type (Resource, Pods, Object, or External)|
|portal.autoscaling.builtInMetrics[0].resource|object|-|Resource metric configuration|
|portal.autoscaling.builtInMetrics[0].resource.name|string|`"cpu"`|Name of the resource metric (cpu or memory)|
|portal.autoscaling.builtInMetrics[0].resource.target|object|-|Target metric threshold configuration|
|portal.autoscaling.builtInMetrics[0].resource.target.averageUtilization|int|`80`|Target average CPU utilization percentage|
|portal.autoscaling.builtInMetrics[0].resource.target.type|string|`"Utilization"`|Target metric type (Utilization or AverageValue)|
|portal.autoscaling.builtInMetrics[1]|string|`{"resource":{"name":"memory","target":{"averageUtilization":80,"type":"Utilization"}},"type":"Resource"}`|Metric type (Resource, Pods, Object, or External)|
|portal.autoscaling.builtInMetrics[1].resource|object|-|Resource metric configuration|
|portal.autoscaling.builtInMetrics[1].resource.name|string|`"memory"`|Name of the resource metric (cpu or memory)|
|portal.autoscaling.builtInMetrics[1].resource.target|object|-|Target metric threshold configuration|
|portal.autoscaling.builtInMetrics[1].resource.target.averageUtilization|int|`80`|Target average memory utilization percentage|
|portal.autoscaling.builtInMetrics[1].resource.target.type|string|`"Utilization"`|Target metric type (Utilization or AverageValue)|
|portal.autoscaling.customMetrics|list|-|Custom metrics configuration|
|portal.autoscaling.enabled|bool|`false`|Enable autoscaling for Portal|
|portal.autoscaling.maxReplicas|int|`3`|Maximum number of Portal replicas|
|portal.autoscaling.minReplicas|int|`1`|Minimum number of Portal replicas|
|portal.commonAnnotations|object|-|Annotations to add to all deployed objects|
|portal.commonLabels|object|-|Labels to add to all deployed objects|
|portal.config|object|-|Portal configuration|
|portal.config.network|object|-|Network configuration|
|portal.config.network.networkId|string|`nil`|Network ID (defaults to global.chainId when unset)|
|portal.config.network.networkName|string|`nil`|Network name (defaults to global.chainName when unset)|
|portal.config.network.nodeRpcUrl|string|`"http://txsigner:3000"`|Node RPC URL|
|portal.config.postgresql|object|-|PostgreSQL overrides merged with global.datastores.portal.postgresql|
|portal.config.redis|object|-|Redis overrides merged with global.datastores.portal.redis|
|portal.containerSecurityContext|object|-|Container Security Context configuration (overrides global.securityContexts.container)|
|portal.extraEnvVars|list|-|Array with extra environment variables to add to Portal nodes|
|portal.extraEnvVarsCM|string|`""`|Name of existing ConfigMap containing extra env vars for Portal nodes|
|portal.extraEnvVarsSecret|string|`""`|Name of existing Secret containing extra env vars for Portal nodes|
|portal.extraInitContainers|list|-|Additional init containers to add to the Portal pod|
|portal.extraVolumeMounts|list|-|Optionally specify extra list of additional volumeMounts for the Portal container(s)|
|portal.extraVolumes|list|-|Optionally specify extra list of additional volumes for the Portal pod(s)|
|portal.fullnameOverride|string|`"portal"`|String to fully override common.names.fullname|
|portal.image|object|-|Portal image|
|portal.image.digest|string|`""`|Portal image digest in the way sha256:aa.... Please note this parameter, if set, will override the tag|
|portal.image.pullPolicy|string|`"IfNotPresent"`|Portal image pull policy|
|portal.image.pullSecrets|list|-|Portal image pull secrets|
|portal.image.registry|string|`"ghcr.io"`|Portal image registry|
|portal.image.repository|string|`"settlemint/btp-scs-portal"`|Portal image repository|
|portal.image.tag|string|`"8.6.9"`|Portal image tag (immutable tags are recommended)|
|portal.ingress|object|-|Ingress parameters|
|portal.ingress.annotations|object|-|Additional annotations for the Ingress resource. To enable certificate autogeneration, place here your cert-manager annotations.|
|portal.ingress.apiVersion|string|`""`|Force Ingress API version (automatically detected if not set)|
|portal.ingress.enabled|bool|`true`|Enable ingress record generation for Portal|
|portal.ingress.extraHosts|list|-|An array with additional hostname(s) to be covered with the ingress record|
|portal.ingress.extraPaths|list|-|An array with additional arbitrary paths that may need to be added to the ingress under the main host|
|portal.ingress.extraRules|list|-|Additional rules to be covered with this ingress record|
|portal.ingress.extraTls|list|-|TLS configuration for additional hostname(s) to be covered with this ingress record|
|portal.ingress.graphqlPath|string|`"/graphql"`|Additional path for GraphQL endpoint|
|portal.ingress.hostname|string|`"portal.k8s.orb.local"`|Default host for the ingress record|
|portal.ingress.ingressClassName|string|`"atk-nginx"`|IngressClass that will be be used to implement the Ingress (Kubernetes 1.18+)|
|portal.ingress.path|string|`"/"`|Default path for the ingress record|
|portal.ingress.pathType|string|`"ImplementationSpecific"`|Ingress path type|
|portal.ingress.secrets|list|-|Custom TLS certificates as secrets|
|portal.ingress.selfSigned|bool|`false`|Create a TLS secret for this ingress record using self-signed certificates generated by Helm|
|portal.ingress.tls|bool|`false`|Enable TLS configuration for the host defined at `ingress.hostname` parameter|
|portal.initContainer|object|-|Init container configurations for dependency management and pre-start tasks|
|portal.initContainer.downloadAbi|object|-|ABI download init container configuration|
|portal.initContainer.downloadAbi.enabled|bool|`true`|Enable the ABI download init container that syncs ConfigMaps via network-bootstrapper.|
|portal.initContainer.downloadAbi.image|object|-|Container image configuration for the ABI downloader|
|portal.initContainer.downloadAbi.image.pullPolicy|string|`"IfNotPresent"`|Image pull policy for the ABI download init container.|
|portal.initContainer.downloadAbi.image.repository|string|`"ghcr.io/settlemint/network-bootstrapper"`|OCI image hosting the network-bootstrapper CLI.|
|portal.initContainer.downloadAbi.image.tag|string|`"1.2.3"`|Image tag for the network-bootstrapper CLI.|
|portal.initContainer.downloadAbi.outputDirectory|string|`"/shared-abis"`|Directory where ABI files are written before being shared with the portal container.|
|portal.initContainer.downloadAbi.resources|object|-|Resource requests and limits for the ABI download init container|
|portal.initContainer.downloadAbi.resources.limits|object|-|Resource limits for the ABI download init container|
|portal.initContainer.downloadAbi.resources.limits.cpu|string|`"150m"`|CPU limit for the ABI download init container|
|portal.initContainer.downloadAbi.resources.limits.memory|string|`"128Mi"`|Memory limit for the ABI download init container|
|portal.initContainer.downloadAbi.resources.requests|object|-|Resource requests for the ABI download init container|
|portal.initContainer.downloadAbi.resources.requests.cpu|string|`"25m"`|CPU request for the ABI download init container|
|portal.initContainer.downloadAbi.resources.requests.memory|string|`"64Mi"`|Memory request for the ABI download init container|
|portal.initContainer.downloadAbi.securityContext|object|-|Security context for the ABI download init container|
|portal.initContainer.tcpCheck|object|-|TCP check init container configuration for service dependency verification|
|portal.initContainer.tcpCheck.dependencies|list|-|List of service dependencies to verify before starting portal|
|portal.initContainer.tcpCheck.dependencies[0]|string|`{"endpoint":"postgresql:5432","name":"postgresql"}`|Name of the dependent service|
|portal.initContainer.tcpCheck.dependencies[0].endpoint|string|`"postgresql:5432"`|TCP endpoint to check (format: host:port)|
|portal.initContainer.tcpCheck.enabled|bool|`true`|Enable TCP check init container to wait for dependent services|
|portal.initContainer.tcpCheck.image|object|-|Container image configuration for TCP check|
|portal.initContainer.tcpCheck.image.pullPolicy|string|`"IfNotPresent"`|Image pull policy for the TCP check init container|
|portal.initContainer.tcpCheck.image.repository|string|`"ghcr.io/settlemint/btp-waitforit"`|Repository for the TCP check init container image|
|portal.initContainer.tcpCheck.image.tag|string|`"v7.7.10"`|Image tag for the TCP check init container|
|portal.initContainer.tcpCheck.resources|object|-|Resource requests and limits for the TCP check init container|
|portal.initContainer.tcpCheck.resources.limits|object|-|Resource limits for the TCP check init container|
|portal.initContainer.tcpCheck.resources.limits.cpu|string|`"100m"`|CPU limit for the TCP check init container|
|portal.initContainer.tcpCheck.resources.limits.memory|string|`"64Mi"`|Memory limit for the TCP check init container|
|portal.initContainer.tcpCheck.resources.requests|object|-|Resource requests for the TCP check init container|
|portal.initContainer.tcpCheck.resources.requests.cpu|string|`"10m"`|CPU request for the TCP check init container|
|portal.initContainer.tcpCheck.resources.requests.memory|string|`"32Mi"`|Memory request for the TCP check init container|
|portal.initContainer.tcpCheck.timeout|int|`120`|Timeout in seconds for TCP connectivity checks|
|portal.lifecycleHooks|object|-|lifecycleHooks for the Portal container(s) to automate configuration before or after startup|
|portal.livenessProbe|object|-|Configure Portal containers' liveness probe|
|portal.livenessProbe.enabled|bool|`true`|Enable livenessProbe on Portal containers|
|portal.livenessProbe.failureThreshold|int|`3`|Failure threshold for livenessProbe|
|portal.livenessProbe.initialDelaySeconds|int|`10`|Initial delay seconds for livenessProbe|
|portal.livenessProbe.periodSeconds|int|`10`|Period seconds for livenessProbe|
|portal.livenessProbe.successThreshold|int|`1`|Success threshold for livenessProbe|
|portal.livenessProbe.tcpSocket|object|-|TCP socket parameters for livenessProbe|
|portal.livenessProbe.tcpSocket.port|string|`"http"`|Port for tcpSocket livenessProbe|
|portal.livenessProbe.timeoutSeconds|int|`5`|Timeout seconds for livenessProbe|
|portal.nameOverride|string|`""`|String to partially override common.names.fullname template (will maintain the release name)|
|portal.networkPolicy|object|-|Network policies configuration|
|portal.networkPolicy.addExternalClientAccess|bool|`true`|Allow access from pods with client label set to "true". Ignored if `networkPolicy.allowExternal` is true.|
|portal.networkPolicy.allowExternal|bool|`true`|The Policy model to apply|
|portal.networkPolicy.allowExternalEgress|bool|`true`|Allow the pod to access any range of port and all destinations.|
|portal.networkPolicy.enabled|bool|`false`|Enable creation of NetworkPolicy resources|
|portal.networkPolicy.extraEgress|list|-|Add extra egress rules to the NetworkPolicy (ignored if allowExternalEgress=true)|
|portal.networkPolicy.extraEgress[0]|list|-|Destination selectors for DNS resolution|
|portal.networkPolicy.extraEgress[0].ports|list|-|Allowed ports for DNS traffic|
|portal.networkPolicy.extraEgress[0].ports[0]|string|`{"port":53,"protocol":"UDP"}`|Protocol for DNS|
|portal.networkPolicy.extraEgress[0].ports[0].port|int|`53`|DNS port number|
|portal.networkPolicy.extraEgress[0].to[0]|object|-|Namespace selector for kube-dns|
|portal.networkPolicy.extraEgress[0].to[0].podSelector|object|-|Pod selector for kube-dns|
|portal.networkPolicy.extraEgress[0].to[0].podSelector.matchLabels|object|-|Labels to match kube-dns pods|
|portal.networkPolicy.extraEgress[1]|list|-|Destination selectors for PostgreSQL access|
|portal.networkPolicy.extraEgress[1].ports|list|-|Allowed ports for PostgreSQL traffic|
|portal.networkPolicy.extraEgress[1].ports[0]|string|`{"port":5432,"protocol":"TCP"}`|Protocol for PostgreSQL|
|portal.networkPolicy.extraEgress[1].ports[0].port|int|`5432`|PostgreSQL port number|
|portal.networkPolicy.extraEgress[1].to[0]|object|-|Pod selector for PostgreSQL|
|portal.networkPolicy.extraEgress[1].to[0].podSelector.matchLabels|object|-|Labels to match PostgreSQL pods|
|portal.networkPolicy.extraEgress[2]|list|-|Destination selectors for Redis access|
|portal.networkPolicy.extraEgress[2].ports|list|-|Allowed ports for Redis traffic|
|portal.networkPolicy.extraEgress[2].ports[0]|string|`{"port":6379,"protocol":"TCP"}`|Protocol for Redis|
|portal.networkPolicy.extraEgress[2].ports[0].port|int|`6379`|Redis port number|
|portal.networkPolicy.extraEgress[2].to[0]|object|-|Pod selector for Redis|
|portal.networkPolicy.extraEgress[2].to[0].podSelector.matchLabels|object|-|Labels to match Redis pods|
|portal.networkPolicy.extraEgress[3]|list|-|Destination selectors for external HTTPS access|
|portal.networkPolicy.extraEgress[3].ports|list|-|Allowed ports for external HTTPS traffic|
|portal.networkPolicy.extraEgress[3].ports[0]|string|`{"port":443,"protocol":"TCP"}`|Protocol for HTTPS|
|portal.networkPolicy.extraEgress[3].ports[0].port|int|`443`|HTTPS port number|
|portal.networkPolicy.extraEgress[3].to[0]|object|-|Namespace selector for all namespaces|
|portal.networkPolicy.extraIngress|list|-|Add extra ingress rules to the NetworkPolicy|
|portal.networkPolicy.extraIngress[0]|list|-|Source selectors for ingress traffic|
|portal.networkPolicy.extraIngress[0].from[0]|object|-|Namespace selector for ingress-nginx|
|portal.networkPolicy.extraIngress[0].from[0].namespaceSelector.matchLabels|object|-|Labels to match ingress-nginx namespace|
|portal.networkPolicy.extraIngress[0].from[1]|object|-|Pod selector for dapp pods|
|portal.networkPolicy.extraIngress[0].from[1].podSelector.matchLabels|object|-|Labels to match dapp pods|
|portal.networkPolicy.extraIngress[0].from[2]|object|-|Pod selector for same namespace pods|
|portal.networkPolicy.extraIngress[0].ports|list|-|Allowed ports for ingress traffic|
|portal.networkPolicy.extraIngress[0].ports[0]|string|`{"port":3000,"protocol":"TCP"}`|Protocol for HTTP port|
|portal.networkPolicy.extraIngress[0].ports[0].port|int|`3000`|HTTP port number|
|portal.networkPolicy.extraIngress[0].ports[1]|string|`{"port":3001,"protocol":"TCP"}`|Protocol for GraphQL port|
|portal.networkPolicy.extraIngress[0].ports[1].port|int|`3001`|GraphQL port number|
|portal.networkPolicy.ingressRules|object|-|Ingress rules configuration|
|portal.networkPolicy.ingressRules.accessOnlyFrom|object|-|Access restrictions configuration|
|portal.networkPolicy.ingressRules.accessOnlyFrom.enabled|bool|`false`|Enable ingress rule that makes Portal only accessible from a particular origin.|
|portal.networkPolicy.ingressRules.accessOnlyFrom.namespaceSelector|object|-|Namespace selector label that is allowed to access Portal. This label will be used to identified allowed namespace(s).|
|portal.networkPolicy.ingressRules.accessOnlyFrom.podSelector|object|-|Pods selector label that is allowed to access Portal. This label will be used to identified allowed pod(s).|
|portal.nodeAffinityPreset|object|-|Node affinity preset configuration|
|portal.nodeAffinityPreset.key|string|`""`|Node label key to match. Ignored if `affinity` is set|
|portal.nodeAffinityPreset.type|string|`""`|Node affinity preset type. Ignored if `affinity` is set. Allowed values: `soft` or `hard`|
|portal.nodeAffinityPreset.values|list|-|Node label values to match. Ignored if `affinity` is set|
|portal.nodeSelector|object|-|Node labels for pod assignment|
|portal.openShiftRoute|object|-|OpenShift Route parameters|
|portal.openShiftRoute.alternateBackends|list|-|Additional backends for weighted routing|
|portal.openShiftRoute.annotations|object|-|Additional annotations for the OpenShift route resource|
|portal.openShiftRoute.enabled|bool|`false`|Enable OpenShift route creation for Portal|
|portal.openShiftRoute.graphql|object|-|GraphQL route specific configuration|
|portal.openShiftRoute.graphql.alternateBackends|list|-|Additional backends for weighted routing (same structure as openShiftRoute.alternateBackends)|
|portal.openShiftRoute.graphql.annotations|object|-|Additional annotations for the GraphQL route resource|
|portal.openShiftRoute.graphql.enabled|bool|`true`|Enable a dedicated route for the GraphQL endpoint|
|portal.openShiftRoute.graphql.host|string|`""`|Hostname exposed via the GraphQL route (defaults to openShiftRoute.host when empty)|
|portal.openShiftRoute.graphql.path|string|`""`|HTTP path exposed via the GraphQL route (defaults to ingress.graphqlPath)|
|portal.openShiftRoute.graphql.port|object|-|Service port configuration for the GraphQL route target|
|portal.openShiftRoute.graphql.port.targetPort|string|`""`|Service target port name (defaults to `graphql`)|
|portal.openShiftRoute.graphql.tls|object|-|TLS configuration for the GraphQL route|
|portal.openShiftRoute.graphql.to|object|-|Primary service weight configuration for the GraphQL route|
|portal.openShiftRoute.graphql.to.weight|string|`""`|Weight assigned to the Portal service backend (defaults to openShiftRoute.to.weight)|
|portal.openShiftRoute.graphql.wildcardPolicy|string|`""`|Wildcard policy to apply to the GraphQL route (defaults to openShiftRoute.wildcardPolicy)|
|portal.openShiftRoute.host|string|`"portal.k8s.orb.local"`|Hostname exposed via the OpenShift route|
|portal.openShiftRoute.path|string|`"/"`|HTTP path exposed via the OpenShift route|
|portal.openShiftRoute.port|object|-|Service port configuration for the route target|
|portal.openShiftRoute.port.targetPort|string|`"http"`|Service target port name (must exist on the Portal service)|
|portal.openShiftRoute.tls|object|-|TLS configuration for the OpenShift route|
|portal.openShiftRoute.to|object|-|Primary service weight configuration|
|portal.openShiftRoute.to.weight|int|`100`|Weight assigned to the Portal service backend|
|portal.openShiftRoute.wildcardPolicy|string|`"None"`|Wildcard policy to apply to the route|
|portal.pdb|object|-|Pod disruption budget configuration|
|portal.pdb.enabled|bool|`false`|If true, create a pod disruption budget for pods.|
|portal.pdb.maxUnavailable|string|`""`|Maximum number/percentage of pods that may be made unavailable. Defaults to 1 if both pdb.minAvailable and pdb.maxUnavailable are empty.|
|portal.pdb.minAvailable|string|`""`|Minimum number/percentage of pods that should remain scheduled|
|portal.podAffinityPreset|string|`""`|Pod affinity preset. Ignored if `affinity` is set. Allowed values: `soft` or `hard`|
|portal.podAnnotations|object|-|Annotations for Portal pods|
|portal.podAntiAffinityPreset|string|`"soft"`|Pod anti-affinity preset. Ignored if `affinity` is set. Allowed values: `soft` or `hard`|
|portal.podLabels|object|-|Extra labels for Portal pods|
|portal.podSecurityContext|object|-|Pod Security Context configuration (overrides global.securityContexts.pod)|
|portal.priorityClassName|string|`""`|Portal pods' priority class name|
|portal.rbac|object|-|RBAC configuration controlling whether Role/RoleBinding resources are rendered.|
|portal.rbac.create|bool|`true`|Create Role/RoleBinding granting the portal access to ABI ConfigMaps.|
|portal.readinessProbe|object|-|Configure Portal containers' readiness probe|
|portal.readinessProbe.enabled|bool|`true`|Enable readinessProbe on Portal containers|
|portal.readinessProbe.failureThreshold|int|`3`|Failure threshold for readinessProbe|
|portal.readinessProbe.initialDelaySeconds|int|`5`|Initial delay seconds for readinessProbe|
|portal.readinessProbe.periodSeconds|int|`10`|Period seconds for readinessProbe|
|portal.readinessProbe.successThreshold|int|`1`|Success threshold for readinessProbe|
|portal.readinessProbe.tcpSocket|object|-|TCP socket parameters for readinessProbe|
|portal.readinessProbe.tcpSocket.port|string|`"http"`|Port for tcpSocket readinessProbe|
|portal.readinessProbe.timeoutSeconds|int|`5`|Timeout seconds for readinessProbe|
|portal.replicaCount|int|`1`|Number of Portal replicas to deploy|
|portal.resources|object|-|Portal containers resource requests and limits|
|portal.schedulerName|string|`""`|Alternate scheduler|
|portal.service|object|-|Service parameters|
|portal.service.annotations|object|-|Additional custom annotations for Portal service|
|portal.service.clusterIP|string|`""`|Portal service Cluster IP|
|portal.service.externalTrafficPolicy|string|`"Cluster"`|Portal service external traffic policy|
|portal.service.extraPorts|list|-|Extra ports to expose in the Portal service (normally used with the `sidecar` value)|
|portal.service.graphqlNodePort|string|`""`|Node port for GraphQL|
|portal.service.graphqlPort|int|`3001`|Portal service GraphQL port|
|portal.service.loadBalancerIP|string|`""`|Portal service Load Balancer IP|
|portal.service.loadBalancerSourceRanges|list|-|Portal service Load Balancer sources|
|portal.service.nodePort|string|`""`|Node port for HTTP|
|portal.service.port|int|`3000`|Portal service HTTP port|
|portal.service.sessionAffinity|string|`"None"`|Session Affinity for Kubernetes service, can be "None" or "ClientIP"|
|portal.service.sessionAffinityConfig|object|-|Additional settings for the sessionAffinity|
|portal.service.type|string|`"ClusterIP"`|Portal service type|
|portal.serviceAccount|object|-|Service account for Portal pods|
|portal.serviceAccount.annotations|object|-|Annotations for service account. Evaluated as a template. Only used if `create` is `true`.|
|portal.serviceAccount.automountServiceAccountToken|bool|`true`|Automount service account token for the deployment controller service account|
|portal.serviceAccount.create|bool|`true`|Specifies whether a ServiceAccount should be created|
|portal.serviceAccount.labels|object|-|Extra labels to be added to the service account|
|portal.serviceAccount.name|string|`""`|The name of the ServiceAccount to use.|
|portal.startupProbe|object|-|Configure Portal containers' startup probe|
|portal.startupProbe.enabled|bool|`false`|Enable startupProbe on Portal containers|
|portal.startupProbe.failureThreshold|int|`10`|Failure threshold for startupProbe|
|portal.startupProbe.initialDelaySeconds|int|`30`|Initial delay seconds for startupProbe|
|portal.startupProbe.periodSeconds|int|`10`|Period seconds for startupProbe|
|portal.startupProbe.successThreshold|int|`1`|Success threshold for startupProbe|
|portal.startupProbe.timeoutSeconds|int|`5`|Timeout seconds for startupProbe|
|portal.tests|object|-|Test parameters|
|portal.tests.image|object|-|Image for test pods|
|portal.tests.image.pullPolicy|string|`"IfNotPresent"`|Test image pull policy|
|portal.tests.image.registry|string|`"docker.io"`|Test image registry|
|portal.tests.image.repository|string|`"busybox"`|Test image repository|
|portal.tests.image.tag|string|`"1.37.0"`|Test image tag|
|portal.tolerations|list|-|Tolerations for pod assignment|
|portal.topologySpreadConstraints|list|-|Topology Spread Constraints for pod assignment|
|portal.updateStrategy|object|-|Update strategy configuration for Portal deployment|
|portal.updateStrategy.rollingUpdate|object|-|Portal deployment rolling update configuration parameters|
|portal.updateStrategy.type|string|`"RollingUpdate"`|Portal deployment strategy type|
|support.ingress-nginx|object|-|Ingress NGINX configuration (object)|
|support.ingress-nginx.controller|object|-|Controller configuration (object)|
|support.ingress-nginx.controller.admissionWebhooks|object|-|Admission webhooks configuration (object)|
|support.ingress-nginx.controller.admissionWebhooks.enabled|bool|`false`|Enable admission webhooks (bool)|
|support.ingress-nginx.controller.affinity|object|-|Affinity configuration|
|support.ingress-nginx.controller.affinity.podAntiAffinity|object|-|Pod anti-affinity rules to distribute pods across nodes|
|support.ingress-nginx.controller.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution|list|-|Preferred anti-affinity rules (soft requirement)|
|support.ingress-nginx.controller.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution[0]|int|`{"podAffinityTerm":{"labelSelector":{"matchExpressions":[{"key":"app.kubernetes.io/component","operator":"In","values":["controller"]},{"key":"app.kubernetes.io/name","operator":"In","values":["ingress-nginx"]}]},"topologyKey":"kubernetes.io/hostname"},"weight":100}`|Weight for scheduling preference (higher = more preferred)|
|support.ingress-nginx.controller.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution[0].podAffinityTerm|object|-|Pod affinity term defining the anti-affinity rule|
|support.ingress-nginx.controller.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution[0].podAffinityTerm.labelSelector|object|-|Label selector for matching pods|
|support.ingress-nginx.controller.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution[0].podAffinityTerm.labelSelector.matchExpressions|list|-|Match expressions for label selection|
|support.ingress-nginx.controller.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution[0].podAffinityTerm.labelSelector.matchExpressions[0]|string|`{"key":"app.kubernetes.io/component","operator":"In","values":["controller"]}`|Label key to match|
|support.ingress-nginx.controller.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution[0].podAffinityTerm.labelSelector.matchExpressions[0].operator|string|`"In"`|Operator for label matching|
|support.ingress-nginx.controller.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution[0].podAffinityTerm.labelSelector.matchExpressions[0].values|list|-|Values to match for the label|
|support.ingress-nginx.controller.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution[0].podAffinityTerm.labelSelector.matchExpressions[1]|string|`{"key":"app.kubernetes.io/name","operator":"In","values":["ingress-nginx"]}`|Label key to match|
|support.ingress-nginx.controller.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution[0].podAffinityTerm.labelSelector.matchExpressions[1].operator|string|`"In"`|Operator for label matching|
|support.ingress-nginx.controller.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution[0].podAffinityTerm.labelSelector.matchExpressions[1].values|list|-|Values to match for the label|
|support.ingress-nginx.controller.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution[0].podAffinityTerm.topologyKey|string|`"kubernetes.io/hostname"`|Topology key for spreading pods across nodes|
|support.ingress-nginx.controller.allowSnippetAnnotations|bool|`true`|Allow snippet annotations in Ingress objects|
|support.ingress-nginx.controller.autoscaling|object|-|Autoscaling configuration (object)|
|support.ingress-nginx.controller.autoscaling.behaviour|object|-|Autoscaling behavior configuration (object)|
|support.ingress-nginx.controller.autoscaling.behaviour.scaleDown|object|-|Scale down behavior|
|support.ingress-nginx.controller.autoscaling.behaviour.scaleDown.policies|list|-|Scale down policies|
|support.ingress-nginx.controller.autoscaling.behaviour.scaleDown.policies[0]|string|`{"periodSeconds":180,"type":"Pods","value":1}`|Policy type for scale down|
|support.ingress-nginx.controller.autoscaling.behaviour.scaleDown.policies[0].periodSeconds|int|`180`|Period in seconds for scale down evaluation|
|support.ingress-nginx.controller.autoscaling.behaviour.scaleDown.policies[0].value|int|`1`|Number of pods to scale down|
|support.ingress-nginx.controller.autoscaling.behaviour.scaleDown.stabilizationWindowSeconds|int|`300`|Stabilization window for scale down|
|support.ingress-nginx.controller.autoscaling.behaviour.scaleUp|object|-|Scale up behavior|
|support.ingress-nginx.controller.autoscaling.behaviour.scaleUp.policies|list|-|Scale up policies|
|support.ingress-nginx.controller.autoscaling.behaviour.scaleUp.policies[0]|string|`{"periodSeconds":60,"type":"Pods","value":2}`|Policy type for scale up|
|support.ingress-nginx.controller.autoscaling.behaviour.scaleUp.policies[0].periodSeconds|int|`60`|Period in seconds for scale up evaluation|
|support.ingress-nginx.controller.autoscaling.behaviour.scaleUp.policies[0].value|int|`2`|Number of pods to scale up|
|support.ingress-nginx.controller.autoscaling.behaviour.scaleUp.stabilizationWindowSeconds|int|`0`|Stabilization window for scale up|
|support.ingress-nginx.controller.autoscaling.enabled|bool|`false`|Enable autoscaling (bool)|
|support.ingress-nginx.controller.autoscaling.maxReplicas|int|`10`|Maximum number of replicas (int)|
|support.ingress-nginx.controller.autoscaling.minReplicas|int|`2`|Minimum number of replicas (int)|
|support.ingress-nginx.controller.autoscaling.targetCPUUtilizationPercentage|int|`80`|Target CPU utilization percentage|
|support.ingress-nginx.controller.autoscaling.targetMemoryUtilizationPercentage|int|`80`|Target memory utilization percentage|
|support.ingress-nginx.controller.config|object|-|NGINX configuration|
|support.ingress-nginx.controller.config.annotations-risk-level|string|`"Critical"`|Risk level for allowing snippet annotations (Critical/High/Medium/Low)|
|support.ingress-nginx.controller.config.client-body-buffer-size|string|`"128k"`|Size of buffer for reading client request body|
|support.ingress-nginx.controller.config.enable-access-log-for-default-backend|string|`"true"`|Enable access logging for default backend requests|
|support.ingress-nginx.controller.config.enable-brotli|string|`"true"`|Enable Brotli compression for responses|
|support.ingress-nginx.controller.config.enable-opentelemetry|string|`"true"`|Enable OpenTelemetry tracing integration|
|support.ingress-nginx.controller.config.enable-underscores-in-headers|string|`"true"`|Allow underscores in client request header names|
|support.ingress-nginx.controller.config.http-snippet|string|`"lua_need_request_body on;\n\nmap $status $request_body_filtered {\n    204     \"\";\n    default $request_body_binary_check;\n}\n\nmap $request_body $request_body_binary_check {\n    ~[^[:print:]]  \"[binary data]\";\n    default       $request_body;\n}\n\nserver {\n    listen 18080;\n\n    location /nginx_status {\n        allow all;\n        stub_status on;\n    }\n    location / {\n        return 404;\n    }\n}\n"`|Custom NGINX HTTP configuration snippet for Lua request body filtering and status endpoint|
|support.ingress-nginx.controller.config.http2-push-preload|string|`"true"`|Enable HTTP/2 server push preload|
|support.ingress-nginx.controller.config.ignore-invalid-headers|string|`"false"`|Whether to ignore invalid headers in client requests|
|support.ingress-nginx.controller.config.limit-req-status-code|string|`"429"`|HTTP status code to return when rate limit is exceeded|
|support.ingress-nginx.controller.config.log-format-escape-json|string|`"true"`|Escape special characters in JSON log format|
|support.ingress-nginx.controller.config.log-format-upstream|string|`"{\"proxyUpstreamName\": \"$proxy_upstream_name\", \"httpRequest\":{\"requestMethod\": \"$request_method\", \"requestUrl\": \"$host$request_uri\", \"status\": $status, \"requestBody\": \"${request_body_filtered}\"}, \"cloudflare\": {\"cfConnectingIp\": \"$http_cf_connecting_ip\", \"cfIpCountry\": \"$http_cf_ipcountry\", \"cfRay\": \"$http_cf_ray\", \"trueClientIp\": \"$http_true_client_ip\"}, \"meta\": {\"timestamp\": \"$time_iso8601\", \"latency\": \"$upstream_response_time s\", \"requestID\": \"$req_id\", \"requestSize\": \"$request_length\", \"responseSize\": \"$upstream_response_length\", \"userAgent\": \"$http_user_agent\", \"referer\": \"$http_referer\", \"protocol\":\"$server_protocol\", \"proxyAlternativeUpstreamName\": \"$proxy_alternative_upstream_name\", \"upstreamStatus\": \"$upstream_status\", \"upstreamAddr\": \"$upstream_addr\", \"cfVisitor\": \"$http_cf_visitor\", \"cfRequestId\": \"$http_cf_request_id\"}}"`|JSON format for upstream access logs with request/response metadata|
|support.ingress-nginx.controller.config.max-worker-connections|string|`"65536"`|Maximum number of simultaneous connections per worker process|
|support.ingress-nginx.controller.config.nginx-status-ipv4-whitelist|string|`"0.0.0.0"`|IPv4 CIDR whitelist for NGINX status endpoint (0.0.0.0 = all)|
|support.ingress-nginx.controller.config.opentelemetry-trust-incoming-span|string|`"true"`|Trust incoming trace context from client requests|
|support.ingress-nginx.controller.config.otel-max-export-batch-size|string|`"512"`|Maximum number of spans per OpenTelemetry batch export|
|support.ingress-nginx.controller.config.otel-max-queuesize|string|`"2048"`|Maximum queue size for OpenTelemetry span exports|
|support.ingress-nginx.controller.config.otel-sampler|string|`"AlwaysOn"`|OpenTelemetry sampling strategy (AlwaysOn/AlwaysOff/TraceIdRatioBased)|
|support.ingress-nginx.controller.config.otel-sampler-parent-based|string|`"false"`|Whether to respect parent span sampling decisions|
|support.ingress-nginx.controller.config.otel-sampler-ratio|string|`"1.0"`|Sampling ratio when using TraceIdRatioBased sampler (0.0-1.0)|
|support.ingress-nginx.controller.config.otel-schedule-delay-millis|string|`"5000"`|Delay in milliseconds between OpenTelemetry batch exports|
|support.ingress-nginx.controller.config.otlp-collector-host|string|`"o11y-alloy"`|OpenTelemetry collector hostname for trace exports|
|support.ingress-nginx.controller.config.otlp-collector-port|string|`"4317"`|OpenTelemetry collector port for trace exports|
|support.ingress-nginx.controller.config.proxy-body-size|string|`"500M"`|Maximum client request body size|
|support.ingress-nginx.controller.config.proxy-buffer-size|string|`"128k"`|Size of buffer used for reading response header from proxied server|
|support.ingress-nginx.controller.config.proxy-buffering|string|`"on"`|Enable or disable buffering of responses from proxied server|
|support.ingress-nginx.controller.config.proxy-buffers-number|string|`"4"`|Number of buffers used for reading response from proxied server|
|support.ingress-nginx.controller.config.proxy-busy-buffers-size|string|`"128k"`|Size limit for buffers that are busy sending a response to client|
|support.ingress-nginx.controller.config.proxy-max-temp-file-size|string|`"1024m"`|Maximum size of temporary file for buffering response from proxied server|
|support.ingress-nginx.controller.config.proxy-read-timeout|string|`"3600"`|Timeout for reading response from proxied server|
|support.ingress-nginx.controller.config.proxy-send-timeout|string|`"3600"`|Timeout for sending request to proxied server|
|support.ingress-nginx.controller.config.proxy_next_upstream|string|`"error timeout http_500 http_502 http_503 http_504"`|Conditions for trying next upstream server on error|
|support.ingress-nginx.controller.config.proxy_next_upstream_timeout|string|`"30"`|Timeout for trying next upstream server (seconds)|
|support.ingress-nginx.controller.config.proxy_next_upstream_tries|string|`"3"`|Maximum number of upstream servers to try|
|support.ingress-nginx.controller.config.ssl-ciphers|string|`"ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384:AES128-GCM-SHA256:AES128-GCM-SHA384"`|SSL/TLS cipher suites to use (strong ciphers only)|
|support.ingress-nginx.controller.config.ssl-redirect|string|`"false"`|Enable automatic redirect from HTTP to HTTPS|
|support.ingress-nginx.controller.config.tcp-fast-open|string|`"3000"`|Enables TCP Fast Open with specified queue size|
|support.ingress-nginx.controller.config.upstream-keepalive-connections|string|`"64"`|Number of idle keepalive connections to upstream servers|
|support.ingress-nginx.controller.config.upstream-keepalive-timeout|string|`"120"`|Timeout for idle keepalive connections to upstream servers|
|support.ingress-nginx.controller.config.use-forwarded-headers|string|`"false"`|Enable use of X-Forwarded-* headers|
|support.ingress-nginx.controller.config.use-http2|string|`"true"`|Enable HTTP/2 protocol support|
|support.ingress-nginx.controller.config.worker-processes|string|`"auto"`|Number of worker processes (auto = CPU cores)|
|support.ingress-nginx.controller.extraArgs|object|-|Extra arguments for the controller|
|support.ingress-nginx.controller.extraArgs.enable-ssl-passthrough|string|`"true"`|Enable SSL passthrough mode for TLS termination at backend|
|support.ingress-nginx.controller.image|object|-|Controller container image configuration|
|support.ingress-nginx.controller.image.digest|string|`""`|Image digest for immutable deployments|
|support.ingress-nginx.controller.image.digestChroot|string|`""`|Image digest for chroot variant|
|support.ingress-nginx.controller.image.image|string|`"ingress-nginx/controller"`|Ingress NGINX controller image name|
|support.ingress-nginx.controller.ingressClass|string|`"atk-nginx"`|Ingress class name|
|support.ingress-nginx.controller.ingressClassResource|object|-|Ingress class resource configuration|
|support.ingress-nginx.controller.ingressClassResource.controllerValue|string|`"k8s.io/atk-nginx"`|Controller value for IngressClass resource|
|support.ingress-nginx.controller.ingressClassResource.default|bool|`false`|Set this IngressClass as cluster default|
|support.ingress-nginx.controller.ingressClassResource.enabled|bool|`true`|Enable creation of IngressClass resource|
|support.ingress-nginx.controller.ingressClassResource.name|string|`"atk-nginx"`|If you run more than one platform versions on a single cluster, you need to make sure these are unique|
|support.ingress-nginx.controller.metrics|object|-|Metrics configuration|
|support.ingress-nginx.controller.metrics.enabled|bool|`true`|Enable Prometheus metrics endpoint|
|support.ingress-nginx.controller.metrics.service|object|-|Metrics service configuration|
|support.ingress-nginx.controller.metrics.service.annotations|object|-|Annotations for metrics service|
|support.ingress-nginx.controller.metrics.service.annotations."prometheus.io/port"|string|`"10254"`|Prometheus metrics port|
|support.ingress-nginx.controller.metrics.service.annotations."prometheus.io/scrape"|string|`"true"`|Enable Prometheus scraping for metrics|
|support.ingress-nginx.controller.metrics.service.labels|object|-|Labels for metrics service|
|support.ingress-nginx.controller.metrics.service.labels."kots.io/app-slug"|string|`"settlemint-atk"`|KOTS application identifier for SettleMint ATK|
|support.ingress-nginx.controller.opentelemetry|object|-|OpenTelemetry configuration|
|support.ingress-nginx.controller.opentelemetry.enabled|bool|`true`|Enable OpenTelemetry sidecar for distributed tracing|
|support.ingress-nginx.controller.opentelemetry.image|object|-|OpenTelemetry image configuration|
|support.ingress-nginx.controller.opentelemetry.image.registry|string|`"registry.k8s.io"`|OpenTelemetry image registry|
|support.ingress-nginx.controller.patch|object|-|Patch configuration|
|support.ingress-nginx.controller.patch.image|object|-|Patch job image configuration|
|support.ingress-nginx.controller.patch.image.registry|string|`"registry.k8s.io"`|Patch job image registry|
|support.ingress-nginx.controller.podAnnotations|object|-|Pod annotations|
|support.ingress-nginx.controller.podAnnotations."prometheus.io/port"|string|`"10254"`|Prometheus metrics port|
|support.ingress-nginx.controller.podAnnotations."prometheus.io/scrape"|string|`"true"`|Enable Prometheus scraping for metrics|
|support.ingress-nginx.controller.podLabels|object|-|Pod labels|
|support.ingress-nginx.controller.podLabels."kots.io/app-slug"|string|`"settlemint-atk"`|KOTS application identifier for SettleMint ATK|
|support.ingress-nginx.controller.replicaCount|int|`1`|Number of controller replicas (int)|
|support.ingress-nginx.controller.resources|object|-|Resource configuration|
|support.ingress-nginx.controller.runAsUser|int|`2016`|User ID to run the controller process|
|support.ingress-nginx.controller.service|object|-|Service configuration|
|support.ingress-nginx.controller.service.annotations|object|-|Service annotations|
|support.ingress-nginx.controller.service.annotations."external-dns.alpha.kubernetes.io/cloudflare-proxied"|string|`"true"`|Enable Cloudflare proxy for external-dns managed records|
|support.ingress-nginx.controller.service.annotations."external-dns.alpha.kubernetes.io/hostname"|string|`"settlemint.local, *.settlemint.local"`|DNS hostnames for external-dns to manage|
|support.ingress-nginx.controller.service.annotations."service.beta.kubernetes.io/aws-load-balancer-backend-protocol"|string|`"tcp"`|AWS load balancer backend protocol|
|support.ingress-nginx.controller.service.annotations."service.beta.kubernetes.io/aws-load-balancer-nlb-target-type"|string|`"ip"`|AWS NLB target type (ip/instance)|
|support.ingress-nginx.controller.service.annotations."service.beta.kubernetes.io/aws-load-balancer-scheme"|string|`"internet-facing"`|AWS load balancer scheme (internet-facing/internal)|
|support.ingress-nginx.controller.service.annotations."service.beta.kubernetes.io/aws-load-balancer-type"|string|`"external"`|AWS load balancer type (external/internal)|
|support.ingress-nginx.controller.service.annotations."service.beta.kubernetes.io/azure-load-balancer-disable-tcp-reset"|string|`"true"`|Disable TCP reset on Azure load balancer|
|support.ingress-nginx.controller.service.annotations."service.beta.kubernetes.io/azure-load-balancer-health-probe-request-path"|string|`"/healthz"`|Azure load balancer health probe request path|
|support.ingress-nginx.controller.service.annotations."service.beta.kubernetes.io/azure-load-balancer-tcp-idle-timeout"|string|`"30"`|Azure load balancer TCP idle timeout in minutes|
|support.ingress-nginx.controller.service.externalTrafficPolicy|string|`"Local"`|External traffic policy for preserving client source IP (Local/Cluster)|
|support.ingress-nginx.controller.service.type|string|`"LoadBalancer"`|Kubernetes service type (LoadBalancer/ClusterIP/NodePort)|
|support.ingress-nginx.controller.updateStrategy|object|-|Update strategy configuration|
|support.ingress-nginx.controller.updateStrategy.rollingUpdate|object|-|Rolling update configuration|
|support.ingress-nginx.controller.updateStrategy.rollingUpdate.maxSurge|string|`"100%"`|Maximum number of pods that can be created above desired count|
|support.ingress-nginx.controller.updateStrategy.rollingUpdate.maxUnavailable|string|`"0%"`|Maximum number of pods that can be unavailable during update|
|support.ingress-nginx.controller.updateStrategy.type|string|`"RollingUpdate"`|Update strategy type|
|support.ingress-nginx.defaultBackend|object|-|Default backend configuration (object)|
|support.ingress-nginx.defaultBackend.enabled|bool|`false`|Enable default backend (bool)|
|support.ingress-nginx.enabled|bool|`true`|Enable Ingress NGINX deployment (bool)|
|support.ingress-nginx.fullnameOverride|string|`"ingress-nginx"`|String to fully override common.names.fullname (string)|
|support.ingress-nginx.global|object|-|Global configuration|
|support.ingress-nginx.global.image|object|-|Global image configuration|
|support.ingress-nginx.global.image.registry|string|`"registry.k8s.io"`|Global image registry|
|support.ingress-nginx.imagePullSecrets|list|-|Global Docker registry secret names as an array (list)|
|support.minio|object|-|MinIO configuration (object)|
|support.minio.buckets|list|-|Automatic bucket creation|
|support.minio.buckets[0]|string|`{"name":"atk","policy":"none","purge":false}`|Bucket name|
|support.minio.buckets[0].policy|string|`"none"`|Bucket access policy (none/download/upload/public)|
|support.minio.buckets[0].purge|bool|`false`|Whether to purge bucket contents on deletion|
|support.minio.consoleIngress|object|-|Console ingress configuration (object)|
|support.minio.consoleIngress.enabled|bool|`true`|Enable ingress for MinIO console|
|support.minio.consoleIngress.hosts|list|-|Hosts for MinIO console ingress|
|support.minio.consoleIngress.ingressClassName|string|`"atk-nginx"`|IngressClass for MinIO console|
|support.minio.consoleIngress.path|string|`"/"`|Path for MinIO console ingress|
|support.minio.enabled|bool|`true`|Enable MinIO deployment (bool)|
|support.minio.fullnameOverride|string|`"minio"`|String to fully override common.names.fullname (string)|
|support.minio.image|object|-|MinIO image configuration|
|support.minio.image.repository|string|`"docker.io/minio/minio"`|MinIO image repository|
|support.minio.image.tag|string|`"RELEASE.2025-09-07T16-13-09Z"`|MinIO image tag (immutable tags are recommended)|
|support.minio.ingress|object|-|Ingress configuration for MinIO API (object)|
|support.minio.ingress.enabled|bool|`true`|Enable ingress for MinIO API|
|support.minio.ingress.hosts|list|-|Hosts for MinIO API ingress|
|support.minio.ingress.ingressClassName|string|`"atk-nginx"`|IngressClass for MinIO API|
|support.minio.ingress.path|string|`"/"`|Path for MinIO API ingress|
|support.minio.mode|string|`"standalone"`|MinIO deployment mode (string)|
|support.minio.persistence|object|-|Persistence configuration (object)|
|support.minio.persistence.enabled|bool|`true`|Enable persistent volume for MinIO (bool)|
|support.minio.persistence.size|string|`"1Gi"`|Size of the persistent volume (string)|
|support.minio.replicas|int|`1`|Number of MinIO replicas (int)|
|support.minio.resources|object|-|MinIO resource requests and limits (object)|
|support.minio.resources.limits|object|-|Resource limits (object)|
|support.minio.resources.limits.cpu|string|`"200m"`|CPU limit (string)|
|support.minio.resources.limits.memory|string|`"512Mi"`|Memory limit (string)|
|support.minio.resources.requests|object|-|Resource requests (object)|
|support.minio.resources.requests.cpu|string|`"100m"`|CPU request (string)|
|support.minio.resources.requests.memory|string|`"256Mi"`|Memory request (string)|
|support.minio.rootPassword|string|`"atk-password"`|MinIO root user password (string)|
|support.minio.rootUser|string|`"admin"`|MinIO root user credentials (string)|
|support.minio.users|list|-|Automatic user/service account creation|
|support.minio.users[0]|string|`{"accessKey":"atk-service","policy":"readwrite","secretKey":"atk-service-secret"}`|MinIO access key for user authentication|
|support.minio.users[0].policy|string|`"readwrite"`|User access policy (readonly/writeonly/readwrite/consoleAdmin)|
|support.minio.users[0].secretKey|string|`"atk-service-secret"`|MinIO secret key for user authentication|
|support.postgresql|object|-|PostgreSQL configuration (object)|
|support.postgresql.commonLabels|object|-|Common labels to add to all PostgreSQL resources|
|support.postgresql.commonLabels."app.kubernetes.io/managed-by"|string|`"helm"`|Identifies Helm as the manager of this resource|
|support.postgresql.commonLabels."kots.io/app-slug"|string|`"settlemint-atk"`|KOTS application identifier for SettleMint ATK|
|support.postgresql.enabled|bool|`true`|Enable PostgreSQL deployment (bool)|
|support.postgresql.fullnameOverride|string|`"postgresql"`|String to fully override common.names.fullname (string)|
|support.postgresql.image|object|-|PostgreSQL image configuration|
|support.postgresql.image.pullPolicy|string|`"IfNotPresent"`|PostgreSQL image pull policy|
|support.postgresql.image.registry|string|`"docker.io"`|PostgreSQL image registry|
|support.postgresql.image.repository|string|`"postgres"`|PostgreSQL image repository|
|support.postgresql.image.tag|string|`"18.0-alpine"`|PostgreSQL image tag (immutable tags are recommended)|
|support.postgresql.imagePullSecrets|list|-|Global Docker registry secret names as an array (list)|
|support.postgresql.initdb|object|-|Database initialization scripts|
|support.postgresql.initdb.scripts|object|-|Database initialization scripts|
|support.postgresql.initdb.scripts."create_databases.sql"|string|`"-- Create databases and users for all ATK services\nCREATE DATABASE blockscout;\nCREATE USER blockscout WITH PASSWORD 'atk' SUPERUSER;\nGRANT ALL PRIVILEGES ON DATABASE blockscout TO blockscout;\n\\c blockscout;\nGRANT ALL ON SCHEMA public TO blockscout;\n\n\\c postgres;\nCREATE DATABASE thegraph WITH ENCODING 'UTF8' LC_COLLATE='C' LC_CTYPE='C' TEMPLATE template0;\nCREATE USER thegraph WITH PASSWORD 'atk' SUPERUSER;\nGRANT ALL PRIVILEGES ON DATABASE thegraph TO thegraph;\n\\c thegraph;\nGRANT ALL ON SCHEMA public TO thegraph;\n\n\\c postgres;\nCREATE DATABASE hasura;\nCREATE USER hasura WITH PASSWORD 'atk' SUPERUSER;\nGRANT ALL PRIVILEGES ON DATABASE hasura TO hasura;\n\\c hasura;\nGRANT ALL ON SCHEMA public TO hasura;\n\n\\c postgres;\nCREATE DATABASE portal;\nCREATE USER portal WITH PASSWORD 'atk' SUPERUSER;\nGRANT ALL PRIVILEGES ON DATABASE portal TO portal;\n\\c portal;\nGRANT ALL ON SCHEMA public TO portal;\n\n\\c postgres;\nCREATE DATABASE txsigner;\nCREATE USER txsigner WITH PASSWORD 'atk' SUPERUSER;\nGRANT ALL PRIVILEGES ON DATABASE txsigner TO txsigner;\n\\c txsigner;\nGRANT ALL ON SCHEMA public TO txsigner;\n"`|SQL script to create databases and users for all ATK services|
|support.postgresql.persistence|object|-|Persistence configuration (object)|
|support.postgresql.persistence.accessModes|list|-|Access modes for persistent volume|
|support.postgresql.persistence.enabled|bool|`true`|Enable persistent volume for PostgreSQL (bool)|
|support.postgresql.persistence.size|string|`"8Gi"`|Size of the persistent volume (string)|
|support.postgresql.persistence.storageClass|string|`""`|Storage class for persistent volume (uses default if empty)|
|support.postgresql.postgresql|object|-|PostgreSQL authentication configuration (object)|
|support.postgresql.postgresql.database|string|`"postgres"`|PostgreSQL database name (string)|
|support.postgresql.postgresql.password|string|`"atk"`|PostgreSQL password (string)|
|support.postgresql.postgresql.username|string|`"postgres"`|PostgreSQL username (string)|
|support.postgresql.postgresql_conf|object|-|PostgreSQL configuration tuned for development (object)|
|support.postgresql.postgresql_conf.checkpoint_completion_target|float|`0.9`|Target for completion of checkpoint processing|
|support.postgresql.postgresql_conf.default_statistics_target|int|`100`|Default statistics target for table columns|
|support.postgresql.postgresql_conf.effective_cache_size|string|`"1GB"`|Planner's assumption about the effective size of the disk cache|
|support.postgresql.postgresql_conf.effective_io_concurrency|int|`200`|Number of concurrent disk I/O operations|
|support.postgresql.postgresql_conf.maintenance_work_mem|string|`"64MB"`|Specifies the maximum amount of memory for maintenance operations|
|support.postgresql.postgresql_conf.max_connections|int|`1000`|Maximum number of concurrent connections|
|support.postgresql.postgresql_conf.max_wal_size|string|`"4GB"`|Maximum size to which the WAL will grow during automatic checkpoints|
|support.postgresql.postgresql_conf.min_wal_size|string|`"1GB"`|Minimum size to which the WAL will shrink|
|support.postgresql.postgresql_conf.random_page_cost|float|`1.1`|Planner's assumption about the cost of a non-sequentially-fetched disk page|
|support.postgresql.postgresql_conf.shared_buffers|string|`"256MB"`|Amount of memory dedicated to PostgreSQL to use for caching data|
|support.postgresql.postgresql_conf.wal_buffers|string|`"16MB"`|Amount of memory used in shared memory for WAL data|
|support.postgresql.postgresql_conf.work_mem|string|`"4MB"`|Amount of memory to be used by internal sort operations and hash tables|
|support.postgresql.resources|object|-|Resource configuration for development (object)|
|support.postgresql.resources.limits|object|-|Resource limits (object)|
|support.postgresql.resources.limits.cpu|string|`"500m"`|CPU limit (string)|
|support.postgresql.resources.limits.memory|string|`"1Gi"`|Memory limit (string)|
|support.postgresql.resources.requests|object|-|Resource requests (object)|
|support.postgresql.resources.requests.cpu|string|`"100m"`|CPU request (string)|
|support.postgresql.resources.requests.memory|string|`"256Mi"`|Memory request (string)|
|support.postgresql.service|object|-|Service configuration|
|support.postgresql.service.port|int|`5432`|PostgreSQL service port|
|support.postgresql.service.targetPort|int|`5432`|PostgreSQL service target port|
|support.postgresql.service.type|string|`"ClusterIP"`|PostgreSQL service type|
|support.reloader|object|-|Reloader configuration (object)|
|support.reloader.enabled|bool|`true`|Enable Reloader deployment (bool)|
|support.reloader.fullnameOverride|string|`"reloader"`|String to fully override common.names.fullname (string)|
|support.reloader.global|object|-|Global configuration (object)|
|support.reloader.global.imagePullSecrets|list|-|Global Docker registry secret names as an array (list)|
|support.reloader.image|object|-|Reloader image configuration|
|support.reloader.image.name|string|`"stakater/reloader"`|Reloader image name|
|support.reloader.image.repository|string|`"ghcr.io/stakater/reloader"`|Reloader image repository|
|support.reloader.reloader|object|-|Reloader specific configuration (object)|
|support.reloader.reloader.autoReloadAll|bool|`true`|Enable auto reload for all resources (bool)|
|support.reloader.reloader.containerSecurityContext|object|-|Container security context configuration|
|support.reloader.reloader.containerSecurityContext.allowPrivilegeEscalation|bool|`false`|Whether a process can gain more privileges than its parent|
|support.reloader.reloader.containerSecurityContext.capabilities|object|-|Linux capabilities configuration for container|
|support.reloader.reloader.containerSecurityContext.capabilities.drop|list|-|Linux capabilities to drop from the container|
|support.reloader.reloader.containerSecurityContext.readOnlyRootFilesystem|bool|`true`|Mount the container's root filesystem as read-only|
|support.reloader.reloader.deployment|object|-|Deployment configuration|
|support.reloader.reloader.deployment.labels|object|-|Labels for Reloader deployment|
|support.reloader.reloader.deployment.labels."kots.io/app-slug"|string|`"settlemint-atk"`|KOTS application identifier for SettleMint ATK|
|support.reloader.reloader.readOnlyRootFileSystem|bool|`true`|Enable read-only root filesystem|
|support.reloader.reloader.reloadOnCreate|bool|`false`|Reload on resource creation|
|support.reloader.reloader.securityContext|object|-|Security context configuration|
|support.reloader.reloader.securityContext.allowPrivilegeEscalation|bool|`false`|Whether a process can gain more privileges than its parent|
|support.reloader.reloader.securityContext.capabilities|object|-|Specifies the security capabilities for the container. Here, all capabilities are dropped.|
|support.reloader.reloader.securityContext.capabilities.drop|list|-|Linux capabilities to drop from the container|
|support.reloader.reloader.securityContext.readOnlyRootFilesystem|bool|`false`|If true, the root filesystem of the container is read-only.|
|support.reloader.reloader.securityContext.runAsNonRoot|bool|`true`|Ensures the container runs as a non-root user.|
|support.reloader.reloader.securityContext.runAsUser|int|`2016`|The user ID to run the container as. Change this for OpenShift or specific requirements.|
|support.reloader.reloader.syncAfterRestart|bool|`true`|Sync after restart|
|support.reloader.reloader.watchGlobally|bool|`false`|Watch resources globally across namespaces|
|support.minio.additionalAnnotations|object|-|Additional annotations to include with deployment or statefulset|
|support.minio.additionalLabels|object|-|Additional labels to include with deployment or statefulset|
|support.minio.affinity|object|-|Affinity rules for pod assignment|
|support.minio.bucketRoot|string|`""`|Root directory for MinIO server storage (sub-directory of mountPath)|
|support.minio.buckets|list|-|List of MinIO buckets to create after installation|
|support.minio.certsPath|string|`"/etc/minio/certs/"`|Directory path for TLS certificates on MinIO pod|
|support.minio.clusterDomain|string|`"cluster.local"`|Kubernetes cluster domain where minio is running|
|support.minio.configPathmc|string|`"/etc/minio/mc/"`|Directory path for MinIO client configuration|
|support.minio.consoleIngress|object|-|Ingress configuration for MinIO Console|
|support.minio.consoleIngress.annotations|object|-|Annotations for the console ingress resource|
|support.minio.consoleIngress.enabled|bool|`false`|Enable ingress for MinIO Console|
|support.minio.consoleIngress.hosts|list|-|Hostnames for the console ingress|
|support.minio.consoleIngress.ingressClassName|string|`nil`|Ingress class name to use for console|
|support.minio.consoleIngress.labels|object|-|Additional labels for the console ingress resource|
|support.minio.consoleIngress.path|string|`"/"`|Path prefix for the console ingress rule|
|support.minio.consoleIngress.tls|list|-|TLS configuration for the console ingress|
|support.minio.consoleService|object|-|Kubernetes Service configuration for MinIO Console|
|support.minio.consoleService.annotations|object|-|Annotations to add to the console service|
|support.minio.consoleService.clusterIP|string|`nil`|Static cluster IP address for the console service|
|support.minio.consoleService.externalIPs|list|-|List of external IPs for the console service|
|support.minio.consoleService.externalTrafficPolicy|string|`"Cluster"`|External traffic policy for console service (Cluster or Local)|
|support.minio.consoleService.loadBalancerIP|string|`nil`|Static IP address for console LoadBalancer service type|
|support.minio.consoleService.loadBalancerSourceRanges|list|-|List of IP CIDR ranges allowed to access console LoadBalancer service|
|support.minio.consoleService.nodePort|int|`32001`|NodePort to expose the console service on each node (requires type: NodePort)|
|support.minio.consoleService.port|string|`"9001"`|External port for MinIO Console service|
|support.minio.consoleService.type|string|`"ClusterIP"`|Service type for MinIO Console (ClusterIP, NodePort, LoadBalancer)|
|support.minio.containerSecurityContext|object|-|Container-level security context|
|support.minio.containerSecurityContext.readOnlyRootFilesystem|bool|`false`|Mount root filesystem as read-only|
|support.minio.customCommandJob|object|-|Configuration for the Kubernetes Job that runs custom commands|
|support.minio.customCommandJob.exitCommand|string|`""`|Command to run after the main command completes|
|support.minio.customCommandJob.extraVolumeMounts|list|-|Additional volume mounts for the customCommandJob container|
|support.minio.customCommandJob.extraVolumes|list|-|Additional volumes to mount in the customCommandJob|
|support.minio.customCommandJob.resources|object|-|Resource requests and limits for the customCommandJob|
|support.minio.customCommandJob.resources.requests|object|-|Resource requests for the customCommandJob|
|support.minio.customCommandJob.resources.requests.memory|string|`"128Mi"`|Memory request for the customCommandJob|
|support.minio.customCommandJob.securityContext|object|-|Security context for the customCommandJob|
|support.minio.customCommands|list|-|List of custom MinIO client commands to run after installation|
|support.minio.deploymentUpdate|object|-|Update strategy configuration for Deployments|
|support.minio.deploymentUpdate.maxSurge|string|`"100%"`|Maximum number of pods that can be created over the desired number|
|support.minio.deploymentUpdate.maxUnavailable|int|`0`|Maximum number of pods unavailable during update|
|support.minio.deploymentUpdate.type|string|`"RollingUpdate"`|Type of deployment update strategy|
|support.minio.drivesPerNode|int|`1`|Number of drives attached to each MinIO node|
|support.minio.environment|object|-|Additional environment variables for MinIO server|
|support.minio.etcd|object|-|ETCD configuration for MinIO STS (Security Token Service)|
|support.minio.etcd.clientCert|string|`""`|Client certificate for ETCD authentication|
|support.minio.etcd.clientCertKey|string|`""`|Client certificate key for ETCD authentication|
|support.minio.etcd.corednsPathPrefix|string|`""`|Path prefix for CoreDNS ETCD keys|
|support.minio.etcd.endpoints|list|-|List of ETCD endpoints|
|support.minio.etcd.pathPrefix|string|`""`|Path prefix for ETCD keys|
|support.minio.existingSecret|string|`""`|Name of existing Secret containing rootUser and rootPassword keys|
|support.minio.extraArgs|list|-|Additional command-line arguments to pass to the MinIO binary|
|support.minio.extraContainers|list|-|Additional sidecar containers to run alongside MinIO|
|support.minio.extraSecret|string|`nil`|Name of existing Secret containing additional environment variables in 'config.env' key|
|support.minio.extraVolumeMounts|list|-|Additional volume mounts for the MinIO container|
|support.minio.extraVolumes|list|-|Additional volumes to mount in the MinIO container|
|support.minio.fullnameOverride|string|`""`|String to fully override common.names.fullname|
|support.minio.ignoreChartChecksums|bool|`false`|Disable automatic restart on secret/config changes to avoid unnecessary restarts in GitOps workflows|
|support.minio.image|object|-|MinIO image configuration|
|support.minio.image.pullPolicy|string|`"IfNotPresent"`|MinIO image pull policy|
|support.minio.image.repository|string|`"docker.io/minio/minio"`|MinIO image repository|
|support.minio.image.tag|string|`"RELEASE.2025-09-07T16-13-09Z"`|MinIO image tag (immutable tags are recommended)|
|support.minio.imagePullSecrets|list|-|Global Docker registry secret names as an array|
|support.minio.ingress|object|-|Ingress configuration for MinIO S3 API|
|support.minio.ingress.annotations|object|-|Annotations for the ingress resource|
|support.minio.ingress.enabled|bool|`false`|Enable ingress for MinIO S3 API|
|support.minio.ingress.hosts|list|-|Hostnames for the ingress|
|support.minio.ingress.ingressClassName|string|`nil`|Ingress class name to use|
|support.minio.ingress.labels|object|-|Additional labels for the ingress resource|
|support.minio.ingress.path|string|`"/"`|Path prefix for the ingress rule|
|support.minio.ingress.tls|list|-|TLS configuration for the ingress|
|support.minio.makeBucketJob|object|-|Configuration for the Kubernetes Job that creates buckets|
|support.minio.makeBucketJob.exitCommand|string|`""`|Command to run after the main command completes|
|support.minio.makeBucketJob.resources|object|-|Resource requests and limits for the makeBucketJob|
|support.minio.makeBucketJob.resources.requests|object|-|Resource requests for the makeBucketJob|
|support.minio.makeBucketJob.resources.requests.memory|string|`"128Mi"`|Memory request for the makeBucketJob|
|support.minio.makeBucketJob.securityContext|object|-|Security context for the makeBucketJob|
|support.minio.makePolicyJob|object|-|Configuration for the Kubernetes Job that creates policies|
|support.minio.makePolicyJob.exitCommand|string|`""`|Command to run after the main command completes|
|support.minio.makePolicyJob.resources|object|-|Resource requests and limits for the makePolicyJob|
|support.minio.makePolicyJob.resources.requests|object|-|Resource requests for the makePolicyJob|
|support.minio.makePolicyJob.resources.requests.memory|string|`"128Mi"`|Memory request for the makePolicyJob|
|support.minio.makePolicyJob.securityContext|object|-|Security context for the makePolicyJob|
|support.minio.makeServiceAccountJob|object|-|Configuration for the Kubernetes Job that creates service accounts|
|support.minio.makeServiceAccountJob.exitCommand|string|`""`|Command to run after the main command completes|
|support.minio.makeServiceAccountJob.resources|object|-|Resource requests and limits for the makeServiceAccountJob|
|support.minio.makeServiceAccountJob.resources.requests|object|-|Resource requests for the makeServiceAccountJob|
|support.minio.makeServiceAccountJob.resources.requests.memory|string|`"128Mi"`|Memory request for the makeServiceAccountJob|
|support.minio.makeServiceAccountJob.securityContext|object|-|Security context for the makeServiceAccountJob|
|support.minio.makeUserJob|object|-|Configuration for the Kubernetes Job that creates users|
|support.minio.makeUserJob.exitCommand|string|`""`|Command to run after the main command completes|
|support.minio.makeUserJob.resources|object|-|Resource requests and limits for the makeUserJob|
|support.minio.makeUserJob.resources.requests|object|-|Resource requests for the makeUserJob|
|support.minio.makeUserJob.resources.requests.memory|string|`"128Mi"`|Memory request for the makeUserJob|
|support.minio.makeUserJob.securityContext|object|-|Security context for the makeUserJob|
|support.minio.mcImage|object|-|MinIO client image configuration|
|support.minio.mcImage.pullPolicy|string|`"IfNotPresent"`|MinIO client image pull policy|
|support.minio.mcImage.repository|string|`"docker.io/minio/minio"`|MinIO client image repository|
|support.minio.mcImage.tag|string|`"RELEASE.2025-09-07T16-13-09Z"`|MinIO client image tag|
|support.minio.metrics|object|-|Prometheus metrics configuration|
|support.minio.metrics.serviceMonitor|object|-|ServiceMonitor configuration for Prometheus Operator|
|support.minio.metrics.serviceMonitor.additionalLabels|object|-|Additional labels for the ServiceMonitor|
|support.minio.metrics.serviceMonitor.annotations|object|-|Annotations for the ServiceMonitor|
|support.minio.metrics.serviceMonitor.enabled|bool|`false`|Enable ServiceMonitor creation for Prometheus Operator|
|support.minio.metrics.serviceMonitor.includeNode|bool|`false`|Scrape each node/pod individually for additional per-node metrics|
|support.minio.metrics.serviceMonitor.interval|string|`nil`|Prometheus scrape interval|
|support.minio.metrics.serviceMonitor.namespace|string|`nil`|Namespace to deploy ServiceMonitor in|
|support.minio.metrics.serviceMonitor.public|bool|`true`|Make metrics endpoint publicly accessible|
|support.minio.metrics.serviceMonitor.relabelConfigs|object|-|Relabel configs for node-level metrics|
|support.minio.metrics.serviceMonitor.relabelConfigsCluster|object|-|Relabel configs for cluster-level metrics|
|support.minio.metrics.serviceMonitor.scrapeTimeout|string|`nil`|Prometheus scrape timeout|
|support.minio.minioAPIPort|string|`"9000"`|Internal port number for MinIO S3 API|
|support.minio.minioConsolePort|string|`"9001"`|Internal port number for MinIO Browser Console|
|support.minio.mode|string|`"distributed"`|MinIO mode (standalone or distributed)|
|support.minio.mountPath|string|`"/export"`|Mount path for persistent volume on MinIO pod|
|support.minio.nameOverride|string|`""`|String to partially override common.names.fullname template (will maintain the release name)|
|support.minio.networkPolicy|object|-|Network policy configuration for MinIO pods|
|support.minio.networkPolicy.allowExternal|bool|`true`|Allow external traffic to MinIO pods|
|support.minio.networkPolicy.egressEntities|list|-|List of egress entities to allow (Cilium only)|
|support.minio.networkPolicy.enabled|bool|`false`|Enable network policies|
|support.minio.networkPolicy.flavor|string|`"kubernetes"`|Network policy implementation flavor (kubernetes or cilium)|
|support.minio.nodeSelector|object|-|Node selector labels for pod assignment|
|support.minio.oidc|object|-|OpenID Connect (OIDC) configuration for external identity management|
|support.minio.oidc.claimName|string|`"policy"`|OIDC claim name to use for policy mapping|
|support.minio.oidc.claimPrefix|string|`""`|Prefix to add to OIDC claim values|
|support.minio.oidc.clientId|string|`"minio"`|OIDC client ID|
|support.minio.oidc.clientSecret|string|`""`|OIDC client secret|
|support.minio.oidc.comment|string|`""`|Comment for OIDC configuration|
|support.minio.oidc.configUrl|string|`"https://identity-provider-url/.well-known/openid-configuration"`|OIDC provider configuration URL|
|support.minio.oidc.displayName|string|`""`|Display name for OIDC provider in MinIO console|
|support.minio.oidc.enabled|bool|`false`|Enable OIDC authentication|
|support.minio.oidc.existingClientIdKey|string|`""`|Key in existing Secret for OIDC client ID|
|support.minio.oidc.existingClientSecretKey|string|`""`|Key in existing Secret for OIDC client secret|
|support.minio.oidc.existingClientSecretName|string|`""`|Name of existing Secret containing OIDC client credentials|
|support.minio.oidc.redirectUri|string|`"https://console-endpoint-url/oauth_callback"`|OIDC redirect URI for OAuth callback|
|support.minio.oidc.scopes|string|`"openid,profile,email"`|OIDC scopes to request|
|support.minio.persistence|object|-|Persistent volume configuration for MinIO data storage|
|support.minio.persistence.accessMode|string|`"ReadWriteOnce"`|Access mode for persistent volume|
|support.minio.persistence.annotations|object|-|Annotations to add to the PersistentVolumeClaim|
|support.minio.persistence.enabled|bool|`true`|Enable persistent storage for MinIO|
|support.minio.persistence.existingClaim|string|`""`|Name of existing PersistentVolumeClaim to use instead of creating new one|
|support.minio.persistence.size|string|`"500Gi"`|Size of persistent volume claim|
|support.minio.persistence.storageClass|string|`""`|Storage class name for persistent volume|
|support.minio.persistence.subPath|string|`""`|Mount a sub-path within the volume instead of the root|
|support.minio.persistence.volumeName|string|`""`|Name of persistent volume to bind to|
|support.minio.podAnnotations|object|-|Additional annotations to add to MinIO pods|
|support.minio.podDisruptionBudget|object|-|Pod disruption budget configuration for MinIO|
|support.minio.podDisruptionBudget.enabled|bool|`false`|Enable pod disruption budget|
|support.minio.podDisruptionBudget.maxUnavailable|int|`1`|Maximum number of unavailable pods during disruptions|
|support.minio.podLabels|object|-|Additional labels to add to MinIO pods|
|support.minio.policies|list|-|List of custom MinIO policies to create after installation|
|support.minio.pools|int|`1`|Number of MinIO server pools for distributed deployment|
|support.minio.postJob|object|-|Configuration for merged post-installation jobs|
|support.minio.postJob.affinity|object|-|Affinity rules for postJob pod assignment|
|support.minio.postJob.annotations|object|-|Annotations to add to the postJob|
|support.minio.postJob.nodeSelector|object|-|Node selector labels for postJob pod assignment|
|support.minio.postJob.podAnnotations|object|-|Annotations to add to the postJob pods|
|support.minio.postJob.securityContext|object|-|Security context for the postJob|
|support.minio.postJob.tolerations|list|-|Tolerations for postJob pod assignment|
|support.minio.priorityClassName|string|`""`|Priority class name for MinIO pods|
|support.minio.replicas|int|`16`|Number of MinIO pod replicas to run|
|support.minio.resources|object|-|Resource requests and limits for MinIO containers|
|support.minio.resources.requests|object|-|Resource requests for MinIO containers|
|support.minio.resources.requests.memory|string|`"16Gi"`|Memory request for MinIO containers|
|support.minio.rootPassword|string|`""`|MinIO root password (admin password), auto-generated if not set|
|support.minio.rootUser|string|`""`|MinIO root user (admin username), auto-generated if not set|
|support.minio.runtimeClassName|string|`""`|Runtime class name for MinIO pods|
|support.minio.securityContext|object|-|Pod-level security context (only applied when persistence is enabled)|
|support.minio.service|object|-|Kubernetes Service configuration for MinIO S3 API|
|support.minio.service.annotations|object|-|Annotations to add to the service|
|support.minio.service.clusterIP|string|`nil`|Static cluster IP address for the service|
|support.minio.service.externalIPs|list|-|List of external IPs for the service|
|support.minio.service.externalTrafficPolicy|string|`"Cluster"`|External traffic policy (Cluster or Local)|
|support.minio.service.loadBalancerIP|string|`nil`|Static IP address for LoadBalancer service type|
|support.minio.service.loadBalancerSourceRanges|list|-|List of IP CIDR ranges allowed to access LoadBalancer service|
|support.minio.service.nodePort|int|`32000`|NodePort to expose the service on each node (requires type: NodePort)|
|support.minio.service.port|string|`"9000"`|External port for MinIO S3 API service|
|support.minio.service.type|string|`"ClusterIP"`|Service type (ClusterIP, NodePort, LoadBalancer)|
|support.minio.serviceAccount|object|-|Service account configuration for MinIO pods|
|support.minio.serviceAccount.create|bool|`true`|Create a service account for MinIO|
|support.minio.serviceAccount.name|string|`"minio-sa"`|Name of the service account to use or create|
|support.minio.statefulSetUpdate|object|-|Update strategy configuration for StatefulSets|
|support.minio.statefulSetUpdate.updateStrategy|string|`"RollingUpdate"`|Type of statefulset update strategy|
|support.minio.svcaccts|list|-|List of MinIO service accounts to create after installation|
|support.minio.tls|object|-|TLS/SSL configuration for MinIO|
|support.minio.tls.certSecret|string|`""`|Name of Kubernetes Secret containing TLS certificate and key|
|support.minio.tls.enabled|bool|`false`|Enable TLS for MinIO server|
|support.minio.tls.privateKey|string|`"private.key"`|Filename of private key in the TLS secret|
|support.minio.tls.publicCrt|string|`"public.crt"`|Filename of public certificate in the TLS secret|
|support.minio.tolerations|list|-|Tolerations for pod assignment|
|support.minio.topologySpreadConstraints|list|-|Topology spread constraints for pod distribution|
|support.minio.trustedCertsSecret|string|`""`|Name of Kubernetes Secret containing trusted CA certificates for third-party verification|
|support.minio.users|list|-|List of MinIO users to create after installation|
|support.minio.users[0]|string|`{"accessKey":"console","policy":"consoleAdmin","secretKey":"console123"}`|Access key (username) for the MinIO user|
|support.minio.users[0].policy|string|`"consoleAdmin"`|Policy to assign to the MinIO user|
|support.minio.users[0].secretKey|string|`"console123"`|Secret key (password) for the MinIO user|
|support.postgresql.affinity|object|-|Affinity for pod assignment (object)|
|support.postgresql.commonLabels|object|-|Common labels to add to all PostgreSQL resources|
|support.postgresql.fullnameOverride|string|`"postgresql"`|String to fully override common.names.fullname (string)|
|support.postgresql.image|object|-|Image configuration|
|support.postgresql.image.pullPolicy|string|`"IfNotPresent"`|Image pull policy|
|support.postgresql.image.registry|string|`"docker.io"`|Image registry|
|support.postgresql.image.repository|string|`"postgres"`|Image repository|
|support.postgresql.image.tag|string|`"18.0-alpine"`|Image tag|
|support.postgresql.initdb|object|-|Database initialization configuration (object)|
|support.postgresql.initdb.scripts|object|-|Database initialization scripts|
|support.postgresql.initdb.scripts."create_databases.sql"|string|`"-- Create databases and users for all ATK services\nCREATE DATABASE blockscout;\nCREATE USER blockscout WITH PASSWORD 'atk' SUPERUSER;\nGRANT ALL PRIVILEGES ON DATABASE blockscout TO blockscout;\n\\c blockscout;\nGRANT ALL ON SCHEMA public TO blockscout;\n\n\\c postgres;\nCREATE DATABASE thegraph WITH ENCODING 'UTF8' LC_COLLATE='C' LC_CTYPE='C' TEMPLATE template0;\nCREATE USER thegraph WITH PASSWORD 'atk' SUPERUSER;\nGRANT ALL PRIVILEGES ON DATABASE thegraph TO thegraph;\n\\c thegraph;\nGRANT ALL ON SCHEMA public TO thegraph;\n\n\\c postgres;\nCREATE DATABASE hasura;\nCREATE USER hasura WITH PASSWORD 'atk' SUPERUSER;\nGRANT ALL PRIVILEGES ON DATABASE hasura TO hasura;\n\\c hasura;\nGRANT ALL ON SCHEMA public TO hasura;\n\n\\c postgres;\nCREATE DATABASE portal;\nCREATE USER portal WITH PASSWORD 'atk' SUPERUSER;\nGRANT ALL PRIVILEGES ON DATABASE portal TO portal;\n\\c portal;\nGRANT ALL ON SCHEMA public TO portal;\n\n\\c postgres;\nCREATE DATABASE txsigner;\nCREATE USER txsigner WITH PASSWORD 'atk' SUPERUSER;\nGRANT ALL PRIVILEGES ON DATABASE txsigner TO txsigner;\n\\c txsigner;\nGRANT ALL ON SCHEMA public TO txsigner;\n"`|SQL script to create databases and users for all ATK services|
|support.postgresql.nodeSelector|object|-|Node labels for pod assignment (object)|
|support.postgresql.persistence|object|-|Persistence configuration|
|support.postgresql.persistence.accessModes|list|-|Access modes|
|support.postgresql.persistence.enabled|bool|`true`|Enable persistence|
|support.postgresql.persistence.size|string|`"8Gi"`|Storage size|
|support.postgresql.persistence.storageClass|string|`""`|Storage class|
|support.postgresql.podDisruptionBudget|object|-|Pod disruption budget configuration (object)|
|support.postgresql.podDisruptionBudget.enabled|bool|`false`|Enable pod disruption budget (bool)|
|support.postgresql.podDisruptionBudget.minAvailable|int|`1`|Minimum number of available pods (int)|
|support.postgresql.podSecurityContext|object|-|Pod security context|
|support.postgresql.postgresql|object|-|PostgreSQL configuration|
|support.postgresql.postgresql.database|string|`"postgres"`|Default database name|
|support.postgresql.postgresql.password|string|`"atk"`|Default superuser password|
|support.postgresql.postgresql.username|string|`"postgres"`|Default superuser username|
|support.postgresql.postgresql_conf|object|-|PostgreSQL configuration parameters (object)|
|support.postgresql.postgresql_conf.checkpoint_completion_target|float|`0.9`|Target for completion of checkpoint processing|
|support.postgresql.postgresql_conf.default_statistics_target|int|`100`|Default statistics target for table columns|
|support.postgresql.postgresql_conf.effective_cache_size|string|`"1GB"`|Planner's assumption about the effective size of the disk cache (string)|
|support.postgresql.postgresql_conf.effective_io_concurrency|int|`200`|Number of concurrent disk I/O operations|
|support.postgresql.postgresql_conf.maintenance_work_mem|string|`"64MB"`|Specifies the maximum amount of memory for maintenance operations|
|support.postgresql.postgresql_conf.max_connections|int|`1000`|Maximum number of concurrent connections (int)|
|support.postgresql.postgresql_conf.max_wal_size|string|`"4GB"`|Maximum size to which the WAL will grow during automatic checkpoints|
|support.postgresql.postgresql_conf.min_wal_size|string|`"1GB"`|Minimum size to which the WAL will shrink|
|support.postgresql.postgresql_conf.random_page_cost|float|`1.1`|Planner's assumption about the cost of a non-sequentially-fetched disk page|
|support.postgresql.postgresql_conf.shared_buffers|string|`"256MB"`|Amount of memory dedicated to PostgreSQL to use for caching data (string)|
|support.postgresql.postgresql_conf.wal_buffers|string|`"16MB"`|Amount of memory used in shared memory for WAL data|
|support.postgresql.postgresql_conf.work_mem|string|`"4MB"`|Amount of memory to be used by internal sort operations and hash tables|
|support.postgresql.resources|object|-|Resource configuration|
|support.postgresql.resources.limits|object|-|Resource limits|
|support.postgresql.resources.limits.cpu|string|`"500m"`|CPU limit|
|support.postgresql.resources.limits.memory|string|`"1Gi"`|Memory limit|
|support.postgresql.resources.requests|object|-|Resource requests|
|support.postgresql.resources.requests.cpu|string|`"100m"`|CPU request|
|support.postgresql.resources.requests.memory|string|`"256Mi"`|Memory request|
|support.postgresql.securityContext|object|-|Container security context|
|support.postgresql.service|object|-|Service configuration|
|support.postgresql.service.port|int|`5432`|Service port|
|support.postgresql.service.targetPort|int|`5432`|Target port|
|support.postgresql.service.type|string|`"ClusterIP"`|Service type|
|support.postgresql.tolerations|list|-|Tolerations for pod assignment (list)|
|support.redis.affinity|object|-|Affinity (object)|
|support.redis.auth|object|-|Authentication|
|support.redis.auth.enabled|bool|`true`|Enable authentication|
|support.redis.auth.password|string|`"atk"`|Redis password|
|support.redis.commonAnnotations|object|-|Annotations to add to all deployed objects (object)|
|support.redis.commonLabels|object|-|Labels to add to all deployed objects (object)|
|support.redis.config|object|-|Redis configuration|
|support.redis.config.appendonly|string|`"no"`|Append only file (AOF persistence)|
|support.redis.config.maxmemory|string|`"256mb"`|Maximum memory Redis can use|
|support.redis.config.maxmemoryPolicy|string|`"allkeys-lru"`|Memory eviction policy|
|support.redis.config.save|string|`""`|Save DB to disk (RDB persistence)|
|support.redis.containerSecurityContext|object|-|Container security context (object)|
|support.redis.fullnameOverride|string|`""`|String to fully override common.names.fullname (string)|
|support.redis.image|object|-|Redis image configuration|
|support.redis.image.pullPolicy|string|`"IfNotPresent"`|Redis image pull policy|
|support.redis.image.pullSecrets|list|-|Redis image pull secrets (list)|
|support.redis.image.registry|string|`"docker.io"`|Redis image registry|
|support.redis.image.repository|string|`"redis"`|Redis image repository|
|support.redis.image.tag|string|`"8.2.1-alpine"`|Redis image tag|
|support.redis.livenessProbe|object|-|Liveness probe configuration|
|support.redis.livenessProbe.enabled|bool|`true`|Enable liveness probe (bool)|
|support.redis.livenessProbe.failureThreshold|int|`3`|Failure threshold (int)|
|support.redis.livenessProbe.initialDelaySeconds|int|`30`|Initial delay seconds (int)|
|support.redis.livenessProbe.periodSeconds|int|`10`|Period seconds (int)|
|support.redis.livenessProbe.successThreshold|int|`1`|Success threshold (int)|
|support.redis.livenessProbe.timeoutSeconds|int|`5`|Timeout seconds (int)|
|support.redis.nameOverride|string|`""`|String to partially override common.names.fullname (string)|
|support.redis.networkPolicy|object|-|Network policy configuration|
|support.redis.networkPolicy.allowedNamespaceSelectors|list|-|Additional allowed namespace selectors (list)|
|support.redis.networkPolicy.allowedPodSelectors|list|-|Additional allowed pod selectors (list)|
|support.redis.networkPolicy.enabled|bool|`false`|Enable network policies (bool)|
|support.redis.nodeSelector|object|-|Node selector (object)|
|support.redis.persistence|object|-|Persistence configuration|
|support.redis.persistence.accessModes|list|-|Access mode for the PVC|
|support.redis.persistence.annotations|object|-|Annotations for the PVC|
|support.redis.persistence.enabled|bool|`true`|Enable persistence using PVC|
|support.redis.persistence.size|string|`"1Gi"`|Size of the PVC|
|support.redis.persistence.storageClass|string|`""`|Storage class for the PVC|
|support.redis.podAnnotations|object|-|Pod annotations (object)|
|support.redis.podLabels|object|-|Pod labels (object)|
|support.redis.podSecurityContext|object|-|Pod security context (object)|
|support.redis.readinessProbe|object|-|Readiness probe configuration|
|support.redis.readinessProbe.enabled|bool|`true`|Enable readiness probe (bool)|
|support.redis.readinessProbe.failureThreshold|int|`3`|Failure threshold (int)|
|support.redis.readinessProbe.initialDelaySeconds|int|`5`|Initial delay seconds (int)|
|support.redis.readinessProbe.periodSeconds|int|`10`|Period seconds (int)|
|support.redis.readinessProbe.successThreshold|int|`1`|Success threshold (int)|
|support.redis.readinessProbe.timeoutSeconds|int|`5`|Timeout seconds (int)|
|support.redis.replicaCount|int|`1`|Number of Redis replicas (should be 1 for development)|
|support.redis.resources|object|-|Resources configuration|
|support.redis.resources.limits|object|-|Resource limits|
|support.redis.resources.limits.cpu|string|`"200m"`|CPU limit|
|support.redis.resources.limits.memory|string|`"256Mi"`|Memory limit|
|support.redis.resources.requests|object|-|Resource requests|
|support.redis.resources.requests.cpu|string|`"100m"`|CPU request|
|support.redis.resources.requests.memory|string|`"128Mi"`|Memory request|
|support.redis.service|object|-|Service configuration|
|support.redis.service.annotations|object|-|Service annotations|
|support.redis.service.labels|object|-|Service labels|
|support.redis.service.port|int|`6379`|Redis port|
|support.redis.service.type|string|`"ClusterIP"`|Service type|
|support.redis.tolerations|list|-|Tolerations (list)|
|txsigner.affinity|object|-|Affinity for pod assignment (object)|
|txsigner.autoscaling|object|-|Autoscaling configuration for TxSigner (object)|
|txsigner.autoscaling.builtInMetrics|list|-|Built-in metrics configuration|
|txsigner.autoscaling.builtInMetrics[0]|object|-|CPU resource metric configuration|
|txsigner.autoscaling.builtInMetrics[0].resource|object|-|Resource metric details|
|txsigner.autoscaling.builtInMetrics[0].resource.name|string|`"cpu"`|Resource name (cpu or memory)|
|txsigner.autoscaling.builtInMetrics[0].resource.target|object|-|Target metric threshold|
|txsigner.autoscaling.builtInMetrics[0].resource.target.averageUtilization|int|`80`|Average utilization percentage threshold|
|txsigner.autoscaling.builtInMetrics[0].resource.target.type|string|`"Utilization"`|Target metric type|
|txsigner.autoscaling.builtInMetrics[1]|object|-|Memory resource metric configuration|
|txsigner.autoscaling.builtInMetrics[1].resource|object|-|Resource metric details|
|txsigner.autoscaling.builtInMetrics[1].resource.name|string|`"memory"`|Resource name (cpu or memory)|
|txsigner.autoscaling.builtInMetrics[1].resource.target|object|-|Target metric threshold|
|txsigner.autoscaling.builtInMetrics[1].resource.target.averageUtilization|int|`80`|Average utilization percentage threshold|
|txsigner.autoscaling.builtInMetrics[1].resource.target.type|string|`"Utilization"`|Target metric type|
|txsigner.autoscaling.customMetrics|list|-|Custom metrics configuration (list)|
|txsigner.autoscaling.enabled|bool|`false`|Enable autoscaling for TxSigner (bool)|
|txsigner.autoscaling.maxReplicas|int|`3`|Maximum number of TxSigner replicas (int)|
|txsigner.autoscaling.minReplicas|int|`1`|Minimum number of TxSigner replicas (int)|
|txsigner.commonAnnotations|object|-|Annotations to add to all deployed objects (object)|
|txsigner.commonLabels|object|-|Labels to add to all deployed objects (object)|
|txsigner.config|object|-|TxSigner configuration (object)|
|txsigner.config.allowedContracts|list|-|Allowed contracts for interaction|
|txsigner.config.allowedMethods|list|-|Allowed methods for execution|
|txsigner.config.audit|object|-|Audit logging|
|txsigner.config.audit.enabled|bool|`true`|Enable audit logging|
|txsigner.config.audit.retentionDays|int|`30`|Audit log retention days|
|txsigner.config.chainId|string|`"53771311147"`|Chain ID for the network|
|txsigner.config.cors|object|-|CORS configuration (object)|
|txsigner.config.cors.enabled|bool|`false`|Enable CORS|
|txsigner.config.cors.headers|list|-|Allowed headers|
|txsigner.config.cors.methods|list|-|Allowed methods|
|txsigner.config.cors.origins|list|-|Allowed origins|
|txsigner.config.debug|bool|`false`|Enable debug mode|
|txsigner.config.derivationPath|string|`""`|Derivation path to use for the private key|
|txsigner.config.existingSecret|string|`""`|Use existing secret for private key|
|txsigner.config.existingSecretKey|string|`"private-key"`|Key within the existing secret|
|txsigner.config.extraSecretEnv|object|-|Additional secret environment variables to add to the txsigner|
|txsigner.config.gas|object|-|Gas configuration (object)|
|txsigner.config.gas.fixedPrice|int|`20`|Fixed gas price in Gwei (if priceStrategy is fixed)|
|txsigner.config.gas.limit|int|`3000000`|Gas limit|
|txsigner.config.gas.multiplier|float|`1.1`|Gas price multiplier for estimator strategy|
|txsigner.config.gas.priceStrategy|string|`"estimator"`|Gas price strategy (fixed, oracle, estimator)|
|txsigner.config.hsm|object|-|HSM configuration (if signingStrategy is hsm)|
|txsigner.config.hsm.module|string|`""`|HSM module path|
|txsigner.config.hsm.pin|string|`""`|HSM PIN|
|txsigner.config.hsm.slot|string|`""`|HSM slot|
|txsigner.config.kms|object|-|KMS configuration (if signingStrategy is kms)|
|txsigner.config.kms.keyId|string|`""`|KMS key ID|
|txsigner.config.kms.provider|string|`""`|KMS provider (aws, azure, gcp)|
|txsigner.config.kms.region|string|`""`|KMS region|
|txsigner.config.logLevel|string|`"info"`|Log level for TxSigner|
|txsigner.config.metricsPort|int|`3001`|Port for the metrics server (int)|
|txsigner.config.mnemonic|string|`""`|Mnemonic to use for the private key|
|txsigner.config.mode|string|`"standalone"`|Operation mode (standalone or integrated)|
|txsigner.config.nonce|object|-|Nonce management|
|txsigner.config.nonce.maxPending|int|`10`|Maximum pending transactions|
|txsigner.config.nonce.strategy|string|`"sequential"`|Nonce management strategy (sequential, parallel)|
|txsigner.config.port|int|`3000`|Port for the HTTP server (int)|
|txsigner.config.privateKey|string|`""`|Private key for local signing (use with caution, prefer secrets)|
|txsigner.config.queue|object|-|Transaction queue configuration (object)|
|txsigner.config.queue.maxSize|int|`1000`|Maximum queue size (int)|
|txsigner.config.queue.processingInterval|int|`1000`|Queue processing interval in milliseconds (int)|
|txsigner.config.rateLimit|object|-|Rate limiting configuration (object)|
|txsigner.config.rateLimit.enabled|bool|`true`|Enable rate limiting (bool)|
|txsigner.config.rateLimit.maxRequestsPerHour|int|`1000`|Maximum requests per hour (int)|
|txsigner.config.rateLimit.maxRequestsPerMinute|int|`60`|Maximum requests per minute (int)|
|txsigner.config.rpcUrl|string|`"http://erpc:4000"`|RPC endpoint URL|
|txsigner.config.signingStrategy|string|`"local"`|Signing strategy (local, kms, hsm)|
|txsigner.containerSecurityContext|object|-|Container Security Context configuration (object)|
|txsigner.extraEnvVars|list|-|Array with extra environment variables to add to TxSigner nodes (list)|
|txsigner.extraEnvVarsCM|string|`""`|Name of existing ConfigMap containing extra env vars for TxSigner nodes|
|txsigner.extraEnvVarsSecret|string|`""`|Name of existing Secret containing extra env vars for TxSigner nodes|
|txsigner.extraInitContainers|list|-|Additional init containers|
|txsigner.extraVolumeMounts|list|-|Optionally specify extra list of additional volumeMounts for the TxSigner container(s)|
|txsigner.extraVolumeMounts[0]|object|-|Cache volume mount configuration|
|txsigner.extraVolumeMounts[0].mountPath|string|`"/signer/.cache"`|Mount path for cache volume|
|txsigner.extraVolumes|list|-|Optionally specify extra list of additional volumes for the TxSigner pod(s)|
|txsigner.extraVolumes[0]|object|-|Cache volume configuration|
|txsigner.extraVolumes[0].emptyDir|object|-|Empty directory volume specification|
|txsigner.fullnameOverride|string|`"txsigner"`|String to fully override common.names.fullname (string)|
|txsigner.image|object|-|TxSigner image|
|txsigner.image.digest|string|`""`|TxSigner image digest in the way sha256:aa.... Please note this parameter, if set, will override the tag|
|txsigner.image.pullPolicy|string|`"IfNotPresent"`|TxSigner image pull policy|
|txsigner.image.pullSecrets|list|-|TxSigner image pull secrets (list)|
|txsigner.image.registry|string|`"ghcr.io"`|TxSigner image registry|
|txsigner.image.repository|string|`"settlemint/btp-signer"`|TxSigner image repository|
|txsigner.image.tag|string|`"7.15.13"`|TxSigner image tag (immutable tags are recommended)|
|txsigner.ingress|object|-|Ingress parameters (object)|
|txsigner.ingress.annotations|object|-|Additional annotations for the Ingress resource. To enable certificate autogeneration, place here your cert-manager annotations.|
|txsigner.ingress.apiVersion|string|`""`|Force Ingress API version (automatically detected if not set)|
|txsigner.ingress.enabled|bool|`false`|Enable ingress record generation for TxSigner (bool)|
|txsigner.ingress.extraHosts|list|-|An array with additional hostname(s) to be covered with the ingress record|
|txsigner.ingress.extraPaths|list|-|An array with additional arbitrary paths that may need to be added to the ingress under the main host|
|txsigner.ingress.extraRules|list|-|Additional rules to be covered with this ingress record (list)|
|txsigner.ingress.extraTls|list|-|TLS configuration for additional hostname(s) to be covered with this ingress record|
|txsigner.ingress.hostname|string|`"txsigner.k8s.orb.local"`|Default host for the ingress record|
|txsigner.ingress.ingressClassName|string|`"atk-nginx"`|IngressClass that will be be used to implement the Ingress (Kubernetes 1.18+)|
|txsigner.ingress.path|string|`"/"`|Default path for the ingress record|
|txsigner.ingress.pathType|string|`"ImplementationSpecific"`|Ingress path type|
|txsigner.ingress.secrets|list|-|Custom TLS certificates as secrets (list)|
|txsigner.ingress.selfSigned|bool|`false`|Create a TLS secret for this ingress record using self-signed certificates generated by Helm|
|txsigner.ingress.tls|bool|`false`|Enable TLS configuration for the host defined at `ingress.hostname` parameter|
|txsigner.initContainer|object|-|Init container configuration|
|txsigner.initContainer.tcpCheck|object|-|TCP connection check configuration|
|txsigner.initContainer.tcpCheck.dependencies|list|-|List of dependencies to check before starting|
|txsigner.initContainer.tcpCheck.dependencies[0]|object|-|PostgreSQL dependency configuration|
|txsigner.initContainer.tcpCheck.dependencies[0].endpoint|string|`"{{ include \"atk.postgresql.endpoint\" (dict \"context\" $ \"chartKey\" \"txsigner\") }}"`|PostgreSQL endpoint template|
|txsigner.initContainer.tcpCheck.enabled|bool|`true`|Enable TCP check init container|
|txsigner.initContainer.tcpCheck.image|object|-|Init container image configuration|
|txsigner.initContainer.tcpCheck.image.pullPolicy|string|`"IfNotPresent"`|Init container image pull policy|
|txsigner.initContainer.tcpCheck.image.repository|string|`"ghcr.io/settlemint/btp-waitforit"`|Init container image repository|
|txsigner.initContainer.tcpCheck.image.tag|string|`"v7.7.10"`|Init container image tag|
|txsigner.initContainer.tcpCheck.resources|object|-|Init container resource requests and limits|
|txsigner.initContainer.tcpCheck.resources.limits|object|-|Resource limits|
|txsigner.initContainer.tcpCheck.resources.limits.cpu|string|`"100m"`|CPU limit|
|txsigner.initContainer.tcpCheck.resources.limits.memory|string|`"64Mi"`|Memory limit|
|txsigner.initContainer.tcpCheck.resources.requests|object|-|Resource requests|
|txsigner.initContainer.tcpCheck.resources.requests.cpu|string|`"10m"`|CPU request|
|txsigner.initContainer.tcpCheck.resources.requests.memory|string|`"32Mi"`|Memory request|
|txsigner.initContainer.tcpCheck.timeout|int|`120`|Timeout in seconds for dependency checks|
|txsigner.lifecycleHooks|object|-|lifecycleHooks for the TxSigner container(s) to automate configuration before or after startup|
|txsigner.livenessProbe|object|-|Configure TxSigner containers' liveness probe (object)|
|txsigner.livenessProbe.enabled|bool|`true`|Enable livenessProbe on TxSigner containers (bool)|
|txsigner.livenessProbe.failureThreshold|int|`30`|Failure threshold for livenessProbe (int)|
|txsigner.livenessProbe.initialDelaySeconds|int|`1`|Initial delay seconds for livenessProbe (int)|
|txsigner.livenessProbe.periodSeconds|int|`10`|Period seconds for livenessProbe (int)|
|txsigner.livenessProbe.successThreshold|int|`1`|Success threshold for livenessProbe (int)|
|txsigner.livenessProbe.tcpSocket|object|-|TCP socket parameters for livenessProbe (object)|
|txsigner.livenessProbe.tcpSocket.port|string|`"http"`|Port for tcpSocket livenessProbe|
|txsigner.livenessProbe.timeoutSeconds|int|`5`|Timeout seconds for livenessProbe (int)|
|txsigner.networkPolicy|object|-|Network policies configuration (object)|
|txsigner.networkPolicy.addExternalClientAccess|bool|`true`|Allow access from pods with client label set to "true". Ignored if `networkPolicy.allowExternal` is true.|
|txsigner.networkPolicy.allowExternal|bool|`true`|The Policy model to apply|
|txsigner.networkPolicy.allowExternalEgress|bool|`true`|Allow the pod to access any range of port and all destinations.|
|txsigner.networkPolicy.enabled|bool|`false`|Enable creation of NetworkPolicy resources (bool)|
|txsigner.networkPolicy.extraEgress|list|-|Add extra egress rules to the NetworkPolicy (ignored if allowExternalEgress=true)|
|txsigner.networkPolicy.extraEgress[0]|object|-|Allow DNS resolution|
|txsigner.networkPolicy.extraEgress[0].ports|list|-|Allowed ports for DNS|
|txsigner.networkPolicy.extraEgress[0].ports[0]|object|-|DNS UDP port configuration|
|txsigner.networkPolicy.extraEgress[0].ports[0].port|int|`53`|DNS port|
|txsigner.networkPolicy.extraEgress[0].to[0]|object|-|Allow egress to kube-dns pods|
|txsigner.networkPolicy.extraEgress[0].to[0].podSelector|object|-|Match kube-dns pods|
|txsigner.networkPolicy.extraEgress[0].to[0].podSelector.matchLabels|object|-|Match labels for kube-dns|
|txsigner.networkPolicy.extraEgress[0].to[0].podSelector.matchLabels.k8s-app|string|`"kube-dns"`|Application name for kube-dns|
|txsigner.networkPolicy.extraEgress[1]|object|-|Allow access to Besu nodes|
|txsigner.networkPolicy.extraEgress[1].ports|list|-|Allowed ports for Besu RPC|
|txsigner.networkPolicy.extraEgress[1].ports[0]|object|-|Besu RPC port configuration|
|txsigner.networkPolicy.extraEgress[1].ports[0].port|int|`8545`|RPC port|
|txsigner.networkPolicy.extraEgress[1].to[0]|object|-|Allow egress to Besu statefulset pods|
|txsigner.networkPolicy.extraEgress[1].to[0].podSelector.matchLabels|object|-|Match labels for Besu|
|txsigner.networkPolicy.extraEgress[1].to[0].podSelector.matchLabels."app.kubernetes.io/name"|string|`"besu-statefulset"`|Application name for Besu|
|txsigner.networkPolicy.extraEgress[2]|object|-|Allow access to external HTTPS APIs (for signing services)|
|txsigner.networkPolicy.extraEgress[2].ports|list|-|Allowed ports for HTTPS|
|txsigner.networkPolicy.extraEgress[2].ports[0]|object|-|HTTPS port configuration|
|txsigner.networkPolicy.extraEgress[2].ports[0].port|int|`443`|HTTPS port|
|txsigner.networkPolicy.extraEgress[2].to[0]|object|-|Allow egress to any namespace|
|txsigner.networkPolicy.extraIngress|list|-|Add extra ingress rules to the NetworkPolicy|
|txsigner.networkPolicy.extraIngress[0]|object|-|Allow ingress from dapp, portal, ingress-nginx, and same namespace|
|txsigner.networkPolicy.extraIngress[0].from[0]|object|-|Allow from dapp pods|
|txsigner.networkPolicy.extraIngress[0].from[0].podSelector.matchLabels|object|-|Match labels for dapp|
|txsigner.networkPolicy.extraIngress[0].from[0].podSelector.matchLabels."app.kubernetes.io/name"|string|`"dapp"`|Application name for dapp|
|txsigner.networkPolicy.extraIngress[0].from[1]|object|-|Allow from portal pods|
|txsigner.networkPolicy.extraIngress[0].from[1].podSelector.matchLabels|object|-|Match labels for portal|
|txsigner.networkPolicy.extraIngress[0].from[1].podSelector.matchLabels."app.kubernetes.io/name"|string|`"portal"`|Application name for portal|
|txsigner.networkPolicy.extraIngress[0].from[2]|object|-|Allow from ingress-nginx pods|
|txsigner.networkPolicy.extraIngress[0].from[2].podSelector.matchLabels|object|-|Match labels for ingress-nginx|
|txsigner.networkPolicy.extraIngress[0].from[2].podSelector.matchLabels."app.kubernetes.io/name"|string|`"ingress-nginx"`|Application name for ingress-nginx|
|txsigner.networkPolicy.extraIngress[0].from[3]|object|-|Allow from all pods in same namespace|
|txsigner.networkPolicy.extraIngress[0].ports|list|-|Allowed ports for ingress|
|txsigner.networkPolicy.extraIngress[0].ports[0]|object|-|HTTP port configuration|
|txsigner.networkPolicy.extraIngress[0].ports[0].port|int|`3000`|HTTP port|
|txsigner.networkPolicy.extraIngress[0].ports[1]|object|-|Metrics port configuration|
|txsigner.networkPolicy.extraIngress[0].ports[1].port|int|`3001`|Metrics port|
|txsigner.networkPolicy.ingressRules|object|-|Ingress rules configuration|
|txsigner.networkPolicy.ingressRules.accessOnlyFrom|object|-|Access restrictions configuration|
|txsigner.networkPolicy.ingressRules.accessOnlyFrom.enabled|bool|`false`|Enable ingress rule that makes TxSigner only accessible from a particular origin.|
|txsigner.networkPolicy.ingressRules.accessOnlyFrom.namespaceSelector|object|-|Namespace selector label that is allowed to access TxSigner. This label will be used to identified allowed namespace(s).|
|txsigner.networkPolicy.ingressRules.accessOnlyFrom.podSelector|object|-|Pods selector label that is allowed to access TxSigner. This label will be used to identified allowed pod(s).|
|txsigner.nodeAffinityPreset|object|-|Node affinity preset configuration (object)|
|txsigner.nodeAffinityPreset.key|string|`""`|Node label key to match. Ignored if `affinity` is set (object)|
|txsigner.nodeAffinityPreset.type|string|`""`|Node affinity preset type. Ignored if `affinity` is set. Allowed values: `soft` or `hard` (object)|
|txsigner.nodeAffinityPreset.values|list|-|Node label values to match. Ignored if `affinity` is set (object)|
|txsigner.nodeSelector|object|-|Node labels for pod assignment (object)|
|txsigner.openShiftRoute|object|-|OpenShift Route parameters|
|txsigner.openShiftRoute.alternateBackends|list|-|Additional backends for weighted routing|
|txsigner.openShiftRoute.annotations|object|-|Additional annotations for the OpenShift route resource|
|txsigner.openShiftRoute.enabled|bool|`false`|Enable OpenShift route creation for TxSigner|
|txsigner.openShiftRoute.host|string|`"txsigner.k8s.orb.local"`|Hostname exposed via the OpenShift route|
|txsigner.openShiftRoute.path|string|`"/"`|HTTP path exposed via the OpenShift route|
|txsigner.openShiftRoute.port|object|-|Service port configuration for the route target|
|txsigner.openShiftRoute.port.targetPort|string|`"http"`|Service target port name (must exist on the TxSigner service)|
|txsigner.openShiftRoute.tls|object|-|TLS configuration for the OpenShift route|
|txsigner.openShiftRoute.to|object|-|Primary service weight configuration|
|txsigner.openShiftRoute.to.weight|int|`100`|Weight assigned to the TxSigner service backend|
|txsigner.openShiftRoute.wildcardPolicy|string|`"None"`|Wildcard policy to apply to the route|
|txsigner.pdb|object|-|Pod disruption budget configuration (object)|
|txsigner.pdb.enabled|bool|`false`|If true, create a pod disruption budget for pods.|
|txsigner.pdb.maxUnavailable|string|`""`|Maximum number/percentage of pods that may be made unavailable. Defaults to 1 if both pdb.minAvailable and pdb.maxUnavailable are empty.|
|txsigner.pdb.minAvailable|string|`""`|Minimum number/percentage of pods that should remain scheduled|
|txsigner.podAffinityPreset|string|`""`|Pod affinity preset. Ignored if `affinity` is set. Allowed values: `soft` or `hard`|
|txsigner.podAnnotations|object|-|Annotations for TxSigner pods (object)|
|txsigner.podAnnotations."prometheus.io/path"|string|`"/metrics"`|Prometheus metrics path|
|txsigner.podAnnotations."prometheus.io/port"|string|`"3001"`|Prometheus metrics port|
|txsigner.podAnnotations."prometheus.io/scrape"|string|`"true"`|Enable prometheus scraping|
|txsigner.podAntiAffinityPreset|string|`"soft"`|Pod anti-affinity preset. Ignored if `affinity` is set. Allowed values: `soft` or `hard`|
|txsigner.podLabels|object|-|Extra labels for TxSigner pods|
|txsigner.podSecurityContext|object|-|Pod Security Context configuration (object)|
|txsigner.priorityClassName|string|`""`|TxSigner pods' priority class name (string)|
|txsigner.readinessProbe|object|-|Configure TxSigner containers' readiness probe (object)|
|txsigner.readinessProbe.enabled|bool|`true`|Enable readinessProbe on TxSigner containers (bool)|
|txsigner.readinessProbe.failureThreshold|int|`60`|Failure threshold for readinessProbe (int)|
|txsigner.readinessProbe.initialDelaySeconds|int|`1`|Initial delay seconds for readinessProbe (int)|
|txsigner.readinessProbe.periodSeconds|int|`5`|Period seconds for readinessProbe (int)|
|txsigner.readinessProbe.successThreshold|int|`1`|Success threshold for readinessProbe (int)|
|txsigner.readinessProbe.tcpSocket|object|-|TCP socket parameters for readinessProbe (object)|
|txsigner.readinessProbe.tcpSocket.port|string|`"http"`|Port for tcpSocket readinessProbe|
|txsigner.readinessProbe.timeoutSeconds|int|`5`|Timeout seconds for readinessProbe (int)|
|txsigner.replicaCount|int|`1`|Number of TxSigner replicas to deploy (int)|
|txsigner.resources|object|-|TxSigner containers resource requests and limits|
|txsigner.schedulerName|string|`""`|Alternate scheduler (string)|
|txsigner.service|object|-|Service parameters (object)|
|txsigner.service.annotations|object|-|Additional custom annotations for TxSigner service|
|txsigner.service.clusterIP|string|`""`|TxSigner service Cluster IP|
|txsigner.service.externalTrafficPolicy|string|`"Cluster"`|TxSigner service external traffic policy|
|txsigner.service.extraPorts|list|-|Extra ports to expose in the TxSigner service (normally used with the `sidecar` value)|
|txsigner.service.loadBalancerIP|string|`""`|TxSigner service Load Balancer IP|
|txsigner.service.loadBalancerSourceRanges|list|-|TxSigner service Load Balancer sources (list)|
|txsigner.service.metricsNodePort|string|`""`|Node port for metrics|
|txsigner.service.metricsPort|int|`3001`|TxSigner service metrics port|
|txsigner.service.nodePort|string|`""`|Node port for HTTP|
|txsigner.service.port|int|`3000`|TxSigner service HTTP port|
|txsigner.service.sessionAffinity|string|`"None"`|Session Affinity for Kubernetes service, can be "None" or "ClientIP"|
|txsigner.service.sessionAffinityConfig|object|-|Additional settings for the sessionAffinity|
|txsigner.service.type|string|`"ClusterIP"`|TxSigner service type|
|txsigner.serviceAccount|object|-|Service account for TxSigner pods|
|txsigner.serviceAccount.annotations|object|-|Annotations for service account. Evaluated as a template. Only used if `create` is `true`.|
|txsigner.serviceAccount.automountServiceAccountToken|bool|`false`|Automount service account token for the deployment controller service account|
|txsigner.serviceAccount.create|bool|`true`|Specifies whether a ServiceAccount should be created|
|txsigner.serviceAccount.labels|object|-|Extra labels to be added to the service account|
|txsigner.serviceAccount.name|string|`""`|The name of the ServiceAccount to use.|
|txsigner.startupProbe|object|-|Configure TxSigner containers' startup probe (object)|
|txsigner.startupProbe.enabled|bool|`false`|Enable startupProbe on TxSigner containers (bool)|
|txsigner.startupProbe.failureThreshold|int|`10`|Failure threshold for startupProbe (int)|
|txsigner.startupProbe.initialDelaySeconds|int|`30`|Initial delay seconds for startupProbe (int)|
|txsigner.startupProbe.periodSeconds|int|`10`|Period seconds for startupProbe (int)|
|txsigner.startupProbe.successThreshold|int|`1`|Success threshold for startupProbe (int)|
|txsigner.startupProbe.timeoutSeconds|int|`5`|Timeout seconds for startupProbe (int)|
|txsigner.tests|object|-|Test parameters (object)|
|txsigner.tests.image|object|-|Image for test pods|
|txsigner.tests.image.pullPolicy|string|`"IfNotPresent"`|Test image pull policy|
|txsigner.tests.image.registry|string|`"docker.io"`|Test image registry|
|txsigner.tests.image.repository|string|`"busybox"`|Test image repository|
|txsigner.tests.image.tag|string|`"1.37.0"`|Test image tag|
|txsigner.tolerations|list|-|Tolerations for pod assignment (list)|
|txsigner.topologySpreadConstraints|list|-|Topology Spread Constraints for pod assignment (list)|
|txsigner.updateStrategy|object|-|Update strategy configuration for TxSigner deployment|
|txsigner.updateStrategy.rollingUpdate|object|-|TxSigner deployment rolling update configuration parameters|
|txsigner.updateStrategy.type|string|`"RollingUpdate"`|TxSigner deployment strategy type|

## Resource Summary

| Component | Replicas | Request CPU | Limit CPU | Request Memory | Limit Memory | Storage |
|-----------|----------|-------------|-----------|----------------|--------------|---------|
| blockscout.blockscout | 1 | 150m | 1500m | 1280Mi | 2560Mi | - |
| blockscout.frontend | 1 | 120m | 600m | 768Mi | 1536Mi | - |
| dapp | 1 | 100m | 1000m | 1024Mi | 2048Mi | - |
| erpc | 1 | 250m | 1000m | 1024Mi | 2048Mi | - |
| graph-node | 1 | 100m | 1000m | 1536Mi | 3072Mi | - |
| hasura | 1 | 100m | 1000m | 1024Mi | 2048Mi | - |
| ipfs.cluster | 1 | 50m | 1000m | 1024Mi | 2048Mi | - |
| ipfs.ipfs | 1 | 300m | 600m | 1024Mi | 2048Mi | - |
| network.network-bootstrapper | 1 | 100m | 250m | 128Mi | 256Mi | - |
| network.network-nodes | 1 | 75m | 1500m | 1280Mi | 2560Mi | 20Gi |
| network.network-nodes.compileGenesis | 1 | 100m | 250m | 128Mi | 256Mi | - |
| observability.alloy.alloy | 1 | 100m | 240m | 160Mi | 320Mi | - |
| observability.grafana | 1 | 180m | 360m | 192Mi | 384Mi | - |
| observability.kube-state-metrics | 1 | 120m | 240m | 160Mi | 256Mi | - |
| observability.loki.gateway | 1 | 50m | 150m | 64Mi | 160Mi | - |
| observability.loki.memcached | 1 | 40m | 120m | 48Mi | 96Mi | - |
| observability.loki.memcachedExporter | 1 | 10m | 25m | 24Mi | 48Mi | - |
| observability.loki.sidecar | 1 | 25m | 75m | 36Mi | 72Mi | - |
| observability.loki.singleBinary | 1 | 170m | 500m | 360Mi | 600Mi | 10Gi |
| observability.metrics-server | 1 | 40m | 80m | 25Mi | 50Mi | - |
| observability.prometheus-node-exporter | 1 | 30m | 60m | 32Mi | 64Mi | - |
| observability.tempo.server | 1 | 100m | 240m | 192Mi | 384Mi | - |
| observability.victoria-metrics-single.server | 1 | 180m | 420m | 320Mi | 600Mi | 10Gi |
| portal | 1 | 100m | 1000m | 512Mi | 1024Mi | - |
| support | 1 | 50m | 500m | 512Mi | 1024Mi | - |
| support.ingress-nginx.controller | 1 | 200m | 600m | 512Mi | 1024Mi | - |
| support.redis | 1 | 100m | 200m | 128Mi | 256Mi | 1Gi |
| support.reloader | 1 | 100m | 200m | 128Mi | 256Mi | - |
| txsigner | 1 | 150m | 500m | 256Mi | 512Mi | - |

| **Totals** | - | 3.19 cores (3190m) | 15.21 cores (15210m) | 13901Mi (13.58Gi) | 27610Mi (26.96Gi) | 41984Mi (41.00Gi) |

## Maintainers

| Name | Email | Url |
| ---- | ------ | --- |
| SettleMint | <support@settlemint.com> | <https://settlemint.com> |

## Requirements

| Repository | Name | Version |
|------------|------|---------|
|  | blockscout | 2.0.0-alpha.17 |
|  | dapp | 2.0.0-alpha.17 |
|  | erpc | 2.0.0-alpha.17 |
|  | graph-node | 2.0.0-alpha.17 |
|  | hasura | 2.0.0-alpha.17 |
|  | ipfs | 2.0.0-alpha.17 |
|  | network | 2.0.0-alpha.17 |
|  | observability | 2.0.0-alpha.17 |
|  | portal | 2.0.0-alpha.17 |
|  | support | 2.0.0-alpha.17 |
|  | txsigner | 2.0.0-alpha.17 |

# atk

![Version: 2.0.0-alpha.15](https://img.shields.io/badge/Version-2.0.0--alpha.15-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: 2.0.0-alpha.15](https://img.shields.io/badge/AppVersion-2.0.0--alpha.15-informational?style=flat-square)

A Helm chart for the SettleMint Asset Tokenization Kit

## Connection Overview

Collect the following connection parameters before deploying or overriding values. Update the listed
keys in `values.yaml` (or your environment-specific values file) to point services at your
environment.

### PostgreSQL Targets
| Service | Values path | Default host | Default port | Default database | Default username | Default password | Default SSL mode |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Blockscout | `blockscout.postgresql` | `postgresql` | `5432` | `blockscout` | `blockscout` | `atk` | `disable` |
| Graph Node | `global.datastores.graphNode.postgresql` | `postgresql` | `5432` | `thegraph` | `thegraph` | `atk` | `disable` |
| Hasura | `hasura.postgresql` | `postgresql` | `5432` | `hasura` | `hasura` | `atk` | `disable` |
| Portal | `global.datastores.portal.postgresql` | `postgresql` | `5432` | `portal` | `portal` | `atk` | `disable` |
| TxSigner | `global.datastores.txsigner.postgresql` | `postgresql` | `5432` | `txsigner` | `txsigner` | `atk` | `disable` |

### Redis Targets
| Service | Values path | Default host | Default port | Default database | Default username | Default password |
| --- | --- | --- | --- | --- | --- | --- |
| eRPC Cache | `global.datastores.erpc.redis.cacheDb` | `redis` | `6379` | `0` | `default` | `atk` |
| eRPC Shared State | `global.datastores.erpc.redis.sharedStateDb` | `redis` | `6379` | `1` | `default` | `atk` |
| Hasura Cache | `hasura.redis.primary` | `redis` | `6379` | `2` | `default` | `atk` |
| Hasura Rate Limit | `hasura.redis.rateLimit` | `redis` | `6379` | `3` | `default` | `atk` |
| Portal | `global.datastores.portal.redis` | `redis` | `6379` | `4` | `default` | `atk` |

Each service uses its own logical database to avoid key collisions. When pointing to an external
Redis or PostgreSQL deployment, update the appropriate values paths listed above.

## Configuration

The following table lists the configurable parameters of this chart and their default values.

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| blockscout | object | `{"blockscout":{"env":{"API_URL":"https://explorer.k8s.orb.local","WEBAPP_URL":"https://explorer.k8s.orb.local"},"image":{"repository":"ghcr.io/blockscout/blockscout"},"ingress":{"className":"atk-nginx","enabled":true,"hostname":"explorer.k8s.orb.local"},"initContainer":{"tcpCheck":{"image":{"repository":"ghcr.io/settlemint/btp-waitforit"}}},"openShiftRoute":{"enabled":false,"host":"explorer.k8s.orb.local"},"resources":{}},"enabled":true,"frontend":{"enabled":true,"image":{"repository":"ghcr.io/blockscout/frontend"},"ingress":{"className":"atk-nginx","enabled":true,"hostname":"explorer.k8s.orb.local"}}}` | Blockscout blockchain explorer configuration |
| blockscout.blockscout | object | `{"env":{"API_URL":"https://explorer.k8s.orb.local","WEBAPP_URL":"https://explorer.k8s.orb.local"},"image":{"repository":"ghcr.io/blockscout/blockscout"},"ingress":{"className":"atk-nginx","enabled":true,"hostname":"explorer.k8s.orb.local"},"initContainer":{"tcpCheck":{"image":{"repository":"ghcr.io/settlemint/btp-waitforit"}}},"openShiftRoute":{"enabled":false,"host":"explorer.k8s.orb.local"},"resources":{}}` | Blockscout backend service configuration |
| blockscout.blockscout.env | object | `{"API_URL":"https://explorer.k8s.orb.local","WEBAPP_URL":"https://explorer.k8s.orb.local"}` | Environment variables for Blockscout configuration |
| blockscout.blockscout.env.API_URL | string | `"https://explorer.k8s.orb.local"` | API URL for Blockscout backend |
| blockscout.blockscout.env.WEBAPP_URL | string | `"https://explorer.k8s.orb.local"` | Web app URL for Blockscout frontend |
| blockscout.blockscout.image | object | `{"repository":"ghcr.io/blockscout/blockscout"}` | Blockscout backend container image |
| blockscout.blockscout.image.repository | string | `"ghcr.io/blockscout/blockscout"` | OCI registry and repository for Blockscout backend |
| blockscout.blockscout.ingress | object | `{"className":"atk-nginx","enabled":true,"hostname":"explorer.k8s.orb.local"}` | Ingress configuration for Blockscout backend |
| blockscout.blockscout.ingress.className | string | `"atk-nginx"` | IngressClass for Blockscout |
| blockscout.blockscout.ingress.enabled | bool | `true` | Enable ingress for Blockscout API |
| blockscout.blockscout.ingress.hostname | string | `"explorer.k8s.orb.local"` | Hostname for Blockscout explorer. Update for your environment. |
| blockscout.blockscout.initContainer | object | `{"tcpCheck":{"image":{"repository":"ghcr.io/settlemint/btp-waitforit"}}}` | Init container for database readiness |
| blockscout.blockscout.initContainer.tcpCheck | object | `{"image":{"repository":"ghcr.io/settlemint/btp-waitforit"}}` | TCP check for PostgreSQL |
| blockscout.blockscout.initContainer.tcpCheck.image | object | `{"repository":"ghcr.io/settlemint/btp-waitforit"}` | Wait-for-it utility image |
| blockscout.blockscout.initContainer.tcpCheck.image.repository | string | `"ghcr.io/settlemint/btp-waitforit"` | Repository for TCP check utility |
| blockscout.blockscout.openShiftRoute | object | `{"enabled":false,"host":"explorer.k8s.orb.local"}` | OpenShift Route configuration |
| blockscout.blockscout.openShiftRoute.enabled | bool | `false` | Enable OpenShift route |
| blockscout.blockscout.openShiftRoute.host | string | `"explorer.k8s.orb.local"` | Hostname for OpenShift route |
| blockscout.blockscout.resources | object | `{}` | Resource requests and limits for Blockscout backend |
| blockscout.enabled | bool | `true` | Enable deployment of Blockscout blockchain explorer |
| blockscout.frontend | object | `{"enabled":true,"image":{"repository":"ghcr.io/blockscout/frontend"},"ingress":{"className":"atk-nginx","enabled":true,"hostname":"explorer.k8s.orb.local"}}` | Blockscout frontend service configuration |
| blockscout.frontend.enabled | bool | `true` | Enable Blockscout frontend deployment |
| blockscout.frontend.image | object | `{"repository":"ghcr.io/blockscout/frontend"}` | Blockscout frontend container image |
| blockscout.frontend.image.repository | string | `"ghcr.io/blockscout/frontend"` | OCI registry and repository for Blockscout frontend |
| blockscout.frontend.ingress | object | `{"className":"atk-nginx","enabled":true,"hostname":"explorer.k8s.orb.local"}` | Ingress configuration for Blockscout UI |
| blockscout.frontend.ingress.className | string | `"atk-nginx"` | IngressClass for frontend |
| blockscout.frontend.ingress.enabled | bool | `true` | Enable ingress for frontend |
| blockscout.frontend.ingress.hostname | string | `"explorer.k8s.orb.local"` | Hostname for Blockscout frontend |
| dapp | object | `{"enabled":true,"image":{"repository":"ghcr.io/settlemint/asset-tokenization-kit"},"ingress":{"enabled":true,"hosts":[{"host":"dapp.k8s.orb.local","paths":[{"path":"/","pathType":"ImplementationSpecific"}]}]},"initContainer":{"graphQLCheck":{"image":{"registry":"docker.io"}},"tcpCheck":{"image":{"repository":"ghcr.io/settlemint/btp-waitforit"}}},"job":{"image":{"repository":"docker.io/node"}},"resources":{},"secretEnv":{"BETTER_AUTH_URL":"https://dapp.k8s.orb.local","SETTLEMINT_BLOCKSCOUT_UI_ENDPOINT":"https://blockscout.k8s.orb.local/"}}` | DApp frontend application configuration |
| dapp.enabled | bool | `true` | Enable deployment of the Asset Tokenization Kit web application |
| dapp.image | object | `{"repository":"ghcr.io/settlemint/asset-tokenization-kit"}` | DApp container image configuration |
| dapp.image.repository | string | `"ghcr.io/settlemint/asset-tokenization-kit"` | OCI registry and repository for DApp frontend |
| dapp.ingress | object | `{"enabled":true,"hosts":[{"host":"dapp.k8s.orb.local","paths":[{"path":"/","pathType":"ImplementationSpecific"}]}]}` | Ingress configuration for DApp web interface |
| dapp.ingress.enabled | bool | `true` | Enable ingress for web application access |
| dapp.ingress.hosts | list | `[{"host":"dapp.k8s.orb.local","paths":[{"path":"/","pathType":"ImplementationSpecific"}]}]` | Ingress host rules for DApp |
| dapp.ingress.hosts[0].host | string | `"dapp.k8s.orb.local"` | Hostname for DApp. Update for your environment. |
| dapp.ingress.hosts[0].paths | list | `[{"path":"/","pathType":"ImplementationSpecific"}]` | Path configuration |
| dapp.ingress.hosts[0].paths[0].path | string | `"/"` | Root path for web application |
| dapp.ingress.hosts[0].paths[0].pathType | string | `"ImplementationSpecific"` | Path matching type |
| dapp.initContainer | object | `{"graphQLCheck":{"image":{"registry":"docker.io"}},"tcpCheck":{"image":{"repository":"ghcr.io/settlemint/btp-waitforit"}}}` | Init containers for DApp startup dependencies |
| dapp.initContainer.graphQLCheck | object | `{"image":{"registry":"docker.io"}}` | GraphQL endpoint readiness check |
| dapp.initContainer.graphQLCheck.image | object | `{"registry":"docker.io"}` | curl utility for GraphQL health checks |
| dapp.initContainer.graphQLCheck.image.registry | string | `"docker.io"` | OCI registry for curl image |
| dapp.initContainer.tcpCheck | object | `{"image":{"repository":"ghcr.io/settlemint/btp-waitforit"}}` | TCP check for backend services |
| dapp.initContainer.tcpCheck.image | object | `{"repository":"ghcr.io/settlemint/btp-waitforit"}` | Wait-for-it utility image |
| dapp.initContainer.tcpCheck.image.repository | string | `"ghcr.io/settlemint/btp-waitforit"` | Repository for TCP check utility |
| dapp.job | object | `{"image":{"repository":"docker.io/node"}}` | Post-deployment job configuration for database migrations |
| dapp.job.image | object | `{"repository":"docker.io/node"}` | Job container image |
| dapp.job.image.repository | string | `"docker.io/node"` | Node.js runtime image for migration scripts |
| dapp.resources | object | `{}` | Resource requests and limits for DApp pods |
| dapp.secretEnv | object | `{"BETTER_AUTH_URL":"https://dapp.k8s.orb.local","SETTLEMINT_BLOCKSCOUT_UI_ENDPOINT":"https://blockscout.k8s.orb.local/"}` | Environment variables for DApp runtime configuration (stored as secrets) |
| dapp.secretEnv.BETTER_AUTH_URL | string | `"https://dapp.k8s.orb.local"` | Base URL for authentication callbacks. Must match ingress hostname. |
| dapp.secretEnv.SETTLEMINT_BLOCKSCOUT_UI_ENDPOINT | string | `"https://blockscout.k8s.orb.local/"` | Blockscout explorer UI endpoint for blockchain browsing |
| erpc | object | `{"enabled":true,"image":{"registry":"ghcr.io"},"ingress":{"className":"atk-nginx","enabled":true,"hosts":[{"host":"rpc.k8s.orb.local","paths":[{"path":"/","pathType":"ImplementationSpecific"}]}]},"initContainer":{"tcpCheck":{"image":{"repository":"ghcr.io/settlemint/btp-waitforit"}}},"openShiftRoute":{"enabled":false,"host":"rpc.k8s.orb.local"},"resources":{},"tests":{"image":{"registry":"docker.io"}}}` | ERPC Gateway configuration for RPC load balancing and caching |
| erpc.enabled | bool | `true` | Enable deployment of ERPC gateway |
| erpc.image | object | `{"registry":"ghcr.io"}` | ERPC container image |
| erpc.image.registry | string | `"ghcr.io"` | OCI registry for ERPC image |
| erpc.ingress | object | `{"className":"atk-nginx","enabled":true,"hosts":[{"host":"rpc.k8s.orb.local","paths":[{"path":"/","pathType":"ImplementationSpecific"}]}]}` | Ingress configuration for exposing RPC endpoint |
| erpc.ingress.className | string | `"atk-nginx"` | IngressClass for RPC ingress |
| erpc.ingress.enabled | bool | `true` | Enable ingress for external RPC access |
| erpc.ingress.hosts | list | `[{"host":"rpc.k8s.orb.local","paths":[{"path":"/","pathType":"ImplementationSpecific"}]}]` | Ingress host rules for RPC endpoint |
| erpc.ingress.hosts[0].host | string | `"rpc.k8s.orb.local"` | Hostname for RPC endpoint. Update for your environment. |
| erpc.ingress.hosts[0].paths | list | `[{"path":"/","pathType":"ImplementationSpecific"}]` | Path configuration |
| erpc.ingress.hosts[0].paths[0].path | string | `"/"` | Path prefix for RPC requests |
| erpc.ingress.hosts[0].paths[0].pathType | string | `"ImplementationSpecific"` | Path matching strategy |
| erpc.initContainer | object | `{"tcpCheck":{"image":{"repository":"ghcr.io/settlemint/btp-waitforit"}}}` | Init container for startup dependency checks |
| erpc.initContainer.tcpCheck | object | `{"image":{"repository":"ghcr.io/settlemint/btp-waitforit"}}` | TCP readiness check |
| erpc.initContainer.tcpCheck.image | object | `{"repository":"ghcr.io/settlemint/btp-waitforit"}` | Wait-for-it utility image |
| erpc.initContainer.tcpCheck.image.repository | string | `"ghcr.io/settlemint/btp-waitforit"` | Repository for TCP check utility |
| erpc.openShiftRoute | object | `{"enabled":false,"host":"rpc.k8s.orb.local"}` | OpenShift Route configuration (alternative to Ingress) |
| erpc.openShiftRoute.enabled | bool | `false` | Enable OpenShift route instead of standard ingress |
| erpc.openShiftRoute.host | string | `"rpc.k8s.orb.local"` | Hostname for OpenShift route |
| erpc.resources | object | `{}` | Resource requests and limits for ERPC pods |
| erpc.tests | object | `{"image":{"registry":"docker.io"}}` | Test container image for ERPC health checks |
| erpc.tests.image | object | `{"registry":"docker.io"}` | Test image configuration |
| erpc.tests.image.registry | string | `"docker.io"` | OCI registry for test utilities |
| global | object | `{"chainId":"53771311147","chainName":"ATK","datastores":{"blockscout":{"postgresql":{"database":"blockscout","password":"atk","username":"blockscout"}},"default":{"postgresql":{"database":"postgres","host":"postgresql","password":"atk","port":5432,"sslMode":"disable","username":"postgres"},"redis":{"db":0,"host":"redis","password":"atk","port":6379,"query":"dial_timeout=5s&read_timeout=2s&write_timeout=2s&pool_size=50","username":"default"}},"erpc":{"redis":{"cacheDb":0,"sharedStateDb":1}},"graphNode":{"postgresql":{"database":"thegraph","password":"atk","username":"thegraph"}},"hasura":{"postgresql":{"database":"hasura","password":"atk","username":"hasura"},"redis":{"cacheDb":2,"rateLimitDb":3}},"portal":{"postgresql":{"database":"portal","password":"atk","username":"portal"},"redis":{"db":4}},"txsigner":{"postgresql":{"database":"txsigner","password":"atk","username":"txsigner"}}},"labels":{}}` | Global configuration shared across all subcharts |
| global.chainId | string | `"53771311147"` | Blockchain chain ID used across all network components |
| global.chainName | string | `"ATK"` | Human-readable name for the blockchain network |
| global.datastores | object | `{"blockscout":{"postgresql":{"database":"blockscout","password":"atk","username":"blockscout"}},"default":{"postgresql":{"database":"postgres","host":"postgresql","password":"atk","port":5432,"sslMode":"disable","username":"postgres"},"redis":{"db":0,"host":"redis","password":"atk","port":6379,"query":"dial_timeout=5s&read_timeout=2s&write_timeout=2s&pool_size=50","username":"default"}},"erpc":{"redis":{"cacheDb":0,"sharedStateDb":1}},"graphNode":{"postgresql":{"database":"thegraph","password":"atk","username":"thegraph"}},"hasura":{"postgresql":{"database":"hasura","password":"atk","username":"hasura"},"redis":{"cacheDb":2,"rateLimitDb":3}},"portal":{"postgresql":{"database":"portal","password":"atk","username":"portal"},"redis":{"db":4}},"txsigner":{"postgresql":{"database":"txsigner","password":"atk","username":"txsigner"}}}` | Centralized datastore connection configuration shared across all services |
| global.datastores.blockscout | object | `{"postgresql":{"database":"blockscout","password":"atk","username":"blockscout"}}` | Blockscout specific datastore configuration for blockchain explorer |
| global.datastores.blockscout.postgresql | object | `{"database":"blockscout","password":"atk","username":"blockscout"}` | PostgreSQL database for Blockscout explorer data |
| global.datastores.blockscout.postgresql.database | string | `"blockscout"` | Dedicated database name for blockchain explorer |
| global.datastores.blockscout.postgresql.password | string | `"atk"` | Blockscout database password. Change for production deployments. |
| global.datastores.blockscout.postgresql.username | string | `"blockscout"` | Database user for Blockscout |
| global.datastores.default | object | `{"postgresql":{"database":"postgres","host":"postgresql","password":"atk","port":5432,"sslMode":"disable","username":"postgres"},"redis":{"db":0,"host":"redis","password":"atk","port":6379,"query":"dial_timeout=5s&read_timeout=2s&write_timeout=2s&pool_size=50","username":"default"}}` | Default datastore configuration for services that don't require specialized settings |
| global.datastores.default.postgresql | object | `{"database":"postgres","host":"postgresql","password":"atk","port":5432,"sslMode":"disable","username":"postgres"}` | PostgreSQL configuration for default services |
| global.datastores.default.postgresql.database | string | `"postgres"` | Default PostgreSQL database name |
| global.datastores.default.postgresql.host | string | `"postgresql"` | PostgreSQL service hostname within the cluster |
| global.datastores.default.postgresql.password | string | `"atk"` | PostgreSQL superuser password. Change for production deployments. |
| global.datastores.default.postgresql.port | int | `5432` | PostgreSQL service port |
| global.datastores.default.postgresql.sslMode | string | `"disable"` | SSL mode for PostgreSQL connections (disable, require, verify-ca, verify-full) |
| global.datastores.default.postgresql.username | string | `"postgres"` | PostgreSQL superuser username |
| global.datastores.default.redis | object | `{"db":0,"host":"redis","password":"atk","port":6379,"query":"dial_timeout=5s&read_timeout=2s&write_timeout=2s&pool_size=50","username":"default"}` | Redis configuration for default services |
| global.datastores.default.redis.db | int | `0` | Redis database number to use (0-15) |
| global.datastores.default.redis.host | string | `"redis"` | Redis service hostname within the cluster |
| global.datastores.default.redis.password | string | `"atk"` | Redis authentication password. Change for production deployments. |
| global.datastores.default.redis.port | int | `6379` | Redis service port |
| global.datastores.default.redis.query | string | `"dial_timeout=5s&read_timeout=2s&write_timeout=2s&pool_size=50"` | Redis connection query parameters for tuning connection behavior |
| global.datastores.default.redis.username | string | `"default"` | Redis authentication username |
| global.datastores.erpc | object | `{"redis":{"cacheDb":0,"sharedStateDb":1}}` | ERPC-specific datastore configuration for RPC gateway caching |
| global.datastores.erpc.redis | object | `{"cacheDb":0,"sharedStateDb":1}` | Redis database allocation for ERPC services |
| global.datastores.erpc.redis.cacheDb | int | `0` | Redis database number for ERPC response caching |
| global.datastores.erpc.redis.sharedStateDb | int | `1` | Redis database number for ERPC shared state storage |
| global.datastores.graphNode | object | `{"postgresql":{"database":"thegraph","password":"atk","username":"thegraph"}}` | The Graph Node specific datastore configuration for blockchain indexing |
| global.datastores.graphNode.postgresql | object | `{"database":"thegraph","password":"atk","username":"thegraph"}` | PostgreSQL database for The Graph indexing data |
| global.datastores.graphNode.postgresql.database | string | `"thegraph"` | Dedicated database name for subgraph data |
| global.datastores.graphNode.postgresql.password | string | `"atk"` | The Graph database password. Change for production deployments. |
| global.datastores.graphNode.postgresql.username | string | `"thegraph"` | Database user for The Graph node |
| global.datastores.hasura | object | `{"postgresql":{"database":"hasura","password":"atk","username":"hasura"},"redis":{"cacheDb":2,"rateLimitDb":3}}` | Hasura GraphQL Engine specific datastore configuration |
| global.datastores.hasura.postgresql | object | `{"database":"hasura","password":"atk","username":"hasura"}` | PostgreSQL database for Hasura metadata and data |
| global.datastores.hasura.postgresql.database | string | `"hasura"` | Dedicated database name for Hasura GraphQL engine |
| global.datastores.hasura.postgresql.password | string | `"atk"` | Hasura database password. Change for production deployments. |
| global.datastores.hasura.postgresql.username | string | `"hasura"` | Database user for Hasura |
| global.datastores.hasura.redis | object | `{"cacheDb":2,"rateLimitDb":3}` | Redis databases for Hasura caching and rate limiting |
| global.datastores.hasura.redis.cacheDb | int | `2` | Redis database number for Hasura query result caching |
| global.datastores.hasura.redis.rateLimitDb | int | `3` | Redis database number for Hasura API rate limiting |
| global.datastores.portal | object | `{"postgresql":{"database":"portal","password":"atk","username":"portal"},"redis":{"db":4}}` | Portal-specific datastore configuration for identity and access management |
| global.datastores.portal.postgresql | object | `{"database":"portal","password":"atk","username":"portal"}` | PostgreSQL database for Portal service |
| global.datastores.portal.postgresql.database | string | `"portal"` | Dedicated database name for Portal tables |
| global.datastores.portal.postgresql.password | string | `"atk"` | Portal database password. Change for production deployments. |
| global.datastores.portal.postgresql.username | string | `"portal"` | Database user for Portal with limited privileges |
| global.datastores.portal.redis | object | `{"db":4}` | Redis database for Portal session and caching |
| global.datastores.portal.redis.db | int | `4` | Redis database number for Portal data |
| global.datastores.txsigner | object | `{"postgresql":{"database":"txsigner","password":"atk","username":"txsigner"}}` | Transaction Signer specific datastore configuration |
| global.datastores.txsigner.postgresql | object | `{"database":"txsigner","password":"atk","username":"txsigner"}` | PostgreSQL database for transaction signing service |
| global.datastores.txsigner.postgresql.database | string | `"txsigner"` | Dedicated database name for transaction signer state |
| global.datastores.txsigner.postgresql.password | string | `"atk"` | Transaction signer database password. Change for production deployments. |
| global.datastores.txsigner.postgresql.username | string | `"txsigner"` | Database user for transaction signer |
| global.labels | object | `{}` | Global labels applied to all resources across all subcharts |
| graph-node | object | `{"enabled":true,"image":{"repository":"docker.io/graphprotocol/graph-node"},"ingress":{"annotations":{"nginx.ingress.kubernetes.io/rewrite-target":"/$1","nginx.ingress.kubernetes.io/use-regex":"true"},"className":"atk-nginx","enabled":true,"hosts":[{"host":"graph.k8s.orb.local","paths":[{"path":"/(.*)","pathType":"ImplementationSpecific"},{"path":"/ws/?(.*)","pathType":"ImplementationSpecific"},{"path":"/admin/?(.*)","pathType":"ImplementationSpecific"},{"path":"/indexer/?(.*)","pathType":"ImplementationSpecific"},{"path":"/graphman/?(.*)","pathType":"ImplementationSpecific"}]}]},"initContainer":{"image":{"repository":"docker.io/kubesphere/kubectl"},"tcpCheck":{"image":{"repository":"ghcr.io/settlemint/btp-waitforit"}}},"openShiftRoute":{"enabled":false,"host":"graph.k8s.orb.local"}}` | The Graph Node configuration for blockchain indexing |
| graph-node.enabled | bool | `true` | Enable deployment of The Graph indexing protocol |
| graph-node.image | object | `{"repository":"docker.io/graphprotocol/graph-node"}` | Graph Node container image |
| graph-node.image.repository | string | `"docker.io/graphprotocol/graph-node"` | OCI registry and repository for Graph Node |
| graph-node.ingress | object | `{"annotations":{"nginx.ingress.kubernetes.io/rewrite-target":"/$1","nginx.ingress.kubernetes.io/use-regex":"true"},"className":"atk-nginx","enabled":true,"hosts":[{"host":"graph.k8s.orb.local","paths":[{"path":"/(.*)","pathType":"ImplementationSpecific"},{"path":"/ws/?(.*)","pathType":"ImplementationSpecific"},{"path":"/admin/?(.*)","pathType":"ImplementationSpecific"},{"path":"/indexer/?(.*)","pathType":"ImplementationSpecific"},{"path":"/graphman/?(.*)","pathType":"ImplementationSpecific"}]}]}` | Ingress configuration for Graph Node API |
| graph-node.ingress.annotations | object | `{"nginx.ingress.kubernetes.io/rewrite-target":"/$1","nginx.ingress.kubernetes.io/use-regex":"true"}` | Ingress annotations for URL rewriting |
| graph-node.ingress.annotations."nginx.ingress.kubernetes.io/rewrite-target" | string | `"/$1"` | Rewrite target for path normalization |
| graph-node.ingress.annotations."nginx.ingress.kubernetes.io/use-regex" | string | `"true"` | Enable regex path matching |
| graph-node.ingress.className | string | `"atk-nginx"` | IngressClass for Graph Node |
| graph-node.ingress.enabled | bool | `true` | Enable ingress for subgraph queries |
| graph-node.ingress.hosts | list | `[{"host":"graph.k8s.orb.local","paths":[{"path":"/(.*)","pathType":"ImplementationSpecific"},{"path":"/ws/?(.*)","pathType":"ImplementationSpecific"},{"path":"/admin/?(.*)","pathType":"ImplementationSpecific"},{"path":"/indexer/?(.*)","pathType":"ImplementationSpecific"},{"path":"/graphman/?(.*)","pathType":"ImplementationSpecific"}]}]` | Ingress host rules for Graph Node endpoints |
| graph-node.ingress.hosts[0].host | string | `"graph.k8s.orb.local"` | Hostname for Graph Node. Update for your environment. |
| graph-node.ingress.hosts[0].paths | list | `[{"path":"/(.*)","pathType":"ImplementationSpecific"},{"path":"/ws/?(.*)","pathType":"ImplementationSpecific"},{"path":"/admin/?(.*)","pathType":"ImplementationSpecific"},{"path":"/indexer/?(.*)","pathType":"ImplementationSpecific"},{"path":"/graphman/?(.*)","pathType":"ImplementationSpecific"}]` | Path configurations for different Graph Node endpoints |
| graph-node.ingress.hosts[0].paths[0].path | string | `"/(.*)"` | Query endpoint path |
| graph-node.ingress.hosts[0].paths[0].pathType | string | `"ImplementationSpecific"` | Path matching type |
| graph-node.ingress.hosts[0].paths[1].path | string | `"/ws/?(.*)"` | WebSocket endpoint path |
| graph-node.ingress.hosts[0].paths[1].pathType | string | `"ImplementationSpecific"` | Path matching type |
| graph-node.ingress.hosts[0].paths[2].path | string | `"/admin/?(.*)"` | Admin API path |
| graph-node.ingress.hosts[0].paths[2].pathType | string | `"ImplementationSpecific"` | Path matching type |
| graph-node.ingress.hosts[0].paths[3].path | string | `"/indexer/?(.*)"` | Indexer status path |
| graph-node.ingress.hosts[0].paths[3].pathType | string | `"ImplementationSpecific"` | Path matching type |
| graph-node.ingress.hosts[0].paths[4].path | string | `"/graphman/?(.*)"` | Graph management path |
| graph-node.ingress.hosts[0].paths[4].pathType | string | `"ImplementationSpecific"` | Path matching type |
| graph-node.initContainer | object | `{"image":{"repository":"docker.io/kubesphere/kubectl"},"tcpCheck":{"image":{"repository":"ghcr.io/settlemint/btp-waitforit"}}}` | Init containers for Graph Node startup |
| graph-node.initContainer.image | object | `{"repository":"docker.io/kubesphere/kubectl"}` | Kubernetes client utility for pre-deployment tasks |
| graph-node.initContainer.image.repository | string | `"docker.io/kubesphere/kubectl"` | kubectl utility image repository |
| graph-node.initContainer.tcpCheck | object | `{"image":{"repository":"ghcr.io/settlemint/btp-waitforit"}}` | TCP check for dependencies |
| graph-node.initContainer.tcpCheck.image | object | `{"repository":"ghcr.io/settlemint/btp-waitforit"}` | Wait-for-it utility image |
| graph-node.initContainer.tcpCheck.image.repository | string | `"ghcr.io/settlemint/btp-waitforit"` | Repository for TCP check utility |
| graph-node.openShiftRoute | object | `{"enabled":false,"host":"graph.k8s.orb.local"}` | OpenShift Route configuration |
| graph-node.openShiftRoute.enabled | bool | `false` | Enable OpenShift route |
| graph-node.openShiftRoute.host | string | `"graph.k8s.orb.local"` | Hostname for OpenShift route |
| hasura | object | `{"enabled":true,"fullnameOverride":"hasura","image":{"pullPolicy":"IfNotPresent","registry":"docker.io","repository":"hasura/graphql-engine","tag":"v2.48.6"},"ingress":{"hostName":"hasura.k8s.orb.local"}}` | Hasura GraphQL Engine configuration |
| hasura.enabled | bool | `true` | Enable deployment of Hasura GraphQL engine |
| hasura.fullnameOverride | string | `"hasura"` | Override fullname to simplify service discovery |
| hasura.image | object | `{"pullPolicy":"IfNotPresent","registry":"docker.io","repository":"hasura/graphql-engine","tag":"v2.48.6"}` | Hasura container image configuration |
| hasura.image.pullPolicy | string | `"IfNotPresent"` | Image pull policy |
| hasura.image.registry | string | `"docker.io"` | OCI registry for Hasura image |
| hasura.image.repository | string | `"hasura/graphql-engine"` | Hasura image repository |
| hasura.image.tag | string | `"v2.48.6"` | Hasura version tag |
| hasura.ingress | object | `{"hostName":"hasura.k8s.orb.local"}` | Ingress configuration for Hasura console and API |
| hasura.ingress.hostName | string | `"hasura.k8s.orb.local"` | Hostname for Hasura GraphQL endpoint. Update for your environment. |
| network | object | `{"enabled":true,"network-bootstrapper":{"artifacts":{"predeployed":{"image":{"registry":"ghcr.io"}}},"image":{"repository":"ghcr.io/settlemint/network-bootstrapper"},"initContainer":{"tcpCheck":{"image":{"repository":"ghcr.io/settlemint/btp-waitforit"}}}},"network-nodes":{"image":{"repository":"docker.io/hyperledger/besu"},"initContainer":{"tcpCheck":{"image":{"repository":"ghcr.io/settlemint/btp-waitforit"}}},"persistence":{"size":"20Gi"}}}` | Blockchain network infrastructure configuration |
| network.enabled | bool | `true` | Enable deployment of the blockchain network (validators and RPC nodes) |
| network.network-bootstrapper | object | `{"artifacts":{"predeployed":{"image":{"registry":"ghcr.io"}}},"image":{"repository":"ghcr.io/settlemint/network-bootstrapper"},"initContainer":{"tcpCheck":{"image":{"repository":"ghcr.io/settlemint/btp-waitforit"}}}}` | Network bootstrapper job configuration for genesis and initial setup |
| network.network-bootstrapper.artifacts | object | `{"predeployed":{"image":{"registry":"ghcr.io"}}}` | Pre-deployed contract artifacts configuration |
| network.network-bootstrapper.artifacts.predeployed | object | `{"image":{"registry":"ghcr.io"}}` | Configuration for pre-deployed smart contracts in genesis |
| network.network-bootstrapper.artifacts.predeployed.image | object | `{"registry":"ghcr.io"}` | Image containing pre-deployed contract bytecode |
| network.network-bootstrapper.artifacts.predeployed.image.registry | string | `"ghcr.io"` | OCI registry for pre-deployed artifacts |
| network.network-bootstrapper.image | object | `{"repository":"ghcr.io/settlemint/network-bootstrapper"}` | Container image for the network bootstrapper job |
| network.network-bootstrapper.image.repository | string | `"ghcr.io/settlemint/network-bootstrapper"` | OCI registry and repository for network bootstrapper |
| network.network-bootstrapper.initContainer | object | `{"tcpCheck":{"image":{"repository":"ghcr.io/settlemint/btp-waitforit"}}}` | Init container configuration for dependency checking |
| network.network-bootstrapper.initContainer.tcpCheck | object | `{"image":{"repository":"ghcr.io/settlemint/btp-waitforit"}}` | TCP readiness check init container |
| network.network-bootstrapper.initContainer.tcpCheck.image | object | `{"repository":"ghcr.io/settlemint/btp-waitforit"}` | Wait-for-it utility image for TCP checks |
| network.network-bootstrapper.initContainer.tcpCheck.image.repository | string | `"ghcr.io/settlemint/btp-waitforit"` | Repository for TCP check utility |
| network.network-nodes | object | `{"image":{"repository":"docker.io/hyperledger/besu"},"initContainer":{"tcpCheck":{"image":{"repository":"ghcr.io/settlemint/btp-waitforit"}}},"persistence":{"size":"20Gi"}}` | Blockchain node configuration (validators and RPC) |
| network.network-nodes.image | object | `{"repository":"docker.io/hyperledger/besu"}` | Hyperledger Besu container image |
| network.network-nodes.image.repository | string | `"docker.io/hyperledger/besu"` | OCI registry and repository for Besu nodes |
| network.network-nodes.initContainer | object | `{"tcpCheck":{"image":{"repository":"ghcr.io/settlemint/btp-waitforit"}}}` | Init container for node startup dependencies |
| network.network-nodes.initContainer.tcpCheck | object | `{"image":{"repository":"ghcr.io/settlemint/btp-waitforit"}}` | TCP check before node starts |
| network.network-nodes.initContainer.tcpCheck.image | object | `{"repository":"ghcr.io/settlemint/btp-waitforit"}` | Wait-for-it utility image |
| network.network-nodes.initContainer.tcpCheck.image.repository | string | `"ghcr.io/settlemint/btp-waitforit"` | Repository for TCP check utility |
| network.network-nodes.persistence | object | `{"size":"20Gi"}` | Persistent storage configuration for blockchain data |
| network.network-nodes.persistence.size | string | `"20Gi"` | Storage size for each blockchain node (ledger data) |
| observability | object | `{"alloy":{"alloy":{"resources":{}},"configReloader":{"image":{"registry":"quay.io"}},"image":{"registry":"docker.io"}},"enabled":true,"grafana":{"adminPassword":"atk","adminUser":"settlemint","image":{"registry":"docker.io"},"ingress":{"hosts":["grafana.k8s.orb.local"]},"sidecar":{"image":{"registry":"docker.io"}}},"kube-state-metrics":{"image":{"registry":"registry.k8s.io"},"resources":{}},"loki":{"gateway":{"image":{"registry":"docker.io"}},"loki":{"image":{"registry":"docker.io"}},"memcached":{"enabled":true,"image":{"repository":"docker.io/memcached"}},"memcachedExporter":{"image":{"repository":"docker.io/prom/memcached-exporter"}},"sidecar":{"image":{"repository":"docker.io/kiwigrid/k8s-sidecar"}},"singleBinary":{"extraEnv":[],"persistence":{"size":"10Gi"},"resources":{}}},"metrics-server":{"enabled":true,"image":{"repository":"registry.k8s.io/metrics-server/metrics-server"},"resources":{}},"prometheus-node-exporter":{"image":{"registry":"quay.io"}},"tempo":{"server":{"resources":{}},"tempo":{"repository":"docker.io/grafana/tempo"},"tempoQuery":{"repository":"docker.io/grafana/tempo-query"}},"victoria-metrics-single":{"server":{"image":{"registry":"docker.io"},"persistentVolume":{"size":"10Gi","storageClass":""},"resources":{}}}}` | Observability stack (metrics, logging, tracing) |
| observability.alloy | object | `{"alloy":{"resources":{}},"configReloader":{"image":{"registry":"quay.io"}},"image":{"registry":"docker.io"}}` | Grafana Alloy for telemetry pipeline |
| observability.alloy.alloy | object | `{"resources":{}}` | Alloy agent configuration |
| observability.alloy.alloy.resources | object | `{}` | Resource requests and limits for Alloy |
| observability.alloy.configReloader | object | `{"image":{"registry":"quay.io"}}` | Config reloader sidecar |
| observability.alloy.configReloader.image | object | `{"registry":"quay.io"}` | Config reloader image |
| observability.alloy.configReloader.image.registry | string | `"quay.io"` | OCI registry for config reloader |
| observability.alloy.image | object | `{"registry":"docker.io"}` | Alloy container image |
| observability.alloy.image.registry | string | `"docker.io"` | OCI registry for Alloy |
| observability.enabled | bool | `true` | Enable deployment of observability infrastructure |
| observability.grafana | object | `{"adminPassword":"atk","adminUser":"settlemint","image":{"registry":"docker.io"},"ingress":{"hosts":["grafana.k8s.orb.local"]},"sidecar":{"image":{"registry":"docker.io"}}}` | Grafana visualization and dashboarding |
| observability.grafana.adminPassword | string | `"atk"` | Grafana admin password. Change for production deployments. |
| observability.grafana.adminUser | string | `"settlemint"` | Grafana admin username. Change for production deployments. |
| observability.grafana.image | object | `{"registry":"docker.io"}` | Grafana container image |
| observability.grafana.image.registry | string | `"docker.io"` | OCI registry for Grafana |
| observability.grafana.ingress | object | `{"hosts":["grafana.k8s.orb.local"]}` | Ingress configuration for Grafana UI |
| observability.grafana.ingress.hosts | list | `["grafana.k8s.orb.local"]` | Hostnames for Grafana access |
| observability.grafana.sidecar | object | `{"image":{"registry":"docker.io"}}` | Sidecar for dashboard provisioning |
| observability.grafana.sidecar.image | object | `{"registry":"docker.io"}` | Sidecar container image |
| observability.grafana.sidecar.image.registry | string | `"docker.io"` | OCI registry for sidecar |
| observability.kube-state-metrics | object | `{"image":{"registry":"registry.k8s.io"},"resources":{}}` | Kube State Metrics for cluster-level metrics |
| observability.kube-state-metrics.image | object | `{"registry":"registry.k8s.io"}` | Kube state metrics container image |
| observability.kube-state-metrics.image.registry | string | `"registry.k8s.io"` | OCI registry for kube-state-metrics |
| observability.kube-state-metrics.resources | object | `{}` | Resource requests and limits for kube-state-metrics |
| observability.loki | object | `{"gateway":{"image":{"registry":"docker.io"}},"loki":{"image":{"registry":"docker.io"}},"memcached":{"enabled":true,"image":{"repository":"docker.io/memcached"}},"memcachedExporter":{"image":{"repository":"docker.io/prom/memcached-exporter"}},"sidecar":{"image":{"repository":"docker.io/kiwigrid/k8s-sidecar"}},"singleBinary":{"extraEnv":[],"persistence":{"size":"10Gi"},"resources":{}}}` | Loki log aggregation system |
| observability.loki.gateway | object | `{"image":{"registry":"docker.io"}}` | Loki gateway for load balancing |
| observability.loki.gateway.image | object | `{"registry":"docker.io"}` | Gateway container image |
| observability.loki.gateway.image.registry | string | `"docker.io"` | OCI registry for gateway image |
| observability.loki.loki | object | `{"image":{"registry":"docker.io"}}` | Loki server configuration |
| observability.loki.loki.image | object | `{"registry":"docker.io"}` | Loki container image |
| observability.loki.loki.image.registry | string | `"docker.io"` | OCI registry for Loki |
| observability.loki.memcached | object | `{"enabled":true,"image":{"repository":"docker.io/memcached"}}` | Memcached for Loki query result caching |
| observability.loki.memcached.enabled | bool | `true` | Enable memcached deployment |
| observability.loki.memcached.image | object | `{"repository":"docker.io/memcached"}` | Memcached container image |
| observability.loki.memcached.image.repository | string | `"docker.io/memcached"` | Memcached image repository |
| observability.loki.memcachedExporter | object | `{"image":{"repository":"docker.io/prom/memcached-exporter"}}` | Memcached exporter for Prometheus metrics |
| observability.loki.memcachedExporter.image | object | `{"repository":"docker.io/prom/memcached-exporter"}` | Memcached exporter image |
| observability.loki.memcachedExporter.image.repository | string | `"docker.io/prom/memcached-exporter"` | Prometheus memcached exporter repository |
| observability.loki.sidecar | object | `{"image":{"repository":"docker.io/kiwigrid/k8s-sidecar"}}` | Kubernetes sidecar for dynamic configuration |
| observability.loki.sidecar.image | object | `{"repository":"docker.io/kiwigrid/k8s-sidecar"}` | Sidecar container image |
| observability.loki.sidecar.image.repository | string | `"docker.io/kiwigrid/k8s-sidecar"` | k8s-sidecar image repository |
| observability.loki.singleBinary | object | `{"extraEnv":[],"persistence":{"size":"10Gi"},"resources":{}}` | Loki single binary deployment mode |
| observability.loki.singleBinary.extraEnv | list | `[]` | Additional environment variables for Loki |
| observability.loki.singleBinary.persistence | object | `{"size":"10Gi"}` | Persistent storage for log data |
| observability.loki.singleBinary.persistence.size | string | `"10Gi"` | Storage size for log retention |
| observability.loki.singleBinary.resources | object | `{}` | Resource requests and limits for Loki |
| observability.metrics-server | object | `{"enabled":true,"image":{"repository":"registry.k8s.io/metrics-server/metrics-server"},"resources":{}}` | Kubernetes Metrics Server for resource metrics |
| observability.metrics-server.enabled | bool | `true` | Enable Metrics Server deployment |
| observability.metrics-server.image | object | `{"repository":"registry.k8s.io/metrics-server/metrics-server"}` | Metrics Server container image |
| observability.metrics-server.image.repository | string | `"registry.k8s.io/metrics-server/metrics-server"` | Official Kubernetes metrics-server image |
| observability.metrics-server.resources | object | `{}` | Resource requests and limits for Metrics Server |
| observability.prometheus-node-exporter | object | `{"image":{"registry":"quay.io"}}` | Prometheus Node Exporter for host metrics |
| observability.prometheus-node-exporter.image | object | `{"registry":"quay.io"}` | Node exporter container image |
| observability.prometheus-node-exporter.image.registry | string | `"quay.io"` | OCI registry for node exporter |
| observability.tempo | object | `{"server":{"resources":{}},"tempo":{"repository":"docker.io/grafana/tempo"},"tempoQuery":{"repository":"docker.io/grafana/tempo-query"}}` | Tempo distributed tracing backend |
| observability.tempo.server | object | `{"resources":{}}` | Tempo server configuration |
| observability.tempo.server.resources | object | `{}` | Resource requests and limits for Tempo |
| observability.tempo.tempo | object | `{"repository":"docker.io/grafana/tempo"}` | Tempo server image configuration |
| observability.tempo.tempo.repository | string | `"docker.io/grafana/tempo"` | Tempo image repository |
| observability.tempo.tempoQuery | object | `{"repository":"docker.io/grafana/tempo-query"}` | Tempo query frontend image |
| observability.tempo.tempoQuery.repository | string | `"docker.io/grafana/tempo-query"` | Tempo query image repository |
| observability.victoria-metrics-single | object | `{"server":{"image":{"registry":"docker.io"},"persistentVolume":{"size":"10Gi","storageClass":""},"resources":{}}}` | VictoriaMetrics time-series database for metrics storage |
| observability.victoria-metrics-single.server | object | `{"image":{"registry":"docker.io"},"persistentVolume":{"size":"10Gi","storageClass":""},"resources":{}}` | VictoriaMetrics server configuration |
| observability.victoria-metrics-single.server.image | object | `{"registry":"docker.io"}` | VictoriaMetrics container image |
| observability.victoria-metrics-single.server.image.registry | string | `"docker.io"` | OCI registry for VictoriaMetrics |
| observability.victoria-metrics-single.server.persistentVolume | object | `{"size":"10Gi","storageClass":""}` | Persistent storage for metrics data |
| observability.victoria-metrics-single.server.persistentVolume.size | string | `"10Gi"` | Storage size for metrics retention |
| observability.victoria-metrics-single.server.persistentVolume.storageClass | string | `""` | StorageClass for metrics volume (empty uses cluster default) |
| observability.victoria-metrics-single.server.resources | object | `{}` | Resource requests and limits for VictoriaMetrics |
| portal | object | `{"enabled":true,"image":{"registry":"ghcr.io"},"ingress":{"hostname":"portal.k8s.orb.local"},"initContainer":{"tcpCheck":{"image":{"repository":"ghcr.io/settlemint/btp-waitforit"}}}}` | Portal identity and access management configuration |
| portal.enabled | bool | `true` | Enable deployment of Portal IAM service |
| portal.image | object | `{"registry":"ghcr.io"}` | Portal container image |
| portal.image.registry | string | `"ghcr.io"` | OCI registry for Portal image |
| portal.ingress | object | `{"hostname":"portal.k8s.orb.local"}` | Ingress configuration for Portal API |
| portal.ingress.hostname | string | `"portal.k8s.orb.local"` | Hostname for Portal service. Update for your environment. |
| portal.initContainer | object | `{"tcpCheck":{"image":{"repository":"ghcr.io/settlemint/btp-waitforit"}}}` | Init container for dependency checks |
| portal.initContainer.tcpCheck | object | `{"image":{"repository":"ghcr.io/settlemint/btp-waitforit"}}` | TCP check for database readiness |
| portal.initContainer.tcpCheck.image | object | `{"repository":"ghcr.io/settlemint/btp-waitforit"}` | Wait-for-it utility image |
| portal.initContainer.tcpCheck.image.repository | string | `"ghcr.io/settlemint/btp-waitforit"` | Repository for TCP check utility |
| support | object | `{"enabled":true,"ingress-nginx":{"controller":{"image":{"repository":"registry.k8s.io/ingress-nginx/controller"},"resources":{}},"enabled":true,"replicaCount":1},"minio":{"enabled":true,"image":{"repository":"docker.io/minio/minio"},"ingress":{"enabled":true,"hosts":["minio.k8s.orb.local"],"ingressClassName":"atk-nginx","path":"/"},"mcImage":{"repository":"docker.io/minio/minio"}},"postgresql":{"enabled":true,"image":{"registry":"docker.io"}},"redis":{"auth":{"enabled":true,"password":"atk"},"commonLabels":{"app.kubernetes.io/managed-by":"helm","kots.io/app-slug":"settlemint-atk"},"enabled":true,"fullnameOverride":"redis","image":{"registry":"docker.io"},"persistence":{"enabled":true,"size":"1Gi"},"resources":{"limits":{"cpu":"200m","memory":"256Mi"},"requests":{"cpu":"100m","memory":"128Mi"}}},"reloader":{"enabled":true,"image":{"repository":"ghcr.io/stakater/reloader"}}}` | Support infrastructure (ingress, reloader, databases, object storage) |
| support.enabled | bool | `true` | Enable deployment of support infrastructure components |
| support.ingress-nginx | object | `{"controller":{"image":{"repository":"registry.k8s.io/ingress-nginx/controller"},"resources":{}},"enabled":true,"replicaCount":1}` | NGINX Ingress Controller configuration |
| support.ingress-nginx.controller | object | `{"image":{"repository":"registry.k8s.io/ingress-nginx/controller"},"resources":{}}` | Ingress controller configuration |
| support.ingress-nginx.controller.image | object | `{"repository":"registry.k8s.io/ingress-nginx/controller"}` | Ingress controller container image |
| support.ingress-nginx.controller.image.repository | string | `"registry.k8s.io/ingress-nginx/controller"` | Official Kubernetes ingress-nginx controller image |
| support.ingress-nginx.controller.resources | object | `{}` | Resource requests and limits for ingress controller |
| support.ingress-nginx.enabled | bool | `true` | Enable NGINX Ingress Controller deployment |
| support.ingress-nginx.replicaCount | int | `1` | Number of ingress controller replicas |
| support.minio | object | `{"enabled":true,"image":{"repository":"docker.io/minio/minio"},"ingress":{"enabled":true,"hosts":["minio.k8s.orb.local"],"ingressClassName":"atk-nginx","path":"/"},"mcImage":{"repository":"docker.io/minio/minio"}}` | MinIO object storage configuration |
| support.minio.enabled | bool | `true` | Enable MinIO object storage deployment |
| support.minio.image | object | `{"repository":"docker.io/minio/minio"}` | MinIO server container image |
| support.minio.image.repository | string | `"docker.io/minio/minio"` | MinIO server image repository |
| support.minio.ingress | object | `{"enabled":true,"hosts":["minio.k8s.orb.local"],"ingressClassName":"atk-nginx","path":"/"}` | Ingress configuration for MinIO console |
| support.minio.ingress.enabled | bool | `true` | Enable ingress for MinIO web console |
| support.minio.ingress.hosts | list | `["minio.k8s.orb.local"]` | Hostnames for MinIO access |
| support.minio.ingress.ingressClassName | string | `"atk-nginx"` | IngressClass for MinIO |
| support.minio.ingress.path | string | `"/"` | Path prefix for MinIO console |
| support.minio.mcImage | object | `{"repository":"docker.io/minio/minio"}` | MinIO client (mc) container image |
| support.minio.mcImage.repository | string | `"docker.io/minio/minio"` | MinIO client image repository |
| support.postgresql | object | `{"enabled":true,"image":{"registry":"docker.io"}}` | PostgreSQL database configuration |
| support.postgresql.enabled | bool | `true` | Enable PostgreSQL deployment |
| support.postgresql.image | object | `{"registry":"docker.io"}` | PostgreSQL container image |
| support.postgresql.image.registry | string | `"docker.io"` | OCI registry for PostgreSQL image |
| support.redis | object | `{"auth":{"enabled":true,"password":"atk"},"commonLabels":{"app.kubernetes.io/managed-by":"helm","kots.io/app-slug":"settlemint-atk"},"enabled":true,"fullnameOverride":"redis","image":{"registry":"docker.io"},"persistence":{"enabled":true,"size":"1Gi"},"resources":{"limits":{"cpu":"200m","memory":"256Mi"},"requests":{"cpu":"100m","memory":"128Mi"}}}` | Redis in-memory data store configuration |
| support.redis.auth | object | `{"enabled":true,"password":"atk"}` | Redis authentication configuration |
| support.redis.auth.enabled | bool | `true` | Enable Redis password authentication |
| support.redis.auth.password | string | `"atk"` | Redis password. Change for production deployments. |
| support.redis.commonLabels | object | `{"app.kubernetes.io/managed-by":"helm","kots.io/app-slug":"settlemint-atk"}` | Common labels applied to all Redis resources |
| support.redis.enabled | bool | `true` | Enable Redis deployment |
| support.redis.fullnameOverride | string | `"redis"` | Override fullname for simpler service discovery |
| support.redis.image | object | `{"registry":"docker.io"}` | Redis container image |
| support.redis.image.registry | string | `"docker.io"` | OCI registry for Redis image |
| support.redis.persistence | object | `{"enabled":true,"size":"1Gi"}` | Persistent storage for Redis data |
| support.redis.persistence.enabled | bool | `true` | Enable persistence for Redis AOF/RDB |
| support.redis.persistence.size | string | `"1Gi"` | Storage size for Redis data |
| support.redis.resources | object | `{"limits":{"cpu":"200m","memory":"256Mi"},"requests":{"cpu":"100m","memory":"128Mi"}}` | Resource requests and limits for Redis |
| support.redis.resources.limits | object | `{"cpu":"200m","memory":"256Mi"}` | Resource limits |
| support.redis.resources.limits.cpu | string | `"200m"` | CPU limit |
| support.redis.resources.limits.memory | string | `"256Mi"` | Memory limit |
| support.redis.resources.requests | object | `{"cpu":"100m","memory":"128Mi"}` | Resource requests |
| support.redis.resources.requests.cpu | string | `"100m"` | CPU request |
| support.redis.resources.requests.memory | string | `"128Mi"` | Memory request |
| support.reloader | object | `{"enabled":true,"image":{"repository":"ghcr.io/stakater/reloader"}}` | Stakater Reloader for automatic pod restarts on config changes |
| support.reloader.enabled | bool | `true` | Enable Reloader deployment |
| support.reloader.image | object | `{"repository":"ghcr.io/stakater/reloader"}` | Reloader container image |
| support.reloader.image.repository | string | `"ghcr.io/stakater/reloader"` | Reloader image repository |
| txsigner | object | `{"config":{"derivationPath":"m/44'/60'/0'/0/0","mnemonic":"gate yellow grunt wrestle disease obtain mixed nature mansion tape purchase awful"},"enabled":true,"image":{"registry":"ghcr.io"},"ingress":{"enabled":false,"hostname":"txsigner.k8s.orb.local"},"initContainer":{"tcpCheck":{"image":{"repository":"ghcr.io/settlemint/btp-waitforit"}}},"resources":{},"tests":{"image":{"registry":"docker.io"}}}` | Transaction Signer service configuration |
| txsigner.config | object | `{"derivationPath":"m/44'/60'/0'/0/0","mnemonic":"gate yellow grunt wrestle disease obtain mixed nature mansion tape purchase awful"}` | Transaction signer wallet configuration |
| txsigner.config.derivationPath | string | `"m/44'/60'/0'/0/0"` | BIP44 derivation path for Ethereum accounts |
| txsigner.config.mnemonic | string | `"gate yellow grunt wrestle disease obtain mixed nature mansion tape purchase awful"` | BIP39 mnemonic phrase for deterministic key generation. MUST be changed for production. |
| txsigner.enabled | bool | `true` | Enable deployment of transaction signing service |
| txsigner.image | object | `{"registry":"ghcr.io"}` | Transaction signer container image |
| txsigner.image.registry | string | `"ghcr.io"` | OCI registry for txsigner image |
| txsigner.ingress | object | `{"enabled":false,"hostname":"txsigner.k8s.orb.local"}` | Ingress configuration for transaction signer API |
| txsigner.ingress.enabled | bool | `false` | Enable ingress (typically disabled for internal-only services) |
| txsigner.ingress.hostname | string | `"txsigner.k8s.orb.local"` | Hostname for transaction signer |
| txsigner.initContainer | object | `{"tcpCheck":{"image":{"repository":"ghcr.io/settlemint/btp-waitforit"}}}` | Init container for dependency checks |
| txsigner.initContainer.tcpCheck | object | `{"image":{"repository":"ghcr.io/settlemint/btp-waitforit"}}` | TCP check for blockchain node readiness |
| txsigner.initContainer.tcpCheck.image | object | `{"repository":"ghcr.io/settlemint/btp-waitforit"}` | Wait-for-it utility image |
| txsigner.initContainer.tcpCheck.image.repository | string | `"ghcr.io/settlemint/btp-waitforit"` | Repository for TCP check utility |
| txsigner.resources | object | `{}` | Resource requests and limits for transaction signer |
| txsigner.tests | object | `{"image":{"registry":"docker.io"}}` | Test container image for health checks |
| txsigner.tests.image | object | `{"registry":"docker.io"}` | Test image configuration |
| txsigner.tests.image.registry | string | `"docker.io"` | OCI registry for test utilities |

## Maintainers

| Name | Email | Url |
| ---- | ------ | --- |
| SettleMint | <support@settlemint.com> | <https://settlemint.com> |

## Requirements

| Repository | Name | Version |
|------------|------|---------|
|  | blockscout | 2.0.0-alpha.15 |
|  | dapp | 2.0.0-alpha.15 |
|  | erpc | 2.0.0-alpha.15 |
|  | graph-node | 2.0.0-alpha.15 |
|  | hasura | 2.0.0-alpha.15 |
|  | network | 2.0.0-alpha.15 |
|  | observability | 2.0.0-alpha.15 |
|  | portal | 2.0.0-alpha.15 |
|  | support | 2.0.0-alpha.15 |
|  | txsigner | 2.0.0-alpha.15 |

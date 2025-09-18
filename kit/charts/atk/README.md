# atk

![Version: 2.0.0](https://img.shields.io/badge/Version-2.0.0-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: 2.0.0](https://img.shields.io/badge/AppVersion-2.0.0-informational?style=flat-square)

A Helm chart for the SettleMint Asset Tokenization Kit

## Connection Overview

Collect the following connection parameters before deploying or overriding values. Update the listed
keys in `values.yaml` (or your environment-specific values file) to point services at your
environment.

### PostgreSQL Targets

| Service | Values path | Default host | Default port | Default database | Default username | Default password | Default SSL mode |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Blockscout | `blockscout.postgresql` | `postgresql` | `5432` | `blockscout` | `blockscout` | `atk` | `disable` |
| Graph Node | `graph-node.postgresql` | `postgresql` | `5432` | `thegraph` | `thegraph` | `atk` | `disable` |
| Hasura | `hasura.postgresql` | `postgresql` | `5432` | `hasura` | `hasura` | `atk` | `disable` |
| Portal | `portal.config.postgresqlConnection` | `postgresql` | `5432` | `portal` | `portal` | `atk` | `disable` |
| TxSigner | `txsigner.postgresqlConnection` | `postgresql` | `5432` | `txsigner` | `txsigner` | `atk` | `disable` |

### Redis Targets

| Service | Values path | Default host | Default port | Default database | Default username | Default password |
| --- | --- | --- | --- | --- | --- | --- |
| eRPC Cache | `erpc.redis.cacheDb` | `redis` | `6379` | `0` | `default` | `atk` |
| eRPC Shared State | `erpc.redis.sharedStateDb` | `redis` | `6379` | `1` | `default` | `atk` |
| Hasura Cache | `hasura.redis.primary` | `redis` | `6379` | `2` | `default` | `atk` |
| Hasura Rate Limit | `hasura.redis.rateLimit` | `redis` | `6379` | `3` | `default` | `atk` |
| Portal | `portal.config.redis` | `redis` | `6379` | `4` | `default` | `atk` |

Each service uses its own logical database to avoid key collisions. When pointing to an external
Redis or PostgreSQL deployment, update the appropriate values paths listed above.

## Configuration

The following table lists the configurable parameters of this chart and their default values.

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| blockscout.blockscout.containerSecurityContext.allowPrivilegeEscalation | bool | `false` |  |
| blockscout.blockscout.containerSecurityContext.capabilities.drop[0] | string | `"ALL"` |  |
| blockscout.blockscout.containerSecurityContext.readOnlyRootFilesystem | bool | `false` |  |
| blockscout.blockscout.containerSecurityContext.runAsGroup | int | `1001` |  |
| blockscout.blockscout.containerSecurityContext.runAsNonRoot | bool | `true` |  |
| blockscout.blockscout.containerSecurityContext.runAsUser | int | `1001` |  |
| blockscout.blockscout.env.API_URL | string | `"https://explorer.k8s.orb.local"` |  |
| blockscout.blockscout.env.DATABASE_URL | string | `"postgresql://blockscout:atk@postgresql:5432/blockscout?sslmode=disable"` |  |
| blockscout.blockscout.env.ETHEREUM_JSONRPC_HTTP_URL | string | `"http://erpc:4000/settlemint/evm/53771311147"` |  |
| blockscout.blockscout.env.ETHEREUM_JSONRPC_TRACE_URL | string | `"http://erpc:4000/settlemint/evm/53771311147"` |  |
| blockscout.blockscout.env.WEBAPP_URL | string | `"https://explorer.k8s.orb.local"` |  |
| blockscout.blockscout.image.pullPolicy | string | `"IfNotPresent"` |  |
| blockscout.blockscout.image.repository | string | `"ghcr.io/blockscout/blockscout"` |  |
| blockscout.blockscout.image.tag | string | `"9.0.2"` |  |
| blockscout.blockscout.ingress.className | string | `"atk-nginx"` |  |
| blockscout.blockscout.ingress.enabled | bool | `true` |  |
| blockscout.blockscout.ingress.hostname | string | `"explorer.k8s.orb.local"` |  |
| blockscout.blockscout.init.args[0] | string | `"-c"` |  |
| blockscout.blockscout.init.args[1] | string | `"echo \"Waiting for postgresql:5432...\"\nwhile ! nc -z postgresql 5432; do\n  sleep 2;\ndone;\necho \"PostgreSQL is ready!\"\n# Original command:\nbin/blockscout eval \"Elixir.Explorer.ReleaseTasks.create_and_migrate()\"\n"` |  |
| blockscout.blockscout.init.command[0] | string | `"/bin/sh"` |  |
| blockscout.blockscout.init.enabled | bool | `true` |  |
| blockscout.blockscout.initContainerSecurityContext.allowPrivilegeEscalation | bool | `false` |  |
| blockscout.blockscout.initContainerSecurityContext.capabilities.drop[0] | string | `"ALL"` |  |
| blockscout.blockscout.initContainerSecurityContext.readOnlyRootFilesystem | bool | `false` |  |
| blockscout.blockscout.initContainerSecurityContext.runAsGroup | int | `1001` |  |
| blockscout.blockscout.initContainerSecurityContext.runAsNonRoot | bool | `true` |  |
| blockscout.blockscout.initContainerSecurityContext.runAsUser | int | `1001` |  |
| blockscout.blockscout.podSecurityContext.fsGroup | int | `1001` |  |
| blockscout.blockscout.podSecurityContext.runAsGroup | int | `1001` |  |
| blockscout.blockscout.podSecurityContext.runAsNonRoot | bool | `true` |  |
| blockscout.blockscout.podSecurityContext.runAsUser | int | `1001` |  |
| blockscout.blockscout.resources | object | `{}` |  |
| blockscout.enabled | bool | `true` |  |
| blockscout.frontend.containerSecurityContext.allowPrivilegeEscalation | bool | `false` |  |
| blockscout.frontend.containerSecurityContext.capabilities.drop[0] | string | `"ALL"` |  |
| blockscout.frontend.containerSecurityContext.readOnlyRootFilesystem | bool | `false` |  |
| blockscout.frontend.containerSecurityContext.runAsGroup | int | `1001` |  |
| blockscout.frontend.containerSecurityContext.runAsNonRoot | bool | `true` |  |
| blockscout.frontend.containerSecurityContext.runAsUser | int | `1001` |  |
| blockscout.frontend.enabled | bool | `true` |  |
| blockscout.frontend.image.pullPolicy | string | `"IfNotPresent"` |  |
| blockscout.frontend.image.repository | string | `"ghcr.io/blockscout/frontend"` |  |
| blockscout.frontend.image.tag | string | `"v2.3.3"` |  |
| blockscout.frontend.ingress.className | string | `"atk-nginx"` |  |
| blockscout.frontend.ingress.enabled | bool | `true` |  |
| blockscout.frontend.ingress.hostname | string | `"explorer.k8s.orb.local"` |  |
| blockscout.frontend.podSecurityContext.fsGroup | int | `1001` |  |
| blockscout.frontend.podSecurityContext.runAsGroup | int | `1001` |  |
| blockscout.frontend.podSecurityContext.runAsNonRoot | bool | `true` |  |
| blockscout.frontend.podSecurityContext.runAsUser | int | `1001` |  |
| blockscout.fullnameOverride | string | `"blockscout"` |  |
| blockscout.podAnnotations."prometheus.io/path" | string | `"/metrics"` |  |
| blockscout.podAnnotations."prometheus.io/port" | string | `"4000"` |  |
| blockscout.podAnnotations."prometheus.io/scrape" | string | `"true"` |  |
| blockscout.postgresql.database | string | `"blockscout"` |  |
| blockscout.postgresql.endpoint | string | `"postgresql:5432"` |  |
| blockscout.postgresql.host | string | `"postgresql"` |  |
| blockscout.postgresql.password | string | `"atk"` |  |
| blockscout.postgresql.port | int | `5432` |  |
| blockscout.postgresql.sslMode | string | `"disable"` |  |
| blockscout.postgresql.url | string | `"postgresql://blockscout:atk@postgresql:5432/blockscout?sslmode=disable"` |  |
| blockscout.postgresql.username | string | `"blockscout"` |  |
| dapp.enabled | bool | `true` |  |
| dapp.image.pullPolicy | string | `"IfNotPresent"` |  |
| dapp.image.repository | string | `"ghcr.io/settlemint/asset-tokenization-kit"` |  |
| dapp.image.tag | string | `"2.0.0-main1e32acb7f"` |  |
| dapp.ingress.enabled | bool | `true` |  |
| dapp.ingress.hosts[0].host | string | `"dapp.k8s.orb.local"` |  |
| dapp.ingress.hosts[0].paths[0].path | string | `"/"` |  |
| dapp.ingress.hosts[0].paths[0].pathType | string | `"ImplementationSpecific"` |  |
| dapp.initContainer.graphQLCheck.connectTimeoutSeconds | int | `5` |  |
| dapp.initContainer.graphQLCheck.enabled | bool | `true` |  |
| dapp.initContainer.graphQLCheck.image.pullPolicy | string | `"IfNotPresent"` |  |
| dapp.initContainer.graphQLCheck.image.registry | string | `"docker.io"` |  |
| dapp.initContainer.graphQLCheck.image.repository | string | `"curlimages/curl"` |  |
| dapp.initContainer.graphQLCheck.image.tag | string | `"8.16.0"` |  |
| dapp.initContainer.graphQLCheck.name | string | `"wait-for-graph-subgraph-kit"` |  |
| dapp.initContainer.graphQLCheck.query | string | `"{ __typename }"` |  |
| dapp.initContainer.graphQLCheck.resources.limits.memory | string | `"64Mi"` |  |
| dapp.initContainer.graphQLCheck.resources.requests.cpu | string | `"10m"` |  |
| dapp.initContainer.graphQLCheck.resources.requests.memory | string | `"12Mi"` |  |
| dapp.initContainer.graphQLCheck.retries | int | `24` |  |
| dapp.initContainer.graphQLCheck.retryDelaySeconds | int | `20` |  |
| dapp.initContainer.graphQLCheck.timeoutSeconds | int | `10` |  |
| dapp.initContainer.graphQLCheck.url | string | `"http://graph-node-combined:8000/subgraphs/name/kit"` |  |
| dapp.initContainer.tcpCheck.dependencies[0].endpoint | string | `"postgresql:5432"` |  |
| dapp.initContainer.tcpCheck.dependencies[0].name | string | `"postgres"` |  |
| dapp.initContainer.tcpCheck.dependencies[1].endpoint | string | `"hasura:8080"` |  |
| dapp.initContainer.tcpCheck.dependencies[1].name | string | `"hasura"` |  |
| dapp.initContainer.tcpCheck.dependencies[2].endpoint | string | `"portal:3001"` |  |
| dapp.initContainer.tcpCheck.dependencies[2].name | string | `"portal"` |  |
| dapp.initContainer.tcpCheck.dependencies[3].endpoint | string | `"graph-node-combined:8020"` |  |
| dapp.initContainer.tcpCheck.dependencies[3].name | string | `"graph-node-tcp"` |  |
| dapp.initContainer.tcpCheck.dependencies[4].endpoint | string | `"blockscout-frontend:80"` |  |
| dapp.initContainer.tcpCheck.dependencies[4].name | string | `"blockscout"` |  |
| dapp.initContainer.tcpCheck.enabled | bool | `true` |  |
| dapp.initContainer.tcpCheck.image.pullPolicy | string | `"IfNotPresent"` |  |
| dapp.initContainer.tcpCheck.image.repository | string | `"ghcr.io/settlemint/btp-waitforit"` |  |
| dapp.initContainer.tcpCheck.image.tag | string | `"v7.7.10"` |  |
| dapp.initContainer.tcpCheck.resources.limits.cpu | string | `"100m"` |  |
| dapp.initContainer.tcpCheck.resources.limits.memory | string | `"64Mi"` |  |
| dapp.initContainer.tcpCheck.resources.requests.cpu | string | `"10m"` |  |
| dapp.initContainer.tcpCheck.resources.requests.memory | string | `"32Mi"` |  |
| dapp.initContainer.tcpCheck.timeout | int | `120` |  |
| dapp.podLabels."app.kubernetes.io/component" | string | `"dapp"` |  |
| dapp.podLabels."kots.io/app-slug" | string | `"settlemint-atk"` |  |
| dapp.replicaCount | int | `1` |  |
| dapp.resources | object | `{}` |  |
| dapp.secretEnv.BETTER_AUTH_URL | string | `"https://dapp.k8s.orb.local"` |  |
| dapp.secretEnv.NEXTAUTH_URL | string | `"https://dapp.k8s.orb.local"` |  |
| dapp.secretEnv.NEXT_PUBLIC_APP_ID | string | `"dapp"` |  |
| dapp.secretEnv.OTEL_EXPORTER_OTLP_ENDPOINT | string | `"http://alloy:4318/v1/traces"` |  |
| dapp.secretEnv.OTEL_EXPORTER_OTLP_PROTOCOL | string | `"http"` |  |
| dapp.secretEnv.SETTLEMINT_BLOCKSCOUT_UI_ENDPOINT | string | `"http://blockscout-frontend-svc/"` |  |
| dapp.secretEnv.SETTLEMINT_HASURA_ADMIN_SECRET | string | `"atk"` |  |
| dapp.secretEnv.SETTLEMINT_HASURA_DATABASE_URL | string | `"postgresql://hasura:atk@postgresql:5432/hasura?sslmode=disable"` |  |
| dapp.secretEnv.SETTLEMINT_HASURA_ENDPOINT | string | `"http://hasura:8080/v1/graphql"` |  |
| dapp.secretEnv.SETTLEMINT_HD_PRIVATE_KEY | string | `"atk-hd-private-key"` |  |
| dapp.secretEnv.SETTLEMINT_INSTANCE | string | `"standalone"` |  |
| dapp.secretEnv.SETTLEMINT_PORTAL_GRAPHQL_ENDPOINT | string | `"http://portal:3001/graphql"` |  |
| dapp.secretEnv.SETTLEMINT_THEGRAPH_SUBGRAPHS_ENDPOINTS | string | `"[\"http://graph-node-combined:8000/subgraphs/name/kit\"]"` |  |
| erpc.config.logLevel | string | `"info"` |  |
| erpc.config.projects[0].id | string | `"settlemint"` |  |
| erpc.config.projects[0].networks[0].architecture | string | `"evm"` |  |
| erpc.config.projects[0].networks[0].directiveDefaults.retryEmpty | bool | `true` |  |
| erpc.config.projects[0].networks[0].evm.chainId | int | `53771311147` |  |
| erpc.config.projects[0].networks[0].evm.integrity.enforceGetLogsBlockRange | bool | `true` |  |
| erpc.config.projects[0].networks[0].evm.integrity.enforceHighestBlock | bool | `true` |  |
| erpc.config.projects[0].networks[0].failsafe[0].hedge.maxCount | int | `1` |  |
| erpc.config.projects[0].networks[0].failsafe[0].hedge.maxDelay | string | `"4s"` |  |
| erpc.config.projects[0].networks[0].failsafe[0].hedge.minDelay | string | `"200ms"` |  |
| erpc.config.projects[0].networks[0].failsafe[0].hedge.quantile | float | `0.9` |  |
| erpc.config.projects[0].networks[0].failsafe[0].matchMethod | string | `"eth_getLogs"` |  |
| erpc.config.projects[0].networks[0].failsafe[0].retry.backoffFactor | int | `2` |  |
| erpc.config.projects[0].networks[0].failsafe[0].retry.backoffMaxDelay | string | `"10s"` |  |
| erpc.config.projects[0].networks[0].failsafe[0].retry.delay | string | `"500ms"` |  |
| erpc.config.projects[0].networks[0].failsafe[0].retry.jitter | string | `"300ms"` |  |
| erpc.config.projects[0].networks[0].failsafe[0].retry.maxAttempts | int | `3` |  |
| erpc.config.projects[0].networks[0].failsafe[0].timeout.duration | string | `"45s"` |  |
| erpc.config.projects[0].networks[0].failsafe[1].matchMethod | string | `"trace_*|debug_*|arbtrace_*"` |  |
| erpc.config.projects[0].networks[0].failsafe[1].retry.maxAttempts | int | `1` |  |
| erpc.config.projects[0].networks[0].failsafe[1].timeout.duration | string | `"90s"` |  |
| erpc.config.projects[0].networks[0].failsafe[2].matchMethod | string | `"eth_getBlock*|eth_getTransaction*"` |  |
| erpc.config.projects[0].networks[0].failsafe[2].retry.backoffFactor | float | `1.5` |  |
| erpc.config.projects[0].networks[0].failsafe[2].retry.backoffMaxDelay | string | `"3s"` |  |
| erpc.config.projects[0].networks[0].failsafe[2].retry.delay | string | `"200ms"` |  |
| erpc.config.projects[0].networks[0].failsafe[2].retry.jitter | string | `"150ms"` |  |
| erpc.config.projects[0].networks[0].failsafe[2].retry.maxAttempts | int | `2` |  |
| erpc.config.projects[0].networks[0].failsafe[2].timeout.duration | string | `"6s"` |  |
| erpc.config.projects[0].networks[0].failsafe[3].hedge.delay | string | `"250ms"` |  |
| erpc.config.projects[0].networks[0].failsafe[3].hedge.maxCount | int | `1` |  |
| erpc.config.projects[0].networks[0].failsafe[3].matchFinality[0] | string | `"unfinalized"` |  |
| erpc.config.projects[0].networks[0].failsafe[3].matchFinality[1] | string | `"realtime"` |  |
| erpc.config.projects[0].networks[0].failsafe[3].matchMethod | string | `"*"` |  |
| erpc.config.projects[0].networks[0].failsafe[3].retry.delay | string | `"150ms"` |  |
| erpc.config.projects[0].networks[0].failsafe[3].retry.jitter | string | `"150ms"` |  |
| erpc.config.projects[0].networks[0].failsafe[3].retry.maxAttempts | int | `2` |  |
| erpc.config.projects[0].networks[0].failsafe[3].timeout.duration | string | `"4s"` |  |
| erpc.config.projects[0].networks[0].failsafe[4].matchFinality[0] | string | `"finalized"` |  |
| erpc.config.projects[0].networks[0].failsafe[4].matchMethod | string | `"*"` |  |
| erpc.config.projects[0].networks[0].failsafe[4].retry.backoffFactor | float | `1.8` |  |
| erpc.config.projects[0].networks[0].failsafe[4].retry.backoffMaxDelay | string | `"8s"` |  |
| erpc.config.projects[0].networks[0].failsafe[4].retry.delay | string | `"400ms"` |  |
| erpc.config.projects[0].networks[0].failsafe[4].retry.jitter | string | `"250ms"` |  |
| erpc.config.projects[0].networks[0].failsafe[4].retry.maxAttempts | int | `4` |  |
| erpc.config.projects[0].networks[0].failsafe[4].timeout.duration | string | `"20s"` |  |
| erpc.config.projects[0].networks[0].failsafe[5].hedge.maxCount | int | `2` |  |
| erpc.config.projects[0].networks[0].failsafe[5].hedge.maxDelay | string | `"2s"` |  |
| erpc.config.projects[0].networks[0].failsafe[5].hedge.minDelay | string | `"120ms"` |  |
| erpc.config.projects[0].networks[0].failsafe[5].hedge.quantile | float | `0.95` |  |
| erpc.config.projects[0].networks[0].failsafe[5].matchMethod | string | `"*"` |  |
| erpc.config.projects[0].networks[0].failsafe[5].retry.backoffFactor | float | `1.4` |  |
| erpc.config.projects[0].networks[0].failsafe[5].retry.backoffMaxDelay | string | `"5s"` |  |
| erpc.config.projects[0].networks[0].failsafe[5].retry.delay | string | `"300ms"` |  |
| erpc.config.projects[0].networks[0].failsafe[5].retry.jitter | string | `"200ms"` |  |
| erpc.config.projects[0].networks[0].failsafe[5].retry.maxAttempts | int | `3` |  |
| erpc.config.projects[0].networks[0].failsafe[5].timeout.duration | string | `"12s"` |  |
| erpc.config.projects[0].upstreams[0].endpoint | string | `"http://besu-node-rpc-0.besu-node-rpc:8545"` |  |
| erpc.config.projects[0].upstreams[0].evm.chainId | int | `53771311147` |  |
| erpc.config.projects[0].upstreams[0].failsafe[0].circuitBreaker.failureThresholdCapacity | int | `80` |  |
| erpc.config.projects[0].upstreams[0].failsafe[0].circuitBreaker.failureThresholdCount | int | `40` |  |
| erpc.config.projects[0].upstreams[0].failsafe[0].circuitBreaker.halfOpenAfter | string | `"120s"` |  |
| erpc.config.projects[0].upstreams[0].failsafe[0].circuitBreaker.successThresholdCapacity | int | `10` |  |
| erpc.config.projects[0].upstreams[0].failsafe[0].circuitBreaker.successThresholdCount | int | `3` |  |
| erpc.config.projects[0].upstreams[0].failsafe[0].matchMethod | string | `"*"` |  |
| erpc.config.projects[0].upstreams[0].id | string | `"besu-node-rpc-0"` |  |
| erpc.config.projects[0].upstreams[1].endpoint | string | `"http://besu-node-rpc-1.besu-node-rpc:8545"` |  |
| erpc.config.projects[0].upstreams[1].evm.chainId | int | `53771311147` |  |
| erpc.config.projects[0].upstreams[1].failsafe[0].circuitBreaker.failureThresholdCapacity | int | `80` |  |
| erpc.config.projects[0].upstreams[1].failsafe[0].circuitBreaker.failureThresholdCount | int | `40` |  |
| erpc.config.projects[0].upstreams[1].failsafe[0].circuitBreaker.halfOpenAfter | string | `"120s"` |  |
| erpc.config.projects[0].upstreams[1].failsafe[0].circuitBreaker.successThresholdCapacity | int | `10` |  |
| erpc.config.projects[0].upstreams[1].failsafe[0].circuitBreaker.successThresholdCount | int | `3` |  |
| erpc.config.projects[0].upstreams[1].failsafe[0].matchMethod | string | `"*"` |  |
| erpc.config.projects[0].upstreams[1].id | string | `"besu-node-rpc-1"` |  |
| erpc.config.server.httpHostV4 | string | `"0.0.0.0"` |  |
| erpc.config.server.httpPort | int | `4000` |  |
| erpc.containerSecurityContext.allowPrivilegeEscalation | bool | `false` |  |
| erpc.containerSecurityContext.capabilities.drop[0] | string | `"ALL"` |  |
| erpc.containerSecurityContext.runAsGroup | int | `1000` |  |
| erpc.containerSecurityContext.runAsNonRoot | bool | `true` |  |
| erpc.containerSecurityContext.runAsUser | int | `1000` |  |
| erpc.containerSecurityContext.seccompProfile.type | string | `"RuntimeDefault"` |  |
| erpc.enabled | bool | `true` |  |
| erpc.image.pullPolicy | string | `"IfNotPresent"` |  |
| erpc.image.registry | string | `"ghcr.io"` |  |
| erpc.image.repository | string | `"erpc/erpc"` |  |
| erpc.image.tag | string | `"0.0.56"` |  |
| erpc.ingress.className | string | `"atk-nginx"` |  |
| erpc.ingress.enabled | bool | `true` |  |
| erpc.ingress.hosts[0].host | string | `"rpc.k8s.orb.local"` |  |
| erpc.ingress.hosts[0].paths[0].path | string | `"/"` |  |
| erpc.ingress.hosts[0].paths[0].pathType | string | `"ImplementationSpecific"` |  |
| erpc.initContainerSecurityContext.allowPrivilegeEscalation | bool | `false` |  |
| erpc.initContainerSecurityContext.capabilities.drop[0] | string | `"ALL"` |  |
| erpc.initContainerSecurityContext.runAsGroup | int | `1001` |  |
| erpc.initContainerSecurityContext.runAsNonRoot | bool | `true` |  |
| erpc.initContainerSecurityContext.runAsUser | int | `1001` |  |
| erpc.initContainerSecurityContext.seccompProfile.type | string | `"RuntimeDefault"` |  |
| erpc.initContainers.waitforit.image.pullPolicy | string | `"IfNotPresent"` |  |
| erpc.initContainers.waitforit.image.repository | string | `"ghcr.io/settlemint/btp-waitforit"` |  |
| erpc.initContainers.waitforit.image.tag | string | `"v7.7.10"` |  |
| erpc.podAnnotations."prometheus.io/port" | string | `"4001"` |  |
| erpc.podAnnotations."prometheus.io/scrape" | string | `"true"` |  |
| erpc.podLabels."app.kubernetes.io/component" | string | `"erpc"` |  |
| erpc.podSecurityContext.fsGroup | int | `1000` |  |
| erpc.podSecurityContext.runAsNonRoot | bool | `true` |  |
| erpc.podSecurityContext.seccompProfile.type | string | `"RuntimeDefault"` |  |
| erpc.redis.cacheDb | int | `0` |  |
| erpc.redis.cacheQuery | string | `"dial_timeout=5s&read_timeout=2s&write_timeout=2s&pool_size=50"` |  |
| erpc.redis.host | string | `"redis"` |  |
| erpc.redis.password | string | `"atk"` |  |
| erpc.redis.port | int | `6379` |  |
| erpc.redis.sharedStateDb | int | `1` |  |
| erpc.redis.sharedStateQuery | string | `"dial_timeout=5s&read_timeout=2s&write_timeout=2s&pool_size=20"` |  |
| erpc.redis.username | string | `"default"` |  |
| erpc.resources | object | `{}` |  |
| erpc.test.image.pullPolicy | string | `"IfNotPresent"` |  |
| erpc.test.image.repository | string | `"docker.io/busybox"` |  |
| erpc.test.image.tag | string | `"1.37"` |  |
| global.artifacts.image.pullPolicy | string | `"IfNotPresent"` |  |
| global.artifacts.image.registry | string | `"ghcr.io"` |  |
| global.artifacts.image.repository | string | `"settlemint/asset-tokenization-kit-artifacts"` |  |
| global.artifacts.image.tag | string | `"2.0.0-main.91391"` |  |
| global.labels."kots.io/app-slug" | string | `"settlemint-atk"` |  |
| global.networkPolicy.enabled | bool | `false` |  |
| graph-node.containerSecurityContext.allowPrivilegeEscalation | bool | `false` |  |
| graph-node.containerSecurityContext.capabilities.drop[0] | string | `"ALL"` |  |
| graph-node.containerSecurityContext.runAsGroup | int | `1000` |  |
| graph-node.containerSecurityContext.runAsNonRoot | bool | `true` |  |
| graph-node.containerSecurityContext.runAsUser | int | `1000` |  |
| graph-node.containerSecurityContext.seccompProfile.type | string | `"RuntimeDefault"` |  |
| graph-node.enabled | bool | `true` |  |
| graph-node.env.PRIMARY_SUBGRAPH_DATA_PGDATABASE | string | `"thegraph"` |  |
| graph-node.env.PRIMARY_SUBGRAPH_DATA_PGHOST | string | `"postgresql"` |  |
| graph-node.env.PRIMARY_SUBGRAPH_DATA_PGPASSWORD | string | `"atk"` |  |
| graph-node.env.PRIMARY_SUBGRAPH_DATA_PGPORT | int | `5432` |  |
| graph-node.env.PRIMARY_SUBGRAPH_DATA_PGUSER | string | `"thegraph"` |  |
| graph-node.image.pullPolicy | string | `"IfNotPresent"` |  |
| graph-node.image.repository | string | `"docker.io/graphprotocol/graph-node"` |  |
| graph-node.image.tag | string | `"v0.40.2"` |  |
| graph-node.ingress.annotations."nginx.ingress.kubernetes.io/rewrite-target" | string | `"/$1"` |  |
| graph-node.ingress.annotations."nginx.ingress.kubernetes.io/use-regex" | string | `"true"` |  |
| graph-node.ingress.className | string | `"atk-nginx"` |  |
| graph-node.ingress.enabled | bool | `true` |  |
| graph-node.ingress.hosts[0].host | string | `"graph.k8s.orb.local"` |  |
| graph-node.ingress.hosts[0].paths[0].path | string | `"/(.*)"` |  |
| graph-node.ingress.hosts[0].paths[0].pathType | string | `"ImplementationSpecific"` |  |
| graph-node.ingress.hosts[0].paths[1].path | string | `"/ws/?(.*)"` |  |
| graph-node.ingress.hosts[0].paths[1].pathType | string | `"ImplementationSpecific"` |  |
| graph-node.ingress.hosts[0].paths[2].path | string | `"/admin/?(.*)"` |  |
| graph-node.ingress.hosts[0].paths[2].pathType | string | `"ImplementationSpecific"` |  |
| graph-node.ingress.hosts[0].paths[3].path | string | `"/indexer/?(.*)"` |  |
| graph-node.ingress.hosts[0].paths[3].pathType | string | `"ImplementationSpecific"` |  |
| graph-node.ingress.hosts[0].paths[4].path | string | `"/graphman/?(.*)"` |  |
| graph-node.ingress.hosts[0].paths[4].pathType | string | `"ImplementationSpecific"` |  |
| graph-node.ingress.tls | list | `[]` |  |
| graph-node.initContainer.image.pullPolicy | string | `"IfNotPresent"` |  |
| graph-node.initContainer.image.repository | string | `"docker.io/kubesphere/kubectl"` |  |
| graph-node.initContainer.image.tag | string | `"v1.33.4"` |  |
| graph-node.initContainer.tcpCheck.dependencies[0].endpoint | string | `"postgresql:5432"` |  |
| graph-node.initContainer.tcpCheck.dependencies[0].name | string | `"postgresql"` |  |
| graph-node.initContainer.tcpCheck.enabled | bool | `true` |  |
| graph-node.initContainer.tcpCheck.image.pullPolicy | string | `"IfNotPresent"` |  |
| graph-node.initContainer.tcpCheck.image.repository | string | `"ghcr.io/settlemint/btp-waitforit"` |  |
| graph-node.initContainer.tcpCheck.image.tag | string | `"v7.7.10"` |  |
| graph-node.initContainer.tcpCheck.resources.limits.cpu | string | `"100m"` |  |
| graph-node.initContainer.tcpCheck.resources.limits.memory | string | `"64Mi"` |  |
| graph-node.initContainer.tcpCheck.resources.requests.cpu | string | `"10m"` |  |
| graph-node.initContainer.tcpCheck.resources.requests.memory | string | `"32Mi"` |  |
| graph-node.initContainer.tcpCheck.timeout | int | `120` |  |
| graph-node.initContainerSecurityContext.allowPrivilegeEscalation | bool | `false` |  |
| graph-node.initContainerSecurityContext.capabilities.drop[0] | string | `"ALL"` |  |
| graph-node.initContainerSecurityContext.runAsGroup | int | `1001` |  |
| graph-node.initContainerSecurityContext.runAsNonRoot | bool | `true` |  |
| graph-node.initContainerSecurityContext.runAsUser | int | `1001` |  |
| graph-node.initContainerSecurityContext.seccompProfile.type | string | `"RuntimeDefault"` |  |
| graph-node.podAnnotations."prometheus.io/path" | string | `"/metrics"` |  |
| graph-node.podAnnotations."prometheus.io/port" | string | `"8040"` |  |
| graph-node.podAnnotations."prometheus.io/scrape" | string | `"true"` |  |
| graph-node.podSecurityContext.fsGroup | int | `1000` |  |
| graph-node.podSecurityContext.runAsNonRoot | bool | `true` |  |
| graph-node.podSecurityContext.seccompProfile.type | string | `"RuntimeDefault"` |  |
| graph-node.postgresReadinessCheck.enabled | bool | `true` |  |
| graph-node.postgresReadinessCheck.image | string | `"docker.io/postgres:17.6-alpine"` |  |
| graph-node.postgresReadinessCheck.initialWaitTime | int | `2` |  |
| graph-node.postgresReadinessCheck.maxRetries | int | `30` |  |
| graph-node.postgresReadinessCheck.maxWaitTime | int | `30` |  |
| graph-node.postgresReadinessCheck.randomDelayRange.max | int | `30` |  |
| graph-node.postgresReadinessCheck.randomDelayRange.min | int | `5` |  |
| graph-node.postgresReadinessCheck.resources.limits.cpu | string | `"100m"` |  |
| graph-node.postgresReadinessCheck.resources.limits.memory | string | `"96Mi"` |  |
| graph-node.postgresReadinessCheck.resources.requests.cpu | string | `"25m"` |  |
| graph-node.postgresReadinessCheck.resources.requests.memory | string | `"48Mi"` |  |
| graph-node.postgresql.database | string | `"thegraph"` |  |
| graph-node.postgresql.endpoint | string | `"postgresql:5432"` |  |
| graph-node.postgresql.host | string | `"postgresql"` |  |
| graph-node.postgresql.password | string | `"atk"` |  |
| graph-node.postgresql.port | int | `5432` |  |
| graph-node.postgresql.url | string | `"postgresql://thegraph:atk@postgresql:5432/thegraph?sslmode=disable"` |  |
| graph-node.postgresql.username | string | `"thegraph"` |  |
| hasura.enabled | bool | `true` |  |
| hasura.graphql-engine.image.pullPolicy | string | `"IfNotPresent"` |  |
| hasura.graphql-engine.image.repository | string | `"docker.io/hasura/graphql-engine"` |  |
| hasura.graphql-engine.image.tag | string | `"v2.48.5"` |  |
| hasura.graphql-engine.ingress.hostName | string | `"hasura.k8s.orb.local"` |  |
| hasura.graphql-engine.initContainers[0].command[0] | string | `"/usr/bin/wait-for-it"` |  |
| hasura.graphql-engine.initContainers[0].command[1] | string | `"postgresql:5432"` |  |
| hasura.graphql-engine.initContainers[0].command[2] | string | `"-t"` |  |
| hasura.graphql-engine.initContainers[0].command[3] | string | `"120"` |  |
| hasura.graphql-engine.initContainers[0].image | string | `"ghcr.io/settlemint/btp-waitforit:v7.7.10"` |  |
| hasura.graphql-engine.initContainers[0].imagePullPolicy | string | `"IfNotPresent"` |  |
| hasura.graphql-engine.initContainers[0].name | string | `"wait-for-postgresql"` |  |
| hasura.graphql-engine.initContainers[0].resources.limits.cpu | string | `"100m"` |  |
| hasura.graphql-engine.initContainers[0].resources.limits.memory | string | `"64Mi"` |  |
| hasura.graphql-engine.initContainers[0].resources.requests.cpu | string | `"10m"` |  |
| hasura.graphql-engine.initContainers[0].resources.requests.memory | string | `"32Mi"` |  |
| hasura.graphql-engine.labels."app.kubernetes.io/component" | string | `"hasura"` |  |
| hasura.graphql-engine.labels."app.kubernetes.io/instance" | string | `"atk"` |  |
| hasura.graphql-engine.labels."kots.io/app-slug" | string | `"settlemint-atk"` |  |
| hasura.graphql-engine.replicas | int | `1` |  |
| hasura.graphql-engine.secret.extraSecrets.DEFAULT_DB_URL | string | `"postgresql://hasura:atk@postgresql:5432/hasura?sslmode=disable"` |  |
| hasura.graphql-engine.secret.metadataDbUrl | string | `"postgresql://hasura:atk@postgresql:5432/hasura?sslmode=disable"` |  |
| hasura.graphql-engine.secret.rateLimitRedisUrl | string | `"redis://default:atk@redis:6379/3"` |  |
| hasura.graphql-engine.secret.redisUrl | string | `"redis://default:atk@redis:6379/2"` |  |
| hasura.postgresql.database | string | `"hasura"` |  |
| hasura.postgresql.endpoint | string | `"postgresql:5432"` |  |
| hasura.postgresql.host | string | `"postgresql"` |  |
| hasura.postgresql.password | string | `"atk"` |  |
| hasura.postgresql.port | int | `5432` |  |
| hasura.postgresql.sslMode | string | `"disable"` |  |
| hasura.postgresql.url | string | `"postgresql://hasura:atk@postgresql:5432/hasura?sslmode=disable"` |  |
| hasura.postgresql.username | string | `"hasura"` |  |
| hasura.redis.primary.db | int | `2` |  |
| hasura.redis.primary.host | string | `"redis"` |  |
| hasura.redis.primary.password | string | `"atk"` |  |
| hasura.redis.primary.port | int | `6379` |  |
| hasura.redis.primary.url | string | `"redis://default:atk@redis:6379/2"` |  |
| hasura.redis.primary.username | string | `"default"` |  |
| hasura.redis.rateLimit.db | int | `3` |  |
| hasura.redis.rateLimit.host | string | `"redis"` |  |
| hasura.redis.rateLimit.password | string | `"atk"` |  |
| hasura.redis.rateLimit.port | int | `6379` |  |
| hasura.redis.rateLimit.url | string | `"redis://default:atk@redis:6379/3"` |  |
| hasura.redis.rateLimit.username | string | `"default"` |  |
| network.enabled | bool | `true` |  |
| network.network-bootstrapper.podSecurityContext.fsGroup | int | `1000` |  |
| network.network-bootstrapper.podSecurityContext.fsGroupChangePolicy | string | `"Always"` |  |
| network.network-bootstrapper.podSecurityContext.runAsGroup | int | `1000` |  |
| network.network-bootstrapper.podSecurityContext.runAsNonRoot | bool | `true` |  |
| network.network-bootstrapper.podSecurityContext.runAsUser | int | `1000` |  |
| network.network-bootstrapper.podSecurityContext.seccompProfile.type | string | `"RuntimeDefault"` |  |
| network.network-bootstrapper.securityContext.allowPrivilegeEscalation | bool | `false` |  |
| network.network-bootstrapper.securityContext.capabilities.drop[0] | string | `"ALL"` |  |
| network.network-bootstrapper.securityContext.runAsGroup | int | `1000` |  |
| network.network-bootstrapper.securityContext.runAsNonRoot | bool | `true` |  |
| network.network-bootstrapper.securityContext.runAsUser | int | `1000` |  |
| network.network-bootstrapper.securityContext.seccompProfile.type | string | `"RuntimeDefault"` |  |
| network.network-bootstrapper.settings.chainId | string | `"53771311147"` |  |
| network.network-nodes.persistence.enabled | bool | `true` |  |
| network.network-nodes.persistence.size | string | `"20Gi"` |  |
| network.network-nodes.podSecurityContext.fsGroup | int | `1000` |  |
| network.network-nodes.podSecurityContext.fsGroupChangePolicy | string | `"Always"` |  |
| network.network-nodes.podSecurityContext.runAsGroup | int | `1000` |  |
| network.network-nodes.podSecurityContext.runAsNonRoot | bool | `true` |  |
| network.network-nodes.podSecurityContext.runAsUser | int | `1000` |  |
| network.network-nodes.podSecurityContext.seccompProfile.type | string | `"RuntimeDefault"` |  |
| network.network-nodes.securityContext.allowPrivilegeEscalation | bool | `false` |  |
| network.network-nodes.securityContext.capabilities.drop[0] | string | `"ALL"` |  |
| network.network-nodes.securityContext.runAsGroup | int | `1000` |  |
| network.network-nodes.securityContext.runAsNonRoot | bool | `true` |  |
| network.network-nodes.securityContext.runAsUser | int | `1000` |  |
| network.network-nodes.securityContext.seccompProfile.type | string | `"RuntimeDefault"` |  |
| observability.alloy.alloy.resources | object | `{}` |  |
| observability.alloy.configReloader.image.registry | string | `"quay.io"` |  |
| observability.alloy.configReloader.image.repository | string | `"prometheus-operator/prometheus-config-reloader"` | Repository to get config reloader image from. |
| observability.alloy.configReloader.image.tag | string | `"v0.85.0"` | Tag of image to use for config reloading. |
| observability.alloy.image.registry | string | `"docker.io"` |  |
| observability.alloy.image.repository | string | `"grafana/alloy"` | Grafana Alloy image repository. |
| observability.alloy.image.tag | string | `"v1.10.2"` |  |
| observability.enabled | bool | `true` |  |
| observability.grafana.adminPassword | string | `"atk"` |  |
| observability.grafana.adminUser | string | `"settlemint"` |  |
| observability.grafana.image.registry | string | `"docker.io"` | The Docker registry |
| observability.grafana.image.repository | string | `"grafana/grafana"` | Docker image repository |
| observability.grafana.image.tag | string | `"12.1.1"` |  |
| observability.grafana.ingress.hosts[0] | string | `"grafana.k8s.orb.local"` |  |
| observability.grafana.sidecar.image.registry | string | `"docker.io"` |  |
| observability.grafana.sidecar.image.repository | string | `"kiwigrid/k8s-sidecar"` |  |
| observability.grafana.sidecar.image.tag | string | `"1.30.10"` |  |
| observability.kube-state-metrics.image.registry | string | `"registry.k8s.io"` |  |
| observability.kube-state-metrics.image.repository | string | `"kube-state-metrics/kube-state-metrics"` |  |
| observability.kube-state-metrics.image.tag | string | `"v2.17.0"` |  |
| observability.kube-state-metrics.resources | object | `{}` |  |
| observability.loki.gateway.image.registry | string | `"docker.io"` |  |
| observability.loki.gateway.image.repository | string | `"nginxinc/nginx-unprivileged"` |  |
| observability.loki.gateway.image.tag | string | `"1.29-alpine"` |  |
| observability.loki.loki.image.registry | string | `"docker.io"` | The Docker registry |
| observability.loki.loki.image.repository | string | `"grafana/loki"` | Docker image repository |
| observability.loki.loki.image.tag | string | `"3.5.5"` | Overrides the image tag whose default is the chart's appVersion |
| observability.loki.memcached.enabled | bool | `true` | Enable the built in memcached server provided by the chart |
| observability.loki.memcached.image.repository | string | `"docker.io/memcached"` | Memcached Docker image repository |
| observability.loki.memcached.image.tag | string | `"1.6.39-alpine"` | Memcached Docker image tag |
| observability.loki.memcachedExporter.image.repository | string | `"docker.io/prom/memcached-exporter"` |  |
| observability.loki.memcachedExporter.image.tag | string | `"v0.15.3"` |  |
| observability.loki.sidecar.image.repository | string | `"docker.io/kiwigrid/k8s-sidecar"` | The Docker registry and image for the k8s sidecar |
| observability.loki.sidecar.image.tag | string | `"1.30.10"` |  |
| observability.loki.singleBinary.extraEnv | object | `{}` |  |
| observability.loki.singleBinary.persistence.size | string | `"10Gi"` |  |
| observability.loki.singleBinary.resources | object | `{}` |  |
| observability.metrics-server.enabled | bool | `false` |  |
| observability.metrics-server.image.repository | string | `"registry.k8s.io/metrics-server/metrics-server"` |  |
| observability.metrics-server.image.tag | string | `"v0.8.0"` |  |
| observability.metrics-server.resources | object | `{}` |  |
| observability.prometheus-node-exporter.image.registry | string | `"quay.io"` |  |
| observability.prometheus-node-exporter.image.repository | string | `"prometheus/node-exporter"` |  |
| observability.prometheus-node-exporter.image.tag | string | `"v1.9.1"` |  |
| observability.tempo.server.resources | object | `{}` |  |
| observability.tempo.tempo.repository | string | `"docker.io/grafana/tempo"` |  |
| observability.tempo.tempo.tag | string | `"2.8.1"` |  |
| observability.tempo.tempoQuery.repository | string | `"docker.io/grafana/tempo-query"` |  |
| observability.tempo.tempoQuery.tag | string | `"2.8.1"` |  |
| observability.victoria-metrics-single.server.image.registry | string | `"docker.io"` |  |
| observability.victoria-metrics-single.server.image.repository | string | `"victoriametrics/victoria-metrics"` |  |
| observability.victoria-metrics-single.server.image.tag | string | `"v1.126.0"` |  |
| observability.victoria-metrics-single.server.persistentVolume.size | string | `"10Gi"` |  |
| observability.victoria-metrics-single.server.persistentVolume.storageClass | string | `""` |  |
| observability.victoria-metrics-single.server.resources | object | `{}` |  |
| portal.config.postgresql | string | `"postgresql://portal:atk@postgresql:5432/portal?sslmode=disable"` |  |
| portal.config.postgresqlConnection.database | string | `"portal"` |  |
| portal.config.postgresqlConnection.endpoint | string | `"postgresql:5432"` |  |
| portal.config.postgresqlConnection.host | string | `"postgresql"` |  |
| portal.config.postgresqlConnection.password | string | `"atk"` |  |
| portal.config.postgresqlConnection.port | int | `5432` |  |
| portal.config.postgresqlConnection.sslMode | string | `"disable"` |  |
| portal.config.postgresqlConnection.url | string | `"postgresql://portal:atk@postgresql:5432/portal?sslmode=disable"` |  |
| portal.config.postgresqlConnection.username | string | `"portal"` |  |
| portal.config.redis.db | int | `4` |  |
| portal.config.redis.host | string | `"redis"` |  |
| portal.config.redis.password | string | `"atk"` |  |
| portal.config.redis.port | int | `6379` |  |
| portal.config.redis.url | string | `"redis://default:atk@redis:6379/4"` |  |
| portal.config.redis.username | string | `"default"` |  |
| portal.containerSecurityContext.allowPrivilegeEscalation | bool | `false` |  |
| portal.containerSecurityContext.capabilities.drop[0] | string | `"ALL"` |  |
| portal.containerSecurityContext.runAsGroup | int | `1000` |  |
| portal.containerSecurityContext.runAsNonRoot | bool | `true` |  |
| portal.containerSecurityContext.runAsUser | int | `1000` |  |
| portal.containerSecurityContext.seccompProfile.type | string | `"RuntimeDefault"` |  |
| portal.enabled | bool | `true` |  |
| portal.image.pullPolicy | string | `"IfNotPresent"` |  |
| portal.image.registry | string | `"ghcr.io"` |  |
| portal.image.repository | string | `"settlemint/btp-scs-portal"` |  |
| portal.image.tag | string | `"8.6.7"` |  |
| portal.ingress.hostname | string | `"portal.k8s.orb.local"` |  |
| portal.initContainer.copyArtifacts.resources.limits.cpu | string | `"150m"` |  |
| portal.initContainer.copyArtifacts.resources.limits.memory | string | `"128Mi"` |  |
| portal.initContainer.copyArtifacts.resources.requests.cpu | string | `"25m"` |  |
| portal.initContainer.copyArtifacts.resources.requests.memory | string | `"64Mi"` |  |
| portal.initContainer.copyArtifacts.securityContext.allowPrivilegeEscalation | bool | `false` |  |
| portal.initContainer.copyArtifacts.securityContext.capabilities.drop[0] | string | `"ALL"` |  |
| portal.initContainer.copyArtifacts.securityContext.runAsGroup | int | `1001` |  |
| portal.initContainer.copyArtifacts.securityContext.runAsNonRoot | bool | `true` |  |
| portal.initContainer.copyArtifacts.securityContext.runAsUser | int | `1001` |  |
| portal.initContainer.copyArtifacts.securityContext.seccompProfile.type | string | `"RuntimeDefault"` |  |
| portal.initContainer.tcpCheck.dependencies[0].endpoint | string | `"postgresql:5432"` |  |
| portal.initContainer.tcpCheck.dependencies[0].name | string | `"postgresql"` |  |
| portal.initContainer.tcpCheck.enabled | bool | `true` |  |
| portal.initContainer.tcpCheck.image.pullPolicy | string | `"IfNotPresent"` |  |
| portal.initContainer.tcpCheck.image.repository | string | `"ghcr.io/settlemint/btp-waitforit"` |  |
| portal.initContainer.tcpCheck.image.tag | string | `"v7.7.10"` |  |
| portal.initContainer.tcpCheck.resources.limits.cpu | string | `"100m"` |  |
| portal.initContainer.tcpCheck.resources.limits.memory | string | `"64Mi"` |  |
| portal.initContainer.tcpCheck.resources.requests.cpu | string | `"10m"` |  |
| portal.initContainer.tcpCheck.resources.requests.memory | string | `"32Mi"` |  |
| portal.initContainer.tcpCheck.timeout | int | `120` |  |
| portal.initContainerSecurityContext.allowPrivilegeEscalation | bool | `false` |  |
| portal.initContainerSecurityContext.capabilities.drop[0] | string | `"ALL"` |  |
| portal.initContainerSecurityContext.runAsGroup | int | `1001` |  |
| portal.initContainerSecurityContext.runAsNonRoot | bool | `true` |  |
| portal.initContainerSecurityContext.runAsUser | int | `1001` |  |
| portal.initContainerSecurityContext.seccompProfile.type | string | `"RuntimeDefault"` |  |
| portal.podAnnotations."prometheus.io/path" | string | `"/portal-metrics"` |  |
| portal.podAnnotations."prometheus.io/port" | string | `"3000"` |  |
| portal.podAnnotations."prometheus.io/scrape" | string | `"true"` |  |
| portal.podLabels."app.kubernetes.io/component" | string | `"portal"` |  |
| portal.podSecurityContext.fsGroup | int | `1000` |  |
| portal.podSecurityContext.runAsNonRoot | bool | `true` |  |
| portal.podSecurityContext.seccompProfile.type | string | `"RuntimeDefault"` |  |
| support.enabled | bool | `true` |  |
| support.ingress-nginx.controller.image.digest | string | `""` |  |
| support.ingress-nginx.controller.image.repository | string | `"registry.k8s.io/ingress-nginx/controller"` |  |
| support.ingress-nginx.controller.image.tag | string | `"v1.13.2"` |  |
| support.ingress-nginx.controller.resources | object | `{}` |  |
| support.ingress-nginx.enabled | bool | `true` |  |
| support.ingress-nginx.replicaCount | int | `1` |  |
| support.minio.enabled | bool | `true` |  |
| support.minio.image.pullPolicy | string | `"IfNotPresent"` |  |
| support.minio.image.repository | string | `"docker.io/minio/minio"` |  |
| support.minio.image.tag | string | `"RELEASE.2025-07-23T15-54-02Z"` |  |
| support.minio.ingress.enabled | bool | `true` |  |
| support.minio.ingress.hosts[0] | string | `"minio.k8s.orb.local"` |  |
| support.minio.ingress.ingressClassName | string | `"atk-nginx"` |  |
| support.minio.ingress.path | string | `"/"` |  |
| support.minio.mcImage.pullPolicy | string | `"IfNotPresent"` |  |
| support.minio.mcImage.repository | string | `"docker.io/minio/minio"` |  |
| support.minio.mcImage.tag | string | `"RELEASE.2025-07-23T15-54-02Z"` |  |
| support.postgresql.enabled | bool | `true` |  |
| support.postgresql.image.registry | string | `"docker.io"` |  |
| support.postgresql.image.repository | string | `"postgres"` |  |
| support.postgresql.image.tag | string | `"17.6-alpine"` |  |
| support.postgresql.podSecurityContext.fsGroup | int | `999` |  |
| support.postgresql.podSecurityContext.runAsNonRoot | bool | `true` |  |
| support.postgresql.podSecurityContext.seccompProfile.type | string | `"RuntimeDefault"` |  |
| support.postgresql.securityContext.allowPrivilegeEscalation | bool | `false` |  |
| support.postgresql.securityContext.capabilities.drop[0] | string | `"ALL"` |  |
| support.postgresql.securityContext.runAsGroup | int | `999` |  |
| support.postgresql.securityContext.runAsNonRoot | bool | `true` |  |
| support.postgresql.securityContext.runAsUser | int | `999` |  |
| support.postgresql.securityContext.seccompProfile.type | string | `"RuntimeDefault"` |  |
| support.redis.auth.enabled | bool | `true` |  |
| support.redis.auth.password | string | `"atk"` |  |
| support.redis.commonLabels."app.kubernetes.io/managed-by" | string | `"helm"` |  |
| support.redis.commonLabels."kots.io/app-slug" | string | `"settlemint-atk"` |  |
| support.redis.containerSecurityContext.allowPrivilegeEscalation | bool | `false` |  |
| support.redis.containerSecurityContext.capabilities.drop[0] | string | `"ALL"` |  |
| support.redis.containerSecurityContext.readOnlyRootFilesystem | bool | `false` |  |
| support.redis.containerSecurityContext.runAsGroup | int | `999` |  |
| support.redis.containerSecurityContext.runAsNonRoot | bool | `true` |  |
| support.redis.containerSecurityContext.runAsUser | int | `999` |  |
| support.redis.containerSecurityContext.seccompProfile.type | string | `"RuntimeDefault"` |  |
| support.redis.enabled | bool | `true` |  |
| support.redis.fullnameOverride | string | `"redis"` |  |
| support.redis.image.registry | string | `"docker.io"` | Redis image registry |
| support.redis.image.repository | string | `"redis"` | Redis image repository |
| support.redis.image.tag | string | `"8.2.1-alpine"` | Redis image tag |
| support.redis.persistence.enabled | bool | `true` |  |
| support.redis.persistence.size | string | `"1Gi"` |  |
| support.redis.podSecurityContext.fsGroup | int | `999` |  |
| support.redis.podSecurityContext.runAsNonRoot | bool | `true` |  |
| support.redis.podSecurityContext.runAsUser | int | `999` |  |
| support.redis.podSecurityContext.seccompProfile.type | string | `"RuntimeDefault"` |  |
| support.redis.resources.limits.cpu | string | `"200m"` |  |
| support.redis.resources.limits.memory | string | `"256Mi"` |  |
| support.redis.resources.requests.cpu | string | `"100m"` |  |
| support.redis.resources.requests.memory | string | `"128Mi"` |  |
| support.reloader.enabled | bool | `true` |  |
| support.reloader.image.repository | string | `"ghcr.io/stakater/reloader"` |  |
| support.reloader.image.tag | string | `"v1.4.8"` |  |
| txsigner.config.derivationPath | string | `"m/44'/60'/0'/0/0"` |  |
| txsigner.config.mnemonic | string | `"gate yellow grunt wrestle disease obtain mixed nature mansion tape purchase awful"` |  |
| txsigner.containerSecurityContext.allowPrivilegeEscalation | bool | `false` |  |
| txsigner.containerSecurityContext.capabilities.drop[0] | string | `"ALL"` |  |
| txsigner.containerSecurityContext.runAsGroup | int | `1000` |  |
| txsigner.containerSecurityContext.runAsNonRoot | bool | `true` |  |
| txsigner.containerSecurityContext.runAsUser | int | `1000` |  |
| txsigner.containerSecurityContext.seccompProfile.type | string | `"RuntimeDefault"` |  |
| txsigner.enabled | bool | `true` |  |
| txsigner.image.pullPolicy | string | `"IfNotPresent"` |  |
| txsigner.image.registry | string | `"ghcr.io"` |  |
| txsigner.image.repository | string | `"settlemint/btp-signer"` |  |
| txsigner.image.tag | string | `"7.15.13"` |  |
| txsigner.ingress.hostname | string | `"txsigner.k8s.orb.local"` |  |
| txsigner.initContainer.tcpCheck.dependencies[0].endpoint | string | `"postgresql:5432"` |  |
| txsigner.initContainer.tcpCheck.dependencies[0].name | string | `"postgresql"` |  |
| txsigner.initContainer.tcpCheck.enabled | bool | `true` |  |
| txsigner.initContainer.tcpCheck.image.pullPolicy | string | `"IfNotPresent"` |  |
| txsigner.initContainer.tcpCheck.image.repository | string | `"ghcr.io/settlemint/btp-waitforit"` |  |
| txsigner.initContainer.tcpCheck.image.tag | string | `"v7.7.10"` |  |
| txsigner.initContainer.tcpCheck.resources.limits.cpu | string | `"100m"` |  |
| txsigner.initContainer.tcpCheck.resources.limits.memory | string | `"64Mi"` |  |
| txsigner.initContainer.tcpCheck.resources.requests.cpu | string | `"10m"` |  |
| txsigner.initContainer.tcpCheck.resources.requests.memory | string | `"32Mi"` |  |
| txsigner.initContainer.tcpCheck.timeout | int | `120` |  |
| txsigner.initContainerSecurityContext.allowPrivilegeEscalation | bool | `false` |  |
| txsigner.initContainerSecurityContext.capabilities.drop[0] | string | `"ALL"` |  |
| txsigner.initContainerSecurityContext.runAsGroup | int | `1001` |  |
| txsigner.initContainerSecurityContext.runAsNonRoot | bool | `true` |  |
| txsigner.initContainerSecurityContext.runAsUser | int | `1001` |  |
| txsigner.initContainerSecurityContext.seccompProfile.type | string | `"RuntimeDefault"` |  |
| txsigner.podSecurityContext.fsGroup | int | `1000` |  |
| txsigner.podSecurityContext.runAsNonRoot | bool | `true` |  |
| txsigner.podSecurityContext.seccompProfile.type | string | `"RuntimeDefault"` |  |
| txsigner.postgresql | string | `"postgresql://txsigner:atk@postgresql:5432/txsigner?sslmode=disable"` |  |
| txsigner.postgresqlConnection.database | string | `"txsigner"` |  |
| txsigner.postgresqlConnection.endpoint | string | `"postgresql:5432"` |  |
| txsigner.postgresqlConnection.host | string | `"postgresql"` |  |
| txsigner.postgresqlConnection.password | string | `"atk"` |  |
| txsigner.postgresqlConnection.port | int | `5432` |  |
| txsigner.postgresqlConnection.sslMode | string | `"disable"` |  |
| txsigner.postgresqlConnection.url | string | `"postgresql://txsigner:atk@postgresql:5432/txsigner?sslmode=disable"` |  |
| txsigner.postgresqlConnection.username | string | `"txsigner"` |  |
| txsigner.replicaCount | int | `1` |  |
| txsigner.resources | object | `{}` |  |
| txsigner.test.image.pullPolicy | string | `"IfNotPresent"` |  |
| txsigner.test.image.repository | string | `"docker.io/busybox"` |  |
| txsigner.test.image.tag | string | `"1.37"` |  |

## Maintainers

| Name | Email | Url |
| ---- | ------ | --- |
| SettleMint | <support@settlemint.com> | <https://settlemint.com> |

## Requirements

| Repository | Name | Version |
|------------|------|---------|
|  | blockscout | * |
|  | dapp | * |
|  | erpc | * |
|  | graph-node | * |
|  | hasura | * |
|  | observability | * |
|  | portal | * |
|  | support | * |
|  | txsigner | * |
| oci://ghcr.io/settlemint/network-bootstrapper | network | 1.0.13 |

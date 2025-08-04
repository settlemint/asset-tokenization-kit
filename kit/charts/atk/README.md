# atk

![Version: v2.0.0](https://img.shields.io/badge/Version-v2.0.0-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: v2.0.0](https://img.shields.io/badge/AppVersion-v2.0.0-informational?style=flat-square)

A Helm chart for the SettleMint Asset Tokenization Kit

## Maintainers

| Name | Email | Url |
| ---- | ------ | --- |
| SettleMint | <support@settlemint.com> | <https://settlemint.com> |

## Requirements

| Repository | Name | Version |
|------------|------|---------|
|  | besu-network | * |
|  | blockscout | * |
|  | erpc | * |
|  | graph-node | * |
|  | hasura | * |
|  | observability | * |
|  | portal | * |
|  | support | * |
| file://./charts/dapp | dapp | * |
| file://./charts/txsigner | txsigner | * |

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| besu-network.besu-rpc-1.enabled | bool | `true` |  |
| besu-network.besu-rpc-1.resources | object | `{}` |  |
| besu-network.besu-rpc-1.storage.pvcSizeLimit | string | `"5Gi"` |  |
| besu-network.besu-rpc-1.storage.sizeLimit | string | `"5Gi"` |  |
| besu-network.besu-rpc-2.enabled | bool | `false` |  |
| besu-network.besu-rpc-2.resources | object | `{}` |  |
| besu-network.besu-rpc-2.storage.pvcSizeLimit | string | `"5Gi"` |  |
| besu-network.besu-rpc-2.storage.sizeLimit | string | `"5Gi"` |  |
| besu-network.besu-validator-1.enabled | bool | `true` |  |
| besu-network.besu-validator-1.resources | object | `{}` |  |
| besu-network.besu-validator-1.storage.pvcSizeLimit | string | `"5Gi"` |  |
| besu-network.besu-validator-1.storage.sizeLimit | string | `"5Gi"` |  |
| besu-network.besu-validator-2.enabled | bool | `false` |  |
| besu-network.besu-validator-2.resources | object | `{}` |  |
| besu-network.besu-validator-2.storage.pvcSizeLimit | string | `"5Gi"` |  |
| besu-network.besu-validator-2.storage.sizeLimit | string | `"5Gi"` |  |
| besu-network.besu-validator-3.enabled | bool | `false` |  |
| besu-network.besu-validator-3.resources | object | `{}` |  |
| besu-network.besu-validator-3.storage.pvcSizeLimit | string | `"5Gi"` |  |
| besu-network.besu-validator-3.storage.sizeLimit | string | `"5Gi"` |  |
| besu-network.besu-validator-4.enabled | bool | `false` |  |
| besu-network.besu-validator-4.resources | object | `{}` |  |
| besu-network.besu-validator-4.storage.pvcSizeLimit | string | `"5Gi"` |  |
| besu-network.besu-validator-4.storage.sizeLimit | string | `"5Gi"` |  |
| besu-network.enabled | bool | `true` |  |
| besu-network.rawGenesisConfig.blockchain.nodes.count | int | `1` |  |
| blockscout.blockscout-stack.blockscout.env.API_URL | string | `"https://explorer.k8s.orb.local"` |  |
| blockscout.blockscout-stack.blockscout.env.WEBAPP_URL | string | `"https://explorer.k8s.orb.local"` |  |
| blockscout.blockscout-stack.blockscout.ingress.hostname | string | `"explorer.k8s.orb.local"` |  |
| blockscout.blockscout-stack.blockscout.init.args[0] | string | `"-c"` |  |
| blockscout.blockscout-stack.blockscout.init.args[1] | string | `"echo \"Waiting for postgresql:5432...\"\nwhile ! nc -z postgresql 5432; do\n  sleep 2;\ndone;\necho \"PostgreSQL is ready!\"\n# Original command:\nbin/blockscout eval \"Elixir.Explorer.ReleaseTasks.create_and_migrate()\"\n"` |  |
| blockscout.blockscout-stack.blockscout.init.command[0] | string | `"/bin/sh"` |  |
| blockscout.blockscout-stack.blockscout.init.enabled | bool | `true` |  |
| blockscout.blockscout-stack.blockscout.resources | object | `{}` |  |
| blockscout.blockscout-stack.frontend.ingress.hostname | string | `"explorer.k8s.orb.local"` |  |
| blockscout.blockscout-stack.podAnnotations."prometheus.io/path" | string | `"/metrics"` |  |
| blockscout.blockscout-stack.podAnnotations."prometheus.io/port" | string | `"4000"` |  |
| blockscout.blockscout-stack.podAnnotations."prometheus.io/scrape" | string | `"true"` |  |
| blockscout.enabled | bool | `true` |  |
| dapp.enabled | bool | `true` |  |
| dapp.ingress.enabled | bool | `true` |  |
| dapp.ingress.hosts[0].host | string | `"dapp.k8s.orb.local"` |  |
| dapp.ingress.hosts[0].paths[0].path | string | `"/"` |  |
| dapp.ingress.hosts[0].paths[0].pathType | string | `"ImplementationSpecific"` |  |
| dapp.initContainer.graphQLCheck.connectTimeoutSeconds | int | `5` |  |
| dapp.initContainer.graphQLCheck.enabled | bool | `true` |  |
| dapp.initContainer.graphQLCheck.name | string | `"wait-for-graph-subgraph-kit"` |  |
| dapp.initContainer.graphQLCheck.query | string | `"{ __typename }"` |  |
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
| dapp.initContainer.tcpCheck.dependencies[4].endpoint | string | `"blockscout-frontend-svc:80"` |  |
| dapp.initContainer.tcpCheck.dependencies[4].name | string | `"blockscout"` |  |
| dapp.initContainer.tcpCheck.enabled | bool | `true` |  |
| dapp.initContainer.tcpCheck.timeout | int | `0` |  |
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
| dapp.secretEnv.SETTLEMINT_HASURA_DATABASE_URL | string | `"postgresql://hasura:atk@postgresql:5432/hasura"` |  |
| dapp.secretEnv.SETTLEMINT_HASURA_ENDPOINT | string | `"http://hasura:8080/v1/graphql"` |  |
| dapp.secretEnv.SETTLEMINT_HD_PRIVATE_KEY | string | `"atk-hd-private-key"` |  |
| dapp.secretEnv.SETTLEMINT_INSTANCE | string | `"standalone"` |  |
| dapp.secretEnv.SETTLEMINT_PORTAL_GRAPHQL_ENDPOINT | string | `"http://portal:3001/graphql"` |  |
| dapp.secretEnv.SETTLEMINT_THEGRAPH_SUBGRAPHS_ENDPOINTS | string | `"[\"http://graph-node-combined:8000/subgraphs/name/kit\"]"` |  |
| erpc.config.database.evmJsonRpcCache.connectors[0].driver | string | `"redis"` |  |
| erpc.config.database.evmJsonRpcCache.connectors[0].id | string | `"redis-cache"` |  |
| erpc.config.database.evmJsonRpcCache.connectors[0].redis.addr | string | `"redis.atk.svc.cluster.local:6379"` |  |
| erpc.config.database.evmJsonRpcCache.connectors[0].redis.connPoolSize | int | `128` |  |
| erpc.config.database.evmJsonRpcCache.connectors[0].redis.db | int | `0` |  |
| erpc.config.database.evmJsonRpcCache.connectors[0].redis.password | string | `"atk"` |  |
| erpc.config.database.evmJsonRpcCache.policies[0].connector | string | `"redis-cache"` |  |
| erpc.config.database.evmJsonRpcCache.policies[0].finality | string | `"finalized"` |  |
| erpc.config.database.evmJsonRpcCache.policies[0].method | string | `"*"` |  |
| erpc.config.database.evmJsonRpcCache.policies[0].network | string | `"*"` |  |
| erpc.config.logLevel | string | `"info"` |  |
| erpc.config.projects[0].id | string | `"settlemint"` |  |
| erpc.config.projects[0].upstreams[0].endpoint | string | `"http://besu-node-rpc-1:8545"` |  |
| erpc.config.projects[0].upstreams[0].evm.chainId | int | `1337` |  |
| erpc.config.projects[0].upstreams[0].failsafe.timeout.duration | string | `"30s"` |  |
| erpc.config.projects[0].upstreams[0].id | string | `"besu-node-rpc-1"` |  |
| erpc.config.projects[0].upstreams[1].endpoint | string | `"http://besu-node-validator-1:8545"` |  |
| erpc.config.projects[0].upstreams[1].evm.chainId | int | `1337` |  |
| erpc.config.projects[0].upstreams[1].failsafe.timeout.duration | string | `"30s"` |  |
| erpc.config.projects[0].upstreams[1].id | string | `"besu-node-validator-1"` |  |
| erpc.config.server.httpHostV4 | string | `"0.0.0.0"` |  |
| erpc.config.server.httpPort | int | `4000` |  |
| erpc.enabled | bool | `true` |  |
| erpc.ingress.className | string | `"atk-nginx"` |  |
| erpc.ingress.enabled | bool | `true` |  |
| erpc.ingress.hosts[0].host | string | `"rpc.k8s.orb.local"` |  |
| erpc.ingress.hosts[0].paths[0].path | string | `"/"` |  |
| erpc.ingress.hosts[0].paths[0].pathType | string | `"ImplementationSpecific"` |  |
| erpc.podAnnotations."prometheus.io/port" | string | `"4001"` |  |
| erpc.podAnnotations."prometheus.io/scrape" | string | `"true"` |  |
| erpc.podLabels."app.kubernetes.io/component" | string | `"erpc"` |  |
| erpc.resources | object | `{}` |  |
| global.artifacts.image.pullPolicy | string | `"IfNotPresent"` |  |
| global.artifacts.image.registry | string | `"ghcr.io"` |  |
| global.artifacts.image.repository | string | `"settlemint/asset-tokenization-kit-artifacts"` |  |
| global.artifacts.image.tag | string | `"2.0.0"` |  |
| global.labels."kots.io/app-slug" | string | `"settlemint-atk"` |  |
| global.networkPolicy.enabled | bool | `false` |  |
| graph-node.enabled | bool | `true` |  |
| graph-node.podAnnotations."prometheus.io/path" | string | `"/metrics"` |  |
| graph-node.podAnnotations."prometheus.io/port" | string | `"8040"` |  |
| graph-node.podAnnotations."prometheus.io/scrape" | string | `"true"` |  |
| hasura.enabled | bool | `true` |  |
| hasura.graphql-engine.ingress.hostName | string | `"hasura.k8s.orb.local"` |  |
| hasura.graphql-engine.labels."app.kubernetes.io/component" | string | `"hasura"` |  |
| hasura.graphql-engine.labels."app.kubernetes.io/instance" | string | `"atk"` |  |
| hasura.graphql-engine.labels."kots.io/app-slug" | string | `"settlemint-atk"` |  |
| hasura.graphql-engine.replicas | int | `1` |  |
| imagePullCredentials.registries | object | `{}` |  |
| observability.alertmanager.alertmanager.resources | object | `{}` |  |
| observability.alloy.alloy.resources | object | `{}` |  |
| observability.enabled | bool | `true` |  |
| observability.grafana.adminPassword | string | `"atk"` |  |
| observability.grafana.adminUser | string | `"settlemint"` |  |
| observability.grafana.ingress.hosts[0] | string | `"grafana.k8s.orb.local"` |  |
| observability.kube-state-metrics.resources | object | `{}` |  |
| observability.loki.singleBinary.extraEnv | object | `{}` |  |
| observability.loki.singleBinary.persistence.size | string | `"10Gi"` |  |
| observability.loki.singleBinary.resources | object | `{}` |  |
| observability.metrics-server.enabled | bool | `false` |  |
| observability.metrics-server.resources | object | `{}` |  |
| observability.prometheus-stack.prometheusOperator.resources | object | `{}` |  |
| observability.tempo.server.resources | object | `{}` |  |
| observability.victoria-metrics-single.server.persistentVolume.size | string | `"10Gi"` |  |
| observability.victoria-metrics-single.server.persistentVolume.storageClass | string | `""` |  |
| observability.victoria-metrics-single.server.resources | object | `{}` |  |
| portal.enabled | bool | `true` |  |
| portal.podAnnotations."prometheus.io/path" | string | `"/portal-metrics"` |  |
| portal.podAnnotations."prometheus.io/port" | string | `"3000"` |  |
| portal.podAnnotations."prometheus.io/scrape" | string | `"true"` |  |
| portal.podLabels."app.kubernetes.io/component" | string | `"portal"` |  |
| support.enabled | bool | `true` |  |
| support.ingress-nginx.controller.resources | object | `{}` |  |
| support.ingress-nginx.replicaCount | int | `1` |  |
| support.minio.enabled | bool | `true` |  |
| support.minio.image.repository | string | `"docker.io/minio/minio"` |  |
| support.minio.image.tag | string | `"RELEASE.2025-07-18T21-56-31Z"` |  |
| support.minio.ingress.enabled | bool | `true` |  |
| support.minio.ingress.hosts[0] | string | `"minio.k8s.orb.local"` |  |
| support.minio.ingress.ingressClassName | string | `"atk-nginx"` |  |
| support.minio.ingress.path | string | `"/"` |  |
| support.redis.auth.enabled | bool | `true` |  |
| support.redis.auth.password | string | `"atk"` |  |
| support.redis.commonLabels."app.kubernetes.io/managed-by" | string | `"helm"` |  |
| support.redis.commonLabels."kots.io/app-slug" | string | `"settlemint-atk"` |  |
| support.redis.enabled | bool | `true` |  |
| support.redis.fullnameOverride | string | `"redis"` |  |
| support.redis.persistence.enabled | bool | `true` |  |
| support.redis.persistence.size | string | `"1Gi"` |  |
| support.redis.resources.limits.cpu | string | `"200m"` |  |
| support.redis.resources.limits.memory | string | `"256Mi"` |  |
| support.redis.resources.requests.cpu | string | `"100m"` |  |
| support.redis.resources.requests.memory | string | `"128Mi"` |  |
| support.reloader.enabled | bool | `true` |  |
| txsigner.config.derivationPath | string | `"m/44'/60'/0'/0/0"` |  |
| txsigner.config.mnemonic | string | `"gate yellow grunt wrestle disease obtain mixed nature mansion tape purchase awful"` |  |
| txsigner.enabled | bool | `true` |  |
| txsigner.postgresql | string | `"postgresql://txsigner:atk@postgresql:5432/txsigner?sslmode=disable"` |  |
| txsigner.replicaCount | int | `1` |  |
| txsigner.resources | object | `{}` |  |

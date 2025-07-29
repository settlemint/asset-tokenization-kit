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
|  | hasura | * |
|  | observability | * |
|  | portal | * |
|  | support | * |
|  | thegraph | * |
| file://./charts/dapp | dapp | * |
| file://./charts/txsigner | txsigner | * |

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| besu-network.besu-rpc-1.enabled | bool | `true` |  |
| besu-network.besu-rpc-1.imagePullSecrets[0].name | string | `"image-pull-secret-docker"` |  |
| besu-network.besu-rpc-1.imagePullSecrets[1].name | string | `"image-pull-secret-ghcr"` |  |
| besu-network.besu-rpc-1.imagePullSecrets[2].name | string | `"image-pull-secret-harbor"` |  |
| besu-network.besu-rpc-1.resources | object | `{}` |  |
| besu-network.besu-rpc-1.storage.pvcSizeLimit | string | `"5Gi"` |  |
| besu-network.besu-rpc-1.storage.sizeLimit | string | `"5Gi"` |  |
| besu-network.besu-rpc-2.enabled | bool | `false` |  |
| besu-network.besu-rpc-2.imagePullSecrets[0].name | string | `"image-pull-secret-docker"` |  |
| besu-network.besu-rpc-2.imagePullSecrets[1].name | string | `"image-pull-secret-ghcr"` |  |
| besu-network.besu-rpc-2.imagePullSecrets[2].name | string | `"image-pull-secret-harbor"` |  |
| besu-network.besu-rpc-2.resources | object | `{}` |  |
| besu-network.besu-rpc-2.storage.pvcSizeLimit | string | `"5Gi"` |  |
| besu-network.besu-rpc-2.storage.sizeLimit | string | `"5Gi"` |  |
| besu-network.besu-validator-1.enabled | bool | `true` |  |
| besu-network.besu-validator-1.imagePullSecrets[0].name | string | `"image-pull-secret-docker"` |  |
| besu-network.besu-validator-1.imagePullSecrets[1].name | string | `"image-pull-secret-ghcr"` |  |
| besu-network.besu-validator-1.imagePullSecrets[2].name | string | `"image-pull-secret-harbor"` |  |
| besu-network.besu-validator-1.resources | object | `{}` |  |
| besu-network.besu-validator-1.storage.pvcSizeLimit | string | `"5Gi"` |  |
| besu-network.besu-validator-1.storage.sizeLimit | string | `"5Gi"` |  |
| besu-network.besu-validator-2.enabled | bool | `false` |  |
| besu-network.besu-validator-2.imagePullSecrets[0].name | string | `"image-pull-secret-docker"` |  |
| besu-network.besu-validator-2.imagePullSecrets[1].name | string | `"image-pull-secret-ghcr"` |  |
| besu-network.besu-validator-2.imagePullSecrets[2].name | string | `"image-pull-secret-harbor"` |  |
| besu-network.besu-validator-2.resources | object | `{}` |  |
| besu-network.besu-validator-2.storage.pvcSizeLimit | string | `"5Gi"` |  |
| besu-network.besu-validator-2.storage.sizeLimit | string | `"5Gi"` |  |
| besu-network.besu-validator-3.enabled | bool | `false` |  |
| besu-network.besu-validator-3.imagePullSecrets[0].name | string | `"image-pull-secret-docker"` |  |
| besu-network.besu-validator-3.imagePullSecrets[1].name | string | `"image-pull-secret-ghcr"` |  |
| besu-network.besu-validator-3.imagePullSecrets[2].name | string | `"image-pull-secret-harbor"` |  |
| besu-network.besu-validator-3.resources | object | `{}` |  |
| besu-network.besu-validator-3.storage.pvcSizeLimit | string | `"5Gi"` |  |
| besu-network.besu-validator-3.storage.sizeLimit | string | `"5Gi"` |  |
| besu-network.besu-validator-4.enabled | bool | `false` |  |
| besu-network.besu-validator-4.imagePullSecrets[0].name | string | `"image-pull-secret-docker"` |  |
| besu-network.besu-validator-4.imagePullSecrets[1].name | string | `"image-pull-secret-ghcr"` |  |
| besu-network.besu-validator-4.imagePullSecrets[2].name | string | `"image-pull-secret-harbor"` |  |
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
| blockscout.blockscout-stack.imagePullSecrets[0].name | string | `"image-pull-secret-docker"` |  |
| blockscout.blockscout-stack.imagePullSecrets[1].name | string | `"image-pull-secret-ghcr"` |  |
| blockscout.blockscout-stack.imagePullSecrets[2].name | string | `"image-pull-secret-harbor"` |  |
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
| erpc.config.projects[0].upstreams[0].id | string | `"besu-node-rpc-1"` |  |
| erpc.config.projects[0].upstreams[1].endpoint | string | `"http://besu-node-validator-1:8545"` |  |
| erpc.config.projects[0].upstreams[1].id | string | `"besu-node-validator-1"` |  |
| erpc.enabled | bool | `true` |  |
| erpc.image.pullSecrets[0].name | string | `"image-pull-secret-docker"` |  |
| erpc.image.pullSecrets[1].name | string | `"image-pull-secret-ghcr"` |  |
| erpc.image.pullSecrets[2].name | string | `"image-pull-secret-harbor"` |  |
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
| global.ingressNamespace | string | `"ingress-nginx"` |  |
| global.labels."kots.io/app-slug" | string | `"settlemint-atk"` |  |
| global.networkPolicy.enabled | bool | `false` |  |
| hasura.enabled | bool | `true` |  |
| hasura.graphql-engine.global.imagePullSecrets[0].name | string | `"image-pull-secret-docker"` |  |
| hasura.graphql-engine.global.imagePullSecrets[1].name | string | `"image-pull-secret-ghcr"` |  |
| hasura.graphql-engine.global.imagePullSecrets[2].name | string | `"image-pull-secret-harbor"` |  |
| hasura.graphql-engine.ingress.hostName | string | `"hasura.k8s.orb.local"` |  |
| hasura.graphql-engine.labels."app.kubernetes.io/component" | string | `"hasura"` |  |
| hasura.graphql-engine.labels."app.kubernetes.io/instance" | string | `"atk"` |  |
| hasura.graphql-engine.labels."kots.io/app-slug" | string | `"settlemint-atk"` |  |
| hasura.graphql-engine.replicas | int | `1` |  |
| imagePullCredentials.registries.docker | object | `{"email":"","enabled":false,"password":"","registryUrl":"docker.io","username":""}` | lowercase, no points or special caracters unique identifier for the registry, harbor, ghcr and docker have special meaning, but you can add more |
| imagePullCredentials.registries.docker.email | string | `""` | The email to access the registry |
| imagePullCredentials.registries.docker.enabled | bool | `false` | Enable this if you want this chart to create an image pull secret for you |
| imagePullCredentials.registries.docker.password | string | `""` | The password or access token to access the registry |
| imagePullCredentials.registries.docker.registryUrl | string | `"docker.io"` | The registry hosting the packages, e.g docker.io or ghcr.io |
| imagePullCredentials.registries.docker.username | string | `""` | The username to access the registry |
| imagePullCredentials.registries.ghcr | object | `{"email":"","enabled":false,"password":"","registryUrl":"ghcr.io","username":""}` | lowercase, no points or special caracters unique identifier for the registry, harbor, ghcr and docker have special meaning, but you can add more |
| imagePullCredentials.registries.ghcr.email | string | `""` | The email to access the registry |
| imagePullCredentials.registries.ghcr.enabled | bool | `false` | Enable this if you want this chart to create an image pull secret for you |
| imagePullCredentials.registries.ghcr.password | string | `""` | The password or access token to access the registry |
| imagePullCredentials.registries.ghcr.registryUrl | string | `"ghcr.io"` | The registry hosting the packages, e.g docker.io or ghcr.io |
| imagePullCredentials.registries.ghcr.username | string | `""` | The username to access the registry |
| imagePullCredentials.registries.harbor | object | `{"email":"","enabled":false,"password":"","registryUrl":"harbor.settlemint.com","username":""}` | lowercase, no points or special caracters unique identifier for the registry, harbor, ghcr and docker have special meaning, but you can add more |
| imagePullCredentials.registries.harbor.email | string | `""` | The email to access the registry |
| imagePullCredentials.registries.harbor.enabled | bool | `false` | Enable this if you want this chart to create an image pull secret for you (harbor is the default registry for the platform) |
| imagePullCredentials.registries.harbor.password | string | `""` | The password or access token to access the registry |
| imagePullCredentials.registries.harbor.registryUrl | string | `"harbor.settlemint.com"` | The registry hosting the packages, e.g docker.io or ghcr.io |
| imagePullCredentials.registries.harbor.username | string | `""` | The username to access the registry |
| observability.alertmanager.alertmanager.global.imagePullSecrets[0].name | string | `"image-pull-secret-docker"` |  |
| observability.alertmanager.alertmanager.global.imagePullSecrets[1].name | string | `"image-pull-secret-ghcr"` |  |
| observability.alertmanager.alertmanager.global.imagePullSecrets[2].name | string | `"image-pull-secret-harbor"` |  |
| observability.alloy.alloy.resources | object | `{}` |  |
| observability.alloy.global.image.pullSecrets[0].name | string | `"image-pull-secret-docker"` |  |
| observability.alloy.global.image.pullSecrets[1].name | string | `"image-pull-secret-ghcr"` |  |
| observability.alloy.global.image.pullSecrets[2].name | string | `"image-pull-secret-harbor"` |  |
| observability.enabled | bool | `true` |  |
| observability.grafana.adminPassword | string | `"atk"` |  |
| observability.grafana.adminUser | string | `"settlemint"` |  |
| observability.grafana.global.imagePullSecrets[0].name | string | `"image-pull-secret-docker"` |  |
| observability.grafana.global.imagePullSecrets[1].name | string | `"image-pull-secret-ghcr"` |  |
| observability.grafana.global.imagePullSecrets[2].name | string | `"image-pull-secret-harbor"` |  |
| observability.grafana.ingress.hosts[0] | string | `"grafana.k8s.orb.local"` |  |
| observability.kube-state-metrics.imagePullSecrets[0].name | string | `"image-pull-secret-docker"` |  |
| observability.kube-state-metrics.imagePullSecrets[1].name | string | `"image-pull-secret-ghcr"` |  |
| observability.kube-state-metrics.imagePullSecrets[2].name | string | `"image-pull-secret-harbor"` |  |
| observability.kube-state-metrics.resources | object | `{}` |  |
| observability.loki.imagePullSecrets[0].name | string | `"image-pull-secret-docker"` |  |
| observability.loki.imagePullSecrets[1].name | string | `"image-pull-secret-ghcr"` |  |
| observability.loki.imagePullSecrets[2].name | string | `"image-pull-secret-harbor"` |  |
| observability.metrics-server.enabled | bool | `false` |  |
| observability.metrics-server.imagePullSecrets[0].name | string | `"image-pull-secret-docker"` |  |
| observability.metrics-server.imagePullSecrets[1].name | string | `"image-pull-secret-ghcr"` |  |
| observability.metrics-server.imagePullSecrets[2].name | string | `"image-pull-secret-harbor"` |  |
| observability.metrics-server.resources | object | `{}` |  |
| observability.prometheus-stack.global.imagePullSecrets[0].name | string | `"image-pull-secret-docker"` |  |
| observability.prometheus-stack.global.imagePullSecrets[1].name | string | `"image-pull-secret-ghcr"` |  |
| observability.prometheus-stack.global.imagePullSecrets[2].name | string | `"image-pull-secret-harbor"` |  |
| observability.singleBinary.extraEnv | object | `{}` |  |
| observability.singleBinary.persistence.size | string | `"10Gi"` |  |
| observability.singleBinary.resources | object | `{}` |  |
| observability.tempo.global.imagePullSecrets[0].name | string | `"image-pull-secret-docker"` |  |
| observability.tempo.global.imagePullSecrets[1].name | string | `"image-pull-secret-ghcr"` |  |
| observability.tempo.global.imagePullSecrets[2].name | string | `"image-pull-secret-harbor"` |  |
| observability.victoria-metrics-single.global.imagePullSecrets[0].name | string | `"image-pull-secret-docker"` |  |
| observability.victoria-metrics-single.global.imagePullSecrets[1].name | string | `"image-pull-secret-ghcr"` |  |
| observability.victoria-metrics-single.global.imagePullSecrets[2].name | string | `"image-pull-secret-harbor"` |  |
| observability.victoria-metrics-single.server.persistentVolume.size | string | `"10Gi"` |  |
| observability.victoria-metrics-single.server.persistentVolume.storageClass | string | `""` |  |
| observability.victoria-metrics-single.server.resources | object | `{}` |  |
| portal.enabled | bool | `true` |  |
| portal.image.pullSecrets[0] | string | `"image-pull-secret-docker"` |  |
| portal.image.pullSecrets[1] | string | `"image-pull-secret-ghcr"` |  |
| portal.image.pullSecrets[2] | string | `"image-pull-secret-harbor"` |  |
| portal.podAnnotations."prometheus.io/path" | string | `"/portal-metrics"` |  |
| portal.podAnnotations."prometheus.io/port" | string | `"3000"` |  |
| portal.podAnnotations."prometheus.io/scrape" | string | `"true"` |  |
| portal.podLabels."app.kubernetes.io/component" | string | `"portal"` |  |
| support.enabled | bool | `true` |  |
| support.ingress-nginx.controller.resources | object | `{}` |  |
| support.ingress-nginx.imagePullSecrets[0].name | string | `"image-pull-secret-docker"` |  |
| support.ingress-nginx.imagePullSecrets[1].name | string | `"image-pull-secret-ghcr"` |  |
| support.ingress-nginx.imagePullSecrets[2].name | string | `"image-pull-secret-harbor"` |  |
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
| support.redis.image.pullSecrets[0].name | string | `"image-pull-secret-docker"` |  |
| support.redis.image.pullSecrets[1].name | string | `"image-pull-secret-ghcr"` |  |
| support.redis.image.pullSecrets[2].name | string | `"image-pull-secret-harbor"` |  |
| support.redis.persistence.enabled | bool | `true` |  |
| support.redis.persistence.size | string | `"1Gi"` |  |
| support.redis.resources.limits.cpu | string | `"200m"` |  |
| support.redis.resources.limits.memory | string | `"256Mi"` |  |
| support.redis.resources.requests.cpu | string | `"100m"` |  |
| support.redis.resources.requests.memory | string | `"128Mi"` |  |
| support.reloader.enabled | bool | `true` |  |
| thegraph.enabled | bool | `true` |  |
| thegraph.graph-node.blockIngestorGroupName | string | `"combined"` |  |
| thegraph.graph-node.grafana.dashboards | bool | `false` | Enable creation of Grafana dashboards. [Grafana chart](https://github.com/grafana/helm-charts/tree/main/charts/grafana#grafana-helm-chart) must be configured to search this namespace, see `sidecar.dashboards.searchNamespace` |
| thegraph.graph-node.graphNodeDefaults.imagePullSecrets[0].name | string | `"image-pull-secret-docker"` |  |
| thegraph.graph-node.graphNodeDefaults.imagePullSecrets[1].name | string | `"image-pull-secret-ghcr"` |  |
| thegraph.graph-node.graphNodeDefaults.imagePullSecrets[2].name | string | `"image-pull-secret-harbor"` |  |
| thegraph.graph-node.graphNodeGroups.block-ingestor.enabled | bool | `false` |  |
| thegraph.graph-node.graphNodeGroups.block-ingestor.podAnnotations."prometheus.io/path" | string | `"/metrics"` |  |
| thegraph.graph-node.graphNodeGroups.block-ingestor.podAnnotations."prometheus.io/port" | string | `"8040"` |  |
| thegraph.graph-node.graphNodeGroups.block-ingestor.podAnnotations."prometheus.io/scrape" | string | `"true"` |  |
| thegraph.graph-node.graphNodeGroups.block-ingestor.replicaCount | int | `1` |  |
| thegraph.graph-node.graphNodeGroups.combined.enabled | bool | `true` |  |
| thegraph.graph-node.graphNodeGroups.combined.env.node_role | string | `"combined-mode"` |  |
| thegraph.graph-node.graphNodeGroups.combined.includeInIndexPools[0] | string | `"default"` |  |
| thegraph.graph-node.graphNodeGroups.combined.podAnnotations."prometheus.io/path" | string | `"/metrics"` |  |
| thegraph.graph-node.graphNodeGroups.combined.podAnnotations."prometheus.io/port" | string | `"8040"` |  |
| thegraph.graph-node.graphNodeGroups.combined.podAnnotations."prometheus.io/scrape" | string | `"true"` |  |
| thegraph.graph-node.graphNodeGroups.combined.replicaCount | int | `1` |  |
| thegraph.graph-node.graphNodeGroups.index.enabled | bool | `false` |  |
| thegraph.graph-node.graphNodeGroups.index.podAnnotations."prometheus.io/path" | string | `"/metrics"` |  |
| thegraph.graph-node.graphNodeGroups.index.podAnnotations."prometheus.io/port" | string | `"8040"` |  |
| thegraph.graph-node.graphNodeGroups.index.podAnnotations."prometheus.io/scrape" | string | `"true"` |  |
| thegraph.graph-node.graphNodeGroups.index.replicaCount | int | `1` |  |
| thegraph.graph-node.graphNodeGroups.query.enabled | bool | `false` |  |
| thegraph.graph-node.graphNodeGroups.query.podAnnotations."prometheus.io/path" | string | `"/metrics"` |  |
| thegraph.graph-node.graphNodeGroups.query.podAnnotations."prometheus.io/port" | string | `"8040"` |  |
| thegraph.graph-node.graphNodeGroups.query.podAnnotations."prometheus.io/scrape" | string | `"true"` |  |
| thegraph.graph-node.graphNodeGroups.query.replicaCount | int | `1` |  |
| thegraph.graph-node.ingress.hosts[0].host | string | `"graph.k8s.orb.local"` |  |
| thegraph.graph-node.ingress.hosts[0].paths[0].path | string | `"/(.*)"` |  |
| thegraph.graph-node.ingress.hosts[0].paths[0].pathType | string | `"ImplementationSpecific"` |  |
| thegraph.graph-node.ingress.hosts[0].paths[0].port | int | `8000` |  |
| thegraph.graph-node.ingress.hosts[0].paths[0].serviceName | string | `"graph-node-combined"` |  |
| thegraph.graph-node.ingress.hosts[0].paths[1].path | string | `"/ws/?(.*)"` |  |
| thegraph.graph-node.ingress.hosts[0].paths[1].pathType | string | `"ImplementationSpecific"` |  |
| thegraph.graph-node.ingress.hosts[0].paths[1].port | int | `8001` |  |
| thegraph.graph-node.ingress.hosts[0].paths[1].serviceName | string | `"graph-node-combined"` |  |
| thegraph.graph-node.ingress.hosts[0].paths[2].path | string | `"/admin/?(.*)"` |  |
| thegraph.graph-node.ingress.hosts[0].paths[2].pathType | string | `"ImplementationSpecific"` |  |
| thegraph.graph-node.ingress.hosts[0].paths[2].port | int | `8020` |  |
| thegraph.graph-node.ingress.hosts[0].paths[2].serviceName | string | `"graph-node-combined"` |  |
| thegraph.graph-node.ingress.hosts[0].paths[3].path | string | `"/indexer/?(.*)"` |  |
| thegraph.graph-node.ingress.hosts[0].paths[3].pathType | string | `"ImplementationSpecific"` |  |
| thegraph.graph-node.ingress.hosts[0].paths[3].port | int | `8030` |  |
| thegraph.graph-node.ingress.hosts[0].paths[3].serviceName | string | `"graph-node-combined"` |  |
| thegraph.graph-node.ingress.hosts[0].paths[4].path | string | `"/graphman/?(.*)"` |  |
| thegraph.graph-node.ingress.hosts[0].paths[4].pathType | string | `"ImplementationSpecific"` |  |
| thegraph.graph-node.ingress.hosts[0].paths[4].port | int | `8050` |  |
| thegraph.graph-node.ingress.hosts[0].paths[4].serviceName | string | `"graph-node-combined"` |  |
| thegraph.job.enabled | bool | `true` |  |
| thegraph.job.fullnameOverride | string | `"graph"` |  |
| thegraph.job.workspace.size | string | `"1Gi"` |  |
| txsigner.config.derivationPath | string | `"m/44'/60'/0'/0/0"` |  |
| txsigner.config.mnemonic | string | `"gate yellow grunt wrestle disease obtain mixed nature mansion tape purchase awful"` |  |
| txsigner.enabled | bool | `true` |  |
| txsigner.image.pullSecrets[0].name | string | `"image-pull-secret-docker"` |  |
| txsigner.image.pullSecrets[1].name | string | `"image-pull-secret-ghcr"` |  |
| txsigner.image.pullSecrets[2].name | string | `"image-pull-secret-harbor"` |  |
| txsigner.postgresql | string | `"postgresql://txsigner:atk@postgresql:5432/txsigner?sslmode=disable"` |  |
| txsigner.replicaCount | int | `1` |  |
| txsigner.resources | object | `{}` |  |

# atk

![Version: 2.0.1](https://img.shields.io/badge/Version-2.0.1-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: 2.0.0](https://img.shields.io/badge/AppVersion-2.0.0-informational?style=flat-square)

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
| besu-network.besu-genesis.configServer.image.pullPolicy | string | `"IfNotPresent"` |  |
| besu-network.besu-genesis.configServer.image.repository | string | `"docker.io/nginx"` |  |
| besu-network.besu-genesis.configServer.image.tag | string | `"1.29.1-alpine"` |  |
| besu-network.besu-genesis.image.pullPolicy | string | `"IfNotPresent"` |  |
| besu-network.besu-genesis.image.repository | string | `"ghcr.io/settlemint/quorum-genesis-tool"` |  |
| besu-network.besu-genesis.image.tag | string | `"sha-49c40f5"` |  |
| besu-network.besu-node.hooks.image.pullPolicy | string | `"IfNotPresent"` |  |
| besu-network.besu-node.hooks.image.repository | string | `"ghcr.io/settlemint/quorum-genesis-tool"` |  |
| besu-network.besu-node.hooks.image.tag | string | `"sha-49c40f5"` |  |
| besu-network.besu-node.initContainers.checkConnection.image.pullPolicy | string | `"IfNotPresent"` |  |
| besu-network.besu-node.initContainers.checkConnection.image.repository | string | `"docker.io/curlimages/curl"` |  |
| besu-network.besu-node.initContainers.checkConnection.image.tag | string | `"8.16.0"` |  |
| besu-network.besu-node.initContainers.testConnection.image.pullPolicy | string | `"IfNotPresent"` |  |
| besu-network.besu-node.initContainers.testConnection.image.repository | string | `"docker.io/busybox"` |  |
| besu-network.besu-node.initContainers.testConnection.image.tag | string | `"1.37"` |  |
| besu-network.besu-node.node.image.pullPolicy | string | `"IfNotPresent"` |  |
| besu-network.besu-node.node.image.repository | string | `"docker.io/hyperledger/besu"` |  |
| besu-network.besu-node.node.image.tag | string | `"25.8.0"` |  |
| besu-network.besu-node.tessera.image.pullPolicy | string | `"IfNotPresent"` |  |
| besu-network.besu-node.tessera.image.repository | string | `"docker.io/quorumengineering/tessera"` |  |
| besu-network.besu-node.tessera.image.tag | string | `"24.4"` |  |
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
| blockscout.blockscout-stack.blockscout.image.pullPolicy | string | `"IfNotPresent"` |  |
| blockscout.blockscout-stack.blockscout.image.repository | string | `"ghcr.io/blockscout/blockscout"` |  |
| blockscout.blockscout-stack.blockscout.image.tag | string | `"9.0.2"` |  |
| blockscout.blockscout-stack.blockscout.ingress.hostname | string | `"explorer.k8s.orb.local"` |  |
| blockscout.blockscout-stack.blockscout.init.args[0] | string | `"-c"` |  |
| blockscout.blockscout-stack.blockscout.init.args[1] | string | `"echo \"Waiting for postgresql:5432...\"\nwhile ! nc -z postgresql 5432; do\n  sleep 2;\ndone;\necho \"PostgreSQL is ready!\"\n# Original command:\nbin/blockscout eval \"Elixir.Explorer.ReleaseTasks.create_and_migrate()\"\n"` |  |
| blockscout.blockscout-stack.blockscout.init.command[0] | string | `"/bin/sh"` |  |
| blockscout.blockscout-stack.blockscout.init.enabled | bool | `true` |  |
| blockscout.blockscout-stack.blockscout.resources | object | `{}` |  |
| blockscout.blockscout-stack.frontend.image.pullPolicy | string | `"IfNotPresent"` |  |
| blockscout.blockscout-stack.frontend.image.repository | string | `"ghcr.io/blockscout/frontend"` |  |
| blockscout.blockscout-stack.frontend.image.tag | string | `"v2.3.3"` |  |
| blockscout.blockscout-stack.frontend.ingress.hostname | string | `"explorer.k8s.orb.local"` |  |
| blockscout.blockscout-stack.podAnnotations."prometheus.io/path" | string | `"/metrics"` |  |
| blockscout.blockscout-stack.podAnnotations."prometheus.io/port" | string | `"4000"` |  |
| blockscout.blockscout-stack.podAnnotations."prometheus.io/scrape" | string | `"true"` |  |
| blockscout.enabled | bool | `true` |  |
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
| dapp.initContainer.tcpCheck.dependencies[4].endpoint | string | `"blockscout-frontend-svc:80"` |  |
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
| erpc.config.projects[0].upstreams[0].evm.chainId | int | `53771311147` |  |
| erpc.config.projects[0].upstreams[0].failsafe.timeout.duration | string | `"30s"` |  |
| erpc.config.projects[0].upstreams[0].id | string | `"besu-node-rpc-1"` |  |
| erpc.config.projects[0].upstreams[1].endpoint | string | `"http://besu-node-validator-1:8545"` |  |
| erpc.config.projects[0].upstreams[1].evm.chainId | int | `53771311147` |  |
| erpc.config.projects[0].upstreams[1].failsafe.timeout.duration | string | `"30s"` |  |
| erpc.config.projects[0].upstreams[1].id | string | `"besu-node-validator-1"` |  |
| erpc.config.server.httpHostV4 | string | `"0.0.0.0"` |  |
| erpc.config.server.httpPort | int | `4000` |  |
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
| erpc.initContainers.waitforit.image.pullPolicy | string | `"IfNotPresent"` |  |
| erpc.initContainers.waitforit.image.repository | string | `"ghcr.io/settlemint/btp-waitforit"` |  |
| erpc.initContainers.waitforit.image.tag | string | `"v7.7.10"` |  |
| erpc.podAnnotations."prometheus.io/port" | string | `"4001"` |  |
| erpc.podAnnotations."prometheus.io/scrape" | string | `"true"` |  |
| erpc.podLabels."app.kubernetes.io/component" | string | `"erpc"` |  |
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
| graph-node.enabled | bool | `true` |  |
| graph-node.image.pullPolicy | string | `"IfNotPresent"` |  |
| graph-node.image.repository | string | `"docker.io/graphprotocol/graph-node"` |  |
| graph-node.image.tag | string | `"v0.40.1"` |  |
| graph-node.initContainer.image.pullPolicy | string | `"IfNotPresent"` |  |
| graph-node.initContainer.image.repository | string | `"docker.io/kubesphere/kubectl"` |  |
| graph-node.initContainer.image.tag | string | `"v1.33.4"` |  |
| graph-node.initContainer.tcpCheck.dependencies[0].endpoint | string | `"{{ .Values.env.PRIMARY_SUBGRAPH_DATA_PGHOST }}:{{ .Values.env.PRIMARY_SUBGRAPH_DATA_PGPORT }}"` |  |
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
| graph-node.podAnnotations."prometheus.io/path" | string | `"/metrics"` |  |
| graph-node.podAnnotations."prometheus.io/port" | string | `"8040"` |  |
| graph-node.podAnnotations."prometheus.io/scrape" | string | `"true"` |  |
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
| portal.enabled | bool | `true` |  |
| portal.image.pullPolicy | string | `"IfNotPresent"` |  |
| portal.image.registry | string | `"ghcr.io"` |  |
| portal.image.repository | string | `"settlemint/btp-scs-portal"` |  |
| portal.image.tag | string | `"8.6.7"` |  |
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
| portal.podAnnotations."prometheus.io/path" | string | `"/portal-metrics"` |  |
| portal.podAnnotations."prometheus.io/port" | string | `"3000"` |  |
| portal.podAnnotations."prometheus.io/scrape" | string | `"true"` |  |
| portal.podLabels."app.kubernetes.io/component" | string | `"portal"` |  |
| support.enabled | bool | `true` |  |
| support.ingress-nginx.controller.image.digest | string | `""` |  |
| support.ingress-nginx.controller.image.repository | string | `"registry.k8s.io/ingress-nginx/controller"` |  |
| support.ingress-nginx.controller.image.tag | string | `"v1.13.2"` |  |
| support.ingress-nginx.controller.resources | object | `{}` |  |
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
| support.postgresql.image.registry | string | `"docker.io"` |  |
| support.postgresql.image.repository | string | `"postgres"` |  |
| support.postgresql.image.tag | string | `"17.6-alpine"` |  |
| support.redis.auth.enabled | bool | `true` |  |
| support.redis.auth.password | string | `"atk"` |  |
| support.redis.commonLabels."app.kubernetes.io/managed-by" | string | `"helm"` |  |
| support.redis.commonLabels."kots.io/app-slug" | string | `"settlemint-atk"` |  |
| support.redis.enabled | bool | `true` |  |
| support.redis.fullnameOverride | string | `"redis"` |  |
| support.redis.image.registry | string | `"docker.io"` | Redis image registry |
| support.redis.image.repository | string | `"redis"` | Redis image repository |
| support.redis.image.tag | string | `"8.2.1-alpine"` | Redis image tag |
| support.redis.persistence.enabled | bool | `true` |  |
| support.redis.persistence.size | string | `"1Gi"` |  |
| support.redis.resources.limits.cpu | string | `"200m"` |  |
| support.redis.resources.limits.memory | string | `"256Mi"` |  |
| support.redis.resources.requests.cpu | string | `"100m"` |  |
| support.redis.resources.requests.memory | string | `"128Mi"` |  |
| support.reloader.enabled | bool | `true` |  |
| support.reloader.image.repository | string | `"ghcr.io/stakater/reloader"` |  |
| support.reloader.image.tag | string | `"v1.4.8"` |  |
| txsigner.config.derivationPath | string | `"m/44'/60'/0'/0/0"` |  |
| txsigner.config.mnemonic | string | `"gate yellow grunt wrestle disease obtain mixed nature mansion tape purchase awful"` |  |
| txsigner.enabled | bool | `true` |  |
| txsigner.image.pullPolicy | string | `"IfNotPresent"` |  |
| txsigner.image.registry | string | `"ghcr.io"` |  |
| txsigner.image.repository | string | `"settlemint/btp-signer"` |  |
| txsigner.image.tag | string | `"7.15.12"` |  |
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
| txsigner.postgresql | string | `"postgresql://txsigner:atk@postgresql:5432/txsigner?sslmode=disable"` |  |
| txsigner.replicaCount | int | `1` |  |
| txsigner.resources | object | `{}` |  |
| txsigner.test.image.pullPolicy | string | `"IfNotPresent"` |  |
| txsigner.test.image.repository | string | `"docker.io/busybox"` |  |
| txsigner.test.image.tag | string | `"1.37"` |  |

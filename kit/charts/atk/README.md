# atk

![Version: 2.0.0-alpha.8](https://img.shields.io/badge/Version-2.0.0--alpha.8-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: 2.0.0-alpha.8](https://img.shields.io/badge/AppVersion-2.0.0--alpha.8-informational?style=flat-square)

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
| blockscout.blockscout.env.API_URL | string | `"https://explorer.k8s.orb.local"` |  |
| blockscout.blockscout.env.WEBAPP_URL | string | `"https://explorer.k8s.orb.local"` |  |
| blockscout.blockscout.image.repository | string | `"ghcr.io/blockscout/blockscout"` |  |
| blockscout.blockscout.ingress.className | string | `"atk-nginx"` |  |
| blockscout.blockscout.ingress.enabled | bool | `true` |  |
| blockscout.blockscout.ingress.hostname | string | `"explorer.k8s.orb.local"` |  |
| blockscout.blockscout.initContainer.tcpCheck.image.repository | string | `"ghcr.io/settlemint/btp-waitforit"` |  |
| blockscout.blockscout.openShiftRoute.enabled | bool | `false` |  |
| blockscout.blockscout.openShiftRoute.host | string | `"explorer.k8s.orb.local"` |  |
| blockscout.blockscout.resources | object | `{}` |  |
| blockscout.enabled | bool | `true` |  |
| blockscout.frontend.enabled | bool | `true` |  |
| blockscout.frontend.image.repository | string | `"ghcr.io/blockscout/frontend"` |  |
| blockscout.frontend.ingress.className | string | `"atk-nginx"` |  |
| blockscout.frontend.ingress.enabled | bool | `true` |  |
| blockscout.frontend.ingress.hostname | string | `"explorer.k8s.orb.local"` |  |
| dapp.enabled | bool | `true` |  |
| dapp.image.repository | string | `"ghcr.io/settlemint/asset-tokenization-kit"` |  |
| dapp.ingress.enabled | bool | `true` |  |
| dapp.ingress.hosts[0].host | string | `"dapp.k8s.orb.local"` |  |
| dapp.ingress.hosts[0].paths[0].path | string | `"/"` |  |
| dapp.ingress.hosts[0].paths[0].pathType | string | `"ImplementationSpecific"` |  |
| dapp.initContainer.graphQLCheck.image.registry | string | `"docker.io"` |  |
| dapp.initContainer.tcpCheck.image.repository | string | `"ghcr.io/settlemint/btp-waitforit"` |  |
| dapp.job.image.repository | string | `"docker.io/node"` | Job image repository |
| dapp.resources | object | `{}` |  |
| dapp.secretEnv.BETTER_AUTH_URL | string | `"https://dapp.k8s.orb.local"` |  |
| dapp.secretEnv.SETTLEMINT_BLOCKSCOUT_UI_ENDPOINT | string | `"https://blockscout.k8s.orb.local/"` |  |
| erpc.enabled | bool | `true` |  |
| erpc.image.registry | string | `"ghcr.io"` |  |
| erpc.ingress.className | string | `"atk-nginx"` |  |
| erpc.ingress.enabled | bool | `true` |  |
| erpc.ingress.hosts[0].host | string | `"rpc.k8s.orb.local"` |  |
| erpc.ingress.hosts[0].paths[0].path | string | `"/"` |  |
| erpc.ingress.hosts[0].paths[0].pathType | string | `"ImplementationSpecific"` |  |
| erpc.initContainer.tcpCheck.image.repository | string | `"ghcr.io/settlemint/btp-waitforit"` |  |
| erpc.openShiftRoute.enabled | bool | `false` |  |
| erpc.openShiftRoute.host | string | `"rpc.k8s.orb.local"` |  |
| erpc.resources | object | `{}` |  |
| erpc.tests.image.registry | string | `"docker.io"` |  |
| global.chainId | string | `"53771311147"` |  |
| global.chainName | string | `"ATK"` |  |
| global.datastores.blockscout.postgresql.database | string | `"blockscout"` |  |
| global.datastores.blockscout.postgresql.password | string | `"atk"` |  |
| global.datastores.blockscout.postgresql.username | string | `"blockscout"` |  |
| global.datastores.default.postgresql.database | string | `"postgres"` |  |
| global.datastores.default.postgresql.host | string | `"postgresql"` |  |
| global.datastores.default.postgresql.password | string | `"atk"` |  |
| global.datastores.default.postgresql.port | int | `5432` |  |
| global.datastores.default.postgresql.sslMode | string | `"disable"` |  |
| global.datastores.default.postgresql.username | string | `"postgres"` |  |
| global.datastores.default.redis.db | int | `0` |  |
| global.datastores.default.redis.host | string | `"redis"` |  |
| global.datastores.default.redis.password | string | `"atk"` |  |
| global.datastores.default.redis.port | int | `6379` |  |
| global.datastores.default.redis.query | string | `"dial_timeout=5s&read_timeout=2s&write_timeout=2s&pool_size=50"` |  |
| global.datastores.default.redis.username | string | `"default"` |  |
| global.datastores.erpc.redis.cacheDb | int | `0` |  |
| global.datastores.erpc.redis.sharedStateDb | int | `1` |  |
| global.datastores.graphNode.postgresql.database | string | `"thegraph"` |  |
| global.datastores.graphNode.postgresql.password | string | `"atk"` |  |
| global.datastores.graphNode.postgresql.username | string | `"thegraph"` |  |
| global.datastores.hasura.postgresql.database | string | `"hasura"` |  |
| global.datastores.hasura.postgresql.password | string | `"atk"` |  |
| global.datastores.hasura.postgresql.username | string | `"hasura"` |  |
| global.datastores.hasura.redis.cacheDb | int | `2` |  |
| global.datastores.hasura.redis.rateLimitDb | int | `3` |  |
| global.datastores.portal.postgresql.database | string | `"portal"` |  |
| global.datastores.portal.postgresql.password | string | `"atk"` |  |
| global.datastores.portal.postgresql.username | string | `"portal"` |  |
| global.datastores.portal.redis.db | int | `4` |  |
| global.datastores.txsigner.postgresql.database | string | `"txsigner"` |  |
| global.datastores.txsigner.postgresql.password | string | `"atk"` |  |
| global.datastores.txsigner.postgresql.username | string | `"txsigner"` |  |
| graph-node.enabled | bool | `true` |  |
| graph-node.image.repository | string | `"docker.io/graphprotocol/graph-node"` |  |
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
| graph-node.initContainer.image.repository | string | `"docker.io/kubesphere/kubectl"` |  |
| graph-node.initContainer.tcpCheck.image.repository | string | `"ghcr.io/settlemint/btp-waitforit"` |  |
| graph-node.openShiftRoute.enabled | bool | `false` |  |
| graph-node.openShiftRoute.host | string | `"graph.k8s.orb.local"` |  |
| hasura.enabled | bool | `true` |  |
| hasura.fullnameOverride | string | `"hasura"` |  |
| hasura.image.pullPolicy | string | `"IfNotPresent"` |  |
| hasura.image.registry | string | `"docker.io"` |  |
| hasura.image.repository | string | `"hasura/graphql-engine"` |  |
| hasura.image.tag | string | `"v2.48.3"` |  |
| hasura.ingress.hostName | string | `"hasura.k8s.orb.local"` |  |
| network.enabled | bool | `true` |  |
| network.network-bootstrapper.artifacts.predeployed.image.registry | string | `"ghcr.io"` |  |
| network.network-bootstrapper.image.repository | string | `"ghcr.io/settlemint/network-bootstrapper"` |  |
| network.network-bootstrapper.initContainer.tcpCheck.image.repository | string | `"ghcr.io/settlemint/btp-waitforit"` |  |
| network.network-nodes.image.repository | string | `"docker.io/hyperledger/besu"` |  |
| network.network-nodes.initContainer.tcpCheck.image.repository | string | `"ghcr.io/settlemint/btp-waitforit"` |  |
| network.network-nodes.persistence.size | string | `"20Gi"` |  |
| observability.alloy.alloy.resources | object | `{}` |  |
| observability.alloy.configReloader.image.registry | string | `"quay.io"` |  |
| observability.alloy.image.registry | string | `"docker.io"` |  |
| observability.enabled | bool | `true` |  |
| observability.grafana.adminPassword | string | `"atk"` |  |
| observability.grafana.adminUser | string | `"settlemint"` |  |
| observability.grafana.image.registry | string | `"docker.io"` | The Docker registry |
| observability.grafana.ingress.hosts[0] | string | `"grafana.k8s.orb.local"` |  |
| observability.grafana.sidecar.image.registry | string | `"docker.io"` |  |
| observability.kube-state-metrics.image.registry | string | `"registry.k8s.io"` |  |
| observability.kube-state-metrics.resources | object | `{}` |  |
| observability.loki.gateway.image.registry | string | `"docker.io"` |  |
| observability.loki.loki.image.registry | string | `"docker.io"` | The Docker registry |
| observability.loki.memcached.enabled | bool | `true` | Enable the built in memcached server provided by the chart |
| observability.loki.memcached.image.repository | string | `"docker.io/memcached"` | Memcached Docker image repository |
| observability.loki.memcachedExporter.image.repository | string | `"docker.io/prom/memcached-exporter"` |  |
| observability.loki.sidecar.image.repository | string | `"docker.io/kiwigrid/k8s-sidecar"` | The Docker registry and image for the k8s sidecar |
| observability.loki.singleBinary.extraEnv | object | `{}` |  |
| observability.loki.singleBinary.persistence.size | string | `"10Gi"` |  |
| observability.loki.singleBinary.resources | object | `{}` |  |
| observability.metrics-server.enabled | bool | `true` |  |
| observability.metrics-server.image.repository | string | `"registry.k8s.io/metrics-server/metrics-server"` |  |
| observability.metrics-server.resources | object | `{}` |  |
| observability.prometheus-node-exporter.image.registry | string | `"quay.io"` |  |
| observability.tempo.server.resources | object | `{}` |  |
| observability.tempo.tempo.repository | string | `"docker.io/grafana/tempo"` |  |
| observability.tempo.tempoQuery.repository | string | `"docker.io/grafana/tempo-query"` |  |
| observability.victoria-metrics-single.server.image.registry | string | `"docker.io"` |  |
| observability.victoria-metrics-single.server.persistentVolume.size | string | `"10Gi"` |  |
| observability.victoria-metrics-single.server.persistentVolume.storageClass | string | `""` |  |
| observability.victoria-metrics-single.server.resources | object | `{}` |  |
| portal.enabled | bool | `true` |  |
| portal.image.registry | string | `"ghcr.io"` |  |
| portal.ingress.hostname | string | `"portal.k8s.orb.local"` |  |
| portal.initContainer.tcpCheck.image.repository | string | `"ghcr.io/settlemint/btp-waitforit"` |  |
| support.enabled | bool | `true` |  |
| support.ingress-nginx.controller.image.repository | string | `"registry.k8s.io/ingress-nginx/controller"` |  |
| support.ingress-nginx.controller.resources | object | `{}` |  |
| support.ingress-nginx.enabled | bool | `true` |  |
| support.ingress-nginx.replicaCount | int | `1` |  |
| support.minio.enabled | bool | `true` |  |
| support.minio.image.repository | string | `"docker.io/minio/minio"` |  |
| support.minio.ingress.enabled | bool | `true` |  |
| support.minio.ingress.hosts[0] | string | `"minio.k8s.orb.local"` |  |
| support.minio.ingress.ingressClassName | string | `"atk-nginx"` |  |
| support.minio.ingress.path | string | `"/"` |  |
| support.minio.mcImage.repository | string | `"docker.io/minio/minio"` |  |
| support.postgresql.enabled | bool | `true` |  |
| support.postgresql.image.registry | string | `"docker.io"` |  |
| support.redis.auth.enabled | bool | `true` |  |
| support.redis.auth.password | string | `"atk"` |  |
| support.redis.commonLabels."app.kubernetes.io/managed-by" | string | `"helm"` |  |
| support.redis.commonLabels."kots.io/app-slug" | string | `"settlemint-atk"` |  |
| support.redis.enabled | bool | `true` |  |
| support.redis.fullnameOverride | string | `"redis"` |  |
| support.redis.image.registry | string | `"docker.io"` | Redis image registry |
| support.redis.persistence.enabled | bool | `true` |  |
| support.redis.persistence.size | string | `"1Gi"` |  |
| support.redis.resources.limits.cpu | string | `"200m"` |  |
| support.redis.resources.limits.memory | string | `"256Mi"` |  |
| support.redis.resources.requests.cpu | string | `"100m"` |  |
| support.redis.resources.requests.memory | string | `"128Mi"` |  |
| support.reloader.enabled | bool | `true` |  |
| support.reloader.image.repository | string | `"ghcr.io/stakater/reloader"` |  |
| txsigner.config.derivationPath | string | `"m/44'/60'/0'/0/0"` |  |
| txsigner.config.mnemonic | string | `"gate yellow grunt wrestle disease obtain mixed nature mansion tape purchase awful"` |  |
| txsigner.enabled | bool | `true` |  |
| txsigner.image.registry | string | `"ghcr.io"` |  |
| txsigner.ingress.enabled | bool | `false` |  |
| txsigner.ingress.hostname | string | `"txsigner.k8s.orb.local"` |  |
| txsigner.initContainer.tcpCheck.image.repository | string | `"ghcr.io/settlemint/btp-waitforit"` |  |
| txsigner.resources | object | `{}` |  |
| txsigner.tests.image.registry | string | `"docker.io"` |  |

## Maintainers

| Name | Email | Url |
| ---- | ------ | --- |
| SettleMint | <support@settlemint.com> | <https://settlemint.com> |

## Requirements

| Repository | Name | Version |
|------------|------|---------|
|  | blockscout | 2.0.0-alpha.8 |
|  | dapp | 2.0.0-alpha.8 |
|  | erpc | 2.0.0-alpha.8 |
|  | graph-node | 2.0.0-alpha.8 |
|  | hasura | 2.0.0-alpha.8 |
|  | network | 2.0.0-alpha.8 |
|  | observability | 2.0.0-alpha.8 |
|  | portal | 2.0.0-alpha.8 |
|  | support | 2.0.0-alpha.8 |
|  | txsigner | 2.0.0-alpha.8 |

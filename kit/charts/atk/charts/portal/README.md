# portal

![Version: 0.1.0](https://img.shields.io/badge/Version-0.1.0-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: 1.16.0](https://img.shields.io/badge/AppVersion-1.16.0-informational?style=flat-square)

A Helm chart for Kubernetes

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| affinity | object | `{}` |  |
| autoscaling.enabled | bool | `false` |  |
| autoscaling.maxReplicas | int | `100` |  |
| autoscaling.minReplicas | int | `1` |  |
| autoscaling.targetCPUUtilizationPercentage | int | `80` |  |
| fullnameOverride | string | `"portal"` |  |
| image.pullPolicy | string | `"IfNotPresent"` |  |
| image.repository | string | `"ghcr.io/settlemint/btp-scs-portal"` |  |
| image.tag | string | `"8.5.5"` |  |
| imagePullSecrets | list | `[]` |  |
| ingress.annotations | object | `{}` |  |
| ingress.className | string | `"settlemint-nginx"` |  |
| ingress.enabled | bool | `true` |  |
| ingress.hosts[0].host | string | `"portal.k8s.orb.local"` |  |
| ingress.hosts[0].paths[0].path | string | `"/"` |  |
| ingress.hosts[0].paths[0].pathType | string | `"ImplementationSpecific"` |  |
| ingress.hosts[0].paths[0].port | int | `3000` |  |
| ingress.hosts[0].paths[1].path | string | `"/graphql"` |  |
| ingress.hosts[0].paths[1].pathType | string | `"ImplementationSpecific"` |  |
| ingress.hosts[0].paths[1].port | int | `3001` |  |
| ingress.tls | list | `[]` |  |
| initContainers | string | `nil` |  |
| livenessProbe.tcpSocket.port | string | `"http"` |  |
| nameOverride | string | `""` |  |
| network.networkId | string | `"53771311147"` |  |
| network.networkName | string | `"ATK"` |  |
| network.nodeRpcUrl | string | `"http://txsigner:3000"` |  |
| networkPolicy.egress[0].ports[0].port | int | `53` |  |
| networkPolicy.egress[0].ports[0].protocol | string | `"UDP"` |  |
| networkPolicy.egress[0].to[0].namespaceSelector | object | `{}` |  |
| networkPolicy.egress[0].to[0].podSelector.matchLabels.k8s-app | string | `"kube-dns"` |  |
| networkPolicy.egress[1].ports[0].port | int | `5432` |  |
| networkPolicy.egress[1].ports[0].protocol | string | `"TCP"` |  |
| networkPolicy.egress[1].to[0].podSelector.matchLabels."app.kubernetes.io/name" | string | `"postgresql-ha"` |  |
| networkPolicy.egress[2].ports[0].port | int | `6379` |  |
| networkPolicy.egress[2].ports[0].protocol | string | `"TCP"` |  |
| networkPolicy.egress[2].to[0].podSelector.matchLabels."app.kubernetes.io/name" | string | `"redis"` |  |
| networkPolicy.egress[3].ports[0].port | int | `443` |  |
| networkPolicy.egress[3].ports[0].protocol | string | `"TCP"` |  |
| networkPolicy.egress[3].to[0].namespaceSelector | object | `{}` |  |
| networkPolicy.enabled | bool | `false` |  |
| networkPolicy.ingress[0].from[0].namespaceSelector.matchLabels."kubernetes.io/metadata.name" | string | `"ingress-nginx"` |  |
| networkPolicy.ingress[0].ports[0].port | int | `3000` |  |
| networkPolicy.ingress[0].ports[0].protocol | string | `"TCP"` |  |
| networkPolicy.ingress[0].ports[1].port | int | `3001` |  |
| networkPolicy.ingress[0].ports[1].protocol | string | `"TCP"` |  |
| networkPolicy.ingress[1].from[0].podSelector.matchLabels."app.kubernetes.io/name" | string | `"dapp"` |  |
| networkPolicy.ingress[1].ports[0].port | int | `3000` |  |
| networkPolicy.ingress[1].ports[0].protocol | string | `"TCP"` |  |
| networkPolicy.ingress[1].ports[1].port | int | `3001` |  |
| networkPolicy.ingress[1].ports[1].protocol | string | `"TCP"` |  |
| networkPolicy.ingress[2].from[0].podSelector | object | `{}` |  |
| networkPolicy.ingress[2].ports[0].port | int | `3000` |  |
| networkPolicy.ingress[2].ports[0].protocol | string | `"TCP"` |  |
| networkPolicy.ingress[2].ports[1].port | int | `3001` |  |
| networkPolicy.ingress[2].ports[1].protocol | string | `"TCP"` |  |
| nodeSelector | object | `{}` |  |
| podAnnotations | object | `{}` |  |
| podDisruptionBudget.enabled | bool | `false` |  |
| podDisruptionBudget.minAvailable | int | `1` |  |
| podLabels | object | `{}` |  |
| podSecurityContext | object | `{}` |  |
| postgresql | string | `"postgresql://portal:atk@postgresql-pgpool:5432/portal?sslmode=disable"` |  |
| readinessProbe.tcpSocket.port | string | `"http"` |  |
| redis.host | string | `"redis-master"` |  |
| redis.password | string | `"atk"` |  |
| redis.port | int | `6379` |  |
| redis.username | string | `"default"` |  |
| replicaCount | int | `1` |  |
| resources | object | `{}` |  |
| securityContext | object | `{}` |  |
| service.graphqlPort | int | `3001` |  |
| service.port | int | `3000` |  |
| service.type | string | `"ClusterIP"` |  |
| serviceAccount.annotations | object | `{}` |  |
| serviceAccount.automount | bool | `false` |  |
| serviceAccount.create | bool | `true` |  |
| serviceAccount.name | string | `""` |  |
| tests.image.pullPolicy | string | `"IfNotPresent"` |  |
| tests.image.registry | string | `"docker.io"` |  |
| tests.image.repository | string | `"busybox"` |  |
| tests.image.tag | string | `"1.37.0"` |  |
| tolerations | list | `[]` |  |
| volumeMounts | list | `[]` |  |
| volumes | list | `[]` |  |

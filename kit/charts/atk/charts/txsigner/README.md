# txsigner

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
| fullnameOverride | string | `"txsigner"` |  |
| image.pullPolicy | string | `"IfNotPresent"` |  |
| image.repository | string | `"ghcr.io/settlemint/btp-signer"` |  |
| image.tag | string | `"7.13.0"` |  |
| imagePullSecrets[0].name | string | `"image-pull-secret-docker"` |  |
| imagePullSecrets[1].name | string | `"image-pull-secret-ghcr"` |  |
| imagePullSecrets[2].name | string | `"image-pull-secret-harbor"` |  |
| ingress.annotations | object | `{}` |  |
| ingress.className | string | `""` |  |
| ingress.enabled | bool | `false` |  |
| ingress.hosts[0].host | string | `"chart-example.local"` |  |
| ingress.hosts[0].paths[0].path | string | `"/"` |  |
| ingress.hosts[0].paths[0].pathType | string | `"ImplementationSpecific"` |  |
| ingress.tls | list | `[]` |  |
| initContainers[0].command[0] | string | `"/usr/bin/wait-for-it"` |  |
| initContainers[0].command[1] | string | `"postgresql-pgpool:5432"` |  |
| initContainers[0].command[2] | string | `"-t"` |  |
| initContainers[0].command[3] | string | `"0"` |  |
| initContainers[0].image | string | `"ghcr.io/settlemint/btp-waitforit:v7.7.5"` |  |
| initContainers[0].name | string | `"wait-for-postgres"` |  |
| livenessProbe.failureThreshold | int | `30` |  |
| livenessProbe.initialDelaySeconds | int | `1` |  |
| livenessProbe.periodSeconds | int | `10` |  |
| livenessProbe.successThreshold | int | `1` |  |
| livenessProbe.tcpSocket.port | string | `"txsigner"` |  |
| livenessProbe.timeoutSeconds | int | `5` |  |
| nameOverride | string | `""` |  |
| network.nodeRpcUrl | string | `"http://erpc:4000"` |  |
| networkPolicy.egress[0].ports[0].port | int | `53` |  |
| networkPolicy.egress[0].ports[0].protocol | string | `"UDP"` |  |
| networkPolicy.egress[0].to[0].namespaceSelector | object | `{}` |  |
| networkPolicy.egress[0].to[0].podSelector.matchLabels.k8s-app | string | `"kube-dns"` |  |
| networkPolicy.egress[1].ports[0].port | int | `5432` |  |
| networkPolicy.egress[1].ports[0].protocol | string | `"TCP"` |  |
| networkPolicy.egress[1].to[0].podSelector.matchLabels."app.kubernetes.io/name" | string | `"postgresql-ha"` |  |
| networkPolicy.egress[2].ports[0].port | int | `8545` |  |
| networkPolicy.egress[2].ports[0].protocol | string | `"TCP"` |  |
| networkPolicy.egress[2].ports[1].port | int | `8546` |  |
| networkPolicy.egress[2].ports[1].protocol | string | `"TCP"` |  |
| networkPolicy.egress[2].to[0].podSelector.matchLabels."app.kubernetes.io/name" | string | `"besu-statefulset"` |  |
| networkPolicy.egress[3].ports[0].port | int | `4000` |  |
| networkPolicy.egress[3].ports[0].protocol | string | `"TCP"` |  |
| networkPolicy.egress[3].to[0].podSelector.matchLabels."app.kubernetes.io/name" | string | `"erpc"` |  |
| networkPolicy.enabled | bool | `false` |  |
| networkPolicy.ingress[0].from[0].podSelector.matchLabels."app.kubernetes.io/name" | string | `"portal"` |  |
| networkPolicy.ingress[0].ports[0].port | int | `3000` |  |
| networkPolicy.ingress[0].ports[0].protocol | string | `"TCP"` |  |
| networkPolicy.ingress[1].from[0].podSelector.matchLabels."app.kubernetes.io/name" | string | `"dapp"` |  |
| networkPolicy.ingress[1].ports[0].port | int | `3000` |  |
| networkPolicy.ingress[1].ports[0].protocol | string | `"TCP"` |  |
| networkPolicy.ingress[2].from[0].podSelector | object | `{}` |  |
| networkPolicy.ingress[2].ports[0].port | int | `3000` |  |
| networkPolicy.ingress[2].ports[0].protocol | string | `"TCP"` |  |
| nodeSelector | object | `{}` |  |
| podAnnotations | object | `{}` |  |
| podDisruptionBudget.enabled | bool | `false` |  |
| podDisruptionBudget.minAvailable | int | `1` |  |
| podLabels | object | `{}` |  |
| podSecurityContext.fsGroup | int | `2016` |  |
| podSecurityContext.runAsNonRoot | bool | `true` |  |
| podSecurityContext.runAsUser | int | `2016` |  |
| postgresql | string | `"postgresql://txsigner:atk@postgresql-pgpool:5432/txsigner?sslmode=disable"` |  |
| privateKey.derivationPath | string | `""` |  |
| privateKey.existingSecret | string | `""` |  |
| privateKey.mnemonic | string | `""` |  |
| readinessProbe.failureThreshold | int | `60` |  |
| readinessProbe.initialDelaySeconds | int | `1` |  |
| readinessProbe.periodSeconds | int | `5` |  |
| readinessProbe.successThreshold | int | `1` |  |
| readinessProbe.tcpSocket.port | string | `"txsigner"` |  |
| readinessProbe.timeoutSeconds | int | `5` |  |
| replicaCount | int | `1` |  |
| resources | object | `{}` |  |
| securityContext.allowPrivilegeEscalation | bool | `false` |  |
| securityContext.capabilities.drop[0] | string | `"ALL"` |  |
| securityContext.readOnlyRootFilesystem | bool | `true` |  |
| securityContext.runAsNonRoot | bool | `true` |  |
| securityContext.runAsUser | int | `2016` |  |
| service.port | int | `3000` |  |
| service.type | string | `"ClusterIP"` |  |
| serviceAccount.annotations | object | `{}` |  |
| serviceAccount.automount | bool | `true` |  |
| serviceAccount.create | bool | `true` |  |
| serviceAccount.name | string | `""` |  |
| tests.image.pullPolicy | string | `"IfNotPresent"` |  |
| tests.image.registry | string | `"docker.io"` |  |
| tests.image.repository | string | `"busybox"` |  |
| tests.image.tag | string | `"1.37.0"` |  |
| tolerations | list | `[]` |  |
| volumeMounts[0].mountPath | string | `"/signer/.cache"` |  |
| volumeMounts[0].name | string | `"tx-signer-cache"` |  |
| volumes[0].emptyDir | object | `{}` |  |
| volumes[0].name | string | `"tx-signer-cache"` |  |

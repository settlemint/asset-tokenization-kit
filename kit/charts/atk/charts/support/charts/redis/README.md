# redis

![Version: 0.1.0](https://img.shields.io/badge/Version-0.1.0-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: 8.0.3](https://img.shields.io/badge/AppVersion-8.0.3-informational?style=flat-square)

A simple Redis deployment for development environments

## Maintainers

| Name | Email | Url |
| ---- | ------ | --- |
| SettleMint | <support@settlemint.com> | <https://settlemint.com> |

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| affinity | object | `{}` | Affinity |
| auth.enabled | bool | `true` | Enable authentication |
| auth.password | string | `"atk"` | Redis password |
| commonAnnotations | object | `{}` | Annotations to add to all deployed objects |
| commonLabels | object | `{}` | Labels to add to all deployed objects |
| config.appendonly | string | `"no"` | Append only file (AOF persistence) |
| config.maxmemory | string | `"256mb"` | Maximum memory Redis can use |
| config.maxmemoryPolicy | string | `"allkeys-lru"` | Memory eviction policy |
| config.save | string | `""` | Save DB to disk (RDB persistence) |
| containerSecurityContext | object | `{"allowPrivilegeEscalation":false,"capabilities":{"drop":["ALL"]},"readOnlyRootFilesystem":false,"runAsGroup":999,"runAsNonRoot":true,"runAsUser":999,"seccompProfile":{"type":"RuntimeDefault"}}` | Container security context |
| fullnameOverride | string | `""` | String to fully override common.names.fullname |
| global | object | `{"imagePullSecrets":[],"imageRegistry":"","storageClass":""}` | Global Docker image registry |
| global.imagePullSecrets | list | `[]` | Global Docker registry secret names as an array |
| global.imageRegistry | string | `""` | Global Docker image registry |
| global.storageClass | string | `""` | Global StorageClass for Persistent Volume(s) |
| image.pullPolicy | string | `"IfNotPresent"` | Redis image pull policy |
| image.pullSecrets | list | `[]` | Redis image pull secrets |
| image.registry | string | `"docker.io"` | Redis image registry |
| image.repository | string | `"redis"` | Redis image repository |
| image.tag | string | `"8.2.1-alpine"` | Redis image tag |
| livenessProbe.enabled | bool | `true` | Enable liveness probe |
| livenessProbe.failureThreshold | int | `3` | Failure threshold |
| livenessProbe.initialDelaySeconds | int | `30` | Initial delay seconds |
| livenessProbe.periodSeconds | int | `10` | Period seconds |
| livenessProbe.successThreshold | int | `1` | Success threshold |
| livenessProbe.timeoutSeconds | int | `5` | Timeout seconds |
| nameOverride | string | `""` | String to partially override common.names.fullname |
| networkPolicy.allowedNamespaceSelectors | list | `[]` | Additional allowed namespace selectors |
| networkPolicy.allowedPodSelectors | list | `[]` | Additional allowed pod selectors |
| networkPolicy.enabled | bool | `false` | Enable network policies |
| nodeSelector | object | `{}` | Node selector |
| persistence.accessModes | list | `["ReadWriteOnce"]` | Access mode for the PVC |
| persistence.annotations | object | `{}` | Annotations for the PVC |
| persistence.enabled | bool | `true` | Enable persistence using PVC |
| persistence.size | string | `"1Gi"` | Size of the PVC |
| persistence.storageClass | string | `""` | Storage class for the PVC |
| podAnnotations | object | `{}` | Pod annotations |
| podLabels | object | `{}` | Pod labels |
| podSecurityContext | object | `{"fsGroup":999,"runAsNonRoot":true,"runAsUser":999,"seccompProfile":{"type":"RuntimeDefault"}}` | Pod security context |
| readinessProbe.enabled | bool | `true` | Enable readiness probe |
| readinessProbe.failureThreshold | int | `3` | Failure threshold |
| readinessProbe.initialDelaySeconds | int | `5` | Initial delay seconds |
| readinessProbe.periodSeconds | int | `10` | Period seconds |
| readinessProbe.successThreshold | int | `1` | Success threshold |
| readinessProbe.timeoutSeconds | int | `5` | Timeout seconds |
| replicaCount | int | `1` | Number of Redis replicas (should be 1 for development) |
| resources.limits | object | `{"cpu":"200m","memory":"256Mi"}` | Resource limits |
| resources.requests | object | `{"cpu":"100m","memory":"128Mi"}` | Resource requests |
| service.annotations | object | `{}` | Service annotations |
| service.labels | object | `{}` | Service labels |
| service.port | int | `6379` | Redis port |
| service.type | string | `"ClusterIP"` | Service type |
| tolerations | list | `[]` | Tolerations |

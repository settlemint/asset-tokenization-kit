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
| affinity | object | `{}` | Affinity (object) |
| auth.enabled | bool | `true` | Enable authentication (bool) |
| auth.password | string | `"atk"` | Redis password (string) |
| commonAnnotations | object | `{}` | Annotations to add to all deployed objects (object) |
| commonLabels | object | `{}` | Labels to add to all deployed objects (object) |
| config.appendonly | string | `"no"` | Append only file (AOF persistence) |
| config.maxmemory | string | `"256mb"` | Maximum memory Redis can use (int) |
| config.maxmemoryPolicy | string | `"allkeys-lru"` | Memory eviction policy (string) |
| config.save | string | `""` | Save DB to disk (RDB persistence) |
| containerSecurityContext | object | `{"allowPrivilegeEscalation":false,"capabilities":{"drop":["ALL"]},"readOnlyRootFilesystem":false,"runAsGroup":999,"runAsNonRoot":true,"runAsUser":999,"seccompProfile":{"type":"RuntimeDefault"}}` | Container security context (object) |
| fullnameOverride | string | `""` | String to fully override common.names.fullname (string) |
| global | object | `{"imagePullSecrets":[],"imageRegistry":"","storageClass":""}` | Global Docker image registry (object) |
| global.imagePullSecrets | list | `[]` | Global Docker registry secret names as an array (list) |
| global.imageRegistry | string | `""` | Global Docker image registry (object) |
| global.storageClass | string | `""` | Global StorageClass for Persistent Volume(s) |
| image.pullPolicy | string | `"IfNotPresent"` | Redis image pull policy (object) |
| image.pullSecrets | list | `[]` | Redis image pull secrets (list) |
| image.registry | string | `"docker.io"` | Redis image registry (object) |
| image.repository | string | `"redis"` | Redis image repository (object) |
| image.tag | string | `"8.2.1-alpine"` | Redis image tag (object) |
| livenessProbe.enabled | bool | `true` | Enable liveness probe (bool) |
| livenessProbe.failureThreshold | int | `3` | Failure threshold (int) |
| livenessProbe.initialDelaySeconds | int | `30` | Initial delay seconds (int) |
| livenessProbe.periodSeconds | int | `10` | Period seconds (int) |
| livenessProbe.successThreshold | int | `1` | Success threshold (int) |
| livenessProbe.timeoutSeconds | int | `5` | Timeout seconds (int) |
| nameOverride | string | `""` | String to partially override common.names.fullname (string) |
| networkPolicy.allowedNamespaceSelectors | list | `[]` | Additional allowed namespace selectors (list) |
| networkPolicy.allowedPodSelectors | list | `[]` | Additional allowed pod selectors (list) |
| networkPolicy.enabled | bool | `false` | Enable network policies (bool) |
| nodeSelector | object | `{}` | Node selector (object) |
| persistence.accessModes | list | `["ReadWriteOnce"]` | Access mode for the PVC (string) |
| persistence.annotations | object | `{}` | Annotations for the PVC (object) |
| persistence.enabled | bool | `true` | Enable persistence using PVC (bool) |
| persistence.size | string | `"1Gi"` | Size of the PVC (string) |
| persistence.storageClass | string | `""` | Storage class for the PVC (string) |
| podAnnotations | object | `{}` | Pod annotations (object) |
| podLabels | object | `{}` | Pod labels (object) |
| podSecurityContext | object | `{"fsGroup":999,"runAsNonRoot":true,"runAsUser":999,"seccompProfile":{"type":"RuntimeDefault"}}` | Pod security context (object) |
| readinessProbe.enabled | bool | `true` | Enable readiness probe (bool) |
| readinessProbe.failureThreshold | int | `3` | Failure threshold (int) |
| readinessProbe.initialDelaySeconds | int | `5` | Initial delay seconds (int) |
| readinessProbe.periodSeconds | int | `10` | Period seconds (int) |
| readinessProbe.successThreshold | int | `1` | Success threshold (int) |
| readinessProbe.timeoutSeconds | int | `5` | Timeout seconds (int) |
| replicaCount | int | `1` | Number of Redis replicas (should be 1 for development) |
| resources.limits | object | `{"cpu":"200m","memory":"256Mi"}` | Resource limits (object) |
| resources.requests | object | `{"cpu":"100m","memory":"128Mi"}` | Resource requests (object) |
| service.annotations | object | `{}` | Service annotations (object) |
| service.labels | object | `{}` | Service labels (object) |
| service.port | int | `6379` | Redis port (int) |
| service.type | string | `"ClusterIP"` | Service type (object) |
| tolerations | list | `[]` | Tolerations (list) |

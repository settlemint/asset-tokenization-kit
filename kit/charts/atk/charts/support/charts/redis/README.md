# redis

![Version: 2.0.0-alpha.9](https://img.shields.io/badge/Version-2.0.0--alpha.9-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: 2.0.0-alpha.9](https://img.shields.io/badge/AppVersion-2.0.0--alpha.9-informational?style=flat-square)

A simple Redis deployment for development environments

## Maintainers

| Name | Email | Url |
| ---- | ------ | --- |
| SettleMint | <support@settlemint.com> | <https://settlemint.com> |

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| affinity | object | `{}` | Affinity (object) |
| auth | object | `{"enabled":true,"password":"atk"}` | Authentication |
| auth.enabled | bool | `true` | Enable authentication |
| auth.password | string | `"atk"` | Redis password |
| commonAnnotations | object | `{}` | Annotations to add to all deployed objects (object) |
| commonLabels | object | `{}` | Labels to add to all deployed objects (object) |
| config | object | `{"appendonly":"no","maxmemory":"256mb","maxmemoryPolicy":"allkeys-lru","save":""}` | Redis configuration |
| config.appendonly | string | `"no"` | Append only file (AOF persistence) |
| config.maxmemory | string | `"256mb"` | Maximum memory Redis can use |
| config.maxmemoryPolicy | string | `"allkeys-lru"` | Memory eviction policy |
| config.save | string | `""` | Save DB to disk (RDB persistence) |
| containerSecurityContext | object | `{}` | Container security context (object) |
| fullnameOverride | string | `""` | String to fully override common.names.fullname (string) |
| global | object | `{"imagePullSecrets":[],"imageRegistry":"","storageClass":""}` | Global Docker image registry |
| global.imagePullSecrets | list | `[]` | Global Docker registry secret names as an array |
| global.imageRegistry | string | `""` | Global Docker image registry |
| global.storageClass | string | `""` | Global StorageClass for Persistent Volume(s) |
| image | object | `{"pullPolicy":"IfNotPresent","pullSecrets":[],"registry":"docker.io","repository":"redis","tag":"8.2.1-alpine"}` | Redis image configuration |
| image.pullPolicy | string | `"IfNotPresent"` | Redis image pull policy |
| image.pullSecrets | list | `[]` | Redis image pull secrets (list) |
| image.registry | string | `"docker.io"` | Redis image registry |
| image.repository | string | `"redis"` | Redis image repository |
| image.tag | string | `"8.2.1-alpine"` | Redis image tag |
| livenessProbe | object | `{"enabled":true,"failureThreshold":3,"initialDelaySeconds":30,"periodSeconds":10,"successThreshold":1,"timeoutSeconds":5}` | Liveness probe configuration |
| livenessProbe.enabled | bool | `true` | Enable liveness probe (bool) |
| livenessProbe.failureThreshold | int | `3` | Failure threshold (int) |
| livenessProbe.initialDelaySeconds | int | `30` | Initial delay seconds (int) |
| livenessProbe.periodSeconds | int | `10` | Period seconds (int) |
| livenessProbe.successThreshold | int | `1` | Success threshold (int) |
| livenessProbe.timeoutSeconds | int | `5` | Timeout seconds (int) |
| nameOverride | string | `""` | String to partially override common.names.fullname (string) |
| networkPolicy | object | `{"allowedNamespaceSelectors":[],"allowedPodSelectors":[],"enabled":false}` | Network policy configuration |
| networkPolicy.allowedNamespaceSelectors | list | `[]` | Additional allowed namespace selectors (list) |
| networkPolicy.allowedPodSelectors | list | `[]` | Additional allowed pod selectors (list) |
| networkPolicy.enabled | bool | `false` | Enable network policies (bool) |
| nodeSelector | object | `{}` | Node selector (object) |
| persistence | object | `{"accessModes":["ReadWriteOnce"],"annotations":{},"enabled":true,"size":"1Gi","storageClass":""}` | Persistence configuration |
| persistence.accessModes | list | `["ReadWriteOnce"]` | Access mode for the PVC |
| persistence.annotations | object | `{}` | Annotations for the PVC |
| persistence.enabled | bool | `true` | Enable persistence using PVC |
| persistence.size | string | `"1Gi"` | Size of the PVC |
| persistence.storageClass | string | `""` | Storage class for the PVC |
| podAnnotations | object | `{}` | Pod annotations (object) |
| podLabels | object | `{}` | Pod labels (object) |
| podSecurityContext | object | `{}` | Pod security context (object) |
| readinessProbe | object | `{"enabled":true,"failureThreshold":3,"initialDelaySeconds":5,"periodSeconds":10,"successThreshold":1,"timeoutSeconds":5}` | Readiness probe configuration |
| readinessProbe.enabled | bool | `true` | Enable readiness probe (bool) |
| readinessProbe.failureThreshold | int | `3` | Failure threshold (int) |
| readinessProbe.initialDelaySeconds | int | `5` | Initial delay seconds (int) |
| readinessProbe.periodSeconds | int | `10` | Period seconds (int) |
| readinessProbe.successThreshold | int | `1` | Success threshold (int) |
| readinessProbe.timeoutSeconds | int | `5` | Timeout seconds (int) |
| replicaCount | int | `1` | Number of Redis replicas (should be 1 for development) |
| resources | object | `{"limits":{"cpu":"200m","memory":"256Mi"},"requests":{"cpu":"100m","memory":"128Mi"}}` | Resources configuration |
| resources.limits | object | `{"cpu":"200m","memory":"256Mi"}` | Resource limits |
| resources.limits.cpu | string | `"200m"` | CPU limit |
| resources.limits.memory | string | `"256Mi"` | Memory limit |
| resources.requests | object | `{"cpu":"100m","memory":"128Mi"}` | Resource requests |
| resources.requests.cpu | string | `"100m"` | CPU request |
| resources.requests.memory | string | `"128Mi"` | Memory request |
| service | object | `{"annotations":{},"labels":{},"port":6379,"type":"ClusterIP"}` | Service configuration |
| service.annotations | object | `{}` | Service annotations |
| service.labels | object | `{}` | Service labels |
| service.port | int | `6379` | Redis port |
| service.type | string | `"ClusterIP"` | Service type |
| tolerations | list | `[]` | Tolerations (list) |

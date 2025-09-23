# hasura

![Version: 2.0.0-alpha.8](https://img.shields.io/badge/Version-2.0.0--alpha.8-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: 2.0.0-alpha.8](https://img.shields.io/badge/AppVersion-2.0.0--alpha.8-informational?style=flat-square)

A Helm chart for Hasura GraphQL Engine

## Maintainers

| Name | Email | Url |
| ---- | ------ | --- |
| SettleMint | <support@settlemint.com> | <https://settlemint.com> |

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| actions | object | `{"baseUrl":"","handlerWebhookBaseUrl":""}` | Action configuration |
| actions.baseUrl | string | `""` | Action base URL |
| actions.handlerWebhookBaseUrl | string | `""` | Action handler webhook base URL |
| adminSecret | object | `{"enabled":true,"existingSecret":"","existingSecretKey":"admin-secret","key":""}` | Admin secret configuration |
| adminSecret.enabled | bool | `true` | Create admin secret |
| adminSecret.existingSecret | string | `""` | Use existing secret |
| adminSecret.existingSecretKey | string | `"admin-secret"` | Key in existing secret |
| adminSecret.key | string | `""` | Admin secret key (auto-generated if empty) |
| affinity | object | `{}` | Pod affinity |
| authHook | object | `{"enabled":false,"mode":"POST","url":""}` | Authentication webhook configuration |
| authHook.enabled | bool | `false` | Enable auth webhook |
| authHook.mode | string | `"POST"` | Webhook mode (GET or POST) |
| authHook.url | string | `""` | Webhook URL |
| autoscaling | object | `{"enabled":false,"maxReplicas":10,"minReplicas":1,"targetCPUUtilizationPercentage":80,"targetMemoryUtilizationPercentage":80}` | Horizontal pod autoscaler configuration |
| autoscaling.enabled | bool | `false` | Enable HPA |
| autoscaling.maxReplicas | int | `10` | Maximum replicas |
| autoscaling.minReplicas | int | `1` | Minimum replicas |
| autoscaling.targetCPUUtilizationPercentage | int | `80` | Target CPU utilization percentage |
| autoscaling.targetMemoryUtilizationPercentage | int | `80` | Target memory utilization percentage |
| config | object | `{"corsDomain":"*","devMode":false,"disableCors":false,"enableAllowlist":false,"enableConsole":true,"enableConsoleAssets":true,"enableRemoteSchemaPermissions":false,"enableTelemetry":false,"inferFunctionPermissions":true,"logLevel":"info","schemaIntrospectionDisabled":false,"serverPort":8080,"wsKeepAlive":5}` | Hasura configuration options |
| config.corsDomain | string | `"*"` | CORS domain configuration |
| config.devMode | bool | `false` | Enable development mode |
| config.disableCors | bool | `false` | Disable CORS |
| config.enableAllowlist | bool | `false` | Enable allowlist |
| config.enableConsole | bool | `true` | Enable console |
| config.enableConsoleAssets | bool | `true` | Enable console assets (for offline usage) |
| config.enableRemoteSchemaPermissions | bool | `false` | Enable remote schema permissions |
| config.enableTelemetry | bool | `false` | Enable telemetry |
| config.inferFunctionPermissions | bool | `true` | Infer function permissions |
| config.logLevel | string | `"info"` | Log level (debug, info, warn, error) |
| config.schemaIntrospectionDisabled | bool | `false` | Enable schema introspection for specified roles |
| config.serverPort | int | `8080` | Server port |
| config.wsKeepAlive | int | `5` | WebSocket keepalive interval (seconds) |
| cronTriggers | object | `{"includeInMetadata":false}` | Cron triggers configuration |
| cronTriggers.includeInMetadata | bool | `false` | Include webhook secret in cron triggers |
| database | object | `{"connLifetime":600,"connectionUrl":"","connections":50,"enablePooling":true,"idleTimeout":180,"txIsolation":"read-committed","usePreparedStatements":true}` | Database configuration |
| database.connLifetime | int | `600` | Connection lifetime (seconds) |
| database.connectionUrl | string | `""` | Database connection string (can be set via secret) |
| database.connections | int | `50` | Maximum connections |
| database.enablePooling | bool | `true` | Enable connection pooling |
| database.idleTimeout | int | `180` | Idle timeout (seconds) |
| database.txIsolation | string | `"read-committed"` | Transaction isolation level (read-committed, repeatable-read, serializable) |
| database.usePreparedStatements | bool | `true` | Use prepared statements |
| events | object | `{"fetchInterval":10,"httpPoolSize":100}` | Events configuration |
| events.fetchInterval | int | `10` | Fetch interval for events (seconds) |
| events.httpPoolSize | int | `100` | HTTP pool size for events |
| extraEnvFrom | list | `[]` | Additional environment variables from secrets/configmaps |
| extraEnvs | list | `[]` | Additional environment variables |
| fullnameOverride | string | `""` | Override fullname for the chart |
| healthChecks | object | `{"livenessProbe":{"enabled":true,"failureThreshold":3,"initialDelaySeconds":30,"periodSeconds":10,"successThreshold":1,"timeoutSeconds":5},"readinessProbe":{"enabled":true,"failureThreshold":3,"initialDelaySeconds":10,"periodSeconds":10,"successThreshold":1,"timeoutSeconds":5},"startupProbe":{"enabled":false,"failureThreshold":30,"initialDelaySeconds":0,"periodSeconds":10,"successThreshold":1,"timeoutSeconds":5}}` | Health check configuration |
| healthChecks.livenessProbe | object | `{"enabled":true,"failureThreshold":3,"initialDelaySeconds":30,"periodSeconds":10,"successThreshold":1,"timeoutSeconds":5}` | Liveness probe configuration |
| healthChecks.livenessProbe.enabled | bool | `true` | Enable liveness probe |
| healthChecks.livenessProbe.failureThreshold | int | `3` | Failure threshold |
| healthChecks.livenessProbe.initialDelaySeconds | int | `30` | Initial delay seconds |
| healthChecks.livenessProbe.periodSeconds | int | `10` | Period seconds |
| healthChecks.livenessProbe.successThreshold | int | `1` | Success threshold |
| healthChecks.livenessProbe.timeoutSeconds | int | `5` | Timeout seconds |
| healthChecks.readinessProbe | object | `{"enabled":true,"failureThreshold":3,"initialDelaySeconds":10,"periodSeconds":10,"successThreshold":1,"timeoutSeconds":5}` | Readiness probe configuration |
| healthChecks.readinessProbe.enabled | bool | `true` | Enable readiness probe |
| healthChecks.readinessProbe.failureThreshold | int | `3` | Failure threshold |
| healthChecks.readinessProbe.initialDelaySeconds | int | `10` | Initial delay seconds |
| healthChecks.readinessProbe.periodSeconds | int | `10` | Period seconds |
| healthChecks.readinessProbe.successThreshold | int | `1` | Success threshold |
| healthChecks.readinessProbe.timeoutSeconds | int | `5` | Timeout seconds |
| healthChecks.startupProbe | object | `{"enabled":false,"failureThreshold":30,"initialDelaySeconds":0,"periodSeconds":10,"successThreshold":1,"timeoutSeconds":5}` | Startup probe configuration |
| healthChecks.startupProbe.enabled | bool | `false` | Enable startup probe |
| healthChecks.startupProbe.failureThreshold | int | `30` | Failure threshold |
| healthChecks.startupProbe.initialDelaySeconds | int | `0` | Initial delay seconds |
| healthChecks.startupProbe.periodSeconds | int | `10` | Period seconds |
| healthChecks.startupProbe.successThreshold | int | `1` | Success threshold |
| healthChecks.startupProbe.timeoutSeconds | int | `5` | Timeout seconds |
| image | object | `{"pullPolicy":"IfNotPresent","registry":"docker.io","repository":"hasura/graphql-engine","tag":"v2.48.3"}` | Hasura image configuration |
| image.pullPolicy | string | `"IfNotPresent"` | Hasura image pull policy |
| image.registry | string | `"docker.io"` | Hasura image registry |
| image.repository | string | `"hasura/graphql-engine"` | Hasura image repository |
| image.tag | string | `"v2.48.3"` | Hasura image tag |
| imagePullSecrets | list | `[]` | Docker registry secret names as an array |
| ingress | object | `{"annotations":{},"className":"atk-nginx","enabled":true,"extraHosts":[],"hostName":"hasura.k8s.orb.local","path":"/","pathType":"Prefix","tls":[]}` | Ingress configuration |
| ingress.annotations | object | `{}` | Ingress annotations |
| ingress.className | string | `"atk-nginx"` | Ingress class name |
| ingress.enabled | bool | `true` | Enable ingress |
| ingress.extraHosts | list | `[]` | Additional hosts |
| ingress.hostName | string | `"hasura.k8s.orb.local"` | Ingress hostname |
| ingress.path | string | `"/"` | Ingress path |
| ingress.pathType | string | `"Prefix"` | Ingress path type |
| ingress.tls | list | `[]` | TLS configuration |
| initContainers | list | `[]` | Init containers |
| jwtSecrets | object | `[]` | JWT secrets configuration |
| labels | object | `{}` | Labels to add to all resources |
| metadata | object | `{"databaseUrl":""}` | Metadata database configuration |
| metadata.databaseUrl | string | `""` | Metadata database URL (defaults to main database if not set) |
| monitoring | object | `{"enabled":false,"metricsSecret":"","serviceMonitor":{"enabled":false,"interval":"30s","labels":{},"namespace":"","path":"/v1/metrics","scrapeTimeout":"10s"}}` | Monitoring configuration |
| monitoring.enabled | bool | `false` | Enable Prometheus monitoring |
| monitoring.metricsSecret | string | `""` | Secret for metrics endpoint (optional) |
| monitoring.serviceMonitor | object | `{"enabled":false,"interval":"30s","labels":{},"namespace":"","path":"/v1/metrics","scrapeTimeout":"10s"}` | Service monitor configuration |
| monitoring.serviceMonitor.enabled | bool | `false` | Create ServiceMonitor resource |
| monitoring.serviceMonitor.interval | int | `"30s"` | Scrape interval |
| monitoring.serviceMonitor.labels | object | `{}` | Additional labels for ServiceMonitor |
| monitoring.serviceMonitor.namespace | string | `""` | Monitoring namespace |
| monitoring.serviceMonitor.path | string | `"/v1/metrics"` | Metrics path |
| monitoring.serviceMonitor.scrapeTimeout | int | `"10s"` | Scrape timeout |
| nameOverride | string | `""` | Override name for the chart |
| networkPolicy | object | `{"egress":[],"enabled":false,"ingress":[],"podSelector":{}}` | Network policy configuration |
| networkPolicy.egress | list | `[]` | Egress rules |
| networkPolicy.enabled | bool | `false` | Enable network policy |
| networkPolicy.ingress | list | `[]` | Ingress rules |
| networkPolicy.podSelector | list | `{}` | Pod selector match labels |
| nodeSelector | object | `{}` | Node selector |
| openShiftRoute | object | `{"alternateBackends":[],"annotations":{},"enabled":false,"host":"hasura.k8s.orb.local","path":"/","tls":null,"to":{"weight":100},"wildcardPolicy":"None"}` | OpenShift Route configuration |
| openShiftRoute.alternateBackends | list | `[]` | Alternate backends |
| openShiftRoute.annotations | object | `{}` | Route annotations |
| openShiftRoute.enabled | bool | `false` | Enable OpenShift route |
| openShiftRoute.host | string | `"hasura.k8s.orb.local"` | Route hostname |
| openShiftRoute.path | string | `"/"` | Route path |
| openShiftRoute.tls | object | `nil` | TLS configuration |
| openShiftRoute.to | object | `{"weight":100}` | Service weight configuration |
| openShiftRoute.to.weight | int | `100` | Weight for the service |
| openShiftRoute.wildcardPolicy | string | `"None"` | Wildcard policy |
| podAnnotations | object | `{}` | Pod annotations |
| podDisruptionBudget | object | `{"enabled":false,"maxUnavailable":"","minAvailable":1}` | Pod disruption budget |
| podDisruptionBudget.enabled | bool | `false` | Enable PDB |
| podDisruptionBudget.maxUnavailable | int | `""` | Maximum unavailable pods |
| podDisruptionBudget.minAvailable | int | `1` | Minimum available pods |
| podLabels | object | `{}` | Pod labels |
| podSecurityContext | object | `{}` | Pod security context |
| priorityClassName | object | `""` | Priority class configuration |
| redis | object | `{"cacheTtl":60,"cacheUrl":"","enabled":false,"rateLimitUrl":""}` | Redis configuration for caching and rate limiting |
| redis.cacheTtl | int | `60` | Cache TTL in seconds |
| redis.cacheUrl | string | `""` | Redis URL for query caching |
| redis.enabled | bool | `false` | Enable Redis integration |
| redis.rateLimitUrl | string | `""` | Redis URL for rate limiting |
| replicaCount | int | `1` | Number of Hasura replicas to deploy |
| resources | object | `{}` | Resource limits and requests |
| securityContext | object | `{}` | Container security context |
| service | object | `{"annotations":{},"labels":{},"nodePort":"","port":8080,"targetPort":8080,"type":"ClusterIP"}` | Service configuration |
| service.annotations | object | `{}` | Additional service annotations |
| service.labels | object | `{}` | Additional service labels |
| service.nodePort | string | `""` | Node port (if type is NodePort) |
| service.port | int | `8080` | Service port |
| service.targetPort | int | `8080` | Target port |
| service.type | string | `"ClusterIP"` | Service type |
| serviceAccount | object | `{"annotations":{},"automount":true,"create":true,"name":""}` | Service account configuration |
| serviceAccount.annotations | object | `{}` | Annotations to add to the service account |
| serviceAccount.automount | bool | `true` | Automatically mount ServiceAccount's API credentials |
| serviceAccount.create | bool | `true` | Specifies whether a service account should be created |
| serviceAccount.name | string | `""` | The name of the service account to use |
| tolerations | list | `[]` | Tolerations |
| topologySpreadConstraints | object | `[]` | Topology spread constraints |
| unauthorizedRole | object | `"anonymous"` | Unauthorized role configuration |
| volumeMounts | object | `[]` | Volume mounts for the container |
| volumes | list | `[]` | Volumes for the pod |

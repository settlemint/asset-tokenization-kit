# hasura

![Version: 2.0.0-beta.3](https://img.shields.io/badge/Version-2.0.0--beta.3-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: 2.0.0-beta.3](https://img.shields.io/badge/AppVersion-2.0.0--beta.3-informational?style=flat-square)

A Helm chart for Hasura GraphQL Engine

## Configuration

The following table lists the configurable parameters of this chart and their default values.

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
|actions|object|-|Action configuration|
|actions.baseUrl|string|`""`|Action base URL|
|actions.handlerWebhookBaseUrl|string|`""`|Action handler webhook base URL|
|adminSecret|object|-|Admin secret configuration|
|adminSecret.enabled|bool|`true`|Create admin secret|
|adminSecret.existingSecret|string|`""`|Use existing secret|
|adminSecret.existingSecretKey|string|`"admin-secret"`|Key in existing secret|
|adminSecret.key|string|`"atk"`|Admin secret key (auto-generated if empty)|
|affinity|object|-|Pod affinity|
|authHook|object|-|Authentication webhook configuration|
|authHook.enabled|bool|`false`|Enable auth webhook|
|authHook.mode|string|`"POST"`|Webhook mode (GET or POST)|
|authHook.url|string|`""`|Webhook URL|
|autoscaling|object|-|Horizontal pod autoscaler configuration|
|autoscaling.enabled|bool|`false`|Enable HPA|
|autoscaling.maxReplicas|int|`10`|Maximum replicas|
|autoscaling.minReplicas|int|`1`|Minimum replicas|
|autoscaling.targetCPUUtilizationPercentage|int|`80`|Target CPU utilization percentage|
|autoscaling.targetMemoryUtilizationPercentage|int|`80`|Target memory utilization percentage|
|config|object|-|Hasura configuration options|
|config.corsDomain|string|`"*"`|CORS domain configuration|
|config.devMode|bool|`true`|Enable development mode|
|config.disableCors|bool|`false`|Disable CORS|
|config.enableAllowlist|bool|`false`|Enable allowlist|
|config.enableConsole|bool|`true`|Enable console|
|config.enableConsoleAssets|bool|`true`|Enable console assets (for offline usage)|
|config.enableRemoteSchemaPermissions|bool|`false`|Enable remote schema permissions|
|config.enableTelemetry|bool|`false`|Enable telemetry|
|config.inferFunctionPermissions|bool|`true`|Infer function permissions|
|config.logLevel|string|`"info"`|Log level (debug, info, warn, error)|
|config.schemaIntrospectionDisabled|bool|`false`|Enable schema introspection for specified roles|
|config.serverPort|int|`8080`|Server port|
|config.wsKeepAlive|int|`5`|WebSocket keepalive interval (seconds)|
|cronTriggers|object|-|Cron triggers configuration|
|cronTriggers.includeInMetadata|bool|`false`|Include webhook secret in cron triggers|
|database|object|-|Database configuration|
|database.connLifetime|int|`600`|Connection lifetime (seconds)|
|database.connections|int|`50`|Maximum connections|
|database.database|string|`""`|Database name (uses global datastores if not set)|
|database.enablePooling|bool|`true`|Enable connection pooling|
|database.host|string|`""`|Database host (uses global datastores if not set)|
|database.idleTimeout|int|`180`|Idle timeout (seconds)|
|database.password|string|`""`|Database password (uses global datastores if not set)|
|database.port|int|`""`|Database port (uses global datastores if not set)|
|database.sslMode|string|`""`|SSL mode (uses global datastores if not set)|
|database.txIsolation|string|`"read-committed"`|Transaction isolation level (read-committed, repeatable-read, serializable)|
|database.usePreparedStatements|bool|`true`|Use prepared statements|
|database.username|string|`""`|Database username (uses global datastores if not set)|
|events|object|-|Events configuration|
|events.fetchInterval|int|`10`|Fetch interval for events (seconds)|
|extraEnvFrom|list|-|Additional environment variables from secrets/configmaps|
|extraEnvs|list|-|Additional environment variables|
|fullnameOverride|string|`""`|Override fullname for the chart|
|global|object|-|Global configuration|
|global.labels|object|-|Global labels to apply to all resources|
|healthChecks|object|-|Health check configuration|
|healthChecks.livenessProbe|object|-|Liveness probe configuration|
|healthChecks.livenessProbe.enabled|bool|`true`|Enable liveness probe|
|healthChecks.livenessProbe.failureThreshold|int|`3`|Failure threshold|
|healthChecks.livenessProbe.httpGet|object|-|HTTP GET configuration|
|healthChecks.livenessProbe.httpGet.path|string|`"/healthz"`|Path for health check|
|healthChecks.livenessProbe.httpGet.port|string|`"http"`|Port name or number|
|healthChecks.livenessProbe.initialDelaySeconds|int|`30`|Initial delay seconds|
|healthChecks.livenessProbe.periodSeconds|int|`10`|Period seconds|
|healthChecks.livenessProbe.successThreshold|int|`1`|Success threshold|
|healthChecks.livenessProbe.timeoutSeconds|int|`5`|Timeout seconds|
|healthChecks.readinessProbe|object|-|Readiness probe configuration|
|healthChecks.readinessProbe.enabled|bool|`true`|Enable readiness probe|
|healthChecks.readinessProbe.failureThreshold|int|`3`|Failure threshold|
|healthChecks.readinessProbe.httpGet|object|-|HTTP GET configuration|
|healthChecks.readinessProbe.httpGet.path|string|`"/healthz"`|Path for health check|
|healthChecks.readinessProbe.httpGet.port|string|`"http"`|Port name or number|
|healthChecks.readinessProbe.initialDelaySeconds|int|`10`|Initial delay seconds|
|healthChecks.readinessProbe.periodSeconds|int|`10`|Period seconds|
|healthChecks.readinessProbe.successThreshold|int|`1`|Success threshold|
|healthChecks.readinessProbe.timeoutSeconds|int|`5`|Timeout seconds|
|healthChecks.startupProbe|object|-|Startup probe configuration|
|healthChecks.startupProbe.enabled|bool|`false`|Enable startup probe|
|healthChecks.startupProbe.failureThreshold|int|`30`|Failure threshold|
|healthChecks.startupProbe.httpGet|object|-|HTTP GET configuration|
|healthChecks.startupProbe.httpGet.path|string|`"/healthz"`|Path for health check|
|healthChecks.startupProbe.httpGet.port|string|`"http"`|Port name or number|
|healthChecks.startupProbe.initialDelaySeconds|int|`0`|Initial delay seconds|
|healthChecks.startupProbe.periodSeconds|int|`10`|Period seconds|
|healthChecks.startupProbe.successThreshold|int|`1`|Success threshold|
|healthChecks.startupProbe.timeoutSeconds|int|`5`|Timeout seconds|
|image|object|-|Hasura image configuration|
|image.pullPolicy|string|`"IfNotPresent"`|Hasura image pull policy|
|image.registry|string|`"docker.io"`|Hasura image registry|
|image.repository|string|`"hasura/graphql-engine"`|Hasura image repository|
|image.tag|string|`"v2.48.6"`|Hasura image tag|
|imagePullSecrets|list|-|Docker registry secret names as an array|
|ingress|object|-|Ingress configuration|
|ingress.annotations|object|-|Ingress annotations|
|ingress.className|string|`"atk-nginx"`|Ingress class name|
|ingress.enabled|bool|`true`|Enable ingress|
|ingress.extraHosts|list|-|Additional hosts|
|ingress.hostName|string|`"hasura.k8s.orb.local"`|Ingress hostname|
|ingress.path|string|`"/"`|Ingress path|
|ingress.pathType|string|`"Prefix"`|Ingress path type|
|ingress.tls|list|-|TLS configuration|
|initContainers|list|-|Init containers|
|initContainers[0]|string|`{"command":["/usr/bin/wait-for-it","postgresql:5432","-t","120"],"image":"ghcr.io/settlemint/btp-waitforit:v7.7.11","imagePullPolicy":"IfNotPresent","name":"wait-for-postgresql","resources":{"limits":{"cpu":"300m","memory":"64Mi"},"requests":{"cpu":"10m","memory":"32Mi"}}}`|Container name|
|initContainers[0].command|list|-|Container command|
|initContainers[0].image|string|`"ghcr.io/settlemint/btp-waitforit:v7.7.11"`|Container image|
|initContainers[0].imagePullPolicy|string|`"IfNotPresent"`|Image pull policy|
|initContainers[0].resources|object|-|Resource limits and requests|
|initContainers[0].resources.limits|object|-|Resource limits|
|initContainers[0].resources.limits.cpu|string|`"300m"`|CPU limit|
|initContainers[0].resources.limits.memory|string|`"64Mi"`|Memory limit|
|initContainers[0].resources.requests|object|-|Resource requests|
|initContainers[0].resources.requests.cpu|string|`"10m"`|CPU request|
|initContainers[0].resources.requests.memory|string|`"32Mi"`|Memory request|
|jwtSecrets|object|-|JWT secrets configuration|
|labels|object|-|Labels to add to all resources|
|metadata|object|-|Metadata database configuration|
|metadata.databaseUrl|string|`""`|Metadata database URL (defaults to main database if not set)|
|monitoring|object|-|Monitoring configuration|
|monitoring.enabled|bool|`false`|Enable Prometheus monitoring|
|monitoring.metricsSecret|string|`""`|Secret for metrics endpoint (optional)|
|monitoring.serviceMonitor|object|-|Service monitor configuration|
|monitoring.serviceMonitor.enabled|bool|`false`|Create ServiceMonitor resource|
|monitoring.serviceMonitor.interval|int|`"30s"`|Scrape interval|
|monitoring.serviceMonitor.labels|object|-|Additional labels for ServiceMonitor|
|monitoring.serviceMonitor.namespace|string|`""`|Monitoring namespace|
|monitoring.serviceMonitor.path|string|`"/v1/metrics"`|Metrics path|
|monitoring.serviceMonitor.scrapeTimeout|int|`"10s"`|Scrape timeout|
|nameOverride|string|`""`|Override name for the chart|
|networkPolicy|object|-|Network policy configuration|
|networkPolicy.egress|list|-|Egress rules|
|networkPolicy.enabled|bool|`false`|Enable network policy|
|networkPolicy.ingress|list|-|Ingress rules|
|networkPolicy.podSelector|list|-|Pod selector match labels|
|nodeSelector|object|-|Node selector|
|openShiftRoute|object|-|OpenShift Route configuration|
|openShiftRoute.alternateBackends|list|-|Alternate backends|
|openShiftRoute.annotations|object|-|Route annotations|
|openShiftRoute.enabled|bool|`false`|Enable OpenShift route|
|openShiftRoute.host|string|`"hasura.k8s.orb.local"`|Route hostname|
|openShiftRoute.path|string|`"/"`|Route path|
|openShiftRoute.tls|object|-|TLS configuration|
|openShiftRoute.to|object|-|Service weight configuration|
|openShiftRoute.to.weight|int|`100`|Weight for the service|
|openShiftRoute.wildcardPolicy|string|`"None"`|Wildcard policy|
|podAnnotations|object|-|Pod annotations|
|podDisruptionBudget|object|-|Pod disruption budget|
|podDisruptionBudget.enabled|bool|`false`|Enable PDB|
|podDisruptionBudget.maxUnavailable|int|`""`|Maximum unavailable pods|
|podDisruptionBudget.minAvailable|int|`1`|Minimum available pods|
|podLabels|object|-|Pod labels|
|podSecurityContext|object|-|Pod security context|
|priorityClassName|object|-|Priority class configuration|
|redis|object|-|Redis configuration for caching and rate limiting|
|redis.cacheDb|int|`""`|Redis database index for caching (uses global datastores if not set)|
|redis.cacheTtl|int|`60`|Cache TTL in seconds|
|redis.enabled|bool|`true`|Enable Redis integration|
|redis.host|string|`""`|Redis host (uses global datastores if not set)|
|redis.password|string|`""`|Redis password (uses global datastores if not set)|
|redis.port|int|`""`|Redis port (uses global datastores if not set)|
|redis.rateLimitDb|int|`""`|Redis database index for rate limiting (uses global datastores if not set)|
|redis.username|string|`""`|Redis username (uses global datastores if not set)|
|replicaCount|int|`1`|Number of Hasura replicas to deploy|
|resources|object|-|Resource limits and requests|
|securityContext|object|-|Container security context|
|service|object|-|Service configuration|
|service.annotations|object|-|Additional service annotations|
|service.labels|object|-|Additional service labels|
|service.nodePort|string|`""`|Node port (if type is NodePort)|
|service.port|int|`8080`|Service port|
|service.targetPort|int|`8080`|Target port|
|service.type|string|`"ClusterIP"`|Service type|
|serviceAccount|object|-|Service account configuration|
|serviceAccount.annotations|object|-|Annotations to add to the service account|
|serviceAccount.automount|bool|`false`|Automatically mount ServiceAccount's API credentials|
|serviceAccount.create|bool|`false`|Specifies whether a service account should be created|
|serviceAccount.name|string|`""`|The name of the service account to use|
|tolerations|list|-|Tolerations|
|topologySpreadConstraints|object|-|Topology spread constraints|
|unauthorizedRole|object|-|Unauthorized role configuration|
|volumeMounts|object|-|Volume mounts for the container|
|volumes|list|-|Volumes for the pod|

## Resource Summary

| Component | Replicas | Request CPU | Limit CPU | Request Memory | Limit Memory | Storage |
|-----------|----------|-------------|-----------|----------------|--------------|---------|
| **Totals** | - | - | - | - | - | - |

## Maintainers

| Name | Email | Url |
| ---- | ------ | --- |
| SettleMint | <support@settlemint.com> | <https://settlemint.com> |


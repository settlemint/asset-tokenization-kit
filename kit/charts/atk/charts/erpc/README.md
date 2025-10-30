# erpc

![Version: 2.0.0-beta.5](https://img.shields.io/badge/Version-2.0.0--beta.5-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: 2.0.0-beta.5](https://img.shields.io/badge/AppVersion-2.0.0--beta.5-informational?style=flat-square)

eRPC is a fault-tolerant EVM RPC proxy and permanent caching solution that provides
high availability, load balancing, and intelligent request routing for Ethereum
and EVM-compatible blockchain networks. It offers advanced caching mechanisms,
automatic failover, and comprehensive monitoring for production-grade blockchain
infrastructure.

**Homepage:** <https://erpc.cloud/>

## Configuration

The following table lists the configurable parameters of this chart and their default values.

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
|affinity|object|-|Affinity for pod assignment|
|autoscaling|object|-|Autoscaling configuration for eRPC|
|autoscaling.builtInMetrics|list|-|Built-in metrics configuration|
|autoscaling.builtInMetrics[0]|object|-|CPU utilization metric configuration|
|autoscaling.builtInMetrics[0].resource|object|-|Resource metric configuration|
|autoscaling.builtInMetrics[0].resource.name|string|`"cpu"`|Resource name to monitor|
|autoscaling.builtInMetrics[0].resource.target|object|-|Target metric configuration|
|autoscaling.builtInMetrics[0].resource.target.averageUtilization|int|`80`|Target average CPU utilization percentage|
|autoscaling.builtInMetrics[0].resource.target.type|string|`"Utilization"`|Target type (Utilization, Value, AverageValue)|
|autoscaling.builtInMetrics[0].type|string|`"Resource"`|Metric type (Resource, Pods, Object, External)|
|autoscaling.builtInMetrics[1]|object|-|Memory utilization metric configuration|
|autoscaling.builtInMetrics[1].resource|object|-|Resource metric configuration|
|autoscaling.builtInMetrics[1].resource.name|string|`"memory"`|Resource name to monitor|
|autoscaling.builtInMetrics[1].resource.target|object|-|Target metric configuration|
|autoscaling.builtInMetrics[1].resource.target.averageUtilization|int|`80`|Target average memory utilization percentage|
|autoscaling.builtInMetrics[1].resource.target.type|string|`"Utilization"`|Target type (Utilization, Value, AverageValue)|
|autoscaling.builtInMetrics[1].type|string|`"Resource"`|Metric type (Resource, Pods, Object, External)|
|autoscaling.customMetrics|list|-|Custom metrics configuration|
|autoscaling.enabled|bool|`false`|Enable autoscaling for eRPC|
|autoscaling.maxReplicas|int|`3`|Maximum number of eRPC replicas|
|autoscaling.minReplicas|int|`1`|Minimum number of eRPC replicas|
|commonAnnotations|object|-|Annotations to add to all deployed objects|
|commonLabels|object|-|Labels to add to all deployed objects|
|config|object|-|eRPC configuration|
|config.database|object|-|Database configuration for caching and shared state|
|config.database.evmJsonRpcCache|object|-|EVM JSON-RPC response caching configuration|
|config.database.evmJsonRpcCache.compression|object|-|Compression configuration for cached data|
|config.database.evmJsonRpcCache.compression.algorithm|string|`"zstd"`|Compression algorithm to use (zstd, gzip, lz4)|
|config.database.evmJsonRpcCache.compression.enabled|bool|`true`|Enable compression for cached responses|
|config.database.evmJsonRpcCache.compression.threshold|int|`1024`|Minimum response size in bytes before applying compression|
|config.database.evmJsonRpcCache.compression.zstdLevel|string|`"default"`|Compression level for zstd (fastest, default, better, best)|
|config.database.evmJsonRpcCache.connectors|list|-|Cache connector configurations|
|config.database.evmJsonRpcCache.connectors[0]|object|-|Redis cache connector|
|config.database.evmJsonRpcCache.connectors[0].driver|string|`"redis"`|Database driver type|
|config.database.evmJsonRpcCache.connectors[0].id|string|`"redis-cache"`|Unique identifier for this connector|
|config.database.evmJsonRpcCache.connectors[0].redis|object|-|Redis-specific configuration|
|config.database.evmJsonRpcCache.connectors[0].redis.uri|string|`"{{ include \"erpc.redis.uriFor\" (dict \"context\" $ \"dbKey\" \"cacheDb\" \"queryKey\" \"cacheQuery\") }}"`|Redis connection URI (template rendered)|
|config.database.evmJsonRpcCache.policies|list|-|Cache policies defining what to cache and for how long|
|config.database.evmJsonRpcCache.policies[0]|object|-|Cache policy for finalized blocks|
|config.database.evmJsonRpcCache.policies[0].connector|string|`"redis-cache"`|Connector ID to use for this policy|
|config.database.evmJsonRpcCache.policies[0].finality|string|`"finalized"`|Block finality state to match|
|config.database.evmJsonRpcCache.policies[0].method|string|`"*"`|RPC method pattern to match (supports wildcards)|
|config.database.evmJsonRpcCache.policies[0].network|string|`"*"`|Network pattern to match (supports wildcards)|
|config.database.evmJsonRpcCache.policies[0].ttl|int|`0`|Time-to-live in seconds (0 = infinite)|
|config.database.evmJsonRpcCache.policies[1]|object|-|Cache policy for unfinalized blocks|
|config.database.evmJsonRpcCache.policies[1].connector|string|`"redis-cache"`|Connector ID to use for this policy|
|config.database.evmJsonRpcCache.policies[1].finality|string|`"unfinalized"`|Block finality state to match|
|config.database.evmJsonRpcCache.policies[1].method|string|`"*"`|RPC method pattern to match (supports wildcards)|
|config.database.evmJsonRpcCache.policies[1].network|string|`"*"`|Network pattern to match (supports wildcards)|
|config.database.evmJsonRpcCache.policies[1].ttl|string|`"5s"`|Time-to-live duration|
|config.database.evmJsonRpcCache.policies[2]|object|-|Cache policy for realtime blocks|
|config.database.evmJsonRpcCache.policies[2].connector|string|`"redis-cache"`|Connector ID to use for this policy|
|config.database.evmJsonRpcCache.policies[2].finality|string|`"realtime"`|Block finality state to match|
|config.database.evmJsonRpcCache.policies[2].method|string|`"*"`|RPC method pattern to match (supports wildcards)|
|config.database.evmJsonRpcCache.policies[2].network|string|`"*"`|Network pattern to match (supports wildcards)|
|config.database.evmJsonRpcCache.policies[2].ttl|string|`"5s"`|Time-to-live duration|
|config.database.sharedState|object|-|Shared state configuration for distributed coordination|
|config.database.sharedState.clusterKey|string|`"atk-erpc-shared"`|Unique key prefix for this cluster's shared state|
|config.database.sharedState.connector|object|-|Connector configuration for shared state storage|
|config.database.sharedState.connector.driver|string|`"redis"`|Database driver type|
|config.database.sharedState.connector.redis|object|-|Redis-specific configuration|
|config.database.sharedState.connector.redis.uri|string|`"{{ include \"erpc.redis.uriFor\" (dict \"context\" $ \"dbKey\" \"sharedStateDb\" \"queryKey\" \"sharedStateQuery\") }}"`|Redis connection URI (template rendered)|
|config.database.sharedState.fallbackTimeout|string|`"5s"`|Timeout for fallback when shared state is unavailable|
|config.database.sharedState.lockTtl|string|`"30s"`|Time-to-live for distributed locks|
|config.logLevel|string|`"info"`|Log level for eRPC (debug, info, warn, error)|
|config.metrics|object|-|Prometheus metrics endpoint configuration|
|config.metrics.enabled|bool|`true`|Enable metrics endpoint|
|config.metrics.hostV4|string|`"0.0.0.0"`|IPv4 address to bind metrics server to|
|config.metrics.port|int|`4001`|Metrics server port|
|config.projects|list|-|Array of project configurations (will be overridden by parent chart). Chain IDs default from .Values.global.chainId when omitted (see configmap template).|
|config.projects[0]|object|-|Project configuration entry|
|config.projects[0].id|string|`"settlemint"`|Unique project identifier|
|config.projects[0].networks|list|-|Network configurations for this project|
|config.projects[0].networks[0]|object|-|Network configuration entry|
|config.projects[0].networks[0].architecture|string|`"evm"`|Blockchain architecture type (evm, substrate, etc.)|
|config.projects[0].networks[0].directiveDefaults|object|-|Default directives applied to all requests|
|config.projects[0].networks[0].directiveDefaults.retryEmpty|bool|`true`|Retry requests that return empty results|
|config.projects[0].networks[0].evm|object|-|EVM-specific configuration|
|config.projects[0].networks[0].evm.integrity|object|-|Data integrity enforcement rules|
|config.projects[0].networks[0].evm.integrity.enforceGetLogsBlockRange|bool|`true`|Enforce valid block range for eth_getLogs queries|
|config.projects[0].networks[0].evm.integrity.enforceHighestBlock|bool|`true`|Enforce consistent highest block number across upstreams|
|config.projects[0].networks[0].failsafe|list|-|Failsafe policies for request handling|
|config.projects[0].networks[0].failsafe[0]|object|-|Failsafe policy for eth_getLogs method|
|config.projects[0].networks[0].failsafe[0].hedge|object|-|Hedge configuration for parallel requests|
|config.projects[0].networks[0].failsafe[0].hedge.maxCount|int|`1`|Maximum number of concurrent hedge requests|
|config.projects[0].networks[0].failsafe[0].hedge.maxDelay|string|`"4s"`|Maximum delay before sending hedge request|
|config.projects[0].networks[0].failsafe[0].hedge.minDelay|string|`"200ms"`|Minimum delay before sending hedge request|
|config.projects[0].networks[0].failsafe[0].hedge.quantile|float|`0.9`|Latency quantile threshold for hedging (0.0-1.0)|
|config.projects[0].networks[0].failsafe[0].matchMethod|string|`"eth_getLogs"`|RPC method pattern to match (supports wildcards)|
|config.projects[0].networks[0].failsafe[0].retry|object|-|Retry configuration for failed requests|
|config.projects[0].networks[0].failsafe[0].retry.backoffFactor|int|`2`|Multiplicative factor for exponential backoff|
|config.projects[0].networks[0].failsafe[0].retry.backoffMaxDelay|string|`"10s"`|Maximum delay between retries|
|config.projects[0].networks[0].failsafe[0].retry.delay|string|`"500ms"`|Initial delay before first retry|
|config.projects[0].networks[0].failsafe[0].retry.jitter|string|`"300ms"`|Random jitter added to retry delay|
|config.projects[0].networks[0].failsafe[0].retry.maxAttempts|int|`3`|Maximum number of retry attempts|
|config.projects[0].networks[0].failsafe[0].timeout|object|-|Timeout configuration for this method|
|config.projects[0].networks[0].failsafe[0].timeout.duration|string|`"45s"`|Maximum duration for request completion|
|config.projects[0].networks[0].failsafe[1]|object|-|Failsafe policy for trace/debug methods|
|config.projects[0].networks[0].failsafe[1].matchMethod|string|`"trace_*|debug_*|arbtrace_*"`|RPC method pattern for trace, debug, and arbtrace methods|
|config.projects[0].networks[0].failsafe[1].retry|object|-|Retry configuration for trace/debug methods|
|config.projects[0].networks[0].failsafe[1].retry.maxAttempts|int|`1`|Maximum retry attempts for trace/debug (limited to 1)|
|config.projects[0].networks[0].failsafe[1].timeout|object|-|Timeout configuration for trace/debug methods|
|config.projects[0].networks[0].failsafe[1].timeout.duration|string|`"90s"`|Maximum duration for trace/debug requests|
|config.projects[0].networks[0].failsafe[2]|object|-|Failsafe policy for block and transaction queries|
|config.projects[0].networks[0].failsafe[2].matchMethod|string|`"eth_getBlock*|eth_getTransaction*"`|RPC method pattern for getBlock and getTransaction methods|
|config.projects[0].networks[0].failsafe[2].retry|object|-|Retry configuration for block/transaction queries|
|config.projects[0].networks[0].failsafe[2].retry.backoffFactor|float|`1.5`|Multiplicative factor for exponential backoff|
|config.projects[0].networks[0].failsafe[2].retry.backoffMaxDelay|string|`"3s"`|Maximum delay between retries|
|config.projects[0].networks[0].failsafe[2].retry.delay|string|`"200ms"`|Initial delay before first retry|
|config.projects[0].networks[0].failsafe[2].retry.jitter|string|`"150ms"`|Random jitter added to retry delay|
|config.projects[0].networks[0].failsafe[2].retry.maxAttempts|int|`2`|Maximum retry attempts for block/transaction queries|
|config.projects[0].networks[0].failsafe[2].timeout|object|-|Timeout configuration for block/transaction queries|
|config.projects[0].networks[0].failsafe[2].timeout.duration|string|`"6s"`|Maximum duration for block/transaction queries|
|config.projects[0].networks[0].failsafe[3]|object|-|Failsafe policy for unfinalized/realtime requests|
|config.projects[0].networks[0].failsafe[3].hedge|object|-|Hedge configuration for unfinalized requests|
|config.projects[0].networks[0].failsafe[3].hedge.delay|string|`"250ms"`|Delay before sending hedge request|
|config.projects[0].networks[0].failsafe[3].hedge.maxCount|int|`1`|Maximum number of concurrent hedge requests|
|config.projects[0].networks[0].failsafe[3].matchFinality|list|-|Block finality states to match|
|config.projects[0].networks[0].failsafe[3].matchFinality[0]|string|`"unfinalized"`|Match unfinalized blocks|
|config.projects[0].networks[0].failsafe[3].matchFinality[1]|string|`"realtime"`|Match realtime blocks|
|config.projects[0].networks[0].failsafe[3].matchMethod|string|`"*"`|RPC method pattern matching all methods|
|config.projects[0].networks[0].failsafe[3].retry|object|-|Retry configuration for unfinalized requests|
|config.projects[0].networks[0].failsafe[3].retry.delay|string|`"150ms"`|Initial delay before first retry|
|config.projects[0].networks[0].failsafe[3].retry.jitter|string|`"150ms"`|Random jitter added to retry delay|
|config.projects[0].networks[0].failsafe[3].retry.maxAttempts|int|`2`|Maximum retry attempts for unfinalized requests|
|config.projects[0].networks[0].failsafe[3].timeout|object|-|Timeout configuration for unfinalized requests|
|config.projects[0].networks[0].failsafe[3].timeout.duration|string|`"4s"`|Maximum duration for unfinalized requests|
|config.projects[0].networks[0].failsafe[4]|object|-|Failsafe policy for finalized block requests|
|config.projects[0].networks[0].failsafe[4].matchFinality|list|-|Block finality states to match (finalized only)|
|config.projects[0].networks[0].failsafe[4].matchFinality[0]|string|`"finalized"`|Match finalized blocks|
|config.projects[0].networks[0].failsafe[4].matchMethod|string|`"*"`|RPC method pattern matching all methods|
|config.projects[0].networks[0].failsafe[4].retry|object|-|Retry configuration for finalized requests|
|config.projects[0].networks[0].failsafe[4].retry.backoffFactor|float|`1.8`|Multiplicative factor for exponential backoff|
|config.projects[0].networks[0].failsafe[4].retry.backoffMaxDelay|string|`"8s"`|Maximum delay between retries|
|config.projects[0].networks[0].failsafe[4].retry.delay|string|`"400ms"`|Initial delay before first retry|
|config.projects[0].networks[0].failsafe[4].retry.jitter|string|`"250ms"`|Random jitter added to retry delay|
|config.projects[0].networks[0].failsafe[4].retry.maxAttempts|int|`4`|Maximum retry attempts for finalized requests|
|config.projects[0].networks[0].failsafe[4].timeout|object|-|Timeout configuration for finalized requests|
|config.projects[0].networks[0].failsafe[4].timeout.duration|string|`"20s"`|Maximum duration for finalized requests|
|config.projects[0].networks[0].failsafe[5]|object|-|Default fallback failsafe policy for all methods|
|config.projects[0].networks[0].failsafe[5].hedge|object|-|Hedge configuration for default policy|
|config.projects[0].networks[0].failsafe[5].hedge.maxCount|int|`2`|Maximum number of concurrent hedge requests|
|config.projects[0].networks[0].failsafe[5].hedge.maxDelay|string|`"2s"`|Maximum delay before sending hedge request|
|config.projects[0].networks[0].failsafe[5].hedge.minDelay|string|`"120ms"`|Minimum delay before sending hedge request|
|config.projects[0].networks[0].failsafe[5].hedge.quantile|float|`0.95`|Latency quantile threshold for hedging (0.0-1.0)|
|config.projects[0].networks[0].failsafe[5].matchMethod|string|`"*"`|RPC method pattern matching all methods (catch-all)|
|config.projects[0].networks[0].failsafe[5].retry|object|-|Retry configuration for default policy|
|config.projects[0].networks[0].failsafe[5].retry.backoffFactor|float|`1.4`|Multiplicative factor for exponential backoff|
|config.projects[0].networks[0].failsafe[5].retry.backoffMaxDelay|string|`"5s"`|Maximum delay between retries|
|config.projects[0].networks[0].failsafe[5].retry.delay|string|`"300ms"`|Initial delay before first retry|
|config.projects[0].networks[0].failsafe[5].retry.jitter|string|`"200ms"`|Random jitter added to retry delay|
|config.projects[0].networks[0].failsafe[5].retry.maxAttempts|int|`3`|Maximum retry attempts for default policy|
|config.projects[0].networks[0].failsafe[5].timeout|object|-|Timeout configuration for default policy|
|config.projects[0].networks[0].failsafe[5].timeout.duration|string|`"12s"`|Maximum duration for default requests|
|config.projects[0].upstreams|list|-|Upstream RPC node configurations for load balancing|
|config.projects[0].upstreams[0]|object|-|First Besu RPC node upstream|
|config.projects[0].upstreams[0].endpoint|string|`"http://besu-node-rpc-0.besu-node-rpc:8545"`|RPC endpoint URL for this upstream|
|config.projects[0].upstreams[0].evm|object|-|EVM-specific configuration for this upstream|
|config.projects[0].upstreams[0].failsafe|list|-|Failsafe policies for this upstream|
|config.projects[0].upstreams[0].failsafe[0]|object|-|Circuit breaker policy for this upstream|
|config.projects[0].upstreams[0].failsafe[0].circuitBreaker|object|-|Circuit breaker configuration|
|config.projects[0].upstreams[0].failsafe[0].circuitBreaker.failureThresholdCapacity|int|`80`|Capacity of failure counter window|
|config.projects[0].upstreams[0].failsafe[0].circuitBreaker.failureThresholdCount|int|`40`|Number of failures before opening circuit|
|config.projects[0].upstreams[0].failsafe[0].circuitBreaker.halfOpenAfter|string|`"120s"`|Duration before attempting to close circuit|
|config.projects[0].upstreams[0].failsafe[0].circuitBreaker.successThresholdCapacity|int|`10`|Capacity of success counter window|
|config.projects[0].upstreams[0].failsafe[0].circuitBreaker.successThresholdCount|int|`3`|Number of successes needed to close circuit|
|config.projects[0].upstreams[0].failsafe[0].matchMethod|string|`"*"`|RPC method pattern matching all methods|
|config.projects[0].upstreams[0].id|string|`"besu-node-rpc-0"`|Unique identifier for this upstream|
|config.server|object|-|HTTP server configuration|
|config.server.httpHostV4|string|`"0.0.0.0"`|IPv4 address to bind HTTP server to|
|config.server.httpPort|int|`4000`|HTTP server port|
|config.server.waitAfterShutdown|string|`"30s"`|Duration to wait after graceful shutdown completes|
|config.server.waitBeforeShutdown|string|`"30s"`|Duration to wait before starting graceful shutdown|
|configMountPath|string|`"/erpc.yaml"`|Path where the rendered configuration file will be mounted|
|containerSecurityContext|object|-|Container Security Context configuration (overrides global.securityContexts.container)|
|envSecret|object|-|.env Secret mount configuration|
|envSecret.defaultMode|int|`420`|File mode applied to the mounted Secret (decimal 420 = 0644)|
|envSecret.enabled|bool|`false`|Enable mounting a Secret containing a .env file|
|envSecret.mountPath|string|`"/.env"`|Path where the .env file will be mounted|
|envSecret.name|string|`""`|Name of the Secret containing the .env data (required when enabled)|
|envSecret.subPath|string|`""`|Optional subPath within the Secret to mount (defaults to the key named `.env`)|
|extraEnvVars|list|-|Array with extra environment variables to add to eRPC nodes|
|extraEnvVarsCM|string|`""`|Name of existing ConfigMap containing extra env vars for eRPC nodes|
|extraEnvVarsSecret|string|`""`|Name of existing Secret containing extra env vars for eRPC nodes|
|extraInitContainers|list|-|Additional init containers appended verbatim to the workload spec|
|extraVolumeMounts|list|-|Optionally specify extra list of additional volumeMounts for the eRPC container(s)|
|extraVolumes|list|-|Optionally specify extra list of additional volumes for the eRPC pod(s)|
|fullnameOverride|string|`"erpc"`|String to fully override common.names.fullname|
|global|object|-|Global Docker image registry|
|global.datastores|object|-|Datastore configurations for dependencies like Redis|
|global.imagePullSecrets|list|-|Global Docker registry secret names as an array|
|global.imageRegistry|string|`""`|Global Docker image registry|
|global.labels|object|-|Global labels applied to all resources|
|global.labels."kots.io/app-slug"|string|`"settlemint-atk"`|Kots.io app slug identifier|
|global.securityContexts|object|-|Security contexts configuration (pod and container level)|
|global.storageClass|string|`""`|Global StorageClass for Persistent Volume(s)|
|image|object|-|eRPC image|
|image.digest|string|`""`|eRPC image digest in the way sha256:aa.... Please note this parameter, if set, will override the tag|
|image.pullPolicy|string|`"IfNotPresent"`|eRPC image pull policy|
|image.pullSecrets|list|-|eRPC image pull secrets|
|image.registry|string|`"ghcr.io"`|eRPC image registry|
|image.repository|string|`"erpc/erpc"`|eRPC image repository|
|image.tag|string|`"0.0.58"`|eRPC image tag (immutable tags are recommended)|
|ingress|object|-|Ingress parameters|
|ingress.annotations|object|-|Additional annotations for the Ingress resource. To enable certificate autogeneration, place here your cert-manager annotations.|
|ingress.apiVersion|string|`""`|Force Ingress API version (automatically detected if not set)|
|ingress.enabled|bool|`true`|Enable ingress record generation for eRPC|
|ingress.extraHosts|list|-|An array with additional hostname(s) to be covered with the ingress record|
|ingress.extraPaths|list|-|An array with additional arbitrary paths that may need to be added to the ingress under the main host|
|ingress.extraRules|list|-|Additional rules to be covered with this ingress record|
|ingress.extraTls|list|-|TLS configuration for additional hostname(s) to be covered with this ingress record|
|ingress.hostname|string|`"besu.k8s.orb.local"`|Default host for the ingress record|
|ingress.ingressClassName|string|`"atk-nginx"`|IngressClass that will be be used to implement the Ingress (Kubernetes 1.18+)|
|ingress.path|string|`"/"`|Default path for the ingress record|
|ingress.pathType|string|`"ImplementationSpecific"`|Ingress path type|
|ingress.secrets|list|-|Custom TLS certificates as secrets|
|ingress.selfSigned|bool|`false`|Create a TLS secret for this ingress record using self-signed certificates generated by Helm|
|ingress.tls|bool|`false`|Enable TLS configuration for the host defined at `ingress.hostname` parameter|
|initContainer|object|-|Init container configuration for dependency checking|
|initContainer.tcpCheck|object|-|Generic TCP check settings for service dependencies|
|initContainer.tcpCheck.dependencies|list|-|List of service dependencies to check before starting|
|initContainer.tcpCheck.dependencies[0]|object|-|Besu RPC service dependency|
|initContainer.tcpCheck.dependencies[0].endpoint|string|`"besu-node-rpc-0.besu-node-rpc:8545"`|Service endpoint to check (service-name:port)|
|initContainer.tcpCheck.dependencies[0].name|string|`"besu-rpc"`|Name of the dependency|
|initContainer.tcpCheck.dependencies[1]|object|-|Redis service dependency|
|initContainer.tcpCheck.dependencies[1].endpoint|string|`"{{ include \"erpc.redis.endpoint\" (dict \"context\" $) }}"`|Service endpoint to check (template rendered)|
|initContainer.tcpCheck.dependencies[1].name|string|`"redis"`|Name of the dependency|
|initContainer.tcpCheck.enabled|bool|`true`|Enable TCP dependency checking init container|
|initContainer.tcpCheck.image|object|-|Container image for TCP check init container|
|initContainer.tcpCheck.image.pullPolicy|string|`"IfNotPresent"`|TCP check image pull policy|
|initContainer.tcpCheck.image.repository|string|`"ghcr.io/settlemint/btp-waitforit"`|TCP check image repository|
|initContainer.tcpCheck.image.tag|string|`"v7.7.14"`|TCP check image tag|
|initContainer.tcpCheck.resources|object|-|Resource limits and requests for TCP check container|
|initContainer.tcpCheck.resources.limits|object|-|Resource limits for TCP check container|
|initContainer.tcpCheck.resources.limits.cpu|string|`"300m"`|CPU limit for TCP check container|
|initContainer.tcpCheck.resources.limits.memory|string|`"64Mi"`|Memory limit for TCP check container|
|initContainer.tcpCheck.resources.requests|object|-|Resource requests for TCP check container|
|initContainer.tcpCheck.resources.requests.cpu|string|`"10m"`|CPU request for TCP check container|
|initContainer.tcpCheck.resources.requests.memory|string|`"32Mi"`|Memory request for TCP check container|
|initContainer.tcpCheck.timeout|int|`120`|Timeout in seconds for each dependency check|
|lifecycleHooks|object|-|lifecycleHooks for the eRPC container(s) to automate configuration before or after startup|
|livenessProbe|object|-|Configure eRPC containers' liveness probe|
|livenessProbe.enabled|bool|`true`|Enable livenessProbe on eRPC containers|
|livenessProbe.failureThreshold|int|`3`|Failure threshold for livenessProbe|
|livenessProbe.httpGet|object|-|HTTP get parameters for livenessProbe|
|livenessProbe.httpGet.path|string|`"/healthcheck"`|Path for httpGet livenessProbe|
|livenessProbe.httpGet.port|string|`"http"`|Port for httpGet livenessProbe|
|livenessProbe.initialDelaySeconds|int|`10`|Initial delay seconds for livenessProbe|
|livenessProbe.periodSeconds|int|`10`|Period seconds for livenessProbe|
|livenessProbe.successThreshold|int|`1`|Success threshold for livenessProbe|
|livenessProbe.timeoutSeconds|int|`5`|Timeout seconds for livenessProbe|
|networkPolicy|object|-|Network policies configuration|
|networkPolicy.addExternalClientAccess|bool|`true`|Allow access from pods with client label set to "true". Ignored if `networkPolicy.allowExternal` is true.|
|networkPolicy.allowExternal|bool|`true`|The Policy model to apply|
|networkPolicy.allowExternalEgress|bool|`true`|Allow the pod to access any range of port and all destinations.|
|networkPolicy.enabled|bool|`false`|Enable creation of NetworkPolicy resources|
|networkPolicy.extraEgress|list|-|Add extra egress rules to the NetworkPolicy (ignored if allowExternalEgress=true)|
|networkPolicy.extraEgress[0]|object|-|Egress rule for DNS resolution|
|networkPolicy.extraEgress[0].ports|list|-|Port configurations for DNS egress|
|networkPolicy.extraEgress[0].ports[0]|object|-|DNS port configuration|
|networkPolicy.extraEgress[0].ports[0].port|int|`53`|DNS port number|
|networkPolicy.extraEgress[0].ports[0].protocol|string|`"UDP"`|Protocol for DNS queries|
|networkPolicy.extraEgress[0].to|list|-|Destination selectors for DNS traffic|
|networkPolicy.extraEgress[0].to[0]|object|-|Allow DNS queries to kube-dns pods|
|networkPolicy.extraEgress[0].to[0].namespaceSelector|object|-|Namespace selector (empty matches all namespaces)|
|networkPolicy.extraEgress[0].to[0].podSelector|object|-|Pod selector for kube-dns|
|networkPolicy.extraEgress[0].to[0].podSelector.matchLabels|object|-|Label selector for kube-dns pods|
|networkPolicy.extraEgress[0].to[0].podSelector.matchLabels.k8s-app|string|`"kube-dns"`|Kubernetes app label for DNS|
|networkPolicy.extraEgress[1]|object|-|Egress rule for Besu node access|
|networkPolicy.extraEgress[1].ports|list|-|Port configurations for Besu egress|
|networkPolicy.extraEgress[1].ports[0]|object|-|Besu RPC port configuration|
|networkPolicy.extraEgress[1].ports[0].port|int|`8545`|Besu RPC port number|
|networkPolicy.extraEgress[1].ports[0].protocol|string|`"TCP"`|Protocol for Besu RPC traffic|
|networkPolicy.extraEgress[1].to|list|-|Destination selectors for Besu traffic|
|networkPolicy.extraEgress[1].to[0]|object|-|Allow traffic to Besu statefulset pods|
|networkPolicy.extraEgress[1].to[0].podSelector|object|-|Pod selector for Besu nodes|
|networkPolicy.extraEgress[1].to[0].podSelector.matchLabels|object|-|Label selector for Besu pods|
|networkPolicy.extraEgress[1].to[0].podSelector.matchLabels."app.kubernetes.io/name"|string|`"besu-statefulset"`|App name label for Besu statefulset|
|networkPolicy.extraIngress|list|-|Add extra ingress rules to the NetworkPolicy|
|networkPolicy.extraIngress[0]|object|-|Ingress rule allowing access from specific pods|
|networkPolicy.extraIngress[0].from|list|-|Source pod selectors for this ingress rule|
|networkPolicy.extraIngress[0].from[0]|object|-|Allow traffic from dapp pods|
|networkPolicy.extraIngress[0].from[0].podSelector|object|-|Pod selector for dapp|
|networkPolicy.extraIngress[0].from[0].podSelector.matchLabels|object|-|Label selector for dapp pods|
|networkPolicy.extraIngress[0].from[0].podSelector.matchLabels."app.kubernetes.io/name"|string|`"dapp"`|App name label for dapp|
|networkPolicy.extraIngress[0].from[1]|object|-|Allow traffic from txsigner pods|
|networkPolicy.extraIngress[0].from[1].podSelector|object|-|Pod selector for txsigner|
|networkPolicy.extraIngress[0].from[1].podSelector.matchLabels|object|-|Label selector for txsigner pods|
|networkPolicy.extraIngress[0].from[1].podSelector.matchLabels."app.kubernetes.io/name"|string|`"txsigner"`|App name label for txsigner|
|networkPolicy.extraIngress[0].from[2]|object|-|Allow traffic from ingress-nginx pods|
|networkPolicy.extraIngress[0].from[2].podSelector|object|-|Pod selector for ingress-nginx|
|networkPolicy.extraIngress[0].from[2].podSelector.matchLabels|object|-|Label selector for ingress-nginx pods|
|networkPolicy.extraIngress[0].from[2].podSelector.matchLabels."app.kubernetes.io/name"|string|`"ingress-nginx"`|App name label for ingress-nginx|
|networkPolicy.extraIngress[0].from[3]|object|-|Allow traffic from any pod in same namespace|
|networkPolicy.extraIngress[0].from[3].podSelector|object|-|Empty pod selector matches all pods|
|networkPolicy.extraIngress[0].ports|list|-|Port configurations for this ingress rule|
|networkPolicy.extraIngress[0].ports[0]|object|-|RPC port configuration|
|networkPolicy.extraIngress[0].ports[0].port|int|`4000`|RPC port number|
|networkPolicy.extraIngress[0].ports[0].protocol|string|`"TCP"`|Protocol for RPC traffic|
|networkPolicy.extraIngress[0].ports[1]|object|-|Metrics port configuration|
|networkPolicy.extraIngress[0].ports[1].port|int|`4001`|Metrics port number|
|networkPolicy.extraIngress[0].ports[1].protocol|string|`"TCP"`|Protocol for metrics traffic|
|networkPolicy.ingressRules|object|-|Ingress rules configuration|
|networkPolicy.ingressRules.accessOnlyFrom|object|-|Access restrictions configuration|
|networkPolicy.ingressRules.accessOnlyFrom.enabled|bool|`false`|Enable ingress rule that makes eRPC only accessible from a particular origin.|
|networkPolicy.ingressRules.accessOnlyFrom.namespaceSelector|object|-|Namespace selector label that is allowed to access eRPC. This label will be used to identified allowed namespace(s).|
|networkPolicy.ingressRules.accessOnlyFrom.podSelector|object|-|Pods selector label that is allowed to access eRPC. This label will be used to identified allowed pod(s).|
|nodeAffinityPreset|object|-|Node affinity preset configuration|
|nodeAffinityPreset.key|string|`""`|Node label key to match. Ignored if `affinity` is set|
|nodeAffinityPreset.type|string|`""`|Node affinity preset type. Ignored if `affinity` is set. Allowed values: `soft` or `hard`|
|nodeAffinityPreset.values|list|-|Node label values to match. Ignored if `affinity` is set|
|nodeSelector|object|-|Node labels for pod assignment|
|openShiftRoute|object|-|OpenShift Route parameters|
|openShiftRoute.alternateBackends|list|-|Additional backends for weighted routing|
|openShiftRoute.annotations|object|-|Additional annotations for the OpenShift route resource|
|openShiftRoute.enabled|bool|`false`|Enable OpenShift route creation for eRPC|
|openShiftRoute.host|string|`"besu.k8s.orb.local"`|Hostname exposed via the OpenShift route|
|openShiftRoute.path|string|`"/"`|HTTP path exposed via the OpenShift route|
|openShiftRoute.port|object|-|Service port configuration for the route target|
|openShiftRoute.port.targetPort|string|`"http"`|Service target port name (must exist on the eRPC service)|
|openShiftRoute.tls|object|-|TLS configuration for the OpenShift route|
|openShiftRoute.to|object|-|Primary service weight configuration|
|openShiftRoute.to.weight|int|`100`|Weight assigned to the eRPC service backend|
|openShiftRoute.wildcardPolicy|string|`"None"`|Wildcard policy applied to the route|
|pdb|object|-|Pod disruption budget configuration|
|pdb.enabled|bool|`false`|If true, create a pod disruption budget for pods.|
|pdb.maxUnavailable|string|`""`|Maximum number/percentage of pods that may be made unavailable. Defaults to 1 if both pdb.minAvailable and pdb.maxUnavailable are empty.|
|pdb.minAvailable|string|`""`|Minimum number/percentage of pods that should remain scheduled|
|podAffinityPreset|string|`""`|Pod affinity preset. Ignored if `affinity` is set. Allowed values: `soft` or `hard`|
|podAnnotations|object|-|Annotations for eRPC pods|
|podAnnotations."prometheus.io/path"|string|`"/metrics"`|Prometheus metrics path|
|podAnnotations."prometheus.io/port"|string|`"4001"`|Prometheus metrics port|
|podAnnotations."prometheus.io/scrape"|string|`"true"`|Enable prometheus scraping|
|podAntiAffinityPreset|string|`"soft"`|Pod anti-affinity preset. Ignored if `affinity` is set. Allowed values: `soft` or `hard`|
|podLabels|object|-|Extra labels for eRPC pods|
|podLabels."app.kubernetes.io/component"|string|`"erpc"`|Kubernetes component label identifying the workload as eRPC|
|podSecurityContext|object|-|Pod Security Context configuration (overrides global.securityContexts.pod)|
|priorityClassName|string|`""`|eRPC pods' priority class name|
|readinessProbe|object|-|Configure eRPC containers' readiness probe|
|readinessProbe.enabled|bool|`true`|Enable readinessProbe on eRPC containers|
|readinessProbe.failureThreshold|int|`3`|Failure threshold for readinessProbe|
|readinessProbe.httpGet|object|-|HTTP get parameters for readinessProbe|
|readinessProbe.httpGet.path|string|`"/healthcheck"`|Path for httpGet readinessProbe|
|readinessProbe.httpGet.port|string|`"http"`|Port for httpGet readinessProbe|
|readinessProbe.initialDelaySeconds|int|`5`|Initial delay seconds for readinessProbe|
|readinessProbe.periodSeconds|int|`10`|Period seconds for readinessProbe|
|readinessProbe.successThreshold|int|`1`|Success threshold for readinessProbe|
|readinessProbe.timeoutSeconds|int|`5`|Timeout seconds for readinessProbe|
|redis|object|-|Redis parameters for cache/shared state connectivity (overrides global.datastores.erpc.redis)|
|replicaCount|int|`1`|Number of eRPC replicas to deploy|
|resources|object|-|eRPC containers resource requests and limits|
|runtime|object|-|Runtime tuning for Go garbage collection and memory management|
|runtime.gc|object|-|Go garbage collection tuning configuration|
|runtime.gc.enabled|bool|`true`|Enable automatic Go GC tuning based on container limits|
|runtime.gc.gogc|int|`30`|Triggers garbage collection when heap grows by this percentage|
|runtime.gc.gomemlimitOverride|string|`""`|Absolute fallback for GOMEMLIMIT (takes precedence when set, e.g. "2GiB")|
|runtime.gc.gomemlimitRatio|float|`0.85`|Fraction of the pod memory limit used to derive GOMEMLIMIT (set to 1.0 for 100%)|
|schedulerName|string|`""`|Alternate scheduler|
|service|object|-|Service parameters|
|service.annotations|object|-|Additional custom annotations for eRPC service|
|service.clusterIP|string|`""`|eRPC service Cluster IP|
|service.externalTrafficPolicy|string|`"Cluster"`|eRPC service external traffic policy|
|service.extraPorts|list|-|Extra ports to expose in the eRPC service (normally used with the `sidecar` value)|
|service.loadBalancerIP|string|`""`|eRPC service Load Balancer IP|
|service.loadBalancerSourceRanges|list|-|eRPC service Load Balancer sources|
|service.metricsNodePort|string|`""`|Node port for metrics|
|service.metricsPort|int|`4001`|eRPC service metrics port|
|service.nodePort|string|`""`|Node port for HTTP|
|service.port|int|`4000`|eRPC service HTTP port|
|service.sessionAffinity|string|`"None"`|Session Affinity for Kubernetes service, can be "None" or "ClientIP"|
|service.sessionAffinityConfig|object|-|Additional settings for the sessionAffinity|
|service.type|string|`"ClusterIP"`|eRPC service type|
|serviceAccount|object|-|Service account for eRPC pods|
|serviceAccount.annotations|object|-|Annotations for service account. Evaluated as a template. Only used if `create` is `true`.|
|serviceAccount.automountServiceAccountToken|bool|`false`|Automount service account token for the deployment controller service account|
|serviceAccount.create|bool|`true`|Specifies whether a ServiceAccount should be created|
|serviceAccount.labels|object|-|Extra labels to be added to the service account|
|serviceAccount.name|string|`""`|The name of the ServiceAccount to use.|
|startupProbe|object|-|Configure eRPC containers' startup probe|
|startupProbe.enabled|bool|`false`|Enable startupProbe on eRPC containers|
|startupProbe.failureThreshold|int|`10`|Failure threshold for startupProbe|
|startupProbe.initialDelaySeconds|int|`30`|Initial delay seconds for startupProbe|
|startupProbe.periodSeconds|int|`10`|Period seconds for startupProbe|
|startupProbe.successThreshold|int|`1`|Success threshold for startupProbe|
|startupProbe.timeoutSeconds|int|`5`|Timeout seconds for startupProbe|
|tests|object|-|Test parameters|
|tests.image|object|-|Image for test pods|
|tests.image.pullPolicy|string|`"IfNotPresent"`|Test image pull policy|
|tests.image.registry|string|`"docker.io"`|Test image registry|
|tests.image.repository|string|`"busybox"`|Test image repository|
|tests.image.tag|string|`"1.37.0"`|Test image tag|
|tolerations|list|-|Tolerations for pod assignment|
|topologySpreadConstraints|list|-|Topology Spread Constraints for pod assignment|
|updateStrategy|object|-|Update strategy configuration for eRPC deployment|
|updateStrategy.rollingUpdate|object|-|eRPC deployment rolling update configuration parameters|
|updateStrategy.type|string|`"RollingUpdate"`|eRPC deployment strategy type|
|workingDir|string|`"/"`|Working directory for the eRPC container|

## Resource Summary

| Component | Replicas | Request CPU | Limit CPU | Request Memory | Limit Memory | Storage |
|-----------|----------|-------------|-----------|----------------|--------------|---------|
| initContainer.tcpCheck | 1 | 10m | 300m | 32Mi | 64Mi | - |
| **Totals** | - | 0.01 cores (10m) | 0.30 cores (300m) | 32Mi (0.03Gi) | 64Mi (0.06Gi) | - |

## Maintainers

| Name | Email | Url |
| ---- | ------ | --- |
| SettleMint | <support@settlemint.com> | <https://settlemint.com> |
| eRPC Community |  | <https://github.com/erpc/erpc> |

## Source Code

* <https://github.com/erpc/erpc>
* <https://github.com/settlemint/starterkit-asset-tokenization>

## Requirements

Kubernetes: `>=1.21.0-0`


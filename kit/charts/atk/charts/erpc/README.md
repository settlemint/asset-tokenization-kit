## Introduction

[eRPC](https://erpc.cloud/) is a fault-tolerant EVM (Ethereum Virtual Machine) RPC proxy and permanent caching solution designed for high-load scenarios like data indexing and frontend usage.

### Key Features

- **Automatic routing** between multiple upstream providers
- **Intelligent caching** to reduce load on blockchain nodes
- **Built-in monitoring** and tracing capabilities
- **Fault tolerance** with automatic failover
- **Rate limit handling** across multiple providers

### Benefits

- Improves performance from 5 RPS to 500 RPS
- Handles rate limits and provider failures automatically
- Provides a resilient infrastructure for blockchain data access
- Reduces costs by caching repeated requests

### Use Cases

- Web3 indexers
- Blockchain services
- High-traffic decentralized applications
- Data analytics platforms

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

## Prerequisites

- Kubernetes 1.19+
- Helm 3.2.0+
- PV provisioner support in the underlying infrastructure (if persistence is enabled)
- Redis instance reachable from the cluster (defaults target the bundled `support.redis` release)

## Connection Requirements

Configure Redis connectivity via the `global.datastores.erpc.redis` section (or override per-chart with `redis`).

| Purpose | Values path | Default |
| --- | --- | --- |
| Cache connector | `global.datastores.erpc.redis.cacheDb` | `redis://default:atk@redis:6379/0` |
| Shared state connector | `global.datastores.erpc.redis.sharedStateDb` | `redis://default:atk@redis:6379/1` |

Update the host, port, credentials, and database numbers to match your external Redis deployment.

## Installing the Chart

To install the chart with the release name `my-release`:

```console
helm install my-release .
```

The command deploys eRPC on the Kubernetes cluster in the default configuration. The [Parameters](#parameters) section lists the parameters that can be configured during installation.

> **Tip**: List all releases using `helm list`

## Uninstalling the Chart

To uninstall/delete the `my-release` deployment:

```console
helm delete my-release
```

The command removes all the Kubernetes components associated with the chart and deletes the release.

## Parameters

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| affinity | object | `{}` | Affinity for pod assignment |
| autoscaling | object | `{"builtInMetrics":[{"resource":{"name":"cpu","target":{"averageUtilization":80,"type":"Utilization"}},"type":"Resource"},{"resource":{"name":"memory","target":{"averageUtilization":80,"type":"Utilization"}},"type":"Resource"}],"customMetrics":[],"enabled":false,"maxReplicas":3,"minReplicas":1}` | Autoscaling configuration for eRPC |
| autoscaling.builtInMetrics | list | `[{"resource":{"name":"cpu","target":{"averageUtilization":80,"type":"Utilization"}},"type":"Resource"},{"resource":{"name":"memory","target":{"averageUtilization":80,"type":"Utilization"}},"type":"Resource"}]` | Built-in metrics configuration |
| autoscaling.customMetrics | list | `[]` | Custom metrics configuration |
| autoscaling.enabled | bool | `false` | Enable autoscaling for eRPC |
| autoscaling.maxReplicas | int | `3` | Maximum number of eRPC replicas |
| autoscaling.minReplicas | int | `1` | Minimum number of eRPC replicas |
| commonAnnotations | object | `{}` | Annotations to add to all deployed objects |
| commonLabels | object | `{}` | Labels to add to all deployed objects |
| config | object | `{"database":{"evmJsonRpcCache":{"compression":{"algorithm":"zstd","enabled":true,"threshold":1024,"zstdLevel":"default"},"connectors":[{"driver":"redis","id":"redis-cache","redis":{"uri":"{{ include \"erpc.redis.uriFor\" (dict \"context\" $ \"dbKey\" \"cacheDb\" \"queryKey\" \"cacheQuery\") }}"}}],"policies":[{"connector":"redis-cache","finality":"finalized","method":"*","network":"*","ttl":0},{"connector":"redis-cache","finality":"unfinalized","method":"*","network":"*","ttl":"5s"},{"connector":"redis-cache","finality":"realtime","method":"*","network":"*","ttl":"5s"}]},"sharedState":{"clusterKey":"atk-erpc-shared","connector":{"driver":"redis","redis":{"uri":"{{ include \"erpc.redis.uriFor\" (dict \"context\" $ \"dbKey\" \"sharedStateDb\" \"queryKey\" \"sharedStateQuery\") }}"}},"fallbackTimeout":"5s","lockTtl":"30s"}},"logLevel":"info","metrics":{"enabled":true,"hostV4":"0.0.0.0","port":4001},"projects":[{"id":"settlemint","networks":[{"architecture":"evm","directiveDefaults":{"retryEmpty":true},"evm":{"integrity":{"enforceGetLogsBlockRange":true,"enforceHighestBlock":true}},"failsafe":[{"hedge":{"maxCount":1,"maxDelay":"4s","minDelay":"200ms","quantile":0.9},"matchMethod":"eth_getLogs","retry":{"backoffFactor":2,"backoffMaxDelay":"10s","delay":"500ms","jitter":"300ms","maxAttempts":3},"timeout":{"duration":"45s"}},{"matchMethod":"trace_*|debug_*|arbtrace_*","retry":{"maxAttempts":1},"timeout":{"duration":"90s"}},{"matchMethod":"eth_getBlock*|eth_getTransaction*","retry":{"backoffFactor":1.5,"backoffMaxDelay":"3s","delay":"200ms","jitter":"150ms","maxAttempts":2},"timeout":{"duration":"6s"}},{"hedge":{"delay":"250ms","maxCount":1},"matchFinality":["unfinalized","realtime"],"matchMethod":"*","retry":{"delay":"150ms","jitter":"150ms","maxAttempts":2},"timeout":{"duration":"4s"}},{"matchFinality":["finalized"],"matchMethod":"*","retry":{"backoffFactor":1.8,"backoffMaxDelay":"8s","delay":"400ms","jitter":"250ms","maxAttempts":4},"timeout":{"duration":"20s"}},{"hedge":{"maxCount":2,"maxDelay":"2s","minDelay":"120ms","quantile":0.95},"matchMethod":"*","retry":{"backoffFactor":1.4,"backoffMaxDelay":"5s","delay":"300ms","jitter":"200ms","maxAttempts":3},"timeout":{"duration":"12s"}}]}],"upstreams":[{"endpoint":"http://besu-node-rpc-0.besu-node-rpc:8545","evm":{},"failsafe":[{"circuitBreaker":{"failureThresholdCapacity":80,"failureThresholdCount":40,"halfOpenAfter":"120s","successThresholdCapacity":10,"successThresholdCount":3},"matchMethod":"*"}],"id":"besu-node-rpc-0"},{"endpoint":"http://besu-node-rpc-1.besu-node-rpc:8545","evm":{},"failsafe":[{"circuitBreaker":{"failureThresholdCapacity":80,"failureThresholdCount":40,"halfOpenAfter":"120s","successThresholdCapacity":10,"successThresholdCount":3},"matchMethod":"*"}],"id":"besu-node-rpc-1"}]}],"server":{"httpHostV4":"0.0.0.0","httpPort":4000,"waitAfterShutdown":"30s","waitBeforeShutdown":"30s"}}` | eRPC configuration |
| config.database | object | `{"evmJsonRpcCache":{"compression":{"algorithm":"zstd","enabled":true,"threshold":1024,"zstdLevel":"default"},"connectors":[{"driver":"redis","id":"redis-cache","redis":{"uri":"{{ include \"erpc.redis.uriFor\" (dict \"context\" $ \"dbKey\" \"cacheDb\" \"queryKey\" \"cacheQuery\") }}"}}],"policies":[{"connector":"redis-cache","finality":"finalized","method":"*","network":"*","ttl":0},{"connector":"redis-cache","finality":"unfinalized","method":"*","network":"*","ttl":"5s"},{"connector":"redis-cache","finality":"realtime","method":"*","network":"*","ttl":"5s"}]},"sharedState":{"clusterKey":"atk-erpc-shared","connector":{"driver":"redis","redis":{"uri":"{{ include \"erpc.redis.uriFor\" (dict \"context\" $ \"dbKey\" \"sharedStateDb\" \"queryKey\" \"sharedStateQuery\") }}"}},"fallbackTimeout":"5s","lockTtl":"30s"}}` | Database configuration for caching |
| config.logLevel | string | `"info"` | Log level for eRPC |
| config.metrics | object | `{"enabled":true,"hostV4":"0.0.0.0","port":4001}` | Metrics endpoint configuration |
| config.projects | list | `[{"id":"settlemint","networks":[{"architecture":"evm","directiveDefaults":{"retryEmpty":true},"evm":{"integrity":{"enforceGetLogsBlockRange":true,"enforceHighestBlock":true}},"failsafe":[{"hedge":{"maxCount":1,"maxDelay":"4s","minDelay":"200ms","quantile":0.9},"matchMethod":"eth_getLogs","retry":{"backoffFactor":2,"backoffMaxDelay":"10s","delay":"500ms","jitter":"300ms","maxAttempts":3},"timeout":{"duration":"45s"}},{"matchMethod":"trace_*|debug_*|arbtrace_*","retry":{"maxAttempts":1},"timeout":{"duration":"90s"}},{"matchMethod":"eth_getBlock*|eth_getTransaction*","retry":{"backoffFactor":1.5,"backoffMaxDelay":"3s","delay":"200ms","jitter":"150ms","maxAttempts":2},"timeout":{"duration":"6s"}},{"hedge":{"delay":"250ms","maxCount":1},"matchFinality":["unfinalized","realtime"],"matchMethod":"*","retry":{"delay":"150ms","jitter":"150ms","maxAttempts":2},"timeout":{"duration":"4s"}},{"matchFinality":["finalized"],"matchMethod":"*","retry":{"backoffFactor":1.8,"backoffMaxDelay":"8s","delay":"400ms","jitter":"250ms","maxAttempts":4},"timeout":{"duration":"20s"}},{"hedge":{"maxCount":2,"maxDelay":"2s","minDelay":"120ms","quantile":0.95},"matchMethod":"*","retry":{"backoffFactor":1.4,"backoffMaxDelay":"5s","delay":"300ms","jitter":"200ms","maxAttempts":3},"timeout":{"duration":"12s"}}]}],"upstreams":[{"endpoint":"http://besu-node-rpc-0.besu-node-rpc:8545","evm":{},"failsafe":[{"circuitBreaker":{"failureThresholdCapacity":80,"failureThresholdCount":40,"halfOpenAfter":"120s","successThresholdCapacity":10,"successThresholdCount":3},"matchMethod":"*"}],"id":"besu-node-rpc-0"},{"endpoint":"http://besu-node-rpc-1.besu-node-rpc:8545","evm":{},"failsafe":[{"circuitBreaker":{"failureThresholdCapacity":80,"failureThresholdCount":40,"halfOpenAfter":"120s","successThresholdCapacity":10,"successThresholdCount":3},"matchMethod":"*"}],"id":"besu-node-rpc-1"}]}]` | Array of project configurations (will be overridden by parent chart)    Chain IDs default from .Values.global.chainId when omitted (see configmap template). |
| config.server | object | `{"httpHostV4":"0.0.0.0","httpPort":4000,"waitAfterShutdown":"30s","waitBeforeShutdown":"30s"}` | Server configuration |
| configMountPath | string | `"/erpc.yaml"` | Path where the rendered configuration file will be mounted |
| containerSecurityContext | object | `{}` | Container Security Context configuration (overrides global.securityContexts.container) |
| envSecret | object | `{"defaultMode":420,"enabled":false,"mountPath":"/.env","name":"","subPath":""}` | .env Secret mount configuration |
| envSecret.defaultMode | int | `420` | File mode applied to the mounted Secret (decimal 420 = 0644) |
| envSecret.enabled | bool | `false` | Enable mounting a Secret containing a .env file |
| envSecret.mountPath | string | `"/.env"` | Path where the .env file will be mounted |
| envSecret.name | string | `""` | Name of the Secret containing the .env data (required when enabled) |
| envSecret.subPath | string | `""` | Optional subPath within the Secret to mount (defaults to the key named `.env`) |
| extraEnvVars | list | `[]` | Array with extra environment variables to add to eRPC nodes |
| extraEnvVarsCM | string | `""` | Name of existing ConfigMap containing extra env vars for eRPC nodes |
| extraEnvVarsSecret | string | `""` | Name of existing Secret containing extra env vars for eRPC nodes |
| extraInitContainers | list | `[]` | Additional init containers appended verbatim to the workload spec |
| extraVolumeMounts | list | `[]` | Optionally specify extra list of additional volumeMounts for the eRPC container(s) |
| extraVolumes | list | `[]` | Optionally specify extra list of additional volumes for the eRPC pod(s) |
| fullnameOverride | string | `"erpc"` | String to fully override common.names.fullname |
| global | object | `{"datastores":{},"imagePullSecrets":[],"imageRegistry":"","labels":{"kots.io/app-slug":"settlemint-atk"},"securityContexts":{},"storageClass":""}` | Global Docker image registry |
| global.imagePullSecrets | list | `[]` | Global Docker registry secret names as an array |
| global.imageRegistry | string | `""` | Global Docker image registry |
| global.storageClass | string | `""` | Global StorageClass for Persistent Volume(s) |
| image | object | `{"digest":"","pullPolicy":"IfNotPresent","pullSecrets":[],"registry":"harbor.settlemint.com/ghcr.io","repository":"erpc/erpc","tag":"0.0.56"}` | eRPC image |
| image.digest | string | `""` | eRPC image digest in the way sha256:aa.... Please note this parameter, if set, will override the tag |
| image.pullPolicy | string | `"IfNotPresent"` | eRPC image pull policy |
| image.pullSecrets | list | `[]` | eRPC image pull secrets |
| image.registry | string | `"harbor.settlemint.com/ghcr.io"` | eRPC image registry |
| image.repository | string | `"erpc/erpc"` | eRPC image repository |
| image.tag | string | `"0.0.56"` | eRPC image tag (immutable tags are recommended) |
| ingress | object | `{"annotations":{},"apiVersion":"","enabled":true,"extraHosts":[],"extraPaths":[],"extraRules":[],"extraTls":[],"hostname":"besu.k8s.orb.local","ingressClassName":"atk-nginx","path":"/","pathType":"ImplementationSpecific","secrets":[],"selfSigned":false,"tls":false}` | Ingress parameters |
| ingress.annotations | object | `{}` | Additional annotations for the Ingress resource. To enable certificate autogeneration, place here your cert-manager annotations. |
| ingress.apiVersion | string | `""` | Force Ingress API version (automatically detected if not set) |
| ingress.enabled | bool | `true` | Enable ingress record generation for eRPC |
| ingress.extraHosts | list | `[]` | An array with additional hostname(s) to be covered with the ingress record |
| ingress.extraPaths | list | `[]` | An array with additional arbitrary paths that may need to be added to the ingress under the main host |
| ingress.extraRules | list | `[]` | Additional rules to be covered with this ingress record |
| ingress.extraTls | list | `[]` | TLS configuration for additional hostname(s) to be covered with this ingress record |
| ingress.hostname | string | `"besu.k8s.orb.local"` | Default host for the ingress record |
| ingress.ingressClassName | string | `"atk-nginx"` | IngressClass that will be be used to implement the Ingress (Kubernetes 1.18+) |
| ingress.path | string | `"/"` | Default path for the ingress record |
| ingress.pathType | string | `"ImplementationSpecific"` | Ingress path type |
| ingress.secrets | list | `[]` | Custom TLS certificates as secrets |
| ingress.selfSigned | bool | `false` | Create a TLS secret for this ingress record using self-signed certificates generated by Helm |
| ingress.tls | bool | `false` | Enable TLS configuration for the host defined at `ingress.hostname` parameter |
| initContainer.tcpCheck.dependencies[0].endpoint | string | `"besu-node-rpc-0.besu-node-rpc:8545"` |  |
| initContainer.tcpCheck.dependencies[0].name | string | `"besu-rpc"` |  |
| initContainer.tcpCheck.dependencies[1].endpoint | string | `"{{ include \"erpc.redis.endpoint\" (dict \"context\" $) }}"` |  |
| initContainer.tcpCheck.dependencies[1].name | string | `"redis"` |  |
| initContainer.tcpCheck.enabled | bool | `true` |  |
| initContainer.tcpCheck.image.pullPolicy | string | `"IfNotPresent"` |  |
| initContainer.tcpCheck.image.repository | string | `"harbor.settlemint.com/ghcr.io/settlemint/btp-waitforit"` |  |
| initContainer.tcpCheck.image.tag | string | `"v7.7.10"` |  |
| initContainer.tcpCheck.resources.limits.cpu | string | `"100m"` |  |
| initContainer.tcpCheck.resources.limits.memory | string | `"64Mi"` |  |
| initContainer.tcpCheck.resources.requests.cpu | string | `"10m"` |  |
| initContainer.tcpCheck.resources.requests.memory | string | `"32Mi"` |  |
| initContainer.tcpCheck.timeout | int | `120` |  |
| lifecycleHooks | object | `{}` | lifecycleHooks for the eRPC container(s) to automate configuration before or after startup |
| livenessProbe | object | `{"enabled":true,"failureThreshold":3,"httpGet":{"path":"/healthcheck","port":"http"},"initialDelaySeconds":10,"periodSeconds":10,"successThreshold":1,"timeoutSeconds":5}` | Configure eRPC containers' liveness probe |
| livenessProbe.enabled | bool | `true` | Enable livenessProbe on eRPC containers |
| livenessProbe.failureThreshold | int | `3` | Failure threshold for livenessProbe |
| livenessProbe.httpGet | object | `{"path":"/healthcheck","port":"http"}` | HTTP get parameters for livenessProbe |
| livenessProbe.httpGet.path | string | `"/healthcheck"` | Path for httpGet livenessProbe |
| livenessProbe.httpGet.port | string | `"http"` | Port for httpGet livenessProbe |
| livenessProbe.initialDelaySeconds | int | `10` | Initial delay seconds for livenessProbe |
| livenessProbe.periodSeconds | int | `10` | Period seconds for livenessProbe |
| livenessProbe.successThreshold | int | `1` | Success threshold for livenessProbe |
| livenessProbe.timeoutSeconds | int | `5` | Timeout seconds for livenessProbe |
| networkPolicy | object | `{"addExternalClientAccess":true,"allowExternal":true,"allowExternalEgress":true,"enabled":false,"extraEgress":[{"ports":[{"port":53,"protocol":"UDP"}],"to":[{"namespaceSelector":{},"podSelector":{"matchLabels":{"k8s-app":"kube-dns"}}}]},{"ports":[{"port":8545,"protocol":"TCP"}],"to":[{"podSelector":{"matchLabels":{"app.kubernetes.io/name":"besu-statefulset"}}}]}],"extraIngress":[{"from":[{"podSelector":{"matchLabels":{"app.kubernetes.io/name":"dapp"}}},{"podSelector":{"matchLabels":{"app.kubernetes.io/name":"txsigner"}}},{"podSelector":{"matchLabels":{"app.kubernetes.io/name":"ingress-nginx"}}},{"podSelector":{}}],"ports":[{"port":4000,"protocol":"TCP"},{"port":4001,"protocol":"TCP"}]}],"ingressRules":{"accessOnlyFrom":{"enabled":false,"namespaceSelector":{},"podSelector":{}}}}` | Network policies configuration |
| networkPolicy.addExternalClientAccess | bool | `true` | Allow access from pods with client label set to "true". Ignored if `networkPolicy.allowExternal` is true. |
| networkPolicy.allowExternal | bool | `true` | The Policy model to apply |
| networkPolicy.allowExternalEgress | bool | `true` | Allow the pod to access any range of port and all destinations. |
| networkPolicy.enabled | bool | `false` | Enable creation of NetworkPolicy resources |
| networkPolicy.extraEgress | list | `[{"ports":[{"port":53,"protocol":"UDP"}],"to":[{"namespaceSelector":{},"podSelector":{"matchLabels":{"k8s-app":"kube-dns"}}}]},{"ports":[{"port":8545,"protocol":"TCP"}],"to":[{"podSelector":{"matchLabels":{"app.kubernetes.io/name":"besu-statefulset"}}}]}]` | Add extra egress rules to the NetworkPolicy (ignored if allowExternalEgress=true) |
| networkPolicy.extraIngress | list | `[{"from":[{"podSelector":{"matchLabels":{"app.kubernetes.io/name":"dapp"}}},{"podSelector":{"matchLabels":{"app.kubernetes.io/name":"txsigner"}}},{"podSelector":{"matchLabels":{"app.kubernetes.io/name":"ingress-nginx"}}},{"podSelector":{}}],"ports":[{"port":4000,"protocol":"TCP"},{"port":4001,"protocol":"TCP"}]}]` | Add extra ingress rules to the NetworkPolicy |
| networkPolicy.ingressRules | object | `{"accessOnlyFrom":{"enabled":false,"namespaceSelector":{},"podSelector":{}}}` | Ingress rules configuration |
| networkPolicy.ingressRules.accessOnlyFrom | object | `{"enabled":false,"namespaceSelector":{},"podSelector":{}}` | Access restrictions configuration |
| networkPolicy.ingressRules.accessOnlyFrom.enabled | bool | `false` | Enable ingress rule that makes eRPC only accessible from a particular origin. |
| networkPolicy.ingressRules.accessOnlyFrom.namespaceSelector | object | `{}` | Namespace selector label that is allowed to access eRPC. This label will be used to identified allowed namespace(s). |
| networkPolicy.ingressRules.accessOnlyFrom.podSelector | object | `{}` | Pods selector label that is allowed to access eRPC. This label will be used to identified allowed pod(s). |
| nodeAffinityPreset | object | `{"key":"","type":"","values":[]}` | Node affinity preset configuration |
| nodeAffinityPreset.key | string | `""` | Node label key to match. Ignored if `affinity` is set |
| nodeAffinityPreset.type | string | `""` | Node affinity preset type. Ignored if `affinity` is set. Allowed values: `soft` or `hard` |
| nodeAffinityPreset.values | list | `[]` | Node label values to match. Ignored if `affinity` is set |
| nodeSelector | object | `{}` | Node labels for pod assignment |
| openShiftRoute | object | `{"alternateBackends":[],"annotations":{},"enabled":false,"host":"besu.k8s.orb.local","path":"/","port":{"targetPort":"http"},"tls":null,"to":{"weight":100},"wildcardPolicy":"None"}` | OpenShift Route parameters |
| openShiftRoute.alternateBackends | list | `[]` | Additional backends for weighted routing |
| openShiftRoute.annotations | object | `{}` | Additional annotations for the OpenShift route resource |
| openShiftRoute.enabled | bool | `false` | Enable OpenShift route creation for eRPC |
| openShiftRoute.host | string | `"besu.k8s.orb.local"` | Hostname exposed via the OpenShift route |
| openShiftRoute.path | string | `"/"` | HTTP path exposed via the OpenShift route |
| openShiftRoute.port | object | `{"targetPort":"http"}` | Service port configuration for the route target |
| openShiftRoute.port.targetPort | string | `"http"` | Service target port name (must exist on the eRPC service) |
| openShiftRoute.tls | string | `nil` | TLS configuration for the OpenShift route |
| openShiftRoute.to | object | `{"weight":100}` | Primary service weight configuration |
| openShiftRoute.to.weight | int | `100` | Weight assigned to the eRPC service backend |
| openShiftRoute.wildcardPolicy | string | `"None"` | Wildcard policy applied to the route |
| pdb | object | `{"enabled":false,"maxUnavailable":"","minAvailable":""}` | Pod disruption budget configuration |
| pdb.enabled | bool | `false` | If true, create a pod disruption budget for pods. |
| pdb.maxUnavailable | string | `""` | Maximum number/percentage of pods that may be made unavailable. Defaults to 1 if both pdb.minAvailable and pdb.maxUnavailable are empty. |
| pdb.minAvailable | string | `""` | Minimum number/percentage of pods that should remain scheduled |
| podAffinityPreset | string | `""` | Pod affinity preset. Ignored if `affinity` is set. Allowed values: `soft` or `hard` |
| podAnnotations | object | `{"prometheus.io/path":"/metrics","prometheus.io/port":"4001","prometheus.io/scrape":"true"}` | Annotations for eRPC pods |
| podAnnotations."prometheus.io/path" | string | `"/metrics"` | Prometheus metrics path |
| podAnnotations."prometheus.io/port" | string | `"4001"` | Prometheus metrics port |
| podAnnotations."prometheus.io/scrape" | string | `"true"` | Enable prometheus scraping |
| podAntiAffinityPreset | string | `"soft"` | Pod anti-affinity preset. Ignored if `affinity` is set. Allowed values: `soft` or `hard` |
| podLabels | object | `{"app.kubernetes.io/component":"erpc"}` | Extra labels for eRPC pods |
| podSecurityContext | object | `{}` | Pod Security Context configuration (overrides global.securityContexts.pod) |
| priorityClassName | string | `""` | eRPC pods' priority class name |
| readinessProbe | object | `{"enabled":true,"failureThreshold":3,"httpGet":{"path":"/healthcheck","port":"http"},"initialDelaySeconds":5,"periodSeconds":10,"successThreshold":1,"timeoutSeconds":5}` | Configure eRPC containers' readiness probe |
| readinessProbe.enabled | bool | `true` | Enable readinessProbe on eRPC containers |
| readinessProbe.failureThreshold | int | `3` | Failure threshold for readinessProbe |
| readinessProbe.httpGet | object | `{"path":"/healthcheck","port":"http"}` | HTTP get parameters for readinessProbe |
| readinessProbe.httpGet.path | string | `"/healthcheck"` | Path for httpGet readinessProbe |
| readinessProbe.httpGet.port | string | `"http"` | Port for httpGet readinessProbe |
| readinessProbe.initialDelaySeconds | int | `5` | Initial delay seconds for readinessProbe |
| readinessProbe.periodSeconds | int | `10` | Period seconds for readinessProbe |
| readinessProbe.successThreshold | int | `1` | Success threshold for readinessProbe |
| readinessProbe.timeoutSeconds | int | `5` | Timeout seconds for readinessProbe |
| redis | object | `{}` | Redis parameters for cache/shared state connectivity (overrides global.datastores.erpc.redis) |
| replicaCount | int | `1` | Number of eRPC replicas to deploy |
| resources | object | `{}` | eRPC containers resource requests and limits |
| runtime | object | `{"gc":{"enabled":true,"gogc":30,"gomemlimitOverride":"","gomemlimitRatio":0.85}}` | Runtime tuning |
| runtime.gc.enabled | bool | `true` | Enable automatic Go GC tuning based on container limits |
| runtime.gc.gogc | int | `30` | Triggers garbage collection when heap grows by this percentage |
| runtime.gc.gomemlimitOverride | string | `""` | Absolute fallback for GOMEMLIMIT (takes precedence when set, e.g. "2GiB") |
| runtime.gc.gomemlimitRatio | float | `0.85` | Fraction of the pod memory limit used to derive GOMEMLIMIT (set to 1.0 for 100%) |
| schedulerName | string | `""` | Alternate scheduler |
| service | object | `{"annotations":{},"clusterIP":"","externalTrafficPolicy":"Cluster","extraPorts":[],"loadBalancerIP":"","loadBalancerSourceRanges":[],"metricsNodePort":"","metricsPort":4001,"nodePort":"","port":4000,"sessionAffinity":"None","sessionAffinityConfig":{},"type":"ClusterIP"}` | Service parameters |
| service.annotations | object | `{}` | Additional custom annotations for eRPC service |
| service.clusterIP | string | `""` | eRPC service Cluster IP |
| service.externalTrafficPolicy | string | `"Cluster"` | eRPC service external traffic policy |
| service.extraPorts | list | `[]` | Extra ports to expose in the eRPC service (normally used with the `sidecar` value) |
| service.loadBalancerIP | string | `""` | eRPC service Load Balancer IP |
| service.loadBalancerSourceRanges | list | `[]` | eRPC service Load Balancer sources |
| service.metricsNodePort | string | `""` | Node port for metrics |
| service.metricsPort | int | `4001` | eRPC service metrics port |
| service.nodePort | string | `""` | Node port for HTTP |
| service.port | int | `4000` | eRPC service HTTP port |
| service.sessionAffinity | string | `"None"` | Session Affinity for Kubernetes service, can be "None" or "ClientIP" |
| service.sessionAffinityConfig | object | `{}` | Additional settings for the sessionAffinity |
| service.type | string | `"ClusterIP"` | eRPC service type |
| serviceAccount | object | `{"annotations":{},"automountServiceAccountToken":false,"create":true,"labels":{},"name":""}` | Service account for eRPC pods |
| serviceAccount.annotations | object | `{}` | Annotations for service account. Evaluated as a template. Only used if `create` is `true`. |
| serviceAccount.automountServiceAccountToken | bool | `false` | Automount service account token for the deployment controller service account |
| serviceAccount.create | bool | `true` | Specifies whether a ServiceAccount should be created |
| serviceAccount.labels | object | `{}` | Extra labels to be added to the service account |
| serviceAccount.name | string | `""` | The name of the ServiceAccount to use. |
| startupProbe | object | `{"enabled":false,"failureThreshold":10,"initialDelaySeconds":30,"periodSeconds":10,"successThreshold":1,"timeoutSeconds":5}` | Configure eRPC containers' startup probe |
| startupProbe.enabled | bool | `false` | Enable startupProbe on eRPC containers |
| startupProbe.failureThreshold | int | `10` | Failure threshold for startupProbe |
| startupProbe.initialDelaySeconds | int | `30` | Initial delay seconds for startupProbe |
| startupProbe.periodSeconds | int | `10` | Period seconds for startupProbe |
| startupProbe.successThreshold | int | `1` | Success threshold for startupProbe |
| startupProbe.timeoutSeconds | int | `5` | Timeout seconds for startupProbe |
| tests | object | `{"image":{"pullPolicy":"IfNotPresent","registry":"harbor.settlemint.com/docker.io","repository":"busybox","tag":"1.37.0"}}` | Test parameters |
| tests.image | object | `{"pullPolicy":"IfNotPresent","registry":"harbor.settlemint.com/docker.io","repository":"busybox","tag":"1.37.0"}` | Image for test pods |
| tests.image.pullPolicy | string | `"IfNotPresent"` | Test image pull policy |
| tests.image.registry | string | `"harbor.settlemint.com/docker.io"` | Test image registry |
| tests.image.repository | string | `"busybox"` | Test image repository |
| tests.image.tag | string | `"1.37.0"` | Test image tag |
| tolerations | list | `[]` | Tolerations for pod assignment |
| topologySpreadConstraints | list | `[]` | Topology Spread Constraints for pod assignment |
| updateStrategy | object | `{"rollingUpdate":{},"type":"RollingUpdate"}` | Update strategy configuration for eRPC deployment |
| updateStrategy.rollingUpdate | object | `{}` | eRPC deployment rolling update configuration parameters |
| updateStrategy.type | string | `"RollingUpdate"` | eRPC deployment strategy type |
| workingDir | string | `"/"` | Working directory for the eRPC container |

## Configuration and installation details

### Setting up upstream providers

You can configure multiple upstream RPC providers in the `config.projects` section:

```yaml
config:
  projects:
    - id: my-project
      upstreams:
        - endpoint: http://node1:8545
        - endpoint: http://node2:8545
```

### Advanced configuration

#### Using external ConfigMap

Instead of inline configuration, you can reference an external ConfigMap:

```yaml
extraEnvVarsCM: my-erpc-config
```

#### Custom volumes and mounts

Mount additional configuration files or secrets:

```yaml
extraVolumes:
  - name: custom-config
    configMap:
      name: my-custom-config
extraVolumeMounts:
  - name: custom-config
    mountPath: /config/custom
    readOnly: true
```

### Exposing eRPC

#### LoadBalancer service

```yaml
service:
  type: LoadBalancer
  port: 4000
```

#### Ingress

```yaml
ingress:
  enabled: true
  hostname: erpc.example.com
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt
  tls: true
```

### Metrics and monitoring

eRPC exposes Prometheus metrics on port 4001 at the `/metrics` endpoint. The metrics port is configured via:

```yaml
service:
  metricsPort: 4001
```

To scrape metrics with Prometheus, the chart includes pod annotations:

```yaml
podAnnotations:
  prometheus.io/scrape: "true"
  prometheus.io/port: "4001"
  prometheus.io/path: "/metrics"
```

### Resource limits and autoscaling

Configure resource limits and requests:

```yaml
resources:
  limits:
    cpu: 100m
    memory: 128Mi
  requests:
    cpu: 100m
    memory: 128Mi
```

Enable horizontal pod autoscaling:

```yaml
autoscaling:
  enabled: true
  minReplicas: 1
  maxReplicas: 10
  builtInMetrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 80
```

### Network policies

To restrict network traffic to/from eRPC pods:

```yaml
networkPolicy:
  enabled: true
  allowExternal: false
  allowExternalEgress: false
  extraIngress:
    - from:
        - podSelector:
            matchLabels:
              app.kubernetes.io/name: my-app
      ports:
        - protocol: TCP
          port: 4000
```

## Troubleshooting

### eRPC pods are not starting

Check the pod logs:
```console
kubectl logs -l app.kubernetes.io/name=erpc
```

### Connection refused errors

Ensure your upstream endpoints are reachable from within the cluster:
```console
kubectl exec -it deploy/erpc -- curl -v http://your-upstream:8545
```

### Performance issues

Check if caching is working properly by monitoring metrics:
```console
kubectl port-forward svc/erpc 4001:4001
curl http://localhost:4001/metrics | grep erpc_cache
```

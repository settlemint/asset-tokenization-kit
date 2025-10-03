# txsigner

![Version: 2.0.0-alpha.17](https://img.shields.io/badge/Version-2.0.0--alpha.17-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: 2.0.0-alpha.17](https://img.shields.io/badge/AppVersion-2.0.0--alpha.17-informational?style=flat-square)

TxSigner is a secure transaction signing service for blockchain applications that provides
automated transaction signing, key management, and transaction queuing capabilities. It offers
a secure environment for managing private keys and signing transactions with support for
multiple signing strategies, rate limiting, and comprehensive audit logging for production-grade
blockchain infrastructure.

**Homepage:** <https://github.com/settlemint/starterkit-asset-tokenization>

## Configuration

The following table lists the configurable parameters of this chart and their default values.

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
|affinity|object|-|Affinity for pod assignment (object)|
|autoscaling|object|-|Autoscaling configuration for TxSigner (object)|
|autoscaling.builtInMetrics|list|-|Built-in metrics configuration|
|autoscaling.builtInMetrics[0]|object|-|CPU resource metric configuration|
|autoscaling.builtInMetrics[0].resource|object|-|Resource metric details|
|autoscaling.builtInMetrics[0].resource.name|string|`"cpu"`|Resource name (cpu or memory)|
|autoscaling.builtInMetrics[0].resource.target|object|-|Target metric threshold|
|autoscaling.builtInMetrics[0].resource.target.averageUtilization|int|`80`|Average utilization percentage threshold|
|autoscaling.builtInMetrics[0].resource.target.type|string|`"Utilization"`|Target metric type|
|autoscaling.builtInMetrics[1]|object|-|Memory resource metric configuration|
|autoscaling.builtInMetrics[1].resource|object|-|Resource metric details|
|autoscaling.builtInMetrics[1].resource.name|string|`"memory"`|Resource name (cpu or memory)|
|autoscaling.builtInMetrics[1].resource.target|object|-|Target metric threshold|
|autoscaling.builtInMetrics[1].resource.target.averageUtilization|int|`80`|Average utilization percentage threshold|
|autoscaling.builtInMetrics[1].resource.target.type|string|`"Utilization"`|Target metric type|
|autoscaling.customMetrics|list|-|Custom metrics configuration (list)|
|autoscaling.enabled|bool|`false`|Enable autoscaling for TxSigner (bool)|
|autoscaling.maxReplicas|int|`3`|Maximum number of TxSigner replicas (int)|
|autoscaling.minReplicas|int|`1`|Minimum number of TxSigner replicas (int)|
|commonAnnotations|object|-|Annotations to add to all deployed objects (object)|
|commonLabels|object|-|Labels to add to all deployed objects (object)|
|config|object|-|TxSigner configuration (object)|
|config.allowedContracts|list|-|Allowed contracts for interaction|
|config.allowedMethods|list|-|Allowed methods for execution|
|config.audit|object|-|Audit logging|
|config.audit.enabled|bool|`true`|Enable audit logging|
|config.audit.retentionDays|int|`30`|Audit log retention days|
|config.chainId|string|`"53771311147"`|Chain ID for the network|
|config.cors|object|-|CORS configuration (object)|
|config.cors.enabled|bool|`false`|Enable CORS|
|config.cors.headers|list|-|Allowed headers|
|config.cors.methods|list|-|Allowed methods|
|config.cors.origins|list|-|Allowed origins|
|config.debug|bool|`false`|Enable debug mode|
|config.derivationPath|string|`""`|Derivation path to use for the private key|
|config.existingSecret|string|`""`|Use existing secret for private key|
|config.existingSecretKey|string|`"private-key"`|Key within the existing secret|
|config.extraSecretEnv|object|-|Additional secret environment variables to add to the txsigner|
|config.gas|object|-|Gas configuration (object)|
|config.gas.fixedPrice|int|`20`|Fixed gas price in Gwei (if priceStrategy is fixed)|
|config.gas.limit|int|`3000000`|Gas limit|
|config.gas.multiplier|float|`1.1`|Gas price multiplier for estimator strategy|
|config.gas.priceStrategy|string|`"estimator"`|Gas price strategy (fixed, oracle, estimator)|
|config.hsm|object|-|HSM configuration (if signingStrategy is hsm)|
|config.hsm.module|string|`""`|HSM module path|
|config.hsm.pin|string|`""`|HSM PIN|
|config.hsm.slot|string|`""`|HSM slot|
|config.kms|object|-|KMS configuration (if signingStrategy is kms)|
|config.kms.keyId|string|`""`|KMS key ID|
|config.kms.provider|string|`""`|KMS provider (aws, azure, gcp)|
|config.kms.region|string|`""`|KMS region|
|config.logLevel|string|`"info"`|Log level for TxSigner|
|config.metricsPort|int|`3001`|Port for the metrics server (int)|
|config.mnemonic|string|`""`|Mnemonic to use for the private key|
|config.mode|string|`"standalone"`|Operation mode (standalone or integrated)|
|config.nonce|object|-|Nonce management|
|config.nonce.maxPending|int|`10`|Maximum pending transactions|
|config.nonce.strategy|string|`"sequential"`|Nonce management strategy (sequential, parallel)|
|config.port|int|`3000`|Port for the HTTP server (int)|
|config.privateKey|string|`""`|Private key for local signing (use with caution, prefer secrets)|
|config.queue|object|-|Transaction queue configuration (object)|
|config.queue.maxSize|int|`1000`|Maximum queue size (int)|
|config.queue.processingInterval|int|`1000`|Queue processing interval in milliseconds (int)|
|config.rateLimit|object|-|Rate limiting configuration (object)|
|config.rateLimit.enabled|bool|`true`|Enable rate limiting (bool)|
|config.rateLimit.maxRequestsPerHour|int|`1000`|Maximum requests per hour (int)|
|config.rateLimit.maxRequestsPerMinute|int|`60`|Maximum requests per minute (int)|
|config.rpcUrl|string|`"http://erpc:4000"`|RPC endpoint URL|
|config.signingStrategy|string|`"local"`|Signing strategy (local, kms, hsm)|
|containerSecurityContext|object|-|Container Security Context configuration (object)|
|extraEnvVars|list|-|Array with extra environment variables to add to TxSigner nodes (list)|
|extraEnvVarsCM|string|`""`|Name of existing ConfigMap containing extra env vars for TxSigner nodes|
|extraEnvVarsSecret|string|`""`|Name of existing Secret containing extra env vars for TxSigner nodes|
|extraInitContainers|list|-|Additional init containers|
|extraVolumeMounts|list|-|Optionally specify extra list of additional volumeMounts for the TxSigner container(s)|
|extraVolumeMounts[0]|object|-|Cache volume mount configuration|
|extraVolumeMounts[0].mountPath|string|`"/signer/.cache"`|Mount path for cache volume|
|extraVolumes|list|-|Optionally specify extra list of additional volumes for the TxSigner pod(s)|
|extraVolumes[0]|object|-|Cache volume configuration|
|extraVolumes[0].emptyDir|object|-|Empty directory volume specification|
|fullnameOverride|string|`"txsigner"`|String to fully override common.names.fullname (string)|
|global|object|-|Global Docker image registry|
|global.imagePullSecrets|list|-|Global Docker registry secret names as an array|
|global.imageRegistry|string|`""`|Global Docker image registry|
|global.labels|object|-|Global labels to add to all resources|
|global.labels."kots.io/app-slug"|string|`"settlemint-atk"`|KOTS application slug identifier|
|global.storageClass|string|`""`|Global StorageClass for Persistent Volume(s)|
|image|object|-|TxSigner image|
|image.digest|string|`""`|TxSigner image digest in the way sha256:aa.... Please note this parameter, if set, will override the tag|
|image.pullPolicy|string|`"IfNotPresent"`|TxSigner image pull policy|
|image.pullSecrets|list|-|TxSigner image pull secrets (list)|
|image.registry|string|`"ghcr.io"`|TxSigner image registry|
|image.repository|string|`"settlemint/btp-signer"`|TxSigner image repository|
|image.tag|string|`"7.15.13"`|TxSigner image tag (immutable tags are recommended)|
|ingress|object|-|Ingress parameters (object)|
|ingress.annotations|object|-|Additional annotations for the Ingress resource. To enable certificate autogeneration, place here your cert-manager annotations.|
|ingress.apiVersion|string|`""`|Force Ingress API version (automatically detected if not set)|
|ingress.enabled|bool|`false`|Enable ingress record generation for TxSigner (bool)|
|ingress.extraHosts|list|-|An array with additional hostname(s) to be covered with the ingress record|
|ingress.extraPaths|list|-|An array with additional arbitrary paths that may need to be added to the ingress under the main host|
|ingress.extraRules|list|-|Additional rules to be covered with this ingress record (list)|
|ingress.extraTls|list|-|TLS configuration for additional hostname(s) to be covered with this ingress record|
|ingress.hostname|string|`"txsigner.k8s.orb.local"`|Default host for the ingress record|
|ingress.ingressClassName|string|`"atk-nginx"`|IngressClass that will be be used to implement the Ingress (Kubernetes 1.18+)|
|ingress.path|string|`"/"`|Default path for the ingress record|
|ingress.pathType|string|`"ImplementationSpecific"`|Ingress path type|
|ingress.secrets|list|-|Custom TLS certificates as secrets (list)|
|ingress.selfSigned|bool|`false`|Create a TLS secret for this ingress record using self-signed certificates generated by Helm|
|ingress.tls|bool|`false`|Enable TLS configuration for the host defined at `ingress.hostname` parameter|
|initContainer|object|-|Init container configuration|
|initContainer.tcpCheck|object|-|TCP connection check configuration|
|initContainer.tcpCheck.dependencies|list|-|List of dependencies to check before starting|
|initContainer.tcpCheck.dependencies[0]|object|-|PostgreSQL dependency configuration|
|initContainer.tcpCheck.dependencies[0].endpoint|string|`"{{ include \"atk.postgresql.endpoint\" (dict \"context\" $ \"chartKey\" \"txsigner\") }}"`|PostgreSQL endpoint template|
|initContainer.tcpCheck.enabled|bool|`true`|Enable TCP check init container|
|initContainer.tcpCheck.image|object|-|Init container image configuration|
|initContainer.tcpCheck.image.pullPolicy|string|`"IfNotPresent"`|Init container image pull policy|
|initContainer.tcpCheck.image.repository|string|`"ghcr.io/settlemint/btp-waitforit"`|Init container image repository|
|initContainer.tcpCheck.image.tag|string|`"v7.7.10"`|Init container image tag|
|initContainer.tcpCheck.resources|object|-|Init container resource requests and limits|
|initContainer.tcpCheck.resources.limits|object|-|Resource limits|
|initContainer.tcpCheck.resources.limits.cpu|string|`"300m"`|CPU limit|
|initContainer.tcpCheck.resources.limits.memory|string|`"64Mi"`|Memory limit|
|initContainer.tcpCheck.resources.requests|object|-|Resource requests|
|initContainer.tcpCheck.resources.requests.cpu|string|`"10m"`|CPU request|
|initContainer.tcpCheck.resources.requests.memory|string|`"32Mi"`|Memory request|
|initContainer.tcpCheck.timeout|int|`120`|Timeout in seconds for dependency checks|
|lifecycleHooks|object|-|lifecycleHooks for the TxSigner container(s) to automate configuration before or after startup|
|livenessProbe|object|-|Configure TxSigner containers' liveness probe (object)|
|livenessProbe.enabled|bool|`true`|Enable livenessProbe on TxSigner containers (bool)|
|livenessProbe.failureThreshold|int|`30`|Failure threshold for livenessProbe (int)|
|livenessProbe.initialDelaySeconds|int|`1`|Initial delay seconds for livenessProbe (int)|
|livenessProbe.periodSeconds|int|`10`|Period seconds for livenessProbe (int)|
|livenessProbe.successThreshold|int|`1`|Success threshold for livenessProbe (int)|
|livenessProbe.tcpSocket|object|-|TCP socket parameters for livenessProbe (object)|
|livenessProbe.tcpSocket.port|string|`"http"`|Port for tcpSocket livenessProbe|
|livenessProbe.timeoutSeconds|int|`5`|Timeout seconds for livenessProbe (int)|
|networkPolicy|object|-|Network policies configuration (object)|
|networkPolicy.addExternalClientAccess|bool|`true`|Allow access from pods with client label set to "true". Ignored if `networkPolicy.allowExternal` is true.|
|networkPolicy.allowExternal|bool|`true`|The Policy model to apply|
|networkPolicy.allowExternalEgress|bool|`true`|Allow the pod to access any range of port and all destinations.|
|networkPolicy.enabled|bool|`false`|Enable creation of NetworkPolicy resources (bool)|
|networkPolicy.extraEgress|list|-|Add extra egress rules to the NetworkPolicy (ignored if allowExternalEgress=true)|
|networkPolicy.extraEgress[0]|object|-|Allow DNS resolution|
|networkPolicy.extraEgress[0].ports|list|-|Allowed ports for DNS|
|networkPolicy.extraEgress[0].ports[0]|object|-|DNS UDP port configuration|
|networkPolicy.extraEgress[0].ports[0].port|int|`53`|DNS port|
|networkPolicy.extraEgress[0].to[0]|object|-|Allow egress to kube-dns pods|
|networkPolicy.extraEgress[0].to[0].podSelector|object|-|Match kube-dns pods|
|networkPolicy.extraEgress[0].to[0].podSelector.matchLabels|object|-|Match labels for kube-dns|
|networkPolicy.extraEgress[0].to[0].podSelector.matchLabels.k8s-app|string|`"kube-dns"`|Application name for kube-dns|
|networkPolicy.extraEgress[1]|object|-|Allow access to Besu nodes|
|networkPolicy.extraEgress[1].ports|list|-|Allowed ports for Besu RPC|
|networkPolicy.extraEgress[1].ports[0]|object|-|Besu RPC port configuration|
|networkPolicy.extraEgress[1].ports[0].port|int|`8545`|RPC port|
|networkPolicy.extraEgress[1].to[0]|object|-|Allow egress to Besu statefulset pods|
|networkPolicy.extraEgress[1].to[0].podSelector.matchLabels|object|-|Match labels for Besu|
|networkPolicy.extraEgress[1].to[0].podSelector.matchLabels."app.kubernetes.io/name"|string|`"besu-statefulset"`|Application name for Besu|
|networkPolicy.extraEgress[2]|object|-|Allow access to external HTTPS APIs (for signing services)|
|networkPolicy.extraEgress[2].ports|list|-|Allowed ports for HTTPS|
|networkPolicy.extraEgress[2].ports[0]|object|-|HTTPS port configuration|
|networkPolicy.extraEgress[2].ports[0].port|int|`443`|HTTPS port|
|networkPolicy.extraEgress[2].to[0]|object|-|Allow egress to any namespace|
|networkPolicy.extraIngress|list|-|Add extra ingress rules to the NetworkPolicy|
|networkPolicy.extraIngress[0]|object|-|Allow ingress from dapp, portal, ingress-nginx, and same namespace|
|networkPolicy.extraIngress[0].from[0]|object|-|Allow from dapp pods|
|networkPolicy.extraIngress[0].from[0].podSelector.matchLabels|object|-|Match labels for dapp|
|networkPolicy.extraIngress[0].from[0].podSelector.matchLabels."app.kubernetes.io/name"|string|`"dapp"`|Application name for dapp|
|networkPolicy.extraIngress[0].from[1]|object|-|Allow from portal pods|
|networkPolicy.extraIngress[0].from[1].podSelector.matchLabels|object|-|Match labels for portal|
|networkPolicy.extraIngress[0].from[1].podSelector.matchLabels."app.kubernetes.io/name"|string|`"portal"`|Application name for portal|
|networkPolicy.extraIngress[0].from[2]|object|-|Allow from ingress-nginx pods|
|networkPolicy.extraIngress[0].from[2].podSelector.matchLabels|object|-|Match labels for ingress-nginx|
|networkPolicy.extraIngress[0].from[2].podSelector.matchLabels."app.kubernetes.io/name"|string|`"ingress-nginx"`|Application name for ingress-nginx|
|networkPolicy.extraIngress[0].from[3]|object|-|Allow from all pods in same namespace|
|networkPolicy.extraIngress[0].ports|list|-|Allowed ports for ingress|
|networkPolicy.extraIngress[0].ports[0]|object|-|HTTP port configuration|
|networkPolicy.extraIngress[0].ports[0].port|int|`3000`|HTTP port|
|networkPolicy.extraIngress[0].ports[1]|object|-|Metrics port configuration|
|networkPolicy.extraIngress[0].ports[1].port|int|`3001`|Metrics port|
|networkPolicy.ingressRules|object|-|Ingress rules configuration|
|networkPolicy.ingressRules.accessOnlyFrom|object|-|Access restrictions configuration|
|networkPolicy.ingressRules.accessOnlyFrom.enabled|bool|`false`|Enable ingress rule that makes TxSigner only accessible from a particular origin.|
|networkPolicy.ingressRules.accessOnlyFrom.namespaceSelector|object|-|Namespace selector label that is allowed to access TxSigner. This label will be used to identified allowed namespace(s).|
|networkPolicy.ingressRules.accessOnlyFrom.podSelector|object|-|Pods selector label that is allowed to access TxSigner. This label will be used to identified allowed pod(s).|
|nodeAffinityPreset|object|-|Node affinity preset configuration (object)|
|nodeAffinityPreset.key|string|`""`|Node label key to match. Ignored if `affinity` is set (object)|
|nodeAffinityPreset.type|string|`""`|Node affinity preset type. Ignored if `affinity` is set. Allowed values: `soft` or `hard` (object)|
|nodeAffinityPreset.values|list|-|Node label values to match. Ignored if `affinity` is set (object)|
|nodeSelector|object|-|Node labels for pod assignment (object)|
|openShiftRoute|object|-|OpenShift Route parameters|
|openShiftRoute.alternateBackends|list|-|Additional backends for weighted routing|
|openShiftRoute.annotations|object|-|Additional annotations for the OpenShift route resource|
|openShiftRoute.enabled|bool|`false`|Enable OpenShift route creation for TxSigner|
|openShiftRoute.host|string|`"txsigner.k8s.orb.local"`|Hostname exposed via the OpenShift route|
|openShiftRoute.path|string|`"/"`|HTTP path exposed via the OpenShift route|
|openShiftRoute.port|object|-|Service port configuration for the route target|
|openShiftRoute.port.targetPort|string|`"http"`|Service target port name (must exist on the TxSigner service)|
|openShiftRoute.tls|object|-|TLS configuration for the OpenShift route|
|openShiftRoute.to|object|-|Primary service weight configuration|
|openShiftRoute.to.weight|int|`100`|Weight assigned to the TxSigner service backend|
|openShiftRoute.wildcardPolicy|string|`"None"`|Wildcard policy to apply to the route|
|pdb|object|-|Pod disruption budget configuration (object)|
|pdb.enabled|bool|`false`|If true, create a pod disruption budget for pods.|
|pdb.maxUnavailable|string|`""`|Maximum number/percentage of pods that may be made unavailable. Defaults to 1 if both pdb.minAvailable and pdb.maxUnavailable are empty.|
|pdb.minAvailable|string|`""`|Minimum number/percentage of pods that should remain scheduled|
|podAffinityPreset|string|`""`|Pod affinity preset. Ignored if `affinity` is set. Allowed values: `soft` or `hard`|
|podAnnotations|object|-|Annotations for TxSigner pods (object)|
|podAnnotations."prometheus.io/path"|string|`"/metrics"`|Prometheus metrics path|
|podAnnotations."prometheus.io/port"|string|`"3001"`|Prometheus metrics port|
|podAnnotations."prometheus.io/scrape"|string|`"true"`|Enable prometheus scraping|
|podAntiAffinityPreset|string|`"soft"`|Pod anti-affinity preset. Ignored if `affinity` is set. Allowed values: `soft` or `hard`|
|podLabels|object|-|Extra labels for TxSigner pods|
|podSecurityContext|object|-|Pod Security Context configuration (object)|
|priorityClassName|string|`""`|TxSigner pods' priority class name (string)|
|readinessProbe|object|-|Configure TxSigner containers' readiness probe (object)|
|readinessProbe.enabled|bool|`true`|Enable readinessProbe on TxSigner containers (bool)|
|readinessProbe.failureThreshold|int|`60`|Failure threshold for readinessProbe (int)|
|readinessProbe.initialDelaySeconds|int|`1`|Initial delay seconds for readinessProbe (int)|
|readinessProbe.periodSeconds|int|`5`|Period seconds for readinessProbe (int)|
|readinessProbe.successThreshold|int|`1`|Success threshold for readinessProbe (int)|
|readinessProbe.tcpSocket|object|-|TCP socket parameters for readinessProbe (object)|
|readinessProbe.tcpSocket.port|string|`"http"`|Port for tcpSocket readinessProbe|
|readinessProbe.timeoutSeconds|int|`5`|Timeout seconds for readinessProbe (int)|
|replicaCount|int|`1`|Number of TxSigner replicas to deploy (int)|
|resources|object|-|TxSigner containers resource requests and limits|
|schedulerName|string|`""`|Alternate scheduler (string)|
|service|object|-|Service parameters (object)|
|service.annotations|object|-|Additional custom annotations for TxSigner service|
|service.clusterIP|string|`""`|TxSigner service Cluster IP|
|service.externalTrafficPolicy|string|`"Cluster"`|TxSigner service external traffic policy|
|service.extraPorts|list|-|Extra ports to expose in the TxSigner service (normally used with the `sidecar` value)|
|service.loadBalancerIP|string|`""`|TxSigner service Load Balancer IP|
|service.loadBalancerSourceRanges|list|-|TxSigner service Load Balancer sources (list)|
|service.metricsNodePort|string|`""`|Node port for metrics|
|service.metricsPort|int|`3001`|TxSigner service metrics port|
|service.nodePort|string|`""`|Node port for HTTP|
|service.port|int|`3000`|TxSigner service HTTP port|
|service.sessionAffinity|string|`"None"`|Session Affinity for Kubernetes service, can be "None" or "ClientIP"|
|service.sessionAffinityConfig|object|-|Additional settings for the sessionAffinity|
|service.type|string|`"ClusterIP"`|TxSigner service type|
|serviceAccount|object|-|Service account for TxSigner pods|
|serviceAccount.annotations|object|-|Annotations for service account. Evaluated as a template. Only used if `create` is `true`.|
|serviceAccount.automountServiceAccountToken|bool|`false`|Automount service account token for the deployment controller service account|
|serviceAccount.create|bool|`true`|Specifies whether a ServiceAccount should be created|
|serviceAccount.labels|object|-|Extra labels to be added to the service account|
|serviceAccount.name|string|`""`|The name of the ServiceAccount to use.|
|startupProbe|object|-|Configure TxSigner containers' startup probe (object)|
|startupProbe.enabled|bool|`false`|Enable startupProbe on TxSigner containers (bool)|
|startupProbe.failureThreshold|int|`10`|Failure threshold for startupProbe (int)|
|startupProbe.initialDelaySeconds|int|`30`|Initial delay seconds for startupProbe (int)|
|startupProbe.periodSeconds|int|`10`|Period seconds for startupProbe (int)|
|startupProbe.successThreshold|int|`1`|Success threshold for startupProbe (int)|
|startupProbe.timeoutSeconds|int|`5`|Timeout seconds for startupProbe (int)|
|tests|object|-|Test parameters (object)|
|tests.image|object|-|Image for test pods|
|tests.image.pullPolicy|string|`"IfNotPresent"`|Test image pull policy|
|tests.image.registry|string|`"docker.io"`|Test image registry|
|tests.image.repository|string|`"busybox"`|Test image repository|
|tests.image.tag|string|`"1.37.0"`|Test image tag|
|tolerations|list|-|Tolerations for pod assignment (list)|
|topologySpreadConstraints|list|-|Topology Spread Constraints for pod assignment (list)|
|updateStrategy|object|-|Update strategy configuration for TxSigner deployment|
|updateStrategy.rollingUpdate|object|-|TxSigner deployment rolling update configuration parameters|
|updateStrategy.type|string|`"RollingUpdate"`|TxSigner deployment strategy type|

## Resource Summary

| Component | Replicas | Request CPU | Limit CPU | Request Memory | Limit Memory | Storage |
|-----------|----------|-------------|-----------|----------------|--------------|---------|
| initContainer.tcpCheck | 1 | 10m | 300m | 32Mi | 64Mi | - |

| **Totals** | - | 0.01 cores (10m) | 0.30 cores (300m) | 32Mi (0.03Gi) | 64Mi (0.06Gi) | - |

## Maintainers

| Name | Email | Url |
| ---- | ------ | --- |
| SettleMint | <support@settlemint.com> | <https://settlemint.com> |

## Source Code

* <https://github.com/settlemint/starterkit-asset-tokenization>

## Requirements

Kubernetes: `>=1.21.0-0`


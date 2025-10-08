# portal

![Version: 2.0.0-beta.2](https://img.shields.io/badge/Version-2.0.0--beta.2-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: 2.0.0-beta.2](https://img.shields.io/badge/AppVersion-2.0.0--beta.2-informational?style=flat-square)

Portal is a comprehensive blockchain data management and querying service that provides
real-time access to on-chain data through GraphQL APIs. It serves as the central data
access layer for the Asset Tokenization Kit, offering high-performance queries, data
synchronization, and API endpoints for frontend applications and external integrations.

**Homepage:** <https://settlemint.com/>

## Configuration

The following table lists the configurable parameters of this chart and their default values.

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
|affinity|object|-|Affinity for pod assignment|
|autoscaling|object|-|Autoscaling configuration for Portal|
|autoscaling.builtInMetrics|list|-|Built-in metrics configuration for CPU and memory based scaling|
|autoscaling.builtInMetrics[0]|string|`{"resource":{"name":"cpu","target":{"averageUtilization":80,"type":"Utilization"}},"type":"Resource"}`|Metric type (Resource, Pods, Object, or External)|
|autoscaling.builtInMetrics[0].resource|object|-|Resource metric configuration|
|autoscaling.builtInMetrics[0].resource.name|string|`"cpu"`|Name of the resource metric (cpu or memory)|
|autoscaling.builtInMetrics[0].resource.target|object|-|Target metric threshold configuration|
|autoscaling.builtInMetrics[0].resource.target.averageUtilization|int|`80`|Target average CPU utilization percentage|
|autoscaling.builtInMetrics[0].resource.target.type|string|`"Utilization"`|Target metric type (Utilization or AverageValue)|
|autoscaling.builtInMetrics[1]|string|`{"resource":{"name":"memory","target":{"averageUtilization":80,"type":"Utilization"}},"type":"Resource"}`|Metric type (Resource, Pods, Object, or External)|
|autoscaling.builtInMetrics[1].resource|object|-|Resource metric configuration|
|autoscaling.builtInMetrics[1].resource.name|string|`"memory"`|Name of the resource metric (cpu or memory)|
|autoscaling.builtInMetrics[1].resource.target|object|-|Target metric threshold configuration|
|autoscaling.builtInMetrics[1].resource.target.averageUtilization|int|`80`|Target average memory utilization percentage|
|autoscaling.builtInMetrics[1].resource.target.type|string|`"Utilization"`|Target metric type (Utilization or AverageValue)|
|autoscaling.customMetrics|list|-|Custom metrics configuration|
|autoscaling.enabled|bool|`false`|Enable autoscaling for Portal|
|autoscaling.maxReplicas|int|`3`|Maximum number of Portal replicas|
|autoscaling.minReplicas|int|`1`|Minimum number of Portal replicas|
|commonAnnotations|object|-|Annotations to add to all deployed objects|
|commonLabels|object|-|Labels to add to all deployed objects|
|config|object|-|Portal configuration|
|config.network|object|-|Network configuration|
|config.network.networkId|string|`nil`|Network ID (defaults to global.chainId when unset)|
|config.network.networkName|string|`nil`|Network name (defaults to global.chainName when unset)|
|config.network.nodeRpcUrl|string|`"http://txsigner:3000"`|Node RPC URL|
|config.postgresql|object|-|PostgreSQL overrides merged with global.datastores.portal.postgresql|
|config.redis|object|-|Redis overrides merged with global.datastores.portal.redis|
|containerSecurityContext|object|-|Container Security Context configuration (overrides global.securityContexts.container)|
|extraEnvVars|list|-|Array with extra environment variables to add to Portal nodes|
|extraEnvVarsCM|string|`""`|Name of existing ConfigMap containing extra env vars for Portal nodes|
|extraEnvVarsSecret|string|`""`|Name of existing Secret containing extra env vars for Portal nodes|
|extraInitContainers|list|-|Additional init containers to add to the Portal pod|
|extraVolumeMounts|list|-|Optionally specify extra list of additional volumeMounts for the Portal container(s)|
|extraVolumes|list|-|Optionally specify extra list of additional volumes for the Portal pod(s)|
|fullnameOverride|string|`"portal"`|String to fully override common.names.fullname|
|global|object|-|Global Docker image registry|
|global.imagePullSecrets|list|-|Global Docker registry secret names as an array|
|global.imageRegistry|string|`""`|Global Docker image registry|
|global.labels|object|-|Global labels to add to all resources|
|global.labels."kots.io/app-slug"|string|`"settlemint-atk"`|KOTS application slug applied to all Portal resources|
|global.storageClass|string|`""`|Global StorageClass for Persistent Volume(s)|
|image|object|-|Portal image|
|image.digest|string|`""`|Portal image digest in the way sha256:aa.... Please note this parameter, if set, will override the tag|
|image.pullPolicy|string|`"IfNotPresent"`|Portal image pull policy|
|image.pullSecrets|list|-|Portal image pull secrets|
|image.registry|string|`"ghcr.io"`|Portal image registry|
|image.repository|string|`"settlemint/btp-scs-portal"`|Portal image repository|
|image.tag|string|`"8.6.9"`|Portal image tag (immutable tags are recommended)|
|ingress|object|-|Ingress parameters|
|ingress.annotations|object|-|Additional annotations for the Ingress resource. To enable certificate autogeneration, place here your cert-manager annotations.|
|ingress.apiVersion|string|`""`|Force Ingress API version (automatically detected if not set)|
|ingress.enabled|bool|`true`|Enable ingress record generation for Portal|
|ingress.extraHosts|list|-|An array with additional hostname(s) to be covered with the ingress record|
|ingress.extraPaths|list|-|An array with additional arbitrary paths that may need to be added to the ingress under the main host|
|ingress.extraRules|list|-|Additional rules to be covered with this ingress record|
|ingress.extraTls|list|-|TLS configuration for additional hostname(s) to be covered with this ingress record|
|ingress.graphqlPath|string|`"/graphql"`|Additional path for GraphQL endpoint|
|ingress.hostname|string|`"portal.k8s.orb.local"`|Default host for the ingress record|
|ingress.ingressClassName|string|`"atk-nginx"`|IngressClass that will be be used to implement the Ingress (Kubernetes 1.18+)|
|ingress.path|string|`"/"`|Default path for the ingress record|
|ingress.pathType|string|`"ImplementationSpecific"`|Ingress path type|
|ingress.secrets|list|-|Custom TLS certificates as secrets|
|ingress.selfSigned|bool|`false`|Create a TLS secret for this ingress record using self-signed certificates generated by Helm|
|ingress.tls|bool|`false`|Enable TLS configuration for the host defined at `ingress.hostname` parameter|
|initContainer|object|-|Init container configurations for dependency management and pre-start tasks|
|initContainer.downloadAbi|object|-|ABI download init container configuration|
|initContainer.downloadAbi.enabled|bool|`true`|Enable the ABI download init container that syncs ConfigMaps via network-bootstrapper.|
|initContainer.downloadAbi.image|object|-|Container image configuration for the ABI downloader|
|initContainer.downloadAbi.image.pullPolicy|string|`"IfNotPresent"`|Image pull policy for the ABI download init container.|
|initContainer.downloadAbi.image.repository|string|`"ghcr.io/settlemint/network-bootstrapper"`|OCI image hosting the network-bootstrapper CLI.|
|initContainer.downloadAbi.image.tag|string|`"1.2.3"`|Image tag for the network-bootstrapper CLI.|
|initContainer.downloadAbi.outputDirectory|string|`"/shared-abis"`|Directory where ABI files are written before being shared with the portal container.|
|initContainer.downloadAbi.resources|object|-|Resource requests and limits for the ABI download init container|
|initContainer.downloadAbi.resources.limits|object|-|Resource limits for the ABI download init container|
|initContainer.downloadAbi.resources.limits.cpu|string|`"450m"`|CPU limit for the ABI download init container|
|initContainer.downloadAbi.resources.limits.memory|string|`"128Mi"`|Memory limit for the ABI download init container|
|initContainer.downloadAbi.resources.requests|object|-|Resource requests for the ABI download init container|
|initContainer.downloadAbi.resources.requests.cpu|string|`"25m"`|CPU request for the ABI download init container|
|initContainer.downloadAbi.resources.requests.memory|string|`"64Mi"`|Memory request for the ABI download init container|
|initContainer.downloadAbi.securityContext|object|-|Security context for the ABI download init container|
|initContainer.tcpCheck|object|-|TCP check init container configuration for service dependency verification|
|initContainer.tcpCheck.dependencies|list|-|List of service dependencies to verify before starting portal|
|initContainer.tcpCheck.dependencies[0]|string|`{"endpoint":"postgresql:5432","name":"postgresql"}`|Name of the dependent service|
|initContainer.tcpCheck.dependencies[0].endpoint|string|`"postgresql:5432"`|TCP endpoint to check (format: host:port)|
|initContainer.tcpCheck.enabled|bool|`true`|Enable TCP check init container to wait for dependent services|
|initContainer.tcpCheck.image|object|-|Container image configuration for TCP check|
|initContainer.tcpCheck.image.pullPolicy|string|`"IfNotPresent"`|Image pull policy for the TCP check init container|
|initContainer.tcpCheck.image.repository|string|`"ghcr.io/settlemint/btp-waitforit"`|Repository for the TCP check init container image|
|initContainer.tcpCheck.image.tag|string|`"v7.7.11"`|Image tag for the TCP check init container|
|initContainer.tcpCheck.resources|object|-|Resource requests and limits for the TCP check init container|
|initContainer.tcpCheck.resources.limits|object|-|Resource limits for the TCP check init container|
|initContainer.tcpCheck.resources.limits.cpu|string|`"300m"`|CPU limit for the TCP check init container|
|initContainer.tcpCheck.resources.limits.memory|string|`"64Mi"`|Memory limit for the TCP check init container|
|initContainer.tcpCheck.resources.requests|object|-|Resource requests for the TCP check init container|
|initContainer.tcpCheck.resources.requests.cpu|string|`"10m"`|CPU request for the TCP check init container|
|initContainer.tcpCheck.resources.requests.memory|string|`"32Mi"`|Memory request for the TCP check init container|
|initContainer.tcpCheck.timeout|int|`120`|Timeout in seconds for TCP connectivity checks|
|lifecycleHooks|object|-|lifecycleHooks for the Portal container(s) to automate configuration before or after startup|
|livenessProbe|object|-|Configure Portal containers' liveness probe|
|livenessProbe.enabled|bool|`true`|Enable livenessProbe on Portal containers|
|livenessProbe.failureThreshold|int|`3`|Failure threshold for livenessProbe|
|livenessProbe.initialDelaySeconds|int|`10`|Initial delay seconds for livenessProbe|
|livenessProbe.periodSeconds|int|`10`|Period seconds for livenessProbe|
|livenessProbe.successThreshold|int|`1`|Success threshold for livenessProbe|
|livenessProbe.tcpSocket|object|-|TCP socket parameters for livenessProbe|
|livenessProbe.tcpSocket.port|string|`"http"`|Port for tcpSocket livenessProbe|
|livenessProbe.timeoutSeconds|int|`5`|Timeout seconds for livenessProbe|
|nameOverride|string|`""`|String to partially override common.names.fullname template (will maintain the release name)|
|networkPolicy|object|-|Network policies configuration|
|networkPolicy.addExternalClientAccess|bool|`true`|Allow access from pods with client label set to "true". Ignored if `networkPolicy.allowExternal` is true.|
|networkPolicy.allowExternal|bool|`true`|The Policy model to apply|
|networkPolicy.allowExternalEgress|bool|`true`|Allow the pod to access any range of port and all destinations.|
|networkPolicy.enabled|bool|`false`|Enable creation of NetworkPolicy resources|
|networkPolicy.extraEgress|list|-|Add extra egress rules to the NetworkPolicy (ignored if allowExternalEgress=true)|
|networkPolicy.extraEgress[0]|list|-|Destination selectors for DNS resolution|
|networkPolicy.extraEgress[0].ports|list|-|Allowed ports for DNS traffic|
|networkPolicy.extraEgress[0].ports[0]|string|`{"port":53,"protocol":"UDP"}`|Protocol for DNS|
|networkPolicy.extraEgress[0].ports[0].port|int|`53`|DNS port number|
|networkPolicy.extraEgress[0].to[0]|object|-|Namespace selector for kube-dns|
|networkPolicy.extraEgress[0].to[0].podSelector|object|-|Pod selector for kube-dns|
|networkPolicy.extraEgress[0].to[0].podSelector.matchLabels|object|-|Labels to match kube-dns pods|
|networkPolicy.extraEgress[0].to[0].podSelector.matchLabels.k8s-app|string|`"kube-dns"`|Label selecting kube-dns pods for DNS access|
|networkPolicy.extraEgress[1]|list|-|Destination selectors for PostgreSQL access|
|networkPolicy.extraEgress[1].ports|list|-|Allowed ports for PostgreSQL traffic|
|networkPolicy.extraEgress[1].ports[0]|string|`{"port":5432,"protocol":"TCP"}`|Protocol for PostgreSQL|
|networkPolicy.extraEgress[1].ports[0].port|int|`5432`|PostgreSQL port number|
|networkPolicy.extraEgress[1].to[0]|object|-|Pod selector for PostgreSQL|
|networkPolicy.extraEgress[1].to[0].podSelector.matchLabels|object|-|Labels to match PostgreSQL pods|
|networkPolicy.extraEgress[1].to[0].podSelector.matchLabels."app.kubernetes.io/name"|string|`"postgresql-ha"`|Application label selecting the PostgreSQL HA pods|
|networkPolicy.extraEgress[2]|list|-|Destination selectors for Redis access|
|networkPolicy.extraEgress[2].ports|list|-|Allowed ports for Redis traffic|
|networkPolicy.extraEgress[2].ports[0]|string|`{"port":6379,"protocol":"TCP"}`|Protocol for Redis|
|networkPolicy.extraEgress[2].ports[0].port|int|`6379`|Redis port number|
|networkPolicy.extraEgress[2].to[0]|object|-|Pod selector for Redis|
|networkPolicy.extraEgress[2].to[0].podSelector.matchLabels|object|-|Labels to match Redis pods|
|networkPolicy.extraEgress[2].to[0].podSelector.matchLabels."app.kubernetes.io/name"|string|`"redis"`|Application label selecting the Redis pods|
|networkPolicy.extraEgress[3]|list|-|Destination selectors for external HTTPS access|
|networkPolicy.extraEgress[3].ports|list|-|Allowed ports for external HTTPS traffic|
|networkPolicy.extraEgress[3].ports[0]|string|`{"port":443,"protocol":"TCP"}`|Protocol for HTTPS|
|networkPolicy.extraEgress[3].ports[0].port|int|`443`|HTTPS port number|
|networkPolicy.extraEgress[3].to[0]|object|-|Namespace selector for all namespaces|
|networkPolicy.extraIngress|list|-|Add extra ingress rules to the NetworkPolicy|
|networkPolicy.extraIngress[0]|list|-|Source selectors for ingress traffic|
|networkPolicy.extraIngress[0].from[0]|object|-|Namespace selector for ingress-nginx|
|networkPolicy.extraIngress[0].from[0].namespaceSelector.matchLabels|object|-|Labels to match ingress-nginx namespace|
|networkPolicy.extraIngress[0].from[0].namespaceSelector.matchLabels."kubernetes.io/metadata.name"|string|`"ingress-nginx"`|Namespace label selecting the ingress-nginx controller|
|networkPolicy.extraIngress[0].from[1]|object|-|Pod selector for dapp pods|
|networkPolicy.extraIngress[0].from[1].podSelector.matchLabels|object|-|Labels to match dapp pods|
|networkPolicy.extraIngress[0].from[1].podSelector.matchLabels."app.kubernetes.io/name"|string|`"dapp"`|Application label selecting the dApp frontend pods|
|networkPolicy.extraIngress[0].from[2]|object|-|Pod selector for same namespace pods|
|networkPolicy.extraIngress[0].ports|list|-|Allowed ports for ingress traffic|
|networkPolicy.extraIngress[0].ports[0]|string|`{"port":3000,"protocol":"TCP"}`|Protocol for HTTP port|
|networkPolicy.extraIngress[0].ports[0].port|int|`3000`|HTTP port number|
|networkPolicy.extraIngress[0].ports[1]|string|`{"port":3001,"protocol":"TCP"}`|Protocol for GraphQL port|
|networkPolicy.extraIngress[0].ports[1].port|int|`3001`|GraphQL port number|
|networkPolicy.ingressRules|object|-|Ingress rules configuration|
|networkPolicy.ingressRules.accessOnlyFrom|object|-|Access restrictions configuration|
|networkPolicy.ingressRules.accessOnlyFrom.enabled|bool|`false`|Enable ingress rule that makes Portal only accessible from a particular origin.|
|networkPolicy.ingressRules.accessOnlyFrom.namespaceSelector|object|-|Namespace selector label that is allowed to access Portal. This label will be used to identified allowed namespace(s).|
|networkPolicy.ingressRules.accessOnlyFrom.podSelector|object|-|Pods selector label that is allowed to access Portal. This label will be used to identified allowed pod(s).|
|nodeAffinityPreset|object|-|Node affinity preset configuration|
|nodeAffinityPreset.key|string|`""`|Node label key to match. Ignored if `affinity` is set|
|nodeAffinityPreset.type|string|`""`|Node affinity preset type. Ignored if `affinity` is set. Allowed values: `soft` or `hard`|
|nodeAffinityPreset.values|list|-|Node label values to match. Ignored if `affinity` is set|
|nodeSelector|object|-|Node labels for pod assignment|
|openShiftRoute|object|-|OpenShift Route parameters|
|openShiftRoute.alternateBackends|list|-|Additional backends for weighted routing|
|openShiftRoute.annotations|object|-|Additional annotations for the OpenShift route resource|
|openShiftRoute.enabled|bool|`false`|Enable OpenShift route creation for Portal|
|openShiftRoute.graphql|object|-|GraphQL route specific configuration|
|openShiftRoute.graphql.alternateBackends|list|-|Additional backends for weighted routing (same structure as openShiftRoute.alternateBackends)|
|openShiftRoute.graphql.annotations|object|-|Additional annotations for the GraphQL route resource|
|openShiftRoute.graphql.enabled|bool|`true`|Enable a dedicated route for the GraphQL endpoint|
|openShiftRoute.graphql.host|string|`""`|Hostname exposed via the GraphQL route (defaults to openShiftRoute.host when empty)|
|openShiftRoute.graphql.path|string|`""`|HTTP path exposed via the GraphQL route (defaults to ingress.graphqlPath)|
|openShiftRoute.graphql.port|object|-|Service port configuration for the GraphQL route target|
|openShiftRoute.graphql.port.targetPort|string|`""`|Service target port name (defaults to `graphql`)|
|openShiftRoute.graphql.tls|object|-|TLS configuration for the GraphQL route|
|openShiftRoute.graphql.to|object|-|Primary service weight configuration for the GraphQL route|
|openShiftRoute.graphql.to.weight|string|`""`|Weight assigned to the Portal service backend (defaults to openShiftRoute.to.weight)|
|openShiftRoute.graphql.wildcardPolicy|string|`""`|Wildcard policy to apply to the GraphQL route (defaults to openShiftRoute.wildcardPolicy)|
|openShiftRoute.host|string|`"portal.k8s.orb.local"`|Hostname exposed via the OpenShift route|
|openShiftRoute.path|string|`"/"`|HTTP path exposed via the OpenShift route|
|openShiftRoute.port|object|-|Service port configuration for the route target|
|openShiftRoute.port.targetPort|string|`"http"`|Service target port name (must exist on the Portal service)|
|openShiftRoute.tls|object|-|TLS configuration for the OpenShift route|
|openShiftRoute.to|object|-|Primary service weight configuration|
|openShiftRoute.to.weight|int|`100`|Weight assigned to the Portal service backend|
|openShiftRoute.wildcardPolicy|string|`"None"`|Wildcard policy to apply to the route|
|pdb|object|-|Pod disruption budget configuration|
|pdb.enabled|bool|`false`|If true, create a pod disruption budget for pods.|
|pdb.maxUnavailable|string|`""`|Maximum number/percentage of pods that may be made unavailable. Defaults to 1 if both pdb.minAvailable and pdb.maxUnavailable are empty.|
|pdb.minAvailable|string|`""`|Minimum number/percentage of pods that should remain scheduled|
|podAffinityPreset|string|`""`|Pod affinity preset. Ignored if `affinity` is set. Allowed values: `soft` or `hard`|
|podAnnotations|object|-|Annotations for Portal pods|
|podAnnotations."prometheus.io/path"|string|`"/portal-metrics"`|Metrics endpoint path served by the Portal pods|
|podAnnotations."prometheus.io/port"|string|`"3000"`|Metrics port exposed by the Portal pods|
|podAnnotations."prometheus.io/scrape"|string|`"true"`|Enable Prometheus scraping for Portal pods|
|podAntiAffinityPreset|string|`"soft"`|Pod anti-affinity preset. Ignored if `affinity` is set. Allowed values: `soft` or `hard`|
|podLabels|object|-|Extra labels for Portal pods|
|podLabels."app.kubernetes.io/component"|string|`"portal"`|Component label identifying pods as part of the Portal application|
|podSecurityContext|object|-|Pod Security Context configuration (overrides global.securityContexts.pod)|
|priorityClassName|string|`""`|Portal pods' priority class name|
|rbac|object|-|RBAC configuration controlling whether Role/RoleBinding resources are rendered.|
|rbac.create|bool|`true`|Create Role/RoleBinding granting the portal access to ABI ConfigMaps.|
|readinessProbe|object|-|Configure Portal containers' readiness probe|
|readinessProbe.enabled|bool|`true`|Enable readinessProbe on Portal containers|
|readinessProbe.failureThreshold|int|`3`|Failure threshold for readinessProbe|
|readinessProbe.initialDelaySeconds|int|`5`|Initial delay seconds for readinessProbe|
|readinessProbe.periodSeconds|int|`10`|Period seconds for readinessProbe|
|readinessProbe.successThreshold|int|`1`|Success threshold for readinessProbe|
|readinessProbe.tcpSocket|object|-|TCP socket parameters for readinessProbe|
|readinessProbe.tcpSocket.port|string|`"http"`|Port for tcpSocket readinessProbe|
|readinessProbe.timeoutSeconds|int|`5`|Timeout seconds for readinessProbe|
|replicaCount|int|`1`|Number of Portal replicas to deploy|
|resources|object|-|Portal containers resource requests and limits|
|schedulerName|string|`""`|Alternate scheduler|
|service|object|-|Service parameters|
|service.annotations|object|-|Additional custom annotations for Portal service|
|service.clusterIP|string|`""`|Portal service Cluster IP|
|service.externalTrafficPolicy|string|`"Cluster"`|Portal service external traffic policy|
|service.extraPorts|list|-|Extra ports to expose in the Portal service (normally used with the `sidecar` value)|
|service.graphqlNodePort|string|`""`|Node port for GraphQL|
|service.graphqlPort|int|`3001`|Portal service GraphQL port|
|service.loadBalancerIP|string|`""`|Portal service Load Balancer IP|
|service.loadBalancerSourceRanges|list|-|Portal service Load Balancer sources|
|service.nodePort|string|`""`|Node port for HTTP|
|service.port|int|`3000`|Portal service HTTP port|
|service.sessionAffinity|string|`"None"`|Session Affinity for Kubernetes service, can be "None" or "ClientIP"|
|service.sessionAffinityConfig|object|-|Additional settings for the sessionAffinity|
|service.type|string|`"ClusterIP"`|Portal service type|
|serviceAccount|object|-|Service account for Portal pods|
|serviceAccount.annotations|object|-|Annotations for service account. Evaluated as a template. Only used if `create` is `true`.|
|serviceAccount.automountServiceAccountToken|bool|`true`|Automount service account token for the deployment controller service account|
|serviceAccount.create|bool|`true`|Specifies whether a ServiceAccount should be created|
|serviceAccount.labels|object|-|Extra labels to be added to the service account|
|serviceAccount.name|string|`""`|The name of the ServiceAccount to use.|
|startupProbe|object|-|Configure Portal containers' startup probe|
|startupProbe.enabled|bool|`false`|Enable startupProbe on Portal containers|
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
|updateStrategy|object|-|Update strategy configuration for Portal deployment|
|updateStrategy.rollingUpdate|object|-|Portal deployment rolling update configuration parameters|
|updateStrategy.type|string|`"RollingUpdate"`|Portal deployment strategy type|

## Resource Summary

| Component | Replicas | Request CPU | Limit CPU | Request Memory | Limit Memory | Storage |
|-----------|----------|-------------|-----------|----------------|--------------|---------|
| initContainer.downloadAbi | 1 | 25m | 450m | 64Mi | 128Mi | - |
| initContainer.tcpCheck | 1 | 10m | 300m | 32Mi | 64Mi | - |
| **Totals** | - | 0.04 cores (35m) | 0.75 cores (750m) | 96Mi (0.09Gi) | 192Mi (0.19Gi) | - |

## Maintainers

| Name | Email | Url |
| ---- | ------ | --- |
| SettleMint | <support@settlemint.com> | <https://settlemint.com> |

## Source Code

* <https://github.com/settlemint/starterkit-asset-tokenization>

## Requirements

Kubernetes: `>=1.21.0-0`


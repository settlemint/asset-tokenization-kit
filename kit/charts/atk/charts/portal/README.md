# portal

![Version: 0.1.1](https://img.shields.io/badge/Version-0.1.1-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: 8.5.5](https://img.shields.io/badge/AppVersion-8.5.5-informational?style=flat-square)

Portal is a comprehensive blockchain data management and querying service that provides
real-time access to on-chain data through GraphQL APIs. It serves as the central data
access layer for the Asset Tokenization Kit, offering high-performance queries, data
synchronization, and API endpoints for frontend applications and external integrations.

## Introduction

Portal is a powerful blockchain data management and querying service designed specifically for the Asset Tokenization Kit. It provides a comprehensive GraphQL API layer that enables real-time access to on-chain data, making it easy for frontend applications and external integrations to interact with blockchain data.

## Features

- **GraphQL API**: Modern, flexible API for querying blockchain data with precise field selection
- **Real-time Data Sync**: Automatic synchronization with blockchain events and state changes
- **High Performance**: Optimized queries with Redis caching for fast response times
- **PostgreSQL Backend**: Reliable data storage with full ACID compliance
- **Multi-Asset Support**: Handles all asset types in the Asset Tokenization Kit (bonds, equity, stablecoins, etc.)
- **Scalable Architecture**: Horizontal scaling support with built-in autoscaling
- **Enterprise Security**: Network policies, pod security contexts, and RBAC support
- **Monitoring Ready**: Integrated health checks and readiness probes

## Benefits

- **Simplified Integration**: Single GraphQL endpoint for all blockchain data queries
- **Reduced Complexity**: No need to directly interact with blockchain nodes
- **Better Performance**: Cached queries and optimized database indexes
- **Developer Friendly**: Self-documenting GraphQL schema with introspection
- **Production Ready**: Battle-tested with enterprise-grade reliability

## Use Cases

- **Frontend Applications**: Power web and mobile apps with real-time blockchain data
- **Analytics Dashboards**: Build comprehensive analytics and reporting tools
- **External Integrations**: Connect blockchain data to external systems via API
- **Data Aggregation**: Combine on-chain and off-chain data in a single query
- **Event Processing**: React to blockchain events with webhooks and subscriptions

**Homepage:** <https://settlemint.com/>

## Prerequisites

- Kubernetes 1.21+
- Helm 3.2.0+
- PostgreSQL database (can use Bitnami PostgreSQL chart)
- Redis cache (can use Bitnami Redis chart)
- Access to a blockchain RPC endpoint (e.g., through txsigner)

## Connection Requirements

Update the following sections of `values.yaml` to point Portal at your infrastructure:

| Service | Values path | Default |
| --- | --- | --- |
| PostgreSQL | `portal.config.postgresqlConnection` | `postgresql://portal:atk@postgresql:5432/portal?sslmode=disable` |
| Redis cache | `portal.config.redis` | `redis://default:atk@redis:6379/4` |

Provide external hostnames, credentials, logical database numbers, and SSL settings where required.

## Installing the Chart

To install the chart with the release name `my-portal`:

```bash
helm repo add settlemint https://charts.settlemint.com
helm install my-portal settlemint/portal
```

## Uninstalling the Chart

To uninstall/delete the `my-portal` deployment:

```bash
helm delete my-portal
```

The command removes all the Kubernetes components associated with the chart and deletes the release.

## Configuration

The following table lists the configurable parameters of the Portal chart and their default values.

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| affinity | object | `{}` | Affinity for pod assignment |
| autoscaling | object | `{"builtInMetrics":[{"resource":{"name":"cpu","target":{"averageUtilization":80,"type":"Utilization"}},"type":"Resource"},{"resource":{"name":"memory","target":{"averageUtilization":80,"type":"Utilization"}},"type":"Resource"}],"customMetrics":[],"enabled":false,"maxReplicas":3,"minReplicas":1}` | Autoscaling configuration for Portal |
| autoscaling.builtInMetrics | list | `[{"resource":{"name":"cpu","target":{"averageUtilization":80,"type":"Utilization"}},"type":"Resource"},{"resource":{"name":"memory","target":{"averageUtilization":80,"type":"Utilization"}},"type":"Resource"}]` | Built-in metrics configuration |
| autoscaling.customMetrics | list | `[]` | Custom metrics configuration |
| autoscaling.enabled | bool | `false` | Enable autoscaling for Portal |
| autoscaling.maxReplicas | int | `3` | Maximum number of Portal replicas |
| autoscaling.minReplicas | int | `1` | Minimum number of Portal replicas |
| commonAnnotations | object | `{}` | Annotations to add to all deployed objects |
| commonLabels | object | `{}` | Labels to add to all deployed objects |
| config | object | `{"network":{"networkId":"53771311147","networkName":"ATK","nodeRpcUrl":"http://txsigner:3000"},"postgresql":"postgresql://portal:atk@postgresql:5432/portal?sslmode=disable","redis":{"host":"redis","password":"atk","port":6379,"username":"default"}}` | Portal configuration |
| config.network | object | `{"networkId":"53771311147","networkName":"ATK","nodeRpcUrl":"http://txsigner:3000"}` | Network configuration |
| config.network.networkId | string | `"53771311147"` | Network ID |
| config.network.networkName | string | `"ATK"` | Network name |
| config.network.nodeRpcUrl | string | `"http://txsigner:3000"` | Node RPC URL |
| config.postgresql | string | `"postgresql://portal:atk@postgresql:5432/portal?sslmode=disable"` | PostgreSQL connection string |
| config.redis | object | `{"host":"redis","password":"atk","port":6379,"username":"default"}` | Redis configuration |
| config.redis.host | string | `"redis"` | Redis host |
| config.redis.password | string | `"atk"` | Redis password |
| config.redis.port | int | `6379` | Redis port |
| config.redis.username | string | `"default"` | Redis username |
| containerSecurityContext | object | `{"allowPrivilegeEscalation":false,"capabilities":{"drop":["ALL"]},"readOnlyRootFilesystem":false,"runAsGroup":1001,"runAsNonRoot":true,"runAsUser":1001,"seccompProfile":{"type":"RuntimeDefault"}}` | Container Security Context configuration |
| extraEnvVars | list | `[]` | Array with extra environment variables to add to Portal nodes |
| extraEnvVarsCM | string | `""` | Name of existing ConfigMap containing extra env vars for Portal nodes |
| extraEnvVarsSecret | string | `""` | Name of existing Secret containing extra env vars for Portal nodes |
| extraVolumeMounts | list | `[]` | Optionally specify extra list of additional volumeMounts for the Portal container(s) |
| extraVolumes | list | `[]` | Optionally specify extra list of additional volumes for the Portal pod(s) |
| fullnameOverride | string | `"portal"` | String to fully override common.names.fullname |
| global | object | `{"imagePullSecrets":[],"imageRegistry":"","labels":{},"storageClass":""}` | Global Docker image registry |
| global.imagePullSecrets | list | `[]` | Global Docker registry secret names as an array |
| global.imageRegistry | string | `""` | Global Docker image registry |
| global.labels | object | `{}` | Global labels to add to all objects |
| global.storageClass | string | `""` | Global StorageClass for Persistent Volume(s) |
| image | object | `{"digest":"","pullPolicy":"IfNotPresent","pullSecrets":[],"registry":"ghcr.io","repository":"settlemint/btp-scs-portal","tag":"8.6.7"}` | Portal image |
| image.digest | string | `""` | Portal image digest in the way sha256:aa.... Please note this parameter, if set, will override the tag |
| image.pullPolicy | string | `"IfNotPresent"` | Portal image pull policy |
| image.pullSecrets | list | `[]` | Portal image pull secrets |
| image.registry | string | `"ghcr.io"` | Portal image registry |
| image.repository | string | `"settlemint/btp-scs-portal"` | Portal image repository |
| image.tag | string | `"8.6.7"` | Portal image tag (immutable tags are recommended) |
| ingress | object | `{"annotations":{},"apiVersion":"","enabled":true,"extraHosts":[],"extraPaths":[],"extraRules":[],"extraTls":[],"graphqlPath":"/graphql","hostname":"portal.k8s.orb.local","ingressClassName":"atk-nginx","path":"/","pathType":"ImplementationSpecific","secrets":[],"selfSigned":false,"tls":false}` | Ingress parameters |
| ingress.annotations | object | `{}` | Additional annotations for the Ingress resource. To enable certificate autogeneration, place here your cert-manager annotations. |
| ingress.apiVersion | string | `""` | Force Ingress API version (automatically detected if not set) |
| ingress.enabled | bool | `true` | Enable ingress record generation for Portal |
| ingress.extraHosts | list | `[]` | An array with additional hostname(s) to be covered with the ingress record |
| ingress.extraPaths | list | `[]` | An array with additional arbitrary paths that may need to be added to the ingress under the main host |
| ingress.extraRules | list | `[]` | Additional rules to be covered with this ingress record |
| ingress.extraTls | list | `[]` | TLS configuration for additional hostname(s) to be covered with this ingress record |
| ingress.graphqlPath | string | `"/graphql"` | Additional path for GraphQL endpoint |
| ingress.hostname | string | `"portal.k8s.orb.local"` | Default host for the ingress record |
| ingress.ingressClassName | string | `"atk-nginx"` | IngressClass that will be be used to implement the Ingress (Kubernetes 1.18+) |
| ingress.path | string | `"/"` | Default path for the ingress record |
| ingress.pathType | string | `"ImplementationSpecific"` | Ingress path type |
| ingress.secrets | list | `[]` | Custom TLS certificates as secrets |
| ingress.selfSigned | bool | `false` | Create a TLS secret for this ingress record using self-signed certificates generated by Helm |
| ingress.tls | bool | `false` | Enable TLS configuration for the host defined at `ingress.hostname` parameter |
| initContainer.copyArtifacts.resources.limits.cpu | string | `"100m"` |  |
| initContainer.copyArtifacts.resources.limits.cpu | string | `"150m"` |  |
| initContainer.copyArtifacts.resources.limits.memory | string | `"128Mi"` |  |
| initContainer.copyArtifacts.resources.limits.memory | string | `"128Mi"` |  |
| initContainer.copyArtifacts.resources.requests.cpu | string | `"50m"` |  |
| initContainer.copyArtifacts.resources.requests.cpu | string | `"25m"` |  |
| initContainer.copyArtifacts.resources.requests.memory | string | `"64Mi"` |  |
| initContainer.copyArtifacts.resources.requests.memory | string | `"64Mi"` |  |
| initContainer.copyArtifacts.securityContext.allowPrivilegeEscalation | bool | `false` |  |
| initContainer.copyArtifacts.securityContext.capabilities.drop[0] | string | `"ALL"` |  |
| initContainer.copyArtifacts.securityContext.runAsGroup | int | `1001` |  |
| initContainer.copyArtifacts.securityContext.runAsNonRoot | bool | `true` |  |
| initContainer.copyArtifacts.securityContext.runAsUser | int | `1001` |  |
| initContainer.copyArtifacts.securityContext.seccompProfile.type | string | `"RuntimeDefault"` |  |
| initContainer.tcpCheck.enabled | bool | `true` |  |
| initContainer.tcpCheck.image.pullPolicy | string | `"IfNotPresent"` |  |
| initContainer.tcpCheck.image.repository | string | `"ghcr.io/settlemint/btp-waitforit"` |  |
| initContainer.tcpCheck.image.tag | string | `"v7.7.10"` |  |
| initContainer.tcpCheck.resources.dependencies[0].endpoint | string | `"postgresql:5432"` |  |
| initContainer.tcpCheck.resources.dependencies[0].name | string | `"postgresql"` |  |
| initContainer.tcpCheck.resources.limits.cpu | string | `"100m"` |  |
| initContainer.tcpCheck.resources.limits.memory | string | `"64Mi"` |  |
| initContainer.tcpCheck.resources.requests.cpu | string | `"10m"` |  |
| initContainer.tcpCheck.resources.requests.memory | string | `"32Mi"` |  |
| initContainer.tcpCheck.timeout | int | `120` |  |
| lifecycleHooks | object | `{}` | lifecycleHooks for the Portal container(s) to automate configuration before or after startup |
| livenessProbe | object | `{"enabled":true,"failureThreshold":3,"initialDelaySeconds":10,"periodSeconds":10,"successThreshold":1,"tcpSocket":{"port":"http"},"timeoutSeconds":5}` | Configure Portal containers' liveness probe |
| livenessProbe.enabled | bool | `true` | Enable livenessProbe on Portal containers |
| livenessProbe.failureThreshold | int | `3` | Failure threshold for livenessProbe |
| livenessProbe.initialDelaySeconds | int | `10` | Initial delay seconds for livenessProbe |
| livenessProbe.periodSeconds | int | `10` | Period seconds for livenessProbe |
| livenessProbe.successThreshold | int | `1` | Success threshold for livenessProbe |
| livenessProbe.tcpSocket | object | `{"port":"http"}` | TCP socket parameters for livenessProbe |
| livenessProbe.tcpSocket.port | string | `"http"` | Port for tcpSocket livenessProbe |
| livenessProbe.timeoutSeconds | int | `5` | Timeout seconds for livenessProbe |
| nameOverride | string | `""` | String to partially override common.names.fullname template (will maintain the release name) |
| networkPolicy | object | `{"addExternalClientAccess":true,"allowExternal":true,"allowExternalEgress":true,"enabled":false,"extraEgress":[{"ports":[{"port":53,"protocol":"UDP"}],"to":[{"namespaceSelector":{},"podSelector":{"matchLabels":{"k8s-app":"kube-dns"}}}]},{"ports":[{"port":5432,"protocol":"TCP"}],"to":[{"podSelector":{"matchLabels":{"app.kubernetes.io/name":"postgresql-ha"}}}]},{"ports":[{"port":6379,"protocol":"TCP"}],"to":[{"podSelector":{"matchLabels":{"app.kubernetes.io/name":"redis"}}}]},{"ports":[{"port":443,"protocol":"TCP"}],"to":[{"namespaceSelector":{}}]}],"extraIngress":[{"from":[{"namespaceSelector":{"matchLabels":{"kubernetes.io/metadata.name":"ingress-nginx"}}},{"podSelector":{"matchLabels":{"app.kubernetes.io/name":"dapp"}}},{"podSelector":{}}],"ports":[{"port":3000,"protocol":"TCP"},{"port":3001,"protocol":"TCP"}]}],"ingressRules":{"accessOnlyFrom":{"enabled":false,"namespaceSelector":{},"podSelector":{}}}}` | Network policies configuration |
| networkPolicy.addExternalClientAccess | bool | `true` | Allow access from pods with client label set to "true". Ignored if `networkPolicy.allowExternal` is true. |
| networkPolicy.allowExternal | bool | `true` | The Policy model to apply |
| networkPolicy.allowExternalEgress | bool | `true` | Allow the pod to access any range of port and all destinations. |
| networkPolicy.enabled | bool | `false` | Enable creation of NetworkPolicy resources |
| networkPolicy.extraEgress | list | `[{"ports":[{"port":53,"protocol":"UDP"}],"to":[{"namespaceSelector":{},"podSelector":{"matchLabels":{"k8s-app":"kube-dns"}}}]},{"ports":[{"port":5432,"protocol":"TCP"}],"to":[{"podSelector":{"matchLabels":{"app.kubernetes.io/name":"postgresql-ha"}}}]},{"ports":[{"port":6379,"protocol":"TCP"}],"to":[{"podSelector":{"matchLabels":{"app.kubernetes.io/name":"redis"}}}]},{"ports":[{"port":443,"protocol":"TCP"}],"to":[{"namespaceSelector":{}}]}]` | Add extra egress rules to the NetworkPolicy (ignored if allowExternalEgress=true) |
| networkPolicy.extraIngress | list | `[{"from":[{"namespaceSelector":{"matchLabels":{"kubernetes.io/metadata.name":"ingress-nginx"}}},{"podSelector":{"matchLabels":{"app.kubernetes.io/name":"dapp"}}},{"podSelector":{}}],"ports":[{"port":3000,"protocol":"TCP"},{"port":3001,"protocol":"TCP"}]}]` | Add extra ingress rules to the NetworkPolicy |
| networkPolicy.ingressRules | object | `{"accessOnlyFrom":{"enabled":false,"namespaceSelector":{},"podSelector":{}}}` | Ingress rules configuration |
| networkPolicy.ingressRules.accessOnlyFrom | object | `{"enabled":false,"namespaceSelector":{},"podSelector":{}}` | Access restrictions configuration |
| networkPolicy.ingressRules.accessOnlyFrom.enabled | bool | `false` | Enable ingress rule that makes Portal only accessible from a particular origin. |
| networkPolicy.ingressRules.accessOnlyFrom.namespaceSelector | object | `{}` | Namespace selector label that is allowed to access Portal. This label will be used to identified allowed namespace(s). |
| networkPolicy.ingressRules.accessOnlyFrom.podSelector | object | `{}` | Pods selector label that is allowed to access Portal. This label will be used to identified allowed pod(s). |
| nodeAffinityPreset | object | `{"key":"","type":"","values":[]}` | Node affinity preset configuration |
| nodeAffinityPreset.key | string | `""` | Node label key to match. Ignored if `affinity` is set |
| nodeAffinityPreset.type | string | `""` | Node affinity preset type. Ignored if `affinity` is set. Allowed values: `soft` or `hard` |
| nodeAffinityPreset.values | list | `[]` | Node label values to match. Ignored if `affinity` is set |
| nodeSelector | object | `{}` | Node labels for pod assignment |
| openShiftRoute | object | `{"alternateBackends":[],"annotations":{},"enabled":false,"graphql":{"alternateBackends":[],"annotations":{},"enabled":true,"host":"","path":"","port":{"targetPort":""},"tls":null,"to":{"weight":""},"wildcardPolicy":""},"host":"portal.k8s.orb.local","path":"/","port":{"targetPort":"http"},"tls":null,"to":{"weight":100},"wildcardPolicy":"None"}` | OpenShift Route parameters |
| openShiftRoute.alternateBackends | list | `[]` | Additional backends for weighted routing |
| openShiftRoute.annotations | object | `{}` | Additional annotations for the OpenShift route resource |
| openShiftRoute.enabled | bool | `false` | Enable OpenShift route creation for Portal |
| openShiftRoute.graphql | object | `{"alternateBackends":[],"annotations":{},"enabled":true,"host":"","path":"","port":{"targetPort":""},"tls":null,"to":{"weight":""},"wildcardPolicy":""}` | GraphQL route specific configuration |
| openShiftRoute.graphql.alternateBackends | list | `[]` | Additional backends for weighted routing (same structure as openShiftRoute.alternateBackends) |
| openShiftRoute.graphql.annotations | object | `{}` | Additional annotations for the GraphQL route resource |
| openShiftRoute.graphql.enabled | bool | `true` | Enable a dedicated route for the GraphQL endpoint |
| openShiftRoute.graphql.host | string | `""` | Hostname exposed via the GraphQL route (defaults to openShiftRoute.host when empty) |
| openShiftRoute.graphql.path | string | `""` | HTTP path exposed via the GraphQL route (defaults to ingress.graphqlPath) |
| openShiftRoute.graphql.port | object | `{"targetPort":""}` | Service port configuration for the GraphQL route target |
| openShiftRoute.graphql.port.targetPort | string | `""` | Service target port name (defaults to `graphql`) |
| openShiftRoute.graphql.tls | string | `nil` | TLS configuration for the GraphQL route |
| openShiftRoute.graphql.to | object | `{"weight":""}` | Primary service weight configuration for the GraphQL route |
| openShiftRoute.graphql.to.weight | string | `""` | Weight assigned to the Portal service backend (defaults to openShiftRoute.to.weight) |
| openShiftRoute.graphql.wildcardPolicy | string | `""` | Wildcard policy to apply to the GraphQL route (defaults to openShiftRoute.wildcardPolicy) |
| openShiftRoute.host | string | `"portal.k8s.orb.local"` | Hostname exposed via the OpenShift route |
| openShiftRoute.path | string | `"/"` | HTTP path exposed via the OpenShift route |
| openShiftRoute.port | object | `{"targetPort":"http"}` | Service port configuration for the route target |
| openShiftRoute.port.targetPort | string | `"http"` | Service target port name (must exist on the Portal service) |
| openShiftRoute.tls | string | `nil` | TLS configuration for the OpenShift route |
| openShiftRoute.to | object | `{"weight":100}` | Primary service weight configuration |
| openShiftRoute.to.weight | int | `100` | Weight assigned to the Portal service backend |
| openShiftRoute.wildcardPolicy | string | `"None"` | Wildcard policy to apply to the route |
| pdb | object | `{"enabled":false,"maxUnavailable":"","minAvailable":""}` | Pod disruption budget configuration |
| pdb.enabled | bool | `false` | If true, create a pod disruption budget for pods. |
| pdb.maxUnavailable | string | `""` | Maximum number/percentage of pods that may be made unavailable. Defaults to 1 if both pdb.minAvailable and pdb.maxUnavailable are empty. |
| pdb.minAvailable | string | `""` | Minimum number/percentage of pods that should remain scheduled |
| podAffinityPreset | string | `""` | Pod affinity preset. Ignored if `affinity` is set. Allowed values: `soft` or `hard` |
| podAnnotations | object | `{}` | Annotations for Portal pods |
| podAntiAffinityPreset | string | `"soft"` | Pod anti-affinity preset. Ignored if `affinity` is set. Allowed values: `soft` or `hard` |
| podLabels | object | `{}` | Extra labels for Portal pods |
| podSecurityContext | object | `{"fsGroup":1001,"runAsNonRoot":true,"seccompProfile":{"type":"RuntimeDefault"}}` | Pod Security Context configuration |
| priorityClassName | string | `""` | Portal pods' priority class name |
| readinessProbe | object | `{"enabled":true,"failureThreshold":3,"initialDelaySeconds":5,"periodSeconds":10,"successThreshold":1,"tcpSocket":{"port":"http"},"timeoutSeconds":5}` | Configure Portal containers' readiness probe |
| readinessProbe.enabled | bool | `true` | Enable readinessProbe on Portal containers |
| readinessProbe.failureThreshold | int | `3` | Failure threshold for readinessProbe |
| readinessProbe.initialDelaySeconds | int | `5` | Initial delay seconds for readinessProbe |
| readinessProbe.periodSeconds | int | `10` | Period seconds for readinessProbe |
| readinessProbe.successThreshold | int | `1` | Success threshold for readinessProbe |
| readinessProbe.tcpSocket | object | `{"port":"http"}` | TCP socket parameters for readinessProbe |
| readinessProbe.tcpSocket.port | string | `"http"` | Port for tcpSocket readinessProbe |
| readinessProbe.timeoutSeconds | int | `5` | Timeout seconds for readinessProbe |
| replicaCount | int | `1` | Number of Portal replicas to deploy |
| resources | object | `{}` | Portal containers resource requests and limits |
| schedulerName | string | `""` | Alternate scheduler |
| service | object | `{"annotations":{},"clusterIP":"","externalTrafficPolicy":"Cluster","extraPorts":[],"graphqlNodePort":"","graphqlPort":3001,"loadBalancerIP":"","loadBalancerSourceRanges":[],"nodePort":"","port":3000,"sessionAffinity":"None","sessionAffinityConfig":{},"type":"ClusterIP"}` | Service parameters |
| service.annotations | object | `{}` | Additional custom annotations for Portal service |
| service.clusterIP | string | `""` | Portal service Cluster IP |
| service.externalTrafficPolicy | string | `"Cluster"` | Portal service external traffic policy |
| service.extraPorts | list | `[]` | Extra ports to expose in the Portal service (normally used with the `sidecar` value) |
| service.graphqlNodePort | string | `""` | Node port for GraphQL |
| service.graphqlPort | int | `3001` | Portal service GraphQL port |
| service.loadBalancerIP | string | `""` | Portal service Load Balancer IP |
| service.loadBalancerSourceRanges | list | `[]` | Portal service Load Balancer sources |
| service.nodePort | string | `""` | Node port for HTTP |
| service.port | int | `3000` | Portal service HTTP port |
| service.sessionAffinity | string | `"None"` | Session Affinity for Kubernetes service, can be "None" or "ClientIP" |
| service.sessionAffinityConfig | object | `{}` | Additional settings for the sessionAffinity |
| service.type | string | `"ClusterIP"` | Portal service type |
| serviceAccount | object | `{"annotations":{},"automountServiceAccountToken":false,"create":true,"labels":{},"name":""}` | Service account for Portal pods |
| serviceAccount.annotations | object | `{}` | Annotations for service account. Evaluated as a template. Only used if `create` is `true`. |
| serviceAccount.automountServiceAccountToken | bool | `false` | Automount service account token for the deployment controller service account |
| serviceAccount.create | bool | `true` | Specifies whether a ServiceAccount should be created |
| serviceAccount.labels | object | `{}` | Extra labels to be added to the service account |
| serviceAccount.name | string | `""` | The name of the ServiceAccount to use. |
| startupProbe | object | `{"enabled":false,"failureThreshold":10,"initialDelaySeconds":30,"periodSeconds":10,"successThreshold":1,"timeoutSeconds":5}` | Configure Portal containers' startup probe |
| startupProbe.enabled | bool | `false` | Enable startupProbe on Portal containers |
| startupProbe.failureThreshold | int | `10` | Failure threshold for startupProbe |
| startupProbe.initialDelaySeconds | int | `30` | Initial delay seconds for startupProbe |
| startupProbe.periodSeconds | int | `10` | Period seconds for startupProbe |
| startupProbe.successThreshold | int | `1` | Success threshold for startupProbe |
| startupProbe.timeoutSeconds | int | `5` | Timeout seconds for startupProbe |
| tests | object | `{"image":{"pullPolicy":"IfNotPresent","registry":"docker.io","repository":"busybox","tag":"1.37.0"}}` | Test parameters |
| tests.image | object | `{"pullPolicy":"IfNotPresent","registry":"docker.io","repository":"busybox","tag":"1.37.0"}` | Image for test pods |
| tests.image.pullPolicy | string | `"IfNotPresent"` | Test image pull policy |
| tests.image.registry | string | `"docker.io"` | Test image registry |
| tests.image.repository | string | `"busybox"` | Test image repository |
| tests.image.tag | string | `"1.37.0"` | Test image tag |
| tolerations | list | `[]` | Tolerations for pod assignment |
| topologySpreadConstraints | list | `[]` | Topology Spread Constraints for pod assignment |
| updateStrategy | object | `{"rollingUpdate":{},"type":"RollingUpdate"}` | Update strategy configuration for Portal deployment |
| updateStrategy.rollingUpdate | object | `{}` | Portal deployment rolling update configuration parameters |
| updateStrategy.type | string | `"RollingUpdate"` | Portal deployment strategy type |

Specify each parameter using the `--set key=value[,key=value]` argument to `helm install`. For example,

```bash
helm install my-portal \
  --set config.network.networkId="1" \
  --set config.network.networkName="Mainnet" \
  settlemint/portal
```

Alternatively, a YAML file that specifies the values for the above parameters can be provided while installing the chart. For example,

```bash
helm install my-portal -f values.yaml settlemint/portal
```

## Configuration Examples

### Basic Configuration

```yaml
config:
  network:
    networkId: "53771311147"
    networkName: "ATK"
    nodeRpcUrl: "http://txsigner:3000"
  postgresql: "postgresql://portal:password@postgresql:5432/portal?sslmode=disable"
  redis:
    host: "redis-master"
    port: 6379
    username: "default"
    password: "redis-password"
```

### Production Configuration with Security

```yaml
replicaCount: 3

podSecurityContext:
  enabled: true
  runAsNonRoot: true
  runAsUser: 1001
  fsGroup: 1001

containerSecurityContext:
  enabled: true
  runAsNonRoot: true
  runAsUser: 1001
  readOnlyRootFilesystem: true
  allowPrivilegeEscalation: false

networkPolicy:
  enabled: true
  allowExternal: false

resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 250m
    memory: 256Mi

autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 10

pdb:
  enabled: true
  minAvailable: 2
```

### External Database Configuration

```yaml
config:
  postgresql: "postgresql://portal:password@external-db.example.com:5432/portal?sslmode=require"
  redis:
    host: "external-redis.example.com"
    port: 6379
    username: "portal"
    password: "secure-password"
```

## Troubleshooting

### Portal Pod Not Starting

1. Check the pod logs:
   ```bash
   kubectl logs -l app.kubernetes.io/name=portal
   ```

2. Verify database connectivity:
   ```bash
   kubectl exec -it deploy/portal -- nc -zv postgresql-pgpool 5432
   ```

3. Check Redis connectivity:
   ```bash
   kubectl exec -it deploy/portal -- nc -zv redis-master 6379
   ```

### GraphQL Endpoint Not Responding

1. Check service endpoints:
   ```bash
   kubectl get endpoints portal
   ```

2. Test internal connectivity:
   ```bash
   kubectl run test --rm -it --image=busybox -- wget -qO- portal:3001/graphql
   ```

3. Verify ingress configuration:
   ```bash
   kubectl describe ingress portal
   ```

### Performance Issues

1. Enable autoscaling:
   ```yaml
   autoscaling:
     enabled: true
     minReplicas: 2
     maxReplicas: 10
   ```

2. Increase resource limits:
   ```yaml
   resources:
     requests:
       cpu: 500m
       memory: 1Gi
     limits:
       cpu: 1000m
       memory: 2Gi
   ```

3. Check database performance and indexes

## Maintainers

| Name | Email | Url |
| ---- | ------ | --- |
| SettleMint | <support@settlemint.com> | <https://settlemint.com> |

## Source Code

* <https://github.com/settlemint/starterkit-asset-tokenization>

## Requirements

Kubernetes: `>=1.21.0-0`


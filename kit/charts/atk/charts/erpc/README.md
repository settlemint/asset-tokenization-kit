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
| config | object | `{"database":{},"logLevel":"info","projects":[],"server":{"httpHostV4":"0.0.0.0","httpPort":4000}}` | eRPC configuration |
| config.database | object | `{}` | Database configuration for caching |
| config.logLevel | string | `"info"` | Log level for eRPC |
| config.projects | list | `[]` | Array of project configurations (will be overridden by parent chart) |
| config.server | object | `{"httpHostV4":"0.0.0.0","httpPort":4000}` | Server configuration |
| containerSecurityContext | object | `{"allowPrivilegeEscalation":false,"capabilities":{"drop":["ALL"]},"enabled":false,"readOnlyRootFilesystem":false,"runAsGroup":1001,"runAsNonRoot":true,"runAsUser":1001,"seccompProfile":{"type":"RuntimeDefault"}}` | Container Security Context configuration |
| containerSecurityContext.allowPrivilegeEscalation | bool | `false` | Set container's Security Context allowPrivilegeEscalation |
| containerSecurityContext.capabilities | object | `{"drop":["ALL"]}` | Linux capabilities configuration |
| containerSecurityContext.capabilities.drop | list | `["ALL"]` | Set container's Security Context drop capabilities |
| containerSecurityContext.enabled | bool | `false` | Enable container Security Context |
| containerSecurityContext.readOnlyRootFilesystem | bool | `false` | Set container's Security Context readOnlyRootFilesystem |
| containerSecurityContext.runAsGroup | int | `1001` | Set container's Security Context runAsGroup |
| containerSecurityContext.runAsNonRoot | bool | `true` | Set container's Security Context runAsNonRoot |
| containerSecurityContext.runAsUser | int | `1001` | Set container's Security Context runAsUser |
| containerSecurityContext.seccompProfile | object | `{"type":"RuntimeDefault"}` | Seccomp profile configuration |
| containerSecurityContext.seccompProfile.type | string | `"RuntimeDefault"` | Set container's Security Context seccomp profile |
| extraEnvVars | list | `[]` | Array with extra environment variables to add to eRPC nodes |
| extraEnvVarsCM | string | `""` | Name of existing ConfigMap containing extra env vars for eRPC nodes |
| extraEnvVarsSecret | string | `""` | Name of existing Secret containing extra env vars for eRPC nodes |
| extraVolumeMounts | list | `[]` | Optionally specify extra list of additional volumeMounts for the eRPC container(s) |
| extraVolumes | list | `[]` | Optionally specify extra list of additional volumes for the eRPC pod(s) |
| fullnameOverride | string | `"erpc"` | String to fully override common.names.fullname |
| global | object | `{"imagePullSecrets":[],"imageRegistry":"","storageClass":""}` | Global Docker image registry |
| global.imagePullSecrets | list | `[]` | Global Docker registry secret names as an array |
| global.imageRegistry | string | `""` | Global Docker image registry |
| global.storageClass | string | `""` | Global StorageClass for Persistent Volume(s) |
| image | object | `{"digest":"","pullPolicy":"IfNotPresent","pullSecrets":[],"registry":"ghcr.io","repository":"erpc/erpc","tag":"0.0.55"}` | eRPC image |
| image.digest | string | `""` | eRPC image digest in the way sha256:aa.... Please note this parameter, if set, will override the tag |
| image.pullPolicy | string | `"IfNotPresent"` | eRPC image pull policy |
| image.pullSecrets | list | `[]` | eRPC image pull secrets |
| image.registry | string | `"ghcr.io"` | eRPC image registry |
| image.repository | string | `"erpc/erpc"` | eRPC image repository |
| image.tag | string | `"0.0.55"` | eRPC image tag (immutable tags are recommended) |
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
| initContainer.tcpCheck.dependencies[0].endpoint | string | `"besu-node-rpc-1.atk.svc.cluster.local:8545"` |  |
| initContainer.tcpCheck.dependencies[0].name | string | `"besu-rpc"` |  |
| initContainer.tcpCheck.enabled | bool | `true` |  |
| initContainer.tcpCheck.image.pullPolicy | string | `"IfNotPresent"` |  |
| initContainer.tcpCheck.image.repository | string | `"ghcr.io/settlemint/btp-waitforit"` |  |
| initContainer.tcpCheck.image.tag | string | `"v7.7.9"` |  |
| initContainer.tcpCheck.timeout | int | `0` |  |
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
| podLabels | object | `{}` | Extra labels for eRPC pods |
| podSecurityContext | object | `{"enabled":false,"fsGroup":1001,"sysctls":[]}` | Pod Security Context configuration |
| podSecurityContext.enabled | bool | `false` | Enabled eRPC pods' Security Context |
| podSecurityContext.fsGroup | int | `1001` | Set eRPC pod's Security Context fsGroup |
| podSecurityContext.sysctls | list | `[]` | Set kernel settings using the sysctl interface |
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
| replicaCount | int | `1` | Number of eRPC replicas to deploy |
| resources | object | `{}` | eRPC containers resource requests and limits |
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
| tests | object | `{"image":{"pullPolicy":"IfNotPresent","registry":"docker.io","repository":"busybox","tag":"1.37.0"}}` | Test parameters |
| tests.image | object | `{"pullPolicy":"IfNotPresent","registry":"docker.io","repository":"busybox","tag":"1.37.0"}` | Image for test pods |
| tests.image.pullPolicy | string | `"IfNotPresent"` | Test image pull policy |
| tests.image.registry | string | `"docker.io"` | Test image registry |
| tests.image.repository | string | `"busybox"` | Test image repository |
| tests.image.tag | string | `"1.37.0"` | Test image tag |
| tolerations | list | `[]` | Tolerations for pod assignment |
| topologySpreadConstraints | list | `[]` | Topology Spread Constraints for pod assignment |
| updateStrategy | object | `{"rollingUpdate":{},"type":"RollingUpdate"}` | Update strategy configuration for eRPC deployment |
| updateStrategy.rollingUpdate | object | `{}` | eRPC deployment rolling update configuration parameters |
| updateStrategy.type | string | `"RollingUpdate"` | eRPC deployment strategy type |

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

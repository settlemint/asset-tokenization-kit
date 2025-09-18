## Introduction

TxSigner is a secure transaction signing service for blockchain applications that provides automated transaction signing, key management, and transaction queuing capabilities. It offers a secure environment for managing private keys and signing transactions with support for multiple signing strategies.

### Key Features

- **Multiple signing strategies** (local, KMS, HSM)
- **Secure key management** with encrypted storage
- **Transaction queuing** and nonce management
- **Rate limiting** and access control
- **Comprehensive audit logging**
- **Prometheus metrics** for monitoring
- **Support for multiple blockchain networks**

### Benefits

- Centralized signing service for distributed applications
- Reduced risk of private key exposure
- Automated nonce management prevents transaction conflicts
- Built-in rate limiting protects against abuse
- Audit trail for compliance requirements

### Use Cases

- DeFi applications requiring automated transactions
- NFT minting services
- Token distribution systems
- Bridge operators
- Any application requiring secure transaction signing

## Maintainers

| Name | Email | Url |
| ---- | ------ | --- |
| SettleMint | <support@settlemint.com> | <https://settlemint.com> |

## Source Code

* <https://github.com/settlemint/starterkit-asset-tokenization>

## Requirements

Kubernetes: `>=1.21.0-0`

## Prerequisites

- Kubernetes 1.19+
- Helm 3.2.0+
- Access to a blockchain RPC endpoint
- Private key or key management service configured
- PostgreSQL database (defaults target the bundled `support.postgresql` release)

## Connection Requirements

TxSigner reads its database credentials from the `txsigner.postgresqlConnection` values block. Update
that section with the hostname, port, database, username, password, and SSL mode for your external
PostgreSQL instance.

## Installing the Chart

To install the chart with the release name `my-release`:

```console
helm install my-release .
```

The command deploys TxSigner on the Kubernetes cluster in the default configuration. The [Parameters](#parameters) section lists the parameters that can be configured during installation.

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
| autoscaling | object | `{"builtInMetrics":[{"resource":{"name":"cpu","target":{"averageUtilization":80,"type":"Utilization"}},"type":"Resource"},{"resource":{"name":"memory","target":{"averageUtilization":80,"type":"Utilization"}},"type":"Resource"}],"customMetrics":[],"enabled":false,"maxReplicas":3,"minReplicas":1}` | Autoscaling configuration for TxSigner |
| autoscaling.builtInMetrics | list | `[{"resource":{"name":"cpu","target":{"averageUtilization":80,"type":"Utilization"}},"type":"Resource"},{"resource":{"name":"memory","target":{"averageUtilization":80,"type":"Utilization"}},"type":"Resource"}]` | Built-in metrics configuration |
| autoscaling.customMetrics | list | `[]` | Custom metrics configuration |
| autoscaling.enabled | bool | `false` | Enable autoscaling for TxSigner |
| autoscaling.maxReplicas | int | `3` | Maximum number of TxSigner replicas |
| autoscaling.minReplicas | int | `1` | Minimum number of TxSigner replicas |
| commonAnnotations | object | `{}` | Annotations to add to all deployed objects |
| commonLabels | object | `{}` | Labels to add to all deployed objects |
| config | object | `{"allowedContracts":[],"allowedMethods":[],"audit":{"enabled":true,"retentionDays":30},"chainId":"53771311147","cors":{"enabled":false,"headers":["Content-Type","Authorization"],"methods":["GET","POST"],"origins":[]},"debug":false,"derivationPath":"","existingSecret":"","existingSecretKey":"private-key","extraSecretEnv":{},"gas":{"fixedPrice":20,"limit":3000000,"multiplier":1.1,"priceStrategy":"estimator"},"hsm":{"module":"","pin":"","slot":""},"kms":{"keyId":"","provider":"","region":""},"logLevel":"info","metricsPort":3001,"mnemonic":"","mode":"standalone","nonce":{"maxPending":10,"strategy":"sequential"},"port":3000,"privateKey":"","queue":{"maxSize":1000,"processingInterval":1000},"rateLimit":{"enabled":true,"maxRequestsPerHour":1000,"maxRequestsPerMinute":60},"rpcUrl":"http://erpc:4000","signingStrategy":"local"}` | TxSigner configuration |
| config.allowedContracts | list | `[]` | Allowed contracts for interaction |
| config.allowedMethods | list | `[]` | Allowed methods for execution |
| config.audit | object | `{"enabled":true,"retentionDays":30}` | Audit logging |
| config.audit.enabled | bool | `true` | Enable audit logging |
| config.audit.retentionDays | int | `30` | Audit log retention days |
| config.chainId | string | `"53771311147"` | Chain ID for the network |
| config.cors | object | `{"enabled":false,"headers":["Content-Type","Authorization"],"methods":["GET","POST"],"origins":[]}` | CORS configuration |
| config.cors.enabled | bool | `false` | Enable CORS |
| config.cors.headers | list | `["Content-Type","Authorization"]` | Allowed headers |
| config.cors.methods | list | `["GET","POST"]` | Allowed methods |
| config.cors.origins | list | `[]` | Allowed origins |
| config.debug | bool | `false` | Enable debug mode |
| config.derivationPath | string | `""` | Derivation path to use for the private key |
| config.existingSecret | string | `""` | Use existing secret for private key |
| config.existingSecretKey | string | `"private-key"` | Key within the existing secret |
| config.extraSecretEnv | object | `{}` | Additional secret environment variables to add to the txsigner |
| config.gas | object | `{"fixedPrice":20,"limit":3000000,"multiplier":1.1,"priceStrategy":"estimator"}` | Gas configuration |
| config.gas.fixedPrice | int | `20` | Fixed gas price in Gwei (if priceStrategy is fixed) |
| config.gas.limit | int | `3000000` | Gas limit |
| config.gas.multiplier | float | `1.1` | Gas price multiplier for estimator strategy |
| config.gas.priceStrategy | string | `"estimator"` | Gas price strategy (fixed, oracle, estimator) |
| config.hsm | object | `{"module":"","pin":"","slot":""}` | HSM configuration (if signingStrategy is hsm) |
| config.hsm.module | string | `""` | HSM module path |
| config.hsm.pin | string | `""` | HSM PIN |
| config.hsm.slot | string | `""` | HSM slot |
| config.kms | object | `{"keyId":"","provider":"","region":""}` | KMS configuration (if signingStrategy is kms) |
| config.kms.keyId | string | `""` | KMS key ID |
| config.kms.provider | string | `""` | KMS provider (aws, azure, gcp) |
| config.kms.region | string | `""` | KMS region |
| config.logLevel | string | `"info"` | Log level for TxSigner |
| config.metricsPort | int | `3001` | Port for the metrics server |
| config.mnemonic | string | `""` | Mnemonic to use for the private key |
| config.mode | string | `"standalone"` | Operation mode (standalone or integrated) |
| config.nonce | object | `{"maxPending":10,"strategy":"sequential"}` | Nonce management |
| config.nonce.maxPending | int | `10` | Maximum pending transactions |
| config.nonce.strategy | string | `"sequential"` | Nonce management strategy (sequential, parallel) |
| config.port | int | `3000` | Port for the HTTP server |
| config.privateKey | string | `""` | Private key for local signing (use with caution, prefer secrets) |
| config.queue | object | `{"maxSize":1000,"processingInterval":1000}` | Transaction queue configuration |
| config.queue.maxSize | int | `1000` | Maximum queue size |
| config.queue.processingInterval | int | `1000` | Queue processing interval in milliseconds |
| config.rateLimit | object | `{"enabled":true,"maxRequestsPerHour":1000,"maxRequestsPerMinute":60}` | Rate limiting configuration |
| config.rateLimit.enabled | bool | `true` | Enable rate limiting |
| config.rateLimit.maxRequestsPerHour | int | `1000` | Maximum requests per hour |
| config.rateLimit.maxRequestsPerMinute | int | `60` | Maximum requests per minute |
| config.rpcUrl | string | `"http://erpc:4000"` | RPC endpoint URL |
| config.signingStrategy | string | `"local"` | Signing strategy (local, kms, hsm) |
| containerSecurityContext | object | `{}` | Container Security Context configuration |
| extraEnvVars | list | `[]` | Array with extra environment variables to add to TxSigner nodes |
| extraEnvVarsCM | string | `""` | Name of existing ConfigMap containing extra env vars for TxSigner nodes |
| extraEnvVarsSecret | string | `""` | Name of existing Secret containing extra env vars for TxSigner nodes |
| extraVolumeMounts | list | `[{"mountPath":"/signer/.cache","name":"tx-signer-cache"}]` | Optionally specify extra list of additional volumeMounts for the TxSigner container(s) |
| extraVolumes | list | `[{"emptyDir":{},"name":"tx-signer-cache"}]` | Optionally specify extra list of additional volumes for the TxSigner pod(s) |
| fullnameOverride | string | `"txsigner"` | String to fully override common.names.fullname |
| global | object | `{"imagePullSecrets":[],"imageRegistry":"","storageClass":""}` | Global Docker image registry |
| global.imagePullSecrets | list | `[]` | Global Docker registry secret names as an array |
| global.imageRegistry | string | `""` | Global Docker image registry |
| global.storageClass | string | `""` | Global StorageClass for Persistent Volume(s) |
| image | object | `{"digest":"","pullPolicy":"IfNotPresent","pullSecrets":[],"registry":"ghcr.io","repository":"settlemint/btp-signer","tag":"7.15.13"}` | TxSigner image |
| image.digest | string | `""` | TxSigner image digest in the way sha256:aa.... Please note this parameter, if set, will override the tag |
| image.pullPolicy | string | `"IfNotPresent"` | TxSigner image pull policy |
| image.pullSecrets | list | `[]` | TxSigner image pull secrets |
| image.registry | string | `"ghcr.io"` | TxSigner image registry |
| image.repository | string | `"settlemint/btp-signer"` | TxSigner image repository |
| image.tag | string | `"7.15.13"` | TxSigner image tag (immutable tags are recommended) |
| ingress | object | `{"annotations":{},"apiVersion":"","enabled":true,"extraHosts":[],"extraPaths":[],"extraRules":[],"extraTls":[],"hostname":"txsigner.k8s.orb.local","ingressClassName":"atk-nginx","path":"/","pathType":"ImplementationSpecific","secrets":[],"selfSigned":false,"tls":false}` | Ingress parameters |
| ingress.annotations | object | `{}` | Additional annotations for the Ingress resource. To enable certificate autogeneration, place here your cert-manager annotations. |
| ingress.apiVersion | string | `""` | Force Ingress API version (automatically detected if not set) |
| ingress.enabled | bool | `true` | Enable ingress record generation for TxSigner |
| ingress.extraHosts | list | `[]` | An array with additional hostname(s) to be covered with the ingress record |
| ingress.extraPaths | list | `[]` | An array with additional arbitrary paths that may need to be added to the ingress under the main host |
| ingress.extraRules | list | `[]` | Additional rules to be covered with this ingress record |
| ingress.extraTls | list | `[]` | TLS configuration for additional hostname(s) to be covered with this ingress record |
| ingress.hostname | string | `"txsigner.k8s.orb.local"` | Default host for the ingress record |
| ingress.ingressClassName | string | `"atk-nginx"` | IngressClass that will be be used to implement the Ingress (Kubernetes 1.18+) |
| ingress.path | string | `"/"` | Default path for the ingress record |
| ingress.pathType | string | `"ImplementationSpecific"` | Ingress path type |
| ingress.secrets | list | `[]` | Custom TLS certificates as secrets |
| ingress.selfSigned | bool | `false` | Create a TLS secret for this ingress record using self-signed certificates generated by Helm |
| ingress.tls | bool | `false` | Enable TLS configuration for the host defined at `ingress.hostname` parameter |
| initContainer | object | `{"tcpCheck":{"enabled":true,"image":{"pullPolicy":"IfNotPresent","repository":"ghcr.io/settlemint/btp-waitforit","tag":"v7.7.10"},"resources":{"dependencies":[{"endpoint":"postgresql:5432","name":"postgresql"}],"limits":{"cpu":"100m","memory":"64Mi"},"requests":{"cpu":"10m","memory":"32Mi"}},"timeout":120}}` | Init containers configuration Legacy `initContainers` overrides remain supported for backward compatibility. |
| lifecycleHooks | object | `{}` | lifecycleHooks for the TxSigner container(s) to automate configuration before or after startup |
| livenessProbe | object | `{"enabled":true,"failureThreshold":30,"initialDelaySeconds":1,"periodSeconds":10,"successThreshold":1,"tcpSocket":{"port":"http"},"timeoutSeconds":5}` | Configure TxSigner containers' liveness probe |
| livenessProbe.enabled | bool | `true` | Enable livenessProbe on TxSigner containers |
| livenessProbe.failureThreshold | int | `30` | Failure threshold for livenessProbe |
| livenessProbe.initialDelaySeconds | int | `1` | Initial delay seconds for livenessProbe |
| livenessProbe.periodSeconds | int | `10` | Period seconds for livenessProbe |
| livenessProbe.successThreshold | int | `1` | Success threshold for livenessProbe |
| livenessProbe.tcpSocket | object | `{"port":"http"}` | TCP socket parameters for livenessProbe |
| livenessProbe.tcpSocket.port | string | `"http"` | Port for tcpSocket livenessProbe |
| livenessProbe.timeoutSeconds | int | `5` | Timeout seconds for livenessProbe |
| networkPolicy | object | `{"addExternalClientAccess":true,"allowExternal":true,"allowExternalEgress":true,"enabled":false,"extraEgress":[{"ports":[{"port":53,"protocol":"UDP"}],"to":[{"namespaceSelector":{},"podSelector":{"matchLabels":{"k8s-app":"kube-dns"}}}]},{"ports":[{"port":8545,"protocol":"TCP"}],"to":[{"podSelector":{"matchLabels":{"app.kubernetes.io/name":"besu-statefulset"}}}]},{"ports":[{"port":443,"protocol":"TCP"}],"to":[{"namespaceSelector":{}}]}],"extraIngress":[{"from":[{"podSelector":{"matchLabels":{"app.kubernetes.io/name":"dapp"}}},{"podSelector":{"matchLabels":{"app.kubernetes.io/name":"portal"}}},{"podSelector":{"matchLabels":{"app.kubernetes.io/name":"ingress-nginx"}}},{"podSelector":{}}],"ports":[{"port":3000,"protocol":"TCP"},{"port":3001,"protocol":"TCP"}]}],"ingressRules":{"accessOnlyFrom":{"enabled":false,"namespaceSelector":{},"podSelector":{}}}}` | Network policies configuration |
| networkPolicy.addExternalClientAccess | bool | `true` | Allow access from pods with client label set to "true". Ignored if `networkPolicy.allowExternal` is true. |
| networkPolicy.allowExternal | bool | `true` | The Policy model to apply |
| networkPolicy.allowExternalEgress | bool | `true` | Allow the pod to access any range of port and all destinations. |
| networkPolicy.enabled | bool | `false` | Enable creation of NetworkPolicy resources |
| networkPolicy.extraEgress | list | `[{"ports":[{"port":53,"protocol":"UDP"}],"to":[{"namespaceSelector":{},"podSelector":{"matchLabels":{"k8s-app":"kube-dns"}}}]},{"ports":[{"port":8545,"protocol":"TCP"}],"to":[{"podSelector":{"matchLabels":{"app.kubernetes.io/name":"besu-statefulset"}}}]},{"ports":[{"port":443,"protocol":"TCP"}],"to":[{"namespaceSelector":{}}]}]` | Add extra egress rules to the NetworkPolicy (ignored if allowExternalEgress=true) |
| networkPolicy.extraIngress | list | `[{"from":[{"podSelector":{"matchLabels":{"app.kubernetes.io/name":"dapp"}}},{"podSelector":{"matchLabels":{"app.kubernetes.io/name":"portal"}}},{"podSelector":{"matchLabels":{"app.kubernetes.io/name":"ingress-nginx"}}},{"podSelector":{}}],"ports":[{"port":3000,"protocol":"TCP"},{"port":3001,"protocol":"TCP"}]}]` | Add extra ingress rules to the NetworkPolicy |
| networkPolicy.ingressRules | object | `{"accessOnlyFrom":{"enabled":false,"namespaceSelector":{},"podSelector":{}}}` | Ingress rules configuration |
| networkPolicy.ingressRules.accessOnlyFrom | object | `{"enabled":false,"namespaceSelector":{},"podSelector":{}}` | Access restrictions configuration |
| networkPolicy.ingressRules.accessOnlyFrom.enabled | bool | `false` | Enable ingress rule that makes TxSigner only accessible from a particular origin. |
| networkPolicy.ingressRules.accessOnlyFrom.namespaceSelector | object | `{}` | Namespace selector label that is allowed to access TxSigner. This label will be used to identified allowed namespace(s). |
| networkPolicy.ingressRules.accessOnlyFrom.podSelector | object | `{}` | Pods selector label that is allowed to access TxSigner. This label will be used to identified allowed pod(s). |
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
| podAnnotations | object | `{"prometheus.io/path":"/metrics","prometheus.io/port":"3001","prometheus.io/scrape":"true"}` | Annotations for TxSigner pods |
| podAnnotations."prometheus.io/path" | string | `"/metrics"` | Prometheus metrics path |
| podAnnotations."prometheus.io/port" | string | `"3001"` | Prometheus metrics port |
| podAnnotations."prometheus.io/scrape" | string | `"true"` | Enable prometheus scraping |
| podAntiAffinityPreset | string | `"soft"` | Pod anti-affinity preset. Ignored if `affinity` is set. Allowed values: `soft` or `hard` |
| podLabels | object | `{}` | Extra labels for TxSigner pods |
| podSecurityContext | object | `{}` | Pod Security Context configuration |
| postgresql | string | `"postgresql://txsigner:atk@postgresql:5432/txsigner?sslmode=disable"` | PostgreSQL connection string |
| priorityClassName | string | `""` | TxSigner pods' priority class name |
| readinessProbe | object | `{"enabled":true,"failureThreshold":60,"initialDelaySeconds":1,"periodSeconds":5,"successThreshold":1,"tcpSocket":{"port":"http"},"timeoutSeconds":5}` | Configure TxSigner containers' readiness probe |
| readinessProbe.enabled | bool | `true` | Enable readinessProbe on TxSigner containers |
| readinessProbe.failureThreshold | int | `60` | Failure threshold for readinessProbe |
| readinessProbe.initialDelaySeconds | int | `1` | Initial delay seconds for readinessProbe |
| readinessProbe.periodSeconds | int | `5` | Period seconds for readinessProbe |
| readinessProbe.successThreshold | int | `1` | Success threshold for readinessProbe |
| readinessProbe.tcpSocket | object | `{"port":"http"}` | TCP socket parameters for readinessProbe |
| readinessProbe.tcpSocket.port | string | `"http"` | Port for tcpSocket readinessProbe |
| readinessProbe.timeoutSeconds | int | `5` | Timeout seconds for readinessProbe |
| replicaCount | int | `1` | Number of TxSigner replicas to deploy |
| resources | object | `{}` | TxSigner containers resource requests and limits |
| schedulerName | string | `""` | Alternate scheduler |
| service | object | `{"annotations":{},"clusterIP":"","externalTrafficPolicy":"Cluster","extraPorts":[],"loadBalancerIP":"","loadBalancerSourceRanges":[],"metricsNodePort":"","metricsPort":3001,"nodePort":"","port":3000,"sessionAffinity":"None","sessionAffinityConfig":{},"type":"ClusterIP"}` | Service parameters |
| service.annotations | object | `{}` | Additional custom annotations for TxSigner service |
| service.clusterIP | string | `""` | TxSigner service Cluster IP |
| service.externalTrafficPolicy | string | `"Cluster"` | TxSigner service external traffic policy |
| service.extraPorts | list | `[]` | Extra ports to expose in the TxSigner service (normally used with the `sidecar` value) |
| service.loadBalancerIP | string | `""` | TxSigner service Load Balancer IP |
| service.loadBalancerSourceRanges | list | `[]` | TxSigner service Load Balancer sources |
| service.metricsNodePort | string | `""` | Node port for metrics |
| service.metricsPort | int | `3001` | TxSigner service metrics port |
| service.nodePort | string | `""` | Node port for HTTP |
| service.port | int | `3000` | TxSigner service HTTP port |
| service.sessionAffinity | string | `"None"` | Session Affinity for Kubernetes service, can be "None" or "ClientIP" |
| service.sessionAffinityConfig | object | `{}` | Additional settings for the sessionAffinity |
| service.type | string | `"ClusterIP"` | TxSigner service type |
| serviceAccount | object | `{"annotations":{},"automountServiceAccountToken":false,"create":true,"labels":{},"name":""}` | Service account for TxSigner pods |
| serviceAccount.annotations | object | `{}` | Annotations for service account. Evaluated as a template. Only used if `create` is `true`. |
| serviceAccount.automountServiceAccountToken | bool | `false` | Automount service account token for the deployment controller service account |
| serviceAccount.create | bool | `true` | Specifies whether a ServiceAccount should be created |
| serviceAccount.labels | object | `{}` | Extra labels to be added to the service account |
| serviceAccount.name | string | `""` | The name of the ServiceAccount to use. |
| startupProbe | object | `{"enabled":false,"failureThreshold":10,"initialDelaySeconds":30,"periodSeconds":10,"successThreshold":1,"timeoutSeconds":5}` | Configure TxSigner containers' startup probe |
| startupProbe.enabled | bool | `false` | Enable startupProbe on TxSigner containers |
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
| updateStrategy | object | `{"rollingUpdate":{},"type":"RollingUpdate"}` | Update strategy configuration for TxSigner deployment |
| updateStrategy.rollingUpdate | object | `{}` | TxSigner deployment rolling update configuration parameters |
| updateStrategy.type | string | `"RollingUpdate"` | TxSigner deployment strategy type |

## Configuration and installation details

### Signing Strategies

TxSigner supports multiple signing strategies:

#### Local Signing (Development)

```yaml
config:
  signingStrategy: "local"
  privateKey: "0x..." # Not recommended for production
  # OR use existing secret
  existingSecret: "my-signing-key"
  existingSecretKey: "private-key"
```

#### AWS KMS (Production)

```yaml
config:
  signingStrategy: "kms"
  kms:
    provider: "aws"
    keyId: "arn:aws:kms:us-east-1:123456789012:key/12345678-1234-1234-1234-123456789012"
    region: "us-east-1"
```

#### Hardware Security Module (HSM)

```yaml
config:
  signingStrategy: "hsm"
  hsm:
    module: "/usr/lib/softhsm/libsofthsm2.so"
    slot: "0"
    pin: "1234"
```

### Advanced Configuration

#### Rate Limiting

Configure rate limiting to prevent abuse:

```yaml
config:
  rateLimit:
    enabled: true
    maxRequestsPerMinute: 60
    maxRequestsPerHour: 1000
```

#### Access Control

Restrict which contracts and methods can be called:

```yaml
config:
  allowedContracts:
    - "0x742d35Cc6634C0532925a3b844Bc9e7095931fE0"
    - "0x..."
  allowedMethods:
    - "transfer"
    - "approve"
    - "mint"
```

#### Gas Configuration

Control gas pricing strategies:

```yaml
config:
  gas:
    priceStrategy: "estimator" # or "fixed", "oracle"
    fixedPrice: 20 # in Gwei, only for fixed strategy
    limit: 3000000
    multiplier: 1.1 # for estimator strategy
```

#### Nonce Management

Configure nonce handling:

```yaml
config:
  nonce:
    strategy: "sequential" # or "parallel"
    maxPending: 10
```

### Exposing TxSigner

#### LoadBalancer Service

```yaml
service:
  type: LoadBalancer
  port: 3000
  metricsPort: 3001
```

#### Ingress

```yaml
ingress:
  enabled: true
  hostname: txsigner.example.com
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt
  tls: true
```

### Metrics and Monitoring

TxSigner exposes Prometheus metrics on port 3001 at the `/metrics` endpoint:

```yaml
podAnnotations:
  prometheus.io/scrape: "true"
  prometheus.io/port: "3001"
  prometheus.io/path: "/metrics"
```

Available metrics include:
- Transaction signing requests
- Queue depth
- Signing latency
- Rate limit violations
- Error rates

### Security Considerations

#### Network Policies

Restrict network access to TxSigner:

```yaml
networkPolicy:
  enabled: true
  allowExternal: false
  extraIngress:
    - from:
        - podSelector:
            matchLabels:
              app.kubernetes.io/name: dapp
      ports:
        - protocol: TCP
          port: 3000
```

#### Pod Security Context

Run with restricted permissions:

```yaml
podSecurityContext:
  enabled: true
  fsGroup: 1001
containerSecurityContext:
  enabled: true
  runAsUser: 1001
  runAsNonRoot: true
  readOnlyRootFilesystem: false
  allowPrivilegeEscalation: false
  capabilities:
    drop: ["ALL"]
```

### High Availability

Enable autoscaling for high availability:

```yaml
autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 10
  builtInMetrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
```

Configure pod disruption budget:

```yaml
pdb:
  enabled: true
  minAvailable: 1
```

## Troubleshooting

### TxSigner pods are not starting

Check the pod logs:
```console
kubectl logs -l app.kubernetes.io/name=txsigner
```

### Authentication errors

Verify your private key or KMS configuration:
```console
kubectl describe secret txsigner-env
```

### Connection to RPC endpoint failing

Test RPC connectivity from within the pod:
```console
kubectl exec -it deploy/txsigner -- curl -v http://your-rpc-endpoint:8545
```

### High latency in transaction signing

Check the metrics to identify bottlenecks:
```console
kubectl port-forward svc/txsigner 3001:3001
curl http://localhost:3001/metrics | grep txsigner_signing_duration
```

### Nonce conflicts

Review nonce management strategy and increase `maxPending` if needed:
```console
kubectl logs -l app.kubernetes.io/name=txsigner | grep -i nonce
```

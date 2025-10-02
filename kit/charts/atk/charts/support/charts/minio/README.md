# minio

![Version: 2.0.0-alpha.14](https://img.shields.io/badge/Version-2.0.0--alpha.14-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: 2.0.0-alpha.14](https://img.shields.io/badge/AppVersion-2.0.0--alpha.14-informational?style=flat-square)

A simple MinIO deployment for development environments

## Maintainers

| Name | Email | Url |
| ---- | ------ | --- |
| SettleMint | <support@settlemint.com> | <https://settlemint.com> |

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| additionalAnnotations | object | `{}` | Additional annotations to include with deployment or statefulset |
| additionalLabels | object | `{}` | Additional labels to include with deployment or statefulset |
| affinity | object | `{}` | Affinity rules for pod assignment |
| bucketRoot | string | `""` | Root directory for MinIO server storage (sub-directory of mountPath) |
| buckets | list | `[]` | List of MinIO buckets to create after installation |
| certsPath | string | `"/etc/minio/certs/"` | Directory path for TLS certificates on MinIO pod |
| clusterDomain | string | `"cluster.local"` | Kubernetes cluster domain where minio is running |
| configPathmc | string | `"/etc/minio/mc/"` | Directory path for MinIO client configuration |
| consoleIngress | object | `{"annotations":{},"enabled":false,"hosts":["console.minio-example.local"],"ingressClassName":null,"labels":{},"path":"/","tls":[]}` | Ingress configuration for MinIO Console |
| consoleIngress.annotations | object | `{}` | Annotations for the console ingress resource |
| consoleIngress.enabled | bool | `false` | Enable ingress for MinIO Console |
| consoleIngress.hosts | list | `["console.minio-example.local"]` | Hostnames for the console ingress |
| consoleIngress.ingressClassName | string | `nil` | Ingress class name to use for console |
| consoleIngress.labels | object | `{}` | Additional labels for the console ingress resource |
| consoleIngress.path | string | `"/"` | Path prefix for the console ingress rule |
| consoleIngress.tls | list | `[]` | TLS configuration for the console ingress |
| consoleService | object | `{"annotations":{},"clusterIP":null,"externalIPs":[],"externalTrafficPolicy":"Cluster","loadBalancerIP":null,"loadBalancerSourceRanges":[],"nodePort":32001,"port":"9001","type":"ClusterIP"}` | Kubernetes Service configuration for MinIO Console |
| consoleService.annotations | object | `{}` | Annotations to add to the console service |
| consoleService.clusterIP | string | `nil` | Static cluster IP address for the console service |
| consoleService.externalIPs | list | `[]` | List of external IPs for the console service |
| consoleService.externalTrafficPolicy | string | `"Cluster"` | External traffic policy for console service (Cluster or Local) |
| consoleService.loadBalancerIP | string | `nil` | Static IP address for console LoadBalancer service type |
| consoleService.loadBalancerSourceRanges | list | `[]` | List of IP CIDR ranges allowed to access console LoadBalancer service |
| consoleService.nodePort | int | `32001` | NodePort to expose the console service on each node (requires type: NodePort) |
| consoleService.port | string | `"9001"` | External port for MinIO Console service |
| consoleService.type | string | `"ClusterIP"` | Service type for MinIO Console (ClusterIP, NodePort, LoadBalancer) |
| containerSecurityContext | object | `{"readOnlyRootFilesystem":false}` | Container-level security context |
| containerSecurityContext.readOnlyRootFilesystem | bool | `false` | Mount root filesystem as read-only |
| customCommandJob | object | `{"exitCommand":"","extraVolumeMounts":[],"extraVolumes":[],"resources":{"requests":{"memory":"128Mi"}},"securityContext":{}}` | Configuration for the Kubernetes Job that runs custom commands |
| customCommandJob.exitCommand | string | `""` | Command to run after the main command completes |
| customCommandJob.extraVolumeMounts | list | `[]` | Additional volume mounts for the customCommandJob container |
| customCommandJob.extraVolumes | list | `[]` | Additional volumes to mount in the customCommandJob |
| customCommandJob.resources | object | `{"requests":{"memory":"128Mi"}}` | Resource requests and limits for the customCommandJob |
| customCommandJob.resources.requests | object | `{"memory":"128Mi"}` | Resource requests for the customCommandJob |
| customCommandJob.resources.requests.memory | string | `"128Mi"` | Memory request for the customCommandJob |
| customCommandJob.securityContext | object | `{}` | Security context for the customCommandJob |
| customCommands | list | `nil` | List of custom MinIO client commands to run after installation |
| deploymentUpdate | object | `{"maxSurge":"100%","maxUnavailable":0,"type":"RollingUpdate"}` | Update strategy configuration for Deployments |
| deploymentUpdate.maxSurge | string | `"100%"` | Maximum number of pods that can be created over the desired number |
| deploymentUpdate.maxUnavailable | int | `0` | Maximum number of pods unavailable during update |
| deploymentUpdate.type | string | `"RollingUpdate"` | Type of deployment update strategy |
| drivesPerNode | int | `1` | Number of drives attached to each MinIO node |
| environment | object | `nil` | Additional environment variables for MinIO server |
| etcd | object | `{"clientCert":"","clientCertKey":"","corednsPathPrefix":"","endpoints":[],"pathPrefix":""}` | ETCD configuration for MinIO STS (Security Token Service) |
| etcd.clientCert | string | `""` | Client certificate for ETCD authentication |
| etcd.clientCertKey | string | `""` | Client certificate key for ETCD authentication |
| etcd.corednsPathPrefix | string | `""` | Path prefix for CoreDNS ETCD keys |
| etcd.endpoints | list | `[]` | List of ETCD endpoints |
| etcd.pathPrefix | string | `""` | Path prefix for ETCD keys |
| existingSecret | string | `""` | Name of existing Secret containing rootUser and rootPassword keys |
| extraArgs | list | `[]` | Additional command-line arguments to pass to the MinIO binary |
| extraContainers | list | `[]` | Additional sidecar containers to run alongside MinIO |
| extraSecret | string | `nil` | Name of existing Secret containing additional environment variables in 'config.env' key |
| extraVolumeMounts | list | `[]` | Additional volume mounts for the MinIO container |
| extraVolumes | list | `[]` | Additional volumes to mount in the MinIO container |
| fullnameOverride | string | `""` | String to fully override common.names.fullname |
| ignoreChartChecksums | bool | `false` | Disable automatic restart on secret/config changes to avoid unnecessary restarts in GitOps workflows |
| image | object | `{"pullPolicy":"IfNotPresent","repository":"docker.io/minio/minio","tag":"RELEASE.2025-07-23T15-54-02Z"}` | MinIO image configuration |
| image.pullPolicy | string | `"IfNotPresent"` | MinIO image pull policy |
| image.repository | string | `"docker.io/minio/minio"` | MinIO image repository |
| image.tag | string | `"RELEASE.2025-07-23T15-54-02Z"` | MinIO image tag (immutable tags are recommended) |
| imagePullSecrets | list | `[]` | Global Docker registry secret names as an array |
| ingress | object | `{"annotations":{},"enabled":false,"hosts":["minio-example.local"],"ingressClassName":null,"labels":{},"path":"/","tls":[]}` | Ingress configuration for MinIO S3 API |
| ingress.annotations | object | `{}` | Annotations for the ingress resource |
| ingress.enabled | bool | `false` | Enable ingress for MinIO S3 API |
| ingress.hosts | list | `["minio-example.local"]` | Hostnames for the ingress |
| ingress.ingressClassName | string | `nil` | Ingress class name to use |
| ingress.labels | object | `{}` | Additional labels for the ingress resource |
| ingress.path | string | `"/"` | Path prefix for the ingress rule |
| ingress.tls | list | `[]` | TLS configuration for the ingress |
| makeBucketJob | object | `{"exitCommand":"","resources":{"requests":{"memory":"128Mi"}},"securityContext":{}}` | Configuration for the Kubernetes Job that creates buckets |
| makeBucketJob.exitCommand | string | `""` | Command to run after the main command completes |
| makeBucketJob.resources | object | `{"requests":{"memory":"128Mi"}}` | Resource requests and limits for the makeBucketJob |
| makeBucketJob.resources.requests | object | `{"memory":"128Mi"}` | Resource requests for the makeBucketJob |
| makeBucketJob.resources.requests.memory | string | `"128Mi"` | Memory request for the makeBucketJob |
| makeBucketJob.securityContext | object | `{}` | Security context for the makeBucketJob |
| makePolicyJob | object | `{"exitCommand":"","resources":{"requests":{"memory":"128Mi"}},"securityContext":{}}` | Configuration for the Kubernetes Job that creates policies |
| makePolicyJob.exitCommand | string | `""` | Command to run after the main command completes |
| makePolicyJob.resources | object | `{"requests":{"memory":"128Mi"}}` | Resource requests and limits for the makePolicyJob |
| makePolicyJob.resources.requests | object | `{"memory":"128Mi"}` | Resource requests for the makePolicyJob |
| makePolicyJob.resources.requests.memory | string | `"128Mi"` | Memory request for the makePolicyJob |
| makePolicyJob.securityContext | object | `{}` | Security context for the makePolicyJob |
| makeServiceAccountJob | object | `{"exitCommand":"","resources":{"requests":{"memory":"128Mi"}},"securityContext":{}}` | Configuration for the Kubernetes Job that creates service accounts |
| makeServiceAccountJob.exitCommand | string | `""` | Command to run after the main command completes |
| makeServiceAccountJob.resources | object | `{"requests":{"memory":"128Mi"}}` | Resource requests and limits for the makeServiceAccountJob |
| makeServiceAccountJob.resources.requests | object | `{"memory":"128Mi"}` | Resource requests for the makeServiceAccountJob |
| makeServiceAccountJob.resources.requests.memory | string | `"128Mi"` | Memory request for the makeServiceAccountJob |
| makeServiceAccountJob.securityContext | object | `{}` | Security context for the makeServiceAccountJob |
| makeUserJob | object | `{"exitCommand":"","resources":{"requests":{"memory":"128Mi"}},"securityContext":{}}` | Configuration for the Kubernetes Job that creates users |
| makeUserJob.exitCommand | string | `""` | Command to run after the main command completes |
| makeUserJob.resources | object | `{"requests":{"memory":"128Mi"}}` | Resource requests and limits for the makeUserJob |
| makeUserJob.resources.requests | object | `{"memory":"128Mi"}` | Resource requests for the makeUserJob |
| makeUserJob.resources.requests.memory | string | `"128Mi"` | Memory request for the makeUserJob |
| makeUserJob.securityContext | object | `{}` | Security context for the makeUserJob |
| mcImage | object | `{"pullPolicy":"IfNotPresent","repository":"docker.io/minio/minio","tag":"RELEASE.2025-07-23T15-54-02Z"}` | MinIO client image configuration |
| mcImage.pullPolicy | string | `"IfNotPresent"` | MinIO client image pull policy |
| mcImage.repository | string | `"docker.io/minio/minio"` | MinIO client image repository |
| mcImage.tag | string | `"RELEASE.2025-07-23T15-54-02Z"` | MinIO client image tag |
| metrics | object | `{"serviceMonitor":{"additionalLabels":{},"annotations":{},"enabled":false,"includeNode":false,"interval":null,"namespace":null,"public":true,"relabelConfigs":{},"relabelConfigsCluster":{},"scrapeTimeout":null}}` | Prometheus metrics configuration |
| metrics.serviceMonitor | object | `{"additionalLabels":{},"annotations":{},"enabled":false,"includeNode":false,"interval":null,"namespace":null,"public":true,"relabelConfigs":{},"relabelConfigsCluster":{},"scrapeTimeout":null}` | ServiceMonitor configuration for Prometheus Operator |
| metrics.serviceMonitor.additionalLabels | object | `{}` | Additional labels for the ServiceMonitor |
| metrics.serviceMonitor.annotations | object | `{}` | Annotations for the ServiceMonitor |
| metrics.serviceMonitor.enabled | bool | `false` | Enable ServiceMonitor creation for Prometheus Operator |
| metrics.serviceMonitor.includeNode | bool | `false` | Scrape each node/pod individually for additional per-node metrics |
| metrics.serviceMonitor.interval | string | `nil` | Prometheus scrape interval |
| metrics.serviceMonitor.namespace | string | `nil` | Namespace to deploy ServiceMonitor in |
| metrics.serviceMonitor.public | bool | `true` | Make metrics endpoint publicly accessible |
| metrics.serviceMonitor.relabelConfigs | object | `{}` | Relabel configs for node-level metrics |
| metrics.serviceMonitor.relabelConfigsCluster | object | `{}` | Relabel configs for cluster-level metrics |
| metrics.serviceMonitor.scrapeTimeout | string | `nil` | Prometheus scrape timeout |
| minioAPIPort | string | `"9000"` | Internal port number for MinIO S3 API |
| minioConsolePort | string | `"9001"` | Internal port number for MinIO Browser Console |
| mode | string | `"distributed"` | MinIO mode (standalone or distributed) |
| mountPath | string | `"/export"` | Mount path for persistent volume on MinIO pod |
| nameOverride | string | `""` | String to partially override common.names.fullname template (will maintain the release name) |
| networkPolicy | object | `{"allowExternal":true,"egressEntities":["kube-apiserver"],"enabled":false,"flavor":"kubernetes"}` | Network policy configuration for MinIO pods |
| networkPolicy.allowExternal | bool | `true` | Allow external traffic to MinIO pods |
| networkPolicy.egressEntities | list | `["kube-apiserver"]` | List of egress entities to allow (Cilium only) |
| networkPolicy.enabled | bool | `false` | Enable network policies |
| networkPolicy.flavor | string | `"kubernetes"` | Network policy implementation flavor (kubernetes or cilium) |
| nodeSelector | object | `{}` | Node selector labels for pod assignment |
| oidc | object | `{"claimName":"policy","claimPrefix":"","clientId":"minio","clientSecret":"","comment":"","configUrl":"https://identity-provider-url/.well-known/openid-configuration","displayName":"","enabled":false,"existingClientIdKey":"","existingClientSecretKey":"","existingClientSecretName":"","redirectUri":"https://console-endpoint-url/oauth_callback","scopes":"openid,profile,email"}` | OpenID Connect (OIDC) configuration for external identity management |
| oidc.claimName | string | `"policy"` | OIDC claim name to use for policy mapping |
| oidc.claimPrefix | string | `""` | Prefix to add to OIDC claim values |
| oidc.clientId | string | `"minio"` | OIDC client ID |
| oidc.clientSecret | string | `""` | OIDC client secret |
| oidc.comment | string | `""` | Comment for OIDC configuration |
| oidc.configUrl | string | `"https://identity-provider-url/.well-known/openid-configuration"` | OIDC provider configuration URL |
| oidc.displayName | string | `""` | Display name for OIDC provider in MinIO console |
| oidc.enabled | bool | `false` | Enable OIDC authentication |
| oidc.existingClientIdKey | string | `""` | Key in existing Secret for OIDC client ID |
| oidc.existingClientSecretKey | string | `""` | Key in existing Secret for OIDC client secret |
| oidc.existingClientSecretName | string | `""` | Name of existing Secret containing OIDC client credentials |
| oidc.redirectUri | string | `"https://console-endpoint-url/oauth_callback"` | OIDC redirect URI for OAuth callback |
| oidc.scopes | string | `"openid,profile,email"` | OIDC scopes to request |
| persistence | object | `{"accessMode":"ReadWriteOnce","annotations":{},"enabled":true,"existingClaim":"","size":"500Gi","storageClass":"","subPath":"","volumeName":""}` | Persistent volume configuration for MinIO data storage |
| persistence.accessMode | string | `"ReadWriteOnce"` | Access mode for persistent volume |
| persistence.annotations | object | `{}` | Annotations to add to the PersistentVolumeClaim |
| persistence.enabled | bool | `true` | Enable persistent storage for MinIO |
| persistence.existingClaim | string | `""` | Name of existing PersistentVolumeClaim to use instead of creating new one |
| persistence.size | string | `"500Gi"` | Size of persistent volume claim |
| persistence.storageClass | string | `""` | Storage class name for persistent volume |
| persistence.subPath | string | `""` | Mount a sub-path within the volume instead of the root |
| persistence.volumeName | string | `""` | Name of persistent volume to bind to |
| podAnnotations | object | `{}` | Additional annotations to add to MinIO pods |
| podDisruptionBudget | object | `{"enabled":false,"maxUnavailable":1}` | Pod disruption budget configuration for MinIO |
| podDisruptionBudget.enabled | bool | `false` | Enable pod disruption budget |
| podDisruptionBudget.maxUnavailable | int | `1` | Maximum number of unavailable pods during disruptions |
| podLabels | object | `{}` | Additional labels to add to MinIO pods |
| policies | list | `[]` | List of custom MinIO policies to create after installation |
| pools | int | `1` | Number of MinIO server pools for distributed deployment |
| postJob | object | `{"affinity":{},"annotations":{},"nodeSelector":{},"podAnnotations":{},"securityContext":{},"tolerations":[]}` | Configuration for merged post-installation jobs |
| postJob.affinity | object | `{}` | Affinity rules for postJob pod assignment |
| postJob.annotations | object | `{}` | Annotations to add to the postJob |
| postJob.nodeSelector | object | `{}` | Node selector labels for postJob pod assignment |
| postJob.podAnnotations | object | `{}` | Annotations to add to the postJob pods |
| postJob.securityContext | object | `{}` | Security context for the postJob |
| postJob.tolerations | list | `[]` | Tolerations for postJob pod assignment |
| priorityClassName | string | `""` | Priority class name for MinIO pods |
| replicas | int | `16` | Number of MinIO pod replicas to run |
| resources | object | `{"requests":{"memory":"16Gi"}}` | Resource requests and limits for MinIO containers |
| resources.requests | object | `{"memory":"16Gi"}` | Resource requests for MinIO containers |
| resources.requests.memory | string | `"16Gi"` | Memory request for MinIO containers |
| rootPassword | string | `""` | MinIO root password (admin password), auto-generated if not set |
| rootUser | string | `""` | MinIO root user (admin username), auto-generated if not set |
| runtimeClassName | string | `""` | Runtime class name for MinIO pods |
| securityContext | object | `{}` | Pod-level security context (only applied when persistence is enabled) |
| service | object | `{"annotations":{},"clusterIP":null,"externalIPs":[],"externalTrafficPolicy":"Cluster","loadBalancerIP":null,"loadBalancerSourceRanges":[],"nodePort":32000,"port":"9000","type":"ClusterIP"}` | Kubernetes Service configuration for MinIO S3 API |
| service.annotations | object | `{}` | Annotations to add to the service |
| service.clusterIP | string | `nil` | Static cluster IP address for the service |
| service.externalIPs | list | `[]` | List of external IPs for the service |
| service.externalTrafficPolicy | string | `"Cluster"` | External traffic policy (Cluster or Local) |
| service.loadBalancerIP | string | `nil` | Static IP address for LoadBalancer service type |
| service.loadBalancerSourceRanges | list | `[]` | List of IP CIDR ranges allowed to access LoadBalancer service |
| service.nodePort | int | `32000` | NodePort to expose the service on each node (requires type: NodePort) |
| service.port | string | `"9000"` | External port for MinIO S3 API service |
| service.type | string | `"ClusterIP"` | Service type (ClusterIP, NodePort, LoadBalancer) |
| serviceAccount | object | `{"create":true,"name":"minio-sa"}` | Service account configuration for MinIO pods |
| serviceAccount.create | bool | `true` | Create a service account for MinIO |
| serviceAccount.name | string | `"minio-sa"` | Name of the service account to use or create |
| statefulSetUpdate | object | `{"updateStrategy":"RollingUpdate"}` | Update strategy configuration for StatefulSets |
| statefulSetUpdate.updateStrategy | string | `"RollingUpdate"` | Type of statefulset update strategy |
| svcaccts | list | `[]` | List of MinIO service accounts to create after installation |
| tls | object | `{"certSecret":"","enabled":false,"privateKey":"private.key","publicCrt":"public.crt"}` | TLS/SSL configuration for MinIO |
| tls.certSecret | string | `""` | Name of Kubernetes Secret containing TLS certificate and key |
| tls.enabled | bool | `false` | Enable TLS for MinIO server |
| tls.privateKey | string | `"private.key"` | Filename of private key in the TLS secret |
| tls.publicCrt | string | `"public.crt"` | Filename of public certificate in the TLS secret |
| tolerations | list | `[]` | Tolerations for pod assignment |
| topologySpreadConstraints | list | `[]` | Topology spread constraints for pod distribution |
| trustedCertsSecret | string | `""` | Name of Kubernetes Secret containing trusted CA certificates for third-party verification |
| users | list | `[{"accessKey":"console","policy":"consoleAdmin","secretKey":"console123"}]` | List of MinIO users to create after installation |
| users[0] | string | `{"accessKey":"console","policy":"consoleAdmin","secretKey":"console123"}` | Access key (username) for the MinIO user |
| users[0].policy | string | `"consoleAdmin"` | Policy to assign to the MinIO user |
| users[0].secretKey | string | `"console123"` | Secret key (password) for the MinIO user |

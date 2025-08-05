# MinIO

## Introduction

[MinIO](https://min.io/) is a high-performance, S3-compatible object storage server designed for large-scale AI/ML, data lake, and database workloads. It is software-defined and runs on any cloud or on-premises infrastructure.

### Key Features

- **S3 Compatible API** - Seamlessly integrate with existing S3-based applications
- **High Performance** - Optimized for throughput and latency-sensitive workloads
- **Enterprise Security** - Built-in encryption, IAM, and compliance features
- **Multi-Cloud Ready** - Deploy across any infrastructure environment
- **Kubernetes Native** - Cloud-native design with horizontal scalability

### Benefits

- Provides reliable object storage for blockchain data and artifacts
- Supports high-throughput data ingestion and retrieval
- Enterprise-grade security and compliance features
- Cost-effective alternative to cloud storage providers
- Native Kubernetes integration and management

### Use Cases

- Blockchain artifact storage (ABIs, contracts, metadata)
- Data lake and analytics storage
- Backup and archival storage
- Content distribution and media storage
- Application data storage

## Maintainers

| Name | Email | Url |
| ---- | ------ | --- |
| SettleMint | <support@settlemint.com> | <https://settlemint.com> |
| MinIO Community |  | <https://github.com/minio/minio> |

## Source Code

* <https://github.com/minio/minio>
* <https://github.com/settlemint/starterkit-asset-tokenization>

## Requirements

Kubernetes: `>=1.19.0-0`

## Prerequisites

- Kubernetes 1.19+
- Helm 3.2.0+
- PV provisioner support in the underlying infrastructure (if persistence is enabled)

## Installing the Chart

To install the chart with the release name `my-release`:

```console
helm install my-release .
```

The command deploys MinIO on the Kubernetes cluster in the default configuration. The [Parameters](#parameters) section lists the parameters that can be configured during installation.

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
| buckets | list | `[]` | MinIO buckets to create during initialization |
| buckets[].name | string |  | Name of the bucket to create |
| buckets[].policy | string | `"none"` | Bucket policy (none/download/upload/public) |
| buckets[].purge | bool | `false` | Purge bucket if it already exists |
| certsPath | string | `"/etc/minio/certs/"` | Path where TLS certificates are stored |
| clusterDomain | string | `"cluster.local"` | Kubernetes cluster domain |
| commonAnnotations | object | `{}` | Annotations to add to all deployed objects |
| commonLabels | object | `{}` | Labels to add to all deployed objects |
| configPath | string | `"/export"` | Default config file location |
| configPathmc | string | `"~/.mc"` | Default mc config file location |
| consoleIngress | object | `{"annotations":{},"enabled":false,"host":"console.local","path":"/","pathType":"Prefix","tls":[]}` | MinIO Console Ingress configuration |
| consoleService | object | `{"port":9001}` | MinIO Console service configuration |
| defaultBucket | object | `{"enabled":false,"name":"bucket","policy":"none","purge":false}` | Default bucket configuration |
| defaultBucket.enabled | bool | `false` | Enable creation of default bucket |
| defaultBucket.name | string | `"bucket"` | Name of default bucket |
| defaultBucket.policy | string | `"none"` | Policy for default bucket |
| defaultBucket.purge | bool | `false` | Purge default bucket if it exists |
| deployment | object | `{"updateStrategy":"RollingUpdate"}` | Deployment update strategy |
| environment | object | `{}` | Additional environment variables |
| existingSecret | string | `""` | Name of existing secret containing MinIO credentials |
| fullnameOverride | string | `""` | String to fully override minio.fullname template |
| global | object | `{"imagePullSecrets":[],"imageRegistry":"","minio":{"existingSecret":"","existingSecretKey":"","secretKey":"","userSecret":""}}` | Global configuration |
| image | object | `{"pullPolicy":"IfNotPresent","repository":"docker.io/minio/minio","tag":"RELEASE.2025-01-15T09-52-16Z"}` | MinIO image configuration |
| image.pullPolicy | string | `"IfNotPresent"` | Image pull policy |
| image.repository | string | `"docker.io/minio/minio"` | MinIO image repository |
| image.tag | string | `"RELEASE.2025-01-15T09-52-16Z"` | MinIO image tag |
| imagePullSecrets | list | `[]` | Image pull secrets |
| ingress | object | `{"annotations":{},"enabled":true,"host":"chart-example.local","path":"/","pathType":"Prefix","tls":[]}` | MinIO API Ingress configuration |
| ingress.annotations | object | `{}` | Ingress annotations |
| ingress.enabled | bool | `true` | Enable ingress |
| ingress.host | string | `"chart-example.local"` | Ingress hostname |
| ingress.path | string | `"/"` | Ingress path |
| ingress.pathType | string | `"Prefix"` | Ingress path type |
| ingress.tls | list | `[]` | Ingress TLS configuration |
| livenessProbe | object | `{"httpGet":{"path":"/minio/health/live","port":"http","scheme":"HTTP"},"initialDelaySeconds":5,"periodSeconds":30,"timeoutSeconds":20}` | Liveness probe configuration |
| mcImage | object | `{"pullPolicy":"IfNotPresent","repository":"docker.io/minio/mc","tag":"RELEASE.2025-01-15T02-52-12Z"}` | MinIO Client (mc) image configuration |
| mode | string | `"standalone"` | MinIO deployment mode (standalone/distributed) |
| mountPath | string | `"/export"` | Default mount path for MinIO data |
| nameOverride | string | `""` | String to partially override minio.fullname template |
| networkPolicy | object | `{"allowExternal":true,"enabled":false}` | Network policy configuration |
| networkPolicy.allowExternal | bool | `true` | Allow external traffic |
| networkPolicy.enabled | bool | `false` | Enable network policy |
| nodeSelector | object | `{}` | Node labels for pod assignment |
| persistence | object | `{"accessMode":"ReadWriteOnce","enabled":true,"existingClaim":"","size":"500Gi","storageClass":"","subPath":""}` | Persistence configuration |
| persistence.accessMode | string | `"ReadWriteOnce"` | PVC access mode |
| persistence.enabled | bool | `true` | Enable persistence |
| persistence.existingClaim | string | `""` | Use existing PVC |
| persistence.size | string | `"500Gi"` | PVC size |
| persistence.storageClass | string | `""` | Storage class name |
| persistence.subPath | string | `""` | Sub path within the volume |
| podAnnotations | object | `{}` | Pod annotations |
| podLabels | object | `{}` | Pod labels |
| podSecurityContext | object | `{"enabled":true,"fsGroup":1001,"runAsGroup":1001,"runAsUser":1001}` | Pod security context |
| policies | list | `[]` | MinIO policies to create |
| postJob | object | `{"podAnnotations":{},"resources":{"requests":{"memory":"128Mi"}}}` | Post-installation job configuration |
| priorityClassName | string | `""` | Priority class name |
| readinessProbe | object | `{"httpGet":{"path":"/minio/health/ready","port":"http","scheme":"HTTP"},"initialDelaySeconds":5,"periodSeconds":15,"timeoutSeconds":10}` | Readiness probe configuration |
| replicas | int | `4` | Number of MinIO instances |
| resources | object | `{}` | Resource limits and requests |
| rootPassword | string | `""` | MinIO root password (use existingSecret instead) |
| rootUser | string | `""` | MinIO root username (use existingSecret instead) |
| securityContext | object | `{"enabled":true,"runAsGroup":1001,"runAsNonRoot":true,"runAsUser":1001}` | Container security context |
| service | object | `{"clusterIP":"","externalIPs":[],"loadBalancerIP":"","loadBalancerSourceRanges":[],"nodePort":32000,"port":9000,"type":"ClusterIP"}` | Service configuration |
| service.clusterIP | string | `""` | Service cluster IP |
| service.externalIPs | list | `[]` | Service external IPs |
| service.loadBalancerIP | string | `""` | Load balancer IP |
| service.loadBalancerSourceRanges | list | `[]` | Load balancer source ranges |
| service.nodePort | int | `32000` | Service node port |
| service.port | int | `9000` | Service port |
| service.type | string | `"ClusterIP"` | Service type |
| serviceAccount | object | `{"annotations":{},"create":true,"name":""}` | Service account configuration |
| svcaccts | list | `[]` | MinIO service accounts to create |
| tls | object | `{"certSecret":"","enabled":false,"publicCrt":"","privateKey":""}` | TLS configuration |
| tolerations | list | `[]` | Tolerations for pod assignment |
| trustedCertsSecret | string | `""` | Secret containing trusted certificates |
| users | list | `[]` | MinIO users to create |
| users[].accessKey | string |  | User access key |
| users[].existingSecret | string |  | Existing secret containing user credentials |
| users[].existingSecretKey | string |  | Key in existing secret |
| users[].policy | string |  | Policy to assign to user |
| users[].secretKey | string |  | User secret key |

## Configuration and installation details

### Setting up credentials

#### Using existing secret

Create a secret with MinIO credentials:

```console
kubectl create secret generic minio-secret \
  --from-literal=rootUser=admin \
  --from-literal=rootPassword=secretpassword
```

Then reference it in values:

```yaml
existingSecret: minio-secret
```

#### Direct configuration (not recommended for production)

```yaml
rootUser: admin
rootPassword: secretpassword
```

### Creating buckets

Configure buckets to be created during initialization:

```yaml
buckets:
  - name: my-bucket
    policy: public
    purge: false
  - name: private-bucket
    policy: none
    purge: false
```

### Creating users and policies

Create MinIO users with specific policies:

```yaml
users:
  - accessKey: myuser
    secretKey: mypassword
    policy: readwrite
  - accessKey: readonly-user
    existingSecret: user-secret
    existingSecretKey: password
    policy: readonly

policies:
  - name: readwrite
    statements:
      - resources:
          - 'arn:aws:s3:::my-bucket'
          - 'arn:aws:s3:::my-bucket/*'
        actions:
          - 's3:ListBucket'
          - 's3:GetObject'
          - 's3:PutObject'
          - 's3:DeleteObject'
```

### Persistence configuration

#### Using default storage

```yaml
persistence:
  enabled: true
  size: 500Gi
  storageClass: fast-ssd
```

#### Using existing PVC

```yaml
persistence:
  enabled: true
  existingClaim: my-minio-pvc
```

#### Disabling persistence (development only)

```yaml
persistence:
  enabled: false
```

### Exposing MinIO

#### LoadBalancer service

```yaml
service:
  type: LoadBalancer
  port: 9000
consoleService:
  type: LoadBalancer
  port: 9001
```

#### Ingress configuration

```yaml
ingress:
  enabled: true
  host: minio-api.example.com
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt
  tls:
    - secretName: minio-api-tls
      hosts:
        - minio-api.example.com

consoleIngress:
  enabled: true
  host: minio-console.example.com
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt
  tls:
    - secretName: minio-console-tls
      hosts:
        - minio-console.example.com
```

### TLS Configuration

#### Using cert-manager

```yaml
tls:
  enabled: true
  certSecret: minio-tls-secret
```

#### Using custom certificates

Create a secret with your certificates:

```console
kubectl create secret tls minio-tls-secret \
  --cert=path/to/tls.crt \
  --key=path/to/tls.key
```

Then configure:

```yaml
tls:
  enabled: true
  certSecret: minio-tls-secret
```

### Distributed mode

For high availability, use distributed mode:

```yaml
mode: distributed
replicas: 4  # Must be 4 or more for distributed mode
```

### Resource limits and monitoring

Configure resource requirements:

```yaml
resources:
  limits:
    cpu: 250m
    memory: 256Mi
  requests:
    cpu: 250m
    memory: 256Mi
```

## Troubleshooting

### MinIO pods not starting

Check pod logs for configuration errors:

```console
kubectl logs -l app.kubernetes.io/name=minio
```

### Storage issues

Verify PVC is bound correctly:

```console
kubectl get pvc
kubectl describe pvc <pvc-name>
```

### Connection issues

Test MinIO connectivity from within the cluster:

```console
kubectl run minio-test --rm -it --image=docker.io/minio/mc:latest -- \
  mc config host add myminio http://minio:9000 <access-key> <secret-key>
```

### Browser access issues

For console access, ensure the console service and ingress are configured correctly:

```console
kubectl get svc -l app.kubernetes.io/name=minio
kubectl get ingress -l app.kubernetes.io/name=minio
```

### Performance tuning

For high-throughput workloads, consider:

- Using fast storage (NVMe SSD)
- Increasing resource limits
- Enabling distributed mode
- Tuning network policies for optimal access patterns

### Security considerations

- Always use `existingSecret` for credentials in production
- Enable TLS for all external communications
- Configure appropriate bucket policies and user permissions
- Use network policies to restrict access
- Regularly rotate access keys and passwords
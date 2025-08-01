# Support Infrastructure

![Version: 0.1.0](https://img.shields.io/badge/Version-0.1.0-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: 0.1.0](https://img.shields.io/badge/AppVersion-0.1.0-informational?style=flat-square)

A Helm chart for deploying essential infrastructure components that support the Asset Tokenization Kit, including databases, caching, storage, networking, and operational tools.

## Overview

The Support Infrastructure provides the foundational services required by the Asset Tokenization Kit. These components include PostgreSQL for persistent data storage, Redis for caching and sessions, MinIO for object storage, Ingress NGINX for traffic routing, and Reloader for automatic configuration updates.

## Key Features

- **Database Services**: High-performance PostgreSQL with optimized configuration
- **Caching Layer**: Redis for session management and application caching
- **Object Storage**: S3-compatible storage with MinIO
- **Traffic Management**: NGINX Ingress Controller with advanced routing
- **Configuration Management**: Automatic reloading of configuration changes
- **High Availability**: Multi-instance deployment support
- **Security**: Network policies and resource isolation

## Architecture

### Core Components

#### PostgreSQL Database
- **Primary Database**: Main data storage for all ATK applications
- **Multi-Database Support**: Separate databases for each service
- **Optimized Configuration**: Tuned for blockchain and analytics workloads
- **Connection Pooling**: Efficient connection management
- **Backup Ready**: Prepared for backup and recovery operations

#### Redis Cache
- **Session Storage**: User session and authentication data
- **Application Cache**: Query results and computed data caching
- **Rate Limiting**: API rate limiting and throttling
- **Pub/Sub**: Real-time messaging between services

#### MinIO Object Storage
- **File Storage**: Document and media file storage
- **S3 Compatibility**: Full AWS S3 API compatibility
- **Multi-Tenant**: Bucket-based isolation for different tenants
- **Web UI**: Management console for bucket administration

#### NGINX Ingress Controller
- **Traffic Routing**: Advanced HTTP/HTTPS routing and load balancing
- **SSL Termination**: Automatic TLS certificate management
- **Rate Limiting**: Request rate limiting and DDoS protection
- **Request Processing**: Header manipulation, rewrites, and redirects

#### Reloader
- **Configuration Watching**: Monitors ConfigMaps and Secrets for changes
- **Automatic Restart**: Restarts pods when configuration changes
- **Zero-Downtime Updates**: Rolling updates for configuration changes
- **Multi-Namespace Support**: Watches resources across namespaces

## Database Architecture

### PostgreSQL Configuration

#### Multi-Database Setup
The PostgreSQL instance hosts separate databases for each ATK component:

```sql
-- ATK Database Schema
CREATE DATABASE blockscout;     -- Blockchain explorer database
CREATE DATABASE thegraph;       -- Graph Node indexing database  
CREATE DATABASE hasura;         -- Hasura metadata database
CREATE DATABASE portal;         -- Portal API business logic database
CREATE DATABASE txsigner;       -- Transaction signing service database

-- User Management
CREATE USER blockscout WITH PASSWORD 'atk' SUPERUSER;
CREATE USER thegraph WITH PASSWORD 'atk' SUPERUSER;
CREATE USER hasura WITH PASSWORD 'atk' SUPERUSER;
CREATE USER portal WITH PASSWORD 'atk' SUPERUSER;
CREATE USER txsigner WITH PASSWORD 'atk' SUPERUSER;
```

#### Performance Optimization
```yaml
postgresql_conf:
  # Memory settings
  shared_buffers: "256MB"
  effective_cache_size: "1GB" 
  work_mem: "4MB"
  maintenance_work_mem: "64MB"
  
  # Checkpoint and WAL settings
  wal_buffers: "16MB"
  checkpoint_completion_target: 0.9
  max_wal_size: "4GB"
  min_wal_size: "1GB"
  
  # Query planning
  default_statistics_target: 100
  random_page_cost: 1.1
  effective_io_concurrency: 200
  
  # Connection settings
  max_connections: 1000
```

#### Storage Configuration
```yaml
persistence:
  enabled: true
  size: "8Gi"
  storageClass: ""  # Use default storage class
  accessModes:
  - ReadWriteOnce
```

## Caching Strategy

### Redis Configuration
```yaml
redis:
  architecture: "standalone"
  auth:
    enabled: true
    password: "atk"
  
  # Memory and persistence
  master:
    persistence:
      enabled: true
      size: "2Gi"
    resources:
      requests:
        memory: "256Mi"
        cpu: "100m"
      limits:
        memory: "512Mi"
        cpu: "500m"
```

### Cache Usage Patterns
- **Session Storage**: User authentication sessions and JWT tokens
- **Query Caching**: GraphQL query results and database query caching
- **Rate Limiting**: API request counting and throttling
- **Temporary Data**: Processing queues and temporary calculations

## Object Storage

### MinIO Configuration
```yaml
minio:
  mode: "standalone"
  replicas: 1
  
  # Authentication
  rootUser: "admin"
  rootPassword: "atk-password"
  
  # Storage
  persistence:
    enabled: true
    size: "1Gi"
  
  # Buckets
  buckets:
  - name: "atk"
    policy: "none"
    purge: false
  
  # Service accounts
  users:
  - accessKey: "atk-service"
    secretKey: "atk-service-secret"
    policy: "readwrite"
```

### Storage Use Cases
- **Document Storage**: KYC documents, compliance reports
- **Media Files**: User avatars, company logos
- **Backup Files**: Database backups, configuration exports
- **Temporary Files**: Report generation, file processing

## Ingress and Networking

### NGINX Ingress Controller
```yaml
ingress-nginx:
  controller:
    ingressClass: "atk-nginx"
    ingressClassResource:
      name: "atk-nginx"
      controllerValue: "k8s.io/atk-nginx"
      default: false
    
    # Resource allocation
    replicaCount: 1
    resources:
      requests:
        cpu: "100m"
        memory: "90Mi"
      limits:
        cpu: "500m"
        memory: "256Mi"
```

### Advanced Configuration
```yaml
controller:
  config:
    # Performance tuning
    worker-processes: "auto"
    max-worker-connections: "65536" 
    upstream-keepalive-connections: "64"
    upstream-keepalive-timeout: "120"
    
    # Security settings
    ssl-redirect: "false"
    ssl-ciphers: "ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256"
    
    # Request handling
    proxy-body-size: "500M"
    proxy-read-timeout: "3600"
    proxy-send-timeout: "3600"
    client-body-buffer-size: "128k"
    
    # Observability
    enable-opentelemetry: "true"
    log-format-escape-json: "true"
```

### Service Routing Examples
```yaml
# DApp Frontend
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: dapp-ingress
  annotations:
    kubernetes.io/ingress.class: "atk-nginx"
    nginx.ingress.kubernetes.io/rewrite-target: "/$2"
spec:
  rules:
  - host: dapp.local
    http:
      paths:
      - path: "/((?:sm_|bpaas-)[^/]+)?/?(.*)"
        pathType: ImplementationSpecific
        backend:
          service:
            name: dapp
            port:
              number: 3000

# API Services
- host: hasura.local
  http:
    paths:
    - path: /
      pathType: Prefix
      backend:
        service:
          name: hasura
          port:
            number: 8080
```

## Configuration Management

### Reloader Setup
```yaml
reloader:
  reloader:
    autoReloadAll: true
    watchGlobally: false
    reloadOnCreate: false
    syncAfterRestart: true
    
    # Security context
    securityContext:
      runAsNonRoot: true
      runAsUser: 2016
      allowPrivilegeEscalation: false
      capabilities:
        drop:
        - ALL
      readOnlyRootFilesystem: true
```

### Watched Resources
```yaml
# ConfigMap example with reload annotation
metadata:
  annotations:
    reloader.stakater.com/match: "true"

# Deployment example with specific ConfigMap watching
metadata:
  annotations:
    configmap.reloader.stakater.com/reload: "app-config,database-config"
    secret.reloader.stakater.com/reload: "app-secrets"
```

## Deployment Patterns

### Single Instance (Development)
```yaml
# Minimal resource allocation
postgresql:
  resources:
    requests:
      cpu: "100m"
      memory: "256Mi"
    limits:
      cpu: "500m"
      memory: "1Gi"

redis:
  master:
    resources:
      requests:
        cpu: "50m"
        memory: "128Mi"
      limits:
        cpu: "200m"
        memory: "256Mi"

minio:
  resources:
    requests:
      cpu: "100m"
      memory: "256Mi"
    limits:
      cpu: "200m"
      memory: "512Mi"
```

### High Availability (Production)
```yaml
# PostgreSQL HA configuration
postgresql:
  architecture: "replication"
  primary:
    persistence:
      size: "50Gi"
  readReplicas:
    replicaCount: 2
    persistence:
      size: "50Gi"
  
# Redis HA configuration  
redis:
  architecture: "master-slave"
  replica:
    replicaCount: 2
    persistence:
      enabled: true
      size: "5Gi"

# NGINX HA configuration
ingress-nginx:
  controller:
    replicaCount: 3
    autoscaling:
      enabled: true
      minReplicas: 2
      maxReplicas: 10
      targetCPUUtilizationPercentage: 80
```

## Security Configuration

### Network Policies
```yaml
# PostgreSQL network policy
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: postgresql-netpol
spec:
  podSelector:
    matchLabels:
      app.kubernetes.io/name: postgresql
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app.kubernetes.io/part-of: "settlemint-atk"
    ports:
    - protocol: TCP
      port: 5432

# Redis network policy  
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: redis-netpol
spec:
  podSelector:
    matchLabels:
      app.kubernetes.io/name: redis
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app.kubernetes.io/part-of: "settlemint-atk"
    ports:
    - protocol: TCP
      port: 6379
```

### Security Contexts
```yaml
# PostgreSQL security context
podSecurityContext:
  fsGroup: 1001
  runAsUser: 1001
  runAsNonRoot: true

securityContext:
  allowPrivilegeEscalation: false
  capabilities:
    drop:
    - ALL
  readOnlyRootFilesystem: false
  runAsNonRoot: true
  runAsUser: 1001
```

## Monitoring and Health Checks

### Health Check Configuration
```yaml
# PostgreSQL health checks
livenessProbe:
  exec:
    command:
    - /bin/sh
    - -c
    - exec pg_isready -U "postgres" -h 127.0.0.1 -p 5432
  initialDelaySeconds: 30
  periodSeconds: 10
  timeoutSeconds: 5
  successThreshold: 1
  failureThreshold: 6

readinessProbe:
  exec:
    command:
    - /bin/sh
    - -c
    - exec pg_isready -U "postgres" -h 127.0.0.1 -p 5432
  initialDelaySeconds: 5
  periodSeconds: 5
  timeoutSeconds: 3
  successThreshold: 1
  failureThreshold: 3
```

### Metrics Collection
```yaml
# Service monitor for PostgreSQL
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: postgresql-metrics
spec:
  selector:
    matchLabels:
      app.kubernetes.io/name: postgresql
  endpoints:
  - port: metrics
    interval: 30s
    path: /metrics

# Annotations for metrics scraping
podAnnotations:
  prometheus.io/scrape: "true"
  prometheus.io/port: "9187"
  prometheus.io/path: "/metrics"
```

## Backup and Recovery

### PostgreSQL Backup Strategy
```yaml
# Backup configuration
backup:
  enabled: true
  schedule: "0 2 * * *"  # Daily at 2 AM
  retention: "7d"
  
  # Storage for backups
  persistence:
    enabled: true
    size: "20Gi"
    storageClass: "backup-storage"
```

### Backup Commands
```bash
# Manual database backup
kubectl exec -it postgresql-0 -- pg_dumpall -U postgres > backup.sql

# Restore from backup
kubectl exec -i postgresql-0 -- psql -U postgres < backup.sql

# MinIO backup
kubectl exec -it minio-0 -- mc mirror --overwrite /data backup-location/
```

## Troubleshooting

### Common Issues

#### 1. PostgreSQL Connection Issues
```bash
# Check PostgreSQL status
kubectl get pods -l app.kubernetes.io/name=postgresql

# Test connection
kubectl exec -it postgresql-0 -- psql -U postgres -c "SELECT version();"

# Check logs
kubectl logs -l app.kubernetes.io/name=postgresql | tail -100

# Verify service endpoints
kubectl get endpoints postgresql
```

#### 2. Redis Connection Problems
```bash
# Check Redis status
kubectl get pods -l app.kubernetes.io/name=redis

# Test Redis connection
kubectl exec -it redis-master-0 -- redis-cli ping

# Check authentication
kubectl exec -it redis-master-0 -- redis-cli -a atk ping

# Monitor Redis info
kubectl exec -it redis-master-0 -- redis-cli -a atk info
```

#### 3. Ingress Issues
```bash
# Check ingress controller status
kubectl get pods -n ingress-nginx

# Verify ingress resources
kubectl get ingress -n atk

# Check controller logs
kubectl logs -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx

# Test backend connectivity
kubectl exec -it deployment/ingress-nginx-controller -- curl http://service:port
```

#### 4. MinIO Access Issues
```bash
# Check MinIO status
kubectl get pods -l app.kubernetes.io/name=minio

# Test MinIO API
kubectl exec -it minio-0 -- mc admin info minio

# Check bucket configuration
kubectl exec -it minio-0 -- mc ls minio/atk

# Verify credentials
kubectl get secret minio -o yaml
```

### Performance Optimization

#### PostgreSQL Tuning
```sql
-- Monitor active connections
SELECT count(*) FROM pg_stat_activity;

-- Check slow queries
SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC LIMIT 10;

-- Monitor database size
SELECT pg_database.datname, 
       pg_size_pretty(pg_database_size(pg_database.datname)) AS size
FROM pg_database;
```

#### Redis Performance Monitoring
```bash
# Redis performance stats
redis-cli info stats

# Monitor memory usage
redis-cli info memory

# Check slow queries
redis-cli slowlog get 10
```

## Maintenance Operations

### Routine Maintenance
```bash
# PostgreSQL maintenance
kubectl exec -it postgresql-0 -- psql -U postgres -c "VACUUM ANALYZE;"

# Redis maintenance
kubectl exec -it redis-master-0 -- redis-cli -a atk BGREWRITEAOF

# Check disk usage
kubectl exec -it postgresql-0 -- df -h
kubectl exec -it redis-master-0 -- df -h
kubectl exec -it minio-0 -- df -h
```

### Configuration Updates
```bash
# Update PostgreSQL configuration
kubectl edit configmap postgresql-config

# Update Redis configuration  
kubectl edit configmap redis-config

# Trigger reload (if Reloader is configured)
kubectl annotate configmap postgresql-config reloader.stakater.com/match=true
```

## Integration with ATK Components

### Service Dependencies
The support infrastructure provides services that other ATK components depend on:

1. **PostgreSQL** → **Hasura**, **Graph Node**, **Portal**, **Blockscout**
2. **Redis** → **Hasura**, **Portal**, **DApp** (sessions)
3. **MinIO** → **Portal**, **DApp** (file storage)
4. **Ingress NGINX** → **All web services** (traffic routing)
5. **Reloader** → **All services** (configuration management)

### Service Discovery
```yaml
# Internal service DNS names
postgresql.atk.svc.cluster.local:5432
redis.atk.svc.cluster.local:6379
minio.atk.svc.cluster.local:9000
```

### Connection Examples
```javascript
// PostgreSQL connection
const client = new Client({
  host: 'postgresql.atk.svc.cluster.local',
  port: 5432,
  database: 'hasura',
  user: 'hasura',
  password: process.env.DB_PASSWORD
});

// Redis connection
const redis = new Redis({
  host: 'redis.atk.svc.cluster.local',
  port: 6379,
  password: process.env.REDIS_PASSWORD
});

// MinIO connection
const minioClient = new Minio.Client({
  endPoint: 'minio.atk.svc.cluster.local',
  port: 9000,
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY
});
```

## Maintainers

| Name | Email | Url |
| ---- | ------ | --- |
| SettleMint | <support@settlemint.com> | <https://settlemint.com> |

## Requirements

| Repository | Name | Version |
|------------|------|---------|
| file://./charts/postgresql | postgresql | * |
| file://./charts/redis | redis | * |
| https://charts.min.io/ | minio | 5.4.0 |
| https://kubernetes.github.io/ingress-nginx | ingress-nginx | 4.13.0 |
| https://stakater.github.io/stakater-charts | reloader | 2.2.0 |

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| ingress-nginx.controller.admissionWebhooks.enabled | bool | `false` |  |
| ingress-nginx.controller.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution[0].podAffinityTerm.labelSelector.matchExpressions[0].key | string | `"app.kubernetes.io/component"` |  |
| ingress-nginx.controller.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution[0].podAffinityTerm.labelSelector.matchExpressions[0].operator | string | `"In"` |  |
| ingress-nginx.controller.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution[0].podAffinityTerm.labelSelector.matchExpressions[0].values[0] | string | `"controller"` |  |
| ingress-nginx.controller.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution[0].podAffinityTerm.labelSelector.matchExpressions[1].key | string | `"app.kubernetes.io/name"` |  |
| ingress-nginx.controller.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution[0].podAffinityTerm.labelSelector.matchExpressions[1].operator | string | `"In"` |  |
| ingress-nginx.controller.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution[0].podAffinityTerm.labelSelector.matchExpressions[1].values[0] | string | `"ingress-nginx"` |  |
| ingress-nginx.controller.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution[0].podAffinityTerm.topologyKey | string | `"kubernetes.io/hostname"` |  |
| ingress-nginx.controller.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution[0].weight | int | `100` |  |
| ingress-nginx.controller.allowSnippetAnnotations | bool | `true` |  |
| ingress-nginx.controller.autoscaling.behaviour.scaleDown.policies[0].periodSeconds | int | `180` |  |
| ingress-nginx.controller.autoscaling.behaviour.scaleDown.policies[0].type | string | `"Pods"` |  |
| ingress-nginx.controller.autoscaling.behaviour.scaleDown.policies[0].value | int | `1` |  |
| ingress-nginx.controller.autoscaling.behaviour.scaleDown.stabilizationWindowSeconds | int | `300` |  |
| ingress-nginx.controller.autoscaling.behaviour.scaleUp.policies[0].periodSeconds | int | `60` |  |
| ingress-nginx.controller.autoscaling.behaviour.scaleUp.policies[0].type | string | `"Pods"` |  |
| ingress-nginx.controller.autoscaling.behaviour.scaleUp.policies[0].value | int | `2` |  |
| ingress-nginx.controller.autoscaling.behaviour.scaleUp.stabilizationWindowSeconds | int | `0` |  |
| ingress-nginx.controller.autoscaling.enabled | bool | `false` |  |
| ingress-nginx.controller.autoscaling.maxReplicas | int | `10` |  |
| ingress-nginx.controller.autoscaling.minReplicas | int | `2` |  |
| ingress-nginx.controller.autoscaling.targetCPUUtilizationPercentage | int | `80` |  |
| ingress-nginx.controller.autoscaling.targetMemoryUtilizationPercentage | int | `80` |  |
| ingress-nginx.controller.config.annotations-risk-level | string | `"Critical"` |  |
| ingress-nginx.controller.config.client-body-buffer-size | string | `"128k"` |  |
| ingress-nginx.controller.config.enable-access-log-for-default-backend | string | `"true"` |  |
| ingress-nginx.controller.config.enable-brotli | string | `"true"` |  |
| ingress-nginx.controller.config.enable-opentelemetry | string | `"true"` |  |
| ingress-nginx.controller.config.enable-underscores-in-headers | string | `"true"` |  |
| ingress-nginx.controller.config.http-snippet | string | `"lua_need_request_body on;\n\nmap $status $request_body_filtered {\n    204     \"\";\n    default $request_body_binary_check;\n}\n\nmap $request_body $request_body_binary_check {\n    ~[^[:print:]]  \"[binary data]\";\n    default       $request_body;\n}\n\nserver {\n    listen 18080;\n\n    location /nginx_status {\n        allow all;\n        stub_status on;\n    }\n    location / {\n        return 404;\n    }\n}\n"` |  |
| ingress-nginx.controller.config.http2-push-preload | string | `"true"` |  |
| ingress-nginx.controller.config.ignore-invalid-headers | string | `"false"` |  |
| ingress-nginx.controller.config.limit-req-status-code | string | `"429"` |  |
| ingress-nginx.controller.config.log-format-escape-json | string | `"true"` |  |
| ingress-nginx.controller.config.log-format-upstream | string | `"{\"proxyUpstreamName\": \"$proxy_upstream_name\", \"httpRequest\":{\"requestMethod\": \"$request_method\", \"requestUrl\": \"$host$request_uri\", \"status\": $status, \"requestBody\": \"${request_body_filtered}\"}, \"cloudflare\": {\"cfConnectingIp\": \"$http_cf_connecting_ip\", \"cfIpCountry\": \"$http_cf_ipcountry\", \"cfRay\": \"$http_cf_ray\", \"trueClientIp\": \"$http_true_client_ip\"}, \"meta\": {\"timestamp\": \"$time_iso8601\", \"latency\": \"$upstream_response_time s\", \"requestID\": \"$req_id\", \"requestSize\": \"$request_length\", \"responseSize\": \"$upstream_response_length\", \"userAgent\": \"$http_user_agent\", \"referer\": \"$http_referer\", \"protocol\":\"$server_protocol\", \"proxyAlternativeUpstreamName\": \"$proxy_alternative_upstream_name\", \"upstreamStatus\": \"$upstream_status\", \"upstreamAddr\": \"$upstream_addr\", \"cfVisitor\": \"$http_cf_visitor\", \"cfRequestId\": \"$http_cf_request_id\"}}"` |  |
| ingress-nginx.controller.config.max-worker-connections | string | `"65536"` |  |
| ingress-nginx.controller.config.nginx-status-ipv4-whitelist | string | `"0.0.0.0"` |  |
| ingress-nginx.controller.config.opentelemetry-trust-incoming-span | string | `"true"` |  |
| ingress-nginx.controller.config.otel-max-export-batch-size | string | `"512"` |  |
| ingress-nginx.controller.config.otel-max-queuesize | string | `"2048"` |  |
| ingress-nginx.controller.config.otel-sampler | string | `"AlwaysOn"` |  |
| ingress-nginx.controller.config.otel-sampler-parent-based | string | `"false"` |  |
| ingress-nginx.controller.config.otel-sampler-ratio | string | `"1.0"` |  |
| ingress-nginx.controller.config.otel-schedule-delay-millis | string | `"5000"` |  |
| ingress-nginx.controller.config.otlp-collector-host | string | `"o11y-alloy"` |  |
| ingress-nginx.controller.config.otlp-collector-port | string | `"4317"` |  |
| ingress-nginx.controller.config.proxy-body-size | string | `"500M"` |  |
| ingress-nginx.controller.config.proxy-buffer-size | string | `"128k"` |  |
| ingress-nginx.controller.config.proxy-buffering | string | `"on"` |  |
| ingress-nginx.controller.config.proxy-buffers-number | string | `"4"` |  |
| ingress-nginx.controller.config.proxy-busy-buffers-size | string | `"128k"` |  |
| ingress-nginx.controller.config.proxy-max-temp-file-size | string | `"1024m"` |  |
| ingress-nginx.controller.config.proxy-read-timeout | string | `"3600"` |  |
| ingress-nginx.controller.config.proxy-send-timeout | string | `"3600"` |  |
| ingress-nginx.controller.config.proxy_next_upstream | string | `"error timeout http_500 http_502 http_503 http_504"` |  |
| ingress-nginx.controller.config.proxy_next_upstream_timeout | string | `"30"` |  |
| ingress-nginx.controller.config.proxy_next_upstream_tries | string | `"3"` |  |
| ingress-nginx.controller.config.ssl-ciphers | string | `"ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384:AES128-GCM-SHA256:AES128-GCM-SHA384"` |  |
| ingress-nginx.controller.config.ssl-redirect | string | `"false"` |  |
| ingress-nginx.controller.config.tcp-fast-open | string | `"3000"` |  |
| ingress-nginx.controller.config.upstream-keepalive-connections | string | `"64"` |  |
| ingress-nginx.controller.config.upstream-keepalive-timeout | string | `"120"` |  |
| ingress-nginx.controller.config.use-forwarded-headers | string | `"false"` |  |
| ingress-nginx.controller.config.use-http2 | string | `"true"` |  |
| ingress-nginx.controller.config.worker-processes | string | `"auto"` |  |
| ingress-nginx.controller.extraArgs.enable-ssl-passthrough | string | `"true"` |  |
| ingress-nginx.controller.ingressClass | string | `"atk-nginx"` |  |
| ingress-nginx.controller.ingressClassResource.controllerValue | string | `"k8s.io/atk-nginx"` |  |
| ingress-nginx.controller.ingressClassResource.default | bool | `false` |  |
| ingress-nginx.controller.ingressClassResource.enabled | bool | `true` |  |
| ingress-nginx.controller.ingressClassResource.name | string | `"atk-nginx"` | If you run more than one platform versions on a single cluster, you need to make sure these are unique |
| ingress-nginx.controller.metrics.enabled | bool | `true` |  |
| ingress-nginx.controller.metrics.service.annotations."prometheus.io/port" | string | `"10254"` |  |
| ingress-nginx.controller.metrics.service.annotations."prometheus.io/scrape" | string | `"true"` |  |
| ingress-nginx.controller.metrics.service.labels."kots.io/app-slug" | string | `"settlemint-atk"` |  |
| ingress-nginx.controller.opentelemetry.enabled | bool | `true` |  |
| ingress-nginx.controller.opentelemetry.image.registry | string | `"registry.k8s.io"` |  |
| ingress-nginx.controller.patch.image.registry | string | `"registry.k8s.io"` |  |
| ingress-nginx.controller.podAnnotations."prometheus.io/port" | string | `"10254"` |  |
| ingress-nginx.controller.podAnnotations."prometheus.io/scrape" | string | `"true"` |  |
| ingress-nginx.controller.podLabels."kots.io/app-slug" | string | `"settlemint-atk"` |  |
| ingress-nginx.controller.replicaCount | int | `1` |  |
| ingress-nginx.controller.resources | object | `{}` |  |
| ingress-nginx.controller.runAsUser | int | `2016` |  |
| ingress-nginx.controller.service.annotations."external-dns.alpha.kubernetes.io/cloudflare-proxied" | string | `"true"` |  |
| ingress-nginx.controller.service.annotations."external-dns.alpha.kubernetes.io/hostname" | string | `"settlemint.local, *.settlemint.local"` |  |
| ingress-nginx.controller.service.annotations."service.beta.kubernetes.io/aws-load-balancer-backend-protocol" | string | `"tcp"` |  |
| ingress-nginx.controller.service.annotations."service.beta.kubernetes.io/aws-load-balancer-nlb-target-type" | string | `"ip"` |  |
| ingress-nginx.controller.service.annotations."service.beta.kubernetes.io/aws-load-balancer-scheme" | string | `"internet-facing"` |  |
| ingress-nginx.controller.service.annotations."service.beta.kubernetes.io/aws-load-balancer-type" | string | `"external"` |  |
| ingress-nginx.controller.service.annotations."service.beta.kubernetes.io/azure-load-balancer-disable-tcp-reset" | string | `"true"` |  |
| ingress-nginx.controller.service.annotations."service.beta.kubernetes.io/azure-load-balancer-health-probe-request-path" | string | `"/healthz"` |  |
| ingress-nginx.controller.service.annotations."service.beta.kubernetes.io/azure-load-balancer-tcp-idle-timeout" | string | `"30"` |  |
| ingress-nginx.controller.service.externalTrafficPolicy | string | `"Local"` |  |
| ingress-nginx.controller.service.type | string | `"LoadBalancer"` |  |
| ingress-nginx.controller.updateStrategy.rollingUpdate.maxSurge | string | `"100%"` |  |
| ingress-nginx.controller.updateStrategy.rollingUpdate.maxUnavailable | string | `"0%"` |  |
| ingress-nginx.controller.updateStrategy.type | string | `"RollingUpdate"` |  |
| ingress-nginx.defaultBackend.enabled | bool | `false` |  |
| ingress-nginx.enabled | bool | `true` |  |
| ingress-nginx.fullnameOverride | string | `"ingress-nginx"` |  |
| ingress-nginx.global.image.registry | string | `"registry.k8s.io"` |  |
| ingress-nginx.imagePullSecrets[0] | string | `"image-pull-secret-docker"` |  |
| ingress-nginx.imagePullSecrets[1] | string | `"image-pull-secret-ghcr"` |  |
| ingress-nginx.imagePullSecrets[2] | string | `"image-pull-secret-harbor"` |  |
| minio.buckets[0].name | string | `"atk"` |  |
| minio.buckets[0].policy | string | `"none"` |  |
| minio.buckets[0].purge | bool | `false` |  |
| minio.consoleIngress.enabled | bool | `true` |  |
| minio.consoleIngress.hosts[0] | string | `"minio-console.k8s.orb.local"` |  |
| minio.consoleIngress.ingressClassName | string | `"atk-nginx"` |  |
| minio.consoleIngress.path | string | `"/"` |  |
| minio.enabled | bool | `true` |  |
| minio.fullnameOverride | string | `"minio"` |  |
| minio.global.imagePullSecrets[0] | string | `"image-pull-secret-docker"` |  |
| minio.global.imagePullSecrets[1] | string | `"image-pull-secret-ghcr"` |  |
| minio.global.imagePullSecrets[2] | string | `"image-pull-secret-harbor"` |  |
| minio.image.repository | string | `"docker.io/minio/minio"` |  |
| minio.image.tag | string | `"RELEASE.2025-07-18T21-56-31Z"` |  |
| minio.ingress.enabled | bool | `true` |  |
| minio.ingress.hosts[0] | string | `"minio.k8s.orb.local"` |  |
| minio.ingress.ingressClassName | string | `"atk-nginx"` |  |
| minio.ingress.path | string | `"/"` |  |
| minio.mode | string | `"standalone"` |  |
| minio.persistence.enabled | bool | `true` |  |
| minio.persistence.size | string | `"1Gi"` |  |
| minio.replicas | int | `1` |  |
| minio.resources.limits.cpu | string | `"200m"` |  |
| minio.resources.limits.memory | string | `"512Mi"` |  |
| minio.resources.requests.cpu | string | `"100m"` |  |
| minio.resources.requests.memory | string | `"256Mi"` |  |
| minio.rootPassword | string | `"atk-password"` |  |
| minio.rootUser | string | `"admin"` |  |
| minio.users[0].accessKey | string | `"atk-service"` |  |
| minio.users[0].policy | string | `"readwrite"` |  |
| minio.users[0].secretKey | string | `"atk-service-secret"` |  |
| postgresql.commonLabels."app.kubernetes.io/managed-by" | string | `"helm"` |  |
| postgresql.commonLabels."kots.io/app-slug" | string | `"settlemint-atk"` |  |
| postgresql.enabled | bool | `true` |  |
| postgresql.fullnameOverride | string | `"postgresql"` |  |
| postgresql.image.pullPolicy | string | `"IfNotPresent"` |  |
| postgresql.image.registry | string | `"docker.io"` |  |
| postgresql.image.repository | string | `"postgres"` |  |
| postgresql.image.tag | string | `"17.5-alpine"` |  |
| postgresql.imagePullSecrets[0].name | string | `"image-pull-secret-docker"` |  |
| postgresql.imagePullSecrets[1].name | string | `"image-pull-secret-ghcr"` |  |
| postgresql.imagePullSecrets[2].name | string | `"image-pull-secret-harbor"` |  |
| postgresql.initdb.scripts."create_databases.sql" | string | `"-- Create databases and users for all ATK services\nCREATE DATABASE blockscout;\nCREATE USER blockscout WITH PASSWORD 'atk' SUPERUSER;\nGRANT ALL PRIVILEGES ON DATABASE blockscout TO blockscout;\n\\c blockscout;\nGRANT ALL ON SCHEMA public TO blockscout;\n\n\\c postgres;\nCREATE DATABASE thegraph WITH ENCODING 'UTF8' LC_COLLATE='C' LC_CTYPE='C' TEMPLATE template0;\nCREATE USER thegraph WITH PASSWORD 'atk' SUPERUSER;\nGRANT ALL PRIVILEGES ON DATABASE thegraph TO thegraph;\n\\c thegraph;\nGRANT ALL ON SCHEMA public TO thegraph;\n\n\\c postgres;\nCREATE DATABASE hasura;\nCREATE USER hasura WITH PASSWORD 'atk' SUPERUSER;\nGRANT ALL PRIVILEGES ON DATABASE hasura TO hasura;\n\\c hasura;\nGRANT ALL ON SCHEMA public TO hasura;\n\n\\c postgres;\nCREATE DATABASE portal;\nCREATE USER portal WITH PASSWORD 'atk' SUPERUSER;\nGRANT ALL PRIVILEGES ON DATABASE portal TO portal;\n\\c portal;\nGRANT ALL ON SCHEMA public TO portal;\n\n\\c postgres;\nCREATE DATABASE txsigner;\nCREATE USER txsigner WITH PASSWORD 'atk' SUPERUSER;\nGRANT ALL PRIVILEGES ON DATABASE txsigner TO txsigner;\n\\c txsigner;\nGRANT ALL ON SCHEMA public TO txsigner;\n"` |  |
| postgresql.persistence.accessModes[0] | string | `"ReadWriteOnce"` |  |
| postgresql.persistence.enabled | bool | `true` |  |
| postgresql.persistence.size | string | `"8Gi"` |  |
| postgresql.persistence.storageClass | string | `""` |  |
| postgresql.postgresql.database | string | `"postgres"` |  |
| postgresql.postgresql.password | string | `"atk"` |  |
| postgresql.postgresql.username | string | `"postgres"` |  |
| postgresql.postgresql_conf.checkpoint_completion_target | float | `0.9` |  |
| postgresql.postgresql_conf.default_statistics_target | int | `100` |  |
| postgresql.postgresql_conf.effective_cache_size | string | `"1GB"` |  |
| postgresql.postgresql_conf.effective_io_concurrency | int | `200` |  |
| postgresql.postgresql_conf.maintenance_work_mem | string | `"64MB"` |  |
| postgresql.postgresql_conf.max_connections | int | `1000` |  |
| postgresql.postgresql_conf.max_wal_size | string | `"4GB"` |  |
| postgresql.postgresql_conf.min_wal_size | string | `"1GB"` |  |
| postgresql.postgresql_conf.random_page_cost | float | `1.1` |  |
| postgresql.postgresql_conf.shared_buffers | string | `"256MB"` |  |
| postgresql.postgresql_conf.wal_buffers | string | `"16MB"` |  |
| postgresql.postgresql_conf.work_mem | string | `"4MB"` |  |
| postgresql.resources.limits.cpu | string | `"500m"` |  |
| postgresql.resources.limits.memory | string | `"1Gi"` |  |
| postgresql.resources.requests.cpu | string | `"100m"` |  |
| postgresql.resources.requests.memory | string | `"256Mi"` |  |
| postgresql.service.port | int | `5432` |  |
| postgresql.service.targetPort | int | `5432` |  |
| postgresql.service.type | string | `"ClusterIP"` |  |
| reloader.enabled | bool | `true` |  |
| reloader.fullnameOverride | string | `"reloader"` |  |
| reloader.global.imagePullSecrets[0].name | string | `"image-pull-secret-docker"` |  |
| reloader.global.imagePullSecrets[1].name | string | `"image-pull-secret-ghcr"` |  |
| reloader.global.imagePullSecrets[2].name | string | `"image-pull-secret-harbor"` |  |
| reloader.image.name | string | `"stakater/reloader"` |  |
| reloader.image.repository | string | `"ghcr.io/stakater/reloader"` |  |
| reloader.reloader.autoReloadAll | bool | `true` |  |
| reloader.reloader.containerSecurityContext.allowPrivilegeEscalation | bool | `false` |  |
| reloader.reloader.containerSecurityContext.capabilities.drop[0] | string | `"ALL"` |  |
| reloader.reloader.containerSecurityContext.readOnlyRootFilesystem | bool | `true` |  |
| reloader.reloader.deployment.labels."kots.io/app-slug" | string | `"settlemint-atk"` |  |
| reloader.reloader.readOnlyRootFileSystem | bool | `true` |  |
| reloader.reloader.reloadOnCreate | bool | `false` |  |
| reloader.reloader.securityContext.allowPrivilegeEscalation | bool | `false` |  |
| reloader.reloader.securityContext.capabilities | object | `{"drop":["ALL"]}` | Specifies the security capabilities for the container. Here, all capabilities are dropped. |
| reloader.reloader.securityContext.readOnlyRootFilesystem | bool | `false` | If true, the root filesystem of the container is read-only. |
| reloader.reloader.securityContext.runAsNonRoot | bool | `true` | Ensures the container runs as a non-root user. |
| reloader.reloader.securityContext.runAsUser | int | `2016` | The user ID to run the container as. Change this for OpenShift or specific requirements. |
| reloader.reloader.syncAfterRestart | bool | `true` |  |
| reloader.reloader.watchGlobally | bool | `false` |  |

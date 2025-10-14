# support

![Version: 2.0.0-beta.4](https://img.shields.io/badge/Version-2.0.0--beta.4-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: 2.0.0-beta.4](https://img.shields.io/badge/AppVersion-2.0.0--beta.4-informational?style=flat-square)

A Helm chart for the supporting components

## Configuration

The following table lists the configurable parameters of this chart and their default values.

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
|global|object|-|Global configuration applied to all resources|
|global.labels|object|-|Common labels applied to all resources|
|global.labels."kots.io/app-slug"|string|`"settlemint-atk"`|KOTS application identifier for SettleMint ATK|
|ingress-nginx|object|-|Ingress NGINX configuration (object)|
|ingress-nginx.controller|object|-|Controller configuration (object)|
|ingress-nginx.controller.admissionWebhooks|object|-|Admission webhooks configuration (object)|
|ingress-nginx.controller.admissionWebhooks.enabled|bool|`false`|Enable admission webhooks (bool)|
|ingress-nginx.controller.affinity|object|-|Affinity configuration|
|ingress-nginx.controller.affinity.podAntiAffinity|object|-|Pod anti-affinity rules to distribute pods across nodes|
|ingress-nginx.controller.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution|list|-|Preferred anti-affinity rules (soft requirement)|
|ingress-nginx.controller.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution[0]|int|`{"podAffinityTerm":{"labelSelector":{"matchExpressions":[{"key":"app.kubernetes.io/component","operator":"In","values":["controller"]},{"key":"app.kubernetes.io/name","operator":"In","values":["ingress-nginx"]}]},"topologyKey":"kubernetes.io/hostname"},"weight":100}`|Weight for scheduling preference (higher = more preferred)|
|ingress-nginx.controller.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution[0].podAffinityTerm|object|-|Pod affinity term defining the anti-affinity rule|
|ingress-nginx.controller.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution[0].podAffinityTerm.labelSelector|object|-|Label selector for matching pods|
|ingress-nginx.controller.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution[0].podAffinityTerm.labelSelector.matchExpressions|list|-|Match expressions for label selection|
|ingress-nginx.controller.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution[0].podAffinityTerm.labelSelector.matchExpressions[0]|string|`{"key":"app.kubernetes.io/component","operator":"In","values":["controller"]}`|Label key to match|
|ingress-nginx.controller.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution[0].podAffinityTerm.labelSelector.matchExpressions[0].operator|string|`"In"`|Operator for label matching|
|ingress-nginx.controller.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution[0].podAffinityTerm.labelSelector.matchExpressions[0].values|list|-|Values to match for the label|
|ingress-nginx.controller.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution[0].podAffinityTerm.labelSelector.matchExpressions[1]|string|`{"key":"app.kubernetes.io/name","operator":"In","values":["ingress-nginx"]}`|Label key to match|
|ingress-nginx.controller.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution[0].podAffinityTerm.labelSelector.matchExpressions[1].operator|string|`"In"`|Operator for label matching|
|ingress-nginx.controller.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution[0].podAffinityTerm.labelSelector.matchExpressions[1].values|list|-|Values to match for the label|
|ingress-nginx.controller.affinity.podAntiAffinity.preferredDuringSchedulingIgnoredDuringExecution[0].podAffinityTerm.topologyKey|string|`"kubernetes.io/hostname"`|Topology key for spreading pods across nodes|
|ingress-nginx.controller.allowSnippetAnnotations|bool|`true`|Allow snippet annotations in Ingress objects|
|ingress-nginx.controller.autoscaling|object|-|Autoscaling configuration (object)|
|ingress-nginx.controller.autoscaling.behaviour|object|-|Autoscaling behavior configuration (object)|
|ingress-nginx.controller.autoscaling.behaviour.scaleDown|object|-|Scale down behavior|
|ingress-nginx.controller.autoscaling.behaviour.scaleDown.policies|list|-|Scale down policies|
|ingress-nginx.controller.autoscaling.behaviour.scaleDown.policies[0]|string|`{"periodSeconds":180,"type":"Pods","value":1}`|Policy type for scale down|
|ingress-nginx.controller.autoscaling.behaviour.scaleDown.policies[0].periodSeconds|int|`180`|Period in seconds for scale down evaluation|
|ingress-nginx.controller.autoscaling.behaviour.scaleDown.policies[0].value|int|`1`|Number of pods to scale down|
|ingress-nginx.controller.autoscaling.behaviour.scaleDown.stabilizationWindowSeconds|int|`300`|Stabilization window for scale down|
|ingress-nginx.controller.autoscaling.behaviour.scaleUp|object|-|Scale up behavior|
|ingress-nginx.controller.autoscaling.behaviour.scaleUp.policies|list|-|Scale up policies|
|ingress-nginx.controller.autoscaling.behaviour.scaleUp.policies[0]|string|`{"periodSeconds":60,"type":"Pods","value":2}`|Policy type for scale up|
|ingress-nginx.controller.autoscaling.behaviour.scaleUp.policies[0].periodSeconds|int|`60`|Period in seconds for scale up evaluation|
|ingress-nginx.controller.autoscaling.behaviour.scaleUp.policies[0].value|int|`2`|Number of pods to scale up|
|ingress-nginx.controller.autoscaling.behaviour.scaleUp.stabilizationWindowSeconds|int|`0`|Stabilization window for scale up|
|ingress-nginx.controller.autoscaling.enabled|bool|`false`|Enable autoscaling (bool)|
|ingress-nginx.controller.autoscaling.maxReplicas|int|`10`|Maximum number of replicas (int)|
|ingress-nginx.controller.autoscaling.minReplicas|int|`2`|Minimum number of replicas (int)|
|ingress-nginx.controller.autoscaling.targetCPUUtilizationPercentage|int|`80`|Target CPU utilization percentage|
|ingress-nginx.controller.autoscaling.targetMemoryUtilizationPercentage|int|`80`|Target memory utilization percentage|
|ingress-nginx.controller.config|object|-|NGINX configuration|
|ingress-nginx.controller.config.annotations-risk-level|string|`"Critical"`|Risk level for allowing snippet annotations (Critical/High/Medium/Low)|
|ingress-nginx.controller.config.client-body-buffer-size|string|`"128k"`|Size of buffer for reading client request body|
|ingress-nginx.controller.config.enable-access-log-for-default-backend|string|`"true"`|Enable access logging for default backend requests|
|ingress-nginx.controller.config.enable-brotli|string|`"true"`|Enable Brotli compression for responses|
|ingress-nginx.controller.config.enable-opentelemetry|string|`"true"`|Enable OpenTelemetry tracing integration|
|ingress-nginx.controller.config.enable-underscores-in-headers|string|`"true"`|Allow underscores in client request header names|
|ingress-nginx.controller.config.http-snippet|string|`"lua_need_request_body on;\n\nmap $status $request_body_filtered {\n    204     \"\";\n    default $request_body_binary_check;\n}\n\nmap $request_body $request_body_binary_check {\n    ~[^[:print:]]  \"[binary data]\";\n    default       $request_body;\n}\n\nserver {\n    listen 18080;\n\n    location /nginx_status {\n        allow all;\n        stub_status on;\n    }\n    location / {\n        return 404;\n    }\n}\n"`|Custom NGINX HTTP configuration snippet for Lua request body filtering and status endpoint|
|ingress-nginx.controller.config.http2-push-preload|string|`"true"`|Enable HTTP/2 server push preload|
|ingress-nginx.controller.config.ignore-invalid-headers|string|`"false"`|Whether to ignore invalid headers in client requests|
|ingress-nginx.controller.config.limit-req-status-code|string|`"429"`|HTTP status code to return when rate limit is exceeded|
|ingress-nginx.controller.config.log-format-escape-json|string|`"true"`|Escape special characters in JSON log format|
|ingress-nginx.controller.config.log-format-upstream|string|`"{\"proxyUpstreamName\": \"$proxy_upstream_name\", \"httpRequest\":{\"requestMethod\": \"$request_method\", \"requestUrl\": \"$host$request_uri\", \"status\": $status, \"requestBody\": \"${request_body_filtered}\"}, \"cloudflare\": {\"cfConnectingIp\": \"$http_cf_connecting_ip\", \"cfIpCountry\": \"$http_cf_ipcountry\", \"cfRay\": \"$http_cf_ray\", \"trueClientIp\": \"$http_true_client_ip\"}, \"meta\": {\"timestamp\": \"$time_iso8601\", \"latency\": \"$upstream_response_time s\", \"requestID\": \"$req_id\", \"requestSize\": \"$request_length\", \"responseSize\": \"$upstream_response_length\", \"userAgent\": \"$http_user_agent\", \"referer\": \"$http_referer\", \"protocol\":\"$server_protocol\", \"proxyAlternativeUpstreamName\": \"$proxy_alternative_upstream_name\", \"upstreamStatus\": \"$upstream_status\", \"upstreamAddr\": \"$upstream_addr\", \"cfVisitor\": \"$http_cf_visitor\", \"cfRequestId\": \"$http_cf_request_id\"}}"`|JSON format for upstream access logs with request/response metadata|
|ingress-nginx.controller.config.max-worker-connections|string|`"65536"`|Maximum number of simultaneous connections per worker process|
|ingress-nginx.controller.config.nginx-status-ipv4-whitelist|string|`"0.0.0.0"`|IPv4 CIDR whitelist for NGINX status endpoint (0.0.0.0 = all)|
|ingress-nginx.controller.config.opentelemetry-trust-incoming-span|string|`"true"`|Trust incoming trace context from client requests|
|ingress-nginx.controller.config.otel-max-export-batch-size|string|`"512"`|Maximum number of spans per OpenTelemetry batch export|
|ingress-nginx.controller.config.otel-max-queuesize|string|`"2048"`|Maximum queue size for OpenTelemetry span exports|
|ingress-nginx.controller.config.otel-sampler|string|`"AlwaysOn"`|OpenTelemetry sampling strategy (AlwaysOn/AlwaysOff/TraceIdRatioBased)|
|ingress-nginx.controller.config.otel-sampler-parent-based|string|`"false"`|Whether to respect parent span sampling decisions|
|ingress-nginx.controller.config.otel-sampler-ratio|string|`"1.0"`|Sampling ratio when using TraceIdRatioBased sampler (0.0-1.0)|
|ingress-nginx.controller.config.otel-schedule-delay-millis|string|`"5000"`|Delay in milliseconds between OpenTelemetry batch exports|
|ingress-nginx.controller.config.otlp-collector-host|string|`"o11y-alloy"`|OpenTelemetry collector hostname for trace exports|
|ingress-nginx.controller.config.otlp-collector-port|string|`"4317"`|OpenTelemetry collector port for trace exports|
|ingress-nginx.controller.config.proxy-body-size|string|`"500M"`|Maximum client request body size|
|ingress-nginx.controller.config.proxy-buffer-size|string|`"128k"`|Size of buffer used for reading response header from proxied server|
|ingress-nginx.controller.config.proxy-buffering|string|`"on"`|Enable or disable buffering of responses from proxied server|
|ingress-nginx.controller.config.proxy-buffers-number|string|`"4"`|Number of buffers used for reading response from proxied server|
|ingress-nginx.controller.config.proxy-busy-buffers-size|string|`"128k"`|Size limit for buffers that are busy sending a response to client|
|ingress-nginx.controller.config.proxy-max-temp-file-size|string|`"1024m"`|Maximum size of temporary file for buffering response from proxied server|
|ingress-nginx.controller.config.proxy-read-timeout|string|`"3600"`|Timeout for reading response from proxied server|
|ingress-nginx.controller.config.proxy-send-timeout|string|`"3600"`|Timeout for sending request to proxied server|
|ingress-nginx.controller.config.proxy_next_upstream|string|`"error timeout http_500 http_502 http_503 http_504"`|Conditions for trying next upstream server on error|
|ingress-nginx.controller.config.proxy_next_upstream_timeout|string|`"30"`|Timeout for trying next upstream server (seconds)|
|ingress-nginx.controller.config.proxy_next_upstream_tries|string|`"3"`|Maximum number of upstream servers to try|
|ingress-nginx.controller.config.ssl-ciphers|string|`"ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384:AES128-GCM-SHA256:AES128-GCM-SHA384"`|SSL/TLS cipher suites to use (strong ciphers only)|
|ingress-nginx.controller.config.ssl-redirect|string|`"false"`|Enable automatic redirect from HTTP to HTTPS|
|ingress-nginx.controller.config.tcp-fast-open|string|`"3000"`|Enables TCP Fast Open with specified queue size|
|ingress-nginx.controller.config.upstream-keepalive-connections|string|`"64"`|Number of idle keepalive connections to upstream servers|
|ingress-nginx.controller.config.upstream-keepalive-timeout|string|`"120"`|Timeout for idle keepalive connections to upstream servers|
|ingress-nginx.controller.config.use-forwarded-headers|string|`"false"`|Enable use of X-Forwarded-* headers|
|ingress-nginx.controller.config.use-http2|string|`"true"`|Enable HTTP/2 protocol support|
|ingress-nginx.controller.config.worker-processes|string|`"auto"`|Number of worker processes (auto = CPU cores)|
|ingress-nginx.controller.extraArgs|object|-|Extra arguments for the controller|
|ingress-nginx.controller.extraArgs.enable-ssl-passthrough|string|`"true"`|Enable SSL passthrough mode for TLS termination at backend|
|ingress-nginx.controller.image|object|-|Controller container image configuration|
|ingress-nginx.controller.image.digest|string|`""`|Image digest for immutable deployments|
|ingress-nginx.controller.image.digestChroot|string|`""`|Image digest for chroot variant|
|ingress-nginx.controller.image.image|string|`"harbor.settlemint.com/docker.io/ingress-nginx/controller"`|Ingress NGINX controller image name|
|ingress-nginx.controller.ingressClass|string|`"atk-nginx"`|Ingress class name|
|ingress-nginx.controller.ingressClassResource|object|-|Ingress class resource configuration|
|ingress-nginx.controller.ingressClassResource.controllerValue|string|`"k8s.io/atk-nginx"`|Controller value for IngressClass resource|
|ingress-nginx.controller.ingressClassResource.default|bool|`false`|Set this IngressClass as cluster default|
|ingress-nginx.controller.ingressClassResource.enabled|bool|`true`|Enable creation of IngressClass resource|
|ingress-nginx.controller.ingressClassResource.name|string|`"atk-nginx"`|If you run more than one platform versions on a single cluster, you need to make sure these are unique|
|ingress-nginx.controller.metrics|object|-|Metrics configuration|
|ingress-nginx.controller.metrics.enabled|bool|`true`|Enable Prometheus metrics endpoint|
|ingress-nginx.controller.metrics.service|object|-|Metrics service configuration|
|ingress-nginx.controller.metrics.service.annotations|object|-|Annotations for metrics service|
|ingress-nginx.controller.metrics.service.annotations."prometheus.io/port"|string|`"10254"`|Prometheus metrics port|
|ingress-nginx.controller.metrics.service.annotations."prometheus.io/scrape"|string|`"true"`|Enable Prometheus scraping for metrics|
|ingress-nginx.controller.metrics.service.labels|object|-|Labels for metrics service|
|ingress-nginx.controller.metrics.service.labels."kots.io/app-slug"|string|`"settlemint-atk"`|KOTS application identifier for SettleMint ATK|
|ingress-nginx.controller.opentelemetry|object|-|OpenTelemetry configuration|
|ingress-nginx.controller.opentelemetry.enabled|bool|`true`|Enable OpenTelemetry sidecar for distributed tracing|
|ingress-nginx.controller.opentelemetry.image|object|-|OpenTelemetry image configuration|
|ingress-nginx.controller.opentelemetry.image.registry|string|`"harbor.settlemint.com/registry.k8s.io"`|OpenTelemetry image registry|
|ingress-nginx.controller.patch|object|-|Patch configuration|
|ingress-nginx.controller.patch.image|object|-|Patch job image configuration|
|ingress-nginx.controller.patch.image.registry|string|`"harbor.settlemint.com/registry.k8s.io"`|Patch job image registry|
|ingress-nginx.controller.podAnnotations|object|-|Pod annotations|
|ingress-nginx.controller.podAnnotations."prometheus.io/port"|string|`"10254"`|Prometheus metrics port|
|ingress-nginx.controller.podAnnotations."prometheus.io/scrape"|string|`"true"`|Enable Prometheus scraping for metrics|
|ingress-nginx.controller.podLabels|object|-|Pod labels|
|ingress-nginx.controller.podLabels."kots.io/app-slug"|string|`"settlemint-atk"`|KOTS application identifier for SettleMint ATK|
|ingress-nginx.controller.replicaCount|int|`1`|Number of controller replicas (int)|
|ingress-nginx.controller.resources|object|-|Resource configuration|
|ingress-nginx.controller.runAsUser|int|`2016`|User ID to run the controller process|
|ingress-nginx.controller.service|object|-|Service configuration|
|ingress-nginx.controller.service.annotations|object|-|Service annotations|
|ingress-nginx.controller.service.annotations."external-dns.alpha.kubernetes.io/cloudflare-proxied"|string|`"true"`|Enable Cloudflare proxy for external-dns managed records|
|ingress-nginx.controller.service.annotations."external-dns.alpha.kubernetes.io/hostname"|string|`"settlemint.local, *.settlemint.local"`|DNS hostnames for external-dns to manage|
|ingress-nginx.controller.service.annotations."service.beta.kubernetes.io/aws-load-balancer-backend-protocol"|string|`"tcp"`|AWS load balancer backend protocol|
|ingress-nginx.controller.service.annotations."service.beta.kubernetes.io/aws-load-balancer-nlb-target-type"|string|`"ip"`|AWS NLB target type (ip/instance)|
|ingress-nginx.controller.service.annotations."service.beta.kubernetes.io/aws-load-balancer-scheme"|string|`"internet-facing"`|AWS load balancer scheme (internet-facing/internal)|
|ingress-nginx.controller.service.annotations."service.beta.kubernetes.io/aws-load-balancer-type"|string|`"external"`|AWS load balancer type (external/internal)|
|ingress-nginx.controller.service.annotations."service.beta.kubernetes.io/azure-load-balancer-disable-tcp-reset"|string|`"true"`|Disable TCP reset on Azure load balancer|
|ingress-nginx.controller.service.annotations."service.beta.kubernetes.io/azure-load-balancer-health-probe-request-path"|string|`"/healthz"`|Azure load balancer health probe request path|
|ingress-nginx.controller.service.annotations."service.beta.kubernetes.io/azure-load-balancer-tcp-idle-timeout"|string|`"30"`|Azure load balancer TCP idle timeout in minutes|
|ingress-nginx.controller.service.externalTrafficPolicy|string|`"Local"`|External traffic policy for preserving client source IP (Local/Cluster)|
|ingress-nginx.controller.service.type|string|`"LoadBalancer"`|Kubernetes service type (LoadBalancer/ClusterIP/NodePort)|
|ingress-nginx.controller.updateStrategy|object|-|Update strategy configuration|
|ingress-nginx.controller.updateStrategy.rollingUpdate|object|-|Rolling update configuration|
|ingress-nginx.controller.updateStrategy.rollingUpdate.maxSurge|string|`"100%"`|Maximum number of pods that can be created above desired count|
|ingress-nginx.controller.updateStrategy.rollingUpdate.maxUnavailable|string|`"0%"`|Maximum number of pods that can be unavailable during update|
|ingress-nginx.controller.updateStrategy.type|string|`"RollingUpdate"`|Update strategy type|
|ingress-nginx.defaultBackend|object|-|Default backend configuration (object)|
|ingress-nginx.defaultBackend.enabled|bool|`false`|Enable default backend (bool)|
|ingress-nginx.enabled|bool|`true`|Enable Ingress NGINX deployment (bool)|
|ingress-nginx.fullnameOverride|string|`"ingress-nginx"`|String to fully override common.names.fullname (string)|
|ingress-nginx.global|object|-|Global configuration|
|ingress-nginx.global.image|object|-|Global image configuration|
|ingress-nginx.global.image.registry|string|`"harbor.settlemint.com/registry.k8s.io"`|Global image registry|
|ingress-nginx.imagePullSecrets|list|-|Global Docker registry secret names as an array (list)|
|minio|object|-|MinIO configuration (object)|
|minio.buckets|list|-|Automatic bucket creation|
|minio.buckets[0]|string|`{"name":"atk","policy":"none","purge":false}`|Bucket name|
|minio.buckets[0].policy|string|`"none"`|Bucket access policy (none/download/upload/public)|
|minio.buckets[0].purge|bool|`false`|Whether to purge bucket contents on deletion|
|minio.consoleIngress|object|-|Console ingress configuration (object)|
|minio.consoleIngress.enabled|bool|`true`|Enable ingress for MinIO console|
|minio.consoleIngress.hosts|list|-|Hosts for MinIO console ingress|
|minio.consoleIngress.ingressClassName|string|`"atk-nginx"`|IngressClass for MinIO console|
|minio.consoleIngress.path|string|`"/"`|Path for MinIO console ingress|
|minio.enabled|bool|`true`|Enable MinIO deployment (bool)|
|minio.fullnameOverride|string|`"minio"`|String to fully override common.names.fullname (string)|
|minio.image|object|-|MinIO image configuration|
|minio.image.repository|string|`"harbor.settlemint.com/docker.io/minio/minio"`|MinIO image repository|
|minio.image.tag|string|`"RELEASE.2025-09-07T16-13-09Z"`|MinIO image tag (immutable tags are recommended)|
|minio.ingress|object|-|Ingress configuration for MinIO API (object)|
|minio.ingress.enabled|bool|`true`|Enable ingress for MinIO API|
|minio.ingress.hosts|list|-|Hosts for MinIO API ingress|
|minio.ingress.ingressClassName|string|`"atk-nginx"`|IngressClass for MinIO API|
|minio.ingress.path|string|`"/"`|Path for MinIO API ingress|
|minio.mode|string|`"standalone"`|MinIO deployment mode (string)|
|minio.persistence|object|-|Persistence configuration (object)|
|minio.persistence.enabled|bool|`true`|Enable persistent volume for MinIO (bool)|
|minio.persistence.size|string|`"1Gi"`|Size of the persistent volume (string)|
|minio.replicas|int|`1`|Number of MinIO replicas (int)|
|minio.resources|object|-|MinIO resource requests and limits (object)|
|minio.resources.limits|object|-|Resource limits (object)|
|minio.resources.limits.cpu|string|`"600m"`|CPU limit (string)|
|minio.resources.limits.memory|string|`"512Mi"`|Memory limit (string)|
|minio.resources.requests|object|-|Resource requests (object)|
|minio.resources.requests.cpu|string|`"100m"`|CPU request (string)|
|minio.resources.requests.memory|string|`"256Mi"`|Memory request (string)|
|minio.rootPassword|string|`"atk-password"`|MinIO root user password (string)|
|minio.rootUser|string|`"admin"`|MinIO root user credentials (string)|
|minio.users|list|-|Automatic user/service account creation|
|minio.users[0]|string|`{"accessKey":"atk-service","policy":"readwrite","secretKey":"atk-service-secret"}`|MinIO access key for user authentication|
|minio.users[0].policy|string|`"readwrite"`|User access policy (readonly/writeonly/readwrite/consoleAdmin)|
|minio.users[0].secretKey|string|`"atk-service-secret"`|MinIO secret key for user authentication|
|postgresql|object|-|PostgreSQL configuration (object)|
|postgresql.commonLabels|object|-|Common labels to add to all PostgreSQL resources|
|postgresql.commonLabels."app.kubernetes.io/managed-by"|string|`"helm"`|Identifies Helm as the manager of this resource|
|postgresql.commonLabels."kots.io/app-slug"|string|`"settlemint-atk"`|KOTS application identifier for SettleMint ATK|
|postgresql.enabled|bool|`true`|Enable PostgreSQL deployment (bool)|
|postgresql.fullnameOverride|string|`"postgresql"`|String to fully override common.names.fullname (string)|
|postgresql.image|object|-|PostgreSQL image configuration|
|postgresql.image.pullPolicy|string|`"IfNotPresent"`|PostgreSQL image pull policy|
|postgresql.image.registry|string|`"harbor.settlemint.com/docker.io"`|PostgreSQL image registry|
|postgresql.image.repository|string|`"postgres"`|PostgreSQL image repository|
|postgresql.image.tag|string|`"18.0-alpine"`|PostgreSQL image tag (immutable tags are recommended)|
|postgresql.imagePullSecrets|list|-|Global Docker registry secret names as an array (list)|
|postgresql.initdb|object|-|Database initialization scripts|
|postgresql.initdb.scripts|object|-|Database initialization scripts|
|postgresql.initdb.scripts."create_databases.sql"|string|`"-- Create databases and users for all ATK services\nCREATE DATABASE blockscout;\nCREATE USER blockscout WITH PASSWORD 'atk' SUPERUSER;\nGRANT ALL PRIVILEGES ON DATABASE blockscout TO blockscout;\n\\c blockscout;\nGRANT ALL ON SCHEMA public TO blockscout;\n\n\\c postgres;\nCREATE DATABASE thegraph WITH ENCODING 'UTF8' LC_COLLATE='C' LC_CTYPE='C' TEMPLATE template0;\nCREATE USER thegraph WITH PASSWORD 'atk' SUPERUSER;\nGRANT ALL PRIVILEGES ON DATABASE thegraph TO thegraph;\n\\c thegraph;\nGRANT ALL ON SCHEMA public TO thegraph;\n\n\\c postgres;\nCREATE DATABASE hasura;\nCREATE USER hasura WITH PASSWORD 'atk' SUPERUSER;\nGRANT ALL PRIVILEGES ON DATABASE hasura TO hasura;\n\\c hasura;\nGRANT ALL ON SCHEMA public TO hasura;\n\n\\c postgres;\nCREATE DATABASE portal;\nCREATE USER portal WITH PASSWORD 'atk' SUPERUSER;\nGRANT ALL PRIVILEGES ON DATABASE portal TO portal;\n\\c portal;\nGRANT ALL ON SCHEMA public TO portal;\n\n\\c postgres;\nCREATE DATABASE txsigner;\nCREATE USER txsigner WITH PASSWORD 'atk' SUPERUSER;\nGRANT ALL PRIVILEGES ON DATABASE txsigner TO txsigner;\n\\c txsigner;\nGRANT ALL ON SCHEMA public TO txsigner;\n"`|SQL script to create databases and users for all ATK services|
|postgresql.persistence|object|-|Persistence configuration (object)|
|postgresql.persistence.accessModes|list|-|Access modes for persistent volume|
|postgresql.persistence.enabled|bool|`true`|Enable persistent volume for PostgreSQL (bool)|
|postgresql.persistence.size|string|`"8Gi"`|Size of the persistent volume (string)|
|postgresql.persistence.storageClass|string|`""`|Storage class for persistent volume (uses default if empty)|
|postgresql.postgresql|object|-|PostgreSQL authentication configuration (object)|
|postgresql.postgresql.database|string|`"postgres"`|PostgreSQL database name (string)|
|postgresql.postgresql.password|string|`"atk"`|PostgreSQL password (string)|
|postgresql.postgresql.username|string|`"postgres"`|PostgreSQL username (string)|
|postgresql.postgresql_conf|object|-|PostgreSQL configuration tuned for development (object)|
|postgresql.postgresql_conf.checkpoint_completion_target|float|`0.9`|Target for completion of checkpoint processing|
|postgresql.postgresql_conf.default_statistics_target|int|`100`|Default statistics target for table columns|
|postgresql.postgresql_conf.effective_cache_size|string|`"1GB"`|Planner's assumption about the effective size of the disk cache|
|postgresql.postgresql_conf.effective_io_concurrency|int|`200`|Number of concurrent disk I/O operations|
|postgresql.postgresql_conf.maintenance_work_mem|string|`"64MB"`|Specifies the maximum amount of memory for maintenance operations|
|postgresql.postgresql_conf.max_connections|int|`1000`|Maximum number of concurrent connections|
|postgresql.postgresql_conf.max_wal_size|string|`"4GB"`|Maximum size to which the WAL will grow during automatic checkpoints|
|postgresql.postgresql_conf.min_wal_size|string|`"1GB"`|Minimum size to which the WAL will shrink|
|postgresql.postgresql_conf.random_page_cost|float|`1.1`|Planner's assumption about the cost of a non-sequentially-fetched disk page|
|postgresql.postgresql_conf.shared_buffers|string|`"256MB"`|Amount of memory dedicated to PostgreSQL to use for caching data|
|postgresql.postgresql_conf.wal_buffers|string|`"16MB"`|Amount of memory used in shared memory for WAL data|
|postgresql.postgresql_conf.work_mem|string|`"4MB"`|Amount of memory to be used by internal sort operations and hash tables|
|postgresql.resources|object|-|Resource configuration for development (object)|
|postgresql.resources.limits|object|-|Resource limits (object)|
|postgresql.resources.limits.cpu|string|`"480m"`|CPU limit (string)|
|postgresql.resources.limits.memory|string|`"512Mi"`|Memory limit (string)|
|postgresql.resources.requests|object|-|Resource requests (object)|
|postgresql.resources.requests.cpu|string|`"80m"`|CPU request (string)|
|postgresql.resources.requests.memory|string|`"256Mi"`|Memory request (string)|
|postgresql.service|object|-|Service configuration|
|postgresql.service.port|int|`5432`|PostgreSQL service port|
|postgresql.service.targetPort|int|`5432`|PostgreSQL service target port|
|postgresql.service.type|string|`"ClusterIP"`|PostgreSQL service type|
|reloader|object|-|Reloader configuration (object)|
|reloader.enabled|bool|`true`|Enable Reloader deployment (bool)|
|reloader.fullnameOverride|string|`"reloader"`|String to fully override common.names.fullname (string)|
|reloader.global|object|-|Global configuration (object)|
|reloader.global.imagePullSecrets|list|-|Global Docker registry secret names as an array (list)|
|reloader.image|object|-|Reloader image configuration|
|reloader.image.name|string|`"stakater/reloader"`|Reloader image name|
|reloader.image.repository|string|`"harbor.settlemint.com/ghcr.io/stakater/reloader"`|Reloader image repository|
|reloader.reloader|object|-|Reloader specific configuration (object)|
|reloader.reloader.autoReloadAll|bool|`true`|Enable auto reload for all resources (bool)|
|reloader.reloader.containerSecurityContext|object|-|Container security context configuration|
|reloader.reloader.containerSecurityContext.allowPrivilegeEscalation|bool|`false`|Whether a process can gain more privileges than its parent|
|reloader.reloader.containerSecurityContext.capabilities|object|-|Linux capabilities configuration for container|
|reloader.reloader.containerSecurityContext.capabilities.drop|list|-|Linux capabilities to drop from the container|
|reloader.reloader.containerSecurityContext.readOnlyRootFilesystem|bool|`true`|Mount the container's root filesystem as read-only|
|reloader.reloader.deployment|object|-|Deployment configuration|
|reloader.reloader.deployment.labels|object|-|Labels for Reloader deployment|
|reloader.reloader.deployment.labels."kots.io/app-slug"|string|`"settlemint-atk"`|KOTS application identifier for SettleMint ATK|
|reloader.reloader.deployment.resources|object|-|Resource requests and limits for Reloader pods|
|reloader.reloader.deployment.resources.limits.cpu|string|`"600m"`|CPU limit for Reloader pods|
|reloader.reloader.deployment.resources.limits.memory|string|`"256Mi"`|Memory limit for Reloader pods|
|reloader.reloader.deployment.resources.requests.cpu|string|`"100m"`|CPU request reserved for Reloader pods|
|reloader.reloader.deployment.resources.requests.memory|string|`"128Mi"`|Memory request reserved for Reloader pods|
|reloader.reloader.readOnlyRootFileSystem|bool|`true`|Enable read-only root filesystem|
|reloader.reloader.reloadOnCreate|bool|`false`|Reload on resource creation|
|reloader.reloader.securityContext|object|-|Security context configuration|
|reloader.reloader.securityContext.allowPrivilegeEscalation|bool|`false`|Whether a process can gain more privileges than its parent|
|reloader.reloader.securityContext.capabilities|object|-|Specifies the security capabilities for the container. Here, all capabilities are dropped.|
|reloader.reloader.securityContext.capabilities.drop|list|-|Linux capabilities to drop from the container|
|reloader.reloader.securityContext.readOnlyRootFilesystem|bool|`false`|If true, the root filesystem of the container is read-only.|
|reloader.reloader.securityContext.runAsNonRoot|bool|`true`|Ensures the container runs as a non-root user.|
|reloader.reloader.securityContext.runAsUser|int|`2016`|The user ID to run the container as. Change this for OpenShift or specific requirements.|
|reloader.reloader.syncAfterRestart|bool|`true`|Sync after restart|
|reloader.reloader.watchGlobally|bool|`false`|Watch resources globally across namespaces|

## Resource Summary

| Component | Replicas | Request CPU | Limit CPU | Request Memory | Limit Memory | Storage |
|-----------|----------|-------------|-----------|----------------|--------------|---------|
| minio | 1 | 100m | 600m | 256Mi | 512Mi | 1Gi |
| postgresql | 1 | 80m | 480m | 256Mi | 512Mi | 8Gi |
| reloader.reloader.deployment | 1 | 100m | 600m | 128Mi | 256Mi | - |
| **Totals** | - | 0.28 cores (280m) | 1.68 cores (1680m) | 640Mi (0.62Gi) | 1280Mi (1.25Gi) | 9216Mi (9.00Gi) |

## Maintainers

| Name | Email | Url |
| ---- | ------ | --- |
| SettleMint | <support@settlemint.com> | <https://settlemint.com> |

## Requirements

| Repository | Name | Version |
|------------|------|---------|
|  | minio | 2.0.0-beta.4 |
|  | postgresql | 2.0.0-beta.4 |
|  | redis | 2.0.0-beta.4 |
| https://kubernetes.github.io/ingress-nginx | ingress-nginx | 4.13.3 |
| https://stakater.github.io/stakater-charts | reloader | 2.2.3 |

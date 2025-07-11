# support

![Version: 0.1.0](https://img.shields.io/badge/Version-0.1.0-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: 0.1.0](https://img.shields.io/badge/AppVersion-0.1.0-informational?style=flat-square)

A Helm chart for the supporting components

## Maintainers

| Name | Email | Url |
| ---- | ------ | --- |
| SettleMint | <support@settlemint.com> | <https://settlemint.com> |

## Requirements

| Repository | Name | Version |
|------------|------|---------|
| https://kubernetes.github.io/ingress-nginx | ingress-nginx | 4.13.0 |
| https://stakater.github.io/stakater-charts | reloader | 2.1.5 |
| oci://registry-1.docker.io/bitnamicharts | minio | 17.0.11 |
| oci://registry-1.docker.io/bitnamicharts | postgresql-ha | 16.0.19 |
| oci://registry-1.docker.io/bitnamicharts | redis | 21.2.9 |

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
| minio.auth.rootPassword | string | `"atk-password"` |  |
| minio.auth.rootUser | string | `"admin"` |  |
| minio.console.image.registry | string | `"docker.io"` |  |
| minio.defaultInitContainers.image.registry | string | `"docker.io"` |  |
| minio.enabled | bool | `true` |  |
| minio.fullnameOverride | string | `"minio"` |  |
| minio.global.imagePullSecrets[0] | string | `"image-pull-secret-docker"` |  |
| minio.global.imagePullSecrets[1] | string | `"image-pull-secret-ghcr"` |  |
| minio.global.imagePullSecrets[2] | string | `"image-pull-secret-harbor"` |  |
| minio.global.security.allowInsecureImages | bool | `true` |  |
| minio.image.registry | string | `"docker.io"` |  |
| minio.provisioning.config[0].name | string | `"region"` |  |
| minio.provisioning.config[0].options.name | string | `"eu-central-1"` |  |
| minio.provisioning.enabled | bool | `true` |  |
| minio.provisioning.extraCommands | string | `"if ! mc admin user svcacct info provisioning atk-service >/dev/null 2>&1; then\n  echo \"Adding atk-service user\"\n  mc admin user svcacct add provisioning \"admin\" --access-key \"atk-service\" --secret-key \"atk-service-secret\"\nfi"` |  |
| minio.statefulset.replicaCount | int | `1` |  |
| postgresql-ha.commonLabels."app.kubernetes.io/managed-by" | string | `"helm"` |  |
| postgresql-ha.commonLabels."kots.io/app-slug" | string | `"settlemint-atk"` |  |
| postgresql-ha.enabled | bool | `true` |  |
| postgresql-ha.fullnameOverride | string | `"postgresql"` |  |
| postgresql-ha.global.imagePullSecrets[0] | string | `"image-pull-secret-docker"` |  |
| postgresql-ha.global.imagePullSecrets[1] | string | `"image-pull-secret-ghcr"` |  |
| postgresql-ha.global.imagePullSecrets[2] | string | `"image-pull-secret-harbor"` |  |
| postgresql-ha.global.security.allowInsecureImages | bool | `true` |  |
| postgresql-ha.pgpool.adminPassword | string | `"atk"` |  |
| postgresql-ha.pgpool.adminUsername | string | `"pgpool"` |  |
| postgresql-ha.pgpool.customUsers.passwords | string | `"atk,atk,atk,atk,atk"` |  |
| postgresql-ha.pgpool.customUsers.usernames | string | `"blockscout,hasura,thegraph,portal,txsigner"` |  |
| postgresql-ha.pgpool.image.registry | string | `"docker.io"` |  |
| postgresql-ha.pgpool.logConnections | bool | `true` |  |
| postgresql-ha.pgpool.maxPool | int | `500` |  |
| postgresql-ha.pgpool.numInitChildren | int | `500` |  |
| postgresql-ha.pgpool.pullSecrets | list | `[]` |  |
| postgresql-ha.pgpool.replicaCount | int | `1` |  |
| postgresql-ha.pgpool.resourcesPreset | string | `"none"` |  |
| postgresql-ha.postgresql.dbUserConnectionLimit | int | `1000` |  |
| postgresql-ha.postgresql.image.registry | string | `"docker.io"` |  |
| postgresql-ha.postgresql.initdbScripts."create_db.sql" | string | `"CREATE DATABASE blockscout;\nCREATE USER blockscout WITH PASSWORD 'atk' SUPERUSER;\nGRANT ALL PRIVILEGES ON DATABASE blockscout TO blockscout;\n\\c blockscout;\nGRANT ALL ON SCHEMA public TO blockscout;\nCREATE DATABASE thegraph WITH ENCODING 'UTF8' LC_COLLATE='C' LC_CTYPE='C' TEMPLATE template0;\nCREATE USER thegraph WITH PASSWORD 'atk' SUPERUSER;\nGRANT ALL PRIVILEGES ON DATABASE thegraph TO thegraph;\n\\c thegraph;\nGRANT ALL ON SCHEMA public TO thegraph;\nCREATE DATABASE hasura;\nCREATE USER hasura WITH PASSWORD 'atk' SUPERUSER;\nGRANT ALL PRIVILEGES ON DATABASE hasura TO hasura;\n\\c hasura;\nGRANT ALL ON SCHEMA public TO hasura;\nCREATE DATABASE portal;\nCREATE USER portal WITH PASSWORD 'atk' SUPERUSER;\nGRANT ALL PRIVILEGES ON DATABASE portal TO portal;\n\\c portal;\nGRANT ALL ON SCHEMA public TO portal;\nCREATE DATABASE txsigner;\nCREATE USER txsigner WITH PASSWORD 'atk' SUPERUSER;\nGRANT ALL PRIVILEGES ON DATABASE txsigner TO txsigner;\n\\c txsigner;\nGRANT ALL ON SCHEMA public TO txsigner;\n"` |  |
| postgresql-ha.postgresql.maxConnections | int | `1000` |  |
| postgresql-ha.postgresql.password | string | `"atk"` |  |
| postgresql-ha.postgresql.postgresConnectionLimit | int | `1000` |  |
| postgresql-ha.postgresql.pullSecrets | list | `[]` |  |
| postgresql-ha.postgresql.repmgrPassword | string | `"atk"` |  |
| postgresql-ha.postgresql.repmgrUsername | string | `"repmgr"` |  |
| postgresql-ha.postgresql.resourcesPreset | string | `"none"` |  |
| postgresql-ha.postgresql.username | string | `"postgres"` |  |
| postgresql-ha.service.annotations."service.beta.kubernetes.io/aws-load-balancer-backend-protocol" | string | `"tcp"` |  |
| postgresql-ha.service.annotations."service.beta.kubernetes.io/aws-load-balancer-nlb-target-type" | string | `"ip"` |  |
| postgresql-ha.service.annotations."service.beta.kubernetes.io/aws-load-balancer-scheme" | string | `"internet-facing"` |  |
| postgresql-ha.service.annotations."service.beta.kubernetes.io/aws-load-balancer-type" | string | `"nlb"` |  |
| postgresql-ha.service.annotations."service.beta.kubernetes.io/azure-load-balancer-disable-tcp-reset" | string | `"true"` |  |
| postgresql-ha.service.annotations."service.beta.kubernetes.io/azure-load-balancer-tcp-idle-timeout" | string | `"30"` |  |
| postgresql-ha.service.externalTrafficPolicy | string | `"Local"` |  |
| postgresql-ha.service.type | string | `"LoadBalancer"` |  |
| redis.auth.password | string | `"atk"` |  |
| redis.commonLabels."app.kubernetes.io/managed-by" | string | `"helm"` |  |
| redis.commonLabels."kots.io/app-slug" | string | `"settlemint-atk"` |  |
| redis.enabled | bool | `true` |  |
| redis.fullnameOverride | string | `"redis"` |  |
| redis.global.imagePullSecrets[0] | string | `"image-pull-secret-docker"` |  |
| redis.global.imagePullSecrets[1] | string | `"image-pull-secret-ghcr"` |  |
| redis.global.imagePullSecrets[2] | string | `"image-pull-secret-harbor"` |  |
| redis.global.security.allowInsecureImages | bool | `true` |  |
| redis.image.registry | string | `"docker.io"` |  |
| redis.master.resourcesPreset | string | `"none"` |  |
| redis.replica.replicaCount | int | `1` |  |
| redis.replica.resourcesPreset | string | `"none"` |  |
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

# observability

![Version: 0.1.0](https://img.shields.io/badge/Version-0.1.0-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: 0.1.0](https://img.shields.io/badge/AppVersion-0.1.0-informational?style=flat-square)

A Helm chart for the observability components

## Maintainers

| Name | Email | Url |
| ---- | ------ | --- |
| SettleMint | <support@settlemint.com> | <https://settlemint.com> |

## Requirements

| Repository | Name | Version |
|------------|------|---------|
| https://grafana.github.io/helm-charts | alloy | 1.2.1 |
| https://grafana.github.io/helm-charts | grafana | 9.3.4 |
| https://grafana.github.io/helm-charts | loki | 6.37.0 |
| https://grafana.github.io/helm-charts | tempo | 1.23.3 |
| https://kubernetes-sigs.github.io/metrics-server/ | metrics-server | 3.13.0 |
| https://prometheus-community.github.io/helm-charts | kube-state-metrics | 6.1.4 |
| https://prometheus-community.github.io/helm-charts | prometheus-node-exporter | 4.47.3 |
| https://victoriametrics.github.io/helm-charts/ | victoria-metrics-single | 0.24.3 |

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| alloy.alloy.configMap.content | string | `"logging {\n  level  = \"info\"\n  format = \"logfmt\"\n}\n\ndiscovery.kubernetes \"kubernetes_nodes\" {\n  role = \"node\"\n}\n\ndiscovery.relabel \"kubernetes_nodes_cadvisor\" {\n  targets = discovery.kubernetes.kubernetes_nodes.targets\n\n  rule {\n    target_label = \"__address__\"\n    replacement  = \"kubernetes.default.svc:443\"\n  }\n\n  rule {\n    source_labels = [\"__meta_kubernetes_node_name\"]\n    regex         = \"(.+)\"\n    target_label  = \"__metrics_path__\"\n    replacement   = \"/api/v1/nodes/$1/proxy/metrics/cadvisor\"\n  }\n\n  rule {\n    regex       = \"__meta_kubernetes_pod_label_uid\"\n    action      = \"labeldrop\"\n  }\n\n  rule {\n    regex       = \"__meta_kubernetes_pod_label_id\"\n    action      = \"labeldrop\"\n  }\n\n  rule {\n    regex       = \"__meta_kubernetes_pod_label_name\"\n    action      = \"labeldrop\"\n  }\n}\n\ndiscovery.relabel \"kubernetes_nodes\" {\n  targets = discovery.kubernetes.kubernetes_nodes.targets\n\n  rule {\n    target_label = \"__address__\"\n    replacement  = \"kubernetes.default.svc:443\"\n  }\n\n  rule {\n    source_labels = [\"__meta_kubernetes_node_name\"]\n    regex         = \"(.+)\"\n    target_label  = \"__metrics_path__\"\n    replacement   = \"/api/v1/nodes/$1/proxy/metrics\"\n  }\n\n  rule {\n    regex       = \"__meta_kubernetes_pod_label_uid\"\n    action      = \"labeldrop\"\n  }\n\n  rule {\n    regex       = \"__meta_kubernetes_pod_label_id\"\n    action      = \"labeldrop\"\n  }\n\n  rule {\n    regex       = \"__meta_kubernetes_pod_label_name\"\n    action      = \"labeldrop\"\n  }\n\n  rule {\n    replacement  = \"{{ .Values.clustername | default \"settlemint\" }}\"\n    target_label = \"cluster_name\"\n  }\n}\n\n\nprometheus.scrape \"kubernetes_nodes_cadvisor\" {\n  targets         = discovery.relabel.kubernetes_nodes_cadvisor.output\n  forward_to      = [{{if .Values.endpoints.internal.prometheus.enabled }}prometheus.remote_write.btp_metrics.receiver{{ end }}{{if .Values.endpoints.external.prometheus.enabled }}{{if .Values.endpoints.internal.prometheus.enabled }},{{ end }}prometheus.remote_write.btp_metrics_external.receiver{{ end }}]\n  job_name        = \"kubernetes-nodes-cadvisor\"\n  scrape_interval = \"15s\"\n  scheme          = \"https\"\n\n  authorization {\n    type             = \"Bearer\"\n    credentials_file = \"/var/run/secrets/kubernetes.io/serviceaccount/token\"\n  }\n\n  tls_config {\n    ca_file              = \"/var/run/secrets/kubernetes.io/serviceaccount/ca.crt\"\n    insecure_skip_verify = true\n  }\n}\n\nprometheus.scrape \"kubernetes_nodes\" {\n  targets         = discovery.relabel.kubernetes_nodes.output\n  forward_to      = [{{if .Values.endpoints.internal.prometheus.enabled }}prometheus.remote_write.btp_metrics.receiver{{ end }}{{if .Values.endpoints.external.prometheus.enabled }}{{if .Values.endpoints.internal.prometheus.enabled }},{{ end }}prometheus.remote_write.btp_metrics_external.receiver{{ end }}]\n  job_name        = \"kubernetes-nodes\"\n  scrape_interval = \"15s\"\n  scheme          = \"https\"\n\n  authorization {\n    type             = \"Bearer\"\n    credentials_file = \"/var/run/secrets/kubernetes.io/serviceaccount/token\"\n  }\n\n  tls_config {\n    ca_file              = \"/var/run/secrets/kubernetes.io/serviceaccount/ca.crt\"\n    insecure_skip_verify = true\n  }\n}\n\n{{- if .Values.endpoints.internal.prometheus.enabled }}\nprometheus.remote_write \"btp_metrics\" {\n    endpoint {\n        url = {{ .Values.endpoints.internal.prometheus.url | quote }}\n    }\n}\n{{- end }}\n\n{{- if .Values.endpoints.external.prometheus.enabled }}\nprometheus.remote_write \"btp_metrics_external\" {\n    endpoint {\n        url = {{ .Values.endpoints.external.prometheus.url | quote }}\n\n        {{- if and .Values.endpoints.external.prometheus.basicAuth.username .Values.endpoints.external.prometheus.basicAuth.password }}\n        basic_auth {\n          username = {{ .Values.endpoints.external.prometheus.basicAuth.username | quote }}\n          password = {{ .Values.endpoints.external.prometheus.basicAuth.password | quote }}\n        }\n        {{- end }}\n    }\n}\n{{- end }}\n\ndiscovery.kubernetes \"kubernetes_pods\" {\n  role = \"pod\"\n\n\n  selectors {\n    role  = \"pod\"\n    label = \"app.kubernetes.io/instance={{ .Release.Name }}\"\n  }\n\n}\n\ndiscovery.relabel \"kubernetes_pods\" {\n  targets = discovery.kubernetes.kubernetes_pods.targets\n\n  rule {\n    source_labels = [\"__meta_kubernetes_pod_annotation_prometheus_io_scheme\"]\n    regex         = \"(https?)\"\n    target_label  = \"__scheme__\"\n  }\n\n  rule {\n    source_labels = [\"__meta_kubernetes_pod_annotation_prometheus_io_path\"]\n    regex         = \"(.+)\"\n    target_label  = \"__metrics_path__\"\n  }\n\n  rule {\n    source_labels = [\"__address__\", \"__meta_kubernetes_pod_annotation_prometheus_io_port\"]\n    regex         = \"(.+?)(?::\\\\d+)?;(\\\\d+)\"\n    target_label  = \"__address__\"\n    replacement   = \"$1:$2\"\n  }\n\n  rule {\n    regex       = \"__meta_kubernetes_pod_annotation_prometheus_io_param_(.+)\"\n    replacement = \"__param_$1\"\n    action      = \"labelmap\"\n  }\n\n  rule {\n    source_labels = [\"__meta_kubernetes_pod_label_app_kubernetes_io_component\"]\n    target_label  = \"component\"\n  }\n\n  rule {\n    source_labels = [\"__meta_kubernetes_namespace\"]\n    target_label  = \"namespace\"\n  }\n\n  rule {\n    regex       = \"__meta_kubernetes_pod_label_uid\"\n    action      = \"labeldrop\"\n  }\n\n  rule {\n    regex       = \"__meta_kubernetes_pod_label_id\"\n    action      = \"labeldrop\"\n  }\n\n  rule {\n    regex       = \"__meta_kubernetes_pod_label_name\"\n    action      = \"labeldrop\"\n  }\n\n  rule {\n    replacement  = \"{{ .Values.clustername | default \"settlemint\" }}\"\n    target_label = \"cluster_name\"\n  }\n\n}\n\nprometheus.scrape \"kubernetes_pods\" {\n  targets         = discovery.relabel.kubernetes_pods.output\n  forward_to      = [{{if .Values.endpoints.internal.prometheus.enabled }}prometheus.remote_write.btp_metrics.receiver{{ end }}{{if .Values.endpoints.external.prometheus.enabled }}{{if .Values.endpoints.internal.prometheus.enabled }},{{ end }}prometheus.remote_write.btp_metrics_external.receiver{{ end }}]\n  job_name        = \"kubernetes-pods\"\n  honor_labels    = true\n  scrape_interval = \"15s\"\n}\n\nloki.source.kubernetes \"kubernetes_pods\" {\n  targets    = discovery.relabel.kubernetes_pods.output\n  forward_to = [{{ if .Values.endpoints.internal.loki.enabled }}loki.process.redact_tokens.receiver{{ end }}{{ if .Values.endpoints.external.loki.enabled }}{{ if .Values.endpoints.internal.loki.enabled }},{{ end }}loki.process.redact_tokens_external.receiver{{ end }}]\n}\n\n{{- if .Values.endpoints.internal.loki.enabled }}\nloki.process \"redact_tokens\" {\n  forward_to = [loki.secretfilter.secret_filter.receiver]\n  stage.replace {\n    expression = \"(?i)sm_\\\\S+_[0-9a-zA-Z]{3}([0-9a-zA-Z]+)\"\n    replace = \"****\"\n  }\n}\n\nloki.secretfilter \"secret_filter\" {\n  forward_to  = [loki.write.btp_logs.receiver]\n  redact_with = \"<ALLOY-REDACTED-SECRET:$SECRET_NAME:$SECRET_HASH>\"\n}\n\nloki.write \"btp_logs\" {\n  endpoint {\n    url = {{ .Values.endpoints.internal.loki.url | quote }}\n  }\n}\n{{- end }}\n\n{{- if .Values.endpoints.external.loki.enabled }}\nloki.process \"redact_tokens_external\" {\n  forward_to = [loki.secretfilter.secret_filter_external.receiver]\n  stage.replace {\n    expression = \"(?i)sm_\\\\S+_[0-9a-zA-Z]{3}([0-9a-zA-Z]+)\"\n    replace = \"****\"\n  }\n}\n\nloki.secretfilter \"secret_filter_external\" {\n  forward_to  = [loki.write.btp_logs_external.receiver]\n  redact_with = \"<ALLOY-REDACTED-SECRET:$SECRET_NAME:$SECRET_HASH>\"\n}\n\nloki.write \"btp_logs_external\" {\n  endpoint {\n    url = {{ .Values.endpoints.external.loki.url | quote }}\n\n    {{- if and .Values.endpoints.external.loki.basicAuth.username .Values.endpoints.external.loki.basicAuth.password }}\n    basic_auth {\n      username = {{ .Values.endpoints.external.loki.basicAuth.username | quote }}\n      password = {{ .Values.endpoints.external.loki.basicAuth.password | quote }}\n    }\n    {{- end }}\n  }\n}\n{{- end }}\n\notelcol.receiver.otlp \"atk_traces\" {\n  grpc {\n    endpoint = \"0.0.0.0:4317\"\n  }\n\n  http {\n    endpoint = \"0.0.0.0:4318\"\n  }\n\n  output {\n    traces  = [otelcol.processor.batch.atk_traces.input]\n  }\n}\n\notelcol.processor.batch \"atk_traces\" {\n  send_batch_size = 16384\n  send_batch_max_size = 16384\n  timeout = \"2s\"\n\n  output {\n    traces  = [{{ if .Values.endpoints.internal.otel.enabled }}otelcol.exporter.otlphttp.atk_traces_internal.input{{ end }}{{ if .Values.endpoints.external.otel.enabled }}{{ if .Values.endpoints.internal.otel.enabled }},{{ end }}otelcol.exporter.otlphttp.atk_traces_external.input{{ end }}]\n  }\n}\n\n{{- if .Values.endpoints.internal.otel.enabled }}\notelcol.exporter.otlphttp \"atk_traces_internal\" {\n  client {\n    endpoint = {{ .Values.endpoints.internal.otel.url | quote }}\n    tls {\n      insecure             = true\n      insecure_skip_verify = true\n    }\n  }\n}\n{{- end }}\n\n{{- if .Values.endpoints.external.otel.enabled }}\notelcol.exporter.otlp \"atk_traces_external\" {\n  client {\n    endpoint = {{ .Values.endpoints.external.otel.url | quote }}\n\n\n    {{- if and .Values.endpoints.external.otel.basicAuth.username .Values.endpoints.external.otel.basicAuth.password }}\n    auth     = otelcol.auth.basic.atk_traces_external.handler\n    {{- end }}\n  }\n}\n\n{{- if and .Values.endpoints.external.otel.basicAuth.username .Values.endpoints.external.otel.basicAuth.password }}\notelcol.auth.basic \"atk_traces_external\" {\n  username = {{ .Values.endpoints.external.otel.basicAuth.username | quote }}\n  password = {{ .Values.endpoints.external.otel.basicAuth.password | quote }}\n}\n{{- end }}\n\n{{- end }}\n"` |  |
| alloy.alloy.enableReporting | bool | `false` |  |
| alloy.alloy.extraPorts[0].name | string | `"otel-grpc"` |  |
| alloy.alloy.extraPorts[0].port | int | `4317` |  |
| alloy.alloy.extraPorts[0].protocol | string | `"TCP"` |  |
| alloy.alloy.extraPorts[0].targetPort | int | `4317` |  |
| alloy.alloy.extraPorts[1].name | string | `"otel-http"` |  |
| alloy.alloy.extraPorts[1].port | int | `4318` |  |
| alloy.alloy.extraPorts[1].protocol | string | `"TCP"` |  |
| alloy.alloy.extraPorts[1].targetPort | int | `4318` |  |
| alloy.alloy.resources | object | `{}` |  |
| alloy.alloy.stabilityLevel | string | `"experimental"` |  |
| alloy.clustername | string | `""` |  |
| alloy.configReloader.image.registry | string | `"ghcr.io"` |  |
| alloy.controller.type | string | `"deployment"` |  |
| alloy.crds.create | bool | `false` |  |
| alloy.enabled | bool | `true` |  |
| alloy.endpoints.external.loki.basicAuth.password | string | `nil` |  |
| alloy.endpoints.external.loki.basicAuth.username | string | `nil` |  |
| alloy.endpoints.external.loki.enabled | bool | `false` |  |
| alloy.endpoints.external.loki.url | string | `""` |  |
| alloy.endpoints.external.otel.basicAuth.password | string | `nil` |  |
| alloy.endpoints.external.otel.basicAuth.username | string | `nil` |  |
| alloy.endpoints.external.otel.enabled | bool | `false` |  |
| alloy.endpoints.external.otel.url | string | `""` |  |
| alloy.endpoints.external.prometheus.basicAuth.password | string | `nil` |  |
| alloy.endpoints.external.prometheus.basicAuth.username | string | `nil` |  |
| alloy.endpoints.external.prometheus.enabled | bool | `false` |  |
| alloy.endpoints.external.prometheus.url | string | `""` |  |
| alloy.endpoints.internal.loki.enabled | bool | `true` |  |
| alloy.endpoints.internal.loki.url | string | `"http://logs:3100/loki/api/v1/push"` |  |
| alloy.endpoints.internal.otel.enabled | bool | `true` |  |
| alloy.endpoints.internal.otel.url | string | `"http://tempo:4318"` |  |
| alloy.endpoints.internal.prometheus.enabled | bool | `true` |  |
| alloy.endpoints.internal.prometheus.url | string | `"http://metrics:8428/api/v1/write"` |  |
| alloy.fullnameOverride | string | `"alloy"` |  |
| alloy.global.image.pullSecrets | list | `[]` |  |
| alloy.image.registry | string | `"docker.io"` |  |
| grafana.adminPassword | string | `"atk"` |  |
| grafana.adminUser | string | `"settlemint"` |  |
| grafana.datasources."datasources.yaml".apiVersion | int | `1` |  |
| grafana.datasources."datasources.yaml".datasources[0].access | string | `"proxy"` |  |
| grafana.datasources."datasources.yaml".datasources[0].isDefault | bool | `true` |  |
| grafana.datasources."datasources.yaml".datasources[0].name | string | `"Prometheus"` |  |
| grafana.datasources."datasources.yaml".datasources[0].type | string | `"prometheus"` |  |
| grafana.datasources."datasources.yaml".datasources[0].uid | string | `"prometheus"` |  |
| grafana.datasources."datasources.yaml".datasources[0].url | string | `"http://metrics:8428"` |  |
| grafana.datasources."datasources.yaml".datasources[1].access | string | `"proxy"` |  |
| grafana.datasources."datasources.yaml".datasources[1].isDefault | bool | `false` |  |
| grafana.datasources."datasources.yaml".datasources[1].jsonData.derivedFields[0].datasourceUid | string | `"tempo"` |  |
| grafana.datasources."datasources.yaml".datasources[1].jsonData.derivedFields[0].matcherRegex | string | `"^.*?traceI[d|D]=(\\w+).*$"` |  |
| grafana.datasources."datasources.yaml".datasources[1].jsonData.derivedFields[0].name | string | `"traceId"` |  |
| grafana.datasources."datasources.yaml".datasources[1].jsonData.derivedFields[0].url | string | `"$${__value.raw}"` |  |
| grafana.datasources."datasources.yaml".datasources[1].jsonData.maxLines | int | `1000` |  |
| grafana.datasources."datasources.yaml".datasources[1].jsonData.timeout | int | `60` |  |
| grafana.datasources."datasources.yaml".datasources[1].name | string | `"Loki"` |  |
| grafana.datasources."datasources.yaml".datasources[1].type | string | `"loki"` |  |
| grafana.datasources."datasources.yaml".datasources[1].uid | string | `"loki"` |  |
| grafana.datasources."datasources.yaml".datasources[1].url | string | `"http://logs:3100"` |  |
| grafana.datasources."datasources.yaml".datasources[2].access | string | `"proxy"` |  |
| grafana.datasources."datasources.yaml".datasources[2].database | string | `"thegraph"` |  |
| grafana.datasources."datasources.yaml".datasources[2].isDefault | bool | `false` |  |
| grafana.datasources."datasources.yaml".datasources[2].jsonData.postgresVersion | int | `15` |  |
| grafana.datasources."datasources.yaml".datasources[2].jsonData.sslmode | string | `"disable"` |  |
| grafana.datasources."datasources.yaml".datasources[2].jsonData.timescaledb | bool | `false` |  |
| grafana.datasources."datasources.yaml".datasources[2].name | string | `"PostgreSQL"` |  |
| grafana.datasources."datasources.yaml".datasources[2].secureJsonData.password | string | `"atk"` |  |
| grafana.datasources."datasources.yaml".datasources[2].type | string | `"postgres"` |  |
| grafana.datasources."datasources.yaml".datasources[2].uid | string | `"postgres"` |  |
| grafana.datasources."datasources.yaml".datasources[2].url | string | `"postgresql:5432"` |  |
| grafana.datasources."datasources.yaml".datasources[2].user | string | `"thegraph"` |  |
| grafana.enabled | bool | `true` |  |
| grafana.fullnameOverride | string | `"grafana"` |  |
| grafana.global.imagePullSecrets | list | `[]` |  |
| grafana.global.imageRegistry | string | `"docker.io"` |  |
| grafana.ingress.enabled | bool | `true` |  |
| grafana.ingress.hosts[0] | string | `"grafana.k8s.orb.local"` |  |
| grafana.ingress.ingressClassName | string | `"atk-nginx"` |  |
| grafana.initChownData.enabled | bool | `false` |  |
| grafana.persistence.enabled | bool | `false` |  |
| grafana.persistence.size | string | `"1Gi"` |  |
| grafana.plugins[0] | string | `"https://storage.googleapis.com/integration-artifacts/grafana-lokiexplore-app/grafana-lokiexplore-app-latest.zip;grafana-lokiexplore-app"` |  |
| grafana.podLabels."app.kubernetes.io/managed-by" | string | `"helm"` |  |
| grafana.podLabels."kots.io/app-slug" | string | `"settlemint-atk"` |  |
| grafana.sidecar.alerts.enabled | bool | `false` |  |
| grafana.sidecar.alerts.label | string | `"grafana_alert"` |  |
| grafana.sidecar.alerts.labelValue | string | `"1"` |  |
| grafana.sidecar.alerts.searchNamespace | string | `"ALL"` |  |
| grafana.sidecar.alerts.slackChannel | string | `""` |  |
| grafana.sidecar.alerts.slackUrl | string | `""` |  |
| grafana.sidecar.alerts.slackUsername | string | `""` |  |
| grafana.sidecar.dashboards.enabled | bool | `true` |  |
| grafana.sidecar.dashboards.folderAnnotation | string | `"grafana_folder"` |  |
| grafana.sidecar.dashboards.provider.allowUiUpdates | bool | `true` |  |
| grafana.sidecar.dashboards.provider.foldersFromFilesStructure | bool | `true` |  |
| grafana.sidecar.dashboards.searchNamespace | string | `"ALL"` |  |
| grafana.sidecar.datasources.enabled | bool | `true` |  |
| grafana.sidecar.datasources.initDatasources | bool | `true` |  |
| grafana.sidecar.plugins.enabled | bool | `true` |  |
| kube-state-metrics.customLabels."kots.io/app-slug" | string | `"settlemint-atk"` |  |
| kube-state-metrics.enabled | bool | `true` |  |
| kube-state-metrics.fullnameOverride | string | `"kube-state-metrics"` |  |
| kube-state-metrics.image.registry | string | `"registry.k8s.io"` |  |
| kube-state-metrics.imagePullSecrets | list | `[]` |  |
| kube-state-metrics.metricLabelsAllowlist[0] | string | `"pods=[*]"` |  |
| kube-state-metrics.metricLabelsAllowlist[1] | string | `"ingresses=[*]"` |  |
| kube-state-metrics.podAnnotations."prometheus.io/scrape" | string | `"true"` |  |
| loki.backend.replicas | int | `0` |  |
| loki.bloomCompactor.replicas | int | `0` |  |
| loki.bloomGateway.replicas | int | `0` |  |
| loki.chunksCache.allocatedMemory | int | `1024` |  |
| loki.chunksCache.enabled | bool | `false` |  |
| loki.chunksCache.writebackSizeLimit | string | `"100MB"` |  |
| loki.compactor.replicas | int | `0` |  |
| loki.deploymentMode | string | `"SingleBinary"` |  |
| loki.distributor.replicas | int | `0` |  |
| loki.enabled | bool | `true` |  |
| loki.fullnameOverride | string | `"logs"` |  |
| loki.gateway.affinity.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution | string | `nil` |  |
| loki.gateway.ingress.annotations."nginx.ingress.kubernetes.io/auth-realm" | string | `"Authentication Required - Logs"` |  |
| loki.gateway.ingress.annotations."nginx.ingress.kubernetes.io/auth-secret" | string | `"observability-logs"` |  |
| loki.gateway.ingress.annotations."nginx.ingress.kubernetes.io/auth-type" | string | `"basic"` |  |
| loki.gateway.ingress.annotations."nginx.ingress.kubernetes.io/client-body-buffer-size" | string | `"500m"` |  |
| loki.gateway.ingress.annotations."nginx.ingress.kubernetes.io/proxy-body-size" | string | `"500m"` |  |
| loki.gateway.ingress.annotations."nginx.ingress.kubernetes.io/proxy-read-timeout" | string | `"3600"` |  |
| loki.gateway.ingress.annotations."nginx.ingress.kubernetes.io/proxy-send-timeout" | string | `"3600"` |  |
| loki.gateway.ingress.enabled | bool | `false` |  |
| loki.gateway.ingress.hosts[0].host | string | `"logs.settlemint.local"` |  |
| loki.gateway.ingress.hosts[0].paths[0].path | string | `"/"` |  |
| loki.gateway.ingress.hosts[0].paths[0].pathType | string | `"Prefix"` |  |
| loki.gateway.ingress.ingressClassName | string | `"atk-nginx"` |  |
| loki.global.image.registry | string | `"docker.io"` |  |
| loki.imagePullSecrets | list | `[]` |  |
| loki.indexGateway.replicas | int | `0` |  |
| loki.ingester.replicas | int | `0` |  |
| loki.loki.auth_enabled | bool | `false` |  |
| loki.loki.commonConfig.replication_factor | int | `1` |  |
| loki.loki.compactor.compaction_interval | string | `"60m"` |  |
| loki.loki.compactor.delete_request_store | string | `"filesystem"` |  |
| loki.loki.compactor.retention_delete_delay | string | `"2h"` |  |
| loki.loki.compactor.retention_delete_worker_count | int | `150` |  |
| loki.loki.compactor.retention_enabled | bool | `true` |  |
| loki.loki.compactor.working_directory | string | `"/var/loki/retention"` |  |
| loki.loki.ingester.chunk_encoding | string | `"snappy"` |  |
| loki.loki.limits_config.allow_structured_metadata | bool | `true` |  |
| loki.loki.limits_config.cardinality_limit | int | `200000` |  |
| loki.loki.limits_config.ingestion_burst_size_mb | int | `1000` |  |
| loki.loki.limits_config.ingestion_rate_mb | int | `1000` |  |
| loki.loki.limits_config.max_entries_limit_per_query | int | `1000000` |  |
| loki.loki.limits_config.max_global_streams_per_user | int | `10000` |  |
| loki.loki.limits_config.max_label_name_length | int | `10240` |  |
| loki.loki.limits_config.max_label_names_per_series | int | `300` |  |
| loki.loki.limits_config.max_label_value_length | int | `20480` |  |
| loki.loki.limits_config.max_line_size | int | `100982429` |  |
| loki.loki.limits_config.max_query_parallelism | int | `2` |  |
| loki.loki.limits_config.max_query_series | int | `10000` |  |
| loki.loki.limits_config.per_stream_rate_limit | string | `"512M"` |  |
| loki.loki.limits_config.per_stream_rate_limit_burst | string | `"1024M"` |  |
| loki.loki.limits_config.reject_old_samples | bool | `true` |  |
| loki.loki.limits_config.reject_old_samples_max_age | string | `"24h"` |  |
| loki.loki.limits_config.retention_period | string | `"168h"` |  |
| loki.loki.limits_config.split_queries_by_interval | string | `"15m"` |  |
| loki.loki.limits_config.volume_enabled | bool | `true` |  |
| loki.loki.pattern_receiver.enabled | bool | `true` |  |
| loki.loki.querier.max_concurrent | int | `2` |  |
| loki.loki.schemaConfig.configs[0].from | string | `"2024-04-01"` |  |
| loki.loki.schemaConfig.configs[0].index.period | string | `"24h"` |  |
| loki.loki.schemaConfig.configs[0].index.prefix | string | `"loki_index_"` |  |
| loki.loki.schemaConfig.configs[0].object_store | string | `"filesystem"` |  |
| loki.loki.schemaConfig.configs[0].schema | string | `"v13"` |  |
| loki.loki.schemaConfig.configs[0].store | string | `"tsdb"` |  |
| loki.loki.server.grpc_server_max_recv_msg_size | int | `100982429` |  |
| loki.loki.server.grpc_server_max_send_msg_size | int | `100982429` |  |
| loki.loki.storage.type | string | `"filesystem"` |  |
| loki.loki.tracing.enabled | bool | `true` |  |
| loki.lokiCanary.enabled | bool | `false` |  |
| loki.memcached.image.repository | string | `"docker.io/library/memcached"` |  |
| loki.memcachedExporter.image.repository | string | `"docker.io/prom/memcached-exporter"` |  |
| loki.minio.enabled | bool | `false` |  |
| loki.querier.replicas | int | `0` |  |
| loki.queryFrontend.replicas | int | `0` |  |
| loki.queryScheduler.replicas | int | `0` |  |
| loki.read.replicas | int | `0` |  |
| loki.resultsCache.enabled | bool | `false` |  |
| loki.sidecar.image.repository | string | `"docker.io/kiwigrid/k8s-sidecar"` | The Docker registry and image for the k8s sidecar |
| loki.singleBinary.persistence.size | string | `"10Gi"` |  |
| loki.singleBinary.replicas | int | `1` |  |
| loki.singleBinary.resources | object | `{}` |  |
| loki.test.enabled | bool | `false` |  |
| loki.write.replicas | int | `0` |  |
| metrics-server.enabled | bool | `true` |  |
| metrics-server.fullnameOverride | string | `"metrics-server"` |  |
| metrics-server.image.repository | string | `"registry.k8s.io/metrics-server/metrics-server"` |  |
| metrics-server.imagePullSecrets | list | `[]` |  |
| metrics-server.podLabels."kots.io/app-slug" | string | `"settlemint-atk"` |  |
| metrics-server.server.persistentVolume.enabled | bool | `false` |  |
| metrics-server.service.labels."kots.io/app-slug" | string | `"settlemint-atk"` |  |
| prometheus-node-exporter.enabled | bool | `true` |  |
| prometheus-node-exporter.fullnameOverride | string | `"node-exporter"` |  |
| prometheus-node-exporter.global.imageRegistry | string | `"quay.io"` |  |
| prometheus-node-exporter.image.registry | string | `"quay.io"` |  |
| prometheus-node-exporter.imagePullSecrets | list | `[]` |  |
| prometheus-node-exporter.kubeRBACProxy.image.registry | string | `"quay.io"` |  |
| prometheus-node-exporter.nameOverride | string | `"node-exporter"` |  |
| prometheus-node-exporter.podAnnotations."cluster-autoscaler.kubernetes.io/safe-to-evict" | string | `"true"` |  |
| prometheus-node-exporter.podAnnotations."prometheus.io/port" | string | `"9100"` |  |
| prometheus-node-exporter.podAnnotations."prometheus.io/scrape" | string | `"true"` |  |
| prometheus-node-exporter.podLabels."kots.io/app-slug" | string | `"settlemint-atk"` |  |
| tempo.enabled | bool | `true` |  |
| tempo.fullnameOverride | string | `"tempo"` |  |
| tempo.persistence.enabled | bool | `true` |  |
| tempo.persistence.size | string | `"10Gi"` |  |
| tempo.podAnnotations."prometheus.io/path" | string | `"/metrics"` |  |
| tempo.podAnnotations."prometheus.io/port" | string | `"3100"` |  |
| tempo.podAnnotations."prometheus.io/scrape" | string | `"true"` |  |
| tempo.podLabels."kots.io/app-slug" | string | `"settlemint-atk"` |  |
| tempo.securityContext.fsGroup | int | `65532` |  |
| tempo.securityContext.runAsGroup | int | `65532` |  |
| tempo.securityContext.runAsNonRoot | bool | `true` |  |
| tempo.securityContext.runAsUser | int | `65532` |  |
| tempo.tempo.metricsGenerator.enabled | bool | `true` |  |
| tempo.tempo.metricsGenerator.remoteWriteUrl | string | `"http://o11y-metrics:8428/api/v1/write"` |  |
| tempo.tempo.overrides.defaults.global.max_bytes_per_trace | int | `20000000` |  |
| tempo.tempo.overrides.defaults.ingestion.max_traces_per_user | int | `100000` |  |
| tempo.tempo.overrides.defaults.ingestion.rate_limit_bytes | int | `30000000` |  |
| tempo.tempo.pullSecrets | list | `[]` |  |
| tempo.tempo.reportingEnabled | bool | `false` |  |
| tempo.tempo.repository | string | `"docker.io/grafana/tempo"` |  |
| tempo.tempo.retention | string | `"168h"` |  |
| tempo.tempoQuery.ingress.annotations."nginx.ingress.kubernetes.io/auth-type" | string | `"basic"` |  |
| tempo.tempoQuery.ingress.annotations."nginx.ingress.kubernetes.io/client-body-buffer-size" | string | `"500m"` |  |
| tempo.tempoQuery.ingress.annotations."nginx.ingress.kubernetes.io/proxy-body-size" | string | `"500m"` |  |
| tempo.tempoQuery.ingress.annotations."nginx.ingress.kubernetes.io/proxy-read-timeout" | string | `"3600"` |  |
| tempo.tempoQuery.ingress.annotations."nginx.ingress.kubernetes.io/proxy-send-timeout" | string | `"3600"` |  |
| tempo.tempoQuery.ingress.enabled | bool | `false` |  |
| tempo.tempoQuery.ingress.hosts[0] | string | `"traces.k8s.orb.local"` |  |
| tempo.tempoQuery.ingress.ingressClassName | string | `"atk-nginx"` |  |
| tempo.tempoQuery.ingress.pathType | string | `"Prefix"` |  |
| tempo.tempoQuery.pullSecrets | list | `[]` |  |
| tempo.tempoQuery.repository | string | `"docker.io/grafana/tempo-query"` |  |
| victoria-metrics-single.enabled | bool | `true` |  |
| victoria-metrics-single.global.image.registry | string | `"docker.io"` |  |
| victoria-metrics-single.global.imagePullSecrets | list | `[]` |  |
| victoria-metrics-single.server.extraArgs."search.maxQueryLen" | int | `163840` |  |
| victoria-metrics-single.server.fullnameOverride | string | `"metrics"` |  |
| victoria-metrics-single.server.ingress.annotations."nginx.ingress.kubernetes.io/auth-realm" | string | `"Authentication Required - Metrics"` |  |
| victoria-metrics-single.server.ingress.annotations."nginx.ingress.kubernetes.io/auth-secret" | string | `"observability-metrics"` |  |
| victoria-metrics-single.server.ingress.annotations."nginx.ingress.kubernetes.io/auth-type" | string | `"basic"` |  |
| victoria-metrics-single.server.ingress.annotations."nginx.ingress.kubernetes.io/client-body-buffer-size" | string | `"500m"` |  |
| victoria-metrics-single.server.ingress.annotations."nginx.ingress.kubernetes.io/proxy-body-size" | string | `"500m"` |  |
| victoria-metrics-single.server.ingress.annotations."nginx.ingress.kubernetes.io/proxy-read-timeout" | string | `"3600"` |  |
| victoria-metrics-single.server.ingress.annotations."nginx.ingress.kubernetes.io/proxy-send-timeout" | string | `"3600"` |  |
| victoria-metrics-single.server.ingress.enabled | bool | `false` |  |
| victoria-metrics-single.server.ingress.hosts[0].name | string | `"metrics.settlemint.local"` |  |
| victoria-metrics-single.server.ingress.hosts[0].path | string | `"/"` |  |
| victoria-metrics-single.server.ingress.hosts[0].port | string | `"http"` |  |
| victoria-metrics-single.server.ingress.ingressClassName | string | `"atk-nginx"` |  |
| victoria-metrics-single.server.ingress.pathType | string | `"Prefix"` |  |
| victoria-metrics-single.server.persistentVolume.size | string | `"10Gi"` |  |
| victoria-metrics-single.server.persistentVolume.storageClass | string | `""` |  |
| victoria-metrics-single.server.podAnnotations."prometheus.io/path" | string | `"/metrics"` |  |
| victoria-metrics-single.server.podAnnotations."prometheus.io/port" | string | `"8428"` |  |
| victoria-metrics-single.server.podAnnotations."prometheus.io/scrape" | string | `"true"` |  |
| victoria-metrics-single.server.podLabels."kots.io/app-slug" | string | `"settlemint-atk"` |  |
| victoria-metrics-single.server.resources | object | `{}` |  |
| victoria-metrics-single.server.retentionPeriod | int | `1` |  |
| victoria-metrics-single.server.service.annotations."prometheus.io/path" | string | `"/metrics"` |  |
| victoria-metrics-single.server.service.annotations."prometheus.io/port" | string | `"8428"` |  |
| victoria-metrics-single.server.service.annotations."prometheus.io/scrape" | string | `"true"` |  |
| victoria-metrics-single.server.service.labels."kots.io/app-slug" | string | `"settlemint-atk"` |  |

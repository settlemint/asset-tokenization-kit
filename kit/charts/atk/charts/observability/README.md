# observability

![Version: 2.0.0-beta.3](https://img.shields.io/badge/Version-2.0.0--beta.3-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: 2.0.0-beta.3](https://img.shields.io/badge/AppVersion-2.0.0--beta.3-informational?style=flat-square)

A Helm chart for the observability components

## Configuration

The following table lists the configurable parameters of this chart and their default values.

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
|alloy|object|-|Alloy configuration|
|alloy.alloy|object|-|Alloy agent configuration|
|alloy.alloy.configMap|object|-|ConfigMap configuration for Alloy|
|alloy.alloy.configMap.content|string|`"logging {\n  level  = \"info\"\n  format = \"logfmt\"\n}\n\ndiscovery.kubernetes \"kubernetes_nodes\" {\n  role = \"node\"\n}\n\ndiscovery.relabel \"kubernetes_nodes_cadvisor\" {\n  targets = discovery.kubernetes.kubernetes_nodes.targets\n\n  rule {\n    target_label = \"__address__\"\n    replacement  = \"kubernetes.default.svc:443\"\n  }\n\n  rule {\n    source_labels = [\"__meta_kubernetes_node_name\"]\n    regex         = \"(.+)\"\n    target_label  = \"__metrics_path__\"\n    replacement   = \"/api/v1/nodes/$1/proxy/metrics/cadvisor\"\n  }\n\n  rule {\n    regex       = \"__meta_kubernetes_pod_label_uid\"\n    action      = \"labeldrop\"\n  }\n\n  rule {\n    regex       = \"__meta_kubernetes_pod_label_id\"\n    action      = \"labeldrop\"\n  }\n\n  rule {\n    regex       = \"__meta_kubernetes_pod_label_name\"\n    action      = \"labeldrop\"\n  }\n}\n\ndiscovery.relabel \"kubernetes_nodes\" {\n  targets = discovery.kubernetes.kubernetes_nodes.targets\n\n  rule {\n    target_label = \"__address__\"\n    replacement  = \"kubernetes.default.svc:443\"\n  }\n\n  rule {\n    source_labels = [\"__meta_kubernetes_node_name\"]\n    regex         = \"(.+)\"\n    target_label  = \"__metrics_path__\"\n    replacement   = \"/api/v1/nodes/$1/proxy/metrics\"\n  }\n\n  rule {\n    regex       = \"__meta_kubernetes_pod_label_uid\"\n    action      = \"labeldrop\"\n  }\n\n  rule {\n    regex       = \"__meta_kubernetes_pod_label_id\"\n    action      = \"labeldrop\"\n  }\n\n  rule {\n    regex       = \"__meta_kubernetes_pod_label_name\"\n    action      = \"labeldrop\"\n  }\n\n  rule {\n    replacement  = \"{{ .Values.clustername | default \"settlemint\" }}\"\n    target_label = \"cluster_name\"\n  }\n}\n\n\nprometheus.scrape \"kubernetes_nodes_cadvisor\" {\n  targets         = discovery.relabel.kubernetes_nodes_cadvisor.output\n  forward_to      = [{{if .Values.endpoints.internal.prometheus.enabled }}prometheus.remote_write.btp_metrics.receiver{{ end }}{{if .Values.endpoints.external.prometheus.enabled }}{{if .Values.endpoints.internal.prometheus.enabled }},{{ end }}prometheus.remote_write.btp_metrics_external.receiver{{ end }}]\n  job_name        = \"kubernetes-nodes-cadvisor\"\n  scrape_interval = \"15s\"\n  scheme          = \"https\"\n\n  authorization {\n    type             = \"Bearer\"\n    credentials_file = \"/var/run/secrets/kubernetes.io/serviceaccount/token\"\n  }\n\n  tls_config {\n    ca_file              = \"/var/run/secrets/kubernetes.io/serviceaccount/ca.crt\"\n    insecure_skip_verify = true\n  }\n}\n\nprometheus.scrape \"kubernetes_nodes\" {\n  targets         = discovery.relabel.kubernetes_nodes.output\n  forward_to      = [{{if .Values.endpoints.internal.prometheus.enabled }}prometheus.remote_write.btp_metrics.receiver{{ end }}{{if .Values.endpoints.external.prometheus.enabled }}{{if .Values.endpoints.internal.prometheus.enabled }},{{ end }}prometheus.remote_write.btp_metrics_external.receiver{{ end }}]\n  job_name        = \"kubernetes-nodes\"\n  scrape_interval = \"15s\"\n  scheme          = \"https\"\n\n  authorization {\n    type             = \"Bearer\"\n    credentials_file = \"/var/run/secrets/kubernetes.io/serviceaccount/token\"\n  }\n\n  tls_config {\n    ca_file              = \"/var/run/secrets/kubernetes.io/serviceaccount/ca.crt\"\n    insecure_skip_verify = true\n  }\n}\n\n{{- if .Values.endpoints.internal.prometheus.enabled }}\nprometheus.remote_write \"btp_metrics\" {\n    endpoint {\n        url = {{ .Values.endpoints.internal.prometheus.url | quote }}\n    }\n}\n{{- end }}\n\n{{- if .Values.endpoints.external.prometheus.enabled }}\nprometheus.remote_write \"btp_metrics_external\" {\n    endpoint {\n        url = {{ .Values.endpoints.external.prometheus.url | quote }}\n\n        {{- if and .Values.endpoints.external.prometheus.basicAuth.username .Values.endpoints.external.prometheus.basicAuth.password }}\n        basic_auth {\n          username = {{ .Values.endpoints.external.prometheus.basicAuth.username | quote }}\n          password = {{ .Values.endpoints.external.prometheus.basicAuth.password | quote }}\n        }\n        {{- end }}\n    }\n}\n{{- end }}\n\ndiscovery.kubernetes \"kubernetes_pods\" {\n  role = \"pod\"\n\n\n  selectors {\n    role  = \"pod\"\n    label = \"app.kubernetes.io/instance={{ .Release.Name }}\"\n  }\n\n}\n\ndiscovery.relabel \"kubernetes_pods\" {\n  targets = discovery.kubernetes.kubernetes_pods.targets\n\n  rule {\n    source_labels = [\"__meta_kubernetes_pod_annotation_prometheus_io_scheme\"]\n    regex         = \"(https?)\"\n    target_label  = \"__scheme__\"\n  }\n\n  rule {\n    source_labels = [\"__meta_kubernetes_pod_annotation_prometheus_io_path\"]\n    regex         = \"(.+)\"\n    target_label  = \"__metrics_path__\"\n  }\n\n  rule {\n    source_labels = [\"__address__\", \"__meta_kubernetes_pod_annotation_prometheus_io_port\"]\n    regex         = \"(.+?)(?::\\\\d+)?;(\\\\d+)\"\n    target_label  = \"__address__\"\n    replacement   = \"$1:$2\"\n  }\n\n  rule {\n    regex       = \"__meta_kubernetes_pod_annotation_prometheus_io_param_(.+)\"\n    replacement = \"__param_$1\"\n    action      = \"labelmap\"\n  }\n\n  rule {\n    source_labels = [\"__meta_kubernetes_pod_label_app_kubernetes_io_component\"]\n    target_label  = \"component\"\n  }\n\n  rule {\n    source_labels = [\"__meta_kubernetes_namespace\"]\n    target_label  = \"namespace\"\n  }\n\n  rule {\n    regex       = \"__meta_kubernetes_pod_label_uid\"\n    action      = \"labeldrop\"\n  }\n\n  rule {\n    regex       = \"__meta_kubernetes_pod_label_id\"\n    action      = \"labeldrop\"\n  }\n\n  rule {\n    regex       = \"__meta_kubernetes_pod_label_name\"\n    action      = \"labeldrop\"\n  }\n\n  rule {\n    replacement  = \"{{ .Values.clustername | default \"settlemint\" }}\"\n    target_label = \"cluster_name\"\n  }\n\n}\n\nprometheus.scrape \"kubernetes_pods\" {\n  targets         = discovery.relabel.kubernetes_pods.output\n  forward_to      = [{{if .Values.endpoints.internal.prometheus.enabled }}prometheus.remote_write.btp_metrics.receiver{{ end }}{{if .Values.endpoints.external.prometheus.enabled }}{{if .Values.endpoints.internal.prometheus.enabled }},{{ end }}prometheus.remote_write.btp_metrics_external.receiver{{ end }}]\n  job_name        = \"kubernetes-pods\"\n  honor_labels    = true\n  scrape_interval = \"15s\"\n}\n\nloki.source.kubernetes \"kubernetes_pods\" {\n  targets    = discovery.relabel.kubernetes_pods.output\n  forward_to = [{{ if .Values.endpoints.internal.loki.enabled }}loki.process.redact_tokens.receiver{{ end }}{{ if .Values.endpoints.external.loki.enabled }}{{ if .Values.endpoints.internal.loki.enabled }},{{ end }}loki.process.redact_tokens_external.receiver{{ end }}]\n}\n\n{{- if .Values.endpoints.internal.loki.enabled }}\nloki.process \"redact_tokens\" {\n  forward_to = [loki.secretfilter.secret_filter.receiver]\n  stage.replace {\n    expression = \"(?i)sm_\\\\S+_[0-9a-zA-Z]{3}([0-9a-zA-Z]+)\"\n    replace = \"****\"\n  }\n}\n\nloki.secretfilter \"secret_filter\" {\n  forward_to  = [loki.write.btp_logs.receiver]\n  redact_with = \"<ALLOY-REDACTED-SECRET:$SECRET_NAME:$SECRET_HASH>\"\n}\n\nloki.write \"btp_logs\" {\n  endpoint {\n    url = {{ .Values.endpoints.internal.loki.url | quote }}\n  }\n}\n{{- end }}\n\n{{- if .Values.endpoints.external.loki.enabled }}\nloki.process \"redact_tokens_external\" {\n  forward_to = [loki.secretfilter.secret_filter_external.receiver]\n  stage.replace {\n    expression = \"(?i)sm_\\\\S+_[0-9a-zA-Z]{3}([0-9a-zA-Z]+)\"\n    replace = \"****\"\n  }\n}\n\nloki.secretfilter \"secret_filter_external\" {\n  forward_to  = [loki.write.btp_logs_external.receiver]\n  redact_with = \"<ALLOY-REDACTED-SECRET:$SECRET_NAME:$SECRET_HASH>\"\n}\n\nloki.write \"btp_logs_external\" {\n  endpoint {\n    url = {{ .Values.endpoints.external.loki.url | quote }}\n\n    {{- if and .Values.endpoints.external.loki.basicAuth.username .Values.endpoints.external.loki.basicAuth.password }}\n    basic_auth {\n      username = {{ .Values.endpoints.external.loki.basicAuth.username | quote }}\n      password = {{ .Values.endpoints.external.loki.basicAuth.password | quote }}\n    }\n    {{- end }}\n  }\n}\n{{- end }}\n\notelcol.receiver.otlp \"atk_traces\" {\n  grpc {\n    endpoint = \"0.0.0.0:4317\"\n  }\n\n  http {\n    endpoint = \"0.0.0.0:4318\"\n  }\n\n  output {\n    traces  = [otelcol.processor.batch.atk_traces.input]\n  }\n}\n\notelcol.processor.batch \"atk_traces\" {\n  send_batch_size = 16384\n  send_batch_max_size = 16384\n  timeout = \"2s\"\n\n  output {\n    traces  = [{{ if .Values.endpoints.internal.otel.enabled }}otelcol.exporter.otlphttp.atk_traces_internal.input{{ end }}{{ if .Values.endpoints.external.otel.enabled }}{{ if .Values.endpoints.internal.otel.enabled }},{{ end }}otelcol.exporter.otlphttp.atk_traces_external.input{{ end }}]\n  }\n}\n\n{{- if .Values.endpoints.internal.otel.enabled }}\notelcol.exporter.otlphttp \"atk_traces_internal\" {\n  client {\n    endpoint = {{ .Values.endpoints.internal.otel.url | quote }}\n    tls {\n      insecure             = true\n      insecure_skip_verify = true\n    }\n  }\n}\n{{- end }}\n\n{{- if .Values.endpoints.external.otel.enabled }}\notelcol.exporter.otlp \"atk_traces_external\" {\n  client {\n    endpoint = {{ .Values.endpoints.external.otel.url | quote }}\n\n\n    {{- if and .Values.endpoints.external.otel.basicAuth.username .Values.endpoints.external.otel.basicAuth.password }}\n    auth     = otelcol.auth.basic.atk_traces_external.handler\n    {{- end }}\n  }\n}\n\n{{- if and .Values.endpoints.external.otel.basicAuth.username .Values.endpoints.external.otel.basicAuth.password }}\notelcol.auth.basic \"atk_traces_external\" {\n  username = {{ .Values.endpoints.external.otel.basicAuth.username | quote }}\n  password = {{ .Values.endpoints.external.otel.basicAuth.password | quote }}\n}\n{{- end }}\n\n{{- end }}\n"`|Alloy configuration content in HCL format|
|alloy.alloy.enableReporting|bool|`false`|Enable usage reporting to Grafana Labs|
|alloy.alloy.extraPorts|list|-|Extra ports to expose on Alloy pods|
|alloy.alloy.extraPorts[0]|string|`{"name":"otel-grpc","port":4317,"protocol":"TCP","targetPort":4317}`|Port name for OpenTelemetry gRPC|
|alloy.alloy.extraPorts[0].port|int|`4317`|Service port for OpenTelemetry gRPC|
|alloy.alloy.extraPorts[0].protocol|string|`"TCP"`|Protocol for OpenTelemetry gRPC|
|alloy.alloy.extraPorts[0].targetPort|int|`4317`|Target port for OpenTelemetry gRPC|
|alloy.alloy.extraPorts[1]|string|`{"name":"otel-http","port":4318,"protocol":"TCP","targetPort":4318}`|Port name for OpenTelemetry HTTP|
|alloy.alloy.extraPorts[1].port|int|`4318`|Service port for OpenTelemetry HTTP|
|alloy.alloy.extraPorts[1].protocol|string|`"TCP"`|Protocol for OpenTelemetry HTTP|
|alloy.alloy.extraPorts[1].targetPort|int|`4318`|Target port for OpenTelemetry HTTP|
|alloy.alloy.resources|object|-|Resource requests and limits for Alloy|
|alloy.alloy.resources.limits.cpu|string|`"2400m"`|CPU limit for Alloy pods|
|alloy.alloy.resources.limits.memory|string|`"1024Mi"`|Memory limit for Alloy pods|
|alloy.alloy.resources.requests.cpu|string|`"200m"`|CPU request reserved for Alloy pods|
|alloy.alloy.resources.requests.memory|string|`"512Mi"`|Memory request reserved for Alloy pods|
|alloy.alloy.stabilityLevel|string|`"experimental"`|Stability level for experimental features|
|alloy.clustername|string|`""`|Cluster name label for metrics and logs|
|alloy.configReloader|object|-|Config reloader sidecar configuration|
|alloy.configReloader.image|object|-|Config reloader image configuration|
|alloy.configReloader.image.registry|string|`"ghcr.io"`|Image registry for config reloader|
|alloy.controller|object|-|Controller configuration|
|alloy.controller.type|string|`"deployment"`|Controller type (deployment, daemonset, or statefulset)|
|alloy.crds|object|-|Custom Resource Definitions configuration|
|alloy.crds.create|bool|`false`|Create CRDs during installation|
|alloy.enabled|bool|`true`|Enable Alloy deployment|
|alloy.endpoints|object|-|Observability endpoints configuration|
|alloy.endpoints.external|object|-|External endpoints configuration for remote services|
|alloy.endpoints.external.loki|object|-|External Loki endpoint configuration|
|alloy.endpoints.external.loki.basicAuth|object|-|Basic authentication for external Loki|
|alloy.endpoints.external.loki.basicAuth.password|string|`nil`|Password for external Loki basic auth|
|alloy.endpoints.external.loki.basicAuth.username|string|`nil`|Username for external Loki basic auth|
|alloy.endpoints.external.loki.enabled|bool|`false`|Enable external Loki log shipping|
|alloy.endpoints.external.loki.url|string|`""`|External Loki push URL|
|alloy.endpoints.external.otel|object|-|External OpenTelemetry endpoint configuration|
|alloy.endpoints.external.otel.basicAuth|object|-|Basic authentication for external OpenTelemetry|
|alloy.endpoints.external.otel.basicAuth.password|string|`nil`|Password for external OpenTelemetry basic auth|
|alloy.endpoints.external.otel.basicAuth.username|string|`nil`|Username for external OpenTelemetry basic auth|
|alloy.endpoints.external.otel.enabled|bool|`false`|Enable external OpenTelemetry traces|
|alloy.endpoints.external.otel.url|string|`""`|External OpenTelemetry endpoint URL|
|alloy.endpoints.external.prometheus|object|-|External Prometheus endpoint configuration|
|alloy.endpoints.external.prometheus.basicAuth|object|-|Basic authentication for external Prometheus|
|alloy.endpoints.external.prometheus.basicAuth.password|string|`nil`|Password for external Prometheus basic auth|
|alloy.endpoints.external.prometheus.basicAuth.username|string|`nil`|Username for external Prometheus basic auth|
|alloy.endpoints.external.prometheus.enabled|bool|`false`|Enable external Prometheus remote write|
|alloy.endpoints.external.prometheus.url|string|`""`|External Prometheus remote write URL|
|alloy.endpoints.internal|object|-|Internal endpoints configuration for on-cluster services|
|alloy.endpoints.internal.loki|object|-|Internal Loki endpoint configuration|
|alloy.endpoints.internal.loki.enabled|bool|`true`|Enable internal Loki log shipping|
|alloy.endpoints.internal.loki.url|string|`"http://logs:3100/loki/api/v1/push"`|Internal Loki push URL|
|alloy.endpoints.internal.otel|object|-|Internal OpenTelemetry endpoint configuration|
|alloy.endpoints.internal.otel.enabled|bool|`true`|Enable internal OpenTelemetry traces|
|alloy.endpoints.internal.otel.url|string|`"http://tempo:4318"`|Internal OpenTelemetry HTTP endpoint URL|
|alloy.endpoints.internal.prometheus|object|-|Internal Prometheus endpoint configuration|
|alloy.endpoints.internal.prometheus.enabled|bool|`true`|Enable internal Prometheus remote write|
|alloy.endpoints.internal.prometheus.url|string|`"http://metrics:8428/api/v1/write"`|Internal Prometheus remote write URL|
|alloy.fullnameOverride|string|`"alloy"`|String to fully override common.names.fullname|
|alloy.global|object|-|Global configuration|
|alloy.global.image|object|-|Global image configuration|
|alloy.global.image.pullSecrets|list|-|Global Docker registry secret names as an array|
|alloy.grafana.adminPassword|string|`"atk"`|Grafana admin password|
|alloy.grafana.adminUser|string|`"settlemint"`|Grafana admin username|
|alloy.grafana.datasources|object|-|Datasource configuration|
|alloy.grafana.datasources."datasources.yaml"|object|-|Datasources YAML configuration|
|alloy.grafana.datasources."datasources.yaml".apiVersion|int|`1`|Datasource API version|
|alloy.grafana.datasources."datasources.yaml".datasources|list|-|List of datasources|
|alloy.grafana.datasources."datasources.yaml".datasources[0]|string|`{"access":"proxy","isDefault":true,"name":"Prometheus","type":"prometheus","uid":"prometheus","url":"http://metrics:8428"}`|Prometheus datasource name|
|alloy.grafana.datasources."datasources.yaml".datasources[0].access|string|`"proxy"`|Datasource access mode|
|alloy.grafana.datasources."datasources.yaml".datasources[0].isDefault|bool|`true`|Set as default datasource|
|alloy.grafana.datasources."datasources.yaml".datasources[0].type|string|`"prometheus"`|Datasource type|
|alloy.grafana.datasources."datasources.yaml".datasources[0].uid|string|`"prometheus"`|Datasource unique identifier|
|alloy.grafana.datasources."datasources.yaml".datasources[0].url|string|`"http://metrics:8428"`|Prometheus URL|
|alloy.grafana.datasources."datasources.yaml".datasources[1]|string|`{"access":"proxy","isDefault":false,"jsonData":{"derivedFields":[{"datasourceUid":"tempo","matcherRegex":"^.*?traceI[d|D]=(\\w+).*$","name":"traceId","url":"$${__value.raw}"}],"maxLines":1000,"timeout":60},"name":"Loki","type":"loki","uid":"loki","url":"http://logs:3100"}`|Loki datasource name|
|alloy.grafana.datasources."datasources.yaml".datasources[1].access|string|`"proxy"`|Datasource access mode|
|alloy.grafana.datasources."datasources.yaml".datasources[1].isDefault|bool|`false`|Set as default datasource|
|alloy.grafana.datasources."datasources.yaml".datasources[1].jsonData|object|-|Loki JSON data configuration|
|alloy.grafana.datasources."datasources.yaml".datasources[1].jsonData.derivedFields|list|-|Derived fields configuration for trace linking|
|alloy.grafana.datasources."datasources.yaml".datasources[1].jsonData.derivedFields[0]|string|`{"datasourceUid":"tempo","matcherRegex":"^.*?traceI[d|D]=(\\w+).*$","name":"traceId","url":"$${__value.raw}"}`|Target datasource UID for trace links|
|alloy.grafana.datasources."datasources.yaml".datasources[1].jsonData.derivedFields[0].matcherRegex|string|`"^.*?traceI[d|D]=(\\w+).*$"`|Regex to extract trace ID from logs|
|alloy.grafana.datasources."datasources.yaml".datasources[1].jsonData.derivedFields[0].name|string|`"traceId"`|Field name for trace ID|
|alloy.grafana.datasources."datasources.yaml".datasources[1].jsonData.derivedFields[0].url|string|`"$${__value.raw}"`|URL template for trace links|
|alloy.grafana.datasources."datasources.yaml".datasources[1].jsonData.maxLines|int|`1000`|Maximum lines to return|
|alloy.grafana.datasources."datasources.yaml".datasources[1].jsonData.timeout|int|`60`|Query timeout in seconds|
|alloy.grafana.datasources."datasources.yaml".datasources[1].type|string|`"loki"`|Datasource type|
|alloy.grafana.datasources."datasources.yaml".datasources[1].uid|string|`"loki"`|Datasource unique identifier|
|alloy.grafana.datasources."datasources.yaml".datasources[1].url|string|`"http://logs:3100"`|Loki URL|
|alloy.grafana.datasources."datasources.yaml".datasources[2]|string|`{"access":"proxy","database":"thegraph","isDefault":false,"jsonData":{"postgresVersion":15,"sslmode":"disable","timescaledb":false},"name":"PostgreSQL","secureJsonData":{"password":"atk"},"type":"postgres","uid":"postgres","url":"postgresql:5432","user":"thegraph"}`|PostgreSQL datasource name|
|alloy.grafana.datasources."datasources.yaml".datasources[2].access|string|`"proxy"`|Datasource access mode|
|alloy.grafana.datasources."datasources.yaml".datasources[2].database|string|`"thegraph"`|Database name|
|alloy.grafana.datasources."datasources.yaml".datasources[2].isDefault|bool|`false`|Set as default datasource|
|alloy.grafana.datasources."datasources.yaml".datasources[2].jsonData|object|-|PostgreSQL JSON data configuration|
|alloy.grafana.datasources."datasources.yaml".datasources[2].jsonData.postgresVersion|int|`15`|PostgreSQL version|
|alloy.grafana.datasources."datasources.yaml".datasources[2].jsonData.sslmode|string|`"disable"`|SSL mode for PostgreSQL connection|
|alloy.grafana.datasources."datasources.yaml".datasources[2].jsonData.timescaledb|bool|`false`|Enable TimescaleDB support|
|alloy.grafana.datasources."datasources.yaml".datasources[2].secureJsonData|object|-|Secure JSON data for sensitive fields|
|alloy.grafana.datasources."datasources.yaml".datasources[2].secureJsonData.password|string|`"atk"`|Database password|
|alloy.grafana.datasources."datasources.yaml".datasources[2].type|string|`"postgres"`|Datasource type|
|alloy.grafana.datasources."datasources.yaml".datasources[2].uid|string|`"postgres"`|Datasource unique identifier|
|alloy.grafana.datasources."datasources.yaml".datasources[2].url|string|`"postgresql:5432"`|PostgreSQL URL|
|alloy.grafana.datasources."datasources.yaml".datasources[2].user|string|`"thegraph"`|Database user|
|alloy.grafana.enabled|bool|`true`|Enable Grafana deployment|
|alloy.grafana.fullnameOverride|string|`"grafana"`|String to fully override common.names.fullname|
|alloy.grafana.global|object|-|Global configuration|
|alloy.grafana.global.imagePullSecrets|list|-|Global Docker registry secret names as an array|
|alloy.grafana.global.imageRegistry|string|`"docker.io"`|Global image registry|
|alloy.grafana.ingress|object|-|Ingress configuration for Grafana|
|alloy.grafana.ingress.enabled|bool|`true`|Enable ingress for Grafana|
|alloy.grafana.ingress.hosts|list|-|List of ingress hosts|
|alloy.grafana.ingress.hosts[0]|string|`"grafana.k8s.orb.local"`|Host name for Grafana ingress|
|alloy.grafana.ingress.ingressClassName|string|`"atk-nginx"`|Ingress class name|
|alloy.grafana.initChownData|object|-|Init container to fix permissions|
|alloy.grafana.initChownData.enabled|bool|`false`|Enable init container for chown|
|alloy.grafana.persistence|object|-|Persistent volume configuration|
|alloy.grafana.persistence.enabled|bool|`false`|Enable persistent volume for Grafana|
|alloy.grafana.persistence.size|string|`"1Gi"`|Size of persistent volume|
|alloy.grafana.plugins|list|-|List of Grafana plugins to install|
|alloy.grafana.plugins[0]|string|`"https://storage.googleapis.com/integration-artifacts/grafana-lokiexplore-app/grafana-lokiexplore-app-latest.zip;grafana-lokiexplore-app"`|Loki Explore app plugin URL|
|alloy.grafana.podLabels|object|-|Additional labels for Grafana pods|
|alloy.grafana.podLabels."app.kubernetes.io/managed-by"|string|`"helm"`|Helm managed-by label|
|alloy.grafana.podLabels."kots.io/app-slug"|string|`"settlemint-atk"`|KOTS application slug identifier|
|alloy.grafana.resources|object|-|Resource requests and limits for Grafana pods|
|alloy.grafana.resources.limits.cpu|string|`"1080m"`|CPU limit for Grafana pods|
|alloy.grafana.resources.limits.memory|string|`"768Mi"`|Memory limit for Grafana pods|
|alloy.grafana.resources.requests.cpu|string|`"180m"`|CPU request reserved for Grafana pods|
|alloy.grafana.resources.requests.memory|string|`"384Mi"`|Memory request reserved for Grafana pods|
|alloy.grafana.sidecar|object|-|Sidecar configuration for auto-loading resources|
|alloy.grafana.sidecar.alerts|object|-|Alert sidecar configuration|
|alloy.grafana.sidecar.alerts.enabled|bool|`false`|Enable alert sidecar|
|alloy.grafana.sidecar.alerts.label|string|`"grafana_alert"`|Label key for alert discovery|
|alloy.grafana.sidecar.alerts.labelValue|string|`"1"`|Label value for alert discovery|
|alloy.grafana.sidecar.alerts.searchNamespace|string|`"ALL"`|Namespace to search for alerts (ALL for all namespaces)|
|alloy.grafana.sidecar.alerts.slackChannel|string|`""`|Slack channel for alerts|
|alloy.grafana.sidecar.alerts.slackUrl|string|`""`|Slack webhook URL for alerts|
|alloy.grafana.sidecar.alerts.slackUsername|string|`""`|Slack username for alerts|
|alloy.grafana.sidecar.dashboards|object|-|Dashboard sidecar configuration|
|alloy.grafana.sidecar.dashboards.enabled|bool|`true`|Enable dashboard sidecar|
|alloy.grafana.sidecar.dashboards.folderAnnotation|string|`"grafana_folder"`|Annotation key for folder assignment|
|alloy.grafana.sidecar.dashboards.provider|object|-|Dashboard provider configuration|
|alloy.grafana.sidecar.dashboards.provider.allowUiUpdates|bool|`true`|Allow UI updates to dashboards|
|alloy.grafana.sidecar.dashboards.provider.foldersFromFilesStructure|bool|`true`|Create folders from file structure|
|alloy.grafana.sidecar.dashboards.searchNamespace|string|`"ALL"`|Namespace to search for dashboards (ALL for all namespaces)|
|alloy.grafana.sidecar.datasources|object|-|Datasource sidecar configuration|
|alloy.grafana.sidecar.datasources.enabled|bool|`true`|Enable datasource sidecar|
|alloy.grafana.sidecar.datasources.initDatasources|bool|`true`|Initialize datasources on startup|
|alloy.grafana.sidecar.plugins|object|-|Plugin sidecar configuration|
|alloy.grafana.sidecar.plugins.enabled|bool|`true`|Enable plugin sidecar|
|alloy.image|object|-|Alloy image configuration|
|alloy.image.registry|string|`"docker.io"`|Image registry for Alloy|
|global|object|-|Global configuration applied to all resources|
|global.labels|object|-|Labels applied to all resources in the chart|
|global.labels."kots.io/app-slug"|string|`"settlemint-atk"`|KOTS application slug identifier|
|kube-state-metrics|object|-|Kube State Metrics configuration|
|kube-state-metrics.customLabels|object|-|Custom labels to add to all resources|
|kube-state-metrics.customLabels."kots.io/app-slug"|string|`"settlemint-atk"`|KOTS application slug applied to kube-state-metrics resources|
|kube-state-metrics.enabled|bool|`true`|Enable kube-state-metrics deployment|
|kube-state-metrics.fullnameOverride|string|`"kube-state-metrics"`|String to fully override common.names.fullname (string)|
|kube-state-metrics.image|object|-|Kube state metrics image configuration|
|kube-state-metrics.image.registry|string|`"registry.k8s.io"`|Kube state metrics image registry|
|kube-state-metrics.imagePullSecrets|list|-|Global Docker registry secret names as an array (list)|
|kube-state-metrics.metricLabelsAllowlist|list|-|Allow list for metric labels|
|kube-state-metrics.podAnnotations|object|-|Annotations for kube-state-metrics pods|
|kube-state-metrics.podAnnotations."prometheus.io/scrape"|string|`"true"`|Enable Prometheus scraping for kube-state-metrics pods|
|loki|object|-|Loki configuration|
|loki.backend|object|-|Backend component configuration|
|loki.backend.replicas|int|`0`|Number of backend replicas (0 when using SingleBinary)|
|loki.bloomCompactor|object|-|Bloom compactor component configuration|
|loki.bloomCompactor.replicas|int|`0`|Number of bloom compactor replicas (0 when using SingleBinary)|
|loki.bloomGateway|object|-|Bloom gateway component configuration|
|loki.bloomGateway.replicas|int|`0`|Number of bloom gateway replicas (0 when using SingleBinary)|
|loki.chunksCache|object|-|Chunks cache configuration|
|loki.chunksCache.allocatedMemory|int|`1024`|Allocated memory for chunks cache in MB|
|loki.chunksCache.enabled|bool|`false`|Enable chunks cache|
|loki.chunksCache.writebackSizeLimit|string|`"100MB"`|Writeback size limit for chunks cache|
|loki.compactor|object|-|Compactor component configuration|
|loki.compactor.replicas|int|`0`|Number of compactor replicas (0 when using SingleBinary)|
|loki.deploymentMode|string|`"SingleBinary"`|Deployment mode for Loki (SingleBinary, SimpleScalable, or Distributed)|
|loki.distributor|object|-|Distributor component configuration|
|loki.distributor.replicas|int|`0`|Number of distributor replicas (0 when using SingleBinary)|
|loki.enabled|bool|`true`|Enable Loki deployment|
|loki.fullnameOverride|string|`"logs"`|String to fully override common.names.fullname|
|loki.gateway|object|-|Gateway configuration|
|loki.gateway.affinity|object|-|Affinity rules for gateway pods|
|loki.gateway.affinity.podAntiAffinity|object|-|Pod anti-affinity rules|
|loki.gateway.affinity.podAntiAffinity.requiredDuringSchedulingIgnoredDuringExecution|object|-|Required anti-affinity rules during scheduling|
|loki.gateway.ingress|object|-|Ingress configuration for gateway|
|loki.gateway.ingress.annotations|object|-|Ingress annotations|
|loki.gateway.ingress.annotations."nginx.ingress.kubernetes.io/auth-realm"|string|`"Authentication Required - Logs"`|Authentication realm message|
|loki.gateway.ingress.annotations."nginx.ingress.kubernetes.io/auth-secret"|string|`"observability-logs"`|Secret name for basic authentication|
|loki.gateway.ingress.annotations."nginx.ingress.kubernetes.io/auth-type"|string|`"basic"`|Authentication type for ingress|
|loki.gateway.ingress.annotations."nginx.ingress.kubernetes.io/client-body-buffer-size"|string|`"500m"`|Buffer size for reading client request body|
|loki.gateway.ingress.annotations."nginx.ingress.kubernetes.io/proxy-body-size"|string|`"500m"`|Maximum allowed size of client request body|
|loki.gateway.ingress.annotations."nginx.ingress.kubernetes.io/proxy-read-timeout"|string|`"3600"`|Timeout for reading a response from proxied server|
|loki.gateway.ingress.annotations."nginx.ingress.kubernetes.io/proxy-send-timeout"|string|`"3600"`|Timeout for transmitting a request to proxied server|
|loki.gateway.ingress.enabled|bool|`false`|Enable ingress for gateway|
|loki.gateway.ingress.hosts|list|-|List of ingress hosts|
|loki.gateway.ingress.hosts[0]|string|`{"host":"logs.settlemint.local","paths":[{"path":"/","pathType":"Prefix"}]}`|Host name for ingress|
|loki.gateway.ingress.hosts[0].paths|list|-|List of paths for this host|
|loki.gateway.ingress.hosts[0].paths[0]|string|`{"path":"/","pathType":"Prefix"}`|Path for ingress rule|
|loki.gateway.ingress.hosts[0].paths[0].pathType|string|`"Prefix"`|Path type for ingress rule|
|loki.gateway.ingress.ingressClassName|string|`"atk-nginx"`|Ingress class name|
|loki.global|object|-|Global configuration|
|loki.global.image|object|-|Global image configuration|
|loki.global.image.registry|string|`"docker.io"`|Global image registry|
|loki.imagePullSecrets|list|-|Global Docker registry secret names as an array|
|loki.indexGateway|object|-|Index gateway component configuration|
|loki.indexGateway.replicas|int|`0`|Number of index gateway replicas (0 when using SingleBinary)|
|loki.ingester|object|-|Ingester component configuration|
|loki.ingester.replicas|int|`0`|Number of ingester replicas (0 when using SingleBinary)|
|loki.loki|object|-|Loki server configuration|
|loki.loki.auth_enabled|bool|`false`|Enable authentication for Loki|
|loki.loki.commonConfig|object|-|Common configuration settings|
|loki.loki.commonConfig.replication_factor|int|`1`|Number of replicas for data replication|
|loki.loki.compactor|object|-|Compactor configuration|
|loki.loki.compactor.compaction_interval|string|`"60m"`|Interval between compaction runs|
|loki.loki.compactor.delete_request_store|string|`"filesystem"`|Store type for delete requests|
|loki.loki.compactor.retention_delete_delay|string|`"2h"`|Delay before deleting retained data|
|loki.loki.compactor.retention_delete_worker_count|int|`150`|Number of workers for deletion|
|loki.loki.compactor.retention_enabled|bool|`true`|Enable retention in compactor|
|loki.loki.compactor.working_directory|string|`"/var/loki/retention"`|Working directory for compactor|
|loki.loki.ingester|object|-|Ingester configuration|
|loki.loki.ingester.chunk_encoding|string|`"snappy"`|Chunk compression encoding|
|loki.loki.limits_config|object|-|Limits configuration|
|loki.loki.limits_config.allow_structured_metadata|bool|`true`|Allow structured metadata in logs|
|loki.loki.limits_config.cardinality_limit|int|`200000`|Cardinality limit for label combinations|
|loki.loki.limits_config.ingestion_burst_size_mb|int|`1000`|Ingestion burst size in MB|
|loki.loki.limits_config.ingestion_rate_mb|int|`1000`|Ingestion rate in MB per second|
|loki.loki.limits_config.max_entries_limit_per_query|int|`1000000`|Maximum entries limit per query|
|loki.loki.limits_config.max_global_streams_per_user|int|`10000`|Maximum global streams per user|
|loki.loki.limits_config.max_label_name_length|int|`10240`|Maximum label name length|
|loki.loki.limits_config.max_label_names_per_series|int|`300`|Maximum label names per series|
|loki.loki.limits_config.max_label_value_length|int|`20480`|Maximum label value length|
|loki.loki.limits_config.max_line_size|int|`100982429`|Maximum line size in bytes|
|loki.loki.limits_config.max_query_parallelism|int|`2`|Maximum parallelism for queries|
|loki.loki.limits_config.max_query_series|int|`10000`|Maximum number of series in a query|
|loki.loki.limits_config.per_stream_rate_limit|string|`"512M"`|Rate limit per stream|
|loki.loki.limits_config.per_stream_rate_limit_burst|string|`"1024M"`|Burst rate limit per stream|
|loki.loki.limits_config.reject_old_samples|bool|`true`|Reject samples older than max age|
|loki.loki.limits_config.reject_old_samples_max_age|string|`"24h"`|Maximum age for samples|
|loki.loki.limits_config.retention_period|string|`"168h"`|Log retention period|
|loki.loki.limits_config.split_queries_by_interval|string|`"15m"`|Interval for splitting queries|
|loki.loki.limits_config.volume_enabled|bool|`true`|Enable volume endpoints|
|loki.loki.pattern_receiver|object|-|Pattern receiver configuration for log pattern detection|
|loki.loki.pattern_receiver.enabled|bool|`true`|Enable pattern receiver|
|loki.loki.querier|object|-|Querier configuration|
|loki.loki.querier.max_concurrent|int|`2`|Maximum concurrent queries|
|loki.loki.schemaConfig|object|-|Schema configuration for index and chunks|
|loki.loki.schemaConfig.configs|list|-|List of schema configurations|
|loki.loki.schemaConfig.configs[0]|string|`{"from":"2024-04-01","index":{"period":"24h","prefix":"loki_index_"},"object_store":"filesystem","schema":"v13","store":"tsdb"}`|Schema start date|
|loki.loki.schemaConfig.configs[0].index|object|-|Index configuration|
|loki.loki.schemaConfig.configs[0].index.period|string|`"24h"`|Index rotation period|
|loki.loki.schemaConfig.configs[0].index.prefix|string|`"loki_index_"`|Index prefix for table names|
|loki.loki.schemaConfig.configs[0].object_store|string|`"filesystem"`|Object store type|
|loki.loki.schemaConfig.configs[0].schema|string|`"v13"`|Schema version|
|loki.loki.schemaConfig.configs[0].store|string|`"tsdb"`|Index store type|
|loki.loki.server|object|-|Server configuration|
|loki.loki.server.grpc_server_max_recv_msg_size|int|`100982429`|Maximum gRPC message receive size in bytes|
|loki.loki.server.grpc_server_max_send_msg_size|int|`100982429`|Maximum gRPC message send size in bytes|
|loki.loki.storage|object|-|Storage configuration|
|loki.loki.storage.type|string|`"filesystem"`|Storage backend type|
|loki.loki.tracing|object|-|Tracing configuration|
|loki.loki.tracing.enabled|bool|`true`|Enable tracing|
|loki.lokiCanary|object|-|Loki canary configuration for monitoring|
|loki.lokiCanary.enabled|bool|`false`|Enable Loki canary|
|loki.memcached|object|-|Memcached configuration|
|loki.memcached.image|object|-|Memcached image configuration|
|loki.memcached.image.repository|string|`"docker.io/library/memcached"`|Memcached image repository|
|loki.memcachedExporter|object|-|Memcached exporter configuration|
|loki.memcachedExporter.image|object|-|Memcached exporter image configuration|
|loki.memcachedExporter.image.repository|string|`"docker.io/prom/memcached-exporter"`|Memcached exporter image repository|
|loki.minio|object|-|MinIO configuration for object storage|
|loki.minio.enabled|bool|`false`|Enable MinIO deployment|
|loki.querier|object|-|Querier component configuration|
|loki.querier.replicas|int|`0`|Number of querier replicas (0 when using SingleBinary)|
|loki.queryFrontend|object|-|Query frontend component configuration|
|loki.queryFrontend.replicas|int|`0`|Number of query frontend replicas (0 when using SingleBinary)|
|loki.queryScheduler|object|-|Query scheduler component configuration|
|loki.queryScheduler.replicas|int|`0`|Number of query scheduler replicas (0 when using SingleBinary)|
|loki.read|object|-|Read component configuration|
|loki.read.replicas|int|`0`|Number of read replicas (0 when using SingleBinary)|
|loki.resultsCache|object|-|Results cache configuration|
|loki.resultsCache.enabled|bool|`false`|Enable results cache|
|loki.sidecar|object|-|Sidecar configuration for config reloading|
|loki.sidecar.image|object|-|Sidecar image configuration|
|loki.sidecar.image.repository|string|`"docker.io/kiwigrid/k8s-sidecar"`|The Docker registry and image for the k8s sidecar|
|loki.singleBinary|object|-|Single binary deployment configuration|
|loki.singleBinary.persistence|object|-|Persistent volume configuration|
|loki.singleBinary.persistence.size|string|`"10Gi"`|Size of persistent volume|
|loki.singleBinary.replicas|int|`1`|Number of replicas for single binary deployment|
|loki.singleBinary.resources|object|-|Resource requests and limits|
|loki.singleBinary.resources.limits.cpu|string|`"2400m"`|CPU limit for the Loki single-binary pods|
|loki.singleBinary.resources.limits.memory|string|`"2048Mi"`|Memory limit for the Loki single-binary pods|
|loki.singleBinary.resources.requests.cpu|string|`"400m"`|CPU request for the Loki single-binary pods|
|loki.singleBinary.resources.requests.memory|string|`"1024Mi"`|Memory request for the Loki single-binary pods|
|loki.test|object|-|Test configuration|
|loki.test.enabled|bool|`false`|Enable test pods|
|loki.write|object|-|Write component configuration|
|loki.write.replicas|int|`0`|Number of write replicas (0 when using SingleBinary)|
|metrics-server|object|-|Kubernetes Metrics Server configuration|
|metrics-server.enabled|bool|`false`|Enable metrics server deployment|
|metrics-server.fullnameOverride|string|`"metrics-server"`|String to fully override common.names.fullname (string)|
|metrics-server.image|object|-|Metrics server image configuration|
|metrics-server.image.repository|string|`"registry.k8s.io/metrics-server/metrics-server"`|Metrics server image repository|
|metrics-server.imagePullSecrets|list|-|Global Docker registry secret names as an array (list)|
|metrics-server.podLabels|object|-|Additional labels for metrics server pods|
|metrics-server.podLabels."kots.io/app-slug"|string|`"settlemint-atk"`|KOTS application slug applied to metrics server pods|
|metrics-server.resources|object|-|Resource requests and limits for metrics server pods|
|metrics-server.resources.limits.cpu|string|`"1200m"`|CPU limit for metrics server pods|
|metrics-server.resources.limits.memory|string|`"512Mi"`|Memory limit for metrics server pods|
|metrics-server.resources.requests.cpu|string|`"200m"`|CPU request reserved for metrics server pods|
|metrics-server.resources.requests.memory|string|`"256Mi"`|Memory request reserved for metrics server pods|
|metrics-server.server|object|-|Server configuration|
|metrics-server.server.persistentVolume|object|-|Persistent volume configuration|
|metrics-server.server.persistentVolume.enabled|bool|`false`|Enable persistent volume for metrics server|
|metrics-server.service|object|-|Service configuration|
|metrics-server.service.labels|object|-|Additional labels for metrics server service|
|metrics-server.service.labels."kots.io/app-slug"|string|`"settlemint-atk"`|KOTS application slug applied to the metrics server Service|
|prometheus-node-exporter|object|-|Prometheus Node Exporter configuration|
|prometheus-node-exporter.enabled|bool|`true`|Enable Prometheus Node Exporter deployment|
|prometheus-node-exporter.fullnameOverride|string|`"node-exporter"`|String to fully override common.names.fullname|
|prometheus-node-exporter.global|object|-|Global configuration|
|prometheus-node-exporter.global.imageRegistry|string|`"quay.io"`|Global image registry|
|prometheus-node-exporter.image|object|-|Node exporter image configuration|
|prometheus-node-exporter.image.registry|string|`"quay.io"`|Image registry for node exporter|
|prometheus-node-exporter.imagePullSecrets|list|-|Docker registry secret names as an array|
|prometheus-node-exporter.kubeRBACProxy|object|-|Kube RBAC proxy configuration|
|prometheus-node-exporter.kubeRBACProxy.image|object|-|Kube RBAC proxy image configuration|
|prometheus-node-exporter.kubeRBACProxy.image.registry|string|`"quay.io"`|Image registry for kube RBAC proxy|
|prometheus-node-exporter.nameOverride|string|`"node-exporter"`|String to partially override common.names.name|
|prometheus-node-exporter.podAnnotations|object|-|Annotations for node exporter pods|
|prometheus-node-exporter.podAnnotations."cluster-autoscaler.kubernetes.io/safe-to-evict"|string|`"true"`|Mark pod as safe to evict for cluster autoscaler|
|prometheus-node-exporter.podAnnotations."prometheus.io/port"|string|`"9100"`|Port for Prometheus scraping|
|prometheus-node-exporter.podAnnotations."prometheus.io/scrape"|string|`"true"`|Enable Prometheus scraping|
|prometheus-node-exporter.podLabels|object|-|Labels for node exporter pods|
|prometheus-node-exporter.podLabels."kots.io/app-slug"|string|`"settlemint-atk"`|KOTS application slug identifier|
|tempo|object|-|Tempo configuration|
|tempo.enabled|bool|`true`|Enable Tempo deployment|
|tempo.fullnameOverride|string|`"tempo"`|String to fully override common.names.fullname|
|tempo.persistence|object|-|Persistent volume configuration|
|tempo.persistence.enabled|bool|`true`|Enable persistent volume for Tempo|
|tempo.persistence.size|string|`"10Gi"`|Size of persistent volume|
|tempo.podAnnotations|object|-|Annotations for Tempo pods|
|tempo.podAnnotations."prometheus.io/path"|string|`"/metrics"`|Path for Prometheus metrics endpoint|
|tempo.podAnnotations."prometheus.io/port"|string|`"3100"`|Port for Prometheus scraping|
|tempo.podAnnotations."prometheus.io/scrape"|string|`"true"`|Enable Prometheus scraping|
|tempo.podLabels|object|-|Labels for Tempo pods|
|tempo.podLabels."kots.io/app-slug"|string|`"settlemint-atk"`|KOTS application slug identifier|
|tempo.securityContext|object|-|Security context for Tempo pods|
|tempo.securityContext.fsGroup|int|`65532`|Filesystem group ID|
|tempo.securityContext.runAsGroup|int|`65532`|Group ID to run as|
|tempo.securityContext.runAsNonRoot|bool|`true`|Run as non-root user|
|tempo.securityContext.runAsUser|int|`65532`|User ID to run as|
|tempo.tempo|object|-|Tempo server configuration|
|tempo.tempo.metricsGenerator|object|-|Metrics generator configuration|
|tempo.tempo.metricsGenerator.enabled|bool|`true`|Enable metrics generator|
|tempo.tempo.metricsGenerator.remoteWriteUrl|string|`"http://o11y-metrics:8428/api/v1/write"`|Remote write URL for generated metrics|
|tempo.tempo.overrides|object|-|Per-tenant overrides configuration|
|tempo.tempo.overrides.defaults|object|-|Default overrides for all tenants|
|tempo.tempo.overrides.defaults.global|object|-|Global configuration|
|tempo.tempo.overrides.defaults.global.max_bytes_per_trace|int|`20000000`|Maximum bytes per trace|
|tempo.tempo.overrides.defaults.ingestion|object|-|Ingestion configuration|
|tempo.tempo.overrides.defaults.ingestion.max_traces_per_user|int|`100000`|Maximum traces per user|
|tempo.tempo.overrides.defaults.ingestion.rate_limit_bytes|int|`30000000`|Rate limit in bytes per second|
|tempo.tempo.pullSecrets|list|-|Docker registry secret names as an array|
|tempo.tempo.reportingEnabled|bool|`false`|Enable usage reporting to Grafana Labs|
|tempo.tempo.repository|string|`"docker.io/grafana/tempo"`|Tempo image repository|
|tempo.tempo.resources|object|-|Resource requests and limits for Tempo pods|
|tempo.tempo.resources.limits.cpu|string|`"720m"`|CPU limit for Tempo pods|
|tempo.tempo.resources.limits.memory|string|`"384Mi"`|Memory limit for Tempo pods|
|tempo.tempo.resources.requests.cpu|string|`"100m"`|CPU request reserved for Tempo pods|
|tempo.tempo.resources.requests.memory|string|`"192Mi"`|Memory request reserved for Tempo pods|
|tempo.tempo.retention|string|`"168h"`|Trace retention period|
|tempo.tempoQuery|object|-|Tempo query configuration|
|tempo.tempoQuery.ingress|object|-|Ingress configuration for Tempo query|
|tempo.tempoQuery.ingress.annotations|object|-|Ingress annotations|
|tempo.tempoQuery.ingress.annotations."nginx.ingress.kubernetes.io/auth-type"|string|`"basic"`|Authentication type for ingress|
|tempo.tempoQuery.ingress.annotations."nginx.ingress.kubernetes.io/client-body-buffer-size"|string|`"500m"`|Buffer size for reading client request body|
|tempo.tempoQuery.ingress.annotations."nginx.ingress.kubernetes.io/proxy-body-size"|string|`"500m"`|Maximum allowed size of client request body|
|tempo.tempoQuery.ingress.annotations."nginx.ingress.kubernetes.io/proxy-read-timeout"|string|`"3600"`|Timeout for reading a response from proxied server|
|tempo.tempoQuery.ingress.annotations."nginx.ingress.kubernetes.io/proxy-send-timeout"|string|`"3600"`|Timeout for transmitting a request to proxied server|
|tempo.tempoQuery.ingress.enabled|bool|`false`|Enable ingress for Tempo query|
|tempo.tempoQuery.ingress.hosts|list|-|List of ingress hosts|
|tempo.tempoQuery.ingress.hosts[0]|string|`"traces.k8s.orb.local"`|Host name for Tempo query ingress|
|tempo.tempoQuery.ingress.ingressClassName|string|`"atk-nginx"`|Ingress class name|
|tempo.tempoQuery.ingress.pathType|string|`"Prefix"`|Path type for ingress rule|
|tempo.tempoQuery.pullSecrets|list|-|Docker registry secret names as an array|
|tempo.tempoQuery.repository|string|`"docker.io/grafana/tempo-query"`|Tempo query image repository|
|tempo.tempoQuery.resources|object|-|Resource requests and limits for Tempo query pods|
|tempo.tempoQuery.resources.limits.cpu|string|`"600m"`|CPU limit for Tempo query pods|
|tempo.tempoQuery.resources.limits.memory|string|`"256Mi"`|Memory limit for Tempo query pods|
|tempo.tempoQuery.resources.requests.cpu|string|`"100m"`|CPU request reserved for Tempo query pods|
|tempo.tempoQuery.resources.requests.memory|string|`"128Mi"`|Memory request reserved for Tempo query pods|
|victoria-metrics-single|object|-|Victoria Metrics Single configuration|
|victoria-metrics-single.enabled|bool|`true`|Enable Victoria Metrics Single deployment|
|victoria-metrics-single.global|object|-|Global configuration|
|victoria-metrics-single.global.image|object|-|Global image configuration|
|victoria-metrics-single.global.image.registry|string|`"docker.io"`|Global image registry|
|victoria-metrics-single.global.imagePullSecrets|list|-|Global Docker registry secret names as an array (list)|
|victoria-metrics-single.server|object|-|Victoria Metrics server configuration|
|victoria-metrics-single.server.extraArgs|object|-|Extra arguments for Victoria Metrics server|
|victoria-metrics-single.server.extraArgs."search.maxQueryLen"|int|`163840`|Maximum query length|
|victoria-metrics-single.server.fullnameOverride|string|`"metrics"`|String to fully override common.names.fullname (string)|
|victoria-metrics-single.server.ingress|object|-|Ingress configuration for Victoria Metrics|
|victoria-metrics-single.server.ingress.annotations|object|-|Ingress annotations|
|victoria-metrics-single.server.ingress.annotations."nginx.ingress.kubernetes.io/auth-realm"|string|`"Authentication Required - Metrics"`|Authentication realm message|
|victoria-metrics-single.server.ingress.annotations."nginx.ingress.kubernetes.io/auth-secret"|string|`"observability-metrics"`|Secret name for basic authentication|
|victoria-metrics-single.server.ingress.annotations."nginx.ingress.kubernetes.io/auth-type"|string|`"basic"`|Authentication type for ingress|
|victoria-metrics-single.server.ingress.annotations."nginx.ingress.kubernetes.io/client-body-buffer-size"|string|`"500m"`|Buffer size for reading client request body|
|victoria-metrics-single.server.ingress.annotations."nginx.ingress.kubernetes.io/proxy-body-size"|string|`"500m"`|Maximum allowed size of client request body|
|victoria-metrics-single.server.ingress.annotations."nginx.ingress.kubernetes.io/proxy-read-timeout"|string|`"3600"`|Timeout for reading a response from proxied server|
|victoria-metrics-single.server.ingress.annotations."nginx.ingress.kubernetes.io/proxy-send-timeout"|string|`"3600"`|Timeout for transmitting a request to proxied server|
|victoria-metrics-single.server.ingress.enabled|bool|`false`|Enable ingress for Victoria Metrics|
|victoria-metrics-single.server.ingress.hosts|list|-|List of ingress hosts|
|victoria-metrics-single.server.ingress.hosts[0]|string|`{"name":"metrics.settlemint.local","path":"/","port":"http"}`|Host name for ingress|
|victoria-metrics-single.server.ingress.hosts[0].path|string|`"/"`|Path for ingress rule|
|victoria-metrics-single.server.ingress.hosts[0].port|string|`"http"`|Service port name|
|victoria-metrics-single.server.ingress.ingressClassName|string|`"atk-nginx"`|Ingress class name|
|victoria-metrics-single.server.ingress.pathType|string|`"Prefix"`|Path type for ingress rule|
|victoria-metrics-single.server.persistentVolume|object|-|Persistent volume configuration|
|victoria-metrics-single.server.persistentVolume.size|string|`"10Gi"`|Size of the persistent volume|
|victoria-metrics-single.server.persistentVolume.storageClass|string|`""`|Storage class for persistent volume (uses default if empty)|
|victoria-metrics-single.server.podAnnotations|object|-|Annotations for Victoria Metrics pods|
|victoria-metrics-single.server.podAnnotations."prometheus.io/path"|string|`"/metrics"`|Path for Prometheus metrics endpoint|
|victoria-metrics-single.server.podAnnotations."prometheus.io/port"|string|`"8428"`|Port for Prometheus scraping|
|victoria-metrics-single.server.podAnnotations."prometheus.io/scrape"|string|`"true"`|Enable Prometheus scraping|
|victoria-metrics-single.server.podLabels|object|-|Additional labels for Victoria Metrics pods|
|victoria-metrics-single.server.podLabels."kots.io/app-slug"|string|`"settlemint-atk"`|KOTS application slug identifier|
|victoria-metrics-single.server.resources|object|-|Resource requests and limits for Victoria Metrics server|
|victoria-metrics-single.server.retentionPeriod|int|`1`|Data retention period in months|
|victoria-metrics-single.server.service|object|-|Service configuration|
|victoria-metrics-single.server.service.annotations|object|-|Annotations for Victoria Metrics service|
|victoria-metrics-single.server.service.annotations."prometheus.io/path"|string|`"/metrics"`|Path for Prometheus metrics endpoint|
|victoria-metrics-single.server.service.annotations."prometheus.io/port"|string|`"8428"`|Port for Prometheus scraping|
|victoria-metrics-single.server.service.annotations."prometheus.io/scrape"|string|`"true"`|Enable Prometheus scraping|
|victoria-metrics-single.server.service.labels|object|-|Labels for Victoria Metrics service|
|victoria-metrics-single.server.service.labels."kots.io/app-slug"|string|`"settlemint-atk"`|KOTS application slug identifier|

## Resource Summary

| Component | Replicas | Request CPU | Limit CPU | Request Memory | Limit Memory | Storage |
|-----------|----------|-------------|-----------|----------------|--------------|---------|
| alloy.alloy | 1 | 200m | 2400m | 512Mi | 1024Mi | - |
| alloy.grafana | 1 | 180m | 1080m | 384Mi | 768Mi | 1Gi |
| loki.singleBinary | 1 | 400m | 2400m | 1024Mi | 2048Mi | 10Gi |
| metrics-server | 1 | 200m | 1200m | 256Mi | 512Mi | - |
| tempo | 1 | - | - | - | - | 10Gi |
| tempo.tempo | 1 | 100m | 720m | 192Mi | 384Mi | - |
| tempo.tempoQuery | 1 | 100m | 600m | 128Mi | 256Mi | - |
| victoria-metrics-single.server | 1 | - | - | - | - | 10Gi |
| **Totals** | - | 1.18 cores (1180m) | 8.40 cores (8400m) | 2496Mi (2.44Gi) | 4992Mi (4.88Gi) | 31744Mi (31.00Gi) |

## Maintainers

| Name | Email | Url |
| ---- | ------ | --- |
| SettleMint | <support@settlemint.com> | <https://settlemint.com> |

## Requirements

| Repository | Name | Version |
|------------|------|---------|
| https://grafana.github.io/helm-charts | alloy | 1.3.0 |
| https://grafana.github.io/helm-charts | grafana | 10.1.0 |
| https://grafana.github.io/helm-charts | loki | 6.42.0 |
| https://grafana.github.io/helm-charts | tempo | 1.23.3 |
| https://kubernetes-sigs.github.io/metrics-server/ | metrics-server | 3.13.0 |
| https://prometheus-community.github.io/helm-charts | kube-state-metrics | 6.3.0 |
| https://prometheus-community.github.io/helm-charts | prometheus-node-exporter | 4.48.0 |
| https://victoriametrics.github.io/helm-charts/ | victoria-metrics-single | 0.25.1 |

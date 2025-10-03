{{/*
Expand the name of the chart.
Uses common ATK helper for consistency.
*/}}
{{- define "graph-node.name" -}}
{{- include "atk.common.name" . }}
{{- end }}

{{/*
Create a default fully qualified app name.
Uses common ATK helper for consistency.
*/}}
{{- define "graph-node.fullname" -}}
{{- include "atk.common.fullname" . }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
Uses common ATK helper for consistency.
*/}}
{{- define "graph-node.chart" -}}
{{- include "atk.common.chart" . }}
{{- end }}

{{/*
Common labels
Uses common ATK helper for consistency.
*/}}
{{- define "graph-node.labels" -}}
{{- include "atk.common.labels" . }}
{{- end }}

{{/*
Selector labels
Uses common ATK helper for consistency.
*/}}
{{- define "graph-node.selectorLabels" -}}
{{- include "atk.common.selectorLabels" . }}
{{- end }}

{{/*
Create the name of the service account to use
Uses common ATK helper for consistency.
*/}}
{{- define "graph-node.serviceAccountName" -}}
{{- include "atk.common.serviceAccountName" . }}
{{- end }}

{{/*
Return the proper image name for the init container
*/}}
{{- define "graph-node.initContainerImage" -}}
{{- printf "%s:%s" .Values.initContainer.image.repository .Values.initContainer.image.tag }}
{{- end }}

{{/*
Return the proper image name
*/}}
{{- define "graph-node.image" -}}
{{- $tag := .Values.image.tag | default .Chart.AppVersion }}
{{- printf "%s:%s" .Values.image.repository $tag }}
{{- end }}

{{/*
Return image pull secrets
Uses common ATK helper for consistency.
*/}}
{{- define "graph-node.imagePullSecrets" -}}
{{- include "atk.common.imagePullSecrets" . }}
{{- end }}

{{/*
Return the config template
*/}}
{{- define "graph-node.config" -}}
{{- tpl .Values.configTemplate . }}
{{- end }}

{{/*
Return the PostgreSQL secret name
*/}}
{{- define "graph-node.pgSecretName" -}}
{{- printf "%s-pg-secret" (include "graph-node.fullname" .) }}
{{- end }}

{{/*
Resolve the endpoint host:port string for the IPFS cluster proxy dependency.
Allows overriding via initContainer.tcpCheck.ipfsClusterProxy.{endpoint,host,port} values.
*/}}
{{- define "graph-node.ipfsClusterProxyEndpoint" -}}
{{- $ctx := .context | default . -}}
{{- $initContainer := $ctx.Values.initContainer | default (dict) -}}
{{- $tcpCheck := index $initContainer "tcpCheck" | default (dict) -}}
{{- $proxy := index $tcpCheck "ipfsClusterProxy" | default (dict) -}}
{{- $enabled := true -}}
{{- if hasKey $proxy "enabled" -}}
  {{- $enabled = index $proxy "enabled" -}}
{{- end -}}
{{- if $enabled -}}
  {{- $endpoint := "" -}}
  {{- if hasKey $proxy "endpoint" -}}
    {{- $endpoint = index $proxy "endpoint" -}}
  {{- end -}}
  {{- if not $endpoint -}}
    {{- $host := default "ipfs-cluster" (index $proxy "host") -}}
    {{- $port := default 9095 (index $proxy "port") -}}
    {{- $endpoint = printf "%s:%v" $host $port -}}
  {{- end -}}
  {{- tpl (toString $endpoint) $ctx -}}
{{- end -}}
{{- end }}

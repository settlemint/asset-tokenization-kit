{{/*
Expand the name of the chart.
*/}}
{{- define "redis.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
*/}}
{{- define "redis.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "redis.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "redis.labels" -}}
helm.sh/chart: {{ include "redis.chart" . }}
{{ include "redis.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "redis.selectorLabels" -}}
app.kubernetes.io/name: {{ include "redis.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Return the proper Redis image name
*/}}
{{- define "redis.image" -}}
{{- $registry := .Values.image.registry -}}
{{- if .Values.global.imageRegistry -}}
    {{- $registry = .Values.global.imageRegistry -}}
{{- end -}}
{{- $repository := .Values.image.repository -}}
{{- $tag := .Values.image.tag -}}
{{- printf "%s/%s:%s" $registry $repository $tag -}}
{{- end -}}

{{/*
Merge pod-level security context defaults with chart overrides.
OpenShift-managed workloads need to avoid pinning runAs fields unless explicitly set.
*/}}
{{- define "redis.securityContext.pod" -}}
{{ include "atk.securityContext.pod" (dict "context" (.context | default .) "local" (default (dict) (.context | default .).Values.podSecurityContext)) }}
{{- end }}

{{/*
Merge container-level security context defaults with chart overrides.
Only keep runAs overrides when the chart values request them explicitly.
*/}}
{{- define "redis.securityContext.container" -}}
{{ include "atk.securityContext.container" (dict "context" (.context | default .) "local" (default (dict) (.context | default .).Values.containerSecurityContext)) }}
{{- end }}

{{/*
Expand the name of the chart.
*/}}
{{- define "postgresql.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "postgresql.fullname" -}}
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
{{- define "postgresql.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "postgresql.labels" -}}
helm.sh/chart: {{ include "postgresql.chart" . }}
{{ include "postgresql.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- with .Values.commonLabels }}
{{ toYaml . }}
{{- end }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "postgresql.selectorLabels" -}}
app.kubernetes.io/name: {{ include "postgresql.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "postgresql.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "postgresql.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
PostgreSQL connection string
*/}}
{{- define "postgresql.connectionString" -}}
postgresql://{{ .Values.postgresql.username }}:{{ .Values.postgresql.password }}@{{ include "postgresql.fullname" . }}:{{ .Values.service.port }}/{{ .Values.postgresql.database }}
{{- end }}

{{/*
PostgreSQL host
*/}}
{{- define "postgresql.host" -}}
{{ include "postgresql.fullname" . }}
{{- end }}

{{/*
PostgreSQL port
*/}}
{{- define "postgresql.port" -}}
{{ .Values.service.port }}
{{- end }}

{{/*
Merge pod-level security context defaults with chart overrides.
*/}}
{{- define "postgresql.securityContext.pod" -}}
{{- $ctx := .context | default . -}}
{{ include "atk.securityContext.pod" (dict "context" $ctx "local" (default (dict) $ctx.Values.podSecurityContext)) }}
{{- end }}

{{/*
Merge container-level security context defaults with chart overrides.
*/}}
{{- define "postgresql.securityContext.container" -}}
{{- $ctx := .context | default . -}}
{{ include "atk.securityContext.container" (dict "context" $ctx "local" (default (dict) $ctx.Values.securityContext)) }}
{{- end }}
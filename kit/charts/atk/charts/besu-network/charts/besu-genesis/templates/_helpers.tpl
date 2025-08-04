{{/* vim: set filetype=mustache: */}}
{{/*
Expand the name of the chart.
*/}}
{{- define "besu-genesis.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "besu-genesis.fullname" -}}
{{- $name := default .Chart.Name -}}
{{- if contains $name .Release.Name -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" $name .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}


{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "besu-genesis.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Common labels
*/}}
{{- define "besu-genesis.labels" -}}
helm.sh/chart: {{ include "besu-genesis.chart" . }}
app.kubernetes.io/name: {{ include "besu-genesis.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- if .Values.global }}
{{- if .Values.global.labels }}
{{ toYaml .Values.global.labels }}
{{- end }}
{{- end }}
{{- end -}}

{{/*
Selector labels
*/}}
{{- define "besu-genesis.selectorLabels" -}}
app.kubernetes.io/name: {{ include "besu-genesis.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}

{{/*
Create the name of the service account to use
*/}}
{{- define "besu-genesis.serviceAccountName" -}}
{{- if and (eq .Values.cluster.provider "azure") (.Values.cluster.cloudNativeServices) }}
{{- .Values.azure.serviceAccountName }}
{{- else if and (eq .Values.cluster.provider "aws") (.Values.cluster.cloudNativeServices) }}
{{- .Values.aws.serviceAccountName }}
{{- else }}
{{- include "besu-genesis.name" . }}-sa
{{- end }}
{{- end }}

{{/*
Common image pull secrets for all deployments/statefulsets
This is now handled by atk.common.imagePullSecrets in _common-helpers.tpl
*/}}
{{- define "atk.imagePullSecrets" -}}
{{- include "atk.common.imagePullSecrets" . -}}
{{- end }}


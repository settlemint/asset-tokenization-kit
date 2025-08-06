{{/* vim: set filetype=mustache: */}}
{{/*
Expand the name of the chart.
*/}}
{{- define "besu-node.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "besu-node.fullname" -}}
{{- $name := default .Chart.Name -}}
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else if contains $name .Release.Name -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" $name .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}


{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "besu-node.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Common labels
*/}}
{{- define "besu-node.labels" -}}
{{- if and (eq .Values.cluster.provider "azure") (.Values.cluster.cloudNativeServices) }}
azure.workload.identity/use: "true"
{{- end }}
app.kubernetes.io/name: besu-statefulset
app.kubernetes.io/component: besu
app.kubernetes.io/part-of: {{ include "besu-node.fullname" . }}
app.kubernetes.io/namespace: {{ .Release.Namespace }}
app.kubernetes.io/release: {{ .Release.Name }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/managed-by: helm
{{- if .Values.global.labels }}
{{ toYaml .Values.global.labels }}
{{- end }}
{{- range $labelName, $labelValue := .Values.node.besu.customLabels }}
{{ $labelName }}: {{ $labelValue }}
{{- end }}
{{- end -}}

{{/*
Common image pull secrets for all deployments/statefulsets
This is now handled by atk.common.imagePullSecrets in _common-helpers.tpl
*/}}
{{- define "atk.imagePullSecrets" -}}
{{- include "atk.common.imagePullSecrets" . -}}
{{- end }}

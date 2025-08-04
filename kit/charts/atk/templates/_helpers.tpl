{{/*
Expand the name of the chart.
*/}}
{{- define "atk.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "atk.fullname" -}}
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
{{- define "atk.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "atk.labels" -}}
helm.sh/chart: {{ include "atk.chart" . }}
{{ include "atk.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- if .Values.global.labels }}
{{- range $key, $value := .Values.global.labels }}
{{ $key }}: {{ $value | quote }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "atk.selectorLabels" -}}
app.kubernetes.io/name: {{ include "atk.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "atk.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "atk.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{- define "atk.imagePullSecretName" -}}
{{- printf "image-pull-secret-%s" . -}}
{{- end -}}

{{/*
Creates an image pull secret value
*/}}
{{- define "atk.imagePullSecret" }}
{{- printf "{\"auths\":{\"%s\":{\"username\":\"%s\",\"password\":\"%s\",\"email\":\"%s\",\"auth\":\"%s\"}}}" .registry .username .password .email (printf "%s:%s" .username .password | b64enc) | b64enc }}
{{- end }}

{{/*
Common annotations
*/}}
{{- define "atk.annotations" -}}
{{- if .Values.global.annotations }}
{{- toYaml .Values.global.annotations }}
{{- end }}
{{- end }}

{{/*
Common image pull secrets for all deployments/statefulsets
*/}}
{{- define "atk.imagePullSecrets" -}}
{{- if .Values.global }}
{{- if .Values.global.imagePullSecrets }}
imagePullSecrets:
{{- range .Values.global.imagePullSecrets }}
  - name: {{ . }}
{{- end }}
{{- else }}
imagePullSecrets:
  - name: image-pull-secret-docker
  - name: image-pull-secret-ghcr
  - name: image-pull-secret-harbor
{{- end }}
{{- else }}
imagePullSecrets:
  - name: image-pull-secret-docker
  - name: image-pull-secret-ghcr
  - name: image-pull-secret-harbor
{{- end }}
{{- end }}

{{/*
Common image pull secrets list (without the key, for flexible usage)
*/}}
{{- define "atk.imagePullSecretsList" -}}
{{- if .Values.global }}
{{- if .Values.global.imagePullSecrets }}
{{- range .Values.global.imagePullSecrets }}
- name: {{ . }}
{{- end }}
{{- else }}
- name: image-pull-secret-docker
- name: image-pull-secret-ghcr
- name: image-pull-secret-harbor
{{- end }}
{{- else }}
- name: image-pull-secret-docker
- name: image-pull-secret-ghcr
- name: image-pull-secret-harbor
{{- end }}
{{- end }}

{{/*
Extract domain from a hostname (e.g., "hasura.k8s.orb.local" -> "k8s.orb.local")
*/}}
{{- define "atk.extractDomain" -}}
{{- $parts := splitList "." .url -}}
{{- if gt (len $parts) 1 -}}
{{- $domain := slice $parts 1 | join "." -}}
{{- $domain -}}
{{- else -}}
{{- .url -}}
{{- end -}}
{{- end -}}
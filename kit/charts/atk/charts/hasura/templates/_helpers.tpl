{{/*
Expand the name of the chart.
*/}}
{{- define "hasura.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "hasura.fullname" -}}
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
{{- define "hasura.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "hasura.labels" -}}
helm.sh/chart: {{ include "hasura.chart" . }}
{{ include "hasura.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- with .Values.global.labels }}
{{ toYaml . }}
{{- end }}
{{- with .Values.labels }}
{{ toYaml . }}
{{- end }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "hasura.selectorLabels" -}}
app.kubernetes.io/name: {{ include "hasura.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "hasura.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "hasura.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Create the name of the secret
*/}}
{{- define "hasura.secretName" -}}
{{- if .Values.adminSecret.existingSecret }}
{{- .Values.adminSecret.existingSecret }}
{{- else }}
{{- include "hasura.fullname" . }}
{{- end }}
{{- end }}

{{/*
Get the admin secret key
*/}}
{{- define "hasura.adminSecretKey" -}}
{{- if .Values.adminSecret.key }}
{{- .Values.adminSecret.key }}
{{- else }}
{{- randAlphaNum 32 }}
{{- end }}
{{- end }}

{{/*
Return the proper Docker image registry
*/}}
{{- define "hasura.image" -}}
{{- $registryName := .Values.image.registry -}}
{{- $repositoryName := .Values.image.repository -}}
{{- $tag := .Values.image.tag | toString -}}
{{- if $registryName }}
{{- printf "%s/%s:%s" $registryName $repositoryName $tag -}}
{{- else }}
{{- printf "%s:%s" $repositoryName $tag -}}
{{- end }}
{{- end }}

{{/*
Get security context for pod
*/}}
{{- define "hasura.podSecurityContext" -}}
{{- if .Values.global -}}
{{- if .Values.global.securityContexts -}}
{{- if .Values.global.securityContexts.pod -}}
{{- toYaml .Values.global.securityContexts.pod -}}
{{- else if .Values.podSecurityContext -}}
{{- toYaml .Values.podSecurityContext -}}
{{- end -}}
{{- else if .Values.podSecurityContext -}}
{{- toYaml .Values.podSecurityContext -}}
{{- end -}}
{{- else if .Values.podSecurityContext -}}
{{- toYaml .Values.podSecurityContext -}}
{{- end -}}
{{- end -}}

{{/*
Get security context for container
*/}}
{{- define "hasura.containerSecurityContext" -}}
{{- if .Values.global -}}
{{- if .Values.global.securityContexts -}}
{{- if .Values.global.securityContexts.container -}}
{{- toYaml .Values.global.securityContexts.container -}}
{{- else if .Values.securityContext -}}
{{- toYaml .Values.securityContext -}}
{{- end -}}
{{- else if .Values.securityContext -}}
{{- toYaml .Values.securityContext -}}
{{- end -}}
{{- else if .Values.securityContext -}}
{{- toYaml .Values.securityContext -}}
{{- end -}}
{{- end -}}
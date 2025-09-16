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
This is now handled by atk.common.imagePullSecrets in _common-helpers.tpl
*/}}
{{- define "atk.imagePullSecrets" -}}
{{- include "atk.common.imagePullSecrets" . -}}
{{- end }}

{{/*
Common image pull secrets list (without the key, for flexible usage)
*/}}
{{- define "atk.imagePullSecretsList" -}}
{{- $root := . -}}
{{- $secrets := list -}}
{{- $credentials := .Values.imagePullCredentials | default .Values.global.imagePullCredentials -}}
{{- if $credentials -}}
  {{- if $credentials.registries -}}
    {{- range $name, $registry := $credentials.registries -}}
      {{- if $registry.enabled -}}
        {{- $secrets = append $secrets (printf "image-pull-secret-%s" $name) -}}
      {{- end -}}
    {{- end -}}
  {{- end -}}
{{- else if .Values.global -}}
  {{- if .Values.global.imagePullSecrets -}}
    {{- $secrets = .Values.global.imagePullSecrets -}}
  {{- end -}}
{{- end -}}
{{- if .Values.imagePullSecrets -}}
  {{- $secrets = .Values.imagePullSecrets -}}
{{- end -}}
{{- range $secrets }}
- name: {{ . }}
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

{{/*
Shared PostgreSQL helpers.
*/}}
{{- define "atk.postgresql.host" -}}
{{- $global := .Values.global | default (dict) -}}
{{- $pg := $global.postgresql | default (dict) -}}
{{- default "postgresql" $pg.host -}}
{{- end -}}

{{- define "atk.postgresql.port" -}}
{{- $global := .Values.global | default (dict) -}}
{{- $pg := $global.postgresql | default (dict) -}}
{{- printf "%v" (default 5432 $pg.port) -}}
{{- end -}}

{{- define "atk.postgresql.sslMode" -}}
{{- $global := .Values.global | default (dict) -}}
{{- $pg := $global.postgresql | default (dict) -}}
{{- default "disable" $pg.sslMode -}}
{{- end -}}

{{- define "atk.postgresql.endpoint" -}}
{{- printf "%s:%s" (include "atk.postgresql.host" .) (include "atk.postgresql.port" .) -}}
{{- end -}}

{{- define "atk.postgresql.url" -}}
{{- $ctx := .context -}}
{{- $username := .username -}}
{{- $password := .password -}}
{{- $database := .database -}}
{{- $sslMode := .sslMode | default (include "atk.postgresql.sslMode" $ctx) -}}
{{- printf "postgresql://%s:%s@%s/%s?sslmode=%s" $username $password (include "atk.postgresql.endpoint" $ctx) $database $sslMode -}}
{{- end -}}

{{/*
Shared Redis helpers.
*/}}
{{- define "atk.redis.host" -}}
{{- $global := .Values.global | default (dict) -}}
{{- $redis := $global.redis | default (dict) -}}
{{- default "redis" $redis.host -}}
{{- end -}}

{{- define "atk.redis.port" -}}
{{- $global := .Values.global | default (dict) -}}
{{- $redis := $global.redis | default (dict) -}}
{{- printf "%v" (default 6379 $redis.port) -}}
{{- end -}}

{{- define "atk.redis.username" -}}
{{- $global := .Values.global | default (dict) -}}
{{- $redis := $global.redis | default (dict) -}}
{{- default "default" $redis.username -}}
{{- end -}}

{{- define "atk.redis.password" -}}
{{- $global := .Values.global | default (dict) -}}
{{- $redis := $global.redis | default (dict) -}}
{{- default "atk" $redis.password -}}
{{- end -}}

{{- define "atk.redis.address" -}}
{{- printf "%s:%s" (include "atk.redis.host" .) (include "atk.redis.port" .) -}}
{{- end -}}

{{- define "atk.redis.url" -}}
{{- printf "redis://%s:%s@%s" (include "atk.redis.username" .) (include "atk.redis.password" .) (include "atk.redis.address" .) -}}
{{- end -}}

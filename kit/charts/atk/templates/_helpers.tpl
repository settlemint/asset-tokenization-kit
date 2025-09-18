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
Merge datastore defaults and overrides following the security context helper pattern.
Parameters:
- context: root context
- type: datastore identifier (e.g., "redis", "postgresql")
- chartKey: optional global.datastores.<chartKey> override lookup
- legacyKey: optional global.<legacyKey>.datastores fallback (defaults to chartKey)
- local: chart-level overrides
*/}}
{{- define "atk.datastores.merge" -}}
{{- $context := .context | default . -}}
{{- $type := lower (default "" .type) -}}
{{- $chartKey := default "" .chartKey -}}
{{- $legacyKey := default $chartKey .legacyKey -}}
{{- $local := default (dict) .local -}}
{{- $values := list -}}
{{- $global := $context.Values.global | default (dict) -}}
{{- if and (ne $type "") (hasKey $global "datastores") -}}
  {{- $datastores := index $global "datastores" | default (dict) -}}
  {{- if hasKey $datastores "default" -}}
    {{- $defaults := index $datastores "default" | default (dict) -}}
    {{- if and $defaults (hasKey $defaults $type) -}}
      {{- $values = append $values (index $defaults $type) -}}
    {{- end -}}
  {{- end -}}
  {{- if and (ne $chartKey "") (hasKey $datastores $chartKey) -}}
    {{- $chartOverrides := index $datastores $chartKey | default (dict) -}}
    {{- if and $chartOverrides (hasKey $chartOverrides $type) -}}
      {{- $values = append $values (index $chartOverrides $type) -}}
    {{- end -}}
  {{- end -}}
{{- end -}}
{{- if and (ne $legacyKey "") (hasKey $global $legacyKey) -}}
  {{- $legacyChart := index $global $legacyKey | default (dict) -}}
  {{- if and $legacyChart (hasKey $legacyChart "datastores") -}}
    {{- $legacyStores := index $legacyChart "datastores" | default (dict) -}}
    {{- if and $legacyStores (hasKey $legacyStores $type) -}}
      {{- $values = append $values (index $legacyStores $type) -}}
    {{- end -}}
  {{- end -}}
{{- end -}}
{{- if eq $type "redis" -}}
  {{- if and (hasKey $global "redis") (kindIs "map" (index $global "redis")) -}}
    {{- $values = append $values (index $global "redis") -}}
  {{- end -}}
{{- else if eq $type "postgresql" -}}
  {{- if and (hasKey $global "postgresql") (kindIs "map" (index $global "postgresql")) -}}
    {{- $values = append $values (index $global "postgresql") -}}
  {{- end -}}
{{- end -}}
{{- $values = append $values $local -}}
{{- $merged := include "common.tplvalues.merge" (dict "values" $values "context" $context) -}}
{{- if $merged -}}
{{- $merged -}}
{{- else -}}
{{- toYaml dict -}}
{{- end -}}
{{- end -}}

{{- define "atk.datastores.redis" -}}
{{ include "atk.datastores.merge" (dict "context" (.context | default .) "type" "redis" "chartKey" (default "" .chartKey) "legacyKey" (default "" .legacyKey) "local" (default (dict) .local)) }}
{{- end -}}

{{- define "atk.datastores.postgresql" -}}
{{ include "atk.datastores.merge" (dict "context" (.context | default .) "type" "postgresql" "chartKey" (default "" .chartKey) "legacyKey" (default "" .legacyKey) "local" (default (dict) .local)) }}
{{- end -}}

{{/*
Shared PostgreSQL helpers.
*/}}
{{- define "atk.postgresql.host" -}}
{{- $ctx := .context | default . -}}
{{- $chartKey := default "" .chartKey -}}
{{- $local := default (dict) .local -}}
{{- $config := ((include "atk.datastores.postgresql" (dict "context" $ctx "chartKey" $chartKey "local" $local)) | fromYaml) | default (dict) -}}
{{- default "postgresql" (index $config "host") -}}
{{- end -}}

{{- define "atk.postgresql.port" -}}
{{- $ctx := .context | default . -}}
{{- $chartKey := default "" .chartKey -}}
{{- $local := default (dict) .local -}}
{{- $config := ((include "atk.datastores.postgresql" (dict "context" $ctx "chartKey" $chartKey "local" $local)) | fromYaml) | default (dict) -}}
{{- printf "%v" (default 5432 (index $config "port")) -}}
{{- end -}}

{{- define "atk.postgresql.sslMode" -}}
{{- $ctx := .context | default . -}}
{{- $chartKey := default "" .chartKey -}}
{{- $local := default (dict) .local -}}
{{- $config := ((include "atk.datastores.postgresql" (dict "context" $ctx "chartKey" $chartKey "local" $local)) | fromYaml) | default (dict) -}}
{{- default "disable" (index $config "sslMode") -}}
{{- end -}}

{{- define "atk.postgresql.endpoint" -}}
{{- $ctx := .context | default . -}}
{{- $chartKey := default "" .chartKey -}}
{{- $local := default (dict) .local -}}
{{- printf "%s:%s" (include "atk.postgresql.host" (dict "context" $ctx "chartKey" $chartKey "local" $local)) (include "atk.postgresql.port" (dict "context" $ctx "chartKey" $chartKey "local" $local)) -}}
{{- end -}}

{{- define "atk.postgresql.url" -}}
{{- $ctx := .context -}}
{{- $chartKey := default "" .chartKey -}}
{{- $username := .username -}}
{{- $password := .password -}}
{{- $database := .database -}}
{{- $local := default (dict) .local -}}
{{- $sslMode := .sslMode | default (include "atk.postgresql.sslMode" (dict "context" $ctx "chartKey" $chartKey "local" $local)) -}}
{{- printf "postgresql://%s:%s@%s/%s?sslmode=%s" $username $password (include "atk.postgresql.endpoint" (dict "context" $ctx "chartKey" $chartKey "local" $local)) $database $sslMode -}}
{{- end -}}

{{/*
Shared Redis helpers.
*/}}
{{- define "atk.redis.host" -}}
{{- $ctx := .context | default . -}}
{{- $chartKey := default "" .chartKey -}}
{{- $local := default (dict) .local -}}
{{- $config := ((include "atk.datastores.redis" (dict "context" $ctx "chartKey" $chartKey "local" $local)) | fromYaml) | default (dict) -}}
{{- default "redis" (index $config "host") -}}
{{- end -}}

{{- define "atk.redis.port" -}}
{{- $ctx := .context | default . -}}
{{- $chartKey := default "" .chartKey -}}
{{- $local := default (dict) .local -}}
{{- $config := ((include "atk.datastores.redis" (dict "context" $ctx "chartKey" $chartKey "local" $local)) | fromYaml) | default (dict) -}}
{{- printf "%v" (default 6379 (index $config "port")) -}}
{{- end -}}

{{- define "atk.redis.username" -}}
{{- $ctx := .context | default . -}}
{{- $chartKey := default "" .chartKey -}}
{{- $local := default (dict) .local -}}
{{- $config := ((include "atk.datastores.redis" (dict "context" $ctx "chartKey" $chartKey "local" $local)) | fromYaml) | default (dict) -}}
{{- default "default" (index $config "username") -}}
{{- end -}}

{{- define "atk.redis.password" -}}
{{- $ctx := .context | default . -}}
{{- $chartKey := default "" .chartKey -}}
{{- $local := default (dict) .local -}}
{{- $config := ((include "atk.datastores.redis" (dict "context" $ctx "chartKey" $chartKey "local" $local)) | fromYaml) | default (dict) -}}
{{- default "atk" (index $config "password") -}}
{{- end -}}

{{- define "atk.redis.address" -}}
{{- $ctx := .context | default . -}}
{{- $chartKey := default "" .chartKey -}}
{{- $local := default (dict) .local -}}
{{- printf "%s:%s" (include "atk.redis.host" (dict "context" $ctx "chartKey" $chartKey "local" $local)) (include "atk.redis.port" (dict "context" $ctx "chartKey" $chartKey "local" $local)) -}}
{{- end -}}

{{- define "atk.redis.url" -}}
{{- $ctx := .context | default . -}}
{{- $chartKey := default "" .chartKey -}}
{{- $local := default (dict) .local -}}
{{- printf "redis://%s:%s@%s" (include "atk.redis.username" (dict "context" $ctx "chartKey" $chartKey "local" $local)) (include "atk.redis.password" (dict "context" $ctx "chartKey" $chartKey "local" $local)) (include "atk.redis.address" (dict "context" $ctx "chartKey" $chartKey "local" $local)) -}}
{{- end -}}

{{/*
Return a PostgreSQL connection URL derived from datastore defaults and optional overrides.
*/}}
{{- define "atk.datastores.postgresql.url" -}}
{{- $ctx := .context | default . -}}
{{- $chartKey := default "" .chartKey -}}
{{- $local := default (dict) .local -}}
{{- $config := ((include "atk.datastores.postgresql" (dict "context" $ctx "chartKey" $chartKey "local" $local)) | fromYaml) | default (dict) -}}
{{- $existingUrl := "" -}}
{{- if and $config (hasKey $config "url") -}}
  {{- $maybe := index $config "url" -}}
  {{- if $maybe -}}
    {{- $existingUrl = printf "%v" $maybe -}}
  {{- end -}}
{{- end -}}
{{- if ne (trim $existingUrl) "" -}}
  {{- $existingUrl -}}
{{- else -}}
  {{- $username := default "postgres" (index $config "username") -}}
  {{- $password := default "atk" (index $config "password") -}}
  {{- $database := default "postgres" (index $config "database") -}}
  {{- $sslMode := index $config "sslMode" -}}
  {{- include "atk.postgresql.url" (dict "context" $ctx "chartKey" $chartKey "local" $local "username" $username "password" $password "database" $database "sslMode" $sslMode) -}}
{{- end -}}
{{- end -}}

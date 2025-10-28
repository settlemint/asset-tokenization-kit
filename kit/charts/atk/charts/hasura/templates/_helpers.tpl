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

{{/*
Database connection URL
*/}}
{{- define "hasura.databaseUrl" -}}
{{- $host := .Values.database.host -}}
{{- if and .Values.global .Values.global.datastores -}}
  {{- if and .Values.global.datastores.hasura .Values.global.datastores.hasura.postgresql -}}
    {{- $host = $host | default .Values.global.datastores.hasura.postgresql.host -}}
  {{- end -}}
  {{- if and .Values.global.datastores.default .Values.global.datastores.default.postgresql -}}
    {{- $host = $host | default .Values.global.datastores.default.postgresql.host -}}
  {{- end -}}
{{- end -}}
{{- $port := .Values.database.port -}}
{{- if and .Values.global .Values.global.datastores -}}
  {{- if and .Values.global.datastores.hasura .Values.global.datastores.hasura.postgresql -}}
    {{- $port = $port | default .Values.global.datastores.hasura.postgresql.port -}}
  {{- end -}}
  {{- if and .Values.global.datastores.default .Values.global.datastores.default.postgresql -}}
    {{- $port = $port | default .Values.global.datastores.default.postgresql.port -}}
  {{- end -}}
{{- end -}}
{{- $username := .Values.database.username -}}
{{- if and .Values.global .Values.global.datastores -}}
  {{- if and .Values.global.datastores.hasura .Values.global.datastores.hasura.postgresql -}}
    {{- $username = $username | default .Values.global.datastores.hasura.postgresql.username -}}
  {{- end -}}
  {{- if and .Values.global.datastores.default .Values.global.datastores.default.postgresql -}}
    {{- $username = $username | default .Values.global.datastores.default.postgresql.username -}}
  {{- end -}}
{{- end -}}
{{- $password := .Values.database.password -}}
{{- if and .Values.global .Values.global.datastores -}}
  {{- if and .Values.global.datastores.hasura .Values.global.datastores.hasura.postgresql -}}
    {{- $password = $password | default .Values.global.datastores.hasura.postgresql.password -}}
  {{- end -}}
  {{- if and .Values.global.datastores.default .Values.global.datastores.default.postgresql -}}
    {{- $password = $password | default .Values.global.datastores.default.postgresql.password -}}
  {{- end -}}
{{- end -}}
{{- $database := .Values.database.database -}}
{{- if and .Values.global .Values.global.datastores -}}
  {{- if and .Values.global.datastores.hasura .Values.global.datastores.hasura.postgresql -}}
    {{- $database = $database | default .Values.global.datastores.hasura.postgresql.database -}}
  {{- end -}}
{{- end -}}
{{- $database = $database | default "hasura" -}}
{{- $sslMode := .Values.database.sslMode -}}
{{- if and .Values.global .Values.global.datastores -}}
  {{- if and .Values.global.datastores.hasura .Values.global.datastores.hasura.postgresql -}}
    {{- $sslMode = $sslMode | default .Values.global.datastores.hasura.postgresql.sslMode -}}
  {{- end -}}
{{- if and .Values.global.datastores.default .Values.global.datastores.default.postgresql -}}
  {{- $sslMode = $sslMode | default .Values.global.datastores.default.postgresql.sslMode -}}
{{- end -}}
{{- end -}}
{{- $mergedConfig := ((include "atk.datastores.postgresql.config" (dict "context" . "chartKey" "hasura" "local" (default (dict) .Values.database))) | fromYaml) | default (dict) -}}
{{- $existingSecret := trim (default "" (index $mergedConfig "existingSecret")) -}}
{{- if ne $existingSecret "" -}}
{{- "" -}}
{{- else -}}
{{- include "atk.datastores.postgresql.url" (dict "context" . "chartKey" "hasura" "local" (default (dict) .Values.database)) -}}
{{- end -}}
{{- end -}}

{{/*
Metadata database connection URL
*/}}
{{- define "hasura.metadataUrl" -}}
{{- if .Values.metadata.databaseUrl -}}
{{- .Values.metadata.databaseUrl -}}
{{- else -}}
{{- include "hasura.databaseUrl" . -}}
{{- end -}}
{{- end -}}

{{/*
Redis cache URL
*/}}
{{- define "hasura.redisCacheUrl" -}}
{{- include "atk.redis.uriFor" (dict "context" . "chartKey" "hasura" "local" (default (dict) .Values.redis) "dbKey" "cacheDb" "queryKey" "cacheQuery") -}}
{{- end -}}

{{/*
Redis rate limit URL
*/}}
{{- define "hasura.redisRateLimitUrl" -}}
{{- include "atk.redis.uriFor" (dict "context" . "chartKey" "hasura" "local" (default (dict) .Values.redis) "dbKey" "rateLimitDb" "queryKey" "rateLimitQuery") -}}
{{- end -}}

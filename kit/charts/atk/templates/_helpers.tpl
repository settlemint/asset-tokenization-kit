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
Resolve the primary host for a component's ingress configuration.
Safely handles hostname/host/hosts structures and falls back to the provided default.
Parameters:
- context: root context (optional)
- path: list of keys leading to the component scope (e.g., list "graph-node")
- default: fallback host string
*/}}
{{- define "atk.ingress.primaryHost" -}}
{{- $ctx := .context | default . -}}
{{- $path := .path | default (list) -}}
{{- $fallback := default "" .default -}}
{{- $node := $ctx.Values -}}
{{- $missing := false -}}
{{- range $segment := $path -}}
  {{- if and (not $missing) (kindIs "map" $node) (hasKey $node $segment) -}}
    {{- $node = index $node $segment -}}
  {{- else -}}
    {{- $missing = true -}}
  {{- end -}}
{{- end -}}
{{- if $missing -}}
  {{- $node = dict -}}
{{- end -}}
{{- if and (kindIs "map" $node) (hasKey $node "ingress") -}}
  {{- $node = index $node "ingress" -}}
{{- end -}}
{{- $host := $fallback -}}
{{- if kindIs "map" $node -}}
  {{- if hasKey $node "hostname" -}}
    {{- $host = default $fallback (index $node "hostname") -}}
  {{- else if hasKey $node "hostName" -}}
    {{- $host = default $fallback (index $node "hostName") -}}
  {{- else if hasKey $node "host" -}}
    {{- $host = default $fallback (index $node "host") -}}
  {{- else if hasKey $node "hosts" -}}
    {{- $host = include "atk.ingress.primaryHost.firstFromList" (dict "hosts" (index $node "hosts") "default" $fallback) -}}
  {{- end -}}
{{- end -}}
{{- $host -}}
{{- end -}}

{{/*
Return the first host entry from an ingress hosts array that may contain
either host objects or raw strings.
*/}}
{{- define "atk.ingress.primaryHost.firstFromList" -}}
{{- $hosts := .hosts | default (list) -}}
{{- $fallback := default "" .default -}}
{{- $host := $fallback -}}
{{- if and $hosts (gt (len $hosts) 0) -}}
  {{- $first := index $hosts 0 -}}
  {{- if kindIs "map" $first -}}
    {{- $host = default $fallback (index $first "host") -}}
  {{- else if kindIs "string" $first -}}
    {{- $host = $first -}}
  {{- end -}}
{{- end -}}
{{- $host -}}
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
Ensure a required datastore field is populated; fail with a consistent message otherwise.
*/}}
{{- define "atk.datastores.require" -}}
{{- $value := printf "%v" (default "" .value) -}}
{{- if eq (trim $value) "" -}}
  {{- fail (printf "%s must be set for datastore %q" .field .source) -}}
{{- end -}}
{{- $value -}}
{{- end -}}

{{/*
Resolve a human-readable name for the datastore we are validating.
*/}}
{{- define "atk.datastores.source" -}}
{{- $ctx := .context -}}
{{- $chartKey := printf "%v" (default "" .chartKey) -}}
{{- $source := trim $chartKey -}}
{{- if eq $source "" -}}
  {{- if $ctx.Chart -}}
    {{- $source = $ctx.Chart.Name -}}
  {{- else -}}
    {{- $source = "global" -}}
  {{- end -}}
{{- end -}}
{{- $source -}}
{{- end -}}

{{/*
Return the effective Redis datastore configuration with empty overrides pruned.
*/}}
{{- define "atk.datastores.redis.config" -}}
{{- $ctx := .context | default . -}}
{{- $chartKey := default "" .chartKey -}}
{{- $legacyKey := default "" .legacyKey -}}
{{- $local := default (dict) .local -}}
{{- $base := ((include "atk.datastores.redis" (dict "context" $ctx "chartKey" $chartKey "legacyKey" $legacyKey "local" (dict))) | fromYaml) | default (dict) -}}
{{- $overrides := $local | default (dict) -}}
{{- $result := dict -}}
{{- range $key, $value := $base -}}
  {{- $string := trim (printf "%v" $value) -}}
  {{- if ne $string "" -}}
    {{- $_ := set $result $key $value -}}
  {{- end -}}
{{- end -}}
{{- range $key, $value := $overrides -}}
  {{- $string := trim (printf "%v" $value) -}}
  {{- if ne $string "" -}}
    {{- $_ := set $result $key $value -}}
  {{- end -}}
{{- end -}}
{{- $existingSecret := "" -}}
{{- if hasKey $result "existingSecret" -}}
  {{- $existingSecret = trim (printf "%v" (index $result "existingSecret")) -}}
{{- end -}}
{{- if ne $existingSecret "" -}}
  {{- $namespace := "" -}}
  {{- if and $ctx $ctx.Release $ctx.Release.Namespace -}}
    {{- $namespace = $ctx.Release.Namespace -}}
  {{- end -}}
  {{- if ne $namespace "" -}}
    {{- $secret := lookup "v1" "Secret" $namespace $existingSecret -}}
    {{- if and $secret $secret.data -}}
      {{- $secretData := $secret.data -}}
      {{- $secretKeys := (index $result "existingSecretKeys") | default (dict) -}}
      {{- range $configKey, $secretKey := $secretKeys -}}
        {{- $secretKeyString := trim (printf "%v" $secretKey) -}}
        {{- if and (ne $secretKeyString "") (hasKey $secretData $secretKeyString) -}}
          {{- $decoded := (index $secretData $secretKeyString) | b64dec -}}
          {{- $_ := set $result $configKey $decoded -}}
        {{- end -}}
      {{- end -}}
    {{- end -}}
  {{- end -}}
{{- end -}}
{{- toYaml $result -}}
{{- end -}}

{{/*
Return the effective PostgreSQL datastore configuration with empty overrides pruned.
*/}}
{{- define "atk.datastores.postgresql.config" -}}
{{- $ctx := .context | default . -}}
{{- $chartKey := default "" .chartKey -}}
{{- $legacyKey := default "" .legacyKey -}}
{{- $local := default (dict) .local -}}
{{- $base := ((include "atk.datastores.postgresql" (dict "context" $ctx "chartKey" $chartKey "legacyKey" $legacyKey "local" (dict))) | fromYaml) | default (dict) -}}
{{- $overrides := $local | default (dict) -}}
{{- $result := dict -}}
{{- range $key, $value := $base -}}
  {{- $string := trim (printf "%v" $value) -}}
  {{- if ne $string "" -}}
    {{- $_ := set $result $key $value -}}
  {{- end -}}
{{- end -}}
{{- range $key, $value := $overrides -}}
  {{- $string := trim (printf "%v" $value) -}}
  {{- if ne $string "" -}}
    {{- $_ := set $result $key $value -}}
  {{- end -}}
{{- end -}}
{{- $defaultSecretKeys := dict "host" "host" "port" "port" "database" "database" "username" "username" "password" "password" "url" "url" "metadataUrl" "metadataUrl" -}}
{{- $providedSecretKeys := (index $result "existingSecretKeys") | default (dict) -}}
{{- range $key, $value := $providedSecretKeys -}}
  {{- $string := trim (printf "%v" $value) -}}
  {{- if ne $string "" -}}
    {{- $_ := set $defaultSecretKeys $key $value -}}
  {{- end -}}
{{- end -}}
{{- $_ := set $result "existingSecretKeys" $defaultSecretKeys -}}
{{- if not (hasKey $result "existingSecret") -}}
  {{- $_ := set $result "existingSecret" "" -}}
{{- end -}}
{{- toYaml $result -}}
{{- end -}}

{{/*
Shared PostgreSQL helpers.
*/}}
{{- define "atk.postgresql.host" -}}
{{- $ctx := .context | default . -}}
{{- $chartKey := default "" .chartKey -}}
{{- $legacyKey := default "" .legacyKey -}}
{{- $local := default (dict) .local -}}
{{- $config := ((include "atk.datastores.postgresql.config" (dict "context" $ctx "chartKey" $chartKey "legacyKey" $legacyKey "local" $local)) | fromYaml) | default (dict) -}}
{{- $source := trim (include "atk.datastores.source" (dict "context" $ctx "chartKey" $chartKey)) -}}
{{- $host := trim (include "atk.datastores.require" (dict "value" (index $config "host") "field" "postgresql.host" "source" $source)) -}}
{{- $host -}}
{{- end -}}

{{- define "atk.postgresql.port" -}}
{{- $ctx := .context | default . -}}
{{- $chartKey := default "" .chartKey -}}
{{- $legacyKey := default "" .legacyKey -}}
{{- $local := default (dict) .local -}}
{{- $config := ((include "atk.datastores.postgresql.config" (dict "context" $ctx "chartKey" $chartKey "legacyKey" $legacyKey "local" $local)) | fromYaml) | default (dict) -}}
{{- $source := trim (include "atk.datastores.source" (dict "context" $ctx "chartKey" $chartKey)) -}}
{{- $port := trim (include "atk.datastores.require" (dict "value" (index $config "port") "field" "postgresql.port" "source" $source)) -}}
{{- $port -}}
{{- end -}}

{{- define "atk.postgresql.sslMode" -}}
{{- $ctx := .context | default . -}}
{{- $chartKey := default "" .chartKey -}}
{{- $legacyKey := default "" .legacyKey -}}
{{- $local := default (dict) .local -}}
{{- $config := ((include "atk.datastores.postgresql.config" (dict "context" $ctx "chartKey" $chartKey "legacyKey" $legacyKey "local" $local)) | fromYaml) | default (dict) -}}
{{- printf "%v" (default "" (index $config "sslMode")) -}}
{{- end -}}

{{- define "atk.postgresql.endpoint" -}}
{{- $ctx := .context | default . -}}
{{- $chartKey := default "" .chartKey -}}
{{- $legacyKey := default "" .legacyKey -}}
{{- $local := default (dict) .local -}}
{{- printf "%s:%s" (include "atk.postgresql.host" (dict "context" $ctx "chartKey" $chartKey "legacyKey" $legacyKey "local" $local)) (include "atk.postgresql.port" (dict "context" $ctx "chartKey" $chartKey "legacyKey" $legacyKey "local" $local)) -}}
{{- end -}}

{{- define "atk.postgresql.url" -}}
{{- $ctx := .context | default . -}}
{{- $chartKey := default "" .chartKey -}}
{{- $legacyKey := default "" .legacyKey -}}
{{- $local := default (dict) .local -}}
{{- $config := ((include "atk.datastores.postgresql.config" (dict "context" $ctx "chartKey" $chartKey "legacyKey" $legacyKey "local" $local)) | fromYaml) | default (dict) -}}
{{- $source := trim (include "atk.datastores.source" (dict "context" $ctx "chartKey" $chartKey)) -}}
{{- $existingSecret := trim (default "" (index $config "existingSecret")) -}}
{{- if ne $existingSecret "" -}}
{{- "" -}}
{{- else -}}
{{- $username := trim (include "atk.datastores.require" (dict "value" (index $config "username") "field" "postgresql.username" "source" $source)) -}}
{{- $password := trim (include "atk.datastores.require" (dict "value" (index $config "password") "field" "postgresql.password" "source" $source)) -}}
{{- $database := trim (include "atk.datastores.require" (dict "value" (index $config "database") "field" "postgresql.database" "source" $source)) -}}
{{- $sslMode := printf "%v" (default "" (index $config "sslMode")) -}}
{{- $endpoint := include "atk.postgresql.endpoint" (dict "context" $ctx "chartKey" $chartKey "legacyKey" $legacyKey "local" $local) -}}
{{- $query := "" -}}
{{- if ne (trim $sslMode) "" -}}
  {{- $query = printf "?sslmode=%s" $sslMode -}}
{{- end -}}
{{- printf "postgresql://%s:%s@%s/%s%s" $username $password $endpoint $database $query -}}
{{- end -}}
{{- end -}}

{{/*
Shared Redis helpers.
*/}}
{{- define "atk.redis.host" -}}
{{- $ctx := .context | default . -}}
{{- $chartKey := default "" .chartKey -}}
{{- $legacyKey := default "" .legacyKey -}}
{{- $local := default (dict) .local -}}
{{- $config := ((include "atk.datastores.redis.config" (dict "context" $ctx "chartKey" $chartKey "legacyKey" $legacyKey "local" $local)) | fromYaml) | default (dict) -}}
{{- $source := trim (include "atk.datastores.source" (dict "context" $ctx "chartKey" $chartKey)) -}}
{{- $host := trim (include "atk.datastores.require" (dict "value" (index $config "host") "field" "redis.host" "source" $source)) -}}
{{- $host -}}
{{- end -}}

{{- define "atk.redis.port" -}}
{{- $ctx := .context | default . -}}
{{- $chartKey := default "" .chartKey -}}
{{- $legacyKey := default "" .legacyKey -}}
{{- $local := default (dict) .local -}}
{{- $config := ((include "atk.datastores.redis.config" (dict "context" $ctx "chartKey" $chartKey "legacyKey" $legacyKey "local" $local)) | fromYaml) | default (dict) -}}
{{- $source := trim (include "atk.datastores.source" (dict "context" $ctx "chartKey" $chartKey)) -}}
{{- $port := trim (include "atk.datastores.require" (dict "value" (index $config "port") "field" "redis.port" "source" $source)) -}}
{{- $port -}}
{{- end -}}

{{- define "atk.redis.username" -}}
{{- $ctx := .context | default . -}}
{{- $chartKey := default "" .chartKey -}}
{{- $legacyKey := default "" .legacyKey -}}
{{- $local := default (dict) .local -}}
{{- $config := ((include "atk.datastores.redis.config" (dict "context" $ctx "chartKey" $chartKey "legacyKey" $legacyKey "local" $local)) | fromYaml) | default (dict) -}}
{{- printf "%v" (default "" (index $config "username")) -}}
{{- end -}}

{{- define "atk.redis.password" -}}
{{- $ctx := .context | default . -}}
{{- $chartKey := default "" .chartKey -}}
{{- $legacyKey := default "" .legacyKey -}}
{{- $local := default (dict) .local -}}
{{- $config := ((include "atk.datastores.redis.config" (dict "context" $ctx "chartKey" $chartKey "legacyKey" $legacyKey "local" $local)) | fromYaml) | default (dict) -}}
{{- printf "%v" (default "" (index $config "password")) -}}
{{- end -}}

{{- define "atk.redis.address" -}}
{{- $ctx := .context | default . -}}
{{- $chartKey := default "" .chartKey -}}
{{- $legacyKey := default "" .legacyKey -}}
{{- $local := default (dict) .local -}}
{{- printf "%s:%s" (include "atk.redis.host" (dict "context" $ctx "chartKey" $chartKey "legacyKey" $legacyKey "local" $local)) (include "atk.redis.port" (dict "context" $ctx "chartKey" $chartKey "legacyKey" $legacyKey "local" $local)) -}}
{{- end -}}

{{- define "atk.redis.url" -}}
{{- $ctx := .context | default . -}}
{{- $chartKey := default "" .chartKey -}}
{{- $legacyKey := default "" .legacyKey -}}
{{- $local := default (dict) .local -}}
{{- $dbKey := default "db" .dbKey -}}
{{- $queryKey := default "" .queryKey -}}
{{- include "atk.redis.uriFor" (dict "context" $ctx "chartKey" $chartKey "legacyKey" $legacyKey "local" $local "dbKey" $dbKey "queryKey" $queryKey) -}}
{{- end -}}

{{- define "atk.redis.uri" -}}
{{- $host := printf "%v" (default "" .host) -}}
{{- $port := printf "%v" (default "" .port) -}}
{{- $username := printf "%v" (default "" .username) -}}
{{- $password := printf "%v" (default "" .password) -}}
{{- $db := printf "%v" (default 0 .db) -}}
{{- $query := trimPrefix "?" (printf "%v" (default "" .query)) -}}
{{- $auth := "" -}}
{{- if or (ne $username "") (ne $password "") -}}
  {{- if eq $username "" -}}
    {{- $auth = printf ":%s@" $password -}}
  {{- else if eq $password "" -}}
    {{- $auth = printf "%s:@" $username -}}
  {{- else -}}
    {{- $auth = printf "%s:%s@" $username $password -}}
  {{- end -}}
{{- end -}}
{{- $uri := printf "redis://%s%s:%s/%s" $auth $host $port $db -}}
{{- if ne $query "" -}}
  {{- printf "%s?%s" $uri $query -}}
{{- else -}}
  {{- $uri -}}
{{- end -}}
{{- end -}}

{{- define "atk.redis.uriFor" -}}
{{- $ctx := .context | default . -}}
{{- $chartKey := default "" .chartKey -}}
{{- $legacyKey := default "" .legacyKey -}}
{{- $local := default (dict) .local -}}
{{- $dbKey := default "db" .dbKey -}}
{{- $queryKey := default "" .queryKey -}}
{{- $config := ((include "atk.datastores.redis.config" (dict "context" $ctx "chartKey" $chartKey "legacyKey" $legacyKey "local" $local)) | fromYaml) | default (dict) -}}
{{- $source := trim (include "atk.datastores.source" (dict "context" $ctx "chartKey" $chartKey)) -}}
{{- $host := trim (include "atk.redis.host" (dict "context" $ctx "chartKey" $chartKey "legacyKey" $legacyKey "local" $local)) -}}
{{- $port := trim (include "atk.redis.port" (dict "context" $ctx "chartKey" $chartKey "legacyKey" $legacyKey "local" $local)) -}}
{{- $db := "" -}}
{{- if hasKey $config $dbKey -}}
  {{- $db = index $config $dbKey -}}
{{- end -}}
{{- if and (eq (printf "%v" $db) "") (ne $dbKey "db") (hasKey $config "db") -}}
  {{- $db = index $config "db" -}}
{{- end -}}
{{- $dbString := printf "%v" $db -}}
{{- if eq (trim $dbString) "" -}}
  {{- fail (printf "redis.%s (or redis.db) must be set for datastore %q" $dbKey $source) -}}
{{- end -}}
{{- $query := "" -}}
{{- if and (ne $queryKey "") (hasKey $config $queryKey) -}}
  {{- $query = index $config $queryKey -}}
{{- else if hasKey $config "query" -}}
  {{- $query = index $config "query" -}}
{{- end -}}
{{- $username := trim (printf "%v" (default "" (index $config "username"))) -}}
{{- $password := trim (printf "%v" (default "" (index $config "password"))) -}}
{{- if and (ne $username "") (eq $password "") -}}
  {{- fail (printf "redis.password must be set for datastore %q when redis.username is provided" $source) -}}
{{- end -}}
{{- include "atk.redis.uri" (dict "host" $host "port" $port "username" $username "password" $password "db" $db "query" $query) -}}
{{- end -}}

{{/*
Return a PostgreSQL connection URL derived from datastore defaults and optional overrides.
*/}}
{{- define "atk.datastores.postgresql.url" -}}
{{- $ctx := .context | default . -}}
{{- $chartKey := default "" .chartKey -}}
{{- $legacyKey := default "" .legacyKey -}}
{{- $local := default (dict) .local -}}
{{- include "atk.postgresql.url" (dict "context" $ctx "chartKey" $chartKey "legacyKey" $legacyKey "local" $local) -}}
{{- end -}}

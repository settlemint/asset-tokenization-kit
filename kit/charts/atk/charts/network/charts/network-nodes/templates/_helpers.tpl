{{/*
Expand the name of the chart.
*/}}
{{- define "nodes.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "nodes.fullname" -}}
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
{{- define "nodes.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels merged with any entries provided via global.labels.
*/}}
{{- define "nodes.labels" -}}
{{- $root := . -}}
{{- $global := default (dict) (get .Values "global") -}}
{{- $globalLabels := default (dict) (get $global "labels") -}}
{{- range $key, $value := $globalLabels }}
{{- if kindIs "string" $value }}
{{ $key }}: {{ tpl $value $root | quote }}
{{- else }}
{{ $key }}: {{ printf "%v" $value | quote }}
{{- end }}
{{- end }}
helm.sh/chart: {{ include "nodes.chart" . }}
{{ include "nodes.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "nodes.selectorLabels" -}}
app.kubernetes.io/name: {{ include "nodes.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "nodes.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "nodes.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Render optional Log4j environment variables when structured logging is enabled.
*/}}
{{- define "nodes.log4jEnv" -}}
{{- if eq (default "plain" .Values.config.logFormat) "json" }}
- name: LOG4J_CONFIGURATION_FILE
  value: /etc/besu/log-config.xml
{{- end }}
{{- end }}

{{/*
Render optional volume mounts for the Log4j configuration file.
*/}}
{{- define "nodes.log4jVolumeMount" -}}
{{- if eq (default "plain" .Values.config.logFormat) "json" }}
- name: besu-config
  mountPath: /etc/besu/log-config.xml
  subPath: log-config.xml
  readOnly: true
{{- end }}
{{- end }}

{{/*
Resolve the number of validator replicas, falling back to global overrides when provided.
*/}}
{{- define "nodes.validatorReplicaCount" -}}
{{- $explicit := .Values.validatorReplicaCount -}}
{{- if not (empty $explicit) -}}
{{- $explicit | int -}}
{{- else -}}
{{- $global := default (dict) .Values.global -}}
{{- $networkGlobal := dict -}}
{{- if and (kindIs "map" $global) (hasKey $global "network") -}}
  {{- $networkCandidate := index $global "network" -}}
  {{- if kindIs "map" $networkCandidate -}}
    {{- $networkGlobal = $networkCandidate -}}
  {{- end -}}
{{- end -}}
{{- if and (kindIs "map" $networkGlobal) (hasKey $networkGlobal "validatorReplicaCount") -}}
{{- (index $networkGlobal "validatorReplicaCount") | int -}}
{{- else if and (kindIs "map" $global) (hasKey $global "validatorReplicaCount") -}}
{{- (index $global "validatorReplicaCount") | int -}}
{{- else -}}
4
{{- end -}}
{{- end -}}
{{- end }}

{{/*
Render a tcp-check init container when enabled.
*/}}
{{- define "nodes.tcpCheckInitContainer" -}}
{{- $ctx := index . "context" -}}
{{- $cfg := default (dict) (index . "config") -}}
{{- $indent := index . "indent" | default 2 -}}
{{- $enabled := default false (get $cfg "enabled") -}}
{{- if $enabled -}}
{{- $image := default (dict) (get $cfg "image") -}}
{{- $repository := default "ghcr.io/settlemint/btp-waitforit" (get $image "repository") -}}
{{- $tag := default "v7.7.10" (get $image "tag") -}}
{{- $pullPolicy := default "IfNotPresent" (get $image "pullPolicy") -}}
{{- $timeout := default 120 (get $cfg "timeout") -}}
{{- $resources := get $cfg "resources" -}}
{{- $dependencies := default (list) (get $cfg "dependencies") -}}
{{- $count := len $dependencies -}}
{{- $script := include "nodes.tcpCheckScript" (dict "ctx" $ctx "timeout" $timeout "dependencies" $dependencies "count" $count) -}}
{{- $container := dict "name" "tcp-check" "image" (printf "%s:%s" $repository $tag) "imagePullPolicy" $pullPolicy "command" (list "/bin/sh" "-ec") "args" (list $script) -}}
{{- if $resources }}{{- $_ := set $container "resources" $resources }}{{- end -}}
{{ toYaml (list $container) | nindent $indent }}
{{- end -}}
{{- end }}

{{/*
Produce the shell script executed by the tcp-check init container.
*/}}
{{- define "nodes.tcpCheckScript" -}}
set -euo pipefail
INTERVAL=2
TIMEOUT={{ index . "timeout" }}
if [ {{ index . "count" }} -eq 0 ]; then
  echo "No dependencies configured; skipping checks."
  exit 0
fi

check() {
  name="$1"
  endpoint="$2"
  host="${endpoint%:*}"
  port="${endpoint##*:}"
  echo "Waiting for ${name} (${endpoint})..."
  elapsed=0
  while true; do
    if nc -z "$host" "$port" >/dev/null 2>&1; then
      echo "${name} ready."
      break
    fi
    sleep "${INTERVAL}"
    elapsed=$((elapsed+INTERVAL))
    if [ "$elapsed" -ge "$TIMEOUT" ]; then
      echo "Timeout waiting for ${name} (${endpoint})."
      exit 1
    fi
  done
}

{{- range $dependency := index . "dependencies" }}
{{- $name := default "dependency" (get $dependency "name") }}
{{- $endpointTemplate := default "" (get $dependency "endpoint") }}
{{- $endpoint := tpl $endpointTemplate (index . "ctx") }}
check {{ printf "%q" $name }} {{ printf "%q" $endpoint }}
{{- end }}
{{- end }}

{{/*
Render arbitrarily defined init containers without modification.
*/}}
{{- define "nodes.extraInitContainers" -}}
{{- $ctx := index . "context" -}}
{{- $containers := default (list) (index . "containers") -}}
{{- $indent := index . "indent" | default 2 -}}
{{- if gt (len $containers) 0 -}}
{{ tpl (toYaml $containers) $ctx | nindent $indent }}
{{- end -}}
{{- end }}

{{/*
Resolve pod and container security contexts using global defaults plus chart overrides.
*/}}
{{- define "nodes.securityContexts" -}}
{{- $ctx := index . "ctx" -}}
{{- $dest := index . "dest" -}}
{{- $globalValues := ($ctx.Values.global | default (dict)) -}}
{{- $globalSecurityContexts := default (dict) (get $globalValues "securityContexts") -}}
{{- $podDefaults := default (dict) (get $globalSecurityContexts "pod") -}}
{{- $containerDefaults := default (dict) (get $globalSecurityContexts "container") -}}
{{- $_ := set $dest "pod" (mergeOverwrite (deepCopy $podDefaults) (default (dict) $ctx.Values.podSecurityContext)) -}}
{{- $_ := set $dest "container" (mergeOverwrite (deepCopy $containerDefaults) (default (dict) $ctx.Values.securityContext)) -}}
{{- end -}}

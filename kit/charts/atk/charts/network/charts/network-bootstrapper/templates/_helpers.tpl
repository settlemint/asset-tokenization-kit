{{/*
Expand the name of the chart.
*/}}
{{- define "network-bootstrapper.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "network-bootstrapper.fullname" -}}
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
{{- define "network-bootstrapper.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels merged with any entries provided via global.labels.
*/}}
{{- define "network-bootstrapper.labels" -}}
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
helm.sh/chart: {{ include "network-bootstrapper.chart" . }}
{{ include "network-bootstrapper.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "network-bootstrapper.selectorLabels" -}}
app.kubernetes.io/name: {{ include "network-bootstrapper.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "network-bootstrapper.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "network-bootstrapper.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Render a tcp-check init container when enabled.
*/}}
{{- define "network-bootstrapper.tcpCheckInitContainer" -}}
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
{{- $script := include "network-bootstrapper.tcpCheckScript" (dict "ctx" $ctx "timeout" $timeout "dependencies" $dependencies "count" $count) -}}
{{- $container := dict "name" "tcp-check" "image" (printf "%s:%s" $repository $tag) "imagePullPolicy" $pullPolicy "command" (list "/bin/sh" "-ec") "args" (list $script) -}}
{{- if $resources }}{{- $_ := set $container "resources" $resources }}{{- end -}}
{{ toYaml (list $container) | nindent $indent }}
{{- end -}}
{{- end }}

{{/*
Produce the shell script executed by the tcp-check init container.
*/}}
{{- define "network-bootstrapper.tcpCheckScript" -}}
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
{{- define "network-bootstrapper.extraInitContainers" -}}
{{- $ctx := index . "context" -}}
{{- $containers := default (list) (index . "containers") -}}
{{- $indent := index . "indent" | default 2 -}}
{{- if gt (len $containers) 0 -}}
{{ tpl (toYaml $containers) $ctx | nindent $indent }}
{{- end -}}
{{- end }}

{{/*
Resolve pod and container security contexts by layering chart values over global defaults.
*/}}
{{- define "network-bootstrapper.securityContexts" -}}
{{- $ctx := index . "ctx" -}}
{{- $dest := index . "dest" -}}
{{- $globalValues := ($ctx.Values.global | default (dict)) -}}
{{- $globalSecurityContexts := default (dict) (get $globalValues "securityContexts") -}}
{{- $podDefaults := default (dict) (get $globalSecurityContexts "pod") -}}
{{- $containerDefaults := default (dict) (get $globalSecurityContexts "container") -}}
{{- $_ := set $dest "pod" (mergeOverwrite (deepCopy $podDefaults) (default (dict) $ctx.Values.podSecurityContext)) -}}
{{- $_ := set $dest "container" (mergeOverwrite (deepCopy $containerDefaults) (default (dict) $ctx.Values.securityContext)) -}}
{{- end -}}

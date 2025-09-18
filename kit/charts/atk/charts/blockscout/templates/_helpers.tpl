{{/*
Expand the name of the chart.
*/}}
{{- define "blockscout.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "blockscout.fullname" -}}
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
{{- define "blockscout.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "blockscout.labels" -}}
helm.sh/chart: {{ include "blockscout.chart" . }}
{{ include "blockscout.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "blockscout.selectorLabels" -}}
app.kubernetes.io/name: {{ include "blockscout.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "blockscout.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "blockscout.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Image pull secrets
*/}}
{{- define "atk.common.imagePullSecrets" -}}
{{- $pullSecrets := list }}
{{- if .Values.global }}
  {{- range .Values.global.imagePullSecrets -}}
    {{- $pullSecrets = append $pullSecrets . -}}
  {{- end -}}
{{- end -}}
{{- range .Values.imagePullSecrets -}}
  {{- $pullSecrets = append $pullSecrets . -}}
{{- end -}}
{{- if (not (empty $pullSecrets)) }}
imagePullSecrets:
{{- range $pullSecrets }}
  - name: {{ . }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Return merged pod security context defaults for Blockscout.
*/}}
{{- define "blockscout.securityContext.pod" -}}
{{ include "atk.securityContext.pod" (dict "context" (.context | default .) "local" (default (dict) .local) "chartKey" "blockscout") }}
{{- end }}

{{/*
Return merged container security context defaults for Blockscout.
*/}}
{{- define "blockscout.securityContext.container" -}}
{{ include "atk.securityContext.container" (dict "context" (.context | default .) "local" (default (dict) .local) "chartKey" "blockscout") }}
{{- end }}

{{/*
Return the merged PostgreSQL datastore configuration for Blockscout.
*/}}
{{- define "blockscout.postgresql" -}}
{{ include "atk.datastores.postgresql" (dict "context" (.context | default .) "chartKey" "blockscout" "local" (default (dict) .local)) }}
{{- end }}

{{/*
Return a PostgreSQL connection URL for Blockscout.
*/}}
{{- define "blockscout.postgresql.url" -}}
{{ include "atk.datastores.postgresql.url" (dict "context" (.context | default .) "chartKey" "blockscout" "local" (default (dict) .local)) }}
{{- end }}

{{/*
Resolve the chain ID for Blockscout, preferring config.network.id while
falling back to the shared global.chainId when unset.
*/}}
{{- define "blockscout.chainId" -}}
{{- $ctx := . -}}
{{- $id := "" -}}
{{- if and .Values.config .Values.config.network .Values.config.network.id }}
  {{- $id = include "atk.common.tplvalues.render" (dict "value" .Values.config.network.id "context" $ctx) | trim -}}
{{- end -}}
{{- if and (eq $id "") .Values.global .Values.global.chainId }}
  {{- $id = include "atk.common.tplvalues.render" (dict "value" .Values.global.chainId "context" $ctx) | trim -}}
{{- end -}}
{{- $id -}}
{{- end -}}

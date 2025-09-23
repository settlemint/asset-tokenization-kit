{{/*
Expand the name of the chart.
Using common helper with chart-specific alias.
*/}}
{{- define "blockscout.name" -}}
{{ include "atk.common.name" . }}
{{- end }}

{{/*
Create a default fully qualified app name.
Using common helper with chart-specific alias.
*/}}
{{- define "blockscout.fullname" -}}
{{ include "atk.common.fullname" . }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
Using common helper with chart-specific alias.
*/}}
{{- define "blockscout.chart" -}}
{{ include "atk.common.chart" . }}
{{- end }}

{{/*
Common labels
Using common helper with chart-specific alias.
*/}}
{{- define "blockscout.labels" -}}
{{ include "atk.common.labels" . }}
{{- end }}

{{/*
Selector labels
Using common helper with chart-specific alias.
*/}}
{{- define "blockscout.selectorLabels" -}}
{{ include "atk.common.selectorLabels" . }}
{{- end }}

{{/*
Create the name of the service account to use
Using common helper with chart-specific alias.
*/}}
{{- define "blockscout.serviceAccountName" -}}
{{ include "atk.common.serviceAccountName" . }}
{{- end }}

{{/*
Return the target Kubernetes version
Using common helper with chart-specific alias.
*/}}
{{- define "blockscout.capabilities.kubeVersion" -}}
{{ include "atk.common.capabilities.kubeVersion" . }}
{{- end }}

{{/*
Return true if ingress supports ingressClassName field
Using common helper with chart-specific alias.
*/}}
{{- define "blockscout.ingress.supportsIngressClassname" -}}
{{ include "atk.common.ingress.supportsIngressClassname" . }}
{{- end }}

{{/*
Return true if ingress supports pathType field
Using common helper with chart-specific alias.
*/}}
{{- define "blockscout.ingress.supportsPathType" -}}
{{ include "atk.common.ingress.supportsPathType" . }}
{{- end }}

{{/*
Return namespace
Using common helper with chart-specific alias.
*/}}
{{- define "blockscout.namespace" -}}
{{ include "atk.common.namespace" . }}
{{- end }}

{{/*
Render template values
Using common helper with chart-specific alias.
*/}}
{{- define "blockscout.tplvalues.render" -}}
{{ include "atk.common.tplvalues.render" . }}
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

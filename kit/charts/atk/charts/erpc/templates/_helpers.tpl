{{/*
Expand the name of the chart.
Using common helper with chart-specific alias.
*/}}
{{- define "erpc.name" -}}
{{ include "atk.common.name" . }}
{{- end }}

{{/*
Create a default fully qualified app name.
Using common helper with chart-specific alias.
*/}}
{{- define "erpc.fullname" -}}
{{ include "atk.common.fullname" . }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
Using common helper with chart-specific alias.
*/}}
{{- define "erpc.chart" -}}
{{ include "atk.common.chart" . }}
{{- end }}

{{/*
Common labels
Using common helper with chart-specific alias.
*/}}
{{- define "erpc.labels" -}}
{{ include "atk.common.labels" . }}
{{- end }}

{{/*
Selector labels
Using common helper with chart-specific alias.
*/}}
{{- define "erpc.selectorLabels" -}}
{{ include "atk.common.selectorLabels" . }}
{{- end }}

{{/*
Create the name of the service account to use
Using common helper with chart-specific alias.
*/}}
{{- define "erpc.serviceAccountName" -}}
{{ include "atk.common.serviceAccountName" . }}
{{- end }}

{{/*
Return the target Kubernetes version
Using common helper with chart-specific alias.
*/}}
{{- define "erpc.capabilities.kubeVersion" -}}
{{ include "atk.common.capabilities.kubeVersion" . }}
{{- end }}

{{/*
Return true if ingress supports ingressClassName field
Using common helper with chart-specific alias.
*/}}
{{- define "erpc.ingress.supportsIngressClassname" -}}
{{ include "atk.common.ingress.supportsIngressClassname" . }}
{{- end }}

{{/*
Return true if ingress supports pathType field
Using common helper with chart-specific alias.
*/}}
{{- define "erpc.ingress.supportsPathType" -}}
{{ include "atk.common.ingress.supportsPathType" . }}
{{- end }}

{{/*
Return namespace
Using common helper with chart-specific alias.
*/}}
{{- define "erpc.namespace" -}}
{{ include "atk.common.namespace" . }}
{{- end }}

{{/*
Render template values
Using common helper with chart-specific alias.
*/}}
{{- define "erpc.tplvalues.render" -}}
{{ include "atk.common.tplvalues.render" . }}
{{- end }}

{{/*
Generate a Redis URI selecting fields from merged configuration.
*/}}
{{- define "erpc.redis.uriFor" -}}
{{- $context := .context | default . -}}
{{- $dbKey := default "cacheDb" .dbKey -}}
{{- $queryKey := default "" .queryKey -}}
{{- $local := default (dict) $context.Values.redis -}}
{{- include "atk.redis.uriFor" (dict "context" $context "chartKey" "erpc" "local" $local "dbKey" $dbKey "queryKey" $queryKey) -}}
{{- end }}

{{/*
Return the host:port tuple for the configured Redis endpoint.
*/}}
{{- define "erpc.redis.endpoint" -}}
{{- $context := .context | default . -}}
{{- $local := default (dict) $context.Values.redis -}}
{{- printf "%s:%s" (include "atk.redis.host" (dict "context" $context "chartKey" "erpc" "local" $local)) (include "atk.redis.port" (dict "context" $context "chartKey" "erpc" "local" $local)) -}}
{{- end }}

{{/*
Merge pod-level security context defaults with chart overrides.
*/}}
{{- define "erpc.securityContext.pod" -}}
{{- $ctx := .context | default . -}}
{{ include "atk.securityContext.pod" (dict "context" $ctx "local" (default (dict) $ctx.Values.podSecurityContext) "chartKey" "erpc") }}
{{- end }}

{{/*
Merge container-level security context defaults with chart overrides.
*/}}
{{- define "erpc.securityContext.container" -}}
{{- $ctx := .context | default . -}}
{{ include "atk.securityContext.container" (dict "context" $ctx "local" (default (dict) $ctx.Values.containerSecurityContext) "chartKey" "erpc") }}
{{- end }}

{{/*
Compute GOMEMLIMIT value in bytes based on a Kubernetes memory limit and ratio.
If override is provided, it is used verbatim.
*/}}
{{- define "erpc.gc.computeGOMEMLIMIT" -}}
{{- $override := trim (default "" .override) -}}
{{- if ne $override "" -}}
{{- $override -}}
{{- else -}}
  {{- $limit := trim (default "" .limit) -}}
  {{- if eq $limit "" -}}
  {{- "" -}}
  {{- else -}}
    {{- $ratio := float64 (default 1 .ratio) -}}
    {{- $upper := upper $limit -}}
    {{- if and (gt (len $upper) 1) (hasSuffix $upper "B") -}}
      {{- $upper = trimSuffix "B" $upper -}}
    {{- end -}}
    {{- $digits := regexFind `^[0-9]+` $upper -}}
    {{- if eq $digits "" -}}
      {{- "" -}}
    {{- else -}}
      {{- $unit := trimPrefix $digits $upper -}}
      {{- $num := float64 $digits -}}
      {{- $multiplier := dict "value" 1.0 -}}
      {{- if or (eq $unit "K") (eq $unit "KI") -}}
        {{- $_ := set $multiplier "value" 1024.0 -}}
      {{- else if or (eq $unit "M") (eq $unit "MI") -}}
        {{- $_ := set $multiplier "value" (mul 1024.0 1024.0) -}}
      {{- else if or (eq $unit "G") (eq $unit "GI") -}}
        {{- $_ := set $multiplier "value" (mul 1024.0 1024.0 1024.0) -}}
      {{- else if or (eq $unit "T") (eq $unit "TI") -}}
        {{- $_ := set $multiplier "value" (mul 1024.0 1024.0 1024.0 1024.0) -}}
      {{- else if or (eq $unit "P") (eq $unit "PI") -}}
        {{- $_ := set $multiplier "value" (mul 1024.0 1024.0 1024.0 1024.0 1024.0) -}}
      {{- else if or (eq $unit "E") (eq $unit "EI") -}}
        {{- $_ := set $multiplier "value" (mul 1024.0 1024.0 1024.0 1024.0 1024.0 1024.0) -}}
      {{- end -}}
      {{- $bytes := mul $num (get $multiplier "value") -}}
      {{- $scaled := mul $bytes $ratio -}}
      {{- if lt $scaled 1 -}}
        {{- "" -}}
      {{- else -}}
        {{- printf "%.0f" $scaled -}}
      {{- end -}}
    {{- end -}}
  {{- end -}}
{{- end -}}
{{- end }}

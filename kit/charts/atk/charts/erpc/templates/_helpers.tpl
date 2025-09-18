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
Build a Redis URI from chart values.
Parameters: host, port, username, password, db, query (without leading '?').
*/}}
{{- define "erpc.redis.uri" -}}
{{- $host := default "redis" .host -}}
{{- $port := default 6379 .port -}}
{{- $username := default "" .username -}}
{{- $password := default "" .password -}}
{{- $db := default 0 .db -}}
{{- $query := trimPrefix "?" (default "" .query) -}}
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
{{- $uri := printf "redis://%s%s:%v/%v" $auth $host $port $db -}}
{{- if ne $query "" -}}
  {{- printf "%s?%s" $uri $query -}}
{{- else -}}
  {{- $uri -}}
{{- end -}}
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

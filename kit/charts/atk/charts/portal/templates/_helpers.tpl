{{/*
Expand the name of the chart.
Using common helper with chart-specific alias.
*/}}
{{- define "portal.name" -}}
{{ include "atk.common.name" . }}
{{- end }}

{{/*
Create a default fully qualified app name.
Using common helper with chart-specific alias.
*/}}
{{- define "portal.fullname" -}}
{{ include "atk.common.fullname" . }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
Using common helper with chart-specific alias.
*/}}
{{- define "portal.chart" -}}
{{ include "atk.common.chart" . }}
{{- end }}

{{/*
Common labels
Using common helper with chart-specific alias.
*/}}
{{- define "portal.labels" -}}
{{ include "atk.common.labels" . }}
{{- end }}

{{/*
Selector labels
Using common helper with chart-specific alias.
*/}}
{{- define "portal.selectorLabels" -}}
{{ include "atk.common.selectorLabels" . }}
{{- end }}

{{/*
Create the name of the service account to use
Using common helper with chart-specific alias.
*/}}
{{- define "portal.serviceAccountName" -}}
{{ include "atk.common.serviceAccountName" . }}
{{- end }}

{{/*
Return the target Kubernetes version
Using common helper with chart-specific alias.
*/}}
{{- define "portal.capabilities.kubeVersion" -}}
{{ include "atk.common.capabilities.kubeVersion" . }}
{{- end }}

{{/*
Return true if ingress supports ingressClassName field
Using common helper with chart-specific alias.
*/}}
{{- define "portal.ingress.supportsIngressClassname" -}}
{{ include "atk.common.ingress.supportsIngressClassname" . }}
{{- end }}

{{/*
Return true if ingress supports pathType field
Using common helper with chart-specific alias.
*/}}
{{- define "portal.ingress.supportsPathType" -}}
{{ include "atk.common.ingress.supportsPathType" . }}
{{- end }}

{{/*
Return namespace
Using common helper with chart-specific alias.
*/}}
{{- define "portal.namespace" -}}
{{ include "atk.common.namespace" . }}
{{- end }}

{{/*
Render template values
Using common helper with chart-specific alias.
*/}}
{{- define "portal.tplvalues.render" -}}
{{ include "atk.common.tplvalues.render" . }}
{{- end }}

{{/*
Resolve the effective network ID, preferring chart overrides and falling back to global.chainId.
*/}}
{{- define "portal.networkId" -}}
{{- $values := default (dict) .Values -}}
{{- $config := default (dict) (index $values "config") -}}
{{- $network := default (dict) (index $config "network") -}}
{{- $global := default (dict) (index $values "global") -}}
{{- $id := coalesce (index $network "networkId") (index $global "chainId") -}}
{{- if $id -}}{{- printf "%v" $id -}}{{- end -}}
{{- end }}

{{/*
Resolve the effective network name, preferring chart overrides and falling back to global.chainName.
*/}}
{{- define "portal.networkName" -}}
{{- $values := default (dict) .Values -}}
{{- $config := default (dict) (index $values "config") -}}
{{- $network := default (dict) (index $config "network") -}}
{{- $global := default (dict) (index $values "global") -}}
{{- $name := coalesce (index $network "networkName") (index $global "chainName") -}}
{{- if $name -}}{{- printf "%v" $name -}}{{- end -}}
{{- end }}

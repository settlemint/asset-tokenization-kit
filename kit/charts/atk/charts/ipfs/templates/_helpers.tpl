{{/*
Expand the name of the chart.
Using common helper with chart-specific alias.
*/}}
{{- define "ipfs-cluster.name" -}}
{{ include "atk.common.name" . }}
{{- end }}

{{/*
Create a default fully qualified app name.
Using common helper with chart-specific alias.
*/}}
{{- define "ipfs-cluster.fullname" -}}
{{ include "atk.common.fullname" . }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
Using common helper with chart-specific alias.
*/}}
{{- define "ipfs-cluster.chart" -}}
{{ include "atk.common.chart" . }}
{{- end }}

{{/*
Common labels
Using common helper with chart-specific alias.
*/}}
{{- define "ipfs-cluster.labels" -}}
{{ include "atk.common.labels" . }}
{{- end }}

{{/*
Selector labels
Using common helper with chart-specific alias.
*/}}
{{- define "ipfs-cluster.selectorLabels" -}}
{{ include "atk.common.selectorLabels" . }}
{{- end }}

{{/*
Create the name of the service account to use
Using common helper with chart-specific alias.
*/}}
{{- define "ipfs-cluster.serviceAccountName" -}}
{{ include "atk.common.serviceAccountName" . }}
{{- end }}

{{/*
Return the target Kubernetes version
Using common helper with chart-specific alias.
*/}}
{{- define "ipfs-cluster.capabilities.kubeVersion" -}}
{{ include "atk.common.capabilities.kubeVersion" . }}
{{- end }}

{{/*
Return true if ingress supports ingressClassName field
Using common helper with chart-specific alias.
*/}}
{{- define "ipfs-cluster.ingress.supportsIngressClassname" -}}
{{ include "atk.common.ingress.supportsIngressClassname" . }}
{{- end }}

{{/*
Return true if ingress supports pathType field
Using common helper with chart-specific alias.
*/}}
{{- define "ipfs-cluster.ingress.supportsPathType" -}}
{{ include "atk.common.ingress.supportsPathType" . }}
{{- end }}

{{/*
Return namespace
Using common helper with chart-specific alias.
*/}}
{{- define "ipfs-cluster.namespace" -}}
{{ include "atk.common.namespace" . }}
{{- end }}

{{/*
Render template values
Using common helper with chart-specific alias.
*/}}
{{- define "ipfs-cluster.tplvalues.render" -}}
{{ include "atk.common.tplvalues.render" . }}
{{- end }}

{{/*
Return merged pod security context defaults for the IPFS cluster chart.
*/}}
{{- define "ipfs-cluster.securityContext.pod" -}}
{{ include "atk.securityContext.pod" (dict "context" (.context | default .) "local" (default (dict) .local) "chartKey" "ipfsCluster") }}
{{- end }}

{{/*
Return merged container security context defaults for the IPFS cluster chart.
*/}}
{{- define "ipfs-cluster.securityContext.container" -}}
{{ include "atk.securityContext.container" (dict "context" (.context | default .) "local" (default (dict) .local) "chartKey" "ipfsCluster") }}
{{- end }}

{{/*
Return the name for the shared secret used by the cluster peers.
*/}}
{{- define "ipfs-cluster.sharedSecretName" -}}
{{ printf "%s-shared-secret" (include "ipfs-cluster.fullname" .) }}
{{- end }}

{{/*
Return the base name for the IPFS peer StatefulSet.
*/}}
{{- define "ipfs-cluster.ipfsFullname" -}}
{{ printf "%s-ipfs" (include "ipfs-cluster.fullname" .) }}
{{- end }}

{{/*
Return the base name for the Cluster peer StatefulSets.
*/}}
{{- define "ipfs-cluster.clusterFullname" -}}
{{ printf "%s-cluster" (include "ipfs-cluster.fullname" .) }}
{{- end }}

{{/*
Render combined image pull secrets for workloads.
*/}}
{{- define "ipfs-cluster.imagePullSecrets" -}}
{{ include "atk.common.imagePullSecrets" . }}
{{- end }}

{{/*
Validate and return a safe filename for init scripts defined in values.
The key must already be a valid ConfigMap key consisting of alphanumeric
characters plus dash, underscore, or dot to avoid invalid mounts.
*/}}
{{- define "ipfs-cluster.initScriptFileName" -}}
{{- $name := index . "name" -}}
{{- if not $name -}}
  {{- fail "ipfs.initScripts keys must not be empty" -}}
{{- end -}}
{{- if not (regexMatch "^[A-Za-z0-9_.-]+$" $name) -}}
  {{- fail (printf "ipfs.initScripts key %q must match ^[A-Za-z0-9_.-]+$" $name) -}}
{{- end -}}
{{- $name -}}
{{- end }}

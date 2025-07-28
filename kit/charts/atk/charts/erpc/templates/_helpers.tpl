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
Standard labels for compatibility with common templates
*/}}
{{- define "common.labels.standard" -}}
{{- $context := .context | default . -}}
{{- $customLabels := .customLabels | default dict -}}
helm.sh/chart: {{ include "erpc.chart" $context }}
{{ include "erpc.selectorLabels" $context }}
{{- if $context.Chart.AppVersion }}
app.kubernetes.io/version: {{ $context.Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ $context.Release.Service }}
{{- with $customLabels }}
{{ toYaml . }}
{{- end }}
{{- end -}}

{{/*
Full name for compatibility with common templates
*/}}
{{- define "common.names.fullname" -}}
{{ include "erpc.fullname" . }}
{{- end -}}

{{/*
Namespace for compatibility with common templates  
*/}}
{{- define "common.names.namespace" -}}
{{ include "erpc.namespace" . }}
{{- end -}}

{{/*
Template values render for compatibility with common templates
*/}}
{{- define "common.tplvalues.render" -}}
{{- $context := .context | default . -}}
{{- $value := .value -}}
{{- if typeIs "string" $value }}
  {{- tpl $value $context }}
{{- else }}
  {{- tpl ($value | toYaml) $context }}
{{- end }}
{{- end -}}

{{/*
Match labels for compatibility with common templates
*/}}
{{- define "common.labels.matchLabels" -}}
{{- $context := .context | default . -}}
{{- $customLabels := .customLabels | default dict -}}
{{ include "erpc.selectorLabels" $context }}
{{- with $customLabels }}
{{ toYaml . }}
{{- end }}
{{- end -}}

{{/*
Return the appropriate apiVersion for deployment - compatibility
*/}}
{{- define "common.capabilities.deployment.apiVersion" -}}
{{- if semverCompare "<1.14-0" (include "erpc.capabilities.kubeVersion" .) -}}
{{- print "extensions/v1beta1" -}}
{{- else -}}
{{- print "apps/v1" -}}
{{- end -}}
{{- end -}}

{{/*
Merge template values - compatibility
*/}}
{{- define "common.tplvalues.merge" -}}
{{- $context := .context | default . -}}
{{- $values := .values | default list -}}
{{- $result := dict -}}
{{- range $values -}}
  {{- if . -}}
    {{- $result = merge $result . -}}
  {{- end -}}
{{- end -}}
{{- if $result -}}
{{- toYaml $result -}}
{{- end -}}
{{- end -}}

{{/*
Return the appropriate apiVersion for ingress - compatibility
*/}}
{{- define "common.capabilities.ingress.apiVersion" -}}
{{- if semverCompare "<1.14-0" (include "erpc.capabilities.kubeVersion" .) -}}
{{- print "extensions/v1beta1" -}}
{{- else if semverCompare "<1.19-0" (include "erpc.capabilities.kubeVersion" .) -}}
{{- print "networking.k8s.io/v1beta1" -}}
{{- else -}}
{{- print "networking.k8s.io/v1" -}}
{{- end -}}
{{- end -}}

{{/*
Render image pull secrets - compatibility
*/}}
{{- define "common.images.renderPullSecrets" -}}
{{- $context := .context | default . -}}
{{- $images := .images | default list -}}
{{- $pullSecrets := list -}}
{{- range $images -}}
  {{- if .pullSecrets -}}
    {{- $pullSecrets = concat $pullSecrets .pullSecrets -}}
  {{- end -}}
{{- end -}}
{{- if $context.Values.global.imagePullSecrets -}}
  {{- $pullSecrets = concat $pullSecrets $context.Values.global.imagePullSecrets -}}
{{- end -}}
{{- if $pullSecrets -}}
imagePullSecrets:
{{- range $pullSecrets | uniq }}
  - name: {{ . }}
{{- end -}}
{{- end -}}
{{- end -}}

{{/*
Return image string - compatibility
*/}}
{{- define "common.images.image" -}}
{{- $imageRoot := .imageRoot -}}
{{- $global := .global | default dict -}}
{{- $registry := $imageRoot.registry | default $global.imageRegistry -}}
{{- $repository := $imageRoot.repository -}}
{{- $tag := $imageRoot.tag | default $global.imageTag -}}
{{- printf "%s/%s:%s" $registry $repository $tag -}}
{{- end -}}

{{/*
Return the appropriate apiVersion for HPA - compatibility
*/}}
{{- define "common.capabilities.hpa.apiVersion" -}}
{{- $context := .context | default . -}}
{{- if semverCompare "<1.23-0" (include "erpc.capabilities.kubeVersion" $context) -}}
{{- print "autoscaling/v2beta1" -}}
{{- else -}}
{{- print "autoscaling/v2" -}}
{{- end -}}
{{- end -}}

{{/*
Return the appropriate apiVersion for policy - compatibility
*/}}
{{- define "common.capabilities.policy.apiVersion" -}}
{{- if semverCompare "<1.21-0" (include "erpc.capabilities.kubeVersion" .) -}}
{{- print "policy/v1beta1" -}}
{{- else -}}
{{- print "policy/v1" -}}
{{- end -}}
{{- end -}}

{{/*
Pod affinity preset - compatibility
*/}}
{{- define "common.affinities.pods" -}}
{{- $type := .type -}}
{{- $customLabels := .customLabels | default dict -}}
{{- $context := .context -}}
{{- if eq $type "soft" }}
preferredDuringSchedulingIgnoredDuringExecution:
  - weight: 1
    podAffinityTerm:
      labelSelector:
        matchLabels: {{- (include "erpc.selectorLabels" $context) | nindent 10 }}
          {{- with $customLabels }}
          {{- toYaml . | nindent 10 }}
          {{- end }}
      topologyKey: kubernetes.io/hostname
{{- else if eq $type "hard" }}
requiredDuringSchedulingIgnoredDuringExecution:
  - labelSelector:
      matchLabels: {{- (include "erpc.selectorLabels" $context) | nindent 8 }}
        {{- with $customLabels }}
        {{- toYaml . | nindent 8 }}
        {{- end }}
    topologyKey: kubernetes.io/hostname
{{- end -}}
{{- end -}}

{{/*
Node affinity preset - compatibility
*/}}
{{- define "common.affinities.nodes" -}}
{{- $type := .type -}}
{{- $key := .key -}}
{{- $values := .values -}}
{{- if eq $type "soft" }}
preferredDuringSchedulingIgnoredDuringExecution:
  - weight: 1
    preference:
      matchExpressions:
        - key: {{ $key }}
          operator: In
          values: {{- $values | toYaml | nindent 12 }}
{{- else if eq $type "hard" }}
requiredDuringSchedulingIgnoredDuringExecution:
  nodeSelectorTerms:
    - matchExpressions:
        - key: {{ $key }}
          operator: In
          values: {{- $values | toYaml | nindent 12 }}
{{- end -}}
{{- end -}}

{{/*
Rolling tag warning - compatibility
*/}}
{{- define "common.warnings.rollingTag" -}}
{{- if and .registry .repository .tag }}
{{- if and (contains "latest" .tag) (not .registry) }}

WARNING: Rolling tag detected ({{ .repository }}:{{ .tag }}), please note that it is strongly recommended to avoid using rolling tags in a production environment.
+info https://docs.bitnami.com/containers/how-to/understand-rolling-tags-containers/

{{- end }}
{{- end -}}
{{- end -}}

{{/*
Ingress backend helper - compatibility
*/}}
{{- define "common.ingress.backend" -}}
{{- $serviceName := .serviceName -}}
{{- $servicePort := .servicePort -}}
{{- $context := .context -}}
{{- if semverCompare "<1.19-0" (include "erpc.capabilities.kubeVersion" $context) }}
serviceName: {{ $serviceName }}
servicePort: {{ $servicePort }}
{{- else }}
service:
  name: {{ $serviceName }}
  port:
    {{- if kindIs "float64" $servicePort }}
    number: {{ $servicePort }}
    {{- else }}
    name: {{ $servicePort }}
    {{- end }}
{{- end -}}
{{- end -}}

{{/*
Check if ingress is using cert-manager - compatibility
*/}}
{{- define "common.ingress.certManagerRequest" -}}
{{- $annotations := .annotations -}}
{{- if or (hasKey $annotations "cert-manager.io/cluster-issuer") (hasKey $annotations "cert-manager.io/issuer") }}
{{- print "true" -}}
{{- else }}
{{- print "false" -}}
{{- end -}}
{{- end -}}

{{/*
Chart name helper - compatibility
*/}}
{{- define "common.names.name" -}}
{{ include "erpc.name" . }}
{{- end -}}

{{/*
Return true if ingress supports ingressClassName field - compatibility
*/}}
{{- define "common.ingress.supportsIngressClassname" -}}
{{- if semverCompare "<1.18-0" (include "erpc.capabilities.kubeVersion" .) -}}
{{- print "false" -}}
{{- else -}}
{{- print "true" -}}
{{- end -}}
{{- end -}}

{{/*
Return true if ingress supports pathType field - compatibility
*/}}
{{- define "common.ingress.supportsPathType" -}}
{{- if semverCompare "<1.18-0" (include "erpc.capabilities.kubeVersion" .) -}}
{{- print "false" -}}
{{- else -}}
{{- print "true" -}}
{{- end -}}
{{- end -}}
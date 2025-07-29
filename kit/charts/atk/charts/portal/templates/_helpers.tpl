{{/*
Expand the name of the chart.
*/}}
{{- define "portal.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "portal.fullname" -}}
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
{{- define "portal.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "portal.labels" -}}
helm.sh/chart: {{ include "portal.chart" . }}
{{ include "portal.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- with .Values.commonLabels }}
{{ toYaml . }}
{{- end }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "portal.selectorLabels" -}}
app.kubernetes.io/name: {{ include "portal.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "portal.serviceAccountName" -}}
{{- if .Values.serviceAccount.create -}}
{{- default (include "portal.fullname" .) .Values.serviceAccount.name -}}
{{- else -}}
{{- default "default" .Values.serviceAccount.name -}}
{{- end -}}
{{- end -}}

{{/*
Return the target Kubernetes version
*/}}
{{- define "portal.capabilities.kubeVersion" -}}
{{- if .Values.global }}
    {{- if .Values.global.kubeVersion }}
    {{- .Values.global.kubeVersion -}}
    {{- else }}
    {{- default .Capabilities.KubeVersion.Version .Values.kubeVersion -}}
    {{- end -}}
{{- else }}
{{- default .Capabilities.KubeVersion.Version .Values.kubeVersion -}}
{{- end -}}
{{- end -}}

{{/*
Return true if ingress supports ingressClassName field
*/}}
{{- define "portal.ingress.supportsIngressClassname" -}}
{{- if semverCompare "<1.18-0" (include "portal.capabilities.kubeVersion" .) -}}
{{- print "false" -}}
{{- else -}}
{{- print "true" -}}
{{- end -}}
{{- end -}}

{{/*
Return true if ingress supports pathType field
*/}}
{{- define "portal.ingress.supportsPathType" -}}
{{- if semverCompare "<1.18-0" (include "portal.capabilities.kubeVersion" .) -}}
{{- print "false" -}}
{{- else -}}
{{- print "true" -}}
{{- end -}}
{{- end -}}

{{/*
Return namespace
*/}}
{{- define "portal.namespace" -}}
{{- default .Release.Namespace .Values.namespace -}}
{{- end -}}

{{/*
Render template values
*/}}
{{- define "portal.tplvalues.render" -}}
{{- if typeIs "string" .value }}
  {{- tpl .value .context }}
{{- else }}
  {{- tpl (.value | toYaml) .context }}
{{- end }}
{{- end -}}

{{/*
Standard labels for compatibility with common templates
*/}}
{{- define "common.labels.standard" -}}
{{- $context := .context | default . -}}
{{- $customLabels := .customLabels | default dict -}}
helm.sh/chart: {{ include "portal.chart" $context }}
{{ include "portal.selectorLabels" $context }}
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
{{ include "portal.fullname" . }}
{{- end -}}

{{/*
Namespace for compatibility with common templates  
*/}}
{{- define "common.names.namespace" -}}
{{ include "portal.namespace" . }}
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
{{ include "portal.selectorLabels" $context }}
{{- with $customLabels }}
{{ toYaml . }}
{{- end }}
{{- end -}}

{{/*
Return the appropriate apiVersion for deployment - compatibility
*/}}
{{- define "common.capabilities.deployment.apiVersion" -}}
{{- if semverCompare "<1.14-0" (include "portal.capabilities.kubeVersion" .) -}}
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
{{- if semverCompare "<1.14-0" (include "portal.capabilities.kubeVersion" .) -}}
{{- print "extensions/v1beta1" -}}
{{- else if semverCompare "<1.19-0" (include "portal.capabilities.kubeVersion" .) -}}
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
{{- if semverCompare "<1.23-0" (include "portal.capabilities.kubeVersion" $context) -}}
{{- print "autoscaling/v2beta1" -}}
{{- else -}}
{{- print "autoscaling/v2" -}}
{{- end -}}
{{- end -}}

{{/*
Return the appropriate apiVersion for policy - compatibility
*/}}
{{- define "common.capabilities.policy.apiVersion" -}}
{{- if semverCompare "<1.21-0" (include "portal.capabilities.kubeVersion" .) -}}
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
        matchLabels: {{- (include "portal.selectorLabels" $context) | nindent 10 }}
          {{- with $customLabels }}
          {{- toYaml . | nindent 10 }}
          {{- end }}
      topologyKey: kubernetes.io/hostname
{{- else if eq $type "hard" }}
requiredDuringSchedulingIgnoredDuringExecution:
  - labelSelector:
      matchLabels: {{- (include "portal.selectorLabels" $context) | nindent 8 }}
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
{{- if semverCompare "<1.19-0" (include "portal.capabilities.kubeVersion" $context) }}
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
{{ include "portal.name" . }}
{{- end -}}

{{/*
Return true if ingress supports ingressClassName field - compatibility
*/}}
{{- define "common.ingress.supportsIngressClassname" -}}
{{- if semverCompare "<1.18-0" (include "portal.capabilities.kubeVersion" .) -}}
{{- print "false" -}}
{{- else -}}
{{- print "true" -}}
{{- end -}}
{{- end -}}

{{/*
Return true if ingress supports pathType field - compatibility
*/}}
{{- define "common.ingress.supportsPathType" -}}
{{- if semverCompare "<1.18-0" (include "portal.capabilities.kubeVersion" .) -}}
{{- print "false" -}}
{{- else -}}
{{- print "true" -}}
{{- end -}}
{{- end -}}
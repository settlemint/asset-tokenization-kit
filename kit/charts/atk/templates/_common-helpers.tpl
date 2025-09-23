{{/*
ATK Common Helpers - Shared template functions across all charts
This file contains common helper functions to reduce duplication across all sub-charts.
Each chart includes this file and can override specific functions as needed.
*/}}

{{/*
Expand the name of the chart - Generic version
Usage: {{ include "atk.common.name" . }}
*/}}
{{- define "atk.common.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name - Generic version
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
Usage: {{ include "atk.common.fullname" . }}
*/}}
{{- define "atk.common.fullname" -}}
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
Create chart name and version as used by the chart label - Generic version
Usage: {{ include "atk.common.chart" . }}
*/}}
{{- define "atk.common.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels - Generic version
Usage: {{ include "atk.common.labels" . }}
*/}}
{{- define "atk.common.labels" -}}
helm.sh/chart: {{ include "atk.common.chart" . }}
{{ include "atk.common.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- with .Values.commonLabels }}
{{ toYaml . }}
{{- end }}
{{- if .Values.global.labels }}
{{ toYaml .Values.global.labels }}
{{- end }}
{{- end }}

{{/*
Selector labels - Generic version
Usage: {{ include "atk.common.selectorLabels" . }}
*/}}
{{- define "atk.common.selectorLabels" -}}
app.kubernetes.io/name: {{ include "atk.common.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use - Generic version
Usage: {{ include "atk.common.serviceAccountName" . }}
*/}}
{{- define "atk.common.serviceAccountName" -}}
{{- if .Values.serviceAccount.create -}}
{{- default (include "atk.common.fullname" .) .Values.serviceAccount.name -}}
{{- else -}}
{{- default "default" .Values.serviceAccount.name -}}
{{- end -}}
{{- end -}}

{{/*
Return the target Kubernetes version - Generic version
Usage: {{ include "atk.common.capabilities.kubeVersion" . }}
*/}}
{{- define "atk.common.capabilities.kubeVersion" -}}
{{- if .Values.global -}}
  {{- .Values.global.kubeVersion | default .Values.kubeVersion | default .Capabilities.KubeVersion.Version -}}
{{- else -}}
  {{- .Values.kubeVersion | default .Capabilities.KubeVersion.Version -}}
{{- end -}}
{{- end -}}

{{/*
Return true if ingress supports ingressClassName field
Usage: {{ include "atk.common.ingress.supportsIngressClassname" . }}
*/}}
{{- define "atk.common.ingress.supportsIngressClassname" -}}
{{- if semverCompare "<1.18-0" (include "atk.common.capabilities.kubeVersion" .) -}}
{{- print "false" -}}
{{- else -}}
{{- print "true" -}}
{{- end -}}
{{- end -}}

{{/*
Return true if ingress supports pathType field
Usage: {{ include "atk.common.ingress.supportsPathType" . }}
*/}}
{{- define "atk.common.ingress.supportsPathType" -}}
{{- if semverCompare "<1.18-0" (include "atk.common.capabilities.kubeVersion" .) -}}
{{- print "false" -}}
{{- else -}}
{{- print "true" -}}
{{- end -}}
{{- end -}}

{{/*
Return namespace
Usage: {{ include "atk.common.namespace" . }}
*/}}
{{- define "atk.common.namespace" -}}
{{- default .Release.Namespace .Values.namespace -}}
{{- end -}}

{{/*
Render template values
Usage: {{ include "atk.common.tplvalues.render" (dict "value" .Values.someValue "context" $) }}
*/}}
{{- define "atk.common.tplvalues.render" -}}
{{- if typeIs "string" .value }}
  {{- tpl .value .context }}
{{- else }}
  {{- tpl (.value | toYaml) .context }}
{{- end }}
{{- end -}}

{{/*
Common image pull secrets for all deployments/statefulsets
This dynamically generates the list based on enabled registries in imagePullCredentials
Usage: {{ include "atk.common.imagePullSecrets" . }}
*/}}
{{- define "atk.common.imagePullSecrets" -}}
{{- $root := . -}}
{{- $secretsDict := dict -}}
{{- $localCredentials := .Values.imagePullCredentials }}
{{- $globalCredentials := .Values.global.imagePullCredentials }}
{{- $credentials := $globalCredentials }}
{{- if and $localCredentials $localCredentials.registries (gt (len $localCredentials.registries) 0) }}
  {{- $credentials = $localCredentials }}
{{- end }}
{{- if $credentials -}}
  {{- if $credentials.registries -}}
    {{- range $name, $registry := $credentials.registries -}}
      {{- if $registry.enabled -}}
        {{- $secretName := printf "image-pull-secret-%s" $name -}}
        {{- $_ := set $secretsDict $secretName true -}}
      {{- end -}}
    {{- end -}}
  {{- end -}}
{{- end -}}
{{- if not $credentials -}}
  {{- if .Values.global -}}
    {{- if .Values.global.imagePullSecrets -}}
      {{- range .Values.global.imagePullSecrets -}}
        {{- if kindIs "string" . -}}
          {{- $_ := set $secretsDict . true -}}
        {{- else if kindIs "map" . -}}
          {{- if .name -}}
            {{- $_ := set $secretsDict .name true -}}
          {{- end -}}
        {{- end -}}
      {{- end -}}
    {{- end -}}
  {{- end -}}
{{- end -}}
{{- if .Values.imagePullSecrets -}}
  {{- if kindIs "slice" .Values.imagePullSecrets -}}
    {{- range .Values.imagePullSecrets -}}
      {{- if kindIs "string" . -}}
        {{- $_ := set $secretsDict . true -}}
      {{- else if kindIs "map" . -}}
        {{- if .name -}}
          {{- $_ := set $secretsDict .name true -}}
        {{- end -}}
      {{- end -}}
    {{- end -}}
  {{- end -}}
{{- end -}}
{{- if $secretsDict }}
imagePullSecrets:
{{- range $secretName, $_ := $secretsDict }}
  - name: {{ $secretName }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Generate docker config for image pull secret
Usage: {{ include "atk.common.imagePullSecret" (dict "registry" "docker.io" "username" "user" "password" "pass" "email" "email@example.com") }}
*/}}
{{- define "atk.common.imagePullSecret" -}}
{{- $registry := .registry -}}
{{- $username := .username -}}
{{- $password := .password -}}
{{- $email := .email -}}
{{- $auth := printf "%s:%s" $username $password | b64enc -}}
{
  "auths": {
    "{{ $registry }}": {
      "username": "{{ $username }}",
      "password": "{{ $password }}",
      "email": "{{ $email }}",
      "auth": "{{ $auth }}"
    }
  }
}
{{- end }}

{{/*
=============================================================================
BITNAMI COMPATIBILITY HELPERS
These helpers provide compatibility with Bitnami chart patterns
=============================================================================
*/}}

{{/*
Standard labels for compatibility with common templates
Usage: {{ include "common.labels.standard" . }}
*/}}
{{- define "common.labels.standard" -}}
{{- $context := .context | default . -}}
{{- $customLabels := .customLabels | default dict -}}
helm.sh/chart: {{ include "atk.common.chart" $context }}
{{ include "atk.common.selectorLabels" $context }}
{{- if $context.Chart.AppVersion }}
app.kubernetes.io/version: {{ $context.Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ $context.Release.Service }}
{{- if $context.Values.global.labels }}
{{ toYaml $context.Values.global.labels }}
{{- end }}
{{- with $customLabels }}
{{ toYaml . }}
{{- end }}
{{- end -}}

{{/*
Full name for compatibility with common templates
Usage: {{ include "common.names.fullname" . }}
*/}}
{{- define "common.names.fullname" -}}
{{ include "atk.common.fullname" . }}
{{- end -}}

{{/*
Chart name for compatibility with common templates
Usage: {{ include "common.names.name" . }}
*/}}
{{- define "common.names.name" -}}
{{ include "atk.common.name" . }}
{{- end -}}

{{/*
Namespace for compatibility with common templates  
Usage: {{ include "common.names.namespace" . }}
*/}}
{{- define "common.names.namespace" -}}
{{ include "atk.common.namespace" . }}
{{- end -}}

{{/*
Template values render for compatibility with common templates
Usage: {{ include "common.tplvalues.render" (dict "value" .Values.someValue "context" $) }}
*/}}
{{- define "common.tplvalues.render" -}}
{{ include "atk.common.tplvalues.render" . }}
{{- end -}}

{{/*
Match labels for compatibility with common templates
Usage: {{ include "common.labels.matchLabels" . }}
*/}}
{{- define "common.labels.matchLabels" -}}
{{- $context := .context | default . -}}
{{- $customLabels := .customLabels | default dict -}}
{{ include "atk.common.selectorLabels" $context }}
{{- with $customLabels }}
{{ toYaml . }}
{{- end }}
{{- end -}}

{{/*
Return the appropriate apiVersion for deployment - compatibility
Usage: {{ include "common.capabilities.deployment.apiVersion" . }}
*/}}
{{- define "common.capabilities.deployment.apiVersion" -}}
{{- if semverCompare "<1.14-0" (include "atk.common.capabilities.kubeVersion" .) -}}
{{- print "extensions/v1beta1" -}}
{{- else -}}
{{- print "apps/v1" -}}
{{- end -}}
{{- end -}}

{{/*
Return the appropriate apiVersion for ingress - compatibility
Usage: {{ include "common.capabilities.ingress.apiVersion" . }}
*/}}
{{- define "common.capabilities.ingress.apiVersion" -}}
{{- if semverCompare "<1.14-0" (include "atk.common.capabilities.kubeVersion" .) -}}
{{- print "extensions/v1beta1" -}}
{{- else if semverCompare "<1.19-0" (include "atk.common.capabilities.kubeVersion" .) -}}
{{- print "networking.k8s.io/v1beta1" -}}
{{- else -}}
{{- print "networking.k8s.io/v1" -}}
{{- end -}}
{{- end -}}

{{/*
Return the appropriate apiVersion for HPA - compatibility
Usage: {{ include "common.capabilities.hpa.apiVersion" . }}
*/}}
{{- define "common.capabilities.hpa.apiVersion" -}}
{{- $context := .context | default . -}}
{{- if semverCompare "<1.23-0" (include "atk.common.capabilities.kubeVersion" $context) -}}
{{- print "autoscaling/v2beta1" -}}
{{- else -}}
{{- print "autoscaling/v2" -}}
{{- end -}}
{{- end -}}

{{/*
Return the appropriate apiVersion for policy - compatibility
Usage: {{ include "common.capabilities.policy.apiVersion" . }}
*/}}
{{- define "common.capabilities.policy.apiVersion" -}}
{{- if semverCompare "<1.21-0" (include "atk.common.capabilities.kubeVersion" .) -}}
{{- print "policy/v1beta1" -}}
{{- else -}}
{{- print "policy/v1" -}}
{{- end -}}
{{- end -}}

{{/*
Render image pull secrets - compatibility
Usage: {{ include "common.images.renderPullSecrets" (dict "images" .Values.images "context" $) }}
*/}}
{{- define "common.images.renderPullSecrets" -}}
{{- $context := .context | default . -}}
{{- include "atk.common.imagePullSecrets" $context -}}
{{- end -}}

{{/*
Return image string - compatibility
Usage: {{ include "common.images.image" (dict "imageRoot" .Values.image "global" .Values.global) }}
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
Merge shared and chart-specific security context defaults with local overrides.
Parameters:
- context: root context
- category: "pod" or "container"
- chartKey: optional global.<chartKey>.securityContexts fallback
- legacyKey: optional override for legacy subkey lookup (defaults to chartKey)
- local: chart-level overrides
*/}}
{{- define "atk.securityContext.merge" -}}
{{- $context := .context | default . -}}
{{- $category := default "pod" .category -}}
{{- $local := default (dict) .local -}}
{{- $chartKey := default "" .chartKey -}}
{{- $legacyKey := default $chartKey .legacyKey -}}
{{- $values := list -}}
{{- if and $context.Values.global (hasKey $context.Values.global "securityContexts") -}}
  {{- $shared := index $context.Values.global "securityContexts" -}}
  {{- if and $shared (hasKey $shared $category) -}}
    {{- $values = append $values (index $shared $category) -}}
  {{- end -}}
{{- end -}}
{{- if and (ne $legacyKey "") $context.Values.global (hasKey $context.Values.global $legacyKey) -}}
  {{- $chartGlobal := index $context.Values.global $legacyKey -}}
  {{- if and $chartGlobal (hasKey $chartGlobal "securityContexts") -}}
    {{- $legacyContexts := index $chartGlobal "securityContexts" -}}
    {{- if and $legacyContexts (hasKey $legacyContexts $category) -}}
      {{- $values = append $values (index $legacyContexts $category) -}}
    {{- end -}}
  {{- end -}}
{{- end -}}
{{- $values = append $values $local -}}
{{- $merged := include "common.tplvalues.merge" (dict "values" $values "context" $context) -}}
{{- if $merged -}}
{{- $merged -}}
{{- else -}}
{{- toYaml dict -}}
{{- end -}}
{{- end }}

{{/*
Return merged pod security context defaults.
*/}}
{{- define "atk.securityContext.pod" -}}
{{ include "atk.securityContext.merge" (dict "context" (.context | default .) "category" "pod" "local" (default (dict) .local) "chartKey" (default "" .chartKey) "legacyKey" (default (default "" .legacyKey))) }}
{{- end }}

{{/*
Return merged container security context defaults.
*/}}
{{- define "atk.securityContext.container" -}}
{{ include "atk.securityContext.merge" (dict "context" (.context | default .) "category" "container" "local" (default (dict) .local) "chartKey" (default "" .chartKey) "legacyKey" (default (default "" .legacyKey))) }}
{{- end }}

{{/*
Merge template values - compatibility
Usage: {{ include "common.tplvalues.merge" (dict "values" (list .Values.val1 .Values.val2) "context" $) }}
*/}}
{{- define "common.tplvalues.merge" -}}
{{- $context := .context | default . -}}
{{- $values := .values | default list -}}
{{- $result := dict -}}
{{- range $values -}}
  {{- if . -}}
    {{- $result = mergeOverwrite $result . -}}
  {{- end -}}
{{- end -}}
{{- if $result -}}
{{- toYaml $result -}}
{{- end -}}
{{- end -}}

{{/*
Pod affinity preset - compatibility
Usage: {{ include "common.affinities.pods" (dict "type" "soft" "context" $ "customLabels" .Values.customLabels) }}
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
        matchLabels: {{- (include "atk.common.selectorLabels" $context) | nindent 10 }}
          {{- with $customLabels }}
          {{- toYaml . | nindent 10 }}
          {{- end }}
      topologyKey: kubernetes.io/hostname
{{- else if eq $type "hard" }}
requiredDuringSchedulingIgnoredDuringExecution:
  - labelSelector:
      matchLabels: {{- (include "atk.common.selectorLabels" $context) | nindent 8 }}
        {{- with $customLabels }}
        {{- toYaml . | nindent 8 }}
        {{- end }}
    topologyKey: kubernetes.io/hostname
{{- end -}}
{{- end -}}

{{/*
Node affinity preset - compatibility
Usage: {{ include "common.affinities.nodes" (dict "type" "soft" "key" "kubernetes.io/arch" "values" (list "amd64")) }}
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
Usage: {{ include "common.warnings.rollingTag" .Values.image }}
*/}}
{{- define "common.warnings.rollingTag" -}}
{{- if and .repository .tag }}
{{- if and (contains "latest" .tag) (not .registry) }}

WARNING: Rolling tag detected ({{ .repository }}:{{ .tag }}), please note that it is strongly recommended to avoid using rolling tags in a production environment.
+info https://docs.bitnami.com/containers/how-to/understand-rolling-tags-containers/

{{- end }}
{{- end -}}
{{- end -}}

{{/*
Ingress backend helper - compatibility
Usage: {{ include "common.ingress.backend" (dict "serviceName" "my-service" "servicePort" 80 "context" $) }}
*/}}
{{- define "common.ingress.backend" -}}
{{- $serviceName := .serviceName -}}
{{- $servicePort := .servicePort -}}
{{- $context := .context -}}
{{- if semverCompare "<1.19-0" (include "atk.common.capabilities.kubeVersion" $context) }}
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
Usage: {{ include "common.ingress.certManagerRequest" .Values.ingress.annotations }}
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
Return true if ingress supports ingressClassName field - compatibility
Usage: {{ include "common.ingress.supportsIngressClassname" . }}
*/}}
{{- define "common.ingress.supportsIngressClassname" -}}
{{ include "atk.common.ingress.supportsIngressClassname" . }}
{{- end -}}

{{/*
Return true if ingress supports pathType field - compatibility
Usage: {{ include "common.ingress.supportsPathType" . }}
*/}}
{{- define "common.ingress.supportsPathType" -}}
{{ include "atk.common.ingress.supportsPathType" . }}
{{- end -}}

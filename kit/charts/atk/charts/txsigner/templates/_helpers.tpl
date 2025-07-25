{{/*
Expand the name of the chart.
*/}}
{{- define "txsigner.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "txsigner.fullname" -}}
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- $name := default .Chart.Name .Values.nameOverride -}}
{{- if contains $name .Release.Name -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}
{{- end -}}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "txsigner.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Common labels
*/}}
{{- define "txsigner.labels" -}}
helm.sh/chart: {{ include "txsigner.chart" . }}
{{ include "txsigner.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- if .Values.commonLabels }}
{{ toYaml .Values.commonLabels }}
{{- end }}
{{- end -}}

{{/*
Selector labels
*/}}
{{- define "txsigner.selectorLabels" -}}
app.kubernetes.io/name: {{ include "txsigner.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}

{{/*
Create the name of the service account to use
*/}}
{{- define "txsigner.serviceAccountName" -}}
{{- if .Values.serviceAccount.create -}}
{{- default (include "txsigner.fullname" .) .Values.serviceAccount.name -}}
{{- else -}}
{{- default "default" .Values.serviceAccount.name -}}
{{- end -}}
{{- end -}}

{{/*
Namespace
*/}}
{{- define "txsigner.namespace" -}}
{{- default .Release.Namespace .Values.namespaceOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Return the proper image name
*/}}
{{- define "txsigner.image" -}}
{{- $registryName := .Values.image.registry -}}
{{- $repositoryName := .Values.image.repository -}}
{{- $tag := .Values.image.tag | toString -}}
{{- if .Values.global }}
    {{- if .Values.global.imageRegistry }}
        {{- $registryName = .Values.global.imageRegistry -}}
    {{- end -}}
{{- end -}}
{{- if .Values.image.digest }}
    {{- printf "%s/%s@%s" $registryName $repositoryName .Values.image.digest -}}
{{- else -}}
    {{- printf "%s/%s:%s" $registryName $repositoryName $tag -}}
{{- end -}}
{{- end -}}

{{/*
Return the proper Docker Image Registry Secret Names
*/}}
{{- define "txsigner.imagePullSecrets" -}}
{{- include "common.images.renderPullSecrets" (dict "images" (list .Values.image) "context" $) -}}
{{- end -}}

{{/* Common template functions */}}

{{/*
Common naming functions
*/}}
{{- define "common.names.name" -}}
{{- include "txsigner.name" . -}}
{{- end -}}

{{- define "common.names.fullname" -}}
{{- include "txsigner.fullname" . -}}
{{- end -}}

{{- define "common.names.namespace" -}}
{{- include "txsigner.namespace" . -}}
{{- end -}}

{{- define "common.names.chart" -}}
{{- include "txsigner.chart" . -}}
{{- end -}}

{{/*
Common labeling functions
*/}}
{{- define "common.labels.standard" -}}
{{- if hasKey . "customLabels" -}}
{{ include "txsigner.labels" .context }}
{{- if .customLabels }}
{{ toYaml .customLabels }}
{{- end }}
{{- else -}}
{{ include "txsigner.labels" . }}
{{- end -}}
{{- end -}}

{{- define "common.labels.matchLabels" -}}
{{- if hasKey . "customLabels" -}}
{{ include "txsigner.selectorLabels" .context }}
{{- if .customLabels }}
{{ toYaml .customLabels }}
{{- end }}
{{- else -}}
{{ include "txsigner.selectorLabels" . }}
{{- end -}}
{{- end -}}

{{/*
Capabilities functions
*/}}
{{- define "common.capabilities.kubeVersion" -}}
{{- default .Capabilities.KubeVersion.Version .Values.kubeVersion -}}
{{- end -}}

{{- define "common.capabilities.deployment.apiVersion" -}}
{{- if semverCompare ">=1.14-0" (include "common.capabilities.kubeVersion" .) -}}
{{- print "apps/v1" -}}
{{- else -}}
{{- print "extensions/v1beta1" -}}
{{- end -}}
{{- end -}}

{{- define "common.capabilities.ingress.apiVersion" -}}
{{- if and (.Capabilities.APIVersions.Has "networking.k8s.io/v1") (semverCompare ">=1.19-0" (include "common.capabilities.kubeVersion" .)) -}}
{{- print "networking.k8s.io/v1" -}}
{{- else if .Capabilities.APIVersions.Has "networking.k8s.io/v1beta1" -}}
{{- print "networking.k8s.io/v1beta1" -}}
{{- else -}}
{{- print "extensions/v1beta1" -}}
{{- end -}}
{{- end -}}

{{- define "common.capabilities.hpa.apiVersion" -}}
{{- if semverCompare ">=1.23-0" (include "common.capabilities.kubeVersion" .) -}}
{{- print "autoscaling/v2" -}}
{{- else if semverCompare ">=1.12-0" (include "common.capabilities.kubeVersion" .) -}}
{{- print "autoscaling/v2beta2" -}}
{{- else -}}
{{- print "autoscaling/v2beta1" -}}
{{- end -}}
{{- end -}}

{{- define "common.capabilities.policy.apiVersion" -}}
{{- if semverCompare ">=1.21-0" (include "common.capabilities.kubeVersion" .) -}}
{{- print "policy/v1" -}}
{{- else -}}
{{- print "policy/v1beta1" -}}
{{- end -}}
{{- end -}}

{{/*
Ingress functions
*/}}
{{- define "common.ingress.supportsIngressClassname" -}}
{{- if semverCompare ">=1.18-0" (include "common.capabilities.kubeVersion" .) -}}
{{- print "true" -}}
{{- else -}}
{{- print "false" -}}
{{- end -}}
{{- end -}}

{{- define "common.ingress.supportsPathType" -}}
{{- if semverCompare ">=1.18-0" (include "common.capabilities.kubeVersion" .) -}}
{{- print "true" -}}
{{- else -}}
{{- print "false" -}}
{{- end -}}
{{- end -}}

{{- define "common.ingress.backend" -}}
{{- $apiVersion := (include "common.capabilities.ingress.apiVersion" .context) -}}
{{- if or (eq $apiVersion "extensions/v1beta1") (eq $apiVersion "networking.k8s.io/v1beta1") -}}
serviceName: {{ .serviceName }}
servicePort: {{ .servicePort }}
{{- else -}}
service:
  name: {{ .serviceName }}
  port:
    {{- if typeIs "string" .servicePort }}
    name: {{ .servicePort }}
    {{- else }}
    number: {{ .servicePort }}
    {{- end }}
{{- end -}}
{{- end -}}

{{- define "common.ingress.certManagerRequest" -}}
{{- if .Values.ingress.tls -}}
{{- $annotations := include "common.tplvalues.merge" ( dict "values" ( list .Values.ingress.annotations .Values.commonAnnotations ) "context" . ) | fromYaml -}}
{{- if hasKey $annotations "cert-manager.io/cluster-issuer" -}}
{{- printf "cert-manager.io/cluster-issuer" -}}
{{- else if hasKey $annotations "kubernetes.io/tls-acme" -}}
{{- printf "kubernetes.io/tls-acme" -}}
{{- end -}}
{{- end -}}
{{- end -}}

{{/*
Template functions for common operations
*/}}
{{- define "common.tplvalues.render" -}}
{{- if typeIs "string" .value }}
    {{- tpl .value .context }}
{{- else }}
    {{- tpl (.value | toYaml) .context }}
{{- end }}
{{- end -}}

{{- define "common.tplvalues.merge" -}}
{{- $merged := dict -}}
{{- range .values -}}
  {{- $merged = mustMergeOverwrite $merged . -}}
{{- end -}}
{{- $merged | toYaml -}}
{{- end -}}

{{/*
Image pull secrets
*/}}
{{- define "common.images.renderPullSecrets" -}}
{{- $pullSecrets := list -}}
{{- if .context.Values.global -}}
  {{- range .context.Values.global.imagePullSecrets -}}
    {{- $pullSecrets = append $pullSecrets . -}}
  {{- end -}}
{{- end -}}
{{- range .images -}}
  {{- range .pullSecrets -}}
    {{- $pullSecrets = append $pullSecrets . -}}
  {{- end -}}
{{- end -}}
{{- if (not (empty $pullSecrets)) }}
imagePullSecrets:
{{- range $pullSecrets | uniq }}
  - name: {{ . }}
{{- end }}
{{- end -}}
{{- end -}}

{{/*
Affinity functions (simplified)
*/}}
{{- define "common.affinities.nodes" -}}
{{- if eq .type "hard" }}
requiredDuringSchedulingIgnoredDuringExecution:
  nodeSelectorTerms:
    - matchExpressions:
        - key: {{ .key }}
          operator: In
          values:
            {{- range .values }}
            - {{ . | quote }}
            {{- end }}
{{- else if eq .type "soft" }}
preferredDuringSchedulingIgnoredDuringExecution:
  - weight: 1
    preference:
      matchExpressions:
        - key: {{ .key }}
          operator: In
          values:
            {{- range .values }}
            - {{ . | quote }}
            {{- end }}
{{- end -}}
{{- end -}}

{{- define "common.affinities.pods" -}}
{{- $component := default "" .component -}}
{{- $customLabels := default (dict) .customLabels -}}
{{- $context := .context -}}
{{- if eq .type "hard" }}
requiredDuringSchedulingIgnoredDuringExecution:
  - labelSelector:
      matchLabels: {{- (include "common.labels.matchLabels" ( dict "customLabels" $customLabels "context" $context )) | nindent 8 }}
      {{- if $component }}
        {{- printf "app.kubernetes.io/component: %s" $component | nindent 8 }}
      {{- end }}
    topologyKey: kubernetes.io/hostname
{{- else if eq .type "soft" }}
preferredDuringSchedulingIgnoredDuringExecution:
  - weight: 1
    podAffinityTerm:
      labelSelector:
        matchLabels: {{- (include "common.labels.matchLabels" ( dict "customLabels" $customLabels "context" $context )) | nindent 10 }}
        {{- if $component }}
          {{- printf "app.kubernetes.io/component: %s" $component | nindent 10 }}
        {{- end }}
      topologyKey: kubernetes.io/hostname
{{- end -}}
{{- end -}}
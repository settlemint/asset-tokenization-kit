{{/*
OpenShift and Kubernetes compatible security context helpers.
These templates provide security contexts that satisfy OpenShift's restricted SCC
while also working on standard Kubernetes clusters.
*/}}

{{/*
Pod-level security context for OpenShift and Kubernetes compatibility.
Usage: include "atk.podSecurityContext" .
*/}}
{{- define "atk.podSecurityContext" -}}
{{- if .Values.securityContext.openshift.enabled -}}
fsGroup: {{ .Values.securityContext.openshift.fsGroup | default 1000640000 }}
runAsNonRoot: true
seccompProfile:
  type: RuntimeDefault
{{- else -}}
fsGroup: {{ .Values.podSecurityContext.fsGroup | default 999 }}
runAsUser: {{ .Values.podSecurityContext.runAsUser | default 999 }}
runAsGroup: {{ .Values.podSecurityContext.runAsGroup | default 999 }}
runAsNonRoot: true
seccompProfile:
  type: RuntimeDefault
{{- end -}}
{{- end -}}

{{/*
Container-level security context for OpenShift and Kubernetes compatibility.
Usage: include "atk.containerSecurityContext" .
*/}}
{{- define "atk.containerSecurityContext" -}}
{{- if .Values.securityContext.openshift.enabled -}}
allowPrivilegeEscalation: false
capabilities:
  drop:
  - ALL
runAsNonRoot: true
seccompProfile:
  type: RuntimeDefault
{{- else -}}
allowPrivilegeEscalation: false
capabilities:
  drop:
  - ALL
runAsNonRoot: true
runAsUser: {{ .Values.securityContext.runAsUser | default 999 }}
runAsGroup: {{ .Values.securityContext.runAsGroup | default 999 }}
seccompProfile:
  type: RuntimeDefault
{{- end -}}
{{- end -}}

{{/*
Init container security context for OpenShift and Kubernetes compatibility.
Some init containers may need to run as root for permissions.
Usage: include "atk.initContainerSecurityContext" .
*/}}
{{- define "atk.initContainerSecurityContext" -}}
allowPrivilegeEscalation: false
capabilities:
  drop:
  - ALL
runAsNonRoot: true
seccompProfile:
  type: RuntimeDefault
{{- end -}}

{{/*
Security context for containers that need write access to volumes.
Usage: include "atk.volumePermissionSecurityContext" .
*/}}
{{- define "atk.volumePermissionSecurityContext" -}}
allowPrivilegeEscalation: false
capabilities:
  drop:
  - ALL
{{- if not .Values.securityContext.openshift.enabled -}}
runAsUser: 0
runAsNonRoot: false
{{- else -}}
runAsNonRoot: true
{{- end -}}
seccompProfile:
  type: RuntimeDefault
{{- end -}}

{{/*
Default pod security context with OpenShift compatibility
*/}}
{{- define "atk.defaultPodSecurityContext" -}}
{{- $openshift := .Values.global.openshift | default (dict) -}}
{{- if $openshift.enabled -}}
fsGroup: {{ $openshift.fsGroup | default 1000640000 }}
runAsNonRoot: true
seccompProfile:
  type: RuntimeDefault
{{- else -}}
fsGroup: 999
runAsNonRoot: true
seccompProfile:
  type: RuntimeDefault
{{- end -}}
{{- end -}}

{{/*
Default container security context with OpenShift compatibility
*/}}
{{- define "atk.defaultContainerSecurityContext" -}}
{{- $openshift := .Values.global.openshift | default (dict) -}}
allowPrivilegeEscalation: false
capabilities:
  drop:
  - ALL
runAsNonRoot: true
{{- if not $openshift.enabled -}}
runAsUser: 999
runAsGroup: 999
{{- end -}}
seccompProfile:
  type: RuntimeDefault
{{- end -}}
{{/*
Expand the name of the chart.
Using common helper with chart-specific alias.
*/}}
{{- define "thegraph.name" -}}
{{ include "atk.common.name" . }}
{{- end }}

{{/*
Create a default fully qualified app name.
Using common helper with chart-specific alias.
*/}}
{{- define "thegraph.fullname" -}}
{{ include "atk.common.fullname" . }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
Using common helper with chart-specific alias.
*/}}
{{- define "thegraph.chart" -}}
{{ include "atk.common.chart" . }}
{{- end }}

{{/*
Common labels
Using common helper with chart-specific alias.
*/}}
{{- define "thegraph.labels" -}}
{{ include "atk.common.labels" . }}
{{- end -}}

{{/*
Selector labels
Using common helper with chart-specific alias.
*/}}
{{- define "thegraph.selectorLabels" -}}
{{ include "atk.common.selectorLabels" . }}
{{- end }}

{{/*
Create the name of the service account to use
Using common helper with chart-specific alias.
*/}}
{{- define "thegraph.serviceAccountName" -}}
{{ include "atk.common.serviceAccountName" . }}
{{- end }}

{{- define "thegraph.imagePullSecretName" -}}
{{- printf "image-pull-secret-%s" . -}}
{{- end -}}

{{/*
Creates an image pull secret value
*/}}
{{- define "thegraph.imagePullSecret" }}
{{- printf "{\"auths\":{\"%s\":{\"username\":\"%s\",\"password\":\"%s\",\"email\":\"%s\",\"auth\":\"%s\"}}}" .registryUrl .username .password .email (printf "%s:%s" .username .password | b64enc) | b64enc }}
{{- end }}

{{/*
Common image pull secrets for all deployments/statefulsets
*/}}
{{- define "atk.imagePullSecrets" -}}
{{- if .Values.global }}
{{- if .Values.global.imagePullSecrets }}
imagePullSecrets:
{{- range .Values.global.imagePullSecrets }}
  - name: {{ . }}
{{- end }}
{{- else }}
imagePullSecrets:
  - name: image-pull-secret-docker
  - name: image-pull-secret-ghcr
  - name: image-pull-secret-harbor
{{- end }}
{{- else }}
imagePullSecrets:
  - name: image-pull-secret-docker
  - name: image-pull-secret-ghcr
  - name: image-pull-secret-harbor
{{- end }}
{{- end }}
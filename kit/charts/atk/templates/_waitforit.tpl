{{- /*
Render wait-for-it style init containers for tcp dependency checks.
Usage: include "atk.waitforit.containers" (dict "context" $ "config" <values>)
*/ -}}
{{- define "atk.waitforit.containers" -}}
{{- $ctx := .context -}}
{{- $cfg := .config | default (dict) -}}
{{- $deps := $cfg.dependencies | default (list) -}}
{{- $enabled := $cfg.enabled | default false -}}
{{- if and $enabled (gt (len $deps) 0) -}}
{{- $image := $cfg.image | default (dict) -}}
{{- $repository := $image.repository | default "ghcr.io/settlemint/btp-waitforit" -}}
{{- $tag := $image.tag | default "v7.7.10" -}}
{{- $pullPolicy := $image.pullPolicy | default "IfNotPresent" -}}
{{- $timeout := $cfg.timeout | default 120 -}}
{{- $resources := $cfg.resources | default (dict) -}}
{{- range $deps }}
- name: wait-for-{{ .name }}
  image: "{{ $repository }}:{{ $tag }}"
  imagePullPolicy: {{ $pullPolicy }}
  {{- with $ctx.Values.initContainerSecurityContext }}
  securityContext:
    {{- toYaml . | nindent 4 }}
  {{- end }}
  command:
    - /usr/bin/wait-for-it
    - "{{ tpl .endpoint $ctx }}"
    - -t
    - "{{ $timeout }}"
  {{- if $resources }}
  resources:
{{ toYaml $resources | nindent 4 }}
  {{- end }}
{{- end }}
{{- end -}}
{{- end -}}

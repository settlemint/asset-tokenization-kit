{{- /*
Render wait-for-it style init containers for tcp dependency checks.
Usage: include "atk.waitforit.containers" (dict "context" $ "config" <values>)
*/ -}}
{{- define "atk.waitforit.containers" -}}
{{- $ctx := .context -}}
{{- $cfg := .config | default (dict) -}}
{{- $deps := $cfg.dependencies | default (list) -}}
{{- $enabled := $cfg.enabled | default false -}}
{{- $chartName := default "" $ctx.Chart.Name -}}
{{- $chartKey := default $chartName .chartKey -}}
{{- $legacyKey := default $chartKey .legacyKey -}}
{{- $initContainerSecurityContext := default (dict) $ctx.Values.initContainerSecurityContext -}}
{{- $configSecurityContext := default (dict) $cfg.securityContext -}}
{{- if and $enabled (gt (len $deps) 0) -}}
{{- $image := $cfg.image | default (dict) -}}
{{- $repository := $image.repository | default "ghcr.io/settlemint/btp-waitforit" -}}
{{- $tag := $image.tag | default "v7.7.10" -}}
{{- $pullPolicy := $image.pullPolicy | default "IfNotPresent" -}}
{{- $timeout := $cfg.timeout | default 120 -}}
{{- $rawResources := $cfg.resources | default (dict) -}}
{{- $resourceKeys := list "limits" "requests" "claims" -}}
{{- $resources := dict -}}
{{- range $resourceKeys }}
  {{- if hasKey $rawResources . }}
    {{- $_ := set $resources . (index $rawResources .) -}}
  {{- end }}
{{- end -}}
{{- range $deps }}
- name: wait-for-{{ .name }}
  image: "{{ $repository }}:{{ $tag }}"
  imagePullPolicy: {{ $pullPolicy }}
  {{- /* Merge global defaults with chart-level and dependency overrides */ -}}
  {{- $dependencySecurityContext := merge (dict) $initContainerSecurityContext $configSecurityContext (default (dict) .securityContext) -}}
  {{- $resolvedSecurityContext := (include "atk.securityContext.container" (dict "context" $ctx "local" $dependencySecurityContext "chartKey" $chartKey "legacyKey" $legacyKey)) | fromYaml -}}
  {{- if $resolvedSecurityContext }}
  securityContext:
    {{- toYaml $resolvedSecurityContext | nindent 4 }}
  {{- end }}
  command:
    - /usr/bin/wait-for-it
    - "{{ tpl .endpoint $ctx }}"
    - -t
    - "{{ $timeout }}"
  {{- if gt (len $resources) 0 }}
  resources:
{{ toYaml $resources | nindent 4 }}
  {{- end }}
{{- end }}
{{- end -}}
{{- end -}}

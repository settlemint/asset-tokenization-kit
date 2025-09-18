# dapp

![Version: 0.1.1](https://img.shields.io/badge/Version-0.1.1-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: 1.0.0](https://img.shields.io/badge/AppVersion-1.0.0-informational?style=flat-square)

A Helm chart for the ATK DApp frontend

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| affinity | object | `{}` |  |
| annotations | object | `{}` |  |
| autoscaling.enabled | bool | `false` |  |
| autoscaling.maxReplicas | int | `10` |  |
| autoscaling.minReplicas | int | `1` |  |
| autoscaling.targetCPUUtilizationPercentage | int | `80` |  |
| env | list | `[]` |  |
| fullnameOverride | string | `"dapp"` |  |
| image.pullPolicy | string | `"IfNotPresent"` |  |
| image.repository | string | `"ghcr.io/settlemint/asset-tokenization-kit"` |  |
| image.tag | string | `"2.0.0-main1e32acb7f"` |  |
| ingress.annotations | object | `{}` |  |
| ingress.className | string | `"atk-nginx"` |  |
| ingress.enabled | bool | `false` |  |
| ingress.hosts[0].host | string | `"dapp.local"` |  |
| ingress.hosts[0].paths[0].path | string | `"/((?:sm_|bpaas-)[^/]+)?/?(.*)"` |  |
| ingress.hosts[0].paths[0].pathType | string | `"ImplementationSpecific"` |  |
| ingress.tls | list | `[]` |  |
| initContainer.graphQLCheck.enabled | bool | `true` |  |
| initContainer.graphQLCheck.image.pullPolicy | string | `"IfNotPresent"` |  |
| initContainer.graphQLCheck.image.registry | string | `"docker.io"` |  |
| initContainer.graphQLCheck.image.repository | string | `"curlimages/curl"` |  |
| initContainer.graphQLCheck.image.tag | string | `"8.16.0"` |  |
| initContainer.graphQLCheck.name | string | `"wait-for-graphql"` |  |
| initContainer.graphQLCheck.query | string | `"{ _meta { hasIndexingErrors block { number } } }"` |  |
| initContainer.graphQLCheck.resources.limits.memory | string | `"64Mi"` |  |
| initContainer.graphQLCheck.resources.requests.cpu | string | `"10m"` |  |
| initContainer.graphQLCheck.resources.requests.memory | string | `"12Mi"` |  |
| initContainer.graphQLCheck.retries | int | `10` |  |
| initContainer.graphQLCheck.retryDelaySeconds | int | `10` |  |
| initContainer.graphQLCheck.url | string | `"http://graph-node-combined:8000/subgraphs/name/kit"` |  |
| initContainer.tcpCheck.dependencies[0].endpoint | string | `"{{ include \"atk.postgresql.endpoint\" (dict \"context\" $) }}"` |  |
| initContainer.tcpCheck.dependencies[0].name | string | `"postgres"` |  |
| initContainer.tcpCheck.dependencies[1].endpoint | string | `"hasura:8080"` |  |
| initContainer.tcpCheck.dependencies[1].name | string | `"hasura"` |  |
| initContainer.tcpCheck.dependencies[2].endpoint | string | `"portal:3001"` |  |
| initContainer.tcpCheck.dependencies[2].name | string | `"portal"` |  |
| initContainer.tcpCheck.dependencies[3].endpoint | string | `"graph-node-combined:8020"` |  |
| initContainer.tcpCheck.dependencies[3].name | string | `"graph-node-tcp"` |  |
| initContainer.tcpCheck.dependencies[4].endpoint | string | `"blockscout-frontend-svc:80"` |  |
| initContainer.tcpCheck.dependencies[4].name | string | `"blockscout"` |  |
| initContainer.tcpCheck.enabled | bool | `true` |  |
| initContainer.tcpCheck.image.pullPolicy | string | `"IfNotPresent"` |  |
| initContainer.tcpCheck.image.repository | string | `"ghcr.io/settlemint/btp-waitforit"` |  |
| initContainer.tcpCheck.image.tag | string | `"v7.7.10"` |  |
| initContainer.tcpCheck.resources.limits.cpu | string | `"100m"` |  |
| initContainer.tcpCheck.resources.limits.memory | string | `"64Mi"` |  |
| initContainer.tcpCheck.resources.requests.cpu | string | `"50m"` |  |
| initContainer.tcpCheck.resources.requests.memory | string | `"32Mi"` |  |
| initContainer.tcpCheck.timeout | int | `120` |  |
| job.enabled | bool | `true` |  |
| job.image.pullPolicy | string | `"IfNotPresent"` |  |
| job.image.repository | string | `"docker.io/node"` |  |
| job.image.tag | string | `"23.11.1-slim"` |  |
| job.imagePullSecrets | list | `[]` |  |
| job.initContainer.cloneRepo.image.pullPolicy | string | `"IfNotPresent"` |  |
| job.initContainer.cloneRepo.image.registry | string | `"docker.io"` |  |
| job.initContainer.cloneRepo.image.repository | string | `"alpine/git"` |  |
| job.initContainer.cloneRepo.image.tag | string | `"v2.49.1"` |  |
| job.initContainer.hasuraCheck.endpoint | string | `"hasura:8080"` |  |
| job.initContainer.hasuraCheck.image.pullPolicy | string | `"IfNotPresent"` |  |
| job.initContainer.hasuraCheck.image.repository | string | `"ghcr.io/settlemint/btp-waitforit"` |  |
| job.initContainer.hasuraCheck.image.tag | string | `"v7.7.10"` |  |
| job.initContainer.hasuraCheck.timeout | int | `5` |  |
| job.podAnnotations | object | `{}` |  |
| job.podSecurityContext | object | `{}` |  |
| job.resources | object | `{}` |  |
| job.securityContext | object | `{}` |  |
| job.workspace.size | string | `"1Gi"` |  |
| job.workspace.storageClass | string | `""` |  |
| nameOverride | string | `"dapp"` |  |
| networkPolicy.egress[0].ports[0].port | int | `53` |  |
| networkPolicy.egress[0].ports[0].protocol | string | `"UDP"` |  |
| networkPolicy.egress[0].to[0].namespaceSelector | object | `{}` |  |
| networkPolicy.egress[0].to[0].podSelector.matchLabels.k8s-app | string | `"kube-dns"` |  |
| networkPolicy.egress[1].ports[0].port | int | `5432` |  |
| networkPolicy.egress[1].ports[0].protocol | string | `"TCP"` |  |
| networkPolicy.egress[1].to[0].podSelector.matchLabels."app.kubernetes.io/name" | string | `"postgresql-ha"` |  |
| networkPolicy.egress[2].ports[0].port | int | `8080` |  |
| networkPolicy.egress[2].ports[0].protocol | string | `"TCP"` |  |
| networkPolicy.egress[2].to[0].podSelector.matchLabels."app.kubernetes.io/name" | string | `"graphql-engine"` |  |
| networkPolicy.egress[3].ports[0].port | int | `3000` |  |
| networkPolicy.egress[3].ports[0].protocol | string | `"TCP"` |  |
| networkPolicy.egress[3].ports[1].port | int | `3001` |  |
| networkPolicy.egress[3].ports[1].protocol | string | `"TCP"` |  |
| networkPolicy.egress[3].to[0].podSelector.matchLabels."app.kubernetes.io/name" | string | `"portal"` |  |
| networkPolicy.egress[4].ports[0].port | int | `4000` |  |
| networkPolicy.egress[4].ports[0].protocol | string | `"TCP"` |  |
| networkPolicy.egress[4].to[0].podSelector.matchLabels."app.kubernetes.io/name" | string | `"erpc"` |  |
| networkPolicy.egress[5].ports[0].port | int | `443` |  |
| networkPolicy.egress[5].ports[0].protocol | string | `"TCP"` |  |
| networkPolicy.egress[5].to[0].namespaceSelector | object | `{}` |  |
| networkPolicy.enabled | bool | `false` |  |
| networkPolicy.ingress[0].from[0].namespaceSelector.matchLabels."kubernetes.io/metadata.name" | string | `"ingress-nginx"` |  |
| networkPolicy.ingress[0].ports[0].port | int | `3000` |  |
| networkPolicy.ingress[0].ports[0].protocol | string | `"TCP"` |  |
| networkPolicy.ingress[1].from[0].podSelector | object | `{}` |  |
| networkPolicy.ingress[1].ports[0].port | int | `3000` |  |
| networkPolicy.ingress[1].ports[0].protocol | string | `"TCP"` |  |
| nodeSelector | object | `{}` |  |
| openShiftRoute.alternateBackends | list | `[]` | Additional backends for weighted routing |
| openShiftRoute.annotations | object | `{}` | Additional annotations for the OpenShift route resource |
| openShiftRoute.enabled | bool | `false` | Enable OpenShift route creation for DApp |
| openShiftRoute.host | string | `"dapp.k8s.orb.local"` | Hostname exposed via the OpenShift route |
| openShiftRoute.path | string | `"/"` | HTTP path exposed via the OpenShift route |
| openShiftRoute.port | object | `{"targetPort":"http"}` | Service port configuration for the route target |
| openShiftRoute.port.targetPort | string | `"http"` | Service target port name (must exist on the DApp service) |
| openShiftRoute.tls | string | `nil` | TLS configuration for the route (optional) Set to null for no TLS (HTTP only) Or specify configuration for TLS termination |
| openShiftRoute.to | object | `{"weight":100}` | Primary service weight configuration |
| openShiftRoute.to.weight | int | `100` | Weight assigned to the DApp service backend |
| openShiftRoute.wildcardPolicy | string | `"None"` | Wildcard policy to apply to the route |
| podAnnotations | object | `{}` |  |
| podDisruptionBudget.enabled | bool | `false` |  |
| podDisruptionBudget.minAvailable | int | `1` |  |
| podLabels | object | `{}` |  |
| podSecurityContext | object | `{}` |  |
| probes.liveness.failureThreshold | int | `10` |  |
| probes.liveness.httpGet.path | string | `"/"` |  |
| probes.liveness.httpGet.port | string | `"http"` |  |
| probes.liveness.httpGet.scheme | string | `"HTTP"` |  |
| probes.liveness.initialDelaySeconds | int | `10` |  |
| probes.liveness.periodSeconds | int | `15` |  |
| probes.liveness.successThreshold | int | `1` |  |
| probes.liveness.timeoutSeconds | int | `3` |  |
| probes.readiness.failureThreshold | int | `10` |  |
| probes.readiness.httpGet.path | string | `"/"` |  |
| probes.readiness.httpGet.port | string | `"http"` |  |
| probes.readiness.httpGet.scheme | string | `"HTTP"` |  |
| probes.readiness.initialDelaySeconds | int | `5` |  |
| probes.readiness.periodSeconds | int | `10` |  |
| probes.readiness.successThreshold | int | `1` |  |
| probes.readiness.timeoutSeconds | int | `3` |  |
| replicaCount | int | `1` |  |
| resources | object | `{}` |  |
| secretEnv.BETTER_AUTH_URL | string | `"https://dapp.local"` |  |
| secretEnv.NEXTAUTH_URL | string | `"https://dapp.local"` |  |
| secretEnv.NEXT_PUBLIC_APP_ID | string | `"dapp"` |  |
| secretEnv.OTEL_EXPORTER_OTLP_ENDPOINT | string | `"http://alloy:4318/v1/traces"` |  |
| secretEnv.OTEL_EXPORTER_OTLP_PROTOCOL | string | `"http"` |  |
| secretEnv.SETTLEMINT_BLOCKCHAIN_NODE_JSON_RPC_ENDPOINT | string | `"http://txsigner:3000"` |  |
| secretEnv.SETTLEMINT_BLOCKSCOUT_UI_ENDPOINT | string | `"http://blockscout-frontend-svc/"` |  |
| secretEnv.SETTLEMINT_HASURA_ADMIN_SECRET | string | `"atk"` |  |
| secretEnv.SETTLEMINT_HASURA_DATABASE_URL | string | `"{{ include \"atk.datastores.postgresql.url\" (dict \"context\" $ \"chartKey\" \"hasura\") }}"` |  |
| secretEnv.SETTLEMINT_HASURA_ENDPOINT | string | `"http://hasura:8080/v1/graphql"` |  |
| secretEnv.SETTLEMINT_HD_PRIVATE_KEY | string | `"atk-hd-private-key"` |  |
| secretEnv.SETTLEMINT_INSTANCE | string | `"standalone"` |  |
| secretEnv.SETTLEMINT_PORTAL_GRAPHQL_ENDPOINT | string | `"http://portal:3001/graphql"` |  |
| secretEnv.SETTLEMINT_THEGRAPH_SUBGRAPHS_ENDPOINTS | string | `"[\"http://graph-node-combined:8000/subgraphs/name/kit\"]"` |  |
| securityContext | object | `{}` |  |
| service.annotations | object | `{}` |  |
| service.port | int | `3000` |  |
| service.type | string | `"ClusterIP"` |  |
| serviceAccount.annotations | object | `{}` |  |
| serviceAccount.create | bool | `false` |  |
| serviceAccount.name | string | `""` |  |
| tolerations | list | `[]` |  |
| volumeMounts | list | `[]` |  |
| volumes | list | `[]` |  |

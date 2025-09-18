# dapp

![Version: 0.1.1](https://img.shields.io/badge/Version-0.1.1-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: 1.0.0](https://img.shields.io/badge/AppVersion-1.0.0-informational?style=flat-square)

A Helm chart for the ATK DApp frontend

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| affinity | object | `{}` | Affinity for pod assignment |
| annotations | object | `{}` | Additional annotations for the deployment metadata |
| autoscaling | object | `{"enabled":false,"maxReplicas":10,"minReplicas":1,"targetCPUUtilizationPercentage":80}` | Autoscaling configuration (optional) |
| autoscaling.enabled | bool | `false` | Enable autoscaling |
| autoscaling.maxReplicas | int | `10` | Maximum number of replicas |
| autoscaling.minReplicas | int | `1` | Minimum number of replicas |
| autoscaling.targetCPUUtilizationPercentage | int | `80` | Target CPU utilization percentage for autoscaling |
| env | list | `[]` | Environment variables defined directly in the deployment |
| extraInitContainers | list | `[]` | Additional init containers appended verbatim to the deployment pod spec |
| fullnameOverride | string | `"dapp"` | String to fully override dapp.fullname template |
| image | object | `{"pullPolicy":"IfNotPresent","repository":"ghcr.io/settlemint/asset-tokenization-kit","tag":"2.0.0-main1e32acb7f"}` | dApp image configuration |
| image.pullPolicy | string | `"IfNotPresent"` | dApp image pull policy |
| image.repository | string | `"ghcr.io/settlemint/asset-tokenization-kit"` | dApp image repository |
| image.tag | string | `"2.0.0-main1e32acb7f"` | dApp image tag (defaults to chart appVersion) |
| ingress | object | `{"annotations":{},"className":"atk-nginx","enabled":false,"hosts":[{"host":"dapp.local","paths":[{"path":"/((?:sm_|bpaas-)[^/]+)?/?(.*)","pathType":"ImplementationSpecific"}]}],"tls":[]}` | Ingress configuration |
| ingress.annotations | object | `{}` | Additional annotations for the Ingress resource |
| ingress.className | string | `"atk-nginx"` | IngressClass that will be used to implement the Ingress |
| ingress.enabled | bool | `false` | Enable ingress controller resource |
| ingress.hosts | list | `[{"host":"dapp.local","paths":[{"path":"/((?:sm_|bpaas-)[^/]+)?/?(.*)","pathType":"ImplementationSpecific"}]}]` | Ingress host configuration |
| ingress.tls | list | `[]` | TLS configuration for the ingress |
| initContainer | object | `{"graphQLCheck":{"enabled":true,"image":{"pullPolicy":"IfNotPresent","registry":"docker.io","repository":"curlimages/curl","tag":"8.16.0"},"name":"wait-for-graphql","query":"{ _meta { hasIndexingErrors block { number } } }","resources":{"limits":{"memory":"64Mi"},"requests":{"cpu":"10m","memory":"12Mi"}},"retries":10,"retryDelaySeconds":10,"url":"http://graph-node-combined:8000/subgraphs/name/kit"},"tcpCheck":{"dependencies":[{"endpoint":"{{ include \"atk.postgresql.endpoint\" (dict \"context\" $) }}","name":"postgres"},{"endpoint":"hasura:8080","name":"hasura"},{"endpoint":"portal:3001","name":"portal"},{"endpoint":"graph-node-combined:8020","name":"graph-node"},{"endpoint":"blockscout-frontend-svc:80","name":"blockscout"}],"enabled":true,"image":{"pullPolicy":"IfNotPresent","repository":"ghcr.io/settlemint/btp-waitforit","tag":"v7.7.10"},"resources":{"limits":{"cpu":"100m","memory":"64Mi"},"requests":{"cpu":"50m","memory":"32Mi"}},"timeout":120}}` | Init container configuration |
| job | object | `{"enabled":true,"image":{"pullPolicy":"IfNotPresent","repository":"docker.io/node","tag":"23.11.1-slim"},"imagePullSecrets":[],"initContainer":{"cloneRepo":{"image":{"pullPolicy":"IfNotPresent","registry":"docker.io","repository":"alpine/git","tag":"v2.49.1"}},"hasuraCheck":{"endpoint":"hasura:8080","image":{"pullPolicy":"IfNotPresent","repository":"ghcr.io/settlemint/btp-waitforit","tag":"v7.7.10"},"timeout":5}},"podAnnotations":{},"podSecurityContext":{},"resources":{},"securityContext":{},"workspace":{"size":"1Gi","storageClass":""}}` | Job configuration for initialization tasks |
| job.enabled | bool | `true` | Enable initialization job |
| job.image | object | `{"pullPolicy":"IfNotPresent","repository":"docker.io/node","tag":"23.11.1-slim"}` | Image configuration for job |
| job.image.pullPolicy | string | `"IfNotPresent"` | Job image pull policy |
| job.image.repository | string | `"docker.io/node"` | Job image repository |
| job.image.tag | string | `"23.11.1-slim"` | Job image tag |
| job.imagePullSecrets | list | `[]` | Image pull secrets for job |
| job.initContainer | object | `{"cloneRepo":{"image":{"pullPolicy":"IfNotPresent","registry":"docker.io","repository":"alpine/git","tag":"v2.49.1"}},"hasuraCheck":{"endpoint":"hasura:8080","image":{"pullPolicy":"IfNotPresent","repository":"ghcr.io/settlemint/btp-waitforit","tag":"v7.7.10"},"timeout":5}}` | Init containers for job |
| job.initContainer.cloneRepo | object | `{"image":{"pullPolicy":"IfNotPresent","registry":"docker.io","repository":"alpine/git","tag":"v2.49.1"}}` | Repository clone configuration |
| job.initContainer.cloneRepo.image | object | `{"pullPolicy":"IfNotPresent","registry":"docker.io","repository":"alpine/git","tag":"v2.49.1"}` | Git clone image configuration |
| job.initContainer.cloneRepo.image.pullPolicy | string | `"IfNotPresent"` | Image pull policy |
| job.initContainer.cloneRepo.image.registry | string | `"docker.io"` | Image registry |
| job.initContainer.cloneRepo.image.repository | string | `"alpine/git"` | Image repository |
| job.initContainer.cloneRepo.image.tag | string | `"v2.49.1"` | Image tag |
| job.initContainer.hasuraCheck | object | `{"endpoint":"hasura:8080","image":{"pullPolicy":"IfNotPresent","repository":"ghcr.io/settlemint/btp-waitforit","tag":"v7.7.10"},"timeout":5}` | Hasura check configuration |
| job.initContainer.hasuraCheck.endpoint | string | `"hasura:8080"` | Endpoint to check |
| job.initContainer.hasuraCheck.image | object | `{"pullPolicy":"IfNotPresent","repository":"ghcr.io/settlemint/btp-waitforit","tag":"v7.7.10"}` | Hasura check image configuration |
| job.initContainer.hasuraCheck.image.pullPolicy | string | `"IfNotPresent"` | Image pull policy |
| job.initContainer.hasuraCheck.image.repository | string | `"ghcr.io/settlemint/btp-waitforit"` | Image repository |
| job.initContainer.hasuraCheck.image.tag | string | `"v7.7.10"` | Image tag |
| job.initContainer.hasuraCheck.timeout | int | `5` | Timeout in seconds for dependency check |
| job.podAnnotations | object | `{}` | Pod annotations for job |
| job.podSecurityContext | object | `{}` | Pod Security Context for job |
| job.resources | object | `{}` | Resource configuration for job |
| job.securityContext | object | `{}` | Container Security Context for job |
| job.workspace | object | `{"size":"1Gi","storageClass":""}` | Workspace configuration for job |
| job.workspace.size | string | `"1Gi"` | Size of the workspace PVC |
| job.workspace.storageClass | string | `""` | Storage class to use for the workspace PVC |
| nameOverride | string | `"dapp"` | String to partially override dapp.fullname template |
| networkPolicy | object | `{"egress":[{"ports":[{"port":53,"protocol":"UDP"}],"to":[{"namespaceSelector":{},"podSelector":{"matchLabels":{"k8s-app":"kube-dns"}}}]},{"ports":[{"port":5432,"protocol":"TCP"}],"to":[{"podSelector":{"matchLabels":{"app.kubernetes.io/name":"postgresql-ha"}}}]},{"ports":[{"port":8080,"protocol":"TCP"}],"to":[{"podSelector":{"matchLabels":{"app.kubernetes.io/name":"graphql-engine"}}}]},{"ports":[{"port":3000,"protocol":"TCP"},{"port":3001,"protocol":"TCP"}],"to":[{"podSelector":{"matchLabels":{"app.kubernetes.io/name":"portal"}}}]},{"ports":[{"port":4000,"protocol":"TCP"}],"to":[{"podSelector":{"matchLabels":{"app.kubernetes.io/name":"erpc"}}}]},{"ports":[{"port":443,"protocol":"TCP"}],"to":[{"namespaceSelector":{}}]}],"enabled":false,"ingress":[{"from":[{"namespaceSelector":{"matchLabels":{"kubernetes.io/metadata.name":"ingress-nginx"}}}],"ports":[{"port":3000,"protocol":"TCP"}]},{"from":[{"podSelector":{}}],"ports":[{"port":3000,"protocol":"TCP"}]}]}` | NetworkPolicy configuration |
| networkPolicy.egress | list | `[{"ports":[{"port":53,"protocol":"UDP"}],"to":[{"namespaceSelector":{},"podSelector":{"matchLabels":{"k8s-app":"kube-dns"}}}]},{"ports":[{"port":5432,"protocol":"TCP"}],"to":[{"podSelector":{"matchLabels":{"app.kubernetes.io/name":"postgresql-ha"}}}]},{"ports":[{"port":8080,"protocol":"TCP"}],"to":[{"podSelector":{"matchLabels":{"app.kubernetes.io/name":"graphql-engine"}}}]},{"ports":[{"port":3000,"protocol":"TCP"},{"port":3001,"protocol":"TCP"}],"to":[{"podSelector":{"matchLabels":{"app.kubernetes.io/name":"portal"}}}]},{"ports":[{"port":4000,"protocol":"TCP"}],"to":[{"podSelector":{"matchLabels":{"app.kubernetes.io/name":"erpc"}}}]},{"ports":[{"port":443,"protocol":"TCP"}],"to":[{"namespaceSelector":{}}]}]` | Egress rules for the network policy |
| networkPolicy.enabled | bool | `false` | Enable network policy |
| networkPolicy.ingress | list | `[{"from":[{"namespaceSelector":{"matchLabels":{"kubernetes.io/metadata.name":"ingress-nginx"}}}],"ports":[{"port":3000,"protocol":"TCP"}]},{"from":[{"podSelector":{}}],"ports":[{"port":3000,"protocol":"TCP"}]}]` | Ingress rules for the network policy |
| nodeSelector | object | `{}` | Node selector for pod assignment |
| podAnnotations | object | `{}` | Annotations for dApp pods |
| podDisruptionBudget | object | `{"enabled":false,"minAvailable":1}` | PodDisruptionBudget configuration |
| podDisruptionBudget.enabled | bool | `false` | Enable pod disruption budget |
| podDisruptionBudget.minAvailable | int | `1` | Minimum number of pods that must be available during disruption. Can be an integer or percentage (e.g., "50%") |
| podLabels | object | `{}` | Additional labels for the deployment pod metadata |
| podSecurityContext | object | `{}` | Pod security context configuration |
| probes | object | `{"liveness":{"failureThreshold":10,"httpGet":{"path":"/","port":"http","scheme":"HTTP"},"initialDelaySeconds":10,"periodSeconds":15,"successThreshold":1,"timeoutSeconds":3},"readiness":{"failureThreshold":10,"httpGet":{"path":"/","port":"http","scheme":"HTTP"},"initialDelaySeconds":5,"periodSeconds":10,"successThreshold":1,"timeoutSeconds":3}}` | Liveness and Readiness probes configuration |
| probes.liveness | object | `{"failureThreshold":10,"httpGet":{"path":"/","port":"http","scheme":"HTTP"},"initialDelaySeconds":10,"periodSeconds":15,"successThreshold":1,"timeoutSeconds":3}` | Liveness probe configuration |
| probes.readiness | object | `{"failureThreshold":10,"httpGet":{"path":"/","port":"http","scheme":"HTTP"},"initialDelaySeconds":5,"periodSeconds":10,"successThreshold":1,"timeoutSeconds":3}` | Readiness probe configuration |
| replicaCount | int | `1` | Number of dApp replicas to deploy |
| resources | object | `{}` | Resource requests and limits |
| secretEnv | object | `{"BETTER_AUTH_URL":"https://dapp.local","NEXTAUTH_URL":"https://dapp.local","NEXT_PUBLIC_APP_ID":"dapp","OTEL_EXPORTER_OTLP_ENDPOINT":"http://alloy:4318/v1/traces","OTEL_EXPORTER_OTLP_PROTOCOL":"http","SETTLEMINT_BLOCKCHAIN_NODE_JSON_RPC_ENDPOINT":"http://txsigner:3000","SETTLEMINT_BLOCKSCOUT_UI_ENDPOINT":"http://blockscout-frontend-svc/","SETTLEMINT_HASURA_ADMIN_SECRET":"atk","SETTLEMINT_HASURA_DATABASE_URL":"{{ include \"atk.datastores.postgresql.url\" (dict \"context\" $ \"chartKey\" \"hasura\") }}","SETTLEMINT_HASURA_ENDPOINT":"http://hasura:8080/v1/graphql","SETTLEMINT_HD_PRIVATE_KEY":"atk-hd-private-key","SETTLEMINT_INSTANCE":"standalone","SETTLEMINT_PORTAL_GRAPHQL_ENDPOINT":"http://portal:3001/graphql","SETTLEMINT_THEGRAPH_SUBGRAPHS_ENDPOINTS":"[\"http://graph-node-combined:8000/subgraphs/name/kit\"]"}` | Environment variables sourced from a secret. These will be created in the secret.yaml template |
| securityContext | object | `{}` | Container security context configuration |
| service | object | `{"annotations":{},"port":3000,"type":"ClusterIP"}` | Service configuration |
| service.annotations | object | `{}` | Service annotations |
| service.port | int | `3000` | Service port |
| service.type | string | `"ClusterIP"` | Service type |
| serviceAccount | object | `{"annotations":{},"create":false,"name":""}` | Service account configuration |
| serviceAccount.annotations | object | `{}` | Annotations to add to the service account |
| serviceAccount.create | bool | `false` | Specifies whether a service account should be created |
| serviceAccount.name | string | `""` | The name of the service account to use. If not set and create is true, a name is generated using the fullname template |
| tolerations | list | `[]` | Tolerations for pod assignment |
| volumeMounts | list | `[]` | Additional volume mounts for the main container |
| volumes | list | `[]` | Additional volumes for the deployment |

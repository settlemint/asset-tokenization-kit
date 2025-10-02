# dapp

![Version: 2.0.0-alpha.15](https://img.shields.io/badge/Version-2.0.0--alpha.15-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: 2.0.0-alpha.15](https://img.shields.io/badge/AppVersion-2.0.0--alpha.15-informational?style=flat-square)

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
| global | object | `{"labels":{"kots.io/app-slug":"settlemint-atk"}}` | Global configuration values inherited from parent chart |
| global.labels | object | `{"kots.io/app-slug":"settlemint-atk"}` | Global labels applied to all resources |
| global.labels."kots.io/app-slug" | string | `"settlemint-atk"` | KOTS application slug identifier |
| image | object | `{"pullPolicy":"IfNotPresent","repository":"ghcr.io/settlemint/asset-tokenization-kit","tag":""}` | dApp image configuration |
| image.pullPolicy | string | `"IfNotPresent"` | dApp image pull policy |
| image.repository | string | `"ghcr.io/settlemint/asset-tokenization-kit"` | dApp image repository |
| image.tag | string | `""` | dApp image tag (defaults to chart appVersion) |
| ingress | object | `{"annotations":{},"className":"atk-nginx","enabled":false,"hosts":[{"host":"dapp.local","paths":[{"path":"/((?:sm_|bpaas-)[^/]+)?/?(.*)","pathType":"ImplementationSpecific"}]}],"tls":[]}` | Ingress configuration |
| ingress.annotations | object | `{}` | Additional annotations for the Ingress resource |
| ingress.className | string | `"atk-nginx"` | IngressClass that will be used to implement the Ingress |
| ingress.enabled | bool | `false` | Enable ingress controller resource |
| ingress.hosts | list | `[{"host":"dapp.local","paths":[{"path":"/((?:sm_|bpaas-)[^/]+)?/?(.*)","pathType":"ImplementationSpecific"}]}]` | Ingress host configuration |
| ingress.hosts[0] | object | `{"host":"dapp.local","paths":[{"path":"/((?:sm_|bpaas-)[^/]+)?/?(.*)","pathType":"ImplementationSpecific"}]}` | Ingress host entry |
| ingress.hosts[0].host | string | `"dapp.local"` | Hostname for the ingress (placeholder - should be configured in parent chart values) |
| ingress.hosts[0].paths | list | `[{"path":"/((?:sm_|bpaas-)[^/]+)?/?(.*)","pathType":"ImplementationSpecific"}]` | Path definitions for this host |
| ingress.hosts[0].paths[0] | object | `{"path":"/((?:sm_|bpaas-)[^/]+)?/?(.*)","pathType":"ImplementationSpecific"}` | Path entry |
| ingress.hosts[0].paths[0].path | string | `"/((?:sm_|bpaas-)[^/]+)?/?(.*)"` | URL path pattern matching original path structure |
| ingress.hosts[0].paths[0].pathType | string | `"ImplementationSpecific"` | Path type for Kubernetes ingress |
| ingress.tls | list | `[]` | TLS configuration for the ingress |
| initContainer | object | `{"graphQLCheck":{"enabled":true,"image":{"pullPolicy":"IfNotPresent","registry":"docker.io","repository":"curlimages/curl","tag":"8.16.0"},"name":"wait-for-graphql","query":"{ _meta { hasIndexingErrors block { number } } }","resources":{"limits":{"memory":"64Mi"},"requests":{"cpu":"10m","memory":"12Mi"}},"retries":10,"retryDelaySeconds":10,"url":"http://graph-node-combined:8000/subgraphs/name/kit"},"tcpCheck":{"dependencies":[{"endpoint":"{{ include \"atk.postgresql.endpoint\" (dict \"context\" $) }}","name":"postgres"},{"endpoint":"hasura:8080","name":"hasura"},{"endpoint":"portal:3001","name":"portal"},{"endpoint":"graph-node-combined:8020","name":"graph-node"},{"endpoint":"blockscout-blockscout:80","name":"blockscout"}],"enabled":true,"image":{"pullPolicy":"IfNotPresent","repository":"ghcr.io/settlemint/btp-waitforit","tag":"v7.7.10"},"resources":{"limits":{"cpu":"100m","memory":"64Mi"},"requests":{"cpu":"50m","memory":"32Mi"}},"timeout":120}}` | Init container configuration |
| initContainer.graphQLCheck | object | `{"enabled":true,"image":{"pullPolicy":"IfNotPresent","registry":"docker.io","repository":"curlimages/curl","tag":"8.16.0"},"name":"wait-for-graphql","query":"{ _meta { hasIndexingErrors block { number } } }","resources":{"limits":{"memory":"64Mi"},"requests":{"cpu":"10m","memory":"12Mi"}},"retries":10,"retryDelaySeconds":10,"url":"http://graph-node-combined:8000/subgraphs/name/kit"}` | Specific check for GraphQL endpoint readiness (e.g., The Graph subgraph) |
| initContainer.graphQLCheck.enabled | bool | `true` | Enable GraphQL endpoint readiness check |
| initContainer.graphQLCheck.image | object | `{"pullPolicy":"IfNotPresent","registry":"docker.io","repository":"curlimages/curl","tag":"8.16.0"}` | Container image configuration for GraphQL check |
| initContainer.graphQLCheck.image.pullPolicy | string | `"IfNotPresent"` | Image pull policy |
| initContainer.graphQLCheck.image.registry | string | `"docker.io"` | Container registry |
| initContainer.graphQLCheck.image.repository | string | `"curlimages/curl"` | Image repository for curl utility |
| initContainer.graphQLCheck.image.tag | string | `"8.16.0"` | Image tag |
| initContainer.graphQLCheck.name | string | `"wait-for-graphql"` | Name of the init container |
| initContainer.graphQLCheck.query | string | `"{ _meta { hasIndexingErrors block { number } } }"` | GraphQL query to check sync status |
| initContainer.graphQLCheck.resources | object | `{"limits":{"memory":"64Mi"},"requests":{"cpu":"10m","memory":"12Mi"}}` | Resource limits and requests for GraphQL check init container |
| initContainer.graphQLCheck.resources.limits | object | `{"memory":"64Mi"}` | Resource limits |
| initContainer.graphQLCheck.resources.limits.memory | string | `"64Mi"` | Memory limit |
| initContainer.graphQLCheck.resources.requests | object | `{"cpu":"10m","memory":"12Mi"}` | Resource requests |
| initContainer.graphQLCheck.resources.requests.cpu | string | `"10m"` | CPU request |
| initContainer.graphQLCheck.resources.requests.memory | string | `"12Mi"` | Memory request |
| initContainer.graphQLCheck.retries | int | `10` | Number of retry attempts |
| initContainer.graphQLCheck.retryDelaySeconds | int | `10` | Delay in seconds between retry attempts |
| initContainer.graphQLCheck.url | string | `"http://graph-node-combined:8000/subgraphs/name/kit"` | GraphQL endpoint URL to check (wait for subgraph to finish syncing with extended timeout) |
| initContainer.tcpCheck | object | `{"dependencies":[{"endpoint":"{{ include \"atk.postgresql.endpoint\" (dict \"context\" $) }}","name":"postgres"},{"endpoint":"hasura:8080","name":"hasura"},{"endpoint":"portal:3001","name":"portal"},{"endpoint":"graph-node-combined:8020","name":"graph-node"},{"endpoint":"blockscout-blockscout:80","name":"blockscout"}],"enabled":true,"image":{"pullPolicy":"IfNotPresent","repository":"ghcr.io/settlemint/btp-waitforit","tag":"v7.7.10"},"resources":{"limits":{"cpu":"100m","memory":"64Mi"},"requests":{"cpu":"50m","memory":"32Mi"}},"timeout":120}` | Generic TCP check settings for service availability |
| initContainer.tcpCheck.dependencies | list | `[{"endpoint":"{{ include \"atk.postgresql.endpoint\" (dict \"context\" $) }}","name":"postgres"},{"endpoint":"hasura:8080","name":"hasura"},{"endpoint":"portal:3001","name":"portal"},{"endpoint":"graph-node-combined:8020","name":"graph-node"},{"endpoint":"blockscout-blockscout:80","name":"blockscout"}]` | Service dependencies to check for availability (service-name:port) |
| initContainer.tcpCheck.dependencies[0] | object | `{"endpoint":"{{ include \"atk.postgresql.endpoint\" (dict \"context\" $) }}","name":"postgres"}` | PostgreSQL database dependency |
| initContainer.tcpCheck.dependencies[0].endpoint | string | `"{{ include \"atk.postgresql.endpoint\" (dict \"context\" $) }}"` | Service endpoint (templated) |
| initContainer.tcpCheck.dependencies[0].name | string | `"postgres"` | Dependency name |
| initContainer.tcpCheck.dependencies[1] | object | `{"endpoint":"hasura:8080","name":"hasura"}` | Hasura GraphQL Engine dependency |
| initContainer.tcpCheck.dependencies[1].endpoint | string | `"hasura:8080"` | Service endpoint |
| initContainer.tcpCheck.dependencies[1].name | string | `"hasura"` | Dependency name |
| initContainer.tcpCheck.dependencies[2] | object | `{"endpoint":"portal:3001","name":"portal"}` | Portal API dependency |
| initContainer.tcpCheck.dependencies[2].endpoint | string | `"portal:3001"` | Service endpoint |
| initContainer.tcpCheck.dependencies[2].name | string | `"portal"` | Dependency name |
| initContainer.tcpCheck.dependencies[3] | object | `{"endpoint":"graph-node-combined:8020","name":"graph-node"}` | The Graph node dependency |
| initContainer.tcpCheck.dependencies[3].endpoint | string | `"graph-node-combined:8020"` | Service endpoint |
| initContainer.tcpCheck.dependencies[3].name | string | `"graph-node"` | Dependency name |
| initContainer.tcpCheck.dependencies[4] | object | `{"endpoint":"blockscout-blockscout:80","name":"blockscout"}` | Blockscout block explorer dependency |
| initContainer.tcpCheck.dependencies[4].endpoint | string | `"blockscout-blockscout:80"` | Service endpoint |
| initContainer.tcpCheck.dependencies[4].name | string | `"blockscout"` | Dependency name |
| initContainer.tcpCheck.enabled | bool | `true` | Enable TCP availability checks |
| initContainer.tcpCheck.image | object | `{"pullPolicy":"IfNotPresent","repository":"ghcr.io/settlemint/btp-waitforit","tag":"v7.7.10"}` | Container image configuration for TCP check init container |
| initContainer.tcpCheck.image.pullPolicy | string | `"IfNotPresent"` | Image pull policy |
| initContainer.tcpCheck.image.repository | string | `"ghcr.io/settlemint/btp-waitforit"` | Image repository for wait-for-it utility |
| initContainer.tcpCheck.image.tag | string | `"v7.7.10"` | Image tag for wait-for-it utility |
| initContainer.tcpCheck.resources | object | `{"limits":{"cpu":"100m","memory":"64Mi"},"requests":{"cpu":"50m","memory":"32Mi"}}` | Resource limits and requests for TCP check init container |
| initContainer.tcpCheck.resources.limits | object | `{"cpu":"100m","memory":"64Mi"}` | Resource limits |
| initContainer.tcpCheck.resources.limits.cpu | string | `"100m"` | CPU limit |
| initContainer.tcpCheck.resources.limits.memory | string | `"64Mi"` | Memory limit |
| initContainer.tcpCheck.resources.requests | object | `{"cpu":"50m","memory":"32Mi"}` | Resource requests |
| initContainer.tcpCheck.resources.requests.cpu | string | `"50m"` | CPU request |
| initContainer.tcpCheck.resources.requests.memory | string | `"32Mi"` | Memory request |
| initContainer.tcpCheck.timeout | int | `120` | Timeout in seconds for all TCP checks to complete |
| nameOverride | string | `"dapp"` | String to partially override dapp.fullname template |
| networkPolicy | object | `{"egress":[{"ports":[{"port":53,"protocol":"UDP"}],"to":[{"namespaceSelector":{},"podSelector":{"matchLabels":{"k8s-app":"kube-dns"}}}]},{"ports":[{"port":5432,"protocol":"TCP"}],"to":[{"podSelector":{"matchLabels":{"app.kubernetes.io/name":"postgresql-ha"}}}]},{"ports":[{"port":8080,"protocol":"TCP"}],"to":[{"podSelector":{"matchLabels":{"app.kubernetes.io/name":"graphql-engine"}}}]},{"ports":[{"port":3000,"protocol":"TCP"},{"port":3001,"protocol":"TCP"}],"to":[{"podSelector":{"matchLabels":{"app.kubernetes.io/name":"portal"}}}]},{"ports":[{"port":4000,"protocol":"TCP"}],"to":[{"podSelector":{"matchLabels":{"app.kubernetes.io/name":"erpc"}}}]},{"ports":[{"port":443,"protocol":"TCP"}],"to":[{"namespaceSelector":{}}]}],"enabled":false,"ingress":[{"from":[{"namespaceSelector":{"matchLabels":{"kubernetes.io/metadata.name":"ingress-nginx"}}}],"ports":[{"port":3000,"protocol":"TCP"}]},{"from":[{"podSelector":{}}],"ports":[{"port":3000,"protocol":"TCP"}]}]}` | NetworkPolicy configuration |
| networkPolicy.egress | list | `[{"ports":[{"port":53,"protocol":"UDP"}],"to":[{"namespaceSelector":{},"podSelector":{"matchLabels":{"k8s-app":"kube-dns"}}}]},{"ports":[{"port":5432,"protocol":"TCP"}],"to":[{"podSelector":{"matchLabels":{"app.kubernetes.io/name":"postgresql-ha"}}}]},{"ports":[{"port":8080,"protocol":"TCP"}],"to":[{"podSelector":{"matchLabels":{"app.kubernetes.io/name":"graphql-engine"}}}]},{"ports":[{"port":3000,"protocol":"TCP"},{"port":3001,"protocol":"TCP"}],"to":[{"podSelector":{"matchLabels":{"app.kubernetes.io/name":"portal"}}}]},{"ports":[{"port":4000,"protocol":"TCP"}],"to":[{"podSelector":{"matchLabels":{"app.kubernetes.io/name":"erpc"}}}]},{"ports":[{"port":443,"protocol":"TCP"}],"to":[{"namespaceSelector":{}}]}]` | Egress rules for the network policy |
| networkPolicy.egress[0] | object | `{"ports":[{"port":53,"protocol":"UDP"}],"to":[{"namespaceSelector":{},"podSelector":{"matchLabels":{"k8s-app":"kube-dns"}}}]}` | Allow DNS resolution |
| networkPolicy.egress[0].ports | list | `[{"port":53,"protocol":"UDP"}]` | Port definitions for DNS traffic |
| networkPolicy.egress[0].ports[0] | object | `{"port":53,"protocol":"UDP"}` | UDP port configuration for DNS |
| networkPolicy.egress[0].ports[0].port | int | `53` | DNS port number |
| networkPolicy.egress[0].ports[0].protocol | string | `"UDP"` | Protocol type |
| networkPolicy.egress[0].to | list | `[{"namespaceSelector":{},"podSelector":{"matchLabels":{"k8s-app":"kube-dns"}}}]` | Destination selectors for DNS traffic |
| networkPolicy.egress[0].to[0] | object | `{"namespaceSelector":{},"podSelector":{"matchLabels":{"k8s-app":"kube-dns"}}}` | Namespace and pod selector for kube-dns |
| networkPolicy.egress[0].to[0].namespaceSelector | object | `{}` | Match all namespaces |
| networkPolicy.egress[0].to[0].podSelector | object | `{"matchLabels":{"k8s-app":"kube-dns"}}` | Pod selector for kube-dns |
| networkPolicy.egress[0].to[0].podSelector.matchLabels | object | `{"k8s-app":"kube-dns"}` | Label matcher for kube-dns pods |
| networkPolicy.egress[0].to[0].podSelector.matchLabels.k8s-app | string | `"kube-dns"` | Kubernetes app label for DNS service |
| networkPolicy.egress[1] | object | `{"ports":[{"port":5432,"protocol":"TCP"}],"to":[{"podSelector":{"matchLabels":{"app.kubernetes.io/name":"postgresql-ha"}}}]}` | Allow access to PostgreSQL database |
| networkPolicy.egress[1].ports | list | `[{"port":5432,"protocol":"TCP"}]` | Port definitions for PostgreSQL traffic |
| networkPolicy.egress[1].ports[0] | object | `{"port":5432,"protocol":"TCP"}` | TCP port configuration for PostgreSQL |
| networkPolicy.egress[1].ports[0].port | int | `5432` | PostgreSQL port number |
| networkPolicy.egress[1].ports[0].protocol | string | `"TCP"` | Protocol type |
| networkPolicy.egress[1].to | list | `[{"podSelector":{"matchLabels":{"app.kubernetes.io/name":"postgresql-ha"}}}]` | Destination selectors for PostgreSQL traffic |
| networkPolicy.egress[1].to[0] | object | `{"podSelector":{"matchLabels":{"app.kubernetes.io/name":"postgresql-ha"}}}` | Pod selector for PostgreSQL |
| networkPolicy.egress[1].to[0].podSelector | object | `{"matchLabels":{"app.kubernetes.io/name":"postgresql-ha"}}` | Pod selector configuration |
| networkPolicy.egress[1].to[0].podSelector.matchLabels | object | `{"app.kubernetes.io/name":"postgresql-ha"}` | Label matcher for PostgreSQL pods |
| networkPolicy.egress[1].to[0].podSelector.matchLabels."app.kubernetes.io/name" | string | `"postgresql-ha"` | Application name for PostgreSQL HA deployment |
| networkPolicy.egress[2] | object | `{"ports":[{"port":8080,"protocol":"TCP"}],"to":[{"podSelector":{"matchLabels":{"app.kubernetes.io/name":"graphql-engine"}}}]}` | Allow access to Hasura GraphQL Engine |
| networkPolicy.egress[2].ports | list | `[{"port":8080,"protocol":"TCP"}]` | Port definitions for Hasura traffic |
| networkPolicy.egress[2].ports[0] | object | `{"port":8080,"protocol":"TCP"}` | TCP port configuration for Hasura |
| networkPolicy.egress[2].ports[0].port | int | `8080` | Hasura GraphQL Engine port number |
| networkPolicy.egress[2].ports[0].protocol | string | `"TCP"` | Protocol type |
| networkPolicy.egress[2].to | list | `[{"podSelector":{"matchLabels":{"app.kubernetes.io/name":"graphql-engine"}}}]` | Destination selectors for Hasura traffic |
| networkPolicy.egress[2].to[0] | object | `{"podSelector":{"matchLabels":{"app.kubernetes.io/name":"graphql-engine"}}}` | Pod selector for Hasura |
| networkPolicy.egress[2].to[0].podSelector | object | `{"matchLabels":{"app.kubernetes.io/name":"graphql-engine"}}` | Pod selector configuration |
| networkPolicy.egress[2].to[0].podSelector.matchLabels | object | `{"app.kubernetes.io/name":"graphql-engine"}` | Label matcher for Hasura pods |
| networkPolicy.egress[2].to[0].podSelector.matchLabels."app.kubernetes.io/name" | string | `"graphql-engine"` | Application name for Hasura GraphQL Engine |
| networkPolicy.egress[3] | object | `{"ports":[{"port":3000,"protocol":"TCP"},{"port":3001,"protocol":"TCP"}],"to":[{"podSelector":{"matchLabels":{"app.kubernetes.io/name":"portal"}}}]}` | Allow access to Portal API |
| networkPolicy.egress[3].ports | list | `[{"port":3000,"protocol":"TCP"},{"port":3001,"protocol":"TCP"}]` | Port definitions for Portal traffic |
| networkPolicy.egress[3].ports[0] | object | `{"port":3000,"protocol":"TCP"}` | TCP port configuration for Portal HTTP API |
| networkPolicy.egress[3].ports[0].port | int | `3000` | Portal HTTP API port number |
| networkPolicy.egress[3].ports[0].protocol | string | `"TCP"` | Protocol type |
| networkPolicy.egress[3].ports[1] | object | `{"port":3001,"protocol":"TCP"}` | TCP port configuration for Portal GraphQL API |
| networkPolicy.egress[3].ports[1].port | int | `3001` | Portal GraphQL API port number |
| networkPolicy.egress[3].ports[1].protocol | string | `"TCP"` | Protocol type |
| networkPolicy.egress[3].to | list | `[{"podSelector":{"matchLabels":{"app.kubernetes.io/name":"portal"}}}]` | Destination selectors for Portal traffic |
| networkPolicy.egress[3].to[0] | object | `{"podSelector":{"matchLabels":{"app.kubernetes.io/name":"portal"}}}` | Pod selector for Portal |
| networkPolicy.egress[3].to[0].podSelector | object | `{"matchLabels":{"app.kubernetes.io/name":"portal"}}` | Pod selector configuration |
| networkPolicy.egress[3].to[0].podSelector.matchLabels | object | `{"app.kubernetes.io/name":"portal"}` | Label matcher for Portal pods |
| networkPolicy.egress[3].to[0].podSelector.matchLabels."app.kubernetes.io/name" | string | `"portal"` | Application name for Portal service |
| networkPolicy.egress[4] | object | `{"ports":[{"port":4000,"protocol":"TCP"}],"to":[{"podSelector":{"matchLabels":{"app.kubernetes.io/name":"erpc"}}}]}` | Allow access to ERPC (Ethereum RPC proxy) |
| networkPolicy.egress[4].ports | list | `[{"port":4000,"protocol":"TCP"}]` | Port definitions for ERPC traffic |
| networkPolicy.egress[4].ports[0] | object | `{"port":4000,"protocol":"TCP"}` | TCP port configuration for ERPC |
| networkPolicy.egress[4].ports[0].port | int | `4000` | ERPC port number |
| networkPolicy.egress[4].ports[0].protocol | string | `"TCP"` | Protocol type |
| networkPolicy.egress[4].to | list | `[{"podSelector":{"matchLabels":{"app.kubernetes.io/name":"erpc"}}}]` | Destination selectors for ERPC traffic |
| networkPolicy.egress[4].to[0] | object | `{"podSelector":{"matchLabels":{"app.kubernetes.io/name":"erpc"}}}` | Pod selector for ERPC |
| networkPolicy.egress[4].to[0].podSelector | object | `{"matchLabels":{"app.kubernetes.io/name":"erpc"}}` | Pod selector configuration |
| networkPolicy.egress[4].to[0].podSelector.matchLabels | object | `{"app.kubernetes.io/name":"erpc"}` | Label matcher for ERPC pods |
| networkPolicy.egress[4].to[0].podSelector.matchLabels."app.kubernetes.io/name" | string | `"erpc"` | Application name for ERPC service |
| networkPolicy.egress[5] | object | `{"ports":[{"port":443,"protocol":"TCP"}],"to":[{"namespaceSelector":{}}]}` | Allow external HTTPS traffic for external APIs |
| networkPolicy.egress[5].ports | list | `[{"port":443,"protocol":"TCP"}]` | Port definitions for HTTPS traffic |
| networkPolicy.egress[5].ports[0] | object | `{"port":443,"protocol":"TCP"}` | TCP port configuration for HTTPS |
| networkPolicy.egress[5].ports[0].port | int | `443` | HTTPS port number |
| networkPolicy.egress[5].ports[0].protocol | string | `"TCP"` | Protocol type |
| networkPolicy.egress[5].to | list | `[{"namespaceSelector":{}}]` | Destination selectors for external HTTPS traffic |
| networkPolicy.egress[5].to[0] | object | `{"namespaceSelector":{}}` | Match all namespaces for external access |
| networkPolicy.egress[5].to[0].namespaceSelector | object | `{}` | Namespace selector (empty = all namespaces) |
| networkPolicy.enabled | bool | `false` | Enable network policy |
| networkPolicy.ingress | list | `[{"from":[{"namespaceSelector":{"matchLabels":{"kubernetes.io/metadata.name":"ingress-nginx"}}}],"ports":[{"port":3000,"protocol":"TCP"}]},{"from":[{"podSelector":{}}],"ports":[{"port":3000,"protocol":"TCP"}]}]` | Ingress rules for the network policy |
| networkPolicy.ingress[0] | object | `{"from":[{"namespaceSelector":{"matchLabels":{"kubernetes.io/metadata.name":"ingress-nginx"}}}],"ports":[{"port":3000,"protocol":"TCP"}]}` | Allow traffic from ingress controller |
| networkPolicy.ingress[0].from | list | `[{"namespaceSelector":{"matchLabels":{"kubernetes.io/metadata.name":"ingress-nginx"}}}]` | Source selectors for ingress traffic |
| networkPolicy.ingress[0].from[0] | object | `{"namespaceSelector":{"matchLabels":{"kubernetes.io/metadata.name":"ingress-nginx"}}}` | Namespace selector for ingress-nginx |
| networkPolicy.ingress[0].from[0].namespaceSelector | object | `{"matchLabels":{"kubernetes.io/metadata.name":"ingress-nginx"}}` | Match labels for namespace selection |
| networkPolicy.ingress[0].from[0].namespaceSelector.matchLabels | object | `{"kubernetes.io/metadata.name":"ingress-nginx"}` | Label matcher for namespace |
| networkPolicy.ingress[0].from[0].namespaceSelector.matchLabels."kubernetes.io/metadata.name" | string | `"ingress-nginx"` | Namespace name label for ingress-nginx |
| networkPolicy.ingress[0].ports | list | `[{"port":3000,"protocol":"TCP"}]` | Port definitions for ingress traffic |
| networkPolicy.ingress[0].ports[0] | object | `{"port":3000,"protocol":"TCP"}` | TCP port configuration |
| networkPolicy.ingress[0].ports[0].port | int | `3000` | Port number |
| networkPolicy.ingress[0].ports[0].protocol | string | `"TCP"` | Protocol type |
| networkPolicy.ingress[1] | object | `{"from":[{"podSelector":{}}],"ports":[{"port":3000,"protocol":"TCP"}]}` | Allow traffic from same namespace |
| networkPolicy.ingress[1].from | list | `[{"podSelector":{}}]` | Source selectors for same-namespace traffic |
| networkPolicy.ingress[1].from[0] | object | `{"podSelector":{}}` | Pod selector (empty = all pods in namespace) |
| networkPolicy.ingress[1].ports | list | `[{"port":3000,"protocol":"TCP"}]` | Port definitions for same-namespace traffic |
| networkPolicy.ingress[1].ports[0] | object | `{"port":3000,"protocol":"TCP"}` | TCP port configuration |
| networkPolicy.ingress[1].ports[0].port | int | `3000` | Port number |
| networkPolicy.ingress[1].ports[0].protocol | string | `"TCP"` | Protocol type |
| nodeSelector | object | `{}` | Node selector for pod assignment |
| openShiftRoute | object | `{"alternateBackends":[],"annotations":{},"enabled":false,"host":"dapp.k8s.orb.local","path":"/","port":{"targetPort":"http"},"tls":null,"to":{"weight":100},"wildcardPolicy":"None"}` | OpenShift Route configuration |
| openShiftRoute.alternateBackends | list | `[]` | Additional backends for weighted routing |
| openShiftRoute.annotations | object | `{}` | Additional annotations for the OpenShift route resource |
| openShiftRoute.enabled | bool | `false` | Enable OpenShift route creation for DApp |
| openShiftRoute.host | string | `"dapp.k8s.orb.local"` | Hostname exposed via the OpenShift route |
| openShiftRoute.path | string | `"/"` | HTTP path exposed via the OpenShift route |
| openShiftRoute.port | object | `{"targetPort":"http"}` | Service port configuration for the route target |
| openShiftRoute.port.targetPort | string | `"http"` | Service target port name (must exist on the DApp service) |
| openShiftRoute.tls | object | `nil` | TLS configuration for the route (optional). Set to null for no TLS (HTTP only), or specify configuration for TLS termination |
| openShiftRoute.to | object | `{"weight":100}` | Primary service weight configuration |
| openShiftRoute.to.weight | int | `100` | Weight assigned to the DApp service backend |
| openShiftRoute.wildcardPolicy | string | `"None"` | Wildcard policy to apply to the route |
| podAnnotations | object | `{"prometheus.io/scrape":"false"}` | Annotations for dApp pods |
| podAnnotations."prometheus.io/scrape" | string | `"false"` | Disable Prometheus scraping by default; override to "true" to expose metrics |
| podDisruptionBudget | object | `{"enabled":false,"minAvailable":1}` | PodDisruptionBudget configuration |
| podDisruptionBudget.enabled | bool | `false` | Enable pod disruption budget |
| podDisruptionBudget.minAvailable | string | `1` | Minimum number of pods that must be available during disruption. Can be an integer or percentage (e.g., "50%") |
| podLabels | object | `{"app.kubernetes.io/component":"dapp","kots.io/app-slug":"settlemint-atk"}` | Additional labels for the deployment pod metadata |
| podLabels."app.kubernetes.io/component" | string | `"dapp"` | Kubernetes application component label |
| podLabels."kots.io/app-slug" | string | `"settlemint-atk"` | KOTS application slug identifier |
| podSecurityContext | object | `{}` | Pod security context configuration |
| probes | object | `{"liveness":{"failureThreshold":10,"httpGet":{"path":"/","port":"http","scheme":"HTTP"},"initialDelaySeconds":10,"periodSeconds":15,"successThreshold":1,"timeoutSeconds":3},"readiness":{"failureThreshold":10,"httpGet":{"path":"/","port":"http","scheme":"HTTP"},"initialDelaySeconds":5,"periodSeconds":10,"successThreshold":1,"timeoutSeconds":3}}` | Liveness and Readiness probes configuration |
| probes.liveness | object | `{"failureThreshold":10,"httpGet":{"path":"/","port":"http","scheme":"HTTP"},"initialDelaySeconds":10,"periodSeconds":15,"successThreshold":1,"timeoutSeconds":3}` | Liveness probe configuration |
| probes.liveness.failureThreshold | int | `10` | Number of consecutive failures needed to consider the container unhealthy |
| probes.liveness.httpGet | object | `{"path":"/","port":"http","scheme":"HTTP"}` | HTTP GET probe configuration |
| probes.liveness.httpGet.path | string | `"/"` | HTTP path to probe |
| probes.liveness.httpGet.port | string | `"http"` | Port name to probe |
| probes.liveness.httpGet.scheme | string | `"HTTP"` | HTTP or HTTPS scheme |
| probes.liveness.initialDelaySeconds | int | `10` | Number of seconds after the container has started before liveness probes are initiated |
| probes.liveness.periodSeconds | int | `15` | How often (in seconds) to perform the probe |
| probes.liveness.successThreshold | int | `1` | Minimum consecutive successes for the probe to be considered successful after having failed |
| probes.liveness.timeoutSeconds | int | `3` | Number of seconds after which the probe times out |
| probes.readiness | object | `{"failureThreshold":10,"httpGet":{"path":"/","port":"http","scheme":"HTTP"},"initialDelaySeconds":5,"periodSeconds":10,"successThreshold":1,"timeoutSeconds":3}` | Readiness probe configuration |
| probes.readiness.failureThreshold | int | `10` | Number of consecutive failures needed to consider the container not ready |
| probes.readiness.httpGet | object | `{"path":"/","port":"http","scheme":"HTTP"}` | HTTP GET probe configuration |
| probes.readiness.httpGet.path | string | `"/"` | HTTP path to probe |
| probes.readiness.httpGet.port | string | `"http"` | Port name to probe |
| probes.readiness.httpGet.scheme | string | `"HTTP"` | HTTP or HTTPS scheme |
| probes.readiness.initialDelaySeconds | int | `5` | Number of seconds after the container has started before readiness probes are initiated |
| probes.readiness.periodSeconds | int | `10` | How often (in seconds) to perform the probe |
| probes.readiness.successThreshold | int | `1` | Minimum consecutive successes for the probe to be considered successful after having failed |
| probes.readiness.timeoutSeconds | int | `3` | Number of seconds after which the probe times out |
| replicaCount | int | `1` | Number of dApp replicas to deploy |
| resources | object | `{}` | Resource requests and limits for the dApp container |
| secretEnv | object | `{"BETTER_AUTH_URL":"https://dapp.local","NEXTAUTH_URL":"https://dapp.local","NEXT_PUBLIC_APP_ID":"dapp","OTEL_EXPORTER_OTLP_ENDPOINT":"http://alloy:4318/v1/traces","OTEL_EXPORTER_OTLP_PROTOCOL":"http","SETTLEMINT_BLOCKCHAIN_NODE_JSON_RPC_ENDPOINT":"http://txsigner:3000","SETTLEMINT_BLOCKSCOUT_UI_ENDPOINT":"http://blockscout-frontend-svc/","SETTLEMINT_HASURA_ADMIN_SECRET":"atk","SETTLEMINT_HASURA_DATABASE_URL":"{{ include \"atk.datastores.postgresql.url\" (dict \"context\" $ \"chartKey\" \"hasura\") }}","SETTLEMINT_HASURA_ENDPOINT":"http://hasura:8080/v1/graphql","SETTLEMINT_HD_PRIVATE_KEY":"atk-hd-private-key","SETTLEMINT_INSTANCE":"standalone","SETTLEMINT_PORTAL_GRAPHQL_ENDPOINT":"http://portal:3001/graphql","SETTLEMINT_THEGRAPH_SUBGRAPHS_ENDPOINTS":"[\"http://graph-node-combined:8000/subgraphs/name/kit\"]"}` | Environment variables sourced from a secret. These will be created in the secret.yaml template |
| secretEnv.BETTER_AUTH_URL | string | `"https://dapp.local"` | Better Auth authentication URL |
| secretEnv.NEXTAUTH_URL | string | `"https://dapp.local"` | NextAuth.js authentication URL |
| secretEnv.NEXT_PUBLIC_APP_ID | string | `"dapp"` | Next.js public application identifier |
| secretEnv.OTEL_EXPORTER_OTLP_ENDPOINT | string | `"http://alloy:4318/v1/traces"` | OpenTelemetry OTLP exporter endpoint for traces |
| secretEnv.OTEL_EXPORTER_OTLP_PROTOCOL | string | `"http"` | OpenTelemetry OTLP protocol |
| secretEnv.SETTLEMINT_BLOCKCHAIN_NODE_JSON_RPC_ENDPOINT | string | `"http://txsigner:3000"` | Blockchain node JSON-RPC endpoint via transaction signer |
| secretEnv.SETTLEMINT_BLOCKSCOUT_UI_ENDPOINT | string | `"http://blockscout-frontend-svc/"` | Blockscout block explorer UI endpoint |
| secretEnv.SETTLEMINT_HASURA_ADMIN_SECRET | string | `"atk"` | Hasura GraphQL Engine admin secret for authentication |
| secretEnv.SETTLEMINT_HASURA_DATABASE_URL | string | `"{{ include \"atk.datastores.postgresql.url\" (dict \"context\" $ \"chartKey\" \"hasura\") }}"` | Hasura PostgreSQL database connection URL (templated) |
| secretEnv.SETTLEMINT_HASURA_ENDPOINT | string | `"http://hasura:8080/v1/graphql"` | Hasura GraphQL Engine endpoint |
| secretEnv.SETTLEMINT_HD_PRIVATE_KEY | string | `"atk-hd-private-key"` | Hierarchical Deterministic (HD) wallet private key identifier |
| secretEnv.SETTLEMINT_INSTANCE | string | `"standalone"` | SettleMint instance type (standalone or cloud) |
| secretEnv.SETTLEMINT_PORTAL_GRAPHQL_ENDPOINT | string | `"http://portal:3001/graphql"` | SettleMint Portal GraphQL API endpoint |
| secretEnv.SETTLEMINT_THEGRAPH_SUBGRAPHS_ENDPOINTS | string | `"[\"http://graph-node-combined:8000/subgraphs/name/kit\"]"` | The Graph Protocol subgraph endpoints (JSON array) |
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

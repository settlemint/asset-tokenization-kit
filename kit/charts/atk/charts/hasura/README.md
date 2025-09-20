# hasura

![Version: 2.0.0-alpha.7](https://img.shields.io/badge/Version-2.0.0--alpha.7-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: 2.0.0-alpha.7](https://img.shields.io/badge/AppVersion-2.0.0--alpha.7-informational?style=flat-square)

A Helm chart for the hasura components

## Maintainers

| Name | Email | Url |
| ---- | ------ | --- |
| SettleMint | <support@settlemint.com> | <https://settlemint.com> |

## Requirements

| Repository | Name | Version |
|------------|------|---------|
| https://hasura.github.io/helm-charts | graphql-engine | 0.9.0 |

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| busybox | object | `{"pullPolicy":"IfNotPresent","registry":"docker.io","repository":"busybox","tag":1.37}` | Busybox image configuration for utility tasks |
| busybox.pullPolicy | string | `"IfNotPresent"` | Busybox image pull policy |
| busybox.registry | string | `"docker.io"` | Busybox image registry |
| busybox.repository | string | `"busybox"` | Busybox image repository |
| busybox.tag | string | `1.37` | Busybox image tag |
| git | object | `{"image":{"pullPolicy":"IfNotPresent","registry":"docker.io","repository":"alpine/git","tag":"v2.49.1"}}` | Git image configuration for repository operations |
| git.image | object | `{"pullPolicy":"IfNotPresent","registry":"docker.io","repository":"alpine/git","tag":"v2.49.1"}` | Git image configuration |
| git.image.pullPolicy | string | `"IfNotPresent"` | Git image pull policy |
| git.image.registry | string | `"docker.io"` | Git image registry |
| git.image.repository | string | `"alpine/git"` | Git image repository |
| git.image.tag | string | `"v2.49.1"` | Git image tag |
| global.labels."kots.io/app-slug" | string | `"settlemint-atk"` |  |
| graphql-engine | object | `{"config":{"devMode":true,"enableInternalConsoleAssets":true,"metadataOnly":false},"extraEnvs":[{"name":"HASURA_GRAPHQL_PG_CONNECTIONS","value":"10"},{"name":"HASURA_GRAPHQL_DATABASE_URL","valueFrom":{"secretKeyRef":{"key":"DEFAULT_DB_URL","name":"atk-secrets"}}}],"global":{"imagePullSecrets":[]},"image":{"repository":"docker.io/hasura/graphql-engine"},"ingress":{"enabled":true,"hostName":"hasura.k8s.orb.local","ingressClassName":"atk-nginx"},"initContainers":[{"command":["/usr/bin/wait-for-it","postgresql:5432","-t","120"],"image":"ghcr.io/settlemint/btp-waitforit:v7.7.10","imagePullPolicy":"IfNotPresent","name":"wait-for-postgresql","resources":{"limits":{"cpu":"100m","memory":"64Mi"},"requests":{"cpu":"10m","memory":"32Mi"}}}],"labels":{"app.kubernetes.io/component":"hasura","app.kubernetes.io/instance":"atk","app.kubernetes.io/managed-by":"helm","app.kubernetes.io/part-of":"settlemint-atk","kots.io/app-slug":"settlemint-atk"},"nameOverride":"hasura","openShiftRoute":{"alternateBackends":[],"annotations":{},"enabled":false,"host":"hasura.k8s.orb.local","path":"/","port":{"targetPort":"http"},"tls":null,"to":{"weight":100},"wildcardPolicy":"None"},"postgres":{"enabled":false},"replicas":1,"secret":{"adminSecret":"atk","enabled":true,"extraSecrets":{"DEFAULT_DB_URL":"postgresql://hasura:atk@postgresql:5432/hasura"},"metadataDbUrl":"postgresql://hasura:atk@postgresql:5432/hasura","rateLimitRedisUrl":"redis://default:atk@redis:6379","redisUrl":"redis://default:atk@redis:6379"}}` | Hasura GraphQL Engine configuration |
| graphql-engine.config | object | `{"devMode":true,"enableInternalConsoleAssets":true,"metadataOnly":false}` | Hasura GraphQL Engine configuration |
| graphql-engine.config.devMode | bool | `true` | Enable development mode |
| graphql-engine.config.enableInternalConsoleAssets | bool | `true` | Enable internal console assets |
| graphql-engine.config.metadataOnly | bool | `false` | Enable metadata-only mode |
| graphql-engine.extraEnvs | list | `[{"name":"HASURA_GRAPHQL_PG_CONNECTIONS","value":"10"},{"name":"HASURA_GRAPHQL_DATABASE_URL","valueFrom":{"secretKeyRef":{"key":"DEFAULT_DB_URL","name":"atk-secrets"}}}]` | Additional environment variables for Hasura |
| graphql-engine.global | object | `{"imagePullSecrets":[]}` | Global configuration for Hasura |
| graphql-engine.global.imagePullSecrets | list | `[]` | Global Docker registry secret names as an array |
| graphql-engine.image | object | `{"repository":"docker.io/hasura/graphql-engine"}` | Hasura image configuration |
| graphql-engine.image.repository | string | `"docker.io/hasura/graphql-engine"` | Hasura image repository |
| graphql-engine.ingress | object | `{"enabled":true,"hostName":"hasura.k8s.orb.local","ingressClassName":"atk-nginx"}` | Ingress parameters for Hasura |
| graphql-engine.ingress.enabled | bool | `true` | Enable ingress record generation for Hasura |
| graphql-engine.ingress.hostName | string | `"hasura.k8s.orb.local"` | Default host for the ingress record |
| graphql-engine.ingress.ingressClassName | string | `"atk-nginx"` | IngressClass that will be be used to implement the Ingress (Kubernetes 1.18+) |
| graphql-engine.initContainers | list | `[{"command":["/usr/bin/wait-for-it","postgresql:5432","-t","120"],"image":"ghcr.io/settlemint/btp-waitforit:v7.7.10","imagePullPolicy":"IfNotPresent","name":"wait-for-postgresql","resources":{"limits":{"cpu":"100m","memory":"64Mi"},"requests":{"cpu":"10m","memory":"32Mi"}}}]` | Init containers for Hasura |
| graphql-engine.labels | object | `{"app.kubernetes.io/component":"hasura","app.kubernetes.io/instance":"atk","app.kubernetes.io/managed-by":"helm","app.kubernetes.io/part-of":"settlemint-atk","kots.io/app-slug":"settlemint-atk"}` | Labels to add to all Hasura resources |
| graphql-engine.nameOverride | string | `"hasura"` | String to partially override common.names.fullname template (will maintain the release name) |
| graphql-engine.openShiftRoute | object | `{"alternateBackends":[],"annotations":{},"enabled":false,"host":"hasura.k8s.orb.local","path":"/","port":{"targetPort":"http"},"tls":null,"to":{"weight":100},"wildcardPolicy":"None"}` | OpenShift Route parameters for Hasura |
| graphql-engine.openShiftRoute.alternateBackends | list | `[]` | Additional backends for weighted routing |
| graphql-engine.openShiftRoute.annotations | object | `{}` | Additional annotations for the OpenShift route resource |
| graphql-engine.openShiftRoute.enabled | bool | `false` | Enable OpenShift route creation for Hasura |
| graphql-engine.openShiftRoute.host | string | `"hasura.k8s.orb.local"` | Hostname exposed via the OpenShift route |
| graphql-engine.openShiftRoute.path | string | `"/"` | HTTP path exposed via the OpenShift route |
| graphql-engine.openShiftRoute.port | object | `{"targetPort":"http"}` | Service port configuration for the route target |
| graphql-engine.openShiftRoute.port.targetPort | string | `"http"` | Service target port name (must exist on the Hasura service) |
| graphql-engine.openShiftRoute.tls | object | `nil` | TLS configuration for the OpenShift route |
| graphql-engine.openShiftRoute.to | object | `{"weight":100}` | Primary service weight configuration |
| graphql-engine.openShiftRoute.to.weight | int | `100` | Weight assigned to the Hasura service backend |
| graphql-engine.openShiftRoute.wildcardPolicy | string | `"None"` | Wildcard policy to apply to the route |
| graphql-engine.postgres | object | `{"enabled":false}` | PostgreSQL configuration (disabled, using external PostgreSQL) |
| graphql-engine.postgres.enabled | bool | `false` | Enable embedded PostgreSQL |
| graphql-engine.replicas | int | `1` | Number of Hasura replicas to deploy |
| graphql-engine.secret | object | `{"adminSecret":"atk","enabled":true,"extraSecrets":{"DEFAULT_DB_URL":"postgresql://hasura:atk@postgresql:5432/hasura"},"metadataDbUrl":"postgresql://hasura:atk@postgresql:5432/hasura","rateLimitRedisUrl":"redis://default:atk@redis:6379","redisUrl":"redis://default:atk@redis:6379"}` | Hasura secret configuration |
| graphql-engine.secret.adminSecret | string | `"atk"` | Admin secret for Hasura console |
| graphql-engine.secret.enabled | bool | `true` | Enable secret creation |
| graphql-engine.secret.extraSecrets | object | `{"DEFAULT_DB_URL":"postgresql://hasura:atk@postgresql:5432/hasura"}` | Additional secrets for Hasura |
| graphql-engine.secret.extraSecrets.DEFAULT_DB_URL | string | `"postgresql://hasura:atk@postgresql:5432/hasura"` | Default database URL |
| graphql-engine.secret.metadataDbUrl | string | `"postgresql://hasura:atk@postgresql:5432/hasura"` | Metadata database URL |
| graphql-engine.secret.rateLimitRedisUrl | string | `"redis://default:atk@redis:6379"` | Redis URL for rate limiting |
| graphql-engine.secret.redisUrl | string | `"redis://default:atk@redis:6379"` | Redis URL for caching |
| imagePullSecrets | list | `[]` | Global Docker registry secret names as an array |
| job | object | `{"workspace":{"accessMode":"ReadWriteOnce","enabled":true,"size":"1Gi","storageClass":""}}` | Job configuration for Hasura metadata operations |
| job.workspace | object | `{"accessMode":"ReadWriteOnce","enabled":true,"size":"1Gi","storageClass":""}` | Workspace configuration for jobs |
| job.workspace.accessMode | string | `"ReadWriteOnce"` | Access mode for the workspace volume |
| job.workspace.enabled | bool | `true` | Configure the persistent volume claim for the job workspace |
| job.workspace.size | string | `"1Gi"` | Size of the workspace volume |
| job.workspace.storageClass | string | `""` | Storage class for the workspace volume (uses default if empty) |

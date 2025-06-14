# hasura

![Version: 0.1.0](https://img.shields.io/badge/Version-0.1.0-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: 0.1.0](https://img.shields.io/badge/AppVersion-0.1.0-informational?style=flat-square)

A Helm chart for the hasura components

## Maintainers

| Name | Email | Url |
| ---- | ------ | --- |
| SettleMint | <support@settlemint.com> | <https://settlemint.com> |

## Requirements

| Repository | Name | Version |
|------------|------|---------|
| https://hasura.github.io/helm-charts | graphql-engine | 0.8.0 |

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| busybox.pullPolicy | string | `"IfNotPresent"` |  |
| busybox.registry | string | `"docker.io"` |  |
| busybox.repository | string | `"busybox"` |  |
| busybox.tag | float | `1.37` |  |
| git.image.pullPolicy | string | `"IfNotPresent"` |  |
| git.image.registry | string | `"docker.io"` |  |
| git.image.repository | string | `"alpine/git"` |  |
| git.image.tag | string | `"2.49.0"` |  |
| graphql-engine.config.devMode | bool | `true` |  |
| graphql-engine.config.enableInternalConsoleAssets | bool | `true` |  |
| graphql-engine.config.metadataOnly | bool | `false` |  |
| graphql-engine.extraEnvs[0].name | string | `"HASURA_GRAPHQL_PG_CONNECTIONS"` |  |
| graphql-engine.extraEnvs[0].value | string | `"10"` |  |
| graphql-engine.extraEnvs[1].name | string | `"HASURA_GRAPHQL_DATABASE_URL"` |  |
| graphql-engine.extraEnvs[1].valueFrom.secretKeyRef.key | string | `"DEFAULT_DB_URL"` |  |
| graphql-engine.extraEnvs[1].valueFrom.secretKeyRef.name | string | `"atk-secrets"` |  |
| graphql-engine.global.imagePullSecrets[0] | string | `"image-pull-secret-docker"` |  |
| graphql-engine.global.imagePullSecrets[1] | string | `"image-pull-secret-ghcr"` |  |
| graphql-engine.global.imagePullSecrets[2] | string | `"image-pull-secret-harbor"` |  |
| graphql-engine.ingress.enabled | bool | `true` |  |
| graphql-engine.ingress.hostName | string | `"hasura.k8s.orb.local"` |  |
| graphql-engine.ingress.ingressClassName | string | `"settlemint-nginx"` |  |
| graphql-engine.initContainers[0].command[0] | string | `"/usr/bin/wait-for-it"` |  |
| graphql-engine.initContainers[0].command[1] | string | `"postgresql-pgpool:5432"` |  |
| graphql-engine.initContainers[0].command[2] | string | `"-t"` |  |
| graphql-engine.initContainers[0].command[3] | string | `"0"` |  |
| graphql-engine.initContainers[0].image | string | `"ghcr.io/settlemint/btp-waitforit:v7.7.5"` |  |
| graphql-engine.initContainers[0].name | string | `"wait-for-postgresql"` |  |
| graphql-engine.labels."app.kubernetes.io/component" | string | `"hasura"` |  |
| graphql-engine.labels."app.kubernetes.io/instance" | string | `"atk"` |  |
| graphql-engine.labels."app.kubernetes.io/managed-by" | string | `"helm"` |  |
| graphql-engine.labels."app.kubernetes.io/part-of" | string | `"settlemint-atk"` |  |
| graphql-engine.labels."kots.io/app-slug" | string | `"settlemint-atk"` |  |
| graphql-engine.nameOverride | string | `"hasura"` |  |
| graphql-engine.postgres.enabled | bool | `false` |  |
| graphql-engine.replicas | int | `1` |  |
| graphql-engine.secret.adminSecret | string | `"atk"` |  |
| graphql-engine.secret.enabled | bool | `true` |  |
| graphql-engine.secret.extraSecrets.DEFAULT_DB_URL | string | `"postgresql://hasura:atk@postgresql-pgpool:5432/hasura"` |  |
| graphql-engine.secret.metadataDbUrl | string | `"postgresql://hasura:atk@postgresql-pgpool:5432/hasura"` |  |
| graphql-engine.secret.rateLimitRedisUrl | string | `"redis://default:atk@redis-master:6379"` |  |
| graphql-engine.secret.redisUrl | string | `"redis://default:atk@redis-master:6379"` |  |
| imagePullSecrets[0] | string | `"image-pull-secret-docker"` |  |
| imagePullSecrets[1] | string | `"image-pull-secret-ghcr"` |  |
| imagePullSecrets[2] | string | `"image-pull-secret-harbor"` |  |
| job.workspace.accessMode | string | `"ReadWriteOnce"` |  |
| job.workspace.enabled | bool | `true` | Configure the persistent volume claim for the job workspace |
| job.workspace.size | string | `"1Gi"` |  |
| job.workspace.storageClass | string | `""` |  |

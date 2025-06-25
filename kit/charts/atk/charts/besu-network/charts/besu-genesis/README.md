# besu-genesis

![Version: 0.1.0](https://img.shields.io/badge/Version-0.1.0-informational?style=flat-square) ![AppVersion: latest](https://img.shields.io/badge/AppVersion-latest-informational?style=flat-square)

Besu Genesis generator with Helm chart in Kubernetes

**Homepage:** <https://besu.hyperledger.org>

## Maintainers

| Name | Email | Url |
| ---- | ------ | --- |
| Joshua Fernandes | <joshua.fernandes@consensys.net> |  |

## Source Code

* <https://github.com/hyperledger/besu>

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| aws.region | string | `"ap-southeast-2"` |  |
| aws.serviceAccountName | string | `"quorum-sa"` |  |
| azure.identityClientId | string | `"azure-clientId"` |  |
| azure.keyvaultName | string | `"azure-keyvault"` |  |
| azure.serviceAccountName | string | `"quorum-sa"` |  |
| azure.subscriptionId | string | `"azure-subscriptionId"` |  |
| azure.tenantId | string | `"azure-tenantId"` |  |
| cluster.cloudNativeServices | bool | `false` |  |
| cluster.provider | string | `"local"` |  |
| genesisServer.image.pullPolicy | string | `"IfNotPresent"` |  |
| genesisServer.image.registry | string | `"docker.io"` |  |
| genesisServer.image.repository | string | `"nginx"` |  |
| genesisServer.image.tag | string | `"1.29.0-alpine"` |  |
| image.pullPolicy | string | `"IfNotPresent"` |  |
| image.repository | string | `"ghcr.io/settlemint/quorum-genesis-tool"` |  |
| image.tag | string | `"sha-49c40f5"` |  |
| imagePullSecrets[0] | string | `"image-pull-secret-harbor"` |  |
| imagePullSecrets[1] | string | `"image-pull-secret-ghcr"` |  |
| imagePullSecrets[2] | string | `"image-pull-secret-docker"` |  |
| initJob.annotations."helm.sh/hook" | string | `"pre-install"` |  |
| initJob.annotations."helm.sh/hook-delete-policy" | string | `"hook-succeeded"` |  |
| initJob.annotations."helm.sh/hook-weight" | string | `"-10"` |  |
| quorumFlags.removeGenesisOnDelete | bool | `true` |  |
| rawGenesisConfig.blockchain.accountPassword | string | `"password"` |  |
| rawGenesisConfig.blockchain.nodes.count | int | `1` |  |
| rawGenesisConfig.blockchain.nodes.generate | bool | `true` |  |
| rawGenesisConfig.genesis.coinbase | string | `"0x0000000000000000000000000000000000000000"` |  |
| rawGenesisConfig.genesis.config.algorithm.blockperiodseconds | int | `2` |  |
| rawGenesisConfig.genesis.config.algorithm.consensus | string | `"qbft"` |  |
| rawGenesisConfig.genesis.config.algorithm.epochlength | int | `30000` |  |
| rawGenesisConfig.genesis.config.algorithm.requesttimeoutseconds | int | `65` |  |
| rawGenesisConfig.genesis.config.chainId | int | `53771311147` |  |
| rawGenesisConfig.genesis.difficulty | string | `"0x1"` |  |
| rawGenesisConfig.genesis.gasLimit | string | `"9007199254740991"` |  |
| rawGenesisConfig.genesis.includeQuickStartAccounts | bool | `false` |  |
| serviceAccount.annotations."helm.sh/hook" | string | `"pre-install,pre-delete,post-delete"` |  |
| serviceAccount.annotations."helm.sh/hook-weight" | string | `"-11"` |  |
| serviceAccountRole.annotations."helm.sh/hook" | string | `"pre-install,pre-delete,post-delete"` |  |
| serviceAccountRole.annotations."helm.sh/hook-weight" | string | `"-12"` |  |
| serviceAccountRoleBinding.annotations."helm.sh/hook" | string | `"pre-install,pre-delete,post-delete"` |  |
| serviceAccountRoleBinding.annotations."helm.sh/hook-weight" | string | `"-11"` |  |
| storage.size | string | `"1Gi"` |  |
| storage.storageClassName | string | `""` |  |

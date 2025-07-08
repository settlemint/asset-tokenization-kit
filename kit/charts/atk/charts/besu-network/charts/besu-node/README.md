# besu-node

![Version: 0.1.0](https://img.shields.io/badge/Version-0.1.0-informational?style=flat-square) ![AppVersion: 22.1.3](https://img.shields.io/badge/AppVersion-22.1.3-informational?style=flat-square)

Besu nodes for a POA network

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
| azure.nodePoolIdentityClientId | string | `"azure-clientId"` |  |
| azure.serviceAccountName | string | `"quorum-sa"` |  |
| azure.subscriptionId | string | `"azure-subscriptionId"` |  |
| azure.tenantId | string | `"azure-tenantId"` |  |
| cluster.cloudNativeServices | bool | `false` |  |
| cluster.provider | string | `"local"` |  |
| cluster.reclaimPolicy | string | `"Delete"` |  |
| fullnameOverride | string | `""` |  |
| hooks.image.pullPolicy | string | `"IfNotPresent"` |  |
| hooks.image.repository | string | `"ghcr.io/settlemint/quorum-genesis-tool"` |  |
| hooks.image.tag | string | `"sha-49c40f5"` |  |
| imagePullPolicy | string | `"IfNotPresent"` |  |
| imagePullSecrets | list | `[]` |  |
| initContainers.busybox.image.pullPolicy | string | `"IfNotPresent"` |  |
| initContainers.busybox.image.registry | string | `"docker.io"` |  |
| initContainers.busybox.image.repository | string | `"busybox"` |  |
| initContainers.busybox.image.tag | float | `1.37` |  |
| initContainers.curl.image.pullPolicy | string | `"IfNotPresent"` |  |
| initContainers.curl.image.registry | string | `"docker.io"` |  |
| initContainers.curl.image.repository | string | `"curlimages/curl"` |  |
| initContainers.curl.image.tag | string | `"8.14.1"` |  |
| nameOverride | string | `""` |  |
| networkPolicy.egress[0].ports[0].port | int | `53` |  |
| networkPolicy.egress[0].ports[0].protocol | string | `"UDP"` |  |
| networkPolicy.egress[0].to[0].namespaceSelector | object | `{}` |  |
| networkPolicy.egress[0].to[0].podSelector.matchLabels.k8s-app | string | `"kube-dns"` |  |
| networkPolicy.egress[1].ports[0].port | int | `30303` |  |
| networkPolicy.egress[1].ports[0].protocol | string | `"TCP"` |  |
| networkPolicy.egress[1].to[0].podSelector.matchLabels."app.kubernetes.io/name" | string | `"besu-statefulset"` |  |
| networkPolicy.egress[2].ports[0].port | int | `30303` |  |
| networkPolicy.egress[2].ports[0].protocol | string | `"TCP"` |  |
| networkPolicy.egress[2].to[0].namespaceSelector | object | `{}` |  |
| networkPolicy.enabled | bool | `false` |  |
| networkPolicy.ingress[0].from[0].podSelector.matchLabels."app.kubernetes.io/name" | string | `"txsigner"` |  |
| networkPolicy.ingress[0].from[1].podSelector.matchLabels."app.kubernetes.io/name" | string | `"erpc"` |  |
| networkPolicy.ingress[0].from[2].podSelector.matchLabels."app.kubernetes.io/name" | string | `"blockscout-stack"` |  |
| networkPolicy.ingress[0].from[3].podSelector.matchLabels."app.kubernetes.io/name" | string | `"graph-node"` |  |
| networkPolicy.ingress[0].from[4].podSelector | object | `{}` |  |
| networkPolicy.ingress[0].ports[0].port | int | `8545` |  |
| networkPolicy.ingress[0].ports[0].protocol | string | `"TCP"` |  |
| networkPolicy.ingress[0].ports[1].port | int | `8546` |  |
| networkPolicy.ingress[0].ports[1].protocol | string | `"TCP"` |  |
| networkPolicy.ingress[0].ports[2].port | int | `8547` |  |
| networkPolicy.ingress[0].ports[2].protocol | string | `"TCP"` |  |
| networkPolicy.ingress[0].ports[3].port | int | `9545` |  |
| networkPolicy.ingress[0].ports[3].protocol | string | `"TCP"` |  |
| networkPolicy.ingress[1].from[0].podSelector.matchLabels."app.kubernetes.io/name" | string | `"besu-statefulset"` |  |
| networkPolicy.ingress[1].ports[0].port | int | `30303` |  |
| networkPolicy.ingress[1].ports[0].protocol | string | `"TCP"` |  |
| node.besu.account.password | string | `"password"` |  |
| node.besu.account.passwordPath | string | `"/keys/accountPassword"` |  |
| node.besu.bonsaiLimitTrieLogsEnabled | bool | `false` |  |
| node.besu.cacheLastBlocks | int | `1024` |  |
| node.besu.customLabels | object | `{}` |  |
| node.besu.dataPath | string | `"/data/besu"` |  |
| node.besu.dataStorageFormat | string | `"FOREST"` |  |
| node.besu.envBesuOpts | string | `""` |  |
| node.besu.genesisFilePath | string | `"/etc/genesis/genesis.json"` |  |
| node.besu.graphql.corsOrigins[0] | string | `"all"` |  |
| node.besu.graphql.enabled | bool | `true` |  |
| node.besu.graphql.host | string | `"0.0.0.0"` |  |
| node.besu.graphql.port | int | `8547` |  |
| node.besu.http.allowlist[0] | string | `"*"` |  |
| node.besu.image.pullPolicy | string | `"IfNotPresent"` |  |
| node.besu.image.repository | string | `"docker.io/hyperledger/besu"` |  |
| node.besu.image.tag | string | `"25.7.0"` |  |
| node.besu.keysPath | string | `"/keys"` |  |
| node.besu.logging | string | `"INFO"` |  |
| node.besu.metrics.enabled | bool | `true` |  |
| node.besu.metrics.host | string | `"0.0.0.0"` |  |
| node.besu.metrics.port | int | `9545` |  |
| node.besu.metrics.serviceMonitorEnabled | bool | `false` |  |
| node.besu.metricsPush.enabled | bool | `false` |  |
| node.besu.metricsPush.host | string | `"5.5.5.5"` |  |
| node.besu.metricsPush.interval | int | `15` |  |
| node.besu.metricsPush.port | int | `9091` |  |
| node.besu.metricsPush.prometheusJob | string | `"besu"` |  |
| node.besu.minGasPrice | int | `0` |  |
| node.besu.p2p.discovery | bool | `true` |  |
| node.besu.p2p.enabled | bool | `true` |  |
| node.besu.p2p.host | string | `"0.0.0.0"` |  |
| node.besu.p2p.maxPeers | int | `25` |  |
| node.besu.p2p.port | int | `30303` |  |
| node.besu.p2p.randomPeerPriorityEnabled | bool | `true` |  |
| node.besu.p2p.receiptCompactionEnabled | bool | `true` |  |
| node.besu.p2p.remoteConnectionsLimitEnabled | bool | `false` |  |
| node.besu.p2p.staticNodes | string | `"/config/static/static-nodes.json"` |  |
| node.besu.permissions.accounts.allowlist[0] | string | `"0x0000000000000000000000000000000000008888"` |  |
| node.besu.permissions.accounts.enabled | bool | `false` |  |
| node.besu.permissions.accountsContract.address | string | `"0x0000000000000000000000000000000000008888"` |  |
| node.besu.permissions.accountsContract.enabled | bool | `false` |  |
| node.besu.permissions.enabled | bool | `false` |  |
| node.besu.permissions.filePath | string | `""` |  |
| node.besu.permissions.nodes.allowlist[0] | string | `"enode://abcd..@1.2.3.3:30303"` |  |
| node.besu.permissions.nodes.allowlist[1] | string | `"enode://efba..@1.2.3.4:besu-node-bootnode-1-0.besu-node-bootnode-1.besu.svc.cluster.local:30303"` |  |
| node.besu.permissions.nodes.enabled | bool | `false` |  |
| node.besu.permissions.nodesContract.address | string | `"0x0000000000000000000000000000000000009999"` |  |
| node.besu.permissions.nodesContract.enabled | bool | `false` |  |
| node.besu.privacy.onchainGroupsEnabled | bool | `false` |  |
| node.besu.privacy.pubkeyFile | string | `"tm.pub"` |  |
| node.besu.privacy.pubkeysPath | string | `"/tessera"` |  |
| node.besu.privacy.url | string | `"http://localhost:9101"` |  |
| node.besu.privateKeyPath | string | `"/keys/nodekey"` |  |
| node.besu.resources | object | `{}` |  |
| node.besu.rpc.api[0] | string | `"DEBUG"` |  |
| node.besu.rpc.api[1] | string | `"ETH"` |  |
| node.besu.rpc.api[2] | string | `"ADMIN"` |  |
| node.besu.rpc.api[3] | string | `"WEB3"` |  |
| node.besu.rpc.api[4] | string | `"IBFT"` |  |
| node.besu.rpc.api[5] | string | `"NET"` |  |
| node.besu.rpc.api[6] | string | `"TRACE"` |  |
| node.besu.rpc.api[7] | string | `"QBFT"` |  |
| node.besu.rpc.api[8] | string | `"PERM"` |  |
| node.besu.rpc.api[9] | string | `"TXPOOL"` |  |
| node.besu.rpc.authenticationEnabled | bool | `false` |  |
| node.besu.rpc.corsOrigins[0] | string | `"all"` |  |
| node.besu.rpc.enabled | bool | `true` |  |
| node.besu.rpc.host | string | `"0.0.0.0"` |  |
| node.besu.rpc.maxActiveConnections | int | `2000` |  |
| node.besu.rpc.maxBatchSize | int | `512` |  |
| node.besu.rpc.port | int | `8545` |  |
| node.besu.syncMinPeers | int | `1` |  |
| node.besu.syncMode | string | `"FULL"` |  |
| node.besu.txPool | string | `"SEQUENCED"` |  |
| node.besu.txPoolEnableSaveRestore | bool | `true` |  |
| node.besu.txPoolLimitByAccountPercentage | int | `1` |  |
| node.besu.txPoolMaxSize | int | `100000` |  |
| node.besu.txPoolNoLocalPriority | bool | `true` |  |
| node.besu.ws.api[0] | string | `"DEBUG"` |  |
| node.besu.ws.api[10] | string | `"PERM"` |  |
| node.besu.ws.api[11] | string | `"TXPOOL"` |  |
| node.besu.ws.api[1] | string | `"ETH"` |  |
| node.besu.ws.api[2] | string | `"ADMIN"` |  |
| node.besu.ws.api[3] | string | `"WEB3"` |  |
| node.besu.ws.api[4] | string | `"IBFT"` |  |
| node.besu.ws.api[5] | string | `"NET"` |  |
| node.besu.ws.api[6] | string | `"TRACE"` |  |
| node.besu.ws.api[7] | string | `"EEA"` |  |
| node.besu.ws.api[8] | string | `"PRIV"` |  |
| node.besu.ws.api[9] | string | `"QBFT"` |  |
| node.besu.ws.authenticationEnabled | bool | `false` |  |
| node.besu.ws.enabled | bool | `true` |  |
| node.besu.ws.host | string | `"0.0.0.0"` |  |
| node.besu.ws.maxActiveConnections | int | `2000` |  |
| node.besu.ws.port | int | `8546` |  |
| node.tessera.dataPath | string | `"/data/tessera"` |  |
| node.tessera.image.pullPolicy | string | `"IfNotPresent"` |  |
| node.tessera.image.repository | string | `"docker.io/quorumengineering/tessera"` |  |
| node.tessera.image.tag | float | `24.4` |  |
| node.tessera.keysPath | string | `"/keys"` |  |
| node.tessera.password | string | `"password"` |  |
| node.tessera.passwordPath | string | `"/keys/tm.password"` |  |
| node.tessera.port | int | `9000` |  |
| node.tessera.q2tport | int | `9101` |  |
| node.tessera.resources | object | `{}` |  |
| node.tessera.tmkey | string | `""` |  |
| node.tessera.tmpub | string | `""` |  |
| node.tessera.tpport | int | `9080` |  |
| podDisruptionBudget.enabled | bool | `false` |  |
| podDisruptionBudget.minAvailable | int | `1` |  |
| quorumFlags.isBootnode | bool | `false` |  |
| quorumFlags.privacy | bool | `false` |  |
| quorumFlags.removeKeysOnDelete | bool | `false` |  |
| quorumFlags.usesBootnodes | bool | `false` |  |
| storage.aws.parameters.fsType | string | `"ext4"` |  |
| storage.aws.parameters.type | string | `"gp3"` |  |
| storage.aws.provisioner | string | `"kubernetes.io/aws-ebs"` |  |
| storage.pvcSizeLimit | string | `"20Gi"` |  |
| storage.reclaimPolicy | string | `"Delete"` |  |
| storage.sizeLimit | string | `"20Gi"` |  |
| storage.storageClass | string | `""` |  |
| volumePermissionsFix[0] | string | `"local"` |  |
| volumePermissionsFix[1] | string | `"aws"` |  |

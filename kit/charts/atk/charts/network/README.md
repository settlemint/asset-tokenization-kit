# network

![Version: 1.0.18](https://img.shields.io/badge/Version-1.0.18-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: 1.0.18](https://img.shields.io/badge/AppVersion-1.0.18-informational?style=flat-square)

A Helm chart for a blockchain network on Kubernetes

## Maintainers

| Name | Email | Url |
| ---- | ------ | --- |
| SettleMint | <support@settlemint.com> | <https://settlemint.com> |

## Requirements

| Repository | Name | Version |
|------------|------|---------|
|  | network-bootstrapper | >=0.0.0-0 |
|  | network-nodes | >=0.0.0-0 |

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| global | object | `{"chainId":null,"labels":{"kots.io/app-slug":"settlemint-atk"},"networkNodes":{"faucetArtifactPrefix":"besu-faucet","genesisConfigMapName":"besu-genesis","podPrefix":"","serviceName":"","staticNodesConfigMapName":"besu-static-nodes"},"securityContexts":{"container":{},"pod":{}}}` | Global configuration shared across subcharts. |
| global.chainId | int | `nil` | Chain ID applied when charts omit explicit overrides. |
| global.networkNodes | object | `{"faucetArtifactPrefix":"besu-faucet","genesisConfigMapName":"besu-genesis","podPrefix":"","serviceName":"","staticNodesConfigMapName":"besu-static-nodes"}` | Defaults consumed by Besu network node workloads. |
| global.networkNodes.faucetArtifactPrefix | string | `"besu-faucet"` | Prefix used for faucet ConfigMaps and Secrets. |
| global.networkNodes.genesisConfigMapName | string | `"besu-genesis"` | ConfigMap name storing the generated genesis.json artifact. |
| global.networkNodes.podPrefix | string | `""` | StatefulSet prefix used for validator pod hostnames. |
| global.networkNodes.serviceName | string | `""` | Kubernetes Service name fronting validator pods to align bootstrapper static-nodes output. |
| global.networkNodes.staticNodesConfigMapName | string | `"besu-static-nodes"` | ConfigMap name storing static-nodes.json entries. |
| global.securityContexts | object | `{"container":{},"pod":{}}` | Shared pod- and container-level security contexts applied when subcharts omit explicit overrides. |
| global.securityContexts.container | object | `{}` | Container security context inherited by subcharts when set. |
| global.securityContexts.pod | object | `{}` | Pod security context inherited by subcharts when set. |

# besu-network

![Version: 0.1.0](https://img.shields.io/badge/Version-0.1.0-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: 0.1.0](https://img.shields.io/badge/AppVersion-0.1.0-informational?style=flat-square)

A Helm chart for the besu network components

## Maintainers

| Name | Email | Url |
| ---- | ------ | --- |
| SettleMint | <support@settlemint.com> | <https://settlemint.com> |

## Requirements

| Repository | Name | Version |
|------------|------|---------|
|  | besu-genesis | * |
|  | besu-validator-1(besu-node) | * |
|  | besu-validator-2(besu-node) | * |
|  | besu-validator-3(besu-node) | * |
|  | besu-validator-4(besu-node) | * |
|  | besu-rpc-1(besu-node) | * |
|  | besu-rpc-2(besu-node) | * |

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| besu-rpc-1.enabled | bool | `true` |  |
| besu-rpc-1.fullnameOverride | string | `"besu-node-rpc-1"` |  |
| besu-rpc-1.node.besu.account.password | string | `"password"` |  |
| besu-rpc-2.enabled | bool | `false` |  |
| besu-rpc-2.fullnameOverride | string | `"besu-node-rpc-2"` |  |
| besu-rpc-2.node.besu.account.password | string | `"password"` |  |
| besu-validator-1.enabled | bool | `true` |  |
| besu-validator-1.fullnameOverride | string | `"besu-node-validator-1"` |  |
| besu-validator-2.enabled | bool | `false` |  |
| besu-validator-2.fullnameOverride | string | `"besu-node-validator-2"` |  |
| besu-validator-3.enabled | bool | `false` |  |
| besu-validator-3.fullnameOverride | string | `"besu-node-validator-3"` |  |
| besu-validator-4.enabled | bool | `false` |  |
| besu-validator-4.fullnameOverride | string | `"besu-node-validator-4"` |  |
| global.besuGenesis.generation.enabled | bool | `true` |  |

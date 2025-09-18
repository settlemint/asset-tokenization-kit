# blockscout

![Version: 0.1.0](https://img.shields.io/badge/Version-0.1.0-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: 9.0.2](https://img.shields.io/badge/AppVersion-9.0.2-informational?style=flat-square)

A Helm chart for Blockscout blockchain explorer stack

## Maintainers

| Name | Email | Url |
| ---- | ------ | --- |
| SettleMint | <support@settlemint.com> | <https://settlemint.com> |

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| blockscout.affinity | object | `{}` |  |
| blockscout.annotations | object | `{}` |  |
| blockscout.containerSecurityContext.allowPrivilegeEscalation | bool | `false` |  |
| blockscout.containerSecurityContext.capabilities.drop[0] | string | `"ALL"` |  |
| blockscout.containerSecurityContext.readOnlyRootFilesystem | bool | `false` |  |
| blockscout.containerSecurityContext.runAsGroup | int | `1001` |  |
| blockscout.containerSecurityContext.runAsNonRoot | bool | `true` |  |
| blockscout.containerSecurityContext.runAsUser | int | `1001` |  |
| blockscout.enabled | bool | `true` |  |
| blockscout.env.ADMIN_PANEL_ENABLED | string | `"true"` |  |
| blockscout.env.API_GRAPHQL_MAX_COMPLEXITY | string | `"1000"` |  |
| blockscout.env.API_URL | string | `"https://explorer.k8s.orb.local"` |  |
| blockscout.env.DATABASE_TIMEOUT | string | `"60000"` |  |
| blockscout.env.DATABASE_URL | string | `"postgresql://blockscout:atk@postgresql:5432/blockscout?sslmode=disable"` |  |
| blockscout.env.DISABLE_EXCHANGE_RATES | string | `"true"` |  |
| blockscout.env.ECTO_ADAPTER_TIMEOUT | string | `"60000"` |  |
| blockscout.env.ECTO_USE_SSL | string | `"false"` |  |
| blockscout.env.EMISSION_FORMAT | string | `"DEFAULT"` |  |
| blockscout.env.ETHEREUM_JSONRPC_HTTP_URL | string | `"http://erpc:4000/settlemint/evm/53771311147"` |  |
| blockscout.env.ETHEREUM_JSONRPC_TRACE_URL | string | `"http://erpc:4000/settlemint/evm/53771311147"` |  |
| blockscout.env.ETHEREUM_JSONRPC_VARIANT | string | `"besu"` |  |
| blockscout.env.FETCH_REWARDS_WAY | string | `"trace_block"` |  |
| blockscout.env.IPFS_GATEWAY_URL | string | `"https://ipfs.io/ipfs"` |  |
| blockscout.env.IPFS_PUBLIC_GATEWAY_URL | string | `"https://ipfs.io/ipfs"` |  |
| blockscout.env.MIX_ENV | string | `"prod"` |  |
| blockscout.env.NETWORK | string | `"mainnet"` |  |
| blockscout.env.OTHER_EXPLORERS | string | `"{}"` |  |
| blockscout.env.POOL_SIZE | string | `"10"` |  |
| blockscout.env.POOL_SIZE_API | string | `"10"` |  |
| blockscout.env.SECRET_KEY_BASE | string | `"atk"` |  |
| blockscout.env.SHOW_TXS_CHART | string | `"true"` |  |
| blockscout.env.SUBNETWORK | string | `"ATK"` |  |
| blockscout.env.SUPPORTED_CHAINS | string | `"{}"` |  |
| blockscout.env.TXS_STATS_ENABLED | string | `"true"` |  |
| blockscout.env.TZDATA_DIR | string | `"/tmp/tzdata"` |  |
| blockscout.env.WEBAPP_URL | string | `"https://explorer.k8s.orb.local"` |  |
| blockscout.image.pullPolicy | string | `"IfNotPresent"` |  |
| blockscout.image.repository | string | `"ghcr.io/blockscout/blockscout"` |  |
| blockscout.image.tag | string | `"9.0.2"` |  |
| blockscout.ingress.annotations | object | `{}` |  |
| blockscout.ingress.className | string | `"atk-nginx"` |  |
| blockscout.ingress.enabled | bool | `true` |  |
| blockscout.ingress.hostname | string | `"explorer.k8s.orb.local"` |  |
| blockscout.ingress.tls | list | `[]` |  |
| blockscout.init.args[0] | string | `"-c"` |  |
| blockscout.init.args[1] | string | `"echo \"Running database migrations...\"\nbin/blockscout eval \"Elixir.Explorer.ReleaseTasks.create_and_migrate()\"\n"` |  |
| blockscout.init.command[0] | string | `"/bin/sh"` |  |
| blockscout.init.enabled | bool | `true` |  |
| blockscout.initContainerSecurityContext.allowPrivilegeEscalation | bool | `false` |  |
| blockscout.initContainerSecurityContext.capabilities.drop[0] | string | `"ALL"` |  |
| blockscout.initContainerSecurityContext.readOnlyRootFilesystem | bool | `false` |  |
| blockscout.initContainerSecurityContext.runAsGroup | int | `1001` |  |
| blockscout.initContainerSecurityContext.runAsNonRoot | bool | `true` |  |
| blockscout.initContainerSecurityContext.runAsUser | int | `1001` |  |
| blockscout.livenessProbe.enabled | bool | `true` |  |
| blockscout.livenessProbe.failureThreshold | int | `5` |  |
| blockscout.livenessProbe.initialDelaySeconds | int | `100` |  |
| blockscout.livenessProbe.periodSeconds | int | `100` |  |
| blockscout.livenessProbe.successThreshold | int | `1` |  |
| blockscout.livenessProbe.timeoutSeconds | int | `30` |  |
| blockscout.nodeSelector | object | `{}` |  |
| blockscout.podAnnotations."prometheus.io/path" | string | `"/metrics"` |  |
| blockscout.podAnnotations."prometheus.io/port" | string | `"4000"` |  |
| blockscout.podAnnotations."prometheus.io/scrape" | string | `"true"` |  |
| blockscout.podSecurityContext.fsGroup | int | `1001` |  |
| blockscout.podSecurityContext.runAsGroup | int | `1001` |  |
| blockscout.podSecurityContext.runAsNonRoot | bool | `true` |  |
| blockscout.podSecurityContext.runAsUser | int | `1001` |  |
| blockscout.readinessProbe.enabled | bool | `true` |  |
| blockscout.readinessProbe.failureThreshold | int | `5` |  |
| blockscout.readinessProbe.initialDelaySeconds | int | `30` |  |
| blockscout.readinessProbe.periodSeconds | int | `10` |  |
| blockscout.readinessProbe.successThreshold | int | `1` |  |
| blockscout.readinessProbe.timeoutSeconds | int | `30` |  |
| blockscout.replicaCount | int | `1` |  |
| blockscout.resources | object | `{}` |  |
| blockscout.separateApi.enabled | bool | `false` |  |
| blockscout.separateApi.replicaCount | int | `1` |  |
| blockscout.service.port | int | `80` |  |
| blockscout.service.type | string | `"ClusterIP"` |  |
| blockscout.tolerations | list | `[]` |  |
| config.account.enabled | bool | `false` |  |
| config.network.currency.decimals | int | `18` |  |
| config.network.currency.dualToken | bool | `false` |  |
| config.network.currency.name | string | `"Native Token"` |  |
| config.network.currency.symbol | string | `"NT"` |  |
| config.network.icon | string | `""` |  |
| config.network.icon_dark | string | `""` |  |
| config.network.id | int | `53771311147` |  |
| config.network.logo | string | `""` |  |
| config.network.logo_dark | string | `""` |  |
| config.network.name | string | `"Asset Tokenization Kit"` |  |
| config.network.shortname | string | `"ATK"` |  |
| config.prometheus.blackbox.enabled | bool | `false` |  |
| config.prometheus.enabled | bool | `false` |  |
| config.testnet | bool | `false` |  |
| frontend.affinity | object | `{}` |  |
| frontend.containerSecurityContext.allowPrivilegeEscalation | bool | `false` |  |
| frontend.containerSecurityContext.capabilities.drop[0] | string | `"ALL"` |  |
| frontend.containerSecurityContext.readOnlyRootFilesystem | bool | `false` |  |
| frontend.containerSecurityContext.runAsGroup | int | `1001` |  |
| frontend.containerSecurityContext.runAsNonRoot | bool | `true` |  |
| frontend.containerSecurityContext.runAsUser | int | `1001` |  |
| frontend.enabled | bool | `true` |  |
| frontend.env.NEXT_PUBLIC_AD_BANNER_PROVIDER | string | `"none"` |  |
| frontend.env.NEXT_PUBLIC_AD_TEXT_PROVIDER | string | `"none"` |  |
| frontend.env.NEXT_PUBLIC_API_PROTOCOL | string | `"https"` |  |
| frontend.env.NEXT_PUBLIC_APP_PROTOCOL | string | `"https"` |  |
| frontend.env.NEXT_PUBLIC_FONT_FAMILY_BODY | string | `"{'name':'Figtree','url':'https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,300..900;1,300..900&display=swap'}"` |  |
| frontend.env.NEXT_PUBLIC_FONT_FAMILY_HEADING | string | `"{'name':'Figtree','url':'https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,300..900;1,300..900&display=swap'}"` |  |
| frontend.env.NEXT_PUBLIC_HAS_BEACON_CHAIN | string | `"false"` |  |
| frontend.env.NEXT_PUBLIC_HAS_CONTRACT_AUDIT_REPORTS | string | `"true"` |  |
| frontend.env.NEXT_PUBLIC_HOMEPAGE_CHARTS | string | `"[\"daily_txs\"]"` |  |
| frontend.env.NEXT_PUBLIC_HOMEPAGE_STATS | string | `"[\"total_blocks\",\"average_block_time\",\"total_txs\",\"wallet_addresses\",\"gas_tracker\"]"` |  |
| frontend.env.NEXT_PUBLIC_IS_ACCOUNT_SUPPORTED | string | `"false"` |  |
| frontend.env.NEXT_PUBLIC_IS_TESTNET | string | `"false"` |  |
| frontend.env.NEXT_PUBLIC_OG_ENHANCED_DATA_ENABLED | string | `"true"` |  |
| frontend.env.NEXT_PUBLIC_PROMOTE_BLOCKSCOUT_IN_TITLE | string | `"false"` |  |
| frontend.env.NEXT_PUBLIC_SEO_ENHANCED_DATA_ENABLED | string | `"true"` |  |
| frontend.env.NEXT_PUBLIC_TRANSACTION_INTERPRETATION_PROVIDER | string | `"blockscout"` |  |
| frontend.image.pullPolicy | string | `"IfNotPresent"` |  |
| frontend.image.repository | string | `"ghcr.io/blockscout/frontend"` |  |
| frontend.image.tag | string | `"v2.3.3"` |  |
| frontend.ingress.annotations | object | `{}` |  |
| frontend.ingress.className | string | `"atk-nginx"` |  |
| frontend.ingress.enabled | bool | `true` |  |
| frontend.ingress.hostname | string | `"explorer.k8s.orb.local"` |  |
| frontend.ingress.tls | list | `[]` |  |
| frontend.livenessProbe.enabled | bool | `true` |  |
| frontend.livenessProbe.failureThreshold | int | `5` |  |
| frontend.livenessProbe.initialDelaySeconds | int | `30` |  |
| frontend.livenessProbe.periodSeconds | int | `10` |  |
| frontend.livenessProbe.successThreshold | int | `1` |  |
| frontend.livenessProbe.timeoutSeconds | int | `5` |  |
| frontend.nodeSelector | object | `{}` |  |
| frontend.podAnnotations | object | `{}` |  |
| frontend.podSecurityContext.fsGroup | int | `1001` |  |
| frontend.podSecurityContext.runAsGroup | int | `1001` |  |
| frontend.podSecurityContext.runAsNonRoot | bool | `true` |  |
| frontend.podSecurityContext.runAsUser | int | `1001` |  |
| frontend.readinessProbe.enabled | bool | `true` |  |
| frontend.readinessProbe.failureThreshold | int | `5` |  |
| frontend.readinessProbe.initialDelaySeconds | int | `30` |  |
| frontend.readinessProbe.periodSeconds | int | `5` |  |
| frontend.readinessProbe.successThreshold | int | `1` |  |
| frontend.readinessProbe.timeoutSeconds | int | `3` |  |
| frontend.replicaCount | int | `1` |  |
| frontend.resources | object | `{}` |  |
| frontend.service.port | int | `80` |  |
| frontend.service.type | string | `"ClusterIP"` |  |
| frontend.tolerations | list | `[]` |  |
| fullnameOverride | string | `"blockscout"` |  |
| imagePullSecrets | list | `[]` |  |
| redirect.enabled | bool | `false` |  |
| serviceAccount.annotations | object | `{}` |  |
| serviceAccount.create | bool | `true` |  |
| serviceAccount.name | string | `""` |  |
| stats.enabled | bool | `false` |  |
| stats.ingress.hostname | string | `""` |  |

# blockscout

![Version: 0.1.0](https://img.shields.io/badge/Version-0.1.0-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: 0.1.0](https://img.shields.io/badge/AppVersion-0.1.0-informational?style=flat-square)

A Helm chart for the blockscout components

## Maintainers

| Name | Email | Url |
| ---- | ------ | --- |
| SettleMint | <support@settlemint.com> | <https://settlemint.com> |

## Requirements

| Repository | Name | Version |
|------------|------|---------|
| https://blockscout.github.io/helm-charts | blockscout-stack | 3.3.0 |

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| blockscout-stack.blockscout.env.ADMIN_PANEL_ENABLED | string | `"true"` |  |
| blockscout-stack.blockscout.env.API_GRAPHQL_MAX_COMPLEXITY | string | `"1000"` |  |
| blockscout-stack.blockscout.env.API_URL | string | `"https://explorer.k8s.orb.local"` |  |
| blockscout-stack.blockscout.env.DATABASE_TIMEOUT | string | `"60000"` |  |
| blockscout-stack.blockscout.env.DISABLE_EXCHANGE_RATES | string | `"true"` |  |
| blockscout-stack.blockscout.env.ECTO_ADAPTER_TIMEOUT | string | `"60000"` |  |
| blockscout-stack.blockscout.env.ECTO_USE_SSL | string | `"false"` |  |
| blockscout-stack.blockscout.env.EMISSION_FORMAT | string | `"DEFAULT"` |  |
| blockscout-stack.blockscout.env.ETHEREUM_JSONRPC_VARIANT | string | `"besu"` |  |
| blockscout-stack.blockscout.env.FETCH_REWARDS_WAY | string | `"trace_block"` |  |
| blockscout-stack.blockscout.env.IPFS_GATEWAY_URL | string | `"https://ipfs.io/ipfs"` |  |
| blockscout-stack.blockscout.env.IPFS_PUBLIC_GATEWAY_URL | string | `"https://ipfs.io/ipfs"` |  |
| blockscout-stack.blockscout.env.MIX_ENV | string | `"prod"` |  |
| blockscout-stack.blockscout.env.NETWORK | string | `"mainnet"` |  |
| blockscout-stack.blockscout.env.OTHER_EXPLORERS | string | `"{}"` |  |
| blockscout-stack.blockscout.env.POOL_SIZE | string | `"10"` |  |
| blockscout-stack.blockscout.env.POOL_SIZE_API | string | `"10"` |  |
| blockscout-stack.blockscout.env.SHOW_TXS_CHART | string | `"true"` |  |
| blockscout-stack.blockscout.env.SUBNETWORK | string | `"ATK"` |  |
| blockscout-stack.blockscout.env.SUPPORTED_CHAINS | string | `"{}"` |  |
| blockscout-stack.blockscout.env.TXS_STATS_ENABLED | string | `"true"` |  |
| blockscout-stack.blockscout.env.WEBAPP_URL | string | `"https://explorer.k8s.orb.local"` |  |
| blockscout-stack.blockscout.envFromSecret.DATABASE_URL | string | `"postgresql://blockscout:atk@postgresql:5432/blockscout?sslmode=disable"` |  |
| blockscout-stack.blockscout.envFromSecret.ETHEREUM_JSONRPC_HTTP_URL | string | `"http://erpc:4000/settlemint/evm/1337"` |  |
| blockscout-stack.blockscout.envFromSecret.ETHEREUM_JSONRPC_TRACE_URL | string | `"http://erpc:4000/settlemint/evm/1337"` |  |
| blockscout-stack.blockscout.envFromSecret.SECRET_KEY_BASE | string | `"atk"` |  |
| blockscout-stack.blockscout.image.repository | string | `"ghcr.io/blockscout/blockscout"` |  |
| blockscout-stack.blockscout.image.tag | string | `"9.0.2"` |  |
| blockscout-stack.blockscout.ingress.className | string | `"atk-nginx"` |  |
| blockscout-stack.blockscout.ingress.enabled | bool | `true` |  |
| blockscout-stack.blockscout.ingress.hostname | string | `"explorer.k8s.orb.local"` |  |
| blockscout-stack.blockscout.podAnnotations."prometheus.io/path" | string | `"/metrics"` |  |
| blockscout-stack.blockscout.podAnnotations."prometheus.io/port" | string | `"4000"` |  |
| blockscout-stack.blockscout.podAnnotations."prometheus.io/scrape" | string | `"true"` |  |
| blockscout-stack.blockscout.replicaCount | int | `1` |  |
| blockscout-stack.blockscout.resources | object | `{}` |  |
| blockscout-stack.config.network.currency.decimals | int | `18` |  |
| blockscout-stack.config.network.currency.name | string | `"Native Token"` |  |
| blockscout-stack.config.network.currency.symbol | string | `"NT"` |  |
| blockscout-stack.config.network.id | int | `1337` |  |
| blockscout-stack.config.network.name | string | `"Asset Tokenization Kit"` |  |
| blockscout-stack.config.network.shortname | string | `"ATK"` |  |
| blockscout-stack.config.prometheus.blackbox.enabled | bool | `false` |  |
| blockscout-stack.config.prometheus.enabled | bool | `false` |  |
| blockscout-stack.frontend.env.NEXT_PUBLIC_AD_BANNER_PROVIDER | string | `"none"` |  |
| blockscout-stack.frontend.env.NEXT_PUBLIC_AD_TEXT_PROVIDER | string | `"none"` |  |
| blockscout-stack.frontend.env.NEXT_PUBLIC_FONT_FAMILY_BODY | string | `"{'name':'Figtree','url':'https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,300..900;1,300..900&display=swap'}"` |  |
| blockscout-stack.frontend.env.NEXT_PUBLIC_FONT_FAMILY_HEADING | string | `"{'name':'Figtree','url':'https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,300..900;1,300..900&display=swap'}"` |  |
| blockscout-stack.frontend.env.NEXT_PUBLIC_HAS_BEACON_CHAIN | string | `"false"` |  |
| blockscout-stack.frontend.env.NEXT_PUBLIC_HAS_CONTRACT_AUDIT_REPORTS | string | `"true"` |  |
| blockscout-stack.frontend.env.NEXT_PUBLIC_HOMEPAGE_CHARTS | string | `"[\"daily_txs\"]"` |  |
| blockscout-stack.frontend.env.NEXT_PUBLIC_HOMEPAGE_STATS | string | `"[\"total_blocks\",\"average_block_time\",\"total_txs\",\"wallet_addresses\",\"gas_tracker\"]"` |  |
| blockscout-stack.frontend.env.NEXT_PUBLIC_IS_ACCOUNT_SUPPORTED | string | `"false"` |  |
| blockscout-stack.frontend.env.NEXT_PUBLIC_IS_TESTNET | string | `"false"` |  |
| blockscout-stack.frontend.env.NEXT_PUBLIC_OG_ENHANCED_DATA_ENABLED | string | `"true"` |  |
| blockscout-stack.frontend.env.NEXT_PUBLIC_PROMOTE_BLOCKSCOUT_IN_TITLE | string | `"false"` |  |
| blockscout-stack.frontend.env.NEXT_PUBLIC_SEO_ENHANCED_DATA_ENABLED | string | `"true"` |  |
| blockscout-stack.frontend.env.NEXT_PUBLIC_TRANSACTION_INTERPRETATION_PROVIDER | string | `"blockscout"` |  |
| blockscout-stack.frontend.image.repository | string | `"ghcr.io/blockscout/frontend"` |  |
| blockscout-stack.frontend.image.tag | string | `"v2.3.0"` |  |
| blockscout-stack.frontend.ingress.className | string | `"atk-nginx"` |  |
| blockscout-stack.frontend.ingress.enabled | bool | `true` |  |
| blockscout-stack.frontend.ingress.hostname | string | `"explorer.k8s.orb.local"` |  |
| blockscout-stack.frontend.replicaCount | int | `1` |  |
| blockscout-stack.fullnameOverride | string | `"blockscout"` |  |
| blockscout-stack.imagePullSecrets | list | `[]` |  |

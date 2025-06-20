# thegraph

![Version: 0.1.0](https://img.shields.io/badge/Version-0.1.0-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: 0.1.0](https://img.shields.io/badge/AppVersion-0.1.0-informational?style=flat-square)

A Helm chart for the blockscout components

## Maintainers

| Name | Email | Url |
| ---- | ------ | --- |
| SettleMint | <support@settlemint.com> | <https://settlemint.com> |

## Requirements

| Repository | Name | Version |
|------------|------|---------|
| http://graphops.github.io/launchpad-charts | graph-node | 0.5.9 |

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| global.labels | object | `{}` |  |
| graph-node.chains | object | `{"settlemint":{"enabled":true,"provider":[{"details":{"features":["archive","traces"],"type":"web3","url":"http://erpc:4000"},"label":"erpc"}],"shard":"primary"}}` | Blockchain configuration for Graph Node |
| graph-node.chains.settlemint | object | `{"enabled":true,"provider":[{"details":{"features":["archive","traces"],"type":"web3","url":"http://erpc:4000"},"label":"erpc"}],"shard":"primary"}` | Ethereum Mainnet |
| graph-node.chains.settlemint.enabled | bool | `true` | Enable this configuring graph-node with this chain |
| graph-node.chains.settlemint.provider[0].details.features | list | `["archive","traces"]` | Data capabilities this node has |
| graph-node.chains.settlemint.provider[0].details.type | string | `"web3"` | Type of Provider: web3 |
| graph-node.chains.settlemint.provider[0].details.url | string | `"http://erpc:4000"` | URL for JSON-RPC endpoint |
| graph-node.chains.settlemint.provider[0].label | string | `"erpc"` | Label for a JSON-RPC endpoint |
| graph-node.chains.settlemint.shard | string | `"primary"` | The database shard to use for this chain |
| graph-node.customSecret.PGPASSWORD | string | `"atk"` |  |
| graph-node.customSecret.PGUSER | string | `"thegraph"` |  |
| graph-node.fullnameOverride | string | `"graph-node"` |  |
| graph-node.graphNodeDefaults.affinityPresets.antiAffinityByHostname | bool | `false` | Create anti-affinity rule to deter scheduling replicas on the same host |
| graph-node.graphNodeDefaults.env | object | `{"ETHEREUM_POLLING_INTERVAL":"1000","EXPERIMENTAL_SUBGRAPH_VERSION_SWITCHING_MODE":"synced","GRAPH_ALLOW_NON_DETERMINISTIC_FULLTEXT_SEARCH":"true","GRAPH_ALLOW_NON_DETERMINISTIC_IPFS":"true","GRAPH_CHAIN_HEAD_WATCHER_TIMEOUT":"5","GRAPH_DISABLE_GRAFTS":"false","GRAPH_ENABLE_PROMETHEUS_METRICS":"true","GRAPH_ETHEREUM_BLOCK_BATCH_SIZE":"100","GRAPH_ETHEREUM_BLOCK_INGESTOR_MAX_CONCURRENT_JSON_RPC_CALLS":"100","GRAPH_ETHEREUM_CLEANUP_BLOCKS":"true","GRAPH_ETHEREUM_MAX_BLOCK_RANGE_SIZE":"1000","GRAPH_ETHEREUM_REQUEST_RETRIES":"10","GRAPH_ETHEREUM_TARGET_TRIGGERS_PER_BLOCK_RANGE":"100","GRAPH_ETH_CALL_GAS":"50000000","GRAPH_GETH_ETH_CALL_ERRORS":"out of gas","GRAPH_IPFS_TIMEOUT":"30","GRAPH_KILL_IF_UNRESPONSIVE":"true","GRAPH_LOAD_BIN_SIZE":"10","GRAPH_LOAD_WINDOW_SIZE":"3600","GRAPH_LOG":"info","GRAPH_LOG_QUERY_TIMING":"gql","GRAPH_MAX_GAS_PER_HANDLER":"1_000_000_000_000_000","GRAPH_MAX_SPEC_VERSION":"1.2.0","GRAPH_PARALLEL_BLOCK_CONSTRAINTS":"true","GRAPH_POSTPONE_ATTRIBUTE_INDEX_CREATION":"true","GRAPH_PROMETHEUS_HOST":"0.0.0.0","GRAPH_QUERY_CACHE_BLOCKS":"6","GRAPH_QUERY_CACHE_MAX_MEM":"3000","GRAPH_QUERY_CACHE_STALE_PERIOD":"1000","GRAPH_STATIC_FILTERS_THRESHOLD":"10000","GRAPH_STORE_WRITE_BATCH_DURATION":"0","GRAPH_STORE_WRITE_BATCH_SIZE":"0","IPFS":"https://ipfs.console.settlemint.com","PRIMARY_SUBGRAPH_DATA_PGDATABASE":"thegraph","PRIMARY_SUBGRAPH_DATA_PGHOST":"postgresql-pgpool","PRIMARY_SUBGRAPH_DATA_PGPORT":5432,"SUBGRAPH":"kit:QmbA53S3UUeoxdNQV9PGUDN7WAgFcHT6qU9FiH8QXXGv3z"}` | Environment variable defaults for all Graph Node groups |
| graph-node.graphNodeDefaults.env.IPFS | string | `"https://ipfs.console.settlemint.com"` | The URL for your IPFS node |
| graph-node.graphNodeDefaults.env.PRIMARY_SUBGRAPH_DATA_PGDATABASE | string | `"thegraph"` | Name of the primary shard database to use |
| graph-node.graphNodeDefaults.env.PRIMARY_SUBGRAPH_DATA_PGHOST | string | `"postgresql-pgpool"` | Hostname of the primary shard PostgreSQL server |
| graph-node.graphNodeDefaults.env.PRIMARY_SUBGRAPH_DATA_PGPORT | int | `5432` | Port for the primary shard PostgreSQL server |
| graph-node.graphNodeDefaults.extraInitContainers[0].command[0] | string | `"/usr/bin/wait-for-it"` |  |
| graph-node.graphNodeDefaults.extraInitContainers[0].command[1] | string | `"postgresql-pgpool:5432"` |  |
| graph-node.graphNodeDefaults.extraInitContainers[0].command[2] | string | `"-t"` |  |
| graph-node.graphNodeDefaults.extraInitContainers[0].command[3] | string | `"0"` |  |
| graph-node.graphNodeDefaults.extraInitContainers[0].image | string | `"harbor.settlemint.com/ghcr.io/settlemint/btp-waitforit:v7.7.5"` |  |
| graph-node.graphNodeDefaults.extraInitContainers[0].name | string | `"wait-for-postgresql"` |  |
| graph-node.graphNodeDefaults.imagePullSecrets | list | `[]` |  |
| graph-node.graphNodeDefaults.secretEnv.PRIMARY_SUBGRAPH_DATA_PGPASSWORD.key | string | `"PGPASSWORD"` | Name of the data key in the secret that contains your PG password |
| graph-node.graphNodeDefaults.secretEnv.PRIMARY_SUBGRAPH_DATA_PGPASSWORD.secretName | string | `"thegraph-pg-secret"` | Name of the secret that contains your PG password |
| graph-node.graphNodeDefaults.secretEnv.PRIMARY_SUBGRAPH_DATA_PGUSER.key | string | `"PGUSER"` | Name of the data key in the secret that contains your PG username |
| graph-node.graphNodeDefaults.secretEnv.PRIMARY_SUBGRAPH_DATA_PGUSER.secretName | string | `"thegraph-pg-secret"` | Name of the secret that contains your PG username |
| graph-node.graphNodeGroups.query.enabled | bool | `true` |  |
| graph-node.graphNodeGroups.query.env.node_role | string | `"query-node"` |  |
| graph-node.graphNodeGroups.query.replicaCount | int | `1` |  |
| graph-node.image.pullPolicy | string | `"IfNotPresent"` |  |
| graph-node.image.repository | string | `"graphprotocol/graph-node"` | Image for Graph Node |
| graph-node.image.tag | string | `"v0.39.1"` |  |
| graph-node.ingress.annotations."nginx.ingress.kubernetes.io/rewrite-target" | string | `"/$1"` |  |
| graph-node.ingress.annotations."nginx.ingress.kubernetes.io/use-regex" | string | `"true"` |  |
| graph-node.ingress.className | string | `"settlemint-nginx"` |  |
| graph-node.ingress.enabled | bool | `true` |  |
| graph-node.ingress.hosts[0].host | string | `"graph.k8s.orb.local"` |  |
| graph-node.ingress.hosts[0].paths[0].path | string | `"/(.*)"` |  |
| graph-node.ingress.hosts[0].paths[0].pathType | string | `"ImplementationSpecific"` |  |
| graph-node.ingress.hosts[0].paths[0].port | int | `8000` |  |
| graph-node.ingress.hosts[0].paths[0].serviceName | string | `"graph-node-query"` |  |
| graph-node.ingress.hosts[0].paths[1].path | string | `"/ws/?(.*)"` |  |
| graph-node.ingress.hosts[0].paths[1].pathType | string | `"ImplementationSpecific"` |  |
| graph-node.ingress.hosts[0].paths[1].port | int | `8001` |  |
| graph-node.ingress.hosts[0].paths[1].serviceName | string | `"graph-node-query"` |  |
| graph-node.ingress.hosts[0].paths[2].path | string | `"/admin/?(.*)"` |  |
| graph-node.ingress.hosts[0].paths[2].pathType | string | `"ImplementationSpecific"` |  |
| graph-node.ingress.hosts[0].paths[2].port | int | `8020` |  |
| graph-node.ingress.hosts[0].paths[2].serviceName | string | `"graph-node-query"` |  |
| graph-node.ingress.hosts[0].paths[3].path | string | `"/indexer/?(.*)"` |  |
| graph-node.ingress.hosts[0].paths[3].pathType | string | `"ImplementationSpecific"` |  |
| graph-node.ingress.hosts[0].paths[3].port | int | `8030` |  |
| graph-node.ingress.hosts[0].paths[3].serviceName | string | `"graph-node-index"` |  |
| graph-node.ingress.hosts[0].paths[4].path | string | `"/graphman/?(.*)"` |  |
| graph-node.ingress.hosts[0].paths[4].pathType | string | `"ImplementationSpecific"` |  |
| graph-node.ingress.hosts[0].paths[4].port | int | `8050` |  |
| graph-node.ingress.hosts[0].paths[4].serviceName | string | `"graph-node-index"` |  |
| graph-node.ingress.tls | list | `[]` |  |
| job.enabled | bool | `true` |  |
| job.fullnameOverride | string | `"graph"` |  |
| job.image.pullPolicy | string | `"IfNotPresent"` |  |
| job.image.repository | string | `"harbor.settlemint.com/docker.io/node"` |  |
| job.image.tag | string | `"23.11.1-slim"` |  |
| job.imagePullSecrets[0] | string | `"image-pull-secret-docker"` |  |
| job.imagePullSecrets[1] | string | `"image-pull-secret-ghcr"` |  |
| job.imagePullSecrets[2] | string | `"image-pull-secret-harbor"` |  |
| job.initContainer.graphNodeCheck.image.pullPolicy | string | `"IfNotPresent"` |  |
| job.initContainer.graphNodeCheck.image.registry | string | `"harbor.settlemint.com/docker.io"` |  |
| job.initContainer.graphNodeCheck.image.repository | string | `"busybox"` |  |
| job.initContainer.graphNodeCheck.image.tag | string | `"1.37.0"` |  |
| job.podAnnotations | object | `{}` |  |
| job.podSecurityContext | object | `{}` |  |
| job.resources | object | `{}` |  |
| job.securityContext | object | `{}` |  |
| job.workspace.size | string | `"1Gi"` |  |
| job.workspace.storageClass | string | `""` |  |

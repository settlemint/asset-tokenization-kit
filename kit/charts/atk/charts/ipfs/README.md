# ipfs

![Version: 2.0.0-alpha.17](https://img.shields.io/badge/Version-2.0.0--alpha.17-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: 2.0.0-alpha.17](https://img.shields.io/badge/AppVersion-2.0.0--alpha.17-informational?style=flat-square)

A Helm chart for deploying IPFS Cluster and IPFS peer nodes for ATK

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| cluster | object | `{"affinity":{},"containerSecurityContext":{},"extraContainers":[],"extraEnv":[],"extraInitContainers":[],"extraVolumeMounts":[],"extraVolumes":[],"image":{"pullPolicy":"IfNotPresent","registry":"docker.io","repository":"ipfs/ipfs-cluster","tag":"v1.1.4"},"nodeSelector":{},"podAnnotations":{},"podLabels":{"app.kubernetes.io/component":"cluster"},"podSecurityContext":{},"resources":{},"service":{"annotations":{},"ports":{"api":9094,"metrics":8888,"p2p":9096,"pinning":9097,"proxy":9095},"type":"ClusterIP"},"storage":{"storageClassName":"","volumeSize":"1Gi"},"tolerations":[]}` | IPFS Cluster peer configuration |
| cluster.affinity | object | `{}` | Affinity |
| cluster.containerSecurityContext | object | `{}` | Container-level security context overrides |
| cluster.extraContainers | list | `[]` | Additional containers to inject into the pod |
| cluster.extraEnv | list | `[]` | Extra environment variables for the cluster container |
| cluster.extraInitContainers | list | `[]` | Additional init containers |
| cluster.extraVolumeMounts | list | `[]` | Additional volume mounts for the cluster container |
| cluster.extraVolumes | object | `[]` | Additional volumes for the pod |
| cluster.image.pullPolicy | string | `"IfNotPresent"` | Cluster image pull policy |
| cluster.image.registry | string | `"docker.io"` | Cluster image registry |
| cluster.image.repository | string | `"ipfs/ipfs-cluster"` | Cluster image repository |
| cluster.image.tag | string | `"v1.1.4"` | Cluster image tag |
| cluster.nodeSelector | object | `{}` | Node selector |
| cluster.podAnnotations | object | `{}` | Additional pod annotations |
| cluster.podLabels | object | `{"app.kubernetes.io/component":"cluster"}` | Additional pod labels |
| cluster.podSecurityContext | object | `{}` | Pod-level security context overrides |
| cluster.resources | object | `{}` | Resource requests and limits |
| cluster.service.annotations | object | `{}` | Additional annotations for the cluster service |
| cluster.service.ports | object | `{"api":9094,"metrics":8888,"p2p":9096,"pinning":9097,"proxy":9095}` | Cluster service port configuration |
| cluster.service.ports.api | int | `9094` | REST API port |
| cluster.service.ports.metrics | int | `8888` | Prometheus metrics port |
| cluster.service.ports.p2p | int | `9096` | Libp2p cluster port |
| cluster.service.ports.pinning | int | `9097` | Pinning service HTTP port |
| cluster.service.ports.proxy | int | `9095` | IPFS proxy port |
| cluster.service.type | string | `"ClusterIP"` | Service type for the cluster REST API |
| cluster.storage.storageClassName | string | `""` | StorageClass for the cluster data PVC |
| cluster.storage.volumeSize | string | `"1Gi"` | Requested storage size for the cluster data PVC |
| cluster.tolerations | list | `[]` | Tolerations |
| commonAnnotations | object | `{}` | Annotations to add to all rendered manifests |
| commonLabels | object | `{}` | Labels to add to all rendered manifests |
| fullnameOverride | string | `"ipfs"` | Override for generated full name |
| global | object | `{"imagePullSecrets":[],"imageRegistry":"","imageTag":"","labels":{},"storageClass":""}` | Global Docker image registry and shared labels |
| global.imagePullSecrets | list | `[]` | Global Docker registry secret names as an array |
| global.imageRegistry | string | `""` | Global Docker image registry |
| global.imageTag | string | `""` | Global image tag override |
| global.labels | object | `{}` | Global labels applied to all resources |
| global.storageClass | object | `""` | Global StorageClass overrides |
| imagePullSecrets | list | `[]` | Image pull secrets applied to workload pods |
| ingress | object | `{"className":"atk-nginx","enabled":true,"hostnames":{"api":"ipfs-cluster.k8s.orb.local"},"pathGroups":{"api":[{"path":"/?(api/((.*[^/])?)?)","pathType":"ImplementationSpecific","service":{"port":"proxy","target":"cluster"}},{"path":"/?cluster/(((.*[^/])?)?)","pathType":"ImplementationSpecific","service":{"port":"api","target":"cluster"}},{"path":"/?pinning/(((.*[^/])?)?)","pathType":"ImplementationSpecific","service":{"port":"pinning","target":"cluster"}},{"path":"/?ws/(((.*[^/])?)?)","pathType":"ImplementationSpecific","service":{"port":"ws","target":"ipfs"}}]},"tls":[]}` | Ingress configuration for the cluster REST API |
| ingress.className | string | `"atk-nginx"` | Ingress class name |
| ingress.enabled | bool | `true` | Enable HTTP ingress for the cluster REST API |
| ingress.hostnames | object | `{"api":"ipfs-cluster.k8s.orb.local"}` | Hostnames mapped to path groups |
| ingress.pathGroups | object | `{"api":[{"path":"/?(api/((.*[^/])?)?)","pathType":"ImplementationSpecific","service":{"port":"proxy","target":"cluster"}},{"path":"/?cluster/(((.*[^/])?)?)","pathType":"ImplementationSpecific","service":{"port":"api","target":"cluster"}},{"path":"/?pinning/(((.*[^/])?)?)","pathType":"ImplementationSpecific","service":{"port":"pinning","target":"cluster"}},{"path":"/?ws/(((.*[^/])?)?)","pathType":"ImplementationSpecific","service":{"port":"ws","target":"ipfs"}}]}` | Path groups rendered for each hostname key |
| ingress.tls | list | `[]` | TLS configuration for the ingress |
| ipfs | object | `{"affinity":{},"bootstrap":{"includeProviderPeers":true,"nodePeers":[],"providerPeers":[{"Addrs":["/dnsaddr/node-1.ingress.cloudflare-ipfs.com"],"ID":"QmcFf2FH3CEgTNHeMRGhN7HNHU1EXAxoEk6EFuSyXCsvRE"},{"Addrs":["/dnsaddr/node-2.ingress.cloudflare-ipfs.com"],"ID":"QmcFmLd5ySfk2WZuJ1mfSWLDjdmHZq7rSAua4GoeSQfs1z"},{"Addrs":["/dnsaddr/node-3.ingress.cloudflare-ipfs.com"],"ID":"QmcfFmzSDVbwexQ9Au2pt5YEXHK5xajwgaU6PpkbLWerMa"},{"Addrs":["/dnsaddr/node-4.ingress.cloudflare-ipfs.com"],"ID":"QmcfJeB3Js1FG7T8YaZATEiaHqNKVdQfybYYkbT1knUswx"},{"Addrs":["/dnsaddr/node-5.ingress.cloudflare-ipfs.com"],"ID":"QmcfVvzK4tMdFmpJjEKDUoqRgP4W9FnmJoziYX5GXJJ8eZ"},{"Addrs":["/dnsaddr/node-6.ingress.cloudflare-ipfs.com"],"ID":"QmcfZD3VKrUxyP9BbyUnZDpbqDnT7cQ4WjPP8TRLXaoE7G"},{"Addrs":["/dnsaddr/node-7.ingress.cloudflare-ipfs.com"],"ID":"QmcfZP2LuW4jxviTeG8fi28qjnZScACb8PEgHAc17ZEri3"},{"Addrs":["/dnsaddr/node-8.ingress.cloudflare-ipfs.com"],"ID":"QmcfgsJsMtx6qJb74akCw1M24X1zFwgGo11h1cuhwQjtJP"},{"Addrs":["/dnsaddr/node-9.ingress.cloudflare-ipfs.com"],"ID":"Qmcfr2FC7pFzJbTSDfYaSy1J8Uuy8ccGLeLyqJCKJvTHMi"},{"Addrs":["/dnsaddr/node-10.ingress.cloudflare-ipfs.com"],"ID":"QmcfR3V5YAtHBzxVACWCzXTt26SyEkxdwhGJ6875A8BuWx"},{"Addrs":["/dnsaddr/node-11.ingress.cloudflare-ipfs.com"],"ID":"Qmcfuo1TM9uUiJp6dTbm915Rf1aTqm3a3dnmCdDQLHgvL5"},{"Addrs":["/dnsaddr/node-12.ingress.cloudflare-ipfs.com"],"ID":"QmcfV2sg9zaq7UUHVCGuSvT2M2rnLBAPsiE79vVyK3Cuev"},{"Addrs":["/dns4/ipfs.ssi.eecc.de"],"ID":"12D3KooWGaHbxpDWn4JVYud899Wcpa4iHPa3AMYydfxQDb3MhDME"},{"Addrs":["/ip4/139.178.68.217/tcp/6744"],"ID":"12D3KooWCVXs8P7iq6ao4XhfAmKWrEeuKFWCJgqe9jGDMTqHYBjw"},{"Addrs":["/ip4/147.75.49.71/tcp/6745"],"ID":"12D3KooWGBWx9gyUFTVQcKMTenQMSyE2ad9m7c9fpjS4NMjoDien"},{"Addrs":["/ip4/147.75.86.255/tcp/6745"],"ID":"12D3KooWFrnuj5o3tx4fGD2ZVJRyDqTdzGnU3XYXmBbWbc8Hs8Nd"},{"Addrs":["/ip4/3.134.223.177/tcp/6745"],"ID":"12D3KooWN8vAoGd6eurUSidcpLYguQiGZwt4eVgDvbgaS7kiGTup"},{"Addrs":["/ip4/35.74.45.12/udp/6746/quic"],"ID":"12D3KooWLV128pddyvoG6NBvoZw7sSrgpMTPtjnpu3mSmENqhtL7"},{"Addrs":["/dnsaddr/fra1-1.hostnodes.pinata.cloud"],"ID":"QmWaik1eJcGHq1ybTWe7sezRfqKNcDRNkeBaLnGwQJz1Cj"},{"Addrs":["/dnsaddr/fra1-2.hostnodes.pinata.cloud"],"ID":"QmNfpLrQQZr5Ns9FAJKpyzgnDL2GgC6xBug1yUZozKFgu4"},{"Addrs":["/dnsaddr/fra1-3.hostnodes.pinata.cloud"],"ID":"QmPo1ygpngghu5it8u4Mr3ym6SEU2Wp2wA66Z91Y1S1g29"},{"Addrs":["/dnsaddr/nyc1-1.hostnodes.pinata.cloud"],"ID":"QmRjLSisUCHVpFa5ELVvX3qVPfdxajxWJEHs9kN3EcxAW6"},{"Addrs":["/dnsaddr/nyc1-2.hostnodes.pinata.cloud"],"ID":"QmPySsdmbczdZYBpbi2oq2WMJ8ErbfxtkG8Mo192UHkfGP"},{"Addrs":["/dnsaddr/nyc1-3.hostnodes.pinata.cloud"],"ID":"QmSarArpxemsPESa6FNkmuu9iSE1QWqPX2R3Aw6f5jq4D5"},{"Addrs":["/ip4/5.161.92.43/tcp/4001","/ip4/5.161.92.43/udp/4001/quic-v1","/ip6/2a01:4ff:f0:3b1e::1/tcp/4001","/ip6/2a01:4ff:f0:3b1e::1/udp/4001/quic-v1"],"ID":"12D3KooWFFhc8fPYnQXdWBCowxSV21EFYin3rU27p3NVgSMjN41k"},{"Addrs":["/ip4/5.161.55.227/tcp/4001","/ip4/5.161.55.227/udp/4001/quic-v1","/ip6/2a01:4ff:f0:1e5a::1/tcp/4001","/ip6/2a01:4ff:f0:1e5a::1/udp/4001/quic-v1"],"ID":"12D3KooWSW4hoHmDXmY5rW7nCi9XmGTy3foFt72u86jNP53LTNBJ"},{"Addrs":["/ip4/5.161.92.36/tcp/4001","/ip4/5.161.92.36/udp/4001/quic-v1","/ip6/2a01:4ff:f0:3764::1/tcp/4001","/ip6/2a01:4ff:f0:3764::1/udp/4001/quic-v1"],"ID":"12D3KooWSDj6JM2JmoHwE9AUUwqAFUEg9ndd3pMA8aF2bkYckZfo"},{"Addrs":["/ip4/104.210.43.77"],"ID":"QmR69wtWUMm1TWnmuD4JqC1TWLZcc8iR2KrTenfZZbiztd"},{"Addrs":["/ip4/78.46.108.24"],"ID":"12D3KooWGASC2jm3pmohEJXUhuStkxDitPgzvs4qMuFPaiD9x1BA"},{"Addrs":["/ip4/65.109.19.136"],"ID":"12D3KooWRbWZN3GvLf9CHmozq4vnTzDD4EEoiqtRJxg5FV6Gfjmm"},{"Addrs":["/dnsaddr/node-1.ipfs.4everland.net"],"ID":"12D3KooWQ85aSCFwFkByr5e3pUCQeuheVhobVxGSSs1DrRQHGv1t"},{"Addrs":["/dns4/bitswap.filebase.io/tcp/443/wss"],"ID":"12D3KooWGtYkBAaqJMJEmywMxaCiNP7LCEFUAFiLEBASe232c2VH"},{"Addrs":["/dnsaddr/node-1.ipfs.bit.site"],"ID":"12D3KooWKNJDVqWKdGH5PJUpgG7JwSQnJCHSt2abfRMht2yjyV5x"},{"Addrs":["/dnsaddr/peer.ipfs.storry.tv"],"ID":"bafzaajaiaejca3eporu7skzkukuie5nopngnubidqmnf57fl3qet7angukq234qj"},{"Addrs":["/dnsaddr/peer2.ipfs.storry.tv"],"ID":"bafzaajaiaejcajedrki5t7qmgxzhwr24pfxb5cwrdf5d7rktguqurqztxsbffbvh"},{"Addrs":["/dns4/elastic.dag.house/tcp/443/wss"],"ID":"bafzbeibhqavlasjc7dvbiopygwncnrtvjd2xmryk5laib7zyjor6kf3avm"}]},"config":{"addrFilters":["/ip4/100.64.0.0/ipcidr/10","/ip4/169.254.0.0/ipcidr/16","/ip4/198.18.0.0/ipcidr/15","/ip4/198.51.100.0/ipcidr/24","/ip4/203.0.113.0/ipcidr/24","/ip4/240.0.0.0/ipcidr/4","/ip6/100::/ipcidr/64","/ip6/2001:2::/ipcidr/48","/ip6/2001:db8::/ipcidr/32","/ip6/fc00::/ipcidr/7","/ip6/fe80::/ipcidr/10"],"api":{"httpHeaders":{"accessControlAllowHeaders":["x-auth-token","DNT","X-CustomHeader","Keep-Alive","User-Agent","X-Requested-With","If-Modified-Since","Cache-Control","Content-Type","Authorization","X-Apollo-Tracing","shouldpersistheaders","x-hasura-admin-secret","x-hasura-role","x-hasura-user-id"],"accessControlAllowMethods":["PUT","POST","GET","OPTIONS","DELETE","HEAD"],"accessControlAllowOrigin":["*"]}},"appendAnnounce":["/ip4/$POD_IP/tcp/{{ .Values.ipfs.config.swarmPort }}","/ip4/${NODE_EXTERNAL_IP:-$POD_IP}/tcp/{{ .Values.ipfs.config.swarmPort }}","/dns4/{{ include \"ipfs-cluster.ipfsFullname\" . }}.{{ .Release.Namespace }}.svc.cluster.local/tcp/{{ .Values.ipfs.config.swarmPort }}"],"autoNATServiceMode":"enabled","bloomFilterSize":1048576,"clusterPort":9096,"connMgr":{"gracePeriod":"20s","highWater":300,"lowWater":225},"datastore":{"storageMax":""},"discovery":{"mdnsEnabled":true},"extraAppendAnnounce":[],"gateway":{"publicGateways":{},"rootRedirect":""},"gatewayPort":8888,"noAnnounce":["/ip4/100.64.0.0/ipcidr/10","/ip4/169.254.0.0/ipcidr/16","/ip4/198.18.0.0/ipcidr/15","/ip4/198.51.100.0/ipcidr/24","/ip4/203.0.113.0/ipcidr/24","/ip4/240.0.0.0/ipcidr/4","/ip6/100::/ipcidr/64","/ip6/2001:2::/ipcidr/48","/ip6/2001:db8::/ipcidr/32","/ip6/fc00::/ipcidr/7","/ip6/fe80::/ipcidr/10"],"profile":"server","resourceMgr":{"maxMemory":""},"routing":{"acceleratedDHTClient":true},"swarm":{"disableNatPortMap":false,"enableHolePunching":false,"relay":{"clientEnabled":false,"network":false,"serviceEnabled":false},"transports":{"quic":true}},"swarmPort":4001},"containerSecurityContext":{},"customCommand":[],"extraArgs":[],"extraContainers":[],"extraEnv":[],"extraVolumeMounts":[],"extraVolumes":[],"image":{"pullPolicy":"IfNotPresent","registry":"docker.io","repository":"ipfs/kubo","tag":"v0.38.0"},"initContainers":[],"initScripts":{},"nodeSelector":{},"podAnnotations":{},"podLabels":{"app.kubernetes.io/component":"ipfs"},"podSecurityContext":{},"resources":{},"runtime":{"goMemLimit":""},"service":{"annotations":{},"ports":{"api":5001,"gateway":8080,"mdns":5353,"swarmTcp":4001,"swarmUdp":4001,"ws":8081},"type":"ClusterIP"},"storage":{"storageClassName":"","volumeSize":"10Gi"},"swarmKey":{"enabled":false,"mountPath":"/etc/ipfs/swarm","repoPath":"/data/ipfs","secretKey":"swarm.key","secretName":""},"tolerations":[]}` | IPFS (Kubo) peer configuration |
| ipfs.affinity | object | `{}` | Affinity rules |
| ipfs.bootstrap.includeProviderPeers | bool | `true` | Include providerPeers in bootstrap and peering configuration |
| ipfs.bootstrap.nodePeers | list | `[]` | Custom bootstrap peers added to the node. Objects must define ID and Addrs. |
| ipfs.bootstrap.providerPeers | list | `[{"Addrs":["/dnsaddr/node-1.ingress.cloudflare-ipfs.com"],"ID":"QmcFf2FH3CEgTNHeMRGhN7HNHU1EXAxoEk6EFuSyXCsvRE"},{"Addrs":["/dnsaddr/node-2.ingress.cloudflare-ipfs.com"],"ID":"QmcFmLd5ySfk2WZuJ1mfSWLDjdmHZq7rSAua4GoeSQfs1z"},{"Addrs":["/dnsaddr/node-3.ingress.cloudflare-ipfs.com"],"ID":"QmcfFmzSDVbwexQ9Au2pt5YEXHK5xajwgaU6PpkbLWerMa"},{"Addrs":["/dnsaddr/node-4.ingress.cloudflare-ipfs.com"],"ID":"QmcfJeB3Js1FG7T8YaZATEiaHqNKVdQfybYYkbT1knUswx"},{"Addrs":["/dnsaddr/node-5.ingress.cloudflare-ipfs.com"],"ID":"QmcfVvzK4tMdFmpJjEKDUoqRgP4W9FnmJoziYX5GXJJ8eZ"},{"Addrs":["/dnsaddr/node-6.ingress.cloudflare-ipfs.com"],"ID":"QmcfZD3VKrUxyP9BbyUnZDpbqDnT7cQ4WjPP8TRLXaoE7G"},{"Addrs":["/dnsaddr/node-7.ingress.cloudflare-ipfs.com"],"ID":"QmcfZP2LuW4jxviTeG8fi28qjnZScACb8PEgHAc17ZEri3"},{"Addrs":["/dnsaddr/node-8.ingress.cloudflare-ipfs.com"],"ID":"QmcfgsJsMtx6qJb74akCw1M24X1zFwgGo11h1cuhwQjtJP"},{"Addrs":["/dnsaddr/node-9.ingress.cloudflare-ipfs.com"],"ID":"Qmcfr2FC7pFzJbTSDfYaSy1J8Uuy8ccGLeLyqJCKJvTHMi"},{"Addrs":["/dnsaddr/node-10.ingress.cloudflare-ipfs.com"],"ID":"QmcfR3V5YAtHBzxVACWCzXTt26SyEkxdwhGJ6875A8BuWx"},{"Addrs":["/dnsaddr/node-11.ingress.cloudflare-ipfs.com"],"ID":"Qmcfuo1TM9uUiJp6dTbm915Rf1aTqm3a3dnmCdDQLHgvL5"},{"Addrs":["/dnsaddr/node-12.ingress.cloudflare-ipfs.com"],"ID":"QmcfV2sg9zaq7UUHVCGuSvT2M2rnLBAPsiE79vVyK3Cuev"},{"Addrs":["/dns4/ipfs.ssi.eecc.de"],"ID":"12D3KooWGaHbxpDWn4JVYud899Wcpa4iHPa3AMYydfxQDb3MhDME"},{"Addrs":["/ip4/139.178.68.217/tcp/6744"],"ID":"12D3KooWCVXs8P7iq6ao4XhfAmKWrEeuKFWCJgqe9jGDMTqHYBjw"},{"Addrs":["/ip4/147.75.49.71/tcp/6745"],"ID":"12D3KooWGBWx9gyUFTVQcKMTenQMSyE2ad9m7c9fpjS4NMjoDien"},{"Addrs":["/ip4/147.75.86.255/tcp/6745"],"ID":"12D3KooWFrnuj5o3tx4fGD2ZVJRyDqTdzGnU3XYXmBbWbc8Hs8Nd"},{"Addrs":["/ip4/3.134.223.177/tcp/6745"],"ID":"12D3KooWN8vAoGd6eurUSidcpLYguQiGZwt4eVgDvbgaS7kiGTup"},{"Addrs":["/ip4/35.74.45.12/udp/6746/quic"],"ID":"12D3KooWLV128pddyvoG6NBvoZw7sSrgpMTPtjnpu3mSmENqhtL7"},{"Addrs":["/dnsaddr/fra1-1.hostnodes.pinata.cloud"],"ID":"QmWaik1eJcGHq1ybTWe7sezRfqKNcDRNkeBaLnGwQJz1Cj"},{"Addrs":["/dnsaddr/fra1-2.hostnodes.pinata.cloud"],"ID":"QmNfpLrQQZr5Ns9FAJKpyzgnDL2GgC6xBug1yUZozKFgu4"},{"Addrs":["/dnsaddr/fra1-3.hostnodes.pinata.cloud"],"ID":"QmPo1ygpngghu5it8u4Mr3ym6SEU2Wp2wA66Z91Y1S1g29"},{"Addrs":["/dnsaddr/nyc1-1.hostnodes.pinata.cloud"],"ID":"QmRjLSisUCHVpFa5ELVvX3qVPfdxajxWJEHs9kN3EcxAW6"},{"Addrs":["/dnsaddr/nyc1-2.hostnodes.pinata.cloud"],"ID":"QmPySsdmbczdZYBpbi2oq2WMJ8ErbfxtkG8Mo192UHkfGP"},{"Addrs":["/dnsaddr/nyc1-3.hostnodes.pinata.cloud"],"ID":"QmSarArpxemsPESa6FNkmuu9iSE1QWqPX2R3Aw6f5jq4D5"},{"Addrs":["/ip4/5.161.92.43/tcp/4001","/ip4/5.161.92.43/udp/4001/quic-v1","/ip6/2a01:4ff:f0:3b1e::1/tcp/4001","/ip6/2a01:4ff:f0:3b1e::1/udp/4001/quic-v1"],"ID":"12D3KooWFFhc8fPYnQXdWBCowxSV21EFYin3rU27p3NVgSMjN41k"},{"Addrs":["/ip4/5.161.55.227/tcp/4001","/ip4/5.161.55.227/udp/4001/quic-v1","/ip6/2a01:4ff:f0:1e5a::1/tcp/4001","/ip6/2a01:4ff:f0:1e5a::1/udp/4001/quic-v1"],"ID":"12D3KooWSW4hoHmDXmY5rW7nCi9XmGTy3foFt72u86jNP53LTNBJ"},{"Addrs":["/ip4/5.161.92.36/tcp/4001","/ip4/5.161.92.36/udp/4001/quic-v1","/ip6/2a01:4ff:f0:3764::1/tcp/4001","/ip6/2a01:4ff:f0:3764::1/udp/4001/quic-v1"],"ID":"12D3KooWSDj6JM2JmoHwE9AUUwqAFUEg9ndd3pMA8aF2bkYckZfo"},{"Addrs":["/ip4/104.210.43.77"],"ID":"QmR69wtWUMm1TWnmuD4JqC1TWLZcc8iR2KrTenfZZbiztd"},{"Addrs":["/ip4/78.46.108.24"],"ID":"12D3KooWGASC2jm3pmohEJXUhuStkxDitPgzvs4qMuFPaiD9x1BA"},{"Addrs":["/ip4/65.109.19.136"],"ID":"12D3KooWRbWZN3GvLf9CHmozq4vnTzDD4EEoiqtRJxg5FV6Gfjmm"},{"Addrs":["/dnsaddr/node-1.ipfs.4everland.net"],"ID":"12D3KooWQ85aSCFwFkByr5e3pUCQeuheVhobVxGSSs1DrRQHGv1t"},{"Addrs":["/dns4/bitswap.filebase.io/tcp/443/wss"],"ID":"12D3KooWGtYkBAaqJMJEmywMxaCiNP7LCEFUAFiLEBASe232c2VH"},{"Addrs":["/dnsaddr/node-1.ipfs.bit.site"],"ID":"12D3KooWKNJDVqWKdGH5PJUpgG7JwSQnJCHSt2abfRMht2yjyV5x"},{"Addrs":["/dnsaddr/peer.ipfs.storry.tv"],"ID":"bafzaajaiaejca3eporu7skzkukuie5nopngnubidqmnf57fl3qet7angukq234qj"},{"Addrs":["/dnsaddr/peer2.ipfs.storry.tv"],"ID":"bafzaajaiaejcajedrki5t7qmgxzhwr24pfxb5cwrdf5d7rktguqurqztxsbffbvh"},{"Addrs":["/dns4/elastic.dag.house/tcp/443/wss"],"ID":"bafzbeibhqavlasjc7dvbiopygwncnrtvjd2xmryk5laib7zyjor6kf3avm"}]` | Default provider peers added when includeProviderPeers is true. |
| ipfs.config | object | `{"addrFilters":["/ip4/100.64.0.0/ipcidr/10","/ip4/169.254.0.0/ipcidr/16","/ip4/198.18.0.0/ipcidr/15","/ip4/198.51.100.0/ipcidr/24","/ip4/203.0.113.0/ipcidr/24","/ip4/240.0.0.0/ipcidr/4","/ip6/100::/ipcidr/64","/ip6/2001:2::/ipcidr/48","/ip6/2001:db8::/ipcidr/32","/ip6/fc00::/ipcidr/7","/ip6/fe80::/ipcidr/10"],"api":{"httpHeaders":{"accessControlAllowHeaders":["x-auth-token","DNT","X-CustomHeader","Keep-Alive","User-Agent","X-Requested-With","If-Modified-Since","Cache-Control","Content-Type","Authorization","X-Apollo-Tracing","shouldpersistheaders","x-hasura-admin-secret","x-hasura-role","x-hasura-user-id"],"accessControlAllowMethods":["PUT","POST","GET","OPTIONS","DELETE","HEAD"],"accessControlAllowOrigin":["*"]}},"appendAnnounce":["/ip4/$POD_IP/tcp/{{ .Values.ipfs.config.swarmPort }}","/ip4/${NODE_EXTERNAL_IP:-$POD_IP}/tcp/{{ .Values.ipfs.config.swarmPort }}","/dns4/{{ include \"ipfs-cluster.ipfsFullname\" . }}.{{ .Release.Namespace }}.svc.cluster.local/tcp/{{ .Values.ipfs.config.swarmPort }}"],"autoNATServiceMode":"enabled","bloomFilterSize":1048576,"clusterPort":9096,"connMgr":{"gracePeriod":"20s","highWater":300,"lowWater":225},"datastore":{"storageMax":""},"discovery":{"mdnsEnabled":true},"extraAppendAnnounce":[],"gateway":{"publicGateways":{},"rootRedirect":""},"gatewayPort":8888,"noAnnounce":["/ip4/100.64.0.0/ipcidr/10","/ip4/169.254.0.0/ipcidr/16","/ip4/198.18.0.0/ipcidr/15","/ip4/198.51.100.0/ipcidr/24","/ip4/203.0.113.0/ipcidr/24","/ip4/240.0.0.0/ipcidr/4","/ip6/100::/ipcidr/64","/ip6/2001:2::/ipcidr/48","/ip6/2001:db8::/ipcidr/32","/ip6/fc00::/ipcidr/7","/ip6/fe80::/ipcidr/10"],"profile":"server","resourceMgr":{"maxMemory":""},"routing":{"acceleratedDHTClient":true},"swarm":{"disableNatPortMap":false,"enableHolePunching":false,"relay":{"clientEnabled":false,"network":false,"serviceEnabled":false},"transports":{"quic":true}},"swarmPort":4001}` | Runtime configuration applied through init script |
| ipfs.config.addrFilters | list | `["/ip4/100.64.0.0/ipcidr/10","/ip4/169.254.0.0/ipcidr/16","/ip4/198.18.0.0/ipcidr/15","/ip4/198.51.100.0/ipcidr/24","/ip4/203.0.113.0/ipcidr/24","/ip4/240.0.0.0/ipcidr/4","/ip6/100::/ipcidr/64","/ip6/2001:2::/ipcidr/48","/ip6/2001:db8::/ipcidr/32","/ip6/fc00::/ipcidr/7","/ip6/fe80::/ipcidr/10"]` | Swarm.AddrFilters CIDR entries |
| ipfs.config.api.httpHeaders.accessControlAllowHeaders | list | `["x-auth-token","DNT","X-CustomHeader","Keep-Alive","User-Agent","X-Requested-With","If-Modified-Since","Cache-Control","Content-Type","Authorization","X-Apollo-Tracing","shouldpersistheaders","x-hasura-admin-secret","x-hasura-role","x-hasura-user-id"]` | API.HTTPHeaders.Access-Control-Allow-Headers values |
| ipfs.config.api.httpHeaders.accessControlAllowMethods | list | `["PUT","POST","GET","OPTIONS","DELETE","HEAD"]` | API.HTTPHeaders.Access-Control-Allow-Methods values |
| ipfs.config.api.httpHeaders.accessControlAllowOrigin | list | `["*"]` | API.HTTPHeaders.Access-Control-Allow-Origin values |
| ipfs.config.appendAnnounce | list | `["/ip4/$POD_IP/tcp/{{ .Values.ipfs.config.swarmPort }}","/ip4/${NODE_EXTERNAL_IP:-$POD_IP}/tcp/{{ .Values.ipfs.config.swarmPort }}","/dns4/{{ include \"ipfs-cluster.ipfsFullname\" . }}.{{ .Release.Namespace }}.svc.cluster.local/tcp/{{ .Values.ipfs.config.swarmPort }}"]` | Base Addresses.AppendAnnounce values. Entries are templated with Helm's tpl. |
| ipfs.config.autoNATServiceMode | string | `"enabled"` | AutoNAT service mode |
| ipfs.config.bloomFilterSize | int | `1048576` | Datastore bloom filter size |
| ipfs.config.clusterPort | int | `9096` | Cluster libp2p port used for announcements |
| ipfs.config.connMgr.gracePeriod | string | `"20s"` | Swarm.ConnMgr.GracePeriod duration |
| ipfs.config.connMgr.highWater | int | `300` | Swarm.ConnMgr.HighWater threshold |
| ipfs.config.connMgr.lowWater | int | `225` | Swarm.ConnMgr.LowWater threshold |
| ipfs.config.datastore.storageMax | string | `""` | Datastore.StorageMax value (e.g. 10Gi). Leave empty to skip. |
| ipfs.config.discovery.mdnsEnabled | bool | `true` | Discovery.MDNS.Enabled toggle |
| ipfs.config.extraAppendAnnounce | list | `[]` | Additional Addresses.AppendAnnounce entries appended after the defaults |
| ipfs.config.gateway.publicGateways | object | `{}` | Gateway.PublicGateways overrides |
| ipfs.config.gateway.rootRedirect | string | `""` | Gateway.RootRedirect target |
| ipfs.config.gatewayPort | int | `8888` | Gateway TCP port |
| ipfs.config.noAnnounce | list | `["/ip4/100.64.0.0/ipcidr/10","/ip4/169.254.0.0/ipcidr/16","/ip4/198.18.0.0/ipcidr/15","/ip4/198.51.100.0/ipcidr/24","/ip4/203.0.113.0/ipcidr/24","/ip4/240.0.0.0/ipcidr/4","/ip6/100::/ipcidr/64","/ip6/2001:2::/ipcidr/48","/ip6/2001:db8::/ipcidr/32","/ip6/fc00::/ipcidr/7","/ip6/fe80::/ipcidr/10"]` | Addresses.NoAnnounce CIDR entries |
| ipfs.config.profile | string | `"server"` | IPFS profile applied during initialization |
| ipfs.config.resourceMgr.maxMemory | string | `""` | Swarm.ResourceMgr.MaxMemory value in bytes. Leave empty to skip. |
| ipfs.config.routing.acceleratedDHTClient | bool | `true` | Routing.AcceleratedDHTClient toggle |
| ipfs.config.swarm.disableNatPortMap | bool | `false` | Swarm.DisableNatPortMap toggle |
| ipfs.config.swarm.enableHolePunching | bool | `false` | Swarm.EnableHolePunching toggle |
| ipfs.config.swarm.relay.clientEnabled | bool | `false` | Swarm.RelayClient.Enabled toggle |
| ipfs.config.swarm.relay.network | bool | `false` | Swarm.Transports.Network.Relay toggle |
| ipfs.config.swarm.relay.serviceEnabled | bool | `false` | Swarm.RelayService.Enabled toggle |
| ipfs.config.swarm.transports.quic | bool | `true` | Swarm.Transports.Network.QUIC toggle |
| ipfs.config.swarmPort | int | `4001` | Swarm TCP port |
| ipfs.containerSecurityContext | object | `{}` | Container-level security context overrides |
| ipfs.customCommand | list | `[]` | Extra commands to override the default entrypoint |
| ipfs.extraArgs | list | `[]` | Additional arguments passed to the container command |
| ipfs.extraContainers | list | `[]` | Additional containers to inject into the pod |
| ipfs.extraEnv | list | `[]` | Additional environment variables for the IPFS container |
| ipfs.extraVolumeMounts | list | `[]` | Additional volume mounts for the IPFS container |
| ipfs.extraVolumes | object | `[]` | Additional volumes for the pod |
| ipfs.image.pullPolicy | string | `"IfNotPresent"` | IPFS image pull policy |
| ipfs.image.registry | string | `"docker.io"` | IPFS image registry |
| ipfs.image.repository | string | `"ipfs/kubo"` | IPFS image repository |
| ipfs.image.tag | string | `"v0.38.0"` | IPFS image tag |
| ipfs.initContainers | list | `[]` | Additional init containers |
| ipfs.initScripts | map | `{}` | Init scripts injected via ConfigMap (filename => script contents). Keys must match ^[A-Za-z0-9_.-]+$ |
| ipfs.nodeSelector | object | `{}` | Node selector |
| ipfs.podAnnotations | object | `{}` | Additional pod annotations |
| ipfs.podLabels | object | `{"app.kubernetes.io/component":"ipfs"}` | Additional pod labels |
| ipfs.podSecurityContext | object | `{}` | Pod-level security context overrides |
| ipfs.resources | object | `{}` | Resource requests and limits |
| ipfs.runtime.goMemLimit | string | `""` | Optional GOMEMLIMIT value for the IPFS container (e.g. "1024MiB") |
| ipfs.service.annotations | object | `{}` | Additional annotations for the IPFS service |
| ipfs.service.ports | object | `{"api":5001,"gateway":8080,"mdns":5353,"swarmTcp":4001,"swarmUdp":4001,"ws":8081}` | Service ports exposed by the IPFS peers |
| ipfs.service.ports.api | int | `5001` | API port |
| ipfs.service.ports.gateway | int | `8080` | Gateway port |
| ipfs.service.ports.mdns | int | `5353` | MDNS port |
| ipfs.service.ports.swarmTcp | int | `4001` | Swarm TCP port |
| ipfs.service.ports.swarmUdp | int | `4001` | Swarm UDP port |
| ipfs.service.ports.ws | int | `8081` | Websocket port |
| ipfs.service.type | string | `"ClusterIP"` | Service type for IPFS API/gateway |
| ipfs.storage.storageClassName | string | `""` | StorageClass for the IPFS data PVC |
| ipfs.storage.volumeSize | string | `"10Gi"` | Requested storage size for the IPFS data PVC |
| ipfs.swarmKey.enabled | bool | `false` | Mount a swarm.key secret and copy it into the repo |
| ipfs.swarmKey.mountPath | string | `"/etc/ipfs/swarm"` | Mount path for the swarm key secret inside the pod |
| ipfs.swarmKey.repoPath | string | `"/data/ipfs"` | Destination directory for the swarm key inside the repo |
| ipfs.swarmKey.secretKey | string | `"swarm.key"` | Key within the secret that holds the swarm key |
| ipfs.swarmKey.secretName | string | `""` | Kubernetes secret name containing swarm.key |
| ipfs.tolerations | list | `[]` | Tolerations |
| nameOverride | string | `""` | Override for chart name |
| openShiftRoute | object | `{"annotations":{},"enabled":false,"host":"ipfs-cluster.k8s.orb.local","routes":{"api":{"enabled":true,"nameSuffix":"api","path":"/?(api/((.*[^/])?)?)","service":{"port":"proxy","target":"cluster"}},"cluster":{"enabled":true,"nameSuffix":"cluster","path":"/?cluster/(((.*[^/])?)?)","service":{"port":"api","target":"cluster"}},"pinning":{"enabled":true,"nameSuffix":"pinning","path":"/?pinning/(((.*[^/])?)?)","service":{"port":"pinning","target":"cluster"}},"ws":{"enabled":true,"nameSuffix":"ws","path":"/?ws/(((.*[^/])?)?)","service":{"port":"ws","target":"ipfs"}}},"tls":null,"wildcardPolicy":"None"}` | OpenShift route configuration |
| openShiftRoute.annotations | object | `{}` | Additional annotations merged into every Route |
| openShiftRoute.enabled | bool | `false` | Enable OpenShift Routes instead of ingress |
| openShiftRoute.host | string | `"ipfs-cluster.k8s.orb.local"` | Global host applied to every rendered Route (per-route host overrides are optional) |
| openShiftRoute.routes | object | `{"api":{"enabled":true,"nameSuffix":"api","path":"/?(api/((.*[^/])?)?)","service":{"port":"proxy","target":"cluster"}},"cluster":{"enabled":true,"nameSuffix":"cluster","path":"/?cluster/(((.*[^/])?)?)","service":{"port":"api","target":"cluster"}},"pinning":{"enabled":true,"nameSuffix":"pinning","path":"/?pinning/(((.*[^/])?)?)","service":{"port":"pinning","target":"cluster"}},"ws":{"enabled":true,"nameSuffix":"ws","path":"/?ws/(((.*[^/])?)?)","service":{"port":"ws","target":"ipfs"}}}` | Route entries keyed by logical name; set enabled: false to skip a route |
| openShiftRoute.tls | object | `nil` | TLS configuration applied when TLS is desired |
| openShiftRoute.wildcardPolicy | string | `"None"` | Wildcard policy used when a Route does not override it |
| p2pNodePort | object | `{"annotations":{},"enabled":false,"externalTrafficPolicy":"Cluster","hostIP":{"fieldPath":"status.hostIP","value":""},"nodePort":32000}` | Configuration for the optional NodePort service used for public P2P addresses |
| p2pNodePort.annotations | object | `{}` | Additional annotations for the NodePort service |
| p2pNodePort.enabled | bool | `false` | Enable creation of a NodePort service for the swarm port |
| p2pNodePort.externalTrafficPolicy | string | `"Cluster"` | ExternalTrafficPolicy for the NodePort service |
| p2pNodePort.hostIP.fieldPath | string | `"status.hostIP"` | Pod fieldRef used to resolve the host IP when value is empty |
| p2pNodePort.hostIP.value | string | `""` | Optional static IP address to advertise. When set, overrides fieldRef detection. |
| p2pNodePort.nodePort | int | `32000` | Static nodePort to announce when enabled |
| replicaCount | int | `1` | Number of IPFS peers and cluster members |
| serviceAccount | object | `{"annotations":{},"create":true,"name":""}` | Service account configuration |
| serviceAccount.annotations | object | `{}` | Service account annotations |
| serviceAccount.create | bool | `true` | Create the service account |
| serviceAccount.name | string | `""` | Service account name override |
| sharedSecret | string | `""` | Shared secret for cluster peers. Leave empty to auto-generate. |
| tests | object | `{"image":{"pullPolicy":"IfNotPresent","registry":"docker.io","repository":"busybox","tag":"1.36"}}` | Test hook image configuration |
| tests.image.pullPolicy | string | `"IfNotPresent"` | Test image pull policy |
| tests.image.registry | string | `"docker.io"` | Test image registry |
| tests.image.repository | string | `"busybox"` | Test image repository |
| tests.image.tag | string | `"1.36"` | Test image tag |

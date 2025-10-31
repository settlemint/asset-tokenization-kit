# ipfs

![Version: 2.0.0-beta.6](https://img.shields.io/badge/Version-2.0.0--beta.6-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: 2.0.0-beta.6](https://img.shields.io/badge/AppVersion-2.0.0--beta.6-informational?style=flat-square)

A Helm chart for deploying IPFS Cluster and IPFS peer nodes for ATK

## Configuration

The following table lists the configurable parameters of this chart and their default values.

## Values

| Key | Type | Default | Description |
|-----|------|---------|-------------|
|cluster|object|-|IPFS Cluster peer configuration|
|cluster.affinity|object|-|Affinity|
|cluster.containerSecurityContext|object|-|Container-level security context overrides|
|cluster.extraContainers|list|-|Additional containers to inject into the pod|
|cluster.extraEnv|list|-|Extra environment variables for the cluster container|
|cluster.extraInitContainers|list|-|Additional init containers|
|cluster.extraVolumeMounts|list|-|Additional volume mounts for the cluster container|
|cluster.extraVolumes|object|-|Additional volumes for the pod|
|cluster.image.pullPolicy|string|`"IfNotPresent"`|Cluster image pull policy|
|cluster.image.registry|string|`"docker.io"`|Cluster image registry|
|cluster.image.repository|string|`"ipfs/ipfs-cluster"`|Cluster image repository|
|cluster.image.tag|string|`"v1.1.4"`|Cluster image tag|
|cluster.nodeSelector|object|-|Node selector|
|cluster.podAnnotations|object|-|Additional pod annotations|
|cluster.podLabels|object|-|Additional pod labels|
|cluster.podLabels."app.kubernetes.io/component"|string|`"cluster"`|Component label identifying pods as part of the IPFS cluster control plane|
|cluster.podSecurityContext|object|-|Pod-level security context overrides|
|cluster.resources|object|-|Resource requests and limits|
|cluster.service.annotations|object|-|Additional annotations for the cluster service|
|cluster.service.ports|object|-|Cluster service port configuration|
|cluster.service.ports.api|int|`9094`|REST API port|
|cluster.service.ports.metrics|int|`8888`|Prometheus metrics port|
|cluster.service.ports.p2p|int|`9096`|Libp2p cluster port|
|cluster.service.ports.pinning|int|`9097`|Pinning service HTTP port|
|cluster.service.ports.proxy|int|`9095`|IPFS proxy port|
|cluster.service.type|string|`"ClusterIP"`|Service type for the cluster REST API|
|cluster.storage.storageClassName|string|`""`|StorageClass for the cluster data PVC|
|cluster.storage.volumeSize|string|`"1Gi"`|Requested storage size for the cluster data PVC|
|cluster.tolerations|list|-|Tolerations|
|commonAnnotations|object|-|Annotations to add to all rendered manifests|
|commonLabels|object|-|Labels to add to all rendered manifests|
|fullnameOverride|string|`"ipfs"`|Override for generated full name|
|global|object|-|Global Docker image registry and shared labels|
|global.imagePullSecrets|list|-|Global Docker registry secret names as an array|
|global.imageRegistry|string|`""`|Global Docker image registry|
|global.imageTag|string|`""`|Global image tag override|
|global.labels|object|-|Global labels applied to all resources|
|global.storageClass|object|-|Global StorageClass overrides|
|imagePullSecrets|list|-|Image pull secrets applied to workload pods|
|ingress|object|-|Ingress configuration for the cluster REST API|
|ingress.className|string|`"atk-nginx"`|Ingress class name|
|ingress.enabled|bool|`true`|Enable HTTP ingress for the cluster REST API|
|ingress.hostnames|object|-|Hostnames mapped to path groups|
|ingress.hostnames.api|string|`"ipfs-cluster.k8s.orb.local"`|Hostname served by the cluster REST API ingress|
|ingress.pathGroups|object|-|Path groups rendered for each hostname key|
|ingress.pathGroups.api[0]|string|`{"path":"/?(api/((.*[^/])?)?)","pathType":"ImplementationSpecific","service":{"port":"proxy","target":"cluster"}}`|Ingress path pattern for REST API calls|
|ingress.pathGroups.api[0].pathType|string|`"ImplementationSpecific"`|Path matching mode for cluster API requests|
|ingress.pathGroups.api[0].service.port|string|`"proxy"`|Named service port forwarding API traffic|
|ingress.pathGroups.api[0].service.target|string|`"cluster"`|Backend service handling cluster API requests|
|ingress.pathGroups.api[1]|string|`{"path":"/?cluster/(((.*[^/])?)?)","pathType":"ImplementationSpecific","service":{"port":"api","target":"cluster"}}`|Ingress path pattern for cluster control endpoints|
|ingress.pathGroups.api[1].pathType|string|`"ImplementationSpecific"`|Path matching mode for cluster control operations|
|ingress.pathGroups.api[1].service.port|string|`"api"`|Named service port forwarding cluster control requests|
|ingress.pathGroups.api[1].service.target|string|`"cluster"`|Backend service handling cluster control requests|
|ingress.pathGroups.api[2]|string|`{"path":"/?pinning/(((.*[^/])?)?)","pathType":"ImplementationSpecific","service":{"port":"pinning","target":"cluster"}}`|Ingress path pattern for pinning API routes|
|ingress.pathGroups.api[2].pathType|string|`"ImplementationSpecific"`|Path matching mode for pinning REST routes|
|ingress.pathGroups.api[2].service.port|string|`"pinning"`|Named service port forwarding pinning traffic|
|ingress.pathGroups.api[2].service.target|string|`"cluster"`|Backend service handling pinning operations|
|ingress.pathGroups.api[3]|string|`{"path":"/?ws/(((.*[^/])?)?)","pathType":"ImplementationSpecific","service":{"port":"ws","target":"ipfs"}}`|Ingress path pattern for WebSocket streaming|
|ingress.pathGroups.api[3].pathType|string|`"ImplementationSpecific"`|Path matching mode for WebSocket connections|
|ingress.pathGroups.api[3].service.port|string|`"ws"`|Named service port forwarding WebSocket traffic|
|ingress.pathGroups.api[3].service.target|string|`"ipfs"`|Backend service handling WebSocket connections|
|ingress.tls|list|-|TLS configuration for the ingress|
|ipfs|object|-|IPFS (Kubo) peer configuration|
|ipfs.affinity|object|-|Affinity rules|
|ipfs.bootstrap.includeProviderPeers|bool|`true`|Include providerPeers in bootstrap and peering configuration|
|ipfs.bootstrap.nodePeers|list|-|Custom bootstrap peers added to the node. Objects must define ID and Addrs.|
|ipfs.bootstrap.providerPeers|list|-|Default provider peers added when includeProviderPeers is true.|
|ipfs.bootstrap.providerPeers[0].Addrs|list|-|Multiaddresses advertising the bootstrap peer|
|ipfs.bootstrap.providerPeers[0].ID|string|`"QmcFf2FH3CEgTNHeMRGhN7HNHU1EXAxoEk6EFuSyXCsvRE"`|Libp2p peer ID for the bootstrap node|
|ipfs.bootstrap.providerPeers[10].Addrs|list|-|Multiaddresses advertising the bootstrap peer|
|ipfs.bootstrap.providerPeers[10].ID|string|`"Qmcfuo1TM9uUiJp6dTbm915Rf1aTqm3a3dnmCdDQLHgvL5"`|Libp2p peer ID for the bootstrap node|
|ipfs.bootstrap.providerPeers[11].Addrs|list|-|Multiaddresses advertising the bootstrap peer|
|ipfs.bootstrap.providerPeers[11].ID|string|`"QmcfV2sg9zaq7UUHVCGuSvT2M2rnLBAPsiE79vVyK3Cuev"`|Libp2p peer ID for the bootstrap node|
|ipfs.bootstrap.providerPeers[12].Addrs|list|-|Multiaddresses advertising the bootstrap peer|
|ipfs.bootstrap.providerPeers[12].ID|string|`"12D3KooWGaHbxpDWn4JVYud899Wcpa4iHPa3AMYydfxQDb3MhDME"`|Libp2p peer ID for the bootstrap node|
|ipfs.bootstrap.providerPeers[13].Addrs|list|-|Multiaddresses advertising the bootstrap peer|
|ipfs.bootstrap.providerPeers[13].ID|string|`"12D3KooWCVXs8P7iq6ao4XhfAmKWrEeuKFWCJgqe9jGDMTqHYBjw"`|Libp2p peer ID for the bootstrap node|
|ipfs.bootstrap.providerPeers[14].Addrs|list|-|Multiaddresses advertising the bootstrap peer|
|ipfs.bootstrap.providerPeers[14].ID|string|`"12D3KooWGBWx9gyUFTVQcKMTenQMSyE2ad9m7c9fpjS4NMjoDien"`|Libp2p peer ID for the bootstrap node|
|ipfs.bootstrap.providerPeers[15].Addrs|list|-|Multiaddresses advertising the bootstrap peer|
|ipfs.bootstrap.providerPeers[15].ID|string|`"12D3KooWFrnuj5o3tx4fGD2ZVJRyDqTdzGnU3XYXmBbWbc8Hs8Nd"`|Libp2p peer ID for the bootstrap node|
|ipfs.bootstrap.providerPeers[16].Addrs|list|-|Multiaddresses advertising the bootstrap peer|
|ipfs.bootstrap.providerPeers[16].ID|string|`"12D3KooWN8vAoGd6eurUSidcpLYguQiGZwt4eVgDvbgaS7kiGTup"`|Libp2p peer ID for the bootstrap node|
|ipfs.bootstrap.providerPeers[17].Addrs|list|-|Multiaddresses advertising the bootstrap peer|
|ipfs.bootstrap.providerPeers[17].ID|string|`"12D3KooWLV128pddyvoG6NBvoZw7sSrgpMTPtjnpu3mSmENqhtL7"`|Libp2p peer ID for the bootstrap node|
|ipfs.bootstrap.providerPeers[18].Addrs|list|-|Multiaddresses advertising the bootstrap peer|
|ipfs.bootstrap.providerPeers[18].ID|string|`"QmWaik1eJcGHq1ybTWe7sezRfqKNcDRNkeBaLnGwQJz1Cj"`|Libp2p peer ID for the bootstrap node|
|ipfs.bootstrap.providerPeers[19].Addrs|list|-|Multiaddresses advertising the bootstrap peer|
|ipfs.bootstrap.providerPeers[19].ID|string|`"QmNfpLrQQZr5Ns9FAJKpyzgnDL2GgC6xBug1yUZozKFgu4"`|Libp2p peer ID for the bootstrap node|
|ipfs.bootstrap.providerPeers[1].Addrs|list|-|Multiaddresses advertising the bootstrap peer|
|ipfs.bootstrap.providerPeers[1].ID|string|`"QmcFmLd5ySfk2WZuJ1mfSWLDjdmHZq7rSAua4GoeSQfs1z"`|Libp2p peer ID for the bootstrap node|
|ipfs.bootstrap.providerPeers[20].Addrs|list|-|Multiaddresses advertising the bootstrap peer|
|ipfs.bootstrap.providerPeers[20].ID|string|`"QmPo1ygpngghu5it8u4Mr3ym6SEU2Wp2wA66Z91Y1S1g29"`|Libp2p peer ID for the bootstrap node|
|ipfs.bootstrap.providerPeers[21].Addrs|list|-|Multiaddresses advertising the bootstrap peer|
|ipfs.bootstrap.providerPeers[21].ID|string|`"QmRjLSisUCHVpFa5ELVvX3qVPfdxajxWJEHs9kN3EcxAW6"`|Libp2p peer ID for the bootstrap node|
|ipfs.bootstrap.providerPeers[22].Addrs|list|-|Multiaddresses advertising the bootstrap peer|
|ipfs.bootstrap.providerPeers[22].ID|string|`"QmPySsdmbczdZYBpbi2oq2WMJ8ErbfxtkG8Mo192UHkfGP"`|Libp2p peer ID for the bootstrap node|
|ipfs.bootstrap.providerPeers[23].Addrs|list|-|Multiaddresses advertising the bootstrap peer|
|ipfs.bootstrap.providerPeers[23].ID|string|`"QmSarArpxemsPESa6FNkmuu9iSE1QWqPX2R3Aw6f5jq4D5"`|Libp2p peer ID for the bootstrap node|
|ipfs.bootstrap.providerPeers[24].Addrs|list|-|Multiaddresses advertising the bootstrap peer|
|ipfs.bootstrap.providerPeers[24].ID|string|`"12D3KooWFFhc8fPYnQXdWBCowxSV21EFYin3rU27p3NVgSMjN41k"`|Libp2p peer ID for the bootstrap node|
|ipfs.bootstrap.providerPeers[25].Addrs|list|-|Multiaddresses advertising the bootstrap peer|
|ipfs.bootstrap.providerPeers[25].ID|string|`"12D3KooWSW4hoHmDXmY5rW7nCi9XmGTy3foFt72u86jNP53LTNBJ"`|Libp2p peer ID for the bootstrap node|
|ipfs.bootstrap.providerPeers[26].Addrs|list|-|Multiaddresses advertising the bootstrap peer|
|ipfs.bootstrap.providerPeers[26].ID|string|`"12D3KooWSDj6JM2JmoHwE9AUUwqAFUEg9ndd3pMA8aF2bkYckZfo"`|Libp2p peer ID for the bootstrap node|
|ipfs.bootstrap.providerPeers[27].Addrs|list|-|Multiaddresses advertising the bootstrap peer|
|ipfs.bootstrap.providerPeers[27].ID|string|`"QmR69wtWUMm1TWnmuD4JqC1TWLZcc8iR2KrTenfZZbiztd"`|Libp2p peer ID for the bootstrap node|
|ipfs.bootstrap.providerPeers[28].Addrs|list|-|Multiaddresses advertising the bootstrap peer|
|ipfs.bootstrap.providerPeers[28].ID|string|`"12D3KooWGASC2jm3pmohEJXUhuStkxDitPgzvs4qMuFPaiD9x1BA"`|Libp2p peer ID for the bootstrap node|
|ipfs.bootstrap.providerPeers[29].Addrs|list|-|Multiaddresses advertising the bootstrap peer|
|ipfs.bootstrap.providerPeers[29].ID|string|`"12D3KooWRbWZN3GvLf9CHmozq4vnTzDD4EEoiqtRJxg5FV6Gfjmm"`|Libp2p peer ID for the bootstrap node|
|ipfs.bootstrap.providerPeers[2].Addrs|list|-|Multiaddresses advertising the bootstrap peer|
|ipfs.bootstrap.providerPeers[2].ID|string|`"QmcfFmzSDVbwexQ9Au2pt5YEXHK5xajwgaU6PpkbLWerMa"`|Libp2p peer ID for the bootstrap node|
|ipfs.bootstrap.providerPeers[30].Addrs|list|-|Multiaddresses advertising the bootstrap peer|
|ipfs.bootstrap.providerPeers[30].ID|string|`"12D3KooWQ85aSCFwFkByr5e3pUCQeuheVhobVxGSSs1DrRQHGv1t"`|Libp2p peer ID for the bootstrap node|
|ipfs.bootstrap.providerPeers[31].Addrs|list|-|Multiaddresses advertising the bootstrap peer|
|ipfs.bootstrap.providerPeers[31].ID|string|`"12D3KooWGtYkBAaqJMJEmywMxaCiNP7LCEFUAFiLEBASe232c2VH"`|Libp2p peer ID for the bootstrap node|
|ipfs.bootstrap.providerPeers[32].Addrs|list|-|Multiaddresses advertising the bootstrap peer|
|ipfs.bootstrap.providerPeers[32].ID|string|`"12D3KooWKNJDVqWKdGH5PJUpgG7JwSQnJCHSt2abfRMht2yjyV5x"`|Libp2p peer ID for the bootstrap node|
|ipfs.bootstrap.providerPeers[33].Addrs|list|-|Multiaddresses advertising the bootstrap peer|
|ipfs.bootstrap.providerPeers[33].ID|string|`"bafzaajaiaejca3eporu7skzkukuie5nopngnubidqmnf57fl3qet7angukq234qj"`|Libp2p peer ID for the bootstrap node|
|ipfs.bootstrap.providerPeers[34].Addrs|list|-|Multiaddresses advertising the bootstrap peer|
|ipfs.bootstrap.providerPeers[34].ID|string|`"bafzaajaiaejcajedrki5t7qmgxzhwr24pfxb5cwrdf5d7rktguqurqztxsbffbvh"`|Libp2p peer ID for the bootstrap node|
|ipfs.bootstrap.providerPeers[35].Addrs|list|-|Multiaddresses advertising the bootstrap peer|
|ipfs.bootstrap.providerPeers[35].ID|string|`"bafzbeibhqavlasjc7dvbiopygwncnrtvjd2xmryk5laib7zyjor6kf3avm"`|Libp2p peer ID for the bootstrap node|
|ipfs.bootstrap.providerPeers[3].Addrs|list|-|Multiaddresses advertising the bootstrap peer|
|ipfs.bootstrap.providerPeers[3].ID|string|`"QmcfJeB3Js1FG7T8YaZATEiaHqNKVdQfybYYkbT1knUswx"`|Libp2p peer ID for the bootstrap node|
|ipfs.bootstrap.providerPeers[4].Addrs|list|-|Multiaddresses advertising the bootstrap peer|
|ipfs.bootstrap.providerPeers[4].ID|string|`"QmcfVvzK4tMdFmpJjEKDUoqRgP4W9FnmJoziYX5GXJJ8eZ"`|Libp2p peer ID for the bootstrap node|
|ipfs.bootstrap.providerPeers[5].Addrs|list|-|Multiaddresses advertising the bootstrap peer|
|ipfs.bootstrap.providerPeers[5].ID|string|`"QmcfZD3VKrUxyP9BbyUnZDpbqDnT7cQ4WjPP8TRLXaoE7G"`|Libp2p peer ID for the bootstrap node|
|ipfs.bootstrap.providerPeers[6].Addrs|list|-|Multiaddresses advertising the bootstrap peer|
|ipfs.bootstrap.providerPeers[6].ID|string|`"QmcfZP2LuW4jxviTeG8fi28qjnZScACb8PEgHAc17ZEri3"`|Libp2p peer ID for the bootstrap node|
|ipfs.bootstrap.providerPeers[7].Addrs|list|-|Multiaddresses advertising the bootstrap peer|
|ipfs.bootstrap.providerPeers[7].ID|string|`"QmcfgsJsMtx6qJb74akCw1M24X1zFwgGo11h1cuhwQjtJP"`|Libp2p peer ID for the bootstrap node|
|ipfs.bootstrap.providerPeers[8].Addrs|list|-|Multiaddresses advertising the bootstrap peer|
|ipfs.bootstrap.providerPeers[8].ID|string|`"Qmcfr2FC7pFzJbTSDfYaSy1J8Uuy8ccGLeLyqJCKJvTHMi"`|Libp2p peer ID for the bootstrap node|
|ipfs.bootstrap.providerPeers[9].Addrs|list|-|Multiaddresses advertising the bootstrap peer|
|ipfs.bootstrap.providerPeers[9].ID|string|`"QmcfR3V5YAtHBzxVACWCzXTt26SyEkxdwhGJ6875A8BuWx"`|Libp2p peer ID for the bootstrap node|
|ipfs.config|object|-|Runtime configuration applied through init script|
|ipfs.config.addrFilters|list|-|Swarm.AddrFilters CIDR entries|
|ipfs.config.api.httpHeaders.accessControlAllowHeaders|list|-|API.HTTPHeaders.Access-Control-Allow-Headers values|
|ipfs.config.api.httpHeaders.accessControlAllowMethods|list|-|API.HTTPHeaders.Access-Control-Allow-Methods values|
|ipfs.config.api.httpHeaders.accessControlAllowOrigin|list|-|API.HTTPHeaders.Access-Control-Allow-Origin values|
|ipfs.config.appendAnnounce|list|-|Base Addresses.AppendAnnounce values. Entries are templated with Helm's tpl.|
|ipfs.config.autoNATServiceMode|string|`"enabled"`|AutoNAT service mode|
|ipfs.config.bloomFilterSize|int|`1048576`|Datastore bloom filter size|
|ipfs.config.clusterPort|int|`9096`|Cluster libp2p port used for announcements|
|ipfs.config.connMgr.gracePeriod|string|`"20s"`|Swarm.ConnMgr.GracePeriod duration|
|ipfs.config.connMgr.highWater|int|`300`|Swarm.ConnMgr.HighWater threshold|
|ipfs.config.connMgr.lowWater|int|`225`|Swarm.ConnMgr.LowWater threshold|
|ipfs.config.datastore.storageMax|string|`""`|Datastore.StorageMax value (e.g. 10Gi). Leave empty to skip.|
|ipfs.config.discovery.mdnsEnabled|bool|`true`|Discovery.MDNS.Enabled toggle|
|ipfs.config.extraAppendAnnounce|list|-|Additional Addresses.AppendAnnounce entries appended after the defaults|
|ipfs.config.gateway.publicGateways|object|-|Gateway.PublicGateways overrides|
|ipfs.config.gateway.rootRedirect|string|`""`|Gateway.RootRedirect target|
|ipfs.config.gatewayPort|int|`8888`|Gateway TCP port|
|ipfs.config.noAnnounce|list|-|Addresses.NoAnnounce CIDR entries|
|ipfs.config.profile|string|`"server"`|IPFS profile applied during initialization|
|ipfs.config.resourceMgr.maxMemory|string|`""`|Swarm.ResourceMgr.MaxMemory value in bytes. Leave empty to skip.|
|ipfs.config.routing.acceleratedDHTClient|bool|`true`|Routing.AcceleratedDHTClient toggle|
|ipfs.config.swarm.disableNatPortMap|bool|`false`|Swarm.DisableNatPortMap toggle|
|ipfs.config.swarm.enableHolePunching|bool|`false`|Swarm.EnableHolePunching toggle|
|ipfs.config.swarm.relay.clientEnabled|bool|`false`|Swarm.RelayClient.Enabled toggle|
|ipfs.config.swarm.relay.network|bool|`false`|Swarm.Transports.Network.Relay toggle|
|ipfs.config.swarm.relay.serviceEnabled|bool|`false`|Swarm.RelayService.Enabled toggle|
|ipfs.config.swarm.transports.quic|bool|`true`|Swarm.Transports.Network.QUIC toggle|
|ipfs.config.swarmPort|int|`4001`|Swarm TCP port|
|ipfs.containerSecurityContext|object|-|Container-level security context overrides|
|ipfs.customCommand|list|-|Extra commands to override the default entrypoint|
|ipfs.extraArgs|list|-|Additional arguments passed to the container command|
|ipfs.extraContainers|list|-|Additional containers to inject into the pod|
|ipfs.extraEnv|list|-|Additional environment variables for the IPFS container|
|ipfs.extraVolumeMounts|list|-|Additional volume mounts for the IPFS container|
|ipfs.extraVolumes|object|-|Additional volumes for the pod|
|ipfs.image.pullPolicy|string|`"IfNotPresent"`|IPFS image pull policy|
|ipfs.image.registry|string|`"docker.io"`|IPFS image registry|
|ipfs.image.repository|string|`"ipfs/kubo"`|IPFS image repository|
|ipfs.image.tag|string|`"v0.38.2"`|IPFS image tag|
|ipfs.initContainers|list|-|Additional init containers|
|ipfs.initScripts|map|-|Init scripts injected via ConfigMap (filename => script contents). Keys must match ^[A-Za-z0-9_.-]+$|
|ipfs.nodeSelector|object|-|Node selector|
|ipfs.podAnnotations|object|-|Additional pod annotations|
|ipfs.podLabels|object|-|Additional pod labels|
|ipfs.podLabels."app.kubernetes.io/component"|string|`"ipfs"`|Component label identifying pods as IPFS daemons|
|ipfs.podSecurityContext|object|-|Pod-level security context overrides|
|ipfs.resources|object|-|Resource requests and limits|
|ipfs.runtime.goMemLimit|string|`""`|Optional GOMEMLIMIT value for the IPFS container (e.g. "1024MiB")|
|ipfs.service.annotations|object|-|Additional annotations for the IPFS service|
|ipfs.service.ports|object|-|Service ports exposed by the IPFS peers|
|ipfs.service.ports.api|int|`5001`|API port|
|ipfs.service.ports.gateway|int|`8080`|Gateway port|
|ipfs.service.ports.mdns|int|`5353`|MDNS port|
|ipfs.service.ports.swarmTcp|int|`4001`|Swarm TCP port|
|ipfs.service.ports.swarmUdp|int|`4001`|Swarm UDP port|
|ipfs.service.ports.ws|int|`8081`|Websocket port|
|ipfs.service.type|string|`"ClusterIP"`|Service type for IPFS API/gateway|
|ipfs.storage.storageClassName|string|`""`|StorageClass for the IPFS data PVC|
|ipfs.storage.volumeSize|string|`"10Gi"`|Requested storage size for the IPFS data PVC|
|ipfs.swarmKey.enabled|bool|`false`|Mount a swarm.key secret and copy it into the repo|
|ipfs.swarmKey.mountPath|string|`"/etc/ipfs/swarm"`|Mount path for the swarm key secret inside the pod|
|ipfs.swarmKey.repoPath|string|`"/data/ipfs"`|Destination directory for the swarm key inside the repo|
|ipfs.swarmKey.secretKey|string|`"swarm.key"`|Key within the secret that holds the swarm key|
|ipfs.swarmKey.secretName|string|`""`|Kubernetes secret name containing swarm.key|
|ipfs.tolerations|list|-|Tolerations|
|nameOverride|string|`""`|Override for chart name|
|openShiftRoute|object|-|OpenShift route configuration|
|openShiftRoute.annotations|object|-|Additional annotations merged into every Route|
|openShiftRoute.enabled|bool|`false`|Enable OpenShift Routes instead of ingress|
|openShiftRoute.host|string|`"ipfs-cluster.k8s.orb.local"`|Global host applied to every rendered Route (per-route host overrides are optional)|
|openShiftRoute.routes|object|-|Route entries keyed by logical name; set enabled: false to skip a route|
|openShiftRoute.routes.api.enabled|bool|`true`|Enable the REST API Route|
|openShiftRoute.routes.api.nameSuffix|string|`"api"`|Suffix appended to the REST API Route name|
|openShiftRoute.routes.api.path|string|`"/?(api/((.*[^/])?)?)"`|HTTP path matched by the REST API Route|
|openShiftRoute.routes.api.service.port|string|`"proxy"`|Named service port exposed through the REST API Route|
|openShiftRoute.routes.api.service.target|string|`"cluster"`|Backend service used by the REST API Route|
|openShiftRoute.routes.cluster.enabled|bool|`true`|Enable the cluster Route exposing REST endpoints|
|openShiftRoute.routes.cluster.nameSuffix|string|`"cluster"`|Suffix appended to the generated Route name|
|openShiftRoute.routes.cluster.path|string|`"/?cluster/(((.*[^/])?)?)"`|HTTP path matched by the cluster Route|
|openShiftRoute.routes.cluster.service.port|string|`"api"`|Named service port exposed through the cluster Route|
|openShiftRoute.routes.cluster.service.target|string|`"cluster"`|Backend service used by the cluster Route|
|openShiftRoute.routes.pinning.enabled|bool|`true`|Enable the pinning Route|
|openShiftRoute.routes.pinning.nameSuffix|string|`"pinning"`|Suffix appended to the pinning Route name|
|openShiftRoute.routes.pinning.path|string|`"/?pinning/(((.*[^/])?)?)"`|HTTP path matched by the pinning Route|
|openShiftRoute.routes.pinning.service.port|string|`"pinning"`|Named service port exposed through the pinning Route|
|openShiftRoute.routes.pinning.service.target|string|`"cluster"`|Backend service handling pinning requests|
|openShiftRoute.routes.ws.enabled|bool|`true`|Enable the WebSocket Route|
|openShiftRoute.routes.ws.nameSuffix|string|`"ws"`|Suffix appended to the WebSocket Route name|
|openShiftRoute.routes.ws.path|string|`"/?ws/(((.*[^/])?)?)"`|HTTP path matched by the WebSocket Route|
|openShiftRoute.routes.ws.service.port|string|`"ws"`|Named service port exposed through the WebSocket Route|
|openShiftRoute.routes.ws.service.target|string|`"ipfs"`|Backend service handling WebSocket requests|
|openShiftRoute.tls|object|-|TLS configuration applied when TLS is desired|
|openShiftRoute.wildcardPolicy|string|`"None"`|Wildcard policy used when a Route does not override it|
|p2pNodePort|object|-|Configuration for the optional NodePort service used for public P2P addresses|
|p2pNodePort.annotations|object|-|Additional annotations for the NodePort service|
|p2pNodePort.enabled|bool|`false`|Enable creation of a NodePort service for the swarm port|
|p2pNodePort.externalTrafficPolicy|string|`"Cluster"`|ExternalTrafficPolicy for the NodePort service|
|p2pNodePort.hostIP.fieldPath|string|`"status.hostIP"`|Pod fieldRef used to resolve the host IP when value is empty|
|p2pNodePort.hostIP.value|string|`""`|Optional static IP address to advertise. When set, overrides fieldRef detection.|
|p2pNodePort.nodePort|int|`32000`|Static nodePort to announce when enabled|
|replicaCount|int|`1`|Number of IPFS peers and cluster members|
|serviceAccount|object|-|Service account configuration|
|serviceAccount.annotations|object|-|Service account annotations|
|serviceAccount.create|bool|`true`|Create the service account|
|serviceAccount.name|string|`""`|Service account name override|
|sharedSecret|string|`""`|Shared secret for cluster peers. Leave empty to auto-generate.|
|tests|object|-|Test hook image configuration|
|tests.image.pullPolicy|string|`"IfNotPresent"`|Test image pull policy|
|tests.image.registry|string|`"docker.io"`|Test image registry|
|tests.image.repository|string|`"busybox"`|Test image repository|
|tests.image.tag|string|`"1.37"`|Test image tag|

## Resource Summary

| Component | Replicas | Request CPU | Limit CPU | Request Memory | Limit Memory | Storage |
|-----------|----------|-------------|-----------|----------------|--------------|---------|
| **Totals** | - | - | - | - | - | - |


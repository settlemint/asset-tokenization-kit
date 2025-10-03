# ipfs

![Version: 2.0.0-alpha.18](https://img.shields.io/badge/Version-2.0.0--alpha.18-informational?style=flat-square) ![Type: application](https://img.shields.io/badge/Type-application-informational?style=flat-square) ![AppVersion: 2.0.0-alpha.18](https://img.shields.io/badge/AppVersion-2.0.0--alpha.18-informational?style=flat-square)

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
|cluster.image.registry|string|`"harbor.settlemint.com/docker.io"`|Cluster image registry|
|cluster.image.repository|string|`"ipfs/ipfs-cluster"`|Cluster image repository|
|cluster.image.tag|string|`"v1.1.4"`|Cluster image tag|
|cluster.nodeSelector|object|-|Node selector|
|cluster.podAnnotations|object|-|Additional pod annotations|
|cluster.podLabels|object|-|Additional pod labels|
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
|ingress.pathGroups|object|-|Path groups rendered for each hostname key|
|ingress.tls|list|-|TLS configuration for the ingress|
|ipfs|object|-|IPFS (Kubo) peer configuration|
|ipfs.affinity|object|-|Affinity rules|
|ipfs.bootstrap.includeProviderPeers|bool|`true`|Include providerPeers in bootstrap and peering configuration|
|ipfs.bootstrap.nodePeers|list|-|Custom bootstrap peers added to the node. Objects must define ID and Addrs.|
|ipfs.bootstrap.providerPeers|list|-|Default provider peers added when includeProviderPeers is true.|
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
|ipfs.image.registry|string|`"harbor.settlemint.com/docker.io"`|IPFS image registry|
|ipfs.image.repository|string|`"ipfs/kubo"`|IPFS image repository|
|ipfs.image.tag|string|`"v0.38.0"`|IPFS image tag|
|ipfs.initContainers|list|-|Additional init containers|
|ipfs.initScripts|map|-|Init scripts injected via ConfigMap (filename => script contents). Keys must match ^[A-Za-z0-9_.-]+$|
|ipfs.nodeSelector|object|-|Node selector|
|ipfs.podAnnotations|object|-|Additional pod annotations|
|ipfs.podLabels|object|-|Additional pod labels|
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
|tests.image.registry|string|`"harbor.settlemint.com/docker.io"`|Test image registry|
|tests.image.repository|string|`"busybox"`|Test image repository|
|tests.image.tag|string|`"1.37"`|Test image tag|

## Resource Summary

| Component | Replicas | Request CPU | Limit CPU | Request Memory | Limit Memory | Storage |
|-----------|----------|-------------|-----------|----------------|--------------|---------|

| **Totals** | - | - | - | - | - | - |


# Besu Genesis

The source of this chart is
https://github.com/Consensys/quorum-kubernetes/tree/master/helm/charts/besu-genesis
As it is not published in any Helm repository, we have to copy it here.

It has been adjusted to work with the SettleMint Asset Tokenization Kit.

## Genesis File Storage

This chart stores genesis files in a PersistentVolumeClaim to handle files of any size, including large genesis files that exceed Kubernetes ConfigMap size limits.

### Storage Method

- **All genesis files**: Stored in PersistentVolumeClaim `besu-genesis-pvc`
- **Access Mode**: ReadWriteMany for sharing across multiple Besu nodes
- **Automatic Integration**: Besu nodes automatically retrieve genesis files via init containers

### Storage Configuration

Configure storage settings in values.yaml:

```yaml
storage:
  storageClassName: "fast-ssd"  # Optional: specify storage class
  size: "1Gi"                   # Size for PVC
```

### How It Works

1. **Genesis Creation**: The genesis job creates the genesis file and stores it in the PVC
2. **Besu Node Integration**: Each Besu node uses an init container to retrieve the genesis file from the PVC
3. **Shared Access**: Multiple Besu nodes can access the same genesis file simultaneously

### Integration with Besu Nodes

The besu-node chart automatically includes the necessary init container to retrieve the genesis file from the PVC. No additional configuration is required - the genesis file is available at `/shared/genesis.json` in the Besu container.

## License

This chart is licensed under the Apache License 2.0 - see the LICENSE file for
details.

# Besu Genesis

The source of this chart is
https://github.com/Consensys/quorum-kubernetes/tree/master/helm/charts/besu-genesis
As it is not published in any Helm repository, we have to copy it here.

It has been adjusted to work with the SettleMint Asset Tokenization Kit.

## Genesis File Storage

This chart stores genesis files in a PersistentVolumeClaim to handle files of any size, including large genesis files that exceed Kubernetes ConfigMap size limits.

### Universal Storage Approach

This chart automatically adapts to any Kubernetes environment without requiring manual configuration:

- **Genesis Storage**: Stored in PersistentVolumeClaim `besu-genesis-pvc` with ReadWriteOnce access (compatible with all storage classes)
- **Genesis Server**: HTTP server (`besu-genesis-server`) serves the genesis file to multiple nodes
- **Automatic Fallback**: Besu nodes use intelligent retrieval with multiple fallback methods
- **Zero Configuration**: Works with any storage class (local-path, EBS, Azure Disk, etc.) without manual setup

### Storage Configuration

Configure storage settings in values.yaml:

```yaml
storage:
  storageClassName: "fast-ssd"  # Optional: specify storage class
  size: "1Gi"                   # Size for PVC
```

### How It Works

1. **Genesis Creation**: The genesis job creates the genesis file and stores it in the PVC (ReadWriteOnce)
2. **Genesis Server**: A dedicated HTTP server mounts the PVC and serves the genesis file
3. **Smart Retrieval**: Each Besu node uses an init container with intelligent fallback:
   - **Method 1**: HTTP download from genesis server (fastest, works universally)
   - **Method 2**: Direct PVC access via temporary pod (fallback)
   - **Method 3**: Extended retry with HTTP server (for slow environments)
4. **Shared Access**: Multiple Besu nodes can access the same genesis file via the HTTP server

### Automatic Compatibility

The chart automatically works with:
- ✅ **Local development** (local-path, hostPath storage)
- ✅ **Cloud providers** (EBS, Azure Disk, GCE PD)
- ✅ **Network storage** (NFS, Ceph, etc.)
- ✅ **Any storage class** that supports ReadWriteOnce

### Integration with Besu Nodes

The besu-node chart automatically includes the necessary init container to retrieve the genesis file using intelligent fallback methods. No additional configuration is required - the genesis file is available at `/shared/genesis.json` in the Besu container.

### Benefits

- 🚀 **Zero Configuration**: Works out-of-the-box with any Kubernetes environment
- 🔄 **Intelligent Fallback**: Multiple retrieval methods ensure reliability
- 📦 **Universal Compatibility**: Supports all storage classes and providers
- ⚡ **Optimized Performance**: HTTP delivery is fastest for most scenarios
- 🛡️ **Robust Error Handling**: Detailed logging and graceful degradation

## License

This chart is licensed under the Apache License 2.0 - see the LICENSE file for
details.

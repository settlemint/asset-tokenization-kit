# config-expert

Configuration and environment management specialist for Asset Tokenization Kit.

## Core Responsibilities

- **Environment Management**: Multi-environment configuration strategies
- **Secret Management**: Secure handling of sensitive data
- **Feature Flags**: Dynamic feature toggles
- **Deployment Configs**: Environment-specific settings

## Required Context7 Documentation

```typescript
// Fetch configuration libraries
const vaultDocs = await mcp__context7__get_library_docs({
  context7CompatibleLibraryID: "/hashicorp/vault",
  topic: "secrets management",
  tokens: 3000,
});
```

## ATK Configuration Architecture

### Environment Structure

```
kit/
├── .env.example          # Template with all variables
├── .env.local           # Local development (gitignored)
├── .env.development     # Development defaults
├── .env.staging         # Staging environment
├── .env.production      # Production environment
└── config/
    ├── chains.ts        # Chain-specific configurations
    ├── contracts.ts     # Contract addresses by environment
    └── features.ts      # Feature flag definitions
```

### Type-Safe Environment Variables

```typescript
// kit/dapp/src/config/env.ts
import { z } from "zod";

// Define schema for all env vars
const envSchema = z.object({
  // App
  NODE_ENV: z.enum(["development", "staging", "production"]),
  NEXT_PUBLIC_APP_URL: z.string().url(),

  // Blockchain
  NEXT_PUBLIC_CHAIN_ID: z.string().transform(Number),
  NEXT_PUBLIC_RPC_URL: z.string().url(),
  NEXT_PUBLIC_EXPLORER_URL: z.string().url(),

  // API
  API_BASE_URL: z.string().url(),
  API_KEY: z.string().min(32),

  // Database
  DATABASE_URL: z.string(),
  DATABASE_POOL_SIZE: z.string().transform(Number).default("10"),

  // Monitoring
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),

  // Feature Flags
  NEXT_PUBLIC_FEATURE_STAKING: z
    .enum(["true", "false"])
    .transform((v) => v === "true"),
  NEXT_PUBLIC_FEATURE_GOVERNANCE: z
    .enum(["true", "false"])
    .transform((v) => v === "true"),
});

// Validate and export typed env
export const env = envSchema.parse(process.env);

// Type for autocomplete
export type Env = z.infer<typeof envSchema>;
```

### Multi-Chain Configuration

```typescript
// kit/dapp/src/config/chains.ts

export interface ChainConfig {
  id: number;
  name: string;
  rpcUrl: string;
  explorerUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  contracts: {
    tokenFactory: Address;
    multicall: Address;
    [key: string]: Address;
  };
}

export const CHAINS: Record<number, ChainConfig> = {
  1: {
    id: 1,
    name: "Ethereum Mainnet",
    rpcUrl: env.ETHEREUM_RPC_URL,
    explorerUrl: "https://etherscan.io",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    contracts: {
      tokenFactory: "0x...",
      multicall: "0x...",
    },
  },
  // ... other chains
};

// Get current chain config
export const getCurrentChain = (): ChainConfig => {
  const chain = CHAINS[env.NEXT_PUBLIC_CHAIN_ID];
  if (!chain) {
    throw new Error(`Chain ${env.NEXT_PUBLIC_CHAIN_ID} not configured`);
  }
  return chain;
};
```

### Secret Management

```typescript
// kit/dapp/src/config/secrets.ts

// Secure secret rotation
export class SecretManager {
  private static instance: SecretManager;
  private secrets: Map<string, string> = new Map();
  private rotationCallbacks: Map<string, () => Promise<void>> = new Map();

  static getInstance(): SecretManager {
    if (!this.instance) {
      this.instance = new SecretManager();
    }
    return this.instance;
  }

  async getSecret(key: string): Promise<string> {
    // Check cache first
    if (this.secrets.has(key)) {
      return this.secrets.get(key)!;
    }

    // Fetch from secure storage (e.g., HashiCorp Vault)
    const secret = await this.fetchFromVault(key);
    this.secrets.set(key, secret);

    return secret;
  }

  registerRotationCallback(key: string, callback: () => Promise<void>) {
    this.rotationCallbacks.set(key, callback);
  }

  private async fetchFromVault(key: string): Promise<string> {
    // Implementation depends on secret management solution
    // This is a placeholder
    return process.env[key] || "";
  }
}

// Usage
const secretManager = SecretManager.getInstance();
const apiKey = await secretManager.getSecret("EXTERNAL_API_KEY");
```

### Feature Flags

```typescript
// kit/dapp/src/config/features.ts

export interface FeatureFlag {
  key: string;
  description: string;
  defaultValue: boolean;
  environments: {
    development: boolean;
    staging: boolean;
    production: boolean;
  };
}

export const FEATURE_FLAGS: Record<string, FeatureFlag> = {
  STAKING: {
    key: "STAKING",
    description: "Enable token staking functionality",
    defaultValue: false,
    environments: {
      development: true,
      staging: true,
      production: false,
    },
  },
  GOVERNANCE: {
    key: "GOVERNANCE",
    description: "Enable DAO governance features",
    defaultValue: false,
    environments: {
      development: true,
      staging: false,
      production: false,
    },
  },
};

// Feature flag hook
export const useFeatureFlag = (key: keyof typeof FEATURE_FLAGS): boolean => {
  const flag = FEATURE_FLAGS[key];
  if (!flag) return false;

  // Check environment override first
  const envOverride = process.env[`NEXT_PUBLIC_FEATURE_${key}`];
  if (envOverride !== undefined) {
    return envOverride === "true";
  }

  // Use environment-specific value
  return flag.environments[env.NODE_ENV] ?? flag.defaultValue;
};
```

### Deployment Configuration

```yaml
# kit/config/deployment.yaml
deployments:
  development:
    replicas: 1
    resources:
      requests:
        memory: "512Mi"
        cpu: "250m"
      limits:
        memory: "1Gi"
        cpu: "500m"
    env:
      LOG_LEVEL: "debug"

  staging:
    replicas: 2
    resources:
      requests:
        memory: "1Gi"
        cpu: "500m"
      limits:
        memory: "2Gi"
        cpu: "1000m"
    env:
      LOG_LEVEL: "info"

  production:
    replicas: 3
    autoscaling:
      enabled: true
      minReplicas: 3
      maxReplicas: 10
      targetCPUUtilizationPercentage: 70
    resources:
      requests:
        memory: "2Gi"
        cpu: "1000m"
      limits:
        memory: "4Gi"
        cpu: "2000m"
    env:
      LOG_LEVEL: "warn"
```

### Configuration Validation

```typescript
// kit/dapp/src/config/validate.ts

export const validateConfig = () => {
  const errors: string[] = [];

  // Validate RPC URLs are accessible
  Object.values(CHAINS).forEach((chain) => {
    if (!isValidUrl(chain.rpcUrl)) {
      errors.push(`Invalid RPC URL for chain ${chain.id}`);
    }
  });

  // Validate contract addresses
  Object.values(CHAINS).forEach((chain) => {
    Object.entries(chain.contracts).forEach(([name, address]) => {
      if (!isAddress(address)) {
        errors.push(`Invalid ${name} address for chain ${chain.id}`);
      }
    });
  });

  // Validate feature flag consistency
  Object.entries(FEATURE_FLAGS).forEach(([key, flag]) => {
    if (flag.environments.production && !flag.environments.staging) {
      errors.push(`Feature ${key} enabled in production but not staging`);
    }
  });

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join("\n")}`);
  }
};
```

## Integration Points

- **With all agents**: Provide environment-specific configurations
- **With devops**: Kubernetes ConfigMaps and Secrets
- **With ci-cd-expert**: Environment promotion workflows
- **With security-auditor**: Secret scanning and rotation

## Best Practices

1. **Never commit secrets**: Use .env.example as template
2. **Validate early**: Check config at startup
3. **Type everything**: No string-based config access
4. **Fail fast**: Invalid config should prevent startup
5. **Audit changes**: Log all config modifications

## Return Format

Follow `.claude/orchestration/context-management.ts` AgentOutput interface.

### Example Output

```yaml
taskCompletion:
  status: completed
summary:
  primaryOutcome: "Implemented type-safe multi-environment configuration"
  confidenceLevel: high
  keyDecisions:
    - "Used Zod for runtime validation of environment variables"
    - "Implemented feature flags with per-environment overrides"
deliverables:
  filesModified:
    - path: /kit/dapp/src/config/env.ts
      specificChanges: "Added type-safe environment variable schema"
    - path: /kit/dapp/src/config/features.ts
      specificChanges: "Created feature flag system with React hooks"
  configurationsChanged:
    - file: .env.example
      changes:
        NEXT_PUBLIC_FEATURE_STAKING: "false"
        NEXT_PUBLIC_FEATURE_GOVERNANCE: "false"
contextHandoff:
  readyForAgents:
    - agent: devops
      task: "Create Kubernetes ConfigMaps from environment configs"
    - agent: ci-cd-expert
      task: "Add config validation to deployment pipeline"
```

## Model Selection

**Default Model**: sonnet - Configuration follows templates

### When to Use Opus
- Task requires deep analysis or reasoning
- Security implications present
- Novel problem without established patterns
- Cross-system integration complexity

### When to Use Sonnet  
- Standard pattern implementation
- Well-defined requirements with clear examples
- Time-sensitive tasks with established patterns
- Parallel execution with other agents
- High-volume repetitive tasks

### Model Override Examples

```yaml
# Complex task requiring Opus
task: "Analyze and optimize system architecture"
model: opus
reason: "Requires deep analysis and cross-cutting concerns"

# Simple task suitable for Sonnet
task: "Update configuration file with new environment variable"
model: sonnet
reason: "Straightforward change following established patterns"
```

### Parallel Execution Optimization

When running in parallel with other agents:
- Use Sonnet for faster response times if task complexity allows
- Reserve Opus for critical path items that block other agents
- Consider token budget when multiple agents use Opus simultaneously

# System Integration Documentation

This document details the cross-component integration patterns, data flows, and architectural decisions implemented in the SettleMint Asset Tokenization Kit.

## Architecture Overview

The Asset Tokenization Kit follows a **microservices architecture** with clear separation between frontend, blockchain, and supporting services, all orchestrated via Docker Compose for local development and Kubernetes for production.

### Core Integration Principles

1. **Type-Safe RPC**: ORPC for server-client communication with full TypeScript support
2. **Event-Driven Indexing**: The Graph Protocol for blockchain event processing
3. **GraphQL Federation**: Hasura for unified data access across services
4. **Container Orchestration**: Docker Compose locally, Helm charts for Kubernetes
5. **Multi-Chain Support**: Unified interface for EVM-compatible blockchains

## Component Communication Patterns

### 1. Frontend ↔ Backend Integration

**Protocol**: ORPC (Observable RPC) over HTTP/WebSocket

```typescript
// Frontend: ORPC client setup (kit/dapp/src/orpc/index.ts)
export const client = createORPCClient<typeof serverRouter>({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: () => ({
    'Content-Type': 'application/json',
  }),
});

// Backend: ORPC task definition (kit/dapp/src/tasks/assets/bond.create.ts)
export const createBondTask = orpc
  .input(createBondSchema)
  .handler(async ({ input, context }) => {
    const { db, contracts } = context;
    
    // Validate user permissions
    const user = await validateUser(context);
    
    // Deploy bond contract
    const txHash = await contracts.deployBond({
      name: input.name,
      symbol: input.symbol,
      interestRate: input.interestRate,
      maturityDate: input.maturityDate,
    });
    
    // Store in database
    const bond = await db.insert(bonds).values({
      ...input,
      txHash,
      userId: user.id,
      status: 'DEPLOYING',
    }).returning();
    
    return bond[0];
  });

// Frontend usage with type safety
const bond = await client.assets.bond.create({
  name: 'Corporate Bond 2024',
  symbol: 'CB24',
  interestRate: 5.5,
  maturityDate: new Date('2024-12-31'),
});
```

**Key Integration Points**:
- Authentication via session cookies
- Automatic type inference from server to client
- Real-time updates via WebSocket subscriptions
- Error handling with typed error responses

### 2. Frontend ↔ Blockchain Integration

**Multi-Service Approach**: Direct Web3 + TX Signer Service

```typescript
// Direct blockchain interaction (kit/dapp/src/lib/web3.ts)
import { createPublicClient, createWalletClient, http } from 'viem';
import { anvil } from 'viem/chains';

export const publicClient = createPublicClient({
  chain: anvil,
  transport: http('http://localhost:8545'),
});

export const walletClient = createWalletClient({
  chain: anvil,
  transport: http('http://localhost:8545'),
});

// TX Signer integration for managed wallets
export async function deployWithTxSigner(contractData: ContractDeployData) {
  const response = await fetch('http://localhost:8547/deploy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify({
      abi: contractData.abi,
      bytecode: contractData.bytecode,
      args: contractData.constructorArgs,
    }),
  });
  
  const { txHash, contractAddress } = await response.json();
  return { txHash, contractAddress };
}
```

**Supported Networks**:
- Local development: Anvil (Foundry)
- EVM-compatible: Ethereum, Polygon, BSC, Arbitrum, etc.
- Private networks: Besu, Quorum
- Each network configured via environment variables

### 3. Blockchain ↔ Indexing Integration

**The Graph Protocol**: Real-time blockchain event indexing

```yaml
# Subgraph manifest (kit/subgraph/subgraph.yaml)
specVersion: 0.0.4
schema:
  file: ./schema.graphql
dataSources:
  - kind: ethereum
    name: SystemFactory
    network: localhost
    source:
      address: "0x5FbDB2315678afecb367f032d93F642f64180aa3"
      abi: SystemFactory
    mapping:
      kind: ethereum/events
      apiVersion: 0.0.6
      language: wasm/assemblyscript
      entities:
        - System
        - Token
        - Account
      abis:
        - name: SystemFactory
          file: ./abis/SystemFactory.json
      eventHandlers:
        - event: SystemCreated(address,address)
          handler: handleSystemCreated
      file: ./src/system-factory/system-factory.ts
```

```typescript
// Event handler (kit/subgraph/src/token/token.ts)
export function handleTransfer(event: Transfer): void {
  // Load or create account entities
  let from = Account.load(event.params.from.toHex());
  if (!from) {
    from = new Account(event.params.from.toHex());
    from.save();
  }
  
  let to = Account.load(event.params.to.toHex());
  if (!to) {
    to = new Account(event.params.to.toHex());
    to.save();
  }
  
  // Create transfer entity
  let transfer = new TokenTransfer(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  );
  transfer.token = event.address.toHex();
  transfer.from = from.id;
  transfer.to = to.id;
  transfer.value = event.params.value;
  transfer.timestamp = event.block.timestamp;
  transfer.save();
  
  // Update token statistics
  updateTokenStats(event.address, event.params.value);
}
```

### 4. Data Aggregation via Hasura

**GraphQL Federation**: Unified API across multiple data sources

```graphql
# Hasura metadata configuration
type Query {
  # From PostgreSQL
  users: [User!]!
  assets: [Asset!]!
  
  # From The Graph
  tokenTransfers: [TokenTransfer!]!
  tokenBalances: [TokenBalance!]!
  
  # Computed fields
  userPortfolio(userId: ID!): Portfolio!
}

type Portfolio {
  user: User!
  assets: [Asset!]!
  totalValue: BigDecimal!
  transactions: [TokenTransfer!]!
}
```

```typescript
// Frontend query using federated data
const PORTFOLIO_QUERY = gql`
  query GetPortfolio($userId: ID!) {
    userPortfolio(userId: $userId) {
      totalValue
      assets {
        id
        name
        type
        balance
        currentPrice
      }
      transactions(last: 10) {
        id
        from
        to
        value
        timestamp
      }
    }
  }
`;
```

### 5. Service Discovery & Communication

**Docker Compose Networking**: Service-to-service communication

```yaml
# Docker service definitions (docker-compose.yml)
services:
  anvil:
    container_name: atk-anvil
    networks:
      - atk-network
    
  postgres:
    container_name: atk-postgres
    networks:
      - atk-network
      
  hasura:
    container_name: atk-hasura
    environment:
      HASURA_GRAPHQL_DATABASE_URL: postgresql://postgres:postgres@postgres:5432/atk
      HASURA_GRAPHQL_ENABLE_CONSOLE: "true"
    depends_on:
      - postgres
    networks:
      - atk-network
      
networks:
  atk-network:
    driver: bridge
```

Service URLs in local development:
- Frontend: http://localhost:5173
- Anvil RPC: http://anvil:8545 (internal), http://localhost:8545 (external)
- PostgreSQL: postgresql://postgres:5432
- Hasura GraphQL: http://hasura:8080/v1/graphql
- TX Signer: http://txsigner:3000
- The Graph: http://graph-node:8000

## Data Flow Patterns

### 1. Asset Creation Flow

```
User Input (Frontend)
    ↓
ORPC Task (Validation & Processing)
    ↓
TX Signer (Transaction Creation)
    ↓
Blockchain (Contract Deployment)
    ↓
Event Emission
    ↓
The Graph (Event Indexing)
    ↓
Database Update (PostgreSQL)
    ↓
UI Update (Real-time)
```

### 2. Portfolio Query Flow

```
Frontend Request
    ↓
Hasura GraphQL
    ├── PostgreSQL (User & Asset Data)
    └── The Graph (On-chain Data)
         ↓
    Data Federation
         ↓
    Response with Combined Data
```

### 3. Transaction Processing Flow

```typescript
// Complete transaction flow example
export async function processAssetTransfer(
  fromUserId: string,
  toUserId: string,
  assetId: string,
  amount: bigint
) {
  // 1. Validate in database
  const asset = await db.query.assets.findFirst({
    where: eq(assets.id, assetId),
  });
  
  if (!asset) throw new Error('Asset not found');
  
  // 2. Check balance via The Graph
  const balance = await graphClient.query({
    query: GET_BALANCE,
    variables: { 
      token: asset.contractAddress,
      account: fromUserId,
    },
  });
  
  if (balance.data.tokenBalance.value < amount) {
    throw new Error('Insufficient balance');
  }
  
  // 3. Execute blockchain transaction
  const txHash = await txSigner.transfer({
    token: asset.contractAddress,
    from: fromUserId,
    to: toUserId,
    amount: amount.toString(),
  });
  
  // 4. Store pending transaction
  await db.insert(transactions).values({
    assetId,
    fromUserId,
    toUserId,
    amount: amount.toString(),
    txHash,
    status: 'PENDING',
  });
  
  // 5. Wait for confirmation (via event)
  // The Graph will index the Transfer event
  // and update our database via webhook
  
  return { txHash };
}
```

## Authentication & Authorization

### 1. User Authentication

```typescript
// Authentication configuration (kit/dapp/src/providers/auth.tsx)
export const authConfig: AuthConfig = {
  providers: [
    // Email/Password with Drizzle ORM
    CredentialsProvider({
      async authorize(credentials) {
        const user = await db.query.users.findFirst({
          where: eq(users.email, credentials.email),
        });
        
        if (!user) return null;
        
        const valid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );
        
        if (!valid) return null;
        
        return {
          id: user.id,
          email: user.email,
          role: user.role,
        };
      },
    }),
    
    // Web3 Wallet
    Web3Provider({
      async verify(address, signature, message) {
        const valid = await verifyMessage({
          address,
          message,
          signature,
        });
        
        if (!valid) return null;
        
        // Find or create user
        let user = await db.query.users.findFirst({
          where: eq(users.walletAddress, address),
        });
        
        if (!user) {
          const [newUser] = await db.insert(users).values({
            walletAddress: address,
            role: 'USER',
          }).returning();
          user = newUser;
        }
        
        return {
          id: user.id,
          address: user.walletAddress,
          role: user.role,
        };
      },
    }),
  ],
  
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
};
```

### 2. Role-Based Access Control

```typescript
// RBAC middleware for ORPC tasks
export const requireRole = (role: UserRole) => {
  return orpc.middleware(async ({ context, next }) => {
    const user = await getUserFromSession(context);
    
    if (!user) {
      throw new Error('Unauthorized');
    }
    
    if (!hasRole(user, role)) {
      throw new Error('Insufficient permissions');
    }
    
    return next({ context: { ...context, user } });
  });
};

// Usage in tasks
export const adminTask = orpc
  .use(requireRole('ADMIN'))
  .input(z.object({ action: z.string() }))
  .handler(async ({ input, context }) => {
    // Only admins can execute this
    return performAdminAction(input.action);
  });
```

## Error Handling & Resilience

### 1. Transaction Retry Logic

```typescript
// Retry mechanism for blockchain operations
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number;
    delay?: number;
    backoff?: number;
  } = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delay = 1000,
    backoff = 2,
  } = options;
  
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on permanent errors
      if (isPermanentError(error)) {
        throw error;
      }
      
      if (attempt < maxAttempts) {
        const waitTime = delay * Math.pow(backoff, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  throw lastError!;
}

// Usage
const result = await withRetry(
  () => deployContract(contractData),
  { maxAttempts: 5, delay: 2000 }
);
```

### 2. Circuit Breaker Pattern

```typescript
// Circuit breaker for external services
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  
  constructor(
    private threshold = 5,
    private timeout = 60000, // 1 minute
    private resetTimeout = 30000 // 30 seconds
  ) {}
  
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }
    
    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  private onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
  }
  
  private onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.threshold) {
      this.state = 'OPEN';
    }
  }
}

// Usage with The Graph
const graphBreaker = new CircuitBreaker();

export async function querySubgraph(query: string, variables: any) {
  return graphBreaker.execute(async () => {
    const response = await fetch(SUBGRAPH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
    });
    
    if (!response.ok) {
      throw new Error(`Subgraph error: ${response.statusText}`);
    }
    
    return response.json();
  });
}
```

## Monitoring & Observability

### 1. Health Checks

```typescript
// Service health checks (integrated into Docker Compose)
export const healthRouter = orpc.router({
  check: orpc
    .handler(async ({ context }) => {
      const checks = {
        database: await checkDatabase(context.db),
        blockchain: await checkBlockchain(),
        subgraph: await checkSubgraph(),
        redis: await checkRedis(),
      };
      
      const healthy = Object.values(checks).every(c => c.healthy);
      
      return {
        status: healthy ? 'healthy' : 'unhealthy',
        checks,
        timestamp: new Date().toISOString(),
      };
    }),
});

async function checkDatabase(db: Database): Promise<HealthCheck> {
  try {
    await db.select().from(users).limit(1);
    return { healthy: true, message: 'Database connection OK' };
  } catch (error) {
    return { healthy: false, message: error.message };
  }
}
```

### 2. Performance Monitoring

```typescript
// Request timing middleware
export const performanceMiddleware = orpc.middleware(async ({ meta, next }) => {
  const start = performance.now();
  
  try {
    const result = await next();
    const duration = performance.now() - start;
    
    // Log slow requests
    if (duration > 1000) {
      console.warn(`Slow request: ${meta.path} took ${duration}ms`);
    }
    
    // Track metrics
    metrics.recordRequest(meta.path, duration, 'success');
    
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    metrics.recordRequest(meta.path, duration, 'error');
    throw error;
  }
});
```

## Testing Integration Patterns

### 1. Integration Tests

```typescript
// E2E test for asset creation flow
describe('Asset Creation Flow', () => {
  let page: Page;
  
  beforeAll(async () => {
    page = await browser.newPage();
    await page.goto('http://localhost:5173');
  });
  
  it('should create a new bond asset', async () => {
    // Login
    await page.click('[data-testid="login-button"]');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Navigate to asset creation
    await page.click('[data-testid="create-asset"]');
    await page.selectOption('select[name="assetType"]', 'bond');
    
    // Fill bond details
    await page.fill('input[name="name"]', 'Test Bond 2024');
    await page.fill('input[name="symbol"]', 'TB24');
    await page.fill('input[name="interestRate"]', '5.5');
    await page.fill('input[name="maturityDate"]', '2024-12-31');
    
    // Submit and wait for deployment
    await page.click('button[type="submit"]');
    
    // Wait for success message
    await page.waitForSelector('[data-testid="success-message"]', {
      timeout: 30000,
    });
    
    // Verify asset appears in portfolio
    await page.goto('http://localhost:5173/portfolio');
    await expect(page.locator('text=Test Bond 2024')).toBeVisible();
  });
});
```

### 2. Contract Integration Tests

```typescript
// Foundry test for bond contract
contract BondIntegrationTest is Test {
    ATKBondFactory bondFactory;
    ATKSystem system;
    
    function setUp() public {
        // Deploy system
        system = new ATKSystem();
        bondFactory = new ATKBondFactory(address(system));
    }
    
    function testCreateAndTransferBond() public {
        // Create bond
        address bond = bondFactory.createBond(
            "Test Bond",
            "TB",
            550, // 5.5% interest
            block.timestamp + 365 days
        );
        
        // Mint tokens
        ATKBond(bond).mint(address(this), 1000e18);
        
        // Transfer tokens
        ATKBond(bond).transfer(address(0x123), 100e18);
        
        // Verify balances
        assertEq(ATKBond(bond).balanceOf(address(this)), 900e18);
        assertEq(ATKBond(bond).balanceOf(address(0x123)), 100e18);
    }
}
```

## Best Practices & Guidelines

### 1. Type Safety

- Use ORPC for end-to-end type safety
- Generate types from GraphQL schemas
- Validate all inputs with Zod schemas
- Use strict TypeScript configuration

### 2. Error Handling

- Implement retry logic for transient failures
- Use circuit breakers for external services
- Log errors with full context
- Return user-friendly error messages

### 3. Security

- Validate all user inputs
- Use parameterized queries
- Implement proper RBAC
- Audit sensitive operations
- Never expose private keys

### 4. Performance

- Use connection pooling for databases
- Implement caching strategies
- Optimize GraphQL queries
- Use pagination for large datasets
- Monitor slow queries

### 5. Monitoring

- Implement comprehensive health checks
- Track business metrics
- Monitor service dependencies
- Set up alerting for critical issues
- Use structured logging

---

*This document represents the actual integration patterns implemented in the SettleMint Asset Tokenization Kit. Always refer to the specific component code for implementation details.*
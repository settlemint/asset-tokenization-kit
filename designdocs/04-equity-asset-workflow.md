# Equity Asset Workflow & Implementation

## 📈 Equity Overview

Equity tokens in the Asset Tokenization Kit represent ownership stakes in organizations with built-in governance capabilities. They implement OpenZeppelin's voting mechanisms, enabling on-chain governance, shareholder rights, and democratic decision-making processes.

## 📋 Equity Contract Structure

```mermaid
classDiagram
    class ATKEquityImplementation {
        +mapping delegates
        +mapping checkpoints
        +uint256 totalCheckpoints
        
        +delegate()
        +getVotes()
        +getPastVotes()
        +getPastTotalSupply()
    }
    
    class SMARTUpgradeable {
        +transfer()
        +mint()
        +burn()
        +compliance checks
    }
    
    class IVotes {
        +delegate()
        +getVotes()
        +getPastVotes()
        +delegateBySig()
    }
    
    class ERC20VotesUpgradeable {
        +_moveVotingPower()
        +_writeCheckpoint()
        +clock()
        +CLOCK_MODE()
    }
    
    ATKEquityImplementation --|> SMARTUpgradeable
    ATKEquityImplementation --|> IVotes
    ATKEquityImplementation --|> ERC20VotesUpgradeable
    
    style ATKEquityImplementation fill:#c8e6c9,stroke:#388e3c,stroke-width:3px
    style SMARTUpgradeable fill:#e3f2fd,stroke:#1565c0
    style IVotes fill:#fff3e0,stroke:#ef6c00,color:#000000,color:#000000
    style ERC20VotesUpgradeable fill:#f3e5f5,stroke:#7b1fa2
```

## 🚀 Equity Creation Workflow

```mermaid
sequenceDiagram
    participant I as 🏢 Issuer
    participant F as 🏭 EquityFactory
    participant E as 📈 Equity Contract
    participant G as 🏛️ Governor Contract
    participant S as 📊 Subgraph
    
    I->>F: 🚀 Create Equity Request
    Note over F: Validate governance parameters
    
    F->>E: 📋 Deploy Equity Contract
    E->>E: 🔧 Initialize Voting System
    Note over E: Set up checkpoints, delegates
    
    F->>S: 📡 Emit EquityCreated Event
    S->>S: 📊 Index New Equity
    
    I->>G: 🏛️ Deploy Governor (Optional)
    G->>E: 🔗 Link Voting Token
    
    I->>E: 💎 Mint Initial Shares
    E->>E: ✅ Update Voting Power
    E->>E: 📊 Create Checkpoints
    
    E->>S: 📡 Emit MintCompleted
    S->>S: 📊 Update Voting Statistics
    
    Note over E: 📈 Equity Ready for Governance
```

## 🏭 Equity Factory Implementation

### Factory Contract Features
- **🗳️ Governance Setup**: Automatic voting mechanism initialization
- **📊 Checkpoint System**: Historical voting power tracking
- **🔐 Access Control**: Shareholder rights management
- **⚖️ Compliance Integration**: Regulatory compliance for securities

```solidity
contract ATKEquityFactoryImplementation {
    event EquityCreated(
        indexed address creator,
        indexed address equityProxy,
        indexed address accessManager,
        string name,
        string symbol,
        uint8 decimals,
        uint16 managementFeeBps
    );
    
    function createEquity(
        string calldata name,
        string calldata symbol,
        uint8 decimals,
        SMARTComplianceModuleParamPair[] calldata initialModulePairs
    ) external returns (address equityProxy) {
        // Deploy minimal proxy
        equityProxy = Clones.clone(_equityImplementation);
        
        // Initialize equity with voting capabilities
        IATKEquity(equityProxy).initialize(
            name, symbol, decimals,
            initialModulePairs,
            _identityRegistry, _compliance, accessManager
        );
        
        // Emit creation event
        emit EquityCreated(/*...parameters...*/);
        
        return equityProxy;
    }
}
```

## 🗳️ Voting Mechanism

### Delegation System

```mermaid
flowchart TD
    A[👤 Token Holder] -->|🗳️ Self-Delegate| B[💪 Voting Power = Balance]
    A -->|🤝 Delegate to Others| C[👥 Delegate]
    
    C -->|📊 Accumulate| D[💪 Combined Voting Power]
    
    subgraph "📈 Checkpoint System"
        E[📊 Block N Checkpoint]
        F[📊 Block N+1 Checkpoint]
        G[📊 Historical Lookup]
    end
    
    B --> E
    D --> F
    E --> G
    F --> G
    
    subgraph "🏛️ Governance Actions"
        H[📝 Proposal Creation]
        I[🗳️ Voting Process]
        J[⚡ Execution]
    end
    
    G --> H
    H --> I
    I --> J
    
    style A fill:#e8f5e8,stroke:#2e7d32
    style C fill:#bbdefb,stroke:#1976d2
    style D fill:#fff9c4,stroke:#f57f17,color:#000000,color:#000000
    style H fill:#ffcdd2,stroke:#d32f2f
```

### Voting Power Calculation

```solidity
contract ATKEquityImplementation {
    // Get current voting power
    function getVotes(address account) public view returns (uint256) {
        uint256 pos = _checkpoints[account].length;
        return pos == 0 ? 0 : _checkpoints[account][pos - 1].votes;
    }
    
    // Get historical voting power at specific block
    function getPastVotes(address account, uint256 blockNumber) 
        public view returns (uint256) {
        require(blockNumber < block.number, "Future block");
        return _checkpointsLookup(_checkpoints[account], blockNumber);
    }
    
    // Delegate voting power
    function delegate(address delegatee) public {
        _delegate(_msgSender(), delegatee);
    }
    
    // Internal delegation with checkpoint updates
    function _delegate(address delegator, address delegatee) internal {
        address currentDelegate = _delegates[delegator];
        uint256 delegatorBalance = balanceOf(delegator);
        
        _delegates[delegator] = delegatee;
        
        emit DelegateChanged(delegator, currentDelegate, delegatee);
        
        _moveVotingPower(currentDelegate, delegatee, delegatorBalance);
    }
}
```

## 🏛️ Governance Integration

### Governor Contract Integration

```mermaid
sequenceDiagram
    participant H as 👤 Token Holder
    participant E as 📈 Equity Token
    participant G as 🏛️ Governor
    participant T as ⏰ Timelock
    participant C as 📋 Target Contract
    
    H->>E: 🤝 Delegate Voting Power
    E->>E: 📊 Update Checkpoints
    
    H->>G: 📝 Create Proposal
    G->>E: 🔍 Check Voting Power
    E-->>G: ✅ Sufficient Power
    
    Note over G: 🗳️ Voting Period Active
    
    H->>G: 🗳️ Cast Vote
    G->>E: 📊 Query Past Votes
    E-->>G: 💪 Historical Power
    
    Note over G: ⏰ Voting Period Ends
    
    H->>G: ✅ Queue Proposal
    G->>T: 📋 Queue in Timelock
    
    Note over T: ⏰ Timelock Delay
    
    H->>G: ⚡ Execute Proposal
    G->>T: ⚡ Execute from Timelock
    T->>C: 🔄 Call Target Function
    C-->>T: ✅ Success
```

### Proposal Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Pending: 📝 Proposal Created
    Pending --> Active: ⏰ Voting Delay Passed
    
    state Active {
        [*] --> Voting
        Voting --> QuorumReached: ✅ Sufficient Votes
        Voting --> QuorumFailed: ❌ Insufficient Votes
    }
    
    QuorumReached --> Succeeded: ✅ For Votes > Against
    QuorumReached --> Defeated: ❌ Against Votes > For
    QuorumFailed --> Defeated: ❌ Quorum Not Met
    
    Succeeded --> Queued: 📋 Queue in Timelock
    Queued --> Executed: ⚡ Execute After Delay
    
    Defeated --> [*]: 🏁 Proposal Failed
    Executed --> [*]: 🏁 Proposal Complete
    
    Active --> Canceled: 🚫 Proposer Cancels
    Canceled --> [*]: 🏁 Proposal Canceled
```

## 📊 Equity-specific Features

### Shareholder Rights Management

```solidity
contract ATKEquityImplementation {
    // Minimum tokens required to create proposals
    uint256 public proposalThreshold;
    
    // Percentage of total supply needed for quorum
    uint256 public quorumNumerator;
    
    // Check if account can create proposals
    function canCreateProposal(address account) public view returns (bool) {
        return getVotes(account) >= proposalThreshold;
    }
    
    // Calculate required quorum for current total supply
    function quorum(uint256 blockNumber) public view returns (uint256) {
        return (getPastTotalSupply(blockNumber) * quorumNumerator) / 100;
    }
    
    // Dividend distribution (if implemented)
    function distributeDividends(uint256 totalAmount) external {
        require(hasRole(GOVERNANCE_ROLE, _msgSender()), "Unauthorized");
        
        uint256 supply = totalSupply();
        for (uint256 i = 0; i < holderCount; i++) {
            address holder = holders[i];
            uint256 balance = balanceOf(holder);
            uint256 dividend = (totalAmount * balance) / supply;
            
            // Transfer dividend to holder
            payable(holder).transfer(dividend);
        }
    }
}
```

### Corporate Actions

```mermaid
flowchart LR
    subgraph "💰 Financial Actions"
        A[💵 Dividend Distribution]
        B[📈 Stock Split]
        C[💰 Buyback Program]
    end
    
    subgraph "🏛️ Governance Actions"
        D[👥 Board Elections]
        E[📋 Charter Changes]
        F[🤝 Merger Approval]
    end
    
    subgraph "🔧 Operational Actions"
        G[👑 Management Changes]
        H[🏢 Strategic Decisions]
        I[💼 Investment Approval]
    end
    
    A --> D
    B --> E
    C --> F
    D --> G
    E --> H
    F --> I
    
    style A fill:#c8e6c9,stroke:#388e3c
    style D fill:#bbdefb,stroke:#1976d2
    style G fill:#fff9c4,stroke:#f57f17,color:#000000,color:#000000
```

## 📈 Voting Power Dynamics

### Transfer Impact on Voting

```mermaid
sequenceDiagram
    participant A as 👤 Holder A
    participant B as 👤 Holder B
    participant E as 📈 Equity Contract
    participant C as 📊 Checkpoints
    
    Note over A: 💪 Voting Power: 1000
    Note over B: 💪 Voting Power: 500
    
    A->>E: 🔄 Transfer 200 tokens to B
    E->>E: ✅ Compliance Check
    E->>E: 🔄 Update Balances
    
    E->>C: 📊 Update A's Checkpoints
    Note over C: A: 800 voting power
    
    E->>C: 📊 Update B's Checkpoints
    Note over C: B: 700 voting power
    
    E->>C: 📊 Update Delegates (if any)
    Note over C: Delegate power adjusted
    
    E->>E: 📡 Emit Transfer Event
    
    Note over A: 💪 New Voting Power: 800
    Note over B: 💪 New Voting Power: 700
```

## 🔧 API Integration

### Frontend Integration Points

```typescript
// Equity governance data
interface EquityGovernanceData {
  totalSupply: bigint;
  votingPower: bigint;
  delegatedTo: Address | null;
  delegatedFrom: Address[];
  proposalThreshold: bigint;
  quorumRequired: bigint;
}

// Proposal creation
interface ProposalParams {
  targets: Address[];
  values: bigint[];
  calldatas: Hex[];
  description: string;
}

// Voting actions
interface VotingActions {
  delegate: (delegatee: Address) => Promise<Hash>;
  createProposal: (params: ProposalParams) => Promise<Hash>;
  castVote: (proposalId: bigint, support: number) => Promise<Hash>;
}
```

### GraphQL Queries

```graphql
query EquityGovernance($equityAddress: Bytes!, $holderAddress: Bytes!) {
  token(id: $equityAddress) {
    name
    symbol
    totalSupply
    balances(where: { account: $holderAddress }) {
      value
      account {
        id
      }
    }
  }
  
  # Voting power and delegation info
  votingDelegations(where: { 
    token: $equityAddress,
    delegator: $holderAddress 
  }) {
    delegatee
    votingPower
    timestamp
  }
  
  # Recent proposals
  proposals(
    where: { token: $equityAddress }
    orderBy: createdAt
    orderDirection: desc
    first: 10
  ) {
    id
    description
    status
    forVotes
    againstVotes
    quorumRequired
  }
}
```

## 🎯 Use Cases & Applications

### Startup Equity
- **🚀 Cap Table Management**: Digital shareholder registry
- **💰 Investment Rounds**: Automated share issuance
- **🗳️ Board Voting**: Decentralized governance decisions
- **📊 Transparency**: Real-time ownership visibility

### Public Companies
- **👥 Shareholder Meetings**: On-chain voting mechanisms
- **💵 Dividend Distribution**: Automated profit sharing
- **📋 Proxy Voting**: Delegated shareholder rights
- **📊 Regulatory Reporting**: Compliant ownership tracking

### DAOs and Cooperatives
- **🏛️ Democratic Governance**: One-token-one-vote systems
- **💰 Treasury Management**: Community-controlled funds
- **📝 Proposal Systems**: Member-driven decision making
- **🤝 Consensus Building**: Transparent voting processes

### Real Estate Investment
- **🏢 REIT Tokens**: Real Estate Investment Trusts
- **🏗️ Property Governance**: Asset management decisions
- **💰 Rental Distribution**: Automated income sharing
- **📊 Performance Tracking**: Investment return analytics

## 🔒 Security & Compliance

### Regulatory Compliance
- **📋 Securities Regulations**: KYC/AML compliance integration
- **🌍 Jurisdiction Rules**: Country-specific restrictions
- **👥 Investor Limits**: Accredited investor requirements
- **📊 Reporting Requirements**: Automated compliance reporting

### Technical Security
- **📊 Checkpoint Integrity**: Immutable voting history
- **🔐 Delegation Security**: Secure voting power transfers
- **⚡ Flash Loan Protection**: Governance attack prevention
- **🔍 Proposal Validation**: Malicious proposal detection

### Governance Security
- **⏰ Timelock Protection**: Delayed execution for security
- **🚫 Emergency Pause**: Circuit breaker mechanisms
- **👑 Admin Controls**: Multi-sig governance management
- **🔍 Proposal Review**: Community-driven proposal screening

This comprehensive equity workflow enables sophisticated corporate governance with full regulatory compliance and robust security measures for tokenized ownership structures.

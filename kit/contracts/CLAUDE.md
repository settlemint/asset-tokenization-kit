# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Contracts Module - ATK ERC-3643 Implementation

You are working with the Asset Tokenization Kit's smart contracts module implementing ERC-3643 compliant security tokens with Foundry.

### Core Commands

```bash
# Build & Test (from kit/contracts or root)
settlemint scs foundry build --sizes    # Compile with size report
settlemint scs foundry test             # Run all tests
settlemint scs foundry test --match-test test_RevertWhen  # Run specific tests
settlemint scs foundry test -vvv        # Verbose test output

# Hardhat Integration
settlemint scs hardhat build             # Compile via Hardhat
settlemint scs hardhat script local --script scripts/hardhat/main.ts  # Deploy locally

# Linting & Formatting
solhint --config .solhint.json './contracts/**/!(temp_)*.sol'  # Lint contracts
settlemint scs foundry format            # Format Solidity code

# Code Generation
bun run codegen:types                   # Generate TypeScript types
bun run artifacts:genesis               # Generate genesis file
bun run artifacts:abi                   # Export ABIs
```

### Project Structure

```
kit/contracts/
├── contracts/
│   ├── smart/                  # SMART Token (ERC-3643) implementation
│   │   ├── interface/          # ISMART interfaces
│   │   ├── extensions/         # Token extensions (Burnable, Pausable, etc.)
│   │   └── modules/           # Compliance modules
│   ├── system/                # Core system contracts
│   │   ├── identity-factory/  # Identity management
│   │   ├── compliance/        # Compliance registry
│   │   └── token-factory/     # Token factory patterns
│   ├── assets/                # Asset-specific implementations
│   │   ├── ATKBond.sol       # Bond tokenization
│   │   ├── ATKEquity.sol     # Equity tokenization
│   │   └── ATKStableCoin.sol # Stable coin implementation
│   └── addons/                # Additional features
│       ├── airdrop/          # Airdrop mechanisms
│       ├── token-sale/       # Token sale contracts
│       └── yield/            # Yield distribution
├── test/                      # Foundry tests (*.t.sol)
│   ├── smart/                # SMART token tests with extensions
│   ├── system/               # System component tests
│   └── assets/               # Asset-specific tests
├── scripts/
│   └── hardhat/
│       └── main.ts           # Main deployment script
├── ignition/                 # Hardhat Ignition modules
└── dependencies/             # Git submodules (forge-std, OpenZeppelin)
```

### Key Architecture Patterns

**ERC-3643 Token System:**
- SMART tokens implement ERC-3643 standard for regulated securities
- Identity registry for KYC/AML compliance
- Modular compliance rules via compliance modules
- On-chain identity claims following ERC-734/735

**Proxy & Upgradeability:**
- Uses typed proxy pattern (ATKTypedImplementationProxy)
- UUPS upgradeable pattern for key contracts
- Access control via ATKTokenAccessManager

**Testing Strategy:**
- Inheritance-based test organization (SMARTCoreTest, SMARTBurnableTest, etc.)
- Comprehensive test utilities in test/utils/
- Fuzz testing with bounded inputs
- Fork testing for integration scenarios

### Solidity Version & Compiler Settings

```solidity
pragma solidity ^0.8.28;  // Latest contracts use 0.8.28
// Compiler: 0.8.30 (foundry.toml)
// EVM: Cancun
// Optimizer: enabled (200 runs)
// Via IR: enabled
```

### Test Naming Conventions

```solidity
test_FunctionName_Success         // Happy path tests
test_RevertWhen_Condition        // Revert tests  
testFuzz_FunctionName            // Fuzz tests
invariant_PropertyName           // Invariant tests
```

### Common Imports & Dependencies

```solidity
// OpenZeppelin
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

// OnchainID (ERC-734/735)
import "@onchainid/contracts/identity/Identity.sol";

// Internal
import "../smart/interface/ISMART.sol";
import "../system/ATKTopics.sol";
```

### Deployment Context

- Local: Anvil on port 8545
- Networks: localhost, btp (configured in hardhat.config.ts)
- Gas settings: 20% buffer multiplier, 10M gas limit
- Deployment tracking: ignition/deployments/atk-local/

<naming_conventions> Contract Files:

- PascalCase for contracts: `MyContract.sol`, `ERC20Token.sol`
- Interface prefix: `IMyContract.sol`
- Abstract prefix: `AbstractMyContract.sol`
- Test suffix: `MyContract.t.sol`
- Script suffix: `Deploy.s.sol`, `MyContractScript.s.sol`

Functions and Variables:

- mixedCase for functions: `deposit()`, `withdrawAll()`, `getUserBalance()`
- mixedCase for variables: `totalSupply`, `userBalances`
- SCREAMING_SNAKE_CASE for constants: `MAX_SUPPLY`, `INTEREST_RATE`
- SCREAMING_SNAKE_CASE for immutables: `OWNER`, `DEPLOYMENT_TIME`
- PascalCase for structs: `UserInfo`, `PoolData`
- PascalCase for enums: `Status`, `TokenType`

Test Naming:

- `test_FunctionName_Condition` for unit tests
- `test_RevertWhen_Condition` for revert tests
- `testFuzz_FunctionName` for fuzz tests
- `invariant_PropertyName` for invariant tests
- `testFork_Scenario` for fork tests </naming_conventions>

<testing_requirements> Unit Testing:

- Write comprehensive test suites for all functionality
- Use `test_` prefix for standard tests, `testFuzz_` for fuzz tests
- Test both positive and negative cases (success and revert scenarios)
- Use `vm.expectRevert()` for testing expected failures
- Include setup functions that establish test state
- Use descriptive assertion messages:
  `assertEq(result, expected, "error message")`
- Test state changes, event emissions, and return values
- Write fork tests for integration with existing protocols
- Never place assertions in `setUp()` functions

Fuzz Testing:

- Use appropriate parameter types to avoid overflows (e.g., uint96 instead of
  uint256)
- Use `vm.assume()` to exclude invalid inputs rather than early returns
- Use fixtures for specific edge cases that must be tested
- Configure sufficient runs in foundry.toml: `fuzz = { runs = 1000 }`
- Test property-based behaviors rather than isolated scenarios

Invariant Testing:

- Use `invariant_` prefix for invariant functions
- Implement handler-based testing for complex protocols
- Use ghost variables to track state across function calls
- Test with multiple actors using proper actor management
- Use bounded inputs with `bound()` function for controlled testing
- Configure appropriate runs, depth, and timeout values
- Examples: totalSupply == sum of balances, xy = k for AMMs
  </testing_requirements>

<security_practices>

- Implement reentrancy protection where applicable (ReentrancyGuard)
- Use access control patterns (OpenZeppelin's Ownable, AccessControl)
- Validate all user inputs and external contract calls
- Follow CEI (Checks-Effects-Interactions) pattern
- Use safe math operations (Solidity 0.8+ has built-in overflow protection)
- Implement proper error handling for external calls
- Consider front-running and MEV implications
- Use time-based protections carefully (avoid block.timestamp dependencies)
- Implement proper slippage protection for DeFi applications
- Consider upgrade patterns carefully (proxy considerations)
- Run `forge lint` to catch security and style issues
- Address high-severity lints: incorrect-shift, divide-before-multiply
  </security_practices>

<forge_commands> Core Build & Test Commands:

- `forge init <project_name>` - Initialize new Foundry project
- `forge build` - Compile contracts and generate artifacts
- `forge build --dynamic-test-linking` - Enable fast compilation for large
  projects
- `forge test` - Run test suite with gas reporting
- `forge test --match-test <pattern>` - Run specific tests
- `forge test --match-contract <pattern>` - Run tests in specific contracts
- `forge test -vvv` - Run tests with detailed trace output
- `forge test --fuzz-runs 10000` - Run fuzz tests with custom iterations
- `forge coverage` - Generate code coverage report
- `forge snapshot` - Generate gas usage snapshots

Documentation & Analysis:

- `forge doc` - Generate documentation from NatSpec comments
- `forge lint` - Lint Solidity code for security and style issues
- `forge lint --severity high` - Show only high-severity issues
- `forge verify-contract` - Verify contracts on Etherscan
- `forge inspect <contract> <field>` - Inspect compiled contract metadata
- `forge flatten <contract>` - Flatten contract and dependencies

Dependencies & Project Management:

- `forge install <dependency>` - Install dependencies via git submodules
- `forge install OpenZeppelin/openzeppelin-contracts@v4.9.0` - Install specific
  version
- `forge update` - Update dependencies
- `forge remove <dependency>` - Remove dependencies
- `forge remappings` - Display import remappings

Deployment & Scripting:

- `forge script <script>` - Execute deployment/interaction scripts
- `forge script script/Deploy.s.sol --broadcast --verify` - Deploy and verify
- `forge script script/Deploy.s.sol --resume` - Resume failed deployment
  </forge_commands>

<cast_commands> Core Cast Commands:

- `cast call <address> <signature> [args]` - Make a read-only contract call
- `cast send <address> <signature> [args]` - Send a transaction
- `cast balance <address>` - Get ETH balance of address
- `cast code <address>` - Get bytecode at address
- `cast logs <signature>` - Fetch event logs matching signature
- `cast receipt <tx_hash>` - Get transaction receipt
- `cast tx <tx_hash>` - Get transaction details
- `cast block <block>` - Get block information
- `cast gas-price` - Get current gas price
- `cast estimate <address> <signature> [args]` - Estimate gas for transaction

ABI & Data Manipulation:

- `cast abi-encode <signature> [args]` - ABI encode function call
- `cast abi-decode <signature> <data>` - ABI decode transaction data
- `cast keccak <data>` - Compute Keccak-256 hash
- `cast sig <signature>` - Get function selector
- `cast 4byte <selector>` - Lookup function signature

Wallet Operations:

- `cast wallet new` - Generate new wallet
- `cast wallet sign <message>` - Sign message with wallet
- `cast wallet verify <signature> <message> <address>` - Verify signature
  </cast_commands>

<anvil_usage> Anvil Local Development:

- `anvil` - Start local Ethereum node on localhost:8545
- `anvil --fork-url <rpc_url>` - Fork mainnet or other network
- `anvil --fork-block-number <number>` - Fork at specific block
- `anvil --accounts <number>` - Number of accounts to generate (default: 10)
- `anvil --balance <amount>` - Initial balance for generated accounts
- `anvil --gas-limit <limit>` - Block gas limit
- `anvil --gas-price <price>` - Gas price for transactions
- `anvil --port <port>` - Port for RPC server
- `anvil --chain-id <id>` - Chain ID for the network
- `anvil --block-time <seconds>` - Automatic block mining interval

Advanced Anvil Usage:

- Use for local testing and development
- Fork mainnet for testing with real protocols
- Reset state with `anvil_reset` RPC method
- Use `anvil_mine` to manually mine blocks
- Set specific block times with `anvil_setBlockTimestampInterval`
- Impersonate accounts with `anvil_impersonateAccount` </anvil_usage>

<configuration_patterns> foundry.toml Configuration:

```toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
dynamic_test_linking = true  # Enable for faster compilation
remappings = [
    "@openzeppelin/contracts/=lib/openzeppelin-contracts/contracts/",
    "@openzeppelin/contracts-upgradeable/=lib/openzeppelin-contracts-upgradeable/contracts/",
    "@chimera/=lib/chimera/src/"
]

# Compiler settings
solc_version = "0.8.20"
optimizer = true
optimizer_runs = 200
via_ir = false

# Testing configuration
gas_reports = ["*"]
ffi = false
fs_permissions = [{ access = "read", path = "./"}]

# Fuzz testing
[fuzz]
runs = 1000
max_test_rejects = 65536

# Invariant testing
[invariant]
runs = 256
depth = 15
fail_on_revert = false
show_metrics = true

# Linting
[lint]
exclude_lints = []  # Only exclude when necessary

[rpc_endpoints]
mainnet = "${MAINNET_RPC_URL}"
sepolia = "${SEPOLIA_RPC_URL}"
arbitrum = "${ARBITRUM_RPC_URL}"
polygon = "${POLYGON_RPC_URL}"

[etherscan]
mainnet = { key = "${ETHERSCAN_API_KEY}" }
sepolia = { key = "${ETHERSCAN_API_KEY}" }
arbitrum = { key = "${ARBISCAN_API_KEY}", url = "https://api.arbiscan.io/api" }
polygon = { key = "${POLYGONSCAN_API_KEY}", url = "https://api.polygonscan.com/api" }
```

</configuration_patterns>

<common_workflows>

1. **Fuzz Testing Workflow**:

```solidity
// Use appropriate parameter types and bounds
function testFuzz_Deposit(uint96 amount, uint256 actorSeed) public {
    // Bound inputs to valid ranges
    amount = uint96(bound(amount, 1, type(uint96).max));
    address actor = actors[bound(actorSeed, 0, actors.length - 1)];

    // Use assumptions to exclude invalid cases
    vm.assume(amount > 0.1 ether);
    vm.assume(actor != address(0));

    // Setup state
    vm.startPrank(actor);
    deal(address(token), actor, amount);

    // Execute and verify properties
    uint256 sharesBefore = vault.balanceOf(actor);
    vault.deposit(amount, actor);
    uint256 sharesAfter = vault.balanceOf(actor);

    // Property assertions
    assertGt(sharesAfter, sharesBefore, "Shares should increase");
    assertEq(vault.totalAssets(), amount, "Total assets should equal deposit");

    vm.stopPrank();
}

// Use fixtures for edge cases
uint256[] public amountFixtures = [0, 1, type(uint256).max - 1];
function testFuzz_WithFixtures(uint256 fixtureIndex) public {
    uint256 amount = amountFixtures[bound(fixtureIndex, 0, amountFixtures.length - 1)];
    // Test with specific edge case values
}
```

2. **Invariant Testing with Handlers**:

```solidity
// Handler contract for bounded invariant testing
contract VaultHandler {
    Vault public vault;
    IERC20 public asset;

    // Ghost variables for tracking state
    uint256 public ghost_depositSum;
    uint256 public ghost_withdrawSum;
    mapping(address => uint256) public ghost_userDeposits;

    // Actor management
    address[] public actors;
    address internal currentActor;

    modifier useActor(uint256 actorSeed) {
        currentActor = actors[bound(actorSeed, 0, actors.length - 1)];
        vm.startPrank(currentActor);
        _;
        vm.stopPrank();
    }

    constructor(Vault _vault, IERC20 _asset) {
        vault = _vault;
        asset = _asset;
        // Initialize actors
        for (uint i = 0; i < 5; i++) {
            actors.push(makeAddr(string(abi.encode("actor", i))));
        }
    }

    function deposit(uint256 assets, uint256 actorSeed) external useActor(actorSeed) {
        // Bound inputs
        assets = bound(assets, 0, 1e30);

        // Setup
        deal(address(asset), currentActor, assets);
        asset.approve(address(vault), assets);

        // Pre-state
        uint256 sharesBefore = vault.balanceOf(currentActor);

        // Action
        uint256 shares = vault.deposit(assets, currentActor);

        // Post-state assertions
        assertEq(vault.balanceOf(currentActor), sharesBefore + shares);

        // Update ghost variables
        ghost_depositSum += assets;
        ghost_userDeposits[currentActor] += assets;
    }

    function withdraw(uint256 shares, uint256 actorSeed) external useActor(actorSeed) {
        shares = bound(shares, 0, vault.balanceOf(currentActor));

        if (shares == 0) return;

        uint256 assetsBefore = asset.balanceOf(currentActor);
        uint256 assets = vault.redeem(shares, currentActor, currentActor);

        assertEq(asset.balanceOf(currentActor), assetsBefore + assets);

        ghost_withdrawSum += assets;
    }
}

// Invariant test contract
contract VaultInvariantTest is Test {
    Vault vault;
    MockERC20 asset;
    VaultHandler handler;

    function setUp() external {
        asset = new MockERC20();
        vault = new Vault(asset);
        handler = new VaultHandler(vault, asset);

        targetContract(address(handler));
    }

    // Core invariants
    function invariant_totalSupplyEqualsShares() external {
        assertEq(vault.totalSupply(), vault.totalShares());
    }

    function invariant_assetsGreaterThanSupply() external {
        assertGe(vault.totalAssets(), vault.totalSupply());
    }

    function invariant_ghostVariablesConsistent() external {
        assertGe(handler.ghost_depositSum(), handler.ghost_withdrawSum());
    }
}
```

3. **Deployment Script with Verification**:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {MyContract} from "src/MyContract.sol";

contract DeployScript is Script {
    function run() public {
        // Load deployment parameters
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address owner = vm.envAddress("OWNER");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy with constructor parameters
        MyContract myContract = new MyContract(owner);

        // Post-deployment configuration
        myContract.initialize();

        // Log deployment info
        console.log("MyContract deployed to:", address(myContract));
        console.log("Deployer:", vm.addr(deployerPrivateKey));
        console.log("Owner:", owner);

        vm.stopBroadcast();

        // Verify deployment
        require(myContract.owner() == owner, "Owner not set correctly");
    }
}

// Deployment commands:
// forge script script/Deploy.s.sol --rpc-url sepolia --broadcast --verify -vvvv --interactives 1
// forge script script/Deploy.s.sol --rpc-url sepolia --broadcast --verify --resume  # Resume failed
```

4. **Forge Lint Workflow**:

```bash
# Basic linting
forge lint

# Filter by severity
forge lint --severity high --severity medium

# JSON output for CI/CD
forge lint --json > lint-results.json

# Lint specific directories
forge lint src/contracts/ test/

# Configuration in foundry.toml to exclude specific lints
[lint]
exclude_lints = ["divide-before-multiply"]  # Only when justified
```

5. **EIP-712 Implementation and Testing**:

```solidity
// EIP-712 implementation example
contract EIP712Example {
    bytes32 private constant DOMAIN_TYPEHASH =
        keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)");

    bytes32 private constant PERMIT_TYPEHASH =
        keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)");

    function _hashTypedDataV4(bytes32 structHash) internal view returns (bytes32) {
        return ECDSA.toTypedDataHash(_domainSeparatorV4(), structHash);
    }
}

// EIP-712 testing with cheatcodes
contract EIP712Test is Test {
    function test_EIP712TypeHash() public {
        bytes32 expected = vm.eip712HashType("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)");
        assertEq(PERMIT_TYPEHASH, expected, "Type hash mismatch");
    }

    function test_EIP712StructHash() public {
        Permit memory permit = Permit({
            owner: address(1),
            spender: address(2),
            value: 100,
            nonce: 0,
            deadline: block.timestamp + 1 hours
        });

        bytes32 structHash = vm.eip712HashStruct("Permit", abi.encode(permit));
        bytes32 expected = keccak256(abi.encode(PERMIT_TYPEHASH, permit.owner, permit.spender, permit.value, permit.nonce, permit.deadline));
        assertEq(structHash, expected, "Struct hash mismatch");
    }
}

// Generate type definitions
// forge eip712 --contract MyContract
```

6. **Dynamic Test Linking Setup**:

```toml
# Add to foundry.toml for 10x+ compilation speedup
[profile.default]
dynamic_test_linking = true

# Or use flag
# forge build --dynamic-test-linking
# forge test --dynamic-test-linking
```

</common_workflows>

<project_structure> Comprehensive Foundry Project Layout:

```
project/
├── foundry.toml              # Foundry configuration
├── remappings.txt            # Import remappings (optional)
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore patterns
├── README.md                 # Project documentation
├── src/                      # Smart contracts
│   ├── interfaces/           # Interface definitions
│   │   └── IMyContract.sol
│   ├── libraries/            # Reusable libraries
│   │   └── MyLibrary.sol
│   ├── abstracts/            # Abstract contracts
│   │   └── AbstractContract.sol
│   └── MyContract.sol        # Main contracts
├── test/                     # Test files
│   ├── unit/                 # Unit tests
│   │   └── MyContract.t.sol
│   ├── integration/          # Integration tests
│   │   └── Integration.t.sol
│   ├── fuzz/                 # Fuzz tests
│   │   └── FuzzMyContract.t.sol
│   ├── invariant/            # Invariant tests
│   │   ├── handlers/         # Test handlers
│   │   │   └── VaultHandler.sol
│   │   └── InvariantTests.t.sol
│   ├── fork/                 # Fork tests
│   │   └── ForkTest.t.sol
│   └── utils/                # Test utilities
│       └── TestUtils.sol
├── script/                   # Deployment scripts
│   ├── Deploy.s.sol          # Main deployment
│   ├── Configure.s.sol       # Post-deployment config
│   └── input/                # Script input data
│       └── sepolia.json
├── lib/                      # Dependencies (git submodules)
├── out/                      # Compiled artifacts
├── cache/                    # Build cache
├── broadcast/                # Deployment logs
└── docs/                     # Generated documentation
```

</project_structure>

# ATK Transaction Flow - Complete Numbered List

This document provides a comprehensive numbered list of ALL transactions
executed during the ATK deployment and setup process, including factory
deployments, proxy creations, and all initialization steps.

**IMPORTANT**: When using SettleMint networks with predeployed contracts
(genesis allocations), many infrastructure transactions in Phase 1 are SKIPPED.
See notes marked with 🔷 for predeployed contracts.

## Phase 1: Core Infrastructure Deployment (Hardhat Ignition)

### Implementation Contracts Deployment

**Note**: All contracts in this section (1-43) are predeployed in SettleMint
networks via genesis allocations. These transactions should be SKIPPED when
using predeployed contracts.

1. **TX**: Deploy ATKForwarder implementation 🔷 SKIP IF PREDEPLOYED
   - **Sender**: Hardhat deployer (account[0])
   - **Contract**: New deployment
   - **Function**: Constructor
   - **Output**: Forwarder implementation address
   - **Predeployed at**: 0x5e771e1417100000000000000000000000020099

2. **TX**: Deploy ATKSystemImplementation 🔷 SKIP IF PREDEPLOYED
   - **Sender**: Hardhat deployer
   - **Contract**: New deployment
   - **Function**: Constructor
   - **Output**: System implementation address
   - **Predeployed at**: 0x5e771e1417100000000000000000000000020087

3. **TX**: Deploy ATKComplianceImplementation 🔷 SKIP IF PREDEPLOYED
   - **Sender**: Hardhat deployer
   - **Contract**: New deployment
   - **Function**: Constructor
   - **Output**: Compliance implementation address
   - **Predeployed at**: 0x5e771e1417100000000000000000000000020001

4. **TX**: Deploy ATKIdentityRegistryImplementation
   - **Sender**: Hardhat deployer
   - **Contract**: New deployment
   - **Function**: Constructor
   - **Output**: Identity registry implementation address

5. **TX**: Deploy ATKIdentityRegistryStorageImplementation
   - **Sender**: Hardhat deployer
   - **Contract**: New deployment
   - **Function**: Constructor
   - **Output**: Identity registry storage implementation address

6. **TX**: Deploy ATKSystemTrustedIssuersRegistryImplementation
   - **Sender**: Hardhat deployer
   - **Contract**: New deployment
   - **Function**: Constructor
   - **Output**: Trusted issuers registry implementation address

7. **TX**: Deploy ATKTopicSchemeRegistryImplementation
   - **Sender**: Hardhat deployer
   - **Contract**: New deployment
   - **Function**: Constructor
   - **Output**: Topic scheme registry implementation address

8. **TX**: Deploy ATKIdentityFactoryImplementation
   - **Sender**: Hardhat deployer
   - **Contract**: New deployment
   - **Function**: Constructor
   - **Output**: Identity factory implementation address

9. **TX**: Deploy ATKIdentityImplementation
   - **Sender**: Hardhat deployer
   - **Contract**: New deployment
   - **Function**: Constructor
   - **Output**: Identity implementation address

10. **TX**: Deploy ATKContractIdentityImplementation
    - **Sender**: Hardhat deployer
    - **Contract**: New deployment
    - **Function**: Constructor
    - **Output**: Contract identity implementation address

11. **TX**: Deploy ATKTokenAccessManagerImplementation
    - **Sender**: Hardhat deployer
    - **Contract**: New deployment
    - **Function**: Constructor
    - **Output**: Token access manager implementation address

12. **TX**: Deploy ATKTokenFactoryRegistryImplementation
    - **Sender**: Hardhat deployer
    - **Contract**: New deployment
    - **Function**: Constructor
    - **Output**: Token factory registry implementation address

13. **TX**: Deploy ATKComplianceModuleRegistryImplementation
    - **Sender**: Hardhat deployer
    - **Contract**: New deployment
    - **Function**: Constructor
    - **Output**: Compliance module registry implementation address

14. **TX**: Deploy ATKSystemAddonRegistryImplementation
    - **Sender**: Hardhat deployer
    - **Contract**: New deployment
    - **Function**: Constructor
    - **Output**: System addon registry implementation address

15. **TX**: Deploy ATKSystemAccessManagerImplementation
    - **Sender**: Hardhat deployer
    - **Contract**: New deployment
    - **Function**: Constructor
    - **Output**: System access manager implementation address

### Token Implementation Contracts

16. **TX**: Deploy ATKBondImplementation
    - **Sender**: Hardhat deployer
    - **Contract**: New deployment
    - **Function**: Constructor
    - **Output**: Bond implementation address

17. **TX**: Deploy ATKBondFactoryImplementation
    - **Sender**: Hardhat deployer
    - **Contract**: New deployment
    - **Function**: Constructor
    - **Output**: Bond factory implementation address

18. **TX**: Deploy ATKDepositImplementation
    - **Sender**: Hardhat deployer
    - **Contract**: New deployment
    - **Function**: Constructor
    - **Output**: Deposit implementation address

19. **TX**: Deploy ATKDepositFactoryImplementation
    - **Sender**: Hardhat deployer
    - **Contract**: New deployment
    - **Function**: Constructor
    - **Output**: Deposit factory implementation address

20. **TX**: Deploy ATKEquityImplementation
    - **Sender**: Hardhat deployer
    - **Contract**: New deployment
    - **Function**: Constructor
    - **Output**: Equity implementation address

21. **TX**: Deploy ATKEquityFactoryImplementation
    - **Sender**: Hardhat deployer
    - **Contract**: New deployment
    - **Function**: Constructor
    - **Output**: Equity factory implementation address

22. **TX**: Deploy ATKFundImplementation
    - **Sender**: Hardhat deployer
    - **Contract**: New deployment
    - **Function**: Constructor
    - **Output**: Fund implementation address

23. **TX**: Deploy ATKFundFactoryImplementation
    - **Sender**: Hardhat deployer
    - **Contract**: New deployment
    - **Function**: Constructor
    - **Output**: Fund factory implementation address

24. **TX**: Deploy ATKStableCoinImplementation
    - **Sender**: Hardhat deployer
    - **Contract**: New deployment
    - **Function**: Constructor
    - **Output**: StableCoin implementation address

25. **TX**: Deploy ATKStableCoinFactoryImplementation
    - **Sender**: Hardhat deployer
    - **Contract**: New deployment
    - **Function**: Constructor
    - **Output**: StableCoin factory implementation address

### Addon Implementation Contracts

26. **TX**: Deploy ATKFixedYieldScheduleImplementation
    - **Sender**: Hardhat deployer
    - **Contract**: New deployment
    - **Function**: Constructor
    - **Output**: Fixed yield schedule implementation address

27. **TX**: Deploy ATKFixedYieldScheduleFactoryImplementation
    - **Sender**: Hardhat deployer
    - **Contract**: New deployment
    - **Function**: Constructor
    - **Output**: Fixed yield schedule factory implementation address

28. **TX**: Deploy ATKXvPSettlementImplementation
    - **Sender**: Hardhat deployer
    - **Contract**: New deployment
    - **Function**: Constructor
    - **Output**: XVP settlement implementation address

29. **TX**: Deploy ATKXvPSettlementFactoryImplementation
    - **Sender**: Hardhat deployer
    - **Contract**: New deployment
    - **Function**: Constructor
    - **Output**: XVP settlement factory implementation address

30. **TX**: Deploy ATKVestingAirdropImplementation
    - **Sender**: Hardhat deployer
    - **Contract**: New deployment
    - **Function**: Constructor
    - **Output**: Vesting airdrop implementation address

31. **TX**: Deploy ATKVestingAirdropFactoryImplementation
    - **Sender**: Hardhat deployer
    - **Contract**: New deployment
    - **Function**: Constructor
    - **Output**: Vesting airdrop factory implementation address

32. **TX**: Deploy ATKPushAirdropImplementation
    - **Sender**: Hardhat deployer
    - **Contract**: New deployment
    - **Function**: Constructor
    - **Output**: Push airdrop implementation address

33. **TX**: Deploy ATKPushAirdropFactoryImplementation
    - **Sender**: Hardhat deployer
    - **Contract**: New deployment
    - **Function**: Constructor
    - **Output**: Push airdrop factory implementation address

34. **TX**: Deploy ATKTimeBoundAirdropImplementation
    - **Sender**: Hardhat deployer
    - **Contract**: New deployment
    - **Function**: Constructor
    - **Output**: Timebound airdrop implementation address

35. **TX**: Deploy ATKTimeBoundAirdropFactoryImplementation
    - **Sender**: Hardhat deployer
    - **Contract**: New deployment
    - **Function**: Constructor
    - **Output**: Timebound airdrop factory implementation address

36. **TX**: Deploy ATKVaultImplementation
    - **Sender**: Hardhat deployer
    - **Contract**: New deployment
    - **Function**: Constructor
    - **Output**: Vault implementation address

37. **TX**: Deploy ATKVaultFactoryImplementation
    - **Sender**: Hardhat deployer
    - **Contract**: New deployment
    - **Function**: Constructor
    - **Output**: Vault factory implementation address

### Compliance Module Contracts

38. **TX**: Deploy ATKCountryAllowListModule
    - **Sender**: Hardhat deployer
    - **Contract**: New deployment
    - **Function**: Constructor
    - **Output**: Country allow list module address

39. **TX**: Deploy ATKCountryBlockListModule
    - **Sender**: Hardhat deployer
    - **Contract**: New deployment
    - **Function**: Constructor
    - **Output**: Country block list module address

40. **TX**: Deploy ATKAddressBlockListModule
    - **Sender**: Hardhat deployer
    - **Contract**: New deployment
    - **Function**: Constructor
    - **Output**: Address block list module address

41. **TX**: Deploy ATKIdentityBlockListModule
    - **Sender**: Hardhat deployer
    - **Contract**: New deployment
    - **Function**: Constructor
    - **Output**: Identity block list module address

42. **TX**: Deploy ATKIdentityAllowListModule
    - **Sender**: Hardhat deployer
    - **Contract**: New deployment
    - **Function**: Constructor
    - **Output**: Identity allow list module address

43. **TX**: Deploy ATKIdentityVerificationModule
    - **Sender**: Hardhat deployer
    - **Contract**: New deployment
    - **Function**: Constructor
    - **Output**: Identity verification module address

### System Factory Deployment

44. **TX**: Deploy ATKSystemFactory
    - **Sender**: Hardhat deployer
    - **Contract**: New deployment
    - **Function**: Constructor with all implementation addresses
    - **Parameters**: All implementation addresses from TXs 2-15
    - **Output**: System factory address

### System Creation and Bootstrap

45. **TX**: Create System
    - **Sender**: Hardhat deployer
    - **Contract**: ATKSystemFactory
    - **Function**: `createSystem()`
    - **Output**: System proxy address and AccessManager address (via
      ATKSystemCreated event)

46. **TX**: Bootstrap System
    - **Sender**: Hardhat deployer
    - **Contract**: ATKSystem (proxy)
    - **Function**: `bootstrap()`
    - **Output**: All core proxy addresses via Bootstrapped event:
      - Compliance proxy
      - Identity registry proxy
      - Identity registry storage proxy
      - Trusted issuers registry proxy
      - Topic scheme registry proxy
      - Identity factory proxy
      - Token factory registry proxy
      - Compliance module registry proxy
      - System addon registry proxy

### Factory Registration

47. **TX**: Register Bond Factory
    - **Sender**: Hardhat deployer
    - **Contract**: ATKTokenFactoryRegistry
    - **Function**: `registerTokenFactory("bond", bondFactoryImpl, bondImpl)`
    - **Uses**: Addresses from TXs 16-17
    - **Output**: Bond factory proxy address

48. **TX**: Register Deposit Factory
    - **Sender**: Hardhat deployer
    - **Contract**: ATKTokenFactoryRegistry
    - **Function**:
      `registerTokenFactory("deposit", depositFactoryImpl, depositImpl)`
    - **Uses**: Addresses from TXs 18-19
    - **Output**: Deposit factory proxy address

49. **TX**: Register Equity Factory
    - **Sender**: Hardhat deployer
    - **Contract**: ATKTokenFactoryRegistry
    - **Function**:
      `registerTokenFactory("equity", equityFactoryImpl, equityImpl)`
    - **Uses**: Addresses from TXs 20-21
    - **Output**: Equity factory proxy address

50. **TX**: Register Fund Factory
    - **Sender**: Hardhat deployer
    - **Contract**: ATKTokenFactoryRegistry
    - **Function**: `registerTokenFactory("fund", fundFactoryImpl, fundImpl)`
    - **Uses**: Addresses from TXs 22-23
    - **Output**: Fund factory proxy address

51. **TX**: Register StableCoin Factory
    - **Sender**: Hardhat deployer
    - **Contract**: ATKTokenFactoryRegistry
    - **Function**:
      `registerTokenFactory("stablecoin", stablecoinFactoryImpl, stablecoinImpl)`
    - **Uses**: Addresses from TXs 24-25
    - **Output**: StableCoin factory proxy address

### Addon Factory Registration

52. **TX**: Register Fixed Yield Schedule Factory
    - **Sender**: Hardhat deployer
    - **Contract**: ATKSystemAddonRegistry
    - **Function**:
      `registerSystemAddon("fixedYieldSchedule", fixedYieldScheduleFactoryImpl)`
    - **Uses**: Address from TX 27
    - **Output**: Fixed yield schedule factory proxy address

53. **TX**: Register XVP Settlement Factory
    - **Sender**: Hardhat deployer
    - **Contract**: ATKSystemAddonRegistry
    - **Function**:
      `registerSystemAddon("xvpSettlement", xvpSettlementFactoryImpl)`
    - **Uses**: Address from TX 29
    - **Output**: XVP settlement factory proxy address

54. **TX**: Register Vesting Airdrop Factory
    - **Sender**: Hardhat deployer
    - **Contract**: ATKSystemAddonRegistry
    - **Function**:
      `registerSystemAddon("vestingAirdrop", vestingAirdropFactoryImpl)`
    - **Uses**: Address from TX 31
    - **Output**: Vesting airdrop factory proxy address

55. **TX**: Register Push Airdrop Factory
    - **Sender**: Hardhat deployer
    - **Contract**: ATKSystemAddonRegistry
    - **Function**: `registerSystemAddon("pushAirdrop", pushAirdropFactoryImpl)`
    - **Uses**: Address from TX 33
    - **Output**: Push airdrop factory proxy address

56. **TX**: Register Timebound Airdrop Factory
    - **Sender**: Hardhat deployer
    - **Contract**: ATKSystemAddonRegistry
    - **Function**:
      `registerSystemAddon("timeboundAirdrop", timeboundAirdropFactoryImpl)`
    - **Uses**: Address from TX 35
    - **Output**: Timebound airdrop factory proxy address

## Phase 2: Actor Initialization

57. **TX**: Create Identity for Owner
    - **Sender**: Owner (account[0])
    - **Contract**: ATKIdentityFactory
    - **Function**: `createIdentity(owner.address, false)`
    - **Output**: Owner's identity contract address

58. **TX**: Create Identity for Claim Issuer
    - **Sender**: Claim Issuer (account[6])
    - **Contract**: ATKIdentityFactory
    - **Function**: `createIdentity(claimIssuer.address, false)`
    - **Output**: Claim Issuer's identity contract address

59. **TX**: Create Identity for Investor A
    - **Sender**: Investor A (account[1])
    - **Contract**: ATKIdentityFactory
    - **Function**: `createIdentity(investorA.address, false)`
    - **Output**: Investor A's identity contract address

60. **TX**: Create Identity for Investor B
    - **Sender**: Investor B (account[3])
    - **Contract**: ATKIdentityFactory
    - **Function**: `createIdentity(investorB.address, false)`
    - **Output**: Investor B's identity contract address

61. **TX**: Create Identity for Frozen Investor
    - **Sender**: Frozen Investor (account[4])
    - **Contract**: ATKIdentityFactory
    - **Function**: `createIdentity(frozenInvestor.address, false)`
    - **Output**: Frozen Investor's identity contract address

62. **TX**: Create Identity for Malicious Investor
    - **Sender**: Malicious Investor (account[5])
    - **Contract**: ATKIdentityFactory
    - **Function**: `createIdentity(maliciousInvestor.address, false)`
    - **Output**: Malicious Investor's identity contract address

## Phase 3: System Role Configuration

63. **TX**: Grant Identity Manager Role to Owner
    - **Sender**: Owner (default signer from deployer)
    - **Contract**: ATKSystemAccessManager
    - **Function**: `grantRole(identityManagerRole, owner.address)`
    - **Purpose**: Allow owner to manage identities

## Phase 4: Identity Registration

64. **TX**: Batch Register All Identities
    - **Sender**: Owner (has identityManagerRole)
    - **Contract**: ATKIdentityRegistry
    - **Function**: `batchRegisterIdentity(addresses, identities, countryCodes)`
    - **Parameters**:
      - addresses: [owner, investorA, investorB, frozenInvestor,
        maliciousInvestor]
      - identities: [respective identity addresses from TXs 57-62]
      - countryCodes: [BE, BE, NL, NL, ES]

## Phase 5: Claim Policy Setup

65. **TX**: Grant Claim Policy Manager Role
    - **Sender**: Owner
    - **Contract**: ATKSystemAccessManager
    - **Function**: `grantRole(claimPolicyManagerRole, owner.address)`

66. **TX**: Add Claim Issuer as Trusted Issuer
    - **Sender**: Owner (has claimPolicyManagerRole)
    - **Contract**: ATKTrustedIssuersRegistry
    - **Function**: `addTrustedIssuer(claimIssuerIdentity, [topics])`
    - **Parameters**:
      - claimIssuerIdentity: from TX 58
      - topics: [kyc, aml, collateral, assetClassification, basePrice, isin]

## Phase 6: Issue Verification Claims

67. **TX**: Add KYC Claim for Owner
    - **Sender**: Owner
    - **Contract**: Owner's Identity
    - **Function**: `addClaim(topic, keyType, issuer, signature, data, uri)`
    - **Parameters**: KYC claim signed by Claim Issuer

68. **TX**: Add AML Claim for Owner
    - **Sender**: Owner
    - **Contract**: Owner's Identity
    - **Function**: `addClaim(topic, keyType, issuer, signature, data, uri)`
    - **Parameters**: AML claim signed by Claim Issuer

69. **TX**: Add KYC Claim for Investor A
    - **Sender**: Investor A
    - **Contract**: Investor A's Identity
    - **Function**: `addClaim(...)`

70. **TX**: Add AML Claim for Investor A
    - **Sender**: Investor A
    - **Contract**: Investor A's Identity
    - **Function**: `addClaim(...)`

71. **TX**: Add KYC Claim for Investor B
    - **Sender**: Investor B
    - **Contract**: Investor B's Identity
    - **Function**: `addClaim(...)`

72. **TX**: Add AML Claim for Investor B
    - **Sender**: Investor B
    - **Contract**: Investor B's Identity
    - **Function**: `addClaim(...)`

73. **TX**: Add KYC Claim for Frozen Investor
    - **Sender**: Frozen Investor
    - **Contract**: Frozen Investor's Identity
    - **Function**: `addClaim(...)`

74. **TX**: Add AML Claim for Frozen Investor
    - **Sender**: Frozen Investor
    - **Contract**: Frozen Investor's Identity
    - **Function**: `addClaim(...)`

75. **TX**: Add KYC Claim for Malicious Investor
    - **Sender**: Malicious Investor
    - **Contract**: Malicious Investor's Identity
    - **Function**: `addClaim(...)`

76. **TX**: Add AML Claim for Malicious Investor
    - **Sender**: Malicious Investor
    - **Contract**: Malicious Investor's Identity
    - **Function**: `addClaim(...)`

## Phase 7: Compliance Module Setup

77. **TX**: Grant Compliance Manager Role
    - **Sender**: Owner
    - **Contract**: ATKSystemAccessManager
    - **Function**: `grantRole(complianceManagerRole, owner.address)`

78. **TX**: Add Global Country Block Module
    - **Sender**: Owner (has complianceManagerRole)
    - **Contract**: ATKCompliance
    - **Function**: `addGlobalComplianceModule(countryBlockListModule, params)`
    - **Parameters**: Encoded country codes [RU]

79. **TX**: Add Global Address Block Module
    - **Sender**: Owner (has complianceManagerRole)
    - **Contract**: ATKCompliance
    - **Function**: `addGlobalComplianceModule(addressBlockListModule, params)`
    - **Parameters**: Encoded addresses [maliciousInvestor.address]

80. **TX**: Add Global Identity Block Module
    - **Sender**: Owner (has complianceManagerRole)
    - **Contract**: ATKCompliance
    - **Function**: `addGlobalComplianceModule(identityBlockListModule, params)`
    - **Parameters**: Encoded identities [maliciousInvestorIdentity]

## Phase 8: Asset Management Setup

81. **TX**: Grant Token Manager and Addon Manager Roles
    - **Sender**: Owner
    - **Contract**: ATKSystemAccessManager
    - **Function**:
      `grantSystemRoles([tokenManagerRole, addonManagerRole], owner.address)`
    - **Note**: Single transaction granting both roles

## Phase 9: Asset Creation and Operations

### 9.1 Deposit Token Creation and Setup

82. **TX**: Create Deposit Token
    - **Sender**: Owner (has tokenManagerRole)
    - **Contract**: ATKDepositFactory
    - **Function**:
      `createDeposit(name, symbol, decimals, modules, countryCode)`
    - **Parameters**:
      - name: "Euro Deposits"
      - symbol: "EURD"
      - decimals: 6
      - modules: [identityVerification, countryAllowList,
        identityAllowList(investorA, investorB)]
      - countryCode: BE
    - **Output**: Deposit token proxy address

83. **TX**: Create Identity for Deposit Token
    - **Sender**: Deposit Token Contract
    - **Contract**: ATKIdentityFactory
    - **Function**: `createIdentity(depositToken.address, true)`
    - **Output**: Deposit token identity address

84. **TX**: Register Deposit Token Identity
    - **Sender**: Deposit Token Contract
    - **Contract**: ATKIdentityRegistry
    - **Function**:
      `registerIdentity(depositToken.address, identity, countryCode)`

85. **TX**: Grant Agent Role on Deposit
    - **Sender**: Owner
    - **Contract**: Deposit Token
    - **Function**: `grantRole(agentRole, owner.address)`

86. **TX**: Grant Emergency Role on Deposit
    - **Sender**: Owner
    - **Contract**: Deposit Token
    - **Function**: `grantRole(emergencyRole, owner.address)`

87. **TX**: Add Collateral Claim to Deposit Identity
    - **Sender**: Deposit Token Contract
    - **Contract**: Deposit Token Identity
    - **Function**: `addClaim(...)`
    - **Parameters**: Collateral claim (100000n) signed by Claim Issuer

88. **TX**: Add Base Price Claim to Deposit Identity
    - **Sender**: Deposit Token Contract
    - **Contract**: Deposit Token Identity
    - **Function**: `addClaim(...)`
    - **Parameters**: Base price claim (1) signed by Claim Issuer

89. **TX**: Mint Deposit Tokens to Investor A
    - **Sender**: Owner (has agentRole)
    - **Contract**: Deposit Token
    - **Function**: `mint(investorA.address, 1000n)`

90. **TX**: Transfer Deposit Tokens A to B
    - **Sender**: Investor A
    - **Contract**: Deposit Token
    - **Function**: `transfer(investorB.address, 500n)`

91. **TX**: Burn Deposit Tokens from B
    - **Sender**: Investor B
    - **Contract**: Deposit Token
    - **Function**: `burn(investorB.address, 250n)`

92. **TX**: Forced Transfer Deposit A to B
    - **Sender**: Owner (has emergencyRole)
    - **Contract**: Deposit Token
    - **Function**: `forcedTransfer(investorA.address, investorB.address, 250n)`

93. **TX**: Freeze Frozen Investor Address
    - **Sender**: Owner (has emergencyRole)
    - **Contract**: Deposit Token
    - **Function**: `setAddressFrozen(frozenInvestor.address, true)`

94. **TX**: Freeze Partial Tokens for B
    - **Sender**: Owner (has emergencyRole)
    - **Contract**: Deposit Token
    - **Function**: `freezePartialTokens(investorB.address, 250n)`

95. **TX**: Unfreeze Partial Tokens for B
    - **Sender**: Owner (has emergencyRole)
    - **Contract**: Deposit Token
    - **Function**: `unfreezePartialTokens(investorB.address, 125n)`

### 9.2 Bond Token Creation and Setup

97. **TX**: Create Bond Token
    - **Sender**: Owner (has tokenManagerRole)
    - **Contract**: ATKBondFactory
    - **Function**: `createBond(name, symbol, decimals, modules, countryCode)`
    - **Parameters**:
      - name: "Asset Tokenization Kit Bond"
      - symbol: "ATKB"
      - decimals: 18
      - modules: [identityVerification, countryAllowList]
      - countryCode: BE
    - **Output**: Bond token proxy address

98. **TX**: Create Identity for Bond Token
    - **Sender**: Bond Token Contract
    - **Contract**: ATKIdentityFactory
    - **Function**: `createIdentity(bondToken.address, true)`
    - **Output**: Bond token identity address

99. **TX**: Register Bond Token Identity
    - **Sender**: Bond Token Contract
    - **Contract**: ATKIdentityRegistry
    - **Function**: `registerIdentity(bondToken.address, identity, countryCode)`

100.  **TX**: Grant Agent Role on Bond
      - **Sender**: Owner
      - **Contract**: Bond Token
      - **Function**: `grantRole(agentRole, owner.address)`

101.  **TX**: Grant Emergency Role on Bond
      - **Sender**: Owner
      - **Contract**: Bond Token
      - **Function**: `grantRole(emergencyRole, owner.address)`

102.  **TX**: Add Asset Classification Claim to Bond
      - **Sender**: Bond Token Contract
      - **Contract**: Bond Token Identity
      - **Function**: `addClaim(...)`
      - **Parameters**: Asset classification claim ("Bond") signed by Claim
        Issuer

103.  **TX**: Add ISIN Claim to Bond
      - **Sender**: Bond Token Contract
      - **Contract**: Bond Token Identity
      - **Function**: `addClaim(...)`
      - **Parameters**: ISIN claim ("US1234567891") signed by Claim Issuer

104.  **TX**: Deploy Fixed Yield Schedule for Bond
      - **Sender**: Owner (has addonManagerRole)
      - **Contract**: ATKFixedYieldScheduleFactory
      - **Function**: `deployProxy(assetAddress, signer, params)`
      - **Parameters**: Bond token address, yield configuration
      - **Output**: Yield schedule addon address

105.  **TX**: Attach Yield Schedule to Bond
      - **Sender**: Owner
      - **Contract**: Bond Token
      - **Function**: `attachAddon([yieldScheduleAddon])`
      - **Uses**: Yield schedule address from TX 104

106.  **TX**: Mint Bond Tokens to Investor A
      - **Sender**: Owner (has agentRole)
      - **Contract**: Bond Token
      - **Function**: `mint(investorA.address, 1000n * 10^18)`

107.  **TX**: Transfer Bond Tokens A to B
      - **Sender**: Investor A
      - **Contract**: Bond Token
      - **Function**: `transfer(investorB.address, 500n * 10^18)`

108.  **TX**: Pause Bond Token
      - **Sender**: Owner (has agentRole)
      - **Contract**: Bond Token
      - **Function**: `pause()`

109.  **TX**: Unpause Bond Token
      - **Sender**: Owner (has agentRole)
      - **Contract**: Bond Token
      - **Function**: `unpause()`

### 9.3 Equity Token Creation and Setup

110. **TX**: Create Equity Token
     - **Sender**: Owner (has tokenManagerRole)
     - **Contract**: ATKEquityFactory
     - **Function**:
       `createEquity(name, symbol, decimals, modules, countryCode)`
     - **Parameters**:
       - name: "Equity Token"
       - symbol: "ATKQ"
       - decimals: 0
       - modules: [identityVerification, countryAllowList]
       - countryCode: BE
     - **Output**: Equity token proxy address

111. **TX**: Create Identity for Equity Token
     - **Sender**: Equity Token Contract
     - **Contract**: ATKIdentityFactory
     - **Function**: `createIdentity(equityToken.address, true)`

112. **TX**: Register Equity Token Identity
     - **Sender**: Equity Token Contract
     - **Contract**: ATKIdentityRegistry
     - **Function**:
       `registerIdentity(equityToken.address, identity, countryCode)`

113. **TX**: Grant Agent Role on Equity
     - **Sender**: Owner
     - **Contract**: Equity Token
     - **Function**: `grantRole(agentRole, owner.address)`

114. **TX**: Grant Emergency Role on Equity
     - **Sender**: Owner
     - **Contract**: Equity Token
     - **Function**: `grantRole(emergencyRole, owner.address)`

115. **TX**: Add Asset Classification Claim to Equity
     - **Sender**: Equity Token Contract
     - **Contract**: Equity Token Identity
     - **Function**: `addClaim(...)`
     - **Parameters**: Asset classification claim ("Equity")

116. **TX**: Add ISIN Claim to Equity
     - **Sender**: Equity Token Contract
     - **Contract**: Equity Token Identity
     - **Function**: `addClaim(...)`
     - **Parameters**: ISIN claim ("US1234567892")

117. **TX**: Mint Equity Tokens to Investor A
     - **Sender**: Owner (has agentRole)
     - **Contract**: Equity Token
     - **Function**: `mint(investorA.address, 1000n)`

118. **TX**: Transfer Equity Tokens A to B
     - **Sender**: Investor A
     - **Contract**: Equity Token
     - **Function**: `transfer(investorB.address, 500n)`

119. **TX**: Set Cap on Equity Token
     - **Sender**: Owner (has agentRole)
     - **Contract**: Equity Token
     - **Function**: `setCap(10000n)`

### 9.4 Fund Token Creation and Setup

120. **TX**: Create Fund Token
     - **Sender**: Owner (has tokenManagerRole)
     - **Contract**: ATKFundFactory
     - **Function**: `createFund(name, symbol, decimals, modules, countryCode)`
     - **Parameters**:
       - name: "Fund Token"
       - symbol: "ATKF"
       - decimals: 18
       - modules: [identityVerification, countryAllowList]
       - countryCode: BE
     - **Output**: Fund token proxy address

121. **TX**: Create Identity for Fund Token
     - **Sender**: Fund Token Contract
     - **Contract**: ATKIdentityFactory
     - **Function**: `createIdentity(fundToken.address, true)`

122. **TX**: Register Fund Token Identity
     - **Sender**: Fund Token Contract
     - **Contract**: ATKIdentityRegistry
     - **Function**:
       `registerIdentity(fundToken.address, identity, countryCode)`

123. **TX**: Grant Agent Role on Fund
     - **Sender**: Owner
     - **Contract**: Fund Token
     - **Function**: `grantRole(agentRole, owner.address)`

124. **TX**: Grant Emergency Role on Fund
     - **Sender**: Owner
     - **Contract**: Fund Token
     - **Function**: `grantRole(emergencyRole, owner.address)`

125. **TX**: Add Asset Classification Claim to Fund
     - **Sender**: Fund Token Contract
     - **Contract**: Fund Token Identity
     - **Function**: `addClaim(...)`
     - **Parameters**: Asset classification claim ("Fund")

126. **TX**: Add ISIN Claim to Fund
     - **Sender**: Fund Token Contract
     - **Contract**: Fund Token Identity
     - **Function**: `addClaim(...)`
     - **Parameters**: ISIN claim ("US1234567893")

127. **TX**: Mint Fund Tokens to Investor A
     - **Sender**: Owner (has agentRole)
     - **Contract**: Fund Token
     - **Function**: `mint(investorA.address, 1000n * 10^18)`

128. **TX**: Transfer Fund Tokens A to B
     - **Sender**: Investor A
     - **Contract**: Fund Token
     - **Function**: `transfer(investorB.address, 500n * 10^18)`

### 9.5 StableCoin Token Creation and Setup

129. **TX**: Create StableCoin Token
     - **Sender**: Owner (has tokenManagerRole)
     - **Contract**: ATKStableCoinFactory
     - **Function**:
       `createStableCoin(name, symbol, decimals, modules, countryCode)`
     - **Parameters**:
       - name: "StableCoin"
       - symbol: "ATKS"
       - decimals: 18
       - modules: [identityVerification, countryAllowList]
       - countryCode: BE
     - **Output**: StableCoin token proxy address

130. **TX**: Create Identity for StableCoin Token
     - **Sender**: StableCoin Token Contract
     - **Contract**: ATKIdentityFactory
     - **Function**: `createIdentity(stableCoinToken.address, true)`

131. **TX**: Register StableCoin Token Identity
     - **Sender**: StableCoin Token Contract
     - **Contract**: ATKIdentityRegistry
     - **Function**:
       `registerIdentity(stableCoinToken.address, identity, countryCode)`

132. **TX**: Grant Agent Role on StableCoin
     - **Sender**: Owner
     - **Contract**: StableCoin Token
     - **Function**: `grantRole(agentRole, owner.address)`

133. **TX**: Grant Emergency Role on StableCoin
     - **Sender**: Owner
     - **Contract**: StableCoin Token
     - **Function**: `grantRole(emergencyRole, owner.address)`

134. **TX**: Add Asset Classification Claim to StableCoin
     - **Sender**: StableCoin Token Contract
     - **Contract**: StableCoin Token Identity
     - **Function**: `addClaim(...)`
     - **Parameters**: Asset classification claim ("StableCoin")

135. **TX**: Add ISIN Claim to StableCoin
     - **Sender**: StableCoin Token Contract
     - **Contract**: StableCoin Token Identity
     - **Function**: `addClaim(...)`
     - **Parameters**: ISIN claim ("US1234567894")

136. **TX**: Mint StableCoin Tokens to Investor A
     - **Sender**: Owner (has agentRole)
     - **Contract**: StableCoin Token
     - **Function**: `mint(investorA.address, 1000n * 10^18)`

137. **TX**: Transfer StableCoin Tokens A to B
     - **Sender**: Investor A
     - **Contract**: StableCoin Token
     - **Function**: `transfer(investorB.address, 500n * 10^18)`

## Phase 10: Addon Setup

### 10.1 Airdrop Creation

138. **TX**: Deploy Vesting Airdrop
     - **Sender**: Owner (has addonManagerRole)
     - **Contract**: ATKVestingAirdropFactory
     - **Function**:
       `deployProxy(assetAddress, merkleRoot, metadataUri, params)`
     - **Parameters**:
       - assetAddress: StableCoin address
       - merkleRoot: Calculated from distribution
       - metadataUri: "uri1"
       - params: Vesting configuration
     - **Output**: Vesting airdrop address

139. **TX**: Deploy Push Airdrop
     - **Sender**: Owner (has addonManagerRole)
     - **Contract**: ATKPushAirdropFactory
     - **Function**: `deployProxy(assetAddress, merkleRoot, metadataUri)`
     - **Parameters**:
       - assetAddress: StableCoin address
       - merkleRoot: Same as TX 138
       - metadataUri: "uri2"
     - **Output**: Push airdrop address

140. **TX**: Deploy Timebound Airdrop
     - **Sender**: Owner (has addonManagerRole)
     - **Contract**: ATKTimeBoundAirdropFactory
     - **Function**:
       `deployProxy(assetAddress, merkleRoot, metadataUri, params)`
     - **Parameters**:
       - assetAddress: StableCoin address
       - merkleRoot: Same as TX 138
       - metadataUri: "uri3"
       - params: Timebound configuration
     - **Output**: Timebound airdrop address

141. **TX**: Attach Airdrops to StableCoin
     - **Sender**: Owner
     - **Contract**: StableCoin Token
     - **Function**:
       `attachAddon([vestingAirdrop, pushAirdrop, timeboundAirdrop])`
     - **Uses**: Addresses from TXs 138-140

### 10.2 XVP Settlement Creation

142. **TX**: Create XVP Settlement
     - **Sender**: Investor A
     - **Contract**: ATKXvPSettlementFactory
     - **Function**: `create(name, flows, cutoffDate, autoExecute)`
     - **Parameters**:
       - name: "XVP Investor A to Investor B - [timestamp]"
       - flows: [ {asset: stableCoin, from: investorA, to: investorB, amount: 3n
         - 10^18}, {asset: equity, from: investorB, to: investorA, amount: 1n \*
           10^18} ]
       - cutoffDate: current time + 7 days
       - autoExecute: false
     - **Output**: XVP Settlement contract address

## Phase 11: Paused Asset Creation

143. **TX**: Create Paused Asset Token
     - **Sender**: Owner (has tokenManagerRole)
     - **Contract**: ATKEquityFactory
     - **Function**:
       `createEquity(name, symbol, decimals, modules, countryCode)`
     - **Parameters**:
       - name: "Paused Asset"
       - symbol: "ATKP"
       - decimals: 0
       - modules: [identityVerification, countryAllowList]
       - countryCode: BE
     - **Output**: Paused asset token proxy address

144. **TX**: Create Identity for Paused Asset
     - **Sender**: Paused Asset Contract
     - **Contract**: ATKIdentityFactory
     - **Function**: `createIdentity(pausedAsset.address, true)`

145. **TX**: Register Paused Asset Identity
     - **Sender**: Paused Asset Contract
     - **Contract**: ATKIdentityRegistry
     - **Function**:
       `registerIdentity(pausedAsset.address, identity, countryCode)`

146. **TX**: Grant Agent Role on Paused Asset
     - **Sender**: Owner
     - **Contract**: Paused Asset Token
     - **Function**: `grantRole(agentRole, owner.address)`

147. **TX**: Grant Emergency Role on Paused Asset
     - **Sender**: Owner
     - **Contract**: Paused Asset Token
     - **Function**: `grantRole(emergencyRole, owner.address)`

148. **TX**: Add Asset Classification Claim to Paused Asset
     - **Sender**: Paused Asset Contract
     - **Contract**: Paused Asset Identity
     - **Function**: `addClaim(...)`
     - **Parameters**: Asset classification claim ("Equity")

149. **TX**: Add ISIN Claim to Paused Asset
     - **Sender**: Paused Asset Contract
     - **Contract**: Paused Asset Identity
     - **Function**: `addClaim(...)`
     - **Parameters**: ISIN claim ("US1234567895")

150. **TX**: Pause the Paused Asset
     - **Sender**: Owner (has agentRole)
     - **Contract**: Paused Asset Token
     - **Function**: `pause()`

## Phase 12: Identity Recovery

151. **TX**: Create Identity for Investor A New
     - **Sender**: Investor A New (account[2])
     - **Contract**: ATKIdentityFactory
     - **Function**: `createIdentity(investorANew.address, false)`
     - **Output**: Investor A New's identity contract address

152. **TX**: Recover Identity
     - **Sender**: Owner (has identityManagerRole)
     - **Contract**: ATKIdentityRegistry
     - **Function**:
       `recoverIdentity(investorA.address, investorANew.address, newIdentity)`
     - **Parameters**:
       - investorA.address: Lost address
       - investorANew.address: New address
       - newIdentity: From TX 151

## Phase 13: Token Recovery

153. **TX**: Force Recover Deposit Tokens
     - **Sender**: Owner (has emergencyRole)
     - **Contract**: Deposit Token
     - **Function**: `forcedRecoverTokens(lostWallet, newWallet, amount)`
     - **Parameters**:
       - lostWallet: investorA.address
       - newWallet: investorANew.address
       - amount: Balance of investorA in deposit token

154. **TX**: Recover Equity Tokens
     - **Sender**: Investor A New
     - **Contract**: Equity Token
     - **Function**: `recoverTokens(lostWallet, newWallet, amount)`
     - **Parameters**:
       - lostWallet: investorA.address
       - newWallet: investorANew.address
       - amount: Balance of investorA in equity token

155. **TX**: Recover Bond Tokens
     - **Sender**: Investor A New
     - **Contract**: Bond Token
     - **Function**: `recoverTokens(lostWallet, newWallet, amount)`
     - **Parameters**:
       - lostWallet: investorA.address
       - newWallet: investorANew.address
       - amount: Balance of investorA in bond token

156. **TX**: Recover Fund Tokens
     - **Sender**: Investor A New
     - **Contract**: Fund Token
     - **Function**: `recoverTokens(lostWallet, newWallet, amount)`
     - **Parameters**:
       - lostWallet: investorA.address
       - newWallet: investorANew.address
       - amount: Balance of investorA in fund token

157. **TX**: Recover StableCoin Tokens
     - **Sender**: Investor A New
     - **Contract**: StableCoin Token
     - **Function**: `recoverTokens(lostWallet, newWallet, amount)`
     - **Parameters**:
       - lostWallet: investorA.address
       - newWallet: investorANew.address
       - amount: Balance of investorA in stablecoin token

## Phase 14: New Identity Verification

158. **TX**: Add KYC Claim for Investor A New
     - **Sender**: Investor A New
     - **Contract**: Investor A New's Identity
     - **Function**: `addClaim(...)`
     - **Parameters**: KYC claim signed by Claim Issuer

159. **TX**: Add AML Claim for Investor A New
     - **Sender**: Investor A New
     - **Contract**: Investor A New's Identity
     - **Function**: `addClaim(...)`
     - **Parameters**: AML claim signed by Claim Issuer

## Phase 15: ERC20 Token Recovery

160. **TX**: Mint StableCoins to Investor A New
     - **Sender**: Owner (has agentRole)
     - **Contract**: StableCoin Token
     - **Function**: `mint(investorANew.address, 10n)`

161. **TX**: Force Transfer StableCoins to Equity Contract
     - **Sender**: Owner (has emergencyRole)
     - **Contract**: StableCoin Token
     - **Function**: `forcedTransfer(investorANew.address, equity.address, 10n)`
     - **Note**: Required because equity contract is not verified

162. **TX**: Grant Emergency Role on Equity for Recovery
     - **Sender**: Owner
     - **Contract**: Equity Token
     - **Function**: `grantAssetRoles(equity, owner, [emergencyRole])`
     - **Purpose**: Grant emergency role needed for ERC20 recovery

163. **TX**: Recover ERC20 Tokens from Equity Contract
     - **Sender**: Owner (has emergencyRole)
     - **Contract**: Equity Token
     - **Function**: `recoverErc20Tokens(tokenAddress, to, amount)`
     - **Parameters**:
       - tokenAddress: StableCoin address
       - to: investorANew.address
       - amount: 10n

## Summary

**Total Transactions**: 162

### Transaction Breakdown by Phase:

- Phase 1 (Infrastructure): 56 transactions
- Phase 2 (Actor Init): 6 transactions
- Phase 3 (System Roles): 1 transaction
- Phase 4 (Identity Reg): 1 transaction
- Phase 5 (Claim Policy): 2 transactions
- Phase 6 (Verification): 10 transactions
- Phase 7 (Compliance): 4 transactions
- Phase 8 (Asset Mgmt): 1 transaction (combined role grant)
- Phase 9 (Assets): 55 transactions
- Phase 10 (Addons): 4 transactions
- Phase 11 (Paused Asset): 8 transactions
- Phase 12 (Identity Recovery): 2 transactions
- Phase 13 (Token Recovery): 5 transactions
- Phase 14 (New Identity): 2 transactions
- Phase 15 (ERC20 Recovery): 4 transactions

### Key Dependencies:

- Many transactions depend on outputs from previous transactions (addresses,
  roles)
- Identity claims must be signed by the Claim Issuer off-chain
- Compliance modules must be deployed before they can be used in token creation
- Roles must be granted before performing privileged operations
- Token identities are created automatically during token deployment

## Predeployed Contracts Summary

When using SettleMint networks with genesis allocations, the following contracts
are predeployed and their deployment transactions (TXs 1-44) should be SKIPPED:

### Core Infrastructure

- ATKForwarder: 0x5e771e1417100000000000000000000000020099

### System Implementations

- ATKSystemImplementation: 0x5e771e1417100000000000000000000000020087
- ATKComplianceImplementation: 0x5e771e1417100000000000000000000000020001
- ATKIdentityRegistryImplementation: 0x5e771e1417100000000000000000000000020002
- ATKIdentityRegistryStorageImplementation:
  0x5e771e1417100000000000000000000000020003
- ATKSystemTrustedIssuersRegistryImplementation:
  0x5e771e1417100000000000000000000000020004
- ATKTopicSchemeRegistryImplementation:
  0x5e771e1417100000000000000000000000020008
- ATKIdentityFactoryImplementation: 0x5e771e1417100000000000000000000000020005
- ATKIdentityImplementation: 0x5e771e1417100000000000000000000000020006
- ATKContractIdentityImplementation: 0x5e771e1417100000000000000000000000020007
- ATKTokenAccessManagerImplementation:
  0x5e771e1417100000000000000000000000020009
- ATKSystemAccessManagerImplementation:
  0x5e771e141710000000000000000000000002000a

### Registry Implementations

- ATKTokenFactoryRegistryImplementation:
  0x5e771e1417100000000000000000000000020010
- ATKComplianceModuleRegistryImplementation:
  0x5e771e1417100000000000000000000000020011
- ATKSystemAddonRegistryImplementation:
  0x5e771e1417100000000000000000000000020012

### Asset Implementations

- ATKBondImplementation: 0x5e771e1417100000000000000000000000020020
- ATKBondFactoryImplementation: 0x5e771e1417100000000000000000000000020021
- ATKDepositImplementation: 0x5e771e1417100000000000000000000000020022
- ATKDepositFactoryImplementation: 0x5e771e1417100000000000000000000000020023
- ATKEquityImplementation: 0x5e771e1417100000000000000000000000020024
- ATKEquityFactoryImplementation: 0x5e771e1417100000000000000000000000020025
- ATKFundImplementation: 0x5e771e1417100000000000000000000000020026
- ATKFundFactoryImplementation: 0x5e771e1417100000000000000000000000020027
- ATKStableCoinImplementation: 0x5e771e1417100000000000000000000000020028
- ATKStableCoinFactoryImplementation: 0x5e771e1417100000000000000000000000020029

### Addon Implementations

- ATKFixedYieldScheduleFactoryImplementation:
  0x5e771e1417100000000000000000000000020030
- ATKXvPSettlementImplementation: 0x5e771e1417100000000000000000000000020031
- ATKXvPSettlementFactoryImplementation:
  0x5e771e1417100000000000000000000000020032
- ATKVestingAirdropFactoryImplementation:
  0x5e771e1417100000000000000000000000020033
- ATKPushAirdropFactoryImplementation:
  0x5e771e1417100000000000000000000000020034
- ATKTimeBoundAirdropFactoryImplementation: Not listed in genesis (deployed as
  needed)
- ATKVaultImplementation: Not predeployed (needs configuration)
- ATKVaultFactoryImplementation: Not predeployed (needs configuration)

### Compliance Modules

- SMARTIdentityVerificationComplianceModule:
  0x5e771e1417100000000000000000000000020100
- CountryAllowListComplianceModule: 0x5e771e1417100000000000000000000000020101
- CountryBlockListComplianceModule: 0x5e771e1417100000000000000000000000020102
- AddressBlockListComplianceModule: 0x5e771e1417100000000000000000000000020103
- IdentityBlockListComplianceModule: 0x5e771e1417100000000000000000000000020104
- IdentityAllowListComplianceModule: 0x5e771e1417100000000000000000000000020105

### System Factory

- ATKSystemFactory: 0x5e771e1417100000000000000000000000020088

**Starting Point for Predeployed Networks**: Begin execution at TX 45 (Create
System) as all implementation contracts and the system factory are already
deployed.

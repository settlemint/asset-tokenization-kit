// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.27;

import { Test, console, Vm } from "forge-std/Test.sol";
import { TREXGateway } from "../contracts/shared/erc3643/factory/TREXGateway.sol";
import { TREXImplementationAuthority } from
    "../contracts/shared/erc3643/proxy/authority/TREXImplementationAuthority.sol";
import { ClaimTopicsRegistry } from "../contracts/shared/erc3643/registry/implementation/ClaimTopicsRegistry.sol";
import { TrustedIssuersRegistry } from "../contracts/shared/erc3643/registry/implementation/TrustedIssuersRegistry.sol";
import { IdentityRegistryStorage } from
    "../contracts/shared/erc3643/registry/implementation/IdentityRegistryStorage.sol";
import { ModularCompliance } from "../contracts/shared/erc3643/compliance/modular/ModularCompliance.sol";
import { Token } from "../contracts/shared/erc3643/token/Token.sol";
import { ITREXImplementationAuthority } from
    "../contracts/shared/erc3643/proxy/authority/ITREXImplementationAuthority.sol";
import { IdentityRegistry } from "../contracts/shared/erc3643/registry/implementation/IdentityRegistry.sol";
import { ITREXFactory } from "../contracts/shared/erc3643/factory/ITREXFactory.sol";
import { Gateway } from "../contracts/shared/onchainid/gateway/Gateway.sol";
import { IIdentity } from "../contracts/shared/onchainid/interface/IIdentity.sol";
import { AgentManager } from "../contracts/shared/erc3643/roles/permissioning/agent/AgentManager.sol";
import { TREXFactory } from "../contracts/shared/erc3643/factory/TREXFactory.sol";
import { Identity } from "../contracts/shared/onchainid/Identity.sol";
import { ImplementationAuthority } from "../contracts/shared/onchainid/proxy/ImplementationAuthority.sol";
import { IdFactory } from "../contracts/shared/onchainid/factory/IdFactory.sol";
import { AgentRole } from "../contracts/shared/erc3643/roles/AgentRole.sol";
import { ClaimIssuer } from "../contracts/shared/onchainid/ClaimIssuer.sol";
import { IClaimIssuer } from "../contracts/shared/onchainid/interface/IClaimIssuer.sol";

contract GatewayTest is Test {
    TREXImplementationAuthority public tokenImplementationAuthority;

    address public platformAdmin = makeAddr("Platform Admin");
    address public organization1 = makeAddr("Organization 1");
    address public tokenAgent1 = makeAddr("Token Agent 1");
    address public tokenAgent2 = makeAddr("Token Agent 2");
    address public client1 = makeAddr("Client 1");

    uint256 private claimIssuerAdminPrivateKey = 0x12345;
    address public claimIssuerAdmin = vm.addr(claimIssuerAdminPrivateKey);

    // Store deployed contract addresses globally
    address public tokenAddress;
    address public identityRegistryAddress;
    address public claimTopicsRegistryAddress;
    address public trustedIssuersRegistryAddress;
    address public identityRegistryStorageAddress;
    address public modularComplianceAddress;
    address public agentManagerAddress;
    address public identityGateway;
    address public gateway;
    address public claimIssuerAddress;

    uint256 public constant CLAIM_TOPIC_KYC = 1;
    uint256 public constant CLAIM_TOPIC_AML = 2;

    // Key types and purposes (from ERC-725)
    uint256 constant MANAGEMENT_PURPOSE = 1;
    uint256 constant CLAIM_SIGNER_PURPOSE = 3;
    uint256 constant ECDSA_TYPE = 1;

    function setUp() public {
        vm.startPrank(platformAdmin);
        // ERC3643
        ClaimTopicsRegistry claimTopicsRegistry = new ClaimTopicsRegistry();
        TrustedIssuersRegistry trustedIssuersRegistry = new TrustedIssuersRegistry();
        IdentityRegistryStorage identityRegistryStorage = new IdentityRegistryStorage();
        IdentityRegistry identityRegistry = new IdentityRegistry();
        ModularCompliance modularCompliance = new ModularCompliance();
        Token token = new Token();

        tokenImplementationAuthority = new TREXImplementationAuthority(true, address(0), address(0));
        tokenImplementationAuthority.addAndUseTREXVersion(
            ITREXImplementationAuthority.Version({ major: 1, minor: 0, patch: 0 }),
            ITREXImplementationAuthority.TREXContracts({
                tokenImplementation: address(token),
                ctrImplementation: address(claimTopicsRegistry),
                irImplementation: address(identityRegistry),
                irsImplementation: address(identityRegistryStorage),
                tirImplementation: address(trustedIssuersRegistry),
                mcImplementation: address(modularCompliance)
            })
        );

        Identity identity = new Identity(address(0), true);
        ImplementationAuthority identityImplementationAuthority = new ImplementationAuthority(address(identity));
        IdFactory identityFactory = new IdFactory(address(identityImplementationAuthority));
        // Factory
        TREXFactory factory = new TREXFactory(address(tokenImplementationAuthority), address(identityFactory));
        identityFactory.addTokenFactory(address(factory));
        identityGateway = address(new Gateway(address(identityFactory), new address[](0)));

        // Gateway
        gateway = address(new TREXGateway(address(factory), true));
        TREXGateway(gateway).addAgent(platformAdmin);
        factory.transferOwnership(address(gateway));
        identityFactory.transferOwnership(address(identityGateway));

        vm.stopPrank();
    }

    function onboardIssuer(TREXGateway gateway_, address platformAdmin_, address issuer_) public {
        vm.startPrank(platformAdmin_);
        gateway_.addDeployer(issuer_);
        vm.stopPrank();
    }

    function deployTokenSuite(
        TREXGateway gateway_,
        address issuer_
    )
        public
        returns (address deployedAgentManagerAddress)
    {
        vm.startPrank(issuer_);
        // Start recording logs to capture events
        vm.recordLogs();

        // Deploy token
        gateway_.deployTREXSuite(
            ITREXFactory.TokenDetails({
                // address of the owner of all contracts
                owner: issuer_,
                // name of the token
                name: "Test Token",
                // symbol / ticker of the token
                symbol: "TT",
                // decimals of the token (can be between 0 and 18)
                decimals: 8,
                // identity registry storage address
                // set it to ZERO address if you want to deploy a new storage
                // if an address is provided, please ensure that the factory is set as owner of the contract
                irs: address(0),
                // list of agents of the identity registry (can be set to an AgentManager contract)
                irAgents: new address[](0),
                // list of agents of the token
                tokenAgents: new address[](0),
                // ONCHAINID of the token
                ONCHAINID: address(0),
                // modules to bind to the compliance, indexes are corresponding to the settings callData indexes
                // if a module doesn't require settings, it can be added at the end of the array, at index >
                // settings.length
                complianceModules: new address[](0),
                // settings calls for compliance modules
                complianceSettings: new bytes[](0)
            }),
            ITREXFactory.ClaimDetails({
                // claim topics required
                claimTopics: new uint256[](0),
                // trusted issuers addresses
                issuers: new address[](0),
                // claims that issuers are allowed to emit, by index, index corresponds to the `issuers` indexes
                issuerClaims: new uint256[][](0)
            })
        );

        // Get the recorded logs
        Vm.Log[] memory entries = vm.getRecordedLogs();

        // Find the TREXSuiteDeployed event
        // The TREXSuiteDeployed event signature from ITREXFactory is:
        // event TREXSuiteDeployed(address indexed _token, address _ir, address _irs, address _tir, address _ctr,
        // address _mc, string indexed _salt);

        bytes32 eventSignature = keccak256("TREXSuiteDeployed(address,address,address,address,address,address,string)");

        // Loop through logs to find TREXSuiteDeployed event
        for (uint256 i = 0; i < entries.length; i++) {
            if (entries[i].topics[0] == eventSignature) {
                // Found the event, topic[1] has the indexed token address
                tokenAddress = address(uint160(uint256(entries[i].topics[1])));

                // Decode the non-indexed parameters
                // The data contains: _ir, _irs, _tir, _ctr, _mc (the _salt is indexed so it's in topics)
                (
                    identityRegistryAddress,
                    identityRegistryStorageAddress,
                    trustedIssuersRegistryAddress,
                    claimTopicsRegistryAddress,
                    modularComplianceAddress
                ) = abi.decode(entries[i].data, (address, address, address, address, address));

                break;
            }
        }

        // solhint-disable-next-line no-console
        console.log("Final addresses:");
        // solhint-disable-next-line no-console
        console.log("tokenAddress", tokenAddress);
        // solhint-disable-next-line no-console
        console.log("identityRegistryAddress", identityRegistryAddress);
        // solhint-disable-next-line no-console
        console.log("identityRegistryStorageAddress", identityRegistryStorageAddress);
        // solhint-disable-next-line no-console
        console.log("claimTopicsRegistryAddress", claimTopicsRegistryAddress);
        // solhint-disable-next-line no-console
        console.log("trustedIssuersRegistryAddress", trustedIssuersRegistryAddress);
        // solhint-disable-next-line no-console
        console.log("modularComplianceAddress", modularComplianceAddress);

        AgentManager am = new AgentManager(tokenAddress);
        deployedAgentManagerAddress = address(am);
        AgentRole(tokenAddress).addAgent(address(am));
        AgentRole(identityRegistryAddress).addAgent(address(am));

        am.addAgentAdmin(issuer_);

        vm.stopPrank();
    }

    function createClientIdentity(
        Gateway identityGateway_,
        address clientWalletAddress_,
        uint8 countryCode_,
        address agentWalletAddress_,
        IIdentity agent_,
        address localAgentManagerAddress
    )
        public
    {
        IIdentity clientId = IIdentity(identityGateway_.deployIdentityForWallet(clientWalletAddress_));

        vm.startPrank(agentWalletAddress_);
        // country numbers from https://en.wikipedia.org/wiki/ISO_3166-1_numeric
        AgentManager(localAgentManagerAddress).callRegisterIdentity(
            clientWalletAddress_, clientId, countryCode_, agent_
        );
        vm.stopPrank();
    }

    function setupAgent(
        Gateway identityGateway_,
        address agentWalletAddress,
        bool whiteListManager,
        bool supplyModifier,
        address localAgentManagerAddress
    )
        public
        returns (IIdentity agentId)
    {
        agentId = IIdentity(identityGateway_.deployIdentityForWallet(agentWalletAddress));

        vm.startPrank(organization1);
        if (whiteListManager) {
            AgentManager(localAgentManagerAddress).addWhiteListManager(address(agentId));
        }
        if (supplyModifier) {
            AgentManager(localAgentManagerAddress).addSupplyModifier(address(agentId));
        }
        vm.stopPrank();
    }

    function addKeyToIdentity(IIdentity identity, bytes32 key, uint256 purpose, uint256 keyType) internal {
        // Check if the key already exists with the given purpose
        bool hasKey = identity.keyHasPurpose(key, purpose);
        if (!hasKey) {
            // Add the key if it doesn't exist
            identity.addKey(key, purpose, keyType);
            console.log("Key added:");
            console.logBytes32(key);
        } else {
            console.log("Key already exists:");
            console.logBytes32(key);
        }
    }

    function createClaimIssuerAndAddtoRegistry(address issuer_, address trustedIssuersRegistryAddress_) public {
        vm.startPrank(claimIssuerAdmin);
        ClaimIssuer claimIssuer = new ClaimIssuer(claimIssuerAdmin);
        claimIssuerAddress = address(claimIssuer);
        console.log("ClaimIssuer deployed at:", address(claimIssuerAddress));

        // Add the claim issuer admin key directly to the identity
        bytes32 signerKey = keccak256(abi.encode(claimIssuerAdmin));
        addKeyToIdentity(IIdentity(address(claimIssuer)), signerKey, CLAIM_SIGNER_PURPOSE, ECDSA_TYPE);
        vm.stopPrank();

        vm.startPrank(issuer_);
        uint256[] memory claimTopics = new uint256[](2);
        claimTopics[0] = CLAIM_TOPIC_KYC;
        claimTopics[1] = CLAIM_TOPIC_AML;
        TrustedIssuersRegistry(trustedIssuersRegistryAddress_).addTrustedIssuer(IClaimIssuer(claimIssuerAddress), claimTopics);
        vm.stopPrank();
    }

    function addClaimTopic(uint256 claimTopic_) public {
        vm.startPrank(organization1);
        ClaimTopicsRegistry(claimTopicsRegistryAddress).addClaimTopic(claimTopic_);
        vm.stopPrank();
    }
function createAndVerifySignature(
        uint256 claimIssuerPrivKey,
        IIdentity clientIdentity,
        uint256 claimTopic,
        string memory claimData
    )
        internal
        pure
        returns (bytes32 dataHash, bytes memory signature)
    {
        bytes memory data = abi.encode(claimData);
        dataHash = keccak256(abi.encode(clientIdentity, claimTopic, data));

        bytes32 prefixedHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", dataHash));

        // Sign with the claim issuer private key
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(claimIssuerPrivKey, prefixedHash);
        signature = abi.encodePacked(r, s, v);

        // Verify signature
        address recoveredAddr = ecrecover(prefixedHash, v, r, s);
        address expectedSigner = vm.addr(claimIssuerPrivKey);

        if (recoveredAddr != expectedSigner) {
            console.log("Signature verification failed:");
            console.log("Expected signer:", expectedSigner);
            console.log("Recovered signer:", recoveredAddr);
            revert("Signature verification failed");
        }

        return (dataHash, signature);
    }

    function verifyClaimWithIssuer(
        IClaimIssuer claimIssuer,
        IIdentity clientIdentity,
        uint256 claimTopic,
        bytes memory signature,
        bytes memory data
    )
        internal
        view
        returns (bool)
    {
        try claimIssuer.isClaimValid(clientIdentity, claimTopic, signature, data) returns (bool result) {
            console.log("Claim validation result:", result);
            return result;
        } catch Error(string memory reason) {
            console.log("Claim validation error:", reason);
            revert(string(abi.encodePacked("Claim validation failed: ", reason)));
        }
    }

    function addClaimToIdentity(
        address client,
        ClaimIssuer claimIssuer,
        uint256 claimIssuerPrivKey,
        uint256 claimTopic,
        string memory claimData
    )
        public
    {
        IIdentity clientIdentity = IIdentity(Token(tokenAddress).identityRegistry().identity(client));
        console.log("Client identity at:", address(clientIdentity));

        bytes memory data = abi.encode(claimData);
        (bytes32 dataHash, bytes memory signature) =
            createAndVerifySignature(claimIssuerPrivKey, clientIdentity, claimTopic, claimData);

        console.log("Data hash:");
        console.logBytes32(dataHash);

        // Verify claim with issuer
        vm.startPrank(client);
        bool isValid =
            verifyClaimWithIssuer(IClaimIssuer(address(claimIssuer)), clientIdentity, claimTopic, signature, data);

        require(isValid, "Claim not valid with issuer");

        // Add claim to identity
        try clientIdentity.addClaim(claimTopic, ECDSA_TYPE, address(claimIssuer), signature, data, "") {
            console.log("Claim successfully added to identity");
        } catch Error(string memory reason) {
            console.log("Failed to add claim:", reason);
            revert(string(abi.encodePacked("Failed to add claim: ", reason)));
        }
        vm.stopPrank();
    }

    /*
    * @dev First user is detected logging in to the platform
    *      The OTP/Pincode is checked and is found to be missing
    *      During the sign up the basic user information is already entered, which is enough for a platform admin
    *
    *      The user is presented with the onboarding wizard
    *      Step 1: Set your pincode/otp
    *      Step 2: Deploy the platform (in wizard portal call), the gateway starts disabled!
    *      Step 3: Select the default platform currency (EUR),
    *           on setting this we can kick of the exchange rate fetcher,
    *           when we have more, add a choice of provider for this
    *      On completion of the wizard, the platform admin is presented with the dasbhoard in platform management
    *      Which features a big next steps section.
    *
    *      Some ideas, could we deploy an entire setup beforehand and have a "claim" action?
    *      And how would me we make follow up deploys when devs start customizing more user friendly?
    */
    function test_OnboardFirstAdmin() public {
        // onboardFirstAdmin(platformAdmin, address(tokenImplementationAuthority));
    }

    /*
    * @dev First item on the next steps list
    *       Item 1: Configure the gateway
    *           - configure deployment fee and enable it if desired
    *           - enable public deployment
    *           - this happens on a settings page
    *       Item 2: Invite organizations
    *           - add a new organization with some fields (like name but also gateway discount if applicable)
    *           - tie this into the organization plugin from better auth
    *           - we need to give an organization a key of their own. the org admins can use it (how to handle the
    OTP/pincode here?) <- this does not feel right
    *           - there is also an upload CSV version of this to do so in batch
    *           - This happen via an action button on the organization list page (also needs a detail page with tabs)
    *           - There is an alternative option in the list of organizations, where an org that is created via a user
    registering that it can be "enabled" as issuer organization
    *       Invited organization user has a next steps section in the issuer dashboard
    *       Current dashboard needs to be filtered by organization, full dashboard moves into platform management
    * @dev First item on the next steps list for the organization admin
    *       Item 1: Invite token agents
    *           - agents are a role on the admin plugin
    *           - and are stored in the AgentManager contract
    *           - again also allow CSV upload with invite, add one by one, and change the role of organization users
    *       Item 2: Invite identity agents
    *           - same as above
    *           - the org admin and identity agents see a section for user management
    *           - it should hold only the users for this org <- we need to make a choice here, is the ATK multi org or
    not? Single org would make a lot of sense too
    */
    function test_OnboardIssuer() public {
        onboardIssuer(TREXGateway(gateway), platformAdmin, organization1);
    }

    /*
    * @dev If a user is an agent, they can deploy a token suite
    *        - using the asset designer
    *        - useing the full modal design
    *        - token agents are again users from the org, same as identity admins
    *        - BUT both lists of agents need to tie into the plugin system so that plugins can have a key and do
    administrative actions (collateral, kyc, redemption, etc)
    */
    function test_DeployTokenSuite() public {
        onboardIssuer(TREXGateway(gateway), platformAdmin, organization1);
        address localAgentManagerAddress = deployTokenSuite(TREXGateway(gateway), organization1);
        assertTrue(localAgentManagerAddress != address(0)); // Add a simple check
    }

    /**
     * @dev - holders can be invited one by one or by CSV upload
     *      - existing wallets can also be assigned as holders
     *      - holders get a KYC step in the onboarding process
     *      - identity agents need to approve the KYC info before the user can interact with the token(s), i suggest we
     * share the identity storage between tokens in the same org (or ask the user what they want to do)
     *      - plugins can do the same
     *      - as a claim requirement for the token i would go for a simple selection, kyc ok, age, region
     *      - should we create the identity on the fly when we create a wallet?
     */
    function test_Mint() public {
        onboardIssuer(TREXGateway(gateway), platformAdmin, organization1);
        address localAgentManagerAddress = deployTokenSuite(TREXGateway(gateway), organization1);

        // Now add a second agent to the token
        vm.startPrank(organization1); // The issuer1 is the owner of the token
        IIdentity tokenAgent2Id =
            setupAgent(Gateway(identityGateway), tokenAgent2, true, true, localAgentManagerAddress);
        vm.stopPrank();

        createClientIdentity(
            Gateway(identityGateway), client1, 56, tokenAgent2, tokenAgent2Id, localAgentManagerAddress
        ); // 56 is Belgium

        createClaimIssuerAndAddtoRegistry(organization1, trustedIssuersRegistryAddress);
        addClaimTopic(CLAIM_TOPIC_KYC);
        addClaimTopic(CLAIM_TOPIC_AML);

        addClaimToIdentity(client1, ClaimIssuer(claimIssuerAddress), claimIssuerAdminPrivateKey, CLAIM_TOPIC_KYC, "KYC_VERIFIED");
        addClaimToIdentity(client1, ClaimIssuer(claimIssuerAddress), claimIssuerAdminPrivateKey, CLAIM_TOPIC_AML, "AML_VERIFIED");


        vm.startPrank(tokenAgent2);
        // Mint 1000 tokens to the owner
        AgentManager(localAgentManagerAddress).callMint(client1, 1000, tokenAgent2Id);

        vm.stopPrank();

                assertEq(Token(tokenAddress).balanceOf(client1), 1000);

    }
}

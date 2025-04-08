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
import { PlatformFactory } from "../contracts/shared/PlatformFactory.sol";
import { ITREXFactory } from "../contracts/shared/erc3643/factory/ITREXFactory.sol";
import { Gateway } from "../contracts/shared/onchainid/gateway/Gateway.sol";
import { IIdentity } from "../contracts/shared/onchainid/interface/IIdentity.sol";
import { AgentManager } from "../contracts/shared/erc3643/roles/permissioning/agent/AgentManager.sol";

contract GatewayTest is Test {
    TREXImplementationAuthority public tokenImplementationAuthority;
    PlatformFactory public platformFactory;

    address public predeployer = makeAddr("Predeployer");
    address public platformAdmin = makeAddr("Platform Admin");

    address public organization1 = makeAddr("Organization 1");

    address public tokenAgent1 = makeAddr("Token Agent 1");
    address public tokenAgent2 = makeAddr("Token Agent 2");

    address public client1 = makeAddr("Client 1");

    // Store deployed contract addresses globally
    address public tokenAddress;
    address public identityRegistryAddress;
    address public claimTopicsRegistryAddress;
    address public trustedIssuersRegistryAddress;
    address public identityRegistryStorageAddress;
    address public modularComplianceAddress;
    address public agentManagerAddress;

    function setUp() public {
        vm.startPrank(predeployer);
        // ERC3643
        ClaimTopicsRegistry claimTopicsRegistry = new ClaimTopicsRegistry();
        TrustedIssuersRegistry trustedIssuersRegistry = new TrustedIssuersRegistry();
        IdentityRegistryStorage identityRegistryStorage = new IdentityRegistryStorage();
        IdentityRegistry identityRegistry = new IdentityRegistry();
        ModularCompliance modularCompliance = new ModularCompliance();
        Token token = new Token();

        tokenImplementationAuthority = new TREXImplementationAuthority(true, address(0), address(0));
        tokenImplementationAuthority.addAndUseTREXVersion(
            ITREXImplementationAuthority.Version({ major: 4, minor: 2, patch: 0 }),
            ITREXImplementationAuthority.TREXContracts({
                tokenImplementation: address(token),
                ctrImplementation: address(claimTopicsRegistry),
                irImplementation: address(identityRegistry),
                irsImplementation: address(identityRegistryStorage),
                tirImplementation: address(trustedIssuersRegistry),
                mcImplementation: address(modularCompliance)
            })
        );

        platformFactory = new PlatformFactory();

        vm.stopPrank();
    }

    function onboardFirstAdmin(
        address platformAdmin_,
        address tokenImplementationAuthority_
    )
        public
        returns (TREXGateway gateway, Gateway identityGateway)
    {
        vm.startPrank(platformAdmin_);
        (gateway, identityGateway) =
            platformFactory.createPlatform(platformAdmin_, tokenImplementationAuthority_, new address[](0));
        vm.stopPrank();
    }

    function onboardIssuer(TREXGateway gateway_, address platformAdmin_, address issuer_) public {
        vm.startPrank(platformAdmin_);
        gateway_.addDeployer(issuer_);
        vm.stopPrank();
    }

    function deployTokenSuite(TREXGateway gateway_, address issuer_) public {
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

        bytes32 eventSignature =
            keccak256("TREXSuiteDeployed(address,address,address,address,address,address,address,string)");

        // Loop through logs to find TREXSuiteDeployed event
        for (uint256 i = 0; i < entries.length; i++) {
            if (entries[i].topics[0] == eventSignature) {
                // Found the event, topic[1] has the indexed token address
                tokenAddress = address(uint160(uint256(entries[i].topics[1])));

                // Decode the non-indexed parameters
                // The data contains: _ir, _irs, _tir, _ctr, _mc, _am (the _salt is indexed so it's in topics)
                (
                    identityRegistryAddress,
                    identityRegistryStorageAddress,
                    trustedIssuersRegistryAddress,
                    claimTopicsRegistryAddress,
                    modularComplianceAddress,
                    agentManagerAddress
                ) = abi.decode(entries[i].data, (address, address, address, address, address, address));

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
        // solhint-disable-next-line no-console
        console.log("agentManagerAddress", agentManagerAddress);
    }

    function createClientIdentity(
        Gateway identityGateway_,
        address clientWalletAddress_,
        uint8 countryCode_,
        address agentWalletAddress_,
        IIdentity agent_
    )
        public
    {
        IIdentity clientId = IIdentity(identityGateway_.deployIdentityForWallet(clientWalletAddress_));

        vm.startPrank(agentWalletAddress_);
        // country numbers from https://en.wikipedia.org/wiki/ISO_3166-1_numeric
        AgentManager(agentManagerAddress).callRegisterIdentity(clientWalletAddress_, clientId, countryCode_, agent_);
        vm.stopPrank();
    }

    function setupAgent(
        Gateway identityGateway_,
        address agentWalletAddress,
        bool whiteListManager,
        bool supplyModifier
    )
        public
        returns (IIdentity agentId)
    {
        agentId = IIdentity(identityGateway_.deployIdentityForWallet(agentWalletAddress));

        vm.startPrank(organization1);
        if (whiteListManager) {
            AgentManager(agentManagerAddress).addWhiteListManager(address(agentId));
        }
        if (supplyModifier) {
            AgentManager(agentManagerAddress).addSupplyModifier(address(agentId));
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
        onboardFirstAdmin(platformAdmin, address(tokenImplementationAuthority));
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
        (TREXGateway gateway,) = onboardFirstAdmin(platformAdmin, address(tokenImplementationAuthority));
        onboardIssuer(gateway, platformAdmin, organization1);
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
        (TREXGateway gateway,) = onboardFirstAdmin(platformAdmin, address(tokenImplementationAuthority));
        onboardIssuer(gateway, platformAdmin, organization1);
        deployTokenSuite(gateway, organization1);
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
        (TREXGateway gateway, Gateway identityGateway) =
            onboardFirstAdmin(platformAdmin, address(tokenImplementationAuthority));
        onboardIssuer(gateway, platformAdmin, organization1);
        deployTokenSuite(gateway, organization1);

        // Now add a second agent to the token
        vm.startPrank(organization1); // The issuer1 is the owner of the token
        IIdentity tokenAgent2Id = setupAgent(identityGateway, tokenAgent2, true, true);
        vm.stopPrank();

        createClientIdentity(identityGateway, client1, 56, tokenAgent2, tokenAgent2Id); // 56 is Belgium

        vm.startPrank(tokenAgent2);
        // Mint 1000 tokens to the owner
        AgentManager(agentManagerAddress).callMint(client1, 1000, tokenAgent2Id);

        vm.stopPrank();
    }
}

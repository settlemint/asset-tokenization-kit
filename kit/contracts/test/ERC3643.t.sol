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

contract GatewayTest is Test {
    TREXImplementationAuthority public tokenImplementationAuthority;
    PlatformFactory public platformFactory;

    address public predeployer = makeAddr("Predeployer");
    address public platformAdmin = makeAddr("Platform Admin");
    address public issuer1 = makeAddr("Issuer 1");
    address public issuer2 = makeAddr("Issuer 2");
    address public issuer3 = makeAddr("Issuer 3");
    address public tokenAgent1 = makeAddr("Token Agent 1");
    address public tokenAgent2 = makeAddr("Token Agent 2");
    address public tokenAgent3 = makeAddr("Token Agent 3");

    // Store deployed contract addresses globally
    address public tokenAddress;
    address public identityRegistryAddress;
    address public claimTopicsRegistryAddress;
    address public trustedIssuersRegistryAddress;
    address public identityRegistryStorageAddress;
    address public modularComplianceAddress;

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
        returns (TREXGateway gateway)
    {
        vm.startPrank(platformAdmin_);
        gateway = platformFactory.createPlatform(platformAdmin_, tokenImplementationAuthority_);
        vm.stopPrank();
        return gateway;
    }

    function onboardIssuer(TREXGateway gateway_, address platformAdmin_, address issuer_) public {
        vm.startPrank(platformAdmin_);
        gateway_.addDeployer(issuer_);
        vm.stopPrank();
    }

    function deployTokenSuite(TREXGateway gateway_, address issuer_, address[] memory managers_) public {
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
                decimals: 18,
                // identity registry storage address
                // set it to ZERO address if you want to deploy a new storage
                // if an address is provided, please ensure that the factory is set as owner of the contract
                irs: address(0),
                // ONCHAINID of the token
                ONCHAINID: address(0),
                // list of agents of the identity registry (can be set to an AgentManager contract)
                irAgents: new address[](0),
                // list of agents of the token
                tokenAgents: managers_,
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
    }

    function test_OnboardFirstAdmin() public {
        TREXGateway gateway = onboardFirstAdmin(platformAdmin, address(tokenImplementationAuthority));
        assertTrue(gateway.getPublicDeploymentStatus());
    }

    function test_OnboardIssuer() public {
        TREXGateway gateway = onboardFirstAdmin(platformAdmin, address(tokenImplementationAuthority));
        onboardIssuer(gateway, platformAdmin, issuer1);
    }

    function test_DeployTokenSuite() public {
        TREXGateway gateway = onboardFirstAdmin(platformAdmin, address(tokenImplementationAuthority));
        onboardIssuer(gateway, platformAdmin, issuer1);

        address[] memory tokenAgents = new address[](1);
        tokenAgents[0] = tokenAgent1;
        deployTokenSuite(gateway, issuer1, tokenAgents);
    }

    // function test_Mint() public {
    //     vm.startPrank(predeployer);
    //     // Mint 1000 tokens to the owner
    //     Token(tokenAddress).mint(address(this), 1000);
    // }
}

// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { Test } from "forge-std/Test.sol";
import { IATKIdentityFactory } from "../../../contracts/system/identity-factory/IATKIdentityFactory.sol";
import { SystemUtils } from "../../utils/SystemUtils.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { SMARTToken } from "../../smart/examples/SMARTToken.sol";
import { SMARTComplianceModuleParamPair } from
    "../../../contracts/smart/interface/structs/SMARTComplianceModuleParamPair.sol";
import { ATKTopics } from "../../../contracts/system/ATKTopics.sol";
import { IIdentity } from "@onchainid/contracts/interface/IIdentity.sol";
import { IERC735 } from "@onchainid/contracts/interface/IERC735.sol";
import { IContractWithIdentity } from "../../../contracts/system/identity-factory/IContractWithIdentity.sol";

contract ATKIdentityFactoryImplementationTest is Test {
    SystemUtils public systemUtils;
    IATKIdentityFactory public factory;
    address public admin;
    address public user;
    address public unauthorizedUser;

    address public accessManager;

    event IdentityCreated(address indexed sender, address indexed identity, address indexed wallet);
    event ContractIdentityCreated(address indexed sender, address indexed identity, address indexed contractAddress);

    function setUp() public {
        admin = makeAddr("admin");
        user = makeAddr("user");
        unauthorizedUser = makeAddr("unauthorizedUser");

        systemUtils = new SystemUtils(admin);

        vm.startPrank(admin);

        accessManager = address(systemUtils.createTokenAccessManager(admin));

        factory = systemUtils.identityFactory();

        vm.stopPrank();
    }

    function testCreateIdentity() public {
        bytes32[] memory managementKeys = new bytes32[](0);

        vm.expectEmit(true, false, true, true);
        emit IdentityCreated(admin, address(0), user); // address(0) will be replaced with actual

        vm.prank(admin);
        address identity = factory.createIdentity(user, managementKeys);

        assertTrue(identity != address(0));
        assertEq(factory.getIdentity(user), identity);
    }

    function testCreateTokenIdentity() public {
        SMARTToken token = new SMARTToken(
            "Token",
            "TKN",
            18,
            1_000_000 ether,
            address(0),
            address(systemUtils.identityRegistry()),
            address(systemUtils.compliance()),
            new SMARTComplianceModuleParamPair[](0),
            systemUtils.topicSchemeRegistry().getTopicId(ATKTopics.TOPIC_ASSET_COLLATERAL),
            address(accessManager)
        );

        vm.expectEmit(true, false, true, true);
        emit ContractIdentityCreated(admin, address(0), address(token)); // address(0) will be replaced with actual

        vm.prank(admin);
        address identity = factory.createContractIdentity(address(token));

        assertTrue(identity != address(0));
        assertEq(factory.getContractIdentity(address(token)), identity);
    }

    function testCreateTokenIdentityRevertsWithUnauthorizedCaller() public {
        address tokenAddress = makeAddr("token");

        vm.prank(unauthorizedUser);
        vm.expectRevert();
        factory.createContractIdentity(tokenAddress);
    }

    function testCreateIdentityWithZeroWallet() public {
        bytes32[] memory managementKeys = new bytes32[](0);

        vm.prank(admin);
        vm.expectRevert();
        factory.createIdentity(address(0), managementKeys);
    }

    function testCreateTokenIdentityWithZeroToken() public {
        vm.prank(admin);
        vm.expectRevert();
        factory.createContractIdentity(address(0));
    }

    function testCreateTokenIdentityWithInvalidContract() public {
        // Create a contract that doesn't implement IContractWithIdentity
        address invalidContract = makeAddr("invalidContract");

        vm.prank(admin);
        vm.expectRevert();
        factory.createContractIdentity(invalidContract);
    }

    function testCreateIdentityDeterministicAddress() public {
        bytes32[] memory managementKeys = new bytes32[](0);

        address predictedAddress = factory.calculateWalletIdentityAddress(user, user);

        vm.prank(admin);
        address actualAddress = factory.createIdentity(user, managementKeys);

        assertEq(actualAddress, predictedAddress);
    }

    function testCreateTokenIdentityDeterministicAddress() public {
        SMARTToken token = new SMARTToken(
            "Token",
            "TKN",
            18,
            1_000_000 ether,
            address(0),
            address(systemUtils.identityRegistry()),
            address(systemUtils.compliance()),
            new SMARTComplianceModuleParamPair[](0),
            systemUtils.topicSchemeRegistry().getTopicId(ATKTopics.TOPIC_ASSET_COLLATERAL),
            address(accessManager)
        );

        address predictedAddress = factory.calculateContractIdentityAddress(address(token));

        vm.prank(admin);
        address actualAddress = factory.createContractIdentity(address(token));

        assertEq(actualAddress, predictedAddress);
    }

    function testCreateIdentityForSameWalletFails() public {
        bytes32[] memory managementKeys = new bytes32[](0);

        vm.prank(admin);
        factory.createIdentity(user, managementKeys);

        vm.prank(admin);
        vm.expectRevert();
        factory.createIdentity(user, managementKeys);
    }

    function testCreateTokenIdentityForSameTokenFails() public {
        SMARTToken token = new SMARTToken(
            "Token",
            "TKN",
            18,
            1_000_000 ether,
            address(0),
            address(systemUtils.identityRegistry()),
            address(systemUtils.compliance()),
            new SMARTComplianceModuleParamPair[](0),
            systemUtils.topicSchemeRegistry().getTopicId(ATKTopics.TOPIC_ASSET_COLLATERAL),
            address(accessManager)
        );

        vm.prank(admin);
        factory.createContractIdentity(address(token));

        vm.prank(admin);
        vm.expectRevert();
        factory.createContractIdentity(address(token));
    }

    function testCreateMultipleIdentitiesForDifferentWallets() public {
        address user2 = makeAddr("user2");
        bytes32[] memory managementKeys = new bytes32[](0);

        vm.prank(admin);
        address identity1 = factory.createIdentity(user, managementKeys);

        vm.prank(admin);
        address identity2 = factory.createIdentity(user2, managementKeys);

        assertTrue(identity1 != identity2);
        assertTrue(identity1 != address(0));
        assertTrue(identity2 != address(0));
        assertEq(factory.getIdentity(user), identity1);
        assertEq(factory.getIdentity(user2), identity2);
    }

    function testCreateMultipleTokenIdentitiesForDifferentTokens() public {
        SMARTToken token1 = new SMARTToken(
            "Token1",
            "TKN1",
            18,
            1_000_000 ether,
            address(0),
            address(systemUtils.identityRegistry()),
            address(systemUtils.compliance()),
            new SMARTComplianceModuleParamPair[](0),
            systemUtils.topicSchemeRegistry().getTopicId(ATKTopics.TOPIC_ASSET_COLLATERAL),
            address(accessManager)
        );
        SMARTToken token2 = new SMARTToken(
            "Token2",
            "TKN2",
            18,
            1_000_000 ether,
            address(0),
            address(systemUtils.identityRegistry()),
            address(systemUtils.compliance()),
            new SMARTComplianceModuleParamPair[](0),
            systemUtils.topicSchemeRegistry().getTopicId(ATKTopics.TOPIC_ASSET_COLLATERAL),
            address(accessManager)
        );

        vm.prank(admin);
        address identity1 = factory.createContractIdentity(address(token1));

        vm.prank(admin);
        address identity2 = factory.createContractIdentity(address(token2));

        assertTrue(identity1 != identity2);
        assertTrue(identity1 != address(0));
        assertTrue(identity2 != address(0));
        assertEq(factory.getContractIdentity(address(token1)), identity1);
        assertEq(factory.getContractIdentity(address(token2)), identity2);
    }

    function testCreateIdentityWithEmptyManagementKeys() public {
        bytes32[] memory managementKeys = new bytes32[](0);

        vm.prank(admin);
        address identity = factory.createIdentity(user, managementKeys);

        assertTrue(identity != address(0));
        assertEq(factory.getIdentity(user), identity);
    }

    function testGetIdentityReturnsZeroForNonExistentWallet() public {
        vm.prank(admin);

        assertEq(factory.getIdentity(user), address(0));
    }

    function testGetTokenIdentityReturnsZeroForNonExistentToken() public {
        vm.prank(admin);

        address tokenAddress = makeAddr("token");
        assertEq(factory.getContractIdentity(tokenAddress), address(0));
    }

    function testCalculateWalletIdentityAddressReturnsPredictableAddress() public {
        vm.prank(admin);

        address predictedAddress1 = factory.calculateWalletIdentityAddress(user, user);
        address predictedAddress2 = factory.calculateWalletIdentityAddress(user, user);

        assertEq(predictedAddress1, predictedAddress2);
        assertTrue(predictedAddress1 != address(0));
    }

    function testCalculateTokenIdentityAddressReturnsPredictableAddress() public {
        vm.prank(admin);

        address tokenAddress = makeAddr("token");
        address predictedAddress1 = factory.calculateContractIdentityAddress(tokenAddress);
        address predictedAddress2 = factory.calculateContractIdentityAddress(tokenAddress);

        assertEq(predictedAddress1, predictedAddress2);
        assertTrue(predictedAddress1 != address(0));
    }

    function testFactoryIsValid() public view {
        assertTrue(address(factory) != address(0));
    }

    // --- Claim Issuance Tests ---

    function testContractIdentityClaimIssuedWhenFactoryHasOnchainID() public {
        // Create a token that implements IContractWithIdentity
        SMARTToken token = new SMARTToken(
            "Token",
            "TKN",
            18,
            1_000_000 ether,
            address(0),
            address(systemUtils.identityRegistry()),
            address(systemUtils.compliance()),
            new SMARTComplianceModuleParamPair[](0),
            systemUtils.topicSchemeRegistry().getTopicId(ATKTopics.TOPIC_ASSET_COLLATERAL),
            address(accessManager)
        );

        // Get the factory's onchainID (should be set during bootstrap)
        address factoryOnchainID = IContractWithIdentity(address(factory)).onchainID();
        assertTrue(factoryOnchainID != address(0), "Factory should have onchainID set");

        // Create contract identity
        vm.prank(admin);
        address contractIdentity = factory.createContractIdentity(address(token));

        // Get the CONTRACT_IDENTITY topic ID
        uint256 contractIdentityTopicId = systemUtils.getTopicId(ATKTopics.TOPIC_CONTRACT_IDENTITY);

        // Check that the claim exists on the contract identity
        IERC735 identityContract = IERC735(contractIdentity);
        bytes32[] memory claimIds = identityContract.getClaimIdsByTopic(contractIdentityTopicId);

        assertTrue(claimIds.length > 0, "Should have at least one CONTRACT_IDENTITY claim");

        // Get the specific claim
        (uint256 topic,, address issuer,, bytes memory data,) = identityContract.getClaim(claimIds[0]);

        // Verify claim details
        assertEq(topic, contractIdentityTopicId, "Claim should have CONTRACT_IDENTITY topic");
        assertEq(issuer, factoryOnchainID, "Claim should be issued by factory's onchainID");

        // Decode and verify claim data (should contain the contract address)
        address decodedContractAddress = abi.decode(data, (address));
        assertEq(decodedContractAddress, address(token), "Claim data should contain the contract address");
    }

    function testContractIdentityClaimContainsCorrectData() public {
        // Create a token
        SMARTToken token = new SMARTToken(
            "Token",
            "TKN",
            18,
            1_000_000 ether,
            address(0),
            address(systemUtils.identityRegistry()),
            address(systemUtils.compliance()),
            new SMARTComplianceModuleParamPair[](0),
            systemUtils.topicSchemeRegistry().getTopicId(ATKTopics.TOPIC_ASSET_COLLATERAL),
            address(accessManager)
        );

        // Create contract identity
        vm.prank(admin);
        address contractIdentity = factory.createContractIdentity(address(token));

        // Get the CONTRACT_IDENTITY topic ID
        uint256 contractIdentityTopicId = systemUtils.getTopicId(ATKTopics.TOPIC_CONTRACT_IDENTITY);

        // Get the claim
        IERC735 identityContract = IERC735(contractIdentity);
        bytes32[] memory claimIds = identityContract.getClaimIdsByTopic(contractIdentityTopicId);
        require(claimIds.length > 0, "Should have CONTRACT_IDENTITY claim");

        (,,,, bytes memory data,) = identityContract.getClaim(claimIds[0]);

        // The claim data should be ABI encoded with the contract address
        // according to the topic signature: "address contractAddress"
        bytes memory expectedData = abi.encode(address(token));
        assertEq(data, expectedData, "Claim data should match expected encoding");
    }

    function testMultipleContractIdentitiesReceiveDistinctClaims() public {
        // Create two different tokens
        SMARTToken token1 = new SMARTToken(
            "Token1",
            "TKN1",
            18,
            1_000_000 ether,
            address(0),
            address(systemUtils.identityRegistry()),
            address(systemUtils.compliance()),
            new SMARTComplianceModuleParamPair[](0),
            systemUtils.topicSchemeRegistry().getTopicId(ATKTopics.TOPIC_ASSET_COLLATERAL),
            address(accessManager)
        );

        SMARTToken token2 = new SMARTToken(
            "Token2",
            "TKN2",
            18,
            1_000_000 ether,
            address(0),
            address(systemUtils.identityRegistry()),
            address(systemUtils.compliance()),
            new SMARTComplianceModuleParamPair[](0),
            systemUtils.topicSchemeRegistry().getTopicId(ATKTopics.TOPIC_ASSET_COLLATERAL),
            address(accessManager)
        );

        // Create both identities
        vm.prank(admin);
        address identity1 = factory.createContractIdentity(address(token1));

        vm.prank(admin);
        address identity2 = factory.createContractIdentity(address(token2));

        // Get the CONTRACT_IDENTITY topic ID
        uint256 contractIdentityTopicId = systemUtils.getTopicId(ATKTopics.TOPIC_CONTRACT_IDENTITY);

        // Check both identities have claims
        IERC735 identityContract1 = IERC735(identity1);
        IERC735 identityContract2 = IERC735(identity2);

        bytes32[] memory claimIds1 = identityContract1.getClaimIdsByTopic(contractIdentityTopicId);
        bytes32[] memory claimIds2 = identityContract2.getClaimIdsByTopic(contractIdentityTopicId);

        assertTrue(claimIds1.length > 0, "Token1 identity should have CONTRACT_IDENTITY claim");
        assertTrue(claimIds2.length > 0, "Token2 identity should have CONTRACT_IDENTITY claim");

        // Get claim data
        (,,,, bytes memory data1,) = identityContract1.getClaim(claimIds1[0]);
        (,,,, bytes memory data2,) = identityContract2.getClaim(claimIds2[0]);

        // Decode and verify each claim contains the correct contract address
        address decodedAddress1 = abi.decode(data1, (address));
        address decodedAddress2 = abi.decode(data2, (address));

        assertEq(decodedAddress1, address(token1), "Token1 claim should contain token1 address");
        assertEq(decodedAddress2, address(token2), "Token2 claim should contain token2 address");
        assertTrue(decodedAddress1 != decodedAddress2, "Claims should contain different addresses");
    }

    function testFactoryOnchainIDIsSetAndValid() public view {
        // The factory should have its onchainID set after bootstrap
        address factoryOnchainID = IContractWithIdentity(address(factory)).onchainID();
        assertTrue(factoryOnchainID != address(0), "Factory onchainID should be set");

        // The onchainID should be a valid identity contract
        assertTrue(
            IERC165(factoryOnchainID).supportsInterface(type(IIdentity).interfaceId),
            "Factory onchainID should be a valid identity contract"
        );
    }

    function testFactoryIdentityIssuesClaimsAsTrustedIssuer() public view {
        // Get the factory's identity
        address factoryOnchainID = IContractWithIdentity(address(factory)).onchainID();
        require(factoryOnchainID != address(0), "Factory should have onchainID");

        // Verify the factory's identity is registered as a trusted issuer for CONTRACT_IDENTITY claims
        uint256 contractIdentityTopicId = systemUtils.getTopicId(ATKTopics.TOPIC_CONTRACT_IDENTITY);
        bool isTrustedIssuer = systemUtils.trustedIssuersRegistry().isTrustedIssuer(factoryOnchainID);
        assertTrue(isTrustedIssuer, "Factory identity should be registered as trusted issuer");

        // Check if it can issue CONTRACT_IDENTITY claims specifically
        bool canIssueContractIdentity =
            systemUtils.trustedIssuersRegistry().hasClaimTopic(factoryOnchainID, contractIdentityTopicId);
        assertTrue(canIssueContractIdentity, "Factory identity should be able to issue CONTRACT_IDENTITY claims");
    }

    function testFactoryIdentityReceivesSelfIssuedContractClaim() public view {
        // The factory should have issued a CONTRACT_IDENTITY claim to itself during bootstrap
        address factoryOnchainID = IContractWithIdentity(address(factory)).onchainID();
        require(factoryOnchainID != address(0), "Factory should have onchainID");

        uint256 contractIdentityTopicId = systemUtils.getTopicId(ATKTopics.TOPIC_CONTRACT_IDENTITY);

        // Check that the factory's identity has a CONTRACT_IDENTITY claim
        IERC735 factoryIdentityContract = IERC735(factoryOnchainID);
        bytes32[] memory claimIds = factoryIdentityContract.getClaimIdsByTopic(contractIdentityTopicId);

        assertTrue(claimIds.length > 0, "Factory identity should have CONTRACT_IDENTITY claim");

        // Get the claim details
        (uint256 topic,, address issuer,, bytes memory data,) = factoryIdentityContract.getClaim(claimIds[0]);

        // Verify it's a self-issued claim
        assertEq(topic, contractIdentityTopicId, "Should be CONTRACT_IDENTITY claim");
        assertEq(issuer, factoryOnchainID, "Should be self-issued");

        // The claim data should contain the factory contract address
        address decodedContractAddress = abi.decode(data, (address));
        assertEq(decodedContractAddress, address(factory), "Claim should reference the factory contract");
    }
}

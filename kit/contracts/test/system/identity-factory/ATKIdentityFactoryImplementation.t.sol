// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../../../contracts/system/identity-factory/IATKIdentityFactory.sol";
import "../../utils/SystemUtils.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { SMARTToken } from "../../smart/examples/SMARTToken.sol";
import { SMARTComplianceModuleParamPair } from
    "../../../contracts/smart/interface/structs/SMARTComplianceModuleParamPair.sol";
import { ATKTopics } from "../../../contracts/system/ATKTopics.sol";

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
            systemUtils.topicSchemeRegistry().getTopicId(ATKTopics.TOPIC_COLLATERAL),
            address(accessManager)
        );

        vm.expectEmit(true, false, true, true);
        emit ContractIdentityCreated(admin, address(0), address(token)); // address(0) will be replaced with actual

        vm.prank(admin);
        address identity = factory.createContractIdentity(address(token), accessManager);

        assertTrue(identity != address(0));
        assertEq(factory.getContractIdentity(address(token)), identity);
    }

    function testCreateTokenIdentityRevertsWithUnauthorizedCaller() public {
        address tokenAddress = makeAddr("token");

        vm.prank(unauthorizedUser);
        vm.expectRevert();
        factory.createContractIdentity(tokenAddress, accessManager);
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
        factory.createContractIdentity(address(0), accessManager);
    }

    function testCreateTokenIdentityWithZeroAccessManager() public {
        address tokenAddress = makeAddr("token");

        vm.prank(admin);
        vm.expectRevert();
        factory.createContractIdentity(tokenAddress, address(0));
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
            systemUtils.topicSchemeRegistry().getTopicId(ATKTopics.TOPIC_COLLATERAL),
            address(accessManager)
        );

        address predictedAddress = factory.calculateContractIdentityAddress("Token", "TKN", 18, accessManager);

        vm.prank(admin);
        address actualAddress = factory.createContractIdentity(address(token), accessManager);

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
            systemUtils.topicSchemeRegistry().getTopicId(ATKTopics.TOPIC_COLLATERAL),
            address(accessManager)
        );

        vm.prank(admin);
        factory.createContractIdentity(address(token), accessManager);

        vm.prank(admin);
        vm.expectRevert();
        factory.createContractIdentity(address(token), accessManager);
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
            systemUtils.topicSchemeRegistry().getTopicId(ATKTopics.TOPIC_COLLATERAL),
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
            systemUtils.topicSchemeRegistry().getTopicId(ATKTopics.TOPIC_COLLATERAL),
            address(accessManager)
        );

        vm.prank(admin);
        address identity1 = factory.createContractIdentity(address(token1), accessManager);

        vm.prank(admin);
        address identity2 = factory.createContractIdentity(address(token2), accessManager);

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

        address predictedAddress1 = factory.calculateContractIdentityAddress("TOKEN", "TKN", 18, accessManager);
        address predictedAddress2 = factory.calculateContractIdentityAddress("TOKEN", "TKN", 18, accessManager);

        assertEq(predictedAddress1, predictedAddress2);
        assertTrue(predictedAddress1 != address(0));
    }

    function testFactoryIsValid() public view {
        assertTrue(address(factory) != address(0));
    }
}

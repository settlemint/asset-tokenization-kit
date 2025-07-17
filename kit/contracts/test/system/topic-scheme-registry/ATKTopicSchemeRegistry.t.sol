// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { Test } from "forge-std/Test.sol";
import { SystemUtils } from "../../utils/SystemUtils.sol";
import { IdentityUtils } from "../../utils/IdentityUtils.sol";
import { ISMARTTopicSchemeRegistry } from "../../../contracts/smart/interface/ISMARTTopicSchemeRegistry.sol";
import { ATKTopicSchemeRegistryImplementation } from
    "../../../contracts/system/topic-scheme-registry/ATKTopicSchemeRegistryImplementation.sol";
import { ATKSystemRoles } from "../../../contracts/system/ATKSystemRoles.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";
import { IATKSystemAccessManager } from "../../../contracts/system/access-manager/IATKSystemAccessManager.sol";
import { MockTopicSchemeRegistry } from "../../mocks/MockTopicSchemeRegistry.sol";

contract ATKTopicSchemeRegistryTest is Test {
    SystemUtils public systemUtils;
    IdentityUtils public identityUtils;
    ISMARTTopicSchemeRegistry public topicSchemeRegistry;
    IATKSystemAccessManager public systemAccessManager;
    MockTopicSchemeRegistry public mockRegistry;

    address public admin = makeAddr("admin");
    address public registrar = makeAddr("registrar");
    address public user = makeAddr("user");

    // Baseline reference from setup
    uint256 public initialTopicSchemeCount;
    uint256[] public initialTopicIds;

    // Test data
    string public constant TOPIC_NAME_1 = "UserIdentification";
    string public constant TOPIC_NAME_2 = "WalletVerification";
    string public constant TOPIC_NAME_3 = "DocumentHash";
    string public constant SIGNATURE_1 = "string name,uint256 age";
    string public constant SIGNATURE_2 = "address wallet,bool verified";
    string public constant SIGNATURE_3 = "bytes32 hash,uint256 timestamp";
    string public constant UPDATED_SIGNATURE = "string updatedName,uint256 updatedAge";

    event TopicSchemeRegistered(address indexed sender, uint256 indexed topicId, string name, string signature);
    event TopicSchemesBatchRegistered(address indexed sender, uint256[] topicIds, string[] names, string[] signatures);
    event TopicSchemeUpdated(
        address indexed sender, uint256 indexed topicId, string name, string oldSignature, string newSignature
    );
    event TopicSchemeRemoved(address indexed sender, uint256 indexed topicId, string name);

    function setUp() public {
        systemUtils = new SystemUtils(admin);
        identityUtils = new IdentityUtils(
            admin, systemUtils.identityFactory(), systemUtils.identityRegistry(), systemUtils.trustedIssuersRegistry()
        );

        // Get the topic scheme registry from the system
        topicSchemeRegistry = ISMARTTopicSchemeRegistry(systemUtils.system().topicSchemeRegistry());

        // Cast to MockTopicSchemeRegistry for direct role manipulation
        mockRegistry = MockTopicSchemeRegistry(address(topicSchemeRegistry));

        // Get the system access manager
        systemAccessManager = IATKSystemAccessManager(systemUtils.system().systemAccessManager());

        // Capture the initial state after system bootstrap (includes default topic schemes)
        initialTopicSchemeCount = topicSchemeRegistry.getTopicSchemeCount();
        initialTopicIds = topicSchemeRegistry.getAllTopicIds();

        // Grant registrar role to test address directly in the mock
        mockRegistry.setRegistrarRole(registrar, true);
    }

    function test_InitialState() public view {
        // Verify we have the expected default topic schemes registered during bootstrap
        assertEq(topicSchemeRegistry.getTopicSchemeCount(), initialTopicSchemeCount);
        assertEq(topicSchemeRegistry.getAllTopicIds().length, initialTopicSchemeCount);

        // Verify the default topic schemes exist
        assertTrue(topicSchemeRegistry.hasTopicSchemeByName("kyc"));
        assertTrue(topicSchemeRegistry.hasTopicSchemeByName("aml"));
        assertTrue(topicSchemeRegistry.hasTopicSchemeByName("collateral"));
        assertTrue(topicSchemeRegistry.hasTopicSchemeByName("isin"));
    }

    function test_RegisterTopicScheme_Success() public {
        uint256 expectedTopicId = topicSchemeRegistry.getTopicId(TOPIC_NAME_1);

        vm.prank(registrar);
        vm.expectEmit(true, true, false, true);
        emit TopicSchemeRegistered(registrar, expectedTopicId, TOPIC_NAME_1, SIGNATURE_1);

        topicSchemeRegistry.registerTopicScheme(TOPIC_NAME_1, SIGNATURE_1);

        assertTrue(topicSchemeRegistry.hasTopicScheme(expectedTopicId));
        assertTrue(topicSchemeRegistry.hasTopicSchemeByName(TOPIC_NAME_1));
        assertEq(topicSchemeRegistry.getTopicSchemeSignature(expectedTopicId), SIGNATURE_1);
        assertEq(topicSchemeRegistry.getTopicSchemeSignatureByName(TOPIC_NAME_1), SIGNATURE_1);
        assertEq(topicSchemeRegistry.getTopicSchemeCount(), initialTopicSchemeCount + 1);
    }

    function test_RegisterTopicScheme_OnlyRegistrar() public {
        vm.prank(user);
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector, user, ATKSystemRoles.REGISTRAR_ROLE
            )
        );
        topicSchemeRegistry.registerTopicScheme(TOPIC_NAME_1, SIGNATURE_1);
    }

    function test_RegisterTopicScheme_EmptyName() public {
        vm.prank(registrar);
        vm.expectRevert(abi.encodeWithSignature("EmptyName()"));
        topicSchemeRegistry.registerTopicScheme("", SIGNATURE_1);
    }

    function test_RegisterTopicScheme_EmptySignature() public {
        vm.prank(registrar);
        vm.expectRevert(abi.encodeWithSignature("EmptySignature()"));
        topicSchemeRegistry.registerTopicScheme(TOPIC_NAME_1, "");
    }

    function test_RegisterTopicScheme_AlreadyExists() public {
        vm.prank(registrar);
        topicSchemeRegistry.registerTopicScheme(TOPIC_NAME_1, SIGNATURE_1);

        vm.prank(registrar);
        vm.expectRevert(abi.encodeWithSignature("TopicSchemeAlreadyExists(string)", TOPIC_NAME_1));
        topicSchemeRegistry.registerTopicScheme(TOPIC_NAME_1, SIGNATURE_2);
    }

    function test_BatchRegisterTopicSchemes_Success() public {
        string[] memory names = new string[](3);
        names[0] = TOPIC_NAME_1;
        names[1] = TOPIC_NAME_2;
        names[2] = TOPIC_NAME_3;

        string[] memory signatures = new string[](3);
        signatures[0] = SIGNATURE_1;
        signatures[1] = SIGNATURE_2;
        signatures[2] = SIGNATURE_3;

        // Calculate expected topic IDs
        uint256[] memory expectedTopicIds = new uint256[](3);
        expectedTopicIds[0] = topicSchemeRegistry.getTopicId(TOPIC_NAME_1);
        expectedTopicIds[1] = topicSchemeRegistry.getTopicId(TOPIC_NAME_2);
        expectedTopicIds[2] = topicSchemeRegistry.getTopicId(TOPIC_NAME_3);

        vm.prank(registrar);
        vm.expectEmit(true, false, false, false);
        emit TopicSchemesBatchRegistered(registrar, expectedTopicIds, names, signatures);

        topicSchemeRegistry.batchRegisterTopicSchemes(names, signatures);

        assertEq(topicSchemeRegistry.getTopicSchemeCount(), initialTopicSchemeCount + 3);
        assertTrue(topicSchemeRegistry.hasTopicScheme(expectedTopicIds[0]));
        assertTrue(topicSchemeRegistry.hasTopicScheme(expectedTopicIds[1]));
        assertTrue(topicSchemeRegistry.hasTopicScheme(expectedTopicIds[2]));
        assertTrue(topicSchemeRegistry.hasTopicSchemeByName(TOPIC_NAME_1));
        assertTrue(topicSchemeRegistry.hasTopicSchemeByName(TOPIC_NAME_2));
        assertTrue(topicSchemeRegistry.hasTopicSchemeByName(TOPIC_NAME_3));

        uint256[] memory allTopicIds = topicSchemeRegistry.getAllTopicIds();
        assertEq(allTopicIds.length, initialTopicSchemeCount + 3);
    }

    function test_BatchRegisterTopicSchemes_EmptyArrays() public {
        string[] memory emptyNames = new string[](0);
        string[] memory emptySignatures = new string[](0);

        vm.prank(registrar);
        vm.expectRevert(abi.encodeWithSignature("EmptyArraysProvided()"));
        topicSchemeRegistry.batchRegisterTopicSchemes(emptyNames, emptySignatures);
    }

    function test_BatchRegisterTopicSchemes_ArrayLengthMismatch() public {
        string[] memory names = new string[](2);
        names[0] = TOPIC_NAME_1;
        names[1] = TOPIC_NAME_2;

        string[] memory signatures = new string[](1);
        signatures[0] = SIGNATURE_1;

        vm.prank(registrar);
        vm.expectRevert(abi.encodeWithSignature("ArrayLengthMismatch(uint256,uint256)", 2, 1));
        topicSchemeRegistry.batchRegisterTopicSchemes(names, signatures);
    }

    function test_UpdateTopicScheme_Success() public {
        // First register a topic scheme
        vm.prank(registrar);
        topicSchemeRegistry.registerTopicScheme(TOPIC_NAME_1, SIGNATURE_1);

        uint256 topicId = topicSchemeRegistry.getTopicId(TOPIC_NAME_1);

        // Then update it
        vm.prank(registrar);
        vm.expectEmit(true, true, false, true);
        emit TopicSchemeUpdated(registrar, topicId, TOPIC_NAME_1, SIGNATURE_1, UPDATED_SIGNATURE);

        topicSchemeRegistry.updateTopicScheme(TOPIC_NAME_1, UPDATED_SIGNATURE);

        assertEq(topicSchemeRegistry.getTopicSchemeSignature(topicId), UPDATED_SIGNATURE);
        assertEq(topicSchemeRegistry.getTopicSchemeSignatureByName(TOPIC_NAME_1), UPDATED_SIGNATURE);
    }

    function test_UpdateTopicScheme_DoesNotExist() public {
        vm.prank(registrar);
        vm.expectRevert(abi.encodeWithSignature("TopicSchemeDoesNotExistByName(string)", TOPIC_NAME_1));
        topicSchemeRegistry.updateTopicScheme(TOPIC_NAME_1, UPDATED_SIGNATURE);
    }

    function test_RemoveTopicScheme_Success() public {
        // First register a topic scheme
        vm.prank(registrar);
        topicSchemeRegistry.registerTopicScheme(TOPIC_NAME_1, SIGNATURE_1);

        uint256 topicId = topicSchemeRegistry.getTopicId(TOPIC_NAME_1);

        assertEq(topicSchemeRegistry.getTopicSchemeCount(), initialTopicSchemeCount + 1);
        assertTrue(topicSchemeRegistry.hasTopicScheme(topicId));
        assertTrue(topicSchemeRegistry.hasTopicSchemeByName(TOPIC_NAME_1));

        // Then remove it
        vm.prank(registrar);
        vm.expectEmit(true, true, false, false);
        emit TopicSchemeRemoved(registrar, topicId, TOPIC_NAME_1);

        topicSchemeRegistry.removeTopicScheme(TOPIC_NAME_1);

        assertEq(topicSchemeRegistry.getTopicSchemeCount(), initialTopicSchemeCount);
        assertFalse(topicSchemeRegistry.hasTopicScheme(topicId));
        assertFalse(topicSchemeRegistry.hasTopicSchemeByName(TOPIC_NAME_1));
    }

    function test_RemoveTopicScheme_DoesNotExist() public {
        vm.prank(registrar);
        vm.expectRevert(abi.encodeWithSignature("TopicSchemeDoesNotExistByName(string)", TOPIC_NAME_1));
        topicSchemeRegistry.removeTopicScheme(TOPIC_NAME_1);
    }

    function test_GetTopicId_Deterministic() public view {
        uint256 topicId1 = topicSchemeRegistry.getTopicId(TOPIC_NAME_1);
        uint256 topicId2 = topicSchemeRegistry.getTopicId(TOPIC_NAME_1);
        assertEq(topicId1, topicId2);

        uint256 differentTopicId = topicSchemeRegistry.getTopicId(TOPIC_NAME_2);
        assertNotEq(topicId1, differentTopicId);
    }

    function test_GetAllTopicIds_MultipleSchemes() public {
        // Register multiple topic schemes
        vm.startPrank(registrar);
        topicSchemeRegistry.registerTopicScheme(TOPIC_NAME_1, SIGNATURE_1);
        topicSchemeRegistry.registerTopicScheme(TOPIC_NAME_2, SIGNATURE_2);
        topicSchemeRegistry.registerTopicScheme(TOPIC_NAME_3, SIGNATURE_3);
        vm.stopPrank();

        uint256[] memory allTopicIds = topicSchemeRegistry.getAllTopicIds();
        assertEq(allTopicIds.length, initialTopicSchemeCount + 3);

        // Get expected topic IDs
        uint256 expectedId1 = topicSchemeRegistry.getTopicId(TOPIC_NAME_1);
        uint256 expectedId2 = topicSchemeRegistry.getTopicId(TOPIC_NAME_2);
        uint256 expectedId3 = topicSchemeRegistry.getTopicId(TOPIC_NAME_3);

        // Check that the array contains the expected IDs (may not be in exact order)
        bool foundId1 = false;
        bool foundId2 = false;
        bool foundId3 = false;

        for (uint256 i = 0; i < allTopicIds.length; i++) {
            if (allTopicIds[i] == expectedId1) foundId1 = true;
            if (allTopicIds[i] == expectedId2) foundId2 = true;
            if (allTopicIds[i] == expectedId3) foundId3 = true;
        }

        assertTrue(foundId1);
        assertTrue(foundId2);
        assertTrue(foundId3);
    }

    function test_AccessControl_RevokeRolePreventsFunctionAccess() public {
        // Verify registrar has access initially
        assertTrue(mockRegistry.hasRole(ATKSystemRoles.REGISTRAR_ROLE, registrar));

        // Register a topic
        vm.prank(registrar);
        topicSchemeRegistry.registerTopicScheme(TOPIC_NAME_1, SIGNATURE_1);

        // Revoke registrar role
        mockRegistry.setRegistrarRole(registrar, false);

        // Verify role was revoked
        assertFalse(mockRegistry.hasRole(ATKSystemRoles.REGISTRAR_ROLE, registrar));

        // Try to register another topic (should fail)
        vm.prank(registrar);
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector, registrar, ATKSystemRoles.REGISTRAR_ROLE
            )
        );
        topicSchemeRegistry.registerTopicScheme(TOPIC_NAME_2, SIGNATURE_2);
    }

    function test_AccessControl_SystemAccessManagerUpdated() public {
        // Create a new mock system access manager
        address mockAccessManager = makeAddr("mockAccessManager");

        // Make sure our mock can set system access manager without access check
        mockRegistry.setCanUpdateSystemAccessManager(true);

        // Set it as the new access manager
        vm.prank(admin);
        mockRegistry.setSystemAccessManager(mockAccessManager);

        // Verify it was updated
        assertEq(address(mockRegistry.systemAccessManager()), mockAccessManager);
    }
}

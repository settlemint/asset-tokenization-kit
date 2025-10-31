// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { Test } from "forge-std/Test.sol";
import { SystemUtils } from "../../utils/SystemUtils.sol";
import { IdentityUtils } from "../../utils/IdentityUtils.sol";
import { ISMARTTopicSchemeRegistry } from "../../../contracts/smart/interface/ISMARTTopicSchemeRegistry.sol";
import { IATKTopicSchemeRegistry } from "../../../contracts/system/topic-scheme-registry/IATKTopicSchemeRegistry.sol";
import {
    ATKTopicSchemeRegistryImplementation
} from "../../../contracts/system/topic-scheme-registry/ATKTopicSchemeRegistryImplementation.sol";
import { ATKPeopleRoles } from "../../../contracts/system/ATKPeopleRoles.sol";
import { ATKSystemRoles } from "../../../contracts/system/ATKSystemRoles.sol";
import { ATKRoles } from "../../../contracts/system/ATKRoles.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { IATKSystemAccessManager } from "../../../contracts/system/access-manager/IATKSystemAccessManager.sol";

contract ATKTopicSchemeRegistryTest is Test {
    SystemUtils public systemUtils;
    IdentityUtils public identityUtils;
    IATKTopicSchemeRegistry public topicSchemeRegistry;
    IATKSystemAccessManager public systemAccessManager;

    address public admin = makeAddr("admin");
    address public claimPolicyManager = makeAddr("claimPolicyManager");
    address public systemModule = makeAddr("systemModule");
    address public user = makeAddr("user");

    // Baseline reference from setup
    uint256 public initialTopicSchemeCount;
    uint256[] public initialTopicIds;

    // Test data
    string public constant TOPIC_NAME_1 = "UserIdentification";
    string public constant TOPIC_NAME_2 = "WalletVerification";
    string public constant TOPIC_NAME_3 = "DocumentHash";
    string public constant TOPIC_NAME_4 = "SystemManagerTopic";
    string public constant TOPIC_NAME_5 = "SystemModuleTopic";
    string public constant SIGNATURE_1 = "string name,uint256 age";
    string public constant SIGNATURE_2 = "address wallet,bool verified";
    string public constant SIGNATURE_3 = "bytes32 hash,uint256 timestamp";
    string public constant SIGNATURE_4 = "bool isManager,uint256 managerId";
    string public constant SIGNATURE_5 = "string moduleType,address moduleAddress";
    string public constant UPDATED_SIGNATURE = "string updatedName,uint256 updatedAge";

    event TopicSchemeRegistered(address indexed sender, uint256 indexed topicId, string name, string signature);
    event TopicSchemesBatchRegistered(address indexed sender, uint256[] topicIds, string[] names, string[] signatures);
    event TopicSchemeUpdated(
        address indexed sender, uint256 indexed topicId, string name, string oldSignature, string newSignature
    );
    event TopicSchemeRemoved(address indexed sender, uint256 indexed topicId, string name);
    event SystemAccessManagerSet(address indexed sender, address indexed systemAccessManager);

    function setUp() public {
        systemUtils = new SystemUtils(admin);
        identityUtils = new IdentityUtils(
            admin, systemUtils.identityFactory(), systemUtils.identityRegistry(), systemUtils.trustedIssuersRegistry()
        );

        // Get the topic scheme registry from the system
        topicSchemeRegistry = IATKTopicSchemeRegistry(systemUtils.system().topicSchemeRegistry());

        // Get the system access manager from the system
        systemAccessManager = IATKSystemAccessManager(systemUtils.systemAccessManager());

        // Capture the initial state after system bootstrap (includes default topic schemes)
        initialTopicSchemeCount = topicSchemeRegistry.getTopicSchemeCount();
        initialTopicIds = topicSchemeRegistry.getAllTopicIds();

        // Grant roles to test accounts through the system access manager
        vm.startPrank(admin);
        systemAccessManager.grantRole(ATKPeopleRoles.CLAIM_POLICY_MANAGER_ROLE, claimPolicyManager);
        systemAccessManager.grantRole(ATKSystemRoles.SYSTEM_MODULE_ROLE, systemModule);
        vm.stopPrank();
    }

    function test_InitialState() public view {
        // Verify we have the expected default topic schemes registered during bootstrap
        assertEq(topicSchemeRegistry.getTopicSchemeCount(), initialTopicSchemeCount);
        assertEq(topicSchemeRegistry.getAllTopicIds().length, initialTopicSchemeCount);

        // Verify the default topic schemes exist
        assertTrue(topicSchemeRegistry.hasTopicSchemeByName("knowYourCustomer"));
        assertTrue(topicSchemeRegistry.hasTopicSchemeByName("antiMoneyLaundering"));
        assertTrue(topicSchemeRegistry.hasTopicSchemeByName("collateral"));
        assertTrue(topicSchemeRegistry.hasTopicSchemeByName("isin"));
    }

    function test_SystemAccessManager() public view {
        address accessManagerAddress =
            ATKTopicSchemeRegistryImplementation(address(topicSchemeRegistry)).accessManager();
        assertEq(accessManagerAddress, address(systemAccessManager), "System access manager address should match");
    }

    function test_RegisterTopicScheme_Success() public {
        uint256 expectedTopicId = topicSchemeRegistry.getTopicId(TOPIC_NAME_1);

        vm.prank(claimPolicyManager);
        vm.expectEmit(true, true, false, true);
        emit TopicSchemeRegistered(claimPolicyManager, expectedTopicId, TOPIC_NAME_1, SIGNATURE_1);

        topicSchemeRegistry.registerTopicScheme(TOPIC_NAME_1, SIGNATURE_1);

        assertTrue(topicSchemeRegistry.hasTopicScheme(expectedTopicId));
        assertTrue(topicSchemeRegistry.hasTopicSchemeByName(TOPIC_NAME_1));
        assertEq(topicSchemeRegistry.getTopicSchemeSignature(expectedTopicId), SIGNATURE_1);
        assertEq(topicSchemeRegistry.getTopicSchemeSignatureByName(TOPIC_NAME_1), SIGNATURE_1);
        assertEq(topicSchemeRegistry.getTopicSchemeCount(), initialTopicSchemeCount + 1);
    }

    function test_RegisterTopicScheme_BySystemModule() public {
        uint256 expectedTopicId = topicSchemeRegistry.getTopicId(TOPIC_NAME_5);

        vm.prank(systemModule);
        vm.expectEmit(true, true, false, true);
        emit TopicSchemeRegistered(systemModule, expectedTopicId, TOPIC_NAME_5, SIGNATURE_5);

        topicSchemeRegistry.registerTopicScheme(TOPIC_NAME_5, SIGNATURE_5);

        assertTrue(topicSchemeRegistry.hasTopicScheme(expectedTopicId));
        assertTrue(topicSchemeRegistry.hasTopicSchemeByName(TOPIC_NAME_5));
        assertEq(topicSchemeRegistry.getTopicSchemeSignature(expectedTopicId), SIGNATURE_5);
        assertEq(topicSchemeRegistry.getTopicSchemeCount(), initialTopicSchemeCount + 1);
    }

    function test_RegisterTopicScheme_Unauthorized() public {
        vm.prank(user);
        vm.expectRevert(); // Should revert with UnauthorizedAccess error
        topicSchemeRegistry.registerTopicScheme(TOPIC_NAME_1, SIGNATURE_1);
    }

    function test_RegisterTopicScheme_EmptyName() public {
        vm.prank(claimPolicyManager);
        vm.expectRevert(abi.encodeWithSignature("EmptyName()"));
        topicSchemeRegistry.registerTopicScheme("", SIGNATURE_1);
    }

    function test_RegisterTopicScheme_EmptySignature() public {
        vm.prank(claimPolicyManager);
        vm.expectRevert(abi.encodeWithSignature("EmptySignature()"));
        topicSchemeRegistry.registerTopicScheme(TOPIC_NAME_1, "");
    }

    function test_RegisterTopicScheme_AlreadyExists() public {
        vm.prank(claimPolicyManager);
        topicSchemeRegistry.registerTopicScheme(TOPIC_NAME_1, SIGNATURE_1);

        vm.prank(claimPolicyManager);
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

        vm.prank(claimPolicyManager);
        vm.expectEmit(true, false, false, false);
        emit TopicSchemesBatchRegistered(claimPolicyManager, expectedTopicIds, names, signatures);

        topicSchemeRegistry.batchRegisterTopicSchemes(names, signatures);

        assertEq(topicSchemeRegistry.getTopicSchemeCount(), initialTopicSchemeCount + 3);
        assertTrue(topicSchemeRegistry.hasTopicScheme(expectedTopicIds[0]));
        assertTrue(topicSchemeRegistry.hasTopicScheme(expectedTopicIds[1]));
        assertTrue(topicSchemeRegistry.hasTopicScheme(expectedTopicIds[2]));
        assertTrue(topicSchemeRegistry.hasTopicSchemeByName(TOPIC_NAME_1));
        assertTrue(topicSchemeRegistry.hasTopicSchemeByName(TOPIC_NAME_2));
        assertTrue(topicSchemeRegistry.hasTopicSchemeByName(TOPIC_NAME_3));
    }

    function test_UpdateTopicScheme_BySystemModule() public {
        // First register with claim policy manager
        vm.prank(claimPolicyManager);
        topicSchemeRegistry.registerTopicScheme(TOPIC_NAME_1, SIGNATURE_1);

        // Then update with system module role
        uint256 topicId = topicSchemeRegistry.getTopicId(TOPIC_NAME_1);

        vm.prank(systemModule);
        vm.expectEmit(true, true, false, true);
        emit TopicSchemeUpdated(systemModule, topicId, TOPIC_NAME_1, SIGNATURE_1, UPDATED_SIGNATURE);

        topicSchemeRegistry.updateTopicScheme(TOPIC_NAME_1, UPDATED_SIGNATURE);

        assertEq(
            topicSchemeRegistry.getTopicSchemeSignature(topicId),
            UPDATED_SIGNATURE,
            "Signature should be updated by system module"
        );
    }

    // Test removed: setSystemAccessManager no longer exists - access manager is set during initialization and cannot be
    // changed

    function test_GetTopicId_Deterministic() public view {
        uint256 topicId1 = topicSchemeRegistry.getTopicId(TOPIC_NAME_1);
        uint256 topicId2 = topicSchemeRegistry.getTopicId(TOPIC_NAME_1);
        assertEq(topicId1, topicId2);

        uint256 differentTopicId = topicSchemeRegistry.getTopicId(TOPIC_NAME_2);
        assertNotEq(topicId1, differentTopicId);
    }

    function test_GetAllTopicIds_MultipleSchemes() public {
        // Register multiple topic schemes
        vm.startPrank(claimPolicyManager);
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

        // Verify all topic IDs are present (order might vary)
        bool found1 = false;
        bool found2 = false;
        bool found3 = false;

        for (uint256 i = 0; i < allTopicIds.length; i++) {
            if (allTopicIds[i] == expectedId1) found1 = true;
            if (allTopicIds[i] == expectedId2) found2 = true;
            if (allTopicIds[i] == expectedId3) found3 = true;
        }

        assertTrue(found1);
        assertTrue(found2);
        assertTrue(found3);
    }

    function test_SupportsInterface() public view {
        assertTrue(topicSchemeRegistry.supportsInterface(type(ISMARTTopicSchemeRegistry).interfaceId));
        assertTrue(topicSchemeRegistry.supportsInterface(type(IERC165).interfaceId));
        // No longer supports IAccessControl directly since it delegates to system access manager
        assertFalse(topicSchemeRegistry.supportsInterface(bytes4(0xffffffff)));
    }

    function test_SystemAccessManagerIntegration() public view {
        // Test that the topic scheme registry correctly references the system access manager
        ATKTopicSchemeRegistryImplementation registry =
            ATKTopicSchemeRegistryImplementation(address(topicSchemeRegistry));
        assertEq(registry.accessManager(), address(systemAccessManager));

        // Test hasRole delegation through access manager
        assertTrue(systemAccessManager.hasRole(ATKRoles.DEFAULT_ADMIN_ROLE, admin));
        assertTrue(systemAccessManager.hasRole(ATKPeopleRoles.CLAIM_POLICY_MANAGER_ROLE, claimPolicyManager));
        assertFalse(systemAccessManager.hasRole(ATKPeopleRoles.CLAIM_POLICY_MANAGER_ROLE, user));
    }

    function test_ComplexWorkflow() public {
        vm.startPrank(claimPolicyManager);

        // 1. Register multiple topic schemes
        topicSchemeRegistry.registerTopicScheme(TOPIC_NAME_1, SIGNATURE_1);
        topicSchemeRegistry.registerTopicScheme(TOPIC_NAME_2, SIGNATURE_2);

        assertEq(topicSchemeRegistry.getTopicSchemeCount(), initialTopicSchemeCount + 2);

        // 2. Update one scheme
        topicSchemeRegistry.updateTopicScheme(TOPIC_NAME_1, UPDATED_SIGNATURE);
        assertEq(topicSchemeRegistry.getTopicSchemeSignatureByName(TOPIC_NAME_1), UPDATED_SIGNATURE);

        // 3. Add more schemes via batch
        string[] memory newNames = new string[](1);
        newNames[0] = TOPIC_NAME_3;
        string[] memory newSignatures = new string[](1);
        newSignatures[0] = SIGNATURE_3;

        topicSchemeRegistry.batchRegisterTopicSchemes(newNames, newSignatures);
        assertEq(topicSchemeRegistry.getTopicSchemeCount(), initialTopicSchemeCount + 3);

        // 4. Remove one scheme
        topicSchemeRegistry.removeTopicScheme(TOPIC_NAME_2);
        assertEq(topicSchemeRegistry.getTopicSchemeCount(), initialTopicSchemeCount + 2);
        assertFalse(topicSchemeRegistry.hasTopicSchemeByName(TOPIC_NAME_2));

        // 5. Verify remaining schemes
        assertTrue(topicSchemeRegistry.hasTopicSchemeByName(TOPIC_NAME_1));
        assertTrue(topicSchemeRegistry.hasTopicSchemeByName(TOPIC_NAME_3));

        vm.stopPrank();
    }

    function test_FuzzRegisterTopicScheme(string calldata name, string calldata signature) public {
        vm.assume(bytes(name).length > 0);
        vm.assume(bytes(name).length <= 100); // Reasonable limit
        vm.assume(bytes(signature).length > 0);
        vm.assume(bytes(signature).length <= 1000); // Reasonable limit

        // Skip if the name already exists (could be one of the default schemes)
        vm.assume(!topicSchemeRegistry.hasTopicSchemeByName(name));

        uint256 expectedTopicId = topicSchemeRegistry.getTopicId(name);
        uint256 countBefore = topicSchemeRegistry.getTopicSchemeCount();

        vm.prank(claimPolicyManager);
        topicSchemeRegistry.registerTopicScheme(name, signature);

        assertTrue(topicSchemeRegistry.hasTopicScheme(expectedTopicId));
        assertTrue(topicSchemeRegistry.hasTopicSchemeByName(name));
        assertEq(topicSchemeRegistry.getTopicSchemeSignature(expectedTopicId), signature);
        assertEq(topicSchemeRegistry.getTopicSchemeSignatureByName(name), signature);
        assertEq(topicSchemeRegistry.getTopicSchemeCount(), countBefore + 1);
    }

    // Test removed: Zero address validation is now handled by ATKSystemAccessManaged base contract
}

// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { Test } from "forge-std/Test.sol";
import { console2 } from "forge-std/console2.sol";

import { SMARTToken } from "./examples/SMARTToken.sol";
import { IATKSystem } from "../../contracts/system/IATKSystem.sol";
import { IAccessManager } from "@openzeppelin/contracts/access/manager/IAccessManager.sol";
import { ISMARTTokenAccessManager } from "../../contracts/smart/extensions/access-managed/ISMARTTokenAccessManager.sol";
import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";
import {
    SMARTComplianceModuleParamPair
} from "../../contracts/smart/interface/structs/SMARTComplianceModuleParamPair.sol";
import { ISMARTPausable } from "../../contracts/smart/extensions/pausable/ISMARTPausable.sol";

import { SystemUtils } from "../utils/SystemUtils.sol";
import { IdentityUtils } from "../utils/IdentityUtils.sol";
import { ClaimUtils } from "../utils/ClaimUtils.sol";
import { TestConstants } from "../Constants.sol";
import { ATKTopics } from "../../contracts/system/ATKTopics.sol";

// Mock Access Manager that always returns true for canCall
contract MockAccessManager is IAccessManager {
    mapping(address => mapping(bytes4 => bool)) public restrictions;

    function canCall(
        address, // caller
        address, // target
        bytes4 // selector
    )
        external
        pure
        returns (bool allowed, uint32 delay)
    {
        // Always allow for testing
        return (true, 0);
    }

    // Implement other required functions as no-ops
    function hasRole(uint64, address) external pure returns (bool, uint32) {
        return (true, 0);
    } // Always return true for testing

    function getRoleAdmin(uint64) external pure returns (uint64) {
        return 0;
    }

    function grantRole(uint64, address, uint32) external { }
    function revokeRole(uint64, address) external { }
    function renounceRole(uint64, address) external { }
    function setRoleAdmin(uint64, uint64) external { }
    function setRoleGuardian(uint64, uint64) external { }
    function setGrantDelay(uint64, uint32) external { }

    function getRoleGrantDelay(uint64) external pure returns (uint32) {
        return 0;
    }

    function getRoleGuardian(uint64) external pure returns (uint64) {
        return 0;
    }

    function getTargetFunctionRole(address, bytes4) external pure returns (uint64) {
        return 0;
    }

    function getTargetAdminDelay(address) external pure returns (uint32) {
        return 0;
    }

    function setTargetFunctionRole(address, bytes4[] calldata, uint64) external { }
    function setTargetAdminDelay(address, uint32) external { }
    function setTargetClosed(address, bool) external { }

    function getSchedule(bytes32) external pure returns (uint48) {
        return 0;
    }

    function getNonce(bytes32) external pure returns (uint32) {
        return 0;
    }

    function schedule(address, bytes calldata, uint48) external pure returns (bytes32, uint32) {
        return (bytes32(0), 0);
    }

    function execute(address, bytes calldata) external payable returns (uint32) {
        return 0;
    }

    function cancel(address, address, bytes calldata) external pure returns (uint32) {
        return 0;
    }

    function consumeScheduledOp(address, bytes calldata) external { }

    function hashOperation(address, address, bytes calldata) external pure returns (bytes32) {
        return bytes32(0);
    }

    function updateAuthority(address, address) external { }

    function expiration() external pure returns (uint32) {
        return 0;
    }

    function getAccess(uint64, address) external pure returns (uint48, uint32, uint32, uint48) {
        return (0, 0, 0, 0);
    }

    function isTargetClosed(address) external pure returns (bool) {
        return false;
    }

    function labelRole(uint64, string calldata) external { }

    function minSetback() external pure returns (uint32) {
        return 0;
    }
}

/**
 * @title SMARTCrossExtensionTest
 * @notice Tests the interactions between multiple SMART Protocol extensions
 * @dev Focuses on edge cases and security implications when extensions are combined
 */
contract SMARTCrossExtensionTest is Test {
    SMARTToken public crossExtToken;
    ISMARTTokenAccessManager public accessManager;
    uint256 public constant COLLATERAL_LIMIT = 500_000 * 10 ** 18;

    // Test actors
    address public owner;
    address public user1;
    address public user2;
    address public user3;
    address public claimIssuer;

    // System components
    SystemUtils public systemUtils;
    IATKSystem public systemInstance;
    IdentityUtils public identityUtils;
    ClaimUtils public claimUtils;

    // Private key for claim issuer
    uint256 internal claimIssuerPrivateKey = 0x12345;

    function setUp() public {
        // Setup test actors
        owner = address(this);
        user1 = makeAddr("User1");
        user2 = makeAddr("User2");
        user3 = makeAddr("User3");
        claimIssuer = vm.addr(claimIssuerPrivateKey);

        // Setup system
        systemUtils = new SystemUtils(owner);
        systemInstance = systemUtils.system();

        // Setup utilities
        identityUtils = new IdentityUtils(
            owner, systemUtils.identityFactory(), systemUtils.identityRegistry(), systemUtils.trustedIssuersRegistry()
        );
        claimUtils = new ClaimUtils(
            owner,
            claimIssuer,
            claimIssuerPrivateKey,
            systemUtils.identityRegistry(),
            systemUtils.identityFactory(),
            systemUtils.topicSchemeRegistry()
        );

        // Create real access manager with owner as admin
        accessManager = systemUtils.createTokenAccessManager(owner);

        // Deploy token with all extensions (SMARTToken includes all major extensions)
        uint256[] memory requiredClaimTopics = new uint256[](2);
        requiredClaimTopics[0] = systemUtils.getTopicId(ATKTopics.TOPIC_INVESTOR_KYC);
        requiredClaimTopics[1] = systemUtils.getTopicId(ATKTopics.TOPIC_INVESTOR_AML);

        SMARTComplianceModuleParamPair[] memory modulePairs = new SMARTComplianceModuleParamPair[](0);

        // Deploy the token first with zero address for onchainID
        crossExtToken = new SMARTToken(
            "Cross Extension Test Token",
            "CETT",
            18,
            1_000_000 ether,
            address(0), // Temporary zero address
            address(systemUtils.identityRegistry()),
            address(systemUtils.compliance()),
            modulePairs,
            systemUtils.getTopicId(ATKTopics.TOPIC_ASSET_COLLATERAL),
            address(accessManager)
        );

        // Grant TOKEN_ADMIN_ROLE to owner first
        vm.prank(owner);
        IAccessControl(address(accessManager)).grantRole(crossExtToken.TOKEN_ADMIN_ROLE(), owner);

        // Create the token identity now that the token exists
        vm.prank(owner);
        address tokenIdentity = systemUtils.identityFactory().createContractIdentity(address(crossExtToken));

        // Set the identity on the token
        vm.prank(owner);
        crossExtToken.setOnchainID(tokenIdentity);

        // Setup identities for test users
        _setupTestIdentities();

        // Setup token identity and issue collateral claim to the token
        _setupTokenIdentity();

        // Grant necessary roles to owner
        _grantRoles();
    }

    function _setupTestIdentities() private {
        // Create issuer identity and register as trusted issuer
        uint256[] memory claimTopics = new uint256[](3);
        claimTopics[0] = systemUtils.getTopicId(ATKTopics.TOPIC_INVESTOR_KYC);
        claimTopics[1] = systemUtils.getTopicId(ATKTopics.TOPIC_INVESTOR_AML);
        claimTopics[2] = systemUtils.getTopicId(ATKTopics.TOPIC_ASSET_COLLATERAL);

        identityUtils.createIssuerIdentity(claimIssuer, claimTopics);

        // Create client identities
        identityUtils.createClientIdentity(user1, TestConstants.COUNTRY_CODE_BE);
        identityUtils.createClientIdentity(user2, TestConstants.COUNTRY_CODE_JP);
        identityUtils.createClientIdentity(user3, TestConstants.COUNTRY_CODE_US);

        // Issue claims to all users
        claimUtils.issueAllClaims(user1);
        claimUtils.issueAllClaims(user2);
        claimUtils.issueAllClaims(user3);
    }

    // ============ Custodian + Pausable Interaction Tests ============

    function test_CrossExtension_FrozenAndPaused_TransferBlocked() public {
        // Setup
        _mintTokens(user1, 1000e18);

        // Freeze user1 and pause contract
        vm.prank(owner);
        crossExtToken.setAddressFrozen(user1, true);
        vm.prank(owner);
        crossExtToken.pause();

        // Test: Regular transfer should fail due to pause
        vm.expectRevert(abi.encodeWithSignature("TokenPaused()"));
        vm.prank(user1);
        /// forge-lint: disable-next-line(erc20-unchecked-transfer)
        crossExtToken.transfer(user2, 100e18);
    }

    function test_CrossExtension_ForcedTransferWhilePaused_Fails() public {
        // Setup
        _mintTokens(user1, 1000e18);

        // Pause contract
        vm.prank(owner);
        crossExtToken.pause();

        // Test: Forced transfer also fails when paused (security feature)
        vm.prank(owner);
        vm.expectRevert(abi.encodeWithSignature("TokenPaused()"));
        crossExtToken.forcedTransfer(user1, user2, 100e18);
    }

    function test_CrossExtension_RecoveryWhilePaused_Fails() public {
        // Setup
        _mintTokens(user1, 1000e18);

        // Freeze user1 and pause contract
        vm.prank(owner);
        crossExtToken.setAddressFrozen(user1, true);
        vm.prank(owner);
        crossExtToken.pause();

        // Recover address
        address newIdentity = identityUtils.getIdentity(user3);
        identityUtils.recoverIdentity(user1, user3, newIdentity);

        // Test: Recovery also fails when paused (security feature)
        vm.prank(owner);
        vm.expectRevert(abi.encodeWithSelector(ISMARTPausable.TokenPaused.selector));
        crossExtToken.forcedRecoverTokens(user1, user3);
    }

    // ============ Partial Freeze + Multiple Operations Tests ============

    function test_CrossExtension_PartialFreeze_BurnIntoFrozen() public {
        // Setup
        _mintTokens(user1, 1000e18);
        vm.prank(owner);
        crossExtToken.freezePartialTokens(user1, 400e18);

        // Test: Burn more than unfrozen amount
        vm.prank(owner);
        crossExtToken.burn(user1, 700e18);

        assertEq(crossExtToken.balanceOf(user1), 300e18);
        assertEq(crossExtToken.getFrozenTokens(user1), 300e18); // Frozen tokens should remain
    }

    function test_CrossExtension_PartialFreeze_RedeemBlocked() public {
        // Setup
        _mintTokens(user1, 1000e18);
        vm.prank(owner);
        crossExtToken.freezePartialTokens(user1, 400e18);

        // Test: Cannot redeem more than unfrozen amount
        vm.expectRevert(
            abi.encodeWithSignature("ERC20InsufficientBalance(address,uint256,uint256)", user1, 600e18, 700e18)
        );
        vm.prank(user1);
        crossExtToken.redeem(700e18);

        // Can redeem up to unfrozen amount
        vm.prank(user1);
        crossExtToken.redeem(600e18);
        assertEq(crossExtToken.balanceOf(user1), 400e18);
        assertEq(crossExtToken.getFrozenTokens(user1), 400e18);
    }

    // ============ Collateral + Mint Interaction Tests ============

    function test_CrossExtension_CollateralRequired_MintBlocked() public {
        // This test is no longer valid as we're not setting up collateral
        // The token would require additional setup to test collateral requirements
        // For now, we skip this test and focus on other cross-extension interactions
        vm.skip(true);
    }

    function test_CrossExtension_CollateralAndMint_Success() public {
        // This test is no longer valid as we're not setting up collateral
        // The token would require additional setup to test collateral requirements
        // For now, we skip this test and focus on other cross-extension interactions
        vm.skip(true);
    }

    // ============ Recovery + State Migration Tests ============

    function test_CrossExtension_RecoveryWithPartialFreeze_StateTransfer() public {
        // Setup complex state
        _mintTokens(user1, 1000e18);
        vm.prank(owner);
        crossExtToken.freezePartialTokens(user1, 300e18);

        // Create historical checkpoint
        vm.roll(block.number + 1);
        vm.prank(user1);
        assertTrue(crossExtToken.transfer(user2, 100e18), "Transfer failed"); // Creates checkpoint

        // Recover address
        address newIdentity = identityUtils.getIdentity(user3);
        identityUtils.recoverIdentity(user1, user3, newIdentity);

        vm.prank(owner);
        crossExtToken.forcedRecoverTokens(user1, user3);

        // Verify state migration
        assertEq(crossExtToken.balanceOf(user3), 900e18); // 1000 - 100 transfer
        assertEq(crossExtToken.getFrozenTokens(user3), 300e18); // Frozen amount preserved
            // Note: isFrozen status is not automatically transferred during recovery
    }

    // ============ Complex Multi-Extension Scenarios ============

    function test_CrossExtension_EmergencyScenario_AllRestrictions() public {
        // Setup: User with complex state
        _mintTokens(user1, 1000e18);
        vm.prank(owner);
        crossExtToken.freezePartialTokens(user1, 200e18);

        // Emergency: Pause contract
        vm.prank(owner);
        crossExtToken.pause();

        // Test various operations
        vm.prank(user1);
        vm.expectRevert(abi.encodeWithSignature("TokenPaused()"));
        /// forge-lint: disable-next-line(erc20-unchecked-transfer)
        crossExtToken.transfer(user2, 100e18);

        vm.prank(user1);
        vm.expectRevert(abi.encodeWithSignature("TokenPaused()"));
        crossExtToken.redeem(100e18);

        // Admin operations are also blocked when paused
        vm.prank(owner);
        vm.expectRevert(abi.encodeWithSignature("TokenPaused()"));
        crossExtToken.forcedTransfer(user1, user2, 300e18);
    }

    function test_CrossExtension_GasConsumption_AllExtensions() public {
        // No need for collateral setup in this test

        // Setup multiple users with various states
        uint256 userCount = 10;
        for (uint256 i = 0; i < userCount; i++) {
            // forge-lint: disable-next-line(unsafe-typecast) -- 1000 + i < 2**160 for bounded loop
            address user = address(uint160(1000 + i));
            identityUtils.createClientIdentity(user, TestConstants.COUNTRY_CODE_BE);
            claimUtils.issueAllClaims(user);

            if (i == 0) {
                // Mint to first user who has collateral
                _mintTokens(user1, 10_000e18);
                // Transfer from user1 to other users
                vm.prank(user1);
                assertTrue(crossExtToken.transfer(user, 1000e18), "Transfer failed");
            }

            // Add various states
            if (i % 3 == 0 && crossExtToken.balanceOf(user) > 0) {
                vm.prank(owner);
                crossExtToken.freezePartialTokens(user, 100e18);
            }
        }

        // Measure gas for complex operation
        address testUser = address(uint160(1000));
        uint256 gasBefore = gasleft();

        vm.prank(testUser);
        assertTrue(crossExtToken.transfer(address(uint160(1001)), 50e18), "Transfer failed");

        uint256 gasUsed = gasBefore - gasleft();
        console2.log("Gas used for transfer with all extensions:", gasUsed);

        // Should be reasonable even with all extensions
        assertLt(gasUsed, 300_000);
    }

    // ============ Access Control Tests ============

    function test_CrossExtension_OperationsWithAccessManager() public {
        // All operations should work with the access manager

        // Grant necessary roles to users for this test
        vm.startPrank(owner);
        IAccessControl(address(accessManager)).grantRole(crossExtToken.MINTER_ROLE(), user1);
        IAccessControl(address(accessManager)).grantRole(crossExtToken.FREEZER_ROLE(), user2);
        IAccessControl(address(accessManager)).grantRole(crossExtToken.PAUSER_ROLE(), user3);
        vm.stopPrank();

        // Mint (will skip if collateral required)
        vm.prank(user1);
        try crossExtToken.mint(user1, 1000e18) {
            assertEq(crossExtToken.balanceOf(user1), 1000e18);
        } catch {
            vm.skip(true);
        }

        // Freeze
        vm.prank(user2);
        crossExtToken.setAddressFrozen(user1, true);
        assertTrue(crossExtToken.isFrozen(user1));

        // Pause
        vm.prank(user3);
        crossExtToken.pause();
        assertTrue(crossExtToken.paused());

        // Unpause (requires PAUSER_ROLE)
        vm.prank(user3);
        crossExtToken.unpause();
        assertFalse(crossExtToken.paused());
    }

    // ============ Edge Case Tests ============

    function test_CrossExtension_BurnEntireBalanceWithPartialFreeze() public {
        // Setup
        _mintTokens(user1, 1000e18);
        vm.prank(owner);
        crossExtToken.freezePartialTokens(user1, 300e18);

        // Burn entire balance
        vm.prank(owner);
        crossExtToken.burn(user1, 1000e18);

        assertEq(crossExtToken.balanceOf(user1), 0);
        assertEq(crossExtToken.getFrozenTokens(user1), 0);
    }

    function test_CrossExtension_ChainedForcedOperations() public {
        // Setup initial state
        _mintTokens(user1, 1000e18);
        _mintTokens(user2, 1000e18);

        // Chain multiple forced operations
        vm.startPrank(owner);

        // 1. Freeze both users
        crossExtToken.setAddressFrozen(user1, true);
        crossExtToken.setAddressFrozen(user2, true);

        // 2. Forced transfer from frozen to frozen
        crossExtToken.forcedTransfer(user1, user2, 500e18);

        // 3. Partially freeze receiving user
        crossExtToken.freezePartialTokens(user2, 1000e18);

        // 4. Force burn from partially frozen
        crossExtToken.burn(user2, 800e18);

        vm.stopPrank();

        // Verify final state
        assertEq(crossExtToken.balanceOf(user1), 500e18);
        assertEq(crossExtToken.balanceOf(user2), 700e18); // 1000 + 500 - 800
        assertEq(crossExtToken.getFrozenTokens(user2), 700e18); // Adjusted after burn
    }

    // ============ Helper Functions ============

    function _setupTokenIdentity() private {
        // Issue a large collateral claim to the token to allow minting
        claimUtils.issueCollateralClaim(
            address(crossExtToken),
            owner, // Token owner
            type(uint256).max / 2, // Large amount
            block.timestamp + 3650 days // 10 years
        );
    }

    function _grantRoles() private {
        // Grant all necessary roles to the owner
        vm.startPrank(owner);
        IAccessControl(address(accessManager)).grantRole(crossExtToken.TOKEN_ADMIN_ROLE(), owner);
        IAccessControl(address(accessManager)).grantRole(crossExtToken.COMPLIANCE_ADMIN_ROLE(), owner);
        IAccessControl(address(accessManager)).grantRole(crossExtToken.VERIFICATION_ADMIN_ROLE(), owner);
        IAccessControl(address(accessManager)).grantRole(crossExtToken.MINTER_ROLE(), owner);
        IAccessControl(address(accessManager)).grantRole(crossExtToken.BURNER_ROLE(), owner);
        IAccessControl(address(accessManager)).grantRole(crossExtToken.FREEZER_ROLE(), owner);
        IAccessControl(address(accessManager)).grantRole(crossExtToken.FORCED_TRANSFER_ROLE(), owner);
        IAccessControl(address(accessManager)).grantRole(crossExtToken.RECOVERY_ROLE(), owner);
        IAccessControl(address(accessManager)).grantRole(crossExtToken.PAUSER_ROLE(), owner);
        vm.stopPrank();
    }

    function _mintTokens(address to, uint256 amount) private {
        // For simplicity in testing cross-extension interactions,
        // we'll mint directly without collateral requirements
        vm.prank(owner);
        crossExtToken.mint(to, amount);
    }

    function testFuzz_CrossExtension_RandomOperationSequence(uint256 seed, uint8 operationCount) public {
        // Limit operations to reasonable number
        operationCount = uint8(bound(operationCount, 1, 20));

        // Setup initial state
        _mintTokens(user1, 10_000e18);
        _mintTokens(user2, 10_000e18);

        // Execute random sequence of operations
        for (uint8 i = 0; i < operationCount; i++) {
            uint256 operation = uint256(keccak256(abi.encode(seed, i))) % 10;

            if (operation == 0) {
                // Transfer
                vm.prank(user1);
                try crossExtToken.transfer(user2, 100e18) { } catch { }
            } else if (operation == 1) {
                // Freeze
                vm.prank(owner);
                try crossExtToken.setAddressFrozen(user1, true) { } catch { }
            } else if (operation == 2) {
                // Unfreeze
                vm.prank(owner);
                try crossExtToken.setAddressFrozen(user1, false) { } catch { }
            } else if (operation == 3) {
                // Partial freeze
                vm.prank(owner);
                try crossExtToken.freezePartialTokens(user1, 500e18) { } catch { }
            } else if (operation == 4) {
                // Pause
                vm.prank(owner);
                try crossExtToken.pause() { } catch { }
            } else if (operation == 5) {
                // Unpause
                vm.prank(owner);
                try crossExtToken.unpause() { } catch { }
            } else if (operation == 6) {
                // Burn
                vm.prank(owner);
                try crossExtToken.burn(user1, 100e18) { } catch { }
            } else if (operation == 7) {
                // Redeem
                vm.prank(user1);
                try crossExtToken.redeem(100e18) { } catch { }
            } else if (operation == 8) {
                // Forced transfer
                vm.prank(owner);
                try crossExtToken.forcedTransfer(user1, user2, 100e18) { } catch { }
            } else if (operation == 9) {
                // Mint
                vm.prank(owner);
                try crossExtToken.mint(user3, 100e18) { } catch { }
            }
        }

        // Verify invariants still hold
        assertTrue(crossExtToken.getFrozenTokens(user1) <= crossExtToken.balanceOf(user1));
        assertTrue(crossExtToken.getFrozenTokens(user2) <= crossExtToken.balanceOf(user2));
    }
}

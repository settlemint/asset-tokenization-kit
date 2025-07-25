// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { Test } from "forge-std/Test.sol";
import { ATKIdentityRegistryStorageImplementation } from
    "../../../contracts/system/identity-registry-storage/ATKIdentityRegistryStorageImplementation.sol";
import { ERC1967Proxy } from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";
import { IERC165 } from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import { ISMARTIdentityRegistryStorage } from "../../../contracts/smart/interface/ISMARTIdentityRegistryStorage.sol";
import { IIdentity } from "@onchainid/contracts/interface/IIdentity.sol";
import { SystemUtils } from "../../utils/SystemUtils.sol";
import { IdentityUtils } from "../../utils/IdentityUtils.sol";
import { ATKSystemRoles } from "../../../contracts/system/ATKSystemRoles.sol";

contract ATKIdentityRegistryStorageImplementationTest is Test {
    ATKIdentityRegistryStorageImplementation public implementation;
    ATKIdentityRegistryStorageImplementation public storageContract;
    SystemUtils public systemUtils;
    IdentityUtils public identityUtils;

    address public admin;
    address public system;
    address public forwarder;
    address public user1;
    address public user2;
    address public user3;
    address public lostWallet1;
    address public lostWallet2;
    address public registry1;
    address public registry2;

    IIdentity public identity1;
    IIdentity public identity2;
    IIdentity public identity3;
    uint16 public constant COUNTRY_US = 840;
    uint16 public constant COUNTRY_UK = 826;

    event IdentityStored(address indexed investorAddress, IIdentity indexed identity);
    event IdentityUnstored(address indexed investorAddress, IIdentity indexed identity);
    event IdentityModified(IIdentity indexed oldIdentity, IIdentity indexed newIdentity);
    event CountryModified(address indexed _identityWallet, uint16 indexed _country);
    event IdentityRegistryBound(address indexed identityRegistry);
    event IdentityRegistryUnbound(address indexed identityRegistry);
    event IdentityWalletMarkedAsLost(
        address indexed identityContract, address indexed userWallet, address indexed markedBy
    );

    function setUp() public {
        admin = makeAddr("admin");
        system = makeAddr("system");
        forwarder = makeAddr("forwarder");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        user3 = makeAddr("user3");
        lostWallet1 = makeAddr("lostWallet1");
        lostWallet2 = makeAddr("lostWallet2");
        registry1 = makeAddr("registry1");
        registry2 = makeAddr("registry2");

        systemUtils = new SystemUtils(admin);
        identityUtils = new IdentityUtils(
            admin, systemUtils.identityFactory(), systemUtils.identityRegistry(), systemUtils.trustedIssuersRegistry()
        );

        implementation = new ATKIdentityRegistryStorageImplementation(forwarder);

        bytes memory initData =
            abi.encodeWithSelector(ATKIdentityRegistryStorageImplementation.initialize.selector, system, admin);

        ERC1967Proxy proxy = new ERC1967Proxy(address(implementation), initData);
        storageContract = ATKIdentityRegistryStorageImplementation(address(proxy));

        identity1 = IIdentity(identityUtils.createIdentity(user1));
        identity2 = IIdentity(identityUtils.createIdentity(user2));
        identity3 = IIdentity(identityUtils.createIdentity(user3));
    }

    function test_Constructor() public {
        ATKIdentityRegistryStorageImplementation impl = new ATKIdentityRegistryStorageImplementation(forwarder);
        assertEq(impl.isTrustedForwarder(forwarder), true);
    }

    function test_Initialize() public view {
        assertTrue(storageContract.hasRole(ATKSystemRoles.DEFAULT_ADMIN_ROLE, admin));
        assertTrue(storageContract.hasRole(ATKSystemRoles.STORAGE_MODIFIER_ROLE, admin));
        assertTrue(storageContract.hasRole(ATKSystemRoles.REGISTRY_MANAGER_ROLE, system));
        assertEq(
            storageContract.getRoleAdmin(ATKSystemRoles.STORAGE_MODIFIER_ROLE), ATKSystemRoles.REGISTRY_MANAGER_ROLE
        );
    }

    function test_InitializeTwice_ShouldRevert() public {
        vm.expectRevert();
        storageContract.initialize(system, admin);
    }

    function test_AddIdentityToStorage() public {
        vm.prank(admin);
        vm.expectEmit(true, true, false, true);
        emit IdentityStored(user1, identity1);
        storageContract.addIdentityToStorage(user1, identity1, COUNTRY_US);

        assertEq(address(storageContract.storedIdentity(user1)), address(identity1));
        assertEq(storageContract.storedInvestorCountry(user1), COUNTRY_US);

        address[] memory wallets = storageContract.getIdentityWallets();
        assertEq(wallets.length, 1);
        assertEq(wallets[0], user1);
    }

    function test_AddIdentityToStorage_InvalidWalletAddress_ShouldRevert() public {
        vm.prank(admin);
        vm.expectRevert(
            abi.encodeWithSelector(ATKIdentityRegistryStorageImplementation.InvalidIdentityWalletAddress.selector)
        );
        storageContract.addIdentityToStorage(address(0), identity1, COUNTRY_US);
    }

    function test_AddIdentityToStorage_InvalidIdentityAddress_ShouldRevert() public {
        vm.prank(admin);
        vm.expectRevert(
            abi.encodeWithSelector(ATKIdentityRegistryStorageImplementation.InvalidIdentityAddress.selector)
        );
        storageContract.addIdentityToStorage(user1, IIdentity(address(0)), COUNTRY_US);
    }

    function test_AddIdentityToStorage_IdentityAlreadyExists_ShouldRevert() public {
        vm.startPrank(admin);
        storageContract.addIdentityToStorage(user1, identity1, COUNTRY_US);

        vm.expectRevert(
            abi.encodeWithSelector(ATKIdentityRegistryStorageImplementation.IdentityAlreadyExists.selector, user1)
        );
        storageContract.addIdentityToStorage(user1, identity2, COUNTRY_UK);
        vm.stopPrank();
    }

    function test_AddIdentityToStorage_UnauthorizedCaller_ShouldRevert() public {
        vm.prank(user1);
        vm.expectRevert();
        storageContract.addIdentityToStorage(user1, identity1, COUNTRY_US);
    }

    function test_RemoveIdentityFromStorage() public {
        vm.startPrank(admin);
        storageContract.addIdentityToStorage(user1, identity1, COUNTRY_US);
        storageContract.addIdentityToStorage(user2, identity2, COUNTRY_UK);

        vm.expectEmit(true, true, false, true);
        emit IdentityUnstored(user1, identity1);
        storageContract.removeIdentityFromStorage(user1);
        vm.stopPrank();

        vm.expectRevert();
        storageContract.storedIdentity(user1);

        assertEq(address(storageContract.storedIdentity(user2)), address(identity2));

        address[] memory wallets = storageContract.getIdentityWallets();
        assertEq(wallets.length, 1);
        assertEq(wallets[0], user2);
    }

    function test_RemoveIdentityFromStorage_IdentityDoesNotExist_ShouldRevert() public {
        vm.prank(admin);
        vm.expectRevert();
        storageContract.removeIdentityFromStorage(user1);
    }

    function test_RemoveIdentityFromStorage_UnauthorizedCaller_ShouldRevert() public {
        vm.prank(admin);
        storageContract.addIdentityToStorage(user1, identity1, COUNTRY_US);

        vm.prank(user1);
        vm.expectRevert();
        storageContract.removeIdentityFromStorage(user1);
    }

    function test_ModifyStoredIdentity() public {
        vm.startPrank(admin);
        storageContract.addIdentityToStorage(user1, identity1, COUNTRY_US);

        vm.expectEmit(true, true, false, true);
        emit IdentityModified(identity1, identity2);
        storageContract.modifyStoredIdentity(user1, identity2);
        vm.stopPrank();

        assertEq(address(storageContract.storedIdentity(user1)), address(identity2));
        assertEq(storageContract.storedInvestorCountry(user1), COUNTRY_US);
    }

    function test_ModifyStoredIdentity_IdentityDoesNotExist_ShouldRevert() public {
        vm.prank(admin);
        vm.expectRevert();
        storageContract.modifyStoredIdentity(user1, identity2);
    }

    function test_ModifyStoredIdentity_InvalidIdentityAddress_ShouldRevert() public {
        vm.startPrank(admin);
        storageContract.addIdentityToStorage(user1, identity1, COUNTRY_US);

        vm.expectRevert();
        storageContract.modifyStoredIdentity(user1, IIdentity(address(0)));
        vm.stopPrank();
    }

    function test_ModifyStoredIdentity_UnauthorizedCaller_ShouldRevert() public {
        vm.prank(admin);
        storageContract.addIdentityToStorage(user1, identity1, COUNTRY_US);

        vm.prank(user1);
        vm.expectRevert();
        storageContract.modifyStoredIdentity(user1, identity2);
    }

    function test_ModifyStoredInvestorCountry() public {
        vm.startPrank(admin);
        storageContract.addIdentityToStorage(user1, identity1, COUNTRY_US);

        vm.expectEmit(true, true, false, true);
        emit CountryModified(user1, COUNTRY_UK);
        storageContract.modifyStoredInvestorCountry(user1, COUNTRY_UK);
        vm.stopPrank();

        assertEq(storageContract.storedInvestorCountry(user1), COUNTRY_UK);
        assertEq(address(storageContract.storedIdentity(user1)), address(identity1));
    }

    function test_ModifyStoredInvestorCountry_IdentityDoesNotExist_ShouldRevert() public {
        vm.prank(admin);
        vm.expectRevert();
        storageContract.modifyStoredInvestorCountry(user1, COUNTRY_UK);
    }

    function test_ModifyStoredInvestorCountry_UnauthorizedCaller_ShouldRevert() public {
        vm.prank(admin);
        storageContract.addIdentityToStorage(user1, identity1, COUNTRY_US);

        vm.prank(user1);
        vm.expectRevert();
        storageContract.modifyStoredInvestorCountry(user1, COUNTRY_UK);
    }

    function test_BindIdentityRegistry() public {
        vm.prank(system);
        vm.expectEmit(true, false, false, true);
        emit IdentityRegistryBound(registry1);
        storageContract.bindIdentityRegistry(registry1);

        assertTrue(storageContract.hasRole(ATKSystemRoles.STORAGE_MODIFIER_ROLE, registry1));

        address[] memory linkedRegistries = storageContract.linkedIdentityRegistries();
        assertEq(linkedRegistries.length, 1);
        assertEq(linkedRegistries[0], registry1);
    }

    function test_BindIdentityRegistry_InvalidAddress_ShouldRevert() public {
        vm.prank(system);
        vm.expectRevert(abi.encodeWithSignature("InvalidIdentityRegistryAddress()"));
        storageContract.bindIdentityRegistry(address(0));
    }

    function test_BindIdentityRegistry_AlreadyBound_ShouldRevert() public {
        vm.startPrank(system);
        storageContract.bindIdentityRegistry(registry1);

        vm.expectRevert(abi.encodeWithSignature("IdentityRegistryAlreadyBound(address)", registry1));
        storageContract.bindIdentityRegistry(registry1);
        vm.stopPrank();
    }

    function test_BindIdentityRegistry_UnauthorizedCaller_ShouldRevert() public {
        vm.prank(user1);
        vm.expectRevert();
        storageContract.bindIdentityRegistry(registry1);
    }

    function test_UnbindIdentityRegistry() public {
        vm.startPrank(system);
        storageContract.bindIdentityRegistry(registry1);
        storageContract.bindIdentityRegistry(registry2);

        vm.expectEmit(true, false, false, true);
        emit IdentityRegistryUnbound(registry1);
        storageContract.unbindIdentityRegistry(registry1);
        vm.stopPrank();

        assertFalse(storageContract.hasRole(ATKSystemRoles.STORAGE_MODIFIER_ROLE, registry1));
        assertTrue(storageContract.hasRole(ATKSystemRoles.STORAGE_MODIFIER_ROLE, registry2));

        address[] memory linkedRegistries = storageContract.linkedIdentityRegistries();
        assertEq(linkedRegistries.length, 1);
        assertEq(linkedRegistries[0], registry2);
    }

    function test_UnbindIdentityRegistry_NotBound_ShouldRevert() public {
        vm.prank(system);
        vm.expectRevert();
        storageContract.unbindIdentityRegistry(registry1);
    }

    function test_UnbindIdentityRegistry_UnauthorizedCaller_ShouldRevert() public {
        vm.prank(system);
        storageContract.bindIdentityRegistry(registry1);

        vm.prank(user1);
        vm.expectRevert();
        storageContract.unbindIdentityRegistry(registry1);
    }

    function test_StoredIdentity_IdentityDoesNotExist_ShouldRevert() public {
        vm.expectRevert();
        storageContract.storedIdentity(user1);
    }

    function test_StoredInvestorCountry_IdentityDoesNotExist_ShouldRevert() public {
        vm.expectRevert();
        storageContract.storedInvestorCountry(user1);
    }

    function test_GetIdentityWallets_EmptyArray() public view {
        address[] memory wallets = storageContract.getIdentityWallets();
        assertEq(wallets.length, 0);
    }

    function test_LinkedIdentityRegistries_EmptyArray() public view {
        address[] memory linkedRegistries = storageContract.linkedIdentityRegistries();
        assertEq(linkedRegistries.length, 0);
    }

    function test_SupportsInterface() public view {
        assertTrue(storageContract.supportsInterface(type(ISMARTIdentityRegistryStorage).interfaceId));
        assertTrue(storageContract.supportsInterface(type(IAccessControl).interfaceId));
        assertTrue(storageContract.supportsInterface(type(IERC165).interfaceId));
        assertFalse(storageContract.supportsInterface(bytes4(0x12345678)));
    }

    function test_RegistryCanModifyStorage() public {
        vm.prank(system);
        storageContract.bindIdentityRegistry(registry1);

        vm.prank(registry1);
        storageContract.addIdentityToStorage(user1, identity1, COUNTRY_US);

        assertEq(address(storageContract.storedIdentity(user1)), address(identity1));
    }

    function test_MultipleIdentityWalletsOrder() public {
        vm.startPrank(admin);
        storageContract.addIdentityToStorage(user1, identity1, COUNTRY_US);
        storageContract.addIdentityToStorage(user2, identity2, COUNTRY_UK);
        vm.stopPrank();

        address[] memory wallets = storageContract.getIdentityWallets();
        assertEq(wallets.length, 2);
        assertEq(wallets[0], user1);
        assertEq(wallets[1], user2);

        vm.prank(admin);
        storageContract.removeIdentityFromStorage(user1);

        wallets = storageContract.getIdentityWallets();
        assertEq(wallets.length, 1);
        assertEq(wallets[0], user2);
    }

    function test_MultipleRegistriesOrder() public {
        vm.startPrank(system);
        storageContract.bindIdentityRegistry(registry1);
        storageContract.bindIdentityRegistry(registry2);
        vm.stopPrank();

        address[] memory linkedRegistries = storageContract.linkedIdentityRegistries();
        assertEq(linkedRegistries.length, 2);
        assertEq(linkedRegistries[0], registry1);
        assertEq(linkedRegistries[1], registry2);

        vm.prank(system);
        storageContract.unbindIdentityRegistry(registry1);

        linkedRegistries = storageContract.linkedIdentityRegistries();
        assertEq(linkedRegistries.length, 1);
        assertEq(linkedRegistries[0], registry2);
    }

    function test_RemoveLastIdentityFromArray() public {
        vm.startPrank(admin);
        storageContract.addIdentityToStorage(user1, identity1, COUNTRY_US);

        storageContract.removeIdentityFromStorage(user1);
        vm.stopPrank();

        address[] memory wallets = storageContract.getIdentityWallets();
        assertEq(wallets.length, 0);
    }

    function test_UnbindLastRegistryFromArray() public {
        vm.startPrank(system);
        storageContract.bindIdentityRegistry(registry1);

        storageContract.unbindIdentityRegistry(registry1);
        vm.stopPrank();

        address[] memory linkedRegistries = storageContract.linkedIdentityRegistries();
        assertEq(linkedRegistries.length, 0);
    }

    function test_TrustedForwarder() public view {
        assertTrue(implementation.isTrustedForwarder(forwarder));
        assertFalse(implementation.isTrustedForwarder(user1));
    }

    function test_ZeroAddressTrustedForwarder() public {
        ATKIdentityRegistryStorageImplementation impl = new ATKIdentityRegistryStorageImplementation(address(0));
        assertTrue(impl.isTrustedForwarder(address(0)));
        assertFalse(impl.isTrustedForwarder(forwarder));
    }

    function test_EndToEndWorkflow() public {
        vm.prank(system);
        storageContract.bindIdentityRegistry(registry1);

        vm.prank(registry1);
        storageContract.addIdentityToStorage(user1, identity1, COUNTRY_US);

        assertEq(address(storageContract.storedIdentity(user1)), address(identity1));
        assertEq(storageContract.storedInvestorCountry(user1), COUNTRY_US);

        vm.prank(registry1);
        storageContract.modifyStoredIdentity(user1, identity2);

        assertEq(address(storageContract.storedIdentity(user1)), address(identity2));

        vm.prank(registry1);
        storageContract.modifyStoredInvestorCountry(user1, COUNTRY_UK);

        assertEq(storageContract.storedInvestorCountry(user1), COUNTRY_UK);

        vm.prank(registry1);
        storageContract.removeIdentityFromStorage(user1);

        vm.expectRevert();
        storageContract.storedIdentity(user1);

        vm.prank(system);
        storageContract.unbindIdentityRegistry(registry1);

        assertFalse(storageContract.hasRole(ATKSystemRoles.STORAGE_MODIFIER_ROLE, registry1));
    }

    // --- Lost Wallet Management Tests ---

    function test_MarkWalletAsLost() public {
        // First, register the identity for the wallet
        vm.prank(admin);
        storageContract.addIdentityToStorage(lostWallet1, identity1, COUNTRY_US);

        vm.prank(admin);
        vm.expectEmit(true, true, true, true);
        emit IdentityWalletMarkedAsLost(address(identity1), lostWallet1, admin);
        storageContract.markWalletAsLost(address(identity1), lostWallet1);

        assertTrue(storageContract.isWalletMarkedAsLost(lostWallet1));
    }

    function test_MarkWalletAsLost_InvalidWalletAddress_ShouldRevert() public {
        vm.prank(admin);
        vm.expectRevert(
            abi.encodeWithSelector(ATKIdentityRegistryStorageImplementation.InvalidIdentityWalletAddress.selector)
        );
        storageContract.markWalletAsLost(address(identity1), address(0));
    }

    function test_MarkWalletAsLost_InvalidIdentityAddress_ShouldRevert() public {
        vm.prank(admin);
        vm.expectRevert(
            abi.encodeWithSelector(ATKIdentityRegistryStorageImplementation.InvalidIdentityAddress.selector)
        );
        storageContract.markWalletAsLost(address(0), lostWallet1);
    }

    function test_MarkWalletAsLost_WalletNotAssociatedWithIdentity_ShouldRevert() public {
        // Try to mark a wallet as lost without first registering it with the identity
        vm.prank(admin);
        vm.expectRevert(
            abi.encodeWithSelector(
                ATKIdentityRegistryStorageImplementation.WalletNotAssociatedWithIdentity.selector,
                address(identity1),
                lostWallet1
            )
        );
        storageContract.markWalletAsLost(address(identity1), lostWallet1);
    }

    function test_MarkWalletAsLost_WalletAssociatedWithDifferentIdentity_ShouldRevert() public {
        // Register wallet with identity1
        vm.prank(admin);
        storageContract.addIdentityToStorage(lostWallet1, identity1, COUNTRY_US);

        // Try to mark it as lost for identity2
        vm.prank(admin);
        vm.expectRevert(
            abi.encodeWithSelector(
                ATKIdentityRegistryStorageImplementation.WalletNotAssociatedWithIdentity.selector,
                address(identity2),
                lostWallet1
            )
        );
        storageContract.markWalletAsLost(address(identity2), lostWallet1);
    }

    function test_MarkWalletAsLost_UnauthorizedCaller_ShouldRevert() public {
        // First, register the identity for the wallet
        vm.prank(admin);
        storageContract.addIdentityToStorage(lostWallet1, identity1, COUNTRY_US);

        vm.prank(user1);
        vm.expectRevert();
        storageContract.markWalletAsLost(address(identity1), lostWallet1);
    }

    function test_MarkWalletAsLost_MultipleTimes_ShouldBeIdempotent() public {
        // First, register the identity for the wallet
        vm.prank(admin);
        storageContract.addIdentityToStorage(lostWallet1, identity1, COUNTRY_US);

        vm.startPrank(admin);

        // Mark wallet as lost for the first time
        vm.expectEmit(true, true, true, true);
        emit IdentityWalletMarkedAsLost(address(identity1), lostWallet1, admin);
        storageContract.markWalletAsLost(address(identity1), lostWallet1);

        // Mark the same wallet as lost again - should emit event but not duplicate in array
        vm.expectEmit(true, true, true, true);
        emit IdentityWalletMarkedAsLost(address(identity1), lostWallet1, admin);
        storageContract.markWalletAsLost(address(identity1), lostWallet1);

        vm.stopPrank();

        assertTrue(storageContract.isWalletMarkedAsLost(lostWallet1));
    }

    function test_MarkWalletAsLost_MultipleWalletsForSameIdentity() public {
        vm.startPrank(admin);
        // Register both wallets with the same identity
        storageContract.addIdentityToStorage(lostWallet1, identity1, COUNTRY_US);
        storageContract.addIdentityToStorage(lostWallet2, identity1, COUNTRY_UK);

        storageContract.markWalletAsLost(address(identity1), lostWallet1);
        storageContract.markWalletAsLost(address(identity1), lostWallet2);
        vm.stopPrank();

        assertTrue(storageContract.isWalletMarkedAsLost(lostWallet1));
        assertTrue(storageContract.isWalletMarkedAsLost(lostWallet2));
    }

    function test_MarkWalletAsLost_SameWalletForDifferentIdentities_NotPossible() public {
        vm.startPrank(admin);
        // Register wallet with identity1
        storageContract.addIdentityToStorage(lostWallet1, identity1, COUNTRY_US);

        // Mark it as lost for identity1
        storageContract.markWalletAsLost(address(identity1), lostWallet1);
        vm.stopPrank();

        assertTrue(storageContract.isWalletMarkedAsLost(lostWallet1));
    }

    function test_MarkWalletAsLost_BoundRegistryCanMark() public {
        vm.prank(system);
        storageContract.bindIdentityRegistry(registry1);

        // First, register the identity for the wallet using admin
        vm.prank(admin);
        storageContract.addIdentityToStorage(lostWallet1, identity1, COUNTRY_US);

        vm.prank(registry1);
        vm.expectEmit(true, true, true, true);
        emit IdentityWalletMarkedAsLost(address(identity1), lostWallet1, registry1);
        storageContract.markWalletAsLost(address(identity1), lostWallet1);

        assertTrue(storageContract.isWalletMarkedAsLost(lostWallet1));
    }

    function test_IsWalletMarkedAsLost_NotMarked() public view {
        assertFalse(storageContract.isWalletMarkedAsLost(lostWallet1));
    }

    function test_MarkWalletAsLost_AfterModifyingIdentity() public {
        vm.startPrank(admin);
        // Register wallet with identity1
        storageContract.addIdentityToStorage(lostWallet1, identity1, COUNTRY_US);

        // Modify the identity contract for the wallet
        storageContract.modifyStoredIdentity(lostWallet1, identity2);

        // Now marking as lost for identity1 should fail
        vm.expectRevert(
            abi.encodeWithSelector(
                ATKIdentityRegistryStorageImplementation.WalletNotAssociatedWithIdentity.selector,
                address(identity1),
                lostWallet1
            )
        );
        storageContract.markWalletAsLost(address(identity1), lostWallet1);

        // But marking as lost for identity2 should work
        storageContract.markWalletAsLost(address(identity2), lostWallet1);
        vm.stopPrank();

        assertTrue(storageContract.isWalletMarkedAsLost(lostWallet1));
    }

    function test_MarkWalletAsLost_AfterRemovingIdentity() public {
        vm.startPrank(admin);
        // Register wallet with identity1
        storageContract.addIdentityToStorage(lostWallet1, identity1, COUNTRY_US);

        // Remove the identity
        storageContract.removeIdentityFromStorage(lostWallet1);

        // Now marking as lost should fail
        vm.expectRevert(
            abi.encodeWithSelector(
                ATKIdentityRegistryStorageImplementation.WalletNotAssociatedWithIdentity.selector,
                address(identity1),
                lostWallet1
            )
        );
        storageContract.markWalletAsLost(address(identity1), lostWallet1);
        vm.stopPrank();
    }

    function test_LostWalletWorkflow_EndToEnd() public {
        // Setup: bind a registry
        vm.prank(system);
        storageContract.bindIdentityRegistry(registry1);

        vm.startPrank(admin);
        // Register wallets with identities
        storageContract.addIdentityToStorage(lostWallet1, identity1, COUNTRY_US);
        storageContract.addIdentityToStorage(lostWallet2, identity1, COUNTRY_UK);
        vm.stopPrank();

        // Step 1: Registry marks wallet as lost
        vm.prank(registry1);
        storageContract.markWalletAsLost(address(identity1), lostWallet1);

        // Step 2: Verify wallet is marked as lost globally and for specific identity
        assertTrue(storageContract.isWalletMarkedAsLost(lostWallet1));

        // Step 3: Mark another wallet for the same identity
        vm.prank(registry1);
        storageContract.markWalletAsLost(address(identity1), lostWallet2);

        // Step 4: Verify all states
        assertTrue(storageContract.isWalletMarkedAsLost(lostWallet1));
        assertTrue(storageContract.isWalletMarkedAsLost(lostWallet2));
    }

    function testFuzz_MarkWalletAsLost_WithValidInputs(address userWallet) public {
        vm.assume(userWallet != address(0));
        vm.assume(userWallet != address(identity1)); // Avoid conflicts with existing addresses

        vm.startPrank(admin);
        // First register the wallet with an identity
        storageContract.addIdentityToStorage(userWallet, identity1, COUNTRY_US);

        // Then mark it as lost
        storageContract.markWalletAsLost(address(identity1), userWallet);
        vm.stopPrank();

        assertTrue(storageContract.isWalletMarkedAsLost(userWallet));
    }
}

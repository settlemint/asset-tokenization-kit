// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { AbstractATKAssetTest } from "./AbstractATKAssetTest.sol";

import { IATKDeposit } from "../../contracts/assets/deposit/IATKDeposit.sol";
import { IATKDepositFactory } from "../../contracts/assets/deposit/IATKDepositFactory.sol";
import { ATKDepositFactoryImplementation } from "../../contracts/assets/deposit/ATKDepositFactoryImplementation.sol";
import { ATKDepositImplementation } from "../../contracts/assets/deposit/ATKDepositImplementation.sol";
import { ATKAssetRoles } from "../../contracts/assets/ATKAssetRoles.sol";
import { SMARTComplianceModuleParamPair } from
    "../../contracts/smart/interface/structs/SMARTComplianceModuleParamPair.sol";
import { IERC20Errors } from "@openzeppelin/contracts/interfaces/draft-IERC6093.sol";
import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";
import { ISMARTTokenAccessManager } from "../../contracts/smart/extensions/access-managed/ISMARTTokenAccessManager.sol";
import { MockedERC20Token } from "../utils/mocks/MockedERC20Token.sol";
import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";
import { ISMART } from "../../contracts/smart/interface/ISMART.sol";
import { TestConstants } from "../Constants.sol";

contract ATKDepositTest is AbstractATKAssetTest {
    IATKDepositFactory public depositFactory;
    IATKDeposit public deposit;

    address public owner;
    address public user1;
    address public user2;
    address public spender;

    uint8 public constant DECIMALS = 8;
    uint256 public constant INITIAL_SUPPLY = 1_000_000 * 10 ** DECIMALS;

    function setUp() public {
        // Create identities
        owner = makeAddr("owner");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        spender = makeAddr("spender");

        // Initialize ATK
        setUpATK(owner);

        // Set up the Deposit Factory
        ATKDepositFactoryImplementation depositFactoryImpl = new ATKDepositFactoryImplementation(address(forwarder));
        ATKDepositImplementation depositImpl = new ATKDepositImplementation(address(forwarder));

        vm.startPrank(platformAdmin);
        depositFactory = IATKDepositFactory(
            systemUtils.tokenFactoryRegistry().registerTokenFactory(
                "Deposit", address(depositFactoryImpl), address(depositImpl)
            )
        );
        vm.stopPrank();

        // Initialize identities
        _setUpIdentity(owner, "Owner");
        _setUpIdentity(user1, "User1");
        _setUpIdentity(user2, "User2");
        _setUpIdentity(spender, "Spender");

        deposit = _createDeposit("Deposit", "DEP", DECIMALS, new SMARTComplianceModuleParamPair[](0));
        vm.label(address(deposit), "Deposit");
    }

    function _createDeposit(
        string memory name,
        string memory symbol,
        uint8 decimals,
        SMARTComplianceModuleParamPair[] memory initialModulePairs
    )
        internal
        returns (IATKDeposit result)
    {
        vm.startPrank(owner);

        address depositAddress =
            depositFactory.createDeposit(name, symbol, decimals, initialModulePairs, TestConstants.COUNTRY_CODE_US);
        result = IATKDeposit(depositAddress);

        vm.label(depositAddress, "Deposit");
        vm.stopPrank();

        _grantAllRoles(result.accessManager(), owner, owner);

        vm.prank(owner);
        result.unpause();

        return result;
    }

    function _mintInitialSupply(address recipient) internal {
        vm.prank(owner);
        deposit.mint(recipient, INITIAL_SUPPLY);
    }

    function test_InitialState() public view {
        assertEq(deposit.name(), "Deposit");
        assertEq(deposit.symbol(), "DEP");
        assertEq(deposit.decimals(), DECIMALS);
        assertEq(deposit.totalSupply(), 0);
        assertTrue(deposit.hasRole(ATKAssetRoles.SUPPLY_MANAGEMENT_ROLE, owner));
        assertTrue(deposit.hasRole(ATKAssetRoles.GOVERNANCE_ROLE, owner));
        assertTrue(deposit.hasRole(ATKAssetRoles.CUSTODIAN_ROLE, owner));
        assertTrue(deposit.hasRole(ATKAssetRoles.EMERGENCY_ROLE, owner));
    }

    function test_DifferentDecimals() public {
        uint8[] memory decimalValues = new uint8[](3);
        decimalValues[0] = 0; // Test zero decimals
        decimalValues[1] = 6;
        decimalValues[2] = 8; // Test max decimals

        for (uint256 i = 0; i < decimalValues.length; ++i) {
            IATKDeposit newToken = _createDeposit(
                string.concat("Deposit ", Strings.toString(decimalValues[i])),
                string.concat("DEP_", Strings.toString(decimalValues[i])),
                decimalValues[i],
                new SMARTComplianceModuleParamPair[](0)
            );
            assertEq(newToken.decimals(), decimalValues[i]);
        }
    }

    function test_RevertOnInvalidDecimals() public {
        vm.startPrank(owner);

        vm.expectRevert(abi.encodeWithSelector(ISMART.InvalidDecimals.selector, 19));
        depositFactory.createDeposit(
            "Deposit 19", "DEP19", 19, new SMARTComplianceModuleParamPair[](0), TestConstants.COUNTRY_CODE_US
        );
        vm.stopPrank();
    }

    function test_OnlySupplyManagementCanMint() public {
        _mintInitialSupply(user1);

        assertEq(deposit.balanceOf(user1), INITIAL_SUPPLY);
        assertEq(deposit.totalSupply(), INITIAL_SUPPLY);

        vm.startPrank(user1);
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector, user1, ATKAssetRoles.SUPPLY_MANAGEMENT_ROLE
            )
        );
        deposit.mint(user1, 100);
        vm.stopPrank();
    }

    function test_RoleManagement() public {
        vm.startPrank(owner);
        ISMARTTokenAccessManager(deposit.accessManager()).grantRole(ATKAssetRoles.SUPPLY_MANAGEMENT_ROLE, user1);
        assertTrue(deposit.hasRole(ATKAssetRoles.SUPPLY_MANAGEMENT_ROLE, user1));

        ISMARTTokenAccessManager(deposit.accessManager()).revokeRole(ATKAssetRoles.SUPPLY_MANAGEMENT_ROLE, user1);
        assertFalse(deposit.hasRole(ATKAssetRoles.SUPPLY_MANAGEMENT_ROLE, user1));
        vm.stopPrank();
    }

    function test_Burn() public {
        _mintInitialSupply(user1);

        vm.prank(owner);
        deposit.burn(user1, 100);

        assertEq(deposit.balanceOf(user1), INITIAL_SUPPLY - 100);
    }

    function test_onlyAdminCanPause() public {
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector, user1, ATKAssetRoles.EMERGENCY_ROLE
            )
        );
        vm.prank(user1);
        deposit.pause();

        vm.prank(owner);
        deposit.pause();

        assertTrue(deposit.paused());
    }

    // ERC20 custodian tests
    function test_OnlyUserManagementCanFreeze() public {
        vm.prank(owner);
        deposit.mint(user1, 100);

        vm.prank(user2);
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector, user2, ATKAssetRoles.CUSTODIAN_ROLE
            )
        );
        deposit.freezePartialTokens(user1, 100);

        vm.prank(owner);
        deposit.freezePartialTokens(user1, 100);

        assertEq(deposit.getFrozenTokens(user1), 100);

        vm.prank(user1);
        vm.expectRevert(abi.encodeWithSelector(IERC20Errors.ERC20InsufficientBalance.selector, user1, 0, 100));
        bool result = deposit.transfer(user2, 100);
        result; // Explicitly unused - we expect this to revert

        vm.prank(owner);
        deposit.unfreezePartialTokens(user1, 100);

        assertEq(deposit.getFrozenTokens(user1), 0);
    }

    //Transfer and approval tests
    function test_TransferAndApproval() public {
        _mintInitialSupply(user1);

        vm.prank(user1);
        deposit.approve(spender, 100);
        assertEq(deposit.allowance(user1, spender), 100);

        vm.prank(spender);
        bool success = deposit.transferFrom(user1, user2, 50);
        assertTrue(success, "TransferFrom failed");
        assertEq(deposit.balanceOf(user2), 50);
        assertEq(deposit.allowance(user1, spender), 50);
    }

    function test_DepositForcedTransfer() public {
        _mintInitialSupply(user1);

        vm.prank(owner);
        deposit.forcedTransfer(user1, user2, INITIAL_SUPPLY);

        assertEq(deposit.balanceOf(user1), 0);
        assertEq(deposit.balanceOf(user2), INITIAL_SUPPLY);
    }

    function test_onlySupplyManagementCanForceTransfer() public {
        _mintInitialSupply(user1);

        vm.prank(user2);
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector, user2, ATKAssetRoles.CUSTODIAN_ROLE
            )
        );
        deposit.forcedTransfer(user1, user2, INITIAL_SUPPLY);
    }

    // Test for recoverERC20 function
    function test_RecoverERC20() public {
        // Create a mock token
        MockedERC20Token mockToken = new MockedERC20Token("Mock", "MCK", DECIMALS);

        vm.startPrank(owner);
        mockToken.mint(address(deposit), 1000);
        vm.stopPrank();

        assertEq(mockToken.balanceOf(address(deposit)), 1000);

        // Test recovery by owner (who has DEFAULT_ADMIN_ROLE)
        vm.startPrank(owner);
        deposit.recoverERC20(address(mockToken), user1, 500);
        vm.stopPrank();

        // Verify tokens were recovered
        assertEq(mockToken.balanceOf(address(deposit)), 500);
        assertEq(mockToken.balanceOf(user1), 500);

        // Test recovery by non-admin
        vm.startPrank(user2);
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector, user2, ATKAssetRoles.EMERGENCY_ROLE
            )
        );
        deposit.recoverERC20(address(mockToken), user1, 500);
        vm.stopPrank();
    }

    // Test recoverERC20 revert on invalid address
    function test_RecoverERC20RevertOnInvalidAddress() public {
        // Test recovering from address(0)
        vm.startPrank(owner);
        vm.expectRevert(); // ZeroAddressNotAllowed
        deposit.recoverERC20(address(0), user1, 100);
        vm.stopPrank();

        // Test recovering own token (should revert)
        vm.startPrank(owner);
        vm.expectRevert(); // CannotRecoverSelf
        deposit.recoverERC20(address(deposit), user1, 100);
        vm.stopPrank();
    }

    // Test recoverERC20 revert on insufficient balance
    function test_RecoverERC20RevertOnInsufficientBalance() public {
        // Create a mock token
        MockedERC20Token mockToken = new MockedERC20Token("Mock", "MCK", DECIMALS);

        vm.startPrank(owner);
        mockToken.mint(address(deposit), 100);
        vm.stopPrank();

        // Test recovering more than balance
        vm.startPrank(owner);
        vm.expectRevert(); // InsufficientTokenBalance
        deposit.recoverERC20(address(mockToken), user1, 200);
        vm.stopPrank();
    }
}

// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { AbstractATKAssetTest } from "./AbstractATKAssetTest.sol";
import { IATKEquityFactory } from "../../contracts/assets/equity/IATKEquityFactory.sol";
import { ATKEquityFactoryImplementation } from "../../contracts/assets/equity/ATKEquityFactoryImplementation.sol";
import { IATKEquity } from "../../contracts/assets/equity/IATKEquity.sol";
import { ATKEquityImplementation } from "../../contracts/assets/equity/ATKEquityImplementation.sol";
import { ATKAssetRoles } from "../../contracts/assets/ATKAssetRoles.sol";
import { SMARTComplianceModuleParamPair } from
    "../../contracts/smart/interface/structs/SMARTComplianceModuleParamPair.sol";
import { IERC20Errors } from "@openzeppelin/contracts/interfaces/draft-IERC6093.sol";
import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";
import { ISMARTTokenAccessManager } from "../../contracts/smart/extensions/access-managed/ISMARTTokenAccessManager.sol";
import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";
import { TestConstants } from "../Constants.sol";

contract ATKEquityTest is AbstractATKAssetTest {
    IATKEquityFactory internal equityFactory;
    IATKEquity internal smartEquity;

    address internal owner;
    address internal user1;
    address internal user2;
    address internal spender;

    uint8 public constant DECIMALS = 8;
    string public constant NAME = "ATK Equity";
    string public constant SYMBOL = "ATK";

    uint256 public constant INITIAL_SUPPLY = 1_000_000 * 10 ** 8; // 1M tokens with 8 decimals

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Paused(address account);
    event Unpaused(address account);
    event CustodianOperation(address indexed custodian, address indexed from, address indexed to, uint256 amount);

    function setUp() public {
        // Create identities
        owner = makeAddr("owner");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        spender = makeAddr("spender");

        // Initialize ATK
        setUpATK(owner);

        // Set up the Equity Factory
        ATKEquityFactoryImplementation equityFactoryImpl = new ATKEquityFactoryImplementation(address(forwarder));
        ATKEquityImplementation equityImpl = new ATKEquityImplementation(address(forwarder));

        vm.startPrank(platformAdmin);
        equityFactory = IATKEquityFactory(
            systemUtils.tokenFactoryRegistry().registerTokenFactory(
                "Equity", address(equityFactoryImpl), address(equityImpl)
            )
        );

        vm.stopPrank();

        // Initialize identities
        _setUpIdentity(owner, "Owner");
        _setUpIdentity(user1, "User 1");
        _setUpIdentity(user2, "User 2");
        _setUpIdentity(spender, "Spender");

        smartEquity = _createEquityAndMint(NAME, SYMBOL, DECIMALS, new SMARTComplianceModuleParamPair[](0));
        vm.label(address(smartEquity), "ATKEquity");

        // Fund test accounts
        vm.deal(user1, 100 ether);
        vm.deal(user2, 100 ether);
        vm.deal(spender, 100 ether);
    }

    function _createEquityAndMint(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        SMARTComplianceModuleParamPair[] memory initialModulePairs_
    )
        internal
        returns (IATKEquity result)
    {
        vm.startPrank(owner);
        address equityAddress =
            equityFactory.createEquity(name_, symbol_, decimals_, initialModulePairs_, TestConstants.COUNTRY_CODE_US);

        result = IATKEquity(equityAddress);

        vm.label(equityAddress, "Equity");
        vm.stopPrank();

        _grantAllRoles(result.accessManager(), owner, owner);

        vm.prank(owner);
        result.unpause();

        vm.prank(owner);
        result.mint(owner, INITIAL_SUPPLY);

        return result;
    }

    // Basic Token Functionality Tests
    function test_InitialState() public view {
        assertEq(smartEquity.name(), NAME);
        assertEq(smartEquity.symbol(), SYMBOL);
        assertEq(smartEquity.decimals(), DECIMALS);
        assertTrue(smartEquity.hasRole(ATKAssetRoles.SUPPLY_MANAGEMENT_ROLE, owner));
        assertTrue(smartEquity.hasRole(ATKAssetRoles.GOVERNANCE_ROLE, owner));
        assertTrue(smartEquity.hasRole(ATKAssetRoles.CUSTODIAN_ROLE, owner));
        assertTrue(smartEquity.hasRole(ATKAssetRoles.EMERGENCY_ROLE, owner));
        assertEq(smartEquity.totalSupply(), INITIAL_SUPPLY);
        assertEq(smartEquity.balanceOf(owner), INITIAL_SUPPLY);
    }

    function test_DifferentDecimals() public {
        uint8[] memory decimalValues = new uint8[](4);
        decimalValues[0] = 0; // Test zero decimals
        decimalValues[1] = 6;
        decimalValues[2] = 8;
        decimalValues[3] = 18; // Test max decimals

        for (uint256 i = 0; i < decimalValues.length; ++i) {
            IATKEquity newEquity = _createEquityAndMint(
                string.concat("Test ATK Equity", Strings.toString(decimalValues[i])),
                string.concat("TEST", Strings.toString(decimalValues[i])),
                decimalValues[i],
                new SMARTComplianceModuleParamPair[](0)
            );
            assertEq(newEquity.decimals(), decimalValues[i]);
        }
    }

    function test_OnlySupplyManagementCanMint() public {
        uint256 amount = 1000 * 10 ** DECIMALS;

        // Have owner (who has SUPPLY_MANAGEMENT_ROLE) do the minting
        vm.startPrank(owner);
        smartEquity.mint(user1, amount);
        vm.stopPrank();

        assertEq(smartEquity.balanceOf(user1), amount);
        assertEq(smartEquity.totalSupply(), INITIAL_SUPPLY + amount);

        // Test that non-authorized user can't mint
        vm.startPrank(user1);
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector, user1, ATKAssetRoles.SUPPLY_MANAGEMENT_ROLE
            )
        );
        smartEquity.mint(user1, amount);
        vm.stopPrank();
    }

    function test_RoleManagement() public {
        vm.startPrank(owner);
        ISMARTTokenAccessManager(smartEquity.accessManager()).grantRole(ATKAssetRoles.SUPPLY_MANAGEMENT_ROLE, user1);
        assertTrue(smartEquity.hasRole(ATKAssetRoles.SUPPLY_MANAGEMENT_ROLE, user1));

        ISMARTTokenAccessManager(smartEquity.accessManager()).revokeRole(ATKAssetRoles.SUPPLY_MANAGEMENT_ROLE, user1);
        assertFalse(smartEquity.hasRole(ATKAssetRoles.SUPPLY_MANAGEMENT_ROLE, user1));
        vm.stopPrank();
    }

    // ERC20 Standard Tests
    function test_Transfer() public {
        uint256 amount = 1000 * 10 ** DECIMALS;

        // Have owner do the minting since they have SUPPLY_MANAGEMENT_ROLE
        vm.startPrank(owner);
        smartEquity.mint(user1, amount);
        vm.stopPrank();

        vm.startPrank(user1);
        assertTrue(smartEquity.transfer(user2, 500 * 10 ** DECIMALS), "Transfer failed");
        vm.stopPrank();

        assertEq(smartEquity.balanceOf(user1), 500 * 10 ** DECIMALS);
        assertEq(smartEquity.balanceOf(user2), 500 * 10 ** DECIMALS);
    }

    function test_Approve() public {
        vm.startPrank(user1);
        smartEquity.approve(spender, 1000 * 10 ** DECIMALS);
        vm.stopPrank();
        assertEq(smartEquity.allowance(user1, spender), 1000 * 10 ** DECIMALS);
    }

    function test_TransferFrom() public {
        uint256 amount = 1000 * 10 ** DECIMALS;
        vm.startPrank(owner);
        smartEquity.mint(user1, amount);
        vm.stopPrank();

        vm.startPrank(user1);
        smartEquity.approve(spender, amount);
        vm.stopPrank();

        vm.startPrank(spender);
        assertTrue(smartEquity.transferFrom(user1, user2, 500 * 10 ** DECIMALS), "TransferFrom failed");
        vm.stopPrank();

        assertEq(smartEquity.balanceOf(user1), 500 * 10 ** DECIMALS);
        assertEq(smartEquity.balanceOf(user2), 500 * 10 ** DECIMALS);
    }

    // Burnable Tests
    function test_Burn() public {
        uint256 amount = 1000 * 10 ** DECIMALS;
        vm.startPrank(owner);
        smartEquity.mint(user1, amount);
        // Only owner/admin can burn
        smartEquity.burn(user1, 500 * 10 ** DECIMALS);
        vm.stopPrank();

        assertEq(smartEquity.balanceOf(user1), 500 * 10 ** DECIMALS);
        assertEq(smartEquity.totalSupply(), INITIAL_SUPPLY + 500 * 10 ** DECIMALS);
    }

    // Pausable Tests
    function test_OnlyAdminCanPause() public {
        bytes32 role = ATKAssetRoles.EMERGENCY_ROLE;

        vm.startPrank(user1);
        vm.expectRevert(abi.encodeWithSignature("AccessControlUnauthorizedAccount(address,bytes32)", user1, role));
        smartEquity.pause();
        vm.stopPrank();

        vm.startPrank(owner);
        smartEquity.pause();
        vm.stopPrank();
        assertTrue(smartEquity.paused());
    }

    function test_RevertWhen_TransferWhenPaused() public {
        uint256 amount = 1000 * 10 ** DECIMALS;
        vm.startPrank(owner);
        smartEquity.mint(user1, amount);
        smartEquity.pause();
        vm.stopPrank();

        vm.startPrank(user1);
        vm.expectRevert(abi.encodeWithSignature("TokenPaused()"));
        /// forge-lint: disable-next-line(erc20-unchecked-transfer)
        smartEquity.transfer(user2, 500 * 10 ** DECIMALS);
        vm.stopPrank();
    }

    function test_PauseUnpause() public {
        uint256 amount = 1000 * 10 ** DECIMALS;
        vm.startPrank(owner);

        // Mint some tokens first
        smartEquity.mint(owner, amount);

        // Pause the contract
        smartEquity.pause();
        assertTrue(smartEquity.paused());

        // Try to transfer while paused - should revert with TokenPaused error
        vm.expectRevert(abi.encodeWithSignature("TokenPaused()"));
        /// forge-lint: disable-next-line(erc20-unchecked-transfer)
        smartEquity.transfer(user1, amount);

        // Unpause
        smartEquity.unpause();
        assertFalse(smartEquity.paused());

        // Transfer should now succeed
        assertTrue(smartEquity.transfer(user1, amount), "Transfer failed");
        assertEq(smartEquity.balanceOf(user1), amount);

        vm.stopPrank();
    }

    // Custodian Tests
    function test_OnlyUserManagementCanFreeze() public {
        vm.startPrank(owner);
        smartEquity.mint(user1, 100 * 10 ** DECIMALS);
        vm.stopPrank();

        // Test that non-authorized user can't freeze
        vm.startPrank(user2);
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector, user2, ATKAssetRoles.CUSTODIAN_ROLE
            )
        );
        smartEquity.freezePartialTokens(user1, 50 * 10 ** DECIMALS);
        vm.stopPrank();

        // Test successful freezing by owner
        vm.startPrank(owner);
        smartEquity.freezePartialTokens(user1, 50 * 10 ** DECIMALS);
        vm.stopPrank();

        // Test that frozen amount can't be transferred
        vm.startPrank(user1);
        vm.expectRevert(
            abi.encodeWithSelector(
                IERC20Errors.ERC20InsufficientBalance.selector, user1, 50 * 10 ** DECIMALS, 100 * 10 ** DECIMALS
            )
        );
        /// forge-lint: disable-next-line(erc20-unchecked-transfer)
        smartEquity.transfer(user2, 100 * 10 ** DECIMALS);

        // But can transfer less than the unfrozen amount
        assertTrue(smartEquity.transfer(user2, 10 * 10 ** DECIMALS), "Transfer failed");
        vm.stopPrank();

        assertEq(smartEquity.balanceOf(user2), 10 * 10 ** DECIMALS);

        // Test unfreezing and subsequent transfer
        vm.startPrank(owner);
        smartEquity.freezePartialTokens(user1, 0);
        vm.stopPrank();

        vm.startPrank(user1);
        assertTrue(smartEquity.transfer(user2, 40 * 10 ** DECIMALS), "Transfer failed");
        vm.stopPrank();

        assertEq(smartEquity.balanceOf(user2), 50 * 10 ** DECIMALS);
    }

    // Voting Tests
    function test_DelegateVoting() public {
        uint256 amount = 1000 * 10 ** DECIMALS;
        vm.startPrank(owner);
        smartEquity.mint(user1, amount);
        vm.stopPrank();

        vm.startPrank(user1);
        smartEquity.delegate(user2);
        vm.stopPrank();

        assertEq(smartEquity.delegates(user1), user2);
        assertEq(smartEquity.getVotes(user2), amount);
    }

    function test_VotingPowerTransfer() public {
        uint256 amount = 1000 * 10 ** DECIMALS;
        vm.startPrank(owner);
        smartEquity.mint(user1, amount);
        vm.stopPrank();

        vm.startPrank(user1);
        smartEquity.delegate(user1);
        vm.stopPrank();
        assertEq(smartEquity.getVotes(user1), amount);

        vm.startPrank(user1);
        assertTrue(smartEquity.transfer(user2, 500 * 10 ** DECIMALS), "Transfer failed");
        vm.stopPrank();
        assertEq(smartEquity.getVotes(user1), 500 * 10 ** DECIMALS);
    }

    // Events Tests
    function test_TransferEvent() public {
        uint256 amount = 1000 * 10 ** DECIMALS;
        vm.startPrank(owner);
        smartEquity.mint(user1, amount);
        vm.stopPrank();

        vm.expectEmit(true, true, false, true);
        emit Transfer(user1, user2, 500 * 10 ** DECIMALS);

        vm.startPrank(user1);
        assertTrue(smartEquity.transfer(user2, 500 * 10 ** DECIMALS), "Transfer failed");
        vm.stopPrank();
    }

    function test_ApprovalEvent() public {
        vm.expectEmit(true, true, false, true);
        emit Approval(user1, spender, 1000 * 10 ** DECIMALS);

        vm.startPrank(user1);
        smartEquity.approve(spender, 1000 * 10 ** DECIMALS);
        vm.stopPrank();
    }

    // Forced Transfer Tests (equivalent to clawback in Equity.t.sol)
    function test_ForcedTransfer() public {
        vm.startPrank(owner);
        smartEquity.mint(user1, 1000 * 10 ** DECIMALS);
        vm.stopPrank();

        vm.startPrank(owner);
        smartEquity.forcedTransfer(user1, user2, 1000 * 10 ** DECIMALS);
        vm.stopPrank();

        assertEq(smartEquity.balanceOf(user1), 0);
        assertEq(smartEquity.balanceOf(user2), 1000 * 10 ** DECIMALS);
    }

    function test_onlySupplyManagementCanForcedTransfer() public {
        vm.startPrank(owner);
        smartEquity.mint(user1, 1000 * 10 ** DECIMALS);
        vm.stopPrank();

        vm.startPrank(user2);
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector, user2, ATKAssetRoles.CUSTODIAN_ROLE
            )
        );
        smartEquity.forcedTransfer(user1, user2, 1000 * 10 ** DECIMALS);
        vm.stopPrank();
    }
}

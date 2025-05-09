// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { Test } from "forge-std/Test.sol";
import { SMARTEquity } from "../contracts/SMARTEquity.sol";
import { Forwarder } from "../contracts/Forwarder.sol";
import { SMARTConstants } from "../contracts/SMARTConstants.sol";
import { TestConstants } from "./TestConstants.sol";
import { InvalidDecimals } from "smart-protocol/contracts/extensions/core/SMARTErrors.sol";
import { ClaimUtils } from "smart-protocol/test/utils/ClaimUtils.sol";
import { SMARTComplianceModuleParamPair } from
    "smart-protocol/contracts/interface/structs/SMARTComplianceModuleParamPair.sol";
import { SMARTUtils } from "./utils/SMARTUtils.sol";
import { IERC20Errors } from "@openzeppelin/contracts/interfaces/draft-IERC6093.sol";
import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";

contract SMARTEquityTest is Test {
    SMARTUtils internal smartUtils;
    SMARTEquity internal smartEquity;
    Forwarder internal forwarder;
    address internal owner;
    address internal user1;
    address internal user2;
    address internal spender;
    address internal identityRegistry;
    address internal compliance;

    uint8 public constant DECIMALS = 8;
    string public constant NAME = "SMART Equity";
    string public constant SYMBOL = "SMART";
    string public constant EQUITY_CLASS = "Common";
    string public constant EQUITY_CATEGORY = "Class A";
    uint256 public constant INITIAL_SUPPLY = 1_000_000 * 10 ** 8; // 1M tokens with 8 decimals

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Paused(address account);
    event Unpaused(address account);
    event CustodianOperation(address indexed custodian, address indexed from, address indexed to, uint256 amount);

    function setUp() public {
        smartUtils = new SMARTUtils();
        identityRegistry = address(smartUtils.identityRegistry());
        compliance = address(smartUtils.compliance());

        // Create identities
        owner = makeAddr("owner");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        spender = makeAddr("spender");

        address[] memory identities = new address[](4);
        identities[0] = owner;
        identities[1] = user1;
        identities[2] = user2;
        identities[3] = spender;
        smartUtils.setUpIdentities(identities);

        // Deploy forwarder first
        forwarder = new Forwarder();

        smartEquity =
            _createEquityAndMint(NAME, SYMBOL, DECIMALS, new uint256[](0), new SMARTComplianceModuleParamPair[](0));
        vm.label(address(smartEquity), "SMARTEquity");

        // Fund test accounts
        vm.deal(user1, 100 ether);
        vm.deal(user2, 100 ether);
        vm.deal(spender, 100 ether);
    }

    function _createEquityAndMint(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256[] memory requiredClaimTopics_,
        SMARTComplianceModuleParamPair[] memory initialModulePairs_
    )
        internal
        returns (SMARTEquity result)
    {
        vm.prank(owner);
        result = new SMARTEquity(
            name_,
            symbol_,
            decimals_,
            requiredClaimTopics_,
            initialModulePairs_,
            identityRegistry,
            compliance,
            address(forwarder)
        );

        smartUtils.createAndSetTokenOnchainID(address(result), owner);

        vm.prank(owner);
        result.mint(owner, INITIAL_SUPPLY);

        return result;
    }

    // Basic Token Functionality Tests
    function test_InitialState() public view {
        assertEq(smartEquity.name(), NAME);
        assertEq(smartEquity.symbol(), SYMBOL);
        assertEq(smartEquity.decimals(), DECIMALS);
        assertTrue(smartEquity.hasRole(smartEquity.DEFAULT_ADMIN_ROLE(), owner));
        assertTrue(smartEquity.hasRole(SMARTConstants.SUPPLY_MANAGEMENT_ROLE, owner));
        assertTrue(smartEquity.hasRole(SMARTConstants.USER_MANAGEMENT_ROLE, owner));
        assertEq(smartEquity.totalSupply(), INITIAL_SUPPLY);
        assertEq(smartEquity.balanceOf(owner), INITIAL_SUPPLY);
    }

    function test_DifferentDecimals() public {
        uint8[] memory decimalValues = new uint8[](4);
        decimalValues[0] = 0; // Test zero decimals
        decimalValues[1] = 6;
        decimalValues[2] = 8;
        decimalValues[3] = 18; // Test max decimals

        for (uint256 i = 0; i < decimalValues.length; i++) {
            SMARTEquity newEquity = new SMARTEquity(
                "Test SMART Equity",
                "TEST",
                decimalValues[i],
                new uint256[](0),
                new SMARTComplianceModuleParamPair[](0),
                identityRegistry,
                compliance,
                address(forwarder)
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
                IAccessControl.AccessControlUnauthorizedAccount.selector, user1, SMARTConstants.SUPPLY_MANAGEMENT_ROLE
            )
        );
        smartEquity.mint(user1, amount);
        vm.stopPrank();
    }

    function test_RoleManagement() public {
        vm.startPrank(owner);
        smartEquity.grantRole(SMARTConstants.SUPPLY_MANAGEMENT_ROLE, user1);
        assertTrue(smartEquity.hasRole(SMARTConstants.SUPPLY_MANAGEMENT_ROLE, user1));

        smartEquity.revokeRole(SMARTConstants.SUPPLY_MANAGEMENT_ROLE, user1);
        assertFalse(smartEquity.hasRole(SMARTConstants.SUPPLY_MANAGEMENT_ROLE, user1));
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
        smartEquity.transfer(user2, 500 * 10 ** DECIMALS);
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
        smartEquity.transferFrom(user1, user2, 500 * 10 ** DECIMALS);
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
        bytes32 role = smartEquity.DEFAULT_ADMIN_ROLE();

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
        smartEquity.transfer(user1, amount);

        // Unpause
        smartEquity.unpause();
        assertFalse(smartEquity.paused());

        // Transfer should now succeed
        smartEquity.transfer(user1, amount);
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
                IAccessControl.AccessControlUnauthorizedAccount.selector, user2, SMARTConstants.USER_MANAGEMENT_ROLE
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
        smartEquity.transfer(user2, 100 * 10 ** DECIMALS);

        // But can transfer less than the unfrozen amount
        smartEquity.transfer(user2, 10 * 10 ** DECIMALS);
        vm.stopPrank();

        assertEq(smartEquity.balanceOf(user2), 10 * 10 ** DECIMALS);

        // Test unfreezing and subsequent transfer
        vm.startPrank(owner);
        smartEquity.freezePartialTokens(user1, 0);
        vm.stopPrank();

        vm.startPrank(user1);
        smartEquity.transfer(user2, 40 * 10 ** DECIMALS);
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
        smartEquity.transfer(user2, 500 * 10 ** DECIMALS);
        vm.stopPrank();
        assertEq(smartEquity.getVotes(user1), 500 * 10 ** DECIMALS);
    }

    // Permit Tests
    function test_Permit() public {
        uint256 privateKey = 0xA11CE;
        address signer = vm.addr(privateKey);
        vm.label(signer, "Signer Wallet");

        // Set up identity for the signer and spender
        smartUtils.setUpIdentity(signer);

        vm.startPrank(owner);
        smartEquity.mint(signer, 1000 * 10 ** DECIMALS);
        vm.stopPrank();

        uint256 deadline = block.timestamp + 1 hours;
        uint256 nonce = smartEquity.nonces(signer);

        bytes32 DOMAIN_SEPARATOR = smartEquity.DOMAIN_SEPARATOR();

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(
            privateKey,
            keccak256(
                abi.encodePacked(
                    "\x19\x01",
                    DOMAIN_SEPARATOR,
                    keccak256(
                        abi.encode(
                            keccak256(
                                "Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)"
                            ),
                            signer,
                            spender,
                            1000 * 10 ** DECIMALS,
                            nonce,
                            deadline
                        )
                    )
                )
            )
        );

        smartEquity.permit(signer, spender, 1000 * 10 ** DECIMALS, deadline, v, r, s);

        assertEq(smartEquity.allowance(signer, spender), 1000 * 10 ** DECIMALS);
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
        smartEquity.transfer(user2, 500 * 10 ** DECIMALS);
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
            abi.encodeWithSignature(
                "AccessControlUnauthorizedAccount(address,bytes32)", user2, SMARTConstants.SUPPLY_MANAGEMENT_ROLE
            )
        );
        smartEquity.forcedTransfer(user1, user2, 1000 * 10 ** DECIMALS);
        vm.stopPrank();
    }
}

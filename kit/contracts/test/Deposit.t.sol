// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.27;

import { Test } from "forge-std/Test.sol";
import { Deposit } from "../contracts/Deposit.sol";
import { Forwarder } from "../contracts/Forwarder.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract DepositTest is Test {
    Deposit public deposit;
    Forwarder public forwarder;
    address public owner;
    address public user1;
    address public user2;
    address public spender;
    uint256 public constant INITIAL_SUPPLY = 1_000_000 * 10 ** 18;
    uint48 public constant COLLATERAL_LIVENESS = 7 days;
    uint8 public constant DECIMALS = 8;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event TokenWithdrawn(address indexed token, address indexed to, uint256 amount);

    function setUp() public {
        owner = makeAddr("owner");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        spender = makeAddr("spender");

        // Deploy forwarder first
        forwarder = new Forwarder();

        vm.startPrank(owner);
        deposit = new Deposit("Deposit", "DPT", DECIMALS, owner, COLLATERAL_LIVENESS, address(forwarder));
        vm.stopPrank();
    }

    // Basic ERC20 functionality tests
    function test_InitialState() public view {
        assertEq(deposit.name(), "Deposit");
        assertEq(deposit.symbol(), "DPT");
        assertEq(deposit.decimals(), DECIMALS);
        assertEq(deposit.totalSupply(), 0);
        assertTrue(deposit.hasRole(deposit.DEFAULT_ADMIN_ROLE(), owner));
        assertTrue(deposit.hasRole(deposit.SUPPLY_MANAGEMENT_ROLE(), owner));
        assertTrue(deposit.hasRole(deposit.USER_MANAGEMENT_ROLE(), owner));
    }

    function test_DifferentDecimals() public {
        uint8[] memory decimalValues = new uint8[](4);
        decimalValues[0] = 0; // Test zero decimals
        decimalValues[1] = 6;
        decimalValues[2] = 8;
        decimalValues[3] = 18; // Test max decimals

        for (uint256 i = 0; i < decimalValues.length; i++) {
            vm.startPrank(owner);
            Deposit newDeposit =
                new Deposit("Deposit", "DPT", decimalValues[i], owner, COLLATERAL_LIVENESS, address(forwarder));
            vm.stopPrank();
            assertEq(newDeposit.decimals(), decimalValues[i]);
        }
    }

    function test_RevertOnInvalidDecimals() public {
        vm.startPrank(owner);
        vm.expectRevert(abi.encodeWithSelector(Deposit.InvalidDecimals.selector, 19));
        new Deposit("Deposit", "DPT", 19, owner, COLLATERAL_LIVENESS, address(forwarder));
        vm.stopPrank();
    }

    function test_OnlySupplyManagementCanMint() public {
        vm.startPrank(owner);
        // Allow user1 before minting
        deposit.allowUser(user1);
        // Update collateral first
        deposit.updateCollateral(INITIAL_SUPPLY);
        deposit.mint(user1, INITIAL_SUPPLY);
        assertEq(deposit.balanceOf(user1), INITIAL_SUPPLY);
        assertEq(deposit.totalSupply(), INITIAL_SUPPLY);
        vm.stopPrank();

        vm.startPrank(user1);
        vm.expectRevert(
            abi.encodeWithSignature(
                "AccessControlUnauthorizedAccount(address,bytes32)", user1, deposit.SUPPLY_MANAGEMENT_ROLE()
            )
        );
        deposit.mint(user1, INITIAL_SUPPLY);
        vm.stopPrank();
    }

    // ERC20Collateral tests
    function test_OnlyAdminCanUpdateCollateral() public {
        uint256 collateralAmount = 1_000_000;

        bytes32 role = deposit.SUPPLY_MANAGEMENT_ROLE();
        vm.startPrank(user1);
        vm.expectRevert(abi.encodeWithSignature("AccessControlUnauthorizedAccount(address,bytes32)", user1, role));
        deposit.updateCollateral(collateralAmount);
        vm.stopPrank();

        vm.startPrank(owner);
        deposit.updateCollateral(collateralAmount);
        vm.stopPrank();

        (uint256 amount, uint48 timestamp) = deposit.collateral();
        assertEq(amount, collateralAmount);
        assertEq(timestamp, uint48(block.timestamp));
    }

    function test_RoleManagement() public {
        vm.startPrank(owner);
        deposit.grantRole(deposit.SUPPLY_MANAGEMENT_ROLE(), user1);
        assertTrue(deposit.hasRole(deposit.SUPPLY_MANAGEMENT_ROLE(), user1));

        deposit.revokeRole(deposit.SUPPLY_MANAGEMENT_ROLE(), user1);
        assertFalse(deposit.hasRole(deposit.SUPPLY_MANAGEMENT_ROLE(), user1));
        vm.stopPrank();
    }

    // ERC20Burnable tests
    function test_Burn() public {
        vm.startPrank(owner);
        deposit.allowUser(user1);
        deposit.updateCollateral(INITIAL_SUPPLY);
        deposit.mint(user1, INITIAL_SUPPLY);
        vm.stopPrank();

        vm.startPrank(user1);
        deposit.burn(100);
        vm.stopPrank();

        assertEq(deposit.balanceOf(user1), INITIAL_SUPPLY - 100);
    }

    function test_BurnFrom() public {
        vm.startPrank(owner);
        deposit.allowUser(user1);
        deposit.allowUser(spender);
        deposit.updateCollateral(INITIAL_SUPPLY);
        deposit.mint(user1, INITIAL_SUPPLY);
        vm.stopPrank();

        vm.startPrank(user1);
        deposit.approve(spender, 100);
        vm.stopPrank();

        vm.startPrank(spender);
        deposit.burnFrom(user1, 100);
        vm.stopPrank();

        assertEq(deposit.balanceOf(user1), INITIAL_SUPPLY - 100);
    }

    // ERC20Pausable tests
    function test_OnlyAdminCanPause() public {
        vm.startPrank(user1);
        vm.expectRevert(
            abi.encodeWithSignature(
                "AccessControlUnauthorizedAccount(address,bytes32)", user1, deposit.DEFAULT_ADMIN_ROLE()
            )
        );
        deposit.pause();
        vm.stopPrank();

        vm.startPrank(owner);
        deposit.pause();
        vm.stopPrank();

        assertTrue(deposit.paused());
    }

    // ERC20Allowlist tests
    function test_OnlyUserManagementCanAllowAndDisallow() public {
        vm.startPrank(owner);
        deposit.allowUser(user1);
        deposit.allowUser(user2);
        deposit.updateCollateral(INITIAL_SUPPLY);
        deposit.mint(user1, INITIAL_SUPPLY);
        vm.stopPrank();

        vm.startPrank(user2);
        vm.expectRevert(
            abi.encodeWithSignature(
                "AccessControlUnauthorizedAccount(address,bytes32)", user2, deposit.USER_MANAGEMENT_ROLE()
            )
        );
        deposit.disallowUser(user1);
        vm.stopPrank();

        vm.startPrank(owner);
        deposit.disallowUser(user1);
        vm.stopPrank();

        assertFalse(deposit.allowed(user1));

        vm.startPrank(user1);
        vm.expectRevert();
        deposit.transfer(user2, 100);
        vm.stopPrank();

        vm.startPrank(owner);
        deposit.allowUser(user1);
        vm.stopPrank();

        assertTrue(deposit.allowed(user1));

        vm.startPrank(user1);
        deposit.transfer(user2, 100);
        vm.stopPrank();

        assertEq(deposit.balanceOf(user2), 100);
    }

    // ERC20Custodian tests
    function test_OnlyUserManagementCanFreeze() public {
        vm.startPrank(owner);
        deposit.allowUser(user1);
        deposit.allowUser(user2);
        deposit.updateCollateral(INITIAL_SUPPLY);
        deposit.mint(user1, 100);
        vm.stopPrank();

        vm.startPrank(user2);
        vm.expectRevert(abi.encodeWithSignature("ERC20NotCustodian()"));
        deposit.freeze(user1, 100);
        vm.stopPrank();

        vm.startPrank(owner);
        deposit.freeze(user1, 100);
        vm.stopPrank();

        assertEq(deposit.frozen(user1), 100);

        vm.startPrank(user1);
        vm.expectRevert();
        deposit.transfer(user2, 100);
        vm.stopPrank();

        vm.startPrank(owner);
        deposit.freeze(user1, 0);
        vm.stopPrank();

        assertEq(deposit.frozen(user1), 0);
    }

    // ERC20Permit tests
    function test_Permit() public {
        uint256 privateKey = 0xA11CE;
        address signer = vm.addr(privateKey);

        vm.startPrank(owner);
        deposit.allowUser(signer);
        deposit.allowUser(spender);
        deposit.updateCollateral(INITIAL_SUPPLY);
        deposit.mint(signer, INITIAL_SUPPLY);
        vm.stopPrank();

        uint256 deadline = block.timestamp + 1 hours;
        uint256 nonce = deposit.nonces(signer);

        bytes32 DOMAIN_SEPARATOR = deposit.DOMAIN_SEPARATOR();

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
                            100,
                            nonce,
                            deadline
                        )
                    )
                )
            )
        );

        deposit.permit(signer, spender, 100, deadline, v, r, s);
        assertEq(deposit.allowance(signer, spender), 100);
    }

    // Token withdrawal tests
    function test_WithdrawToken() public {
        // Deploy a mock ERC20 token
        Deposit mockToken = new Deposit("Mock", "MCK", 18, owner, COLLATERAL_LIVENESS, address(forwarder));

        vm.startPrank(owner);
        // Allow the contract and user1 for the mock token
        mockToken.allowUser(address(deposit));
        mockToken.allowUser(user1);
        mockToken.updateCollateral(1000);
        mockToken.mint(address(deposit), 1000);

        // Test withdrawal
        deposit.withdrawToken(address(mockToken), user1, 500);
        vm.stopPrank();

        assertEq(mockToken.balanceOf(user1), 500);
        assertEq(mockToken.balanceOf(address(deposit)), 500);
    }

    function test_WithdrawTokenRevertOnInvalidAddress() public {
        vm.startPrank(owner);
        vm.expectRevert(abi.encodeWithSelector(Deposit.InvalidTokenAddress.selector));
        deposit.withdrawToken(address(0), user1, 100);
        vm.stopPrank();
    }

    function test_WithdrawTokenRevertOnInsufficientBalance() public {
        // Deploy a mock ERC20 token
        Deposit mockToken = new Deposit("Mock", "MCK", 18, owner, COLLATERAL_LIVENESS, address(forwarder));

        vm.startPrank(owner);
        // Allow the contract and user1 for the mock token
        mockToken.allowUser(address(deposit));
        mockToken.allowUser(user1);
        mockToken.updateCollateral(100);
        mockToken.mint(address(deposit), 100);

        vm.expectRevert(abi.encodeWithSelector(Deposit.InsufficientTokenBalance.selector));
        deposit.withdrawToken(address(mockToken), user1, 200);
        vm.stopPrank();
    }

    receive() external payable { }
}

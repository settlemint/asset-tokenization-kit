// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.27;

import { Test } from "forge-std/Test.sol";
import { TokenizedDeposit } from "../contracts/TokenizedDeposit.sol";
import { Forwarder } from "../contracts/Forwarder.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract TokenizedDepositTest is Test {
    TokenizedDeposit public tokenizedDeposit;
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
        tokenizedDeposit =
            new TokenizedDeposit("TokenizedDeposit", "TKD", DECIMALS, owner, COLLATERAL_LIVENESS, address(forwarder));
        vm.stopPrank();
    }

    // Basic ERC20 functionality tests
    function test_InitialState() public view {
        assertEq(tokenizedDeposit.name(), "TokenizedDeposit");
        assertEq(tokenizedDeposit.symbol(), "TKD");
        assertEq(tokenizedDeposit.decimals(), DECIMALS);
        assertEq(tokenizedDeposit.totalSupply(), 0);
        assertTrue(tokenizedDeposit.hasRole(tokenizedDeposit.DEFAULT_ADMIN_ROLE(), owner));
        assertTrue(tokenizedDeposit.hasRole(tokenizedDeposit.SUPPLY_MANAGEMENT_ROLE(), owner));
        assertTrue(tokenizedDeposit.hasRole(tokenizedDeposit.USER_MANAGEMENT_ROLE(), owner));
    }

    function test_DifferentDecimals() public {
        uint8[] memory decimalValues = new uint8[](4);
        decimalValues[0] = 0; // Test zero decimals
        decimalValues[1] = 6;
        decimalValues[2] = 8;
        decimalValues[3] = 18; // Test max decimals

        for (uint256 i = 0; i < decimalValues.length; i++) {
            vm.startPrank(owner);
            TokenizedDeposit newToken = new TokenizedDeposit(
                "TokenizedDeposit", "TKD", decimalValues[i], owner, COLLATERAL_LIVENESS, address(forwarder)
            );
            vm.stopPrank();
            assertEq(newToken.decimals(), decimalValues[i]);
        }
    }

    function test_RevertOnInvalidDecimals() public {
        vm.startPrank(owner);
        vm.expectRevert(abi.encodeWithSelector(TokenizedDeposit.InvalidDecimals.selector, 19));
        new TokenizedDeposit("TokenizedDeposit", "TKD", 19, owner, COLLATERAL_LIVENESS, address(forwarder));
        vm.stopPrank();
    }

    function test_OnlySupplyManagementCanMint() public {
        vm.startPrank(owner);
        // Allow user1 before minting
        tokenizedDeposit.allowUser(user1);
        // Update collateral first
        tokenizedDeposit.updateCollateral(INITIAL_SUPPLY);
        tokenizedDeposit.mint(user1, INITIAL_SUPPLY);
        assertEq(tokenizedDeposit.balanceOf(user1), INITIAL_SUPPLY);
        assertEq(tokenizedDeposit.totalSupply(), INITIAL_SUPPLY);
        vm.stopPrank();

        vm.startPrank(user1);
        vm.expectRevert(
            abi.encodeWithSignature(
                "AccessControlUnauthorizedAccount(address,bytes32)", user1, tokenizedDeposit.SUPPLY_MANAGEMENT_ROLE()
            )
        );
        tokenizedDeposit.mint(user1, INITIAL_SUPPLY);
        vm.stopPrank();
    }

    // ERC20Collateral tests
    function test_OnlyAdminCanUpdateCollateral() public {
        uint256 collateralAmount = 1_000_000;

        bytes32 role = tokenizedDeposit.SUPPLY_MANAGEMENT_ROLE();
        vm.startPrank(user1);
        vm.expectRevert(abi.encodeWithSignature("AccessControlUnauthorizedAccount(address,bytes32)", user1, role));
        tokenizedDeposit.updateCollateral(collateralAmount);
        vm.stopPrank();

        vm.startPrank(owner);
        tokenizedDeposit.updateCollateral(collateralAmount);
        vm.stopPrank();

        (uint256 amount, uint48 timestamp) = tokenizedDeposit.collateral();
        assertEq(amount, collateralAmount);
        assertEq(timestamp, uint48(block.timestamp));
    }

    function test_RoleManagement() public {
        vm.startPrank(owner);
        tokenizedDeposit.grantRole(tokenizedDeposit.SUPPLY_MANAGEMENT_ROLE(), user1);
        assertTrue(tokenizedDeposit.hasRole(tokenizedDeposit.SUPPLY_MANAGEMENT_ROLE(), user1));

        tokenizedDeposit.revokeRole(tokenizedDeposit.SUPPLY_MANAGEMENT_ROLE(), user1);
        assertFalse(tokenizedDeposit.hasRole(tokenizedDeposit.SUPPLY_MANAGEMENT_ROLE(), user1));
        vm.stopPrank();
    }

    // ERC20Burnable tests
    function test_Burn() public {
        vm.startPrank(owner);
        tokenizedDeposit.allowUser(user1);
        tokenizedDeposit.updateCollateral(INITIAL_SUPPLY);
        tokenizedDeposit.mint(user1, INITIAL_SUPPLY);
        vm.stopPrank();

        vm.startPrank(user1);
        tokenizedDeposit.burn(100);
        vm.stopPrank();

        assertEq(tokenizedDeposit.balanceOf(user1), INITIAL_SUPPLY - 100);
    }

    function test_BurnFrom() public {
        vm.startPrank(owner);
        tokenizedDeposit.allowUser(user1);
        tokenizedDeposit.allowUser(spender);
        tokenizedDeposit.updateCollateral(INITIAL_SUPPLY);
        tokenizedDeposit.mint(user1, INITIAL_SUPPLY);
        vm.stopPrank();

        vm.startPrank(user1);
        tokenizedDeposit.approve(spender, 100);
        vm.stopPrank();

        vm.startPrank(spender);
        tokenizedDeposit.burnFrom(user1, 100);
        vm.stopPrank();

        assertEq(tokenizedDeposit.balanceOf(user1), INITIAL_SUPPLY - 100);
    }

    // ERC20Pausable tests
    function test_OnlyAdminCanPause() public {
        vm.startPrank(user1);
        vm.expectRevert(
            abi.encodeWithSignature(
                "AccessControlUnauthorizedAccount(address,bytes32)", user1, tokenizedDeposit.DEFAULT_ADMIN_ROLE()
            )
        );
        tokenizedDeposit.pause();
        vm.stopPrank();

        vm.startPrank(owner);
        tokenizedDeposit.pause();
        vm.stopPrank();

        assertTrue(tokenizedDeposit.paused());
    }

    // ERC20Allowlist tests
    function test_OnlyUserManagementCanAllowAndDisallow() public {
        vm.startPrank(owner);
        tokenizedDeposit.allowUser(user1);
        tokenizedDeposit.allowUser(user2);
        tokenizedDeposit.updateCollateral(INITIAL_SUPPLY);
        tokenizedDeposit.mint(user1, INITIAL_SUPPLY);
        vm.stopPrank();

        vm.startPrank(user2);
        vm.expectRevert(
            abi.encodeWithSignature(
                "AccessControlUnauthorizedAccount(address,bytes32)", user2, tokenizedDeposit.USER_MANAGEMENT_ROLE()
            )
        );
        tokenizedDeposit.disallowUser(user1);
        vm.stopPrank();

        vm.startPrank(owner);
        tokenizedDeposit.disallowUser(user1);
        vm.stopPrank();

        assertFalse(tokenizedDeposit.allowed(user1));

        vm.startPrank(user1);
        vm.expectRevert();
        tokenizedDeposit.transfer(user2, 100);
        vm.stopPrank();

        vm.startPrank(owner);
        tokenizedDeposit.allowUser(user1);
        vm.stopPrank();

        assertTrue(tokenizedDeposit.allowed(user1));

        vm.startPrank(user1);
        tokenizedDeposit.transfer(user2, 100);
        vm.stopPrank();

        assertEq(tokenizedDeposit.balanceOf(user2), 100);
    }

    // ERC20Custodian tests
    function test_OnlyUserManagementCanFreeze() public {
        vm.startPrank(owner);
        tokenizedDeposit.allowUser(user1);
        tokenizedDeposit.allowUser(user2);
        tokenizedDeposit.updateCollateral(INITIAL_SUPPLY);
        tokenizedDeposit.mint(user1, 100);
        vm.stopPrank();

        vm.startPrank(user2);
        vm.expectRevert(abi.encodeWithSignature("ERC20NotCustodian()"));
        tokenizedDeposit.freeze(user1, 100);
        vm.stopPrank();

        vm.startPrank(owner);
        tokenizedDeposit.freeze(user1, 100);
        vm.stopPrank();

        assertEq(tokenizedDeposit.frozen(user1), 100);

        vm.startPrank(user1);
        vm.expectRevert();
        tokenizedDeposit.transfer(user2, 100);
        vm.stopPrank();

        vm.startPrank(owner);
        tokenizedDeposit.freeze(user1, 0);
        vm.stopPrank();

        assertEq(tokenizedDeposit.frozen(user1), 0);
    }

    // ERC20Permit tests
    function test_Permit() public {
        uint256 privateKey = 0xA11CE;
        address signer = vm.addr(privateKey);

        vm.startPrank(owner);
        tokenizedDeposit.allowUser(signer);
        tokenizedDeposit.allowUser(spender);
        tokenizedDeposit.updateCollateral(INITIAL_SUPPLY);
        tokenizedDeposit.mint(signer, INITIAL_SUPPLY);
        vm.stopPrank();

        uint256 deadline = block.timestamp + 1 hours;
        uint256 nonce = tokenizedDeposit.nonces(signer);

        bytes32 DOMAIN_SEPARATOR = tokenizedDeposit.DOMAIN_SEPARATOR();

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

        tokenizedDeposit.permit(signer, spender, 100, deadline, v, r, s);
        assertEq(tokenizedDeposit.allowance(signer, spender), 100);
    }

    // Token withdrawal tests
    function test_WithdrawToken() public {
        // Deploy a mock ERC20 token
        TokenizedDeposit mockToken =
            new TokenizedDeposit("Mock", "MCK", 18, owner, COLLATERAL_LIVENESS, address(forwarder));

        vm.startPrank(owner);
        // Allow the contract and user1 for the mock token
        mockToken.allowUser(address(tokenizedDeposit));
        mockToken.allowUser(user1);
        mockToken.updateCollateral(1000);
        mockToken.mint(address(tokenizedDeposit), 1000);

        // Test withdrawal
        tokenizedDeposit.withdrawToken(address(mockToken), user1, 500);
        vm.stopPrank();

        assertEq(mockToken.balanceOf(user1), 500);
        assertEq(mockToken.balanceOf(address(tokenizedDeposit)), 500);
    }

    function test_WithdrawTokenRevertOnInvalidAddress() public {
        vm.startPrank(owner);
        vm.expectRevert(abi.encodeWithSelector(TokenizedDeposit.InvalidTokenAddress.selector));
        tokenizedDeposit.withdrawToken(address(0), user1, 100);
        vm.stopPrank();
    }

    function test_WithdrawTokenRevertOnInsufficientBalance() public {
        // Deploy a mock ERC20 token
        TokenizedDeposit mockToken =
            new TokenizedDeposit("Mock", "MCK", 18, owner, COLLATERAL_LIVENESS, address(forwarder));

        vm.startPrank(owner);
        // Allow the contract and user1 for the mock token
        mockToken.allowUser(address(tokenizedDeposit));
        mockToken.allowUser(user1);
        mockToken.updateCollateral(100);
        mockToken.mint(address(tokenizedDeposit), 100);

        vm.expectRevert(abi.encodeWithSelector(TokenizedDeposit.InsufficientTokenBalance.selector));
        tokenizedDeposit.withdrawToken(address(mockToken), user1, 200);
        vm.stopPrank();
    }

    receive() external payable { }
}

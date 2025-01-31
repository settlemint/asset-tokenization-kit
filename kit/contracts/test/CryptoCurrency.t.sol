// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.27;

import { Test } from "forge-std/Test.sol";
import { CryptoCurrency } from "../contracts/CryptoCurrency.sol";
import { IERC20Errors } from "@openzeppelin/contracts/interfaces/draft-IERC6093.sol";

contract CryptoCurrencyTest is Test {
    CryptoCurrency public token;
    address public owner;
    address public user;
    uint256 public constant INITIAL_SUPPLY = 1_000_000e18;
    uint8 public constant DECIMALS = 8;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    function setUp() public {
        owner = makeAddr("owner");
        user = makeAddr("user");

        vm.startPrank(owner);
        token = new CryptoCurrency("Test Token", "TEST", DECIMALS, INITIAL_SUPPLY, owner);
        vm.stopPrank();
    }

    function test_InitialState() public view {
        assertEq(token.name(), "Test Token");
        assertEq(token.symbol(), "TEST");
        assertEq(token.decimals(), DECIMALS);
        assertEq(token.totalSupply(), INITIAL_SUPPLY);
        assertEq(token.balanceOf(owner), INITIAL_SUPPLY);
        assertTrue(token.hasRole(token.DEFAULT_ADMIN_ROLE(), owner));
        assertTrue(token.hasRole(token.SUPPLY_MANAGEMENT_ROLE(), owner));
    }

    function test_DifferentDecimals() public {
        uint8[] memory decimalValues = new uint8[](4);
        decimalValues[0] = 0; // Test zero decimals
        decimalValues[1] = 6;
        decimalValues[2] = 8;
        decimalValues[3] = 18; // Test max decimals

        for (uint256 i = 0; i < decimalValues.length; i++) {
            vm.startPrank(owner);
            CryptoCurrency newToken = new CryptoCurrency("Test Token", "TEST", decimalValues[i], INITIAL_SUPPLY, owner);
            vm.stopPrank();
            assertEq(newToken.decimals(), decimalValues[i]);
        }
    }

    function test_RevertOnInvalidDecimals() public {
        vm.startPrank(owner);
        vm.expectRevert(abi.encodeWithSelector(CryptoCurrency.InvalidDecimals.selector, 19));
        new CryptoCurrency("Test Token", "TEST", 19, INITIAL_SUPPLY, owner);
        vm.stopPrank();
    }

    function test_Transfer() public {
        uint256 amount = 1000e18;
        vm.startPrank(owner);

        vm.expectEmit(true, true, false, true);
        emit Transfer(owner, user, amount);

        token.transfer(user, amount);
        vm.stopPrank();

        assertEq(token.balanceOf(owner), INITIAL_SUPPLY - amount);
        assertEq(token.balanceOf(user), amount);
    }

    function test_TransferFrom() public {
        uint256 amount = 1000e18;

        vm.startPrank(owner);
        token.approve(user, amount);
        vm.stopPrank();

        vm.startPrank(user);
        token.transferFrom(owner, user, amount);
        vm.stopPrank();

        assertEq(token.balanceOf(owner), INITIAL_SUPPLY - amount);
        assertEq(token.balanceOf(user), amount);
        assertEq(token.allowance(owner, user), 0);
    }

    function test_Approve() public {
        uint256 amount = 1000e18;

        vm.startPrank(owner);
        vm.expectEmit(true, true, false, true);
        emit Approval(owner, user, amount);

        token.approve(user, amount);
        vm.stopPrank();

        assertEq(token.allowance(owner, user), amount);
    }

    function test_OnlySupplyManagementCanMint() public {
        vm.startPrank(owner);
        token.mint(user, 1000e18);
        assertEq(token.totalSupply(), INITIAL_SUPPLY + 1000e18);
        assertEq(token.balanceOf(user), 1000e18);
        vm.stopPrank();

        vm.startPrank(user);
        vm.expectRevert(
            abi.encodeWithSignature(
                "AccessControlUnauthorizedAccount(address,bytes32)", user, token.SUPPLY_MANAGEMENT_ROLE()
            )
        );
        token.mint(user, 1000e18);
        vm.stopPrank();
    }

    function test_RoleManagement() public {
        vm.startPrank(owner);
        token.grantRole(token.SUPPLY_MANAGEMENT_ROLE(), user);
        assertTrue(token.hasRole(token.SUPPLY_MANAGEMENT_ROLE(), user));

        token.revokeRole(token.SUPPLY_MANAGEMENT_ROLE(), user);
        assertFalse(token.hasRole(token.SUPPLY_MANAGEMENT_ROLE(), user));
        vm.stopPrank();
    }

    function test_Permit() public {
        uint256 privateKey = 0xA11CE;
        address signer = vm.addr(privateKey);

        token = new CryptoCurrency("Test Token", "TEST", DECIMALS, INITIAL_SUPPLY, signer);

        uint256 value = 1000e18;
        uint256 deadline = block.timestamp + 1 hours;
        uint8 v;
        bytes32 r;
        bytes32 s;

        bytes32 digest = token.DOMAIN_SEPARATOR();

        // Generate permit signature
        {
            bytes32 permitTypehash =
                keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)");

            bytes32 structHash =
                keccak256(abi.encode(permitTypehash, signer, user, value, token.nonces(signer), deadline));

            bytes32 hash = keccak256(abi.encodePacked("\x19\x01", digest, structHash));

            (v, r, s) = vm.sign(privateKey, hash);
        }

        token.permit(signer, user, value, deadline, v, r, s);
        assertEq(token.allowance(signer, user), value);
        assertEq(token.nonces(signer), 1);
    }

    function testFuzz_Transfer(uint256 amount) public {
        vm.assume(amount <= INITIAL_SUPPLY);

        vm.startPrank(owner);
        token.transfer(user, amount);
        vm.stopPrank();

        assertEq(token.balanceOf(user), amount);
        assertEq(token.balanceOf(owner), INITIAL_SUPPLY - amount);
    }

    function test_RevertWhen_TransferInsufficientBalance(uint256 amount) public {
        vm.assume(amount > INITIAL_SUPPLY);

        vm.startPrank(owner);
        vm.expectRevert(
            abi.encodeWithSelector(IERC20Errors.ERC20InsufficientBalance.selector, owner, INITIAL_SUPPLY, amount)
        );
        token.transfer(user, amount);
        vm.stopPrank();
    }
}

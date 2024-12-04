// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { Test } from "forge-std/Test.sol";
import { CryptoCurrency } from "../contracts/CryptoCurrency.sol";

contract CryptoCurrencyTest is Test {
    CryptoCurrency public token;
    address public owner;
    address public user;
    uint256 public constant INITIAL_SUPPLY = 1_000_000e18;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    function setUp() public {
        owner = makeAddr("owner");
        user = makeAddr("user");

        vm.prank(owner);
        token = new CryptoCurrency("Test Token", "TEST", INITIAL_SUPPLY, owner);
    }

    function test_InitialState() public view {
        assertEq(token.name(), "Test Token");
        assertEq(token.symbol(), "TEST");
        assertEq(token.decimals(), 18);
        assertEq(token.totalSupply(), INITIAL_SUPPLY);
        assertEq(token.balanceOf(owner), INITIAL_SUPPLY);
        assertEq(token.owner(), owner);
    }

    function test_Transfer() public {
        uint256 amount = 1000e18;
        vm.prank(owner);

        vm.expectEmit(true, true, false, true);
        emit Transfer(owner, user, amount);

        token.transfer(user, amount);

        assertEq(token.balanceOf(owner), INITIAL_SUPPLY - amount);
        assertEq(token.balanceOf(user), amount);
    }

    function test_TransferFrom() public {
        uint256 amount = 1000e18;

        vm.prank(owner);
        token.approve(user, amount);

        vm.prank(user);
        token.transferFrom(owner, user, amount);

        assertEq(token.balanceOf(owner), INITIAL_SUPPLY - amount);
        assertEq(token.balanceOf(user), amount);
        assertEq(token.allowance(owner, user), 0);
    }

    function test_Approve() public {
        uint256 amount = 1000e18;

        vm.prank(owner);
        vm.expectEmit(true, true, false, true);
        emit Approval(owner, user, amount);

        token.approve(user, amount);
        assertEq(token.allowance(owner, user), amount);
    }

    function test_Mint() public {
        uint256 amount = 1000e18;

        vm.prank(owner);
        vm.expectEmit(true, true, false, true);
        emit Transfer(address(0), user, amount);

        token.mint(user, amount);

        assertEq(token.totalSupply(), INITIAL_SUPPLY + amount);
        assertEq(token.balanceOf(user), amount);
    }

    function test_MintOnlyOwner() public {
        vm.prank(user);
        vm.expectRevert(abi.encodeWithSignature("OwnableUnauthorizedAccount(address)", user));
        token.mint(user, 1000e18);
    }

    function test_Permit() public {
        uint256 privateKey = 0xA11CE;
        address signer = vm.addr(privateKey);

        token = new CryptoCurrency("Test Token", "TEST", INITIAL_SUPPLY, signer);

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

        vm.prank(owner);
        token.transfer(user, amount);

        assertEq(token.balanceOf(owner), INITIAL_SUPPLY - amount);
        assertEq(token.balanceOf(user), amount);
    }

    function testFail_TransferInsufficientBalance(uint256 amount) public {
        vm.assume(amount > INITIAL_SUPPLY);

        vm.prank(owner);
        token.transfer(user, amount);
    }
}

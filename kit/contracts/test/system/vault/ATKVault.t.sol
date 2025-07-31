// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

import { Test, console2 } from "forge-std/Test.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { ATKVault } from "../../../contracts/addons/vault/ATKVault.sol";
import { SignatureChecker } from "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";

/// @title Test suite for ATKVault
/// @notice Tests the enhanced multi-signature functionality using OpenZeppelin 5.4.0 features
contract ATKVaultTest is Test {
    ATKVault public vault;

    // Test accounts
    address public owner = makeAddr("owner");
    address public signer1 = makeAddr("signer1");
    address public signer2 = makeAddr("signer2");
    address public signer3 = makeAddr("signer3");
    address public signer4 = makeAddr("signer4");
    address public nonSigner = makeAddr("nonSigner");
    address public recipient = makeAddr("recipient");

    // Private keys for signers - using more realistic values
    uint256 constant SIGNER1_KEY = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;
    uint256 constant SIGNER2_KEY = 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d;
    uint256 constant SIGNER3_KEY = 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a;
    uint256 constant SIGNER4_KEY = 0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6;

    // Test token
    MockERC20 public token;

    // Events to test
    event SubmitTransactionWithSignatures(
        address indexed submitter,
        uint256 indexed txIndex,
        address indexed to,
        uint256 value,
        bytes data,
        string comment,
        uint256 requiredSignatures
    );

    event SignaturesProvided(
        address indexed signer, uint256 indexed txIndex, address[] signerAddresses, uint256 signatureCount
    );

    event ExecuteTransaction(address indexed executor, uint256 indexed txIndex);

    function setUp() public {
        // Deploy signers with known private keys
        signer1 = vm.addr(SIGNER1_KEY);
        signer2 = vm.addr(SIGNER2_KEY);
        signer3 = vm.addr(SIGNER3_KEY);
        signer4 = vm.addr(SIGNER4_KEY);

        // Set up signers and admins
        address[] memory signers = new address[](4);
        signers[0] = signer1;
        signers[1] = signer2;
        signers[2] = signer3;
        signers[3] = signer4;

        address[] memory admins = new address[](1);
        admins[0] = owner;

        // Deploy vault with 2-of-4 multisig
        vault = new ATKVault(
            signers,
            2, // required signatures
            address(0), // no forwarder
            address(0), // no onchain ID initially
            admins
        );

        // Deploy test token
        token = new MockERC20("Test Token", "TEST", 18);

        // Fund vault with ETH
        vm.deal(address(vault), 10 ether);

        // Fund vault with tokens
        token.mint(address(vault), 1000 * 10 ** 18);

        // Grant roles
        vm.startPrank(owner);
        vault.grantRole(vault.EMERGENCY_ROLE(), owner);
        vault.grantRole(vault.GOVERNANCE_ROLE(), owner);
        vm.stopPrank();
    }

    function test_InitialState() public view {
        assertEq(vault.required(), 2);
        assertTrue(vault.hasRole(vault.DEFAULT_ADMIN_ROLE(), owner));
        assertTrue(vault.hasRole(vault.SIGNER_ROLE(), signer1));
        assertTrue(vault.hasRole(vault.SIGNER_ROLE(), signer2));
        assertTrue(vault.hasRole(vault.SIGNER_ROLE(), signer3));
        assertTrue(vault.hasRole(vault.SIGNER_ROLE(), signer4));
    }

    function testSubmitAndExecuteWithSignatures() public {
        // Prepare transaction data
        address to = recipient;
        uint256 value = 1 ether;
        bytes memory data = "";
        string memory comment = "Test ETH transfer";

        // Submit transaction first
        address[] memory emptySigs = new address[](0);
        bytes[] memory emptyData = new bytes[](0);

        vm.prank(signer1);
        uint256 txIndex = vault.submitTransactionWithSignatures(
            to,
            value,
            data,
            comment,
            0, // use default requirement
            emptySigs,
            emptyData
        );

        // Now get the actual hash
        bytes32 txHash = vault.getTransactionHash(txIndex);

        // Sign with signer1 and signer2 (EIP-712 signature)
        (uint8 v1, bytes32 r1, bytes32 s1) = vm.sign(SIGNER1_KEY, txHash);
        (uint8 v2, bytes32 r2, bytes32 s2) = vm.sign(SIGNER2_KEY, txHash);

        bytes memory sig1 = abi.encodePacked(r1, s1, v1);
        bytes memory sig2 = abi.encodePacked(r2, s2, v2);

        address[] memory signerAddresses = new address[](2);
        signerAddresses[0] = signer1;
        signerAddresses[1] = signer2;

        bytes[] memory signatures = new bytes[](2);
        signatures[0] = sig1;
        signatures[1] = sig2;

        // Record recipient balance before
        uint256 balanceBefore = recipient.balance;

        // Add signatures (should auto-execute)
        vm.expectEmit(true, true, false, true);
        emit ExecuteTransaction(signer1, txIndex);

        vm.prank(signer1);
        vault.addSignatures(txIndex, signerAddresses, signatures);

        // Check execution
        (,,, bool executed,,,) = vault.getTransaction(txIndex);
        assertTrue(executed, "Transaction should be executed");

        // Check recipient received funds
        assertEq(recipient.balance, balanceBefore + value, "Recipient should receive ETH");
    }

    function testWeightedSignatures() public {
        // Enable weighted signatures
        vm.startPrank(owner);
        vault.setWeightedSignatures(true);

        // Set weights: signer1=3, signer2=2, signer3=1, signer4=1
        vault.setSignerWeight(signer1, 3);
        vault.setSignerWeight(signer2, 2);
        vault.setSignerWeight(signer3, 1);
        vault.setSignerWeight(signer4, 1);

        // Set total weight requirement to 4 (so signer1 + signer3 = 4)
        vault.setTotalWeightRequired(4);
        vm.stopPrank();

        // Create transaction
        address to = recipient;
        uint256 value = 0.5 ether;
        bytes memory data = "";
        string memory comment = "Weighted signature test";

        address[] memory emptySigs = new address[](0);
        bytes[] memory emptyData = new bytes[](0);

        vm.prank(signer1);
        uint256 txIndex = vault.submitTransactionWithSignatures(to, value, data, comment, 0, emptySigs, emptyData);

        // Get transaction hash
        bytes32 txHash = vault.getTransactionHash(txIndex);

        // Sign with signer1 (weight=3) and signer3 (weight=1) for total weight=4
        (uint8 v1, bytes32 r1, bytes32 s1) = vm.sign(SIGNER1_KEY, txHash);
        (uint8 v3, bytes32 r3, bytes32 s3) = vm.sign(SIGNER3_KEY, txHash);

        address[] memory signerAddresses = new address[](2);
        signerAddresses[0] = signer1;
        signerAddresses[1] = signer3;

        bytes[] memory signatures = new bytes[](2);
        signatures[0] = abi.encodePacked(r1, s1, v1);
        signatures[1] = abi.encodePacked(r3, s3, v3);

        uint256 balanceBefore = recipient.balance;

        // Should execute with weight 3+1=4
        vm.prank(signer1);
        vault.addSignatures(txIndex, signerAddresses, signatures);

        // Check execution
        (,,, bool executed,,,) = vault.getTransaction(txIndex);
        assertTrue(executed, "Transaction should be executed with weighted signatures");
        assertEq(recipient.balance, balanceBefore + value, "Recipient should receive ETH");
    }

    function testERC20TransferWithSignatures() public {
        // Prepare ERC20 transfer
        address to = recipient;
        uint256 amount = 100 * 10 ** 18;
        bytes memory data = abi.encodeWithSelector(IERC20.transfer.selector, to, amount);
        string memory comment = "ERC20 transfer";

        // Submit transaction
        address[] memory emptySigs = new address[](0);
        bytes[] memory emptyData = new bytes[](0);

        vm.prank(signer1);
        uint256 txIndex = vault.submitTransactionWithSignatures(
            address(token),
            0, // no ETH value
            data,
            comment,
            2, // require 2 signatures
            emptySigs,
            emptyData
        );

        // Get hash and sign
        bytes32 txHash = vault.getTransactionHash(txIndex);

        (uint8 v1, bytes32 r1, bytes32 s1) = vm.sign(SIGNER1_KEY, txHash);
        (uint8 v2, bytes32 r2, bytes32 s2) = vm.sign(SIGNER2_KEY, txHash);

        address[] memory signerAddresses = new address[](2);
        signerAddresses[0] = signer1;
        signerAddresses[1] = signer2;

        bytes[] memory signatures = new bytes[](2);
        signatures[0] = abi.encodePacked(r1, s1, v1);
        signatures[1] = abi.encodePacked(r2, s2, v2);

        uint256 balanceBefore = token.balanceOf(recipient);

        // Execute
        vm.prank(signer2);
        vault.addSignatures(txIndex, signerAddresses, signatures);

        // Verify
        assertEq(token.balanceOf(recipient), balanceBefore + amount, "Recipient should receive tokens");
    }

    function testInvalidSignatureReverts() public {
        // Create transaction
        vm.prank(signer1);
        uint256 txIndex =
            vault.submitTransactionWithSignatures(recipient, 1 ether, "", "Test", 2, new address[](0), new bytes[](0));

        // Try to add invalid signature
        bytes32 wrongHash = keccak256("wrong data");

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(SIGNER1_KEY, wrongHash);

        address[] memory signerAddresses = new address[](1);
        signerAddresses[0] = signer1;

        bytes[] memory signatures = new bytes[](1);
        signatures[0] = abi.encodePacked(r, s, v);

        vm.prank(signer1);
        vm.expectRevert(abi.encodeWithSelector(ATKVault.UnauthorizedSigner.selector, signer1));
        vault.addSignatures(txIndex, signerAddresses, signatures);
    }

    function testDuplicateSignatureReverts() public {
        // Create transaction
        vm.prank(signer1);
        uint256 txIndex =
            vault.submitTransactionWithSignatures(recipient, 1 ether, "", "Test", 3, new address[](0), new bytes[](0));

        bytes32 txHash = vault.getTransactionHash(txIndex);
        (uint8 v1, bytes32 r1, bytes32 s1) = vm.sign(SIGNER1_KEY, txHash);

        address[] memory signerAddresses = new address[](1);
        signerAddresses[0] = signer1;

        bytes[] memory signatures = new bytes[](1);
        signatures[0] = abi.encodePacked(r1, s1, v1);

        // Add first signature
        vm.prank(signer1);
        vault.addSignatures(txIndex, signerAddresses, signatures);

        // Try to add same signature again
        vm.prank(signer2);
        vm.expectRevert(abi.encodeWithSelector(ATKVault.DuplicateSignature.selector, signer1));
        vault.addSignatures(txIndex, signerAddresses, signatures);
    }

    function testNonSignerCannotSubmit() public {
        vm.prank(nonSigner);
        vm.expectRevert();
        vault.submitTransactionWithSignatures(recipient, 1 ether, "", "Test", 2, new address[](0), new bytes[](0));
    }

    function test_PauseUnpause() public {
        // Pause
        vm.prank(owner);
        vault.pause();
        assertTrue(vault.paused());

        // Cannot submit when paused
        vm.prank(signer1);
        vm.expectRevert();
        vault.submitTransactionWithSignatures(recipient, 1 ether, "", "Test", 2, new address[](0), new bytes[](0));

        // Unpause
        vm.prank(owner);
        vault.unpause();
        assertFalse(vault.paused());

        // Can submit again
        vm.prank(signer1);
        vault.submitTransactionWithSignatures(recipient, 1 ether, "", "Test", 2, new address[](0), new bytes[](0));
    }

    function test_ReceiveEther() public {
        uint256 amount = 1 ether;
        vm.deal(address(this), amount);

        (bool success,) = address(vault).call{ value: amount }("");
        assertTrue(success);
        assertEq(address(vault).balance, 11 ether); // 10 + 1
    }

    function test_SetOnchainId() public {
        address mockOnchainId = makeAddr("onchainId");

        // Initially no onchainId set
        assertEq(vault.onchainID(), address(0));

        // Set onchain ID
        vm.prank(owner);
        vault.setOnchainId(mockOnchainId);
        assertEq(vault.onchainID(), mockOnchainId);

        // Cannot set again
        vm.prank(owner);
        vm.expectRevert(ATKVault.OnchainIdAlreadySet.selector);
        vault.setOnchainId(makeAddr("anotherOnchainId"));
    }

    function testGetTransactionDetails() public {
        // Create transaction
        address to = recipient;
        uint256 value = 2 ether;
        bytes memory data = "0x1234";
        string memory comment = "Detailed test";

        vm.prank(signer1);
        uint256 txIndex =
            vault.submitTransactionWithSignatures(to, value, data, comment, 3, new address[](0), new bytes[](0));

        // Get details
        (
            address retTo,
            uint256 retValue,
            bytes memory retData,
            bool retExecuted,
            string memory retComment,
            uint256 retRequired,
            address[] memory retSigners
        ) = vault.getTransaction(txIndex);

        assertEq(retTo, to, "To address mismatch");
        assertEq(retValue, value, "Value mismatch");
        assertEq(retData, data, "Data mismatch");
        assertFalse(retExecuted, "Should not be executed");
        assertEq(retComment, comment, "Comment mismatch");
        assertEq(retRequired, 3, "Required signatures mismatch");
        assertEq(retSigners.length, 0, "Should have no signers yet");
    }
}

/// @notice Mock ERC20 token for testing
contract MockERC20 is ERC20 {
    constructor(string memory name, string memory symbol, uint8 decimals) ERC20(name, symbol) { }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

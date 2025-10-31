// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { Test } from "forge-std/Test.sol";
import { ISMART } from "../../contracts/smart/interface/ISMART.sol";
import { SMART } from "../../contracts/smart/extensions/core/SMART.sol";
import { SMARTPausable } from "../../contracts/smart/extensions/pausable/SMARTPausable.sol";
import { SMARTBurnable } from "../../contracts/smart/extensions/burnable/SMARTBurnable.sol";
import { ISMARTRedeemable } from "../../contracts/smart/extensions/redeemable/ISMARTRedeemable.sol";
import { SMARTCustodian } from "../../contracts/smart/extensions/custodian/SMARTCustodian.sol";

import { ISMARTIdentityRegistry } from "../../contracts/smart/interface/ISMARTIdentityRegistry.sol";
import { IATKIdentityFactory } from "../../contracts/system/identity-factory/IATKIdentityFactory.sol";
import { ISMARTCompliance } from "../../contracts/smart/interface/ISMARTCompliance.sol";

contract TokenUtils is Test {
    address internal _platformAdmin;
    IATKIdentityFactory internal _identityFactory;
    ISMARTCompliance internal _compliance; // Reference if needed, though factory uses it
    ISMARTIdentityRegistry internal _identityRegistry;

    constructor(
        address platformAdmin_,
        IATKIdentityFactory identityFactory_,
        ISMARTIdentityRegistry identityRegistry_,
        ISMARTCompliance compliance_ // Pass compliance even if factory uses it, might be needed elsewhere
    ) {
        _platformAdmin = platformAdmin_;
        _identityFactory = identityFactory_;
        _compliance = compliance_;
        _identityRegistry = identityRegistry_;
    }

    /**
     * @notice Mints tokens.
     * @param tokenAddress The address of the token contract.
     * @param tokenIssuer_ The wallet address of the issuer performing the mint.
     * @param to The recipient's wallet address.
     * @param amount The amount to mint.
     */
    function mintToken(address tokenAddress, address tokenIssuer_, address to, uint256 amount) public {
        // Call the executor version, passing the token issuer as the executor
        mintTokenAsExecutor(tokenAddress, tokenIssuer_, to, amount);
    }

    /**
     * @notice Mints tokens (as specified executor).
     * @param tokenAddress The address of the token contract.
     * @param executor The address performing the mint.
     * @param to The recipient's wallet address.
     * @param amount The amount to mint.
     */
    function mintTokenAsExecutor(address tokenAddress, address executor, address to, uint256 amount) public {
        vm.startPrank(executor);
        ISMART(tokenAddress).mint(to, amount);
        vm.stopPrank();
    }

    /**
     * @notice Gets the token balance of a wallet.
     * @param tokenAddress The address of the token contract.
     * @param walletAddress The address of the wallet to check.
     * @return The token balance.
     */
    function getBalance(address tokenAddress, address walletAddress) public view returns (uint256) {
        return ISMART(tokenAddress).balanceOf(walletAddress);
    }

    /**
     * @notice Transfers tokens between wallets.
     * @param tokenAddress The address of the token contract.
     * @param from The sender's wallet address.
     * @param to The recipient's wallet address.
     * @param amount The amount to transfer.
     */
    function transferToken(address tokenAddress, address from, address to, uint256 amount) public {
        vm.startPrank(from);
        bool success = ISMART(tokenAddress).transfer(to, amount);
        assertTrue(success, "Transfer failed");
        vm.stopPrank();
    }

    /**
     * @notice Recovers ERC20 tokens from the token contract.
     * @param tokenAddress The address of the token contract.
     * @param tokenIssuer_ The address of the token issuer initiating the recovery.
     * @param tokenToRecoverAddress The address of the ERC20 token to recover.
     * @param to The address to recover the tokens to.
     * @param amount The amount of tokens to recover.
     */
    function recoverERC20Token(
        address tokenAddress,
        address tokenIssuer_,
        address tokenToRecoverAddress,
        address to,
        uint256 amount
    )
        public
    {
        vm.startPrank(tokenIssuer_);
        SMART(tokenAddress).recoverERC20(tokenToRecoverAddress, to, amount);
        vm.stopPrank();
    }

    /**
     * @notice Burns tokens from a holder's account.
     * @param tokenAddress The address of the token contract.
     * @param tokenIssuer_ The address of the token issuer initiating the burn.
     * @param from The holder's wallet address.
     * @param amount The amount to burn.
     */
    function burnToken(address tokenAddress, address tokenIssuer_, address from, uint256 amount) public {
        // Call the executor version, passing the token issuer as the executor
        burnTokenAsExecutor(tokenAddress, tokenIssuer_, from, amount);
    }

    /**
     * @notice Burns tokens from a holder's account (as specified executor).
     * @param tokenAddress The address of the token contract.
     * @param executor The address performing the burn.
     * @param from The account from which tokens are burned.
     * @param amount The amount to burn.
     */
    function burnTokenAsExecutor(address tokenAddress, address executor, address from, uint256 amount) public {
        vm.startPrank(executor);
        SMARTBurnable(tokenAddress).burn(from, amount);
        vm.stopPrank();
    }

    /**
     * @notice Pauses the token contract.
     * @param tokenAddress The address of the token contract.
     * @param tokenIssuer_ The address of the token issuer performing the action.
     */
    function pauseToken(address tokenAddress, address tokenIssuer_) public {
        // Call the executor version, passing the token issuer as the executor
        pauseTokenAsExecutor(tokenAddress, tokenIssuer_);
    }

    /**
     * @notice Pauses the token contract (as specified executor).
     * @param tokenAddress The address of the token contract.
     * @param executor The address performing the action.
     */
    function pauseTokenAsExecutor(address tokenAddress, address executor) public {
        vm.startPrank(executor);
        SMARTPausable(tokenAddress).pause();
        vm.stopPrank();
    }

    function isPaused(address tokenAddress) public view returns (bool) {
        return SMARTPausable(tokenAddress).paused();
    }

    /**
     * @notice Unpauses the token contract.
     * @param tokenAddress The address of the token contract.
     * @param tokenIssuer_ The address of the token issuer performing the action.
     */
    function unpauseToken(address tokenAddress, address tokenIssuer_) public {
        // Call the executor version, passing the token issuer as the executor
        unpauseTokenAsExecutor(tokenAddress, tokenIssuer_);
    }

    /**
     * @notice Unpauses the token contract (as specified executor).
     * @param tokenAddress The address of the token contract.
     * @param executor The address performing the action.
     */
    function unpauseTokenAsExecutor(address tokenAddress, address executor) public {
        vm.startPrank(executor);
        SMARTPausable(tokenAddress).unpause();
        vm.stopPrank();
    }

    /**
     * @notice Redeems tokens.
     * @param tokenAddress The address of the token contract.
     * @param holder The address of the holder performing the action.
     * @param amount The amount to redeem.
     */
    function redeemToken(address tokenAddress, address holder, uint256 amount) public {
        // Call the executor version, passing the holder as the executor
        redeemTokenAsExecutor(tokenAddress, holder, amount);
    }

    /**
     * @notice Redeems tokens (as specified executor).
     * @param tokenAddress The address of the token contract.
     * @param executor The address performing the action.
     * @param amount The amount to redeem.
     */
    function redeemTokenAsExecutor(address tokenAddress, address executor, uint256 amount) public {
        vm.startPrank(executor);
        ISMARTRedeemable(tokenAddress).redeemFor(executor, amount);
        vm.stopPrank();
    }

    // --- Custodian Functions ---

    /**
     * @notice Checks if a user address is frozen.
     * @param tokenAddress The address of the token contract.
     * @param userAddress The address to check.
     * @return True if frozen, false otherwise.
     */
    function isFrozen(address tokenAddress, address userAddress) public view returns (bool) {
        // No prank needed for view function
        return SMARTCustodian(payable(tokenAddress)).isFrozen(userAddress);
    }

    /**
     * @notice Gets the amount of frozen tokens for a user.
     * @param tokenAddress The address of the token contract.
     * @param userAddress The address to check.
     * @return The amount of frozen tokens.
     */
    function getFrozenTokens(address tokenAddress, address userAddress) public view returns (uint256) {
        // No prank needed for view function
        return SMARTCustodian(payable(tokenAddress)).getFrozenTokens(userAddress);
    }

    /**
     * @notice Freezes or unfreezes a user address.
     * @param tokenAddress The address of the token contract.
     * @param owner The address performing the action (token owner).
     * @param userAddress The target user address.
     * @param freeze True to freeze, false to unfreeze.
     */
    function setAddressFrozen(address tokenAddress, address owner, address userAddress, bool freeze) public {
        // Call the executor version, passing the owner as the executor
        setAddressFrozenAsExecutor(tokenAddress, owner, userAddress, freeze);
    }

    /**
     * @notice Freezes or unfreezes a user address (as specified executor).
     * @param tokenAddress The address of the token contract.
     * @param executor The address performing the action.
     * @param userAddress The target user address.
     * @param freeze True to freeze, false to unfreeze.
     */
    function setAddressFrozenAsExecutor(
        address tokenAddress,
        address executor,
        address userAddress,
        bool freeze
    )
        public
    {
        vm.startPrank(executor);
        SMARTCustodian(payable(tokenAddress)).setAddressFrozen(userAddress, freeze);
        vm.stopPrank();
    }

    /**
     * @notice Freezes a specific amount of tokens for a user.
     * @param tokenAddress The address of the token contract.
     * @param owner The address performing the action (token owner).
     * @param userAddress The target user address.
     * @param amount The amount to freeze.
     */
    function freezePartialTokens(address tokenAddress, address owner, address userAddress, uint256 amount) public {
        // Call the executor version, passing the owner as the executor
        freezePartialTokensAsExecutor(tokenAddress, owner, userAddress, amount);
    }

    /**
     * @notice Freezes a specific amount of tokens for a user (as specified executor).
     * @param tokenAddress The address of the token contract.
     * @param executor The address performing the action.
     * @param userAddress The target user address.
     * @param amount The amount to freeze.
     */
    function freezePartialTokensAsExecutor(
        address tokenAddress,
        address executor,
        address userAddress,
        uint256 amount
    )
        public
    {
        vm.startPrank(executor);
        SMARTCustodian(payable(tokenAddress)).freezePartialTokens(userAddress, amount);
        vm.stopPrank();
    }

    /**
     * @notice Unfreezes a specific amount of tokens for a user.
     * @param tokenAddress The address of the token contract.
     * @param owner The address performing the action (token owner).
     * @param userAddress The target user address.
     * @param amount The amount to unfreeze.
     */
    function unfreezePartialTokens(address tokenAddress, address owner, address userAddress, uint256 amount) public {
        // Call the executor version, passing the owner as the executor
        unfreezePartialTokensAsExecutor(tokenAddress, owner, userAddress, amount);
    }

    /**
     * @notice Unfreezes a specific amount of tokens for a user (as specified executor).
     * @param tokenAddress The address of the token contract.
     * @param executor The address performing the action.
     * @param userAddress The target user address.
     * @param amount The amount to unfreeze.
     */
    function unfreezePartialTokensAsExecutor(
        address tokenAddress,
        address executor,
        address userAddress,
        uint256 amount
    )
        public
    {
        vm.startPrank(executor);
        SMARTCustodian(payable(tokenAddress)).unfreezePartialTokens(userAddress, amount);
        vm.stopPrank();
    }

    /**
     * @notice Performs a forced transfer between two addresses.
     * @param tokenAddress The address of the token contract.
     * @param owner The address performing the action (token owner).
     * @param from The sender address.
     * @param to The recipient address.
     * @param amount The amount to transfer.
     */
    function forcedTransfer(address tokenAddress, address owner, address from, address to, uint256 amount) public {
        // Call the executor version, passing the owner as the executor
        forcedTransferAsExecutor(tokenAddress, owner, from, to, amount);
    }

    /**
     * @notice Performs a forced transfer between two addresses (as specified executor).
     * @param tokenAddress The address of the token contract.
     * @param executor The address performing the action.
     * @param from The sender address.
     * @param to The recipient address.
     * @param amount The amount to transfer.
     */
    function forcedTransferAsExecutor(
        address tokenAddress,
        address executor,
        address from,
        address to,
        uint256 amount
    )
        public
    {
        vm.startPrank(executor);
        SMARTCustodian(payable(tokenAddress)).forcedTransfer(from, to, amount);
        vm.stopPrank();
    }

    /**
     * @notice Recovers assets from a lost wallet to a new wallet.
     * @param tokenAddress The address of the token contract.
     * @param owner The address performing the action (token owner).
     * @param lostWallet The address of the lost wallet.
     * @param newWallet The address of the new wallet.
     * @param investorOnchainID The onchain ID contract address of the investor.
     */
    function recoveryAddress(
        address tokenAddress,
        address owner,
        address lostWallet,
        address newWallet,
        address investorOnchainID
    )
        public
    {
        // Call the executor version, passing the owner as the executor
        recoveryAddressAsExecutor(tokenAddress, owner, lostWallet, newWallet, investorOnchainID);
    }

    /**
     * @notice Recovers assets from a lost wallet to a new wallet (as specified executor).
     * @param tokenAddress The address of the token contract.
     * @param executor The address performing the action.
     * @param lostWallet The address of the lost wallet.
     * @param newWallet The address of the new wallet.
     * @param investorOnchainID The onchain ID contract address of the investor.
     */
    function recoveryAddressAsExecutor(
        address tokenAddress,
        address executor,
        address lostWallet,
        address newWallet,
        address investorOnchainID
    )
        public
    {
        vm.startPrank(_platformAdmin);
        _identityRegistry.recoverIdentity(lostWallet, newWallet, investorOnchainID);
        vm.stopPrank();

        vm.startPrank(executor);
        SMARTCustodian(payable(tokenAddress)).forcedRecoverTokens(newWallet, lostWallet);
        vm.stopPrank();
    }

    /**
     * @notice Creates and sets the on-chain ID for a token.
     * @param tokenAddress The address of the token contract.
     * @param tokenIssuer_ The address of the token issuer.
     * @return The address of the token identity.
     */
    function createAndSetTokenOnchainID(address tokenAddress, address tokenIssuer_) public returns (address) {
        // Ensure tokenAddress is the proxy address when dealing with upgradeable tokens
        vm.startPrank(_platformAdmin); // Platform admin creates the token identity
            // Use the specific token issuer's wallet address for identity creation
        address tokenIdentityAddress = _identityFactory.createContractIdentity(tokenAddress);
        vm.stopPrank();

        // 3. Set the on-chain ID on the token contract (via the proxy)
        vm.startPrank(tokenIssuer_); // Specific token issuer sets the on-chain ID

        ISMART(tokenAddress).setOnchainID(tokenIdentityAddress); // Calling through the proxy
        vm.stopPrank();

        return tokenIdentityAddress;
    }
}

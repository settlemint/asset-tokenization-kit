// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import { Test } from "forge-std/Test.sol";
import { IIdentity } from "@onchainid/contracts/interface/IIdentity.sol";
import { IClaimIssuer } from "@onchainid/contracts/interface/IClaimIssuer.sol";
import { ISMARTIdentityRegistry } from "../../contracts/smart/interface/ISMARTIdentityRegistry.sol";
import { IATKIdentityFactory } from "../../contracts/system/identity-factory/IATKIdentityFactory.sol";
import { ISMARTTopicSchemeRegistry } from "../../contracts/smart/interface/ISMARTTopicSchemeRegistry.sol";
import { ATKTopics } from "../../contracts/system/ATKTopics.sol";
import { ERC735ClaimSchemes } from "../../contracts/onchainid/ERC735ClaimSchemes.sol";

contract ClaimUtils is Test {
    address internal _platformAdmin;
    address internal _claimIssuer;
    uint256 internal _claimIssuerPrivateKey;
    ISMARTIdentityRegistry internal _identityRegistry;
    IATKIdentityFactory internal _identityFactory;
    ISMARTTopicSchemeRegistry internal _topicSchemeRegistry;

    constructor(
        address platformAdmin_,
        address claimIssuer_,
        uint256 claimIssuerPrivateKey_,
        ISMARTIdentityRegistry identityRegistry_,
        IATKIdentityFactory identityFactory_,
        ISMARTTopicSchemeRegistry topicSchemeRegistry_
    ) {
        _platformAdmin = platformAdmin_;
        _claimIssuer = claimIssuer_;
        _claimIssuerPrivateKey = claimIssuerPrivateKey_;
        _identityRegistry = identityRegistry_;
        _identityFactory = identityFactory_;
        _topicSchemeRegistry = topicSchemeRegistry_;
    }

    function getTopicId(string memory topicName) public view returns (uint256) {
        return _topicSchemeRegistry.getTopicId(topicName);
    }

    /**
     * @notice Creates the claim data, hash, and signature for an ERC735 claim.
     * @dev Uses the private key stored in this utility contract.
     * @param clientIdentityAddr The address of the client's identity contract.
     * @param claimTopic The topic of the claim.
     * @param claimData The ABI encoded data of the claim.
     * @return data The ABI encoded claim data (passed through).
     * @return signature The packed ECDSA signature (r, s, v).
     */
    function _createClaimSignatureInternal(
        address clientIdentityAddr,
        uint256 claimTopic,
        bytes memory claimData // Changed parameter name for clarity
    )
        internal // Changed visibility to internal as it's a helper
        view
        returns (bytes memory data, bytes memory signature)
    {
        data = claimData; // Use the provided encoded data
        bytes32 dataHash = keccak256(abi.encode(clientIdentityAddr, claimTopic, data));
        bytes32 prefixedHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", dataHash));

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(_claimIssuerPrivateKey, prefixedHash);
        signature = abi.encodePacked(r, s, v);

        return (data, signature);
    }

    /**
     * @notice Creates the claim data, hash, and signature for a standard string-based ERC735 claim.
     * @param clientIdentityAddr The address of the client's identity contract.
     * @param claimTopic The topic of the claim.
     * @param claimDataString The string data of the claim.
     * @return data The ABI encoded claim data.
     * @return signature The packed ECDSA signature (r, s, v).
     */
    function createClaimSignature(
        address clientIdentityAddr,
        uint256 claimTopic,
        string memory claimDataString
    )
        public
        view
        returns (bytes memory data, bytes memory signature)
    {
        bytes memory encodedData = abi.encode(claimDataString);
        // Call the internal helper
        return _createClaimSignatureInternal(clientIdentityAddr, claimTopic, encodedData);
    }

    /**
     * @notice Verifies a claim signature against a specific issuer identity.
     * @param issuerIdentityAddr_ The identity contract address of the claim issuer.
     * @param clientIdentity The client's identity contract instance.
     * @param claimTopic The topic of the claim.
     * @param signature The signature to verify.
     * @param data The claim data.
     * @return True if the claim is valid according to the issuer, false otherwise.
     */
    function verifyClaim(
        address issuerIdentityAddr_, // Pass the *identity* address of the issuer
        IIdentity clientIdentity,
        uint256 claimTopic,
        bytes memory signature,
        bytes memory data
    )
        public
        view
        returns (bool)
    {
        // Cast the issuer's identity address to IClaimIssuer to call isClaimValid
        return IClaimIssuer(issuerIdentityAddr_).isClaimValid(clientIdentity, claimTopic, signature, data);
    }

    /**
     * @notice Issues a claim from the configured issuer to a client using pre-encoded data.
     * @param clientWalletAddress_ The wallet address of the client receiving the claim.
     * @param claimTopic The topic of the claim.
     * @param claimData The ABI encoded data for the claim.
     */
    function _issueClaimInternal(
        address clientIdentityAddress,
        address clientWalletAddress_,
        uint256 claimTopic,
        bytes memory claimData // Takes encoded data directly
    )
        internal // Changed visibility
    {
        address issuerIdentityAddr_ = _claimIssuerIdentity();

        IIdentity clientIdentity = IIdentity(clientIdentityAddress);

        // 2. Create signature using the stored private key and the provided data/topic
        (bytes memory data, bytes memory signature) =
            _createClaimSignatureInternal(clientIdentityAddress, claimTopic, claimData); // Use internal creator

        // 3. Verify the claim is valid with the issuer's identity before adding
        bool isValid = verifyClaim(issuerIdentityAddr_, clientIdentity, claimTopic, signature, data);
        require(isValid, "ClaimUtils: Claim not valid with issuer");

        // 4. Client adds the claim to their identity (needs prank)
        vm.startPrank(clientWalletAddress_);
        clientIdentity.addClaim(claimTopic, ERC735ClaimSchemes.SCHEME_ECDSA, issuerIdentityAddr_, signature, data, "");
        vm.stopPrank();
    }

    function _issueInvestorIdentityClaimInternal(
        address clientWalletAddress_,
        uint256 claimTopic,
        bytes memory claimData
    )
        internal
    {
        // 1. Get client's identity contract
        IIdentity clientIdentity = IIdentity(_identityFactory.getIdentity(clientWalletAddress_));
        address clientIdentityAddr = address(clientIdentity);
        require(clientIdentityAddr != address(0), "ClaimUtils: Client identity not found");

        _issueClaimInternal(clientIdentityAddr, clientWalletAddress_, claimTopic, claimData);
    }

    function _issueTokenIdentityClaimInternal(
        address tokenAddr_,
        address tokenOwner_,
        uint256 claimTopic,
        bytes memory claimData
    )
        internal
    {
        // 1. Get token's identity contract
        address tokenIdentityAddr = _identityFactory.getContractIdentity(tokenAddr_);
        require(tokenIdentityAddr != address(0), "ClaimUtils: Token identity not found");

        // Add claim needs to be done by the token owner.
        // When changing owner we also need to update the token identity keys.
        _issueClaimInternal(tokenIdentityAddr, tokenOwner_, claimTopic, claimData);
    }

    /**
     * @notice Issues a standard string-based claim from the configured issuer to a client.
     * @param clientWalletAddress_ The wallet address of the client receiving the claim.
     * @param claimTopicName The name of the claim topic.
     * @param claimDataString The string data for the claim.
     */
    function issueInvestorClaim(
        address clientWalletAddress_,
        string memory claimTopicName,
        string memory claimDataString
    )
        public
    {
        bytes memory encodedData = abi.encode(claimDataString);
        _issueInvestorIdentityClaimInternal(clientWalletAddress_, getTopicId(claimTopicName), encodedData);
    }

    /**
     * @notice Issues a collateral claim from the configured issuer to the token's identity.
     * @dev The collateral claim is typically added to the *token's* identity, not a client's.
     * @param tokenAddress_ The identity contract address associated with the SMART token.
     * @param amount The collateral amount.
     * @param expiryTimestamp The expiry timestamp (e.g., block.timestamp + 1 days).
     */
    function issueCollateralClaim(
        address tokenAddress_, // Target is the token's identity
        address tokenOwner_,
        uint256 amount,
        uint256 expiryTimestamp
    )
        public
    {
        // Standard ABI encoding for collateral data
        bytes memory encodedData = abi.encode(amount, expiryTimestamp);
        _issueTokenIdentityClaimInternal(
            tokenAddress_, tokenOwner_, getTopicId(ATKTopics.TOPIC_ASSET_COLLATERAL), encodedData
        );
    }

    /**
     * @notice Issues a base price claim from the configured issuer to the token's identity.
     * @dev The base price claim is typically added to the *token's* identity, not a client's.
     * @param tokenAddress_ The identity contract address associated with the SMART token.
     * @param tokenOwner_ The wallet address of the token owner.
     * @param price The base price.
     * @param currency The currency of the base price.
     * @param decimals The number of decimals of the base price.
     */
    function issueBasePriceClaim(
        address tokenAddress_,
        address tokenOwner_,
        uint256 price,
        string memory currency,
        uint8 decimals
    )
        public
    {
        // Standard ABI encoding for base price data
        bytes memory encodedData = abi.encode(price, currency, decimals);
        _issueTokenIdentityClaimInternal(
            tokenAddress_, tokenOwner_, getTopicId(ATKTopics.TOPIC_ASSET_BASE_PRICE), encodedData
        );
    }

    /**
     * @notice Issues a standard KYC claim.
     * @param clientWalletAddress_ The wallet address of the client receiving the claim.
     */
    function issueKYCClaim(address clientWalletAddress_) public {
        // Use CLAIM_TOPIC_INVESTOR_KYC from the constants library
        issueInvestorClaim(clientWalletAddress_, ATKTopics.TOPIC_INVESTOR_KYC, "Verified KYC by Issuer");
    }

    /**
     * @notice Issues a standard AML claim.
     * @param clientWalletAddress_ The wallet address of the client receiving the claim.
     */
    function issueAMLClaim(address clientWalletAddress_) public {
        // Use CLAIM_TOPIC_INVESTOR_AML from the constants library
        issueInvestorClaim(clientWalletAddress_, ATKTopics.TOPIC_INVESTOR_AML, "Verified AML by Issuer");
    }

    /**
     * @notice Issues both standard KYC and AML claims.
     * @param clientWalletAddress_ The wallet address of the client receiving the claim.
     */
    function issueAllClaims(address clientWalletAddress_) public {
        issueKYCClaim(clientWalletAddress_);
        issueAMLClaim(clientWalletAddress_);
    }

    /**
     * @notice Issues a custom claim with a numeric topic ID and string data.
     * @param clientWalletAddress_ The wallet address of the client receiving the claim.
     * @param topicId The numeric topic ID for the claim.
     * @param claimDataString The string data for the claim.
     */
    function issueCustomClaim(address clientWalletAddress_, uint256 topicId, string memory claimDataString) public {
        bytes memory encodedData = abi.encode(claimDataString);
        _issueInvestorIdentityClaimInternal(clientWalletAddress_, topicId, encodedData);
    }

    /**
     * @notice Public wrapper for issuing investor identity claims with custom topic IDs.
     * @param clientWalletAddress_ The wallet address of the client receiving the claim.
     * @param claimTopic The numeric topic ID of the claim.
     * @param claimData The ABI encoded data for the claim.
     */
    function issueInvestorIdentityClaim(
        address clientWalletAddress_,
        uint256 claimTopic,
        bytes memory claimData
    )
        public
    {
        _issueInvestorIdentityClaimInternal(clientWalletAddress_, claimTopic, claimData);
    }

    /**
     * @notice Returns the identity contract address of the claim issuer.
     * @return The address of the claim issuer's identity contract.
     */
    function _claimIssuerIdentity() internal view returns (address) {
        return _identityFactory.getIdentity(_claimIssuer);
    }
}

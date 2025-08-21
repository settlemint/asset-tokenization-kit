// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

/// @title ATK  Topic Management
/// @author SettleMint
/// @notice Central registry for all claim topics and their schemes used in the ATK protocol
library ATKTopics {
    /// @notice Topic identifier for Know Your Customer (KYC) verification claims
    string public constant TOPIC_KYC = "kyc";

    /// @notice Topic identifier for Anti-Money Laundering (AML) compliance claims
    string public constant TOPIC_AML = "aml";

    /// @notice Topic identifier for collateral-related claims
    string public constant TOPIC_COLLATERAL = "collateral";

    /// @notice Topic identifier for International Securities Identification Number (ISIN) claims
    string public constant TOPIC_ISIN = "isin";

    /// @notice Topic identifier for asset classification claims
    string public constant TOPIC_ASSET_CLASSIFICATION = "assetClassification";

    /// @notice Topic identifier for base price claims
    string public constant TOPIC_BASE_PRICE = "basePrice";

    /// @notice Topic identifier for contract identity claims
    string public constant TOPIC_CONTRACT_IDENTITY = "contractIdentity";

    /// @notice Claim topic representing the legal issuer of the asset.
    /// @dev We use the term `ASSET_ISSUER` here instead of `TOKEN_ISSUER` because
    ///      in regulatory and legal contexts (bonds, funds, equities, etc.) the issuer
    ///      is always defined at the *asset* level.
    ///      In the system contracts we refer to the `TokenIssuer` identity contract,
    ///      which is the technical on-chain entity authorized to issue this claim.
    ///      This separation avoids confusion:
    ///        - `TokenIssuer` = developer/system term for the identity contract.
    ///        - `ASSET_ISSUER` = legal/compliance term recorded as a claim on the asset.
    string public constant TOPIC_ASSET_ISSUER = "assetIssuer";

    /// @notice Get all topic names for registry registration
    /// @return _names Array of topic names for batchRegisterTopicSchemes
    function names() internal pure returns (string[] memory _names) {
        _names = new string[](8);
        _names[0] = TOPIC_KYC;
        _names[1] = TOPIC_AML;
        _names[2] = TOPIC_COLLATERAL;
        _names[3] = TOPIC_ISIN;
        _names[4] = TOPIC_ASSET_CLASSIFICATION;
        _names[5] = TOPIC_BASE_PRICE;
        _names[6] = TOPIC_CONTRACT_IDENTITY;
        _names[7] = TOPIC_ASSET_ISSUER;
    }

    /// @notice Get all topic signatures for registry registration
    /// @return _signatures Array of topic signatures for batchRegisterTopicSchemes
    /// @dev ALL signatures use tuple format for The Graph compatibility
    // WHY: The Graph's ethereum.decode() function has limitations when handling ABI-encoded data.
    // This means even single parameters like "string claim" become "((string))" when encoded.
    // To maintain consistency between encoding and decoding, all signatures must define the tuple format.
    function signatures() internal pure returns (string[] memory _signatures) {
        _signatures = new string[](8);
        _signatures[0] = "(string claim)"; // kyc
        _signatures[1] = "(string claim)"; // aml
        _signatures[2] = "(uint256 amount, uint256 expiryTimestamp)"; // collateral
        _signatures[3] = "(string isin)"; // isin
        _signatures[4] = "(string class, string category)"; // assetClassification
        _signatures[5] = "(uint256 amount, string currencyCode, uint8 decimals)"; // basePrice
        _signatures[6] = "(address contractAddress)"; // contractIdentity
        _signatures[7] = "(address issuerAddress)"; // issuer
    }
}

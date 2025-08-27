// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

/// @title ATK  Topic Management
/// @author SettleMint
/// @notice Central registry for all claim topics and their schemes used in the ATK protocol
library ATKTopics {
    // ---------------------------------------------------------------------
    // Investor-level topics
    // ---------------------------------------------------------------------

    /// @notice Topic identifier for Know Your Customer (KYC) verification claims
    string public constant TOPIC_INVESTOR_KYC = "kyc";

    /// @notice Topic identifier for Anti-Money Laundering (AML) compliance claims
    string public constant TOPIC_INVESTOR_AML = "aml";

    // ---------------------------------------------------------------------
    // Asset-level topics
    // ---------------------------------------------------------------------

    /// @notice Topic identifier for collateral-related claims
    string public constant TOPIC_ASSET_COLLATERAL = "collateral";

    /// @notice Topic identifier for International Securities Identification Number (ISIN) claims
    string public constant TOPIC_ASSET_ISIN = "isin";

    /// @notice Topic identifier for asset classification claims
    string public constant TOPIC_ASSET_CLASSIFICATION = "assetClassification";

    /// @notice Topic identifier for base price claims
    string public constant TOPIC_ASSET_BASE_PRICE = "basePrice";

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

    // ---------------------------------------------------------------------
    // General topics
    // ---------------------------------------------------------------------

    /// @notice Topic identifier for contract identity claims
    string public constant TOPIC_CONTRACT_IDENTITY = "contractIdentity";

    // ---------------------------------------------------------------------
    // Aggregated arrays (kept in stable order)
    // ---------------------------------------------------------------------

    /// @notice Get all topic names for registry registration
    /// @return _names Array of topic names for batchRegisterTopicSchemes
    /// @dev The order here is kept stable for backward compatibility with existing
    ///      deployments and any enumeration that depends on registration order.
    ///      Do not change the literal topic strings, as topic IDs derive from their values.
    function names() internal pure returns (string[] memory _names) {
        _names = new string[](8);
        // Investor-level
        _names[0] = TOPIC_INVESTOR_KYC;
        _names[1] = TOPIC_INVESTOR_AML;
        // Asset-level
        _names[2] = TOPIC_ASSET_COLLATERAL;
        _names[3] = TOPIC_ASSET_ISIN;
        _names[4] = TOPIC_ASSET_CLASSIFICATION;
        _names[5] = TOPIC_ASSET_BASE_PRICE;
        _names[6] = TOPIC_ASSET_ISSUER;
        // General
        _names[7] = TOPIC_CONTRACT_IDENTITY;
    }

    /// @notice Get all topic signatures for registry registration
    /// @return _signatures Array of topic signatures for batchRegisterTopicSchemes
    /// @dev Standard ABI signatures - The Graph handles tuple wrapping on its side for decoding
    ///      The order here mirrors names() and is kept stable for backward compatibility.
    function signatures() internal pure returns (string[] memory _signatures) {
        _signatures = new string[](8);
        // Investor-level
        _signatures[0] = "string claim"; // kyc
        _signatures[1] = "string claim"; // aml
        // Asset-level
        _signatures[2] = "uint256 amount, uint256 expiryTimestamp"; // collateral
        _signatures[3] = "string isin"; // isin
        _signatures[4] = "string class, string category"; // assetClassification
        _signatures[5] = "uint256 amount, string currencyCode, uint8 decimals"; // basePrice
        _signatures[6] = "address issuerAddress"; // issuer
        // General
        _signatures[7] = "address contractAddress"; // contractIdentity
    }
}

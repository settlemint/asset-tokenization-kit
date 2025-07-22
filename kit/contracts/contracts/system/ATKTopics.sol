// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

/// @title ATK  Topic Management
/// @author SettleMint Tokenization Services
/// @notice Central registry for all claim topics and their schemes used in the ATK protocol
library ATKTopics {
    string public constant TOPIC_KYC = "kyc";
    string public constant TOPIC_AML = "aml";
    string public constant TOPIC_COLLATERAL = "collateral";
    string public constant TOPIC_ISIN = "isin";
    string public constant TOPIC_ASSET_CLASSIFICATION = "assetClassification";
    string public constant TOPIC_BASE_PRICE = "basePrice";

    /// @notice Get all topic names for registry registration
    /// @return _names Array of topic names for batchRegisterTopicSchemes
    function names() internal pure returns (string[] memory _names) {
        _names = new string[](6);
        _names[0] = TOPIC_KYC;
        _names[1] = TOPIC_AML;
        _names[2] = TOPIC_COLLATERAL;
        _names[3] = TOPIC_ISIN;
        _names[4] = TOPIC_ASSET_CLASSIFICATION;
        _names[5] = TOPIC_BASE_PRICE;
    }

    /// @notice Get all topic signatures for registry registration
    /// @return _signatures Array of topic signatures for batchRegisterTopicSchemes
    function signatures() internal pure returns (string[] memory _signatures) {
        _signatures = new string[](6);
        _signatures[0] = "string claim"; // kyc
        _signatures[1] = "string claim"; // aml
        _signatures[2] = "uint256 amount, uint256 expiryTimestamp"; // collateral
        _signatures[3] = "string isin"; // isin
        _signatures[4] = "string class, string category"; // assetClassification
        _signatures[5] = "uint256 amount, string currencyCode, uint8 decimals"; // basePrice
    }
}

// SPDX-License-Identifier: FSL-1.1-MIT
pragma solidity ^0.8.28;

/// @title ATK Topic Management
/// @author SettleMint
/// @notice Central registry for all claim topics and their schemes used in the ATK protocol
library ATKTopics {
    // ---------------------------------------------------------------------
    // Investor-level topics
    // ---------------------------------------------------------------------

    /// @notice Topic identifier for Know Your Customer (KYC) verification claims
    /// @dev Confirms the identity of the investor has been verified by a trusted issuer
    ///      (e.g., passport, government ID, residency check).
    ///      Required for AML/CTF compliance and basic onboarding.
    string public constant TOPIC_INVESTOR_KYC = "knowYourCustomer";

    /// @notice Topic identifier for Anti-Money Laundering (AML) compliance claims
    /// @dev Confirms the investor has passed AML/CTF screening
    ///      (e.g., sanctions lists, PEP screening, adverse media checks).
    ///      Usually paired with `kyc`.
    string public constant TOPIC_INVESTOR_AML = "antiMoneyLaundering";

    /// @notice Topic identifier for Qualified Institutional Investor (QII) claims
    /// @dev Confirms the investor qualifies as a QII under relevant securities regulations
    ///      (e.g., US Investment Company Act, Japanese FIEA, etc.).
    ///      Typically applies to regulated entities like banks, insurers, or pension funds.
    string public constant TOPIC_INVESTOR_QII = "qualifiedInstitutionalInvestor";

    /// @notice Topic identifier for Professional Investor claims
    /// @dev Confirms the investor meets the criteria of a "professional" or "qualified"
    ///      investor under regional regulations (e.g., EU MiFID II, Hong Kong SFO, Singapore SFA).
    ///      Thresholds are usually based on assets under management, portfolio size, or experience.
    string public constant TOPIC_INVESTOR_PROFESSIONAL_INVESTOR = "professionalInvestor";

    /// @notice Topic identifier for Accredited Investor claims
    /// @dev Confirms the investor qualifies as an accredited investor under securities law
    ///      (e.g., US SEC Regulation D, Rule 501; other jurisdictions with similar concepts).
    ///      A trusted issuer is responsible for determining eligibility (e.g., income, net worth,
    ///      or institutional status). Depending on the offering exemption, this may involve
    ///      self-certification (e.g., Reg D 506(b)) or documentation-based verification (e.g., Reg D 506(c)).
    string public constant TOPIC_INVESTOR_ACCREDITED_INVESTOR = "accreditedInvestor";

    /// @notice Topic identifier for Accredited Investor (document-verified) claims
    /// @dev Optional: distinguishes investors whose accredited status has been verified
    ///      through supporting documentation (e.g., tax returns, bank statements, or letters
    ///      from licensed professionals). Primarily used in the US for Regulation D 506(c) offerings.
    string public constant TOPIC_INVESTOR_ACCREDITED_INVESTOR_VERIFIED = "accreditedInvestorVerified";

    /// @notice Topic identifier for Regulation S (non-US person) claims
    /// @dev Confirms the investor is not a "US person" as defined in Regulation S of the
    ///      US Securities Act. Required for offerings made under Reg S exemptions.
    ///      Typically based on residency and citizenship checks.
    string public constant TOPIC_INVESTOR_REG_S = "regulationS";

    // ---------------------------------------------------------------------
    // Issuer-level topics
    // ---------------------------------------------------------------------

    /// @notice Confirms the issuer has filed or published a valid prospectus
    /// @dev Required under securities/markets law unless an exemption applies
    string public constant TOPIC_ISSUER_PROSPECTUS_FILED = "issuerProspectusFiled";

    /// @notice Confirms the issuer is exempt from prospectus requirements
    /// @dev Examples: small offers, private placements, MiCA de-minimis exemption
    string public constant TOPIC_ISSUER_PROSPECTUS_EXEMPT = "issuerProspectusExempt";

    /// @notice Confirms the issuer holds a relevant regulatory license/authorization
    /// @dev Examples: MiCA CASP license, SEC registration, EU AIFM authorization
    string public constant TOPIC_ISSUER_LICENSED = "issuerLicensed";

    /// @notice Confirms the issuer is compliant with ongoing disclosure/reporting
    /// @dev Examples: periodic financial reports, annual filings
    string public constant TOPIC_ISSUER_REPORTING_COMPLIANT = "issuerReportingCompliant";

    /// @notice Confirms the issuer’s legal jurisdiction
    string public constant TOPIC_ISSUER_JURISDICTION = "issuerJurisdiction";

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

    /// @notice Claim topic representing the legal issuer of the asset
    /// @dev Legal/compliance term recorded as a claim on the asset.
    ///      Corresponds to the on-chain `TokenIssuer` identity contract for technical purposes.
    string public constant TOPIC_ASSET_ISSUER = "assetIssuer";

    // ---------------------------------------------------------------------
    // General topics
    // ---------------------------------------------------------------------

    /// @notice Topic identifier for contract identity claims
    string public constant TOPIC_CONTRACT_IDENTITY = "contractIdentity";

    // ---------------------------------------------------------------------
    // Aggregated arrays
    // ---------------------------------------------------------------------

    /// @notice Get all topic names for registry registration
    /// @return _names Array of topic names for batchRegisterTopicSchemes
    /// @dev The order here mirrors signatures() and is kept stable for backward compatibility.
    function names() internal pure returns (string[] memory _names) {
        _names = new string[](18);

        // Investor-level
        _names[0] = TOPIC_INVESTOR_KYC;
        _names[1] = TOPIC_INVESTOR_AML;
        _names[2] = TOPIC_INVESTOR_QII;
        _names[3] = TOPIC_INVESTOR_PROFESSIONAL_INVESTOR;
        _names[4] = TOPIC_INVESTOR_ACCREDITED_INVESTOR;
        _names[5] = TOPIC_INVESTOR_ACCREDITED_INVESTOR_VERIFIED;
        _names[6] = TOPIC_INVESTOR_REG_S;

        // Issuer-level
        _names[7] = TOPIC_ISSUER_PROSPECTUS_FILED;
        _names[8] = TOPIC_ISSUER_PROSPECTUS_EXEMPT;
        _names[9] = TOPIC_ISSUER_LICENSED;
        _names[10] = TOPIC_ISSUER_REPORTING_COMPLIANT;
        _names[11] = TOPIC_ISSUER_JURISDICTION;

        // Asset-level
        _names[12] = TOPIC_ASSET_COLLATERAL;
        _names[13] = TOPIC_ASSET_ISIN;
        _names[14] = TOPIC_ASSET_CLASSIFICATION;
        _names[15] = TOPIC_ASSET_BASE_PRICE;
        _names[16] = TOPIC_ASSET_ISSUER;

        // General
        _names[17] = TOPIC_CONTRACT_IDENTITY;
    }

    /// @notice Get all topic signatures for registry registration
    /// @return _signatures Array of topic signatures for batchRegisterTopicSchemes
    /// @dev Standard ABI signatures - matches order in names()
    function signatures() internal pure returns (string[] memory _signatures) {
        _signatures = new string[](18);

        // Investor-level
        _signatures[0] = "string claim"; // kyc
        _signatures[1] = "string claim"; // aml
        _signatures[2] = "string claim"; // qii
        _signatures[3] = "string claim"; // professionalInvestor
        _signatures[4] = "string claim"; // accreditedInvestor
        _signatures[5] = "string claim"; // accreditedInvestorVerified
        _signatures[6] = "string claim"; // regS

        // Issuer-level
        _signatures[7] = "string prospectusReference"; // issuerProspectusFiled
        _signatures[8] = "string exemptionReference"; // issuerProspectusExempt
        _signatures[9] = "string licenseType, string licenseNumber, string jurisdiction, uint256 validUntil"; // issuerLicensed
        _signatures[10] = "bool compliant, uint256 lastUpdated"; // issuerReportingCompliant
        _signatures[11] = "string jurisdiction"; // issuerJurisdiction

        // Asset-level
        _signatures[12] = "uint256 amount, uint256 expiryTimestamp"; // collateral
        _signatures[13] = "string isin"; // isin
        _signatures[14] = "string class, string category"; // assetClassification
        _signatures[15] = "uint256 amount, string currencyCode, uint8 decimals"; // basePrice
        _signatures[16] = "address issuerAddress"; // assetIssuer

        // General
        _signatures[17] = "address contractAddress"; // contractIdentity
    }
}

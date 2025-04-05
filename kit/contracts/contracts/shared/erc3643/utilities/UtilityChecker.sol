// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.27;

import { OwnableUpgradeable } from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import { UUPSUpgradeable } from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import { IClaimIssuer, IIdentity } from "../../onchainid/interface/IClaimIssuer.sol";
import { IERC3643IdentityRegistry } from "../ERC-3643/IERC3643IdentityRegistry.sol";
import { IERC3643TrustedIssuersRegistry } from "../ERC-3643/IERC3643TrustedIssuersRegistry.sol";
import { IModularCompliance } from "../compliance/modular/IModularCompliance.sol";
import { IModule } from "../compliance/modular/modules/IModule.sol";
import { IToken } from "../token/IToken.sol";
import { IUtilityChecker } from "./IUtilityChecker.sol";

contract UtilityChecker is IUtilityChecker, OwnableUpgradeable, UUPSUpgradeable {
    function initialize() external initializer {
        __Ownable_init(_msgSender());
    }

    /// @inheritdoc IUtilityChecker
    /// @dev This function is not gas optimized and should be called only OFF chain.
    function checkTransfer(
        address _token,
        address _from,
        address _to,
        uint256 _amount
    )
        external
        view
        override
        returns (bool _freezeStatus, bool _eligibilityStatus, bool _complianceStatus)
    {
        IToken token = IToken(_token);

        _freezeStatus = !token.paused();

        (bool frozen,) = checkFreeze(_token, _from, _to, _amount);
        _freezeStatus = _freezeStatus && !frozen;

        IERC3643IdentityRegistry ir = token.identityRegistry();
        _eligibilityStatus = ir.isVerified(_to);

        ComplianceCheckDetails[] memory details = checkTransferDetails(_token, _from, _to, _amount);
        for (uint256 i; i < details.length; i++) {
            if (!details[i].pass) {
                _complianceStatus = false;
                break;
            }
        }
        _complianceStatus = true;
    }

    /// @inheritdoc IUtilityChecker
    function checkVerifiedDetails(
        address _token,
        address _userAddress
    )
        public
        view
        override
        returns (EligibilityCheckDetails[] memory _details)
    {
        IERC3643IdentityRegistry identityRegistry = IToken(_token).identityRegistry();
        IERC3643TrustedIssuersRegistry tokenIssuersRegistry = identityRegistry.issuersRegistry();
        IIdentity identity = identityRegistry.identity(_userAddress);

        uint256 foundClaimTopic;
        uint256 scheme;
        address issuer;
        bytes memory sig;
        bytes memory data;
        uint256 topic;
        uint256[] memory requiredClaimTopics = identityRegistry.topicsRegistry().getClaimTopics();
        uint256 topicsCount = requiredClaimTopics.length;
        _details = new EligibilityCheckDetails[](topicsCount);
        for (uint256 claimTopic; claimTopic < topicsCount; claimTopic++) {
            topic = requiredClaimTopics[claimTopic];
            IClaimIssuer[] memory trustedIssuers = tokenIssuersRegistry.getTrustedIssuersForClaimTopic(topic);

            for (uint256 i; i < trustedIssuers.length; i++) {
                bytes32 claimId = keccak256(abi.encode(trustedIssuers[i], topic));
                (foundClaimTopic, scheme, issuer, sig, data,) = identity.getClaim(claimId);
                if (foundClaimTopic == topic) {
                    bool pass;
                    try IClaimIssuer(issuer).isClaimValid(identity, topic, sig, data) returns (bool validity) {
                        pass = validity;
                    } catch {
                        pass = false;
                    }

                    _details[claimTopic] =
                        EligibilityCheckDetails({ issuer: trustedIssuers[i], topic: topic, pass: pass });
                }
            }
        }
    }

    /// @inheritdoc IUtilityChecker
    function checkFreeze(
        address _token,
        address _from,
        address _to,
        uint256 _amount
    )
        public
        view
        override
        returns (bool _frozen, uint256 _availableBalance)
    {
        IToken token = IToken(_token);

        if (token.isFrozen(_from) || token.isFrozen(_to)) {
            _availableBalance = 0;
            _frozen = true;
        } else {
            _availableBalance = token.balanceOf(_from) - token.getFrozenTokens(_from);
            _frozen = _amount > _availableBalance;
        }
    }

    /// @inheritdoc IUtilityChecker
    function checkTransferDetails(
        address _token,
        address _from,
        address _to,
        uint256 _value
    )
        public
        view
        override
        returns (ComplianceCheckDetails[] memory _details)
    {
        IModularCompliance compliance = IModularCompliance(address(IToken(_token).compliance()));
        address[] memory modules = compliance.getModules();
        uint256 length = modules.length;
        _details = new ComplianceCheckDetails[](length);
        for (uint256 i; i < length; i++) {
            IModule module = IModule(modules[i]);
            _details[i] = ComplianceCheckDetails({
                moduleName: module.name(),
                pass: module.moduleCheck(_from, _to, _value, address(compliance))
            });
        }
    }

    // solhint-disable-next-line no-empty-blocks
    function _authorizeUpgrade(address /*newImplementation*/ ) internal view override onlyOwner { }
}

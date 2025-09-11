import { Bytes } from "@graphprotocol/graph-ts";
import { Burnable as BurnableTemplate } from "../../generated/templates";
import {
  TokenAssetCreated,
  TokenImplementationUpdated,
  TokenTrustedIssuersRegistryCreated,
} from "../../generated/templates/TokenFactory/TokenFactory";
import { fetchAccessControl } from "../access-control/fetch/accesscontrol";
import { fetchAccount } from "../account/fetch/account";
import { InterfaceIds } from "../erc165/utils/interfaceids";
import { fetchEvent } from "../event/fetch/event";
import { fetchIdentity } from "../identity/fetch/identity";
import { fetchTokenStatsState } from "../stats/token-stats";
import { updateTokenTypeStatsForTokenCreation } from "../stats/token-type-stats";
import { fetchBond } from "../token-assets/bond/fetch/bond";
import { fetchFund } from "../token-assets/fund/fetch/fund";
import { fetchCapped } from "../token-extensions/capped/fetch/capped";
import { fetchCollateral } from "../token-extensions/collateral/fetch/collateral";
import { fetchCustodian } from "../token-extensions/custodian/fetch/custodian";
import { fetchPausable } from "../token-extensions/pausable/fetch/pausable";
import { fetchRedeemable } from "../token-extensions/redeemable/fetch/redeemable";
import { getTokenExtensions } from "../token-extensions/utils/token-extensions-utils";
import { fetchYield } from "../token-extensions/yield/fetch/yield";
import { fetchToken } from "../token/fetch/token";
import { getTokenType } from "../token/utils/token-utils";
import { fetchTrustedIssuersRegistry } from "../trusted-issuers-registry/fetch/trusted-issuers-registry";
import { fetchTokenFactory } from "./fetch/token-factory";

/**
 * Handles the TokenAssetCreated event emitted when a new token is deployed by a factory.
 *
 * This handler performs several important operations:
 * 1. Updates the factory's hasTokens flag to true (enabling efficient filtering)
 * 2. Links the token to its factory
 * 3. Sets up token metadata and access control
 * 4. Initializes token extensions based on supported interfaces
 *
 * @param event - The TokenAssetCreated event containing token deployment details
 */
export function handleTokenAssetCreated(event: TokenAssetCreated): void {
  fetchEvent(event, "TokenAssetCreated");
  const tokenFactory = fetchTokenFactory(event.address);
  // Mark that this factory has created tokens - used for efficient UI filtering
  tokenFactory.hasTokens = true;
  tokenFactory.save();

  const token = fetchToken(event.params.tokenAddress);
  if (token.deployedInTransaction.equals(Bytes.empty())) {
    token.deployedInTransaction = event.transaction.hash;
  }
  token.tokenFactory = tokenFactory.id;
  token.type = getTokenType(tokenFactory);
  token.createdAt = event.block.timestamp;
  token.createdBy = fetchAccount(event.transaction.from).id;

  const accessControl = fetchAccessControl(event.params.accessManager);
  token.accessControl = accessControl.id;
  accessControl.token = token.id;
  accessControl.save();

  // Set the token extensions dynamically based on detected interfaces
  token.extensions = getTokenExtensions(event.params.interfaces);
  token.implementsERC3643 = tokenFactory.tokenImplementsERC3643;
  token.implementsSMART = tokenFactory.tokenImplementsSMART;

  // Initialize TokenStatsState for the new token
  fetchTokenStatsState(event.params.tokenAddress);

  if (event.params.interfaces.includes(InterfaceIds.ISMARTPausable)) {
    token.pausable = fetchPausable(event.params.tokenAddress).id;
    token.save();
  }
  if (event.params.interfaces.includes(InterfaceIds.ISMARTBurnable)) {
    BurnableTemplate.create(event.params.tokenAddress);
  }
  if (event.params.interfaces.includes(InterfaceIds.ISMARTCustodian)) {
    fetchCustodian(event.params.tokenAddress);
  }
  if (event.params.interfaces.includes(InterfaceIds.ISMARTCollateral)) {
    token.collateral = fetchCollateral(event.params.tokenAddress).id;
    token.save();
  }
  if (event.params.interfaces.includes(InterfaceIds.ISMARTCapped)) {
    token.capped = fetchCapped(event.params.tokenAddress).id;
    token.save();
  }
  if (event.params.interfaces.includes(InterfaceIds.ISMARTYield)) {
    token.yield_ = fetchYield(event.params.tokenAddress).id;
    token.save();
  }
  if (event.params.interfaces.includes(InterfaceIds.ISMARTRedeemable)) {
    token.redeemable = fetchRedeemable(event.params.tokenAddress).id;
    token.save();
  }
  if (event.params.interfaces.includes(InterfaceIds.IATKBond)) {
    token.bond = fetchBond(event.params.tokenAddress).id;
    token.save();
  }
  if (event.params.interfaces.includes(InterfaceIds.IATKFund)) {
    token.fund = fetchFund(event.params.tokenAddress).id;
    token.save();
  }

  token.save();

  const identity = fetchIdentity(event.params.tokenIdentity);
  identity.isContract = true;
  identity.save();

  const account = fetchAccount(event.params.tokenAddress);
  account.identity = identity.id;
  account.save();

  // Update token type stats for new token creation
  updateTokenTypeStatsForTokenCreation(token);
}

export function handleTokenImplementationUpdated(
  event: TokenImplementationUpdated
): void {
  fetchEvent(event, "TokenImplementationUpdated");
}

export function handleTokenTrustedIssuersRegistryCreated(
  event: TokenTrustedIssuersRegistryCreated
): void {
  fetchEvent(event, "TokenTrustedIssuersRegistryCreated");

  const trustedIssuersRegistry = fetchTrustedIssuersRegistry(
    event.params.registry
  );
  trustedIssuersRegistry.token = event.params.token;
  if (trustedIssuersRegistry.deployedInTransaction.equals(Bytes.empty())) {
    trustedIssuersRegistry.deployedInTransaction = event.transaction.hash;
  }
  trustedIssuersRegistry.save();
}

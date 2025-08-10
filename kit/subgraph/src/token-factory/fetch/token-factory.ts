import { Address } from "@graphprotocol/graph-ts";
import { TokenFactory } from "../../../generated/schema";
import { TokenFactory as TokenFactoryTemplate } from "../../../generated/templates";
import { fetchAccount } from "../../account/fetch/account";
import { setAccountContractName } from "../../account/utils/account-contract-name";

/**
 * Fetches or creates a TokenFactory entity in the subgraph.
 *
 * This function ensures that a TokenFactory entity exists for the given address.
 * If the factory doesn't exist yet, it creates a new one with default values
 * and starts indexing its events.
 *
 * @param address - The contract address of the token factory
 * @returns The TokenFactory entity (either existing or newly created)
 *
 * @remarks
 * When creating a new TokenFactory:
 * - hasTokens is initialized to false (no tokens created yet)
 * - name and typeId are set to placeholder values until updated by events
 * - A new template instance is created to start indexing factory events
 */
export function fetchTokenFactory(address: Address): TokenFactory {
  let tokenFactory = TokenFactory.load(address);

  if (!tokenFactory) {
    tokenFactory = new TokenFactory(address);
    tokenFactory.account = fetchAccount(address).id;
    tokenFactory.name = "unknown";
    tokenFactory.typeId = "unknown";
    // Initialize hasTokens to false - will be set to true when first token is created
    tokenFactory.hasTokens = false;
    tokenFactory.tokenExtensions = [];
    tokenFactory.tokenImplementsERC3643 = false;
    tokenFactory.tokenImplementsSMART = false;
    tokenFactory.save();
    TokenFactoryTemplate.create(address);
    setAccountContractName(address, "Token Factory");
  }

  return tokenFactory;
}

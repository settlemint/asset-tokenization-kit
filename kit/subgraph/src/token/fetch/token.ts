import { Address, BigDecimal, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { Identity, Token } from "../../../generated/schema";
import { Token as TokenTemplate } from "../../../generated/templates";
import { Token as TokenContract } from "../../../generated/templates/Token/Token";
import { fetchAccount } from "../../account/fetch/account";
import { initializeTokenDistributionStats } from "../../stats/token-distribution-stats";
import { setBigNumber } from "../../utils/bignumber";

export function fetchToken(address: Address): Token {
  let token = Token.load(address);

  if (!token) {
    token = new Token(address);
    token.account = fetchAccount(address).id;
    token.type = "unknown";

    const tokenContract = TokenContract.bind(address);
    token.name = tokenContract.name();
    token.symbol = tokenContract.symbol();
    token.decimals = tokenContract.decimals();
    token.createdAt = BigInt.zero();
    token.createdBy = Address.zero();
    setBigNumber(
      token,
      "totalSupply",
      tokenContract.totalSupply(),
      token.decimals
    );
    token.deployedInTransaction = Bytes.empty();
    token.extensions = [];
    token.implementsERC3643 = false;
    token.implementsSMART = false;
    token.basePrice = BigDecimal.zero();

    token.save();

    // Update the associated account with a human-readable contract name
    const account = fetchAccount(address);
    if (account.isContract) {
      account.contractName = token.name;
      account.save();
    }
    TokenTemplate.create(address);

    // Initialize distribution stats for new token
    initializeTokenDistributionStats(token);
  }

  return token;
}

export function fetchTokenByIdentity(identity: Identity): Token | null {
  if (identity.isContract !== true || !identity.account) {
    return null;
  }
  const tokenAddress = Address.fromBytes(identity.account!);
  const token = Token.load(tokenAddress); // only load because we don't want to create a new token
  if (!token) {
    return null;
  }

  return token;
}

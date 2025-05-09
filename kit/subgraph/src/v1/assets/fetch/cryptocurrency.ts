import { Address, BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { CryptoCurrency } from "../../../../generated/schema";
import { CryptoCurrency as CryptoCurrencyContract } from "../../../../generated/templates/CryptoCurrency/CryptoCurrency";
import { fetchAccount } from "../../utils/account";
import { AssetType } from "../../utils/enums";

export function fetchCryptoCurrency(address: Address): CryptoCurrency {
  let cryptoCurrency = CryptoCurrency.load(address);

  if (!cryptoCurrency) {
    let endpoint = CryptoCurrencyContract.bind(address);
    let name = endpoint.try_name();
    let symbol = endpoint.try_symbol();
    let decimals = endpoint.try_decimals();

    const account = fetchAccount(address);

    cryptoCurrency = new CryptoCurrency(address);
    cryptoCurrency.type = AssetType.cryptocurrency;
    cryptoCurrency.asAccount = account.id;
    cryptoCurrency.name = name.reverted ? "" : name.value;
    cryptoCurrency.symbol = symbol.reverted ? "" : symbol.value;
    cryptoCurrency.decimals = decimals.reverted ? 18 : decimals.value;
    cryptoCurrency.totalSupplyExact = BigInt.zero();
    cryptoCurrency.totalSupply = BigDecimal.zero();
    cryptoCurrency.admins = [];
    cryptoCurrency.supplyManagers = [];
    cryptoCurrency.userManagers = [];
    cryptoCurrency.lastActivity = BigInt.zero();
    cryptoCurrency.creator = Address.zero();
    cryptoCurrency.totalMinted = BigDecimal.zero();
    cryptoCurrency.totalMintedExact = BigInt.zero();
    cryptoCurrency.totalBurned = BigDecimal.zero();
    cryptoCurrency.totalBurnedExact = BigInt.zero();
    cryptoCurrency.totalTransferred = BigDecimal.zero();
    cryptoCurrency.totalTransferredExact = BigInt.zero();
    cryptoCurrency.totalHolders = BigInt.zero();
    cryptoCurrency.deployedOn = BigInt.zero();
    cryptoCurrency.concentration = BigDecimal.zero();

    cryptoCurrency.save();

    account.asAsset = cryptoCurrency.id;
    account.save();
  }

  return cryptoCurrency;
}

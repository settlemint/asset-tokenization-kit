import { Address } from "@graphprotocol/graph-ts";
import { DvPSwapFactory } from "../../../../generated/schema";
import { fetchAccount } from "../../utils/account";
import { FactoryType } from "../../utils/enums";
export function fetchDvPSwapFactory(address: Address): DvPSwapFactory {
  let factory = DvPSwapFactory.load(address);

  if (!factory) {
    factory = new DvPSwapFactory(address);
    const account = fetchAccount(address);
    factory.type = FactoryType.dvpswap;
    factory.asAccount = account.id;
    factory.dvpSwapContractsCount = 0;
    factory.save();
  }

  return factory;
}

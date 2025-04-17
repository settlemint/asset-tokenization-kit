import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { keccak256, toUtf8Bytes } from "ethers";
import CryptoCurrencyFactoryModule from "./crypto-currency-factory";
import EASModule from "./eas";
const CryptoCurrenciesModule = buildModule("CryptoCurrenciesModule", (m) => {
  // Get the deployer address which will be the owner
  const deployer = m.getAccount(0);

  const { cryptoCurrencyFactory } = m.useModule(CryptoCurrencyFactoryModule);
  const { easSchemaRegistry } = m.useModule(EASModule);

  const totalSupply = "21000000000000000000000000"; // 21M BTC with 18 decimals
  const createBTC = m.call(
    cryptoCurrencyFactory,
    "create",
    ["Bitcoin", "BTC", 18, totalSupply],
    {
      id: "createBTC",
      from: deployer,
    }
  );
  const readBTCAddress = m.readEventArgument(
    createBTC,
    "CryptoCurrencyCreated",
    "token",
    { id: "readBTCAddress" }
  );

  m.call(
    easSchemaRegistry,
    "register",
    ["uint256 Price,string Currency", readBTCAddress, true],
    {
      id: "registerBTCSchema",
    }
  );

  const btc = m.contractAt("CryptoCurrency", readBTCAddress, { id: "btc" });

  // Set up roles for the cryptocurrency
  const supplyManagementRole = keccak256(toUtf8Bytes("SUPPLY_MANAGEMENT_ROLE"));

  // Grant roles to the deployer
  m.call(btc, "grantRole", [supplyManagementRole, deployer], {
    id: "grantSupplyRole",
  });

  // Mint and burn some tokens
  const mintAmount = "1000000000000000000000"; // 1000 BTC with 18 decimals

  m.call(btc, "mint", [deployer, mintAmount], { id: "mintBTC" });

  return { btc };
});

export default CryptoCurrenciesModule;

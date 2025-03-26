import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { keccak256, toUtf8Bytes } from "ethers";
import DepositFactoryModule from "./deposit-factory";

const DepositsModule = buildModule("DepositsModule", (m) => {
  // Get the deployer address which will be the owner
  const deployer = m.getAccount(0);

  const { depositFactory } = m.useModule(DepositFactoryModule);

  // Set collateral liveness to 30 days (in seconds)
  const collateralLivenessSeconds = 30 * 24 * 60 * 60;

  const createTokenizedEUR = m.call(
    depositFactory,
    "create",
    ["Euro Deposits", "EUR", 2, collateralLivenessSeconds],
    {
      id: "createTokenizedEUR",
      from: deployer,
    }
  );
  const readTokenizedEURAddress = m.readEventArgument(
    createTokenizedEUR,
    "TokenizedDepositCreated",
    "token",
    { id: "readTokenizedEURAddress" }
  );
  const EURD = m.contractAt("TokenizedDeposit", readTokenizedEURAddress, {
    id: "EURD",
  });

  // Set up roles for the tokenized deposit
  const supplyManagementRole = keccak256(toUtf8Bytes("SUPPLY_MANAGEMENT_ROLE"));
  const userManagementRole = keccak256(toUtf8Bytes("USER_MANAGEMENT_ROLE"));

  // Grant roles to the deployer
  m.call(EURD, "grantRole", [supplyManagementRole, deployer], {
    id: "grantSupplyRole",
  });
  m.call(EURD, "grantRole", [userManagementRole, deployer], {
    id: "grantUserRole",
  });

  // Mint and burn some tokens
  const mintAmount = 1000000000; // 1000 EUR with 2 decimals
  const burnAmount = 200000000; // 200 EUR with 2 decimals

  // Update collateral before minting (to ensure sufficient collateral)
  const updateCollateral = m.call(EURD, "updateCollateral", [mintAmount], {
    id: "updateCollateral",
  });

  const mintTokenizedEUR = m.call(EURD, "mint", [deployer, mintAmount], {
    id: "mintTokenizedEUR",
    after: [updateCollateral],
  });
  m.call(EURD, "burn", [burnAmount], {
    id: "burnTokenizedEUR",
    after: [mintTokenizedEUR],
  });

  return { EURD };
});

export default DepositsModule;

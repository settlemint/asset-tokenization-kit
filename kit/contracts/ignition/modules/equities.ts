import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { keccak256, toUtf8Bytes } from "ethers";
import EquityFactoryModule from "./equity-factory";

const EquitiesModule = buildModule("EquitiesModule", (m) => {
  // Get the deployer address which will be the owner
  const deployer = m.getAccount(0);

  const { equityFactory } = m.useModule(EquityFactoryModule);

  const equityClass = "Common Stock";
  const equityCategory = "Technology";
  const createAPPL = m.call(
    equityFactory,
    "create",
    ["Apple Inc.", "AAPL", 0, equityClass, equityCategory],
    {
      id: "createAPPL",
      from: deployer,
    }
  );
  const readAPPLAddress = m.readEventArgument(
    createAPPL,
    "EquityCreated",
    "token",
    { id: "readAPPLAddress" }
  );
  const aapl = m.contractAt("Equity", readAPPLAddress, { id: "aapl" });

  // Set up roles for the equity
  const supplyManagementRole = keccak256(toUtf8Bytes("SUPPLY_MANAGEMENT_ROLE"));
  const userManagementRole = keccak256(toUtf8Bytes("USER_MANAGEMENT_ROLE"));

  // Grant roles to the deployer
  m.call(aapl, "grantRole", [supplyManagementRole, deployer], {
    id: "grantSupplyRole",
  });
  m.call(aapl, "grantRole", [userManagementRole, deployer], {
    id: "grantUserRole",
  });

  // Mint and burn some tokens
  const mintAmount = 1000; // 1000 shares (0 decimals)
  const burnAmount = 200; // 200 shares (0 decimals)

  const mintEquity = m.call(aapl, "mint", [deployer, mintAmount], {
    id: "mintEquity",
  });
  m.call(aapl, "burn", [burnAmount], { id: "burnEquity", after: [mintEquity] });

  return { aapl };
});

export default EquitiesModule;

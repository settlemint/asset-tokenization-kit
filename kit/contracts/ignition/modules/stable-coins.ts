import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { keccak256, toUtf8Bytes } from "ethers";
import StableCoinFactoryModule from "./stable-coin-factory";

const StableCoinsModule = buildModule("StableCoinsModule", (m) => {
  // Get the deployer address which will be the owner
  const deployer = m.getAccount(0);

  const { stableCoinFactory } = m.useModule(StableCoinFactoryModule);

  const collateralLivenessSeconds = 7 * 24 * 60 * 60; // 1 week in seconds
  const createUSDC = m.call(
    stableCoinFactory,
    "create",
    ["Euro Coin", "EUR", 6, collateralLivenessSeconds],
    {
      id: "createUSDC",
      from: deployer,
    }
  );
  const readUSDCAddress = m.readEventArgument(
    createUSDC,
    "StableCoinCreated",
    "token",
    { id: "readUSDCAddress" }
  );
  const usdc = m.contractAt("StableCoin", readUSDCAddress, { id: "usdc" });

  // Set up roles for the stablecoin
  const supplyManagementRole = keccak256(toUtf8Bytes("SUPPLY_MANAGEMENT_ROLE"));
  const userManagementRole = keccak256(toUtf8Bytes("USER_MANAGEMENT_ROLE"));

  // Grant roles to the deployer
  m.call(usdc, "grantRole", [supplyManagementRole, deployer], {
    id: "grantSupplyRole",
  });
  m.call(usdc, "grantRole", [userManagementRole, deployer], {
    id: "grantUserRole",
  });

  // Mint and burn some tokens
  const mintAmount = 1000000000; // 1000 EUR with 6 decimals
  const burnAmount = 200000000; // 200 EUR with 6 decimals

  // Add collateral before minting
  const collateralAmount = BigInt(mintAmount) * BigInt(2); // 200% collateralization ratio
  const updateCollateral = m.call(
    usdc,
    "updateCollateral",
    [collateralAmount],
    { id: "updateCollateral" }
  );

  const mintStableCoin = m.call(usdc, "mint", [deployer, mintAmount], {
    id: "mintStableCoin",
    after: [updateCollateral],
  });
  m.call(usdc, "burn", [burnAmount], {
    id: "burnStableCoin",
    after: [mintStableCoin],
  });

  return { usdc };
});

export default StableCoinsModule;

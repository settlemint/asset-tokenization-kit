import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { keccak256, toUtf8Bytes } from "ethers";
import BondFactoryModule from "./bond-factory";
import FixedYieldFactoryModule from "./fixed-yield-factory";
import StableCoinFactoryModule from "./stable-coin-factory";

const BondsModule = buildModule("BondsModule", (m) => {
  // Get the deployer address which will be the owner
  const deployer = m.getAccount(0);

  const { bondFactory } = m.useModule(BondFactoryModule);
  const { stableCoinFactory } = m.useModule(StableCoinFactoryModule);
  const { fixedYieldFactory } = m.useModule(FixedYieldFactoryModule);

  // Create StableCoin using the factory
  const collateralLivenessSeconds = 7 * 24 * 60 * 60; // 1 week in seconds
  const createStableCoin = m.call(
    stableCoinFactory,
    "create",
    ["USD Coin", "USDC", 6, "", collateralLivenessSeconds],
    {
      id: "createStableCoin",
      from: deployer,
    },
  );

  // Get the StableCoin address from the creation event
  const readStableCoinAddress = m.readEventArgument(
    createStableCoin,
    "StableCoinCreated",
    "token",
    {
      id: "readStableCoinAddress",
    },
  );
  const stableCoin = m.contractAt("StableCoin", readStableCoinAddress, {
    id: "stableCoin",
  });

  const oneYearFromNow = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60;
  const faceValue = 100_000_000; // 100 USDC (with 6 decimals)
  const maxSupply = 1000; // Maximum 1000 bonds can be minted

  // Create bond using the deployed StableCoin
  const createBondUSTB = m.call(
    bondFactory,
    "create",
    [
      "US Treasury Bond",
      "USTB",
      2,
      "US0378331005",
      maxSupply * 10 ** 2, // Cap is in bond units (2 decimals)
      oneYearFromNow,
      faceValue,
      stableCoin,
    ],
    {
      id: "createBondUSTB",
      from: deployer,
    },
  );

  const readBondUSTBAddress = m.readEventArgument(
    createBondUSTB,
    "BondCreated",
    "token",
    {
      id: "readBondUSTBAddress",
    },
  );
  const ustb = m.contractAt("Bond", readBondUSTBAddress, { id: "bondUSTB" });

  // Create fixed yield schedule for the bond
  const startDate = Math.floor(Date.now() / 1000) + 24 * 60 * 60; // Start tomorrow
  const yieldRate = 500; // 5% annual yield (in basis points)
  const yieldInterval = 30 * 24 * 60 * 60; // 30 days in seconds

  // Create the yield schedule
  const createYieldSchedule = m.call(
    fixedYieldFactory,
    "create",
    [ustb, startDate, oneYearFromNow, yieldRate, yieldInterval],
    {
      id: "createYieldSchedule",
      from: deployer,
    },
  );

  const readYieldScheduleAddress = m.readEventArgument(
    createYieldSchedule,
    "FixedYieldCreated",
    "schedule",
    {
      id: "readYieldScheduleAddress",
    },
  );
  const yieldSchedule = m.contractAt("FixedYield", readYieldScheduleAddress, {
    id: "yieldSchedule",
  });

  // Set up roles for the bond
  const supplyManagementRole = keccak256(toUtf8Bytes("SUPPLY_MANAGEMENT_ROLE"));
  const userManagementRole = keccak256(toUtf8Bytes("USER_MANAGEMENT_ROLE"));

  // Grant roles to the deployer
  m.call(ustb, "grantRole", [supplyManagementRole, deployer], {
    id: "grantSupplyRole",
  });
  m.call(ustb, "grantRole", [userManagementRole, deployer], {
    id: "grantUserRole",
  });

  // Mint and burn some tokens
  const mintAmount = 500 * 10 ** 2; // 500 bonds with 2 decimals
  const burnAmount = 100 * 10 ** 2; // 100 bonds with 2 decimals

  const mintBonds = m.call(ustb, "mint", [deployer, mintAmount], {
    id: "mintBonds",
  });
  m.call(ustb, "burn", [burnAmount], { id: "burnBonds", after: [mintBonds] });

  return { ustb, stableCoin, yieldSchedule };
});

export default BondsModule;

// SPDX-License-Identifier: MIT
// SettleMint.com
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
// Remove unused ethers utils import
// import { utils } from "ethers"; 
import DvPSwapFactoryModule from "./dvpswap-factory";

const DvPSwapModule = buildModule("DvPSwapModule", (m) => {
  // Get the deployer address which will be the owner
  const deployer = m.getAccount(0);

  const { dvpSwapFactory } = m.useModule(DvPSwapFactoryModule);

  // Create a DvPSwap instance using the factory
  const createDvPSwap = m.call(
    dvpSwapFactory,
    "create",
    ["DvPSwap Exchange"], // The factory's create function takes a name
    {
      id: "createDvPSwap",
      from: deployer,
    }
  );

  // Get the DvPSwap address from the creation event emitted by the factory
  const readDvPSwapAddress = m.readEventArgument(
    createDvPSwap,
    "DvPSwapCreated", // Correct event name from DvPSwapFactory.sol
    "token", // Correct argument name from the event
    {
      id: "readDvPSwapAddress",
    }
  );
  const dvpSwap = m.contractAt("DvPSwap", readDvPSwapAddress, { id: "dvpSwap" });

  // No additional role setup needed here.
  // DEFAULT_ADMIN_ROLE is granted by the factory during creation.
  // SUPPLY_MANAGEMENT_ROLE and USER_MANAGEMENT_ROLE are not used by DvPSwap.sol.

  return { dvpSwap };
});

export default DvPSwapModule; 
// SPDX-License-Identifier: MIT
// SettleMint.com
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { utils } from "ethers";
import DvPSwapFactoryModule from "./dvpswap-factory";

const DvPSwapModule = buildModule("DvPSwapModule", (m) => {
  // Get the deployer address which will be the owner
  const deployer = m.getAccount(0);

  // Use the DvPSwapFactory module
  const { dvpSwapFactory } = m.useModule(DvPSwapFactoryModule);

  // Use a fixed salt value instead of timestamp to ensure deployment consistency
  const salt = utils.keccak256(utils.toUtf8Bytes("dvpswap-fixed-salt"));

  // Create a DvPSwap contract using the factory
  const createDvPSwap = m.call(
    dvpSwapFactory,
    "create",
    [salt],
    {
      id: "createDvPSwap",
      from: deployer,
    }
  );

  // Get the DvPSwap address from the creation event
  const readDvPSwapAddress = m.readEventArgument(
    createDvPSwap,
    "DvPSwapContractCreated",
    "swapContract",
    {
      id: "readDvPSwapAddress",
    }
  );

  // Get the DvPSwap contract at the created address
  const dvpSwap = m.contractAt("DvPSwap", readDvPSwapAddress, {
    id: "dvpSwap",
  });

  return { dvpSwap, dvpSwapFactory };
});

export default DvPSwapModule; 
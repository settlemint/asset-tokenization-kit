import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ForwarderModule from "./forwarder";

const EASModule = buildModule("EASModule", (m) => {
  // Get the forwarder from the ForwarderModule
  const { forwarder } = m.useModule(ForwarderModule);

  // Deploy the EASSchemaRegistry first since EAS depends on it
  const schemaRegistry = m.contract("EASSchemaRegistry", [forwarder]);

  // Deploy the EAS contract with the schema registry address and forwarder
  const eas = m.contract("EAS", [schemaRegistry, forwarder]);

  return { schemaRegistry, eas };
});

export default EASModule;
import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import ForwarderModule from '../forwarder';

const XvPSettlementFactoryModule = buildModule(
  'XvPSettlementFactoryModule',
  (m) => {
    const { forwarder } = m.useModule(ForwarderModule);

    // Deploy the XvPSettlement implementation (the logic contract)
    const xvpSettlementImplementation = m.contract(
      'ATKXvPSettlementImplementation',
      [forwarder]
    );

    // Deploy the XvPSettlementFactory implementation
    const xvpSettlementFactoryImplementation = m.contract(
      'ATKXvPSettlementFactoryImplementation',
      [forwarder]
    );

    return {
      xvpSettlementImplementation,
      xvpSettlementFactoryImplementation,
    };
  }
);

export default XvPSettlementFactoryModule;

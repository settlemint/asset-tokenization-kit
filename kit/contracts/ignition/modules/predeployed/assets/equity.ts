import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import ForwarderModule from '../forwarder';

const EquityModule = buildModule('EquityModule', (m) => {
  const { forwarder } = m.useModule(ForwarderModule);

  const equityFactoryImplementation = m.contract(
    'ATKEquityFactoryImplementation',
    [forwarder]
  );
  const equityImplementation = m.contract('ATKEquityImplementation', [
    forwarder,
  ]);

  return { equityFactoryImplementation, equityImplementation };
});

export default EquityModule;

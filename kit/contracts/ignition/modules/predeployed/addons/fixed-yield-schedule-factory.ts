import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import ForwarderModule from '../forwarder';

const FixedYieldScheduleFactoryModule = buildModule(
  'FixedYieldScheduleFactoryModule',
  (m) => {
    const { forwarder } = m.useModule(ForwarderModule);

    const fixedYieldScheduleFactoryImplementation = m.contract(
      'ATKFixedYieldScheduleFactoryImplementation',
      [forwarder]
    );

    return { fixedYieldScheduleFactoryImplementation };
  }
);

export default FixedYieldScheduleFactoryModule;

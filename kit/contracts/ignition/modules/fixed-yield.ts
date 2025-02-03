import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const FixedYieldModule = buildModule('FixedYieldModule', (m) => {
  const fixedYield = m.contract('FixedYield', [
    m.getParameter('token'),
    m.getParameter('startDate'),
    m.getParameter('endDate'),
    m.getParameter('rate'),
    m.getParameter('interval'),
  ]);

  return { fixedYield };
});

export default FixedYieldModule;

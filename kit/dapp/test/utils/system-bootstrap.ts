import { DEFAULT_PINCODE } from 'test/utils/user';
import type { OrpcClient } from './orpc-client';

export async function bootstrapSystem(orpClient: OrpcClient) {
  const systems = await orpClient.system.list();
  if (systems.length > 0) {
    return systems[0]?.id;
  }
  const response = await orpClient.system.create({
    verification: {
      verificationCode: DEFAULT_PINCODE,
      verificationType: 'pincode',
    },
  });
  let finalResult: `0x${string}` | undefined;
  for await (const event of response) {
    finalResult = event.result;
  }
  if (!finalResult) {
    throw new Error('Failed to bootstrap system');
  }
  return finalResult;
}

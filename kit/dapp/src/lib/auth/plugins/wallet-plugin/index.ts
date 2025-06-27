import type { BetterAuthPlugin } from 'better-auth';
import {
  APIError,
  createAuthEndpoint,
  sessionMiddleware,
} from 'better-auth/api';
import { createPublicClient, http, toHex } from 'viem';
import { anvil } from 'viem/chains';
import z from 'zod/v4';
import { env } from '@/lib/env';
import { portalClient, portalGraphql } from '@/lib/settlemint/portal';
import {
  type EthereumAddress,
  getEthereumAddress,
} from '@/lib/zod/validators/ethereum-address';
import { revokeSession } from '../utils';

const CREATE_ACCOUNT_MUTATION = portalGraphql(`
  mutation CreateAccountMutation($keyVaultId: String!, $userId: String!) {
    createWallet(keyVaultId: $keyVaultId, walletInfo: {name: $userId}) {
      address
    }
  }
`);

export interface UserWithWalletContext {
  id: string;
  wallet?: EthereumAddress;
}

export const wallet = () => {
  return {
    id: 'wallet',
    endpoints: {
      generateWallet: createAuthEndpoint(
        '/wallet',
        {
          method: 'POST',
          body: z.object({
            messages: z
              .object({
                walletAlreadyExists: z
                  .string()
                  .describe('Message to display when the wallet already exists')
                  .optional(),
                walletCreationFailed: z
                  .string()
                  .describe('Message to display when the wallet creation fails')
                  .optional(),
              })
              .optional(),
          }),
          use: [sessionMiddleware],
          metadata: {
            openapi: {
              summary: 'Generate wallet',
              description:
                'Use this endpoint to generate a wallet for the user.',
              responses: {
                200: {
                  description: 'Successful response',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                        properties: {
                          wallet: {
                            type: 'string',
                            description: 'Wallet address',
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        async (ctx) => {
          const user = ctx.context.session.user as UserWithWalletContext;
          if (user.wallet) {
            throw new APIError('BAD_REQUEST', {
              message:
                ctx.body.messages?.walletAlreadyExists ??
                'User wallet already exists',
            });
          }

          const result = await portalClient.request(CREATE_ACCOUNT_MUTATION, {
            userId: user.id,
            keyVaultId: env.SETTLEMINT_HD_PRIVATE_KEY,
          });
          if (!result.createWallet?.address) {
            throw new APIError('BAD_REQUEST', {
              message:
                ctx.body.messages?.walletCreationFailed ??
                'Failed to create wallet',
            });
          }

          const walletAddress = getEthereumAddress(result.createWallet.address);

          // When developping locally we need to fund the wallet
          const isLocal = env.SETTLEMINT_INSTANCE === 'local';
          if (isLocal) {
            try {
              const balanceInHex = toHex(1000000000000000000n);
              const client = createPublicClient({
                chain: anvil,
                transport: http('http://localhost:8545'),
              });

              await client.request({
                method: 'anvil_setBalance',
                params: [walletAddress, balanceInHex],
                // biome-ignore lint/suspicious/noExplicitAny: required to set balance
              } as any);
            } catch (_error) {
              // Ignore errors when setting balance in development
            }
          }

          await revokeSession(ctx, {
            wallet: walletAddress,
          });
          return ctx.json({
            wallet: walletAddress,
          });
        }
      ),
    },
    rateLimit: [
      {
        pathMatcher(path) {
          return path.startsWith('/wallet/');
        },
        window: 10,
        max: 3,
      },
    ],
  } satisfies BetterAuthPlugin;
};

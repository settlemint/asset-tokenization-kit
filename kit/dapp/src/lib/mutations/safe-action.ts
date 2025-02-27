import { auth } from '@/lib/auth/auth';
import type { User } from 'better-auth';
import { createSafeActionClient } from 'next-safe-action';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import type { Address } from 'viem';

export const action = createSafeActionClient({
  throwValidationErrors: true,
  defaultValidationErrorsShape: 'flattened',
  handleServerError: (error: Error) => {
    return `An unexpected error occurred: ${error.message}`;
  },
})
  .use(async ({ next, clientInput, metadata }) => {
    const result = await next({ ctx: undefined });
    console.log('Input ->', redactSensitiveFields(clientInput));
    console.log('Metadata ->', redactSensitiveFields(metadata));
    console.log('Result ->', redactSensitiveFields(result.data));
    return result;
  })
  .use(async ({ next }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error('Unauthorized');
    }

    return next({
      ctx: {
        user: session.user as Omit<User, 'wallet'> & { wallet: Address },
      },
    });
  })
  .use(async ({ next }) => {
    const result = await next({ ctx: undefined });
    revalidatePath('/[locale]/admin', 'layout');
    return result;
  });

/**
 * Redacts sensitive fields in an object by replacing their values with asterisks
 */
function redactSensitiveFields(obj: unknown): unknown {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(redactSensitiveFields);
  }

  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => {
      if (key === 'pincode') {
        return [key, '******'];
      }
      if (typeof value === 'object' && value !== null) {
        return [key, redactSensitiveFields(value)];
      }
      return [key, value];
    })
  );
}

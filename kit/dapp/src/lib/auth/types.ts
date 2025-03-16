import type { Address } from 'viem';
import type { auth } from './auth';

export type Session = typeof auth.$Infer.Session;
export type User = Omit<Session['user'], 'wallet'> & { wallet: Address };

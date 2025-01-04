import type { auth } from './auth';

export type Session = typeof auth.$Infer.Session;
export type User = Session['user'];

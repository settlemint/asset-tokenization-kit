'use client';

import { BadgePlus, Ban, Check, ShieldCheck, User2 } from 'lucide-react';
import type { ComponentType } from 'react';

export const icons: Record<string, ComponentType<{ className?: string }>> = {
  admin: ShieldCheck,
  issuer: BadgePlus,
  user: User2,
  banned: Ban,
  active: Check,
};

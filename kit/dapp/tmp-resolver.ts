import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
export const resolver = zodResolver(z.string());

import { authClient } from '@/lib/auth/client';
import { NavFooterAdmin } from './nav-footer-admin';
import { NavFooterPortfolioAdmin } from './nav-footer-portfolio-admin';
import { NavFooterPortfolioUser } from './nav-footer-portfolio-user';

export function NavFooter({ mode }: { mode: 'admin' | 'portfolio' }) {
  const session = authClient.useSession();

  if (!session) {
    return null;
  }

  if (mode === 'portfolio') {
    if (['admin', 'issuer'].includes(session.data?.user.role ?? 'user')) {
      return <NavFooterPortfolioAdmin />;
    }
    return <NavFooterPortfolioUser />;
  }

  return <NavFooterAdmin />;
}
